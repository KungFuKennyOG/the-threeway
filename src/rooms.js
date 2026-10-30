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
function addPortal(a, b, at, open) { PORTALS.push({ a, b, at: new V3(...at), open: open || (() => true) }); }
// the most specific room wins: rooms are tested in the order they were added, 'outside' last
function roomAt(p) { for (const r of ROOMS.values()) if (r.name !== 'outside' && r.has(p)) return r.name; return 'outside'; }
const _rv = new V3(), _rc = new V3(), _rf = new V3();
function portalInView(P) {
  camera.getWorldPosition(_rc); _rv.subVectors(P.at, _rc);
  const L = _rv.length(); if (L < 1.5) return true;
  camera.getWorldDirection(_rf);
  return _rf.dot(_rv) / L > Math.cos(CFG.street.portalDeg * DEG);
}
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
  for (const r of ROOMS.values()) for (const m of r.meshes) m.visible = show.has(m);
  for (const p of props) if (p.obj) { p.shown = seen.has(roomAt(p.body.ps[0].x)); if (!p.batched) p.obj.visible = p.shown; }
}
