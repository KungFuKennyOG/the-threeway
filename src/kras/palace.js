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
  start: [-30, 136.3],                          // "start here": in the gap in the railway fence, facing along the crossing (world)
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
  gap: [-42, -38],                                   // both tunnels inside the Palace (local x; the axis is local x -40)
  fenceZ: 137.5, barS: 138.2, barN: 151.3, fenceN: 151.55, track: 143,
  // the level crossing (world): from the gap in the bank's fence (PZ.gap) it runs skewed across the three tracks, north-west
  // at ang from north, so you step off it facing the Tower of Labor (w: the planks' width, square to the way across)
  cross: { x: (PZ.gap[0] + PZ.gap[1]) / 2, ang: 55 * Math.PI / 180, w: 3.2, arm: 6.2 },
  portal: [-8, -1, 137.8, 151, 7], mouth: [138.2, 147.9, 5.5],   // the tunnel under the wall the trains come out of
  blvd: [-48, -32, 151.4, 166], fore: [-64, -16, 166, 180],   // the boulevard, then a wide forecourt before the bowl
  annex: [-50, -30, 180, 201.5, 10.6], foyer: [-50, -30, 180, 190, 5.2], gym: [-50, -30, 190, 199.5, 6], doorW: [-43, -37],
  // the bowl inside the drum: a 24-sided floor (corner radius floorR), a ring of stands round it (a vomitory through them
  // south and north), the round back wall up to wallTop, a saucer ceiling up to roofY
  bowlC: [-40, 226], sides: 24, floorR: 15.4, bank: { rows: 7, depth: 0.9, rise: 0.7, front: 1.1 }, wallTop: 10, roofY: 15.3, tunnelH: 3,
  drum: [-40, 226, 27, 10.6], ring: [-40, 226, 3.6],  // the drum: centre, radius, height to the cornice
  rect: [-74, -6, 151, 254], rail: [-178, -122, 129, 151],      // rect: the boulevard to the north doors (local); rail: world
  // world: Station Square north of the crossing. You come off the crossing at its south-east corner and walk on north-west
  // across it into the boulevard's mouth (its south half paved, so the opening is wide); East Station on its east side,
  // its back to the wall. square: its extent; walk: [x0, x1, z0, z1] rects (the arrival, the station's forecourt, the
  // boulevard's mouth, the strip under the wall slab, the corner the goods yard's wall steps round)
  square: [-72, -46, 151.7, 216], station: [-46, -36, 153.5, 177],
  walk: [[-60, -46.3, 151.7, 162], [-58, -46.3, 162, 177], [-71.9, -52, 160.8, 190], [-55.6, -50.3, 177, 215.7], [-64.7, -52, 156.6, 162]],
  // the wall slabs (world): the Ministry built its tallest slabs between the sector and the Accords wall, so nobody has to
  // look at Columbia. 22 storeys of precast panels: [x0, x1, z0, z1, storeys, y0]. Close enough to the route that from
  // the crossing, the square and the boulevard they hide Columbia's ridge, its crowns and Civic Harmony's mast; only the
  // Halcyon (375 m up) and the searchlights' beams show over them. From the Tower's tribune the whole ridge is back.
  // (the last one stands on the tunnel's portal under the wall: the trains come out from under it)
  slabs: [[-36, -22, 152.2, 226, 22], [-50, -36, 177, 230, 22], [-55.5, -42, 230, 256, 22], [-16, -3, 151, 178, 22], [-8, -3, 137.8, 151, 12, 7]],
  // kept clear of the far city: the square and the station's old ground, the goods yard north of the tracks (low: the
  // Tower shows over it). Unchanged since the square was restaged: the far city draws its blocks from one random stream,
  // so a block more or less here would reshuffle every block after it (Columbia's from Tripoint Square among them)
  sqRect: [-58, -4, 151.4, 216], yard: [-157.6, -56, 151.7, 164], yardEnd: -65, yardTop: 160.5,   // (the yard's east end, drawn: the square's wall)
  crossMesh: null, crossLamps: [], crossTris: 0,
  inMesh: null, outMesh: null, inLamps: [], outLamps: [], glowLamps: [], inTris: 0, outTris: 0, shutter: null,
};
// the skewed crossing: its centreline's x at z, the planks' half-width along x, the way across (a unit [x, z]), where it
// ends west (the train clears that before the barriers lift), and the arrival: one step off its north end
{ const C = PL.cross, t = Math.tan(C.ang);
  PL.crossX = (z) => C.x - (z - PL.fenceZ) * t;
  C.hw = C.w / 2 / Math.cos(C.ang); C.dir = [-Math.sin(C.ang), Math.cos(C.ang)];
  C.west = PL.crossX(PL.fenceN) - C.hw;
  C.arrive = [PL.crossX(PL.fenceN) + C.dir[0] * 1.2, PL.fenceN + C.dir[1] * 1.2];
  PL.crossPosts = [[PL.crossX(PL.barS) + C.hw + 0.45, PL.barS - 0.3], [PL.crossX(PL.barN) - C.hw - 0.45, PL.barN + 0.3]]; }   // the barriers' pivots: south, north
PL.backR = PL.floorR + PL.bank.rows * PL.bank.depth;                                       // the stands' back wall (corner radius)
{ const [cx, cz] = PL.bowlC, c = Math.cos(Math.PI / PL.sides), f = PL.floorR * c, b = PL.backR * c;
  PL.floor = [cx - f, cx + f, cz - f, cz + f];   // the round floor's bounding box
  PL.bowl = [cx - b, cx + b, cz - b, cz + b]; }  // the back wall's (the vomitories end at bowl[2] and bowl[3])
PL.northZ = PL.drum[1] + PL.drum[2] * Math.cos(Math.PI / 24);                              // the drum's north door (z)
// the four floodlight masts (outside): feet out on the oval's corners, heads leaning 4 m in toward the middle, the banks
// aimed at the floor: [foot x, foot z, head x, head z, height, aim x, aim z]. The far pair stand taller, so their banks
// clear the rim seen from the boulevard. Placed off the Tower of Labor's sightlines from the boulevard, the crossing and
// the arrival off it (the crossing looks up the oval's west flank at it: the near pair stand in from the corners so its
// bank keeps left of the Tower's upper tiers, crown and cog as you step off the crossing).
PL.masts = [[-69, 181, 50], [-11, 181, 50], [-73, 248, 56], [-7, 248, 56]].map(([x, z, h]) => {
  const cx = -40, cz = 215.5, dx = cx - x, dz = cz - z, d = Math.hypot(dx, dz);
  return [x, z, x + dx / d * 4, z + dz / d * 4, h, cx - dx * 0.3, cz - dz * 0.3];
});
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
// ---- outside (local, in the ACT1_WEST frame): the boulevard, the forecourt, and the Palace as a stadium: one oval bowl
// round everything (the foyer, the gym and the round arena inside it), the columned portico set into its front, a raked
// ring of roof open over the middle with the floodlights' glow rising off it, and four huge lattice masts leaning in.
// The inside (buildPalaceInside, PL.drum) is a separate mesh in its own room and doesn't change: none of this shows
// from in there. Sightlines: from the boulevard and the crossing the Tower of Labor rises over it (its upper tiers,
// crown, cog and spire), so the bowl stays low on the boulevard's axis and nothing tall stands in front of the Tower.
// The shell: an oval (semi-axes a across, b along) whose south side is cut flat by the foyer's front (the doors, z 180,
// x -50..-30) and whose middle north side is the north doors' wall at PL.northZ: b and the centre are solved for both.
PL.shell = (() => {
  const a = 32, n = 29, tau = Math.asin((PL.annex[1] - PL.annex[0]) / 2 / a), D = (2 * Math.PI - 2 * tau) / n;
  const b = (PL.northZ - PL.annex[2]) / (Math.cos(tau) + Math.cos(D / 2)), cz = PL.annex[2] + b * Math.cos(tau);
  return { c: [PL.bowlC[0], cz], a, b, n, t0: -Math.PI / 2 + tau, D,
    H: 12.8, gateH: 5.4, brim: 2.6, eave: 14.2, crest: 5, endY: 17.4, sideY: 23, pitchIn: 15, pitchY: 16.4, haze: 3.2 };
})();
// a point on the shell ring: corner k (0 = the east end of the front, n = its west end; n + 1 wraps to 0), s metres in
const plShellPt = (k, s = 0) => { const S = PL.shell, t = S.t0 + (k % (S.n + 1)) * S.D; return [S.c[0] + (S.a - s) * Math.cos(t), S.c[1] + (S.b - s) * Math.sin(t)]; };
// the outward normal (x, z) of side k (side n is the flat front), and of corner k (the two sides' average)
function plShellOut(k) { const [x0, z0] = plShellPt(k + 1), [x1, z1] = plShellPt(k), l = Math.hypot(x1 - x0, z1 - z0); return [-(z1 - z0) / l, (x1 - x0) / l]; }
function plShellCornerOut(k) { const [a, b] = plShellOut(k), [c, d] = plShellOut((k + PL.shell.n) % (PL.shell.n + 1)), l = Math.hypot(a + c, b + d); return [(a + c) / l, (b + d) / l]; }
// the stands' crest at corner k: low over the two ends (the boulevard looks over the south one at the Tower of Labor),
// sweeping up to the long sides
const plCrestY = (k) => { const S = PL.shell, c = Math.cos(S.t0 + (k % (S.n + 1)) * S.D); return S.endY + (S.sideY - S.endY) * c * c; };
// one side of a ring band from (s0 in, y0) to (s1 in, y1), facing out (flip: facing in); a height may be a function of
// the corner (plCrestY)
function plRing(acc, key, k, s0, y0, s1, y1, uv, flip) {
  let [ka, kb] = flip ? [k, k + 1] : [k + 1, k];
  const Y = (y, kk) => typeof y === 'function' ? y(kk) : y, ya0 = Y(y0, ka), yb0 = Y(y0, kb), ya1 = Y(y1, ka), yb1 = Y(y1, kb);
  const [xa, za] = plShellPt(ka, s0), [xb, zb] = plShellPt(kb, s0), [xc, zc] = plShellPt(kb, s1), [xd, zd] = plShellPt(ka, s1), [ox, oz] = plShellOut(k), f = flip ? -1 : 1;
  const nr = (ya1 + yb1 - ya0 - yb0) / 2, ny = s1 - s0;   // (a flat band faces up, or down when flipped)
  aq(acc, key, [xd, ya1, zd], [xc, yb1, zc], [xb, yb0, zb], [xa, ya0, za], uv || [0, 0, 1, 1], Math.abs(nr) < 1e-9 ? [0, f, 0] : [f * nr * ox, f * ny, f * nr * oz], 99);
}
const plSideLen = (k) => { const [x0, z0] = plShellPt(k), [x1, z1] = plShellPt(k + 1); return Math.hypot(x1 - x0, z1 - z0); };
// a lattice mast from its foot (bx, bz) leaning to its head (tx, tz) at height h, a light bank turned down at (ax, az)
function plMast(acc, L, bx, bz, tx, tz, h, ax, az) {
  const w0 = 3.2, w1 = 1.3, sq = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const b = sq.map(([sx, sz]) => [bx + sx * w0 / 2, 0, bz + sz * w0 / 2]), t = sq.map(([sx, sz]) => [tx + sx * w1 / 2, h, tz + sz * w1 / 2]);
  for (const [i, j, nx, nz] of [[3, 2, 0, 1], [2, 1, 1, 0], [1, 0, 0, -1], [0, 3, -1, 0]]) {
    aq(acc, 'plLatticeTall', t[i], t[j], b[j], b[i], [0, 0, 1, Math.round(h / 12)], [nx, 0, nz], 99);   // the front faces, and the back ones seen through them
    aq(acc, 'plLatticeTall', t[j], t[i], b[i], b[j], [0, 0, 1, Math.round(h / 12)], [-nx, 0, -nz], 99);
  }
  sbox(acc, 'iron', tx, h, tz, 3.4, 3.4, 0.3, 0, { u: 1, v: 1, cell: 99 });
  // the bank: 9 x 5.4 m of lamps on a frame over the head, aimed down at the bowl (at (ax, 0, az))
  const dx = ax - tx, dz = az - tz, dl = Math.hypot(dx, dz), ux = dx / dl, uz = dz / dl, tilt = Math.atan2(h + 3, dl) * 0.75;
  const ca = Math.cos(tilt), sa = Math.sin(tilt), c = [tx + ux * 0.6, h + 3.2, tz + uz * 0.6], u = [-uz * 4.5, 0, ux * 4.5], v = [-ux * sa * 2.7, ca * 2.7, -uz * sa * 2.7];
  const Q = (s, r) => [c[0] + u[0] * s + v[0] * r, c[1] + u[1] * s + v[1] * r, c[2] + u[2] * s + v[2] * r];
  aq(acc, 'plFloodBank', Q(1, 1), Q(-1, 1), Q(-1, -1), Q(1, -1), [0, 0, 2, 1.5], [ux * ca, -sa, uz * ca], 99);
  aq(acc, 'plFloodBack', Q(-1, 1), Q(1, 1), Q(1, -1), Q(-1, -1), [0, 0, 2, 1.5], [-ux * ca, sa, -uz * ca], 99);
  // the front pair's bloom, a little behind the bank (both faces); the far pair has none: from the crossing they stand
  // beside the Tower of Labor, and it stays the brightest thing there
  if (bz < PL.shell.c[1]) { const k = 1.35, o = 0.5, H2 = (s, r) => { const q = Q(s * k, r * k); return [q[0] - ux * ca * o, q[1] + sa * o, q[2] - uz * ca * o]; };
    aq(acc, 'plHalo', H2(1, 1), H2(-1, 1), H2(-1, -1), H2(1, -1), [0, 0, 1, 1], null, 99); aq(acc, 'plHalo', H2(-1, 1), H2(1, 1), H2(1, -1), H2(-1, -1), [0, 0, 1, 1], null, 99); }
  for (const s of [-1, 1]) { const [px, py, pz] = Q(s * 0.9, -1); sbox(acc, 'iron', px, h, pz, 0.25, 0.25, py - h, 0, { u: 1, v: 1, top: false, cell: 99 }); }
  sbox(acc, 'litRed', tx, h + 6.4, tz, 0.4, 0.4, 0.4, 0, { u: 1, v: 1, cell: 99 });
  plSolid(bx - w0 / 2, bz - w0 / 2, bx + w0 / 2, bz + w0 / 2, 0, 8);
  // its light: hard white down onto the roof and the bowl, a pool at its foot
  plLight(L, c[0] + ux * 9, h - 6, c[2] + uz * 9, '#fff4dc', 34, 1.6);
  plLight(L, bx + ux * 3, 6, bz + uz * 3, '#fff0d8', 12, 0.9);
}
function buildPalaceOutside(acc) {
  const L = PL.outLamps, G = PL.glowLamps, [g0, g1] = PL.gap, S = PL.shell, n = S.n, UP = '#ffe2b0';
  // ---- the boulevard of champions: paving between poplars that stop short, benches, sodium lamps; then the forecourt
  // opens wide in front of the bowl, a champion either side of it (none on the axis: the doors are in view all the way).
  // Its mouth is wide: the lawn on its south (local -x) side is paved too, and you come onto it across Station Square
  // from the crossing, north-west, the Tower ahead
  const [bx0, bx1, bz0, bz1] = PL.blvd, [fx0, fx1, fz0, fz1] = PL.fore;
  ground(acc, 'paving', bx0, bz0, bx1, bz1, 0.004, 4, { cell: 4 });
  ground(acc, 'paving', -74, bz0, bx0, bz1, 0.004, 4, { cell: 4 }); ground(acc, 'dirt', bx1, bz0, -6, bz1, 0, 4, { cell: 8 });
  for (let z = 154; z < bz1 - 1; z += 4.6) { plTree(acc, bx0 - 1.4, z); plTree(acc, bx1 + 1.4, z + 2.3); }
  for (let k = 0; k < 4; k++) plTree(acc, -22 + (k % 2) * 6, 155.5 + k * 2.4, 1.1);
  for (const [x, z, d] of [[bx0 + 0.5, 159, 1], [bx1 - 0.5, 162.5, -1]]) {
    sbox(acc, 'darkwood', x, 0.4, z, 0.5, 1.9, 0.08, 0, { u: 1, v: 1 }); sbox(acc, 'darkwood', x - d * 0.22, 0.45, z, 0.06, 1.9, 0.5, 0, { u: 1, v: 1 });
    for (const s of [-0.8, 0.8]) sbox(acc, 'iron', x, 0, z + s, 0.4, 0.06, 0.42, 0, { u: 1, v: 1 });
    plSolid(x - 0.3, z - 0.95, x + 0.3, z + 0.95, 0, 0.9);
  }
  plPost(acc, L, bx0 + 0.3, 156, 1); plPost(acc, L, bx1 - 0.3, 161, -1); plPost(acc, L, bx0 + 0.3, 165, 1);
  ground(acc, 'paving', fx0 - 2, fz0, fx1 + 2, fz1, 0.006, 4, { cell: 4 });
  ground(acc, 'asphaltK', -74, fz0, fx0 - 2, fz1, 0, 8, { cell: 8 }); ground(acc, 'asphaltK', fx1 + 2, fz0, -6, fz1, 0, 8, { cell: 8 });
  for (const s of [-1, 1]) { plStatue(acc, -40 + s * 13, 168.4, Math.PI, 1.15); sbox(acc, 'litWarm', -40 + s * 13, 0, 166.4, 0.3, 0.3, 0.2, 0, { u: 1, v: 1 }); plLight(L, -40 + s * 13, 2.4, 166, '#ffe8c0', 7, 1.4); }
  // asphalt round the bowl, never under a floor you can see from inside (the two would fight at the doors)
  for (const [a, b, c, d] of [[-74, -56.2, fz1, 253], [-23.8, -6, fz1, 253], [-56.2, PL.annex[0] - 0.2, fz1, 196], [PL.annex[1] + 0.2, -23.8, fz1, 196], [-56.2, g0 - 0.2, 245, 253], [g1 + 0.2, -23.8, 245, 253]])
    ground(acc, 'asphaltK', a, c, b, d, 0, 8, { cell: 12 });
  // flags down both sides of the forecourt, the Bear on the hoardings, sodium on the corners
  for (const [x, s] of [[fx0 - 1, 1], [fx1 + 1, -1]]) {
    for (const z of [167.5, 171.5]) { sbox(acc, 'iron', x, 0, z, 0.12, 0.12, 10, 0, { u: 1, v: 1 }); plate(acc, 'flag_kras', x + s * 0.9, 9.1, z, 1.7, 1.15, 0, 0, [0, 0, 1, 1], true); }
    for (const t of [-1.2, 1.2]) sbox(acc, 'iron', x, 0, 176 + t, 0.1, 0.1, 2.0, 0, { u: 1, v: 1, top: false });
    sbox(acc, 'darkwood', x, 2.0, 176, 0.12, 3.2, 2.6, 0, { u: 1, v: 1 });
    for (const f of [1, -1]) plate(acc, 'volkovPoster', x, 3.3, 176, 1.8, 2.4, f * s * Math.PI / 2, 0.08);   // both faces
  }
  plPost(acc, L, fx0 + 0.5, 179, 1); plPost(acc, L, fx1 - 0.5, 179, -1);
  // ---- the bowl's facade: two storeys of tall warm glass between giant pilasters on a stone plinth, all round the
  // oval; the north doors through it onto Parade Square; a heavy cornice; the front (side n) is the portico's, below
  const N = (n - 1) / 2, H = S.H;
  for (let k = 0; k < n; k++) {
    const [xa, za] = plShellPt(k + 1), [xb, zb] = plShellPt(k), len = Math.hypot(xb - xa, zb - za), um = len / 2;
    if (k === N) {   // the north doors: a doorway through the plinth and the lower glass, a canopy, a lit sign
      for (const [a, b, door] of [[xa, g0, 0], [g0, g1, 1], [g1, xb, 0]]) {
        if (!door) wall(acc, 'stone', a, za, b, zb, 0, 1, len, 1, { cell: 99 });
        wall(acc, 'plFacade', a, za, b, zb, door ? PL.tunnelH : 1, H, um, H - 1, { u0: (a - xa) / um, cell: 99 });
      }
      sbox(acc, 'plCornice', S.c[0], PL.tunnelH, za + 1.1, g1 - g0 + 2.4, 2.2, 0.3, 0, { u: 2, v: 0.3, top: 'plAttic', tu: 2 });
      sbox(acc, 'litWarm', S.c[0], PL.tunnelH - 0.06, za + 1.1, 1.2, 0.3, 0.06, 0, { u: 1, v: 1 }); plLight(L, S.c[0], PL.tunnelH - 0.4, za + 1.4, '#ffd8a0', 7, 1.3);
      plate(acc, 'palaceSign', S.c[0], PL.tunnelH + 0.8, za, 7, 0.94, 0, 0.05);
    } else {
      wall(acc, 'stone', xa, za, xb, zb, 0, 1, len, 1, { cell: 99 });
      const xm = (xa + xb) / 2, zm = (za + zb) / 2;   // two bays: a numbered gate to the stands in each, the tall glass over them
      [[xa, za, xm, zm], [xm, zm, xb, zb]].forEach(([p, q, r, t], j) => wall(acc, 'plGates', p, q, r, t, 1, S.gateH, len / 2 * 8, S.gateH - 1, { u0: ((2 * k + j) % 8) / 8, cell: 99 }));
      wall(acc, 'plFacade', xa, za, xb, zb, S.gateH, H, um, H - S.gateH, { cell: 99 });
      plRing(acc, 'paving', k, 0, 0.008, -3.2, 0.008, [0, 0, len / 4, 0.8]);   // a granite apron, warm from the uplights
    }
  }
  // the pilasters: at every corner and mid-side, uplit (every corner); none in the portico or the north doorway
  for (let k = 0; k <= n; k++) for (const mid of [0, 1]) {
    if (mid && (k === n || k === N)) continue;
    let x, z, ox, oz;
    if (mid) { const [x0, z0] = plShellPt(k), [x1, z1] = plShellPt(k + 1); [ox, oz] = plShellOut(k); x = (x0 + x1) / 2 + ox * 0.25; z = (z0 + z1) / 2 + oz * 0.25; }
    else { [ox, oz] = k === 0 || k === n ? plShellOut(k === 0 ? 0 : n - 1) : plShellCornerOut(k); [x, z] = plShellPt(k); x += ox * 0.25; z += oz * 0.25; }
    sbox(acc, 'plPilaster', x, 1, z, 0.8, 0.5, H - 1, Math.atan2(ox, oz), { u: 0.8, v: H - 1, top: false, skip: 'b', cell: 99 });
    if (!mid) { const lx = x + ox * 0.75, lz = z + oz * 0.75; aq(acc, 'litWarm', [lx - 0.15, 0.03, lz + 0.15], [lx + 0.15, 0.03, lz + 0.15], [lx + 0.15, 0.03, lz - 0.15], [lx - 0.15, 0.03, lz - 0.15], [0, 0, 1, 1], [0, 1, 0], 99); plLight(L, lx, 0.35, lz, UP, 9, 1.8); if (k % 2 === 0) plLight(L, x + ox * 2.4, H + 0.2, z + oz * 2.4, '#ffe8c0', 7, 0.9); }
  }
  // ---- over the facade: the cornice, a canopy brim lit underneath, a low attic; then the backs of the stands rising to
  // their crest (low at the ends, high along the sides: the bowl's sweep), flags along it, and inside it the open bowl:
  // the stands and the floor in floodlight (seen from up high: podezd 3's roof, the Tower). This is the outside's own
  // lid: the inside's saucer (PL.roofY) is under it, so it never shows through
  for (let k = 0; k <= n; k++) {
    const len = plSideLen(k), front = k === n;
    const reps = Math.max(1, Math.round(len / 3.4)), B = -1 - S.brim;
    plRing(acc, 'plAttic', k, 0, H, -0.6, H, [0, 0, 1, 0.2], true);                         // the cornice's soffit
    plRing(acc, 'plCornice', k, -0.6, H, -1, H + 0.6, [0, 0, reps, 1]);                    // the cornice, leaning out
    plRing(acc, 'plBrimUnder', k, -1, H + 0.6, B, H + 0.6, [0, 0, reps, 1], true);         // the canopy's brim: lamps under it,
    plRing(acc, 'plCornice', k, B, H + 0.6, B, H + 0.85, [0, 0, reps, 0.3]);               // its edge,
    plRing(acc, 'plRoofM', k, B, H + 0.85, -1, H + 0.95, [0, 0, 2, 1]);                    // its top
    plRing(acc, 'plAttic', k, -1, H + 0.95, -1, S.eave, [0, 0, reps, 0.5]);                // a low attic
    plRing(acc, 'plStandsBack', k, -1, S.eave, S.crest, plCrestY, [0, 0, reps, 1]);        // the backs of the stands
    plRing(acc, 'plStandsTop', k, S.crest, plCrestY, S.pitchIn, S.pitchY, [0, 0, 2, 2]);   // the stands, seen from above
    { const [xa, za] = plShellPt(k + 1, S.pitchIn), [xb, zb] = plShellPt(k, S.pitchIn), c = [S.c[0], S.pitchY, S.c[1]];
      aq(acc, 'plPitchTop', [xa, S.pitchY, za], [xb, S.pitchY, zb], c, c, [0, 0, 1, 1], [0, 1, 0], 99); }
    // a flag on the crest at every corner
    { const [ox, oz] = k === 0 || k === n ? plShellOut(k === 0 ? 0 : n - 1) : plShellCornerOut(k), [px, pz] = plShellPt(k, S.crest), y = plCrestY(k), phi = Math.atan2(ox, oz) + Math.PI / 2, [fx, fz] = LP(px, pz, phi, 0.95, 0);
      sbox(acc, 'iron', px, y - 0.3, pz, 0.09, 0.09, 4.4, 0, { u: 1, v: 1, top: false, skip: 'lr', cell: 99 }); plate(acc, 'flag_kras', fx, y + 3.4, fz, 1.8, 1.2, phi, 0, [0, 0, 1, 1], true); }
  }
  // the floodlights' glow rising off the crest (both faces): kept out of the Tower's sightlines from the boulevard and the
  // crossing, so the Tower's crown and cog stay the brightest things in the sky there
  const views = [[-40, 152.4], ACT1_WEST.toLocal(-40, 145)], tower = [-40, 330];
  PL.hazeSides = [];
  for (let k = 0; k <= n; k++) {
    const [x0, z0] = plShellPt(k, S.crest), [x1, z1] = plShellPt(k + 1, S.crest);
    const inLine = views.some(([vx, vz]) => {   // the side's bearing from there overlaps the Tower's (± 8°)
      const t = Math.atan2(tower[0] - vx, tower[1] - vz), a = Math.atan2(x0 - vx, z0 - vz) - t, b = Math.atan2(x1 - vx, z1 - vz) - t;
      return Math.min(a, b) < 0.14 && Math.max(a, b) > -0.14;
    });
    if (inLine) continue;
    PL.hazeSides.push(k);
    for (const f of [false, true]) plRing(acc, 'plHaze', k, S.crest, plCrestY, S.crest, (kk) => plCrestY(kk) + S.haze, [0, 0, 1, 1], f);
  }
  plLight(G, S.c[0], S.endY + 8, S.c[1], '#ffe6bc', 30, 1.6);   // the floods' light in the bowl (bakes only into this mesh)
  for (const s of [-1, 1]) plLight(G, S.c[0], S.endY + 5, S.c[1] + s * 17, '#ffe6bc', 22, 1.1);
  // ---- the portico, set into the front: giant columns the height of the pilasters, PALACE OF SPORT along the frieze,
  // the athletes' relief over the doors behind them. Low enough that the Tower of Labor rises over it down the boulevard.
  { const [ax0, ax1, az0] = PL.annex, [d0, d1] = PL.doorW, pz = az0 - 3.6, ez0 = az0 - 4.5, ew = ax1 - ax0 + 0.4, ex = (ax0 + ax1) / 2, ezc = (ez0 + az0) / 2, ed = az0 - ez0;
    for (const [a, b] of [[ax0, d0], [d1, ax1]]) plFace(acc, 'plDoors', a, az0, b, az0, 0, 2.8, 0, -1, 2, 2.8, { cell: 99 });
    plFace(acc, 'plAttic', ax0, az0, ax1, az0, 2.8, 3.4, 0, -1, 2, 0.6, { cell: 99 });
    plFace(acc, 'plFacade', ax0, az0, ax1, az0, 3.4, H, 0, -1, (ax1 - ax0) / 6, H - 1, { cell: 99 });
    plate(acc, 'plFrieze', ex, 7.6, az0, ew - 1.6, 1.5, Math.PI, 0.04);
    for (const x of [-49.2, -46.4, -43.6, -36.4, -33.6, -30.8]) {
      sbox(acc, 'stone', x, 0, pz, 1.2, 1.2, 0.5, 0, { u: 1, v: 0.5, top: 'stone', tu: 1, cell: 99 });
      cyl(acc, 'plColumn', x, 0.5, pz, 0.5, 0.44, 8.5, 8, { u: 0.35, v: 8.5, cell: 99 });
      sbox(acc, 'plCornice', x, 9.0, pz, 1.25, 1.25, 0.5, 0, { u: 1.25, v: 0.5, top: false, cell: 99 });
      plSolid(x - 0.6, pz - 0.6, x + 0.6, pz + 0.6, 0, 9.5);
      aq(acc, 'litWarm', [x - 0.2, 0.52, pz - 0.8], [x + 0.2, 0.52, pz - 0.8], [x + 0.2, 0.52, pz - 0.65], [x - 0.2, 0.52, pz - 0.65], [0, 0, 1, 1], [0, 1, 0], 99);
      plLight(L, x, 0.6, pz - 1.0, UP, 6.5, 1.2);
    }
    sbox(acc, 'plCornice', ex, 9.5, ezc, ew, ed, 0.5, 0, { u: 2, v: 0.5, top: false, cell: 99 });
    sbox(acc, 'plAttic', ex, 10.0, ezc, ew, ed, 2.0, 0, { u: 3, v: 2, top: false, cell: 99 });
    sbox(acc, 'plCornice', ex, 12.0, ezc - 0.2, ew + 0.8, ed + 0.4, 0.55, 0, { u: 2, v: 0.55, top: 'roofDark', tu: 4, cell: 99 });
    aq(acc, 'plAttic', [ax0 - 0.2, 9.5, az0], [ax1 + 0.2, 9.5, az0], [ax1 + 0.2, 9.5, ez0], [ax0 - 0.2, 9.5, ez0], [0, 0, 6, 2], [0, -1, 0], 99);   // the portico's ceiling
    for (const x of [-46, -40, -34]) { aq(acc, 'litWarm', [x - 0.5, 9.48, pz + 1.3], [x + 0.5, 9.48, pz + 1.3], [x + 0.5, 9.48, pz + 0.5], [x - 0.5, 9.48, pz + 0.5], [0, 0, 1, 1], [0, -1, 0], 99); plLight(L, x, 8.8, pz + 0.9, '#ffd8a0', 8, 0.8); }
    // PALACE OF SPORT in big red letters along the frieze (read left to right: from +x to -x as you face north)
    { const text = 'PALACE OF SPORT', step = 1.24, sp = 0.75, wid = [...text].reduce((w, ch) => w + (ch === ' ' ? sp : step), 0);
      let x = ex + wid / 2; const az = ez0 - 0.03;
      for (const ch of text) { if (ch === ' ') { x -= sp; continue; } const k = 'PALCEOFSRT'.indexOf(ch); plate(acc, 'plLetters', x - step / 2, 11.0, az, 1.14, 1.56, Math.PI, 0.03, [k / 10, 0, (k + 1) / 10, 1]); x -= step; } }
    plLight(L, ex, 10.0, ez0 - 4, '#ffe2b0', 9, 1.2);   // the name, floodlit
    // monumental steps only as edges: three painted risers across the front, stepped cheeks either side (solid)
    for (const [z, k] of [[pz - 2.4, 0], [pz - 1.8, 1], [pz - 1.2, 2]]) aq(acc, 'plStepEdge', [ax0 - 1.5, 0.01 + k * 0.002, z + 0.6], [ax1 + 1.5, 0.01 + k * 0.002, z + 0.6], [ax1 + 1.5, 0.01 + k * 0.002, z], [ax0 - 1.5, 0.01 + k * 0.002, z], [0, 0, 12, 1], [0, 1, 0], 99);
    for (const s of [-1, 1]) {
      const x = ex + s * (ew / 2 + 0.75);
      for (const [h, d] of [[0.45, 5.4], [0.9, 4.8], [1.35, 4.2]]) sbox(acc, 'stone', x, 0, az0 - d / 2 + 0.2, 1.4, d, h, 0, { u: 1, v: 0.45, top: 'stone', tu: 1, cell: 99 });
      plSolid(x - 0.7, az0 - 5.2, x + 0.7, az0, 0, 1.35);
    }
    plSolid(ax0, az0, d0, az0 + 0.2, 0, H); plSolid(d1, az0, ax1, az0 + 0.2, 0, H);
    // the marquee boards either side of the portico, facing the boulevard
    for (const [k, v] of [[0, 0], [n - 1, 0.5]]) { const [x0, z0] = plShellPt(k), [x1, z1] = plShellPt(k + 1), [ox, oz] = plShellOut(k);
      plate(acc, 'plMarquee', (x0 + x1) / 2, 10.6, (z0 + z1) / 2, 6.4, 1.87, Math.atan2(ox, oz), 0.62, [0, v, 1, v + 0.5]);
      plLight(L, (x0 + x1) / 2 + ox * 3, 8.6, (z0 + z1) / 2 + oz * 3, '#ffd8a8', 6, 0.7); } }
  // ---- four lattice floodlight masts, three times the bowl's height, leaning in over the roof, their banks aimed down
  // into the bowl. They flank the boulevard wide (the Tower stays clear down its axis) and stand off the crossing's
  // sightline to it. PL.masts: [foot x, foot z, head x, head z, height, aim x, aim z]
  for (const [bx, bz, tx, tz, h, ax, az] of PL.masts) plMast(acc, L, bx, bz, tx, tz, h, ax, az);
}
// ---- Station Square (world): off the skewed crossing you come up onto the square's south-east corner facing north-west,
// the Tower of Labor just right of straight ahead over the goods yard and the Palace, and walk straight on across the
// square into the boulevard's wide mouth. East Station stands along the square's east side, its back to the wall slabs,
// which stand between the sector and the Accords wall (and hide Columbia's ridge from here). Flat (no steps: VR).
// a panel slab, n storeys of 2.8 m on Superblock 14's 'slab' painting (a repeat: 4 bays x 4 storeys, 12 m x 11.2 m),
// blank 'slabEnd' gables; one quad per repeat (cell 999). k shifts the window pattern so no two faces match.
function plSlab(acc, x0, x1, z0, z1, n, y0 = 0, k = 0) {
  const h = n * 2.8, y1 = y0 + h, longX = x1 - x0 > z1 - z0, o = { cell: 999 };
  const face = (a, b, c, d, tx, tz, key, i) => plFace(acc, key, a, b, c, d, y0, y1, tx, tz, 12, 11.2, Object.assign({ u0: ((k + i) * 0.25) % 1, v0: ((k * 3 + i) * 0.25) % 1 }, o));
  face(x0, z0, x0, z1, -1, 0, longX ? 'slabEnd' : 'slab', 0); face(x1, z0, x1, z1, 1, 0, longX ? 'slabEnd' : 'slab', 1);
  face(x0, z0, x1, z0, 0, -1, longX ? 'slab' : 'slabEnd', 2); face(x0, z1, x1, z1, 0, 1, longX ? 'slab' : 'slabEnd', 3);
  aq(acc, 'roofDark', [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 0, 1, 1], [0, 1, 0], 999);
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, [lw, ld] = longX ? [5, 3.4] : [3.4, 5];   // the lift's machine room on the roof
  sbox(acc, 'concrete', mx, y1, mz, lw, ld, 3, 0, { u: 4, v: 3, top: 'roofDark', tu: 99, cell: 999 });
  plSolid(x0, z0, x1, z1, y0, y1);
}
function buildStationSquare(acc, L, bake) {
  const [sx0, sx1, sz0, sz1] = PL.station, sm = (sz0 + sz1) / 2, [w0, , , w3] = PL.walk, [yx0, , yz0, yz1] = PL.yard, yx1 = PL.yardEnd, yw = PL.yardTop, yc = 156;
  // the paving: the arrival, the station's forecourt, the strip under the wall slab (the boulevard's mouth is the
  // Palace's: its south lawn is paved over), and the bit of the mouth between the goods yard and the boulevard
  ground(acc, 'paving', w0[0] - 0.3, PL.fenceN, sx0, yc, 0.004, 4, { cell: 4 }); ground(acc, 'paving', yx1 - 0.3, yc, sx0, yw, 0.004, 4, { cell: 4 });
  ground(acc, 'paving', -72.2, yw, sx0, 164, 0.004, 4, { cell: 4 });
  ground(acc, 'paving', -55.6, 164, sx0, sz1, 0.004, 4, { cell: 4 });
  ground(acc, 'paving', -55.6, sz1, w3[1] + 0.3, w3[3] + 0.3, 0.004, 4, { cell: 4 });
  ground(acc, 'dirt', -55.6, w3[3] + 0.3, -50, 230, 0, 4, { cell: 8 });
  // East Station: a two-storey hall along the square's east side, its back to the slabs; a taller entrance block in the
  // middle with its glass front, the name, a clock and a gilt spire with the gold cog; a canopy over the doors
  sbox(acc, 'towerFace', (sx0 + sx1) / 2, 0, sm, sx1 - sx0, sz1 - sz0, 12, 0, { u: 8, v: 8, top: 'roofDark', tu: 8, cell: 6 });
  sbox(acc, 'decoGold', (sx0 + sx1) / 2, 11.4, sm, sx1 - sx0 + 0.4, sz1 - sz0 + 0.4, 0.6, 0, { u: 4, v: 0.6, top: false, cell: 6 });
  const ex0 = sx0 - 1.5, ex1 = sx1 - 2, ez0 = sm - 6, ez1 = sm + 6, ec = (ex0 + ex1) / 2;
  sbox(acc, 'towerFace', ec, 0, sm, ex1 - ex0, ez1 - ez0, 19, 0, { u: 8, v: 8, top: 'roofDark', tu: 8, cell: 6 });
  sbox(acc, 'decoGold', ec, 18.3, sm, ex1 - ex0 + 0.4, ez1 - ez0 + 0.4, 0.7, 0, { u: 4, v: 0.7, top: false, cell: 6 });
  plate(acc, 'glassFront', ex0, 6.5, sm, 9, 11, -Math.PI / 2, 0.04, [0, 0, 3, 11 / 3]);
  plate(acc, 'stationSign', ex0, 13.8, sm, 10.5, 10.5 * 13 / 84, -Math.PI / 2, 0.05);
  plate(acc, 'clockFace', ex0, 16.4, sm, 2.4, 2.4, -Math.PI / 2, 0.05);
  frustum(acc, 'gilt', ec, 19, sm, 4, 4, 0.4, 0.4, 9, 0, { cell: 8 });
  for (const ph of [0, Math.PI / 2]) plate(acc, 'cog', ec, 29.0, sm, 3.4, 3.4, ph, 0, [0, 0, 1, 1], true);   // the gold cog on the spire
  sbox(acc, 'concrete', sx0 - 3.2, 4.2, sm, 3.4, ez1 - ez0 + 6, 0.35, 0, { u: 2, v: 1, top: 'roofDark', tu: 4 });
  sbox(acc, 'litWarm', sx0 - 3.2, 4.12, sm, 1.6, ez1 - ez0, 0.08, 0, { u: 1, v: 1 });
  for (const z of [sm - 8.5, sm + 8.5]) { sbox(acc, 'iron', sx0 - 4.6, 0, z, 0.2, 0.2, 4.2, 0, { u: 1, v: 1 }); plSolid(sx0 - 4.75, z - 0.15, sx0 - 4.45, z + 0.15, 0, 4.2); }
  plate(acc, 'banner', sx0, 6.5, (ez1 + sz1) / 2, 3, 8, -Math.PI / 2, 0.05);
  // the departures board on the hall's front, south of the entrance and over the canopy's line: KRASNOGRAD · 31 HRS
  const bz = (sz0 + ez0) / 2;
  plate(acc, 'decoGold', sx0, 6.5, bz, 5.7, 2.5, -Math.PI / 2, 0.05); plate(acc, 'departures', sx0, 6.5, bz, 5.4, 2.25, -Math.PI / 2, 0.08);
  plLight(L, sx0 - 3.2, 3.6, sm, '#ffd8a0', 12, 1.5); plLight(L, ex0 - 2, 12, sm, '#ffe2b4', 14, 1.0); plLight(L, sx0 - 2.5, 7, bz, '#ffe2b4', 6, 0.8);   // the entrance, the name and the clock, the board
  plSolid(sx0, sz0, sx1, sz1, 0, 12); plSolid(ex0, ez0, ex1, ez1, 0, 19);
  // the wall slabs (PL.slabs), and on the one that closes the boulevard's view east, a faded banner on the axis and
  // PEACE · LABOR · UNITY along its top, floodlit from the strip (that light bakes into this mesh only)
  PL.slabs.forEach(([x0, x1, z0, z1, n, y0], k) => plSlab(acc, x0, x1, z0, z1, n, y0 || 0, k));
  { const [x0, , z0, z1] = PL.slabs[1], top = PL.slabs[1][4] * 2.8;
    plate(acc, 'prBanner', x0, 30, 198, 5.2, 15.6, -Math.PI / 2, 0.06);
    plate(acc, 'prSlogan', x0, top - 3.4, (z0 + z1) / 2, 34, 34 * 14 / 136, -Math.PI / 2, 0.06);
    bake.push(lightFromHex([x0 - 7, 18, 198], '#ffd8a0', 26, 1.6), lightFromHex([x0 - 9, top - 12, (z0 + z1) / 2], '#ffe2b4', 30, 1.2)); }
  // and on the gable over the tracks (you see it from the crossing), Superblock 14's worker mosaic, big
  { const [x0, x1, z0] = PL.slabs[0], cx = (x0 + x1) / 2;
    plate(acc, 'mosaicK', cx, 30, z0, 10.2, 17, Math.PI, 0.06);
    bake.push(lightFromHex([cx, 14, z0 - 7], '#ffe2b4', 26, 1.5)); }
  // sodium posts round the square, poplars under the slab, a monument to the railwaymen facing the crossing
  for (const [x, z, d] of [[w0[0] + 0.3, 160.5, 1], [-46.8, 152.4, -1], [-58.2, 176, 1], [w3[1] - 0.2, 186, -1], [w3[0] + 0.3, 211, 1]]) plPost(acc, L, x, z, d);
  for (const z of [185, 191, 205.5, 211]) plTree(acc, -52.8, z, 1.1);
  plStatue(acc, -53.5, 170.5, Math.atan2(PL.cross.arrive[0] + 53.5, PL.cross.arrive[1] - 170.5));
  plLight(L, -53, 2.4, 167.6, '#ffe8c0', 7, 1.2);
  // the strip ends at a low wall (the boulevard's north lawn beyond)
  sbox(acc, 'concrete', (w3[0] + w3[1]) / 2, 0, w3[3] + 0.45, w3[1] - w3[0] + 0.6, 0.3, 1.0, 0, { u: 6, v: 1, top: 'wallTop', tu: 6, cell: 6 }); plSolid(w3[0], w3[3] + 0.3, w3[1] + 0.3, w3[3] + 0.6, 0, 1.0);
  // the goods yard: two sidings with a few box wagons standing on them, sodium on two masts, a low wall round its end;
  // nothing tall, so from the crossing you see over it to the Palace and the Tower of Labor
  ground(acc, 'asphaltK', yx0, yz0, yx1, yw, 0, 8, { cell: 8 }); ground(acc, 'asphaltK', yx1, yz0, w0[0] - 0.3, yc, 0, 8, { cell: 8 }); ground(acc, 'asphaltK', yx0, yw, -72.2, yz1, 0, 8, { cell: 8 });
  for (const tz of [155.2, 159.6]) aq(acc, 'track', [yx0, 0.012, tz + 1.2], [yx0, 0.012, tz - 1.2], [yx1, 0.012, tz - 1.2], [yx1, 0.012, tz + 1.2], [0, 0, 1, (yx1 - yx0) / 2], [0, 1, 0], 4);
  for (const [x, tz, t] of [[-80, 155.2, 0], [-95, 155.2, 1], [-118, 159.6, 2], [-133, 159.6, 0], [-148, 155.2, 1]]) {
    acc.tint = [[0.62, 0.36, 0.3], [0.42, 0.4, 0.36], [0.5, 0.42, 0.3]][t];
    sbox(acc, 'trainSide', x, 0.5, tz, 13.5, 2.8, 3.3, 0, { u: 13.5, v: 3.3, top: 'roofDark', tu: 4 });
    acc.tint = [1, 1, 1];
    for (const bx of [x - 4.5, x + 4.5]) sbox(acc, 'black', bx, 0, tz, 2.2, 2.4, 0.5, 0, { u: 1, v: 1 });
  }
  for (const [a, b, c, d] of [[w0[0] - 0.6, w0[0] - 0.3, yz0, yc + 0.3], [yx1 - 0.3, w0[0] - 0.3, yc, yc + 0.3], [yx1 - 0.3, yx1, yc, yw + 0.3], [-72.2, yx1, yw, yw + 0.3], [-72.5, -72.2, yw, yz1]]) {
    sbox(acc, 'concrete', (a + b) / 2, 0, (c + d) / 2, b - a, d - c, 1.0, 0, { u: 6, v: 1, top: 'wallTop', tu: 6, cell: 6 }); plSolid(a, c, b, d, 0, 1.0); }
  for (const x of [-100, -140]) { sbox(acc, 'iron', x, 0, 162.6, 0.3, 0.3, 12, 0, { u: 1, v: 1 }); sbox(acc, 'litSodium', x, 12, 162.6, 1.6, 0.6, 0.3, 0, { u: 1, v: 1 }); plLight(L, x, 11.5, 160, CFG.street.light.sodium, 20, 1.3); }
}
// ---- the crossing (world): the railway west, the tunnel under the wall, the planks, the fence; Station Square and East Station
function buildPalaceCrossing(acc, bake) {
  const L = PL.crossLamps, [rx0, rx1] = PL.rail;
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
  // the crossing: planks laid skewed over the rails from the gap in the bank's fence, north-west (PL.cross); a low fence
  // along the north side of the tracks with a gap where it comes out; two posts with the X sign where the barriers pivot
  { const C = PL.cross, X = PL.crossX, za = PL.barS + 0.1, zb = PL.barN - 0.4;
    aq(acc, 'darkwood', [X(za) - C.hw, 0.02, za], [X(za) + C.hw, 0.02, za], [X(zb) + C.hw, 0.02, zb], [X(zb) - C.hw, 0.02, zb], [0, 0, C.hw, (zb - za) / 2], [0, 1, 0], 4);
    const n0 = X(PL.fenceN) - C.hw - 0.1, n1 = X(PL.fenceN) + C.hw + 0.1;
    for (const [a, b] of [[-74, n0], [n1, PL.slabs[3][0]]]) { sbox(acc, 'concrete', (a + b) / 2, 0, PL.fenceN, b - a, 0.3, 1.0, 0, { u: 6, v: 1, top: 'wallTop', tu: 6, cell: 6 }); plSolid(a, 151.4, b, 151.7, 0, 1.0); } }
  for (const [x, z] of PL.crossPosts) {
    sbox(acc, 'iron', x, 0, z, 0.14, 0.14, 3.5, 0, { u: 1, v: 1 }); sbox(acc, 'iron', x, 0, z, 0.5, 0.5, 1.2, 0, { u: 1, v: 1 });
    plate(acc, 'crossSign', x, 3.15, z, 1.1, 1.1, 0, 0.09, [0, 0, 1, 1], true);
    sbox(acc, 'black', x, 2.25, z, 1.0, 0.12, 0.3, 0, { u: 1, v: 1 });
    plSolid(x - 0.25, z - 0.25, x + 0.25, z + 0.25, 0, 3.5);
  }
  buildStationSquare(acc, L, bake);
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
    // the Bear's old club over the east wall bars, the home league's pennants under the coach's window
    plate(acc, 'gymVolkov', x1, 3.85, 192.8, 4, 1.5, -Math.PI / 2, 0.03); plate(acc, 'gymPennants', x1, 2.05, 197.35, 4, 1, -Math.PI / 2, 0.03);
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
  // (the crossing is skewed, so each arm spans the planks along the tracks: PL.cross.arm)
  const AL = PL.cross.arm;
  for (const [x, z, flip] of [[PL.crossPosts[0][0], PL.barS, 0], [PL.crossPosts[1][0], PL.barN, Math.PI]]) {
    const acc = new GeoAcc(); sbox(acc, 'boom', -AL / 2 - 0.1, -0.07, 0, AL, 0.12, 0.14, 0, { u: 2, v: 0.14 });
    const arm = new THREE.Mesh(acc.geometry({ ambient: [0.55, 0.5, 0.48], lights: [] }), makeMat('street', { baked: true })); arm.frustumCulled = false;
    const pivot = new THREE.Group(), base = new THREE.Group(); pivot.add(arm); base.add(pivot);
    base.position.set(x, 1.05, z); base.rotation.y = flip; scene.add(base); TRAIN.booms.push({ base, pivot });
  }
  const lamps = (side) => {
    const acc = new GeoAcc();
    for (const [x, z] of PL.crossPosts) for (const dz of [-0.08, 0.08]) sbox(acc, 'litRed', x + side * 0.38, 2.12, z + dz, 0.22, 0.04, 0.26, 0, { u: 1, v: 1 });
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
  PL.inLamps = []; PL.outLamps = []; PL.glowLamps = []; PL.crossLamps = [];
  const F = CFG.street.fog, Lt = CFG.street.light;
  const mk = (acc, light) => { const m = new THREE.Mesh(acc.geometry(light), makeMat('street', { baked: true })); m.matrixAutoUpdate = false; m.updateMatrix(); m.frustumCulled = false; m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far }; scene.add(m); return m; };
  // the crossing, the railway and Station Square stay where they are (world): the train and the barriers too
  const xAcc = new GeoAcc(), bake = []; buildPalaceCrossing(xAcc, bake); buildTrain();
  { const on = () => level.name === 'palace';   // Station Square (PL.walk), and onto the boulevard where the strip meets it
    PL.walk.forEach(([x0, x1, z0, z1], k) => addWalk({ x0, x1, z0, z1, pad: 0.3, area: 'plSquare' + k, on }));
    addWalk({ x0: -57.5, x1: -55, z0: 190.3, z1: 205.7, pad: 0.3, area: 'plSqBlvd', on }); }
  // from the boulevard on, the level is laid west into the sector by its frame (src/levels.js)
  ACT1_WEST.begin();
  const inAcc = new GeoAcc(), outAcc = new GeoAcc();
  buildPalaceInside(inAcc); buildPalaceOutside(outAcc);
  PL.inMesh = mk(inAcc, { ambient: CFG.palace.light.inAmbient, lights: PL.inLamps }); PL.inTris = inAcc.tris;
  PL.outMesh = mk(outAcc, { ambient: Lt.ambient, sky: Lt.sky, lights: PL.outLamps.concat(PL.glowLamps, ACT1_WEST.localLamps(PL.crossLamps)) }); PL.outTris = outAcc.tris;   // (the glow over the bowl lights only this)
  for (const l of PL.inLamps.concat(PL.outLamps)) ST.lamps.push(l);
  buildShutter();
  // where you can walk: the gap in the fence, the crossing (once the train's by), the boulevard, the forecourt, the foyer,
  // the gym, the tunnel, the arena floor, the way out north (once the Bear's down)
  const on = () => level.name === 'palace', P = 0.3, [g0, g1] = PL.gap, [d0, d1] = PL.doorW;
  const [bx0, bx1, bz0, bz1] = PL.blvd, [fx0, fx1, fz0, fz1] = PL.fore;
  // the round floor: overlapping rects inside the stands' boards (corners on a circle Rw from the centre)
  const [cx, cz] = PL.bowlC, Rw = PL.floorR * Math.cos(Math.PI / PL.sides) - 0.35;
  const round = [10, 28, 45, 62, 80].map((d, k) => { const c = Math.cos(d * Math.PI / 180) * Rw, s = Math.sin(d * Math.PI / 180) * Rw; return { x0: cx - c, x1: cx + c, z0: cz - s, z1: cz + s, pad: P, area: 'plFloor' + k, on }; });
  // the skewed crossing: overlapping bands along it, each as wide as the planks over its own stretch
  { const C = PL.cross, X = PL.crossX, z0 = PL.barS - 0.4, z1 = PL.barN + 0.4, n = Math.ceil((z1 - z0) / 0.7);
    for (let i = 0; i < n; i++) { const a = z0 + (z1 - z0) * i / n, b = z0 + (z1 - z0) * (i + 1) / n;
      addWalk({ x0: X(b) - C.hw + 0.2, x1: X(a) + C.hw - 0.2, z0: a, z1: b, pad: P, area: 'plCross' + i, world: true, on: () => on() && TRAIN.open }); } }
  [ { x0: PZ.gap[0] + 0.5, x1: PZ.gap[1] - 0.5, z0: 135.6, z1: PL.barS - 0.3, pad: P, area: 'plGap', world: true, on: () => (level.name === 'podezd' && CRADLE.phase === 'bottom') || on() },
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
  PL.crossMesh = mk(xAcc, { ambient: Lt.ambient, sky: Lt.sky, lights: PL.crossLamps.concat(SBX.lamps.filter(l => l[0][2] > 128), PL.outLamps, bake) }); PL.crossTris = xAcc.tris;
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
  if (P.phase === 'run' && tail < PL.cross.west - 3) { P.phase = 'lift'; P.t = 0; }
  if (P.phase === 'lift') { P.lift = Math.min(1, P.t / T.lift); if (P.lift >= 1) { P.phase = 'open'; P.open = true; showSign('palace', 2.2); } }
  placeTrain();
}
defineLevel('palace', {
  menu: '5 · The Palace of Sport (Volkov)', cfg: () => CFG.palace, build: buildPalace, rooms: palaceRooms, frame: ACT1_WEST,
  outside: () => [PL.outMesh, PL.crossMesh, ...TRAIN.booms.map(B => B.base)], rects: () => [ACT1_WEST.rect(PL.rect), PL.rail, PL.sqRect, PL.yard],
  start: (f) => startPalace(f), update: (dt) => updatePalace(dt),
  after: 'podezd', enter: () => player.head.z > PL.fenceZ + 0.2 && Math.abs(player.head.x - PL.cross.x) < 2.2,   // through the gap in the fence
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
  if (!fromPodezd) { placePlayer(CFG.palace.start[0], CFG.palace.start[1], Math.PI - PL.cross.ang); rig.position.y = 0; }   // facing along the crossing
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  showSign('crossing', 2.0);
}
