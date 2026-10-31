'use strict';
// ============================== HUD (desktop) ===============================
const hudEl = document.getElementById('hud'), hpFill = document.getElementById('hpFill'), infoEl = document.getElementById('info');
function updateHud(dt) {
  player.hurtT = Math.max(0, player.hurtT - dt * 1.6);
  const low = player.hp < 40 ? (40 - player.hp) / 40 * 0.45 : 0;
  const clinch = player.clinchedBy ? 0.45 + 0.2 * Math.sin(NOW * 10) : 0;
  vigMat.uniforms.uAmt.value = clamp(Math.max(player.hurtT, low, clinch), 0, 1);
  const frac = player.hp / CFG.player.health;
  wristBar.userData.fill.scale.x = Math.max(0.001, 0.1 * frac);
  wristBar.userData.fill.position.x = -0.05 * (1 - frac);
  if (!xrMode && hudEl) {
    hpFill.style.width = (frac * 100).toFixed(0) + '%';
    const t = lastHit ? `${lastHit.tier.toUpperCase()} · ${lastHit.speed.toFixed(1)} m/s · ${lastHit.zone} · ${lastHit.dmg} dmg` : 'Punch something.';
    const bosses = game.bosses.filter(e => e.alive).map(e => `${e.type.toUpperCase()} ${Math.max(0, Math.ceil(e.hp))}${e.benched ? ' (waiting)' : ''}${e.enraged ? ' (ENRAGED)' : ''}`).join(' · ');
    const street = STAGES.has(level.name), E = stageCfg().encounters, LD = LEVELS[level.name], sb = !!LD, LH = (LD && LD.hud) || {};
    const wave = street ? (game.state === 'won' ? (sb ? (LH.won || 'Cleared — walk on (R to restart)') : 'Checkpoint reached — walk through, or R to restart the street') : game.state === 'lost' ? 'You got tossed' : game.state === 'walk' ? (sb ? (level.encounter + 1 < E.length ? (LH.walk || 'Walk on') : (LH.last || LH.walk || 'Walk on')) : level.encounter + 1 < E.length ? 'Tripoint Square — head down the road' : 'Walk up to the checkpoint') : `${level.name === 'depot' ? 'Depot' : sb ? (LH.short || LD.name) : 'Street'} ${level.encounter + 1} / ${E.length}`)
      : game.state === 'won' ? (DOOR.target ? 'Bar cleared — walk out the door (R to restart)' : 'Bar cleared') : game.state === 'lost' ? 'You got tossed' : `Round ${game.wave + 1} / ${CFG.waves.length}${bosses ? '  ·  ' + bosses : ''}`;
    const held = hands.right.held ? (hands.right.held.isProp ? `Holding: ${hands.right.held.type}` : 'Holding a goon — Q to throw') : '';
    infoEl.textContent = `${wave}   ·   ${t}${held ? '   ·   ' + held : ''}${player.clinchedBy ? '   ·   CLINCHED: punch his arms or G to headbutt' : ''}`;
  }
}

// ============================== perf: readout, auto quality, tuning =========
const perf = { fps: 72, frameEma: 1 / 72, physMs: 0, calls: 0, level: 0, slowT: 0, fastT: 0, drops: 0, drawT: 0,
  btnX: false, stickY: 0, repeatT: 0 };
const perfEl = document.getElementById('perf');
const TUNE = [
  { name: 'auto qual', get: () => CFG.perf.autoQuality ? 1 : 0, set: (v) => { CFG.perf.autoQuality = !!v; if (!v) setQuality(0); }, step: 1, min: 0, max: 1, fmt: (v) => v ? 'on' : 'off' },
  { name: 'pull', get: () => CFG.physics.activePull, set: (v) => { CFG.physics.activePull = v; }, step: 0.05, min: 0.05, max: 0.8, fmt: (v) => v.toFixed(2) },
  { name: 'hit shove', get: () => CFG.physics.hitShoveMult, set: (v) => { CFG.physics.hitShoveMult = v; }, step: 0.1, min: 0.3, max: 2.5, fmt: (v) => 'x' + v.toFixed(1) },
  { name: 'knockback', get: () => CFG.reactions.knockbackMult, set: (v) => { CFG.reactions.knockbackMult = v; }, step: 0.25, min: 0.5, max: 5, fmt: (v) => v.toFixed(2) },
  { name: 'fist pitch', get: () => CFG.hands.modelPitchDeg, set: (v) => { CFG.hands.modelPitchDeg = v; if (xrMode) for (const h of handList) attachHandVR(h); }, step: 5, min: -70, max: 20, fmt: (v) => v + 'deg' },
  { name: 'snap', get: () => CFG.render.vrSnapLines, set: (v) => { CFG.render.vrSnapLines = v; CFG.render.desktopSnapLines = v + 40; setRenderMode(xrMode); }, step: 40, min: 240, max: 1200, fmt: (v) => String(v), oldDefaults: [560] },   // a save holding an old default isn't a choice: the new default stands
];
function setQuality(level) {
  const L = CFG.perf.levels[level]; perf.level = level;
  CFG.physics.hz = L[0]; CFG.physics.iterations = L[1];
}
function saveTune() { try { localStorage.setItem('tw.tune', JSON.stringify(TUNE.map(t => t.get()))); } catch (e) { /* private mode */ } }
function loadTune() {
  try { const v = JSON.parse(localStorage.getItem('tw.tune') || 'null'); if (Array.isArray(v)) v.forEach((x, i) => { const T = TUNE[i]; if (T && typeof x === 'number' && !(T.oldDefaults || []).includes(x)) T.set(x); }); } catch (e) { /* none saved */ }
}
function togglePerfPanel() {
  perfPanel.open = !perfPanel.open; perf.drawT = 0;
  if (perfPanel.mesh) perfPanel.mesh.visible = perfPanel.open && xrMode;
  if (perfEl) perfEl.hidden = !perfPanel.open || xrMode;
}
function tuneSelect(d) { perfPanel.row = (perfPanel.row + d + TUNE.length) % TUNE.length; perf.drawT = 0; }
function tuneAdjust(d) {
  const t = TUNE[perfPanel.row];
  const v = clamp(Math.round((t.get() + d * t.step) / t.step) * t.step, t.min, t.max);
  t.set(+v.toFixed(3)); saveTune(); perf.drawT = 0;
}
function perfLines() {
  const L = CFG.perf.levels[perf.level];
  const lines = [`${perf.fps.toFixed(0)} fps  ${perf.physMs.toFixed(1)} ms phys`, `${perf.calls} calls  Q${perf.level} ${L[0]}Hz x${L[1]}`];
  TUNE.forEach((t, i) => lines.push(`${i === perfPanel.row ? '>' : ' '}${t.name.padEnd(10)}${t.fmt(t.get())}`));
  return lines;
}
function updatePerf(dt, physMs) {
  perf.frameEma += (dt - perf.frameEma) * 0.1; perf.fps = 1 / Math.max(1e-4, perf.frameEma);
  perf.physMs += (physMs - perf.physMs) * 0.1;
  if (renderer.info && renderer.info.render) perf.calls = renderer.info.render.calls;
  const P = CFG.perf;
  if (P.autoQuality && game.state !== 'menu') {
    const target = xrMode ? P.targetVR : P.targetDesktop;
    if (perf.fps < target * 0.9) { perf.slowT += dt; perf.fastT = 0; }
    else if (perf.fps > target * 0.97) { perf.fastT += dt; perf.slowT = 0; }
    if (perf.slowT > P.dropAfter && perf.level < P.levels.length - 1) { setQuality(perf.level + 1); perf.slowT = 0; perf.drops++; }
    if (perf.fastT > P.raiseAfter * (1 + perf.drops) && perf.level > 0) { setQuality(perf.level - 1); perf.fastT = 0; }   // back off if it keeps sagging
  }
  // VR: left X toggles the wrist panel; while it's open the left stick tunes instead of walking
  if (xrMode) {
    const gp = hands.left.source && hands.left.source.gamepad;
    if (gp) {
      const x = !!(gp.buttons[4] && gp.buttons[4].pressed);
      if (x && !perf.btnX && !menuOpen() && MENU.cool <= 0) togglePerfPanel();   // (X chooses in menus)
      perf.btnX = x;
      if (perfPanel.open && gp.axes.length >= 4) {
        const sx = gp.axes[2], sy = gp.axes[3];
        if (Math.abs(sy) > 0.6 && Math.abs(perf.stickY) <= 0.6) tuneSelect(sy > 0 ? 1 : -1);
        perf.stickY = sy;
        perf.repeatT -= dt;
        if (Math.abs(sx) > 0.6 && perf.repeatT <= 0) { tuneAdjust(sx > 0 ? 1 : -1); perf.repeatT = 0.25; }
        if (Math.abs(sx) < 0.3) perf.repeatT = 0;
      }
    }
  }
  if (!perfPanel.open) return;
  perf.drawT -= dt; if (perf.drawT > 0) return;
  perf.drawT = 1 / P.panelHz;
  const lines = perfLines();
  if (xrMode && perfPanel.ctx) {
    const c = perfPanel.ctx;
    c.fillStyle = '#140b12'; c.fillRect(0, 0, 128, 96);
    c.strokeStyle = '#33e0d0'; c.strokeRect(0.5, 0.5, 127, 95);
    c.font = '9px monospace'; c.textBaseline = 'top';
    lines.forEach((s, i) => { c.fillStyle = i < 2 ? '#33e0d0' : (s[0] === '>' ? '#ff9a3c' : '#f2ede4'); c.fillText(s, 4, 3 + i * 11); });
    perfPanel.texture.needsUpdate = true;
  } else if (perfEl) perfEl.textContent = lines.join('\n') + '\n[ ] select  - = adjust  P close';
}
