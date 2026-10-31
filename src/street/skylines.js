'use strict';
// ============================== the three skylines ===========================
// Built cheaply and far away (fog capped so they stay readable): Hinomoto's neon cluster behind the Threeway under
// Aoki Development, Krasnovia's even field of slabs to the right of the road, Columbia's gold-crowned ridge to the left
// under the Dept. of Civic Harmony's mooring mast. Each act tops the last (the scale ladder, canon):
//   Krasnovia: the Tower of Labor, 252 m (src/kras/tower.js)  <  Columbia: Civic Harmony's mast, 320 m  <  Hinomoto: Aoki, 400 m.
// Far boxes are single quads per texture repeat (cell 999), so big repeats are what keep them cheap.
const SKY = {
  aoki: { at: [-106, -208], top: 400 },            // far enough back not to swallow the sky over the square, near enough
                                                   // that its tip stays inside the camera's far plane from Parade Square
  // Liberty Avenue's ridge runs across your view from the square (and at an angle to Krasnovia's), so its crowns stand
  // side by side and the Halcyon flies broadside: from (5.6, 333.6) toward the harbour side, 212 m long
  ridge: { o: [5.6, 333.6], d: [0.7526, -0.6585], len: 212.6, phi: 0.719 },   // phi turns a tower square to it
  civic: { t: 0.44, top: 320 },                    // the Dept. of Civic Harmony on Liberty Avenue, its mast on top
  royal: { t: 0.73 },                              // the Royal Hotel beside it, joined by a skybridge
  heights: {},                                     // filled in as they're built (test/street.js checks the ladder)
};
// the four corners of a tapering section: neon strips running up each arris (a quad either side of the corner)
function edgeStrips(acc, key, x, z, y0, y1, w0, w1, phi, sw, sides = [0, 1, 2, 3]) {
  const C = [[-1, 1], [1, 1], [1, -1], [-1, -1]], o = 0.25;
  for (const i of sides) {
    const [sx, sz] = C[i], [nx, nz] = C[(i + 1) % 4];   // corner i, then along the face toward corner i+1
    for (const [ax, az, bx, bz] of [[sx, sz, nx, nz], [sx, sz, C[(i + 3) % 4][0], C[(i + 3) % 4][1]]]) {
      const at = (w, y, f) => { const [px, pz] = LP(x, z, phi, (ax + (bx - ax) * f) * (w / 2 + o), (az + (bz - az) * f) * (w / 2 + o)); return [px, y, pz]; };
      const f0 = sw / w0, f1 = sw / w1, n = LN(phi, (ax + bx) / 2, (az + bz) / 2);
      aq(acc, key, at(w1, y1, 0), at(w1, y1, f1), at(w0, y0, f0), at(w0, y0, 0), [0, 0, 1, 1], n, 999);
    }
  }
}
function hinoTower(acc, x, z, w, d, h, phi, rng) {
  sbox(acc, 'glassN', x, 0, z, w, d, h, phi, { u: 22, v: 22, top: false, cell: 999 });
  const cols = rng() < 0.5 ? ['litRed', 'litRed'] : ['litCyan', 'litMagenta'];
  for (const [sx, sz, k] of [[-1, 1, 0], [1, 1, 1], [1, -1, 0]]) { const [ex, ez] = LP(x, z, phi, sx * w / 2, sz * d / 2); sbox(acc, cols[k], ex, 0, ez, 2.0, 2.0, h, phi, { u: 4, v: 4, top: false, cell: 999 }); }
  for (let y = 40; y < h - 16; y += 44) { frustum(acc, 'kawara', x, y, z, w + 5, d + 5, w + 1, d + 1, 2.5, phi, { u: 40, v: 6, top: false, cell: 999 }); sbox(acc, 'litRed', x, y - 0.5, z, w + 5.1, d + 5.1, 0.5, phi, { u: 4, v: 4, top: false, cell: 999 }); }
  // walled in neon, high enough to clear the city: giant brush-lettered boards on the faces the Old Quarter and
  // Krasnovia see (front +z, left -x), a blade sign off the front corner (reads from both sides), a rooftop band
  const col = () => Math.floor(rng() * 4), bh = Math.min(64, h * 0.42), by = h * 0.6;
  { const k = col(), [sx, sz] = LP(x, z, phi, (rng() - 0.5) * w * 0.4, d / 2); plate(acc, 'neonV', sx, by, sz, Math.min(10, w * 0.4), bh, phi, 0.4, [k / 4, 0, (k + 1) / 4, 1]); }
  if (rng() < 0.75) { const k = col(), [sx, sz] = LP(x, z, phi, -w / 2, (rng() - 0.5) * d * 0.4); plate(acc, 'neonV', sx, by - bh * 0.2, sz, Math.min(9, d * 0.4), bh * 0.8, phi - Math.PI / 2, 0.4, [k / 4, 0, (k + 1) / 4, 1]); }
  if (rng() < 0.6) { const k = col(), s = rng() < 0.5 ? -1 : 1, bw = 7, [sx, sz] = LP(x, z, phi, s * (w / 2 - 1), d / 2 + bw / 2); plate(acc, 'neonV', sx, h * 0.42, sz, bw, Math.min(46, h * 0.32), phi + Math.PI / 2, 0, [k / 4, 0, (k + 1) / 4, 1], true); }
  { const row = Math.floor(rng() * 4), [sx, sz] = LP(x, z, phi, 0, d / 2); plate(acc, 'neonSigns', sx, h - 5, sz, w * 0.9, 7, phi, 0.4, [0, row / 4, 1, (row + 1) / 4]); }
  let top = h;
  for (let k = 0; k < 3; k++) { const s = 1 - k * 0.26; frustum(acc, 'kawara', x, top, z, (w + 5) * s, (d + 5) * s, w * s * 0.55, d * s * 0.55, 5, phi, { u: 40, v: 8, top: 'kawara', tu: 40, cell: 999 }); sbox(acc, 'litRed', x, top - 0.3, z, (w + 5.2) * s, (d + 5.2) * s, 0.4, phi, { u: 4, v: 4, top: false, cell: 999 }); top += 5.3; }
  cyl(acc, 'iron', x, top, z, 0.4, 0.1, 14, 4, { cell: 999 });
  ST.beacons.push([x, top + 14, z]);
}
// Aoki Development: a black glass spike, red neon up every arris, tiered tile eaves ringed in red neon, a pagoda crown
// with AOKI on all four sides, a glass needle to 400 m. Its crown glows and pulses (the beams mesh, below).
function aokiTower(acc, x, z, phi) {
  const secs = [[0, 150, 46, 41], [150, 262, 39, 34], [262, 334, 32, 27]], wAt = (y) => { for (const [a, b, w0, w1] of secs) if (y <= b) return w0 + (w1 - w0) * (y - a) / (b - a); return 27; };
  for (const [y0, y1, w0, w1] of secs) {
    frustum(acc, 'glassBlack', x, y0, z, w0, w0, w1, w1, y1 - y0, phi, { u: 23, v: 23, top: false, cell: 999 });
    edgeStrips(acc, 'litRed', x, z, y0, y1, w0, w1, phi, 2.4);
  }
  for (const y of [60, 105, 150, 192, 232, 262, 300]) {   // tiered tile eaves, a red neon line under each
    const w = wAt(y); frustum(acc, 'kawara', x, y, z, w + 9, w + 9, w + 1, w + 1, 3.2, phi, { u: 60, v: 6, top: false, cell: 999 });
    sbox(acc, 'litRed', x, y - 2, z, w + 9.2, w + 9.2, 2, phi, { u: 4, v: 4, top: false, cell: 999 });
  }
  // the red neon crown: three pagoda tiers of lit red lattice, each roof edged in red neon; AOKI on the first tier's four faces
  let y = 334;
  for (const [core, h, roof, rt] of [[26, 12, 40, 6], [20, 9, 31, 5], [14, 7, 23, 6]]) {
    sbox(acc, 'neonLattice', x, y, z, core, core, h, phi, { u: core / 2.99, v: h / 1.99, top: false, cell: 999 });
    if (core === 26) for (let a = 0; a < 4; a++) { const ph = phi + a * Math.PI / 2, [sx, sz] = LP(x, z, ph, 0, core / 2); plate(acc, 'aokiBoard', sx, y + 5.5, sz, 24, 6, ph, 0.3); }
    y += h - 1;
    frustum(acc, 'kawara', x, y, z, roof, roof, core * 0.5, core * 0.5, rt, phi, { u: 60, v: 8, top: 'kawara', tu: 60, cell: 999 });
    sbox(acc, 'litRed', x, y - 1.2, z, roof + 0.3, roof + 0.3, 1.5, phi, { u: 4, v: 4, top: false, cell: 999 });
    y += rt - 1;
  }
  frustum(acc, 'glassBlack', x, y, z, 7, 7, 0.6, 0.6, 392 - y, phi, { u: 23, v: 23, top: false, cell: 999 });   // the spike
  edgeStrips(acc, 'litRed', x, z, y, 392, 7, 0.6, phi, 0.5, [0, 2]);
  cyl(acc, 'litRed', x, 392, z, 0.5, 0.1, SKY.aoki.top - 392, 4, { cell: 999 });   // a red neon needle
  ST.beacons.push([x, SKY.aoki.top + 1.5, z]);
  SKY.heights.aoki = SKY.aoki.top; SKY.aokiCrown = [x, 352, z];
}
// Liberty Avenue: cream-limestone setback towers. The upper tiers are floodlit from the setbacks below, every setback
// has a lit gold band and gilt pinnacles at its corners, sunbursts on the crown, a spire on top.
function decoTower(acc, x, z, w, d, h, phi, o = {}) {
  let y = 0;
  const T = [[1, 0.5], [0.82, 0.19], [0.66, 0.12], [0.5, 0.1], [0.36, 0.09]];
  T.forEach(([s, fr], i) => {
    const hh = h * fr, flood = i >= T.length - 2, ww = w * s, dd = d * s;
    sbox(acc, flood ? 'decoFlood' : 'decoStone', x, y, z, ww, dd, hh, phi, flood ? { u: ww / 1.99, v: hh * 1.0001, top: 'roofDark', tu: 99, cell: 999 } : { u: 16, v: 20, top: 'roofDark', tu: 99, cell: 999 });
    y += hh;
    sbox(acc, 'decoGold', x, y - 1.0, z, ww + 1, dd + 1, 1.0, phi, { u: 8, v: 1, top: false, cell: 999 });
    if (i === T.length - 2) for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const [px, pz] = LP(x, z, phi, sx * ww / 2, sz * dd / 2); sbox(acc, 'gilt', px, y, pz, 1.6, 1.6, 7, phi, { top: 'gilt', cell: 999 }); }
  });
  const cw = w * T[T.length - 1][0];
  for (let a = 0; a < 4; a++) { const ph = phi + a * Math.PI / 2, [sx, sz] = LP(x, z, ph, 0, (a % 2 ? w : d) * T[T.length - 1][0] / 2); plate(acc, 'sunburst', sx, y - cw * 0.45, sz, cw * 0.9, cw * 0.9, ph, 0.15); }
  sbox(acc, 'decoGold', x, y, z, cw * 0.55, cw * 0.55, 5, phi, { u: 4, v: 4, top: 'decoGold', tu: 4, cell: 999 });
  const sp = o.spire || 16;
  cyl(acc, 'gilt', x, y + 5, z, 1.1, 0.1, sp, 4, { cell: 999 });
  ST.beacons.push([x, y + 5 + sp + 1.5, z]);
  if (o.light) ST.searchlights.push([x, y + 5, z]);
  SKY.heights.ridge = Math.max(SKY.heights.ridge || 0, y + 5 + sp);
  return y;
}
// the Dept. of Civic Harmony: Columbia's tallest, a deco tower stepped back four times, floodlit from 168 m up, with
// an empty mooring mast on top (gold-ringed, floodlit, a glowing deck at the top) to 320 m: the silhouette is the point.
function civicHarmony(acc, x, z, phi) {
  let y = 0;
  for (const [y1, w, d, key] of [[118, 42, 38, 'decoStone'], [168, 34, 31, 'decoStone'], [204, 27, 24, 'decoFlood'], [232, 20, 18, 'decoFlood']]) {
    const hh = y1 - y;
    sbox(acc, key, x, y, z, w, d, hh, phi, key === 'decoFlood' ? { u: w / 1.99, v: hh * 1.0001, top: 'roofDark', tu: 99, cell: 999 } : { u: 16, v: 20, top: 'roofDark', tu: 99, cell: 999 });
    sbox(acc, 'decoGold', x, y1 - 1.2, z, w + 1.2, d + 1.2, 1.2, phi, { u: 8, v: 1, top: false, cell: 999 });
    if (y1 === 168 || y1 === 204) for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const [px, pz] = LP(x, z, phi, sx * w / 2, sz * d / 2); sbox(acc, 'gilt', px, y1, pz, 2, 2, 10, phi, { top: 'gilt', cell: 999 }); }
    y = y1;
  }
  for (let a = 0; a < 4; a++) { const ph = phi + a * Math.PI / 2, [sx, sz] = LP(x, z, ph, 0, (a % 2 ? 20 : 18) / 2); plate(acc, 'sunburst', sx, 222, sz, 18, 18, ph, 0.15); }
  sbox(acc, 'decoGold', x, 232, z, 12, 12, 8, phi, { u: 4, v: 4, top: 'decoGold', tu: 4, cell: 999 });   // the mast's footing
  cyl(acc, 'mastLit', x, 240, z, 5.6, 4.2, 50, 8, { u: 4.4, v: 50, cell: 999 });                          // the mast, floodlit
  for (const yy of [252, 266, 280]) cyl(acc, 'gilt', x, yy, z, 6.2 - (yy - 240) * 0.026, 6.0 - (yy - 240) * 0.026, 1.4, 8, { cell: 999 });
  cyl(acc, 'decoGold', x, 290, z, 7.0, 7.0, 2.2, 8, { cell: 999 });                                        // the mooring deck
  cyl(acc, 'mastLit', x, 292.2, z, 4.0, 1.6, 12, 8, { u: 3.2, v: 12, cell: 999 });                          // the nose cone's housing
  cyl(acc, 'gilt', x, 304.2, z, 1.2, 0.1, SKY.civic.top - 304.2, 4, { cell: 999 });                        // the mooring needle
  ST.beacons.push([x, SKY.civic.top + 1.5, z]);
  for (const [sx, sz] of [[-1, 1], [1, -1]]) { const [px, pz] = LP(x, z, phi, sx * 8, sz * 7); ST.searchlights.push([px, 233, pz]); }
  SKY.civicLight = [x, 240, z];   // the crown's tracking light (it finds the Halcyon)
  SKY.heights.civic = SKY.civic.top; SKY.civicMast = [x, 284, z];
}
// the Royal Hotel: broader and lower, a gold mansard crown, ROYAL down its front in red neon, a skybridge to Civic Harmony
function royalHotel(acc, x, z, phi) {
  let y = 0;
  for (const [y1, w, d, key] of [[96, 36, 26, 'decoStone'], [128, 30, 21, 'decoStone'], [148, 22, 15, 'decoFlood']]) {
    sbox(acc, key, x, y, z, w, d, y1 - y, phi, key === 'decoFlood' ? { u: w / 1.99, v: (y1 - y) * 1.0001, top: 'roofDark', tu: 99, cell: 999 } : { u: 16, v: 20, top: 'roofDark', tu: 99, cell: 999 });
    sbox(acc, 'decoGold', x, y1 - 1, z, w + 1, d + 1, 1, phi, { u: 8, v: 1, top: false, cell: 999 });
    y = y1;
  }
  frustum(acc, 'decoGold', x, 148, z, 22, 15, 12, 6, 9, phi, { u: 8, v: 9, top: 'decoGold', tu: 8, cell: 999 });
  cyl(acc, 'gilt', x, 157, z, 0.6, 0.1, 12, 4, { cell: 999 });
  ST.beacons.push([x, 170, z]); SKY.royalLight = [x, 157, z];
  const [sx, sz] = LP(x, z, phi, 11, 13); plate(acc, 'royalSign', sx, 62, sz, 8, 32, phi, 0.4);   // phi turns its front to the square
}
function buildSkylines() {
  const acc = ST.sky, t0 = acc.tris, rng = (() => { let s = 1986; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
  // Hinomoto: a tight cluster of black glass megatowers by the river, under Aoki Development
  const [hx, hz] = STREET.hino, [ax, az] = SKY.aoki.at;
  for (let k = 0; k < 22; k++) {
    const a = rng() * Math.PI * 2, r = 20 + rng() * 90, x = hx + Math.cos(a) * r * 1.4, z = hz + Math.sin(a) * r * 0.7;
    const h = 70 + (1 - r / 110) * 150 * (0.6 + rng() * 0.5), w = 16 + rng() * 14, d = w * (0.8 + rng() * 0.3), phi = (rng() - 0.5) * 0.5;
    if (Math.hypot(x - ax, z - az) < 40 + w / 2) continue;   // Aoki's plaza
    hinoTower(acc, x, z, w, d, h, phi, rng);
  }
  aokiTower(acc, ax, az, 0.12);
  ST.expressway = [];
  for (let k = 0; k < 2; k++) {   // the elevated Shuto Expressway, streaked with tail lights (and bikes: the beams mesh)
    const y = 22 + k * 9, z = hz + 70 + k * 18, phi = 0.08 * (k ? -1 : 1);
    sbox(acc, 'roofDark', hx, y, z, 260, 6, 1.5, phi, { u: 8, v: 8, cell: 999 });
    sbox(acc, k ? 'litWarm' : 'litRed', hx, y + 1.5, z, 260, 6.2, 0.35, phi, { u: 4, v: 4, top: false, cell: 999 });
    const [x0, z0] = LP(hx, z, phi, -130, 0), [x1, z1] = LP(hx, z, phi, 130, 0); ST.expressway.push([[x0, y + 2.4, z0], [x1, y + 2.4, z1]]);
  }
  // Krasnovia: concrete panel slabs on a regular grid, the TV tower
  const [kx, kz] = STREET.kras;
  for (let i = -4; i <= 4; i++) for (let j = -3; j <= 3; j++) {
    const x = kx + i * 36, z = kz + j * 42; if (Math.abs(i) <= 1 && Math.abs(j) <= 1) continue;
    if (x > -28 || onLevelGround(x, z, 18)) continue;
    const h = 34 + ((i * 7 + j * 13) % 4 + 4) % 4 * 8, long = (i + j) % 2 === 0;
    sbox(acc, 'panel', x, 0, z, long ? 30 : 11, long ? 11 : 30, h, 0, { u: 12, v: 12, top: 'roofDark', tu: 8, cell: 999 });
    if ((i * 3 + j) % 5 === 0) plate(acc, 'banner', x, h * 0.55, z + (long ? 5.5 : 15), 5, 18, 0, 0.2);
  }
  // (the Tower of Labor is a level of its own now, with its beacon on its spire: src/kras/tower.js)
  const tx = -22, tz = 420;   // TV tower: on the road's sightline, just right of Superblock 14's point block (clear of the Tower of Labor)
  cyl(acc, 'concrete', tx, 0, tz, 7, 2.5, 200, 8, { u: 8, v: 8, cell: 999 });
  cyl(acc, 'stepped', tx, 135, tz, 10, 13, 12, 10, { u: 8, v: 8, cell: 999 });
  cyl(acc, 'iron', tx, 200, tz, 1, 0.3, 40, 4, { cell: 999 });
  ST.beacons.push([tx, 240, tz], [tx, 147, tz]);
  for (const [cx, cz] of [[kx - 120, kz - 40], [kx - 140, kz + 10]]) cyl(acc, 'panel', cx, 0, cz, 6, 4, 90, 8, { u: 8, v: 8, cell: 999 });
  // Columbia: Liberty Avenue's ridge rising to the Dept. of Civic Harmony and the Royal Hotel; mid-rise deco in front
  const RG = SKY.ridge, phi = RG.phi, onRidge = (t, back = 0) => [RG.o[0] + RG.d[0] * RG.len * t - RG.d[1] * back, RG.o[1] + RG.d[1] * RG.len * t + RG.d[0] * back];
  const [cvx, cvz] = SKY.civic.at = onRidge(SKY.civic.t), [rx, rz] = SKY.royal.at = onRidge(SKY.royal.t);
  acc.tint = [1.9, 1.8, 1.6];   // cream limestone catching the city's glow and the floodlights (lit windows and gold ignore it)
  civicHarmony(acc, cvx, cvz, phi);
  royalHotel(acc, rx, rz, phi + Math.PI);   // its front (and ROYAL) to the square
  { const L = Math.hypot(rx - cvx, rz - cvz);   // the skybridge, centre to centre (its ends are inside the two towers)
    sbox(acc, 'decoStone', (cvx + rx) / 2, 104, (cvz + rz) / 2, L, 8, 9, phi, { u: 16, v: 9, top: 'roofDark', tu: 99, cell: 999 });
    sbox(acc, 'litWarm', (cvx + rx) / 2, 106.5, (cvz + rz) / 2, L - 2, 8.3, 2.2, phi, { top: false, cell: 999 });
    sbox(acc, 'decoGold', (cvx + rx) / 2, 112.6, (cvz + rz) / 2, L - 2, 8.6, 0.9, phi, { u: 8, v: 1, top: false, cell: 999 }); }
  // the ridge: a front row either side of the pair, a back row behind, rising toward Civic Harmony
  //       t   back  w   h    spire  searchlight
  for (const [t, back, w, h, sp, li] of [[0.1, 0, 24, 150, 14, 0], [0.25, 0, 26, 184, 18, 1], [0.88, 0, 26, 186, 18, 1], [1.0, 0, 24, 152, 14, 0],
    [0.05, 40, 24, 136, 12, 0], [0.33, 42, 26, 214, 24, 1], [0.58, 42, 28, 204, 22, 1], [0.8, 40, 24, 170, 16, 0]]) {
    const [x, z] = onRidge(t, back); decoTower(acc, x, z, w, w * 0.9, h, phi, { spire: sp, light: li });
  }
  for (let k = 0; k < 12; k++) { const x = 40 + k * 14, z = 120 + (k % 3) * 22; sbox(acc, 'decoStone', x, 0, z, 12, 12, 24 + (k * 7) % 22, 0.1, { u: 24, v: 24, top: 'roofDark', tu: 8, cell: 999 }); sbox(acc, 'decoGold', x, 24 + (k * 7) % 22, z, 12.6, 12.6, 0.8, 0.1, { u: 6, v: 0.8, top: false, cell: 999 }); }
  acc.tint = [1, 1, 1];
  ST.skyTris = acc.tris; ST.skylineTris = acc.tris - t0;
  // blinking aircraft beacons on every tower: one small mesh that toggles
  const bacc = new GeoAcc();
  for (const [x, y, z] of ST.beacons) sbox(bacc, 'litRed', x, y, z, 3, 3, 3, 0, { u: 4, v: 4, cell: 999 });
  ST.beaconMesh = new THREE.Mesh(bacc.geometry({ ambient: [1, 1, 1], lights: [] }), makeMat('street', { baked: true, fog: CFG.street.skylineFog }));
  ST.beaconMesh.frustumCulled = false; scene.add(ST.beaconMesh);
  ST.beaconMesh.material.uniforms.uFogNear = { value: CFG.street.fog.near }; ST.beaconMesh.material.uniforms.uFogFar = { value: CFG.street.fog.far };
}
// ---- what moves: the Halcyon zeppelin (one fogged mesh) and one small additive mesh of light (searchlight beams,
// Aoki's pulsing crown, the mast's floodlight glow, the zeppelin's strobe, bikes on the expressway). Both are children
// of the skyline mesh, so they're hidden with it, and the tick lives on the zeppelin itself (skyTick, from its
// onBeforeRender): it runs only while the skylines are drawn and needs nothing in the frame loop. The zeppelin is
// opaque, so it's drawn (and ticked) before the additive mesh. The light mesh is a few dozen camera-facing quads
// rewritten by the tick. Specs (world coordinates):
//   ST.searchlights: [x, y, z] (any level may push one; levelFrame moves them): a gold beam sweeping from there
//   ST.beams:  { o, el, az, sweep, rate, ph, len, w0, w1, col, track }: a beam (el, az in radians; az 0 = +z);
//              track: it keeps finding the zeppelin's hull instead of sweeping
//   ST.halos:  { c, size, col, pulse: [period s, low], blink: [period s, on s], zep: local offset }: a glow facing you
//   ST.trails: { a, b, len, w, col, speed, ph }: a light streak running from a to b and round again
const BEAM_GOLD = [1.0, 0.78, 0.42];
// The Halcyon: Columbia's airship, 240 m long and 44 m across. It circles Liberty Avenue's ridge all night on a long
// oval well above the crowns (and clear of Civic Harmony's mast: it never moors), a lap every 3.5 minutes.
const ZEP = { L: 240, R: 22, alt: 375, lap: 210, A: 115, B: 40, pos: [0, 0, 0], head: 0, mesh: null, tris: 0,
  prof: [0.05, 0.38, 0.62, 0.8, 0.92, 0.99, 1, 1, 0.98, 0.93, 0.83, 0.62, 0.05] };   // radius along the hull, tail to nose
function zepR(z) { const P = ZEP.prof, t = clamp(z / ZEP.L + 0.5, 0, 1) * (P.length - 1), i = Math.min(Math.floor(t), P.length - 2), f = t - i; return ZEP.R * (P[i] + (P[i + 1] - P[i]) * f); }
function buildZeppelin(parent) {
  const acc = new GeoAcc(), { L, R } = ZEP, NA = 10, NL = ZEP.prof.length - 1, TAU = Math.PI * 2;
  // the hull: a surface of revolution, 12 rings x 10 sides (local frame: nose along +z, up +y, starboard +x)
  for (let i = 0; i < NL; i++) {
    const z0 = -L / 2 + L * i / NL, z1 = -L / 2 + L * (i + 1) / NL, r0 = R * ZEP.prof[i], r1 = R * ZEP.prof[i + 1], slope = -(r1 - r0) / (z1 - z0);
    for (let j = 0; j < NA; j++) {
      const a0 = j / NA * TAU, a1 = (j + 1) / NA * TAU, am = (a0 + a1) / 2, P = (r, a, z) => [Math.cos(a) * r, Math.sin(a) * r, z], nl = Math.hypot(1, slope);
      aq(acc, 'hull', P(r0, a0, z0), P(r1, a0, z1), P(r1, a1, z1), P(r0, a1, z0), [i * 3 / NL, j / NA, (i + 1) * 3 / NL, (j + 1) / NA], [Math.cos(am) / nl, Math.sin(am) / nl, slope / nl], 999);
    }
  }
  plate(acc, 'zepAd', R + 0.6, 0, 0, L * 0.42, R * 0.62, Math.PI / 2, 0);    // FLY HALCYON down both flanks (self-lit)
  plate(acc, 'zepAd', -R - 0.6, 0, 0, L * 0.42, R * 0.62, -Math.PI / 2, 0);
  sbox(acc, 'gondola', 0, -R - 6.5, L * 0.16, 9, 36, 6.2, 0, { u: 12, v: 6.2, top: false, cell: 999 });   // the gondola, warm windows
  // four tail fins, navy with gold edges (both faces); red running light to port, green to starboard; the flag up top
  const z0 = -L / 2 + 6, z1 = z0 + 42, zo = z0 + 22, span = 17;
  for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    const ri0 = zepR(z0) * 0.9, ri1 = zepR(z1) * 0.9, at = (r, z) => [dx * r, dy * r, z], C = [at(ri0 + span, z0), at(ri0 + span, zo), at(ri1, z1), at(ri0, z0)];
    aq(acc, 'fin', C[0], C[1], C[2], C[3], [0, 0, 1, 1], [dy, dx, 0], 999); aq(acc, 'fin', C[1], C[0], C[3], C[2], [0, 0, 1, 1], [-dy, -dx, 0], 999);
    if (dx) sbox(acc, dx > 0 ? 'litGreen' : 'litRed', dx * (ri0 + span), -2, z0 + 6, 3, 3, 3, 0, { cell: 999 });
  }
  const fy = zepR(z0 + 16) * 0.9 + 8.5;
  plate(acc, 'flag_colu', 0, fy, z0 + 14, 11, 7.2, Math.PI / 2, 0.4, [0, 0, 1, 1], true);
  // lit brighter than the skylines (the searchlights keep finding it), plus the city's warm glow on its belly
  const g = acc.geometry({ ambient: [0.62, 0.56, 0.56], sky: [0.12, 0.12, 0.16], lights: [[[0, -90, 0], [0.7, 0.52, 0.3], 160]] });
  const m = makeMat('street', { baked: true, fog: CFG.street.skylineFog });
  m.uniforms.uFogNear = { value: CFG.street.fog.near }; m.uniforms.uFogFar = { value: CFG.street.fog.far };
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false;   // never culled: it carries the tick
  mesh.onBeforeRender = (r, s, cam) => { const e = cam.matrixWorld.elements; skyTick(performance.now() / 1000, e[12], e[13], e[14]); };
  parent.add(mesh); ZEP.mesh = mesh; ZEP.tris = acc.tris;
}
// where it is at time t (s): a long oval along Liberty Avenue, set back beyond the ridge line; returns its heading
function zepAt(t, out) {
  const RG = SKY.ridge, u = RG.d, v = [-u[1], u[0]];   // along the ridge; across it, away from the square
  const cx = RG.o[0] + u[0] * RG.len / 2 + v[0] * 70, cz = RG.o[1] + u[1] * RG.len / 2 + v[1] * 70, th = t * Math.PI * 2 / ZEP.lap, A = ZEP.A, B = ZEP.B;
  out[0] = cx + u[0] * A * Math.cos(th) + v[0] * B * Math.sin(th); out[2] = cz + u[1] * A * Math.cos(th) + v[1] * B * Math.sin(th);
  out[1] = ZEP.alt + 4 * Math.sin(th * 3);
  const dx = -u[0] * A * Math.sin(th) + v[0] * B * Math.cos(th), dz = -u[1] * A * Math.sin(th) + v[1] * B * Math.cos(th);
  return Math.atan2(dx, dz);
}
function buildBeams(parent) {
  const n = ST.beams.length + ST.halos.length + ST.trails.length, P = new Float32Array(n * 18), N = new Float32Array(n * 18), U = new Float32Array(n * 12), C = new Float32Array(n * 18);
  const R = ST.atlas.rect, put = (q, r) => { for (let i = 0; i < 6; i++) { const [s, t] = [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]][i]; U[q * 12 + i * 2] = r[0] + (r[2] - r[0]) * s; U[q * 12 + i * 2 + 1] = r[1] + (r[3] - r[1]) * t; N[q * 18 + i * 3 + 1] = 1; } };
  let q = 0;
  for (let i = 0; i < ST.beams.length + ST.trails.length; i++) put(q++, R.beamGrad);
  for (let i = 0; i < ST.halos.length; i++) put(q++, R.glow);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setAttribute('bake', new THREE.Float32BufferAttribute(C, 3));
  const m = makeMat('street', { baked: true, fog: false, side: THREE.DoubleSide, depthWrite: false });
  m.transparent = true; m.blending = THREE.AdditiveBlending;   // black adds nothing: the textures fade to black, the vertex colour sets the strength
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 5;
  parent.add(mesh); ST.beamMesh = mesh;
}
// one quad from p0 (width w0, colour c0) to p1 (w1, c1), turned about its own axis to face the eye at (ex, ey, ez)
function beamQuad(q, p0, p1, w0, w1, c0, c1, ex, ey, ez) {
  const A = ST.beamMesh.geometry.attributes, P = A.position.array, C = A.bake.array;
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], dz = p1[2] - p0[2], mx = (p0[0] + p1[0]) / 2 - ex, my = (p0[1] + p1[1]) / 2 - ey, mz = (p0[2] + p1[2]) / 2 - ez;
  let sx = dy * mz - dz * my, sy = dz * mx - dx * mz, sz = dx * my - dy * mx; const l = Math.hypot(sx, sy, sz) || 1; sx /= l; sy /= l; sz /= l;
  const V = [[p0, -w0 / 2, c0], [p0, w0 / 2, c0], [p1, w1 / 2, c1], [p0, -w0 / 2, c0], [p1, w1 / 2, c1], [p1, -w1 / 2, c1]];
  for (let i = 0; i < 6; i++) { const [p, w, c] = V[i], o = q * 18 + i * 3; P[o] = p[0] + sx * w; P[o + 1] = p[1] + sy * w; P[o + 2] = p[2] + sz * w; C[o] = c[0]; C[o + 1] = c[1]; C[o + 2] = c[2]; }
}
const BLACK3 = [0, 0, 0], _beamP1 = [0, 0, 0], _trA = [0, 0, 0], _trB = [0, 0, 0], _haloA = [0, 0, 0], _haloB = [0, 0, 0], _haloC = [0, 0, 0], _haloP = [0, 0, 0];
// the tick: t in seconds (absolute, so running it twice a frame, once per eye in VR, is harmless), the eye's position
function skyTick(t, ex, ey, ez) {
  if (ZEP.mesh) {   // the zeppelin first (it's drawn right after this, so it moves this frame)
    ZEP.head = zepAt(t, ZEP.pos);
    const M = ZEP.mesh; M.position.set(ZEP.pos[0], ZEP.pos[1], ZEP.pos[2]); M.rotation.y = ZEP.head; M.updateMatrixWorld(true);
  }
  if (!ST.beamMesh) return;
  let q = 0;
  const zc = Math.cos(ZEP.head), zs = Math.sin(ZEP.head);
  for (const B of ST.beams) {
    if (B.track) {   // finding the hull: aimed at it, drifting along it and off it again, on past it
      const w = 0.5 + 0.5 * Math.sin(t * 0.31 + B.ph), along = Math.sin(t * 0.53 + B.ph) * ZEP.L * 0.35;
      const tx = ZEP.pos[0] + zs * along + w * 30 * Math.cos(t * 0.7 + B.ph), ty = ZEP.pos[1] + Math.sin(t * 1.1 + B.ph) * 6, tz = ZEP.pos[2] + zc * along + w * 30 * Math.sin(t * 0.7 + B.ph);
      const dx = tx - B.o[0], dy = ty - B.o[1], dz = tz - B.o[2], d = Math.hypot(dx, dy, dz), k = Math.min(B.len, d * 1.35) / d;
      _beamP1[0] = B.o[0] + dx * k; _beamP1[1] = B.o[1] + dy * k; _beamP1[2] = B.o[2] + dz * k;
    } else {   // sweeping side to side (and nodding a little)
      const az = B.az + B.sweep * Math.sin(t * B.rate + B.ph), el = B.el + 0.08 * Math.sin(t * B.rate * 1.7 + B.ph * 2), ce = Math.cos(el);
      _beamP1[0] = B.o[0] + Math.sin(az) * ce * B.len; _beamP1[1] = B.o[1] + Math.sin(el) * B.len; _beamP1[2] = B.o[2] + Math.cos(az) * ce * B.len;
    }
    beamQuad(q++, B.o, _beamP1, B.w0, B.w1, B.col, B.tip || BLACK3, ex, ey, ez);
  }
  for (const T of ST.trails) {   // light streaks running along a line, wrapping round
    const L = Math.hypot(T.b[0] - T.a[0], T.b[1] - T.a[1], T.b[2] - T.a[2]), s0 = ((t * T.speed + T.ph) % L + L) % L, s1 = Math.min(L, s0 + T.len);
    for (let k = 0; k < 3; k++) { _trA[k] = T.a[k] + (T.b[k] - T.a[k]) * s0 / L; _trB[k] = T.a[k] + (T.b[k] - T.a[k]) * s1 / L; }
    if (T.speed > 0) beamQuad(q++, _trA, _trB, T.w, T.w, BLACK3, T.col, ex, ey, ez); else beamQuad(q++, _trA, _trB, T.w, T.w, T.col, BLACK3, ex, ey, ez);   // bright end first
  }
  for (const H of ST.halos) {   // glows: a vertical quad turned to the eye, pulsing or blinking if asked
    let k = H.pulse ? H.pulse[1] + (1 - H.pulse[1]) * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 / H.pulse[0])) : 1;
    if (H.blink) k = (t % H.blink[0]) < H.blink[1] ? 1 : 0;
    let c = H.c;
    if (H.zep) { const [lx, ly, lz] = H.zep; _haloP[0] = ZEP.pos[0] + lx * zc + lz * zs; _haloP[1] = ZEP.pos[1] + ly; _haloP[2] = ZEP.pos[2] - lx * zs + lz * zc; c = _haloP; }
    _haloC[0] = H.col[0] * k; _haloC[1] = H.col[1] * k; _haloC[2] = H.col[2] * k;
    _haloA[0] = c[0]; _haloA[1] = c[1] - H.size / 2; _haloA[2] = c[2]; _haloB[0] = c[0]; _haloB[1] = c[1] + H.size / 2; _haloB[2] = c[2];
    beamQuad(q++, _haloA, _haloB, H.size, H.size, _haloC, _haloC, ex, ey, ez);
  }
  const A = ST.beamMesh.geometry.attributes; A.position.needsUpdate = true; A.bake.needsUpdate = true;
  ST.skyT = t;
}
// what moves in the skylines: Columbia's searchlights, Aoki's crown, the mast's floodlights, the Halcyon's strobe, bikes on the Shuto
function skylineLights() {
  let k = 0;
  ST.beams = ST.searchlights.map(([x, y, z]) => {   // every searchlight sweeps over the city, each at its own pace:
    // across your line of sight from the square (so they read long), leaning away, alternately left and right, crossing
    const az = Math.atan2(x, z - 15) + (k % 2 ? 1 : -1) * (Math.PI / 2 - 0.4); k++;
    return { o: [x, y, z], az, el: 0.95 + 0.2 * ((k * 7) % 3) / 2, sweep: 0.55 + 0.1 * (k % 3), rate: 0.22 + 0.05 * ((k * 5) % 4), ph: k * 1.9, len: 240, w0: 3, w1: 26, col: BEAM_GOLD.map(c => c * 0.55) };
  });
  // two more, on Civic Harmony's crown and the Royal Hotel's, keep finding the Halcyon's hull as it passes
  for (const [o, ph] of [[SKY.civicLight, 0], [SKY.royalLight, 2.1]]) ST.beams.push({ o, track: true, ph, len: 420, w0: 3, w1: 24, col: BEAM_GOLD.map(c => c * 0.6) });
  ST.halos = [
    { c: SKY.aokiCrown, size: 160, col: [0.85, 0.08, 0.06], pulse: [4.5, 0.5] },
    { c: [SKY.aokiCrown[0], SKY.aokiCrown[1] - 20, SKY.aokiCrown[2]], size: 320, col: [0.3, 0.03, 0.04], pulse: [4.5, 0.6] },   // its red haze on the sky   // Aoki's crown, a slow red pulse
    { c: [SKY.aokiCrown[0], SKY.aoki.top - 4, SKY.aokiCrown[2]], size: 30, col: [0.7, 0.12, 0.08], pulse: [1.5, 0.2] },   // the needle's tip
    { c: SKY.civicMast, size: 70, col: [0.34, 0.26, 0.12] },   // the mooring mast's floodlights
    { zep: [0, zepR(-ZEP.L / 2 + 9) * 0.9 + 17.5, -ZEP.L / 2 + 9], size: 22, col: [1, 1, 1], blink: [1.3, 0.12] },   // the Halcyon's tail strobe
  ];
  ST.trails = [];
  ST.expressway.forEach(([a, b], k) => { for (let i = 0; i < 7; i++) {   // bikes: red tail lights one way, white headlights the other
    const back = i % 2 === 1, off = (back ? 1.6 : -1.6);
    ST.trails.push({ a: [a[0], a[1], a[2] + off], b: [b[0], b[1], b[2] + off], len: 16, w: 1.4, col: back ? [0.75, 0.7, 0.6] : [0.9, 0.12, 0.08], speed: (back ? -1 : 1) * (26 + (i * 13 + k * 7) % 12), ph: i * 47 + k * 31 });
  } });
}
// the sky: a band around the player, dark overhead, glowing over each sector (red Hinomoto, sodium Krasnovia, gold Columbia)
// LOD: every building between the Old Quarter's edge and the skylines is one cheap box with its windows painted on,
// part of the always-drawn skyline mesh: you see the city's lights and rooflines all the way out, nothing pops.
function buildFarField() {
  const acc = ST.sky, F = CFG.street.farField; let s = 7, n = 0;
  const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  // ground under the whole city, just below the street's own (which covers it near you)
  // finer near you (so street lights pool on it), coarse further out. The coarse ground is a frame AROUND the fine
  // one, never under it: a 1 km triangle's far vertices get snapped by metres, which tilts its plane up through the
  // ground you stand on (a yard once showed it as streaks of sky).
  const [ix0, ix1, iz0, iz1] = F.fineGround, ox0 = -F.radius - 60, ox1 = F.radius + 60, oz0 = -F.radius - 60, oz1 = F.radius + 80;
  ground(acc, 'farGround', ix0, iz0, ix1, iz1, -0.04, 60, { cell: 10 });
  for (const [a0, b0, a1, b1] of [[ox0, oz0, ox1, iz0], [ox0, iz1, ox1, oz1], [ox0, iz0, ix0, iz1], [ix1, iz0, ox1, iz1]]) ground(acc, 'farGround', a0, b0, a1, b1, -0.06, 60, { cell: 999 });
  ST.farLamps = [];
  // what's already built near you (the square, its buildings, the side roads, the road, the Ring Road and its first blocks)
  const NEAR = [[-37, 37, -7, 31], [-40, -19, -21, -7], [-13.5, 13.5, 31, 57], [-42, 42, 57, 74], [-72, 44, 74, 98], ...levelRects()];
  const hits = (x0, x1, z0, z1) => NEAR.some(([a0, a1, b0, b1]) => x0 < a1 && x1 > a0 && z0 < b1 && z1 > b0);
  const P = F.pitch, B = F.block, half = B / 2;
  // a street grid that carries on the three old roads: x = 0 (the wall down the middle), z = 14.5 (the side roads)
  for (let ix = -Math.ceil(F.radius / P); ix <= Math.ceil(F.radius / P); ix++) for (let iz = -Math.ceil(F.radius / P); iz <= Math.ceil(F.radius / P); iz++) {
    const cx = ix * P, cz = 14.5 + P / 2 + iz * P, r = Math.hypot(cx, cz - 20);
    if (r > F.radius) continue;
    const old = r < F.oldRadius, a = Math.atan2(cx, cz - 10) / DEG;
    const sector = old ? 'old' : Math.abs(a) > 125 ? 'hino' : a < 0 ? 'kras' : 'colu';
    // the block: two buildings side by side (one far out), or two narrow ones either side of the wall at x = 0
    const parts = ix === 0 ? [[-half, -4], [4, half]] : (r < 220 ? [[-half, -0.6], [0.6, half]] : [[-half, half]]);
    for (const [u0, u1] of parts) {
      let x0 = cx + u0, x1 = cx + u1, z0 = cz - half + rng() * 1.5, z1 = cz + half - rng() * 1.5;
      for (const [a0, a1, b0, b1] of NEAR) {   // trim a stand-in back to the edge of what's built, so there's no gap
        if (!(x0 < a1 && x1 > a0 && z0 < b1 && z1 > b0)) continue;
        const cut = [[a0 - x0, () => { x1 = a0 - 1; }], [x1 - a1, () => { x0 = a1 + 1; }], [b0 - z0, () => { z1 = b0 - 1; }], [z1 - b1, () => { z0 = b1 + 1; }]];
        cut.sort((p, q) => q[0] - p[0]); cut[0][1]();
      }
      if (x1 - x0 < 2.5 || z1 - z0 < 2.5 || hits(x0, x1, z0, z1)) continue;
      const w = x1 - x0, d = z1 - z0, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      let h = { old: 10 + rng() * 7, hino: 7 + rng() * 9, kras: 22 + rng() * 24, colu: 12 + rng() * 26 }[sector];
      const dh = Math.hypot(mx - STREET.hino[0], mz - STREET.hino[1]); if (sector === 'hino' && dh < 170 && rng() < 0.3) h = 30 + rng() * 60;
      const key = { old: 'farOld', hino: h > 25 ? 'glassN' : 'farHino', kras: 'panel', colu: rng() < 0.5 ? 'farCol' : 'decoStone' }[sector];
      const rows = Math.max(1, Math.round(h / 13));   // one quad per face per ~4 floors
      if (sector === 'old') acc.tint = PLASTER[Math.floor(rng() * PLASTER.length)].map(c => c * 0.9 + 0.1);
      frustum(acc, key, mx, 0, mz, w, d, w, d, h, 0, { u: w * 1.0001, v: h / rows * 1.0001, top: false, cell: 999, faceKey: { l: key, r: key } });
      // aq above used u per face = w; side faces (depth d) stretch a little: fine at this distance
      acc.tint = [1, 1, 1];
      if (sector === 'old') {   // mansard / copper roof, sometimes an onion dome
        const rk = rng() < 0.5 ? 'copperTop' : 'slate';
        frustum(acc, rk, mx, h, mz, w, d, w * 0.55, d * 0.55, 3.2, 0, { u: w * 1.0001, v: 3.3, top: rk, tu: w * 1.0001, cell: 999 });
        if (rng() < 0.06) onion(acc, mx, h + 3.2, mz, 2.2, 5, 6);
      } else if (sector === 'hino' && h < 25) frustum(acc, 'kawara', mx, h, mz, w + 1.6, d + 1.6, w * 0.4, d * 0.2, 2.6, 0, { u: 99, v: 99, top: 'kawara', tu: 99, cell: 999 });
      else ground(acc, 'roofDark', x0, z0, x1, z1, h, 99, { cell: 999 });
      n++;
    }
    // a street light on the block's corner: the city's lights all the way out
    const lk = { old: 'gaslamp', hino: rng() < 0.5 ? 'litRed' : 'litCyan', kras: 'litSodium', colu: 'litWarm' }[sector];
    const lx = cx - half - (P - B) / 2, lz = cz - half - (P - B) / 2;
    if (!hits(lx - 1, lx + 1, lz - 1, lz + 1)) {
      sbox(acc, lk, lx, 4.2, lz, 1.0, 1.0, 1.0, 0, { u: 99, v: 99, cell: 999 });
      const L = CFG.street.light, col = { old: L.gas, hino: L.hinoGlow, kras: L.sodium, colu: L.amber }[sector];
      ST.farLamps.push(lightFromHex([lx, 4.6, lz], col, F.lampRadius, F.lampK));
    }
  }
  ST.farBlocks = n;
}
function buildSky() {
  // (drawn first, without depth, so its size doesn't matter, only its angles: small enough that its top row, 73° up,
  // is inside the camera's far plane; at 420 m everything above ~45° was clipped and showed as a dark disc overhead)
  const R = 160, n = 32, rows = [[-60, 0.9], [6, 1], [70, 0.7], [200, 0.38], [520, 0.12], [1400, 0]].map(([y, k]) => [y * R / 420, k]), P = [], N = [], U = [], C = [], W = ST.atlas.rect.white;
  const glow = [[STREET.hino, CFG.street.sky.hino], [STREET.kras, CFG.street.sky.kras], [STREET.colu, CFG.street.sky.colu]].map(([p, c]) => [Math.atan2(p[1], p[0]), new THREE.Color(c)]);
  const top = new THREE.Color(CFG.street.sky.top), hor = new THREE.Color(CFG.street.sky.horizon);
  const colAt = (a, k) => {
    let r = hor.r, g = hor.g, b = hor.b;
    for (const [ga, gc] of glow) { const d = Math.cos(a - ga); if (d > 0) { const f = Math.pow(d, 6); r += gc.r * f; g += gc.g * f; b += gc.b * f; } }
    return [top.r + (r - top.r) * k, top.g + (g - top.g) * k, top.b + (b - top.b) * k];
  };
  for (let i = 0; i < n; i++) for (let j = 0; j < rows.length - 1; j++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, [y0, k0] = rows[j], [y1, k1] = rows[j + 1];
    const v = [[a0, y1, k1], [a1, y1, k1], [a1, y0, k0], [a0, y1, k1], [a1, y0, k0], [a0, y0, k0]];
    for (const [a, y, k] of v) { P.push(Math.cos(a) * R, y, Math.sin(a) * R); N.push(-Math.cos(a), 0, -Math.sin(a)); U.push((W[0] + W[2]) / 2, (W[1] + W[3]) / 2); C.push(...colAt(a, k)); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setAttribute('bake', new THREE.Float32BufferAttribute(C, 3));
  const m = makeMat('street', { baked: true, fog: false, side: THREE.DoubleSide, depthWrite: false });
  ST.skyMesh = new THREE.Mesh(g, m); ST.skyMesh.renderOrder = -10; ST.skyMesh.frustumCulled = false;
  scene.add(ST.skyMesh);
  scene.background = new THREE.Color(CFG.street.sky.top);   // straight up: the band's top colour
}
function buildStreet() {
  ST.atlas = paintAtlas(); texCache.street = ST.atlas.tex;
  ST.lit = new GeoAcc(); ST.sky = new GeoAcc(); ST.lamps = []; ST.beacons = []; ST.searchlights = [];
  buildStreetGeometry();
  for (const D of levelList()) if (D.build) D.build();   // the registered levels, in order (src/levels.js)
  buildSkylines();
  buildFarField();
  const L = CFG.street.light;
  const litMesh = new THREE.Mesh(ST.lit.geometry({ ambient: L.ambient, sky: L.sky, lights: ST.lamps }), makeMat('street', { baked: true }));
  const skyMesh = new THREE.Mesh(ST.sky.geometry({ ambient: L.skylineAmbient, sky: L.skylineSky, lights: ST.farLamps.concat(ST.lamps) }), makeMat('street', { baked: true, fog: CFG.street.skylineFog }));
  for (const m of [litMesh, skyMesh]) { m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false; scene.add(m); }
  // the street keeps its own outdoor fog wherever you stand: seen through the door from inside the bar it isn't
  // drowned in the bar's short fog (the shared fog, for goons and props, still follows you)
  const F = CFG.street.fog;
  for (const m of [litMesh, skyMesh]) { m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far }; }
  ST.tris = ST.lit.tris; ST.litMesh = litMesh; ST.skylineMesh = skyMesh;
  skylineLights(); buildZeppelin(skyMesh); buildBeams(skyMesh);   // the Halcyon and the moving lights ride on the skyline mesh
  skyTick(0, 0, 1.6, 15);
  buildSky();
  // where you can walk: the doorway (once the door's open), the square, the side-road mouths, the road
  const Z = STREET.fz, W = STREET.west, E = STREET.east;
  [ { x0: -DOOR.w / 2, x1: DOOR.w / 2, z0: 4.2, z1: Z + 1.0, area: 'door', on: () => DOOR.open > 0.6 },
    { x0: -STREET.sq.x + 0.2, x1: STREET.sq.x - 0.2, z0: Z, z1: STREET.sq.z1 - 0.1, area: 'square' },
    { x0: W.x1 + 17.4, x1: -STREET.sq.x + 2, z0: W.z0 + 0.2, z1: W.z1 - 0.2, area: 'west' },   // rectangles overlap so you can cross
    { x0: STREET.sq.x - 2, x1: E.x1 - 17.4, z0: E.z0 + 0.2, z1: E.z1 - 0.2, area: 'east' },
    { x0: -STREET.road.x + 0.2, x1: STREET.road.x - 0.2, z0: STREET.sq.z1 - 1, z1: STREET.chk.z - 0.3, area: 'road' },
    { x0: -STREET.road.x + 0.2, x1: STREET.road.x - 0.2, z0: STREET.chk.z - 1, z1: STREET.chk.z + CFG.street.exitPast + 1, area: 'boom', on: () => (level.name === 'street' && game.state === 'won') || level.name === 'superblock' },
  ].forEach(addWalk);
  ST.lamps.sort((a, b) => a[0][2] - b[0][2]);
}
