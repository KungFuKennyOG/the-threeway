// Headless checks for the Palace of Sport: off the cradle through the gap in the railway fence (no cut), the level crossing
// and the train, the boulevard, the foyer, the gym, the players' tunnel, Volkov in the ring, out the north doors.
'use strict';
const vm = require('vm'), path = require('path');
const THREE = require('./three_stub.js');
let clock = 0, seed = 31;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {}, addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, fire(t, e) { for (const f of this._l[t] || []) f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info']) els[id] = mkEl(id);
els.c.requestPointerLock = () => {};
const listeners = {};
class ImageStub { set src(v) { this.width = 40; this.height = 16; if (this.onload) this.onload(); } }
const ctx = { THREE, console, Math: Object.create(Math), document: { getElementById: (id) => els[id], addEventListener() {} }, navigator: {}, Image: ImageStub,
  innerWidth: 1280, innerHeight: 720, performance: { now: () => clock * 1000 }, addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); },
  setTimeout, Map, Set, Array, Object, Number, String, Float32Array, Uint8Array, JSON };
ctx.Math.random = rnd; ctx.window = ctx;
vm.createContext(ctx);
require('./load.js')(ctx);
const run = (c) => vm.runInContext(c, ctx);
const TW = ctx.__tw;
const log = [];
const check = (name, ok, extra = '') => log.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  (' + extra + ')' : ''));
const DT = 1 / 72;
const step = (n, f) => { for (let i = 0; i < n; i++) { clock += DT; if (f) f(i); TW.renderer.loop(); } };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const C = TW.CFG.podezd, PZ = TW.PZ, LIFTS = TW.LIFTS, CR = TW.CRADLE, SB = TW.SB;
const KRAS = new Set(['conscript', 'laborer', 'wrestler', 'cook', 'ivan', 'volkov', 'warden', 'sambo', 'lifter', 'specialist']);
const kill = () => { for (const e of TW.enemies) { e.hp = 0; e.knockdown(V(0, 0, 1), 'knockdown', true); } };
const face = (yaw) => run(`desk.yaw = ${yaw}; desk.pitch = 0;`);
let maxJump = 0;   // the most your view moved up or down in one frame (VR comfort)
const frame = (n = 1) => { for (let i = 0; i < n; i++) { const y0 = TW.rig.position.y; step(1); maxJump = Math.max(maxJump, Math.abs(TW.rig.position.y - y0)); } };
const walkTo = (x, z, sp = 0.035, n = 2000) => {   // walk in small steps (the walk rects, floors and fight walls apply, like the keyboard)
  for (let k = 0; k < n; k++) {
    const dx = x - TW.rig.position.x, dz = z - TW.rig.position.z, d = Math.hypot(dx, dz); if (d < 0.02) break;
    const s = Math.min(sp, d); TW.rig.position.x += dx / d * s; TW.rig.position.z += dz / d * s;
    const p = V(TW.rig.position.x, TW.rig.position.y, TW.rig.position.z); TW.keepInWalk(p, 0.3); ctx.keepPlayerIn(p, 0.3); TW.rig.position.x = p.x; TW.rig.position.z = p.z; frame();
  }
};
const until = (f, n = 3000) => { for (let i = 0; i < n && !f(); i++) frame(); return f(); };
const fightClear = () => { until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900); kill(); until(() => TW.game.state === 'walk', 600); };

els.deskBtn.fire('click');

els.deskBtn.fire('click');
step(3);
const clearAll = () => { for (let k = 0; k < 8; k++) { until(() => TW.game.state !== 'fight' || !TW.game.queue.length, 900); kill(); if (until(() => TW.game.state === 'walk', 400)) return true; } return false; };
const PL = run('PL'), TR = run('TRAIN'), P = TW.CFG.palace;
// The crossing and Station Square are in world coordinates; from the boulevard on, the Palace is authored in the ACT1_WEST
// frame's (src/levels.js): walkL / setL / LH() / L() work in the frame (local +z runs from the crossing toward the Tower).
const AW = run('ACT1_WEST'), LH = () => AW.local(TW.player.head), L = (v) => AW.local(v);
const setL = (x, y, z) => { const [a, b] = AW.toWorld(x, z); TW.rig.position.set(a, y, b); };
const walkL = (x, z, sp, n) => { const [a, b] = AW.toWorld(x, z); walkTo(a, b, sp, n); };
const faceL = (yaw) => face(yaw + AW.yaw);
// does the segment o -> t cross a triangle of the position array P? (Moller-Trumbore)
const segHits = (P, o, t) => {
  const dx = t[0] - o[0], dy = t[1] - o[1], dz = t[2] - o[2];
  for (let i = 0; i < P.length; i += 9) {
    const e1x = P[i + 3] - P[i], e1y = P[i + 4] - P[i + 1], e1z = P[i + 5] - P[i + 2], e2x = P[i + 6] - P[i], e2y = P[i + 7] - P[i + 1], e2z = P[i + 8] - P[i + 2];
    const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < 1e-9) continue;
    const sx = o[0] - P[i], sy = o[1] - P[i + 1], sz = o[2] - P[i + 2], u = (sx * px + sy * py + sz * pz) / det; if (u < 0 || u > 1) continue;
    const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x, v = (dx * qx + dy * qy + dz * qz) / det; if (v < 0 || u + v > 1) continue;
    const tt = (e2x * qx + e2y * qy + e2z * qz) / det; if (tt > 1e-4 && tt < 0.999) return true;
  }
  return false;
};
const KR = new Set([...KRAS, 'gymnast', 'guard', 'bandsman']);
try {
  // ---- the build
  check('the Palace is one baked inside mesh + one baked outside mesh, a four-car train and two barriers', PL.inMesh.geometry.attributes.bake && PL.outMesh.geometry.attributes.bake && TR.cars.length === 4 && TR.booms.length === 2);
  check('their triangles stay within budget', PL.inTris + PL.outTris < 16000, `${PL.inTris} inside + ${PL.outTris} outside`);
  check('every goon in every fight here is Krasnovian', P.encounters.every(E => E.spawn.every(s => KR.has(s[0]))), P.encounters.map(E => E.spawn.map(s => s[0]).join('/')).join(', '));
  { const Pp = TW.ST.skylineMesh.geometry.attributes.position.array; let n = 0;
    for (const R of [AW.rect(PL.rect), PL.rail, PL.sqRect, PL.yard]) for (let i = 0; i < Pp.length; i += 3) if (Pp[i + 1] > 0.5 && Pp[i] > R[0] && Pp[i] < R[1] && Pp[i + 2] > R[2] && Pp[i + 2] < R[3]) n++;
    check('no far-city block sits on the Palace\'s ground, Station Square, the goods yard or the railway west', n === 0, n + ' vertices'); }
  { const Pp = PL.inMesh.geometry.attributes.position.array; let out = 0, top = 0;   // (the inside mesh is built in the frame's coordinates)
    for (let i = 0; i < Pp.length; i += 3) if (Pp[i + 2] > PL.gym[3] + 0.01) { if (Math.hypot(Pp[i] - PL.drum[0], Pp[i + 2] - PL.drum[1]) > PL.drum[2] + 0.01) out++; top = Math.max(top, Pp[i + 1]); }
    check('the round bowl (stands, back wall, saucer ceiling, both tunnels) fits inside the drum', out === 0 && top <= PL.roofY + 0.01, `${out} vertices outside, top ${top.toFixed(1)} m`); }
  // ---- the stadium outside (its own mesh): the oval bowl round everything, the Tower of Labor over it, the masts
  { const S = PL.shell, inShell = (x, z, m = 0) => z >= PL.annex[2] - 1e-6 && ((x - S.c[0]) / (S.a - m)) ** 2 + ((z - S.c[1]) / (S.b - m)) ** 2 <= 1 + 1e-9;
    const Pp = PL.inMesh.geometry.attributes.position.array; let out = 0;
    for (let i = 0; i < Pp.length; i += 3) if (!inShell(Pp[i], Pp[i + 2]) && Pp[i + 2] < PL.northZ - 0.01) out++;
    const [fx0, fz0] = run('plShellPt(0)'), [fx1, fz1] = run(`plShellPt(${S.n})`), [nx, nz] = run(`plShellPt(${(S.n - 1) / 2})`);
    check('the stadium\'s oval takes in the whole inside (foyer, gym, bowl); its flat front is the foyer\'s, its north wall the north doors\'',
      out === 0 && Math.abs(fz0 - PL.annex[2]) < 1e-6 && Math.abs(fz1 - PL.annex[2]) < 1e-6 && Math.abs(fx0 - PL.annex[1]) < 1e-6 && Math.abs(fx1 - PL.annex[0]) < 1e-6
      && Math.abs(S.c[1] + S.b * Math.cos(S.D / 2) - PL.northZ) < 1e-6, `${out} inside vertices outside it; north wall z ${(S.c[1] + S.b * Math.cos(S.D / 2)).toFixed(3)} vs ${PL.northZ.toFixed(3)}`);
    check('it is a big oval: ~64 m across, ~73 m long, its stands low over the ends and rising to ~23 m along the sides, open over the middle (the floodlit stands and floor in it), a glow over the rim',
      S.a * 2 > 60 && S.b * 2 > 70 && S.endY >= 16 && S.endY <= 18 && S.sideY > S.endY + 4 && PL.hazeSides.length > S.n / 2);
    check('its lid sits over the inside\'s saucer, so from up high the inside never shows through the open top', S.pitchY > PL.roofY + 0.5 && S.endY > S.pitchY);
    check('four lattice masts, over twice its height, outside it, leaning in', PL.masts.length === 4 && PL.masts.every(([bx, bz, tx, tz, h]) => h > 2 * S.sideY && !inShell(bx, bz, -2) && Math.hypot(tx - S.c[0], tz - S.c[1]) < Math.hypot(bx - S.c[0], bz - S.c[1])));
    // sightlines against the outside mesh (local): the doors from the boulevard; the Tower of Labor's upper tiers, crown,
    // cog and spire from the boulevard's start and from the crossing
    const Op = PL.outMesh.geometry.attributes.position.array;
    const blocked = (o, t) => segHits(Op, o, t);
    const doors = [-40, 1.4, PL.annex[2] - 0.2];
    check('nothing stands on the boulevard\'s axis: the doors are in view from its start and all the way up', [152.4, 158, 164, 170, 176].every(z => !blocked([-40, 1.7, z], doors)));
    const crossing = AW.toLocal(-40, 145), arrive = AW.toLocal(...PL.cross.arrive), tierTop = (k) => run('TWR').tiers[k][5], up = [];
    for (let y = (tierTop(2) + tierTop(3)) / 2; y <= 252; y += 3) for (const x of y > tierTop(4) ? [-52, -46, -40, -34, -28] : [-46, -40, -34]) up.push([x, y, 330]);   // (over the tiers, the sky round the crown and spire too)
    const hid = (o) => up.filter(t => blocked(o, t)).length;
    check('from the boulevard\'s start, the crossing and the step off it the Tower of Labor rises clear over it: the upper half of its fourth tier and all above (the fifth tier, crown, cog and spire, and the sky round them: nothing frames the spire)',
      hid([-40, 1.7, 152.4]) === 0 && hid([-40, 1.7, 153.4]) === 0 && hid([crossing[0], 1.7, crossing[1]]) === 0 && hid([arrive[0], 1.7, arrive[1]]) === 0,
      `${hid([-40, 1.7, 152.4])} / ${hid([-40, 1.7, 153.4])} / ${hid([crossing[0], 1.7, crossing[1]])} / ${hid([arrive[0], 1.7, arrive[1]])} of ${up.length} points hidden`);
    // and nothing on Station Square (the station, its posts and poplars, the slabs) stands in front of it from the step off
    const Xp = PL.crossMesh.geometry.attributes.position.array, aw = [...PL.cross.arrive], wUp = up.map(([x, y, z]) => { const [a, b] = AW.toWorld(x, z); return [a, y, b]; });
    const sq = wUp.filter(t => segHits(Xp, [aw[0], 1.7, aw[1]], t)).length;
    check('stepping off the crossing, nothing on Station Square stands in front of the Tower', sq === 0, `${sq} of ${wUp.length} points hidden`); }
  // ---- the wall slabs: Columbia's ridge out of sight. Rays from your eye to every crown (its top tier's corners, the
  // crown, the spire's tip; Civic Harmony's mooring deck and the top of its mast) against Station Square's mesh (the
  // slabs, the station), from all over the square, along the crossing and across the boulevard's start
  { const Xa = PL.crossMesh.geometry.attributes.position.array, crowns = run('SKY.crowns'), E = 1.7, eyes = { square: [], crossing: [], 'boulevard start': [] };
    const Xp = new Float32Array(Xa.filter((v, i, A) => { const k = i - i % 9; return Math.max(A[k + 1], A[k + 4], A[k + 7]) > 6; }));   // (what stands taller than 6 m: the slabs, the station)
    const grid = (r, step, out) => { const nx = Math.max(1, Math.round((r[1] - r[0]) / step)), nz = Math.max(1, Math.round((r[3] - r[2]) / step));
      for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) out.push([r[0] + 0.3 + (r[1] - r[0] - 0.6) * i / nx, E, r[2] + 0.3 + (r[3] - r[2] - 0.6) * j / nz]); };
    for (const r of PL.walk) grid(r, 3, eyes.square);
    for (let z = PL.barS; z <= PL.fenceN + 0.01; z += 1.6) eyes.crossing.push([run(`PL.crossX(${z})`), E, z]);
    grid([-62, -56.3, 190.3, 205.7], 3, eyes['boulevard start']);
    const seen = Object.entries(eyes).map(([k, os]) => [k, os.length, os.reduce((n, o) => n + crowns.filter(t => !segHits(Xp, o, t)).length, 0)]);
    check('the wall slabs hide Columbia\'s ridge from Station Square, the crossing and the boulevard\'s start: every crown, spire tip and Civic Harmony\'s mast top',
      crowns.length >= 50 && seen.every(([, , n]) => n === 0), seen.map(([k, v, n]) => `${k}: ${n} seen from ${v} eyes`).join(', ') + ` (${crowns.length} points)`);
    // the Halcyon (375 m up) still shows over them for part of every lap
    const Z = run('ZEP'), laps = [];
    for (let t = 0; t < Z.lap; t += Z.lap / 48) { const h = run(`zepAt(${t}, ZEP.pos)`), p = Z.pos.slice(), sn = Math.sin(h), cs = Math.cos(h);
      laps.push([[p[0], p[1], p[2]], [p[0], p[1] + Z.R * 0.9, p[2]], [p[0] + sn * Z.L * 0.4, p[1], p[2] + cs * Z.L * 0.4], [p[0] - sn * Z.L * 0.4, p[1], p[2] - cs * Z.L * 0.4]]); }
    const tease = [['the step off the crossing', [...PL.cross.arrive]], ['the middle of the square', [-56, 166]], ['the boulevard\'s mouth', [-65, 175]], ['the boulevard\'s start', [-59, 198]]]
      .map(([k, [x, z]]) => [k, laps.filter(P => P.some(q => !segHits(Xp, [x, E, z], q))).length]);
    const top = Math.max(...PL.slabs.map(s => (s[5] || 0) + s[4] * 2.8)), low = Math.min(...laps.map(P => P[0][1])) - Z.R;
    check('only the Halcyon shows over the slabs: it flies far above their roofline and comes into view over them for part of every lap',
      low > top + 250 && tease.every(([, n]) => n > 0), tease.map(([k, n]) => `${k}: ${n}/${laps.length}`).join(', ') + `; roofline ${top.toFixed(1)} m, hull ${low.toFixed(0)} m`);
    // from the Tower's tribune (190 m up) the whole ridge is back: nothing of Act 1 (the square, the Palace, Parade
    // Square) hides a crown from its balustrade
    const twW = (M) => { const a = M.geometry.attributes.position.array, out = new Float32Array(a.length); for (let i = 0; i < a.length; i += 3) { const [x, z] = AW.toWorld(a[i], a[i + 2]); out[i] = x; out[i + 1] = a[i + 1]; out[i + 2] = z; } return out; };
    const act1 = [Xp, twW(PL.outMesh), twW(run('PR').mesh)], TWR = run('TWR'), [tx, tz] = AW.toWorld(-40, TWR.tribune[2] + 0.9), trib = [tx, TWR.top.y + E, tz];
    const back = crowns.filter(t => !act1.some(P => segHits(P, trib, t))).length;
    check('from the Chairman\'s tribune the whole ridge is back in view across the city, the slabs below it', back === crowns.length && trib[1] > top + 100, `${back} of ${crowns.length} crown points in view`); }
  { const solid = (lx, lz) => { const [x, z] = AW.toWorld(lx, lz); return TW.BLOCKERS.some(b => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1); }, lane = [];
    for (let z = PL.gym[2] + 0.5; z < PL.gym[3]; z += 0.5) lane.push([-40, z], [-37.5, z]);
    check('the gym\'s podium, pommel horse and vault are solid (cover); the way through the middle is clear', solid(-34.5, 198.6) && solid(-45.4, 195) && solid(-34, 191.75) && !lane.some(([x, z]) => solid(x, z))); }

  // ---- off the cradle, through the gap in the fence (no cut), and over the skewed crossing (PL.cross: north-west)
  const CR8 = PL.cross, onX = (z) => [run(`PL.crossX(${z})`), z], [ax, az] = CR8.arrive;
  run('startPodezd(false); resetPodezdRides("roof"); CRADLE.phase = "bottom"; CRADLE.y = 0; CRADLE.rect.y = 0; placeRides(); level.encounter = CFG.podezd.encounters.length - 1; game.state = "won";');
  TW.rig.position.set(CR8.x, 0, 134.5); face(Math.PI); step(3);
  const x0 = TW.rig.position.x;
  walkTo(CR8.x, 137.9);
  check('from the railway bank you walk straight into the Palace level (no cut)', TW.level.name === 'palace' && TW.player.head.z > PL.fenceZ && Math.abs(TW.rig.position.x - x0) < 0.01, `${TW.level.name} z ${TW.player.head.z.toFixed(2)}`);
  check('the crossing is shut: barriers down, lamps wig-wagging, bells', !TR.open && TR.phase === 'warn' && TR.lift === 0 && (TR.lampA.visible || TR.lampB.visible));
  walkTo(...onX(145), 0.035, 90);
  check('you can\'t cross while it\'s down', TW.player.head.z < PL.barS, 'z ' + TW.player.head.z.toFixed(2));
  let seen = 0, passed = false;
  until(() => { seen = Math.max(seen, TR.cars.filter(m => m.visible).length); if (TR.cars.every(m => m.position.x + 18 < CR8.west)) passed = true; return TR.open; }, 72 * 14);
  check('the evening electric comes out of the tunnel and past the crossing', seen >= 2 && passed, `${seen} cars in view at once`);
  check('then the barriers lift and the crossing opens', TR.open && TR.lift === 1 && TR.phase === 'open' && !TR.lampA.visible && !TR.lampB.visible, TR.phase);
  check('the crossing runs skewed, north-west across the three tracks, its barriers spanning the planks', CR8.ang > 45 * Math.PI / 180 && CR8.ang < 65 * Math.PI / 180 && CR8.arm > 2 * CR8.hw + 0.4 && Math.abs(run('PL.crossX(PL.fenceZ)') - (PZ.gap[0] + PZ.gap[1]) / 2) < 1e-9);
  for (const z of [140, 143, 146, 149, 151.3]) walkTo(...onX(z));
  walkTo(ax, az);
  check('across the tracks along the planks onto Station Square', Math.hypot(TW.player.head.x - ax, TW.player.head.z - az) < 0.05, `${TW.player.head.x.toFixed(2)}, ${TW.player.head.z.toFixed(2)}`);

  // ---- Station Square's walls: East Station's front and the wall slab east, the low wall at the strip's north end
  { const [sx0] = PL.station, S2 = PL.slabs[1];
    walkTo(-50, 165); walkTo(-38, 165, 0.035, 120); const st = TW.player.head.x;
    walkTo(-53, 200); walkTo(-38, 200, 0.035, 120); const sl = TW.player.head.x;
    walkTo(-54.6, 212); walkTo(-54.6, 225, 0.035, 160); const nz = TW.player.head.z;
    check('the square ends: East Station\'s front and the wall slab east, a low wall north', st < sx0 && sl < S2[0] && nz < PL.walk[3][3] + 0.1 && nz > PL.walk[3][3] - 0.5 && TW.level.encounter === -1,
      `station x ${st.toFixed(2)}, slab x ${sl.toFixed(2)}, north z ${nz.toFixed(2)}`); }

  // ---- the arrival: stepping off the crossing you face the way it runs, and the Tower of Labor is just about dead ahead;
  // walk straight on and you cross the square into the boulevard's wide mouth, nothing in the way (every point of the
  // line stays put against the walk rects and the solids)
  const stays = (x, z) => { const q = V(x, 0, z); TW.keepInWalk(q, 0.3); ctx.keepPlayerIn(q, 0.3); return Math.hypot(q.x - x, q.z - z) < 1e-6; };
  { const [tx, tz] = AW.toWorld(-40, 330), off = Math.abs(Math.atan2(tx - ax, tz - az) - Math.atan2(CR8.dir[0], CR8.dir[1])) * 180 / Math.PI;
    check('stepping off the crossing, the Tower of Labor is within 25° of straight ahead (facing along the crossing, the way you walk on)', off < 25, off.toFixed(1) + '°');
    const line = []; for (let d = 0; d <= 25; d += 0.25) line.push([ax + CR8.dir[0] * d, az + CR8.dir[1] * d]);
    const stuck = line.filter(([x, z]) => !stays(x, z)), end = AW.toLocal(...line[line.length - 1]);
    check('straight on, 25 m across the square, and you\'re in the boulevard\'s mouth by the forecourt (nothing in the way)', !stuck.length && end[1] > 166,
      `${stuck.length} points blocked; ends at local z ${end[1].toFixed(1)}`);
    const q = V(-68, 0, 157); TW.keepInWalk(q, 0.3); ctx.keepPlayerIn(q, 0.3);
    check('the goods yard\'s low wall closes the square\'s south-west side', !(q.x < PL.yardEnd && q.z < PL.yardTop) && !stays(-62, 153) && !stays(-66, 158), `(-68, 157) -> (${q.x.toFixed(2)}, ${q.z.toFixed(2)})`); }
  walkTo(-53, 198); walkTo(-57, 198);
  check('turn west: the boulevard runs away from the wall, deep into the sector', TW.player.head.x < -56.5 && Math.abs(TW.player.head.z - 198) < 0.05 && LH().z > 151.4, `${TW.player.head.x.toFixed(2)}, ${TW.player.head.z.toFixed(2)}`);

  // ---- the boulevard
  walkL(-40, 158); until(() => TW.level.encounter === 0, 60);
  check('the boulevard fight starts', TW.level.encounter === 0, TW.game.state);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('its crew is all there', TW.enemies.length === P.encounters[0].spawn.length, TW.enemies.map(e => e.type).join(','));
  clearAll();
  walkL(-46, 178.5); walkL(-46, 183);
  check('the glass front is a wall: in through the doors only', LH().z < PL.foyer[2], 'z ' + LH().z.toFixed(2));
  walkL(-40, 179); walkL(-40, 185);
  check('through the doors into the foyer', LH().z > 184 && TW.roomState.cur === 'palace', TW.roomState.cur);

  // ---- the gym
  walkL(-40, 192); until(() => TW.level.encounter === 1, 60);
  check('the gym fight starts as you walk in', TW.level.encounter === 1);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('the gym crew spawns in the gym', TW.enemies.every(e => L(e.pos).z > PL.gym[2] && L(e.pos).z < PL.gym[3] && L(e.pos).x > PL.gym[0] && L(e.pos).x < PL.gym[1]), TW.enemies.map(e => L(e.pos).z.toFixed(1)).join(','));
  walkL(-40, 186, 0.035, 200);
  check('you can\'t back out into the foyer mid-fight', LH().z > P.encounters[1].arena[0] - 0.05, 'z ' + LH().z.toFixed(2));
  clearAll();

  // ---- the players' tunnel, the arena, the Bear
  walkL(-37.5, 193); walkL(-37.5, 198.5); walkL(-40, 199); walkL(-40, 205); walkL(-40, 215.5); until(() => TW.level.encounter === 2, 60);   // round the vaulting horse
  check('out of the tunnel onto the floor: Volkov', TW.level.encounter === 2, TW.game.state);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('the Bear is a boss with a bar, in the ring', TW.game.bosses.length === 1 && TW.enemies[0].type === 'volkov' && Math.abs(L(TW.enemies[0].pos).z - PL.ring[1]) < 3, TW.enemies.map(e => e.type).join(','));
  walkL(-56, 226, 0.035, 500);
  check('the stands are a wall', LH().x > PL.floor[0], 'x ' + LH().x.toFixed(2));
  walkL(-52, 214, 0.035, 500);
  { const r = Math.hypot(LH().x - PL.bowlC[0], LH().z - PL.bowlC[1]);
    check('the floor is round: heading for a corner, the ring of stands stops you', r < PL.floorR && r > PL.floorR - 1.6, 'r ' + r.toFixed(2)); }
  walkL(-40, 246, 0.035, 500);
  check('the north doors are shut while he\'s up', LH().z < PL.floor[3] && PL.shutter.visible, 'z ' + LH().z.toFixed(2));
  TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
  check('going down puts you back at the tunnel mouth for another go', TW.level.encounter === 2 && LH().z < 214, 'z ' + LH().z.toFixed(2));
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  { const b = TW.enemies[0]; b.hp = b.maxHp * 0.4; step(3); check('he loses it at half health', b.enraged === true); }
  clearAll();
  // the north doors: after the KO's beat the shutter rolls up over a few seconds (not at once), the light from the square
  // spilling in under it as it goes; you can't get under it until it's most of the way up; your view never moves
  { const S = PL.shut, SC = P.shutter, ts = [], k = [], lamp = [];
    const shut0 = PL.shutter.material.visible && S.t === 0 && !PL.spill.material.visible;
    let blocked = null, jump0 = maxJump; maxJump = 0;
    for (let i = 0; i < Math.ceil((SC.time + 0.6) / DT); i++) {
      frame(); ts.push(S.t); k.push(PL.spill.material.uniforms.uTint.value.x); lamp.push(PL.spillLamp[1].slice());
      if (blocked === null && S.t > 0.3 && S.t < SC.walk - 0.1) { const [x, z] = AW.toWorld(-40, PL.bowl[3] + 1.5), p = V(x, 0, z); TW.keepInWalk(p, 0.3); blocked = L(p).z < PL.bowl[3]; }
    }
    const first = ts.findIndex(t => t > 0), full = ts.findIndex(t => t >= 1), secs = (full - first) * DT, mono = ts.every((t, i) => !i || t >= ts[i - 1]);
    check('down: after the KO the shutter rolls up slowly (a few seconds, never jumping), then it\'s gone',
      shut0 && first >= 0 && full > first && secs > 3 && secs < 6 && mono && ts.every((t, i) => !i || t - ts[i - 1] < 0.02) && S.phase === 'up' && !PL.shutter.material.visible,
      `${secs.toFixed(2)} s from first lift to the top`);
    const mid = ts.findIndex(t => t >= 0.5), warm = lamp[mid];
    check('...the square\'s warm light spills in under it as it goes (the tunnel, the floor, a live lamp for goons and hands), growing with it',
      PL.spill.material.visible && k[first] < 0.1 && k[mid] > 0.5 && k[k.length - 1] > 0.99 && warm[0] > warm[2] && warm[0] > 0.3 && TW.ST.lamps.includes(PL.spillLamp),
      `strength ${k[first].toFixed(2)} -> ${k[mid].toFixed(2)} -> ${k[k.length - 1].toFixed(2)}`);
    check('...and you can\'t walk under it till it\'s most of the way up; your view stays put the whole time', blocked === true && maxJump < 1e-9, `blocked ${blocked}`);
    maxJump = Math.max(maxJump, jump0); }
  walkL(-40, 241); walkL(-40, 251.6); step(3);
  check('out the north doors: the Palace is done', TW.game.state === 'won', TW.game.state);
  walkL(-40, 253.6);
  check('and the way on to Parade Square is open', LH().z > 253.2 && (!TW.LEVELS.parade || TW.level.name === 'parade'), `${TW.level.name} z ${LH().z.toFixed(2)}`);

  // ---- rooms
  run('startPalace(false); level.encounter = 99'); setL(-40, 0, 226); faceL(Math.PI / 2); step(3);
  check('in the arena (facing the stands) only the inside is drawn', TW.roomState.cur === 'palace' && PL.inMesh.visible && !PL.outMesh.visible && !TW.ST.skylineMesh.visible, TW.roomState.cur);
  setL(-40, 0, 176); faceL(Math.PI); step(3);
  check('on the forecourt facing the doors: the outside, and the foyer through them', TW.roomState.cur === 'outside' && PL.outMesh.visible && PL.inMesh.visible, TW.roomState.cur);
  check('starting here from the menu: in the gap in the fence, the train coming', TW.level.name === 'palace' && TR.phase !== 'gone' && !TR.open);

  // ---- physics cost in the gym (four goons)
  run('clearEnemies(); level.encounter = 99'); setL(-40, 0, 192); step(3);
  for (const t of ['conscript', 'laborer', 'wrestler', 'conscript']) { const e = new TW.Enemy(t); const [ex, ez] = AW.toWorld(-46 + rnd() * 12, 193 + rnd() * 5); e.placeAt(ex, ez, 0, 0); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('gym physics cost per frame (4 goons, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} palace checks pass`);
process.exitCode = fails ? 1 : 0;
