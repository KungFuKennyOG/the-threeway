'use strict';
// ============================== level 3: Tram Depot 7, geometry ===============
// Inside the Krasnovian sector, ~150 m from the Old Quarter (same world, same skylines, the far city cleared around
// it). You come in through the yard gate (local lz 0, facing +z): the yard (sodium lamps, tracks, a parked tram),
// the depot hall (trams over pits, a gantry, cold tubes, Volkov's ring at the back) and the workshop off its east
// side. The hall and the workshop are rooms: drawn only through their doorways (src/rooms.js).
const DEPOT = { x: -80, z: 150, yard: [18, 32], hall: [18, 32, 80, 9], work: [18, 28, 44, 60, 3.8],
  doorW: 9, doorH: 7, workDoor: [50, 52], ring: [0, 70, 3.6] };
DEPOT.rect = [DEPOT.x - 24, DEPOT.x + 32, DEPOT.z - 16, DEPOT.z + 86];   // keep the skylines and far city off it (world xz)
const DP = { ext: null, hall: null, work: null, lamps: [], outside: [] };
const onDepot = (x, z, m = 0) => x > DEPOT.rect[0] - m && x < DEPOT.rect[1] + m && z > DEPOT.rect[2] - m && z < DEPOT.rect[3] + m;
const dX = (lx) => DEPOT.x + lx, dZ = (lz) => DEPOT.z + lz;
// a wall between two local points; faces left of the run (see wall())
function dWall(acc, key, lx0, lz0, lx1, lz1, y0, y1, um, vm, o) { wall(acc, key, dX(lx0), dZ(lz0), dX(lx1), dZ(lz1), y0, y1, um, vm, o); }
function dBox(acc, key, lx, y0, lz, w, d, h, o) { sbox(acc, key, dX(lx), y0, dZ(lz), w, d, h, 0, o); }
function dGround(acc, key, lx0, lz0, lx1, lz1, y, tile, o) { ground(acc, key, dX(lx0), dZ(lz0), dX(lx1), dZ(lz1), y, tile, o); }
function dLight(lx, y, lz, col, r, k) { DP.lamps.push(lightFromHex([dX(lx), y, dZ(lz)], col, r, k)); }
function dSolid(lx0, lz0, lx1, lz1, h) {   // something nobody walks or falls through
  WORLD_BOXES.push([dX(lx0), 0, dZ(lz0), dX(lx1), h, dZ(lz1)]);
  BLOCKERS.push({ x0: dX(lx0), x1: dX(lx1), z0: dZ(lz0), z1: dZ(lz1) });
}
// a Krasnovian tram: green, cream stripe, lit or dark windows, a pantograph; lz0..lz1 along the track at lx
function tram(acc, lx, lz0, lz1) {
  const w = 2.5, L = lz1 - lz0, cz = (lz0 + lz1) / 2;
  dBox(acc, 'black', lx, 0, cz, 2.0, L - 1.5, 0.55, { u: 1, v: 1 });                     // bogies
  dBox(acc, 'tram', lx, 0.55, cz, w, L, 2.9, { u: 8, v: 2.9, top: 'corrugated', tu: 2, faceKey: { f: 'tramEnd', b: 'tramEnd' } });
  dBox(acc, 'corrugated', lx, 3.45, cz, w - 0.5, L - 1, 0.25, { u: 2, v: 1 });
  dBox(acc, 'iron', lx, 3.7, cz - 1, 0.1, 0.1, 1.1, { u: 1, v: 1 }); dBox(acc, 'iron', lx, 4.75, cz - 0.4, 1.4, 1.2, 0.06, { u: 1, v: 1 });   // pantograph
  dSolid(lx - w / 2, lz0, lx + w / 2, lz1, 3.5);
}
function sodiumLamp(acc, lx, lz, dir) {   // tall concrete post, a cobra head arm over the yard, sodium orange
  dBox(acc, 'concrete', lx, 0, lz, 0.3, 0.3, 7.2, { u: 1, v: 2 });
  dBox(acc, 'iron', lx + dir * 0.9, 7.1, lz, 1.9, 0.16, 0.12, { u: 1, v: 1 });
  dBox(acc, 'sodiumHead', lx + dir * 1.7, 6.85, lz, 0.7, 0.35, 0.25, { u: 0.7, v: 0.25 });
  dLight(lx + dir * 1.7, 6.6, lz, CFG.street.light.sodium, CFG.depot.light.sodiumRadius, CFG.depot.light.sodiumK);
  dSolid(lx - 0.2, lz - 0.2, lx + 0.2, lz + 0.2, 7.2);
}
function buildDepotExterior(acc) {
  const [YX, YZ] = DEPOT.yard, [HX, H0, H1, HH] = DEPOT.hall, [W0, W1, WZ0, WZ1, WH] = DEPOT.work, DW = DEPOT.doorW;
  // the street outside the gate, and the yard
  dGround(acc, 'asphaltK', -40, -18, 40, 0, 0, 4);
  dGround(acc, 'asphaltK', -YX, 0, YX, YZ, 0, 4);
  for (const lx of [-6, 0, 6]) dGround(acc, 'track', lx - 1.2, -18, lx + 1.2, H0, 0.012, 2);
  // the yard's perimeter wall: concrete, both faces, a gate in the front
  for (const [a0, a1] of [[-YX, -5], [5, YX]]) { dWall(acc, 'concrete', a0, 0, a1, 0, 0, 3.2, 2, 2); dWall(acc, 'concrete', a1, -0.3, a0, -0.3, 0, 3.2, 2, 2); dBox(acc, 'wallTop', (a0 + a1) / 2, 3.2, -0.15, a1 - a0, 0.3, 0.12, { u: 2, v: 1, tu: 2 }); }
  for (const s of [-1, 1]) {
    dWall(acc, 'concrete', s * YX, s < 0 ? YZ : 0, s * YX, s < 0 ? 0 : YZ, 0, 3.2, 2, 2);                 // inner face
    dWall(acc, 'concrete', s * (YX + 0.3), s < 0 ? 0 : YZ, s * (YX + 0.3), s < 0 ? YZ : 0, 0, 3.2, 2, 2);  // outer face
    dBox(acc, 'wallTop', s * (YX + 0.15), 3.2, YZ / 2, 0.3, YZ, 0.12, { u: 2, v: 1, tu: 2 });
    // the gate leaves, swung open against the wall
    dBox(acc, 'gate', s * 5.2, 0, 2.5, 0.08, 4.6, 2.8, { u: 2.3, v: 2.8, faceKey: { l: 'gate', r: 'gate' } });
    dBox(acc, 'concrete', s * 5.2, 0, -0.15, 0.5, 0.5, 3.6, { u: 1, v: 2 });
  }
  // the hall's outside: soot-dark brick, a corrugated sawtooth roof with north-light glazing, the big track doors
  // (a wall faces to the left of its run: front faces -z, sides face out, back faces +z)
  dWall(acc, 'brickHall', -DW, H0, -HX, H0, 0, HH, 4, 4); dWall(acc, 'brickHall', HX, H0, DW, H0, 0, HH, 4, 4);
  dWall(acc, 'brickHall', DW, H0, -DW, H0, DEPOT.doorH, HH, 4, 4);
  dWall(acc, 'brickHall', -HX, H0, -HX, H1, 0, HH, 4, 4);
  // east side: the workshop annex covers the middle (its own inside wall is there, so no outside face to z-fight it)
  dWall(acc, 'brickHall', HX, H1, HX, WZ1, 0, HH, 4, 4); dWall(acc, 'brickHall', HX, WZ0, HX, H0, 0, HH, 4, 4, { u0: (H1 - WZ0) / 4 });
  dWall(acc, 'brickHall', HX, WZ1, HX, WZ0, WH, HH, 4, 4, { u0: (H1 - WZ1) / 4 }); dWall(acc, 'brickHall', -HX, H1, HX, H1, 0, HH, 4, 4);
  const teeth = 3, tz = (H1 - H0) / teeth;
  for (let k = 0; k < teeth; k++) {   // each tooth: glazing facing the yard, a slope down to the next
    const z0 = H0 + k * tz, z1 = z0 + tz;
    aq(acc, 'skylight', [dX(-HX), HH + 3, dZ(z0)], [dX(HX), HH + 3, dZ(z0)], [dX(HX), HH, dZ(z0)], [dX(-HX), HH, dZ(z0)], [0, 0, HX * 2 / 3, 1], [0, 0, -1], 999);
    aq(acc, 'corrugated', [dX(-HX), HH + 3, dZ(z0)], [dX(-HX), HH, dZ(z1)], [dX(HX), HH, dZ(z1)], [dX(HX), HH + 3, dZ(z0)], [0, 0, tz / 2, HX], [0, 1, 0.2], 999);
    for (const s of [-1, 1]) aq(acc, 'brickHall', [dX(s * HX), HH, dZ(z0)], [dX(s * HX), HH + 3, dZ(z0)], [dX(s * HX), HH, dZ(z1)], [dX(s * HX), HH, dZ(z1)], [0, 0, 1, 1], [s, 0, 0], 999);   // gable
  }
  dBox(acc, 'gilt', 0, HH - 0.4, H0 - 0.05, HX * 2 + 0.2, 0.1, 0.3, { u: 2, v: 1 });
  aq(acc, 'depotSign', [dX(6), DEPOT.doorH + 1.9, dZ(H0 - 0.1)], [dX(-6), DEPOT.doorH + 1.9, dZ(H0 - 0.1)], [dX(-6), DEPOT.doorH + 0.4, dZ(H0 - 0.1)], [dX(6), DEPOT.doorH + 0.4, dZ(H0 - 0.1)], [0, 0, 1, 1], [0, 0, -1], 99);
  for (const lx of [-13.5, 13.5]) plate(acc, 'banner', dX(lx), 4.6, dZ(H0), 2.4, 6.5, Math.PI, 0.08);
  // the workshop annex on the hall's east side
  dWall(acc, 'concrete', W1, WZ0, W0, WZ0, 0, WH, 2, 2); dWall(acc, 'concrete', W1, WZ1, W1, WZ0, 0, WH, 2, 2); dWall(acc, 'concrete', W0, WZ1, W1, WZ1, 0, WH, 2, 2);
  dBox(acc, 'roofDark', (W0 + W1) / 2, WH, (WZ0 + WZ1) / 2, W1 - W0 + 0.3, WZ1 - WZ0 + 0.3, 0.2, { u: 4, v: 1 });
  // yard: a parked tram, rails and sleepers stacked, oil drums, lamps
  tram(acc, 6, 9, 21);
  dBox(acc, 'darkwood', -12, 0, 14, 3.2, 2.4, 0.9, { u: 1, v: 1 }); dBox(acc, 'iron', -12, 0.9, 14, 3.0, 0.4, 0.25, { u: 1, v: 1 }); dSolid(-13.6, 12.8, -10.4, 15.2, 1.15);
  for (const [lx, lz] of [[-14.5, 26], [-13.6, 26.6], [-14.6, 27.3]]) { cyl(acc, 'padBlue', dX(lx), 0, dZ(lz), 0.32, 0.32, 0.9, 8, { u: 1, v: 1 }); }
  dSolid(-15.1, 25.4, -13.1, 27.8, 0.9);
  for (const [lx, lz, d] of [[-15, 6, 1], [15, 6, -1], [-15, 22, 1], [15, 22, -1]]) sodiumLamp(acc, lx, lz, d);
  sodiumLamp(acc, -10.5, -6, 1); sodiumLamp(acc, 10.5, -6, -1);
  dLight(0, DEPOT.doorH + 1.2, H0 - 1.2, '#ff7050', 9, 0.9);   // the red depot sign on the yard
}
function buildDepotHall(acc) {
  const [HX, H0, H1, HH] = DEPOT.hall, DW = DEPOT.doorW, [d0, d1] = DEPOT.workDoor, [rx, rz, rs] = DEPOT.ring;
  dGround(acc, 'concreteFloor', -HX, H0, HX, H1, 0.004, 4);
  for (const lx of [-6, 0, 6]) dGround(acc, lx === 0 ? 'track' : 'pit', lx - 1.2, H0, lx + 1.2, lx === 0 ? 62 : H1 - 2, 0.012, 2);
  // walls (inside faces), the track doors and the workshop door cut out
  dWall(acc, 'brickIn', -HX, H1, -HX, H0, 0, HH, 4, 4);                                               // west, faces +x
  dWall(acc, 'brickIn', HX, H0, HX, d0, 0, HH, 4, 4); dWall(acc, 'brickIn', HX, d1, HX, H1, 0, HH, 4, 4);
  dWall(acc, 'brickIn', HX, d0, HX, d1, 2.4, HH, 4, 4);
  dWall(acc, 'brickIn', HX, H1, -HX, H1, 0, HH, 4, 4);                                                // back, faces -z
  dWall(acc, 'brickIn', -HX, H0, -DW, H0, 0, HH, 4, 4); dWall(acc, 'brickIn', DW, H0, HX, H0, 0, HH, 4, 4);   // front, faces +z
  dWall(acc, 'brickIn', -DW, H0, DW, H0, DEPOT.doorH, HH, 4, 4);
  // the ceiling: the sawtooth's glazing glows faintly; tubes hang below
  const teeth = 3, tz = (H1 - H0) / teeth;
  for (let k = 0; k < teeth; k++) {
    const z0 = H0 + k * tz, z1 = z0 + tz;
    aq(acc, 'skylight', [dX(HX), HH + 3, dZ(z0)], [dX(-HX), HH + 3, dZ(z0)], [dX(-HX), HH, dZ(z0)], [dX(HX), HH, dZ(z0)], [0, 0, HX * 2 / 3, 1], [0, 0, 1], 999);
    aq(acc, 'corrugated', [dX(HX), HH + 3, dZ(z0)], [dX(HX), HH, dZ(z1)], [dX(-HX), HH, dZ(z1)], [dX(-HX), HH + 3, dZ(z0)], [0, 0, tz / 2, HX], [0, -1, -0.2], 4);
    for (const s of [-1, 1]) aq(acc, 'brickIn', [dX(s * HX), HH, dZ(z0)], [dX(s * HX), HH + 3, dZ(z0)], [dX(s * HX), HH, dZ(z1)], [dX(s * HX), HH, dZ(z1)], [0, 0, 1, 1], [-s, 0, 0], 999);   // gable
  }
  for (let lz = H0 + 4; lz < H1 - 2; lz += 8) for (const lx of [-9, 0, 9]) {
    dBox(acc, 'fluor', lx, 6.4, lz, 0.4, 3.0, 0.12, { u: 0.4, v: 0.12, top: 'iron' });
    dBox(acc, 'iron', lx, 6.52, lz, 0.6, 3.2, 0.06, { u: 1, v: 1 });                         // the reflector
    dBox(acc, 'iron', lx, 6.58, lz, 0.03, 0.03, HH - 6.58, { u: 1, v: 1, top: false });
    dLight(lx, 6.1, lz, CFG.depot.light.tube, CFG.depot.light.tubeRadius, CFG.depot.light.tubeK);
  }
  // the gantry crane: two beams across the hall on rails along the walls
  for (const s of [-1, 1]) dBox(acc, 'iron', s * (HX - 0.4), 7.4, (H0 + H1) / 2, 0.5, H1 - H0 - 1, 0.4, { u: 1, v: 1 });
  for (const lz of [44, 58]) { dBox(acc, 'padRed', 0, 7.0, lz, HX * 2 - 1, 0.6, 0.5, { u: 2, v: 1 }); dBox(acc, 'iron', 2, 4.2, lz, 0.04, 0.04, 2.8, { u: 1, v: 1, top: false }); dBox(acc, 'iron', 2, 3.9, lz, 0.4, 0.4, 0.3, { u: 1, v: 1 }); }
  // two trams over the pits; the middle track is the way through to the ring
  tram(acc, -6, 38, 50); tram(acc, 6, 46, 58);
  // lockers down the west wall, crates and tram seats as bleachers
  for (let lz = 60; lz < 78; lz += 2) { dBox(acc, 'locker', -HX + 0.35, 0, lz + 1, 0.7, 2, 2.2, { u: 2, v: 2.2, faceKey: { f: 'iron', b: 'iron', r: 'locker' } }); }
  dSolid(-HX, 60, -HX + 0.7, 78, 2.2);
  for (const [lx, lz, w, d] of [[-7.5, 66, 1.2, 6], [7.5, 66, 1.2, 6], [-4, 76.5, 6, 1.2], [4, 76.5, 6, 1.2]]) { dBox(acc, 'darkwood', lx, 0, lz, w, d, 0.5, { u: 1, v: 1 }); dSolid(lx - w / 2, lz - d / 2, lx + w / 2, lz + d / 2, 0.5); }
  // Volkov's ring: canvas on the floor, red/blue corner pads, three ropes (open on the side you come in from)
  dGround(acc, 'canvas', rx - rs, rz - rs, rx + rs, rz + rs, 0.02, 2);
  const corners = [[-rs, -rs, 'padRed'], [rs, -rs, 'padBlue'], [-rs, rs, 'padBlue'], [rs, rs, 'padRed']];
  for (const [cx, cz, k] of corners) { dBox(acc, 'iron', rx + cx, 0, rz + cz, 0.14, 0.14, 1.5, { u: 1, v: 1 }); dBox(acc, k, rx + cx, 0.5, rz + cz, 0.26, 0.26, 0.9, { u: 1, v: 1 }); dSolid(rx + cx - 0.12, rz + cz - 0.12, rx + cx + 0.12, rz + cz + 0.12, 1.5); }
  for (const y of [0.55, 0.95, 1.35]) for (const [a, b] of [[[-rs, rs], [rs, rs]], [[-rs, -rs], [-rs, rs]], [[rs, -rs], [rs, rs]]]) {
    const x0 = rx + a[0], z0 = rz + a[1], x1 = rx + b[0], z1 = rz + b[1];
    dBox(acc, 'rope', (x0 + x1) / 2, y, (z0 + z1) / 2, Math.abs(x1 - x0) + 0.04, Math.abs(z1 - z0) + 0.04, 0.04, { u: 1, v: 1 });
  }
  dBox(acc, 'iron', rx, 4.4, rz, 0.04, 0.04, HH - 4.4, { u: 1, v: 1, top: false });
  dBox(acc, 'gaslamp', rx, 4.1, rz, 0.9, 0.9, 0.3, { u: 0.9, v: 0.3, top: 'iron' });
  dLight(rx, 3.8, rz, CFG.depot.light.ring, CFG.depot.light.ringRadius, CFG.depot.light.ringK);
  plate(acc, 'volkovPoster', dX(-3), 3.2, dZ(H1 - 0.05), 2.4, 3.2, Math.PI, 0.04);
  plate(acc, 'banner', dX(3), 3.6, dZ(H1 - 0.05), 2.2, 4.4, Math.PI, 0.04);
  plate(acc, 'volkovPoster', dX(HX - 0.05), 2.4, dZ(36), 1.2, 1.6, -Math.PI / 2, 0.04);
}
function buildDepotWorkshop(acc) {
  const [W0, W1, WZ0, WZ1, WH] = DEPOT.work, [d0, d1] = DEPOT.workDoor;
  dGround(acc, 'concreteFloor', W0, WZ0, W1, WZ1, 0.004, 4);
  dWall(acc, 'brickIn', W0, WZ0, W1, WZ0, 0, WH, 4, 4); dWall(acc, 'brickIn', W1, WZ0, W1, WZ1, 0, WH, 4, 4); dWall(acc, 'brickIn', W1, WZ1, W0, WZ1, 0, WH, 4, 4);
  dWall(acc, 'brickIn', W0, WZ1, W0, d1, 0, WH, 4, 4); dWall(acc, 'brickIn', W0, d0, W0, WZ0, 0, WH, 4, 4); dWall(acc, 'brickIn', W0, d1, W0, d0, 2.4, WH, 4, 4);
  aq(acc, 'roofDark', [dX(W0), WH, dZ(WZ1)], [dX(W1), WH, dZ(WZ1)], [dX(W1), WH, dZ(WZ0)], [dX(W0), WH, dZ(WZ0)], [0, 0, 1, 1], [0, -1, 0], 3);
  // spares: a tram wheelset on the floor, oil drums, a stack of seats, a sleeper pile
  for (const [lx, lz] of [[22.5, 46.5], [22.5, 57]]) {
    for (const s of [-1, 1]) cyl(acc, 'iron', dX(lx + s * 0.75), 0, dZ(lz), 0.42, 0.42, 0.14, 10, { u: 1, v: 1 });
    dBox(acc, 'iron', lx, 0.36, lz, 1.5, 0.12, 0.12, { u: 1, v: 1 });
    dSolid(lx - 0.9, lz - 0.45, lx + 0.9, lz + 0.45, 0.85);
  }
  for (const [lx, lz] of [[19.2, 44.9], [19.9, 45.1]]) cyl(acc, 'padBlue', dX(lx), 0, dZ(lz), 0.3, 0.3, 0.88, 8, { u: 1, v: 1 });
  dSolid(18.8, 44.5, 20.3, 45.5, 0.9);
  dBox(acc, 'darkwood', 19, 0, 58.6, 1.4, 2.2, 0.6, { u: 1, v: 1 }); dBox(acc, 'darkwood', 19, 0.6, 58.6, 1.2, 1.9, 0.5, { u: 1, v: 1 }); dSolid(18.2, 57.4, 19.8, 59.8, 1.1);
  dBox(acc, 'workbench', W1 - 0.6, 0, (WZ0 + WZ1) / 2, 1.0, 6, 0.95, { u: 2, v: 0.95, top: 'workbench', tu: 2 });
  dSolid(W1 - 1.1, (WZ0 + WZ1) / 2 - 3, W1, (WZ0 + WZ1) / 2 + 3, 0.95);
  plate(acc, 'toolboard', dX(W1 - 0.05), 2.1, dZ((WZ0 + WZ1) / 2), 5, 1.4, -Math.PI / 2, 0.02);
  plate(acc, 'volkovPoster', dX(W0 + 3), 2.0, dZ(WZ1 - 0.05), 1.2, 1.6, Math.PI, 0.02);
  for (const f of [0.3, 0.7]) { const lz = WZ0 + (WZ1 - WZ0) * f;
    dBox(acc, 'fluor', (W0 + W1) / 2, WH - 0.25, lz, 0.3, 1.8, 0.1, { u: 0.3, v: 0.1, top: 'iron' });
    dLight((W0 + W1) / 2, WH - 0.5, lz, CFG.depot.light.tube, CFG.depot.light.workRadius, CFG.depot.light.workK); }
}
// called from buildStreet(): three meshes on the street atlas, light baked in
function buildDepot() {
  DP.ext = new GeoAcc(); DP.hall = new GeoAcc(); DP.work = new GeoAcc(); DP.lamps = [];
  buildDepotExterior(DP.ext); buildDepotHall(DP.hall); buildDepotWorkshop(DP.work);
  const L = CFG.depot.light, F = CFG.street.fog, out = [];
  for (const [acc, amb, key] of [[DP.ext, CFG.street.light.ambient, 'ext'], [DP.hall, L.hallAmbient, 'hall'], [DP.work, L.hallAmbient, 'work']]) {
    const m = new THREE.Mesh(acc.geometry({ ambient: amb, sky: key === 'ext' ? CFG.street.light.sky : [0, 0, 0], lights: DP.lamps }), makeMat('street', { baked: true }));
    m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false;
    m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far };
    scene.add(m); DP[key + 'Mesh'] = m; out.push(m);
  }
  for (const L2 of DP.lamps) ST.lamps.push(L2);
  // where you can walk: the yard, through the track doors, the hall, the workshop door, the workshop
  const [YX, YZ] = DEPOT.yard, [HX, H0, H1] = DEPOT.hall, [W0, W1, WZ0, WZ1] = DEPOT.work, [d0, d1] = DEPOT.workDoor, DW = DEPOT.doorW;
  const R = (lx0, lx1, lz0, lz1, area) => addWalk({ x0: dX(lx0), x1: dX(lx1), z0: dZ(lz0), z1: dZ(lz1), area });
  R(-YX + 0.3, YX - 0.3, 0.5, YZ - 0.25, 'depotYard'); R(-DW + 0.2, DW - 0.2, YZ - 1.5, H0 + 1.5, 'depotDoors');
  R(-HX + 0.3, HX - 0.3, H0 + 0.25, H1 - 0.3, 'depotHall'); R(HX - 1.2, W0 + 1.2, d0 + 0.15, d1 - 0.15, 'depotWorkDoor');
  R(W0 + 0.25, W1 - 0.3, WZ0 + 0.3, WZ1 - 0.3, 'depotWork');
  return out;
}
// rooms: the hall and the workshop are interiors; the yard is part of the outside
function depotRooms() {
  const [HX, H0, H1] = DEPOT.hall, [W0, W1, WZ0, WZ1] = DEPOT.work;
  addRoom('depotHall', (p) => p.x > dX(-HX) && p.x < dX(HX) && p.z > dZ(H0) && p.z < dZ(H1));
  addRoom('depotWork', (p) => p.x > dX(W0) && p.x < dX(W1) && p.z > dZ(WZ0) && p.z < dZ(WZ1));
  roomMeshes('depotHall', DP.hallMesh); roomMeshes('depotWork', DP.workMesh);
  addPortal('outside', 'depotHall', [dX(0), 3.5, dZ(H0)]);
  addPortal('depotHall', 'depotWork', [dX(HX), 1.2, dZ((DEPOT.workDoor[0] + DEPOT.workDoor[1]) / 2)]);
}
