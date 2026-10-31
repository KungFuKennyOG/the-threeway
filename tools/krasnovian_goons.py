"""Paints the Krasnovian conscript and laborer sheets (64x128, same layout as every goon sheet; see
characters.js) and the laborer's pipe (8x32, same layout as the bat). Faces start from existing sheets and
are recoloured: the conscript from Bat Boy's (cap -> fur ushanka with flaps, half-shut eyes). The laborer is painted from
scratch with tools/goonkit.py (the flair pass). Run from the repo root: python3 tools/krasnovian_goons.py"""
from PIL import Image

def H(h): return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255)
class P:
    def __init__(s, im, ox, oy): s.im, s.ox, s.oy = im, ox, oy
    def px(s, x, y, c): s.im.putpixel((s.ox + x, s.oy + y), H(c) if isinstance(c, str) else c)
    def rect(s, x, y, w, h, c):
        for j in range(h):
            for i in range(w): s.px(x + i, y + j, c)
def recolour(face, mapping):
    out = face.copy()
    for y in range(face.height):
        for x in range(face.width):
            c = face.getpixel((x, y))[:3]; k = '#%02x%02x%02x' % c
            if k in mapping: out.putpixel((x, y), H(mapping[k]))
    return out

def faces(src, mapping, extra):
    s = Image.open(src).convert('RGBA'); out = Image.new('RGBA', (64, 128), (0, 0, 0, 0))
    for i, (ox, oy) in enumerate(((0, 0), (32, 0), (0, 32))):   # normal, hurt, KO
        f = recolour(s.crop((ox, oy, ox + 32, oy + 32)), mapping); extra(P(f, 0, 0), i); out.paste(f, (ox, oy))
    return out

# ---------------- the conscript: oversized olive greatcoat, fur ushanka with a red badge, boots
o, d, b, r, l, k, sk, t, g, fur, furL = '#5e6240', '#474a30', '#e8c868', '#b8231e', '#4a3020', '#1e1a18', '#e0b08c', '#3e4030', '#2e3022', '#6a5a48', '#8a7860'
def conscript_face(p, i):
    for y in range(9, 19):                     # ear flaps hanging down past the cheeks
        for x in (0, 1, 2, 29, 30, 31): p.px(x, y, fur)
    p.rect(15, 3, 2, 2, b)                     # gold cog on the red badge
    if i == 0: p.rect(7, 15, 7, 1, '#705846'); p.rect(19, 15, 7, 1, '#705846')   # heavy lids: half asleep
im = faces('assets/tex/sheet_batboy.png', {'#141a3a': fur, '#0c0f22': furL}, conscript_face)
A = P(im, 32, 32); A.rect(0, 0, 16, 16, o); A.rect(0, 0, 1, 16, d); A.rect(15, 0, 1, 16, d)
A.rect(0, 0, 3, 2, r); A.rect(13, 0, 3, 2, r); A.rect(7, 0, 2, 1, sk); A.rect(7, 1, 2, 15, d)
for y in (3, 6, 9): A.px(5, y, b); A.px(10, y, b)
A.rect(0, 11, 16, 2, l); A.rect(7, 11, 2, 2, b)
B = P(im, 48, 32); B.rect(0, 0, 16, 16, o); B.rect(7, 0, 2, 14, d); B.rect(0, 14, 16, 2, d); B.rect(0, 0, 1, 16, d); B.rect(15, 0, 1, 16, d)   # coat skirt
C = P(im, 32, 48); C.rect(0, 0, 16, 10, o); C.rect(0, 10, 16, 2, d); C.rect(0, 12, 16, 4, sk)   # sleeve (rows 0-9), cuff, hand (rows 12-15)
D = P(im, 48, 48); D.rect(0, 0, 8, 16, t); D.rect(0, 7, 8, 1, g); D.rect(8, 0, 8, 16, k); D.rect(8, 14, 8, 2, g)   # trousers | boots
BK = P(im, 0, 64); BK.rect(0, 0, 16, 16, o); BK.rect(0, 0, 16, 2, d); BK.rect(7, 2, 2, 14, d); BK.rect(0, 0, 1, 16, d); BK.rect(15, 0, 1, 16, d)
BK.rect(3, 11, 10, 2, l); BK.px(4, 11, b); BK.px(11, 11, b)            # half-belt across the back
SD = P(im, 16, 64); SD.rect(0, 0, 16, 16, o); SD.rect(0, 11, 16, 2, l); SD.rect(0, 0, 1, 16, d); SD.rect(15, 0, 1, 16, d)
im.save('assets/tex/sheet_conscript.png')

# ---------------- the laborer (the flair pass, goon()'s panel layout; see tools/goons_palace.py)
# SIGNATURE: a big puffy rust-orange quilted jacket (and the pipe). TA the jacket (and its padding), X1 its hem, X2 the red scarf,
# X3 + SW(0) the knit cap, SW(1) the cigarette
from goonkit import Sheet, swatch, cog, faces3, eye, mouth_hurt, mouth_ko, remap
from goons_palace import limb, skin_face, bare_hand, shoe
def laborer():
    S = Sheet()
    sk, sh, dk, hi, hr, stb = '#d8a27e', '#b07a5a', '#6a3e2c', '#f0c49c', '#1a1412', '#8a6a56'
    Q, Qd, Qh, R, Rd, Rh = '#c4622a', '#7a3616', '#ec8e4c', '#b8231e', '#7a1612', '#e04a3a'
    C, Cd, Ch, T, Td, Th = '#2a3a5a', '#18243a', '#44587e', '#4a5a6a', '#2e3a46', '#6a7a8a'
    Gl, Gld, W, K, G, Gd = '#a8804a', '#7a5a30', '#f4f1ea', '#141014', '#f2c14e', '#b88a2a'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 6, C); P.hl(0, 6, 32, Cd); P.rect(0, 7, 3, 9, hr); P.rect(29, 7, 3, 9, hr)
        l = -1 if v == 1 else 0
        P.rect(5, 9 + l, 22, 3, hr); P.hl(5, 12 + l, 22, sh)   # one long unibrow
        if v == 0:
            for x0 in (8, 19): P.hl(x0, 13, 5, dk); P.rect(x0, 14, 5, 2, W); P.rect(x0 + 2, 14, 2, 2, K)
        else: eye(P, v, 8, 13, 5, W, K, dk); eye(P, v, 19, 13, 5, W, K, dk)
        P.rect(13, 16, 6, 5, sh); P.hl(12, 20, 8, dk); P.px(15, 17, hi)   # a flattened nose
        P.grain(sk, stb, 0.4, 2, 3, 21, 26, 9)   # three days of stubble
        if v == 0: P.hl(10, 25, 12, dk); P.px(13, 25, W); P.px(17, 25, '#d8c070')   # a gap-toothed scowl (and the cigarette, a box)
        elif v == 1: mouth_hurt(P, 10, 24, 12, dk, W)
        else: mouth_ko(P, 11, 24, 10, dk, '#c84858')
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 7, C); hd.hl(0, 7, 16, Cd); hd.rect(0, 8, 16, 4, hr); hd.rect(0, 13, 16, 3, sh)
    cp = S.at('X3'); cp.fill(C)   # the knit cap: ribbed, a rolled brim
    for x in range(0, 16, 2): cp.vl(x, 0, 10, Cd)
    cp.rect(0, 10, 16, 6, Ch); cp.hl(0, 10, 16, Cd); cp.hl(0, 13, 16, Cd)
    swatch(S, 0, C); swatch(S, 1, W); S.rect(52, 112, 1, 4, '#ff7a3a')
    def quilt(P, k):   # quilted: diamond stitching, puffed highlights
        P.fill(Q)
        for y in range(16):
            for x in range(16):
                if (x + y) % 5 == 0 or (x - y) % 5 == 0: P.px(x, y, Qd)
                elif (x + y) % 5 == 2 and (x - y) % 5 == 2: P.px(x, y, Qh)
        P.grain(Q, Qh, 0.06, k)
    t = S.at('TA'); quilt(t, 3)   # the jacket's front: a placket, a sewn patch, a gold labour badge
    t.vl(7, 0, 16, Qd); t.vl(8, 0, 16, Qh)
    for y in (3, 7, 11): t.px(7, y, K); t.px(8, y, K)
    t.rect(10, 9, 5, 5, T); t.outline(10, 9, 5, 5, Td); t.px(11, 10, W); t.px(13, 12, W)   # a patch, sewn on crooked
    t.disc(3, 4, 2.2, R); cog(t, 3, 4, 1.6, G, Gd)
    b = S.at('TA_B'); quilt(b, 4); b.vl(7, 0, 16, Qd); b.rect(3, 4, 10, 6, Td); b.outline(3, 4, 10, 6, K); b.hl(4, 6, 8, Th); b.hl(4, 8, 6, Th)   # a stencilled work number
    s_ = S.at('TA_S'); quilt(s_, 5)
    hm = S.at('X1'); quilt(hm, 6); hm.rect(0, 12, 16, 4, Qd); hm.vl(7, 0, 12, Qd)
    sc = S.at('X2'); sc.fill(R)   # the scarf: knitted, a fringe
    for y in range(0, 16, 2): sc.hl(0, y, 16, Rd)
    for x in range(1, 16, 4): sc.vl(x, 0, 16, Rh)
    sc.hl(0, 14, 16, W); sc.checker(0, 15, 16, 1, Rd)
    tb = S.at('TB'); tb.fill(T); tb.rect(0, 0, 16, 3, K); tb.rect(6, 0, 4, 3, '#9a9aa6')
    u = S.at('X6'); quilt(u, 7); u.vl(15, 0, 16, Qd)
    f = S.at('X7'); quilt(f, 8); f.rect(0, 11, 16, 5, Gl); f.hl(0, 11, 16, Gld)   # leather work gloves' cuffs
    hn = S.at('X8'); bare_hand(hn, Gl, Gld, '#4a3418', '#c8a06a')
    th = S.at('X9'); limb(th, T, Th, Td); th.rect(4, 10, 7, 5, Td); th.outline(4, 10, 7, 5, Th)   # canvas trousers, a knee patch
    sn = S.at('X10'); limb(sn, T, Th, Td); sn.rect(0, 8, 16, 8, K); sn.hl(0, 8, 16, '#3a3a44'); sn.vl(3, 9, 6, '#4a4a58')   # rubber boots
    fo = S.at('X11'); shoe(fo, K, '#4a4a58', '#000000', '#3a2a1a')
    swatch(S, 15, sk)
    remap(S, {'#000000': '#141014', '#1a1412': '#141014', '#3a2a1a': '#4a3418', '#3a3a44': '#2e3a46', '#d8c070': '#f2c14e', '#ff7a3a': '#ec8e4c'})
    return S.save('assets/tex/sheet_laborer.png', 32)
laborer()

# ---------------- the pipe: steel barrel with a red valve fitting (rows 0-21), black tape grip (rows 22-31)
pp = Image.new('RGBA', (8, 32)); X = P(pp, 0, 0)
X.rect(0, 0, 8, 22, '#7a828c'); X.rect(1, 0, 2, 22, '#a8b0ba'); X.rect(6, 0, 2, 22, '#5a626c')
for (x, y) in ((4, 6), (5, 11), (3, 15), (5, 18)): X.px(x, y, '#8a5a3a')   # rust
X.rect(0, 0, 8, 3, '#b8231e'); X.rect(0, 3, 8, 1, '#7a1a16')               # valve fitting at the tip
X.rect(0, 22, 8, 10, '#1e1c20')
for y in range(23, 32, 2): X.rect(0, y, 8, 1, '#34303a')
pp.save('assets/tex/pipe.png')
print('ok')
