from engine import *
from threeway import diat

def build():
    S = Song(132, 39)
    S.add_inst('kick', kick, gain=0.7)
    S.add_inst('snare', snare, gain=0.75, gate=0.6, tone=170)
    S.add_inst('hat', hat, pan=0.3, gain=0.75)
    S.add_inst('crash', crash, pan=-0.3, gain=0.4, rev=0.25)
    S.add_inst('roll', snare_roll, pan=-0.15, gain=0.75, rev=0.3)
    S.add_inst('march', snare, pan=-0.15, gain=0.6, rev=0.3, tone=215, snap=0.1)
    S.add_inst('bdrum', taiko, gain=0.55, rev=0.4, big=True)          # parade bass drum
    S.add_inst('bass', bass_pick, gain=0.6, sc=0.3, bright=1.3)
    S.add_inst('acc', accordion, pan=-0.35, gain=0.42, rev=0.18, sc=0.15)
    S.add_inst('brass', brass, pan=0.15, gain=1.0, rev=0.35)
    S.add_inst('brass2', brass, pan=-0.2, gain=0.7, rev=0.35)
    S.add_inst('horns', brass, pan=0.3, gain=0.4, rev=0.4, bright=0.7, swell=0.2)  # low sustained horns
    S.add_inst('choir', choir, gain=0.25, rev=0.55, wide=True, sc=0.25)
    S.add_inst('choiro', choir, gain=0.28, rev=0.6, wide=True, vowel='oh')
    S.add_inst('bell', bell, pan=0.2, gain=0.28, rev=0.5, tau=2.2, ratio=2.76, idx=1.6)
    S.add_inst('arp', arp_pluck, pan=0.4, gain=0.45, dly=0.3, sc=0.4, cut=2200)

    D, Bb, Gm, A, F, C = 38, 34, 43, 33, 41, 36
    CH = {D: (0, 3, 7), Bb: (0, 4, 7), Gm: (0, 3, 7), A: (0, 4, 7), F: (0, 4, 7), C: (0, 4, 7)}
    RIFF = {   # bayan 16ths: melody over a pedal note
        D: [74, 69, 65, 69, 76, 69, 65, 69, 77, 69, 76, 69, 74, 69, 73, 69],
        Bb: [74, 70, 65, 70, 77, 70, 65, 70, 79, 70, 77, 70, 74, 70, 72, 70],
        Gm: [74, 70, 67, 70, 77, 70, 67, 70, 79, 70, 77, 70, 74, 70, 72, 70],
        A: [73, 69, 64, 69, 76, 69, 64, 69, 77, 69, 76, 69, 73, 69, 71, 69],
        F: [72, 69, 65, 69, 77, 69, 65, 69, 76, 69, 74, 69, 72, 69, 70, 69],
        C: [72, 67, 64, 67, 76, 67, 64, 67, 74, 67, 72, 67, 71, 67, 72, 67],
    }

    def beat(bar, dbl=False, fill=False):
        b = bar * 4
        for k in (0, 2, 2.5): S.note('kick', b + k, 0.5)
        for k in (1, 3): S.note('snare', b + k, 0.5)
        step = 0.25 if dbl else 0.5
        for i in range(int(4 / step)): S.note('hat', b + i * step, step, vel=0.85 if (i * step) % 1 == 0 else 0.5)
        if fill:
            for i in range(6): S.note('snare', b + 2.5 + i * 0.25, 0.25, vel=0.5 + 0.1 * i)

    def bass(bar, r, half=None):
        pat = [0, 0, 12, 0, 0, 12, 7, 10]
        for i, o in enumerate(pat):
            rr = half if (half is not None and i >= 4) else r
            S.note('bass', bar * 4 + i * 0.5, 0.45, rr + o, 1.0 if i % 2 == 0 else 0.8)

    def sing(bar, r, beats=4, v=1.0, inst='choir'):
        for o in CH[r]: S.note(inst, bar * 4, beats, r + 12 + o + (12 if o == 0 else 0), v)

    def acc(bar, r, v=1.0):
        for i, m in enumerate(RIFF[r]): S.note('acc', bar * 4 + i * 0.25, 0.22, m, v * (1.0 if i % 2 == 0 else 0.6))

    # ---- intro: tower bells, bass drone, choir swell, snare roll
    for i, m in enumerate([74, 69, 65, 69, 74, 69, 65, 62]):
        S.note('bell', i * 1.5, 1.5, m, 1.0 if i % 4 == 0 else 0.7)
    sing(0, D, 8, 0.6, 'choiro'); sing(2, A, 8, 0.8, 'choiro')
    for bar in range(4): S.note('bdrum', bar * 4, 1, vel=0.8); S.note('bass', bar * 4, 3.8, D if bar < 2 else A, 0.7)
    S.note('roll', 12, 4, vel=1.0); S.note('crash', 16, 2)

    # ---- A: post-punk drive + bayan riff
    progA = [D, D, Bb, A, D, D, Gm, A]
    for k, r in enumerate(progA):
        bar = 4 + k; beat(bar, fill=(k == 7)); bass(bar, r); acc(bar, r)
        if k >= 4: sing(bar, r, 4, 0.6)
    # ---- B: theme on brass, choir chords
    progB = [D, F, C, None]
    for rep in range(2):
        base = 12 + rep * 4
        for k, r in enumerate(progB):
            bar = base + k; beat(bar, dbl=(rep == 1), fill=(bar == 19))
            if r is None:
                bass(bar, Gm, A); sing(bar, Gm, 2)
                for o in CH[A]: S.note('choir', bar * 4 + 2, 2, A + 24 + o, 1.0)
            else:
                bass(bar, r); sing(bar, r)
            for o in CH[r if r else Gm]: S.note('horns', bar * 4, 3.8, (r if r else Gm) + 12 + o, 0.6)
        for (bt, d, s) in THEME:
            S.note('brass', base * 4 + bt, d * 0.92, 62 + s, 1.0)
            if rep == 1: S.note('brass2', base * 4 + bt, d * 0.92, 62 + diat(s, -2), 0.85)
        S.note('crash', base * 4, 2)
    # ---- break: May Day parade rehearsal (march snare, bass drum, bells + choir)
    for bar in range(20, 24):
        b = bar * 4
        for k in (0, 2): S.note('bdrum', b + k, 1, vel=1.0)
        for k in (0, 0.75, 1, 2, 2.75, 3, 3.5): S.note('march', b + k, 0.25, vel=0.9 if k in (0, 2) else 0.55)
        S.note('bass', b, 3.8, D if bar < 22 else A, 0.6)
    for i, m in enumerate([69, 67, 65, 67, 69, 72, 74]):      # theme head on bells
        S.note('bell', 80 + THEME[i][0], THEME[i][1], m, 0.9)
    sing(20, D, 8, 0.8, 'choiro'); sing(22, A, 8, 1.0, 'choiro')
    for bt, m in ((88, 57), (89.5, 61), (90, 64), (92, 69), (93.5, 64), (94, 69)):  # fanfare on horns
        S.chord('brass2', bt, 0.9 if bt in (90, 94) else 0.45, [m, m + 4 if m != 64 else m + 5], 0.9)
    S.note('roll', 92, 4, vel=1.0)
    # ---- B': theme with full band + bayan counter
    for rep in range(2):
        base = 24 + rep * 4
        for k, r in enumerate(progB):
            bar = base + k; beat(bar, dbl=True, fill=(bar == 31))
            rr = r if r else Gm
            if r is None:
                bass(bar, Gm, A)
                for o in CH[A]: S.note('choir', bar * 4 + 2, 2, A + 24 + o, 1.0)
                sing(bar, Gm, 2)
            else:
                bass(bar, r); sing(bar, r)
            acc(bar, rr, 0.55)
            for i in range(8): S.note('arp', bar * 4 + i * 0.5, 0.4, rr + 36 + CH[rr][i % 3], 0.7)
        for (bt, d, s) in THEME:
            S.note('brass', base * 4 + bt, d * 0.92, 74 + s, 1.0)
            S.note('brass2', base * 4 + bt, d * 0.92, 62 + diat(s, -2), 0.9)
        S.note('crash', base * 4, 2)
    # ---- A': riff returns, then the fanfare ending
    for k, r in enumerate([D, Bb, Gm, A, D, Bb, A, A]):
        bar = 32 + k
        if bar >= 37: break
        beat(bar, dbl=True, fill=(bar == 36)); bass(bar, r); acc(bar, r); sing(bar, r, 4, 0.7)
    for bt, notes in ((148, [62, 66, 69]), (149.5, [62, 66, 69]), (150, [62, 65, 69, 74])):
        S.chord('brass', bt, 0.4 if bt < 150 else 4, notes, 1.0); S.chord('brass2', bt, 0.4 if bt < 150 else 4, [n - 12 for n in notes[:2]], 0.9)
    S.note('kick', 150, 1); S.note('bdrum', 150, 1); S.note('crash', 150, 4)
    S.note('bass', 150, 4, D, 1)
    for o in (0, 7, 12, 15): S.note('choir', 150, 4, 50 + o, 1.0)
    S.note('bell', 150, 3, 74, 1.0)
    return S

if __name__ == '__main__':
    print(build().render('2-krasnovia.mp3'))
