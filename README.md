# The Threeway

![The Threeway](docs/logo.png)

VR beat 'em up prototype for Quest 3. Vostburg, 1986: a city split three ways by a cold war, and the one bar where all three sides drink together. The officials want it shut. Their muscle just walked in.

This is the combat MVP. It answers one question: does hitting people in The Threeway feel good?

![Key art](docs/keyart.png)

## Play

- **Quest 3:** open the GitHub Pages URL for this repo in the Quest browser and press **Enter VR**.
- **Desktop:** serve the folder over HTTPS or localhost (`npx serve .`) and press **Fight on desktop**. Desktop mode is for testing without a headset.

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
| A | Restart after clearing the bar |

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
- **Rocco & Ivan** (round 4 mini-boss): Rocco is a broad Columbian bouncer who fights like a faster boxer (four-punch combos, high guard). Ivan is a Krasnovian bouncer in a tracksuit who clinches harder and needs three arm hits to break. One fights while the other circles wide. Stagger, floor or grab the active one and his partner tags in. Drop one for good and the survivor enrages: faster and with shorter windups. Both have health bars over their heads.
- Attack tokens (two attackers at once, the rest circle), four escalating rounds: punks → boxer + Bat Boy → cook + wrestler + punk + Bat Boy → Rocco & Ivan.

## Quest performance

- **One draw call per goon.** Each goon is a single CPU-skinned mesh: every body part's vertices are moved by its ragdoll frame each frame, and the hurt/KO faces swap by rewriting the face UVs. Previously each goon was 14 to 16 draw calls. Stools are one mesh on a vinyl + chrome atlas.
- **Perf panel.** Left X (desktop: P) shows fps, physics ms per frame, draw calls and the current quality level on your left wrist, plus live tuning for ragdoll pull, hit shove, knockback, fist pitch in the controller and vertex snap. Tuning is saved in the browser.
- **Auto quality.** If the frame rate stays under 90% of the 72 Hz target for 1.5 s, physics steps down (120 Hz × 4 iterations → 90×4 → 90×3 → 72×3 → 60×2). It steps back up after sustained headroom, and backs off further each time it has to drop again. Turn it off in the panel.
- Damage feedback is a red dithered vignette, haptics and sound. The camera never moves on its own.

## Tuning

Every number lives in `CFG` at the top of the game script in `index.html`: physics (`CFG.physics`: how hard goons follow their animation, hit shoves, personal space, domino and impact speeds), tier thresholds, damage and poise per tier, hitstop, knockback, magnetism, block and dodge distances, grab and throw, weapons and projectiles, per-enemy stats, the boss tag team (`CFG.boss`), waves, perf/auto quality (`CFG.perf`), render settings (desktop lines, VR framebuffer scale, snap/affine per mode), and `hands.modelPitchDeg` for how the fist model sits in the controller.

## Tests

No headset needed. The tests run the real game script against a small stand-in for Three.js (math and scene graph only, no rendering):

```
node test/vr.js        # 39 checks: tiers, flick, block, parry, clinch, grab/throw, drink, perf panel + tuning, potato catch + throw-back, bat disarm + bat damage, locomotion
node test/physics.js   # 41 checks: heights for all 7 goons, skinned mesh vs skeleton, one mesh per goon/stool, shove + recover, launch, get-up, dominoes, the cook's lob accuracy, Rocco & Ivan tag + enrage
node test/bot.js 1 400 --mode=aggro    # a bot plays all four rounds (catches pots, throws them back); prints hits, losses, catches, tags, per-round times, errors
```

They check game logic only. Rendering, shaders and real WebXR need a browser or the headset.

## Stack

Single file, Three.js r149 from jsDelivr, WebXR, synthesized placeholder audio. Textures are embedded as data URIs. No build step.
