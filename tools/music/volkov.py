from act1 import *

def build():
    S = Song(104, 34)
    S.add_inst('kick', kick, gain=0.65, punch=1.3, tail=0.4)
    S.add_inst('snare', snare, gain=1.1, gate=0.8, tone=160)
    S.add_inst('hat', hat, pan=0.3, gain=0.8)
    S.add_inst('crash', crash, pan=-0.3, gain=0.45, rev=0.3)
    S.add_inst('tom', tom, gain=0.6, rev=0.3)
    S.add_inst('taiko', taiko, gain=0.6, rev=0.45)
    S.add_inst('ringbell', ringbell, pan=0.15, gain=0.45, rev=0.5)
    S.add_inst('crowd', crowd, gain=0.4, rev=0.3, wide=True)
    S.add_inst('roar', roar, gain=0.75, rev=0.4, wide=True)
    S.add_inst('hey', hey, gain=1.0, rev=0.45, wide=True)
    S.add_inst('gtrL', guitar, pan=-0.6, gain=0.9, sc=0.15)
    S.add_inst('gtrR', guitar, pan=0.6, gain=0.9, sc=0.15)
    S.add_inst('gmL', guitar, pan=-0.6, gain=0.7, mute=True)
    S.add_inst('gmR', guitar, pan=0.6, gain=0.7, mute=True)
    S.add_inst('bass', bass_pick, gain=0.6, sc=0.25, bright=1.4)
    S.add_inst('sub', sub, gain=0.35, sc=0.3)
    S.add_inst('tuba', tuba, gain=1.45, rev=0.35)
    S.add_inst('brass', brass, pan=0.1, gain=1.4, rev=0.35, bright=1.2)
    S.add_inst('brass2', brass, pan=-0.2, gain=0.85, rev=0.35)
    S.add_inst('lead', lead_saw, gain=1.3, rev=0.3, dly=0.2)
    S.add_inst('choiro', choir, gain=0.35, rev=0.6, wide=True, vowel='oh')
    S.add_inst('choir', choir, gain=0.3, rev=0.55, wide=True)

    C, Eb, F, G, Gb, Bb, Ab, Fm = 36, 39, 41, 43, 42, 46, 44, 41
    Q = {C: MIN, Eb: MAJ, Bb: MAJ, Fm: MIN, G: MAJ, Ab: MAJ}

    def power(t, d, r, v=1.0, mute=False):
        for g in (('gmL', 'gmR') if mute else ('gtrL', 'gtrR')): S.note(g, t, d, r, v)
        S.note('bass', t, d, r, v)

    def riff(bar, v=1.0):   # bar a: C . Eb F~ | bar b: C~ G~ Gb~  (the tritone)
        b = bar * 4
        if bar % 2 == 0: parts = [(0, 1.4, C, 0), (1.5, 0.4, C, 1), (2, 0.45, Eb, 0), (2.5, 1.4, F, 0)]
        else: parts = [(0, 1.4, C, 0), (1.5, 0.9, G, 0), (2.5, 1.4, Gb, 0)]
        for t, d, r, m in parts: power(b + t, d, r, v, bool(m))
        S.note('sub', b, 3.9, 24, 0.8)

    def heavy(bar, crash=False, fill=False):   # half-time
        b = bar * 4
        for k in (0, 0.75, 2.5, 3.25): S.note('kick', b + k, 0.5, vel=1 if k in (0, 2.5) else 0.75)
        S.note('snare', b + 2, 0.5)
        for j in range(8): S.note('hat', b + j * 0.5, 0.5, vel=0.8 if j % 2 == 0 else 0.45)
        S.note('taiko', b, 1, vel=0.8)
        if crash: S.note('crash', b, 2)
        if fill:
            for i, m in enumerate([50, 50, 45, 45, 41, 41, 36, 36]): S.note('tom', b + 2 + i * 0.25, 0.25, m, 0.9)

    def fast(bar, fill=False):   # enraged: full time, 16ths
        b = bar * 4
        for k in (0, 0.5, 1.5, 2, 2.5, 3.5): S.note('kick', b + k, 0.5, vel=0.95)
        for k in (1, 3): S.note('snare', b + k, 0.5)
        for j in range(16): S.note('hat', b + j * 0.25, 0.25, vel=[1, 0.4, 0.7, 0.4][j % 4])
        if fill:
            for i, m in enumerate([55, 52, 50, 48, 45, 43, 41, 38]): S.note('tom', b + 2 + i * 0.25, 0.25, m, 0.9)

    S.note('crowd', 0, 34 * 4, vel=1.0, bright=1000)
    # ---- the bell: ding ding ding. The arena erupts. Taiko
    for k in (0, 0.55, 1.1): S.note('ringbell', k, 0.5, vel=1.0)
    S.note('roar', 0.2, 3, vel=1.0)
    for k in (4, 5.5, 6, 7, 7.5): S.note('taiko', k, 0.5, vel=1.0 if k in (4, 6) else 0.6)
    chord(S, 'choiro', 1, 4, C, (0, 6, 12), 0.7)   # a tritone in the choir
    # ---- the riff
    for i in range(8):
        bar = 2 + i; heavy(bar, crash=(i % 4 == 0), fill=(i == 7)); riff(bar)
        if i >= 4: chord(S, 'choiro', bar, 4, C, (0, 7, 12), 0.6)
    # ---- the theme on the tuba and low brass, guitars ringing out the chords
    for rep in range(2):
        base = 10 + rep * 4
        for i, r in enumerate([C, Eb, Bb, None]):
            bar = base + i; b = bar * 4
            heavy(bar, crash=(i == 0), fill=(bar == 17))
            if r is None:
                power(b, 1.9, Fm, 0.9); power(b + 2, 1.9, G, 1.0)
                chord(S, 'choiro', bar, 2, Fm, MIN); chord(S, 'choiro', bar, 2, G, MAJ, at=2)
            else:
                power(b, 1.4, r); power(b + 1.5, 0.4, r, 0.8, True); power(b + 2, 1.9, r, 0.9)
                chord(S, 'choiro', bar, 4, r, Q[r])
            S.note('sub', b, 3.9, (r or Fm) - 12, 0.8)
        theme(S, base, 'tuba', 48, 1.0)
        if rep: theme(S, base, 'brass', 60, 0.9, harm='brass2', hv=0.75)
    # ---- break: the crowd chants his name over the taiko
    for i in range(4):
        bar = 18 + i; b = bar * 4
        for k, big in ((0, 1), (1, 1), (1.75, 0), (2, 0), (2.5, 1), (3.5, 1)): S.note('taiko', b + k, 0.5, vel=1.0 if big else 0.6)
        S.note('kick', b, 0.5); S.note('kick', b + 2.5, 0.5, vel=0.7)
        S.note('hey', b + 1, 0.3, 50, 1.0); S.note('hey', b + 2, 0.3, 45, 1.0)
        S.note('bass', b, 3.8, C, 0.8); S.note('sub', b, 3.9, 24, 0.9)
        if i >= 2:
            for j in range(8): S.note('gmL', b + j * 0.5, 0.3, C, 0.5 + 0.06 * j); S.note('gmR', b + j * 0.5, 0.3, C, 0.5 + 0.06 * j)
    S.note('roar', 86, 3, vel=1.0)
    for i in range(8): S.note('snare', 86 + i * 0.25, 0.25, vel=0.4 + 0.08 * i)
    # ---- ENRAGED at half health: double time, the theme on the lead, the choir opens up
    for rep in range(2):
        base = 22 + rep * 4
        for i, r in enumerate([C, Eb, Bb, None]):
            bar = base + i; b = bar * 4
            fast(bar, fill=(bar == 29))
            rr = r or Fm
            for j in range(16):
                rt = (G if (r is None and j >= 8) else rr)
                acc = j in (0, 3, 6, 10, 12)
                for g in (('gtrL', 'gtrR') if acc else ('gmL', 'gmR')): S.note(g, b + j * 0.25, 0.22, rt, 1.0 if acc else 0.8)
                S.note('bass', b + j * 0.25, 0.22, rt, 0.95)
            if r is None: chord(S, 'choir', bar, 2, Fm, MIN); chord(S, 'choir', bar, 2, G, MAJ, at=2)
            else: chord(S, 'choir', bar, 4, r, Q[r])
            S.note('sub', b, 3.9, rr - 12, 0.9)
        theme(S, base, 'lead', 72, 1.0)
        theme(S, base, 'brass', 60, 0.85, harm='brass2', hv=0.75)
        S.note('crash', base * 4, 2); S.note('taiko', base * 4, 1)
    # ---- down: the riff once more, a held Cm, the bell
    for bar in (30, 31): heavy(bar, crash=(bar == 30)); riff(bar)
    end = 32 * 4
    power(end, 5, C, 1.0); S.note('kick', end, 1); S.note('crash', end, 4); S.note('taiko', end, 1)
    chord(S, 'choir', 32, 5, C, (0, 7, 12, 15), 1.0); S.note('tuba', end, 5, 48, 1.0); S.note('lead', end, 5, 72, 0.9)
    S.note('sub', end, 5, 24, 1.0); S.note('roar', end + 1, 4, vel=1.0)
    for k in (end + 2.5, end + 3.05, end + 3.6): S.note('ringbell', k, 0.5, vel=1.0)
    return S

if __name__ == '__main__':
    print(build().render('act1-volkov.mp3'))
