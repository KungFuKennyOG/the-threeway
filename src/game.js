'use strict';
// ============================== game flow ===================================
const game = { state: 'menu', wave: 0, timer: 0, queue: [], spawnT: 0, catches: 0, disarms: 0, tagT: 0, bosses: [] };
function clearEnemies() { for (const e of enemies.slice()) e.remove(); player.clinchedBy = null; game.bosses = []; clearBossBars(); }
function stockProps() {
  for (const p of props.slice()) { scene.remove(p.obj); p.body.remove(); p.alive = false; }
  props.length = 0;
  for (const h of handList) { if (h.held && h.held.isProp) h.held = null; }
  for (const x of [-1.6, 0.3, 1.9]) new Prop('bottle', new V3(x, BAR.top, -3.6));
  for (const t of TABLES) new Prop('bottle', new V3(t.x + 0.1, 0.79, t.z));
  for (const x of [-2.4, -1.2, 0, 1.2, 2.4]) new Prop('stool', new V3(x, 0, -2.95));
  for (const t of TABLES) { new Prop('stool', new V3(t.x + 0.7, 0, t.z + 0.1)); new Prop('stool', new V3(t.x - 0.6, 0, t.z - 0.4)); }
}
function startGame() {
  level.name = 'bar'; level.encounter = -1; level.arena = null; DOOR.target = 0; DOOR.open = 0;
  clearEnemies(); stockProps();
  player.hp = CFG.player.health; player.hurtT = 0; game.catches = 0; game.disarms = 0;
  game.wave = 0; startWave(0);
}
function startWave(i) {
  game.wave = i; game.state = 'intro'; game.timer = 0;
  game.queue = CFG.waves[i].slice(); game.spawnT = 0.8; game.bosses = []; game.tagT = 0;
  roundSignMat.uniforms.map.value = tex('round' + (i + 1));
  showSign('round' + (i + 1), 2.0);
  AU.bell();
}
function loseRound() {
  if (game.state !== 'fight') return;
  game.state = 'lost'; game.timer = 0; player.clinchedBy = null;
  showSign('down', 3.5);
}
function updateGame(dt) {
  game.timer += dt;
  if (STAGES.has(level.name)) { updateStreet(dt); return; }
  if (game.state === 'won') {   // bar cleared: the door swings open; walk out onto the square
    if (game.timer > 2.5 && DOOR.target === 0) { DOOR.target = 1; showSign('doorOpen', 3.0); AU.bell(); }
    if (DOOR.open > 0.6 && player.head.z > STREET.fz + 0.4) startStreet(true);
    return;
  }
  if (game.state === 'intro') {
    if (game.timer > 2.0) {
      game.state = 'fight'; game.timer = 0;
      if (CFG.waves[game.wave].some(t => CFG.enemies[t].boss)) { showSign('boss', 2.2); AU.roar(); MUSIC.cue('boss'); } else showSign('fight', 1.2);
    }
    return;
  }
  if (game.state === 'fight') {
    game.spawnT -= dt;
    if (game.queue.length && game.spawnT <= 0) {
      const e = new Enemy(game.queue.shift());
      e.placeAt(rand(-0.3, 0.3), 4.4, Math.PI);
      e.target.set(rand(-2.2, 2.2), 0, rand(1.6, 3.2));
      enemies.push(e); game.spawnT = 1.3;
      if (e.cfg.boss) { e.benched = game.bosses.length > 0; game.bosses.push(e); addBossBar(e); }
    }
    updateDuo(dt);
    if (!game.queue.length && enemies.every(e => !e.alive)) {
      if (game.wave < CFG.waves.length - 1) { game.state = 'cleared'; game.timer = 0; showSign('ko', 2.0); }
      else { game.state = 'won'; game.timer = 0; showSign('clear', 2.5); AU.bell(); }
    }
    return;
  }
  if (game.state === 'cleared' && game.timer > 3.0) { player.hp = Math.min(CFG.player.health, player.hp + 20); startWave(game.wave + 1); }
  if (game.state === 'lost' && game.timer > 3.5) {
    clearEnemies(); stockProps(); player.hp = CFG.player.health; startWave(game.wave);
  }
}
