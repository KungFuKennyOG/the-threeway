from act1 import *

def build():
    S = Song(132, 43)
    S.add_inst('kick', kick, gain=0.7)
    S.add_inst('snare', snare, gain=0.85, gate=0.65, tone=170)
    S.add_inst('clap', clap, pan=-0.1, gain=0.8, gate=0.3)
    S.add_inst('hat', hat, pan=0.3, gain=0.9)
    S.add_inst('crash', crash, pan=-0.3, gain=0.4, rev=0.3)
    S.add_inst('roll', snare_roll, pan=-0.15, gain=0.7, rev=0.3)
    S.add_inst('march', snare, pan=-0.15, gain=0.6, rev=0.3, tone=215, snap=0.1)
    S.add_inst('timp', taiko, gain=0.55, rev=0.5)
    S.add_inst('wind', wind, gain=1.4, wide=True)
    S.add_inst('motor', motor, gain=0.15, rev=0.2)
    S.add_inst('chime', chime, pan=0.2, gain=0.4, rev=0.4)
    S.add_inst('bass', bass_pick, gain=0.6, sc=0.3, bright=1.3)
    S.add_inst('sub', sub, gain=0.3, sc=0.5)
    S.add_inst('arp', arp_pluck, pan=0.35, gain=0.75, dly=0.35, sc=0.35, cut=3000)
    S.add_inst('acc', accordion, pan=-0.35, gain=0.42, rev=0.25, sc=0.1)
    S.add_inst('brass', brass, pan=0.1, gain=1.35, rev=0.4, bright=1.2)
    S.add_inst('brass2', brass, pan=-0.2, gain=0.95, rev=0.4)
    S.add_inst('horns', brass, pan=0.3, gain=0.65, rev=0.45, bright=0.7, swell=0.3)
    S.add_inst('hit', stab, pan=0.2, gain=0.6, rev=0.35)
    S.add_inst('strings', supersaw, gain=0.5, rev=0.5, wide=True, sc=0.4, a=0.6, r=1.0, cut=3200)
    S.add_inst('choir', choir, gain=0.3, rev=0.6, wide=True, sc=0.2)
    S.add_inst('choiro', choir, gain=0.32, rev=0.6, wide=True, vowel='oh')
    S.add_inst('bell', bell, pan=0.2, gain=0.4, rev=0.6, tau=2.4, ratio=2.76, idx=1.6)
    S.add_inst('glock', glock, pan=-0.35, gain=0.25, rev=0.5)

    D, Bb, F, C, Gm, A = 38, 46, 41, 48, 43, 45
    Q = {D: MIN, Bb: MAJ, F: MAJ, C: MAJ, Gm: MIN, A: MAJ}
    KEY = {D: ('D', MIN), Bb: ('Bb', MAJ), Gm: ('G', MIN), A: ('A', MAJ), F: ('F', MAJ), C: ('C', MAJ)}

    def band(bar, r, dbl=False, fill=False, half=None):
        coldwave(S, bar, dbl=dbl, fill=fill, clap='clap')
        ppbass(S, bar, r, Q[r], half=(half, Q[half]) if half else None)
        S.note('sub', bar * 4, 3.9, r - 12, 0.7)

    # ---- the glass lift: 150 m up the south face. The city falls away. The theme at half speed
    S.note('motor', 0, 31, 38, 1.0, glide=12)
    for i, r in enumerate([D, Bb, F, C, D, Bb, Gm, A]):
        bar = i; b = bar * 4
        chord(S, 'choir', bar, 4, r, Q[r], 0.5 + 0.06 * i); chord(S, 'strings', bar, 4, r, Q[r], 0.6 + 0.05 * i)
        S.note('timp', b, 1, vel=0.4 + 0.07 * i)
        if i >= 2: arp(S, bar, r, Q[r], v=0.4 + 0.06 * i, step=0.5 if i < 5 else 0.25)
        if i >= 4: S.note('kick', b, 0.5, vel=0.6); S.note('kick', b + 2, 0.5, vel=0.6)
        S.note('bass', b, 3.8, r, 0.5 + 0.05 * i)
        for j, o in enumerate((0, 7, 12, 7)): S.note('bell', b + j, 1, r + 36 + o - (12 if r > 44 else 0), 0.4 + 0.04 * i)
    theme(S, 0, 'horns', 62, 0.9, stretch=2)
    S.note('wind', 20, 70, vel=1.0)
    S.note('roll', 28, 4, vel=1.0)
    # ---- the top: the doors open on the tribune, under the gold cog. The Chairman comes out
    for k, m in ((32, 81), (32.5, 76)): S.note('chime', k, 1, m, 1.0)
    S.note('crash', 32, 3)
    for bt, notes in ((34, [62, 66, 69]), (34.67, [62, 66, 69]), (35.33, [62, 66, 69]), (36, [65, 69, 74])):
        S.chord('brass', bt, 0.4 if bt < 36 else 3.5, notes, 1.0); S.chord('brass2', bt, 0.4 if bt < 36 else 3.5, [n - 12 for n in notes[:2]], 0.9)
    S.note('timp', 36, 1); S.note('kick', 36, 0.5); S.note('bass', 36, 3.5, D, 1.0); chord(S, 'choir', 9, 4, D, MIN, 0.9)
    for i in range(8): S.note('march', 38 + i * 0.25, 0.25, vel=0.4 + 0.08 * i)
    # ---- the fight on the balustrade: the bodyguards, Krasnovia's drive
    for i, r in enumerate([D, D, Bb, A, D, D, Gm, A]):
        bar = 10 + i; band(bar, r, dbl=(i >= 4), fill=(i == 7)); bayan(S, bar, KEY[r])
        if i % 2 == 0: S.chord('hit', bar * 4, 0.3, [r + 24 + o for o in Q[r]], 1.0); S.chord('hit', bar * 4 + 1.5, 0.3, [r + 24 + o for o in Q[r]], 0.9)
        chord(S, 'choiro', bar, 4, r, Q[r], 0.6)
    S.note('crash', 40, 2)
    # ---- the theme: brass, choir, timpani, the city lit up underneath
    for rep in range(2):
        base = 18 + rep * 4
        for i, r in enumerate([D, F, C, None]):
            bar = base + i; b = bar * 4
            if r is None:
                band(bar, Gm, dbl=True, half=A, fill=(bar == 25)); chord(S, 'choir', bar, 2, Gm, MIN); chord(S, 'choir', bar, 2, A, MAJ, at=2)
                chord(S, 'strings', bar, 2, Gm, MIN); chord(S, 'strings', bar, 2, A, MAJ, at=2)
            else:
                band(bar, r, dbl=True); chord(S, 'choir', bar, 4, r, Q[r]); chord(S, 'strings', bar, 4, r, Q[r], 0.8)
            S.note('timp', b, 1, vel=0.8)
            arp(S, bar, r or Gm, Q[r or Gm], v=0.55)
        theme(S, base, 'brass', 74, 1.0, harm='brass2' if rep else None, hv=0.85)
        S.note('crash', base * 4, 2)
    # ---- break: the wind, the bayan alone, the cog's bell. The Chairman on his knees, trying to run
    for i, r in enumerate([D, Bb, Gm, A]):
        bar = 26 + i; b = bar * 4
        bayan(S, bar, KEY[r], v=1.0)
        S.note('kick', b, 0.5); S.note('kick', b + 2.5, 0.5, vel=0.7); S.note('snare', b + 2, 0.5, vel=0.8)
        for k in (0, 0.75, 1, 3, 3.5): S.note('march', b + k, 0.25, vel=0.6)
        S.note('bass', b, 1.9, r, 0.9); S.note('bass', b + 2, 1.9, r + 7, 0.8)
        chord(S, 'choiro', bar, 4, r, Q[r], 0.9)
        if i % 2 == 0: S.note('bell', b, 3, 50, 1.0)
    S.note('roll', 116, 4, vel=1.0)
    # ---- the last stand: the theme as big as it gets
    for rep in range(2):
        base = 30 + rep * 4
        for i, r in enumerate([D, F, C, None]):
            bar = base + i; b = bar * 4
            if r is None:
                band(bar, Gm, dbl=True, half=A, fill=(bar == 37)); chord(S, 'choir', bar, 2, Gm, MIN, 1.0); chord(S, 'choir', bar, 2, A, MAJ, 1.0, at=2)
                chord(S, 'strings', bar, 2, Gm, MIN); chord(S, 'strings', bar, 2, A, MAJ, at=2)
                for k in (2, 2.75, 3.5): S.chord('hit', b + k, 0.3, [69, 73, 76, 81], 1.0)
            else:
                band(bar, r, dbl=True); chord(S, 'choir', bar, 4, r, Q[r], 1.0); chord(S, 'strings', bar, 4, r, Q[r])
                for o in Q[r]: S.note('horns', b, 3.8, r + 12 + o, 0.7)
            S.note('timp', b, 1, vel=1.0); S.note('bell', b, 2, (r or Gm) + 24, 0.6)
            bayan(S, bar, KEY[r or Gm], v=0.45, every=2)
        theme(S, base, 'brass', 74, 1.0, harm='brass2', hv=0.85)
        theme(S, base, 'glock', 86, 0.7)
        S.note('crash', base * 4, 2)
    # ---- he kneels. Everything drops away to the wind; the choir turns D minor to D major
    end = 38 * 4
    S.chord('hit', end, 0.4, [62, 65, 69, 74], 1.0); S.note('kick', end, 0.5); S.note('timp', end, 1); S.note('crash', end, 4)
    S.chord('choiro', end + 1, 7, [50, 57, 62, 65], 0.9)
    S.chord('choir', end + 8, 10, [50, 57, 62, 66, 69], 1.0); S.chord('strings', end + 8, 10, [62, 66, 69, 74], 1.0)
    S.note('bell', end + 8, 4, 62, 1.0); S.note('sub', end + 8, 9, 26, 0.9)
    S.note('horns', end + 8, 9, 66, 1.0); S.note('horns', end + 8, 9, 69, 1.0)
    return S

if __name__ == '__main__':
    print(build().render('act1-tribune.mp3'))
