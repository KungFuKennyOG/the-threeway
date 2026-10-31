from act1 import *

def build():
    S = Song(126, 40)
    S.add_inst('kick', kick, gain=0.7)
    S.add_inst('snare', snare, gain=0.85, gate=0.6, tone=170)
    S.add_inst('hat', hat, pan=0.3, gain=0.7)
    S.add_inst('type', typewriter, pan=0.35, gain=0.9, rev=0.15)
    S.add_inst('type2', typewriter, pan=-0.4, gain=0.7, rev=0.15)
    S.add_inst('carriage', carriage, pan=0.4, gain=0.6, rev=0.3)
    S.add_inst('stamp', stamp, pan=-0.25, gain=0.85, rev=0.2)
    S.add_inst('tick', clack, pan=0.1, gain=0.5, rev=0.35)
    S.add_inst('crash', crash, pan=-0.3, gain=0.4, rev=0.3)
    S.add_inst('timp', taiko, gain=0.5, rev=0.5)
    S.add_inst('motor', motor, gain=0.15, rev=0.2)
    S.add_inst('chime', chime, pan=0.2, gain=0.4, rev=0.4)
    S.add_inst('bass', bass_pick, gain=0.6, sc=0.3, bright=1.2)
    S.add_inst('sub', sub, gain=0.3, sc=0.5)
    S.add_inst('arp', arp_pluck, pan=0.35, gain=0.75, dly=0.3, sc=0.4, cut=2600)
    S.add_inst('organ', organ, pan=0.1, gain=0.42, rev=0.4)
    S.add_inst('orgchd', organ, pan=-0.15, gain=0.28, rev=0.45, sc=0.25)
    S.add_inst('brass', brass, pan=0.1, gain=1.4, rev=0.35)
    S.add_inst('brass2', brass, pan=-0.2, gain=0.95, rev=0.35)
    S.add_inst('hit', stab, pan=0.2, gain=0.6, rev=0.3)
    S.add_inst('choir', choir, gain=0.25, rev=0.55, wide=True, sc=0.2)
    S.add_inst('choiro', choir, gain=0.3, rev=0.6, wide=True, vowel='oh')
    S.add_inst('bell', bell, pan=-0.2, gain=0.45, rev=0.6, tau=3.2, ratio=2.76, idx=1.8)

    G, Eb, D, Cm, Bb, F = 43, 39, 38, 48, 46, 41
    Q = {G: MIN, Eb: MAJ, D: MAJ, Cm: MIN, Bb: MAJ, F: MAJ}
    rng = np.random.default_rng(12)

    def typing(bar, density=0.6, v=1.0):   # the typing pool: keys on the 16ths, accents on the beat
        b = bar * 4
        for j in range(16):
            if j % 4 == 0 or rng.random() < density:
                S.note('type' if rng.random() < 0.6 else 'type2', b + j * 0.25 + rng.uniform(-0.02, 0.02), 0.2,
                       vel=v * (1.0 if j % 4 == 0 else rng.uniform(0.4, 0.8)))

    def band(bar, r, dbl=False, fill=False, half=None, keys=True):
        coldwave(S, bar, dbl=dbl, fill=fill, kick=(0, 1.5, 2.5), hat='type' if keys else 'hat')
        ppbass(S, bar, r, Q[r], half=(half, Q[half]) if half else None)
        S.note('sub', bar * 4, 3.9, r - 12, 0.7)

    def lift(bar, bars, glide, arrive):
        S.note('motor', bar * 4, bars * 4 - 0.5, 38, 1.0, glide=glide)
        for k in arrive: S.note('chime', k[0], 1, k[1], 0.9)

    # ---- intro: the lobby. Marble, a clock, one typist working late, the organ's pedal
    for i in range(16): S.note('tick', i, 0.25, vel=0.9 if i % 4 == 0 else 0.6)
    S.note('organ', 0, 15.5, 31, 0.6); S.note('orgchd', 8, 7.5, 55, 0.8); S.note('orgchd', 8, 7.5, 58, 0.8)
    for bar in range(4): typing(bar, 0.08 + 0.12 * bar, 0.8)
    S.note('carriage', 15, 1, vel=1.0)
    # ---- A: the lobby fight. Typewriters for hats, the arp, the militia
    for i, r in enumerate([G, G, Eb, D, G, G, Cm, D]):
        bar = 4 + i; band(bar, r, fill=(i == 7)); arp(S, bar, r, Q[r])
        if i % 2 == 0: S.chord('hit', bar * 4, 0.3, [r + 24 + o for o in Q[r]], 0.9); S.chord('hit', bar * 4 + 1.5, 0.3, [r + 24 + o for o in Q[r]], 0.8)
        if i >= 4: chord(S, 'choir', bar, 4, r, Q[r], 0.6)
        S.note('stamp', bar * 4 + 3, 0.25, vel=0.7)
    S.note('crash', 48, 2)
    # ---- lift 1: the motor, the clock, the theme's head on a tower bell
    lift(12, 4, 4, [(62.5, 79), (63, 74)])
    for i, r in enumerate([G, Eb, Cm, D]):
        bar = 12 + i; b = bar * 4
        S.note('kick', b, 0.5, vel=0.8)
        for j in range(4): S.note('tick', b + j, 0.25, vel=0.7)
        S.note('bass', b, 3.8, r, 0.7); chord(S, 'choiro', bar, 4, r, Q[r], 0.8)
        arp(S, bar, r, Q[r], v=0.5, step=0.5)
    theme(S, 12, 'bell', 67, 0.9, upto=8, stretch=2)
    # ---- the typing pool: the theme on the organ. Desks to the walls, every lamp on, stamps on four
    for rep in range(2):
        base = 16 + rep * 4
        for i, r in enumerate([G, Bb, F, None]):
            bar = base + i; b = bar * 4
            if r is None:
                band(bar, Cm, half=D, fill=(bar == 23)); chord(S, 'choir', bar, 2, Cm, MIN); chord(S, 'choir', bar, 2, D, MAJ, at=2)
                S.chord('orgchd', b, 1.9, [60, 63, 67], 0.8); S.chord('orgchd', b + 2, 1.9, [62, 66, 69], 0.8)
            else:
                band(bar, r); chord(S, 'choir', bar, 4, r, Q[r])
                S.chord('orgchd', b, 3.8, [r + 12 + o for o in Q[r]], 0.7)
            typing(bar, 0.55)
            S.note('stamp', b + 3, 0.25, vel=1.0); S.note('stamp', b + 3.5, 0.25, vel=0.6)
            if i == 3: S.note('carriage', b + 3.5, 1, vel=1.0)
            arp(S, bar, r or Cm, Q[r or Cm], v=0.55)
        theme(S, base, 'organ', 67, 1.0, harm='brass2' if rep else None, hv=0.7)
        S.note('crash', base * 4, 2)
    # ---- lift 2, down to the archive: darker, the motor sinking, the choir low
    lift(24, 4, -5, [(110.5, 74), (111, 70)])
    for i, r in enumerate([G, Eb, Cm, D]):
        bar = 24 + i; b = bar * 4
        S.note('kick', b, 0.5); S.note('snare', b + 2, 0.5, vel=0.7); S.note('kick', b + 2.75, 0.5, vel=0.6)
        for j in range(8): S.note('tick', b + j * 0.5, 0.2, vel=0.6)
        S.note('bass', b, 1.9, r, 0.8); S.note('bass', b + 2, 1.9, r + 7, 0.7); S.note('sub', b, 3.9, r - 12, 0.8)
        chord(S, 'choiro', bar, 4, r, Q[r], 1.0); S.note('timp', b, 1, vel=0.7)
    # ---- the Ministry at full power: the theme on brass, organ, choir, timpani
    for rep in range(2):
        base = 28 + rep * 4
        for i, r in enumerate([G, Bb, F, None]):
            bar = base + i; b = bar * 4
            if r is None:
                band(bar, Cm, dbl=True, half=D, fill=(bar == 35), keys=False)
                chord(S, 'choir', bar, 2, Cm, MIN); chord(S, 'choir', bar, 2, D, MAJ, at=2)
            else:
                band(bar, r, dbl=True, keys=False); chord(S, 'choir', bar, 4, r, Q[r])
            S.chord('orgchd', b, 3.8, [(r or Cm) + 12 + o for o in Q[r or Cm]], 0.9)
            typing(bar, 0.3, 0.6); S.note('timp', b, 1, vel=0.8)
            arp(S, bar, r or Cm, Q[r or Cm], v=0.5)
        theme(S, base, 'brass', 67, 1.0, harm='brass2', hv=0.8)
        if rep: theme(S, base, 'organ', 79, 0.7)
        S.note('crash', base * 4, 2)
    # ---- the end: Gm on the organ, the cog's bell tolls three times, the clock
    end = 36 * 4
    S.chord('organ', end, 10, [43, 55, 58, 62, 67], 1.0); chord(S, 'choiro', 36, 10, G, MIN, 1.0)
    S.note('bass', end, 3, G, 1.0); S.note('sub', end, 6, 31, 1.0); S.note('timp', end, 1); S.note('crash', end, 4)
    for k in (end, end + 4, end + 8): S.note('bell', k, 4, 55, 1.0)
    for j in range(14): S.note('tick', end + 1 + j, 0.25, vel=0.6)
    S.note('carriage', end + 12, 1, vel=0.7)
    return S

if __name__ == '__main__':
    print(build().render('act1-tower.mp3'))
