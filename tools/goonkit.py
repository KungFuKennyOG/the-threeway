"""Shared painting kit for the goon sheets (64x128, the layout in src/characters.js), used by tools/goons_palace.py,
tools/goons_tower.py and tools/goons_officials.py. Everything is painted from code and char maps with PIL, like
tools/krasnovian_goons.py, and every sheet is checked to stay at 16 colours or fewer.

Sheet layout (pixels):
  (0,0) face, (32,0) hurt face, (0,32) KO face            each 32x32
  TA (32,32) torso front   TB (48,32)   TC (32,48)   TD (48,48)      16x16 panels
  TA_B (0,64) torso back   TA_S (16,64) torso side
  HEADS (32,64) the head's sides / back / top              16x16
  X1 (48,64)  X2 (0,80)  X3 (16,80)  X4 (32,80)  X5 (48,80)  X6 (0,96) X7 (16,96) X8 (32,96) X9 (48,96)   extra 16x16 panels
"""
from PIL import Image

def H(h): return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255)

PANEL = {'TA': (32, 32), 'TB': (48, 32), 'TC': (32, 48), 'TD': (48, 48), 'TA_B': (0, 64), 'TA_S': (16, 64), 'HEADS': (32, 64),
         'X1': (48, 64), 'X2': (0, 80), 'X3': (16, 80), 'X4': (32, 80), 'X5': (48, 80), 'X6': (0, 96), 'X7': (16, 96), 'X8': (32, 96), 'X9': (48, 96),
         'X10': (0, 112), 'X11': (16, 112), 'X12': (32, 112), 'X13': (48, 112)}

class Sheet:
    def __init__(s, w=64, h=128): s.im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    def px(s, x, y, c):
        if 0 <= x < s.im.width and 0 <= y < s.im.height: s.im.putpixel((x, y), H(c) if isinstance(c, str) else c)
    def rect(s, x, y, w, h, c):
        for j in range(h):
            for i in range(w): s.px(x + i, y + j, c)
    def at(s, name): return Pane(s, *PANEL[name])
    def map(s, x0, y0, rows, pal):
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch != ' ' and pal.get(ch): s.px(x0 + x, y0 + y, pal[ch])
    def get(s, x, y): return s.im.getpixel((x, y))
    def save(s, path, maxc=16):   # goon sheets allow 32 colours (the hand-pixeled originals use 17 to 29); props and signs keep 16
        cols = {c for c in s.im.getdata() if c[3]} if hasattr(s.im, 'getdata') else set()
        assert len(cols) <= maxc, (path, len(cols), sorted('#%02x%02x%02x' % c[:3] for c in cols))
        s.im.save(path)
        return len(cols)

def swatch(S, i, c):   # SW(i) in characters.js: 4x4 solid colours in the X13 corner (visors, cap tops, boards...)
    S.rect(48 + (i % 4) * 4, 112 + (i // 4) * 4, 4, 4, c)

def panel(S, name, rows, pal):   # a 16x16 char map onto a named panel
    assert len(rows) == 16 and all(len(r) == 16 for r in rows), (name, [len(r) for r in rows])
    x0, y0 = PANEL[name]; S.map(x0, y0, rows, pal)

def strip(S, name, rows, pal, w=16):   # rows of a panel narrower than 16 (TD_L / TD_R halves: w=8)
    x0, y0 = PANEL.get(name, (None, None)) if name in PANEL else name
    S.map(x0, y0, rows, pal)

def hsh(x, y, k=0): return ((x * 374761393 + y * 668265263 + k * 2246822519) ^ ((x + 7) * (y + 13) * 1274126177)) % 1000003 % 1000

class Pane:
    """a 16x16 panel (or any offset) on a sheet: rect / px / map in panel coordinates"""
    def __init__(s, sheet, ox, oy): s.s, s.ox, s.oy = sheet, ox, oy
    def px(s, x, y, c): s.s.px(s.ox + x, s.oy + y, c)
    def rect(s, x, y, w, h, c): s.s.rect(s.ox + x, s.oy + y, w, h, c)
    def fill(s, c, w=16, h=16): s.rect(0, 0, w, h, c)
    def map(s, rows, pal, x=0, y=0): s.s.map(s.ox + x, s.oy + y, rows, pal)
    # ---- the flair kit: lines, outlines, discs, dither and grain, for folds, seams, wear and motifs
    def get(s, x, y): return s.s.get(s.ox + x, s.oy + y)
    def hl(s, x, y, w, c): s.rect(x, y, w, 1, c)
    def vl(s, x, y, h, c): s.rect(x, y, 1, h, c)
    def outline(s, x, y, w, h, c): s.hl(x, y, w, c); s.hl(x, y + h - 1, w, c); s.vl(x, y, h, c); s.vl(x + w - 1, y, h, c)
    def checker(s, x, y, w, h, c, ph=0):
        for j in range(h):
            for i in range(w):
                if (i + j + ph) % 2 == 0: s.px(x + i, y + j, c)
    def disc(s, cx, cy, r, c):   # a filled circle about (cx, cy) in pixel units (7.5 centres it on a 16-px panel)
        for j in range(int(cy - r - 1), int(cy + r + 2)):
            for i in range(int(cx - r - 1), int(cx + r + 2)):
                if (i - cx) ** 2 + (j - cy) ** 2 <= r * r: s.px(i, j, c)
    def grain(s, frm, to, p, k=0, x=0, y=0, w=16, h=16):   # flecks: a share p of the frm-coloured pixels turn to `to` (deterministic)
        f = H(frm)
        for j in range(y, y + h):
            for i in range(x, x + w):
                if s.get(i, j) == f and hsh(s.ox + i, s.oy + j, k) < p * 1000: s.px(i, j, to)
    def stitch(s, x, y, n, c, horiz=True, gap=2):
        for t in range(0, n, gap):
            if horiz: s.px(x + t, y, c)
            else: s.px(x, y + t, c)
    def swap(s, frm, to, x=0, y=0, w=16, h=16):
        f = H(frm)
        for j in range(y, y + h):
            for i in range(x, x + w):
                if s.get(i, j) == f: s.px(i, j, to)

# ---------------------------------------------------------------- faces
# A face is 32x32: crown rows 0..top-1 (hair or a cap band), side bands at columns 0-2 / 29-31 (hair, ears, cap),
# brows ~row 10, eyes rows 14-16, nose rows 18-22, mouth row 25, the jaw's shadow rows 30-31.
# Three variants are painted side by side: normal (0,0), hurt (32,0), KO (0,32).
def face(S, F):
    for v, (ox, oy) in enumerate(((0, 0), (32, 0), (0, 32))):
        P = Pane(S, ox, oy)
        sk, sh, dk = F['skin'], F['shade'], F['dark']
        P.rect(0, 0, 32, 32, sk)
        top = F.get('top', 5)
        crown = F.get('crown', F.get('hair'))
        P.rect(0, 0, 32, top, crown)
        if F.get('crownFn'): F['crownFn'](P, v)
        side = F.get('side', crown)
        sideTo = F.get('sideTo', 12)
        P.rect(0, top, 3, sideTo - top, side); P.rect(29, top, 3, sideTo - top, side)
        P.rect(0, sideTo, 3, 32 - sideTo, sh); P.rect(29, sideTo, 3, 32 - sideTo, sh)
        if F.get('ears', True):   # ears: a lighter notch in the side bands
            P.rect(1, 15, 2, 5, sk); P.rect(29, 15, 2, 5, sk); P.px(1, 17, sh); P.px(30, 17, sh)
        if F.get('fringe'): F['fringe'](P, v)
        P.rect(3, 30, 26, 2, sh)                       # under the jaw
        # brows
        bc, bs = F.get('brow', '#1c1412'), F.get('browStyle', 'heavy')
        lift = -1 if v == 1 else 0
        if bs == 'heavy': P.rect(6, 10 + lift, 8, 2, bc); P.rect(18, 10 + lift, 8, 2, bc)
        elif bs == 'thin': P.rect(7, 11, 7, 1, bc); P.rect(18, 11, 7, 1, bc)
        elif bs == 'arched': P.rect(8, 10, 5, 1, bc); P.px(7, 11, bc); P.px(13, 11, bc); P.rect(19, 10, 5, 1, bc); P.px(18, 11, bc); P.px(24, 11, bc)
        elif bs == 'angry': P.rect(6, 10, 3, 1, bc); P.rect(8, 11, 4, 1, bc); P.rect(11, 12, 3, 1, bc); P.rect(23, 10, 3, 1, bc); P.rect(20, 11, 4, 1, bc); P.rect(18, 12, 3, 1, bc)
        elif bs == 'bushy':
            P.rect(5, 9, 10, 3, bc); P.rect(17, 9, 10, 3, bc)
            for x in (5, 8, 11, 17, 20, 24): P.px(x, 8, bc)
            for x in (6, 10, 14, 18, 22, 26): P.px(x, 12, F.get('browD', bc))
        # eyes
        wh, pu, lid = F.get('white', '#f4f1ea'), F.get('pupil', '#141014'), F.get('lid', dk)
        ey = F.get('eyeY', 14)
        if v == 0:
            P.rect(7, ey, 6, 1, lid); P.rect(19, ey, 6, 1, lid)
            P.rect(7, ey + 1, 6, 2, wh); P.rect(19, ey + 1, 6, 2, wh)
            dx = F.get('look', 0)
            P.rect(9 + dx, ey + 1, 2, 2, pu); P.rect(21 + dx, ey + 1, 2, 2, pu)
            if F.get('heavyLids'): P.rect(7, ey + 1, 6, 1, F['heavyLids']); P.rect(19, ey + 1, 6, 1, F['heavyLids'])
            if F.get('lashes'): P.px(6, ey, lid); P.px(25, ey, lid)
        elif v == 1:
            P.rect(7, ey + 1, 6, 1, pu); P.rect(19, ey + 1, 6, 1, pu); P.px(12, ey, pu); P.px(19, ey, pu)
            P.rect(7, ey + 2, 6, 1, lid); P.rect(19, ey + 2, 6, 1, lid)
        else:
            for i in range(5):
                P.px(8 + i, ey + i, pu); P.px(12 - i, ey + i, pu); P.px(20 + i, ey + i, pu); P.px(24 - i, ey + i, pu)
        # glasses / sunglasses over the eyes
        gl = F.get('glasses')
        if gl == 'specs':
            fc = F.get('frame', '#2a2018')
            for x0 in (6, 18):
                P.rect(x0, ey - 1, 8, 1, fc); P.rect(x0, ey + 3, 8, 1, fc); P.rect(x0, ey - 1, 1, 5, fc); P.rect(x0 + 7, ey - 1, 1, 5, fc)
            P.rect(14, ey, 4, 1, fc); P.rect(3, ey, 3, 1, fc); P.rect(26, ey, 3, 1, fc)
            if v == 0: P.px(7, ey, '#d8e8f0'); P.px(19, ey, '#d8e8f0')
        elif gl == 'shades':
            sc, hl = F.get('lens', '#0c0c10'), F.get('lensHi', '#5a6a80')
            P.rect(6, ey - 1, 8, 4, sc); P.rect(18, ey - 1, 8, 4, sc); P.rect(14, ey, 4, 1, sc); P.rect(3, ey - 1, 3, 1, sc); P.rect(26, ey - 1, 3, 1, sc)
            if v == 0: P.rect(7, ey, 2, 1, hl); P.rect(19, ey, 2, 1, hl)
            elif v == 1: P.rect(9, ey + 1, 3, 1, hl); P.px(21, ey, hl)
            else: P.rect(6, ey + 2, 8, 2, sk); P.rect(18, ey - 1, 8, 1, sk); P.px(10, ey + 3, pu)   # knocked askew
        # cheeks, nose
        P.rect(4, 18, 4, 2, F.get('cheek', sh)); P.rect(24, 18, 4, 2, F.get('cheek', sh))
        P.rect(14, 17, 4, 4, sh); P.rect(13, 21, 6, 1, dk); P.px(14, 20, dk); P.px(17, 20, dk)
        P.px(15, 17, F.get('noseHi', sk))
        # mustache / beard
        if F.get('stache'):
            mc = F['stache']; P.rect(10, 22, 12, 2, mc); P.rect(9, 23, 2, 2, mc); P.rect(21, 23, 2, 2, mc)
        if F.get('stubble'):
            for (x, y) in ((6, 26), (9, 28), (12, 27), (19, 27), (22, 28), (25, 26), (15, 29), (8, 24), (23, 24), (17, 28)): P.px(x, y, F['stubble'])
        # mouth
        mc, lip = F.get('mouth', dk), F.get('lip')
        ms = F.get('mouthStyle', 'flat')
        if v == 0:
            if ms == 'flat': P.rect(11, 25, 10, 1, mc)
            elif ms == 'smirk': P.rect(11, 25, 8, 1, mc); P.rect(19, 24, 2, 1, mc)
            elif ms == 'frown': P.rect(12, 25, 8, 1, mc); P.px(11, 26, mc); P.px(20, 26, mc)
            elif ms == 'grin': P.rect(11, 24, 10, 1, mc); P.rect(12, 25, 8, 1, F.get('teeth', '#f4f1ea')); P.rect(11, 26, 10, 1, mc)
            elif ms == 'pursed': P.rect(13, 25, 6, 1, mc)
            if lip: P.rect(12, 25, 8, 1, lip); P.rect(13, 26, 6, 1, lip)
        elif v == 1:
            P.rect(10, 24, 12, 4, mc); P.rect(11, 25, 10, 2, F.get('teeth', '#f4f1ea'))
            for x in (13, 16, 19): P.px(x, 25, mc); P.px(x, 26, mc)
            if lip: P.rect(10, 24, 12, 1, lip)
        else:
            P.rect(12, 24, 8, 4, mc); P.rect(14, 26, 4, 2, F.get('tongue', '#c84858'))
            if lip: P.rect(12, 24, 8, 1, lip)
        if F.get('beard'): F['beard'](P, v)
        if F.get('extra'): F['extra'](P, v)

# ---------------------------------------------------------------- signs (labels over the action), same font as the game's
FONT = {   # 5x7 caps
 'S': ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'], 'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
 'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'], 'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
 'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'], 'D': ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
 'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], 'G': ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
 'I': ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'], 'N': ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
 'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], 'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
 'C': ['.####', '#....', '#....', '#....', '#....', '#....', '.####'], 'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
 'M': ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'], 'B': ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
 '!': ['##', '##', '##', '##', '##', '..', '##'], ' ': ['...', '...', '...', '...', '...', '...', '...'],
 'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'], 'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
 'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'], 'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
}
def sign(text, colour, path, shadow='#10060c'):
    cells = []
    x = 1
    for ch in text:
        g = FONT[ch]
        for gy, row in enumerate(g):
            for gx, c in enumerate(row):
                if c == '#': cells.append((x + gx, 1 + gy))
        x += len(g[0]) + 1
    W, Hh = (x + 2) * 2, 24
    im = Sheet(W, Hh)
    for (cx, cy) in cells:
        for d in (1, 2): im.rect((cx + d) * 2, (cy + d) * 2, 2, 2, shadow)
    for (cx, cy) in cells: im.rect(cx * 2, cy * 2, 2, 2, colour)
    im.save(path)

# ---------------------------------------------------------------- the flair kit: motifs and faces (docs/goon-style.md)
import math
def cog(P, cx, cy, r, col, dark=None, hole=None, teeth=8):   # Krasnovia's gold cogwheel, r ~ 2.5 (6 px) to 7 (15 px); dark shades its lower right
    rin = r * 0.7
    for j in range(int(cy - r - 2), int(cy + r + 3)):
        for i in range(int(cx - r - 2), int(cx + r + 3)):
            dx, dy = i - cx, j - cy; d = math.hypot(dx, dy); a = math.atan2(dy, dx)
            tooth = math.cos(a * teeth) > 0.05
            if d <= rin or (d <= r and tooth):
                P.px(i, j, dark if dark and dx + dy > 0.35 * (r + rin) else col)
            if hole and d <= r * 0.3: P.px(i, j, hole)
def star5(P, x, y, c):   # a 5x5 star
    P.map(['  #  ', ' ### ', '#####', ' ### ', ' # # '], {'#': c}, x, y)
def medal(P, x, y, rib, metal, dark):   # a 3x5 medal: a two-colour ribbon over a disc
    P.map(['aba', 'aba', 'mmm', 'mdm', ' m '], {'a': rib[0], 'b': rib[1], 'm': metal, 'd': dark}, x, y)
def faces3(S, fn):   # fn(P, v): v 0 normal, 1 hurt, 2 KO, each on its own 32x32
    for v, (ox, oy) in enumerate(((0, 0), (32, 0), (0, 32))): fn(Pane(S, ox, oy), v)
def eye(P, v, x, y, w, white, pupil, lid, look=0, h=3):
    """an eye at (x, y), w wide: v0 open (a lid line, the white, a pupil), v1 squeezed shut, v2 an X"""
    if v == 0:
        P.rect(x, y, w, 1, lid); P.rect(x, y + 1, w, h - 1, white)
        pw = 2 if w >= 4 else 1
        P.rect(x + (w - pw) // 2 + look, y + 1, pw, h - 1, pupil)
    elif v == 1:
        P.rect(x, y + 1, w, 1, pupil); P.px(x - 1, y, pupil); P.px(x + w, y, pupil); P.rect(x + 1, y + 2, max(1, w - 2), 1, lid)
    else:
        n = min(w, 5)
        for i in range(n): P.px(x + i, y - 1 + i, pupil); P.px(x + n - 1 - i, y - 1 + i, pupil)
def mouth_hurt(P, x, y, w, dark, teeth, h=4):   # a clenched grimace: teeth between dark lips
    P.rect(x, y, w, h, dark); P.rect(x + 1, y + 1, w - 2, h - 2, teeth)
    for i in range(x + 3, x + w - 1, 3): P.vl(i, y + 1, h - 2, dark)
def mouth_ko(P, x, y, w, dark, tongue, h=4):   # hanging open
    P.rect(x, y, w, h, dark); P.rect(x + 2, y + h - 2, w - 4, 2, tongue)
def pane(S, name): return S.at(name)
def remap(S, m):   # fold near-duplicate shades together to stay within the colour budget
    mm = {H(a): H(b) for a, b in m.items()}
    for y in range(S.im.height):
        for x in range(S.im.width):
            c = S.im.getpixel((x, y))
            if c in mm: S.im.putpixel((x, y), mm[c])
def bevel(P, base, hi, lo, x=0, y=0, w=16, h=16):   # a lit top-left edge, a shadowed bottom-right one
    P.rect(x, y, w, h, base); P.hl(x, y, w, hi); P.vl(x, y, h, hi); P.hl(x, y + h - 1, w, lo); P.vl(x + w - 1, y, h, lo)
