// Act 2's Columbian regulars, their fighting: the soda jerk keeps his distance and lobs plates (they shatter) and bottles (you can
// catch one); the linebacker telegraphs and charges (a tackle shoves your view, eased under 60 mm a frame; sidestep him into the
// bar and he staggers; goons in his path are bowled over); the marshal parries a punch he sees coming and ripostes (never more than
// once per cooldown; side and back hits, feints and thrown props get through); the cadet's quick windup and the cadets' rally.
// Runs the real game in VR mode in the bar (fake XR session + controllers, like test/goons.js).
'use strict';
const vm = require('vm');
const THREE = require('./three_stub.js');
let clock = 0, seed = 7;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {},
  addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, async fire(t, e) { for (const f of this._l[t] || []) await f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info']) els[id] = mkEl(id);
const ctx2d = () => new Proxy({ calls: 0 }, { get: (t, k) => (k in t ? t[k] : () => { t.calls++; }), set: (t, k, val) => { t[k] = val; return true; } });
const documentStub = { pointerLockElement: null, getElementById: (id) => els[id], addEventListener() {}, createElement: () => ({ width: 0, height: 0, getContext: ctx2d }) };
class ImageStub { set src(v) { this.width = 40; this.height = 16; if (this.onload) this.onload(); } }
const mkPad = () => ({ axes: [0, 0, 0, 0], buttons: Array.from({ length: 6 }, () => ({ pressed: false, value: 0 })), hapticActuators: [{ pulse() {} }] });
const session = { _l: {}, addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); } };
const ctx = {
  THREE, console, Math: Object.create(Math), document: documentStub, Image: ImageStub, innerWidth: 1280, innerHeight: 720,
  navigator: { xr: { isSessionSupported: async () => true, requestSession: async () => session } },
  performance: { now: () => clock * 1000 }, addEventListener() {}, setTimeout, Map, Set, Array, Object, Number, String, Float32Array, JSON,
};
ctx.Math.random = rnd; ctx.window = ctx;
vm.createContext(ctx);
require('./load.js')(ctx);
const run = (c) => vm.runInContext(c, ctx);
const TW = ctx.__tw;
const log = [];
const check = (name, ok, extra = '') => log.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  (' + extra + ')' : ''));
const V = (x, y, z) => new THREE.Vector3(x, y, z);

(async () => {
  try {
    await new Promise(r => setTimeout(r, 0));
    await els.vrBtn.fire('click');
    TW.renderer.xr.isPresenting = true;
    const grips = TW.renderer.grips, pads = [mkPad(), mkPad()];
    grips[0].dispatchEvent({ type: 'connected', data: { handedness: 'right', gamepad: pads[0] } });
    grips[1].dispatchEvent({ type: 'connected', data: { handedness: 'left', gamepad: pads[1] } });
    TW.camera.position.set(0, 1.65, 0);
    const R = grips[0], L = grips[1], C = TW.CFG.enemies;
    const setGrip = (g, x, y, z) => g.position.set(x, y, z);
    const DT = 1 / 72;
    const step = (n = 1, f) => { for (let i = 0; i < n; i++) { clock += DT; if (f) f(i); TW.renderer.loop(); } };
    const until = (f, n) => { let k = 0; while (!f() && k++ < n) step(1); return f(); };
    const guardDown = () => { setGrip(R, 0.25, 1.0, -0.2); setGrip(L, -0.25, 1.0, -0.2); };
    const fresh = (x = 0, z = 0) => { run(`clearEnemies(); player.hp = 100; game.state = 'fight'; game.queue = []; for (const p of props.slice()) if (p.cfg.playerDmg || p.batLike || p.type === 'plate') p.break();`);
      TW.rig.position.set(x, 0, z); TW.rig.rotation.y = 0; R.rotation.set(0, 0, 0); pads[0].buttons[1].pressed = false;
      setGrip(R, x + 0.25, 1.0, z - 0.2); setGrip(L, x - 0.25, 1.0, z - 0.2); step(3); };
    const head = () => TW.player.head;
    const spawn = (t, x, z, o = {}) => { const e = new TW.Enemy(t); e.placeAt(x, z, Math.atan2(head().x - x, head().z - z)); e.setState(o.state || 'approach'); e.cooldown = o.cooldown ?? 0;
      if (o.cfg) e.cfg = Object.assign({}, e.cfg, o.cfg); TW.enemies.push(e); return e; };
    const ease = (g, to, frames) => { const from = g.position.clone(); for (let i = 1; i <= frames; i++) { g.position.lerpVectors(from, to, i / frames); step(1); } };
    const g = (k) => TW.game[k] || 0;
    run('var __ug = updateGame; updateGame = function () {};');   // no round flow: each check sets up its own goons
    step(10);

    // ================= the soda jerk: keeps his distance, lobs plates and bottles
    fresh();
    const sj = spawn('sodajerk', 0, 1.4); sj.throwCd = 99;
    step(Math.ceil(3 / DT));
    const sjd = Math.hypot(sj.pos.x - head().x, sj.pos.z - head().z);
    check('the soda jerk backs off to throwing range (3-5 m) instead of walking up', sjd > 2.8 && sjd < 5.4 && sj.state === 'keepaway', `${sjd.toFixed(2)} m, ${sj.state}`);
    sj.placeAt(0.5, 3.8, Math.atan2(-0.5, -3.8)); sj.detour = null; sj.setState('keepaway'); sj.throwCd = 0; sj.lobType = 'plate'; run('player.hp = 100');
    let plate = null, minPlate = 9; const plates0 = g('plates');
    step(Math.ceil(2.4 / DT), () => { for (const q of TW.props) if (q.type === 'plate' && (q.hostile || q.heldByEnemy)) plate = plate || q;
      if (plate && plate.alive) minPlate = Math.min(minPlate, plate.body.ps[0].x.distanceTo(head())); if (sj.state === 'lobRelease') sj.throwCd = 99; });
    check('he lobs a plate at you (a real arc)', !!plate, sj.state);
    check('it lands on you for damage, and shatters', TW.player.hp <= 100 - Math.round(TW.CFG.weapons.plate.playerDmg * 0.7) && plate && !plate.alive && g('plates') > plates0,
      `hp ${TW.player.hp}, closest ${minPlate.toFixed(2)} m, plate ${plate ? (plate.alive ? 'whole' : 'smashed') : 'none'}`);
    // a raised guard: the plate breaks on your forearm and does nothing
    const flat = (type, aim) => run(`(() => { const T = 0.45, A = ${aim}, S = new THREE.Vector3(A.x - 1.0, A.y - 0.2, A.z - 3.2);
      const p = new Prop('${type}', S); const v = new THREE.Vector3().subVectors(A, S).divideScalar(T); v.y -= 0.5 * CFG.physics.gravity * T;
      p.body.drag = 0.02; p.unpinAll(v); p.hostile = true; p.thrown = true; p.releasedAt = NOW; p.prevPos.copy(p.body.ps[0].x); return p; })()`);
    fresh(); setGrip(R, 0.08, 1.62, -0.22); setGrip(L, -0.08, 1.62, -0.22); step(3);
    const pb = flat('plate', 'player.head.clone()'); step(60);
    check('a raised guard stops a plate (it smashes on your forearm)', TW.player.hp === 100 && !pb.alive, 'hp ' + TW.player.hp);
    // his bottles: squeeze grip as one arrives and it's yours
    fresh(); setGrip(R, 0.2, 1.4, -0.35); step(3);
    const bt = flat('bottle', 'hands.right.fist.clone()'); pads[0].buttons[1].pressed = true;
    step(50);
    check('squeezed grip catches one of his bottles in flight', TW.hands.right.held === bt && bt.alive && TW.player.hp === 100, 'hp ' + TW.player.hp);
    pads[0].buttons[1].pressed = false; step(3);
    fresh();
    const sj2 = spawn('sodajerk', 0.4, 3.6, { state: 'keepaway' }); sj2.throwCd = 0; sj2.lobType = 'bottle';
    let bott = null, neckMax = 0, minB = 9; const hpB0 = TW.player.hp;
    step(Math.ceil(2.0 / DT), () => { if (!bott && sj2.carry && sj2.carry.type === 'bottle') bott = sj2.carry; if (sj2.state === 'lobRelease') sj2.throwCd = 99;
      if (bott && bott.heldByEnemy) neckMax = Math.max(neckMax, bott.body.by.neck.x.distanceTo(sj2.body.by.wrR.x));
      else if (bott && bott.alive) minB = Math.min(minB, bott.body.ps[0].x.distanceTo(head())); });
    check('he throws Columbia Cola bottles too (held by the neck until he lets go)', !!bott && neckMax < 0.2, bott ? 'neck ' + neckMax.toFixed(2) + ' m off his fist' : sj2.state);
    check('a thrown bottle lands on you, and smashes', hpB0 - TW.player.hp >= Math.round(TW.CFG.weapons.bottle.playerDmg * 0.7) && bott && !bott.alive,
      `hp ${hpB0} -> ${TW.player.hp}, closest ${minB.toFixed(2)} m, ${bott && bott.alive ? 'whole' : 'smashed'}`);
    sj2.placeAt(0, 1.0, Math.PI); sj2.setState('keepaway'); sj2.cooldown = 0; sj2.throwCd = 99;
    until(() => sj2.state === 'windup', 200);
    check('cornered, he swings the bottle at you instead', sj2.state === 'windup', sj2.state);

    // ================= the linebacker: the crouch, the charge, the tackle
    fresh();
    const lb = spawn('linebacker', 0, 4.2, { cooldown: 0 }); lb.chargeCd = 0; lb.hasToken = true;
    until(() => lb.state === 'chargeWind', 200);
    let wind = 0; until(() => { if (lb.state === 'chargeWind') wind = lb.timer; return lb.state !== 'chargeWind'; }, 200);
    check('he telegraphs: a deep crouch for ~0.8 s, then charges', lb.state === 'charge' && wind > 0.7, `${lb.state} after ${wind.toFixed(2)} s`);
    const r0 = TW.rig.position.clone(); let last = r0.clone(), maxStep = 0, hp0 = TW.player.hp;
    step(Math.ceil(1.6 / DT), () => { const p = TW.rig.position; maxStep = Math.max(maxStep, Math.hypot(p.x - last.x, p.z - last.z)); last = p.clone(); });
    const moved = Math.hypot(TW.rig.position.x - r0.x, TW.rig.position.z - r0.z);
    check('standing there, you get tackled: damage, and thrown back over a metre', hp0 - TW.player.hp === C.linebacker.charge.dmg && moved > 1.0 && g('tackles') >= 1,
      `hp ${hp0} -> ${TW.player.hp}, pushed ${moved.toFixed(2)} m`);
    check('the view shove is eased: never more than 60 mm a frame', maxStep > 0.02 && maxStep <= 0.06, `max ${(maxStep * 1000).toFixed(1)} mm a frame`);
    // sidestep: he runs on, into the bar
    fresh(0, -1.4);
    const lb2 = new TW.Enemy('linebacker'); lb2.placeAt(0, 2.8, Math.PI); lb2.setState('approach'); lb2.cooldown = 0; lb2.chargeCd = 0; lb2.hasToken = true; TW.enemies.push(lb2);
    until(() => lb2.state === 'charge', 300);
    const hpS = TW.player.hp, walls0 = g('wallHits');
    ease(R, V(1.6, 1.0, -1.6), 1); TW.rig.position.x = 1.5; step(1);   // the sidestep
    until(() => lb2.state !== 'charge', 200);
    check('sidestep and he charges on into the bar: staggered (stars), a long recovery', lb2.state === 'stagger' && lb2.staggerDur >= 2.5 && g('wallHits') > walls0 && TW.player.hp === hpS,
      `${lb2.state} at z ${lb2.pos.z.toFixed(2)}, hp ${TW.player.hp}`);
    const lbHp = lb2.hp, P0 = TW.CFG.punch.tiers[2].dmg;
    run(`playerHit(enemies[0], 'chest', 4, 0.6, hands.right, enemies[0].zone('chest').pos.clone(), null, new THREE.Vector3(0, 0, -1))`);
    check('and while he\'s dazed, punches do extra', lbHp - lb2.hp >= P0 * TW.CFG.punch.staggerBonus - 0.01, `${lbHp.toFixed(1)} -> ${lb2.hp.toFixed(1)}`);
    // a goon in his way gets bowled over
    fresh();
    const lb3 = spawn('linebacker', 0, 4.4); lb3.chargeCd = 0; lb3.hasToken = true;
    const cs = spawn('conscript', 0.1, 2.2, { state: 'circle', cooldown: 99, cfg: { speed: 0 } }); cs.faceToward = () => {};
    const bowl0 = g('bowled');
    until(() => lb3.state === 'charge', 300); until(() => lb3.state !== 'charge', 200);
    check('a goon in his path is bowled over', cs.state === 'ragdoll' && g('bowled') > bowl0, cs.state);
    // hits don't stop a charge
    fresh();
    const lb4 = spawn('linebacker', 0, 3.6); lb4.chargeCd = 0; lb4.hasToken = true;
    until(() => lb4.state === 'charge', 300); step(5);
    run(`playerHit(enemies[0], 'chest', 4, 0.6, hands.right, enemies[0].zone('chest').pos.clone(), null, new THREE.Vector3(0, 0, -1))`);
    check('a punch doesn\'t stop a charging linebacker', lb4.state === 'charge', lb4.state);

    // ================= the marshal: parry and riposte
    const jab = (e, speed, stopShort = 0, setup = 24) => {   // ease the right fist out in front of his belly, drive it in at speed (or stop short: a feint), then drop it
      let ch = e.zone('belly').pos.clone();
      const off = V(head().x - ch.x, 0, head().z - ch.z).normalize().multiplyScalar(0.6);
      ease(R, V(ch.x + off.x, ch.y, ch.z + off.z), setup); step(4); TW.hands.right.cd.clear();
      ch = e.zone('belly').pos.clone();
      const from = V(ch.x + off.x, ch.y, ch.z + off.z), dir = off.clone().normalize().negate(), n = Math.ceil((0.7 - stopShort) / (speed * DT));
      const seen = new Set();
      for (let i = 0; i <= n; i++) { const p = from.clone().addScaledVector(dir, Math.min(0.7 - stopShort, speed * DT * i)); setGrip(R, p.x, p.y, p.z); step(1); seen.add(e.state); }
      step(4, () => seen.add(e.state)); guardDown(); step(10, () => seen.add(e.state)); return seen;
    };
    const mcfg = (o) => ({ speed: 0, counter: Object.assign({}, C.marshal.counter, o) });
    const reset = (e) => { e.placeAt(0, -0.95, 0); e.releaseToken(); e.setState('circle'); e.cooldown = 99; };
    fresh();
    const mr = spawn('marshal', 0, -0.95, { state: 'circle', cooldown: 99, cfg: mcfg({ chance: 1 }) }); step(30);
    let hpM = mr.hp; const cnt0 = g('counters'), hpP = TW.player.hp;
    const s1 = jab(mr, 4.5); const tParry = clock;
    check('the marshal parries a punch he sees coming: no damage, COUNTER!', s1.has('parry') && mr.hp === hpM && g('counters') === cnt0 + 1, `states ${[...s1].join(',')}, hp ${hpM} -> ${mr.hp}`);
    check('and ripostes straight off a short windup', s1.has('windup') && (mr.windupTime === C.marshal.counter.riposteWindup || mr.state !== 'windup'), 'windup ' + mr.windupTime);
    step(Math.ceil(0.6 / DT));
    check('the riposte lands if you\'re open', TW.player.hp < hpP, `hp ${hpP} -> ${TW.player.hp}`);
    reset(mr); step(4); hpM = mr.hp;
    const s2 = jab(mr, 4.5, 0, 10);
    check(`never twice in ${C.marshal.counter.cooldown} s: a second punch right after gets through`, !s2.has('parry') && mr.hp < hpM && clock - tParry < C.marshal.counter.cooldown,
      `${(clock - tParry).toFixed(2)} s after, hp ${hpM} -> ${mr.hp}`);
    reset(mr); mr.hurtT = 0; step(Math.ceil(1.6 / DT));
    const s3 = jab(mr, 4.5);
    check('after the cooldown he can parry again', s3.has('parry'), [...s3].join(','));
    // from the side and from behind: he can't see it
    for (const [nm, yaw] of [['side', Math.PI / 2], ['back', Math.PI]]) {
      fresh();
      const m2 = spawn('marshal', 0, -0.95, { state: 'circle', cooldown: 99, cfg: mcfg({ chance: 1 }) }); m2.faceToward = () => {};
      m2.yaw = yaw; step(20); const h0 = m2.hp;
      const sx = jab(m2, 4.5);
      check(`a punch from his ${nm} gets through`, !sx.has('parry') && m2.hp < h0, `hp ${h0} -> ${m2.hp}`);
    }
    // a feint: he parries air and he's open
    fresh();
    const m3 = spawn('marshal', 0, -0.95, { state: 'circle', cooldown: 99, cfg: mcfg({ chance: 1 }) }); step(30);
    const f0 = g('feints'); const sf = jab(m3, 4.5, 0.5); step(16, () => sf.add(m3.state));
    check('a feint (a punch pulled short) draws the parry and leaves him open', sf.has('parry') && sf.has('open') && g('feints') > f0, [...sf].join(','));
    m3.setState('open'); const h3 = m3.hp; const sf2 = jab(m3, 4.5);
    check('so the real one lands', m3.hp < h3 && !sf2.has('parry'), `hp ${h3} -> ${m3.hp}`);
    // thrown props and grabs get through, even with his forearm up
    fresh();
    const m4 = spawn('marshal', 0, -1.6, { state: 'circle', cooldown: 99, cfg: mcfg({ chance: 1 }) }); step(30);
    m4.setState('parry'); m4.timer = -9; const h4 = m4.hp;
    run(`(() => { const e = enemies[0], A = e.zone('chest').pos.clone(), S = player.head.clone().add(new THREE.Vector3(0, -0.2, -0.3));
      const p = new Prop('bottle', S); p.unpinAll(new THREE.Vector3().subVectors(A, S).normalize().multiplyScalar(7)); p.thrown = true; p.releasedAt = NOW; })()`);
    step(40);
    check('a thrown bottle gets through his parry', m4.hp < h4, `hp ${h4} -> ${m4.hp}`);
    m4.setState('parry'); m4.timer = -9;
    check('and he can be grabbed out of it', m4.grabbable());
    // the odds: the same hand over and over reads easier; just after he's been hit, harder
    fresh();
    const m5 = spawn('marshal', 0, -0.95, { state: 'circle', cooldown: 99, cfg: mcfg({ chance: 0.5, cooldown: 0 }) }); step(30);
    const odds = []; for (let i = 0; i < 3; i++) { m5.setState('circle'); m5.watchCd = 0; m5.counterCd = 0; m5.hurtT = 0; jab(m5, 4.5); odds.push(m5.counterOdds); m5.placeAt(0, -0.95, 0); m5.setState('circle'); }
    m5.hurtT = C.marshal.counter.hurtDecay; m5.watchCd = 0; m5.counterCd = 0; m5.lastHand = null; jab(m5, 4.5); const hurtOdds = m5.counterOdds;
    check('spamming one hand raises his odds; being hit lowers them', odds[1] > odds[0] && odds[2] > odds[1] && hurtOdds < odds[0],
      `same hand ${odds.map(o => o.toFixed(2)).join(' -> ')}, just hit ${hurtOdds.toFixed(2)}`);

    // ================= the cadet: a quick windup, and they rally
    fresh();
    const cd = spawn('cadet', 0, -1.1); let tw = -1, ts = -1;
    until(() => { if (cd.state === 'windup' && tw < 0) tw = clock; if (cd.state === 'strike' && ts < 0) ts = clock; return ts > 0; }, 300);
    check('the cadet\'s windup is quick (under 0.45 s; the boxer\'s is ' + C.boxer.windup + ')', ts - tw < 0.45 && C.cadet.windup < C.boxer.windup && C.cadet.dmg < C.boxer.dmg + 1, `${(ts - tw).toFixed(2)} s`);
    fresh();
    const a = spawn('cadet', -0.6, -2.4, { state: 'circle', cooldown: 99 }), b = spawn('cadet', 0.6, -2.6, { state: 'approach', cooldown: 0 });
    const o1 = spawn('conscript', 2.4, -2.0, { state: 'circle', cooldown: 99 }); o1.hasToken = true; a.hasToken = true;   // the token cap (2) is full
    step(3);
    check('a cadet near another attacking cadet rallies in over the token cap', b.hasToken, `tokens ${run('tokensInUse()')}`);
    const c3 = spawn('cadet', -2.5, 1.5, { state: 'approach', cooldown: 0 }); step(3);
    check('but only one over the cap', !c3.hasToken, `tokens ${run('tokensInUse()')}`);
  } catch (err) { log.push('ERROR ' + err.stack); }
  console.log(log.join('\n'));
  const fails = log.filter(l => !l.startsWith('PASS')).length;
  console.log(`\n${log.length - fails} / ${log.length} Columbia checks pass`);
})();
