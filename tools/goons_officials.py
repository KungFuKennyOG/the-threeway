"""Paints the bar's officials (64x128 sheets, the layout in src/characters.js and tools/goonkit.py): Columbia's Department of
Civic Harmony officer and its enforcer, and the Aoki Development agent. Invented people, each a character with one loud
signature (docs/goon-style.md); the panel layout is goon()'s (see tools/goons_palace.py).
Run from the repo root: python3 tools/goons_officials.py"""
from goonkit import Sheet, Pane, panel, swatch, H, cog, star5, medal, faces3, eye, mouth_hurt, mouth_ko, bevel, remap
from goons_palace import limb, skin_face, bare_hand, shoe

W_, Wd_, BLK = '#f4f1ea', '#c8c2b8', '#141014'
G, Gd, Gh = '#f2c14e', '#b88a2a', '#fff0b0'

# =============================================================== the Civic Harmony officer
# SIGNATURE: a big blond pompadour over a huge toothy grin (and a wink). X1 + SW(0) the hair, X2 the blazer's hem, X3 the rosette,
# X12 + SW(2) the closure notice on its clipboard, SW(3) the thumb
def harmony():
    S = Sheet()
    sk, sh, dk, hi = '#eab48c', '#c48a68', '#7a4a38', '#ffd8b8'
    Y, Yd, Yh = '#f2cc5a', '#b88e2c', '#fff2a8'
    R, Rd, Rh, N, Nd, B, Br = '#d82a2a', '#8e1a1a', '#ff6050', '#1a2a5a', '#0e1838', '#3a7ad0', '#6a4024'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 8, Y); P.rect(0, 0, 4, 15, Y); P.rect(28, 0, 4, 15, Y)   # the pompadour (a box in front of it too)
        for i in range(0, 32, 4): P.px(i, 2, Yh); P.px(i + 1, 3, Yh); P.px(i + 2, 5, Yd)
        l = -2 if v == 0 else -1 if v == 1 else 0
        P.map([' #### ', '#    #'], {'#': Yd}, 6, 11 + l); P.map([' #### ', '#    #'], {'#': Yd}, 20, 10 + l)   # brows sky-high
        if v == 0:   # one bright blue eye with a twinkle, one wink
            P.hl(7, 13, 6, dk); P.rect(7, 14, 6, 2, W_); P.rect(9, 14, 2, 2, B); P.px(9, 14, '#ffffff')
            P.map([' #### ', '#    #'], {'#': dk}, 20, 14)
        else: eye(P, v, 7, 13, 6, W_, BLK, dk); eye(P, v, 20, 13, 6, W_, BLK, dk)
        P.rect(14, 16, 4, 4, sh); P.px(15, 16, hi); P.px(13, 19, dk); P.px(18, 19, dk)
        if v == 0:   # the salesman's grin: ear to ear, every tooth, a glint
            P.map(['##################', '#WWWWWWWWWWWWWWWW#', '#WWwWWwWWwWWwWWwW#', ' #WWWWWWWWWWWWWW# ', '  ##############  '], {'#': dk, 'W': W_, 'w': Wd_}, 7, 21)
            P.map(['  #  ', ' ### ', '#####', ' ### ', '  #  '], {'#': '#ffffff'}, 25, 16)   # ting!
            P.px(6, 21, sh); P.px(25, 21, sh)   # dimples
        elif v == 1: mouth_hurt(P, 9, 22, 14, dk, W_)
        else: mouth_ko(P, 11, 22, 10, dk, '#c84858')
        P.vl(15, 28, 2, sh)   # a cleft chin
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(Y)
    for y in (2, 5, 8): hd.hl(0, y, 16, Yd); hd.hl(2, y - 1, 9, Yh)
    hd.rect(0, 11, 16, 5, sk); hd.rect(0, 14, 16, 2, sh)
    hr = S.at('X1'); hr.fill(Y)   # the hair: a lacquered wave
    for y in range(0, 16, 4):
        for x in range(16): hr.px(x, y + (x // 4) % 2, Yd)
        hr.hl(2, y + 2, 10, Yh)
    swatch(S, 0, Y); S.rect(49, 113, 2, 1, Yh)
    t = S.at('TA'); t.fill(R); t.grain(R, Rh, 0.05, 2)   # the loud red blazer: a white shirt, a starry navy tie, a name tag, gold buttons
    t.map(['RRRRRWWWWWWRRRRR', 'RRRRRWWNNWWRRRRR', 'RRRRrRWNNWRrRRRR', 'RRRrRRWNNWRRrRRR', 'RRrRRRRNNRRRRrRR', 'RrRRRRRNNRRRRRrR', 'RRRRRRRNNRRRRRRR', 'RRRRRRRNNRRRRRRR'],
          {'R': R, 'W': W_, 'N': N, 'r': Rh}, 0, 0)
    for y in (3, 6): t.px(7, y, '#ffffff'); t.px(8, y + 1, G)
    t.outline(10, 6, 5, 3, W_); t.rect(11, 7, 3, 1, R); t.hl(10, 5, 5, R)   # the name tag
    for y in (10, 13): t.px(5, y, G); t.px(10, y, G)
    t.hl(0, 15, 16, Rd)
    b = S.at('TA_B'); b.fill(R); b.grain(R, Rh, 0.05, 3)   # the back: Civic Harmony's crest, a starred shield
    b.map([' GGGGGGGGGG ', 'GNNNNNNNNNNG', 'GNNNNWNNNNNG', 'GNNNWWWNNNNG', 'GNWWWWWWWNNG', 'GNNWWWWWNNNG', 'GNNWNNNWNNNG', ' GNNNNNNNNG ', '  GNNNNNNG  ', '   GGGGGG   '], {'G': G, 'N': N, 'W': W_}, 2, 3)
    b.hl(0, 15, 16, Rd); b.vl(7, 13, 2, Rd)
    s_ = S.at('TA_S'); s_.fill(R); s_.grain(R, Rh, 0.05, 4); s_.vl(7, 0, 16, Rd)
    hm = S.at('X2'); hm.fill(R); hm.grain(R, Rh, 0.05, 5); hm.vl(7, 0, 16, Rd); hm.rect(1, 4, 5, 2, Rd); hm.rect(10, 4, 5, 2, Rd); hm.px(5, 1, G); hm.px(10, 1, G); hm.hl(0, 15, 16, Rd)
    ro = S.at('X3'); ro.fill(N); ro.disc(7.5, 6, 6, G); ro.disc(7.5, 6, 4.5, W_); ro.disc(7.5, 6, 3, R); star5(ro, 6, 4, W_)   # the rosette
    for x in (4, 5, 10, 11): ro.vl(x, 11, 5, R if x in (4, 11) else N)
    for i in range(0, 16, 2): ro.px(i, 0, Gd)
    cb = S.at('X12'); cb.fill(Br); cb.rect(1, 2, 14, 13, W_)   # the closure notice: a red header, lines, a big red stamp
    cb.rect(5, 0, 6, 3, '#9a9aa6'); cb.rect(2, 3, 12, 2, R)
    for y in (6, 8, 13): cb.hl(2, y, 11, '#7a7a84')
    cb.outline(3, 9, 10, 3, R); cb.hl(4, 10, 8, R)
    swatch(S, 2, Br); swatch(S, 3, sk)
    tb = S.at('TB'); tb.fill(W_); tb.rect(0, 0, 16, 3, Br); tb.rect(6, 0, 4, 3, G)
    u = S.at('X6'); limb(u, R, Rh, Rd); u.grain(R, Rh, 0.05, 6)
    f = S.at('X7'); limb(f, R, Rh, Rd); f.px(4, 10, G); f.px(7, 10, G); f.rect(0, 12, 16, 2, W_); f.rect(0, 14, 16, 2, sk)
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi); hn.rect(4, 11, 3, 2, G)   # a class ring
    th = S.at('X9'); limb(th, W_, '#ffffff', Wd_); th.vl(7, 0, 16, Wd_)
    sn = S.at('X10'); limb(sn, W_, '#ffffff', Wd_); sn.vl(7, 0, 13, Wd_); sn.rect(0, 13, 16, 3, Br)
    fo = S.at('X11'); shoe(fo, W_, '#ffffff', Wd_, Br); fo.rect(0, 0, 5, 11, Br); fo.rect(11, 0, 5, 11, Br)   # two-tone spectator shoes
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_harmony.png', 32)

# =============================================================== the Civic Harmony enforcer
# SIGNATURE: a fedora pulled down over his eyes. X1 the brim, X2 + SW(0) the crown, SW(1) the toothpick, X3 brass knuckles,
# X4 padded shoulders
def enforcer():
    S = Sheet()
    sk, sh, dk, hi, stb = '#c8906c', '#a06e50', '#5a3a28', '#e0b08c', '#7a5a46'
    N, Nh, Nd, Pn = '#1c2654', '#3c4c86', '#0e1430', '#b8bcd4'
    F, Fd, Fh, K, R = '#5e4c3a', '#3a2e24', '#82705a', '#100e10', '#d42a3a'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 9, F); P.hl(0, 9, 32, Fd)   # the brim, low
        P.rect(0, 10, 32, 6, '#7a5440'); P.rect(0, 10, 3, 8, '#2a2220'); P.rect(29, 10, 3, 8, '#2a2220')   # the brim's shadow over his eyes
        if v == 0: P.rect(8, 13, 4, 1, '#ffe8a0'); P.rect(20, 13, 4, 1, '#ffe8a0'); P.px(9, 13, '#ffffff'); P.px(21, 13, '#ffffff')   # two glints in the dark
        elif v == 1: P.hl(7, 13, 6, BLK); P.hl(19, 13, 6, BLK)
        else: eye(P, 2, 8, 12, 4, W_, BLK, dk); eye(P, 2, 20, 12, 4, W_, BLK, dk)
        P.rect(15, 16, 3, 5, sh); P.px(14, 17, sh); P.px(16, 18, hi); P.px(13, 20, dk); P.px(18, 20, dk)   # broken, a bit crooked
        P.grain(sk, stb, 0.45, 2, 3, 21, 26, 9)   # heavy stubble
        if v == 0: P.hl(11, 24, 10, dk); P.px(10, 25, dk); P.px(21, 23, dk); P.vl(13, 23, 3, '#d8a890')   # a sneer, a split lip's scar
        elif v == 1: mouth_hurt(P, 10, 23, 12, dk, W_)
        else: mouth_ko(P, 11, 23, 10, dk, '#c84858')
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(sk); hd.rect(0, 0, 16, 5, F); hd.rect(0, 5, 16, 5, '#2a2220'); hd.rect(0, 13, 16, 3, sh)
    br = S.at('X1'); br.fill(F); br.grain(F, Fh, 0.1, 3); br.outline(0, 0, 16, 16, Fd)   # the brim, bound at the edge
    cr = S.at('X2'); cr.fill(F); cr.grain(F, Fh, 0.1, 4); cr.rect(0, 10, 16, 4, K); cr.hl(0, 14, 16, Fd)   # the crown: a black band, a pinched front, a red feather
    cr.map(['#      #', ' #    # ', '  #  #  ', '   ##   '], {'#': Fd}, 4, 0); cr.vl(13, 6, 5, R); cr.vl(12, 7, 3, '#ff7080')
    swatch(S, 0, Fd); swatch(S, 1, '#e8d0a0')
    kn = S.at('X3'); kn.fill(G)   # brass knuckles: four rings, a glint
    for x in (1, 5, 9, 13): kn.rect(x, 5, 2, 6, '#5a3a14'); kn.outline(x - 1, 4, 4, 8, Gd)
    kn.hl(0, 0, 16, Gh); kn.hl(0, 15, 16, Gd); kn.px(3, 2, '#ffffff')
    def pin(P, base, k):   # pinstripe navy
        P.fill(base); P.grain(base, Nh, 0.04, k)
        for x in range(1, 16, 4): P.vl(x, 0, 16, Pn)
    t = S.at('TA'); pin(t, N, 5)   # double-breasted: peaked lapels, a black shirt, a gold tie, a red carnation, a pocket square
    t.map(['NNNNKKKKKKKKNNNN', 'NNNhNKKGGKKNhNNN', 'NNhNNNKGGKNNNhNN', 'NhNNNNNGGNNNNNhN', 'hNNNNNNGGNNNNNNh', 'NNNNNNNGGNNNNNNN', 'NNNNNNNGGNNNNNNN'], {'N': None, 'K': K, 'G': G, 'h': Nh}, 0, 0)
    t.disc(2.5, 5.5, 1.4, R); t.px(2, 5, '#ff7080'); t.px(3, 7, '#2a7a3a')   # the carnation
    t.rect(11, 5, 3, 2, W_); t.px(12, 4, W_)
    for y in (8, 11, 14): t.px(5, y, '#c8c0a8'); t.px(10, y, '#c8c0a8')
    t.vl(7, 7, 9, Nd)
    b = S.at('TA_B'); pin(b, N, 6); b.vl(7, 0, 16, Nd); b.vl(8, 10, 6, Nd); b.hl(0, 0, 16, Nh)
    s_ = S.at('TA_S'); pin(s_, N, 7)
    pd = S.at('X4'); pin(pd, N, 8); pd.hl(0, 0, 16, Nh)
    tb = S.at('TB'); pin(tb, N, 9); tb.rect(0, 0, 16, 2, K)
    u = S.at('X6'); pin(u, N, 10); u.vl(0, 0, 16, Nh)
    f = S.at('X7'); pin(f, N, 11); f.vl(0, 0, 16, Nh); f.rect(0, 11, 16, 2, W_); f.px(10, 11, G); f.rect(0, 13, 16, 3, sk)
    hn = S.at('X8'); bare_hand(hn, sk, sh, dk, hi)
    for x in (2, 6, 10): hn.px(x, 13, '#d8a890')   # scarred knuckles
    th = S.at('X9'); pin(th, N, 12)
    sn = S.at('X10'); pin(sn, N, 13); sn.rect(0, 10, 16, 6, W_); sn.hl(0, 10, 16, Wd_); sn.px(12, 12, K); sn.px(12, 14, K)   # white spats
    fo = S.at('X11'); shoe(fo, K, '#4a4a58', '#000000', '#2a2a2a'); fo.rect(0, 0, 16, 5, W_)
    swatch(S, 15, sk)
    remap(S, {'#ff7080': '#f08890', '#000000': '#100e10', '#141014': '#100e10', '#2a2a2a': '#2a2220', '#5a3a14': '#5a3a28', '#c8c0a8': '#c8c2b8', '#fff0b0': '#ffe8a0'})
    return S.save('assets/tex/sheet_enforcer.png', 32)

# =============================================================== Aoki Development's agent
# SIGNATURE: a red visor glowing across his eyes. X1 the visor's band, X2 its lens, X3 + SW(0) the slicked hair, X4 the high collar,
# X5 the glowing company badge, X12 the jacket's long skirt
def aokiagent():
    S = Sheet()
    sk, sh, dk, hi = '#f2d6c0', '#cca894', '#6a4a40', '#fff2e4'
    K, Kh, Ks, Wst = '#0c0a10', '#3a4a6a', '#5a5a6e', '#e8e8f0'
    Su, Sh, Sd = '#16161c', '#5a5a70', '#060608'
    R, Rh, Rd = '#ff2a3a', '#ffb0b8', '#a0101e'
    def fc(P, v):
        skin_face(P, sk, sh)
        P.rect(0, 0, 32, 8, K); P.rect(0, 0, 3, 12, Ks); P.rect(29, 0, 3, 12, Ks)   # slicked back, the sides shaved
        for x in (6, 13, 22): P.hl(x, 2, 4, Kh)
        P.rect(19, 0, 3, 8, Wst); P.px(20, 8, Wst)   # a white streak
        if v == 0:   # the visor: red light across his eyes, scanlines
            P.rect(1, 13, 30, 6, R); P.hl(1, 15, 30, Rh); P.hl(1, 17, 30, Rd); P.hl(4, 14, 8, '#ffffff')
        elif v == 1: P.rect(1, 13, 30, 6, Rd); P.hl(1, 15, 30, R); P.map(['#  ', ' # ', '  #'], {'#': '#ffffff'}, 20, 14)   # flickering, cracked
        else:
            P.rect(1, 15, 30, 5, '#2a0a10'); eye(P, 2, 8, 11, 4, W_, BLK, dk); eye(P, 2, 20, 11, 4, W_, BLK, dk)   # knocked down his face, dead
        P.vl(15, 19, 3, sh); P.px(14, 21, dk); P.px(17, 21, dk)
        for i in range(4): P.px(4 + i, 21 + i, sh); P.px(27 - i, 21 + i, sh)   # sharp cheekbones
        if v == 0: P.hl(12, 25, 8, dk); P.px(11, 26, dk); P.px(20, 26, dk)   # a thin, downturned line
        elif v == 1: mouth_hurt(P, 11, 24, 10, dk, W_)
        else: mouth_ko(P, 12, 24, 8, dk, '#c84858')
        P.px(1, 20, R)   # an LED stud in his ear
    faces3(S, fc)
    hd = S.at('HEADS'); hd.fill(Ks); hd.rect(0, 0, 16, 5, K); hd.hl(2, 2, 10, Kh); hd.rect(0, 6, 16, 2, Sd); hd.px(7, 6, R); hd.rect(0, 13, 16, 3, sh)
    vb = S.at('X1'); vb.fill(Sd); vb.rect(0, 5, 16, 6, '#2a2a34'); vb.hl(0, 7, 16, R); vb.px(3, 7, Rh); vb.px(12, 7, Rh)
    ln = S.at('X2'); ln.fill(R)   # the lens: hot red, scanlines, a bright sweep
    for y in range(0, 16, 3): ln.hl(0, y, 16, Rd)
    ln.rect(2, 4, 5, 6, Rh); ln.vl(3, 4, 6, '#ffffff')
    hr = S.at('X3'); hr.fill(K)
    for y in (2, 6, 10): hr.hl(0, y, 16, Kh)
    hr.rect(10, 0, 3, 16, Wst)
    swatch(S, 0, K); S.rect(49, 113, 2, 1, Kh)
    co = S.at('X4'); co.fill(Su); co.hl(0, 0, 16, R); co.hl(0, 1, 16, Sh); co.vl(0, 0, 16, Sh)
    bd = S.at('X5'); bd.fill(Sd); bd.disc(7.5, 7.5, 7, Rd); bd.disc(7.5, 7.5, 6, R); bd.map(['   #   ', '  ###  ', '  # #  ', ' ##### ', ' #   # ', '##   ##'], {'#': '#ffffff'}, 4, 4)   # the Aoki mark, lit
    def suit(P, k):
        P.fill(Su); P.grain(Su, '#22222a', 0.15, k)
    t = S.at('TA'); suit(t, 2)   # a narrow black suit: a sliver of white shirt, a black tie, red-piped lapels
    t.map(['SSSSSSWWWWSSSSSS', 'SSSSSrWKKWrSSSSS', 'SSSSrhSWKKWShrSSS'[:16], 'SSSrhSSKKSShrSSS', 'SSrhSSSKKSSShrSS', 'SSSSSSSKKSSSSSSS', 'SSSSSSSKKSSSSSSS', 'SSSSSSSSSSSSSSSS'],
          {'S': None, 'W': W_, 'K': K, 'r': R, 'h': Sh}, 0, 0)
    t.px(7, 9, Sh); t.px(7, 12, Sh); t.vl(7, 8, 8, Sd); t.hl(11, 5, 3, R)   # buttons, a red pocket square's edge
    b = S.at('TA_B'); suit(b, 3); b.vl(7, 0, 16, R); b.hl(0, 0, 16, Sh); b.disc(7.5, 4.5, 2.2, Rd); b.disc(7.5, 4.5, 1.3, R)   # a red seam down the spine, the company's mark
    s_ = S.at('TA_S'); suit(s_, 4); s_.vl(7, 0, 16, Sh)
    sk_ = S.at('X12'); suit(sk_, 5); sk_.vl(7, 4, 12, Rd); sk_.vl(8, 4, 12, Sd); sk_.hl(1, 3, 4, Sh); sk_.hl(11, 3, 4, Sh); sk_.vl(0, 0, 16, Sh); sk_.vl(15, 0, 16, Sh)
    tb = S.at('TB'); suit(tb, 6)
    u = S.at('X6'); limb(u, Su, Sh, Sd)
    f = S.at('X7'); limb(f, Su, Sh, Sd); f.rect(0, 12, 16, 2, W_); f.px(11, 12, R)
    hn = S.at('X8'); bare_hand(hn, Sd, '#2a2a34', '#000000', Sh)   # black gloves
    th = S.at('X9'); limb(th, Su, Sh, Sd); th.vl(7, 0, 16, Sh)
    sn = S.at('X10'); limb(sn, Su, Sh, Sd); sn.vl(7, 0, 13, Sh); sn.rect(0, 13, 16, 3, K)
    fo = S.at('X11'); shoe(fo, K, '#6a7488', '#000000', Rd)   # red soles
    swatch(S, 15, sk)
    return S.save('assets/tex/sheet_aokiagent.png', 32)

if __name__ == '__main__':
    import sys
    only = sys.argv[1:]
    for f in (harmony, enforcer, aokiagent):
        if not only or f.__name__ in only: print(f.__name__, f(), 'colours')
