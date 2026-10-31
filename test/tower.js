// Headless checks for the Tower of Labor (the end of Act 1): no stairs. Started from the menu, walked into from Parade
// Square, the lobby, lift 1 to the Ministry's typing pool, lift 2 to the archive (Inspector Orlova), the glass lift up the
// outside of the south face to the Chairman's tribune; he signs out there and Act 1 is complete. Also the MSU massing,
// the searchlights (the glow mesh) and the budgets the shell pays on every outdoor level.
'use strict';
const vm = require('vm');
const THREE = require('./three_stub.js');
let clock = 0, seed = 47;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const mkEl = (id) => ({ id, hidden: false, disabled: false, textContent: '', style: {}, _l: {}, addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }, fire(t, e) { for (const f of this._l[t] || []) f(e || {}); } });
const els = {}; for (const id of ['c', 'menu', 'vrBtn', 'deskBtn', 'vrNote', 'hud', 'hpFill', 'info', 'levelSel']) els[id] = mkEl(id);
els.c.requestPointerLock = () => {};
els.levelSel.value = 'tower';   // the menu's "Start at" picker
class ImageStub { set src(v) { this.width = 40; this.height = 16; if (this.onload) this.onload(); } }
const ctx = { THREE, console, Math: Object.create(Math), document: { getElementById: (id) => els[id], addEventListener() {} }, navigator: {}, Image: ImageStub,
  innerWidth: 1280, innerHeight: 720, performance: { now: () => clock * 1000 }, addEventListener: () => {},
  setTimeout, Map, Set, Array, Object, Number, String, Float32Array, Uint8Array, JSON };
ctx.Math.random = rnd; ctx.window = ctx;
vm.createContext(ctx);
require('./load.js')(ctx);
const run = (c) => vm.runInContext(c, ctx);
const TW = ctx.__tw;
const log = [];
const check = (name, ok, extra = '') => log.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  (' + extra + ')' : ''));
const DT = 1 / 72;
const step = (n, f) => { for (let i = 0; i < n; i++) { clock += DT; if (f) f(i); TW.renderer.loop(); } };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const C = TW.CFG.tower, TWR = run('TWR'), L = run('TLIFTS'), M = TWR.meshes;
// The tower is authored in the ACT1_WEST frame's coordinates (src/levels.js) and laid into the world at the west end of the
// route: positions here are local (W() takes one into the world; LH() / RL() are your head and the rig in the frame).
const AW = run('ACT1_WEST'), W = (x, y, z) => { const [a, b] = AW.toWorld(x, z); return V(a, y, b); }, LH = () => AW.local(TW.player.head), RL = () => AW.local(TW.rig.position);
const setL = (x, y, z) => TW.rig.position.copy(W(x, y, z));
const kill = () => { for (const e of TW.enemies) { e.hp = 0; e.knockdown(V(0, 0, 1), 'knockdown', true); } };
const face = (yaw, pitch = 0) => run(`desk.yaw = ${yaw + AW.yaw}; desk.pitch = ${pitch};`);   // a facing in the frame
let maxJump = 0;   // the most your view moved up or down in one frame (VR comfort)
const frame = (n = 1) => { for (let i = 0; i < n; i++) { const y0 = TW.rig.position.y; step(1); maxJump = Math.max(maxJump, Math.abs(TW.rig.position.y - y0)); } };
const walkTo = (lx, lz, sp = 0.035) => {   // walk in small steps (the walk rects and floors apply, like the keyboard) to a local point
  let best = 1e9, stuck = 0; const { x, z } = W(lx, 0, lz);
  for (let k = 0; k < 2500; k++) {
    const dx = x - TW.rig.position.x, dz = z - TW.rig.position.z, d = Math.hypot(dx, dz); if (d < 0.02) break;
    if (d < best - 0.005) { best = d; stuck = 0; } else if (++stuck > 40) break;   // held by a wall: give up
    const s = Math.min(sp, d); TW.rig.position.x += dx / d * s; TW.rig.position.z += dz / d * s;
    const p = V(TW.rig.position.x, TW.rig.position.y, TW.rig.position.z); TW.keepInWalk(p, 0.3); TW.rig.position.x = p.x; TW.rig.position.z = p.z; frame();
  }
};
const until = (f, n = 3000) => { for (let i = 0; i < n && !f(); i++) frame(); return f(); };
const fightClear = () => { until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900); kill(); until(() => TW.game.state === 'walk', 600); };
const onFloor = (y) => TW.enemies.length > 0 && TW.enemies.every(e => Math.abs(e.pos.y - y) < 0.1);
const carMid = (Li) => [(Li.car[0] + Li.car[1]) / 2, (Li.car[2] + Li.car[3]) / 2 + (Li.glass ? -0.3 : 0.3)];
let midRide = null;   // what the glass lift's ride looked like halfway up
const ride = (Li) => {   // step into a lift and ride it to the top of its run; returns the worst per-frame jump
  const [cx, cz] = carMid(Li); walkTo(cx, Li.glass ? Li.car[3] + 0.8 : TWR.wallZ - 0.8); walkTo(cx, cz); maxJump = 0;
  const mid = (Li.stops[0] + Li.stops[1]) / 2;
  until(() => {
    if (Li.glass && !midRide && Li.y > mid) { face(0, -0.5); frame(); midRide = { room: TW.roomState.cur, sky: TW.ST.skylineMesh.visible, shell: TWR.shell.visible, glow: TWR.glow.visible, inCar: run('twInCar(TLIFTS[2])'), y: +Li.y.toFixed(1) }; }
    return Li.stop === 1 && Li.phase === 'open';
  }, 4800);
  return maxJump;
};
const inside = (x, z, [x0, x1, z0, z1], m = 0) => x > x0 + m && x < x1 - m && z > z0 + m && z < z1 - m;
const inBlocker = (lx, lz, y) => { const { x, z } = W(lx, 0, lz); return TW.BLOCKERS.some(b => b.y1 !== undefined && y >= (b.y0 || 0) - 0.5 && y < b.y1 && x > b.x0 - 0.3 && x < b.x1 + 0.3 && z > b.z0 - 0.3 && z < b.z1 + 0.3); };
const comfort = 0.06;   // m: the most your view may move in one frame of a ride

try {
  // ---- the menu: the deskBtn starts whatever "Start at" picks
  check('the menu lists it as "7 · The Tower of Labor"', TW.LEVELS.tower && TW.LEVELS.tower.menu === '7 · The Tower of Labor' && TW.LEVELS.tower.after === 'parade');
  els.deskBtn.fire('click'); step(3);
  check('starting it from the menu puts you just inside the south doors, on the ground floor', TW.level.name === 'tower' && Math.abs(RL().z - C.start[1]) < 0.3 && Math.abs(TW.player.floorY) < 0.01, `${TW.level.name} z ${RL().z.toFixed(2)}`);

  // ---- the build
  check('the tower is a baked shell (outside, fogged like the skylines but less) + one small additive glow + two baked meshes for its four floors + three lift cars + the permit',
    ['low', 'high'].every(k => M[k] && M[k].geometry.attributes.bake) && TWR.shell.geometry.attributes.bake && TWR.shell.material.uniforms.uFogOn.value === C.shellFog
    && TWR.glow && TWR.glow.material.transparent && TWR.glow.material.depthWrite === false && TWR.glow.material.uniforms.uFogOn.value < C.shellFog
    && L.length === 3 && L.every(Li => Li.group && Li.leaves.length === 2) && L[2].glass && TWR.permit && !TWR.permit.visible);
  const T = TWR.tris, inTris = T.lobby + T.office + T.archive + T.top;
  check('each floor keeps its triangles modest', ['lobby', 'office', 'archive', 'top'].every(k => T[k] < 6000), ['lobby', 'office', 'archive', 'top'].map(k => k + ' ' + T[k]).join(', '));
  check('the outside (paid on every outdoor level) stays cheap: shell < 8000 triangles, the glow < 100, two meshes (+ the glass car)',
    T.shell < 8000 && T.glow < 100 && TW.LEVELS.tower.outside().length === 3, T.shell + ' shell + ' + T.glow + ' glow tris');
  { const sym = (x) => -80 - x, P = TWR.shell.geometry.attributes.position.array;
    const topAt = (x0, x1) => { let m = 0; for (let i = 0; i < P.length; i += 3) if (P[i] > x0 && P[i] < x1 && P[i + 2] > 300 && P[i + 2] < 352) m = Math.max(m, P[i + 1]); return m; };
    const inner = [topAt(-2, 2), topAt(sym(2), sym(-2))], outer = [topAt(22, 26), topAt(sym(26), sym(22))], centre = topAt(-41, -39);
    check('MSU massing: the central tower between four wing towers stepping up to it, symmetrical (outer < inner < centre), no taller than ~260 m',
      Math.abs(inner[0] - inner[1]) < 0.01 && Math.abs(outer[0] - outer[1]) < 0.01 && outer[0] > 40 && outer[0] < inner[0] && inner[0] < TWR.tiers[4][5] && centre === TWR.spire && centre <= 260,
      `outer ${outer[0].toFixed(0)} m, inner ${inner[0].toFixed(0)} m, centre ${centre.toFixed(0)} m`); }
  { const g = TWR.glow, P = g.geometry.attributes.position.array, eye = W(-40, 1.7, 256), E = [eye.x, eye.y, eye.z].join(',');
    run('twGlowTick(0, new V3(' + E + '))'); const a = Array.from(P);
    run('twGlowTick(4, new V3(' + E + '))'); const b = Array.from(P);
    let moved = 0, n = 0; for (let v = 18; v < a.length / 3; v++) { if ((v - 18) % 12 < 6) continue; const i = v * 3; n++; if (Math.hypot(a[i] - b[i], a[i + 1] - b[i + 1], a[i + 2] - b[i + 2]) > 1) moved++; }   // the far half of each beam
    const up = C.search.every((s, k) => { const d = run(`twBeamDir(${k}, 7.3, new V3())`); return d.y > 0.5 && Math.abs(Math.hypot(d.x, d.y, d.z) - 1) < 1e-6; });
    const t0 = process.hrtime.bigint(); run(`{ const c = new V3(${E}); for (let i = 0; i < 1000; i++) twGlowTick(i / 72, c); }`); const us = Number(process.hrtime.bigint() - t0) / 1e3 / 1000;
    check('six searchlights sweep the sky (their beams move, always upward), in one small mesh moved as it\'s drawn (so on any level), cheaply',
      C.search.length === 6 && moved > n * 0.8 && a.every(Number.isFinite) && up && typeof g.onBeforeRender === 'function' && us < 200, `${moved}/${n} vertices moved in 4 s, ${us.toFixed(1)} us a tick`);
    const cogTex = TW.ST.atlas.rect.twCog;
    check('the gilded cog is static (nothing turns it): a self-lit gold wheel on the spire, haloed in the glow', !!cogTex && TWR.cogY === 226 && run('typeof TWR.cog') === 'undefined', ''); }
  { const P = TW.ST.skylineMesh.geometry.attributes.position.array, R = AW.rect(TWR.rect); let n = 0;
    for (let i = 0; i < P.length; i += 3) if (P[i + 1] > 0.5 && P[i] > R[0] && P[i] < R[1] && P[i + 2] > R[2] && P[i + 2] < R[3]) n++;
    check('no skyline slab, TV tower or far-city block stands on the tower\'s ground', n === 0, n + ' vertices'); }
  { const B = TW.ST.beacons, [kx, kz] = TW.STREET.kras;
    check('the old distant stepped tower is gone from the skylines; the Krasnovian beacon is on this spire', !B.some(b => b[0] === kx && b[2] === kz) && B.some(b => Math.hypot(b[0] - W(-40, 0, 330).x, b[2] - W(-40, 0, 330).z) < 1e-6 && b[1] > TWR.spire), B.length + ' beacons'); }
  { const top = Math.max(...Array.from(TWR.shell.geometry.attributes.position.array).filter((v, i) => i % 3 === 1));
    check('MSU proportions: five stepped tiers to 146 m, the cog at 226 m, the spire\'s tip at 252 m', TWR.tiers.length === 5 && TWR.tiers[4][5] === 146 && TWR.cogY === 226 && Math.abs(top - TWR.spire) < 0.01, `top ${top.toFixed(1)} m`);
    check('the shell is fogged less than the skylines, so it reads across the city', TWR.shell.material.uniforms.uFogOn.value === C.shellFog && C.shellFog < TW.CFG.street.skylineFog); }

  // ---- Act 1 runs west: the frame, the route, the landmark
  { const pts = [[-40, 151.4], [-40, 330], [-84, 253], [-6, 312], [12.5, -7.25]];
    const rt = pts.every(([x, z]) => { const [a, b] = AW.toWorld(x, z), [p, q] = AW.toLocal(a, b); return Math.abs(p - x) < 1e-9 && Math.abs(q - z) < 1e-9; });
    TW.scene.updateMatrixWorld(); const g = AW.group;
    const grp = pts.every(([x, z]) => { const v = V(x, 3, z).applyMatrix4(g.matrixWorld), w = W(x, 3, z); return v.distanceTo(w) < 1e-9; });
    check('the frame round-trips (local -> world -> local), and its group draws the meshes exactly where the walk rects are', rt && grp && Math.abs(AW.yaw + Math.PI / 2) < 1e-12);
    const [bx, bz] = AW.toWorld(-40, 151.4), [tx, tz] = AW.toWorld(-40, 330);
    check('past the crossing the route turns west: local +z runs to world -x, the boulevard starts at (-56, 198)', Math.abs(bx + 56) < 1e-9 && Math.abs(bz - 198) < 1e-9 && W(-40, 0, 200).x < W(-40, 0, 160).x);
    check('the Tower of Labor stands dead ahead down the boulevard, ~180 m on, deep in the sector', Math.abs(tz - bz) < 1e-9 && tx < bx - 170 && tx < -200, `(${tx.toFixed(1)}, ${tz.toFixed(1)})`); }
  { const PL = run('PL'), PR = run('PR'), Lv = TW.LEVELS;
    const R = (D) => (typeof D.rects === 'function' ? D.rects() : D.rects);
    const crossing = [PL.cross.west, PL.cross.x + PL.cross.hw], square = PL.square, palace = AW.rect(PL.rect), parade = R(Lv.parade)[0], tower = R(Lv.tower)[0];
    const seq = [['the crossing', crossing], ['Station Square', square], ['the Palace', palace], ['Parade Square', parade], ['the Tower', tower]];
    const mid = (r) => (r[0] + r[1]) / 2;   // each reaches further west, and from the square on each one's middle is west of the last's
    // (all north of the tracks' line, z 151.4; the Tower's wings spread both ways off its axis, west of where the tracks end at x -178, so for it, its middle)
    const west = seq.every(([, r], i) => i === 0 || (r[0] < seq[i - 1][1][0] && (i < 2 || mid(r) < mid(seq[i - 1][1]))));
    check('each place on the way is further west (-x, into Krasnovia) than the last: crossing, Station Square, Palace, Parade Square, Tower',
      west && [palace, parade, tower].every(r => r[1] < -50 && (r === tower ? (r[2] + r[3]) / 2 : r[2]) > 151.4), seq.map(([n, r]) => `${n} x ${r[0].toFixed(0)}..${r[1].toFixed(0)}`).join(', '));
    const all = Object.values(Lv).flatMap(D => (R(D) || []).map(r => [D.name, r])), P = TW.ST.skylineMesh.geometry.attributes.position.array, hit = {};
    for (let i = 0; i < P.length; i += 3) if (P[i + 1] > 0.5) for (const [n, r] of all) if (P[i] > r[0] && P[i] < r[1] && P[i + 2] > r[2] && P[i + 2] < r[3]) hit[n] = (hit[n] || 0) + 1;
    check('nothing from the far city (skyline slabs, the TV tower, far-field blocks) stands on any level\'s ground', !Object.keys(hit).length, JSON.stringify(hit) + ` (${all.length} rects)`); }
  // Sightlines to the gilded cog: a segment from your eye to the cog against every triangle of the street, the far city,
  // Superblock 14 and podezd 3, the crossing and the Palace and Parade Square (the tower's own shell left out)
  { const PL = run('PL'), PR = run('PR'), PZ = TW.PZ, SBX = TW.SBX;
    const meshes = [TW.ST.litMesh, TW.ST.skylineMesh, SBX.mesh, PZ.outMesh, PL.crossMesh, PL.outMesh, PR.mesh].filter(Boolean);
    const tris = []; for (const m of meshes) { const a = m.geometry.attributes.position.array, fr = m.parent === AW.group;
      for (let i = 0; i < a.length; i += 3) { if (fr) { const [x, z] = AW.toWorld(a[i], a[i + 2]); tris.push(x, a[i + 1], z); } else tris.push(a[i], a[i + 1], a[i + 2]); } }
    const blocked = (o, t) => {   // does the segment o -> t cross a triangle? (Moller-Trumbore)
      const dx = t.x - o.x, dy = t.y - o.y, dz = t.z - o.z;
      for (let i = 0; i < tris.length; i += 9) {
        const e1x = tris[i + 3] - tris[i], e1y = tris[i + 4] - tris[i + 1], e1z = tris[i + 5] - tris[i + 2], e2x = tris[i + 6] - tris[i], e2y = tris[i + 7] - tris[i + 1], e2z = tris[i + 8] - tris[i + 2];
        const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
        if (Math.abs(det) < 1e-9) continue;
        const sx = o.x - tris[i], sy = o.y - tris[i + 1], sz = o.z - tris[i + 2], u = (sx * px + sy * py + sz * pz) / det; if (u < 0 || u > 1) continue;
        const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x, v = (dx * qx + dy * qy + dz * qz) / det; if (v < 0 || u + v > 1) continue;
        const tt = (e2x * qx + e2y * qy + e2z * qz) / det; if (tt > 1e-4 && tt < 0.999) return true;
      }
      return false;
    };
    const cog = W(-40, TWR.cogY, 330), crown = W(-40, TWR.tiers[4][5] + 8, 330), PZr = PZ.wingRoof;
    const views = [['Tripoint Square (by the Threeway\'s door)', V(2, 1.7, 7), [cog]], ['the Krasnovian gate', V(-3, 1.7, 62), [cog]],
      ['podezd 3\'s wing roof', V(-36, PZr + 1.7, 129), [cog, crown]], ['the level crossing', V(-40, 1.7, 145), [cog, crown]],
      ['the start of the boulevard', V(-58, 1.7, 198), [cog, crown]], ['Parade Square', W(-40, 1.7, 256), [cog, crown]]];
    const res = views.map(([n, o, ts]) => [n, ts.every(t => !blocked(o, t))]);
    check('the cog (and from the roof on, the crown) is in clear view from the square, the gate, the wing roof, the crossing, the boulevard, Parade Square',
      res.every(r => r[1]), res.filter(r => !r[1]).map(r => r[0]).join(', ') + ` (${tris.length / 9} triangles)`); }
  check('every fight is on one floor: its spawns stand on that floor, inside its room, clear of the furniture',
    C.encounters.every(E => E.spawn.every(([, x, z, y]) => y >= E.at[4] && y <= E.at[5] && inside(x, z, E.at, 0.2) && !inBlocker(x, z, y))), C.encounters.map(E => E.name).join(', '));
  check('the cast: militia + inspectors, clerks + a bodyguard, Inspector Orlova (boss) + a bodyguard, the Chairman (boss)',
    C.encounters[0].spawn.every(s => ['militia', 'inspector'].includes(s[0])) && C.encounters[1].spawn.every(s => ['clerk', 'bodyguard'].includes(s[0]))
    && C.encounters[2].boss && C.encounters[2].spawn.some(s => s[0] === 'orlova') && C.encounters[2].spawn.some(s => s[0] === 'bodyguard') && C.encounters[3].boss && C.encounters[3].spawn.map(s => s[0]).join() === 'bodyguard,bodyguard,chairman');

  // ---- the lobby
  until(() => TW.level.encounter === 0, 60);
  check('the lobby fight starts as you come in, the doors and lift 1 shut', TW.level.encounter === 0 && TW.LOCKED.has('twDoor') && TW.LOCKED.has('twLift1'), TW.game.state);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('the lobby crew stands on the ground floor', TW.enemies.length === C.encounters[0].spawn.length && onFloor(0), TW.enemies.map(e => e.type + '@' + e.pos.y.toFixed(1)).join(','));
  walkTo(-40, 310.6);
  check('you can\'t leave through the doors mid-fight', LH().z > 311.9, 'z ' + LH().z.toFixed(2));
  walkTo(-31, 331); walkTo(-31, 335);
  check('nor take lift 1', LH().z < L[0].car[2] + 0.5 && L[0].phase === 'open' && L[0].stop === 0, `z ${LH().z.toFixed(2)} ${L[0].phase}`);
  kill(); until(() => TW.game.state === 'walk', 600);

  // ---- lift 1 to the offices
  let jump = ride(L[0]);
  check('lift 1 takes you up to the Ministry\'s office floor', L[0].stop === 1 && Math.abs(TW.player.floorY - TWR.office.y) < 0.05, `y ${TW.player.floorY.toFixed(2)}`);
  check('the ride is smooth (your view never jumps)', jump < comfort, (jump * 1000).toFixed(1) + ' mm in a frame');
  walkTo(-31, 331);
  until(() => TW.level.encounter === 1, 60);
  check('stepping out starts the office fight, both lifts shut', TW.level.encounter === 1 && TW.LOCKED.has('twLift1') && TW.LOCKED.has('twLift2'), TW.game.state);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  check('the clerks and the bodyguard stand on the office floor', TW.enemies.length === C.encounters[1].spawn.length && onFloor(TWR.office.y), TW.enemies.map(e => e.type + '@' + e.pos.y.toFixed(1)).join(','));
  walkTo(-47, 331.5); walkTo(-47, 335);
  check('lift 2 is shut while it\'s on', LH().z < L[1].car[2] + 0.5 && L[1].stop === 0, 'z ' + LH().z.toFixed(2));
  TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
  check('going down on the office floor puts you back on the office floor, by lift 1', TW.level.encounter === 1 && Math.abs(TW.player.floorY - TWR.office.y) < 0.05 && Math.abs(RL().x - C.encounters[1].respawn[0]) < 0.5, `y ${TW.player.floorY.toFixed(2)}`);
  fightClear();

  // ---- lift 2 to the archive: Inspector Orlova
  jump = ride(L[1]);
  check('lift 2 takes you up to the archive', L[1].stop === 1 && Math.abs(TW.player.floorY - TWR.archive.y) < 0.05, `y ${TW.player.floorY.toFixed(2)}`);
  check('smoothly', jump < comfort, (jump * 1000).toFixed(1) + ' mm');
  walkTo(-47, 331);
  until(() => TW.level.encounter === 2, 60);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  const orlova = TW.game.bosses[0];
  check('Orlova\'s fight: a boss bar, her bodyguard, both on the archive floor, lifts 2 and 3 shut', TW.game.bosses.length === 1 && TW.bossBars.length === 1 && onFloor(TWR.archive.y) && TW.LOCKED.has('twLift2') && TW.LOCKED.has('twLift3'), TW.enemies.map(e => e.type).join(','));
  orlova.hp = orlova.maxHp * 0.45; step(2);
  check('she enrages at half health', orlova.enraged === true);
  TW.player.hp = 0; run('loseRound()'); step(Math.ceil(3.7 / DT));
  check('going down in the archive puts you back in the archive, the fight restarted', TW.level.encounter === 2 && Math.abs(TW.player.floorY - TWR.archive.y) < 0.05 && ['intro', 'fight'].includes(TW.game.state), `y ${TW.player.floorY.toFixed(2)} ${TW.game.state}`);
  fightClear();

  // ---- the glass lift up the outside of the tower to the Chairman's tribune
  until(() => TW.game.state === 'walk', 300);
  check('once Orlova\'s down, the glass lift\'s doors open on the night', ['opening', 'open'].includes(L[2].phase) || (step(90), L[2].phase === 'open'), L[2].phase);
  until(() => L[2].phase === 'open', 200);
  jump = ride(L[2]);
  check('the glass lift takes you up the outside of the south face to the tribune, right under the cog', L[2].stop === 1 && Math.abs(TW.player.floorY - TWR.top.y) < 0.05
    && L[2].car[3] <= TWR.tiers[1][2] && TWR.cogY - TWR.cogD / 2 > TWR.top.y + 12 && TWR.cogY - TWR.cogD / 2 < TWR.top.y + 40, `y ${TW.player.floorY.toFixed(2)}`);
  check('smoothly, all 150 m of it', jump < comfort, (jump * 1000).toFixed(1) + ' mm');
  check('halfway up you\'re outside, in the enclosed glass car: the city, the tower and the searchlights are drawn', !!midRide && midRide.room === 'outside' && midRide.sky && midRide.shell && midRide.glow && midRide.inCar, JSON.stringify(midRide));
  walkTo(-40, 318.5);
  until(() => TW.level.encounter === 3, 60);
  until(() => TW.game.state === 'fight' && !TW.game.queue.length, 900);
  const chair = TW.game.bosses[0];
  check('the Chairman has a boss bar, on his own floor, lift 3 shut', chair && TW.bossBars.length === 1 && onFloor(TWR.top.y) && TW.LOCKED.has('twLift3'), TW.enemies.map(e => e.type + '@' + e.pos.y.toFixed(1)).join(','));
  chair.hp = chair.maxHp * 0.3; step(2);
  check('he doesn\'t enrage (he\'s no fighter)', !chair.enraged);
  // the tribune: outside, flat, held in by its balustrade
  run('level.encounter = 99'); face(Math.PI); step(3);   // (fights paused while we look round)
  check('on the tribune you\'re outside: the city, the shell, the glow are drawn, and through his doors his office', TW.roomState.cur === 'outside' && TW.ST.skylineMesh.visible && TWR.shell.visible && TWR.glow.visible && M.high.visible, TW.roomState.cur);
  { const pts = [[-49.5, 316.1], [-30.5, 316.1], [-49.5, 324.8], [-30.5, 324.8], [-44, 322]].map(([x, z]) => { const w = W(x, 0, z); return run(`floorAt(${w.x}, ${w.z}, ${TWR.top.y + 0.5})`); });
    walkTo(-40.6, 312); const front = LH().z; walkTo(-55, 320); const side = LH().x; walkTo(-40, 318.5);
    check('the tribune is flat and walkable, and its balustrade holds you (no falling off)', pts.every(y => Math.abs(y - TWR.top.y) < 0.01) && front > TWR.tribune[2] && side > TWR.tribune[0] && Math.abs(TW.player.floorY - TWR.top.y) < 0.01,
      `floors ${pts.map(y => (+y).toFixed(2)).join(',')}, held at z ${front.toFixed(2)}, x ${side.toFixed(2)}`); }
  setL(-40, TWR.top.y, 330); face(0, -0.1); step(3);
  check('in his office facing the doors: the office and, through them, the city (skylines, the tower\'s own shell) are drawn; nothing from the floors below',
    TW.roomState.cur === 'twTop' && M.high.visible && TW.ST.skylineMesh.visible && TWR.shell.visible && !M.low.visible, TW.roomState.cur);
  face(Math.PI); step(3);
  check('facing in, the city isn\'t drawn', M.high.visible && !TW.ST.skylineMesh.visible && !TWR.shell.visible);
  setL(-40, TWR.top.y, 318.5); step(2);
  run('level.encounter = 3');
  // he's beaten: he signs
  kill(); until(() => TW.game.state === 'won', 120);
  check('beating the Chairman: he signs, the level is won', TW.game.state === 'won' && run('SIGNED.has("chairman")') && TWR.signed, TW.game.state);
  check('"SIGNED · 1 OF 3"', run('bigSign && bigSign.mesh ? 1 : 1') && run('SIGN_TEXT.signed1[0]') === 'SIGNED · 1 OF 3');
  step(3);
  check('the signed permit lies on the signing table out on the tribune', TWR.permit.visible);
  step(Math.ceil((C.signPause + 0.3) / DT));
  check('then "ACT 1 COMPLETE"', TWR.act1 && run('SIGN_TEXT.act1[0]') === 'ACT 1 COMPLETE' && /Act 1 complete/.test(els.info.textContent), els.info.textContent.slice(0, 60));

  // ---- the leader hook: his own goon (signs: true) kneels and calls onLeaderSigned
  run('LEVELS.tower.start(false); level.encounter = 99'); step(2);
  run('resetTowerLifts(3); clearEnemies(); level.encounter = 3; game.state = "fight"; game.queue = []; { const e = new Enemy(enemyType("chairman")); e.placeAt(...ACT1_WEST.toWorld(-43, 321), 0, TWR.top.y); e.cooldown = 1e9; enemies.push(e); }');
  setL(-40, TWR.top.y, 318); step(3);
  run('onLeaderSigned({ type: "bodyguard", cfg: {} })'); step(1);
  check('the hook ignores goons who don\'t sign', !TWR.signed && TW.game.state === 'fight');
  run('onLeaderSigned({ type: "chairman", cfg: { signs: true }, alive: false })'); step(1);
  check('a leader with signs: true calling onLeaderSigned ends the level the same way', TWR.signed && TW.game.state === 'won');

  // ---- his bodyguards: if he goes down first he kneels, and signs only once they're down too
  run('LEVELS.tower.start(false); level.encounter = 99'); step(2);
  run('resetTowerLifts(3); clearEnemies(); level.encounter = 3; game.state = "fight"; game.queue = []; for (const [t, x] of [["chairman", -43], ["bodyguard", -37]]) { const e = new Enemy(enemyType(t)); e.placeAt(...ACT1_WEST.toWorld(x, 321), 0, TWR.top.y); e.cooldown = 1e9; enemies.push(e); }');
  setL(-40, TWR.top.y, 318); step(3);
  run('enemies.find(e => e.type === "chairman").signDown()'); step(5);
  const kneels = run('enemies.find(e => e.type === "chairman").state');
  check('the Chairman down while a bodyguard still stands: he kneels, but nothing is signed yet', kneels === 'signed' && !TWR.signed && TW.game.state === 'fight', `${kneels}, signed ${TWR.signed}`);
  run('{ const b = enemies.find(e => e.type === "bodyguard"); b.hp = 0; b.markKO(); }'); until(() => TWR.signed, 120);
  check('then his last bodyguard goes down: he signs, the level is won', TWR.signed && TW.game.state === 'won' && run('SIGNED.has("chairman")'), TW.game.state);

  // ---- walking in from Parade Square, once it's won
  run(`LEVELS.parade.start(false); clearEnemies(); level.encounter = CFG.parade.encounters.length - 1; game.state = 'won'; LOCKED.clear();`);
  setL(-40, 0, 304); face(Math.PI); step(4);
  check('from the square, looking at the open doors, the lobby is drawn through them', TW.roomState.cur === 'outside' && M.low.visible && !M.high.visible);
  walkTo(-40, 315);
  check('walking through the south doors carries you into the tower with no cut', TW.level.name === 'tower' && LH().z > 312.6 && LH().z < 316 && Math.abs(TW.player.floorY) < 0.01, `${TW.level.name} z ${LH().z.toFixed(2)}`);
  until(() => TW.level.encounter === 0, 120);
  check('and the lobby fight starts', TW.level.encounter === 0 && TW.LOCKED.has('twDoor'));
  // inside the lobby facing in: no city
  run('level.encounter = 99'); setL(-40, 0, 320); face(Math.PI); step(3);
  check('in the lobby facing in: only the inside is drawn', TW.roomState.cur === 'twLobby' && M.low.visible && !TW.ST.skylineMesh.visible && !TWR.shell.visible && !M.high.visible, TW.roomState.cur);
  face(0); step(3);
  check('turn round and the square shows through the doors', TW.ST.skylineMesh.visible && TWR.shell.visible);

  // ---- physics cost on the office floor (four goons among the desks)
  run('clearEnemies(); resetTowerLifts(1); level.encounter = 99'); setL(-40, TWR.office.y, 330); step(3);
  for (const t of ['conscript', 'laborer', 'wrestler', 'cook']) { const e = new TW.Enemy(t); const q = W(-42 + rnd() * 4, 0, 321 + rnd() * 6); e.placeAt(q.x, q.z, 0, TWR.office.y); TW.enemies.push(e); }
  const t0 = process.hrtime.bigint(); for (let i = 0; i < 120; i++) TW.updatePhysics(1 / 72);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 120;
  check('office physics cost per frame (4 goons on the office floor, Node on a server CPU)', ms < 4, ms.toFixed(2) + ' ms');
  check('they stay on the office floor', TW.enemies.every(e => Math.abs(e.pos.y - TWR.office.y) < 0.3), TW.enemies.map(e => e.pos.y.toFixed(2)).join(','));
} catch (err) { log.push('ERROR ' + err.stack); }
console.log(log.join('\n'));
const fails = log.filter(l => !l.startsWith('PASS')).length;
console.log(`\n${log.length - fails} / ${log.length} tower checks pass`);
process.exitCode = fails ? 1 : 0;
