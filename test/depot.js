// Headless checks for the old level 3: Tram Depot 7 (Krasnovia; scrapped as a location, still reachable from the menu). The yard, the hall, the workshop, Volkov's ring.
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
const D = TW.DEPOT, C = TW.CFG.depot, DP = TW.DP;
const L = (lx, lz) => V(D.x + lx, 0, D.z + lz);          // depot-local -> world
const at = (lx, lz, yaw) => { TW.rig.position.set(D.x + lx, 0, D.z + lz); run(`desk.yaw = ${yaw}; desk.pitch = 0;`); };   // yaw PI faces +z (into the depot)
const walk = (lx, lz) => { const p = L(lx, lz); TW.keepInWalk(p, 0.3); return [p.x - D.x, p.z - D.z]; };

els.deskBtn.fire('click');
step(3);
try {
  // ---- the build: three baked meshes on the street atlas, light baked in, a modest triangle budget
  check('the depot is three meshes (yard + shell, hall, workshop), light baked in', [DP.extMesh, DP.hallMesh, DP.workMesh].every(m => m && m.geometry.attributes.bake && m.material.uniforms.uBaked.value === 1 && m.material.uniforms.map.value === TW.ST.atlas.tex));
  const tris = DP.ext.tris + DP.hall.tris + DP.work.tris;
  check('depot triangles within budget', tris < 20000, `${DP.ext.tris} outside + ${DP.hall.tris} hall + ${DP.work.tris} workshop`);
  check('the depot\'s lamps are baked (sodium in the yard, tubes in the hall)', DP.lamps.length >= 20, DP.lamps.length + ' lights');
  { const P = TW.ST.skylineMesh.geometry.attributes.position.array, R = D.rect; let n = 0;
    for (let i = 0; i < P.length; i += 3) if (P[i + 1] > 0.5 && P[i] > R[0] && P[i] < R[1] && P[i + 2] > R[2] && P[i + 2] < R[3]) n++;
    check('no skyline slab or far-city block sits on the depot', n === 0, n + ' vertices'); }

  // ---- start
  run('startDepot(false)'); step(3);
  check('starting at the depot puts you at the yard gate, facing in', TW.level.name === 'depot' && TW.game.state === 'walk' && Math.abs(TW.player.head.z - (D.z + C.start[1])) < 0.6, `z ${(TW.player.head.z - D.z).toFixed(2)} (local)`);
  check('depot props are placed', TW.props.filter(p => p.type !== 'bottle' && p.type !== 'stool').length >= 4 && TW.props.some(p => p.body.ps[0].x.distanceTo(L(0, 20)) < 40), TW.props.length + ' props');

  // ---- walls, doors
  let [x, z] = walk(19.5, 10);
  check('the yard wall holds', x < D.yard[0], `x ${x.toFixed(2)}`);
  [x, z] = walk(0, D.hall[1] + 0.2);
  check('the track doors lead into the hall', Math.abs(z - (D.hall[1] + 0.2)) < 1e-9 && x === 0);
  [x, z] = walk(13, D.hall[1] + 0.2);
  check('but not through the hall\'s front wall', Math.abs(z - D.hall[1]) > 0.25, `z ${z.toFixed(2)}`);
  const wd = (D.workDoor[0] + D.workDoor[1]) / 2;
  [x, z] = walk(D.hall[0] + 0.4, wd);
  check('the workshop door is a way through', Math.abs(x - (D.hall[0] + 0.4)) < 1e-9, `x ${x.toFixed(2)}`);
  [x, z] = walk(D.hall[0] + 0.4, 40);
  check('the hall\'s east wall is solid beside it', x < D.hall[0], `x ${x.toFixed(2)}`);
  const tp = L(-6, 44); TW.pushOutXZ(tp, 0.3);
  check('the trams are solid', Math.abs(tp.x - (D.x - 6)) > 1.2, `x ${(tp.x - D.x).toFixed(2)}`);

  // ---- rooms + portals
  run('level.encounter = 99');
  at(0, 6, 0); step(3);
  check('in the yard facing the street: hall and workshop aren\'t drawn', !DP.hallMesh.visible && !DP.workMesh.visible && DP.extMesh.visible);
  at(0, 6, Math.PI); step(3);
  check('in the yard facing the open track doors: the hall is drawn through them', DP.hallMesh.visible && DP.extMesh.visible);
  at(0, 60, Math.PI); step(3);
  check('in the hall facing the ring: the yard, street, skylines and workshop aren\'t drawn', DP.hallMesh.visible && !DP.extMesh.visible && TW.ST.streetGroup.every(o => !o.visible) && !DP.workMesh.visible, TW.roomState.cur);
  at(0, 44, 0); step(3);
  check('in the hall facing the doors: the city is drawn through them', DP.extMesh.visible && TW.ST.litMesh.visible);
  at(D.hall[0] - 4, wd, -Math.PI / 2); step(3);
  check('in the hall facing the workshop door: the workshop is drawn', DP.workMesh.visible && TW.roomState.cur === 'depotHall');
  at(24, 54, -Math.PI / 2); step(3);   // yaw -PI/2 faces +x: the workshop's back wall
  check('in the workshop facing away from its door: nothing else is drawn', TW.roomState.cur === 'depotWork' && DP.workMesh.visible && !DP.hallMesh.visible && !DP.extMesh.visible);

  // ---- encounters
  run('clearEnemies(); startDepot(false)'); step(2);
  at(0, C.encounters[0].trigger + 0.4, Math.PI); step(4);
  check('walking into the yard starts the first fight', TW.level.encounter === 0 && ['intro', 'fight'].includes(TW.game.state), TW.game.state);
  step(Math.ceil((1 + C.spawnGap * 4) / DT));
  check('the yard fight spawns its crew', TW.enemies.length === C.encounters[0].spawn.length, TW.enemies.map(e => e.type).join(','));
  at(0, 34, Math.PI); step(2);
  check('the yard holds you until it\'s clear', TW.player.head.z - D.z <= C.encounters[0].arena[1], 'z ' + (TW.player.head.z - D.z).toFixed(2));
  for (const e of TW.enemies) { e.hp = 0; e.knockdown(V(0, 0, 1), 'knockdown', true); }
  step(Math.ceil((C.clearedPause + 0.5) / DT));
  check('clearing it opens the way to the hall', TW.game.state === 'walk' && !TW.level.arena, TW.game.state);
  at(0, C.encounters[1].trigger + 0.4, Math.PI); step(Math.ceil(2.5 / DT));
  check('the hall fight starts inside', TW.level.encounter === 1 && TW.enemies.some(e => e.alive), TW.enemies.map(e => e.type).join(','));
  TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
  check('going down restarts the hall fight at its start, full health', TW.level.encounter === 1 && TW.player.hp === TW.CFG.player.health && Math.abs(TW.player.head.z - D.z - C.encounters[1].respawn[1]) < 0.6, `z ${(TW.player.head.z - D.z).toFixed(2)}`);

  // ---- Volkov
  run('clearEnemies(); level.encounter = 1; level.arena = null; game.state = "walk";');
  at(0, C.encounters[2].trigger + 0.4, Math.PI); step(Math.ceil(3 / DT));
  const vk = TW.enemies.find(e => e.type === 'volkov');
  check('the ring: Volkov steps in, with a boss bar', vk && TW.game.bosses.includes(vk) && TW.bossBars.length >= 1, vk ? 'hp ' + vk.hp : 'no volkov');
  check('Volkov is a grabber with his own body and sheet', vk && vk.cfg.grabber && vk.tris > 200 && vk.tris < 400, vk ? vk.tris + ' tris' : '');
  const maxHp = vk.cfg.hp; vk.hp = maxHp * (C.enrageAt - 0.05); step(4);
  check('below half health the Bear gets angry', vk.enraged, 'hp ' + vk.hp.toFixed(0));
  vk.hp = 0; vk.knockdown(V(0, 0, 1), 'knockdown', true); step(Math.ceil(2 / DT));
  check('putting him down clears the depot', TW.game.state === 'won', TW.game.state);

  // (the street's boom now leads on into Krasnovia, the gate and Superblock 14: see test/superblock.js)

  // ---- physics cost in the hall (walls, trams, ring posts, lockers filed by z band)
  run('clearEnemies(); startDepot(false); level.encounter = 99'); at(0, 50, Math.PI);
  for (const t of ['wrestler', 'cook', 'secguard', 'kicker']) { const e = new TW.Enemy(t); e.placeAt(D.x + rnd() * 6 - 3, D.z + 52 + rnd() * 6, 0); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('hall physics cost per frame (4 goons + props, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} depot checks pass`);
process.exitCode = fails ? 1 : 0;
