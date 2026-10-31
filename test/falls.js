// Headless checks that nobody drops a story in the Tower of Labor: not you (in VR your feet can reach 5 cm past a desk's
// edge: the walk rects' 0.3 m pad is wider than your 0.25 m radius), not a goon knocked down over a desk or a shelf row,
// not one thrown clear over the tribune's balustrade (he gets up on your floor), and nobody on another floor can hit you.
'use strict';
const vm = require('vm');
const THREE = require('./three_stub.js');
let clock = 0, seed = 53;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {}, addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, fire(t, e) { for (const f of this._l[t] || []) f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info', 'levelSel']) els[id] = mkEl(id);
els.c.requestPointerLock = () => {};
els.levelSel.value = 'tower';
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
const step = (n) => { for (let i = 0; i < n; i++) { clock += DT; TW.renderer.loop(); } };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const AW = run('ACT1_WEST'), W = (x, y, z) => { const [a, b] = AW.toWorld(x, z); return V(a, y, b); };
els.deskBtn.fire('click');
run(`startStage('tower')`); step(5);
const TWR = run('TWR'), H = run('TW_HOLES');
// every floor's furniture: [floor y, holes]
const floors = [['lobby', TWR.lobby.y, H.lobby], ['office', TWR.office.y, H.office()], ['archive', TWR.archive.y, H.archive()], ['top', TWR.top.y, H.top], ['tribune', TWR.top.y, H.tribune()]];
const at = (lx, lz, y) => { const w = W(lx, y, lz); return w; };
const stand = (w) => run(`floorAt(${w.x}, ${w.z}, ${w.y}, 'stand')`);
const plain = (w) => run(`floorAt(${w.x}, ${w.z}, ${w.y})`);
const reachable = (w, r) => { run(`(() => { const p = new V3(${w.x}, ${w.y}, ${w.z}); keepInWalk(p, ${r}); __p = p; })()`); const p = run('__p'); return V(p.x, w.y, p.z); };
try {
  // ---- you: walk your feet as far into each desk, shelf row and column as your VR radius lets you
  let spots = 0, wouldDrop = 0, dropped = [];
  for (const [name, y, holes] of floors) for (const [x0, x1, z0, z1] of holes) {
    for (const [lx, lz] of [[(x0 + x1) / 2, z0 + 0.01], [(x0 + x1) / 2, z1 - 0.01], [x0 + 0.01, (z0 + z1) / 2], [x1 - 0.01, (z0 + z1) / 2]]) {
      const w = reachable(at(lx, lz, y), 0.25); spots++;
      if (plain(w) < y - 1) wouldDrop++;
      if (Math.abs(stand(w) - y) > 0.01) dropped.push(`${name} ${stand(w).toFixed(1)}`);
    }
  }
  check('in VR your feet can reach past furniture edges (the bug this guards: the plain lookup drops you there)', wouldDrop > 0, `${wouldDrop} of ${spots} spots`);
  check('standing at any of those spots, you stay on your floor', dropped.length === 0, dropped.slice(0, 4).join(', ') || `${spots} spots`);
  // and live: stand there a second with the rig's floor following you (the way the VR loop does)
  { const [x0, x1, z0, z1] = H.office()[2], y = TWR.office.y, w = reachable(at((x0 + x1) / 2, z0 + 0.01, y), 0.25);
    TW.rig.position.set(w.x, y, w.z); TW.player.floorY = y; let low = y;
    for (let i = 0; i < 72; i++) { TW.rig.position.set(w.x, TW.rig.position.y, w.z); step(1); low = Math.min(low, TW.player.floorY); }
    check('pressed against a typing-pool desk for a second, your floor never sinks', low > y - 0.01, `lowest ${low.toFixed(2)}`); }

  // ---- goons
  const spawn = (type, lx, lz, y) => { run(`(() => { const e = new Enemy(enemyType('${type}')); const w = ACT1_WEST.toWorld(${lx}, ${lz}); e.placeAt(w[0], w[1], 0, ${y}); e.cooldown = 1e9; enemies.push(e); __e = e; })()`); return run('__e'); };
  const lowest = (e) => Math.min(...e.body.ps.map(p => p.x.y));
  const settle = (e, max = 6) => { let low = 1e9; for (let i = 0; i < max * 72; i++) { step(1); low = Math.min(low, lowest(e)); if (e.state !== 'ragdoll' && e.state !== 'getup' && i > 72) break; } return low; };
  // knocked down onto a desk in the typing pool, the archive's shelf rows, the tribune's signing table
  const cases = [['office desk', 'clerk', H.office()[4], TWR.office.y], ['archive shelf row', 'bodyguard', H.archive()[1], TWR.archive.y], ['the signing table', 'bodyguard', H.tribune()[0], TWR.top.y]];
  for (const [what, type, [x0, x1, z0, z1], y] of cases) {
    run('clearEnemies()'); TW.player.floorY = y; TW.rig.position.copy(W(-40, y, 314.5));
    const e = spawn(type, x0 - 0.6, (z0 + z1) / 2, y);
    step(3); e.knockdown(V(...(() => { const a = W(1, 0, 0), o = W(0, 0, 0); return [a.x - o.x, 0, a.z - o.z]; })()).multiplyScalar(1.6), 'knockdown', false);
    const low = settle(e);
    check(`a goon knocked onto ${what} stays on its floor (${y} m)`, low > y - 0.5 && Math.abs(e.pos.y - y) < 0.05, `lowest particle ${low.toFixed(2)}, stands at ${e.pos.y.toFixed(2)}`);
  }
  // thrown hard over the tribune's balustrade: whatever happens to his ragdoll, he gets up on your floor
  { run('clearEnemies()'); const y = TWR.top.y; TW.player.floorY = y; TW.rig.position.copy(W(-40, y, 318));
    const [ta, tb, tc] = TWR.tribune, e = spawn('bodyguard', -40, tc + 0.8, y);
    step(3); e.knockdown(V(0, 0, 0), 'knockdown', false);
    const out = (() => { const a = W(0, 0, -1), o = W(0, 0, 0); return V(a.x - o.x, 0, a.z - o.z).normalize(); })();
    for (const p of e.body.ps) p.v.copy(out).multiplyScalar(9).setY(4);
    settle(e, 10);
    check('a goon thrown clear over the tribune\'s balustrade gets up on the tribune', Math.abs(e.pos.y - y) < 0.05 && e.state !== 'ragdoll', `stands at ${e.pos.y.toFixed(1)} (${e.state})`); }
  // nobody on another floor can hit you: a bodyguard a story below throws a punch at your head
  { run('clearEnemies()'); const y = TWR.archive.y; TW.player.floorY = y; TW.rig.position.copy(W(-40, y, 320)); step(2);
    const h = TW.player.head, e = spawn('bodyguard', -40, 320.6, TWR.office.y);
    TW.player.hp = 100; run(`(() => { __e.lockTarget.copy(player.head); __e.side = 'r'; __e.resolveStrike(); })()`);
    check('a goon a story below you can\'t punch you', TW.player.hp === 100, `hp ${TW.player.hp}`);
    run(`(() => { __e.lockTarget.copy(player.head); __e.resolveGrab(); })()`);
    check('or clinch you', !TW.player.clinchedBy, TW.player.clinchedBy ? 'clinched' : 'free'); }
  // small drops still drop: the floors suite covers a goon thrown off a 3 m landing into the yard
  check('a big drop is still a drop past the ledge distance (no floor appears in mid-air far from the edge)', run(`floorAt(${W(-40, 0, 300).x}, ${W(-40, 0, 300).z}, ${TWR.top.y}, 'body')`) < 1);
} catch (err) { log.push('FAIL threw: ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => l.startsWith('FAIL')).length;
console.log(`${log.length - fails} / ${log.length} falls checks pass`);
process.exit(fails ? 1 : 0);
