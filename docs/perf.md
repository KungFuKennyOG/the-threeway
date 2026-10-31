# Performance on Quest 3: an estimate

Nobody has measured the game on a Quest yet. These numbers come from headless Chromium (Playwright, SwiftShader WebGL, three r149), so they count work, not time on the headset.

## How it was measured

- **Draws and triangles:** `renderer.info.render` after one frame, at each viewpoint, through a camera shaped like one Quest 3 eye (96° tall, about 110° wide). The clock is frozen, so a still is the same on every run, and a hook on `renderBufferDirect` tallies the draws by mesh.
- **Stereo:** three r149 draws each eye separately in WebXR (no multiview), so both eyes cost twice the draws and twice the triangles. Culling uses the frustum that covers both eyes, which is about the camera used here.
- **Budget** (Quest 3 at 72–90 Hz, WebXR, three r149): at most 150–200 draw calls per eye and about 250k triangles a frame across both eyes.
- **Before** is `main` plus the north doors. **After** adds the trims below. The goons in the fights are live, so their rows vary a little from run to run.

## Per view

| View | Room | Draws / eye | Tris / eye | Both eyes: draws | Both eyes: tris | Flag |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| The bar (door shut) | bar | 10 | 1,450 | 20 → 20 | 2,900 → 2,900 | ok |
| The bar's door, looking out | bar | 36 → **43** | 115,750 → **87,158** | 72 → 86 | 231,500 → 174,316 | ok |
| Tripoint Square, down the road | outside | 33 → **40** | 114,710 → **86,118** | 66 → 80 | 229,420 → 172,236 | ok |
| Tripoint Square, west | outside | 32 → **39** | 114,702 → **86,476** | 64 → 78 | 229,404 → 172,952 | ok |
| Tripoint Square, east | outside | 31 → **39** | 106,524 → **85,604** | 62 → 78 | 213,048 → 171,208 | ok |
| The road | outside | 33 → **38** | 114,710 → **77,690** | 66 → 76 | 229,420 → 155,380 | ok |
| The gate | outside | 34 → **39** | 114,628 → **77,608** | 68 → 78 | 229,256 → 155,216 | ok |
| Superblock 14's courtyard | outside | 33 → **40** | 114,620 → **98,496** | 66 → 80 | 229,240 → 196,992 | ok |
| Podezd 3's wing roof (toward the Tower) | outside | 32 → **39** | 114,522 → **102,864** | 64 → 78 | 229,044 → 205,728 | near the tri budget |
| The crossing, stepping off | outside | 37 → **44** | 114,672 → **103,014** | 74 → 88 | 229,344 → 206,028 | near the tri budget |
| Station Square | outside | 37 → **43** | 114,672 → **97,304** | 74 → 86 | 229,344 → 194,608 | ok |
| The boulevard start | outside | 37 → **43** | 114,672 → **99,216** | 74 → 86 | 229,344 → 198,432 | ok |
| The gym | palace | 35 → **41** | 114,656 → **99,200** | 70 → 82 | 229,312 → 198,400 | ok |
| The arena, Volkov in the ring | palace | 7 | 8,658 | 14 → 14 | 17,316 → 17,316 | ok |
| Fight: the gym, 5 goons + props | palace | 36 → **42** | 114,924 → **99,468** | 72 → 84 | 229,848 → 198,936 | ok |
| Parade Square, toward the Tower | outside | 31 → **36** | 106,468 → **86,470** | 62 → 72 | 212,936 → 172,940 | ok |
| Parade Square, back toward the Palace | outside | 38 → **45** | 115,648 → **111,132** | 76 → 90 | 231,296 → 222,264 | near the tri budget |
| Fight: Parade Square, 5 goons + props | outside | 38 → **43** | 107,976 → **87,978** | 76 → 86 | 215,952 → 175,956 | ok |
| The Tower lobby | twLobby | 8 | 5,358 | 16 → 16 | 10,716 → 10,716 | ok |
| The typing pool | twOffice | 13 | 5,624 | 26 → 26 | 11,248 → 11,248 | ok |
| The archive | twArchive | 9 | 3,708 | 18 → 18 | 7,416 → 7,416 | ok |
| The glass lift, mid-ride (115 m) | outside | 37 → **45** | 115,478 → **110,970** | 74 → 90 | 230,956 → 221,940 | near the tri budget |
| The tribune, looking at the city | outside | 37 → **42** | 115,474 → **101,376** | 74 → 84 | 230,948 → 202,752 | near the tri budget |

No view goes over budget. Draw calls stay far under it: at most 45 per eye, against 150–200. Triangles were the tight one. Before the trims, every outdoor view drew 213–232k across both eyes, close to the ~250k line. After, they draw 155–222k. A goon is one draw of about 270 triangles, so five goons and their props add only 6–8 draws.

## What every outdoor view drew (per eye, before)

- The skyline mesh, 42k triangles: the three skylines, the far city's 774 stand-ins and their 603 street-light cubes, and the ground. It was drawn whole, including the half of it behind you.
- The Old Quarter street, 23k.
- One baked mesh for every Act 1 level, 4–8k each: Superblock 14, podezd 3's outside, Station Square and the slabs, the stadium, Parade Square and the Tower's shell. All of them were drawn on every outdoor level.
- The Palace's inside, 8k and 1–3 draws, through its foyer doors from anywhere outdoors, Tripoint Square included. Portals only checked direction, not distance. The bar's 9 draws were drawn the same way from Parade Square and the Tower.
- Small set pieces, one draw each everywhere outdoors: the crossing's barriers, podezd 3's two lift cars and their doors, the cradle, the glass lift and the checkpoint's boom.

## The trims (all invisible: see below)

1. **The far city in tiles** (`buildFarField` / `buildFarTiles`, `CFG.street.farField.tile` = 240 m): the stand-ins are filed into 16 square tiles and appended to the skyline mesh tile by tile. Each tile is drawn as its own mesh over the skyline mesh's own buffers (shared attributes, so nothing is copied on the GPU), with its own bounding sphere, and three culls the tiles out of view. The skyline mesh itself still draws the skylines and the ground, always. This saves 3–13k triangles per eye depending on where you look, for 5–8 more draws. Smaller tiles cull more but cost more draws: 180 m tiles averaged 14 draws for 2k fewer triangles.
2. **Portals have a distance** (`CFG.street.portalFar` = 150 m): a doorway further off than that isn't looked through. Tripoint Square no longer draws the Palace's foyer (8.2k triangles), and Parade Square and the Tower no longer draw the bar (9 draws).
3. **Meshes drawn only where they can be seen** (`userData.near` in `src/rooms.js`): the stadium's outside (within 150 m of it, `CFG.palace.drawNear`), Parade Square (within 205 m, `CFG.parade.drawNear`) and the checkpoint's boom (`CFG.street.boomNear`). Each is also drawn from anywhere over 20 m up. On Tripoint Square, the road and the gate that saves 14k triangles per eye.
4. **The north doors' shutter and spill** (introduced with the reveal, fixed before it shipped): they aren't drawn until the Palace places them, and the spill draws in one pass.

The street's own mesh (23k) can't be hidden this way. A sweep found it visible, as fogged silhouettes of the Accords wall and the checkpoint, from Station Square, the boulevard and even Parade Square. The same sweep ruled out rules for podezd 3's lift cars, the crossing's barriers and the glass lift: the cars sit up on the roof, the barriers show through the Palace down its axis, and the glass lift waits 40 m up the Tower.

**Checking it:** two checks show the look is unchanged.
- **A sweep:** eyes on a 12 m grid over every outdoor walk rect, a cube of 6 views from each, with everything else drawn there (and the insides you could see into) as a black occluder. A hidden mesh never showed past its edge.
- **Stills:** the 20 still viewpoints above plus 13 placed right at the rules' edges, before and after, compared pixel for pixel. 26 match exactly. The other 7 (the bar, the gym, the typing pool, the archive, the crossing, Station Square, one edge) differ by 9 to 276 pixels, in small spots that change from run to run anyway: shooting the unchanged build twice differs by up to 498 pixels in the same views. The causes are things the frozen clock doesn't stop: the bar's jukebox, the Palace's shutter mid-roll, the train, a prop settling.

## JS per frame (Node, the tests' Three.js stand-in, no rendering)

| Scenario | Before | After |
| --- | ---: | ---: |
| The gym, 5 goons, 9 props: the whole frame loop | 6.52 ms | 1.84 ms |
| ...of which physics | 5.93 ms | 1.28 ms |
| Parade Square, 5 goons, 12 props: frame loop | 6.28 ms | 1.26 ms |
| ...of which physics | 5.76 ms | 0.82 ms |
| Parade Square, walking: frame loop | 0.17 ms | 0.19 ms |

**The hot spot was physics, looking up world boxes by z band alone.** `ACT1_WEST` lays the Palace, Parade Square and the Tower along world −x, so they all share a few z bands. Every ragdoll particle tested every box from the crossing to the Tower on every iteration, and `clamp()` alone was half of all CPU time. The lookups (world boxes, blockers, walk rects, floors) now use x-and-z cells with the same margins and lists in the original order, so they find exactly what the bands did, minus what's far off in x. Both bots play out identically. The physics-cost checks that flaked at 3.8–5.3 ms on this machine (limit 4) now run at 0.6–1.5 ms. The limits are unchanged.

What's left per frame:
- physics, about 1 ms per five goons;
- `updateArea`, 0.13–0.17 ms (it sorts every lamp in the city by distance every frame to pick the nearest six);
- goon AI and CPU skinning, about 0.2 ms.

The Quest's browser runs JS maybe 2–4× slower than this server, so a five-goon fight should land around 4–7 ms of a 13.9 ms frame (72 Hz) before rendering.

## Risks for the headset

- **Fill rate and overdraw can't be measured here,** and on Quest they usually decide the frame rate. The worst overdraw comes from the sky band (drawn over the whole view) and the additive beams and halos. Three r149 draws a two-sided transparent mesh twice, and the searchlights, the Tower's glow and the skyline's light mesh are all drawn that way. Watch the perf panel's fps on Parade Square looking east and on the glass lift.
- **Triangles are still the tightest budget:** about 222k across both eyes on Parade Square looking back and from the glass lift. Adding any big set piece to the always-drawn outside (rather than a room, a tile or a `near` rule) puts those views over 250k.
- **Draw calls went up by 5–8 per eye for the tiles** (now 36–45 per eye outdoors). That's still well under budget, but on Quest each WebGL draw costs real CPU time.
- **Physics in a fight is now about 1 ms here** but may be 3–4 ms on the headset. Auto quality steps physics down if the frame rate drops.
- **Music:** at most two decoded tracks (~30 MB each) plus the sting.
