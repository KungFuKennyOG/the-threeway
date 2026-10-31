'use strict';
// ============================== Act 1: the Palace of Sport ==================================
// Off the cradle onto the railway bank, through the gap in the fence: the level crossing's barriers are down, the bells
// ring and the evening electric comes out of the tunnel under the wall and thunders past. The barriers lift; across the
// tracks and up the Boulevard of Champions to the Palace: through the glass foyer, the gym (gymnasts, lifters), the
// players' tunnel, out onto the arena floor and Bogdan "the Bear" Volkov in the ring, the stands full. Out the north
// doors onto Parade Square (src/kras/parade.js). One flat floor all the way: no stairs (VR).
// The crossing and Station Square north of the tracks are in world coordinates, like podezd 3 (src/kras/podezd.js); from
// the boulevard on, everything is authored running +z along local x -40 and laid into the world running west, into the
// sector, by the ACT1_WEST frame (src/levels.js): CFG.palace.encounters, props and finishZ are in its coordinates.
CFG.palace = {
  start: [-40, 136.3],                          // "start here": in the gap in the railway fence, facing the crossing (world)
  spawnGap: 1.1, clearedPause: 1.6, healBetween: 25,
  enrageAt: 0.5,                                // the Bear loses it below half his health
  finishZ: 251,                                 // walk out the north doors once he's down
  train: { warn: 1.8, speed: 17, cars: 4, carLen: 18, gap: 0.6, lift: 1.4, bell: 0.55, startX: -7.5, endX: -330 },
  encounters: [
    { name: 'boulevard', trigger: 157, arena: [151.6, 179.7], respawn: [-40, 152.6, 0, Math.PI], sign: 'boulevard',
      spawn: [['sambo', -45, 168], ['conscript', -35, 166.5], ['conscript', -40, 176], ['laborer', -46.5, 153]] },
    { name: 'gym', trigger: 191.4, arena: [190.3, 199.2], respawn: [-40, 190.9, 0, Math.PI], sign: 'gym',
      spawn: [['gymnast', -47.5, 197.5], ['gymnast', -32.5, 197], ['lifter', -40, 198.4], ['sambo', -46.5, 191.5]] },
    { name: 'volkov', trigger: 212.6, arena: [210.9, 241.1], respawn: [-40, 211.6, 0, Math.PI], sign: 'bear', boss: true,
      spawn: [['volkov', -40, 227.6]] },
  ],
  props: [['bin', -47.2, 172.6], ['crate', -33, 154.6], ['crate', -33.4, 155.4], ['sign', -46.8, 160], ['bin', -21.5, 177.5],
          ['bottle', -30.8, 188.6], ['crate', -49.2, 192], ['bottle', -31, 192.4], ['stool', -35.7, 230.3]],
  light: { inAmbient: [0.1, 0.095, 0.105], sodiumRadius: 14, sodiumK: 1.5, ring: '#fff4e0', ringRadius: 12, ringK: 4,
           flood: '#ffe8c8', floodRadius: 12, floodK: 1.1, stand: '#ffd8a0', standRadius: 9, standK: 0.8 },
};
const PL = {
  gap: [-42, -38],                                   // the fence gap, the crossing, both tunnels (x)
  fenceZ: 137.5, barS: 138.2, barN: 151.3, track: 143,
  portal: [-8, -1, 137.8, 151, 7], mouth: [138.2, 147.9, 5.5],   // the tunnel under the wall the trains come out of
  blvd: [-48, -32, 151.4, 174], fore: [-60, -20, 174, 180],
  annex: [-50, -30, 180, 201.5, 10.6], foyer: [-50, -30, 180, 190, 5.2], gym: [-50, -30, 190, 199.5, 6], doorW: [-43, -37],
  // the bowl inside the drum: a 24-sided floor (corner radius floorR), a ring of stands round it (a vomitory through them
  // south and north), the round back wall up to wallTop, a saucer ceiling up to roofY
  bowlC: [-40, 226], sides: 24, floorR: 15.4, bank: { rows: 7, depth: 0.9, rise: 0.7, front: 1.1 }, wallTop: 10, roofY: 15.3, tunnelH: 3,
  drum: [-40, 226, 27, 10.6], ring: [-40, 226, 3.6],  // the drum: centre, radius, height to the cornice
  rect: [-74, -6, 151, 254], rail: [-178, -122, 129, 151],      // rect: the boulevard to the north doors (local); rail: world
  // world: Station Square north of the crossing (you turn west there onto the boulevard), East Station on its east side
  square: [-56, -22, 151.7, 214], station: [-22, -7, 158, 206], sqRect: [-58, -4, 151.4, 216],
  yard: [-157.6, -56, 151.7, 164],   // world: the goods yard north of the tracks, west of the square (low: the Tower shows over it from the crossing)
  crossMesh: null, crossLamps: [], crossTris: 0,
  inMesh: null, outMesh: null, inLamps: [], outLamps: [], inTris: 0, outTris: 0, shutter: null,
};
PL.backR = PL.floorR + PL.bank.rows * PL.bank.depth;                                       // the stands' back wall (corner radius)
{ const [cx, cz] = PL.bowlC, c = Math.cos(Math.PI / PL.sides), f = PL.floorR * c, b = PL.backR * c;
  PL.floor = [cx - f, cx + f, cz - f, cz + f];   // the round floor's bounding box
  PL.bowl = [cx - b, cx + b, cz - b, cz + b]; }  // the back wall's (the vomitories end at bowl[2] and bowl[3])
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
// ---- outside (local, in the ACT1_WEST frame): the boulevard, the forecourt, the Palace's drum and its foyer annex
function buildPalaceOutside(acc) {
  const L = PL.outLamps, [g0, g1] = PL.gap;
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
  // ---- the Palace itself: a broad, low cream bowl (two storeys of pilasters with tall warm glass between, a heavy cornice,
  // a plain attic with a ring of flags, a low metal saucer of roof) and a columned portico on the south over the doors
  const [cx, cz, R, H1] = PL.drum, n = PL.sides, UP = '#ffe2b0', H2 = H1 + 0.7, H3 = H2 + 1.9;
  const ang = (i) => -Math.PI / 2 + (i - 0.5) * 2 * Math.PI / n, at = (r, a) => [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
  const inAnnex = (x, z, m = 0.4) => x > PL.annex[0] - m && x < PL.annex[1] + m && z < PL.annex[3] + m;
  const band = (key, i, r0, y0, r1, y1, uv, down) => {   // one segment of a ring band (r0, y0) → (r1, y1), facing out (or down)
    const a0 = ang(i), a1 = ang(i + 1), am = (a0 + a1) / 2, [xa, za] = at(r0, a1), [xb, zb] = at(r0, a0), [xc, zc] = at(r1, a0), [xd, zd] = at(r1, a1);
    const flat = y1 === y0, nr = down || flat ? 0 : y1 - y0, ny = down ? -1 : flat ? 1 : r0 - r1;
    aq(acc, key, [xd, y1, zd], [xc, y1, zc], [xb, y0, zb], [xa, y0, za], uv || [0, 0, 1, 1], [nr * Math.cos(am), ny, nr * Math.sin(am)], 99);
  };
  { const [g0, g1] = PL.gap, TH = PL.tunnelH;
    for (let i = 0; i < n; i++) {
      const hid = i === 1 || i === n - 1;   // inside the annex (they'd poke into the gym): only their cornice and attic show
      const [xa, za] = at(R, ang(i + 1)), [xb, zb] = at(R, ang(i)), len = Math.hypot(xb - xa, zb - za), um = len / 2;
      if (i === n / 2) {   // the north doors onto the square: a doorway through the lower storey, a canopy, a lit sign
        for (const [a, b, door] of [[xa, g0, 0], [g0, g1, 1], [g1, xb, 0]]) {
          if (!door) wall(acc, 'stone', a, za, b, zb, 0, 1, 2, 1, { cell: 99 });
          wall(acc, 'plFacade', a, za, b, zb, door ? TH : 1, H1, um, H1 - 1, { u0: (a - xa) / um, cell: 99 });
        }
        sbox(acc, 'plCornice', cx, TH, za + 1.1, g1 - g0 + 2.4, 2.2, 0.3, 0, { u: 2, v: 0.3, top: 'plAttic', tu: 2 });
        sbox(acc, 'litWarm', cx, TH - 0.06, za + 1.1, 1.2, 0.3, 0.06, 0, { u: 1, v: 1 }); plLight(L, cx, TH - 0.4, za + 1.4, '#ffd8a0', 7, 1.3);
        plate(acc, 'palaceSign', cx, TH + 0.8, za, 7, 0.94, 0, 0.05);
      } else if (i !== 0 && !hid) {
        wall(acc, 'stone', xa, za, xb, zb, 0, 1, 2, 1, { cell: 99 });
        wall(acc, 'plFacade', xa, za, xb, zb, 1, H1, um, H1 - 1, { cell: 99 });
        band('paving', i, R, 0.008, R + 3.2, 0.008, [0, 0, len / 4, 0.8]);   // a granite apron, warm from the uplights
      }
      band('plAttic', i, R, H1, R + 0.6, H1, [0, 0, 2, 0.2], true);                // the cornice's soffit
      band('plCornice', i, R + 0.6, H1, R + 1.2, H2, [0, 0, len / 2, 1]);           // the cornice, leaning out
      band('plAttic', i, R + 0.15, H2, R + 0.15, H3, [0, 0, len / 3, 1]);           // the attic
      band('plRoofM', i, R + 0.15, H3, 17, H3 + 2.0, [0, 0, 2, 2]); band('plRoofM', i, 17, H3 + 2.0, 7, H3 + 3.5, [0, 0, 1, 2]); band('plRoofM', i, 7, H3 + 3.5, 0.05, H3 + 3.8, [0, 0, 1, 1]);
      // a flag on the attic at every corner
      { const a = ang(i), [px, pz] = at(R - 0.3, a), phi = Math.PI / 2 - a, [fx, fz] = LP(px, pz, phi, 0.95, 0);
        sbox(acc, 'iron', px, H3, pz, 0.09, 0.09, 4.4, 0, { u: 1, v: 1, top: false, cell: 99 }); plate(acc, 'flag_kras', fx, H3 + 3.7, fz, 1.8, 1.2, phi, 0, [0, 0, 1, 1], true); }
    }
    // the pilasters: one at every corner and mid-face, two storeys each, uplit from the ground (every corner one)
    for (let k = 0; k < 2 * n; k++) {
      const a = ang(0) + k * Math.PI / n, r = (k % 2 ? R * Math.cos(Math.PI / n) : R) + 0.25, [x, z] = at(r, a);
      if (inAnnex(x, z) || (Math.abs(x - cx) < 3 && z > cz)) continue;
      sbox(acc, 'plPilaster', x, 1, z, 0.75, 0.5, H1 - 1, Math.PI / 2 - a, { u: 0.75, v: (H1 - 1) / 2, top: false, skip: 'b', cell: 99 });
      if (k % 2 === 0) { const [lx, lz] = at(r + 0.75, a); aq(acc, 'litWarm', [lx - 0.15, 0.03, lz + 0.15], [lx + 0.15, 0.03, lz + 0.15], [lx + 0.15, 0.03, lz - 0.15], [lx - 0.15, 0.03, lz - 0.15], [0, 0, 1, 1], [0, 1, 0], 99); plLight(L, lx, 0.35, lz, UP, 7.5, 1.7); }
    }
  }
  // ---- the portico over the doors: six columns, an entablature with a relief of athletes, the attic with the name, a gold cog
  { const [ax0, ax1, az0, az1, ah] = PL.annex, [d0, d1] = PL.doorW, pz = az0 - 3.6, ez0 = az0 - 4.5, ew = ax1 - ax0 + 0.4;
    // the annex's own walls: the same two storeys (the drum's rhythm), the doors under the portico
    for (const [x, s] of [[ax0, -1], [ax1, 1]]) {
      plFace(acc, 'stone', x, az0, x, az1, 0, 1, s, 0, 2, 1, { cell: 99 }); plFace(acc, 'plFacade', x, az0, x, az1, 1, ah, s, 0, 3.58, ah - 1, { cell: 99 });
      for (let k = 1; k < 6; k++) { const z = az0 + k * 3.58; sbox(acc, 'plPilaster', x + s * 0.25, 1, z, 0.75, 0.5, ah - 1, s * Math.PI / 2, { u: 0.75, v: (ah - 1) / 2, top: false, skip: 'b', cell: 99 }); if (k % 2) plLight(L, x + s * 1.0, 0.35, z, UP, 7, 1.5); }
    }
    sbox(acc, 'plCornice', (ax0 + ax1) / 2, ah, (az0 + az1) / 2 + 0.15, ew + 0.8, az1 - az0 + 0.3, 0.7, 0, { u: 2, v: 0.7, top: 'roofDark', tu: 4, cell: 99 });
    for (const [a, b] of [[ax0, d0], [d1, ax1]]) plFace(acc, 'plDoors', a, az0, b, az0, 0, 2.8, 0, -1, 2, 2.8, { cell: 99 });
    plFace(acc, 'plAttic', ax0, az0, ax1, az0, 2.8, 3.4, 0, -1, 2, 0.6, { cell: 99 });
    plFace(acc, 'plFacade', ax0, az0, ax1, az0, 3.4, ah, 0, -1, (ax1 - ax0) / 6, ah - 1, { cell: 99 });
    // the columns, each lit from below
    for (const x of [-49.2, -46.4, -43.6, -36.4, -33.6, -30.8]) {
      sbox(acc, 'stone', x, 0, pz, 1.1, 1.1, 0.5, 0, { u: 1, v: 0.5, top: 'stone', tu: 1, cell: 99 });
      cyl(acc, 'plColumn', x, 0.5, pz, 0.44, 0.4, 7.5, 8, { u: 0.35, v: 7.5, cell: 99 });
      sbox(acc, 'plCornice', x, 8.0, pz, 1.15, 1.15, 0.6, 0, { u: 1.15, v: 0.6, top: false, cell: 99 });
      plSolid(x - 0.55, pz - 0.55, x + 0.55, pz + 0.55, 0, 8.6);
      aq(acc, 'litWarm', [x - 0.2, 0.52, pz - 0.75], [x + 0.2, 0.52, pz - 0.75], [x + 0.2, 0.52, pz - 0.6], [x - 0.2, 0.52, pz - 0.6], [0, 0, 1, 1], [0, 1, 0], 99);
      plLight(L, x, 0.6, pz - 1.0, UP, 6, 1.15);
    }
    // the entablature (architrave, the frieze, a cornice) and the attic, roofed back to the annex
    const ex = (ax0 + ax1) / 2, ezc = (ez0 + az0) / 2, ed = az0 - ez0;
    sbox(acc, 'plCornice', ex, 8.6, ezc, ew, ed, 0.6, 0, { u: 2, v: 0.6, top: false, cell: 99 });
    sbox(acc, 'plAttic', ex, 9.2, ezc, ew, ed, 1.7, 0, { u: 3, v: 1.7, top: false, cell: 99 });
    plate(acc, 'plFrieze', ex, 10.05, ez0, ew - 0.2, 1.62, Math.PI, 0.02);
    sbox(acc, 'plCornice', ex, 10.9, ezc - 0.2, ew + 0.8, ed + 0.8, 0.6, 0, { u: 2, v: 0.6, top: false, cell: 99 });
    sbox(acc, 'plAttic', ex, 11.5, ezc + 0.2, ew - 0.4, ed - 0.4, 2.6, 0, { u: 2.5, v: 2.6, top: 'roofDark', tu: 4, cell: 99 });
    aq(acc, 'plAttic', [ax0 - 0.2, 8.6, az0], [ax1 + 0.2, 8.6, az0], [ax1 + 0.2, 8.6, ez0], [ax0 - 0.2, 8.6, ez0], [0, 0, 6, 2], [0, -1, 0], 99);   // the portico's ceiling
    for (const x of [-46, -40, -34]) { aq(acc, 'litWarm', [x - 0.5, 8.58, pz + 1.3], [x + 0.5, 8.58, pz + 1.3], [x + 0.5, 8.58, pz + 0.5], [x - 0.5, 8.58, pz + 0.5], [0, 0, 1, 1], [0, -1, 0], 99); plLight(L, x, 7.9, pz + 0.9, '#ffd8a0', 8, 0.8); }
    // PALACE OF SPORT in big red letters along the attic (read left to right: from +x to -x as you face north)
    { const text = 'PALACE OF SPORT', step = 1.12, sp = 0.7, wid = [...text].reduce((w, ch) => w + (ch === ' ' ? sp : step), 0);
      let x = ex + wid / 2; const az = ez0 + 0.2;
      for (const ch of text) { if (ch === ' ') { x -= sp; continue; } const k = 'PALCEOFSRT'.indexOf(ch); plate(acc, 'plLetters', x - step / 2, 12.75, az, 1.02, 1.4, Math.PI, 0.03, [k / 10, 0, (k + 1) / 10, 1]); x -= step; } }
    plate(acc, 'cog', ex, 15.4, ez0 + 1.4, 3.4, 3.4, Math.PI, 0, [0, 0, 1, 1], true);
    sbox(acc, 'plAttic', ex, 14.1, ez0 + 1.4, 1.2, 0.4, 0.4, 0, { u: 1, v: 0.4, cell: 99 });
    plLight(L, ex, 12.0, ez0 - 4, '#ffe2b0', 9, 1.2);   // the name and the cog, floodlit
    // monumental steps only as edges: three painted risers across the front, stepped cheeks either side (solid)
    for (const [z, k] of [[pz - 2.4, 0], [pz - 1.8, 1], [pz - 1.2, 2]]) aq(acc, 'plStepEdge', [ax0 - 1.5, 0.01 + k * 0.002, z + 0.6], [ax1 + 1.5, 0.01 + k * 0.002, z + 0.6], [ax1 + 1.5, 0.01 + k * 0.002, z], [ax0 - 1.5, 0.01 + k * 0.002, z], [0, 0, 12, 1], [0, 1, 0], 99);
    for (const s of [-1, 1]) {
      const x = ex + s * (ew / 2 + 0.75);
      for (const [h, d] of [[0.45, 5.4], [0.9, 4.8], [1.35, 4.2]]) sbox(acc, 'stone', x, 0, az0 - d / 2 + 0.2, 1.4, d, h, 0, { u: 1, v: 0.45, top: 'stone', tu: 1, cell: 99 });
      plSolid(x - 0.7, az0 - 5.2, x + 0.7, az0, 0, 1.35);
      plStatue(acc, ex + s * 14, az0 - 2.4, Math.PI, 1.15);
      plLight(L, ex + s * 14, 0.5, az0 - 4.2, UP, 7, 1.4);
    }
    plSolid(ax0, az0, d0, az0 + 0.2, 0, ah); plSolid(d1, az0, ax1, az0 + 0.2, 0, ah); }
  // ---- four lattice floodlight masts round the bowl, their light banks turned on it
  for (const a of [-3 * Math.PI / 4, -Math.PI / 4, Math.PI / 4, 3 * Math.PI / 4]) {
    const [x, z] = at(36.6, a), dx = -Math.cos(a), dz = -Math.sin(a), h = 38.5;
    frustum(acc, 'plLattice', x, 0, z, 2.6, 2.6, 0.9, 0.9, h, 0, { u: 2.6, v: 6, top: false, cell: 99 });
    plLatticeIn(acc, x, z, 2.6, 0.9, h);
    sbox(acc, 'iron', x, h, z, 2.4, 2.4, 0.25, 0, { u: 1, v: 1, cell: 99 });
    const c = [x + dx * 0.9, h + 2.3, z + dz * 0.9], ca = Math.cos(0.6), sa = Math.sin(0.6), u = [-dz * 3.4, 0, dx * 3.4], v = [dx * sa * 2.3, ca * 2.3, dz * sa * 2.3];
    const Q = (s, t) => [c[0] + u[0] * s + v[0] * t, c[1] + u[1] * s + v[1] * t, c[2] + u[2] * s + v[2] * t];
    aq(acc, 'plFloodBank', Q(-1, 1), Q(1, 1), Q(1, -1), Q(-1, -1), [0, 0, 1, 1], [dx * ca, -sa, dz * ca], 99);
    aq(acc, 'iron', Q(1, 1), Q(-1, 1), Q(-1, -1), Q(1, -1), [0, 0, 1, 1], [-dx * ca, sa, -dz * ca], 99);
    sbox(acc, 'litRed', x, h + 3.9, z, 0.3, 0.3, 0.3, 0, { u: 1, v: 1, cell: 99 });
    plSolid(x - 1.3, z - 1.3, x + 1.3, z + 1.3, 0, h);
    plLight(L, x + dx * 5.6, 22, z + dz * 5.6, '#fff4dc', 26, 1.5);   // onto the roof, the attic and the flags
    plLight(L, x + dx * 6, 9, z + dz * 6, '#fff4dc', 14, 1.1);      // a pool at the mast's foot
  }
}
// the back faces of a lattice mast (seen through the front ones)
function plLatticeIn(acc, x, z, w0, w1, h) {
  const b = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let i = 0; i < 4; i++) {
    const [sx0, sz0] = b[i], [sx1, sz1] = b[(i + 1) % 4], nx = (sx0 + sx1) / 2, nz = (sz0 + sz1) / 2;
    aq(acc, 'plLattice', [x + sx0 * w1 / 2, h, z + sz0 * w1 / 2], [x + sx1 * w1 / 2, h, z + sz1 * w1 / 2], [x + sx1 * w0 / 2, 0, z + sz1 * w0 / 2], [x + sx0 * w0 / 2, 0, z + sz0 * w0 / 2], [0, 0, 1, h / 6], [-nx, 0, -nz], 99);
  }
}
// ---- Station Square (world): over the crossing you come up onto the square in front of East Station, and turn west
// onto the Boulevard of Champions, the Palace's drum and the Tower of Labor dead ahead down it. Flat (no steps: VR).
function buildStationSquare(acc, L) {
  const [x0, x1, z0, z1] = PL.square, [sx0, sx1, sz0, sz1] = PL.station, sm = (sz0 + sz1) / 2;
  ground(acc, 'paving', x0, z0, x1, z1, 0.004, 4, { cell: 4 });
  ground(acc, 'asphaltK', x1, z0, PL.sqRect[1], z1, 0, 8, { cell: 8 });
  // East Station: a long two-storey hall on the square's east side, a taller entrance block in the middle with its
  // glass front, the name, a clock and a gilt spire with a red star; a canopy along the front
  sbox(acc, 'towerFace', (sx0 + sx1) / 2, 0, sm, sx1 - sx0, sz1 - sz0, 12, 0, { u: 8, v: 8, top: 'roofDark', tu: 8, cell: 6 });
  sbox(acc, 'decoGold', (sx0 + sx1) / 2, 11.4, sm, sx1 - sx0 + 0.4, sz1 - sz0 + 0.4, 0.6, 0, { u: 4, v: 0.6, top: false, cell: 6 });
  const ex0 = sx0 - 1.5, ez0 = sm - 7, ez1 = sm + 7;
  sbox(acc, 'towerFace', (ex0 + sx1 - 4) / 2, 0, sm, sx1 - 4 - ex0, ez1 - ez0, 19, 0, { u: 8, v: 8, top: 'roofDark', tu: 8, cell: 6 });
  sbox(acc, 'decoGold', (ex0 + sx1 - 4) / 2, 18.3, sm, sx1 - 4 - ex0 + 0.4, ez1 - ez0 + 0.4, 0.7, 0, { u: 4, v: 0.7, top: false, cell: 6 });
  plate(acc, 'glassFront', ex0, 6.5, sm, 10, 11, -Math.PI / 2, 0.04, [0, 0, 10 / 3, 11 / 3]);
  plate(acc, 'stationSign', ex0, 13.8, sm, 12, 12 * 13 / 84, -Math.PI / 2, 0.05);
  plate(acc, 'clockFace', ex0, 16.4, sm, 2.4, 2.4, -Math.PI / 2, 0.05);
  frustum(acc, 'gilt', (ex0 + sx1 - 4) / 2, 19, sm, 4, 4, 0.4, 0.4, 9, 0, { cell: 8 });
  sbox(acc, 'litRed', (ex0 + sx1 - 4) / 2, 28, sm, 0.9, 0.9, 0.9, 0, { u: 1, v: 1 });
  sbox(acc, 'concrete', sx0 - 3.2, 4.2, sm, 3.4, ez1 - ez0 + 6, 0.35, 0, { u: 2, v: 1, top: 'roofDark', tu: 4 });
  sbox(acc, 'litWarm', sx0 - 3.2, 4.12, sm, 1.6, ez1 - ez0, 0.08, 0, { u: 1, v: 1 });
  for (const z of [sm - 9.5, sm + 9.5]) { sbox(acc, 'iron', sx0 - 4.6, 0, z, 0.2, 0.2, 4.2, 0, { u: 1, v: 1 }); plSolid(sx0 - 4.75, z - 0.15, sx0 - 4.45, z + 0.15, 0, 4.2); }
  for (const z of [sz0 + 6, sz1 - 6]) plate(acc, 'banner', sx0, 6.5, z, 3, 8, -Math.PI / 2, 0.05);
  plLight(L, sx0 - 3.2, 3.6, sm, '#ffd8a0', 12, 1.5); plLight(L, ex0 - 2, 12, sm, '#ffe2b4', 14, 1.0);   // the entrance, the name and the clock
  plSolid(ex0, sz0, sx1, sz1, 0, 19);
  // the square: sodium posts round the edge, poplars along the north side, a monument to the railwaymen in the middle
  // (facing you as you come up from the crossing); the boulevard opens off the west side (local x -48..-32 = z 190..206)
  for (const [x, z, d] of [[x0 + 0.3, 160, 1], [x0 + 0.3, 176, 1], [x0 + 0.3, 212, 1], [x1 - 0.3, 166, -1], [x1 - 0.3, 198, -1], [-40, z1 - 0.3, 1], [-46.5, 168, 1], [-33.5, 168, -1]]) plPost(acc, L, x, z, d);
  for (let x = x0 + 4; x < x1 - 3; x += 5) plTree(acc, x, z1 - 2.2, 1.1);
  plStatue(acc, -31, 181, Math.PI);
  plLight(L, -31, 2.4, 177.6, '#ffe8c0', 7, 1.2);
  // a low wall along the west side (the boulevard's lawns and the goods yard beyond), open onto the boulevard
  for (const [a, b] of [[z0, 189.6], [206.4, z1]]) { sbox(acc, 'concrete', x0 - 0.15, 0, (a + b) / 2, 0.3, b - a, 1.0, 0, { u: 6, v: 1, top: 'wallTop', tu: 6, cell: 6 }); plSolid(x0 - 0.3, a, x0, b, 0, 1.0); }
  // the goods yard: two sidings with a few box wagons standing on them, sodium on two masts; nothing tall, so from the
  // crossing you see over it to the Palace and the Tower of Labor
  const [yx0, yx1, yz0, yz1] = PL.yard;
  ground(acc, 'asphaltK', yx0, yz0, yx1, yz1, 0, 8, { cell: 8 });
  for (const tz of [155.2, 159.6]) aq(acc, 'track', [yx0, 0.012, tz + 1.2], [yx0, 0.012, tz - 1.2], [yx1, 0.012, tz - 1.2], [yx1, 0.012, tz + 1.2], [0, 0, 1, (yx1 - yx0) / 2], [0, 1, 0], 4);
  for (const [x, tz, t] of [[-70, 155.2, 0], [-85, 155.2, 1], [-118, 159.6, 2], [-133, 159.6, 0], [-148, 155.2, 1]]) {
    acc.tint = [[0.62, 0.36, 0.3], [0.42, 0.4, 0.36], [0.5, 0.42, 0.3]][t];
    sbox(acc, 'trainSide', x, 0.5, tz, 13.5, 2.8, 3.3, 0, { u: 13.5, v: 3.3, top: 'roofDark', tu: 4 });
    acc.tint = [1, 1, 1];
    for (const bx of [x - 4.5, x + 4.5]) sbox(acc, 'black', bx, 0, tz, 2.2, 2.4, 0.5, 0, { u: 1, v: 1 });
  }
  for (const x of [-100, -140]) { sbox(acc, 'iron', x, 0, 162.6, 0.3, 0.3, 12, 0, { u: 1, v: 1 }); sbox(acc, 'litSodium', x, 12, 162.6, 1.6, 0.6, 0.3, 0, { u: 1, v: 1 }); plLight(L, x, 11.5, 160, CFG.street.light.sodium, 20, 1.3); }
}
// ---- the crossing (world): the railway west, the tunnel under the wall, the planks, the fence; Station Square and East Station
function buildPalaceCrossing(acc) {
  const L = PL.crossLamps, [g0, g1] = PL.gap, [rx0, rx1] = PL.rail;
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
  buildStationSquare(acc, L);
}
// ---- inside: the foyer, the gym, the tunnels, the bowl (floor, stands, roof, the ring under its lights)
// the bowl's polygon: segment i faces the centre from angle -π/2 + i·2π/sides (0 = south, sides/2 = north: the vomitories);
// plAng(i) is the corner between segment i-1 and segment i
const plAng = (i) => -Math.PI / 2 + (i - 0.5) * 2 * Math.PI / PL.sides;
const plAt = (r, a) => [PL.bowlC[0] + Math.cos(a) * r, PL.bowlC[1] + Math.sin(a) * r];
// the stands: a ring of tiers round the floor (the boards, then the crowd on every riser), open south and north for the
// vomitories, whose cheeks step up with the tiers
function plTiers(acc) {
  const B = PL.bank, n = PL.sides, top = (k) => B.front + k * B.rise, R = (k) => PL.floorR + k * B.depth;
  for (let i = 0; i < n; i++) {
    const a0 = plAng(i), a1 = plAng(i + 1);
    if (i === 0 || i === n / 2) {
      for (let k = 0; k < B.rows; k++) for (const [a, s] of [[a0, 1], [a1, -1]]) {
        const [x0, z0] = plAt(R(k), a), [x1, z1] = plAt(R(k + 1), a);
        plFace(acc, 'concrete', x0, z0, x1, z1, 0, top(k), -Math.sin(a) * s, Math.cos(a) * s, 2, 2, { cell: 99 });
      }
      continue;
    }
    for (let k = 0; k < B.rows; k++) {
      const [xa, za] = plAt(R(k), a0), [xb, zb] = plAt(R(k), a1), [xc, zc] = plAt(R(k + 1), a1), [xd, zd] = plAt(R(k + 1), a0), len = Math.hypot(xb - xa, zb - za);
      if (k === 0) wall(acc, 'arenaBoard', xa, za, xb, zb, 0, B.front, 4, B.front, { cell: 99 });
      else wall(acc, 'crowd', xa, za, xb, zb, top(k - 1), top(k), 4, B.rise, { u0: (i * 0.37 + k * 0.29) % 1 });
      aq(acc, 'concrete', [xd, top(k), zd], [xc, top(k), zc], [xb, top(k), zb], [xa, top(k), za], [0, 0, len / 2, B.depth / 2], [0, 1, 0], 99);
    }
    // a box under the front rows for props that land there (goons and ragdolls are kept on the floor by the walk rects)
    { const [x, z] = plAt(R(0) + 1.4, (a0 + a1) / 2); WORLD_BOXES.push([x - 1.2, 0, z - 1.2, x + 1.2, top(2), z + 1.2]); }
  }
}
// an iron lamp shade hanging from the ceiling at height y, lit underneath
function plShade(acc, list, x, z, y, top, col, r, k) {
  sbox(acc, 'iron', x, y + 0.4, z, 0.03, 0.03, top - y - 0.4, 0, { u: 1, v: 1, top: false, cell: 99 });
  frustum(acc, 'iron', x, y, z, 0.9, 0.9, 0.3, 0.3, 0.4, 0, { u: 1, v: 1, cell: 99 });
  aq(acc, 'litWarm', [x - 0.38, y + 0.02, z + 0.38], [x + 0.38, y + 0.02, z + 0.38], [x + 0.38, y + 0.02, z - 0.38], [x - 0.38, y + 0.02, z - 0.38], [0, 0, 1, 1], [0, -1, 0], 99);
  plLight(list, x, y - 0.4, z, col, r, k);
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
  // ---- the gym: the national training hall at night. The gymnast mural over the tunnel door with the podium under it,
  // wall bars, climbing ropes, rings, a pommel horse, the vault's runway, springboard and horse, the champions' banners,
  // the coach's lit window up on the east wall, a chalk trough; a few hard pools of light and the dark between them
  { const [x0, x1, z0, z1, H] = PL.gym, LW = '#fff0d8';
    pzWalls(acc, 'sportWall', [x0, x1, z0, z1], 0, 3, { s: [[d0, d1, 2.8]], n: [[g0, g1, TH - 0.2]] }); pzWalls(acc, 'creamWall', [x0, x1, z0, z1], 3, H - 3);
    pzFloorCeil(acc, [x0, x1, z0, z1], 0, H, 'sportFloor');
    for (const z of [192, 194.8, 197.6]) sbox(acc, 'iron', (x0 + x1) / 2, H - 0.35, z, x1 - x0, 0.22, 0.3, 0, { u: 1, v: 1, cell: 99 });   // roof beams
    // walls: the mural and its wash, the slogan over the door you came in by, wall bars (cut out), night windows, the coach
    plate(acc, 'gymMural', -40, 4.45, z1, 12, 3.0, Math.PI, 0.03);
    sbox(acc, 'litWarm', -40, H - 0.12, z1 - 0.5, 7, 0.12, 0.08, 0, { u: 1, v: 1, cell: 99 }); plLight(L, -40, 5.4, z1 - 1.3, '#ffe8c8', 7.5, 1.5);
    plate(acc, 'gymSlogan', -40, 4.7, z0, 13, 0.92, 0, 0.03);
    plate(acc, 'gymBars', x0, 1.45, 195, 8, 2.9, Math.PI / 2, 0.12, [0, 0, 8, 2.9]);
    plate(acc, 'gymBars', x1, 1.45, 193, 4, 2.9, -Math.PI / 2, 0.12, [0, 0, 4, 2.9]);
    for (const z of [192.4, 195.4, 198.2]) plate(acc, 'windowNight', x0, 4.4, z, 1.6, 1.6, Math.PI / 2, 0.02);
    plLight(L, x0 + 1, 4.6, 195.2, '#7a96d8', 6, 0.7);   // moonlight through them
    plate(acc, 'coachWin', x1, 3.9, 196.6, 2.6, 1.6, -Math.PI / 2, 0.03); plLight(L, x1 - 0.8, 3.9, 196.6, '#ffcf86', 5, 0.9);
    // the champions' banners, hung between the beams (a face each way so both doors read them)
    [-48.2, -45.4, -34.6, -31.8].forEach((x, k) => { for (const phi of [Math.PI, 0]) plate(acc, 'gymChamps', x, 4.95, 193.6 + (phi ? -0.01 : 0.01), 1.0, 1.5, phi, 0, [k / 4, 0, (k + 1) / 4, 1]); sbox(acc, 'iron', x, 5.7, 193.6, 1.2, 0.05, 0.05, 0, { u: 1, v: 1, cell: 99 }); });
    // floor: mats, the vault's runway (the running line), the chalk patch
    for (const [a, b, c, d] of [[-47.4, -43.4, 194, 196], [-35.5, -32.5, 193.8, 195.8], [-33, -30.6, 191.1, 193]]) ground(acc, 'mat', a, c, b, d, 0.035, 2);
    aq(acc, 'gymLane', [-48.5, 0.008, 192.2], [-36.5, 0.008, 192.2], [-36.5, 0.008, 191.3], [-48.5, 0.008, 191.3], [0, 0, 12, 1], [0, 1, 0], 2);
    ground(acc, 'gymChalk', -32.2, 190.2, -30.4, 191.6, 0.012, 1.8);
    // the vault: springboard, horse
    { const xa = -36.4, xb = -35.2, za = 191.45, zb = 192.05, h0 = 0.06, h1 = 0.32;
      aq(acc, 'gymSpring', [xa, h0, za], [xb, h1, za], [xb, h1, zb], [xa, h0, zb], [0, 0, 1, 1], [-0.2, 1, 0], 99);
      for (const z of [za, zb]) aq(acc, 'gymSpring', [xa, h0, z], [xb, h1, z], [xb, 0, z], [xa, 0, z], [0, 0, 1, 0.3], [0, 0, z === za ? -1 : 1], 99);
      aq(acc, 'gymSpring', [xb, h1, za], [xb, h1, zb], [xb, 0, zb], [xb, 0, za], [0, 0, 1, 0.3], [1, 0, 0], 99);
      plSolid(xa, za, xb, zb, 0, h1);
      sbox(acc, 'gymLeather', -34, 0.95, 191.75, 1.6, 0.4, 0.34, 0, { u: 1, v: 1, cell: 99 });
      for (const sx of [-0.6, 0.6]) for (const sz of [-0.12, 0.12]) sbox(acc, 'iron', -34 + sx, 0, 191.75 + sz, 0.06, 0.06, 0.95, 0, { u: 1, v: 1, top: false, cell: 99 });
      plSolid(-34.8, 191.5, -33.2, 192, 0, 1.29); }
    // the pommel horse
    { const x = -45.4, z = 195;
      sbox(acc, 'gymLeather', x, 0.85, z, 1.6, 0.36, 0.3, 0, { u: 1, v: 1, cell: 99 });
      for (const sx of [-0.35, 0.35]) { for (const sz of [-0.1, 0.1]) sbox(acc, 'darkwood', x + sx, 1.15, z + sz, 0.05, 0.05, 0.13, 0, { u: 1, v: 1, top: false, cell: 99 }); sbox(acc, 'darkwood', x + sx, 1.28, z, 0.06, 0.28, 0.05, 0, { u: 1, v: 1, cell: 99 }); }
      for (const sx of [-0.6, 0.6]) { sbox(acc, 'iron', x + sx, 0, z, 0.1, 0.1, 0.85, 0, { u: 1, v: 1, top: false, cell: 99 }); sbox(acc, 'iron', x + sx, 0, z, 0.08, 0.7, 0.06, 0, { u: 1, v: 1, cell: 99 }); }
      plSolid(x - 0.8, z - 0.2, x + 0.8, z + 0.2, 0, 1.33); }
    // the rings, the climbing ropes
    for (const x of [-34.25, -33.75]) { sbox(acc, 'darkwood', x, 2.56, 194.8, 0.04, 0.04, H - 2.9, 0, { u: 1, v: 1, top: false, cell: 99 }); plate(acc, 'gymRing', x, 2.42, 194.8, 0.3, 0.3, 0, 0, [0, 0, 1, 1], true); }
    for (const x of [-48.6, -47.8, -47]) { sbox(acc, 'gymRope', x, 0.25, 192, 0.06, 0.06, H - 0.6, 0, { u: 0.06, v: 2, top: false, cell: 99 }); sbox(acc, 'gymRope', x, 0.2, 192, 0.13, 0.13, 0.22, 0, { u: 0.13, v: 0.22, cell: 99 }); }
    // the podium, 2 · 1 · 3 as you face it, under the mural: red and white, numbered, cover in a fight
    [[-33.2, 0.55, 1], [-34.5, 0.8, 0], [-35.8, 0.4, 2]].forEach(([x, h, k]) => {
      sbox(acc, 'gymPodSide', x, 0, 198.6, 1.3, 1.0, h, 0, { u: 1.3, v: 0.8, top: 'padRed', tu: 1, cell: 99 });
      plate(acc, 'gymPodNum', x, h - 0.26, 198.1, 0.5, 0.4, Math.PI, 0.01, [k / 3, 0, (k + 1) / 3, 1]);
    });
    plSolid(-36.45, 198.1, -32.55, 199.1, 0, 0.8);
    // the chalk trough
    sbox(acc, 'iron', -31.2, 0, 190.8, 0.1, 0.1, 0.85, 0, { u: 1, v: 1, top: false, cell: 99 });
    frustum(acc, 'darkwood', -31.2, 0.85, 190.8, 0.3, 0.3, 0.62, 0.62, 0.22, 0, { u: 1, v: 1, top: 'white', cell: 99 });
    plSolid(-31.5, 190.5, -30.9, 191.1, 0, 1.07);
    // the light: hard pools over the apparatus, darker between
    for (const [x, z, r, k] of [[-45.4, 195, 7.5, 2.3], [-34, 194.6, 7.5, 2.3], [-40, 192.2, 6.5, 1.7], [-40, 194.3, 5.5, 1.2], [-47.8, 191.6, 5.5, 1.4]]) plShade(acc, L, x, z, 4.6, H, LW, r, k); }
  // ---- the players' tunnel (the gym to the south vomitory) and the way out (the north vomitory to the north doors)
  const [cx, cz] = PL.bowlC, n = PL.sides, sn = Math.sin(Math.PI / n), rb = PL.backR, zs = PL.bowl[2], zn = PL.bowl[3], WT = PL.wallTop;
  for (const [z0, z1] of [[PL.gym[3], zs], [zn, PL.northZ]]) {
    plFace(acc, 'stairWall', g0, z0, g0, z1, 0, TH, 1, 0); plFace(acc, 'stairWall', g1, z0, g1, z1, 0, TH, -1, 0);
    ground(acc, 'stairFloor', g0, z0, g1, z1, 0.004, 1.6); plCeil(acc, 'slabEnd', g0, z0, g1, z1, TH, 4);
    sbox(acc, 'litWarm', -40, TH - 0.1, (z0 + z1) / 2, 0.3, 0.3, 0.1, 0, { u: 1, v: 1 }); plLight(L, -40, TH - 0.3, (z0 + z1) / 2, '#ffd8a0', 6, 1.2);
  }
  ground(acc, 'stairFloor', cx - rb * sn, zs, cx + rb * sn, cz - 16, 0.004, 1.6); ground(acc, 'stairFloor', cx - rb * sn, cz + 16, cx + rb * sn, zn, 0.004, 1.6);
  // ---- the bowl: the round floor, the ring of stands, the round back wall, the saucer ceiling
  ground(acc, 'sportFloor', cx - 16, cz - 16, cx + 16, cz + 16, 0.004, 4, { cell: 2 });
  for (let i = 0; i < n; i++) {   // a red circle round the floor
    const [xa, za] = plAt(13.4, plAng(i)), [xb, zb] = plAt(13.4, plAng(i + 1)), [xc, zc] = plAt(13.65, plAng(i + 1)), [xd, zd] = plAt(13.65, plAng(i));
    aq(acc, 'padRed', [xd, 0.01, zd], [xc, 0.01, zc], [xb, 0.01, zb], [xa, 0.01, za], [0, 0, 1, 1], [0, 1, 0], 99);
  }
  plTiers(acc);
  const topT = PL.bank.front + (PL.bank.rows - 1) * PL.bank.rise;
  for (let i = 0; i < n; i++) {
    const [xa, za] = plAt(rb, plAng(i)), [xb, zb] = plAt(rb, plAng(i + 1));
    if (i === 0 || i === n / 2) {   // the back of a vomitory: the corridor's mouth
      const xs = xa < xb ? [xa, g0, g1, xb] : [xa, g1, g0, xb];
      wall(acc, 'slabEnd', xs[0], za, xs[1], za, 0, WT, 4, 4); wall(acc, 'slabEnd', xs[1], za, xs[2], za, TH, WT, 4, 4); wall(acc, 'slabEnd', xs[2], za, xs[3], za, 0, WT, 4, 4);
    } else wall(acc, 'slabEnd', xa, za, xb, zb, topT, WT, 4, 4, { cell: 3 });
  }
  { const prof = [[rb, WT], [18.6, 12.3], [13.6, 14.0], [7.6, 15.0], [2.6, PL.roofY - 0.05], [0.02, PL.roofY]];
    for (let j = 0; j < prof.length - 1; j++) for (let i = 0; i < n; i++) {
      const [r0, y0] = prof[j], [r1, y1] = prof[j + 1], a0 = plAng(i), a1 = plAng(i + 1), am = (a0 + a1) / 2;
      const [xa, za] = plAt(r0, a0), [xb, zb] = plAt(r0, a1), [xc, zc] = plAt(r1, a1), [xd, zd] = plAt(r1, a0);
      aq(acc, 'domeRib', [xd, y1, zd], [xc, y1, zc], [xb, y0, zb], [xa, y0, za], [0, 0, 1, 1], [-(y1 - y0) * Math.cos(am), r1 - r0, -(y1 - y0) * Math.sin(am)], 99);
    } }
  // banners and flags round the back wall, the Bear over the way out, the Palace's name over the way in
  for (let i = 0; i < n; i++) {
    const am = -Math.PI / 2 + i * 2 * Math.PI / n, [x, z] = plAt(rb * Math.cos(Math.PI / n), am), phi = Math.atan2(-Math.cos(am), -Math.sin(am));
    if (i === 0) plate(acc, 'palaceSign', x, 6.8, z, 7, 0.94, phi, 0.04);
    else if (i === n / 2) plate(acc, 'volkovPoster', x, 6.7, z, 3.0, 4.0, phi, 0.04);
    else if (i % 2) plate(acc, 'banner', x, 7.9, z, 1.6, 3.6, phi, 0.03);
    else plate(acc, 'flag_kras', x, 7.9, z, 3.6, 2.4, phi, 0.03);
  }
  // the lighting rig: a ring truss under the saucer, floods hanging off it, the scoreboard over the ring, the ring's lamps
  const [rx, rz, rs] = PL.ring, tr = 8.6, ty = 10.8;
  for (let i = 0; i < n; i++) {
    const am = -Math.PI / 2 + i * 2 * Math.PI / n, [x, z] = plAt(tr * Math.cos(Math.PI / n), am);
    sbox(acc, 'iron', x, ty, z, 2 * tr * sn + 0.1, 0.45, 0.45, -am - Math.PI / 2, { u: 1, v: 1, cell: 99 });
    if (i % 2 === 0) { const [fx, fz] = plAt(tr - 0.1, am); sbox(acc, 'iron', fx, ty - 0.55, fz, 0.7, 0.7, 0.55, 0, { u: 1, v: 1, cell: 99 }); aq(acc, 'flood', [fx - 0.3, ty - 0.56, fz + 0.3], [fx + 0.3, ty - 0.56, fz + 0.3], [fx + 0.3, ty - 0.56, fz - 0.3], [fx - 0.3, ty - 0.56, fz - 0.3], [0, 0, 1, 1], [0, -1, 0], 99);
      const [lx, lz] = plAt(12.5, am); plLight(L, lx, 9.5, lz, C.flood, C.floodRadius, C.floodK); }   // aimed out at the stands
    if (i % 4 === 2) sbox(acc, 'iron', x, ty + 0.45, z, 0.05, 0.05, 15 - ty - 0.45, 0, { u: 1, v: 1, top: false, cell: 99 });
    if (i % 4 === 1) { const [sx, sz] = plAt(17, am); plLight(L, sx, 11, sz, C.stand, C.standRadius, C.standK); }   // the upper tiers
  }
  sbox(acc, 'iron', rx, 8.9, rz, 3.5, 3.5, 2.0, 0, { u: 1, v: 1, cell: 99 }); for (let k = 0; k < 4; k++) plate(acc, 'scoreboard', rx, 9.9, rz, 3.4, 1.9, k * Math.PI / 2, 1.76); sbox(acc, 'iron', rx, 10.9, rz, 0.08, 0.08, PL.roofY - 10.9, 0, { u: 1, v: 1, top: false, cell: 99 });
  sbox(acc, 'iron', rx, 7.6, rz, rs * 2, rs * 2, 0.16, 0, { u: 1, v: 1, cell: 99 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) sbox(acc, 'flood', rx + sx * rs * 0.7, 7.25, rz + sz * rs * 0.7, 0.6, 0.6, 0.35, 0, { u: 0.6, v: 0.35, top: 'iron', cell: 99 });
  plLight(L, rx, 6.5, rz, C.ring, C.ringRadius, C.ringK);   // a hard white pool on the canvas
  for (const z of [zs + 3, zn - 3]) plLight(L, -40, 4.5, z, '#ffd8a0', 8, 1.0);   // the vomitories
  // the ring: canvas on the floor, red/blue corners, three ropes (open on the side you come in from)
  ground(acc, 'canvas', rx - rs, rz - rs, rx + rs, rz + rs, 0.02, 2);
  for (const [cx2, cz2, k] of [[-rs, -rs, 'padRed'], [rs, -rs, 'padBlue'], [-rs, rs, 'padBlue'], [rs, rs, 'padRed']]) {
    sbox(acc, 'iron', rx + cx2, 0, rz + cz2, 0.14, 0.14, 1.5, 0, { u: 1, v: 1 }); sbox(acc, k, rx + cx2, 0.5, rz + cz2, 0.26, 0.26, 0.9, 0, { u: 1, v: 1 });
    plSolid(rx + cx2 - 0.12, rz + cz2 - 0.12, rx + cx2 + 0.12, rz + cz2 + 0.12, 0, 1.5);
  }
  for (const y of [0.55, 0.95, 1.35]) for (const [a, b] of [[[-rs, rs], [rs, rs]], [[-rs, -rs], [-rs, rs]], [[rs, -rs], [rs, rs]]]) {
    const xa = rx + a[0], za = rz + a[1], xb = rx + b[0], zb = rz + b[1];
    sbox(acc, 'rope', (xa + xb) / 2, y, (za + zb) / 2, Math.abs(xb - xa) + 0.04, Math.abs(zb - za) + 0.04, 0.04, 0, { u: 8, v: 1, cell: 99 });
  }
  // the judges' table by the ring
  sbox(acc, 'darkwood', -49, 0, rz, 0.9, 3.2, 0.8, 0, { u: 1, v: 1 }); plSolid(-49.45, rz - 1.6, -48.55, rz + 1.6, 0, 0.8);
  sbox(acc, 'gilt', -49, 0.8, rz - 0.8, 0.2, 0.2, 0.3, 0, { u: 1, v: 1 });
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
  resetTrain('gone');
}
function buildShutter() {   // the steel shutter in the north doors (local: it rides in the frame's group)
  const sh = new GeoAcc(); plFace(sh, 'gate', PL.gap[0], PL.bowl[3] + 0.3, PL.gap[1], PL.bowl[3] + 0.3, 0, PL.tunnelH, 0, -1, 2, 1.5); plFace(sh, 'gate', PL.gap[0], PL.bowl[3] + 0.32, PL.gap[1], PL.bowl[3] + 0.32, 0, PL.tunnelH, 0, 1, 2, 1.5);
  PL.shutter = new THREE.Mesh(sh.geometry({ ambient: [0.5, 0.48, 0.46], lights: [] }), makeMat('street', { baked: true })); PL.shutter.frustumCulled = false; PL.shutter.visible = false; PL.shutter.userData.small = true; scene.add(PL.shutter);
}
// called from buildStreet(): the inside (one baked mesh, drawn as a room), the outside (one baked mesh), the train and barriers
function buildPalace() {
  PL.inLamps = []; PL.outLamps = []; PL.crossLamps = [];
  const F = CFG.street.fog, Lt = CFG.street.light;
  const mk = (acc, light) => { const m = new THREE.Mesh(acc.geometry(light), makeMat('street', { baked: true })); m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false; m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far }; scene.add(m); return m; };
  // the crossing, the railway and Station Square stay where they are (world): the train and the barriers too
  const xAcc = new GeoAcc(); buildPalaceCrossing(xAcc); buildTrain();
  { const [x0, x1, , z1] = PL.square, on = () => level.name === 'palace';   // Station Square, and onto the boulevard off its west side
    [ { x0: x0 + 0.3, x1: x1 - 0.6, z0: PL.barN + 0.2, z1: z1 - 0.3, pad: 0.3, area: 'plSquare', on },
      { x0: x0 - 1.5, x1: x0 + 1, z0: 190.3, z1: 205.7, pad: 0.3, area: 'plSqBlvd', on },
    ].forEach(addWalk); }
  // from the boulevard on, the level is laid west into the sector by its frame (src/levels.js)
  ACT1_WEST.begin();
  const inAcc = new GeoAcc(), outAcc = new GeoAcc();
  buildPalaceInside(inAcc); buildPalaceOutside(outAcc);
  PL.inMesh = mk(inAcc, { ambient: CFG.palace.light.inAmbient, lights: PL.inLamps }); PL.inTris = inAcc.tris;
  PL.outMesh = mk(outAcc, { ambient: Lt.ambient, sky: Lt.sky, lights: PL.outLamps.concat(ACT1_WEST.localLamps(PL.crossLamps)) }); PL.outTris = outAcc.tris;
  for (const l of PL.inLamps.concat(PL.outLamps)) ST.lamps.push(l);
  buildShutter();
  // where you can walk: the gap in the fence, the crossing (once the train's by), the boulevard, the forecourt, the foyer,
  // the gym, the tunnel, the arena floor, the way out north (once the Bear's down)
  const on = () => level.name === 'palace', P = 0.3, [g0, g1] = PL.gap, [d0, d1] = PL.doorW;
  const [bx0, bx1, bz0, bz1] = PL.blvd, [fx0, fx1, fz0, fz1] = PL.fore;
  // the round floor: overlapping rects inside the stands' boards (corners on a circle Rw from the centre)
  const [cx, cz] = PL.bowlC, Rw = PL.floorR * Math.cos(Math.PI / PL.sides) - 0.35;
  const round = [10, 28, 45, 62, 80].map((d, k) => { const c = Math.cos(d * Math.PI / 180) * Rw, s = Math.sin(d * Math.PI / 180) * Rw; return { x0: cx - c, x1: cx + c, z0: cz - s, z1: cz + s, pad: P, area: 'plFloor' + k, on }; });
  [ { x0: g0 + 0.3, x1: g1 - 0.3, z0: 135.6, z1: PL.barS - 0.3, pad: P, area: 'plGap', world: true, on: () => (level.name === 'podezd' && CRADLE.phase === 'bottom') || on() },
    { x0: g0 + 0.3, x1: g1 - 0.3, z0: PL.barS - 0.4, z1: PL.barN + 0.4, pad: P, area: 'plCross', world: true, on: () => on() && TRAIN.open },
    { x0: bx0, x1: bx1, z0: bz0 + 0.3, z1: bz1 + 0.3, pad: P, area: 'plBlvd', on },
    { x0: fx0, x1: fx1, z0: fz0, z1: fz1 - 0.3, pad: P, area: 'plFore', on },
    { x0: d0 + 0.3, x1: d1 - 0.3, z0: fz1 - 0.5, z1: fz1 + 0.5, pad: P, area: 'plDoor', on },
    { x0: PL.foyer[0] + 0.3, x1: PL.foyer[1] - 0.3, z0: PL.foyer[2] + 0.3, z1: PL.foyer[3] - 0.3, pad: P, area: 'plFoyer', on },
    { x0: d0 + 0.3, x1: d1 - 0.3, z0: PL.foyer[3] - 0.5, z1: PL.foyer[3] + 0.5, pad: P, area: 'plGymDoor', on },
    { x0: PL.gym[0] + 0.3, x1: PL.gym[1] - 0.3, z0: PL.gym[2] + 0.3, z1: PL.gym[3] - 0.3, pad: P, area: 'plGym', on },
    { x0: g0 + 0.3, x1: g1 - 0.3, z0: PL.gym[3] - 0.5, z1: cz - Rw + 1, pad: P, area: 'plTunnel', on },
    ...round,
    { x0: g0 + 0.3, x1: g1 - 0.3, z0: cz + Rw - 1, z1: PL.northZ + 1.2, pad: P, area: 'plNorth', on: () => level.name === 'parade' || (on() && palaceNorthOpen()) },
  ].forEach(addWalk);
  ACT1_WEST.end();
  // the crossing's mesh last, so the boulevard's lamps (world now) light the square's west edge too
  PL.crossMesh = mk(xAcc, { ambient: Lt.ambient, sky: Lt.sky, lights: PL.crossLamps.concat(SBX.lamps.filter(l => l[0][2] > 128), PL.outLamps) }); PL.crossTris = xAcc.tris;
  for (const l of PL.crossLamps) ST.lamps.push(l);
}
const palaceNorthOpen = () => level.encounter >= CFG.palace.encounters.length - 1 && (game.state === 'walk' || game.state === 'won' || game.state === 'cleared');
const inPalace = (p) => p.y < PL.roofY + 1 && ((p.x > PL.annex[0] - 0.3 && p.x < PL.annex[1] + 0.3 && p.z > PL.foyer[2] + 0.02 && p.z < PL.gym[3])
  || (p.z >= PL.gym[3] && p.z < PL.northZ && Math.hypot(p.x - PL.drum[0], p.z - PL.drum[1]) < PL.drum[2]));   // the drum
const _plL = new V3();
function palaceRooms() {   // (the inside is in the frame's coordinates)
  const W = ACT1_WEST;
  addRoom('palace', (p) => inPalace(W.local(p, _plL)));
  roomMeshes('palace', PL.inMesh);
  addPortal('outside', 'palace', W.pt([-40, 1.3, PL.foyer[2]]));
  addPortal('outside', 'palace', W.pt([-40, 1.3, PL.northZ]), () => level.name !== 'palace' || palaceNorthOpen());   // shut while the shutter's down
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
  menu: '5 · The Palace of Sport (Volkov)', cfg: () => CFG.palace, build: buildPalace, rooms: palaceRooms, frame: ACT1_WEST,
  outside: () => [PL.outMesh, PL.crossMesh, ...TRAIN.booms.map(B => B.base)], rects: () => [ACT1_WEST.rect(PL.rect), PL.rail, PL.sqRect, PL.yard],
  start: (f) => startPalace(f), update: (dt) => updatePalace(dt),
  after: 'podezd', enter: () => player.head.z > PL.fenceZ + 0.2 && Math.abs(player.head.x + 40) < 2.2,   // through the gap in the fence
  finish: () => { const h = ACT1_WEST.head(); return h.z > CFG.palace.finishZ && Math.abs(h.x + 40) < 2.2; }, wonSign: 'toParade',
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
  for (const [type, x, z, y] of CFG.palace.props) new Prop(type, ACT1_WEST.world(new V3(x, y || 0, z)));
  if (!fromPodezd) { placePlayer(CFG.palace.start[0], CFG.palace.start[1], Math.PI); rig.position.y = 0; }
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  showSign('crossing', 2.0);
}
