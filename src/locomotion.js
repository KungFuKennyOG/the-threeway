'use strict';
// ============================== locomotion ==================================
let snapReady = true;
function updateLocomotion(dt) { moveRig(dt); followFloor(dt); }
// raised floors: the rig rides the floor under your head, eased (no sudden jumps in VR); a teleport snaps.
// Anything that moves the rig itself (a respawn) can set rig.position.y to pick a floor in a stack: the floor at or
// just below that height is the one you land on.
const _fl = { x: 0, z: 0 };
function followFloor(dt) {
  let x = rig.position.x, z = rig.position.z;
  if (xrMode) { camera.getWorldPosition(_v1); x = _v1.x; z = _v1.z; }   // in VR you stand anywhere in your play space
  const F = CFG.floors, y = rig.position.y;
  let ny;
  if (y !== player.floorY || Math.hypot(x - _fl.x, z - _fl.z) > F.snapDist) ny = floorAt(x, z, y);   // moved by someone else
  else {
    const target = floorAt(x, z, y), m = F.maxRise * dt;
    ny = y + clamp((target - y) * Math.min(1, dt * F.followRate), -m, m);
    if (Math.abs(target - ny) < 1e-4) ny = target;
  }
  rig.position.y = ny; player.floorY = ny; _fl.x = x; _fl.z = z;
}
function moveRig(dt) {
  if (xrMode) {
    const L = hands.left.source && hands.left.source.gamepad, R = hands.right.source && hands.right.source.gamepad;
    if (L && L.axes.length >= 4 && !player.clinchedBy && !perfPanel.open) {
      const x = L.axes[2], y = L.axes[3];
      if (Math.hypot(x, y) > CFG.move.deadzone) {
        camera.getWorldDirection(_v1); _v1.y = 0; _v1.normalize();
        _v2.crossVectors(_v1, UP);
        rig.position.addScaledVector(_v1, -y * CFG.move.speed * dt).addScaledVector(_v2, x * CFG.move.speed * dt);
      }
    }
    if (R && R.axes.length >= 4) {
      const x = R.axes[2];
      if (Math.abs(x) > 0.6 && snapReady) {
        snapReady = false;
        const ang = -Math.sign(x) * CFG.move.snapTurnDeg * DEG;
        camera.getWorldPosition(_v1);
        _v2.subVectors(rig.position, _v1).applyAxisAngle(UP, ang);
        rig.position.set(_v1.x + _v2.x, rig.position.y, _v1.z + _v2.z);
        rig.rotation.y += ang;
      }
      if (Math.abs(x) < 0.3) snapReady = true;
    }
    // restart after a win / loss
    if (R && (game.state === 'won') && R.buttons[4] && R.buttons[4].pressed) { if (LEVELS[level.name]) LEVELS[level.name].start(false); else if (level.name === 'street') startStreet(false); else if (level.name === 'depot') startDepot(false); else startGame(); }
    // keep the head inside the room and out of the bar
    camera.getWorldPosition(_v1);
    _v2.copy(_v1); _v2.y = player.floorY; keepPlayerIn(_v2, 0.25);   // walk rects test your feet, not your head
    rig.position.x += _v2.x - _v1.x; rig.position.z += _v2.z - _v1.z;
    return;
  }
  // desktop
  rig.rotation.y = desk.yaw;
  camera.rotation.set(desk.pitch, 0, 0, 'YXZ');
  const crouch = keys.has('KeyC') ? 1 : 0;
  player.crouch += (crouch - player.crouch) * Math.min(1, dt * 10);
  let hb = 0;
  if (player.headbuttT > 0) { player.headbuttT -= dt; hb = Math.sin((1 - player.headbuttT / 0.18) * Math.PI) * 0.28; }
  camera.position.set(0, CFG.player.standHeight - 0.45 * player.crouch, -hb);
  if (player.clinchedBy) return;
  let f = 0, s = 0;
  if (keys.has('KeyW')) f += 1; if (keys.has('KeyS')) f -= 1; if (keys.has('KeyD')) s += 1; if (keys.has('KeyA')) s -= 1;
  if (f || s) {
    const sp = CFG.move.speed * dt / Math.hypot(f, s);
    const sin = Math.sin(desk.yaw), cos = Math.cos(desk.yaw);
    rig.position.x += (-sin * f + cos * s) * sp;
    rig.position.z += (-cos * f - sin * s) * sp;
  }
  _v1.set(rig.position.x, player.floorY, rig.position.z); keepPlayerIn(_v1, 0.3);
  rig.position.x = _v1.x; rig.position.z = _v1.z;
}

// ============================== VR grip input ===============================
function updateGripInput() {
  if (!xrMode) return;
  for (const h of handList) {
    const gp = h.source && h.source.gamepad; if (!gp) continue;
    const pressed = !!(gp.buttons[1] && gp.buttons[1].pressed);   // grip
    if (pressed && !h.held) {   // a squeezed hand snatches anything thrown at it out of the air
      for (const p of props) {
        if (!p.hostile || !p.alive) continue;
        if (closestOnSeg(h.fist, p.prevPos, p.body.ps[0].x, _v2).distanceTo(h.fist) < CFG.projectiles.catchRadius) { catchProjectile(h, p); break; }
      }
    }
    if (pressed && !h.squeeze && !h.held) tryGrab(h);
    if (!pressed && h.squeeze && h.held) releaseHeld(h);
    h.squeeze = pressed;
  }
}
function tryGrab(h) {
  let best = null, bestD = 1e9;
  for (const p of props) {
    if (p.heldBy || p.heldByEnemy || !p.alive) continue;
    const d = p.grabPoint(_v1).distanceTo(h.fist);
    if (d < p.cfg.grabRadius && d < bestD) { best = { prop: p }; bestD = d; }
  }
  if (!best) for (const e of enemies) {
    if (!e.grabbable()) continue;
    for (const z of e.zones()) {
      if (z.name !== 'head' && z.name !== 'chest') continue;
      const d = z.pos.distanceTo(h.fist) - z.r;
      if (d < CFG.grab.reach && d < bestD) { best = { enemy: e }; bestD = d; }
    }
  }
  if (!best) return;
  if (best.prop) { pickUp(h, best.prop); buzz(h, 0.3, 30); } else grabEnemy(h, best.enemy);
}
