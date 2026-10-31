"""Paints the Tower of Labor's goons (64x128 sheets, the layout in src/characters.js and tools/goonkit.py): the Ministry militiaman,
the inspector, the clerk, the Chairman's bodyguard, Inspector Vera Orlova, the Chairman; plus Orlova's baton.
All invented people. Run from the repo root: python3 tools/goons_tower.py"""
from goonkit import Sheet, Pane, face, panel, swatch
from goons_palace import heads, hand, eight, sleeve

def cog(P, x, y, G, g, bg):   # a 4x4 gold cog badge
    P.rect(x, y, 4, 4, G); P.px(x, y, bg); P.px(x + 3, y, bg); P.px(x, y + 3, bg); P.px(x + 3, y + 3, bg); P.rect(x + 1, y + 1, 2, 2, g)

# =============================================================== the Ministry militiaman
def militia():
    S = Sheet()
    sk, sh, dk, hr = '#dca884', '#b8846a', '#704436', '#3a2c22'
    U, u, R, G, g, L, K, k, W = '#4a5a78', '#33405a', '#b8231e', '#f2c14e', '#a8822a', '#6a4024', '#141014', '#484858', '#f4f1ea'
    def band(P, v): P.rect(0, 0, 32, 4, R); P.rect(0, 4, 32, 1, K); cog(P, 14, 0, G, g, R)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=5, crownFn=band, side=hr, sideTo=10, brow=hr, browStyle='heavy', stache=hr, mouthStyle='frown', white=W))
    pal = {'U': U, 'u': u, 'R': R, 'G': G, 'g': g, 'L': L, 'K': K, 'k': k, 'W': W, 's': sk, 'h': sh, 'H': hr}
    heads(S, ['RRRRRRRRRRRRRRRR'] * 4 + ['KKKKKKKKKKKKKKKK'] + ['HHHHHHHHHHHHHHHH'] * 5 + ['hhhhhhhhhhhhhhhh'] * 6, pal)
    panel(S, 'X1', ['RRRRRRRRRRRRRRRR'] + ['UUUUUUUUUUUUUUUU'] * 11 + ['uuuuuuuuuuuuuuuu', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR'], pal)
    swatch(S, 0, K); swatch(S, 1, U)
    panel(S, 'TA', ['RRUUUUshhsUUUULR', 'RRUUUUUhhUUUULLR', 'UUuuuuUGGUUUULLU', 'UUuUUuUUUUUULLUU', 'UUuUUuUGGUULLUUU', 'UUuuuuUUUULLUUUU',
                    'UUUUUUUGGLLUUUUU', 'UUUUUUUULLUUUUUU', 'UUUUUUULLGUUUUUU', 'UUUUUULLUUUUUUUU', 'UUUUULLUUGUUUUUU', 'LLLLLLLGGLLLLLLL',
                    'LLLLLLLGGLLLLLLL', 'UUUUUUUUUUUUUUUU', 'UUUUUUUuuUUUUUUU', 'uuuuuuuuuuuuuuuu'], pal)
    panel(S, 'TA_B', ['RRUUUUUUUUUUUURR', 'UUUUUUUUUUUUUULL', 'UUUUUUUUUUUUULLU', 'UUUUUUUUUUUULLUU', 'UUUUUUUUUUULLUUU', 'UUUUUUUUUULLUUUU',
                      'UUUUUUUUULLUUUUU', 'UUUUUUUULLUUUUUU', 'UUUUUUULLUUUUUUU', 'UUUUUULLUUUUUUUU', 'UUUUULLUUUUUUUUU', 'LLLLLLLLLLLLLLLL',
                      'LLLLLLLLLLLLLLLL', 'UUUUUUUuUUUUUUUU', 'UUUUUUUuUUUUUUUU', 'uuuuuuuuuuuuuuuu'], pal)
    panel(S, 'TA_S', ['UUUUUUUUUUUUUUUU'] * 11 + ['LLLLLLLLLLLLLLLL', 'LLLLLLLLLLLLLLLL', 'UUUUUUUUUUUUUUUU', 'UUUUUUUUUUUUUUUU', 'uuuuuuuuuuuuuuuu'], pal)
    panel(S, 'TB', ['UUUUUUUuUUUUUUUU'] * 5 + ['uuuuuuuuuuuuuuuu'] + ['uuuRuuuuuuuuRuuu'] * 10, pal)
    eight(S, 48, ['uuuRRuuu'] * 16, pal)
    eight(S, 56, ['KKKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKkK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    sleeve(S, ['uUUUUUUUUUUUUUUu'] * 7 + ['RRRRRRRRRRRRRRRR', 'UUUUUUUUUUUUUUUU', 'uuuuuuuuuuuuuuuu', 'uuuuuuuuuuuuuuuu'], pal)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_militia.png')

# =============================================================== the inspector
def inspector():
    S = Sheet()
    sk, sh, dk, hr = '#e6bc9c', '#c49a7c', '#7a5040', '#5a4a3a'
    U, u, N, G, K, W, w, B = '#56647e', '#3a4660', '#1e2a4a', '#f2c14e', '#141014', '#f4f1ea', '#a8a8b0', '#8a6034'
    def band(P, v): P.rect(0, 0, 32, 4, N); P.rect(0, 4, 32, 1, K); cog(P, 14, 0, G, N, N)
    def pencil(P, v): P.rect(11, 22, 4, 1, hr); P.rect(17, 22, 4, 1, hr)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=5, crownFn=band, side=hr, sideTo=10, brow=hr, browStyle='thin', mouthStyle='pursed', white=W,
                 heavyLids=sh, look=1, extra=pencil))
    pal = {'U': U, 'u': u, 'N': N, 'G': G, 'K': K, 'W': W, 'w': w, 'B': B, 's': sk, 'h': sh, 'H': hr}
    heads(S, ['NNNNNNNNNNNNNNNN'] * 4 + ['KKKKKKKKKKKKKKKK'] + ['HHHHHHHHHHHHHHHH'] * 5 + ['hhhhhhhhhhhhhhhh'] * 6, pal)
    panel(S, 'X1', ['NNNNNNNNNNNNNNNN'] + ['UUUUUUUUUUUUUUUU'] * 11 + ['uuuuuuuuuuuuuuuu', 'NNNNNNNNNNNNNNNN', 'NNNNNNNNNNNNNNNN', 'NNNNNNNNNNNNNNNN'], pal)
    swatch(S, 0, K); swatch(S, 1, U); swatch(S, 2, B)
    panel(S, 'TA', ['uUUUUushhsuUUUUu', 'UuUUUUuhhuUUUUuU', 'UUuUUUUuuUUUUuUU', 'UUUuUGUUUUUUuUUU', 'UUUUuUUUUUUuUGGU', 'UUUUUGUUUUUUUGGU',
                    'UUUUUuUUUUUUUUUU', 'UUUUUGUUUUUUUUUU', 'UUUUUuUUUUUUUUUU', 'UUUUUGUUUUUUUUUU', 'UUUUUuUUUUUUUUUU', 'KKKKKKKGGKKKKKKK',
                    'KKKKKKKGGKKKKKKK', 'UUUUUuUUUUUUUUUU', 'UUUUUGUUUUUUUUUU', 'UUUUUuUUUUUUUUUU'], pal)
    panel(S, 'TA_B', ['uuUUUUUUUUUUUUuu', 'UUUUUUUUUUUUUUUU'] + ['UUUUUUUuUUUUUUUU'] * 9 + ['KKKKKKKKKKKKKKKK', 'KKKKKKKKKKKKKKKK'] + ['UUUUUUUuUUUUUUUU'] * 3, pal)
    panel(S, 'TA_S', ['UUUUUUUUUUUUUUUU'] * 11 + ['KKKKKKKKKKKKKKKK', 'KKKKKKKKKKKKKKKK'] + ['UUUUUUUUUUUUUUUU'] * 3, pal)
    panel(S, 'TB', ['UUUUUUUuUUUUUUUU'] * 14 + ['uuuuuuuuuuuuuuuu', 'uuuuuuuuuuuuuuuu'], pal)
    eight(S, 48, ['uuuuuuuu'] * 16, pal)
    eight(S, 56, ['KKKKKKKK'] * 10 + ['KwKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    sleeve(S, ['uUUUUUUUUUUUUUUu'] * 8 + ['UUUUUUUUUUUUUUUU', 'uuuuuuuuuuuuuuuu', 'uuuuuuuuuuuuuuuu'], pal)
    hand(S, sk, sh)
    panel(S, 'X2', ['BBBBBKKKKKKBBBBB', 'BBBBBKwwwwKBBBBB', 'BWWWWWWWWWWWWWWB', 'BWwwwwwwwwwwWWWB', 'BWWWWWWWWWWWWWWB', 'BWwwwwwwwwWWWWWB', 'BWWWWWWWWWWWWWWB',
                    'BWwwwwwwwwwwwWWB', 'BWWWWWWWWWWWWWWB', 'BWwwwwwWWWWWWWWB', 'BWWWWWWWWWWWWWWB', 'BWwwwwwwwwwWWWWB', 'BWWWWWWWWWWWWWWB', 'BWWWWWWWWKKKKWWB',
                    'BWWWWWWWWWWWWWWB', 'BBBBBBBBBBBBBBBB'], pal)   # paper on the clipboard (a signature at the bottom)
    panel(S, 'X3', ['BBBBBBBBBBBBBBBB'] * 16, pal)
    return S.save('assets/tex/sheet_inspector.png')

# =============================================================== the clerk
def clerk():
    S = Sheet()
    sk, sh, dk, hr = '#eac0a0', '#c89c80', '#7c5244', '#7a6a5a'
    W, w, V, v, R, T, t, K, wd = '#ecebe4', '#c4c2ba', '#6a4a30', '#48301e', '#b8231e', '#5a5a60', '#3e3e44', '#141014', '#a87848'
    def bald(P, v_):
        P.rect(3, 0, 26, 5, sk); P.rect(9, 1, 3, 1, '#f8dcc4' if False else W); P.rect(0, 0, 3, 5, sh); P.rect(29, 0, 3, 5, sh)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=sk, top=5, crownFn=bald, side=hr, sideTo=13, brow=hr, browStyle='thin', glasses='specs', frame=K,
                 mouthStyle='frown', white=W, tongue=R))
    pal = {'W': W, 'w': w, 'V': V, 'v': v, 'R': R, 'T': T, 't': t, 'K': K, 's': sk, 'h': sh, 'H': hr, 'd': wd}
    heads(S, ['ssssssssssssssss', 'sssWssssssssssss', 'ssssssssssssssss', 'hsssssssssssssss', 'HhssssssssssssHH', 'HHHHhsssssssHHHH'] +
          ['HHHHHHHHHHHHHHHH'] * 6 + ['hhhhhhhhhhhhhhhh'] * 4, pal)
    swatch(S, 2, wd); swatch(S, 3, K); swatch(S, 4, R)
    panel(S, 'TA', ['WWWWWWwKKwWWWWWW', 'WWWWWWWKKWWWWWWW', 'VVVVVWWKKWWVVVVV', 'VVVVVVWKKWVVVVVV', 'VVVVVVWKKWVVVVVV', 'VVVVVVVKKVVVVVVV',
                    'VVVVVVVvVVVVVVVV', 'VVVVVVVVVVVVVVVV', 'VVVVVVVvVVVVVVVV', 'VVVVVVVVVVVVVVVV', 'VVVVVVVvVVVVVVVV', 'VVVVVVVVVVVVVVVV',
                    'VVVVVVVvVVVVVVVV', 'VVVVVVVVVVVVVVVV', 'vVVVVVvVVvVVVVVv', 'TTTTTTTTTTTTTTTT'], pal)
    panel(S, 'TA_B', ['WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWvvvvvvvvvvvvWW'] + ['Wvvvvvvvvvvvvvvw'] * 7 + ['WvvVVVVVVVVVvvvW', 'Wvvvvvvvvvvvvvvw'] + ['Wvvvvvvvvvvvvvvw'] * 3 + ['TTTTTTTTTTTTTTTT'], pal)
    panel(S, 'TA_S', ['WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'wwwwwwwwwwwwwwww'] + ['VVVVVVVVVVVVVVVV'] * 11 + ['TTTTTTTTTTTTTTTT'], pal)
    panel(S, 'TB', ['KKKKKKKKKKKKKKKK'] + ['TTTTTTTtTTTTTTTT'] * 15, pal)
    eight(S, 48, ['TTTtTTTT'] * 16, pal)
    eight(S, 56, ['KKKKKKKK'] * 9 + ['KwKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    panel(S, 'X2', ['WWWWWWWWWWWWWWWW', 'wWWWWWWWWWWWWWWw'] + ['WWWWWWWWWWWWWWWW'] * 4 + ['RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR', 'wwwwwwwwwwwwwwww'] +
                   ['WWWWWWWWWWWWWWWW'] * 6 + ['wwwwwwwwwwwwwwww'], pal)   # upper sleeve: the red garter
    panel(S, 'X3', ['wWWWWWWWWWWWWWWw'] * 11 + ['wwwwwwwwwwwwwwww', 'WWWWWWWWWWWWWWWW', 'WWWWWWWKWWWWWWWW', 'WWWWWWWWWWWWWWWW', 'wwwwwwwwwwwwwwww'], pal)   # forearm, buttoned cuff
    S.rect(32, 48, 16, 11, W)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_clerk.png')

# =============================================================== the Chairman's bodyguard
def bodyguard():
    S = Sheet()
    sk, sh, dk, hr = '#d6a284', '#b07c64', '#6a4232', '#1c1816'
    Sx, s, sH, W, w, R, r, K, E = '#2e3038', '#1e2026', '#464952', '#f4f1ea', '#c4c2ba', '#a81e1e', '#701414', '#0c0c10', '#d8c8a8'
    def buzz(P, v):
        for (x, y) in ((5, 1), (10, 3), (16, 0), (21, 2), (26, 1), (13, 2)): P.px(x, y, sh)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=4, crownFn=buzz, sideTo=7, brow=hr, browStyle='heavy', glasses='shades', lens=K, lensHi='#5a6a80',
                 mouthStyle='flat', white=W, stubble=sh))
    pal = {'S': Sx, 's': s, 'l': sH, 'W': W, 'w': w, 'R': R, 'r': r, 'K': K, 'k': sk, 'h': sh, 'H': hr, 'E': E}
    heads(S, ['HHHHHHHHHHHHHHHH', 'HHhHHHHHHHHHhHHH', 'HHHHHHhHHHHHHHHH', 'HhHHHHHHHHhHHHHH', 'hHHHHHHHHHHHHHHh', 'hhHHHHHHHHHHHHhh'] +
          ['hkkkkkkkkkkkkkkh'] * 6 + ['hhhhhhhhhhhhhhhh'] * 4, pal)
    swatch(S, 2, E)
    panel(S, 'TA', ['SSSSSlWWWWlSSSSS', 'SSSSSlWRRWlSSSSS', 'SSSSSlWrrWlSSSSS', 'SSSSSSlRRlSSSSSS', 'SSWWSSlRRlSSSSSS', 'SSSSSSlRRlSSSSSS',
                    'SSSSSSSlRlSSSSSS', 'SSSSSSSlRlSSSSSS', 'SSSSSSSlrSSSSSSS', 'SSSSSSSSlSSSSSSS', 'SSSSSSSSKSSSSSSS', 'SSSSSSSSSSSSSSSS',
                    'SsssSSSSKSSSsssS', 'SSSSSSSSSSSSSSSS', 'SSSSSSSSSSSSSSSS', 'ssssssssssssssss'], pal)
    panel(S, 'TA_B', ['ssssssssssssssss', 'SSSSSSSSSSSSSSSS'] + ['SSSSSSSsSSSSSSSS'] * 13 + ['ssssssssssssssss'], pal)
    panel(S, 'TA_S', ['SSSSSSSSSSSSSSSS'] * 15 + ['ssssssssssssssss'], pal)
    panel(S, 'TB', ['SSSSSSSsSSSSSSSS'] * 4 + ['ssssssssssssssss'] + ['SSSSSSSsSSSSSSSS'] * 11, pal)
    eight(S, 48, ['SSSsSSSS'] * 16, pal)
    eight(S, 56, ['KKKKKKKK'] * 9 + ['KlKKKKKK', 'KlKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    sleeve(S, ['sSSSSSSSSSSSSSSs'] * 8 + ['ssssssssssssssss', 'WWWWWWWWWWWWWWWW', 'wwwwwwwwwwwwwwww'], pal)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_bodyguard.png')

# =============================================================== Inspector Vera Orlova
def orlova():
    S = Sheet()
    sk, sh, dk, hr, hl = '#f0c8b0', '#d0a088', '#8a5848', '#b89a5a', '#d8bc78'
    U, u, R, G, g, K, k, W, lip = '#4e5c78', '#36405a', '#b8231e', '#f2c14e', '#a8822a', '#141014', '#3a3a48', '#f4f1ea', '#a82a36'
    def band(P, v): P.rect(0, 0, 32, 4, R); P.rect(0, 4, 32, 1, K); cog(P, 14, 0, G, g, R)
    def hairline(P, v):
        for x in (3, 4, 27, 28): P.px(x, 5, hr)
        P.rect(3, 6, 1, 4, hr); P.rect(28, 6, 1, 4, hr)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=5, crownFn=band, side=hr, sideTo=12, fringe=hairline, brow=dk, browStyle='arched', lashes=True,
                 lip=lip, tongue=lip, mouthStyle='pursed', white=W, cheek='#e4ac98', look=0))
    pal = {'U': U, 'u': u, 'R': R, 'G': G, 'g': g, 'K': K, 'k': k, 'W': W, 's': sk, 'h': sh, 'H': hr, 'l': hl}
    heads(S, ['RRRRRRRRRRRRRRRR'] * 4 + ['KKKKKKKKKKKKKKKK'] + ['HHHlHHHHHHHlHHHH', 'HHHHHHlHHHHHHHHH', 'HlHHHHHHHHHHHlHH', 'HHHHHHHHHlHHHHHH', 'HHHHlHHHHHHHHHHH',
          'hHHHHHHHHHHHHHHh', 'hhHHHHHHHHHHHHhh'] + ['hhhhhhhhhhhhhhhh'] * 4, pal)
    panel(S, 'X3', ['HHHlHHHHHHHHHHHH', 'HHlHHHHlHHHHHHHH', 'HlHHHHlHHHHlHHHH', 'HlHHHlHHHHlHHHHH', 'HHlHHlHHHHlHHHHH', 'HHHlHHlHHHHlHHHH'] + ['HHHHHHHHHHHHHHHH'] * 10, pal)
    panel(S, 'X1', ['RRRRRRRRRRRRRRRR'] + ['UUUUUUUUUUUUUUUU'] * 11 + ['uuuuuuuuuuuuuuuu', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR', 'RRRRRRRRRRRRRRRR'], pal)
    swatch(S, 0, K); swatch(S, 1, U); swatch(S, 2, G)
    panel(S, 'TA', ['RRuUUUshhsUUUuRR', 'RRUuUUUhhUUUuURR', 'UUUUuUUUUUUuUUUU', 'UUUGUuUUUUuUGUUU', 'UUUUUUuUUuUUUUUU', 'UUUGUUUuuUUUGUGG',
                    'UUUUUUUUUUUUUUGG', 'UUUGUUUUUUUUGUUU', 'UUUUUUUUUUUUUUUU', 'UUUGUUUUUUUUGUUU', 'UUUUUUUUUUUUUUUU', 'KKKKKKKGGKKKKKKK',
                    'KKKKKKKGGKKKKKKK', 'UUUGUUUUUUUUGUUU', 'UUUUUUUUUUUUUUUU', 'uuuuuuuuuuuuuuuu'], pal)
    panel(S, 'TA_B', ['RRRRRRRRRRRRRRRR', 'uuUUUUUUUUUUUUuu'] + ['UUUUUUUuUUUUUUUU'] * 9 + ['KKKKKKKKKKKKKKKK', 'KKKKKKKKKKKKKKKK', 'UUUUUUUuUUUUUUUU', 'UUUUUUUuUUUUUUUU', 'uuuuuuuuuuuuuuuu'], pal)
    panel(S, 'TA_S', ['UUUUUUUUUUUUUUUU'] * 11 + ['KKKKKKKKKKKKKKKK', 'KKKKKKKKKKKKKKKK', 'UUUUUUUUUUUUUUUU', 'UUUUUUUUUUUUUUUU', 'uuuuuuuuuuuuuuuu'], pal)
    panel(S, 'TB', ['UUUUUUUuUUUUUUUU'] * 6 + ['UUUUUUuUuUUUUUUU'] * 8 + ['uuuuuuuuuuuuuuuu', 'uuuuuuuuuuuuuuuu'], pal)
    eight(S, 48, ['uuuuuuuu'] * 16, pal)
    eight(S, 56, ['KKKKKKKK', 'KkKKKKKK', 'KkKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKkK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    panel(S, 'X4', ['KkKKKKKKKKKKKkKK', 'KkKKKKKKKKKKKkKK'] + ['KkKKKKKKKKKKKKKK'] * 13 + ['KKKKKKKKKKKKKKKK'], pal)   # tall boots
    sleeve(S, ['uUUUUUUUUUUUUUUu'] * 8 + ['UUUUUUUUUUUUUUUU', 'uuuuuuuuuuuuuuuu', 'uuuuuuuuuuuuuuuu'], pal)
    panel(S, 'X2', ['uUUUUUUUUUUUUUUu', 'uUUUUUUUUUUUUUUu', 'RRRRRRRRRRRRRRRR', 'RRRRRRRGGRRRRRRR', 'RRRRRRGggGRRRRRR', 'RRRRRRRGGRRRRRRR', 'RRRRRRRRRRRRRRRR'] +
          ['uUUUUUUUUUUUUUUu'] * 9, pal)   # upper arm with the red armband
    S.rect(32, 59, 16, 1, k); S.rect(32, 60, 16, 4, K); S.rect(34, 60, 1, 3, k); S.rect(40, 60, 1, 3, k)   # black gloves
    return S.save('assets/tex/sheet_orlova.png')

# =============================================================== the Chairman
def chairman():
    S = Sheet()
    sk, sh, dk, gr, grD = '#e8b8a0', '#c89480', '#8a5a4a', '#c0c0bc', '#8a8a88'
    Sx, s, W, R, G, r, b, K = '#6a6c72', '#4a4c52', '#f4f1ea', '#7a1a1e', '#f2c14e', '#b8231e', '#2a4aa0', '#141014'
    def bald(P, v):
        P.rect(3, 0, 26, 5, sk); P.rect(10, 1, 4, 1, W); P.rect(0, 0, 3, 5, sh); P.rect(29, 0, 3, 5, sh)
        for y in range(5, 8): P.px(4, y, sh); P.px(27, y, sh)                       # deep temples
    def jowls(P, v):
        P.rect(4, 24, 3, 6, sh); P.rect(25, 24, 3, 6, sh); P.rect(7, 28, 18, 1, sh)   # heavy jowls, a double chin
        P.rect(13, 17, 6, 5, sh); P.rect(14, 18, 4, 3, '#d8a490' if False else sk); P.rect(13, 21, 6, 1, dk)   # a big nose
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=sk, top=5, crownFn=bald, side=gr, sideTo=15, brow=gr, browD=grD, browStyle='bushy', mouthStyle='frown', white=W,
                 heavyLids=sh, cheek='#e09a8a', extra=jowls))
    pal = {'S': Sx, 's': s, 'W': W, 'R': R, 'G': G, 'r': r, 'b': b, 'K': K, 'k': sk, 'h': sh, 'g': gr, 'd': grD}
    heads(S, ['kkkkkkkkkkkkkkkk', 'kkkkWkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk', 'hkkkkkkkkkkkkkkh', 'ghkkkkkkkkkkkkhg', 'ggghkkkkkkkkhggg'] +
          ['ggggggdgggggdggg', 'gdggggggggdggggg', 'ggggdgggggggggdg', 'gggggggdgggggggg', 'dgggggggggggggdg', 'hggggggggggggggh'] + ['hhhhhhhhhhhhhhhh'] * 4, pal)
    panel(S, 'TA', ['SSSSSsWWWWsSSSSS', 'SSSSSsWRRWsSSSSS', 'SSSSSSsRRsSSSSSS', 'SSSSSSsRRsSrGbrS', 'SSSSSSSsRsSGbrGS', 'SSSSSSSsRsSSSSSS',
                    'SSSSSSSsRsSGSGSS', 'SSSSSSSSsSSGSGSS', 'SSSSSSSSKSSSSSSS', 'SSSSSSSSSSSSSSSS', 'SSSSSSSSKSSSSSSS', 'SSSSSSSSSSSSSSSS',
                    'SssSSSSSKSSSSssS', 'SSSSSSSSSSSSSSSS', 'SSSSSSSSSSSSSSSS', 'ssssssssssssssss'], pal)   # lapels, tie, ribbon bars and medals
    panel(S, 'TA_B', ['ssssssssssssssss', 'SSSSSSSSSSSSSSSS'] + ['SSSSSSSsSSSSSSSS'] * 13 + ['ssssssssssssssss'], pal)
    panel(S, 'TA_S', ['SSSSSSSSSSSSSSSS'] * 15 + ['ssssssssssssssss'], pal)
    panel(S, 'TB', ['SSSSSSSsSSSSSSSS'] * 3 + ['ssssssssssssssss'] + ['SSSSSSSsSSSSSSSS'] * 12, pal)
    eight(S, 48, ['SSSsSSSS'] * 16, pal)
    eight(S, 56, ['KKKKKKKK'] * 9 + ['KsKKKKKK', 'KsKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    sleeve(S, ['sSSSSSSSSSSSSSSs'] * 8 + ['ssssssssssssssss', 'WWWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWW'], pal)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_chairman.png')

def props():
    # Orlova's baton (8x32, the bat's layout): black rubber (rows 0-21), a gold ferrule and a ribbed grip (rows 22-31)
    B = Sheet(8, 32); P = Pane(B, 0, 0)
    P.rect(0, 0, 8, 22, '#1e1c22'); P.rect(1, 0, 2, 22, '#3c3a44'); P.rect(0, 0, 8, 2, '#2c2a32')
    P.rect(0, 22, 8, 2, '#f2c14e'); P.rect(0, 24, 8, 8, '#141218')
    for y in (25, 27, 29): P.rect(0, y, 8, 1, '#2c2a32')
    B.save('assets/tex/baton.png')

if __name__ == '__main__':
    for f in (militia, inspector, clerk, bodyguard, orlova, chairman):
        print(f.__name__, f(), 'colours')
    props(); print('props ok')
