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
const documentStub = { pointerLockElement: null, getElementById: (id) => els[id], addEventListener() {} };
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
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
vm.runInContext(inline, ctx, { filename: 'index.html' });
const run = (c) => vm.runInContext(c, ctx);
const TW = ctx.__tw;
const log = [];
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
    check('vertex snap off in VR, affine off', run('SU.uSnap.value') === 0 && run('SU.uAffine.value') === 0);
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
    const bottle = TW.props.find(p => p.type === 'bottle' && Math.abs(p.obj.position.x + 1.6) < 0.01);
    const bp = bottle.obj.getWorldPosition(new THREE.Vector3());
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
    check('release mid-swing throws the bottle', !bottle.heldBy && (bottle.thrown || !bottle.alive), 'vel ' + bottle.vel.length().toFixed(2));
    // ---- punching: spawn a punk right in front and swing at its chest
    TW.rig.position.set(0, 0, 0); TW.rig.rotation.y = 0; step(2);
    run(`clearEnemies(); game.state = 'fight'; game.queue = [];`);
    const e = new TW.Enemy('boso'); e.pos.set(0, 0, -0.95); e.yaw = 0; e.state = 'approach'; e.cooldown = 99; e.cfg = Object.assign({}, e.cfg, { speed: 0 }); TW.enemies.push(e);
    step(2);
    const ease = (g, to, frames) => { const from = g.position.clone(); for (let i = 1; i <= frames; i++) { g.position.lerpVectors(from, to, i / frames); step(1); } };
    const swing = (speed) => {   // straight jab at the chest from 0.45 m away, at `speed` m/s
      e.pos.set(0, 0, -0.95); e.yaw = 0; step(3);
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
    e.pos.set(0, 0, -0.95); step(3);
    const chest = e.zone('chest').pos.clone();
    ease(R, new THREE.Vector3(chest.x, chest.y, chest.z + 0.14), 40); step(20);
    for (let i = 0; i < 3; i++) { setGrip(R, chest.x, chest.y, chest.z + 0.14 - 0.027 * (i + 1)); step(1); }
    setGrip(R, 0.2, 1.4, -0.35); step(30);
    check('wrist flick does no damage', e.hp === 99 && !run('lastHit'));
    // ---- block: forearms in front of face vs a boxer punch
    run(`clearEnemies(); player.hp = 100;`);
    const b = new TW.Enemy('boxer'); b.pos.set(0, 0, -0.85); b.yaw = 0; b.state = 'approach'; b.cooldown = 0; TW.enemies.push(b);
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
    const g = new TW.Enemy('boso'); g.pos.set(0, 0, -0.9); g.yaw = 0; g.state = 'approach'; g.cooldown = 99; g.cfg = Object.assign({}, g.cfg, { speed: 0 }); TW.enemies.push(g); step(2);
    const neck = g.zone('chest').pos.clone();
    ease(R, new THREE.Vector3(neck.x, neck.y + 0.1, neck.z + 0.22), 60);
    pads[0].buttons[1].pressed = true; step(2);
    check('grip grabs a goon', TW.hands.right.held === g && g.state === 'held');
    for (let i = 0; i < 8; i++) { setGrip(R, neck.x + 0.06 * i, neck.y + 0.1, neck.z + 0.22 - 0.05 * i); step(1); }
    pads[0].buttons[1].pressed = false; step(1);
    check('release mid-swing throws the goon', g.state === 'tumble' && g.body.thrown, g.state);
    step(Math.ceil(4 / DT));
    check('thrown goon gets back up', ['approach', 'circle', 'windup', 'strike', 'recover', 'getup'].includes(g.state), g.state);
    // ---- parry: hit the swinging arm during the windup's last moments
    run(`clearEnemies(); player.hp = 100;`);
    setGrip(L, -0.25, 1.0, -0.2);
    const pb = new TW.Enemy('boso'); pb.pos.set(0, 0, -0.9); pb.yaw = 0; pb.state = 'approach'; pb.cooldown = 0; TW.enemies.push(pb);
    setGrip(R, 0.2, 1.3, -0.25);
    let guard = 0; while (!(pb.state === 'windup' && pb.timer > pb.windupTime - 0.13) && guard++ < 600) step(1);
    const arm = pb.zone('armR').pos.clone();
    for (let i = 0; i < 5; i++) { R.position.lerpVectors(new THREE.Vector3(0.2, 1.3, -0.25), arm, (i + 1) / 5); step(1); }
    check('hitting the swinging arm parries (hard stagger)', pb.state === 'stagger' && TW.player.hp === 100, pb.state + ' hp ' + TW.player.hp);
    setGrip(R, 0.2, 1.3, -0.25); step(20);
    // ---- wrestler clinch: get grabbed, punch his arms twice to break free
    run(`clearEnemies(); player.hp = 100;`);
    const w = new TW.Enemy('wrestler'); w.pos.set(0, 0, -1.0); w.yaw = 0; w.state = 'approach'; w.cooldown = 0; TW.enemies.push(w);
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
    // ---- snap turn + stick move
    const yaw0 = TW.rig.rotation.y; pads[0].axes[2] = 1; step(2); pads[0].axes[2] = 0; step(2);
    check('right stick snap-turns 30°', Math.abs(Math.abs(TW.rig.rotation.y - yaw0) - Math.PI / 6) < 1e-6);
    const p0 = TW.rig.position.clone(); pads[1].axes[3] = -1; step(36); pads[1].axes[3] = 0;
    check('left stick moves forward', TW.rig.position.distanceTo(p0) > 0.8, TW.rig.position.distanceTo(p0).toFixed(2) + ' m in 0.5 s');
    // ---- session end returns to the menu
    for (const f of session._l.end || []) f();
    check('session end returns to menu', els.menu.hidden === false && run('xrMode') === false);
  } catch (err) { log.push('ERROR ' + err.stack); }
  console.log(log.join('\n'));
})();
