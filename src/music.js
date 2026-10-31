'use strict';
// ============================== music =======================================
// The sector themes and Act 1's level and boss tracks, looped gaplessly on AU's Web Audio context (one
// AudioBufferSourceNode per track, loop + loopStart / loopEnd; never <audio loop>, which gaps). The loops are rendered by
// tools/music/loops.py into assets/music/loop/ (Ogg Opus with a little of the loop's own wrap on each side of the loop
// points; see its header). Stings (SIGNED) are one-shots.
//
//   MUSIC.tracks: level name -> its song ('menu' is the title screen), or { song, at, ahead } for a level whose music
//                 follows its fights and areas: `song` is the level's own (and what plays as you walk in), `at()` returns
//                 another song for where you are now (a boss's, the tribune's) or nothing, `ahead()` the song you're likely
//                 to need next, decoded ahead (a boss's as you near the arena). A level with no entry plays nothing.
//   Changes: the same song keeps playing (across levels too: they flow into each other with no cut); another crossfades.
//   The mix: a fight dips the music a little (CFG.music.fightDb). A boss with his own track crossfades into it quickly as
//   his sign goes up (MUSIC.cue('boss'), beside the boss sign's AU.roar()); a boss without one ducks it hard for a moment.
//   A win or a loss brings it back. MUSIC.cue('signed') (the permit signed): the music drops out under the sting, then
//   comes back softly while the level stays won. The title and the pause menu play it quietly.
//   Loading: lazy (fetch + decodeAudioData), the song you need first; the next level's file is fetched (not decoded) ahead,
//   and a level's `ahead()` song decoded ahead. At most two decoded songs at once (plus the small sting).
//   Nothing happens until AU has a context (the Enter VR / desktop button's click makes it), and nothing breaks without one.
CFG.music = {
  volume: 0.4,       // the music bus at full MUSIC volume (the options' MUSIC bar), under AU.master (the VOLUME bar)
  menuDb: -8,        // the title screen and the pause menu: quietly
  fightDb: -3,       // while a fight is on (mild)
  bossDb: -14,       // a boss without his own track: ducked hard for bossHold seconds as his sign goes up, then fightDb
  bossHold: 2.0,
  fade: 2.5,         // crossfade from one song to another (s)
  bossFade: 1.0,     // crossfade into a boss's own track as his sign goes up (s)
  fadeIn: 1.5,       // fade in from silence (s)
  duckDown: 0.06, duckUp: 0.45,   // time constants (s) into and out of a duck
  stingDuck: 0.12,   // the music drops out this fast under a sting (time constant, s)
  stingOverlap: 2.0, // and starts back this long before the sting's end (its ring-out)
  stingReturn: 1.2,  // time constant (s) of its soft return
  afterDb: -12,      // under ACT 1 COMPLETE (the level won after a sting)
};
const MUSIC = {
  tracks: {
    menu: 'threeway', bar: 'threeway', street: 'threeway', superblock: 'krasnovia',
    podezd: 'podezd',
    palace: { song: 'palace',                                                         // the crossing, the boulevard, the gym
      at: () => MUSIC.fighting('volkov') && 'volkov',                                 // the Bear, from his sign until he's down
      ahead: () => MUSIC.reached('gym') && !MUSIC.reached('volkov') && 'volkov' },
    parade: 'parade',
    tower: { song: 'tower',                                                           // the lobby and the typing pool
      at: () => (MUSIC.glassOpen() && 'tribune')                                      // the glass lift opens after Orlova: up, and the Chairman
        || (MUSIC.reached('archive') && 'orlova'),                                    // Orlova, from her sign until the glass lift
      ahead: () => (MUSIC.reached('archive') && 'tribune') || (MUSIC.reached('offices') && 'orlova') },
  },
  // start / end: the loop points (s), from tools/music/loops.py (assets/music/loop/loops.json). sting: a one-shot it may cue.
  songs: {
    threeway: { src: 'assets/music/loop/1-the-threeway.ogg', start: 0.25, end: 73.293479 },
    krasnovia: { src: 'assets/music/loop/2-krasnovia.ogg', start: 0.25, end: 71.159063 },
    columbia: { src: 'assets/music/loop/3-columbia.ogg', start: 0.25, end: 68.144708 },
    hinomoto: { src: 'assets/music/loop/4-hinomoto.ogg', start: 0.25, end: 69.05 },
    podezd: { src: 'assets/music/loop/act1-podezd.ogg', start: 0.25, end: 85.077583 },
    palace: { src: 'assets/music/loop/act1-palace.ogg', start: 0.25, end: 61.916667 },
    volkov: { src: 'assets/music/loop/act1-volkov.ogg', start: 0.25, end: 78.711521 },
    parade: { src: 'assets/music/loop/act1-parade.ogg', start: 0.25, end: 76.25 },
    tower: { src: 'assets/music/loop/act1-tower.ogg', start: 0.25, end: 76.440479 },
    orlova: { src: 'assets/music/loop/act1-orlova.ogg', start: 0.25, end: 61.05 },
    tribune: { src: 'assets/music/loop/act1-tribune.ogg', start: 0.25, end: 78.431813, sting: 'signed' },
    signed: { src: 'assets/music/loop/act1-signed.ogg', oneShot: true },              // SIGNED · 1 OF 3 (11.2 s)
  },
  ctx: null, bus: null, duck: null,
  cur: null,          // the voice playing: { song, src, g }
  fading: [],         // voices fading out
  want: undefined,    // the song for where you are (null: silence)
  aheadSong: null,    // the song the level expects next (decoded ahead)
  bufs: new Map(), loading: new Map(), bytes: new Map(), failed: new Set(),
  stingBufs: new Map(), sting: null, stingUntil: -1, afterSting: false,
  bossUntil: -1, quick: null, duckTo: 1, vol: -1, lvl: null,

  // ---- every frame (from updateArea)
  update() {
    if (!this.ctx && !this.attach()) return;
    this.aheadSong = this.aheadFor();
    this.follow(); this.mix(); this.preload();
    if (level.name !== this.lvl) { this.lvl = level.name; if (this.cur) this.prefetchNext(); }   // walked on: fetch the next one's
  },
  attach() {   // onto AU's context, once it exists
    const c = AU.ctx; if (!c || !AU.master || !c.createGain) return false;
    try {
      const duck = c.createGain(), bus = c.createGain();
      duck.connect(bus); bus.connect(AU.master);
      duck.gain.value = 1; bus.gain.value = this.volume();
      this.ctx = c; this.duck = duck; this.bus = bus; this.duckTo = 1; this.vol = bus.gain.value;
    } catch (e) { return false; }
    if (c.state === 'suspended' && c.resume) try { c.resume().catch(() => {}); } catch (e) { /* needs a gesture */ }
    return true;
  },
  volume() { return CFG.music.volume * (typeof OPTS !== 'undefined' && OPTS.music != null ? OPTS.music / 10 : 0.7); },
  // ---- what plays where
  entry(name) { const T = this.tracks[name]; return !T ? null : typeof T === 'string' ? T : T.song; },   // a level's own song
  songFor() {
    const name = game.state === 'menu' ? 'menu' : level.name, T = this.tracks[name];
    const s = !T ? null : typeof T === 'string' ? T : ((T.at && T.at()) || T.song);
    return s && this.songs[s] && !this.songs[s].oneShot ? s : null;
  },
  aheadFor() {
    const T = game.state === 'menu' ? null : this.tracks[level.name];
    const s = T && typeof T === 'object' && T.ahead ? T.ahead() : null;
    return s && this.songs[s] && !this.failed.has(s) ? s : null;
  },
  encounters() { return STAGES.has(level.name) ? (stageCfg().encounters || []) : []; },
  // this level's encounter `name` is on (its sign is up, it's being fought, or you're down in it)
  fighting(name) {
    const E = this.encounters()[level.encounter];
    return !!E && E.name === name && (game.state === 'intro' || game.state === 'fight' || game.state === 'lost');
  },
  reached(name) { const i = this.encounters().findIndex(E => E.name === name); return i >= 0 && level.encounter >= i; },   // started it (or one after)
  glassOpen() { return level.name === 'tower' && typeof TLIFTS !== 'undefined' && TLIFTS.some(L => L.glass && L.phase && L.phase !== 'shut'); },
  follow() {   // the song for where you are: keep it, crossfade to it, or load it first
    const want = this.songFor();
    if (want === this.want) return;
    this.want = want;
    if (this.cur && this.cur.song === want) { this.prune(); return; }   // (back to the one playing, e.g. mid-load)
    if (!want) { this.fadeOut(CFG.music.fade); this.prune(); return; }
    if (this.bufs.has(want)) { this.play(want); return; }
    this.load(want).then((ok) => {
      if (this.want !== want || (this.cur && this.cur.song === want)) return;
      if (ok) this.play(want); else { this.fadeOut(CFG.music.fade); this.prune(); }   // couldn't load it: silence
    });
  },
  play(song) {   // start a song, crossfading from the one playing
    const S = this.songs[song], buf = this.bufs.get(song), c = this.ctx, t = c.currentTime, F = CFG.music;
    const dur = !this.cur ? F.fadeIn : this.quick === song ? F.bossFade : F.fade;
    this.quick = null;
    this.fadeOut(dur);
    while (this.fading.length > 1) this.kill(this.fading.shift());   // a third voice (a change mid-crossfade): the oldest goes
    const src = c.createBufferSource(), g = c.createGain();
    src.buffer = buf; src.loop = true;
    src.loopStart = S.start; src.loopEnd = buf.duration ? Math.min(S.end, buf.duration) : S.end;
    src.connect(g); g.connect(this.duck);
    g.gain.value = 0; this.fadeTo(g.gain, 1, t, dur);
    src.start(t, S.start);
    this.cur = { song, src, g };
    this.prune(); this.prefetchNext();
  },
  fadeOut(dur) {
    const v = this.cur; if (!v) return;
    this.cur = null;
    const t = this.ctx.currentTime;
    this.fadeTo(v.g.gain, 0, t, dur);
    try { v.src.stop(t + dur + 0.05); } catch (e) { /* already stopped */ }
    v.src.onended = () => { const i = this.fading.indexOf(v); if (i >= 0) this.fading.splice(i, 1); this.unplug(v); this.prune(); };
    this.fading.push(v);
  },
  kill(v) {   // cut a fading voice short (a quick fade, no click)
    const t = this.ctx.currentTime;
    this.fadeTo(v.g.gain, 0, t, 0.04);
    try { v.src.stop(t + 0.05); } catch (e) { /* already stopped */ }
  },
  unplug(v) { try { v.src.disconnect(); v.g.disconnect(); } catch (e) { /* gone */ } },
  fadeTo(p, to, t, dur) {   // equal-power fade (in: sin, out: cos), as a few linear segments
    const from = p.value;
    p.cancelScheduledValues(t); p.setValueAtTime(from, t);
    for (let i = 1; i <= 8; i++) {
      const x = i / 8, k = to > from ? Math.sin(x * Math.PI / 2) : 1 - Math.cos(x * Math.PI / 2);
      p.linearRampToValueAtTime(from + (to - from) * k, t + dur * x);
    }
  },
  // ---- cues from the stage flow
  cue(what) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (what === 'boss') {   // his sign is up: into his own track if he has one, else a hard duck
      const s = this.songFor();
      if (s && s !== this.want) this.quick = s;                                        // into his track
      else if (!s || s === this.entry(level.name)) this.bossUntil = t + CFG.music.bossHold;   // no track of his own: duck
      // (else his own track, or one that carries his fight like the tribune's, is already playing: a retry, the Chairman)
    } else if (this.songs[what] && this.songs[what].oneShot) this.playSting(what);
  },
  playSting(name) {   // the music drops out, the sting plays, the music comes back (softly, if the level is won)
    const t0 = this.ctx.currentTime;
    this.afterSting = true; this.stingUntil = t0 + 1.5;   // (until it's loaded and playing)
    this.loadSting(name).then((buf) => {
      const t = this.ctx.currentTime;
      if (!buf || t - t0 > 2) { this.stingUntil = Math.min(this.stingUntil, t); return; }   // couldn't, or too late: just come back
      const src = this.ctx.createBufferSource(), g = this.ctx.createGain();
      src.buffer = buf; src.connect(g); g.connect(this.bus); src.start(t);
      if (this.sting) try { this.sting.src.stop(t + 0.05); } catch (e) { /* done */ }
      this.sting = { name, src, g };
      src.onended = () => { if (this.sting && this.sting.src === src) this.sting = null; try { src.disconnect(); g.disconnect(); } catch (e) { /* gone */ } };
      this.stingUntil = t + Math.max(0.5, (buf.duration || 0) - CFG.music.stingOverlap);
    });
  },
  loadSting(name) {   // small, kept apart from the two decoded songs
    if (this.stingBufs.has(name)) return Promise.resolve(this.stingBufs.get(name));
    if (this.failed.has(name)) return Promise.resolve(null);
    const key = 'sting:' + name;
    if (this.loading.has(key)) return this.loading.get(key);
    const p = this.fetchBytes(name).then((ab) => this.decode(ab)).then((buf) => { this.loading.delete(key); this.stingBufs.set(name, buf); return buf; })
      .catch((e) => { this.loading.delete(key); this.failed.add(name); this.warn(name, e); return null; });
    this.loading.set(key, p);
    return p;
  },
  // ---- the mix: fights dip it, a boss without a track ducks it hard, stings drop it out, menus play it quietly
  mix() {
    const F = CFG.music, t = this.ctx.currentTime;
    const fight = game.state === 'intro' || game.state === 'fight';
    if (!fight) this.bossUntil = -1;   // a win or a loss ends a boss duck
    if (this.afterSting && t >= this.stingUntil && game.state !== 'won') this.afterSting = false;   // restarted: back to normal
    let db = game.state === 'menu' || (typeof MENU !== 'undefined' && MENU.open) ? F.menuDb : 0;
    if (fight) db += t < this.bossUntil ? F.bossDb : F.fightDb;
    if (this.afterSting) db += F.afterDb;
    const g = t < this.stingUntil ? 1e-4 : Math.pow(10, db / 20);
    if (Math.abs(g - this.duckTo) > 1e-5) {
      const p = this.duck.gain, tau = g === 1e-4 ? F.stingDuck : this.duckTo === 1e-4 ? F.stingReturn : g < this.duckTo ? F.duckDown : F.duckUp;
      p.cancelScheduledValues(t); p.setTargetAtTime(g, t, tau);
      this.duckTo = g;
    }
    const v = this.volume();
    if (Math.abs(v - this.vol) > 1e-4) { const p = this.bus.gain; p.cancelScheduledValues(t); p.setTargetAtTime(v, t, 0.05); this.vol = v; }
  },
  // ---- loading: fetch + decode, lazily; at most two decoded songs
  load(song) {
    if (this.bufs.has(song)) return Promise.resolve(true);
    if (this.failed.has(song)) return Promise.resolve(false);
    if (this.loading.has(song)) return this.loading.get(song);
    const p = this.fetchBytes(song).then((ab) => this.decode(ab)).then((buf) => {
      this.loading.delete(song); this.prune(); this.bufs.set(song, buf); this.prune(); return true;   // (drop first: never three at once)
    }).catch((e) => {
      this.loading.delete(song); this.failed.add(song); this.warn(song, e);
      return false;
    });
    this.loading.set(song, p);
    return p;
  },
  warn(song, e) { if (typeof console !== 'undefined') console.warn('music: could not load ' + song + ': ' + (e && e.message || e)); },
  fetchBytes(song) {
    const ab = this.bytes.get(song);
    if (ab) { this.bytes.delete(song); return ab.then ? ab : Promise.resolve(ab); }
    if (typeof fetch !== 'function') return Promise.reject(new Error('no fetch'));
    return fetch(this.songs[song].src).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); });
  },
  decode(ab) {
    return new Promise((res, rej) => {
      try { const p = this.ctx.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); } catch (e) { rej(e); }
    });
  },
  preload() {   // decode the level's next likely song (only with a free slot: one song playing, nothing fading or loading)
    const s = this.aheadSong;
    if (s && !this.fading.length && !this.loading.size && !(this.cur && this.cur.song === s) && !this.bufs.has(s) && this.bufs.size < 2) this.load(s);
    const st = this.cur && this.songs[this.cur.song].sting;   // and the sting the song playing may cue (the tribune's SIGNED)
    if (st && !this.stingBufs.has(st) && !this.failed.has(st) && !this.loading.size) this.loadSting(st);
  },
  prefetchNext() {   // the next level's file, fetched (not decoded) while this one plays, so the change is quick
    if (typeof fetch !== 'function') return;
    const D = level.name === 'bar' ? { name: 'street' } : levelList().find(L => L.after === level.name);
    const song = D && this.entry(D.name);
    if (!song || !this.songs[song] || (this.cur && this.cur.song === song) || this.bufs.has(song) || this.bytes.has(song) || this.loading.has(song) || this.failed.has(song)) return;
    this.bytes.clear();
    const p = fetch(this.songs[song].src).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); });
    this.bytes.set(song, p);
    p.then((ab) => { if (this.bytes.get(song) === p) this.bytes.set(song, ab); }, () => { if (this.bytes.get(song) === p) this.bytes.delete(song); });
  },
  prune() {   // drop decoded songs nobody is playing or about to play (the expected next one only while nothing is fading)
    const keep = new Set([this.want, this.cur && this.cur.song, ...this.fading.map(v => v.song)]);
    if (!this.fading.length) keep.add(this.aheadSong);
    for (const s of [...this.bufs.keys()]) if (!keep.has(s)) this.bufs.delete(s);
  },
};
