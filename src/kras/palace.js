'use strict';
// ============================== Act 1: the Palace of Sport ==================================
// Off the cradle onto the railway bank, through the gap in the fence: the level crossing's barriers are down, the bells
// ring and the evening electric comes out of the tunnel under the wall and thunders past. The barriers lift; across the
// tracks and up the Boulevard of Champions to the Palace: through the glass foyer, the gym (gymnasts, lifters), the
// players' tunnel, out onto the arena floor and Bogdan "the Bear" Volkov in the ring, the stands full. Out the north
// doors onto Parade Square (src/kras/parade.js). One flat floor all the way: no stairs (VR).
// World coordinates, like podezd 3 (src/kras/podezd.js).
CFG.palace = {
  start: [-40, 136.3],                          // "start here": in the gap in the railway fence, facing the crossing
  spawnGap: 1.1, clearedPause: 1.6, healBetween: 25,
  enrageAt: 0.5,                                // the Bear loses it below half his health
  finishZ: 251,                                 // walk out the north doors once he's down
  train: { warn: 1.8, speed: 17, cars: 4, carLen: 18, gap: 0.6, lift: 1.4, bell: 0.55, startX: -7.5, endX: -330 },
  encounters: [
    { name: 'boulevard', trigger: 157, arena: [151.6, 179.7], respawn: [-40, 152.6, 0, Math.PI], sign: 'boulevard',
      spawn: [['sambo', -45, 168], ['conscript', -35, 166.5], ['conscript', -40, 176], ['laborer', -46.5, 153]] },
    { name: 'gym', trigger: 191.4, arena: [190.3, 199.2], respawn: [-40, 190.9, 0, Math.PI], sign: 'gym',
      spawn: [['gymnast', -47.5, 197.5], ['gymnast', -32.5, 197], ['lifter', -40, 198.4], ['sambo', -46.5, 191.5]] },
    { name: 'volkov', trigger: 214.5, arena: [212.3, 239.7], respawn: [-40, 213.2, 0, Math.PI], sign: 'bear', boss: true,
      spawn: [['volkov', -40, 230]] },
  ],
  props: [['bin', -47.2, 172.6], ['crate', -33, 154.6], ['crate', -33.4, 155.4], ['sign', -46.8, 160], ['bin', -21.5, 177.5],
          ['bottle', -30.8, 188.6], ['crate', -49.2, 192], ['bottle', -31, 192.4], ['stool', -36.8, 232.8]],
  light: { inAmbient: [0.13, 0.12, 0.13], sodiumRadius: 14, sodiumK: 1.5, ring: '#fff4e0', ringRadius: 18, ringK: 2.2,
           flood: '#ffe8c8', floodRadius: 26, floodK: 1.5, stand: '#ffd8a0', standRadius: 11, standK: 0.8 },
};
const PL = {
  gap: [-42, -38],                                   // the fence gap, the crossing, both tunnels (x)
  fenceZ: 137.5, barS: 138.2, barN: 151.3, track: 143,
  portal: [-8, -1, 137.8, 151, 7], mouth: [138.2, 147.9, 5.5],   // the tunnel under the wall the trains come out of
  blvd: [-48, -32, 151.4, 174], fore: [-60, -20, 174, 180],
  annex: [-50, -30, 180, 201.5, 6], foyer: [-50, -30, 180, 190, 5.2], gym: [-50, -30, 190, 199.5, 6], doorW: [-43, -37],
  floor: [-52, -28, 212, 240], bank: { rows: 5, depth: 0.9, rise: 0.7, front: 1.1 }, roofY: 12, tunnelH: 3,
  drum: [-40, 226, 27, 17], ring: [-40, 229, 3.6],
  rect: [-74, -6, 151, 254], rail: [-178, -122, 129, 151],
  inMesh: null, outMesh: null, inLamps: [], outLamps: [], inTris: 0, outTris: 0, shutter: null,
};
PL.bowl = [PL.floor[0] - 4.5, PL.floor[1] + 4.5, PL.floor[2] - 4.5, PL.floor[3] + 4.5];   // the stands' back walls
PL.northZ = PL.drum[1] + PL.drum[2] * Math.cos(Math.PI / 24);                              // the drum's north door (z)
const TRAIN = { x: 0, phase: 'gone', t: 0, bellT: 0, open: true, lift: 1, cars: [], booms: [], lampA: null, lampB: null };
function plSolid(x0, z0, x1, z1, y0, y1) { WORLD_BOXES.push([x0, y0, z0, x1, y1, z1]); BLOCKERS.push({ x0, x1, z0, z1, y0, y1 }); }
function plLight(list, x, y, z, col, r, k) { const L = lightFromHex([x, y, z], col, r, k); list.push(L); return L; }
// a wall from (x0, z0) to (x1, z1) facing toward (tx, tz) (a direction)
function plFace(acc, key, x0, z0, x1, z1, y0, y1, tx, tz, um = 2, vm = 2.8, o) {
  if (-(z1 - z0) * tx + (x1 - x0) * tz < 0) wall(acc, key, x1, z1, x0, z0, y0, y1, um, vm, o); else wall(acc, key, x0, z0, x1, z1, y0, y1, um, vm, o);
}
function plCeil(acc, key, x0, z0, x1, z1, y, tile = 2) { aq(acc, key, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], [0, 0, (x1 - x0) / tile, (z1 - z0) / tile], [0, -1, 0], 3); }
function plPost(acc, list, x, z, dir) {   // a concrete post, a cobra-head arm, sodium orange (like Superblock 14's)
  const L = CFG.palace.light;
  sbox(acc, 'concrete', x, 0, z, 0.3, 0.3, 7.2, 0, { u: 1, v: 3.6, cell: 4 });
  sbox(acc, 'iron', x + dir * 0.9, 7.1, z, 1.9, 0.16, 0.12, 0, { u: 1, v: 1 });
  sbox(acc, 'sodiumHead', x + dir * 1.7, 6.85, z, 0.7, 0.35, 0.25, 0, { u: 0.7, v: 0.25 });
  plLight(list, x + dir * 1.7, 6.6, z, CFG.street.light.sodium, L.sodiumRadius, L.sodiumK);
  plSolid(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 0, 7.2);
}
function plTree(acc, x, z, h = 1) {   // a clipped poplar: trunk, a tapering crown with a flat underside
  cyl(acc, 'bark', x, 0, z, 0.2, 0.15, 2.4 * h, 5, { u: 1, v: 2.4 * h, cell: 99 });
  frustum(acc, 'tree', x, 1.9 * h, z, 2.4, 2.4, 0.7, 0.7, 4.2 * h, 0.4, { u: 2.4, v: 4.4 * h, top: 'tree', tu: 2.4, cell: 99 });
  const [a, b] = LP(x, z, 0.4, -1.2, -1.2), [c, d] = LP(x, z, 0.4, 1.2, -1.2), [e, f] = LP(x, z, 0.4, 1.2, 1.2), [g, k] = LP(x, z, 0.4, -1.2, 1.2), y = 1.9 * h;
  aq(acc, 'tree', [g, y, k], [e, y, f], [c, y, d], [a, y, b], [0, 0, 1, 1], [0, -1, 0], 3);
  plSolid(x - 0.25, z - 0.25, x + 0.25, z + 0.25, 0, 2.4 * h);
}
function plStatue(acc, x, z, phi, big = 1) {   // an invented athlete on a plinth, arms up, a gilt wreath held high
  const s = big, ph = 2.4 * s;
  sbox(acc, 'concrete', x, 0, z, 2.2 * s, 2.2 * s, ph, phi, { u: 2, v: 2, top: 'wallTop', tu: 1 });
  const S = (lx, ly, lz, w, d, h) => { const [cx, cz] = LP(x, z, phi, lx * s, lz * s); sbox(acc, 'stone', cx, ph + ly * s, cz, w * s, d * s, h * s, phi, { u: 1, v: 1 }); };
  S(-0.3, 0, -0.15, 0.38, 0.42, 1.5); S(0.3, 0, 0.2, 0.38, 0.42, 1.5);       // legs, mid-stride
  S(0, 1.45, 0, 1.0, 0.52, 1.25); S(0, 2.7, 0, 0.42, 0.42, 0.48);             // torso, head
  S(-0.68, 2.3, 0, 0.26, 0.26, 1.35); S(0.68, 2.3, 0, 0.26, 0.26, 1.35);      // arms, raised
  cyl(acc, 'gilt', x, ph + 3.62 * s, z, 0.85 * s, 0.85 * s, 0.16 * s, 10, { u: 1, v: 1 });
  plSolid(x - 1.1 * s, z - 1.1 * s, x + 1.1 * s, z + 1.1 * s, 0, ph);
}
// ---- outside: the crossing, the tunnel under the wall, the boulevard, the forecourt, the Palace's drum and its foyer annex
function buildPalaceOutside(acc) {
  const L = PL.outLamps, [g0, g1] = PL.gap, [rx0, rx1] = PL.rail;
  // the railway runs on west into the sector (podezd 3 draws the bank as far as x -122)
  ground(acc, 'asphaltK', rx0, 130, rx1, 151, 0, 8, { cell: 8 });
  for (const tz of [139.4, 143, 146.6]) aq(acc, 'track', [rx0, 0.012, tz + 1.2], [rx0, 0.012, tz - 1.2], [rx1, 0.012, tz - 1.2], [rx1, 0.012, tz + 1.2], [0, 0, 1, (rx1 - rx0) / 2], [0, 1, 0], 4);
  // the tunnel mouth under the wall: a concrete portal over all three tracks, black inside
  { const [px0, px1, pz0, pz1, ph] = PL.portal, [m0, m1, mh] = PL.mouth;
    sbox(acc, 'concrete', (px0 + px1) / 2, 0, (pz0 + m0) / 2, px1 - px0, m0 - pz0, ph, 0, { u: 4, v: 3.5, top: 'roofDark', tu: 4, cell: 4 });
    sbox(acc, 'concrete', (px0 + px1) / 2, 0, (m1 + pz1) / 2, px1 - px0, pz1 - m1, ph, 0, { u: 4, v: 3.5, top: 'roofDark', tu: 4, cell: 4 });
    sbox(acc, 'concrete', (px0 + px1) / 2, mh, (m0 + m1) / 2, px1 - px0, m1 - m0, ph - mh, 0, { u: 4, v: 1.5, top: 'roofDark', tu: 4, cell: 4 });
    aq(acc, 'concrete', [px0, mh, m1], [px0 + 3, mh, m1], [px0 + 3, mh, m0], [px0, mh, m0], [0, 0, 1, 3], [0, -1, 0], 3);
    plFace(acc, 'black', px0 + 3, m0, px0 + 3, m1, 0, mh, -1, 0, 1, 1);
    plate(acc, 'flag_kras', px0 - 0.05, mh + 0.8, (m0 + m1) / 2, 2.4, 1.4, -Math.PI / 2, 0.02);
    plSolid(px0, pz0, px1, pz1, 0, ph); }
  // the crossing: planks over the rails, a low fence along the north side of the bank, two posts with the X sign
  ground(acc, 'darkwood', g0, 138.3, g1, 150.9, 0.02, 2, { cell: 4 });
  for (const [a, b] of [[-74, g0], [g1, PL.portal[0]]]) { sbox(acc, 'concrete', (a + b) / 2, 0, 151.55, b - a, 0.3, 1.0, 0, { u: 6, v: 1, top: 'wallTop', tu: 6, cell: 6 }); plSolid(a, 151.4, b, 151.7, 0, 1.0); }
  for (const [x, z] of [[g1 + 0.45, PL.barS - 0.3], [g0 - 0.45, PL.barN + 0.3]]) {
    sbox(acc, 'iron', x, 0, z, 0.14, 0.14, 3.5, 0, { u: 1, v: 1 }); sbox(acc, 'iron', x, 0, z, 0.5, 0.5, 1.2, 0, { u: 1, v: 1 });
    plate(acc, 'crossSign', x, 3.15, z, 1.1, 1.1, 0, 0.09, [0, 0, 1, 1], true);
    sbox(acc, 'black', x, 2.25, z, 1.0, 0.12, 0.3, 0, { u: 1, v: 1 });
    plSolid(x - 0.25, z - 0.25, x + 0.25, z + 0.25, 0, 3.5);
  }
  // the boulevard of champions: paving, lawns, poplars, benches, sodium lamps, a champion on a plinth
  const [bx0, bx1, bz0, bz1] = PL.blvd, [fx0, fx1, fz0, fz1] = PL.fore;
  ground(acc, 'paving', bx0, bz0, bx1, bz1, 0.004, 4, { cell: 4 });
  ground(acc, 'dirt', -74, bz0, bx0, fz0, 0, 4, { cell: 8 }); ground(acc, 'dirt', bx1, bz0, -6, fz0, 0, 4, { cell: 8 });
  for (let z = 154; z < 173; z += 4.6) { plTree(acc, bx0 - 1.4, z); plTree(acc, bx1 + 1.4, z + 2.3); }
  for (let k = 0; k < 6; k++) { plTree(acc, -58 - (k % 2) * 6, 155 + k * 3.4, 1.2); plTree(acc, -20 + (k % 2) * 6, 156 + k * 3.2, 1.15); }
  for (const [x, z, d] of [[bx0 + 0.5, 159, 1], [bx1 - 0.5, 163.5, -1], [bx0 + 0.5, 170, 1]]) {
    sbox(acc, 'darkwood', x, 0.4, z, 0.5, 1.9, 0.08, 0, { u: 1, v: 1 }); sbox(acc, 'darkwood', x - d * 0.22, 0.45, z, 0.06, 1.9, 0.5, 0, { u: 1, v: 1 });
    for (const s of [-0.8, 0.8]) sbox(acc, 'iron', x, 0, z + s, 0.4, 0.06, 0.42, 0, { u: 1, v: 1 });
    plSolid(x - 0.3, z - 0.95, x + 0.3, z + 0.95, 0, 0.9);
  }
  plPost(acc, L, bx0 + 0.3, 156, 1); plPost(acc, L, bx1 - 0.3, 161, -1); plPost(acc, L, bx0 + 0.3, 167, 1); plPost(acc, L, bx1 - 0.3, 172, -1);
  plStatue(acc, -40, 164, Math.PI);   // facing you as you come up from the crossing, lit from below
  for (const s of [-1, 1]) { sbox(acc, 'litWarm', -40 + s * 1.5, 0, 161.6, 0.3, 0.3, 0.2, 0, { u: 1, v: 1 }); plLight(L, -40 + s * 1.5, 2.6, 161.2, '#ffe8c0', 7, 1.4); }
  // the forecourt: granite, flagpoles, the Bear on the hoardings, the Palace's sign over the foyer
  ground(acc, 'paving', fx0 - 4, fz0, fx1 + 4, fz1, 0.006, 4, { cell: 4 });
  // asphalt round the drum, never under a floor you can see from inside (the two would fight at the doors)
  for (const [a, b, c, d] of [[-74, -58, fz1, 253], [-22, -6, fz1, 253], [-58, PL.annex[0] - 0.2, fz1, 207], [PL.annex[1] + 0.2, -22, fz1, 207], [-58, g0 - 0.2, 245, 253], [g1 + 0.2, -22, 245, 253]])
    ground(acc, 'asphaltK', a, c, b, d, 0, 8, { cell: 8 });
  for (const x of [-58, -54, -26, -22]) { sbox(acc, 'iron', x, 0, 174.6, 0.1, 0.1, 9, 0, { u: 1, v: 1 }); plate(acc, 'flag_kras', x + 0.8, 8.2, 174.6, 1.5, 1.0, 0, 0, [0, 0, 1, 1], true); plSolid(x - 0.1, 174.5, x + 0.1, 174.7, 0, 9); }
  for (const [x, phi] of [[-61.5, Math.PI / 2], [-18.5, -Math.PI / 2]]) {
    for (const s of [-1.2, 1.2]) sbox(acc, 'iron', x, 0, 177 + s, 0.1, 0.1, 2.0, 0, { u: 1, v: 1, top: false });
    sbox(acc, 'darkwood', x, 2.0, 177, 0.12, 3.2, 2.6, 0, { u: 1, v: 1 });
    plate(acc, 'volkovPoster', x, 3.3, 177, 1.8, 2.4, phi, 0.08);
  }
  plPost(acc, L, -57, 178.6, 1); plPost(acc, L, -23, 178.6, -1);
  // the foyer annex: a glass front with the doors, concrete sides, a flat roof, the sign on top
  { const [ax0, ax1, az0, az1, ah] = PL.annex, [d0, d1] = PL.doorW;
    for (const [a, b, y0] of [[ax0, d0, 0], [d0, d1, 2.8], [d1, ax1, 0]]) plFace(acc, 'glassFront', a, az0, b, az0, y0, ah, 0, -1, 3, 3, { u0: (a - ax0) / 3 });
    plFace(acc, 'slabEnd', ax0, az0, ax0, az1, 0, ah, -1, 0, 4, 4); plFace(acc, 'slabEnd', ax1, az0, ax1, az1, 0, ah, 1, 0, 4, 4);
    ground(acc, 'roofDark', ax0, az0, ax1, az1, ah + 0.02, 4, { cell: 8 });
    sbox(acc, 'concrete', (ax0 + ax1) / 2, ah, az0 + 0.1, ax1 - ax0 + 0.4, 0.4, 0.5, 0, { u: 5, v: 1, top: 'wallTop', tu: 5, cell: 6 });
    sbox(acc, 'concrete', (d0 + d1) / 2, 2.9, az0 - 1.0, d1 - d0 + 2, 2.0, 0.22, 0, { u: 2, v: 1 });   // the canopy
    sbox(acc, 'litWarm', (d0 + d1) / 2, 2.82, az0 - 1.0, 1.2, 0.3, 0.08, 0, { u: 1, v: 1 });
    plLight(L, (d0 + d1) / 2, 2.6, az0 - 1.3, '#ffd8a0', 8, 1.3);
    for (const s of [-1, 1]) { sbox(acc, 'iron', (ax0 + ax1) / 2 + s * 5, ah + 0.5, az0 + 0.3, 0.1, 0.1, 1.4, 0, { u: 1, v: 1 }); }
    plate(acc, 'palaceSign', (ax0 + ax1) / 2, ah + 1.7, az0 + 0.3, 13, 1.75, Math.PI, 0.02);
    plSolid(ax0, az0, d0, az0 + 0.2, 0, ah); plSolid(d1, az0, ax1, az0 + 0.2, 0, ah); }
  // the drum: ribbed concrete, the lit window band, a red rim, a shallow cone of roof; the north doors onto the square
  { const [cx, cz, r, h] = PL.drum, n = 24, P = (a) => [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
    for (let i = 0; i < n; i++) {
      if (i === n / 2) continue;   // the south face: inside the foyer annex
      const am = Math.PI / 2 + i * 2 * Math.PI / n, [xa, za] = P(am + Math.PI / n), [xb, zb] = P(am - Math.PI / n);
      if (i === 0) {   // the north doors
        const [g0, g1] = PL.gap, y = PL.tunnelH;
        wall(acc, 'arenaWall', xa, za, g0, za, 0, h, 6, 20); wall(acc, 'arenaWall', g0, za, g1, zb, y, h, 6, 20, { u0: (g0 - xa) / 6 }); wall(acc, 'arenaWall', g1, za, xb, zb, 0, h, 6, 20, { u0: (g1 - xa) / 6 });
        sbox(acc, 'concrete', cx, y, za + 0.9, g1 - g0 + 1.6, 1.8, 0.2, 0, { u: 2, v: 1 });
        sbox(acc, 'litWarm', cx, y - 0.08, za + 0.9, 1, 0.3, 0.08, 0, { u: 1, v: 1 }); plLight(L, cx, y - 0.3, za + 1.2, '#ffd8a0', 7, 1.2);
        plate(acc, 'palaceSign', cx, y + 1.3, za, 8, 1.08, 0, 0.05);
      } else wall(acc, 'arenaWall', xa, za, xb, zb, 0, h, 6, 20, { u0: i * 0.37, cell: 6 });
    }
    cyl(acc, 'roofDark', cx, h, cz, r + 0.4, 9, 4, n, { cell: 99 }); cyl(acc, 'roofDark', cx, h + 4, cz, 9, 0.05, 1.0, 12, { cell: 99 });
    cyl(acc, 'banner', cx, h - 0.6, cz, r + 0.15, r + 0.15, 0.6, n, { u: 8, v: 4, cell: 99 });
    for (const a of [0.4, 0.95, 2.2, 2.75, 3.5, 4.1, 5.3, 5.9]) { const [x, z] = P(a); plLight(L, cx + Math.cos(a) * (r + 2.5), 5, cz + Math.sin(a) * (r + 2.5), CFG.street.light.sodium, 17, 1.6); sbox(acc, 'litSodium', x + Math.cos(a) * 0.2, 6, z + Math.sin(a) * 0.2, 0.5, 0.5, 0.3, 0, { u: 1, v: 1 }); }
  }
}
// ---- inside: the foyer, the gym, the tunnels, the bowl (floor, stands, roof, the ring under its lights)
// a bank of stands along one side of the floor: the edge runs (ax, az) → (bx, bz); (ox, oz) points away from the floor;
// gap = [u0, u1] along the edge left open for a tunnel; ends: cheek the two ends
function plBank(acc, ax, az, bx, bz, ox, oz, gap, ends) {
  const B = PL.bank, len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, D = B.rows * B.depth;
  const at = (u, d) => [ax + ux * u + ox * d, az + uz * u + oz * d];
  const top = (k) => B.front + k * B.rise;
  const cheek = (u, sx, sz) => { for (let k = 0; k < B.rows; k++) { const [x0, z0] = at(u, k * B.depth), [x1, z1] = at(u, (k + 1) * B.depth); plFace(acc, 'concrete', x0, z0, x1, z1, 0, top(k), sx, sz, 2, 2); } };
  for (const [a, b] of gap ? [[0, gap[0]], [gap[1], len]] : [[0, len]]) {
    const face = (key, d, y0, y1, um, vm) => { const [x0, z0] = at(a, d), [x1, z1] = at(b, d); plFace(acc, key, x0, z0, x1, z1, y0, y1, -ox, -oz, um, vm, { u0: a / um }); };
    face('arenaBoard', 0, 0, B.front, 4, B.front);
    for (let k = 0; k < B.rows; k++) {
      if (k > 0) face('crowd', k * B.depth, top(k - 1), top(k), 4, B.rise);
      const [x0, z0] = at(a, k * B.depth), [x1, z1] = at(b, (k + 1) * B.depth);
      ground(acc, 'concrete', Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1), top(k), 2, { cell: 4 });
    }
    const [x0, z0] = at(a, 0), [x1, z1] = at(b, D);
    plSolid(Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1), 0, top(B.rows - 1));
  }
  if (gap) { cheek(gap[0], ux, uz); cheek(gap[1], -ux, -uz); }
  if (ends) { cheek(0, -ux, -uz); cheek(len, ux, uz); }
}
function buildPalaceInside(acc) {
  const L = PL.inLamps, C = CFG.palace.light, [g0, g1] = PL.gap, [d0, d1] = PL.doorW, TH = PL.tunnelH;
  // ---- the foyer: terrazzo, the glass front from inside, ticket windows, the trophy cabinet, the Bear's posters
  { const [x0, x1, z0, z1, H] = PL.foyer;
    pzWalls(acc, 'sportWall', [x0, x1, z0 + 0.02, z1], 0, 3, { s: [[d0, d1, 2.8]], n: [[d0, d1, 2.8]] }); pzWalls(acc, 'creamWall', [x0, x1, z0 + 0.02, z1], 3, H - 3);
    pzFloorCeil(acc, [x0, x1, z0, z1], 0, H, 'paving');
    for (const z of [182.5, 185, 187.5]) plate(acc, 'ticketWin', x0, 1.4, z, 1.6, 1.6, Math.PI / 2, 0.02);
    sbox(acc, 'darkwood', x0 + 0.4, 0, 185, 0.8, 7.4, 1.0, 0, { u: 1, v: 1 }); plSolid(x0, 181.2, x0 + 0.8, 188.8, 0, 1.0);
    sbox(acc, 'trophy', x1 - 0.35, 0.3, 185, 0.7, 5, 2.4, 0, { u: 5, v: 2.4, top: 'darkwood', tu: 1 }); plSolid(x1 - 0.7, 182.5, x1, 187.5, 0, 2.7);
    for (const x of [-47, -33]) plate(acc, 'volkovPoster', x, 2.6, z1, 1.6, 2.1, Math.PI, 0.02);
    plate(acc, 'banner', -40, 4.1, z1, 1.2, 1.8, Math.PI, 0.02);
    for (const [x, z] of [[-45, 183.5], [-35, 183.5], [-40, 187.5]]) { sbox(acc, 'litWarm', x, H - 0.1, z, 0.5, 0.5, 0.1, 0, { u: 1, v: 1 }); plLight(L, x, H - 0.4, z, '#ffd8a0', 7.5, 1.2); } }
  // ---- the gym: sprung floor, wall bars, mats, a vaulting horse, a beam, rings, the barbells
  { const [x0, x1, z0, z1, H] = PL.gym;
    pzWalls(acc, 'sportWall', [x0, x1, z0, z1], 0, 3, { s: [[d0, d1, 2.8]], n: [[g0, g1, TH - 0.2]] }); pzWalls(acc, 'creamWall', [x0, x1, z0, z1], 3, H - 3);
    pzFloorCeil(acc, [x0, x1, z0, z1], 0, H, 'sportFloor');
    for (const [x, phi] of [[x0, Math.PI / 2], [x1, -Math.PI / 2]]) for (const z of [192, 194.8, 197.6]) plate(acc, 'wallBars', x, 1.5, z, 2.6, 2.8, phi, 0.06);
    for (const z of [192.4, 195.4, 198.2]) plate(acc, 'windowNight', x0, 4.4, z, 1.6, 1.6, Math.PI / 2, 0.02);
    for (const [a, b, c, d] of [[-48, -44, 191, 194], [-36, -32, 195.5, 198.6], [-47.6, -43.6, 196, 199]]) ground(acc, 'mat', a, c, b, d, 0.035, 2);
    sbox(acc, 'padRed', -40, 0.75, 194.6, 1.7, 0.45, 0.4, 0, { u: 1, v: 1 }); for (const sx of [-0.6, 0.6]) for (const sz of [-0.15, 0.15]) sbox(acc, 'iron', -40 + sx, 0, 194.6 + sz, 0.06, 0.06, 0.75, 0, { u: 1, v: 1, top: false });
    plSolid(-40.9, 194.3, -39.1, 194.9, 0, 1.15);
    sbox(acc, 'darkwood', -34, 1.0, 192.2, 4.6, 0.14, 0.14, 0, { u: 1, v: 1 }); for (const sx of [-2, 2]) sbox(acc, 'iron', -34 + sx, 0, 192.2, 0.08, 0.4, 1.0, 0, { u: 1, v: 1 });
    plSolid(-36.4, 192.05, -31.6, 192.35, 0, 1.14);
    for (const x of [-45.5, -44.6]) { sbox(acc, 'iron', x, 2.0, 193, 0.03, 0.03, H - 2.0, 0, { u: 1, v: 1, top: false, cell: 99 }); cyl(acc, 'darkwood', x, 1.85, 193, 0.14, 0.14, 0.12, 6, { u: 1, v: 1 }); }
    sbox(acc, 'iron', x1 - 0.5, 0.9, 191.2, 0.1, 1.9, 0.06, 0, { u: 1, v: 1 }); for (const s of [-0.85, 0.85]) cyl(acc, 'black', x1 - 0.5, 0.55, 191.2 + s, 0.22, 0.22, 0.7, 8, { u: 1, v: 1 });
    sbox(acc, 'iron', x1 - 0.5, 0, 191.2, 0.4, 1.4, 0.9, 0, { u: 1, v: 1 }); plSolid(x1 - 0.8, 190.3, x1, 192.1, 0, 1.0);
    for (const [x, z] of [[-45, 192.2], [-35, 192.2], [-45, 197.4], [-35, 197.4]]) { sbox(acc, 'fluor', x, H - 0.1, z, 2.6, 0.24, 0.1, 0, { u: 1, v: 1 }); plLight(L, x, H - 0.4, z, '#e8f4ff', 10, 1.4); } }
  // ---- the players' tunnel under the south stands: green dado, a bare bulb
  { const [z0, z1] = [PL.gym[3], PL.bowl[2]];
    plFace(acc, 'stairWall', g0, z0, g0, z1, 0, TH, 1, 0); plFace(acc, 'stairWall', g1, z0, g1, z1, 0, TH, -1, 0);
    ground(acc, 'stairFloor', g0, z0, g1, PL.floor[2], 0.004, 1.6); plCeil(acc, 'slabEnd', g0, z0, g1, z1, TH, 4);
    sbox(acc, 'litWarm', -40, TH - 0.1, (z0 + z1) / 2, 0.3, 0.3, 0.1, 0, { u: 1, v: 1 }); plLight(L, -40, TH - 0.3, (z0 + z1) / 2, '#ffd8a0', 6, 1.2); }
  // ---- out to the north doors, the same; a steel shutter until the Bear is down (its own little mesh)
  { const [z0, z1] = [PL.bowl[3], PL.northZ];
    plFace(acc, 'stairWall', g0, z0, g0, z1, 0, TH, 1, 0); plFace(acc, 'stairWall', g1, z0, g1, z1, 0, TH, -1, 0);
    ground(acc, 'stairFloor', g0, PL.floor[3], g1, z1, 0.004, 1.6); plCeil(acc, 'slabEnd', g0, z0, g1, z1, TH, 4);
    sbox(acc, 'litWarm', -40, TH - 0.1, (z0 + z1) / 2, 0.3, 0.3, 0.1, 0, { u: 1, v: 1 }); plLight(L, -40, TH - 0.3, (z0 + z1) / 2, '#ffd8a0', 6, 1.2); }
  // ---- the bowl: the sports floor, four banks of stands (full), the back walls, the roof
  const [fx0, fx1, fz0, fz1] = PL.floor, [wx0, wx1, wz0, wz1] = PL.bowl, R = PL.roofY, gu = [g0 - wx0, g1 - wx0];
  ground(acc, 'sportFloor', fx0, fz0, fx1, fz1, 0.004, 4, { cell: 4 });
  plBank(acc, wx0, fz0, wx1, fz0, 0, -1, gu, false); plBank(acc, wx0, fz1, wx1, fz1, 0, 1, gu, false);
  plBank(acc, fx0, fz0, fx0, fz1, -1, 0, null, true); plBank(acc, fx1, fz0, fx1, fz1, 1, 0, null, true);
  for (const [z, s] of [[wz0, 1], [wz1, -1]]) for (const [a, b, y0] of [[wx0, g0, 0], [g0, g1, TH], [g1, wx1, 0]]) plFace(acc, 'slabEnd', a, z, b, z, y0, R, 0, s, 4, 4);
  plFace(acc, 'slabEnd', wx0, wz0, wx0, wz1, 0, R, 1, 0, 4, 4); plFace(acc, 'slabEnd', wx1, wz0, wx1, wz1, 0, R, -1, 0, 4, 4);
  plCeil(acc, 'roofDark', wx0, wz0, wx1, wz1, R, 8);
  // banners and flags round the back walls, the Bear over the north tunnel
  for (const x of [-52, -46, -34, -28]) { plate(acc, 'banner', x, 7.6, wz0, 1.6, 4.2, 0, 0.03); plate(acc, 'banner', x, 7.6, wz1, 1.6, 4.2, Math.PI, 0.03); }
  for (const z of [218, 226, 234]) { plate(acc, 'flag_kras', wx0, 7.4, z, 3.6, 2.4, Math.PI / 2, 0.03); plate(acc, 'flag_kras', wx1, 7.4, z, 3.6, 2.4, -Math.PI / 2, 0.03); }
  plate(acc, 'volkovPoster', -40, 6.6, wz1, 3.0, 4.0, Math.PI, 0.04);
  plate(acc, 'palaceSign', -40, 5.4, wz0, 8, 1.08, 0, 0.04);
  // the lighting rig: a truss over the floor, floods at its corners, the scoreboard, the ring's lamps
  const [rx, rz, rs] = PL.ring, ty = 9.4;
  for (const [a, b, c, d] of [[-50, -30, 215, 215], [-50, -30, 237, 237], [-50, -50, 215, 237], [-30, -30, 215, 237]]) sbox(acc, 'iron', (a + b) / 2, ty, (c + d) / 2, Math.max(0.3, b - a), Math.max(0.3, d - c), 0.3, 0, { u: 1, v: 1 });
  for (const [x, z] of [[-50, 215], [-30, 215], [-50, 237], [-30, 237], [-50, 226], [-30, 226]]) { sbox(acc, 'iron', x, ty + 0.3, z, 0.05, 0.05, R - ty - 0.3, 0, { u: 1, v: 1, top: false, cell: 99 }); sbox(acc, 'flood', x, ty - 0.45, z, 0.8, 0.8, 0.45, 0, { u: 0.8, v: 0.45, top: 'iron' }); plLight(L, x, ty - 0.8, z, C.flood, C.floodRadius, C.floodK); }
  sbox(acc, 'scoreboard', -40, 8.6, 222, 3.6, 3.6, 2.0, 0, { u: 3.6, v: 2.0, top: 'iron' }); sbox(acc, 'iron', -40, 10.6, 222, 0.08, 0.08, R - 10.6, 0, { u: 1, v: 1, top: false, cell: 99 });
  sbox(acc, 'iron', rx, 7.6, rz, rs * 2, rs * 2, 0.16, 0, { u: 1, v: 1 }); sbox(acc, 'iron', rx, 7.76, rz, 0.06, 0.06, R - 7.76, 0, { u: 1, v: 1, top: false, cell: 99 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) sbox(acc, 'flood', rx + sx * rs * 0.7, 7.25, rz + sz * rs * 0.7, 0.6, 0.6, 0.35, 0, { u: 0.6, v: 0.35, top: 'iron' });
  plLight(L, rx, 6.9, rz, C.ring, C.ringRadius, C.ringK);
  for (const z of [216, 236]) plLight(L, -40, 7, z, C.flood, 15, 0.9);   // a wash over the floor at either end
  for (const [x, z] of [[-48, wz0 + 1.2], [-32, wz0 + 1.2], [-48, wz1 - 1.2], [-32, wz1 - 1.2], [wx0 + 1.2, 226], [wx1 - 1.2, 226]]) plLight(L, x, 8.5, z, C.stand, C.standRadius, C.standK);
  // the ring: canvas on the floor, red/blue corners, three ropes (open on the side you come in from)
  ground(acc, 'canvas', rx - rs, rz - rs, rx + rs, rz + rs, 0.02, 2);
  for (const [cx, cz, k] of [[-rs, -rs, 'padRed'], [rs, -rs, 'padBlue'], [-rs, rs, 'padBlue'], [rs, rs, 'padRed']]) {
    sbox(acc, 'iron', rx + cx, 0, rz + cz, 0.14, 0.14, 1.5, 0, { u: 1, v: 1 }); sbox(acc, k, rx + cx, 0.5, rz + cz, 0.26, 0.26, 0.9, 0, { u: 1, v: 1 });
    plSolid(rx + cx - 0.12, rz + cz - 0.12, rx + cx + 0.12, rz + cz + 0.12, 0, 1.5);
  }
  for (const y of [0.55, 0.95, 1.35]) for (const [a, b] of [[[-rs, rs], [rs, rs]], [[-rs, -rs], [-rs, rs]], [[rs, -rs], [rs, rs]]]) {
    const x0 = rx + a[0], z0 = rz + a[1], x1 = rx + b[0], z1 = rz + b[1];
    sbox(acc, 'rope', (x0 + x1) / 2, y, (z0 + z1) / 2, Math.abs(x1 - x0) + 0.04, Math.abs(z1 - z0) + 0.04, 0.04, 0, { u: 8, v: 1, cell: 99 });
  }
  // the judges' table by the ring
  sbox(acc, 'darkwood', -47.5, 0, 229, 0.9, 3.2, 0.8, 0, { u: 1, v: 1 }); plSolid(-47.95, 227.4, -47.05, 230.6, 0, 0.8);
  sbox(acc, 'gilt', -47.5, 0.8, 228.2, 0.2, 0.2, 0.3, 0, { u: 1, v: 1 });
}
function buildTrain() {   // four cars of the evening electric, each its own small mesh (they come out of the tunnel one by one)
  const T = CFG.palace.train;
  for (let i = 0; i < T.cars; i++) {
    const acc = new GeoAcc(), last = i === T.cars - 1, W = 1.6;
    sbox(acc, 'trainSide', T.carLen / 2, 0.45, 0, T.carLen, W * 2, 3.8, 0, { u: T.carLen, v: 3.8, top: 'roofDark', tu: 4, skip: 'lr' });
    if (i === 0) wall(acc, 'trainFront', 0, -W, 0, W, 0.45, 4.25, W * 2, 3.8);
    if (last) wall(acc, 'trainFront', T.carLen, W, T.carLen, -W, 0.45, 4.25, W * 2, 3.8);
    else sbox(acc, 'black', T.carLen + T.gap / 2, 0.6, 0, T.gap + 0.1, 2.4, 3.3, 0, { u: 1, v: 1 });
    for (const bx of [3, T.carLen - 3]) sbox(acc, 'black', bx, 0, 0, 2.6, 2.6, 0.48, 0, { u: 1, v: 1 });
    if (i === 0) { sbox(acc, 'iron', 4, 4.25, 0, 1.6, 0.08, 0.6, 0, { u: 1, v: 1 }); sbox(acc, 'iron', 4, 4.85, 0, 0.08, 1.8, 0.06, 0, { u: 1, v: 1 }); }
    const m = new THREE.Mesh(acc.geometry({ ambient: [0.42, 0.4, 0.4], lights: [] }), makeMat('street', { baked: true }));
    m.frustumCulled = false; m.visible = false; m.userData.off = i * (T.carLen + T.gap); m.userData.small = true;
    const F = CFG.street.fog; m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far };
    scene.add(m); TRAIN.cars.push(m);
  }
  // the barriers (an arm on a pivot each: the south one swings up from the east post, the north one from the west) and
  // the red lamps that wig-wag while they're down
  for (const [x, z, flip] of [[PL.gap[1] + 0.45, PL.barS, 0], [PL.gap[0] - 0.45, PL.barN, Math.PI]]) {
    const acc = new GeoAcc(); sbox(acc, 'boom', -2.3, -0.07, 0, 4.4, 0.12, 0.14, 0, { u: 2, v: 0.14 });
    const arm = new THREE.Mesh(acc.geometry({ ambient: [0.55, 0.5, 0.48], lights: [] }), makeMat('street', { baked: true })); arm.frustumCulled = false;
    const pivot = new THREE.Group(), base = new THREE.Group(); pivot.add(arm); base.add(pivot);
    base.position.set(x, 1.05, z); base.rotation.y = flip; scene.add(base); TRAIN.booms.push({ base, pivot });
  }
  const lamps = (side) => {
    const acc = new GeoAcc();
    for (const [x, z] of [[PL.gap[1] + 0.45, PL.barS - 0.3], [PL.gap[0] - 0.45, PL.barN + 0.3]]) for (const dz of [-0.08, 0.08]) sbox(acc, 'litRed', x + side * 0.38, 2.12, z + dz, 0.22, 0.04, 0.26, 0, { u: 1, v: 1 });
    const m = new THREE.Mesh(acc.geometry({ ambient: [1, 1, 1], lights: [] }), makeMat('street', { baked: true })); m.frustumCulled = false; m.visible = false; m.userData.small = true; scene.add(m); return m;
  };
  TRAIN.lampA = lamps(-1); TRAIN.lampB = lamps(1);
  const sh = new GeoAcc(); plFace(sh, 'gate', PL.gap[0], PL.bowl[3] + 0.3, PL.gap[1], PL.bowl[3] + 0.3, 0, PL.tunnelH, 0, -1, 2, 1.5); plFace(sh, 'gate', PL.gap[0], PL.bowl[3] + 0.32, PL.gap[1], PL.bowl[3] + 0.32, 0, PL.tunnelH, 0, 1, 2, 1.5);
  PL.shutter = new THREE.Mesh(sh.geometry({ ambient: [0.5, 0.48, 0.46], lights: [] }), makeMat('street', { baked: true })); PL.shutter.frustumCulled = false; PL.shutter.visible = false; PL.shutter.userData.small = true; scene.add(PL.shutter);
  resetTrain('gone');
}
// called from buildStreet(): the inside (one baked mesh, drawn as a room), the outside (one baked mesh), the train and barriers
function buildPalace() {
  PL.inLamps = []; PL.outLamps = [];
  const inAcc = new GeoAcc(), outAcc = new GeoAcc();
  buildPalaceInside(inAcc); buildPalaceOutside(outAcc);
  const F = CFG.street.fog, Lt = CFG.street.light;
  const mk = (acc, light) => { const m = new THREE.Mesh(acc.geometry(light), makeMat('street', { baked: true })); m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false; m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far }; scene.add(m); return m; };
  PL.inMesh = mk(inAcc, { ambient: CFG.palace.light.inAmbient, lights: PL.inLamps }); PL.inTris = inAcc.tris;
  PL.outMesh = mk(outAcc, { ambient: Lt.ambient, sky: Lt.sky, lights: PL.outLamps.concat(SBX.lamps.filter(l => l[0][2] > 128)) }); PL.outTris = outAcc.tris;
  for (const l of PL.inLamps.concat(PL.outLamps)) ST.lamps.push(l);
  buildTrain();
  // where you can walk: the gap in the fence, the crossing (once the train's by), the boulevard, the forecourt, the foyer,
  // the gym, the tunnel, the arena floor, the way out north (once the Bear's down)
  const on = () => level.name === 'palace', P = 0.3, [g0, g1] = PL.gap, [d0, d1] = PL.doorW;
  const [bx0, bx1, bz0, bz1] = PL.blvd, [fx0, fx1, fz0, fz1] = PL.fore, F2 = PL.floor;
  [ { x0: g0 + 0.3, x1: g1 - 0.3, z0: 135.6, z1: PL.barS - 0.3, pad: P, area: 'plGap', on: () => (level.name === 'podezd' && CRADLE.phase === 'bottom') || on() },
    { x0: g0 + 0.3, x1: g1 - 0.3, z0: PL.barS - 0.4, z1: PL.barN + 0.4, pad: P, area: 'plCross', on: () => on() && TRAIN.open },
    { x0: bx0, x1: bx1, z0: bz0 + 0.3, z1: bz1 + 0.3, pad: P, area: 'plBlvd', on },
    { x0: fx0, x1: fx1, z0: fz0, z1: fz1 - 0.3, pad: P, area: 'plFore', on },
    { x0: d0 + 0.3, x1: d1 - 0.3, z0: fz1 - 0.5, z1: fz1 + 0.5, pad: P, area: 'plDoor', on },
    { x0: PL.foyer[0] + 0.3, x1: PL.foyer[1] - 0.3, z0: PL.foyer[2] + 0.3, z1: PL.foyer[3] - 0.3, pad: P, area: 'plFoyer', on },
    { x0: d0 + 0.3, x1: d1 - 0.3, z0: PL.foyer[3] - 0.5, z1: PL.foyer[3] + 0.5, pad: P, area: 'plGymDoor', on },
    { x0: PL.gym[0] + 0.3, x1: PL.gym[1] - 0.3, z0: PL.gym[2] + 0.3, z1: PL.gym[3] - 0.3, pad: P, area: 'plGym', on },
    { x0: g0 + 0.3, x1: g1 - 0.3, z0: PL.gym[3] - 0.5, z1: F2[2] + 0.5, pad: P, area: 'plTunnel', on },
    { x0: F2[0] + 0.25, x1: F2[1] - 0.25, z0: F2[2] + 0.25, z1: F2[3] - 0.25, pad: P, area: 'plFloor', on },
    { x0: g0 + 0.3, x1: g1 - 0.3, z0: F2[3] - 0.5, z1: PL.northZ + 1.2, pad: P, area: 'plNorth', on: () => level.name === 'parade' || (on() && palaceNorthOpen()) },
  ].forEach(addWalk);
}
const palaceNorthOpen = () => level.encounter >= CFG.palace.encounters.length - 1 && (game.state === 'walk' || game.state === 'won' || game.state === 'cleared');
const inPalace = (p) => p.y < PL.roofY + 1 && ((p.x > PL.annex[0] - 0.3 && p.x < PL.annex[1] + 0.3 && p.z > PL.foyer[2] + 0.02 && p.z < PL.gym[3])
  || (p.x > PL.bowl[0] - 0.3 && p.x < PL.bowl[1] + 0.3 && p.z >= PL.gym[3] && p.z < PL.northZ));
function palaceRooms() {
  addRoom('palace', inPalace);
  roomMeshes('palace', PL.inMesh);
  addPortal('outside', 'palace', [-40, 1.3, PL.foyer[2]]);
  addPortal('outside', 'palace', [-40, 1.3, PL.northZ], () => level.name !== 'palace' || palaceNorthOpen());   // shut while the shutter's down
}
// ---- the crossing: warn (bells, lamps, barriers down) → the train runs → the barriers lift → open
function resetTrain(state) {
  const T = CFG.palace.train;
  TRAIN.phase = state; TRAIN.t = 0; TRAIN.bellT = 0; TRAIN.x = T.startX;
  TRAIN.open = state === 'gone'; TRAIN.lift = state === 'gone' ? 1 : 0;
  placeTrain();
}
function placeTrain() {
  const T = CFG.palace.train, here = level.name === 'palace';
  for (const m of TRAIN.cars) { const x = TRAIN.x + m.userData.off; m.position.set(x, 0, PL.track); m.visible = here && TRAIN.phase !== 'gone' && TRAIN.phase !== 'warn' && x < T.startX + 0.5 && x > T.endX; m.updateMatrixWorld(true); }
  for (const B of TRAIN.booms) { B.pivot.rotation.z = -1.35 * TRAIN.lift; B.base.updateMatrixWorld(true); }
  const blink = !TRAIN.open && Math.floor(TRAIN.t * 2.4) % 2 === 0;
  TRAIN.lampA.visible = !TRAIN.open && blink; TRAIN.lampB.visible = !TRAIN.open && !blink;
  if (PL.shutter) PL.shutter.visible = here && !palaceNorthOpen();
}
function updatePalace(dt) {
  const T = CFG.palace.train, P = TRAIN;
  P.t += dt;
  if (P.phase === 'warn' || P.phase === 'run') { if ((P.bellT -= dt) <= 0) { P.bellT = T.bell; if (AU.tone) AU.tone('square', 1180, 1170, 0.12, 0.08); } }
  if (P.phase === 'warn' && P.t > T.warn) { P.phase = 'run'; if (AU.noise) AU.noise(2.4, 0.22, 260); }
  if (P.phase === 'run' || P.phase === 'lift' || P.phase === 'open') P.x = Math.max(T.endX - 80, P.x - T.speed * dt);
  const tail = P.x + T.cars * (T.carLen + T.gap);
  if (P.phase === 'run' && tail < PL.gap[0] - 3) { P.phase = 'lift'; P.t = 0; }
  if (P.phase === 'lift') { P.lift = Math.min(1, P.t / T.lift); if (P.lift >= 1) { P.phase = 'open'; P.open = true; showSign('palace', 2.2); } }
  placeTrain();
}
defineLevel('palace', {
  menu: '5 · The Palace of Sport (Volkov)', cfg: () => CFG.palace, build: buildPalace, rooms: palaceRooms,
  outside: () => [PL.outMesh, ...TRAIN.booms.map(B => B.base)], rects: [PL.rect, PL.rail],
  start: (f) => startPalace(f), update: (dt) => updatePalace(dt),
  after: 'podezd', enter: () => player.head.z > PL.fenceZ + 0.2 && Math.abs(player.head.x + 40) < 2.2,   // through the gap in the fence
  finish: () => player.head.z > CFG.palace.finishZ && Math.abs(player.head.x + 40) < 2.2, wonSign: 'toParade',
  signs: { crossing: ['LEVEL CROSSING', '#e8352b'], palace: ['PALACE OF SPORT', '#ff9a3c'], boulevard: ['FIGHT!', '#f2c14e'], gym: ['THE GYM', '#f2c14e'],
           bear: ['BOGDAN VOLKOV, THE BEAR', '#e8352b'], toParade: ['TO PARADE SQUARE', '#33e0d0'] },
  hud: { walk: 'The Palace of Sport — up the boulevard', last: 'The Bear is down — out the north doors', won: 'Out the north doors to Parade Square (R to restart)', short: 'Palace' },
});
function startPalace(fromPodezd) {
  level.name = 'palace'; level.encounter = -1; level.arena = null; LOCKED.clear();
  clearEnemies(); resetTrain('warn');
  const held = new Set(handList.map(h => h.held));
  if (!fromPodezd) { DOOR.target = 1; DOOR.open = 1; player.hp = CFG.player.health; player.hurtT = 0; game.catches = 0; game.disarms = 0; }
  for (const p of props.slice()) if (!held.has(p)) { scene.remove(p.obj); p.body.remove(); p.alive = false; props.splice(props.indexOf(p), 1); }
  for (const [type, x, z, y] of CFG.palace.props) new Prop(type, new V3(x, y || 0, z));
  if (!fromPodezd) { placePlayer(CFG.palace.start[0], CFG.palace.start[1], Math.PI); rig.position.y = 0; }
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  showSign('crossing', 2.0);
}
