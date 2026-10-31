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
// the underside of a roof that overhangs its walls: without it you look up through the back of the roof into the sky
function soffit(acc, key, cx, y, cz, w, d, phi) {
  const P = (lx, lz) => { const [x, z] = LP(cx, cz, phi, lx, lz); return [x, y, z]; };
  aq(acc, key, P(-w / 2, d / 2), P(w / 2, d / 2), P(w / 2, -d / 2), P(-w / 2, -d / 2), [0, 0, 1, 1], [0, -1, 0], 99);
}
function tileRoof(acc, cx, y, cz, w, d, phi, h = 2.2, over = 0.7) {   // Hinomoto tile roof: upturned tips, red brackets
  frustum(acc, 'kawara', cx, y, cz, w + over * 2, d + over * 2, w * 0.4, d * 0.15, h, phi, { u: 3.2, v: 3.2, top: 'kawara', tu: 3.2, cell: 3 });
  soffit(acc, 'darkwood', cx, y - 0.01, cz, w + over * 2, d + over * 2, phi);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const [tx, tz] = LP(cx, cz, phi, sx * (w / 2 + over + 0.1), sz * (d / 2 + over + 0.1)); sbox(acc, 'kawara', tx, y - 0.05, tz, 0.35, 0.35, 0.4, phi, { u: 1.6, v: 1.6 }); }
  for (let k = 0; k < Math.max(2, Math.round(w / 2.4)); k++) { const sx = -w / 2 + 0.6 + k * (w - 1.2) / Math.max(1, Math.round(w / 2.4) - 1); const [bx, bz] = LP(cx, cz, phi, sx, d / 2 + 0.3); sbox(acc, 'lacquer', bx, y - 0.55, bz, 0.18, 0.6, 0.55, phi, { u: 1, v: 1 }); }
}
// a projecting moulding along a facade run (left to right seen from outside): a front face `out` m proud and a dark
// underside; ext = how far to run on past each end (to close an outside corner with the next face's ledge)
function ledge(acc, key, ax, az, bx, bz, y, h, out, um, ext = [0, 0]) {
  const len = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / len, dz = (bz - az) / len, nx = -dz, nz = dx;
  const a = [ax - dx * ext[0], az - dz * ext[0]], b = [bx + dx * ext[1], bz + dz * ext[1]], L = len + ext[0] + ext[1];
  const a1 = [a[0] + nx * out, a[1] + nz * out], b1 = [b[0] + nx * out, b[1] + nz * out];
  aq(acc, key, [a1[0], y + h, a1[1]], [b1[0], y + h, b1[1]], [b1[0], y, b1[1]], [a1[0], y, a1[1]], [0, 0, L / um, 1], [nx, 0, nz], 99);
  aq(acc, 'roofDark', [a1[0], y, a1[1]], [b1[0], y, b1[1]], [b[0], y, b[1]], [a[0], y, a[1]], [0, 0, 1, 1], [0, -1, 0], 99);
}
// where a facade's window sits (the tenement paintings: 4 bays a repeat, 2 floors of 3.2 m from the top down):
// face f of building b, bay i from the left, floor k from the top -> [x, y, z, phi, window w, window h]
function winAt(b, f, i, k) {
  const { x0, x1, z0, z1 } = b, F = { s: [x0, z1, x1, z1], n: [x1, z0, x0, z0], e: [x1, z1, x1, z0], w: [x0, z0, x0, z1] }[f];
  const top = 4.0 + (b.floors || 3) * 3.2, len = Math.hypot(F[2] - F[0], F[3] - F[1]), bays = Math.max(1, Math.round(len / 2.6)), t = (i + 0.5) / bays;
  const nx = -(F[3] - F[1]) / len, nz = (F[2] - F[0]) / len, painted = !!b.painted;
  return [F[0] + (F[2] - F[0]) * t, top - k * 3.2 - (painted ? 1.8 : 1.5), F[1] + (F[3] - F[1]) * t, Math.atan2(nx, nz), len / bays * 0.375, painted ? 1.6 : 1.8];
}
// an Old Quarter tenement: shopfront, plaster floors, a roof. Footprint [x0,x1] x [z0,z1]; which faces show is up to the caller.
// The shell goes into acc (always drawn); the close detail (cornices, friezes, balconies, dormers, life in the windows)
// into nd, the street's near mesh.
const PLASTER = [[0.92, 0.84, 0.66], [0.78, 0.62, 0.74], [0.66, 0.78, 0.7], [0.9, 0.62, 0.5], [0.86, 0.84, 0.78], [0.84, 0.72, 0.52], [0.62, 0.74, 0.8]];
function tenement(acc, b, nd = acc) {
  const { x0, x1, z0, z1 } = b, floors = b.floors || 3, shopH = 4.0, fh = 3.2, top = shopH + floors * fh;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
  const col = b.col || PLASTER[b.tint || 0];
  acc.tint = col;
  const shopKey = b.shops || 'shopsPlain', upKey = b.painted ? 'tenement' : 'tenementPlain';
  // faces: [x0,z0]→ etc. run left-to-right seen from outside
  const F = { s: [x0, z1, x1, z1], n: [x1, z0, x0, z0], e: [x1, z1, x1, z0], w: [x0, z0, x0, z1] };
  const faces = b.faces || 'nsew', corner = (x, z, f) => [...faces].some(g => g !== f && ((F[g][0] === x && F[g][1] === z) || (F[g][2] === x && F[g][3] === z)));
  for (const f of faces) {
    const [ax, az, bx, bz] = F[f], len = Math.hypot(bx - ax, bz - az), bays = Math.max(1, Math.round(len / 2.6));
    acc.tint = [col[0] * 0.55 + 0.25, col[1] * 0.55 + 0.25, col[2] * 0.55 + 0.25];
    wall(acc, shopKey, ax, az, bx, bz, 0, shopH, len / bays * 4, shopH, { u0: (b.seed || 0) * 0.25 });
    acc.tint = col;
    wall(acc, upKey, ax, az, bx, bz, shopH, top, len / bays * 4, fh * 2, { u0: (b.seed || 0) * 0.25 });
    acc.tint = [1, 1, 1];
    // a gilt cornice between the shops and the flats (brass city)
    const n = [-(bz - az) / len, (bx - ax) / len];
    aq(acc, 'gilt', [ax + n[0] * 0.08, shopH + 0.12, az + n[1] * 0.08], [bx + n[0] * 0.08, shopH + 0.12, bz + n[1] * 0.08], [bx + n[0] * 0.08, shopH - 0.02, bz + n[1] * 0.08], [ax + n[0] * 0.08, shopH - 0.02, az + n[1] * 0.08], [0, 0, len / 2, 1], [n[0], 0, n[1]], 4);
    // Secession detail: the crowning cornice on its dentils, a garland frieze under it, a string course over the first floor
    const ext = [corner(ax, az, f) ? 0.34 : 0, corner(bx, bz, f) ? 0.34 : 0];
    nd.tint = col; ledge(nd, 'stCornice', ax, az, bx, bz, top - 0.42, 0.42, 0.34, 2.2, ext);
    if (b.painted || floors > 2) aq(nd, 'stFrieze', [ax + n[0] * 0.03, top - 0.46, az + n[1] * 0.03], [bx + n[0] * 0.03, top - 0.46, bz + n[1] * 0.03], [bx + n[0] * 0.03, top - 0.98, bz + n[1] * 0.03], [ax + n[0] * 0.03, top - 0.98, az + n[1] * 0.03], [0, 0, len / 4, 1], [n[0], 0, n[1]], 99);
    ledge(nd, 'stCornice', ax, az, bx, bz, shopH + fh - 0.06, 0.16, 0.12, 2.2, ext.map(e => e ? 0.12 : 0));
    nd.tint = [1, 1, 1];
  }
  acc.tint = [1, 1, 1];
  if (b.roof === 'tile') tileRoof(acc, cx, top, cz, w, d, 0, 2.4, 0.6);
  else if (b.roof === 'flat') ground(acc, 'slate', x0, z0, x1, z1, top, 4);
  else {
    const rk = b.roof === 'copper' ? 'copper' : 'mansard', inset = Math.min(1.6, Math.min(w, d) * 0.3);
    frustum(acc, rk, cx, top, cz, w + 0.3, d + 0.3, w - inset * 2, d - inset * 2, 3.0, 0, { u: 4.4, v: 3.0, top: rk === 'copper' ? 'copperTop' : 'slate', tu: 3, skip: b.roofSkip });
    soffit(acc, 'slate', cx, top - 0.01, cz, w + 0.3, d + 0.3, 0);
    sbox(acc, 'gilt', cx, top - 0.1, cz, w + 0.36, d + 0.36, 0.14, 0, { u: 2, v: 1, top: false });
    // dormers on the mansard's slope over the square, a lit window in each and a little copper roof
    for (const [f, i, lit] of b.dormers || []) {
      const [wx, , wz, phi, ww] = winAt(b, f, i, 0), [ox, oz] = LP(wx, wz, phi, 0, -0.55);
      sbox(nd, rk === 'copper' ? 'stIronGreen' : 'slate', ox, top + 0.2, oz, 1.1, 1.0, 1.25, phi, { u: 1, v: 1, top: false, skip: ['b'] });
      plate(nd, 'stWindows', ox, top + 0.85, oz, 0.62, 0.9, phi, 0.51, [lit / 3, 0, (lit + 1) / 3, 1]);
      frustum(nd, 'copper', ox, top + 1.45, oz, 1.3, 1.2, 0.08, 1.2, 0.5, phi, { u: 1.4, v: 0.6, top: false, skip: ['b'] });
    }
  }
  if (b.onion) {   // a Krasnovian onion-domed corner turret
    const [ox, oz] = b.onion; acc.tint = col;
    cyl(acc, upKey, ox, 0, oz, 1.3, 1.3, top + 1.2, 8, { u: 4, v: 6.4 }); acc.tint = [1, 1, 1];
    onion(acc, ox, top + 1.2, oz, 1.7, 3.6, 8);
  }
  if (b.bay) {   // a Columbian cast-iron oriel: on a corbel, glazed, under a copper helmet
    const [bx, bz, phi] = b.bay, h = fh * floors - 0.6;
    sbox(acc, 'shops', bx, shopH + 0.2, bz, 2.4, 0.8, h, phi, { u: 9.6, v: 4, top: false });
    frustum(nd, 'stIronGreen', bx, shopH - 0.3, bz, 0.6, 0.3, 2.4, 0.8, 0.5, phi, { u: 1, v: 1, top: false });
    frustum(nd, 'copper', bx, shopH + 0.2 + h, bz, 2.6, 1.0, 0.2, 0.2, 1.2, phi, { u: 2.2, v: 1.2, top: false });
    sbox(nd, 'gilt', bx, shopH + 0.15 + h, bz, 2.5, 0.9, 0.1, phi, { u: 1, v: 1, top: false });
    cyl(nd, 'gilt', bx, shopH + 1.4 + h, bz, 0.05, 0.01, 0.6, 4, { u: 1, v: 1 });
  }
  // balconies (wrought iron on a stone slab) and life in the windows: someone looking out, a TV's blue, a radio's glow
  for (const [f, i, k] of b.balc || []) {
    const [wx, wy, wz, phi] = winAt(b, f, i, k), floorY = top - (k + 1) * fh, [ox, oz] = LP(wx, wz, phi, 0, 0.36);
    sbox(nd, 'stone', ox, floorY - 0.1, oz, 1.7, 0.72, 0.14, phi, { u: 1, v: 1 });
    plate(nd, 'stBalcony', ox, floorY + 0.5, oz, 1.66, 0.9, phi, 0.35, [0, 0, 2, 1], true);
    for (const s of [-1, 1]) { const [sx, sz] = LP(ox, oz, phi, s * 0.83, 0); plate(nd, 'stBalcony', sx, floorY + 0.5, sz, 0.7, 0.9, phi + Math.PI / 2, 0, [0, 0, 1, 1], true); }
  }
  for (const [f, i, k, kind] of b.life || []) { const [wx, wy, wz, phi, ww, wh] = winAt(b, f, i, k); plate(nd, 'stWindows', wx, wy, wz, ww, wh, phi, 0.025, [kind / 3, 0, (kind + 1) / 3, 1]); }
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


// ---- the Threeway's front: the hero shopfront of the square
function buildThreewayFront(acc, nd) {
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
  // upper floor: ochre plaster, Krasnovian painted surrounds, a cornice on dentils
  acc.tint = [0.92, 0.78, 0.55];
  wall(acc, 'tenement', -X, Z, X, Z, H0, top, 10.4, 6.4);
  nd.tint = [0.92, 0.78, 0.55]; ledge(nd, 'stCornice', -X, Z, X, Z, top - 0.4, 0.4, 0.3, 2.2); nd.tint = [1, 1, 1];
  acc.tint = [1, 1, 1];
  tileRoof(acc, 0, top, (Z - 5.4) / 2, X * 2, Z + 5.4, 0, 2.8, 0.8);
  // Tripoint Day: all three flags over the door, hung as long banners between the upper windows, lit from below
  for (const [sx, k] of [[-2.66, 'flag_hino'], [0, 'flag_kras'], [2.66, 'flag_colu']]) {
    const x0 = sx - 0.56, x1 = sx + 0.56, y0 = 4.45, y1 = 7.0, z = Z + 0.16;   // the flag turned a quarter: its hoist along the top
    aq(acc, k, [x1, y1, z], [x1, y0, z], [x0, y0, z], [x0, y1, z], [0, 0, 1, 1], [0, 0, 1], 99);
    sbox(nd, 'gilt', sx, y1, Z + 0.1, 1.26, 0.12, 0.05, 0, { u: 1, v: 1 });
    sbox(nd, 'iron', sx, y1 + 0.05, Z + 0.06, 0.04, 0.2, 0.25, 0, { u: 1, v: 1 });
  }
  ST.lamps.push(lightFromHex([0, 4.4, Z + 1.4], '#ffe0b8', 4.6, 0.9));
  // a fanlight over the door, a brass plate beside it (three names in three scripts), the corner blade sign
  plate(nd, 'stTransom', 0, 2.72, Z, 1.1, 0.5, 0, 0.02);
  plate(nd, 'stPlaque', 1.36, 1.62, Z, 0.68, 0.24, 0, 0.03);
  for (const y of [5.1, 6.4]) sbox(nd, 'iron', 4.92, y, Z + 0.4, 0.05, 0.8, 0.05, 0, { u: 1, v: 1 });
  plate(acc, 'stBladeBar', 4.92, 5.75, Z + 0.56, 0.62, 2.0, Math.PI / 2, 0, [0, 0, 1, 1], true);
  // pink neon tubes round the shopfront: along the fascia and down both ends (the bar's own colour, the brightest thing on the square)
  aq(acc, 'litMagenta', [-X, 4.2, Z + 0.17], [X, 4.2, Z + 0.17], [X, 4.14, Z + 0.17], [-X, 4.14, Z + 0.17], [0, 0, 1, 1], [0, 0, 1], 99);
  for (const sx of [-X + 0.1, X - 0.1]) aq(acc, 'litMagenta', [sx - 0.03, 4.14, Z + 0.17], [sx + 0.03, 4.14, Z + 0.17], [sx + 0.03, 0.3, Z + 0.17], [sx - 0.03, 0.3, Z + 0.17], [0, 0, 1, 1], [0, 0, 1], 99);
  ST.lamps.push(lightFromHex([-X + 0.4, 2, Z + 0.8], '#ff4f9a', 3.4, 0.6)); ST.lamps.push(lightFromHex([X - 0.4, 2, Z + 0.8], '#ff4f9a', 3.4, 0.6));
  ST.lamps.push(lightFromHex([4.92, 5.75, Z + 0.9], '#ff4f9a', 3.5, 0.6));
  // the owner's flat over the bar: someone at the window, watching the square
  plate(nd, 'stWindows', 3.99, 5.6, Z, 1.0, 1.6, 0, 0.02, [0, 0, 1 / 3, 1]);
  wallLamp(acc, -1.7, 2.7, Z, 0); wallLamp(acc, 1.7, 2.7, Z, 0);
  bracket(acc, -1.7, 2.7, Z, 0); bracket(acc, 1.7, 2.7, Z, 0);
}
// ---- the Brass Clock (1888): Columbian railway money, Vostburger founders, a Hinomoto carpenter's roof. A cast-iron
// column on a stone plinth, four gas lanterns on scrolled arms, a drum with four lit faces under a tile hat and an onion.
function brassClock(acc, nd, x, z) {
  sbox(acc, 'stone', x, 0, z, 1.5, 1.5, 0.35, 0, { u: 1.2, v: 1.2 });
  sbox(acc, 'stone', x, 0.35, z, 1.1, 1.1, 0.55, 0, { u: 1.2, v: 1.2 });
  for (let a = 0; a < 4; a++) plate(nd, 'stPlaque1888', x, 0.62, z, 0.62, 0.2, a * Math.PI / 2, 0.56);
  cyl(acc, 'stIronGreen', x, 0.9, z, 0.3, 0.2, 0.5, 8, { u: 1, v: 1 });
  cyl(acc, 'stIronGreen', x, 1.4, z, 0.16, 0.16, 2.9, 8, { u: 1, v: 1 });
  for (const y of [1.4, 2.6, 4.15]) cyl(nd, 'gilt', x, y, z, 0.24, 0.24, 0.12, 8, { u: 1, v: 1 });
  // four lantern arms at 3.3 m, a gas lantern on each
  for (let a = 0; a < 4; a++) {
    const t = a * Math.PI / 2 + Math.PI / 4, lx = x + Math.cos(t) * 0.78, lz = z + Math.sin(t) * 0.78;
    sbox(nd, 'iron', x + Math.cos(t) * 0.4, 3.24, z + Math.sin(t) * 0.4, 0.8, 0.06, 0.06, -t, { u: 1, v: 1 });
    sbox(nd, 'iron', x + Math.cos(t) * 0.55, 2.9, z + Math.sin(t) * 0.55, 0.05, 0.05, 0.36, 0, { u: 1, v: 1 });
    frustum(acc, 'gaslamp', lx, 3.0, lz, 0.22, 0.22, 0.32, 0.32, 0.42, 0, { u: 0.3, v: 0.42, top: false });
    frustum(nd, 'iron', lx, 3.42, lz, 0.38, 0.38, 0.04, 0.04, 0.22, 0, { u: 1, v: 1 });
  }
  ST.lamps.push(lightFromHex([x, 3.2, z], CFG.street.light.gas, CFG.street.light.gasRadius * 1.15, CFG.street.light.gasK * 1.2));
  // the drum and its four faces
  sbox(acc, 'stIronGreen', x, 4.3, z, 1.3, 1.3, 1.36, 0, { u: 1, v: 1 });
  for (let a = 0; a < 4; a++) plate(acc, 'stClockFace', x, 4.98, z, 1.08, 1.08, a * Math.PI / 2, 0.66);
  sbox(nd, 'gilt', x, 4.24, z, 1.42, 1.42, 0.1, 0, { u: 1, v: 1 });
  sbox(acc, 'gilt', x, 5.66, z, 1.5, 1.5, 0.12, 0, { u: 1, v: 1 });
  frustum(acc, 'kawara', x, 5.78, z, 2.1, 2.1, 0.34, 0.34, 0.8, 0, { u: 1.6, v: 1.6 });
  soffit(acc, 'darkwood', x, 5.77, z, 2.1, 2.1, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) sbox(nd, 'kawara', x + sx * 1.05, 5.72, z + sz * 1.05, 0.22, 0.22, 0.26, 0, { u: 1, v: 1 });
  onion(acc, x, 6.56, z, 0.42, 1.1, 6, 'stOnionGold');
  WORLD_BOXES.push([x - 0.75, 0, z - 0.75, x + 0.75, 0.9, z + 0.75], [x - 0.3, 0.9, z - 0.3, x + 0.3, 4.3, z + 0.3]);
  BLOCKERS.push({ x0: x - 0.75, x1: x + 0.75, z0: z - 0.75, z1: z + 0.75 });
  ST.lamps.push(lightFromHex([x, 4.98, z], '#f4ead0', 3.6, 0.55));
}
// ---- Tripoint Station: three metro lines met under the square, sealed by the Accords in 1962. A Secession pavilion
// (Wagner's Karlsplatz kind): white marble panels with gilt sunflowers in green iron, a glazed barrel roof, METRO over
// TRIPOINT, a glass canopy, and across the stairs a welded grille, chained, with the Accords' notice nailed to it.
function sealedStation(acc, nd, x, z) {
  const w = 3.0, d = 4.2, x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, H = 3.0, R = 1.15, E = STATION_WELL;
  // plinth and the marble walls, in green iron frames (front: an opening 2 m wide over the stairs)
  sbox(acc, 'stone', x, 0, z, w + 0.12, d + 0.12, 0.4, 0, { u: 1, v: 0.4, top: false });
  for (const [ax, az, bx, bz] of [[x1, z1, x1, z0], [x0, z1, x1, z1], [x0, z0, x0, z1], [x0, z0, x - 1.0, z0], [x + 1.0, z0, x1, z0]]) wall(acc, 'stMarble', ax, az, bx, bz, 0.4, H - 0.3, 1.05, 1.25);
  wall(acc, 'stIronGreen', x - 1.0, z0, x + 1.0, z0, 2.6, H - 0.3, 1, 1);
  acc.tint = [0.42, 0.4, 0.4];   // inside, in the dark
  for (const [ax, az, bx, bz] of [[x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0], [x - 1.0, z0, x0, z0], [x1, z0, x + 1.0, z0]]) wall(acc, 'stMarble', ax - Math.sign(bz - az) * 0.02, az + Math.sign(bx - ax) * 0.02, bx - Math.sign(bz - az) * 0.02, bz + Math.sign(bx - ax) * 0.02, 0, H - 0.3, 1.05, 1.25);
  soffit(acc, 'roofDark', x, H - 0.31, z, w, d, 0);
  acc.tint = [1, 1, 1];
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [x - 1.0, z0], [x + 1.0, z0], [x0, z], [x1, z]]) sbox(acc, 'stIronGreen', px, 0, pz, 0.16, 0.16, H, 0, { u: 1, v: 1 });
  for (const [px, pz] of [[x0, z0], [x1, z0], [x - 1.0, z0], [x + 1.0, z0]]) sbox(nd, 'gilt', px, H - 0.5, pz, 0.22, 0.22, 0.1, 0, { u: 1, v: 1 });
  sbox(acc, 'stIronGreen', x, H - 0.3, z, w + 0.24, d + 0.24, 0.36, 0, { u: 1, v: 1, top: false });
  sbox(nd, 'gilt', x, H - 0.32, z, w + 0.3, d + 0.3, 0.06, 0, { u: 1, v: 1, top: false });
  // the glazed barrel roof (along z) and its two lunettes; the front one carries METRO · TRIPOINT
  const N = 6, arc = (i) => { const t = Math.PI * i / N; return [x - Math.cos(t) * (w / 2 + 0.12), H + 0.06 + Math.sin(t) * R]; };
  for (let i = 0; i < N; i++) {
    const [ax, ay] = arc(i), [bx, by] = arc(i + 1), mx = (ax + bx) / 2 - x, my = (ay + by) / 2 - H;
    aq(acc, 'copperTop', [ax, ay, z0 - 0.12], [bx, by, z0 - 0.12], [bx, by, z1 + 0.12], [ax, ay, z1 + 0.12], [0, 0, 0.6, d / 1.4], [mx, my, 0], 99);
    if (i > 0) aq(nd, 'gilt', [ax, ay + 0.03, z0 - 0.14], [ax, ay + 0.03, z1 + 0.14], [ax + 0.06 * Math.sign(-mx || 1), ay + 0.03, z1 + 0.14], [ax + 0.06 * Math.sign(-mx || 1), ay + 0.03, z0 - 0.14], [0, 0, 1, 1], [mx, my, 0], 99);   // gilt ribs
    for (const [zz, nz] of [[z0 - 0.1, -1], [z1 + 0.1, 1]]) aq(acc, 'stMarble', [ax, ay, zz], [bx, by, zz], [x, H + 0.06, zz], [x, H + 0.06, zz], [0, 0, 0.6, 1], [0, 0, nz], 99);
  }
  cyl(nd, 'gilt', x, H + 0.06 + R, z0 - 0.12, 0.05, 0.02, 0.5, 4, { u: 1, v: 1 });
  sbox(acc, 'gilt', x, H + 0.04 + R, z, 0.1, d + 0.24, 0.06, 0, { u: 1, v: 1 });
  plate(acc, 'stStationSign', x, H + 0.42, z0 - 0.1, 2.5, 0.62, Math.PI, 0.03);
  // the glass canopy on two scrolled brackets
  sbox(nd, 'stCanopy', x, 2.66, z0 - 0.55, 2.5, 1.0, 0.06, 0, { u: 1, v: 1 });
  sbox(nd, 'stIronGreen', x, 2.62, z0 - 1.05, 2.56, 0.06, 0.08, 0, { u: 1, v: 1 });
  for (const s of [-1, 1]) for (const [dz, dy] of [[0.25, 2.5], [0.6, 2.58]]) sbox(nd, 'stIronGreen', x + s * 1.1, dy, z0 - dz, 0.05, 0.5, 0.05, 0, { u: 1, v: 1 });
  // the stairs going down under the square, fading into the dark (they drop inside the plinth: the far city's ground lies
  // just under the setts), the grille across them, the notice
  const [hx0, hx1, hz0, hz1] = E, P = 0.4;
  aq(acc, 'stone', [x0, P, z0], [hx0, P, z0], [hx0, P, z1], [x0, P, z1], [0, 0, 1, 1], [0, 1, 0], 99); aq(acc, 'stone', [hx1, P, z0], [x1, P, z0], [x1, P, z1], [hx1, P, z1], [0, 0, 1, 1], [0, 1, 0], 99);
  aq(acc, 'stone', [hx0, P, z0], [hx1, P, z0], [hx1, P, hz0], [hx0, P, hz0], [0, 0, 1, 1], [0, 1, 0], 99);
  aq(acc, 'stStairs', [hx0, P, hz0], [hx1, P, hz0], [hx1, 0.01, hz1], [hx0, 0.01, hz1], [0, 0, 1, 1], [0, 1, -0.2], 99);
  wall(acc, 'black', hx1, hz1, hx0, hz1, 0, P, 1, 1); wall(acc, 'black', hx0, hz1, hx0, hz0, 0, P, 1, 1); wall(acc, 'black', hx1, hz0, hx1, hz1, 0, P, 1, 1);
  ST.lamps.push(lightFromHex([x, 1.2, hz1 - 0.8], '#6a8aaa', 2.4, 0.6));   // somebody left one bulb burning down there
  plate(acc, 'stGrille', x, 1.3, z0, 2.0, 2.6, Math.PI, 0.04, [0, 0, 2, 2.6], true);
  plate(acc, 'stNotice', x + 0.25, 1.45, z0, 0.92, 0.5, Math.PI, 0.07);
  plate(nd, 'stLines', x0 + 0.25, 1.75, z0, 0.42, 0.14, Math.PI, 0.02);
  plate(nd, 'stPosters', x1 + 0.0, 1.3, z, 1.8, 0.9, Math.PI / 2, 0.02, [0, 0, 1, 1]);   // pasted on the side facing the square
  wallLamp(acc, x0 - 0.05, 2.35, z0, Math.PI); wallLamp(acc, x1 + 0.05, 2.35, z0, Math.PI);
  WORLD_BOXES.push([x0 - 0.06, 0, z0 - 0.06, x1 + 0.06, H, z1 + 0.06]);
  BLOCKERS.push({ x0: x0 - 0.06, x1: x1 + 0.06, z0: z0 - 0.06, z1: z1 + 0.06 });
}
const STATION_WELL = [-8.25, -6.55, 13.3, 16.6];   // the stairwell inside the pavilion [x0, x1, z0, z1]
// an advertising column (a Litfass column): posters from all three sides round it, a cap and a finial
function posterColumn(acc, nd, x, z) {
  cyl(acc, 'stIronGreen', x, 0, z, 0.62, 0.62, 0.3, 8, { u: 1, v: 1 });
  cyl(acc, 'stPosters', x, 0.3, z, 0.55, 0.55, 2.3, 8, { u: 3.45 / 3 * 1.0, v: 1.15 * 2 });
  cyl(acc, 'stIronGreen', x, 2.6, z, 0.55, 0.7, 0.18, 8, { u: 1, v: 1 });
  cyl(acc, 'copper', x, 2.78, z, 0.7, 0.12, 0.5, 8, { u: 1, v: 1 });
  cyl(nd, 'gilt', x, 3.28, z, 0.06, 0.01, 0.3, 4, { u: 1, v: 1 });
  WORLD_BOXES.push([x - 0.6, 0, z - 0.6, x + 0.6, 2.8, z + 0.6]); BLOCKERS.push({ x0: x - 0.6, x1: x + 0.6, z0: z - 0.6, z1: z + 0.6 });
}
// ---- the other two old roads: closed by the militia. Sandbags, knife rests in wire, sawhorses, a sign in three
// scripts and a floodlight on a tripod glaring into the square. s = +1: the east road (the square is to -x)
function barricade(acc, nd, x, zc, s, len) {
  const zA = zc - len / 2, zB = zc + len / 2;
  for (const [z0, z1] of [[zA - 0.1, zA + 1.3], [zB - 1.3, zB + 0.1]]) sbox(acc, 'sandbag', x + s * 0.7, 0, (z0 + z1) / 2, 0.9, z1 - z0, 1.05, 0, { u: 1.2, v: 0.6, top: 'sandbag', tu: 1.2 });
  for (let k = 0; k < 2; k++) {   // two sawhorses across the gap
    const cx = x + s * k * 0.6;
    sbox(acc, 'barricade', cx, 0.75, zc, 0.08, len - 2.4, 0.3, 0, { u: 2, v: 0.3, top: false });
    for (const sz of [-1, 1]) sbox(acc, 'iron', cx, 0, zc + sz * (len / 2 - 1.4), 0.5, 0.08, 0.78, 0, { u: 1, v: 1 });
  }
  plate(acc, 'stClosed3', x - s * 0.05, 1.32, zc, 1.5, 0.72, -s * Math.PI / 2, 0, [0, 0, 1, 1], true);
  // knife rests in front: X frames on a rail, barbed wire wound round them
  const kx = x - s * 1.35;
  for (const zz of [zc - 1.3, zc + 1.3]) {
    sbox(nd, 'darkwood', kx, 0.55, zz, 0.08, 2.2, 0.08, 0, { u: 1, v: 1 });
    for (const dz of [-0.9, 0, 0.9]) for (const a of [-0.7, 0.7]) { const L = 1.25, cx = kx, cy = 0.5, cz = zz + dz;
      aq(nd, 'darkwood', [cx - Math.sin(a) * L / 2 - 0.04, cy + Math.cos(a) * L / 2, cz], [cx - Math.sin(a) * L / 2 + 0.04, cy + Math.cos(a) * L / 2, cz], [cx + Math.sin(a) * L / 2 + 0.04, cy - Math.cos(a) * L / 2, cz], [cx + Math.sin(a) * L / 2 - 0.04, cy - Math.cos(a) * L / 2, cz], [0, 0, 1, 1], [0, 0, 1], 99);
      aq(nd, 'darkwood', [cx + Math.sin(a) * L / 2 - 0.04, cy - Math.cos(a) * L / 2, cz], [cx + Math.sin(a) * L / 2 + 0.04, cy - Math.cos(a) * L / 2, cz], [cx - Math.sin(a) * L / 2 + 0.04, cy + Math.cos(a) * L / 2, cz], [cx - Math.sin(a) * L / 2 - 0.04, cy + Math.cos(a) * L / 2, cz], [0, 0, 1, 1], [0, 0, -1], 99); }
    for (const sx of [-0.3, 0.3]) plate(nd, 'stWire', kx + sx, 0.55, zz, 2.2, 0.8, Math.PI / 2, 0, [0, 0, 2.6, 1], true);
  }
  // the floodlight on its tripod, glaring at the square; its cold light against the gaslight
  const fx = x + s * 0.4, fz = zA + 0.6;
  for (let a = 0; a < 3; a++) { const t = a * 2.1, L = 2.6, bx = fx + Math.cos(t) * 0.55, bz = fz + Math.sin(t) * 0.55; aq(nd, 'iron', [fx - 0.03, 2.4, fz], [fx + 0.03, 2.4, fz], [bx + 0.03, 0, bz], [bx - 0.03, 0, bz], [0, 0, 1, 1], [Math.cos(t), 0.2, Math.sin(t)], 99); }
  sbox(acc, 'flood', fx - s * 0.1, 2.35, fz, 0.32, 0.5, 0.42, s > 0 ? Math.PI / 2 + 0.3 : -Math.PI / 2 - 0.3, { u: 0.5, v: 0.4 });
  ST.lamps.push(lightFromHex([x - s * 2.6, 2.6, zc - 0.4], CFG.street.light.flood, 7.5, 1.1));
}
// ---- the joint-militia checkpoint: a floodlit booth with its board on the roof, the boom, sandbags, a sign over the
// road in the three scripts, the firearms notice, the Free City's flag flying over the three powers', and the Accords
// wall starting beyond with its first watchtower. The joint militia: shields and batons, no badges from any one power.
function checkpoint(acc, nd, z) {
  const bx = 2.9, bz = z + 0.4;
  sbox(acc, 'booth', bx, 0, bz, 2.0, 2.2, 2.7, 0, { u: 2.0, v: 2.7, top: 'concrete', faceKey: { b: 'booth', l: 'booth' } });
  sbox(acc, 'concrete', bx, 2.7, bz, 2.4, 2.6, 0.2, 0, { u: 2, v: 1 });
  for (const s of [-1, 1]) sbox(nd, 'iron', bx + s * 0.9, 2.9, bz - 0.9, 0.06, 0.06, 0.5, 0, { u: 1, v: 1 });
  plate(acc, 'militiaSign', bx, 3.62, bz - 0.9, 2.3, 0.58, Math.PI, 0.01, [0, 0, 1, 1], true);   // the board on the roof
  plate(nd, 'stBoothSign', bx, 2.32, bz - 1.1, 1.0, 0.42, Math.PI, 0.02);
  sbox(acc, 'flood', bx - 0.8, 2.92, bz - 1.05, 0.3, 0.26, 0.24, 0.35, { u: 0.3, v: 0.24 });
  // the sign over the road: YOU ARE LEAVING THE OLD QUARTER (and, on the far side, the militia's own)
  for (const s of [-1, 1]) sbox(acc, 'iron', s * 2.3, 0, z - 0.6, 0.14, 0.14, 5.5, 0, { u: 1, v: 1 });
  sbox(acc, 'iron', 0, 5.36, z - 0.6, 4.74, 0.1, 0.1, 0, { u: 1, v: 1 });
  plate(acc, 'stCheckL', 0, 4.66, z - 0.6, 4.4, 1.28, Math.PI, 0.03);
  plate(acc, 'militiaSign', 0, 4.66, z - 0.6, 4.4, 1.1, 0, 0.03);
  plate(acc, 'halt', -2.3, 1.55, z - 0.6, 0.6, 0.26, Math.PI, 0.08, [0, 0, 1, 1]);   // on the gantry's post (the boom lifts, the post stays)
  // the boom's counterweight post
  sbox(acc, 'iron', 1.7, 0, z, 0.3, 0.3, 1.1, 0, { u: 1, v: 1 });
  // FIREARMS ARE BANNED: a board on two posts on the left pavement, turned to the approach
  { const cx = -3.55, cz = z - 4.5, phi = Math.PI - 0.38, [ax, az] = LP(cx, cz, phi, -0.95, 0), [ex, ez] = LP(cx, cz, phi, 0.95, 0);
    plate(acc, 'stCheckR', cx, 2.42, cz, 2.0, 0.6, phi, 0.03);
    plate(acc, 'concrete', cx, 2.42, cz, 2.0, 0.6, phi + Math.PI, 0.0);
    for (const [px, pz] of [[ax, az], [ex, ez]]) { sbox(acc, 'iron', px, 0, pz, 0.08, 0.08, 2.76, 0, { u: 1, v: 1 }); BLOCKERS.push({ x0: px - 0.08, x1: px + 0.08, z0: pz - 0.08, z1: pz + 0.08 }); WORLD_BOXES.push([px - 0.06, 0, pz - 0.06, px + 0.06, 2.76, pz + 0.06]); }
    ST.lamps.push(lightFromHex([cx + 0.6, 1.2, cz - 1.4], CFG.street.light.flood, 3.4, 0.7)); }
  // sandbags: round the booth's corner and either side of the road
  sbox(acc, 'sandbag', bx + 1.35, 0, bz - 0.2, 0.7, 2.4, 0.95, 0, { u: 1.2, v: 0.6, top: 'sandbag', tu: 1.2 }); WORLD_BOXES.push([bx + 1.0, 0, bz - 1.4, bx + 1.7, 0.95, bz + 1.0]);
  sbox(acc, 'sandbag', -4.0, 0, z + 1.2, 1.2, 1.2, 1.0, 0, { u: 1.2, v: 0.6, top: 'sandbag', tu: 1.2 });
  sbox(acc, 'sandbag', -6.2, 0, z + 2.6, 3.2, 0.9, 0.9, 0.35, { u: 1.2, v: 0.6, top: 'sandbag', tu: 1.2 });
  // the flags on the gantry over the sign: the Free City's plum and brass flying highest in the middle, the three
  // powers' either side of it, seen all the way down the road from the square
  for (const [fx, k, h, fw] of [[-2.2, 'flag_kras', 6.9, 0.9], [-0.75, 'flag_hino', 6.9, 0.9], [0.4, 'flag_vost', 7.9, 1.35], [2.2, 'flag_colu', 6.9, 0.9]]) {
    sbox(acc, 'iron', fx, 5.4, z - 0.6, 0.06, 0.06, h - 5.3, 0, { u: 1, v: 1 }); cyl(nd, 'gilt', fx, h + 0.1, z - 0.6, 0.07, 0.02, 0.18, 4, { u: 1, v: 1 });
    plate(acc, k, fx - fw / 2 - 0.04, h - fw / 3, z - 0.6, fw, fw * 2 / 3, Math.PI, 0, [0, 0, 1, 1], true);
  }
  ST.lamps.push(lightFromHex([0, 6.4, z - 2.4], '#ffe6c0', 5, 0.9));
  // floodlight mast: two heads, one on the road and the boom, one on the booth
  sbox(acc, 'iron', 4.6, 0, z - 0.4, 0.16, 0.16, 6.4, 0, { u: 1, v: 1 });
  sbox(acc, 'iron', 4.45, 6.1, z - 0.4, 0.9, 0.12, 0.1, 0, { u: 1, v: 1 });
  sbox(acc, 'flood', 4.15, 6.0, z - 0.6, 0.6, 0.3, 0.4, 0.5, { u: 0.6, v: 0.4 });
  sbox(acc, 'flood', 4.85, 6.0, z - 0.6, 0.5, 0.3, 0.36, -0.3, { u: 0.6, v: 0.4 });
  ST.lamps.push(lightFromHex([3.6, 5.6, z - 1.4], CFG.street.light.flood, CFG.street.light.floodRadius, CFG.street.light.floodK));
  ST.lamps.push(lightFromHex([bx - 1.1, 2.0, bz], '#cfe6ff', 4.5, 0.8));
  ST.lamps.push(lightFromHex([bx, 3.9, bz - 1.6], CFG.street.light.flood, 3.2, 0.8));   // the roof board's own lamp
  WORLD_BOXES.push([bx - 1.0, 0, bz - 1.1, bx + 1.0, 2.7, bz + 1.1], [-4.4, 0.85, z - 0.07, 1.7, 1.06, z + 0.07]);
  BLOCKERS.push({ x0: bx - 1.0, x1: bx + 1.7, z0: bz - 1.4, z1: bz + 1.1 });
  // the Accords wall's first watchtower, on the Columbian corner of the Ring Road: a concrete shaft, a lit cab, a searchlight
  { const tx = 7.2, tz = z + 13.5;
    sbox(acc, 'concrete', tx, 0, tz, 1.3, 1.3, 7.4, 0, { u: 2, v: 2 });
    sbox(acc, 'booth', tx, 7.4, tz, 2.6, 2.6, 2.0, Math.PI / 4, { u: 2.6, v: 2.0, top: 'concrete' });
    sbox(acc, 'concrete', tx, 9.4, tz, 3.0, 3.0, 0.18, Math.PI / 4, { u: 2, v: 1 });
    sbox(acc, 'iron', tx, 9.58, tz, 0.5, 0.5, 0.3, 0, { u: 1, v: 1 }); sbox(acc, 'flood', tx, 9.88, tz, 0.5, 0.36, 0.4, -0.5, { u: 0.6, v: 0.4 });
    ST.lamps.push(lightFromHex([tx, 8.4, tz - 1.6], '#cfe6ff', 6, 0.9)); ST.lamps.push(lightFromHex([tx - 3, 6, tz - 4], CFG.street.light.flood, 12, 1.0)); }
}
// the Ring Road beyond the checkpoint, and the Accords wall starting down the middle of the old road (the Krasnovian
// gate and Superblock 14 on the -x side are in src/superblock/build.js)
function ringRoad(acc, z) {
  ground(acc, 'cobble', -40, z + 2, 40, z + 16, 0.0, 2, { cell: 2 });   // lit in 2 m cells, one per cobble repeat (it was 1.6: 2.9k triangles)
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
// shop dressing on a facade run: a sign in one of the three scripts, a striped awning, a Hinomoto blade sign
function shopSign(nd, x, z, phi, row, w = 1.8) { plate(nd, 'stSigns', x, 3.3, z, w, 0.45, phi, 0.05, [0, row / 6, 1, (row + 1) / 6]); }
function awning(nd, x, z, phi, w, half) {
  const [ax, az] = LP(x, z, phi, -w / 2, 0.06), [bx, bz] = LP(x, z, phi, w / 2, 0.06), [cx, cz] = LP(x, z, phi, w / 2, 1.0), [dx, dz] = LP(x, z, phi, -w / 2, 1.0), n = LN(phi, 0, 1);
  const uv = [half * 0.5, 0, half * 0.5 + 0.5 * w / 1.6, 1];
  aq(nd, 'stAwning', [ax, 3.0, az], [bx, 3.0, bz], [cx, 2.5, cz], [dx, 2.5, dz], uv, [n[0], 1, n[2]], 99);
  aq(nd, 'stAwning', [dx, 2.5, dz], [cx, 2.5, cz], [bx, 3.0, bz], [ax, 3.0, az], uv, [-n[0], -1, -n[2]], 99);
  for (const [px, pz] of [[dx, dz], [cx, cz]]) sbox(nd, 'iron', px, 2.5, pz, 0.03, 0.03, 0.5, 0, { u: 1, v: 1 });
}
function bladeSign(nd, x, y, z, phi, col) {   // perpendicular to the wall facing phi, col 0 (red) or 1 (black/pink)
  const [cx, cz] = LP(x, z, phi, 0, 0.42);
  plate(nd, 'stBladeH', cx, y, cz, 0.42, 1.5, phi + Math.PI / 2, 0, [col * 0.5, 0, col * 0.5 + 0.5, 1], true);
  for (const dy of [-0.6, 0.6]) { const [bx, bz] = LP(x, z, phi, 0, 0.18); sbox(nd, 'iron', bx, y + dy, bz, 0.04, 0.36, 0.04, phi, { u: 1, v: 1 }); }
}
// tram line 3's rails: up the old road (x = 0), a quarter turn round the clock into the east road (z = 13), out past the
// barricade; and tram 3 itself, stranded behind it
const TRAM = { turn: [9.5, 22.5], gauge: 0.72, car: [22.5, 33.5] };
function tramLine(nd, zEnd, E) {
  const [cx, cz] = TRAM.turn, R = cx;
  for (const s of [-1, 1]) {
    const r = R - s * TRAM.gauge, pts = [[cx - r, zEnd], [cx - r, cz]];
    for (let k = 1; k <= 10; k++) { const t = k / 10 * Math.PI / 2; pts.push([cx - r * Math.cos(t), cz - r * Math.sin(t)]); }
    pts.push([E.x1 + 46, cz - r]);
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L * 0.06, nz = (bx - ax) / L * 0.06;
      aq(nd, 'stRail', [ax - nx, 0.012, az - nz], [ax + nx, 0.012, az + nz], [bx + nx, 0.012, bz + nz], [bx - nx, 0.012, bz - nz], [0, 0, 1, 1], [0, 1, 0], 6);   // (the rail's cross-section doesn't change along it: one stretch)
    }
  }
  // tram 3: dark, dusty, pasted over, its trolley pole down, on the rails behind the east barricade
  const [x0, x1] = TRAM.car, mx = (x0 + x1) / 2, L = x1 - x0;
  sbox(nd, 'iron', mx, 0.12, cz - R, L - 1.6, 1.8, 0.4, 0, { u: 1, v: 1, top: false });
  sbox(nd, 'stTram', mx, 0.5, cz - R, L, 2.3, 2.6, 0, { u: L, v: 2.6, skip: ['l', 'r'], top: false });
  for (const f of [['l', -1], ['r', 1]]) { const ex = mx + f[1] * L / 2; aq(nd, 'stTramEnd', [ex, 3.1, cz - R + f[1] * 1.15], [ex, 3.1, cz - R - f[1] * 1.15], [ex, 0.5, cz - R - f[1] * 1.15], [ex, 0.5, cz - R + f[1] * 1.15], [0, 0, 1, 1], [f[1], 0, 0], 99); }
  frustum(nd, 'slate', mx, 3.1, cz - R, L, 2.3, L - 0.6, 1.4, 0.3, 0, { u: 2, v: 1, top: 'slate' });
  sbox(nd, 'iron', mx - 2, 3.4, cz - R, 0.5, 0.5, 0.2, 0, { u: 1, v: 1 });
  aq(nd, 'iron', [mx - 2, 3.62, cz - R - 0.03], [mx - 2, 3.62, cz - R + 0.03], [mx + 3.6, 3.75, cz - R + 0.03], [mx + 3.6, 3.75, cz - R - 0.03], [0, 0, 1, 1], [0, 1, 0], 99);
}
function buildStreetGeometry() {
  const acc = ST.lit, Z = STREET.fz, SX = STREET.sq.x, SZ = STREET.sq.z1, RX = STREET.road.x, RZ = STREET.road.z1, W = STREET.west, E = STREET.east;
  const nd = ST.near = new GeoAcc();   // the close detail: drawn only near the street (CFG.street.nearDraw)
  // ---- ground: setts in the square, cobbles and pavements down the road
  ground(acc, 'setts', -SX, Z, SX, SZ, 0, 2);
  ground(acc, 'cobble', -RX + 1.6, SZ, RX - 1.6, RZ + 1, 0, 2);
  for (const s of [-1, 1]) {
    ground(acc, 'flags', s > 0 ? RX - 1.6 : -RX, SZ, s > 0 ? RX : -RX + 1.6, RZ + 1, 0, 1.6);
    const cx = s * (RX - 1.6);
    aq(acc, 'curb', [cx, 0.01, SZ], [cx, 0.01, RZ + 1], [cx + s * 0.18, 0.01, RZ + 1], [cx + s * 0.18, 0.01, SZ], [0, 0, (RZ + 1 - SZ) / 2, 1], [0, 1, 0], 2);
  }
  ground(acc, 'cobble', W.x1, W.z0, -SX, W.z1, 0, 2); ground(acc, 'cobble', SX, E.z0, E.x1, E.z1, 0, 2);
  // past the barricades the old roads carry on, gaslit, into the city (the far grid leaves them a street at z 10.5..18.5)
  ground(acc, 'cobble', W.x1 - 46, 10.6, W.x1, 18.4, 0, 2, { cell: 2 }); ground(acc, 'cobble', E.x1, 10.6, E.x1 + 46, 18.4, 0, 2, { cell: 2 });
  for (let k = 0; k < 5; k++) { gasLamp(acc, W.x1 + 2 - k * 11, k % 2 ? 11.2 : 17.8); gasLamp(acc, E.x1 - 2 + k * 11, k % 2 ? 11.2 : 17.8); }
  // three brass lines in the cobbles, meeting at the Threeway's door: the Accords borders
  const line = (pts) => { for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L * 0.07, nz = (bx - ax) / L * 0.07; aq(acc, 'brassLine', [ax + nx, 0.015, az + nz], [bx + nx, 0.015, bz + nz], [bx - nx, 0.015, bz - nz], [ax - nx, 0.015, az - nz], [0, 0, L / 2, 1], [0, 1, 0], 2); } };
  line([[0, Z + 0.02], [0, RZ + 1.2]]);
  line([[0, Z + 0.02], [-SX, (W.z0 + W.z1) / 2], [W.x1, (W.z0 + W.z1) / 2]]);
  line([[0, Z + 0.02], [SX, (E.z0 + E.z1) / 2], [E.x1, (E.z0 + E.z1) / 2]]);
  // where they meet, at the door: a brass roundel of the three sectors, 1962
  aq(acc, 'stMedallion', [-0.62, 0.02, Z + 0.1], [0.62, 0.02, Z + 0.1], [0.62, 0.02, Z + 1.34], [-0.62, 0.02, Z + 1.34], [0, 0, 1, 1], [0, 1, 0], 99);
  // the dead tram line: line 3 ran up the old road, round the Brass Clock and out along the east road until 1962. The Accords
  // line runs between its rails; the boom cuts it at one end, the barricade at the other, and the last car is still there
  tramLine(nd, RZ + 0.6, E);
  // ---- the Threeway and its neighbours on the north side of the square
  buildThreewayFront(acc, nd);
  const B = [
    { x0: 5.32, x1: 9.6, z0: -6, z1: Z, floors: 2, roof: 'copper', tint: 2, painted: true, shops: 'shops', faces: 's', life: [['s', 1, 1, 1]], dormers: [['s', 0, 2]] },
    { x0: 9.6, x1: 21, z0: -6, z1: Z, floors: 2, roof: 'mansard', tint: 4, faces: 's', seed: 1, balc: [['s', 1, 1], ['s', 2, 1]], life: [['s', 1, 0, 2], ['s', 3, 1, 1]], dormers: [['s', 0, 0], ['s', 2, 2]] },
    { x0: -9.8, x1: -5.32, z0: -6, z1: Z, floors: 2, roof: 'tile', tint: 1, painted: true, faces: 's', seed: 2, life: [['s', 0, 0, 2]] },
    { x0: -21, x1: -9.8, z0: -6, z1: Z, floors: 3, roof: 'mansard', tint: 0, faces: 's', seed: 3, balc: [['s', 1, 1], ['s', 2, 2]], life: [['s', 2, 1, 0], ['s', 0, 0, 1]], dormers: [['s', 1, 0], ['s', 3, 2]] },
    // east side of the square, either side of the east road
    { x0: SX, x1: 22, z0: Z, z1: E.z0, floors: 2, roof: 'mansard', tint: 4, faces: 'ws', seed: 4, life: [['w', 0, 0, 1]], dormers: [['w', 1, 2]] },
    { x0: SX, x1: 22, z0: E.z1, z1: SZ, floors: 3, roof: 'copper', tint: 3, painted: true, shops: 'shops', faces: 'wn', onion: [SX + 1.3, SZ - 1.3], seed: 5, balc: [['w', 1, 1]], life: [['w', 1, 1, 2]] },
    { x0: 22, x1: E.x1 + 2, z0: 2, z1: E.z0, floors: 3, roof: 'mansard', tint: 6, faces: 's', seed: 6, blocker: false },
    { x0: 22, x1: E.x1 + 2, z0: E.z1, z1: 26, floors: 2, roof: 'copper', tint: 5, faces: 'n', seed: 7, blocker: false },
    // west side
    { x0: -22, x1: -SX, z0: Z, z1: W.z0, floors: 3, roof: 'copper', tint: 5, faces: 'es', seed: 8, balc: [['e', 1, 1]], life: [['e', 0, 1, 0], ['e', 2, 0, 1]], dormers: [['e', 0, 2]] },
    { x0: -22, x1: -SX, z0: W.z1, z1: SZ, floors: 2, roof: 'tile', tint: 2, painted: true, shops: 'shops', faces: 'en', seed: 9, life: [['e', 1, 0, 2]] },
    { x0: W.x1 - 2, x1: -22, z0: 2, z1: W.z0, floors: 2, roof: 'mansard', tint: 1, faces: 's', seed: 10, blocker: false },
    { x0: W.x1 - 2, x1: -22, z0: W.z1, z1: 26, floors: 3, roof: 'mansard', tint: 0, painted: true, faces: 'n', seed: 11, blocker: false },
    // the south side of the square: the road's two corner buildings
    { x0: RX, x1: SX, z0: SZ, z1: 31, floors: 3, roof: 'mansard', tint: 0, painted: true, shops: 'shops', faces: 'nw', bay: [RX - 0.4, 27, -Math.PI / 2], seed: 12, balc: [['n', 1, 1]], life: [['n', 2, 0, 1], ['n', 1, 2, 2]], dormers: [['n', 0, 0], ['n', 2, 1]] },
    { x0: SX, x1: 22, z0: SZ, z1: 31, floors: 2, roof: 'mansard', tint: 1, faces: 'n', seed: 13 },
    { x0: -SX, x1: -RX, z0: SZ, z1: 30, floors: 2, roof: 'tile', tint: 6, painted: true, faces: 'ne', seed: 14, life: [['n', 2, 1, 0]] },
    { x0: -22, x1: -SX, z0: SZ, z1: 30, floors: 3, roof: 'copper', tint: 4, faces: 'n', seed: 15 },
    // down the road: shuttered, pasted over, a few windows still lit
    { x0: RX, x1: 13, z0: 31, z1: 38, floors: 2, roof: 'copper', tint: 2, faces: 'w', seed: 16, shops: 'stShutters', life: [['w', 1, 1, 1]] },
    { x0: RX, x1: 13, z0: 38, z1: 43, floors: 3, roof: 'mansard', tint: 5, faces: 'w', seed: 17, balc: [['w', 0, 1]], life: [['w', 1, 0, 2]], dormers: [['w', 1, 0]] },
    { x0: RX + 1.4, x1: 13, z0: 43, z1: 45, floors: 1, roof: 'flat', tint: 4, faces: 'w', seed: 18 },
    { x0: RX, x1: 13, z0: 45, z1: 51, floors: 3, roof: 'tile', tint: 3, painted: true, faces: 'w', seed: 19, shops: 'stShutters', life: [['w', 0, 2, 1]] },
    { x0: RX, x1: 13, z0: 51, z1: RZ, floors: 2, roof: 'mansard', tint: 0, faces: 'ws', seed: 20 },
    { x0: -13, x1: -RX, z0: 30, z1: 36, floors: 3, roof: 'mansard', tint: 1, painted: true, shops: 'shops', faces: 'e', seed: 21, balc: [['e', 1, 1]], life: [['e', 0, 0, 0], ['e', 1, 2, 1]], dormers: [['e', 1, 2]] },
    { x0: -13, x1: -RX, z0: 36, z1: 41, floors: 2, roof: 'copper', tint: 6, faces: 'e', seed: 22, shops: 'stShutters' },
    { x0: -13, x1: -RX - 1.4, z0: 41, z1: 43, floors: 1, roof: 'flat', tint: 4, faces: 'e', seed: 23 },
    { x0: -13, x1: -RX, z0: 43, z1: 49, floors: 3, roof: 'copper', tint: 0, faces: 'e', onion: [-RX - 1.3, 47.7], seed: 24, life: [['e', 1, 1, 2]] },
    { x0: -13, x1: -RX, z0: 49, z1: RZ, floors: 2, roof: 'mansard', tint: 5, painted: true, faces: 'es', seed: 25, shops: 'stShutters', balc: [['e', 1, 0]] },
  ];
  for (const b of B) tenement(acc, b, nd);
  wallLamp(acc, -RX, 3.4, 29, Math.PI / 2); bracket(acc, -RX, 3.4, 29, Math.PI / 2);
  // shop signs in the three scripts, awnings, Hinomoto blade signs
  shopSign(nd, 7.46, Z, 0, 3); awning(nd, 7.46, Z, 0, 3.6, 0);                 // the diner next door (Columbian iron front)
  shopSign(nd, 12.4, Z, 0, 1, 1.4); shopSign(nd, 17.6, Z, 0, 4);              // tobacconist, books
  shopSign(nd, -7.56, Z, 0, 2); bladeSign(nd, -9.6, 6.0, Z, 0, 0);            // the bakery under the tile roof
  shopSign(nd, -15.4, Z, 0, 0);                                               // the pharmacy
  shopSign(nd, SX, 7.4, -Math.PI / 2, 5); awning(nd, SX, 18.75, -Math.PI / 2, 3.0, 1);   // radio repairs; a red awning on the east corner
  shopSign(nd, -SX, 8.8, Math.PI / 2, 4); awning(nd, -SX, 19.5, Math.PI / 2, 3.0, 0); bladeSign(nd, -SX, 6.2, 17.2, Math.PI / 2, 1);
  shopSign(nd, 8.8, SZ, Math.PI, 3, 2.2); awning(nd, 8.8, SZ, Math.PI, 3.6, 1);
  bladeSign(nd, -RX, 6.4, 22.4, Math.PI / 2, 0); bladeSign(nd, RX, 6.6, 47.4, -Math.PI / 2, 1); bladeSign(nd, RX, 6.6, 50.2, -Math.PI / 2, 0);
  shopSign(nd, -RX, 33, Math.PI / 2, 0, 1.6); shopSign(nd, -RX, 46, Math.PI / 2, 2, 1.6);
  // TRIPOINT TRAVEL on the corner of the old road: the routes home (Krasnograd, Halcyon, Okyo), all suspended
  plate(nd, 'stTravel', RX, 1.75, 34.6, 2.2, 1.1, -Math.PI / 2, 0.03);
  // St. Vost Cathedral over the west roofs (1740s, Krasnovian craftsmen): cream walls, a tall drum, gilded onions, floodlit
  // (it stands well back, so it has to be tall to clear the square's roofs: the central onion's cross at 46 m)
  acc.tint = [0.96, 0.92, 0.84];
  sbox(acc, 'stCathedral', -30, 0, -15, 16, 10, 18, 0, { u: 8, v: 9, top: 'slate', cell: 4 });
  frustum(acc, 'copper', -30, 18, -15, 16.4, 10.4, 9, 4, 3, 0, { u: 4.4, v: 3, top: 'copperTop', tu: 3 });
  cyl(acc, 'stCathedral', -30, 21, -15, 4.2, 4.2, 9, 10, { u: 4, v: 9, cell: 4 }); acc.tint = [1, 1, 1];
  cyl(acc, 'copper', -30, 30, -15, 4.5, 4.5, 0.5, 10, { u: 4, v: 1 });
  onion(acc, -30, 30.5, -15, 5.0, 11, 10, 'stOnionGold');
  for (const [ox, oz] of [[-22.5, -10.5], [-37.5, -10.5]]) {   // the two west towers, toward the square
    acc.tint = [0.96, 0.92, 0.84]; sbox(acc, 'stCathedral', ox, 0, oz, 3.6, 3.6, 27, 0, { u: 4, v: 9, cell: 4, top: false }); acc.tint = [1, 1, 1];
    sbox(acc, 'copper', ox, 27, oz, 3.9, 3.9, 0.4, 0, { u: 4, v: 1 }); onion(acc, ox, 27.4, oz, 2.3, 5.4, 8, 'stOnionGold');
  }
  for (const [ox, oz] of [[-26, -19], [-34, -19]]) onion(acc, ox, 18, oz, 1.3, 3.0, 6, 'stOnionGold');
  for (const [lx, ly, lz, r] of [[-30, 3, -5, 24], [-22, 14, -5, 18], [-38, 14, -5, 18], [-30, 34, -6, 18], [-22, 30, -6, 10], [-38, 30, -6, 10]]) ST.lamps.push(lightFromHex([lx, ly, lz], '#ffd8a0', r, 1.0));
  // landmarks in the square
  brassClock(acc, nd, ...STREET.clock);
  sealedStation(acc, nd, ...STREET.station);
  posterColumn(acc, nd, 11.4, 17.4);
  // gaslight
  for (const [x, z] of [[-10.6, 8.2], [10.6, 8.6], [-10.6, 20.4], [10.6, 20.2], [3.9, 26.5], [-3.9, 33.5], [3.9, 40.5], [-3.9, 47.5], [3.9, 53.2]]) gasLamp(acc, x, z);
  wallLamp(acc, -17, 3.6, W.z0, 0); wallLamp(acc, 17, 3.6, E.z1, Math.PI);
  wallLamp(acc, 21.2, 3.4, E.z0, 0);   // over tram 3's nose, behind the east barricade
  // the other two old roads: barricaded by the militia, glowing with whichever sector lies down them
  barricade(acc, nd, W.x1 + 15.2, (W.z0 + W.z1) / 2, -1, W.z1 - W.z0 + 0.4);
  barricade(acc, nd, E.x1 - 15.2, (E.z0 + E.z1) / 2, 1, E.z1 - E.z0 + 0.4);
  ST.lamps.push(lightFromHex([W.x1 + 6, 5, (W.z0 + W.z1) / 2], CFG.street.light.hinoGlow, 14, 1.0));
  ST.lamps.push(lightFromHex([E.x1 - 6, 5, (E.z0 + E.z1) / 2], CFG.street.light.amber, 14, 0.9));
  // alley gates down the road (dark, iron)
  for (const [x, z0, z1] of [[RX + 0.05, 43, 45], [-RX - 0.05, 41, 43]]) {
    const n = 8; for (let k = 0; k <= n; k++) sbox(acc, 'iron', x, 0, z0 + (z1 - z0) * k / n, 0.05, 0.05, 2.6, 0, { u: 1, v: 1, top: false });
    sbox(acc, 'iron', x, 2.5, (z0 + z1) / 2, 0.08, z1 - z0, 0.08, 0, { u: 1, v: 1 });
    ground(acc, 'black', Math.min(x, x + Math.sign(x) * 8), z0, Math.max(x, x + Math.sign(x) * 8), z1, 0.005, 2);
  }
  // posters from all three sides pasted over each other down the old road, and the militia's notices on top
  for (const [x, z, phi] of [[RX, 33.2, -Math.PI / 2], [-RX, 38.6, Math.PI / 2], [RX, 48.2, -Math.PI / 2], [-RX, 51.6, Math.PI / 2]]) plate(nd, 'stPosterWall', x, 1.55, z, 2.0, 1.5, phi, 0.025);
  for (const [x, z, phi] of [[-SX + 0.02, 9, Math.PI / 2], [SX - 0.02, 19, -Math.PI / 2]]) plate(acc, 'poster', x, 1.6, z, 0.8, 1.2, phi, 0.02);
  plate(acc, 'enamel', -RX + 0.02, 3.2, SZ + 1.2, 1.4, 0.35, Math.PI / 2, 0.03);
  // the dead tram stop, line 3 struck through; and the militia's sign: checkpoint ahead
  sbox(acc, 'iron', 3.9, 0, 35.6, 0.08, 0.08, 2.9, 0, { u: 1, v: 1 }); plate(nd, 'stTramStop', 3.9, 2.45, 35.6, 0.45, 0.6, 0, 0.05, [0, 0, 1, 1], true);
  WORLD_BOXES.push([3.85, 0, 35.55, 3.95, 2.9, 35.65]); BLOCKERS.push({ x0: 3.82, x1: 3.98, z0: 35.52, z1: 35.68 });
  sbox(acc, 'iron', -3.95, 0, 25.4, 0.08, 0.08, 2.9, 0, { u: 1, v: 1 }); plate(acc, 'stAhead', -3.6, 2.55, 25.4, 1.2, 0.36, Math.PI, 0.05, [0, 0, 1, 1]);
  plate(acc, 'concrete', -3.6, 2.55, 25.4, 1.2, 0.36, 0, 0.05);
  WORLD_BOXES.push([-4.0, 0, 25.35, -3.9, 2.9, 25.45]); BLOCKERS.push({ x0: -4.03, x1: -3.87, z0: 25.32, z1: 25.48 });
  checkpoint(acc, nd, STREET.chk.z);
  ringRoad(acc, STREET.chk.z);
  buildStreetNear();
}
// The close detail is its own mesh, baked with the street's lamps, drawn only with your eye near the street
// (CFG.street.nearDraw, a userData.near rule: src/rooms.js), so Act 1's far views (Parade Square, the glass lift) never
// pay for it. Three culls it when it's behind you.
function buildStreetNear() {
  const L = CFG.street.light, F = CFG.street.fog;
  const m = new THREE.Mesh(ST.near.geometry({ ambient: L.ambient, sky: L.sky, lights: ST.lamps }), makeMat('street', { baked: true }));
  m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far };
  m.matrixAutoUpdate = false; m.updateMatrix(); m.userData.near = CFG.street.nearDraw;
  scene.add(m); ST.nearMesh = m; ST.nearTris = ST.near.tris;
}
