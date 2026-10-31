# Music generator

Offline synth + sequencer in Python (numpy, scipy, ffmpeg). Every sound is synthesized; no samples. The RNG is seeded, so a script rebuilds its track exactly.

```
cd tools/music
python3 threeway.py      # -> 1-the-threeway.mp3
python3 krasnovia.py     # -> 2-krasnovia.mp3
python3 columbia.py      # -> 3-columbia.mp3
python3 hinomoto.py      # -> 4-hinomoto.mp3
python3 check.py columbia                      # per-instrument loudness balance
python3 gains.py columbia.py '{"tpt":1.6}'     # set instrument gains in a script
```

Rendered tracks live in `assets/music/`. They are the sector **arrival themes** (first street stretch of each sector):

| Track | Key, tempo | Style |
|---|---|---|
| The Threeway (bar prologue) | E minor, 138 | 80s fight-game rock; bridge trades bars with bayan, brass and koto/taiko |
| Krasnovia | D minor, 132 | coldwave: post-punk bass, gated snare, bayan riff, brass theme, choir, May Day march break |
| Columbia | F minor, 152 | Gotham/BioShock noir: spy bass riff, brass hits and swells, trumpet theme, swing gala bridge |
| Hinomoto (finale) | A minor, 150 | Akira: taiko, hyoshigi, chants, koto, FM bass, neon lead, gamelan bells |

`columbia_swing.py` / `3b-columbia-swing.mp3` is the first, all-swing Columbia draft, kept for the diner or Dalton.

All four share one main theme (`THEME` in `engine.py`), played in each sector's own style. Next: distinct tracks per level built from each sector's sound, plus seamless loops for in-game use (`Song.render(loop_bars=...)` folds the tail onto the head).
