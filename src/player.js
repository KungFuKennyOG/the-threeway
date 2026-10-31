'use strict';
// ============================== player ======================================
const player = {
  hp: CFG.player.health, head: new V3(), headVel: new V3(), headSpeed: 0, headHist: [], hurtT: 0, clinchedBy: null,
  headbuttCd: 0, crouch: 0,
};
function makeHand(side) {
  const left = side === 'left';
  const visual = new THREE.Group();
  const mesh = buildHandMesh(left);
  visual.add(mesh);
  const anchor = new THREE.Group();           // fist frame: +y = knuckles, -y = forearm
  anchor.add(visual);
  return { side, left, anchor, visual, mesh, grip: null, source: null, fist: new V3(), vel: new V3(), speed: 0, travel: 0, hist: [],
    forearmA: new V3(), forearmB: new V3(), held: null, heldOffset: new V3(), squeeze: false, cd: new Map(), drinkT: 0,
    desk: { mode: 'guard', t: 0, from: new V3(), to: new V3(), dur: 0.1, speed: 3.8, pending: null } };
}
const hands = { left: makeHand('left'), right: makeHand('right') };
const handList = [hands.left, hands.right];

// health bar on the left wrist (VR)
const wristBar = new THREE.Group();
{
  const bg = new THREE.Mesh(planeGeo, sharedMat('black', { emissive: true, fog: false }));
  bg.scale.set(0.11, 0.022, 1);
  const fill = new THREE.Mesh(planeGeo, sharedMat('teal', { emissive: true, fog: false }));
  fill.scale.set(0.1, 0.012, 1); fill.position.z = 0.001;
  wristBar.add(bg, fill); wristBar.userData.fill = fill;
  wristBar.position.set(0, -0.2, 0.065); wristBar.rotation.x = Math.PI / 2; wristBar.rotation.z = Math.PI / 2;
}

// perf + tuning panel on the left wrist (VR: left X toggles it) / #perf overlay on desktop (P)
const perfPanel = { open: false, mesh: null, ctx: null, texture: null, row: 0, t: 0 };
{
  let cv = null;
  try { cv = document.createElement('canvas'); cv.width = 128; cv.height = 96; perfPanel.ctx = cv.getContext('2d'); } catch (e) { perfPanel.ctx = null; }
  if (perfPanel.ctx && THREE.CanvasTexture) {
    const t = perfPanel.texture = new THREE.CanvasTexture(cv);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = false;
    const m = makeMat('black', { emissive: true, fog: false, side: THREE.DoubleSide });
    m.uniforms.map.value = t;
    const mesh = perfPanel.mesh = new THREE.Mesh(planeGeo, m);
    mesh.scale.set(0.128, 0.096, 1);
    mesh.position.set(0.0, -0.345, 0.075);   // just past the health bar, down the forearm mesh.rotation.x = Math.PI / 2; mesh.rotation.z = Math.PI / 2;
    mesh.visible = false; mesh.renderOrder = 30;
  }
}

// red dithered damage vignette, head-locked (never moves the camera)
const vigMat = new THREE.ShaderMaterial({
  uniforms: { uAmt: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform float uAmt; varying vec2 vUv;
    const float BAYER[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
    void main(){ vec2 d = abs(vUv - 0.5) * 2.0; float e = max(d.x, d.y); float r = length(d) * 0.7071;
      float k = clamp((max(e, r) - (1.0 - 0.55 * uAmt)) / 0.35, 0.0, 1.0) * uAmt;
      int ix = int(mod(gl_FragCoord.x, 4.0)); int iy = int(mod(gl_FragCoord.y, 4.0));
      if (k * 16.0 <= BAYER[ix + iy * 4] + 0.5) discard;
      gl_FragColor = vec4(0.82, 0.06, 0.12, 1.0); }`,
  depthTest: false, depthWrite: false,
});
const vignette = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), vigMat);
vignette.position.z = -0.25; vignette.renderOrder = 999; vignette.frustumCulled = false;
camera.add(vignette);

function hurtPlayer(amount) {
  if (game.state !== 'fight' || amount <= 0) return;
  player.hp = Math.max(0, player.hp - amount);
  player.hurtT = 1;
  for (const h of handList) buzz(h, 0.8, 120);
  AU.hurt();
  if (player.hp <= 0) loseRound();
}

// ============================== input: XR ==================================
let xrMode = false;
for (let i = 0; i < 2; i++) {
  const grip = renderer.xr.getControllerGrip(i);
  rig.add(grip);
  grip.addEventListener('connected', (e) => {
    const src = e.data; if (!src || src.hand) return;
    const h = src.handedness === 'left' ? hands.left : hands.right;
    h.grip = grip; h.source = src;
    if (xrMode) attachHandVR(h);
  });
  grip.addEventListener('disconnected', () => {
    for (const h of handList) if (h.grip === grip) { h.source = null; }
  });
}
function attachHandVR(h) {
  if (!h.grip) return;
  h.grip.add(h.anchor);
  h.anchor.position.set(0, 0, 0);
  h.anchor.rotation.set(-Math.PI / 2 + CFG.hands.modelPitchDeg * DEG, 0, 0);
  if (h.left) { h.anchor.add(wristBar); if (perfPanel.mesh) h.anchor.add(perfPanel.mesh); }
}
function attachHandsDesktop() {
  for (const h of handList) { camera.add(h.anchor); }
  hands.left.anchor.remove(wristBar);
  if (perfPanel.mesh) hands.left.anchor.remove(perfPanel.mesh);
}
function buzz(h, intensity, ms) {
  const gp = h.source && h.source.gamepad;
  const a = gp && gp.hapticActuators && gp.hapticActuators[0];
  try { if (a && a.pulse) a.pulse(intensity, ms); } catch (e) { /* no haptics */ }
}

// ============================== input: desktop =============================
const keys = new Set();
const desk = { yaw: Math.PI, pitch: -0.05, locked: false };
addEventListener('keydown', (e) => {
  if (game.state === 'menu') return;
  keys.add(e.code);
  if (e.repeat) return;
  if (e.code === 'KeyE') deskGrab();
  if (e.code === 'KeyQ') deskThrow();
  if (e.code === 'KeyG') player.headbuttT = 0.18;
  if (e.code === 'KeyR' && (game.state === 'won' || game.state === 'lost')) { if (level.name === 'street') startStreet(false); else if (level.name === 'superblock') startSuperblock(false); else if (level.name === 'depot') startDepot(false); else startGame(); }
  if (e.code === 'KeyJ') deskPunch(hands.left, e.shiftKey);
  if (e.code === 'KeyK') deskPunch(hands.right, e.shiftKey);
  if (e.code === 'Space') e.preventDefault();
  if (e.code === 'KeyP') togglePerfPanel();
  if (perfPanel.open && (e.code === 'BracketLeft' || e.code === 'BracketRight')) tuneSelect(e.code === 'BracketLeft' ? -1 : 1);
  if (perfPanel.open && (e.code === 'Minus' || e.code === 'Equal')) tuneAdjust(e.code === 'Minus' ? -1 : 1);
});
addEventListener('keyup', (e) => keys.delete(e.code));
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('mousedown', (e) => {
  if (xrMode || game.state === 'menu') return;
  if (!desk.locked && canvas.requestPointerLock) { canvas.requestPointerLock(); }
  if (e.button === 0) deskPunch(hands.left, e.shiftKey);
  if (e.button === 2) deskPunch(hands.right, e.shiftKey);
});
document.addEventListener('pointerlockchange', () => { desk.locked = document.pointerLockElement === canvas; });
addEventListener('mousemove', (e) => {
  if (!desk.locked || xrMode) return;
  desk.yaw -= e.movementX * 0.0025;
  desk.pitch = clamp(desk.pitch - e.movementY * 0.0025, -1.2, 1.2);
});

// desktop hand targets in camera space
const DH = {
  guard: { left: [-0.2, -0.24, -0.44], right: [0.2, -0.25, -0.46], rx: -55 },
  block: { left: [-0.085, -0.03, -0.3], right: [0.085, -0.03, -0.3], rx: 0 },
  punch: { left: [-0.05, -0.07, -0.88], right: [0.05, -0.07, -0.88], rx: -88 },
  hold:  { left: [-0.2, -0.24, -0.44], right: [0.17, -0.2, -0.62], rx: -70 },
  mouth: { left: [-0.02, -0.07, -0.13], right: [0.02, -0.07, -0.13], rx: -10 },
};
function deskPunch(h, heavy) {
  if (xrMode || game.state === 'menu') return;
  const d = h.desk;
  if (d.mode === 'out' || d.mode === 'back') return;
  const speed = heavy ? 7.0 : (keys.has('KeyX') ? 2.2 : 3.8);
  d.mode = 'out'; d.t = 0; d.from.copy(h.anchor.position);
  d.to.set(...DH.punch[h.side]);
  if (h.held && h.held.isProp) d.to.z += 0.12;
  d.dur = Math.max(0.03, d.from.distanceTo(d.to) / speed);
}
function deskThrow() {
  const h = hands.right; if (!h.held || xrMode) return;
  const d = h.desk; d.mode = 'out'; d.t = 0; d.from.copy(h.anchor.position); d.to.set(0.1, -0.05, -0.95);
  d.dur = d.from.distanceTo(d.to) / 7.0; d.pending = 'release';
}
function deskGrab() {
  if (xrMode) return;
  const h = hands.right;
  if (h.held) { releaseHeld(h); return; }
  // what is the crosshair on?
  camera.getWorldPosition(_v1); camera.getWorldDirection(_v2);
  let best = null, bestD = 1e9;
  // incoming potato or pot: a generous catch window down the crosshair
  for (const p of props) {
    if (!p.hostile || p.heldBy || !p.alive) continue;
    const c = p.grabPoint(_v3), t = c.clone().sub(_v1).dot(_v2);
    if (t < 0 || t > CFG.projectiles.deskCatchRange) continue;
    const off = c.clone().sub(_v1).sub(_v2.clone().multiplyScalar(t)).length();
    if (off < 0.5 && t < bestD) { best = { prop: p }; bestD = t; }
  }
  if (best) { h.desk.mode = 'hold'; catchProjectile(h, best.prop); return; }
  for (const p of props) {
    if (p.heldBy || p.heldByEnemy || !p.alive) continue;
    const c = p.grabPoint(_v3);
    const t = c.clone().sub(_v1).dot(_v2); if (t < 0.15 || t > 1.9) continue;
    const off = c.clone().sub(_v1).sub(_v2.clone().multiplyScalar(t)).length();
    if (off < 0.35 && t < bestD) { best = { prop: p }; bestD = t; }
  }
  for (const e of enemies) {
    if (!e.grabbable()) continue;
    for (const z of e.zones()) {
      if (z.name !== 'head' && z.name !== 'chest') continue;
      const t = z.pos.clone().sub(_v1).dot(_v2); if (t < 0.2 || t > 1.5) continue;
      const off = z.pos.clone().sub(_v1).sub(_v2.clone().multiplyScalar(t)).length();
      if (off < 0.4 && t < bestD) { best = { enemy: e }; bestD = t; }
    }
  }
  if (!best) return;
  h.desk.mode = 'hold';
  if (best.prop) pickUp(h, best.prop); else grabEnemy(h, best.enemy);
}
function updateDesktopHands(dt) {
  const blocking = keys.has('Space');
  for (const h of handList) {
    const d = h.desk; d.t += dt;
    let tgt, rx;
    if (d.mode === 'out') {
      const k = Math.min(1, d.t / d.dur);
      h.anchor.position.lerpVectors(d.from, d.to, k);
      h.anchor.rotation.set(DH.punch.rx * DEG, 0, 0);
      if (k >= 1) {
        if (d.pending === 'release') { d.pending = null; releaseHeld(h, true); }
        d.mode = 'back'; d.t = 0; d.from.copy(h.anchor.position);
      }
      continue;
    }
    if (d.mode === 'back') { if (d.t > 0.22) d.mode = h.held ? 'hold' : 'guard'; }
    const drinking = keys.has('KeyF') && h.held && h.held.type === 'bottle';
    if (drinking) { tgt = DH.mouth[h.side]; rx = DH.mouth.rx; }
    else if (blocking && !h.held) { tgt = DH.block[h.side]; rx = DH.block.rx; }
    else if (h.held) { tgt = DH.hold[h.side]; rx = DH.hold.rx; }
    else { tgt = DH.guard[h.side]; rx = DH.guard.rx; }
    _v1.set(tgt[0], tgt[1], tgt[2]);
    h.anchor.position.lerp(_v1, Math.min(1, dt * (d.mode === 'back' ? 9 : 14)));
    h.anchor.rotation.x += (rx * DEG - h.anchor.rotation.x) * Math.min(1, dt * 14);
  }
}

// ============================== hand + head kinematics ======================
function trackHist(hist, p, now) {
  hist.push({ t: now, p: p.clone() });
  while (hist.length > 2 && now - hist[0].t > 0.3) hist.shift();
}
function velFromHist(hist, now, out) {
  if (hist.length < 2) return out.set(0, 0, 0);
  const last = hist[hist.length - 1];
  let ref = hist[0];
  for (let i = hist.length - 2; i >= 0; i--) { ref = hist[i]; if (now - hist[i].t >= CFG.punch.velWindow) break; }
  const dtt = last.t - ref.t;
  return dtt > 1e-4 ? out.subVectors(last.p, ref.p).divideScalar(dtt) : out.set(0, 0, 0);
}
function updateKinematics(now) {
  for (const h of handList) {
    h.anchor.localToWorld(h.fist.set(0, CFG.hands.fistForward, 0));
    if (xrMode) { trackHist(h.hist, h.fist, now); velFromHist(h.hist, now, h.vel); }
    else {   // desktop: measure in camera space, then rotate into the world
      trackHist(h.hist, h.anchor.position, now); velFromHist(h.hist, now, h.vel);
      h.vel.applyQuaternion(camera.getWorldQuaternion(_q1));
    }
    h.speed = h.vel.length();
    h.speeds = h.speeds || [];
    h.speeds.push([now, h.speed]);
    while (h.speeds.length > 1 && now - h.speeds[0][0] > CFG.punch.peakWindow) h.speeds.shift();
    h.peak = 0; for (const s of h.speeds) if (s[1] > h.peak) h.peak = s[1];
    let travel = 0;
    for (let i = h.hist.length - 1; i > 0 && now - h.hist[i - 1].t <= CFG.punch.travelWindow; i--) travel += h.hist[i].p.distanceTo(h.hist[i - 1].p);
    h.travel = travel;
    h.anchor.localToWorld(h.forearmA.set(0, -0.06, 0));
    h.anchor.localToWorld(h.forearmB.set(0, -0.36, 0));
  }
  camera.getWorldPosition(player.head);
  trackHist(player.headHist, player.head, now);
  velFromHist(player.headHist, now, player.headVel);
  player.headSpeed = player.headVel.length();
}
function mouthPos(out) {
  camera.getWorldDirection(_v3);
  return out.copy(player.head).addScaledVector(_v3, 0.05).add(_v2.set(0, -0.08, 0));
}
