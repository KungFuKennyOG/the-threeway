// Headless checks for raised floors, ramps and stairs: a test-only staircase (a ramp up to a landing at 3 m) built
// far off to the side of the bar. Walking up, goons standing, falling and getting up on it, props resting on it, and
// the flat levels playing out exactly as they do without it.
'use strict';
const vm = require('vm');
const THREE = require('./three_stub.js');
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const DT = 1 / 72;

// one copy of the game in its own context (own clock, own seeded Math.random)
function boot(seed0) {
  const S = { clock: 0, seed: seed0 };
  const rnd = () => { S.seed = (S.seed * 9301 + 49297) % 233280; return S.seed / 233280; };
  const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {}, addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, fire(t, e) { for (const f of this._l[t] || []) f(e || {}); } });
  const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info']) els[id] = mkEl(id);
  els.c.requestPointerLock = () => {};
  class ImageStub { set src(v) { this.width = 40; this.height = 16; if (this.onload) this.onload(); } }
  const ctx = { THREE, console, Math: Object.create(Math), document: { getElementById: (id) => els[id], addEventListener() {} }, navigator: {}, Image: ImageStub,
    innerWidth: 1280, innerHeight: 720, performance: { now: () => S.clock * 1000 }, addEventListener() {}, setTimeout, Map, Set, Array, Object, Number, String, Float32Array, Uint8Array, JSON };
  ctx.Math.random = rnd; ctx.window = ctx;
  vm.createContext(ctx);
  require('./load.js')(ctx);
  const run = (c) => vm.runInContext(c, ctx);
  const TW = ctx.__tw;
  const step = (n, f) => { for (let i = 0; i < n; i++) { S.clock += DT; if (f) f(i); TW.renderer.loop(); } };
  els.deskBtn.fire('click');
  run(`clearEnemies(); game.state = 'fight'; game.queue = []; game.timer = 0;`);
  run('updateGame = function () {};');   // no wave flow: each check sets up its own goons
  TW.rig.position.set(0, 0, 0); run('desk.yaw = Math.PI; desk.pitch = 0;');
  step(5);
  return { S, run, TW, step };
}
// the test staircase, x 296..312 (nothing else is out there). Overlaps the bar's z bands on purpose.
// Rects overlap to connect (like the levels'): the flight's rect runs 1 m past each end of its run, where it's level.
const STAIRS = `
  addWalk({ x0: 296, x1: 306, z0: -4, z1: 2, y: 0, pad: 0.3 });                                   // ground at the foot of the stairs
  addWalk({ x0: 300, x1: 302, z0: 1, z1: 9, y0: 0, y1: 3, along: 'z', run: [2, 8], pad: 0.3 });   // the flight: 3 m up over 6 m
  addWalk({ x0: 296, x1: 306, z0: 8, z1: 14, y: 3, pad: 0.3 });                                   // the landing at 3 m
  addWalk({ x0: 306, x1: 312, z0: 4, z1: 16, wx0: 305.4, pad: 0.3 });   // a yard at y 0 off the landing's east edge (its particle wall reaches under the edge)
  addWalk({ x0: 296, x1: 299, z0: 9, z1: 13, pad: 0.3 });                                         // a room at y 0 under the landing's west end
  indexWorld();`;

const log = [];
const check = (name, ok, extra = '') => log.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  (' + extra + ')' : ''));
const f2 = (x) => x.toFixed(2);

// the same bar scenario in a copy of the game with and without the staircase: every particle must end up in the same place
function barScenario(G) {
  const { run, TW, step } = G;
  run('stockProps();');
  const e = new TW.Enemy('boso'); e.cooldown = 1e9; e.cfg = Object.assign({}, e.cfg, { speed: 0 }); e.placeAt(0, 1.7, 0); e.state = 'circle'; TW.enemies.push(e);
  TW.rig.position.set(0, 0, 2.6); step(40);
  e.poise = 0; e.hp = 200;
  run(`(() => { const e = enemies[0]; playerHit(e, 'head', 7.2, 0.6, null, e.zone('head').pos.clone(), null, new THREE.Vector3(0, 0, -1)); })()`);
  step(200);
  const c = new TW.Enemy('wrestler'); c.placeAt(0, -1.7, Math.PI); c.state = 'circle'; TW.enemies.push(c); step(10);
  c.thrownBy(V(0, 0.3, -4)); step(120);
  run(`keys.add('KeyW')`); step(150); run(`keys.delete('KeyW'); keys.add('KeyA')`); step(150); run(`keys.delete('KeyA')`); step(30);
  const out = [TW.rig.position.x, TW.rig.position.y, TW.rig.position.z];
  for (const b of TW.bodies) for (const p of b.ps) out.push(p.x.x, p.x.y, p.x.z);
  return out;
}

try {
  // ---- the flat levels don't change: the same bar fight with and without raised floors in the world
  const A = boot(11), B = boot(11);
  B.run(STAIRS);
  check('the test staircase makes the bar\'s z bands non-flat (so the general floor path runs there)', B.run('walkBands.get(0).flat') === false && A.run('walkBands.get(0).flat') === true);
  const ra = barScenario(A), rb = barScenario(B);
  let maxD = 0; for (let i = 0; i < Math.max(ra.length, rb.length); i++) maxD = Math.max(maxD, Math.abs((ra[i] || 0) - (rb[i] || 0)));
  check('y-0 levels play out exactly as before (bar fight, knockdown, throw, props, walking into walls)', ra.length === rb.length && maxD === 0, ra.length / 3 + ' points, max diff ' + maxD);
  check('nothing in the bar left y 0: the player stays on the floor', ra[1] === 0 && A.TW.player.floorY === 0);

  const { run, TW, step } = B;
  run('clearEnemies(); stockProps();');
  // ---- the floor function
  const fa = (x, z, y) => run(`floorAt(${x}, ${z}, ${y === undefined ? 'undefined' : y})`);
  check('floorAt: ground, mid-flight, landing', fa(301, 0, 0) === 0 && Math.abs(fa(301, 5, 1.5) - 1.5) < 1e-9 && fa(301, 11, 3) === 3, `${fa(301, 0, 0)} / ${f2(fa(301, 5, 1.5))} / ${fa(301, 11, 3)}`);
  check('floorAt: stacked floors pick the one you stand on', fa(297.5, 11, 0) === 0 && fa(297.5, 11, 3) === 3 && fa(297.5, 11) === 3, `from below ${fa(297.5, 11, 0)}, from above ${fa(297.5, 11, 3)}`);
  check('floorAt: a rect\'s pad reaches its edge but doesn\'t hold you up past it', fa(306.2, 11, 3) === 0 && fa(305.9, 11, 3) === 3);
  const steps = run(`stairSteps(WALK.find(w => w.ramp && w.x0 === 300), 12)`);
  check('stairSteps: the treads cross the ramp at their middles', steps.length === 12 && steps.every(s => Math.abs(s[4] - fa(301, (s[2] + s[5]) / 2, 9)) < 1e-9), steps.length + ' treads, first top ' + f2(steps[0][4]));

  // ---- the player walks up the stairs
  TW.rig.position.set(301, 0, -1); run('desk.yaw = Math.PI; desk.pitch = 0;'); step(2);
  let maxDy = 0, minDy = 0, maxErr = 0, prev = TW.rig.position.y;
  run(`keys.add('KeyW')`);
  step(Math.ceil(5.6 / DT), () => {
    const y = TW.rig.position.y, z = TW.rig.position.z;
    maxDy = Math.max(maxDy, y - prev); minDy = Math.min(minDy, y - prev); prev = y;
    if (z > 3 && z < 7) maxErr = Math.max(maxErr, Math.abs(y - (z - 2) / 2));
  });
  run(`keys.delete('KeyW')`); step(30);
  const lim = TW.CFG.floors.maxRise * DT;
  check('walking up the stairs lifts you onto the landing', Math.abs(TW.rig.position.y - 3) < 1e-6 && TW.rig.position.z > 8.5 && Math.abs(TW.player.head.y - (3 + TW.CFG.player.standHeight)) < 0.01, `rig y ${f2(TW.rig.position.y)}, z ${f2(TW.rig.position.z)}, head ${f2(TW.player.head.y)}`);
  check('smoothly: never down, never faster than maxRise', minDy > -1e-9 && maxDy <= lim + 1e-9, `largest step ${(maxDy * 1000).toFixed(1)} mm/frame (limit ${(lim * 1000).toFixed(1)})`);
  check('your feet follow the flight', maxErr < 0.2, 'max lag ' + f2(maxErr) + ' m');
  // the landing's edge over the yard is a wall for walking (walk rects keep you on)
  TW.rig.position.set(305, 3, 11); step(2);
  run(`keys.add('KeyA')`); step(Math.ceil(1.5 / DT)); run(`keys.delete('KeyA')`); step(2);
  check('you can\'t walk off the landing\'s edge', TW.rig.position.x <= 306 + 1e-6 && TW.rig.position.y === 3, `x ${f2(TW.rig.position.x)}, y ${f2(TW.rig.position.y)}`);

  // VR: the floor under your head counts, not the middle of your play space
  run('xrMode = true'); TW.rig.position.set(301, 3, 8.6); TW.rig.rotation.set(0, 0, 0); TW.camera.position.set(0, 1.6, -1.0); step(Math.ceil(1.5 / DT));
  const vrY = TW.rig.position.y, vrHead = TW.player.head.clone();
  run('xrMode = false'); TW.camera.position.set(0, TW.CFG.player.standHeight, 0); TW.rig.rotation.set(0, 0, 0);
  check('in VR the floor under your head is the one you stand on', Math.abs(vrHead.z - 7.6) < 0.01 && Math.abs(vrY - 2.8) < 0.01, `head over z ${f2(vrHead.z)} (flight at ${f2((vrHead.z - 2) / 2)} m), rig y ${f2(vrY)}`);

  // ---- a goon on the landing: stands, hits, gets hit, goes down and gets up there
  TW.rig.position.set(301, 3, 11); run('desk.yaw = Math.PI; desk.pitch = 0;'); step(3);
  const e = new TW.Enemy('boso'); e.cooldown = 1e9; e.cfg = Object.assign({}, e.cfg, { speed: 0 }); e.placeAt(301, 11.95, Math.PI); e.state = 'circle'; TW.enemies.push(e);
  step(60);
  const P = e.body.by, feet = () => Math.min(P.anL.x.y, P.anR.x.y);
  check('a goon placed on the landing stands at 3 m', e.pos.y === 3 && feet() > 3 && feet() < 3.2 && P.head.x.y - 3 > 1.4 && P.head.x.y - 3 < 1.8, `pos y ${e.pos.y}, feet ${f2(feet())}, head ${f2(P.head.x.y)}`);
  run('lastHit = null'); const hp0 = e.hp;
  run('deskPunch(hands.right, true)'); step(20);
  check('your punch lands at head height up there', run('lastHit') !== null && e.hp < hp0, run('lastHit ? lastHit.tier + " to the " + lastHit.zone : "no hit"'));
  e.state = 'circle'; e.setFace('normal'); step(40);
  // his punch: stand still and it finds your head (lands, or your guard takes it); duck and it misses
  const php = TW.player.hp; e.hasToken = true; e.startWindup(); let found = false, missed = false;
  step(Math.ceil((e.windupTime + 0.3) / DT), () => { if (e.state === 'recover') found = true; if (e.state === 'whiff') missed = true; });
  check('standing still, his punch finds your head up there', found && !missed, `${found ? (TW.player.hp < php ? 'hit, hp ' + php + ' -> ' + TW.player.hp : 'blocked') : missed ? 'whiffed' : e.state}`);
  e.state = 'circle'; step(40);
  e.hasToken = true; e.startWindup(); let whiff = false;   // duck once he's locked on (end of the windup)
  step(Math.ceil((e.windupTime + 0.3) / DT), () => { if (e.state === 'strike') run(`keys.add('KeyC')`); if (e.state === 'whiff') whiff = true; }); run(`keys.delete('KeyC')`);
  check('ducking still dodges up there', whiff, e.state);
  e.state = 'circle'; e.cooldown = 1e9; step(60);
  // knock him down on the landing
  e.poise = 0; e.hp = 200;
  run(`(() => { const e = enemies[0]; playerHit(e, 'chest', 5.5, 0.6, null, e.zone('chest').pos.clone(), null, new THREE.Vector3(-1, 0, 0.3)); })()`);
  check('a heavy hit floors him', e.state === 'ragdoll', e.state);
  let sink = 9; step(Math.ceil(1.6 / DT), () => { for (const p of e.body.ps) sink = Math.min(sink, p.x.y - p.r - 3); });
  check('his ragdoll lands on the landing, not through it to y 0', sink > -0.03 && P.pelvis.x.y > 3 && P.pelvis.x.y < 3.5, `deepest ${(sink * 100).toFixed(1)} cm into it, pelvis ${f2(P.pelvis.x.y)}`);
  let upAt = -1; step(Math.ceil(4 / DT), (i) => { if (upAt < 0 && e.hittable()) upAt = i * DT; });
  check('and gets back up there', upAt > 0 && e.pos.y === 3 && P.head.x.y - 3 > 1.4, `after ${f2(upAt)} s, head ${f2(P.head.x.y)}`);

  // ---- thrown off the landing's edge: falls to the yard below and gets up there
  run('clearEnemies();'); TW.rig.position.set(303.5, 3, 11); step(3);
  const t = new TW.Enemy('boxer'); t.cooldown = 1e9; t.placeAt(305.2, 11, Math.PI / 2); t.state = 'circle'; TW.enemies.push(t); step(30);
  t.thrownBy(V(1.6, 0.5, 0));
  let tMin = 9; step(Math.ceil(2 / DT), () => { for (const p of t.body.ps) tMin = Math.min(tMin, p.x.y - p.r); });
  const TP = t.body.by;
  check('a goon thrown off the landing falls to the yard below', TP.pelvis.x.x > 306 && TP.pelvis.x.y < 0.5 && tMin > -0.03, `pelvis at x ${f2(TP.pelvis.x.x)}, y ${f2(TP.pelvis.x.y)}; lowest ${f2(tMin)}`);
  let tUp = -1; step(Math.ceil(4 / DT), (i) => { if (tUp < 0 && t.hittable()) tUp = i * DT; });
  check('and gets up down there', tUp > 0 && t.pos.y === 0 && TP.head.x.y > 1.4 && TP.head.x.y < 2, `after ${f2(tUp)} s, head ${f2(TP.head.x.y)}`);

  // ---- a goon walks up the flight after you
  run('clearEnemies();'); TW.rig.position.set(301, 3, 11.5); step(3);
  TW.player.hp = 100;
  const w = new TW.Enemy('boxer'); w.placeAt(301, -1, 0, 0); TW.enemies.push(w); w.setState('approach'); w.cooldown = 0;
  let wGap = 0; step(Math.ceil(8 / DT), () => { const W = w.body.by; for (const a of [W.anL, W.anR]) wGap = Math.min(wGap, a.x.y - a.r - run(`floorAt(${a.x.x}, ${a.x.z}, ${a.x.y})`)); });
  check('a goon walks up the stairs to you', w.pos.y === 3 && w.pos.z > 8.5, `pos y ${f2(w.pos.y)}, z ${f2(w.pos.z)}, state ${w.state}`);
  check('his feet stay on the flight', wGap > -0.06, 'deepest ' + (wGap * 100).toFixed(1) + ' cm');

  // ---- props
  run('clearEnemies();'); TW.rig.position.set(296.5, 0, -3); step(3);
  const drop = (type, x, y, z) => { const p = new TW.Prop(type, V(x, y, z)); p.body.wake(); return p; };
  const crate = drop('crate', 303, 4.5, 10), bottle = drop('bottle', 299.6, 3.8, 12.5), under = drop('bottle', 297.5, 1.2, 11), onTop = drop('bottle', 297.5, 4, 11);
  const flight = drop('bin', 301, 3, 5);
  const placed = new TW.Prop('crate', V(304, 0, 13)), ground = new TW.Prop('crate', V(304, 0, -3));   // a level placing props at y 0: over the landing, on the ground
  let rampMin = 9; step(Math.ceil(2.5 / DT), () => { for (const p of flight.body.ps) rampMin = Math.min(rampMin, p.x.y - p.r - run(`floorAt(${p.x.x}, ${p.x.z}, ${p.x.y - p.r})`)); });
  const low = (p) => Math.min(...p.body.ps.map(q => q.x.y - q.r));
  check('a crate dropped on the landing rests on it', Math.abs(low(crate) - 3) < 0.03 && crate.body.sleep, 'bottom ' + f2(low(crate)) + (crate.body.sleep ? ', asleep' : ''));
  check('a bottle dropped on the landing rests on it', Math.abs(low(bottle) - 3) < 0.03, 'bottom ' + f2(low(bottle)));
  check('under the landing: a bottle drops to the room below, one above lands on top', Math.abs(low(under)) < 0.03 && Math.abs(low(onTop) - 3) < 0.03, `${f2(low(under))} / ${f2(low(onTop))}`);
  check('a bin dropped on the flight never sinks into it', rampMin > -0.03, 'deepest ' + (rampMin * 100).toFixed(1) + ' cm');
  check('a prop placed at y 0 over the landing stands on the landing (as it would on the ground)', Math.abs(low(placed) - 3 - low(ground)) < 1e-9, `bottom ${f2(low(placed))}, on the ground ${f2(low(ground))}`);

  // ---- cost of the raised-floor path: 4 goons on the flight and landing + props
  run('clearEnemies(); stockProps();'); TW.rig.position.set(301, 3, 12.5); step(3);
  [[301, 5], [299, 9.5], [303, 10], [297.5, 11]].forEach(([x, z], i) => { const q = new TW.Enemy(['boso', 'boxer', 'wrestler', 'boso'][i]); q.placeAt(x, z, 0, 3); TW.enemies.push(q); });
  for (const [x, z] of [[302, 9], [304, 12], [298, 12]]) drop('crate', x, 3.5, z);
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('physics cost on the stairs per frame (4 goons + props, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
