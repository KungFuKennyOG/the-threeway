'use strict';
// ============================== frame loop ==================================
function setRenderMode(vr) {
  const R = CFG.render;
  SU.uSnap.value = (vr ? R.vrVertexSnap : R.desktopVertexSnap) ? 1 : 0;
  SU.uAffine.value = (vr ? R.vrAffine : R.desktopAffine) ? 1 : 0;
  SU.uDither.value = R.ditherStrength > 0 ? 1 : 0;
  SU.uLevels.value = Math.pow(2, R.colorBits) - 1; SU.uDitherAmt.value = R.ditherStrength;
  if (vr) SU.uSnapRes.value.set(R.vrSnapLines * 0.9 / 2, R.vrSnapLines / 2);   // ~square per-eye view
  else { const a = innerWidth / innerHeight; SU.uSnapRes.value.set(R.desktopSnapLines * a / 2, R.desktopSnapLines / 2); }
}
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(CFG.render.desktopLines / h);
  renderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  SU.uSnapRes.value.set(CFG.render.desktopSnapLines * w / h / 2, CFG.render.desktopSnapLines / 2);
}
addEventListener('resize', () => { if (!xrMode) resize(); });

let lastT = performance.now(), neonT = 0, neonDim = true;
function frame() {
  const t = performance.now();
  const rdt = Math.min(0.05, (t - lastT) / 1000); lastT = t;
  updateMenus(rdt);                          // title / pause screens (src/menu.js)
  const frozen = menuFreezes(), dt = frozen ? 0 : rdt;   // paused: the world holds still
  NOW += dt;
  let physMs = 0;
  if (game.state !== 'menu' && !frozen) {
    if (!xrMode) updateDesktopHands(dt);
    updateLocomotion(dt);
    updateDoors(dt);                                  // building entrances swing open once their fight's cleared (src/doors.js)
    if (xrMode && renderer.xr.isPresenting && renderer.xr.updateCamera) renderer.xr.updateCamera(camera);
    scene.updateMatrixWorld();
    updateKinematics(NOW);
    updateGripInput();
    for (const e of enemies.slice()) e.update(dt);   // AI + animation targets
    updateProps(dt);                                  // held props ride the hands
    const t0 = performance.now();
    updatePhysics(dt);                                // ragdolls, props, collisions
    physMs = performance.now() - t0;
    updateProjectiles();                              // kitchenware vs your head, forearms, hands
    for (const e of enemies) e.drawParts();
    for (const p of props) p.render();
    scene.updateMatrixWorld();
    checkPlayerHits(NOW);
    updateGame(dt);
  }
  updateArea(dt);
  updatePropBatches();
  updateBossBars();
  updateFx(dt);
  updateHud(dt);
  updatePerf(rdt, physMs);
  // neon: one letter flickers
  neonT -= dt;
  if (neonT <= 0 && !frozen) { neonDim = !neonDim; neonT = neonDim ? rand(0.05, 0.2) : rand(0.6, 3.5); neonMat.uniforms.map.value = tex(neonDim ? 'neon_tw' : 'neon_tw_on'); }
  renderer.render(scene, camera);
}

// ============================== boot ========================================
function boot() {
  // image sizes for sprites
  for (const k of Object.keys(TEX)) {
    if (!k.startsWith('fx_') && !k.startsWith('sign_')) continue;
    const img = new Image(); img.onload = () => { imgSize[k] = [img.width, img.height]; }; img.src = TEX[k];
  }
  const n0 = scene.children.length;
  buildRoom();
  ST.barGroup = scene.children.slice(n0);   // portal culling: the bar's meshes
  buildStreet(); buildBoom(); indexWorld();
  ST.streetGroup = [ST.litMesh, ST.skylineMesh, ST.skyMesh, boomPivot];
  // rooms: the bar and the levels' insides are interiors; everything else is outside (src/rooms.js)
  addRoom('bar', (p) => p.z < STREET.fz - 0.05 && p.z > -5.6 && Math.abs(p.x) < 5.6);
  for (const D of levelList()) if (D.rooms) D.rooms();
  addRoom('outside', () => true);
  roomMeshes('bar', ...ST.barGroup);
  roomMeshes('outside', ...ST.streetGroup, ST.beaconMesh, ...levelList().flatMap(D => D.outside ? D.outside() : []));
  addPortal('bar', 'outside', [0, 1.2, STREET.fz], () => DOOR.open > 0.02);
  for (const h of handList) { h.anchor.rotation.order = 'XYZ'; h.anchor.position.set(...DH.guard[h.side]); }
  attachHandsDesktop();
  rig.position.set(0, 0, -1.4); rig.rotation.y = Math.PI;
  camera.position.set(0, CFG.player.standHeight, 0);
  setRenderMode(false); resize();
  stockProps();
  loadTune();
  renderer.setAnimationLoop(frame);
  window.__tw = { CFG, game, player, enemies, props, bodies, hands, scene, camera, rig, renderer, playerHit, startGame, Enemy, Prop, updatePhysics,
    perf, perfPanel, TUNE, bossBars, roomTris: () => roomTris, level, startStreet, STREET, ST, WALK, DOOR, keepInWalk, pushOutXZ, WORLD_BOXES, BLOCKERS, desk, SB, SBX, startSuperblock, PZ, LIFTS, CRADLE, LOCKED, startPodezd, LEVELS, ROOMS, roomState, updateRooms, MENU, MP, openTitle, openPause, closeMenu, startStage, menuChoose, menuMove, OPTS };
}

const levelSel = document.getElementById('levelSel');
if (levelSel && document.createElement) {   // the registered levels join the menu
  for (const D of levelList()) if (D.menu) { const o = document.createElement('option'); o.value = D.name; o.textContent = D.menu; levelSel.appendChild(o); }
}
{ const m = /[?&]level=([a-z0-9]+)/.exec((window.location && window.location.search) || ''); if (levelSel && m) levelSel.value = m[1]; }
const begin = () => startStage(levelSel ? levelSel.value : 'bar');
const menu = document.getElementById('menu'), vrBtn = document.getElementById('vrBtn'), deskBtn = document.getElementById('deskBtn'), vrNote = document.getElementById('vrNote');
deskBtn.addEventListener('click', () => {
  AU.init(); menu.hidden = true; hudEl.hidden = false; xrMode = false;
  attachHandsDesktop(); setRenderMode(false); resize();
  begin();
  if (canvas.requestPointerLock) canvas.requestPointerLock();
});
if (navigator.xr && navigator.xr.isSessionSupported) {
  navigator.xr.isSessionSupported('immersive-vr').then((ok) => {
    if (ok) { vrBtn.disabled = false; vrNote.textContent = 'Headset found.'; }
    else vrNote.textContent = 'No headset: open this page in the Quest browser to play in VR.';
  }).catch(() => { vrNote.textContent = 'WebXR unavailable here.'; });
} else vrNote.textContent = 'WebXR unavailable here: needs HTTPS and a WebXR browser.';
vrBtn.addEventListener('click', async () => {
  AU.init();
  try {
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] });
    renderer.xr.setFramebufferScaleFactor(CFG.render.vrFramebufferScale);
    await renderer.xr.setSession(session);
    xrMode = true; menu.hidden = true; hudEl.hidden = true;
    if (perfEl) perfEl.hidden = true; if (perfPanel.mesh) perfPanel.mesh.visible = perfPanel.open;
    setRenderMode(true);
    for (const h of handList) { h.anchor.position.set(0, 0, 0); attachHandVR(h); }
    camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0);
    rig.position.set(0, 0, -1.4); rig.rotation.set(0, Math.PI, 0);
    openTitle();          // the in-VR title screen; START (or a stage) from there
    watchSession(session);
    session.addEventListener('end', () => {
      if (MENU.open) closeMenu(); MENU.fade = null; if (MP.fadeMesh) MP.fadeMesh.visible = false;
      xrMode = false; menu.hidden = false; hudEl.hidden = true; game.state = 'menu';
      clearEnemies(); for (const h of handList) { if (h.held) releaseHeld(h); h.anchor.rotation.set(DH.guard.rx * DEG, 0, 0); h.anchor.position.set(...DH.guard[h.side]); }
      attachHandsDesktop(); setRenderMode(false); resize();
      camera.position.set(0, CFG.player.standHeight, 0);
    });
  } catch (err) { vrNote.textContent = 'Could not start VR: ' + err.message; }
});
boot();
