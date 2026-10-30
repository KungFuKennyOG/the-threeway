'use strict';
// ============================== FX sprites ==================================
const fxList = [];
const SPRITE_PX = 0.01;          // metres per sprite pixel
const planeGeo = new THREE.PlaneGeometry(1, 1);
// PlaneGeometry UVs have v=1 at the top; our textures are flipY=false, so flip v.
(() => { const uv = planeGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i)); })();
const imgSize = {};
function spriteMat(name, onTop) { return sharedMat(name, { emissive: true, fog: false, depthTest: !onTop, side: THREE.DoubleSide }); }
function fx(frames, pos, o = {}) {
  const m = new THREE.Mesh(planeGeo, spriteMat(frames[0], o.onTop));
  m.renderOrder = o.onTop ? 20 : 5;
  scene.add(m);
  const f = { m, frames, pos: pos.clone(), t: 0, frameTime: o.frameTime || 0.05, life: o.life || frames.length * (o.frameTime || 0.05),
    rise: o.rise || 0, scale: o.scale || SPRITE_PX, followFn: o.followFn || null, cur: -1 };
  fxList.push(f);
  return f;
}
function label(name, pos) {
  if (!CFG.debugLabels) return;
  const p = pos.clone(), d = _v3.subVectors(p, player.head), L = d.length();
  if (L < 0.8) p.copy(player.head).addScaledVector(L > 1e-3 ? d.divideScalar(L) : camera.getWorldDirection(new V3()), 0.8);   // never in your face
  fx(['sign_' + name], p, { life: 0.7, rise: 0.4, scale: CFG.labelScale, onTop: true });
}
function updateFx(dt) {
  camera.getWorldQuaternion(_q1);
  for (let i = fxList.length - 1; i >= 0; i--) {
    const f = fxList[i];
    f.t += dt;
    if (f.t >= f.life) { scene.remove(f.m); fxList.splice(i, 1); continue; }
    const raw = Math.floor(f.t / f.frameTime);
    const fi = f.loop ? raw % f.frames.length : Math.min(f.frames.length - 1, raw);
    if (fi !== f.cur) { f.cur = fi; f.m.material = spriteMat(f.frames[fi], f.m.renderOrder === 20); const sz = imgSize[f.frames[fi]] || [16, 16]; f.m.scale.set(sz[0] * f.scale, sz[1] * f.scale, 1); }
    if (f.followFn) f.pos.copy(f.followFn());
    f.m.position.copy(f.pos); f.m.position.y += f.rise * f.t;
    f.m.quaternion.copy(_q1);
  }
}
// loop a sprite cycle (stars over a staggered head) by restarting it
function loopFx(frames, followFn, frameTime) {
  const f = fx(frames, followFn().clone(), { followFn, frameTime, life: 1e9 });
  f.loop = true;
  return f;
}
function killFx(f) { if (!f) return; const i = fxList.indexOf(f); if (i >= 0) { scene.remove(f.m); fxList.splice(i, 1); } }

// big lit sign over the door (round start / end)
let bigSign = null;
function showSign(name, dur = 2.5) {
  if (bigSign) killFx(bigSign);
  let at = new V3(0, 2.85, 4.3);
  if (level.name !== 'bar' || player.head.z > STREET.fz - 0.4) {   // outside: up ahead of you, wherever you're looking
    camera.getWorldDirection(_v1); _v1.y = 0; if (_v1.lengthSq() < 1e-4) _v1.set(0, 0, 1); _v1.normalize();
    at = player.head.clone().addScaledVector(_v1, 4.5); at.y = 2.7;
  }
  if (!imgSize['sign_' + name]) tex('sign_' + name);
  bigSign = fx(['sign_' + name], at, { life: dur, scale: 0.016 });
}
