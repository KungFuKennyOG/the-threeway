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
  light: { flood: '#ffe2b4', floodRadius: 25, floodK: 3.0, floodY: 10,  // the masts: big warm-white pools on the four fight zones
           sodiumRadius: 12, sodiumK: 1.5,                             // sodium lamps at the Palace doors, the ministry, the bleachers
           stand: '#fff0d4', standRadius: 16, standK: 1.9,             // the doorway between the stand's wings: the goal
           foot: '#ffd8a0', footRadius: 9, footK: 1.5 },               // each float's footlight on its portrait
};
const PR = {
  rect: [-84, -6, 253, 312],                   // the ground it occupies (the far city keeps off it)
  sq: [-71.7, -11.9, 254.3, 311.7],            // where you walk (body centre; walls at the edges)
  door: [-42, -38, 252, 253],                  // the Palace of Sport's north doors (the other level draws them)
  towerDoor: [-44, -36, 312],                  // the Tower of Labor's doors (the other level draws them)
  ministry: [-84, -72, 256, 309],
  stand: [[-64, -45.2, 303.5, 311], [-34.8, -16, 303.5, 311]],
  floats: [[-55, 266, 'prHero1'], [-25, 266, 'prHero2'], [-24, 284, 'prHero3']],
  mats: [-67, -55, 279, 291],
  bleachers: [-11.6, -6.1, 258, 300],
  masts: [[-69.6, 257.6, -52, 268], [-13.4, 257.6, -28, 268], [-69.6, 300.4, -52, 292], [-13.4, 300.4, -28, 292]],   // [x, z, where its pool falls]
  acc: null, mesh: null, lamps: [], tris: 0,
};
function prSolid(x0, z0, x1, z1, h) { WORLD_BOXES.push([x0, 0, z0, x1, h, z1]); BLOCKERS.push({ x0, x1, z0, z1 }); }
function prLight(x, y, z, col, r, k) { PR.lamps.push(lightFromHex([x, y, z], col, r, k)); }
// flat paving, its texture starting at (x0, z0) so the repeats line up with the light cells
function prPave(acc, key, x0, z0, x1, z1, y, T, cell) { aq(acc, key, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [0, 0, (x1 - x0) / T, (z1 - z0) / T], [0, 1, 0], cell); }
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
  for (const [a, b] of [[x0, -42], [-38, x1]]) { prPave(acc, 'prGranite', a, 254, b, 310, 0, 4, 2); prPave(acc, 'prGranite', a, 253, b, 254, 0, 4, 2); prPave(acc, 'prGranite', a, 310, b, 312, 0, 4, 2); }
  prPave(acc, 'prRoute', -42, 253, -38, 312, 0, 4, 2);   // the route: from the Palace's doors to the Tower's, cut into the paving (no overlap to flicker)
  for (const z of [262, 272, 282, 292]) for (const x of [-46, -34]) aq(acc, 'prMark', [x - 0.6, 0.014, z + 0.6], [x + 0.6, 0.014, z + 0.6], [x + 0.6, 0.014, z - 0.6], [x - 0.6, 0.014, z - 0.6], [0, 0, 1, 1], [0, 1, 0], 99);
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
  frustum(acc, 'prLattice', x, 0, z, 1.2, 1.2, 0.5, 0.5, 14, 0, { u: 1, v: 2, top: false, cell: 99 });
  sbox(acc, 'iron', x, 13.8, z, 0.7, 0.7, 0.3, 0, { u: 1, v: 1, cell: 99 });
  sbox(acc, 'iron', x + ux * 0.3, 13.9, z + uz * 0.3, 4.4, 0.4, 3.2, phi, { u: 1, v: 1, cell: 99 });
  plate(acc, 'prFloodBank', x + ux * 0.3, 15.5, z + uz * 0.3, 4.2, 3.0, phi, 0.21);
  prLight(cx, L.floodY, cz, L.flood, L.floodRadius, L.floodK);
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
  for (const [x, z] of [[-29.5, 299.6], [-27.5, 299.9], [-25.5, 300.1], [-23.5, 300.1], [-21.5, 299.9], [-19.5, 299.6]]) {
    sbox(acc, 'iron', x, 0, z, 0.04, 0.04, 1.05, 0, { u: 1, v: 1, top: false, cell: 99 });
    sbox(acc, 'iron', x, 1.0, z, 0.5, 0.03, 0.36, 0, { u: 1, v: 1, cell: 99 });
    plate(acc, 'prSheet', x, 1.18, z, 0.44, 0.32, 0, 0.02);
    sbox(acc, 'lacquer', x, 0.42, z + 0.75, 0.42, 0.42, 0.05, 0, { u: 1, v: 1, cell: 99 }); sbox(acc, 'lacquer', x, 0.47, z + 0.95, 0.42, 0.04, 0.45, 0, { u: 1, v: 1, cell: 99 });
    for (const s of [-1, 1]) sbox(acc, 'iron', x + s * 0.18, 0, z + 0.75, 0.03, 0.42, 0.42, 0, { u: 1, v: 1, top: false, cell: 99 });
    prSolid(x - 0.1, z - 0.1, x + 0.1, z + 0.1, 1.4); prSolid(x - 0.22, z + 0.53, x + 0.22, z + 0.97, 0.92);
  }
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
}
// ---- the east side: empty three-tier bleachers, a wall with the slogan, two sodium lamps on arms
function prBleachers(acc) {
  const [x0, x1, z0, z1] = PR.bleachers;
  for (let k = 0; k < 3; k++) { const a = x0 + k * 1.8; sbox(acc, 'prBleacher', (a + x1) / 2, 0, (z0 + z1) / 2, x1 - a, z1 - z0, 0.55 * (k + 1), 0, { u: 2, v: 0.55, top: 'prBoards', tu: 2, skip: 'r', cell: 4 }); }
  sbox(acc, 'concrete', x1 - 0.15, 0, (z0 + z1) / 2, 0.3, z1 - z0 + 2, 5.2, 0, { u: 2, v: 2, top: 'wallTop', tu: 1, skip: 'r', cell: 6 });
  plate(acc, 'prSlogan', x1 - 0.3, 3.7, (z0 + z1) / 2, 23, 23 * 14 / 136, -Math.PI / 2, 0.02);
  for (const z of [266, 292]) {
    sbox(acc, 'iron', x1 - 1.3, 5.3, z, 2.0, 0.14, 0.12, 0, { u: 1, v: 1, cell: 99 });
    sbox(acc, 'litSodium', x1 - 2.4, 5.1, z, 0.6, 0.3, 0.22, 0, { u: 1, v: 1, cell: 99 });
    prLight(x1 - 2.6, 4.8, z, CFG.street.light.sodium, CFG.parade.light.sodiumRadius, CFG.parade.light.sodiumK);
  }
  prSolid(x0, z0, x1, z1, 1.65); prSolid(x1 - 0.3, z0 - 1, x1, z1 + 1, 5.2);
}
// ---- the Ministry of Order (Inspector Orlova's): grey stepped stone, red banners, a portico with shut bronze doors,
// and one lit window high up, someone standing in it
function prMinistry(acc) {
  const [x0, x1, z0, z1] = PR.ministry, cz = (z0 + z1) / 2;
  sbox(acc, 'prMinistry', (x0 + x1) / 2, 0, cz, x1 - x0, z1 - z0, 18, 0, { u: 4, v: 4, top: 'roofDark', tu: 8, skip: 'l', cell: 6 });
  sbox(acc, 'prMinistry', (x0 + -75) / 2, 18, cz, -75 - x0, 41, 8, 0, { u: 4, v: 4, top: 'roofDark', tu: 8, skip: 'l', cell: 6 });
  sbox(acc, 'prMinistry', (x0 + -78) / 2, 26, cz, -78 - x0, 25, 7, 0, { u: 4, v: 4, top: 'roofDark', tu: 8, skip: 'l', cell: 6 });
  plate(acc, 'cog', -78, 29.5, cz, 5, 5, Math.PI / 2, 0.05);
  plate(acc, 'prOrlovaWin', -75, 22, cz, 1.8, 2.7, Math.PI / 2, 0.03);
  prLight(-74, 22, cz, '#ffd890', 6, 1.1);
  sbox(acc, 'iron', -81, 33, cz, 0.16, 0.16, 7, 0, { u: 1, v: 1, cell: 99 });
  plate(acc, 'flag_kras', -81, 38.8, cz + 1.5, 3.0, 2.0, Math.PI / 2, 0, [0, 0, 1, 1], true);
  for (const z of [262, 270, 295, 303]) plate(acc, 'prBanner', x1, 10.5, z, 3.2, 12, Math.PI / 2, 0.05);
  // the portico: four square pillars, an entablature with the name, bronze doors (shut), two lanterns
  for (const z of [278, 281, 284, 287]) { sbox(acc, 'concrete', -71.2, 0, z, 0.8, 0.8, 7.2, 0, { u: 1, v: 2.4, top: false, cell: 99 }); prSolid(-71.6, z - 0.4, -70.8, z + 0.4, 7.2); }
  sbox(acc, 'concrete', -71.4, 7.2, 282.5, 1.2, 10.6, 1.1, 0, { u: 2, v: 1.1, top: 'roofDark', cell: 4 });
  plate(acc, 'prMinistrySign', -70.8, 7.75, 282.5, 9, 1.0, Math.PI / 2, 0.02);
  plate(acc, 'prBronze', x1, 2.4, 282.5, 3.2, 4.8, Math.PI / 2, 0.03);
  for (const z of [279.5, 285.5]) { sbox(acc, 'litSodium', -71.9, 4.6, z, 0.3, 0.3, 0.45, 0, { u: 1, v: 1, cell: 99 }); prLight(-70.6, 4.6, z, CFG.street.light.sodium, 10, 1.4); }
  for (const z of [266, 299]) {   // floods at its foot wash the front, so it reads from across the square
    sbox(acc, 'iron', x1 + 0.9, 0, z, 0.6, 0.6, 0.35, 0, { u: 1, v: 1, cell: 99 }); sbox(acc, 'litWarm', x1 + 0.9, 0.35, z, 0.5, 0.5, 0.06, 0, { u: 1, v: 1, cell: 99 });
    prLight(x1 + 2.5, 1.5, z, '#ffe2b4', 18, 1.4); prSolid(x1 + 0.55, z - 0.35, x1 + 1.25, z + 0.35, 0.4);
  }
  prSolid(x0, z0, x1, z1, 33);
}
// called from buildStreet(): one mesh on the street atlas, light baked in
function buildParade() {
  ACT1_WEST.begin();
  const acc = PR.acc = new GeoAcc(); PR.lamps = [];
  prSquare(acc); prMinistry(acc); prStand(acc); prBand(acc); prGym(acc); prBleachers(acc);
  for (const [x, z, key] of PR.floats) prFloat(acc, x, z, key);
  for (const z of [263, 269, 275, 290, 296]) prBannerPole(acc, -68.8, z);
  for (const z of [264, 271, 278, 285, 292]) prBannerPole(acc, -14.2, z);
  for (const [x, z, ax, az] of PR.masts) prMast(acc, x, z, ax, az);
  prSodium(acc, -46.5, 256.2, 1); prSodium(acc, -33.5, 256.2, -1);   // either side of the Palace's doors
  const Lt = CFG.street.light, F = CFG.street.fog, [a, b, c, d] = PR.rect;
  const near = ACT1_WEST.localLamps(ST.lamps).filter(l => l[0][0] > a - 15 && l[0][0] < b + 15 && l[0][2] > c - 15 && l[0][2] < d + 15);   // a neighbour's lamps spill onto the edges
  const m = new THREE.Mesh(acc.geometry({ ambient: Lt.ambient, sky: Lt.sky, lights: PR.lamps.concat(near) }), makeMat('street', { baked: true }));
  m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false;
  m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far };
  scene.add(m); PR.mesh = m; PR.tris = acc.tris;
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
  menu: '6 · Parade Square', cfg: () => CFG.parade, build: buildParade, outside: () => [PR.mesh], rects: () => [ACT1_WEST.rect(PR.rect)], frame: ACT1_WEST,
  start: (f) => startParade(f),
  after: 'palace', enter: () => ACT1_WEST.head().z > 253.2,                                   // out of the Palace's north doors
  finish: () => { const h = ACT1_WEST.head(); return h.z > 309.5 && Math.abs(h.x + 40) < 5; }, wonSign: 'tower',   // up to the Tower's doors
  signs: { parade: ['PARADE SQUARE', '#ff9a3c'], guardFight: ['HONOUR GUARD', '#e8352b'], gymFight: ['FIGHT!', '#f2c14e'],
           bandFight: ['THE BAND', '#f2c14e'], tower: ['THE TOWER OF LABOR', '#33e0d0'] },
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
  showSign('parade', 2.6);
}
