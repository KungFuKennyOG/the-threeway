'use strict';
// ============================== combat: player hits =========================
function tierFor(speed, travel) {
  if (travel < CFG.punch.minTravel) return CFG.punch.tiers[0];
  let t = CFG.punch.tiers[0];
  for (const x of CFG.punch.tiers) if (speed >= x.min) t = x;
  return t;
}
// hand: the hand that hit (null for thrown props/headbutts); weapon: a Prop or null
function playerHit(e, zone, speed, travel, hand, point, weapon, dirVec) {
  const P = CFG.punch, tier = tierFor(speed, travel);
  const dir = (dirVec || (hand ? hand.vel : _v3.subVectors(point, player.head))).clone().setY(0);
  if (dir.lengthSq() < 1e-6) dir.set(e.pos.x - player.head.x, 0, e.pos.z - player.head.z);
  dir.normalize();
  const isArm = zone === 'armL' || zone === 'armR';
  // parry: hit the attacking arm mid-swing
  if (isArm && !e.cfg.kicker && speed >= CFG.defense.parryMinSpeed && zone === 'arm' + e.side.toUpperCase() &&
      ((e.state === 'windup' && e.timer >= e.windupTime - CFG.defense.parryWindow) || e.state === 'strike')) {
    e.hitstop(); AU.parry(); if (hand) buzz(hand, 0.9, 80);
    fx(['fx_burst0', 'fx_burst1', 'fx_burst2'], point);
    if (e.weapon) e.disarm(dir); else label('parry', point.clone().add(new V3(0, 0.2, 0)));
    e.stagger(CFG.reactions.parryStaggerTime);
    return;
  }
  // breaking a clinch by hitting the arms
  if (isArm && e.state === 'clinch' && tier.name !== 'shove') {
    e.armHits++; e.hitstop(); AU.thud('light'); if (hand) buzz(hand, 0.5, 40);
    fx(['fx_burst0', 'fx_burst1', 'fx_burst2'], point);
    return;
  }
  const shoveMag = CFG.physics.hitShove[tier.name] * (CFG.physics.hitShoveMult || 1) * CFG.reactions.knockbackMult / 2.5 * (weapon ? 1.3 : 1);
  if (tier.name === 'shove') {
    e.shove(point, dir, shoveMag);
    AU.thud('shove'); if (hand) buzz(hand, 0.15, 25); label('shove', point.clone().add(new V3(0, 0.15, 0)));
    return;
  }
  // Aoki Security's riot shield takes anything at his front (head, body, the shield arm); he answers with the baton
  if ((!isArm || zone === 'armL') && e.shieldUp() && dir.dot(e.facing()) < -0.3) { e.shieldBlock(tier.name, weapon, point, hand); if (weapon) weapon.damage(point); return; }
  // boxer's high guard eats head shots: go to the body
  if (e.guarding() && zone === 'head' && !weapon) {
    e.poise -= 4; AU.clank(); if (hand) buzz(hand, 0.3, 40);
    fx(['fx_guard'], point, { life: 0.15, scale: 0.012 }); label('guard', point.clone().add(new V3(0, 0.15, 0)));
    return;
  }
  let dmg = tier.dmg, pd = tier.poise;
  if (zone === 'head') dmg *= P.headDamageMult; else if (!isArm) pd *= P.bodyPoiseMult;
  if (isArm) dmg *= P.armDamageMult;
  if (weapon) { dmg += weapon.cfg.dmg; pd *= weapon.cfg.poiseMult; }
  if (e.state === 'stagger') dmg *= P.staggerBonus;
  e.hp -= dmg; e.poise -= pd;
  e.shove(point, dir, shoveMag);   // a real push at the spot you hit; it lands after the hitstop
  e.hitstop(); e.setFace('hurt', 0.5);
  if (hand) buzz(hand, { light: 0.35, solid: 0.65, heavy: 1.0 }[tier.name], { light: 30, solid: 50, heavy: 80 }[tier.name]);
  AU.thud(tier.name);
  if (tier.name === 'heavy') fx(['fx_heavy', 'fx_heavy', 'fx_dust'], point, { frameTime: 0.05 });
  else fx(['fx_burst0', 'fx_burst1', 'fx_burst2'], point, { frameTime: 0.05 });
  label(tier.name, point.clone().add(new V3(0, 0.18, 0)));
  lastHit = { tier: tier.name, speed, zone, dmg: Math.round(dmg), type: e.type };
  if (weapon) weapon.damage(point);
  if (e.state === 'held' && e.heldBy) { /* hitting a goon you're holding is fine */ }
  if (e.state === 'clinch') { e.armHits = 99; }      // a solid shot to the body also breaks the clinch
  if (e.hp <= 0) { e.knockdown(dir, speed >= P.launchSpeed ? 'launch' : 'knockdown', true, point); return; }
  if (tier.name === 'heavy' && (e.state === 'stagger' || e.poise <= 0)) { e.knockdown(dir, speed >= P.launchSpeed ? 'launch' : 'knockdown', false, point); return; }
  if (e.poise <= 0) { if (e.state !== 'held') e.stagger(); return; }
  if (e.state === 'held' || e.state === 'clinch') return;
  if (tier.name !== 'light' || e.state !== 'windup') {   // light hits don't interrupt a windup
    if (e.state !== 'stagger') { e.releaseToken(); e.setState('flinch'); }
    e.pos.addScaledVector(dir, 0.05 * tier.knock * CFG.reactions.knockbackMult);
  }
}
let lastHit = null;

function checkPlayerHits(now) {
  for (const h of handList) {
    const weapon = h.held && h.held.isProp ? h.held : null;
    if (h.held && !weapon) continue;              // holding a goon: that hand is busy
    if (h.speed < CFG.punch.minContactSpeed) continue;          // resting contact never counts
    const speed = h.peak * (weapon ? (CFG.weapons.swingMult[weapon.type] || 1) : 1);
    const at = weapon ? weapon.hitPoint(new V3()) : h.fist;
    const rad = weapon ? weapon.cfg.hitRadius : CFG.punch.fistRadius;
    const mag = speed >= CFG.punch.magnetismMinSpeed ? CFG.punch.magnetism : 0;
    for (const e of enemies) {
      if (!e.hittable() || (h.cd.get(e) || 0) > now) continue;
      if (e.heldBy === h) continue;
      // swat the bat itself mid-swing: same as a parry, and it flies out of his hands
      if (e.weapon && h.speed >= CFG.defense.parryMinSpeed && ((e.state === 'windup' && e.timer > e.windupTime * 0.4) || e.state === 'strike')) {
        const kb = e.weapon.body.by;
        if (closestOnSeg(at, kb.knob.x, kb.tip.x, _v2).distanceTo(at) < rad + 0.08) {
          h.cd.set(e, now + CFG.punch.hitCooldown);
          e.hitstop(); AU.parry(); buzz(h, 0.9, 80);
          fx(['fx_burst0', 'fx_burst1', 'fx_burst2'], _v2.clone());
          e.disarm(h.vel); e.stagger(CFG.reactions.parryStaggerTime);
          continue;
        }
      }
      let hit = null;
      for (const z of e.zones()) {
        const d = z.pos.distanceTo(at);
        if (d < z.r + rad + mag) {
          if (h.vel.dot(_v1.subVectors(z.pos, at)) < 0 && d > 0.05) continue;   // moving away
          if (!hit || order(z.name) < order(hit.name)) hit = z;
        }
      }
      if (hit) {
        h.cd.set(e, now + CFG.punch.hitCooldown);
        // point of contact on the zone surface
        const point = _v2.subVectors(at, hit.pos).setLength(hit.r).add(hit.pos).clone();
        playerHit(e, hit.name, speed, h.travel, h, point, weapon);
        if (!h.held && weapon) break;
      }
    }
  }
  // headbutt
  if (player.headbuttCd > 0) player.headbuttCd -= 1 / 60;
  if (player.headSpeed >= CFG.grab.headbuttSpeed && player.headbuttCd <= 0) {
    for (const e of enemies) {
      if (!e.hittable()) continue;
      const hz = e.zone('head');
      if (hz.pos.distanceTo(player.head) < 0.36 && player.headVel.dot(_v1.subVectors(hz.pos, player.head)) > 0) {
        player.headbuttCd = 0.6;
        if (e.state === 'clinch') { e.armHits = 99; }
        playerHit(e, 'head', Math.max(player.headSpeed * 2.5, 3.2), 1, null, hz.pos.clone(), null, player.headVel);
        break;
      }
    }
  }
}
function order(n) { return { head: 0, chest: 1, belly: 2, armL: 3, armR: 3 }[n]; }

// segment helpers for forearm blocks
function closestOnSeg(p, a, b, out) {
  const ab = _v3.subVectors(b, a); const t = clamp(_v1.subVectors(p, a).dot(ab) / Math.max(1e-6, ab.lengthSq()), 0, 1);
  return out.copy(a).addScaledVector(ab, t);
}
function segSegDist(p1, q1, p2, q2) {
  const d1 = new V3().subVectors(q1, p1), d2 = new V3().subVectors(q2, p2), r = new V3().subVectors(p1, p2);
  const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r);
  let s, t;
  if (a <= 1e-9 && e <= 1e-9) return p1.distanceTo(p2);
  if (a <= 1e-9) { s = 0; t = clamp(f / e, 0, 1); }
  else {
    const c = d1.dot(r);
    if (e <= 1e-9) { t = 0; s = clamp(-c / a, 0, 1); }
    else {
      const b = d1.dot(d2), den = a * e - b * b;
      s = den !== 0 ? clamp((b * f - c * e) / den, 0, 1) : 0;
      t = (b * s + f) / e;
      if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); } else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); }
    }
  }
  const c1 = p1.clone().addScaledVector(d1, s), c2 = p2.clone().addScaledVector(d2, t);
  return c1.distanceTo(c2);
}
function lowBlockHand() {   // a forearm dropped to belly height in front of you checks a low kick
  const low = _v2.copy(player.head); low.y -= CFG.defense.lowDrop;
  let best = null, bestD = CFG.defense.lowBlockRadius;
  for (const h of handList) {
    if (h.held && !h.held.isProp) continue;
    const d = _v3.addVectors(h.forearmA, h.forearmB).multiplyScalar(0.5).distanceTo(low);
    if (d < bestD) { bestD = d; best = h; }
  }
  return best;
}
function blockingHand(from, target) {
  let best = null, bestD = CFG.defense.blockRadius;
  for (const h of handList) {
    if (h.held && !h.held.isProp) continue;
    const mid = _v2.addVectors(h.forearmA, h.forearmB).multiplyScalar(0.5);
    if (mid.distanceTo(player.head) > CFG.defense.blockMaxFromHead) continue;
    const d = segSegDist(from, target, h.forearmA, h.forearmB);
    if (d < bestD) { bestD = d; best = h; }
  }
  return best;
}
