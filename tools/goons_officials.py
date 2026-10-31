"""Paints the bar's officials (64x128 sheets, the layout in src/characters.js and tools/goonkit.py): Columbia's Department of
Civic Harmony officer and its enforcer, and the Aoki Development agent. Invented people.
Run from the repo root: python3 tools/goons_officials.py"""
from goonkit import Sheet, face, panel, swatch
from goons_palace import heads, hand, eight, sleeve

# =============================================================== the Civic Harmony officer
def harmony():
    S = Sheet()
    sk, sh, dk, hr, hl = '#eec4a4', '#cc9e80', '#80543e', '#c8a058', '#e8c478'
    B, b, W, w, N, G, T, t, Br, K = '#5a86c4', '#3a5e98', '#f4f1ea', '#c4c2ba', '#1e2a4a', '#f2c14e', '#b8a478', '#8a7a54', '#6a4024', '#141014'
    def part(P, v):
        P.rect(3, 4, 18, 2, hr); P.rect(20, 4, 9, 1, hr)        # a neat side part, the fringe swept across
        for x in (6, 11, 16): P.px(x, 2, hl)
        P.rect(21, 0, 1, 4, dk)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=4, crownFn=part, sideTo=11, brow=hr, browStyle='thin', mouthStyle='grin', white=W, cheek='#e8a890', tongue='#e8a890'))
    pal = {'B': B, 'b': b, 'W': W, 'w': w, 'N': N, 'G': G, 'T': T, 't': t, 'r': Br, 'K': K, 's': sk, 'h': sh, 'H': hr, 'l': hl}
    heads(S, ['HHHlHHHHHHlHHHHH', 'HHHHHHlHHHHHHHHH', 'HlHHHHHHHHHHHlHH', 'HHHHHHHHHlHHHHHH', 'HHHHlHHHHHHHHHHH', 'HHHHHHHHHHHHHHHH',
          'hHHHHHHHHHHHHHHh', 'hhHHHHHHHHHHHHhh'] + ['hhhhhhhhhhhhhhhh'] * 8, pal)
    swatch(S, 2, Br)
    panel(S, 'TA', ['BBBBBbWWWWbBBBBB', 'BBBBBbWNNWbBBBBB', 'BBBBBBbNNbBBBBBB', 'BBBBBBbNNbBBGBBB', 'BBBBBBBbNbBBBBBB', 'BBBBBBBbNbBBBBBB',
                    'BBBBBBBBbBBBBBBB', 'BBBBBBBBGBBBBBBB', 'BBBBBBBBBBBBBBBB', 'BBBBBBBBGBBBBBBB', 'BBbbbBBBBBBbbbBB', 'BBBBBBBBBBBBBBBB',
                    'BBBBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBBB', 'BBBBBBBBBBBBBBBB', 'bbbbbbbbbbbbbbbb'], pal)   # blazer, white shirt, navy tie, a gold pin
    panel(S, 'TA_B', ['bbbbbbbbbbbbbbbb', 'BBBBBBBBBBBBBBBB'] + ['BBBBBBBbBBBBBBBB'] * 13 + ['bbbbbbbbbbbbbbbb'], pal)
    panel(S, 'TA_S', ['BBBBBBBBBBBBBBBB'] * 15 + ['bbbbbbbbbbbbbbbb'], pal)
    panel(S, 'TB', ['rrrrrrrGGrrrrrrr'] + ['TTTTTTTtTTTTTTTT'] * 15, pal)
    eight(S, 48, ['TTTtTTTT'] * 16, pal)
    eight(S, 56, ['rrrrrrrr'] * 10 + ['rTrrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    sleeve(S, ['bBBBBBBBBBBBBBBb'] * 8 + ['bbbbbbbbbbbbbbbb', 'WWWWWWWWWWWWWWWW', 'wwwwwwwwwwwwwwww'], pal)
    hand(S, sk, sh)
    panel(S, 'X4', ['bBBBBBBBBBBBBBBb', 'bBBBBBBBBBBBBBBb', 'WWWWWWWWWWWWWWWW', 'WWWWWWNNNNWWWWWW', 'WWWWWNWWWWNWWWWW', 'WWWWWNWGGWNWWWWW', 'WWWWWNWWWWNWWWWW',
                   'WWWWWWNNNNWWWWWW', 'WWWWWWWWWWWWWWWW'] + ['bBBBBBBBBBBBBBBb'] * 7, pal)   # the armband: a navy ring, a gold dot
    panel(S, 'X2', ['rrrrrKKKKKKrrrrr', 'rrrrrKwwwwKrrrrr', 'rWWWWWWWWWWWWWWr', 'rWNNNNNNNNNWWWWr', 'rWWWWWWWWWWWWWWr', 'rWwwwwwwwwwwwWWr', 'rWWWWWWWWWWWWWWr',
                   'rWwwwwwwwwWWWWWr', 'rWWWWWWWWWWWWWWr', 'rWwwwwwwwwwwWWWr', 'rWWWWWWWWWWWWWWr', 'rWwwwwwwWWWWWWWr', 'rWWWWWWWWWWWWWWr', 'rWWWWWWWWKKKKWWr',
                   'rWWWWWWWWWWWWWWr', 'rrrrrrrrrrrrrrrr'], pal)   # the closure notice on the clipboard
    panel(S, 'X3', ['rrrrrrrrrrrrrrrr'] * 16, pal)
    return S.save('assets/tex/sheet_harmony.png')

# =============================================================== the Civic Harmony enforcer
def enforcer():
    S = Sheet()
    sk, sh, dk, hr = '#c89070', '#a46e54', '#5e3a2a', '#2a1e18'
    N, n, nh, W, w, Y, y, F, K = '#232c58', '#151b3a', '#3a4478', '#f4f1ea', '#c4c2ba', '#e0b440', '#a88228', '#4a3a2c', '#141014'
    def band(P, v): P.rect(0, 0, 32, 3, K); P.rect(0, 3, 32, 1, F); P.rect(0, 4, 32, 1, '#000000' if False else K)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=5, crownFn=band, side=hr, sideTo=10, brow=hr, browStyle='angry', mouthStyle='frown', white=W, stubble=sh))
    pal = {'N': N, 'n': n, 'l': nh, 'W': W, 'w': w, 'Y': Y, 'y': y, 'F': F, 'K': K, 's': sk, 'h': sh, 'H': hr}
    heads(S, ['KKKKKKKKKKKKKKKK'] * 3 + ['FFFFFFFFFFFFFFFF', 'KKKKKKKKKKKKKKKK'] + ['HHHHHHHHHHHHHHHH'] * 5 + ['hhhhhhhhhhhhhhhh'] * 6, pal)
    panel(S, 'X1', ['FFFFFFFFFFFFFFFF'] * 9 + ['KKKKKKKKKKKKKKKK'] * 4 + ['FFFFFFFFFFFFFFFF'] * 3, pal)   # fedora crown with its black band
    swatch(S, 1, F); swatch(S, 2, '#5a4836')
    panel(S, 'TA', ['NNNNNlWWWWlNNNNN', 'NNNNNlWYYWlNNNNN', 'NNNNNNlYYlNNNNNN', 'NNNNNNlYYlNNNNNN', 'NNNNNNNlYlNNNNNN', 'NNNNNNNlYlNNNNNN',
                    'NNNNNNNNlyNNNNNN', 'NNNNNNNNNlNNNNNN', 'NNNKNNNNNNNNKNNN', 'NNNNNNNNNNNNNNNN', 'NNNKNNNNNNNNKNNN', 'NNNNNNNNNNNNNNNN',
                    'NNNKNNNNNNNNKNNN', 'NnnnNNNNNNNNnnnN', 'NNNNNNNNNNNNNNNN', 'nnnnnnnnnnnnnnnn'], pal)   # double-breasted, a gold tie
    panel(S, 'TA_B', ['nnnnnnnnnnnnnnnn', 'NNNNNNNNNNNNNNNN'] + ['NNNNNNNnNNNNNNNN'] * 13 + ['nnnnnnnnnnnnnnnn'], pal)
    panel(S, 'TA_S', ['NNNNNNNNNNNNNNNN'] * 15 + ['nnnnnnnnnnnnnnnn'], pal)
    panel(S, 'TB', ['NNNNNNNnNNNNNNNN'] * 3 + ['nnnnnnnnnnnnnnnn'] + ['NNNNNNNnNNNNNNNN'] * 12, pal)
    eight(S, 48, ['NNNnNNNN'] * 16, pal)
    eight(S, 56, ['FFFFFFFF'] * 9 + ['FlFFFFFF', 'FlFFFFFF', 'FFFFFFFF', 'FFFFFFFF', 'KKKKKKKK', 'KKKKKKKK', 'KKKKKKKK'], pal)
    sleeve(S, ['nNNNNNNNNNNNNNNn'] * 8 + ['nnnnnnnnnnnnnnnn', 'WWWWWWWWWWWWWWWW', 'wwwwwwwwwwwwwwww'], pal)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_enforcer.png')

# =============================================================== the Aoki Development agent
def aokiagent():
    S = Sheet()
    sk, sh, dk, hr, hl = '#e4b894', '#c09274', '#76503c', '#0e0c10', '#3a3a50'
    K, k, kh, W, w, R = '#141418', '#0a0a0c', '#2a2a32', '#f4f1ea', '#c4c2ba', '#e01e3c'
    def slick(P, v):
        for x in range(4, 28, 3): P.px(x, 1 + (x % 2), hl)
        P.rect(3, 4, 26, 2, hr); P.rect(24, 6, 4, 1, hr)
    face(S, dict(skin=sk, shade=sh, dark=dk, hair=hr, top=4, crownFn=slick, sideTo=11, brow=hr, browStyle='thin', glasses='shades', lens=k, lensHi='#6a7aa0',
                 mouthStyle='flat', white=W))
    pal = {'K': K, 'k': k, 'l': kh, 'W': W, 'w': w, 'R': R, 's': sk, 'h': sh, 'H': hr, 'e': hl}
    heads(S, ['HHeHHHHeHHHHHeHH', 'HHHHHeHHHHHeHHHH', 'HeHHHHHHeHHHHHHH', 'HHHHeHHHHHHHeHHH', 'HHHHHHHHHHHHHHHH', 'HHHHHHHHHHHHHHHH',
          'hHHHHHHHHHHHHHHh', 'hhHHHHHHHHHHHHhh'] + ['hhhhhhhhhhhhhhhh'] * 8, pal)
    panel(S, 'TA', ['KKKKKKlWWlKKKKKK', 'KKKKKKlWkWlKKKKK', 'KKKKKKKlkWlKKKKK', 'KKKRKKKlkWlKKKKK', 'KKKKKKKlklKKKKKK', 'KKKKKKKKllKKKKKK',
                    'KKKKKKKKlKKKKKKK', 'KKKKKKKKKKKKKKKK', 'KKKKKKKKkKKKKKKK', 'KKKKKKKKKKKKKKKK', 'KKKKKKKKKKKKKKKK', 'KKKKKKKKkKKKKKKK',
                    'KKKKKKKKKKKKKKKK', 'KllKKKKKKKKKKllK', 'KKKKKKKKKKKKKKKK', 'kkkkkkkkkkkkkkkk'], pal)   # sleek black suit, thin black tie, the red pin
    panel(S, 'TA_B', ['kkkkkkkkkkkkkkkk', 'KKKKKKKKKKKKKKKK'] + ['KKKKKKKkKKKKKKKK'] * 13 + ['kkkkkkkkkkkkkkkk'], pal)
    panel(S, 'TA_S', ['KKKKKKKKKKKKKKKK'] * 15 + ['kkkkkkkkkkkkkkkk'], pal)
    panel(S, 'TB', ['KKKKKKKkKKKKKKKK'] * 3 + ['kkkkkkkkkkkkkkkk'] + ['KKKKKKKkKKKKKKKK'] * 12, pal)
    eight(S, 48, ['KKKkKKKK'] * 16, pal)
    eight(S, 56, ['kkkkkkkk'] * 9 + ['klkkkkkk', 'klkkkkkk', 'kkkkkkkk', 'kkkkkkkk', 'kkkkkkkk', 'kkkkkkkk', 'kkkkkkkk'], pal)
    sleeve(S, ['kKKKKKKKKKKKKKKk'] * 8 + ['kkkkkkkkkkkkkkkk', 'WWWWWWWWWWWWWWWW', 'wwwwwwwwwwwwwwww'], pal)
    hand(S, sk, sh)
    return S.save('assets/tex/sheet_aokiagent.png')

if __name__ == '__main__':
    for f in (harmony, enforcer, aokiagent):
        print(f.__name__, f(), 'colours')
