"""Paints the Krasnovian conscript and laborer sheets (64x128, same layout as every goon sheet; see
characters.js) and the laborer's pipe (8x32, same layout as the bat). Faces start from existing sheets and
are recoloured: the conscript from Bat Boy's (cap -> fur ushanka with flaps, half-shut eyes), the laborer
from the wrestler's (buzz cut -> knit cap). Run from the repo root: python3 tools/krasnovian_goons.py"""
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

# ---------------- the laborer: quilted work jacket, red scarf, knit cap, work trousers, boots
q, w, z, c2, t2, k2, cap, capD = '#3a4250', '#2a3038', '#b8231e', '#5a6270', '#4a4440', '#1e1a18', '#4a5a6a', '#34404c'
def laborer_face(p, i):
    p.rect(3, 4, 26, 1, capD)                  # the cap's turned-up edge
im = faces('assets/tex/sheet_wrestler.png', {'#b78976': cap, '#866456': capD}, laborer_face)
def quilt(p, x0=0):
    p.rect(0, 0, 16, 16, q)
    for x in range(1, 16, 3): p.rect(x, 0, 1, 16, w)
A = P(im, 32, 32); quilt(A); A.rect(7, 0, 2, 16, c2); A.rect(3, 0, 10, 3, z); A.rect(7, 3, 2, 2, z)   # placket, scarf
for y in (5, 9, 13): A.px(7, y, w)
B = P(im, 48, 32); quilt(B); B.rect(0, 13, 16, 3, w)
C = P(im, 32, 48); quilt(C); C.rect(0, 10, 16, 2, w); C.rect(0, 12, 16, 4, '#e0a890')
D = P(im, 48, 48); D.rect(0, 0, 8, 16, t2); D.rect(1, 6, 6, 3, '#3a3430'); D.rect(8, 0, 8, 16, k2); D.rect(8, 14, 8, 2, '#3a3430')
BK = P(im, 0, 64); quilt(BK); BK.rect(0, 0, 16, 2, z)
SD = P(im, 16, 64); quilt(SD)
im.save('assets/tex/sheet_laborer.png')

# ---------------- the pipe: steel barrel with a red valve fitting (rows 0-21), black tape grip (rows 22-31)
pp = Image.new('RGBA', (8, 32)); X = P(pp, 0, 0)
X.rect(0, 0, 8, 22, '#7a828c'); X.rect(1, 0, 2, 22, '#a8b0ba'); X.rect(6, 0, 2, 22, '#5a626c')
for (x, y) in ((4, 6), (5, 11), (3, 15), (5, 18)): X.px(x, y, '#8a5a3a')   # rust
X.rect(0, 0, 8, 3, '#b8231e'); X.rect(0, 3, 8, 1, '#7a1a16')               # valve fitting at the tip
X.rect(0, 22, 8, 10, '#1e1c20')
for y in range(23, 32, 2): X.rect(0, y, 8, 1, '#34303a')
pp.save('assets/tex/pipe.png')
print('ok')
