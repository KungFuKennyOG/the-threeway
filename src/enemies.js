'use strict';
// ============================== enemies =====================================
const enemies = [];
// joint particles: [name, rig part, local offset, radius]
const JOINTS = [
  ['pelvis', 'hips', [0, 0, 0], 0.17], ['chest', 'torso', [0, 0.5, 0], 0.19], ['head', 'head', [0, 0.15, 0], 0.14],
  ['shL', 'uarml', [0, 0, 0], 0.09], ['elL', 'farml', [0, 0, 0], 0.07], ['wrL', 'handl', [0, -0.05, 0], 0.08],
  ['shR', 'uarmr', [0, 0, 0], 0.09], ['elR', 'farmr', [0, 0, 0], 0.07], ['wrR', 'handr', [0, -0.05, 0], 0.08],
  ['hipL', 'thighl', [0, 0, 0], 0.09], ['knL', 'shinl', [0, 0, 0], 0.08], ['anL', 'footl', [0, -0.05, 0.05], 0.07],
  ['hipR', 'thighr', [0, 0, 0], 0.09], ['knR', 'shinr', [0, 0, 0], 0.08], ['anR', 'footr', [0, -0.05, 0.05], 0.07],
];
const BONES = [
  ['pelvis', 'chest', 1], ['chest', 'head', 1], ['chest', 'shL', 1], ['chest', 'shR', 1], ['shL', 'shR', 1], ['pelvis', 'shL', 1], ['pelvis', 'shR', 1],
  ['shL', 'elL', 1], ['elL', 'wrL', 1], ['shR', 'elR', 1], ['elR', 'wrR', 1],
  ['pelvis', 'hipL', 1], ['pelvis', 'hipR', 1], ['hipL', 'hipR', 1], ['chest', 'hipL', 0.7], ['chest', 'hipR', 0.7], ['shL', 'hipR', 0.3], ['shR', 'hipL', 0.3],
  ['hipL', 'knL', 1], ['knL', 'anL', 1], ['hipR', 'knR', 1], ['knR', 'anR', 1],
  ['head', 'shL', 0.6], ['head', 'shR', 0.6],
];
const LIMITS = [['wrL', 'shL', 0.16], ['wrR', 'shR', 0.16], ['anL', 'hipL', 0.36], ['anR', 'hipR', 0.36], ['head', 'pelvis', 0.5],
  ['knL', 'knR', 0.12], ['anL', 'anR', 0.12], ['wrL', 'head', 0.14], ['wrR', 'head', 0.14], ['elL', 'hipL', 0.15], ['elR', 'hipR', 0.15]];
// how each visual part is drawn from the particles: [part, origin, axisFrom, axisTo, frame]
const PART_FRAMES = {
  uarml: ['shL', 'shL', 'elL', 't'], farml: ['elL', 'elL', 'wrL', 't'], handl: ['wrL', 'elL', 'wrL', 't'],
  uarmr: ['shR', 'shR', 'elR', 't'], farmr: ['elR', 'elR', 'wrR', 't'], handr: ['wrR', 'elR', 'wrR', 't'],
  thighl: ['hipL', 'hipL', 'knL', 'h'], shinl: ['knL', 'knL', 'anL', 'h'], footl: ['anL', 'knL', 'anL', 'h'],
  thighr: ['hipR', 'hipR', 'knR', 'h'], shinr: ['knR', 'knR', 'anR', 'h'], footr: ['anR', 'knR', 'anR', 'h'],
};
class Enemy {
  constructor(type) {
    this.type = type; this.cfg = CFG.enemies[type]; this.s = this.cfg.scale;
    this.hp = this.cfg.hp; this.poise = this.cfg.poise;
    this.mat = makeMat('sheet_' + type);
    // animation skeleton (no meshes) + ONE CPU-skinned mesh: every part's vertices are moved by its
    // particle frame each frame, so a goon is a single draw call (the face swaps by rewriting its UVs)
    this.rig = new THREE.Group(); this.rig.scale.setScalar(this.s);
    this.bones = {}; this.partM = {}; this.tris = 0;
    const def = BODIES[type]();
    this.neck = def.head[2][1] - 0.5;
    this.partNames = Object.keys(def);
    const Pp = [], Nn = [], Uu = [], Ii = [];
    TBOX_SHEET[0] = SHEET_W; TBOX_SHEET[1] = SHEET_H;   // goon sheets are 64 x 128
    this.partNames.forEach((name, pi) => {
      const [, parent, pivot, geos] = def[name];
      const bone = new THREE.Group(); bone.position.set(pivot[0], pivot[1], pivot[2]); bone.rotation.order = 'YXZ';
      (parent ? this.bones[parent] : this.rig).add(bone); this.bones[name] = bone;
      this.partM[name] = new THREE.Matrix4();
      const acc = new GeoAcc(), accFace = new GeoAcc();
      const tagged = [];   // geometry tagged in BODIES (the riot shield) keeps its vertex range so it can be removed later
      for (const g of geos) { const v0 = acc.p.length / 3; g(acc, accFace); if (g.tag) tagged.push([g.tag, v0, acc.p.length / 3]); }
      for (const [tag, v0, v1] of tagged) (this.tags || (this.tags = {}))[tag] = [Pp.length / 3 + v0, Pp.length / 3 + v1];
      for (const A of [acc, accFace]) {
        if (A === accFace && !A.empty) { this.faceStart = Pp.length / 3; this.faceCount = A.p.length / 3; }
        for (let k = 0; k < A.p.length; k++) { Pp.push(A.p[k]); Nn.push(A.n[k]); }
        for (let k = 0; k < A.u.length; k++) Uu.push(A.u[k]);
        for (let k = 0; k < A.p.length / 3; k++) Ii.push(pi);
        this.tris += A.tris;
      }
    });
    TBOX_SHEET[0] = 64; TBOX_SHEET[1] = 64;
    this.baseP = new Float32Array(Pp); this.baseN = new Float32Array(Nn); this.baseU = new Float32Array(Uu); this.vIdx = new Uint8Array(Ii);
    const geo = this.geo = new THREE.BufferGeometry();
    for (const [n, arr, k] of [['position', Pp, 3], ['normal', Nn, 3], ['uv', Uu, 2]]) {
      const a = new THREE.Float32BufferAttribute(new Float32Array(arr), k);
      if (a.setUsage && THREE.DynamicDrawUsage) a.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute(n, a);
    }
    this.Ms = this.partNames.map(n => this.partM[n].elements);
    this.mesh = new THREE.Mesh(geo, this.mat); this.mesh.frustumCulled = false; this.mesh.matrixAutoUpdate = false;
    scene.add(this.mesh);
    this.cur = {}; for (const n of Object.keys(this.bones)) this.cur[n] = [0, 0, 0];
    this.pos = new V3(0, 0, 4.6); this.yaw = Math.PI; this.target = new V3();
    // ragdoll: rest lengths come from the neutral pose
    this.targets = {}; for (const j of JOINTS) this.targets[j[0]] = new V3();
    this.syncRig(); this.computeTargets();
    const body = this.body = new Body('enemy', this);
    for (const [n, , , r] of JOINTS) body.add(n, this.targets[n], r * this.s, 1);
    for (const [a, b, k] of BONES) body.stick(a, b, k);
    for (const [a, b, d] of LIMITS) body.minDist(a, b, d * this.s);
    body.targets = this.targets; body.pull = CFG.physics.activePull; body.collidesPlayer = true; body.drag = 0.6;
    this.state = 'enter'; this.timer = 0; this.freeze = 0; this.flashT = 0; this.faceT = 0; this.face = 'normal';
    this.hasToken = false; this.cooldown = rand(0.3, 1.0); this.combo = 0; this.side = 'r';
    this.lockTarget = new V3(); this.windFx = null; this.starsFx = null; this.heldBy = null; this.armHits = 0;
    this.circleDir = Math.random() < 0.5 ? -1 : 1; this.walkPhase = Math.random() * 6;
    this.koT = 0; this.alive = true; this.flying = false; this.bowled = new Set(); this.impacts = 0; this.impactCd = 0; this.settleT = 0;
    this.pull = CFG.physics.activePull;
    this.maxHp = this.cfg.hp; this.benched = false; this.enraged = false;
    this.weapon = null; this.carry = null; this.batDir = new V3(0, 1, 0); this.throwCd = rand(1.0, 2.0); this.lobType = Math.random() < 0.5 ? 'potato' : 'pot';
    if (this.cfg.throws) this.lobType = this.cfg.throws[0];
    this.shieldHp = this.cfg.shield || 0; this.counterCd = 0; this.kickLow = false;
    this.dodgeCd = 0; this.dodgeDir = new V3(); this.shoveV = new V3(); this.shoveT = 1e9; this.nextWindup = 0;
    if (this.cfg.weapon) this.equip(new Prop(this.cfg.weapon, this.pos));
    this.drawParts();
  }
  // teleport: rig, targets and particles together. y picks the floor where floors stack (default: the one you're on)
  placeAt(x, z, yaw, y) {
    this.pos.set(x, floorAt(x, z, y === undefined ? player.floorY : y), z); this.yaw = yaw; this.applyPose(POSES[this.type], 1e9, 1);
    for (const p of this.body.ps) { p.x.copy(this.targets[p.name]); p.p.copy(p.x); p.v.set(0, 0, 0); }
    this.drawParts();
    if (this.weapon) { this.updateWeapon(1); for (const q of this.weapon.body.ps) { q.x.copy(q.pin); q.p.copy(q.pin); } this.weapon.render(); }
  }
  // ---------- held weapons and thrown kitchenware
  equip(w) {
    this.weapon = w; w.heldByEnemy = this; w.body.ignore = this.body; w.pinAll();
  }
  disarm(dir) {   // the bat flies out of his hands; he fights with his fists from now on
    const w = this.weapon; if (!w) return;
    this.weapon = null; w.heldByEnemy = null; w.body.ignore = null;
    w.unpinAll(_pa.copy(dir).setY(0).normalize().multiplyScalar(2.2).setY(2.4));
    w.thrown = false; game.disarms = (game.disarms || 0) + 1;
    AU.wood(); killFx(this.windFx); this.windFx = null;
    label('disarm', this.body.by.head.x.clone().add(new V3(0, 0.35, 0)));
    const c = this.cfg; this.cfg = Object.assign({}, c, { reach: c.unarmedReach || c.reach, dmg: c.unarmedDmg || c.dmg, windup: c.unarmedWindup || c.windup, weapon: null });
  }
  dropWeapon() {
    const w = this.weapon; if (!w) return;
    this.weapon = null; w.heldByEnemy = null; w.body.ignore = null; w.unpinAll(this.body.by.wrR.v); w.thrown = false;
    const c = this.cfg; this.cfg = Object.assign({}, c, { reach: c.unarmedReach || c.reach, dmg: c.unarmedDmg || c.dmg, windup: c.unarmedWindup || c.windup, weapon: null });
  }
  dropCarry() {
    const p = this.carry; if (!p) return;
    this.carry = null; p.heldByEnemy = null; p.body.ignore = null; p.unpinAll(this.body.by.wrR.v);
  }
  // the bat rides the right wrist; its angle is set by what he's doing, the tip is a real particle
  updateWeapon(dt) {
    const w = this.weapon; if (!w) return;
    const wr = this.body.by.wrR.x;
    const f = _pa.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)), r = _pb.set(-f.z, 0, f.x);
    const want = _pc, st = this.state, D = w.cfg.dirs || BAT_DIRS;
    const dirOf = (k) => want.set(0, D[k][0], 0).addScaledVector(f, D[k][1]).addScaledVector(r, D[k][2]);
    let rate = 10;
    if (st === 'windup') dirOf('windup');
    else if (st === 'strike') { want.subVectors(this.lockTarget, wr); want.y -= 0.05; rate = 26; }
    else if (st === 'whiff' || (st === 'recover' && this.timer < 0.25)) { dirOf('whiff'); rate = 14; }
    else dirOf('rest');   // resting on the shoulder (the flagpole: upright)
    want.normalize();
    this.batDir.lerp(want, Math.min(1, rate * dt)).normalize();
    const b = w.body.by, L = w.cfg.length, g = w.cfg.grip || 0.06;
    b.knob.pin.copy(wr).addScaledVector(this.batDir, -g);
    b.tip.pin.copy(wr).addScaledVector(this.batDir, L - g);
    w.body.wake();
  }
  updateCarry() {
    const p = this.carry; if (!p) return;
    p.body.ps[0].pin.copy(this.body.by.wrR.x).addScaledVector(_pa.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)), 0.06);
    p.body.wake();
  }
  // lob what he's holding on a ballistic arc that lands on your head
  release() {
    const p = this.carry; if (!p) return;
    this.carry = null; p.heldByEnemy = null;
    const S = p.body.ps[0].x, T = _pd.copy(player.head); T.y -= 0.12;
    const dist = Math.hypot(T.x - S.x, T.z - S.z);
    const lt = p.cfg.lobT || [0.45, 0.85], tf = clamp(dist / (p.cfg.lob || 7), lt[0], lt[1]);   // cymbals fly flatter and faster
    const v = _pa.subVectors(T, S).divideScalar(tf); v.y -= 0.5 * CFG.physics.gravity * tf;
    p.body.drag = 0.02;
    p.unpinAll(v);
    p.body.ignore = this.body;   // don't clip his own arm on the way out
    p.hostile = true; p.thrown = true; p.thrower = this; p.releasedAt = NOW; p.hitSet.clear(); p.hitSet.add(this);
    p.prevPos.copy(S);
    AU.whiff();
  }
  // ---------- skeleton / targets / drawing
  syncRig() { this.rig.position.set(this.pos.x, this.pos.y + (this.rootY || 0), this.pos.z); this.rig.rotation.set(0, this.yaw, 0); this.rig.updateMatrixWorld(true); }
  computeTargets() { for (const [n, part, off] of JOINTS) this.bones[part].localToWorld(this.targets[n].set(off[0], off[1], off[2])); }
  drawParts() {
    const P = this.body ? this.body.by : null; if (!P) return;
    const s = this.s;
    const Yt = _v1.subVectors(P.chest.x, P.pelvis.x).normalize();
    const Xt = _v2.subVectors(P.shR.x, P.shL.x);
    const qt = frameQ(Yt, Xt, _pd.set(0, 0, 1), new Q());
    const Xtn = new V3(1, 0, 0).applyQuaternion(qt), Ztn = new V3(0, 0, 1).applyQuaternion(qt);
    const qh = frameQ(Yt, _v2.subVectors(P.hipR.x, P.hipL.x), Ztn, new Q());
    const Xh = new V3(1, 0, 0).applyQuaternion(qh), Zh = new V3(0, 0, 1).applyQuaternion(qh);
    setM(this.partM.hips, P.pelvis.x, qh, s);
    const torsoO = _v3.copy(P.pelvis.x).addScaledVector(Yt, 0.08 * s);
    setM(this.partM.torso, torsoO, qt, s);
    const headO = new V3().copy(P.chest.x).addScaledVector(Yt, this.neck * s);
    const Yhd = new V3().subVectors(P.head.x, headO).normalize();
    setM(this.partM.head, headO, frameQ(Yhd, Xtn, Ztn, new Q()), s);
    for (const name of Object.keys(PART_FRAMES)) {
      const [o, a, b, f] = PART_FRAMES[name];
      const Y = _pc.subVectors(P[a].x, P[b].x); if (Y.lengthSq() < 1e-8) continue; Y.normalize();
      setM(this.partM[name], P[o].x, frameQ(Y, f === 't' ? Xtn : Xh, f === 't' ? Ztn : Zh, _bq), s);
    }
    this.skin();
  }
  skin() {   // CPU skinning: base vertices x their part's matrix, straight into the vertex buffer
    const pos = this.geo.attributes.position, nrm = this.geo.attributes.normal;
    const pa = pos.array, na = nrm.array, bp = this.baseP, bn = this.baseN, idx = this.vIdx, Ms = this.Ms;
    let last = -1, e = null;
    for (let v = 0, n = idx.length; v < n; v++) {
      const pi = idx[v]; if (pi !== last) { e = Ms[pi]; last = pi; }
      const i = v * 3, x = bp[i], y = bp[i + 1], z = bp[i + 2], a = bn[i], b = bn[i + 1], c = bn[i + 2];
      pa[i] = e[0] * x + e[4] * y + e[8] * z + e[12];
      pa[i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
      pa[i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
      na[i] = e[0] * a + e[4] * b + e[8] * c;
      na[i + 1] = e[1] * a + e[5] * b + e[9] * c;
      na[i + 2] = e[2] * a + e[6] * b + e[10] * c;
    }
    pos.needsUpdate = true; nrm.needsUpdate = true;
  }
  // ---------- state helpers
  setState(s) {
    if (s === 'approach' && this.cfg.thrower) s = 'keepaway';   // throwers never walk up to you on purpose
    if (this.state === 'windup' || this.state === 'strike' || this.state === 'lobWind') { killFx(this.windFx); this.windFx = null; }
    if (this.state === 'lobWind' && s !== 'lobRelease') this.dropCarry();
    if (this.state === 'stagger' && s !== 'stagger') { killFx(this.starsFx); this.starsFx = null; }
    this.state = s; this.timer = 0;
  }
  releaseToken() { this.hasToken = false; }
  setFace(f, t) {
    this.face = f; this.faceT = t || 0;
    if (this.faceStart === undefined) return;
    const o = FACE_OFFSET[f], uv = this.geo.attributes.uv, a = uv.array, b = this.baseU;
    for (let i = this.faceStart * 2, n = (this.faceStart + this.faceCount) * 2; i < n; i += 2) { a[i] = b[i] + o[0]; a[i + 1] = b[i + 1] + o[1]; }
    uv.needsUpdate = true;
  }
  hittable() { return this.alive && !['ragdoll', 'ko', 'getup', 'dead'].includes(this.state) && !(this.state === 'dodge' && this.timer < (this.cfg.dodgeIframes || 0.2)); }
  grabbable() { return this.alive && ['enter', 'approach', 'circle', 'windup', 'recover', 'whiff', 'flinch', 'stagger', 'keepaway', 'lobWind', 'lobRelease', 'retreat'].includes(this.state); }
  guarding() { return this.cfg.highGuard && ['enter', 'approach', 'circle', 'recover'].includes(this.state); }
  shieldUp() { return this.shieldHp > 0 && ['enter', 'approach', 'circle', 'windup', 'recover', 'whiff', 'flinch'].includes(this.state); }
  facing() { return new V3(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }
  atkKey() { return this.weapon ? (this.weapon.cfg.pose || 'batboy') + '-bat' : this.cfg.kicker ? (this.kickLow ? 'kickLow' : 'kickHigh') : this.type; }
  shieldBlock(tier, weapon, point, hand) {   // a hit on the riot shield: chips it, and he answers with the baton
    this.shieldHp -= (tier === 'heavy' ? 2 : 1) + (weapon ? 1 : 0);
    this.poise -= 3; AU.clank(); if (hand) buzz(hand, 0.45, 50);
    fx(['fx_guard'], point, { life: 0.15, scale: 0.014 });
    if (this.shieldHp <= 0) { this.breakShield(point); return; }
    label('guard', point.clone().add(new V3(0, 0.15, 0)));
    if (this.counterCd <= 0 && this.state !== 'windup' && this.state !== 'strike') {
      this.counterCd = 1.2; this.hasToken = true; this.combo = 0; this.side = 'r';
      this.windupTime = this.cfg.counterWindup; this.setState('windup'); AU.grunt(); this.attachWindFx();
    }
  }
  breakShield(point) {
    this.shieldHp = 0;
    if (this.tags && this.tags.shield) { const [v0, v1] = this.tags.shield; this.baseP.fill(0, v0 * 3, v1 * 3); }   // collapse it out of the one skinned mesh
    AU.glass(); fx(['fx_glass', 'fx_burst1', 'fx_dust'], point, { frameTime: 0.06 });
    label('shatter', point.clone().add(new V3(0, 0.2, 0)));
    for (const h of handList) buzz(h, 0.8, 90);
    game.shatters = (game.shatters || 0) + 1;
    this.stagger(CFG.reactions.parryStaggerTime);
  }
  zones() {
    const P = this.body.by, s = this.s;
    const z = this._z || (this._z = ['head', 'chest', 'belly', 'armL', 'armR', 'armL', 'armR'].map(name => ({ name, pos: new V3(), r: 0 })));
    z[0].pos.copy(P.head.x); z[0].r = 0.15 * s;
    z[1].pos.lerpVectors(P.pelvis.x, P.chest.x, 0.62); z[1].r = 0.25 * s;
    z[2].pos.copy(P.pelvis.x); z[2].r = 0.21 * s;
    z[3].pos.subVectors(P.wrL.x, P.elL.x).setLength(0.06 * s).add(P.wrL.x); z[3].r = 0.11 * s;
    z[4].pos.subVectors(P.wrR.x, P.elR.x).setLength(0.06 * s).add(P.wrR.x); z[4].r = 0.11 * s;
    z[5].pos.lerpVectors(P.elL.x, P.wrL.x, 0.5); z[5].r = 0.09 * s;
    z[6].pos.lerpVectors(P.elR.x, P.wrR.x, 0.5); z[6].r = 0.09 * s;
    return z;
  }
  zone(name) { return this.zones().find(q => q.name === name); }
  nearestZone(at) { let best = null, bd = 1e9; for (const z of this.zones()) { const d = z.pos.distanceTo(at) - z.r; if (d < bd) { bd = d; best = z; } } return best; }
  hitstop() { this.freeze = rand(CFG.punch.hitstop[0], CFG.punch.hitstop[1]); this.flashT = 0.07; this.body.sim = false; }
  // a physical shove at a point, scaled by how hard you hit
  shove(point, dir, mag) { this.body.impulse(point, _pa.copy(dir).multiplyScalar(mag), 0.5 * this.s); }
  stagger(dur) {
    this.releaseToken(); this.setState('stagger'); this.staggerDur = dur || CFG.reactions.staggerTime; this.poise = 0;
    killFx(this.starsFx);
    const head = this.body.by.head;
    this.starsFx = loopFx(['fx_stars0', 'fx_stars1', 'fx_stars2'], () => _pb.copy(head.x).add(_pc.set(0, 0.3 * this.s, 0)), 0.08);
    label('stagger', head.x.clone().add(new V3(0, 0.3, 0)));
  }
  goLimp() {
    this.releaseToken(); killFx(this.windFx); this.windFx = null;
    this.dropWeapon(); this.dropCarry();
    if (this.heldBy) { this.heldBy.held = null; this.heldBy.desk.mode = 'guard'; this.heldBy = null; }
    for (const p of this.body.ps) p.pin = null;
    if (player.clinchedBy === this) player.clinchedBy = null;
    this.setState('ragdoll'); this.pull = 0; this.body.pull = 0; this.body.sim = true; this.body.drag = 0.25;
    this.settleT = 0; this.impacts = 0; this.bowled.clear();
  }
  // knockdown / launch: go limp with a real push at the point you hit
  knockdown(dir, kind, ko, at) {
    if (ko && this.cfg.signs) { this.signDown(); return; }   // the Chairman doesn't go flying: he kneels and signs
    const launch = kind === 'launch';
    this.goLimp();
    const k = CFG.reactions.knockbackMult / 2.5;
    const d = _pd.copy(dir).setY(0); if (d.lengthSq() < 1e-6) d.set(this.pos.x - player.head.x, 0, this.pos.z - player.head.z); d.normalize();
    this.body.push(_pa.copy(d).multiplyScalar((launch ? 3.4 : 1.8) * k).setY(launch ? 3.0 : 1.2));
    this.body.impulse(at || this.body.by.chest.x, _pa.copy(d).multiplyScalar((launch ? 4 : 2.5) * k), 0.5);
    this.flying = launch;
    if (ko) this.markKO();
  }
  markKO() {
    if (!this.alive) return;
    if (this.cfg.signs && this.state !== 'ragdoll') { this.signDown(); return; }
    this.alive = false; if (this.cfg.signs) return;   // knocked out mid-flight: he kneels and signs once he's settled
    this.setFace('ko');
    fx(['fx_stars0', 'fx_stars1', 'fx_stars2'], this.body.by.head.x.clone().add(new V3(0, 0.3, 0)), { life: 1.2, frameTime: 0.08 });
  }
  grabbedBy(h) {
    if (player.clinchedBy === this) player.clinchedBy = null;
    this.releaseToken(); killFx(this.windFx); this.windFx = null;
    this.dropWeapon();
    this.setState('held'); this.heldBy = h; h.held = this;
    // grab whichever of collar / head / shoulder is nearest the hand; the rest dangles
    let best = null, bd = 1e9;
    for (const n of ['chest', 'head', 'shL', 'shR', 'pelvis']) { const d = this.body.by[n].x.distanceTo(h.fist); if (d < bd) { bd = d; best = n; } }
    this.pinned = this.body.by[best]; this.pinned.pin = h.fist;
    this.pull = 0.02; this.body.pull = 0.02; this.body.drag = 0.6;
    buzz(h, 0.5, 60); AU.thud('light');
  }
  releasedBy(h, isThrow) {
    this.heldBy = null; if (this.pinned) { this.pinned.pin = null; this.pinned = null; }
    if (h.speed >= CFG.grab.throwMinSpeed || isThrow) this.thrownBy(h.vel);
    else { this.goLimp(); this.flying = false; this.settleT = CFG.reactions.getUpTime * 0.6; }
  }
  thrownBy(handVel) {
    const v = handVel.clone().multiplyScalar(CFG.grab.throwMult);
    const flat = _v1.set(v.x, 0, v.z), sp = flat.length();
    if (sp > 0.5) {   // throw assist: curve toward another goon inside the cone
      flat.divideScalar(sp);
      let best = null, bestAng = CFG.grab.throwAssistDeg * DEG;
      for (const o of enemies) {
        if (o === this || !o.hittable() || o.benched) continue;
        const to = _v2.set(o.pos.x - this.pos.x, 0, o.pos.z - this.pos.z), L = to.length(); if (L < 0.3 || L > 6) continue;
        const ang = Math.acos(clamp(to.divideScalar(L).dot(flat), -1, 1));
        if (ang < bestAng) { bestAng = ang; best = o; }
      }
      if (best) { const to = _v2.set(best.pos.x - this.pos.x, 0, best.pos.z - this.pos.z).normalize(); v.x = to.x * sp; v.z = to.z * sp; }
    }
    v.y = Math.max(v.y, 1.6);
    this.goLimp(); this.flying = true;
    for (const p of this.body.ps) p.v.multiplyScalar(0.3).add(v);
    this.setFace('hurt', 1.2); AU.thud('solid');
  }
  // ---------- per frame (AI + animation targets); physics runs separately
  update(dt) {
    if (this.flashT > 0) this.flashT -= dt;
    const fl = this.flashT > 0 ? 1 : 0;
    this.mat.uniforms.uFlash.value = fl;
    if (this.faceT > 0) { this.faceT -= dt; if (this.faceT <= 0 && this.alive) this.setFace('normal'); }
    if (this.freeze > 0) { this.freeze -= dt; if (this.freeze <= 0) this.body.sim = true; return; }   // hitstop
    this.timer += dt;
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.impactCd > 0) this.impactCd -= dt;
    if (this.counterCd > 0) this.counterCd -= dt;
    if (this.shoveT < CFG.ai.shoveTime) this.pushPlayer(dt);   // the lifter's punch is still moving you
    if (this.dodgeCd > 0) this.dodgeCd -= dt;
    if (this.cfg.dodgeChance && this.dodgeCd <= 0 && (this.state === 'approach' || this.state === 'circle' || this.state === 'recover')) this.watchFists();

    const toP = _v1.set(player.head.x - this.pos.x, 0, player.head.z - this.pos.z);
    const dist = toP.length();
    let pose = POSES[this.type], rate = 8, moving = false;
    let pull = CFG.physics.activePull;
    const c = this.cfg;

    switch (this.state) {
      case 'enter': {
        if (this.followDetour(dt)) { moving = true; break; }
        moving = this.moveTo(this.target, c.speed, dt);
        this.faceToward(toP, dt);
        if (!moving || this.timer > 6) this.setState('approach');
        break;
      }
      case 'approach': {
        if (!this.hasToken && !this.benched && this.cooldown <= 0 && tokensInUse() < CFG.ai.tokens) this.hasToken = true;
        if (!this.hasToken) { this.setState('circle'); break; }
        if (this.followDetour(dt)) { moving = true; break; }
        this.faceToward(toP, dt);
        if (dist > c.reach + 0.25) { moving = this.moveTo(_v2.copy(player.head).setY(0), c.speed, dt, c.reach); }
        else this.startWindup();
        break;
      }
      case 'circle': {
        if (this.followDetour(dt)) { moving = true; break; }
        this.faceToward(toP, dt);
        const ang = Math.atan2(-toP.x, -toP.z) + this.circleDir * 0.3;
        const R = this.benched ? CFG.boss.benchRadius : CFG.ai.circleRadius + (c.grabber ? 0.3 : 0);
        _v2.set(player.head.x + Math.sin(ang) * R, 0, player.head.z + Math.cos(ang) * R);
        moving = this.moveTo(_v2, c.speed * 0.6, dt);
        if (this.timer > 0.5 && !this.benched && this.cooldown <= 0 && tokensInUse() < CFG.ai.tokens) { this.hasToken = true; this.setState('approach'); }
        if (!moving) pose = this.tauntPose();
        break;
      }
      case 'windup': {
        this.faceToward(toP, dt);
        if (dist > c.reach) this.pos.addScaledVector(_v2.copy(toP).normalize(), Math.min(dist - c.reach, c.speed * 0.6 * dt));
        if (c.grabber) { pose = POSES.grabWind; rate = 6; }
        else { pose = attackPose(this.atkKey(), this.side, 'windup'); rate = this.weapon ? 6 : 10; }
        if (this.timer >= this.windupTime) {
          this.lockTarget.copy(player.head);
          if (c.grabber) this.setState('lunge'); else this.setState('strike');
        }
        break;
      }
      case 'strike': {
        pose = attackPose(this.atkKey(), this.side, 'strike'); rate = this.weapon ? 18 : 28; pull = CFG.physics.activePull * 1.3;
        if (dist > CFG.physics.personalSpace + 0.05) this.pos.addScaledVector(_v2.copy(toP).normalize(), Math.min(dist - CFG.physics.personalSpace, 1.3 * dt));
        if (this.timer >= (this.weapon ? CFG.ai.batStrikeTime : c.kicker ? CFG.ai.kickStrikeTime : CFG.ai.strikeTime)) this.resolveStrike();
        break;
      }
      case 'lunge': {
        pose = POSES.clinch; rate = 14;
        if (dist > CFG.physics.personalSpace + 0.05) this.pos.addScaledVector(_v2.copy(toP).normalize(), Math.min(dist - CFG.physics.personalSpace, 2.4 * dt));
        if (this.timer >= CFG.ai.lungeTime) this.resolveGrab();
        break;
      }
      case 'recover': case 'whiff': {
        this.faceToward(toP, dt);
        if (this.state === 'whiff') pose = attackPose(this.atkKey(), this.side, 'strike');
        if (this.timer >= (this.recoverTime || 0.45)) {
          if (this.combo > 0 && this.hasToken && dist < c.reach + 0.4) { this.combo--; this.side = this.side === 'r' ? 'l' : 'r'; if (c.kicker) this.kickLow = this.side === 'l'; this.windupTime = this.nextWindup || c.comboWindup || c.windup; this.nextWindup = 0; this.setState('windup'); AU.grunt(); this.attachWindFx(); this.telegraph(); }
          else { this.releaseToken(); this.cooldown = rand(...CFG.ai.attackCooldown) * (c.retreat ? 0.5 : 1); this.setState(c.retreat ? 'retreat' : 'approach'); }
        }
        break;
      }
      case 'retreat': {   // the kicker darts back out of reach after a combo, then circles for another way in
        this.faceToward(toP, dt);
        if (c.cartwheel) {   // the gymnast cartwheels out sideways and back: the whole body wheels about the hips
          const T = c.cartwheel, k = Math.min(1, this.timer / T);
          _v2.set(-toP.z, 0, toP.x).normalize().multiplyScalar(this.circleDir * 0.8).addScaledVector(_v3.copy(toP).normalize(), -0.6);
          if (k < 1) this.moveTo(_v2.multiplyScalar(2).add(this.pos), c.speed * 0.9, dt);
          pose = Object.assign({}, POSES.cartwheel); pose.hips = [0, 0, -this.circleDir * 360 * k]; rate = 30;
          if (k >= 1) { this.cur.hips[2] += this.circleDir * 360; this.setState('circle'); }
          break;
        }
        _v2.copy(this.pos).addScaledVector(_v3.copy(toP).normalize(), -1.2);
        moving = dist < c.retreat && this.timer < 1.0 ? this.moveTo(_v2, c.speed * 0.8, dt) : false;
        if (!moving) this.setState('circle');
        break;
      }
      case 'dodge': {   // the specialist slips your punch: a quick step out of its line, then straight back in
        this.faceToward(toP, dt);
        pose = POSES.dodge; rate = 16;
        if (this.timer < CFG.ai.dodgeTime) { this.pos.addScaledVector(this.dodgeDir, CFG.ai.dodgeStep * (1 - this.timer / CFG.ai.dodgeTime) * dt); }
        else { this.cooldown = 0; this.setState('approach'); }
        break;
      }
      case 'flinch': {
        pose = POSES.hurt; rate = 18; pull = CFG.physics.activePull * 0.6;
        if (this.timer >= CFG.reactions.flinchTime) this.setState('approach');
        break;
      }
      case 'stagger': {
        pose = POSES.stagger; rate = 10; pull = CFG.physics.staggerPull;
        this.pos.addScaledVector(_v2.copy(toP).normalize(), -0.15 * dt);
        if (this.timer >= this.staggerDur) { this.poise = c.poise; this.setState('approach'); }
        break;
      }
      case 'held': {
        // dangling from the player's hand; struggles, then breaks free
        this.rootAtPelvis();
        if (Math.random() < dt * 4) { const p = this.body.ps[3 + Math.floor(Math.random() * 12)]; p.v.add(_v2.set(rand(-2, 2), rand(0, 2), rand(-2, 2))); }
        if (this.timer >= CFG.grab.breakFree) {
          const h = this.heldBy; if (h) { h.held = null; h.desk.mode = 'guard'; buzz(h, 0.5, 80); }
          this.heldBy = null; if (this.pinned) { this.pinned.pin = null; this.pinned = null; }
          this.startGetup();
        }
        return;
      }
      case 'clinch': {
        pose = POSES.clinch; rate = 10;
        this.faceToward(toP, dt);
        hurtPlayer((c.clinchDps || CFG.player.clinchDps) * dt);
        if (player.clinchedBy !== this) { this.setState('recover'); this.recoverTime = 0.6; break; }
        if (this.armHits >= (c.armHitsToBreak || CFG.player.armHitsToBreak)) { this.breakClinch(); break; }
        if (this.timer >= CFG.player.clinchTime) {   // slam
          player.clinchedBy = null;
          hurtPlayer(c.clinchSlam || CFG.player.clinchSlam);
          this.releaseToken(); this.setState('recover'); this.recoverTime = 1.0;
        }
        break;
      }
      case 'keepaway': {   // the cook: stay 3–5 m out and lob things; slap if you corner him
        if (this.followDetour(dt)) { moving = true; break; }
        this.faceToward(toP, dt);
        if (this.throwCd > 0) this.throwCd -= dt;
        if (dist < 1.3 && this.cooldown <= 0 && tokensInUse() < CFG.ai.tokens) { this.hasToken = true; this.startWindup(); break; }
        const [near, far] = c.keepAway;
        if (dist < near) { _v2.copy(this.pos).addScaledVector(_v3.copy(toP).normalize(), -1.0); moving = this.moveTo(_v2, c.speed * 0.9, dt); }
        else if (dist > far) moving = this.moveTo(_v2.copy(player.head).setY(0), c.speed * 0.7, dt, far - 0.3);
        else {   // drift sideways around you
          const ang = Math.atan2(-toP.x, -toP.z) + this.circleDir * 0.25;
          _v2.set(player.head.x + Math.sin(ang) * dist, 0, player.head.z + Math.cos(ang) * dist);
          moving = this.moveTo(_v2, c.speed * 0.4, dt);
        }
        this.faceToward(toP, dt);
        if (this.throwCd <= 0 && dist > 1.8 && dist < 7 && projectilesInAir() < CFG.projectiles.maxInAir) {
          this.carry = new Prop(this.lobType, this.body.by.wrR.x);
          this.lobType = this.lobType === 'pot' ? 'potato' : (Math.random() < 0.6 ? 'potato' : 'pot');
          if (c.throws) this.lobType = c.throws[Math.random() < 0.5 ? 0 : 1];
          this.carry.heldByEnemy = this; this.carry.body.ignore = this.body; this.carry.pinAll();
          this.setState('lobWind'); AU.grunt();
          this.windFx = loopFx(['fx_windup', 'fx_windup', 'fx_spark', 'fx_windup'], () => this.carry ? this.carry.body.ps[0].x : this.body.by.wrR.x, 0.07);
          break;
        }
        if (!moving) pose = this.tauntPose();
        break;
      }
      case 'lobWind': {
        this.faceToward(toP, dt); pose = POSES.lob; rate = 7;
        if (this.timer >= c.throwWindup) { killFx(this.windFx); this.windFx = null; this.release(); this.setState('lobRelease'); }
        break;
      }
      case 'lobRelease': {
        pose = POSES.lobRelease; rate = 16;
        if (this.timer >= 0.4) { this.throwCd = rand(...c.throwCooldown); this.setState('keepaway'); }
        break;
      }
      case 'ragdoll': {
        this.rootAtPelvis();
        return;
      }
      case 'signed': {   // beaten, he kneels where he is and stays (he isn't going anywhere: he has a permit to sign)
        this.rootY = -0.45 * this.s;
        this.pull = CFG.physics.activePull; this.body.pull = this.pull; this.body.drag = 0.8;
        this.faceToward(toP, dt);
        this.applyPose(POSES.kneel, 4, dt);
        return;
      }
      case 'getup': {
        // two beats: onto one knee, then stand. The ragdoll is pulled up gradually, not yanked.
        const k = Math.min(1, this.timer / CFG.reactions.getUpBlend), kneel = 0.55;
        const ramp = Math.min(1, k / kneel);
        this.pull = CFG.physics.activePull * (k < kneel ? 0.25 * Math.pow(ramp, 3) : 0.25 + 0.75 * Math.pow((k - kneel) / (1 - kneel), 2));
        this.body.pull = this.pull; this.body.drag = 0.8;
        this.rootY = k < kneel ? -0.45 * this.s : -0.45 * this.s * (1 - (k - kneel) / (1 - kneel));
        this.faceToward(toP, dt);
        this.applyPose(k < kneel ? POSES.kneel : POSES[this.type], k < kneel ? 5 : 4, dt);
        if (k >= 1) { this.rootY = 0; this.poise = c.poise; this.setState('approach'); this.cooldown = 0.6; this.flying = false; }
        return;
      }
      case 'ko': {
        this.koT += dt;
        if (this.koT > CFG.reactions.koRemoveTime) {   // sink out of the floor
          this.body.sim = false;
          for (const p of this.body.ps) { p.x.y -= dt * 0.4; }
          if (this.body.by.chest.x.y < this.pos.y - 0.4) this.remove();
        }
        return;
      }
    }
    if (moving) {   // walking legs
      this.walkPhase += dt * 9;
      pose = Object.assign({}, pose);
      const sw = Math.sin(this.walkPhase) * 22;
      const add = (n, v) => { const b = pose[n] || [0, 0, 0]; pose[n] = [b[0] + v, b[1], b[2]]; };
      add('thighl', sw); add('thighr', -sw); add('shinl', Math.max(0, -sw)); add('shinr', Math.max(0, sw));
    }
    this.separate();
    this.collideRoot();
    this.pos.y = floorAt(this.pos.x, this.pos.z, this.pos.y);   // up and down ramps and stairs (the ragdoll pull smooths any step)
    this.pull = pull; this.body.pull = pull; this.body.drag = 0.6;
    this.applyPose(pose, rate, dt);
    this.updateWeapon(dt); this.updateCarry();
  }
  // after each physics step: ragdoll bookkeeping (settling, impacts)
  afterStep() {
    if (this.state === 'ragdoll' || this.state === 'held') {
      const b = this.body;
      if (b.impact > CFG.physics.impactDamageSpeed && this.flying && this.impactCd <= 0 && this.impacts < 2) {
        this.impactCd = 0.35; this.impacts++;
        this.hp -= CFG.physics.impactDamage; AU.thud('heavy'); fx(['fx_heavy', 'fx_dust'], b.impactAt.clone(), { frameTime: 0.06 });
        if (this.hp <= 0) this.markKO();
      }
      if (this.state === 'ragdoll') {
        const P = b.by;
        let sp = 0; for (const p of b.ps) sp += p.v.length(); sp /= b.ps.length;
        const still = sp < 0.45;   // at rest anywhere: the floor, the bar, a table
        if (still) {
          this.settleT += 1 / CFG.physics.hz;
          if (!this.alive && this.settleT > 0.4) { if (this.cfg.signs) this.signDown(); else this.setState('ko'); }
          else if (this.alive && this.settleT >= CFG.reactions.getUpTime) this.startGetup();
        } else this.settleT = Math.max(0, this.settleT - 0.25 / CFG.physics.hz);
        if (P.pelvis.v.length() < 2) this.flying = false;
      }
    }
  }
  startGetup() {
    if (!this.alive) { if (this.cfg.signs) this.signDown(); else this.setState('ko'); return; }
    this.rootAtPelvis();
    if (pushOutXZ(this.pos, 0.32)) this.pos.y = floorAt(this.pos.x, this.pos.z, this.pos.y);
    this.yaw = Math.atan2(player.head.x - this.pos.x, player.head.z - this.pos.z);
    this.setState('getup'); this.pull = 0; this.flying = false;
  }
  tauntPose() {
    const p = Object.assign({}, POSES[this.type]);
    const bob = Math.sin(NOW * 4 + this.walkPhase) * 6, t = p.torso || [0, 0, 0];
    p.torso = [t[0] + bob, t[1], 0];
    return p;
  }
  attachWindFx() {
    if (this.cfg.grabber) return;
    killFx(this.windFx);
    const S = this.side.toUpperCase(), k = this.cfg.kicker;
    const wr = this.body.by[(k ? 'an' : 'wr') + S], el = this.body.by[(k ? 'kn' : 'el') + S];
    const tip = this.weapon ? this.weapon.body.by.tip : null;
    this.windFx = loopFx(['fx_windup', 'fx_windup', 'fx_spark', 'fx_windup', 'fx_windup', 'fx_windup'],
      () => tip ? tip.x : _pb.subVectors(wr.x, el.x).setLength(0.08 * this.s).add(wr.x), 0.07);
  }
  startWindup() {
    this.combo = (this.cfg.combo || 1) - 1;
    this.side = (this.type === 'boso' || this.weapon || this.cfg.thrower) ? 'r' : (Math.random() < 0.5 ? 'l' : 'r');
    if (this.cfg.kicker) { this.kickLow = Math.random() < (this.cfg.lowChance || 0.45); this.side = this.kickLow ? 'l' : 'r'; }
    this.windupTime = this.cfg.windup;
    this.setState('windup');
    AU.grunt();
    this.attachWindFx(); this.telegraph();
  }
  telegraph() {   // a LOW! sign over the chambered knee, so a low kick reads at a glance
    if (this.cfg.kicker && this.kickLow) label('low', this.body.by['kn' + this.side.toUpperCase()].x.clone().add(new V3(0, 0.35, 0)));
  }
  resolveStrike() {
    killFx(this.windFx); this.windFx = null;
    const dodged = player.head.distanceTo(this.lockTarget) > CFG.defense.dodgeDistance;
    const S = this.side.toUpperCase(), low = this.cfg.kicker && this.kickLow;
    const shoulder = this.body.by[(this.cfg.kicker ? 'an' : 'sh') + S].x.clone();
    const block = low ? lowBlockHand() : blockingHand(shoulder, this.lockTarget);
    if (dodged) { AU.whiff(); this.setState('whiff'); this.recoverTime = 0.6; return; }
    if (block) {
      AU.clank(); buzz(block, 0.6, 60);
      const at = closestOnSeg(this.lockTarget, block.forearmA, block.forearmB, new V3());
      fx(['fx_guard'], at, { life: 0.15, scale: 0.012 }); label('block', at.clone().add(new V3(0, 0.15, 0)));
      // the punch bounces off your forearms
      this.shove(this.body.by[(this.cfg.kicker ? 'an' : 'wr') + S].x, _v2.subVectors(shoulder, this.lockTarget).setY(0).normalize(), 2.2);
      this.setState('recover'); this.recoverTime = 0.7; this.combo = Math.max(0, this.combo - 1);
      if (this.cfg.shovePlayer) this.startShove(this.cfg.shovePlayer * 0.45);   // even blocked, the lifter's punch moves you
      return;
    }
    const sweep = low && this.cfg.sweep;
    hurtPlayer(sweep ? this.cfg.sweep.dmg : this.cfg.dmg);
    if (this.weapon) { AU.wood(); fx(['fx_heavy', 'fx_dust'], this.weapon.hitPoint(new V3()), { frameTime: 0.05 }); for (const h of handList) buzz(h, 1.0, 140); }
    this.setState('recover'); this.recoverTime = this.weapon ? 0.8 : 0.45;
    if (this.cfg.shovePlayer) { this.startShove(this.cfg.shovePlayer); AU.thud('heavy'); label('heavy', player.head.clone().add(_v3.set(0, 0.25, 0))); }
    if (sweep) {   // the sweep: your legs go, he follows straight up with a quick one
      AU.thud('heavy'); for (const h of handList) buzz(h, 1.0, 220);
      label('swept', player.head.clone().add(_v3.set(0, -0.5, 0)).addScaledVector(camera.getWorldDirection(new V3()), 0.9));
      this.combo = Math.max(1, this.combo); this.nextWindup = this.cfg.sweep.followWindup; this.recoverTime = 0.3;
      game.sweeps = (game.sweeps || 0) + 1;
    }
  }
  // ---- the lifter's punch: you're pushed back along the punch, eased out (walls hold you), over CFG.ai.shoveTime
  startShove(m) {
    this.shoveV.set(player.head.x - this.pos.x, 0, player.head.z - this.pos.z); if (this.shoveV.lengthSq() < 1e-6) this.shoveV.copy(this.facing());
    this.shoveV.normalize().multiplyScalar(m); this.shoveT = 0;
  }
  pushPlayer(dt) {
    const T = CFG.ai.shoveTime, t0 = this.shoveT, t1 = Math.min(T, t0 + dt); this.shoveT = t1;
    const ease = (t) => 1 - (1 - t / T) * (1 - t / T), k = ease(t1) - ease(t0);
    const p = _v3.set(player.head.x + this.shoveV.x * k, player.floorY, player.head.z + this.shoveV.z * k);
    keepPlayerIn(p, 0.25);
    rig.position.x += p.x - player.head.x; rig.position.z += p.z - player.head.z;
    player.head.x = p.x; player.head.z = p.z;
  }
  // ---- the specialist: a fast fist coming at him in reach, and sometimes he slips it (back or to the side)
  watchFists() {
    const ch = this.body.by.chest.x, A = CFG.ai;
    for (const h of handList) {
      if ((h.held && !h.held.isProp) || h.speed < A.dodgeSpeed) continue;
      const to = _v2.subVectors(ch, h.fist), d = to.length();
      if (d > A.dodgeRange * this.s / 0.89 || h.vel.dot(to) < 0.6 * h.speed * d) continue;
      this.dodgeCd = A.dodgeCooldown;
      if (Math.random() < this.cfg.dodgeChance) this.startDodge(h.vel);
      return;
    }
  }
  startDodge(fistVel) {
    const away = _v2.set(this.pos.x - player.head.x, 0, this.pos.z - player.head.z).normalize();
    const side = _v3.set(-fistVel.z, 0, fistVel.x); if (side.lengthSq() < 1e-6) side.set(-away.z, 0, away.x);
    side.normalize(); if (Math.random() < 0.5) side.negate();
    this.dodgeDir.copy(away).multiplyScalar(0.55).addScaledVector(side, 0.85).normalize();
    for (const p of this.body.ps) p.v.addScaledVector(this.dodgeDir, 1.6);   // the body really moves out of the way
    this.setState('dodge'); AU.whiff();
    label('dodge', this.body.by.head.x.clone().add(_v3.set(0, 0.3, 0)));
    game.dodges = (game.dodges || 0) + 1;
  }
  // ---- a leader with signs: true at 0 hp: no ragdoll, no KO. He kneels where he stands, stays, and signs (onLeaderSigned)
  signDown() {
    if (this.state === 'signed') return;
    this.releaseToken(); killFx(this.windFx); this.windFx = null; killFx(this.starsFx); this.starsFx = null;
    this.dropWeapon(); this.dropCarry();
    if (this.heldBy) { this.heldBy.held = null; this.heldBy.desk.mode = 'guard'; this.heldBy = null; }
    if (this.pinned) { this.pinned.pin = null; this.pinned = null; }
    for (const p of this.body.ps) p.pin = null;
    if (player.clinchedBy === this) player.clinchedBy = null;
    if (this.state === 'ragdoll' || this.state === 'held') this.rootAtPelvis();
    this.alive = false; this.hp = 0; this.flying = false; this.body.sim = true; this.freeze = 0;
    this.yaw = Math.atan2(player.head.x - this.pos.x, player.head.z - this.pos.z);
    this.setState('signed'); this.setFace('hurt');
    if (typeof bossBars !== 'undefined') for (let i = bossBars.length - 1; i >= 0; i--) if (bossBars[i].e === this) { scene.remove(bossBars[i].g); bossBars.splice(i, 1); }
    AU.thud('solid');
    if (typeof onLeaderSigned === 'function') onLeaderSigned(this);
  }
  resolveGrab() {
    const flat = _v2.set(player.head.x - this.pos.x, 0, player.head.z - this.pos.z).length();
    const dodged = player.head.distanceTo(this.lockTarget) > CFG.defense.dodgeDistance + 0.1;
    if (flat < 1.0 && !dodged && !player.clinchedBy) {
      player.clinchedBy = this; this.armHits = 0; this.setState('clinch');
      label('grabbed', player.head.clone().add(_v3.set(0, 0.2, 0)).addScaledVector(camera.getWorldDirection(new V3()), 0.8));
      for (const h of handList) buzz(h, 0.7, 150);
      AU.grunt();
    } else { AU.whiff(); this.setState('whiff'); this.recoverTime = 0.9; }
  }
  breakClinch() {
    player.clinchedBy = null;
    label('free', this.body.by.head.x.clone().add(new V3(0, 0.3, 0)));
    this.stagger(CFG.reactions.staggerTime);
  }
  // ---------- root motion
  moveTo(target, speed, dt, stopAt = 0.08) {
    const d = _v3.set(target.x - this.pos.x, 0, target.z - this.pos.z);
    const L = d.length();
    if (L <= stopAt) return false;
    this.pos.addScaledVector(d.divideScalar(L), Math.min(L - stopAt, speed * dt));
    if ((this.state === 'enter' || this.state === 'circle') && !this.cfg.shield) this.faceToward(d, dt);   // the guard strafes, shield kept on you
    return true;
  }
  faceToward(dir, dt) {
    if (dir.lengthSq() < 1e-6) return;
    const want = Math.atan2(dir.x, dir.z);
    let d = want - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    this.yaw += d * Math.min(1, dt * 8);
  }
  separate() {
    const gap = CFG.floors.goonGap;   // on different floors of a stack, nobody is in anybody's way
    for (const o of enemies) {
      if (o === this || !o.hittable() || Math.abs(this.pos.y - o.pos.y) > gap) continue;
      const d = _v3.set(this.pos.x - o.pos.x, 0, this.pos.z - o.pos.z), L = d.length(), m = 0.62 * (this.s + o.s) / 1.76;
      if (L < m && L > 1e-4) this.pos.addScaledVector(d.divideScalar(L), (m - L) * 0.5);
    }
    if (Math.abs(this.pos.y - player.floorY) > gap) return;
    const d = _v3.set(this.pos.x - player.head.x, 0, this.pos.z - player.head.z), L = d.length();
    const minD = CFG.physics.personalSpace;
    if (L < minD && L > 1e-4) this.pos.addScaledVector(d.divideScalar(L), minD - L);
  }
  rootAtPelvis() {   // a limp or dangling goon's root: under his pelvis, on the floor he's over
    const P = this.body.by.pelvis.x; this.pos.set(P.x, floorAt(P.x, P.z, P.y), P.z);
  }
  collideRoot() {
    const hit = pushOutXZ(this.pos, 0.32);
    if (!hit || hit === true || this.detour) return;
    const m = 0.32 + 0.25, b = hit;   // blocked: commit to going around the nearer end
    const cs = [[b.x0 - m, b.z0 - m], [b.x0 - m, b.z1 + m], [b.x1 + m, b.z0 - m], [b.x1 + m, b.z1 + m]];
    const ex = this.pos.x, ez = this.pos.z;
    const side = cs.filter(([cx, cz]) => (ez <= b.z0 ? cz < b.z0 : ez >= b.z1 ? cz > b.z1 : true) && (ex <= b.x0 ? cx < b.x0 : ex >= b.x1 ? cx > b.x1 : true));
    let best = null, bestD = 1e9;
    for (const [cx, cz] of (side.length ? side : cs)) {
      const d = Math.hypot(cx - ex, cz - ez) + Math.hypot(player.head.x - cx, player.head.z - cz);
      if (d < bestD) { bestD = d; best = [cx, cz]; }
    }
    this.detour = new V3(best[0], 0, best[1]); this.detourT = 0;
  }
  followDetour(dt) {
    if (!this.detour) return false;
    this.detourT += dt;
    const moving = this.moveTo(this.detour, this.cfg.speed, dt, 0.15);
    this.faceToward(_v3.set(this.detour.x - this.pos.x, 0, this.detour.z - this.pos.z), dt);
    if (!moving || this.detourT > 5) this.detour = null;
    return true;
  }
  applyPose(pose, rate, dt) {
    const k = Math.min(1, rate * dt);
    for (const n of Object.keys(this.bones)) {
      const t = pose[n] || ZERO3, c = this.cur[n];
      c[0] += (t[0] - c[0]) * k; c[1] += (t[1] - c[1]) * k; c[2] += (t[2] - c[2]) * k;
      this.bones[n].rotation.set(c[0] * DEG, c[1] * DEG, c[2] * DEG);
    }
    this.syncRig(); this.computeTargets();
  }
  takeImpact(dmg, at) {
    this.hp -= dmg; AU.thud('heavy'); fx(['fx_heavy', 'fx_dust'], at.clone(), { frameTime: 0.06 });
    if (this.hp <= 0) this.markKO();
  }
  remove() {
    this.dropWeapon(); this.dropCarry();
    this.state = 'dead'; this.alive = false;
    killFx(this.starsFx); killFx(this.windFx);
    scene.remove(this.mesh);
    this.body.remove();
    const i = enemies.indexOf(this); if (i >= 0) enemies.splice(i, 1);
  }
}
const ZERO3 = [0, 0, 0];
const BAT_DIRS = { windup: [0.85, -0.5, 0.2], whiff: [-0.6, 0.6, -0.5], rest: [0.75, -0.55, 0.25] };   // where a bat points [up, forward, right]
function tokensInUse() { let n = 0; for (const e of enemies) if (e.hasToken) n++; return n; }
function pushOutXZ(p, r, includeBlockers = true) {
  let moved = keepInWalk(p, r);   // false | true (wall) | the blocker box. p.y: the feet (matters only on raised floors)
  if (!includeBlockers) return moved;
  for (const b of blockersNear(p.z)) {
    if (b.y1 !== undefined && (p.y >= b.y1 - CFG.floors.step || p.y + 1.6 < (b.y0 || 0))) continue;   // a blocker with a height range: only at its own floor
    const x0 = b.x0 - r, x1 = b.x1 + r, z0 = b.z0 - r, z1 = b.z1 + r;
    if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) {
      const dx0 = p.x - x0, dx1 = x1 - p.x, dz0 = p.z - z0, dz1 = z1 - p.z, m = Math.min(dx0, dx1, dz0, dz1);
      if (m === dx0) p.x = x0; else if (m === dx1) p.x = x1; else if (m === dz0) p.z = z0; else p.z = z1;
      moved = b;
    }
  }
  return moved;
}
function grabEnemy(h, e) { e.grabbedBy(h); }
