'use strict';
// ============================== Act 1: Parade Square =========================================
// Out of the Palace of Sport's north doors onto Parade Square at night: the May Day parade's rehearsal under floodlights.
// Granite paving with the red route running from the Palace's doors to the Tower of Labor's, faded banners on poles down
// both sides, portrait floats on wheeled platforms, the brass band's drums and music stands, the gymnasts' mats, empty
// bleachers on the east side, the Ministry of Order's grey stepped front on the west, and the reviewing stand at the
// north end in front of the Tower's doors (the Tower itself is its own level). One flat floor: no stairs, no ramps.
// Authored running +z from the Palace's doors to the Tower's (the Ministry on the local west, -x), and laid into the world
// running west into the sector by the ACT1_WEST frame (src/levels.js): there the Tower is due west, the Ministry on the
// south side. CFG.parade is in the frame's coordinates. One baked mesh on the street atlas.
CFG.parade = {
  start: [-40, 254.8],                         // "start here": just out of the Palace of Sport's doors, facing the Tower
  spawnGap: 1.1, clearedPause: 1.6, healBetween: 20,
  // walk past `trigger` (z) and you're held between arena[0] and arena[1] until it's clear. spawn: [type, x, z];
  // respawn: [x, z, floor y, facing]. Goons not built yet stand in (ENEMY_FALLBACK in src/levels.js).
  encounters: [
    { name: 'guard', trigger: 258, arena: [254.3, 276], respawn: [-40, 257, 0, Math.PI], sign: 'guardFight', lock: ['prDoor'],
      spawn: [['guard', -44, 273.5], ['guard', -36, 273.5], ['conscript', -62, 261], ['conscript', -18, 262]] },
    { name: 'gymnasts', trigger: 279, arena: [275.5, 295], respawn: [-40, 279.5, 0, Math.PI], sign: 'gymFight', lock: ['prDoor'],
      spawn: [['gymnast', -62, 284], ['gymnast', -59, 289.5], ['gymnast', -33, 292], ['laborer', -17, 278]] },
    { name: 'band', trigger: 296.5, arena: [294, 311.7], respawn: [-40, 297, 0, Math.PI], sign: 'bandFight', lock: ['prDoor'],
      spawn: [['bandsman', -33, 300.6], ['bandsman', -16, 294.8], ['specialist', -40, 310.4], ['guard', -56, 301], ['conscript', -66, 296]] },
  ],
  // crates of rehearsal kit, bins, a cast-iron sign ([type, x, z])
  props: [['crate', -50.6, 262.6], ['crate', -50.4, 263.5], ['bin', -30.4, 261.8], ['sign', -64, 268.5], ['crate', -19.6, 281],
          ['bin', -51, 289], ['crate', -60.5, 298.5], ['sign', -20.5, 291.5], ['bin', -47.6, 301.4], ['crate', -14.6, 271]],
  light: { flood: '#ffe2b4', floodRadius: 21, floodK: 3.6, floodY: 8,   // the masts: warm-white pools on the four fight zones, darker between
           sodiumRadius: 12, sodiumK: 1.5,                             // sodium lamps at the Palace doors, the ministry, the bleachers
           stand: '#fff0d4', standRadius: 16, standK: 1.9,             // the doorway between the stand's wings: the goal
           foot: '#ffd8a0', footRadius: 9, footK: 1.5 },               // each float's footlight on its portrait
  // walking out of the Palace's north doors: once you're out from under the doors' canopy (z, with the whole Tower over
  // you), THE TOWER OF LABOR in gold, hung low (y above the floor) so it sits under the Tower, not on it, and a chime;
  // then PARADE SQUARE, if no fight has started by then. Once per walk-in.
  reveal: { z: 255.0, dur: 3.0, y: 0.9, then: 2.2 },
  drawNear: [205, 20],   // the square's mesh is drawn within 205 m of its middle or from over 20 m up: from Tripoint Square,
                         // the road and the gate the Palace and the slabs hide all of it (src/rooms.js: userData.near)
};
const PR = {
  rect: [-84, -6, 253, 312],                   // the ground it occupies (the far city keeps off it)
  sq: [-71.7, -11.9, 254.3, 311.7],            // where you walk (body centre; walls at the edges)
  door: [-42, -38, 252, 253],                  // the Palace of Sport's north doors (the other level draws them)
  towerDoor: [-44, -36, 312],                  // the Tower of Labor's doors (the other level draws them)
  ministry: [-84, -72, 257, 309],              // 13 bays of 4 m; the central three (277-289) rise into the clock tower
  risalit: [277, 289],
  stand: [[-64, -45.2, 303.5, 311], [-34.8, -16, 303.5, 311]],
  floats: [[-55, 266, 'prHero1'], [-25, 266, 'prHero2'], [-24, 284, 'prHero3']],   // the third (the miner) is still being painted
  // the truck crane hoisting the Chairman's portrait up the Ministry's face: the truck [x0, x1, z0, z1], the boom's foot and
  // its tip (right over the portrait), the portrait [x, z, y0, y1, width], the scaffold tower beside it [x0, x1, z0, z1, top]
  crane: { truck: [-71.2, -68.6, 264.5, 273.5], foot: [-69.9, 3.6, 267.4], tip: [-70.4, 26.6, 283] },
  portrait: [-70.4, 283, 9.2, 19.6, 8],
  scaffold: [-72, -70.8, 289.4, 292.6, 21.6],
  programme: [-48.2, 259.2],                   // the running order on a board, on your right as you come out
  // the mesh is drawn as chunks (by where each triangle's middle lies: these x and z edges) that the camera culls
  chunkX: [-58, -30], chunkZ: [273, 293],
  mats: [-67, -55, 279, 291],
  bleachers: [-11.6, -6.1, 258, 300],
  masts: [[-69.6, 257.6, -52, 268], [-13.4, 257.6, -28, 268], [-69.6, 300.4, -52, 292], [-13.4, 300.4, -28, 292]],   // [x, z, where its pool falls]
  acc: null, mesh: null, meshes: [], ranges: [], lamps: [], tris: 0,
  reveal: { due: false, shown: false, t: 0, then: false },   // the walk-in's reveal (CFG.parade.reveal)
};
function prSolid(x0, z0, x1, z1, h) { WORLD_BOXES.push([x0, 0, z0, x1, h, z1]); BLOCKERS.push({ x0, x1, z0, z1 }); }
function prLight(x, y, z, col, r, k) { PR.lamps.push(lightFromHex([x, y, z], col, r, k)); }
// flat paving, its texture starting at (x0, z0) so the repeats line up with the light cells
function prPave(acc, key, x0, z0, x1, z1, y, T, cell) { aq(acc, key, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [0, 0, (x1 - x0) / T, (z1 - z0) / T], [0, 1, 0], cell); }
// a square-section beam from A to B, wA wide at A and wB at B (a boom, a cable, a PA horn); its four sides get the whole
// painting along its length; ends: a painting for the B end (a horn's mouth)
function prBeam(acc, key, A, B, wA, wB, ends) {
  const d = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], L = Math.hypot(d[0], d[1], d[2]), t = d.map(v => v / L);
  let a = [-t[2], 0, t[0]]; const la = Math.hypot(a[0], a[2]); a = la < 1e-6 ? [1, 0, 0] : [a[0] / la, 0, a[2] / la];
  const b = [t[1] * a[2] - t[2] * a[1], t[2] * a[0] - t[0] * a[2], t[0] * a[1] - t[1] * a[0]];
  const S = [[-1, -1], [1, -1], [1, 1], [-1, 1]], at = (P, w, s) => [0, 1, 2].map(k => P[k] + (a[k] * s[0] + b[k] * s[1]) * w / 2);
  for (let i = 0; i < 4; i++) {
    const s0 = S[i], s1 = S[(i + 1) % 4], n = [0, 1, 2].map(k => a[k] * (s0[0] + s1[0]) + b[k] * (s0[1] + s1[1]));
    aq(acc, key, at(B, wB, s0), at(B, wB, s1), at(A, wA, s1), at(A, wA, s0), [0, 0, 1, 1], n, 99);
  }
  if (ends) aq(acc, ends, at(B, wB, S[0]), at(B, wB, S[1]), at(B, wB, S[2]), at(B, wB, S[3]), [0, 0, 1, 1], t, 99);
}
// a picture flat on the paving (chalk, cables, a drop cloth), read the right way up walking toward the Tower (+z);
// cut into cells like the paving under it so its baked light matches
function prDecal(acc, key, x0, z0, x1, z1, y = 0.014, uv = [1, 1, 0, 0], cell = 4) { aq(acc, key, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], uv, [0, 1, 0], cell); }
function prStrip(acc, key, A, B, w, y = 0.016) {   // a cable lying on the paving from A to B ([x, z])
  const dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), nx = -dz / L * w / 2, nz = dx / L * w / 2;
  aq(acc, key, [A[0] + nx, y, A[1] + nz], [B[0] + nx, y, B[1] + nz], [B[0] - nx, y, B[1] - nz], [A[0] - nx, y, A[1] - nz], [0, 0, 1, 1], [0, 1, 0], 99);
}
function prSodium(acc, x, z, dir) {   // a concrete post with a cobra head, sodium orange; dir: which way the arm reaches (x)
  const L = CFG.parade.light;
  sbox(acc, 'concrete', x, 0, z, 0.3, 0.3, 6.6, 0, { u: 1, v: 2, cell: 99 });
  sbox(acc, 'iron', x + dir * 0.8, 6.5, z, 1.7, 0.16, 0.12, 0, { u: 1, v: 1, cell: 99 });
  sbox(acc, 'litSodium', x + dir * 1.5, 6.3, z, 0.7, 0.35, 0.22, 0, { u: 1, v: 1, cell: 99 });
  prLight(x + dir * 1.5, 6.0, z, CFG.street.light.sodium, L.sodiumRadius, L.sodiumK);
  prSolid(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 6.6);
}
// ---- the square: granite, the red route, rehearsal marks
function prSquare(acc) {
  const [x0, x1] = [-72, -6];
  // light lives on a 4 m grid here (one slab repeat): the pools are 20 m across, so finer cells only cost triangles
  for (const [a, b] of [[x0, -42], [-38, x1]]) { prPave(acc, 'prGranite', a, 254, b, 310, 0, 4, 4); prPave(acc, 'prGranite', a, 253, b, 254, 0, 4, 4); prPave(acc, 'prGranite', a, 310, b, 312, 0, 4, 4); }
  prPave(acc, 'prRoute', -42, 253, -38, 312, 0, 4, 4);   // the route: from the Palace's doors to the Tower's, cut into the paving (no overlap to flicker)
  // the rehearsal, chalked on the granite: the honour guard's two blocks either side of the route, then the columns' numbered halts
  prDecal(acc, 'prChalk', -50.5, 258.6, -42.5, 270.6); prDecal(acc, 'prChalk', -37.5, 258.6, -29.5, 270.6);
  for (let k = 0; k < 5; k++) for (const x of [-43.3, -36.7]) prDecal(acc, 'prMark', x - 0.6, 276 + k * 6 - 0.6, x + 0.6, 276 + k * 6 + 0.6, 0.014, [1, (k + 1) / 5, 0, k / 5], 99);
  // cable runs from the masts to the floats' footlights, the band and the stand, and a rubber ramp where they cross the route
  for (const [A, B] of [[[-69.2, 258.2], [-57.6, 263.6]], [[-13.8, 258.2], [-22.4, 263.6]], [[-13.8, 299.8], [-21, 298.8]], [[-21, 298.8], [-30.4, 302.6]],
                        [[-30.4, 302.6], [-49.6, 302.6]], [[-69.2, 299.8], [-49.6, 302.6]], [[-26.4, 268.4], [-26.4, 281.6]]]) prStrip(acc, 'black', A, B, 0.1);
  prDecal(acc, 'prCableRamp', -42.3, 302.35, -37.7, 302.85, 0.03, [0, 0, 1, 1], 99);
}
// ---- banners on poles down both sides, facing the way you walk
function prBannerPole(acc, x, z) {
  sbox(acc, 'iron', x, 0, z, 0.14, 0.14, 10.4, 0, { u: 1, v: 1, cell: 99 });
  sbox(acc, 'iron', x, 9.7, z, 1.9, 0.08, 0.08, 0, { u: 1, v: 1, cell: 99 });
  sbox(acc, 'gilt', x, 10.4, z, 0.3, 0.3, 0.3, 0, { u: 1, v: 1, cell: 99 });
  plate(acc, 'prBanner', x, 7.3, z, 1.7, 4.8, Math.PI, 0.03, [0, 0, 1, 1], true);
  prSolid(x - 0.12, z - 0.12, x + 0.12, z + 0.12, 10.4);
}
// ---- the floodlight masts: a steel lattice, a bank of six lamps turned to the square
function prMast(acc, x, z, cx, cz) {
  const L = CFG.parade.light, d = Math.hypot(cx - x, cz - z), ux = (cx - x) / d, uz = (cz - z) / d, phi = Math.atan2(ux, uz);
  frustum(acc, 'prLattice', x, 0, z, 1.2, 1.2, 0.5, 0.5, 14, 0, { u: 1.25, v: 14.1, top: false, cell: 99 });   // (each face one painting: 8 triangles)
  sbox(acc, 'iron', x, 13.8, z, 0.7, 0.7, 0.3, 0, { u: 1, v: 1, cell: 99 });
  sbox(acc, 'iron', x + ux * 0.3, 13.9, z + uz * 0.3, 4.4, 0.4, 3.2, phi, { u: 1, v: 1, cell: 99 });
  plate(acc, 'prFloodBank', x + ux * 0.3, 15.5, z + uz * 0.3, 4.2, 3.0, phi, 0.21);
  for (const s of [-1, 1]) {   // two PA horns under the bank, for the rehearsal's announcer
    const [hx, hz] = LP(x, z, phi, s * 0.5, 0.2), [mx, mz] = LP(x, z, phi, s * 0.9, 1.3);
    prBeam(acc, 'iron', [hx, 12.9, hz], [mx, 12.5, mz], 0.14, 0.6, 'black');
  }
  prLight(cx, L.floodY, cz, L.flood, L.floodRadius, L.floodK);
  if (x < -60) prLight(x - 1.2, 13.5, z, L.flood, 14, 1.2);   // their spill washes the Ministry's face behind them
  prSolid(x - 0.6, z - 0.6, x + 0.6, z + 0.6, 14);
}
// ---- a portrait float: a draped platform on wheels, a giant portrait (an invented worker) facing the way you come
function prFloat(acc, fx, fz, key) {
  const L = CFG.parade.light;
  sbox(acc, 'prSkirt', fx, 0.25, fz, 5.2, 3.4, 1.05, 0, { u: 2, v: 1.05, top: 'prBoards', tu: 2 });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) sbox(acc, 'black', fx + sx * 1.9, 0, fz + sz * 1.62, 0.7, 0.32, 0.62, 0, { u: 1, v: 1, cell: 99 });
  sbox(acc, 'iron', fx, 0.35, fz - 2.3, 0.12, 1.4, 0.1, 0, { u: 1, v: 1, cell: 99 });   // the tow bar
  sbox(acc, 'prPlywood', fx, 1.3, fz + 0.6, 4.6, 0.25, 5.8, 0, { u: 2, v: 2, top: 'iron', cell: 99 });
  aq(acc, key, [fx + 2.2, 6.9, fz + 0.46], [fx - 2.2, 6.9, fz + 0.46], [fx - 2.2, 1.4, fz + 0.46], [fx + 2.2, 1.4, fz + 0.46], [0, 0, 1, 1], [0, 0, -1], 1.4);
  for (const s of [-1, 1]) {   // struts behind; flags on the front corners
    sbox(acc, 'iron', fx + s * 1.6, 1.3, fz + 1.3, 0.1, 0.1, 4.2, 0, { u: 1, v: 1, cell: 99 });
    sbox(acc, 'iron', fx + s * 2.35, 1.3, fz - 1.5, 0.06, 0.06, 2.2, 0, { u: 1, v: 1, cell: 99 });
    plate(acc, 'flag_kras', fx + s * 2.35 - 0.47, 3.15, fz - 1.5, 0.9, 0.6, Math.PI, 0, [0, 0, 1, 1], true);
  }
  sbox(acc, 'litWarm', fx, 1.3, fz - 1.3, 0.8, 0.3, 0.2, 0, { u: 1, v: 1, cell: 99 });   // the footlight
  prLight(fx, 1.6, fz - 2.6, L.foot, L.footRadius, L.footK);
  WORLD_BOXES.push([fx - 2.6, 0, fz - 1.7, fx + 2.6, 1.3, fz + 1.7], [fx - 2.3, 1.3, fz + 0.45, fx + 2.3, 7.1, fz + 0.75]);
  BLOCKERS.push({ x0: fx - 2.7, x1: fx + 2.7, z0: fz - 2.4, z1: fz + 1.8 });
  if (key === 'prHero3') {   // still being painted: a ladder against it, a drop cloth, tins of the portrait's colours, a sign
    for (const s of [1, -1]) aq(acc, 'prLadder', [fx + 1.3, 5.9, fz + 0.38], [fx + 1.85, 5.9, fz + 0.38], [fx + 1.85, 1.3, fz - 1.0], [fx + 1.3, 1.3, fz - 1.0], [0, 0, 1, 1], [0, 0.3 * s, -s], 99);
    aq(acc, 'prDropCloth', [fx - 2.2, 1.32, fz - 1.6], [fx + 0.6, 1.32, fz - 1.6], [fx + 0.6, 1.32, fz - 0.1], [fx - 2.2, 1.32, fz - 0.1], [0, 0, 1, 1], [0, 1, 0], 99);
    for (const [dx, dz, top] of [[-1.6, -0.9, 'lacquer'], [-1.15, -0.6, 'gilt'], [-0.5, -1.05, 'white']]) { cyl(acc, 'prTin', fx + dx, 1.3, fz + dz, 0.16, 0.16, 0.24, 6, { u: 1, v: 0.24, cell: 99 }); aq(acc, top, [fx + dx - 0.12, 1.55, fz + dz - 0.12], [fx + dx + 0.12, 1.55, fz + dz - 0.12], [fx + dx + 0.12, 1.55, fz + dz + 0.12], [fx + dx - 0.12, 1.55, fz + dz + 0.12], [0, 0, 1, 1], [0, 1, 0], 99); }
    plate(acc, 'prWetPaint', fx, 0.95, fz - 2.36, 1.1, 0.22, Math.PI, 0.02);
  }
}
// ---- the reviewing stand: two draped wings either side of the Tower's doors, canopies, slogans, two flags
function prStand(acc) {
  const L = CFG.parade.light;
  for (const [i, [x0, x1, z0, z1]] of PR.stand.entries()) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
    sbox(acc, 'prStand', cx, 0, cz, w, d, 2.6, 0, { u: 4, v: 2.6, top: 'prBoards', tu: 2, cell: 4 });
    sbox(acc, 'prSkirt', cx, 2.6, z0 + 0.15, w, 0.3, 1.0, 0, { u: 2, v: 1.0, top: 'prSkirt', tu: 2, cell: 4 });   // the draped parapet
    for (const [px, pz] of [[x0 + 0.4, z0 + 0.6], [x1 - 0.4, z0 + 0.6], [x0 + 0.4, z1 - 0.4], [x1 - 0.4, z1 - 0.4]]) sbox(acc, 'iron', px, 2.6, pz, 0.16, 0.16, 3.6, 0, { u: 1, v: 1, cell: 99 });
    sbox(acc, 'prCanopy', cx, 6.2, cz - 0.3, w + 0.6, d + 0.4, 0.6, 0, { u: 2, v: 0.6, top: 'roofDark', tu: 4, cell: 4 });
    sbox(acc, 'iron', cx, 6.8, z0 - 0.4, w * 0.72, 0.16, 1.9, 0, { u: 1, v: 1, cell: 99 });
    plate(acc, i ? 'prStandSign2' : 'prStandSign', cx, 7.75, z0 - 0.4, w * 0.7, w * 0.7 * 14 / 92, Math.PI, 0.09);
    sbox(acc, 'litWarm', cx, 6.1, z0 + 0.5, w * 0.6, 0.12, 0.1, 0, { u: 1, v: 1, cell: 99 });
    prLight(cx, 5.5, z0 + 1.2, '#ffd8a0', 10, 1.2);
    prSolid(x0, z0, x1, z1, 3.6);
  }
  // the flags either side of the Tower's doors, with floods on them aimed down the approach
  for (const x of [-45.8, -34.2]) {
    sbox(acc, 'iron', x, 0, 303.1, 0.18, 0.18, 11.5, 0, { u: 1, v: 1, cell: 99 });
    sbox(acc, 'gilt', x, 11.5, 303.1, 0.36, 0.36, 0.36, 0, { u: 1, v: 1, cell: 99 });
    plate(acc, 'flag_kras', x - 1.55, 10.2, 303.1, 3.0, 2.0, Math.PI, 0, [0, 0, 1, 1], true);
    sbox(acc, 'iron', x + (x < -40 ? 0.3 : -0.3), 6.6, 302.9, 0.6, 0.4, 0.4, 0, { u: 1, v: 1, cell: 99 });
    plate(acc, 'flood', x + (x < -40 ? 0.3 : -0.3), 6.8, 302.9, 0.5, 0.3, Math.PI, 0.21);
    prSolid(x - 0.15, 302.95, x + 0.15, 303.25, 11.5);
  }
  prLight(-40, 7.5, 303.5, L.stand, L.standRadius, L.standK);
}
// ---- the brass band: a bass drum, kettle drums, snares, a cymbal, music stands and chairs
function prHDrum(acc, cx, cy, cz, r, len, n = 8) {   // a drum lying on its side, its heads facing -z / +z
  for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2;
    const P = (a, z) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z];
    aq(acc, 'prDrum', P(a1, cz - len / 2), P(a0, cz - len / 2), P(a0, cz + len / 2), P(a1, cz + len / 2), [0, 0, 2 * Math.PI * r / n / 0.5, 1], [Math.cos(am), Math.sin(am), 0], 99);
  }
  aq(acc, 'prDrumHead', [cx + r, cy + r, cz - len / 2], [cx - r, cy + r, cz - len / 2], [cx - r, cy - r, cz - len / 2], [cx + r, cy - r, cz - len / 2], [0, 0, 1, 1], [0, 0, -1], 99);
  aq(acc, 'prDrumHead', [cx - r, cy + r, cz + len / 2], [cx + r, cy + r, cz + len / 2], [cx + r, cy - r, cz + len / 2], [cx - r, cy - r, cz + len / 2], [0, 0, 1, 1], [0, 0, 1], 99);
}
function prHeadUp(acc, x, y, z, r) { aq(acc, 'prDrumHead', [x - r, y, z - r], [x + r, y, z - r], [x + r, y, z + r], [x - r, y, z + r], [0, 0, 1, 1], [0, 1, 0], 99); }
function prBand(acc) {
  // the bass drum on its cradle, front and centre
  const bx = -24.5, bz = 296.2;
  sbox(acc, 'iron', bx, 0, bz, 1.1, 0.6, 0.22, 0, { u: 1, v: 1, cell: 99 });
  prHDrum(acc, bx, 0.95, bz, 0.78, 0.55); prSolid(bx - 0.8, bz - 0.35, bx + 0.8, bz + 0.35, 1.75);
  // kettle drums
  for (const [x, z] of [[-29.6, 296.4], [-28.2, 297.8]]) {
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; sbox(acc, 'iron', x + Math.cos(a) * 0.4, 0, z + Math.sin(a) * 0.4, 0.05, 0.05, 0.4, 0, { u: 1, v: 1, top: false, cell: 99 }); }
    cyl(acc, 'prTimpani', x, 0.35, z, 0.2, 0.55, 0.55, 8, { u: 0.9, v: 0.55, cell: 99 }); prHeadUp(acc, x, 0.9, z, 0.55);
    prSolid(x - 0.55, z - 0.55, x + 0.55, z + 0.55, 0.9);
  }
  // snare drums on stands, a cymbal
  for (const [x, z] of [[-21.6, 296.6], [-20.4, 297.4], [-22.8, 297.2]]) {
    sbox(acc, 'iron', x, 0, z, 0.05, 0.05, 0.62, 0, { u: 1, v: 1, top: false, cell: 99 });
    cyl(acc, 'prDrum', x, 0.62, z, 0.3, 0.3, 0.26, 6, { u: 0.5, v: 0.26, cell: 99 }); prHeadUp(acc, x, 0.88, z, 0.3);
    prSolid(x - 0.3, z - 0.3, x + 0.3, z + 0.3, 0.88);
  }
  sbox(acc, 'iron', -19.2, 0, 298.6, 0.05, 0.05, 1.5, 0, { u: 1, v: 1, top: false, cell: 99 }); sbox(acc, 'gilt', -19.2, 1.5, 298.6, 0.7, 0.7, 0.03, 0, { u: 1, v: 1, cell: 99 });
  prSolid(-19.4, 298.4, -19.0, 298.8, 1.5);
  // the brass section: music stands (sheets toward their chairs) and folding chairs, in two rows
  for (const [i, [x, z]] of [[-29.5, 299.6], [-27.5, 299.9], [-25.5, 300.1], [-23.5, 300.1], [-21.5, 299.9], [-19.5, 299.6]].entries()) {
    if (i === 1 || i === 4) {   // blown over in the wind off the square: the stand on its side, its music scattered, the chair still there
      const s = i === 1 ? -1 : 1;
      prBeam(acc, 'iron', [x, 0.04, z], [x + s * 0.75, 0.04, z - 0.72], 0.05, 0.05);
      aq(acc, 'iron', [x + s * 0.7, 0.03, z - 0.95], [x + s * 1.1, 0.03, z - 0.6], [x + s * 0.9, 0.03, z - 0.38], [x + s * 0.5, 0.03, z - 0.73], [0, 0, 1, 1], [0, 1, 0], 99);
      for (const [dx, dz, r] of [[0.3, -1.6, 0.4], [1.1, -1.25, -0.7], [-0.5, -2.2, 1.2], [1.6, -2.6, 0.2]]) {
        const c = Math.cos(r) * 0.17, sn = Math.sin(r) * 0.17, px = x + s * dx, pz = z + dz;
        aq(acc, 'prSheet', [px - c + sn * 1.3, 0.02, pz + sn + c * 1.3], [px + c + sn * 1.3, 0.02, pz - sn + c * 1.3], [px + c - sn * 1.3, 0.02, pz - sn - c * 1.3], [px - c - sn * 1.3, 0.02, pz + sn - c * 1.3], [0, 0, 1, 1], [0, 1, 0], 99);
      }
      sbox(acc, 'lacquer', x, 0.42, z + 0.75, 0.42, 0.42, 0.05, 0, { u: 1, v: 1, cell: 99 }); sbox(acc, 'lacquer', x, 0.47, z + 0.95, 0.42, 0.04, 0.45, 0, { u: 1, v: 1, cell: 99 });
      for (const t of [-1, 1]) sbox(acc, 'iron', x + t * 0.18, 0, z + 0.75, 0.03, 0.42, 0.42, 0, { u: 1, v: 1, top: false, cell: 99 });
      prSolid(x - 0.22, z + 0.53, x + 0.22, z + 0.97, 0.92);
      continue;
    }
    sbox(acc, 'iron', x, 0, z, 0.04, 0.04, 1.05, 0, { u: 1, v: 1, top: false, cell: 99 });
    sbox(acc, 'iron', x, 1.0, z, 0.5, 0.03, 0.36, 0, { u: 1, v: 1, cell: 99 });
    plate(acc, 'prSheet', x, 1.18, z, 0.44, 0.32, 0, 0.02);
    sbox(acc, 'lacquer', x, 0.42, z + 0.75, 0.42, 0.42, 0.05, 0, { u: 1, v: 1, cell: 99 }); sbox(acc, 'lacquer', x, 0.47, z + 0.95, 0.42, 0.04, 0.45, 0, { u: 1, v: 1, cell: 99 });
    for (const s of [-1, 1]) sbox(acc, 'iron', x + s * 0.18, 0, z + 0.75, 0.03, 0.42, 0.42, 0, { u: 1, v: 1, top: false, cell: 99 });
    prSolid(x - 0.1, z - 0.1, x + 0.1, z + 0.1, 1.4); prSolid(x - 0.22, z + 0.53, x + 0.22, z + 0.97, 0.92);
  }
  // the basses' sousaphones parked on their stands behind the chairs, bells to the square: big gilt rings under the floods
  for (const x of [-28.5, -24.5, -20.5]) {
    sbox(acc, 'iron', x, 0, 301.9, 0.06, 0.06, 1.3, 0, { u: 1, v: 1, top: false, cell: 99 });
    cyl(acc, 'gilt', x, 1.1, 301.9, 0.14, 0.5, 0.75, 8, { u: 1, v: 1, cell: 99 }); prHeadUp(acc, x, 1.84, 301.9, 0.36);
    prSolid(x - 0.3, 301.6, x + 0.3, 302.2, 1.9);
  }
  // the conductor's podium out front, his score on its stand facing him
  sbox(acc, 'lacquer', -24.5, 0, 293.6, 1.0, 1.0, 0.32, 0, { u: 1, v: 1, top: 'prBoards', tu: 1, cell: 99 }); prSolid(-25, 293.1, -24, 294.1, 0.32);
  sbox(acc, 'iron', -24.5, 0, 294.5, 0.04, 0.04, 1.2, 0, { u: 1, v: 1, top: false, cell: 99 }); sbox(acc, 'iron', -24.5, 1.15, 294.5, 0.5, 0.03, 0.36, 0, { u: 1, v: 1, cell: 99 });
  plate(acc, 'prSheet', -24.5, 1.33, 294.5, 0.44, 0.32, Math.PI, 0.02); prSolid(-24.6, 294.4, -24.4, 294.6, 1.4);
  // the band's banner on two poles behind the chairs
  for (const x of [-30.6, -18.4]) { sbox(acc, 'iron', x, 0, 302.3, 0.08, 0.08, 3.4, 0, { u: 1, v: 1, cell: 99 }); prSolid(x - 0.1, 302.2, x + 0.1, 302.4, 3.4); }
  plate(acc, 'prBandSign', -24.5, 2.85, 302.3, 12, 1.2, Math.PI, 0, [0, 0, 1, 1], true);
}
// ---- the gymnasts: a floor of mats (blue in a red border), a vaulting horse, a beam
function prGym(acc) {
  const [x0, x1, z0, z1] = PR.mats;
  prPave(acc, 'prMat', x0, z0, x1, z1, 0.04, 2, 2);
  for (const [a, b, c, d] of [[x0 - 1, x1 + 1, z0 - 1, z0], [x0 - 1, x1 + 1, z1, z1 + 1], [x0 - 1, x0, z0, z1], [x1, x1 + 1, z0, z1]]) prPave(acc, 'prMatRed', a, c, b, d, 0.04, 2, 2);
  const [hx, hz] = [-61, 275.4];   // the vaulting horse
  sbox(acc, 'prLeather', hx, 0.9, hz, 1.6, 0.4, 0.34, 0, { u: 1, v: 1, cell: 99 });
  for (const s of [-1, 1]) sbox(acc, 'iron', hx + s * 0.55, 0, hz, 0.1, 0.3, 0.9, 0, { u: 1, v: 1, cell: 99 });
  prSolid(hx - 0.8, hz - 0.22, hx + 0.8, hz + 0.22, 1.24);
  const [bx, bz0, bz1] = [-51.5, 279.5, 284.5];   // the balance beam
  sbox(acc, 'prLeather', bx, 1.1, (bz0 + bz1) / 2, 0.12, bz1 - bz0, 0.14, 0, { u: 1, v: 1, cell: 99 });
  for (const z of [bz0 + 0.5, bz1 - 0.5]) sbox(acc, 'iron', bx, 0, z, 0.3, 0.08, 1.1, 0, { u: 1, v: 1, cell: 99 });
  prSolid(bx - 0.15, bz0, bx + 0.15, bz1, 1.24);
  sbox(acc, 'prBoards', hx, 0, hz - 1.3, 0.7, 1.0, 0.2, 0, { u: 1, v: 0.2, top: 'prMatRed', tu: 1, cell: 99 }); prSolid(hx - 0.35, hz - 1.8, hx + 0.35, hz - 0.8, 0.2);   // the springboard
  // the club that came down from the capital for it: ZUBR · KRASNOGRAD on two poles at the mats' north end
  for (const x of [-66.4, -55.6]) { sbox(acc, 'iron', x, 0, 293.2, 0.08, 0.08, 3.6, 0, { u: 1, v: 1, cell: 99 }); prSolid(x - 0.1, 293.1, x + 0.1, 293.3, 3.6); }
  plate(acc, 'prZubr', -61, 3.0, 293.2, 10.6, 1.33, Math.PI, 0, [0, 0, 1, 1], true);
}
// ---- the east side: empty three-tier bleachers, a wall with the slogan, two sodium lamps on arms
function prBleachers(acc) {
  const [x0, x1, z0, z1] = PR.bleachers;
  for (let k = 0; k < 3; k++) { const a = x0 + k * 1.8; sbox(acc, 'prBleacher', (a + x1) / 2, 0, (z0 + z1) / 2, x1 - a, z1 - z0, 0.55 * (k + 1), 0, { u: 8, v: 0.55, top: 'prBleachTop', tu: 8, skip: 'r', cell: 8 }); }
  sbox(acc, 'prStandWall', x1 - 0.15, 0, (z0 + z1) / 2, 0.3, z1 - z0 + 2, 5.2, 0, { u: 8, v: 5.2, top: 'wallTop', tu: 8, skip: 'r', cell: 8 });
  plate(acc, 'prSlogan', x1 - 0.3, 3.7, (z0 + z1) / 2, 23, 23 * 14 / 136, -Math.PI / 2, 0.02);
  for (let k = 0; k < 7; k++) {   // a row of flags along the top of the wall, against the slabs' lit windows (the emblem's pylon in the middle)
    if (k === 3) continue; const z = z0 + 2 + k * 6.33; sbox(acc, 'iron', x1 - 0.15, 5.2, z, 0.1, 0.1, 5.4, 0, { u: 1, v: 1, top: false, cell: 99 });
    plate(acc, 'flag_kras', x1 - 0.15, 9.7, z - 1.15, 2.25, 1.5, -Math.PI / 2, 0, [0, 0, 1, 1], true);
  }
  for (const z of [266, 292]) {
    sbox(acc, 'iron', x1 - 1.3, 5.3, z, 2.0, 0.14, 0.12, 0, { u: 1, v: 1, cell: 99 });
    sbox(acc, 'litSodium', x1 - 2.4, 5.1, z, 0.6, 0.3, 0.22, 0, { u: 1, v: 1, cell: 99 });
    prLight(x1 - 2.6, 4.8, z, CFG.street.light.sodium, CFG.parade.light.sodiumRadius, CFG.parade.light.sodiumK);
  }
  // the centrepiece over the empty seats, facing the Ministry across the square: a granite pylon with the emblem (the gold cog
  // in a wreath of wheat), floodlit from below
  const pz = (z0 + z1) / 2;
  sbox(acc, 'prStandWall', x1 - 0.7, 5.2, pz, 1.4, 3.6, 6.8, 0, { u: 3.6, v: 6.8, top: 'wallTop', tu: 99, skip: 'r', cell: 99 });   // on the wall, over the slogan
  plate(acc, 'prEmblem', x1 - 1.4, 8.9, pz, 4.6, 4.6, -Math.PI / 2, 0.02);
  prLight(x1 - 4.5, 4.2, pz, '#ffe2b4', 11, 1.6);
  prSolid(x0, z0, x1, z1, 1.65); prSolid(x1 - 0.3, z0 - 1, x1, z1 + 1, 5.2);
}
// ---- the Ministry of Order (Inspector Orlova's), after Moscow's Lubyanka and Minsk's ministries: a rusticated dark granite
// ground floor, a colossal order of pilasters up to a heavy cornice, an attic over it, and the three central bays rising into
// a clock tower crowned by the gold cog. Giant banners down its face, a portico with shut bronze doors, and one lit window,
// high up over the portico, with someone standing in it, watching. Every window but hers is dark.
function prMinistry(acc) {
  const [x0, x1, z0, z1] = PR.ministry, [r0, r1] = PR.risalit, cz = (r0 + r1) / 2, H = 20, hz = 14 / 3;
  // the front: the floods at its foot fade up it storey by storey (light lives on the storeys: 6 m, then 4.67 m)
  wall(acc, 'prMinRust', x1, z1, x1, z0, 0, 6, 4, 6, { cell: 6 });
  for (const [a, b, key] of [[z1, r1, 'prMinistry'], [r1, r0, 'prMinCentre'], [r0, z0, 'prMinistry']]) wall(acc, key, x1, a, x1, b, 6, H, 4, hz, { cell: 99 });
  for (const [z, ax, bx] of [[z0, x1, x0], [z1, x0, x1]]) { wall(acc, 'prMinRust', ax, z, bx, z, 0, 6, 4, 6, { cell: 99 }); wall(acc, 'prMinistry', ax, z, bx, z, 6, H, 4, hz, { cell: 99 }); }
  sbox(acc, 'prCornice', (x0 + x1 + 0.8) / 2, H, (z0 + z1) / 2, x1 + 0.8 - x0, z1 - z0 + 1.6, 1.2, 0, { u: 4, v: 1.2, top: 'roofDark', skip: 'l', cell: 99 });
  sbox(acc, 'prMinAttic', (x0 - 75) / 2, H + 1.2, (z0 + z1) / 2, -75 - x0, z1 - z0 - 2, 5.8, 0, { u: 4, v: 5.8, top: 'roofDark', skip: 'l', cell: 99 });
  // the clock tower over the centre bays: the clock, lit; its cornice; the cog standing on top, a flag behind it
  sbox(acc, 'prMinTower', -80, H + 7, cz, 6, 10, 10, 0, { u: 5, v: 10, top: false, skip: 'l', cell: 99 });
  sbox(acc, 'prCornice', -80, H + 17, cz, 6.8, 10.8, 0.9, 0, { u: 4, v: 0.9, top: 'roofDark', skip: 'l', cell: 99 });
  plate(acc, 'prClock', -77, H + 12.4, cz, 4.2, 4.2, Math.PI / 2, 0.05);
  plate(acc, 'cog', -80, H + 20.9, cz, 6, 6, Math.PI / 2, 0, [0, 0, 1, 1], true);
  sbox(acc, 'iron', -82.4, H + 17.9, cz, 0.16, 0.16, 7, 0, { u: 1, v: 1, cell: 99 });
  plate(acc, 'flag_kras', -82.4, H + 23.8, cz + 1.5, 3.0, 2.0, Math.PI / 2, 0, [0, 0, 1, 1], true);
  plate(acc, 'prOrlovaWin', -75, H + 3.6, cz, 1.8, 2.7, Math.PI / 2, 0.03);   // hers: on the attic, right over the portrait going up
  prLight(-74, H + 3.6, cz, '#ffd890', 6, 1.1);
  // giant banners down its face either side of the centre (the Tower's own), lesser ones further out
  for (const z of [271, 295]) plate(acc, 'twBannerTall', x1, 11.6, z, 4, 16, Math.PI / 2, 0.05);
  for (const z of [263, 303]) plate(acc, 'prBanner', x1, 12, z, 3.2, 12, Math.PI / 2, 0.05);
  // the portico: four square pillars, an entablature with the name, bronze doors (shut), two lanterns
  for (const z of [-4.5, -1.5, 1.5, 4.5].map(d => cz + d)) { sbox(acc, 'concrete', -71.2, 0, z, 0.8, 0.8, 7.2, 0, { u: 1, v: 2.4, top: false, cell: 99 }); prSolid(-71.6, z - 0.4, -70.8, z + 0.4, 7.2); }
  sbox(acc, 'concrete', -71.4, 7.2, cz, 1.2, 10.6, 1.1, 0, { u: 2, v: 1.1, top: 'roofDark', cell: 4 });
  plate(acc, 'prMinistrySign', -70.8, 7.75, cz, 9, 1.0, Math.PI / 2, 0.02);
  plate(acc, 'prBronze', x1, 2.4, cz, 3.2, 4.8, Math.PI / 2, 0.03);
  for (const z of [cz - 3, cz + 3]) { sbox(acc, 'litSodium', -71.9, 4.6, z, 0.3, 0.3, 0.45, 0, { u: 1, v: 1, cell: 99 }); prLight(-70.6, 4.6, z, CFG.street.light.sodium, 10, 1.4); }
  for (const [z, r, k] of [[262, 16, 1.3], [295, 18, 1.8], [304, 16, 1.3]]) {   // floods at its foot wash the front up into the dark, so it reads from across the square
    sbox(acc, 'iron', x1 + 0.9, 0, z, 0.6, 0.6, 0.35, 0, { u: 1, v: 1, cell: 99 }); sbox(acc, 'litWarm', x1 + 0.9, 0.35, z, 0.5, 0.5, 0.06, 0, { u: 1, v: 1, cell: 99 });
    prLight(x1 + 1.6, 1.0, z, '#ffe2b4', r, k); prSolid(x1 + 0.55, z - 0.35, x1 + 1.25, z + 0.35, 0.4);
  }
  prSolid(x0, z0, x1, z1, 44);
}
// ---- the rehearsal's set piece: a truck crane hoisting the Chairman's portrait up the Ministry's face, the boom over the
// portico, the portrait hanging off the hook on its slings with tag lines down to the pillars, a scaffold tower beside its
// place on the face with the gang's work lamp, the crane's own lamp on it from below
function prCrane(acc) {
  const C = PR.crane, [x0, x1, z0, z1] = C.truck, cx = (x0 + x1) / 2, w = x1 - x0, [px, pz, y0, y1, pw] = PR.portrait;
  sbox(acc, 'prCrane', cx, 0.55, (z0 + z1) / 2, w, z1 - z0, 0.75, 0, { u: 4, v: 0.75, top: 'iron', cell: 99 });            // the chassis
  sbox(acc, 'prCraneCab', cx, 1.3, z1 - 1.25, w, 2.5, 2.0, 0, { u: 2.6, v: 2.0, top: 'iron', cell: 99 });                 // the cab, north end (the boom works out over it)
  sbox(acc, 'litSodium', cx, 3.3, z1 - 1.0, 0.25, 0.25, 0.2, 0, { u: 1, v: 1, cell: 99 }); prLight(cx, 3.9, z1 - 1.0, CFG.street.light.sodium, 6, 1.0);   // its amber beacon
  for (const z of [z0 + 1.3, z1 - 2.6, z1 - 1.3]) for (const x of [x0 + 0.2, x1 - 0.2]) sbox(acc, 'black', x, 0, z, 0.4, 1.0, 1.0, 0, { u: 1, v: 1, cell: 99 });
  for (const z of [z0 + 3.2, z1 - 0.3]) {   // the outriggers, down on their pads
    sbox(acc, 'iron', (x0 + x1 + 0.2) / 2, 0.75, z, w + 1.8, 0.24, 0.24, 0, { u: 1, v: 1, cell: 99 });
    for (const x of [x0 - 0.75, x1 + 0.95]) { sbox(acc, 'iron', x, 0.08, z, 0.14, 0.14, 0.7, 0, { u: 1, v: 1, top: false, cell: 99 }); sbox(acc, 'iron', x, 0, z, 0.6, 0.6, 0.08, 0, { u: 1, v: 1, cell: 99 }); }
  }
  sbox(acc, 'prCrane', cx, 1.3, C.foot[2] - 0.2, 2.4, 3.2, 1.9, 0, { u: 4, v: 1.9, top: 'iron', cell: 99 });                // the house on its turntable
  sbox(acc, 'iron', cx, 1.6, C.foot[2] - 2.25, 2.2, 0.9, 1.4, 0, { u: 1, v: 1, cell: 99 });                                // the counterweight
  sbox(acc, 'prCraneCab', x1 - 0.5, 3.2, C.foot[2] + 0.7, 0.9, 1.1, 1.1, 0, { u: 1.1, v: 1.1, top: 'iron', cell: 99 });   // the operator's cab
  sbox(acc, 'litWarm', cx, 3.2, C.foot[2] + 1.0, 0.5, 0.25, 0.3, 0, { u: 1, v: 1, cell: 99 });                             // its work lamp on the portrait
  prLight(px + 1.4, 6.4, pz - 5.6, '#fff0d4', 15, 2.2);
  prBeam(acc, 'prBoom', C.foot, C.tip, 1.0, 0.5);                                                                          // the boom
  prBeam(acc, 'iron', [cx, 3.3, C.foot[2] - 2.1], [C.tip[0], C.tip[1] - 0.4, C.tip[2] - 0.4], 0.07, 0.07);                  // the luffing rope
  sbox(acc, 'prCrane', C.tip[0], C.tip[1] - 0.7, C.tip[2], 0.9, 1.2, 1.1, 0, { u: 1, v: 1.1, top: 'iron', cell: 99 });      // the boom's head
  sbox(acc, 'litRed', C.tip[0], C.tip[1] + 0.4, C.tip[2] + 0.3, 0.45, 0.45, 0.45, 0, { u: 1, v: 1, cell: 99 });               // its red warning lamp
  prBeam(acc, 'iron', [px, C.tip[1] - 0.6, pz], [px, y1 + 2.4, pz], 0.14, 0.14);                                           // the hoist rope (thick enough to read across the square)
  sbox(acc, 'prCrane', px, y1 + 1.5, pz, 0.6, 0.6, 0.95, 0, { u: 1, v: 0.95, top: 'iron', cell: 99 });                     // the hook block
  for (const s of [-1, 1]) prBeam(acc, 'iron', [px, y1 + 1.55, pz], [px - 0.14, y1, pz + s * (pw / 2 - 0.35)], 0.1, 0.1);   // the slings
  for (const s of [-1, 1]) prBeam(acc, 'prRope', [px - 0.1, y0, pz + s * (pw / 2 - 0.3)], [-71.0, 1.0, pz + s * 4.5], 0.04, 0.04);   // tag lines down to the pillars
  // the portrait: a battened frame, the Chairman on its face (cut in cells so the two lamps' light shows on it)
  sbox(acc, 'prPlywood', px - 0.14, y0, pz, 0.24, pw, y1 - y0, 0, { u: 99, v: 99, top: 'prPlywood', tu: 99, skip: 'lr', cell: 99 });
  aq(acc, 'prChairBig', [px - 0.01, y1, pz + pw / 2], [px - 0.01, y1, pz - pw / 2], [px - 0.01, y0, pz - pw / 2], [px - 0.01, y0, pz + pw / 2], [0, 0, 1, 1], [1, 0, 0], 3.5);
  prSolid(x0, z0, x1, z1, 3.6);
  for (const z of [z0 + 3.2, z1 - 0.3]) prSolid(x0 - 1.05, z - 0.3, x1 + 1.25, z + 0.3, 0.9);
  // the scaffold tower at its place on the face, boards on top, the gang's work lamp turned on the portrait
  const [sx0, sx1, sz0, sz1, top] = PR.scaffold, sx = (sx0 + sx1) / 2, sz = (sz0 + sz1) / 2;
  sbox(acc, 'prScaffold', sx, 0, sz, sx1 - sx0, sz1 - sz0, top, 0, { u: sz1 - sz0, v: top + 0.1, top: false, skip: 'l', cell: 99 });
  sbox(acc, 'prBoards', sx + 0.1, top - 0.1, sz, sx1 - sx0 + 0.2, sz1 - sz0 + 0.2, 0.1, 0, { u: 99, v: 99, top: 'prBoards', tu: 2, cell: 99 });
  sbox(acc, 'litWarm', sx + 0.4, top, sz0 + 0.3, 0.4, 0.3, 0.3, 0, { u: 1, v: 1, cell: 99 });
  prLight(sx + 1.4, top - 0.6, sz0 - 1.8, '#fff0d4', 13, 1.8);
  prSolid(sx0, sz0, sx1, sz1, top);
}
// ---- as you come out of the Palace: the running order for 1 May 1986 on a board under a hooded lamp, turned to the doors,
// and the honour guard's spare flags on a rack (they fight with them)
function prProgramme(acc) {
  const [bx, bz] = PR.programme, phi = Math.atan2(-40 - bx, 253 - bz), P = (lx, lz) => LP(bx, bz, phi, lx, lz);
  sbox(acc, 'iron', bx, 0.8, bz, 2.75, 0.1, 1.6, phi, { u: 99, v: 99, cell: 99 });
  plate(acc, 'prProgramme', bx, 1.6, bz, 2.6, 1.45, phi, 0.06);
  for (const s of [-1, 1]) { const [x, z] = P(s * 1.2, 0); sbox(acc, 'iron', x, 0, z, 0.08, 0.08, 0.8, phi, { u: 1, v: 1, top: false, cell: 99 }); }
  { const [x, z] = P(0, 0.22); sbox(acc, 'iron', x, 2.42, z, 2.2, 0.35, 0.1, phi, { u: 1, v: 1, cell: 99 }); }
  { const [x, z] = P(0, 0.34); sbox(acc, 'litWarm', x, 2.36, z, 1.9, 0.08, 0.06, phi, { u: 1, v: 1, cell: 99 }); }
  { const [x, z] = P(0, 0.8); prLight(x, 2.2, z, '#ffe8c0', 3.4, 1.5); }
  const c = [P(-1.4, -0.2), P(1.4, -0.2), P(-1.4, 0.4), P(1.4, 0.4)];
  prSolid(Math.min(...c.map(q => q[0])), Math.min(...c.map(q => q[1])), Math.max(...c.map(q => q[0])), Math.max(...c.map(q => q[1])), 2.5);
  sbox(acc, 'iron', -59.6, 0, 270.6, 0.6, 3.1, 0.25, 0, { u: 1, v: 1, cell: 99 });
  plate(acc, 'prFlagRack', -59.6, 1.5, 270.6, 3, 3, Math.PI / 2, 0, [0, 0, 1, 1], true);
  prSolid(-60, 269, -59.2, 272.2, 2.9);
}
// The square's triangles are drawn as chunks, by where each one's middle lies (PR.chunkX x PR.chunkZ): each chunk is its own
// mesh over the one baked buffer (shared attributes: nothing copied) with its own bounding sphere, so the camera culls the
// ones out of view, like the far city's tiles. Reorders the accumulator's triangles; returns [start, count] in vertices.
function prChunk(acc) {
  const X = PR.chunkX, Z = PR.chunkZ, P = acc.p, n = P.length / 9, key = new Array(n), band = (v, E) => E.filter(e => v >= e).length;
  for (let t = 0; t < n; t++) { const i = t * 9; key[t] = band((P[i] + P[i + 3] + P[i + 6]) / 3, X) * (Z.length + 1) + band((P[i + 2] + P[i + 5] + P[i + 8]) / 3, Z); }
  const order = Array.from({ length: n }, (_, t) => t).sort((a, b) => key[a] - key[b] || a - b);
  const re = (arr, k) => { const out = new Array(arr.length); let j = 0; for (const t of order) for (let q = t * 3 * k, e = q + 3 * k; q < e; q++) out[j++] = arr[q]; return out; };
  acc.p = re(acc.p, 3); acc.n = re(acc.n, 3); acc.c = re(acc.c, 3); acc.u = re(acc.u, 2);
  const ranges = []; let s = 0;
  for (let j = 1; j <= n; j++) if (j === n || key[order[j]] !== key[order[s]]) { ranges.push([s * 3, (j - s) * 3]); s = j; }
  return ranges;
}
// called from buildStreet(): one baked buffer on the street atlas, drawn in chunks the camera culls
function buildParade() {
  ACT1_WEST.begin();
  const acc = PR.acc = new GeoAcc(); PR.lamps = [];
  prSquare(acc); prMinistry(acc); prCrane(acc); prProgramme(acc); prStand(acc); prBand(acc); prGym(acc); prBleachers(acc);
  for (const [x, z, key] of PR.floats) prFloat(acc, x, z, key);
  for (const z of [263, 290, 296]) prBannerPole(acc, -68.8, z);   // (the crane stands where 269 and 275 were)
  for (const z of [264, 271, 278, 285, 292]) prBannerPole(acc, -14.2, z);
  for (const [x, z, ax, az] of PR.masts) prMast(acc, x, z, ax, az);
  prSodium(acc, -46.5, 256.2, 1); prSodium(acc, -33.5, 256.2, -1);   // either side of the Palace's doors
  const Lt = CFG.street.light, F = CFG.street.fog, [a, b, c, d] = PR.rect;
  const spill = ACT1_WEST.localLamps(ST.lamps).filter(l => l[0][0] > a - 15 && l[0][0] < b + 15 && l[0][2] > c - 15 && l[0][2] < d + 15);   // a neighbour's lamps spill onto the edges
  PR.ranges = prChunk(acc);
  const geo = acc.geometry({ ambient: Lt.ambient, sky: Lt.sky, lights: PR.lamps.concat(spill) }), mat = makeMat('street', { baked: true }), Pp = geo.attributes.position.array;
  mat.uniforms.uFogNear = { value: F.near }; mat.uniforms.uFogFar = { value: F.far };
  const [wx, wz] = ACT1_WEST.toWorld((a + b) / 2, (c + d) / 2), near = [wx, wz, CFG.parade.drawNear[0], CFG.parade.drawNear[1]];   // (src/rooms.js)
  PR.meshes = PR.ranges.map(([start, count], i) => {
    const g = i ? new THREE.BufferGeometry() : geo;
    if (i) for (const k of ['position', 'normal', 'uv', 'bake']) g.setAttribute(k, geo.attributes[k]);
    if (g.setDrawRange) g.setDrawRange(start, count);
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let v = start; v < start + count; v++) for (let k = 0; k < 3; k++) { const q = Pp[v * 3 + k]; if (q < lo[k]) lo[k] = q; if (q > hi[k]) hi[k] = q; }
    const ctr = lo.map((q, k) => (q + hi[k]) / 2), r = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2 + 2;   // (+2 m: vertex snap)
    g.userData = { range: [start, count], center: ctr, radius: r };
    if (THREE.Sphere) g.boundingSphere = new THREE.Sphere(new THREE.Vector3(...ctr), r);
    const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = !!THREE.Sphere; m.userData.near = near;
    scene.add(m); return m;
  });
  const m = PR.mesh = PR.meshes[0]; PR.tris = acc.tris;   // (PR.mesh holds the whole buffer; it draws the first chunk)
  for (const l of PR.lamps) ST.lamps.push(l);   // goons and props are lit live by the nearest of them
  // where you can walk: the Palace's doorway, the square, the way up to the Tower's doors. On while this level is on,
  // and still on in whichever level walks on from here (so you're never pushed off the floor at the hand-over)
  const onward = () => { const D = LEVELS[level.name]; return !!D && D.after === 'parade'; };
  const on = (area) => () => (level.name === 'parade' && !LOCKED.has(area)) || onward();
  const P = 0.3, [d0, d1] = PR.door, [s0, s1, sz0, sz1] = PR.sq, [t0, t1, tz] = PR.towerDoor;
  [ { x0: d0 + P, x1: d1 - P, z0: 251.8, z1: sz0 + 0.4, pad: P, area: 'prDoor', on: () => (level.name === 'palace' && game.state === 'won') || on('prDoor')() },
    { x0: s0, x1: s1, z0: sz0, z1: sz1, pad: P, area: 'prSquare', on: on('prSquare') },
    { x0: t0 + P, x1: t1 - P, z0: sz1 - 2, z1: tz + 0.6, pad: P, area: 'prTowerDoor', on: on('prTowerDoor') },
  ].forEach(addWalk);
  ACT1_WEST.end();
  return m;
}
defineLevel('parade', {
  menu: '6 · Parade Square', cfg: () => CFG.parade, build: buildParade, outside: () => PR.meshes, rects: () => [ACT1_WEST.rect(PR.rect)], frame: ACT1_WEST,
  start: (f) => startParade(f), update: (dt) => updateParade(dt),
  after: 'palace', enter: () => ACT1_WEST.head().z > 253.2,                                   // out of the Palace's north doors
  finish: () => { const h = ACT1_WEST.head(); return h.z > 309.5 && Math.abs(h.x + 40) < 5; }, wonSign: 'tower',   // up to the Tower's doors
  signs: { parade: ['PARADE SQUARE', '#ff9a3c'], guardFight: ['HONOUR GUARD', '#e8352b'], gymFight: ['FIGHT!', '#f2c14e'],
           bandFight: ['THE BAND', '#f2c14e'], tower: ['THE TOWER OF LABOR', '#f2c14e'], towerReveal: ['THE TOWER OF LABOR', '#f2c14e'] },
  hud: { walk: 'Parade Square — cross to the Tower of Labor', last: 'Walk up to the Tower of Labor\'s doors', won: 'Parade Square cleared — into the Tower of Labor (R to restart)', short: 'Parade' },
});
function startParade(fromPalace) {
  level.name = 'parade'; level.encounter = -1; level.arena = null; LOCKED.clear();
  clearEnemies();
  const held = new Set(handList.map(h => h.held));
  if (!fromPalace) { DOOR.target = 1; DOOR.open = 1; player.hp = CFG.player.health; player.hurtT = 0; game.catches = 0; game.disarms = 0; }
  for (const p of props.slice()) if (!held.has(p)) { scene.remove(p.obj); p.body.remove(); p.alive = false; props.splice(props.indexOf(p), 1); }   // the Palace's props stay behind
  for (const [type, x, z] of CFG.parade.props) new Prop(type, ACT1_WEST.world(new V3(x, 0, z)));
  if (!fromPalace) { placePlayer(...ACT1_WEST.toWorld(CFG.parade.start[0], CFG.parade.start[1]), Math.PI + ACT1_WEST.yaw); rig.position.y = 0; }
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  Object.assign(PR.reveal, { due: !!fromPalace, shown: false, t: 0, then: false });
  if (!fromPalace) showSign('parade', 2.6);   // (walking in from the Palace, the Tower comes first: updateParade)
}
function updateParade(dt) {
  if (typeof placeShutter === 'function') placeShutter();   // the Palace's north doors stand open behind you (its spill, its lamp)
  const R = PR.reveal, C = CFG.parade.reveal;
  if (R.due && !R.shown && ACT1_WEST.head().z > C.z) {   // out from under the doors' canopy: the whole Tower over you
    R.shown = true; R.t = 0; showSign('towerReveal', C.dur, C.y); if (AU.chime) AU.chime();
  }
  if (R.shown && !R.then && (R.t += dt) > C.dur) {   // then the square's name, unless a fight has taken the sign
    R.then = true; if (level.encounter < 0 && game.state === 'walk') showSign('parade', C.then);
  }
}
