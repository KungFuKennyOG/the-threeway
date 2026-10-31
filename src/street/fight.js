'use strict';
// ============================== the street: the fight =======================
// Walk out of the Threeway into Tripoint Square, fight down the old road, reach the militia checkpoint.
// Encounters lock you into a stretch of street (an arena) until it's clear; then the street opens up again.
const level = { name: 'bar', encounter: -1, arena: null };
let boomPivot = null;
function buildBoom() {   // the checkpoint's barrier arm: lifts when you reach it
  const acc = new GeoAcc(), R = ST.atlas.rect.boom, L = 5.9;
  box('street', [-L, -0.07, -0.06], [0, 0.07, 0.06], { acc, uvs: { '*': [R[0], R[1], R[2], R[3]] }, faces: 'fbtd' });
  boomPivot = new THREE.Group(); boomPivot.position.set(1.55, 0.99, STREET.chk.z);
  boomPivot.add(new THREE.Mesh(acc.geometry(), sharedMat('street'))); scene.add(boomPivot);
}
function stockStreetProps() {
  for (const [type, x, z] of CFG.street.props) new Prop(type, new V3(x, 0, z));
}
function placePlayer(x, z, yaw) {
  rig.position.set(x, 0, z);
  if (xrMode) rig.rotation.set(0, yaw, 0); else desk.yaw = yaw;
}
function startStreet(fromBar) {
  level.name = 'street'; level.encounter = -1; level.arena = null;
  DOOR.target = 1;
  if (!fromBar) {
    DOOR.open = 1; clearEnemies(); stockProps();
    player.hp = CFG.player.health; player.hurtT = 0; game.catches = 0; game.disarms = 0;
    placePlayer(CFG.street.start[0], CFG.street.start[1], Math.PI);
  }
  if (boomPivot) boomPivot.rotation.z = 0;
  stockStreetProps();
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  showSign('street', 2.6);
}
// The street and the depot share one flow: stretches with arena locks, spawns, clear, lose + restart, finish.
// Their configs (CFG.street, CFG.depot) use positions relative to the level's origin.
const stageCfg = () => level.name === 'depot' ? CFG.depot : level.name === 'superblock' ? CFG.superblock : level.name === 'podezd' ? CFG.podezd : CFG.street;
const stageOrigin = () => level.name === 'depot' ? [DEPOT.x, DEPOT.z] : [0, 0];
const STAGES = new Set(['street', 'superblock', 'podezd', 'depot']);   // levels run by updateStreet()
// an encounter starts when you walk past its `trigger` (z, along the level), or, with `at: [x0, x1, z0, z1, y0, y1]`, when you
// stand inside that box on a floor between y0 and y1 (levels that climb). `lock`: walk areas shut while it's on.
const triggered = (E, z) => E.at ? (player.head.x > E.at[0] && player.head.x < E.at[1] && player.head.z > E.at[2] && player.head.z < E.at[3] && player.floorY >= E.at[4] && player.floorY <= E.at[5]) : z > E.trigger;
function startEncounter(i) {
  const E = stageCfg().encounters[i];
  level.encounter = i; level.arena = E.arena || null;
  if (typeof LOCKED !== 'undefined') { LOCKED.clear(); for (const a of E.lock || []) LOCKED.add(a); }
  game.state = 'intro'; game.timer = 0; game.queue = E.spawn.slice(); game.spawnT = 0.3; game.bosses = [];
  showSign(E.sign || 'fight', E.boss ? 2.2 : 1.4); if (E.boss) AU.roar(); else AU.bell();
}
function startDepot(fromStreet) {
  level.name = 'depot'; level.encounter = -1; level.arena = null;
  clearEnemies();
  if (!fromStreet) { stockProps(); player.hp = CFG.player.health; player.hurtT = 0; game.catches = 0; game.disarms = 0; }
  else {   // the bar and street props stay behind (whatever's in your hands comes with you)
    const held = new Set(handList.map(h => h.held));
    for (const p of props.slice()) if (!held.has(p)) { scene.remove(p.obj); p.body.remove(); p.alive = false; props.splice(props.indexOf(p), 1); }
  }
  for (const [type, x, z] of CFG.depot.props) new Prop(type, new V3(DEPOT.x + x, type === 'bottle' ? 0.95 : 0, DEPOT.z + z));
  placePlayer(DEPOT.x + CFG.depot.start[0], DEPOT.z + CFG.depot.start[1], Math.PI);
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  showSign('depot', 2.6);
}
// Act 1, level 2: straight on from the checkpoint, no cut. From the street you just keep walking (the boom stays up);
// from the menu you start just past the boom.
function startSuperblock(fromStreet) {
  level.name = 'superblock'; level.encounter = -1; level.arena = null;
  clearEnemies();
  if (boomPivot) boomPivot.rotation.z = -1.35;
  const held = new Set(handList.map(h => h.held));
  if (!fromStreet) { DOOR.target = 1; DOOR.open = 1; player.hp = CFG.player.health; player.hurtT = 0; game.catches = 0; game.disarms = 0; }
  for (const p of props.slice()) if (!held.has(p)) { scene.remove(p.obj); p.body.remove(); p.alive = false; props.splice(props.indexOf(p), 1); }   // bar and street props stay behind
  for (const [type, x, z] of CFG.superblock.props) new Prop(type, new V3(x, type === 'bottle' ? 0.5 : 0, z));
  if (!fromStreet) placePlayer(CFG.superblock.start[0], CFG.superblock.start[1], Math.PI);
  game.state = 'walk'; game.timer = 0; game.queue = []; game.bosses = [];
  showSign('krasnovia', 2.6);
}
function updateStreet(dt) {   // the stage flow for whichever level you're in (street or depot)
  const S = stageCfg(), enc = S.encounters, [ox, oz] = stageOrigin(), z = player.head.z - oz;
  if (level.name === 'podezd') updatePodezd(dt);   // the lifts and the cradle
  if (game.state === 'walk') {
    const next = level.encounter + 1;
    if (next < enc.length && triggered(enc[next], z)) startEncounter(next);
    else if (level.name === 'street' && next >= enc.length && z > S.finishZ) {
      game.state = 'won'; game.timer = 0; showSign('checkpoint', 1e9); AU.bell();
    }
    else if (level.name === 'superblock' && next >= enc.length && z > S.finishZ && Math.abs(player.head.x - SB.door[0]) < 3) {
      game.state = 'won'; game.timer = 0; showSign('stairwell', 1e9); AU.bell();   // podezd 3 is the next level: walk in
    }
    return;
  }
  if (game.state === 'intro') { if (game.timer > 0.9) { game.state = 'fight'; game.timer = 0; } return; }
  if (game.state === 'fight') {
    game.spawnT -= dt;
    if (game.queue.length && game.spawnT <= 0) {
      const [type, lx, lz, ly] = game.queue.shift(), x = ox + lx, zz = oz + lz, e = new Enemy(type);
      e.placeAt(x, zz, Math.atan2(player.head.x - x, player.head.z - zz), ly);
      const d = _v1.set(player.head.x - x, 0, player.head.z - zz); const L = d.length();
      e.target.set(x, 0, zz).addScaledVector(d.divideScalar(L || 1), Math.min(2.5, L * 0.5));
      enemies.push(e); game.spawnT = S.spawnGap;
      if (e.cfg.boss) { game.bosses.push(e); addBossBar(e); }
    }
    for (const b of game.bosses) if (b.alive && !b.enraged && S.enrageAt && b.hp < b.maxHp * S.enrageAt) enrage(b);
    if (!game.queue.length && enemies.every(e => !e.alive)) {
      if (level.name === 'depot' && level.encounter === enc.length - 1) { game.state = 'won'; game.timer = 0; showSign('depotClear', 1e9); AU.bell(); return; }
      game.state = 'cleared'; game.timer = 0; showSign('ko', 1.6);
    }
    return;
  }
  if (game.state === 'cleared' && game.timer > S.clearedPause) {
    level.arena = null; game.state = 'walk'; game.timer = 0; if (typeof LOCKED !== 'undefined') LOCKED.clear();
    player.hp = Math.min(CFG.player.health, player.hp + S.healBetween);
    showSign(level.encounter + 1 < enc.length ? 'go' : 'goCheck', 2.0);
    return;
  }
  if (game.state === 'lost' && game.timer > 3.5) {   // back to the start of this stretch, full health
    const E = enc[level.encounter];
    clearEnemies(); player.hp = CFG.player.health;
    placePlayer(ox + E.respawn[0], oz + E.respawn[1], E.respawn[3] !== undefined ? E.respawn[3] : Math.PI);
    if (E.respawn[2] !== undefined) rig.position.y = E.respawn[2];   // a floor in a stack
    startEncounter(level.encounter);
  }
  if (game.state === 'won' && level.name === 'street') {   // the boom lifts; walk on through it into Krasnovia
    if (boomPivot) boomPivot.rotation.z = Math.max(-1.35, boomPivot.rotation.z - dt * 0.9);
    if (player.head.z > STREET.chk.z + CFG.street.exitPast) startSuperblock(true);
  }
  if (game.state === 'won' && level.name === 'superblock' && player.head.z > SB.door[1] + 0.5) startPodezd(true);   // through the street door
}
// a boss loses it: faster, shorter windups, red
function enrage(s) {
  s.enraged = true; s.benched = false; s.cooldown = 0;
  const c = s.cfg, E = CFG.boss;
  s.cfg = Object.assign({}, c, { speed: c.speed * E.enrageSpeed, windup: c.windup * E.enrageWindup, comboWindup: (c.comboWindup || c.windup) * E.enrageWindup });
  s.poise = s.cfg.poise; s.mat.uniforms.uTint.value.set(1.3, 0.78, 0.78);
  showSign('enrage', 2.0); AU.roar();
  label('enrage', s.body.by.head.x.clone().add(new V3(0, 0.4, 0)));
}
// encounter walls: only the player is held in; goons walk in from outside them
function keepPlayerIn(p, r) {
  pushOutXZ(p, r);
  if (STAGES.has(level.name) && level.arena) { const oz = stageOrigin()[1]; p.z = clamp(p.z, oz + level.arena[0] + r, oz + level.arena[1] - r); }
}
// lights and fog follow you: the bar's six inside, the nearest six street lamps outside
const _lampD = [];
function updateArea(dt) {
  const hz = player.head.z, out = Math.abs(player.head.x) > 8 ? 1 : clamp((hz - (STREET.fz - 1.2)) / 3.0, 0, 1);
  const R = CFG.render, F = CFG.street.fog;
  SU.uFogNear.value = R.fogNear + (F.near - R.fogNear) * out; SU.uFogFar.value = R.fogFar + (F.far - R.fogFar) * out;
  if (hz < STREET.fz - 0.4 && Math.abs(player.head.x) < 6 && hz > -6) applyLights(BAR_LIGHT.lights, BAR_LIGHT.ambient);
  else {
    _lampD.length = 0;
    const hy = player.head.y;
    for (const L of ST.lamps) { const dy = Math.max(0, Math.abs(L[0][1] - hy) - 4); _lampD.push([(L[0][0] - player.head.x) ** 2 + (L[0][2] - hz) ** 2 + dy * dy * 9, L]); }
    _lampD.sort((a, b) => a[0] - b[0]);
    applyLights(_lampD.slice(0, MAXL).map(d => d[1]), CFG.street.light.ambient);
  }
  if (ST.skyMesh) { camera.getWorldPosition(_v1); ST.skyMesh.position.set(_v1.x, 0, _v1.z); ST.skyMesh.updateMatrix(); }
  updateDoor(dt);
  // portals: rooms are only drawn through open doorways in view (src/rooms.js)
  if (ROOMS.size) updateRooms();
  if (ST.beaconMesh) { ST.beaconT = (ST.beaconT || 0) + dt; ST.beaconMesh.visible = ST.beaconMesh.visible && (ST.beaconT % CFG.street.beaconBlink) < CFG.street.beaconBlink * 0.5; }
}
// Prop batches: every visible stool / crate / bin / sign is written into one mesh per material each frame
// (a few hundred vertices on the CPU), so a room full of stools or a street full of crates is one draw call.
const propBatches = new Map(), _pbv = new V3();
function updatePropBatches() {
  const groups = new Map();
  for (const p of props) if (p.batched && p.alive && p.shown) { const m = p.obj.material; if (!groups.has(m)) groups.set(m, []); groups.get(m).push(p); }
  for (const [m, b] of propBatches) if (!groups.has(m)) { b.mesh.visible = false; }
  for (const [m, list] of groups) {
    let nv = 0; for (const p of list) nv += p.obj.geometry.attributes.position.count;
    let b = propBatches.get(m);
    if (!b || b.cap < nv) {
      const cap = Math.max(nv, 256) * 2, g = new THREE.BufferGeometry();
      for (const [n, k] of [['position', 3], ['normal', 3], ['uv', 2]]) { const a = new THREE.Float32BufferAttribute(new Float32Array(cap * k), k); a.usage = THREE.DynamicDrawUsage; g.setAttribute(n, a); }
      if (b) { scene.remove(b.mesh); }
      const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.matrixAutoUpdate = false; scene.add(mesh);
      b = { mesh, cap }; propBatches.set(m, b);
    }
    const G = b.mesh.geometry, P = G.attributes.position.array, N = G.attributes.normal.array, U = G.attributes.uv.array;
    let o = 0;
    for (const p of list) {
      const src = p.obj.geometry.attributes, sp = src.position.array, sn = src.normal.array, su = src.uv.array, e = p.obj.matrix.elements;
      for (let i = 0; i < src.position.count; i++, o++) {
        const x = sp[i * 3], y = sp[i * 3 + 1], z = sp[i * 3 + 2], nx = sn[i * 3], ny = sn[i * 3 + 1], nz = sn[i * 3 + 2];
        P[o * 3] = e[0] * x + e[4] * y + e[8] * z + e[12]; P[o * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; P[o * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
        N[o * 3] = e[0] * nx + e[4] * ny + e[8] * nz; N[o * 3 + 1] = e[1] * nx + e[5] * ny + e[9] * nz; N[o * 3 + 2] = e[2] * nx + e[6] * ny + e[10] * nz;
        U[o * 2] = su[i * 2]; U[o * 2 + 1] = su[i * 2 + 1];
      }
    }
    for (const n of ['position', 'normal', 'uv']) G.attributes[n].needsUpdate = true;
    if (G.setDrawRange) G.setDrawRange(0, nv);
    b.mesh.visible = nv > 0; b.count = nv;
  }
}
const _dv = new V3();
function doorInView() {
  camera.getWorldPosition(_v1); _dv.set(0, 1.2, STREET.fz).sub(_v1);
  const L = _dv.length(); if (L < 1.5) return true;
  camera.getWorldDirection(_v2);
  return _v2.dot(_dv) / L > Math.cos(CFG.street.portalDeg * DEG);
}
// big signs painted in code (same pixel font as the street), with a hard drop shadow
const SIGN_TEXT = { depot: ['TRAM DEPOT 7', '#ff9a3c'], yard: ['FIGHT!', '#f2c14e'], hall: ['FIGHT!', '#f2c14e'], volkov: ['THE BEAR', '#e8352b'],
  depotClear: ['DEPOT CLEARED', '#33e0d0'], street: ['TRIPOINT SQUARE', '#c9a04a'], go: ['GO!', '#33e0d0'], goCheck: ['TO THE CHECKPOINT', '#33e0d0'],
  checkpoint: ['CHECKPOINT', '#f2ede4'], krasnovia: ['KRASNOVIA', '#ff9a3c'], gate: ['FIGHT!', '#f2c14e'], courtyard: ['SUPERBLOCK 14', '#ff9a3c'],
  podezd: ['PODEZD 3', '#ff4f9a'], stairwell: ['INTO PODEZD 3', '#33e0d0'], lobby: ['FIGHT!', '#f2c14e'], seventh: ['FIGHT!', '#f2c14e'],
  kitchen: ['THE KITCHEN', '#ff9a3c'], roofFight: ['THE ROOF', '#ff4f9a'], liftBroke: ['THE LIFT IS DEAD', '#e8352b'], wingRoof: ['THE ROOF', '#33e0d0'],
  cradle: ['GOING DOWN', '#33e0d0'], railway: ['TO THE PALACE OF SPORT', '#33e0d0'], doorOpen: ['THE DOOR IS OPEN', '#ff9a3c'], square: ['FIGHT!', '#f2c14e'], road: ['FIGHT!', '#f2c14e'], last: ['LAST STRETCH', '#ff4f9a'] };
function paintSign(text, col) {
  const s = 3, w = textW(text) * s + 6, h = 7 * s + 6, p = new Pix(w, h);
  for (const [dx, dy, c] of [[3, 3, '#000000'], [0, 0, col]]) {
    let cx = 1 + dx;
    for (const ch of text) { const g = GLYPHS[ch]; if (g) for (let i = 0; i < 35; i++) if (g[i] === '1') p.rect(cx + (i % 5) * s, 1 + dy + Math.floor(i / 5) * s, s, s, c); cx += 6 * s; }
  }
  return p;
}
function signTex(name) {   // 'sign_street' etc: painted on first use
  const def = SIGN_TEXT[name.slice(5)]; if (!def) return null;
  const p = paintSign(def[0], def[1]);
  const t = new THREE.DataTexture(p.d, p.w, p.h, THREE.RGBAFormat);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = false; t.needsUpdate = true;
  imgSize[name] = [p.w, p.h];
  return t;
}
