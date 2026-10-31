from engine import *

# The main theme bent into a hirajoshi-flavoured A minor (A B C E F).
HTHEME = [(0, 1.5, 7), (1.5, 0.5, 8), (2, 1, 7), (3, 1, 3), (4, 1.5, 7), (5.5, 0.5, 12), (6, 2, 14),
          (8, 1.5, 12), (9.5, 0.5, 8), (10, 1, 7), (11, 1, 3), (12, 1.5, 2), (13.5, 0.5, 3), (14, 2, 0)]

def build():
    S = Song(150, 43)
    S.add_inst('kick', kick, gain=0.7, punch=1.2)
    S.add_inst('snare', snare, gain=0.9, gate=0.7, tone=190)
    S.add_inst('clap', clap, pan=0.1, gain=0.8, gate=0.3)
    S.add_inst('hat', hat, pan=0.35, gain=1.0)
    S.add_inst('ohat', hat, pan=0.35, gain=0.45, open_=True)
    S.add_inst('crash', crash, pan=-0.3, gain=0.4, rev=0.25)
    S.add_inst('taiko', taiko, pan=-0.15, gain=0.6, rev=0.45)
    S.add_inst('shime', taiko, pan=0.25, gain=0.45, rev=0.3, big=False)
    S.add_inst('clack', clack, pan=0.5, gain=0.6, rev=0.4)
    S.add_inst('chant', chant, gain=1.0, rev=0.5, wide=True)
    S.add_inst('bass', bass_fm, gain=0.75, sc=0.45, idx=3.5)
    S.add_inst('sub', sub, gain=0.45, sc=0.5)
    S.add_inst('koto', koto, pan=-0.35, gain=1.0, rev=0.3, dly=0.15)
    S.add_inst('lead', lead_saw, gain=1.25, rev=0.3, dly=0.25, cut=5200)
    S.add_inst('leadss', supersaw, gain=0.9, rev=0.35, wide=True, a=0.01, r=0.2, cut=4200, voices=7, det=0.016)
    S.add_inst('pad', supersaw, gain=0.45, rev=0.5, wide=True, sc=0.6, a=0.4, r=0.8, cut=2200)
    S.add_inst('gam1', bell, pan=-0.45, gain=0.32, rev=0.35, tau=0.6, ratio=3.01, idx=1.4)
    S.add_inst('gam2', bell, pan=0.45, gain=0.45, rev=0.35, tau=0.6, ratio=3.01, idx=1.4)
    S.add_inst('arp', arp_pluck, pan=0.3, gain=0.6, dly=0.35, sc=0.4, cut=4000)

    Am, F, Dm, E, G = 45, 41, 38, 40, 43
    CH = {Am: (0, 3, 7), F: (0, 4, 7, 11), Dm: (0, 3, 7), E: (0, 4, 7), G: (0, 4, 7)}

    def drums(bar, dbl=True, half=False, fill=False):
        b = bar * 4
        if half:
            S.note('kick', b, 0.5); S.note('kick', b + 1.75, 0.5, vel=0.7); S.note('snare', b + 2, 0.5)
        else:
            for k in (0, 0.75, 1.75, 2.5): S.note('kick', b + k, 0.5, vel=1 if k in (0, 2.5) else 0.75)
            for k in (1, 3): S.note('snare', b + k, 0.5); S.note('clap', b + k, 0.5)
        step = 0.25 if dbl else 0.5
        for i in range(int(4 / step)):
            S.note('hat', b + i * step, step, vel=[1.0, 0.45, 0.7, 0.45][i % 4] if dbl else 0.8)
        S.note('ohat', b + 3.5, 0.5, vel=0.7)
        for k in (0.5, 1.75, 3.25): S.note('clack', b + k, 0.25, vel=0.6)
        if fill:
            for i in range(8): S.note('shime', b + 2 + i * 0.25, 0.25, vel=0.5 + 0.06 * i)

    def bass(bar, r, beats=4):
        pat = [0, 12, 0, 0, 12, 0, 0, 12, 0, 12, 0, 0, 12, 0, 7, 12]
        for i in range(int(beats * 4)):
            S.note('bass', bar * 4 + i * 0.25, 0.22, r + pat[i], 1.0 if i % 4 == 0 else 0.75)
        S.note('sub', bar * 4, beats * 0.98, r - 12, 0.9)

    def pad(bar, r, beats=4, v=1.0):
        for o in CH[r]: S.note('pad', bar * 4, beats, r + 12 + o, v)

    KOTO = {Am: [69, 72, 71, 76, 69, 72, 77, 76, 69, 72, 71, 76, 81, 77, 76, 72],
            F: [65, 69, 72, 76, 77, 76, 72, 69, 65, 69, 72, 76, 79, 77, 76, 72],
            Dm: [62, 65, 69, 72, 74, 72, 69, 65, 62, 65, 69, 72, 76, 74, 72, 69],
            E: [64, 68, 71, 76, 77, 76, 71, 68, 64, 68, 71, 76, 80, 77, 76, 71],
            G: [67, 71, 74, 79, 77, 74, 71, 67, 67, 71, 74, 79, 81, 79, 74, 71]}

    def kriff(bar, r, v=1.0, every=1):
        for i, m in enumerate(KOTO[r]):
            if i % every == 0: S.note('koto', bar * 4 + i * 0.25, 0.4, m, v * (1.0 if i % 4 == 0 else 0.7))

    def taiko_phrase(bar, v=1.0):   # don . don ka-ra don . don don
        b = bar * 4
        for k, big in ((0, True), (1, True), (1.75, False), (2, False), (2.25, False), (2.5, True), (3.5, True)):
            S.note('taiko' if big else 'shime', b + k, 0.5, vel=v * (1 if big else 0.8))

    def theme(base_bar, root, v=1.0, ss=True):
        for (bt, d, s) in HTHEME:
            S.note('lead', base_bar * 4 + bt, d * 0.95, root + s, v)
            if ss: S.note('leadss', base_bar * 4 + bt, d * 0.95, root + s - 12, v * 0.9)

    # ---- intro: taiko ensemble, clacks speeding up, a shout, pad swell
    for bar in range(4): taiko_phrase(bar, 0.7 + 0.1 * bar)
    k = 0.0; gap = 1.0
    while k < 14: S.note('clack', k, 0.2, vel=0.5 + k / 30); k += gap; gap = max(0.125, gap * 0.82)
    pad(2, Am, 8, 0.8); S.note('sub', 8, 8, 33, 0.7)
    for k, m in ((14.5, 45), (15, 45), (15.5, 48)): S.note('chant', k, 0.3, m, 1.0)
    S.note('crash', 16, 2)

    # ---- A: neon drive, FM bass, koto ostinato
    for i, r in enumerate([Am, Am, F, E, Am, Am, F, E]):
        bar = 4 + i; drums(bar, fill=(i == 7)); bass(bar, r); kriff(bar, r)
        if i >= 4: pad(bar, r, 4, 0.8)
        if i % 2 == 0: S.note('taiko', bar * 4, 1, vel=0.8)
    # ---- B: the theme on the neon lead, koto doubling an octave down
    prog = [Am, F, Dm, E]
    for rep in range(2):
        base = 12 + rep * 4
        for i, r in enumerate(prog):
            bar = base + i; drums(bar, fill=(bar == 19)); bass(bar, r); pad(bar, r)
            S.note('taiko', bar * 4, 1, vel=0.9)
            if rep == 1: kriff(bar, r, 0.6, every=2)
        theme(base, 69)
        S.note('crash', base * 4, 2)
    # ---- break: taiko ensemble + chants, drone
    for bar in range(20, 24):
        taiko_phrase(bar, 1.0)
        S.note('taiko', bar * 4 + 3, 0.5, vel=0.8); S.note('taiko', bar * 4 + 3.25, 0.5, vel=0.8)
        for k in (0.5, 1.5, 3.0): S.note('clack', bar * 4 + k, 0.2, vel=0.8)
        S.note('sub', bar * 4, 3.9, 33, 0.8)
    for bt in (82, 82.5, 90, 90.5): S.note('chant', bt, 0.3, 45, 1.0)          # "sei-ya!"
    for bt, m in ((86, 45), (86.5, 45), (87, 48), (94, 45), (94.5, 48), (95, 52), (95.5, 52)): S.note('chant', bt, 0.3, m, 1.0)
    pad(20, Am, 8, 0.6); pad(22, E, 8, 0.8)
    for i in range(16): S.note('shime', 92 + i * 0.25, 0.25, vel=0.4 + 0.035 * i)
    # ---- C: gamelan-style interlocking bells, half-time, lydian glow
    GAM = [69, 72, 76, 77, 76, 72, 69, 71]
    for i, r in enumerate([F, G, Am, Am, F, G, E, E]):
        bar = 24 + i; drums(bar, dbl=True, half=True); bass(bar, r) if i % 2 else S.note('sub', bar * 4, 3.9, r - 12, 0.9)
        pad(bar, r, 4, 1.0)
        for s in range(16):
            m = GAM[(s + i * 2) % 8] + (12 if i >= 4 else 0)
            S.note('gam1' if s % 2 == 0 else 'gam2', bar * 4 + s * 0.25, 0.25, m, 0.9 if s % 4 == 0 else 0.65)
        for s in range(8): S.note('arp', bar * 4 + s * 0.5, 0.4, r + 24 + CH[r][s % len(CH[r])], 0.8)
    S.note('chant', 127, 0.3, 45, 1.0); S.note('chant', 127.5, 0.3, 52, 1.0)
    # ---- B': the theme an octave up, everything in
    for rep in range(2):
        base = 32 + rep * 4
        for i, r in enumerate(prog):
            bar = base + i; drums(bar, fill=(bar == 39)); bass(bar, r); pad(bar, r, 4, 1.1); kriff(bar, r, 0.7, every=2)
            taiko_phrase(bar, 0.7)
            for s in range(8): S.note('gam1' if s % 2 == 0 else 'gam2', bar * 4 + s * 0.5, 0.5, 81 + [0, 3, 7, 8, 7, 3, 0, -2][s], 0.55)
        theme(base, 69)
        if rep == 1:
            for (bt, d, s) in HTHEME: S.note('leadss', base * 4 + bt, d * 0.95, 69 + s, 0.8)
        S.note('crash', base * 4, 2)
    # ---- ending: big Am hit, taiko, shout
    end = 40 * 4
    for k in (0, 0.5, 1.5): S.note('taiko', end + k, 0.5, vel=1.0); S.note('kick', end + k, 0.5)
    S.note('crash', end + 2, 4); S.note('kick', end + 2, 1); S.note('taiko', end + 2, 1, vel=1.0)
    for o in (0, 7, 12, 15, 19, 24): S.note('leadss', end + 2, 6, 45 + 12 + o, 0.9)
    S.note('lead', end + 2, 6, 81, 1.0); S.note('sub', end + 2, 6, 33, 1.0); S.note('bass', end + 2, 1, 45, 1.0)
    S.note('chant', end + 2, 0.3, 45, 1.0); S.note('koto', end + 2, 3, 69, 1.0); S.note('koto', end + 2.05, 3, 76, 1.0)
    return S

if __name__ == '__main__':
    print(build().render('4-hinomoto.mp3'))
