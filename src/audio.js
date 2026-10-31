'use strict';
// ============================== audio (placeholder tones) ===================
const AU = {
  ctx: null, master: null,
  init() {
    if (this.ctx) return;
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    this.ctx = new C(); this.master = this.ctx.createGain(); this.master.gain.value = 0.6; this.master.connect(this.ctx.destination);
  },
  tone(type, f0, f1, dur, vol, delay = 0, filter = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (filter) { const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filter; o.connect(f); node = f; }
    node.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol, freq, type = 'lowpass', delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay, n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    s.buffer = buf; f.type = type; f.frequency.value = freq; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
  },
  thud(tier) {
    if (tier === 'heavy') { this.tone('sine', 130, 38, 0.3, 0.9); this.noise(0.14, 0.7, 900); }
    else if (tier === 'solid') { this.tone('sine', 170, 60, 0.2, 0.65); this.noise(0.09, 0.45, 1400); }
    else if (tier === 'light') { this.tone('sine', 230, 120, 0.1, 0.35); this.noise(0.05, 0.25, 2200); }
    else this.noise(0.08, 0.15, 600);
  },
  clank() { this.tone('square', 1300, 900, 0.08, 0.18); this.noise(0.06, 0.2, 3000, 'highpass'); },
  grunt() { this.tone('sawtooth', 150, 92, 0.3, 0.22, 0, 700); },
  glass() { this.noise(0.3, 0.45, 3800, 'highpass'); for (let i = 0; i < 4; i++) this.tone('square', rand(2400, 5200), rand(1800, 4200), 0.05, 0.06, i * 0.03); },
  bell() { this.tone('sine', 880, 870, 1.4, 0.4); this.tone('sine', 1320, 1310, 0.9, 0.2); },
  chime() { for (const [f, d] of [[392, 0], [587, 0.18], [784, 0.36], [988, 0.54]]) this.tone('sine', f, f * 0.995, 2.2 - d, 0.2, d); this.tone('sine', 196, 194, 2.6, 0.18); },   // a reveal: a slow rising bell chord over a low one
  gulp() { this.tone('sine', 280, 180, 0.12, 0.3); this.tone('sine', 260, 170, 0.12, 0.3, 0.18); },
  hurt() { this.tone('sawtooth', 95, 58, 0.22, 0.4, 0, 500); },
  parry() { this.tone('square', 600, 1700, 0.14, 0.22); },
  whiff() { this.noise(0.12, 0.12, 1200, 'bandpass'); },
  splat() { this.noise(0.12, 0.4, 700); this.tone('sine', 160, 70, 0.12, 0.3); },
  catch() { this.tone('sine', 300, 520, 0.08, 0.3); this.noise(0.05, 0.2, 1800); },
  wood() { this.tone('triangle', 520, 300, 0.09, 0.35); this.noise(0.06, 0.3, 2400, 'bandpass'); },
  tag() { this.tone('square', 440, 440, 0.12, 0.15); this.tone('square', 660, 660, 0.18, 0.15, 0.12); },
  roar() { this.tone('sawtooth', 110, 70, 0.7, 0.35, 0, 600); this.noise(0.5, 0.25, 500); },
};
