'use strict';
// ============================== Act 1, level 2: the Krasnovian gate and Superblock 14, geometry =====
// Straight on from the militia checkpoint, no cut: across the Ring Road, through the Krasnovian gate in the lane right
// of the Accords wall (which keeps running down the old road's line at x = 0), across a forecourt, through the arch in
// a nine-storey slab, into Superblock 14's courtyard: twelve-storey wings, lock-up garages along the wall, a playground,
// laundry, and the 22-storey point block whose door (podezd 3) leads to the stairwell (next level).
// World coordinates throughout (+z = down the old road from the Threeway; Krasnovia is -x).
//
// Three baked meshes on the street atlas. SBX.mesh is the estate's shell (the slabs, the wings, the point block, the
// rooftop slogan, the windows with a story), drawn from everywhere outside like every level's. Its two children carry the
// ground and everything down at ground level: SBX.gate (the border post on the Ring Road, the forecourt, the arch) and
// SBX.yard (the courtyard). Three culls each when it's out of view, and they're hidden past the fog (more than
// CFG.street.fog.far from your eye, every vertex is fog colour anyway), so the yard costs nothing from the wing roof
// looking at the Tower, from Parade Square or the glass lift.
const SB = {
  gateZ: 73, gateOpen: [-8.7, -0.6],
  south: [-46, -4, 86, 92, 25.2], arch: [-21.8, -17.8, 5.6],          // [x0, x1, z0, z1, h]; the arch: [x0, x1, h] (two storeys)
  west: [-46, -34, 92, 118, 33.6], north: [-46, -20, 118, 130, 33.6], point: [-20, -6, 118, 132, 61.6],
  court: [-34, -8, 92, 118], garages: [-8, -4, 92, 118, 2.6],
  door: [-13, 118], kitchen: [-16.5, 1.66], tvCut: 4, tvZoom: [0.25, 0, 0.75, 0.5],   // the kitchen window by the door: [x, y]; every tvCut s the TV cuts between the wide shot and a zoom (that part of it)
  // the border post: a concrete portal over the lane (pylons [x0, x1], depth [z0, z1], height, the lintel's [y0, y1]),
  // the sentry box on the Ring Road side, two chicane blocks in the lane, the floodlight mast behind the wall
  portal: { w: [-10.0, -8.7], e: [-1.5, -0.3], z: [72.5, 74.3], h: 9.0, lintel: [6.2, 7.6] },
  booth: [-12.2, -10.0, 70.4, 72.6, 2.6], skirtH: 1.0, mast: [-14.5, 75.6, 13],
  rocket: [-27, 104], car: [-29.5, 116.2], carpet: [-25.0, 95.6], hop: [-19.8, 100], mercury: [-23.4, 100.8],
  rect: [-50, -1, 72, 136],   // (the railway bank behind it: PZ.rail in src/kras/podezd.js)                                              // keep the skylines and far city off it
};
const SBX = { acc: null, mesh: null, gate: null, yard: null, lamps: [], tris: {} };
const onSuperblock = (x, z, m = 0) => x > SB.rect[0] - m && x < SB.rect[1] + m && z > SB.rect[2] - m && z < SB.rect[3] + m;
function sbSolid(x0, z0, x1, z1, h) { WORLD_BOXES.push([x0, 0, z0, x1, h, z1]); BLOCKERS.push({ x0, x1, z0, z1 }); }
function sbLight(x, y, z, col, r, k) { SBX.lamps.push(lightFromHex([x, y, z], col, r, k)); }
// a square bar from a to b ([x, y, z]), w thick, its texture running along it every um metres (no end caps)
function sbBeam(acc, key, a, b, w, um = 1) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d), t = d.map(v => v / L);
  const up = Math.abs(t[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const cr = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], nz = (v) => { const l = Math.hypot(...v); return v.map(c => c / l); };
  const s = nz(cr(t, up)), n = cr(s, t), h = w / 2;
  const P = (p, i, j) => [p[0] + (s[0] * i + n[0] * j) * h, p[1] + (s[1] * i + n[1] * j) * h, p[2] + (s[2] * i + n[2] * j) * h];
  for (const [i0, j0, i1, j1, o] of [[-1, 1, 1, 1, n], [1, 1, 1, -1, s], [1, -1, -1, -1, n.map(c => -c)], [-1, -1, -1, 1, s.map(c => -c)]])
    aq(acc, key, P(b, i0, j0), P(b, i1, j1), P(a, i1, j1), P(a, i0, j0), [0, 0, 1, L / um], o, 99);
}
// a cage: an n-sided cylinder seen from outside and from inside (its painting cut out between the bars), one repeat a side
function sbCage(acc, key, cx, y0, cz, r, h, n) {
  for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2, P = (a, y) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];
    aq(acc, key, P(a1, y0 + h), P(a0, y0 + h), P(a0, y0), P(a1, y0), [0, 0, 1, 1], [Math.cos(am), 0, Math.sin(am)], 99);
    aq(acc, key, P(a0, y0 + h), P(a1, y0 + h), P(a1, y0), P(a0, y0), [0, 0, 1, 1], [-Math.cos(am), 0, -Math.sin(am)], 99);
  }
}
// a TV aerial on a roof: a mast and two crossed yagis (cut out against the sky)
function sbAerial(acc, x, y, z, h, phi) {
  sbox(acc, 'iron', x, y, z, 0.05, 0.05, h, 0, { u: 1, v: 1, top: false, cell: 99 });
  for (const [k, dy] of [[0, 0], [1, -0.7]]) plate(acc, 'pzYagi', x, y + h - 0.35 + dy, z, 1.6, 0.6, phi + k * 1.1, 0, [0, 0, 1, 1], true);
}
// a window with a story over one of the slab's windows: bay b from the face's left, storey s from the top of the block
// (the 'slab' painting: 3 m bays, 2.8 m storeys, each window 1.5 m x 1.225 m, its middle 1.1375 m under the storey's top)
function sbStory(acc, key, face, b, s) {
  const F = { west: [-34, null, 118, -1, Math.PI / 2, 33.6], north: [null, 118, -20, -1, Math.PI, 33.6], northBack: [null, 130, -46, 1, 0, 33.6],
    point: [null, 118, -6, -1, Math.PI, 61.6], pointWest: [-20, null, 118, 1, -Math.PI / 2, 61.6] }[face];
  const u = F[2] + F[3] * (3 * b + 1.5), y = F[5] - 2.8 * s - 1.1375;
  if (F[0] !== null) plate(acc, key, F[0], y, u, 1.5, 1.225, F[4], 0.03); else plate(acc, key, u, y, F[1], 1.5, 1.225, F[4], 0.03);
}
// a panel slab: 2.8 m storeys, the 'slab' painting is 4 bays x 4 storeys (12 m x 11.2 m)
function slabBlock(acc, x0, x1, z0, z1, y0, h, o = {}) {
  sbox(acc, 'slab', (x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, z1 - z0, h, 0, { u: 12, v: 11.2, top: o.top === undefined ? 'roofDark' : o.top, tu: 8, cell: 4, faceKey: o.faceKey, skip: o.skip });
  if (o.solid !== false) sbSolid(x0, z0, x1, z1, y0 + h);
}
function sodiumPost(acc, x, z, dir, k = CFG.superblock.light.sodiumK) {   // concrete post, a cobra-head arm, sodium orange
  sbox(acc, 'concrete', x, 0, z, 0.3, 0.3, 7.2, 0, { u: 1, v: 2 });
  sbox(acc, 'iron', x + dir * 0.9, 7.1, z, 1.9, 0.16, 0.12, 0, { u: 1, v: 1 });
  sbox(acc, 'sodiumHead', x + dir * 1.7, 6.85, z, 0.7, 0.35, 0.25, 0, { u: 0.7, v: 0.25 });
  sbLight(x + dir * 1.7, 6.6, z, CFG.street.light.sodium, CFG.superblock.light.sodiumRadius, k);
  sbSolid(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 7.2);
}
// ---- the border post (SBX.gate): you should feel you're entering another country. A Brutalist portal of board-marked
// concrete over the lane (after the Warsaw Pact's road crossings and the big border stelae on their approaches), the
// gold cog in its wheat wreath on top, KRASNOVIAN SECTOR cast into the lintel, red flags; the sentry box with its lit
// window and the sentry in it; a floodlight mast throwing cold white light over the lane against the sodium everywhere
// else; a striped boom raised, striped crash skirts, STOP on the asphalt; the wall, the Free City's graffiti on its face
function krasGate(acc) {
  const z = SB.gateZ, P = SB.portal, [px0, px1, pz0, pz1, ph] = [P.w[0], P.e[1], P.z[0], P.z[1], P.h], pzc = (pz0 + pz1) / 2, mid = (P.w[1] + P.e[0]) / 2;
  ground(acc, 'asphaltK', -46, 72, -0.3, 86, 0, 4);
  // the wall across the lane's west side: precast panels, a capping pipe; whitewashed inside
  wall(acc, 'borderWall', px0, z, -46, z, 0, 3.4, 4.8, 3.4, { cell: 4.8 }); wall(acc, 'borderWallK', -46, z + 0.6, px0, z + 0.6, 0, 3.4, 4.8, 3.4, { cell: 4.8 });
  sbox(acc, 'concrete', (-46 + px0) / 2, 3.4, z + 0.3, px0 + 46, 0.7, 0.32, 0, { u: 6, v: 1, top: 'wallTop', tu: 6, cell: 6 });
  sbSolid(-46, z, px0, z + 0.6, 3.4);
  // the portal: two tapering pylons, the lintel with the signs, the emblem on top, flags, lamps under the lintel
  for (const [a, b] of [P.w, P.e]) { frustum(acc, 'pylon', (a + b) / 2, 0, pzc, b - a, pz1 - pz0, (b - a) * 0.76, (pz1 - pz0) * 0.82, ph, 0, { u: b - a, v: 3, top: 'concrete', cell: 99 }); sbSolid(a, pz0, b, pz1, ph); }
  const [ly0, ly1] = P.lintel;
  sbox(acc, 'concrete', (px0 + px1) / 2, ly0, pzc, px1 - px0, pz1 - pz0, ly1 - ly0, 0, { u: px1 - px0, v: ly1 - ly0, top: 'concrete', tu: 4, cell: 99, faceKey: { b: 'krasLintel', f: 'krasLintelIn' } });
  aq(acc, 'concrete', [P.w[1], ly0, pz1], [P.e[0], ly0, pz1], [P.e[0], ly0, pz0], [P.w[1], ly0, pz0], [0, 0, 3, 1], [0, -1, 0], 2);
  plate(acc, 'krasEmblem', mid, ly1 + 1.75, pzc, 3.5, 3.5, Math.PI, 0, [0, 0, 1, 1], true);
  for (const [x, s] of [[(P.w[0] + P.w[1]) / 2, 1], [(P.e[0] + P.e[1]) / 2, -1]]) {
    sbox(acc, 'iron', x, ph, pzc, 0.08, 0.08, 3.6, 0, { u: 1, v: 1, top: false, cell: 99 });
    plate(acc, 'flag_kras', x + s * 0.72, ph + 2.9, pzc, 1.4, 0.95, Math.PI, 0, [0, 0, 1, 1], true);
  }
  for (const x of [mid - 2.4, mid, mid + 2.4]) sbox(acc, 'litWarm', x, ly0 - 0.06, pzc, 0.5, 0.2, 0.06, 0, { u: 1, v: 1, top: false });
  sbLight(mid, ly0 - 0.6, pzc, '#ffe8c0', 8, 1.2);
  for (const zz of [pz0 - 0.15, pz1 + 0.15]) for (const x of [mid - 3, mid + 3]) sbox(acc, 'flood', x, ly1, zz, 0.5, 0.3, 0.35, 0, { u: 0.5, v: 0.35 });
  sbLight(mid, ly1 - 0.4, pz0 - 2.6, CFG.street.light.flood, 12, 1.5); sbLight(mid, ly1 - 0.4, pz1 + 2.6, CFG.street.light.flood, 12, 1.3);   // cold white on the signs and the lane
  // the boom, raised, and its post by the east pylon
  sbox(acc, 'iron', -1.15, 0, pz1 + 0.65, 0.3, 0.3, 1.2, 0, { u: 1, v: 1 }); sbSolid(-1.3, pz1 + 0.5, -1.0, pz1 + 0.8, 1.2);
  { const a = [-1.15, 1.15, pz1 + 0.65], t = 78 * Math.PI / 180, b = [a[0] - Math.cos(t) * 6.5, a[1] + Math.sin(t) * 6.5, a[2]]; sbBeam(acc, 'boom', a, b, 0.14, 1.6); }
  // red and white striped skirts round the pylons' feet, like the crash blocks at a road checkpoint (no chicane in the lane:
  // goons walk straight at you, and a block in this choke point jams them against it)
  for (const [a, b] of [P.w, P.e]) sbox(acc, 'chicane', (a + b) / 2, 0, pzc, b - a + 0.16, pz1 - pz0 + 0.16, SB.skirtH, 0, { u: 1.2, v: SB.skirtH, top: 'wallTop', tu: 1.2, cell: 99 });
  // the lane's paint: yellow edge lines through the portal, a stop bar and STOP on the Ring Road side, read as you come
  for (const x of [P.w[1] + 0.35, P.e[0] - 0.35]) aq(acc, 'laneLine', [x - 0.08, 0.012, 81], [x + 0.08, 0.012, 81], [x + 0.08, 0.012, 70], [x - 0.08, 0.012, 70], [0, 0, 1, 4], [0, 1, 0], 99);
  aq(acc, 'laneStop', [P.e[0] - 0.6, 0.014, 72.2], [P.w[1] + 0.6, 0.014, 72.2], [P.w[1] + 0.6, 0.014, 70.0], [P.e[0] - 0.6, 0.014, 70.0], [0, 0, 1, 1], [0, 1, 0], 99);
  // the sentry box, out on the Ring Road side of the west pylon: its lit window, the sentry, PASSPORT CONTROL, a red lamp
  { const [b0, b1, c0, c1, bh] = SB.booth, bx = (b0 + b1) / 2, bz = (c0 + c1) / 2;
    sbox(acc, 'boothK2', bx, 0, bz, b1 - b0, c1 - c0, bh, 0, { u: 2.4, v: bh, top: 'concrete', cell: 99, faceKey: { b: 'boothKWin', r: 'boothKWin2' } });
    sbox(acc, 'concrete', bx, bh, bz, b1 - b0 + 0.6, c1 - c0 + 0.6, 0.22, 0, { u: 2, v: 1, top: 'roofDark', cell: 99 });
    sbox(acc, 'litRed', bx, bh + 0.22, bz, 0.2, 0.2, 0.2, 0, { u: 1, v: 1 });
    plate(acc, 'krasControl', bx, bh + 0.11, c0 - 0.3, 2.6, 0.31, Math.PI, 0.02);
    sbSolid(b0, c0, b1, c1, bh); sbLight(bx, 1.8, c0 - 1.2, '#ffe0a0', 5, 1.0); sbLight(b1 + 1.0, 1.8, bz, '#ffe0a0', 4, 0.8); }
  // the floodlight mast behind the wall: a lattice, a bank of lamps aimed at the lane, its bloom (reads from the street)
  { const [mx, mz, mh] = SB.mast, w0 = 1.0, w1 = 0.45, sq = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    const b = sq.map(([sx, sz]) => [mx + sx * w0 / 2, 0, mz + sz * w0 / 2]), t = sq.map(([sx, sz]) => [mx + sx * w1 / 2, mh, mz + sz * w1 / 2]);
    for (const [i, j, nx, nz] of [[3, 2, 0, 1], [2, 1, 1, 0], [1, 0, 0, -1], [0, 3, -1, 0]]) { aq(acc, 'plLattice', t[i], t[j], b[j], b[i], [0, 0, 1, 2], [nx, 0, nz], 99); aq(acc, 'plLattice', t[j], t[i], b[i], b[j], [0, 0, 1, 2], [-nx, 0, -nz], 99); }
    sbox(acc, 'iron', mx, mh, mz, 1.4, 1.4, 0.18, 0, { u: 1, v: 1, cell: 99 });
    const c = [mx + 0.5, mh + 1.0, mz - 0.3], u = [0.25, 0, 1.15], v = [-0.45, 0.62, 0.1], Q = (s, r, k = 1) => [c[0] + (u[0] * s + v[0] * r) * k, c[1] + (u[1] * s + v[1] * r) * k, c[2] + (u[2] * s + v[2] * r) * k];
    aq(acc, 'plFloodBank', Q(-1, 1), Q(1, 1), Q(1, -1), Q(-1, -1), [0, 0, 2, 1.5], [0.8, -0.5, -0.2], 99); aq(acc, 'plFloodBack', Q(1, 1), Q(-1, 1), Q(-1, -1), Q(1, -1), [0, 0, 2, 1.5], [-0.8, 0.5, 0.2], 99);
    const H = (s, r) => { const q = Q(s, r, 1.5); return [q[0] - 0.3, q[1] + 0.2, q[2]]; };
    aq(acc, 'plHalo', H(-1, 1), H(1, 1), H(1, -1), H(-1, -1), [0, 0, 1, 1], null, 99); aq(acc, 'plHalo', H(1, 1), H(-1, 1), H(-1, -1), H(1, -1), [0, 0, 1, 1], null, 99);
    sbLight(mx + 3.5, mh - 1.5, mz - 1.0, CFG.street.light.flood, 24, 2.0); sbSolid(mx - 0.5, mz - 0.5, mx + 0.5, mz + 0.5, mh); }
  // the Columbian lane on the far side of the wall: shut with an iron gate
  plate(acc, 'gate', 2.9, 1.4, z + 0.3, 5.2, 2.8, Math.PI, 0, [0, 0, 2, 1], true);
}
// ---- the forecourt and the arch (SBX.gate): a big smalt mosaic on the slab's end, lit from below (the microdistrict
// mosaics of Kyiv, Minsk and Tbilisi: the space age, a woman with a dove, a steelworker); the arch as a grand two-storey
// passage, framed and signed, tiled inside like an underpass, three lamps down its ceiling; a board of honour and a press
// kiosk between the wall and the forecourt
function forecourt(acc) {
  const [, sx1, sz0, sz1] = SB.south, [ax0, ax1, ah] = SB.arch, am = (ax0 + ax1) / 2;
  // the mosaic, cut into cells so the light from below fades up it; a sill, two floods on brackets
  aq(acc, 'mosaicSpace', [-25.5, 20, sz0 - 0.05], [-36.5, 20, sz0 - 0.05], [-36.5, 4, sz0 - 0.05], [-25.5, 4, sz0 - 0.05], [0, 0, 1, 1], [0, 0, -1], 2);
  sbox(acc, 'concrete', -31, 3.6, sz0 - 0.2, 11.8, 0.4, 0.4, 0, { u: 4, v: 1, top: 'wallTop', tu: 4, cell: 99 });
  for (const x of [-34.5, -27.5]) sbox(acc, 'flood', x, 3.1, sz0 - 0.55, 0.5, 0.35, 0.3, 0, { u: 0.5, v: 0.3 });
  sbLight(-31, 2.4, sz0 - 1.6, '#ffe8c8', 17, 2.0);
  // the arch: its ceiling and floor, tiled walls, three lamps; a stepped concrete frame on the forecourt side, the sign
  aq(acc, 'concrete', [ax0, ah, sz0], [ax1, ah, sz0], [ax1, ah, sz1], [ax0, ah, sz1], [0, 0, 2, 3], [0, -1, 0], 2);
  ground(acc, 'asphaltK', ax0, sz0, ax1, sz1, 0.004, 4);
  wall(acc, 'archTile', ax0 + 0.01, sz0, ax0 + 0.01, sz1, 0, ah, 2, 2.8); wall(acc, 'archTile', ax1 - 0.01, sz1, ax1 - 0.01, sz0, 0, ah, 2, 2.8);
  for (const zz of [sz0 + 1.0, (sz0 + sz1) / 2, sz1 - 1.0]) { sbox(acc, 'litWarm', am, ah - 0.08, zz, 0.6, 0.25, 0.08, 0, { u: 1, v: 1 }); sbLight(am, ah - 0.5, zz, '#ffd8a0', 7, 1.6); }
  // (the frames stand inside the 0.3 m the walk areas keep off the walls: nothing to snag on at the corners)
  for (const [d, w, h, o] of [[0.28, 0.7, 0.7, 0], [0.14, 0.9, 1.4, 0.7]]) {
    for (const s of [-1, 1]) { const x = s < 0 ? ax0 - o - w / 2 : ax1 + o + w / 2; sbox(acc, 'concrete', x, 0, sz0 - d / 2, w, d, ah + h, 0, { u: 1, v: 2, top: 'wallTop', tu: 1, cell: 99 }); }
    sbox(acc, 'concrete', am, ah + (o ? 0.7 : 0), sz0 - d / 2, ax1 - ax0 + 2 * (o + w), d, h - (o ? 0.7 : 0), 0, { u: 2, v: 1, top: 'wallTop', tu: 2, cell: 99 });
  }
  plate(acc, 'archSign', am, ah + 1.05, sz0 - 0.28, 5.2, 0.71, Math.PI, 0.02);
  // the courtyard side: a plain frame
  for (const s of [-1, 1]) { const x = s < 0 ? ax0 - 0.3 : ax1 + 0.3; sbox(acc, 'concrete', x, 0, sz1 + 0.14, 0.6, 0.28, ah + 0.5, 0, { u: 1, v: 2, top: 'wallTop', tu: 1, cell: 99 }); }
  sbox(acc, 'concrete', am, ah, sz1 + 0.14, ax1 - ax0 + 1.2, 0.28, 0.5, 0, { u: 2, v: 1, top: 'wallTop', tu: 2, cell: 99 });
  plate(acc, 'gate', (sx1 - 0.3) / 2, 1.4, sz0, -0.3 - sx1, 2.8, Math.PI, 0.02, [0, 0, 1, 1], true);   // the alley between the slab and the Accords wall: gated
  plate(acc, 'banner', -9, 12, sz0, 2.4, 9, Math.PI, 0.05);
  // the board of honour, its posts and its little lamp; the press kiosk, its window lit
  sbox(acc, 'concrete', -27.5, 2.95, 77.35, 4.4, 0.6, 0.15, 0, { u: 2, v: 1, top: 'roofDark', cell: 99 });
  for (const x of [-29.6, -25.4]) { sbox(acc, 'concrete', x, 0, 77.3, 0.22, 0.22, 2.95, 0, { u: 1, v: 2, cell: 99 }); sbSolid(x - 0.12, 77.18, x + 0.12, 77.42, 2.95); }
  plate(acc, 'honorBoard', -27.5, 1.85, 77.3, 3.8, 1.99, 0, 0.02); sbox(acc, 'litWarm', -27.5, 2.85, 77.55, 3.4, 0.08, 0.08, 0, { u: 1, v: 1 }); sbLight(-27.5, 2.6, 78.3, '#ffe8c0', 4, 1.0);
  sbox(acc, 'kioskSide', -20.5, 0, 76.8, 2.2, 1.6, 2.4, 0, { u: 2.2, v: 2.4, top: 'roofDark', cell: 99, faceKey: { f: 'kioskFront' } });
  sbox(acc, 'kioskSide', -20.5, 2.4, 76.9, 2.6, 2.0, 0.15, 0, { u: 2.6, v: 0.15, top: 'roofDark', cell: 99 });
  sbSolid(-21.6, 76.0, -19.4, 77.6, 2.4); sbLight(-20.5, 1.6, 78.3, '#ffe8b0', 4.5, 1.0);
  sodiumPost(acc, -27, 80.5, 1); sodiumPost(acc, -6.2, 82.8, -1);
}
// ---- the estate's shell (SBX.mesh, drawn from everywhere outside): the slabs, the arch's opening, the wings, the point
// block and its crown, the rooftop slogan, aerials, and the windows that tell a story
function superblockShell(acc) {
  const [sx0, sx1, sz0, sz1, sh] = SB.south, [ax0, ax1, ah] = SB.arch;
  slabBlock(acc, sx0, ax0, sz0, sz1, 0, sh, { faceKey: { r: 'slabEnd' } });
  slabBlock(acc, ax1, sx1, sz0, sz1, 0, sh, { faceKey: { l: 'slabEnd' } });
  slabBlock(acc, ax0, ax1, sz0, sz1, ah, sh - ah, { skip: 'lr', solid: false });
  // PEACE · LABOR · MAY in red neon on the south slab's roof, on posts; its back toward the yard
  { const cx = -25, y = sh + 0.4 + 1.35, z = sz0 + 0.6;
    plate(acc, 'roofSlogan', cx, y, z, 33.6, 2.7, Math.PI, 0); plate(acc, 'sloganBack', cx, y, z + 0.12, 33.6, 2.7, 0, 0);
    for (let k = 0; k < 5; k++) sbox(acc, 'iron', cx - 15 + k * 7.5, sh, z + 0.06, 0.1, 0.1, 1.0, 0, { u: 1, v: 1, top: false, cell: 99 }); }
  for (const [x, z, h, phi] of [[-43, 89.5, 3.2, 0.3], [-37.5, 90.6, 2.6, -0.4], [-12, 89, 3.6, 0.1], [-8.5, 90.8, 2.4, 0.6], [-30, 91, 2.8, -0.2]]) sbAerial(acc, x, sh, z, h, phi);
  // the wings around the courtyard and the point block
  slabBlock(acc, ...SB.west.slice(0, 4), 0, SB.west[4]);
  slabBlock(acc, ...SB.north.slice(0, 4), 0, SB.north[4], { solid: false });   // hollow: its 7th floor and roof are walked (src/kras/podezd.js)
  { const [px0, px1, pz0, , ph] = SB.point, [dx] = SB.door, u = (x) => (px1 - x) / 12;   // south face: around the street door (podezd 3 is inside)
    slabBlock(acc, ...SB.point.slice(0, 4), 0, ph, { skip: 'b', solid: false });
    wall(acc, 'slab', px1, pz0, dx + 0.6, pz0, 0, ph, 12, 11.2, { u0: 0, cell: 4 }); wall(acc, 'slab', dx - 0.6, pz0, px0, pz0, 0, ph, 12, 11.2, { u0: u(dx - 0.6), cell: 4 });
    wall(acc, 'slab', dx + 0.6, pz0, dx - 0.6, pz0, 2.2, ph, 12, 11.2, { u0: u(dx + 0.6), cell: 4 });
    for (const [a, b] of [[px0, dx - 0.6], [dx + 0.6, px1]]) sbSolid(a, pz0, b, pz0 + 0.3, ph); }
  plate(acc, 'stairStrip', -8.6, 32.2, SB.point[2], 1.2, 58.8, Math.PI, 0.04);   // the stairwell's windows, one per landing
  // the point block's crown: the lift motor rooms, a tank, red aviation lights on the corners
  { const [px0, px1, pz0, pz1, ph] = SB.point;
    sbox(acc, 'slabEnd', -13, ph, 125.5, 6.5, 4.6, 3.0, 0, { u: 4, v: 3, top: 'roofDark', cell: 99 }); sbox(acc, 'slabEnd', -9, ph, 129.5, 2.4, 2.4, 1.8, 0, { u: 2.4, v: 1.8, top: 'roofDark', cell: 99 });
    for (const [x, z] of [[px0 + 0.3, pz0 + 0.3], [px1 - 0.3, pz0 + 0.3], [px0 + 0.3, pz1 - 0.3], [px1 - 0.3, pz1 - 0.3]]) sbox(acc, 'litRed', x, ph, z, 0.3, 0.3, 0.3, 0, { u: 1, v: 1 });
    sbLight(px0 - 2.5, SB.north[4] + 1.2, 125, '#ffc888', 16, 1.6); }   // a lamp on the wing's roof washes the point block's foot: it towers up out of the light
  // the windows with a story (all lit: drawn as one of the slab's windows each)
  for (const [k, f, b, s] of [['winParty', 'west', 2, 7], ['winQuarrel', 'west', 5, 9], ['winTV', 'west', 7, 3], ['winGran', 'west', 4, 11], ['winStudent', 'west', 1, 5],
    ['winCat', 'north', 0, 2], ['winFamily', 'north', 1, 8], ['winKitchen7', 'north', 2, 4], ['winKitchen7', 'north', 3, 4], ['winTV', 'north', 3, 10],
    ['winLanding', 'point', 3, 14], ['winLanding', 'point', 1, 14], ['winParty2', 'point', 2, 5], ['winSmoker', 'point', 3, 17], ['winCat', 'point', 1, 9],
    ['winParty', 'pointWest', 2, 6], ['winTV', 'pointWest', 1, 8], ['winSmoker', 'pointWest', 3, 7],
    ['winFamily', 'northBack', 3, 5], ['winTV', 'northBack', 4, 8], ['winGran', 'northBack', 2, 2], ['winCat', 'northBack', 3, 9]]) sbStory(acc, k, f, b, s);
  // a ground-floor kitchen west of the door, over the slab's window in that bay: its big set shows Krasnograd's May Day
  // parade (Central Television, cutting between the wide shot and a zoom every few seconds: SBX.tv swaps the screen's UVs)
  { const [kx, ky] = SB.kitchen, dz = SB.door[1];
    plate(acc, 'kitchenTV', kx, ky, dz, 1.6, 1.35, Math.PI, 0.03);
    SBX.tv = { i0: acc.p.length / 3, n: 0, f: 0, a: null, b: null };
    plate(acc, 'tvParade', kx - 0.25, ky + 0.017, dz, 0.68, 0.51, Math.PI, 0.036);
    SBX.tv.n = acc.p.length / 3 - SBX.tv.i0;
    sbox(acc, 'concrete', kx, ky - 0.75, dz - 0.06, 1.8, 0.14, 0.07, 0, { u: 1, v: 1 }); }
}
// ---- the courtyard (SBX.yard): a Brezhnev-era yard at night. The rocket climbing frame is the hero, in the cold white
// of its own mercury lamp against the sodium; a carpet out on the beating rail, chalk on the path, a saloon with its
// bonnet up under a work lamp, a lock-up open and lit, a pigeon loft on the garages, the babushkas' bench by the door
function courtyard(acc) {
  const [ax0, ax1] = SB.arch, [cx0, cx1, cz0, cz1] = SB.court, [dx, dz] = SB.door;
  // podezd 3: a steel door, a concrete canopy, a lamp, the house number and the podezd's own plate
  addDoor({ name: 'podezd3', levels: ['superblock', 'podezd'], tex: 'steelDoor', x0: dx - 0.6, x1: dx + 0.6, z: PZ.z0, y: 0, h: 2.2, leaves: 1, side: 1,
    ambient: [0.55, 0.52, 0.48], open: () => level.name === 'podezd' || foughtPast('superblock', CFG.superblock.encounters.length - 1) });   // shut till the last fight out here is won
  sbox(acc, 'concrete', dx, 2.55, dz - 0.8, 2.8, 1.6, 0.18, 0, { u: 2, v: 1 });
  for (const s of [-1, 1]) { sbox(acc, 'iron', dx + s * 1.25, 0, dz - 1.45, 0.08, 0.08, 2.55, 0, { u: 1, v: 1, top: false }); sbSolid(dx + s * 1.25 - 0.06, dz - 1.51, dx + s * 1.25 + 0.06, dz - 1.39, 2.55); }
  sbox(acc, 'litWarm', dx, 2.47, dz - 0.8, 0.4, 0.4, 0.08, 0, { u: 1, v: 1 });
  sbLight(dx, 2.3, dz - 1.0, '#ffd8a0', 6, 1.3);
  plate(acc, 'blockSign', dx + 2.0, 2.1, dz, 0.9, 0.45, Math.PI, 0.03);
  plate(acc, 'podezdSign', dx + 0.95, 1.9, dz, 0.4, 0.3, Math.PI, 0.03);
  // the babushkas' bench under the kitchen window: a string bag with kefir and a loaf, the paper folded beside it
  sbox(acc, 'darkwood', -16.4, 0, 117.5, 1.8, 0.45, 0.45, 0, { u: 1, v: 1 }); sbox(acc, 'darkwood', -16.4, 0.45, 117.78, 1.8, 0.06, 0.42, 0, { u: 1, v: 1 });
  plate(acc, 'benchBag', -15.85, 0.72, 117.5, 0.3, 0.38, Math.PI, 0.0, [0, 0, 1, 1], true); sbox(acc, 'white', -16.9, 0.45, 117.45, 0.3, 0.22, 0.03, 0.2, { u: 1, v: 1 });
  sbSolid(-17.3, 117.25, -15.5, 117.85, 0.9);
  // lock-up garages along the courtyard's east side; the Accords wall and its watchtower stand behind them
  const [gx0, gx1, gz0, gz1, gh] = SB.garages;
  sbox(acc, 'concrete', (gx0 + gx1) / 2, 0, (gz0 + gz1) / 2, gx1 - gx0, gz1 - gz0, gh, 0, { u: 6, v: gh, top: 'roofDark', tu: 4, faceKey: { l: 'garage' } });
  sbSolid(gx0, gz0, gx1, gz1, gh);
  ground(acc, 'asphaltK', gx1, gz0, -0.3, gz1 + 14, 0.002, 4);
  plate(acc, 'garageOpen', gx0, 1.055, 102.5, 2.25, 2.11, -Math.PI / 2, 0.02); sbLight(gx0 - 0.7, 1.9, 102.5, '#ffd890', 6.5, 1.4);   // one lock-up open and lit
  { const lx = -6, lz = 113.5;   // the pigeon loft up on the garages' roof
    for (const [sx, sz] of [[-0.6, -0.45], [0.6, -0.45], [0.6, 0.45], [-0.6, 0.45]]) sbox(acc, 'iron', lx + sx, gh, lz + sz, 0.06, 0.06, 1.3, 0, { u: 1, v: 1, top: false, cell: 99 });
    sbox(acc, 'pigeonLoft', lx, gh + 1.3, lz, 1.6, 1.2, 1.1, 0, { u: 1.6, v: 1.1, top: false, cell: 99 });
    frustum(acc, 'roofDark', lx, gh + 2.4, lz, 1.9, 1.5, 1.9, 0.08, 0.55, 0, { u: 1, v: 1, top: false, cell: 99 });
    sbox(acc, 'iron', lx + 0.9, gh, lz + 0.7, 0.04, 0.04, 4.2, 0, { u: 1, v: 1, top: false, cell: 99 }); plate(acc, 'flag_vost', lx + 1.15, gh + 3.95, lz + 0.7, 0.5, 0.32, Math.PI / 2, 0, [0, 0, 1, 1], true); }
  // the ground: packed dirt, the paths, chalk on them, a sandpit
  ground(acc, 'dirt', cx0, cz0, cx1, cz1, 0, 4, { cell: 2 });
  ground(acc, 'yardPath', ax0 + 0.2, cz0, ax1 - 0.2, cz1, 0.01, 4); ground(acc, 'yardPath', ax1 - 0.2, cz1 - 3.5, dx + 1.4, cz1, 0.01, 4);
  { const [hx, hz] = SB.hop; aq(acc, 'hopscotch', [hx - 0.5, 0.016, hz + 1.5], [hx + 0.5, 0.016, hz + 1.5], [hx + 0.5, 0.016, hz - 1.5], [hx - 0.5, 0.016, hz - 1.5], [0, 0, 1, 1], [0, 1, 0], 99); }
  aq(acc, 'chalkArt', [-14.2, 0.016, 117.4], [-15.8, 0.016, 117.4], [-15.8, 0.016, 115.8], [-14.2, 0.016, 115.8], [0, 0, 1, 1], [0, 1, 0], 99);
  ground(acc, 'sandpit', -15.5, 95.5, -12.5, 98.5, 0.06, 2);
  for (const [x, z, w, d] of [[-14, 95.4, 3.2, 0.2], [-14, 98.6, 3.2, 0.2], [-15.6, 97, 0.2, 3.2], [-12.4, 97, 0.2, 3.2]]) sbox(acc, 'darkwood', x, 0, z, w, d, 0.28, 0, { u: 1, v: 1 });
  sbSolid(-15.7, 95.3, -12.3, 98.7, 0.3);
  // the rocket: four swept fins, a cage of red bars and coloured hoops, the cabin with its portholes, the nose cone, a
  // gilt spike; its own mercury lamp on a post beside it, cold white, so it's the brightest, whitest thing in the yard
  { const [rx, rz] = SB.rocket, r = 1.15;
    for (let k = 0; k < 4; k++) { const t = Math.PI / 4 + k * Math.PI / 2; plate(acc, 'rocketFin', rx + Math.cos(t) * (r + 0.5), 1.0, rz + Math.sin(t) * (r + 0.5), 1.1, 2.0, -t, 0, [0, 0, 1, 1], true); }
    sbCage(acc, 'rocketCage', rx, 0.2, rz, r, 3.4, 10);
    cyl(acc, 'rocketCabin', rx, 3.6, rz, r, r, 1.1, 10, { u: 2 * Math.PI * r / 10, v: 1.1, cell: 99 });
    aq(acc, 'iron', [rx - r, 3.6, rz + r], [rx + r, 3.6, rz + r], [rx + r, 3.6, rz - r], [rx - r, 3.6, rz - r], [0, 0, 1, 1], [0, -1, 0], 99);
    cyl(acc, 'rocketNose', rx, 4.7, rz, r, 0.06, 2.1, 10, { u: 2 * Math.PI * r / 10, v: 2.1, cell: 99 });
    cyl(acc, 'gilt', rx, 6.8, rz, 0.05, 0.01, 0.7, 4, { u: 1, v: 1, cell: 99 });
    for (const y of [1.2, 2.4]) aq(acc, 'darkwood', [rx - 0.7, y, rz + 0.5], [rx + 0.7, y, rz + 0.5], [rx + 0.7, y, rz - 0.5], [rx - 0.7, y, rz - 0.5], [0, 0, 1, 1], [0, 1, 0], 99);   // platforms inside
    sbSolid(rx - 1.35, rz - 1.35, rx + 1.35, rz + 1.35, 6.8);
    const [mx, mz] = SB.mercury;
    sbox(acc, 'concrete', mx, 0, mz, 0.26, 0.26, 6.6, 0, { u: 1, v: 2 }); sbox(acc, 'iron', mx - 0.55, 6.5, mz + 0.4, 1.2, 0.12, 0.1, -0.6, { u: 1, v: 1 });
    sbox(acc, 'flood', mx - 1.0, 6.25, mz + 0.75, 0.55, 0.45, 0.3, -0.6, { u: 0.55, v: 0.3 }); sbSolid(mx - 0.18, mz - 0.18, mx + 0.18, mz + 0.18, 6.6);
    sbLight(mx - 1.4, 5.8, mz + 1.2, '#dfe8ff', 13, 2.8); sbLight(rx + 0.6, 2.2, rz - 1.6, '#dfe8ff', 4.5, 0.9); }
  // swings: two A-frames and a bar
  const wx = -26, wz = 112;
  for (const s of [-1, 1]) { for (const t of [-0.5, 0.5]) sbox(acc, 'iron', wx + s * 1.6, 0, wz + t, 0.08, 0.08, 2.4, 0, { u: 1, v: 1, top: false }); sbSolid(wx + s * 1.6 - 0.1, wz - 0.6, wx + s * 1.6 + 0.1, wz + 0.6, 2.4); }
  sbox(acc, 'iron', wx, 2.4, wz, 3.4, 0.1, 0.1, 0, { u: 1, v: 1 });
  for (const s of [-0.7, 0.7]) { sbox(acc, 'iron', wx + s, 0.5, wz, 0.03, 0.03, 1.9, 0, { u: 1, v: 1, top: false }); sbox(acc, 'darkwood', wx + s, 0.45, wz, 0.5, 0.25, 0.06, 0, { u: 1, v: 1 }); }
  for (const [x, z] of [[-31.6, 99.5], [-11.2, 107]]) { sbox(acc, 'darkwood', x, 0, z, 0.5, 1.8, 0.45, 0, { u: 1, v: 1 }); sbSolid(x - 0.25, z - 0.9, x + 0.25, z + 0.9, 0.45); }
  // laundry: two lines down the west wing, on three posts
  for (const z of [96.2, 102, 108]) { sbox(acc, 'iron', -33.2, 0, z, 0.08, 0.08, 2.3, 0, { u: 1, v: 1, top: false }); sbSolid(-33.3, z - 0.1, -33.1, z + 0.1, 2.3); }
  plate(acc, 'laundry', -33.2, 1.55, 105, 6, 1.5, -Math.PI / 2, 0, [0, 0, 1, 1], true);
  plate(acc, 'laundry', -33.2, 1.6, 99.1, 5.8, 1.4, -Math.PI / 2, 0, [1, 0, 0, 1], true);
  // the carpet out on its beating rail, the beater leaning on a post
  { const [kx, kz] = SB.carpet;
    for (const s of [-1, 1]) sbox(acc, 'iron', kx, 0, kz + s * 1.35, 0.06, 0.06, 2.0, 0, { u: 1, v: 1, top: false, cell: 99 });
    sbox(acc, 'iron', kx, 1.96, kz, 0.06, 2.8, 0.06, 0, { u: 1, v: 1, cell: 99 });
    for (const [s, v] of [[-1, [0, 0, 1, 0.5]], [1, [0, 0.5, 1, 1]]]) {
      const A = [kx, 2.0, kz + 1.1], B = [kx, 2.0, kz - 1.1], C = [kx + s * 0.2, 0.75, kz - 1.1], D = [kx + s * 0.2, 0.75, kz + 1.1];
      aq(acc, 'carpet', A, B, C, D, v, [s, 0.15, 0], 99); aq(acc, 'carpet', B, A, D, C, v, [-s, -0.15, 0], 99);
    }
    sbSolid(kx - 0.3, kz - 1.4, kx + 0.3, kz + 1.4, 2.0); }
  // the saloon, its bonnet up, a work lamp hung inside it, the toolbox and a spare wheel
  { const [vx, vz] = SB.car, L = 4.15, W = 1.62;
    sbox(acc, 'saloonSide', vx, 0.28, vz, L, W, 0.72, 0, { u: L, v: 0.72, top: 'saloonPaint', tu: 4, cell: 99, faceKey: { l: 'saloonFront', r: 'saloonRear' } });
    frustum(acc, 'saloonCabin', vx + 0.3, 1.0, vz, 2.2, 1.5, 1.6, 1.3, 0.56, 0, { u: 2.2, v: 0.56, top: 'saloonPaint', tu: 2, cell: 99 });
    for (const [sx, sz] of [[-1.3, -1], [1.3, -1], [1.3, 1], [-1.3, 1]]) sbox(acc, 'black', vx + sx, 0, vz + sz * 0.7, 0.62, 0.24, 0.6, 0, { u: 1, v: 1, cell: 99 });
    const hx = vx - 0.8, fx = vx - L / 2, t = 62 * Math.PI / 180, bl = hx - fx, tx = hx - Math.cos(t) * bl, ty = 1.0 + Math.sin(t) * bl;
    aq(acc, 'engineBay', [hx, 1.006, vz - 0.75], [hx, 1.006, vz + 0.75], [fx + 0.05, 1.006, vz + 0.75], [fx + 0.05, 1.006, vz - 0.75], [0, 0, 1, 1], [0, 1, 0], 99);
    aq(acc, 'saloonPaint', [tx, ty, vz - 0.76], [tx, ty, vz + 0.76], [hx, 1.02, vz + 0.76], [hx, 1.02, vz - 0.76], [0, 0, 1, 1], [Math.sin(t), Math.cos(t), 0], 99);
    aq(acc, 'darkwood', [tx, ty, vz + 0.76], [tx, ty, vz - 0.76], [hx, 1.02, vz - 0.76], [hx, 1.02, vz + 0.76], [0, 0, 1, 1], [-Math.sin(t), -Math.cos(t), 0], 99);
    sbBeam(acc, 'iron', [fx + 0.25, 1.0, vz + 0.6], [tx + 0.12, ty - 0.1, vz + 0.6], 0.03);
    sbox(acc, 'litWarm', hx - 0.55, 1.45, vz, 0.12, 0.12, 0.2, 0, { u: 1, v: 1 }); sbLight(hx - 0.7, 1.4, vz, '#ffd890', 6.5, 2.4);
    sbox(acc, 'padRed', fx - 0.5, 0, vz - 0.45, 0.5, 0.25, 0.24, 0.3, { u: 1, v: 1, cell: 99 });
    cyl(acc, 'black', vx + 1.0, 0, vz - W / 2 - 0.16, 0.3, 0.3, 0.2, 6, { u: 1, v: 1, cell: 99 });
    sbSolid(fx - 0.8, vz - W / 2 - 0.3, vx + L / 2, vz + W / 2, 1.4); }
  // sodium lamps, four round the yard
  for (const [x, z, d] of [[-33, 97, 1], [-9.1, 101, -1], [-33, 112.5, 1], [-9.1, 113, -1]]) sodiumPost(acc, x, z, d, CFG.superblock.light.yardK);
}
// the near rule for the children: hidden when every vertex is past the fog (read in the parent's onBeforeRender, so a
// change shows a frame later; at that distance nothing of them shows anyway)
function sbSphere(acc) {
  const P = acc.p; let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], P[i + k]); hi[k] = Math.max(hi[k], P[i + k]); }
  const c = lo.map((v, k) => (v + hi[k]) / 2); let r = 0;
  for (let i = 0; i < P.length; i += 3) r = Math.max(r, Math.hypot(P[i] - c[0], P[i + 1] - c[1], P[i + 2] - c[2]));
  return { c, r };
}
const sbSeen = (m, h = player.head) => { const { c, r } = m.userData.sphere; return Math.hypot(h.x - c[0], h.y - c[1], h.z - c[2]) - r < CFG.street.fog.far; };
// called from buildStreet(): three baked meshes on the street atlas
function buildSuperblock() {
  SBX.lamps = [];
  const base = new GeoAcc(), gate = new GeoAcc(), yard = new GeoAcc();
  krasGate(gate); forecourt(gate); superblockShell(base); courtyard(yard);
  SBX.acc = base;
  const L = CFG.street.light, F = CFG.street.fog;
  const light = { ambient: L.ambient, sky: L.sky, lights: SBX.lamps.concat(ST.lamps.filter(l => l[0][2] > 50)) };
  const mk = (acc) => { const m = new THREE.Mesh(acc.geometry(light), makeMat('street', { baked: true })); m.matrixAutoUpdate = false; m.updateMatrix(); m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far }; return m; };
  const m = mk(base); m.frustumCulled = false; scene.add(m); SBX.mesh = m;
  for (const [k, acc] of [['gate', gate], ['yard', yard]]) { const c = mk(acc); c.frustumCulled = true; c.userData.sphere = sbSphere(acc); m.add(c); c.updateMatrixWorld(true); SBX[k] = c; }
  SBX.tris = { base: base.tris, gate: gate.tris, yard: yard.tris };
  sbTvSetup(m);
  for (const l of SBX.lamps) ST.lamps.push(l);
  // where you can walk once you're past the boom: the Ring Road, the gate, the forecourt, the arch, the courtyard
  const on = () => level.name === 'superblock';
  const [o0, o1] = SB.gateOpen, [ax0, ax1] = SB.arch, [cx0, cx1, cz0, cz1] = SB.court;
  [ { x0: -9, x1: STREET.road.x - 0.3, z0: STREET.chk.z + 1, z1: SB.gateZ, area: 'ringRoad', on },
    { x0: o0 + 0.1, x1: o1, z0: SB.gateZ - 1, z1: SB.gateZ + 8, area: 'krasGate', on },
    { x0: -30, x1: o1, z0: SB.gateZ + 6, z1: SB.south[2] - 0.3, area: 'forecourt', on },
    { x0: ax0 + 0.2, x1: ax1 - 0.2, z0: SB.south[2] - 1, z1: SB.south[3] + 1, area: 'arch', on },
    { x0: cx0 + 0.4, x1: SB.garages[0] - 0.3, z0: cz0 + 0.4, z1: cz1 - 0.3, area: 'courtyard', on },
  ].forEach(addWalk);
  return m;
}
// the kitchen TV: the screen's two shots as UV sets (the whole picture, the zoom); while the mesh is drawn, the cut swaps
// them (a 12-float upload every few seconds, nothing in the frame loop). The same hook keeps the children's near rule.
function sbTvSetup(m) {
  const T = SBX.tv, A = ST.atlas.rect.tvParade, Z = SB.tvZoom, uv = m.geometry.attributes.uv;
  T.a = uv.array.slice(T.i0 * 2, (T.i0 + T.n) * 2); T.b = T.a.slice();
  for (let i = 0; i < T.b.length; i += 2) for (const j of [0, 1]) { const t = (T.a[i + j] - A[j]) / (A[j + 2] - A[j]); T.b[i + j] = A[j] + (Z[j] + t * (Z[j + 2] - Z[j])) * (A[j + 2] - A[j]); }
  m.onBeforeRender = () => {
    SBX.gate.visible = sbSeen(SBX.gate); SBX.yard.visible = sbSeen(SBX.yard);
    const f = Math.floor(performance.now() / 1000 / SB.tvCut) % 2; if (f === T.f) return;
    T.f = f; uv.array.set(f ? T.b : T.a, T.i0 * 2);
    if (uv.updateRange) { uv.updateRange.offset = T.i0 * 2; uv.updateRange.count = T.n * 2; }
    uv.needsUpdate = true;
  };
}
defineLevel('superblock', {
  menu: '3 · The gate & Superblock 14', cfg: () => CFG.superblock, build: buildSuperblock, outside: () => [SBX.mesh], rects: [SB.rect],
  start: (f) => startSuperblock(f),
  after: 'street', enter: () => player.head.z > STREET.chk.z + CFG.street.exitPast,          // on past the lifted boom
  finish: (z) => z > CFG.superblock.finishZ && Math.abs(player.head.x - SB.door[0]) < 3, wonSign: 'stairwell',
  signs: { krasnovia: ['KRASNOVIA', '#ff9a3c'], gate: ['FIGHT!', '#f2c14e'], courtyard: ['SUPERBLOCK 14', '#ff9a3c'], podezd: ['PODEZD 3', '#ff4f9a'], stairwell: ['INTO PODEZD 3', '#33e0d0'] },
  hud: { walk: 'Krasnovia — through the gate, through the arch', last: 'Walk up to podezd 3', won: 'Superblock 14 cleared — walk into podezd 3 (R to restart)', short: 'Superblock' },
});
