'use strict';
// ============================== Rocco & Ivan ================================
// Tag team: one fights, the other circles wide. Stagger, floor or out-clinch the active one and his
// partner tags in. Drop one for good and the other one loses it.
function updateDuo(dt) {
  const B = game.bosses; if (B.length < 2) return;
  game.tagT = Math.max(0, game.tagT - dt);
  const alive = B.filter(e => e.alive);
  if (alive.length === 1) {
    const s = alive[0];
    if (!s.enraged) {
      s.enraged = true; s.benched = false; s.cooldown = 0;
      const c = s.cfg, E = CFG.boss;
      s.cfg = Object.assign({}, c, { speed: c.speed * E.enrageSpeed, windup: c.windup * E.enrageWindup, comboWindup: (c.comboWindup || c.windup) * E.enrageWindup });
      s.poise = s.cfg.poise; s.mat.uniforms.uTint.value.set(1.3, 0.78, 0.78);
      showSign('enrage', 2.0); AU.roar();
      label('enrage', s.body.by.head.x.clone().add(new V3(0, 0.4, 0)));
    }
    return;
  }
  if (alive.length < 2) return;
  const active = alive.find(e => !e.benched), bench = alive.find(e => e.benched);
  if (!active || !bench) { if (!active) alive[0].benched = false; return; }
  const inTrouble = ['stagger', 'ragdoll', 'getup', 'held'].includes(active.state);
  if (inTrouble && game.tagT <= 0 && bench.hittable()) {
    active.benched = true; active.releaseToken();
    bench.benched = false; bench.cooldown = 0; bench.hasToken = false;
    if (bench.state === 'circle') bench.setState('approach');
    game.tagT = CFG.boss.tagCooldown;
    showSign('tag', 1.3); AU.tag();
    label('tag', bench.body.by.head.x.clone().add(new V3(0, 0.4, 0)));
  }
}
// health bars over the bosses' heads
const bossBars = [];
function addBossBar(e) {
  const g = new THREE.Group();
  const bg = new THREE.Mesh(planeGeo, sharedMat('black', { emissive: true, fog: false }));
  bg.scale.set(0.56, 0.06, 1);
  const tint = e.type === 'rocco' ? [1, 0.45, 0.8] : [1, 0.85, 0.7];
  const fill = new THREE.Mesh(planeGeo, sharedMat('sodium', { emissive: true, fog: false, tint }));
  fill.scale.set(0.52, 0.03, 1); fill.position.z = 0.002;
  g.add(bg, fill); scene.add(g);
  bossBars.push({ e, g, fill });
}
function clearBossBars() { for (const b of bossBars) scene.remove(b.g); bossBars.length = 0; }
function updateBossBars() {
  camera.getWorldQuaternion(_q1);
  for (let i = bossBars.length - 1; i >= 0; i--) {
    const b = bossBars[i], e = b.e;
    if (e.state === 'dead' || (!e.alive && e.state === 'ko' && e.koT > 1)) { scene.remove(b.g); bossBars.splice(i, 1); continue; }
    const frac = clamp(e.hp / e.maxHp, 0, 1);
    b.fill.scale.x = Math.max(0.001, 0.52 * frac); b.fill.position.x = -0.26 * (1 - frac);
    b.g.position.copy(e.body.by.head.x); b.g.position.y += 0.42 * e.s;
    b.g.quaternion.copy(_q1);
  }
}
