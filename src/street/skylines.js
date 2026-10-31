'use strict';
// ============================== the three skylines ===========================
// Built cheaply and far away (fog capped so they stay readable): Hinomoto's neon spike behind the Threeway,
// Krasnovia's even field of slabs to the right of the road, Columbia's gold-crowned ridge to the left.
function hinoTower(acc, x, z, w, d, h, phi, rng, hero) {
  sbox(acc, 'glassN', x, 0, z, w, d, h, phi, { u: 14, v: 14, top: false, cell: 999 });
  const cols = rng() < 0.5 ? ['litRed', 'litRed'] : ['litCyan', 'litMagenta'];
  for (const [sx, sz, k] of [[-1, 1, 0], [1, 1, 1], [1, -1, 0]]) { const [ex, ez] = LP(x, z, phi, sx * w / 2, sz * d / 2); sbox(acc, cols[k], ex, 0, ez, 2.0, 2.0, h, phi, { u: 4, v: 4, top: false, cell: 999 }); }
  for (let y = 30; y < h - 12; y += 34) { frustum(acc, 'kawara', x, y, z, w + 5, d + 5, w + 1, d + 1, 2.5, phi, { u: 40, v: 6, top: false, cell: 999 }); sbox(acc, 'litRed', x, y - 0.5, z, w + 5.1, d + 5.1, 0.5, phi, { u: 4, v: 4, top: false, cell: 999 }); }
  const nS = 2 + Math.floor(rng() * 4);
  for (let k = 0; k < nS; k++) { const row = Math.floor(rng() * 4), [sx, sz] = LP(x, z, phi, (rng() - 0.5) * w * 0.5, d / 2); plate(acc, 'neonSigns', sx, 10 + k * 9, sz, Math.min(w * 0.8, 18), 4.5, phi, 0.3, [0, row / 4, 1, (row + 1) / 4]); }
  if (rng() < 0.7) { const col = Math.floor(rng() * 4), [sx, sz] = LP(x, z, phi, -w * 0.3, d / 2); plate(acc, 'neonV', sx, h * 0.5, sz, 5, Math.min(40, h * 0.4), phi, 0.4, [col / 4, 0, (col + 1) / 4, 1]); }
  let top = h;
  for (let k = 0; k < 3; k++) { const s = 1 - k * 0.26; frustum(acc, 'kawara', x, top, z, (w + 5) * s, (d + 5) * s, w * s * 0.55, d * s * 0.55, 5, phi, { u: 40, v: 8, top: 'kawara', tu: 40, cell: 999 }); sbox(acc, 'litRed', x, top - 0.3, z, (w + 5.2) * s, (d + 5.2) * s, 0.4, phi, { u: 4, v: 4, top: false, cell: 999 }); top += 5.3; }
  if (hero) { const [bx, bz] = LP(x, z, phi, 0, 0); plate(acc, 'neonSigns', bx, top + 8, bz, w * 1.2, w * 0.3, phi, 0, [0, 0, 1, 0.25], true); }
  cyl(acc, 'iron', x, top, z, 0.4, 0.1, hero ? 30 : 14, 4, { cell: 999 });
  ST.beacons.push([x, top + (hero ? 30 : 14), z]);
}
function buildSkylines() {
  const acc = ST.sky, rng = (() => { let s = 1986; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
  // Hinomoto: a tight cluster of black glass megatowers by the river, Aoki Development tallest
  const [hx, hz] = STREET.hino;
  for (let k = 0; k < 22; k++) {
    const a = rng() * Math.PI * 2, r = 20 + rng() * 90, x = hx + Math.cos(a) * r * 1.4, z = hz + Math.sin(a) * r * 0.7;
    const h = 70 + (1 - r / 110) * 150 * (0.6 + rng() * 0.5), w = 16 + rng() * 14;
    hinoTower(acc, x, z, w, w * (0.8 + rng() * 0.3), h, (rng() - 0.5) * 0.5, rng, false);
  }
  hinoTower(acc, hx + 30, hz + 20, 34, 30, 280, 0.1, rng, true);   // Aoki Development
  for (let k = 0; k < 2; k++) {   // the elevated expressway, streaked with tail lights
    const y = 22 + k * 9, z = hz + 70 + k * 18;
    sbox(acc, 'roofDark', hx, y, z, 260, 6, 1.5, 0.08 * (k ? -1 : 1), { u: 8, v: 8, cell: 999 });
    sbox(acc, k ? 'litWarm' : 'litRed', hx, y + 1.5, z, 260, 6.2, 0.35, 0.08 * (k ? -1 : 1), { u: 4, v: 4, top: false, cell: 999 });
  }
  // Krasnovia: concrete panel slabs on a regular grid, the Tower of Labor, the TV tower
  const [kx, kz] = STREET.kras;
  for (let i = -4; i <= 4; i++) for (let j = -3; j <= 3; j++) {
    const x = kx + i * 36, z = kz + j * 42; if (Math.abs(i) <= 1 && Math.abs(j) <= 1) continue;
    if (x > -28 || onLevelGround(x, z, 18)) continue;
    const h = 34 + ((i * 7 + j * 13) % 4 + 4) % 4 * 8, long = (i + j) % 2 === 0;
    sbox(acc, 'panel', x, 0, z, long ? 30 : 11, long ? 11 : 30, h, 0, { u: 12, v: 12, top: 'roofDark', tu: 8, cell: 999 });
    if ((i * 3 + j) % 5 === 0) plate(acc, 'banner', x, h * 0.55, z + (long ? 5.5 : 15), 5, 18, 0, 0.2);
  }
  let y = 0;
  for (const [w, d, h] of [[64, 50, 54], [48, 38, 42], [34, 27, 34], [20, 17, 28]]) { sbox(acc, 'stepped', kx, y, kz, w, d, h, 0, { u: 10, v: 10, top: 'roofDark', tu: 8, cell: 999 }); y += h; }
  cyl(acc, 'gilt', kx, y, kz, 2, 0.2, 36, 6, { cell: 999 });
  plate(acc, 'cog', kx, y + 14, kz, 13, 13, 0, 1.2, [0, 0, 1, 1], true);
  ST.beacons.push([kx, y + 36, kz]);
  const tx = -48, tz = kz + 120;   // TV tower: right on the road's sightline
  cyl(acc, 'concrete', tx, 0, tz, 7, 2.5, 200, 8, { u: 8, v: 8, cell: 999 });
  cyl(acc, 'stepped', tx, 135, tz, 10, 13, 12, 10, { u: 8, v: 8, cell: 999 });
  cyl(acc, 'iron', tx, 200, tz, 1, 0.3, 40, 4, { cell: 999 });
  ST.beacons.push([tx, 240, tz], [tx, 147, tz]);
  for (const [cx, cz] of [[kx - 120, kz - 40], [kx - 140, kz + 10]]) cyl(acc, 'panel', cx, 0, cz, 6, 4, 90, 8, { u: 8, v: 8, cell: 999 });
  // Columbia: Liberty Avenue's ridge of cream-limestone, gold-crowned setback towers; mid-rise deco in front
  const [cx0, cz0] = STREET.colu;
  for (let k = 0; k < 10; k++) {
    const t = k / 9, x = cx0 - 50 + t * 110 + (rng() - 0.5) * 10, z = cz0 - 90 + t * 200, h = (k === 5 ? 210 : 90 + rng() * 90), w = 20 + rng() * 10;
    decoTower(acc, x, z, w, w * 0.9, h, 0.1, rng, k === 5);
  }
  for (let k = 0; k < 12; k++) { const x = 40 + k * 14, z = 120 + (k % 3) * 22; sbox(acc, 'decoStone', x, 0, z, 12, 12, 24 + (k * 7) % 22, 0.1, { u: 10, v: 10, top: 'roofDark', tu: 8, cell: 999 }); sbox(acc, 'decoGold', x, 24 + (k * 7) % 22, z, 12.6, 12.6, 0.8, 0.1, { u: 6, v: 0.8, top: false, cell: 999 }); }
  ST.skyTris = acc.tris;
  // blinking aircraft beacons on every tower: one small mesh that toggles
  const bacc = new GeoAcc();
  for (const [x, y, z] of ST.beacons) sbox(bacc, 'litRed', x, y, z, 3, 3, 3, 0, { u: 4, v: 4, cell: 999 });
  ST.beaconMesh = new THREE.Mesh(bacc.geometry({ ambient: [1, 1, 1], lights: [] }), makeMat('street', { baked: true, fog: CFG.street.skylineFog }));
  ST.beaconMesh.frustumCulled = false; scene.add(ST.beaconMesh);
  ST.beaconMesh.material.uniforms.uFogNear = { value: CFG.street.fog.near }; ST.beaconMesh.material.uniforms.uFogFar = { value: CFG.street.fog.far };
}
function decoTower(acc, x, z, w, d, h, phi, rng, mast) {
  let y = 0;
  for (const [s, fr] of [[1, 0.55], [0.8, 0.2], [0.62, 0.13], [0.42, 0.08]]) {
    const hh = h * fr; sbox(acc, 'decoStone', x, y, z, w * s, d * s, hh, phi, { u: 10, v: 10, top: 'roofDark', tu: 8, cell: 999 }); y += hh;
    sbox(acc, 'decoGold', x, y - 0.8, z, w * s + 0.8, d * s + 0.8, 0.8, phi, { u: 6, v: 0.8, top: false, cell: 999 });
  }
  for (let a = 0; a < 4; a++) { const ph = phi + a * Math.PI / 2, [sx, sz] = LP(x, z, ph, 0, d * 0.42 / 2); plate(acc, 'sunburst', sx, y - h * 0.04, sz, w * 0.38, w * 0.38, ph, 0.1); }
  sbox(acc, 'decoGold', x, y, z, w * 0.3, d * 0.3, 4, phi, { u: 4, v: 4, top: 'decoGold', tu: 4, cell: 999 });
  cyl(acc, 'gilt', x, y + 4, z, 1.0, 0.1, mast ? 40 : 18, 4, { cell: 999 });
  ST.beacons.push([x, y + (mast ? 44 : 22), z]);
  if (rng() < 0.4) ST.searchlights.push([x, y + 4, z]);
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
  const R = 420, n = 32, rows = [[-60, 0.9], [6, 1], [70, 0.7], [200, 0.38], [520, 0.12], [1400, 0]], P = [], N = [], U = [], C = [], W = ST.atlas.rect.white;
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
