'use strict';
// ============================== menus: title + pause ========================
// Arcade-style screens drawn into a canvas and shown on a floating CRT panel in front of you (VR), or as an overlay on the
// page (desktop pause). Controller only: either stick up/down picks, A / X / trigger chooses, B / Y goes back.
//   VR title: shown when you enter VR (you stand in the empty bar). INSERT COIN, then START / STAGE SELECT / OPTIONS / ...
//   Pause:    the left controller's menu button (≡), or Y. Quest Browser keeps ≡ for itself (it opens its own menu and blurs
//             the session), so a blur pauses too: close the browser's menu and ours is waiting.
//   Desktop:  Esc (or losing the mouse lock) pauses; arrows / WASD pick, Enter / Space choose, Esc / Backspace back.
const MENU = { open: null, screen: 'attract', stack: [], sel: 0, credits: 0, t: 0, idleT: 0, cool: 0, dirty: true,
  placed: false, waitT: 0, fade: null, rep: { t: 0, dir: 0 }, prev: {}, wasBlurred: false };
const menuOpen = () => !!MENU.open;
const menuFreezes = () => MENU.open === 'pause' || !!(MENU.fade && MENU.fade.freeze);
const MW = 512, MH = 384;                     // canvas pixels (4:3 CRT)
const PANEL = { w: 1.2, h: 0.9, dist: 1.6 };  // metres

// ---- options (saved per browser)
const BASE_SPEED = CFG.move.speed;
const SPEEDS = [['SLOW', 0.75], ['NORMAL', 1], ['FAST', 1.3]], SNAPS = [15, 30, 45, 60];
const OPTS = { vol: 6, snap: CFG.move.snapTurnDeg, speed: 1 };
function applyOpts() {
  CFG.move.snapTurnDeg = OPTS.snap; CFG.move.speed = BASE_SPEED * SPEEDS[OPTS.speed][1];
  if (AU.master) AU.master.gain.value = 0.1 * OPTS.vol;
}
function saveOpts() { try { localStorage.setItem('tw.opts', JSON.stringify(OPTS)); } catch (e) { /* private mode */ } }
try { const o = JSON.parse(localStorage.getItem('tw.opts') || 'null'); if (o) Object.assign(OPTS, o); } catch (e) { /* none saved */ }
if (!SNAPS.includes(OPTS.snap)) OPTS.snap = 30;
OPTS.speed = clamp(OPTS.speed | 0, 0, 2); OPTS.vol = clamp(OPTS.vol | 0, 0, 10);
applyOpts();
{ const init = AU.init; AU.init = function () { init.call(this); applyOpts(); }; }
Object.assign(AU, {
  blip() { this.tone('square', 880, 880, 0.04, 0.08); },
  pick() { this.tone('square', 660, 660, 0.06, 0.12); this.tone('square', 990, 990, 0.1, 0.12, 0.06); },
  back() { this.tone('square', 520, 340, 0.1, 0.1); },
  coin() { this.tone('square', 988, 988, 0.08, 0.15); this.tone('square', 1319, 1319, 0.5, 0.15, 0.08); },
  pause() { this.tone('square', 784, 784, 0.07, 0.12); this.tone('square', 523, 523, 0.12, 0.12, 0.08); },
});

// ---- stages: the bar, the street, then every registered level (by its menu number)
function stageList() {
  const L = [{ name: 'bar', n: 1, title: 'THE THREEWAY' }, { name: 'street', n: 2, title: 'TRIPOINT SQUARE' }];
  for (const D of levelList()) if (D.menu) {
    const m = /^(\d+)\s*·\s*(.*)$/.exec(D.menu);
    L.push({ name: D.name, n: m ? +m[1] : L.length + 1, title: (m ? m[2] : D.menu).replace(/\s*\(.*\)\s*/, '').toUpperCase() });
  }
  L.sort((a, b) => a.n - b.n);
  for (const s of L) if (s.title.length > 22) s.title = s.title.replace(/^THE /, '');   // fit the row
  for (const s of L) s.act = s.n <= 2 ? 'PROLOGUE - THE OLD QUARTER' : 'ACT 1 - KRASNOVIA';
  return L;
}
function startStage(name) {   // begin a stage from a menu (also the HTML menu's "Start at")
  MENU.cool = 0.4;
  if (name === 'street') startStreet(false);
  else if (LEVELS[name]) LEVELS[name].start(false);
  else {
    if (level.name !== 'bar' || game.state === 'menu') { rig.position.y = 0; player.floorY = 0; placePlayer(0, -1.4, Math.PI); }
    startGame();
  }
}
const pickedStage = () => { const s = typeof levelSel !== 'undefined' && levelSel && levelSel.value; return s && (s === 'bar' || s === 'street' || LEVELS[s]) ? s : 'bar'; };

// ---- screens
const HOWTO_VR = [['SWING FOR REAL', 'SPEED = DAMAGE'], ['FOREARMS UP', 'BLOCK'], ['DUCK OR LEAN', 'DODGE'], ['HIT THE ARM LATE', 'PARRY'],
  ['GRIP', 'GRAB / CATCH'], ['LET GO MID-SWING', 'THROW'], ['BOTTLE TO MOUTH', 'DRINK'], ['LEFT STICK', 'WALK'], ['RIGHT STICK', 'TURN'], ['MENU OR Y', 'PAUSE']];
const HOWTO_DESK = [['MOUSE', 'LOOK'], ['WASD', 'WALK'], ['CLICK / J K', 'PUNCH'], ['SHIFT', 'HEAVY'], ['SPACE', 'BLOCK'], ['C', 'DUCK'],
  ['G', 'HEADBUTT'], ['E / Q', 'GRAB / THROW'], ['F', 'DRINK'], ['ESC', 'PAUSE']];
const STORY = ['ONE CITY. THREE POWERS. THREE WALLS.', 'THEY ALL DRINK AT ONE BAR:', 'THE THREEWAY, ON THE TRIPOINT.', '',
  'NOW THE OFFICIALS WANT IT SHUT.', 'THEIR MUSCLE JUST WALKED IN.', '', 'THROW THEM OUT. THEN GO GET', 'THREE SIGNATURES TO REOPEN.'];
const optItems = () => [
  { label: 'VOLUME', val: () => OPTS.vol, bar: 10, adj: (d) => { OPTS.vol = clamp(OPTS.vol + d, 0, 10); } },
  { label: 'SNAP TURN', val: () => OPTS.snap + ' DEG', adj: (d) => { OPTS.snap = SNAPS[(SNAPS.indexOf(OPTS.snap) + d + SNAPS.length) % SNAPS.length]; } },
  { label: 'MOVE SPEED', val: () => SPEEDS[OPTS.speed][0], adj: (d) => { OPTS.speed = (OPTS.speed + d + 3) % 3; } },
  { label: 'BACK', act: menuBack },
];
const SCREENS = {
  attract: { items: () => [] },
  main: { title: 'MAIN MENU', items: () => [
    { label: pickedStage() === 'bar' ? 'START' : 'START: STAGE ' + (stageList().find(s => s.name === pickedStage()) || { n: 1 }).n, act: () => beginFromTitle(pickedStage()) },
    { label: 'STAGE SELECT', act: () => menuGo('stages') },
    { label: 'OPTIONS', act: () => menuGo('options') },
    { label: 'HOW TO PLAY', act: () => menuGo('howto') },
  ].concat(xrMode ? [{ label: 'EXIT VR', act: exitVR }] : []) },
  stages: { title: 'STAGE SELECT', rowH: 26, items: () => stageList().map(s => ({ label: s.title, num: s.n, sub: s.act,
    act: () => MENU.open === 'title' ? beginFromTitle(s.name) : fadeThen(() => { closeMenu(); startStage(s.name); }) }))
    .concat([{ label: 'BACK', act: menuBack }]) },
  options: { title: 'OPTIONS', items: optItems },
  howto: { title: 'HOW TO PLAY', items: () => [{ label: 'BACK', act: menuBack }] },
  pause: { title: 'PAUSED', items: () => [
    { label: 'RESUME', act: closeMenu },
    { label: 'RESTART STAGE', act: () => { const n = level.name; fadeThen(() => { closeMenu(); startStage(n); }); } },
    { label: 'STAGE SELECT', act: () => menuGo('stages') },
    { label: 'OPTIONS', act: () => menuGo('options') },
    { label: 'HOW TO PLAY', act: () => menuGo('howto') },
    { label: 'QUIT TO TITLE', act: () => fadeThen(quitToTitle) },
  ] },
};
const curItems = () => SCREENS[MENU.screen].items();

// ---- navigation
function menuGo(s) { MENU.stack.push([MENU.screen, MENU.sel]); MENU.screen = s; MENU.sel = 0; MENU.dirty = true; AU.pick(); }
function menuBack() {
  if (MENU.screen === 'options') saveOpts();
  if (MENU.stack.length) { [MENU.screen, MENU.sel] = MENU.stack.pop(); MENU.dirty = true; AU.back(); return; }
  if (MENU.open === 'pause') closeMenu();
  else if (MENU.open === 'title' && MENU.screen === 'main') { MENU.screen = 'attract'; MENU.dirty = true; AU.back(); }
}
function menuMove(d) {
  const n = curItems().length; if (!n) return;
  MENU.sel = (MENU.sel + d + n) % n; MENU.dirty = true; AU.blip(); menuBuzz(0.15, 15);
}
function menuAdjust(d) { const it = curItems()[MENU.sel]; if (it && it.adj) { it.adj(d); applyOpts(); MENU.dirty = true; AU.blip(); } }
function menuChoose() {
  MENU.idleT = 0;
  if (MENU.screen === 'attract') { MENU.credits = Math.min(9, MENU.credits + 1); AU.coin(); MENU.screen = 'main'; MENU.sel = 0; MENU.dirty = true; menuBuzz(0.4, 40); return; }
  const it = curItems()[MENU.sel]; if (!it) return;
  menuBuzz(0.3, 30);
  if (it.adj && !it.act) { menuAdjust(1); return; }
  AU.pick(); it.act();
}
function menuBuzz(i, ms) { if (xrMode) for (const h of handList) buzz(h, i, ms); }

// ---- open / close
function openTitle() {
  clearEnemies(); MENU.open = 'title'; MENU.screen = 'attract'; MENU.stack = []; MENU.sel = 0; MENU.t = 0; MENU.idleT = 0;
  MENU.placed = false; MENU.waitT = 0; MENU.dirty = true; game.state = 'menu';
  showPanel(true, false);
}
function openPause() {
  if (MENU.open || game.state === 'menu' || MENU.fade) return;
  MENU.open = 'pause'; MENU.screen = 'pause'; MENU.stack = []; MENU.sel = 0; MENU.dirty = true; MENU.placed = false;
  AU.pause(); menuBuzz(0.3, 40);
  showPanel(true, true);
  if (!xrMode && document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
}
function closeMenu() {
  if (MENU.screen === 'options' || MENU.stack.some(s => s[0] === 'options')) saveOpts();
  const wasPause = MENU.open === 'pause';
  MENU.open = null; MENU.stack = []; MENU.cool = 0.4; showPanel(false);
  if (wasPause && !xrMode && canvas.requestPointerLock) try { canvas.requestPointerLock(); } catch (e) { /* needs a click */ }
}
function beginFromTitle(name) {
  MENU.credits = Math.max(0, MENU.credits - 1);
  fadeThen(() => { closeMenu(); startStage(name); });
}
function quitToTitle() {
  closeMenu(); clearEnemies();
  level.name = 'bar'; level.encounter = -1; level.arena = null; DOOR.target = 0; DOOR.open = 0;
  if (typeof LOCKED !== 'undefined') LOCKED.clear();
  stockProps(); player.hp = CFG.player.health; player.hurtT = 0; player.clinchedBy = null;
  for (const h of handList) if (h.held) releaseHeld(h);
  rig.position.y = 0; player.floorY = 0; placePlayer(0, -1.4, Math.PI);
  if (xrMode) openTitle();
  else {   // desktop: back to the page's menu
    game.state = 'menu';
    const m = document.getElementById('menu'); if (m) m.hidden = false;
    if (hudEl) hudEl.hidden = true;
    if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
  }
}
function exitVR() { const s = renderer.xr.getSession && renderer.xr.getSession(); if (s && s.end) s.end(); }
function fadeThen(cb) { MENU.fade = { a: 0, dir: 1, cb, freeze: true }; }

// ---- the panel (VR) and the overlay (desktop)
const MP = { cv: null, ctx: null, tex: null, mesh: null, dim: null, fadeMesh: null, logo: null, logoOk: false };
{
  try { MP.cv = document.createElement('canvas'); MP.cv.width = MW; MP.cv.height = MH; MP.ctx = MP.cv.getContext('2d'); } catch (e) { MP.ctx = null; }
  if (MP.ctx && THREE.CanvasTexture) {
    const t = MP.tex = new THREE.CanvasTexture(MP.cv);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = false;   // (the game's v runs down)
    const m = makeMat('black', { emissive: true, fog: false, depthTest: false, side: THREE.DoubleSide });
    m.uniforms.map.value = t;
    MP.mesh = new THREE.Mesh(planeGeo, m);
    MP.mesh.scale.set(PANEL.w, PANEL.h, 1); MP.mesh.renderOrder = 1000; MP.mesh.visible = false; MP.mesh.frustumCulled = false;
    scene.add(MP.mesh);
    if (MP.cv.style !== undefined) MP.cv.id = 'menuCv';
  }
  try { MP.logo = new Image(); MP.logo.onload = () => { MP.logoOk = true; MENU.dirty = true; }; MP.logo.src = 'assets/menu_logo.png'; } catch (e) { MP.logo = null; }
  if (typeof document.fonts !== 'undefined' && document.fonts.load) document.fonts.load('16px "Press Start 2P"').then(() => { MENU.dirty = true; }).catch(() => {});
}
// head-locked dithered layers: a dim behind the pause panel, and a black fade for stage changes
function ditherLayer(r, g, b, order) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uAmt: { value: 0 } },
    vertexShader: 'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uAmt;
      const float BAYER[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
      void main(){ int ix = int(mod(gl_FragCoord.x, 4.0)); int iy = int(mod(gl_FragCoord.y, 4.0));
        if (uAmt * 16.0 <= BAYER[ix + iy * 4] + 0.5) discard; gl_FragColor = vec4(${r}, ${g}, ${b}, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m);
  mesh.position.z = -0.2; mesh.renderOrder = order; mesh.frustumCulled = false; mesh.visible = false;
  camera.add(mesh);
  return mesh;
}
MP.dim = ditherLayer('0.04', '0.02', '0.04', 990);
MP.fadeMesh = ditherLayer('0.0', '0.0', '0.0', 1010);
function showPanel(on, dim) {
  const desktopOverlay = !xrMode && MENU.open === 'pause';
  if (MP.mesh) MP.mesh.visible = !!on && !desktopOverlay;
  MP.dim.visible = !!on && !!dim && !desktopOverlay; MP.dim.material.uniforms.uAmt.value = 0.55;
  if (MP.cv && MP.cv.style !== undefined && document.body) {   // desktop pause: the same canvas, as an overlay on the page
    if (on && desktopOverlay) { if (!MP.cv.parentNode) document.body.appendChild(MP.cv); MP.cv.hidden = false; }
    else MP.cv.hidden = true;
  }
}
function placePanel() {   // in front of your head (level, at eye height), facing you
  camera.getWorldPosition(_v1); camera.getWorldDirection(_v2); _v2.y = 0;
  if (_v2.lengthSq() < 1e-4) _v2.set(0, 0, 1); _v2.normalize();
  MP.mesh.position.set(_v1.x + _v2.x * PANEL.dist, _v1.y - 0.1, _v1.z + _v2.z * PANEL.dist);
  MP.mesh.rotation.set(0, Math.atan2(-_v2.x, -_v2.z), 0);
  MENU.placed = true;
}

// ---- drawing
const C = { bg: '#0b0610', ink: '#f2ede4', muted: '#8f7f8a', pink: '#ff4f9a', teal: '#33e0d0', sodium: '#ff9a3c', red: '#e8352b' };
function txt(c, s, x, y, size, col, align = 'left') {
  c.font = `${size}px "Press Start 2P", monospace`; c.textAlign = align; c.textBaseline = 'top';
  c.fillStyle = '#000'; c.fillText(s, x + (size >= 16 ? 2 : 1), y + (size >= 16 ? 2 : 1));
  c.fillStyle = col; c.fillText(s, x, y);
}
const blink = (hz = 2) => Math.floor(MENU.t * hz) % 2 === 0;
function drawMenu() {
  const c = MP.ctx; if (!c) return;
  c.imageSmoothingEnabled = false;
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = C.bg; c.fillRect(0, 0, MW, MH);
  c.strokeStyle = C.pink; c.lineWidth = 4; c.strokeRect(6, 6, MW - 12, MH - 12);
  const S = SCREENS[MENU.screen];
  if (MENU.screen === 'attract') drawAttract(c);
  else {
    txt(c, S.title, MW / 2, 26, 16, MENU.screen === 'pause' ? C.pink : C.sodium, 'center');
    if (MENU.screen === 'pause') txt(c, stageName(level.name), MW / 2, 52, 8, C.muted, 'center');
    if (MENU.screen === 'main' && MP.logoOk) c.drawImage(MP.logo, MW / 2 - 81, 44, 162, 60);
    if (MENU.screen === 'howto') drawHowto(c);
    const items = curItems(), rowH = S.rowH || 30;
    let y0 = MENU.screen === 'main' ? 128 : MENU.screen === 'howto' ? MH - 72 : MENU.screen === 'stages' ? 84 : 96;
    items.forEach((it, i) => {
      const y = y0 + i * rowH, on = i === MENU.sel;
      if (on) { c.fillStyle = C.pink; c.fillRect(40, y - 6, MW - 80, 28); if (blink(3)) txt(c, '>', 48, y, 16, '#14060c'); }
      const col = on ? '#14060c' : C.ink;
      if (it.num != null) { txt(c, String(it.num), 76, y, 16, on ? '#14060c' : C.sodium); txt(c, it.label, 108, y, 16, col); }
      else txt(c, it.label, it.val ? 76 : MW / 2, y, 16, col, it.val ? 'left' : 'center');
      if (it.val) {
        if (it.bar) for (let k = 0; k < it.bar; k++) { c.fillStyle = k < it.val() ? (on ? '#14060c' : C.teal) : (on ? '#a8306a' : '#2a1824'); c.fillRect(300 + k * 14, y + 2, 10, 12); }
        else txt(c, '< ' + it.val() + ' >', MW - 60, y, 16, on ? '#14060c' : C.teal, 'right');
      }
    });
    const cur = items[MENU.sel];
    if (MENU.screen === 'stages' && cur && cur.sub) txt(c, cur.sub, MW / 2, 52, 8, C.teal, 'center');
    const hint = MENU.screen === 'options' ? 'STICK: PICK / CHANGE   B: BACK' : xrMode ? 'STICK: PICK   A: CHOOSE   B: BACK' : 'ARROWS: PICK   ENTER: CHOOSE   ESC: BACK';
    txt(c, hint, MW / 2, MH - 30, 8, C.muted, 'center');
    if (MENU.open === 'title') txt(c, 'CREDIT ' + String(MENU.credits).padStart(2, '0'), MW - 24, MH - 46, 8, C.ink, 'right');
  }
  // scanlines
  c.fillStyle = 'rgba(0,0,0,0.3)'; for (let y = 0; y < MH; y += 2) c.fillRect(0, y, MW, 1);
  if (MP.tex) MP.tex.needsUpdate = true;
}
function drawAttract(c) {
  const page = Math.floor(MENU.t / 7) % 3;
  if (page === 0) {
    if (MP.logoOk) c.drawImage(MP.logo, MW / 2 - 202, 40, 405, 150);
    else txt(c, 'THE THREEWAY', MW / 2, 100, 32, C.pink, 'center');
  } else if (page === 1) {
    txt(c, 'VOSTBURG, 1986', MW / 2, 36, 16, C.sodium, 'center');
    STORY.forEach((s, i) => txt(c, s, MW / 2, 84 + i * 18, 8, i >= 7 ? C.teal : C.ink, 'center'));
  } else { txt(c, 'HOW TO PLAY', MW / 2, 26, 16, C.sodium, 'center'); drawHowto(c); }
  if (blink()) txt(c, MENU.credits ? 'PRESS A TO START' : 'INSERT COIN: PRESS A', MW / 2, page === 0 ? 262 : MH - 72, 16, C.pink, 'center');
  txt(c, 'CREDIT ' + String(MENU.credits).padStart(2, '0'), MW - 24, MH - 30, 8, C.ink, 'right');
  txt(c, '(C) 1986 THREEWAY', 24, MH - 30, 8, C.muted);
}
function drawHowto(c) {
  (xrMode ? HOWTO_VR : HOWTO_DESK).forEach(([a, b], i) => {
    const y = 64 + i * 22;
    txt(c, a, 56, y, 8, C.ink); txt(c, '.'.repeat(Math.max(2, 40 - a.length - b.length)), 56 + a.length * 8 + 8, y, 8, C.muted);
    txt(c, b, MW - 56, y, 8, C.teal, 'right');
  });
}
function stageName(n) { const s = stageList().find(x => x.name === n); return s ? `STAGE ${s.n} - ${s.title}` : ''; }

// ---- input
const pads = () => handList.map(h => h.source && h.source.gamepad).filter(Boolean);
const pressed = (gp, i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
function edge(key, now) { const was = !!MENU.prev[key]; MENU.prev[key] = now; return now && !was; }
function menuPadInput(dt) {
  let choose = false, back = false, sy = 0, sx = 0;
  handList.forEach((h) => {
    const gp = h.source && h.source.gamepad; if (!gp) return;
    if (edge(h.side + 'trig', pressed(gp, 0))) choose = true;
    if (edge(h.side + 'a', pressed(gp, 4))) choose = true;
    if (edge(h.side + 'b', pressed(gp, 5))) back = true;
    if (h.left && edge('leftmenu', menuButton(gp))) back = back || MENU.open === 'pause';
    if (gp.axes.length >= 4) { if (Math.abs(gp.axes[3]) > Math.abs(sy)) sy = gp.axes[3]; if (Math.abs(gp.axes[2]) > Math.abs(sx)) sx = gp.axes[2]; }
  });
  // stick: one step per push, then repeat while held
  const dir = Math.abs(sy) > 0.6 ? (sy > 0 ? 1 : -1) * 1 : Math.abs(sx) > 0.6 ? (sx > 0 ? 2 : -2) : 0;
  if (dir !== MENU.rep.dir) { MENU.rep.dir = dir; MENU.rep.t = 0.4; if (dir) stickStep(dir); }
  else if (dir) { MENU.rep.t -= dt; if (MENU.rep.t <= 0) { MENU.rep.t = 0.14; stickStep(dir); } }
  if (MENU.cool > 0) return;
  if (choose) menuChoose(); else if (back) menuBack();
}
function stickStep(d) { MENU.idleT = 0; if (Math.abs(d) === 1) menuMove(d); else menuAdjust(Math.sign(d)); }
// the menu button: Quest Browser keeps it, but other browsers may pass it through past the standard buttons
function menuButton(gp) { for (let i = 6; i < gp.buttons.length; i++) if (gp.buttons[i] && gp.buttons[i].pressed) return true; return false; }
function playingPadInput() {   // while you fight: ≡ or Y pauses
  const gp = hands.left.source && hands.left.source.gamepad;
  const m = gp ? edge('leftmenu', menuButton(gp)) : false, y = gp ? edge('leftb', pressed(gp, 5)) : false;
  for (const h of handList) { const g = h.source && h.source.gamepad; if (!g) continue; MENU.prev[h.side + 'trig'] = pressed(g, 0); MENU.prev[h.side + 'a'] = pressed(g, 4); if (h.right) MENU.prev.rightb = pressed(g, 5); }
  if ((m || y) && MENU.cool <= 0 && game.state !== 'menu') openPause();
}
function menuKey(e) {   // desktop, while a menu is open
  const k = e.code;
  if (k === 'ArrowUp' || k === 'KeyW') menuMove(-1);
  else if (k === 'ArrowDown' || k === 'KeyS') menuMove(1);
  else if (k === 'ArrowLeft' || k === 'KeyA') menuAdjust(-1);
  else if (k === 'ArrowRight' || k === 'KeyD') menuAdjust(1);
  else if (k === 'Enter' || k === 'Space' || k === 'KeyE') menuChoose();
  else if (k === 'Escape' || k === 'Backspace' || k === 'KeyP') menuBack();
  if (e.preventDefault) e.preventDefault();
}
if (document.addEventListener) document.addEventListener('pointerlockchange', () => {
  if (!document.pointerLockElement && !xrMode && game.state !== 'menu' && !MENU.open && !MENU.fade) openPause();
});
function watchSession(session) {   // Quest's ≡ opens the browser's own menu, which blurs the session: pause under it
  session.addEventListener('visibilitychange', () => {
    if (session.visibilityState && session.visibilityState !== 'visible' && !MENU.open && game.state !== 'menu') openPause();
  });
}

// ---- every frame (before the game runs)
function updateMenus(dt) {
  MENU.cool = Math.max(0, MENU.cool - dt);
  if (MENU.fade) {
    const F = MENU.fade; F.a = clamp(F.a + F.dir * dt / 0.3, 0, 1);
    if (F.dir > 0 && F.a >= 1) { const cb = F.cb; F.cb = null; F.dir = -1; F.freeze = false; if (cb) cb(); }
    else if (F.dir < 0 && F.a <= 0) MENU.fade = null;
    MP.fadeMesh.visible = !!MENU.fade; MP.fadeMesh.material.uniforms.uAmt.value = MENU.fade ? MENU.fade.a : 0;
  }
  if (!MENU.open) { if (xrMode && !MENU.fade) playingPadInput(); return; }
  if (xrMode && renderer.xr.isPresenting && renderer.xr.updateCamera) renderer.xr.updateCamera(camera);
  if (game.state === 'menu') camera.getWorldPosition(player.head);   // the bar's lights and rooms follow your head
  MENU.t += dt; MENU.idleT += dt;
  if (MENU.open === 'title' && MENU.screen !== 'attract' && MENU.idleT > 45) { MENU.screen = 'attract'; MENU.stack = []; MENU.dirty = true; }
  if (MP.mesh && !MENU.placed) { MENU.waitT += dt; camera.getWorldPosition(_v1); if (!xrMode || _v1.y - rig.position.y > 0.5 || MENU.waitT > 0.5) placePanel(); }
  if (xrMode && !MENU.fade) menuPadInput(dt);
  // redraw on change and on each blink / attract page
  const tick = Math.floor(MENU.t * 6);
  if (MENU.dirty || tick !== MENU.tick) { MENU.tick = tick; MENU.dirty = false; drawMenu(); }
}
