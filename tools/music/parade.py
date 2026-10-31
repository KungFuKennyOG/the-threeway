from act1 import *

def build():
    S = Song(120, 38)
    S.add_inst('kick', kick, gain=0.65)
    S.add_inst('snare', snare, gain=0.8, gate=0.6, tone=175)
    S.add_inst('hat', hat, pan=0.3, gain=0.9)
    S.add_inst('march', snare, pan=-0.15, gain=0.85, rev=0.3, tone=215, snap=0.1)
    S.add_inst('roll', snare_roll, pan=-0.15, gain=0.7, rev=0.3)
    S.add_inst('bdrum', taiko, gain=0.55, rev=0.4, big=True)
    S.add_inst('cym', crash, pan=0.35, gain=0.4, rev=0.3)
    S.add_inst('crash', crash, pan=-0.3, gain=0.4, rev=0.3)
    S.add_inst('tom', tom, gain=0.55, rev=0.3)
    S.add_inst('whistle', whistle, pan=-0.3, gain=0.15, rev=0.4)
    S.add_inst('tuba', tuba, gain=1.0, rev=0.25)
    S.add_inst('pah', brass, pan=0.3, gain=0.55, rev=0.3, bright=0.8, swell=0.02)   # off-beat horns
    S.add_inst('brass', brass, pan=0.1, gain=1.4, rev=0.35, bright=1.2)
    S.add_inst('brass2', brass, pan=-0.2, gain=1.0, rev=0.35)
    S.add_inst('hit', stab, pan=0.2, gain=0.6, rev=0.3)
    S.add_inst('glock', glock, pan=0.35, gain=0.3, rev=0.4)
    S.add_inst('bass', bass_pick, gain=0.6, sc=0.3, bright=1.3)
    S.add_inst('sub', sub, gain=0.3, sc=0.5)
    S.add_inst('acc', accordion, pan=-0.35, gain=0.42, rev=0.2)
    S.add_inst('choir', choir, gain=0.25, rev=0.55, wide=True, sc=0.2)
    S.add_inst('bell', bell, pan=0.2, gain=0.4, rev=0.6, tau=3.0, ratio=2.76, idx=1.6)

    F, C, C7, Bb, Dm, Gm, A = 41, 36, 36, 46, 38, 43, 45
    QM = {F: MAJ, C: MAJ, Bb: MAJ, Dm: MIN, Gm: MIN, A: MAJ}
    KEY = {Dm: ('D', MIN), Bb: ('Bb', MAJ), Gm: ('G', MIN), A: ('A', MAJ), F: ('F', MAJ), C: ('C', MAJ)}

    def oompah(bar, halves, v=1.0):   # halves: [(root, quality)] x2
        b = bar * 4
        for h, (r, q) in enumerate(halves):
            t = b + h * 2
            S.note('tuba', t, 0.8, r + (7 if h == 1 and halves[0] == halves[1] else 0), v)
            S.chord('pah', t + 1, 0.5, [r + 24 + o for o in q[:3]], v * 0.9)

    def marchkit(bar, v=1.0, cym=True):
        b = bar * 4
        for k in (0, 2): S.note('bdrum', b + k, 1, vel=v)
        if cym: S.note('cym', b, 1.5, vel=0.5 * v)
        for k in (0, 0.75, 1, 2, 2.75, 3, 3.5): S.note('march', b + k, 0.25, vel=(0.9 if k in (0, 2) else 0.55) * v)

    MAJ_HALVES = [[(F, MAJ), (F, MAJ)], [(C, MAJ), (F, MAJ)], [(C, DOM), (C, DOM)], [(F, MAJ), (F, MAJ)]]
    MIN_PROG = [Dm, F, C, None]   # i III VII (iv V)

    # ---- the band warms up: a roll, the bass drum, a crash
    S.note('roll', 0, 7, vel=1.0); S.note('bdrum', 7, 1, vel=1.0); S.note('bdrum', 7.5, 1, vel=0.8)
    S.chord('pah', 6, 2, [57, 60, 65], 0.8); S.note('tuba', 6, 2, 36, 0.9)
    # ---- the rehearsal: the theme as a pompous F-major march
    for rep in range(2):
        base = 2 + rep * 4
        for i in range(4):
            bar = base + i; oompah(bar, MAJ_HALVES[i]); marchkit(bar)
        theme(S, base, 'brass', 65, 1.0, th=THEME_MAJ, harm='brass2' if rep else None, scale=MAJ_SCALE, hv=0.8)
        theme(S, base, 'glock', 89, 0.8, th=THEME_MAJ)
    # ---- the whistle. The band stops dead. Somebody drops a cymbal. Fight
    S.note('whistle', 40, 1.5, vel=1.0)
    S.chord('brass', 40.2, 0.9, [64, 67, 70], 0.5)   # a sour, dying chord
    S.note('cym', 41.5, 2, vel=0.8); S.note('crash', 41.5, 1, vel=0.4)
    for k in (44, 44.75, 45.5): S.chord('hit', k, 0.3, [62, 65, 69, 74], 1.0); S.note('kick', k, 0.5); S.note('bdrum', k, 0.5)
    for i in range(8): S.note('snare', 46 + i * 0.25, 0.25, vel=0.4 + 0.08 * i)
    S.note('crash', 48, 2)
    # ---- the fight: D-minor coldwave under the march snare, the bayan riff
    for i, r in enumerate([Dm, Dm, Bb, A, Dm, Dm, Gm, A]):
        bar = 12 + i; b = bar * 4
        coldwave(S, bar, fill=(i == 7))
        for k in (0, 0.75, 1, 2, 2.75, 3): S.note('march', b + k, 0.25, vel=0.5)
        ppbass(S, bar, r, QM[r]); S.note('sub', b, 3.9, r - 12, 0.7)
        bayan(S, bar, KEY[r])
        if i % 2 == 0:
            for k in (0, 0.75, 1): S.chord('hit', b + k, 0.25, [r + 24 + o for o in QM[r]], 0.9)
        if i >= 4: chord(S, 'choir', bar, 4, r, QM[r], 0.6)
    # ---- the theme in D minor: brass band and kit together
    for rep in range(2):
        base = 20 + rep * 4
        for i, r in enumerate(MIN_PROG):
            bar = base + i; b = bar * 4
            coldwave(S, bar, dbl=(rep == 1), fill=(bar == 27))
            S.note('bdrum', b, 1, vel=0.8)
            if r is None:
                ppbass(S, bar, Gm, MIN, half=(A, MAJ)); oompah(bar, [(Gm, MIN), (A, MAJ)], 0.8)
                chord(S, 'choir', bar, 2, Gm, MIN); chord(S, 'choir', bar, 2, A, MAJ, at=2)
            else:
                ppbass(S, bar, r, QM[r]); oompah(bar, [(r, QM[r])] * 2, 0.8); chord(S, 'choir', bar, 4, r, QM[r])
            S.note('sub', b, 3.9, (r or Gm) - 12, 0.7)
        theme(S, base, 'brass', 62, 1.0, harm='brass2' if rep else None, hv=0.85)
        theme(S, base, 'glock', 86, 0.7)
        S.note('crash', base * 4, 2)
    # ---- the bandsmen: a drum break. Cymbals flying, toms, the tuba won't stop
    rng = np.random.default_rng(31)
    for i, r in enumerate([Dm, Dm, Gm, A]):
        bar = 28 + i; b = bar * 4
        coldwave(S, bar, dbl=True, fill=(i == 3)); marchkit(bar, 0.9, cym=False)
        oompah(bar, [(r, QM[r])] * 2, 1.0)
        for k in rng.choice(np.arange(0, 4, 0.5), 3, replace=False): S.note('cym', b + float(k), 1, vel=0.8)
        for j, m in enumerate([52, 50, 47, 45]): S.note('tom', b + 1 + j * 0.25, 0.25, m, 0.7)
        bayan(S, bar, KEY[r], v=0.6, every=2)
    # ---- the finale: the march again, in F major, with the whole square
    S.note('crash', 128, 2)
    for i in range(4):
        bar = 32 + i; oompah(bar, MAJ_HALVES[i]); marchkit(bar)
        coldwave(S, bar, dbl=True, kick=(0, 2))
        for (r, q) in MAJ_HALVES[i][:1]: chord(S, 'choir', bar, 4, r, q[:3], 1.0)
    theme(S, 32, 'brass', 65, 1.0, th=THEME_MAJ, harm='brass2', scale=MAJ_SCALE, hv=0.85)
    theme(S, 32, 'glock', 89, 0.8, th=THEME_MAJ)
    theme(S, 32, 'acc', 77, 0.5, th=THEME_MAJ)
    # ---- the end: F major, held. The Tower's bell tolls
    end = 36 * 4
    S.chord('brass', end, 6, [65, 69, 72, 77], 1.0); S.chord('brass2', end, 6, [53, 57, 60], 0.9)
    S.note('tuba', end, 6, 41, 1.0); S.note('bdrum', end, 1); S.note('crash', end, 4); S.note('kick', end, 1)
    S.note('roll', end + 0.5, 3, vel=0.8); chord(S, 'choir', 36, 6, F, MAJ, 1.0)
    for k in (end + 2, end + 5): S.note('bell', k, 3, 41 + 12, 1.0)
    return S

if __name__ == '__main__':
    print(build().render('act1-parade.mp3'))
