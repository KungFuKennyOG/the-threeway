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
const at = (x, z, yaw) => { TW.rig.position.set(x, 0, z); run(`desk.yaw = ${yaw}; desk.pitch = 0;`); };   // yaw PI faces +z (toward the Tower)
const walk = (x, z) => { const p = V(x, 0, z); TW.keepInWalk(p, 0.3); return [p.x, p.z]; };
const solidAt = (x, z) => { const p = V(x, 0, z); TW.pushOutXZ(p, 0.3); return Math.hypot(p.x - x, p.z - z) > 0.2; };
const stays = (x, z) => { const p = V(x, 0, z); TW.keepInWalk(p, 0.3); TW.pushOutXZ(p, 0.3); return Math.hypot(p.x - x, p.z - z) < 1e-6; };
const KRAS = new Set(['conscript', 'laborer', 'wrestler', 'cook', 'guard', 'gymnast', 'bandsman', 'specialist']);
const kill = () => { for (const e of TW.enemies) { e.hp = 0; e.knockdown(V(0, 0, 1), 'knockdown', true); } };
const walkTo = (x, z, sp = 0.035) => {   // walk in small steps, like the keyboard (walk rects and blockers apply)
  let jump = 0;
  for (let k = 0; k < 3000; k++) {
    const dx = x - TW.rig.position.x, dz = z - TW.rig.position.z, d = Math.hypot(dx, dz); if (d < 0.02) break;
    const s = Math.min(sp, d), p0 = TW.rig.position.clone(); TW.rig.position.x += dx / d * s; TW.rig.position.z += dz / d * s;
    const p = V(TW.rig.position.x, TW.rig.position.y, TW.rig.position.z); TW.keepInWalk(p, 0.3); TW.rig.position.x = p.x; TW.rig.position.z = p.z;
    step(1); jump = Math.max(jump, TW.rig.position.distanceTo(p0));
  }
  return jump;
};

// The Palace of Sport is another level (src/levels.js registry). If it isn't on this branch, a stub stands in for it:
// just enough to be 'won' with you standing in its north doorway.
if (!TW.LEVELS.palace) run(`defineLevel('palace', { cfg: () => ({ encounters: [], spawnGap: 1, clearedPause: 1, healBetween: 0 }), rects: [],
  start() { level.name = 'palace'; level.encounter = -1; level.arena = null; clearEnemies(); game.state = 'walk'; } })`);
els.deskBtn.fire('click');
step(3);
try {
  // ---- the build: one baked mesh on the street atlas, in budget, nothing from the far city on it
  check('Parade Square is one mesh on the street atlas, light baked in', PR.mesh && PR.mesh.geometry.attributes.bake && PR.mesh.material.uniforms.uBaked.value === 1 && D.outside().length === 1);
  check('its triangles stay within budget', PR.tris < 12000, PR.tris + ' tris');
  check('its lamps are baked (four flood masts, sodium, the floats, the stand) and pushed for goons to be lit by', PR.lamps.length >= 12 && PR.lamps.every(l => TW.ST.lamps.includes(l)), PR.lamps.length + ' lights');
  { const P = TW.ST.skylineMesh.geometry.attributes.position.array, R = PR.rect; let n = 0;
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
  check('it\'s all one flat floor: no stairs, no ramps', TW.WALK.filter(w => /^pr/.test(w.area)).every(w => !w.ramp && w.y === 0), TW.WALK.filter(w => /^pr/.test(w.area)).length + ' walk rects');
  check('on the menu as "6 · Parade Square"', D.menu === '6 · Parade Square' && D.after === 'palace');
  check('three fights of 3-5 goons, every one Krasnovian', C.encounters.length === 3 && C.encounters.every(E => E.spawn.length >= 3 && E.spawn.length <= 5 && E.spawn.every(s => KRAS.has(s[0]))), C.encounters.map(E => E.spawn.map(s => s[0]).join('+')).join(' | '));
  run('LEVELS.parade.start(false); level.encounter = 99'); step(1);
  check('every goon spawns on open paving, every respawn is clear', C.encounters.every(E => E.spawn.every(s => stays(s[1], s[2])) && stays(E.respawn[0], E.respawn[1])),
    C.encounters.flatMap(E => E.spawn.filter(s => !stays(s[1], s[2])).map(s => s.join(' '))).join(', '));

  // ---- from the menu
  run('clearEnemies(); LEVELS.parade.start(false)'); step(2);
  check('starting here puts you just out of the Palace\'s doors, facing the Tower, at full health', TW.level.name === 'parade' && TW.game.state === 'walk' && Math.hypot(TW.player.head.x - C.start[0], TW.player.head.z - C.start[1]) < 0.6 && TW.player.hp === TW.CFG.player.health, `${TW.level.name} ${TW.player.head.x.toFixed(1)}, ${TW.player.head.z.toFixed(1)}`);
  check('the square\'s props are stocked', TW.props.length === C.props.length && TW.props.every(p => p.body.ps[0].x.z > 253), TW.props.length + ' props');

  // ---- walking in from the Palace of Sport, no cut
  run('clearEnemies(); LEVELS.palace.start(false); game.state = "won"; game.timer = 0;');
  at(-40, 251.9, Math.PI); step(3);
  const before = [TW.rig.position.x, TW.rig.position.z];
  check('in the Palace\'s doorway, the Palace still on', TW.level.name === 'palace' && TW.game.state === 'won', TW.level.name);
  const jump = walkTo(-40, 253.5);
  check('walking out of its north doors puts you on Parade Square, right where you are', TW.level.name === 'parade' && Math.abs(TW.player.head.z - 253.5) < 0.1 && Math.abs(TW.rig.position.x - before[0]) < 0.05 && jump < 0.05,
    `${TW.level.name} z ${TW.player.head.z.toFixed(2)}, biggest step ${(jump * 100).toFixed(1)} cm`);
  check('the Palace\'s props stay behind; the square\'s are stocked', TW.props.length === C.props.length, TW.props.length + ' props');

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
  check('so are the reviewing stand, the bass drum, the portico\'s pillars, the masts', solidAt(-55, 307) && solidAt(-25, 307) && solidAt(-24.5, 296.2) && solidAt(-71.2, 281) && solidAt(-69.6, 257.6));
  check('ragdolls hit them too (world boxes)', [[-55, 1, 266], [-55, 4, 266.6], [-30, 2, 307], [-24.5, 1, 296.2]].every(([bx, by, bz]) => TW.WORLD_BOXES.some(b => bx > b[0] && bx < b[3] && by > b[1] && by < b[4] && bz > b[2] && bz < b[5])));
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
    check(`${E.name}: it holds you until it's clear`, TW.player.head.z <= E.arena[1] + 1e-6, 'z ' + TW.player.head.z.toFixed(2));
    at(E.respawn[0], E.arena[0] - 4, Math.PI); step(2);
    check(`${E.name}: both ways`, TW.player.head.z >= E.arena[0] - 1e-6, 'z ' + TW.player.head.z.toFixed(2));
    if (i === 1) {
      TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
      check('going down restarts the gymnasts\' fight at its start, full health', TW.level.encounter === 1 && TW.player.hp === TW.CFG.player.health && Math.abs(TW.player.head.z - E.respawn[1]) < 0.6 && TW.game.state !== 'lost', `z ${TW.player.head.z.toFixed(2)} ${TW.game.state}`);
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
    run(`defineLevel('towerStub', { cfg: () => ({ encounters: [], spawnGap: 1, clearedPause: 1, healBetween: 0 }), after: 'parade', enter: () => player.head.z > 311.5,
      start() { level.name = 'towerStub'; level.encounter = -1; level.arena = null; game.state = 'walk'; } })`);
    const j = walkTo(-40, 312.2);
    check('walking on through the Tower\'s doors hands over with no jump, still on the floor', TW.level.name === 'towerStub' && Math.abs(TW.player.head.z - 312.2) < 0.1 && j < 0.05, `${TW.level.name} z ${TW.player.head.z.toFixed(2)}`);
    delete TW.LEVELS.towerStub;
  }

  // ---- physics cost among the floats (4 goons + props)
  run('clearEnemies(); LEVELS.parade.start(false); level.encounter = 99'); at(-40, 262, Math.PI); step(2);
  for (const t of ['laborer', 'conscript', 'cook', 'wrestler']) { const e = new TW.Enemy(t); e.placeAt(-48 + rnd() * 16, 262 + rnd() * 8, 0); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('square physics cost per frame (4 goons + props, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} parade checks pass`);
process.exitCode = fails ? 1 : 0;
