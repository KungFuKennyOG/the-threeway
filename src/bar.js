'use strict';
// ============================== the room ====================================
// Back wall (z=-5) Hinomoto: bar, lanterns, neon. Left (x=-5) Krasnovia. Right (x=+5) Columbia. Front (z=+5) door.
const ROOM = { x: 5, z: 5, h: 3.4, wall: 4.65 };
const BAR = { x0: -3.3, x1: 3.3, z0: -3.95, z1: -3.25, top: 1.15 };
const TABLES = [{ x: -2.6, z: 1.2 }, { x: -1.4, z: 3.3 }];
const POOL = { x: 2.7, z: 1.2, hx: 0.78, hz: 1.28, top: 0.86 };
const SURFACES = [   // things props can rest on: x0,x1,z0,z1,top
  { x0: BAR.x0, x1: BAR.x1, z0: BAR.z0, z1: BAR.z1, top: BAR.top },
  ...TABLES.map(t => ({ x0: t.x - 0.45, x1: t.x + 0.45, z0: t.z - 0.45, z1: t.z + 0.45, top: 0.79 })),
  { x0: POOL.x - POOL.hx, x1: POOL.x + POOL.hx, z0: POOL.z - POOL.hz, z1: POOL.z + POOL.hz, top: POOL.top },
];
const BLOCKERS = [   // xz boxes nobody walks through
  { x0: BAR.x0, x1: BAR.x1, z0: BAR.z0, z1: BAR.z1 },
  { x0: POOL.x - POOL.hx, x1: POOL.x + POOL.hx, z0: POOL.z - POOL.hz, z1: POOL.z + POOL.hz },
  { x0: -4.95, x1: -4.35, z0: 1.0, z1: 1.95 },  // jukebox
];
// Where anyone can stand: a union of xz rectangles (the bar, the doorway once the door is open, the street).
// Walls are wherever these rectangles end. `on()` gates a rectangle (the doorway needs an open door).
// Walking bounds are (edge - r) + pad; walls for ragdoll particles sit at w* (edge + 1 cm unless given).
const WALK = [
  { x0: -ROOM.wall, x1: ROOM.wall, z0: -ROOM.wall, z1: ROOM.wall, pad: 0.3, wx0: -(ROOM.x - 0.04), wx1: ROOM.x - 0.04, wz0: -(ROOM.z - 0.04), wz1: ROOM.z - 0.04, area: 'bar' },
];
function addWalk(w) { w.pad = w.pad || 0; for (const [k, s] of [['x0', -1], ['x1', 1], ['z0', -1], ['z1', 1]]) if (w['w' + k] === undefined) w['w' + k] = w[k] + s * 0.01; WALK.push(w); }
// banded lookup so the street's many boxes don't cost the bar anything: boxes are filed by z band
const BAND = 4;
function bandIndex(list, get, margin) {
  const bands = new Map();
  for (const it of list) {
    const [z0, z1] = get(it);
    for (let k = Math.floor((z0 - margin) / BAND); k <= Math.floor((z1 + margin) / BAND); k++) { if (!bands.has(k)) bands.set(k, []); bands.get(k).push(it); }
  }
  return bands;
}
const NONE = [];
let blockerBands = null, worldBoxBands = null, walkBands = null;
function indexWorld() {
  blockerBands = bandIndex(BLOCKERS, b => [b.z0, b.z1], 0.8);
  worldBoxBands = bandIndex(WORLD_BOXES, B => [B[2], B[5]], 0.6);
  walkBands = bandIndex(WALK, w => [w.z0, w.z1], 8);   // only the walkable rectangles near you are tested
}
const blockersNear = (z) => (blockerBands && blockerBands.get(Math.floor(z / BAND))) || NONE;
const boxesNear = (z) => (worldBoxBands && worldBoxBands.get(Math.floor(z / BAND))) || NONE;
// keep an xz point (radius r) inside the walkable union; returns true if it had to move. walls: ragdoll particles
function keepInWalk(p, r, walls) {
  let best = null, bestD = 1e9, bx = 0, bz = 0;
  const list = (walkBands && walkBands.get(Math.floor(p.z / BAND))) || WALK;
  for (const w of list) {
    if (w.on && !w.on()) continue;
    let x0, x1, z0, z1;
    if (walls) { x0 = w.wx0 + r; x1 = w.wx1 - r; z0 = w.wz0 + r; z1 = w.wz1 - r; }
    else { x0 = (w.x0 + r) - w.pad; x1 = (w.x1 - r) + w.pad; z0 = (w.z0 + r) - w.pad; z1 = (w.z1 - r) + w.pad; }
    if (x0 > x1 || z0 > z1) continue;
    if (p.x >= x0 && p.x <= x1 && p.z >= z0 && p.z <= z1) return false;
    const qx = clamp(p.x, x0, x1), qz = clamp(p.z, z0, z1), d = (p.x - qx) ** 2 + (p.z - qz) ** 2;
    if (d < bestD) { bestD = d; best = w; bx = qx; bz = qz; }
  }
  if (!best) return false;
  p.x = bx; p.z = bz; return true;
}
let neonMat, roundSignMat, roomTris = 0;

function buildRoom() {
  const X = ROOM.x, Z = ROOM.z, Y = ROOM.h;
  grid('wood_floor', [-X, 0, Z], [1, 0, 0], [0, 0, -1], 2 * X, 2 * Z, 1.6, 1.6, 1.0, [0, 1, 0]);
  grid('ceiling', [-X, Y, -Z], [1, 0, 0], [0, 0, 1], 2 * X, 2 * Z, 1.5, 1.5, 2.0, [0, -1, 0]);
  grid('wood_panel', [-X, 0, -Z], [1, 0, 0], [0, 1, 0], 2 * X, 2.7, 1.0, 2.7, 1.0, [0, 0, 1]);
  grid('ceiling', [-X, 2.7, -Z], [1, 0, 0], [0, 1, 0], 2 * X, Y - 2.7, 1.5, 1.5, 1.0, [0, 0, 1]);
  grid('tile', [-X, 0, Z], [0, 0, -1], [0, 1, 0], 2 * Z, 1.6, 0.8, 0.8, 1.0, [1, 0, 0]);
  grid('concrete', [-X, 1.6, Z], [0, 0, -1], [0, 1, 0], 2 * Z, Y - 1.6, 1.2, 1.2, 1.0, [1, 0, 0]);
  grid('brick', [X, 0, -Z], [0, 0, 1], [0, 1, 0], 2 * Z, Y, 0.9, 0.9, 1.0, [-1, 0, 0]);
  // front wall, with the doorway cut out (the door itself is a hinged mesh: it opens onto Tripoint Square)
  const DW = DOOR.w / 2;
  for (const x0 of [X, -DW]) {
    grid('wood_panel', [x0, 0, Z], [-1, 0, 0], [0, 1, 0], X - DW, 1.2, 1.0, 1.2, 1.0, [0, 0, -1]);
    grid('concrete', [x0, 1.2, Z], [-1, 0, 0], [0, 1, 0], X - DW, Y - 1.2, 1.2, 1.2, 1.0, [0, 0, -1]);
  }
  grid('concrete', [DW, DOOR.h, Z], [-1, 0, 0], [0, 1, 0], 2 * DW, Y - DOOR.h, 1.2, 1.2, 1.0, [0, 0, -1]);
  box('brass', [-X, 2.68, -Z], [X, 2.78, -Z + 0.06], { faces: 'ftd' });

  // ---- Hinomoto: bar, back shelf, lanterns, neon
  box('barfront', [BAR.x0 + 0.1, 0, BAR.z0], [BAR.x1 - 0.1, 1.08, BAR.z1 - 0.1], { uvs: { f: [0, 0, 6.4, 1], l: [0, 0, 0.55, 1], r: [0, 0, 0.55, 1] }, faces: 'flr' });
  box('counter', [BAR.x0, 1.08, BAR.z0], [BAR.x1, BAR.top, BAR.z1], { tile: 0.6 });
  for (const sy of [1.45, 1.95]) {
    box('darkwood', [-2.8, sy, -5], [2.8, sy + 0.04, -4.65], { faces: 'ftd' });
    const n = 18, acc = sacc('bottles');
    for (let k = 0; k < n; k++) {
      const x = -2.6 + k * 5.2 / (n - 1) + (k % 2 ? 0.04 : 0);
      const t = (k * 7 + Math.round(sy * 10)) % 3, h = 0.26 + 0.04 * ((k * 5) % 3);
      acc.quad([[x - 0.06, sy + 0.04 + h, -4.8], [x + 0.06, sy + 0.04 + h, -4.8], [x + 0.06, sy + 0.04, -4.8], [x - 0.06, sy + 0.04, -4.8]],
        [[t / 3, 0], [(t + 1) / 3, 0], [(t + 1) / 3, 1], [t / 3, 1]], [0, 0, 1]);
    }
  }
  for (const x of [-2.6, -1.3, 0, 1.3, 2.6]) {
    box('lantern', [x - 0.17, 2.45, -3.55], [x + 0.17, 2.95, -3.21], { uvs: { '*': [0, 0, 1, 1], t: [0, 0, 1, 0.08], d: [0, 0.95, 1, 1] }, emissive: true });
    box('black', [x - 0.01, 2.95, -3.39], [x + 0.01, Y, -3.37], { faces: 'fblr' });
  }
  for (const x of [-4.2, 4.2])   // Akira-style vertical neon boards in brush lettering, either end of the back wall
    sacc('neon_hino', { emissive: true }).quad([[x - 0.26, 2.62, -4.92], [x + 0.26, 2.62, -4.92], [x + 0.26, 0.55, -4.92], [x - 0.26, 0.55, -4.92]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 0, 1]);
  // ---- Krasnovia (left wall)
  sacc('banner').quad([[-4.97, 3.1, -2.2], [-4.97, 3.1, -1.0], [-4.97, 0.7, -1.0], [-4.97, 0.7, -2.2]], [[0, 0], [1, 0], [1, 1], [0, 1]], [1, 0, 0], 2);
  box('darkwood', [-5, 1.75, 0.0], [-4.6, 2.05, 0.08]);
  box('sodium', [-4.75, 2.05, -0.12], [-4.45, 2.35, 0.2], { uvs: { '*': [0, 0, 1, 1] }, emissive: true });
  box('darkwood', [-4.95, 0, 1.0], [-4.35, 1.62, 1.95], { faces: 'tlbf' });
  box('jukebox', [-4.95, 0, 1.0], [-4.35, 1.62, 1.95], { uvs: { r: [0, 0, 1, 1] }, faces: 'r', emissive: true });
  // ---- Columbia (right wall): art deco, gold trim, the ridge in the window, amber diner neon
  box('brass', [X - 0.06, 2.68, -Z], [X, 2.78, Z], { faces: 'ltd' });
  sacc('window', { emissive: true, tint: [0.9, 0.9, 1.0] }).quad([[4.97, 2.6, -2.6], [4.97, 2.6, -0.6], [4.97, 1.0, -0.6], [4.97, 1.0, -2.6]], [[0, 0], [2, 0], [2, 0.8], [0, 0.8]], [-1, 0, 0], 2);
  box('darkwood', [4.9, 0.94, -2.7], [5.0, 1.0, -0.5]);
  sacc('neon_open', { emissive: true }).quad([[4.95, 3.05, -2.75], [4.95, 3.05, -0.45], [4.95, 2.7, -0.45], [4.95, 2.7, -2.75]], [[0.02, 0.15], [0.98, 0.15], [0.98, 0.85], [0.02, 0.85]], [-1, 0, 0]);
  sacc('cola').quad([[4.96, 2.3, 0.8], [4.96, 2.3, 1.5], [4.96, 1.25, 1.5], [4.96, 1.25, 0.8]], [[0, 0], [1, 0], [1, 1], [0, 1]], [-1, 0, 0]);
  const px = POOL.x, pz = POOL.z;
  box('felt', [px - 0.7, 0.74, pz - 1.2], [px + 0.7, 0.8, pz + 1.2], { tile: 0.5, faces: 't' });
  for (const [a0, a1, b0, b1] of [[-0.78, -0.68, -1.28, 1.28], [0.68, 0.78, -1.28, 1.28], [-0.78, 0.78, -1.28, -1.18], [-0.78, 0.78, 1.18, 1.28]])
    box('darkwood', [px + a0, 0.6, pz + b0], [px + a1, POOL.top, pz + b1]);
  box('darkwood', [px - 0.6, 0, pz - 1.05], [px + 0.6, 0.6, pz + 1.05], { faces: 'fblr' });
  box('darkwood', [px - 0.35, 1.95, pz - 0.65], [px + 0.35, 2.08, pz + 0.65], { faces: 'fblrt' });
  box('teal', [px - 0.33, 1.949, pz - 0.63], [px + 0.33, 1.95, pz + 0.63], { uvs: { '*': [0, 0, 1, 1] }, emissive: true, faces: 'd' });
  box('black', [px - 0.01, 2.08, pz - 0.01], [px + 0.01, Y, pz + 0.01], { faces: 'fblr' });
  // ---- front wall: the door frame runs through the wall to the street
  box('darkwood', [-DW - 0.12, 0, 4.9], [-DW, DOOR.h + 0.12, DOOR.z1], { faces: 'fblrt' });
  box('darkwood', [DW, 0, 4.9], [DW + 0.12, DOOR.h + 0.12, DOOR.z1], { faces: 'fblrt' });
  box('darkwood', [-DW - 0.12, DOOR.h, 4.9], [DW + 0.12, DOOR.h + 0.12, DOOR.z1]);
  // ---- tables
  for (const t of TABLES) {
    box('counter', [t.x - 0.45, 0.74, t.z - 0.45], [t.x + 0.45, 0.79, t.z + 0.45], { tile: 0.5 });
    box('chrome', [t.x - 0.05, 0, t.z - 0.05], [t.x + 0.05, 0.74, t.z + 0.05], { faces: 'fblr' });
  }
  roomTris = flushStaticsAtlas(BAR_LIGHT);
  buildDoor();

  // dynamic signs: flickering neon + round sign
  const neonAcc = new GeoAcc();
  neonAcc.quad([[-2.3, 2.62, -4.96], [2.3, 2.62, -4.96], [2.3, 2.3, -4.96], [-2.3, 2.3, -4.96]], [[0.06, 0.15], [0.94, 0.15], [0.94, 0.85], [0.06, 0.85]], [0, 0, 1]);
  neonMat = makeMat('neon_tw', { emissive: true });
  scene.add(new THREE.Mesh(neonAcc.geometry(), neonMat));
  const rs = new GeoAcc();
  rs.quad([[0.42, 3.25, 4.94], [-0.42, 3.25, 4.94], [-0.42, 2.45, 4.94], [0.42, 2.45, 4.94]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 0, -1]);
  roundSignMat = makeMat('round1', { emissive: true });
  scene.add(new THREE.Mesh(rs.geometry(), roundSignMat));

  applyLights(BAR_LIGHT.lights, BAR_LIGHT.ambient);
}
// 6 point lights: baked into the room, live on goons, props and hands
const BAR_LIGHT = { ambient: [0.2, 0.13, 0.19], lights: [
  lightFromHex([0, 2.3, -4.2], '#ff4f9a', 5.0, 0.7),    // THE THREEWAY neon
  lightFromHex([0, 2.6, -3.0], '#e8352b', 6.0, 1.0),    // lanterns
  lightFromHex([-4.2, 2.1, 0.0], '#ff9a3c', 6.5, 1.5),  // sodium lamp
  lightFromHex([2.7, 1.8, 1.2], '#ffc870', 4.5, 1.5),   // pool lamp (green-glass banker's shade)
  lightFromHex([0, 2.6, 4.3], '#ffd8a0', 6.5, 1.3),     // round sign over the door
  lightFromHex([4.2, 2.0, -1.6], '#5a6cff', 4.0, 0.8),  // night window spill
] };
// the front door: hinged on its right edge (seen from inside), swings out onto the square
const DOOR = { w: 1.2, h: 2.3, z: 4.97, z1: 5.32, open: 0, target: 0 };
let doorPivot = null;
function buildDoor() {
  const acc = new GeoAcc(), DW = DOOR.w / 2;
  acc.quad([[DW, DOOR.h, 0], [-DW, DOOR.h, 0], [-DW, 0, 0], [DW, 0, 0]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 0, -1], 2);       // inside face
  acc.quad([[-DW, DOOR.h, 0.05], [DW, DOOR.h, 0.05], [DW, 0, 0.05], [-DW, 0, 0.05]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 0, 1], 2);   // street face
  const g = acc.geometry(); const pos = g.attributes.position.array;
  for (let i = 0; i < pos.length; i += 3) pos[i] -= DW;   // hinge at the local origin
  doorPivot = new THREE.Group(); doorPivot.position.set(DW, 0, DOOR.z);
  doorPivot.add(new THREE.Mesh(g, sharedMat('door')));
  scene.add(doorPivot);
}
function updateDoor(dt) {
  if (!doorPivot) return;
  DOOR.open += clamp(DOOR.target - DOOR.open, -dt * CFG.street.doorSpeed, dt * CFG.street.doorSpeed);
  doorPivot.rotation.y = DOOR.open * CFG.street.doorOpenDeg * DEG;
}
