// Headless checks for Act 1's Parade Square: out of the Palace of Sport's north doors (no cut), the May Day rehearsal's
// three fights (the honour guard, the gymnasts, the band), up to the Tower of Labor's doors. Krasnovian goons only.
'use strict';
const vm = require('vm');
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
const PR = run('PR'), C = TW.CFG.parade, D = TW.LEVELS.parade;
// The square is authored in the ACT1_WEST frame's coordinates (src/levels.js): +z from the Palace's doors to the Tower's.
// Positions here are in the frame (local); W() takes them into the world, LH() is your head in the frame.
const AW = run('ACT1_WEST'), W = (x, y, z) => { const [a, b] = AW.toWorld(x, z); return V(a, y, b); }, LH = () => AW.local(TW.player.head);
const at = (x, z, yaw) => { TW.rig.position.copy(W(x, 0, z)); run(`desk.yaw = ${yaw + AW.yaw}; desk.pitch = 0;`); };   // yaw PI faces local +z (toward the Tower)
const walk = (x, z) => { const p = W(x, 0, z); TW.keepInWalk(p, 0.3); const q = AW.local(p); return [q.x, q.z]; };
const solidAt = (x, z) => { const p = W(x, 0, z); TW.pushOutXZ(p, 0.3); const q = AW.local(p); return Math.hypot(q.x - x, q.z - z) > 0.2; };
const stays = (x, z) => { const p = W(x, 0, z); TW.keepInWalk(p, 0.3); TW.pushOutXZ(p, 0.3); const q = AW.local(p); return Math.hypot(q.x - x, q.z - z) < 1e-6; };
const KRAS = new Set(['conscript', 'laborer', 'wrestler', 'cook', 'guard', 'gymnast', 'bandsman', 'specialist']);
const kill = () => { for (const e of TW.enemies) { e.hp = 0; e.knockdown(V(0, 0, 1), 'knockdown', true); } };
const walkTo = (lx, lz, sp = 0.035) => {   // walk in small steps, like the keyboard (walk rects and blockers apply); to a local point
  let jump = 0; const { x, z } = W(lx, 0, lz);
  for (let k = 0; k < 3000; k++) {
    const dx = x - TW.rig.position.x, dz = z - TW.rig.position.z, d = Math.hypot(dx, dz); if (d < 0.02) break;
    const s = Math.min(sp, d), p0 = TW.rig.position.clone(); TW.rig.position.x += dx / d * s; TW.rig.position.z += dz / d * s;
    const p = V(TW.rig.position.x, TW.rig.position.y, TW.rig.position.z); TW.keepInWalk(p, 0.3); TW.rig.position.x = p.x; TW.rig.position.z = p.z;
    step(1); jump = Math.max(jump, TW.rig.position.distanceTo(p0));
  }
  return jump;
};

// every big sign shown: [name, seconds, height]
const SIGNS = []; ctx.__signs = SIGNS;
run(`const __showSign = showSign; showSign = function (n, d, y) { __signs.push([n, d, y]); return __showSign(n, d, y); };`);
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
// The Palace of Sport is another level (src/levels.js registry). If it isn't on this branch, a stub stands in for it:
// just enough to be 'won' with you standing in its north doorway.
if (!TW.LEVELS.palace) run(`defineLevel('palace', { cfg: () => ({ encounters: [], spawnGap: 1, clearedPause: 1, healBetween: 0 }), rects: [],
  start() { level.name = 'palace'; level.encounter = -1; level.arena = null; clearEnemies(); game.state = 'walk'; } })`);
els.deskBtn.fire('click');
step(3);
try {
  // ---- the build: one baked mesh on the street atlas, in budget, nothing from the far city on it
  { const M = D.outside(), G = PR.mesh.geometry, A = G.attributes, n = A.position.array.length / 3, P = A.position.array; let at = 0, inside = true;
    for (const m of M) { const [s, c] = m.geometry.userData.range, { center: o, radius: r } = m.geometry.userData; if (s !== at) inside = false; at = s + c;
      for (let v = s; v < s + c; v++) if (Math.hypot(P[v * 3] - o[0], P[v * 3 + 1] - o[1], P[v * 3 + 2] - o[2]) > r) inside = false; }
    check('Parade Square is one baked buffer on the street atlas, drawn as chunks over it (shared, nothing copied): every triangle in exactly one, each chunk\'s sphere holding its triangles',
      PR.mesh === M[0] && A.bake && PR.mesh.material.uniforms.uBaked.value === 1 && M.length >= 6 && M.every(m => ['position', 'normal', 'uv', 'bake'].every(k => m.geometry.attributes[k] === A[k]) && m.userData.near && m.material === PR.mesh.material)
      && at === n && inside, `${M.length} chunks, ${n / 3} triangles`); }
  check('its triangles stay within budget (it\'s drawn on every view of the square: it was 7,590 before the crane, the clock tower and the rehearsal\'s clutter)', PR.tris < 6000, PR.tris + ' tris');
  check('its lamps are baked (four flood masts, sodium, the floats, the stand) and pushed for goons to be lit by', PR.lamps.length >= 12 && PR.lamps.every(l => TW.ST.lamps.includes(l)), PR.lamps.length + ' lights');
  { const P = TW.ST.skylineMesh.geometry.attributes.position.array, R = AW.rect(PR.rect); let n = 0;
    for (let i = 0; i < P.length; i += 3) if (P[i + 1] > 0.5 && P[i] > R[0] && P[i] < R[1] && P[i + 2] > R[2] && P[i + 2] < R[3]) n++;
    check('no skyline slab or far-city block sits on the square', n === 0, n + ' vertices'); }
  { const P = PR.acc.p; let east = 0, out = 0, door = 0;
    for (let i = 0; i < P.length; i += 3) {
      if (P[i] > -6 + 1e-6) east++;
      if (P[i] < PR.rect[0] - 1e-6 || P[i + 2] < PR.rect[2] - 1e-6 || P[i + 2] > PR.rect[3] + 1e-6) out++;
      if (P[i + 1] > 0.05 && P[i] > -44 && P[i] < -36 && P[i + 2] > 304 && P[i + 2] < 312.5) door++;
    }
    check('everything stays west of x -6 (the Accords side is someone else\'s) and on its own ground', east === 0 && out === 0, `${east} east, ${out} outside`);
    check('the way up to the Tower\'s doors is left open (nothing standing in x -44..-36)', door === 0, door + ' vertices'); }
  // ---- the reveal's framing: stepping out of the Palace's north doors at eye height (just clear of the doors' canopy,
  // and a step either side), nothing but the Tower itself stands between you and its doors, its podium over the
  // reviewing stand, its tiers, the crown, the cog and the spire's tip. Against everything else drawn out there: the
  // square, the Palace (outside and in), the street and the skylines' far city (all in the frame's coordinates)
  { const TWR = run('TWR'), local = (M) => { const a = M.geometry.attributes.position.array, o = [];
      for (let i = 0; i < a.length; i += 9) { const tri = []; let near = false;
        for (let k = 0; k < 3; k++) { const [x, z] = AW.toLocal(a[i + k * 3], a[i + k * 3 + 2]); tri.push(x, a[i + k * 3 + 1], z); if (x > -130 && x < 50 && z > 250 && z < 335) near = true; }
        if (near) o.push(...tri); }
      return new Float32Array(o); };
    const PLm = TW.LEVELS.palace && run('typeof PL !== "undefined" && PL.outMesh ? PL : null');
    const others = [['the square', PR.mesh.geometry.attributes.position.array], ['the street', local(TW.ST.litMesh)], ['the far city', local(TW.ST.skylineMesh)]];
    if (PLm) others.push(['the Palace', PLm.outMesh.geometry.attributes.position.array], ['the Palace inside', PLm.inMesh.geometry.attributes.position.array]);
    const T = TWR.tiers, x0 = T[0][0], x1 = T[0][1], fz = (k) => T[k][2] - 0.1;
    const tower = { doors: [[-40, 1.5, fz(0)], [-40, 5, fz(0)]], podium: [[-40, 14, fz(0)], [x0 + 6, 20, fz(0)], [x1 - 6, 20, fz(0)], [-40, 28, fz(0)]],
      middle: [[-40, 42, fz(1)], [-40, 64, fz(2)], [T[3][0] + 3, 95, fz(3)], [T[3][1] - 3, 95, fz(3)], [-40, 130, fz(4)]],
      cog: [[-40, TWR.cogY, 330], [-40 - TWR.cogD * 0.4, TWR.cogY, 330], [-40 + TWR.cogD * 0.4, TWR.cogY, 330], [-40, TWR.cogY + TWR.cogD * 0.4, 330], [-40, TWR.spire - 1, 330]] };
    const eyes = [[-40, 1.7, C.reveal.z], [-41.2, 1.6, C.reveal.z], [-38.8, 1.8, C.reveal.z], [-40, 1.7, C.start[1]]], hid = [];
    for (const e of eyes) for (const [part, pts] of Object.entries(tower)) for (const p of pts) for (const [what, P] of others) if (segHits(P, e, p)) hid.push(`${part} (${p.map(v => v.toFixed(0))}) behind ${what} from ${e.map(v => v.toFixed(1))}`);
    check('out of the Palace\'s north doors at eye height, the Tower stands clear: its doors, podium, tiers, the cog and the spire, nothing in front of them',
      !hid.length && eyes.length * Object.values(tower).flat().length >= 60, hid.slice(0, 3).join('; ') || `${eyes.length} eyes x ${Object.values(tower).flat().length} points`); }
  check('it\'s all one flat floor: no stairs, no ramps', TW.WALK.filter(w => /^pr/.test(w.area)).every(w => !w.ramp && w.y === 0), TW.WALK.filter(w => /^pr/.test(w.area)).length + ' walk rects');
  check('on the menu as "6 · Parade Square"', D.menu === '6 · Parade Square' && D.after === 'palace');
  check('three fights of 3-5 goons, every one Krasnovian', C.encounters.length === 3 && C.encounters.every(E => E.spawn.length >= 3 && E.spawn.length <= 5 && E.spawn.every(s => KRAS.has(s[0]))), C.encounters.map(E => E.spawn.map(s => s[0]).join('+')).join(' | '));
  run('LEVELS.parade.start(false); level.encounter = 99'); step(1);
  check('every goon spawns on open paving, every respawn is clear', C.encounters.every(E => E.spawn.every(s => stays(s[1], s[2])) && stays(E.respawn[0], E.respawn[1])),
    C.encounters.flatMap(E => E.spawn.filter(s => !stays(s[1], s[2])).map(s => s.join(' '))).join(', '));

  // ---- from the menu
  run('clearEnemies(); LEVELS.parade.start(false)'); step(2);
  check('starting here puts you just out of the Palace\'s doors, facing the Tower, at full health', TW.level.name === 'parade' && TW.game.state === 'walk' && Math.hypot(LH().x - C.start[0], LH().z - C.start[1]) < 0.6 && TW.player.hp === TW.CFG.player.health, `${TW.level.name} ${LH().x.toFixed(1)}, ${LH().z.toFixed(1)}`);
  check('the square\'s props are stocked', TW.props.length === C.props.length && TW.props.every(p => AW.local(p.body.ps[0].x).z > 253), TW.props.length + ' props');

  // ---- walking in from the Palace of Sport, no cut
  run('clearEnemies(); LEVELS.palace.start(false); game.state = "won"; game.timer = 0;');
  at(-40, 251.9, Math.PI); step(3); SIGNS.length = 0;
  const before = [AW.local(TW.rig.position).x, AW.local(TW.rig.position).z];
  check('in the Palace\'s doorway, the Palace still on', TW.level.name === 'palace' && TW.game.state === 'won', TW.level.name);
  const jump = walkTo(-40, 253.5);
  check('walking out of its north doors puts you on Parade Square, right where you are', TW.level.name === 'parade' && Math.abs(LH().z - 253.5) < 0.1 && Math.abs(AW.local(TW.rig.position).x - before[0]) < 0.05 && jump < 0.05,
    `${TW.level.name} z ${LH().z.toFixed(2)}, biggest step ${(jump * 100).toFixed(1)} cm`);
  check('the Palace\'s props stay behind; the square\'s are stocked', TW.props.length === C.props.length, TW.props.length + ' props');
  // ---- the reveal: out from under the doors' canopy, THE TOWER OF LABOR in gold, hung low (under the Tower, not over
  // it), once; then the square's name. Starting here from the menu there's no reveal, just the name
  { const n = () => SIGNS.filter(s => s[0] === 'towerReveal');
    const under = n().length === 0 && !SIGNS.some(s => s[0] === 'parade');
    walkTo(-40, C.reveal.z + 0.5); const r1 = n().slice();
    walkTo(-40, 253.4); walkTo(-40, C.reveal.z + 0.8); step(2);
    const def = run('SIGN_TEXT.towerReveal');
    check('stepping out from under the doors\' canopy: THE TOWER OF LABOR in gold, low under the Tower, with a chime; once, however you go back and forth',
      under && r1.length === 1 && n().length === 1 && def[0] === 'THE TOWER OF LABOR' && def[1] === '#f2c14e' && r1[0][2] < 1.5 && typeof run('AU.chime') === 'function',
      `${n().length} shown, at ${r1[0] && r1[0][2]} m`);
    step(Math.ceil((C.reveal.dur + 0.3) / DT));
    const after = SIGNS.slice(SIGNS.indexOf(n()[0]) + 1).map(s => s[0]);
    run('clearEnemies(); LEVELS.parade.start(false)'); step(2);
    check('then PARADE SQUARE; from the menu, just PARADE SQUARE', after.length === 1 && after[0] === 'parade' && SIGNS[SIGNS.length - 1][0] === 'parade' && n().length === 1, after.join(','));
    run('clearEnemies(); LEVELS.palace.start(false); game.state = "won"; game.timer = 0;'); at(-40, 251.9, Math.PI); step(3); walkTo(-40, 253.5); }

  // ---- where you can walk
  run('level.encounter = 99');
  let [x, z] = walk(-40, 282);
  check('the square is walkable', Math.abs(x + 40) < 1e-9 && Math.abs(z - 282) < 1e-9);
  [x, z] = walk(-40, 252.2);
  check('the Palace\'s doorway is a way through', Math.abs(z - 252.2) < 1e-9);
  [x, z] = walk(-52, 252.5);
  check('but the Palace\'s front beside it is not', z >= PR.sq[2] - 1e-6, `${x.toFixed(2)}, ${z.toFixed(2)}`);
  [x, z] = walk(-78, 282);
  check('the Ministry of Order is a wall (not enterable)', x >= PR.sq[0] - 1e-6, `x ${x.toFixed(2)}`);
  [x, z] = walk(-8, 280);
  check('the bleachers wall the east side', x <= PR.sq[1] + 1e-6, `x ${x.toFixed(2)}`);
  [x, z] = walk(-40, 312.3);
  check('the Tower\'s doorway is open', Math.abs(z - 312.3) < 1e-9);
  [x, z] = walk(-55, 312.3);
  check('beside it, the square ends at the Tower\'s front', z <= PR.sq[3] + 1e-6, `z ${z.toFixed(2)}`);
  check('the floats are solid', PR.floats.every(([fx, fz]) => solidAt(fx, fz) && solidAt(fx, fz + 0.6)));
  check('so are the reviewing stand, the bass drum, the portico\'s pillars, the masts', solidAt(-55, 307) && solidAt(-25, 307) && solidAt(-24.5, 296.2) && solidAt(-71.2, 281.5) && solidAt(-69.6, 257.6));
  { const [x0, x1, z0, z1] = PR.crane.truck, [bx, bz] = PR.programme, [sx0, sx1, sz0, sz1] = PR.scaffold;
    check('and the rehearsal\'s kit: the crane\'s truck and its outriggers, the scaffold tower, the programme board, the flag rack, the conductor\'s podium, the Zubr banner\'s poles',
      solidAt((x0 + x1) / 2 + 0.6, (z0 + z1) / 2) && solidAt(x1 + 0.9, z0 + 3.2) && solidAt((sx0 + sx1) / 2 + 0.4, (sz0 + sz1) / 2) && solidAt(bx, bz) && solidAt(-59.6, 270.6) && solidAt(-24.5, 293.6) && solidAt(-55.6, 293.2)); }
  { // the portrait hangs off the hook clear of everything: the boom passes over its corner, the Ministry's face and the portico stay behind it
    const [px, pz, y0, y1, pw] = PR.portrait, { foot: F, tip: T } = PR.crane, at = (z) => { const k = (z - F[2]) / (T[2] - F[2]); return [F[0] + (T[0] - F[0]) * k, F[1] + (T[1] - F[1]) * k]; };
    const [ex, ey] = at(pz - pw / 2);
    check('the Chairman\'s portrait hangs from the crane\'s hook over the portico, out from the Ministry\'s face; the boom clears its corner and its tip is right over it',
      px > PR.ministry[1] + 1 && y0 > 8.4 && ey - 0.5 > y1 && Math.abs(T[0] - px) < 0.01 && Math.abs(T[2] - pz) < 0.01 && Math.abs(pz - (PR.risalit[0] + PR.risalit[1]) / 2) < 0.01, `boom ${ey.toFixed(1)} m over the corner at ${y1} m`); }
  { const P = PR.acc.p; let high = 0;   // the chalk, the cables and the cable ramp lie flat: down the route nothing stands but the paving
    for (let i = 0; i < P.length; i += 3) if (P[i] > -42 && P[i] < -38 && P[i + 2] > 253 && P[i + 2] < 312 && P[i + 1] > 0.05) high++;
    check('the route is clear all the way from the Palace\'s doors to the Tower\'s: its chalk, cables and the cable ramp lie flat on it', high === 0, high + ' vertices over 5 cm'); }
  check('ragdolls hit them too (world boxes)', [[-55, 1, 266], [-55, 4, 266.6], [-30, 2, 307], [-24.5, 1, 296.2]].map(([x, y, z]) => W(x, y, z)).every(({ x: bx, y: by, z: bz }) => TW.WORLD_BOXES.some(b => bx > b[0] && bx < b[3] && by > b[1] && by < b[4] && bz > b[2] && bz < b[5])));
  check('the gymnasts\' mats are floor, not an obstacle', stays(-61, 285));

  // ---- the doors don't end it while the fights are on
  run('clearEnemies(); LEVELS.parade.start(false)'); step(2);
  at(-40, 310.6, Math.PI); step(4);
  check('walking straight to the Tower\'s doors doesn\'t end the level with the fights still on', TW.game.state !== 'won', TW.game.state);

  // ---- the fights, in order
  run('clearEnemies(); LEVELS.parade.start(false)'); step(2);
  for (const [i, E] of C.encounters.entries()) {
    at(E.respawn[0], E.trigger + 0.4, Math.PI); step(Math.ceil((1 + C.spawnGap * (E.spawn.length + 1)) / DT));
    check(`${E.name}: walking in starts the fight with its whole crew`, TW.level.encounter === i && TW.enemies.length === E.spawn.length && TW.enemies.every(e => e.alive), TW.enemies.map(e => e.type).join(','));
    check(`${E.name}: the Palace's doors are shut behind you while it's on`, TW.LOCKED.has('prDoor'));
    at(E.respawn[0], E.arena[1] + 4, Math.PI); step(2);
    check(`${E.name}: it holds you until it's clear`, LH().z <= E.arena[1] + 1e-6, 'z ' + LH().z.toFixed(2));
    at(E.respawn[0], E.arena[0] - 4, Math.PI); step(2);
    check(`${E.name}: both ways`, LH().z >= E.arena[0] - 1e-6, 'z ' + LH().z.toFixed(2));
    if (i === 1) {
      TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
      check('going down restarts the gymnasts\' fight at its start, full health', TW.level.encounter === 1 && TW.player.hp === TW.CFG.player.health && Math.abs(LH().z - E.respawn[1]) < 0.6 && TW.game.state !== 'lost', `z ${LH().z.toFixed(2)} ${TW.game.state}`);
      step(Math.ceil((1 + C.spawnGap * (E.spawn.length + 1)) / DT));
      check('with its whole crew back', TW.enemies.filter(e => e.alive).length === E.spawn.length, TW.enemies.filter(e => e.alive).length + ' up');
    }
    kill(); step(Math.ceil((C.clearedPause + 0.5) / DT));
    check(`${E.name}: clearing it opens the way on`, TW.game.state === 'walk' && !TW.level.arena && !TW.LOCKED.size, TW.game.state);
  }
  at(-70, 310.6, Math.PI); step(4);
  check('up at the north end but off to the side of the doors, nothing happens', TW.game.state === 'walk', TW.game.state);
  walkTo(-70, 300); walkTo(-40, 300); walkTo(-40, 309.8);
  check('walking up to the Tower of Labor\'s doors ends the level', TW.game.state === 'won' && TW.level.name === 'parade', TW.game.state);

  // ---- the hand-over to the Tower: whatever level walks on from here keeps you on the square's floor
  if (!Object.values(TW.LEVELS).some(L => L.after === 'parade')) {
    run(`defineLevel('towerStub', { cfg: () => ({ encounters: [], spawnGap: 1, clearedPause: 1, healBetween: 0 }), after: 'parade', enter: () => ACT1_WEST.head().z > 311.5,
      start() { level.name = 'towerStub'; level.encounter = -1; level.arena = null; game.state = 'walk'; } })`);
    const j = walkTo(-40, 312.2);
    check('walking on through the Tower\'s doors hands over with no jump, still on the floor', TW.level.name === 'towerStub' && Math.abs(LH().z - 312.2) < 0.1 && j < 0.05, `${TW.level.name} z ${LH().z.toFixed(2)}`);
    delete TW.LEVELS.towerStub;
  }

  // ---- physics cost among the floats (4 goons + props)
  run('clearEnemies(); LEVELS.parade.start(false); level.encounter = 99'); at(-40, 262, Math.PI); step(2);
  for (const t of ['laborer', 'conscript', 'cook', 'wrestler']) { const e = new TW.Enemy(t); const q = W(-48 + rnd() * 16, 0, 262 + rnd() * 8); e.placeAt(q.x, q.z, 0); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('square physics cost per frame (4 goons + props, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} parade checks pass`);
process.exitCode = fails ? 1 : 0;
