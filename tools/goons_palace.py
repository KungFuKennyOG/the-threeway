"""Paints the Palace of Sport and Parade Square goons (64x128 sheets, the layout in src/characters.js and tools/goonkit.py):
the sambo fighter, the gymnast, the weightlifter, the honour guard, the bandsman and the specialist; plus their props
(the flagpole, cymbal, drumstick) and the SWEPT! / DODGE! labels. Run from the repo root: python3 tools/goons_palace.py"""
from goonkit import Sheet, Pane, face, panel, swatch, sign, H

def heads(S, rows, pal): panel(S, 'HEADS', rows, pal)
def hand(S, skin, shade, knuckle=None):   # TC rows 12-15: the bare hand under the sleeve
    S.rect(32, 59, 16, 1, shade); S.rect(32, 60, 16, 4, skin); S.rect(32, 63, 16, 1, knuckle or shade)
def eight(S, x0, rows, pal):   # an 8-wide strip in the TD half panels (x0 = 48 for TD_L, 56 for TD_R)
    assert len(rows) == 16 and all(len(r) == 8 for r in rows)
    S.map(x0, 48, rows, pal)
def sleeve(S, rows, pal):     # TC rows 0-10
    assert len(rows) == 11 and all(len(r) == 16 for r in rows)
    S.map(32, 48, rows, pal)

# =============================================================== the sambo fighter
def sambo():
    S = Sheet()
    sk, sh, dk, hr = '#e2b08a', '#c48a68', '#7a4a38', '#2a1c14'
    R, D, W, B, b = '#b8231e', '#7a1a16', '#f4f1ea', '#2a4aa0', '#18307a'
    def fringe(P, v):
        for x in (3, 4, 8, 9, 10, 14, 15, 19, 20, 25, 26, 27): P.px(x, 5, hr)
        for x in (4, 9, 15, 20, 26): P.px(x, 6, hr)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=5, sideTo=11, fringe=fringe, brow=hr, browStyle='angry', mouthStyle='flat', white=W))
    pal = {'R': R, 'D': D, 'W': W, 'B': B, 'b': b, 's': sk, 'h': sh, 'k': hr}
    heads(S, ['kkkkkkkkkkkkkkkk'] * 10 + ['hkkkkkkkkkkkkkkh', 'hhhkkkkkkkkkkhhh'] + ['hhhhhhhhhhhhhhhh'] * 4, pal)
    panel(S, 'TA', ['RRRRRDsssssDRRRR', 'RRRRRDsshssDRRRR', 'DDDDDRDshhDRDDDD', 'RRRRRRDsshDRRRRR', 'RRRRRRRDshDRRRRR', 'RRRRRRRRDDRRRRRR',
                    'RRRRRRRDRRRRRRRR', 'RRRRRRDRRRRRRRRR', 'RRRRRDRRRRRRRRRR', 'RRRRDRRRRRRRRRRR', 'RRRDRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR',
                    'RRRRRRRRRRRRRRRR', 'DRRRRRRRRRRRRRRD', 'RRRRRRRRRRRRRRRR', 'DDDDDDDDDDDDDDDD'], pal)
    panel(S, 'TA_B', ['RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR', 'DDDDDDDDDDDDDDDD'] + ['RRRRRRRDRRRRRRRR'] * 4 +
                     ['RRRRWWWWWWWWRRRR', 'RRRWBBBBBBBBWRRR', 'RRRWBWWBBWWBWRRR', 'RRRWBBBBBBBBWRRR', 'RRRRWWWWWWWWRRRR'] + ['RRRRRRRDRRRRRRRR'] * 3 + ['DDDDDDDDDDDDDDDD'], pal)
    panel(S, 'TA_S', ['RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR', 'DDDDDDDDDDDDDDDD'] + ['RRRRRRRDRRRRRRRR'] * 12 + ['DDDDDDDDDDDDDDDD'], pal)
    panel(S, 'TB', ['RRRRRRRRRRRRRRRR'] * 9 + ['RRRRRRRDRRRRRRRR', 'DDDDDDDDDDDDDDDD'] + ['BBBBBBBbBBBBBBBB'] * 4 + ['bbbbbbbbbbbbbbbb'], pal)
    panel(S, 'X2', ['bbbbbbbbbbbbbbbb', 'BBBBBBBBBBBBBBBB', 'BBBBBbbbbbbBBBBB', 'BBBBbBBBBBBbBBBB', 'BBBBbBBBBBBbBBBB', 'BBBBbBBBBBBbBBBB',
                    'BBBBbBBBBBBbBBBB', 'BBBBbBBBBBBbBBBB', 'BBBBbBBBBBBbBBBB', 'BBBBbBBBBBBbBBBB', 'BBBBbBBBBBBbBBBB', 'BBBBbBBBBBBbBBBB',
                    'BBBBbBBBBBBbBBBB', 'BBBBBbbbbbbBBBBB', 'BBBBBBBBBBBBBBBB', 'bbbbbbbbbbbbbbbb'], pal)   # the belt's knot
    panel(S, 'X3', ['bbbbbbbbbbbbbbbb'] + ['BBBBBBBBBBBBBBBB'] * 14 + ['bbbbbbbbbbbbbbbb'], pal)
    panel(S, 'X4', ['BBBBBBBbBBBBBBBB'] * 4 + ['bbbbbbbbbbbbbbbb'] + ['hssssssssssssssh'] * 9 + ['hhsssshhhhsssshh', 'hssssssssssssssh'], pal)   # shorts, bare thigh, the knee
    panel(S, 'X5', ['hsssssssssssssss'] * 8 + ['bbbbbbbbbbbbbbbb', 'BBBBBBBWWBBBBBBB', 'BBBBBBWBBWBBBBBB', 'RRRRRRRRRRRRRRRR', 'BBBBBBWBBWBBBBBB', 'BBBBBBBWWBBBBBBB', 'BBBBBBBBBBBBBBBB', 'bbbbbbbbbbbbbbbb'], pal)
    eight(S, 56, ['BBBBBBBB', 'BBBWWBBB', 'BBWBBWBB', 'BBBWWBBB', 'RRRRRRRR', 'RRRRRRRR', 'BBBBBBBB', 'BBBBBBBB', 'BBBBBBBB', 'BBBBBBBB', 'BBBBBBBB', 'BBBBBBBB', 'bbbbbbbb', 'WWWWWWWW', 'WWWWWWWW', 'bbbbbbbb'], pal)
    sleeve(S, ['DRRRRRRRRRRRRRRD'] * 3 + ['RRRRRRRRRRRRRRRR'] * 5 + ['DDDDDDDDDDDDDDDD', 'RRRRRRRRRRRRRRRR', 'DDDDDDDDDDDDDDDD'], pal)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_sambo.png')

# =============================================================== the gymnast
def gymnast():
    S = Sheet()
    sk, sh, dk, hr, hl = '#f2c4a4', '#d49c7c', '#8a5244', '#3a2216', '#6a4428'
    R, D, G, W, Ws, lip = '#c42a24', '#8a1a18', '#f2c14e', '#f4f1ea', '#c9c4bc', '#b23a44'
    def crown(P, v):
        for y in range(6): P.px(15 - y // 2, y, hl)        # the centre part
        for x in (6, 10, 21, 25): P.px(x, 3, hl)           # comb lines
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=6, sideTo=14, crownFn=crown, brow=hr, browStyle='arched', lashes=True, lip=lip, tongue=lip,
                 mouthStyle='pursed', white=W, cheek='#e8a890'))
    pal = {'R': R, 'D': D, 'G': G, 'W': W, 'w': Ws, 's': sk, 'h': sh, 'k': hr, 'l': hl}
    heads(S, ['kkklkkkkklkkkkkk', 'kkkkkkkkkkkkkkkk', 'klkkkkklkkkkklkk', 'kkkkkkkkkkkkkkkk', 'kkkkklkkkkklkkkk', 'kkkkkkkkkkkkkkkk',
              'kklkkkkklkkkkkkk', 'kkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk', 'hkkkkkkkkkkkkkkh', 'hhkkkkkkkkkkkkhh'] + ['hhhhhhhhhhhhhhhh'] * 4, pal)
    panel(S, 'X3', ['kkkkkllkkkkkkkkk', 'kkklkkkkllkkkkkk', 'kklkkkkkkklkkkkk', 'klkkkkllkkkklkkk', 'klkkklkklkkklkkk', 'klkkklkkklkklkkk',
                    'kklkkkllkkklkkkk', 'kkklkkkkkklkkkkk', 'kkkkllllllkkkkkk', 'kkkkkkkkkkkkkkkk'] + ['kkkkkkkkkkkkkkkk'] * 6, pal)   # the bun
    zip_ = 'RRRRRRRwwRRRRRRR'
    panel(S, 'TA', ['GGGGGGGGGGGGGGGG', 'RRRRRRRwwRRRRRRR', zip_, zip_, 'GGGGGGGwwGGGGGGG', 'GGGGGGGwwGGGGGGG'] + [zip_] * 8 + ['DDDDDDDwwDDDDDDD', 'DDDDDDDDDDDDDDDD'], pal)
    panel(S, 'TA_B', ['GGGGGGGGGGGGGGGG'] + ['RRRRRRRRRRRRRRRR'] * 3 + ['GGGGGGGGGGGGGGGG'] * 2 + ['RRRRRRRRRRRRRRRR'] * 8 + ['DDDDDDDDDDDDDDDD'] * 2, pal)
    panel(S, 'TA_S', ['GGGGGGGGGGGGGGGG'] + ['RRRRRRRRRRRRRRRR'] * 3 + ['GGGGGGGGGGGGGGGG'] * 2 + ['RRRRRRRGGRRRRRRR'] * 8 + ['DDDDDDDDDDDDDDDD'] * 2, pal)
    panel(S, 'X2', ['RRRRRRRRRRRRRRRR'] * 7 + ['RRRRRRRDDRRRRRRR', 'RRRRRRDDDDRRRRRR', 'DRRRRDDWWDDRRRRD', 'WDDDDWWWWWWDDDDW'] + ['wWWWWWWWWWWWWWWw'] * 5, pal)
    panel(S, 'TB', ['wWWWWWWWWWWWWWWw'] * 6 + ['wWWWWWwwwWWWWWWw', 'wWWWWWWWWWWWWWWw'] + ['wWWWWWWWWWWWWWWw'] * 8, pal)
    eight(S, 56, ['wWWWWWWw'] * 9 + ['wWWWWWWw', 'WWWWWWWW', 'WWWwwWWW', 'WWWWWWWW', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'], pal)
    sleeve(S, ['GRRRRRRRRRRRRRRG'] * 10 + ['DDDDDDDDDDDDDDDD'], pal)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_gymnast.png')

# =============================================================== the weightlifter
def lifter():
    S = Sheet()
    sk, sh, dk, hr = '#d8a07c', '#b07a5c', '#6a4030', '#1e1612'
    N, n, R, L, l, G, W = '#1e2e5a', '#121c3a', '#b8231e', '#7a4a28', '#4a2c18', '#f2c14e', '#f4f1ea'
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=4, sideTo=9, brow=hr, browStyle='heavy', stache=hr, mouthStyle='frown', white=W,
                 extra=lambda P, v: [P.px(x, 28, sh) for x in (8, 11, 14, 17, 20, 23)]))
    pal = {'N': N, 'n': n, 'R': R, 'L': L, 'l': l, 'G': G, 'W': W, 's': sk, 'h': sh, 'k': hr}
    heads(S, ['kkkkkkkkkkkkkkkk'] * 5 + ['hkkkkkkkkkkkkkkh', 'hhkkkkkkkkkkkkhh'] + ['hsssssssssssssh'.ljust(16, 'h')] * 4 + ['hhhhhhhhhhhhhhhh'] * 5, pal)
    swatch(S, 4, hr)   # the flat-top
    panel(S, 'TA', ['ssshNNssssNNhsss', 'ssshNNhsshNNhsss', 'sshNNNNhhNNNNhss', 'hRRNNNNNNNNNNRRh', 'RRNNNNNNNNNNNNRR', 'RRNNNNNNNNNNNNRR',
                    'RRNNNNNGGNNNNNRR', 'RRNNNNGnnGNNNNRR', 'RRNNNNGnnGNNNNRR', 'RRNNNNNGGNNNNNRR', 'RRNNNNNNNNNNNNRR', 'RRNNNNNNNNNNNNRR',
                    'RRNNNNNNNNNNNNRR', 'RRNNNNNNNNNNNNRR', 'RRnNNNNNNNNNNnRR', 'RRnnnnnnnnnnnnRR'], pal)
    panel(S, 'TA_B', ['sssshNNNNNNhssss', 'sssNNNNNNNNNNsss', 'shNNNNNNNNNNNNhs'] + ['RRNNNNNNNNNNNNRR'] * 12 + ['RRnnnnnnnnnnnnRR'], pal)
    panel(S, 'TA_S', ['ssssssssssssssss', 'hsssssssssssssss', 'hhsssssssssssshh', 'NNhhhhhhhhhhhhNN'] + ['NNNNNNRRRRNNNNNN'] * 11 + ['nnnnnnRRRRnnnnnn'], pal)
    panel(S, 'TB', ['RRNNNNNNNNNNNNRR'] * 12 + ['RRNNNNNnnNNNNNRR', 'RRNNNNnnnnNNNNRR', 'RRnnnnnnnnnnnnRR', 'nnnnnnnnnnnnnnnn'], pal)
    panel(S, 'X2', ['NNNNNNNNNNNNNNRR'] * 4 + ['nnnnnnnnnnnnnnnn'] + ['hssssssssssssssh'] * 10 + ['hhssssssssssssh'.ljust(16, 'h')], pal)
    panel(S, 'X5', ['WWWWWWWWWWWWWWWW', 'WhWWWhWWWWhWWWhW', 'WWWWWWWWWWWWWWWW', 'WWWhWWWWhWWWWhWW', 'hhhhhhhhhhhhhhhh'] +
                   ['hsssssssssssssh'.ljust(16, 'h')] * 8 + ['RRRRRRRRRRRRRRRR', 'RRRRRRRWWRRRRRRR', 'RRRRRRRRRRRRRRRR'], pal)
    eight(S, 56, ['RRRRRRRR', 'RRRWWRRR', 'RRRRRRRR', 'WWWWWWWW', 'RRRRRRRR', 'RRRRRRRR', 'RRRRRRRR', 'RRRRRRRR', 'RRRRRRRR', 'RRRRRRRR', 'RRRRRRRR', 'RRRRRRRR',
                  'RRRRRRRR', 'WWWWWWWW', 'WWWWWWWW', 'llllllll'], pal)
    panel(S, 'X3', ['hhsssssssssssshh', 'hssssssssssssssh', 'hsssssssssssss h'.replace(' ', 's'), 'hssssshhhssssssh', 'hssssssssshsssssh'[:16], 'hssssssssssssssh',
                    'hhsssssssssssshh', 'hhhssssssssshhhh', 'hssssssssssssssh', 'hsssshsssssssssh', 'hssssshsssssssh'.ljust(16, 'h'), 'hssssssssssssssh',
                    'hssssssssssssssh', 'hhsssssssssssshh', 'hhssssssssssshhh', 'hhhsssssssssshhh'], pal)   # bare arms: biceps, veins
    panel(S, 'X4', ['WWWWWWWWWWWWWWWW', 'WhWWWWhWWWWhWWWW', 'WWWWWWWWWWWWWWWW', 'WWWhWWWWWhWWWWhW', 'hhhhhhhhhhhhhhhh'] + ['sssssssssssssss'.ljust(16, 'h')] * 7 +
                   ['ssWssssssWsssssh', 'hhhhhhhhhhhhhhhh', 'shshshshshshshsh', 'hhhhhhhhhhhhhhhh'], pal)   # wrist wraps, chalky hands
    panel(S, 'X6', ['llllllllllllllll', 'LLLLLLLLLLLLLLLL', 'LLLLGGGGGGGGLLLL', 'LLLLGllllllGLLLL', 'LLLLGlLLLLlGLLLL', 'LLLLGlLLLLlGLLLL',
                    'LGGGGGGGGGGGGGGL', 'LLLLGlLLLLlGLLLL', 'LLLLGlLLLLlGLLLL', 'LLLLGlLLLLlGLLLL', 'LLLLGlLLLLlGLLLL', 'LLLLGllllllGLLLL',
                    'LLLLGGGGGGGGLLLL', 'LLLLLLLLLLLLLLLL', 'LLLLLLLLLLLLLLLL', 'llllllllllllllll'], pal)
    panel(S, 'X7', ['llllllllllllllll', 'LLLLLLLLLLLLLLLL', 'LlLlLlLlLlLlLlLl'] + ['LLLLLLLLLLLLLLLL'] * 10 + ['lLlLlLlLlLlLlLlL', 'LLLLLLLLLLLLLLLL', 'llllllllllllllll'], pal)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_lifter.png')

# =============================================================== the honour guard
def guard():
    S = Sheet()
    sk, sh, dk, hr = '#e8b894', '#c49070', '#7a4c3a', '#3a2a1e'
    C, c, R, G, g, W, w, K, kh = '#5c6268', '#3c4248', '#b8231e', '#f2c14e', '#a8822a', '#f4f1ea', '#c8c4bc', '#141014', '#4a4a58'
    def band(P, v):
        P.rect(0, 0, 32, 1, G); P.rect(0, 1, 32, 3, R); P.rect(0, 4, 32, 1, K)
        P.rect(14, 1, 4, 3, G); P.px(14, 1, R); P.px(17, 1, R); P.px(14, 3, R); P.px(17, 3, R); P.rect(15, 2, 2, 1, g)   # the gold cog
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=5, crownFn=band, side=hr, sideTo=10, brow=hr, browStyle='heavy', mouthStyle='flat', white=W, look=0))
    pal = {'C': C, 'c': c, 'R': R, 'G': G, 'g': g, 'W': W, 'w': w, 'K': K, 'k': kh, 's': sk, 'h': sh, 'H': hr}
    heads(S, ['GGGGGGGGGGGGGGGG', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR', 'KKKKKKKKKKKKKKKK'] + ['HHHHHHHHHHHHHHHH'] * 6 + ['hhhhhhhhhhhhhhhh'] * 5, pal)
    panel(S, 'X1', ['RRRRRRRRRRRRRRRR'] + ['CCCCCCCCCCCCCCCC'] * 11 + ['cccccccccccccccc', 'GGGGGGGGGGGGGGGG', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR'], pal)
    swatch(S, 0, K); swatch(S, 1, C); swatch(S, 2, G)
    panel(S, 'TA', ['RRRcssssssscRRR'.ljust(16, 'R'), 'RRRCcssssscCRRRR', 'cCCCCchhhcCCCGGc', 'CCCCCCcccCCCGgCC', 'CCCGCCCCCCCGgCGC', 'CCCCGCCCCCGgCCCC',
                    'CCCGCGGCCGgCCGCC', 'CCCCCCCGGgCCCCCC', 'CCCGCCCCCCCCCGCC', 'CCCCCCCCCCCCCCCC', 'CCCGCCCCCCCCCGCC', 'CCCCCCCCCCCCCCCC',
                    'WWWWWWWGGWWWWWWW', 'wwwwwwwGGwwwwwww', 'CCCCCCCccCCCCCCC', 'CCCCCCCccCCCCCCC'], pal)
    panel(S, 'TA_B', ['RRRRRRRRRRRRRRRR', 'ccRRRRRRRRRRRRcc', 'CCCCCCCCCCCCCCCC'] + ['CCCCCCCccCCCCCCC'] * 9 + ['WWWWWWWWWWWWWWWW', 'wwwwwwwwwwwwwwww', 'CCCCCCCccCCCCCCC', 'CCCCCCCccCCCCCCC'], pal)
    panel(S, 'TA_S', ['RRRRRRRRRRRRRRRR', 'CCCCCCCCCCCCCCCC'] + ['CCCCCCCcCCCCCCCC'] * 10 + ['WWWWWWWWWWWWWWWW', 'wwwwwwwwwwwwwwww', 'CCCCCCCcCCCCCCCC', 'CCCCCCCcCCCCCCCC'], pal)
    panel(S, 'TB', ['CCCCCCCccCCCCCCC'] * 13 + ['CCCCCCCccCCCCCCC', 'cccccccccccccccc', 'cccccccccccccccc'], pal)
    eight(S, 48, ['cccRRccc'] * 16, pal)
    eight(S, 56, ['KKKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKkK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    sleeve(S, ['cCCCCCCCCCCCCCCc'] * 7 + ['RRRRRRRRRRRRRRRR', 'CCCCCCCCCCCCCCCC', 'cccccccccccccccc', 'cccccccccccccccc'], pal)
    S.rect(32, 59, 16, 1, w); S.rect(32, 60, 16, 4, W); S.rect(32, 63, 16, 1, w); S.rect(39, 60, 1, 3, w)   # white gloves
    return S.save('assets/tex/sheet_guard.png')

# =============================================================== the bandsman
def bandsman():
    S = Sheet()
    sk, sh, dk, hr = '#e2ac88', '#be8868', '#76483a', '#5a3a24'
    R, D, G, N, n, W, w, K = '#c42a24', '#86181a', '#f2c14e', '#1e2444', '#12162c', '#f4f1ea', '#c8c4bc', '#141014'
    def band(P, v):
        P.rect(0, 0, 32, 4, R); P.rect(0, 4, 32, 1, K)
        P.rect(14, 0, 4, 4, G); P.rect(15, 1, 2, 2, R)   # a gold badge
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=5, crownFn=band, side=hr, sideTo=11, brow=hr, browStyle='heavy', stache=hr, mouthStyle='smirk',
                 white=W, cheek='#e8907a'))
    pal = {'R': R, 'D': D, 'G': G, 'N': N, 'n': n, 'W': W, 'w': w, 'K': K, 's': sk, 'h': sh, 'H': hr}
    heads(S, ['RRRRRRRRRRRRRRRR'] * 4 + ['KKKKKKKKKKKKKKKK'] + ['HHHHHHHHHHHHHHHH'] * 6 + ['hhhhhhhhhhhhhhhh'] * 5, pal)
    panel(S, 'X1', ['wwwwwwwwwwwwwwww'] + ['WWWWWWWWWWWWWWWW'] * 11 + ['wwwwwwwwwwwwwwww', 'GGGGGGGGGGGGGGGG', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR'], pal)
    swatch(S, 0, K); swatch(S, 1, W)
    frog = 'RRGGGGGDDGGGGGRR'
    panel(S, 'TA', ['NNNNNNsssNNNNNNN', 'NNNNNNNhNNNNNNNN', 'GGGGGGGDDGGGGGGG', 'RRRRRRRDDRRRRRRR', 'RGGGGGGDDGGGGGGR', frog.replace('GGGGG', 'RRRRR', 0), 'RRRRRRRDDRRRRRRR',
                    'RGGGGGGDDGGGGGGR', 'RRRRRRRDDRRRRRRR', 'RRRRRRRDDRRRRRRR', 'RGGGGGGDDGGGGGGR', 'RRRRRRRDDRRRRRRR', 'RRRRRRRDDRRRRRRR', 'RGGGGGGDDGGGGGGR',
                    'RRRRRRRDDRRRRRRR', 'GGGGGGGGGGGGGGGG'], pal)
    panel(S, 'TA_B', ['NNNNNNNNNNNNNNNN', 'NNNNNNNNNNNNNNNN', 'GGGGGGGGGGGGGGGG', 'RRRRRRRRRRRRRRRR', 'RRRRGRRRRRRGRRRR', 'RRRRRGRRRRGRRRRR', 'RRRRRRGRRGRRRRRR',
                     'RRRRRRRGGRRRRRRR'] + ['RRRRRRRDRRRRRRRR'] * 7 + ['GGGGGGGGGGGGGGGG'], pal)
    panel(S, 'TA_S', ['NNNNNNNNNNNNNNNN', 'NNNNNNNNNNNNNNNN', 'GGGGGGGGGGGGGGGG'] + ['RRRRRRRGRRRRRRRR'] * 12 + ['GGGGGGGGGGGGGGGG'], pal)
    panel(S, 'TB', ['RRRRRRRDDRRRRRRR'] * 5 + ['GGGGGGGGGGGGGGGG'] + ['NNNNNNNnNNNNNNNN'] * 9 + ['nnnnnnnnnnnnnnnn'], pal)
    eight(S, 48, ['NNNGGNNN'] * 15 + ['nnnGGnnn'], pal)
    eight(S, 56, ['KKKKKKKK'] * 9 + ['KnKKKKKK', 'KnKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    sleeve(S, ['DRRRRRRRRRRRRRRD'] * 6 + ['RRRRRRRGRRRRRRRR', 'RRRRRRGRGRRRRRRR', 'GGGGGGGGGGGGGGGG', 'RRRRRRRRRRRRRRRR', 'GGGGGGGGGGGGGGGG'], pal)
    hand(S, sk, sh)
    panel(S, 'X2', ['RRRRRRRRRRRRRRRR', 'GGGGGGGGGGGGGGGG', 'RRRRRRRRRRRRRRRR', 'WGWWWWGWWWWGWWWW', 'WWGWWWWGWWWWGWWW', 'WWWGWWWWGWWWWGWW', 'WWWWGWWWWGWWWWGW',
                    'WWWGWWWWGWWWWGWW', 'WWGWWWWGWWWWGWWW', 'WGWWWWGWWWWGWWWW', 'GWWWWGWWWWGWWWWG', 'WGWWWWGWWWWGWWWW', 'WWGWWWWGWWWWGWWW',
                    'RRRRRRRRRRRRRRRR', 'GGGGGGGGGGGGGGGG', 'RRRRRRRRRRRRRRRR'], pal)   # the snare's shell
    panel(S, 'X3', ['RRRRRRRRRRRRRRRR', 'RwwwwwwwwwwwwwwR'] + ['RwWWWWWWWWWWWWwR'] * 12 + ['RwwwwwwwwwwwwwwR', 'RRRRRRRRRRRRRRRR'], pal)
    return S.save('assets/tex/sheet_bandsman.png')

# =============================================================== the specialist
def specialist():
    S = Sheet()
    sk, sh, dk, hr, hl = '#d8a888', '#b48468', '#6c4636', '#2a2624', '#4a4440'
    L, Lh, Lm, W, K, Z, sc = '#1e1c22', '#3c3844', '#2c2a32', '#e8e6e0', '#0e0c10', '#9a9aa6', '#b06a5a'
    def crew(P, v):
        for (x, y) in ((4, 1), (9, 2), (13, 0), (18, 3), (22, 1), (27, 2), (7, 3), (25, 3)): P.px(x, y, hl)
    def scar(P, v):
        for i in range(5): P.px(9 + i // 2, 9 + i, sc)
        P.px(23, 22, sh)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=4, crownFn=crew, sideTo=9, brow=hr, browStyle='angry', mouthStyle='flat', white=W, pupil=K,
                 extra=scar, stubble=sh))
    pal = {'L': L, 'l': Lh, 'm': Lm, 'W': W, 'K': K, 'Z': Z, 's': sk, 'h': sh, 'H': hr, 'e': hl}
    heads(S, ['HHHeHHHHHHeHHHHH', 'HeHHHHHeHHHHHHeH', 'HHHHHeHHHHHHeHHH', 'HHeHHHHHHeHHHHHH', 'HHHHHHHHHHHHHeHH', 'hHHHHeHHHHHHHHHh', 'hhHHHHHHHHHHHHhh'] +
          ['hssssssssssssssh'] * 5 + ['hhhhhhhhhhhhhhhh'] * 4, pal)
    panel(S, 'TA', ['mmmmmmssssmmmmmm', 'mmmmmmhssmmmmmmm', 'LLLlLZKKKKZLLLLL', 'LLlLLZKKKKZLLlLL', 'LLLLLZKKKKZLLLLL', 'LlLLLZKKKKZLLLLL', 'LLLLLZKKKKZLLLLl',
                    'LLLlLZKKKKZLlLLL', 'LLLLLZKKKKZLLLLL', 'LLLLLZKKKKZLLLLL', 'LlllLZKKKKZLlllL', 'LLLLLZKKKKZLLLLL', 'LLLLLZKKKKZLLLLL', 'LLLLLZKKKKZLLLLL',
                    'mmmmmZKKKKZmmmmm', 'mmmmmmmmmmmmmmmm'], pal)
    panel(S, 'TA_B', ['mmmmmmmmmmmmmmmm', 'mmmmmmmmmmmmmmmm', 'LLLLLLLLLLLLLLLL', 'LLlLLLLLLLLLlLLL', 'mmmmmmmmmmmmmmmm'] + ['LLLLlLLLLLLLLLLL', 'LLLLLLLLLlLLLLLL'] * 5 + ['mmmmmmmmmmmmmmmm'], pal)
    panel(S, 'TA_S', ['mmmmmmmmmmmmmmmm', 'mmmmmmmmmmmmmmmm'] + ['LLLlLLLLLLLLLLLL'] * 12 + ['mmmmmmmmmmmmmmmm', 'mmmmmmmmmmmmmmmm'], pal)
    panel(S, 'TB', ['KKKKKKKKKKKKKKKK'] * 10 + ['KKKKKKKmmKKKKKKK'] * 6, pal)
    panel(S, 'X2', ['mKKKKKKKKKKKKKKm'] * 16, pal)
    panel(S, 'X3', ['KKKKWWKKKKWWKKKK'] * 16, pal)
    eight(S, 56, ['WWWWWWWW', 'WZWWWWZW', 'WWZWWZWW', 'WWWZZWWW', 'WWWWWWWW', 'WWWWWWWW', 'WWWWWWWW', 'WWWWWWWW', 'WZZWWZZW', 'WWWWWWWW', 'WWWWWWWW', 'WWWWWWWW', 'WWWWWWWW', 'ZZZZZZZZ', 'KKKKKKKK', 'KKKKKKKK'], pal)
    sleeve(S, ['mLLLLLLLLLLLLLLm', 'LLLLLLLLLLLLLLLL', 'LLLLLLLLLLLLLLLL', 'LlLLlLLLlLLLlLLL', 'LLLLLLLLLLLLLLLL', 'LLLLLLLLLLLLLLLL', 'LLLLLLLLLLLLLLLL',
           'LLlLLLlLLLlLLLlL', 'LLLLLLLLLLLLLLLL', 'mmmmmmmmmmmmmmmm', 'mmmmmmmmmmmmmmmm'], pal)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_specialist.png')

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
    for f in (sambo, gymnast, lifter, guard, bandsman, specialist):
        print(f.__name__, f(), 'colours')
    props(); print('props ok')
