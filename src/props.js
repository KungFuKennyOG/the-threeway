'use strict';
// ============================== props =======================================
const props = [];
const _spinAxis = new V3();
const BAT_LIKE = new Set(['bat', 'pipe', 'flagpole', 'baton']);   // long things held by one end
const THROWN = new Set(['potato', 'pot', 'cymbal', 'drumstick']);   // what throwers lob (they pile up on the floor; see updateProjectiles)
class Prop {
  constructor(type, pos) {
    this.type = type; this.isProp = true; this.cfg = CFG.weapons[type]; this.alive = true;
    this.durability = this.cfg.durability; this.drunk = false; this.heldBy = null; this.heldByEnemy = null;
    this.batLike = BAT_LIKE.has(type);   // a long thing held by one end: same rig, pinning and hit point
    this.thrown = false; this.hostile = false; this.hitSet = new Set(); this.spin = 0; this.prevPos = new V3();
    { const fy = floorAt(pos.x, pos.z, pos.y); if (pos.y < fy) pos = pos.clone().setY(fy); }   // placed at y 0 over a raised floor: stand it on the floor
    const body = this.body = new Body('prop', this);
    let geo, mat;
    if (type === 'bottle') {
      const t = Math.floor(Math.random() * 3), acc = new GeoAcc();
      tbox(acc, null, 0, 0.28, 0.09, 0.09, 0.09, 0.09, { '*': [t * 8, 0, t * 8 + 8, 16] }, { sheetW: 24, sheetH: 16, faces: 'fblr' });
      geo = acc.geometry(); mat = makeMat('bottles', { side: THREE.DoubleSide });   // own material: it greys out when drunk
      body.add('base', pos.clone().add(new V3(0, 0.045, 0)), 0.045, 6);
      body.add('neck', pos.clone().add(new V3(0, 0.3, 0)), 0.035, 6);
      body.stick('base', 'neck');
    } else if (type === 'stool') {   // one mesh, one draw call: vinyl + chrome share the 'stool' atlas
      const acc = new GeoAcc(), V = { '*': [0, 0, 0.5, 1] }, Cr = { '*': [0.5, 0, 1, 1] };
      box('stool', [-0.2, 0.28, -0.2], [0.2, 0.36, 0.2], { acc, uvs: V });
      box('stool', [-0.03, -0.32, -0.03], [0.03, 0.28, 0.03], { acc, uvs: Cr, faces: 'fblr' });
      box('stool', [-0.17, -0.36, -0.17], [0.17, -0.33, 0.17], { acc, uvs: Cr });
      geo = acc.geometry(); mat = sharedMat('stool');
      const o = pos.clone().add(new V3(0, 0.36, 0));
      body.add('seat', o.clone().add(new V3(0, 0.32, 0)), 0.19, 3);
      body.add('base', o.clone().add(new V3(0, -0.19, 0)), 0.17, 3);
      body.add('rim', o.clone().add(new V3(0.2, 0.32, 0)), 0.04, 3);
      body.stick('seat', 'base'); body.stick('seat', 'rim'); body.stick('base', 'rim');
    } else if (this.batLike) {     // knob at the origin, barrel along +y
      const acc = new GeoAcc(), L = this.cfg.length;
      if (type === 'bat') {
        tbox(acc, null, 0, 0.26, 0.04, 0.04, 0.045, 0.045, { '*': [0, 22, 8, 32] }, { sheetW: 8, sheetH: 32 });
        tbox(acc, null, 0.26, L, 0.045, 0.045, 0.075, 0.075, { '*': [0, 0, 8, 22], t: [0, 0, 8, 2] }, { sheetW: 8, sheetH: 32 });
      } else if (type === 'pipe') {  // the pipe: taped grip, straight steel, a valve fitting on the end
        tbox(acc, null, 0, 0.24, 0.05, 0.05, 0.05, 0.05, { '*': [0, 22, 8, 32] }, { sheetW: 8, sheetH: 32 });
        tbox(acc, null, 0.24, L - 0.07, 0.045, 0.045, 0.045, 0.045, { '*': [0, 4, 8, 22] }, { sheetW: 8, sheetH: 32, faces: 'fblr' });
        tbox(acc, null, L - 0.07, L, 0.075, 0.075, 0.075, 0.075, { '*': [0, 0, 8, 4] }, { sheetW: 8, sheetH: 32 });
      } else if (type === 'flagpole') {   // varnished pole, brass butt cap, gilt finial, a small red flag at the tip
        const S = { sheetW: 16, sheetH: 32 };
        tbox(acc, null, 0, 0.06, 0.045, 0.045, 0.04, 0.04, { '*': [0, 28, 8, 32] }, S);
        tbox(acc, null, 0.06, L - 0.05, 0.04, 0.04, 0.032, 0.032, { '*': [0, 4, 8, 28] }, Object.assign({ faces: 'fblr' }, S));
        tbox(acc, null, L - 0.05, L + 0.07, 0.06, 0.06, 0.02, 0.02, { '*': [0, 0, 8, 4] }, S);
        tbox(acc, null, L - 0.4, L - 0.1, 0.34, 0.012, 0.34, 0.012, { f: [8, 0, 16, 16], b: [8, 0, 16, 16], '*': [8, 16, 10, 18] }, Object.assign({ x: 0.19, faces: 'fblr' }, S));
      } else {                       // the baton: black rubber, a gold ferrule, a wrist strap knob
        tbox(acc, null, 0, 0.14, 0.036, 0.036, 0.034, 0.034, { '*': [0, 22, 8, 32] }, { sheetW: 8, sheetH: 32 });
        tbox(acc, null, 0.14, L, 0.034, 0.034, 0.03, 0.03, { '*': [0, 0, 8, 22] }, { sheetW: 8, sheetH: 32 });
      }
      geo = acc.geometry(); mat = sharedMat(type);
      body.add('knob', pos.clone(), 0.035, 3);
      body.add('tip', pos.clone().add(new V3(0, L, 0)), 0.05, 3);
      body.stick('knob', 'tip');
    } else if (type === 'crate' || type === 'bin') {   // three particles like the stool: top, bottom, an edge for the spin
      const acc = new GeoAcc(), c = this.cfg, R = ST.atlas.rect[type], uv = { '*': [R[0], R[1], R[2], R[3]] }, hw = c.size / 2, H = c.height || c.size;
      if (type === 'crate') box('street', [-hw, -H / 2, -hw], [hw, H / 2, hw], { acc, uvs: uv });
      else {
        tbox(acc, null, -H / 2, H / 2 - 0.04, c.size * 0.82, c.size * 0.82, c.size, c.size, { '*': [0, 0, 16, 16] }, { sheetW: 16, sheetH: 16, faces: 'fblrd' });
        tbox(acc, null, H / 2 - 0.04, H / 2 + 0.02, c.size + 0.04, c.size + 0.04, c.size * 0.9, c.size * 0.9, { '*': [0, 0, 16, 3] }, { sheetW: 16, sheetH: 16 });
        const u = acc.u; for (let i = 0; i < u.length; i += 2) { u[i] = R[0] + u[i] * (R[2] - R[0]); u[i + 1] = R[1] + u[i + 1] * (R[3] - R[1]); }
      }
      geo = acc.geometry(); mat = sharedMat('street');
      const o = pos.clone().add(new V3(0, H / 2, 0)), r = Math.min(hw, H / 2);
      body.add('seat', o.clone().add(new V3(0, H / 2 - r * 0.6, 0)), r, 4);
      body.add('base', o.clone().add(new V3(0, -H / 2 + r * 0.6, 0)), r, 4);
      body.add('rim', o.clone().add(new V3(hw, H / 2 - r * 0.6, 0)), 0.05, 4);
      body.stick('seat', 'base'); body.stick('seat', 'rim'); body.stick('base', 'rim');
      this.half = H / 2 - r * 0.6;
    } else if (type === 'sign') {    // a cast-iron street sign on its post: grip at the bottom, plate at the top
      const acc = new GeoAcc(), L = this.cfg.length, I = ST.atlas.rect.iron, P = ST.atlas.rect.signPlate;
      box('street', [-0.025, 0, -0.025], [0.025, L, 0.025], { acc, uvs: { '*': [I[0], I[1], I[2], I[3]] }, faces: 'fblrt' });
      box('street', [-0.26, L - 0.3, -0.015], [0.26, L - 0.04, 0.015], { acc, uvs: { '*': [P[0], P[1], P[2], P[3]] } });
      geo = acc.geometry(); mat = sharedMat('street');
      body.add('knob', pos.clone().add(new V3(0, 0.05, 0)), 0.04, 3);
      body.add('tip', pos.clone().add(new V3(0, L - 0.15, 0)), 0.14, 3);
      body.stick('knob', 'tip');
    } else {                         // potato / pot / cymbal / drumstick: one particle that spins as it flies
      const acc = new GeoAcc();
      if (type === 'potato') { box('potato', [-0.05, -0.04, -0.065], [0.05, 0.04, 0.065], { acc, uvs: { '*': [0, 0, 1, 1] } }); body.add('c', pos.clone(), 0.055, 2); }
      else if (type === 'cymbal') {   // a brass disc (two squares at 45°: an octagon) with a dome in the middle
        const R = this.cfg.radius, a = R * 1.414 * 0.92;
        for (const rot of [0, Math.PI / 4]) {
          const v0 = acc.p.length;
          tbox(acc, null, -0.006, 0.006, a, a, a, a, { '*': [0, 0, 16, 16], f: [0, 14, 16, 16], b: [0, 14, 16, 16], l: [0, 14, 16, 16], r: [0, 14, 16, 16] }, { sheetW: 16, sheetH: 16 });
          const c = Math.cos(rot), sn = Math.sin(rot);
          for (const A of [acc.p, acc.n]) for (let i = v0; i < A.length; i += 3) { const x = A[i], z = A[i + 2]; A[i] = x * c - z * sn; A[i + 2] = x * sn + z * c; }
        }
        tbox(acc, null, 0.006, 0.03, 0.08, 0.08, 0.04, 0.04, { '*': [6, 6, 10, 10] }, { sheetW: 16, sheetH: 16, faces: 'fblrt' });
        body.add('c', pos.clone(), 0.055, 2);   // a small particle (like a potato's), so a squeezed hand catches it before a forearm bats it away
      } else if (type === 'drumstick') {
        const L = this.cfg.length;
        tbox(acc, null, -L / 2, L / 2 - 0.03, 0.022, 0.022, 0.016, 0.016, { '*': [0, 0, 4, 16] }, { sheetW: 4, sheetH: 16, faces: 'fblrd' });
        tbox(acc, null, L / 2 - 0.03, L / 2, 0.026, 0.026, 0.026, 0.026, { '*': [0, 0, 4, 2] }, { sheetW: 4, sheetH: 16 });
        body.add('c', pos.clone(), 0.05, 2);
      } else {
        box('pot', [-0.11, -0.08, -0.11], [0.11, 0.08, 0.11], { acc, uvs: { '*': [0, 0, 1, 1], t: [0, 0, 1, 0.25] } });
        box('pot', [0.11, 0.03, -0.02], [0.24, 0.05, 0.02], { acc, uvs: { '*': [0, 0.75, 1, 1] } });   // handle
        body.add('c', pos.clone(), 0.11, 2);
      }
      geo = acc.geometry(); mat = sharedMat(type);
      this.spinQ = new Q(); this.spinAxis = new V3();
      if (type === 'cymbal') this.spinAxis.set(rand(-0.12, 0.12), 1, rand(-0.12, 0.12)).normalize();   // flat, like a frisbee
      else if (type === 'drumstick') this.spinAxis.set(1, rand(-0.2, 0.2), rand(-0.3, 0.3)).normalize();   // end over end
      else this.spinAxis.copy(_spinAxis.set(rand(-1, 1), 1, rand(-1, 1)).normalize());
    }
    this.mats = [mat];
    this.obj = new THREE.Mesh(geo, mat); this.obj.matrixAutoUpdate = false;
    // stools and street props share one material each, so they're drawn together in one batch (updatePropBatches)
    this.batched = CFG.render.batchProps && (type === 'stool' || type === 'crate' || type === 'bin' || type === 'sign');
    this.shown = true; if (this.batched) this.obj.visible = false;
    body.sleep = true;
    scene.add(this.obj);
    props.push(this);
    this.render();
  }
  render() {
    const b = this.body.by;
    if (this.type === 'bottle') {
      _by.subVectors(b.neck.x, b.base.x).normalize();
      frameQ(_by, _pa.set(1, 0, 0), _pb.set(0, 0, 1), _bq);
      setPart(this.obj, _pc.copy(b.base.x).addScaledVector(_by, -0.045), _bq, 1);
    } else if (this.type === 'stool') {
      _by.subVectors(b.seat.x, b.base.x).normalize();
      frameQ(_by, _pa.subVectors(b.rim.x, b.seat.x), _pb.set(0, 0, 1), _bq);
      setPart(this.obj, _pc.copy(b.seat.x).addScaledVector(_by, -0.32), _bq, 1);
    } else if (this.batLike || this.type === 'sign') {
      _by.subVectors(b.tip.x, b.knob.x).normalize();
      frameQ(_by, _pa.set(1, 0, 0), _pb.set(0, 0, 1), _bq);
      setPart(this.obj, this.type === 'sign' ? _pc.copy(b.knob.x).addScaledVector(_by, -0.05) : b.knob.x, _bq, 1);
    } else if (this.type === 'crate' || this.type === 'bin') {
      _by.subVectors(b.seat.x, b.base.x).normalize();
      frameQ(_by, _pa.subVectors(b.rim.x, b.seat.x), _pb.set(0, 0, 1), _bq);
      setPart(this.obj, _pc.addVectors(b.seat.x, b.base.x).multiplyScalar(0.5), _bq, 1);
    } else {
      const c = b.c;
      if (!this.heldBy && !this.heldByEnemy && !this.body.sleep) this.spin += c.v.length() * (this.cfg.spinRate || 0.06);
      this.spinQ.setFromAxisAngle(this.spinAxis, this.spin);
      setPart(this.obj, c.x, this.spinQ, 1);
    }
  }
  get airborne() { return this.thrown || this.hostile; }
  grabPoint(out) {
    if (this.batLike) return out.lerpVectors(this.body.by.knob.x, this.body.by.tip.x, this.cfg.grip ? this.cfg.grip / this.cfg.length : 0.15);
    if (this.type === 'sign') return out.lerpVectors(this.body.by.knob.x, this.body.by.tip.x, 0.25);
    return out.copy(this.body.center.lengthSq() ? this.body.center : this.body.ps[0].x);
  }
  hitPoint(out) {
    if (this.type === 'bottle') return out.copy(this.body.by.base.x);
    if (this.type === 'stool') return out.copy(this.body.by.seat.x);
    if (this.batLike) return out.lerpVectors(this.body.by.knob.x, this.body.by.tip.x, 0.8);
    if (this.type === 'sign') return out.copy(this.body.by.tip.x);
    if (this.type === 'crate' || this.type === 'bin') return out.addVectors(this.body.by.seat.x, this.body.by.base.x).multiplyScalar(0.5);
    return out.copy(this.body.ps[0].x);
  }
  // held: particles ride the fist, pointing along the knuckles
  pinToHand(h) {
    const K = _pa.set(0, 1, 0).applyQuaternion(h.anchor.getWorldQuaternion(_bq)).normalize();
    const X = _pb.set(1, 0, 0).applyQuaternion(_bq);
    const b = this.body.by;
    if (this.type === 'bottle') { b.neck.pin.copy(h.fist); b.base.pin.copy(h.fist).addScaledVector(K, 0.26); }
    else if (this.type === 'stool') { b.base.pin.copy(h.fist).addScaledVector(K, 0.06); b.seat.pin.copy(h.fist).addScaledVector(K, 0.57); b.rim.pin.copy(b.seat.pin).addScaledVector(X, 0.2); }
    else if (this.batLike) { const g = this.cfg.grip || 0.06; b.knob.pin.copy(h.fist).addScaledVector(K, -g); b.tip.pin.copy(h.fist).addScaledVector(K, this.cfg.length - g); }
    else if (this.type === 'sign') { b.knob.pin.copy(h.fist).addScaledVector(K, -0.1); b.tip.pin.copy(h.fist).addScaledVector(K, this.cfg.length - 0.25); }
    else if (this.type === 'crate' || this.type === 'bin') {   // held by the near edge, sticking out past the knuckles
      b.base.pin.copy(h.fist).addScaledVector(K, 0.12); b.seat.pin.copy(b.base.pin).addScaledVector(K, this.half * 2); b.rim.pin.copy(b.seat.pin).addScaledVector(X, this.cfg.size / 2);
    }
    else b.c.pin.copy(h.fist).addScaledVector(K, 0.04);
  }
  pinAll() { for (const q of this.body.ps) q.pin = q.x.clone(); this.body.wake(); }
  unpinAll(v) { for (const q of this.body.ps) { q.pin = null; if (v) q.v.copy(v); } this.body.wake(); }
  damage(at) { this.durability--; if (this.durability <= 0) this.break(at); }
  break(at) {
    if (!this.alive) return;
    this.alive = false;
    const p = at ? at.clone() : this.body.ps[0].x.clone();
    if (this.type === 'bottle' || this.type === 'stool') {
      AU.glass();
      for (let i = 0; i < (this.type === 'bottle' ? 7 : 4); i++)
        fx(['fx_glass'], p.clone().add(new V3(rand(-0.15, 0.15), rand(-0.1, 0.15), rand(-0.15, 0.15))), { life: 0.5, rise: rand(-0.6, 0.4), scale: 0.012 });
    } else {   // potato splat, splintered bat / crate / sign
      if (this.type === 'potato') AU.splat(); else AU.wood();
      fx(['fx_dust'], p, { life: 0.4, scale: this.type === 'crate' ? 0.02 : 0.012 });
    }
    if (this.heldBy) { this.heldBy.held = null; this.heldBy.desk.mode = 'guard'; this.heldBy = null; }
    if (this.heldByEnemy) { const e = this.heldByEnemy; if (e.weapon === this) e.weapon = null; if (e.carry === this) e.carry = null; this.heldByEnemy = null; }
    scene.remove(this.obj); this.body.remove();
    const i = props.indexOf(this); if (i >= 0) props.splice(i, 1);
  }
}
function pickUp(h, p) {
  if (p.heldByEnemy) return;
  p.heldBy = h; h.held = p; p.thrown = false; p.hostile = false; p.body.ignore = null;
  p.pinAll();
  p.pinToHand(h);
}
// curve a throw's horizontal velocity toward a goon inside a cone (only the direction, never the speed)
function assistToward(from, v, deg, exclude) {
  const flat = _v1.set(v.x, 0, v.z), sp = flat.length(); if (sp < 0.5) return v;
  flat.divideScalar(sp);
  let best = null, bestAng = deg * DEG;
  for (const o of enemies) {
    if (o === exclude || !o.hittable()) continue;
    const to = _v2.set(o.pos.x - from.x, 0, o.pos.z - from.z), L = to.length(); if (L < 0.3 || L > 7) continue;
    const ang = Math.acos(clamp(to.divideScalar(L).dot(flat), -1, 1));
    if (ang < bestAng) { bestAng = ang; best = o; }
  }
  if (best) { const to = _v2.set(best.pos.x - from.x, 0, best.pos.z - from.z).normalize(); v.x = to.x * sp; v.z = to.z * sp; }
  return v;
}
function releaseHeld(h, isThrow) {
  const held = h.held; if (!held) return;
  h.held = null; h.desk.mode = 'guard';
  if (held.isProp) {
    held.heldBy = null;
    const v = h.vel.clone().multiplyScalar(isThrow ? 1.3 : 1);
    const throwing = h.speed > 2.5 || !!isThrow;
    if (throwing) assistToward(held.body.ps[0].x, v, CFG.weapons.throwAssistDeg, null);
    held.unpinAll(v);
    held.thrown = throwing; held.releasedAt = NOW;
    held.hitSet.clear();
  } else held.releasedBy(h, isThrow);
}
function catchProjectile(h, p) {
  pickUp(h, p);
  AU.catch(); buzz(h, 0.5, 50);
  label('catch', p.body.ps[0].x.clone().add(new V3(0, 0.2, 0)));
  game.catches = (game.catches || 0) + 1;
}
function deflected(p, h) { p.body.ignore = null; AU.thud('light'); buzz(h, 0.4, 30); label('parry', p.body.ps[0].x.clone().add(new V3(0, 0.2, 0))); }
function updateProps(dt) {
  for (const p of props.slice()) {
    if (p.heldBy) {
      p.pinToHand(p.heldBy);
      if (p.type === 'bottle' && !p.drunk) {   // bottle to the mouth: drink
        const h = p.heldBy;
        if (h.fist.distanceTo(mouthPos(_v1)) < CFG.weapons.mouthRadius) {
          h.drinkT += dt;
          if (h.drinkT >= CFG.weapons.drinkTime) {
            p.drunk = true; h.drinkT = 0;
            player.hp = Math.min(CFG.player.health, player.hp + CFG.weapons.drinkHeal);
            AU.gulp(); label('heal', mouthPos(new V3()).add(new V3(0, 0.25, 0)));
            p.mats.forEach(m => m.uniforms.uTint.value.set(0.55, 0.55, 0.6));
          }
        } else h.drinkT = 0;
      }
    } else if (p.thrown && !p.hostile && NOW - (p.releasedAt || 0) > 0.2 && p.body.maxV !== undefined && p.body.maxV < 1) p.thrown = false;
    p.prevPos.copy(p.body.ps[0].x);
  }
}
// incoming kitchenware vs the player: forearm block, head / body hit, or it lands
const _cs = new V3();
function updateProjectiles() {
  const PJ = CFG.projectiles;
  for (const p of props.slice()) {
    if (!p.hostile || !p.alive) continue;
    const q = p.body.ps[0], r = q.r;
    // forearms first: a raised guard knocks it away
    let blocked = null;
    for (const h of handList) {
      if (h.held && !h.held.isProp) continue;
      if (segSegDist(p.prevPos, q.x, h.forearmA, h.forearmB) < r + PJ.blockRadius) { blocked = h; break; }
    }
    if (blocked) {
      p.hostile = false; p.thrown = false;
      q.v.multiplyScalar(-0.3); q.v.y = Math.abs(q.v.y) + 1.0;
      AU.clank(); buzz(blocked, 0.6, 50); label('block', q.x.clone().add(new V3(0, 0.15, 0)));
      continue;
    }
    // swept against the head, then the body below it
    closestOnSeg(player.head, p.prevPos, q.x, _cs);
    const bodyTop = player.head.y - 0.22;
    const dxz = Math.hypot(_cs.x - player.head.x, _cs.z - player.head.z);
    const headHit = _cs.distanceTo(player.head) < r + PJ.headRadius;
    const bodyHit = !headHit && dxz < r + PJ.bodyRadius && _cs.y > player.floorY + 0.3 && _cs.y < bodyTop;
    if (headHit || bodyHit) {
      p.hostile = false; p.thrown = false;
      hurtPlayer(Math.round(p.cfg.playerDmg * (headHit ? 1 : 0.7)));
      fx(['fx_burst0', 'fx_burst1', 'fx_burst2'], _cs.clone(), { frameTime: 0.05 });
      if (p.type === 'potato') { p.break(_cs); continue; }
      AU.clank();
      q.x.copy(_cs); q.v.multiplyScalar(-0.25); q.v.y = 0.5;
      continue;
    }
    if (q.x.y < floorAt(q.x.x, q.x.z, q.x.y - r) + r + 0.03 || p.body.sleep || NOW - (p.releasedAt || 0) > 3) {
      p.hostile = false;
      if (p.type === 'potato' && q.v.length() > 5) p.break(q.x);
    }
  }
  // don't let the floor fill up with kitchenware
  const lying = props.filter(p => THROWN.has(p.type) && !p.heldBy && !p.heldByEnemy && !p.hostile && !p.thrown);
  for (let i = 0; i < lying.length - PJ.maxLying; i++) { const p = lying[i]; scene.remove(p.obj); p.body.remove(); p.alive = false; props.splice(props.indexOf(p), 1); }
}
function projectilesInAir() { let n = 0; for (const p of props) if (p.hostile || (p.heldByEnemy && p.heldByEnemy.carry === p)) n++; return n; }
