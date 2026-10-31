// Headless VR-path test: fake XR session + controllers driving the real game code.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const THREE = require('./three_stub.js');
const dir = path.join(__dirname, '..');
let clock = 0, seed = 7;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {},
  addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, async fire(t, e) { for (const f of this._l[t] || []) await f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info']) els[id] = mkEl(id);
const ctx2d = () => new Proxy({ calls: 0 }, { get: (t, k) => (k in t ? t[k] : () => { t.calls++; }), set: (t, k, val) => { t[k] = val; return true; } });
const documentStub = { pointerLockElement: null, getElementById: (id) => els[id], addEventListener() {},
  createElement: () => ({ width: 0, height: 0, getContext: ctx2d }) };
class ImageStub { set src(v) { this.width = 40; this.height = 16; if (this.onload) this.onload(); } }
const pulses = [];
const mkPad = () => ({ axes: [0, 0, 0, 0], buttons: Array.from({ length: 6 }, () => ({ pressed: false, value: 0 })),
  hapticActuators: [{ pulse: (i, ms) => { pulses.push([i, ms]); } }] });
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
let camW = null;
const check = (name, ok, extra = '') => { log.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  (' + extra + ')' : '')); };

(async () => {
  try {
    await new Promise(r => setTimeout(r, 0));
    check('VR button enabled when a headset is reported', els.vrBtn.disabled === false);
    await els.vrBtn.fire('click');
    TW.renderer.xr.isPresenting = true;
    // controllers connect (right first, to check handedness routing)
    const grips = TW.renderer.grips, pads = [mkPad(), mkPad()];
    grips[0].dispatchEvent({ type: 'connected', data: { handedness: 'right', gamepad: pads[0] } });
    grips[1].dispatchEvent({ type: 'connected', data: { handedness: 'left', gamepad: pads[1] } });
    check('hands routed by handedness', TW.hands.right.grip === grips[0] && TW.hands.left.grip === grips[1]);
    check('hand models attached to grips', TW.hands.right.anchor.parent === grips[0] && TW.hands.left.anchor.parent === grips[1]);
    check('xrMode on, menu hidden', run('xrMode') === true && els.menu.hidden === true);
    check('VR: fine vertex snap on, affine off, 6-bit colour', run('SU.uSnap.value') === 1 && run('SU.uAffine.value') === 0 && run('SU.uLevels.value') === 63);
    const cam = TW.camera;
    cam.position.set(0, 1.65, 0);   // stands in for the XR head pose (local to the rig)
    const R = grips[0], L = grips[1];
    const setGrip = (g, x, y, z) => g.position.set(x, y, z);   // rig-local, like the XR reference space
    setGrip(R, 0.2, 1.4, -0.35); setGrip(L, -0.2, 1.4, -0.35);
    const DT = 1 / 72;
    const step = (n = 1, f) => { for (let i = 0; i < n; i++) { clock += DT; if (f) f(i); TW.renderer.loop(); } };
    step(10);
    // ---- drink: grab the nearest bar bottle by walking the rig there
    TW.rig.position.set(-1.6, 0, -2.95); TW.rig.rotation.y = 0;   // facing -z, toward the bar
    step(2);
    const bottle = TW.props.find(p => p.type === 'bottle' && Math.abs(p.body.by.base.x.x + 1.6) < 0.01);
    const bp = bottle.body.by.neck.x.clone().add(new THREE.Vector3(0, -0.12, 0));
    // place right grip at the bottle (world == rig-local here since rig yaw 0)
    setGrip(R, bp.x + 1.6, bp.y, bp.z + 2.95); step(2);
    pads[0].buttons[1].pressed = true; step(2);
    check('grip picks up a bottle', TW.hands.right.held === bottle);
    TW.player.hp = 50;
    setGrip(R, 0.02, 1.57, -0.06); step(Math.ceil(1.0 / DT));
    check('bottle at mouth heals', TW.player.hp > 50, 'hp ' + TW.player.hp);
    // throw it: swing forward fast and release mid-swing
    for (let i = 0; i < 6; i++) { setGrip(R, 0.1, 1.5, -0.1 - i * 0.07); step(1); }
    pads[0].buttons[1].pressed = false; step(1);
    check('release mid-swing throws the bottle', !bottle.heldBy && (bottle.thrown || !bottle.alive), 'vel ' + bottle.body.by.base.v.length().toFixed(2));
    // ---- punching: spawn a punk right in front and swing at its chest
    TW.rig.position.set(0, 0, 0); TW.rig.rotation.y = 0; step(2);
    run(`clearEnemies(); game.state = 'fight'; game.queue = [];`);
    const e = new TW.Enemy('boso'); e.placeAt(0, -0.95, 0); e.state = 'approach'; e.cooldown = 99; e.cfg = Object.assign({}, e.cfg, { speed: 0 }); TW.enemies.push(e);
    step(2);
    const ease = (g, to, frames) => { const from = g.position.clone(); for (let i = 1; i <= frames; i++) { g.position.lerpVectors(from, to, i / frames); step(1); } };
    const swing = (speed) => {   // straight jab at the chest from 0.45 m away, at `speed` m/s
      e.placeAt(0, -0.95, 0); step(3);
      const chest = e.zone('chest').pos.clone();
      ease(R, new THREE.Vector3(chest.x, chest.y, chest.z + 0.65), 40);
      const startZ = chest.z + 0.65, n = Math.ceil(0.7 / (speed * DT));
      setGrip(R, chest.x, chest.y, startZ); step(4);
      for (let i = 0; i <= n; i++) { setGrip(R, chest.x, chest.y, startZ - speed * DT * i); step(1);
      }
      setGrip(R, 0.2, 1.4, -0.35); step(30);
    };
    const hp0 = e.hp; pulses.length = 0;
    swing(1.0);  check('slow push = shove, no damage', e.hp === hp0, 'last ' + JSON.stringify(run('lastHit')));
    swing(2.2);  const l1 = run('lastHit'); check('2.2 m/s = LIGHT', l1 && l1.tier === 'light', l1 && l1.speed.toFixed(2));
    e.state = 'approach'; e.poise = 999; e.hp = 99;
    swing(4.0);  const l2 = run('lastHit'); check('4 m/s = SOLID', l2 && l2.tier === 'solid', l2 && l2.speed.toFixed(2));
    check('hits buzz the controller', pulses.length >= 2, pulses.length + ' pulses');
    e.state = 'approach'; e.poise = 999;
    swing(6.0);  const l3 = run('lastHit'); check('6 m/s = HEAVY', l3 && l3.tier === 'heavy', l3 && l3.speed.toFixed(2));
    // wrist flick: fast but only 8 cm of travel
    e.state = 'approach'; e.poise = 999; e.hp = 99; run('lastHit = null');
    e.placeAt(0, -0.95, 0); step(3);
    const chest = e.zone('chest').pos.clone();
    ease(R, new THREE.Vector3(chest.x, chest.y, chest.z + 0.14), 40); step(20);
    for (let i = 0; i < 3; i++) { setGrip(R, chest.x, chest.y, chest.z + 0.14 - 0.027 * (i + 1)); step(1); }
    setGrip(R, 0.2, 1.4, -0.35); step(30);
    check('wrist flick does no damage', e.hp === 99 && !run('lastHit'));
    // ---- block: forearms in front of face vs a boxer punch
    run(`clearEnemies(); player.hp = 100;`);
    const b = new TW.Enemy('boxer'); b.placeAt(0, -0.85, 0); b.state = 'approach'; b.cooldown = 0; TW.enemies.push(b);
    setGrip(R, 0.08, 1.62, -0.22); setGrip(L, -0.08, 1.62, -0.22);   // fists up at the face
    R.rotation.set(0, 0, 0); L.rotation.set(0, 0, 0);
    let hpBefore = TW.player.hp, sawStrike = false;
    step(Math.ceil(4 / DT), () => { if (b.state === 'strike') sawStrike = true; });
    check('boxer attacks within 4 s', sawStrike);
    check('raised guard blocks the punches', TW.player.hp === hpBefore, 'hp ' + TW.player.hp);
    // drop the guard: should get hit
    setGrip(R, 0.25, 1.0, -0.2); setGrip(L, -0.25, 1.0, -0.2);
    step(Math.ceil(5 / DT));
    check('guard down = you get hit', TW.player.hp < hpBefore, 'hp ' + TW.player.hp);
    // ---- grab a goon by the collar and throw him
    run(`clearEnemies(); player.hp = 100;`);
    const g = new TW.Enemy('boso'); g.placeAt(0, -0.9, 0); g.state = 'approach'; g.cooldown = 99; g.cfg = Object.assign({}, g.cfg, { speed: 0 }); TW.enemies.push(g); step(2);
    const neck = g.zone('chest').pos.clone();
    ease(R, new THREE.Vector3(neck.x, neck.y + 0.1, neck.z + 0.22), 60);
    pads[0].buttons[1].pressed = true; step(2);
    check('grip grabs a goon', TW.hands.right.held === g && g.state === 'held');
    for (let i = 0; i < 8; i++) { setGrip(R, neck.x + 0.06 * i, neck.y + 0.1, neck.z + 0.22 - 0.05 * i); step(1); }
    pads[0].buttons[1].pressed = false; step(1);
    check('release mid-swing throws the goon (limp, flying)', g.state === 'ragdoll' && g.flying, g.state);
    step(Math.ceil(4 / DT));
    check('thrown goon gets back up', ['approach', 'circle', 'windup', 'strike', 'recover', 'getup'].includes(g.state), g.state);
    // ---- parry: hit the swinging arm during the windup's last moments
    run(`clearEnemies(); player.hp = 100;`);
    setGrip(L, -0.25, 1.0, -0.2);
    const pb = new TW.Enemy('boso'); pb.placeAt(0, -0.9, 0); pb.state = 'approach'; pb.cooldown = 0; TW.enemies.push(pb);
    setGrip(R, 0.2, 1.3, -0.25);
    let guard = 0; while (!(pb.state === 'windup' && pb.timer > pb.windupTime - 0.13) && guard++ < 600) step(1);
    const arm = pb.zone('armR').pos.clone();
    for (let i = 0; i < 5; i++) { R.position.lerpVectors(new THREE.Vector3(0.2, 1.3, -0.25), arm, (i + 1) / 5); step(1); }
    check('hitting the swinging arm parries (hard stagger)', pb.state === 'stagger' && TW.player.hp === 100, pb.state + ' hp ' + TW.player.hp);
    setGrip(R, 0.2, 1.3, -0.25); step(20);
    // ---- wrestler clinch: get grabbed, punch his arms twice to break free
    run(`clearEnemies(); player.hp = 100;`);
    const w = new TW.Enemy('wrestler'); w.placeAt(0, -1.0, 0); w.state = 'approach'; w.cooldown = 0; TW.enemies.push(w);
    guard = 0; while (w.state !== 'clinch' && guard++ < 600) step(1);
    check('wrestler clinches you', w.state === 'clinch' && TW.player.clinchedBy === w, w.state);
    for (let k = 0; k < 2; k++) {
      step(25);
      const a = w.zone(k ? 'armL' : 'armR').pos.clone(), from = a.clone().add(new THREE.Vector3(0, 0.05, 0.45));
      setGrip(R, from.x, from.y, from.z); step(3);
      for (let i = 0; i < 7; i++) { R.position.lerpVectors(from, a, (i + 1) / 7); step(1); }
      setGrip(R, 0.2, 1.2, -0.3);
    }
    step(3);
    check('two arm hits break the clinch', !TW.player.clinchedBy && w.state === 'stagger', w.state + ' armHits ' + w.armHits + ' hp ' + TW.player.hp.toFixed(1));
    // ---- perf panel: left X opens it on the wrist; the left stick tunes instead of walking
    pads[1].buttons[4].pressed = true; step(2); pads[1].buttons[4].pressed = false; step(2);
    check('left X opens the wrist perf panel', TW.perfPanel.open && TW.perfPanel.mesh && TW.perfPanel.mesh.visible && TW.perfPanel.mesh.parent === TW.hands.left.anchor);
    const pull0 = TW.CFG.physics.activePull, rigP = TW.rig.position.clone();
    pads[1].axes[3] = 1; step(2); pads[1].axes[3] = 0; step(2);          // down: next row (pull)
    pads[1].axes[2] = 1; step(2); pads[1].axes[2] = 0; step(2);          // right: +0.05
    check('stick picks a row and nudges its value', TW.perfPanel.row === 1 && Math.abs(TW.CFG.physics.activePull - (pull0 + 0.05)) < 1e-9, 'pull ' + TW.CFG.physics.activePull);
    check('stick does not walk while the panel is open', TW.rig.position.distanceTo(rigP) < 1e-6);
    step(Math.ceil(0.3 / DT));
    check('panel shows live numbers (canvas redrawn)', TW.perfPanel.texture && TW.perfPanel.texture.needsUpdate === true && TW.perf.fps > 30, TW.perf.fps.toFixed(0) + ' fps');
    TW.CFG.physics.activePull = pull0;
    pads[1].buttons[4].pressed = true; step(2); pads[1].buttons[4].pressed = false; step(2);
    check('left X closes it again', !TW.perfPanel.open && !TW.perfPanel.mesh.visible);
    // ---- catch a potato out of the air and throw it back
    run(`clearEnemies(); player.hp = 100; game.state = 'fight'; game.queue = [];`);
    TW.rig.position.set(0, 0, 0); TW.rig.rotation.y = 0;
    setGrip(R, 0.2, 1.4, -0.35); setGrip(L, -0.25, 1.0, -0.2); step(3);
    const tgt = new TW.Enemy('boso'); tgt.placeAt(0.3, -2.4, 0); tgt.state = 'circle'; tgt.cooldown = 99; tgt.cfg = Object.assign({}, tgt.cfg, { speed: 0 }); TW.enemies.push(tgt); step(3);
    const fist = TW.hands.right.fist.clone();
    ctx.__fist = fist;
    const pot = run(`(() => { const T = 0.45, S = new THREE.Vector3(__fist.x - 0.4, 1.3, __fist.z - 2.6);
      const p = new Prop('potato', S); const v = new THREE.Vector3().subVectors(__fist, S).divideScalar(T); v.y -= 0.5 * CFG.physics.gravity * T;
      p.body.drag = 0.02; p.unpinAll(v); p.hostile = true; p.thrown = true; p.releasedAt = NOW; p.prevPos.copy(S); return p; })()`);
    pads[0].buttons[1].pressed = true;
    let caughtAt = -1; step(50, (i) => { if (caughtAt < 0 && TW.hands.right.held === pot) caughtAt = i; });
    check('squeezed grip catches a potato in flight', TW.hands.right.held === pot && TW.game.catches >= 1 && TW.player.hp === 100, 'frame ' + caughtAt + ' hp ' + TW.player.hp);
    const thp = tgt.hp;
    for (let i = 0; i < 7; i++) { setGrip(R, 0.2 + 0.01 * i, 1.4 + 0.02 * i, -0.2 - 0.09 * i); step(1); }
    pads[0].buttons[1].pressed = false; step(Math.ceil(1.0 / DT));
    check('thrown back, it hits the goon', tgt.hp < thp, 'hp ' + thp + ' -> ' + tgt.hp);
    // a potato you don't block or catch hits you
    pads[0].buttons[1].pressed = false; setGrip(R, 0.25, 1.0, -0.2); step(3);
    run(`game.state = 'fight'; game.queue = [];`);
    run(`(() => { const T = 0.5, Hd = player.head.clone(), S = new THREE.Vector3(Hd.x + 0.3, 1.4, Hd.z - 3);
      const p = new Prop('pot', S); const v = new THREE.Vector3().subVectors(Hd, S).divideScalar(T); v.y -= 0.5 * CFG.physics.gravity * T;
      p.body.drag = 0.02; p.unpinAll(v); p.hostile = true; p.thrown = true; p.releasedAt = NOW; p.prevPos.copy(S); })()`);
    const hpPot = TW.player.hp; step(60);
    check('a pot to the face hurts', TW.player.hp < hpPot, 'hp ' + hpPot + ' -> ' + TW.player.hp);
    // ---- Bat Boy: swat the bat mid-swing to disarm him, then use it
    run(`clearEnemies(); player.hp = 100;`); setGrip(R, 0.2, 1.3, -0.25); step(3);
    const bb = new TW.Enemy('batboy'); bb.placeAt(0, -1.25, 0); bb.state = 'approach'; bb.cooldown = 0; TW.enemies.push(bb);
    check('Bat Boy spawns holding a bat', bb.weapon && bb.weapon.type === 'bat' && bb.weapon.heldByEnemy === bb);
    guard = 0; while (!(bb.state === 'windup' && bb.timer > bb.windupTime * 0.6) && guard++ < 900) step(1);
    const kb = bb.weapon.body.by, mid = kb.knob.x.clone().lerp(kb.tip.x, 0.6);
    const from = mid.clone().add(new THREE.Vector3(0.05, -0.1, 0.4));
    setGrip(R, from.x, from.y, from.z); step(2);
    for (let i = 0; i < 6; i++) { R.position.lerpVectors(from, mid, (i + 1) / 6); step(1); }
    check('swatting the bat mid-swing disarms him', !bb.weapon && TW.game.disarms >= 1 && bb.state === 'stagger', bb.state + ' disarms ' + TW.game.disarms);
    setGrip(R, 0.2, 1.3, -0.25); step(Math.ceil(1.5 / DT));
    const bat = TW.props.find(p => p.type === 'bat');
    const gp = bat.grabPoint(new THREE.Vector3());
    check('the bat lands on the floor', gp.y < 0.3, 'y ' + gp.y.toFixed(2));
    setGrip(R, gp.x, gp.y + 0.03, gp.z); step(2); pads[0].buttons[1].pressed = true; step(2);
    check('you can pick the bat up', TW.hands.right.held === bat);
    run(`clearEnemies();`);
    const dummy = new TW.Enemy('boso'); dummy.placeAt(0, -1.3, 0); dummy.state = 'circle'; dummy.cooldown = 99; dummy.cfg = Object.assign({}, dummy.cfg, { speed: 0 }); dummy.poise = 999; TW.enemies.push(dummy);
    setGrip(R, 0.15, 1.35, 0.25); step(30); run('lastHit = null');
    for (let i = 0; i < 20; i++) { setGrip(R, 0.15 - 0.008 * i, 1.35, 0.25 - 0.06 * i); step(1); }   // ~4.3 m/s swing, a full arm's travel
    const lb = run('lastHit');
    const fistDmg = lb ? TW.CFG.punch.tiers.find(t => t.name === lb.tier).dmg * (lb.zone === 'head' ? 1.5 : lb.zone.startsWith('arm') ? 0.5 : 1) : 0;
    check('a bat swing hits harder than the same swing with a fist', lb && lb.dmg >= fistDmg + 9, lb ? `${lb.tier} on ${lb.zone}: ${lb.dmg} dmg vs fist ${fistDmg}` : 'no hit');
    pads[0].buttons[1].pressed = false; step(2);
    // ---- the Krasnovian laborer: same disarm as Bat Boy, but a steel pipe that never breaks; the conscript is plain fodder
    run(`clearEnemies(); player.hp = 100; for (const p of props.slice()) if (p.type === 'bat') p.break();`); setGrip(R, 0.2, 1.3, -0.25); step(3);
    const lab = new TW.Enemy('laborer'); lab.placeAt(0, -1.25, 0); lab.state = 'approach'; lab.cooldown = 0; TW.enemies.push(lab);
    check('the laborer spawns holding a pipe', lab.weapon && lab.weapon.type === 'pipe' && lab.weapon.batLike && lab.weapon.heldByEnemy === lab);
    guard = 0; while (!(lab.state === 'windup' && lab.timer > lab.windupTime * 0.6) && guard++ < 900) step(1);
    { const kp = lab.weapon.body.by, mp = kp.knob.x.clone().lerp(kp.tip.x, 0.6), fp = mp.clone().add(new THREE.Vector3(0.05, -0.1, 0.4));
      setGrip(R, fp.x, fp.y, fp.z); step(2);
      for (let i = 0; i < 6; i++) { R.position.lerpVectors(fp, mp, (i + 1) / 6); step(1); } }
    check('swatting the pipe mid-swing disarms him', !lab.weapon && lab.state === 'stagger', lab.state);
    setGrip(R, 0.2, 1.3, -0.25); step(Math.ceil(1.5 / DT));
    const pipe = TW.props.find(p => p.type === 'pipe');
    const pgp = pipe.grabPoint(new THREE.Vector3());
    setGrip(R, pgp.x, pgp.y + 0.03, pgp.z); step(2); pads[0].buttons[1].pressed = true; step(2);
    check('you can pick the pipe up', TW.hands.right.held === pipe);
    pads[0].buttons[1].pressed = false; step(2);
    run(`clearEnemies();`);
    const cs = new TW.Enemy('conscript'); cs.placeAt(0, -1.3, 0); TW.enemies.push(cs); step(5);
    check('the conscript spawns unarmed, with fodder health', !cs.weapon && cs.hp === TW.CFG.enemies.conscript.hp && cs.tris > 0);
    run(`clearEnemies(); for (const p of props.slice()) if (p.type === 'pipe') p.break();`);
    // ---- Aoki Security: the riot shield eats punches from the front and he answers with the baton
    run(`clearEnemies(); player.hp = 100; game.state = 'fight'; game.queue = [];`);
    TW.rig.position.set(0, 0, 0); TW.rig.rotation.y = 0; setGrip(L, -0.25, 1.0, -0.2); setGrip(R, 0.25, 1.0, -0.2); step(3);
    const sg = new TW.Enemy('secguard'); sg.placeAt(0, -1.0, 0); sg.state = 'circle'; sg.cooldown = 99; sg.cfg = Object.assign({}, sg.cfg, { speed: 0 }); TW.enemies.push(sg); step(Math.ceil(1.5 / DT));
    sg.setState('circle'); sg.hp = sg.maxHp; sg.poise = sg.cfg.poise; step(10);   // the bat from the last test may still be bouncing about
    check('Aoki Security carries a riot shield', sg.shieldHp === TW.CFG.enemies.secguard.shield && sg.tags && sg.tags.shield && sg.tags.shield[1] > sg.tags.shield[0]);
    const sgHp = sg.hp, c0 = sg.zone('chest').pos.clone(), cf = c0.clone().add(new THREE.Vector3(0, 0, 0.45));
    ease(R, cf, 40); step(10);
    for (let i = 0; i < 6; i++) { R.position.lerpVectors(cf, c0, (i + 1) / 6); step(1); }
    setGrip(R, 0.25, 1.0, -0.2);
    check('the shield eats a punch from the front', sg.hp === sgHp && sg.shieldHp < TW.CFG.enemies.secguard.shield, 'hp ' + sg.hp + ' shield ' + sg.shieldHp);
    check('punching the shield earns a quick baton counter', sg.state === 'windup' && sg.windupTime === TW.CFG.enemies.secguard.counterWindup, sg.state);
    run(`game.state = 'fight'; game.queue = [];`); step(Math.ceil(0.8 / DT));
    check('the counter lands if you just stand there', TW.player.hp < 100, 'hp ' + TW.player.hp);
    // from the side the shield is no use
    sg.setState('circle'); sg.cooldown = 99; sg.yaw = Math.PI / 2; const flankHp = sg.hp;
    run(`playerHit(enemies[0], 'chest', 4.0, 0.4, null, enemies[0].zone('chest').pos.clone(), null, new THREE.Vector3(0, 0, -1))`);
    check('a hit from his flank gets past the shield', sg.hp < flankHp, 'hp ' + flankHp + ' -> ' + sg.hp);
    // heavy shots break it: it vanishes from the mesh and he staggers
    sg.setState('circle'); sg.yaw = 0; sg.hp = 75; sg.poise = 999;
    for (let k = 0; k < 4 && sg.shieldHp > 0; k++) { sg.setState('circle'); sg.counterCd = 9; run(`playerHit(enemies[0], 'chest', 6.0, 0.5, null, enemies[0].zone('chest').pos.clone(), null, new THREE.Vector3(0, 0, -1))`); }
    const [s0, s1] = sg.tags.shield; let gone = true; for (let i = s0 * 3; i < s1 * 3; i++) if (sg.baseP[i] !== 0) gone = false;
    check('heavy hits shatter the shield', sg.shieldHp <= 0 && gone && sg.state === 'stagger' && run('game.shatters') >= 1, 'shield ' + sg.shieldHp + ' ' + sg.state);
    sg.setState('circle'); const openHp = sg.hp;
    run(`playerHit(enemies[0], 'chest', 4.0, 0.4, null, enemies[0].zone('chest').pos.clone(), null, new THREE.Vector3(0, 0, -1))`);
    check('without it, front punches land', sg.hp < openHp, 'hp ' + openHp + ' -> ' + sg.hp);
    // ---- neon kicker: high kicks are blocked by a raised guard, low kicks by a dropped forearm (or a step back)
    run(`clearEnemies(); player.hp = 100;`);
    const kk = new TW.Enemy('kicker'); kk.placeAt(0, -1.4, 0); kk.state = 'approach'; kk.cooldown = 0; kk.cfg = Object.assign({}, kk.cfg, { combo: 1 }); TW.enemies.push(kk);
    const kick = (low, guardY) => {
      setGrip(R, 0.08, guardY, -0.22); setGrip(L, -0.08, guardY, -0.22);
      kk.setState('approach'); kk.cooldown = 0; kk.hasToken = false; run(`game.state = 'fight'; game.queue = [];`);
      let n = 0; while (kk.state !== 'windup' && n++ < 900) step(1);
      kk.kickLow = low; kk.side = low ? 'l' : 'r';
      const h0 = TW.player.hp; n = 0; while (['windup', 'strike'].includes(kk.state) && n++ < 300) step(1);
      return { dmg: h0 - TW.player.hp, state: kk.state };
    };
    let r1 = kick(false, 1.62); check('raised guard blocks a high kick', r1.dmg === 0, JSON.stringify(r1));
    let r2 = kick(true, 1.62);  check('a high guard does not stop a low kick', r2.dmg > 0, JSON.stringify(r2));
    let r3 = kick(true, 0.95);  check('a forearm dropped to the belly checks a low kick', r3.dmg === 0, JSON.stringify(r3));
    let sawRetreat = false; step(Math.ceil(1.2 / DT), () => { if (kk.state === 'retreat') sawRetreat = true; });
    check('after kicking he darts back out of reach', sawRetreat, kk.state);
    setGrip(R, 0.2, 1.3, -0.25); setGrip(L, -0.25, 1.0, -0.2);
    // ---- snap turn + stick move
    const yaw0 = TW.rig.rotation.y; pads[0].axes[2] = 1; step(2); pads[0].axes[2] = 0; step(2);
    check('right stick snap-turns 30°', Math.abs(Math.abs(TW.rig.rotation.y - yaw0) - Math.PI / 6) < 1e-6);
    const p0 = TW.rig.position.clone(); pads[1].axes[3] = -1; step(36); pads[1].axes[3] = 0;
    check('left stick moves forward', TW.rig.position.distanceTo(p0) > 0.8, TW.rig.position.distanceTo(p0).toFixed(2) + ' m in 0.5 s');
    // ---- level 2 in VR: start outside, walk the square on the stick, held in by the stretch you're fighting
    run('startStreet(false)'); step(2);
    camW = () => TW.camera.getWorldPosition(new THREE.Vector3());
    check('VR: starting outside puts you on the square, facing the road', TW.level.name === 'street' && camW().z > 6 && Math.abs(TW.rig.rotation.y - Math.PI) < 1e-6, 'z ' + camW().z.toFixed(2));
    run('level.encounter = -1; game.state = "walk"'); TW.rig.position.z = TW.CFG.street.encounters[0].trigger + 0.5; step(3);
    pads[1].axes[3] = -1; step(72 * 8); pads[1].axes[3] = 0;
    check('VR: the stretch you\'re fighting holds you in', TW.level.encounter === 0 && camW().z <= TW.CFG.street.encounters[0].arena[1] + 1e-6, 'z ' + camW().z.toFixed(2));
    run('clearEnemies()');
    // ---- session end returns to the menu
    for (const f of session._l.end || []) f();
    check('session end returns to menu', els.menu.hidden === false && run('xrMode') === false);
  } catch (err) { log.push('ERROR ' + err.stack); }
  console.log(log.join('\n'));
})();
