// Headless checks for Act 1's walk into Krasnovia: past the checkpoint (no cut), through the Krasnovian gate, the arch,
// and Superblock 14's courtyard up to podezd 3. Krasnovian goons only.
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
const S = TW.SB, C = TW.CFG.superblock, SBX = TW.SBX;
const at = (x, z, yaw) => { TW.rig.position.set(x, 0, z); run(`desk.yaw = ${yaw}; desk.pitch = 0;`); };   // yaw PI faces +z (toward Krasnovia)
const walk = (x, z) => { const p = V(x, 0, z); TW.keepInWalk(p, 0.3); return [p.x, p.z]; };
const KRAS = new Set(['conscript', 'laborer', 'wrestler', 'cook', 'ivan', 'volkov']);
const kill = () => { for (const e of TW.enemies) { e.hp = 0; e.knockdown(V(0, 0, 1), 'knockdown', true); } };

els.deskBtn.fire('click');
step(3);
try {
  // ---- the build: one baked mesh on the street atlas, nothing from the far city or skylines on top of it
  check('Superblock 14 is one mesh on the street atlas, light baked in', SBX.mesh && SBX.mesh.geometry.attributes.bake && SBX.mesh.material.uniforms.uBaked.value === 1);
  check('its triangles stay within budget', SBX.acc.tris + SBX.tris.gate + SBX.tris.yard < 16000, `${SBX.acc.tris} shell + ${SBX.tris.gate} gate + ${SBX.tris.yard} yard`);
  check('the shell, drawn from everywhere outside, stays lean (< 3200: it was 7270 with the ground and the yard in it)', SBX.tris.base < 3200 && SBX.tris.gate < 4000 && SBX.tris.yard < 4000, JSON.stringify(SBX.tris));
  { const far = (x, y, z) => run(`sbSeen(SBX.yard, { x: ${x}, y: ${y}, z: ${z} }) || sbSeen(SBX.gate, { x: ${x}, y: ${y}, z: ${z} })`), near = (k, x, y, z) => run(`sbSeen(SBX.${k}, { x: ${x}, y: ${y}, z: ${z} })`);
    check('the gate and the yard are the shell\'s children, culled by three when out of view, and hidden past the fog (Parade Square, the Tower) but drawn from the street, the gate, the yard and the wing roof',
      SBX.gate.parent === SBX.mesh && SBX.yard.parent === SBX.mesh && SBX.gate.frustumCulled && SBX.yard.frustumCulled && !SBX.mesh.frustumCulled
      && !far(-190, 1.7, 198) && !far(-234, 115, 190) && near('gate', 0, 1.7, 20) && near('gate', -3, 1.7, 62) && near('yard', -20, 1.7, 100) && near('yard', -30, 35.2, 121) && near('gate', -30, 35.2, 121)); }
  check('its lamps are baked (gate, forecourt, arch, courtyard, the door)', SBX.lamps.length >= 9, SBX.lamps.length + ' lights');
  { const P = TW.ST.skylineMesh.geometry.attributes.position.array, R = S.rect; let n = 0;
    for (let i = 0; i < P.length; i += 3) if (P[i + 1] > 0.5 && P[i] > R[0] && P[i] < R[1] && P[i + 2] > R[2] && P[i + 2] < R[3]) n++;
    check('no skyline slab or far-city block sits on the superblock', n === 0, n + ' vertices'); }
  check('every goon in every fight here is Krasnovian', C.encounters.every(E => E.spawn.every(s => KRAS.has(s[0]))), C.encounters.map(E => E.spawn.map(s => s[0]).join('+')).join(' | '));

  // ---- from the street, no cut: clear the street, walk through the boom, keep walking
  run('startStreet(false)'); step(2);
  run('clearEnemies(); level.encounter = CFG.street.encounters.length - 1; level.arena = null; game.state = "walk";');
  at(0, TW.CFG.street.finishZ + 0.3, Math.PI); step(Math.ceil(2 / DT));
  const wonStreet = TW.game.state === 'won';
  at(-1, TW.STREET.chk.z + TW.CFG.street.exitPast + 0.6, Math.PI); step(3);
  const z0 = TW.player.head.z;
  check('walking on past the lifted boom puts you in Krasnovia\'s level, right where you are', wonStreet && TW.level.name === 'superblock' && Math.abs(z0 - (TW.STREET.chk.z + TW.CFG.street.exitPast + 0.6)) < 0.5, `${TW.level.name} z ${z0.toFixed(1)}`);
  check('the street\'s props stay behind; the superblock\'s are stocked', TW.props.length === C.props.length && TW.props.every(p => p.body.ps[0].x.z > 70), TW.props.length + ' props');
  check('the boom stays up behind you', run('boomPivot.rotation.z') < -1.2, run('boomPivot.rotation.z').toFixed(2));

  // ---- where you can walk
  run('level.encounter = 99');
  let [x, z] = walk(-3, 64);
  check('the Ring Road is walkable past the boom', Math.abs(x + 3) < 1e-9 && Math.abs(z - 64) < 1e-9);
  [x, z] = walk(-4.6, S.gateZ + 0.3);
  check('the Krasnovian gate is a way through', Math.abs(z - (S.gateZ + 0.3)) < 1e-9, `${x.toFixed(2)}, ${z.toFixed(2)}`);
  [x, z] = walk(-20, S.gateZ + 0.3);
  check('but the wall either side of it is not', Math.abs(x + 20) > 0.5 || Math.abs(z - (S.gateZ + 0.3)) > 0.3, `${x.toFixed(2)}, ${z.toFixed(2)}`);
  [x, z] = walk(2.4, 76);
  check('the Columbian lane beyond the Accords wall is shut', x < 0 || z < S.gateZ, `${x.toFixed(2)}, ${z.toFixed(2)}`);
  [x, z] = walk(-19.8, 89);
  check('the arch through the slab is a way through', Math.abs(x + 19.8) < 1e-9 && Math.abs(z - 89) < 1e-9);
  [x, z] = walk(-30, 89);
  check('the slab beside it is solid', Math.abs(z - 89) > 2 || Math.abs(x + 30) > 2, `${x.toFixed(2)}, ${z.toFixed(2)}`);
  [x, z] = walk(-6, 105);
  check('the garages wall the courtyard\'s east side', x < S.garages[0], `x ${x.toFixed(2)}`);
  { const p = V(-27, 0, 104); TW.pushOutXZ(p, 0.3); check('the rocket is solid', Math.hypot(p.x + 27, p.z - 104) > 0.9, `${p.x.toFixed(2)}, ${p.z.toFixed(2)}`); }
  const solidAt = (x, z, r = 0.3) => TW.BLOCKERS.some(b => b.y1 === undefined && x > b.x0 - r && x < b.x1 + r && z > b.z0 - r && z < b.z1 + r);
  { const P = S.portal, mx = (P.w[0] + P.w[1]) / 2, ex = (P.e[0] + P.e[1]) / 2, pz = (P.z[0] + P.z[1]) / 2, [b0, b1, c0, c1] = S.booth;
    check('the border post is solid where it stands: both pylons, the sentry box, the boom\'s post, the floodlight mast',
      solidAt(mx, pz, 0) && solidAt(ex, pz, 0) && solidAt((b0 + b1) / 2, (c0 + c1) / 2, 0) && solidAt(S.mast[0], S.mast[1], 0));
    const line = []; for (let xx = P.w[1] + 0.35; xx <= P.e[0] - 0.35; xx += 0.25) for (let zz = 62; zz <= S.gateZ + 8; zz += 0.2) if (solidAt(xx, zz)) line.push(`${xx.toFixed(1)},${zz.toFixed(1)}`);
    check('but the lane through it stays clear, wall to wall between the pylons from the Ring Road to the forecourt (goons walk straight: nothing in this choke point to jam them on)', !line.length, line.slice(0, 4).join(' ')); }
  check('the yard\'s pieces are solid: the saloon, the carpet\'s rail, the rocket\'s lamp post, the bench by the door, the pigeon loft\'s garages',
    solidAt(S.car[0], S.car[1], 0) && solidAt(S.carpet[0], S.carpet[1], 0) && solidAt(S.mercury[0], S.mercury[1], 0) && solidAt(-16.4, 117.5, 0) && solidAt(-6, 113.5, 0));
  { const bad = [];
    for (const E of C.encounters) for (const [t, x, z] of E.spawn) if (solidAt(x, z, 0.25)) bad.push(`${E.name}:${t}@${x},${z}`);
    for (const [t, x, z] of C.props) if (t !== 'bottle' && solidAt(x, z, 0.15)) bad.push(`prop ${t}@${x},${z}`);   // (the bottles stand on the benches)
    check('every goon and every prop out here starts clear of the furniture', !bad.length, bad.join(' ')); }
  { const [ax0, ax1] = S.arch, snag = []; for (let xx = -30; xx <= -1; xx += 0.25) for (let zz = 84.6; zz <= 85.7; zz += 0.25) if (solidAt(xx, zz, 0) && Math.abs(xx + 6.2) > 0.4) snag.push(`${xx},${zz}`);
    for (let xx = ax0 + 0.2; xx <= ax1 - 0.2; xx += 0.2) for (let zz = 85; zz <= 93; zz += 0.25) if (solidAt(xx, zz, 0.1)) snag.push(`${xx.toFixed(1)},${zz}`);
    check('the forecourt\'s edge along the slab and the arch\'s mouth stay clear (nothing to catch on where the forecourt turns into the arch)', !snag.length, snag.slice(0, 4).join(' ')); }
  { const blocked = []; for (let zz = 92.6; zz <= 115.5; zz += 0.25) if (solidAt(-19.8, zz)) blocked.push(zz); for (let xx = -19.8; xx <= -13; xx += 0.25) if (solidAt(xx, 115.8)) blocked.push('x' + xx);
    check('the way from the arch to podezd 3\'s door stays clear (up the path, along the front)', !blocked.length, blocked.slice(0, 4).join(', ')); }
  { const north = (x) => ((-20 - x - 1.5) / 3) % 1, point = (x) => ((-6 - x - 1.5) / 3) % 1;
    check('inside matches outside: podezd 3\'s kitchen windows on the 7th sit on the north wing\'s window bays (lit from the yard), the landing\'s on the point block\'s',
      TW.PZ.kitWin.every(x => Math.abs(north(x)) < 1e-9) && [-16.5, -13.5, -10.5].every(x => Math.abs(point(x)) < 1e-9)); }

  // ---- the fights, in order
  run('clearEnemies(); startSuperblock(false)'); step(2);
  check('starting here puts you just past the boom, facing the gate', TW.level.name === 'superblock' && TW.game.state === 'walk' && Math.abs(TW.player.head.z - C.start[1]) < 0.6, 'z ' + TW.player.head.z.toFixed(2));
  for (const [i, E] of C.encounters.entries()) {
    at(E.respawn[0], E.trigger + 0.4, Math.PI); step(Math.ceil((1 + C.spawnGap * (E.spawn.length + 1)) / DT));
    check(`${E.name}: walking in starts the fight with its whole crew`, TW.level.encounter === i && TW.enemies.length === E.spawn.length, TW.enemies.map(e => e.type).join(','));
    at(E.respawn[0], E.arena[1] + 4, Math.PI); step(2);
    check(`${E.name}: it holds you until it's clear`, TW.player.head.z <= E.arena[1] + 1e-6, 'z ' + TW.player.head.z.toFixed(2));
    if (i === 1) {
      TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
      check('going down restarts the courtyard fight at its start, full health', TW.level.encounter === 1 && TW.player.hp === TW.CFG.player.health && Math.abs(TW.player.head.z - E.respawn[1]) < 0.6, `z ${TW.player.head.z.toFixed(2)}`);
      step(Math.ceil((C.spawnGap * (E.spawn.length + 1)) / DT));
    }
    kill(); step(Math.ceil((C.clearedPause + 0.5) / DT));
    check(`${E.name}: clearing it opens the way on`, TW.game.state === 'walk' && !TW.level.arena, TW.game.state);
  }
  at(S.door[0], C.finishZ + 0.6, Math.PI); step(4);
  check('walking up to podezd 3 ends the level (the stairwell is next)', TW.game.state === 'won', TW.game.state);

  // ---- physics cost in the courtyard (posts, rocket, benches, garages filed by z band)
  run('clearEnemies(); level.encounter = 99'); at(-20, 100, Math.PI);
  for (const t of ['conscript', 'laborer', 'wrestler', 'cook']) { const e = new TW.Enemy(t); e.placeAt(-24 + rnd() * 8, 104 + rnd() * 6, 0); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('courtyard physics cost per frame (4 goons + props, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} superblock checks pass`);
process.exitCode = fails ? 1 : 0;
