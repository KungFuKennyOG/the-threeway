'use strict';
// ============================== the level registry ==========================
// The bar and the street are built in; every level after them registers itself here from its own file
// (src/superblock/build.js, src/kras/podezd.js, ...), so a new level touches only its own files plus one <script> tag.
//
// defineLevel(name, {
//   menu:   '5 · The Palace of Sport',            // "Start at" entry (also ?level=<name>)
//   cfg:    () => CFG.palace,                      // its stage config: encounters (trigger or at, arena, lock, spawn, respawn), props...
//   origin: () => [0, 0],                          // encounter positions are relative to this (default: world)
//   frame:  ACT1_WEST,                             // or: the level is authored in its own coordinates and laid into the
//                                                  // world by this frame (levelFrame below); its encounters stay local
//   build() {},                                    // called once from buildStreet(): geometry, lamps (ST.lamps), walk rects
//   rooms() {},                                    // called once at boot, before 'outside': addRoom / roomMeshes / addPortal
//   outside: () => [meshes],                       // meshes drawn as part of the outside
//   rects: [[x0, x1, z0, z1]],                     // ground it occupies: the far city and the skylines keep off it
//   start(fromPrevious) {},                        // begin the level (from the menu, or walking in from the previous one)
//   update(dt) {},                                 // every frame while it's on (rides, set pieces)
//   after: 'podezd', enter: () => bool,            // walk on from that level (once it's won) when this turns true
//   finish: (z) => bool, wonSign: 'sign',          // optional: the level is won when its fights are done and this is true
//   signs: { key: ['TEXT', '#colour'] },           // big signs it shows (showSign(key))
//   hud: { walk: 'text', won: 'text', short: 'Palace' },
// })
const LEVELS = {};
function defineLevel(name, def) { LEVELS[name] = Object.assign({ name }, def); return LEVELS[name]; }
const levelList = () => Object.values(LEVELS);
const levelRects = () => levelList().flatMap(D => typeof D.rects === 'function' ? D.rects() : (D.rects || []));
const onLevelGround = (x, z, m = 0) => levelRects().some(([a, b, c, d]) => x > a - m && x < b + m && z > c - m && z < d + m);
// Goons a level names that aren't built yet stand in as one that is, so levels can be written with their real cast
// before the goons land (the stand-in goes away the moment CFG.enemies has the real one).
const ENEMY_FALLBACK = { warden: 'laborer', sambo: 'conscript', lifter: 'wrestler', gymnast: 'conscript', guard: 'laborer', bandsman: 'cook',
  specialist: 'wrestler', clerk: 'conscript', bodyguard: 'wrestler', orlova: 'ivan', chairman: 'ivan', inspector: 'conscript', militia: 'wrestler' };
const enemyType = (t) => (CFG.enemies[t] ? t : ENEMY_FALLBACK[t] || 'conscript');
// ============================== level frames ================================
// A level can be authored in its own (local) coordinates and laid into the world by a frame: turned about y by a multiple
// of 90° (so walk rects, blockers and world boxes stay axis-aligned) and moved. world = R(yaw) · local + t, where
// R(yaw) is three.js's rotation.y: x' = cos·x + sin·z, z' = -sin·x + cos·z.
//   const F = levelFrame(-Math.PI / 2, [lx, lz], [wx, wz]);   // local (lx, lz) lands on world (wx, wz)
//   F.begin(); ...build: scene.add / addWalk / BLOCKERS / WORLD_BOXES / ST.lamps / ST.beacons, all local...; F.end();
// Between begin() and end() the level's meshes go into the frame's group (light is baked in local space, consistently),
// and end() turns everything the build pushed (walk rects, blockers, boxes, lamps, beacons) into world space. A walk rect
// with `world: true` is left as it is. At runtime the level reads F.head() (your head in its coordinates); the stage flow
// (src/street/fight.js) runs its encounters (triggers, `at` boxes, arenas, spawns, respawns) in local coordinates.
function levelFrame(yaw, local, world) {
  const c = Math.round(Math.cos(yaw)), s = Math.round(Math.sin(yaw));
  if (Math.abs(c) + Math.abs(s) !== 1) throw new Error('levelFrame: yaw must be a multiple of 90 degrees');
  const tx = world[0] - (c * local[0] + s * local[1]), tz = world[1] - (-s * local[0] + c * local[1]);
  const F = { yaw, c, s, tx, tz, group: null, mark: null, _h: null };
  F.toWorld = (x, z) => [c * x + s * z + tx, -s * x + c * z + tz];
  F.toLocal = (x, z) => { const dx = x - tx, dz = z - tz; return [c * dx - s * dz, s * dx + c * dz]; };
  F.world = (v, out) => { const [x, z] = F.toWorld(v.x, v.z); return (out || new THREE.Vector3()).set(x, v.y, z); };
  F.local = (v, out) => { const [x, z] = F.toLocal(v.x, v.z); return (out || new THREE.Vector3()).set(x, v.y, z); };
  F.pt = ([x, y, z]) => { const [a, b] = F.toWorld(x, z); return [a, y, b]; };          // [x, y, z] arrays
  F.rect = ([x0, x1, z0, z1]) => {                                                     // [x0, x1, z0, z1] (still sorted)
    const [a, b] = F.toWorld(x0, z0), [p, q] = F.toWorld(x1, z1);
    return [Math.min(a, p), Math.max(a, p), Math.min(b, q), Math.max(b, q)];
  };
  F.head = () => F.local(player.head, F._h || (F._h = new THREE.Vector3()));            // (a shared vector: read it, don't keep it)
  F.localLamps = (list) => list.map(L => { const [x, z] = F.toLocal(L[0][0], L[0][2]); return [[x, L[0][1], z], L[1], L[2]]; });   // copies, for baking
  F.begin = () => {
    if (!F.group) { F.group = new THREE.Group(); F.group.rotation.y = yaw; F.group.position.set(tx, 0, tz); F.group.updateMatrixWorld(true); scene.add(F.group); }
    F.mark = { walk: WALK.length, blockers: BLOCKERS.length, boxes: WORLD_BOXES.length, lamps: ST.lamps.length, beacons: ST.beacons.length, search: ST.searchlights.length };
    scene.add = (...o) => F.group.add(...o);   // the level's meshes ride in the group
  };
  const rectIn = (o, k) => { [o[k[0]], o[k[1]], o[k[2]], o[k[3]]] = F.rect([o[k[0]], o[k[1]], o[k[2]], o[k[3]]]); };
  F.end = () => {
    delete scene.add; const M = F.mark; F.mark = null;
    for (const w of WALK.slice(M.walk)) {
      if (w.world) continue;
      if (w.ramp) throw new Error('levelFrame: ramps are not framed (and there are no stairs: VR)');
      rectIn(w, ['x0', 'x1', 'z0', 'z1']); rectIn(w, ['wx0', 'wx1', 'wz0', 'wz1']); rectIn(w, ['fx0', 'fx1', 'fz0', 'fz1']);
    }
    for (const b of BLOCKERS.slice(M.blockers)) rectIn(b, ['x0', 'x1', 'z0', 'z1']);
    for (const B of WORLD_BOXES.slice(M.boxes)) { const [x0, x1, z0, z1] = F.rect([B[0], B[3], B[2], B[5]]); B[0] = x0; B[3] = x1; B[2] = z0; B[5] = z1; }
    const seen = new Set();   // (a lamp listed twice is moved once)
    for (const L of ST.lamps.slice(M.lamps)) { if (seen.has(L[0])) continue; seen.add(L[0]); const [x, z] = F.toWorld(L[0][0], L[0][2]); L[0][0] = x; L[0][2] = z; }
    for (const b of ST.beacons.slice(M.beacons).concat(ST.searchlights.slice(M.search))) { const [x, z] = F.toWorld(b[0], b[2]); b[0] = x; b[2] = z; }
  };
  return F;
}
// Act 1 west of the railway: the Palace of Sport (past the level crossing), Parade Square and the Tower of Labor are
// authored on one axis running +z (local x -40); this frame lays that axis down running west (-x), deep into the
// Krasnovian sector, from the west side of Station Square north of the tracks: local +z -> world -x, local +x -> world +z
// (so the local west side is the world's south, toward the railway). The boulevard's start (local -40, 151.4) is world
// (-56, 198); the Tower of Labor's centre (local -40, 330) is (-234.6, 198), dead ahead down the boulevard.
const ACT1_WEST = levelFrame(-Math.PI / 2, [-40, 151.4], [-56, 198]);
