from act1 import *

# SIGNED · 1 OF 3: the permit is signed. The theme's last bar, resolved to major. ~10 s.
def build(key=62):
    S = Song(100, 3)
    S.add_inst('brass', brass, pan=0.1, gain=1.3, rev=0.45, bright=1.3, swell=0.03)
    S.add_inst('brass2', brass, pan=-0.2, gain=0.95, rev=0.45)
    S.add_inst('timp', taiko, gain=0.55, rev=0.5)
    S.add_inst('roll', snare_roll, gain=0.6, rev=0.35)
    S.add_inst('crash', crash, pan=-0.3, gain=0.45, rev=0.35)
    S.add_inst('choir', choir, gain=0.35, rev=0.65, wide=True)
    S.add_inst('bell', bell, pan=0.25, gain=0.45, rev=0.6, tau=2.6, ratio=2.76, idx=1.6)
    S.add_inst('glock', glock, pan=-0.3, gain=0.3, rev=0.5)
    S.add_inst('tuba', tuba, gain=0.9, rev=0.3)
    r = key
    for i in range(6): S.note('timp', i * 0.25, 0.25, vel=0.4 + 0.1 * i)
    S.note('roll', 0, 1.5, vel=1.0)
    # fanfare: triplet pickup, then the theme's last bar in major (3 2 1), up to the octave
    for k, s in ((1.5, 7), (1.67, 7), (1.83, 7)): S.chord('brass', k, 0.15, [r + s, r + s - 3], 0.9)
    for k, d, s in ((2, 1.4, 4), (3.5, 0.45, 2), (4, 1.0, 0), (5, 3, 12)):
        S.note('brass', k, d, r + s, 1.0); S.note('brass2', k, d, r + {4: 0, 2: -5, 0: -8, 12: 7}[s], 0.85)
    S.note('tuba', 2, 2, r - 24, 1.0); S.note('tuba', 4, 1, r - 17, 1.0); S.note('tuba', 5, 3, r - 24, 1.0)
    S.note('timp', 2, 1); S.note('timp', 4, 1, vel=0.7); S.note('timp', 5, 1); S.note('crash', 5, 4)
    S.chord('choir', 5, 4, [r - 12, r - 5, r, r + 4], 1.0)
    for k, s in ((5, 12), (5.5, 16), (6, 19), (6.5, 24)): S.note('glock', k, 0.5, r + s, 0.8)
    S.note('bell', 5, 4, r, 1.0)
    return S

if __name__ == '__main__':
    print(build().render('act1-signed.mp3'))
