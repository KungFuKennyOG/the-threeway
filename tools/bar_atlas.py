"""Pack the bar's static textures (from TEX in index.html) into one atlas PNG, so the whole room is one draw call.
Run after changing any of them:  python3 tools/bar_atlas.py   (rewrites TEX.bar_atlas and BAR_ATLAS in index.html)."""
import re, json, base64, io, sys
from PIL import Image
PATH = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
KEYS = ['banner', 'barfront', 'black', 'bottles', 'brass', 'brick', 'ceiling', 'chrome', 'cola', 'concrete', 'counter', 'darkwood', 'felt',
        'jukebox', 'lantern', 'neon_hino', 'neon_open', 'sodium', 'teal', 'tile', 'window', 'wood_floor', 'wood_panel']
s = open(PATH).read()
m = re.search(r'const TEX=(\{.*?\});\n', s, re.S)
T = json.loads(m.group(1))
imgs = {k: Image.open(io.BytesIO(base64.b64decode(T[k].split(',')[1]))).convert('RGBA') for k in KEYS}
W = 256; x = y = rowh = 0; at = {}
for k in sorted(KEYS, key=lambda k: (-imgs[k].height, -imgs[k].width)):
    im = imgs[k]
    if x + im.width > W: x = 0; y += rowh; rowh = 0
    at[k] = (x, y); x += im.width; rowh = max(rowh, im.height)
H = 1
while H < y + rowh: H *= 2
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
rects = {}
for k in KEYS:
    atlas.paste(imgs[k], at[k])
    ax, ay = at[k]; w, h = imgs[k].size
    rects[k] = [round(ax / W, 6), round(ay / H, 6), round(w / W, 6), round(h / H, 6)]
buf = io.BytesIO(); atlas.save(buf, 'PNG', optimize=True)
T['bar_atlas'] = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
s = s[:m.start(1)] + json.dumps(T) + s[m.end(1):]
line = 'const BAR_ATLAS = ' + json.dumps(rects, separators=(',', ':')) + ';   // tools/bar_atlas.py: [u0, v0, du, dv] per texture in TEX.bar_atlas'
if 'const BAR_ATLAS = ' in s: s = re.sub(r'const BAR_ATLAS = .*\n', line + '\n', s, count=1)
else: s = s.replace("'use strict';\n/* ===", "'use strict';\n" + line + '\n/* ===', 1)
open(PATH, 'w').write(s)
print('atlas', W, 'x', H, len(buf.getvalue()), 'bytes')
