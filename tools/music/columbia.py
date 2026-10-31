from engine import *
from threeway import diat

def build():
    S = Song(152, 43)
    S.add_inst('kick', kick, gain=0.65, punch=1.1)
    S.add_inst('snare', snare, gain=0.9, gate=0.65, tone=180)
    S.add_inst('clap', clap, pan=-0.1, gain=1.0, gate=0.3)
    S.add_inst('hat', hat, pan=0.35, gain=1.2)
    S.add_inst('ohat', hat, pan=0.35, gain=0.5, open_=True)
    S.add_inst('ride', ride, pan=0.4, gain=0.5, rev=0.1)
    S.add_inst('crash', crash, pan=-0.3, gain=0.45, rev=0.25)
    S.add_inst('tom', tom, gain=0.5, rev=0.25)
    S.add_inst('timp', taiko, gain=0.5, rev=0.5, big=True)          # orchestral timpani hits
    S.add_inst('bass', bass_pick, gain=0.75, sc=0.35, bright=1.6)
    S.add_inst('sub', sub, gain=0.4, sc=0.5)
    S.add_inst('ubass', bass_upright, gain=0.6)
    S.add_inst('tpt', brass, pan=0.1, gain=1.6, rev=0.35, dly=0.12, bright=1.4, swell=0.035)
    S.add_inst('sax', sax, pan=-0.25, gain=0.7, rev=0.3)
    S.add_inst('hit', stab, pan=0.2, gain=0.65, rev=0.35)
    S.add_inst('swell', brass, pan=-0.2, gain=0.5, rev=0.45, bright=1.1, swell=0.6)
    S.add_inst('strings', supersaw, gain=0.5, rev=0.5, wide=True, sc=0.5, a=0.5, r=0.9, cut=3000)
    S.add_inst('organ', organ, pan=0.3, gain=0.4, rev=0.25, sc=0.3)
    S.add_inst('piano', piano, pan=-0.3, gain=0.3, rev=0.25)

    Fm, Db, C, Ab, Eb, Bbm = 41, 37, 36, 44, 39, 46
    CH = {Fm: (0, 3, 7), Db: (0, 4, 7, 11), C: (0, 4, 7, 10), Ab: (0, 4, 7), Eb: (0, 4, 7, 10), Bbm: (0, 3, 7)}

    RIFF = [[(0, 0), (0.75, 0), (1.5, 3), (2, 0), (2.5, 5), (3, 6), (3.5, 7)],
            [(0, 12), (0.75, 10), (1.5, 7), (2, 0), (2.5, 3), (3, 5), (3.5, 3)]]

    def drums(bar, dbl=True, fill=False, ride_=False):
        b = bar * 4
        for k in (0, 1.75, 2.5): S.note('kick', b + k, 0.5, vel=1 if k != 1.75 else 0.75)
        for k in (1, 3): S.note('snare', b + k, 0.5); S.note('clap', b + k, 0.5, vel=0.7)
        if ride_:
            for k in range(4): S.note('ride', b + k, 1, vel=0.9)
        step = 0.25 if dbl else 0.5
        for i in range(int(4 / step)): S.note('hat', b + i * step, step, vel=[1, 0.4, 0.7, 0.4][i % 4] if dbl else 0.8)
        if bar % 2: S.note('ohat', b + 3.5, 0.5, vel=0.8)
        if fill:
            for i, m in enumerate([55, 55, 50, 50, 45, 45, 40, 40]): S.note('tom', b + 2 + i * 0.25, 0.25, m, 0.85)

    def riff(bar, r, half=0):
        for k, o in RIFF[(bar + half) % 2]:
            S.note('bass', bar * 4 + k, 0.4, r + o, 1.0 if k in (0, 2) else 0.85)
        S.note('sub', bar * 4, 3.9, r - 12 + (12 if r < 38 else 0), 0.7)

    def strings(bar, r, beats=4, v=1.0):
        for o in CH[r]: S.note('strings', bar * 4, beats, r + 24 + o, v)

    def hits(bar, r, pattern):   # brass-section hits on chord tones
        notes = [r + 24 + o for o in CH[r]][:3] + [r + 36]
        for k, d in pattern: S.chord('hit', bar * 4 + k, d, notes, 1.0)

    def theme(base_bar, inst, root, v=1.0, harm=None):
        for (bt, d, s) in THEME:
            S.note(inst, base_bar * 4 + bt, d * 0.92, root + s, v)
            if harm: S.note(harm, base_bar * 4 + bt, d * 0.92, root + diat(s, -2) - 12 + 12, v * 0.8)

    # ---- intro: searchlights. Swelling brass, timpani, then the riff alone
    for bar, r in ((0, Fm), (1, Db)):
        for o in CH[r]: S.note('swell', bar * 4, 3.8, r + 24 + o, 1.0)
        S.note('timp', bar * 4, 1, vel=1.0); S.note('crash', bar * 4, 2, vel=0.6)
        strings(bar, r, 4, 0.8)
    for bar in (2, 3):
        riff(bar, Fm)
        for i in range(8): S.note('hat', bar * 4 + i * 0.5, 0.5, vel=0.6)
    for k in (14, 14.5, 15, 15.5): S.note('timp', k, 0.5, vel=0.8)
    hits(3, Fm, [(3.5, 0.4)])

    # ---- A: the riff, gated drums, brass hits, organ grit
    progA = [Fm, Fm, Db, C, Fm, Fm, Db, C]
    for i, r in enumerate(progA):
        bar = 4 + i; drums(bar, fill=(i == 7)); riff(bar, r)
        if i % 2 == 0: hits(bar, r, [(0, 0.3), (1.5, 0.3)])
        else: hits(bar, r, [(3, 0.25), (3.5, 0.5)])
        if i >= 4:
            for k in (0.5, 1.5, 2.5, 3.5): S.chord('organ', bar * 4 + k, 0.3, [r + 24 + o for o in CH[r][:3]], 0.7)
    S.note('crash', 16, 2)

    # ---- B: trumpet on the theme, strings, brass swells
    progB = [Fm, Ab, Eb, None]
    for rep in range(2):
        base = 12 + rep * 4
        for i, r in enumerate(progB):
            bar = base + i; drums(bar, fill=(bar == 19), ride_=(rep == 1))
            if r is None:
                riff(bar, Db); strings(bar, Db, 2)
                for o in CH[C]: S.note('strings', bar * 4 + 2, 2, C + 24 + o, 1.0)
                hits(bar, C, [(2, 0.3), (2.75, 0.3), (3.5, 0.5)])
            else:
                riff(bar, r); strings(bar, r)
                for o in CH[r][:3]: S.note('swell', bar * 4, 3.6, r + 12 + o, 0.55)
        theme(base, 'tpt', 65, 1.0, harm='sax' if rep == 1 else None)
        S.note('crash', base * 4, 2); S.note('timp', base * 4, 1)

    # ---- bridge: the Royal Hotel gala. 8 bars of swing big band, still punching
    SW = 0.66
    FORM = [Db, Db, Fm, Fm, Bbm, Bbm, C, C]
    VOX = {Db: [60, 65, 68, 72], Fm: [56, 60, 63, 65], Bbm: [61, 65, 68, 70], C: [58, 64, 67, 70]}
    for i, r in enumerate(FORM):
        bar = 20 + i; b = bar * 4
        for k in (0, 1, 1 + SW, 2, 3, 3 + SW): S.note('ride', b + k, 0.5, vel=1.0 if k in (1, 3) else 0.75)
        for k in (1, 3): S.note('snare', b + k, 0.5, vel=0.9)
        for k in (0, 2): S.note('kick', b + k, 0.5, vel=0.9)
        nr = FORM[(i + 1) % 8]; walk = [r, r + 4 if r != Fm and r != Bbm else r + 3, r + 7, nr - 1]
        for k, m in enumerate(walk): S.note('ubass', b + k, 0.9, m, 1.0)
        for k, d in ((0, 0.9), (1 + SW, 0.4)): S.chord('piano', b + k, d, VOX[r], 0.8)
        if i % 2 == 0:
            for k, d in ((0, 0.3), (SW, 0.3), (1 + SW, 0.3), (2 + SW, 1.2)): S.chord('hit', b + k, d, [m + 12 for m in VOX[r]], 0.95)
        else:
            for k, d in ((1 + SW, 0.3), (2, 0.3), (3, 0.8)): S.chord('hit', b + k, d, [m + 12 for m in VOX[r]], 0.9)
    lick = [(0, 72), (SW, 75), (1, 77), (1 + SW, 80), (2, 79), (2 + SW, 77), (3, 75), (3 + SW, 72)]
    for bar in (21, 23, 25):
        for k, m in lick: S.note('sax', bar * 4 + k, 0.3, m - (0 if bar != 25 else 2), 0.9)
    for k, m in enumerate([77, 80, 84, 89]): S.note('tpt', 27 * 4 + k * 0.5, 0.45, m, 1.0)
    S.note('tpt', 27 * 4 + 2, 1.8, 91, 1.0); S.note('crash', 80, 2)

    # ---- break: riff alone, claps, then the band crashes back in
    for bar in range(28, 32):
        riff(bar, Fm)
        for k in (1, 3): S.note('clap', bar * 4 + k, 0.5, vel=1.0)
        S.note('kick', bar * 4, 0.5)
        if bar >= 30:
            for i in range(8): S.note('hat', bar * 4 + i * 0.5, 0.5, vel=0.7)
    for k in (124, 124.5, 125, 125.5, 126, 126.5, 127, 127.5): S.note('timp', k, 0.5, vel=0.5 + (k - 124) * 0.12)
    for o in CH[C]: S.note('swell', 120, 8, C + 24 + o, 1.0)

    # ---- B': theme an octave up with sax harmony, everything in
    for rep in range(2):
        base = 32 + rep * 4
        for i, r in enumerate(progB):
            bar = base + i; drums(bar, fill=(bar == 39), ride_=True)
            if r is None:
                riff(bar, Db)
                for o in CH[C]: S.note('strings', bar * 4 + 2, 2, C + 24 + o, 1.0)
                hits(bar, C, [(2, 0.3), (2.75, 0.3), (3.5, 0.5)])
            else:
                riff(bar, r); strings(bar, r, 4, 1.1)
                hits(bar, r, [(0, 0.3), (1.5, 0.3)])
        theme(base, 'tpt', 77, 1.0, harm='sax')
        S.note('crash', base * 4, 2); S.note('timp', base * 4, 1)

    # ---- ending: three hits and a held Fm(add9) with a trumpet scream
    end = 40 * 4
    for k in (0, 0.75, 1.5):
        hits(40, Fm, [(k, 0.3)]); S.note('kick', end + k, 0.5); S.note('snare', end + k, 0.5); S.note('timp', end + k, 0.5)
    for o in (0, 7, 12, 15, 19, 26): S.note('swell', end + 2.5, 5, 41 + 12 + o, 1.0)
    S.note('tpt', end + 2.5, 5, 84, 1.0); S.note('sax', end + 2.5, 5, 72, 0.8)
    S.note('bass', end + 2.5, 4, 41, 1.0); S.note('sub', end + 2.5, 5, 29, 1.0)
    S.note('crash', end + 2.5, 4); S.note('kick', end + 2.5, 1); S.note('timp', end + 2.5, 1)
    return S

if __name__ == '__main__':
    print(build().render('3-columbia.mp3'))
