'use strict';
/* ============================================================================
   THE THREEWAY — combat MVP (Vostburg)
   One question: does hitting people in The Threeway feel good?
   Plain script files (no build step), Three.js r149, WebXR + desktop test mode. Art: PS1 rules from the
   art spec (vertex-lit, nearest textures, 15-bit dither, plum fog).
   ========================================================================= */

// ============================== CONFIG (tune here) ==========================
const CFG = {
  punch: {
    minTravel: 0.20,          // m of fist travel in the last travelWindow; less = shove
    travelWindow: 0.25,       // s
    velWindow: 0.03,          // s of tracking history used for hand speed
    peakWindow: 0.1,          // s: a hit is scored with the peak hand speed in this window
    // hand speed lower bounds (m/s) -> result
    tiers: [
      { name: 'shove', min: 0.0, dmg: 0,  poise: 4,  knock: 0.6 },
      { name: 'light', min: 1.5, dmg: 6,  poise: 12, knock: 1.0 },
      { name: 'solid', min: 3.0, dmg: 11, poise: 30, knock: 1.6 },
      { name: 'heavy', min: 5.0, dmg: 18, poise: 48, knock: 2.4 },
    ],
    minContactSpeed: 0.8,     // below this a touch is ignored entirely
    headDamageMult: 1.5,      // head hits do more damage
    bodyPoiseMult: 1.5,       // body hits do more poise damage
    armDamageMult: 0.5,
    staggerBonus: 1.5,        // damage multiplier during a stagger window
    launchSpeed: 6.5,         // heavy hit above this on a staggered enemy = launch
    hitstop: [0.04, 0.06],    // s, enemy only; the player's view never freezes
    hitCooldown: 0.3,         // s per hand per enemy
    fistRadius: 0.06,
    magnetism: 0.06,          // extra reach for fast swings (hit magnetism)
    magnetismMinSpeed: 3.0,
  },
  reactions: { flinchTime: 0.35, staggerTime: 1.4, parryStaggerTime: 1.8, knockbackMult: 2.5, getUpTime: 1.4, getUpBlend: 1.5, koRemoveTime: 5.0 },
  // ragdoll physics (position-based particles, 15 joints per goon)
  physics: {
    hz: 120, iterations: 4, gravity: -9.8, maxSpeed: 12, groundFriction: 8,
    activePull: 0.3,          // how hard a standing goon's ragdoll follows its animation (0 = limp, 1 = rigid)
    staggerPull: 0.12,        // wobbly while staggered
    hitShove: { shove: 1.2, light: 1.8, solid: 3.0, heavy: 4.2 },   // m/s pushed into the joints near the hit
    hitShoveMult: 1.0,        // in-VR tuning knob: scales every hitShove
    playerRadius: 0.2,        // your body is a capsule goons can't walk or punch through
    personalSpace: 0.55,      // closest a goon's feet get to you
    dominoSpeed: 3.0,         // a flying body this fast bowls over a standing goon
    impactDamageSpeed: 4.0, impactDamage: 8,   // thrown into walls / the bar
    bottleBreakSpeed: 5.0,
  },
  defense: { blockRadius: 0.15, blockMaxFromHead: 0.55, dodgeDistance: 0.28, parryMinSpeed: 1.5, parryWindow: 0.15, lowBlockRadius: 0.42, lowDrop: 0.7 },
  grab: { reach: 0.3, breakFree: 2.0, throwMinSpeed: 2.0, throwMult: 2.5, throwAssistDeg: 25, headbuttSpeed: 1.3 },
  weapons: {
    bottle: { dmg: 8, poiseMult: 1.0, durability: 1, grabRadius: 0.16, hitRadius: 0.08, reach: 0.2 },
    stool:  { dmg: 6, poiseMult: 1.5, durability: 3, grabRadius: 0.3,  hitRadius: 0.22, reach: 0.6 },
    bat:    { dmg: 10, poiseMult: 1.8, durability: 8, grabRadius: 0.22, hitRadius: 0.1, reach: 0.75, length: 0.75 },
    pipe:   { dmg: 12, poiseMult: 2.0, durability: 99, grabRadius: 0.22, hitRadius: 0.09, reach: 0.8, length: 0.8 },   // the laborer's: steel, never breaks
    potato: { dmg: 5, poiseMult: 1.0, durability: 1, grabRadius: 0.18, hitRadius: 0.07, playerDmg: 6 },
    pot:    { dmg: 9, poiseMult: 2.0, durability: 99, grabRadius: 0.2, hitRadius: 0.12, playerDmg: 10 },
    // street props
    crate:  { dmg: 9, poiseMult: 2.0, durability: 2, grabRadius: 0.34, hitRadius: 0.24, reach: 0.5, size: 0.46 },
    bin:    { dmg: 7, poiseMult: 1.7, durability: 99, grabRadius: 0.32, hitRadius: 0.24, reach: 0.5, size: 0.44, height: 0.62 },
    sign:   { dmg: 11, poiseMult: 1.8, durability: 5, grabRadius: 0.24, hitRadius: 0.17, reach: 1.1, length: 1.25 },
    swingMult: { stool: 1.2, bat: 1.3, pipe: 1.25, sign: 1.25, bin: 1.1 },   // big things hit as if swung a bit faster
    drinkHeal: 30, drinkTime: 0.8, mouthRadius: 0.16,
    thrownHitSpeed: 3.0,
    throwAssistDeg: 20,       // thrown props curve a little toward a goon inside this cone
  },
  // thrown kitchenware: hits your head/body, bounces off a forearm block, or gets caught
  projectiles: { catchRadius: 0.24, deskCatchRange: 2.6, headRadius: 0.17, bodyRadius: 0.2, blockRadius: 0.09, maxInAir: 2, maxLying: 6 },
  player: { health: 100, clinchDps: 5, clinchTime: 3.0, clinchSlam: 15, armHitsToBreak: 2, standHeight: 1.68 },
  ai: { kickStrikeTime: 0.2, tokens: 2, circleRadius: 2.0, attackCooldown: [1.2, 2.2], strikeTime: 0.16, lungeTime: 0.25, batStrikeTime: 0.22 },
  enemies: {
    // scale: the art-set models are built ~2 m tall; this brings them to ~1.75–1.8 m
    boso:     { hp: 40, poise: 40, speed: 1.3,  reach: 0.78, windup: 0.75, dmg: 10, combo: 1, scale: 0.86 },
    boxer:    { hp: 60, poise: 55, speed: 1.7,  reach: 0.74, windup: 0.45, dmg: 7,  combo: 3, comboWindup: 0.25, highGuard: true, scale: 0.88 },
    wrestler: { hp: 90, poise: 90, speed: 1.05, reach: 0.9,  windup: 0.9,  dmg: 0,  combo: 1, grabber: true, scale: 0.9 },
    // Columbia weapon goon: long telegraphed bat swing. Parry the bat arm (or the bat) to knock it loose.
    batboy:   { hp: 55, poise: 50, speed: 1.45, reach: 1.05, windup: 1.0,  dmg: 16, combo: 1, weapon: 'bat', unarmedReach: 0.78, unarmedDmg: 9, unarmedWindup: 0.7, scale: 0.87 },
    // Krasnovia kitchen thrower: keeps 3–5 m away and lobs potatoes and pots on real arcs
    cook:     { hp: 45, poise: 40, speed: 1.35, reach: 0.78, windup: 0.6,  dmg: 6,  combo: 1, thrower: true, keepAway: [3.0, 5.0], throwWindup: 0.9, throwCooldown: [1.8, 3.0], scale: 0.88 },
    // Hinomoto corporate muscle: a clear riot shield eats anything thrown at his front, and punching it earns the baton. Break it or flank him.
    secguard: { hp: 75, poise: 70, speed: 1.15, reach: 0.92, windup: 0.75, dmg: 9, combo: 1, shield: 5, counterWindup: 0.3, scale: 0.92 },
    // Hinomoto street kickboxer: dashes in, kicks high or low, darts back out. Block high; drop a forearm or step back from low.
    kicker:   { hp: 45, poise: 40, speed: 2.5, reach: 1.0, windup: 0.5, dmg: 8, combo: 2, comboWindup: 0.4, kicker: true, retreat: 2.6, scale: 0.86 },
    // the mini-boss pair: one fights while the other waits; a stagger or knockdown tags the other in
    rocco:    { hp: 150, poise: 110, speed: 1.8, reach: 0.76, windup: 0.42, dmg: 9, combo: 4, comboWindup: 0.22, highGuard: true, boss: true, scale: 0.96 },
    // Bogdan "the Bear" Volkov: wrestling champion turned enforcer. A bigger, slower grappler; enrages at half health
    volkov:   { hp: 280, poise: 200, speed: 1.2, reach: 1.0, windup: 0.85, dmg: 0, combo: 1, grabber: true, boss: true, clinchDps: 8, clinchSlam: 22, armHitsToBreak: 3, scale: 1.04 },
    // Krasnovia fodder: a conscript in an oversized greatcoat, half asleep (slow windups)
    conscript: { hp: 40, poise: 35, speed: 1.15, reach: 0.78, windup: 0.9, dmg: 9, combo: 1, scale: 0.86 },
    // Krasnovia weapon goon: a laborer with a length of steel pipe. Slower and heavier than Bat Boy's bat; swat it loose and it's yours
    laborer:  { hp: 70, poise: 75, speed: 1.1, reach: 1.1, windup: 1.15, dmg: 18, combo: 1, weapon: 'pipe', unarmedReach: 0.8, unarmedDmg: 10, unarmedWindup: 0.8, scale: 0.9 },
    ivan:     { hp: 190, poise: 150, speed: 1.15, reach: 0.95, windup: 0.85, dmg: 0, combo: 1, grabber: true, boss: true, clinchDps: 7, clinchSlam: 18, armHitsToBreak: 3, scale: 0.96 },
  },
  boss: { tagCooldown: 4.0, benchRadius: 2.9, enrageSpeed: 1.25, enrageWindup: 0.75 },
  waves: [ ['boso', 'kicker'], ['secguard', 'boxer', 'batboy'], ['cook', 'wrestler', 'kicker', 'batboy', 'boso'], ['rocco', 'ivan'] ],
  // Quest performance: auto quality steps physics down when the frame rate sags, back up when it recovers
  perf: { autoQuality: true, levels: [[120, 4], [90, 4], [90, 3], [72, 3], [60, 2]], targetVR: 72, targetDesktop: 55,
          dropAfter: 1.5, raiseAfter: 8, panelHz: 4 },
  render: { desktopLines: 240, vrFramebufferScale: 0.9, camFar: 600, batchProps: true,
            desktopVertexSnap: true, vrVertexSnap: true,       // fine grid: a slight wobble, not a shake
            desktopSnapLines: 600, vrSnapLines: 560,           // snap grid size in lines (higher = subtler)
            desktopAffine: true, vrAffine: false,
            colorBits: 6, ditherStrength: 0.5,                 // 6-bit colour per channel, soft 4x4 Bayer
            fogNear: 4.5, fogFar: 12.5 },
  hands: { modelPitchDeg: -30, fistForward: 0.02 },   // tilt of the fist model inside the controller grip
  move: { speed: 2.2, snapTurnDeg: 30, deadzone: 0.3 },
  // ---- level 2: out the door into Tripoint Square, down the old road to the militia checkpoint
  street: {
    doorSpeed: 0.9, doorOpenDeg: 100,          // the bar's door swings out onto the square once the bar is clear
    start: [0, 7.2],                           // where "start in the street" puts you (x, z), facing down the road
    finishZ: 54.6,                             // walk up to the boom and the level is done
    exitPast: 2.0,                             // then walk this far past the lifted boom and you're at Tram Depot 7
    spawnGap: 1.1, clearedPause: 1.6, healBetween: 20,
    // each stretch: walk past `trigger` (z) and you're held between arena[0] and arena[1] until it's clear.
    // spawn: [type, x, z]; respawn: where you restart that stretch after going down
    encounters: [
      { name: 'square', trigger: 7.5, arena: [5.6, 21.6], respawn: [0, 7.6], sign: 'square',
        spawn: [['boso', -16.5, 14.5], ['kicker', 16.5, 13], ['boso', 0, 21]] },
      { name: 'road', trigger: 27, arena: [22.5, 44.5], respawn: [0, 27.5], sign: 'road',
        spawn: [['boxer', 1.5, 43.5], ['batboy', -2.5, 43.8], ['cook', 0.5, 44.2]] },
      { name: 'checkpoint', trigger: 46, arena: [44.6, 55.6], respawn: [0, 46.2], sign: 'last',
        spawn: [['secguard', 0, 55.2], ['wrestler', -3.4, 55], ['kicker', 3.2, 45]] },
    ],
    // street props: crates, bins and street signs you can pick up and swing or throw ([type, x, z])
    props: [['crate', 11.6, 6.6], ['crate', 11.9, 7.4], ['bin', -11.4, 9.2], ['sign', -12.2, 19.6], ['bin', 9.8, 20.6],
            ['crate', 3.7, 30.5], ['crate', 3.8, 31.3], ['bin', -3.7, 34.4], ['sign', 3.8, 37.5], ['crate', -3.8, 39.2],
            ['bin', 3.7, 46.6], ['crate', -3.7, 50.3], ['sign', -3.8, 52.6]],
    fog: { near: 28, far: 130 },               // outside (the bar's is render.fogNear / fogFar); blends at the door. Far enough to see the checkpoint from the square
    skylineFog: 0.5,                           // the far skylines get at most this much fog
    atlasGutter: 8,                            // px of wrapped border per street texture, so the atlas can be mipmapped
    farField: { radius: 430, pitch: 30, block: 22, oldRadius: 140, lampRadius: 16, lampK: 1.3, fineGround: [-170, 170, -150, 250] },   // LOD stand-ins: a street grid of lit boxes from the street's edge out to radius (m), a street light per block
    portalDeg: 72,                             // the bar and the street only draw each other when the door is open and in view
    beaconBlink: 1.6,                          // s per on/off cycle of the towers' red beacons
    light: { ambient: [0.09, 0.075, 0.11], sky: [0.05, 0.075, 0.11],          // night + a little moonlight on roofs
             gas: '#dbe8c4', gasRadius: 9.5, gasK: 1.6,                         // pale gaslight (not Krasnovian sodium)
             flood: '#eef4ff', floodRadius: 14, floodK: 1.5,                     // the checkpoint's floodlight
             sodium: '#ff9a3c', amber: '#ffc870', hinoGlow: '#ff3a5a',
             skylineAmbient: [0.22, 0.2, 0.26], skylineSky: [0.05, 0.05, 0.08] },
    sky: { top: '#0e0710', horizon: '#2a1424', hino: '#8a1434', kras: '#6a3008', colu: '#5a4414' },
  },
  // ---- Act 1, level 2: through the Krasnovian gate into Superblock 14 (world positions; see src/superblock/build.js).
  // Straight on from the checkpoint: no cut. Krasnovian goons only.
  superblock: {
    start: [-2.5, 59.5],                       // "start here" puts you just past the lifted boom, facing the gate
    finishZ: 115.6,                            // walk up to podezd 3's door once the courtyard is clear
    spawnGap: 1.1, clearedPause: 1.6, healBetween: 20,
    encounters: [
      { name: 'gate', trigger: 64, arena: [58, 80.5], respawn: [-3, 63], sign: 'gate',
        spawn: [['conscript', -5, 77.5], ['conscript', -2.2, 79], ['conscript', -8, 62], ['laborer', -14, 83]] },
      { name: 'courtyard', trigger: 95, arena: [91, 118], respawn: [-19.8, 94.5], sign: 'courtyard',
        spawn: [['laborer', -25, 113], ['conscript', -14, 110], ['cook', -31, 104], ['conscript', -19.8, 88]] },
      { name: 'podezd', trigger: 107, arena: [103, 118], respawn: [-19.8, 104], sign: 'podezd',
        spawn: [['wrestler', -13, 116], ['laborer', -24, 116.5], ['conscript', -31, 110], ['laborer', -10, 104]] },
    ],
    props: [['bin', -15, 84.6], ['crate', -24, 84.4], ['crate', -24.8, 84.6], ['sign', -2.4, 82], ['bin', -9.4, 116.6], ['bin', -10.2, 116.8],
            ['crate', -32.6, 94], ['bottle', -31.6, 99.2], ['bottle', -11.2, 106.6], ['crate', -21.5, 116.6]],
    light: { sodiumRadius: 14, sodiumK: 1.5, floodRadius: 18, floodK: 1.4 },
  },
  // ---- the old level 3: Tram Depot 7, Krasnovia (scrapped as a location; its ring moves to the Palace of Sport) (positions are local to the depot gate: lx across, lz in; see src/depot/build.js)
  depot: {
    start: [0, 2.2],                           // where you arrive (through the gate), facing into the yard
    spawnGap: 1.2, clearedPause: 1.6, healBetween: 25,
    encounters: [
      { name: 'yard', trigger: 4, arena: [0.6, 31.6], respawn: [0, 3], sign: 'yard',
        spawn: [['wrestler', -10, 24], ['cook', 12, 28], ['wrestler', 9, 4.5]] },
      { name: 'hall', trigger: 35, arena: [32.5, 64], respawn: [0, 35.5], sign: 'hall',
        spawn: [['secguard', 0, 60], ['wrestler', -11, 56], ['cook', 12, 62], ['kicker', 0, 33]] },
      { name: 'ring', trigger: 64.5, arena: [62, 79.4], respawn: [0, 64.6], sign: 'volkov', boss: true,
        spawn: [['volkov', 0, 72]] },
    ],
    enrageAt: 0.5,                             // the boss loses it below this share of his health
    props: [['crate', -8.5, 3], ['crate', -8.9, 3.8], ['bin', 13.5, 12], ['sign', -16.6, 30], ['crate', 12.5, 36], ['bin', -12, 34],
            ['crate', 16.4, 52], ['bottle', 24, 50.5], ['bottle', 24.1, 52], ['bottle', 26.8, 48]],
    light: { sodiumRadius: 14, sodiumK: 1.5, floodRadius: 18, floodK: 1.4, tube: '#dfefff', tubeRadius: 13, tubeK: 1.25, workRadius: 9, workK: 1.6, ring: '#ffd8a0', ringRadius: 7.5, ringK: 1.6, hallAmbient: [0.1, 0.1, 0.115] },
  },
  debugLabels: true,          // floating LIGHT / SOLID / HEAVY labels at hit points
  labelScale: 0.0035,         // metres per label pixel
};
