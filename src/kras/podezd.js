'use strict';
// ============================== Act 1: podezd 3 (inside Superblock 14) =====================
// No stairs (VR): lifts do the climbing. Through the street door into the point block's lobby; lift A climbs and breaks
// down at the 7th; across the 7th through into the north wing, down its long communal corridor (a kitchen halfway), to
// lift B at the far end; up to the north wing's roof, the point block towering beside you; then the window-cleaner's
// cradle down the north face to the railway bank. World coordinates, like Superblock 14 (src/superblock/build.js).
const PZ = {
  x0: -19.7, x1: -6.3, z0: 118.3, front: 125.5,                       // the point block's inside (lobby, the 7th's landing)
  nw: [-45.7, -20.3, 122.5, 125.5], kitchen: [-34, -26, 118.4, 122.5], // the north wing's corridor and its kitchen, on the 7th
  link: [123, 125],                                                    // the doorway between the point block and the wing (z)
  seventh: 19.6, wingRoof: 33.6, lobbyH: 3.0, floorH: 2.9,
  mach: [-45.7, -42.5, 125.2, 128.4], roofZ1: 129.7,                   // lift B's machine room on the wing's roof; the roof's north edge
  cradle: [-38, -32, 129.6, 131.4], yard: [[-48, -20, 130.6, 137.5], [-20, -2, 132.6, 137.5]],
  gap: [-33, -27],                                                     // the gap in the bank's fence: the level crossing starts here (src/kras/palace.js)
  rail: [-122, -1, 129, 151],                                          // the railway bank and tracks (kept clear of the far city)
  inMesh: null, outMesh: null, lamps: [], outLamps: [],
};
// two lifts: A climbs from the lobby and breaks at the 7th; B climbs from the 7th to the wing's roof
const LIFTS = [
  { name: 'A', car: [-10.9, -9.1, 125.1, 127.8], stops: [0, 19.6], breaks: true, needs: [0], lock: 'pzLiftA' },
  { name: 'B', car: [-45.0, -43.2, 125.1, 127.8], stops: [19.6, 33.6], needs: [2], lock: 'pzLiftB' },
];
for (const L of LIFTS) Object.assign(L, { y: L.stops[0], stop: 0, phase: 'open', t: 0, doors: 1, rect: null, group: null, leaves: [], sparkT: 0 });
const CRADLE = { y: 33.6, phase: 'top', t: 0, rect: null, mesh: null };
const LOCKED = new Set();   // walk areas an encounter shuts while it's on (CFG.<level>.encounters[i].lock)
function pzLight(list, x, y, z, col, r, k) { const L = lightFromHex([x, y, z], col, r, k); list.push(L); return L; }
function pzSolid(x0, z0, x1, z1, y0, y1) { WORLD_BOXES.push([x0, y0, z0, x1, y1, z1]); BLOCKERS.push({ x0, x1, z0, z1, y0, y1 }); }
// walls of a room [x0, x1, z0, z1] at height y, facing in. gaps: { s|n|w|e: [[a, b, top], ...] } along that wall
function pzWalls(acc, key, [x0, x1, z0, z1], y, h, gaps = {}) {
  const run = (side, a0, a1, mk) => {   // a wall along one side, cut by its gaps (a doorway: from y up to y + top)
    const g = (gaps[side] || []).slice().sort((p, q) => p[0] - q[0]); let a = a0;
    for (const [ga, gb, top] of g) { if (ga > a) mk(a, ga, y, y + h); mk(ga, gb, y + top, y + h); a = gb; }
    if (a1 > a) mk(a, a1, y, y + h);
  };
  run('s', x0, x1, (a, b, ya, yb) => wall(acc, key, a, z0, b, z0, ya, yb, 2, 2.8));            // faces +z
  run('n', x0, x1, (a, b, ya, yb) => wall(acc, key, b, z1, a, z1, ya, yb, 2, 2.8));            // faces -z
  run('w', z0, z1, (a, b, ya, yb) => wall(acc, key, x0, b, x0, a, ya, yb, 2, 2.8));            // faces +x
  run('e', z0, z1, (a, b, ya, yb) => wall(acc, key, x1, a, x1, b, ya, yb, 2, 2.8));            // faces -x
}
function pzFloorCeil(acc, [x0, x1, z0, z1], y, h, floor = 'stairFloor') {
  ground(acc, floor, x0, z0, x1, z1, y + 0.004, 1.6);
  aq(acc, 'slabEnd', [x0, y + h, z1], [x1, y + h, z1], [x1, y + h, z0], [x0, y + h, z0], [0, 0, (x1 - x0) / 4, (z1 - z0) / 4], [0, -1, 0], 2);
}
function buildPodezdInside(acc) {
  const { x0, x1, z0, front, seventh: S, floorH: H } = PZ, A = LIFTS[0].car, B = LIFTS[1].car, [dx, dz] = SB.door, [l0, l1] = PZ.link;
  // ---- the lobby: mailboxes, a radiator, the stairs padlocked shut, a bare bulb
  const lobby = [x0, x1, z0, front];
  pzWalls(acc, 'stairWall', lobby, 0, PZ.lobbyH, { s: [[dx - 0.6, dx + 0.6, 2.2]], n: [[A[0], A[1], 2.2]] });
  pzFloorCeil(acc, lobby, 0, PZ.lobbyH);
  plate(acc, 'liftSign', (A[0] + A[1]) / 2, 2.5, front, 0.9, 0.28, Math.PI, 0.02);
  plate(acc, 'mailboxes', x0, 1.4, 121.5, 3.2, 1.6, Math.PI / 2, 0.06);
  sbox(acc, 'radiator', -7.0, 0.3, 120.4, 0.2, 1.6, 0.6, 0, { u: 0.8, v: 0.6 }); pzSolid(-7.2, 119.6, -6.3, 121.2, 0, 0.9);
  sbox(acc, 'iron', -18.1, 0, 124.9, 3.2, 0.06, 2.4, 0, { u: 1, v: 1, top: false }); plate(acc, 'outOfOrder', -18.1, 1.6, 124.85, 1.3, 0.32, Math.PI, 0.03);   // the stair gate
  for (const x of [-17, -8.5]) plate(acc, 'padDoor', x, 1.05, z0, 0.95, 2.1, 0, 0.02);
  // (the street door itself swings: src/doors.js, added by the Superblock's build)
  for (const s of [-1, 1]) wall(acc, 'concrete', dx + s * 0.6, dz + (s < 0 ? 0.3 : 0), dx + s * 0.6, dz + (s < 0 ? 0 : 0.3), 0, 2.2, 1, 1);
  aq(acc, 'concrete', [dx - 0.6, 2.2, dz], [dx + 0.6, 2.2, dz], [dx + 0.6, 2.2, z0], [dx - 0.6, 2.2, z0], [0, 0, 1, 1], [0, -1, 0], 2);
  sbox(acc, 'litWarm', -13, PZ.lobbyH - 0.15, 121.6, 0.25, 0.25, 0.15, 0, { u: 1, v: 1 });
  pzLight(PZ.lamps, -13, PZ.lobbyH - 0.35, 121.6, '#ffd8a0', 7.5, 1.4); pzLight(PZ.lamps, -10, 2.6, 124.6, '#ffe8c0', 4, 0.8);
  // ---- the 7th, point block side: a landing, lift A dead behind you, the way through to the wing on the west wall
  const land = [x0, x1, z0, front];
  pzWalls(acc, 'stairWall', land, S, H, { n: [[A[0], A[1], 2.2]], w: [[l0, l1, 2.2]] });
  pzFloorCeil(acc, land, S, H);
  plate(acc, 'outOfOrder', (A[0] + A[1]) / 2, S + 2.45, front, 1.2, 0.3, Math.PI, 0.02);
  plate(acc, 'floorNum', -7.6, S + 2.2, front, 0.36, 0.3, Math.PI, 0.02);
  for (const x of [-17, -12.5, -8]) plate(acc, 'windowNight', x, S + 1.55, z0, 1.1, 1.5, 0, 0.02);
  for (const z of [119.4, 122.6]) plate(acc, 'padDoor', x1, S + 1.05, z, 0.95, 2.1, -Math.PI / 2, 0.02);
  for (const [x, z, k] of [[-13, 121.8, 1.4], [-18, 124, 1.2], [-8, 124, 1.1]]) { pzLight(PZ.lamps, x, S + H - 0.3, z, '#ffd8a0', 7, k); sbox(acc, 'litWarm', x, S + H - 0.12, z, 0.25, 0.25, 0.12, 0, { u: 1, v: 1 }); }
  // the doorway through the party wall into the north wing
  wall(acc, 'concrete', -20.3, l0, x0, l0, S, S + 2.2, 1, 1); wall(acc, 'concrete', x0, l1, -20.3, l1, S, S + 2.2, 1, 1);
  aq(acc, 'concrete', [-20.3, S + 2.2, l1], [x0, S + 2.2, l1], [x0, S + 2.2, l0], [-20.3, S + 2.2, l0], [0, 0, 1, 1], [0, -1, 0], 2);
  ground(acc, 'stairFloor', -20.3, l0, x0, l1, S + 0.004, 1.6);
  // ---- the north wing's corridor on the 7th: padded doors both sides, bare bulbs, the kitchen halfway, lift B at the end
  const [k0, k1, kz0, kz1] = PZ.kitchen, cor = PZ.nw;
  pzWalls(acc, 'stairWall', cor, S, H, { s: [[k0, k1, 2.4]], n: [[B[0], B[1], 2.2]], e: [[l0, l1, 2.2]] });
  pzFloorCeil(acc, cor, S, H);
  for (let x = -42; x < -22; x += 3.2) { if (x > k0 - 0.6 && x < k1 + 0.6) continue; plate(acc, 'padDoor', x, S + 1.05, cor[2], 0.95, 2.1, 0, 0.02); }
  for (let x = -40.4; x < -22; x += 3.2) plate(acc, 'padDoor', x, S + 1.05, cor[3], 0.95, 2.1, Math.PI, 0.02);
  plate(acc, 'liftSign', (B[0] + B[1]) / 2, S + 2.5, cor[3], 0.9, 0.28, Math.PI, 0.02);
  for (const x of [-23.5, -30, -38, -43.5]) { sbox(acc, 'litWarm', x, S + H - 0.12, 124, 0.22, 0.22, 0.12, 0, { u: 1, v: 1 }); pzLight(PZ.lamps, x, S + H - 0.3, 124, '#ffd8a0', 6.5, 1.25); }
  plate(acc, 'laundry', -40, S + 2.1, 124, 4.5, 0.8, 0, 0, [0, 0, 1, 1], true);
  // the communal kitchen: tiles, two stoves, a table, a window on the courtyard, a fluorescent tube
  const kit = [k0, k1, kz0, kz1];
  pzWalls(acc, 'kitchenTile', kit, S, H, { n: [[k0, k1, 2.4]] });
  aq(acc, 'stairWall', [k0, S + H, kz1], [k1, S + H, kz1], [k1, S + 2.4, kz1], [k0, S + 2.4, kz1], [0, 0, 4, 0.2], [0, 0, 1], 4);   // over the opening, seen from the corridor
  pzFloorCeil(acc, kit, S, H);
  for (const x of [-32, -28]) plate(acc, 'windowNight', x, S + 1.55, kz0, 1.1, 1.5, 0, 0.02);
  for (const z of [119.4, 121.3]) { sbox(acc, 'stove', k0 + 0.4, S, z, 0.8, 0.8, 0.85, 0, { u: 0.8, v: 0.85, top: 'stove', tu: 0.8 }); pzSolid(k0, z - 0.4, k0 + 0.8, z + 0.4, S, S + 0.85); }
  sbox(acc, 'darkwood', -29.5, S, 120.4, 2.4, 1.1, 0.78, 0, { u: 1, v: 1 }); pzSolid(-30.7, 119.85, -28.3, 120.95, S, S + 0.78);
  for (const x of [-31, -28]) sbox(acc, 'darkwood', x, S, 121.4, 0.4, 0.4, 0.45, 0, { u: 1, v: 1 });
  sbox(acc, 'fluor', -30, S + H - 0.1, 120.4, 1.2, 0.2, 0.08, 0, { u: 1, v: 1 }); pzLight(PZ.lamps, -30, S + H - 0.3, 120.4, '#e8f4ff', 8, 1.3);
  // ---- the shafts, seen from the cars as they ride: bare concrete, the doorways going by
  for (const L of LIFTS) {
    const [a, b, c, d] = L.car, [y0, y1] = [L.stops[0], L.stops[L.stops.length - 1]];
    for (const [p, q] of [[a - 0.15, a], [b, b + 0.15]]) sbox(acc, 'concrete', (p + q) / 2, y0, (c + d) / 2, q - p, d - c, y1 - y0 + 2.4, 0, { u: 2, v: 2, top: false, cell: 6 });
    let yb = y0 + 2.2; for (const s of L.stops.slice(1)) { if (s > yb) wall(acc, 'concrete', a, PZ.front + 0.02, b, PZ.front + 0.02, yb, s, 2, 2); yb = s + 2.2; }
  }
}
function machineRoom(acc, [m0, m1, mz0, mz1], R, car) {   // a concrete hut over a lift shaft, its door facing -z
  wall(acc, 'concrete', m1, mz1, m0, mz1, R, R + 3, 2, 2); wall(acc, 'concrete', m0, mz1, m0, mz0, R, R + 3, 2, 2); wall(acc, 'concrete', m1, mz0, m1, mz1, R, R + 3, 2, 2);
  wall(acc, 'concrete', m0, mz0, car[0], mz0, R, R + 3, 2, 2); wall(acc, 'concrete', car[1], mz0, m1, mz0, R, R + 3, 2, 2); wall(acc, 'concrete', car[0], mz0, car[1], mz0, R + 2.2, R + 3, 2, 2);
  aq(acc, 'roofDark', [m0, R + 3, mz0], [m1, R + 3, mz0], [m1, R + 3, mz1], [m0, R + 3, mz1], [0, 0, 1, 1], [0, 1, 0], 4);
  for (const [a, b] of [[m0, car[0]], [car[1], m1]]) if (b - a > 0.05) pzSolid(a - 0.05, mz0 - 0.05, b + 0.05, mz1 + 0.05, R, R + 3);
}
function buildPodezdOutside(acc) {
  const R = PZ.wingRoof, rx0 = PZ.nw[0], rx1 = PZ.nw[1], rz0 = PZ.z0, rz1 = PZ.roofZ1, [c0, c1] = PZ.cradle, M = PZ.mach;
  // ---- the north wing's roof: parapet (a gap where the cradle hangs), lift B's machine room, aerials, a water tank
  for (const [a, b, c, d] of [[rx0, rz0, rx1, rz0 + 0.25], [rx0, rz0, rx0 + 0.25, rz1], [rx0, rz1 - 0.25, c0, rz1], [c1, rz1 - 0.25, rx1, rz1]])
    sbox(acc, 'concrete', (a + c) / 2, R, (b + d) / 2, c - a, d - b, 0.9, 0, { u: 2, v: 1, top: 'wallTop', tu: 1 });
  machineRoom(acc, M, R, LIFTS[1].car);
  for (const x of [M[0] + 0.5, M[1] + 0.3]) { sbox(acc, 'litWarm', x, R + 2.4, M[2] - 0.05, 0.2, 0.1, 0.2, 0, { u: 1, v: 1 }); }
  pzLight(PZ.outLamps, -43, R + 2.3, 124.4, '#ffd8a0', 9, 1.3); pzLight(PZ.outLamps, -30, R + 2.6, 124, '#ffd8a0', 10, 1.1);
  sbox(acc, 'litWarm', -30, R + 2.6, rz0 + 0.2, 0.3, 0.2, 0.2, 0, { u: 1, v: 1 });
  for (const [x, z, h] of [[-38, 120, 5], [-27, 127.5, 7], [-22.5, 120.5, 4.5]]) { sbox(acc, 'iron', x, R, z, 0.06, 0.06, h, 0, { u: 1, v: 1, top: false }); sbox(acc, 'iron', x, R + h - 0.6, z, 1.2, 0.04, 0.04, 0, { u: 1, v: 1 }); pzSolid(x - 0.1, z - 0.1, x + 0.1, z + 0.1, R, R + h); }
  cyl(acc, 'iron', -24, R, 127.8, 0.8, 0.8, 1.6, 8, { u: 2, v: 1 }); pzSolid(-24.8, 127, -23.2, 128.6, R, R + 1.6);
  plate(acc, 'laundry', -34, R + 1.4, 121.5, 4.5, 0.9, 0, 0, [0, 0, 1, 1], true);
  sbox(acc, 'litRed', -13, 61.9, 125, 0.3, 0.3, 0.3, 0, { u: 1, v: 1 });   // the point block's aviation light, over your shoulder
  // ---- the cradle's davits over the north edge, its cables down to the ground
  for (const x of [c0 + 0.3, c1 - 0.3]) {
    sbox(acc, 'iron', x, R, rz1 - 0.6, 0.14, 0.14, 2.6, 0, { u: 1, v: 1 }); sbox(acc, 'iron', x, R + 2.5, rz1 + 0.3, 0.12, 1.9, 0.12, 0, { u: 1, v: 1 });
    sbox(acc, 'iron', x, 0, rz1 + 1.2, 0.03, 0.03, R + 2.5, 0, { u: 1, v: 1, top: false, cell: 99 });
  }
  // ---- the railway bank below: gravel, a low fence, three tracks running west into the sector, a signal
  const [rr0, rr1, rq0, rq1] = PZ.rail, fz = PZ.yard[0][3];
  ground(acc, 'asphaltK', rr0, 130, rr1, fz + 0.3, 0, 4);
  for (const [a, b] of [[rr0, PZ.gap[0]], [PZ.gap[1], rr1]]) sbox(acc, 'concrete', (a + b) / 2, 0, fz + 0.15, b - a, 0.3, 1.2, 0, { u: 2, v: 1.2, top: 'wallTop', tu: 1 });   // a gap at the level crossing (src/kras/palace.js)
  for (const tz of [139.4, 143, 146.6]) aq(acc, 'track', [rr0, 0.012, tz + 1.2], [rr0, 0.012, tz - 1.2], [rr1, 0.012, tz - 1.2], [rr1, 0.012, tz + 1.2], [0, 0, 1, (rr1 - rr0) / 2], [0, 1, 0], 2);
  ground(acc, 'asphaltK', rr0, fz + 0.3, rr1, rq1, -0.005, 4);
  sbox(acc, 'iron', -24, 0, 148.6, 0.16, 0.16, 4.2, 0, { u: 1, v: 1 }); sbox(acc, 'litRed', -24, 3.8, 148.4, 0.3, 0.2, 0.3, 0, { u: 1, v: 1 });
  for (const x of [-44.5, -35, -8]) sodiumPost(acc, x, 136.6, 1);   // (the middle one lights the level crossing)
}
function liftCarMesh(L) {
  const acc = new GeoAcc(), [a, b, c, d] = L.car, A = a - 0.02, B = b + 0.02, H = 2.3;
  wall(acc, 'liftCar', A, d, B, d, 0, H, 1, 1); wall(acc, 'liftCar', B, c, B, d, 0, H, 1, 1); wall(acc, 'liftCar', A, d, A, c, 0, H, 1, 1);
  ground(acc, 'stairFloor', A, c, B, d, 0.01, 1.6);
  aq(acc, 'iron', [A, H, d], [B, H, d], [B, H, c], [A, H, c], [0, 0, 1, 1], [0, -1, 0], 2);
  sbox(acc, 'litWarm', (a + b) / 2, H - 0.08, (c + d) / 2 + 0.5, 0.5, 0.2, 0.06, 0, { u: 1, v: 1 });
  const g = new THREE.Group(), m = new THREE.Mesh(acc.geometry({ ambient: [0.62, 0.55, 0.45], lights: [] }), makeMat('street', { baked: true }));
  m.frustumCulled = false; g.add(m);
  for (const s of [-1, 1]) {   // two leaves that slide apart
    const la = new GeoAcc(); sbox(la, 'liftDoor', 0, 0, 0, (b - a) / 2, 0.05, 2.2, 0, { u: (b - a) / 2, v: 2.2 });
    const lm = new THREE.Mesh(la.geometry({ ambient: [0.5, 0.48, 0.42], lights: [] }), makeMat('street', { baked: true })); lm.frustumCulled = false;
    lm.userData.s = s; g.add(lm); L.leaves.push(lm);
  }
  scene.add(g); L.group = g;
}
function cradleMesh() {
  const acc = new GeoAcc(), [a, b, c, d] = PZ.cradle;
  sbox(acc, 'iron', (a + b) / 2, -0.12, (c + d) / 2 + 0.1, b - a, d - c, 0.12, 0, { u: 1, v: 1, top: 'tread', tu: 1 });
  for (const [x0, z0, x1, z1] of [[a, d, b, d], [a, c + 0.2, a, d], [b, c + 0.2, b, d]]) sbox(acc, 'iron', (x0 + x1) / 2, 0.95, (z0 + z1) / 2, Math.max(0.05, x1 - x0), Math.max(0.05, z1 - z0), 0.06, 0, { u: 1, v: 1 });
  for (const x of [a, b]) for (const z of [c + 0.2, d]) sbox(acc, 'iron', x, 0, z, 0.06, 0.06, 1.0, 0, { u: 1, v: 1, top: false });
  sbox(acc, 'litSodium', a + 0.3, 1.0, d, 0.25, 0.1, 0.2, 0, { u: 1, v: 1 });
  const m = new THREE.Mesh(acc.geometry({ ambient: [0.45, 0.4, 0.36], lights: [] }), makeMat('street', { baked: true }));
  m.frustumCulled = false; scene.add(m); CRADLE.mesh = m;
}
// called from buildStreet(): the insides (one baked mesh, drawn as a room), the wing's roof and the railway bank (one
// baked mesh, outside), the two lift cars and the cradle (small meshes that move)
function buildPodezd() {
  PZ.lamps = []; PZ.outLamps = [];
  const inAcc = new GeoAcc(), outAcc = new GeoAcc();
  buildPodezdInside(inAcc); buildPodezdOutside(outAcc);
  const F = CFG.street.fog, Lt = CFG.street.light;
  const mk = (acc, light) => { const m = new THREE.Mesh(acc.geometry(light), makeMat('street', { baked: true })); m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false; m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far }; scene.add(m); return m; };
  PZ.inMesh = mk(inAcc, { ambient: CFG.podezd.light.inAmbient, lights: PZ.lamps }); PZ.inTris = inAcc.tris;
  PZ.outMesh = mk(outAcc, { ambient: Lt.ambient, sky: Lt.sky, lights: PZ.outLamps.concat(SBX.lamps).concat(ST.lamps.filter(l => l[0][2] > 120)) }); PZ.outTris = outAcc.tris;
  for (const l of PZ.lamps.concat(PZ.outLamps)) ST.lamps.push(l);
  for (const L of LIFTS) liftCarMesh(L);
  cradleMesh();
  // where you can walk (podezd only): the door, the lobby, the 7th's landing, the link, the corridor and its kitchen, the
  // lift cars (their floors ride with them), the wing's roof around the machine room, the cradle, the railway bank
  const on = (area) => () => level.name === 'podezd' && !LOCKED.has(area), P = 0.3, S = PZ.seventh, R = PZ.wingRoof;
  const [dx, dz] = SB.door, [l0, l1] = PZ.link, [m0, m1, mz0, mz1] = PZ.mach, [k0, k1, kz0, kz1] = PZ.kitchen;
  for (const L of LIFTS) L.rect = { x0: L.car[0], x1: L.car[1], z0: L.car[2], z1: L.car[3], y: L.y + 0.001, pad: P, area: L.lock, on: () => level.name === 'podezd' && (liftInCar(L) || (L.phase !== 'moving' && L.phase !== 'closing' && !LOCKED.has(L.lock))) };
  CRADLE.rect = { x0: PZ.cradle[0], x1: PZ.cradle[1], z0: PZ.cradle[2], z1: PZ.cradle[3], y: R, pad: P, area: 'pzCradle', on: () => level.name === 'podezd' && (cradleIn() || !LOCKED.has('pzCradle')) };
  [ { x0: dx - 0.55, x1: dx + 0.55, z0: dz - 1.2, z1: dz + 1.0, pad: P, area: 'pzDoor', on: () => (level.name === 'superblock' && game.state === 'won') || (level.name === 'podezd' && !LOCKED.has('pzDoor')) },
    { x0: PZ.x0, x1: PZ.x1, z0: PZ.z0, z1: PZ.front, pad: P, area: 'pzLobby', on: on('pzLobby') },
    { x0: PZ.x0, x1: PZ.x1, z0: PZ.z0, z1: PZ.front, y: S, pad: P, area: 'pzSeventh', on: on('pzSeventh') },
    { x0: -20.6, x1: -19.4, z0: l0, z1: l1, y: S, pad: P, area: 'nwLink', on: on('nwLink') },
    { x0: PZ.nw[0], x1: PZ.nw[1], z0: PZ.nw[2], z1: PZ.nw[3], y: S, pad: P, area: 'nwCorridor', on: on('nwCorridor') },
    { x0: k0, x1: k1, z0: kz0, z1: kz1 + 0.4, y: S, pad: P, area: 'nwKitchen', on: on('nwCorridor') },
    ...LIFTS.map(L => L.rect),
    { x0: m1, x1: PZ.nw[1], z0: PZ.z0, z1: PZ.roofZ1, y: R, pad: P, area: 'nwRoofE', on: on('nwRoof') },
    { x0: PZ.nw[0], x1: m1, z0: PZ.z0, z1: mz0, y: R, pad: P, area: 'nwRoofS', on: on('nwRoof') },
    { x0: PZ.nw[0], x1: m1, z0: mz1, z1: PZ.roofZ1, y: R, pad: P, area: 'nwRoofN', on: on('nwRoof') },
    CRADLE.rect,
    ...PZ.yard.map(([a, b, c, d], i) => ({ x0: a, x1: b, z0: c, z1: d, pad: P, area: 'pzYard' + i, on: () => level.name === 'podezd' && CRADLE.phase === 'bottom' })),
  ].forEach(addWalk);
  resetPodezdRides();
}
function podezdRooms() {
  const inBlock = (p) => p.x > PZ.x0 - 0.35 && p.x < PZ.x1 + 0.35 && p.z > PZ.z0 - 0.35 && p.z < 132 && p.y < 60;
  const inWing = (p) => p.x > PZ.nw[0] - 0.35 && p.x < PZ.x0 && p.z > PZ.z0 - 0.35 && p.z < 130 && p.y < PZ.wingRoof - 0.6;
  addRoom('podezd', (p) => inBlock(p) || inWing(p));
  roomMeshes('podezd', PZ.inMesh, ...LIFTS.map(L => L.group));
  addPortal('outside', 'podezd', [SB.door[0], 1.2, SB.door[1]], () => level.name === 'podezd' || (level.name === 'superblock' && (game.state === 'won' || doorOpen('podezd3'))));
}
// ---- the rides
const liftInCar = (L) => { const h = player.head, [a, b, c, d] = L.car; return h.x > a - 0.05 && h.x < b + 0.05 && h.z > c + 0.15 && h.z < d + 0.1 && Math.abs(player.floorY - L.y) < 0.8; };
const cradleIn = () => { const h = player.head, [a, b, c, d] = PZ.cradle; return h.x > a && h.x < b && h.z > c + 0.25 && h.z < d + 0.1 && Math.abs(player.floorY - CRADLE.y) < 0.8; };
function resetPodezdRides(state) {   // state: 'start' (both lifts at their first stop), 'broken' (A stuck at the 7th), 'roof' (B up top)
  for (const L of LIFTS) { L.stop = 0; L.phase = 'open'; L.doors = 1; L.t = 0; }
  if (state === 'broken' || state === 'roof') { const A = LIFTS[0]; A.stop = 1; A.phase = 'broken'; A.doors = 0.55; }
  if (state === 'roof') LIFTS[1].stop = 1;
  for (const L of LIFTS) { L.y = L.stops[L.stop]; if (L.rect) L.rect.y = L.y + 0.001; }
  CRADLE.y = PZ.wingRoof; CRADLE.phase = 'top'; CRADLE.t = 0; if (CRADLE.rect) CRADLE.rect.y = CRADLE.y;
  CFG.floors.maxRise = CFG.podezd.restRise; placeRides();
}
function placeRides() {
  for (const L of LIFTS) {
    if (!L.group) continue;
    L.group.position.y = L.y; L.group.updateMatrixWorld(true);
    const [a, b, c] = L.car, half = (b - a) / 2, mid = (a + b) / 2;
    for (const lm of L.leaves) { lm.position.set(mid + lm.userData.s * half * (0.5 + L.doors * 0.98), 0, c + 0.06); lm.updateMatrixWorld(true); }
  }
  if (CRADLE.mesh) { CRADLE.mesh.position.y = CRADLE.y; CRADLE.mesh.updateMatrixWorld(true); }
}
function ride(obj, target, speed, dt) {   // eased: speed up, cruise, slow into the stop
  const d = target - obj.y, v = Math.sign(d) * Math.min(speed, Math.abs(d) * 1.6 + 0.25, (obj.t += dt) * 2.2 + 0.2);
  obj.y = Math.abs(d) <= Math.abs(v * dt) ? target : obj.y + v * dt;
  return obj.y === target;
}
function updatePodezd(dt) {
  const C = CFG.podezd;
  for (const L of LIFTS) {
    const inCar = liftInCar(L);
    if (L.phase === 'open' && inCar && L.stop < L.stops.length - 1 && L.needs.every(i => level.encounter >= i) && game.state === 'walk') { L.phase = 'closing'; L.t = 0; AU.bell(); }
    else if (L.phase === 'closing') { L.doors = Math.max(0, L.doors - dt / C.doorTime); if (L.doors === 0) { L.phase = 'moving'; L.t = 0; CFG.floors.maxRise = C.liftSpeed * 1.6; } }
    else if (L.phase === 'moving') { if (ride(L, L.stops[L.stop + 1], C.liftSpeed, dt)) { L.stop++; L.phase = 'opening'; L.t = 0; AU.bell(); if (L.breaks) { showSign('liftBroke', 2.4); L.sparkT = 2.5; } else showSign('wingRoof', 1.8); } }
    else if (L.phase === 'opening') {   // a breaking lift jams half open, sparks, and gives up
      L.doors = Math.min(L.breaks ? 0.55 : 1, L.doors + dt / (C.doorTime * (L.breaks ? 2.5 : 1)));
      if (L.doors >= (L.breaks ? 0.55 : 1)) { L.phase = L.breaks ? 'broken' : 'open'; CFG.floors.maxRise = C.restRise; }
    }
    if (L.sparkT > 0) {
      L.sparkT -= dt;
      if (Math.random() < dt * 9) { AU.wood(); fx(['fx_spark'], new V3((L.car[0] + L.car[1]) / 2 + rand(-0.6, 0.6), L.y + 2.25, L.car[2] + rand(0, 0.4)), { life: 0.35, rise: -1.5, scale: 0.008 }); }
    }
    L.rect.y = L.y + 0.001;
  }
  // the cradle: once the roof is clear, step in and it lowers you down the north face
  const last = stageCfg().encounters.length - 1;
  if (CRADLE.phase === 'top' && cradleIn() && level.encounter === last && game.state === 'walk') { CRADLE.phase = 'wait'; CRADLE.t = 0; }
  else if (CRADLE.phase === 'wait' && (CRADLE.t += dt) > 1.0) { CRADLE.phase = 'down'; CRADLE.t = 0; CFG.floors.maxRise = C.cradleSpeed * 1.6; showSign('cradle', 2.0); }
  else if (CRADLE.phase === 'down' && ride(CRADLE, 0, C.cradleSpeed, dt)) { CRADLE.phase = 'bottom'; CFG.floors.maxRise = C.restRise; game.state = 'won'; game.timer = 0; showSign('railway', 1e9); AU.bell(); }
  CRADLE.rect.y = CRADLE.y;
  placeRides();
}
defineLevel('podezd', {
  menu: '4 · Podezd 3 (the lifts, the 7th, the roof)', cfg: () => CFG.podezd, build: buildPodezd, rooms: podezdRooms,
  outside: () => [PZ.outMesh, CRADLE.mesh, ...LIFTS.map(L => L.group)], rects: [PZ.rail],
  start: (f) => startPodezd(f), update: (dt) => updatePodezd(dt),
  after: 'superblock', enter: () => player.head.z > SB.door[1] + 0.5,                        // through the street door
  signs: { lobby: ['FIGHT!', '#f2c14e'], seventh: ['FIGHT!', '#f2c14e'], kitchen: ['THE KITCHEN', '#ff9a3c'], roofFight: ['THE ROOF', '#ff4f9a'],
           liftBroke: ['THE LIFT IS DEAD', '#e8352b'], wingRoof: ['THE ROOF', '#33e0d0'], cradle: ['GOING DOWN', '#33e0d0'], railway: ['TO THE PALACE OF SPORT', '#33e0d0'] },
  hud: { walk: 'Podezd 3 — take the lift', won: 'Down at the railway — the Palace of Sport is next (R to restart)', short: 'Podezd' },
});
function startPodezd(fromCourtyard) {
  level.name = 'podezd'; level.encounter = -1; level.arena = null; LOCKED.clear();
  clearEnemies(); resetPodezdRides('start');
  const held = new Set(handList.map(h => h.held));
  if (!fromCourtyard) { DOOR.target = 1; DOOR.open = 1; player.hp = CFG.player.health; player.hurtT = 0; game.catches = 0; game.disarms = 0; }
  for (const p of props.slice()) if (!held.has(p)) { scene.remove(p.obj); p.body.remove(); p.alive = false; props.splice(props.indexOf(p), 1); }
  for (const [type, x, z, y] of CFG.podezd.props) new Prop(type, new V3(x, y || 0, z));
  if (!fromCourtyard) { placePlayer(CFG.podezd.start[0], CFG.podezd.start[1], Math.PI); rig.position.y = 0; }
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  showSign('podezd', 2.0);
}
