// Headless checks for podezd 3 (inside Superblock 14): no stairs. In from the courtyard (no cut), the lobby, lift A to the
// 7th (it breaks), across into the north wing, its corridor and kitchen, lift B to the wing's roof, the cradle down to the railway.
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
const walkTo = (x, z, sp = 0.035) => {   // walk in small steps (the walk rects and floors apply, like the keyboard)
  for (let k = 0; k < 2000; k++) {
    const dx = x - TW.rig.position.x, dz = z - TW.rig.position.z, d = Math.hypot(dx, dz); if (d < 0.02) break;
    const s = Math.min(sp, d); TW.rig.position.x += dx / d * s; TW.rig.position.z += dz / d * s;
    const p = V(TW.rig.position.x, TW.rig.position.y, TW.rig.position.z); TW.keepInWalk(p, 0.3); TW.rig.position.x = p.x; TW.rig.position.z = p.z; frame();
  }
};
const until = (f, n = 3000) => { for (let i = 0; i < n && !f(); i++) frame(); return f(); };
const fightClear = () => { until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900); kill(); until(() => TW.game.state === 'walk', 600); };

els.deskBtn.fire('click');
step(3);
try {
  // ---- the build
  check('podezd 3 is one baked inside mesh + one baked outside mesh, plus two lift cars and the cradle', PZ.inMesh.geometry.attributes.bake && PZ.outMesh.geometry.attributes.bake && LIFTS.every(L => L.group && L.leaves.length === 2) && CR.mesh);
  check('their triangles stay within budget', PZ.inTris + PZ.outTris < 16000, `${PZ.inTris} inside + ${PZ.outTris} outside`);
  check('every goon in every fight here is Krasnovian, on the floor it\'s fought on', C.encounters.every(E => E.spawn.every(s => KRAS.has(s[0]) && s[3] >= E.at[4] && s[3] <= E.at[5])), C.encounters.map(E => E.name).join(', '));
  { const P = TW.ST.skylineMesh.geometry.attributes.position.array, R = PZ.rail; let n = 0;
    for (let i = 0; i < P.length; i += 3) if (P[i + 1] > 0.5 && P[i] > R[0] && P[i] < R[1] && P[i + 2] > R[2] && P[i + 2] < R[3]) n++;
    check('no far-city block sits on the railway bank', n === 0, n + ' vertices'); }

  // ---- in from the courtyard, no cut
  run('startSuperblock(false); level.encounter = CFG.superblock.encounters.length - 1; game.state = "walk";');
  TW.rig.position.set(SB.door[0], 0, CFG_finish()); function CFG_finish() { return TW.CFG.superblock.finishZ + 0.6; } face(Math.PI); step(4);
  const wonCourt = TW.game.state === 'won';
  walkTo(SB.door[0], SB.door[1] + 1.0);
  check('the courtyard\'s door leads straight into podezd 3 (no cut)', wonCourt && TW.level.name === 'podezd' && TW.player.head.z > SB.door[1], `${TW.level.name} z ${TW.player.head.z.toFixed(2)}`);
  until(() => TW.level.encounter === 0, 60);
  check('the lobby fight starts as you walk in', TW.level.encounter === 0 && TW.LOCKED.has('pzDoor'), TW.game.state);
  walkTo(SB.door[0], SB.door[1] - 1);
  check('the street door is shut behind you while it\'s on', TW.player.head.z > SB.door[1] - 0.2, 'z ' + TW.player.head.z.toFixed(2));
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 600);
  check('the lobby crew stands on the ground floor', TW.enemies.length === C.encounters[0].spawn.length && TW.enemies.every(e => Math.abs(e.pos.y) < 0.05), TW.enemies.map(e => e.type + '@' + e.pos.y.toFixed(1)).join(','));
  const A = LIFTS[0], B = LIFTS[1];
  walkTo((A.car[0] + A.car[1]) / 2, PZ.front - 0.6);
  check('lift A waits in the lobby, but not until the lobby is clear', A.phase === 'open' && A.stop === 0, A.phase);
  kill(); until(() => TW.game.state === 'walk', 600);

  // ---- lift A: up, and it breaks at the 7th
  walkTo((A.car[0] + A.car[1]) / 2, (A.car[2] + A.car[3]) / 2 + 0.3); maxJump = 0;
  until(() => A.phase === 'closing', 120);
  check('stepping into lift A closes its doors', A.phase === 'closing' || A.phase === 'moving', A.phase);
  until(() => A.phase === 'broken', 2400);
  check('it climbs to the 7th and breaks down there', A.phase === 'broken' && Math.abs(A.y - PZ.seventh) < 1e-6 && Math.abs(TW.player.floorY - PZ.seventh) < 0.05, `${A.phase} y ${A.y.toFixed(2)} you ${TW.player.floorY.toFixed(2)}`);
  check('the ride is smooth (no jump in your view)', maxJump < C.liftSpeed * 1.7 / 72 + 1e-3, (maxJump * 1000).toFixed(1) + ' mm in a frame');
  frame(200);
  check('a broken lift stays broken', A.phase === 'broken' && A.y === PZ.seventh, A.phase);

  // ---- the 7th: the landing, then through into the north wing, its corridor and kitchen
  walkTo((A.car[0] + A.car[1]) / 2, 123.5);
  until(() => TW.level.encounter === 1, 60);
  check('stepping out on the 7th starts the landing fight, the link to the wing shut', TW.level.encounter === 1 && TW.LOCKED.has('nwLink'), TW.game.state);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 600);
  check('the landing crew stands on the 7th', TW.enemies.every(e => Math.abs(e.pos.y - PZ.seventh) < 0.1), TW.enemies.map(e => e.pos.y.toFixed(1)).join(','));
  walkTo(-21.5, 124);
  check('you can\'t leave through the link mid-fight', TW.player.head.x > PZ.x0 - 0.1, 'x ' + TW.player.head.x.toFixed(2));
  kill(); until(() => TW.game.state === 'walk', 600);
  walkTo(-19.7, 124); walkTo(-23, 124);
  check('then the link leads into the north wing\'s corridor, still on the 7th', TW.player.head.x < -21 && Math.abs(TW.player.floorY - PZ.seventh) < 0.05, `x ${TW.player.head.x.toFixed(2)} y ${TW.player.floorY.toFixed(2)}`);
  until(() => TW.level.encounter === 2, 60);
  check('the corridor fight starts, lift B shut', TW.level.encounter === 2 && TW.LOCKED.has('pzLiftB'));
  fightClear();
  check('clearing it opens lift B', !TW.LOCKED.has('pzLiftB') && B.phase === 'open');

  // ---- lift B to the wing's roof
  walkTo(-30, 124); walkTo(-44.1, 124.4); walkTo(-44.1, 126.5); maxJump = 0;
  until(() => B.stop === 1 && B.phase === 'open', 2400);
  check('lift B takes you up to the wing\'s roof', Math.abs(TW.player.floorY - PZ.wingRoof) < 0.05 && B.stop === 1, `y ${TW.player.floorY.toFixed(2)}`);
  check('that ride is smooth too', maxJump < C.liftSpeed * 1.7 / 72 + 1e-3, (maxJump * 1000).toFixed(1) + ' mm');
  walkTo(-44.1, 124.4); walkTo(-40, 123);
  until(() => TW.level.encounter === 3, 60);
  check('the roof fight starts, the lift and the cradle shut', TW.level.encounter === 3 && TW.LOCKED.has('pzCradle') && TW.LOCKED.has('pzLiftB'));
  run('level.encounter = 99; game.state = "walk"'); TW.rig.position.set(-30, TW.rig.position.y, 121); face(0); step(3);
  check('up on the roof you\'re outside: the insides aren\'t drawn, the city is', TW.roomState.cur === 'outside' && !PZ.inMesh.visible && PZ.outMesh.visible && TW.ST.skylineMesh.visible, TW.roomState.cur);
  run('level.encounter = 3; game.state = "fight"; game.queue = [];');
  TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
  check('going down on the roof puts you back on the roof', TW.level.encounter === 3 && Math.abs(TW.player.floorY - PZ.wingRoof) < 0.05, 'y ' + TW.player.floorY.toFixed(2));
  fightClear();

  // ---- the cradle down to the railway
  walkTo(-35, 128.5); walkTo(-35, 130.6); maxJump = 0;
  until(() => CR.phase === 'bottom', 3000);
  check('the cradle lowers you down the north face to the railway bank', CR.phase === 'bottom' && Math.abs(TW.player.floorY) < 0.05 && TW.game.state === 'won', `${CR.phase} y ${TW.player.floorY.toFixed(2)} ${TW.game.state}`);
  check('smoothly', maxJump < C.cradleSpeed * 1.7 / 72 + 1e-3, (maxJump * 1000).toFixed(1) + ' mm');
  walkTo(-35, 135);
  check('and you can step off onto the bank', TW.player.head.z > 133 && TW.player.floorY < 0.05, 'z ' + TW.player.head.z.toFixed(2));

  // ---- rooms: in the lobby the city isn't drawn
  run('startPodezd(false); level.encounter = 99'); TW.rig.position.set(-13, 0, 123); face(Math.PI); step(3);
  check('in the lobby facing in: only the inside is drawn', TW.roomState.cur === 'podezd' && PZ.inMesh.visible && !TW.SBX.mesh.visible && !TW.ST.skylineMesh.visible, TW.roomState.cur);

  // ---- physics cost in the corridor (four goons on the 7th)
  run('clearEnemies(); resetPodezdRides("broken"); level.encounter = 99'); TW.rig.position.set(-30, PZ.seventh, 124); step(3);
  for (const t of ['conscript', 'laborer', 'wrestler', 'cook']) { const e = new TW.Enemy(t); e.placeAt(-34 + rnd() * 6, 123.4 + rnd() * 1.5, 0, PZ.seventh); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('corridor physics cost per frame (4 goons on the 7th, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
  check('they stay on the 7th', TW.enemies.every(e => Math.abs(e.pos.y - PZ.seventh) < 0.3), TW.enemies.map(e => e.pos.y.toFixed(2)).join(','));
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} podezd checks pass`);
process.exitCode = fails ? 1 : 0;
