'use strict';
// ============================== physics: position-based particles ==========
// Every goon is an active ragdoll: 15 joint particles joined by sticks. Standing goons are pulled
// toward their animation every step, so hits shove them for real. Knockdowns, launches and throws
// drop the pull to zero and let them go limp. Props are small rigid particle bodies.
const bodies = [];
const PHYS = { acc: 0 };
const _pa = new V3(), _pb = new V3(), _pc = new V3(), _pd = new V3();
const WORLD_BOXES = [   // solid furniture [x0,y0,z0,x1,y1,z1]
  [BAR.x0, 0, BAR.z0, BAR.x1, BAR.top, BAR.z1],
  [POOL.x - POOL.hx, 0, POOL.z - POOL.hz, POOL.x + POOL.hx, POOL.top, POOL.z + POOL.hz],
  [-4.95, 0, 1.0, -4.35, 1.62, 1.95],
  ...TABLES.flatMap(t => [[t.x - 0.45, 0.72, t.z - 0.45, t.x + 0.45, 0.79, t.z + 0.45], [t.x - 0.05, 0, t.z - 0.05, t.x + 0.05, 0.74, t.z + 0.05]]),
];
class Particle {
  constructor(name, pos, r, w) { this.name = name; this.x = pos.clone(); this.p = pos.clone(); this.v = new V3(); this.r = r; this.w = w; this.pin = null; this.ground = false; this.fy = 0; this.wk = null; }
}
class Body {
  constructor(kind, owner) {
    this.kind = kind; this.owner = owner; this.ps = []; this.cs = []; this.by = {};
    this.sim = true; this.sleep = false; this.gravity = true; this.pull = 0; this.targets = null; this.drag = 0.4;
    this.restT = 0; this.impact = 0; this.impactAt = new V3(); this.collidesPlayer = false; this.center = new V3(); this.radius = 1;
    bodies.push(this);
  }
  add(name, pos, r, w) { const p = new Particle(name, pos, r, w); this.ps.push(p); this.by[name] = p; return p; }
  stick(a, b, k = 1, rest) { const A = this.by[a], B = this.by[b]; this.cs.push({ a: A, b: B, rest: rest === undefined ? A.x.distanceTo(B.x) : rest, k, min: false }); }
  minDist(a, b, d) { this.cs.push({ a: this.by[a], b: this.by[b], rest: d, k: 1, min: true }); }
  wake() { this.sleep = false; this.restT = 0; }
  remove() { const i = bodies.indexOf(this); if (i >= 0) bodies.splice(i, 1); }
  bounds() {
    const c = this.center.set(0, 0, 0); for (const p of this.ps) c.add(p.x); c.divideScalar(this.ps.length);
    let r = 0; for (const p of this.ps) r = Math.max(r, p.x.distanceTo(c) + p.r); this.radius = r;
  }
  impulse(point, dv, radius = 0.45) {   // shove the particles near a point
    for (const p of this.ps) { if (p.pin) continue; const d = p.x.distanceTo(point); if (d < radius) p.v.addScaledVector(dv, 1 - d / radius); }
    this.wake();
  }
  push(dv) { for (const p of this.ps) if (!p.pin) p.v.add(dv); this.wake(); }
}
function solveC(c) {
  const a = c.a, b = c.b, d = _pa.subVectors(b.p, a.p), L = d.length();
  if (L < 1e-6 || (c.min && L >= c.rest)) return;
  const wa = a.pin ? 0 : a.w, wb = b.pin ? 0 : b.w, ws = wa + wb; if (!ws) return;
  const k = (L - c.rest) / L * c.k / ws;
  a.p.addScaledVector(d, k * wa); b.p.addScaledVector(d, -k * wb);
}
function collideWorld(p, b) {
  const r = p.r, fy = p.fy; let impact = 0;   // the floor under it, looked up once per step (0 unless the level has raised floors here)
  if (p.p.y < fy + r) { impact = Math.max(impact, -p.v.y); p.p.y = fy + r; p.ground = true; }
  const ox = p.p.x, oz = p.p.z;
  if (keepInWalk(p.p, r, true, p)) {   // hit a wall
    if (p.p.x !== ox) impact = Math.max(impact, Math.abs(p.v.x));
    if (p.p.z !== oz) impact = Math.max(impact, Math.abs(p.v.z));
  }
  for (const B of boxesNear(p.p.z)) {
    const qx = clamp(p.p.x, B[0], B[3]), qy = clamp(p.p.y, B[1], B[4]), qz = clamp(p.p.z, B[2], B[5]);
    const dx = p.p.x - qx, dy = p.p.y - qy, dz = p.p.z - qz, d2 = dx * dx + dy * dy + dz * dz;
    if (d2 >= r * r) continue;
    let nx, ny, nz;
    if (d2 > 1e-10) { const d = Math.sqrt(d2); nx = dx / d; ny = dy / d; nz = dz / d; p.p.set(qx + nx * r, qy + ny * r, qz + nz * r); }
    else {   // centre inside the box: leave by the nearest face
      const pen = [[p.p.x - B[0], -1, 0, 0], [B[3] - p.p.x, 1, 0, 0], [p.p.y - B[1], 0, -1, 0], [B[4] - p.p.y, 0, 1, 0], [p.p.z - B[2], 0, 0, -1], [B[5] - p.p.z, 0, 0, 1]];
      pen.sort((u, v) => u[0] - v[0]); [, nx, ny, nz] = pen[0];
      p.p.x += nx * (pen[0][0] + r); p.p.y += ny * (pen[0][0] + r); p.p.z += nz * (pen[0][0] + r);
    }
    impact = Math.max(impact, -(p.v.x * nx + p.v.y * ny + p.v.z * nz));
    if (ny > 0.6) p.ground = true;
  }
  if (impact > b.impact) { b.impact = impact; b.impactAt.copy(p.p); }
}
function collidePlayer(p) {   // the player's body is a capsule nobody walks into
  const hx = player.head.x, hz = player.head.z, top = player.head.y, R = CFG.physics.playerRadius + p.r;
  const y = clamp(p.p.y, player.floorY + 0.2, top);
  const dx = p.p.x - hx, dz = p.p.z - hz, dy = p.p.y - y, d2 = dx * dx + dy * dy + dz * dz;
  if (d2 >= R * R) return;
  const d = Math.sqrt(d2) || 1e-4;
  p.p.x = hx + dx / d * R; p.p.z = hz + dz / d * R; p.p.y = y + dy / d * R;
}
function collideBodies() {
  for (const b of bodies) if (b.sim) b.bounds();
  for (let i = 0; i < bodies.length; i++) {
    const A = bodies[i]; if (!A.sim) continue;
    for (let j = i + 1; j < bodies.length; j++) {
      const B = bodies[j]; if (!B.sim || (A.sleep && B.sleep) || A.ignore === B || B.ignore === A) continue;
      if (A.center.distanceTo(B.center) > A.radius + B.radius) continue;
      let best = 0;
      for (const pa of A.ps) for (const pb of B.ps) {
        const d = _pb.subVectors(pb.p, pa.p), L = d.length(), R = pa.r + pb.r;
        if (L >= R || L < 1e-6) continue;
        const wa = pa.pin ? 0 : pa.w * (A.sleep ? 0.2 : 1), wb = pb.pin ? 0 : pb.w * (B.sleep ? 0.2 : 1), ws = wa + wb; if (!ws) continue;
        d.divideScalar(L);
        const rel = -_pc.subVectors(pb.v, pa.v).dot(d);   // closing speed
        if (rel > best) { best = rel; _pd.copy(pa.p).add(pb.p).multiplyScalar(0.5); A._n = d.clone(); }
        const k = (R - L) / ws;
        pa.p.addScaledVector(d, -k * wa); pb.p.addScaledVector(d, k * wb);
      }
      if (best > 0) {
        if (A.sleep && best > 0.2) A.wake(); if (B.sleep && best > 0.2) B.wake();
        contactEvent(A, B, best, _pd.clone());
      }
    }
  }
  // player fists push props around (knock a bottle off the bar)
  for (const h of handList) {
    if (h.held || h.speed < 0.6) continue;
    for (const b of bodies) {
      if (b.kind !== 'prop' || b.owner.heldBy || b.owner.heldByEnemy) continue;
      for (const p of b.ps) {
        const d = _pb.subVectors(p.p, h.fist), L = d.length(), R = p.r + CFG.punch.fistRadius;
        if (L < R && L > 1e-6) {
          p.p.addScaledVector(d, (R - L) / L); p.v.copy(h.vel); b.wake();
          const o = b.owner;   // punch an incoming potato away: it's yours now, and it can hit them
          if (o.hostile && h.speed > 2) { o.hostile = false; o.thrown = true; o.releasedAt = NOW; o.hitSet.clear(); deflected(o, h); }
        }
      }
    }
  }
}
function physicsStep(dt) {
  const g = CFG.physics.gravity;
  for (const b of bodies) {
    if (!b.sim || b.sleep) continue;
    b.impact = 0;
    for (const p of b.ps) {
      if (p.pin) { p.p.copy(p.pin); continue; }
      if (b.gravity) p.v.y += g * dt;
      p.v.multiplyScalar(Math.max(0, 1 - b.drag * dt));
      p.p.copy(p.x).addScaledVector(p.v, dt); p.ground = false;
      p.fy = floorAt(p.p.x, p.p.z, p.p.y - p.r);   // a low particle can't be pushed onto a higher floor mid-step (its edge is a wall), so this holds for the step
    }
  }
  for (let it = 0; it < CFG.physics.iterations; it++) {
    for (const b of bodies) { if (b.sim && !b.sleep) for (const c of b.cs) solveC(c); }
    if (it === 0) collideBodies();
    for (const b of bodies) {
      if (!b.sim || b.sleep) continue;
      for (const p of b.ps) { if (p.pin) continue; collideWorld(p, b); if (b.collidesPlayer) collidePlayer(p); }
    }
  }
  for (const b of bodies) {   // active ragdoll: pull toward the animation
    if (!b.sim || b.sleep || !b.pull || !b.targets) continue;
    for (const p of b.ps) {
      if (p.pin) continue; const t = b.targets[p.name]; if (!t) continue;
      p.p.lerp(t, b.pull); if (b.collidesPlayer) collidePlayer(p);
      if (p.p.y < p.fy + p.r) p.p.y = p.fy + p.r;
    }
  }
  const vmax = CFG.physics.maxSpeed;
  for (const b of bodies) {
    if (!b.sim || b.sleep) continue;
    let maxV = 0;
    for (const p of b.ps) {
      p.v.subVectors(p.p, p.x).divideScalar(dt); p.x.copy(p.p);
      if (b.pull) p.v.multiplyScalar(1 - b.pull * 0.6);
      if (p.ground) { const f = Math.max(0, 1 - CFG.physics.groundFriction * dt); p.v.x *= f; p.v.z *= f; }
      const s = p.v.length(); if (s > vmax) { p.v.multiplyScalar(vmax / s); } if (s > maxV) maxV = s;
    }
    b.maxV = maxV;
    if (b.kind === 'prop' && !b.ps.some(p => p.pin)) {
      if (maxV < 0.06) { b.restT += dt; if (b.restT > 0.5) { b.sleep = true; for (const p of b.ps) p.v.set(0, 0, 0); } } else b.restT = 0;
    }
  }
}
function updatePhysics(dt) {
  const step = 1 / CFG.physics.hz;
  PHYS.acc = Math.min(PHYS.acc + dt, step * 4);
  while (PHYS.acc >= step) { physicsStep(step); PHYS.acc -= step; afterPhysicsStep(); }
}
// what happens when two bodies meet
function contactEvent(A, B, speed, at) {
  for (const [X, Y] of [[A, B], [B, A]]) {
    const ex = X.owner, ey = Y.owner;
    // a flying goon bowls over a standing one
    if (X.kind === 'enemy' && Y.kind === 'enemy' && ex.state === 'ragdoll' && ex.flying && ey.hittable() && ey.state !== 'held' && speed > CFG.physics.dominoSpeed && !ex.bowled.has(ey)) {
      ex.bowled.add(ey);
      ey.hp -= 10; ey.hitstop(); ey.setFace('hurt', 0.6); AU.thud('heavy');
      fx(['fx_heavy', 'fx_dust'], at, { frameTime: 0.06 });
      ey.knockdown(_pa.copy(ex.body.by.pelvis.v), 'knockdown', ey.hp <= 0, at);
    }
    // thrown props hit goons
    if (X.kind === 'prop' && Y.kind === 'enemy' && ex.thrown && speed > CFG.weapons.thrownHitSpeed && ey.hittable() && !ex.hitSet.has(ey)) {
      ex.hitSet.add(ey);
      const z = ey.nearestZone(at);
      playerHit(ey, z.name, speed, 1, null, at, ex, X.ps[0].v.clone());
    }
    // bottles shatter on hard knocks
    if (X.kind === 'prop' && ex.type === 'bottle' && ex.alive && !ex.heldBy && speed > CFG.physics.bottleBreakSpeed) ex.break(at);
    if (X.kind === 'prop' && ex.cfg.shatters && ex.alive && !ex.heldBy && !ex.heldByEnemy && speed > ex.cfg.shatters) ex.break(at);   // plates: anything harder than a nudge
  }
}
function afterPhysicsStep() {
  for (const e of enemies) e.afterStep();
  for (const p of props) if (p.alive && !p.heldBy && !p.heldByEnemy && p.body.impact > (p.cfg.shatters || (p.type === 'bottle' ? CFG.physics.bottleBreakSpeed : 1e9))) p.break();
}

// frames for drawing rigid parts from particles
const _bx = new V3(), _by = new V3(), _bz = new V3(), _bm = new THREE.Matrix4(), _bq = new Q(), _bs = new V3();
function frameQ(Y, refX, refZ, out) {
  _bx.copy(refX).addScaledVector(Y, -refX.dot(Y));
  if (_bx.lengthSq() < 0.05) { _bz.copy(refZ).addScaledVector(Y, -refZ.dot(Y)).normalize(); _bx.crossVectors(Y, _bz); }
  _bx.normalize(); _bz.crossVectors(_bx, Y);
  _bm.makeBasis(_bx, Y, _bz);
  return out.setFromRotationMatrix(_bm);
}
function setPart(obj, origin, q, s) { _bs.set(s, s, s); obj.matrix.compose(origin, q, _bs); obj.matrixWorldNeedsUpdate = true; }
function setM(m, origin, q, s) { _bs.set(s, s, s); m.compose(origin, q, _bs); }
