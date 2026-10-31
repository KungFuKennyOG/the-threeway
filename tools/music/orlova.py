from act1 import *

def build():
    S = Song(150, 38)
    S.add_inst('kick', kick, gain=0.8, punch=1.3, tail=0.25)
    S.add_inst('snare', snare, gain=0.85, gate=0.7, tone=165)
    S.add_inst('hat', hat, pan=0.3, gain=0.9)
    S.add_inst('crash', crash, pan=-0.3, gain=0.4, rev=0.3)
    S.add_inst('anvil', anvil, pan=-0.2, gain=0.55, rev=0.35)
    S.add_inst('anvil2', anvil, pan=0.3, gain=0.5, rev=0.45)
    S.add_inst('type', typewriter, pan=0.4, gain=0.8, rev=0.2)
    S.add_inst('stamp', stamp, pan=-0.2, gain=0.9, rev=0.3)
    S.add_inst('tick', clack, pan=0.1, gain=0.45, rev=0.4)
    S.add_inst('hum', hum, gain=0.05)
    S.add_inst('bass', bass_pick, gain=0.55, sc=0.25, bright=1.6)
    S.add_inst('sub', sub, gain=0.3, sc=0.4)
    S.add_inst('arp', arp_pluck, pan=0.35, gain=0.6, dly=0.3, sc=0.4, cut=3200)
    S.add_inst('brass', brass, pan=0.1, gain=1.15, rev=0.35)
    S.add_inst('brass2', brass, pan=-0.2, gain=0.95, rev=0.35)
    S.add_inst('lead', lead_saw, gain=1.2, rev=0.3, dly=0.22, cut=4800)
    S.add_inst('hit', stab, pan=0.2, gain=0.55, rev=0.3)
    S.add_inst('choir', choir, gain=0.28, rev=0.55, wide=True, sc=0.2)
    S.add_inst('choiro', choir, gain=0.32, rev=0.6, wide=True, vowel='oh')
    S.add_inst('roll', snare_roll, gain=0.65, rev=0.3)

    Fs, D, Cs, A, E, Bm = 42, 38, 37, 45, 40, 47
    Q = {Fs: MIN, D: MAJ, Cs: MAJ, A: MAJ, E: MAJ, Bm: MIN}
    rng = np.random.default_rng(5)

    def ebm(bar, r, half=None, dbl=False, fill=False):   # four on the floor, bass on the off 16ths
        b = bar * 4
        for k in range(4): S.note('kick', b + k, 0.5)
        S.note('snare', b + 1, 0.5); S.note('snare', b + 3, 0.5)
        S.note('anvil', b + 1, 0.5, vel=0.7); S.note('anvil2', b + 3.75, 0.5, vel=0.6)
        step = 0.25 if dbl else 0.5
        for j in range(int(4 / step)): S.note('hat', b + j * step, step, vel=0.9 if (j * step) % 1 == 0.5 else 0.45)
        for j in range(16):
            rr = half if (half and j >= 8) else r
            if j % 4: S.note('bass', b + j * 0.25, 0.2, rr + (12 if j % 4 == 2 else 0), 0.95)
        S.note('sub', b, 3.9, r - 12, 0.7)
        if fill:
            for i in range(8): S.note('snare', b + 2 + i * 0.25, 0.25, vel=0.5 + 0.06 * i)

    def typeroll(t, beats, v=1.0):
        k = 0.0
        while k < beats:
            S.note('type', t + k + rng.uniform(-0.01, 0.01), 0.2, vel=v * rng.uniform(0.5, 1.0)); k += 0.125

    # ---- the archive: one bare bulb, the clock, she's typing your file
    S.note('hum', 0, 16, vel=1.0)
    for i in range(16): S.note('tick', i, 0.25, vel=0.8 if i % 4 == 0 else 0.5)
    for k in (1, 1.5, 2.25, 3, 5, 5.25, 5.5, 7): S.note('type', k, 0.2, vel=0.8)
    typeroll(9, 2.5, 0.8); S.note('stamp', 12, 0.5, vel=1.0); S.note('anvil', 12, 1, vel=1.0)
    chord(S, 'choiro', 2, 8, Fs, (0, 1, 6), 0.7)
    S.note('roll', 14, 2, vel=0.9)
    # ---- the riff: EBM, the harmonic-minor C# major
    for i, r in enumerate([Fs, Fs, D, Cs, Fs, Fs, D, Cs]):
        bar = 4 + i; ebm(bar, r, fill=(i == 7)); arp(S, bar, r, Q[r], v=0.75)
        if i % 2 == 1: S.chord('hit', bar * 4 + 2.5, 0.3, [r + 24 + o for o in Q[r]], 1.0); S.chord('hit', bar * 4 + 3, 0.6, [r + 24 + o for o in Q[r]], 1.0)
        if i >= 4: chord(S, 'choiro', bar, 4, r, Q[r], 0.7)
    S.note('crash', 48, 2)
    # ---- the theme on low brass, choir behind her desk
    for rep in range(2):
        base = 12 + rep * 4
        for i, r in enumerate([Fs, A, E, None]):
            bar = base + i
            if r is None:
                ebm(bar, Bm, half=Cs, fill=(bar == 19)); chord(S, 'choir', bar, 2, Bm, MIN); chord(S, 'choir', bar, 2, Cs, MAJ, at=2)
            else:
                ebm(bar, r, dbl=(rep == 1)); chord(S, 'choir', bar, 4, r, Q[r])
            arp(S, bar, r or Bm, Q[r or Bm], v=0.6)
        theme(S, base, 'brass', 54, 1.0)
        if rep: theme(S, base, 'brass2', 66, 0.85)
        S.note('crash', base * 4, 2)
    # ---- the interrogation: the beat drops to a pulse, the typewriter, the stamps
    for i in range(4):
        bar = 20 + i; b = bar * 4
        S.note('kick', b, 0.5); S.note('kick', b + 2, 0.5, vel=0.7)
        for j in range(4): S.note('tick', b + j, 0.25, vel=0.7)
        typeroll(b + 0.5, 1.0 + 0.5 * i, 0.9)
        S.note('stamp', b + 3, 0.5, vel=1.0); S.note('anvil', b + 3, 1, vel=0.7)
        S.note('bass', b, 3.8, Fs, 0.7); S.note('sub', b, 3.9, 30, 0.8)
        chord(S, 'choiro', bar, 4, Fs, (0, 1, 6, 12), 0.8)
    S.note('roll', 92, 4, vel=1.0)
    # ---- ENRAGED: double time, the lead screams the theme, the choir opens
    for rep in range(2):
        base = 24 + rep * 4
        for i, r in enumerate([Fs, A, E, None]):
            bar = base + i
            if r is None:
                ebm(bar, Bm, half=Cs, dbl=True, fill=(bar == 31)); chord(S, 'choir', bar, 2, Bm, MIN); chord(S, 'choir', bar, 2, Cs, MAJ, at=2)
            else:
                ebm(bar, r, dbl=True); chord(S, 'choir', bar, 4, r, Q[r])
            arp(S, bar, r or Bm, Q[r or Bm], v=0.7)
            for k in (0.5, 2.5): S.note('anvil2', bar * 4 + k, 0.5, vel=0.7)
        theme(S, base, 'lead', 66, 1.0)
        theme(S, base, 'brass', 54, 0.9, harm='brass2', hv=0.7, hshift=2)
        S.note('crash', base * 4, 2)
    # ---- the riff again, then down: F#m, the bulb swinging, one last stamp
    for i, r in enumerate([Fs, Fs, D, Cs]):
        bar = 32 + i; ebm(bar, r, dbl=True, fill=(i == 3)); arp(S, bar, r, Q[r], v=0.75)
    end = 36 * 4
    S.chord('hit', end, 0.5, [66, 69, 73, 78], 1.0); S.note('anvil', end, 1, vel=1.0); S.note('kick', end, 1); S.note('crash', end, 4)
    S.chord('brass', end, 5, [54, 57, 61, 66], 1.0); chord(S, 'choiro', 36, 6, Fs, MIN, 1.0)
    S.note('sub', end, 5, 30, 1.0); S.note('bass', end, 3, Fs, 1.0)
    S.note('hum', end + 1, 6, vel=1.0); S.note('stamp', end + 5, 0.5, vel=1.0)
    return S

if __name__ == '__main__':
    print(build().render('act1-orlova.mp3'))
