// Headless checks for the Palace of Sport: off the cradle through the gap in the railway fence (no cut), the level crossing
// and the train, the boulevard, the foyer, the gym, the players' tunnel, Volkov in the ring, out the north doors.
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
const walkTo = (x, z, sp = 0.035, n = 2000) => {   // walk in small steps (the walk rects, floors and fight walls apply, like the keyboard)
  for (let k = 0; k < n; k++) {
    const dx = x - TW.rig.position.x, dz = z - TW.rig.position.z, d = Math.hypot(dx, dz); if (d < 0.02) break;
    const s = Math.min(sp, d); TW.rig.position.x += dx / d * s; TW.rig.position.z += dz / d * s;
    const p = V(TW.rig.position.x, TW.rig.position.y, TW.rig.position.z); TW.keepInWalk(p, 0.3); ctx.keepPlayerIn(p, 0.3); TW.rig.position.x = p.x; TW.rig.position.z = p.z; frame();
  }
};
const until = (f, n = 3000) => { for (let i = 0; i < n && !f(); i++) frame(); return f(); };
const fightClear = () => { until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900); kill(); until(() => TW.game.state === 'walk', 600); };

els.deskBtn.fire('click');

els.deskBtn.fire('click');
step(3);
const clearAll = () => { for (let k = 0; k < 8; k++) { until(() => TW.game.state !== 'fight' || !TW.game.queue.length, 900); kill(); if (until(() => TW.game.state === 'walk', 400)) return true; } return false; };
const PL = run('PL'), TR = run('TRAIN'), P = TW.CFG.palace;
const KR = new Set([...KRAS, 'gymnast', 'guard', 'bandsman']);
try {
  // ---- the build
  check('the Palace is one baked inside mesh + one baked outside mesh, a four-car train and two barriers', PL.inMesh.geometry.attributes.bake && PL.outMesh.geometry.attributes.bake && TR.cars.length === 4 && TR.booms.length === 2);
  check('their triangles stay within budget', PL.inTris + PL.outTris < 16000, `${PL.inTris} inside + ${PL.outTris} outside`);
  check('every goon in every fight here is Krasnovian', P.encounters.every(E => E.spawn.every(s => KR.has(s[0]))), P.encounters.map(E => E.spawn.map(s => s[0]).join('/')).join(', '));
  { const Pp = TW.ST.skylineMesh.geometry.attributes.position.array; let n = 0;
    for (const R of [PL.rect, PL.rail]) for (let i = 0; i < Pp.length; i += 3) if (Pp[i + 1] > 0.5 && Pp[i] > R[0] && Pp[i] < R[1] && Pp[i + 2] > R[2] && Pp[i + 2] < R[3]) n++;
    check('no far-city block sits on the Palace\'s ground or the railway west', n === 0, n + ' vertices'); }

  // ---- off the cradle, through the gap in the fence (no cut)
  run('startPodezd(false); resetPodezdRides("roof"); CRADLE.phase = "bottom"; CRADLE.y = 0; CRADLE.rect.y = 0; placeRides(); level.encounter = CFG.podezd.encounters.length - 1; game.state = "won";');
  TW.rig.position.set(-40, 0, 134.5); face(Math.PI); step(3);
  const x0 = TW.rig.position.x;
  walkTo(-40, 137.9);
  check('from the railway bank you walk straight into the Palace level (no cut)', TW.level.name === 'palace' && TW.player.head.z > PL.fenceZ && Math.abs(TW.rig.position.x - x0) < 0.01, `${TW.level.name} z ${TW.player.head.z.toFixed(2)}`);
  check('the crossing is shut: barriers down, lamps wig-wagging, bells', !TR.open && TR.phase === 'warn' && TR.lift === 0 && (TR.lampA.visible || TR.lampB.visible));
  walkTo(-40, 145, 0.035, 90);
  check('you can\'t cross while it\'s down', TW.player.head.z < PL.barS, 'z ' + TW.player.head.z.toFixed(2));
  let seen = 0, passed = false;
  until(() => { seen = Math.max(seen, TR.cars.filter(m => m.visible).length); if (TR.cars.every(m => m.position.x + 18 < PL.gap[0])) passed = true; return TR.open; }, 72 * 14);
  check('the evening electric comes out of the tunnel and past the crossing', seen >= 2 && passed, `${seen} cars in view at once`);
  check('then the barriers lift and the crossing opens', TR.open && TR.lift === 1 && TR.phase === 'open' && !TR.lampA.visible && !TR.lampB.visible, TR.phase);
  walkTo(-40, 153);
  check('across the tracks to the boulevard', TW.player.head.z > 152, 'z ' + TW.player.head.z.toFixed(2));

  // ---- the boulevard
  walkTo(-40, 158); until(() => TW.level.encounter === 0, 60);
  check('the boulevard fight starts', TW.level.encounter === 0, TW.game.state);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('its crew is all there', TW.enemies.length === P.encounters[0].spawn.length, TW.enemies.map(e => e.type).join(','));
  clearAll();
  walkTo(-46, 178.5); walkTo(-46, 183);
  check('the glass front is a wall: in through the doors only', TW.player.head.z < PL.foyer[2], 'z ' + TW.player.head.z.toFixed(2));
  walkTo(-40, 179); walkTo(-40, 185);
  check('through the doors into the foyer', TW.player.head.z > 184 && TW.roomState.cur === 'palace', TW.roomState.cur);

  // ---- the gym
  walkTo(-40, 192); until(() => TW.level.encounter === 1, 60);
  check('the gym fight starts as you walk in', TW.level.encounter === 1);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('the gym crew spawns in the gym', TW.enemies.every(e => e.pos.z > PL.gym[2] && e.pos.z < PL.gym[3] && e.pos.x > PL.gym[0] && e.pos.x < PL.gym[1]), TW.enemies.map(e => e.pos.z.toFixed(1)).join(','));
  walkTo(-40, 186, 0.035, 200);
  check('you can\'t back out into the foyer mid-fight', TW.player.head.z > P.encounters[1].arena[0] - 0.05, 'z ' + TW.player.head.z.toFixed(2));
  clearAll();

  // ---- the players' tunnel, the arena, the Bear
  walkTo(-37.5, 193); walkTo(-37.5, 198.5); walkTo(-40, 199); walkTo(-40, 205); walkTo(-40, 215.5); until(() => TW.level.encounter === 2, 60);   // round the vaulting horse
  check('out of the tunnel onto the floor: Volkov', TW.level.encounter === 2, TW.game.state);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('the Bear is a boss with a bar, in the ring', TW.game.bosses.length === 1 && TW.enemies[0].type === 'volkov' && Math.abs(TW.enemies[0].pos.z - PL.ring[1]) < 3, TW.enemies.map(e => e.type).join(','));
  walkTo(-56, 226, 0.035, 500);
  check('the stands are a wall', TW.player.head.x > PL.floor[0], 'x ' + TW.player.head.x.toFixed(2));
  walkTo(-40, 246, 0.035, 500);
  check('the north doors are shut while he\'s up', TW.player.head.z < PL.floor[3] && PL.shutter.visible, 'z ' + TW.player.head.z.toFixed(2));
  TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
  check('going down puts you back at the tunnel mouth for another go', TW.level.encounter === 2 && TW.player.head.z < 214, 'z ' + TW.player.head.z.toFixed(2));
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  { const b = TW.enemies[0]; b.hp = b.maxHp * 0.4; step(3); check('he loses it at half health', b.enraged === true); }
  clearAll();
  check('down: the shutter goes up', !PL.shutter.visible);
  walkTo(-40, 241); walkTo(-40, 251.6); step(3);
  check('out the north doors: the Palace is done', TW.game.state === 'won', TW.game.state);
  walkTo(-40, 253.6);
  check('and the way on to Parade Square is open', TW.player.head.z > 253.2 && (!TW.LEVELS.parade || TW.level.name === 'parade'), `${TW.level.name} z ${TW.player.head.z.toFixed(2)}`);

  // ---- rooms
  run('startPalace(false); level.encounter = 99'); TW.rig.position.set(-40, 0, 226); face(Math.PI / 2); step(3);
  check('in the arena (facing the stands) only the inside is drawn', TW.roomState.cur === 'palace' && PL.inMesh.visible && !PL.outMesh.visible && !TW.ST.skylineMesh.visible, TW.roomState.cur);
  TW.rig.position.set(-40, 0, 176); face(Math.PI); step(3);
  check('on the forecourt facing the doors: the outside, and the foyer through them', TW.roomState.cur === 'outside' && PL.outMesh.visible && PL.inMesh.visible, TW.roomState.cur);
  check('starting here from the menu: in the gap in the fence, the train coming', TW.level.name === 'palace' && TR.phase !== 'gone' && !TR.open);

  // ---- physics cost in the gym (four goons)
  run('clearEnemies(); level.encounter = 99'); TW.rig.position.set(-40, 0, 192); step(3);
  for (const t of ['conscript', 'laborer', 'wrestler', 'conscript']) { const e = new TW.Enemy(t); e.placeAt(-46 + rnd() * 12, 193 + rnd() * 5, 0, 0); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('gym physics cost per frame (4 goons, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} palace checks pass`);
process.exitCode = fails ? 1 : 0;
