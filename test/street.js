// Headless checks for level 2: out the Threeway's door, Tripoint Square, the old road, the militia checkpoint.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const THREE = require('./three_stub.js');
const dir = path.join(__dirname, '..');
let clock = 0, seed = 23;
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
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
vm.runInContext([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n'), ctx);
const run = (c) => vm.runInContext(c, ctx);
const key = (type, code) => { for (const f of listeners[type] || []) f({ code, repeat: false, shiftKey: false, preventDefault() {} }); };
const TW = ctx.__tw;
const log = [];
const check = (name, ok, extra = '') => log.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  (' + extra + ')' : ''));
const DT = 1 / 72;
const step = (n, f) => { for (let i = 0; i < n; i++) { clock += DT; if (f) f(i); TW.renderer.loop(); } };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const S = TW.CFG.street;

els.deskBtn.fire('click');
step(3);
try {
  // ---- the build: one atlas, a handful of meshes, a sane triangle budget
  const atlasKeys = Object.keys(run('PAINT')), rect = TW.ST.atlas.rect;
  check('every street painting is in the atlas', atlasKeys.every(k => rect[k] && rect[k][2] > rect[k][0] && rect[k][3] > rect[k][1] && rect[k][2] <= 1 && rect[k][3] <= 1), atlasKeys.length + ' paintings, ' + TW.ST.atlas.W + 'x' + TW.ST.atlas.H);
  const streetMeshes = TW.scene.children.filter(o => o.material && o.material.uniforms && o.material.uniforms.map && o.material.uniforms.map.value === TW.ST.atlas.tex && !o.parent.isProp);
  check('the street is a few draw calls (street, skylines, sky, beacons, boom)', streetMeshes.length <= 5, streetMeshes.length + ' static street meshes');
  const litTris = run('ST.lit.tris'), skyTris = run('ST.sky.tris');
  check('street + skylines under the triangle budget', litTris + skyTris < 60000, `${litTris} street + ${skyTris} skyline tris`);
  const baked = TW.scene.children.filter(o => o.geometry && o.geometry.attributes && o.geometry.attributes.bake);
  const lit = baked.filter(o => !o.material.uniforms.uEmissive.value);
  check('static geometry carries baked light (bar + street)', lit.length >= 3 && lit.every(o => o.material.uniforms.uBaked.value === 1), lit.length + ' baked meshes');
  check('the gas lamps are all baked in (more than the 6 live lights)', TW.ST.lamps.length > 6, TW.ST.lamps.length + ' street lights');

  // ---- the door: shut during the bar fight, walkable once it swings open
  run('startGame()'); step(2);
  const out = V(0, 0, 5.1); TW.keepInWalk(out, 0.3);
  check('door shut: you can\'t walk out of the bar', out.z < 5, 'z ' + out.z.toFixed(2));
  run(`game.state = 'won'; game.timer = 0; clearEnemies();`); step(Math.ceil(2.6 / DT) + Math.ceil(1.6 / DT));
  check('clearing the bar swings the door open', TW.DOOR.target === 1 && TW.DOOR.open > 0.9, 'open ' + TW.DOOR.open.toFixed(2));
  const thru = V(0, 0, 6.5); TW.keepInWalk(thru, 0.3);
  check('door open: the doorway leads onto the square', Math.abs(thru.z - 6.5) < 1e-9);
  const jamb = V(1.4, 0, 5.1); TW.keepInWalk(jamb, 0.3);
  check('but not through the wall beside it', jamb.z < 4.9 || jamb.z > 5.6, `z ${jamb.z.toFixed(2)}`);
  TW.rig.position.set(0, 0, 3.5); run('desk.yaw = Math.PI; desk.pitch = 0;'); key('keydown', 'KeyW');
  step(Math.ceil(2.4 / DT)); key('keyup', 'KeyW');
  check('walking out of the door starts the street', TW.level.name === 'street' && TW.player.head.z > 5.3, `level ${TW.level.name}, z ${TW.player.head.z.toFixed(2)}`);
  check('outside, the live lights are the nearest street lamps', run('SU.uAmbient.value.x') === S.light.ambient[0] && run('SU.uLightRad.value').some(r => r > 6), 'ambient ' + run('SU.uAmbient.value.x'));
  check('the street keeps its outdoor fog even seen from inside the bar', TW.ST.litMesh.material.uniforms.uFogFar.value === S.fog.far && TW.ST.litMesh.material.uniforms.uFogFar !== run('SU.uFogFar'));
  check('the fog opens up outside', run('SU.uFogFar.value') > TW.CFG.render.fogFar + 10, 'far ' + run('SU.uFogFar.value').toFixed(1));

  // ---- walls and crossings
  const wallP = V(15, 0, 8); TW.pushOutXZ(wallP, 0.3);
  check('the square\'s buildings are walls', wallP.x < 13, 'x ' + wallP.x.toFixed(2));
  let p = V(-11, 0, 14.5); for (let i = 0; i < 200; i++) { p.x -= 0.05; TW.keepInWalk(p, 0.32); }
  check('goons can come in from the side roads (rectangles overlap)', p.x < -15, 'x ' + p.x.toFixed(2));
  const roadP = V(0, 0, 40); TW.keepInWalk(roadP, 0.3); const roadW = V(6, 0, 40); TW.keepInWalk(roadW, 0.3);
  check('the road is walkable and walled', roadP.z === 40 && roadW.x < 4.5, 'x ' + roadW.x.toFixed(2));
  const pastBoom = V(0, 0, 60); TW.keepInWalk(pastBoom, 0.3);
  check('the boom closes the road', pastBoom.z < TW.STREET.chk.z);
  // a ragdoll particle thrown at a street wall stops there (and the impact counts)
  const b = new (run('Body'))('prop', { isProp: true }); const q = b.add('c', V(3.6, 1, 34), 0.1, 1); q.v.set(9, 0, 0);
  for (let i = 0; i < 30; i++) run('physicsStep(1 / 120)');
  check('ragdolls hit the street walls', q.x.x < 4.5, 'x ' + q.x.x.toFixed(2));
  b.remove();

  // ---- encounters: trigger, arena lock, spawns, clear, lose + respawn, finish
  run('startStreet(false)'); step(2);
  check('starting in the street puts you outside the door, facing the road', TW.player.head.z > 6 && TW.player.head.z < 9 && TW.game.state === 'walk', 'z ' + TW.player.head.z.toFixed(2));
  check('street props are placed (crates, bins, signs)', ['crate', 'bin', 'sign'].every(t => TW.props.some(pp => pp.type === t)), TW.props.filter(pp => pp.type !== 'bottle' && pp.type !== 'stool').length + ' street props');
  TW.rig.position.set(0, 0, S.encounters[0].trigger + 0.4); step(4);
  check('walking into the square starts the first stretch', TW.level.encounter === 0 && ['intro', 'fight'].includes(TW.game.state), TW.game.state);
  step(Math.ceil((1 + S.spawnGap * 3) / DT));
  check('the first stretch spawns its goons', TW.enemies.length === S.encounters[0].spawn.length, TW.enemies.map(e => e.type).join(','));
  TW.rig.position.set(0, 0, 30); step(2);
  check('the arena holds you in until it\'s clear', TW.player.head.z <= S.encounters[0].arena[1], 'z ' + TW.player.head.z.toFixed(2));
  for (const e of TW.enemies) { e.hp = 0; e.knockdown(V(0, 0, 1), 'knockdown', true); }
  step(Math.ceil((S.clearedPause + 0.5) / DT));
  check('clearing it opens the street again', TW.game.state === 'walk' && !TW.level.arena, TW.game.state);
  TW.rig.position.set(0, 0, S.encounters[1].trigger + 0.4); step(Math.ceil(2.5 / DT));
  check('the road stretch starts further on', TW.level.encounter === 1 && TW.enemies.some(e => e.alive), TW.enemies.map(e => e.type).join(','));
  TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
  check('going down restarts the stretch, full health, at its start', TW.level.encounter === 1 && TW.player.hp === TW.CFG.player.health && Math.abs(TW.player.head.z - S.encounters[1].respawn[1]) < 0.6 && ['intro', 'fight'].includes(TW.game.state), `z ${TW.player.head.z.toFixed(2)} hp ${TW.player.hp}`);
  run('clearEnemies(); level.encounter = CFG.street.encounters.length - 1; level.arena = null; game.state = "walk";');
  TW.rig.position.set(0, 0, S.finishZ + 0.3); step(Math.ceil(2 / DT));
  check('walking up to the boom ends the level and lifts it', TW.game.state === 'won' && run('boomPivot.rotation.z') < -1, 'boom ' + run('boomPivot.rotation.z').toFixed(2));

  // ---- street props: pick up, swing, throw, break
  run('startStreet(false)'); step(2); TW.rig.position.set(0, 0, 12); step(2);
  run('level.encounter = 99'); step(1);
  const R = TW.hands.right;
  for (const t of ['crate', 'bin', 'sign']) {
    const pr = TW.props.find(pp => pp.type === t);
    run('pickUp')(R, pr); step(3);
    const held = R.held === pr && pr.body.ps.every(pp => pp.pin) && pr.grabPoint(V()).distanceTo(R.fist) < 0.6;
    run('releaseHeld')(R, true); step(2);
    check(`a ${t} can be picked up and thrown`, held && !R.held && pr.body.ps.every(pp => !pp.pin), t);
  }
  run('clearEnemies()');
  const g = new TW.Enemy('boso'); g.placeAt(0, 13.5, Math.PI); g.cooldown = 1e9; TW.enemies.push(g); step(30);
  const crate = new TW.Prop('crate', V(0, 1.2, 12.6)); crate.body.sleep = false;
  crate.thrown = true; crate.releasedAt = run('NOW'); for (const pp of crate.body.ps) pp.v.set(0, 0, 7);
  const hp0 = g.hp; step(40);
  check('a thrown crate hurts a goon', g.hp < hp0, `hp ${hp0} -> ${g.hp.toFixed(0)}`);
  const c2 = new TW.Prop('crate', V(-2, 0, 10)); c2.damage(c2.hitPoint(V())); const alive1 = c2.alive; c2.damage(c2.hitPoint(V()));
  check('a crate breaks after two hits, a bin never does', alive1 && !c2.alive && TW.CFG.weapons.bin.durability > 50);
  const sign = TW.props.find(pp => pp.type === 'sign');
  check('a street sign swings long (reach like Bat Boy\'s bat)', TW.CFG.weapons.sign.reach >= TW.CFG.weapons.bat.reach && sign.hitPoint(V()).distanceTo(sign.grabPoint(V())) > 0.6);
  // physics cost out here (more walls and boxes than the bar, but filed by z band)
  run('clearEnemies(); startStreet(false)'); TW.rig.position.set(0, 0, 30);
  for (const t of ['boxer', 'batboy', 'cook', 'wrestler']) { const e = new TW.Enemy(t); e.placeAt(rnd() * 6 - 3, 32 + rnd() * 6, 0); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('street physics cost per frame (4 goons + street props, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
  // LOD stand-ins and portals
  check('far buildings are cheap lit stand-ins, always drawn (no black edge)', TW.ST.farBlocks > 500 && TW.ST.skylineMesh.frustumCulled === false, TW.ST.farBlocks + ' stand-ins');
  run('startStreet(false); level.encounter = 99'); TW.rig.position.set(0, 0, 12); run('desk.yaw = Math.PI'); step(3);
  check('outside facing away from the door: the bar isn\'t drawn', TW.ST.barGroup.length >= 3 && TW.ST.barGroup.every(o => !o.visible) && TW.ST.litMesh.visible);
  run('desk.yaw = 0'); step(3);
  check('outside facing the open door: the bar is drawn through it', TW.ST.barGroup.every(o => o.visible));
  run('startGame()'); TW.rig.position.set(0, 0, 0); run('desk.yaw = Math.PI'); step(3);
  check('inside with the door shut: the street, skylines and sky aren\'t drawn', TW.ST.streetGroup.every(o => !o.visible) && TW.ST.barGroup.every(o => o.visible));
  const bm = TW.ST.barMesh;
  check('the whole bar room is one mesh on one atlas', bm && bm.material.uniforms.uAtlas.value === 1 && bm.geometry.attributes.arect && TW.ST.barGroup.length <= 5, TW.ST.barGroup.length + ' bar meshes');
  step(2);
  const batches = [...run('propBatches').values()].filter(b => b.mesh.visible);
  const stoolVerts = TW.props.filter(q => q.type === 'stool' && q.shown).reduce((n, q) => n + q.obj.geometry.attributes.position.count, 0);
  check('stools and street props are drawn in one batch per material', batches.length >= 1 && batches.length <= 2 && TW.props.filter(q => q.batched).every(q => !q.obj.visible) && batches.some(b => b.count === stoolVerts), batches.map(b => b.count + ' verts').join(', '));
  // back inside: the bar's own lights again
  run('startGame()'); TW.rig.position.set(0, 0, 0); step(3);
  check('inside the bar the live lights are the bar\'s six again', Math.abs(run('SU.uAmbient.value.x') - 0.2) < 1e-9 && TW.level.name === 'bar');
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} street checks pass`);
process.exitCode = fails ? 1 : 0;
