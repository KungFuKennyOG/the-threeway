// Headless physics checks: scale, active ragdoll tracking, limp knockdowns, get-up, dominoes, props.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const THREE = require('./three_stub.js');
const dir = path.join(__dirname, '..');
let clock = 0, seed = 11;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {}, addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, fire(t, e) { for (const f of this._l[t] || []) f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info']) els[id] = mkEl(id);
els.c.requestPointerLock = () => {};
class ImageStub { set src(v) { this.width = 40; this.height = 16; if (this.onload) this.onload(); } }
const ctx = { THREE, console, Math: Object.create(Math), document: { getElementById: (id) => els[id], addEventListener() {} }, navigator: {}, Image: ImageStub,
  innerWidth: 1280, innerHeight: 720, performance: { now: () => clock * 1000 }, addEventListener() {}, setTimeout, Map, Set, Array, Object, Number, String, Float32Array, JSON };
ctx.Math.random = rnd; ctx.window = ctx;
vm.createContext(ctx);
require('./load.js')(ctx);
const run = (c) => vm.runInContext(c, ctx);
const TW = ctx.__tw;
const log = [];
const check = (name, ok, extra = '') => log.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  (' + extra + ')' : ''));
const DT = 1 / 72;
const step = (n, f) => { for (let i = 0; i < n; i++) { clock += DT; if (f) f(i); TW.renderer.loop(); } };
const frames = [];   // particle snapshots for the stick-figure strip
const snap = (e, tag) => frames.push({ tag, t: +clock.toFixed(2), ps: e.body.ps.map(p => [p.name, +p.x.x.toFixed(3), +p.x.y.toFixed(3), +p.x.z.toFixed(3)]) });

els.deskBtn.fire('click');
run(`clearEnemies(); game.state = 'fight'; game.queue = []; game.timer = 0;`);
run('var __ug = updateGame; updateGame = function () {};');   // no wave flow here: each check sets up its own goons
TW.rig.position.set(0, 0, 0); run('desk.yaw = Math.PI; desk.pitch = 0;');
step(5);
const freeze = (e) => { e.cooldown = 1e9; e.cfg = Object.assign({}, e.cfg, { speed: 0 }); };
try {
  // ---- scale + standing heights
  const H = {};
  const ALL = Object.keys(TW.CFG.enemies);   // every goon there is (the Palace's, the Parade's, the Tower's, the officials' too)
  for (const t of ALL) {
    const e = new TW.Enemy(t); freeze(e); e.placeAt(0, 2.5, Math.PI); e.state = 'circle'; TW.enemies.push(e);
    step(90);
    const P = e.body.by;
    H[t] = { head: P.head.x.y, top: P.head.x.y + 0.15 * e.s, pelvis: P.pelvis.x.y, foot: Math.min(P.anL.x.y, P.anR.x.y) };
    // does the drawn body match the animated skeleton?
    let maxPos = 0;
    for (const [n, part] of [['torso', 'torso'], ['head', 'head'], ['uarmr', 'uarmr'], ['thighl', 'thighl'], ['shinr', 'shinr']]) {
      const vp = new THREE.Vector3(); const m = e.partM[part].elements; vp.set(m[12], m[13], m[14]);
      const bp = e.bones[part].getWorldPosition(new THREE.Vector3());
      maxPos = Math.max(maxPos, vp.distanceTo(bp));
    }
    check(`${t}: drawn parts sit on the animated skeleton`, maxPos < 0.08, 'max offset ' + maxPos.toFixed(3) + ' m');
    const meshes = TW.scene.children.filter(o => o.material === e.mat);
    check(`${t}: one mesh, one draw call`, meshes.length === 1 && meshes[0].children.length === 0, meshes.length + ' meshes');
    e.remove();
  }
  for (const t of Object.keys(H)) {
    const [lo, hi] = TW.CFG.enemies[t].boss ? [1.72, 2.02] : [1.6, 1.92];   // bosses: Inspector Orlova is a tall woman, the Bear a giant
    check(`${t}: realistic height`, H[t].top > lo && H[t].top < hi, `top of head ${H[t].top.toFixed(2)} m, pelvis ${H[t].pelvis.toFixed(2)}, feet ${H[t].foot.toFixed(2)}`);
  }

  // ---- hit shove: a solid punch moves the chest, then it springs back
  TW.rig.position.set(0, 0, 2.6); step(3);
  const e = new TW.Enemy('boso'); freeze(e); e.placeAt(0, 1.7, 0); e.state = 'circle'; TW.enemies.push(e);
  step(40);
  const c0 = e.body.by.chest.x.clone();
  run(`(() => { const e = enemies[0]; playerHit(e, 'chest', 4.0, 0.5, null, e.zone('chest').pos.clone(), null, new THREE.Vector3(0, 0, -1)); })()`);
  let maxShift = 0; step(30, () => { maxShift = Math.max(maxShift, e.body.by.chest.x.distanceTo(c0)); });
  check('solid hit physically shoves the chest', maxShift > 0.06, 'peak ' + maxShift.toFixed(3) + ' m');
  step(80);
  check('then the active ragdoll recovers its stance', e.body.by.chest.x.distanceTo(e.targets.chest) < 0.05 && e.hittable(), e.state + ' err ' + e.body.by.chest.x.distanceTo(e.targets.chest).toFixed(3));

  // ---- heavy launch: goes limp, flies, lands, gets up
  e.poise = 0; e.hp = 200;
  snap(e, 'before');
  run(`(() => { const e = enemies[0]; playerHit(e, 'head', 7.2, 0.6, null, e.zone('head').pos.clone(), null, new THREE.Vector3(0, 0, -1)); })()`);
  check('heavy on a staggered goon launches him into a ragdoll', e.state === 'ragdoll', e.state);
  let maxH = 0, minY = 9, outside = false, maxStretch = 0, sawFly = 0;
  const rest = e.body.cs.filter(c => !c.min && c.k === 1).map(c => [c, c.rest]);
  step(Math.ceil(1.6 / DT), (i) => {
    const P = e.body.by; maxH = Math.max(maxH, P.pelvis.x.y);
    for (const p of e.body.ps) { minY = Math.min(minY, p.x.y - p.r); if (Math.abs(p.x.x) > 5 || Math.abs(p.x.z) > 5) outside = true; }
    for (const [c, r] of rest) maxStretch = Math.max(maxStretch, Math.abs(c.a.x.distanceTo(c.b.x) - r) / r);
    sawFly = Math.max(sawFly, P.pelvis.v.length());
    if (i % 12 === 0) snap(e, 'launch');
  });
  check('launch flies (pelvis speed)', sawFly > 3, sawFly.toFixed(2) + ' m/s');
  check('bodies never sink through the floor', minY > -0.02, 'min ' + minY.toFixed(3));
  check('bodies stay inside the room', !outside);
  check('bones keep their length (no stretchy ragdolls)', maxStretch < 0.15, 'max stretch ' + (maxStretch * 100).toFixed(1) + '%');
  const Pl = e.body.by;
  check('lands lying down', Pl.pelvis.x.y < 0.45 && Pl.head.x.y < 0.6, `pelvis ${Pl.pelvis.x.y.toFixed(2)} head ${Pl.head.x.y.toFixed(2)}`);
  snap(e, 'down');
  let upAt = -1; step(Math.ceil(4 / DT), (i) => { if (i % 18 === 0) snap(e, e.state); if (upAt < 0 && e.hittable()) upAt = i * DT; });
  check('gets back up out of the ragdoll', upAt > 0 && e.body.by.head.x.y > 1.4, `after ${upAt.toFixed(2)} s, head ${e.body.by.head.x.y.toFixed(2)}`);
  snap(e, 'up');

  // ---- dominoes: throw one goon into another
  run(`clearEnemies();`);
  const a = new TW.Enemy('boso'), b = new TW.Enemy('boxer');
  TW.rig.position.set(3.5, 0, -1.5); step(3);
  freeze(a); freeze(b); a.placeAt(0, -1.0, 0); a.state = b.state = 'circle';
  b.placeAt(-0.1, 1.2, Math.PI);
  TW.enemies.push(a, b); step(20);
  a.thrownBy(new THREE.Vector3(0, 0.6, 2.4));
  let bDown = false; step(Math.ceil(1.5 / DT), () => { if (b.state === 'ragdoll') bDown = true; });
  check('a thrown goon bowls over the one he hits', bDown, 'b.state ' + b.state + ' a at z ' + a.body.by.pelvis.x.z.toFixed(2));

  // ---- props: a ragdoll knocks a stool over
  run(`clearEnemies(); stockProps();`);
  const stool = TW.props.find(p => p.type === 'stool' && Math.abs(p.body.by.base.x.x) < 0.01 && Math.abs(p.body.by.base.x.z + 2.95) < 0.01);
  const s0 = stool.body.by.seat.x.clone();
  TW.rig.position.set(3.5, 0, 2); step(3);
  const c = new TW.Enemy('wrestler'); freeze(c); c.placeAt(0, -1.7, Math.PI); c.state = 'circle'; TW.enemies.push(c); step(10);
  c.thrownBy(new THREE.Vector3(0, 0.3, -4));
  step(Math.ceil(1.5 / DT));
  check('a flying body scatters the bar stools', stool.body.by.seat.x.distanceTo(s0) > 0.25, 'stool moved ' + stool.body.by.seat.x.distanceTo(s0).toFixed(2) + ' m');
  // grab a collar: the rest of the body dangles
  run(`clearEnemies();`);
  TW.rig.position.set(0, 0, 0); step(3);
  const d = new TW.Enemy('boso'); freeze(d); d.placeAt(0, -0.85, Math.PI * 0); d.state = 'circle'; TW.enemies.push(d); step(30);
  const h = TW.hands.right;
  run(`hands.right.desk.mode = 'hold';`);
  d.grabbedBy(h); step(36);
  const pinD = d.pinned ? d.pinned.x.distanceTo(h.fist) : 9;
  check('grabbed goon hangs from your fist', d.state === 'held' && pinD < 0.02, 'pin gap ' + pinD.toFixed(3));
  check('the rest dangles (feet near the floor, not floating)', Math.min(d.body.by.anL.x.y, d.body.by.anR.x.y) < 0.6, 'feet ' + Math.min(d.body.by.anL.x.y, d.body.by.anR.x.y).toFixed(2));
  // ---- one draw call per stool
  run(`clearEnemies(); stockProps();`);
  const stools = TW.props.filter(q => q.type === 'stool');
  check('stools are one mesh each (vinyl + chrome atlas)', stools.length > 0 && stools.every(q => q.obj.isMesh !== false && q.obj.geometry && q.obj.children.length === 0 && q.obj.material.uniforms.map.value.src === run('TEX.stool')), stools.length + ' stools');
  // ---- the cook's lob lands on a still player's head
  seed = 11;   // this check depends on the random lob; pin the sequence so adding goon types elsewhere can't shift it
  run(`clearEnemies(); game.state = 'fight'; game.queue = [];`);
  TW.rig.position.set(0, 0, 0); run('desk.yaw = Math.PI; desk.pitch = 0;'); step(3);
  const cook = new TW.Enemy('cook'); cook.placeAt(0.6, 3.8, Math.PI); TW.enemies.push(cook); cook.setState('approach'); cook.throwCd = 0; cook.lobType = 'potato';
  let lobMin = 9, lobbed = null, hp0 = TW.player.hp;
  step(Math.ceil(3 / DT), () => { for (const q of TW.props) if (q.hostile) { lobbed = q; lobMin = Math.min(lobMin, run('(p) => closestOnSeg(player.head, p.prevPos, p.body.ps[0].x, new THREE.Vector3()).distanceTo(player.head)')(q)); } });
  check('the cook winds up and lobs at you', !!lobbed, cook.state);
  check('his lob lands on your head', lobMin < 0.3 && TW.player.hp < hp0, 'closest ' + lobMin.toFixed(2) + ' m, hp ' + hp0 + ' -> ' + TW.player.hp);
  // ---- Rocco & Ivan: stagger the active one and the other tags in; floor one for good and the other enrages
  run('updateGame = __ug;');
  run(`clearEnemies(); stockProps(); startWave(3);`);
  let spawned = false; step(Math.ceil(6 / DT), () => { if (TW.game.bosses.length === 2) spawned = true; });
  const B = TW.game.bosses;
  check('round 4 brings in Rocco and Ivan, one waiting', spawned && B.length === 2 && B.filter(e => e.benched).length === 1 && TW.bossBars.length === 2, B.map(e => e.type + (e.benched ? '(bench)' : '')).join(' '));
  const act = B.find(e => !e.benched), wait = B.find(e => e.benched);
  for (const e of B) { e.cooldown = 1e9; }
  run('game.tagT = 0');
  act.stagger(); step(4);
  check('staggering the active boss tags in his partner', act.benched && !wait.benched, `${act.type} benched ${act.benched}, ${wait.type} benched ${wait.benched}`);
  wait.hp = 0; wait.knockdown(new THREE.Vector3(0, 0, 1), 'knockdown', true); step(4);
  check('dropping one enrages the other', act.enraged && !act.benched && act.cfg.speed > TW.CFG.enemies[act.type].speed, act.type + ' enraged ' + act.enraged);
  // performance of the solver
  run(`clearEnemies(); stockProps();`);
  for (const t of ['boso', 'boxer', 'wrestler', 'boso']) { const q = new TW.Enemy(t); q.placeAt(rnd() * 4 - 2, rnd() * 3, 0); TW.enemies.push(q); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('physics cost per frame (4 goons + 13 props, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
fs.writeFileSync(path.join(__dirname, 'frames.json'), JSON.stringify(frames));
