'use strict';
// ============================== doors ======================================
// Building entrances (podezd 3, the Palace's foyer, the Tower of Labor's south doors, the Chairman's office): shut until
// the fight before them is cleared, then the leaves swing open. A shut door is a wall (a blocker with a height, so only
// its own floor); an open one is out of the way. Call addDoor() from a level's build: inside a frame's begin()/end() the
// door is authored in the frame's coordinates like everything else there (its group and its blocker are framed).
//   addDoor({ name, levels: [...],     the levels it's drawn on (it's hidden, and costs nothing, everywhere else)
//     tex, x0, x1, z, y, h,            the doorway: from x0 to x1 along x at z, its floor y, its height h
//     leaves: 1 | 2,                   one leaf hinged at x0, or a pair hinged at x0 and x1 meeting in the middle
//     side: 1 | -1,                    the leaves swing toward +z (1) or -z (-1)
//     angle,                           how far open (radians: PI / 2 square to the wall, nearly PI folded back flat)
//     open: () => bool,                whether it should be open now
//     ambient, th })                   baked light on the leaves; leaf thickness
const DOORS = [];
function addDoor(o) {
  const D = Object.assign({ leaves: 2, side: 1, angle: Math.PI / 2, th: 0.08, ambient: [0.62, 0.58, 0.52], t: 0, target: 0, leafMeshes: [] }, o);
  const n = D.leaves, w = (D.x1 - D.x0) / n, F = CFG.street.fog;
  for (let k = 0; k < n; k++) {
    const s = k === 0 ? 1 : -1, hx = s > 0 ? D.x0 : D.x1;   // the hinge; the leaf runs from it toward the middle
    const acc = new GeoAcc(); sbox(acc, D.tex, w / 2, 0, 0, w - 0.02, D.th, D.h - 0.02, 0, { u: w, v: D.h, top: false, cell: 99 });
    const m = new THREE.Mesh(acc.geometry({ ambient: D.ambient, lights: [] }), makeMat('street', { baked: true }));
    m.material.uniforms.uFogNear = { value: F.near }; m.material.uniforms.uFogFar = { value: F.far };
    const g = new THREE.Group(); g.add(m); g.position.set(hx, D.y, D.z + D.side * D.th / 2);
    g.userData = { s, base: s > 0 ? 0 : Math.PI, small: true }; m.userData.small = true; m.frustumCulled = false;
    scene.add(g); D.leafMeshes.push(g);
  }
  // shut: a wall across the doorway on its own floor (y0 / y1 read live: -20 puts it out of everyone's way)
  D.blocker = { x0: D.x0, x1: D.x1, z0: Math.min(D.z, D.z + D.side * 0.3), z1: Math.max(D.z, D.z + D.side * 0.3),
    get y0() { return D.shut() ? D.y : -20; }, get y1() { return D.shut() ? D.y + D.h : -20; } };
  BLOCKERS.push(D.blocker);
  D.here = () => D.levels.includes(level.name);
  D.shut = () => D.here() && D.t < 0.6;
  DOORS.push(D); placeDoor(D);
  return D;
}
// a level's fight i (or a later one) is won: what most doors wait for
const foughtPast = (name, i) => level.name === name && (level.encounter > i || (level.encounter === i && ['cleared', 'walk', 'won'].includes(game.state)));
const doorOpen = (name) => { const D = DOORS.find(d => d.name === name); return !!D && D.t > 0.02; };
function placeDoor(D) {
  const e = 1 - (1 - D.t) * (1 - D.t);   // eased out: a shove, then it slows to a stop
  for (const g of D.leafMeshes) {
    g.visible = D.here();
    g.rotation.y = g.userData.base - g.userData.s * D.side * D.angle * e;   // toward +z is a negative yaw for a leaf along +x
    g.updateMatrixWorld(true);
  }
}
const _dw = new V3();
function updateDoors(dt) {
  for (const D of DOORS) {
    const want = D.here() && D.open() ? 1 : 0;
    if (want !== D.target) {
      D.target = want;
      const near = D.here() && D.leafMeshes[0].getWorldPosition(_dw).distanceTo(player.head) < 30;
      if (!near) D.t = want;   // a stage start, or out of sight: no swing to watch
      else if (want) { AU.wood(); AU.tone('sawtooth', 74, 52, 1.1, 0.12, 0.05, 380); }   // the latch, then the hinges groan
    }
    if (D.t !== D.target) D.t = D.target ? Math.min(1, D.t + dt / CFG.doors.openTime) : Math.max(0, D.t - dt / CFG.doors.closeTime);
    placeDoor(D);
  }
}
