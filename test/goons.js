// The newer goons (the Palace of Sport, Parade Square, the Tower of Labor, the bar's officials): every one builds as one mesh in
// budget, and each new mechanic works: the flagpole (disarm + use), cymbals and drumsticks (thrown, blocked, caught), the sambo's
// sweep, the gymnast's cartwheel, the lifter's shove, the specialist's dodge, the Chairman kneeling and signing, the officials' bar.
// Runs the real game in VR mode (fake XR session + controllers, like test/vr.js).
'use strict';
const vm = require('vm');
const THREE = require('./three_stub.js');
let clock = 0, seed = 5;
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
    const R = grips[0], L = grips[1];
    const setGrip = (g, x, y, z) => g.position.set(x, y, z);
    const DT = 1 / 72;
    const step = (n = 1, f) => { for (let i = 0; i < n; i++) { clock += DT; if (f) f(i); TW.renderer.loop(); } };
    const until = (f, n) => { let k = 0; while (!f() && k++ < n) step(1); return f(); };
    const guardUp = () => { setGrip(R, 0.08, 1.62, -0.22); setGrip(L, -0.08, 1.62, -0.22); };
    const guardDown = () => { setGrip(R, 0.25, 1.0, -0.2); setGrip(L, -0.25, 1.0, -0.2); };
    const fresh = () => { run(`clearEnemies(); player.hp = 100; game.state = 'fight'; game.queue = []; for (const p of props.slice()) if (p.cfg.playerDmg || p.batLike) p.break();`);
      TW.rig.position.set(0, 0, 0); TW.rig.rotation.y = 0; R.rotation.set(0, 0, 0); pads[0].buttons[1].pressed = false; guardDown(); step(3); };
    const spawn = (t, x, z, o = {}) => { const e = new TW.Enemy(t); e.placeAt(x, z, Math.atan2(-x, -z)); e.setState(o.state || 'approach'); e.cooldown = o.cooldown ?? 0;
      if (o.cfg) e.cfg = Object.assign({}, e.cfg, o.cfg); TW.enemies.push(e); return e; };
    const ease = (g, to, frames) => { const from = g.position.clone(); for (let i = 1; i <= frames; i++) { g.position.lerpVectors(from, to, i / frames); step(1); } };
    const NEW = ['sambo', 'gymnast', 'lifter', 'guard', 'bandsman', 'specialist', 'militia', 'inspector', 'clerk', 'bodyguard', 'orlova', 'chairman', 'harmony', 'enforcer', 'aokiagent'];
    const built = NEW.filter(t => TW.CFG.enemies[t]);
    step(10);
    run('var __ug = updateGame; updateGame = function () {};');   // no round flow here: each check sets up its own goons

    // ---- every new goon: one skinned mesh on its own hand-pixeled sheet, in the triangle budget, no longer standing in
    {
      run('clearEnemies()');
      const bad = [], tris = [];
      for (const t of built) {
        const e = new TW.Enemy(t); e.placeAt(0, -2, 0); TW.enemies.push(e); step(1);
        const meshes = TW.scene.children.filter(o => o.material === e.mat);
        tris.push(t + ':' + e.tris);
        if (meshes.length !== 1 || e.tris < 250 || e.tris > 340 || !run(`TEX.sheet_${t}`) || run(`ENEMY_FALLBACK.${t}`) || run(`enemyType('${t}')`) !== t) bad.push(t);
        e.remove();
      }
      check(`every new goon (${built.length}) is one mesh on its own sheet, 250-340 tris, and no longer a stand-in`, bad.length === 0 && built.length > 0, bad.join(',') + ' | ' + tris.join(' '));
    }

    // ---- Act 2's Columbian regulars (looks only so far): they exist, load as one mesh on their own sheet in budget, stand at a
    // real height in their idle pose, and aren't in any fight yet
    {
      run('clearEnemies()');
      const COL = ['cadet', 'sodajerk', 'linebacker', 'marshal'], bad = [], info = [];
      for (const t of COL) {
        if (!TW.CFG.enemies[t] || !run(`typeof BODIES.${t} === 'function' && !!POSES.${t} && !!TEX.sheet_${t}`)) { bad.push(t + ':missing'); continue; }
        const e = new TW.Enemy(t); e.cfg = Object.assign({}, e.cfg, { speed: 0 }); e.cooldown = 1e9; e.placeAt(0, -2.5, 0); e.state = 'circle'; TW.enemies.push(e); step(90);
        const meshes = TW.scene.children.filter(o => o.material === e.mat), top = e.body.by.head.x.y + 0.15 * e.s;
        info.push(`${t}:${e.tris}/${top.toFixed(2)}m`);
        if (meshes.length !== 1 || e.tris < 250 || e.tris > 340 || top < 1.6 || top > 1.92 || run(`enemyType('${t}')`) !== t) bad.push(t);
        e.remove();
      }
      check('Act 2\'s Columbian regulars (cadet, soda jerk, linebacker, marshal) load: one mesh on their own sheet, 250-340 tris, 1.6-1.92 m tall', bad.length === 0, bad.join(',') + ' | ' + info.join(' '));
      const cfgNoEnemies = JSON.stringify(Object.assign({}, TW.CFG, { enemies: null }));
      check('and none of them is in any level\'s fight yet (there are no Act 2 levels)', COL.every(t => !cfgNoEnemies.includes(`"${t}"`)), COL.filter(t => cfgNoEnemies.includes(`"${t}"`)).join(','));
    }

    // ---- the honour guard's flagpole: upright at rest, levelled at you to lunge; swat it mid-lunge and it's yours
    fresh();
    const gd = spawn('guard', 0, -1.6, { state: 'circle', cooldown: 99, cfg: { speed: 0 } }); step(60);
    const fp = gd.weapon, fb = fp && fp.body.by;
    check('the guard carries a flagpole (long, bat-like, his)', fp && fp.type === 'flagpole' && fp.batLike && fp.heldByEnemy === gd && fp.cfg.length >= 1.8);
    check('at rest it stands upright beside him, the flag at the top', fb && fb.tip.x.y - fb.knob.x.y > 1.5, fb ? 'rise ' + (fb.tip.x.y - fb.knob.x.y).toFixed(2) : '');
    gd.setState('approach'); gd.cooldown = 0; gd.cfg = Object.assign({}, gd.cfg, { speed: TW.CFG.enemies.guard.speed });
    until(() => gd.state === 'windup' && gd.timer > gd.windupTime * 0.6, 900);
    const lv = fb.tip.x.clone().sub(fb.knob.x).normalize(), toMe = V(-gd.pos.x, 0, -gd.pos.z).normalize();
    check('he winds up by levelling it at you, from out past your reach', gd.state === 'windup' && lv.dot(toMe) > 0.6 && Math.hypot(gd.pos.x, gd.pos.z) > 1.2,
      `dot ${lv.dot(toMe).toFixed(2)}, ${Math.hypot(gd.pos.x, gd.pos.z).toFixed(2)} m away`);
    { const mid = fb.knob.x.clone().lerp(fb.tip.x, 0.55), from = mid.clone().add(V(0.4, 0.05, 0.1));
      setGrip(R, from.x, from.y, from.z); step(2);
      for (let i = 0; i < 6; i++) { R.position.lerpVectors(from, mid, (i + 1) / 6); step(1); } }
    check('swatting the pole mid-lunge disarms him', !gd.weapon && gd.state === 'stagger' && !fp.heldByEnemy, gd.state);
    guardDown(); step(Math.ceil(1.6 / DT));
    { const gp = fp.grabPoint(V(0, 0, 0)); setGrip(R, gp.x, gp.y + 0.03, gp.z); step(2); pads[0].buttons[1].pressed = true; step(2); }
    check('you can pick the flagpole up', TW.hands.right.held === fp);
    run('clearEnemies()');
    const dm = spawn('conscript', 0, -1.3, { state: 'circle', cooldown: 99, cfg: { speed: 0 } }); dm.poise = 999; step(30);
    R.rotation.set(0.52, 0, 0); setGrip(R, 0.55, 1.2, 0.1); step(30); run('lastHit = null');
    const hp0 = dm.hp;
    for (let i = 0; i < 18; i++) { setGrip(R, 0.55 - 0.07 * i, 1.2, 0.1); step(1); }   // a sideways sweep at 5 m/s: the flag end swings through him
    const lh = run('lastHit');
    check('swung, the flagpole reaches a goon 1.3 m away and hits harder than a fist', dm.hp < hp0 && lh && lh.dmg >= TW.CFG.weapons.flagpole.dmg + 6, lh ? `${lh.tier} on ${lh.zone}: ${lh.dmg}` : 'no hit, hp ' + dm.hp);
    pads[0].buttons[1].pressed = false; R.rotation.set(0, 0, 0); step(2);

    // ---- the bandsman: cymbals fly flat and spinning at your head; block them, catch them, throw them back
    fresh();
    const bd = spawn('bandsman', 0.6, -3.8); bd.throwCd = 0; bd.lobType = 'cymbal';
    let cym = null, lobMin = 9, spin0 = 0, spinMax = 0; const hpB = TW.player.hp;
    step(Math.ceil(3 / DT), () => { for (const q of TW.props) if (q.hostile && q.type === 'cymbal') { if (!cym) { cym = q; spin0 = q.spin; }
      lobMin = Math.min(lobMin, run('(p) => closestOnSeg(player.head, p.prevPos, p.body.ps[0].x, new THREE.Vector3()).distanceTo(player.head)')(q)); spinMax = Math.max(spinMax, q.spin); } });
    check('the bandsman throws a cymbal at you', !!cym, bd.state);
    check('it flies flat and spinning, like a frisbee', cym && cym.spinAxis.y > 0.95 && spinMax - spin0 > 2, cym ? `axis y ${cym.spinAxis.y.toFixed(2)}, spun ${(spinMax - spin0).toFixed(1)} rad` : '');
    check('and it lands on your head if you stand there', lobMin < 0.45 && hpB - TW.player.hp >= TW.CFG.weapons.cymbal.playerDmg, 'closest ' + lobMin.toFixed(2) + ' hp ' + hpB + ' -> ' + TW.player.hp);
    bd.placeAt(0.6, -3.8, Math.PI); bd.setState('keepaway'); let stick = null;
    step(Math.ceil(5 / DT), () => { if (!stick && !bd.carry) { bd.lobType = 'drumstick'; bd.throwCd = 0; } for (const q of TW.props) if (q.hostile && q.type === 'drumstick') stick = stick || q; });
    check('he throws drumsticks too (tumbling end over end)', stick && Math.abs(stick.spinAxis.x) > 0.9, stick ? 'axis ' + stick.spinAxis.x.toFixed(2) : bd.state);
    const flat = (type, aimFist) => run(`(() => { const T = 0.4, A = ${aimFist ? 'hands.right.fist.clone()' : 'player.head.clone()'}, S = new THREE.Vector3(A.x - 1.1, A.y - 0.2, A.z - 3.0);
      const p = new Prop('${type}', S); const v = new THREE.Vector3().subVectors(A, S).divideScalar(T); v.y -= 0.5 * CFG.physics.gravity * T;
      p.body.drag = 0.02; p.unpinAll(v); p.hostile = true; p.thrown = true; p.releasedAt = NOW; p.prevPos.copy(S); return p; })()`);
    fresh(); guardUp(); step(3);
    const hpG = TW.player.hp, c1 = flat('cymbal', false); step(50);
    check('a raised guard blocks a cymbal (it bounces off your forearms)', TW.player.hp === hpG && !c1.hostile, 'hp ' + TW.player.hp);
    fresh(); setGrip(R, 0.2, 1.4, -0.35); step(3);
    const tgt = spawn('conscript', 0.3, -2.4, { state: 'circle', cooldown: 99, cfg: { speed: 0 } }); step(3);
    const c2 = flat('cymbal', true); pads[0].buttons[1].pressed = true; const catches0 = TW.game.catches || 0;
    step(50);
    check('squeezed grip catches a cymbal in flight', TW.hands.right.held === c2 && TW.game.catches > catches0 && TW.player.hp === 100, 'hp ' + TW.player.hp);
    const thp = tgt.hp;
    for (let i = 0; i < 7; i++) { setGrip(R, 0.2 + 0.01 * i, 1.4 + 0.02 * i, -0.2 - 0.09 * i); step(1); }
    pads[0].buttons[1].pressed = false; step(Math.ceil(1.0 / DT));
    check('thrown back, the cymbal hits the goon', tgt.hp < thp, 'hp ' + thp + ' -> ' + tgt.hp);

    // ---- the specialist slips a fast punch (when he rolls it), and eats it when he doesn't
    const jab = (e, speed) => {
      let ch = e.zone('belly').pos.clone();   // to the body, under his raised gloves
      ease(R, V(ch.x, ch.y, ch.z + 0.6), 60); step(5);
      ch = e.zone('belly').pos.clone(); const sz = ch.z + 0.6, n = Math.ceil(0.7 / (speed * DT));
      ease(R, V(ch.x, ch.y, sz), 8); step(3); TW.hands.right.cd.clear();   // easing in can brush his raised guard (a shove, and the hand's cooldown on him)
      let saw = false; for (let i = 0; i <= n; i++) { setGrip(R, ch.x, ch.y, sz - speed * DT * i); step(1); if (e.state === 'dodge') saw = true; }
      step(30, () => { if (e.state === 'dodge') saw = true; }); ease(R, V(0.25, 1.0, -0.2), 60); return saw;
    };
    fresh();
    const sp = spawn('specialist', 0, -0.95, { state: 'circle', cooldown: 99, cfg: { speed: 0, dodgeChance: 1 } }); step(30);
    let hpS = sp.hp, p0 = sp.pos.clone();
    const slipped = jab(sp, 4.5);
    check('the specialist slips a fast jab: steps out of its line, takes nothing', slipped && sp.hp === hpS && sp.pos.distanceTo(p0) > 0.15 && TW.game.dodges >= 1,
      `hp ${hpS} -> ${sp.hp}, moved ${sp.pos.distanceTo(p0).toFixed(2)} m`);
    sp.cfg = Object.assign({}, sp.cfg, { dodgeChance: 0 }); sp.placeAt(0, -0.95, 0); sp.releaseToken(); sp.setState('circle'); sp.cooldown = 99; step(30); hpS = sp.hp;
    check('when he doesn\'t roll it, the jab lands', !jab(sp, 4.5) && sp.hp < hpS, `hp ${hpS} -> ${sp.hp}`);
    sp.cfg = Object.assign({}, sp.cfg, { dodgeChance: 1 }); sp.placeAt(0, -0.95, 0); sp.releaseToken(); sp.setState('circle'); sp.cooldown = 99; step(60); hpS = sp.hp;
    check('a slow push doesn\'t make him dodge', !jab(sp, 1.6) && sp.state !== 'dodge');

    // ---- the sambo fighter's sweep: a low kick that lands takes more and he follows straight up
    fresh(); guardUp();
    const sb = spawn('sambo', 0, -1.4, { cfg: { combo: 2 } });
    until(() => sb.state === 'windup', 900); sb.kickLow = true; sb.side = 'l';
    const hpW = TW.player.hp; until(() => !['windup', 'strike'].includes(sb.state), 300);
    check('a high guard doesn\'t stop his low kick: SWEPT, for sweep damage', hpW - TW.player.hp === TW.CFG.enemies.sambo.sweep.dmg && TW.game.sweeps >= 1, `hp ${hpW} -> ${TW.player.hp}`);
    until(() => sb.state === 'windup', 60);
    check('and he follows straight up with a quick one', sb.state === 'windup' && Math.abs(sb.windupTime - TW.CFG.enemies.sambo.sweep.followWindup) < 1e-9, sb.state + ' ' + sb.windupTime);

    // ---- the gymnast: after kicking she cartwheels back out of reach and lands on her feet
    fresh(); guardUp();
    const gy = spawn('gymnast', 0, -1.4, { cfg: { combo: 1 } });
    until(() => gy.state === 'retreat', 900);
    let wheel = 0, d0 = Math.hypot(gy.pos.x, gy.pos.z);
    until(() => { wheel = Math.max(wheel, Math.abs(gy.cur.hips[2])); return gy.state !== 'retreat'; }, 200);
    step(30);
    check('she cartwheels out (the whole body wheels about the hips) and lands upright, farther off', wheel > 270 && Math.abs(gy.cur.hips[2]) < 30 && Math.hypot(gy.pos.x, gy.pos.z) > d0 + 0.4 && gy.body.by.head.x.y > 1.3,
      `wheel ${wheel.toFixed(0)}°, hips now ${gy.cur.hips[2].toFixed(0)}°, ${d0.toFixed(2)} -> ${Math.hypot(gy.pos.x, gy.pos.z).toFixed(2)} m, head ${gy.body.by.head.x.y.toFixed(2)}`);

    // ---- the lifter's punch shoves you back (less through a block)
    const shove = (up) => {
      fresh(); if (up) guardUp();
      const lf = spawn('lifter', 0, -1.1, { cfg: { combo: 1 } });
      const z0 = TW.rig.position.z, hp = TW.player.hp; let n = 0;
      until(() => lf.state === 'strike', 900); while (lf.state === 'strike' && n++ < 60) step(1);
      step(Math.ceil(0.5 / DT)); lf.cooldown = 99; return { moved: TW.rig.position.z - z0, dmg: hp - TW.player.hp };
    };
    const s1 = shove(false); check('the lifter\'s punch lands heavy and shoves you back ~0.9 m', s1.dmg === TW.CFG.enemies.lifter.dmg && s1.moved > 0.7, JSON.stringify(s1));
    const s2 = shove(true); check('blocked, it still moves you, but less', s2.dmg === 0 && s2.moved > 0.25 && s2.moved < s1.moved * 0.7, JSON.stringify(s2));

    if (TW.CFG.enemies.chairman) {
      // ---- the Chairman: at 0 hp he doesn't fly; he kneels where he stands, stays, and signs (onLeaderSigned)
      fresh();
      run('var __signed = []; var __ols = onLeaderSigned; onLeaderSigned = function (e) { __signed.push(e.type); };');
      const ch = spawn('chairman', 0, -1.6, { state: 'circle', cooldown: 99 }); step(60);
      const at0 = ch.pos.clone();
      run(`playerHit(enemies[0], 'head', 7.5, 0.6, null, enemies[0].zone('head').pos.clone(), null, new THREE.Vector3(0, 0, -1))`);
      ch.hp = 1; run(`playerHit(enemies[0], 'chest', 7.5, 0.6, null, enemies[0].zone('chest').pos.clone(), null, new THREE.Vector3(0, 0, -1))`);
      step(Math.ceil(2 / DT));
      const P = ch.body.by;
      check('beaten, the Chairman kneels where he stood (no ragdoll, no KO)', ch.state === 'signed' && !ch.alive && P.pelvis.x.y < 0.8 && P.head.x.y > 0.95 && ch.pos.distanceTo(at0) < 0.4,
        `${ch.state} pelvis ${P.pelvis.x.y.toFixed(2)} head ${P.head.x.y.toFixed(2)}`);
      check('and calls onLeaderSigned with himself, once', run('__signed.join()') === 'chairman');
      step(Math.ceil((TW.CFG.reactions.koRemoveTime + 3) / DT));
      check('he stays kneeling (not removed, not sinking)', TW.enemies.includes(ch) && ch.state === 'signed' && ch.body.by.head.x.y > 0.95 && run('__signed.length') === 1);
      run('onLeaderSigned = __ols');
      // a knocked-out signer counts as cleared: a level's encounter with just him in it ends
      run(`updateGame = __ug; startStreet(false); startEncounter(0); game.queue = []; game.state = 'fight';`);
      const c3 = new TW.Enemy('chairman'); c3.placeAt(1, 10, Math.PI); TW.enemies.push(c3); step(3);
      run(`enemies[enemies.length - 1].hp = 0; enemies[enemies.length - 1].knockdown(new THREE.Vector3(0, 0, 1), 'knockdown', true)`); step(3);
      check('a level\'s fight with only him in it counts as cleared once he signs', c3.state === 'signed' && TW.game.state === 'cleared', TW.game.state);
      run(`clearEnemies(); game.state = 'fight'; level.name = 'bar'; updateGame = function () {};`);
    }

    if (TW.CFG.enemies.harmony) {
      // ---- the bar's four rounds: the officials of the three countries (and their bouncers, Rocco & Ivan)
      const W = TW.CFG.waves, OFF = ['harmony', 'enforcer', 'aokiagent', 'secguard', 'inspector', 'militia'];
      check('the bar\'s rounds are officials only, Rocco & Ivan last', W.length === 4 && W.slice(0, 3).every(w => w.every(t => OFF.includes(t))) && W[3].join() === 'rocco,ivan' && W.flat().every(t => TW.CFG.enemies[t]),
        JSON.stringify(W));
      check('all three countries\' officials show up', ['harmony', 'enforcer'].some(t => W.flat().includes(t)) && ['inspector', 'militia'].some(t => W.flat().includes(t)) && ['aokiagent', 'secguard'].some(t => W.flat().includes(t)));
    }
  } catch (err) { log.push('ERROR ' + err.stack); }
  console.log(log.join('\n'));
})();
