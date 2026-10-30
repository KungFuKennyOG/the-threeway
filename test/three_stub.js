// Minimal Three.js stand-in for headless logic tests: real math + scene graph, no rendering.
'use strict';
class Vector2 { constructor(x = 0, y = 0) { this.x = x; this.y = y; } set(x, y) { this.x = x; this.y = y; return this; } }
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  setY(y) { this.y = y; return this; }
  setScalar(v) { this.x = this.y = this.z = v; return this; }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  addVectors(a, b) { return this.set(a.x + b.x, a.y + b.y, a.z + b.z); }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  subVectors(a, b) { return this.set(a.x - b.x, a.y - b.y, a.z - b.z); }
  multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
  divideScalar(s) { return this.multiplyScalar(1 / s); }
  addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
  cross(v) { return this.crossVectors(this, v); }
  crossVectors(a, b) { const ax = a.x, ay = a.y, az = a.z, bx = b.x, by = b.y, bz = b.z; return this.set(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx); }
  lengthSq() { return this.dot(this); }
  length() { return Math.sqrt(this.lengthSq()); }
  normalize() { const l = this.length() || 1; return this.divideScalar(l); }
  setLength(l) { return this.normalize().multiplyScalar(l); }
  negate() { return this.multiplyScalar(-1); }
  distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
  lerp(v, t) { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; this.z += (v.z - this.z) * t; return this; }
  lerpVectors(a, b, t) { return this.copy(a).lerp(b, t); }
  applyQuaternion(q) {
    const x = this.x, y = this.y, z = this.z, qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    const ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
    return this.set(ix * qw + iw * -qx + iy * -qz - iz * -qy, iy * qw + iw * -qy + iz * -qx - ix * -qz, iz * qw + iw * -qz + ix * -qy - iy * -qx);
  }
  applyAxisAngle(axis, a) { return this.applyQuaternion(new Quaternion().setFromAxisAngle(axis, a)); }
  applyMatrix4(m) {
    const x = this.x, y = this.y, z = this.z, e = m.elements;
    return this.set(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]);
  }
}
class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) { this._x = x; this._y = y; this._z = z; this._w = w; this._owner = null; }
  get x() { return this._x; } get y() { return this._y; } get z() { return this._z; } get w() { return this._w; }
  _set(x, y, z, w) { this._x = x; this._y = y; this._z = z; this._w = w; if (this._owner) this._owner._rotDirty = false; return this; }
  set(x, y, z, w) { return this._set(x, y, z, w); }
  copy(q) { return this._set(q.x, q.y, q.z, q.w); }
  clone() { return new Quaternion(this.x, this.y, this.z, this.w); }
  setFromAxisAngle(a, ang) { const s = Math.sin(ang / 2); return this._set(a.x * s, a.y * s, a.z * s, Math.cos(ang / 2)); }
  multiplyQuaternions(a, b) {
    const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w, qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;
    return this._set(qax * qbw + qaw * qbx + qay * qbz - qaz * qby, qay * qbw + qaw * qby + qaz * qbx - qax * qbz,
      qaz * qbw + qaw * qbz + qax * qby - qay * qbx, qaw * qbw - qax * qbx - qay * qby - qaz * qbz);
  }
  multiply(q) { return this.multiplyQuaternions(this, q); }
  premultiply(q) { return this.multiplyQuaternions(q, this); }
  invert() { return this._set(-this.x, -this.y, -this.z, this.w); }
  slerp(qb, t) {
    if (t === 0) return this; if (t === 1) return this.copy(qb);
    let x = this.x, y = this.y, z = this.z, w = this.w;
    let cos = w * qb.w + x * qb.x + y * qb.y + z * qb.z;
    let bx = qb.x, by = qb.y, bz = qb.z, bw = qb.w;
    if (cos < 0) { cos = -cos; bx = -bx; by = -by; bz = -bz; bw = -bw; }
    if (cos > 0.9995) { const r = this._set(x + (bx - x) * t, y + (by - y) * t, z + (bz - z) * t, w + (bw - w) * t); const l = Math.hypot(r.x, r.y, r.z, r.w); return this._set(r.x / l, r.y / l, r.z / l, r.w / l); }
    const th = Math.acos(cos), s = Math.sin(th), a = Math.sin((1 - t) * th) / s, b = Math.sin(t * th) / s;
    return this._set(x * a + bx * b, y * a + by * b, z * a + bz * b, w * a + bw * b);
  }
  setFromRotationMatrix(m) {
    const te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10], tr = m11 + m22 + m33;
    let x, y, z, w;
    if (tr > 0) { const s = 0.5 / Math.sqrt(tr + 1); w = 0.25 / s; x = (m32 - m23) * s; y = (m13 - m31) * s; z = (m21 - m12) * s; }
    else if (m11 > m22 && m11 > m33) { const s = 2 * Math.sqrt(1 + m11 - m22 - m33); w = (m32 - m23) / s; x = 0.25 * s; y = (m12 + m21) / s; z = (m13 + m31) / s; }
    else if (m22 > m33) { const s = 2 * Math.sqrt(1 + m22 - m11 - m33); w = (m13 - m31) / s; x = (m12 + m21) / s; y = 0.25 * s; z = (m23 + m32) / s; }
    else { const s = 2 * Math.sqrt(1 + m33 - m11 - m22); w = (m21 - m12) / s; x = (m13 + m31) / s; y = (m23 + m32) / s; z = 0.25 * s; }
    return this._set(x, y, z, w);
  }
  setFromEuler(e) {   // order YXZ or XYZ
    const c1 = Math.cos(e.x / 2), c2 = Math.cos(e.y / 2), c3 = Math.cos(e.z / 2), s1 = Math.sin(e.x / 2), s2 = Math.sin(e.y / 2), s3 = Math.sin(e.z / 2);
    let x, y, z, w;
    if (e.order === 'YXZ') { x = s1 * c2 * c3 + c1 * s2 * s3; y = c1 * s2 * c3 - s1 * c2 * s3; z = c1 * c2 * s3 - s1 * s2 * c3; w = c1 * c2 * c3 + s1 * s2 * s3; }
    else { x = s1 * c2 * c3 + c1 * s2 * s3; y = c1 * s2 * c3 - s1 * c2 * s3; z = c1 * c2 * s3 + s1 * s2 * c3; w = c1 * c2 * c3 - s1 * s2 * s3; }
    this._x = x; this._y = y; this._z = z; this._w = w; return this;
  }
}
class Euler {
  constructor(owner) { this._x = 0; this._y = 0; this._z = 0; this.order = 'XYZ'; this._owner = owner; }
  _d() { if (this._owner) this._owner._rotDirty = true; }
  get x() { return this._x; } set x(v) { this._x = v; this._d(); }
  get y() { return this._y; } set y(v) { this._y = v; this._d(); }
  get z() { return this._z; } set z(v) { this._z = v; this._d(); }
  set(x, y, z, order) { this._x = x; this._y = y; this._z = z; if (order) this.order = order; this._d(); return this; }
}
class Matrix4 {
  constructor() { this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }
  copy(m) { this.elements = m.elements.slice(); return this; }
  compose(p, q, s) {
    const te = this.elements, x = q.x, y = q.y, z = q.z, w = q.w, x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
    te[0] = (1 - (yy + zz)) * s.x; te[1] = (xy + wz) * s.x; te[2] = (xz - wy) * s.x; te[3] = 0;
    te[4] = (xy - wz) * s.y; te[5] = (1 - (xx + zz)) * s.y; te[6] = (yz + wx) * s.y; te[7] = 0;
    te[8] = (xz + wy) * s.z; te[9] = (yz - wx) * s.z; te[10] = (1 - (xx + yy)) * s.z; te[11] = 0;
    te[12] = p.x; te[13] = p.y; te[14] = p.z; te[15] = 1; return this;
  }
  makeBasis(x, y, z) { const e = this.elements; e[0] = x.x; e[1] = x.y; e[2] = x.z; e[3] = 0; e[4] = y.x; e[5] = y.y; e[6] = y.z; e[7] = 0; e[8] = z.x; e[9] = z.y; e[10] = z.z; e[11] = 0; e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1; return this; }
  multiplyMatrices(a, b) {
    const ae = a.elements, be = b.elements, te = new Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += ae[k * 4 + i] * be[j * 4 + k]; te[j * 4 + i] = s; }
    this.elements = te; return this;
  }
}
class Color { constructor(c) { if (typeof c === 'string') c = parseInt(c.replace('#', ''), 16); this.r = ((c >> 16) & 255) / 255; this.g = ((c >> 8) & 255) / 255; this.b = (c & 255) / 255; } }
let objId = 0;
class Object3D {
  constructor() {
    this.id = objId++; this.position = new Vector3(); this.scale = new Vector3(1, 1, 1);
    this.quaternion = new Quaternion(); this.quaternion._owner = this; this.rotation = new Euler(this); this._rotDirty = false;
    this.children = []; this.parent = null; this.matrix = new Matrix4(); this.matrixWorld = new Matrix4();
    this.matrixAutoUpdate = true; this.renderOrder = 0; this.userData = {}; this.frustumCulled = true; this._l = {};
  }
  add(...objs) { for (const o of objs) { if (o.parent) o.parent.remove(o); o.parent = this; this.children.push(o); } return this; }
  remove(o) { const i = this.children.indexOf(o); if (i >= 0) { this.children.splice(i, 1); o.parent = null; } return this; }
  _sync() { if (this._rotDirty) { this.quaternion.setFromEuler(this.rotation); this._rotDirty = false; } }
  updateMatrix() { this._sync(); this.matrix.compose(this.position, this.quaternion, this.scale); }
  updateMatrixWorld() {
    if (this.matrixAutoUpdate) this.updateMatrix();
    if (this.parent) this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix); else this.matrixWorld.copy(this.matrix);
    for (const c of this.children) c.updateMatrixWorld();
  }
  _chainWorld() {   // fresh world matrix regardless of update order
    if (this.matrixAutoUpdate) this.updateMatrix();
    if (this.parent) { this.parent._chainWorld(); this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix); }
    else this.matrixWorld.copy(this.matrix);
  }
  localToWorld(v) { return v.applyMatrix4(this.matrixWorld); }
  getWorldPosition(out) { this._chainWorld(); const e = this.matrixWorld.elements; return out.set(e[12], e[13], e[14]); }
  getWorldQuaternion(out) { this._sync(); out.copy(this.quaternion); let p = this.parent; while (p) { p._sync(); out.premultiply(p.quaternion); p = p.parent; } return out; }
  attach(o) {
    const wp = o.getWorldPosition(new Vector3()), wq = o.getWorldQuaternion(new Quaternion());
    const myP = this.getWorldPosition(new Vector3()), myQ = this.getWorldQuaternion(new Quaternion()).invert();
    this.add(o); o.position.copy(wp.sub(myP).applyQuaternion(myQ)); o.quaternion.copy(myQ.multiply(wq)); return this;
  }
  addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }
  dispatchEvent(e) { for (const f of this._l[e.type] || []) f(e); }
}
class Group extends Object3D {}
class Scene extends Object3D {}
class Mesh extends Object3D { constructor(g, m) { super(); this.geometry = g; this.material = m; } }
class PerspectiveCamera extends Object3D {
  constructor(fov, aspect) { super(); this.fov = fov; this.aspect = aspect; }
  updateProjectionMatrix() {}
  getWorldDirection(out) { return out.set(0, 0, -1).applyQuaternion(this.getWorldQuaternion(new Quaternion())); }
}
class BufferAttribute { constructor(arr, size) { this.array = Float32Array.from(arr); this.itemSize = size; this.count = this.array.length / size; }
  getY(i) { return this.array[i * this.itemSize + 1]; } setY(i, v) { this.array[i * this.itemSize + 1] = v; } }
class BufferGeometry { constructor() { this.attributes = {}; } setAttribute(n, a) { this.attributes[n] = a; return this; } computeBoundingSphere() {} }
class PlaneGeometry extends BufferGeometry { constructor() { super(); this.setAttribute('uv', new BufferAttribute([0, 1, 1, 1, 0, 0, 1, 0], 2)); } }
class ShaderMaterial { constructor(p) { Object.assign(this, p); if (!this.uniforms) this.uniforms = {}; } }
class TextureLoader { load(src) { return { src }; } }
class CanvasTexture { constructor(img) { this.image = img; } }
class WebGLRenderer {
  constructor() {
    this.grips = [new Group(), new Group()];
    this.xr = { enabled: false, isPresenting: false, setReferenceSpaceType() {}, setFramebufferScaleFactor() {},
      getControllerGrip: (i) => this.grips[i], updateCamera() {}, setSession: async () => {} };
  }
  setPixelRatio() {} setSize() {} render() { this.frames = (this.frames || 0) + 1; }
  setAnimationLoop(f) { this.loop = f; }
}
module.exports = { Vector2, Vector3, Quaternion, Euler, Matrix4, Color, Object3D, Group, Scene, Mesh, PerspectiveCamera,
  BufferGeometry, Float32BufferAttribute: BufferAttribute, PlaneGeometry, ShaderMaterial, TextureLoader, CanvasTexture, WebGLRenderer, DynamicDrawUsage: 35048,
  NearestFilter: 1, RepeatWrapping: 2, FrontSide: 0, DoubleSide: 2, LinearEncoding: 3000 };
