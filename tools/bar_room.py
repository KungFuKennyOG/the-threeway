"""The Threeway's room pieces, painted from code (the same Pix and 5x7 font as tools/bar_home.py):
  window_kras.png   the Krasnovia window (opposite Columbia's): panel slabs, the TV tower, the Tower of Labor floodlit under its
                    gold cog with searchlights, sodium haze, a lace half-curtain
  window_hino.png   the Hinomoto window (back wall, beside the bar): black glass and neon, blade signs, the Shuto's tail lights,
                    Aoki Development's red-edged spike and pagoda crown
  window_sq.png     the two front windows onto Tripoint Square (the facade's two big windows): gaslamps, tenements, St. Vost's
                    domes, the Brass Clock / the sealed station, the brass lines, a cafe curtain
  mirror.png        the back bar's smoked mirror: sheen, worn silvering, the room's lights reflected
  shelf.png         two rows of bottles for the back bar's shelves, lit from below
  emblem.png        the sign over the mirror: the Threeway's round brass emblem, split three ways, the taped fist
  accords.png       the Vostburg Accords (1962), framed by the door: ART. 1 NO FIREARMS, three seals
  photos.png        polaroids of regulars from all three sides
  poster_halcyon.png  FLY HALCYON over the Columbian booth
  pachinko.png      a Hinomoto pachinko machine's face
  backbits.png      Sasha's back counter: the brass till, the radio (dial: Krasnograd, Halcyon, Okyo), the lucky cat, the samovar
  medallion.png     the brass disc in the floor where the three Accords lines meet, in front of the bar
  formica.png, vinyl.png, chess.png, glow.png, fan.png   the diner booth, the chess table, light strips, the ceiling fan's blades
Run from the repo root, then repack the atlas:  python3 tools/bar_room.py && python3 tools/bar_atlas.py"""
import math, random
from bar_home import Pix, H

EM = 204   # alpha 204: the texel glows by itself (the shader's self-lit marker)
WOOD = '#2a1c16'

def dith(p, x, y, a, b):   # a 50% checker between two colours
    p.set(x, y, a if (x + y) % 2 else b)

def frame(p, x0, y0, w, h, c=WOOD):
    p.rect(x0, y0, w, 1, c); p.rect(x0, y0 + h - 1, w, 1, c); p.rect(x0, y0, 1, h, c); p.rect(x0 + w - 1, y0, 1, h, c)

def sky(p, x0, y0, w, h, cols, band):
    for y in range(h):
        k = min(len(cols) - 1, y // band)
        for x in range(w):
            c = cols[k]
            if y % band == band - 1 and (x + y) % 2 and k + 1 < len(cols): c = cols[k + 1]
            p.set(x0 + x, y0 + y, c)

# ---- Krasnovia: 2 m x 1.6 m (64 x 52), the same frame as the Columbia window (mullion, transom)
def window_kras():
    random.seed(11)
    p = Pix(64, 52)
    sky(p, 0, 0, 64, 52, ['#120c18', '#170f1c', '#1e1220', '#281622', '#361c22', '#482420', '#5a2e1e', '#6a361c'], 5)
    for _ in range(8): p.set(random.randrange(64), random.randrange(10), '#9a90b0')
    # the Tower of Labor, far off: stepped tiers floodlit cream, wing towers, gilt pinnacles, the gold cog, the beacon
    lit, shade, gold = '#c8b498', '#7a6a5e', '#f2c14e'
    def tier(x0, x1, y0, y1):
        p.rect(x0, y0, x1 - x0, y1 - y0, shade); p.rect(x0, y0, max(1, (x1 - x0) * 2 // 3), y1 - y0, lit)
        for y in range(y0 + 1, y1, 2):
            for x in range(x0 + 1, x1 - 1, 2):
                if random.random() < 0.35: p.set(x, y, '#ffd890')
        p.set(x0, y0 - 1, gold); p.set(x1 - 1, y0 - 1, gold)
    for x0, x1 in ((8, 12), (32, 36)): tier(x0, x1, 27, 40)                     # outer wings
    for x0, x1 in ((12, 15), (29, 32)): tier(x0, x1, 22, 40)                    # inner wing towers
    tier(15, 29, 26, 40); tier(16, 28, 19, 26); tier(17, 27, 14, 19); tier(19, 25, 10, 14); tier(20, 24, 7, 10)
    p.rect(21, 5, 2, 2, '#ffe080'); p.rect(21, 1, 1, 4, gold)                  # the lantern and the spire
    for a in range(8):                                                          # the gold cog, self-lit
        t = a / 8 * math.tau; p.set(round(21.5 + 2.4 * math.cos(t)), round(3 + 2.4 * math.sin(t)), gold)
    p.set(21, 0, '#ff3020')
    p.rect(17, 30, 10, 2, '#b8231e')                                            # the red banners on the podium
    # six searchlights sweeping up from the podium and the wings
    for x0, dx in ((10, -0.55), (14, -0.25), (19, -0.08), (25, 0.12), (30, 0.3), (34, 0.6)):
        for y in range(26, -1, -1):
            x = round(x0 + (26 - y) * dx)
            if 0 <= x < 64 and (y % 2 == 0 or y > 18): p.set(x, y, '#c8a878' if y > 12 else '#8a7060')
    # the TV tower on the right: a needle, the pod, red lights
    p.rect(52, 6, 1, 34, '#8a8288'); p.rect(51, 14, 3, 3, '#b0a8b0'); p.rect(51, 15, 3, 1, '#ffcf86')
    for y in (5, 20, 30): p.set(52, y, '#ff3020')
    # the field of panel slabs: far ones small and even, near ones big, kitchens warm, TVs blue
    def slab(x0, x1, top, bot, step, ww, col):
        p.rect(x0, top, x1 - x0, bot - top, col); p.rect(x0, top, x1 - x0, 1, '#5a5458')
        for y in range(top + 2, bot, step):
            for x in range(x0 + 1, x1 - ww, ww + 1):
                q = random.random()
                c = '#ffcf86' if q < 0.22 else '#7ab0ff' if q < 0.32 else '#e8a050' if q < 0.38 else '#26222a'
                p.rect(x, y, ww, 1, c)
    slab(0, 22, 36, 52, 2, 1, '#3e3a40'); slab(38, 64, 34, 52, 2, 1, '#3a363c')
    slab(24, 40, 38, 52, 2, 1, '#423e44')
    slab(0, 18, 41, 52, 3, 2, '#48434a'); slab(44, 64, 40, 52, 3, 2, '#46424a')
    # sodium lamps along the road below
    for x in (5, 20, 35, 50, 61):
        p.set(x, 47, '#ffb050'); p.set(x - 1, 48, '#c86a28'); p.set(x + 1, 48, '#c86a28'); p.rect(x, 48, 1, 4, '#2a2228')
    # the lace half-curtain across the lower panes (Krasnovian net curtains): a scalloped hem, a sparse net below it
    for x in range(1, 63):
        top = 43 + (1 if (x % 6) in (0, 5) else 0)
        p.set(x, top, '#cfc2c6')
        for y in range(top + 1, 51):
            if (x + y) % 4 == 0 or (y - top) % 4 == 0 and x % 2 == 0: p.set(x, y, '#9a8c92')
            if (x % 6 == 3) and (y - top) % 3 == 1: p.set(x, y, '#cfc2c6')
    p.rect(0, 0, 64, 1, WOOD); p.rect(0, 51, 64, 1, WOOD); p.rect(0, 0, 1, 52, WOOD); p.rect(63, 0, 1, 52, WOOD)
    p.rect(31, 0, 2, 52, WOOD); p.rect(0, 20, 64, 2, WOOD); p.rect(0, 22, 64, 1, '#4a3428')
    p.save('window_kras')

# ---- Hinomoto: 0.95 m x 1.56 m (30 x 50), the back wall beside the bar. Black glass, neon edges, Aoki's red crown.
def window_hino():
    random.seed(5)
    p = Pix(30, 50)
    sky(p, 0, 0, 30, 50, ['#0e0816', '#140a1e', '#1c0c26', '#26102c', '#341232', '#481638', '#5a1a3c'], 7)
    red, pink, cyan, yel = '#ff2a3a', '#ff4fb0', '#33e0e8', '#ffd040'
    def tower(x0, w, top, edge):
        p.rect(x0, top, w, 50 - top, '#0c0a12'); p.rect(x0, top, 1, 50 - top, edge); p.rect(x0 + w - 1, top, 1, 50 - top, edge)
        p.rect(x0, top, w, 1, edge)
        for y in range(top + 3, 50, 3):
            for x in range(x0 + 2, x0 + w - 2, 2):
                if random.random() < 0.3: p.set(x, y, random.choice(['#6a5aa0', '#3a8ab0', '#a05a90']))
    tower(0, 6, 16, cyan); tower(22, 8, 13, pink); tower(6, 5, 24, yel)
    # Aoki Development: the black spike, red neon up every edge, ringed eaves, the three-tier pagoda crown
    x0, x1 = 12, 20
    p.rect(x0, 10, x1 - x0, 40, '#08060c'); p.rect(x0, 10, 1, 40, red); p.rect(x1 - 1, 10, 1, 40, red)
    for k in range(7):
        y = 15 + k * 5; p.rect(x0 - 1, y, x1 - x0 + 2, 1, red)
        for x in range(x0 + 2, x1 - 2, 2):
            if random.random() < 0.45: p.set(x, y + 2, '#ff9aa0')
    for w, y in ((12, 8), (9, 5), (6, 2)):
        cx = 16; p.rect(cx - w // 2, y, w, 1, red); p.rect(cx - w // 2 + 1, y + 1, w - 2, 2, '#3a0810')
        p.set(cx - w // 2, y - 1, red); p.set(cx + w // 2 - 1, y - 1, red)
    p.rect(16, 0, 1, 2, '#ffd0d0')
    for bx, by, c in ((3, 26, pink), (24, 22, yel)):   # blade signs
        p.rect(bx, by, 3, 14, '#140a14'); frame(p, bx, by, 3, 14, c)
        for y in range(by + 2, by + 13, 3): p.set(bx + 1, y, '#fff0f8'); p.set(bx + 1, y + 1, c)
    p.rect(23, 15, 6, 4, cyan); p.rect(24, 16, 4, 2, '#e0ffff')
    for x in range(30):   # the Shuto expressway sweeping across, tail lights and headlights
        y = 40 + round(2 * math.sin(x / 7))
        p.set(x, y, '#3a3040'); p.set(x, y + 1, '#2a2230')
        if x % 3 == 0: p.set(x, y, '#ff3020')
        if x % 4 == 1: p.set(x, y + 1, '#fff0c0')
    for y in range(43, 50):
        for x in range(30):
            if random.random() < 0.2: p.set(x, y, random.choice([pink, cyan, '#a03a70', '#3a6a90']))
    p.rect(0, 0, 30, 1, WOOD); p.rect(0, 49, 30, 1, WOOD); p.rect(0, 0, 1, 50, WOOD); p.rect(29, 0, 1, 50, WOOD)
    p.rect(0, 20, 30, 2, WOOD); p.rect(0, 22, 30, 1, '#4a3428')
    p.save('window_hino')

# ---- the two front windows (3 m x 2.15 m each, 96 x 68), the facade's two big windows seen from inside: Tripoint Square at
# night. Pane A (u 0..0.5) is the +x window (on your left facing the door): the Brass Clock's side. Pane B is the -x one: the
# sealed station's, St. Vost's domes over the roofs. A brass Accords line runs off from the door through each.
def window_sq():
    random.seed(3)
    W, Hh = 96, 68
    p = Pix(2 * W, Hh)
    gold = '#e8c868'
    for pane in (0, 1):
        X = pane * W
        sky(p, X, 0, W, Hh, ['#140c1c', '#1a1022', '#221428', '#2a182c', '#331c30'], 5)
        for _ in range(9): p.set(X + random.randrange(W), random.randrange(14), '#a8a0c0')
        if pane == 1:   # St. Vost Cathedral's onion domes over the roofs
            for cx, r, top in ((30, 5, 6), (41, 4, 11), (20, 4, 11)):
                for y in range(-r, r + 1):
                    w = round(math.sqrt(max(0, r * r - y * y)) * (1.1 if y > -r // 2 else 0.8))
                    p.rect(X + cx - w, top + r + y, 2 * w + 1, 1, '#3a7a6a' if y < 1 else '#2e5e52')
                p.rect(X + cx, top - 3, 1, 3, '#c9a04a'); p.rect(X + cx - 1, top - 2, 3, 1, '#c9a04a')
                p.rect(X + cx - 2, top + 2 * r + 1, 5, 9, '#5a5048')
        # the tenements across the square: ochre plaster, lit gas windows, slate and green-copper roofs
        x = 0
        while x < W:
            w = random.choice((14, 16, 18, 20)); top = random.choice((20, 22, 23, 25))
            wall = random.choice(['#7a6050', '#8a7058', '#6a5a4c', '#7c6a5c'])
            p.rect(X + x, top, w, 50 - top, wall)
            roof = random.choice(['#2a3436', '#34484a', '#3a6a5a'])
            for k in range(4): p.rect(X + x + k, top - 4 + k, w - 2 * k, 1, roof)
            for wy in range(top + 3, 46, 5):
                for wx in range(x + 2, x + w - 2, 4):
                    q = random.random(); p.rect(X + wx, wy, 2, 3, '#ffcf86' if q < 0.4 else '#e8a050' if q < 0.5 else '#2a2026')
            p.rect(X + x, 46, w, 4, '#3a2a24')                                    # shopfronts, shut
            if random.random() < 0.5: p.rect(X + x + 3, 47, w - 6, 2, '#c8a060')
            x += w
        # the square: setts under pale gaslight pools, gaslamps
        for y in range(50, Hh):
            for xx in range(W): p.set(X + xx, y, '#3a3036' if (xx // 3 + y) % 2 else '#342a30')
        for lx in (12, 48, 84):
            for y in range(52, Hh):
                for xx in range(-9, 10):
                    if abs(xx) + abs(y - 60) * 1.4 < 10 and (xx + y) % 2 == 0: p.set(X + lx + xx, y, '#6a7062')
            p.rect(X + lx, 34, 1, 22, '#22262a'); p.rect(X + lx - 1, 31, 3, 3, '#e8f2d0', EM); p.set(X + lx, 30, '#22262a')
            p.rect(X + lx - 1, 55, 3, 1, '#22262a')
        if pane == 0:   # the Brass Clock (1888): a stone base, an iron column, a lit four-faced clock, a tile cap
            cx = X + 62
            p.rect(cx - 3, 52, 7, 4, '#6a6058'); p.rect(cx - 1, 30, 3, 22, '#2a2a2e'); p.rect(cx - 2, 42, 5, 1, '#c9a04a'); p.rect(cx - 2, 34, 5, 1, '#c9a04a')
            p.rect(cx - 4, 22, 9, 8, '#c9a04a')
            for yy in range(23, 29):
                for xx in range(-3, 4):
                    if xx * xx + (yy - 25.5) ** 2 <= 8: p.set(cx + xx, yy, '#f4ead0', EM)
            p.set(cx, 24, '#1a1008', EM); p.set(cx, 25, '#1a1008', EM); p.set(cx + 1, 25, '#1a1008', EM)
            for k in range(4): p.rect(cx - 5 + k, 21 - k, 11 - 2 * k, 1, '#2a2226')
            for xx in range(W):    # the brass line from the door (this pane's right edge) off to the east road
                yy = Hh - 1 - (W - 1 - xx) // 6
                if yy >= 51: p.set(X + xx, yy, gold); p.set(X + xx, yy - 1, '#8a6a2a')
        else:           # the sealed Tripoint Station: a blue iron arch sign, a red M, welded plate
            sx = X + 32
            p.rect(sx, 40, 30, 5, '#1e3a6a'); p.rect(sx, 40, 30, 1, '#c9a04a'); p.rect(sx + 24, 41, 4, 3, '#e8352b')
            p.rect(sx + 2, 45, 26, 7, '#3e4448'); p.rect(sx + 8, 46, 14, 3, '#e8dcc0'); p.rect(sx + 10, 47, 10, 1, '#b8231e')
            for xx in range(W):    # ...and off to the west road from this pane's left edge
                yy = Hh - 1 - xx // 6
                if yy >= 51: p.set(X + xx, yy, gold); p.set(X + xx, yy - 1, '#8a6a2a')
        # the cafe curtain on its brass rod, lit pink by the bar
        p.rect(X, 60, W, 1, '#c9a04a')
        for y in range(61, Hh):
            for xx in range(W):
                k = xx % 6
                if y == 61 and k == 0: continue
                p.set(X + xx, y, '#8a3a52' if k in (1, 2) else '#6a2a40' if k in (3, 4) else '#521e32')
        # glazing bars: three lights and a transom, like the facade
        for bx in (31, 63): p.rect(X + bx, 0, 2, 61, WOOD)
        p.rect(X, 16, W, 2, WOOD); p.rect(X, 18, W, 1, '#4a3428')
        p.rect(X, 0, W, 1, WOOD); p.rect(X, Hh - 1, W, 1, WOOD); p.rect(X, 0, 1, Hh, WOOD); p.rect(X + W - 1, 0, 1, Hh, WOOD)
    p.save('window_sq')

# ---- the back bar's smoked mirror (5.5 m x 1.26 m, 128 x 40): dark glass, sheen, worn silvering, reflected lights
def mirror():
    random.seed(9)
    p = Pix(128, 40)
    for y in range(40):
        for x in range(128):
            c = '#1a1420' if y > 20 else '#1e1624'
            if (x + 2 * y) % 41 < 3 or (x + 2 * y) % 67 < 2: c = '#2c2234'   # diagonal sheen
            p.set(x, y, c)
    for _ in range(60):   # worn silvering, mostly at the edges
        x = random.choice([random.randrange(10), random.randrange(118, 128), random.randrange(128)])
        y = random.choice([random.randrange(4), random.randrange(36, 40), random.randrange(40)])
        p.set(x, y, '#0e0a10')
    # the room behind you: the lanterns' red, the door's round sign, the pool lamp's line, pink neon off the windows
    for lx in (14, 42, 86, 114):
        for y in range(3, 10):
            for x in range(lx - 3, lx + 4):
                if (x - lx) ** 2 + (y - 6) ** 2 <= 9 and (x + y) % 2 == 0: p.set(x, y, '#7a1a22')
        p.rect(lx - 1, 5, 3, 3, '#c0302c', EM)
    for y in range(10, 17):
        for x in range(60, 68):
            if (x - 63.5) ** 2 + (y - 13) ** 2 <= 10: p.set(x, y, '#5a4020' if (x + y) % 2 else '#7a5a28')
    p.rect(62, 12, 3, 2, '#ffd8a0', EM)
    for x in range(88, 110): p.set(x, 15, '#6a5a3a')
    for x0 in (6, 104):
        for y in range(14, 30):
            for x in range(x0, x0 + 18):
                if (x + y) % 3 == 0 and random.random() < 0.5: p.set(x, y, '#4a1a3a')
    p.save('mirror')

# ---- two rows of bottles (96 x 30: rows of 15), on clear ground so the mirror shows between them; the bottoms glow
def shelf():
    random.seed(21)
    p = Pix(192, 32)
    glass = [('#a0581a', '#d88a3a'), ('#2a6a3a', '#5aa86a'), ('#c8d8d0', '#ffffff'), ('#2a4a9a', '#6a8ae0'), ('#9a2030', '#e05060'),
             ('#5a3014', '#9a6030'), ('#c8a040', '#ffe080'), ('#3a1a2a', '#7a3a5a')]
    labels = ['#f4f1ea', '#e8c868', '#c8302a', '#141016', '#33e0d0']
    for row in (0, 1):
        x = 1; y1 = row * 16 + 15
        while x < 190:
            kind = random.choice(['tall', 'tall', 'squat', 'square', 'round', 'home', 'home'])
            g, hi = random.choice(glass); k = -1
            if kind == 'home':   # the three home brands: Krasnograd vodka, Columbia Cola, Okyo beer
                k = random.randrange(3)
                g, hi = [('#c8d8d0', '#ffffff'), ('#3a2418', '#8ab89a'), ('#6a3a18', '#c3b0a2')][k]
                lab = ['#f4f1ea', '#c8302a', '#141016'][k]
            else: lab = random.choice(labels)
            if kind in ('tall', 'home'): w, h, neck = 3, random.choice((11, 12, 13)), 4
            elif kind == 'squat': w, h, neck = 4, 8, 2
            elif kind == 'square': w, h, neck = 4, 10, 2
            else: w, h, neck = 4, 7, 3
            if x + w > 191: break
            top = y1 - h + 1
            p.rect(x, top + neck, w, h - neck, g)
            p.rect(x + w // 2 - (0 if w == 3 else 1), top, 1 if w == 3 else 2, neck, g)
            p.rect(x, top + neck + 2, w, 2, lab)
            if k == 0: p.rect(x, top + neck + 2, w, 1, '#b8231e')
            if k == 1: p.set(x + 1, top, '#e8c868')
            p.set(x, top + neck + 1, hi); p.set(x, top + neck + 4, hi)
            p.rect(x, y1 - 1, w, 2, hi, EM)          # the shelf light coming up through the glass
            p.set(x + w - 1, y1 - 2, hi, EM)
            x += w + random.choice((1, 1, 2))
    p.save('shelf')

# ---- the emblem over the mirror (40 x 40, lit): the brass ring with its bulbs, three thirds (red, pink, orange), the fist
def emblem():
    p = Pix(40, 40)
    c = 19.5
    for y in range(40):
        for x in range(40):
            dx, dy = x - c, y - c; d = math.hypot(dx, dy); a = math.degrees(math.atan2(dy, dx))
            if d > 19.6: continue
            if d > 16.5: p.set(x, y, '#c9a04a'); continue
            if d > 15.5: p.set(x, y, '#8a6a2a'); continue
            # thirds split like a Y: red at the top, pink at the left, orange at the right
            if -150 <= a < -30: col = '#e8352b'
            elif -30 <= a < 90: col = '#ff9a3c'
            else: col = '#ff4f9a'
            for edge in (-150, -30, 90):
                if abs(((a - edge + 180) % 360) - 180) * math.pi / 180 * d < 0.8: col = '#c9a04a'
            p.set(x, y, col)
    for k in range(16):   # bulbs round the ring
        t = k / 16 * math.tau; p.set(round(c + 18 * math.cos(t)), round(c + 18 * math.sin(t)), '#fff2c0')
    # the taped fist: four knuckles, the thumb across, a white tape band, the cuff
    ink, skin, tape = '#2a1a1a', '#f4f1ea', '#d8d0c0'
    p.rect(12, 10, 16, 15, ink); p.rect(13, 11, 14, 13, skin)
    for k in range(4): p.rect(13 + k * 3 + k // 2, 11, 1, 6, '#c8c0b4')
    p.rect(13, 17, 14, 1, ink); p.rect(14, 18, 12, 4, tape); p.rect(14, 18, 12, 1, '#fffaf0')
    p.rect(13, 22, 14, 1, ink); p.rect(16, 25, 8, 4, '#c08060'); p.rect(15, 25, 1, 4, ink); p.rect(24, 25, 1, 4, ink)
    p.rect(15, 29, 10, 3, '#2a4a8a'); p.rect(15, 29, 10, 1, '#e8c868'); p.rect(14, 29, 1, 3, ink); p.rect(25, 29, 1, 3, ink)
    p.set(24, 12, '#e8352b')
    p.save('emblem')

# ---- the Accords, framed by the door (48 x 72 parchment)
def accords():
    p = Pix(48, 72)
    p.rect(0, 0, 48, 72, '#e6dac0')
    for y in range(72):
        for x in range(48):
            if min(x, y, 47 - x, 71 - y) < 2 and (x * 7 + y * 3) % 5 < 2: p.set(x, y, '#c8b48a')
    ink, red = '#2a1a14', '#8a1a14'
    p.ctext('VOSTBURG', 3, red); p.ctext('ACCORDS', 11, red); p.ctext('1962', 19, ink)
    p.rect(8, 28, 32, 1, '#a08a60')
    p.ctext('ART. 1', 31, ink); p.ctext('NO', 40, ink); p.ctext('FIREARMS', 48, ink)
    p.rect(8, 57, 32, 1, '#a08a60')
    for cx, kind in ((10, 'kras'), (24, 'colu'), (38, 'hino')):
        if kind == 'kras':   # red wax with the gold cog
            for y in range(-4, 5):
                for x in range(-4, 5):
                    if x * x + y * y <= 17: p.set(cx + x, 64 + y, '#b8231e')
            for a in range(8):
                t = a / 8 * math.tau; p.set(round(cx + 2.4 * math.cos(t)), round(64 + 2.4 * math.sin(t)), '#f2c14e')
        elif kind == 'colu':  # navy with a gold sunburst
            for y in range(-4, 5):
                for x in range(-4, 5):
                    if x * x + y * y <= 17: p.set(cx + x, 64 + y, '#1a2a5a')
            for a in range(8):
                t = a / 8 * math.tau
                for r in (1, 2, 3): p.set(round(cx + r * math.cos(t)), round(64 + r * math.sin(t)), '#f2c14e')
        else:                 # a square red hanko
            p.rect(cx - 4, 60, 9, 9, '#c8202c'); p.rect(cx - 3, 61, 7, 7, '#e6dac0'); p.rect(cx - 2, 62, 5, 5, '#c8202c')
            p.rect(cx - 1, 63, 1, 3, '#e6dac0'); p.rect(cx + 1, 63, 1, 3, '#e6dac0')
    for x in range(4, 44):   # the three signatures
        if x % 14 in (2, 12): continue
        p.set(x, 58 + (1 if (x // 2) % 2 else 0), ink)
    p.save('accords')

# ---- polaroids of regulars from all three sides (48 x 52, clear ground)
def photos():
    p = Pix(48, 52)
    skin, ink = '#d8a888', '#1a1214'
    def polaroid(x0, y0, draw, cap):
        p.rect(x0, y0, 14, 17, '#efe8dc'); p.rect(x0 + 1, y0 + 1, 12, 11, '#3a2a2a'); draw(x0 + 1, y0 + 1)
        p.rect(x0 + 3, y0 + 14, 8, 1, cap); p.set(x0 + 7, y0, '#c8302a')   # the caption scrawl and the pin
    def face(x, y, hat=None):
        p.rect(x + 4, y + 4, 4, 5, skin); p.set(x + 5, y + 6, ink); p.set(x + 7, y + 6, ink)
        p.rect(x + 3, y + 9, 6, 2, '#5a4a6a')
    def kras(x, y):   # an ushanka, a moustache, a raised glass
        p.rect(x, y, 12, 11, '#4a2a2a'); face(x, y); p.rect(x + 3, y + 1, 6, 3, '#6a4a30'); p.rect(x + 2, y + 3, 1, 4, '#6a4a30'); p.rect(x + 9, y + 3, 1, 4, '#6a4a30')
        p.rect(x + 5, y + 7, 3, 1, '#3a2010'); p.rect(x + 10, y + 5, 1, 3, '#e8f0f0')
    def colu(x, y):   # a fedora with a band, a grin, a cigar
        p.rect(x, y, 12, 11, '#2a3a5a'); face(x, y); p.rect(x + 2, y + 3, 8, 1, '#3a2a20'); p.rect(x + 3, y + 1, 6, 2, '#3a2a20'); p.rect(x + 3, y + 2, 6, 1, '#c8302a')
        p.rect(x + 5, y + 8, 2, 1, '#f4f1ea'); p.rect(x + 7, y + 8, 3, 1, '#8a5a30'); p.set(x + 10, y + 8, '#ff8030')
    def hino(x, y):   # a towering pompadour, shades, a popped collar
        p.rect(x, y, 12, 11, '#3a1a3a'); face(x, y); p.rect(x + 3, y, 6, 4, ink); p.rect(x + 7, y + 1, 3, 2, ink); p.rect(x + 4, y + 6, 4, 1, ink)
        p.rect(x + 2, y + 9, 2, 2, '#ff4fb0'); p.rect(x + 8, y + 9, 2, 2, '#ff4fb0')
    def three(x, y):  # all three, arm in arm
        p.rect(x, y, 12, 11, '#4a2a3a')
        for k, hat in enumerate(('#6a4a30', '#3a2a20', ink)):
            hx = x + 1 + k * 4; p.rect(hx, y + 4, 3, 3, skin); p.rect(hx, y + 2, 3, 2, hat); p.rect(hx - 1, y + 7, 5, 4, ['#7a2a2a', '#2a3a6a', '#3a3a3a'][k])
    def front(x, y):  # the Threeway at night, pink neon
        p.rect(x, y, 12, 11, '#140c18'); p.rect(x, y + 6, 12, 5, '#2a1410'); p.rect(x + 1, y + 3, 10, 2, '#ff4f9a'); p.rect(x + 5, y + 7, 2, 4, '#0a0606')
        p.rect(x + 1, y + 7, 3, 2, '#ff9ab8'); p.rect(x + 8, y + 7, 3, 2, '#e8a040')
    def zep(x, y):    # a postcard: the Halcyon over Liberty Avenue's crowns
        p.rect(x, y, 12, 11, '#1a2a5a'); p.rect(x + 2, y + 2, 8, 3, '#efe4c8'); p.rect(x + 1, y + 3, 1, 1, '#efe4c8'); p.rect(x + 4, y + 5, 3, 1, '#ffc870')
        for k in range(4): p.rect(x + k * 3, y + 7 + (k % 2), 2, 4 - (k % 2), '#b8943c')
    polaroid(1, 1, kras, '#3a2a6a'); polaroid(17, 3, colu, '#3a2a6a'); polaroid(33, 0, hino, '#3a2a6a')
    polaroid(2, 20, three, '#3a2a6a'); polaroid(18, 22, front, '#c8302a'); polaroid(33, 19, zep, '#3a2a6a')
    polaroid(10, 36, lambda x, y: (p.rect(x, y, 12, 11, '#2a1a2a'), p.rect(x + 2, y + 2, 8, 7, '#c9a04a'), p.rect(x + 3, y + 3, 6, 5, '#e8352b'), p.rect(x + 5, y + 4, 2, 3, '#f4f1ea')), '#3a2a6a')
    polaroid(26, 35, lambda x, y: (p.rect(x, y, 12, 11, '#203a2a'), p.rect(x, y + 6, 12, 5, '#2a6a3a'), p.rect(x + 3, y + 3, 6, 2, '#f4f1ea'), p.set(x + 8, y + 7, '#f4f1ea'), p.set(x + 4, y + 8, '#c8302a')), '#3a2a6a')
    p.save('photos')

# ---- FLY HALCYON (44 x 56): art deco, a gold sunburst, the zeppelin over the crowns
def poster_halcyon():
    p = Pix(44, 56)
    p.rect(0, 0, 44, 56, '#1a2a5a')
    for y in range(8, 44):
        for x in range(44):
            a = math.atan2(40 - y, x - 21.5)
            if y < 40 and int(a / math.pi * 16) % 2 == 0: p.set(x, y, '#24366a')
    p.ctext('FLY', 2, '#f2c14e')
    for x in range(8, 36):   # the hull
        w = round(3.2 * math.sqrt(max(0, 1 - ((x - 22) / 14) ** 2)))
        p.rect(x, 22 - w, 1, 2 * w + 1, '#efe4c8')
        if x % 4 == 0: p.rect(x, 22 - w, 1, 2 * w + 1, '#d8a840')
    p.rect(14, 21, 14, 2, '#fff0b0'); p.rect(19, 26, 5, 2, '#ffc870'); p.rect(34, 18, 2, 9, '#1a2a5a'); p.set(9, 22, '#ff3020')
    for x0, w, top in ((2, 6, 34), (9, 7, 30), (17, 9, 27), (27, 7, 31), (35, 7, 33)):
        p.rect(x0, top, w, 44 - top, '#b8943c'); p.rect(x0, top, w, 1, '#e8c868')
        for y in range(top + 2, 44, 2):
            for x in range(x0 + 1, x0 + w - 1, 2): p.set(x, y, '#ffd890')
    p.rect(0, 44, 44, 12, '#efe4c8'); p.ctext('HALCYON', 45, '#1a2a5a'); p.rect(0, 53, 44, 3, '#c8202c')
    frame(p, 0, 0, 44, 56, '#c9a04a')
    p.save('poster_halcyon')

# ---- a pachinko machine's face (20 x 40, lit)
def pachinko():
    p = Pix(20, 40)
    p.rect(0, 0, 20, 40, '#8a9098'); p.rect(1, 1, 18, 38, '#b8c0c8')
    p.rect(2, 2, 16, 5, '#e8352b'); p.rect(3, 3, 14, 3, '#ffd040')
    for x in (5, 9, 13): p.rect(x, 3, 2, 3, '#e8352b')
    for y in range(8, 26):
        for x in range(2, 18):
            d = math.hypot(x - 9.5, y - 16.5)
            if d < 8.6: p.set(x, y, '#1a5a7a' if d > 3 else '#ff4fb0')
            if d < 8.6 and d > 3 and (x + y) % 3 == 0: p.set(x, y, '#e0f0ff')
    p.rect(8, 15, 4, 3, '#140a14')
    for x in (8, 10): p.set(x, 16, '#ff3020')
    p.rect(2, 27, 16, 2, '#33e0d0'); p.rect(2, 30, 16, 6, '#5a6068'); p.rect(3, 31, 14, 3, '#3a3e44')
    for x in range(4, 16, 2): p.set(x, 32, '#f0f4f8')
    p.rect(16, 34, 3, 3, '#e8c868')
    p.save('pachinko')

# ---- Sasha's back counter (48 x 16): the till (16x16), the radio (16x10), the lucky cat's face (8x8), the samovar (8x16)
def backbits():
    p = Pix(48, 16)
    # the brass till: an amber read-out, rows of keys, THE on its crest
    p.rect(0, 0, 16, 16, '#9a7a30'); p.rect(1, 1, 14, 4, '#c9a04a'); p.rect(4, 2, 8, 2, '#3a2a10'); p.rect(5, 2, 6, 1, '#ffb040', EM)
    for y in (7, 10):
        for x in range(2, 14, 2): p.set(x, y, '#f4f1ea'); p.set(x, y + 1, '#8a6a2a')
    p.rect(1, 13, 14, 2, '#6a5020'); p.rect(6, 13, 4, 1, '#c9a04a')
    # the radio: walnut case, cloth grille, the lit dial with three marks (Krasnograd red, Halcyon gold, Okyo cyan)
    X = 16
    p.rect(X, 0, 16, 10, '#4a2a18'); p.rect(X + 1, 1, 6, 8, '#8a6a4a')
    for y in range(2, 8, 2): p.rect(X + 2, y, 4, 1, '#5a3a28')
    p.rect(X + 8, 2, 7, 3, '#ffc870', EM); p.set(X + 9, 3, '#e8352b', EM); p.set(X + 11, 3, '#c9a04a', EM); p.set(X + 13, 3, '#33a0b0', EM)
    p.rect(X + 11, 2, 1, 3, '#2a1a10'); p.rect(X + 9, 6, 2, 2, '#c9a04a'); p.rect(X + 12, 6, 2, 2, '#c9a04a')
    # the lucky cat: white, a red collar with a gold bell
    X = 32
    p.rect(X, 0, 8, 8, '#f4f1ea'); p.set(X, 0, '#e8352b'); p.set(X + 7, 0, '#e8352b'); p.set(X + 2, 3, '#1a1214'); p.set(X + 5, 3, '#1a1214')
    p.set(X + 3, 4, '#e88a9a'); p.set(X + 4, 4, '#e88a9a'); p.rect(X, 6, 8, 1, '#e8352b'); p.set(X + 4, 7, '#f2c14e')
    p.rect(X, 8, 8, 8, '#f4f1ea'); p.rect(X + 2, 11, 4, 3, '#f2c14e'); p.set(X + 3, 12, '#9a7a30')
    # the samovar: brass, a darker band, the tap
    X = 40
    p.rect(X, 0, 8, 16, '#c9a04a'); p.rect(X + 1, 0, 2, 16, '#e8c868'); p.rect(X, 5, 8, 1, '#8a6a2a'); p.rect(X, 11, 8, 1, '#8a6a2a')
    p.rect(X + 3, 8, 3, 1, '#5a4018')
    p.save('backbits')

# ---- the brass disc where the three Accords lines meet (32 x 32, clear corners). Laid on the floor with the top toward the
# door: Columbia's third on the left (+x), Krasnovia's on the right (-x), Hinomoto's toward the bar.
def medallion():
    # Laid flat with the image's top toward the bar (-z), its right toward +x: read upright facing the bar. The Y's stem runs
    # to the door (the image's bottom), its arms along the floor lines (to the side walls, bar.js BAR_LINES): Hinomoto's third at the top (the bar), Columbia's on
    # the right (+x), Krasnovia's on the left (-x), the same thirds the lines cut the room (and the city) into.
    p = Pix(32, 32)
    c = 15.5
    for y in range(32):
        for x in range(32):
            dx, dy = x - c, y - c; d = math.hypot(dx, dy); a = math.degrees(math.atan2(dy, dx))
            if d > 15.6: continue
            if d > 13: p.set(x, y, '#c9a04a' if (x * 3 + y) % 7 else '#f0d070'); continue
            if d > 12: p.set(x, y, '#6a4a1a'); continue
            if d < 2.2: p.set(x, y, '#f0d070'); continue
            if -156.25 <= a < -23.75: col = '#e6e0d8'                                     # Hinomoto (top): white
            elif -23.75 <= a < 90: col = '#1a2a5a' if (x + y) % 4 else '#24366a'       # Columbia (right): navy
            else: col = '#a81e1a' if (x + y) % 4 else '#b8231e'                     # Krasnovia (left): red
            for edge in (-156.25, -23.75, 90):
                if abs(((a - edge + 180) % 360) - 180) * math.pi / 180 * d < 0.9: col = '#c9a04a'
            p.set(x, y, col)
    p.rect(14, 6, 4, 4, '#e8352b'); p.rect(15, 5, 2, 6, '#e8352b'); p.rect(13, 7, 6, 2, '#e8352b')   # the red sun
    for a in range(8):                                                                               # the sunburst
        t = a / 8 * math.tau
        for r in (1, 2, 3): p.set(round(22 + r * math.cos(t)), round(18 + r * math.sin(t)), '#f2c14e')
    for a in range(10):                                                                              # the cog
        t = a / 10 * math.tau; p.set(round(9 + 2.6 * math.cos(t)), round(18 + 2.6 * math.sin(t)), '#f2c14e')
    p.set(9, 18, '#f2c14e')
    p.save('medallion')

def small():
    p = Pix(16, 16); p.rect(0, 0, 16, 16, '#e8dcc0')   # formica: cream with aqua and red boomerangs
    for (x, y, c) in ((2, 3, '#5ab0a8'), (9, 2, '#d0503a'), (12, 9, '#5ab0a8'), (4, 11, '#d0503a'), (7, 7, '#a89880'), (14, 14, '#a89880')):
        p.set(x, y, c); p.set(x + 1, y + 1, c); p.set(x + 2, y + 1, c)
    p.save('formica')
    p = Pix(16, 16); p.rect(0, 0, 16, 16, '#a81c28')    # vinyl: red, tufted, a sheen
    for y in range(16):
        for x in range(16):
            if (x % 8 == 4 and y % 8 == 4) or (x % 8 == 0 and y % 8 == 0): p.set(x, y, '#5a0e16')
            elif (x + y) % 8 == 0: p.set(x, y, '#c83040')
    p.rect(0, 0, 16, 1, '#d84a58'); p.save('vinyl')
    p = Pix(16, 16)                                     # the chessboard, mid-game
    for y in range(16):
        for x in range(16): p.set(x, y, '#e6dac0' if ((x // 2) + (y // 2)) % 2 == 0 else '#3a2418')
    for (x, y, c) in ((2, 2, '#f4f1ea'), (6, 4, '#f4f1ea'), (10, 2, '#f4f1ea'), (4, 10, '#141016'), (8, 12, '#141016'), (12, 8, '#141016'), (14, 12, '#141016')):
        p.rect(x, y, 2, 2, c); p.set(x, y, '#c9a04a')
    frame(p, 0, 0, 16, 16, '#5a3a20'); p.save('chess')
    p = Pix(4, 4); p.rect(0, 0, 4, 4, '#ffd898', EM); p.save('glow')   # self-lit (alpha 204): bulbs and light strips
    p = Pix(8, 8); p.rect(0, 0, 8, 8, '#4a2a1a'); p.rect(0, 0, 8, 1, '#c9a04a'); p.rect(0, 3, 8, 1, '#3a2014'); p.save('fan')   # a ceiling fan's cane blade

if __name__ == '__main__':
    window_kras(); window_hino(); window_sq(); mirror(); shelf(); emblem(); accords(); photos(); poster_halcyon(); pachinko()
    backbits(); medallion(); small()
    print('painted the room: windows (kras, hino, square), mirror, shelf, emblem, accords, photos, poster, pachinko, backbits, medallion, booth bits')
