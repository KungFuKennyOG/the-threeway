# Notes for Claude sessions working on this repo

- Making or changing a goon (an enemy)? Read `docs/goon-style.md` first and follow its checklist. Goons must be characters with flair, not uniforms. Every new goon must hold up in a lineup beside the originals.
- VR comfort rules: no stairs (vertical movement only by eased lifts, cradles or gentle ramps). The camera never moves on its own more than about 60 mm a frame.
- Each level lives in its own files and registers with `defineLevel` (`src/levels.js`). Act 1's levels 5–7 are placed by the `ACT1_WEST` frame (local coordinates; see the README).
- Run every suite in `test/` before pushing. The README's Tests section lists the commands.
