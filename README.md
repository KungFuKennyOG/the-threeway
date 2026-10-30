# The Threeway

![The Threeway](docs/logo.png)

VR beat 'em up prototype for Quest 3. Vostburg, 1986: a city split three ways by a cold war, and the one bar where all three sides drink together. The officials want it shut. Their muscle just walked in.

This is the combat MVP. It answers one question: does hitting people in The Threeway feel good?

![Key art](docs/keyart.png)

## Play

- **Quest 3:** open the GitHub Pages URL for this repo in the Quest browser and press **Enter VR**.
- **Desktop:** serve the folder over HTTPS or localhost (`npx serve .`) and press **Fight on desktop**. Desktop mode is for testing without a headset.
- **Level 2 straight away:** tick **Start outside, in Tripoint Square** on the menu (or open the page with `?level=street`).

| Quest 3 | Action |
| --- | --- |
| Swing for real | Hand speed sets the hit: under 1.5 m/s shove, 1.5–3 light, 3–5 solid, 5+ heavy. Needs 20 cm of travel, so wrist flicks do nothing |
| Both forearms in front of your face | Block |
| Duck or lean | Dodge (every attack is telegraphed: a glowing fist and a grunt) |
| Hit the swinging arm late in the windup | Parry: hard stagger |
| Grip | Grab a bottle, a stool or a goon's collar |
| Release mid-swing | Throw (thrown goons curve toward other goons) |
| Bottle to your mouth | Drink to heal |
| Wrestler clinch | Punch his arms twice or headbutt him |
| Left stick / right stick | Move / snap turn 30° |
| Grip as a potato or pot reaches you | Catch it, then throw it back |
| Swat the bat (or the bat arm) mid-swing | Disarm Bat Boy; the bat drops and is yours |
| Left X | Perf + tuning panel on your left wrist (left stick: up/down picks, left/right changes) |
| A | Restart after clearing the bar (or walk out the open door) or the street |

Desktop: mouse look, WASD, left/right click (or J/K) punch, Shift heavy, hold X light, Space block, C duck, G headbutt, E grab/drop/catch, Q throw, F drink, R restart, P perf panel (`[` `]` pick a setting, `-` `=` change it).

## What's in

- **Physics-first goons.** Every goon is an active ragdoll: 15 joint particles held together by sticks (position-based dynamics, 120 Hz). Standing, they're pulled toward their animation, so every hit physically shoves them at the spot you hit and they spring back. Knockdowns, launches and throws drop the pull and they go limp, then get up onto a knee and stand. Grab a collar and the rest of the body dangles from your fist. Thrown goons bowl over other goons and scatter the bar stools; slamming them into walls or the bar hurts.
- **Real scale.** Goons are 1.71–1.77 m; Rocco and Ivan are 1.83–1.91 m. Your body is a capsule nobody can walk or punch through, so goons stop at arm's length instead of ending up inside your face.
- **Props are physical too:** bottles and stools tumble, get kicked around by goons, knocked off the bar by your fists, and bottles shatter on hard impacts.
- The Threeway bar in the art spec's PS1 look: vertex-lit, ≤16-colour hand-pixeled textures, 6-bit colour with a soft 4×4 Bayer dither, plum fog, 6 per-vertex lights, fine vertex snap (a slight wobble). Desktop also renders 240 lines with affine warp; VR keeps snap but turns affine off.
- Velocity punching with the four tiers, 40–60 ms hitstop on the enemy (never the player's view), haptics.
- Hidden poise per enemy: flinch → stagger (bonus-damage window) → knockdown → launch. Head hits do more damage, body hits more poise.
- Forearm block, parry, dodge by moving your head.
- Grab and throw, bottles (one hit, drinkable) and stools (three hits).
- Bōsōzoku punk (fodder), Columbian boxer (fast jab combos, high guard: go to the body), Krasnovian wrestler (clinches you).
- **Bat Boy** (Columbia, weapon goon): a long, telegraphed overhead bat swing. The bat is a real physics prop pinned to his wrist. Block it with your forearms, or swat the bat or his bat arm mid-swing to knock it loose. Then pick it up: it adds 10 damage and swings 1.3× faster than your fist.
- **The cook** (Krasnovia, thrower): keeps 3–5 m away and lobs potatoes and pots on real ballistic arcs aimed at your head. Block them with a forearm, dodge, punch them away, or squeeze grip as one arrives to catch it and throw it back. Thrown props curve slightly toward a goon in front of you.
- **Aoki Security** (Hinomoto, shield): a company guard in a black suit and a riot helmet with a mirrored visor, carrying a clear riot shield and a baton. The shield takes anything to his front (head, body, the shield arm) and punching it earns you a quick baton counter. Get around to his side, or break the shield: heavy hits and props chip it faster, and when it shatters he staggers. He strafes to keep it on you.
- **The neon kicker** (Hinomoto, fast): a street kickboxer in a neon-piped bomber who dashes in, throws a two-kick combo, then darts back out of reach. High kicks are blocked by a normal guard. Low kicks (a LOW! sign over the chambered knee) go under it: drop a forearm to belly height or step back.
- **Rocco & Ivan** (round 4 mini-boss): Rocco is a broad Columbian bouncer who fights like a faster boxer (four-punch combos, high guard). Ivan is a Krasnovian bouncer in a tracksuit who clinches harder and needs three arm hits to break. One fights while the other circles wide. Stagger, floor or grab the active one and his partner tags in. Drop one for good and the survivor enrages: faster and with shorter windups. Both have health bars over their heads.
- Attack tokens (two attackers at once, the rest circle), four escalating rounds: punk + kicker → Aoki Security + boxer + Bat Boy → cook + wrestler + kicker + Bat Boy + punk → Rocco & Ivan.

## Level 2: out the door

![Tripoint Square](docs/street.png)

Clear the bar and the front door swings open onto **Tripoint Square** at night. Walk out and the street starts.

- **The square:** Old Quarter tenements (plaster, Krasnovian painted window surrounds, Columbian cast-iron shopfronts, Hinomoto tile roofs) under green-copper and slate roofs, lit by pale gaslight. The Brass Clock (1888), sealed Tripoint Station, St. Vost Cathedral's onion domes over the roofs. Three brass lines in the setts (the Accords borders) meet at the Threeway's door. The Threeway's front: pink neon and all three flags over the door. The other two old roads are barricaded by the militia.
- **The fight:** three stretches: the square (punks and a kicker from the side roads), the old road (boxer, Bat Boy, the cook), and the last stretch before the checkpoint (Aoki Security, the wrestler, a kicker). Each stretch holds you in until it's clear; go down and you restart that stretch at full health.
- **Street props:** crates (break after two hits), bins (never break) and cast-iron street signs (swing long, like the bat). Grab, swing, throw.
- **The end:** the joint-militia checkpoint: booth, floodlight, the Free City's flag with the three powers'. Walk up to the boom and it lifts. The Ring Road and the Accords wall start beyond it.
- **The skylines:** Hinomoto's black-glass neon cluster behind the Threeway (Aoki Development tallest, an expressway of tail lights), Krasnovia's even field of panel slabs, the Tower of Labor and the TV tower right of the road, Columbia's ridge of cream-and-gold deco towers left of it. Red beacons blink on top. The sky glows red, sodium and gold over each sector.

## Quest performance

- **Merged static geometry.** The whole bar room is one mesh on one atlas (`tools/bar_atlas.py` packs its textures; the shader tiles each texture inside its box of the atlas). The street is one mesh on a painted, mipmapped atlas, the skylines and far city another. Light is **baked per vertex** at build time with the shader's own formula, so any number of gas lamps is free; goons, props and hands are lit live by the 6 nearest lamps (the bar's six inside).
- **Prop batches.** Every stool, crate, bin and street sign is written into one mesh per material each frame (a few hundred vertices on the CPU), so a room full of stools or a street full of crates is one draw call.
- **LOD stand-ins.** Past the Old Quarter's edge every building is one cheap box with its lit windows painted on, always drawn, out to ~400 m: you see the city's lights and rooflines all the way to the skylines, nothing pops. The street atlas is mipmapped (wrapped gutters), so far things average instead of sparkling.
- **Portal culling.** The bar and the street only draw each other through the open door when it's in view: inside with the door shut, the street, skylines and sky aren't drawn at all.
- Measured in Chromium: 9 draw calls in the bar (was 26), 8–9 down the street, 18 looking back at the Threeway through its open door (was 49). ~52k static triangles, most of them the always-on skylines and far city.
- **One draw call per goon.** Each goon is a single CPU-skinned mesh: every body part's vertices are moved by its ragdoll frame each frame, and the hurt/KO faces swap by rewriting the face UVs. Previously each goon was 14 to 16 draw calls. Stools are one mesh on a vinyl + chrome atlas.
- **Perf panel.** Left X (desktop: P) shows fps, physics ms per frame, draw calls and the current quality level on your left wrist, plus live tuning for ragdoll pull, hit shove, knockback, fist pitch in the controller and vertex snap. Tuning is saved in the browser.
- **Auto quality.** If the frame rate stays under 90% of the 72 Hz target for 1.5 s, physics steps down (120 Hz × 4 iterations → 90×4 → 90×3 → 72×3 → 60×2). It steps back up after sustained headroom, and backs off further each time it has to drop again. Turn it off in the panel.
- Damage feedback is a red dithered vignette, haptics and sound. The camera never moves on its own.

## Tuning

Every number lives in `CFG` in `src/config.js` (level 2: `CFG.street`: the stretches, triggers, spawns and arenas, street props, gaslight, fog, sky glow): physics (`CFG.physics`: how hard goons follow their animation, hit shoves, personal space, domino and impact speeds), tier thresholds, damage and poise per tier, hitstop, knockback, magnetism, block and dodge distances, grab and throw, weapons and projectiles, per-enemy stats, the boss tag team (`CFG.boss`), waves, perf/auto quality (`CFG.perf`), render settings (desktop lines, VR framebuffer scale, snap/affine per mode), and `hands.modelPitchDeg` for how the fist model sits in the controller.

## Tests

No headset needed. The tests run the real game script against a small stand-in for Three.js (math and scene graph only, no rendering):

```
node test/street.js    # 41 checks: one-mesh bar room, prop batches, LOD stand-ins, portal culling, the door opens and leads outside, walls and crossings, baked light and the live lights outside/inside, the stretches (trigger, spawn, arena lock, clear, lose + restart), the boom, crates/bins/signs, draw calls + triangle budget, street physics cost
node test/bot.js 1 400 --mode=aggro --level=street   # the bot fights down the street to the checkpoint (--level=both: the bar, out the door, then the street)
node test/vr.js        # 52 checks: level 2 in VR (start outside, stick walking, held in by the stretch), tiers, flick, block, parry, clinch, grab/throw, drink, perf panel + tuning, potato catch + throw-back, bat disarm + bat damage, riot shield block/counter/flank/shatter, high vs low kicks + retreat, locomotion
node test/physics.js   # 47 checks: heights for all 9 goons, skinned mesh vs skeleton, one mesh per goon/stool, shove + recover, launch, get-up, dominoes, the cook's lob accuracy, Rocco & Ivan tag + enrage
node test/bot.js 1 400 --mode=aggro    # a bot plays all four rounds (catches pots, throws them back); prints hits, losses, catches, tags, per-round times, errors
```

They check game logic only. Rendering, shaders and real WebXR need a browser or the headset.

## Stack

Three.js r149 from jsDelivr, WebXR, synthesized placeholder audio. Plain script files, no build step: `index.html` loads them in order and they share one global scope, so it runs straight off GitHub Pages or any static server (not from `file://`: browsers won't load the textures there).

| File | What's in it |
| --- | --- |
| `src/config.js` | `CFG`: every tunable number |
| `src/textures.js`, `assets/tex/` | texture names → hand-pixeled PNGs |
| `src/render.js` | renderer, scene, the PS1 shader (vertex snap, affine UVs, 6-bit dither, fog, baked light, atlases), lights |
| `src/geometry.js` | mesh builders, static batching, light baking |
| `src/bar.js`, `src/bar_atlas.js` | the bar room (one mesh on one atlas: `tools/bar_atlas.py`), walkable areas, the door |
| `src/street/` | level 2: `paint.js` (painted street atlas), `build.js` (the square, the road, the checkpoint), `skylines.js` (the three sectors, the far city, the sky), `fight.js` (stretches, portals, signs) |
| `src/characters.js` | goon bodies and poses, the player's hands |
| `src/audio.js`, `src/fx.js` | placeholder sound, sprites and signs |
| `src/player.js`, `src/locomotion.js` | the player, XR + desktop input, hand/head tracking, moving and turning |
| `src/physics.js` | the particle ragdoll solver, walls, collisions |
| `src/props.js` | bottles, stools, bats, kitchenware, crates, bins, signs; prop batches |
| `src/enemies.js`, `src/combat.js`, `src/bosses.js` | goon AI, your hits, Rocco & Ivan |
| `src/game.js`, `src/hud.js`, `src/main.js` | rounds, HUD + perf panel, the frame loop and boot |
