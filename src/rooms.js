'use strict';
// ============================== rooms + portals ==============================
// Occlusion the cheap way: the world is a few rooms joined by portals (doorways). Each frame you're in one room;
// a neighbour is drawn only if the portal into it is open and in view, and the room beyond that only if its
// portal is in view too. Walls hide everything else for free, so distance doesn't matter indoors.
// A mesh can belong to several rooms (the sky belongs to every outdoor space).
const ROOMS = new Map();     // name -> { has(p), meshes: Set }
const PORTALS = [];          // { a, b, at: V3, open() }
function addRoom(name, has) { if (!ROOMS.has(name)) ROOMS.set(name, { name, has, meshes: new Set() }); else ROOMS.get(name).has = has; return ROOMS.get(name); }
function roomMeshes(name, ...meshes) { const r = ROOMS.get(name); for (const m of meshes) if (m) r.meshes.add(m); }
// far: no further than this (m) from your eye (default CFG.street.portalFar): a doorway that far off is a few pixels at
// most, and on the way there the buildings hide it (the Palace's foyer seen from Tripoint Square, the bar from Parade Square)
function addPortal(a, b, at, open, far) { PORTALS.push({ a, b, at: new V3(...at), open: open || (() => true), far: far || CFG.street.portalFar }); }
// the most specific room wins: rooms are tested in the order they were added, 'outside' last
function roomAt(p) { for (const r of ROOMS.values()) if (r.name !== 'outside' && r.has(p)) return r.name; return 'outside'; }
const _rv = new V3(), _rc = new V3(), _rf = new V3();
function portalInView(P) {
  camera.getWorldPosition(_rc); _rv.subVectors(P.at, _rc);
  const L = _rv.length(); if (L < 1.5) return true; if (L > P.far) return false;
  camera.getWorldDirection(_rf);
  return _rf.dot(_rv) / L > Math.cos(CFG.street.portalDeg * DEG);
}
// A mesh can also say where it can be seen from at all: userData.near = [x, z, R, H] (world): drawn only with your eye
// within R m of (x, z) across the ground, or higher than H (up on the wing roof, the glass lift, the tribune: all of
// it). Past that, what stands between hides it entirely: the Palace's stadium and Parade Square from Tripoint Square,
// the road and the gate; the checkpoint's boom from Act 1's west. The distances come from a sweep: eyes on a 12 m grid
// over every outdoor walk rect, a cube of views from each with everything else drawn there as an occluder (and the
// insides you could see into), plus stills compared pixel for pixel. Only meshes that never showed past their edge
// have one: the street's own mesh, podezd 3's lift cars, the crossing's barriers and the glass lift all show from far
// off somewhere (the Accords wall, the cars up on the roof, through the Palace down its axis, 40 m up the Tower).
const nearOk = (m) => { const n = m.userData.near; return !n || player.head.y > n[3] || Math.hypot(player.head.x - n[0], player.head.z - n[1]) < n[2]; };
const roomState = { cur: 'bar', seen: new Set() };
function updateRooms() {
  const cur = roomAt(player.head), seen = roomState.seen;
  seen.clear(); seen.add(cur);
  let frontier = [cur];
  for (let depth = 0; depth < 2; depth++) {
    const next = [];
    for (const r of frontier) for (const P of PORTALS) {
      const other = P.a === r ? P.b : P.b === r ? P.a : null;
      if (!other || seen.has(other) || !P.open() || !portalInView(P)) continue;
      seen.add(other); next.push(other);
    }
    frontier = next;
  }
  roomState.cur = cur;
  const show = new Set();
  for (const name of seen) for (const m of ROOMS.get(name).meshes) show.add(m);
  for (const r of ROOMS.values()) for (const m of r.meshes) m.visible = show.has(m) && nearOk(m);
  for (const p of props) if (p.obj) { p.shown = seen.has(roomAt(p.body.ps[0].x)); if (!p.batched) p.obj.visible = p.shown; }
}
