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
require('./load.js')(ctx);
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
  const tiles = TW.ST.farTileMeshes || [];   // (the far city's tiles: one mesh's buffers drawn in pieces, checked below)
  const streetMeshes = TW.scene.children.filter(o => o.material && o.material.uniforms && o.material.uniforms.map && o.material.uniforms.map.value === TW.ST.atlas.tex && !o.parent.isProp && !o.userData.small && !tiles.includes(o));   // small: set pieces drawn only while they're on (the train, the crossing lamps)
  { const G = TW.ST.skylineMesh.geometry, P = G.attributes.position.array, nv = G.attributes.position.count, base = G.drawRange ? G.drawRange.count : TW.ST.farTiles[0][0];
    let covered = base, inside = true, shared = true, prev = base;
    for (const m of tiles) { const [s, c] = m.geometry.userData.range, { center: o, radius: r } = m.geometry.userData;
      if (s !== prev) covered = -1; prev = s + c; covered += c;
      for (const k of ['position', 'normal', 'uv', 'bake']) if (m.geometry.attributes[k] !== G.attributes[k]) shared = false;
      for (let i = s * 3; i < (s + c) * 3; i += 3) if (Math.hypot(P[i] - o.x, P[i + 1] - o.y, P[i + 2] - o.z) > r) inside = false; }
    check('the far city is drawn in tiles over the skyline mesh\'s own buffers (no copies) that three culls when they\'re out of view; with the skylines they draw every vertex once',
      tiles.length >= 8 && tiles.length <= 40 && covered === nv && shared && inside && tiles.every(m => m.frustumCulled && m.material === TW.ST.skylineMesh.material && TW.ROOMS.get('outside').meshes.has(m)) && TW.ST.skylineMesh.frustumCulled === false,
      `${tiles.length} tiles, ${nv - base} of ${nv} vertices`); }
  { const nL = Object.keys(TW.LEVELS).length;
    check('the outdoor levels are a few meshes (street, skylines, sky, beacons, and at most two per level after the street)', streetMeshes.length <= 5 + 2 * nL, streetMeshes.length + ' static meshes for ' + nL + ' levels'); }
  const litTris = run('ST.lit.tris'), skyTris = run('ST.sky.tris');
  check('street + skylines under the triangle budget', litTris + skyTris < 80000, `${litTris} street + ${skyTris} skyline tris`);
  // ---- the skylines: the scale ladder, the moving lights, the Halcyon, all inside the camera's reach
  { const SKY = run('SKY'), H = SKY.heights, towerTop = run('typeof TWR !== "undefined" ? TWR.spire : 252'), far = TW.CFG.render.camFar;
    check('the skylines\' own share stays lean (big texture repeats, not geometry)', TW.ST.skylineTris < 16000, TW.ST.skylineTris + ' tris (was 16744 before the pass)');
    check('the scale ladder: Aoki > Civic Harmony\'s mast > the Tower of Labor > Liberty Avenue\'s ridge', H.aoki >= 390 && H.civic >= 300 && H.aoki > H.civic + 50 && H.civic > towerTop + 40 && H.ridge < towerTop,
      `Aoki ${H.aoki} m, Civic Harmony ${H.civic} m, Tower of Labor ${towerTop} m, ridge ${H.ridge.toFixed(0)} m`);
    const P = TW.ST.skylineMesh.geometry.attributes.position.array; let top = 0, at = null;
    for (let i = 1; i < P.length; i += 3) if (P[i] > top) { top = P[i]; at = [P[i - 1], P[i + 1]]; }
    check('Aoki Development is the tallest thing in the city', Math.abs(top - SKY.aoki.top) < 0.5 && Math.hypot(at[0] - SKY.aoki.at[0], at[1] - SKY.aoki.at[1]) < 5, `top ${top.toFixed(1)} m at ${at.map(v => v.toFixed(0))}`);
    const eye = { square: [0, 1.6, 15], door: [2, 1.6, 7], crossing: [-40, 1.6, 140], parade: [-190, 1.6, 198], towerTop: [-230, 81.6, 198], towerCrown: [-234.6, 150, 198] };
    const reach = (p) => Object.entries(eye).map(([k, e]) => [k, Math.hypot(p[0] - e[0], p[1] - e[1], p[2] - e[2])]);
    const tip = [SKY.aoki.at[0], SKY.aoki.top, SKY.aoki.at[1]], mast = [SKY.civic.at[0], SKY.civic.top, SKY.civic.at[1]];
    check('Aoki\'s tip and Civic Harmony\'s mast are inside the camera\'s far plane from the square, the door, the crossing, Parade Square and the Tower\'s top',
      reach(tip).concat(reach(mast)).every(([, d]) => d < far * 0.97), reach(tip).map(([k, d]) => k + ' ' + d.toFixed(0)).join(', ') + ' (far ' + far + ')');
    const el = Math.atan2(352 - 1.6, Math.hypot(SKY.aoki.at[0], SKY.aoki.at[1] - 15)) * 180 / Math.PI;
    check('from Tripoint Square Aoki\'s crown stands high but doesn\'t swallow the sky', el > 40 && el < 62, el.toFixed(0) + '° up');
    const skyR = Math.max(...Array.from(TW.ST.skyMesh.geometry.attributes.position.array).reduce((a, v, i, A) => (i % 3 === 0 && a.push(Math.hypot(A[i], A[i + 1], A[i + 2])), a), []));
    check('the sky band fits inside the far plane (no dark disc overhead)', skyR < far * 0.97, skyR.toFixed(0) + ' m');
    // the moving lights and the zeppelin: children of the skyline mesh (hidden with it), one draw call each
    const BM = TW.ST.beamMesh, Z = run('ZEP'), beams = run('ST.beams');
    check('the moving lights are one small additive mesh riding on the skyline mesh', BM && BM.parent === TW.ST.skylineMesh && BM.geometry.attributes.position.count / 3 <= 120 && BM.material.depthWrite === false,
      (BM.geometry.attributes.position.count / 3) + ' tris');
    check('Columbia\'s gold searchlights: a few sweeping, two finding the zeppelin', beams.filter(b => !b.track).length >= 4 && beams.filter(b => b.track).length === 2, beams.length + ' beams');
    const snap = () => Array.from(BM.geometry.attributes.position.array);
    run('skyTick(12, 0, 1.6, 15)'); const a0 = snap(), z0 = Z.pos.slice(); run('skyTick(14, 0, 1.6, 15)'); const a1 = snap();
    const moved = beams.filter(b => !b.track).every((b, i) => { let d = 0; for (let k = i * 18; k < i * 18 + 18; k++) d = Math.max(d, Math.abs(a1[k] - a0[k])); return d > 1; });
    check('the searchlights sweep (a cheap per-frame tick)', moved);
    const zm = Z.mesh;
    check('the Halcyon: one fogged mesh on the skyline mesh, cheap', zm && zm.parent === TW.ST.skylineMesh && Z.tris < 450 && zm.material.uniforms.uFogOn.value === TW.CFG.street.skylineFog && zm.frustumCulled === false, Z.tris + ' tris');
    check('it flies (moved in the tick)', Math.hypot(Z.pos[0] - z0[0], Z.pos[2] - z0[2]) > 2 && zm.position.x === Z.pos[0], `${Math.hypot(Z.pos[0] - z0[0], Z.pos[2] - z0[2]).toFixed(1)} m in 2 s`);
    let low = 1e9, near = 1e9, out = 0, lapBack = 1e9;
    run('zepAt(0, ZEP.pos)'); const p0 = Z.pos.slice(); run('zepAt(' + Z.lap + ', ZEP.pos)'); lapBack = Math.hypot(Z.pos[0] - p0[0], Z.pos[2] - p0[2]);
    for (let t = 0; t < Z.lap; t += 2) {
      run(`ZEP.head = zepAt(${t}, ZEP.pos)`);
      low = Math.min(low, Z.pos[1] - Z.R - 8); near = Math.min(near, Math.hypot(Z.pos[0] - SKY.civic.at[0], Z.pos[2] - SKY.civic.at[1]));
      out = Math.max(out, ...reach(Z.pos).map(([, d]) => d));
    }
    check('it circles Liberty Avenue well above the crowns and never moors at Civic Harmony\'s mast', low > H.civic + 15 && low > H.ridge + 60 && near > 20 && Z.lap >= 180 && Z.lap <= 240 && lapBack < 1,
      `lowest point ${low.toFixed(0)} m, nearest the mast ${near.toFixed(0)} m, a lap every ${Z.lap} s`);
    check('it stays in view: inside the far plane from the square, the street, the crossing, Parade Square and the Tower\'s top all lap', out < far * 0.97, 'farthest ' + out.toFixed(0) + ' m');
    run('skyTick(30, 0, 1.6, 15)');
    const off = beams.map((b, i) => [b, i]).filter(([b]) => b.track).map(([b, i]) => {
      const A = a1.length && Array.from(BM.geometry.attributes.position.array), m = (j) => [0, 1, 2].map(c => A[i * 18 + j * 3 + c]);
      const base = m(0).map((v, c) => (v + m(1)[c]) / 2), end = m(2).map((v, c) => (v + m(5)[c]) / 2), d = end.map((v, c) => v - base[c]), w = Z.pos.map((v, c) => v - base[c]);
      return Math.acos((d[0] * w[0] + d[1] * w[1] + d[2] * w[2]) / Math.hypot(...d) / Math.hypot(...w)) * 180 / Math.PI;
    });
    check('the two tracking searchlights point at the hull', off.every(a => a < 20), off.map(a => a.toFixed(0) + '°').join(', '));
  }
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
  // ---- the bar's polish: the back bar, three windows, the brass Tripoint, the corners: still one mesh, in budget
  check('the bar room stays lean: one atlas mesh under 2,500 triangles', TW.roomTris() < 2500 && bm.geometry.attributes.position.count / 3 === TW.roomTris(), TW.roomTris() + ' tris (960 before the polish)');
  {
    const p0 = Array.from(bm.geometry.attributes.position.array); step(30);
    const p1 = bm.geometry.attributes.position.array, F = run('BAR_FAN'), moved = [];
    for (let i = 0; i < p0.length; i++) if (p0[i] !== p1[i]) moved.push(i);
    check('the ceiling fan turns inside the bar\'s one mesh (only its blades move; no extra draw call)', F.n === 24 && moved.length > 0 && moved.every(i => i >= F.i0 * 3 && i < (F.i0 + F.n) * 3) && TW.ST.barGroup.length <= 5, moved.length + ' floats moved');
  }
  {
    const solids = run('BAR_SOLIDS'), have = (B) => TW.WORLD_BOXES.some(W => W.every((v, i) => v === B[i]));
    const blocked = (x, z) => { const q = V(x, 0, z); TW.pushOutXZ(q, 0.2); return Math.hypot(q.x - x, q.z - z) > 0.05; };
    check('the corner furniture is solid: booth, chess table, pachinko and the back counter stop you and goons, and props collide with them',
      solids.every(have) && [[4.4, 4.05], [-4.2, 3.55], [-4.8, -3.9], [0, -4.9]].every(([x, z]) => blocked(x, z)));
    // the fight floor and the walk behind the bar stay clear: the spawn by the door, where goons gather, the start, behind the bar
    const free = [[0, 4.4], [-2.2, 1.6], [2.2, 3.2], [0, 2.4], [0, -1.4], [-1.2, -2.4], [1.2, -2.4], [3.6, -3.7], [3.6, -4.3], [4.2, -4.3], [0, -4.3], [-3.6, -4.3], [-2, -4.36], [2, -4.36], [4.2, 2.85]];
    check('the fight floor, the door\'s spawn, the start and the walk behind the bar (0.83 m: goons fit, 0.64) stay clear', free.every(([x, z]) => !blocked(x, z)),
      free.filter(([x, z]) => blocked(x, z)).map(a => a.join(',')).join(' '));
    const T = run('TRIPOINT'), L = run('BAR_LINES');
    check('the three brass Accords lines come in under the door and meet at the Tripoint disc, where you start', Math.hypot(T.x, T.z + 1.4) < T.r && L.length === 3 && L[0][0] === 0 && L[0][1] > 4.9 && L.slice(1).every(([x]) => Math.abs(x) > 4.9));
    run('clearEnemies(); stockProps();');
    const b1 = new TW.Prop('bottle', V(4.4, 1.2, 4.1)), b2 = new TW.Prop('bottle', V(-4.1, 1.2, 3.45)); b1.body.wake(); b2.body.wake(); step(150);
    const bottom = (b) => Math.min(...b.body.ps.map(q => q.x.y - q.r));
    check('a bottle set down on the diner booth\'s table or the chess table rests on it', Math.abs(bottom(b1) - 0.77) < 0.05 && Math.abs(bottom(b2) - 0.74) < 0.05, bottom(b1).toFixed(2) + ' / ' + bottom(b2).toFixed(2));
    run('stockProps();');
  }
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
