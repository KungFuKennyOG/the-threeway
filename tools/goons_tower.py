"""Paints the Tower of Labor's goons (64x128 sheets, the layout in src/characters.js and tools/goonkit.py): the Ministry militiaman,
the inspector, the clerk, the Chairman's bodyguard, Inspector Vera Orlova, the Chairman; plus Orlova's baton.
All invented people. Each is a character with one loud signature (docs/goon-style.md); the panel layout is goon()'s
(see tools/goons_palace.py). Run from the repo root: python3 tools/goons_tower.py"""
from goonkit import Sheet, Pane, panel, swatch, H, cog, star5, medal, faces3, eye, mouth_hurt, mouth_ko, bevel, remap
from goons_palace import limb, skin_face, bare_hand, shoe

W_, Wd_, BLK = '#f4f1ea', '#c8c2b8', '#141014'
G, Gd, Gh, R, Rd = '#f2c14e', '#b88a2a', '#fff0b0', '#b8231e', '#7a1612'

def fur(P, base, dark, hi, k):   # astrakhan / sheepskin: curls of light and dark
    P.fill(base); P.grain(base, dark, 0.35, k); P.grain(base, hi, 0.25, k + 1)
    for y in range(0, 16, 3):
        for x in range((y // 3) % 2 * 2, 16, 4): P.px(x, y, hi); P.px(x + 1, y + 1, dark)

# =============================================================== the Ministry militiaman
# SIGNATURE: a huge fur ushanka with the flaps sticking out. TA the tunic (and the barrel chest), X1 the hat's crown, X2 its flaps
# and top, X3 the turned-up front flap with its badge, X4 the walrus moustache
def militia():
    S = Sheet()
    sk, sh, dk, hi, nose, hr = '#dca884', '#b8846a', '#704436', '#f2c4a0', '#d8645a', '#6a5644'
    F, Fd, Fh = '#6a5038', '#3a2a1c', '#a0805c'
    U, Ud, Uh, L, Ld, Lh, K, Kh = '#4e5e7e', '#323e58', '#7284a6', '#7a4a28', '#4a2c18', '#a86c3c', '#141014', '#5a6070'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 5, Fd); P.rect(0, 0, 3, 16, Fd); P.rect(29, 0, 3, 16, Fd)
        l = -1 if v == 1 else 0
        P.rect(5, 8 + l, 9, 3, hr); P.rect(18, 8 + l, 9, 3, hr); P.px(4, 9 + l, hr); P.px(27, 9 + l, hr)   # bushy brows
        if v == 0:
            for x0 in (8, 19): P.hl(x0, 12, 5, dk); P.rect(x0, 13, 5, 2, W_); P.rect(x0 + 2, 13, 2, 2, BLK)
        else: eye(P, v, 8, 12, 5, W_, BLK, dk); eye(P, v, 19, 12, 5, W_, BLK, dk)
        P.disc(15.5, 18, 3.3, nose); P.px(14, 16, '#f0a090'); P.rect(13, 20, 6, 1, '#a83a34')   # a drinker's red nose
        P.disc(5, 19, 2, '#e88a74'); P.disc(26, 19, 2, '#e88a74')
        P.map(['  ############  ', ' ############## ', '################', '################', '####  ####  ####', '###    ##    ###', '##            ##'], {'#': hr}, 8, 21)   # walrus moustache
        if v == 1: mouth_hurt(P, 11, 26, 10, dk, W_, 3)
        elif v == 2: mouth_ko(P, 12, 26, 8, dk, '#c84858')
        else: P.hl(12, 27, 8, dk)
        for (x, y) in ((6, 28), (9, 29), (22, 29), (25, 28), (12, 30), (19, 30)): P.px(x, y, sh)
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 10, '#4a3a2c'); hd.rect(0, 13, 16, 3, sh)
    fur(S.at('X1'), F, Fd, Fh, 2); fur(S.at('X2'), F, Fd, Fh, 4)
    x3 = S.at('X3'); fur(x3, F, Fd, Fh, 6); x3.disc(7.5, 8, 4.5, Gd); x3.disc(7.5, 8, 3.8, R); cog(x3, 7.5, 8, 2.8, G, Gd, R)   # the badge
    m = S.at('X4'); m.fill(hr)
    for x in range(0, 16, 2): m.vl(x, 4, 12, '#8a7660')
    m.hl(0, 0, 16, '#4a3a2c'); m.hl(0, 15, 16, '#3a2c20')
    t = S.at('TA'); t.fill(U); t.grain(U, Uh, 0.05, 3)   # the tunic: red tabs, brass buttons, pockets, the Sam Browne strap
    t.rect(4, 0, 8, 2, Ud); t.rect(4, 0, 2, 2, R); t.rect(10, 0, 2, 2, R); t.rect(0, 0, 3, 3, R); t.rect(13, 0, 3, 3, R)
    t.vl(7, 2, 14, Ud)
    for y in (3, 6, 9, 12): t.px(8, y, G)
    t.outline(1, 4, 5, 4, Ud); t.hl(1, 4, 5, Uh); t.px(3, 5, G); t.outline(10, 4, 5, 4, Ud); t.hl(10, 4, 5, Uh); t.px(12, 5, G)
    for i in range(16): t.px(15 - i, i, L); t.px(14 - i, i, Ld) if i < 15 else None
    t.rect(0, 13, 16, 3, L); t.hl(0, 13, 16, Lh); t.rect(6, 13, 4, 3, G); t.rect(7, 14, 2, 1, Gd)
    b = S.at('TA_B'); b.fill(U); b.grain(U, Uh, 0.05, 4); b.rect(4, 0, 8, 2, Ud); b.vl(7, 2, 11, Ud)
    for i in range(13): b.px(i, i, L)
    b.rect(0, 13, 16, 3, L); b.hl(0, 13, 16, Lh)
    s_ = S.at('TA_S'); s_.fill(U); s_.grain(U, Uh, 0.05, 5); s_.vl(7, 0, 13, R); s_.rect(0, 13, 16, 3, L)
    tb = S.at('TB'); tb.fill(U); tb.rect(0, 0, 16, 3, L); tb.rect(6, 0, 4, 3, G); tb.vl(7, 3, 13, Ud)
    u = S.at('X6'); limb(u, U, Uh, Ud); u.vl(7, 0, 16, R); u.map(['R      R', ' R    R ', '  R  R  ', '   RR   '], {'R': G}, 4, 5)
    f = S.at('X7'); limb(f, U, Uh, Ud); f.rect(0, 11, 16, 3, R); f.hl(0, 14, 16, Ud)
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi); hn.grain(sk, '#8a6a58', 0.06, 9)   # hairy knuckles
    th = S.at('X9'); limb(th, U, Uh, Ud); th.vl(7, 0, 16, R); th.vl(8, 0, 16, R)
    sn = S.at('X10'); sn.fill(K); sn.vl(3, 0, 16, Kh); sn.vl(4, 3, 10, '#8a90a0'); sn.hl(0, 0, 16, U); sn.hl(0, 15, 16, '#000000')
    fo = S.at('X11'); shoe(fo, K, Kh, '#000000', '#2a2a2a')
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_militia.png', 32)

# =============================================================== the inspector
# SIGNATURE: the clipboard up like a shield and a long flaring trench coat. X1/X2 the coat's skirt, X3 its storm collar,
# SW(3) the long nose, X5 the cap's front, TD its sides, SW(1) top, SW(0) visor, X12 + SW(2) the clipboard
def inspector():
    S = Sheet()
    sk, sh, dk, hi, hr = '#ecc6a6', '#c49a7c', '#7a5040', '#fde0c8', '#241e1a'
    T, Td, Th, Tk = '#a8945e', '#76683e', '#ccb880', '#4e4428'
    C, Cd, B, Bd = '#4e5e7e', '#323e58', '#2a50b0', '#183070'
    fr, lens = '#c8a850', '#d8eef8'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 5, B); P.hl(0, 4, 32, BLK); P.rect(0, 5, 32, 3, hr); P.rect(0, 5, 3, 12, hr); P.rect(29, 5, 3, 12, hr)
        P.hl(9, 7, 23, '#4a403a'); P.px(8, 6, sk)   # a severe side part
        l = -1 if v == 1 else 0
        P.hl(6, 11, 7, hr); P.px(5, 12, hr); P.map(['   ###', ' ##   ', '#     '], {'#': hr}, 19, 8 + l)   # one brow arched in disdain
        for x0 in (5, 18):   # big round wire spectacles
            P.map([' ffffff ', 'f      f', 'f      f', 'f      f', 'f      f', ' ffffff '], {'f': fr}, x0, 11)
        P.hl(13, 13, 5, fr)
        if v == 0:
            P.rect(7, 13, 4, 2, W_); P.rect(20, 13, 4, 2, W_); P.rect(8, 14, 2, 1, BLK); P.rect(21, 14, 2, 1, BLK); P.hl(7, 12, 4, dk); P.hl(20, 12, 4, dk)
            P.px(6, 12, lens); P.px(19, 12, lens)
        else: eye(P, v, 7, 13, 4, W_, BLK, dk); eye(P, v, 20, 13, 4, W_, BLK, dk)
        P.vl(15, 15, 6, sh); P.vl(16, 16, 5, hi)
        P.vl(5, 19, 6, sh); P.vl(26, 19, 6, sh)   # sunken cheeks
        P.hl(11, 22, 10, hr); P.px(15, 22, sk); P.px(16, 22, sk)   # a pencil moustache
        if v == 0: P.hl(13, 25, 6, dk); P.px(12, 24, dk); P.hl(14, 26, 4, sh)   # prim, pursed
        elif v == 1: mouth_hurt(P, 11, 24, 10, dk, W_)
        else: mouth_ko(P, 12, 24, 8, dk, '#c84858')
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 3, B); hd.hl(0, 3, 16, BLK); hd.rect(0, 4, 16, 6, hr); hd.rect(0, 13, 16, 3, sh); hd.px(12, 8, fr); hd.px(13, 8, fr)
    swatch(S, 3, sk); S.rect(60, 112, 4, 1, hi)
    cf = S.at('X5'); cf.fill(C); cf.grain(C, '#5e6e8e', 0.08, 2); cf.rect(0, 11, 16, 5, B); cf.hl(0, 11, 16, G); cf.hl(0, 15, 16, Bd); cog(cf, 7.5, 6, 3, G, Gd, C)
    cs = S.at('TD'); cs.fill(C); cs.grain(C, '#5e6e8e', 0.08, 3); cs.rect(0, 11, 16, 5, B); cs.hl(0, 11, 16, G); cs.hl(0, 15, 16, Bd)
    swatch(S, 1, C); swatch(S, 0, BLK)
    k = S.at('X1'); k.fill(T); k.grain(T, Th, 0.06, 4)   # the trench's front skirt: the belt, a split, two rows of buttons
    k.rect(0, 0, 16, 3, Td); k.hl(0, 0, 16, Th); k.outline(6, 0, 4, 3, G); k.vl(8, 3, 13, Tk); k.vl(9, 3, 13, Th)
    for y in (5, 9): k.px(5, y, Tk); k.px(11, y, Tk)
    for i in range(12): k.px(2 + (i % 3 == 0), 4 + i, Td); k.px(13 - (i % 3 == 0), 4 + i, Td)
    k.hl(0, 15, 16, Td)
    kb = S.at('X2'); kb.fill(T); kb.grain(T, Th, 0.06, 5); kb.rect(0, 0, 16, 3, Td); kb.hl(0, 0, 16, Th); kb.vl(7, 3, 13, Tk); kb.vl(4, 4, 11, Td); kb.vl(11, 4, 11, Td); kb.hl(0, 15, 16, Td)
    sc = S.at('X3'); sc.fill(T); sc.hl(0, 0, 16, Th); sc.rect(0, 8, 16, 8, Td); sc.stitch(0, 2, 16, Tk)
    t = S.at('TA'); t.fill(T); t.grain(T, Th, 0.06, 6)   # the trench's front: big lapels, epaulettes, buttons, a pen, the belt
    t.map(['TTTTwwwwwwwwTTTT', 'TTTLLwwkkwwLLTTT', 'TTTLLLwkkwLLLTTT', 'TTTTLLLkkLLLTTTT', 'TTTTTLLLLLLTTTTT'], {'T': T, 'w': W_, 'k': BLK, 'L': Th}, 0, 0)
    t.rect(0, 0, 3, 2, Td); t.rect(13, 0, 3, 2, Td); t.px(1, 0, G); t.px(14, 0, G)
    for y in (6, 9): t.px(4, y, Tk); t.px(11, y, Tk)
    t.vl(12, 4, 3, R); t.px(12, 3, G)   # a red pen in the breast pocket
    t.rect(0, 12, 16, 3, Td); t.hl(0, 12, 16, Th); t.outline(6, 12, 4, 3, G); t.hl(0, 15, 16, Tk)
    b = S.at('TA_B'); b.fill(T); b.grain(T, Th, 0.06, 7); b.rect(0, 0, 16, 5, Th); b.hl(0, 5, 16, Td); b.vl(7, 6, 6, Td); b.rect(0, 12, 16, 3, Td); b.px(3, 13, G); b.px(12, 13, G)
    s_ = S.at('TA_S'); s_.fill(T); s_.grain(T, Th, 0.06, 8); s_.vl(7, 0, 12, Td); s_.rect(0, 12, 16, 3, Td)
    tb = S.at('TB'); tb.fill(T); tb.rect(0, 0, 16, 3, Td)
    u = S.at('X6'); limb(u, T, Th, Td); u.grain(T, Th, 0.06, 9)
    f = S.at('X7'); limb(f, T, Th, Td); f.rect(0, 9, 16, 2, Td); f.rect(10, 8, 3, 4, G); f.rect(0, 13, 16, 3, W_)
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi)
    th = S.at('X9'); limb(th, '#5a5a62', '#7a7a84', '#3a3a42'); th.vl(7, 0, 16, '#7a7a84')
    sn = S.at('X10'); limb(sn, '#5a5a62', '#7a7a84', '#3a3a42'); sn.rect(0, 13, 16, 3, BLK)
    fo = S.at('X11'); shoe(fo, BLK, '#4a4a58', '#000000', '#2a2a2a')
    cb = S.at('X12'); cb.fill('#7a4a28'); cb.rect(1, 2, 14, 13, W_)   # the clipboard: a closure order, stamped in red
    cb.rect(5, 0, 6, 3, '#9a9aa6'); cb.hl(6, 0, 4, '#d0d0da')
    for y in (4, 6, 8, 12, 13): cb.hl(2, y, 9 if y % 4 else 11, '#7a7a84')
    cb.outline(7, 7, 7, 5, R); cb.hl(8, 9, 5, R); cb.px(13, 13, R)
    swatch(S, 2, '#7a4a28'); S.rect(56, 112, 4, 1, '#a86c3c')
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_inspector.png', 32)

# =============================================================== the clerk
# SIGNATURE: a tower of files hugged to his belly and a giant rubber stamp raised like a hammer. X1 the green eyeshade,
# X2/X3/X4 the files, SW(0) a loose sheet, SW(1) the stamp's handle, X5 its pad, SW(4) its red ink
def clerk():
    S = Sheet()
    sk, sh, dk, hi, hr = '#f0c8a8', '#cc9c80', '#7a5040', '#fff0e0', '#9a8a78'
    V, Vd, Vh, sw, swh = '#2aa860', '#16683a', '#8ae8a8', '#a8e0ff', '#ffffff'
    Wc, Wcd, Br, Brd, Brh, Gy, Gyd = '#f4f1ea', '#c8c2b8', '#6a4a30', '#40281a', '#8e6a48', '#5a5a62', '#3a3a42'
    Mn, Mnd, Bl = '#e0c890', '#b0965a', '#2a50b0'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(4, 1, 6, 2, hi); P.px(11, 2, hi)   # the bald dome's shine
        for (y, x0) in ((3, 6), (4, 4), (5, 7)): P.hl(x0, y, 20, hr)   # three strands combed over
        P.rect(0, 6, 32, 3, V); P.hl(0, 6, 32, Vh); P.hl(0, 8, 32, Vd)   # the eyeshade's band
        P.rect(0, 9, 3, 9, hr); P.rect(29, 9, 3, 9, hr)
        l = -1 if v == 1 else 0
        P.map(['    ##', '  ##  ', '##    '], {'#': hr}, 6, 10 + l); P.map(['##    ', '  ##  ', '    ##'], {'#': hr}, 20, 10 + l)   # brows up in the middle: worried
        if v == 0:
            for x0 in (7, 20): P.rect(x0, 13, 5, 4, W_); P.hl(x0, 12, 5, dk); P.rect(x0 + 3, 14, 1, 2, BLK)   # eyes wide, darting sideways
        else: eye(P, v, 7, 13, 5, W_, BLK, dk); eye(P, v, 20, 13, 5, W_, BLK, dk)
        P.map(['######  ######', '#    #  #    #', ' #### ## #### '], {'#': '#3a2a20'}, 9, 17)   # half-moon glasses on the end of his nose
        P.rect(14, 15, 4, 5, sh); P.px(15, 16, hi)
        for (x, y) in ((4, 10), (27, 12), (26, 14)): P.px(x, y, sw); P.px(x, y + 1, sw); P.px(x, y - 1, swh)   # sweat
        P.px(3, 18, sw); P.px(3, 19, sw); P.px(28, 20, sw); P.px(28, 21, sw)
        if v == 0:   # a nervous, wobbly grin; buck teeth
            P.map(['#  #  #  #  #', ' ## ## ## ## '], {'#': dk}, 10, 23); P.rect(14, 25, 4, 2, W_); P.vl(15, 25, 2, Wcd); P.hl(13, 27, 6, dk)
        elif v == 1: mouth_hurt(P, 11, 23, 10, dk, W_)
        else: mouth_ko(P, 12, 23, 8, dk, '#c84858')
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 3, 16, 3, V); hd.hl(0, 3, 16, Vh); hd.rect(0, 6, 16, 5, hr); hd.grain(hr, '#c8bcb0', 0.2, 2, 0, 6, 16, 5)
    hd.px(4, 1, hi); hd.px(5, 1, hi); hd.rect(0, 13, 16, 3, sh); hd.px(10, 11, sw); hd.px(10, 12, sw)
    vi = S.at('X1'); vi.fill(V)   # the eyeshade's bill: green celluloid, light through it
    for x in range(1, 16, 3): vi.vl(x, 0, 16, Vh)
    vi.hl(0, 0, 16, Vd); vi.hl(0, 15, 16, Vd)
    fs = S.at('X2'); cols = [Mn, Wc, R, Wc, Mn, Bl, Wc, Mn, Mnd, Wc, R, Mn, Wc, Bl, Mn, Wc]   # the files: a tower of folder edges
    for y, c in enumerate(cols): fs.hl(0, y, 16, c)
    for y in (1, 6, 9, 15): fs.px(3 + y % 5, y, BLK)
    fs.rect(10, 4, 4, 2, W_); fs.outline(10, 3, 4, 3, Mnd); fs.vl(0, 0, 16, Mnd)   # a label tab
    fs.px(13, 10, W_); fs.px(14, 10, W_)
    fs2 = S.at('X3')
    for y, c in enumerate(cols[::-1]): fs2.hl(0, y, 16, c)
    fs2.vl(15, 0, 16, Mnd)
    ft = S.at('X4'); ft.fill(Wc)   # the top sheet: typed lines and a red stamp
    for y in (2, 4, 6, 8, 10): ft.hl(2, y, 10 if y % 4 else 12, '#7a7a84')
    ft.outline(8, 9, 7, 5, R); ft.hl(9, 11, 5, R); ft.outline(0, 0, 16, 16, Wcd)
    swatch(S, 0, Wc); S.rect(49, 113, 2, 1, '#7a7a84'); swatch(S, 1, '#8a5a30'); S.rect(52, 112, 1, 4, '#b07a48')
    pd = S.at('X5'); pd.fill('#8a5a30'); pd.rect(0, 0, 16, 4, '#b07a48'); pd.rect(0, 9, 16, 3, G); pd.hl(0, 9, 16, Gh); pd.rect(0, 12, 16, 4, '#2a2a30'); pd.hl(0, 15, 16, R)
    swatch(S, 4, R); S.rect(48, 117, 4, 1, '#ff5a4a')
    t = S.at('TA'); t.fill(Br); t.grain(Br, Brh, 0.08, 3)   # a brown waistcoat over a white shirt, a black tie, pens, a watch chain
    t.map(['WWWWWWWWWWWWWWWW', 'WWWWWWWkkWWWWWWW', 'BBWWWWWkkWWWWWBB', 'BBBWWWWkkWWWWBBB', 'BBBBWWWkkWWWBBBB', 'BBBBBWWkkWWBBBBB', 'BBBBBBWkkWBBBBBB', 'BBBBBBBkkBBBBBBB'], {'W': Wc, 'k': BLK, 'B': Br}, 0, 0)
    for y in (9, 11, 13): t.px(7, y, G)
    t.vl(12, 6, 3, R); t.vl(13, 6, 3, Bl); t.hl(11, 9, 4, Brd)   # pens
    for i in range(5): t.px(3 + i, 11 + (i % 2), G)   # the watch chain
    t.px(2, 6, '#1a1a40'); t.px(3, 7, '#1a1a40')   # an ink blot
    t.hl(0, 15, 16, Brd); t.px(6, 15, Br); t.px(9, 15, Br)
    b = S.at('TA_B'); b.fill('#8a8a94'); b.grain('#8a8a94', '#b0b0ba', 0.12, 4); b.rect(0, 0, 16, 3, Wc); b.rect(4, 9, 8, 2, Brd); b.rect(7, 9, 2, 2, G); b.hl(0, 15, 16, '#5a5a62')   # satin back, the buckle strap
    s_ = S.at('TA_S'); s_.fill(Br); s_.grain(Br, Brh, 0.08, 5); s_.rect(0, 0, 16, 4, Wc); s_.vl(7, 4, 12, Brd)
    tb = S.at('TB'); tb.fill(Gy); tb.rect(0, 0, 16, 3, Brd); tb.rect(7, 0, 2, 3, G)
    for x in range(1, 16, 3): tb.vl(x, 3, 13, Gyd)
    u = S.at('X6'); limb(u, Wc, '#ffffff', Wcd); u.rect(0, 7, 16, 2, R); u.hl(0, 9, 16, Rd); u.vl(5, 0, 7, Wcd)   # shirtsleeves, red garters
    f = S.at('X7'); limb(f, Wc, '#ffffff', Wcd); f.rect(0, 10, 16, 3, Wcd); f.px(11, 11, G); f.rect(3, 4, 3, 2, '#1a1a40'); f.rect(0, 13, 16, 3, sk)   # cuffs, ink stain
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi)
    for nm in ('X9', 'X10'):
        th = S.at(nm); limb(th, Gy, '#7a7a84', Gyd)
        for x in range(1, 16, 3): th.vl(x, 0, 16, Gyd)
    S.at('X10').rect(0, 13, 16, 3, Brd)
    fo = S.at('X11'); shoe(fo, Brd, Br, '#1a1008', '#2a2a2a')
    swatch(S, 15, sk)
    remap(S, {'#1a1008': '#40281a', '#2a2a2a': '#2a2a30', '#1a1a40': '#2a2a30', '#3a2a20': '#40281a', '#ff5a4a': '#b8231e', '#fff0b0': '#f2c14e',
               '#b0b0ba': '#c8c2b8', '#c8bcb0': '#c8c2b8', '#8a8a94': '#7a7a84', '#7a1612': '#7a5040'})
    return S.save('assets/tex/sheet_clerk.png', 32)

# =============================================================== the Chairman's bodyguard
# SIGNATURE: refrigerator shoulders under a tiny head. TA the suit (the slab chest), X5/X1 the shoulders' front and sides,
# X2 the wraparound shades, X3 + SW(0) the flat-top, SW(1) the earpiece, SW(2) its cord
def bodyguard():
    S = Sheet()
    sk, sh, dk, hi, hr = '#d6a07c', '#ae785a', '#6a4030', '#efc49e', '#1a1614'
    K, Kh, Km, Kd = '#1e1e28', '#525266', '#2e2e3a', '#0c0c12'
    sh1, sh2 = '#08080c', '#7a8cb0'
    def fc(P, v):
        skin_face(P, sk, sh); P.rect(0, 24, 32, 6, sh); P.rect(2, 24, 28, 5, sk); P.rect(0, 26, 3, 6, dk); P.rect(29, 26, 3, 6, dk)   # a square slab of a jaw
        P.rect(0, 0, 32, 8, hr); P.rect(0, 0, 3, 14, hr); P.rect(29, 0, 3, 14, hr)
        l = -1 if v == 1 else 0
        P.rect(5, 10 + l, 22, 2, hr)
        if v != 2:   # wraparound shades (a box too); cracked when he's hurt
            P.rect(3, 12, 26, 6, sh1); P.hl(5, 13, 6, sh2); P.hl(19, 13, 6, sh2); P.hl(3, 12, 26, '#3a3a48')
            if v == 1: P.map(['#   ', ' # #', '  # '], {'#': '#ffffff'}, 20, 14)
        else: eye(P, 2, 8, 14, 5, W_, BLK, dk); eye(P, 2, 19, 14, 5, W_, BLK, dk); P.rect(18, 20, 12, 3, sh1)
        P.rect(14, 18, 4, 4, sh); P.px(13, 21, dk); P.px(18, 21, dk)
        if v == 0: P.hl(10, 25, 12, dk); P.hl(11, 26, 10, sh)   # a flat, bored line
        elif v == 1: mouth_hurt(P, 10, 24, 12, dk, W_)
        else: mouth_ko(P, 11, 24, 10, dk, '#c84858')
        P.vl(15, 28, 2, dk)
        for (x, y) in ((5, 23), (8, 27), (12, 29), (19, 29), (23, 27), (26, 23)): P.px(x, y, sh)
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 5, hr); hd.rect(0, 13, 16, 3, sh); hd.rect(0, 6, 16, 2, sh1)
    ft = S.at('X3'); ft.fill(hr); ft.grain(hr, '#4a4040', 0.2, 2); swatch(S, 0, hr)
    gl = S.at('X2'); gl.fill(sh1); gl.hl(0, 0, 16, '#3a3a48'); gl.hl(2, 5, 4, sh2); gl.hl(10, 5, 4, sh2); gl.px(3, 4, '#ffffff'); gl.px(11, 4, '#ffffff')
    swatch(S, 1, '#d8c8b0'); swatch(S, 2, '#ece4d4'); S.px(56, 113, '#b0a890'); S.px(58, 115, '#b0a890')
    t = S.at('TA'); t.fill(K); t.grain(K, Km, 0.15, 3)   # the suit: wide lit lapels, a white shirt, a long red tie, a gold pin, a pocket square
    t.map(['KKKKKWWWWWWKKKKK', 'KKKKKWWRRWWKKKKK', 'KKKKhKWRRWKhKKKK', 'KKKhKKWRRWKKhKKK', 'KKhKKKKRRKKKKhKK', 'KhKKKKKRRKKKKKhK', 'KKKKKKKRRKKKKKKK', 'KKKKKKKRRKKKKKKK', 'KKKKKKKRRKKKKKKK', 'KKKKKKKRRKKKKKKK',
           'KKKKKKKGGKKKKKKK', 'KKKKKKKRRKKKKKKK', 'KKKKKKKdKKKKKKKK', 'KKKKKKKdKKKKKKKK', 'KKKKKKKdKKKKKKKK', 'KKKKKKKdKKKKKKKK'], {'K': K, 'W': W_, 'R': R, 'h': Kh, 'G': G, 'd': Kd}, 0, 0)
    t.px(3, 5, G); t.rect(11, 6, 3, 1, W_); t.px(12, 5, W_); t.px(7, 13, '#5a5a6a'); t.px(7, 15, '#5a5a6a')
    b = S.at('TA_B'); b.fill(K); b.grain(K, Km, 0.15, 4); b.vl(7, 0, 16, Kd); b.hl(0, 0, 16, Kh); b.map(['h    h', ' h  h '], {'h': Kh}, 5, 3); b.vl(7, 11, 5, '#000000')
    s_ = S.at('TA_S'); s_.fill(K); s_.grain(K, Km, 0.15, 5); s_.vl(7, 0, 16, Kd)
    for nm, k in (('X1', 6), ('X5', 7)):
        p = S.at(nm); p.fill(K); p.grain(K, Km, 0.15, k); p.hl(0, 0, 16, Kh)
    S.at('X5').map(['  W    W  ', '  WW  WW  ', '   WRRW   ', '    RR    '], {'W': W_, 'R': R}, 3, 12)   # the shirt collar, the tie's knot
    S.at('X1').px(3, 6, '#ece4d4'); S.at('X1').px(4, 8, '#ece4d4'); S.at('X1').px(3, 10, '#ece4d4')   # the cord running down
    tb = S.at('TB'); tb.fill(K); tb.rect(0, 0, 16, 2, Kd); tb.rect(6, 0, 4, 2, '#9a9aa6')
    u = S.at('X6'); limb(u, K, Kh, Kd); u.grain(K, Km, 0.15, 8); u.hl(3, 6, 9, Kh)
    f = S.at('X7'); limb(f, K, Kh, Kd); f.grain(K, Km, 0.15, 9); f.rect(0, 12, 16, 2, W_); f.px(11, 12, G)
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi)
    th = S.at('X9'); limb(th, K, Kh, Kd); th.vl(7, 0, 16, Km); th.vl(8, 0, 16, Kh)
    sn = S.at('X10'); limb(sn, K, Kh, Kd); sn.vl(8, 0, 13, Kh); sn.rect(0, 13, 16, 3, BLK)
    fo = S.at('X11'); shoe(fo, BLK, '#6a7080', '#000000', '#2a2a2a'); fo.px(5, 2, '#a0a8b8')
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_bodyguard.png', 32)

# =============================================================== Inspector Vera Orlova
# SIGNATURE: a greatcoat flaring out like a bell under caped, fur-collared shoulders. X1/X2 the coat's skirt, X3 the cape,
# X4 the fur collar, X5 the cap's front, TD its sides, SW(1) top, SW(0) visor, X12 the bun, TC the red armband
def orlova():
    S = Sheet()
    sk, sh, dk, hi = '#f2ccb4', '#d2a08a', '#7a4a40', '#ffe4d4'
    P_, Pd, Ph, lip, liner = '#f0e2b8', '#c4b080', '#ffffff', '#d0102e', '#1a1018'
    C, Cd, Ch, F, Fh, K, Kh = '#5a6a8c', '#3a4866', '#8094b8', '#241c1a', '#5a4a44', '#121014', '#5a5a6e'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 4, R); P.hl(0, 4, 32, BLK)   # the cap's band
        P.rect(0, 5, 32, 3, P_); P.rect(0, 5, 4, 12, P_); P.rect(28, 5, 4, 12, P_); P.hl(4, 6, 24, Ph); P.vl(15, 5, 3, Pd)   # platinum, scraped back
        l = -1 if v == 1 else 0
        P.map(['  #####', ' #     ', '#      '], {'#': liner}, 5, 10 + l); P.map(['#####  ', '     # ', '      #'], {'#': liner}, 19, 8 + l)   # one brow raised, high
        if v == 0:   # narrow eyes, winged liner
            for x0, d in ((6, -1), (19, 1)):
                P.hl(x0, 13, 7, liner); P.px(x0 + (7 if d > 0 else -1), 12, liner); P.rect(x0 + 1, 14, 5, 1, W_); P.rect(x0 + 3, 14, 2, 1, '#3a6a9a'); P.hl(x0, 15, 7, sh)
        else: eye(P, v, 7, 13, 5, W_, BLK, dk); eye(P, v, 20, 13, 5, W_, BLK, dk)
        for i in range(4): P.px(5 + i, 19 + i, sh); P.px(26 - i, 19 + i, sh)   # cheekbones
        P.vl(15, 15, 5, sh); P.px(14, 19, dk); P.px(17, 19, dk)
        P.px(22, 21, '#4a2a24')   # a beauty mark
        if v == 0: P.map(['  #####   ', ' ######## ', '  #######  '], {'#': lip}, 11, 22); P.hl(13, 23, 6, '#8a0a20'); P.px(21, 22, lip)   # red lips, a smirk
        elif v == 1: mouth_hurt(P, 11, 22, 10, '#8a0a20', W_)
        else: mouth_ko(P, 12, 22, 8, '#8a0a20', '#e86070')
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(P_); hd.rect(0, 0, 16, 2, R); hd.hl(0, 2, 16, BLK)
    for y in (4, 7, 10): hd.hl(1 + y % 3, y, 12, Ph)
    for y in (5, 8, 11): hd.hl(0, y, 16, Pd)
    bn = S.at('X12'); bn.fill(P_)   # the bun: a tight coil
    for r_ in (6, 4, 2): bn.outline(8 - r_, 8 - r_, 2 * r_, 2 * r_, Pd)
    bn.px(5, 5, Ph); bn.px(9, 3, Ph); bn.rect(7, 7, 2, 2, '#9a8a60')
    cf = S.at('X5'); cf.fill(C); cf.grain(C, Ch, 0.06, 2)   # the cap: blue-grey, a red band, a big gold badge in a laurel
    cf.rect(0, 11, 16, 5, R); cf.hl(0, 11, 16, G); cf.hl(0, 15, 16, Rd)
    cf.disc(7.5, 5.5, 4.6, Gd); cf.disc(7.5, 5.5, 3.8, R); cog(cf, 7.5, 5.5, 2.8, G, Gd, R)
    for i in range(4): cf.px(1 + i, 8 + i // 2, G); cf.px(14 - i, 8 + i // 2, G)
    cs = S.at('TD'); cs.fill(C); cs.grain(C, Ch, 0.06, 3); cs.rect(0, 11, 16, 5, R); cs.hl(0, 11, 16, G); cs.hl(0, 15, 16, Rd); cs.hl(0, 0, 16, Cd)
    swatch(S, 1, C); swatch(S, 0, BLK); S.rect(48, 115, 4, 1, G)
    def coat(P, k):
        P.fill(C); P.grain(C, Ch, 0.05, k)
    k = S.at('X1'); coat(k, 4)   # the greatcoat's front skirt: the belt, two rows of gold buttons, red-piped edges, a red hem
    k.rect(0, 0, 16, 3, BLK); k.outline(5, 0, 6, 3, G); k.vl(7, 3, 13, R); k.vl(8, 3, 13, Cd)
    for y in (5, 9): k.px(4, y, G); k.px(11, y, G)
    for x in (2, 13): k.vl(x, 4, 11, Cd)
    k.rect(0, 14, 16, 2, R); k.hl(0, 15, 16, Rd)
    kb = S.at('X2'); coat(kb, 5); kb.rect(0, 0, 16, 3, BLK); kb.vl(7, 3, 13, Cd); kb.vl(8, 3, 13, Ch); kb.px(5, 1, G); kb.px(10, 1, G)
    for x in (2, 4, 11, 13): kb.vl(x, 5, 9, Cd)
    kb.rect(0, 14, 16, 2, R)
    cp = S.at('X3'); coat(cp, 6)   # the cape: folds, gold-trimmed hem
    for x in (2, 6, 10, 14): cp.vl(x, 4, 10, Cd)
    for x in (3, 7, 11): cp.vl(x, 6, 8, Ch)
    cp.hl(0, 13, 16, R); cp.rect(0, 14, 16, 2, G); cp.hl(0, 15, 16, Gd)
    fr = S.at('X4'); fr.fill(F); fr.grain(F, Fh, 0.3, 7); fr.grain(F, '#3a302c', 0.3, 8)
    t = S.at('TA'); coat(t, 9)   # the greatcoat's chest: red facing, two rows of buttons, a medal bar
    t.rect(5, 0, 6, 2, R); t.vl(7, 0, 16, R); t.vl(8, 0, 16, Cd)
    for y in (3, 6, 9, 12): t.px(4, y, G); t.px(11, y, G)
    medal(t, 12, 2, (R, G), G, Gd); t.rect(1, 3, 3, 1, G); t.rect(1, 4, 3, 1, R)
    t.rect(0, 13, 16, 3, BLK); t.outline(5, 13, 6, 3, G)
    b = S.at('TA_B'); coat(b, 10); b.vl(7, 0, 13, Cd); b.rect(0, 13, 16, 3, BLK)
    s_ = S.at('TA_S'); coat(s_, 11); s_.vl(7, 0, 13, Cd); s_.rect(0, 13, 16, 3, BLK)
    tb = S.at('TB'); coat(tb, 12); tb.rect(0, 0, 16, 3, BLK)
    u = S.at('X6'); limb(u, C, Ch, Cd)
    ab = S.at('TC'); limb(ab, C, Ch, Cd); ab.rect(0, 4, 16, 6, R); ab.hl(0, 4, 16, G); ab.hl(0, 9, 16, G); cog(ab, 7.5, 6.5, 1.8, G)   # the armband
    f = S.at('X7'); limb(f, C, Ch, Cd); f.rect(0, 8, 16, 3, R); f.rect(0, 11, 16, 5, BLK); f.hl(0, 11, 16, Kh)   # red cuff, black gloves
    hn = S.at('X8'); bare_hand(hn, BLK, '#2a2a34', '#000000', Kh)
    th = S.at('X9'); limb(th, C, Ch, Cd); th.vl(7, 0, 16, R)
    sn = S.at('X10'); sn.fill(K); sn.vl(3, 0, 16, Kh); sn.vl(4, 2, 11, '#a0a8bc'); sn.hl(0, 0, 16, '#2a2a34'); sn.hl(0, 15, 16, '#000000')   # tall glossy boots
    fo = S.at('X11'); shoe(fo, K, Kh, '#000000', '#2a2a2a'); fo.px(4, 2, '#a0a8bc')
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_orlova.png', 32)

# =============================================================== the Chairman
# SIGNATURE: enormous eyebrows in a big jowly face under a fur hat. X1/X2 the belly (sash, medals), X4 the eyebrows, X5 + SW(0)
# the astrakhan hat with its red crown, X12 the jowls, SW(1) the nose
def chairman():
    S = Sheet()
    sk, sh, dk, hi, nose, spot = '#ecbaa2', '#c8907a', '#7a4a40', '#ffdcc8', '#e07a74', '#c8987e'
    Wg, Wgd = '#ece8e0', '#a8a49c'
    A, Ad, Ah = '#7a7a82', '#46464e', '#b0b0ba'
    Su, Sd, Sh = '#5c6658', '#3e463c', '#7c887a'
    B = '#2a50b0'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 4, Ad); P.rect(0, 0, 4, 16, Wg); P.rect(28, 0, 4, 16, Wg); P.grain(Wg, Wgd, 0.3, 2, 0, 0, 32, 16)   # white sideburns
        for y in (5, 7): P.hl(8, y, 16, sh)   # a furrowed forehead
        P.px(7, 6, spot); P.px(23, 4, spot); P.px(25, 8, spot)
        P.rect(4, 9, 11, 4, Wg); P.rect(17, 9, 11, 4, Wg); P.grain(Wg, Wgd, 0.3, 3, 4, 9, 24, 4)   # the eyebrows (boxes on top)
        if v == 0:   # small twinkling eyes, deep in folds
            for x0 in (8, 19): P.hl(x0, 14, 5, dk); P.rect(x0 + 1, 15, 3, 1, BLK); P.px(x0 + 1, 15, '#ffffff'); P.hl(x0, 16, 5, sh)
        else: eye(P, v, 8, 14, 5, W_, BLK, dk)
        if v: eye(P, v, 19, 14, 5, W_, BLK, dk)
        P.disc(15.5, 19, 3.5, nose); P.px(14, 17, '#ffb0a8')   # a big bulbous nose (a box too)
        for i in range(6): P.px(10 - i // 3, 19 + i, sh); P.px(21 + i // 3, 19 + i, sh)   # jowl lines
        if v == 0: P.hl(10, 25, 12, dk); P.px(9, 24, dk); P.px(22, 24, dk); P.hl(12, 26, 8, '#c86a6a')   # a pleased, wide smile
        elif v == 1: mouth_hurt(P, 10, 24, 12, dk, W_)
        else: mouth_ko(P, 11, 24, 10, dk, '#c84858')
        P.hl(6, 28, 20, sh); P.hl(8, 29, 16, sh)   # a double chin
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 3, Ad); hd.rect(0, 3, 16, 8, Wg); hd.grain(Wg, Wgd, 0.3, 4, 0, 3, 16, 8); hd.rect(0, 13, 16, 3, sh); hd.hl(2, 12, 12, sh)
    br = S.at('X4'); br.fill(Wg)   # the eyebrows: wild white tufts
    for x in range(0, 16, 2): br.vl(x, (x * 3) % 5, 16 - (x * 3) % 5, Wgd)
    br.px(3, 0, '#ffffff'); br.px(9, 1, '#ffffff'); br.hl(0, 15, 16, Wgd)
    fur(S.at('X5'), A, Ad, Ah, 5); S.at('X5').hl(0, 15, 16, Ad)
    swatch(S, 0, R); S.rect(49, 112, 1, 4, G); S.rect(48, 113, 4, 1, G)   # the hat's red crown, crossed in gold
    jw = S.at('X12'); jw.fill(sk); jw.hl(0, 4, 16, sh); jw.hl(0, 10, 16, sh); jw.rect(0, 14, 16, 2, sh)
    swatch(S, 1, nose); S.px(53, 117, '#ffb0a8')
    def suit(P, k):
        P.fill(Su); P.grain(Su, Sh, 0.06, k)
    t = S.at('TA'); suit(t, 6)   # the chest: a stiff collar, a dark red tie, rows and rows of medals, the sash from his shoulder
    t.map(['SSSSSWWWWWWSSSSS', 'SSSSSWWrrWWSSSSS', 'SSSSSSWrrWSSSSSS'], {'S': Su, 'W': W_, 'r': '#7a1a24'}, 0, 0)
    for i in range(16): t.px(i, max(0, 15 - i), R); t.px(i, max(0, 16 - i), G) if i > 0 else None
    for y, cols in ((3, ((R, G), (B, W_), (G, R), (W_, B))), (8, ((G, B), (R, W_), (B, G)))):
        for i, rb in enumerate(cols): medal(t, 1 + i * 3, y, rb, G, Gd)
    star5(t, 10, 7, G)
    b = S.at('TA_B'); suit(b, 7); b.vl(7, 0, 16, Sd)
    for i in range(16): b.px(i, i, R); b.px(i, min(15, i + 1), G)
    s_ = S.at('TA_S'); suit(s_, 8); s_.rect(5, 0, 5, 16, R); s_.vl(5, 0, 16, G); s_.vl(9, 0, 16, G)
    bf = S.at('X1'); suit(bf, 9)   # the belly: the sash across, more medals cascading, buttons straining
    for i in range(16):
        for d in range(4): bf.px(i, (16 - i) - 6 + d, R) if 0 <= (16 - i) - 6 + d < 16 else None
        if 0 <= (16 - i) - 7 < 16: bf.px(i, (16 - i) - 7, G)
        if 0 <= (16 - i) - 2 < 16: bf.px(i, (16 - i) - 2, G)
    for y, x in ((0, 1), (0, 4), (5, 1)): medal(bf, x, y, (B, G), G, Gd)
    star5(bf, 1, 10, G)
    for y in (2, 6, 10, 14): bf.px(10, y, G)
    bf.hl(0, 15, 16, Sd)
    bs = S.at('X2'); suit(bs, 10)
    for i in range(16):
        for d in range(4): bs.px(i, (i + d) % 16, R)
        bs.px(i, (i + 4) % 16, G)
    tb = S.at('TB'); suit(tb, 11)
    u = S.at('X6'); limb(u, Su, Sh, Sd)
    f = S.at('X7'); limb(f, Su, Sh, Sd); f.rect(0, 10, 16, 3, Sd); f.px(4, 11, G); f.px(10, 11, G); f.rect(0, 13, 16, 3, sk)
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi); hn.rect(9, 11, 3, 2, G)   # a fat gold ring
    th = S.at('X9'); limb(th, Su, Sh, Sd); th.rect(6, 0, 4, 16, R)
    sn = S.at('X10'); limb(sn, Su, Sh, Sd); sn.rect(6, 0, 4, 13, R); sn.rect(0, 13, 16, 3, BLK)
    fo = S.at('X11'); shoe(fo, BLK, '#5a6070', '#000000', '#2a2a2a')
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_chairman.png', 32)

def props():
    # Orlova's baton (8x32, the bat's layout): black rubber (rows 0-21), a gold ferrule and a ribbed grip (rows 22-31)
    B = Sheet(8, 32); P = Pane(B, 0, 0)
    P.rect(0, 0, 8, 22, '#1e1c22'); P.rect(1, 0, 2, 22, '#3c3a44'); P.rect(0, 0, 8, 2, '#2c2a32')
    P.rect(0, 22, 8, 2, '#f2c14e'); P.rect(0, 24, 8, 8, '#141218')
    for y in (25, 27, 29): P.rect(0, y, 8, 1, '#2c2a32')
    B.save('assets/tex/baton.png')

if __name__ == '__main__':
    import sys
    only = sys.argv[1:]
    for f in (militia, inspector, clerk, bodyguard, orlova, chairman):
        if not only or f.__name__ in only: print(f.__name__, f(), 'colours')
    if not only or 'props' in only: props(); print('props ok')
