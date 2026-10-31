import sys, importlib, numpy as np
from engine import SR
mod = importlib.import_module(sys.argv[1]); S = mod.build()
tot = sum(t['buf'] * t['gain'] for t in S.tracks.values())
ref = np.sqrt((tot ** 2).mean())
rows = []
for n, t in S.tracks.items():
    x = t['buf'] * t['gain']; act = np.abs(x) > 1e-4
    if act.sum() == 0: continue
    rows.append((n, 20*np.log10(np.sqrt((x[act]**2).mean())/ref), 20*np.log10(np.abs(x).max()/np.abs(tot).max())))
for r in sorted(rows, key=lambda r: -r[1]): print(f"{r[0]:8s} active-rms {r[1]:6.1f} dB  peak {r[2]:6.1f} dB")
