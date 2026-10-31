// Headless checks for the music player (src/music.js): the level -> song table, seamless level changes (same song keeps
// playing, another one crossfades), the fight / boss / menu mix, the volume, at most two decoded songs, and nothing
// breaking without audio. Web Audio and fetch are stubbed; the clock is the test's.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const THREE = require('./three_stub.js');
const dir = path.join(__dirname, '..');
let clock = 0, seed = 31;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {}, addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, fire(t, e) { for (const f of this._l[t] || []) f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info']) els[id] = mkEl(id);
els.c.requestPointerLock = () => {};
class ImageStub { set src(v) { this.width = 40; this.height = 16; if (this.onload) this.onload(); } }

// ---- a small Web Audio stand-in: params record their automation, sources record start / stop
class Param {   // keeps its automation events (cancelScheduledValues drops the later ones) and evaluates them at the clock
  constructor(v) { this._v = v; this.ev = []; }
  get value() {
    let v = this._v, t0 = -Infinity;
    for (const e of this.ev) {
      if (e[2] > clock) { if (e[0] === 'lin') v += (e[1] - v) * (clock - t0) / (e[2] - t0); break; }
      if (e[0] === 'target') { v = e[1] + (v - e[1]) * Math.exp(-(clock - e[2]) / e[3]); t0 = clock; } else { v = e[1]; t0 = e[2]; }
    }
    return v;
  }
  set value(x) { this._v = x; this.ev = []; }
  setValueAtTime(v, t) { this.ev.push(['set', v, t]); }
  linearRampToValueAtTime(v, t) { this.ev.push(['lin', v, t]); }
  exponentialRampToValueAtTime(v, t) { this.ev.push(['exp', v, t]); }
  setTargetAtTime(v, t, k) { this.ev.push(['target', v, t, k]); }
  cancelScheduledValues(t) { this.ev = this.ev.filter(e => e[2] < t); }
  last() { return this.ev.length ? this.ev[this.ev.length - 1] : null; }
  goal() { const e = this.last(); return e ? e[1] : this._v; }
}
class Node { connect(n) { this.out = n; return n; } disconnect() { this.out = null; } }
class Gain extends Node { constructor() { super(); this.gain = new Param(1); } }
let AC = null;
class Source extends Node {
  constructor() { super(); this.playbackRate = new Param(1); }
  start(t, off) { this.started = [t, off || 0]; AC.sources.push(this); }
  stop(t) { this.stopAt = t; }
}
class AudioContextStub {
  constructor() { AC = this; this.sampleRate = 48000; this.state = 'running'; this.destination = new Node(); this.sources = []; this.decodes = 0; }
  get currentTime() { return clock; }
  createGain() { return new Gain(); }
  createOscillator() { const o = new Source(); o.frequency = new Param(440); return o; }
  createBiquadFilter() { const f = new Node(); f.frequency = new Param(1000); return f; }
  createBuffer(ch, n) { return { getChannelData: () => new Float32Array(n) }; }
  createBufferSource() { return new Source(); }
  decodeAudioData(ab) { this.decodes++; return Promise.resolve({ duration: 74, numberOfChannels: 2, from: ab.url }); }
}
const fetches = [];
const fetchStub = (url) => { fetches.push(url); const ok = fs.existsSync(path.join(dir, url)); return Promise.resolve({ ok, status: ok ? 200 : 404, arrayBuffer: () => Promise.resolve({ url }) }); };

const warns = [];
const ctx = { THREE, console: Object.assign(Object.create(console), { warn: (m) => warns.push(m) }), Math: Object.create(Math), document: { getElementById: (id) => els[id], addEventListener() {} }, navigator: {}, Image: ImageStub,
  innerWidth: 1280, innerHeight: 720, performance: { now: () => clock * 1000 }, addEventListener() {},
  setTimeout, Map, Set, Array, Object, Number, String, Float32Array, Uint8Array, JSON, Promise };
ctx.Math.random = rnd; ctx.window = ctx;   // no AudioContext and no fetch yet: audio unavailable
vm.createContext(ctx);
require('./load.js')(ctx);
const run = (c) => vm.runInContext(c, ctx);
const TW = ctx.__tw;
const log = [];
const check = (name, ok, extra = '') => log.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  (' + extra + ')' : ''));
const DT = 1 / 72;
let maxBufs = 0, maxVoices = 0;
const M = run('MUSIC');
const step = (n) => {
  for (let i = 0; i < n; i++) {
    clock += DT; TW.renderer.loop();
    if (AC) for (const s of AC.sources) if (s.stopAt !== undefined && s.stopAt <= clock && !s.ended) { s.ended = true; if (s.onended) s.onended(); }
    maxBufs = Math.max(maxBufs, M.bufs.size); maxVoices = Math.max(maxVoices, M.fading.length + (M.cur ? 1 : 0));
  }
};
const flush = async () => { for (let i = 0; i < 6; i++) await new Promise(r => setTimeout(r, 0)); };
const settle = async (n = 3) => { step(n); await flush(); step(n); };
const near = (a, b, e = 1e-3) => Math.abs(a - b) < e;
const db = (d) => Math.pow(10, d / 20);
const musicSources = () => AC.sources.filter(s => s.loop);

(async () => {
  try {
    const F = TW.CFG.music;
    // ---- the table
    const stages = run('stageList()').map(s => s.name);
    check('every stage maps to a song (and the title screen too)', ['menu', ...stages].every(n => M.tracks[n] && M.songs[M.tracks[n]]), stages.map(n => n + ':' + M.tracks[n]).join(' '));
    check('the bar, Tripoint Square and the road: the Threeway theme', ['bar', 'street', 'menu'].every(n => M.tracks[n] === 'threeway'));
    check('the gate through the Tower: the Krasnovia theme', ['superblock', 'podezd', 'palace', 'parade', 'tower'].every(n => M.tracks[n] === 'krasnovia'));
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'assets/music/loop/loops.json'), 'utf8'));
    const songsOk = Object.entries(M.songs).every(([k, S]) => fs.existsSync(path.join(dir, S.src)) && manifest[k] && near(S.start, manifest[k].loopStart, 1e-6) && near(S.end, manifest[k].loopEnd, 1e-6) && S.end > S.start + 30);
    check('every song\'s loop file exists and its loop points match loops.json', songsOk, Object.keys(M.songs).join(', '));

    // ---- no audio: no AudioContext, no fetch. Play through level changes, a boss, the menu
    els.deskBtn.fire('click'); step(3);
    let threw = null;
    try {
      run(`startStage('street')`); step(5);
      run(`LEVELS.superblock.start(true)`); step(5);
      run(`startEncounter(0); MUSIC.cue('boss')`); step(10);
      run(`openPause()`); step(3); run(`closeMenu(); quitToTitle()`); step(3);
      run(`AU.thud('heavy'); AU.roar()`);
    } catch (e) { threw = e; }
    check('no audio: nothing throws, nothing plays, AU still callable', !threw && !M.ctx && !M.cur && TW.game.state === 'menu', threw ? threw.message : '');

    // ---- audio arrives (the button's click: AU.init makes the context)
    ctx.AudioContext = AudioContextStub; ctx.fetch = fetchStub;
    run(`AU.init()`);
    run(`startStage('bar')`);
    await settle();
    const s0 = M.cur && M.cur.src;
    check('music rides AU\'s context, under AU.master', M.ctx === run('AU.ctx') && M.bus.out === run('AU.master') && M.duck.out === M.bus);
    check('the bar: the Threeway theme, fetched first and looping on its loop points', s0 && fetches[0] === M.songs.threeway.src && s0.buffer.from === M.songs.threeway.src && s0.loop === true
      && near(s0.loopStart, M.songs.threeway.start) && near(s0.loopEnd, M.songs.threeway.end) && near(s0.started[1], M.songs.threeway.start), fetches.join(', '));
    check('it fades in from silence', M.cur.g.gain.ev[0][0] === 'set' && M.cur.g.gain.ev[0][1] === 0 && near(M.cur.g.gain.last()[1], 1) && near(M.cur.g.gain.last()[2] - s0.started[0], F.fadeIn));
    check('the bar\'s next level plays the same song, so nothing is fetched ahead', fetches.length === 1);

    // ---- out the door (no cut): same song, same source, no restart
    run(`DOOR.open = 1; startStreet(true)`); await settle(); step(Math.ceil(3 / DT));   // (a few seconds down the street)
    check('bar -> street: the same source keeps playing (no restart, no fade)', M.cur.src === s0 && s0.stopAt === undefined && musicSources().length === 1 && TW.level.name === 'street');
    check('in the street, the next level\'s song (Krasnovia) is fetched ahead, not decoded', fetches[1] === M.songs.krasnovia.src && AC.decodes === 1, fetches.join(', '));

    // ---- through the boom into Krasnovia: crossfade
    run(`LEVELS.superblock.start(true)`); await settle();
    const t1 = clock;
    const s1 = M.cur && M.cur.src;
    check('street -> superblock: a new source with the Krasnovia theme (from the prefetched bytes)', s1 && s1 !== s0 && s1.buffer.from === M.songs.krasnovia.src && fetches.length === 2, fetches.length + ' fetches');
    const outEnd = s0.stopAt, inLast = M.cur.g.gain.last(), oldG = M.fading[0] && M.fading[0].g.gain;
    check('...crossfades over CFG.music.fade: the old fades to 0 and stops, the new fades to 1', oldG && near(oldG.last()[1], 0) && near(oldG.last()[2] - s1.started[0], F.fade) && near(outEnd - s1.started[0], F.fade + 0.05)
      && near(inLast[1], 1) && near(inLast[2] - s1.started[0], F.fade), `fade ${F.fade}s, old stops at +${(outEnd - s1.started[0]).toFixed(2)}`);
    check('...equal power: halfway, both sit at ~0.71', (() => { const h = (g) => g.ev.find(e => e[0] === 'lin' && near(e[2] - s1.started[0], F.fade / 2)); const a = h(oldG), b = h(M.cur.g.gain); return a && b && near(a[1], Math.SQRT1_2, 0.01) && near(b[1], Math.SQRT1_2, 0.01); })());
    step(Math.ceil((F.fade + 0.2) / DT));
    check('after the crossfade the old voice is gone and its song dropped', M.fading.length === 0 && s0.ended && !M.bufs.has('threeway') && M.bufs.size === 1, [...M.bufs.keys()].join(','));

    // ---- on through Krasnovia: no restarts
    for (const [n, from] of [['podezd', true], ['palace', true], ['parade', true], ['tower', true]]) {
      run(`LEVELS.${n}.start(${from})`); await settle();
      check(`-> ${n}: still the same Krasnovia source`, M.cur.src === s1 && s1.stopAt === undefined && TW.level.name === n);
    }

    // ---- the mix
    run(`LEVELS.superblock.start(false)`); await settle();
    check('walking, no fight: full level', near(M.duck.gain.goal(), 1) && TW.game.state === 'walk');
    run(`startEncounter(0)`); step(2);
    check('a fight dips the music ~3 dB', near(M.duck.gain.goal(), db(F.fightDb)) && near(F.fightDb, -3, 0.5), M.duck.gain.goal().toFixed(3));
    run(`game.state = 'lost'; game.timer = 0`); step(2);
    check('a loss brings it back', near(M.duck.gain.goal(), 1));
    run(`LEVELS.palace.start(false)`); await settle();
    const vi = run(`CFG.palace.encounters.findIndex(E => E.boss)`);
    run(`startEncounter(${vi})`); step(2);
    const bossT = clock;
    check('a boss\'s intro (the stage flow\'s boss sign + roar) ducks hard', near(M.duck.gain.goal(), db(F.bossDb)) && F.bossDb <= -10 && M.duck.gain.last()[3] <= 0.1, `${F.bossDb} dB`);
    step(Math.ceil((F.bossHold + 0.3) / DT));
    check('...then comes back to the fight level after ~2 s', near(M.duck.gain.goal(), db(F.fightDb)) && TW.game.state === 'fight', `${(clock - bossT).toFixed(1)} s later`);
    run(`game.state = 'won'`); step(2);
    check('a win brings it back to normal', near(M.duck.gain.goal(), 1));
    run(`startEncounter(${vi})`); step(2); run(`game.state = 'won'`); step(2);
    check('a win during the boss duck ends it too', near(M.duck.gain.goal(), 1) && M.bossUntil < 0);
    // the bar's boss round (Rocco & Ivan): the wave's fight starts with the boss sign
    run(`startGame(); startWave(CFG.waves.length - 1)`); step(Math.ceil(2.1 / DT)); await flush();
    check('the bar\'s boss round ducks hard as it starts', TW.game.state === 'fight' && near(M.duck.gain.goal(), db(F.bossDb)));
    // menus
    run(`openPause()`); step(2);
    check('the pause menu: quieter still', near(M.duck.gain.goal(), db(F.menuDb + F.bossDb)) || near(M.duck.gain.goal(), db(F.menuDb + F.fightDb)));
    run(`closeMenu(); quitToTitle()`); await settle();
    check('the title screen: the Threeway theme, quietly', TW.game.state === 'menu' && M.cur.song === 'threeway' && near(M.duck.gain.goal(), db(F.menuDb)) && F.menuDb < 0);
    const sMenu = M.cur.src;
    run(`startStage('bar')`); await settle();
    check('START in the bar from the title: the same source carries on, up from the menu level to round 1\'s fight level', M.cur.src === sMenu && sMenu.stopAt === undefined && near(M.duck.gain.goal(), db(F.fightDb)) && TW.game.state === 'intro');
    // volume
    run(`OPTS.music = 0`); step(2);
    check('the MUSIC option sets the bus (0: silent)', near(M.bus.gain.goal(), 0));
    run(`OPTS.music = 10`); step(2);
    check('...full: CFG.music.volume', near(M.bus.gain.goal(), F.volume));
    run(`OPTS.music = 7`); step(2);
    check('the options screen has a MUSIC bar', run(`optItems().some(it => it.label === 'MUSIC' && it.bar === 10)`));

    // ---- quick changes mid-crossfade: never more than two voices or two decoded songs
    run(`LEVELS.superblock.start(false)`); await settle(2);
    run(`startStage('bar')`); await settle(2);
    run(`LEVELS.tower.start(false)`); await settle(2);
    check('rapid changes: at most two voices and two decoded songs at any time', maxVoices <= 2 && maxBufs <= 2, `max ${maxVoices} voices, ${maxBufs} decoded`);
    step(Math.ceil((F.fade + 0.3) / DT));
    check('...and it settles on the level\'s song', M.cur.song === 'krasnovia' && M.fading.length === 0 && M.bufs.size === 1);

    // ---- a file that won't load: silence, no throw
    M.songs.broken = { src: 'assets/music/loop/missing.ogg', start: 0.25, end: 60 };
    M.tracks.street = 'broken';
    threw = null;
    try { run(`startStage('street')`); await settle(); step(Math.ceil((F.fade + 0.3) / DT)); } catch (e) { threw = e; }
    check('a song that fails to load: no throw, a warning, the old one fades out, silence', !threw && M.failed.has('broken') && !M.cur && M.fading.length === 0 && warns.some(w => /broken/.test(w)), threw ? threw.message : warns.join('; '));
    M.tracks.street = 'threeway'; delete M.songs.broken;
    run(`startStage('street')`); await settle();
    check('...and the next level plays again', M.cur && M.cur.song === 'threeway');
    // no decode support at all (a context without decodeAudioData): no throw
    M.failed.clear(); M.bufs.clear(); M.cur = null; M.fading.length = 0; M.want = undefined;
    const dec = AC.decodeAudioData; AC.decodeAudioData = () => { throw new Error('unsupported'); };
    threw = null;
    try { step(3); await flush(); step(3); } catch (e) { threw = e; }
    check('decodeAudioData throwing: no throw, nothing plays', !threw && !M.cur && M.failed.has('threeway'), threw ? threw.message : '');
    AC.decodeAudioData = dec;
  } catch (err) { log.push('ERROR ' + err.stack); }
  console.log(log.join('\n'));
  const fails = log.filter(l => !l.startsWith('PASS')).length;
  console.log(`\n${log.length - fails} / ${log.length} music checks pass`);
  process.exitCode = fails ? 1 : 0;
})();
