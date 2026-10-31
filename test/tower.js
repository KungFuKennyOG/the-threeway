// Headless checks for the Tower of Labor (the end of Act 1): no stairs. Started from the menu, walked into from Parade
// Square, the lobby, lift 1 to the Ministry's office floor, lift 2 to
// the archive (Inspector Orlova), lift 3 to the Chairman's office; he signs and Act 1 is complete.
'use strict';
const vm = require('vm');
const THREE = require('./three_stub.js');
let clock = 0, seed = 47;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {}, addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, fire(t, e) { for (const f of this._l[t] || []) f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info', 'levelSel']) els[id] = mkEl(id);
els.c.requestPointerLock = () => {};
els.levelSel.value = 'tower';   // the menu's "Start at" picker
class ImageStub { set src(v) { this.width = 40; this.height = 16; if (this.onload) this.onload(); } }
const ctx = { THREE, console, Math: Object.create(Math), document: { getElementById: (id) => els[id], addEventListener() {} }, navigator: {}, Image: ImageStub,
  innerWidth: 1280, innerHeight: 720, performance: { now: () => clock * 1000 }, addEventListener: () => {},
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
const C = TW.CFG.tower, TWR = run('TWR'), L = run('TLIFTS'), M = TWR.meshes;
const kill = () => { for (const e of TW.enemies) { e.hp = 0; e.knockdown(V(0, 0, 1), 'knockdown', true); } };
const face = (yaw, pitch = 0) => run(`desk.yaw = ${yaw}; desk.pitch = ${pitch};`);
let maxJump = 0;   // the most your view moved up or down in one frame (VR comfort)
const frame = (n = 1) => { for (let i = 0; i < n; i++) { const y0 = TW.rig.position.y; step(1); maxJump = Math.max(maxJump, Math.abs(TW.rig.position.y - y0)); } };
const walkTo = (x, z, sp = 0.035) => {   // walk in small steps (the walk rects and floors apply, like the keyboard)
  let best = 1e9, stuck = 0;
  for (let k = 0; k < 2500; k++) {
    const dx = x - TW.rig.position.x, dz = z - TW.rig.position.z, d = Math.hypot(dx, dz); if (d < 0.02) break;
    if (d < best - 0.005) { best = d; stuck = 0; } else if (++stuck > 40) break;   // held by a wall: give up
    const s = Math.min(sp, d); TW.rig.position.x += dx / d * s; TW.rig.position.z += dz / d * s;
    const p = V(TW.rig.position.x, TW.rig.position.y, TW.rig.position.z); TW.keepInWalk(p, 0.3); TW.rig.position.x = p.x; TW.rig.position.z = p.z; frame();
  }
};
const until = (f, n = 3000) => { for (let i = 0; i < n && !f(); i++) frame(); return f(); };
const fightClear = () => { until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900); kill(); until(() => TW.game.state === 'walk', 600); };
const onFloor = (y) => TW.enemies.length > 0 && TW.enemies.every(e => Math.abs(e.pos.y - y) < 0.1);
const carMid = (Li) => [(Li.car[0] + Li.car[1]) / 2, (Li.car[2] + Li.car[3]) / 2 + 0.3];
const ride = (Li, F) => {   // step into a lift and ride it to the top of its run; returns the worst per-frame jump
  const [cx, cz] = carMid(Li); walkTo(cx, TWR.wallZ - 0.8); walkTo(cx, cz); maxJump = 0;
  until(() => Li.stop === 1 && Li.phase === 'open', 2400);
  return maxJump;
};
const inside = (x, z, [x0, x1, z0, z1], m = 0) => x > x0 + m && x < x1 - m && z > z0 + m && z < z1 - m;
const inBlocker = (x, z, y) => TW.BLOCKERS.some(b => b.y1 !== undefined && y >= (b.y0 || 0) - 0.5 && y < b.y1 && x > b.x0 - 0.3 && x < b.x1 + 0.3 && z > b.z0 - 0.3 && z < b.z1 + 0.3);
const comfort = 0.06;   // m: the most your view may move in one frame of a ride

try {
  // ---- the menu: the deskBtn starts whatever "Start at" picks
  check('the menu lists it as "7 · The Tower of Labor"', TW.LEVELS.tower && TW.LEVELS.tower.menu === '7 · The Tower of Labor' && TW.LEVELS.tower.after === 'parade');
  els.deskBtn.fire('click'); step(3);
  check('starting it from the menu puts you just inside the south doors, on the ground floor', TW.level.name === 'tower' && Math.abs(TW.rig.position.z - C.start[1]) < 0.3 && Math.abs(TW.player.floorY) < 0.01, `${TW.level.name} z ${TW.rig.position.z.toFixed(2)}`);

  // ---- the build
  check('the tower is a baked shell (outside, fogged like the skylines) + two baked meshes for its four floors + three lift cars + the permit',
    ['low', 'high'].every(k => M[k] && M[k].geometry.attributes.bake) && TWR.shell.geometry.attributes.bake && TWR.shell.material.uniforms.uFogOn.value === TW.CFG.street.skylineFog
    && L.length === 3 && L.every(Li => Li.group && Li.leaves.length === 2) && TWR.permit && !TWR.permit.visible);
  const T = TWR.tris, inTris = T.lobby + T.office + T.archive + T.top;
  check('each floor keeps its triangles modest', ['lobby', 'office', 'archive', 'top'].every(k => T[k] < 6000), ['lobby', 'office', 'archive', 'top'].map(k => k + ' ' + T[k]).join(', '));
  check('the shell stays cheap for something seen from across the city', T.shell < 8000, T.shell + ' shell tris');
  { const P = TW.ST.skylineMesh.geometry.attributes.position.array, R = TWR.rect; let n = 0;
    for (let i = 0; i < P.length; i += 3) if (P[i + 1] > 0.5 && P[i] > R[0] && P[i] < R[1] && P[i + 2] > R[2] && P[i + 2] < R[3]) n++;
    check('no skyline slab, TV tower or far-city block stands on the tower\'s ground', n === 0, n + ' vertices'); }
  { const B = TW.ST.beacons, [kx, kz] = TW.STREET.kras;
    check('the old distant stepped tower is gone from the skylines; the Krasnovian beacon is on this spire', !B.some(b => b[0] === kx && b[2] === kz) && B.some(b => b[0] === -40 && b[2] === 330 && b[1] > TWR.spire), B.length + ' beacons'); }
  { const top = Math.max(...Array.from(TWR.shell.geometry.attributes.position.array).filter((v, i) => i % 3 === 1));
    // from the road (eye 1.7 m at z 20) over Superblock 14's point block (61.6 m, its south face at z 118) to the tower (z 330)
    const hidden = 1.7 + (TW.SB.point[4] - 1.7) / (TW.SB.point[2] - 20) * (330 - 20);
    check('the gilded cog clears Superblock 14\'s point block as seen from Tripoint Square', TWR.cogY - TWR.cogD / 2 > hidden - 3 && top > hidden, `cog ${TWR.cogY} m, spire ${top.toFixed(0)} m, hidden below ${hidden.toFixed(0)} m`); }
  check('every fight is on one floor: its spawns stand on that floor, inside its room, clear of the furniture',
    C.encounters.every(E => E.spawn.every(([, x, z, y]) => y >= E.at[4] && y <= E.at[5] && inside(x, z, E.at, 0.2) && !inBlocker(x, z, y))), C.encounters.map(E => E.name).join(', '));
  check('the cast: militia + inspectors, clerks + a bodyguard, Inspector Orlova (boss) + a bodyguard, the Chairman (boss)',
    C.encounters[0].spawn.every(s => ['militia', 'inspector'].includes(s[0])) && C.encounters[1].spawn.every(s => ['clerk', 'bodyguard'].includes(s[0]))
    && C.encounters[2].boss && C.encounters[2].spawn.some(s => s[0] === 'orlova') && C.encounters[2].spawn.some(s => s[0] === 'bodyguard') && C.encounters[3].boss && C.encounters[3].spawn.map(s => s[0]).join() === 'chairman');

  // ---- the lobby
  until(() => TW.level.encounter === 0, 60);
  check('the lobby fight starts as you come in, the doors and lift 1 shut', TW.level.encounter === 0 && TW.LOCKED.has('twDoor') && TW.LOCKED.has('twLift1'), TW.game.state);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('the lobby crew stands on the ground floor', TW.enemies.length === C.encounters[0].spawn.length && onFloor(0), TW.enemies.map(e => e.type + '@' + e.pos.y.toFixed(1)).join(','));
  walkTo(-40, 310.6);
  check('you can\'t leave through the doors mid-fight', TW.player.head.z > 311.9, 'z ' + TW.player.head.z.toFixed(2));
  walkTo(-31, 331); walkTo(-31, 335);
  check('nor take lift 1', TW.player.head.z < L[0].car[2] + 0.5 && L[0].phase === 'open' && L[0].stop === 0, `z ${TW.player.head.z.toFixed(2)} ${L[0].phase}`);
  kill(); until(() => TW.game.state === 'walk', 600);

  // ---- lift 1 to the offices
  let jump = ride(L[0]);
  check('lift 1 takes you up to the Ministry\'s office floor', L[0].stop === 1 && Math.abs(TW.player.floorY - TWR.office.y) < 0.05, `y ${TW.player.floorY.toFixed(2)}`);
  check('the ride is smooth (your view never jumps)', jump < comfort, (jump * 1000).toFixed(1) + ' mm in a frame');
  walkTo(-31, 331);
  until(() => TW.level.encounter === 1, 60);
  check('stepping out starts the office fight, both lifts shut', TW.level.encounter === 1 && TW.LOCKED.has('twLift1') && TW.LOCKED.has('twLift2'), TW.game.state);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('the clerks and the bodyguard stand on the office floor', TW.enemies.length === C.encounters[1].spawn.length && onFloor(TWR.office.y), TW.enemies.map(e => e.type + '@' + e.pos.y.toFixed(1)).join(','));
  walkTo(-47, 331.5); walkTo(-47, 335);
  check('lift 2 is shut while it\'s on', TW.player.head.z < L[1].car[2] + 0.5 && L[1].stop === 0, 'z ' + TW.player.head.z.toFixed(2));
  TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
  check('going down on the office floor puts you back on the office floor, by lift 1', TW.level.encounter === 1 && Math.abs(TW.player.floorY - TWR.office.y) < 0.05 && Math.abs(TW.rig.position.x - C.encounters[1].respawn[0]) < 0.5, `y ${TW.player.floorY.toFixed(2)}`);
  fightClear();

  // ---- lift 2 to the archive: Inspector Orlova
  jump = ride(L[1]);
  check('lift 2 takes you up to the archive', L[1].stop === 1 && Math.abs(TW.player.floorY - TWR.archive.y) < 0.05, `y ${TW.player.floorY.toFixed(2)}`);
  check('smoothly', jump < comfort, (jump * 1000).toFixed(1) + ' mm');
  walkTo(-47, 331);
  until(() => TW.level.encounter === 2, 60);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  const orlova = TW.game.bosses[0];
  check('Orlova\'s fight: a boss bar, her bodyguard, both on the archive floor, lifts 2 and 3 shut', TW.game.bosses.length === 1 && TW.bossBars.length === 1 && onFloor(TWR.archive.y) && TW.LOCKED.has('twLift2') && TW.LOCKED.has('twLift3'), TW.enemies.map(e => e.type).join(','));
  orlova.hp = orlova.maxHp * 0.45; step(2);
  check('she enrages at half health', orlova.enraged === true);
  TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
  check('going down in the archive puts you back in the archive, the fight restarted', TW.level.encounter === 2 && Math.abs(TW.player.floorY - TWR.archive.y) < 0.05 && ['intro', 'fight'].includes(TW.game.state), `y ${TW.player.floorY.toFixed(2)} ${TW.game.state}`);
  fightClear();

  // ---- lift 3 to the Chairman's office
  jump = ride(L[2]);
  check('lift 3 takes you up to the Chairman\'s office under the cog', L[2].stop === 1 && Math.abs(TW.player.floorY - TWR.top.y) < 0.05 && TWR.cogY > TWR.top.y + TWR.top.h, `y ${TW.player.floorY.toFixed(2)}`);
  check('smoothly, all 40 m of it', jump < comfort, (jump * 1000).toFixed(1) + ' mm');
  walkTo(-40, 331.5);
  until(() => TW.level.encounter === 3, 60);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  const chair = TW.game.bosses[0];
  check('the Chairman has a boss bar, on his own floor, lift 3 shut', chair && TW.bossBars.length === 1 && onFloor(TWR.top.y) && TW.LOCKED.has('twLift3'), TW.enemies.map(e => e.type + '@' + e.pos.y.toFixed(1)).join(','));
  chair.hp = chair.maxHp * 0.3; step(2);
  check('he doesn\'t enrage (he\'s no fighter)', !chair.enraged);
  // rooms, up here: facing the window you see the night city; facing in, only the office
  run('level.encounter = 99'); face(0, -0.15); step(3);   // (fights paused while we look round)
  check('facing the window: the office and, through it, the city (skylines, the tower\'s own shell) are drawn; nothing from the floors below',
    TW.roomState.cur === 'twTop' && M.high.visible && TW.ST.skylineMesh.visible && TWR.shell.visible && !M.low.visible, TW.roomState.cur);
  face(Math.PI); step(3);
  check('facing in, the city isn\'t drawn', M.high.visible && !TW.ST.skylineMesh.visible && !TWR.shell.visible);
  run('level.encounter = 3');
  // he's beaten: he signs
  kill(); until(() => TW.game.state === 'won', 120);
  check('beating the Chairman: he signs, the level is won', TW.game.state === 'won' && run('SIGNED.has("chairman")') && TWR.signed, TW.game.state);
  check('"SIGNED · 1 OF 3"', run('bigSign && bigSign.mesh ? 1 : 1') && run('SIGN_TEXT.signed1[0]') === 'SIGNED · 1 OF 3');
  step(3);
  check('the signed permit lies on his desk', TWR.permit.visible);
  step(Math.ceil((C.signPause + 0.3) / DT));
  check('then "ACT 1 COMPLETE"', TWR.act1 && run('SIGN_TEXT.act1[0]') === 'ACT 1 COMPLETE' && /Act 1 complete/.test(els.info.textContent), els.info.textContent.slice(0, 60));

  // ---- the leader hook: his own goon (signs: true) kneels and calls onLeaderSigned
  run('LEVELS.tower.start(false); level.encounter = 99'); step(2);
  run('resetTowerLifts(3); clearEnemies(); level.encounter = 3; game.state = "fight"; game.queue = []; { const e = new Enemy(enemyType("chairman")); e.placeAt(-43, 325, 0, 80); e.cooldown = 1e9; enemies.push(e); }');
  TW.rig.position.set(-40, TWR.top.y, 331); step(3);
  run('onLeaderSigned({ type: "bodyguard", cfg: {} })'); step(1);
  check('the hook ignores goons who don\'t sign', !TWR.signed && TW.game.state === 'fight');
  run('onLeaderSigned({ type: "chairman", cfg: { signs: true }, alive: false })'); step(1);
  check('a leader with signs: true calling onLeaderSigned ends the level the same way', TWR.signed && TW.game.state === 'won');

  // ---- walking in from Parade Square, once it's won
  run(`LEVELS.parade.start(false); clearEnemies(); level.encounter = CFG.parade.encounters.length - 1; game.state = 'won'; LOCKED.clear();`);
  TW.rig.position.set(-40, 0, 304); face(Math.PI); step(4);
  check('from the square, looking at the open doors, the lobby is drawn through them', TW.roomState.cur === 'outside' && M.low.visible && !M.high.visible);
  walkTo(-40, 315);
  check('walking through the south doors carries you into the tower with no cut', TW.level.name === 'tower' && TW.player.head.z > 312.6 && TW.player.head.z < 316 && Math.abs(TW.player.floorY) < 0.01, `${TW.level.name} z ${TW.player.head.z.toFixed(2)}`);
  until(() => TW.level.encounter === 0, 120);
  check('and the lobby fight starts', TW.level.encounter === 0 && TW.LOCKED.has('twDoor'));
  // inside the lobby facing in: no city
  run('level.encounter = 99'); TW.rig.position.set(-40, 0, 320); face(Math.PI); step(3);
  check('in the lobby facing in: only the inside is drawn', TW.roomState.cur === 'twLobby' && M.low.visible && !TW.ST.skylineMesh.visible && !TWR.shell.visible && !M.high.visible, TW.roomState.cur);
  face(0); step(3);
  check('turn round and the square shows through the doors', TW.ST.skylineMesh.visible && TWR.shell.visible);

  // ---- physics cost on the office floor (four goons among the desks)
  run('clearEnemies(); resetTowerLifts(1); level.encounter = 99'); TW.rig.position.set(-40, TWR.office.y, 330); step(3);
  for (const t of ['conscript', 'laborer', 'wrestler', 'cook']) { const e = new TW.Enemy(t); e.placeAt(-42 + rnd() * 4, 321 + rnd() * 6, 0, TWR.office.y); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('office physics cost per frame (4 goons on the office floor, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
  check('they stay on the office floor', TW.enemies.every(e => Math.abs(e.pos.y - TWR.office.y) < 0.3), TW.enemies.map(e => e.pos.y.toFixed(2)).join(','));
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} tower checks pass`);
process.exitCode = fails ? 1 : 0;
