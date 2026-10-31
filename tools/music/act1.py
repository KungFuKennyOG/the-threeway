# Shared Krasnovian building blocks for the Act 1 level tracks.
from engine import *
from threeway import diat

MIN, MAJ, DOM = (0, 3, 7), (0, 4, 7), (0, 4, 7, 10)
MAJ_SCALE = (0, 2, 4, 5, 7, 9, 11)
# The main theme in a major key (b3 -> 3, b6 -> 6, b7 -> 7): the parade and the signing.
THEME_MAJ = [(b, d, {3: 4, 8: 9, 10: 11}.get(s, s)) for b, d, s in THEME]

def theme(S, bar, inst, root, v=1.0, harm=None, hv=0.8, th=THEME, k=0.92, upto=16, scale=None, stretch=1.0, hshift=-2):
    """Play the theme from `bar` with its tonic at `root`; `harm` adds a diatonic third below."""
    for bt, d, s in th:
        if bt >= upto: continue
        S.note(inst, bar * 4 + bt * stretch, d * k * stretch, root + s, v)
        if harm:
            h = diat(s, hshift) if scale is None else diat(s, hshift, scale)
            S.note(harm, bar * 4 + bt * stretch, d * k * stretch, root + h, v * hv)

def chord(S, inst, bar, beats, root, q, v=1.0, base=12, at=0.0):
    for o in q: S.note(inst, bar * 4 + at, beats, root + base + o, v)

def coldwave(S, bar, dbl=False, fill=False, kick=(0, 2, 2.5), snare=(1, 3), hat='hat', clap=None, kv=1.0):
    b = bar * 4
    for k in kick: S.note('kick', b + k, 0.5, vel=kv)
    for k in snare:
        S.note('snare', b + k, 0.5)
        if clap: S.note(clap, b + k, 0.5, vel=0.7)
    step = 0.25 if dbl else 0.5
    for i in range(int(4 / step)):
        S.note(hat, b + i * step, step, vel=([1, 0.4, 0.7, 0.4][i % 4] if dbl else (0.85 if i % 2 == 0 else 0.5)))
    if fill:
        for i in range(6): S.note('snare', b + 2.5 + i * 0.25, 0.25, vel=0.5 + 0.1 * i)

def ppbass(S, bar, root, q=MIN, inst='bass', half=None, v=1.0):
    """Post-punk melodic bass: root, root, 5th, root, 7th, 5th, 4th, 3rd."""
    def pat(qq): return [0, 0, 7, 0, 10 if qq == MIN else 9, 7, 5, 3 if qq == MIN else 4]
    for i in range(8):   # half = (root, quality) for the bar's second half
        r, qq = half if (half and i >= 4) else (root, q)
        S.note(inst, bar * 4 + i * 0.5, 0.45, r + pat(qq)[i], v * (1.0 if i % 2 == 0 else 0.8))

def arp(S, bar, root, q, inst='arp', base=24, v=0.8, step=0.25, beats=4):
    tones = [root + base + o for o in q[:3]] + [root + base + 12]
    order = [0, 1, 2, 3, 2, 1]
    for i in range(int(beats / step)): S.note(inst, bar * 4 + i * step, step * 0.9, tones[order[i % 6]], v)

# Bayan 16th riff over a pedal, written for D minor; transposed by `shift` semitones.
BAYAN = {
    ('D', MIN): [74, 69, 65, 69, 76, 69, 65, 69, 77, 69, 76, 69, 74, 69, 73, 69],
    ('Bb', MAJ): [74, 70, 65, 70, 77, 70, 65, 70, 79, 70, 77, 70, 74, 70, 72, 70],
    ('G', MIN): [74, 70, 67, 70, 77, 70, 67, 70, 79, 70, 77, 70, 74, 70, 72, 70],
    ('A', MAJ): [73, 69, 64, 69, 76, 69, 64, 69, 77, 69, 76, 69, 73, 69, 71, 69],
    ('F', MAJ): [72, 69, 65, 69, 77, 69, 65, 69, 76, 69, 74, 69, 72, 69, 70, 69],
    ('C', MAJ): [72, 67, 64, 67, 76, 67, 64, 67, 74, 67, 72, 67, 71, 67, 72, 67],
}
def bayan(S, bar, key, shift=0, v=1.0, inst='acc', every=1):
    for i, m in enumerate(BAYAN[key]):
        if i % every == 0: S.note(inst, bar * 4 + i * 0.25, 0.22, m + shift, v * (1.0 if i % 2 == 0 else 0.6))
