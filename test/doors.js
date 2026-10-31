// Headless checks for the building entrances (src/doors.js): podezd 3's street door, the Palace's foyer doors, the Tower of
// Labor's south doors and the Chairman's doors. Each is shut (a wall on its own floor) until the fight before it is won,
// then swings open (eased, with nothing to walk into), and the room behind it is drawn once it opens.
'use strict';
const vm = require('vm');
const THREE = require('./three_stub.js');
let clock = 0, seed = 59;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {}, addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, fire(t, e) { for (const f of this._l[t] || []) f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info', 'levelSel']) els[id] = mkEl(id);
els.c.requestPointerLock = () => {};
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
els.deskBtn.fire('click');
const door = (n) => run(`DOORS.find(d => d.name === '${n}')`);
// does the doorway's middle hold you out? (a point on the near side of it, pushed the way you'd walk)
const holds = (D) => {
  return run(`(() => { const D = DOORS.find(d => d.name === '${D.name}'); const F = ${D.framed ? 'ACT1_WEST' : 'null'};
    const lx = (D.x0 + D.x1) / 2, lz = D.z + D.side * 0.12; const w = F ? F.toWorld(lx, lz) : [lx, lz];
    const p = new V3(w[0], D.y, w[1]); const b = D.blocker; return p.x > b.x0 && p.x < b.x1 && p.z > b.z0 && p.z < b.z1 && b.y1 > D.y; })()`);
};
const CASES = [
  // name, level, framed, how to be mid-fight before it, how to have won that fight
  ['podezd3', 'superblock', false, `level.encounter = CFG.superblock.encounters.length - 1; game.state = 'fight'; game.queue = ['x'];`, `level.encounter = CFG.superblock.encounters.length - 1; game.state = 'walk'; game.queue = [];`],
  ['palaceFoyer', 'palace', true, `level.encounter = 0; game.state = 'fight'; game.queue = ['x'];`, `level.encounter = 0; game.state = 'cleared'; game.timer = 0; game.queue = [];`],
  ['towerFront', 'parade', true, `level.encounter = CFG.parade.encounters.length - 1; game.state = 'fight'; game.queue = ['x'];`, `level.encounter = CFG.parade.encounters.length - 1; game.state = 'walk'; game.queue = [];`],
  ['chairman', 'tower', true, `level.encounter = CFG.tower.encounters.length - 2; game.state = 'walk';`, `level.encounter = CFG.tower.encounters.length - 1; game.state = 'intro'; game.timer = 0;`],
];
try {
  check('four entrances have doors', run('DOORS.map(d => d.name).sort().join()') === 'chairman,palaceFoyer,podezd3,towerFront', run('DOORS.map(d => d.name).join()'));
  for (const [name, lvl, framed, fighting, won] of CASES) {
    run(`startStage('${lvl}')`); step(3);
    const D = door(name); D.framed = framed;
    run(`clearEnemies(); ${fighting}`); run('updateDoors(0.001)');
    const near = run(`(() => { const D = DOORS.find(d => d.name === '${name}'); const p = D.leafMeshes[0].getWorldPosition(new V3()); rig.position.set(p.x, D.y, p.z); player.floorY = D.y; return true; })()`);
    for (let i = 0; i < 3; i++) { run(fighting); step(1); }   // your head is there now (the frame puts it on the camera)
    run(`${fighting} updateDoors(0.001)`);
    check(`${name}: shut while the fight before it is on`, D.t === 0 && holds(D), `t ${D.t}`);
    check(`${name}: drawn on ${lvl}`, D.leafMeshes.every(g => g.visible));
    run(`${won}`);
    let mid = null, t = 0; for (let i = 0; i < 72 * 3; i++) { run(`${won} updateDoors(${DT})`); t += DT; if (mid === null && t > 0.4) mid = D.t; }
    check(`${name}: swings open once it's won (eased over ${run('CFG.doors.openTime')} s, not a pop)`, mid > 0.05 && mid < 0.9 && D.t === 1, `${(mid || 0).toFixed(2)} at 0.4 s, then ${D.t}`);
    check(`${name}: open, it holds nobody out`, !holds(D) || run(`DOORS.find(d => d.name === '${name}').blocker.y1`) < 0);
  }
  // the rooms behind are drawn as the doors open (before you've walked in)
  run(`startStage('superblock')`); step(3); run(`clearEnemies(); level.encounter = CFG.superblock.encounters.length - 1; game.state = 'walk'; DOORS.find(d => d.name === 'podezd3').t = 1;`);
  check('podezd 3 open: its lobby shows through the door from the courtyard', run(`PORTALS.some(P => P.b === 'podezd' && P.open())`));
  run(`startStage('parade')`); step(3); run(`clearEnemies(); level.encounter = CFG.parade.encounters.length - 1; game.state = 'walk'; DOORS.find(d => d.name === 'towerFront').t = 1;`);
  check('the Tower\'s doors open: its lobby shows through them from Parade Square', run(`PORTALS.some(P => P.b === 'twLobby' && P.open())`));
  // off its levels a door is hidden, and a stage started from the menu doesn't make you watch a swing
  run(`startStage('street')`); step(2);
  check('every door is hidden on Tripoint Square', run('DOORS.every(d => d.leafMeshes.every(g => !g.visible))'));
  run(`startStage('tower')`); step(2);
  check('starting the Tower from the menu: its south doors are already open behind you (no swing)', door('towerFront').t === 1);
} catch (err) { log.push('FAIL threw: ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => l.startsWith('FAIL')).length;
console.log(`${log.length - fails} / ${log.length} doors checks pass`);
process.exit(fails ? 1 : 0);
