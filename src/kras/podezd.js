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
  bankFine: -52,                                                       // east of this the bank's ground is cut fine (the lamps' pools)
  flat: [-19.7, -15.0, 118.3, 120.9],                                  // flat 1 in the lobby's corner: the kitchen you see from the yard
  kitWin: [-30.5, -27.5],                                              // the kitchen's windows: the same bays as on the wing's face outside
  aerials: [[-38, 120.2, 5, 0.3], [-27, 127.5, 7, -0.2], [-22.5, 120.5, 4.5, 0.6], [-41.6, 128.9, 3.6, -0.5], [-33.5, 119.0, 4.2, 0.1],
            [-29.5, 129.1, 3.2, 0.8], [-25.8, 119.1, 3.8, -0.4], [-20.9, 124.0, 5.6, 0.2], [-31.8, 123.4, 2.8, -0.7]],   // [x, z, height, turn]
  vents: [[-35.2, 119.2], [-21.4, 126.8]],
  upFrom: 6,                                                           // the 7th and the wing are drawn with your eye above this (m)
  inMesh: null, upMesh: null, outMesh: null, roofMesh: null, lamps: [], outLamps: [], parts: {},
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
// ---- inside. PZ.inMesh (a room) is the lobby and the shafts; its child PZ.upMesh is the 7th, the north wing's corridor and
// its kitchen, drawn only with your eye above PZ.upFrom (the lobby and the courtyard can't see up there, and the lobby
// shows through the street door from the yard)
function pzPot(acc, x, y, z, r, h, tint) { acc.tint = tint; cyl(acc, 'white', x, y, z, r, r, h, 6, { u: 1, v: 1, cell: 99 }); cyl(acc, 'white', x, y + h, z, r * 1.05, 0.03, 0.05, 6, { u: 1, v: 1, cell: 99 }); acc.tint = [1, 1, 1]; }
function pzPlants(acc, x, y, z, n, s = 1) {   // a babushka's pots: terracotta, a geranium in each (crossed cut-out leaves)
  for (let k = 0; k < n; k++) { const px = x, pz = z + (k - (n - 1) / 2) * 0.3 * s; pzPot(acc, px, y, pz, 0.1, 0.16, [0.72, 0.4, 0.26]);
    for (const a of [0.3, 1.9]) plate(acc, 'pzPlant', px, y + 0.38, pz, 0.42 * s, 0.42 * s, a, 0, [0, 0, 1, 1], true); }
}
function buildPodezdInside(acc, up) {
  const { x0, x1, z0, front, seventh: S, floorH: H } = PZ, A = LIFTS[0].car, B = LIFTS[1].car, [dx, dz] = SB.door, [l0, l1] = PZ.link;
  // ---- the lobby: green oil paint to the dado, one tired fluorescent tube, the dented mailboxes, the notice board, the
  // babushka's geraniums by the radiator, the stairs shut; flat 1's door in the corner, its TV blue under the door (it's
  // the kitchen you saw from the yard, the parade on its set)
  const lobby = [x0, x1, z0, front], [f0, f1, fz0, fz1] = PZ.flat;
  pzWalls(acc, 'stairWall', lobby, 0, PZ.lobbyH, { s: [[dx - 0.6, dx + 0.6, 2.2]], n: [[A[0], A[1], 2.2]] });
  pzFloorCeil(acc, lobby, 0, PZ.lobbyH);
  wall(acc, 'stairWall', f1, fz0, f1, fz1, 0, PZ.lobbyH, 2, 2.8); wall(acc, 'stairWall', f1, fz1, f0, fz1, 0, PZ.lobbyH, 2, 2.8);
  pzSolid(f0, fz0, f1, fz1, 0, PZ.lobbyH);
  plate(acc, 'padDoor', f1, 1.05, fz0 + 1.25, 0.95, 2.1, Math.PI / 2, 0.02);
  aq(acc, 'pzTVGlow', [f1 + 0.02, 0.006, fz0 + 1.7], [f1 + 0.02, 0.006, fz0 + 0.8], [f1 + 0.32, 0.006, fz0 + 0.8], [f1 + 0.32, 0.006, fz0 + 1.7], [0, 0, 1, 1], [0, 1, 0], 99);
  pzLight(PZ.lamps, f1 + 0.4, 0.25, fz0 + 1.25, '#7a9aff', 1.8, 0.6);
  plate(acc, 'liftSign', (A[0] + A[1]) / 2, 2.5, front, 0.9, 0.28, Math.PI, 0.02);
  plate(acc, 'pzMail', x0, 1.45, 123.2, 2.4, 1.2, Math.PI / 2, 0.05);
  plate(acc, 'pzNotice', -14.0, 1.55, front, 1.6, 0.96, Math.PI, 0.02);
  sbox(acc, 'radiator', -7.0, 0.3, 120.4, 0.2, 1.6, 0.6, 0, { u: 0.8, v: 0.6 }); pzSolid(-7.2, 119.6, -6.3, 121.2, 0, 0.9);
  sbox(acc, 'darkwood', -6.65, 0, 122.6, 0.5, 0.7, 0.68, 0, { u: 1, v: 1, cell: 99 }); pzPlants(acc, -6.65, 0.68, 122.6, 2); pzSolid(-6.95, 122.2, -6.3, 123.0, 0, 0.9);
  sbox(acc, 'iron', -18.1, 0, 124.9, 3.2, 0.06, 2.4, 0, { u: 1, v: 1, top: false }); plate(acc, 'pzStairs', -18.1, 1.6, 124.85, 1.6, 0.2, Math.PI, 0.03);   // the stair gate
  plate(acc, 'padDoor', -8.5, 1.05, z0, 0.95, 2.1, 0, 0.02);
  aq(acc, 'pzMat', [dx - 0.6, 0.006, z0 + 0.9], [dx + 0.6, 0.006, z0 + 0.9], [dx + 0.6, 0.006, z0 + 0.3], [dx - 0.6, 0.006, z0 + 0.3], [0, 0, 1, 1], [0, 1, 0], 99);
  // (the street door itself swings: src/doors.js, added by the Superblock's build)
  for (const s of [-1, 1]) wall(acc, 'concrete', dx + s * 0.6, dz + (s < 0 ? 0.3 : 0), dx + s * 0.6, dz + (s < 0 ? 0 : 0.3), 0, 2.2, 1, 1);
  aq(acc, 'concrete', [dx - 0.6, 2.2, dz], [dx + 0.6, 2.2, dz], [dx + 0.6, 2.2, z0], [dx - 0.6, 2.2, z0], [0, 0, 1, 1], [0, -1, 0], 2);
  sbox(acc, 'pzTube', -12.6, PZ.lobbyH - 0.1, 122.0, 1.2, 0.12, 0.07, 0, { u: 1.2, v: 0.12, top: false, cell: 99 });
  pzLight(PZ.lamps, -12.6, PZ.lobbyH - 0.4, 122.0, '#d8eee8', 9, 1.5); pzLight(PZ.lamps, -10, 2.6, 124.6, '#ffe0b0', 4, 0.8);
  // ---- the 7th, point block side: a landing, lift A dead behind you (a resident's note: USE LIFT B), LIFT B stencilled
  // toward the way through to the wing, a pram, a child's bicycle, a rubber plant
  const land = [x0, x1, z0, front];
  pzWalls(up, 'stairWall', land, S, H, { n: [[A[0], A[1], 2.2]], w: [[l0, l1, 2.2]] });
  pzFloorCeil(up, land, S, H);
  plate(up, 'outOfOrder', (A[0] + A[1]) / 2, S + 2.45, front, 1.2, 0.3, Math.PI, 0.02);
  plate(up, 'pzNoteLift', A[0] - 0.6, S + 1.5, front, 0.66, 0.36, Math.PI, 0.02);
  plate(up, 'pzArrow', -16.4, S + 1.85, front, 1.75, 0.5, Math.PI, 0.02, [1, 0, 0, 1]);
  plate(up, 'floorNum', -7.6, S + 2.2, front, 0.36, 0.3, Math.PI, 0.02);
  for (const x of [-16.5, -13.5, -10.5]) plate(up, 'windowNight', x, S + 1.6, z0, 1.1, 1.5, 0, 0.02);
  for (const z of [119.4, 122.6]) { plate(up, 'padDoor', x1, S + 1.05, z, 0.95, 2.1, -Math.PI / 2, 0.02); aq(up, 'pzMat', [x1 - 0.6, S + 0.006, z - 0.5], [x1 - 0.6, S + 0.006, z + 0.5], [x1 - 0.05, S + 0.006, z + 0.5], [x1 - 0.05, S + 0.006, z - 0.5], [0, 0, 1, 1], [0, 1, 0], 99); }
  { const px = -7.3, pz = 121.0;   // the pram
    for (const [sx, sz] of [[-0.3, -0.18], [0.3, -0.18], [0.3, 0.18], [-0.3, 0.18]]) sbox(up, 'black', px + sx, S, pz + sz, 0.16, 0.05, 0.16, 0, { u: 1, v: 1, cell: 99 });
    sbox(up, 'padBlue', px, S + 0.3, pz, 0.8, 0.44, 0.36, 0, { u: 1, v: 1, cell: 99 }); frustum(up, 'padBlue', px - 0.25, S + 0.66, pz, 0.3, 0.44, 0.05, 0.4, 0.28, 0, { u: 1, v: 1, cell: 99 });
    sbBeam(up, 'iron', [px + 0.4, S + 0.62, pz], [px + 0.62, S + 0.98, pz], 0.03); pzSolid(px - 0.45, pz - 0.28, px + 0.66, pz + 0.28, S, S + 1.0); }
  plate(up, 'pzBike', -12.0, S + 0.44, z0 + 0.12, 1.4, 0.875, 0, 0, [0, 0, 1, 1], true); pzSolid(-12.7, z0, -11.3, z0 + 0.3, S, S + 0.9);
  pzPot(up, -19.2, S, 119.0, 0.2, 0.36, [0.6, 0.34, 0.22]); for (const a of [0.2, 1.4, 2.5]) plate(up, 'pzPlant', -19.2, S + 0.9, 119.0, 0.8, 1.1, a, 0, [0, 0, 1, 1], true); pzSolid(-19.5, 118.7, -18.9, 119.3, S, S + 1.4);
  for (const [x, z, k] of [[-13, 121.8, 1.4], [-18, 124, 1.2], [-8, 124, 1.1]]) { pzLight(PZ.lamps, x, S + H - 0.3, z, '#ffd8a0', 7, k); sbox(up, 'litWarm', x, S + H - 0.12, z, 0.25, 0.25, 0.12, 0, { u: 1, v: 1 }); }
  // the doorway through the party wall into the north wing
  wall(up, 'concrete', -20.3, l0, x0, l0, S, S + 2.2, 1, 1); wall(up, 'concrete', x0, l1, -20.3, l1, S, S + 2.2, 1, 1);
  aq(up, 'concrete', [-20.3, S + 2.2, l1], [x0, S + 2.2, l1], [x0, S + 2.2, l0], [-20.3, S + 2.2, l0], [0, 0, 1, 1], [0, -1, 0], 2);
  ground(up, 'stairFloor', -20.3, l0, x0, l1, S + 0.004, 1.6);
  // ---- the north wing's corridor on the 7th: padded doors both sides with their mats, bare bulbs, the wall newspaper, a
  // child's bike, washing, the kitchen halfway, lift B at the end with its call button lit
  const [k0, k1, kz0, kz1] = PZ.kitchen, cor = PZ.nw;
  pzWalls(up, 'stairWall', cor, S, H, { s: [[k0, k1, 2.4]], n: [[B[0], B[1], 2.2]], e: [[l0, l1, 2.2]] });
  pzFloorCeil(up, cor, S, H);
  for (let x = -42; x < -22; x += 3.2) { if (x > k0 - 0.6 && x < k1 + 0.6) continue; plate(up, 'padDoor', x, S + 1.05, cor[2], 0.95, 2.1, 0, 0.02); aq(up, 'pzMat', [x - 0.45, S + 0.006, cor[2] + 0.6], [x + 0.45, S + 0.006, cor[2] + 0.6], [x + 0.45, S + 0.006, cor[2] + 0.05], [x - 0.45, S + 0.006, cor[2] + 0.05], [0, 0, 1, 1], [0, 1, 0], 99); }
  for (let x = -40.4; x < -22; x += 3.2) plate(up, 'padDoor', x, S + 1.05, cor[3], 0.95, 2.1, Math.PI, 0.02);
  plate(up, 'pzWallNews', -29.2, S + 1.5, cor[3], 1.6, 0.8, Math.PI, 0.02);
  plate(up, 'pzBike', -35.6, S + 0.44, cor[3] - 0.12, 1.4, 0.875, Math.PI, 0, [0, 0, 1, 1], true); pzSolid(-36.3, cor[3] - 0.3, -34.9, cor[3], S, S + 0.9);
  plate(up, 'liftSign', (B[0] + B[1]) / 2, S + 2.5, cor[3], 0.9, 0.28, Math.PI, 0.02);
  sbox(up, 'litWarm', B[1] + 0.3, S + 1.2, cor[3] - 0.02, 0.08, 0.04, 0.12, 0, { u: 1, v: 1 });
  for (const [x, k] of [[-23.5, 1.25], [-30, 1.25], [-38, 0.95], [-43.5, 1.35]]) { sbox(up, 'litWarm', x, S + H - 0.12, 124, 0.22, 0.22, 0.12, 0, { u: 1, v: 1 }); pzLight(PZ.lamps, x, S + H - 0.3, 124, '#ffd8a0', 6.5, k); }
  plate(up, 'laundry', -40, S + 2.1, 124, 4.5, 0.8, 0, 0, [0, 0, 1, 1], true);
  // ---- the communal kitchen, the hero room: four stoves and a pot on every lit ring, steam, a table laid on oilcloth
  // under an orange shade, the radio's dial glowing on its shelf, washing on lines overhead, the geyser and the sink, jars
  // on the shelves, May on the calendar, the windows over the yard (the rocket lit down there); a tube's cold light
  const kit = [k0, k1, kz0, kz1];
  pzWalls(up, 'kitchenTile', kit, S, H, { n: [[k0, k1, 2.4]] });
  aq(up, 'stairWall', [k0, S + H, kz1], [k1, S + H, kz1], [k1, S + 2.4, kz1], [k0, S + 2.4, kz1], [0, 0, 4, 0.2], [0, 0, 1], 4);   // over the opening, seen from the corridor
  pzFloorCeil(up, kit, S, H);
  for (const x of PZ.kitWin) plate(up, 'pzKitchenWin', x, S + 1.6, kz0, 1.1, 1.5, 0, 0.02);
  plate(up, 'pzCalendar', (PZ.kitWin[0] + PZ.kitWin[1]) / 2, S + 1.7, kz0, 0.42, 0.56, 0, 0.02);
  const pots = [[0.6, 0.18, [0.78, 0.2, 0.16]], [0.6, 0.12, [0.9, 0.88, 0.84]], [0.2, 0.1, [0.24, 0.42, 0.68]], [0.7, 0.14, [0.3, 0.55, 0.36]]];
  for (let i = 0; i < 4; i++) {
    const z = 118.85 + i * 0.8, x = k0 + 0.35;
    sbox(up, 'stoveFront', x, S, z, 0.7, 0.75, 0.85, 0, { u: 0.75, v: 0.85, top: 'stove', tu: 0.75, cell: 99 });
    for (const [j, dxp, dzp] of [[0, -0.14, -0.17], [1, 0.14, 0.17]]) {
      const [, , tint] = pots[(i + j) % 4], h = pots[(i + j) % 4][1] + 0.08, px = x + dxp, pzz = z + dzp;
      aq(up, 'pzFlame', [px - 0.16, S + 0.856, pzz + 0.16], [px + 0.16, S + 0.856, pzz + 0.16], [px + 0.16, S + 0.856, pzz - 0.16], [px - 0.16, S + 0.856, pzz - 0.16], [0, 0, 1, 1], [0, 1, 0], 99);
      pzPot(up, px, S + 0.86, pzz, 0.12, h, tint);
      if ((i + j) % 2 === 0) for (const a of [0.4, 2.0]) plate(up, 'pzSteam', px, S + 0.86 + h + 0.42, pzz, 0.34, 0.8, a, 0, [0, 0, 1, 1], true);
    }
  }
  pzSolid(k0, 118.45, k0 + 0.72, 121.65, S, S + 0.85); pzLight(PZ.lamps, k0 + 0.5, S + 1.0, 120.0, '#6a9aff', 2.4, 0.5);   // the rings' blue
  sbox(up, 'darkwood', -29.5, S, 120.4, 2.4, 1.1, 0.78, 0, { u: 1, v: 1, top: 'pzOilcloth', tu: 0.8, cell: 99 }); pzSolid(-30.7, 119.85, -28.3, 120.95, S, S + 0.78);
  up.tint = [0.94, 0.92, 0.86]; for (const [x, z] of [[-30.4, 120.1], [-29.5, 120.7], [-28.6, 120.1], [-30.2, 120.75]]) sbox(up, 'white', x, S + 0.78, z, 0.24, 0.24, 0.02, 0, { u: 1, v: 1, cell: 99 });
  for (const [x, z] of [[-30.1, 120.25], [-28.9, 120.3]]) cyl(up, 'white', x, S + 0.78, z, 0.04, 0.045, 0.09, 5, { u: 1, v: 1, cell: 99 }); up.tint = [1, 1, 1];
  cyl(up, 'gilt', -29.0, S + 0.78, 120.65, 0.13, 0.11, 0.32, 6, { u: 1, v: 1, cell: 99 }); cyl(up, 'gilt', -29.0, S + 1.1, 120.65, 0.06, 0.02, 0.08, 6, { u: 1, v: 1, cell: 99 });   // the tea urn
  sbox(up, 'darkwood', -29.7, S + 0.78, 120.55, 0.3, 0.14, 0.12, 0.4, { u: 1, v: 1, cell: 99 });   // a loaf
  for (const x of [-31, -28]) sbox(up, 'darkwood', x, S, 121.4, 0.4, 0.4, 0.45, 0, { u: 1, v: 1 });
  sbBeam(up, 'black', [-29.5, S + H, 120.4], [-29.5, S + 2.45, 120.4], 0.015);
  frustum(up, 'pzShade', -29.5, S + 2.15, 120.4, 0.62, 0.62, 0.16, 0.16, 0.3, 0.4, { u: 0.6, v: 0.3, top: false, cell: 99 });
  pzLight(PZ.lamps, -29.5, S + 2.0, 120.4, '#ffb868', 3.6, 1.2);
  sbox(up, 'fluor', -30, S + H - 0.1, 119.3, 1.2, 0.2, 0.08, 0, { u: 1, v: 1 }); pzLight(PZ.lamps, -30, S + H - 0.3, 119.3, '#e0f0ec', 8, 1.1);
  for (const z of [119.0, 121.7]) { sbBeam(up, 'black', [k0 + 0.05, S + 2.55, z], [k1 - 0.05, S + 2.55, z], 0.012); plate(up, 'laundry', (k0 + k1) / 2 + (z > 120 ? 0.6 : -0.4), S + 2.27, z, 5.4, 0.56, 0, 0, [z > 120 ? 1 : 0, 0, z > 120 ? 0 : 1, 1], true); }
  up.tint = [0.86, 0.86, 0.84]; sbox(up, 'white', k1 - 0.3, S, 119.4, 0.6, 0.6, 0.86, 0, { u: 1, v: 1, cell: 99 }); up.tint = [1, 1, 1]; pzSolid(k1 - 0.6, 119.1, k1, 119.7, S, S + 0.9);
  plate(up, 'pzGeyser', k1, S + 1.7, 119.4, 0.46, 0.7, -Math.PI / 2, 0.08);
  plate(up, 'pzShelf', k1, S + 1.75, 120.95, 1.2, 0.6, -Math.PI / 2, 0.12); sbox(up, 'darkwood', k1 - 0.12, S + 1.43, 120.95, 0.24, 1.2, 0.03, 0, { u: 1, v: 1, cell: 99 });
  sbox(up, 'darkwood', k1 - 0.17, S + 1.35, 122.0, 0.34, 0.7, 0.04, 0, { u: 1, v: 1, cell: 99 });
  sbox(up, 'darkwood', k1 - 0.16, S + 1.39, 122.0, 0.26, 0.6, 0.4, 0, { u: 0.6, v: 0.4, top: 'darkwood', cell: 99, faceKey: { l: 'pzRadio' } });
  pzLight(PZ.lamps, k1 - 0.6, S + 1.6, 122.0, '#ffb050', 2.2, 0.6);
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
// ---- outside. PZ.outMesh (drawn from everywhere outside) is the railway bank and the cradle's cables; its child
// PZ.roofMesh is the wing's roof and everything on it (three culls it out of view; it's hidden past the fog), so the roof's
// aerial forest costs nothing from the courtyard looking north or from the crossing looking at the Palace
function buildPodezdOutside(acc, roof) {
  const R = PZ.wingRoof, rx0 = PZ.nw[0], rx1 = PZ.nw[1], rz0 = PZ.z0, rz1 = PZ.roofZ1, [c0, c1] = PZ.cradle, M = PZ.mach;
  // ---- the north wing's roof, the reveal: tar and gravel lit in pools, the parapet (a gap where the cradle hangs), lift B's
  // machine room (its window lit, DANGER on the door), a forest of TV aerials on this roof and the west wing's, vent
  // stacks, a water tank, washing; the point block towering beside you, the Tower of Labor and its searchlights ahead
  ground(roof, 'roofGravel', rx0, rz0, rx1, rz1, R + 0.006, 4, { cell: 2.6 });
  for (const [a, b, c, d] of [[rx0, rz0, rx1, rz0 + 0.25], [rx0, rz0, rx0 + 0.25, rz1], [rx0, rz1 - 0.25, c0, rz1], [c1, rz1 - 0.25, rx1, rz1]])
    sbox(roof, 'concrete', (a + c) / 2, R, (b + d) / 2, c - a, d - b, 0.9, 0, { u: 2, v: 1, top: 'wallTop', tu: 1 });
  machineRoom(roof, M, R, LIFTS[1].car);
  for (const x of [M[0] + 0.5, M[1] + 0.3]) { sbox(roof, 'litWarm', x, R + 2.4, M[2] - 0.05, 0.2, 0.1, 0.2, 0, { u: 1, v: 1 }); }
  plate(roof, 'pzMachineWin', M[1], R + 1.9, (M[2] + M[3]) / 2, 0.8, 0.6, Math.PI / 2, 0.02); plate(roof, 'pzDanger', M[1] - 0.35, R + 1.5, M[2], 0.36, 0.24, Math.PI, 0.02);
  pzLight(PZ.outLamps, -43, R + 2.3, 124.4, '#ffd8a0', 9, 1.5); pzLight(PZ.outLamps, -30, R + 2.6, 119.6, '#ffd8a0', 11, 1.6); pzLight(PZ.outLamps, -23.5, R + 2.6, 127.6, '#ffd8a0', 9, 1.4);
  for (const [x, z] of [[-30, rz0 + 0.12], [-23.5, rz1 - 0.12]]) { sbox(roof, 'iron', x, R + 0.9, z, 0.07, 0.07, 1.9, 0, { u: 1, v: 1, top: false, cell: 99 }); sbox(roof, 'litWarm', x, R + 2.8, z + (z < 124 ? 0.25 : -0.25), 0.3, 0.2, 0.2, 0, { u: 1, v: 1 }); }
  for (const [x, z, h, phi] of PZ.aerials) { sbAerial(roof, x, R, z, h, phi); pzSolid(x - 0.1, z - 0.1, x + 0.1, z + 0.1, R, R + h); }
  for (const [x, z, h, phi] of [[-44, 95, 3.2, 0.2], [-40, 99.5, 4, -0.5], [-36.2, 104, 2.8, 0.7], [-43, 108.5, 3.6, 0.1], [-38.5, 113, 3, -0.3], [-35.6, 95.8, 2.4, 0.4]]) sbAerial(roof, x, R, z, h, phi);   // the west wing's
  for (const [x, z] of PZ.vents) { sbox(roof, 'concrete', x, R, z, 0.8, 0.8, 1.1, 0, { u: 1, v: 1, top: 'roofDark', cell: 99 }); pzSolid(x - 0.4, z - 0.4, x + 0.4, z + 0.4, R, R + 1.1); }
  cyl(roof, 'iron', -24, R, 127.8, 0.8, 0.8, 1.6, 8, { u: 2, v: 1 }); pzSolid(-24.8, 127, -23.2, 128.6, R, R + 1.6);
  plate(roof, 'laundry', -34, R + 1.4, 121.5, 4.5, 0.9, 0, 0, [0, 0, 1, 1], true);
  // ---- the cradle's davits over the north edge, a lamp on them; its cables down to the ground
  for (const x of [c0 + 0.3, c1 - 0.3]) { sbox(roof, 'iron', x, R, rz1 - 0.6, 0.14, 0.14, 2.6, 0, { u: 1, v: 1 }); sbox(roof, 'iron', x, R + 2.5, rz1 + 0.3, 0.12, 1.9, 0.12, 0, { u: 1, v: 1 }); }
  sbox(roof, 'litSodium', (c0 + c1) / 2, R + 2.45, rz1 + 0.2, 0.4, 0.2, 0.12, 0, { u: 1, v: 1 }); pzLight(PZ.outLamps, (c0 + c1) / 2, R + 2.2, rz1 + 0.3, CFG.street.light.sodium, 5, 1.0);
  for (const x of [c0 + 0.3, c1 - 0.3]) sbox(acc, 'iron', x, 0, rz1 + 1.2, 0.03, 0.03, R + 2.5, 0, { u: 1, v: 1, top: false, cell: 99 });
  sbox(acc, 'litRed', -13, 61.9, 125, 0.3, 0.3, 0.3, 0, { u: 1, v: 1 });   // the point block's aviation light, over your shoulder
  // ---- the railway bank below: gravel, a low fence, three tracks running west into the sector, a signal. Near the
  // cradle the ground is cut fine for the lamps' pools; further west, where no lamp reaches, in big cells
  const [rr0, rr1, rq0, rq1] = PZ.rail, fz = PZ.yard[0][3], xs = PZ.bankFine;
  ground(acc, 'asphaltK', xs, 130, rr1, fz + 0.3, 0, 4); ground(acc, 'asphaltK', xs, fz + 0.3, rr1, rq1, -0.005, 4);
  ground(acc, 'asphaltK', rr0, 130, xs, fz + 0.3, 0, 8, { cell: 8 }); ground(acc, 'asphaltK', rr0, fz + 0.3, xs, rq1, -0.005, 8, { cell: 8 });
  for (const [a, b] of [[rr0, PZ.gap[0]], [PZ.gap[1], rr1]]) sbox(acc, 'concrete', (a + b) / 2, 0, fz + 0.15, b - a, 0.3, 1.2, 0, { u: 2, v: 1.2, top: 'wallTop', tu: 1 });   // a gap at the level crossing (src/kras/palace.js)
  for (const tz of [139.4, 143, 146.6]) aq(acc, 'track', [rr0, 0.012, tz + 1.2], [rr0, 0.012, tz - 1.2], [rr1, 0.012, tz - 1.2], [rr1, 0.012, tz + 1.2], [0, 0, 1, (rr1 - rr0) / 2], [0, 1, 0], 2);
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
  m.frustumCulled = false; g.add(m); L.mat = m.material;   // (its light flickers and dies when lift A breaks: updatePodezd)
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
  sbox(acc, 'iron', b - 0.35, 0.8, d - 0.02, 0.3, 0.12, 0.36, 0, { u: 1, v: 1 }); sbox(acc, 'litRed', b - 0.42, 1.04, d - 0.09, 0.06, 0.02, 0.06, 0, { u: 1, v: 1 }); sbox(acc, 'litCyan', b - 0.28, 1.04, d - 0.09, 0.06, 0.02, 0.06, 0, { u: 1, v: 1 });   // its control box
  const m = new THREE.Mesh(acc.geometry({ ambient: [0.45, 0.4, 0.36], lights: [] }), makeMat('street', { baked: true }));
  m.frustumCulled = false; scene.add(m); CRADLE.mesh = m;
}
// called from buildStreet(): the insides (one baked mesh, drawn as a room), the wing's roof and the railway bank (one
// baked mesh, outside), the two lift cars and the cradle (small meshes that move)
function buildPodezd() {
  PZ.lamps = []; PZ.outLamps = [];
  const inAcc = new GeoAcc(), upAcc = new GeoAcc(), outAcc = new GeoAcc(), roofAcc = new GeoAcc();
  buildPodezdInside(inAcc, upAcc); buildPodezdOutside(outAcc, roofAcc);
  const F = CFG.street.fog, Lt = CFG.street.light;
  const mk = (acc, light, parent) => { const m = new THREE.Mesh(acc.geometry(light), makeMat('street', { baked: true })); m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = !!parent; m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far }; if (parent) { parent.add(m); m.updateMatrixWorld(true); } else scene.add(m); return m; };
  const inLight = { ambient: CFG.podezd.light.inAmbient, lights: PZ.lamps }, outLight = { ambient: Lt.ambient, sky: Lt.sky, lights: PZ.outLamps.concat(SBX.lamps).concat(ST.lamps.filter(l => l[0][2] > 120)) };
  PZ.inMesh = mk(inAcc, inLight); PZ.upMesh = mk(upAcc, inLight, PZ.inMesh); PZ.inTris = inAcc.tris + upAcc.tris;
  PZ.outMesh = mk(outAcc, outLight); PZ.roofMesh = mk(roofAcc, outLight, PZ.outMesh); PZ.outTris = outAcc.tris + roofAcc.tris;
  PZ.outMesh.userData.near = CFG.podezd.drawNear;   // (src/rooms.js)
  PZ.roofMesh.userData.sphere = sbSphere(roofAcc);
  PZ.parts = { lobby: inAcc.tris, up: upAcc.tris, bank: outAcc.tris, roof: roofAcc.tris };
  // the children's rules, kept as their parents are drawn (a change shows a frame later: the 7th is out of sight in the
  // closed lift car while you cross the line, and the roof's past the fog when it goes)
  PZ.inMesh.onBeforeRender = () => { PZ.upMesh.visible = player.head.y > PZ.upFrom && roomState.cur === 'podezd'; };
  PZ.outMesh.onBeforeRender = () => { PZ.roofMesh.visible = sbSeen(PZ.roofMesh); };
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
  // (the street door is looked through from the ground only: from the roof or the cradle it's out of sight round the block)
  addPortal('outside', 'podezd', [SB.door[0], 1.2, SB.door[1]], () => player.head.y < PZ.upFrom && (level.name === 'podezd' || (level.name === 'superblock' && (game.state === 'won' || doorOpen('podezd3')))));
}
// ---- the rides
const liftInCar = (L) => { const h = player.head, [a, b, c, d] = L.car; return h.x > a - 0.05 && h.x < b + 0.05 && h.z > c + 0.15 && h.z < d + 0.1 && Math.abs(player.floorY - L.y) < 0.8; };
const cradleIn = () => { const h = player.head, [a, b, c, d] = PZ.cradle; return h.x > a && h.x < b && h.z > c + 0.25 && h.z < d + 0.1 && Math.abs(player.floorY - CRADLE.y) < 0.8; };
function resetPodezdRides(state) {   // state: 'start' (both lifts at their first stop), 'broken' (A stuck at the 7th), 'roof' (B up top)
  for (const L of LIFTS) { L.stop = 0; L.phase = 'open'; L.doors = 1; L.t = 0; }
  if (state === 'broken' || state === 'roof') { const A = LIFTS[0]; A.stop = 1; A.phase = 'broken'; A.doors = 0.55; }
  if (state === 'roof') LIFTS[1].stop = 1;
  for (const L of LIFTS) if (L.mat) L.mat.uniforms.uTint.value.set(...(L.phase === 'broken' ? CFG.podezd.deadLight : [1, 1, 1]));
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
    if (L.sparkT > 0) {   // the breakdown: a clunk, sparks off the doors' track, the car's light stuttering, then it dies to a dim red
      if (L.sparkT === 2.5) AU.tone('square', 70, 34, 0.45, 0.22, 0, 500);
      L.sparkT = Math.max(0, L.sparkT - dt);
      if (Math.random() < dt * 9) { AU.wood(); fx(['fx_spark'], new V3((L.car[0] + L.car[1]) / 2 + rand(-0.6, 0.6), L.y + 2.25, L.car[2] + rand(0, 0.4)), { life: 0.35, rise: -1.5, scale: 0.008 }); }
      const k = L.sparkT > 0 ? (Math.random() < 0.35 ? 0.25 : 1) : 0, D = CFG.podezd.deadLight;
      if (L.mat) L.mat.uniforms.uTint.value.set(D[0] + (1 - D[0]) * k, D[1] + (1 - D[1]) * k, D[2] + (1 - D[2]) * k);
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
