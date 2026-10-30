'use strict';
// ============================== helpers =====================================
const V3 = THREE.Vector3, Q = THREE.Quaternion;
const DEG = Math.PI / 180;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const UP = new V3(0, 1, 0);
const _v1 = new V3(), _v2 = new V3(), _v3 = new V3(), _q1 = new Q();
let NOW = 0;

// ============================== renderer / scene ============================
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.outputEncoding = THREE.LinearEncoding;   // our shader writes final display values itself
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
renderer.xr.setFramebufferScaleFactor(CFG.render.vrFramebufferScale);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x140b12);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.03, CFG.render.camFar);
const rig = new THREE.Group();           // player dolly: locomotion + snap turn move this
rig.add(camera);
scene.add(rig);

// ============================== PS1 material ================================
const MAXL = 6;
const SU = {   // shared uniforms (same objects in every material)
  uLightPos: { value: Array.from({ length: MAXL }, () => new V3(0, -99, 0)) },
  uLightCol: { value: Array.from({ length: MAXL }, () => new V3()) },
  uLightRad: { value: new Array(MAXL).fill(1) },
  uAmbient: { value: new V3(0.2, 0.13, 0.19) },
  uFogColor: { value: new V3(0x14 / 255, 0x0b / 255, 0x12 / 255) },
  uFogNear: { value: CFG.render.fogNear }, uFogFar: { value: CFG.render.fogFar },
  uSnap: { value: 1 }, uSnapRes: { value: new THREE.Vector2(160, 120) },
  uAffine: { value: 1 }, uDither: { value: 1 }, uLevels: { value: 63 }, uDitherAmt: { value: 0.5 },
};
const VS = `
uniform vec3 uLightPos[${MAXL}]; uniform vec3 uLightCol[${MAXL}]; uniform float uLightRad[${MAXL}];
uniform vec3 uAmbient; uniform float uEmissive; uniform float uFogNear; uniform float uFogFar; uniform float uFogOn;
uniform float uSnap; uniform vec2 uSnapRes; uniform float uAffine; uniform vec2 uUvOffset; uniform float uBaked;
attribute vec3 bake;   // static geometry: light baked per vertex at build time (any number of lamps, zero cost)
attribute vec4 arect;  // atlas: where this vertex's texture sits in the atlas (u0, v0, du, dv); it tiles inside that box
varying vec3 vLight; varying float vFog; varying vec3 vUvA; varying vec4 vRect;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec3 n = normalize(mat3(modelMatrix) * normal);
  vec3 L = uAmbient;
  if (uBaked > 0.5) L = bake;
  else for (int i = 0; i < ${MAXL}; i++) {
    vec3 d = uLightPos[i] - wp.xyz; float dist = length(d) + 1e-4;
    float ndl = clamp((dot(n, d / dist) + 0.25) / 1.25, 0.0, 1.0);
    float att = clamp(1.0 - dist / uLightRad[i], 0.0, 1.0); att *= att;
    L += uLightCol[i] * ndl * att;
  }
  vLight = mix(L, vec3(1.0), uEmissive);
  vec4 mv = viewMatrix * wp;
  vFog = uFogOn * clamp((-mv.z - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
  vec4 cp = projectionMatrix * mv;
  if (uSnap > 0.5 && cp.w > 0.0) { cp.xy = floor(cp.xy / cp.w * uSnapRes + 0.5) / uSnapRes * cp.w; }
  float w = mix(1.0, cp.w, uAffine);
  vUvA = vec3((uv + uUvOffset) * w, w);
  vRect = arect;
  gl_Position = cp;
}`;
const FS = `
uniform sampler2D map; uniform vec3 uTint; uniform float uFlash; uniform vec3 uFogColor; uniform float uDither; uniform float uLevels; uniform float uDitherAmt; uniform float uAtlas;
varying vec3 vLight; varying float vFog; varying vec3 vUvA; varying vec4 vRect;
const float BAYER[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
void main() {
  vec2 uv = vUvA.xy / vUvA.z;
  if (uAtlas > 0.5) uv = vRect.xy + fract(uv) * vRect.zw;   // several repeating textures in one atlas (nearest: no seams)
  vec4 t = texture2D(map, uv);
  if (t.a < 0.5) discard;
  vec3 c = t.rgb * mix(vLight, vec3(1.0), clamp((1.0 - t.a) * 5.0, 0.0, 1.0)) * uTint;   // alpha 0.8 = the texel glows by itself (windows, neon); mipmaps blend it
  c = mix(c, vec3(1.0), uFlash);
  c = mix(c, uFogColor, vFog);
  c = clamp(c, 0.0, 1.0);
  if (uDither > 0.5) {
    int ix = int(mod(gl_FragCoord.x, 4.0)); int iy = int(mod(gl_FragCoord.y, 4.0));
    float b = BAYER[ix + iy * 4] / 16.0 - 0.47;
    c = clamp(floor(c * uLevels + b * uDitherAmt + 0.5), 0.0, uLevels) / uLevels;   // 6-bit colour, soft Bayer
  }
  gl_FragColor = vec4(c, 1.0);
}`;

const texCache = {};
const loader = new THREE.TextureLoader();
function tex(name) {
  if (texCache[name]) return texCache[name];
  if (!TEX[name] && name.startsWith('sign_')) { const st = signTex(name); if (st) return (texCache[name] = st); }
  const t = loader.load(TEX[name]);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false; t.flipY = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  texCache[name] = t;
  return t;
}
const fogAmt = (o) => o.fog === false ? 0 : (typeof o.fog === 'number' ? o.fog : 1);   // a number caps the fog (far skylines)
function makeMat(texName, o = {}) {
  const tint = o.tint || [1, 1, 1];
  const m = new THREE.ShaderMaterial({
    uniforms: Object.assign({}, SU, {
      map: { value: tex(texName) }, uTint: { value: new V3(tint[0], tint[1], tint[2]) }, uFlash: { value: 0 },
      uEmissive: { value: o.emissive ? 1 : 0 }, uUvOffset: { value: new THREE.Vector2() }, uFogOn: { value: fogAmt(o) },
      uBaked: { value: o.baked ? 1 : 0 }, uAtlas: { value: o.atlas ? 1 : 0 },
    }),
    vertexShader: VS, fragmentShader: FS,
    side: o.side || THREE.FrontSide, depthTest: o.depthTest !== false, depthWrite: o.depthWrite !== false,
  });
  if (m.defaultAttributeValues) { m.defaultAttributeValues.bake = [0, 0, 0]; m.defaultAttributeValues.arect = [0, 0, 1, 1]; }
  return m;
}
const sharedMats = {};
function sharedMat(texName, o = {}) {
  const k = texName + '|' + (o.emissive ? 1 : 0) + '|' + (o.tint || '') + '|' + fogAmt(o) + '|' + (o.depthTest === false ? 0 : 1) + '|' + (o.side || 0) + '|' + (o.baked ? 1 : 0);
  if (!sharedMats[k]) sharedMats[k] = makeMat(texName, o);
  return sharedMats[k];
}
