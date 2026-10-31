"""Paints the Palace of Sport and Parade Square goons (64x128 sheets, the layout in src/characters.js and tools/goonkit.py):
the sambo fighter, the gymnast, the weightlifter, the honour guard, the bandsman and the specialist; plus their props
(the flagpole, cymbal, drumstick) and the SWEPT! / DODGE! labels. Run from the repo root: python3 tools/goons_palace.py

Each goon is a character with one loud signature (docs/goon-style.md). The newer goons share one panel layout (goon() in
src/characters.js): upper arm X6, forearm X7, hand X8, thigh X9, shin X10 (boots painted on), foot X11, hips TB, neck SW(15),
head sides/back/top HEADS; their signature boxes use X1-X5, X12, TD and the swatches, listed per goon."""
from goonkit import Sheet, Pane, face, panel, swatch, sign, H, cog, star5, medal, faces3, eye, mouth_hurt, mouth_ko, bevel

def heads(S, rows, pal): panel(S, 'HEADS', rows, pal)
def hand(S, skin, shade, knuckle=None):   # TC rows 12-15: the bare hand under the sleeve (older layout, kept for other scripts)
    S.rect(32, 59, 16, 1, shade); S.rect(32, 60, 16, 4, skin); S.rect(32, 63, 16, 1, knuckle or shade)
def eight(S, x0, rows, pal):   # an 8-wide strip in the TD half panels (x0 = 48 for TD_L, 56 for TD_R)
    assert len(rows) == 16 and all(len(r) == 8 for r in rows)
    S.map(x0, 48, rows, pal)
def sleeve(S, rows, pal):     # TC rows 0-10
    assert len(rows) == 11 and all(len(r) == 16 for r in rows)
    S.map(32, 48, rows, pal)

# ---------------------------------------------------------------- shared bits for the flair pass
def limb(P, base, hi, lo, y=0, h=16):   # a limb face: lit left edge, shaded right
    P.rect(0, y, 16, h, base); P.vl(0, y, h, hi); P.vl(14, y, h, lo); P.vl(15, y, h, lo)
def skin_face(P, sk, sh, jaw=None):   # a 32x32 face of skin with rounded (shaded) sides and a shadow under the jaw
    P.rect(0, 0, 32, 32, sk); P.rect(0, 0, 2, 32, sh); P.rect(30, 0, 2, 32, sh); P.rect(2, 30, 28, 2, jaw or sh)
def bare_hand(P, sk, sh, dk, hi):   # X8: a fist, knuckles at the far end (rows 11-15)
    P.fill(sk); P.vl(0, 0, 16, hi); P.vl(15, 0, 16, sh); P.hl(0, 0, 16, sh)
    for x in (3, 7, 11): P.vl(x, 10, 6, sh)
    P.hl(0, 10, 16, sh); P.hl(0, 15, 16, dk)
    for x in (1, 5, 9, 13): P.rect(x, 12, 2, 1, hi)
def shoe(P, base, hi, lo, sole, lace=None):   # X11: the foot box (top and all sides): upper, a welt, the sole
    P.fill(base); P.hl(0, 0, 16, hi); P.vl(0, 0, 12, hi); P.rect(0, 11, 16, 1, lo); P.rect(0, 12, 16, 4, sole)
    if lace:
        for y in (2, 5, 8): P.rect(5, y, 6, 1, lace)

# =============================================================== the sambo fighter
# SIGNATURE: the kurtka's big flaring wings. X1 wings (quilted, white-stitched), X2 the kurtka's skirt and belt, X3 the belt's knot,
# X4 cauliflower ears, X5 high wrestling boots
def sambo():
    S = Sheet()
    sk, sh, dk, hi, hr, sc = '#e2aa82', '#b87a58', '#6a3a2a', '#f4c8a0', '#22160f', '#7a5440'
    R, Rd, Rh, Rk, W, Wd = '#cc2a20', '#8c1812', '#ee5a3e', '#5a0e0c', '#f4f1ea', '#c4bab0'
    B, Bd, Bh, T, Td, P_, Pd = '#2c56b8', '#16306e', '#5a86e0', '#ece4d0', '#b0a48c', '#8a5a8e', '#5e3a66'
    G = '#f2c14e'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 5, hr); P.checker(2, 0, 28, 5, sc, 0); P.grain(sc, hr, 0.5, 3, 0, 0, 32, 5)   # a buzz cut: scalp through the stubble
        for x in range(2, 30, 3): P.px(x, 5, hr)
        P.rect(0, 0, 3, 12, hr); P.rect(29, 0, 3, 12, hr)
        l = -1 if v == 1 else 0   # brows: thick, angry, a nick through the left one
        P.map(['####        ', ' #####      ', '   #####    ', '      ###   '], {'#': hr}, 4, 8 + l)
        P.map(['        ####', '      ##### ', '    #####   ', '   ###      '], {'#': hr}, 16, 8 + l)
        P.rect(8, 8 + l, 1, 3, sk); P.px(8, 7 + l, sc)
        eye(P, v, 7, 13, 5, W, '#141014', dk, look=1); eye(P, v, 20, 13, 5, W, '#141014', dk, look=-1)
        if v != 2: P.rect(19, 16, 7, 1, P_); P.rect(20, 17, 5, 1, Pd); P.px(26, 15, P_)   # a shiner
        P.rect(14, 13, 3, 7, sh); P.px(17, 15, sh); P.px(13, 18, sh)                    # a broken nose, kinked
        P.rect(11, 16, 10, 2, T); P.hl(11, 18, 10, Td); P.px(11, 16, Td); P.px(20, 17, Td)   # the tape across it
        P.rect(13, 20, 6, 1, dk); P.px(13, 19, dk); P.px(18, 19, dk)
        P.rect(4, 19, 4, 2, sh); P.rect(24, 19, 4, 2, sh)
        for (x, y) in ((7, 26), (10, 28), (13, 27), (18, 28), (21, 27), (24, 26), (16, 29), (6, 23), (25, 23)): P.px(x, y, sc)
        if v == 0:   # a lopsided scrappy grin, a tooth missing
            P.hl(10, 23, 12, dk); P.px(22, 22, dk); P.px(9, 24, dk)
            P.hl(11, 24, 10, W); P.rect(15, 24, 2, 1, dk); P.hl(11, 25, 10, dk); P.hl(13, 26, 6, sh)
        elif v == 1: mouth_hurt(P, 10, 23, 12, dk, W)
        else: mouth_ko(P, 11, 23, 10, dk, '#c84858')
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 9, hr); hd.checker(0, 0, 16, 9, sc, 1); hd.grain(sc, hr, 0.4, 4)
    for x in range(0, 16, 2): hd.px(x, 9, hr)
    hd.rect(0, 13, 16, 3, sh); hd.vl(7, 10, 3, sh)
    # X1: the wings: quilted red, diamond stitching, a white bound edge
    w = S.at('X1'); w.fill(R)
    for y in range(16):
        for x in range(16):
            if (x + y) % 6 == 0 or (x - y) % 6 == 0: w.px(x, y, Rd)
    w.grain(R, Rh, 0.12, 5); w.outline(0, 0, 16, 16, W); w.outline(1, 1, 14, 14, Wd); w.stitch(2, 2, 12, W)
    # TA: the kurtka's front: heavy weave, a crossover lapel bound in white, the club's cog patch
    t = S.at('TA'); t.fill(R); t.checker(0, 0, 16, 16, Rd, 0); t.grain(Rd, R, 0.55, 6); t.grain(R, Rh, 0.06, 7)
    t.map(['ssssss  ', ' sshss  ', '  shs   ', '   s    '], {'s': sk, 'h': sh}, 5, 0)
    for i in range(12): t.px(3 + i, i, W); t.px(4 + i, i, Wd); t.px(2 + i, i, Rk)
    for i in range(6): t.px(12 - i, i, W)
    t.disc(4, 9.5, 2.6, W); cog(t, 4, 9.5, 2.0, G, '#b88a2a', Rd)
    t.hl(0, 15, 16, Rd)
    for P_name in ('TA_B', 'TA_S'):
        b = S.at(P_name); b.fill(R); b.checker(0, 0, 16, 16, Rd, 1); b.grain(Rd, R, 0.55, 8); b.grain(R, Rh, 0.06, 9)
    b = S.at('TA_B')   # the back: the club's big emblem, a white circle, a gold cog, the number 7
    b.disc(7.5, 7.5, 6.2, W); b.disc(7.5, 7.5, 5.2, B); cog(b, 7.5, 7.5, 4.2, G, '#b88a2a', B)
    b.hl(0, 0, 16, Rd); b.stitch(0, 15, 16, W)
    s_ = S.at('TA_S'); s_.vl(7, 0, 16, Rk); s_.stitch(8, 1, 15, W, False)
    # X2: the skirt below the belt: the blue belt (rows 0-3), then red quilting, a white hem
    k = S.at('X2'); k.fill(R); k.checker(0, 4, 16, 10, Rd, 0); k.grain(Rd, R, 0.6, 10)
    k.rect(0, 0, 16, 4, B); k.hl(0, 0, 16, Bh); k.hl(0, 3, 16, Bd); k.stitch(0, 2, 16, W)
    k.rect(0, 13, 16, 3, W); k.hl(0, 15, 16, Wd); k.stitch(1, 14, 15, Wd)
    # X3: the belt's knot and its hanging ends
    n = S.at('X3'); n.fill(B); n.rect(0, 0, 16, 4, Bd); n.vl(7, 4, 12, Bd); n.vl(0, 0, 16, Bh); n.rect(0, 14, 16, 2, W); n.stitch(2, 6, 10, W, False); n.stitch(12, 6, 10, W, False)
    # X4: cauliflower ears: lumpy, battered
    e = S.at('X4'); e.fill(sk); e.disc(5, 5, 3, sh); e.disc(10, 10, 3.5, sh); e.disc(5, 5, 1.5, '#d88a70'); e.disc(11, 10, 2, '#d88a70'); e.px(4, 12, dk); e.px(12, 4, dk); e.hl(0, 15, 16, sh)
    # X5: high wrestling boots: blue, white laces criss-crossed, a red flash, white soles
    bt = S.at('X5'); bt.fill(B); bt.vl(0, 0, 16, Bh); bt.vl(15, 0, 16, Bd); bt.hl(0, 0, 16, W); bt.hl(0, 1, 16, Bd)
    for y in range(3, 13, 2): bt.px(6, y, W); bt.px(9, y, W); bt.px(7, y + 1, W); bt.px(8, y + 1, W)
    bt.rect(11, 3, 3, 9, R); bt.vl(12, 4, 7, Rh); bt.rect(0, 13, 16, 3, W); bt.hl(0, 15, 16, Wd)
    # TB: shorts under the skirt
    tb = S.at('TB'); tb.fill(B); tb.vl(7, 0, 16, Bd); tb.rect(0, 12, 16, 2, W)
    # limbs: kurtka sleeves to the forearm, taped wrists, taped fingers, bare legs, boots
    u = S.at('X6'); u.fill(R); u.checker(0, 0, 16, 16, Rd, 1); u.grain(Rd, R, 0.6, 11); u.vl(0, 0, 16, Rh); u.vl(15, 0, 16, Rk); u.stitch(0, 1, 16, W)
    f = S.at('X7'); f.fill(sk); f.rect(0, 0, 16, 7, R); f.checker(0, 0, 16, 7, Rd, 1); f.grain(Rd, R, 0.6, 12); f.rect(0, 6, 16, 2, W); f.hl(0, 8, 16, Wd)
    f.vl(0, 9, 7, hi); f.vl(15, 9, 7, sh); f.rect(0, 12, 16, 4, T); f.hl(0, 12, 16, Td); f.px(5, 14, Td); f.px(11, 13, Td)
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi)
    for x in (1, 5, 9, 13): hn.rect(x, 9, 2, 6, T); hn.px(x, 14, Td)   # taped fingers
    hn.rect(0, 0, 16, 4, T); hn.hl(0, 4, 16, Td)
    th = S.at('X9'); limb(th, sk, hi, sh); th.rect(0, 0, 16, 5, B); th.hl(0, 4, 16, W); th.hl(0, 5, 16, sh); th.px(5, 10, sh); th.px(10, 9, sh)
    sn = S.at('X10'); limb(sn, sk, hi, sh); sn.rect(3, 1, 9, 3, sh); sn.rect(4, 1, 7, 2, hi); sn.rect(0, 7, 16, 9, B); sn.hl(0, 7, 16, W)
    ft = S.at('X11'); shoe(ft, B, Bh, Bd, W, W)
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_sambo.png', 32)

# =============================================================== the gymnast
# SIGNATURE: a high ponytail flying out behind. SW(0) the scrunchie, X1 the ponytail, X2 the medal, X3 the collar, X4 leg warmers
def gymnast():
    S = Sheet()
    sk, sh, dk, hi = '#f4c8a8', '#d4987c', '#8a4e40', '#ffe2cc'
    K, Kh, Kd = '#1e1418', '#5a4660', '#0c080a'
    R, Rd, Rh, W, Wd, G, Gd = '#d42a24', '#8e1a18', '#f0604a', '#f4f1ea', '#c8c2b8', '#f2c14e', '#b88a2a'
    lip, shadow, blush = '#d42a48', '#3a7ad0', '#f08a8a'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 7, K); P.rect(0, 0, 4, 18, K); P.rect(28, 0, 4, 18, K)   # hair scraped back tight
        for x in (6, 12, 20, 26): P.px(x, 2, Kh); P.px(x + 1, 3, Kh)
        P.vl(15, 0, 6, Kd); P.map(['##      ##', ' #      # '], {'#': K}, 11, 7)   # the parting, two wisps
        l = -1 if v == 1 else 0
        P.map([' #### ', '#    #'], {'#': K}, 6, 9 + l); P.map([' #### ', '#    #'], {'#': K}, 20, 9 + l)   # high arched brows
        if v == 0:
            P.rect(6, 12, 7, 1, shadow); P.rect(19, 12, 7, 1, shadow)   # blue eyeshadow, 1986
            for x0 in (6, 19):   # big doe eyes with lashes and a highlight
                P.hl(x0, 13, 7, Kd); P.px(x0 - 1, 12, Kd); P.px(x0 + 7, 12, Kd)
                P.rect(x0, 14, 7, 3, W); P.rect(x0 + 2, 14, 3, 3, '#3a2a20'); P.rect(x0 + 3, 15, 1, 1, Kd); P.px(x0 + 2, 14, W)
        else:
            eye(P, v, 7, 13, 5, W, Kd, dk); eye(P, v, 20, 13, 5, W, Kd, dk)
        P.rect(15, 17, 2, 4, sh); P.px(14, 20, dk); P.px(17, 20, dk); P.px(15, 17, hi)
        P.disc(6.5, 21, 2.3, blush); P.disc(25.5, 21, 2.3, blush)
        for (x, y) in ((9, 19), (11, 20), (21, 20), (23, 19)): P.px(x, y, sh)   # freckles
        if v == 0:   # a big confident smile, red lips
            P.hl(11, 23, 10, lip); P.px(10, 22, lip); P.px(21, 22, lip); P.hl(12, 24, 8, W); P.hl(12, 25, 8, lip); P.hl(13, 26, 6, '#a81e36')
        elif v == 1: mouth_hurt(P, 11, 23, 10, '#7a1a2a', W)
        else: mouth_ko(P, 12, 23, 8, '#7a1a2a', '#e86070')
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(K)
    for y in range(0, 12, 3): hd.hl((y * 3) % 5, y, 9, Kh)
    hd.rect(0, 12, 16, 4, sh); hd.rect(4, 10, 8, 3, sh)
    p = S.at('X1'); p.fill(K)   # the ponytail: glossy strands, flying
    for x in (2, 5, 9, 12): p.vl(x, 0, 16, Kh)
    for x in (3, 7, 11, 14): p.vl(x, 2, 14, Kd)
    p.grain(K, Kh, 0.08, 3); p.hl(0, 0, 16, Kd)
    swatch(S, 0, G); S.rect(48, 113, 4, 1, Gd)
    m = S.at('X2'); m.fill(G); m.rect(0, 0, 16, 4, R); m.rect(6, 0, 4, 4, W)   # the medal: ribbon, then the gold disc with a cog
    m.disc(7.5, 9.5, 6, Gd); m.disc(7.5, 9.5, 5, G); cog(m, 7.5, 9.5, 3.4, '#ffe08a', Gd); m.px(4, 6, W)
    c = S.at('X3'); c.fill(R); c.hl(0, 0, 16, W); c.hl(0, 3, 16, G); c.hl(0, 5, 16, W); c.vl(7, 0, 16, Wd); c.vl(8, 0, 16, '#9a9aa6'); c.hl(0, 15, 16, Rd)
    t = S.at('TA'); t.fill(R); t.grain(R, Rh, 0.05, 4)   # tracksuit: a white and gold yoke, the medal's ribbon, a zip
    t.map(['WWGGWWWWWWWWGGWW', 'RWWGGWWWWWWGGWWR', 'RRWWGGWWWWGGWWRR', 'RRRWWGGWWGGWWRRR', 'RRRRWWGGGGWWRRRR'], {'W': W, 'G': G, 'R': R}, 0, 1)
    t.vl(7, 0, 16, '#9a9aa6'); t.vl(8, 0, 16, Wd)
    for i in range(7): t.px(4 + i // 2, i, R); t.px(11 - i // 2, i, R)
    t.hl(0, 15, 16, Rd); t.vl(0, 0, 16, Rd); t.vl(15, 0, 16, Rd)
    b = S.at('TA_B'); b.fill(R); b.grain(R, Rh, 0.05, 5)
    b.map(['WWWWWWWWWWWWWWWW', 'GGGGGGGGGGGGGGGG', 'WWWWWWWWWWWWWWWW'], {'W': W, 'G': G}, 0, 2)
    cog(b, 7.5, 10, 3.6, G, Gd, R)
    for i in range(5): b.px(2 + i, 15 - i, W); b.px(13 - i, 15 - i, W)   # a laurel under it
    b.hl(0, 15, 16, Rd)
    s_ = S.at('TA_S'); s_.fill(R); s_.vl(5, 0, 16, W); s_.vl(7, 0, 16, G); s_.vl(9, 0, 16, W); s_.hl(0, 15, 16, Rd)
    tb = S.at('TB'); tb.fill(R); tb.rect(0, 0, 16, 3, Rd); tb.px(7, 3, W); tb.px(8, 4, W); tb.vl(5, 3, 13, W); tb.vl(10, 3, 13, W)
    def stripes(P):
        P.vl(6, 0, 16, W); P.vl(7, 0, 16, G); P.vl(8, 0, 16, G); P.vl(9, 0, 16, W)
    u = S.at('X6'); limb(u, R, Rh, Rd); stripes(u)
    f = S.at('X7'); limb(f, R, Rh, Rd); stripes(f); f.rect(0, 12, 16, 4, W); f.hl(0, 13, 16, Wd); f.hl(0, 15, 16, Wd)
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi)
    th = S.at('X9'); limb(th, R, Rh, Rd); stripes(th)
    sn = S.at('X10'); limb(sn, R, Rh, Rd); stripes(sn); sn.rect(0, 13, 16, 3, W)
    lw = S.at('X4'); lw.fill(W)   # leg warmers: ribbed, banded red and gold
    for x in range(0, 16, 2): lw.vl(x, 0, 16, Wd)
    lw.rect(0, 0, 16, 2, R); lw.hl(0, 2, 16, G); lw.rect(0, 12, 16, 2, R); lw.hl(0, 11, 16, G); lw.rect(0, 14, 16, 2, Wd)
    ft = S.at('X11'); shoe(ft, W, W, Wd, Wd); ft.rect(4, 2, 8, 1, R)
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_gymnast.png', 32)

# =============================================================== the weightlifter
# SIGNATURE: arms like hams and a huge waxed handlebar moustache. TA chest (the singlet's cog), X2/X3 the belly, TD the traps,
# X4/X5 the belt, X1 + SW(0) the flat-top, X12 the moustache
def lifter():
    S = Sheet()
    sk, sh, dk, hi, hr, hh = '#d8a07a', '#b07656', '#6a3e2c', '#f0c49c', '#1c1410', '#4a3a30'
    C, Cd = '#f4f2ec', '#cfc9be'
    N, Nd, Nh, R, Rd, G, Gd = '#203270', '#121c44', '#3a56a8', '#cc2a20', '#86181a', '#f2c14e', '#b88a2a'
    L, Ld, Lh, red = '#7a4a28', '#4a2c18', '#a86c3c', '#e07a64'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 5, hr); P.rect(0, 0, 4, 17, hr); P.rect(28, 0, 4, 17, hr)   # flat-top, long sideburns
        for x in range(1, 31, 3): P.px(x, 1, hh)
        l = -1 if v == 1 else 0
        P.rect(5, 9 + l, 22, 3, hr); P.rect(14, 10 + l, 4, 1, sh)   # one heavy brow ridge
        P.hl(5, 12, 22, sh)
        if v == 0:
            for x0 in (8, 19): P.hl(x0, 13, 5, dk); P.hl(x0, 14, 5, '#f4f1ea'); P.rect(x0 + 2, 14, 2, 1, '#141014')   # small squinting eyes
        else: eye(P, v, 8, 13, 5, '#f4f1ea', '#141014', dk); eye(P, v, 19, 13, 5, '#f4f1ea', '#141014', dk)
        P.disc(5.5, 18, 2.6, red); P.disc(26.5, 18, 2.6, red)   # red with the strain
        P.rect(13, 14, 6, 6, sh); P.rect(12, 19, 8, 2, sh); P.rect(14, 15, 2, 3, hi); P.px(12, 20, dk); P.px(19, 20, dk)   # a big nose
        P.map(['   ##########   ', ' ############## ', '################', '#####      #####', '###          ###'], {'#': hr}, 8, 21)   # the moustache (in front: a box)
        if v == 0:
            P.hl(11, 26, 10, dk); P.hl(12, 27, 8, '#f4f1ea'); P.px(14, 27, G); P.hl(12, 28, 8, dk)   # a grin and a gold tooth
        elif v == 1: mouth_hurt(P, 11, 25, 10, dk, '#f4f1ea')
        else: mouth_ko(P, 12, 25, 8, dk, '#c84858')
        P.vl(15, 29, 2, dk)   # cleft chin
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 7, hr); hd.grain(hr, hh, 0.12, 2); hd.rect(0, 7, 3, 6, hr); hd.rect(13, 7, 3, 6, hr); hd.rect(0, 13, 16, 3, sh)
    ft = S.at('X1'); ft.fill(hr); ft.grain(hr, hh, 0.18, 3); ft.hl(0, 15, 16, sh); swatch(S, 0, hh)
    m = S.at('X12'); m.fill(hr)   # the moustache: combed strands, waxed shine
    for x in range(0, 16, 3): m.vl(x, 0, 16, hh)
    m.hl(0, 0, 16, '#6a5644'); m.hl(0, 15, 16, '#0c0806')
    t = S.at('TA'); t.fill(N)   # the singlet: a scoop neck, red side panels, a big gold cog
    t.map(['ssssssssssssssss', 'sshhssssssssshss', ' NssshsshsshssN ', ' NNsssssssssssN '], {'s': sk, 'h': sh, 'N': N}, 0, 0)
    t.rect(0, 0, 3, 16, R); t.rect(13, 0, 3, 16, R); t.vl(3, 2, 14, Rd); t.vl(12, 2, 14, Rd)
    cog(t, 7.5, 9.5, 4.6, G, Gd, N); t.grain(N, Nh, 0.06, 4)
    b = S.at('TA_B'); b.fill(N); b.rect(0, 0, 16, 5, sk); b.rect(5, 0, 6, 6, N); b.rect(0, 5, 3, 11, R); b.rect(13, 5, 3, 11, R)
    b.hl(0, 4, 5, sh); b.hl(11, 4, 5, sh); cog(b, 7.5, 10.5, 3.2, G, Gd, N)
    s_ = S.at('TA_S'); s_.fill(sk); s_.rect(0, 5, 16, 11, N); s_.rect(5, 5, 6, 11, R); s_.hl(0, 4, 16, sh); s_.grain(sk, sh, 0.08, 5, 0, 0, 16, 4)
    bf = S.at('X2'); bf.fill(N); bf.rect(0, 0, 3, 16, R); bf.rect(13, 0, 3, 16, R); bf.hl(3, 3, 10, Nh); bf.hl(4, 4, 8, Nh); bf.hl(0, 15, 16, Nd)
    bs = S.at('X3'); bs.fill(N); bs.rect(5, 0, 6, 16, R); bs.hl(0, 15, 16, Nd)
    tr = S.at('TD'); tr.fill(sk); tr.rect(2, 0, 3, 16, N); tr.rect(11, 0, 3, 16, N); tr.vl(8, 0, 16, sh); tr.grain(sk, hi, 0.08, 6)
    bl = S.at('X4'); bl.fill(L); bl.hl(0, 0, 16, Lh); bl.hl(0, 15, 16, Ld); bl.stitch(0, 2, 16, Lh); bl.stitch(1, 13, 16, Lh)
    bl.outline(4, 3, 8, 10, G); bl.outline(5, 4, 6, 8, Gd); bl.vl(7, 4, 8, G)   # the brass buckle
    bk = S.at('X5'); bk.fill(L); bk.hl(0, 0, 16, Lh); bk.hl(0, 15, 16, Ld); bk.stitch(0, 2, 16, Lh); bk.stitch(1, 13, 16, Lh)
    for x in (3, 7, 11): bk.px(x, 7, Ld); bk.px(x, 8, Ld)
    tb = S.at('TB'); tb.fill(N); tb.rect(0, 0, 3, 16, R); tb.rect(13, 0, 3, 16, R); tb.vl(7, 6, 10, Nd)
    u = S.at('X6'); limb(u, sk, hi, sh); u.vl(5, 3, 9, '#c08868'); u.px(6, 6, '#c08868'); u.hl(3, 12, 8, sh); u.grain(sk, hi, 0.06, 7)   # bulging, a vein
    u.rect(9, 3, 4, 5, R); u.px(10, 4, '#f4f1ea'); u.px(11, 5, '#f4f1ea')   # a little heart tattoo
    f = S.at('X7'); limb(f, sk, hi, sh); f.grain(sk, C, 0.25, 8, 0, 6, 16, 6); f.rect(0, 11, 16, 5, C); f.hl(0, 11, 16, R); f.hl(0, 13, 16, R); f.hl(0, 15, 16, Cd)   # chalk, wrist wraps
    hn = S.at('X8'); bare_hand(hn, C, Cd, '#a8a298', '#ffffff'); hn.grain(C, Cd, 0.1, 9)   # chalk-white hands
    th = S.at('X9'); limb(th, sk, hi, sh); th.rect(0, 0, 16, 5, N); th.hl(0, 4, 16, R); th.grain(sk, C, 0.08, 10, 0, 6, 16, 10)
    sn = S.at('X10'); limb(sn, sk, hi, sh); sn.rect(0, 0, 16, 6, C); sn.hl(0, 1, 16, R); sn.hl(0, 4, 16, R); sn.hl(0, 5, 16, Cd); sn.rect(0, 12, 16, 4, C)   # knee wraps, socks
    fo = S.at('X11'); shoe(fo, R, '#ee5a44', Rd, '#2a2a2a'); fo.rect(0, 4, 16, 2, '#f4f1ea')   # red lifting shoes, a white strap
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_lifter.png', 32)

# =============================================================== the honour guard
# SIGNATURE: a towering parade cap. X1 the cap's front (its badge), TD its sides, SW(1) top, SW(0) visor, X2 gold shoulder boards,
# X3 the sabre's scabbard, SW(2) its hilt, X4/X5 the coat's skirt
def guard():
    S = Sheet()
    sk, sh, dk, hi, hr = '#ecbc98', '#c8926e', '#7a4c3a', '#ffd8b8', '#3a2a1e'
    W, Wd, Wk, R, Rd, G, Gd, Gh = '#ece8de', '#bcb4a6', '#8e887c', '#b8231e', '#7a1612', '#f2c14e', '#b88a2a', '#fff0b0'
    N, Nd, K, Kh = '#1a1e2c', '#0e1018', '#121216', '#5a6070'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 5, R); P.hl(0, 0, 32, G); P.hl(0, 4, 32, Nd); P.hl(0, 5, 32, sh)   # the cap's band under the crown
        P.rect(0, 5, 3, 7, hr); P.rect(29, 5, 3, 7, hr)
        l = -1 if v == 1 else 0
        P.rect(6, 10 + l, 8, 2, hr); P.rect(18, 10 + l, 8, 2, hr)   # straight, level brows
        if v == 0:
            for x0 in (7, 19): P.hl(x0, 13, 6, dk); P.rect(x0, 14, 6, 2, '#f4f1ea'); P.rect(x0 + 2, 14, 2, 2, '#2a3a5a'); P.hl(x0, 16, 6, sh)   # eyes front, steel
        else: eye(P, v, 7, 13, 6, '#f4f1ea', '#141014', dk); eye(P, v, 19, 13, 6, '#f4f1ea', '#141014', dk)
        P.rect(15, 15, 2, 6, sh); P.px(14, 20, dk); P.px(17, 20, dk); P.vl(15, 15, 4, hi)
        P.rect(4, 18, 3, 4, sh); P.rect(25, 18, 3, 4, sh)   # hollow cheeks, a hard jaw
        P.rect(3, 26, 3, 4, sh); P.rect(26, 26, 3, 4, sh)
        if v == 0: P.hl(11, 24, 10, dk); P.hl(12, 25, 8, sh)   # a thin, set mouth
        elif v == 1: mouth_hurt(P, 11, 23, 10, dk, '#f4f1ea')
        else: mouth_ko(P, 12, 23, 8, dk, '#c84858')
        P.vl(15, 28, 2, dk); P.hl(13, 30, 6, G); P.hl(3, 30, 26, sh)   # a cleft chin; the chin strap's gold
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 3, R); hd.hl(0, 0, 16, G); hd.hl(0, 3, 16, Nd); hd.rect(0, 4, 16, 6, hr); hd.rect(0, 13, 16, 3, sh)
    cf = S.at('X1'); cf.fill(W); cf.grain(W, Wd, 0.06, 2)   # the crown's front: white, a big gold badge, a red band and gold cords
    cf.disc(7.5, 6, 5.2, Gd); cf.disc(7.5, 6, 4.4, R); cog(cf, 7.5, 6, 3.2, G, Gd, R)
    for i in range(4): cf.px(1 + i, 9 + i // 2, Gd); cf.px(14 - i, 9 + i // 2, Gd)   # laurel sprigs
    cf.rect(0, 11, 16, 5, R); cf.hl(0, 11, 16, G); cf.hl(0, 13, 16, Gh); cf.hl(0, 14, 16, G); cf.hl(0, 15, 16, Rd)
    cs = S.at('TD'); cs.fill(W); cs.grain(W, Wd, 0.06, 3); cs.hl(0, 0, 16, Wd); cs.rect(0, 11, 16, 5, R); cs.hl(0, 11, 16, G); cs.hl(0, 15, 16, Rd); cs.vl(7, 0, 11, Wd)
    swatch(S, 1, W); S.rect(48, 112, 4, 1, Wd); swatch(S, 0, K); S.px(49, 113, Kh); S.rect(48, 119, 4, 1, G)
    sb = S.at('X2'); sb.fill(G); sb.outline(0, 0, 16, 16, Gd); sb.rect(6, 1, 4, 14, R); sb.disc(7.5, 7.5, 1.6, Gh)   # shoulder boards
    for x in range(1, 15, 2): sb.px(x, 15, Gh)
    sc = S.at('X3'); sc.fill(K); sc.vl(1, 0, 16, Kh); sc.rect(0, 0, 16, 3, G); sc.rect(0, 13, 16, 3, G); sc.hl(0, 7, 16, G)   # the scabbard
    swatch(S, 2, G); S.px(57, 113, Gh)
    t = S.at('TA'); t.fill(W); t.grain(W, Wd, 0.05, 4)   # the white parade tunic: red collar, double gold buttons, aiguillette
    t.rect(4, 0, 8, 2, R); t.hl(4, 2, 8, G); t.vl(7, 2, 14, Wd); t.vl(8, 2, 14, R)
    for y in (4, 7, 10, 13): t.px(5, y, G); t.px(10, y, G)
    for i in range(9): t.px(1 + i // 3, 1 + i, G); t.px(4 + i // 2, 1 + i, Gh)   # gold cords looped from his shoulder
    t.hl(2, 10, 5, G)
    medal(t, 11, 3, (R, G), G, Gd); medal(t, 13, 3, ('#2a50b0', W), G, Gd)
    t.hl(0, 15, 16, Wd)
    b = S.at('TA_B'); b.fill(W); b.grain(W, Wd, 0.05, 5); b.rect(4, 0, 8, 2, R); b.vl(7, 2, 14, Wd); b.px(5, 13, G); b.px(10, 13, G); b.vl(3, 3, 10, Wd); b.vl(12, 3, 10, Wd)
    s_ = S.at('TA_S'); s_.fill(W); s_.grain(W, Wd, 0.05, 6); s_.vl(7, 0, 16, R)
    k = S.at('X4'); k.fill(W); k.grain(W, Wd, 0.05, 7); k.rect(0, 0, 16, 3, G); k.rect(6, 0, 4, 3, Gd); cog(k, 7.5, 1.2, 1.4, Gh)   # the belt, a cog buckle
    k.vl(7, 3, 13, R); k.rect(6, 12, 4, 4, N); k.hl(0, 15, 16, R); k.vl(3, 4, 11, Wd); k.vl(12, 4, 11, Wd)
    kb = S.at('X5'); kb.fill(W); kb.grain(W, Wd, 0.05, 8); kb.rect(0, 0, 16, 3, G); kb.vl(7, 3, 13, Wk); kb.hl(0, 15, 16, R); kb.px(5, 5, G); kb.px(10, 5, G)
    tb = S.at('TB'); tb.fill(W); tb.rect(0, 0, 16, 4, G)
    u = S.at('X6'); limb(u, W, '#ffffff', Wd)
    f = S.at('X7'); limb(f, W, '#ffffff', Wd); f.rect(0, 8, 16, 5, R); f.hl(0, 8, 16, G); f.px(4, 10, G); f.px(11, 10, G); f.rect(0, 13, 16, 3, '#ffffff')   # red cuffs, white gloves
    hn = S.at('X8'); bare_hand(hn, '#ffffff', Wd, Wk, '#ffffff'); hn.vl(7, 2, 8, Wd)   # white gloves
    th = S.at('X9'); limb(th, N, '#2c3448', Nd); th.vl(7, 0, 16, R); th.vl(8, 0, 16, R)
    sn = S.at('X10'); sn.fill(K); sn.vl(3, 0, 16, Kh); sn.vl(4, 2, 12, '#9aa0b0'); sn.hl(0, 0, 16, N); sn.hl(0, 15, 16, '#000000')   # glossy jackboots
    fo = S.at('X11'); shoe(fo, K, Kh, '#000000', '#2a2a2a'); fo.px(4, 2, '#9aa0b0'); fo.px(5, 2, '#9aa0b0')
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_guard.png', 32)

# =============================================================== the bandsman
# SIGNATURE: a tall plumed shako and a bass drum strapped to his front. X1 the shako's front, TD its sides, SW(1) top, SW(0) peak,
# X2 the plume, X3 the drum's heads, X4 its shell, X5 fringed epaulettes
def bandsman():
    S = Sheet()
    sk, sh, dk, hi, hr, ck, ckh = '#ecb090', '#c88a6a', '#7a483a', '#ffd4b4', '#5a3a24', '#f07a74', '#ffb0a4'
    R, Rd, Rh, G, Gd, Gh = '#c42a24', '#86181a', '#e85a44', '#f2c14e', '#b88a2a', '#fff0b0'
    N, Nd, W, Wd, K = '#1e2444', '#12162c', '#f4f1ea', '#c8c4bc', '#141014'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 4, N); P.hl(0, 4, 32, G); P.rect(0, 5, 3, 8, hr); P.rect(29, 5, 3, 8, hr)
        l = -2 if v == 0 else -1 if v == 1 else 0
        P.map([' ##### ', '#     #'], {'#': hr}, 6, 9 + l); P.map([' ##### ', '#     #'], {'#': hr}, 19, 9 + l)   # brows way up
        if v == 0:
            for x0 in (7, 20): P.rect(x0, 11, 6, 5, W); P.outline(x0, 11, 6, 5, dk); P.rect(x0 + 2, 12, 2, 3, '#141014')   # eyes popping
        else: eye(P, v, 7, 13, 6, W, '#141014', dk); eye(P, v, 20, 13, 6, W, '#141014', dk)
        if v == 0:   # cheeks puffed fit to burst, lips pursed round the mouthpiece
            for cx in (6.5, 25.5): P.disc(cx, 21, 5, ck); P.disc(cx - 1, 19.5, 1.6, ckh)
            P.disc(16, 24, 2.6, '#a8323a'); P.disc(16, 24, 1.2, '#3a0e12')
        else:
            P.rect(4, 19, 4, 3, ck); P.rect(24, 19, 4, 3, ck)
            if v == 1: mouth_hurt(P, 11, 23, 10, dk, W)
            else: mouth_ko(P, 12, 23, 8, dk, '#c84858')
        P.rect(14, 16, 4, 5, sh); P.rect(15, 17, 1, 2, hi); P.px(13, 20, dk); P.px(18, 20, dk)   # a round nose
        P.rect(3, 28, 26, 2, G); P.hl(3, 29, 26, Gd)   # the chin strap
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 2, N); hd.hl(0, 2, 16, G); hd.rect(0, 3, 16, 7, hr); hd.rect(0, 12, 16, 2, G); hd.rect(0, 14, 16, 2, sh)
    sf = S.at('X1'); sf.fill(N); sf.grain(N, '#2a3258', 0.1, 2)   # the shako: navy, a red top band, a big gold plate with a cog
    sf.rect(0, 0, 16, 3, R); sf.hl(0, 3, 16, G)
    sf.map(['  GGGGGGGGGG  ', ' GgggggggggggG ', ' Gg        gG ', ' Gg        gG ', ' Gg        gG ', ' Gg        gG ', '  Gg      gG  ', '   GggggggG   ', '    GGGGGG    '], {'G': G, 'g': Gd}, 1, 4)
    cog(sf, 7.5, 8, 2.8, Gh, Gd, R)
    sf.rect(0, 13, 16, 3, G); sf.hl(0, 14, 16, Gd)
    ss = S.at('TD'); ss.fill(N); ss.grain(N, '#2a3258', 0.1, 3); ss.rect(0, 0, 16, 3, R); ss.hl(0, 3, 16, G); ss.rect(0, 13, 16, 3, G); ss.vl(7, 4, 9, Gd)
    swatch(S, 1, R); swatch(S, 0, K); S.rect(48, 115, 4, 1, G)
    pl = S.at('X2'); pl.fill(R)   # the plume: red feathers tipped white, a gold socket
    for x in (1, 4, 7, 10, 13): pl.vl(x, 3, 10, Rh)
    for x in (2, 5, 8, 11, 14): pl.vl(x, 5, 8, Rd)
    pl.rect(0, 0, 16, 4, W); pl.hl(0, 3, 16, Wd)
    for x in (0, 3, 6, 9, 12, 15): pl.px(x, 4, W)
    pl.rect(0, 13, 16, 3, G); pl.hl(0, 15, 16, Gd)
    dh = S.at('X3'); dh.fill(W); dh.grain(W, Wd, 0.08, 4)   # the drum's head: a red hoop with gold studs, a painted gold cog on red
    dh.outline(0, 0, 16, 16, R); dh.outline(1, 1, 14, 14, Rd)
    for i in range(1, 15, 3): dh.px(i, 0, G); dh.px(i, 15, G); dh.px(0, i, G); dh.px(15, i, G)
    dh.disc(7.5, 7.5, 5, R); dh.disc(7.5, 7.5, 4.3, Rh); dh.disc(7.5, 7.5, 3.9, R); cog(dh, 7.5, 7.5, 3.3, G, Gd, R)
    ds = S.at('X4'); ds.fill(R)   # its shell: navy hoops with gold studs, white rope zigzag
    ds.rect(0, 0, 16, 3, N); ds.rect(0, 13, 16, 3, N)
    for x in range(1, 16, 4): ds.px(x, 1, G); ds.px(x, 14, G)
    for i in range(10):
        ds.px((i * 4 // 5) % 16, 3 + i, W); ds.px((8 - i * 4 // 5) % 16, 3 + i, W); ds.px((8 + i * 4 // 5) % 16, 3 + i, W); ds.px((16 - i * 4 // 5) % 16, 3 + i, W)
    ep = S.at('X5'); ep.fill(G); ep.outline(0, 0, 16, 6, Gd); ep.rect(5, 1, 6, 4, R)   # fringed epaulettes
    for x in range(16): ep.vl(x, 6, 10, G if x % 2 else Gd)
    t = S.at('TA'); t.fill(R)   # the tunic: a navy collar, gold frogging, the drum's white straps
    t.rect(3, 0, 10, 2, N); t.hl(3, 2, 10, G)
    for y in (4, 7, 10, 13): t.hl(2, y, 12, G); t.px(1, y, Gd); t.px(14, y, Gd); t.px(7, y, Gh); t.px(8, y, Gh)
    t.vl(7, 2, 14, Rd)
    for i in range(16): t.px(i, max(0, 2 + i // 2), W) if i < 6 else None
    for i in range(6): t.px(15 - i, 2 + i // 2, W)
    b = S.at('TA_B'); b.fill(R); b.rect(3, 0, 10, 2, N)   # the back: the drum harness crossed in white
    for i in range(14): b.px(1 + i, 2 + i, W); b.px(14 - i, 2 + i, W); b.px(2 + i, 2 + i, Wd); b.px(13 - i, 2 + i, Wd)
    b.disc(7.5, 8.5, 1.5, G); b.hl(0, 15, 16, G)
    s_ = S.at('TA_S'); s_.fill(R); s_.vl(7, 0, 16, G); s_.rect(10, 0, 2, 16, W); s_.hl(0, 15, 16, G)
    tb = S.at('TB'); tb.fill(N); tb.rect(0, 0, 16, 3, W); tb.rect(6, 0, 4, 3, G); tb.rect(6, 3, 4, 13, G)
    u = S.at('X6'); limb(u, R, Rh, Rd); u.map(['G      G', ' G    G ', '  G  G  ', '   GG   '], {'G': G}, 4, 6); u.map(['G      G', ' G    G ', '  G  G  ', '   GG   '], {'G': G}, 4, 9)   # chevrons
    f = S.at('X7'); limb(f, R, Rh, Rd); f.rect(0, 8, 16, 5, N); f.hl(0, 8, 16, G); f.map(['  G  G  G  G  G ', ' G G G G G G G G'], {'G': G}, 0, 10); f.rect(0, 13, 16, 3, W)   # braided cuffs, gloves
    hn = S.at('X8'); bare_hand(hn, W, Wd, '#8e887c', '#ffffff')
    th = S.at('X9'); limb(th, N, '#2c3458', Nd); th.rect(6, 0, 4, 16, G); th.vl(7, 0, 16, Gh)
    sn = S.at('X10'); limb(sn, N, '#2c3458', Nd); sn.rect(6, 0, 4, 10, G); sn.rect(0, 10, 16, 6, W); sn.hl(0, 10, 16, Wd); sn.px(12, 12, K); sn.px(12, 14, K)   # white spats
    fo = S.at('X11'); shoe(fo, K, '#5a6070', '#000000', '#2a2a2a'); fo.rect(0, 0, 16, 4, W)
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_bandsman.png', 32)

# =============================================================== the specialist
# SIGNATURE: mirrored aviators under slicked-back hair, the leather collar up. X1 the collar, X2 + SW(0) the hair and ducktail,
# X3 the aviators, X4 the jacket's hem, X5 padded shoulders
def specialist():
    S = Sheet()
    sk, sh, dk, hi, sc = '#d8a888', '#b48468', '#6c4636', '#f0c8a8', '#a85a4a'
    K, Kh, Kd = '#141214', '#5a5a70', '#060506'
    L, Lh, Lm, R, Rd, G, Gd, Gh = '#1e1c22', '#7a7890', '#34323c', '#c42a24', '#7a1612', '#f2c14e', '#b88a2a', '#fff0b0'
    W, Wd, Z, Zh, M1, M2, M3 = '#ece8e0', '#bcb8b0', '#8a8a96', '#d0d0da', '#7ad8f0', '#f0a040', '#e8e0ff'
    T, Th, Td = '#2a4ec0', '#4a72e0', '#16307a'   # a royal-blue tracksuit under the leather
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 7, K); P.rect(0, 0, 4, 18, K); P.rect(28, 0, 4, 18, K)   # slicked back, long sideburns
        for x in (5, 11, 19, 25): P.hl(x, 2, 4, Kh)
        l = -1 if v == 1 else 0
        P.map(['##     ', ' ##### ', '    ###'], {'#': K}, 5, 9 + l); P.map(['     ##', ' ##### ', '###    '], {'#': K}, 20, 9 + l)
        if v == 0:   # the aviators (a box sits on them too): mirrored, sunset in the lenses
            for x0 in (5, 18):
                P.map([' GGGGGGGG ', 'GaaaaaaaaG', 'GaaaaaaaaG', 'GbbbbbbbbG', ' GbbbbbbG ', '  GGGGGG  '], {'G': G, 'a': M1, 'b': M2}, x0, 12)
                P.px(x0 + 2, 13, M3)
            P.hl(14, 13, 4, G)
        elif v == 1:
            for x0 in (5, 18): P.map([' GGGGGGGG ', 'GaaaaaaaaG', 'G#aaaa#aaG', 'Gbbb#bbbbG', ' GbbbbbbG ', '  GGGGGG  '], {'G': G, 'a': M1, 'b': M2, '#': '#ffffff'}, x0, 12)
        else:
            eye(P, 2, 8, 14, 5, W, Kd, dk); eye(P, 2, 20, 14, 5, W, Kd, dk)
            P.map([' GGGGGGGG ', 'GaaaaaaaaG', '  GGGGGG  '], {'G': G, 'a': M1}, 18, 19)   # knocked askew
        for i in range(7): P.px(25 - i // 2, 6 + i * 2, sc); P.px(26 - i // 2, 7 + i * 2, sc)   # a scar down through the brow
        P.rect(14, 17, 4, 4, sh); P.px(15, 17, hi); P.px(13, 20, dk); P.px(18, 20, dk)
        for (x, y) in ((6, 24), (8, 27), (11, 28), (14, 26), (19, 28), (22, 27), (24, 24), (17, 29), (9, 25), (21, 25)): P.px(x, y, sh)   # stubble
        if v == 0: P.hl(11, 24, 9, dk); P.hl(20, 23, 2, dk); P.px(18, 24, G); P.px(19, 24, Gh)   # a smirk, a gold tooth
        elif v == 1: mouth_hurt(P, 11, 23, 10, dk, W)
        else: mouth_ko(P, 12, 24, 8, dk, '#c84858')
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(K)
    for y in (1, 4, 7, 10): hd.hl(1 + y % 3, y, 12, Kh)
    hd.rect(0, 12, 16, 4, sh); hd.rect(3, 11, 10, 1, sk)
    hr = S.at('X2'); hr.fill(K)   # the hair: swept back, glossy
    for y in (2, 5, 8, 11, 14): hr.hl(0, y, 16, Kd); hr.hl((y * 5) % 7, y - 1, 8, Kh)
    swatch(S, 0, K); S.rect(49, 113, 2, 1, Kh)
    av = S.at('X3'); av.fill(G)   # the aviators: two big mirrored lenses (sky over sunset) on a thin gold frame
    av.map(['aaaaaaa  aaaaaaa', 'aaaaaaa  aaaaaaa', 'aaaaaaa  aaaaaaa', 'aaaaaaa  aaaaaaa', 'aaaaaaa  aaaaaaa', 'ccccccc  ccccccc', 'bbbbbbb  bbbbbbb', 'bbbbbbb  bbbbbbb',
            'bbbbbbb  bbbbbbb', 'bbbbbbb  bbbbbbb', ' bbbbbb  bbbbbb ', '  bbbb    bbbb  '], {'a': M1, 'b': M2, 'c': M3}, 0, 2)
    av.hl(0, 0, 16, Gd); av.px(1, 3, '#ffffff'); av.px(10, 3, '#ffffff'); av.hl(7, 3, 2, G)
    co = S.at('X1'); co.fill(L); co.vl(0, 0, 16, Lh); co.vl(15, 0, 16, Lh); co.hl(0, 0, 16, Lh); co.stitch(1, 2, 14, Lm); co.grain(L, Lm, 0.15, 3)   # the collar, up
    co.rect(3, 4, 10, 12, Rd); co.grain(Rd, R, 0.3, 4)   # its red satin lining showing
    t = S.at('TA'); t.fill(L); t.grain(L, Lm, 0.12, 5)   # the open jacket: wide lapels, a red shirt open on the chest, a gold chain
    t.map(['LLLRssssssRLLL', 'LLRRsshhssRRLL', 'LLLRRsssssRRLL', 'LLLLRsssssRLLL', 'LLLLLRsssRLLLL', 'LLLLLRRsRRLLLL', 'LLLLLLRRRLLLLL'], {'L': L, 'R': R, 's': sk, 'h': sh}, 1, 0)
    for (x, y) in ((5, 2), (6, 4), (7, 5), (8, 5), (9, 4), (10, 2)): t.px(x, y, G)
    t.px(7, 6, Gh); t.px(8, 6, G); t.px(7, 7, R); t.px(8, 7, Gd)   # the medallion, a red stone
    for i in range(10): t.px(2 + i // 3, 3 + i, Lh); t.px(13 - i // 3, 3 + i, Lh)   # lapel folds, lit
    for y in range(8, 16, 2): t.px(6, y, Zh); t.px(9, y, Zh)   # zip teeth
    t.hl(1, 11, 3, Z); t.hl(12, 11, 3, Z)
    b = S.at('TA_B'); b.fill(L); b.grain(L, Lm, 0.12, 6)   # the back: a gold and red tiger, embroidered
    b.map(['  G      G  ', ' GGG    GGG ', ' GGGGGGGGGG ', 'GGkGGGGGGkGG', 'GGGGGGGGGGGG', 'GkGGGRRGGGkG', ' GGGWWWWGGG ', ' GkGWRRWGkG ', '  GGWWWWGG  ', '   GGGGGG   '],
          {'G': G, 'k': Kd, 'R': R, 'W': W}, 2, 3)
    b.hl(0, 0, 16, Lh); b.hl(0, 15, 16, Lm)
    s_ = S.at('TA_S'); s_.fill(L); s_.grain(L, Lm, 0.12, 7); s_.vl(7, 0, 16, Lh); s_.vl(8, 0, 16, Kd)
    hm = S.at('X4'); hm.fill(L); hm.rect(0, 9, 16, 7, Lm)
    for x in range(0, 16, 2): hm.vl(x, 10, 6, L)
    hm.vl(7, 0, 10, Zh); hm.vl(8, 0, 10, Z)
    sp = S.at('X5'); sp.fill(L); sp.grain(L, Lm, 0.15, 8); sp.outline(0, 0, 16, 16, Lh); sp.rect(2, 6, 12, 3, Lm); sp.disc(11.5, 7.5, 1.2, Zh)   # padded shoulders, an epaulette
    tb = S.at('TB'); tb.fill(T); tb.rect(0, 0, 16, 3, Lm); tb.vl(4, 3, 13, W); tb.vl(11, 3, 13, W)
    u = S.at('X6'); limb(u, L, Lh, Kd); u.grain(L, Lm, 0.12, 9)
    for y in (4, 9, 13): u.hl(2, y, 10, Lh)   # leather creases
    f = S.at('X7'); limb(f, L, Lh, Kd); f.grain(L, Lm, 0.12, 10); f.hl(3, 5, 9, Lh); f.rect(0, 12, 16, 4, Lm); f.vl(7, 11, 5, Zh)
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi); hn.rect(4, 11, 3, 2, G); hn.px(5, 11, R); hn.px(9, 14, sc); hn.px(13, 14, sc)   # a signet ring, scarred knuckles
    th = S.at('X9'); limb(th, T, Th, Td); th.vl(5, 0, 16, W); th.vl(7, 0, 16, W); th.vl(9, 0, 16, W)
    sn = S.at('X10'); limb(sn, T, Th, Td); sn.vl(5, 0, 16, W); sn.vl(7, 0, 16, W); sn.vl(9, 0, 16, W); sn.rect(0, 13, 16, 3, W)
    fo = S.at('X11'); shoe(fo, W, '#ffffff', Wd, Wd); fo.map(['K  K  K', ' K  K  K'], {'K': K}, 3, 4)   # white trainers, black stripes
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_specialist.png', 32)

# =============================================================== props and labels
def props():
    # the flagpole (16x32): pole at the left (gilt finial rows 0-3, varnished wood rows 4-27, brass butt rows 28-31), the flag at the right
    F = Sheet(16, 32); P = Pane(F, 0, 0)
    P.rect(0, 0, 8, 4, '#f2c14e'); P.rect(2, 0, 4, 1, '#fff0b0'); P.rect(0, 3, 8, 1, '#a8822a')
    P.rect(0, 4, 8, 24, '#7a4a24'); P.rect(1, 4, 2, 24, '#a86a34'); P.rect(6, 4, 2, 24, '#4a2a14')
    P.rect(0, 28, 8, 4, '#c8a040'); P.rect(0, 28, 8, 1, '#a8822a')
    P.rect(8, 0, 8, 16, '#b8231e'); P.rect(8, 15, 8, 1, '#86181a'); P.rect(15, 0, 1, 16, '#86181a')
    P.rect(10, 5, 4, 4, '#f2c14e'); P.px(10, 5, '#b8231e'); P.px(13, 5, '#b8231e'); P.px(10, 8, '#b8231e'); P.px(13, 8, '#b8231e'); P.rect(11, 6, 2, 2, '#a8822a')   # a gold cog
    P.rect(8, 16, 2, 2, '#f2c14e')   # the fringe edge
    F.save('assets/tex/flagpole.png')
    # the cymbal (16x16): brass with tonal rings and a bell in the middle; rows 14-15 the rim
    C = Sheet(16, 16); P = Pane(C, 0, 0)
    P.rect(0, 0, 16, 16, '#d8a838')
    for r_, col in ((7, '#e8c058'), (5, '#c89428'), (3, '#e8c058')):
        P.rect(8 - r_, 8 - r_, 2 * r_, 2 * r_, col)
    P.rect(6, 6, 4, 4, '#f2d070'); P.rect(7, 7, 2, 2, '#a87818')
    P.rect(0, 14, 16, 2, '#a87818')
    C.save('assets/tex/cymbal.png')
    # the drumstick (4x16): pale hickory, a darker tip
    Dm = Sheet(4, 16); P = Pane(Dm, 0, 0)
    P.rect(0, 0, 4, 16, '#d8b880'); P.rect(0, 0, 4, 2, '#f0dcb0'); P.rect(3, 2, 1, 14, '#a88858'); P.rect(0, 13, 4, 3, '#c0a070')
    Dm.save('assets/tex/drumstick.png')
    sign('SWEPT!', '#ff9a3c', 'assets/tex/sign_swept.png')
    sign('DODGE!', '#33e0d0', 'assets/tex/sign_dodge.png')

if __name__ == '__main__':
    import sys
    only = sys.argv[1:]
    for f in (sambo, gymnast, lifter, guard, bandsman, specialist):
        if not only or f.__name__ in only: print(f.__name__, f(), 'colours')
    if not only or 'props' in only: props(); print('props ok')
