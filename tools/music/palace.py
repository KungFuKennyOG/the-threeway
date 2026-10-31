from act1 import *

def build():
    S = Song(144, 37)
    S.add_inst('kick', kick, gain=0.7)
    S.add_inst('snare', snare, gain=0.8, gate=0.6, tone=180)
    S.add_inst('hat', hat, pan=0.3, gain=1.0)
    S.add_inst('crash', crash, pan=-0.3, gain=0.4, rev=0.3)
    S.add_inst('roll', snare_roll, gain=0.7, rev=0.3)
    S.add_inst('stomp', stomp, gain=0.8, rev=0.35, wide=True)
    S.add_inst('cclap', crowdclap, gain=1.7, rev=0.4, wide=True)
    S.add_inst('crowd', crowd, gain=0.4, rev=0.3, wide=True)
    S.add_inst('roar', roar, gain=0.75, rev=0.4, wide=True)
    S.add_inst('hey', hey, gain=1.0, rev=0.45, wide=True)
    S.add_inst('whistle', whistle, pan=0.3, gain=0.15, rev=0.4)
    S.add_inst('tick', clack, pan=0.4, gain=0.5, rev=0.2)
    S.add_inst('ringbell', ringbell, pan=0.15, gain=0.28, rev=0.5)
    S.add_inst('bass', bass_pick, gain=0.65, sc=0.3, bright=1.3)
    S.add_inst('sub', sub, gain=0.3, sc=0.5)
    S.add_inst('organ', organ, pan=0.2, gain=0.5, rev=0.35)
    S.add_inst('orgchd', organ, pan=-0.2, gain=0.3, rev=0.35, sc=0.3)
    S.add_inst('brass', brass, pan=0.1, gain=1.5, rev=0.35, bright=1.2)
    S.add_inst('brass2', brass, pan=-0.2, gain=1.05, rev=0.35)
    S.add_inst('hit', stab, pan=0.25, gain=0.6, rev=0.35)
    S.add_inst('glock', glock, pan=0.35, gain=0.22, rev=0.4)
    S.add_inst('choir', choir, gain=0.25, rev=0.55, wide=True, sc=0.25)

    A, F, C, G, D, E = 45, 41, 48, 43, 50, 40
    Q = {A: MIN, F: MAJ, C: MAJ, G: MAJ, D: MIN, E: MAJ}
    HT = lambda r: [r + 24 + o for o in Q[r]]

    def bleachers(bar, v=1.0):   # stomp . stomp clap | stomp stomp . clap  (dotted, the Palace's own)
        b = bar * 4
        for k in (0, 0.75, 2, 2.75): S.note('stomp', b + k, 0.5, vel=v)
        for k in (1, 3): S.note('cclap', b + k, 0.5, vel=v)

    def band(bar, r, dbl=False, fill=False, half=None):
        coldwave(S, bar, dbl=dbl, fill=fill, kick=(0, 1.5, 2, 3))
        ppbass(S, bar, r, Q[r], half=(half, Q[half]) if half else None)
        S.note('sub', bar * 4, 3.9, r - 12, 0.7)

    def skank(bar, r, v=0.8):    # arena organ on the off-beats
        for k in (0.5, 1.5, 2.5, 3.5): S.chord('orgchd', bar * 4 + k, 0.3, [r + 12 + o for o in Q[r]], v)

    S.note('crowd', 0, 37 * 4, vel=1.0, bright=1100)

    # ---- intro: the boulevard, the Palace's floodlights. A stadium-organ run, the crowd answers
    run = [57, 60, 64, 69, 60, 64, 69, 72, 64, 69, 72, 76]
    for i, m in enumerate(run): S.note('organ', i * 0.5, 0.45, m, 0.85 + 0.01 * i)
    S.chord('organ', 6, 1.8, [64, 69, 72, 76], 1.0); S.note('roar', 8, 2, vel=1.0)
    for bar in (2, 3): bleachers(bar, 0.6 + 0.2 * (bar - 2))
    S.chord('hit', 15, 0.4, HT(E), 1.0); S.note('kick', 15, 0.5); S.note('crash', 16, 2)

    # ---- A: the boulevard fight. Drive, organ skank, the stands stamping, HEY
    for i, r in enumerate([A, A, F, E, A, A, F, G]):
        bar = 4 + i; band(bar, r, fill=(i == 7)); skank(bar, r); bleachers(bar, 0.7)
        if i % 2 == 0: S.chord('hit', bar * 4, 0.3, HT(r), 0.9)
        else: S.note('hey', bar * 4 + 3, 0.3, 57, 1.0)
    # ---- B: the foyer and the trophies: the theme on brass, a fanfare
    for rep in range(2):
        base = 12 + rep * 4
        for i, r in enumerate([A, C, G, None]):
            bar = base + i
            if r is None:
                band(bar, D, half=E, fill=(bar == 19)); chord(S, 'choir', bar, 2, D, MIN); chord(S, 'choir', bar, 2, E, MAJ, at=2)
                S.chord('hit', bar * 4 + 2, 0.3, HT(E), 1.0); S.chord('hit', bar * 4 + 3, 0.6, HT(E), 1.0)
            else:
                band(bar, r, dbl=(rep == 1)); chord(S, 'choir', bar, 4, r, Q[r]); skank(bar, r, 0.6)
            bleachers(bar, 0.5)
        theme(S, base, 'brass', 69, 1.0, harm='brass2' if rep else None, hv=0.85)
        S.note('crash', base * 4, 2)

    # ---- the gym: half-time, the coach's whistle, a stopwatch, the glockenspiel for the gymnasts
    S.note('whistle', 80, 1.2, vel=1.0)
    for k in (88, 88.5): S.note('whistle', k, 0.25, vel=0.9)
    for i, r in enumerate([F, G, A, E]):
        bar = 20 + i; b = bar * 4
        S.note('kick', b, 0.5); S.note('snare', b + 2, 0.5); S.note('kick', b + 2.75, 0.5, vel=0.6)
        for j in range(8): S.note('tick', b + j * 0.5, 0.2, vel=0.8 if j % 2 == 0 else 0.5)
        for j in range(8): S.note('bass', b + j * 0.5, 0.45, r, 0.85)
        S.note('sub', b, 3.9, r - 12, 0.8); chord(S, 'choir', bar, 4, r, Q[r], 0.9)
        for j in range(8): S.note('glock', b + j * 0.5, 0.4, r + 36 + Q[r][j % 3] - (12 if r > 44 else 0), 0.8)
    S.note('roll', 94, 2)

    # ---- B': the players' tunnel and the arena: the theme on stadium organ, the crowd chants his name
    for rep in range(2):
        base = 24 + rep * 4
        for i, r in enumerate([A, C, G, None]):
            bar = base + i
            if r is None:
                band(bar, D, dbl=True, half=E, fill=(bar == 31))
                chord(S, 'choir', bar, 2, D, MIN); chord(S, 'choir', bar, 2, E, MAJ, at=2)
                S.chord('hit', bar * 4 + 2, 0.3, HT(E), 1.0); S.chord('hit', bar * 4 + 3, 0.6, HT(E), 1.0)
            else:
                band(bar, r, dbl=True); chord(S, 'choir', bar, 4, r, Q[r])
                S.chord('hit', bar * 4, 0.3, HT(r), 0.8)
            bleachers(bar, 0.8)
            if i % 2 == 1:                                   # VOL - KOV!
                S.note('hey', bar * 4 + 2, 0.3, 57, 1.0); S.note('hey', bar * 4 + 3, 0.3, 52, 1.0)
        theme(S, base, 'organ', 81, 1.0)
        theme(S, base, 'brass', 69, 0.9, harm='brass2', hv=0.75)
        S.note('crash', base * 4, 2)

    # ---- into the ring: the roll, the roar, the bell rings three times
    for bar in (32, 33):
        b = bar * 4
        for j in range(16): S.note('stomp', b + j * 0.25, 0.25, vel=0.5 + 0.03 * (j + (bar - 32) * 16))
    S.note('roll', 128, 8, vel=1.0)
    S.chord('organ', 128, 7.5, [64, 68, 71, 76], 0.8); chord(S, 'choir', 32, 8, E, MAJ, 1.0)
    for j in range(8): S.note('bass', 128 + j, 0.9, E, 0.9)
    S.note('roar', 134, 4, vel=1.0)
    S.chord('hit', 136, 0.4, [69, 72, 76, 81], 1.0); S.note('kick', 136, 0.5); S.note('crash', 136, 3)
    S.note('sub', 136, 3, 33, 1.0); S.note('bass', 136, 2, A, 1.0)
    for k in (138, 138.6, 139.2): S.note('ringbell', k, 0.5, vel=1.0)
    return S

if __name__ == '__main__':
    print(build().render('act1-palace.mp3'))
