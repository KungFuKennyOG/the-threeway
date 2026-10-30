# The Threeway

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
| A | Restart after clearing the bar |

Desktop: mouse look, WASD, left/right click (or J/K) punch, Shift heavy, hold X light, Space block, C duck, G headbutt, E grab/drop, Q throw, F drink, R restart.

## What's in

- The Threeway bar in the art spec's PS1 look: vertex-lit, 16-colour hand-pixeled textures, 15-bit colour with 4×4 Bayer dither, plum fog, 6 per-vertex lights. Desktop renders 240 lines with vertex snap and affine warp; VR keeps the dither and fog but turns snap and affine off.
- Velocity punching with the four tiers, 40–60 ms hitstop on the enemy (never the player's view), haptics.
- Hidden poise per enemy: flinch → stagger (bonus-damage window) → knockdown → launch. Head hits do more damage, body hits more poise.
- Forearm block, parry, dodge by moving your head.
- Grab and throw, bottles (one hit, drinkable) and stools (three hits).
- Bōsōzoku punk (fodder), Columbian boxer (fast jab combos, high guard: go to the body), Krasnovian wrestler (clinches you).
- Attack tokens (two attackers at once, the rest circle), three escalating rounds.
- Damage feedback is a red dithered vignette, haptics and sound. The camera never moves on its own.
- MVP simplification from the spec: knocked-down goons tumble as one rigid body.

## Tuning

Every number lives in `CFG` at the top of the game script in `index.html`: tier thresholds, damage and poise per tier, hitstop, knockback, magnetism, block and dodge distances, grab and throw, weapons, per-enemy stats, waves, render settings (desktop lines, VR framebuffer scale, snap/affine per mode), and `hands.modelPitchDeg` for how the fist model sits in the controller.

## Tests

No headset needed. The tests run the real game script against a small stand-in for Three.js (math and scene graph only, no rendering):

```
node test/vr.js        # fake Quest controllers: tiers, flick, block, parry, clinch, grab/throw, drink, locomotion
node test/bot.js 1 240 --mode=sloppy   # a bot plays all three rounds; prints hits by tier, damage taken, errors
```

They check game logic only. Rendering, shaders and real WebXR need a browser or the headset.

## Stack

Single file, Three.js r149 from jsDelivr, WebXR, synthesized placeholder audio. Textures are embedded as data URIs. No build step.
