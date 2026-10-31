# Tiny offline synth + sequencer for The Threeway soundtrack.
import numpy as np, subprocess
from scipy.signal import lfilter, fftconvolve

SR = 44100
RNG = np.random.default_rng(7)

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def secs(n): return np.arange(n) / SR

# ---------------- filters ----------------
def biquad(x, kind, fc, q=0.707, gain_db=0):
    fc = min(fc, SR * 0.45)
    w = 2 * np.pi * fc / SR; c, s = np.cos(w), np.sin(w); al = s / (2 * q)
    if kind == 'lp': b = [(1 - c) / 2, 1 - c, (1 - c) / 2]; a = [1 + al, -2 * c, 1 - al]
    elif kind == 'hp': b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a = [1 + al, -2 * c, 1 - al]
    elif kind == 'bp': b = [al, 0, -al]; a = [1 + al, -2 * c, 1 - al]
    elif kind == 'peak':
        A = 10 ** (gain_db / 40); b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    return lfilter(b, a, x)

def sweep_lp(x, lo, hi, env, q=0.9):
    """Filter-envelope approximation: crossfade a dark and a bright lowpass."""
    return biquad(x, 'lp', lo, q) * (1 - env) + biquad(x, 'lp', hi, q) * env

# ---------------- envelopes ----------------
def adsr(dur, a=0.005, d=0.1, s=0.7, r=0.1):
    n = int((dur + r) * SR); t = secs(n)
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    lvl = (dur / a if dur < a else (1 - (1 - s) * (dur - a) / d if dur < a + d else s))
    rel = t >= dur
    e[rel] = lvl * np.exp(-(t[rel] - dur) / max(r / 5, 1e-4))
    return e

def dec(n, tau): return np.exp(-secs(n) / tau)

# ---------------- oscillators (polyBLEP) ----------------
def _blep(t, dt):
    y = np.zeros_like(t)
    m = t < dt; x = t[m] / dt[m]; y[m] = x + x - x * x - 1
    m = t > 1 - dt; x = (t[m] - 1) / dt[m]; y[m] = x * x + x + x + 1
    return y

def phase(freq, n, ph0=None):
    f = np.broadcast_to(np.asarray(freq, float), (n,)).copy()
    dt = f / SR
    p0 = RNG.random() if ph0 is None else ph0
    return (np.cumsum(dt) + p0) % 1.0, dt

def saw(freq, n, ph0=None):
    p, dt = phase(freq, n, ph0); return 2 * p - 1 - _blep(p, dt)

def pulse(freq, n, pw=0.5, ph0=None):
    p, dt = phase(freq, n, ph0)
    a = 2 * p - 1 - _blep(p, dt); q = (p + pw) % 1; b = 2 * q - 1 - _blep(q, dt)
    return (a - b) - (a - b).mean()

def tri(freq, n):
    p, _ = phase(freq, n); return 1 - 4 * np.abs(p - 0.5)

def sine(freq, n, ph0=0.0):
    p, _ = phase(freq, n, ph0); return np.sin(2 * np.pi * p)

def vib(f, n, rate=5.5, depth=0.006, delay=0.15):
    t = secs(n); amt = np.clip((t - delay) / 0.3, 0, 1) * depth
    return f * (1 + amt * np.sin(2 * np.pi * rate * t))

def noise(n): return RNG.uniform(-1, 1, n)

# ---------------- instruments: fn(freq, dur, vel) -> mono ----------------
def kick(f, dur, v, punch=1.0, tail=0.32):
    n = int(0.5 * SR); t = secs(n)
    fr = 46 + 120 * np.exp(-t / 0.035) * punch
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * dec(n, tail)
    x += biquad(noise(n), 'hp', 2500) * dec(n, 0.004) * 0.5
    return np.tanh(x * 1.6) * v

def snare(f, dur, v, tone=185, snap=0.17):
    n = int(0.45 * SR); t = secs(n)
    body = np.sin(2 * np.pi * np.cumsum(tone + 60 * np.exp(-t / 0.02)) / SR) * dec(n, 0.07)
    nz = biquad(biquad(noise(n), 'hp', 1200), 'lp', 9000) * dec(n, snap)
    return (body * 0.7 + nz * 0.9) * v

def clap(f, dur, v):
    n = int(0.4 * SR); x = np.zeros(n); nz = biquad(noise(n), 'bp', 1400, 1.2)
    for k, o in enumerate([0, 0.011, 0.022]):
        i = int(o * SR); x[i:] += nz[: n - i] * dec(n - i, 0.008 if k < 2 else 0.12)
    return x * 2.2 * v

def hat(f, dur, v, open_=False):
    n = int((0.35 if open_ else 0.06) * SR)
    m = sum(pulse(fr, n, 0.5) for fr in (2510, 3570, 4330, 5260, 6480, 7740)) * 0.2
    x = biquad(m + noise(n) * 0.6, 'hp', 7000) * dec(n, 0.12 if open_ else 0.018)
    return x * v

def ride(f, dur, v):
    n = int(1.4 * SR)
    m = sum(pulse(fr, n, 0.5) for fr in (3011, 4183, 5323, 6907)) * 0.25
    x = biquad(m + noise(n) * 0.3, 'hp', 5000) * (dec(n, 0.45) * 0.7 + dec(n, 0.02) * 0.6)
    x += biquad(noise(n), 'bp', 3400, 6) * dec(n, 0.6) * 0.8   # bell
    return x * v

def crash(f, dur, v):
    n = int(2.6 * SR)
    m = sum(pulse(fr, n, 0.5) for fr in (2210, 3170, 4430, 5590, 7330)) * 0.2
    return biquad(m + noise(n), 'hp', 3500) * dec(n, 0.8) * v

def tom(f, dur, v):
    n = int(0.6 * SR); t = secs(n)
    x = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t / 0.04))) / SR) * dec(n, 0.22)
    return (x + biquad(noise(n), 'bp', 900, 1) * dec(n, 0.03) * 0.4) * v

def taiko(f, dur, v, big=True):
    n = int((1.6 if big else 0.6) * SR); t = secs(n)
    base = 52 if big else 140
    x = np.sin(2 * np.pi * np.cumsum(base * (1 + 0.9 * np.exp(-t / 0.05))) / SR) * dec(n, 0.55 if big else 0.13)
    skin = biquad(noise(n), 'bp', 300 if big else 900, 0.8) * dec(n, 0.05 if big else 0.02)
    return np.tanh((x * 1.4 + skin * 0.9) * 1.3) * v

def clack(f, dur, v):  # hyoshigi / woodblock
    n = int(0.12 * SR)
    x = (np.sin(2 * np.pi * 1850 * secs(n)) + 0.6 * np.sin(2 * np.pi * 2770 * secs(n))) * dec(n, 0.018)
    return (x + biquad(noise(n), 'bp', 2400, 3) * dec(n, 0.006)) * v

def snare_roll(f, dur, v):  # march-snare buzz roll for `dur` seconds
    n = int((dur + 0.3) * SR); x = np.zeros(n); step = 0.042; k = 0; t0 = 0.0
    while t0 < dur:
        hit = snare(0, 0, 1, tone=210, snap=0.09)[: int(0.2 * SR)]
        g = 0.35 + 0.65 * (t0 / max(dur, 1e-3)); i = int(t0 * SR)
        e = min(n, i + len(hit)); x[i:e] += hit[: e - i] * g * (0.85 + 0.3 * RNG.random()); t0 += step
    return x * v * 0.5

# --- pitched ---
def bass_pick(f, dur, v, bright=1.0):  # post-punk / rock picked bass
    e = adsr(dur, 0.002, 0.25, 0.55, 0.06); n = len(e)
    x = saw(f, n) * 0.7 + pulse(f * 0.5, n, 0.5) * 0.25 + sine(f * 0.5, n) * 0.5
    fe = dec(n, 0.09)
    return np.tanh(sweep_lp(x, 260, 2400 * bright, fe) * 1.6) * e * v

def bass_fm(f, dur, v, idx=3.0):  # punchy neon FM bass
    e = adsr(dur, 0.002, 0.12, 0.6, 0.05); n = len(e); t = secs(n)
    I = idx * (0.25 + 0.75 * np.exp(-t / 0.07))
    mod = np.sin(2 * np.pi * f * t) * I
    x = np.sin(2 * np.pi * f * t + mod) + 0.5 * np.sin(2 * np.pi * f * 0.5 * t)
    return np.tanh(x * 1.3) * e * v

def bass_upright(f, dur, v):
    n = int((min(dur, 0.6) + 0.15) * SR); t = secs(n)
    x = sine(f, n) + 0.35 * sine(2 * f, n) + 0.12 * tri(3 * f, n)
    e = np.minimum(t / 0.004, 1) * (0.25 + 0.75 * dec(n, 0.18)) * np.where(t < dur, 1, np.exp(-(t - dur) / 0.03))
    thump = biquad(noise(n), 'lp', 600) * dec(n, 0.015) * 0.5
    return (x * e + thump) * v

def guitar(f, dur, v, mute=False):  # distorted power-chord voice (root + 5th + oct)
    e = adsr(dur, 0.003, 0.1 if mute else 0.4, 0.4 if mute else 0.75, 0.05 if mute else 0.15); n = len(e)
    x = sum(saw(fr * (1 + d), n) for fr in (f, f * 1.4983, f * 2) for d in (-0.003, 0.004))
    x = sweep_lp(x, 900 if mute else 1800, 1600 if mute else 3800, dec(n, 0.05 if mute else 0.2))
    x = np.tanh(x * 6) * 0.5
    x = biquad(biquad(x, 'lp', 4500), 'peak', 800, 1.0, -4)
    return x * e * v

def supersaw(f, dur, v, a=0.25, r=0.6, cut=2600, voices=5, det=0.012):
    e = adsr(dur, a, 0.3, 0.85, r); n = len(e)
    x = sum(saw(f * (1 + det * (k - (voices - 1) / 2) / ((voices - 1) / 2)), n) for k in range(voices)) / voices
    return biquad(x, 'lp', cut, 0.8) * e * v

def lead_saw(f, dur, v, cut=4200):
    e = adsr(dur, 0.006, 0.2, 0.75, 0.12); n = len(e); fv = vib(f, n, 5.8, 0.008, 0.18)
    x = saw(fv * 1.003, n) * 0.5 + saw(fv * 0.997, n) * 0.5 + pulse(fv * 2, n, 0.3) * 0.15
    return sweep_lp(x, 1200, cut, dec(n, 0.25) * 0.6 + 0.4) * e * v

def brass(f, dur, v, bright=1.0, swell=0.07):
    e = adsr(dur, swell * 0.6, 0.15, 0.85, 0.14); n = len(e); t = secs(n)
    fv = vib(f, n, 5.2, 0.007, 0.25) * (1 - 0.012 * np.exp(-t / 0.03))
    x = sum(saw(fv * (1 + d), n) for d in (-0.004, 0.0, 0.005)) / 3
    fe = np.clip(t / swell, 0, 1) * (0.7 + 0.3 * dec(n, 0.3))
    return sweep_lp(x, 500, 3200 * bright, fe, 1.1) * e * v

def stab(f, dur, v):  # short big-band / 80s brass stab
    return brass(f, min(dur, 0.22), v, 1.3, 0.025)

def sax(f, dur, v):
    e = adsr(dur, 0.02, 0.2, 0.8, 0.1); n = len(e); fv = vib(f, n, 5.0, 0.012, 0.2)
    x = pulse(fv, n, 0.36) * 0.6 + saw(fv, n) * 0.4
    x = biquad(biquad(x, 'bp', 1100, 0.7), 'peak', 2600, 2, 5) + biquad(noise(n), 'bp', 2000, 2) * 0.04
    return np.tanh(x * 2) * e * v

def accordion(f, dur, v):  # bayan: two reeds a few cents apart + bellows tremolo
    e = adsr(dur, 0.02, 0.1, 0.9, 0.08); n = len(e); t = secs(n)
    x = pulse(f * 1.0045, n, 0.42) + pulse(f * 0.9965, n, 0.42) + 0.4 * pulse(f * 2, n, 0.3)
    x = biquad(biquad(x, 'lp', 3600), 'peak', 1400, 1.2, 4) * (1 + 0.08 * np.sin(2 * np.pi * 6.2 * t))
    return x * e * v * 0.5

def choir(f, dur, v, vowel='ah'):  # formant "ah"/"oh" pad
    e = adsr(dur, 0.35, 0.3, 0.9, 0.7); n = len(e)
    src = sum(saw(vib(f * (1 + d), n, 4.6 + d * 100, 0.005, 0.0), n) for d in (-0.006, 0.0, 0.007))
    fm = {'ah': [(750, 1.0), (1150, 0.6), (2800, 0.25)], 'oh': [(450, 1.0), (800, 0.5), (2830, 0.15)]}[vowel]
    x = sum(biquad(src, 'bp', fr, 5) * g for fr, g in fm)
    return x * e * v * 1.4

def chant(f, dur, v):  # short shouted syllable
    e = adsr(min(dur, 0.25), 0.012, 0.08, 0.6, 0.08); n = len(e)
    src = saw(f * (1 + 0.04 * np.exp(-secs(n) / 0.05)), n) + noise(n) * 0.25
    x = sum(biquad(src, 'bp', fr, 4) * g for fr, g in [(820, 1.0), (1250, 0.7), (2600, 0.3)])
    return np.tanh(x * 2.5) * e * v

def bell(f, dur, v, ratio=3.5, idx=2.2, tau=1.4):  # FM bell / gamelan
    n = int((max(dur, 0.2) + tau * 2) * SR); t = secs(n)
    mod = np.sin(2 * np.pi * f * ratio * t) * idx * np.exp(-t / (tau * 0.4))
    return np.sin(2 * np.pi * f * t + mod) * dec(n, tau) * np.minimum(t / 0.002, 1) * v

def koto(f, dur, v, damp=0.996):  # Karplus-Strong pluck via comb IIR
    n = int((dur + 1.2) * SR); N = max(2, int(round(SR / f)))
    exc = np.zeros(n); burst = biquad(noise(N), 'lp', 5000); exc[:N] = burst
    a = np.zeros(N + 2); a[0] = 1; a[N] = -damp * 0.5; a[N + 1] = -damp * 0.5
    y = lfilter([1.0], a, exc)
    y = biquad(y, 'peak', 2200, 1.5, 5)
    rel = np.where(secs(n) < dur + 0.3, 1, np.exp(-(secs(n) - dur - 0.3) / 0.15))
    return y * rel * v * 1.4

def piano(f, dur, v):
    n = int((dur + 0.4) * SR); t = secs(n); x = np.zeros(n)
    for h, g in [(1, 1), (2, 0.5), (3, 0.3), (4, 0.18), (5, 0.1), (6, 0.06)]:
        fh = f * h * np.sqrt(1 + 0.0004 * h * h)
        if fh < SR / 2.2: x += g * np.sin(2 * np.pi * fh * t) * dec(n, 1.2 / (1 + 0.6 * h))
    x *= np.minimum(t / 0.002, 1) * np.where(t < dur, 1, np.exp(-(t - dur) / 0.08))
    x += biquad(noise(n), 'bp', 3000, 1) * dec(n, 0.006) * 0.15
    return x * v

def organ(f, dur, v):
    e = adsr(dur, 0.006, 0.05, 1.0, 0.06); n = len(e); t = secs(n)
    fl = f * (1 + 0.003 * np.sin(2 * np.pi * 6.6 * t))
    x = sum(g * sine(fl * h, n, 0) for h, g in [(0.5, 0.6), (1, 1), (2, 0.7), (3, 0.5), (4, 0.3), (6, 0.15)])
    x += biquad(noise(n), 'bp', 2500, 2) * dec(n, 0.01) * 0.3  # key click
    return np.tanh(x * 0.6) * e * v

def arp_pluck(f, dur, v, cut=3500):  # synthwave pluck
    e = adsr(dur, 0.002, 0.14, 0.15, 0.08); n = len(e)
    x = saw(f, n) * 0.6 + pulse(f * 1.005, n, 0.25) * 0.4
    return sweep_lp(x, 500, cut, dec(n, 0.08)) * e * v

def sub(f, dur, v):
    e = adsr(dur, 0.004, 0.1, 0.9, 0.05); return sine(f, len(e)) * e * v

# ---------------- song / mixer ----------------
class Song:
    def __init__(self, bpm, bars, swing=0.0, beats_per_bar=4):
        self.bpm, self.bars, self.swing, self.bpb = bpm, bars, swing, beats_per_bar
        self.spb = 60.0 / bpm
        self.len = int((bars * beats_per_bar * self.spb + 4.0) * SR)
        self.tracks = {}; self.kicks = []

    def add_inst(self, name, fn, pan=0.0, rev=0.0, dly=0.0, sc=0.0, gain=1.0, wide=False, gate=0.0, **kw):
        self.tracks[name] = dict(fn=fn, pan=pan, rev=rev, dly=dly, sc=sc, gain=gain, wide=wide, gate=gate, kw=kw,
                                 buf=np.zeros(self.len))

    def t(self, beat):
        if self.swing and abs((beat % 1) - 0.5) < 1e-6: beat += self.swing
        return beat * self.spb

    def note(self, name, beat, dur, midi=60, vel=1.0, **kw):
        tr = self.tracks[name]; kk = dict(tr['kw']); kk.update(kw)
        x = tr['fn'](mtof(midi) if midi else 0, dur * self.spb, vel, **kk)
        i = int(self.t(beat) * SR); e = min(self.len, i + len(x))
        if i < self.len: tr['buf'][i:e] += x[: e - i]
        if name.startswith('kick'): self.kicks.append(self.t(beat))

    def chord(self, name, beat, dur, notes, vel=1.0, **kw):
        for m in notes: self.note(name, beat, dur, m, vel, **kw)

    def render(self, path, loop_bars=None, master=0.9):
        L = np.zeros(self.len); R = np.zeros(self.len)
        revL = np.zeros(self.len); revR = np.zeros(self.len); dl = np.zeros(self.len); gt = np.zeros(self.len)
        # sidechain curve from kicks
        scc = np.ones(self.len)
        for kt in self.kicks:
            i = int(kt * SR); m = min(self.len - i, int(0.3 * SR))
            if m > 0: scc[i:i + m] = np.minimum(scc[i:i + m], 1 - 0.85 * np.exp(-secs(m) / 0.09))
        for name, tr in self.tracks.items():
            x = tr['buf'] * tr['gain']
            if tr['sc']: x = x * (1 - tr['sc'] * (1 - scc))
            p = (tr['pan'] + 1) * np.pi / 4; l, r = x * np.cos(p), x * np.sin(p)
            if tr['wide']: d = int(0.013 * SR); r = np.concatenate([np.zeros(d), r[:-d]])
            L += l; R += r
            revL += l * tr['rev']; revR += r * tr['rev']; dl += x * tr['dly']; gt += x * tr['gate']
        # hall reverb
        n = int(2.4 * SR)
        for buf, out, seed in ((revL, L, 1), (revR, R, 2)):
            ir = np.random.default_rng(seed).uniform(-1, 1, n) * dec(n, 0.45)
            ir = biquad(biquad(ir, 'lp', 5200), 'hp', 180); ir[: int(0.018 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
            out += fftconvolve(buf, ir)[: self.len] * 0.55
        # 80s gated reverb (snare)
        if gt.any():
            n = int(0.3 * SR)
            for out, seed in ((L, 3), (R, 4)):
                ir = np.random.default_rng(seed).uniform(-1, 1, n) * np.where(secs(n) < 0.24, 1, 0.0) * (0.8 + 0.2 * dec(n, 0.2))
                ir = biquad(ir, 'lp', 7000); ir /= np.sqrt((ir ** 2).sum())
                out += fftconvolve(gt, ir)[: self.len] * 0.5
        # ping-pong dotted-eighth delay
        if dl.any():
            d = int(self.spb * 0.75 * SR); fb = 0.38; tap = biquad(dl, 'lp', 3500)
            for k in range(1, 7):
                sh = d * k
                if sh >= self.len: break
                y = np.concatenate([np.zeros(sh), tap[:-sh]]) * fb ** k * 0.7
                (L if k % 2 else R)[:] += y
        mix = np.stack([L, R])
        mix = biquad(mix, 'hp', 28)
        # glue: gentle compression via soft clip on a normalized bus
        pk = np.abs(mix).max(); mix = mix / pk * 1.6; mix = np.tanh(mix) / np.tanh(1.6)
        if loop_bars is not None:   # trim to an exact loop length, fold the tail onto the head
            end = int(loop_bars * self.bpb * self.spb * SR); tail = mix[:, end:]
            mix = mix[:, :end].copy(); k = min(tail.shape[1], end); mix[:, :k] += tail[:, :k]
            mix = np.tanh(mix * 1.0)
        mix *= master / np.abs(mix).max()
        pcm = (mix.T * 32767).astype(np.int16)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-',
                        '-b:a', '192k', path], input=pcm.tobytes(), check=True)
        rms = 20 * np.log10(np.sqrt((mix ** 2).mean()))
        return mix.shape[1] / SR, rms

# Main theme ("the Threeway motif"), in minor-scale semitones from the tonic, 4 bars.
THEME = [(0, 1.5, 7), (1.5, 0.5, 5), (2, 1, 3), (3, 1, 5), (4, 1.5, 7), (5.5, 0.5, 10), (6, 2, 12),
         (8, 1.5, 10), (9.5, 0.5, 8), (10, 1, 7), (11, 1, 5), (12, 1.5, 3), (13.5, 0.5, 2), (14, 2, 0)]
