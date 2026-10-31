'use strict';
// ============================== music =======================================
// The sector themes, looped gaplessly on AU's Web Audio context (one AudioBufferSourceNode per track, loop + loopStart /
// loopEnd; never <audio loop>, which gaps). The loops are rendered by tools/music/loops.py into assets/music/loop/
// (Ogg Opus with a little of the loop's own wrap on each side of the loop points; see its header).
//
//   MUSIC.tracks: level name -> song ('menu' is the title screen). Give a level its own song by adding it to
//                 MUSIC.songs and pointing the level at it here. A level with no entry plays nothing.
//   Level changes: the same song keeps playing (levels flow into each other with no cut); another song crossfades.
//   The mix: a fight dips the music (CFG.music.fightDb), a boss's intro ducks it hard for a moment (MUSIC.cue('boss'),
//   called beside the boss sign's AU.roar()), a win or a loss brings it back. The title and the pause menu play it quietly.
//   Loading: lazy (fetch + decodeAudioData), the level you're in first, then the next level's file is fetched (not
//   decoded) ahead. At most two decoded songs are kept (the one playing and the one fading in or out).
//   Nothing happens until AU has a context (the Enter VR / desktop button's click makes it), and nothing breaks without one.
CFG.music = {
  volume: 0.4,       // the music bus at full MUSIC volume (the options' MUSIC bar), under AU.master (the VOLUME bar)
  menuDb: -8,        // the title screen and the pause menu: the theme, quietly
  fightDb: -3,       // while a fight is on
  bossDb: -14,       // a boss's intro: ducked hard for bossHold seconds, then back to fightDb
  bossHold: 2.0,
  fade: 2.5,         // crossfade from one song to another (s)
  fadeIn: 1.5,       // fade in from silence (s)
  duckDown: 0.06, duckUp: 0.45,   // time constants (s) into and out of a duck
};
const MUSIC = {
  tracks: { menu: 'threeway', bar: 'threeway', street: 'threeway',
    superblock: 'krasnovia', podezd: 'krasnovia', palace: 'krasnovia', parade: 'krasnovia', tower: 'krasnovia' },
  // start / end: the loop points (s), from tools/music/loops.py (assets/music/loop/loops.json)
  songs: {
    threeway: { src: 'assets/music/loop/1-the-threeway.ogg', start: 0.25, end: 73.293479 },
    krasnovia: { src: 'assets/music/loop/2-krasnovia.ogg', start: 0.25, end: 71.159063 },
    columbia: { src: 'assets/music/loop/3-columbia.ogg', start: 0.25, end: 68.144708 },
    hinomoto: { src: 'assets/music/loop/4-hinomoto.ogg', start: 0.25, end: 69.05 },
  },
  ctx: null, bus: null, duck: null,
  cur: null,          // the voice playing: { song, src, g }
  fading: [],         // voices fading out
  want: undefined,    // the song the level wants (null: silence)
  bufs: new Map(), loading: new Map(), bytes: new Map(), failed: new Set(),
  bossUntil: -1, duckTo: 1, vol: -1, lvl: null,

  // ---- every frame (from updateArea)
  update() {
    if (!this.ctx && !this.attach()) return;
    this.follow(); this.mix();
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
  songFor() {
    const s = this.tracks[game.state === 'menu' ? 'menu' : level.name];
    return s && this.songs[s] ? s : null;
  },
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
    const S = this.songs[song], buf = this.bufs.get(song), c = this.ctx, t = c.currentTime;
    const dur = this.cur ? CFG.music.fade : CFG.music.fadeIn;
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
  // ---- the mix: fights dip it, a boss's intro ducks it hard, menus play it quietly
  cue(what) {
    if (what === 'boss' && this.ctx) this.bossUntil = this.ctx.currentTime + CFG.music.bossHold;
  },
  mix() {
    const F = CFG.music, t = this.ctx.currentTime;
    const fight = game.state === 'intro' || game.state === 'fight';
    if (!fight) this.bossUntil = -1;   // a win or a loss ends a boss duck
    let db = game.state === 'menu' || (typeof MENU !== 'undefined' && MENU.open) ? F.menuDb : 0;
    if (fight) db += t < this.bossUntil ? F.bossDb : F.fightDb;
    const g = Math.pow(10, db / 20);
    if (Math.abs(g - this.duckTo) > 1e-4) {
      const p = this.duck.gain;
      p.cancelScheduledValues(t); p.setTargetAtTime(g, t, g < this.duckTo ? F.duckDown : F.duckUp);
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
      this.loading.delete(song); this.bufs.set(song, buf); this.prune(); return true;
    }).catch((e) => {
      this.loading.delete(song); this.failed.add(song);
      if (typeof console !== 'undefined') console.warn('music: could not load ' + song + ': ' + (e && e.message || e));
      return false;
    });
    this.loading.set(song, p);
    return p;
  },
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
  prefetchNext() {   // the next level's file, fetched (not decoded) while this one plays, so the change is quick
    if (typeof fetch !== 'function') return;
    const D = level.name === 'bar' ? { name: 'street' } : levelList().find(L => L.after === level.name);
    const song = D && this.tracks[D.name];
    if (!song || !this.songs[song] || (this.cur && this.cur.song === song) || this.bufs.has(song) || this.bytes.has(song) || this.loading.has(song) || this.failed.has(song)) return;
    this.bytes.clear();
    const p = fetch(this.songs[song].src).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); });
    this.bytes.set(song, p);
    p.then((ab) => { if (this.bytes.get(song) === p) this.bytes.set(song, ab); }, () => { if (this.bytes.get(song) === p) this.bytes.delete(song); });
  },
  prune() {   // drop decoded songs nobody is playing or about to play
    const keep = new Set([this.want, this.cur && this.cur.song, ...this.fading.map(v => v.song)]);
    for (const s of [...this.bufs.keys()]) if (!keep.has(s)) this.bufs.delete(s);
  },
};
