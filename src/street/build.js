'use strict';
// ============================== the street: geometry ========================
// Out the Threeway's door: Tripoint Square (Old Quarter, 1962-frozen), the old road between the Krasnovian and
// Columbian lines, and the joint-militia checkpoint where the Ring Road starts. +z runs from the door down the road.
const STREET = {
  fz: 5.32,                                   // the Threeway's front wall (outside face)
  sq: { x: 13, z1: 22 },                      // Tripoint Square: x ±13, from the Threeway's front to z 22
  road: { x: 4.5, z1: 55 },                   // the old road: x ±4.5, from the square to the checkpoint
  west: { z0: 12, z1: 17, x1: -34 },          // side-road mouths (barricaded: the other two old roads)
  east: { z0: 10.5, z1: 15.5, x1: 34 },
  chk: { z: 56 },                             // the boom across the road
  clock: [6.5, 15.2], station: [-7.4, 15],
  hino: [-70, -250], kras: [-150, 230], colu: [62, 250],   // where the three skylines stand (both reach the road's sightline)
};
const ST = { atlas: null, lit: null, sky: null, skyMesh: null, lamps: [], tris: 0, skyTris: 0, keyTris: {} };
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function uvBreaks(a, b, len, cell) {
  const pts = [0, 1], lo = Math.min(a, b), hi = Math.max(a, b);
  if (hi - lo > 1e-6) for (let k = Math.floor(lo + 1e-6) + 1; k < hi - 1e-6; k++) pts.push((k - a) / (b - a));
  const n = Math.min(64, Math.ceil(len / cell)); for (let i = 1; i < n; i++) pts.push(i / n);
  pts.sort((p, q) => p - q);
  return pts.filter((p, i) => i === 0 || p - pts[i - 1] > 1e-4);
}
// One quad into the atlas: corners A B C D (top-left, top-right, bottom-right, bottom-left seen from the front),
// uv = [u0, v0, u1, v1] in texture repeats (u runs A→B, v runs A→D). It is cut wherever a repeat ends (an atlas
// can't wrap) and into cells of at most `cell` metres so the baked light has vertices to live on.
// flat colours never need cutting at texture repeats
const SOLID = new Set(['farGround', 'litRed', 'litCyan', 'litMagenta', 'litWarm', 'litSodium', 'roofDark', 'black', 'white', 'iron', 'gilt', 'lacquer']);
function aq(acc, key, A, B, C, D, uv, out, cell = 2.2) {
  const R = ST.atlas.rect[key]; if (!R) throw new Error('no painting ' + key);
  if (SOLID.has(key)) uv = [0, 0, 1, 1];
  const t0 = acc.tris;
  const [u0, v0, u1, v1] = uv;
  const sB = uvBreaks(u0, u1, Math.max(dist3(A, B), dist3(D, C)), cell), tB = uvBreaks(v0, v1, Math.max(dist3(A, D), dist3(B, C)), cell);
  const P = (s, t) => lerp3(lerp3(A, B, s), lerp3(D, C, s), t);
  for (let i = 0; i < sB.length - 1; i++) {
    const sa = sB[i], sb = sB[i + 1], ua = u0 + (u1 - u0) * sa, ub = u0 + (u1 - u0) * sb, tu = Math.floor(Math.min(ua, ub) + 1e-6);
    const mu = (u) => R[0] + clamp(u - tu, 0, 1) * (R[2] - R[0]);
    for (let j = 0; j < tB.length - 1; j++) {
      const ta = tB[j], tb = tB[j + 1], va = v0 + (v1 - v0) * ta, vb = v0 + (v1 - v0) * tb, tv = Math.floor(Math.min(va, vb) + 1e-6);
      const mv = (v) => R[1] + clamp(v - tv, 0, 1) * (R[3] - R[1]);
      acc.quad([P(sa, ta), P(sb, ta), P(sb, tb), P(sa, tb)], [[mu(ua), mv(va)], [mu(ub), mv(va)], [mu(ub), mv(vb)], [mu(ua), mv(vb)]], out);
    }
  }
  ST.keyTris[key] = (ST.keyTris[key] || 0) + acc.tris - t0;   // where the triangles go (perf check)
}
// local (lx, lz) around (cx, cz) turned by phi about y (local +z = the front)
const LP = (cx, cz, phi, lx, lz) => { const c = Math.cos(phi), s = Math.sin(phi); return [cx + lx * c + lz * s, cz - lx * s + lz * c]; };
const LN = (phi, nx, nz) => { const c = Math.cos(phi), s = Math.sin(phi); return [nx * c + nz * s, 0, -nx * s + nz * c]; };
// a vertical wall from (x0,z0) to (x1,z1) (left to right seen from the front); faces left-hand of the run
function wall(acc, key, x0, z0, x1, z1, y0, y1, um, vm, o = {}) {
  const len = Math.hypot(x1 - x0, z1 - z0), n = [-(z1 - z0) / len, 0, (x1 - x0) / len], U0 = o.u0 || 0, V0 = o.v0 || 0;
  aq(acc, key, [x0, y1, z0], [x1, y1, z1], [x1, y0, z1], [x0, y0, z0], [U0, V0, U0 + len / um, V0 + (y1 - y0) / vm], n, o.cell);
}
// flat ground rectangle, tiled every `tile` metres
function ground(acc, key, x0, z0, x1, z1, y, tile, o = {}) {
  aq(acc, key, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0 / tile, z0 / tile, x1 / tile, z1 / tile], [0, 1, 0], o.cell || 1.6);
}
// a tapered box (frustum) around (cx, cz), turned by phi. Side faces tile every u x v metres from the top down.
function frustum(acc, key, cx, y0, cz, w0, d0, w1, d1, h, phi, o = {}) {
  const y1 = y0 + h, um = o.u || 4, vm = o.v || 4;
  const b = [[-w0 / 2, -d0 / 2], [w0 / 2, -d0 / 2], [w0 / 2, d0 / 2], [-w0 / 2, d0 / 2]].map(([x, z]) => LP(cx, cz, phi, x, z));
  const t = [[-w1 / 2, -d1 / 2], [w1 / 2, -d1 / 2], [w1 / 2, d1 / 2], [-w1 / 2, d1 / 2]].map(([x, z]) => LP(cx, cz, phi, x, z));
  const faces = [[3, 2, [0, 0, 1], w0, 'f'], [2, 1, [1, 0, 0], d0, 'r'], [1, 0, [0, 0, -1], w0, 'b'], [0, 3, [-1, 0, 0], d0, 'l']];
  for (const [i, j, nn, len, f] of faces) {
    if (o.skip && o.skip.includes(f)) continue;
    const k = (o.faceKey && o.faceKey[f]) || key, slope = Math.max(w0 - w1, d0 - d1) / 2 / Math.max(h, 0.01);
    const n = LN(phi, nn[0], nn[2]); n[1] = slope;
    const sh = Math.hypot(h, slope * h);
    aq(acc, k, [t[i][0], y1, t[i][1]], [t[j][0], y1, t[j][1]], [b[j][0], y0, b[j][1]], [b[i][0], y0, b[i][1]], [0, 0, len / um, sh / vm], n, o.cell);
  }
  if (o.top !== false && (w1 > 0.01 || d1 > 0.01)) {
    const tk = o.top || key, tm = o.tu || 4;
    aq(acc, tk, [t[0][0], y1, t[0][1]], [t[1][0], y1, t[1][1]], [t[2][0], y1, t[2][1]], [t[3][0], y1, t[3][1]], [0, 0, w1 / tm, d1 / tm], [0, 1, 0], o.cell);
  }
}
const sbox = (acc, key, cx, y0, cz, w, d, h, phi, o) => frustum(acc, key, cx, y0, cz, w, d, w, d, h, phi, o);
function cyl(acc, key, cx, y0, cz, r0, r1, h, n, o = {}) {
  const um = o.u || 4, vm = o.v || 4;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2;
    const P = (r, a, y) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r], seg = 2 * Math.PI * Math.max(r0, r1) / n;
    aq(acc, key, P(r1, a1, y0 + h), P(r1, a0, y0 + h), P(r0, a0, y0), P(r0, a1, y0), [0, 0, seg / um, h / vm], [Math.cos(am), (r0 - r1) / Math.max(h, 0.01), Math.sin(am)], o.cell);
  }
}
function onion(acc, cx, y, cz, r, h, n = 8, key = 'onion') {   // bulb + gilt spike
  const prof = [[0.55, 0], [0.95, 0.18], [1.0, 0.36], [0.75, 0.58], [0.38, 0.78], [0.06, 0.95]];
  for (let i = 0; i < prof.length - 1; i++) cyl(acc, key, cx, y + prof[i][1] * h, cz, prof[i][0] * r, prof[i + 1][0] * r, (prof[i + 1][1] - prof[i][1]) * h, n, { u: r * 1.2, v: r * 1.2 });
  cyl(acc, 'gilt', cx, y + 0.95 * h, cz, 0.06 * r + 0.02, 0.01, h * 0.35, 4, { u: 1, v: 1 });
}
// a flat picture (sign, flag, poster) facing local +z at (cx, cy, cz); off = distance out from the wall
function plate(acc, key, cx, cy, cz, w, h, phi, off = 0.04, uv = [0, 0, 1, 1], two = false) {
  const [x0, z0] = LP(cx, cz, phi, -w / 2, off), [x1, z1] = LP(cx, cz, phi, w / 2, off);
  aq(acc, key, [x0, cy + h / 2, z0], [x1, cy + h / 2, z1], [x1, cy - h / 2, z1], [x0, cy - h / 2, z0], uv, LN(phi, 0, 1), 99);
  if (two) aq(acc, key, [x1, cy + h / 2, z1], [x0, cy + h / 2, z0], [x0, cy - h / 2, z0], [x1, cy - h / 2, z1], uv, LN(phi, 0, -1), 99);
}
function tileRoof(acc, cx, y, cz, w, d, phi, h = 2.2, over = 0.7) {   // Hinomoto tile roof: upturned tips, red brackets
  frustum(acc, 'kawara', cx, y, cz, w + over * 2, d + over * 2, w * 0.4, d * 0.15, h, phi, { u: 3.2, v: 3.2, top: 'kawara', tu: 3.2, cell: 3 });
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const [tx, tz] = LP(cx, cz, phi, sx * (w / 2 + over + 0.1), sz * (d / 2 + over + 0.1)); sbox(acc, 'kawara', tx, y - 0.05, tz, 0.35, 0.35, 0.4, phi, { u: 1.6, v: 1.6 }); }
  for (let k = 0; k < Math.max(2, Math.round(w / 2.4)); k++) { const sx = -w / 2 + 0.6 + k * (w - 1.2) / Math.max(1, Math.round(w / 2.4) - 1); const [bx, bz] = LP(cx, cz, phi, sx, d / 2 + 0.3); sbox(acc, 'lacquer', bx, y - 0.55, bz, 0.18, 0.6, 0.55, phi, { u: 1, v: 1 }); }
}
// an Old Quarter tenement: shopfront, plaster floors, a roof. Footprint [x0,x1] x [z0,z1]; which faces show is up to the caller.
const PLASTER = [[0.92, 0.84, 0.66], [0.78, 0.62, 0.74], [0.66, 0.78, 0.7], [0.9, 0.62, 0.5], [0.86, 0.84, 0.78], [0.84, 0.72, 0.52], [0.62, 0.74, 0.8]];
function tenement(acc, b) {
  const { x0, x1, z0, z1 } = b, floors = b.floors || 3, shopH = 4.0, fh = 3.2, top = shopH + floors * fh;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
  const col = b.col || PLASTER[b.tint || 0];
  acc.tint = col;
  const shopKey = b.shops || 'shopsPlain', upKey = b.painted ? 'tenement' : 'tenementPlain';
  // faces: [x0,z0]→ etc. run left-to-right seen from outside
  const F = { s: [x0, z1, x1, z1], n: [x1, z0, x0, z0], e: [x1, z1, x1, z0], w: [x0, z0, x0, z1] };
  for (const f of (b.faces || 'nsew')) {
    const [ax, az, bx, bz] = F[f], len = Math.hypot(bx - ax, bz - az), bays = Math.max(1, Math.round(len / 2.6));
    acc.tint = [col[0] * 0.55 + 0.25, col[1] * 0.55 + 0.25, col[2] * 0.55 + 0.25];
    wall(acc, shopKey, ax, az, bx, bz, 0, shopH, len / bays * 4, shopH, { u0: (b.seed || 0) * 0.25 });
    acc.tint = col;
    wall(acc, upKey, ax, az, bx, bz, shopH, top, len / bays * 4, fh * 2, { u0: (b.seed || 0) * 0.25 });
    acc.tint = [1, 1, 1];
    // a gilt cornice between the shops and the flats (brass city)
    const n = [-(bz - az) / len, (bx - ax) / len];
    aq(acc, 'gilt', [ax + n[0] * 0.08, shopH + 0.12, az + n[1] * 0.08], [bx + n[0] * 0.08, shopH + 0.12, bz + n[1] * 0.08], [bx + n[0] * 0.08, shopH - 0.02, bz + n[1] * 0.08], [ax + n[0] * 0.08, shopH - 0.02, az + n[1] * 0.08], [0, 0, len / 2, 1], [n[0], 0, n[1]], 4);
  }
  acc.tint = [1, 1, 1];
  if (b.roof === 'tile') tileRoof(acc, cx, top, cz, w, d, 0, 2.4, 0.6);
  else if (b.roof === 'flat') ground(acc, 'slate', x0, z0, x1, z1, top, 4);
  else {
    const rk = b.roof === 'copper' ? 'copper' : 'mansard', inset = Math.min(1.6, Math.min(w, d) * 0.3);
    frustum(acc, rk, cx, top, cz, w + 0.3, d + 0.3, w - inset * 2, d - inset * 2, 3.0, 0, { u: 4.4, v: 3.0, top: rk === 'copper' ? 'copperTop' : 'slate', tu: 3, skip: b.roofSkip });
    sbox(acc, 'gilt', cx, top - 0.1, cz, w + 0.36, d + 0.36, 0.14, 0, { u: 2, v: 1, top: false });
  }
  if (b.onion) {   // a Krasnovian onion-domed corner turret
    const [ox, oz] = b.onion; acc.tint = col;
    cyl(acc, upKey, ox, 0, oz, 1.3, 1.3, top + 1.2, 8, { u: 4, v: 6.4 }); acc.tint = [1, 1, 1];
    onion(acc, ox, top + 1.2, oz, 1.7, 3.6, 8);
  }
  if (b.bay) {   // a Columbian cast-iron bay window on the front
    const [bx, bz, phi] = b.bay;
    sbox(acc, 'shops', bx, shopH + 0.2, bz, 2.4, 0.8, fh * floors - 0.6, phi, { u: 9.6, v: 4, top: 'slate' });
  }
}
function gasLamp(acc, x, z, y = 0) {
  sbox(acc, 'iron', x, y, z, 0.32, 0.32, 0.5, 0, { u: 1, v: 1 });
  sbox(acc, 'iron', x, y + 0.5, z, 0.14, 0.14, 2.9, 0, { u: 1, v: 1, top: false });
  sbox(acc, 'iron', x, y + 3.35, z, 0.5, 0.5, 0.06, 0, { u: 1, v: 1 });
  frustum(acc, 'gaslamp', x, y + 3.4, z, 0.3, 0.3, 0.42, 0.42, 0.52, 0, { u: 0.36, v: 0.52, top: false });
  frustum(acc, 'iron', x, y + 3.92, z, 0.5, 0.5, 0.06, 0.06, 0.3, 0, { u: 1, v: 1 });
  ST.lamps.push(lightFromHex([x, y + 3.65, z], CFG.street.light.gas, CFG.street.light.gasRadius, CFG.street.light.gasK));
  WORLD_BOXES.push([x - 0.16, 0, z - 0.16, x + 0.16, 3.9, z + 0.16]);
  BLOCKERS.push({ x0: x - 0.16, x1: x + 0.16, z0: z - 0.16, z1: z + 0.16 });
}
function wallLamp(acc, x, y, z, phi) {   // brass bracket lantern on a facade
  const [cx, cz] = LP(x, z, phi, 0, 0.35);
  frustum(acc, 'gaslamp', cx, y - 0.25, cz, 0.24, 0.24, 0.32, 0.32, 0.4, phi, { u: 0.3, v: 0.4, top: false });
  frustum(acc, 'iron', cx, y + 0.15, cz, 0.36, 0.36, 0.04, 0.04, 0.22, phi, { u: 1, v: 1 });
  ST.lamps.push(lightFromHex([cx, y, cz], CFG.street.light.gas, CFG.street.light.gasRadius * 0.8, CFG.street.light.gasK));
}
function bracket(acc, x, y, z, phi) { const [px, pz] = LP(x, z, phi, 0, 0.18); sbox(acc, 'iron', px, y + 0.12, pz, 0.06, 0.36, 0.06, phi, { u: 1, v: 1 }); }

function buildThreewayFront(acc) {
  const Z = STREET.fz, X = 5.32, DW = DOOR.w / 2 + 0.12, H0 = 4.0, top = 7.4;
  // shopfront: dark wood with the bar's two big windows either side of the door
  acc.tint = [1, 1, 1];
  wall(acc, 'threewayFront', -X, Z, -DW, Z, 0, H0, (X - DW) * 2, H0, { u0: 0 });
  wall(acc, 'threewayFront', DW, Z, X, Z, 0, H0, (X - DW) * 2, H0, { u0: 0.5 });
  wall(acc, 'darkwood', -DW, Z, DW, Z, DOOR.h + 0.12, H0, 1, 1);
  // door reveal (the wall's thickness) is the bar's darkwood frame
  aq(acc, 'neonThreeway', [-2.6, 3.86, Z + 0.1], [2.6, 3.86, Z + 0.1], [2.6, 3.18, Z + 0.1], [-2.6, 3.18, Z + 0.1], [0, 0, 1, 1], [0, 0, 1], 99);
  sbox(acc, 'iron', 0, 3.1, Z + 0.06, 5.3, 0.1, 0.06, 0, { u: 1, v: 1 });
  ST.lamps.push(lightFromHex([0, 3.9, Z + 1.1], '#ff4f9a', 6.5, 0.6));   // the neon's pink on the cobbles and the flags
  sbox(acc, 'gilt', 0, H0 - 0.06, Z, X * 2 + 0.2, 0.3, 0.2, 0, { u: 2, v: 1 });
  // upper floor: ochre plaster, Krasnovian painted surrounds
  acc.tint = [0.92, 0.78, 0.55];
  wall(acc, 'tenement', -X, Z, X, Z, H0, top, 10.4, 6.4);
  for (const [a, b] of [[X, -5.4], [-X, Z]]) { /* side walls hidden by the neighbours */ }
  acc.tint = [1, 1, 1];
  tileRoof(acc, 0, top, (Z - 5.4) / 2, X * 2, Z + 5.4, 0, 2.8, 0.8);
  // Tripoint Day: all three flags over the door
  for (const [sx, k] of [[-2.4, 'flag_hino'], [0, 'flag_kras'], [2.4, 'flag_colu']]) {
    sbox(acc, 'iron', sx, 4.6, Z + 0.6, 0.05, 1.2, 0.05, 0, { u: 1, v: 1 });
    plate(acc, k, sx, 4.2, Z + 0.95, 1.2, 0.8, 0, 0, [0, 0, 1, 1], true);
  }
  wallLamp(acc, -1.7, 2.7, Z, 0); wallLamp(acc, 1.7, 2.7, Z, 0);
  bracket(acc, -1.7, 2.7, Z, 0); bracket(acc, 1.7, 2.7, Z, 0);
}
function brassClock(acc, x, z) {   // 1888: Columbian railway money, Vostburger founders, a Hinomoto carpenter's roof
  sbox(acc, 'stone', x, 0, z, 1.1, 1.1, 0.9, 0, { u: 1.2, v: 1.2 });
  sbox(acc, 'iron', x, 0.9, z, 0.42, 0.42, 3.5, 0, { u: 1, v: 1, top: false });
  for (const y of [1.0, 2.6]) sbox(acc, 'gilt', x, y, z, 0.56, 0.56, 0.12, 0, { u: 1, v: 1 });
  sbox(acc, 'iron', x, 4.4, z, 1.0, 1.0, 1.0, 0, { u: 1, v: 1 });
  for (let a = 0; a < 4; a++) plate(acc, 'clockFace', x, 4.9, z, 0.8, 0.8, a * Math.PI / 2, 0.51);
  sbox(acc, 'gilt', x, 5.4, z, 1.16, 1.16, 0.1, 0, { u: 1, v: 1 });
  frustum(acc, 'kawara', x, 5.5, z, 1.7, 1.7, 0.3, 0.3, 0.7, 0, { u: 1.6, v: 1.6 });
  onion(acc, x, 6.2, z, 0.35, 0.9, 6);
  WORLD_BOXES.push([x - 0.55, 0, z - 0.55, x + 0.55, 0.9, z + 0.55], [x - 0.21, 0.9, z - 0.21, x + 0.21, 4.4, z + 0.21]);
  BLOCKERS.push({ x0: x - 0.55, x1: x + 0.55, z0: z - 0.55, z1: z + 0.55 });
  ST.lamps.push(lightFromHex([x, 4.9, z], '#f4ead0', 3.5, 0.5));
}
function sealedStation(acc, x, z) {   // Tripoint Station: three metro lines met under the square; sealed by the Accords in 1962
  const w = 3.0, d = 4.2;
  ground(acc, 'concrete', x - w / 2, z - d / 2, x + w / 2, z + d / 2, 0.06, 2);
  for (const [ax, az, bx, bz] of [[x - w / 2, z + d / 2, x + w / 2, z + d / 2], [x + w / 2, z - d / 2, x - w / 2, z - d / 2], [x + w / 2, z + d / 2, x + w / 2, z - d / 2], [x - w / 2, z - d / 2, x - w / 2, z + d / 2]]) {
    const len = Math.hypot(bx - ax, bz - az), n = Math.round(len / 0.5);
    for (let k = 0; k <= n; k++) { const px = ax + (bx - ax) * k / n, pz = az + (bz - az) * k / n; sbox(acc, 'iron', px, 0, pz, 0.05, 0.05, 1.0, 0, { u: 1, v: 1, top: false }); }
    const nx = -(bz - az) / len, nz = (bx - ax) / len;
    aq(acc, 'gilt', [ax, 1.04, az], [bx, 1.04, bz], [bx, 0.96, bz], [ax, 0.96, az], [0, 0, len, 1], [nx, 0, nz], 4);
    aq(acc, 'gilt', [bx, 1.04, bz], [ax, 1.04, az], [ax, 0.96, az], [bx, 0.96, bz], [0, 0, len, 1], [-nx, 0, -nz], 4);
  }
  // the iron arch with the enamel sign, on the side facing the Threeway
  for (const s of [-1, 1]) sbox(acc, 'iron', x + s * 1.3, 0, z - d / 2, 0.1, 0.1, 2.9, 0, { u: 1, v: 1 });
  sbox(acc, 'iron', x, 2.9, z - d / 2, 2.8, 0.1, 0.12, 0, { u: 1, v: 1 });
  plate(acc, 'station', x, 2.45, z - d / 2, 2.6, 0.86, Math.PI, 0.06, [0, 0, 1, 1], true);
  WORLD_BOXES.push([x - w / 2, 0, z - d / 2, x + w / 2, 1.05, z + d / 2]);
  BLOCKERS.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
}
function barricade(acc, x, z, phi, len) {   // the other two old roads: closed with militia sawhorses
  for (let k = 0; k < 2; k++) {
    const [cx, cz] = LP(x, z, phi, 0, k * 0.6);
    sbox(acc, 'barricade', cx, 0.75, cz, len, 0.08, 0.3, phi, { u: 2, v: 0.3, top: false });
    for (const s of [-1, 1]) { const [lx, lz] = LP(cx, cz, phi, s * (len / 2 - 0.2), 0); sbox(acc, 'iron', lx, 0, lz, 0.08, 0.5, 0.78, phi, { u: 1, v: 1 }); }
  }
  const [px, pz] = LP(x, z, phi, 0, -0.05);
  plate(acc, 'closed', px, 1.3, pz, 1.5, 0.5, phi, 0, [0, 0, 1, 1], true);
}
function checkpoint(acc, z) {   // the joint city militia: shields and batons, no badges from any one power
  const bx = 2.9, bz = z + 0.4;
  sbox(acc, 'booth', bx, 0, bz, 2.0, 2.2, 2.7, 0, { u: 2.0, v: 2.7, top: 'concrete', faceKey: { b: 'booth', l: 'booth' } });
  sbox(acc, 'concrete', bx, 2.7, bz, 2.4, 2.6, 0.2, 0, { u: 2, v: 1 });
  plate(acc, 'militiaSign', 0, 4.4, z - 0.6, 4.0, 1.0, Math.PI, 0, [0, 0, 1, 1], true);
  for (const s of [-1, 1]) sbox(acc, 'iron', s * 2.1, 0, z - 0.6, 0.12, 0.12, 4.9, 0, { u: 1, v: 1 });
  // the boom across the road and its counterweight post
  sbox(acc, 'iron', 1.7, 0, z, 0.3, 0.3, 1.1, 0, { u: 1, v: 1 });
  plate(acc, 'halt', -2.0, 1.3, z, 0.84, 0.36, Math.PI, 0.08, [0, 0, 1, 1], true);
  // sandbags and concrete either side, flags of the Free City and the three powers
  for (const s of [-1, 1]) sbox(acc, 'sandbag', s * 4.0, 0, z + 1.2, 1.2, 1.2, 1.0, 0, { u: 1.2, v: 0.6, top: 'sandbag', tu: 1.2 });
  for (const [fx, k] of [[-3.8, 'flag_kras'], [-2.6, 'flag_vost'], [4.2, 'flag_colu'], [5.2, 'flag_hino']]) {
    sbox(acc, 'iron', fx, 0, z + 1.6, 0.06, 0.06, 3.6, 0, { u: 1, v: 1 });
    plate(acc, k, fx + 0.45, 3.2, z + 1.6, 0.9, 0.6, 0, 0, [0, 0, 1, 1], true);
  }
  // floodlight mast
  sbox(acc, 'iron', 4.6, 0, z - 0.4, 0.16, 0.16, 6.2, 0, { u: 1, v: 1 });
  sbox(acc, 'flood', 4.3, 6.0, z - 0.6, 0.6, 0.3, 0.4, 0.5, { u: 0.6, v: 0.4 });
  ST.lamps.push(lightFromHex([3.6, 5.6, z - 1.4], CFG.street.light.flood, CFG.street.light.floodRadius, CFG.street.light.floodK));
  ST.lamps.push(lightFromHex([bx - 1.1, 2.0, bz], '#cfe6ff', 4.5, 0.8));
  WORLD_BOXES.push([bx - 1.0, 0, bz - 1.1, bx + 1.0, 2.7, bz + 1.1], [-4.4, 0.85, z - 0.07, 1.7, 1.06, z + 0.07]);
  BLOCKERS.push({ x0: bx - 1.0, x1: bx + 1.0, z0: bz - 1.1, z1: bz + 1.1 });
}
// the Ring Road beyond the checkpoint, and the Accords wall starting down the middle of the old road (the Krasnovian
// gate and Superblock 14 on the -x side are in src/superblock/build.js)
function ringRoad(acc, z) {
  ground(acc, 'cobble', -40, z + 2, 40, z + 16, 0.0, 2);
  for (let k = 0; k < 16; k++) { const wz = z + 16 + k * 5; sbox(acc, 'concrete', 0, 0, wz + 2.5, 0.6, 5, 4.2, 0, { u: 2, v: 2, top: 'wallTop', tu: 1 }); }
  sbox(acc, 'concrete', 0, 0, z + 54, 3.2, 3.2, 9, 0, { u: 2, v: 2, top: 'concrete' });   // watchtower
  sbox(acc, 'booth', 0, 9, z + 54, 4, 4, 2.4, 0, { u: 4, v: 2.4, top: 'concrete' });
  ST.lamps.push(lightFromHex([0, 11.5, z + 54], CFG.street.light.flood, 16, 0.9));
  // the first blocks of the sectors: Columbian brownstones (+x), Krasnovian slabs (-x)
  for (let k = 0; k < 5; k++) {
    acc.tint = [0.72 + (k % 3) * 0.06, 0.44, 0.36];
    sbox(acc, 'tenementPlain', 9 + k * 7.2, 0, z + 24, 7, 10, 9 + (k % 2) * 3.2, 0, { u: 9.6, v: 6.4, top: 'slate', cell: 4 });
    acc.tint = [1, 1, 1];
    if (k < 2) sbox(acc, 'panel', -58 - k * 13, 0, z + 30 + (k % 2) * 6, 12, 10, 12 + (k % 3) * 3, 0, { u: 12, v: 12, top: 'roofDark', cell: 6 });   // west of Superblock 14
  }
  ST.lamps.push(lightFromHex([-10, 6, z + 10], CFG.street.light.sodium, 14, 1.2));
  ST.lamps.push(lightFromHex([10, 6, z + 10], CFG.street.light.amber, 14, 1.0));
  for (const [lx, c] of [[-10, 'litSodium'], [10, 'litWarm']]) { sbox(acc, 'iron', lx, 0, z + 10, 0.2, 0.2, 6, 0, { u: 1, v: 1 }); sbox(acc, c, lx, 6, z + 10, 0.8, 0.3, 0.2, 0, { u: 1, v: 1 }); }
}
function buildStreetGeometry() {
  const acc = ST.lit, Z = STREET.fz, SX = STREET.sq.x, SZ = STREET.sq.z1, RX = STREET.road.x, RZ = STREET.road.z1, W = STREET.west, E = STREET.east;
  // ---- ground: setts in the square, cobbles and pavements down the road, a brass line down the middle
  ground(acc, 'setts', -SX, Z, SX, SZ, 0, 2);
  ground(acc, 'cobble', -RX + 1.6, SZ, RX - 1.6, RZ + 1, 0, 2);
  for (const s of [-1, 1]) {
    ground(acc, 'flags', s > 0 ? RX - 1.6 : -RX, SZ, s > 0 ? RX : -RX + 1.6, RZ + 1, 0, 1.6);
    const cx = s * (RX - 1.6);
    aq(acc, 'curb', [cx, 0.01, SZ], [cx, 0.01, RZ + 1], [cx + s * 0.18, 0.01, RZ + 1], [cx + s * 0.18, 0.01, SZ], [0, 0, (RZ + 1 - SZ) / 2, 1], [0, 1, 0], 2);
  }
  ground(acc, 'cobble', W.x1, W.z0, -SX, W.z1, 0, 2); ground(acc, 'cobble', SX, E.z0, E.x1, E.z1, 0, 2);
  // past the barricades the old roads carry on, gaslit, into the city (the far grid leaves them a street at z 10.5..18.5)
  ground(acc, 'cobble', W.x1 - 46, 10.6, W.x1, 18.4, 0, 2); ground(acc, 'cobble', E.x1, 10.6, E.x1 + 46, 18.4, 0, 2);
  for (let k = 0; k < 5; k++) { gasLamp(acc, W.x1 + 2 - k * 11, k % 2 ? 11.2 : 17.8); gasLamp(acc, E.x1 - 2 + k * 11, k % 2 ? 11.2 : 17.8); }
  // three brass lines in the cobbles, meeting at the Threeway's door: the Accords borders
  const line = (pts) => { for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L * 0.07, nz = (bx - ax) / L * 0.07; aq(acc, 'brassLine', [ax + nx, 0.015, az + nz], [bx + nx, 0.015, bz + nz], [bx - nx, 0.015, bz - nz], [ax - nx, 0.015, az - nz], [0, 0, L / 0.5, 1], [0, 1, 0], 2); } };
  line([[0, Z + 0.02], [0, RZ + 1.2]]);
  line([[0, Z + 0.02], [-SX, (W.z0 + W.z1) / 2], [W.x1, (W.z0 + W.z1) / 2]]);
  line([[0, Z + 0.02], [SX, (E.z0 + E.z1) / 2], [E.x1, (E.z0 + E.z1) / 2]]);
  // ---- the Threeway and its neighbours on the north side of the square
  buildThreewayFront(acc);
  const B = [
    { x0: 5.32, x1: 9.6, z0: -6, z1: Z, floors: 2, roof: 'copper', tint: 2, painted: true, shops: 'shops', faces: 's' },
    { x0: 9.6, x1: 21, z0: -6, z1: Z, floors: 2, roof: 'mansard', tint: 4, faces: 's', seed: 1 },
    { x0: -9.8, x1: -5.32, z0: -6, z1: Z, floors: 2, roof: 'tile', tint: 1, painted: true, faces: 's', seed: 2 },
    { x0: -21, x1: -9.8, z0: -6, z1: Z, floors: 3, roof: 'mansard', tint: 0, faces: 's', seed: 3 },
    // east side of the square, either side of the east road
    { x0: SX, x1: 22, z0: Z, z1: E.z0, floors: 2, roof: 'mansard', tint: 4, faces: 'ws', seed: 4 },
    { x0: SX, x1: 22, z0: E.z1, z1: SZ, floors: 3, roof: 'copper', tint: 3, painted: true, shops: 'shops', faces: 'wn', onion: [SX + 1.3, SZ - 1.3], seed: 5 },
    { x0: 22, x1: E.x1 + 2, z0: 2, z1: E.z0, floors: 3, roof: 'mansard', tint: 6, faces: 's', seed: 6, blocker: false },
    { x0: 22, x1: E.x1 + 2, z0: E.z1, z1: 26, floors: 2, roof: 'copper', tint: 5, faces: 'n', seed: 7, blocker: false },
    // west side
    { x0: -22, x1: -SX, z0: Z, z1: W.z0, floors: 3, roof: 'copper', tint: 5, faces: 'es', seed: 8 },
    { x0: -22, x1: -SX, z0: W.z1, z1: SZ, floors: 2, roof: 'tile', tint: 2, painted: true, shops: 'shops', faces: 'en', seed: 9 },
    { x0: W.x1 - 2, x1: -22, z0: 2, z1: W.z0, floors: 2, roof: 'mansard', tint: 1, faces: 's', seed: 10, blocker: false },
    { x0: W.x1 - 2, x1: -22, z0: W.z1, z1: 26, floors: 3, roof: 'mansard', tint: 0, painted: true, faces: 'n', seed: 11, blocker: false },
    // the south side of the square: the road's two corner buildings
    { x0: RX, x1: SX, z0: SZ, z1: 31, floors: 3, roof: 'mansard', tint: 0, painted: true, shops: 'shops', faces: 'nw', bay: [RX - 0.4, 27, -Math.PI / 2], seed: 12 },
    { x0: SX, x1: 22, z0: SZ, z1: 31, floors: 2, roof: 'mansard', tint: 1, faces: 'n', seed: 13 },
    { x0: -SX, x1: -RX, z0: SZ, z1: 30, floors: 2, roof: 'tile', tint: 6, painted: true, faces: 'ne', seed: 14 },
    { x0: -22, x1: -SX, z0: SZ, z1: 30, floors: 3, roof: 'copper', tint: 4, faces: 'n', seed: 15 },
    // down the road
    { x0: RX, x1: 13, z0: 31, z1: 38, floors: 2, roof: 'copper', tint: 2, faces: 'w', seed: 16 },
    { x0: RX, x1: 13, z0: 38, z1: 43, floors: 3, roof: 'mansard', tint: 5, faces: 'w', seed: 17 },
    { x0: RX + 1.4, x1: 13, z0: 43, z1: 45, floors: 1, roof: 'flat', tint: 4, faces: 'w', seed: 18 },
    { x0: RX, x1: 13, z0: 45, z1: 51, floors: 3, roof: 'tile', tint: 3, painted: true, faces: 'w', seed: 19 },
    { x0: RX, x1: 13, z0: 51, z1: RZ, floors: 2, roof: 'mansard', tint: 0, faces: 'ws', seed: 20 },
    { x0: -13, x1: -RX, z0: 30, z1: 36, floors: 3, roof: 'mansard', tint: 1, painted: true, shops: 'shops', faces: 'e', seed: 21 },
    { x0: -13, x1: -RX, z0: 36, z1: 41, floors: 2, roof: 'copper', tint: 6, faces: 'e', seed: 22 },
    { x0: -13, x1: -RX - 1.4, z0: 41, z1: 43, floors: 1, roof: 'flat', tint: 4, faces: 'e', seed: 23 },
    { x0: -13, x1: -RX, z0: 43, z1: 49, floors: 3, roof: 'copper', tint: 0, faces: 'e', onion: [-RX - 1.3, 47.7], seed: 24 },
    { x0: -13, x1: -RX, z0: 49, z1: RZ, floors: 2, roof: 'mansard', tint: 5, painted: true, faces: 'es', seed: 25 },
  ];
  for (const b of B) tenement(acc, b);
  wallLamp(acc, -RX, 3.4, 29, Math.PI / 2); bracket(acc, -RX, 3.4, 29, Math.PI / 2);
  // St. Vost Cathedral's onion domes over the west roofs (1740s, Krasnovian craftsmen)
  acc.tint = [0.9, 0.86, 0.76];
  sbox(acc, 'stone', -30, 0, -15, 16, 10, 15, 0, { u: 4, v: 4, top: 'slate' });
  cyl(acc, 'stone', -30, 15, -15, 4.2, 4.2, 3, 10, { u: 4, v: 4 }); acc.tint = [1, 1, 1];
  onion(acc, -30, 18, -15, 5.6, 9, 10);
  for (const [ox, oz] of [[-22.5, -12], [-37.5, -18]]) { acc.tint = [0.9, 0.86, 0.76]; cyl(acc, 'stone', ox, 0, oz, 1.6, 1.6, 19, 8, { u: 4, v: 4 }); acc.tint = [1, 1, 1]; onion(acc, ox, 19, oz, 2.0, 4.4); }
  // landmarks in the square
  brassClock(acc, ...STREET.clock);
  sealedStation(acc, ...STREET.station);
  // gaslight
  for (const [x, z] of [[-10.6, 8.2], [10.6, 8.6], [-10.6, 20.4], [10.6, 20.2], [3.9, 26.5], [-3.9, 33.5], [3.9, 40.5], [-3.9, 47.5], [3.9, 53.2]]) gasLamp(acc, x, z);
  wallLamp(acc, -17, 3.6, W.z0, 0); wallLamp(acc, 17, 3.6, E.z1, Math.PI);
  // the other two old roads: barricaded, glowing with whichever sector lies down them
  barricade(acc, W.x1 + 15, (W.z0 + W.z1) / 2, Math.PI / 2, W.z1 - W.z0);
  barricade(acc, E.x1 - 15, (E.z0 + E.z1) / 2, -Math.PI / 2, E.z1 - E.z0);
  ST.lamps.push(lightFromHex([W.x1 + 6, 5, (W.z0 + W.z1) / 2], CFG.street.light.hinoGlow, 14, 1.0));
  ST.lamps.push(lightFromHex([E.x1 - 6, 5, (E.z0 + E.z1) / 2], CFG.street.light.amber, 14, 0.9));
  // alley gates down the road (dark, iron)
  for (const [x, z0, z1] of [[RX + 0.05, 43, 45], [-RX - 0.05, 41, 43]]) {
    const n = 8; for (let k = 0; k <= n; k++) sbox(acc, 'iron', x, 0, z0 + (z1 - z0) * k / n, 0.05, 0.05, 2.6, 0, { u: 1, v: 1, top: false });
    sbox(acc, 'iron', x, 2.5, (z0 + z1) / 2, 0.08, z1 - z0, 0.08, 0, { u: 1, v: 1 });
    ground(acc, 'black', Math.min(x, x + Math.sign(x) * 8), z0, Math.max(x, x + Math.sign(x) * 8), z1, 0.005, 2);
  }
  // posters and street-name plates
  for (const [x, z, phi] of [[RX - 0.02, 34, -Math.PI / 2], [-RX + 0.02, 38.5, Math.PI / 2], [-SX + 0.02, 9, Math.PI / 2], [SX - 0.02, 19, -Math.PI / 2], [RX - 0.02, 48, -Math.PI / 2]]) plate(acc, 'poster', x, 1.6, z, 0.8, 1.2, phi, 0.02);
  plate(acc, 'enamel', -RX + 0.02, 3.2, SZ + 1.2, 1.4, 0.35, Math.PI / 2, 0.03);
  checkpoint(acc, STREET.chk.z);
  ringRoad(acc, STREET.chk.z);
}
