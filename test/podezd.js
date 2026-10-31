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
  check('what\'s drawn from everywhere outside (the railway bank) stays lean: < 4600 (the whole outside was 6764); the roof < 1600, the insides < 7000',
    PZ.parts.bank < 4600 && PZ.parts.roof < 1600 && PZ.parts.lobby + PZ.parts.up < 7000, JSON.stringify(PZ.parts));
  check('the 7th and the wing are the lobby\'s child, the roof the bank\'s (culled by three, hidden past the fog)', PZ.upMesh.parent === PZ.inMesh && PZ.roofMesh.parent === PZ.outMesh && PZ.roofMesh.frustumCulled && !PZ.outMesh.frustumCulled
    && !run('sbSeen(PZ.roofMesh, { x: -190, y: 1.7, z: 198 })') && run('sbSeen(PZ.roofMesh, { x: -30, y: 1.7, z: 140 })'));
  const solidAt = (x, z, y, r = 0.25) => TW.BLOCKERS.some(b => (b.y1 === undefined ? y < 0.5 : y >= (b.y0 || 0) - 0.1 && y < b.y1 - 0.1) && x > b.x0 - r && x < b.x1 + r && z > b.z0 - r && z < b.z1 + r);
  { const [f0, f1, fz0, fz1] = PZ.flat, bad = [];
    for (const E of C.encounters) for (const [t, x, z, y] of E.spawn) if (solidAt(x, z, y)) bad.push(`${E.name}:${t}@${x},${z}`);
    for (const [t, x, z, y] of C.props) if (solidAt(x, z, y || 0, 0.12)) bad.push(`prop ${t}@${x},${z}`);
    check('flat 1 (the kitchen you see from the yard) fills the lobby\'s corner, solid; every crew and prop starts clear of the furniture on its floor',
      solidAt((f0 + f1) / 2, (fz0 + fz1) / 2, 0, 0) && !bad.length, bad.join(' ')); }
  check('the communal kitchen\'s stoves, table and sink are solid, the pram and the plant on the landing too', solidAt(PZ.kitchen[0] + 0.3, 120, PZ.seventh, 0) && solidAt(-29.5, 120.4, PZ.seventh, 0) && solidAt(PZ.kitchen[1] - 0.3, 119.4, PZ.seventh, 0) && solidAt(-7.3, 121, PZ.seventh, 0) && solidAt(-19.2, 119, PZ.seventh, 0));
  { const S2 = PZ.seventh, north = (x) => ((-20 - x - 1.5) / 3) % 1;
    check('inside matches outside: the kitchen\'s windows are the north wing\'s bays that show it lit from the yard', PZ.kitWin.every(x => Math.abs(north(x)) < 1e-9 && x > PZ.kitchen[0] + 0.5 && x < PZ.kitchen[1] - 0.5)); }
  // the cog's sightline from the wing roof against the roof's aerials and the estate's children (the Tower's own check
  // in test/tower.js tests the meshes drawn everywhere)
  { const AW = run('ACT1_WEST'), TWR = run('TWR'), [cx, cz] = AW.toWorld(-40, 330), o = V(-36, PZ.wingRoof + 1.7, 129), t = V(cx, TWR.cogY, cz);
    let hit = 0; for (const m of [PZ.roofMesh, TW.SBX.gate, TW.SBX.yard]) { const a = m.geometry.attributes.position.array;
      for (let i = 0; i < a.length; i += 9) { const e1 = [a[i + 3] - a[i], a[i + 4] - a[i + 1], a[i + 5] - a[i + 2]], e2 = [a[i + 6] - a[i], a[i + 7] - a[i + 1], a[i + 8] - a[i + 2]], d = [t.x - o.x, t.y - o.y, t.z - o.z];
        const p = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]], det = e1[0] * p[0] + e1[1] * p[1] + e1[2] * p[2]; if (Math.abs(det) < 1e-9) continue;
        const sv = [o.x - a[i], o.y - a[i + 1], o.z - a[i + 2]], u = (sv[0] * p[0] + sv[1] * p[1] + sv[2] * p[2]) / det; if (u < 0 || u > 1) continue;
        const q = [sv[1] * e1[2] - sv[2] * e1[1], sv[2] * e1[0] - sv[0] * e1[2], sv[0] * e1[1] - sv[1] * e1[0]], v = (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]) / det; if (v < 0 || u + v > 1) continue;
        const tt = (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / det; if (tt > 1e-4 && tt < 0.999) hit++; } }
    check('the roof\'s aerial forest keeps the Tower\'s cog in clear view from the wing roof', hit === 0, hit + ' triangles in the way'); }
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
  { const T = A.mat.uniforms.uTint.value, D = C.deadLight;
    check('its light stuttered and died to a dim red', Math.abs(T.x - D[0]) < 1e-6 && Math.abs(T.y - D[1]) < 1e-6 && Math.abs(T.z - D[2]) < 1e-6 && B.mat.uniforms.uTint.value.x === 1, `${T.x.toFixed(2)} ${T.y.toFixed(2)} ${T.z.toFixed(2)}`); }

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
  PZ.inMesh.onBeforeRender(); const upLobby = PZ.upMesh.visible;
  TW.rig.position.set(-10, PZ.seventh, 124); run('resetPodezdRides("broken")'); step(3); PZ.inMesh.onBeforeRender();
  check('the 7th and the wing aren\'t drawn from the lobby (nor through the door from the yard); up on the 7th they are', !upLobby && PZ.upMesh.visible && TW.roomState.cur === 'podezd');
  run('resetPodezdRides("roof"); level.encounter = 99'); TW.rig.position.set(-30, PZ.wingRoof, 121); face(Math.PI / 2); step(3); PZ.inMesh.onBeforeRender();
  check('from the wing roof the street door isn\'t looked through: the insides cost nothing up there', TW.roomState.cur === 'outside' && !TW.roomState.seen.has('podezd') && !PZ.upMesh.visible, [...TW.roomState.seen].join(','));

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
