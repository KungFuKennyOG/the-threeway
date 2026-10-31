'use strict';
// ============================== Act 1, level 2: the Krasnovian gate and Superblock 14, geometry =====
// Straight on from the militia checkpoint, no cut: across the Ring Road, through the Krasnovian gate in the lane right
// of the Accords wall (which keeps running down the old road's line at x = 0), across a forecourt, through the arch in
// a nine-storey slab, into Superblock 14's courtyard: twelve-storey wings, lock-up garages along the wall, a playground,
// laundry, and the 22-storey point block whose door (podezd 3) leads to the stairwell (next level).
// World coordinates throughout (+z = down the old road from the Threeway; Krasnovia is -x).
const SB = {
  gateZ: 73, gateOpen: [-8.7, -0.6],
  south: [-46, -4, 86, 92, 25.2], arch: [-21.8, -17.8, 4.2],          // [x0, x1, z0, z1, h]; the arch: [x0, x1, h]
  west: [-46, -34, 92, 118, 33.6], north: [-46, -20, 118, 130, 33.6], point: [-20, -6, 118, 132, 61.6],
  court: [-34, -8, 92, 118], garages: [-8, -4, 92, 118, 2.6],
  door: [-13, 118],
  rect: [-50, -1, 72, 136],   // (the railway bank behind it: PZ.rail in src/kras/podezd.js)                                              // keep the skylines and far city off it
};
const SBX = { acc: null, mesh: null, lamps: [] };
const onSuperblock = (x, z, m = 0) => x > SB.rect[0] - m && x < SB.rect[1] + m && z > SB.rect[2] - m && z < SB.rect[3] + m;
function sbSolid(x0, z0, x1, z1, h) { WORLD_BOXES.push([x0, 0, z0, x1, h, z1]); BLOCKERS.push({ x0, x1, z0, z1 }); }
function sbLight(x, y, z, col, r, k) { SBX.lamps.push(lightFromHex([x, y, z], col, r, k)); }
// a panel slab: 2.8 m storeys, the 'slab' painting is 4 bays x 4 storeys (12 m x 11.2 m)
function slabBlock(acc, x0, x1, z0, z1, y0, h, o = {}) {
  sbox(acc, 'slab', (x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, z1 - z0, h, 0, { u: 12, v: 11.2, top: o.top === undefined ? 'roofDark' : o.top, tu: 8, cell: 4, faceKey: o.faceKey, skip: o.skip });
  if (o.solid !== false) sbSolid(x0, z0, x1, z1, y0 + h);
}
function sodiumPost(acc, x, z, dir) {   // concrete post, a cobra-head arm, sodium orange
  sbox(acc, 'concrete', x, 0, z, 0.3, 0.3, 7.2, 0, { u: 1, v: 2 });
  sbox(acc, 'iron', x + dir * 0.9, 7.1, z, 1.9, 0.16, 0.12, 0, { u: 1, v: 1 });
  sbox(acc, 'sodiumHead', x + dir * 1.7, 6.85, z, 0.7, 0.35, 0.25, 0, { u: 0.7, v: 0.25 });
  sbLight(x + dir * 1.7, 6.6, z, CFG.street.light.sodium, CFG.superblock.light.sodiumRadius, CFG.superblock.light.sodiumK);
  sbSolid(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 7.2);
}
function krasGate(acc) {   // a wall across the Krasnovian lane, a gantry with the sign, a sentry box, a floodlight
  const z = SB.gateZ, [o0, o1] = SB.gateOpen;
  ground(acc, 'asphaltK', -46, 72, -0.3, 86, 0, 4);
  sbox(acc, 'concrete', (-46 + o0 - 0.5) / 2, 0, z + 0.3, o0 - 0.5 + 46, 0.6, 3.4, 0, { u: 2, v: 2, top: 'wallTop', tu: 1 });
  sbSolid(-46, z, o0 - 0.5, z + 0.6, 3.4);
  for (const [px, w] of [[o0 - 0.4, 0.8], [o1 - 0.2, 0.5]]) {
    sbox(acc, 'concrete', px, 0, z + 0.3, w, 0.8, 5.6, 0, { u: 1, v: 2 });
    plate(acc, 'boom', px, 1.4, z + 0.3, w, 0.3, Math.PI, 0.41); plate(acc, 'boom', px, 2.0, z + 0.3, w, 0.3, Math.PI, 0.41);
    sbSolid(px - w / 2, z - 0.1, px + w / 2, z + 0.7, 5.6);
  }
  sbox(acc, 'iron', (o0 + o1) / 2, 5.6, z + 0.3, o1 - o0 + 0.6, 0.3, 0.4, 0, { u: 1, v: 1 });
  plate(acc, 'krasSign', (o0 + o1) / 2, 6.5, z + 0.3, 7.6, 1.02, Math.PI, 0.17, [0, 0, 1, 1], true);
  for (const fx of [o0 - 1.4, -27]) { sbox(acc, 'iron', fx, 0, z - 0.4, 0.06, 0.06, 5.2, 0, { u: 1, v: 1 }); plate(acc, 'flag_kras', fx + 0.47, 4.7, z - 0.4, 0.9, 0.6, Math.PI, 0, [0, 0, 1, 1], true); }
  // the sentry box just inside, its lit window toward the gate
  sbox(acc, 'boothK', -12.2, 0, z + 3, 2.0, 2.0, 2.6, 0, { u: 2, v: 2.6, top: 'concrete' }); sbox(acc, 'concrete', -12.2, 2.6, z + 3, 2.4, 2.4, 0.18, 0, { u: 2, v: 1 });
  sbSolid(-13.2, z + 2, -11.2, z + 4, 2.6); sbLight(-12.2, 1.9, z + 1.6, '#ffe0a0', 4.5, 0.8);
  // floodlight on a mast by the Accords wall, aimed down at the gate
  sbox(acc, 'iron', -1.3, 0, z + 2.2, 0.16, 0.16, 6.4, 0, { u: 1, v: 1 }); sbox(acc, 'flood', -1.7, 6.2, z + 2.0, 0.6, 0.3, 0.4, 0.6, { u: 0.6, v: 0.4 });
  sbSolid(-1.4, z + 2.1, -1.2, z + 2.3, 6.4);
  sbLight(-4.2, 5.6, z + 1.2, CFG.street.light.sodium, CFG.superblock.light.floodRadius, CFG.superblock.light.floodK);
  // the Columbian lane on the far side of the wall: shut with an iron gate
  plate(acc, 'gate', 2.9, 1.4, z + 0.3, 5.2, 2.8, Math.PI, 0, [0, 0, 2, 1], true);
}
function superblock14(acc) {
  const [sx0, sx1, sz0, sz1, sh] = SB.south, [ax0, ax1, ah] = SB.arch, [cx0, cx1, cz0, cz1] = SB.court;
  // the south slab, nine storeys, with the arch through it
  slabBlock(acc, sx0, ax0, sz0, sz1, 0, sh, { faceKey: { r: 'slabEnd' } });
  slabBlock(acc, ax1, sx1, sz0, sz1, 0, sh, { faceKey: { l: 'slabEnd' } });
  slabBlock(acc, ax0, ax1, sz0, sz1, ah, sh - ah, { skip: 'lr', solid: false });
  aq(acc, 'concrete', [ax0, ah, sz0], [ax1, ah, sz0], [ax1, ah, sz1], [ax0, ah, sz1], [0, 0, 2, 3], [0, -1, 0], 2);   // the arch's ceiling
  ground(acc, 'asphaltK', ax0, sz0, ax1, sz1, 0.004, 4);
  sbox(acc, 'litWarm', (ax0 + ax1) / 2, ah - 0.2, (sz0 + sz1) / 2, 0.5, 0.5, 0.15, 0, { u: 1, v: 1 });
  sbLight((ax0 + ax1) / 2, ah - 0.5, (sz0 + sz1) / 2, '#ffd8a0', 7, 1.3);
  plate(acc, 'gate', (sx1 - 0.3) / 2, 1.4, sz0, -0.3 - sx1, 2.8, Math.PI, 0.02, [0, 0, 1, 1], true);   // the alley between the slab and the Accords wall: gated
  // the forecourt face: a worker mosaic beside the arch, a banner, the ground floor's lamps
  plate(acc, 'mosaicK', -31, 10.5, sz0, 8, 13.3, Math.PI, 0.05);
  plate(acc, 'banner', -9, 12, sz0, 2.4, 9, Math.PI, 0.05);
  // the wings around the courtyard and the point block
  slabBlock(acc, ...SB.west.slice(0, 4), 0, SB.west[4]);
  slabBlock(acc, ...SB.north.slice(0, 4), 0, SB.north[4], { solid: false });   // hollow: its 7th floor and roof are walked (src/kras/podezd.js)
  { const [px0, px1, pz0, , ph] = SB.point, [dx] = SB.door, u = (x) => (px1 - x) / 12;   // south face: around the street door (podezd 3 is inside)
    slabBlock(acc, ...SB.point.slice(0, 4), 0, ph, { skip: 'b', solid: false });
    wall(acc, 'slab', px1, pz0, dx + 0.6, pz0, 0, ph, 12, 11.2, { u0: 0, cell: 4 }); wall(acc, 'slab', dx - 0.6, pz0, px0, pz0, 0, ph, 12, 11.2, { u0: u(dx - 0.6), cell: 4 });
    wall(acc, 'slab', dx + 0.6, pz0, dx - 0.6, pz0, 2.2, ph, 12, 11.2, { u0: u(dx + 0.6), cell: 4 });
    for (const [a, b] of [[px0, dx - 0.6], [dx + 0.6, px1]]) sbSolid(a, pz0, b, pz0 + 0.3, ph); }
  for (let k = 0; k < 21; k++) sbox(acc, 'litWarm', -8.6, 4.2 + k * 2.8, SB.point[2] - 0.04, 1.2, 0.08, 1.0, 0, { u: 1, v: 1, top: false });   // the stairwell's windows, one per landing
  // podezd 3: a steel door, a concrete canopy, a lamp, the house number
  const [dx, dz] = SB.door;
  sbox(acc, 'concrete', dx, 2.55, dz - 0.8, 2.8, 1.6, 0.18, 0, { u: 2, v: 1 });
  for (const s of [-1, 1]) { sbox(acc, 'iron', dx + s * 1.25, 0, dz - 1.45, 0.08, 0.08, 2.55, 0, { u: 1, v: 1, top: false }); sbSolid(dx + s * 1.25 - 0.06, dz - 1.51, dx + s * 1.25 + 0.06, dz - 1.39, 2.55); }
  sbox(acc, 'litWarm', dx, 2.47, dz - 0.8, 0.4, 0.4, 0.08, 0, { u: 1, v: 1 });
  sbLight(dx, 2.3, dz - 1.0, '#ffd8a0', 6, 1.3);
  plate(acc, 'blockSign', dx + 2.0, 2.1, dz, 0.9, 0.45, Math.PI, 0.03);
  // lock-up garages along the courtyard's east side; the Accords wall and its watchtower stand behind them
  const [gx0, gx1, gz0, gz1, gh] = SB.garages;
  sbox(acc, 'concrete', (gx0 + gx1) / 2, 0, (gz0 + gz1) / 2, gx1 - gx0, gz1 - gz0, gh, 0, { u: 6, v: gh, top: 'roofDark', tu: 4, faceKey: { l: 'garage' } });
  sbSolid(gx0, gz0, gx1, gz1, gh);
  ground(acc, 'asphaltK', gx1, gz0, -0.3, gz1 + 14, 0.002, 4);
  // the courtyard: packed dirt, paths, a sandpit, the rocket, swings, benches, laundry, a parked car
  ground(acc, 'dirt', cx0, cz0, cx1, cz1, 0, 4);
  ground(acc, 'asphaltK', ax0 + 0.2, cz0, ax1 - 0.2, cz1, 0.01, 4); ground(acc, 'asphaltK', ax1 - 0.2, cz1 - 3.5, dx + 1.4, cz1, 0.01, 4);
  ground(acc, 'sandpit', -15.5, 95.5, -12.5, 98.5, 0.06, 2);
  for (const [x, z, w, d] of [[-14, 95.4, 3.2, 0.2], [-14, 98.6, 3.2, 0.2], [-15.6, 97, 0.2, 3.2], [-12.4, 97, 0.2, 3.2]]) sbox(acc, 'darkwood', x, 0, z, w, d, 0.28, 0, { u: 1, v: 1 });
  sbSolid(-15.7, 95.3, -12.3, 98.7, 0.3);
  const rx = -27, rz = 104;   // the rocket climbing frame
  cyl(acc, 'padRed', rx, 0.3, rz, 0.8, 0.8, 2.8, 8, { u: 2, v: 2 }); cyl(acc, 'padRed', rx, 3.1, rz, 0.8, 0.05, 1.4, 8, { u: 2, v: 2 });
  for (let a = 0; a < 4; a++) { const t = a * Math.PI / 2; sbox(acc, 'padBlue', rx + Math.cos(t) * 0.9, 0, rz + Math.sin(t) * 0.9, 0.12, 0.12, 1.2, t, { u: 1, v: 1 }); }
  sbSolid(rx - 1.0, rz - 1.0, rx + 1.0, rz + 1.0, 4.5);
  const wx = -26, wz = 112;   // swings: two A-frames and a bar
  for (const s of [-1, 1]) { for (const t of [-0.5, 0.5]) sbox(acc, 'iron', wx + s * 1.6, 0, wz + t, 0.08, 0.08, 2.4, 0, { u: 1, v: 1, top: false }); sbSolid(wx + s * 1.6 - 0.1, wz - 0.6, wx + s * 1.6 + 0.1, wz + 0.6, 2.4); }
  sbox(acc, 'iron', wx, 2.4, wz, 3.4, 0.1, 0.1, 0, { u: 1, v: 1 });
  for (const s of [-0.7, 0.7]) { sbox(acc, 'iron', wx + s, 0.5, wz, 0.03, 0.03, 1.9, 0, { u: 1, v: 1, top: false }); sbox(acc, 'darkwood', wx + s, 0.45, wz, 0.5, 0.25, 0.06, 0, { u: 1, v: 1 }); }
  for (const [x, z] of [[-31.6, 99.5], [-11.2, 107]]) { sbox(acc, 'darkwood', x, 0, z, 0.5, 1.8, 0.45, 0, { u: 1, v: 1 }); sbSolid(x - 0.25, z - 0.9, x + 0.25, z + 0.9, 0.45); }
  for (const z of [102, 108]) { sbox(acc, 'iron', -33.2, 0, z, 0.08, 0.08, 2.3, 0, { u: 1, v: 1, top: false }); sbSolid(-33.3, z - 0.1, -33.1, z + 0.1, 2.3); }
  plate(acc, 'laundry', -33.2, 1.55, 105, 6, 1.5, -Math.PI / 2, 0, [0, 0, 1, 1], true);
  sbox(acc, 'carK', -29.5, 0, 116.2, 4.2, 1.6, 1.4, 0, { u: 4.2, v: 1.4, top: 'roofDark', tu: 4, faceKey: { l: 'carKEnd', r: 'carKEnd' } });
  sbSolid(-31.6, 115.4, -27.4, 117.0, 1.4);
  // sodium lamps: two on the forecourt, four in the courtyard
  sodiumPost(acc, -27, 80.5, 1); sodiumPost(acc, -6.2, 82.8, -1);
  for (const [x, z, d] of [[-33, 97, 1], [-9.1, 101, -1], [-33, 112.5, 1], [-9.1, 113, -1]]) sodiumPost(acc, x, z, d);
}
// called from buildStreet(): one mesh on the street atlas, light baked in
function buildSuperblock() {
  SBX.acc = new GeoAcc(); SBX.lamps = [];
  krasGate(SBX.acc); superblock14(SBX.acc);
  const L = CFG.street.light, F = CFG.street.fog;
  const near = ST.lamps.filter(l => l[0][2] > 50);
  const m = new THREE.Mesh(SBX.acc.geometry({ ambient: L.ambient, sky: L.sky, lights: SBX.lamps.concat(near) }), makeMat('street', { baked: true }));
  m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false;
  m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far };
  scene.add(m); SBX.mesh = m;
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
defineLevel('superblock', {
  menu: '3 · The gate & Superblock 14', cfg: () => CFG.superblock, build: buildSuperblock, outside: () => [SBX.mesh], rects: [SB.rect],
  start: (f) => startSuperblock(f),
  after: 'street', enter: () => player.head.z > STREET.chk.z + CFG.street.exitPast,          // on past the lifted boom
  finish: (z) => z > CFG.superblock.finishZ && Math.abs(player.head.x - SB.door[0]) < 3, wonSign: 'stairwell',
  signs: { krasnovia: ['KRASNOVIA', '#ff9a3c'], gate: ['FIGHT!', '#f2c14e'], courtyard: ['SUPERBLOCK 14', '#ff9a3c'], podezd: ['PODEZD 3', '#ff4f9a'], stairwell: ['INTO PODEZD 3', '#33e0d0'] },
  hud: { walk: 'Krasnovia — through the gate, through the arch', last: 'Walk up to podezd 3', won: 'Superblock 14 cleared — walk into podezd 3 (R to restart)', short: 'Superblock' },
});
