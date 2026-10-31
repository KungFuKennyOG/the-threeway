from engine import *

def build():
    S = Song(168, 54, swing=0.16)
    S.add_inst('kick', kick, gain=1.0, tail=0.22)
    S.add_inst('snare', snare, gain=1.2, gate=0.35, tone=200)
    S.add_inst('ghost', snare, pan=0.1, gain=0.35, tone=220, snap=0.08)
    S.add_inst('ride', ride, pan=0.35, gain=0.6, rev=0.1)
    S.add_inst('hhf', hat, pan=0.3, gain=0.7)                    # hi-hat foot on 2 and 4
    S.add_inst('crash', crash, pan=-0.35, gain=0.38, rev=0.25)
    S.add_inst('tom', tom, gain=0.55, rev=0.2)
    S.add_inst('bass', bass_upright, gain=0.75)
    S.add_inst('piano', piano, pan=-0.3, gain=0.22, rev=0.25)
    S.add_inst('sax', sax, pan=0.2, gain=0.75, rev=0.3, dly=0.1)
    S.add_inst('tpt', brass, pan=-0.15, gain=1.4, rev=0.35, bright=1.4, swell=0.04)
    S.add_inst('shout', stab, pan=0.3, gain=0.75, rev=0.3)        # brass section
    S.add_inst('bones', brass, pan=-0.3, gain=0.6, rev=0.3, bright=0.9, swell=0.05)
    S.add_inst('organ', organ, pan=0.15, gain=0.55, rev=0.3)

    F7, Bb7, C7, D7, Gm7 = 41, 46, 36, 38, 43
    VOX = {F7: [57, 60, 63, 65], Bb7: [56, 58, 62, 65], C7: [58, 60, 64, 67], D7: [57, 60, 62, 66], Gm7: [58, 62, 65, 67]}
    MIX = {F7: (0, 4, 7, 9, 10), Bb7: (0, 4, 7, 9, 10), C7: (0, 4, 7, 9, 10), D7: (0, 4, 7, 9, 10), Gm7: (0, 3, 7, 10, 12)}
    FORM = [F7, F7, Bb7, F7, Bb7, Bb7, F7, D7, Gm7, C7, F7, C7]

    def drums(bar, shout=False, fill=False):
        b = bar * 4
        for k in (0, 1, 1.5, 2, 3, 3.5): S.note('ride', b + k, 0.5, vel=1.0 if k in (1, 3) else 0.7)
        for k in (1, 3): S.note('hhf', b + k, 0.25, vel=0.8)
        for k in (0, 1, 2, 3): S.note('kick', b + k, 0.5, vel=0.45)
        if shout:
            for k in (1, 3): S.note('snare', b + k, 0.5, vel=0.85)
            S.note('kick', b + 2.5, 0.5, vel=0.8)
        else:
            for k in (1.5, 2.5, 3.5): S.note('ghost', b + k, 0.25, vel=0.6 + 0.4 * RNG.random())
            if bar % 2: S.note('snare', b + 3.5, 0.25, vel=0.6)
        if fill:
            for i, (m, k) in enumerate([(52, 2), (52, 2.5), (47, 3), (43, 3.5)]): S.note('tom', b + k, 0.4, m, 0.9)
            S.note('snare', b + 2, 0.5, vel=0.9)

    def walk(bar, r, nr):
        tones = [r, r + 4, r + 7, nr + (1 if bar % 2 else -1)] if bar % 3 else [r, r + 2, r + 4, nr - 1]
        for i, m in enumerate(tones): S.note('bass', bar * 4 + i, 0.9, m, 1.0 if i == 0 else 0.85)

    def comp(bar, r):   # Charleston comping
        for k, d in ((0, 0.9), (1.5, 0.4)): S.chord('piano', bar * 4 + k, d, VOX[r], 0.75)

    def shout(bar, r, call):   # brass section riff, two flavours
        b = bar * 4; v = VOX[r]
        if call:
            for k, d in ((0, 0.3), (0.5, 0.3), (1.5, 0.3), (2.5, 1.4)): S.chord('shout', b + k, d, [m + 12 for m in v], 0.9)
        else:
            for k, d in ((1.5, 0.3), (2, 0.3), (3, 0.9)): S.chord('shout', b + k, d, [m + 12 for m in v], 0.85)
            S.chord('bones', b, 1.4, [r + 12 + 4, r + 12 + 10], 0.8)

    def theme(base_bar, inst, root, v=1.0, bars=4):
        for (bt, d, s) in THEME:
            if bt < bars * 4: S.note(inst, base_bar * 4 + bt, d * 0.9, root + s, v)

    def chorus(start, mode):
        for i, r in enumerate(FORM):
            bar = start + i; nr = FORM[(i + 1) % 12]
            last = (i == 11)
            if mode == 'stop' and i < 4:     # stop-time: band hits on one, organ answers
                S.chord('shout', bar * 4, 0.35, [m + 12 for m in VOX[r]], 1.0); S.note('kick', bar * 4, 0.5, vel=0.9)
                S.note('crash', bar * 4, 1, vel=0.5); S.note('bass', bar * 4, 0.5, r, 1.0)
                continue
            drums(bar, shout=(mode in ('shout', 'out', 'organ')), fill=last)
            walk(bar, r, nr)
            if mode != 'organ' or i % 2 == 0: comp(bar, r)
            if mode in ('shout', 'out'): shout(bar, r, call=(i % 2 == 0) or mode == 'out' and i >= 4)
        # melody
        if mode == 'head':
            theme(start, 'sax', 65); theme(start + 8, 'sax', 65, 0.9, 2)
            S.chord('bones', (start + 4) * 4, 7.5, [56, 62], 0.6); S.chord('bones', (start + 6) * 4, 7.5, [57, 63], 0.6)
            for k, m in enumerate([77, 75, 74, 72, 70, 69, 65]): S.note('sax', (start + 10) * 4 + 2 + k * 0.5, 0.45, m, 0.9)
        if mode == 'shout':
            theme(start, 'tpt', 77); theme(start + 8, 'tpt', 77, 1.0, 2)
            for k, m in enumerate([72, 75, 77, 80, 77, 75, 72, 69]): S.note('tpt', (start + 11) * 4 + k * 0.5, 0.45, m, 0.95)
        if mode == 'out':
            theme(start, 'tpt', 77); theme(start, 'sax', 65 + 4 - 4, 0.85)
            theme(start + 8, 'tpt', 77, 1.0, 2); theme(start + 8, 'sax', 65, 0.85, 2)

    def organ_lick(bar, r, seed):
        rng = np.random.default_rng(seed); scale = [0, 3, 5, 6, 7, 10, 12, 15]
        k = 0
        while k < 4:
            d = 0.5 if rng.random() < 0.7 else 1.0
            if rng.random() < 0.15: k += d; continue
            S.note('organ', bar * 4 + k, d * 0.9, 65 + scale[rng.integers(0, len(scale))], 0.9); k += d

    # ---- intro: drum break, then the band hits
    for bar in (0, 1):
        b = bar * 4
        for k in (0, 1, 1.5, 2, 3, 3.5): S.note('ride', b + k, 0.5, vel=0.8)
        for k in (0.5, 1.5, 2.5, 3, 3.5): S.note('snare', b + k, 0.25, vel=0.5 + 0.1 * k)
        S.note('kick', b, 0.5, vel=0.9); S.note('kick', b + 2.5, 0.5, vel=0.7)
    for bar, r in ((2, F7), (3, C7)):
        b = bar * 4
        for k, d in ((0, 0.35), (0.5, 0.35), (2, 0.35), (2.5, 1.2)):
            S.chord('shout', b + k, d, [m + 12 for m in VOX[r]], 1.0); S.note('kick', b + k, 0.5, vel=0.9)
            S.note('bass', b + k, d, r, 1.0)
        S.note('crash', b, 1)
    for i, m in enumerate([52, 50, 47, 45]): S.note('tom', 15 + i * 0.25, 0.25, m, 0.9)

    chorus(4, 'head')      # sax takes the theme
    S.note('crash', 64, 1)
    chorus(16, 'shout')    # trumpet + brass shout
    S.note('crash', 112, 1)
    chorus(28, 'stop')     # stop-time, organ break
    for i in range(12): organ_lick(28 + i, FORM[i], 100 + i)
    for i in range(4, 12): S.chord('organ', (28 + i) * 4, 3.8, [m - 12 for m in VOX[FORM[i]]], 0.35)
    S.note('crash', 160, 1)
    chorus(40, 'out')      # sax + trumpet in octaves, full shout
    # ---- tag + ending: F6/9 with a trumpet shake
    end = 52 * 4
    for k, d in ((0, 0.35), (0.5, 0.35), (1.5, 0.35)):
        S.chord('shout', end + k, d, [69, 72, 75, 77], 1.0); S.note('kick', end + k, 0.5, vel=0.9); S.note('snare', end + k, 0.5, vel=0.9)
    S.chord('shout', end + 2.5, 0.3, [70, 74, 77, 80], 1.0)
    S.chord('bones', end + 3, 5, [53, 57, 62, 67], 1.0)
    S.chord('piano', end + 3, 5, [53, 57, 62, 67, 69], 0.9)
    for k in range(10): S.note('tpt', end + 3 + k * 0.33, 0.33, 81 if k % 2 == 0 else 84, 0.9)
    S.note('tpt', end + 6.3, 1.5, 89, 1.0)
    S.note('bass', end + 3, 4, 29, 1.0); S.note('kick', end + 3, 1); S.note('crash', end + 3, 3)
    for i in range(12): S.note('ghost', end + 3 + i * 0.25, 0.25, vel=0.6 + i * 0.05)
    S.note('crash', end + 7, 3, vel=1.0); S.note('snare', end + 7, 0.5, vel=1.0); S.note('kick', end + 7, 0.5)
    return S

if __name__ == '__main__':
    print(build().render('3-columbia.mp3'))
