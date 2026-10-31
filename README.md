# The Threeway

![The Threeway](docs/logo.png)

VR beat 'em up prototype for Quest 3. Vostburg, 1986: a city split three ways by a cold war, and the one bar where all three sides drink together. The officials want it shut. Their muscle just walked in.

This is the combat MVP. It answers one question: does hitting people in The Threeway feel good?

![Key art](docs/keyart.png)

## Play

- **Quest 3:** open the GitHub Pages URL for this repo in the Quest browser and press **Enter VR**.
- **Desktop:** serve the folder over HTTPS or localhost (`npx serve .`) and press **Fight on desktop**. Desktop mode is for testing without a headset.
- **Skip ahead:** pick a level under **Start at** on the menu (or open the page with `?level=street` or `?level=superblock`).

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
| A | Restart after clearing a level (or walk on: out the bar's open door, through the lifted boom) |
| Left menu button (≡) or Y | Pause. Quest Browser keeps ≡ for its own menu; close that and the game's pause screen is waiting underneath |
| In menus | Either stick up/down picks, left/right changes an option; A, X or trigger chooses; B or Y goes back |

Desktop: mouse look, WASD, left/right click (or J/K) punch, Shift heavy, hold X light, Space block, C duck, G headbutt, E grab/drop/catch, Q throw, F drink, R restart, P perf panel (`[` `]` pick a setting, `-` `=` change it).

## Menus

- **Title (VR):** entering VR puts you in the empty bar facing an arcade-style title screen (attract loop: title, story, how to play). A inserts a coin, then START, STAGE SELECT (every stage, 1–7), OPTIONS (volume, music volume, snap turn 15–60°, move speed; saved in the browser), HOW TO PLAY, EXIT VR. START begins at the page's **Start at** pick.
- **Pause:** RESUME, RESTART STAGE, STAGE SELECT, OPTIONS, HOW TO PLAY, QUIT TO TITLE. The world freezes (goons, physics, the clock) and dims behind a panel in front of you. Stage changes fade through black.
- **Desktop:** Esc pauses (an overlay); arrows/WASD pick, Enter chooses, Esc goes back. Code: `src/menu.js`.

## What's in

- **Physics-first goons.** Every goon is an active ragdoll: 15 joint particles held together by sticks (position-based dynamics, 120 Hz). Standing, they're pulled toward their animation, so every hit physically shoves them at the spot you hit and they spring back. Knockdowns, launches and throws drop the pull and they go limp, then get up onto a knee and stand. Grab a collar and the rest of the body dangles from your fist. Thrown goons bowl over other goons and scatter the bar stools; slamming them into walls or the bar hurts.
- **Real scale.** Goons are 1.71–1.77 m; Rocco and Ivan are 1.83–1.91 m. Your body is a capsule nobody can walk or punch through, so goons stop at arm's length instead of ending up inside your face.
- **Props are physical too:** bottles and stools tumble, get kicked around by goons, knocked off the bar by your fists, and bottles shatter on hard impacts.
- The Threeway bar in the art spec's PS1 look: vertex-lit, ≤16-colour hand-pixeled textures, 6-bit colour with a soft 4×4 Bayer dither, plum fog, 6 per-vertex lights, fine vertex snap (a slight wobble). Desktop also renders 240 lines with affine warp; VR keeps snap but turns affine off.
- **Home, in the bar** (the game never visits the three home capitals; the bar keeps a little of each): the Columbia window is a painting of Liberty Avenue's gold crowns and searchlights with the **Halcyon** drifting over them, cream and gold, its FLY HALCYON panel and gondola lit, passing behind the mullion a texel at a time (a lap every ~3½ minutes, like the real one; its strip's UVs live in the bar's one mesh, so no extra draw call). The bottles are home brands: Columbia Cola, Ōkyō beer, Krasnograd vodka, and a lit FROM HOME board behind the bar spells it out (Columbia Cola, bottled in Halcyon). `tools/bar_home.py` paints them.
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
- **The skylines, and the scale ladder** (each act tops the last: the Tower of Labor 252 m < Civic Harmony's mast 320 m < Aoki 400 m): Hinomoto's black-glass neon cluster behind the Threeway, brush-lettered boards and blade signs on every tower, the Shuto Expressway's bike trails, and **Aoki Development**, a black glass spike with red neon up every edge, seven neon-ringed eaves and a three-tier lit pagoda crown that pulses red. Krasnovia's even field of panel slabs and the TV tower right of the road, the Tower of Labor's floodlit massing, gold cog and six sweeping searchlights to the north-west. Columbia's **Liberty Avenue** ridge running across the view: floodlit cream setback crowns with gold bands, sunbursts and spires; **Civic Harmony** with its empty floodlit mooring mast, joined by a lit skybridge to the **Royal Hotel** (gold mansard, red ROYAL neon); six gold searchlights crossing the sky; and the **Halcyon**, a cream-and-gold zeppelin (FLY HALCYON down its flanks) circling the ridge every 3½ minutes, two searchlights keeping on its hull. It never moors. Red beacons blink on top. The sky glows red, sodium and gold over each sector.

## Act 1, level 3: the Krasnovian gate and Superblock 14

Clear the road and the checkpoint boom lifts. Keep walking: there's no cut and no loading. Across the Ring Road, the Accords wall runs on down the old road's line. Krasnovia is the lane to its right.

- **The gate:** a concrete wall across the Krasnovian lane, a gantry with KRASNOVIAN UNION in cream on red, a sentry box, a floodlight, red flags. The Columbian lane beyond the wall is shut with an iron gate. Conscripts hold the gate, and a laborer comes from the forecourt.
- **The forecourt and the arch:** sodium lamps, a worker mosaic and a banner on a nine-storey panel slab. You go in through the arch under it.
- **Superblock 14's courtyard:** twelve-storey wings with lit kitchens and TV-blue windows, lock-up garages along the Accords wall (its watchtower behind them), packed dirt, a rocket climbing frame, swings, a sandpit, benches, laundry on the line, a parked saloon. Two fights: the courtyard (a laborer, conscripts, the cook) and the door (the wrestler, two laborers, a conscript).
- **Podezd 3:** the 22-storey point block's door, its stairwell windows lit all the way up. Walk up to it and the level ends; the stairwell is next.
- **The kitchen by the door:** a lit ground-floor kitchen just west of podezd 3 (fridge, net curtains, oilcloth, a teapot) where the family's big set shows Central Television's **Krasnograd May Day parade**: a square far bigger than anything in Vostburg, ranks to the horizon, the Palace of the Union under the original gilded cog, KRASNOGRAD along the foot. Every few seconds it cuts to a zoom on the Palace and the cog and back (the screen's UVs swap as the mesh is drawn: no draw call, nothing in the frame loop).
- **Krasnovian goons only:** the **conscript** (fodder: an oversized greatcoat, a fur ushanka, half asleep, slow windups) and the **laborer** (a steel pipe swung like Bat Boy's bat but slower and heavier; swat it loose and it's yours, and it never breaks), plus the wrestler and the cook.

## Act 1, level 4: podezd 3 (inside Superblock 14)

There are no stairs anywhere (VR): lifts and a cradle do the climbing, so your view only moves up or down in an enclosed or eased ride.

- **The lobby:** through the street door from the courtyard. Mailboxes, a radiator, the stairs padlocked shut. A fight with the door shut behind you.
- **Lift A** climbs once the lobby is clear and **breaks at the 7th**: sparks, the doors jam half open, and it's dead from then on.
- **The 7th:** fight on the landing, then through the party wall into the **north wing's corridor**: padded doors, bare bulbs, laundry, a communal kitchen halfway along. A corridor fight with the cook, a laborer, the wrestler and a conscript.
- **Lift B** at the far end takes you to **the wing's roof**, 34 m up, with the 22-storey point block towering beside you and the whole city around. A roof fight.
- **The cradle:** step into the window-cleaner's cradle and it lowers you down the north face to the railway bank. The Palace of Sport is next.

## Act 1, level 5: the Palace of Sport

Still one flat floor all the way, no cut from the railway bank. The crossing runs skewed, north-west, so you step off it facing the Tower of Labor, and the route runs on west, away from the wall with Columbia and deep into the Krasnovian sector: the Boulevard, the Palace, Parade Square and the Tower stand on one straight axis, the Tower dead ahead the whole way down it, like the map. In Act 1 the Tower is the only big landmark: the Ministry's wall slabs keep Columbia's skyline out of sight until you're up the Tower.

- **The level crossing:** through a gap in the railway fence, a few steps east of where the cradle sets you down. The planks run skewed across the three tracks, north-west (55° off square), toward the Tower. The barriers are down, the lamps wig-wag, the bells ring, and the evening electric (four green cars) comes out of the tunnel under the wall (under the slab that stands on its portal) and thunders past. Then the barriers lift. Ahead over the goods yard, the Palace's oval and its four floodlight masts, and the Tower of Labor.
- **Station Square:** you step off the crossing at the square's south-east corner facing north-west, the Tower of Labor just right of straight ahead (about 20°) over the goods yard and the Palace, and walk straight on, 25 m across the square, into the boulevard's wide mouth (its south lawn is paved, so it opens onto the square), the Palace and the Tower ahead. **East Station** stands on your left along the square's east side, its back to the slabs: a stone hall with a glass entrance, the name, a clock and a gilt spire with the gold cog. On its front, south of the entrance, a split-flap **departures board**: KRASNOGRAD · 31 HRS at the top, then Novostal, Port Zorya and Bogatyr (the home country is big). A monument to the railwaymen facing the crossing, poplars, sodium posts, the goods yard's low wall on your right.
- **The wall slabs:** the Ministry built its tallest slabs along the Accords wall so nobody has to look at Columbia. 22-storey panel slabs (Superblock 14's precast panels, lit and dark windows) stand behind the station, along the wall and across the boulevard's view east (a faded banner on the axis, PEACE · LABOR · UNITY along its top, floodlit; the worker mosaic on the gable over the tracks), and a 12-storey wing stands on the tunnel's portal. From the crossing, the square and the boulevard they hide Liberty Avenue's ridge entirely, every crown, spire and Civic Harmony's mast: only the gold searchlight beams and, for part of each lap, the Halcyon show over the roofline. The whole ridge is the reveal from the Tower's glass lift and the Chairman's tribune. (From Parade Square, 200 m further west, the crowns show again high over the Palace, behind you: hiding them there would take slabs ~200 m tall.) Cost: a few big boxes on the panel painting, one quad per repeat, in the crossing's mesh: no new draw call or painting.
- **The Boulevard of Champions:** paving between clipped poplars, benches, sodium lamps, the Palace lit up ahead and the Tower over it. A fight (sambo, conscripts, a laborer).
- **The Palace from outside:** a Luzhniki-style stadium, one big cream oval with giant pilasters and tall glowing glass over lettered gates to the stands (A–H), a heavy cornice and a cantilevered canopy with lamps under it. The backs of the stands rise behind to a flagged crest, low at the ends so the Tower stays clear over it. Four lattice floodlight masts lean in over the bowl. The portico (PALACE OF SPORT, the athletes' relief) is set into the front, with TONIGHT · VOLKOV VS GUEST and SOLD OUT boards beside it.
- **The forecourt and the foyer:** two champion statues flanking the forecourt's mouth, flags, the Bear on the hoardings. Inside: ticket windows, the trophy cabinet, Volkov's posters.
- **The gym:** wall bars, mats, a vaulting horse, a beam, rings, a barbell rack. Over the east wall bars a red banner: BOGDAN VOLKOV · TRAINED AT ZUBR KRASNOGRAD; under the coach's window the home league's pennants (Zubr, Molot, Zorya, Iskra). A fight (gymnasts, a lifter, sambo) that holds you in.
- **The arena:** out of the players' tunnel onto the sports floor, the stands full on all four sides, slogan boards, banners, a lighting truss, the scoreboard (VOLKOV 9 : GUEST 0), the ring under its lamps. **Bogdan "the Bear" Volkov** in the ring: boss bar, enrages at half health.
- **The north doors:** shut behind a steel shutter until he's down. After the KO's beat (TO PARADE SQUARE) the shutter rolls up over 4.6 s: a clank, the motor, the slats rattling over the drum, a clank at the top. The floodlit square's warm light spills in under it as it goes, onto the tunnel and a patch of floor that runs further in as the gap grows (one 36-triangle mesh drawn as light, brightening what's under it, plus one live lamp so goons, props and your hands warm up in it; nothing baked changes). You can walk under it from three quarters up. Act1-parade swells in as it rises. Out through the tunnel and from under the doors' canopy the whole Tower stands over you, nothing in front of it (`CFG.palace.shutter`).

The old Tram Depot 7 level is gone (it stood where the Palace's grounds are now). Its paintings stay in `src/depot/paint.js`: the Palace and the railway reuse them.

## Act 1, level 6: Parade Square

Out of the Palace of Sport's north doors, no cut: the May Day parade's rehearsal at night, under floodlights. One flat floor.

- **The reveal:** step out from under the doors' canopy and the Tower of Labor stands over the whole square, base to cog, nothing in front of it (the reviewing stand flanks its doors; the floats, masts and banners stand off its sightlines). THE TOWER OF LABOR in gold, hung low under it (not on it), with a chime; then PARADE SQUARE if no fight's started. Once per walk-in; from the menu it's just PARADE SQUARE (`CFG.parade.reveal`).

- **The square:** granite paving with the red route running from the Palace's doors to the Tower of Labor's, faded red banners on poles down both sides, four floodlight masts throwing warm pools on the four fight zones, sodium lamps at the edges. Three portrait floats on wheeled platforms (invented heroic workers: a steelworker, a woman in a kerchief, a miner), the brass band's drums, chairs and music stands, the gymnasts' mats with a vaulting horse and a beam, empty bleachers on the north side under PEACE · LABOR · UNITY. Floats, the stand, the band's gear and the masts are solid, so fights go around them.
- **The Ministry of Order** (Inspector Orlova's) on the south side (on your right as you walk to the Tower): a grey stepped block, red banners, a shut bronze portico, a gold cog, and one lit window high up with someone standing in it, watching. Not enterable.
- **The reviewing stand** at the far (west) end: two draped wings with canopies (GLORY TO LABOR, 1 MAY 1986) either side of the Tower's doors, flags and floods on the poles between them.
- **Three fights** (the Palace's doors shut behind you while each is on): the honour guard (two guards with flagpoles, two conscripts), the gymnasts (three gymnasts and a laborer, on and around the mats), the band (two bandsmen throwing cymbals and drumsticks, the specialist out of the Tower's doors, a guard, a conscript). Goons not built yet stand in (`ENEMY_FALLBACK` in `src/levels.js`).
- **The end:** walk up to the Tower of Labor's doors. The Tower is next.

## Act 1, level 7: the Tower of Labor

Through the Tower's big front doors from Parade Square, no cut. Krasnovia's seat of power, at the west end of Act 1, ~300 m from the Threeway, built like Moscow State University: a central tower of five floodlit stepped tiers (146 m) between four lower wing towers that step up to it (two inner towers to 104 m, two outer ones to 60 m, low wings joining them), symmetrical, with gilt-tipped pinnacles on every setback, chunky floodlit worker statues on the podium and the wings (a steelworker with a cog, a harvester with a sheaf, a standard-bearer, a man with a hammer: all invented), giant red banners down the faces, TOWER OF LABOR over the doors. On top of the central tower, the Chairman's stage with his tribune hanging off its south face at 190 m; over it the crown: a lantern blazing gold, a gilt spire, and the gilded cog at 226 m: a solid self-lit gold wheel with a halo, static, the brightest thing in the sky; the Krasnovian beacon on the tip at 252 m. Six searchlights on the podium and the wing towers sweep the sky, seen from the whole act (Tripoint Square, the gate, the wing roof, the crossing, the boulevard). No stairs: lifts do all the climbing, each shut while its floor's fight is on.

- **The lobby:** double height, marble, a red carpet, six columns, a giant worker mosaic (an invented steelworker and harvester holding up a gold cog) behind a bronze hero throwing up a gold cog, flags, banners, chandeliers. By lift 1, a glass case let into the east wall (red velvet, a strip light): scale models at 1:250 of **the Palace of the Union**, Krasnograd (480 m: a colonnaded stylobate, five stepped drums, a gilt lantern and spire under the original cog) beside the Tower of Labor (252 m), half its height; the brass plaque beside it compares them. Ministry militia and inspectors; the doors are shut behind you while it's on.
- **Lift 1 to the Ministry's typing pool:** ranks of desks the width of the tower, a green bankers' lamp glowing on every one, all of them facing the Chairman's eight-metre portrait; brass pneumatic tubes overhead into the exchange under the plan board (PLAN 104). The fight is in the clear aisle down the middle. Clerks and a bodyguard.
- **Lift 2 to the archive:** a canyon of floor-to-ceiling shelving (7 m) under green lamps on long cords, rolling ladders, the card-index wall, and Inspector Vera Orlova's interrogation desk in the middle under one bare bulb. Orlova (boss bar; enrages at half health) and her bodyguard. When she's down, the glass door in the south wall opens on the night.
- **The glass lift:** up the outside of the south face on two gilt rails, 150 m, enclosed in glass and eased (< 60 mm a frame), Parade Square, the Palace and the whole city falling away below you, the searchlights sweeping past. Up there the air clears: the city's fog pulls back with your height.
- **The Chairman's tribune, under the cog:** a marble balcony with a stone balustrade (no falling off) on corbels, flags, lamp standards, the gold wheel right overhead, the city below, the wind. The Chairman comes out of his office (oak, his desk with a snow globe of the Palace of the Union on it, his portrait) and the last fight is out there, with his two bodyguards from either side of his doors. Beat him and he kneels; once his bodyguards are down too he signs the permit to reopen The Threeway on the table set out for it: SIGNED · 1 OF 3, ACT 1 COMPLETE. (A leader goon with `signs: true` calls `onLeaderSigned(e)`; beating the last fight also counts as his signature.)
- **Cost:** the outside is the shell (one baked mesh, ~6.6k triangles) and the glow (one 30-triangle additive mesh: the beams, the halos), drawn on every outdoor level. The beams move in the glow's own `onBeforeRender`, so they sweep wherever they're drawn and cost nothing where they aren't; there's no per-frame hook outside the level.

## Music

The sector arrival themes and Act 1's own level and boss tracks (`tools/music/`, composed in code) play in game as seamless loops. Code: `src/music.js`.

| Where | Track |
| --- | --- |
| The title screen (VR), the pause menu | The Threeway theme, quietly (`CFG.music.menuDb`): the title is an arcade cabinet in the empty bar, already beeping |
| The bar, Tripoint Square and the road | The Threeway theme: the prologue, all in the Old Quarter, out the door with no cut |
| The gate and Superblock 14 | Krasnovia: it crossfades in as you walk past the checkpoint's boom |
| Podezd 3 | act1-podezd |
| The Palace of Sport: the crossing, the boulevard, the gym | act1-palace |
| Volkov | act1-volkov, from his sign (THE BEAR) until he's down, then back to act1-palace for the KO |
| The north shutter going up | act1-parade, early: it crossfades in from 45% up (decoded ahead once Volkov's track has gone), full as the shutter reaches the top; you walk out onto the square with it already playing |
| Parade Square | act1-parade |
| The Tower of Labor: the lobby, the typing pool | act1-tower |
| Orlova, in the archive | act1-orlova, from her sign until the glass lift opens |
| The glass lift (from when it opens on the night after Orlova), the tribune, the Chairman | act1-tribune |
| SIGNED · 1 OF 3 | the act1-signed sting: the music drops out under it, then the tribune comes back softly (−12 dB) under ACT 1 COMPLETE |

- **Levels flow, and so does the music.** On a change (of level, or of fight or area inside one) the same track keeps playing (no restart); a different one crossfades (equal power, `CFG.music.fade` 2.5 s; into a boss's own track 1 s, on his sign).
- **The mix:** a fight dips the music 3 dB. A boss with his own track (Volkov, Orlova; the Chairman fights to the tribune's) gets a crossfade, not a duck. A boss without one (the bar's Rocco & Ivan) ducks it 14 dB for 2 s, then back to the fight level. A win or a loss brings it back up. All in `CFG.music` (top of `src/music.js`).
- **Volume:** OPTIONS has a MUSIC bar (saved with the others), under the overall VOLUME.
- **Starts with the click** that unlocks sound (Enter VR / Fight on desktop), on `AU`'s Web Audio context. Each track is one `AudioBufferSourceNode` looping between its loop points (no `<audio loop>`: it gaps). Tracks load lazily (fetch + decode), the one you need first; the next level's file is fetched ahead while you play, and the next likely track inside a level is decoded ahead (Volkov's from the gym, Orlova's from the typing pool, the tribune's during Orlova, the sting with the tribune). At most two decoded tracks at once, plus the small sting (Quest memory: ~30 MB per track).
- **A per-level track:** add it to `MUSIC.songs` (file and loop points) and point the level at it in `MUSIC.tracks` (by level name, as in `defineLevel`). For music that follows a level's fights or areas, give the level `{ song, at, ahead }`: `at()` returns the track for where you are now (helpers: `MUSIC.fighting('volkov')`, `MUSIC.reached('archive')`), `ahead()` the one to decode ahead. A level with no entry is silent. A sting is a song with `oneShot: true`, played by `MUSIC.cue(name)`.
- **The loops** (`assets/music/loop/`, Ogg Opus: the four themes at 96 kbps, ~0.9 MB each; Act 1's seven at 64 kbps, 0.5–0.75 MB each; the sting 0.14 MB; 8.1 MB in all. Columbia and Hinomoto are ready for later acts, and `python3 loops.py columbia_swing` makes the swing draft's when the diner wants it) are rendered by `tools/music/loops.py` with the generator's own `Song.render(loop_bars=...)` (the tail folded onto the head), with a quarter second of the loop's wrap on each side of the loop points so codec padding never lands on the seam. `python3 loops.py --check` verifies each seam (no click, no gap) and that the notes match the full renders in `assets/music/`. Volkov's and Orlova's ENRAGED sections play when the loop reaches them, not on the actual enrage (a later pass).

## Goons: the style rule

New or changed goons follow `docs/goon-style.md`. Each one is a character with one loud signature shape, pushed proportions, a distinct face, a dense hand-pixeled sheet and an idle pose with attitude. No uniform-only goons. Check every one in a lineup beside the originals.

**Act 2's Columbian regulars** (`tools/goons_columbia.py` paints them; in no level yet, since there are no Act 2 levels):
- **The cadet** (fodder; a towering pompom shako, saluting): quick weak jabs off a short windup, low poise. Cadets **rally**: one near another cadet who's attacking joins in, one over the attacker cap, and closes faster.
- **The soda jerk** (thrower; a tower of plates overhead): keeps 3–5 m off and lobs diner **plates**, which fly flat and shatter on anything (your guard, you, the floor), and **Columbia Cola bottles**, which you can catch (and drink) or swat. Cornered, he swings the bottle.
- **The linebacker** (the heavy; giant shoulder pads, number 54): heavy punches that move you, and from 2–7 m a big crouch (**CHARGE!**, 0.8 s), then a straight-line charge at where you stood. Caught, you're **tackled**: thrown back 1.3 m, eased so your view never moves more than 55 mm a frame. **Sidestep** and he runs on: into a wall or the bar he's dazed (2.8 s of stars, punches do extra), and goons in his path are bowled over. Punches don't stop a charge.
- **The marshal** (elite; a white Stetson, a gold marshal's star, arms folded): squares up and waits. A punch he sees coming (from his front) he may **parry**, then **COUNTER!** off a 0.2 s windup; never more than once per 1.5 s. He reads a hand you keep using and misses more just after he's been hit. **Feints** (a punch pulled short) leave him open; hits from the side or back, grabs and thrown things get through.

## Quest performance

- **Merged static geometry.** The whole bar room is one mesh on one atlas (`tools/bar_atlas.py` packs its textures; the shader tiles each texture inside its box of the atlas). The street is one mesh on a painted, mipmapped atlas, the skylines and far city another. Light is **baked per vertex** at build time with the shader's own formula, so any number of gas lamps is free; goons, props and hands are lit live by the 6 nearest lamps (the bar's six inside).
- **Prop batches.** Every stool, crate, bin and street sign is written into one mesh per material each frame (a few hundred vertices on the CPU), so a room full of stools or a street full of crates is one draw call.
- **LOD stand-ins.** Past the Old Quarter's edge every building is one cheap box with its lit windows painted on, out to ~400 m: you see the city's lights and rooflines all the way to the skylines, nothing pops. The street atlas is mipmapped (wrapped gutters), so far things average instead of sparkling. They're filed into 240 m tiles (`CFG.street.farField.tile`), each drawn as its own mesh over the skyline mesh's own buffers (nothing copied), so three culls the tiles out of view: about half the far city, whichever way you look.
- **Portal culling.** The world is rooms joined by doorways (`src/rooms.js`): you're in one room, and a neighbour is drawn only if the doorway into it is open, in view and within 150 m (`CFG.street.portalFar`), and the room beyond that only if its doorway is too. The bar and the street only draw each other through the open door; inside with the door shut, the street, skylines and sky aren't drawn at all. The levels' insides (podezd 3, the Palace) work the same way.
- **Drawn only where it can be seen.** A mesh may carry `userData.near = [x, z, R, H]`: it's drawn only with your eye within R m of (x, z), or over H m up. The stadium (150 m), Parade Square (205 m) and the checkpoint's boom have one: from Tripoint Square, the road and the gate the slabs hide them entirely. The distances come from a sweep (eyes on a 12 m grid over every outdoor walk rect, a cube of views each) and pixel-for-pixel stills. Anything that showed from far off somewhere has none: the street, podezd 3's lift cars, the crossing's barriers, the glass lift.
- Measured in Chromium: 9 draw calls in the bar (was 26), 8–9 down the street, 18 looking back at the Threeway through its open door (was 49). ~52k static triangles, most of them the always-on skylines and far city.
- **Act 1 on a Quest-shaped eye** (headless Chromium, three r149; [docs/perf.md](docs/perf.md) has every view): outdoors 36–45 draw calls and 78–111k triangles per eye, so 155–222k across both eyes against a ~250k budget (it was 213–232k before the far-city tiles, the portal distance and the `near` rules). Indoors 7–13 draws. Nothing is over budget; the tightest views are Parade Square looking back at the Palace and the glass lift.
- **Physics lookups by cell.** World boxes, blockers, walk rects and floors are looked up by x-and-z cells, not z bands alone: Act 1's west levels lie along world −x, so by z alone every ragdoll particle tested every box from the crossing to the Tower. A five-goon fight's frame loop went 6.5 → 1.8 ms in Node (physics 5.9 → 1.3).
- **One draw call per goon.** Each goon is a single CPU-skinned mesh: every body part's vertices are moved by its ragdoll frame each frame, and the hurt/KO faces swap by rewriting the face UVs. Previously each goon was 14 to 16 draw calls. Stools are one mesh on a vinyl + chrome atlas.
- **Perf panel.** Left X (desktop: P) shows fps, physics ms per frame, draw calls and the current quality level on your left wrist, plus live tuning for ragdoll pull, hit shove, knockback, fist pitch in the controller and vertex snap. Tuning is saved in the browser.
- **Auto quality.** If the frame rate stays under 90% of the 72 Hz target for 1.5 s, physics steps down (120 Hz × 4 iterations → 90×4 → 90×3 → 72×3 → 60×2). It steps back up after sustained headroom, and backs off further each time it has to drop again. Turn it off in the panel.
- Damage feedback is a red dithered vignette, haptics and sound. The camera never moves on its own.

## Tuning

Every number lives in `CFG` in `src/config.js` (level 2: `CFG.street`: the stretches, triggers, spawns and arenas, street props, gaslight, fog, sky glow; the levels after the street: `CFG.superblock`, `CFG.podezd`, and `CFG.palace` etc. in each level's own file; Volkov himself is in `CFG.enemies.volkov`): physics (`CFG.physics`: how hard goons follow their animation, hit shoves, personal space, domino and impact speeds), tier thresholds, damage and poise per tier, hitstop, knockback, magnetism, block and dodge distances, grab and throw, weapons and projectiles, per-enemy stats, the boss tag team (`CFG.boss`), waves, perf/auto quality (`CFG.perf`), render settings (desktop lines, VR framebuffer scale, snap/affine per mode), and `hands.modelPitchDeg` for how the fist model sits in the controller.

## Tests

No headset needed. The tests run the real game script against a small stand-in for Three.js (math and scene graph only, no rendering):

```
node test/street.js    # 56 checks: the scale ladder and the skylines (Aoki tallest, in reach of the far plane, the sky band, the sweeping beams, the zeppelin's flight, clearance and lap), one-mesh bar room, prop batches, LOD stand-ins (the far city's tiles over the skyline mesh's buffers, every vertex drawn once), portal culling, the door opens and leads outside, walls and crossings, baked light and the live lights outside/inside, the stretches (trigger, spawn, arena lock, clear, lose + restart), the boom, crates/bins/signs, draw calls + triangle budget, street physics cost
node test/floors.js     # 29 checks: raised floors, ramps and stairs (a test staircase): the bar unchanged bit for bit, easing up a flight, landing edges, goons fighting, falling and getting up on a landing, props on floors
node test/podezd.js     # 30 checks: in from the courtyard (no cut), the lobby, lift A breaks at the 7th, the landing, the link, the corridor fight, lift B, the roof (respawn on the roof), the cradle down; rides smooth (mm per frame), goons on their floors, rooms, physics cost
node test/parade.js     # 50 checks: one baked mesh + triangle budget, nothing from the far city on it, west of x -6, the Tower's doorway left open, the reveal's framing (rays from the north doors at eye height to the Tower's doors, podium, tiers, cog and spire: nothing but the Tower in the way), THE TOWER OF LABOR once as you step out (then PARADE SQUARE), flat floor, out of the Palace's doors with no cut (a stub Palace if it isn't there), walls (the Palace's front, the ministry, the bleachers, the Tower's front) and solid floats/stand/drums/masts, the three fights in order (arena both ways, doors shut), restart after going down, the Tower's doors end it, hand-over with no jump, physics cost
node test/superblock.js  # 29 checks: past the boom with no cut, one baked mesh + triangle budget, nothing from the skylines on it, the gate/arch/slabs/garages as walls, Krasnovian-only fights in order, restart a stretch, the door ends the level, physics cost
node test/palace.js     # 53 checks: off the cradle through the fence gap (no cut), the crossing shut, the train out of the tunnel and past, the barriers up, the crossing skewed, Station Square (the Tower within 25° of straight ahead as you step off and nothing in front of it, straight on into the boulevard's mouth, walls, the turn west onto the boulevard), the wall slabs (ray probes: Columbia's crowns, spires and mast hidden from the square, the crossing and the boulevard's start; the Halcyon over them for part of each lap; the whole ridge back from the tribune), the boulevard fight, the glass front as a wall, the gym fight (held in), Volkov (boss bar, the stands as walls, the shutter, lose + restart, enrage), the north shutter rolling up over seconds after the KO (never jumping; light spilling in as it goes; not walkable till it's most of the way up; no camera move), the stadium shell (holds the inside, lid over the saucer, masts lean in, the doors and the Tower kept in view down the boulevard, from the crossing and the step off it), out the north doors, rooms (no doorway looked through from past `portalFar`; the stadium, Parade Square and the boom drawn only where they can be seen), physics cost
node test/tower.js      # 60 checks: from the menu, the shell + glow + floors + budgets (the outside < 8000 + 100 triangles), MSU massing (outer < inner < centre, symmetrical, <= 260 m), the searchlights sweep (cheaply, on any level), the cog static, nothing from the skylines on its ground, the old distant tower gone and the beacon on the spire, its proportions and fog, Act 1 west (the frame round-trips, each place further west than the last, the Tower dead ahead down the boulevard, nothing from the far city on any level's ground, clear sightlines to the cog from the square, the gate, the wing roof, the crossing, the boulevard and Parade Square), every fight on one floor, the four fights in order (doors and lifts shut mid-fight), the three lifts (smooth: < 60 mm a frame; the glass lift opens once Orlova's down, outside halfway up, 150 m), respawn on the right floor, Orlova's enrage, the tribune (outside, flat, the balustrade holds you), the Chairman signs out there (the hook too), rooms (in his office the city shows through his doors only), in from Parade Square with no cut, physics cost
node test/bot.js 1 400 --mode=aggro --level=street   # the bot fights down the street to the checkpoint (--level=both: the bar, out the door, then the street; --level=superblock: the gate and the courtyard; --level=road: the street, through the boom, on into Superblock 14)
node test/vr.js        # 71 checks: the title screen (coin, START), pause (Y, a passed-through menu button, a blurred session; freezes the world; stick picks; B resumes; restart; quit to title; stage select), the laborer's pipe (disarm, pick up), the conscript, level 2 in VR (start outside, stick walking, held in by the stretch), tiers, flick, block, parry, clinch, grab/throw, drink, perf panel + tuning, potato catch + throw-back, bat disarm + bat damage, riot shield block/counter/flank/shatter, high vs low kicks + retreat, locomotion
node test/music.js     # 58 checks: every level maps to a track and every file is there (loops and the sting), no audio (nothing throws, nothing plays), the bar's track first, bar -> street keeps the same source, street -> superblock crossfades (equal power; the next level's file fetched ahead), on into podezd, the Palace (no restart through its fights, Volkov's track decoded ahead in the gym, a 1 s crossfade on his sign with no duck, a retry keeps it, back to the Palace's when he's down, act1-parade early as the north shutter goes up, no restart stepping out), Parade Square, the Tower (Orlova's ahead, her crossfade, the tribune's ahead during her fight, the glass lift opens into the tribune, the Chairman keeps it), SIGNED (the sting once, the music out under it, back softly under ACT 1 COMPLETE, gone on a restart), fight dip, the bar's boss duck and back, win/lose, pause and title quiet, the MUSIC option, rapid changes, never more than two voices or decoded tracks, a track that won't load or decode
node test/physics.js   # 47 checks: heights for all 9 goons, skinned mesh vs skeleton, one mesh per goon/stool, shove + recover, launch, get-up, dominoes, the cook's lob accuracy, Rocco & Ivan tag + enrage
node test/columbia.js   # 30 checks: Act 2's Columbians: the soda jerk keeps range, plates land and shatter (and on a guard), bottles caught and landing, his bottle swing; the linebacker's crouch and charge, the tackle (eased under 60 mm a frame), sidestepped into the bar (staggered), bowling a goon, punches don't stop him; the marshal's parry and riposte, once per 1.5 s, side and back hits, feints, thrown props and grabs get through, his odds; the cadet's quick windup and the rally
node test/bot.js 1 400 --mode=aggro --waves=marshal+marshal,linebacker+cadet   # the bot fights any goons in the bar (rounds split by commas, goons by +)
node test/bot.js 1 400 --mode=aggro    # a bot plays all four rounds (catches pots, throws them back); prints hits, losses, catches, tags, per-round times, errors
```

They check game logic only. Rendering, shaders and real WebXR need a browser or the headset.

## Stack

Three.js r149 from jsDelivr, WebXR, synthesized placeholder sound effects, Web Audio music. Plain script files, no build step: `index.html` loads them in order and they share one global scope, so it runs straight off GitHub Pages or any static server (not from `file://`: browsers won't load the textures there).

| File | What's in it |
| --- | --- |
| `src/config.js` | `CFG`: every tunable number |
| `src/textures.js`, `assets/tex/` | texture names → hand-pixeled PNGs |
| `src/render.js` | renderer, scene, the PS1 shader (vertex snap, affine UVs, 6-bit dither, fog, baked light, atlases), lights |
| `src/geometry.js` | mesh builders, static batching, light baking |
| `src/bar.js`, `src/bar_atlas.js` | the bar room (one mesh on one atlas: `tools/bar_atlas.py`; the window, the Halcyon's strip, the FROM HOME board and the bottles are painted by `tools/bar_home.py`), walkable areas, the door, the Halcyon's drift |
| `src/levels.js` | the level registry (`defineLevel`), stand-in goons, and level frames: `levelFrame()` lays a level authored in its own coordinates into the world, turned by a multiple of 90° (`ACT1_WEST`: the Palace past the crossing, Parade Square and the Tower, running west) |
| `src/street/` | level 2: `paint.js` (painted street atlas), `build.js` (the square, the road, the checkpoint), `skylines.js` (the three sectors, the far city, the sky), `fight.js` (stretches, portals, signs) |
| `src/kras/` | Krasnovia: `paint.js` (stairwell paint, padded doors, the lift; the Palace's stadium shell, crowd, sports floor, the train), `podezd.js` (podezd 3: the lobby, the 7th, the wing's corridor and roof, two lifts, the cradle, the railway bank), `palace.js` (the Palace of Sport: the level crossing and the train, the boulevard, the foyer, the gym, the arena, `CFG.palace`), `parade.js` + `parade_paint.js` (Parade Square: the square, the Ministry of Order, the reviewing stand, `CFG.parade`), `tower.js` + `tower_paint.js` (the Tower of Labor: the shell, its wings and crown, the searchlights and halos (the glow), the lobby, the typing pool, the archive, the glass lift, the tribune, the signing, `CFG.tower`) |
| `src/superblock/` | Act 1's walk into Krasnovia: `paint.js` (slabs, garages, the gate's signs, in the street atlas), `build.js` (the gate, the forecourt, the arch, Superblock 14's courtyard and podezd 3; one baked mesh) |
| `src/depot/` | `paint.js`: paintings from the scrapped depot level (track, canvas, ropes, the Bear's poster…), still used |
| `src/rooms.js` | rooms + portals: what's drawn from where |
| `src/characters.js` | goon bodies and poses, the player's hands |
| `src/audio.js`, `src/fx.js` | placeholder sound, sprites and signs |
| `src/music.js`, `assets/music/` | the music player (`MUSIC.tracks`: level (and its fights and areas) -> track, crossfades, ducking, stings, `CFG.music`); the themes, Act 1's tracks and their game loops (`loop/`, from `tools/music/loops.py`) |
| `src/player.js`, `src/locomotion.js` | the player, XR + desktop input, hand/head tracking, moving and turning |
| `src/physics.js` | the particle ragdoll solver, walls, collisions |
| `src/props.js` | bottles, stools, bats, kitchenware, crates, bins, signs; prop batches |
| `src/enemies.js`, `src/combat.js`, `src/bosses.js` | goon AI, your hits, Rocco & Ivan |
| `src/game.js`, `src/hud.js`, `src/main.js` | rounds, HUD + perf panel, the frame loop and boot |
