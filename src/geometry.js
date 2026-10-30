'use strict';
// ============================== geometry builders ===========================
class GeoAcc {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.tint = [1, 1, 1]; }
  get empty() { return this.p.length === 0; }
  // c: four corners [x,y,z] in order around the quad; uv: matching [u,v]; outward: normal hint
  quad(c, uv, outward, sub = 1) {
    if (sub > 1) {
      const L = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
      const at = (arr, s, t) => L(L(arr[0], arr[1], s), L(arr[3], arr[2], s), t);
      for (let i = 0; i < sub; i++) for (let j = 0; j < sub; j++) {
        const s0 = j / sub, s1 = (j + 1) / sub, t0 = i / sub, t1 = (i + 1) / sub;
        this.quad([at(c, s0, t0), at(c, s1, t0), at(c, s1, t1), at(c, s0, t1)],
                  [at(uv, s0, t0), at(uv, s1, t0), at(uv, s1, t1), at(uv, s0, t1)], outward, 1);
      }
      return;
    }
    const A = new V3(...c[0]), B = new V3(...c[1]), Cc = new V3(...c[2]), D = new V3(...c[3]);
    const n = new V3().subVectors(B, A).cross(new V3().subVectors(D, A));
    if (n.lengthSq() < 1e-14) return;
    n.normalize();
    let P = [A, B, Cc, D], UV = uv;
    if (outward && n.x * outward[0] + n.y * outward[1] + n.z * outward[2] < 0) { P = [A, D, Cc, B]; UV = [uv[0], uv[3], uv[2], uv[1]]; n.negate(); }
    const T = this.tint;
    for (const i of [0, 1, 2, 0, 2, 3]) {
      this.p.push(P[i].x, P[i].y, P[i].z); this.n.push(n.x, n.y, n.z); this.u.push(UV[i][0], UV[i][1]); this.c.push(T[0], T[1], T[2]);
    }
  }
  geometry(light) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    if (light) g.setAttribute('bake', new THREE.Float32BufferAttribute(bakeLight(this.p, this.n, this.c, light), 3));
    g.computeBoundingSphere();
    return g;
  }
  get tris() { return this.p.length / 9; }
}

// Tapered box from y0 (w0,d0) to y1 (w1,d1); uvs in sheet pixels {f,b,l,r,t,d,'*'}.
function tbox(acc, accFace, y0, y1, w0, d0, w1, d1, uvs, o = {}) {
  const x = o.x || 0, z = o.z || 0, x1 = o.x1 || 0, z1 = o.z1 || 0, faces = o.faces || 'ftblrd', sub = o.sub || 1;
  const sw = o.sheetW || o.sheet || 64, sh = o.sheetH || o.sheet || 64;
  let lo = [y0, w0, d0, x, z], hi = [y1, w1, d1, x + x1, z + z1];
  if (y0 > y1) { const t = lo; lo = hi; hi = t; }
  const [ya, wa, da, xa, za] = lo, [yb, wb, db, xb, zb] = hi;
  const P = (sx, sy, sz) => sy ? [xb + sx * wb / 2, yb, zb + sz * db / 2] : [xa + sx * wa / 2, ya, za + sz * da / 2];
  const U = (f) => {
    const r = uvs[f] || uvs['*'] || uvs.f; const e = 0.02;
    return [[(r[0] + e) / sw, (r[1] + e) / sh], [(r[2] - e) / sw, (r[1] + e) / sh], [(r[2] - e) / sw, (r[3] - e) / sh], [(r[0] + e) / sw, (r[3] - e) / sh]];
  };
  const cen = [(xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2];
  const Qd = {
    f: [P(-1, 1, 1), P(1, 1, 1), P(1, 0, 1), P(-1, 0, 1)], b: [P(1, 1, -1), P(-1, 1, -1), P(-1, 0, -1), P(1, 0, -1)],
    l: [P(-1, 1, -1), P(-1, 1, 1), P(-1, 0, 1), P(-1, 0, -1)], r: [P(1, 1, 1), P(1, 1, -1), P(1, 0, -1), P(1, 0, 1)],
    t: [P(-1, 1, -1), P(1, 1, -1), P(1, 1, 1), P(-1, 1, 1)], d: [P(-1, 0, 1), P(1, 0, 1), P(1, 0, -1), P(-1, 0, -1)],
  };
  for (const k of faces) {
    const q = Qd[k];
    const fc = [0, 1, 2].map(i => (q[0][i] + q[1][i] + q[2][i] + q[3][i]) / 4);
    const out = fc.map((v, i) => v - cen[i]);
    const target = (accFace && k === 'f') ? accFace : acc;
    target.quad(q, U(k), out, sub);
  }
}

// Static light, baked per vertex with exactly the shader's formula: any number of lamps, no per-frame cost.
// light: { ambient: [r,g,b], sky: [r,g,b] (extra on up-facing surfaces), lights: [[pos, [r,g,b] pre-scaled, radius]] }
function bakeLight(P, N, Cv, light) {
  const out = new Float32Array(P.length), A = light.ambient, S = light.sky || [0, 0, 0];
  // hundreds of lamps (the far city): file them in a coarse xz grid and only test the cells around each vertex
  let index = null, C = 0;
  if (light.lights.length > 64) {
    C = Math.max(...light.lights.map(l => l[2])); index = new Map();
    for (const L of light.lights) { const k = Math.floor(L[0][0] / C) + ',' + Math.floor(L[0][2] / C); if (!index.has(k)) index.set(k, []); index.get(k).push(L); }
  }
  const near = [];
  for (let i = 0; i < P.length; i += 3) {
    const px = P[i], py = P[i + 1], pz = P[i + 2], nx = N[i], ny = N[i + 1], nz = N[i + 2], up = Math.max(0, ny);
    let r = A[0] + S[0] * up, g = A[1] + S[1] * up, b = A[2] + S[2] * up;
    let Ls = light.lights;
    if (index) { near.length = 0; const cx = Math.floor(px / C), cz = Math.floor(pz / C); for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) { const l = index.get((cx + a) + ',' + (cz + c)); if (l) for (const L of l) near.push(L); } Ls = near; }
    for (const [lp, lc, rad] of Ls) {
      const dx = lp[0] - px, dy = lp[1] - py, dz = lp[2] - pz, dist = Math.hypot(dx, dy, dz) + 1e-4;
      if (dist >= rad) continue;
      const ndl = clamp(((nx * dx + ny * dy + nz * dz) / dist + 0.25) / 1.25, 0, 1);
      let att = 1 - dist / rad; att *= att;
      r += lc[0] * ndl * att; g += lc[1] * ndl * att; b += lc[2] * ndl * att;
    }
    out[i] = r * Cv[i]; out[i + 1] = g * Cv[i + 1]; out[i + 2] = b * Cv[i + 2];
  }
  return out;
}
// a light set: what the dynamic (non-baked) things are lit by in an area
function applyLights(lights, ambient) {
  for (let i = 0; i < MAXL; i++) {
    const L = lights[i];
    if (L) { SU.uLightPos.value[i].set(L[0][0], L[0][1], L[0][2]); SU.uLightCol.value[i].set(L[1][0], L[1][1], L[1][2]); SU.uLightRad.value[i] = L[2]; }
    else { SU.uLightPos.value[i].set(0, -99, 0); SU.uLightCol.value[i].set(0, 0, 0); SU.uLightRad.value[i] = 1; }
  }
  SU.uAmbient.value.set(ambient[0], ambient[1], ambient[2]);
}
const lightFromHex = (p, c, r, k) => { const col = new THREE.Color(c); return [p, [col.r * k, col.g * k, col.b * k], r]; };

// Static world geometry, batched per material.
const statics = new Map();
function sacc(texName, o = {}) {
  const k = texName + '|' + (o.emissive ? 1 : 0) + '|' + (o.tint || '');
  if (!statics.has(k)) statics.set(k, { acc: new GeoAcc(), texName, o });
  return statics.get(k).acc;
}
function grid(texName, o, ua, va, w, h, tw, th, cell, outward, opt = {}) {
  const acc = sacc(texName, opt);
  const nu = Math.max(1, Math.round(w / cell)), nv = Math.max(1, Math.round(h / cell));
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a0 = w * i / nu, a1 = w * (i + 1) / nu, b0 = h * j / nv, b1 = h * (j + 1) / nv;
    const pt = (a, b) => [o[0] + ua[0] * a + va[0] * b, o[1] + ua[1] * a + va[1] * b, o[2] + ua[2] * a + va[2] * b];
    acc.quad([pt(a0, b1), pt(a1, b1), pt(a1, b0), pt(a0, b0)],
      [[a0 / tw, -b1 / th], [a1 / tw, -b1 / th], [a1 / tw, -b0 / th], [a0 / tw, -b0 / th]], outward);
  }
}
function box(texName, mn, mx, o = {}) {
  const acc = o.acc || sacc(texName, o);
  const [x0, y0, z0] = mn, [x1, y1, z1] = mx;
  const c = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
  const F = {
    f: [[[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]], x1 - x0, y1 - y0],
    b: [[[x1, y1, z0], [x0, y1, z0], [x0, y0, z0], [x1, y0, z0]], x1 - x0, y1 - y0],
    l: [[[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0]], z1 - z0, y1 - y0],
    r: [[[x1, y1, z1], [x1, y1, z0], [x1, y0, z0], [x1, y0, z1]], z1 - z0, y1 - y0],
    t: [[[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], x1 - x0, z1 - z0],
    d: [[[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]], x1 - x0, z1 - z0],
  };
  for (const k of (o.faces || 'ftblrd')) {
    const [q, w, h] = F[k];
    let u0 = 0, v0 = 0, u1 = 1, v1 = 1;
    if (o.uvs && (o.uvs[k] || o.uvs['*'])) [u0, v0, u1, v1] = o.uvs[k] || o.uvs['*'];
    else if (o.tile) { u1 = w / o.tile; v1 = h / o.tile; }
    const fc = [0, 1, 2].map(i => (q[0][i] + q[1][i] + q[2][i] + q[3][i]) / 4);
    acc.quad(q, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], fc.map((v, i) => v - c[i]), o.sub || 1);
  }
}
// The bar's statics: every batch merged into ONE mesh on TEX.bar_atlas (tools/bar_atlas.py), light baked in;
// self-lit batches just bake full light (× their tint). Anything not in the atlas falls back to its own batch.
function flushStaticsAtlas(light) {
  const P = [], N = [], U = [], B = [], R = [];
  let tris = 0;
  for (const [k, e] of statics) {
    const { acc, texName, o } = e, rect = BAR_ATLAS[texName];
    if (acc.empty || !rect) continue;
    const bake = o.emissive ? null : bakeLight(acc.p, acc.n, acc.c, light), tint = o.tint || [1, 1, 1];
    for (let i = 0; i < acc.p.length; i += 3) {
      P.push(acc.p[i], acc.p[i + 1], acc.p[i + 2]); N.push(acc.n[i], acc.n[i + 1], acc.n[i + 2]);
      if (bake) B.push(bake[i], bake[i + 1], bake[i + 2]); else B.push(tint[0], tint[1], tint[2]);
      R.push(rect[0], rect[1], rect[2], rect[3]);
    }
    for (let i = 0; i < acc.u.length; i++) U.push(acc.u[i]);
    tris += acc.tris; statics.delete(k);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setAttribute('bake', new THREE.Float32BufferAttribute(B, 3));
  g.setAttribute('arect', new THREE.Float32BufferAttribute(R, 4)); g.computeBoundingSphere();
  const m = new THREE.Mesh(g, makeMat('bar_atlas', { baked: true, atlas: true }));
  m.matrixAutoUpdate = false; m.updateMatrix(); scene.add(m); ST.barMesh = m;
  return tris + flushStatics(light);
}
function flushStatics(light) {
  let tris = 0;
  for (const { acc, texName, o } of statics.values()) {
    if (acc.empty) continue;
    const m = new THREE.Mesh(acc.geometry(light), sharedMat(texName, Object.assign({}, o, { baked: !!light && !o.emissive })));
    m.matrixAutoUpdate = false; m.updateMatrix();
    scene.add(m); tris += acc.tris;
  }
  statics.clear();
  return tris;
}
