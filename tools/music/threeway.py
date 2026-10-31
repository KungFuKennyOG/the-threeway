from engine import *

def diat(semi, shift, scale=(0, 2, 3, 5, 7, 8, 10)):
    """Move a semitone offset (from tonic) by `shift` scale steps."""
    o, r = divmod(semi, 12); idx = min(range(7), key=lambda i: abs(scale[i] - r))
    k = idx + shift; o2, k2 = divmod(k, 7); return (o + o2) * 12 + scale[k2]

def build():
    S = Song(138, 42)
    S.add_inst('kick', kick, gain=0.7)
    S.add_inst('snare', snare, gain=0.8, gate=0.45)
    S.add_inst('hat', hat, pan=0.3, gain=0.7)
    S.add_inst('ohat', hat, pan=0.3, gain=0.5, open_=True)
    S.add_inst('crash', crash, pan=-0.3, gain=0.4, rev=0.2)
    S.add_inst('tom', tom, pan=0.0, gain=0.6, rev=0.2)
    S.add_inst('roll', snare_roll, gain=0.7, rev=0.2)
    S.add_inst('taiko', taiko, gain=0.7, rev=0.35)
    S.add_inst('bass', bass_pick, gain=0.55, sc=0.3)
    S.add_inst('gtrL', guitar, pan=-0.6, gain=0.75, sc=0.2)
    S.add_inst('gtrR', guitar, pan=0.6, gain=0.75, sc=0.2)
    S.add_inst('gmL', guitar, pan=-0.6, gain=0.7, mute=True)
    S.add_inst('gmR', guitar, pan=0.6, gain=0.7, mute=True)
    S.add_inst('lead', lead_saw, gain=1.0, rev=0.25, dly=0.22)
    S.add_inst('harm', brass, pan=-0.25, gain=0.6, rev=0.3)
    S.add_inst('pad', supersaw, gain=0.35, rev=0.4, sc=0.5, wide=True)
    S.add_inst('arp', arp_pluck, pan=0.35, gain=0.35, dly=0.35, sc=0.4)
    S.add_inst('acc', accordion, pan=-0.3, gain=0.32, rev=0.2)
    S.add_inst('stab', stab, pan=0.25, gain=0.6, rev=0.25)
    S.add_inst('koto', koto, pan=0.3, gain=0.65, rev=0.3, dly=0.2)
    S.add_inst('choir', choir, gain=0.3, rev=0.5, wide=True)
    S.add_inst('bassw', bass_upright, gain=0.6)

    E, C, D, B, G, A = 40, 36, 38, 35, 43, 33
    TRI = {E: (0, 3, 7), C: (0, 4, 7), D: (0, 4, 7), B: (0, 4, 7), G: (0, 4, 7), A: (0, 3, 7)}

    def rock(bar, fill=False, dbl=False):
        b = bar * 4
        for k in (0, 1.5, 2): S.note('kick', b + k, 0.5, vel=1)
        for k in (1, 3): S.note('snare', b + k, 0.5, vel=1)
        step = 0.25 if dbl else 0.5
        for i in range(int(4 / step)):
            S.note('hat', b + i * step, step, vel=0.9 if (i * step) % 1 == 0 else 0.55)
        if fill:
            for i, m in enumerate([50, 50, 45, 45, 40, 40]): S.note('tom', b + 2.5 + i * 0.25, 0.25, m, 0.9)

    def chug(bar, root, accents=(0, 1.5, 3)):
        b = bar * 4
        for i in range(8):
            t = i * 0.5
            if t in accents:
                for g in ('gtrL', 'gtrR'): S.note(g, b + t, 0.45, root, 0.9)
            else:
                for g in ('gmL', 'gmR'): S.note(g, b + t, 0.3, root, 0.85)
            S.note('bass', b + t, 0.45, root - 12 + 12, 0.95)

    def pad(bar, root, beats=4, v=1.0):
        for o in TRI[root]: S.note('pad', bar * 4, beats, root + 12 + o, v)

    def arp(bar, root):
        tri = [root + 24 + o for o in TRI[root]] + [root + 36]
        for i in range(16): S.note('arp', bar * 4 + i * 0.25, 0.22, tri[[0, 1, 2, 3, 2, 1][i % 6]], 0.8)

    # ---- intro: big chords, crash, tom fill
    for bar, r in enumerate([E, C, D, B]):
        S.note('crash', bar * 4, 2, vel=0.8); S.note('kick', bar * 4, 1)
        for g in ('gtrL', 'gtrR'): S.note(g, bar * 4, 3.6, r, 1)
        S.note('bass', bar * 4, 3.6, r, 1); pad(bar, r)
    for i in range(8): S.note('snare', 14 + i * 0.25, 0.25, vel=0.4 + 0.08 * i)
    for i, m in enumerate([52, 50, 47, 45, 43, 40, 38, 36]): S.note('tom', 14 + i * 0.25, 0.25, m, 0.7)

    # ---- A: chug riff
    for k, r in enumerate([E, E, C, D, E, E, C, B]):
        bar = 4 + k; chug(bar, r); rock(bar, fill=(k == 7)); arp(bar, r)
        if k % 4 == 3: S.note('ohat', bar * 4 + 3.5, 0.5)
    S.note('crash', 16, 2)

    # ---- B: main theme on the lead, chords Em G D Am|B
    prog = [E, G, D, None]
    for rep in range(2):
        base = 12 + rep * 4
        for k, r in enumerate(prog):
            bar = base + k
            if r is None:
                chug(bar, A, (0, 1.5)); pad(bar, A, 2); pad(bar, B, 2)
                for i in range(4, 8):
                    for g in ('gmL', 'gmR'): pass
                for g in ('gtrL', 'gtrR'): S.note(g, bar * 4 + 2, 1.8, B, 0.95)
            else:
                chug(bar, r); pad(bar, r)
            rock(bar, fill=(bar == 19))
        for (bt, d, s) in THEME:
            S.note('lead', base * 4 + bt, d * 0.95, 64 + s, 1.0)
            if rep == 1: S.note('harm', base * 4 + bt, d * 0.95, 64 + diat(s, -2), 0.8)
        S.note('crash', base * 4, 2)

    # ---- C: bridge, the three sectors trade two bars each
    # Krasnovia: accordion over Am, march roll
    for bar in (20, 21):
        b = bar * 4
        riff = [69, 64, 60, 64, 71, 64, 60, 64, 72, 64, 71, 64, 69, 64, 68, 64]
        for i, m in enumerate(riff): S.note('acc', b + i * 0.25, 0.22, m + 12, 0.95 if i % 2 == 0 else 0.6)
        for k in (0, 2): S.note('kick', b + k, 0.5)
        for k in (1, 3): S.note('snare', b + k, 0.5, vel=0.8)
        for i in range(8): S.note('bass', b + i * 0.5, 0.45, A + 12 if i % 2 else A, 0.9)
    S.note('roll', 83, 1)
    # Columbia: brass stabs over C, walking bass
    for bar in (22, 23):
        b = bar * 4
        for k, d in ((0, 0.4), (0.75, 0.3), (1.5, 0.4), (3, 0.9)):
            S.chord('stab', b + k, d, [64, 67, 70, 72], 0.9)
        for i, m in enumerate([36, 40, 43, 45] if bar == 22 else [46, 45, 43, 39]): S.note('bassw', b + i, 0.9, m, 1)
        rock(bar)
    # Hinomoto: koto over D, taiko
    for bar in (24, 25):
        b = bar * 4
        riff = [74, 69, 72, 74, 69, 72, 76, 74, 81, 79, 76, 74, 72, 69, 67, 69]
        for i, m in enumerate(riff): S.note('koto', b + i * 0.25, 0.3, m, 0.9)
        for k in (0, 1.5, 2.5, 3, 3.5): S.note('taiko', b + k, 0.5, vel=1 if k == 0 else 0.6, big=(k == 0))
        for i in range(8): S.note('bass', b + i * 0.5, 0.45, D, 0.9)
    # All three: B chord build
    for bar in (26, 27):
        b = bar * 4
        for i in range(16):
            for g in ('gmL', 'gmR'): S.note(g, b + i * 0.25, 0.2, B, 0.6 + 0.3 * (i / 16))
            S.note('bass', b + i * 0.25, 0.2, B, 0.9)
        for k in (0, 1, 2, 3): S.note('taiko', b + k, 0.5, vel=0.9)
        S.chord('choir', b, 4, [59, 63, 66, 71], 0.9)
    S.note('roll', 104, 4, vel=1.0)
    S.chord('acc', 108, 3, [71, 75, 78], 0.6); S.chord('stab', 110, 0.5, [63, 66, 71], 1)

    # ---- B': theme an octave up, harmony, double-time hats
    for rep in range(2):
        base = 28 + rep * 4
        for k, r in enumerate(prog):
            bar = base + k
            if r is None:
                chug(bar, A, (0, 1.5)); pad(bar, A, 2); pad(bar, B, 2)
                for g in ('gtrL', 'gtrR'): S.note(g, bar * 4 + 2, 1.8, B, 0.95)
            else:
                chug(bar, r); pad(bar, r, v=1.2); arp(bar, r)
            rock(bar, dbl=True, fill=(bar == 35))
        for (bt, d, s) in THEME:
            S.note('lead', base * 4 + bt, d * 0.95, 76 + s, 1.0)
            S.note('harm', base * 4 + bt, d * 0.95, 64 + diat(s, -2), 0.9)
        S.note('crash', base * 4, 2)
        S.chord('choir', base * 4, 16, [52, 59, 64], 0.6)

    # ---- outro: riff, then the final Em hit
    for k, r in enumerate([E, C, D, B]):
        bar = 36 + k; chug(bar, r); rock(bar, fill=(k == 3)); arp(bar, r)
    for g in ('gtrL', 'gtrR'): S.note(g, 160, 6, E, 1)
    S.note('bass', 160, 6, E, 1); S.note('kick', 160, 1); S.note('crash', 160, 4)
    S.note('taiko', 160, 1); S.chord('choir', 160, 6, [52, 59, 64, 67], 0.9)
    S.note('lead', 160, 6, 76, 0.9); S.note('harm', 160, 6, 71, 0.8)
    return S

if __name__ == '__main__':
    print(build().render('1-the-threeway.mp3'))
