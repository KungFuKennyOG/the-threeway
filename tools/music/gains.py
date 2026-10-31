import re, sys, json
f, G = sys.argv[1], json.loads(sys.argv[2])
out=[]
for line in open(f).read().split('\n'):
    m = re.match(r"\s+S\.add_inst\('([a-zA-Z0-9]+)'", line)
    if m and m.group(1) in G: line = re.sub(r"gain=[0-9.]+", f"gain={G[m.group(1)]}", line)
    out.append(line)
open(f,'w').write('\n'.join(out))
