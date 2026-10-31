'use strict';
// ============================== the level registry ==========================
// The bar and the street are built in; every level after them registers itself here from its own file
// (src/superblock/build.js, src/kras/podezd.js, ...), so a new level touches only its own files plus one <script> tag.
//
// defineLevel(name, {
//   menu:   '5 · The Palace of Sport',            // "Start at" entry (also ?level=<name>)
//   cfg:    () => CFG.palace,                      // its stage config: encounters (trigger or at, arena, lock, spawn, respawn), props...
//   origin: () => [0, 0],                          // encounter positions are relative to this (default: world)
//   build() {},                                    // called once from buildStreet(): geometry, lamps (ST.lamps), walk rects
//   rooms() {},                                    // called once at boot, before 'outside': addRoom / roomMeshes / addPortal
//   outside: () => [meshes],                       // meshes drawn as part of the outside
//   rects: [[x0, x1, z0, z1]],                     // ground it occupies: the far city and the skylines keep off it
//   start(fromPrevious) {},                        // begin the level (from the menu, or walking in from the previous one)
//   update(dt) {},                                 // every frame while it's on (rides, set pieces)
//   after: 'podezd', enter: () => bool,            // walk on from that level (once it's won) when this turns true
//   finish: (z) => bool, wonSign: 'sign',          // optional: the level is won when its fights are done and this is true
//   signs: { key: ['TEXT', '#colour'] },           // big signs it shows (showSign(key))
//   hud: { walk: 'text', won: 'text', short: 'Palace' },
// })
const LEVELS = {};
function defineLevel(name, def) { LEVELS[name] = Object.assign({ name }, def); return LEVELS[name]; }
const levelList = () => Object.values(LEVELS);
const levelRects = () => levelList().flatMap(D => typeof D.rects === 'function' ? D.rects() : (D.rects || []));
const onLevelGround = (x, z, m = 0) => levelRects().some(([a, b, c, d]) => x > a - m && x < b + m && z > c - m && z < d + m);
// Goons a level names that aren't built yet stand in as one that is, so levels can be written with their real cast
// before the goons land (the stand-in goes away the moment CFG.enemies has the real one).
const ENEMY_FALLBACK = { warden: 'laborer', sambo: 'conscript', lifter: 'wrestler', gymnast: 'conscript', guard: 'laborer', bandsman: 'cook',
  specialist: 'wrestler', clerk: 'conscript', bodyguard: 'wrestler', orlova: 'ivan', chairman: 'ivan', inspector: 'conscript', militia: 'wrestler' };
const enemyType = (t) => (CFG.enemies[t] ? t : ENEMY_FALLBACK[t] || 'conscript');
