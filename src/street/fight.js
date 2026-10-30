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
function startEncounter(i) {
  const E = CFG.street.encounters[i];
  level.encounter = i; level.arena = E.arena;
  game.state = 'intro'; game.timer = 0; game.queue = E.spawn.slice(); game.spawnT = 0.3; game.bosses = [];
  showSign(E.sign || 'fight', 1.4); AU.bell();
}
function updateStreet(dt) {
  const S = CFG.street, enc = S.encounters, z = player.head.z;
  if (game.state === 'walk') {
    const next = level.encounter + 1;
    if (next < enc.length && z > enc[next].trigger) startEncounter(next);
    else if (next >= enc.length && z > S.finishZ) {
      game.state = 'won'; game.timer = 0; showSign('checkpoint', 1e9); AU.bell();
    }
    return;
  }
  if (game.state === 'intro') { if (game.timer > 0.9) { game.state = 'fight'; game.timer = 0; } return; }
  if (game.state === 'fight') {
    game.spawnT -= dt;
    if (game.queue.length && game.spawnT <= 0) {
      const [type, x, zz] = game.queue.shift(), e = new Enemy(type);
      e.placeAt(x, zz, Math.atan2(player.head.x - x, player.head.z - zz));
      const d = _v1.set(player.head.x - x, 0, player.head.z - zz); const L = d.length();
      e.target.set(x, 0, zz).addScaledVector(d.divideScalar(L || 1), Math.min(2.5, L * 0.5));
      enemies.push(e); game.spawnT = S.spawnGap;
    }
    if (!game.queue.length && enemies.every(e => !e.alive)) { game.state = 'cleared'; game.timer = 0; showSign('ko', 1.6); }
    return;
  }
  if (game.state === 'cleared' && game.timer > S.clearedPause) {
    level.arena = null; game.state = 'walk'; game.timer = 0;
    player.hp = Math.min(CFG.player.health, player.hp + S.healBetween);
    showSign(level.encounter + 1 < enc.length ? 'go' : 'goCheck', 2.0);
    return;
  }
  if (game.state === 'lost' && game.timer > 3.5) {   // back to the start of this stretch, full health
    const E = enc[level.encounter];
    clearEnemies(); player.hp = CFG.player.health;
    placePlayer(E.respawn[0], E.respawn[1], Math.PI);
    startEncounter(level.encounter);
  }
  if (game.state === 'won' && boomPivot) boomPivot.rotation.z = Math.max(-1.35, boomPivot.rotation.z - dt * 0.9);
}
// encounter walls: only the player is held in; goons walk in from outside them
function keepPlayerIn(p, r) {
  pushOutXZ(p, r);
  if (level.name === 'street' && level.arena) p.z = clamp(p.z, level.arena[0] + r, level.arena[1] - r);
}
// lights and fog follow you: the bar's six inside, the nearest six street lamps outside
const _lampD = [];
function updateArea(dt) {
  const hz = player.head.z, out = clamp((hz - (STREET.fz - 1.2)) / 3.0, 0, 1);
  const R = CFG.render, F = CFG.street.fog;
  SU.uFogNear.value = R.fogNear + (F.near - R.fogNear) * out; SU.uFogFar.value = R.fogFar + (F.far - R.fogFar) * out;
  if (hz < STREET.fz - 0.4) applyLights(BAR_LIGHT.lights, BAR_LIGHT.ambient);
  else {
    _lampD.length = 0;
    for (const L of ST.lamps) _lampD.push([(L[0][0] - player.head.x) ** 2 + (L[0][2] - hz) ** 2, L]);
    _lampD.sort((a, b) => a[0] - b[0]);
    applyLights(_lampD.slice(0, MAXL).map(d => d[1]), CFG.street.light.ambient);
  }
  if (ST.skyMesh) { camera.getWorldPosition(_v1); ST.skyMesh.position.set(_v1.x, 0, _v1.z); ST.skyMesh.updateMatrix(); }
  updateDoor(dt);
  // portals: the bar and the street only draw each other through the open door, when it's in view
  const inside = hz < STREET.fz - 0.05, see = DOOR.open > 0.02 && doorInView();
  ST.portal = { inside, see };
  if (ST.barGroup) for (const o of ST.barGroup) o.visible = !inside ? see : true;
  if (ST.streetGroup) for (const o of ST.streetGroup) if (o) o.visible = inside ? see : true;
  for (const p of props) if (p.obj) { const pin = p.body.ps[0].x.z < STREET.fz; p.shown = pin === inside || see; if (!p.batched) p.obj.visible = p.shown; }
  if (ST.beaconMesh) { ST.beaconT = (ST.beaconT || 0) + dt; ST.beaconMesh.visible = (!inside || see) && (ST.beaconT % CFG.street.beaconBlink) < CFG.street.beaconBlink * 0.5; }
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
const SIGN_TEXT = { street: ['TRIPOINT SQUARE', '#c9a04a'], go: ['GO!', '#33e0d0'], goCheck: ['TO THE CHECKPOINT', '#33e0d0'],
  checkpoint: ['CHECKPOINT', '#f2ede4'], doorOpen: ['THE DOOR IS OPEN', '#ff9a3c'], square: ['FIGHT!', '#f2c14e'], road: ['FIGHT!', '#f2c14e'], last: ['LAST STRETCH', '#ff4f9a'] };
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
