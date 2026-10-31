"""Paints Act 2's Columbian regulars (64x128 sheets, the layout in src/characters.js and tools/goonkit.py): the academy cadet,
the Liberty Diner's soda jerk, the linebacker and the government agent. Invented people, each a character with one loud
signature (docs/goon-style.md); the panel layout is goon()'s (see tools/goons_palace.py): upper arm X6, forearm X7, hand X8,
thigh X9, shin X10, foot X11, hips TB, neck SW(15), head sides/back/top HEADS; signature boxes on X1-X5, X12, TC, TD, swatches.
Columbia: red, white, navy #1a2a5a, gold trim; art-deco city, Americana people.
Run from the repo root: python3 tools/goons_columbia.py [cadet sodajerk linebacker agent]"""
from goonkit import Sheet, Pane, swatch, H, faces3, eye, mouth_hurt, mouth_ko, remap
from goons_palace import limb, skin_face, bare_hand, shoe

W_, Wd_, WH, BLK = '#f4f1ea', '#c8c2b8', '#ffffff', '#141014'
N, Nd, Nh = '#1a2a5a', '#0e1838', '#34487e'
R, Rd, Rh = '#d42a2a', '#8e1a1a', '#ff6050'
G, Gd, Gh = '#f2c14e', '#b88a2a', '#fff0b0'
TONGUE = '#c84858'

def sunburst(P, cx, cy, r, c, core=None, n=8):   # Columbia's gold sunburst: rays round a disc
    import math
    for k in range(n):
        a = k * 2 * math.pi / n
        for t in range(int(r * 0.45), int(r) + 1):
            P.px(int(round(cx + math.cos(a) * t)), int(round(cy + math.sin(a) * t)), c)
    P.disc(cx, cy, r * 0.42, core or c)

def digits(P, x, y, s, fill, edge):   # chunky jersey numbers (3x5 cells drawn 1 px with an outline)
    F = {'5': ['###', '#..', '###', '..#', '###'], '4': ['#.#', '#.#', '###', '..#', '..#']}
    cells = [(x + k * 4 + gx, y + gy) for k, ch in enumerate(s) for gy, row in enumerate(F[ch]) for gx, c in enumerate(row) if c == '#']
    for (cx, cy) in cells: P.rect(cx - 1, cy - 1, 3, 3, edge)
    for (cx, cy) in cells: P.px(cx, cy, fill)

def bigdigits(P, x, y, s, fill, edge):   # 2x-scaled numbers for the jersey's back and front
    F = {'5': ['###', '#..', '###', '..#', '###'], '4': ['#.#', '#.#', '###', '..#', '..#']}
    cells = []
    for k, ch in enumerate(s):
        for gy, row in enumerate(F[ch]):
            for gx, c in enumerate(row):
                if c == '#': cells.append((x + k * 7 + gx * 2, y + gy * 2))
    for (cx, cy) in cells: P.rect(cx - 1, cy - 1, 4, 4, edge)
    for (cx, cy) in cells: P.rect(cx, cy, 2, 2, fill)

# =============================================================== the academy cadet
# SIGNATURE: a towering bell-topped shako with a red-and-white pompom, and a snappy salute. X1 the shako's front (a gold sunburst
# plate, a cockade, cords), TD its sides and back, SW(1) its top, SW(0) the patent visor, X2 the pompom, SW(2) jug ears, X3 the
# coatee's tails, X4 the white gauntlets. Young and eager: wide eyes, brows sky-high, shouting SIR!, a pigeon chest under white
# cross-belts, white trousers, mirror-polished shoes.
def cadet():
    S = Sheet()
    sk, sh, dk, hi, fr = '#c68a5e', '#9a6440', '#5a321e', '#e4ae84', '#a8704c'
    hr, hh, K2 = '#1c1410', '#4a3626', '#4a4a5c'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 6, N); P.hl(0, 5, 32, G); P.hl(0, 4, 32, Nd)   # the shako's band (its front box sits over these rows)
        P.rect(0, 6, 3, 9, hr); P.rect(29, 6, 3, 9, hr); P.checker(0, 6, 3, 9, hh); P.checker(29, 6, 3, 9, hh, 1)   # a fresh buzz cut at the temples
        l = -1 if v == 1 else 0
        if v != 1:   # brows sky-high, arched: eager
            P.map(['  ####  ', ' #    # ', '#      #'], {'#': hr}, 5, 7); P.map(['  ####  ', ' #    # ', '#      #'], {'#': hr}, 19, 7)
        else: P.map(['###     ', '   #####'], {'#': hr}, 5, 10); P.map(['     ###', '#####   '], {'#': hr}, 19, 10)
        if v == 0:   # big round eyes, white all round the pupil, a glint
            for x0 in (6, 19):
                P.rect(x0 + 1, 11, 5, 1, dk); P.rect(x0, 12, 7, 4, W_); P.rect(x0 + 1, 16, 5, 1, W_); P.px(x0, 12, dk); P.px(x0 + 6, 12, dk)
                P.rect(x0 + 2, 13, 3, 3, '#3a2418'); P.rect(x0 + 3, 13, 1, 2, BLK); P.px(x0 + 2, 13, WH)
                P.hl(x0 + 1, 17, 5, sh)
        else: eye(P, v, 7, 13, 5, W_, BLK, dk); eye(P, v, 20, 13, 5, W_, BLK, dk)
        P.rect(14, 17, 4, 3, sh); P.px(15, 17, hi); P.px(13, 19, dk); P.px(18, 19, dk)   # a button nose
        for (x, y) in ((5, 18), (8, 19), (10, 18), (6, 20), (22, 18), (24, 19), (26, 18), (23, 20), (12, 17), (20, 17)): P.px(x, y, fr)   # freckles
        if v == 0:   # mouth wide open: SIR!
            P.map([' ########## ', '#WWWWWWWWWW#', '#dddddddddd#', '#dddttttddd#', ' #dttttttd# ', '  ########  '], {'#': dk, 'W': W_, 'd': '#3a1414', 't': TONGUE}, 10, 21)
        elif v == 1: mouth_hurt(P, 10, 22, 12, dk, W_)
        else: mouth_ko(P, 11, 22, 10, dk, TONGUE)
        P.hl(3, 28, 26, G); P.hl(4, 29, 24, Gd); P.vl(3, 15, 13, G); P.vl(28, 15, 13, G)   # the gold chinstrap, up both sides
        P.px(15, 28, Gh); P.px(16, 28, Gh)   # its buckle
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 10, hr); hd.checker(0, 0, 16, 10, hh); hd.rect(0, 13, 16, 3, sh); hd.hl(0, 10, 16, hi)   # buzzed sides and back
    # the shako: navy felt, a gold band at the top, a gold sunburst plate, a red-white-navy cockade, a gold cord swagged across
    x1 = S.at('X1'); x1.fill(N); x1.grain(N, Nh, 0.08, 2); x1.rect(0, 0, 16, 2, G); x1.hl(0, 2, 16, Gd)
    x1.disc(7.5, 4.6, 2.2, R); x1.disc(7.5, 4.6, 1.3, W_); x1.px(7, 4, N); x1.px(8, 4, N)   # the cockade
    sunburst(x1, 7.5, 9.6, 4.2, G, Gd); x1.px(7, 9, Gh); x1.px(6, 10, Gh)   # the academy plate
    for i, y in enumerate((13, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 13)): x1.px(1 + i, y, Gh if i % 3 == 0 else G)   # the cord's swag
    x1.vl(0, 3, 13, Nd); x1.vl(15, 3, 13, Nd)
    td = S.at('TD'); td.fill(N); td.grain(N, Nh, 0.08, 3); td.rect(0, 0, 16, 2, G); td.hl(0, 2, 16, Gd); td.vl(7, 3, 13, Nd)
    for i, y in enumerate((11, 12, 13, 13, 14, 14, 14, 14, 14, 14, 13, 13, 12, 11)): td.px(1 + i, y, G)   # the cord runs round
    td.vl(0, 0, 16, Nd); td.vl(15, 0, 16, Nh)
    swatch(S, 1, Nd); S.rect(49, 113, 2, 2, G)
    swatch(S, 0, BLK); S.rect(48, 112, 4, 1, K2); S.px(49, 113, WH)   # the visor: patent, a shine
    pp = S.at('X2'); pp.fill(W_)   # the pompom: white over red, fluffed
    pp.rect(0, 8, 16, 8, R); pp.checker(0, 7, 16, 2, R); pp.grain(W_, Wd_, 0.15, 4, 0, 0, 16, 8); pp.grain(R, Rd, 0.2, 5, 0, 8, 16, 8); pp.grain(W_, WH, 0.1, 6, 0, 0, 16, 7)
    pp.hl(0, 15, 16, Rd)
    swatch(S, 2, sk); S.rect(57, 113, 2, 2, sh)   # the ears, a shadow inside
    # the coatee: navy, a high gold collar, red piping, under two white cross-belts with the academy's sunburst plate where they cross
    def navy(P, k): P.fill(N); P.grain(N, Nh, 0.07, k)
    t = S.at('TA'); navy(t, 7)
    t.rect(4, 0, 8, 2, G); t.hl(4, 2, 8, Gd); t.rect(6, 0, 4, 1, sk)   # the high collar
    for i in range(11):   # the belts: shoulder to opposite hip, crossing on his breastbone
        for (x, d) in ((1 + i * 13 // 10, 1), (14 - i * 13 // 10, -1)):
            t.px(x, i, W_); t.px(x + d, i, W_); t.px(x + 2 * d, i, Wd_)
    t.disc(7.5, 5.5, 2.6, G); t.disc(7.5, 5.5, 1.4, Gh); t.px(7, 5, Gd); t.px(8, 6, Gd); t.px(5, 5, Gd); t.px(10, 5, Gd)   # the plate
    for y in (8, 10): t.px(7, y, G); t.px(8, y, Gd)   # brass buttons down the front
    t.rect(0, 11, 16, 3, W_); t.hl(0, 13, 16, Wd_); t.rect(6, 11, 4, 3, G); t.rect(7, 12, 2, 1, Gd)   # the white waist belt, its plate
    t.rect(0, 14, 16, 2, N); t.hl(0, 15, 16, R)   # the coatee's hem, piped red
    b = S.at('TA_B'); navy(b, 8)
    for i in range(11):
        for (x, d) in ((1 + i * 13 // 10, 1), (14 - i * 13 // 10, -1)):
            b.px(x, i, W_); b.px(x + d, i, W_)
    b.rect(5, 0, 6, 2, G); b.rect(0, 11, 16, 3, W_); b.hl(0, 13, 16, Wd_); b.vl(7, 14, 2, Rd); b.px(5, 14, G); b.px(10, 14, G); b.hl(0, 15, 16, R)
    s_ = S.at('TA_S'); navy(s_, 9); s_.rect(6, 0, 3, 11, W_); s_.vl(8, 0, 11, Wd_); s_.rect(0, 11, 16, 3, W_); s_.hl(0, 13, 16, Wd_); s_.vl(0, 0, 16, R); s_.hl(0, 15, 16, R)
    ct = S.at('X3'); navy(ct, 10)   # the tails: split up the middle on red lining, gold buttons, gold edging
    ct.rect(6, 0, 4, 16, R); ct.vl(7, 0, 16, Rd); ct.vl(5, 0, 16, G); ct.vl(10, 0, 16, G); ct.hl(0, 15, 16, G)
    for x in (2, 13): ct.px(x, 2, G); ct.px(x, 3, Gd)
    gl = S.at('X4'); gl.fill(W_); gl.vl(0, 0, 16, WH); gl.vl(15, 0, 16, Wd_); gl.hl(0, 0, 16, WH); gl.hl(0, 15, 16, Wd_)   # gauntlet cuffs
    for x in (4, 7, 10): gl.vl(x, 4, 9, Wd_)
    gl.px(12, 3, G); gl.px(12, 4, Gd)
    tb = S.at('TB'); tb.fill(W_); tb.vl(7, 0, 16, Wd_); tb.rect(0, 0, 16, 2, Wd_); tb.vl(0, 0, 16, WH); tb.vl(15, 0, 16, Wd_)   # white trousers
    tb.grain(W_, Wd_, 0.05, 11)
    u = S.at('X6'); limb(u, N, Nh, Nd); u.rect(0, 0, 16, 3, G); u.hl(0, 3, 16, Gd); u.checker(0, 1, 16, 1, Gh)   # gold shoulder rolls
    u.vl(3, 4, 12, R)   # red seam piping
    f = S.at('X7'); limb(f, N, Nh, Nd); f.vl(3, 0, 10, R)
    f.map(['#      #', ' #    # ', '  #  #  ', '   ##   ', '#      #', ' #    # ', '  #  #  ', '   ##   '], {'#': G}, 4, 1)   # two gold chevrons: cadet second class
    f.rect(0, 9, 16, 2, G); f.hl(0, 11, 16, Gd); f.rect(0, 12, 16, 4, W_)
    hn = S.at('X8'); bare_hand(hn, W_, Wd_, '#a8a298', WH)   # white gloves
    hn.vl(5, 2, 7, Wd_); hn.vl(9, 2, 7, Wd_)
    th = S.at('X9'); limb(th, W_, WH, Wd_); th.vl(7, 0, 16, Wd_); th.vl(1, 0, 16, N); th.vl(2, 0, 16, G)   # creased whites, a navy-and-gold stripe
    sn = S.at('X10'); limb(sn, W_, WH, Wd_); sn.vl(7, 0, 11, Wd_); sn.vl(1, 0, 11, N); sn.vl(2, 0, 11, G)
    sn.rect(0, 11, 16, 5, BLK); sn.hl(0, 11, 16, Wd_); sn.hl(2, 13, 9, K2); sn.px(4, 13, WH)   # spit-shined boots
    fo = S.at('X11'); shoe(fo, BLK, K2, '#000000', '#2a1a12'); fo.px(3, 2, WH); fo.px(4, 1, WH); fo.px(11, 5, WH)   # mirror shine
    swatch(S, 15, sk)
    remap(S, {'#000000': BLK, '#a8a298': Wd_})
    return S.save('assets/tex/sheet_cadet.png', 32)

# =============================================================== the soda jerk
# SIGNATURE: a tower of diner plates balanced high on one palm, a Columbia Cola bottle cocked back in the other: he's going to
# throw them. A beanpole on a long neck: a cocked paper cap, a ginger flick (SW(3)), freckles, half-lidded cool, a pink gum
# bubble (SW(1)), a red polka-dot bow tie (X3), a white jacket, a candy-striped apron with syrup stains (X4), saddle shoes.
# X1 the paper cap, X5 the plates' side, X12 a plate's face, TC + SW(2) the bottle.
def sodajerk():
    S = Sheet()
    sk, sh, dk, hi, fr = '#f2c4a2', '#d0947a', '#8a4a3a', '#ffe2cc', '#d07a4c'
    O, Od, Oh = '#d8642a', '#8e3a18', '#f4944a'
    P_, Pd, Ph = '#ff7ab8', '#c8407e', '#ffc4e0'
    GL, GLh = '#3a1c10', '#7a4a30'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 6, W_); P.hl(0, 5, 32, R); P.hl(0, 4, 32, Wd_)   # the paper cap's band
        P.rect(0, 6, 4, 9, O); P.rect(28, 6, 4, 9, O); P.vl(1, 7, 7, Od); P.vl(30, 7, 7, Od)   # ginger sideburns
        P.map(['OOOOOOO      ', ' OOhOOOOO    ', '  OOOOh  O   ', '    OO       '], {'O': O, 'h': Oh}, 3, 6)   # the flick down his brow
        l = -1 if v == 1 else 0
        P.map(['######', '#     '], {'#': Od}, 6, 10 + l)   # one brow flat, one cocked up
        P.map([' #####', '#     ', '      '], {'#': Od}, 20, 8 + l)
        if v == 0:   # half-lidded: too cool for this
            for x0 in (6, 20):
                P.rect(x0, 13, 6, 2, sh); P.hl(x0, 14, 6, dk); P.rect(x0, 15, 6, 1, W_); P.rect(x0 + 3, 15, 2, 1, '#2a5a8a'); P.px(x0 + 3, 15, BLK)
        else: eye(P, v, 6, 13, 6, W_, BLK, dk); eye(P, v, 20, 13, 6, W_, BLK, dk)
        P.rect(14, 16, 4, 4, sh); P.px(15, 17, hi); P.px(14, 19, dk); P.px(17, 19, dk); P.px(15, 15, hi)   # an upturned nose
        for (x, y) in ((4, 17), (6, 18), (8, 17), (9, 19), (5, 20), (11, 18), (21, 18), (23, 17), (24, 19), (26, 18), (22, 20), (27, 20), (13, 16), (19, 16)): P.px(x, y, fr)   # a dusting of freckles
        if v == 0:   # lips puckered round the bubble (a box in front)
            P.rect(12, 22, 8, 5, Pd); P.rect(13, 23, 6, 3, P_); P.hl(14, 23, 2, Ph)
        elif v == 1: mouth_hurt(P, 11, 22, 10, dk, W_); P.rect(20, 24, 2, 2, P_)   # gum stuck on his chin
        else: mouth_ko(P, 12, 22, 8, dk, TONGUE)
        P.px(16, 29, sh); P.hl(14, 30, 4, dk)   # a knobbly chin
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(O); hd.grain(O, Oh, 0.12, 2); hd.grain(O, Od, 0.1, 3); hd.rect(0, 0, 16, 3, W_); hd.hl(0, 2, 16, R)
    hd.rect(0, 11, 16, 5, sk); hd.rect(0, 14, 16, 2, sh); hd.vl(3, 6, 6, Od); hd.vl(11, 7, 5, Od)
    swatch(S, 3, O); S.rect(60, 112, 2, 2, Oh)
    cp = S.at('X1'); cp.fill(W_)   # the paper cap: white, a red band, a crease, the diner's winged L
    cp.hl(0, 0, 16, WH); cp.hl(0, 6, 16, Wd_); cp.rect(0, 11, 16, 3, R); cp.hl(0, 14, 16, Rd); cp.hl(0, 15, 16, Wd_)
    cp.map(['  ##   ', ' ###   ', '##.#   ', '  .#   ', '  .####'], {'#': R, '.': Rd}, 5, 1); cp.map(['#  ', '## ', ' ##'], {'#': Rh}, 2, 3)
    cp.map(['  #', ' ##', '## '], {'#': Rh}, 11, 3)
    cp.grain(W_, Wd_, 0.04, 4)
    swatch(S, 1, P_); S.rect(53, 112, 2, 1, Ph); S.px(55, 115, Pd)   # the gum bubble
    bt = S.at('X3'); bt.fill(W_)   # the bow tie, on a scrap of white collar: two red wings, polka dots, a pinched knot
    bt.map(['RR            RR', 'RRRR        RRRR', 'RRRRRR    RRRRRR', 'RRRRRRRKKRRRRRRR', 'RRRRRRRKKRRRRRRR', 'RRRRRRKKKKRRRRRR', 'RRRRRRKKKKRRRRRR', 'RRRRRRKKKKRRRRRR',
            'RRRRRRKKKKRRRRRR', 'RRRRRRKKKKRRRRRR', 'RRRRRRRKKRRRRRRR', 'RRRRRRRKKRRRRRRR', 'RRRRRR    RRRRRR', 'RRRR        RRRR', 'RR            RR', '                '], {'R': R, 'K': Rd})
    for x in (2, 13): bt.vl(x, 3, 10, Rh)   # a sheen down each wing
    bt.px(7, 5, Rh)
    ap = S.at('X4')   # the apron: candy stripes, a pocket with an order pad and a pencil, syrup and mustard
    for x in range(16): ap.vl(x, 0, 16, R if (x // 2) % 2 == 0 else W_)
    ap.rect(0, 14, 16, 2, N); ap.hl(0, 13, 16, Rd)
    ap.rect(9, 3, 5, 4, W_); ap.outline(9, 3, 5, 4, Wd_); ap.vl(12, 0, 4, G); ap.px(12, 0, '#2a1a12'); ap.hl(10, 5, 3, Wd_)
    for (x, y) in ((3, 8), (4, 9), (3, 10), (13, 10)): ap.px(x, y, GL)
    ap.px(6, 11, G); ap.px(7, 12, G)
    pl = S.at('X5'); pl.fill(W_)   # the plates' edge: a teetering stack, every one red-rimmed, not quite square
    for y in range(0, 16, 2):
        off = (y * 7 // 3) % 3 - 1
        pl.hl(0, y, 16, R if y % 4 == 0 else Wd_); pl.px(15 if off > 0 else 0, y + 1, Wd_)
        if off: pl.px(7 + off * 3, y + 1, WH)
    pl.vl(0, 0, 16, Wd_); pl.vl(15, 0, 16, '#9aa0b0')
    pt = S.at('X12'); pt.fill('#9aa0b0'); pt.disc(7.5, 7.5, 7.6, W_); pt.disc(7.5, 7.5, 6.2, R); pt.disc(7.5, 7.5, 5.4, W_); pt.disc(7.5, 7.5, 4, WH)   # the top plate
    pt.px(5, 5, Wd_); pt.px(10, 9, '#3a1c10')   # a crumb
    bo = S.at('TC'); bo.fill(GL)   # the bottle: dark cola glass, the red label with its white swoosh, a shine
    bo.rect(0, 5, 16, 6, R); bo.hl(0, 5, 16, Rh); bo.hl(0, 10, 16, Rd)
    bo.map(['##     ', '  ###  ', '     ##'], {'#': W_}, 4, 6); bo.px(2, 8, W_); bo.px(13, 7, W_)
    bo.vl(2, 0, 5, GLh); bo.vl(2, 11, 5, GLh); bo.vl(3, 1, 3, '#b07a58'); bo.hl(0, 15, 16, '#1a0c06')
    swatch(S, 2, GL); S.rect(56, 112, 1, 4, GLh)
    t = S.at('TA'); t.fill(W_)   # the white jacket: a wing collar, two rows of buttons, straws in the breast pocket, a name badge
    t.map(['WWWWsssssssWWWWW', 'WWWwWsssssWwWWWW', 'WWWWwWsssWwWWWWW', 'WWWWWwWWWwWWWWWW'], {'W': None, 's': sk, 'w': Wd_}, 0, 0)
    t.vl(7, 4, 12, Wd_); t.vl(8, 4, 12, WH)
    for y in (6, 9, 12): t.px(5, y, Nh); t.px(10, y, Nh)   # navy buttons
    t.rect(11, 4, 4, 3, Wd_); t.vl(12, 1, 3, R); t.vl(13, 2, 2, W_); t.vl(14, 1, 3, R); t.px(13, 1, R)   # the pocket, red-striped straws
    t.rect(1, 5, 4, 2, N); t.hl(2, 5, 2, W_)   # a navy name badge: LEN, more or less
    t.grain(W_, Wd_, 0.04, 6)
    t.rect(0, 14, 16, 2, R); t.hl(0, 13, 16, Wd_)   # the apron's string round his waist
    b = S.at('TA_B'); b.fill(W_); b.grain(W_, Wd_, 0.05, 7); b.vl(7, 0, 12, Wd_); b.rect(5, 0, 6, 2, Wd_)   # the back: the apron's strings in a big bow
    b.rect(0, 12, 16, 2, R); b.map(['##   ##', '###.###', '##   ##'], {'#': R, '.': Rd}, 4, 11); b.vl(5, 14, 2, R); b.vl(10, 14, 2, R)
    b.rect(10, 2, 4, 5, W_); b.outline(10, 2, 4, 5, Wd_)   # a dish towel tucked in the collar
    s_ = S.at('TA_S'); s_.fill(W_); s_.grain(W_, Wd_, 0.05, 8); s_.vl(7, 0, 16, Wd_); s_.rect(0, 12, 16, 2, R)
    tb = S.at('TB'); tb.fill(N); tb.rect(0, 0, 16, 6, W_); tb.hl(0, 2, 16, R); tb.hl(0, 5, 16, Wd_); tb.vl(7, 6, 10, Nd); tb.grain(N, Nh, 0.06, 9)
    u = S.at('X6'); limb(u, W_, WH, Wd_); u.rect(0, 12, 16, 4, W_); u.hl(0, 12, 16, Wd_); u.hl(0, 14, 16, Wd_)   # sleeves rolled to the elbow
    f = S.at('X7'); limb(f, sk, hi, sh); f.rect(0, 0, 16, 2, W_); f.hl(0, 2, 16, Wd_)
    for (x, y) in ((3, 5), (6, 8), (10, 4), (12, 9), (4, 11), (9, 12)): f.px(x, y, fr)
    f.rect(0, 12, 16, 2, '#2a1a12'); f.px(7, 12, G); f.px(8, 12, Gh)   # a wristwatch
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi)
    th = S.at('X9'); limb(th, N, Nh, Nd); th.vl(7, 0, 16, Nd)
    sn = S.at('X10'); limb(sn, N, Nh, Nd); sn.rect(0, 10, 16, 3, W_); sn.hl(0, 11, 16, R); sn.rect(0, 13, 16, 3, BLK); sn.rect(5, 13, 6, 3, W_)   # striped socks, saddle shoes
    fo = S.at('X11'); shoe(fo, W_, WH, Wd_, '#b8402a'); fo.rect(4, 0, 8, 11, BLK); fo.rect(5, 2, 6, 1, W_); fo.rect(5, 5, 6, 1, W_)   # black saddle, red rubber sole
    swatch(S, 15, sk)
    remap(S, {'#2a1a12': '#3a1c10', '#1a0c06': '#3a1c10', '#b07a58': GLh, '#2a5a8a': Nh})
    return S.save('assets/tex/sheet_sodajerk.png', 32)

# =============================================================== the linebacker
# SIGNATURE: giant shoulder pads (X1 front, X2 sides/top/back) under a red helmet. X3 the helmet's sides (a gold sunburst decal),
# TD its back, X4 its top and brow (a white-navy-white stripe), SW(1) the grey face cage. A barrel chest in a white jersey,
# number 54 front and back, eye black, a red mouthguard in a snarl, gold pants, striped socks, taped cleats.
def linebacker():
    S = Sheet()
    sk, sh, dk, hi, bd = '#bc8058', '#8e5836', '#3e2214', '#dca07a', '#1a1210'
    C, Cd = '#a8acb8', '#5a5e6c'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 7, R); P.hl(0, 6, 32, Rd); P.rect(13, 0, 6, 6, W_); P.rect(15, 0, 2, 6, N)   # the helmet's brow (a box in front of it)
        P.rect(0, 7, 4, 25, R); P.rect(28, 7, 4, 25, R); P.vl(3, 7, 25, Rd); P.vl(28, 7, 25, Rd)   # its cheek guards
        l = -1 if v == 1 else 0
        P.rect(5, 9 + l, 9, 3, bd); P.rect(18, 9 + l, 9, 3, bd); P.rect(11, 11 + l, 3, 1, bd); P.rect(18, 11 + l, 3, 1, bd)   # one heavy scowling ridge
        if v == 0:   # glaring up from under the brow: whites under the pupils
            for x0 in (6, 19): P.rect(x0, 12, 7, 4, W_); P.rect(x0 + 2 + (1 if x0 == 6 else 0), 12, 3, 3, '#2a1810'); P.rect(x0 + 3 + (1 if x0 == 6 else 0), 13, 1, 2, BLK); P.hl(x0, 12, 7, dk); P.px(x0 + 2 + (1 if x0 == 6 else 0), 13, WH)
        else: eye(P, v, 7, 12, 6, W_, BLK, dk); eye(P, v, 19, 12, 6, W_, BLK, dk)
        P.rect(5, 16, 9, 2, BLK); P.rect(18, 16, 9, 2, BLK); P.hl(6, 16, 3, '#3a3a48'); P.hl(19, 16, 3, '#3a3a48')   # eye black
        P.rect(13, 15, 6, 5, sh); P.rect(12, 19, 8, 2, sh); P.px(12, 20, dk); P.px(19, 20, dk); P.px(14, 16, hi)   # a broad flat nose
        if v == 0:   # a snarl round a red mouthguard
            P.map(['#########', '#RRRRRRR#', '#RrRrRrR#', ' ####### '], {'#': dk, 'R': R, 'r': Rd}, 12, 22); P.px(11, 21, dk); P.px(21, 23, dk)
        elif v == 1: mouth_hurt(P, 11, 22, 10, dk, R)
        else: mouth_ko(P, 12, 22, 8, dk, R)
        P.grain(sk, bd, 0.3, 7, 4, 24, 24, 3)   # a chinstrap beard along the jaw
        P.rect(4, 28, 24, 4, bd); P.rect(4, 22, 2, 6, bd); P.rect(26, 22, 2, 6, bd); P.grain(bd, '#3a2a20', 0.2, 8, 4, 27, 24, 5)
        P.px(24, 20, '#e8b890'); P.px(25, 20, '#e8b890')   # a sweat glint
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(bd); hd.rect(0, 12, 16, 4, sk); hd.hl(0, 14, 16, sh)
    hs = S.at('X3'); hs.fill(R); hs.grain(R, Rh, 0.06, 2)   # the helmet's sides: a gold sunburst, the stripe's edge, ear holes
    sunburst(hs, 8.5, 7.5, 5.2, G, Gd); hs.disc(8.5, 7.5, 1.6, N); hs.px(8, 7, Gh)
    hs.hl(0, 0, 16, W_); hs.hl(0, 15, 16, Rd); hs.vl(15, 0, 16, Rd); hs.rect(1, 13, 3, 2, Rd)
    hb = S.at('TD'); hb.fill(R); hb.grain(R, Rh, 0.06, 3); hb.rect(5, 0, 6, 16, W_); hb.rect(7, 0, 2, 16, N); hb.hl(0, 15, 16, Rd)   # the back: the stripe, a number
    hb.rect(2, 9, 3, 1, W_); hb.rect(11, 9, 3, 1, W_)
    ht = S.at('X4'); ht.fill(R); ht.grain(R, Rh, 0.06, 4); ht.rect(5, 0, 6, 16, W_); ht.rect(7, 0, 2, 16, N); ht.vl(4, 0, 16, Rd); ht.vl(11, 0, 16, Rd); ht.hl(2, 2, 2, Rh); ht.hl(12, 2, 2, Rh)
    swatch(S, 1, C); S.rect(52, 112, 4, 1, W_); S.rect(52, 115, 4, 1, Cd)   # the cage: grey bars
    def jersey(P, k): P.fill(W_); P.grain(W_, Wd_, 0.06, k)
    GR, MU = '#5a8a3a', '#7a5a3a'   # grass and mud: he's been down a few times
    pf = S.at('X1'); jersey(pf, 5)   # a pad's front: the jersey stretched over it, the sleeve's stripes at the bottom, scuffs
    pf.hl(0, 0, 16, WH); pf.vl(0, 0, 16, WH); pf.vl(15, 0, 16, Wd_)
    pf.rect(0, 9, 16, 2, R); pf.rect(0, 11, 16, 2, N); pf.rect(0, 13, 16, 2, R); pf.hl(0, 15, 16, Rd)
    pf.map(['g  g ', ' gg  ', 'g m  '], {'g': GR, 'm': MU}, 9, 3); pf.px(3, 5, MU)
    ps = S.at('X2'); jersey(ps, 6)   # the pads' sides and top: sleeve stripes, TV numbers
    ps.rect(0, 10, 16, 2, R); ps.rect(0, 12, 16, 1, N); ps.rect(0, 13, 16, 2, R)
    digits(ps, 4, 2, '54', R, N); ps.hl(0, 15, 16, Rd); ps.px(13, 8, GR); ps.px(2, 1, MU)
    t = S.at('TA'); jersey(t, 7)   # the chest: a navy V collar (between the pads), 54 in red outlined navy, a grass stain
    t.checker(0, 0, 16, 16, '#e0dcd2'); t.map(['NNNNNNNNNNNNNNNN', ' NNNRRRRRRRRNNN ', '  NNNRRRRRRNNN  ', '    NNNNNNNN    '], {'N': N, 'R': sk}, 0, 0)
    bigdigits(t, 2, 5, '54', R, N); t.hl(0, 15, 16, N); t.map(['gg ', 'g g', ' gm'], {'g': GR, 'm': MU}, 12, 12)
    b = S.at('TA_B'); jersey(b, 8); b.checker(0, 0, 16, 16, '#e0dcd2')   # the back: a nameplate over a big 54
    b.rect(3, 0, 10, 2, N); b.px(4, 0, W_); b.px(6, 0, W_); b.px(8, 0, W_); b.px(10, 0, W_); b.px(5, 1, W_); b.px(9, 1, W_)
    bigdigits(b, 2, 5, '54', R, N); b.hl(0, 15, 16, N)
    s_ = S.at('TA_S'); jersey(s_, 9); s_.checker(0, 0, 16, 16, '#e0dcd2'); s_.rect(6, 0, 4, 16, R); s_.rect(7, 0, 2, 16, N)
    tb = S.at('TB'); tb.fill(G); tb.grain(G, Gh, 0.08, 10); tb.rect(0, 0, 16, 3, N); tb.hl(0, 1, 16, R); tb.rect(7, 0, 2, 3, W_)   # gold pants, a navy belt
    tb.map(['# #', ' # ', '# #', ' # ', '# #'], {'#': W_}, 6, 4); tb.vl(0, 0, 16, Gd); tb.vl(15, 0, 16, Gd)   # the laced fly
    u = S.at('X6'); limb(u, sk, hi, sh); u.rect(0, 0, 16, 6, W_); u.rect(0, 2, 16, 1, R); u.rect(0, 3, 16, 1, N); u.rect(0, 4, 16, 1, R); u.hl(0, 5, 16, Wd_)   # striped sleeve, then arm
    u.vl(6, 7, 6, sh); u.px(5, 9, hi)
    f = S.at('X7'); limb(f, sk, hi, sh); f.rect(0, 9, 16, 4, W_); f.hl(0, 10, 16, Wd_); f.hl(0, 12, 16, Wd_); f.vl(4, 1, 7, sh)   # taped wrists
    hn = S.at('X8'); bare_hand(hn, R, Rh, Rd, Rh); hn.rect(0, 0, 16, 3, W_); hn.hl(0, 2, 16, Wd_)   # red gloves
    th = S.at('X9'); limb(th, G, Gh, Gd); th.vl(0, 0, 16, N); th.vl(1, 0, 16, R); th.vl(2, 0, 16, N); th.vl(15, 0, 16, N); th.vl(14, 0, 16, R)   # stripes down the sides
    th.rect(4, 3, 8, 7, Gh); th.outline(4, 3, 8, 7, G)   # the thigh pads under the gold
    th.map(['g g m', ' gg  ', 'g  mm'], {'g': GR, 'm': MU}, 5, 11)   # grass on the knees
    sn = S.at('X10'); limb(sn, G, Gh, Gd); sn.rect(3, 0, 10, 4, Gh); sn.hl(0, 4, 16, Gd)   # knee pads
    sn.rect(0, 5, 16, 2, N); sn.rect(0, 7, 16, 1, W_); sn.rect(0, 8, 16, 2, R); sn.rect(0, 10, 16, 1, W_)   # striped socks
    sn.rect(0, 11, 16, 5, W_); sn.hl(0, 13, 16, Wd_); sn.px(3, 12, Wd_); sn.px(9, 14, Wd_)   # taped over the cleats
    fo = S.at('X11'); shoe(fo, W_, WH, Wd_, BLK); fo.rect(0, 8, 16, 3, BLK)
    for x in (2, 6, 10, 13): fo.px(x, 15, C)   # studs
    swatch(S, 15, sk)
    remap(S, {'#3a2a20': '#3e2214', '#2a1810': '#3e2214', '#3a3a48': Cd})
    return S.save('assets/tex/sheet_linebacker.png', 32)

# =============================================================== the government agent
# SIGNATURE: a big white Stetson with its brim curled up at the sides (X1 the crown, SW(0) its top, X2 the brim). A square
# cleft jaw jutting out (X3), steely crow's-feet squint, silver sideburns, a smirk; a navy suit with a gold flag pin and a
# bolo tie with a gold sunburst slide, a big belt buckle, tan cowboy boots. Arms folded: go on, take a swing.
def agent():
    S = Sheet()
    sk, sh, dk, hi = '#e2b292', '#b88468', '#6a4232', '#f6d4b6'
    sv, svd = '#c4c4cc', '#7a7a88'
    Cr, Crd, Crh = '#fbf8f0', '#cfc6b0', WH
    T, Td, Th = '#b8763e', '#7a4a24', '#e0a060'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 7, Cr); P.hl(0, 5, 32, N); P.hl(0, 6, 32, Crd)   # the hatband over his brow
        P.rect(0, 7, 4, 15, sv); P.rect(28, 7, 4, 15, sv); P.checker(0, 7, 4, 15, svd); P.checker(28, 7, 4, 15, svd, 1)   # silver sideburns
        P.rect(4, 7, 24, 2, sh)   # the hat's shadow over his brow
        l = -1 if v == 1 else 0
        P.map(['########', '########'], {'#': '#3a2a24'}, 5, 10 + l); P.map(['    ####', '########', '####    '], {'#': '#3a2a24'}, 19, 8 + l)   # heavy brows: one level, one cocked
        if v == 0:   # a narrowed, steely squint: ice-blue eyes, crow's feet
            for x0 in (6, 19): P.hl(x0, 13, 7, dk); P.rect(x0, 14, 7, 2, W_); P.rect(x0 + 2, 14, 3, 2, '#3a6aa0'); P.px(x0 + 3, 14, BLK); P.px(x0 + 2, 14, WH); P.hl(x0, 16, 7, sh)
            for (x, y) in ((4, 12), (3, 14), (4, 16), (27, 12), (28, 14), (27, 16)): P.px(x, y, dk)
        else: eye(P, v, 7, 13, 6, W_, BLK, dk); eye(P, v, 19, 13, 6, W_, BLK, dk)
        P.rect(14, 15, 4, 6, sh); P.vl(15, 15, 5, hi); P.px(13, 20, dk); P.px(18, 20, dk); P.hl(14, 21, 4, dk)   # a long straight nose
        P.vl(9, 17, 7, sh); P.vl(22, 16, 7, sh); P.vl(10, 18, 4, dk)   # hard lines down the cheeks
        if v == 0: P.hl(11, 23, 8, dk); P.hl(19, 22, 3, dk); P.px(22, 21, dk); P.hl(13, 24, 6, W_); P.px(23, 22, sh)   # a one-sided smirk, a flash of teeth
        elif v == 1: mouth_hurt(P, 11, 22, 10, dk, W_)
        else: mouth_ko(P, 12, 22, 8, dk, TONGUE)
        P.rect(3, 26, 26, 6, sh); P.grain(sh, '#9a6c54', 0.3, 9, 3, 26, 26, 6)   # under the jaw (the jaw itself is a box)
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sv); hd.checker(0, 0, 16, 12, svd); hd.rect(0, 0, 16, 3, Cr); hd.hl(0, 2, 16, N); hd.rect(0, 12, 16, 4, sk); hd.hl(0, 15, 16, sh)
    cr = S.at('X1'); cr.fill(Cr); cr.grain(Cr, Crh, 0.08, 2)   # the crown: a cattleman's pinch, a navy band with a gold sunburst concho
    cr.map(['#            #', ' #          # ', '  #   ##   #  ', '   ###  ###   '], {'#': Crd}, 1, 0); cr.vl(7, 4, 6, Crd)
    cr.rect(0, 11, 16, 4, N); cr.hl(0, 11, 16, Nh); sunburst(cr, 7.5, 12.6, 2.6, G, Gd); cr.hl(0, 15, 16, Crd)
    cr.px(13, 12, G); cr.px(2, 13, G)
    swatch(S, 0, Crd); S.rect(49, 113, 2, 2, Cr)
    br = S.at('X2'); br.fill(Cr); br.grain(Cr, Crh, 0.1, 3); br.outline(0, 0, 16, 16, N); br.outline(1, 1, 14, 14, Crd)   # the brim, bound in navy
    jw = S.at('X3'); jw.fill(sk); jw.vl(0, 0, 16, sh); jw.vl(15, 0, 16, sh); jw.hl(0, 15, 16, sh)   # the jaw: square, cleft, a blue shadow of stubble
    jw.grain(sk, '#c49a84', 0.35, 4, 0, 6, 16, 10); jw.vl(7, 9, 5, dk); jw.vl(8, 9, 5, sh); jw.hl(4, 2, 8, hi)
    Gy, Gyd, Gyh = '#ece4d2', '#b4a890', WH   # an ivory western suit (the white hat's suit), navy yokes piped red, a navy shirt
    def suit(P, k): P.fill(Gy); P.grain(Gy, Gyh, 0.06, k); P.grain(Gy, Gyd, 0.03, k + 50)
    t = S.at('TA'); suit(t, 5)   # the suit: navy western yokes, a navy shirt, the bolo tie's gold cords and sunburst slide, a gold flag pin
    t.map(['YYYYYWSSSSWYYYYY', 'YYYYYrWSSWrYYYYY', 'rYYYrGSSSSGrYYYr', 'GrrrGGSSSSGGrrrG', 'GGGGGGSSSSGGGGGG', 'GGGGGGGSSGGGGGGG', 'GGGGGGGSSGGGGGGG'], {'Y': N, 'r': Gd, 'W': W_, 'S': R, 'G': None}, 0, 0)
    t.px(8, 2, Rh); t.px(7, 5, Rd)   # a red western shirt
    t.vl(7, 1, 8, Gd); t.vl(8, 1, 8, Gd); t.px(7, 9, Gh); t.px(8, 9, Gh)   # the cords, gold tips
    sunburst(t, 7.5, 3.5, 2.4, G, Gd); t.px(7, 3, Gh)   # the slide
    t.rect(2, 6, 3, 2, N); t.px(2, 6, Gd); t.px(3, 6, G); t.hl(2, 7, 3, R); t.px(4, 6, W_)   # the flag pin: navy and gold over red and white
    t.map(['#   #', ' # # ', '  #  '], {'#': N}, 10, 7)   # a smile pocket, piped navy
    for y in (11, 14): t.px(7, y, N)
    t.vl(7, 10, 6, Gyd)
    b = S.at('TA_B'); suit(b, 6)   # the back: a pointed navy yoke piped red, a gold sunburst stitched in it, a centre seam
    b.map(['YYYYYYYYYYYYYYYY', 'YYYYYYYGYYYYYYYY', 'rYYYYYGGGYYYYYYr', ' rrYYYYGYYYYYrr ', '   rrYYYYYYrr   ', '     rrYYrr     ', '       rr       '], {'Y': N, 'r': Gd, 'G': G}, 0, 0)
    b.rect(5, 0, 6, 1, Nd); b.vl(7, 7, 9, Gyd)
    s_ = S.at('TA_S'); suit(s_, 7); s_.rect(0, 0, 16, 3, N); s_.hl(0, 3, 16, Gd); s_.vl(7, 4, 12, Gyd)
    sk2 = S.at('X12'); suit(sk2, 8); sk2.vl(7, 2, 14, Gyd); sk2.vl(8, 2, 14, Gyh); sk2.rect(10, 5, 4, 1, Gyd)   # the jacket's skirt, a pocket flap
    sk2.rect(0, 0, 16, 2, Td); sk2.rect(5, 0, 6, 2, G); sk2.hl(5, 0, 6, Gh); sk2.vl(0, 0, 16, Gyh)   # the belt, a big gold buckle
    tb = S.at('TB'); limb(tb, N, Nh, Nd); tb.rect(0, 0, 16, 3, Td); tb.rect(5, 0, 6, 3, G); tb.rect(6, 1, 4, 1, Gd); tb.hl(5, 0, 6, Gh)   # navy trousers, the buckle
    u = S.at('X6'); limb(u, Gy, Gyh, Gyd); u.rect(0, 0, 16, 3, N); u.hl(0, 3, 16, Gd)   # the yoke over his shoulders
    f = S.at('X7'); limb(f, Gy, Gyh, Gyd); f.rect(0, 9, 16, 2, N); f.rect(0, 11, 16, 2, W_); f.px(9, 11, G); f.rect(0, 13, 16, 3, sk)   # navy cuffs, a gold cufflink
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi); hn.rect(3, 11, 3, 2, G)   # a signet ring
    th = S.at('X9'); limb(th, N, Nh, Nd); th.vl(7, 0, 16, Nd); th.vl(1, 0, 16, R)   # navy trousers, a red welt down the side
    sn = S.at('X10'); limb(sn, N, Nh, Nd); sn.vl(7, 0, 9, Nd); sn.vl(1, 0, 9, R); sn.rect(0, 9, 16, 7, T); sn.hl(0, 9, 16, Th)   # tan boots under the cuffs
    sn.map(['#   #   #   #   ', ' # # # # # # # #', '  #   #   #   # '], {'#': Th}, 0, 11); sn.vl(15, 9, 7, Td)
    fo = S.at('X11'); shoe(fo, T, Th, Td, Td); fo.map(['  #  #  ', ' # ## # ', '#      #'], {'#': Th}, 4, 3)   # stitched toes
    swatch(S, 15, sk)
    remap(S, {'#9a6c54': sh, '#3a5a7a': Nh, '#4a3a34': dk, '#8a6a58': sh})
    return S.save('assets/tex/sheet_agent.png', 32)

if __name__ == '__main__':
    import sys
    only = sys.argv[1:]
    for f in (cadet, sodajerk, linebacker, agent):
        if not only or f.__name__ in only: print(f.__name__, f(), 'colours')
