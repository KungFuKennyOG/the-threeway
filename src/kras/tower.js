'use strict';
// ============================== Act 1, level 7: the Tower of Labor =========================
// Krasnovia's seat of power and the end of Act 1, built like Moscow State University: a central tower of five stepped
// tiers (146 m) between four lower wing towers that step up to it (two inner towers to 104 m, two outer ones to 60 m,
// low wings joining them), pinnacles on every setback, floodlit worker statues on the setbacks, giant red banners down
// the faces. On the central tower, the Chairman's stage (146-188 m) with his tribune hanging off its south face, then the
// crown: a blazing gold lantern, a gilt spire, and the gilded cog at 226 m (static, self-lit, haloed: the brightest thing
// in the sky), its tip at 252 m. Six searchlights sweep the sky from the podium and the wing towers, seen from the whole act.
// It stands at the far west end of the route, dead ahead down the boulevard, ~300 m from Tripoint Square.
//
// In through the big south doors from Parade Square (no cut): the marble lobby (militia, inspectors); lift 1 up to the
// Ministry's typing pool (clerks under the Chairman's eight-metre portrait); lift 2 up to the archive, a canyon of shelving
// (Inspector Orlova at her interrogation desk under one bulb); then the glass lift, up the OUTSIDE of the south face, 138 m
// with Parade Square and the city falling away below; out onto the Chairman's tribune right under the cog, in the wind.
// Beat the Chairman out there and he kneels and signs the permit to reopen The Threeway: 1 of 3, and Act 1 is complete.
// No stairs (VR): lifts do all the climbing, enclosed (the glass car too) and eased. Authored with +z running in from the
// square, laid into the world by the ACT1_WEST frame (src/levels.js): the south doors face east, back down the boulevard.
//
// Meshes: the shell (one baked mesh, outside, fogged like the skylines but less), the glow (one small additive mesh,
// outside: the searchlight beams, the halos round the cog and the crown, the Chairman's lit doors seen from below; its
// beams are moved in its own onBeforeRender, so they sweep whenever and wherever they're drawn, on any level, and cost
// nothing when they aren't), the floors (two baked meshes, each floor its own room), the three lift cars, the permit.
CFG.tower = {
  start: [-40, 314.2],                     // "start here": just inside the south doors, facing in
  spawnGap: 1.0, clearedPause: 1.6, healBetween: 25,
  liftSpeed: 4.0, doorTime: 1.0, restRise: 2.4,   // m/s (4 m/s = 56 mm a frame at 72 Hz: the comfort limit is ~60)
  signPause: 3.2,                          // s from 'SIGNED' to 'ACT 1 COMPLETE'
  shellFog: 0.3,                           // the shell's fog cap: less than the skylines' (0.5), so the act's landmark reads from across the city
  glowFog: 0.12,                           // the glow's (beams, halos): it reads furthest of all
  // the searchlights: [x, y, z (local), azimuth (deg, 0 = local -z, out over the square; 90 = local +x), swing (deg), elevation, its swing, period (s), phase]
  search: [[-61.5, 31.6, 313.6, -28, 34, 64, 12, 23, 0.0], [-18.5, 31.6, 313.6, 28, 34, 64, 12, 23, 0.5],
           [-80, 71.6, 325, -70, 55, 58, 16, 31, 0.25], [0, 71.6, 325, 70, 55, 58, 16, 31, 0.75],
           [-104, 37.6, 324.8, -120, 45, 52, 14, 37, 0.6], [24, 37.6, 324.8, 120, 45, 52, 14, 37, 0.1]],
  beamLen: 230, beamW: [1.4, 22],          // m: each beam's length, its width at the lamp and at the far end
  // spawns [type, x, z, floor y]; respawns [x, z, floor y, facing]. One floor per fight (goon AI isn't floor-aware);
  // `lock`: the lift (and the doors) shut while it's on. `enrageAt` per encounter: Orlova loses it at half health.
  encounters: [
    { name: 'lobby', at: [-52, -28, 313.4, 333.4, -1, 1.5], respawn: [-40, 314.4, 0, Math.PI], sign: 'twLobby', lock: ['twDoor', 'twLift1'],
      spawn: [['militia', -51.2, 319.6, 0], ['inspector', -28.8, 319.6, 0], ['inspector', -44, 332.6, 0], ['militia', -36, 332.6, 0]] },
    { name: 'offices', at: [-62, -18, 313, 333.0, 11, 13.5], respawn: [-31, 332.4, 12, 0], sign: 'twOffices', lock: ['twLift1', 'twLift2'],
      spawn: [['clerk', -45, 318.5, 12], ['clerk', -35, 321.5, 12], ['clerk', -45, 325, 12], ['bodyguard', -40, 315.6, 12]] },
    { name: 'archive', at: [-56, -24, 316.6, 333.0, 39, 41.5], respawn: [-47, 332.4, 40, 0], sign: 'orlova', boss: true, enrageAt: 0.5, lock: ['twLift2', 'twLift3'],
      spawn: [['bodyguard', -35.5, 322, 40], ['orlova', -43, 328.6, 40]] },
    { name: 'chairman', at: [-50, -30, 316.0, 334.6, 177, 179.5], respawn: [-40, 317.2, 178, Math.PI], sign: 'chairman', boss: true, lock: ['twLift3'],
      spawn: [['chairman', -40, 326.6, 178]] },   // out of his office's doors onto the tribune
  ],
  get enrageAt() { const E = this.encounters[level.encounter]; return (E && E.enrageAt) || 0; },   // read by the stage flow (src/street/fight.js)
  props: [['bin', -50.8, 313.2, 0], ['bin', -29.2, 313.2, 0],
          ['stool', -47.6, 320.2, 12], ['stool', -32.4, 323.8, 12], ['stool', -47.4, 327.6, 12], ['bin', -33, 316.6, 12], ['bottle', -32.6, 330.8, 12],
          ['crate', -44.4, 331.2, 40], ['crate', -44.6, 332.0, 40], ['crate', -35.4, 331.4, 40], ['bottle', -36.6, 325.4, 40],
          ['bottle', -45.0, 329.6, 179.05], ['bottle', -45.0, 330.2, 179.05]],
  light: { inAmbient: [0.11, 0.095, 0.1], officeAmbient: [0.1, 0.1, 0.09], archiveAmbient: [0.06, 0.07, 0.07], topAmbient: [0.08, 0.075, 0.1] },
};
const TWR = {
  foot: [-64, -16, 312, 348],                                          // the central tower's base tier (the podium)
  tiers: [[-64, -16, 312, 348, 0, 30], [-59, -21, 316, 344, 30, 54], [-54, -26, 320, 340, 54, 74], [-52, -28, 323, 339, 74, 116], [-48, -32, 325, 337, 116, 146]],
  // the east wings (the west ones mirror them about x = -40): the inner tower and the outer tower, each [cx, cz, stages
  // [[w, y0, y1], ...], spire top]; the low wings joining them [x0, x1, z0, z1, h]
  wingTowers: [[0, 330, [[16, 0, 56], [12, 56, 70], [8, 70, 80]], 104], [24, 330, [[12, 0, 36], [9, 36, 44]], 60]],
  wingLinks: [[-16, -8, 318, 342, 22], [8, 18, 322, 338, 18]],
  door: [-44, -36, 6.2],                                               // the south doors in the south face (z 312): x0, x1, height
  rect: [-116, 36, 309, 352],                                          // its ground: the far city and the skylines keep off it
  wallZ: 333.8,                                                        // the inner floors' north wall: lifts 1 and 2 open on it
  lobby:   { r: [-52, -28, 312, 333.8], y: 0, h: 10 },
  office:  { r: [-62, -18, 313, 333.8], y: 12, h: 6 },                 // the typing pool, the whole width of the podium
  archive: { r: [-56, -24, 316.3, 333.8], y: 40, h: 9, walk: [0.6, 0.6, 0] },   // walk: insets [w, e, s] where shelves line the walls
  top:     { r: [-45.6, -34.4, 325.3, 334.7], y: 178, h: 5.4 },       // the Chairman's office, in the stage
  stage: [-46, -34, 325, 335, 146, 188],                               // the Chairman's stage on the central tower's roof
  tribune: [-50, -30, 315.6, 325],                                     // his tribune, hanging off the stage's south face (floor: top.y)
  odoor: [-43, -37, 3.8],                                              // the doors from his office onto the tribune: x0, x1, height
  ddesk: [-46.6, 319.2],                                               // the signing table on the tribune
  desks: [-59.5, -56.5, -53.5, -50.5].flatMap(x => [x, -80 - x]),      // the typing pool's desk columns (x), both sides of the aisle
  deskRows: [315.2, 317.6, 320.0, 322.4, 324.8, 327.2],
  shelves: [[-56, -55.4], [-53.05, -52.15], [-49.75, -48.85], [-31.15, -30.25], [-27.85, -26.95], [-24.6, -24]],   // the archive's canyon walls [x0, x1]
  spire: 252, cogY: 226, cogD: 28,
  shell: null, glow: null, meshes: {}, tris: {}, lamps: {}, permit: null, beams: null,
  signed: false, signT: 0, act1: false, gustT: 0,
};
// three lifts: 1 and 2 inside, opening south onto the floors' north wall; 3 is the glass lift up the outside of the south
// face, from the archive's south door to the tribune, opening north (its doors face the tower)
const TLIFTS = [
  { name: '1', car: [-32.4, -29.6, 333.4, 336.2], stops: [0, 12], needs: [0], lock: 'twLift1', rooms: ['twLobby', 'twOffice'], arrive: 'twMinistry' },
  { name: '2', car: [-48.4, -45.6, 333.4, 336.2], stops: [12, 40], needs: [1], lock: 'twLift2', rooms: ['twOffice', 'twArchive'], arrive: 'twArchive' },
  { name: '3', car: [-41.4, -38.6, 312.8, 315.6], stops: [40, 178], needs: [2], lock: 'twLift3', rooms: [], arrive: 'twTop', glass: true },
];
for (const L of TLIFTS) Object.assign(L, { y: L.stops[0], stop: 0, phase: 'open', t: 0, doors: 1, rect: null, group: null, leaves: [] });
const SIGNED = new Set();   // the leaders who've signed the permit (one per sector: three in all)
function twLight(list, x, y, z, col, r, k) { const L = lightFromHex([x, y, z], col, r, k); list.push(L); return L; }
function twSolid(x0, z0, x1, z1, y0, y1) { WORLD_BOXES.push([x0, y0, z0, x1, y1, z1]); BLOCKERS.push({ x0, x1, z0, z1, y0, y1 }); }
const TWP = { u: 99, v: 99, cell: 99 };                                   // small props: one quad a face (no texture repeats, no light cells)
const twO = (o) => Object.assign({}, TWP, o);
// walls of a room [x0, x1, z0, z1] at height y, facing in; gaps: { s|n|w|e: [[a, b, top], ...] } (doorways from y up to y + top)
function twWalls(acc, key, [x0, x1, z0, z1], y, h, gaps = {}, um = 2, vm = h, skip = '', cell = 99) {
  const run = (side, a0, a1, mk) => {
    if (skip.includes(side)) return;
    const g = (gaps[side] || []).slice().sort((p, q) => p[0] - q[0]); let a = a0;
    for (const [ga, gb, top] of g) { if (ga > a) mk(a, ga, y, y + h); mk(ga, gb, y + top, y + h); a = gb; }
    if (a1 > a) mk(a, a1, y, y + h);
  };
  const o = (ya) => ({ v0: (ya - y) / vm, cell });   // doorway heads keep the wall's pattern lined up
  run('s', x0, x1, (a, b, ya, yb) => wall(acc, key, a, z0, b, z0, ya, yb, um, vm, o(ya)));
  run('n', x0, x1, (a, b, ya, yb) => wall(acc, key, b, z1, a, z1, ya, yb, um, vm, o(ya)));
  run('w', z0, z1, (a, b, ya, yb) => wall(acc, key, x0, b, x0, a, ya, yb, um, vm, o(ya)));
  run('e', z0, z1, (a, b, ya, yb) => wall(acc, key, x1, a, x1, b, ya, yb, um, vm, o(ya)));
}
// (floors and ceilings are cut only where their texture repeats: cutting at light cells too would double them)
function twCeil(acc, key, [x0, x1, z0, z1], y, tile) { aq(acc, key, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], [x0 / tile, z1 / tile, x1 / tile, z0 / tile], [0, -1, 0], 99); }
const twFloor = (acc, key, [x0, x1, z0, z1], y, tile) => ground(acc, key, x0, z0, x1, z1, y, tile, { cell: 99 });
function twLamp(acc, list, x, y, z, col, r, k, key = 'litWarm', s = 0.3) { sbox(acc, key, x, y - 0.14, z, s, s, 0.14, 0, twO({})); return twLight(list, x, y - 0.4, z, col, r, k); }
// a lamp hung on a long cord: a green bankers' shade (or a bare bulb), its glow baked in
function twHung(acc, list, x, yc, y, z, col, r, k, bare = false) {
  sbox(acc, 'iron', x, y + 0.2, z, 0.03, 0.03, yc - y - 0.2, 0, twO({ top: false }));
  if (bare) sbox(acc, 'twBulb', x, y, z, 0.16, 0.16, 0.2, 0, twO({}));
  else { frustum(acc, 'greenShade', x, y, z, 0.62, 0.62, 0.22, 0.22, 0.26, 0, twO({ top: 'greenShade', tu: 99 })); sbox(acc, 'twBulb', x, y - 0.02, z, 0.24, 0.24, 0.04, 0, twO({})); }
  return twLight(list, x, y - 0.3, z, col, r, k);
}
// the lift doorways on a floor: gaps in its north wall, a LIFT sign over each
function twLiftGaps(F) { return TLIFTS.filter(L => !L.glass && L.stops.includes(F.y)).map(L => [L.car[0], L.car[1], 2.4]); }
function twLiftSigns(acc, F) { for (const L of TLIFTS) if (!L.glass && L.stops.includes(F.y)) plate(acc, 'liftSign', (L.car[0] + L.car[1]) / 2, F.y + 2.72, TWR.wallZ, 0.9, 0.28, Math.PI, 0.02); }
function twShaft(acc, L) {   // the bare shaft above the bottom stop, seen through the doorway once the car has gone up
  const [a, b, c, d] = L.car, y0 = L.stops[0], y1 = L.stops[1] + 2.4;
  const o = { cell: 99 };
  wall(acc, 'concrete', b + 0.02, d + 0.02, a - 0.02, d + 0.02, y0, y1, 4, 4, o);
  wall(acc, 'concrete', a - 0.02, d + 0.02, a - 0.02, TWR.wallZ, y0, y1, 4, 4, o); wall(acc, 'concrete', b + 0.02, TWR.wallZ, b + 0.02, d + 0.02, y0, y1, 4, 4, o);
  wall(acc, 'concrete', a, TWR.wallZ + 0.02, b, TWR.wallZ + 0.02, y0 + 2.4, L.stops[1], 4, 4, o);   // the slab between the floors, from inside the shaft
}
// A monumental worker (invented, heroic, chunky), h metres to the top of the head, one arm thrown up holding the sign of
// what he or she makes: 'cog' (a steelworker), 'sheaf' (a harvester in a kerchief), 'flag' (a standard-bearer), 'hammer'.
// phi turns it (Math.PI faces local -z, out over the square). On a stone plinth with a gilt band unless plinth is 0.
function twGiant(acc, key, cx, y, cz, h, phi, pose, plinth = 0.16) {
  const o = twO({ top: key, tu: 99 }), P = (lx, lz) => LP(cx, cz, phi, lx * h, lz * h);
  if (plinth) {
    sbox(acc, 'twTrim', cx, y, cz, 0.5 * h, 0.34 * h, plinth * h, phi, twO({ top: 'twTrim', tu: 99 }));
    sbox(acc, 'twGold', cx, y + plinth * h - 0.024 * h, cz, 0.52 * h, 0.36 * h, 0.024 * h, phi, twO({ top: false }));
    y += plinth * h;
  }
  const box = (lx, ly, lz, w, d, hh, k = key) => { const [x, z] = P(lx, lz); sbox(acc, k, x, y + ly * h, z, w * h, d * h, hh * h, phi, Object.assign({}, o, { top: k })); };
  const tap = (lx, ly, lz, w0, d0, w1, d1, hh, k = key) => { const [x, z] = P(lx, lz); frustum(acc, k, x, y + ly * h, z, w0 * h, d0 * h, w1 * h, d1 * h, hh * h, phi, Object.assign({}, o, { top: k })); };
  if (pose === 'sheaf') { tap(0, 0, 0.02, 0.4, 0.3, 0.26, 0.19, 0.5); box(-0.08, 0, 0.1, 0.12, 0.14, 0.06); }   // a skirt in the wind, a boot forward
  else { box(-0.1, 0, 0.08, 0.15, 0.18, 0.5); box(0.1, 0, -0.08, 0.15, 0.18, 0.5); }                       // legs, striding
  tap(0, 0.47, 0, 0.3, 0.2, 0.46, 0.23, 0.34);                                                              // the torso: chest out, shoulders wide
  box(0, 0.8, 0, 0.11, 0.11, 0.04); box(0, 0.83, 0.01, 0.15, 0.16, 0.14);                                    // neck, head
  if (pose === 'sheaf') box(0, 0.92, -0.01, 0.17, 0.18, 0.06, 'banner'); else box(0, 0.96, 0, 0.17, 0.17, 0.035);   // kerchief / cap
  box(0.28, 0.74, 0, 0.11, 0.11, 0.48);                                                                     // the arm thrown up
  box(-0.29, 0.44, 0.06, 0.11, 0.11, 0.37);                                                                 // the other, down and forward
  const [hx, hz] = P(0.28, 0), top = y + 1.22 * h;
  if (pose === 'cog') for (const ph of [0, Math.PI / 2]) plate(acc, 'twCog', hx, top + 0.15 * h, hz, 0.36 * h, 0.36 * h, phi + ph, 0, [0, 0, 1, 1], true);
  else if (pose === 'sheaf') tap(0.28, 1.2, 0, 0.07, 0.07, 0.24, 0.16, 0.28, 'gilt');
  else if (pose === 'hammer') { box(0.28, 1.2, 0, 0.04, 0.04, 0.3, 'iron'); box(0.28, 1.46, 0, 0.22, 0.09, 0.09, 'iron'); }
  else { box(0.28, 0.45, 0, 0.035, 0.035, 1.25, 'gilt'); const [fx, fz] = P(0.28 + 0.33, 0); plate(acc, 'flag_kras', fx, y + 1.5 * h, fz, 0.62 * h, 0.4 * h, phi, 0, [0, 0, 1, 1], true); }
}
// a pinnacle on a setback: a stone obelisk with a gilt band and a gilt point (MSU has them on every corner)
function twPin(acc, x, y, z, s, h) {
  sbox(acc, 'twTrim', x, y, z, s, s, h * 0.5, 0, twO({ top: false }));
  frustum(acc, 'twGold', x, y + h * 0.5, z, s * 1.1, s * 1.1, 0.05, 0.05, h * 0.5, 0, twO({ top: false }));
}
// a south face (facing -z) from x a to b at z, y0 to y1, cut round holes [x0, x1, ya, yb], its pattern continuous
function twFaceS(acc, key, a, b, z, y0, y1, holes, um, vm, cell) {
  const piece = (xa, xb, ya, yb) => { if (xb - xa > 1e-3 && yb - ya > 1e-3) wall(acc, key, xb, z, xa, z, ya, yb, um, vm, { cell, u0: (b - xb) / um, v0: (y1 - yb) / vm }); };
  let x = a;
  for (const [h0, h1, ha, hb] of holes.slice().sort((p, q) => p[0] - q[0])) { piece(x, h0, y0, y1); piece(h0, h1, y0, ha); piece(h0, h1, hb, y1); x = h1; }
  piece(x, b, y0, y1);
}

// ---- the lobby: double height, marble, six columns, a red carpet, the giant worker mosaic, the bronze hero
function towerLobby(acc, lamps) {
  const F = TWR.lobby, [x0, x1, z0, z1] = F.r, H = F.h, [d0, d1, dh] = TWR.door;
  twWalls(acc, 'marbleWall', F.r, 0, H, { s: [[d0, d1, dh]], n: twLiftGaps(F) }, 3, H, '', 5);
  twFloor(acc, 'marble', F.r, 0.004, 2); twCeil(acc, 'coffer', F.r, H, 2.4);
  for (const [a, b, c, d] of [[x0, x1, z0, z0 + 0.5], [x0, x1, z1 - 0.5, z1], [x0, x0 + 0.5, z0, z1], [x1 - 0.5, x1, z0, z1]]) sbox(acc, 'twGold', (a + b) / 2, H - 0.45, (c + d) / 2, b - a, d - c, 0.45, 0, twO({ top: false }));   // a gilt cornice
  aq(acc, 'carpetRed', [-41.3, 0.014, 328.2], [-38.7, 0.014, 328.2], [-38.7, 0.014, z0], [-41.3, 0.014, z0], [0, 0, 1, (328.2 - z0) / 2.6], [0, 1, 0], 2.6);
  // the doors stand open, folded back against the wall inside; the lintel over them
  for (const [x, s] of [[d0 - 2, 1], [d1 + 2, -1]]) plate(acc, 'bronzeDoor', x, dh / 2, z0, 4, dh, 0, 0.06, s > 0 ? [0, 0, 1, 1] : [1, 0, 0, 1]);
  aq(acc, 'marbleWall', [d0, dh, z0 - 0.6], [d1, dh, z0 - 0.6], [d1, dh, z0], [d0, dh, z0], [0, 0, 2, 0.1], [0, -1, 0], 4);
  // six marble columns, full height, gilt capitals and bases (holes in the walk area: TW_HOLES.lobby)
  for (const x of [-46.5, -33.5]) for (const z of [317, 322.5, 328]) {
    sbox(acc, 'marbleWall', x, 0, z, 1.2, 1.2, H, 0, { u: 1.2, v: H, top: false, cell: 99 }); sbox(acc, 'twGold', x, H - 1.0, z, 1.6, 1.6, 0.55, 0, twO({ top: false }));
    sbox(acc, 'marbleWall', x, 0, z, 1.45, 1.45, 0.5, 0, { u: 1.4, v: H, top: 'marble', tu: 2 });
  }
  // the mosaic across the north wall, and the hero in front of it: a bronze steelworker throwing up a gold cog
  plate(acc, 'mosaicLabor', -40, 5.6, z1, 14.4, 7.2, Math.PI, 0.03);
  sbox(acc, 'twGold', -40, 9.3, z1 - 0.1, 15, 0.2, 0.25, 0, twO({ top: false })); sbox(acc, 'twGold', -40, 1.85, z1 - 0.1, 15, 0.2, 0.15, 0, twO({ top: false }));
  sbox(acc, 'marbleWall', -40, 0, 330, 3.2, 3.2, 2.2, 0, { u: 3.2, v: 4, top: 'marble', tu: 2 });
  sbox(acc, 'twGold', -40, 1.7, 328.38, 2, 0.04, 0.24, 0, twO({}));
  twGiant(acc, 'bronze', -40, 2.2, 330, 4.8, Math.PI, 'cog', 0);
  // flags on poles either side of the hero, banners on the side walls, the doors the militia come through
  for (const x of [-44.6, -35.4]) { cyl(acc, 'gilt', x, 0, 331.6, 0.06, 0.05, 8.2, 4, twO({})); plate(acc, 'flag_kras', x + (x < -40 ? -1.4 : 1.4), 7.1, 331.6, 2.7, 1.8, 0, 0, [0, 0, 1, 1], true); }
  for (const [x, ph] of [[x0, Math.PI / 2], [x1, -Math.PI / 2]]) { for (const z of [319.6, 325.2]) plate(acc, 'twBannerTall', x, 5.7, z, 2.0, 7.4, ph, 0.05); plate(acc, 'oakDoor', x, 1.5, 322.5, 2, 3, ph, 0.03); }
  // light: three chandeliers, the mosaic floodlit from below, the hero spotlit, sconces, the night at the door
  for (const z of [316.5, 323]) {
    const yc = H - 2.2;
    sbox(acc, 'gilt', -40, yc - 0.1, z, 1.3, 1.3, 0.14, 0, twO({})); sbox(acc, 'litWarm', -40, yc, z, 1.0, 1.0, 0.4, 0, twO({})); sbox(acc, 'twGold', -40, yc + 0.4, z, 0.5, 0.5, 0.3, 0, twO({}));
    cyl(acc, 'iron', -40, yc + 0.7, z, 0.03, 0.03, H - yc - 0.7, 4, twO({})); twLight(lamps, -40, yc - 0.4, z, '#ffd8a0', 14, 1.5);
  }
  twLight(lamps, -40, 0.8, 326.6, '#ffc890', 9, 1.4);                      // the hero, from below
  for (const x of [-45, -35]) twLight(lamps, x, 1.0, 332.8, '#ffc070', 7.5, 1.4);   // the mosaic
  twLight(lamps, -40, 9.4, 327.5, '#ffe0a0', 7, 1.1);                      // a spot on the cog
  for (const x of [x0 + 0.4, x1 - 0.4]) twLight(lamps, x, 6, 322.5, '#ffb070', 7, 0.9);
  twLight(lamps, -40, 3, z0 + 1, '#9ab8ff', 6, 0.5);
  for (const x of [-49, -31]) { sbox(acc, 'litWarm', x, 3.2, z0 + 0.06, 0.4, 0.12, 0.5, 0, twO({})); twLight(lamps, x, 3.0, z0 + 0.6, '#ffd8a0', 6, 1.0); }   // sconces
  twLiftSigns(acc, F); twShaft(acc, TLIFTS[0]);
}
// ---- the Ministry's typing pool: ranks of desks under the Chairman's eight-metre portrait, the plan board, brass
// pneumatic tubes overhead, a green lamp on every desk; the clear aisle down the middle is where the fight is
function twDesk(acc, lamps, x, z, y) {   // a typist's desk facing south (the portrait), her chair behind it
  sbox(acc, 'darkwood', x, y, z, 1.3, 0.68, 0.72, 0, twO({ top: 'deskTop', tu: 1.3 }));
  sbox(acc, 'typewriter', x - 0.15, y + 0.72, z + 0.02, 0.42, 0.3, 0.15, 0, twO({ top: 'typewriter', tu: 0.42 }));
  plate(acc, 'ceilTile', x + 0.4, y + 0.725, z, 0.28, 0.36, 0, 0, [0, 0, 1, 1]);
  frustum(acc, 'greenShade', x + 0.45, y + 1.02, z - 0.15, 0.34, 0.2, 0.14, 0.1, 0.12, 0, twO({ top: 'greenShade', tu: 99 }));
  sbox(acc, 'darkwood', x - 0.1, y, z + 0.62, 0.44, 0.42, 0.46, 0, twO({}));
  twLight(lamps, x + 0.45, y + 0.95, z - 0.15, '#ffe0a0', 2.2, 0.55);
}
function towerOffices(acc, lamps, live) {
  const F = TWR.office, [x0, x1, z0, z1] = F.r, y = F.y, H = F.h;
  twWalls(acc, 'officeWall', F.r, y, H, { n: twLiftGaps(F) }, 2, H);
  twFloor(acc, 'parquet', F.r, y + 0.004, 3.2); twCeil(acc, 'ceilTile', F.r, y + H, 2.4);
  for (const z of TWR.deskRows) for (const x of TWR.desks) twDesk(acc, lamps, x, z, y);   // (holes in the walk area: TW_HOLES.office)
  // the portrait wall: the Chairman, 8 m wide, flags, the ministers either side, the slogan over them
  plate(acc, 'portraitGiant', -40, y + 3.2, z0, 9.6, 5.6, 0, 0.04);
  for (const [a, b] of [[-45.2, -44.8], [-35.2, -34.8]]) sbox(acc, 'twGold', (a + b) / 2, y, z0 + 0.25, 0.5, 0.5, H, 0, twO({}));
  for (const x of [-46.6, -33.4]) plate(acc, 'flag_kras', x, y + 3.6, z0, 1.9, 1.3, 0, 0.06);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) plate(acc, 'portraits', -40 + s * (8.6 + k * 3.2), y + 2.4, z0, 1.4, 1.75, 0, 0.03, [k / 4, 0, (k + 1) / 4, 1]);
    plate(acc, 'slogan', -40 + s * 13.4, y + 4.6, z0, 6.4, 0.84, 0, 0.03);
  }
  // the north wall: the plan board over the pneumatic post's exchange, between the two lifts
  plate(acc, 'planBoard', -40, y + 4.3, z1, 7.2, 2.4, Math.PI, 0.04);
  plate(acc, 'tubeExchange', -40, y + 1.6, z1, 6.4, 3.2, Math.PI, 0.04);
  // the tubes: one along the ceiling over each column of desks, a trunk along the north wall into the exchange
  for (const x of TWR.desks) { sbox(acc, 'gilt', x + 0.45, y + H - 0.35, (z0 + z1) / 2, 0.12, z1 - z0 - 0.8, 0.12, 0, twO({})); sbox(acc, 'gilt', x + 0.45, y + 1.25, TWR.deskRows[0] - 0.15, 0.1, 0.1, H - 1.6, 0, twO({})); }
  for (const s of [-1, 1]) sbox(acc, 'gilt', -40 + s * 11, y + H - 0.35, z1 - 0.4, 21.6, 0.14, 0.14, 0, twO({}));
  for (const x of [-42.6, -40, -37.4]) sbox(acc, 'gilt', x, y + 3.2, z1 - 0.4, 0.14, 0.14, H - 3.5, 0, twO({}));
  // light: pendant lamps down the aisles (the green desk lamps are baked in too)
  for (const x of [-55, -40, -25]) for (const z of [316.5, 321.5, 326.5]) { const L = twLamp(acc, lamps, x, y + H, z, '#ffe2b0', 9, x === -40 ? 1.25 : 1.0, 'litWarm', 0.5); if (x === -40) live.push(L); }
  for (const x of [-47, -33]) live.push(twLamp(acc, lamps, x, y + H, 331.2, '#ffe2b0', 7, 1.0, 'litWarm', 0.4));
  twLight(lamps, -40, y + 0.6, 315.5, '#ffc890', 7, 1.1);                   // the portrait, lit from below
  twLiftSigns(acc, F); twShaft(acc, TLIFTS[1]);
}
// ---- the Ministry archive: a canyon of floor-to-ceiling shelving under green lamps, the card-index wall, and Inspector
// Orlova's interrogation desk in the middle under one bare bulb. The glass lift waits behind the south door.
function towerArchive(acc, lamps, live) {
  const F = TWR.archive, [x0, x1, z0, z1] = F.r, y = F.y, H = F.h, L3 = TLIFTS[2], [g0, g1] = L3.car;
  twWalls(acc, 'archiveWall', F.r, y, H, { n: twLiftGaps(F), s: [[g0, g1, 2.4]] }, 2, H);
  twFloor(acc, 'lino', F.r, y + 0.004, 2.4); twCeil(acc, 'concrete', F.r, y + H, 4);
  // the canyon walls: steel shelving 7.2 m high, running away north (holes in the walk area: TW_HOLES.archive)
  for (const [a, b] of TWR.shelves) {
    const wallSide = a <= x0 + 0.01 || b >= x1 - 0.01, za = wallSide ? z0 + 0.4 : 318.3, zb = wallSide ? z1 - 0.2 : 331.5;
    sbox(acc, 'archiveTall', (a + b) / 2, y, (za + zb) / 2, b - a, zb - za, 7.2, 0, { u: 2, v: 3.6, top: 'iron', tu: 1, cell: 3.6, faceKey: { f: 'iron', b: 'iron' } });
  }
  for (const [x, z] of [[-51.9, 323], [-28.1, 327]]) {   // rolling ladders on the shelves' rails
    for (const s of [-0.25, 0.25]) sbox(acc, 'iron', x, y, z + s, 0.05, 0.05, 6.6, 0, twO({}));
    for (let k = 0.5; k < 6.4; k += 0.8) sbox(acc, 'iron', x, y + k, z, 0.04, 0.5, 0.04, 0, twO({}));
  }
  sbox(acc, 'iron', -52.08, y + 6.7, 324.9, 0.06, 13.2, 0.06, 0, twO({})); sbox(acc, 'iron', -27.92, y + 6.7, 324.9, 0.06, 13.2, 0.06, 0, twO({}));
  // the card-index wall: the north wall between the lift and the east canyon, floor to 6 m, a brass rail along it
  sbox(acc, 'cardWall', -38.5, y, z1 - 0.4, 11.8, 0.8, 6, 0, { u: 1.6, v: 1.6, top: 'darkwood', tu: 1, cell: 3.2, faceKey: { f: 'darkwood', l: 'darkwood', r: 'darkwood' } });
  sbox(acc, 'gilt', -38.5, y + 2.2, z1 - 0.84, 11.8, 0.06, 0.06, 0, twO({}));
  // Orlova's interrogation desk: files, her telephone, a typewriter for the confession, the chair for whoever's sat in it
  sbox(acc, 'darkwood', -40, y, 327.6, 2.2, 1.1, 0.76, 0, twO({ top: 'deskTop', tu: 2.2 }));
  sbox(acc, 'phone', -39.1, y + 0.76, 327.7, 0.28, 0.22, 0.12, 0, twO({ top: 'phone', tu: 0.28 }));
  sbox(acc, 'typewriter', -40.5, y + 0.76, 327.5, 0.44, 0.32, 0.16, 0, twO({ top: 'typewriter', tu: 0.44 }));
  for (const [dx, h] of [[0.15, 0.2], [0.55, 0.12]]) sbox(acc, 'archiveShelf', -40 + dx, y + 0.76, 327.4, 0.36, 0.28, h, 0, twO({ top: 'ceilTile', tu: 99 }));
  sbox(acc, 'darkwood', -40, y, 328.6, 0.6, 0.55, 0.5, 0, twO({})); sbox(acc, 'darkwood', -40, y + 0.5, 328.85, 0.6, 0.08, 0.7, 0, twO({}));   // her chair
  sbox(acc, 'darkwood', -40, y, 325.9, 0.46, 0.46, 0.46, 0, twO({})); sbox(acc, 'darkwood', -40, y + 0.46, 325.7, 0.46, 0.06, 0.5, 0, twO({}));   // the other chair
  live.push(twHung(acc, lamps, -40, y + H, y + 2.4, 327.2, '#ffe2b0', 7, 2.0, true));   // the one bulb
  // the glass lift's door: a gilt frame, and over it a lit sign
  for (const x of [g0 - 0.15, g1 + 0.15]) sbox(acc, 'twGold', x, y, z0 + 0.06, 0.3, 0.12, 2.7, 0, twO({}));
  sbox(acc, 'twGold', (g0 + g1) / 2, y + 2.4, z0 + 0.06, g1 - g0 + 0.6, 0.12, 0.3, 0, twO({}));
  plate(acc, 'liftSign', (g0 + g1) / 2, y + 3.05, z0, 0.9, 0.28, 0, 0.02);
  for (const s of [-1, 1]) plate(acc, 'portraits', -40 + s * 4.2, y + 3.4, z0, 1.4, 1.75, 0, 0.03, [s < 0 ? 0.75 : 0.5, 0, s < 0 ? 1 : 0.75, 1]);
  plate(acc, 'flag_kras', -40, y + 5.2, z0, 2.4, 1.6, 0, 0.04);
  // light: green lamps hung down the canyons, the bulb over her desk (above), the night at the glass door
  for (const x of [-54.2, -50.95, -29.05, -25.8]) for (const z of [320.2, 325.2, 330.2]) twHung(acc, lamps, x, y + H, y + 3.4, z, '#d8ffc0', 4.6, 1.1);
  for (const z of [320.5, 326]) live.push(twHung(acc, lamps, -45.5, y + H, y + 3.9, z, '#d8ffc0', 6, 0.9), twHung(acc, lamps, -34.5, y + H, y + 3.9, z, '#d8ffc0', 6, 0.9));
  live.push(twLight(lamps, -40, y + 1.6, z0 + 0.8, '#7a9ad8', 6.5, 0.9));
  twLight(lamps, -38.5, y + 0.6, z1 - 1.6, '#ffc070', 6, 0.7);            // the card wall, from below
  twLiftSigns(acc, F); twShaft(acc, TLIFTS[1]);
}
// ---- the Chairman's office in the stage: oak, the desk, his portrait, the decanters; the glazed doors onto the tribune
function towerTop(acc, lamps, live) {
  const F = TWR.top, [x0, x1, z0, z1] = F.r, y = F.y, H = F.h, [o0, o1, oh] = TWR.odoor, z = TWR.stage[2];
  twWalls(acc, 'oakPanel', F.r, y, H, { s: [[o0, o1, oh]] }, 2, H);
  for (const x of [o0, o1]) wall(acc, 'darkwood', x, x === o0 ? z0 : z, x, x === o0 ? z : z0, y, y + oh, 1, 1);   // the reveals through the stage's wall
  aq(acc, 'darkwood', [o0, y + oh, z], [o1, y + oh, z], [o1, y + oh, z0], [o0, y + oh, z0], [0, 0, 1, 1], [0, -1, 0], 4);
  for (const [x, u] of [[o0 - 0.85, [0, 0, 1, 1]], [o1 + 0.85, [1, 0, 0, 1]]]) plate(acc, 'bronzeDoor', x, y + oh / 2, z0, 1.6, oh, 0, 0.05, u);   // the doors, folded back open
  twFloor(acc, 'parquet', [x0, x1, z0 - 0.3, z1], y + 0.004, 1.6); twCeil(acc, 'ceilTile', F.r, y + H, 1.6);
  aq(acc, 'rugRed', [-44, y + 0.012, 326.4], [-36, y + 0.012, 326.4], [-36, y + 0.012, 333.2], [-44, y + 0.012, 333.2], [0, 0, 1, 1], [0, 1, 0], 2);
  // the desk (he sits north of it, facing the doors and the city), his chair, a lamp, the telephone, his nameplate
  sbox(acc, 'darkwood', -40, y + 0.74, 331.2, 3.4, 1.3, 0.08, 0, twO({ top: 'deskTop', tu: 3.4 }));
  sbox(acc, 'darkwood', -40, y, 330.6, 3.2, 0.08, 0.74, 0, twO({})); for (const s of [-1, 1]) sbox(acc, 'darkwood', -40 + s * 1.35, y, 331.2, 0.6, 1.2, 0.74, 0, twO({}));
  sbox(acc, 'darkwood', -40, y, 332.5, 0.8, 0.7, 0.48, 0, twO({ top: 'rugRed', tu: 1 })); sbox(acc, 'darkwood', -40, y + 0.48, 332.85, 0.8, 0.12, 1.2, 0, twO({}));
  sbox(acc, 'litWarm', -41.2, y + 0.82, 331.4, 0.3, 0.3, 0.32, 0, twO({})); sbox(acc, 'phone', -38.7, y + 0.82, 331.4, 0.28, 0.22, 0.12, 0, twO({ top: 'phone', tu: 0.28 }));
  plate(acc, 'gilt', -40, y + 0.9, 330.54, 0.5, 0.12, Math.PI, 0.01);
  // his portrait and the cog behind the desk, flags, the decanter cabinet (west), a bookcase (east)
  plate(acc, 'portraitChair', -40, y + 3.0, z1, 2.0, 2.6, Math.PI, 0.03);
  for (const x of [-43.4, -36.6]) plate(acc, 'cog', x, y + 3.2, z1, 1.6, 1.6, Math.PI, 0.03);
  for (const x of [-44.6, -35.4]) { cyl(acc, 'gilt', x, y, 333.6, 0.05, 0.04, 3.4, 4, twO({})); plate(acc, 'flag_kras', x, y + 2.7, 333.6, 1.3, 0.9, Math.PI / 2, 0.66, [0, 0, 1, 1], true); }
  sbox(acc, 'darkwood', x0 + 0.3, y, 329.9, 0.6, 2, 1.0, 0, twO({})); twSolid(x0, 328.9, x0 + 0.6, 330.9, y, y + 1.0);
  sbox(acc, 'archiveShelf', x1 - 0.2, y, 330, 0.4, 3, 2.6, 0, { u: 2, v: 2.6, top: 'darkwood', tu: 1, faceKey: { f: 'darkwood', b: 'darkwood', r: 'darkwood' } });
  // light: a chandelier, the desk lamp, the city's glow at the doors
  sbox(acc, 'gilt', -40, y + H - 1.0, 329.4, 0.9, 0.9, 0.1, 0, twO({})); sbox(acc, 'litWarm', -40, y + H - 0.9, 329.4, 0.7, 0.7, 0.3, 0, twO({})); cyl(acc, 'iron', -40, y + H - 0.6, 329.4, 0.03, 0.03, 0.6, 4, twO({}));
  live.push(twLight(lamps, -40, y + H - 1.2, 329.4, '#ffd8a0', 9, 1.35)); twLight(lamps, -41.2, y + 1.4, 331.4, '#ffe0a0', 4.5, 1.1);
  twLight(lamps, -40, y + 2.0, z0 + 0.3, '#ff9a5c', 6, 0.5); twLight(lamps, -40, y + 4.5, 333.9, '#ffd8a0', 5, 0.8);
}
// ---- the shell: the central tower's five tiers, the four wing towers and their links, pinnacles, statues, banners,
// the doors, the glass lift's gilt rails, the stage and the tribune, the crown, the cog and the spire
function towerShell(acc, lamps, live) {
  const T = TWR.tiers, [d0, d1, dh] = TWR.door, cx = -40, cz = 330, L3 = TLIFTS[2], [g0, g1, gc, gd] = L3.car;
  const face = (top, cell = 8) => ({ u: 8, v: 8, top, tu: 8, cell, skip: 'b' });
  const tierHoles = [[[d0, d1, 0, dh]], [[g0, g1, L3.stops[0], L3.stops[0] + 2.4]], [], [], []];
  for (let i = 0; i < T.length; i++) {
    const [a, b, c, d, y0, y1] = T[i], w = b - a, dd = d - c;
    sbox(acc, 'towerFace', cx, y0, (c + d) / 2, w, dd, y1 - y0, 0, face(i === T.length - 1 ? 'roofDark' : 'granite'));
    twFaceS(acc, 'towerFace', a, b, c, y0, y1, tierHoles[i], 8, 8, 8);
    const bh = i >= 3 ? 1.8 : 1.0;   // a gilt band crowns each tier (the upper ones broad, to read across the city at night)
    sbox(acc, 'decoGold', cx, y1 - bh, (c + d) / 2, w + 0.5, dd + 0.5, bh, 0, { u: 8, v: bh, top: false, cell: 99 });
    const ps = 1.3 + i * 0.15, ph = 9 + i * 1.5, m = ps / 2 + 0.3;
    for (const [x, z] of [[a + m, c + m], [b - m, c + m], [a + m, d - m], [b - m, d - m]]) twPin(acc, x, y1, z, ps, ph);
  }
  // the wing towers and the low wings joining them, east and their mirror west
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : -80 - x);
    for (const [x0, x1, z0, z1, h] of TWR.wingLinks) {
      const a = Math.min(X(x0), X(x1)), b = Math.max(X(x0), X(x1));
      sbox(acc, 'towerFace', (a + b) / 2, 0, (z0 + z1) / 2, b - a, z1 - z0, h, 0, { u: 8, v: 8, top: 'roofDark', tu: 99, cell: 8 });
      sbox(acc, 'decoGold', (a + b) / 2, h - 0.8, (z0 + z1) / 2, b - a + 0.4, z1 - z0 + 0.4, 0.8, 0, { u: 8, v: 0.8, top: false, cell: 99 });
    }
    for (const [wx, wz, stages, tip] of TWR.wingTowers) {
      const x = X(wx);
      for (let k = 0; k < stages.length; k++) {
        const [w, y0, y1] = stages[k];
        sbox(acc, 'towerFace', x, y0, wz, w, w, y1 - y0, 0, { u: 8, v: 8, top: 'roofDark', tu: 99, cell: 8 });
        sbox(acc, 'decoGold', x, y1 - 1.0, wz, w + 0.4, w + 0.4, 1.0, 0, { u: 8, v: 1, top: false, cell: 99 });
        const ps = 1.1, m = ps / 2 + 0.25, h = 7 - k;
        for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) twPin(acc, x + px * (w / 2 - m), y1, wz + pz * (w / 2 - m), ps, h);
      }
      const top = stages[stages.length - 1][2], r = stages[stages.length - 1][0] * 0.32;   // a small lantern and a gilt spire
      cyl(acc, 'twLantern', x, top, wz, r, r * 0.9, 5, 8, { u: 2 * Math.PI * r / 8, v: 5, cell: 99 });
      cyl(acc, 'twGold', x, top + 5, wz, r * 1.05, 0.12, tip - top - 5, 6, { u: 4, v: 99, cell: 99 });
      twLight(lamps, x, top - 2, wz - 9, '#ffd890', 16, 1.2);
    }
  }
  // the doors: a bronze frame, the name over them, pilasters
  for (const x of [d0 - 0.5, d1 + 0.5]) { sbox(acc, 'marbleWall', x, 0, 311.7, 1.0, 0.6, dh + 1.6, 0, { u: 1, v: 8, top: 'gilt', tu: 1 }); twSolid(x - 0.5, 311.4, x + 0.5, 312, 0, dh + 1.6); }
  sbox(acc, 'gilt', cx, dh, 311.75, d1 - d0 + 0.2, 0.5, 0.3, 0, twO({}));
  plate(acc, 'towerSign', cx, dh + 0.95, 311.4, 9.6, 1.3, Math.PI, 0.02);
  // banners down the faces: either side of the doors, two down the great middle tier, one on each inner wing tower
  for (const x of [-55, -25]) plate(acc, 'twBannerTall', x, 15.5, 312, 5, 20, Math.PI, 0.12);
  for (const x of [-47.5, -32.5]) plate(acc, 'twBannerTall', x, 94, 323, 6.4, 36, Math.PI, 0.12);
  for (const x of [-80, 0]) plate(acc, 'twBannerTall', x, 33, 322, 5.6, 34, Math.PI, 0.12);
  for (const x of [-104, 24]) plate(acc, 'twBannerTall', x, 21, 324, 4.4, 22, Math.PI, 0.12);
  plate(acc, 'twCog', cx, 64, 320, 13, 13, Math.PI, 0.15);                          // the emblem, over the glass lift's rails
  // the heroes: two on the podium's roof either side of the axis, two on the low wings' roofs beside it
  twGiant(acc, 'twStatue', -54, 30, 314.1, 10, Math.PI, 'cog'); twGiant(acc, 'twStatue', -26, 30, 314.1, 10, Math.PI, 'sheaf');
  twGiant(acc, 'twStatue', -68, 22, 320.6, 9, Math.PI, 'flag'); twGiant(acc, 'twStatue', -12, 22, 320.6, 9, Math.PI, 'hammer');
  // the glass lift's way up: two gilt rails on the axis from the podium's roof to above the tribune, braced back to the faces,
  // a lamp every few metres, its housing on the roof and its canopy at the top
  const yTop = TWR.top.y + 8, rz = (gc + gd) / 2;
  for (const x of [g0 - 0.2, g1 + 0.2]) {
    sbox(acc, 'twGold', x, 30, rz, 0.26, 0.26, yTop - 30, 0, twO({ top: false }));
    for (let y = 33; y < yTop; y += 5) plate(acc, 'litWarm', x + (x < cx ? -0.14 : 0.14), y, rz, 0.16, 0.3, x < cx ? -Math.PI / 2 : Math.PI / 2, 0);
  }
  const faceZ = (y) => { for (let i = T.length - 1; i >= 0; i--) if (y >= T[i][4]) return i === T.length - 1 && y >= TWR.stage[4] ? TWR.stage[2] : T[i][2]; return T[0][2]; };
  for (let y = 36; y < yTop; y += 12) { if (y > TWR.top.y - 2 && y < TWR.top.y + 2) continue; const fz = faceZ(y); sbox(acc, 'iron', cx, y, (rz + fz) / 2, g1 - g0 + 0.7, fz - rz, 0.22, 0, twO({})); }
  sbox(acc, 'iron', cx, 30, rz, g1 - g0 + 1.2, gd - gc + 1.2, 2.4, 0, twO({ top: 'roofDark' }));                  // the housing at the bottom
  frustum(acc, 'twGold', cx, yTop, rz, g1 - g0 + 1.4, gd - gc + 1.2, 0.6, 0.6, 1.6, 0, twO({}));                  // the canopy at the top
  // the stage: the Chairman's floor, the doors onto the tribune; the tribune itself hangs off its south face on corbels
  const [sa, sb, sc, sd, sy0, sy1] = TWR.stage, TY = TWR.top.y, [o0, o1, oh] = TWR.odoor, [ta, tb, tc, td] = TWR.tribune;
  sbox(acc, 'towerFace', cx, sy0, (sc + sd) / 2, sb - sa, sd - sc, sy1 - sy0, 0, face('roofDark'));
  twFaceS(acc, 'towerFace', sa, sb, sc, sy0, sy1, [[o0, o1, TY, TY + oh]], 8, 8, 8);
  sbox(acc, 'twGold', cx, sy1 - 1.8, (sc + sd) / 2, sb - sa + 0.6, sd - sc + 0.6, 1.8, 0, twO({ top: false }));
  sbox(acc, 'twGold', cx, TY + oh, sc - 0.2, o1 - o0 + 1.2, 0.4, 0.4, 0, twO({}));                                // the lintel over his doors
  for (const x of [o0 - 0.7, o1 + 0.7]) plate(acc, 'twBannerTall', x + (x < cx ? -0.6 : 0.6), TY + 4.4, sc, 1.6, 6.4, Math.PI, 0.06);
  sbox(acc, 'twTrim', (ta + tb) / 2, TY - 1.0, (tc + td) / 2, tb - ta, td - tc, 1.0, 0, twO({ top: false }));        // the slab
  sbox(acc, 'twGold', (ta + tb) / 2, TY - 0.35, (tc + td) / 2, tb - ta + 0.2, td - tc + 0.1, 0.3, 0, twO({ top: false }));
  aq(acc, 'granite', [ta, TY + 0.003, tc], [tb, TY + 0.003, tc], [tb, TY + 0.003, td], [ta, TY + 0.003, td], [0, 0, (tb - ta) / 4, (td - tc) / 4], [0, 1, 0], 4);
  aq(acc, 'carpetRed', [-41.3, TY + 0.012, td], [-38.7, TY + 0.012, td], [-38.7, TY + 0.012, tc], [-41.3, TY + 0.012, tc], [0, 0, 1, (td - tc) / 2.6], [0, 1, 0], 9);
  for (const x of [-48.4, -44.2, -35.8, -31.6]) for (const [z0, z1, h] of [[sc - 2, sc, 9], [sc - 5, sc - 2, 5], [tc + 0.6, sc - 5, 2.2]]) sbox(acc, 'twTrim', x, TY - 1 - h, (z0 + z1) / 2, 1.3, z1 - z0, h, 0, twO({ top: false }));   // the corbels
  // the balustrade (no falling): along the front (a gate where the glass lift docks) and down both sides
  const bal = (x0, z0, x1, z1) => sbox(acc, 'twBalustrade', (x0 + x1) / 2, TY, (z0 + z1) / 2, Math.max(0.3, x1 - x0), Math.max(0.3, z1 - z0), 1.1, 0, { u: 2, v: 1.1, top: 'twTrim', tu: 99, cell: 99 });
  bal(ta, tc, g0 - 0.3, tc + 0.3); bal(g1 + 0.3, tc, tb, tc + 0.3); bal(ta, tc, ta + 0.3, td); bal(tb - 0.3, tc, tb, td);
  for (const x of [g0 - 0.45, g1 + 0.45]) sbox(acc, 'twTrim', x, TY, tc + 0.15, 0.4, 0.4, 1.4, 0, twO({ top: 'twGold' }));
  // flags at the corners, four lamp standards, the signing table set out for the ceremony
  for (const x of [ta + 1.2, tb - 1.2]) { cyl(acc, 'gilt', x, TY, tc + 1.2, 0.08, 0.06, 7.5, 4, twO({})); plate(acc, 'flag_kras', x + (x < cx ? 1.5 : -1.5), TY + 6.6, tc + 1.2, 3.0, 2.0, 0, 0, [0, 0, 1, 1], true); }
  for (const [x, z] of [[ta + 0.7, td - 0.8], [tb - 0.7, td - 0.8], [ta + 0.7, tc + 4.6], [tb - 0.7, tc + 4.6]]) {
    sbox(acc, 'iron', x, TY, z, 0.14, 0.14, 2.6, 0, twO({})); sbox(acc, 'litWarm', x, TY + 2.6, z, 0.42, 0.42, 0.42, 0, twO({})); sbox(acc, 'twGold', x, TY + 3.02, z, 0.5, 0.5, 0.1, 0, twO({}));
    live.push(twLight(lamps, x, TY + 2.4, z, '#ffd8a0', 8, 1.3));
  }
  const [kx, kz] = TWR.ddesk;
  sbox(acc, 'darkwood', kx, TY + 0.72, kz, 1.6, 0.8, 0.06, 0, twO({ top: 'rugRed', tu: 99 })); for (const s of [-1, 1]) sbox(acc, 'darkwood', kx + s * 0.7, TY, kz, 0.1, 0.7, 0.72, 0, twO({}));
  sbox(acc, 'gilt', kx + 0.5, TY + 0.78, kz - 0.1, 0.14, 0.14, 0.12, 0, twO({}));                                   // the ink stand
  // above the stage: the cornice's pinnacles, the lantern blazing gold, the gilt spire, the cog, the mast
  for (const [x, z] of [[sa + 0.7, sc + 0.7], [sb - 0.7, sc + 0.7], [sa + 0.7, sd - 0.7], [sb - 0.7, sd - 0.7]]) twPin(acc, x, sy1, z, 1.3, 12);
  cyl(acc, 'twLantern', cx, sy1, cz, 4.7, 4.4, 9, 8, { u: 2 * Math.PI * 4.7 / 8, v: 9, cell: 99 });
  cyl(acc, 'twGold', cx, sy1 + 9, cz, 5.0, 4.8, 0.9, 8, { u: 4, v: 99, cell: 99 });
  cyl(acc, 'twGold', cx, sy1 + 9.9, cz, 4.2, 0.9, 216 - sy1 - 9.9, 8, { u: 4, v: 99, cell: 99 });
  for (const ph of [0, Math.PI / 2]) plate(acc, 'twCog', cx, TWR.cogY, cz, TWR.cogD, TWR.cogD, ph, 0, [0, 0, 1, 1], true);
  cyl(acc, 'twGold', cx, 216, cz, 0.9, 0.08, TWR.spire - 216, 6, { u: 4, v: 99, cell: 99 });
  ST.beacons.push([cx, TWR.spire + 1.5, cz]);   // the Krasnovian beacon blinks on top
  // the searchlights' lamps (their beams are the glow mesh's)
  for (const [x, y, z, az] of CFG.tower.search) {
    sbox(acc, 'iron', x, y - 1.6, z, 1.6, 1.6, 1.0, 0, twO({}));
    const [lx, lz] = LP(x, z, (180 - az) * DEG, 0, 0.75); sbox(acc, 'flood', lx, y - 0.6, lz, 1.4, 0.2, 1.2, (180 - az) * DEG, twO({ top: 'iron' }));
  }
  // the apron: granite in front (the strip in front sits a hair low, under Parade Square's own paving) and round the base
  const [r0, r1, rz0, rz1] = TWR.rect, [f0, f1, fz0] = TWR.foot;
  ground(acc, 'granite', r0, rz0, r1, fz0, -0.008, 8, { cell: 99 });
  for (const [a, b, c, d] of [[r0, f0, fz0, 324], [f1, r1, fz0, 324]]) ground(acc, 'granite', a, c, b, d, 0.002, 8, { cell: 99 });
  ground(acc, 'marble', d0, 310.6, d1, fz0, -0.004, 2, { cell: 99 });   // the threshold
  // floodlights: posts at the corners; the tiers washed in warm light from below each setback, the crown in gold
  for (const x of [-62.5, -17.5]) { sbox(acc, 'iron', x, 0, 310.8, 0.5, 0.5, 0.8, 0, twO({})); sbox(acc, 'flood', x, 0.8, 310.8, 0.8, 0.4, 0.5, 0, twO({})); twSolid(x - 0.4, 310.4, x + 0.4, 311.2, 0, 1.3); }
  for (const x of [-56, -40, -24]) twLight(lamps, x, 2, 300, '#ffc070', 44, 1.5);
  for (const [y, z, r, k] of [[31, 306, 34, 1.5], [55, 312, 30, 1.4], [75, 316, 40, 1.3], [117, 318, 32, 1.3], [147, 318, 36, 1.2]]) for (const x of [-52, -28]) twLight(lamps, x, y, z, '#ffc890', r, k);
  for (const x of [-54, -26]) twLight(lamps, x, 31, 309, '#fff0d0', 14, 2.2);           // the podium's heroes
  for (const x of [-80, 0]) twLight(lamps, x, 2, 312, '#ffc070', 34, 1.4);
  for (const x of [-68, -12]) twLight(lamps, x, 23, 315, '#fff0d0', 13, 2.0);
  for (const x of [-104, 24]) twLight(lamps, x, 2, 316, '#ffc070', 26, 1.3);
  for (const x of [-66, -14]) twLight(lamps, x, 12, cz, '#ffb060', 30, 0.9);
  twLight(lamps, cx, sy1 + 4, cz - 10, '#ffd890', 22, 1.8); twLight(lamps, cx, sy1 + 22, cz - 8, '#ffe0a0', 26, 1.6);
  twLight(lamps, cx, TY - 6, tc - 4, '#ffd8a0', 14, 1.6);                                  // under the tribune
}
// ---- the glow (one small additive mesh): the searchlight beams and the halos (moved in its own onBeforeRender), and the
// Chairman's doors as they look from below (hidden once you're up there, where the real office shows through them)
const _twC = new V3();
function twGlowMesh() {
  const R = ST.atlas.rect, C = CFG.tower, nB = C.search.length, n = 6 + 2 * 6 + nB * 12;
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2), B = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) N[i * 3 + 1] = 1;
  const put = (i, uv, b) => { U[i * 2] = uv[0]; U[i * 2 + 1] = uv[1]; B[i * 3] = B[i * 3 + 1] = B[i * 3 + 2] = b; };
  const quadUV = (r) => [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], ORD = [0, 1, 2, 0, 2, 3];
  // the doors: a fixed quad in the stage's doorway, facing out (the first 6 vertices: skipped by the draw range when hidden)
  const [o0, o1, oh] = TWR.odoor, y = TWR.top.y, z = TWR.stage[2] - 0.02, dq = [[o1, y + oh, z], [o0, y + oh, z], [o0, y, z], [o1, y, z]], du = quadUV(R.twDoorsLit);
  ORD.forEach((k, j) => { P.set(dq[k], j * 3); put(j, du[k], 0.85); });
  const hu = quadUV(R.twHalo); for (let h = 0; h < 2; h++) ORD.forEach((k, j) => put(6 + h * 6 + j, hu[k], h ? 0.55 : 0.75));
  const bu = R.twBeam, bf = [0.95, 0.38, 0];   // across the beam: u; along it: the fade (the lamp, halfway, the far end)
  for (let s = 0; s < nB; s++) for (let q = 0; q < 2; q++) {
    const c = [[bu[0], bf[q]], [bu[2], bf[q]], [bu[2], bf[q + 1]], [bu[0], bf[q + 1]]];
    ORD.forEach((k, j) => { const i = 18 + s * 12 + q * 6 + j; put(i, [c[k][0], k < 2 ? bu[1] : bu[3]], c[k][1]); });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setAttribute('bake', new THREE.Float32BufferAttribute(B, 3));
  const m = new THREE.Mesh(g, makeMat('street', { baked: true, fog: C.glowFog, depthWrite: false }));
  m.material.blending = THREE.AdditiveBlending || 2; m.material.transparent = true; m.renderOrder = 5;
  m.frustumCulled = false; m.matrixAutoUpdate = false; m.updateMatrix();
  m.material.uniforms.uFogNear = { value: CFG.street.fog.near }; m.material.uniforms.uFogFar = { value: CFG.street.fog.far };
  m.onBeforeRender = (r, s, cam) => { _twC.setFromMatrixPosition(cam.matrixWorld); twGlowTick(NOW, _twC); };
  scene.add(m); TWR.glow = m; TWR.tris.glow = n / 3;
  twGlowTick(0, new V3(...ACT1_WEST.pt([-40, 1.7, 256])));
}
// where the beams point at time t, and the billboards turned to face the eye at (world) cam: cheap (a few dozen vertices)
const _twA = new V3(), _twB = new V3(), _twE = new V3(), _twS = new V3(), _twD = new V3(), _twU = new V3();
function twBeamDir(k, t, out) {   // searchlight k's direction at time t (local), sweeping slowly back and forth
  const [, , , az, swing, el, elSwing, per, ph] = CFG.tower.search[k], w = (t / per + ph) * Math.PI * 2;
  const a = (az + swing * Math.sin(w)) * DEG, e = (el + elSwing * Math.sin(w * 0.61 + 1.3)) * DEG;
  return out.set(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e));
}
function twGlowTick(t, cam) {
  const m = TWR.glow; if (!m) return;
  const g = m.geometry, Pa = g.attributes.position, P = Pa.array, C = CFG.tower, [lx, lz] = ACT1_WEST.toLocal(cam.x, cam.z);
  _twE.set(lx, cam.y, lz);
  const quad = (i, a, b, c, d) => { for (const [j, v] of [[0, a], [1, b], [2, c], [3, a], [4, c], [5, d]]) { P[(i + j) * 3] = v.x; P[(i + j) * 3 + 1] = v.y; P[(i + j) * 3 + 2] = v.z; } };
  // the halos: square billboards round the cog and round the crown's lantern
  const halo = (i, x, y, z, r) => {
    _twD.set(x - _twE.x, y - _twE.y, z - _twE.z).normalize(); _twS.set(-_twD.z, 0, _twD.x); if (_twS.lengthSq() < 1e-6) _twS.set(1, 0, 0); _twS.normalize(); _twU.crossVectors(_twS, _twD).normalize();
    const c = (sx, sy) => new V3(x + (_twS.x * sx + _twU.x * sy) * r, y + (_twS.y * sx + _twU.y * sy) * r, z + (_twS.z * sx + _twU.z * sy) * r);
    quad(i, c(-1, 1), c(1, 1), c(1, -1), c(-1, -1));
  };
  halo(6, -40, TWR.cogY, 330, TWR.cogD * 1.25); halo(12, -40, TWR.stage[5] + 4.5, 330, 15);
  // the beams: two quads each (lamp -> halfway -> far end), turned about their own axis to face the eye
  for (let k = 0; k < C.search.length; k++) {
    const [x, y, z] = C.search[k]; twBeamDir(k, t, _twD); _twA.set(x, y, z);
    _twS.subVectors(_twE, _twA).cross(_twD); if (_twS.lengthSq() < 1e-6) _twS.set(1, 0, 0); _twS.normalize();
    const pts = [0, 0.4, 1].map(f => _twB.copy(_twA).addScaledVector(_twD, C.beamLen * f).clone()), wd = [0, 0.4, 1].map(f => (C.beamW[0] + (C.beamW[1] - C.beamW[0]) * f) / 2);
    for (let q = 0; q < 2; q++) {
      const a = pts[q].clone().addScaledVector(_twS, -wd[q]), b = pts[q].clone().addScaledVector(_twS, wd[q]);
      const c = pts[q + 1].clone().addScaledVector(_twS, wd[q + 1]), d = pts[q + 1].clone().addScaledVector(_twS, -wd[q + 1]);
      quad(18 + k * 12 + q * 6, a, b, c, d);
    }
  }
  Pa.needsUpdate = true;
  // the doors' glow only while you're not up there to see the real thing through them
  const hide = level.name === 'tower' && player.floorY > 150;
  if (g.setDrawRange) g.setDrawRange(hide ? 6 : 0, Infinity);
  if (TWR.permit) TWR.permit.visible = TWR.signed && hide;
  TWR.glowT = t;
}
function twLiftCarMesh(L) {   // the car (walls, floor, ceiling lamp) and two brass leaves that slide apart; it rides as a group
  const acc = new GeoAcc(), [a, b, c, d] = L.car, A = a - 0.02, B = b + 0.02, H = 2.45;
  if (L.glass) {   // glass on three sides (both faces of each pane), gilt posts and a rail, a marble floor, a gilt crown
    for (const [x0, z0, x1, z1] of [[A, c, B, c], [B, c, B, d], [A, d, A, c]]) { wall(acc, 'twGlass', x0, z0, x1, z1, 0.05, H, 1.4, 1.2, { cell: 99 }); wall(acc, 'twGlass', x1, z1, x0, z0, 0.05, H, 1.4, 1.2, { cell: 99 }); }
    for (const [x, z] of [[A, c], [B, c], [A, d], [B, d]]) sbox(acc, 'twGold', x, 0, z, 0.1, 0.1, H, 0, twO({}));
    for (const [x0, z0, x1, z1] of [[A, c + 0.06, B, c + 0.06], [B - 0.06, c, B - 0.06, d], [A + 0.06, c, A + 0.06, d]]) sbox(acc, 'twGold', (x0 + x1) / 2, 1.0, (z0 + z1) / 2, Math.max(0.06, x1 - x0), Math.max(0.06, z1 - z0), 0.06, 0, twO({}));
    sbox(acc, 'twGold', (a + b) / 2, -0.35, (c + d) / 2, b - a + 0.2, d - c + 0.2, 0.36, 0, twO({ top: false }));
    ground(acc, 'marble', A, c, B, d, 0.01, 2);
    aq(acc, 'iron', [A, H, d], [B, H, d], [B, H, c], [A, H, c], [0, 0, 1, 1], [0, -1, 0], 9);
    frustum(acc, 'twGold', (a + b) / 2, H, (c + d) / 2, b - a + 0.3, d - c + 0.3, 0.5, 0.5, 0.7, 0, twO({}));
    sbox(acc, 'litWarm', (a + b) / 2, H - 0.08, (c + d) / 2, 0.8, 0.3, 0.06, 0, twO({}));
  } else {
    wall(acc, 'liftCar', A, d, B, d, 0, H, 1, 1); wall(acc, 'liftCar', B, c, B, d, 0, H, 1, 1); wall(acc, 'liftCar', A, d, A, c, 0, H, 1, 1);
    ground(acc, 'marble', A, c, B, d, 0.01, 2);
    aq(acc, 'iron', [A, H, d], [B, H, d], [B, H, c], [A, H, c], [0, 0, 1, 1], [0, -1, 0], 2);
    sbox(acc, 'litWarm', (a + b) / 2, H - 0.08, (c + d) / 2 + 0.4, 0.6, 0.3, 0.06, 0, { u: 1, v: 1 });
    plate(acc, 'cog', (a + b) / 2, 1.7, d, 0.5, 0.5, Math.PI, 0.02);
  }
  const g = new THREE.Group(), m = new THREE.Mesh(acc.geometry({ ambient: [0.62, 0.55, 0.45], lights: [] }), makeMat('street', { baked: true }));
  m.frustumCulled = false; g.add(m);
  for (const s of [-1, 1]) {
    const la = new GeoAcc(); sbox(la, 'liftBrass', 0, 0, 0, (b - a) / 2, 0.05, 2.4, 0, { u: (b - a) / 2, v: 2.4 });
    const lm = new THREE.Mesh(la.geometry({ ambient: [0.55, 0.5, 0.42], lights: [] }), makeMat('street', { baked: true })); lm.frustumCulled = false;
    lm.userData.s = s; g.add(lm); L.leaves.push(lm);
  }
  scene.add(g); L.group = g;
}
function twPermitMesh() {   // the signed permit on the signing table out on the tribune: hidden until he signs
  const acc = new GeoAcc(), y = TWR.top.y + 0.785, [x, z] = TWR.ddesk;
  aq(acc, 'permit', [x - 0.3, y, z - 0.22], [x + 0.3, y, z - 0.22], [x + 0.3, y, z + 0.23], [x - 0.3, y, z + 0.23], [0, 0, 1, 1], [0, 1, 0], 2);
  sbox(acc, 'iron', x + 0.15, y, z, 0.03, 0.18, 0.03, 0.4, { u: 1, v: 1 });
  const m = new THREE.Mesh(acc.geometry({ ambient: [0.7, 0.62, 0.5], lights: [] }), makeMat('street', { baked: true }));
  m.frustumCulled = false; m.visible = false; m.userData.small = true; scene.add(m); TWR.permit = m;
}
// called from buildStreet(): the shell and the glow (outside), the four floors (rooms), the lift cars, the permit
function buildTower() {
  ACT1_WEST.begin();
  const F = CFG.street.fog, Lt = CFG.street.light, C = CFG.tower.light;
  const mkGeo = (g, o = {}) => {
    const m = new THREE.Mesh(g, makeMat('street', Object.assign({ baked: true }, o)));
    m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false; m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far }; scene.add(m); return m;
  };
  const mk = (acc, light, o) => mkGeo(acc.geometry(light), o);
  // the floors, two to a mesh (lobby + typing pool, archive + the Chairman's office), each baked with its own ambient and
  // lamps; only the lamps in `live` (and all the lobby's) light the goons and props (the desk lamps are baked only)
  const floors = { lobby: towerLobby, office: towerOffices, archive: towerArchive, top: towerTop }, amb = { lobby: C.inAmbient, office: C.officeAmbient, archive: C.archiveAmbient, top: C.topAmbient };
  for (const [name, ks] of [['low', ['lobby', 'office']], ['high', ['archive', 'top']]]) {
    let P = [], N = [], U = [], B = [];
    for (const k of ks) {
      const acc = new GeoAcc(), lamps = [], live = []; floors[k](acc, lamps, live);
      P = P.concat(acc.p); N = N.concat(acc.n); U = U.concat(acc.u); B = B.concat(Array.from(bakeLight(acc.p, acc.n, acc.c, { ambient: amb[k], lights: lamps })));
      TWR.tris[k] = acc.tris; TWR.lamps[k] = k === 'lobby' ? lamps : live;
      for (const l of TWR.lamps[k]) ST.lamps.push(l);   // goons and props are lit live by the nearest of these
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setAttribute('bake', new THREE.Float32BufferAttribute(B, 3)); g.computeBoundingSphere();
    TWR.meshes[name] = mkGeo(g);
  }
  const sacc = new GeoAcc(), slamps = [], tlive = []; towerShell(sacc, slamps, tlive);
  TWR.shell = mk(sacc, { ambient: Lt.skylineAmbient, sky: Lt.skylineSky, lights: slamps }, { fog: CFG.tower.shellFog }); TWR.tris.shell = sacc.tris;
  TWR.lamps.tribune = tlive; for (const l of tlive) ST.lamps.push(l);
  twGlowMesh();
  for (const L of TLIFTS) twLiftCarMesh(L);
  twPermitMesh();
  // where you can walk (in the tower only): the doorway, each floor at its height (and the tribune), the lift cars (their
  // floors ride with them), the glass lift's thresholds at the archive and the tribune
  const on = (area) => () => level.name === 'tower' && !LOCKED.has(area), P = 0.3, [d0, d1] = TWR.door, L3 = TLIFTS[2], TY = TWR.top.y;
  for (const L of TLIFTS) L.rect = { x0: L.car[0], x1: L.car[1], z0: L.car[2], z1: L.car[3], y: L.y + 0.001, pad: P, area: L.lock, on: () => level.name === 'tower' && (twInCar(L) || (L.phase !== 'moving' && L.phase !== 'closing' && L.phase !== 'shut' && !LOCKED.has(L.lock))) };
  const sill = (stop, y) => ({ x0: -41.0, x1: -39.0, z0: L3.car[3] - 0.3, z1: L3.car[3] + (stop ? 0.6 : 1.3), y, pad: P, area: 'twSill' + stop,
    on: () => level.name === 'tower' && L3.stop === stop && L3.doors > 0.5 && (twInCar(L3) || !LOCKED.has('twLift3')) });
  const [ta, tb, tc, td] = TWR.tribune, [o0, o1] = TWR.odoor;
  [ { x0: d0 + 0.5, x1: d1 - 0.5, z0: 310.4, z1: 313.2, pad: P, area: 'twDoor', on: () => (level.name === 'parade' && game.state === 'won') || (level.name === 'tower' && !LOCKED.has('twDoor')) },
    ...twFloorRects(TWR.lobby, TW_HOLES.lobby, 'twLobby', on('twLobby'), P), ...twFloorRects(TWR.office, TW_HOLES.office(), 'twOffice', on('twOffice'), P),
    ...twFloorRects(TWR.archive, TW_HOLES.archive(), 'twArchive', on('twArchive'), P), ...twFloorRects(TWR.top, TW_HOLES.top, 'twTop', on('twTop'), P),
    ...twFloorRects({ r: [ta + 0.3, tb - 0.3, tc + 0.3, td], y: TY }, TW_HOLES.tribune(), 'twTop', on('twTop'), P),
    { x0: o0 + 0.4, x1: o1 - 0.4, z0: td - 0.3, z1: TWR.top.r[2] + 0.3, y: TY, pad: P, area: 'twTop', on: on('twTop') },
    sill(0, L3.stops[0]), sill(1, L3.stops[1]),
    ...TLIFTS.map(L => L.rect),
  ].forEach(addWalk);
  // Parade Square's own way up to the doors stays walkable while you're in here, so the doors are shut by a blocker
  // that only exists (has a height) while a fight holds them
  const shut = () => level.name === 'tower' && LOCKED.has('twDoor');
  BLOCKERS.push({ x0: d0, x1: d1, z0: TWR.foot[2] - 0.4, z1: TWR.foot[2], get y0() { return shut() ? 0 : -20; }, get y1() { return shut() ? TWR.door[2] : -20; } });
  resetTowerLifts(0);
  ACT1_WEST.end();
}
// A floor with furniture standing in it: the floor's walk rect minus rectangular holes [x0, x1, z0, z1], as a union of walk
// rects (cut into bands at the holes' edges; each band's free stretches). The holes (desks, shelf rows) are then walls of
// the walk area rather than solid boxes: the stacked floors share the physics' z bands, so every box costs every goon on
// every floor, while a walk rect is remembered per particle and costs next to nothing.
function twFloorRects(Fl, holes, area, on, pad) {
  const { r: [fx0, fx1, fz0, fz1], y, walk = [0, 0, 0] } = Fl, x0 = fx0 + walk[0], x1 = fx1 - walk[1], z0 = fz0 + walk[2], out = [];
  const cuts = [...new Set([z0, fz1, ...holes.flatMap(h => [h[2], h[3]])])].filter(z => z >= z0 && z <= fz1).sort((p, q) => p - q);
  for (let i = 0; i < cuts.length - 1; i++) {
    const c = cuts[i], d = cuts[i + 1], m = (c + d) / 2;
    let a = x0; const hs = holes.filter(h => m > h[2] && m < h[3]).sort((p, q) => p[0] - q[0]);
    for (const h of hs) { if (h[0] > a + 0.05) out.push([a, h[0], c, d]); a = Math.max(a, h[1]); }
    if (x1 > a + 0.05) out.push([a, x1, c, d]);
  }
  return out.map(([a, b, c, d]) => ({ x0: a, x1: b, z0: Math.max(z0, c - 0.05), z1: Math.min(fz1, d + 0.05), y, pad, area, on }));
}
const TW_HOLES = {   // furniture each floor's walk area goes round
  lobby: [[-47.2, -45.8, 316.3, 317.7], [-34.2, -32.8, 316.3, 317.7], [-47.2, -45.8, 321.8, 323.2], [-34.2, -32.8, 321.8, 323.2],
          [-47.2, -45.8, 327.3, 328.7], [-34.2, -32.8, 327.3, 328.7], [-41.6, -38.4, 328.4, 331.6]],   // columns, the hero's plinth
  office: () => TWR.deskRows.flatMap(z => [[-60.25, -49.75, z - 0.36, z + 0.85], [-30.25, -19.75, z - 0.36, z + 0.85]]),   // the ranks of desks (and chairs)
  archive: () => [...TWR.shelves.map(([a, b]) => [a, b, a <= TWR.archive.r[0] + 0.01 || b >= TWR.archive.r[1] - 0.01 ? TWR.archive.r[2] : 318.3, 331.5]),
                  [-44.4, -32.6, 332.9, 333.8], [-41.1, -38.9, 327.05, 328.15], [-40.35, -39.65, 328.3, 328.95], [-40.25, -39.75, 325.65, 326.2]],   // shelves, the card wall, her desk and the chairs
  top: [[-41.7, -38.3, 330.5, 333.2], [-34.4 - 0.4, -34.4, 328.5, 331.5]],   // his desk and chair, the bookcase (the decanter cabinet stays a box: bottles stand on it)
  tribune: () => [[TWR.ddesk[0] - 0.8, TWR.ddesk[0] + 0.8, TWR.ddesk[1] - 0.4, TWR.ddesk[1] + 0.4], [-49.4, -48.4, 316.3, 317.3], [-31.6, -30.6, 316.3, 317.3],
                  [-49.7, -49.0, 319.9, 320.5], [-31.0, -30.3, 319.9, 320.5], [-49.7, -49.0, 323.9, 324.5], [-31.0, -30.3, 323.9, 324.5]],   // the signing table, the flagpoles, the lamps
};
// rooms: each floor is its own room (by height), lifts 1 and 2 belong to the floors they join; the lobby looks out through
// the south doors, the archive through the glass lift's door, the Chairman's office through its doors onto the tribune.
// The glass lift and the tribune are outside.
const _twL = new V3(), twIn = (q) => { const p = ACT1_WEST.local(q, _twL); return twInL(p); };
const twInL = (p) => p.x > TWR.foot[0] && p.x < TWR.foot[1] && p.z > TWR.foot[2] + 0.02 && p.z < TWR.foot[3];
function towerRooms() {
  addRoom('twLobby', (p) => twIn(p) && p.y < 11);
  addRoom('twOffice', (p) => twIn(p) && p.y >= 11 && p.y < 38);
  addRoom('twArchive', (p) => p.y >= 38 && p.y < 60 && twIn(p) && _twL.z > TWR.archive.r[2] - 0.3);
  addRoom('twTop', (p) => { if (p.y < 170 || p.y >= 200) return false; const q = ACT1_WEST.local(p, _twL), [a, b, c, d] = TWR.stage; return q.x > a && q.x < b && q.z > c && q.z < d; });
  const M = TWR.meshes;
  roomMeshes('twLobby', M.low); roomMeshes('twOffice', M.low); roomMeshes('twArchive', M.high); roomMeshes('twTop', M.high);
  for (const L of TLIFTS) for (const r of L.rooms) roomMeshes(r, L.group);
  addPortal('outside', 'twLobby', ACT1_WEST.pt([-40, 3, TWR.foot[2]]), () => (level.name === 'tower' && player.floorY < 6) || (level.name === 'parade' && game.state === 'won'));
  addPortal('twArchive', 'outside', ACT1_WEST.pt([-40, TWR.archive.y + 1.2, TWR.archive.r[2] - 0.15]), () => level.name === 'tower' && player.floorY > 30 && player.floorY < 70);
  addPortal('twTop', 'outside', ACT1_WEST.pt([-40, TWR.top.y + 1.9, TWR.stage[2] + 0.1]), () => level.name === 'tower' && player.floorY > 150);
}
// ---- the rides
// in the car: past the doorway's plane (a locked car's floor is off, so the floor's own edge holds you at the doorway).
// Lifts 1 and 2 open south (into the floors); the glass lift opens north (into the tower, and onto the tribune)
const twInCar = (L) => {
  const h = ACT1_WEST.head(), [a, b, c, d] = L.car;
  if (h.x < a - 0.05 || h.x > b + 0.05 || Math.abs(player.floorY - L.y) > 0.8) return false;
  return L.glass ? h.z > c - 0.1 && h.z < d - 0.1 : h.z > TWR.wallZ + 0.1 && h.z < d + 0.1;
};
function resetTowerLifts(ridden) {   // ridden: how many lifts you've already taken (0 from the doors; 3 = at the top)
  TLIFTS.forEach((L, i) => {
    L.stop = i < ridden ? 1 : 0; L.phase = 'open'; L.doors = 1; L.t = 0; L.y = L.stops[L.stop];
    if (L.glass && i >= ridden) { L.phase = 'shut'; L.doors = 0; }   // the glass lift waits, shut, until Orlova's down
    if (L.rect) L.rect.y = L.y + 0.001;
  });
  CFG.floors.maxRise = CFG.tower.restRise; placeTowerLifts();
}
function placeTowerLifts() {
  for (const L of TLIFTS) {
    if (!L.group) continue;
    L.group.position.y = L.y; L.group.updateMatrixWorld(true);
    const [a, b, c, d] = L.car, half = (b - a) / 2, mid = (a + b) / 2;
    for (const lm of L.leaves) { lm.position.set(mid + lm.userData.s * half * (0.5 + L.doors * 0.98), 0, L.glass ? d - 0.06 : c + 0.06); lm.updateMatrixWorld(true); }
  }
}
function twRide(obj, target, speed, dt) {   // eased: speed up, cruise, slow into the stop
  const d = target - obj.y, v = Math.sign(d) * Math.min(speed, Math.abs(d) * 1.6 + 0.25, (obj.t += dt) * 2.2 + 0.2);
  obj.y = Math.abs(d) <= Math.abs(v * dt) ? target : obj.y + v * dt;
  return obj.y === target;
}
function updateTower(dt) {
  const C = CFG.tower;
  for (const L of TLIFTS) {   // step in once this floor is clear: the doors close, it climbs, the doors open on the next floor
    const ready = L.needs.every(i => level.encounter >= i) && game.state === 'walk';
    if (L.phase === 'shut' && ready) { L.phase = 'opening'; L.t = 0; AU.bell(); showSign('twGlass', 2.0); }   // the glass lift opens on the night
    else if (L.phase === 'open' && L.stop === 0 && twInCar(L) && ready) { L.phase = 'closing'; L.t = 0; AU.bell(); }
    else if (L.phase === 'closing') { L.doors = Math.max(0, L.doors - dt / C.doorTime); if (L.doors === 0) { L.phase = 'moving'; L.t = 0; CFG.floors.maxRise = C.liftSpeed * 1.6; showSign('twUp', 1.6); } }
    else if (L.phase === 'moving') { if (twRide(L, L.stops[1], C.liftSpeed, dt)) { L.stop = 1; L.phase = 'opening'; L.t = 0; AU.bell(); showSign(L.arrive, 1.8); if (L.glass) AU.noise(2.4, 0.3, 380); } }
    else if (L.phase === 'opening') { L.doors = Math.min(1, L.doors + dt / C.doorTime); if (L.doors >= 1) { L.phase = 'open'; CFG.floors.maxRise = C.restRise; } }
    L.rect.y = L.y + 0.001;
  }
  placeTowerLifts();
  if (player.floorY > 150 && (TWR.gustT -= dt) < 0) { TWR.gustT = 5 + (NOW * 7.3) % 4; AU.noise(2.2, 0.16, 320); }   // the wind up there
  // the Chairman: until his own goon lands (with `signs: true`, calling onLeaderSigned), beating the last fight is his signature
  const last = C.encounters.length - 1;
  if (!TWR.signed && level.encounter === last && game.state === 'fight' && !game.queue.length && enemies.length && enemies.every(e => !e.alive)) towerSigned(null);
  if (TWR.signed && !TWR.act1 && (TWR.signT += dt) > C.signPause) { TWR.act1 = true; showSign('act1', 1e9); AU.bell(); }
  if (TWR.permit) TWR.permit.visible = TWR.signed && player.floorY > 150;
}
// He signs: the permit to reopen The Threeway (1 of 3), the level is won, and with it Act 1.
function towerSigned(e) {
  if (TWR.signed) return;
  TWR.signed = true; TWR.signT = 0; TWR.act1 = false;
  SIGNED.add(e ? e.type : 'chairman');
  level.arena = null; LOCKED.clear(); game.queue = [];
  game.state = 'won'; game.timer = 0;
  showSign('signed' + Math.min(3, SIGNED.size), CFG.tower.signPause); AU.bell();
}
// the hook a leader goon with `signs: true` calls when he kneels at 0 hp (any sector's leader; the Chairman ends Act 1)
function onLeaderSigned(e) {
  if (!e || !e.cfg || !e.cfg.signs) return;
  if (level.name === 'tower') { towerSigned(e); return; }
  if (!SIGNED.has(e.type)) { SIGNED.add(e.type); showSign('signed' + Math.min(3, SIGNED.size), 3.0); AU.bell(); }
}
defineLevel('tower', {
  menu: '7 · The Tower of Labor', cfg: () => CFG.tower, build: buildTower, rooms: towerRooms,
  outside: () => [TWR.shell, TWR.glow, TLIFTS[2].group], rects: () => [ACT1_WEST.rect(TWR.rect)], frame: ACT1_WEST,
  start: (f) => startTower(f), update: (dt) => updateTower(dt),
  after: 'parade', enter: () => ACT1_WEST.head().z > 312.6,                                  // through the big south doors
  signs: { tower: ['THE TOWER OF LABOR', '#f2c14e'], twLobby: ['FIGHT!', '#f2c14e'], twOffices: ['FIGHT!', '#f2c14e'], orlova: ['INSPECTOR ORLOVA', '#e8352b'],
           chairman: ['THE CHAIRMAN', '#f2c14e'], twUp: ['GOING UP', '#33e0d0'], twMinistry: ['THE MINISTRY', '#33e0d0'], twArchive: ['THE ARCHIVE', '#33e0d0'],
           twGlass: ['TO THE TOP', '#33e0d0'], twTop: ['THE TRIBUNE', '#33e0d0'],
           signed1: ['SIGNED · 1 OF 3', '#33e0d0'], signed2: ['SIGNED · 2 OF 3', '#33e0d0'], signed3: ['SIGNED · 3 OF 3', '#33e0d0'],
           act1: ['ACT 1 COMPLETE', '#ff4f9a'] },
  hud: { walk: 'The Tower of Labor — take the lift up', last: 'The Chairman is waiting', won: 'The permit is signed — Act 1 complete (R to restart)', short: 'Tower' },
});
function startTower(fromSquare) {
  level.name = 'tower'; level.encounter = -1; level.arena = null; LOCKED.clear();
  TWR.signed = false; TWR.signT = 0; TWR.act1 = false;
  clearEnemies(); resetTowerLifts(0);
  const held = new Set(handList.map(h => h.held));
  if (!fromSquare) { DOOR.target = 1; DOOR.open = 1; player.hp = CFG.player.health; player.hurtT = 0; game.catches = 0; game.disarms = 0; }
  for (const p of props.slice()) if (!held.has(p)) { scene.remove(p.obj); p.body.remove(); p.alive = false; props.splice(props.indexOf(p), 1); }   // the square's props stay behind
  for (const [type, x, z, y] of CFG.tower.props) new Prop(type, ACT1_WEST.world(new V3(x, y || 0, z)));
  if (!fromSquare) { placePlayer(...ACT1_WEST.toWorld(CFG.tower.start[0], CFG.tower.start[1]), Math.PI + ACT1_WEST.yaw); rig.position.y = 0; }
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  showSign('tower', 2.2);
}
