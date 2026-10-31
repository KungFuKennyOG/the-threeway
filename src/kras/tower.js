'use strict';
// ============================== Act 1, level 7: the Tower of Labor =========================
// Krasnovia's seat of power, the end of Act 1: a stepped palace of offices (114 m to the top of its pinnacle) under a
// tapering spire with a gilded cog at ~210 m. (So high because Superblock 14's 61.6 m point block stands right on the line
// from the road to the tower: from Tripoint Square everything at the tower below ~191 m is hidden behind it.)
// In through the big south doors from Parade Square (no cut) into the marble lobby; lift 1 up to the Ministry's office floor; lift 2 up to the archive (Inspector Orlova); lift 3 up to the Chairman's office under the cog, a
// panoramic window over the night city. Beat the Chairman and he signs the permit to reopen The Threeway: 1 of 3.
// No stairs (VR): lifts do all the climbing, enclosed and eased. World coordinates (+z away from the Threeway).
//
// The shell (one baked mesh, outside, fogged like the skylines) reads from across the city; each floor inside is its own
// room (two floors to a baked mesh), drawn only when you're on it (or looking in through the south doors / out of the window).
CFG.tower = {
  start: [-40, 314.2],                     // "start here": just inside the south doors, facing in
  spawnGap: 1.0, clearedPause: 1.6, healBetween: 25,
  liftSpeed: 4.0, doorTime: 1.0, restRise: 2.4,   // m/s (4 m/s = 56 mm a frame at 72 Hz: the comfort limit is ~60)
  signPause: 3.2,                          // s from 'SIGNED' to 'ACT 1 COMPLETE'
  // spawns [type, x, z, floor y]; respawns [x, z, floor y, facing]. One floor per fight (goon AI isn't floor-aware);
  // `lock`: the lift (and the doors) shut while it's on. `enrageAt` per encounter: Orlova loses it at half health.
  encounters: [
    { name: 'lobby', at: [-52, -28, 313.4, 333.4, -1, 1.5], respawn: [-40, 314.4, 0, Math.PI], sign: 'twLobby', lock: ['twDoor', 'twLift1'],
      spawn: [['militia', -51.2, 319.6, 0], ['inspector', -28.8, 319.6, 0], ['inspector', -44, 332.6, 0], ['militia', -36, 332.6, 0]] },
    { name: 'offices', at: [-52, -28, 318, 333.0, 11, 13.5], respawn: [-31, 332.4, 12, 0], sign: 'twOffices', lock: ['twLift1', 'twLift2'],
      spawn: [['clerk', -48.6, 322.2, 12], ['clerk', -31.4, 325.5, 12], ['clerk', -48.6, 325.5, 12], ['bodyguard', -40, 319, 12]] },
    { name: 'archive', at: [-52, -28, 319, 333.0, 39, 41.5], respawn: [-47, 332.4, 40, 0], sign: 'orlova', boss: true, enrageAt: 0.5, lock: ['twLift2', 'twLift3'],
      spawn: [['bodyguard', -36, 326.5, 40], ['orlova', -40, 321.2, 40]] },
    { name: 'chairman', at: [-48.4, -31.6, 323.6, 333.0, 79, 81.5], respawn: [-40, 332.4, 80, 0], sign: 'chairman', boss: true, lock: ['twLift3'],
      spawn: [['chairman', -43, 325.0, 80]] },
  ],
  get enrageAt() { const E = this.encounters[level.encounter]; return (E && E.enrageAt) || 0; },   // read by the stage flow (src/street/fight.js)
  props: [['bin', -50.8, 313.2, 0], ['bin', -29.2, 313.2, 0], ['stool', -50.4, 321.4, 12], ['stool', -29.6, 324.7, 12], ['stool', -46.8, 328.0, 12],
          ['bin', -44.6, 319.2, 12], ['bottle', -48.6, 325.4, 12], ['crate', -44.2, 325.6, 40], ['crate', -44.4, 326.4, 40], ['crate', -35.8, 330.6, 40],
          ['bottle', -38.2, 321.2, 40], ['bottle', -47.9, 329.2, 81.05], ['bottle', -47.9, 329.8, 81.05]],
  light: { inAmbient: [0.11, 0.095, 0.1], archiveAmbient: [0.13, 0.135, 0.145], topAmbient: [0.08, 0.075, 0.1] },
};
const TWR = {
  foot: [-64, -16, 312, 348],                                          // the base tier's footprint
  tiers: [[-64, -16, 312, 348, 0, 30], [-59, -21, 316, 344, 30, 54], [-54, -26, 320, 340, 54, 74], [-49, -31, 323, 337, 74, 92]],
  door: [-44, -36, 6.2],                                               // the south doors in the south face (z 312): x0, x1, height
  rect: [-70, -10, 310, 352],                                          // its ground: the far city and the skylines keep off it
  wallZ: 333.8,                                                        // every floor's north wall: the lifts open on it
  lobby:   { r: [-52, -28, 312, 333.8], y: 0, h: 8 },
  office:  { r: [-52, -28, 318, 333.8], y: 12, h: 3.4, walk: [0.62, 0.62, 0] },   // walk: insets [w, e, s] where cabinets and shelves line the walls
  archive: { r: [-52, -28, 319, 333.8], y: 40, h: 4, walk: [0, 0, 0.5] },
  top:     { r: [-48.4, -31.6, 323.6, 333.8], y: 80, h: 5.6 },
  window: [-47, -33, 0.9, 5.0],
  shelfRows: [321.4, 324.6, 327.8],                                   // the archive's shelving (0.7 m deep) off both side walls                                        // the Chairman's window: x0, x1, sill and head above his floor
  spire: 236, cogY: 208, cogD: 22,
  shell: null, meshes: {}, tris: {}, lamps: {}, permit: null,
  signed: false, signT: 0, act1: false,
};
// three lifts, all opening south onto the floors' north wall: lobby -> offices -> archive -> the Chairman
const TLIFTS = [
  { name: '1', car: [-32.4, -29.6, 333.4, 336.2], stops: [0, 12], needs: [0], lock: 'twLift1', rooms: ['twLobby', 'twOffice'], arrive: 'twMinistry' },
  { name: '2', car: [-48.4, -45.6, 333.4, 336.2], stops: [12, 40], needs: [1], lock: 'twLift2', rooms: ['twOffice', 'twArchive'], arrive: 'twArchive' },
  { name: '3', car: [-41.4, -38.6, 333.4, 336.2], stops: [40, 80], needs: [2], lock: 'twLift3', rooms: ['twArchive', 'twTop'], arrive: 'twTop' },
];
for (const L of TLIFTS) Object.assign(L, { y: L.stops[0], stop: 0, phase: 'open', t: 0, doors: 1, rect: null, group: null, leaves: [] });
const SIGNED = new Set();   // the leaders who've signed the permit (one per sector: three in all)
function twLight(list, x, y, z, col, r, k) { const L = lightFromHex([x, y, z], col, r, k); list.push(L); return L; }
function twSolid(x0, z0, x1, z1, y0, y1) { WORLD_BOXES.push([x0, y0, z0, x1, y1, z1]); BLOCKERS.push({ x0, x1, z0, z1, y0, y1 }); }
// walls of a room [x0, x1, z0, z1] at height y, facing in; gaps: { s|n|w|e: [[a, b, top], ...] } (doorways from y up to y + top)
function twWalls(acc, key, [x0, x1, z0, z1], y, h, gaps = {}, um = 2, vm = h, skip = '') {
  const run = (side, a0, a1, mk) => {
    if (skip.includes(side)) return;
    const g = (gaps[side] || []).slice().sort((p, q) => p[0] - q[0]); let a = a0;
    for (const [ga, gb, top] of g) { if (ga > a) mk(a, ga, y, y + h); mk(ga, gb, y + top, y + h); a = gb; }
    if (a1 > a) mk(a, a1, y, y + h);
  };
  const o = (ya) => ({ v0: (ya - y) / vm });   // doorway heads keep the wall's pattern lined up
  run('s', x0, x1, (a, b, ya, yb) => wall(acc, key, a, z0, b, z0, ya, yb, um, vm, o(ya)));
  run('n', x0, x1, (a, b, ya, yb) => wall(acc, key, b, z1, a, z1, ya, yb, um, vm, o(ya)));
  run('w', z0, z1, (a, b, ya, yb) => wall(acc, key, x0, b, x0, a, ya, yb, um, vm, o(ya)));
  run('e', z0, z1, (a, b, ya, yb) => wall(acc, key, x1, a, x1, b, ya, yb, um, vm, o(ya)));
}
function twCeil(acc, key, [x0, x1, z0, z1], y, tile) { aq(acc, key, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], [x0 / tile, z1 / tile, x1 / tile, z0 / tile], [0, -1, 0], 2.4); }
function twLamp(acc, list, x, y, z, col, r, k, key = 'litWarm', s = 0.3) { sbox(acc, key, x, y - 0.14, z, s, s, 0.14, 0, { u: 1, v: 1 }); twLight(list, x, y - 0.4, z, col, r, k); }
// the lift doorways on a floor: gaps in its north wall, a LIFT sign over each
function twLiftGaps(F) { return TLIFTS.filter(L => L.stops.includes(F.y)).map(L => [L.car[0], L.car[1], 2.4]); }
function twLiftSigns(acc, F) { for (const L of TLIFTS) if (L.stops.includes(F.y)) plate(acc, 'liftSign', (L.car[0] + L.car[1]) / 2, F.y + 2.72, TWR.wallZ, 0.9, 0.28, Math.PI, 0.02); }
function twShaft(acc, L) {   // the bare shaft above the bottom stop, seen through the doorway once the car has gone up
  const [a, b, c, d] = L.car, y0 = L.stops[0], y1 = L.stops[1] + 2.4;
  wall(acc, 'concrete', b + 0.02, d + 0.02, a - 0.02, d + 0.02, y0, y1, 2, 2);
  wall(acc, 'concrete', a - 0.02, d + 0.02, a - 0.02, TWR.wallZ, y0, y1, 2, 2); wall(acc, 'concrete', b + 0.02, TWR.wallZ, b + 0.02, d + 0.02, y0, y1, 2, 2);
  wall(acc, 'concrete', a, TWR.wallZ + 0.02, b, TWR.wallZ + 0.02, y0 + 2.4, L.stops[1], 2, 2);   // the slab between the floors, from inside the shaft
}
// ---- the lobby: marble, a red carpet, a giant worker mosaic, a statue, flags
function towerLobby(acc, lamps) {
  const F = TWR.lobby, [x0, x1, z0, z1] = F.r, H = F.h, [d0, d1, dh] = TWR.door;
  twWalls(acc, 'marbleWall', F.r, 0, H, { s: [[d0, d1, dh]], n: twLiftGaps(F) }, 3, H);
  ground(acc, 'marble', x0, z0, x1, z1, 0.004, 2); twCeil(acc, 'coffer', F.r, H, 2);
  aq(acc, 'carpetRed', [-41.3, 0.014, 326.6], [-38.7, 0.014, 326.6], [-38.7, 0.014, z0], [-41.3, 0.014, z0], [0, 0, 1, (326.6 - z0) / 2.6], [0, 1, 0], 2.6);
  // the doors stand open, folded back against the wall inside; the lintel over them
  for (const [x, s] of [[d0 - 2, 1], [d1 + 2, -1]]) plate(acc, 'bronzeDoor', x, dh / 2, z0, 4, dh, 0, 0.06, s > 0 ? [0, 0, 1, 1] : [1, 0, 0, 1]);
  aq(acc, 'marbleWall', [d0, dh, z0 - 0.6], [d1, dh, z0 - 0.6], [d1, dh, z0], [d0, dh, z0], [0, 0, 2, 0.1], [0, -1, 0], 4);
  // four marble columns with gilt capitals
  for (const x of [-46.5, -33.5]) for (const z of [318, 324]) {
    sbox(acc, 'marbleWall', x, 0, z, 1.2, 1.2, H, 0, { u: 1.2, v: H, top: false }); sbox(acc, 'gilt', x, H - 0.7, z, 1.5, 1.5, 0.35, 0, { u: 1, v: 1 });
    sbox(acc, 'marbleWall', x, 0, z, 1.45, 1.45, 0.5, 0, { u: 1.4, v: H, top: 'marble', tu: 2 });   // (holes in the walk area: TW_HOLES.lobby)
  }
  // the mosaic over the north wall; the statue in front of it: an invented steelworker holding up a gold cog
  plate(acc, 'mosaicLabor', -40, 4.7, z1, 12, 6, Math.PI, 0.03);
  sbox(acc, 'marbleWall', -40, 0, 330, 2.8, 2.8, 1.8, 0, { u: 2.8, v: 4, top: 'marble', tu: 2 });
  sbox(acc, 'gilt', -40, 1.45, 328.58, 1.6, 0.04, 0.2, 0, { u: 1, v: 1 });
  for (const s of [-1, 1]) sbox(acc, 'bronze', -40 + s * 0.32, 1.8, 330, 0.42, 0.5, 1.9, 0, { u: 1, v: 1 });                   // legs
  frustum(acc, 'bronze', -40, 3.7, 330, 1.2, 0.6, 1.45, 0.75, 1.6, 0, { u: 1, v: 1 });                                          // torso
  sbox(acc, 'bronze', -40, 5.3, 330, 0.3, 0.3, 0.2, 0, { u: 1, v: 1 }); sbox(acc, 'bronze', -40, 5.5, 330, 0.55, 0.6, 0.62, 0, { u: 1, v: 1 });   // neck, head
  sbox(acc, 'bronze', -40.95, 3.7, 330, 0.34, 0.4, 1.5, 0, { u: 1, v: 1 });                                                       // the arm down
  sbox(acc, 'bronze', -39.1, 5.0, 330, 0.34, 0.4, 2.0, 0, { u: 1, v: 1 });                                                        // the arm up
  for (const ph of [0, Math.PI / 2]) plate(acc, 'cog', -39.1, 7.35, 330, 1.3, 1.3, ph, 0, [0, 0, 1, 1], true);
  // flags on poles either side of the statue, banners on the side walls, doors the militia come through
  for (const x of [-45, -35]) { cyl(acc, 'gilt', x, 0, 331.4, 0.06, 0.05, 6.4, 4, { u: 1, v: 1 }); plate(acc, 'flag_kras', x + 1.25, 5.4, 331.4, 2.4, 1.6, 0, 0, [0, 0, 1, 1], true); }
  for (const [x, ph] of [[x0, Math.PI / 2], [x1, -Math.PI / 2]]) { plate(acc, 'banner', x, 4.6, 326.5, 2.4, 5.2, ph, 0.05); plate(acc, 'oakDoor', x, 1.5, 319.6, 2, 3, ph, 0.03); }
  // light: two chandeliers, the mosaic floodlit, the door
  for (const z of [317.5, 325]) { sbox(acc, 'gilt', -40, H - 1.4, z, 0.9, 0.9, 0.12, 0, { u: 1, v: 1 }); sbox(acc, 'litWarm', -40, H - 1.3, z, 0.7, 0.7, 0.35, 0, { u: 1, v: 1 }); cyl(acc, 'iron', -40, H - 1, z, 0.03, 0.03, 1, 4, { u: 1, v: 1 }); twLight(lamps, -40, H - 1.6, z, '#ffd8a0', 13, 1.5); }
  twLight(lamps, -40, 1.0, 327.6, '#ffc890', 8, 1.1);                     // uplights on the mosaic and the statue
  for (const x of [-44.5, -35.5]) twLight(lamps, x, 1.2, 332.6, '#ffc890', 6.5, 1.3);
  for (const x of [x0 + 0.4, x1 - 0.4]) twLight(lamps, x, 5, 326.5, '#ffb070', 6, 0.9);
  twLight(lamps, -40, 3, z0 + 1, '#9ab8ff', 6, 0.5);
  for (const x of [-49, -31]) { sbox(acc, 'litWarm', x, 3.2, z0 + 0.06, 0.4, 0.12, 0.5, 0, { u: 1, v: 1 }); twLight(lamps, x, 3.0, z0 + 0.6, '#ffd8a0', 6, 1.0); }   // sconces
  twLiftSigns(acc, F); twShaft(acc, TLIFTS[0]);
}
// ---- the Ministry's office floor: rows of desks and typewriters, filing cabinets, a portrait wall
function twDesk(acc, x, z, y, typew = true, solid = true) {
  sbox(acc, 'darkwood', x, y + 0.7, z, 1.6, 0.8, 0.06, 0, { u: 1, v: 1, top: 'deskTop', tu: 1.6 });
  for (const s of [-1, 1]) sbox(acc, 'darkwood', x + s * 0.72, y, z, 0.12, 0.76, 0.7, 0, { u: 1, v: 1 });
  sbox(acc, 'darkwood', x, y + 0.2, z + 0.36, 1.4, 0.04, 0.5, 0, { u: 1, v: 1 });
  if (typew) { sbox(acc, 'typewriter', x - 0.2, y + 0.76, z - 0.05, 0.46, 0.34, 0.16, 0, { u: 0.46, v: 0.16, top: 'typewriter', tu: 0.46 }); plate(acc, 'ceilTile', x + 0.45, y + 0.765, z, 0.3, 0.4, 0, 0, [0, 0, 1, 1]); }
  if (solid) twSolid(x - 0.8, z - 0.4, x + 0.8, z + 0.4, y, y + 0.76);
}
function towerOffices(acc, lamps) {
  const F = TWR.office, [x0, x1, z0, z1] = F.r, y = F.y, H = F.h;
  twWalls(acc, 'officeWall', F.r, y, H, { n: twLiftGaps(F) }, 2, H);
  ground(acc, 'parquet', x0, z0, x1, z1, y + 0.004, 1.6); twCeil(acc, 'ceilTile', F.r, y + H, 1.2);
  for (const z of [320.5, 323.8, 327.1]) for (const x of [-50.4, -46.8, -33.2, -29.6]) twDesk(acc, x, z, y, true, false);   // in pairs: holes in the walk area (TW_DESKS)
  // filing cabinets along the side walls, a portrait wall and the slogan to the south
  for (let z = 319.2; z < 331; z += 0.9) { if (z > 328.5 && z < 330.2) continue; for (const [x, ph] of [[x0 + 0.3, Math.PI / 2], [x1 - 0.3, -Math.PI / 2]]) sbox(acc, 'filing', x, y, z, 0.6, 0.8, 1.3, ph, { u: 0.8, v: 1.3, top: 'iron', tu: 1 }); }
  for (let k = 0; k < 4; k++) plate(acc, 'portraits', -44.4 + k * 2.9, y + 1.85, z0, 1.2, 1.5, 0, 0.03, [k / 4, 0, (k + 1) / 4, 1]);
  plate(acc, 'slogan', -40, y + 3.0, z0, 4.2, 0.55, 0, 0.03);
  for (const x of [-46.4, -33.6]) plate(acc, 'flag_kras', x, y + 2.0, z0, 1.5, 1.0, 0, 0.04);
  plate(acc, 'oakDoor', -40, y + 1.3, z1, 1.6, 2.4, Math.PI, 0.03);
  // light: ceiling lamps over the desks and the aisle
  for (const x of [-48.6, -40, -31.4]) for (const z of [321.5, 327.5]) twLamp(acc, lamps, x, y + H, z, '#ffe2b0', 7.5, 1.25, 'litWarm', 0.5);
  twLamp(acc, lamps, -40, y + H, 331.6, '#ffe2b0', 6, 1.0, 'litWarm', 0.4);
  twLiftSigns(acc, F); twShaft(acc, TLIFTS[1]);
}
// ---- the Ministry archive: shelves of files, the card index, Orlova's desk
function towerArchive(acc, lamps) {
  const F = TWR.archive, [x0, x1, z0, z1] = F.r, y = F.y, H = F.h;
  twWalls(acc, 'archiveWall', F.r, y, H, { n: twLiftGaps(F) }, 2, H);
  ground(acc, 'lino', x0, z0, x1, z1, y + 0.004, 2); twCeil(acc, 'concrete', F.r, y + H, 2);
  for (const z of TWR.shelfRows) for (const [a, b] of [[x0, -45.4], [-34.6, x1]]) {   // rows of shelving off both walls, aisles between (walls of the walk area: twArchiveRects)
    const cx = (a + b) / 2; sbox(acc, 'archiveShelf', cx, y, z, b - a, 0.7, 2.6, 0, { u: 2, v: 2.6, top: 'iron', tu: 1, faceKey: { l: 'iron', r: 'iron' } });
  }
  for (const z of [319.2]) for (const [a, b] of [[x0 + 0.2, -45.4], [-34.6, x1 - 0.2]]) sbox(acc, 'archiveShelf', (a + b) / 2, y, z + 0.15, b - a, 0.3, 2.6, 0, { u: 2, v: 2.6, top: 'iron', tu: 1 });
  // the card index along the south wall, Orlova's desk in front of it
  sbox(acc, 'cardIndex', -40, y, 319.55, 6, 1.1, 1.15, 0, { u: 1.6, v: 0.6, top: 'darkwood', tu: 1, faceKey: { b: 'darkwood', l: 'darkwood', r: 'darkwood' } });
  twDesk(acc, -40, 322.6, y, false, false); sbox(acc, 'litWarm', -40.5, y + 0.76, 322.75, 0.25, 0.25, 0.3, 0, { u: 1, v: 1 }); twLight(lamps, -40.5, y + 1.3, 322.75, '#ffd8a0', 4.5, 1.0);
  plate(acc, 'portraits', -40, y + 2.6, z0, 1.2, 1.5, 0, 0.03, [0.75, 0, 1, 1]);
  plate(acc, 'flag_kras', -36, y + 2.6, z0, 1.5, 1.0, 0, 0.04);
  // fluorescent tubes down the aisles and over the reading floor
  for (const [x, z] of [[-48.7, 323], [-48.7, 326.2], [-48.7, 329.6], [-31.3, 323], [-31.3, 326.2], [-31.3, 329.6], [-40, 324.5], [-40, 330.5]]) {
    sbox(acc, 'fluor', x, y + H - 0.1, z, 1.3, 0.22, 0.08, 0, { u: 1, v: 1 }); twLight(lamps, x, y + H - 0.4, z, '#e8f4ff', 9, 1.45);
  }
  twLiftSigns(acc, F); twShaft(acc, TLIFTS[2]);
}
// ---- the Chairman's office under the cog: oak, a huge desk, flags, the window over the night city
function towerTop(acc, lamps) {
  const F = TWR.top, [x0, x1, z0, z1] = F.r, y = F.y, H = F.h, [w0, w1, ws, wh] = TWR.window;
  twWalls(acc, 'oakPanel', F.r, y, H, { n: twLiftGaps(F) }, 2, H, 's');   // the south wall goes round the window
  wall(acc, 'oakPanel', x0, z0, w0, z0, y, y + H, 2, H); wall(acc, 'oakPanel', w1, z0, x1, z0, y, y + H, 2, H);
  wall(acc, 'oakPanel', w0, z0, w1, z0, y, y + ws, 2, H, { v0: (H - ws) / H }); wall(acc, 'oakPanel', w0, z0, w1, z0, y + wh, y + H, 2, H);
  ground(acc, 'darkwood', w0, z0 - 0.35, w1, z0, y + ws, 1);                                                     // the sill
  aq(acc, 'darkwood', [w0, y + wh, z0], [w1, y + wh, z0], [w1, y + wh, z0 - 0.35], [w0, y + wh, z0 - 0.35], [0, 0, 1, 1], [0, -1, 0], 4);
  for (const x of [w0, w1]) wall(acc, 'darkwood', x, x === w0 ? z0 : z0 - 0.35, x, x === w0 ? z0 - 0.35 : z0, y + ws, y + wh, 1, 1);   // the reveals
  for (let x = w0 + 2; x < w1 - 0.5; x += 2) sbox(acc, 'iron', x, y + ws, z0 - 0.2, 0.1, 0.1, wh - ws, 0, { u: 1, v: 1 });
  sbox(acc, 'iron', (w0 + w1) / 2, y + 3.9, z0 - 0.2, w1 - w0, 0.08, 0.08, 0, { u: 1, v: 1 });
  ground(acc, 'parquet', x0, z0, x1, z1, y + 0.004, 1.6); twCeil(acc, 'ceilTile', F.r, y + H, 1.6);
  aq(acc, 'rugRed', [-44.5, y + 0.012, 324.6], [-35.5, y + 0.012, 324.6], [-35.5, y + 0.012, 330.2], [-44.5, y + 0.012, 330.2], [0, 0, 1, 1], [0, 1, 0], 2);
  aq(acc, 'cog', [-41.6, y + H - 0.01, 328.8], [-38.4, y + H - 0.01, 328.8], [-38.4, y + H - 0.01, 325.6], [-41.6, y + H - 0.01, 325.6], [0, 0, 1, 1], [0, -1, 0], 4);   // under the cog
  // the desk, his chair, a lamp, a telephone, his nameplate; the permit appears on it once he's signed (TWR.permit)
  sbox(acc, 'darkwood', -40, y + 0.74, 327.2, 3.6, 1.4, 0.08, 0, { u: 1, v: 1, top: 'deskTop', tu: 3.6 });
  sbox(acc, 'darkwood', -40, y, 327.75, 3.4, 0.08, 0.74, 0, { u: 1, v: 1 }); for (const s of [-1, 1]) sbox(acc, 'darkwood', -40 + s * 1.45, y, 327.2, 0.6, 1.3, 0.74, 0, { u: 1, v: 1 });
  sbox(acc, 'darkwood', -40, y, 325.9, 0.8, 0.7, 0.48, 0, { u: 1, v: 1, top: 'rugRed', tu: 1 }); sbox(acc, 'darkwood', -40, y + 0.48, 325.6, 0.8, 0.12, 1.1, 0, { u: 1, v: 1 });
  sbox(acc, 'litWarm', -41.2, y + 0.82, 327.0, 0.3, 0.3, 0.32, 0, { u: 1, v: 1 }); sbox(acc, 'phone', -38.7, y + 0.82, 327.0, 0.28, 0.22, 0.12, 0, { u: 0.28, v: 0.12, top: 'phone', tu: 0.28 });
  plate(acc, 'gilt', -40, y + 0.9, 327.82, 0.5, 0.12, Math.PI, 0.01);
  // flags either side of the window, his portrait and a gold cog on the north wall, a cabinet with the decanters
  for (const x of [-47.6, -32.4]) { cyl(acc, 'gilt', x, y, 324.4, 0.05, 0.04, 3.2, 4, { u: 1, v: 1 }); plate(acc, 'flag_kras', x, y + 2.45, 324.4, 1.3, 0.9, Math.PI / 2, 0.66, [0, 0, 1, 1], true); }
  plate(acc, 'portraitChair', -45, y + 2.6, z1, 1.9, 2.5, Math.PI, 0.03);
  plate(acc, 'cog', -35, y + 2.9, z1, 2.2, 2.2, Math.PI, 0.03);
  sbox(acc, 'darkwood', x0 + 0.3, y, 329.5, 0.6, 2, 1.0, 0, { u: 1, v: 1 }); twSolid(x0, 328.5, x0 + 0.6, 330.5, y, y + 1.0);
  sbox(acc, 'archiveShelf', x1 - 0.2, y, 329, 0.4, 3, 2.6, 0, { u: 2, v: 2.6, top: 'darkwood', tu: 1, faceKey: { f: 'darkwood', b: 'darkwood', r: 'darkwood' } }); 
  // light: a chandelier, the desk lamp, the city's glow at the window
  sbox(acc, 'gilt', -40, y + H - 1.0, 330.6, 0.8, 0.8, 0.1, 0, { u: 1, v: 1 }); sbox(acc, 'litWarm', -40, y + H - 0.9, 330.6, 0.6, 0.6, 0.3, 0, { u: 1, v: 1 }); cyl(acc, 'iron', -40, y + H - 0.6, 330.6, 0.03, 0.03, 0.6, 4, { u: 1, v: 1 });
  twLight(lamps, -40, y + H - 1.2, 330.6, '#ffd8a0', 9, 1.35); twLight(lamps, -41.2, y + 1.4, 327.0, '#ffe0a0', 4.5, 1.1);
  twLight(lamps, -40, y + 3.0, z0 + 0.3, '#ff9a5c', 7, 0.6); twLight(lamps, -45, y + 4.5, 331.5, '#ffd8a0', 5, 0.7); twLight(lamps, -35, y + 4.5, 331.5, '#ffd8a0', 5, 0.7);
  twLiftSigns(acc, F);
}
// ---- the shell: four stepped tiers of floodlit stone, gilt bands, banners, the doors; the crown, the cog and the spire
function towerShell(acc, lamps) {
  const T = TWR.tiers, [d0, d1, dh] = TWR.door, cx = -40, cz = 330, o = (top) => ({ u: 8, v: 8, top, tu: 4, cell: 8 });
  for (let i = 0; i < T.length; i++) {
    const [a, b, c, d, y0, y1] = T[i], w = b - a, dd = d - c;
    if (i === 0) {   // the south face goes round the doors
      sbox(acc, 'towerFace', cx, y0, (c + d) / 2, w, dd, y1 - y0, 0, Object.assign(o('granite'), { skip: 'b' }));
      wall(acc, 'towerFace', d0, c, a, c, y0, y1, 8, 8, { cell: 8 }); wall(acc, 'towerFace', b, c, d1, c, y0, y1, 8, 8, { cell: 8, u0: (d1 - a) / 8 });
      wall(acc, 'towerFace', d1, c, d0, c, dh, y1, 8, 8, { cell: 8, u0: (d0 - a) / 8 });
    } else sbox(acc, 'towerFace', cx, y0, (c + d) / 2, w, dd, y1 - y0, 0, o(i === T.length - 1 ? 'roofDark' : 'granite'));
    sbox(acc, 'decoGold', cx, y1 - 0.9, (c + d) / 2, w + 0.5, dd + 0.5, 0.9, 0, { u: 4, v: 0.9, top: false, cell: 8 });   // a gilt band crowns each tier
  }
  // the doors: a bronze frame, the name over them, pilasters; banners and a gold cog up the south face
  for (const x of [d0 - 0.5, d1 + 0.5]) { sbox(acc, 'marbleWall', x, 0, 311.7, 1.0, 0.6, dh + 1.6, 0, { u: 1, v: 8, top: 'gilt', tu: 1 }); twSolid(x - 0.5, 311.4, x + 0.5, 312, 0, dh + 1.6); }
  sbox(acc, 'gilt', cx, dh, 311.75, d1 - d0 + 0.2, 0.5, 0.3, 0, { u: 1, v: 1 });
  plate(acc, 'towerSign', cx, dh + 0.95, 311.4, 9.6, 1.3, Math.PI, 0.02);
  for (const x of [-56, -24]) plate(acc, 'banner', x, 16, 312, 4.2, 18, Math.PI, 0.12);
  for (const x of [-50, -30]) plate(acc, 'banner', x, 42, 316, 3.6, 16, Math.PI, 0.12);
  plate(acc, 'cog', cx, 41, 316, 10, 10, Math.PI, 0.15);
  plate(acc, 'litPanorama', cx, 80 + (TWR.window[2] + TWR.window[3]) / 2, 323, TWR.window[1] - TWR.window[0], TWR.window[3] - TWR.window[2], Math.PI, 0.05);
  // the crown: an octagonal drum, a gilt pinnacle, the cog (two crossed discs so it reads from every side), the spire
  const top = T[T.length - 1][5];
  cyl(acc, 'towerFace', cx, top, cz, 6.4, 6.0, 9, 8, { u: 8, v: 8, cell: 8 });
  sbox(acc, 'decoGold', cx, top + 8.2, cz, 12.6, 12.6, 0.9, 0, { u: 4, v: 0.9, top: 'gilt', tu: 4, cell: 8 });
  frustum(acc, 'gilt', cx, top + 9.1, cz, 9, 9, 6.2, 6.2, 4, 0, { cell: 8 });
  let y = top + 13.1;
  for (const [w0, w1, h] of [[6.2, 4.6, 30], [4.6, 3.2, 25]]) {   // two tapering stone stages of the spire, lit windows all the way up
    frustum(acc, 'towerFace', cx, y, cz, w0, w0, w1, w1, h, 0, { u: 8, v: 8, top: false, cell: 8 }); y += h;
    sbox(acc, 'decoGold', cx, y - 0.8, cz, w1 + 0.4, w1 + 0.4, 0.8, 0, { u: 4, v: 0.8, top: 'gilt', tu: 4, cell: 8 });
  }
  frustum(acc, 'gilt', cx, y, cz, 3.2, 3.2, 1.2, 1.2, 26, 0, { cell: 8 }); y += 26;
  for (const ph of [0, Math.PI / 2]) plate(acc, 'cog', cx, TWR.cogY, cz, TWR.cogD, TWR.cogD, ph, 0, [0, 0, 1, 1], true);
  cyl(acc, 'gilt', cx, y, cz, 0.6, 0.08, TWR.spire - y, 6, { cell: 8 });
  ST.beacons.push([cx, TWR.spire + 1.5, cz]);   // the Krasnovian beacon blinks on top
  // the apron: granite round the base (the strip in front sits a hair low, under Parade Square's own paving)
  const [r0, r1, rz0, rz1] = TWR.rect, [f0, f1, fz0, fz1] = TWR.foot;
  ground(acc, 'granite', r0, rz0, r1, fz0, -0.008, 4);
  for (const [a, b, c, d] of [[r0, f0, fz0, rz1], [f1, r1, fz0, rz1], [f0, f1, fz1, rz1]]) ground(acc, 'granite', a, c, b, d, 0.002, 4);
  ground(acc, 'marble', d0, 310.6, d1, fz0, -0.004, 2);   // the threshold
  // floodlights: posts at the corners, the tiers washed in warm light from the square, the crown in gold
  for (const x of [-62.5, -17.5]) { sbox(acc, 'iron', x, 0, 310.8, 0.5, 0.5, 0.8, 0, { u: 1, v: 1 }); sbox(acc, 'flood', x, 0.8, 310.8, 0.8, 0.4, 0.5, 0, { u: 0.8, v: 0.5 }); twSolid(x - 0.4, 310.4, x + 0.4, 311.2, 0, 1.3); }
  for (const x of [-56, -40, -24]) twLight(lamps, x, 2, 300, '#ffc070', 42, 1.4);
  for (const [y, z, r, k] of [[38, 300, 40, 1.1], [64, 304, 36, 1.1], [86, 308, 30, 1.0]]) twLight(lamps, cx, y, z, '#ffc890', r, k);
  for (const x of [-66, -14]) twLight(lamps, x, 12, cz, '#ffb060', 30, 0.9);
  twLight(lamps, cx, top + 12, cz - 12, '#ffd890', 26, 1.6); twLight(lamps, cx, 150, cz - 14, '#ffd890', 40, 1.2);
}
function twLiftCarMesh(L) {   // the car (walls, floor, ceiling lamp) and two brass leaves that slide apart; it rides as a group
  const acc = new GeoAcc(), [a, b, c, d] = L.car, A = a - 0.02, B = b + 0.02, H = 2.45;
  wall(acc, 'liftCar', A, d, B, d, 0, H, 1, 1); wall(acc, 'liftCar', B, c, B, d, 0, H, 1, 1); wall(acc, 'liftCar', A, d, A, c, 0, H, 1, 1);
  ground(acc, 'marble', A, c, B, d, 0.01, 2);
  aq(acc, 'iron', [A, H, d], [B, H, d], [B, H, c], [A, H, c], [0, 0, 1, 1], [0, -1, 0], 2);
  sbox(acc, 'litWarm', (a + b) / 2, H - 0.08, (c + d) / 2 + 0.4, 0.6, 0.3, 0.06, 0, { u: 1, v: 1 });
  plate(acc, 'cog', (a + b) / 2, 1.7, d, 0.5, 0.5, Math.PI, 0.02);
  const g = new THREE.Group(), m = new THREE.Mesh(acc.geometry({ ambient: [0.62, 0.55, 0.45], lights: [] }), makeMat('street', { baked: true }));
  m.frustumCulled = false; g.add(m);
  for (const s of [-1, 1]) {
    const la = new GeoAcc(); sbox(la, 'liftBrass', 0, 0, 0, (b - a) / 2, 0.05, 2.4, 0, { u: (b - a) / 2, v: 2.4 });
    const lm = new THREE.Mesh(la.geometry({ ambient: [0.55, 0.5, 0.42], lights: [] }), makeMat('street', { baked: true })); lm.frustumCulled = false;
    lm.userData.s = s; g.add(lm); L.leaves.push(lm);
  }
  scene.add(g); L.group = g;
}
function twPermitMesh() {   // the signed permit on the Chairman's desk: hidden until he signs
  const acc = new GeoAcc(), y = TWR.top.y + 0.825;
  aq(acc, 'permit', [-40.3, y, 326.9], [-39.7, y, 326.9], [-39.7, y, 327.35], [-40.3, y, 327.35], [0, 0, 1, 1], [0, 1, 0], 2);
  sbox(acc, 'iron', -39.55, y, 327.1, 0.03, 0.18, 0.03, 0.4, { u: 1, v: 1 });
  const m = new THREE.Mesh(acc.geometry({ ambient: [0.7, 0.62, 0.5], lights: [] }), makeMat('street', { baked: true }));
  m.frustumCulled = false; m.visible = false; m.userData.small = true; scene.add(m); TWR.permit = m;
}
// called from buildStreet(): the shell (outside), the four floors (rooms), the lift cars, the permit
function buildTower() {
  const F = CFG.street.fog, Lt = CFG.street.light, C = CFG.tower.light;
  const mkGeo = (g, o = {}) => {
    const m = new THREE.Mesh(g, makeMat('street', Object.assign({ baked: true }, o)));
    m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false; m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far }; scene.add(m); return m;
  };
  const mk = (acc, light, o) => mkGeo(acc.geometry(light), o);
  // the floors, two to a mesh (lobby + offices, archive + the Chairman's office), each baked with its own ambient and lamps
  const floors = { lobby: towerLobby, office: towerOffices, archive: towerArchive, top: towerTop }, amb = { lobby: C.inAmbient, office: C.inAmbient, archive: C.archiveAmbient, top: C.topAmbient };
  for (const [name, ks] of [['low', ['lobby', 'office']], ['high', ['archive', 'top']]]) {
    let P = [], N = [], U = [], B = [];
    for (const k of ks) {
      const acc = new GeoAcc(), lamps = []; floors[k](acc, lamps);
      P = P.concat(acc.p); N = N.concat(acc.n); U = U.concat(acc.u); B = B.concat(Array.from(bakeLight(acc.p, acc.n, acc.c, { ambient: amb[k], lights: lamps })));
      TWR.tris[k] = acc.tris; TWR.lamps[k] = lamps;
      for (const l of lamps) ST.lamps.push(l);   // goons and props are lit live by the nearest of these
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setAttribute('bake', new THREE.Float32BufferAttribute(B, 3)); g.computeBoundingSphere();
    TWR.meshes[name] = mkGeo(g);
  }
  const sacc = new GeoAcc(), slamps = []; towerShell(sacc, slamps);
  TWR.shell = mk(sacc, { ambient: Lt.skylineAmbient, sky: Lt.skylineSky, lights: slamps }, { fog: CFG.street.skylineFog }); TWR.tris.shell = sacc.tris;
  for (const L of TLIFTS) twLiftCarMesh(L);
  twPermitMesh();
  // where you can walk (in the tower only): the doorway, each floor at its height, the lift cars (their floors ride with them)
  const on = (area) => () => level.name === 'tower' && !LOCKED.has(area), P = 0.3, [d0, d1] = TWR.door;
  for (const L of TLIFTS) L.rect = { x0: L.car[0], x1: L.car[1], z0: L.car[2], z1: L.car[3], y: L.y + 0.001, pad: P, area: L.lock, on: () => level.name === 'tower' && (twInCar(L) || (L.phase !== 'moving' && L.phase !== 'closing' && !LOCKED.has(L.lock))) };
  [ { x0: d0 + 0.5, x1: d1 - 0.5, z0: 310.4, z1: 313.2, pad: P, area: 'twDoor', on: () => (level.name === 'parade' && game.state === 'won') || (level.name === 'tower' && !LOCKED.has('twDoor')) },
    ...twFloorRects('lobby', TW_HOLES.lobby, 'twLobby', on('twLobby'), P), ...twFloorRects('office', TW_HOLES.office, 'twOffice', on('twOffice'), P),
    ...twFloorRects('archive', TW_HOLES.archive(), 'twArchive', on('twArchive'), P), ...twFloorRects('top', TW_HOLES.top, 'twTop', on('twTop'), P),
    ...TLIFTS.map(L => L.rect),
  ].forEach(addWalk);
  // Parade Square's own way up to the doors stays walkable while you're in here, so the doors are shut by a blocker
  // that only exists (has a height) while a fight holds them
  const shut = () => level.name === 'tower' && LOCKED.has('twDoor');
  BLOCKERS.push({ x0: d0, x1: d1, z0: TWR.foot[2] - 0.4, z1: TWR.foot[2], get y0() { return shut() ? 0 : -20; }, get y1() { return shut() ? TWR.door[2] : -20; } });
  resetTowerLifts(0);
}
// A floor with furniture standing in it: the floor's walk rect minus rectangular holes [x0, x1, z0, z1], as a union of walk
// rects (cut into bands at the holes' edges; each band's free stretches). The holes (desks, shelf rows) are then walls of
// the walk area rather than solid boxes: the stacked floors share the physics' z bands, so every box costs every goon on
// every floor, while a walk rect is remembered per particle and costs next to nothing.
function twFloorRects(k, holes, area, on, pad) {
  const { r: [fx0, fx1, fz0, fz1], y, walk = [0, 0, 0] } = TWR[k], x0 = fx0 + walk[0], x1 = fx1 - walk[1], z0 = fz0 + walk[2], out = [];
  const cuts = [...new Set([z0, fz1, ...holes.flatMap(h => [h[2], h[3]])])].filter(z => z >= z0 && z <= fz1).sort((p, q) => p - q);
  for (let i = 0; i < cuts.length - 1; i++) {
    const c = cuts[i], d = cuts[i + 1], m = (c + d) / 2;
    let a = x0; const hs = holes.filter(h => m > h[2] && m < h[3]).sort((p, q) => p[0] - q[0]);
    for (const h of hs) { if (h[0] > a + 0.05) out.push([a, h[0], c, d]); a = Math.max(a, h[1]); }
    if (x1 > a + 0.05) out.push([a, x1, c, d]);
  }
  return out.map(([a, b, c, d]) => ({ x0: a, x1: b, z0: Math.max(z0, c - 0.05), z1: Math.min(fz1, d + 0.05), y, pad, area, on }));
}
const TW_DESKS = [320.5, 323.8, 327.1].flatMap(z => [[-51.2, -46.0, z - 0.4, z + 0.4], [-34.0, -28.8, z - 0.4, z + 0.4]]);   // the office's desk pairs
const TW_HOLES = {   // furniture each floor's walk area goes round
  lobby: [[-47.2, -45.8, 317.3, 318.7], [-34.2, -32.8, 317.3, 318.7], [-47.2, -45.8, 323.3, 324.7], [-34.2, -32.8, 323.3, 324.7], [-41.45, -38.55, 328.55, 331.45]],   // columns, the statue
  office: TW_DESKS,
  archive: () => [...TWR.shelfRows.flatMap(z => [[TWR.archive.r[0], -45.4, z - 0.35, z + 0.35], [-34.6, TWR.archive.r[1], z - 0.35, z + 0.35]]), [-43, -37, 319, 320.1], [-40.8, -39.2, 322.2, 323.0]],   // shelves, the card index, Orlova's desk
  top: [[-41.8, -38.2, 326.5, 327.9], [-31.6 - 0.4, -31.6, 327.5, 330.5]],   // his desk, the bookcase (the decanter cabinet stays a box: bottles stand on it)
};
// rooms: each floor is its own room (by height), the lift cars belong to the floors they join; the lobby looks out
// through the south doors, the Chairman's office through its window
const twIn = (p) => p.x > TWR.foot[0] && p.x < TWR.foot[1] && p.z > TWR.foot[2] + 0.02 && p.z < TWR.foot[3];
function towerRooms() {
  addRoom('twLobby', (p) => twIn(p) && p.y < 10);
  addRoom('twOffice', (p) => twIn(p) && p.y >= 10 && p.y < 38);
  addRoom('twArchive', (p) => twIn(p) && p.y >= 38 && p.y < 78);
  addRoom('twTop', (p) => twIn(p) && p.y >= 78 && p.y < 92);
  const M = TWR.meshes;
  roomMeshes('twLobby', M.low); roomMeshes('twOffice', M.low); roomMeshes('twArchive', M.high); roomMeshes('twTop', M.high);
  for (const L of TLIFTS) for (const r of L.rooms) roomMeshes(r, L.group);
  addPortal('outside', 'twLobby', [-40, 3, TWR.foot[2]], () => (level.name === 'tower' && player.floorY < 6) || (level.name === 'parade' && game.state === 'won'));
  addPortal('twTop', 'outside', [-40, TWR.top.y + 3, TWR.top.r[2]], () => level.name === 'tower' && player.floorY > 70);
}
// ---- the rides
// in the car: past the doorway's wall plane (a locked car's floor is off, so the floor's own edge holds you at the doorway)
const twInCar = (L) => { const h = player.head, [a, b, , d] = L.car; return h.x > a - 0.05 && h.x < b + 0.05 && h.z > TWR.wallZ + 0.1 && h.z < d + 0.1 && Math.abs(player.floorY - L.y) < 0.8; };
function resetTowerLifts(ridden) {   // ridden: how many lifts you've already taken (0 from the doors; 3 = at the top)
  TLIFTS.forEach((L, i) => { L.stop = i < ridden ? 1 : 0; L.phase = 'open'; L.doors = 1; L.t = 0; L.y = L.stops[L.stop]; if (L.rect) L.rect.y = L.y + 0.001; });
  CFG.floors.maxRise = CFG.tower.restRise; placeTowerLifts();
}
function placeTowerLifts() {
  for (const L of TLIFTS) {
    if (!L.group) continue;
    L.group.position.y = L.y; L.group.updateMatrixWorld(true);
    const [a, b, c] = L.car, half = (b - a) / 2, mid = (a + b) / 2;
    for (const lm of L.leaves) { lm.position.set(mid + lm.userData.s * half * (0.5 + L.doors * 0.98), 0, c + 0.06); lm.updateMatrixWorld(true); }
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
    if (L.phase === 'open' && L.stop === 0 && twInCar(L) && L.needs.every(i => level.encounter >= i) && game.state === 'walk') { L.phase = 'closing'; L.t = 0; AU.bell(); }
    else if (L.phase === 'closing') { L.doors = Math.max(0, L.doors - dt / C.doorTime); if (L.doors === 0) { L.phase = 'moving'; L.t = 0; CFG.floors.maxRise = C.liftSpeed * 1.6; showSign('twUp', 1.6); } }
    else if (L.phase === 'moving') { if (twRide(L, L.stops[1], C.liftSpeed, dt)) { L.stop = 1; L.phase = 'opening'; L.t = 0; AU.bell(); showSign(L.arrive, 1.8); } }
    else if (L.phase === 'opening') { L.doors = Math.min(1, L.doors + dt / C.doorTime); if (L.doors >= 1) { L.phase = 'open'; CFG.floors.maxRise = C.restRise; } }
    L.rect.y = L.y + 0.001;
  }
  placeTowerLifts();
  // the Chairman: until his own goon lands (with `signs: true`, calling onLeaderSigned), beating the last fight is his signature
  const last = C.encounters.length - 1;
  if (!TWR.signed && level.encounter === last && game.state === 'fight' && !game.queue.length && enemies.length && enemies.every(e => !e.alive)) towerSigned(null);
  if (TWR.signed && !TWR.act1 && (TWR.signT += dt) > C.signPause) { TWR.act1 = true; showSign('act1', 1e9); AU.bell(); }
  if (TWR.permit) TWR.permit.visible = TWR.signed && roomState.cur === 'twTop';
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
  outside: () => [TWR.shell], rects: [TWR.rect],
  start: (f) => startTower(f), update: (dt) => updateTower(dt),
  after: 'parade', enter: () => player.head.z > 312.6,                                     // through the big south doors
  signs: { tower: ['THE TOWER OF LABOR', '#f2c14e'], twLobby: ['FIGHT!', '#f2c14e'], twOffices: ['FIGHT!', '#f2c14e'], orlova: ['INSPECTOR ORLOVA', '#e8352b'],
           chairman: ['THE CHAIRMAN', '#f2c14e'], twUp: ['GOING UP', '#33e0d0'], twMinistry: ['THE MINISTRY', '#33e0d0'], twArchive: ['THE ARCHIVE', '#33e0d0'],
           twTop: ['THE TOP FLOOR', '#33e0d0'], signed1: ['SIGNED · 1 OF 3', '#33e0d0'], signed2: ['SIGNED · 2 OF 3', '#33e0d0'], signed3: ['SIGNED · 3 OF 3', '#33e0d0'],
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
  for (const [type, x, z, y] of CFG.tower.props) new Prop(type, new V3(x, y || 0, z));
  if (!fromSquare) { placePlayer(CFG.tower.start[0], CFG.tower.start[1], Math.PI); rig.position.y = 0; }
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  showSign('tower', 2.2);
}
