'use strict';
// ============================== the room ====================================
// Back wall (z=-5) Hinomoto: bar, lanterns, neon. Left (x=-5) Krasnovia. Right (x=+5) Columbia. Front (z=+5) door.
const ROOM = { x: 5, z: 5, h: 3.4, wall: 4.65 };
const BAR = { x0: -3.3, x1: 3.3, z0: -3.95, z1: -3.25, top: 1.15 };
const TABLES = [{ x: -2.6, z: 1.2 }, { x: -1.4, z: 3.3 }];
const POOL = { x: 2.7, z: 1.2, hx: 0.78, hz: 1.28, top: 0.86 };
// The three Accords borders come in under the door from Tripoint Square's setts and meet on the floor in front of the bar,
// at the brass Tripoint disc where you start: the line from the door splits Krasnovia (left wall) from Columbia (right
// wall); the other two run past the bar's ends to the side walls, cutting off Hinomoto (the back wall, the bar).
const TRIPOINT = { x: 0, z: -1.7, r: 0.55 };
const BAR_LINES = [[0, ROOM.z - 0.03], [-(ROOM.x - 0.04), -3.88], [ROOM.x - 0.04, -3.88]];
// Corner furniture (solid: goons and props collide, nobody walks through): Sasha's back counter, the Hinomoto pachinko
// pair, the Columbian diner booth, the Krasnovian chess table. Boxes [x0, y0, z0, x1, y1, z1].
const BAR_SOLIDS = [
  [-2.8, 0, -5, 2.8, 1.0, -4.6],                                                 // the back counter under the mirror
  [-4.98, 0, -4.45, -4.55, 1.78, -3.38],                                         // pachinko x2 (left wall, back corner)
  [3.9, 0, -5, 5, 0.5, -4.5], [3.9, 0.5, -5, 5, 1.16, -4.82],                    // the booth: back bench and its back
  [4.08, 0, -4.42, 5, 0.77, -3.78],                                              //   the table
  [3.9, 0, -3.7, 5, 0.5, -3.25], [3.9, 0.5, -3.37, 5, 1.16, -3.25],              //   front bench and its back
  [-4.52, 0, 3.23, -3.88, 0.74, 3.87],                                           // the chess table
  [-4.45, 0, 2.74, -3.95, 0.47, 3.16], [-4.45, 0, 2.74, -3.95, 0.98, 2.8],       //   its chairs
  [-4.45, 0, 3.94, -3.95, 0.47, 4.36], [-4.45, 0, 4.3, -3.95, 0.98, 4.36],
];
const SURFACES = [   // things props can rest on: x0,x1,z0,z1,top (physics works off WORLD_BOXES: these are for reference)
  { x0: BAR.x0, x1: BAR.x1, z0: BAR.z0, z1: BAR.z1, top: BAR.top },
  ...TABLES.map(t => ({ x0: t.x - 0.45, x1: t.x + 0.45, z0: t.z - 0.45, z1: t.z + 0.45, top: 0.79 })),
  { x0: POOL.x - POOL.hx, x1: POOL.x + POOL.hx, z0: POOL.z - POOL.hz, z1: POOL.z + POOL.hz, top: POOL.top },
  { x0: 4.08, x1: 5, z0: -4.42, z1: -3.78, top: 0.77 }, { x0: -4.52, x1: -3.88, z0: 3.23, z1: 3.87, top: 0.74 },
];
const BLOCKERS = [   // xz boxes nobody walks through
  { x0: BAR.x0, x1: BAR.x1, z0: BAR.z0, z1: BAR.z1 },
  { x0: POOL.x - POOL.hx, x1: POOL.x + POOL.hx, z0: POOL.z - POOL.hz, z1: POOL.z + POOL.hz },
  { x0: -4.95, x1: -4.35, z0: 1.0, z1: 1.95 },  // jukebox
  { x0: -2.8, x1: 2.8, z0: -5, z1: -4.6 },      // the back counter
  { x0: -5, x1: -4.55, z0: -4.45, z1: -3.38 },  // pachinko
  { x0: 3.9, x1: 5, z0: -5, z1: -3.25 },        // the diner booth (0.6 m clear of the bar's end: you can still get behind it)
  { x0: -4.6, x1: -3.85, z0: 2.74, z1: 4.36 },  // the chess table and chairs
];
// Where anyone can stand: a union of xz rectangles (the bar, the doorway once the door is open, the street).
// Walls are wherever these rectangles end. `on()` gates a rectangle (the doorway needs an open door).
// Walking bounds are (edge - r) + pad; walls for ragdoll particles sit at w* (edge + 1 cm unless given).
const WALK = [
  { x0: -ROOM.wall, x1: ROOM.wall, z0: -ROOM.wall, z1: ROOM.wall, pad: 0.3, wx0: -(ROOM.x - 0.04), wx1: ROOM.x - 0.04, wz0: -(ROOM.z - 0.04), wz1: ROOM.z - 0.04, area: 'bar' },
];
// Floors: a rectangle can carry a height. Flat: `y` (default 0). Ramp or stair flight: `y0` to `y1` along `along` ('x' or
// 'z'), changing over `run: [a, b]` (coordinates along that axis, a < b; default the rect's own extent) and level at y0
// before a, y1 after b, so a ramp's rect can overlap the floors at either end like any other walk rects (they must overlap
// to connect). Stairs walk as a ramp; the treads are only drawn (stairSteps).
//   addWalk({ x0: 0, x1: 8, z0: -4, z1: 3, pad: 0.3 })                                        // ground (y 0)
//   addWalk({ x0: 2, x1: 4, z0: 2, z1: 9, y0: 0, y1: 3, along: 'z', run: [3, 8], pad: 0.3 })  // a flight up to 3 m
//   addWalk({ x0: 0, x1: 8, z0: 8, z1: 12, y: 3, pad: 0.3 })                                  // the landing it reaches
// Rects may overlap in xz at different heights (stacked floors): whatever is within CFG.floors.step of your height counts.
function addWalk(w) { prepWalk(w); WALK.push(w); WALK.flat = floorsFlat(WALK); }
function prepWalk(w) {
  w.pad = w.pad || 0; for (const [k, s] of [['x0', -1], ['x1', 1], ['z0', -1], ['z1', 1]]) if (w['w' + k] === undefined) w['w' + k] = w[k] + s * 0.01;
  w.ramp = w.y0 !== undefined && w.y1 !== undefined;
  if (!w.ramp) w.y = w.y || 0;
  else {
    if (w.along !== 'x' && w.along !== 'z') throw new Error('addWalk: a ramp needs along: "x" or "z"');
    if (!w.run) w.run = w.along === 'x' ? [w.x0, w.x1] : [w.z0, w.z1];   // where the height changes; flat at y0 / y1 either side of it
  }
  // floor lookups take anything inside the padded rect or its walls
  w.fx0 = Math.min(w.x0 - w.pad, w.wx0); w.fx1 = Math.max(w.x1 + w.pad, w.wx1); w.fz0 = Math.min(w.z0 - w.pad, w.wz0); w.fz1 = Math.max(w.z1 + w.pad, w.wz1);
}
function floorsFlat(list) { return list.every(w => !w.ramp && !w.y); }   // every rect at y 0: the old one-floor fast path
WALK.forEach(prepWalk); WALK.flat = floorsFlat(WALK);
// floor height of one rect at x, z (a ramp is level past the ends of its run)
function walkHeight(w, x, z) {
  if (!w.ramp) return w.y;
  const r = w.run, t = (clamp(w.along === 'x' ? x : z, r[0], r[1]) - r[0]) / (r[1] - r[0]);
  return w.y0 + (w.y1 - w.y0) * t;
}
// The floor under x, z for something standing at height y (feet; omit for the top floor there): among the rects over
// that spot, the nearest one you could step onto (no more than CFG.floors.step above y), the highest if several.
// A rect's pad lets you reach its edge but doesn't hold you up: past its edge you're over whatever is below.
// mode 'stand' (you): a rect's pad does hold you up. Walking can take your feet that far past its edge (a pad wider than
//   your radius), and a story below must never win over the floor you're standing on.
// mode 'body' (goons and their ragdolls): never drop more than CFG.floors.maxDrop onto a story below while a rect of the
//   floor you're on is within CFG.floors.ledge (a desk, a shelf row, a balustrade's edge): small ledges still drop you.
function floorAt(x, z, y, mode) {
  const list = floorCells ? cellAt(floorCells, x, z) : WALK;
  if (!list || list.flat) return 0;   // no rect over this cell, or none raised
  const lim = (y === undefined ? Infinity : y) + CFG.floors.step, stand = mode === 'stand';
  let bestH = -Infinity, bestD = Infinity, above = Infinity;
  for (let i = 0; i < list.length; i++) {
    const w = list[i];
    if (x < w.fx0 || x > w.fx1 || z < w.fz0 || z > w.fz1 || (w.on && !w.on())) continue;
    const h = walkHeight(w, x, z);
    if (h > lim) { if (h < above) above = h; continue; }
    const dx = x < w.x0 ? w.x0 - x : x > w.x1 ? x - w.x1 : 0, dz = z < w.z0 ? w.z0 - z : z > w.z1 ? z - w.z1 : 0;
    let d = dx > dz ? dx : dz; if (stand) d = Math.max(0, d - w.pad);
    if (d < bestD - 1e-6 || (d < bestD + 1e-6 && h > bestH)) { bestD = d; bestH = h; }
  }
  if (mode === 'body' && y !== undefined && bestH < y - CFG.floors.maxDrop) { const h = ledgeFloor(x, z, y); if (h !== null) return h; }
  if (bestH > -Infinity) return bestH;
  return above < Infinity ? above : 0;   // below every floor here (spawned under it): the floor above; off every rect: y 0
}
// the floor at about height y (no more than maxDrop below it, no more than a step above) with a rect within ledge of x, z
function ledgeFloor(x, z, y) {
  const F = CFG.floors, list = (walkCells && cellAt(walkCells, x, z)) || WALK;   // walk cells carry an 8 m margin, past the ledge reach
  let best = null;
  for (const w of list) {
    if (w.on && !w.on()) continue;
    const h = walkHeight(w, x, z); if (h > y + F.step || h < y - F.maxDrop) continue;
    const dx = Math.max(w.x0 - x, 0, x - w.x1), dz = Math.max(w.z0 - z, 0, z - w.z1);
    if (Math.hypot(dx, dz) <= F.ledge && (best === null || h > best)) best = h;
  }
  return best;
}
// the treads of a flight, for drawing: n boxes [x0, y0, z0, x1, y1, z1] over its run, each top crossing the walk ramp at
// the tread's middle (feet sink or float at most half a riser). Feed them to box() in the level's build.
function stairSteps(w, n) {
  const out = [], lo = Math.min(w.y0, w.y1), d = (w.y1 - w.y0) / n, [r0, r1] = w.run, L = (r1 - r0) / n;
  for (let i = 0; i < n; i++) {
    const a = r0 + L * i, b = a + L, top = w.y0 + d * (i + 0.5);
    out.push(w.along === 'x' ? [a, lo, w.z0, b, top, w.z1] : [w.x0, lo, a, w.x1, top, b]);
  }
  return out;
}
// banded lookup so the street's many boxes don't cost the bar anything: boxes are filed by z band
const BAND = 4;
function bandIndex(list, get, margin) {
  const bands = new Map();
  for (const it of list) {
    const [z0, z1] = get(it);
    for (let k = Math.floor((z0 - margin) / BAND); k <= Math.floor((z1 + margin) / BAND); k++) { if (!bands.has(k)) bands.set(k, []); bands.get(k).push(it); }
  }
  return bands;
}
// ...and by x too: the lookups below use cells (BAND x BAND, the same margins), each list in the original order, so they
// find exactly what the z band would, minus what's far off in x. (Act 1's west levels are laid along world -x by their
// frame, so the Palace, Parade Square and the Tower all share a few z bands: by z alone a ragdoll in the gym tested
// every box from Station Square to the Tower, ~6 ms a frame in a five-goon fight.)
const cellKey = (i, k) => k * 8192 + i;   // (i: x cells within +-4096, 16 km)
function cellIndex(list, get, margin) {
  const cells = new Map();
  for (const it of list) {
    const [x0, x1, z0, z1] = get(it);
    for (let k = Math.floor((z0 - margin) / BAND); k <= Math.floor((z1 + margin) / BAND); k++)
      for (let i = Math.floor((x0 - margin) / BAND); i <= Math.floor((x1 + margin) / BAND); i++) { const c = cellKey(i, k); if (!cells.has(c)) cells.set(c, []); cells.get(c).push(it); }
  }
  return cells;
}
const NONE = [];
let blockerBands = null, worldBoxBands = null, walkBands = null, floorBands = null, blockerCells = null, worldBoxCells = null, walkCells = null, floorCells = null;
function indexWorld() {
  blockerBands = bandIndex(BLOCKERS, b => [b.z0, b.z1], 0.8);
  worldBoxBands = bandIndex(WORLD_BOXES, B => [B[2], B[5]], 0.6);
  walkBands = bandIndex(WALK, w => [w.z0, w.z1], 8);   // only the walkable rectangles near you are tested
  for (const list of walkBands.values()) list.flat = floorsFlat(list);   // a band with no raised floor costs nothing extra
  floorBands = bandIndex(WALK, w => [w.fz0, w.fz1], 0);   // floorAt: only the rects over that band
  for (const list of floorBands.values()) list.flat = floorsFlat(list);
  blockerCells = cellIndex(BLOCKERS, b => [b.x0, b.x1, b.z0, b.z1], 0.8);
  worldBoxCells = cellIndex(WORLD_BOXES, B => [B[0], B[3], B[2], B[5]], 0.6);
  walkCells = cellIndex(WALK, w => [w.x0, w.x1, w.z0, w.z1], 8);
  for (const list of walkCells.values()) list.flat = floorsFlat(list);
  floorCells = cellIndex(WALK, w => [w.fx0, w.fx1, w.fz0, w.fz1], 0);
  for (const list of floorCells.values()) list.flat = floorsFlat(list);
}
const cellAt = (cells, x, z) => cells.get(cellKey(Math.floor(x / BAND), Math.floor(z / BAND)));
const blockersNear = (z, x) => (x === undefined ? blockerBands && blockerBands.get(Math.floor(z / BAND)) : blockerCells && cellAt(blockerCells, x, z)) || NONE;
const boxesNear = (z, x) => (x === undefined ? worldBoxBands && worldBoxBands.get(Math.floor(z / BAND)) : worldBoxCells && cellAt(worldBoxCells, x, z)) || NONE;
// move an xz point onto the nearest walkable spot of the floor at height y (radius r), searching every rect: for a body
// thrown far clear of every ledge, further than the walk lookup's cells reach
function nearestOnFloor(p, y, r) {
  let bestD = Infinity, bx = p.x, bz = p.z;
  for (const w of WALK) {
    if ((w.on && !w.on()) || Math.abs(walkHeight(w, p.x, p.z) - y) > CFG.floors.step) continue;
    const x0 = w.x0 + r - w.pad, x1 = w.x1 - r + w.pad, z0 = w.z0 + r - w.pad, z1 = w.z1 - r + w.pad;
    if (x0 > x1 || z0 > z1) continue;
    const qx = clamp(p.x, x0, x1), qz = clamp(p.z, z0, z1), d = (p.x - qx) ** 2 + (p.z - qz) ** 2;
    if (d < bestD) { bestD = d; bx = qx; bz = qz; }
  }
  p.x = bx; p.z = bz; return bestD < Infinity;
}
// keep an xz point (radius r) inside the walkable union; returns true if it had to move. walls: ragdoll particles.
// Where floors are raised, p.y matters: walking (p.y = feet), only rects within CFG.floors.step of you count, so a taller
// edge is a wall either way; ragdoll particles (p.y = centre) are also free over anything lower, so they fall off ledges.
// memo (optional, e.g. a particle): remembers the rect it was last inside, tested first (being inside any rect ends the search)
function keepInWalk(p, r, walls, memo) {
  let best = null, bestD = 1e9, bx = 0, bz = 0;
  const list = (walkCells && cellAt(walkCells, p.x, p.z)) || WALK;
  const flat = list.flat, step = CFG.floors.step, py = walls ? p.y - r : p.y;
  const m = memo && memo.wk;
  if (m && (!m.on || m.on())) {
    const inside = walls ? p.x >= m.wx0 + r && p.x <= m.wx1 - r && p.z >= m.wz0 + r && p.z <= m.wz1 - r
      : p.x >= (m.x0 + r) - m.pad && p.x <= (m.x1 - r) + m.pad && p.z >= (m.z0 + r) - m.pad && p.z <= (m.z1 - r) + m.pad;
    if (inside) { if (flat) return false; const h = walkHeight(m, p.x, p.z); if (h <= py + step && (walls || h >= py - step)) return false; }
  }
  for (const w of list) {
    if (w.on && !w.on()) continue;
    let x0, x1, z0, z1;
    if (walls) { x0 = w.wx0 + r; x1 = w.wx1 - r; z0 = w.wz0 + r; z1 = w.wz1 - r; }
    else { x0 = (w.x0 + r) - w.pad; x1 = (w.x1 - r) + w.pad; z0 = (w.z0 + r) - w.pad; z1 = (w.z1 - r) + w.pad; }
    if (x0 > x1 || z0 > z1) continue;
    const inside = p.x >= x0 && p.x <= x1 && p.z >= z0 && p.z <= z1;
    const qx = clamp(p.x, x0, x1), qz = clamp(p.z, z0, z1), d = (p.x - qx) ** 2 + (p.z - qz) ** 2;
    if (!inside && d >= bestD) continue;
    if (!flat) { const h = walkHeight(w, p.x, p.z); if (h > py + step || (!walls && h < py - step)) continue; }   // another floor
    if (inside) { if (memo) memo.wk = w; return false; }
    bestD = d; best = w; bx = qx; bz = qz;
  }
  if (!best) return false;
  p.x = bx; p.z = bz; return true;
}
let neonMat, roundSignMat, roomTris = 0;

// a picture on a wall, `off` m out from it: side 'back' (z -5), 'front' (z +5), 'left' (x -5), 'right' (x +5). a0 is the
// coordinate at the picture's left edge as you face it, a1 its right; div [nu, nv] cuts it so baked light has vertices
function onWall(tex, side, a0, a1, y0, y1, o = {}) {
  const d = o.off === undefined ? 0.03 : o.off, [u0, v0, u1, v1] = o.uv || [0, 0, 1, 1], [nu, nv] = o.div || [1, 1];
  const P = (a, y) => side === 'back' ? [a, y, -ROOM.z + d] : side === 'front' ? [a, y, ROOM.z - d] : side === 'left' ? [-ROOM.x + d, y, a] : [ROOM.x - d, y, a];
  const n = { back: [0, 0, 1], front: [0, 0, -1], left: [1, 0, 0], right: [-1, 0, 0] }[side], acc = sacc(tex, o);
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const s0 = i / nu, s1 = (i + 1) / nu, t0 = j / nv, t1 = (j + 1) / nv, A = (s) => a0 + (a1 - a0) * s, Y = (t) => y1 - (y1 - y0) * t;
    const U = (s) => u0 + (u1 - u0) * s, V = (t) => v0 + (v1 - v0) * t;
    acc.quad([P(A(s0), Y(t0)), P(A(s1), Y(t0)), P(A(s1), Y(t1)), P(A(s0), Y(t1))], [[U(s0), V(t0)], [U(s1), V(t0)], [U(s1), V(t1)], [U(s0), V(t1)]], n);
  }
}
// a flat strip on the floor from (ax, az) to (bx, bz), w wide, cut every ~0.8 m (for the baked light)
function floorStrip(tex, ax, az, bx, bz, w, y, o) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 0.8)), px = -(bz - az) / L * w / 2, pz = (bx - ax) / L * w / 2, acc = sacc(tex, o);
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1;
    acc.quad([[x0 + px, y, z0 + pz], [x1 + px, y, z1 + pz], [x1 - px, y, z1 - pz], [x0 - px, y, z0 - pz]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 1, 0]);
  }
}
function buildRoom() {
  const X = ROOM.x, Z = ROOM.z, Y = ROOM.h;
  grid('wood_floor', [-X, 0, Z], [1, 0, 0], [0, 0, -1], 2 * X, 2 * Z, 1.6, 1.6, 1.0, [0, 1, 0]);
  grid('ceiling', [-X, Y, -Z], [1, 0, 0], [0, 0, 1], 2 * X, 2 * Z, 1.5, 1.5, 1.0, [0, -1, 0]);
  grid('wood_panel', [-X, 0, -Z], [1, 0, 0], [0, 1, 0], 2 * X, 2.7, 1.0, 2.7, 1.0, [0, 0, 1]);
  grid('ceiling', [-X, 2.7, -Z], [1, 0, 0], [0, 1, 0], 2 * X, Y - 2.7, 1.5, 1.5, 1.0, [0, 0, 1]);
  grid('tile', [-X, 0, Z], [0, 0, -1], [0, 1, 0], 2 * Z, 1.6, 0.8, 0.8, 1.0, [1, 0, 0]);
  grid('concrete', [-X, 1.6, Z], [0, 0, -1], [0, 1, 0], 2 * Z, Y - 1.6, 1.2, 1.2, 1.0, [1, 0, 0]);
  grid('brick', [X, 0, -Z], [0, 0, 1], [0, 1, 0], 2 * Z, Y, 0.9, 0.9, 1.0, [-1, 0, 0]);
  // front wall, with the doorway cut out (the door itself is a hinged mesh: it opens onto Tripoint Square)
  const DW = DOOR.w / 2;
  for (const x0 of [X, -DW]) {
    grid('wood_panel', [x0, 0, Z], [-1, 0, 0], [0, 1, 0], X - DW, 1.2, 1.0, 1.2, 1.0, [0, 0, -1]);
    grid('concrete', [x0, 1.2, Z], [-1, 0, 0], [0, 1, 0], X - DW, Y - 1.2, 1.2, 1.2, 1.0, [0, 0, -1]);
  }
  grid('concrete', [DW, DOOR.h, Z], [-1, 0, 0], [0, 1, 0], 2 * DW, Y - DOOR.h, 1.2, 1.2, 1.0, [0, 0, -1]);
  box('brass', [-X, 2.68, -Z], [X, 2.78, -Z + 0.06], { faces: 'ftd' });
  // the ceiling: dark beams across (the lanterns hang from the first), and over the Tripoint a slow brass fan with a lamp
  for (const bz of [-3.38, -0.05, 2.45]) box('darkwood', [-X, Y - 0.17, bz - 0.09], [X, Y, bz + 0.09], { faces: 'fbd' });
  {
    const { x: fx, z: fz } = TRIPOINT, acc = sacc('fan');
    box('black', [fx - 0.015, 2.96, fz - 0.015], [fx + 0.015, Y, fz + 0.015], { faces: 'fblr' });
    box('brass', [fx - 0.11, 2.86, fz - 0.11], [fx + 0.11, 2.97, fz + 0.11], { faces: 'fblrd' });
    box('glow', [fx - 0.075, 2.79, fz - 0.075], [fx + 0.075, 2.86, fz + 0.075], { faces: 'fblrd', emissive: true });
    for (let k = 0; k < 4; k++) {   // the blades: spun in place in the one mesh by spinBarFan (no draw call)
      const t = k * Math.PI / 2 + 0.4, dx = Math.cos(t), dz = Math.sin(t), qx = -dz * 0.065, qz = dx * 0.065, y = 2.9;
      acc.quad([[fx + dx * 0.11 + qx, y, fz + dz * 0.11 + qz], [fx + dx * 0.74 + qx, y, fz + dz * 0.74 + qz], [fx + dx * 0.74 - qx, y, fz + dz * 0.74 - qz], [fx + dx * 0.11 - qx, y, fz + dz * 0.11 - qz]],
        [[0, 0], [1, 0], [1, 1], [0, 1]], [0, -1, 0]);
    }
  }
  // ---- the floor: the three Accords borders in brass, meeting at the Tripoint disc. Polished brass catches every light in
  // the room, so it's drawn a little self-lit: the lines read right across the dark floor, as they do in the square's setts
  for (const [bx, bz] of BAR_LINES) {
    const L = Math.hypot(bx - TRIPOINT.x, bz - TRIPOINT.z), ux = (bx - TRIPOINT.x) / L, uz = (bz - TRIPOINT.z) / L;
    floorStrip('brass', TRIPOINT.x + ux * (TRIPOINT.r - 0.02), TRIPOINT.z + uz * (TRIPOINT.r - 0.02), bx, bz, 0.08, 0.006, { emissive: true, tint: [0.62, 0.56, 0.5] });
  }
  { const { x, z, r } = TRIPOINT; sacc('medallion').quad([[x - r, 0.009, z - r], [x + r, 0.009, z - r], [x + r, 0.009, z + r], [x - r, 0.009, z + r]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 1, 0], 2); }

  // ---- Hinomoto (the back wall): the bar, and behind it the back bar: Sasha's counter, a smoked mirror between dark wood
  // pilasters, glass shelves of bottles lit from below, the Threeway's emblem in the middle bay, THE THREEWAY over it all
  box('barfront', [BAR.x0 + 0.1, 0, BAR.z0], [BAR.x1 - 0.1, 1.08, BAR.z1 - 0.1], { uvs: { f: [0, 0, 6.4, 1], l: [0, 0, 0.55, 1], r: [0, 0, 0.55, 1] }, faces: 'flr' });
  box('counter', [BAR.x0, 1.08, BAR.z0], [BAR.x1, BAR.top, BAR.z1], { tile: 0.6 });
  box('brass', [BAR.x0 + 0.1, 0.12, BAR.z1 - 0.06], [BAR.x1 - 0.1, 0.16, BAR.z1 - 0.02], { faces: 'ftd' });   // the foot rail
  box('barfront', [-2.75, 0, -5], [2.75, 0.96, -4.62], { uvs: { f: [0, 0, 5.5, 1] }, faces: 'f' });
  box('counter', [-2.8, 0.96, -5], [2.8, 1.0, -4.58], { tile: 0.6, faces: 'tflr' });
  onWall('mirror', 'back', -2.65, 2.65, 1.0, 2.25, { off: 0.02, div: [8, 2] });
  for (const x of [-2.72, -0.62, 0.62, 2.72]) box('darkwood', [x - 0.07, 1.0, -4.98], [x + 0.07, 2.25, -4.68], { faces: 'flr' });
  box('darkwood', [-2.86, 2.25, -5], [2.86, 2.33, -4.6], { faces: 'ftdlr' });
  box('brass', [-2.86, 2.235, -4.6], [2.86, 2.265, -4.585], { faces: 'fd' });
  onWall('emblem', 'back', -0.5, 0.5, 1.2, 2.2, { off: 0.04, emissive: true });
  for (const [x0, x1] of [[-2.65, -0.69], [0.69, 2.65]]) for (const [k, y] of [[1, 1.27], [0, 1.75]]) {
    box('chrome', [x0, y - 0.02, -4.98], [x1, y, -4.74], { faces: 'td', tile: 0.5 });
    box('glow', [x0, y - 0.035, -4.76], [x1, y - 0.02, -4.74], { faces: 'fd', emissive: true });
    const u = (x) => (x + 2.65) / 5.3;
    sacc('shelf').quad([[x0, y + 0.46, -4.86], [x1, y + 0.46, -4.86], [x1, y, -4.86], [x0, y, -4.86]], [[u(x0), k * 0.5], [u(x1), k * 0.5], [u(x1), k * 0.5 + 0.5], [u(x0), k * 0.5 + 0.5]], [0, 0, 1]);
  }
  // on the counter: the brass till, the radio (its dial marked for Krasnograd, Halcyon and Okyo), the lucky cat, the samovar
  const bit = (x0, y1, z0, x1, z1, r) => box('backbits', [x0, 1.0, z0], [x1, y1, z1], { uvs: { f: r, '*': [r[0] + 0.004, r[1] + 0.02, r[0] + 0.01, r[1] + 0.06] }, faces: 'ftlr' });
  bit(1.17, 1.36, -4.94, 1.53, -4.64, [0, 0, 16 / 48, 1]);
  bit(-1.62, 1.25, -4.92, -1.22, -4.7, [16 / 48, 0, 32 / 48, 10 / 16]);
  bit(-2.34, 1.32, -4.86, -2.18, -4.72, [32 / 48, 0, 40 / 48, 1]);
  bit(2.2, 1.4, -4.92, 2.4, -4.72, [40 / 48, 0, 1, 1]);
  for (const x of [-2.6, -1.3, 0, 1.3, 2.6]) {
    box('lantern', [x - 0.17, 2.45, -3.55], [x + 0.17, 2.95, -3.21], { uvs: { '*': [0, 0, 1, 1], t: [0, 0, 1, 0.08], d: [0, 0.95, 1, 1] }, emissive: true });
    box('black', [x - 0.01, 2.95, -3.39], [x + 0.01, Y - 0.17, -3.37], { faces: 'fblr' });
  }
  // the lit board between the shelves and the neon: what's on ice from home (tools/bar_home.py paints it and the bottles)
  sacc('menuboard', { emissive: true, tint: [0.92, 0.88, 0.9] }).quad([[2.88, 2.57, -4.96], [3.88, 2.57, -4.96], [3.88, 1.26, -4.96], [2.88, 1.26, -4.96]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 0, 1]);
  // Akira-style vertical neon boards in brush lettering, either end of the back bar (the right one over the diner booth)
  for (const [x, w, y0] of [[-3.34, 0.26, 0.55], [4.25, 0.18, 1.22]])
    sacc('neon_hino', { emissive: true }).quad([[x - w, 2.62, -4.92], [x + w, 2.62, -4.92], [x + w, y0, -4.92], [x - w, y0, -4.92]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 0, 1]);
  // the Hinomoto window, back corner: black glass and neon, the Shuto's tail lights, Aoki Development's red crown
  onWall('window_hino', 'back', -4.68, -3.73, 1.0, 2.56, { emissive: true, tint: [0.9, 0.9, 1.0] });
  box('darkwood', [-4.78, 0.94, -5], [-3.63, 1.0, -4.88]);
  // two pachinko machines in the corner, chrome and lit
  for (const [z0, z1] of [[-4.44, -3.94], [-3.88, -3.38]]) {
    box('darkwood', [-4.98, 0, z0], [-4.56, 1.78, z1], { faces: 'tfbr' });
    onWall('pachinko', 'left', z1 - 0.03, z0 + 0.03, 0.74, 1.74, { off: 0.45, emissive: true });
  }
  // ---- Krasnovia (left wall): its own window onto the sector (the Tower of Labor under its cog, the slabs, net curtains)
  onWall('window_kras', 'left', -0.6, -2.6, 1.0, 2.6, { emissive: true, tint: [0.9, 0.9, 1.0] });
  box('darkwood', [-5, 0.94, -2.7], [-4.9, 1.0, -0.5]);
  box('darkwood', [-5, 0.94, -2.7], [-4.94, 2.66, -2.6]); box('darkwood', [-5, 0.94, -0.6], [-4.94, 2.66, -0.5]); box('darkwood', [-5, 2.6, -2.7], [-4.94, 2.66, -0.5]);
  box('darkwood', [-5, 1.75, 0.0], [-4.6, 2.05, 0.08]);
  box('sodium', [-4.75, 2.05, -0.12], [-4.45, 2.35, 0.2], { uvs: { '*': [0, 0, 1, 1] }, emissive: true });
  box('darkwood', [-4.95, 0, 1.0], [-4.35, 1.62, 1.95], { faces: 'tlbf' });
  box('jukebox', [-4.95, 0, 1.0], [-4.35, 1.62, 1.95], { uvs: { r: [0, 0, 1, 1] }, faces: 'r', emissive: true });
  // the Krasnovian corner by the front window: the chess table mid-game under a green lamp, two chairs, the banner over it
  onWall('banner', 'left', 4.12, 3.0, 1.0, 3.15, { div: [1, 2] });
  {
    const cx = -4.2, cz = 3.55;
    box('counter', [cx - 0.32, 0.7, cz - 0.32], [cx + 0.32, 0.74, cz + 0.32], { tile: 0.5 });
    sacc('chess').quad([[cx - 0.22, 0.742, cz - 0.22], [cx + 0.22, 0.742, cz - 0.22], [cx + 0.22, 0.742, cz + 0.22], [cx - 0.22, 0.742, cz + 0.22]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 1, 0]);
    box('chrome', [cx - 0.04, 0, cz - 0.04], [cx + 0.04, 0.7, cz + 0.04], { faces: 'fblr' });
    for (const [s, z0] of [[-1, 2.74], [1, 3.94]]) {
      box('darkwood', [-4.45, 0.42, z0], [-3.95, 0.47, z0 + 0.42]);
      for (const [lx, lz] of [[-4.43, z0 + 0.02], [-3.99, z0 + 0.02], [-4.43, z0 + 0.36], [-3.99, z0 + 0.36]]) box('darkwood', [lx, 0, lz], [lx + 0.04, 0.42, lz + 0.04], { faces: 'fblr' });
      const bz = s < 0 ? z0 : z0 + 0.36;
      box('darkwood', [-4.45, 0.47, bz], [-3.95, 0.98, bz + 0.06]);
    }
    box('black', [cx - 0.01, 1.62, cz - 0.01], [cx + 0.01, Y, cz + 0.01], { faces: 'fblr' });
    box('darkwood', [cx - 0.2, 1.52, cz - 0.2], [cx + 0.2, 1.62, cz + 0.2], { faces: 'fblrt' });
    box('teal', [cx - 0.19, 1.519, cz - 0.19], [cx + 0.19, 1.52, cz + 0.19], { uvs: { '*': [0, 0, 1, 1] }, emissive: true, faces: 'd' });
  }
  // ---- Columbia (right wall): art deco, gold trim, the ridge in the window, amber diner neon
  box('brass', [X - 0.06, 2.68, -Z], [X, 2.78, Z], { faces: 'ltd' });
  sacc('window', { emissive: true, tint: [0.9, 0.9, 1.0] }).quad([[4.97, 2.6, -2.6], [4.97, 2.6, -0.6], [4.97, 1.0, -0.6], [4.97, 1.0, -2.6]], [[0, 0], [1, 0], [1, 1], [0, 1]], [-1, 0, 0], 2);
  // the Halcyon drifting over the crowns: a clear strip over each upper pane (the mullion between them stays in front)
  for (const [z0, z1] of BAR_ZEP.panes) sacc('zep_strip', { emissive: true, tint: [0.9, 0.9, 1.0] }).quad([[4.965, BAR_ZEP.y1, z0], [4.965, BAR_ZEP.y1, z1], [4.965, BAR_ZEP.y0, z1], [4.965, BAR_ZEP.y0, z0]],
    [[BAR_ZEP.u(z0), 0], [BAR_ZEP.u(z1), 0], [BAR_ZEP.u(z1), 1], [BAR_ZEP.u(z0), 1]], [-1, 0, 0]);
  box('darkwood', [4.9, 0.94, -2.7], [5.0, 1.0, -0.5]);
  sacc('neon_open', { emissive: true }).quad([[4.95, 3.05, -2.75], [4.95, 3.05, -0.45], [4.95, 2.7, -0.45], [4.95, 2.7, -2.75]], [[0.02, 0.15], [0.98, 0.15], [0.98, 0.85], [0.02, 0.85]], [-1, 0, 0]);
  sacc('cola').quad([[4.96, 2.3, 0.8], [4.96, 2.3, 1.5], [4.96, 1.25, 1.5], [4.96, 1.25, 0.8]], [[0, 0], [1, 0], [1, 1], [0, 1]], [-1, 0, 0]);
  // the Columbian diner booth in the back corner: red tufted vinyl, a formica table, a pendant lamp, FLY HALCYON
  {
    for (const [z0, z1, bz0, bz1] of [[-4.95, -4.5, -4.97, -4.82], [-3.7, -3.25, -3.37, -3.25]]) {
      box('darkwood', [3.9, 0, z0], [4.97, 0.42, z1], { faces: 'fblr' });
      box('vinyl', [3.9, 0.42, z0], [4.97, 0.5, z1], { tile: 0.5, faces: 'tfblr' });
      box('vinyl', [3.9, 0.5, bz0], [4.97, 1.12, bz1], { tile: 0.5, faces: 'fblr' });
      box('chrome', [3.9, 1.12, bz0], [4.97, 1.16, bz1], { faces: 'tfbl' });
    }
    box('formica', [4.08, 0.72, -4.42], [4.97, 0.77, -3.78], { tile: 0.4, faces: 't' });
    box('chrome', [4.08, 0.72, -4.42], [4.97, 0.77, -3.78], { faces: 'fbl' });
    box('chrome', [4.5, 0, -4.14], [4.58, 0.72, -4.06], { faces: 'fblr' });
    box('chrome', [4.62, 0.77, -4.2], [4.72, 0.9, -4.12]);                       // the napkin holder
    box('black', [4.45 - 0.01, 1.92, -4.11], [4.45 + 0.01, Y, -4.09], { faces: 'fblr' });
    box('brass', [4.3, 1.84, -4.25], [4.6, 1.94, -3.95], { faces: 'fblrt' });
    box('glow', [4.31, 1.839, -4.24], [4.59, 1.84, -3.96], { faces: 'd', emissive: true });
    onWall('poster_halcyon', 'right', -4.55, -3.89, 1.42, 2.26, { off: 0.04 });
  }
  const px = POOL.x, pz = POOL.z;
  box('felt', [px - 0.7, 0.74, pz - 1.2], [px + 0.7, 0.8, pz + 1.2], { tile: 0.5, faces: 't' });
  for (const [a0, a1, b0, b1] of [[-0.78, -0.68, -1.28, 1.28], [0.68, 0.78, -1.28, 1.28], [-0.78, 0.78, -1.28, -1.18], [-0.78, 0.78, 1.18, 1.28]])
    box('darkwood', [px + a0, 0.6, pz + b0], [px + a1, POOL.top, pz + b1]);
  box('darkwood', [px - 0.6, 0, pz - 1.05], [px + 0.6, 0.6, pz + 1.05], { faces: 'fblr' });
  box('darkwood', [px - 0.35, 1.95, pz - 0.65], [px + 0.35, 2.08, pz + 0.65], { faces: 'fblrt' });
  box('teal', [px - 0.33, 1.949, pz - 0.63], [px + 0.33, 1.95, pz + 0.63], { uvs: { '*': [0, 0, 1, 1] }, emissive: true, faces: 'd' });
  box('black', [px - 0.01, 2.08, pz - 0.01], [px + 0.01, Y, pz + 0.01], { faces: 'fblr' });
  // ---- front wall: the door frame runs through the wall to the street
  box('darkwood', [-DW - 0.12, 0, 4.9], [-DW, DOOR.h + 0.12, DOOR.z1], { faces: 'fblrt' });
  box('darkwood', [DW, 0, 4.9], [DW + 0.12, DOOR.h + 0.12, DOOR.z1], { faces: 'fblrt' });
  box('darkwood', [-DW - 0.12, DOOR.h, 4.9], [DW + 0.12, DOOR.h + 0.12, DOOR.z1]);
  // the two big front windows the facade shows (Tripoint Square at night: the Brass Clock's side, the station's side)
  for (const s of [1, -1]) {
    const a = s * 4.9, b = s * 1.9;
    onWall('window_sq', 'front', a, b, 0.8, 2.925, { off: 0.035, emissive: true, tint: [0.88, 0.86, 0.94], uv: s > 0 ? [0, 0, 0.5, 1] : [1, 0, 0.5, 1] });
    const lo = Math.min(a, b), hi = Math.max(a, b);
    box('darkwood', [lo - 0.06, 0.74, 4.84], [hi + 0.06, 0.8, 5]);                       // the sill
    box('darkwood', [lo - 0.06, 2.925, 4.9], [hi + 0.06, 3.0, 5], { faces: 'bd' });       // the head
    box('darkwood', [lo - 0.06, 0.8, 4.9], [lo, 2.925, 5], { faces: 'bl' }); box('darkwood', [hi, 0.8, 4.9], [hi + 0.06, 2.925, 5], { faces: 'br' });
  }
  // either side of the door: the Accords (no firearms in Vostburg, 1962) framed, and the regulars' polaroids
  box('darkwood', [1.04, 1.21, 4.95], [1.72, 2.19, 5], { faces: 'blrtd' });
  onWall('accords', 'front', 1.68, 1.08, 1.25, 2.15, { off: 0.055, div: [1, 2] });
  onWall('photos', 'front', -1.04, -1.8, 1.32, 2.14, { off: 0.03 });
  // ---- tables
  for (const t of TABLES) {
    box('counter', [t.x - 0.45, 0.74, t.z - 0.45], [t.x + 0.45, 0.79, t.z + 0.45], { tile: 0.5 });
    box('chrome', [t.x - 0.05, 0, t.z - 0.05], [t.x + 0.05, 0.74, t.z + 0.05], { faces: 'fblr' });
  }
  roomTris = flushStaticsAtlas(BAR_BAKE);
  for (const B of BAR_SOLIDS) WORLD_BOXES.push(B.slice());   // (WORLD_BOXES lives in physics.js, loaded after this file)
  findBarZeppelin(); findBarFan();
  buildDoor();

  // dynamic signs: flickering neon + round sign
  const neonAcc = new GeoAcc();
  neonAcc.quad([[-2.3, 2.67, -4.955], [2.3, 2.67, -4.955], [2.3, 2.34, -4.955], [-2.3, 2.34, -4.955]], [[0.06, 0.15], [0.94, 0.15], [0.94, 0.85], [0.06, 0.85]], [0, 0, 1]);
  neonMat = makeMat('neon_tw', { emissive: true });
  scene.add(new THREE.Mesh(neonAcc.geometry(), neonMat));
  const rs = new GeoAcc();
  rs.quad([[0.42, 3.25, 4.94], [-0.42, 3.25, 4.94], [-0.42, 2.45, 4.94], [0.42, 2.45, 4.94]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 0, -1]);
  roundSignMat = makeMat('round1', { emissive: true });
  scene.add(new THREE.Mesh(rs.geometry(), roundSignMat));

  applyLights(BAR_LIGHT.lights, BAR_LIGHT.ambient);
}
// 6 point lights: baked into the room, live on goons, props and hands
const BAR_LIGHT = { ambient: [0.2, 0.13, 0.19], lights: [
  lightFromHex([0, 2.3, -4.2], '#ff4f9a', 5.0, 0.7),    // THE THREEWAY neon
  lightFromHex([0, 2.6, -3.0], '#e8352b', 6.0, 1.0),    // lanterns
  lightFromHex([-4.2, 2.1, 0.0], '#ff9a3c', 6.5, 1.5),  // sodium lamp
  lightFromHex([2.7, 1.8, 1.2], '#ffc870', 4.5, 1.5),   // pool lamp (green-glass banker's shade)
  lightFromHex([0, 2.6, 4.3], '#ffd8a0', 6.5, 1.3),     // round sign over the door
  lightFromHex([4.2, 2.0, -1.6], '#5a6cff', 4.0, 0.8),  // night window spill
] };
// ...and these baked in only (static light is free): warm pools for the back bar, the booths and the Tripoint, each
// window's own colour spilling in, the dark kept between them
const BAR_BAKE = { ambient: BAR_LIGHT.ambient, lights: [...BAR_LIGHT.lights,
  lightFromHex([-1.67, 1.12, -4.7], '#ffb060', 1.8, 1.2),   // under the shelves: the bottles and the mirror lit from below
  lightFromHex([1.67, 1.12, -4.7], '#ffb060', 1.8, 1.2),
  lightFromHex([0, 1.7, -4.5], '#ff4f9a', 2.4, 0.9),        // the emblem
  lightFromHex([-4.2, 1.8, -4.5], '#b040ff', 2.3, 0.8),     // the Hinomoto window's neon
  lightFromHex([-4.2, 1.2, -3.9], '#33e0d0', 1.6, 0.7),     // the pachinko machines
  lightFromHex([-4.4, 1.8, -1.6], '#ff9a3c', 2.6, 0.6),     // Krasnovia's sodium through its window
  lightFromHex([3.4, 1.9, 4.5], '#d8e8c0', 3.0, 0.45),      // the square's gaslight through the front windows
  lightFromHex([-3.4, 1.9, 4.5], '#d8e8c0', 3.0, 0.45),
  lightFromHex([4.45, 1.7, -4.1], '#ffc870', 2.2, 1.3),     // the diner booth's pendant
  lightFromHex([-4.2, 1.4, 3.55], '#ffd890', 2.0, 1.1),     // the chess table's green lamp
  lightFromHex([0, 2.7, -1.7], '#ffd8a0', 3.4, 0.9),        // the fan's lamp over the Tripoint
] };
// the front door: hinged on its right edge (seen from inside), swings out onto the square
const DOOR = { w: 1.2, h: 2.3, z: 4.97, z1: 5.32, open: 0, target: 0 };
let doorPivot = null;
function buildDoor() {
  const acc = new GeoAcc(), DW = DOOR.w / 2;
  acc.quad([[DW, DOOR.h, 0], [-DW, DOOR.h, 0], [-DW, 0, 0], [DW, 0, 0]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 0, -1], 2);       // inside face
  acc.quad([[-DW, DOOR.h, 0.05], [DW, DOOR.h, 0.05], [DW, 0, 0.05], [-DW, 0, 0.05]], [[0, 0], [1, 0], [1, 1], [0, 1]], [0, 0, 1], 2);   // street face
  const g = acc.geometry(); const pos = g.attributes.position.array;
  for (let i = 0; i < pos.length; i += 3) pos[i] -= DW;   // hinge at the local origin
  doorPivot = new THREE.Group(); doorPivot.position.set(DW, 0, DOOR.z);
  doorPivot.add(new THREE.Mesh(g, sharedMat('door')));
  scene.add(doorPivot);
}
function updateDoor(dt) {
  driftBarZeppelin(); spinBarFan();
  if (!doorPivot) return;
  DOOR.open += clamp(DOOR.target - DOOR.open, -dt * CFG.street.doorSpeed, dt * CFG.street.doorSpeed);
  doorPivot.rotation.y = DOOR.open * CFG.street.doorOpenDeg * DEG;
}
// The Halcyon in the Columbia window (window.png keeps the upper panes' top rows clear for it): its strip (zep_strip.png,
// 128 px, 64 of them across the window) scrolls one texel at a time, a lap every ~3.4 minutes like the real one's. Its UVs
// sit in the bar's one mesh, so it costs no draw call: a 24-float upload when it moves a texel.
const BAR_ZEP = { y0: 2.6 - 9 / 32.5, y1: 2.6 - 1 / 32.5, panes: [[-2.6 + 1 / 32, -2.6 + 31 / 32], [-2.6 + 33 / 32, -2.6 + 63 / 32]],
  u: (z) => (z + 2.6) / 4, pxPerS: 1 / 1.6, i0: -1, n: 0, base: null, k: -1 };
function findBarZeppelin() {
  const g = ST.barMesh && ST.barMesh.geometry, R = BAR_ATLAS.zep_strip; if (!g || !R) return;
  const ar = g.attributes.arect.array;
  for (let i = 0; i < ar.length / 4; i++) if (ar[i * 4] === Math.fround(R[0]) && ar[i * 4 + 1] === Math.fround(R[1])) { if (BAR_ZEP.i0 < 0) BAR_ZEP.i0 = i; BAR_ZEP.n = i - BAR_ZEP.i0 + 1; }
  if (BAR_ZEP.i0 >= 0) BAR_ZEP.base = g.attributes.uv.array.slice(BAR_ZEP.i0 * 2, (BAR_ZEP.i0 + BAR_ZEP.n) * 2);
}
function driftBarZeppelin() {
  const Z = BAR_ZEP; if (!Z.base || !ST.barMesh.visible) return;
  const k = Math.floor(performance.now() / 1000 * Z.pxPerS) % 128; if (k === Z.k) return;
  Z.k = k;
  const uv = ST.barMesh.geometry.attributes.uv, a = uv.array, off = -k / 128;   // content moves toward +z (right, seen from inside): nose first
  for (let i = 0; i < Z.n; i++) a[(Z.i0 + i) * 2] = Z.base[i * 2] + off;
  if (uv.updateRange) { uv.updateRange.offset = Z.i0 * 2; uv.updateRange.count = Z.n * 2; }
  uv.needsUpdate = true;
}
// The ceiling fan over the Tripoint: its four blades sit in the bar's one mesh (found by their atlas box, like the
// Halcyon's strip) and turn in place, ~10 turns a minute: a 72-float upload a frame, no draw call.
const BAR_FAN = { speed: 1.05, i0: -1, n: 0, base: null, a: -1 };
function findBarFan() {
  const g = ST.barMesh && ST.barMesh.geometry, R = BAR_ATLAS.fan; if (!g || !R) return;
  const ar = g.attributes.arect.array;
  for (let i = 0; i < ar.length / 4; i++) if (ar[i * 4] === Math.fround(R[0]) && ar[i * 4 + 1] === Math.fround(R[1])) { if (BAR_FAN.i0 < 0) BAR_FAN.i0 = i; BAR_FAN.n = i - BAR_FAN.i0 + 1; }
  if (BAR_FAN.i0 >= 0) BAR_FAN.base = g.attributes.position.array.slice(BAR_FAN.i0 * 3, (BAR_FAN.i0 + BAR_FAN.n) * 3);
}
function spinBarFan() {
  const F = BAR_FAN; if (!F.base || !ST.barMesh.visible) return;
  const a = (performance.now() / 1000 * F.speed) % (Math.PI * 2); if (Math.abs(a - F.a) < 0.01) return;
  F.a = a;
  const pos = ST.barMesh.geometry.attributes.position, p = pos.array, c = Math.cos(a), s = Math.sin(a);
  for (let i = 0; i < F.n; i++) {
    const dx = F.base[i * 3] - TRIPOINT.x, dz = F.base[i * 3 + 2] - TRIPOINT.z, j = (F.i0 + i) * 3;
    p[j] = TRIPOINT.x + dx * c - dz * s; p[j + 2] = TRIPOINT.z + dx * s + dz * c;
  }
  if (pos.updateRange) { pos.updateRange.offset = F.i0 * 3; pos.updateRange.count = F.n * 3; }
  pos.needsUpdate = true;
}
