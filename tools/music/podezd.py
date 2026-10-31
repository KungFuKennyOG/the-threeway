from act1 import *

def build():
    S = Song(116, 41)
    S.add_inst('kick', kick, gain=0.7)
    S.add_inst('snare', snare, gain=0.8, gate=0.6, tone=175)
    S.add_inst('clap', clap, pan=-0.1, gain=0.8, gate=0.3)
    S.add_inst('hat', hat, pan=0.3, gain=0.8)
    S.add_inst('tick', clack, pan=0.45, gain=0.4, rev=0.2)
    S.add_inst('crash', crash, pan=-0.3, gain=0.4, rev=0.25)
    S.add_inst('hum', hum, gain=0.045)
    S.add_inst('motor', motor, gain=0.2, rev=0.15)
    S.add_inst('chime', chime, pan=0.2, gain=0.5, rev=0.4)
    S.add_inst('sparks', sparks, pan=0.3, gain=0.45, rev=0.3)
    S.add_inst('anvil', anvil, pan=-0.2, gain=0.55, rev=0.4)
    S.add_inst('wind', wind, gain=1.3, wide=True)
    S.add_inst('bass', bass_pick, gain=0.6, sc=0.3, bright=1.2)
    S.add_inst('sub', sub, gain=0.3, sc=0.5)
    S.add_inst('arp', arp_pluck, pan=0.35, gain=0.65, dly=0.3, sc=0.4, cut=2400)
    S.add_inst('acc', accordion, pan=-0.3, gain=0.45, rev=0.25, dly=0.1)
    S.add_inst('brass', brass, pan=0.1, gain=1.0, rev=0.35)
    S.add_inst('brass2', brass, pan=-0.2, gain=0.85, rev=0.35)
    S.add_inst('hit', stab, pan=0.2, gain=0.6, rev=0.3)
    S.add_inst('choir', choir, gain=0.25, rev=0.55, wide=True, sc=0.25)
    S.add_inst('choiro', choir, gain=0.28, rev=0.6, wide=True, vowel='oh')
    S.add_inst('bell', bell, pan=-0.25, gain=0.45, rev=0.5, tau=2.0, ratio=2.76, idx=1.6)

    B, G, D, A, E, Fs = 47, 43, 50, 45, 40, 42
    Q = {B: MIN, G: MAJ, D: MAJ, A: MAJ, E: MIN, Fs: MAJ}
    KEY = {B: ('D', MIN), G: ('Bb', MAJ), E: ('G', MIN), Fs: ('A', MAJ), D: ('F', MAJ), A: ('C', MAJ)}  # bayan riffs, -3

    def band(bar, r, dbl=False, fill=False, half=None):
        coldwave(S, bar, dbl=dbl, fill=fill, clap='clap')
        ppbass(S, bar, r, Q[r], half=(half, Q[half]) if half else None)
        S.note('sub', bar * 4, 3.9, r - 12, 0.7)

    # ---- intro: the lobby at night. Tubes humming, lift A coming down, the chime
    S.note('hum', 0, 41 * 4, vel=1.0)
    S.note('motor', 0, 7, 35, 0.8, glide=-2)
    for i in range(32): S.note('tick', i * 0.5, 0.25, vel=0.5 + 0.3 * (i % 2 == 0))
    for k, m in ((7.5, 78), (8, 74)): S.note('chime', k, 1, m, 1.0)
    for bar in (2, 3):
        for i in range(8): S.note('bass', bar * 4 + i * 0.5, 0.45, B, 0.55 + 0.05 * i)
    S.note('motor', 9, 6, 35, 0.7, glide=3)
    chord(S, 'choiro', 2, 8, B, MIN, 0.6)

    # ---- A: lift A climbing: the post-punk drive and the arp
    for i, r in enumerate([B, B, G, Fs, B, B, E, Fs]):
        bar = 4 + i; band(bar, r, fill=(i == 7)); arp(S, bar, r, Q[r])
        if i >= 4: chord(S, 'choir', bar, 4, r, Q[r], 0.6)
    theme(S, 8, 'acc', 71, 0.7, upto=8)          # the bayan, muffled through the doors
    S.note('crash', 48, 2)

    # ---- B: the theme on the bayan, brass under it
    for rep in range(1):
        for i, r in enumerate([B, D, A, None]):
            bar = 12 + i
            if r is None:
                band(bar, E, half=Fs); chord(S, 'choir', bar, 2, E, MIN); chord(S, 'choir', bar, 2, Fs, MAJ, at=2)
            else:
                band(bar, r); chord(S, 'choir', bar, 4, r, Q[r])
            arp(S, bar, r or E, Q[r or E], v=0.6)
        theme(S, 12, 'acc', 71, 1.0, harm='brass2', hv=0.6)

    # ---- the lift breaks at the 7th: the motor groans down, sparks, the beat dies
    S.note('motor', 64, 4, 47, 1.0, glide=-14)
    S.note('sparks', 65, 6, vel=1.0); S.note('anvil', 66, 1, vel=1.0); S.note('anvil', 67.5, 1, vel=0.6)
    S.note('bass', 64, 2, B, 0.9); S.note('crash', 66, 3, vel=0.6)
    for k in (68, 69, 70, 70.5): S.note('kick', k, 0.5, vel=0.7)     # heartbeat in the dark
    chord(S, 'choiro', 17, 4, B, (0, 1, 7), 0.8)                      # a cluster, doors jammed
    for i in range(8): S.note('snare', 70 + i * 0.25, 0.25, vel=0.3 + 0.08 * i)
    S.note('chime', 71.5, 1, 77, 0.6)                                 # the chime, wrong

    # ---- C: the 7th's landing and the communal kitchen: heavier, the bayan riff
    for i, r in enumerate([B, G, E, Fs, B, G, E, Fs]):
        bar = 18 + i; band(bar, r, dbl=True, fill=(i == 7))
        bayan(S, bar, KEY[r], shift=-3, v=0.9)
        if i % 2 == 0: S.chord('hit', bar * 4, 0.3, [r + 24 + o for o in Q[r]], 1.0); S.chord('hit', bar * 4 + 1.5, 0.3, [r + 24 + o for o in Q[r]], 0.9)
        else: S.chord('hit', bar * 4 + 3, 0.25, [r + 24 + o for o in Q[r]], 0.9); S.chord('hit', bar * 4 + 3.5, 0.4, [r + 24 + o for o in Q[r]], 1.0)
    S.note('crash', 72, 2)

    # ---- D: lift B to the wing's roof: open air, wind, tower bells play the theme's head
    S.note('wind', 104, 18, vel=1.0); S.note('crash', 104, 2)
    for i, r in enumerate([G, D, A, Fs]):
        bar = 26 + i; b = bar * 4
        S.note('kick', b, 0.5); S.note('snare', b + 2, 0.5); S.note('kick', b + 2.5, 0.5, vel=0.6)
        for j in range(8): S.note('hat', b + j * 0.5, 0.5, vel=0.5)
        S.note('bass', b, 1.9, r, 0.9); S.note('bass', b + 2, 1.9, r + 7, 0.8); S.note('sub', b, 3.9, r - 12, 0.8)
        chord(S, 'choiro', bar, 4, r, Q[r], 1.0); arp(S, bar, r, Q[r], v=0.7, step=0.5)
    theme(S, 26, 'bell', 71, 0.9, upto=8, stretch=2)

    # ---- E: the cradle down to the railway bank: the theme on brass, everything in
    for rep in range(2):
        base = 30 + rep * 4
        for i, r in enumerate([B, D, A, None]):
            bar = base + i
            if r is None:
                band(bar, E, dbl=True, half=Fs, fill=(bar == 37))
                chord(S, 'choir', bar, 2, E, MIN); chord(S, 'choir', bar, 2, Fs, MAJ, at=2)
                bayan(S, bar, KEY[E], shift=-3, v=0.5, every=2)
            else:
                band(bar, r, dbl=True); chord(S, 'choir', bar, 4, r, Q[r]); bayan(S, bar, KEY[r], shift=-3, v=0.5, every=2)
        theme(S, base, 'brass', 71, 1.0, harm='brass2' if rep else None, hv=0.85)
        S.note('crash', base * 4, 2)

    # ---- end: down on the bank. Bm, the lift chime, the tubes hum on
    end = 38 * 4
    for k in (0, 0.75, 1.5): S.chord('hit', end + k, 0.3, [71, 74, 78, 83], 1.0); S.note('kick', end + k, 0.5); S.note('snare', end + k, 0.5)
    S.chord('brass', end + 2.5, 5, [59, 62, 66, 71], 1.0); chord(S, 'choir', 38, 6, B, MIN, 1.0, at=2.5)
    S.note('bass', end + 2.5, 4, B, 1.0); S.note('sub', end + 2.5, 5, 35, 1.0); S.note('crash', end + 2.5, 4); S.note('kick', end + 2.5, 1)
    S.note('bell', end + 2.5, 3, 71, 1.0)
    for k, m in ((end + 6.5, 78), (end + 7, 74)): S.note('chime', k, 1, m, 0.8)
    return S

if __name__ == '__main__':
    print(build().render('act1-podezd.mp3'))
