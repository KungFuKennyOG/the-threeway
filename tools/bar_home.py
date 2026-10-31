"""The bar's glimpses of the three home countries, painted from code (same 5x7 font as the game's Pix.text):
  window.png     the Columbia window: Liberty Avenue's gold-crowned towers at night, searchlights, sky room for the Halcyon
  zep_strip.png  the Halcyon zeppelin on a clear strip; bar.js scrolls it slowly across the window's upper panes
  menuboard.png  the lit board behind the bar: FROM HOME (Columbia Cola, bottled in Halcyon; Krasnograd vodka; Ōkyō beer)
  bottles.png    the three bottles, relabelled: Columbia Cola, Okyo beer, Krasnograd vodka (same 24x16 layout: props use it too)
Run from the repo root, then repack the atlas:  python3 tools/bar_home.py && python3 tools/bar_atlas.py
(tools/bar_room.py paints the rest of the room's new pieces with the same Pix.)"""
import random, re
from PIL import Image

src = open('src/street/paint.js', encoding='utf8').read()
FONT = {k: v for k, v in re.findall(r"'?([A-Z0-9.!\-·])'?: '([01]{35})'", src)}

def H(h, a=255): return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), a)

class Pix:
    def __init__(s, w, h): s.w, s.h = w, h; s.im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    def set(s, x, y, c, a=255):
        if 0 <= x < s.w and 0 <= y < s.h: s.im.putpixel((int(x), int(y)), H(c, a))
    def rect(s, x, y, w, h, c, a=255):
        for j in range(h):
            for i in range(w): s.set(x + i, y + j, c, a)
    def text(s, t, x, y, c):
        for ch in t.upper():
            g = FONT.get(ch)
            if g:
                for i in range(35):
                    if g[i] == '1': s.set(x + i % 5, y + i // 5, c)
            x += 6
    def ctext(s, t, y, c): s.text(t, (s.w - (len(t) * 6 - 1)) // 2, y, c)
    def save(s, name): s.im.save(f'assets/tex/{name}.png', optimize=True)

# ---- the Columbia window: 2 m x 1.6 m at 32 px a metre. A frame, a mullion down the middle, a transom; the upper panes
# keep rows 2-12 clear for the Halcyon's strip (bar.js), so it passes over the crowns, behind none of them.
def window():
    random.seed(7)
    p = Pix(64, 52)
    sky = ['#160e2a', '#1c1230', '#221636', '#2a1a3c', '#331f42', '#3e2546', '#4a2b48']
    for y in range(52):
        k = min(len(sky) - 1, y // 6)
        for x in range(64):
            c = sky[k]
            if y % 6 == 5 and (x + y) % 2 and k + 1 < len(sky): c = sky[k + 1]   # dithered band edges
            p.set(x, y, c)
    for _ in range(14): p.set(random.randrange(64), random.randrange(12), '#b8b0d0')   # a few stars
    # two gold searchlight beams crossing the sky from behind the towers
    for x0, dx in ((8, 0.62), (58, -0.55)):
        for y in range(46, -1, -1):
            x = x0 + (46 - y) * dx
            if (y % 2) or y > 20: p.set(round(x), y, '#8a7656')
            if y < 30 and y % 3 == 0: p.set(round(x) + (1 if dx > 0 else -1), y, '#5e4c48')
    # far towers in the haze
    for x0, w, top in ((0, 7, 30), (9, 6, 27), (19, 7, 31), (27, 8, 26), (40, 6, 28), (49, 7, 30), (57, 7, 25)):
        p.rect(x0, top, w, 52 - top, '#3a2c3e'); p.rect(x0 + w // 2, top - 3, 1, 3, '#6a5a50')
        for y in range(top + 2, 52, 3):
            for x in range(x0 + 1, x0 + w - 1, 2):
                if random.random() < 0.3: p.set(x, y, '#a07850')
    # the near towers: dark deco shafts, gold setback crowns, lit windows
    def tower(x0, w, top, crown, spire=0, beacon=False):
        body = '#2a2028'; p.rect(x0, top, w, 52 - top, body)
        p.rect(x0, top, 1, 52 - top, '#3a2e36')                                     # a lit edge
        for y in range(top + 3, 52, 2):
            for x in range(x0 + 1, x0 + w - 1, 2):
                q = random.random()
                if q < 0.42: p.set(x, y, '#ffd890' if q < 0.2 else '#ffb040' if q < 0.33 else '#f0e6cc')
        if crown == 'step':      # stepped gold setbacks
            for k in range(3):
                cw = w - 2 - 2 * k
                if cw < 1: break
                p.rect(x0 + 1 + k, top - 2 - 2 * k, cw, 2, '#b8943c'); p.rect(x0 + 1 + k, top - 2 - 2 * k, cw, 1, '#e8c868')
            tip = top - 6
        elif crown == 'sun':     # a sunburst crown: gold rays fanning out of an arch
            cx = x0 + w // 2
            for r in range(1, 6):
                for x in range(cx - r, cx + r + 1): p.set(x, top - 6 + r, '#b8943c')
            for k in range(-4, 5, 2): p.set(cx + k, top - 1, '#e8c868'); p.set(cx + k // 2, top - 3, '#e8c868')
            p.set(cx, top - 5, '#ffe8a0'); p.set(cx, top - 4, '#ffe8a0')
            tip = top - 6
        else:                    # a gold mansard (the Royal Hotel) with its red neon
            p.rect(x0, top - 3, w, 3, '#9a7a30'); p.rect(x0 + 1, top - 4, w - 2, 1, '#e8c868')
            p.rect(x0 + 2, top - 2, w - 4, 1, '#ff3a3a')
            tip = top - 4
        if spire:
            cx = x0 + w // 2
            p.rect(cx, tip - spire, 1, spire, '#e8c868')
            if beacon: p.set(cx, tip - spire - 1, '#ff3020')
        p.rect(x0, top + 6, w, 1, '#8a6a2a')                                         # a gold band
    tower(2, 9, 19, 'step', 2)
    tower(12, 9, 16, 'sun')
    tower(22, 8, 22, 'step', 2)
    tower(34, 10, 17, 'step', 1, beacon=True)   # Civic Harmony's mast and beacon
    tower(46, 8, 21, 'mansard')
    tower(55, 8, 18, 'sun', 1)
    # the frame: a dark wood border, the mullion, the transom
    wood = '#2a1c16'
    p.rect(0, 0, 64, 1, wood); p.rect(0, 51, 64, 1, wood); p.rect(0, 0, 1, 52, wood); p.rect(63, 0, 1, 52, wood)
    p.rect(31, 0, 2, 52, wood); p.rect(0, 20, 64, 2, wood); p.rect(0, 22, 64, 1, '#4a3428')
    p.save('window')

# ---- the Halcyon on a clear strip (128 x 8; the window shows 64 px of it at a time): cream hull, gold deco ribs, the
# lit FLY HALCYON panel, a narrow navy belly band, the lit gondola, navy fins edged gold, red and green running lights.
def zeppelin():
    p = Pix(128, 8)
    rows = [
        '.een..................',
        '..nnnnhhhhhhhhhhhh....',
        '...cccgcccgcccgcccgcc.',
        '.rcccceynynynynyncgcch',
        '.Gccccgcccgcccgcccgccs',
        '...sssgsssgsssgsssgss.',
        '..nnnn.nnnnnnnnnn.....',
        '.een........koooook...',
    ]
    pal = {'c': '#efe4c8', 'h': '#fff6dc', 's': '#cbb894', 'g': '#d8a840', 'e': '#e8b848', 'n': '#1a2a5a', 'y': '#fff0b0',
           'o': '#ffc870', 'k': '#2a2228', 'r': '#ff3020', 'G': '#30e060'}
    for y, row in enumerate(rows):
        assert len(row) == 22, (y, len(row))
        for x, ch in enumerate(row):
            if ch in pal: p.set(53 + x, y, pal[ch])
    p.save('zep_strip')

# ---- the lit board behind the bar (1 m x 1.3 m): what's on ice from home
def menuboard():
    p = Pix(64, 84)
    p.rect(0, 0, 64, 84, '#c9a04a'); p.rect(1, 1, 62, 82, '#120c10')
    p.ctext('FROM HOME', 3, '#ff4f9a'); p.rect(4, 11, 56, 1, '#5a3a48')
    p.ctext('COLUMBIA', 14, '#e8352b'); p.ctext('COLA', 23, '#f4f1ea')
    p.ctext('BOTTLED IN', 32, '#f2c14e'); p.ctext('HALCYON', 41, '#f2c14e')
    p.rect(10, 50, 44, 1, '#5a3a48')
    p.ctext('KRASNOGRAD', 53, '#f4f1ea'); p.ctext('VODKA', 62, '#e8352b')
    p.rect(10, 70, 44, 1, '#5a3a48')
    p.ctext('OKYO BEER', 75, '#33e0d0')
    x = (64 - (9 * 6 - 1)) // 2
    for k in (0, 3): p.rect(x + k * 6 + 1, 73, 3, 1, '#33e0d0')   # the macrons: OKYO is spelt with two long Os
    p.save('menuboard')

# ---- the bottles (8 x 16 each; neck rows 0-3, body 4-15, label 8-11): the same shapes, home brands on the labels
def bottles():
    p = Pix(24, 16)
    def bottle(x, neck, glass, shine, label):
        p.rect(x + 3, 0, 2, 4, neck); p.rect(x + 2, 4, 4, 12, glass); p.rect(x + 2, 5, 1, 2, shine)
        for (i, j), c in label.items(): p.set(x + 2 + i, 8 + j, c)
    lab = lambda base, extra: {**{(i, j): base for i in range(4) for j in range(4)}, **extra}
    # Columbia Cola: pale green glass, dark cola, a red label with a white swash and a gold rule, a gold cap
    bottle(0, '#3a6a4a', '#3a2418', '#8ab89a', lab('#c8302a', {(0, 1): '#f4f1ea', (1, 1): '#f4f1ea', (2, 2): '#f4f1ea', (3, 2): '#f4f1ea', (0, 3): '#e8c868', (1, 3): '#e8c868', (2, 3): '#e8c868', (3, 3): '#e8c868'}))
    p.set(3, 0, '#e8c868'); p.set(4, 0, '#e8c868')
    # Okyo beer: brown glass, a black label with Hinomoto's gold square and its red heart
    bottle(8, '#542e13', '#6a3a18', '#c3b0a2', lab('#141016', {(1, 1): '#f2c14e', (2, 1): '#f2c14e', (1, 2): '#f2c14e', (2, 2): '#e8352b'}))
    # Krasnograd vodka: clear glass, a white label under a red band, the gold cog; a red cap
    bottle(16, '#a0aca6', '#c8d8d0', '#e9efec', lab('#f4f1ea', {(0, 0): '#b8231e', (1, 0): '#b8231e', (2, 0): '#b8231e', (3, 0): '#b8231e', (1, 2): '#f2c14e', (2, 2): '#c9a04a'}))
    p.set(19, 0, '#b8231e'); p.set(20, 0, '#b8231e')
    p.save('bottles')

if __name__ == '__main__':
    window(); zeppelin(); menuboard(); bottles()
    print('painted window, zep_strip, menuboard, bottles')
