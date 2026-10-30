// Headless smoke test: loads the real game script against the Three stub and plays it with a simple bot.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const THREE = require('./three_stub.js');
const dir = path.join(__dirname, '..');
const SEED = Number(process.argv[2] || 1);
const VERBOSE = process.argv.includes('-v');
const MODE = (process.argv.find(a => a.startsWith('--mode=')) || '--mode=aggro').slice(7);
const PUNCH_GAP = MODE === 'aggro' ? 0.3 : MODE === 'sloppy' ? 0.9 : 1e9;
const BLOCK_P = MODE === 'passive' ? 0.5 : 1.0;

// deterministic Math.random
let seed = SEED * 9301 + 49297;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

let clock = 0;
const listeners = {};
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {},
  addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, fire(t, e) { for (const f of this._l[t] || []) f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info']) els[id] = mkEl(id);
const documentStub = {
  pointerLockElement: null, _l: {},
  getElementById: (id) => els[id],
  addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); },
};
els.c.requestPointerLock = () => { documentStub.pointerLockElement = els.c; for (const f of documentStub._l.pointerlockchange || []) f(); };
class ImageStub { set src(v) { this._src = v; this.width = 40; this.height = 16; if (this.onload) this.onload(); } get src() { return this._src; } }
const ctx = {
  THREE, console, Math: Object.create(Math), document: documentStub, navigator: {}, Image: ImageStub, innerWidth: 1280, innerHeight: 720,
  performance: { now: () => clock * 1000 }, addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); },
  setTimeout, Map, Set, Array, Object, Number, String, Float32Array, JSON,
};
ctx.Math.random = rnd;
ctx.window = ctx;
vm.createContext(ctx);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
vm.runInContext(inline, ctx, { filename: 'index.html' });
const run = (code) => vm.runInContext(code, ctx);
const key = (type, code, extra = {}) => { for (const f of listeners[type] || []) f(Object.assign({ code, repeat: false, shiftKey: false, preventDefault() {} }, extra)); };

// start desktop mode
els.deskBtn.fire('click');
const TW = ctx.__tw;
const stats = { tiers: {}, frames: 0, minHp: 100, errors: [], states: {}, waves: new Set(), grabs: 0, throws: 0, drinks: 0, blocks: 0, clinches: 0, parries: 0,
  catchTries: 0, throwBacks: 0, projHits: 0, tags: 0, enraged: [], waveTimes: [], lobs: 0, maxProps: 0 };
let lastWave = -1, waveStart = 0, catchState = null; const seenCarry = new Set(); let aimingAt = null;
let lastHitRef = null, punchSide = 0, punchT = 0, step = 0, blocking = false;
const DT = 1 / 60, MAX_T = Number(process.argv[3] || 240);

function aimAt(p) {
  const head = TW.player.head;
  const dx = p.x - head.x, dz = p.z - head.z, dy = p.y - head.y;
  run(`desk.yaw = ${Math.atan2(-dx, -dz)}; desk.pitch = ${Math.atan2(dy, Math.hypot(dx, dz))};`);
}
const press = (c, on) => { if (on && !run(`keys.has('${c}')`)) key('keydown', c); if (!on && run(`keys.has('${c}')`)) key('keyup', c); };

// scripted side tests at fixed times
const script = [
  { t: 1.0, f: () => { run(`(() => { const p = props.find(p => p.type === 'bottle'); pickUp(hands.right, p); hands.right.desk.mode = 'hold'; })()`); } },
  { t: 1.2, f: () => { TW.player.hp = 60; key('keydown', 'KeyF'); } },
  { t: 2.4, f: () => { key('keyup', 'KeyF'); if (TW.player.hp > 60) stats.drinks++; } },
];

try {
  while (clock < MAX_T) {
    clock += DT; step++;
    for (const s of script) if (!s.done && clock >= s.t) { s.done = true; s.f(); }
    const G = TW.game;
    stats.waves.add(G.wave);
    if (G.state === 'won') break;
    const live = TW.enemies.filter(e => e.hittable());
    // nearest enemy
    let tgt = null, best = 1e9;
    for (const e of live) { const d = Math.hypot(e.pos.x - TW.player.head.x, e.pos.z - TW.player.head.z); if (d < best) { best = d; tgt = e; } }
    if (G.wave !== lastWave) { if (lastWave >= 0) stats.waveTimes.push(+(clock - waveStart).toFixed(1)); lastWave = G.wave; waveStart = clock; }
    stats.maxProps = Math.max(stats.maxProps, TW.props.length);
    // incoming kitchenware: look at it, E to catch, then Q it back at the nearest goon
    const incoming = TW.props.find(p => p.hostile && p.body.ps[0].x.distanceTo(TW.player.head) < 2.3 && p.body.ps[0].v.dot(new THREE.Vector3().subVectors(TW.player.head, p.body.ps[0].x)) > 0);
    if (!catchState && incoming && !run('hands.right.held') && MODE !== 'passive') {
      if (aimingAt === incoming) {   // the camera turned last frame: now grab
        key('keydown', 'KeyE'); key('keyup', 'KeyE'); stats.catchTries++; aimingAt = null;
        if (run('hands.right.held') === incoming) catchState = { t: clock + 0.3, prop: incoming };
      } else aimingAt = incoming;
    } else if (!incoming) aimingAt = null;
    if (aimingAt) aimAt(aimingAt.body.ps[0].x);
    if (catchState && clock > catchState.t) {
      const tg = live.find(e => true);
      if (tg) aimAt(tg.zone('chest').pos);
      key('keydown', 'KeyQ'); key('keyup', 'KeyQ'); stats.throwBacks++; catchState = null;
    }
    const clinched = TW.player.clinchedBy;
    if (catchState || aimingAt) { /* catching */ }
    else if (clinched) {
      stats.clinchFrames = (stats.clinchFrames || 0) + 1;
      aimAt(clinched.zone('armR').pos);
      if (clock - punchT > (MODE === 'passive' ? 0.9 : 0.35)) { punchT = clock; els.c.fire('mousedown', { button: (punchSide++) % 2 ? 2 : 0 }); }
    } else if (tgt && clock > 2.6) {
      const chest = tgt.zone(rnd() < 0.5 ? 'chest' : 'head').pos;
      aimAt(chest);
      // block when someone in reach is winding up a punch
      let threat = live.some(e => e.state === 'windup' && !e.cfg.grabber && e.timer > e.windupTime - 0.3 && Math.hypot(e.pos.x - TW.player.head.x, e.pos.z - TW.player.head.z) < 1.4);
      if (threat && !blocking && rnd() > BLOCK_P) { stats.skipBlockUntil = clock + 0.6; }
      if (stats.skipBlockUntil && clock < stats.skipBlockUntil) threat = false;
      press('Space', threat); if (threat && !blocking) stats.blocks++; blocking = threat;
      press('KeyW', best > 0.95 && !threat);
      press('KeyS', best < 0.62);
      // grab + throw test once per wave on the punk
      if (!run('hands.right.held') && tgt.type === 'boso' && tgt.state === 'stagger' && best < 1.2 && stats.grabs < 3) { key('keydown', 'KeyE'); key('keyup', 'KeyE'); if (run('hands.right.held && !hands.right.held.isProp')) { stats.grabs++; stats.pendingThrow = clock + 0.4; } }
      if (stats.pendingThrow && clock > stats.pendingThrow) { stats.pendingThrow = 0; key('keydown', 'KeyQ'); key('keyup', 'KeyQ'); stats.throws++; }
      if (!threat && best < 1.05 && clock - punchT > PUNCH_GAP) {
        punchT = clock;
        const heavy = (punchSide % 3) === 2;
        els.c.fire('mousedown', { button: (punchSide++) % 2 ? 2 : 0, shiftKey: heavy });
      }
    } else { press('KeyW', false); press('Space', false); }
    ctx.__frame ? ctx.__frame() : TW.renderer.loop();
    stats.frames++;
    stats.minHp = Math.min(stats.minHp, TW.player.hp);
    for (const e of TW.enemies) { if (e.state === 'held') continue; for (const q of e.body.ps) { const d = q.x.distanceTo(TW.player.head) - q.r; if (d < (stats.closest ?? 9)) { stats.closest = d; stats.closestWhat = e.type + ':' + e.state + ':' + q.name; } } }
    const lh = run('lastHit');
    if (lh && lh !== lastHitRef) { lastHitRef = lh; stats.tiers[lh.tier] = (stats.tiers[lh.tier] || 0) + 1; if (VERBOSE) console.log('HIT', clock.toFixed(2), JSON.stringify(lh)); }
    for (const e of TW.enemies) stats.states[e.type + ':' + e.state] = (stats.states[e.type + ':' + e.state] || 0) + 1;
    for (const e of TW.enemies) { if (e.carry && !seenCarry.has(e.carry)) { seenCarry.add(e.carry); stats.lobs++; } if (e.enraged && !stats.enraged.includes(e.type)) stats.enraged.push(e.type); }
    { const act = TW.game.bosses.filter(e => e.alive && !e.benched).map(e => e.type).join(); if (stats.lastActive && act && act !== stats.lastActive) stats.tags++; if (act) stats.lastActive = act; }
    if (TW.game.state === 'lost') { stats.lost = (stats.lost || 0) + 1; if (!stats.wasLost) stats.losses = (stats.losses || 0) + 1; }
    stats.wasLost = TW.game.state === 'lost';
    if (TW.game.bosses.length && Math.floor(clock) % 20 === 0 && Math.floor(clock) !== stats.bossLogT) { stats.bossLogT = Math.floor(clock); (stats.bossLog = stats.bossLog || []).push(Math.floor(clock) + ':' + TW.game.bosses.map(e => e.type[0] + Math.round(e.hp) + e.state.slice(0, 4) + (e.benched ? 'B' : '')).join('/')); }
  }
} catch (err) { stats.errors.push(err.stack); }

if (lastWave >= 0) stats.waveTimes.push(+(clock - waveStart).toFixed(1));
const out = { mode: MODE, seed: SEED, simSeconds: +clock.toFixed(1), final: TW.game.state, wave: TW.game.wave + 1, waveTimes: stats.waveTimes, frames: stats.frames, minHp: Math.round(stats.minHp),
  losses: stats.losses || 0, bossLog: stats.bossLog || [], catches: TW.game.catches, catchTries: stats.catchTries, throwBacks: stats.throwBacks, lobs: stats.lobs, disarms: TW.game.disarms, tags: stats.tags, enraged: stats.enraged, maxProps: stats.maxProps, perfLevel: TW.perf.level,
  hpNow: Math.round(TW.player.hp), tiers: stats.tiers, drinks: stats.drinks, grabs: stats.grabs, throws: stats.throws, blocks: stats.blocks,
  closestToHead: +(stats.closest ?? 9).toFixed(3), closestWhat: stats.closestWhat, clinchFrames: stats.clinchFrames || 0, lostFrames: stats.lost || 0, enemiesLeft: TW.enemies.length, props: TW.props.length,
  roomTris: TW.roomTris(), enemyTris: ['boso', 'boxer', 'wrestler', 'batboy', 'cook', 'secguard', 'kicker', 'rocco', 'ivan'].map(t => { const e = new TW.Enemy(t); const n = e.tris; e.remove(); return t + ':' + n; }).join(' '),
  errors: stats.errors };
if (VERBOSE) out.states = stats.states;
console.log(JSON.stringify(out, null, 1));
if (process.argv.includes('--where')) for (const e of TW.enemies) console.log('ENEMY', e.type, e.state, 'hp', e.hp.toFixed(1), 'alive', e.alive, 'pos', e.pos.x.toFixed(2), e.pos.z.toFixed(2), 'outerY', e.outer.position.y.toFixed(2), 'token', e.hasToken, 'cd', e.cooldown.toFixed(2), '| player', TW.player.head.x.toFixed(2), TW.player.head.z.toFixed(2), 'held', !!(TW.hands.right.held));
