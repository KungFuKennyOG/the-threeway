'use strict';
// ============================== characters ==================================
// Goon sheets are 64 x 128: faces (normal, hurt, KO) and four 16-px body panels in the top 64 rows, then a strip
// holding the torso's back panel (TA_B) and side panel (TA_S), painted by tools/sheet_backs.py; rows 80-127 are free.
const SHEET_W = 64, SHEET_H = 128;
const FACE = [0, 0, 32, 32], TA = [32, 32, 48, 48], TB = [48, 32, 64, 48], TC = [32, 48, 48, 64], TD = [48, 48, 64, 64];
const TD_L = [48, 48, 56, 64], TD_R = [56, 48, 64, 64], HAIR = [1, 1, 3, 5];
const TA_B = [0, 64, 16, 80], TA_S = [16, 64, 32, 80];
// the newer goons (tools/goons_*.py) also paint the head's sides/back (HEADS), extra 16-px panels X1..X12, and 4x4 solid swatches SW(i)
const HEADS = [32, 64, 48, 80], X1 = [48, 64, 64, 80], X2 = [0, 80, 16, 96], X3 = [16, 80, 32, 96], X4 = [32, 80, 48, 96], X5 = [48, 80, 64, 96],
  X6 = [0, 96, 16, 112], X7 = [16, 96, 32, 112], X8 = [32, 96, 48, 112], X9 = [48, 96, 64, 112], X10 = [0, 112, 16, 128], X11 = [16, 112, 32, 128], X12 = [32, 112, 48, 128];
const HEADT = [33, 65, 37, 68];   // the top of the head: a patch of HEADS' top rows (hair or cap)
const SW = (i) => [48 + (i % 4) * 4, 112 + (i >> 2) * 4, 52 + (i % 4) * 4, 116 + (i >> 2) * 4];
const SLEEVE = [32, 48, 48, 59], HAND = [32, 60, 48, 64];   // TC split: sleeve (rows 0-10), hand (rows 12-15)
const FACE_OFFSET = { normal: [0, 0], hurt: [32 / SHEET_W, 0], ko: [0, 32 / SHEET_H] };
// uvs for a box textured from the torso panel (or a slice of it): the front keeps it, the back and the sides
// read the same slice of the back and side panels, so ties, buttons, zips and logos stay on the front
function chest(r) {
  if (r[0] < TA[0] || r[1] < TA[1] || r[2] > TA[2] || r[3] > TA[3]) return { '*': r };
  const sh = (o) => [r[0] - TA[0] + o[0], r[1] - TA[1] + o[1], r[2] - TA[0] + o[0], r[3] - TA[1] + o[1]];
  const s = sh(TA_S);
  return { '*': r, b: sh(TA_B), l: s, r: s };
}

// part spec: [name, parent, pivot, [geometry fns(acc, accFace)]]
// p.uv: per-part uv overrides for the default boxes (hips, uarm, farm, hand, thigh, shin, foot), e.g. { shin: { '*': X5 } }
// p.lean (the newer goons): only the face and the chest's front are subdivided, which leaves triangles for signature shapes.
// p.armK / p.farmK / p.handK / p.legK / p.shinK thicken (or thin) the limbs without moving a joint.
function humanoid(p) {
  const P = Object.assign({ torso: TA, legs: TD, arms: TC, hands: TC, feet: TD, shoulder: 0.56, chestD: 0.32, waist: 0.38, neck: 0.07,
    head: [0.23, 0.30, 0.26], thighW: 0.18, headSide: HAIR, uv: {}, armK: 1, farmK: 1, handK: 1, legK: 1, shinK: 1 }, p);
  const [hw, hh, hd] = P.head, U = (k, r) => P.uv[k] || { '*': r };
  const headUV = { f: FACE, b: P.headSide, l: P.headSide, r: P.headSide, t: P.headTop || (P.headSide === HEADS ? HEADT : P.headSide), d: P.headSide };
  const torsoG = P.lean
    ? [(a) => tbox(a, null, 0, 0.5, P.waist, 0.25, P.shoulder, P.chestD, chest(P.torso), { sub: 2, faces: 'f' }),
       (a) => tbox(a, null, 0, 0.5, P.waist, 0.25, P.shoulder, P.chestD, chest(P.torso), { faces: 'blrt' })]
    : [(a) => tbox(a, null, 0, 0.5, P.waist, 0.25, P.shoulder, P.chestD, chest(P.torso), { sub: 2, faces: 'fblrt' })];
  const headG = P.lean
    ? [(a, f) => tbox(a, f, 0, hh, hw, hd, hw * 0.92, hd * 0.95, headUV, { sub: 2, faces: 'f' }),
       (a) => tbox(a, null, 0, hh, hw, hd, hw * 0.92, hd * 0.95, headUV, { faces: 'blrtd' })]
    : [(a, f) => tbox(a, f, 0, hh, hw, hd, hw * 0.92, hd * 0.95, headUV, { sub: 2 })];
  const nk = P.neckW || 0.13, nk1 = P.neckW ? nk * 0.92 : 0.12;
  const parts = [
    ['hips', null, [0, 1.06, 0], [(a) => tbox(a, null, -0.12, 0.08, P.waist, 0.25, P.waist, 0.25, U('hips', P.legs))]],
    ['torso', 'hips', [0, 0.08, 0], torsoG],
    ['head', 'torso', [0, 0.5 + P.neck, 0.01], [...headG,
      (a) => tbox(a, null, -P.neck - 0.02, 0.02, nk, nk, nk1, nk1, { '*': P.neckUV || TC }, { faces: 'fblr' })]],
  ];
  const A = P.armK, F = P.farmK, Hk = P.handK, L = P.legK, Sk = P.shinK;
  for (const [s, nm] of [[-1, 'l'], [1, 'r']]) {
    parts.push(['uarm' + nm, 'torso', [s * (P.shoulder / 2 + 0.04), 0.44, 0], [(a) => tbox(a, null, 0.04, -0.31, 0.15 * A, 0.15 * A, 0.12 * A, 0.13 * A, U('uarm', P.arms))]]);
    parts.push(['farm' + nm, 'uarm' + nm, [0, -0.31, 0], [(a) => tbox(a, null, 0.02, -0.27, 0.12 * F, 0.12 * F, 0.1 * F, 0.1 * F, U('farm', P.arms))]]);
    parts.push(['hand' + nm, 'farm' + nm, [0, -0.27, 0], [(a) => tbox(a, null, 0, -0.13 * Hk, 0.13 * Hk, 0.14 * Hk, 0.13 * Hk, 0.13 * Hk, U('hand', P.hands))]]);
    parts.push(['thigh' + nm, 'hips', [s * 0.11, -0.08, 0], [(a) => tbox(a, null, 0.02, -0.47, P.thighW, (P.thighW + 0.01) * L, 0.14 * L, 0.15 * L, U('thigh', P.legs))]]);
    parts.push(['shin' + nm, 'thigh' + nm, [0, -0.47, 0], [(a) => tbox(a, null, 0.02, -0.43, 0.135 * Sk, 0.14 * Sk, 0.11 * Sk, 0.12 * Sk, U('shin', P.legs))]]);
    parts.push(['foot' + nm, 'shin' + nm, [0, -0.43, 0], [(a) => tbox(a, null, 0, -0.1, 0.13, 0.29, 0.13, 0.29, U('foot', P.feet), { z: 0.07 })]]);
  }
  const idx = {}; parts.forEach(p => idx[p[0]] = p);
  return idx;
}
// ---- the newer goons (tools/goons_*.py): a lean humanoid with every limb on its own panel:
// upper arm X6, forearm X7, hand X8, thigh X9, shin X10 (boots are painted on it), foot X11, hips TB, neck SW(15).
// Each one's signature shapes are a few extra boxes on X1-X5, X12, TD and the swatches.
const UA = X6, FA = X7, HND = X8, THI = X9, SHN = X10, FT = X11;
function goon(p) {
  const uv = Object.assign({ hips: { '*': TB }, uarm: { '*': UA }, farm: { '*': FA }, thigh: { '*': THI }, shin: { '*': SHN } }, p.uv || {});
  return humanoid(Object.assign({ lean: true, torso: TA, legs: THI, arms: UA, hands: HND, feet: FT, headSide: HEADS, neckUV: SW(15) }, p, { uv }));
}
const bx = (r, part, ...a) => r[part][3].push((acc) => tbox(acc, null, ...a));   // one more box on a part
// a peaked parade cap: a crown that flares up and forward (o.crown round its side, o.top on top) over a black visor (o.visor).
// The cap's band is painted on the face's top rows and on HEADS.
function peakedCap(r, o) {
  const y0 = o.y0 || 0.27;
  bx(r, 'head', y0, o.top, 0.25, 0.27, o.w, o.d, { f: o.crown, '*': o.crownB || o.crown, t: o.topUV }, { z: 0.0, z1: o.lean || 0.03, x1: o.tilt || 0, faces: 'fblrt' });
  bx(r, 'head', y0 - 0.025, y0 - 0.005, 0.25, o.visorD || 0.14, 0.25, o.visorD || 0.14, { '*': o.visor }, { z: 0.16 });
}
const BODIES = {
  boso() {
    const r = humanoid({ arms: [32, 32, 48, 43], headSide: [49, 49, 51, 51] });
    r.head[3].push((a) => tbox(a, null, 0.2, 0.44, 0.24, 0.26, 0.2, 0.16, { '*': [48, 48, 52, 52] }, { z: -0.01, z1: 0.14 }));
    r.head[3].push((a) => tbox(a, null, 0.36, 0.47, 0.19, 0.16, 0.15, 0.1, { '*': [49, 49, 51, 51], t: [48, 48, 50, 49] }, { z: 0.15, z1: 0.08 }));
    r.hips[3].push((a) => tbox(a, null, 0.06, -0.72, 0.42, 0.3, 0.66, 0.46, { f: TB, b: TB, l: TB, r: TB, '*': TA }, { z1: -0.02, sub: 2, faces: 'fblr' }));
    r.torso[3].push((a) => tbox(a, null, 0.42, 0.56, 0.4, 0.3, 0.34, 0.26, chest([40, 44, 47, 47]), { faces: 'fblr' }));
    for (const nm of ['l', 'r']) r['farm' + nm][3].push((a) => tbox(a, null, -0.2, -0.27, 0.14, 0.14, 0.14, 0.14, { '*': [32, 46, 48, 48] }, { faces: 'fblr' }));
    return r;
  },
  boxer(noHeadgear, shoulder = 0.58) {
    const r = humanoid({ torso: TA, legs: TC, arms: TC, hands: TD_L, feet: TD_R, shoulder });
    r.hips[3] = [(a) => tbox(a, null, -0.16, 0.1, 0.42, 0.28, 0.4, 0.27, { '*': TB })];
    for (const nm of ['l', 'r']) {
      r['thigh' + nm][3].push((a) => tbox(a, null, 0.02, -0.2, 0.2, 0.21, 0.19, 0.2, { '*': TB }, { faces: 'fblrd' }));
      r['hand' + nm][3] = [(a) => tbox(a, null, 0.04, -0.2, 0.19, 0.21, 0.2, 0.22, { '*': TD_L }),
                           (a) => tbox(a, null, 0.06, -0.02, 0.13, 0.13, 0.14, 0.14, { '*': [49, 60, 55, 63] }, { faces: 'fblr' })];
      r['shin' + nm][3].push((a) => tbox(a, null, -0.2, -0.44, 0.15, 0.16, 0.14, 0.15, { '*': TD_R }, { faces: 'fblr' }));
    }
    if (noHeadgear) return r;
    const hg = [49, 49, 55, 55];
    r.head[3].push((a) => tbox(a, null, 0.27, 0.34, 0.26, 0.28, 0.21, 0.23, { '*': hg }, { z: -0.01 }));
    r.head[3].push((a) => tbox(a, null, 0.06, 0.27, 0.27, 0.2, 0.27, 0.22, { '*': hg }, { z: -0.03, faces: 'lrb' }));
    r.head[3].push((a) => tbox(a, null, 0.08, 0.2, 0.29, 0.12, 0.29, 0.12, { '*': hg }, { z: 0.03, faces: 'lrt' }));
    return r;
  },
  wrestler() {
    const r = humanoid({ torso: TA, legs: [32, 39, 48, 48], arms: TC, hands: TC, feet: TD, shoulder: 0.66, chestD: 0.42, waist: 0.5,
      neck: -0.02, head: [0.25, 0.29, 0.27], thighW: 0.22 });
    r.torso[3].push((a) => tbox(a, null, 0.0, 0.32, 0.5, 0.36, 0.6, 0.44, chest([33, 40, 47, 47]), { z: 0.02, faces: 'fblr' }));
    r.torso[3].push((a) => tbox(a, null, 0.44, 0.56, 0.5, 0.3, 0.3, 0.24, chest([33, 33, 47, 36]), { faces: 'fblrt' }));
    r.hips[3].push((a) => tbox(a, null, 0.02, 0.14, 0.56, 0.4, 0.58, 0.42, { '*': TB }, { faces: 'fblr' }));
    for (const nm of ['l', 'r']) {
      r['shin' + nm][3].push((a) => tbox(a, null, -0.16, -0.44, 0.16, 0.17, 0.15, 0.16, { '*': TD }, { faces: 'fblr' }));
      r['uarm' + nm][3] = [(a) => tbox(a, null, 0.06, -0.31, 0.19, 0.19, 0.15, 0.16, { '*': TC })];
    }
    r.head[3].push((a) => tbox(a, null, 0.05, 0.11, 0.17, 0.03, 0.15, 0.03, { '*': [48, 50, 50, 52] }, { z: 0.14 }));
    return r;
  },
  batboy() {   // varsity jacket, jeans, high-tops, ball cap worn forward
    const r = humanoid({ torso: TA, legs: TB, arms: [33, 36, 47, 47], hands: TC, feet: TD_R, headSide: HAIR });
    r.head[3].push((a) => tbox(a, null, 0.23, 0.34, 0.25, 0.28, 0.22, 0.25, { '*': TD_L }, { z: -0.01, faces: 'fblrt' }));
    r.head[3].push((a) => tbox(a, null, 0.225, 0.245, 0.23, 0.16, 0.23, 0.16, { '*': TD_L }, { z: 0.2 }));
    r.torso[3].push((a) => tbox(a, null, 0.0, 0.1, 0.42, 0.29, 0.44, 0.3, chest([36, 45, 44, 48]), { faces: 'fblr' }));   // jacket hem
    return r;
  },
  cook() {     // kitchen whites, houndstooth trousers, tall toque
    const r = humanoid({ torso: TA, legs: TB, arms: [48, 48, 56, 64], hands: TC, feet: TD_R, shoulder: 0.6, waist: 0.44, chestD: 0.36 });
    r.head[3].push((a) => tbox(a, null, 0.24, 0.3, 0.25, 0.28, 0.25, 0.28, { '*': TD_L }, { z: -0.01, faces: 'fblr' }));
    r.head[3].push((a) => tbox(a, null, 0.3, 0.55, 0.25, 0.28, 0.33, 0.34, { '*': TD_L }, { z: -0.01 }));
    r.torso[3].push((a) => tbox(a, null, -0.08, 0.2, 0.46, 0.3, 0.5, 0.36, chest([33, 36, 47, 47]), { faces: 'fblr' }));   // belly in an apron
    return r;
  },
  secguard() {   // Aoki Security: black suit, riot helmet with a mirrored visor, clear shield on the left forearm, baton in the right fist
    const r = humanoid({ torso: TA, legs: TB, arms: TC, hands: [32, 60, 48, 64], feet: [48, 45, 64, 48], shoulder: 0.6, chestD: 0.34, waist: 0.42 });
    r.head[3].push((a) => tbox(a, null, 0.23, 0.335, 0.27, 0.3, 0.24, 0.27, { '*': TD_L }, { z: -0.01, faces: 'fblrt' }));   // helmet shell
    // the shield rides on the torso (always square to his front, which is what it blocks); the left arm holds it from behind
    const shield = (a) => tbox(a, null, -0.3, 0.52, 0.5, 0.035, 0.5, 0.035, { '*': TD_R }, { x: -0.1, z: 0.36 });
    shield.tag = 'shield'; r.torso[3].push(shield);
    r.handr[3].push((a) => tbox(a, null, -0.04, -0.6, 0.05, 0.05, 0.04, 0.04, { '*': [49, 33, 51, 35] }));   // baton
    return r;
  },
  kicker() {     // neon kicker: lean and long-legged, spiky hair over a red headband, bomber collar, hand wraps
    const r = humanoid({ torso: TA, legs: TB, arms: TC, hands: TD_L, feet: TD_R, shoulder: 0.54, chestD: 0.3, waist: 0.36, thighW: 0.17 });
    for (const [x, z, h] of [[-0.08, 0.02, 0.1], [0.0, -0.05, 0.13], [0.08, 0.02, 0.1], [0.0, 0.07, 0.08]])
      r.head[3].push((a) => tbox(a, null, 0.29, 0.29 + h, 0.1, 0.1, 0.02, 0.02, { '*': HAIR }, { x, z }));
    r.torso[3].push((a) => tbox(a, null, 0.44, 0.58, 0.4, 0.3, 0.3, 0.24, chest([32, 32, 48, 34]), { faces: 'fblrt' }));   // bomber collar
    return r;
  },
  conscript() {   // Krasnovian conscript: a greatcoat two sizes too big, a fur ushanka with the flaps down, boots
    const r = humanoid({ torso: TA, legs: TD_L, arms: [32, 48, 48, 58], hands: [32, 60, 48, 64], feet: TD_R, shoulder: 0.62, chestD: 0.34, waist: 0.46 });
    r.hips[3].push((a) => tbox(a, null, 0.06, -0.6, 0.48, 0.32, 0.62, 0.44, { '*': TB }, { sub: 2, faces: 'fblr' }));   // coat skirt to the knee
    r.head[3].push((a) => tbox(a, null, 0.22, 0.38, 0.28, 0.31, 0.26, 0.29, { '*': HAIR }, { z: -0.01, faces: 'fblrt' }));   // the fur crown
    r.head[3].push((a) => tbox(a, null, 0.04, 0.24, 0.29, 0.15, 0.29, 0.15, { '*': HAIR }, { z: -0.02, faces: 'lr' }));    // ear flaps
    for (const nm of ['l', 'r']) r['farm' + nm][3].push((a) => tbox(a, null, -0.2, -0.27, 0.15, 0.15, 0.15, 0.15, { '*': [32, 48, 48, 58] }, { faces: 'fblr' }));   // sleeves past the wrist
    return r;
  },
  laborer() {     // Krasnovian laborer: quilted work jacket, red scarf, knit cap, heavy boots; a steel pipe in the right fist
    const r = humanoid({ torso: TA, legs: TD_L, arms: [32, 48, 48, 59], hands: [32, 60, 48, 64], feet: TD_R, shoulder: 0.66, chestD: 0.38, waist: 0.5, thighW: 0.2 });
    r.hips[3].push((a) => tbox(a, null, -0.02, 0.16, 0.48, 0.32, 0.48, 0.32, { '*': TB }, { faces: 'fblr' }));   // jacket hem below the waist
    r.head[3].push((a) => tbox(a, null, 0.23, 0.33, 0.25, 0.28, 0.21, 0.24, { '*': HAIR }, { z: -0.01, faces: 'fblrt' }));   // knit cap
    return r;
  },
  rocco() {    // Columbian bouncer: a boxer without headgear, broader
    const r = BODIES.boxer(true, 0.64);
    r.torso[3].push((a) => tbox(a, null, 0.3, 0.52, 0.56, 0.34, 0.64, 0.36, chest(TA), { z: 0.01, faces: 'fblr' }));
    return r;
  },
  volkov() {   // Bogdan "the Bear" Volkov: barrel chest, bare arms, red singlet, black tights, a champion's gold belt
    const r = humanoid({ torso: TA, legs: TB, arms: TC, hands: TC, feet: TD, shoulder: 0.74, chestD: 0.46, waist: 0.54,
      neck: -0.03, head: [0.26, 0.3, 0.28], thighW: 0.24 });
    r.torso[3].push((a) => tbox(a, null, 0.0, 0.36, 0.56, 0.42, 0.68, 0.5, chest(TA), { z: 0.02, faces: 'fblr' }));
    r.hips[3].push((a) => tbox(a, null, 0.1, 0.2, 0.6, 0.44, 0.6, 0.44, { '*': [43, 36, 44, 37] }, { faces: 'fblr' }));   // the belt
    for (const nm of ['l', 'r']) r['uarm' + nm][3] = [(a) => tbox(a, null, 0.06, -0.31, 0.21, 0.21, 0.17, 0.17, { '*': TC })];
    return r;
  },
  // ---- the Palace of Sport and Parade Square (sheets: tools/goons_palace.py). Each one's signature is in its first comment.
  sambo() {    // SIGNATURE: the kurtka's big flaring wings. A scrappy kid: cauliflower ears, a taped nose, taped fingers, high boots, a low crouch
    const r = goon({ shoulder: 0.6, chestD: 0.33, waist: 0.42, neck: 0.03, head: [0.25, 0.27, 0.26], thighW: 0.19, neckW: 0.17, handK: 1.08 });
    for (const s of [-1, 1]) bx(r, 'torso', 0.32, 0.5, 0.3, 0.4, 0.2, 0.36, { '*': X1 }, { x: s * 0.37, x1: -s * 0.08, faces: 'fblrtd' });   // the kurtka's wings
    bx(r, 'hips', 0.1, -0.2, 0.47, 0.31, 0.53, 0.35, { '*': X2 }, { faces: 'fblr' });   // its skirt below the belt
    bx(r, 'hips', 0.04, -0.28, 0.13, 0.04, 0.17, 0.04, { '*': X3 }, { z: 0.18, z1: 0.01, faces: 'fblr' });   // the belt's knot and ends
    for (const s of [-1, 1]) bx(r, 'head', 0.07, 0.2, 0.06, 0.09, 0.07, 0.08, { '*': X4 }, { x: s * 0.135, x1: s * 0.01, faces: 'fblrt' });   // cauliflower ears
    for (const nm of ['l', 'r']) bx(r, 'shin' + nm, -0.16, -0.43, 0.16, 0.17, 0.15, 0.16, { '*': X5 }, { faces: 'fblr' });   // high wrestling boots
    return r;
  },
  gymnast() {  // SIGNATURE: a high ponytail flying out behind. A gold medal on a ribbon, a striped tracksuit, leg warmers; she's just stuck the landing
    const r = goon({ shoulder: 0.5, chestD: 0.28, waist: 0.32, thighW: 0.16, head: [0.21, 0.28, 0.23], neckW: 0.1, armK: 0.9, farmK: 0.9, handK: 0.9 });
    bx(r, 'head', 0.25, 0.34, 0.11, 0.11, 0.1, 0.1, { '*': SW(0) }, { z: -0.07, faces: 'fblrt' });   // the scrunchie
    bx(r, 'head', 0.26, 0.56, 0.1, 0.08, 0.18, 0.05, { '*': X1 }, { z: -0.1, z1: -0.36 });   // the ponytail, flying out behind
    bx(r, 'torso', 0.18, 0.3, 0.12, 0.025, 0.12, 0.025, { '*': X2 }, { z: 0.15, faces: 'fblr' });   // the medal
    bx(r, 'torso', 0.44, 0.57, 0.3, 0.24, 0.26, 0.21, { '*': X3 }, { faces: 'fblr' });   // the tracksuit's stand-up collar
    for (const nm of ['l', 'r']) bx(r, 'shin' + nm, -0.04, -0.37, 0.165, 0.175, 0.18, 0.19, { '*': X4 }, { faces: 'fblr' });   // leg warmers
    return r;
  },
  lifter() {   // SIGNATURE: arms like hams and a huge waxed handlebar moustache. Chest and belly on short bowed legs, chalked hands, a cog on the singlet
    const r = goon({ shoulder: 0.84, chestD: 0.5, waist: 0.6, neck: -0.05, head: [0.26, 0.28, 0.27], thighW: 0.27, neckW: 0.22,
      armK: 1.6, farmK: 1.55, handK: 1.3, legK: 1.25, shinK: 1.25 });
    bx(r, 'torso', 0.2, 0.5, 0.74, 0.52, 0.94, 0.52, chest(TA), { z: 0.02, faces: 'fblr' });   // the chest
    bx(r, 'torso', -0.04, 0.24, 0.66, 0.54, 0.74, 0.56, { f: X2, '*': X3 }, { z: 0.03, faces: 'fblr' });   // the belly
    bx(r, 'torso', 0.4, 0.5, 0.9, 0.44, 0.56, 0.26, { '*': TD }, { faces: 'fblr' });   // traps like a yoke
    bx(r, 'hips', 0.02, 0.2, 0.7, 0.54, 0.7, 0.54, { f: X4, '*': X5 }, { faces: 'fblr' });   // the belt
    bx(r, 'head', 0.25, 0.37, 0.27, 0.28, 0.27, 0.28, { '*': X1, t: SW(0) }, { faces: 'fblrt' });   // the flat-top
    bx(r, 'head', 0.055, 0.1, 0.4, 0.05, 0.36, 0.045, { '*': X12 }, { z: 0.145 });   // the handlebar moustache
    for (const s of [-1, 1]) bx(r, 'head', 0.07, 0.17, 0.05, 0.045, 0.04, 0.035, { '*': X12 }, { x: s * 0.185, x1: s * 0.02, z: 0.145, faces: 'fblrt' });   // its waxed tips
    return r;
  },
  guard() {    // SIGNATURE: a towering parade cap. Gold boards and braid, white gloves, a sabre on the hip, ramrod straight with the flagpole
    const r = goon({ shoulder: 0.62, chestD: 0.37, waist: 0.38, head: [0.23, 0.3, 0.25], thighW: 0.17, neckW: 0.12 });
    peakedCap(r, { top: 0.56, w: 0.47, d: 0.45, lean: 0.07, crown: X1, crownB: TD, topUV: SW(1), visor: SW(0), visorD: 0.16 });
    for (const s of [-1, 1]) bx(r, 'torso', 0.46, 0.53, 0.17, 0.22, 0.18, 0.23, { '*': X2 }, { x: s * 0.31, faces: 'fblrt' });   // gold shoulder boards
    bx(r, 'hips', 0.06, -0.62, 0.42, 0.3, 0.56, 0.4, { f: X4, '*': X5 }, { faces: 'fblr' });   // the parade coat's skirt
    bx(r, 'hips', 0.0, -0.76, 0.045, 0.07, 0.04, 0.06, { '*': X3 }, { x: -0.31, z: 0.03, z1: -0.24, faces: 'fblr' });   // the sabre's scabbard, slung back
    bx(r, 'hips', 0.0, 0.17, 0.07, 0.11, 0.08, 0.13, { '*': SW(2) }, { x: -0.31, z: 0.05, z1: 0.04 });   // its gilt hilt
    return r;
  },
  bandsman() { // SIGNATURE: a tall plumed shako and a bass drum strapped to his front. Puffed cheeks, a high-stepping march, a raised mallet
    const r = goon({ shoulder: 0.58, chestD: 0.34, waist: 0.44, head: [0.25, 0.29, 0.26], neckW: 0.13 });
    bx(r, 'head', 0.26, 0.6, 0.27, 0.29, 0.32, 0.33, { f: X1, '*': TD, t: SW(1) }, { faces: 'fblrt' });   // the shako
    bx(r, 'head', 0.24, 0.265, 0.27, 0.15, 0.27, 0.15, { '*': SW(0) }, { z: 0.17 });   // its peak
    bx(r, 'head', 0.58, 0.92, 0.09, 0.09, 0.2, 0.17, { '*': X2 }, { z: 0.1, z1: -0.06 });   // the plume
    r.torso[3].push((a) => tbox(a, null, 0.0, 0.4, 0.52, 0.22, 0.52, 0.22, { f: X3, b: X3, '*': X4 }, { z: 0.28 }));   // the bass drum
    for (const s of [-1, 1]) bx(r, 'torso', 0.45, 0.53, 0.16, 0.2, 0.18, 0.22, { '*': X5 }, { x: s * 0.29, faces: 'fblrt' });   // fringed epaulettes
    return r;
  },
  specialist() {   // SIGNATURE: mirrored aviators under slicked-back hair, the leather collar up. A gold chain, a scar, a gold tooth, guard high
    const r = goon({ shoulder: 0.64, chestD: 0.33, waist: 0.38, head: [0.23, 0.29, 0.25], neckW: 0.13 });
    bx(r, 'torso', 0.4, 0.68, 0.44, 0.32, 0.58, 0.4, { '*': X1 }, { z: -0.02, faces: 'blr' });   // the collar, turned up and flared
    bx(r, 'head', 0.23, 0.37, 0.245, 0.27, 0.23, 0.25, { '*': X2, t: SW(0) }, { z: -0.01, z1: -0.03, faces: 'fblrt' });   // slicked-back hair
    bx(r, 'head', 0.1, 0.27, 0.17, 0.08, 0.21, 0.06, { '*': X2 }, { z: -0.14, z1: -0.04, faces: 'blrtd' });   // the ducktail
    bx(r, 'head', 0.13, 0.185, 0.25, 0.03, 0.25, 0.03, { '*': X3 }, { z: 0.125 });   // mirrored aviators
    bx(r, 'hips', 0.0, 0.14, 0.44, 0.31, 0.44, 0.31, { '*': X4 }, { faces: 'fblr' });   // jacket hem
    for (const s of [-1, 1]) bx(r, 'torso', 0.4, 0.5, 0.18, 0.3, 0.2, 0.3, { '*': X5 }, { x: s * 0.27, faces: 'fblrt' });   // padded shoulders
    return r;
  },
  // ---- the Tower of Labor (sheets: tools/goons_tower.py)
  militia() {  // SIGNATURE: a huge fur ushanka with the flaps sticking out. A walrus moustache, a red nose, a barrel chest, arms wide to grab
    const r = goon({ shoulder: 0.74, chestD: 0.44, waist: 0.5, neck: -0.03, head: [0.26, 0.28, 0.27], thighW: 0.22, neckW: 0.18, armK: 1.15, farmK: 1.15, handK: 1.15 });
    bx(r, 'torso', 0.0, 0.34, 0.54, 0.38, 0.66, 0.46, chest(TA), { z: 0.02, faces: 'fblr' });   // the barrel chest
    bx(r, 'head', 0.24, 0.46, 0.34, 0.34, 0.38, 0.36, { '*': X1, t: X2 }, { z: -0.01, faces: 'fblrt' });   // the fur crown
    bx(r, 'head', 0.3, 0.48, 0.38, 0.07, 0.41, 0.06, { '*': X3 }, { z: 0.185, faces: 'fblrt' });   // the front flap, turned up, a cog on it
    for (const s of [-1, 1]) bx(r, 'head', 0.1, 0.3, 0.07, 0.24, 0.07, 0.26, { '*': X2 }, { x: s * 0.2, x1: s * 0.08 });   // the ear flaps, sticking out
    bx(r, 'head', 0.025, 0.105, 0.32, 0.05, 0.22, 0.045, { '*': X4 }, { z: 0.15 });   // the walrus moustache
    return r;
  },
  inspector() {   // SIGNATURE: the clipboard held up like a shield, a long flaring trench coat. Round spectacles, a long nose in the air, prim
    const r = goon({ shoulder: 0.52, chestD: 0.29, waist: 0.36, head: [0.22, 0.31, 0.24], thighW: 0.16, neckW: 0.11, armK: 0.95 });
    bx(r, 'hips', 0.08, -0.74, 0.42, 0.3, 0.66, 0.48, { f: X1, '*': X2 }, { faces: 'fblr' });   // the trench coat, flaring to mid-calf
    bx(r, 'torso', 0.36, 0.6, 0.4, 0.3, 0.58, 0.36, { '*': X3 }, { z: -0.01, faces: 'blr' });   // the storm collar, up
    bx(r, 'head', 0.09, 0.17, 0.055, 0.1, 0.04, 0.03, { '*': SW(3) }, { z: 0.15, z1: -0.03, faces: 'fblrtd' });   // the long nose
    peakedCap(r, { top: 0.42, w: 0.3, d: 0.33, crown: X5, crownB: TD, topUV: SW(1), visor: SW(0), visorD: 0.12 });
    bx(r, 'handl', 0.08, -0.3, 0.32, 0.025, 0.32, 0.025, { b: X12, '*': SW(2) }, { z: -0.07 });   // the clipboard, up like a shield
    return r;
  },
  clerk() {    // SIGNATURE: a tower of files hugged to his belly and a giant rubber stamp raised like a hammer. A green eyeshade, sweat, a nervous hunch
    const r = goon({ shoulder: 0.5, chestD: 0.3, waist: 0.44, head: [0.25, 0.3, 0.26], neckW: 0.11, armK: 0.9, farmK: 0.9 });
    bx(r, 'head', 0.195, 0.235, 0.28, 0.06, 0.28, 0.17, { '*': X1 }, { z: 0.25, z1: -0.05 });   // the green eyeshade's bill, tipped down
    r.torso[3].push((a) => tbox(a, null, 0.02, 0.42, 0.4, 0.24, 0.38, 0.24, { f: X2, t: X4, '*': X3 }, { x: -0.03, z: 0.27 }));   // the files
    bx(r, 'torso', 0.4, 0.52, 0.17, 0.02, 0.19, 0.02, { '*': SW(0) }, { x: 0.06, z: 0.3, faces: 'fblr' });   // a loose sheet sticking out
    bx(r, 'handr', -0.06, -0.24, 0.06, 0.06, 0.07, 0.07, { '*': SW(1) });   // the stamp's handle
    bx(r, 'handr', -0.24, -0.35, 0.21, 0.21, 0.23, 0.23, { '*': X5, d: SW(4) });   // its pad: big
    return r;
  },
  bodyguard() {   // SIGNATURE: refrigerator shoulders under a tiny head. Wraparound shades, a flat-top, the earpiece's coiled cord, fists up
    const r = goon({ shoulder: 0.84, chestD: 0.42, waist: 0.5, neck: -0.06, head: [0.19, 0.25, 0.21], thighW: 0.22, neckW: 0.2,
      armK: 1.3, farmK: 1.2, handK: 1.15, legK: 1.1 });
    bx(r, 'torso', 0.1, 0.5, 0.62, 0.44, 0.98, 0.48, chest(TA), { z: 0.02, faces: 'fblr' });   // the slab of a chest
    bx(r, 'torso', 0.42, 0.52, 0.92, 0.42, 0.34, 0.18, { f: X5, '*': X1 }, { faces: 'fblr' });   // shoulders sloping straight into his head
    bx(r, 'head', 0.105, 0.16, 0.21, 0.04, 0.205, 0.04, { '*': X2 }, { z: 0.1 });   // wraparound shades
    bx(r, 'head', 0.2, 0.28, 0.18, 0.2, 0.17, 0.19, { '*': X3, t: SW(0) }, { faces: 'fblrt' });   // the flat-top
    bx(r, 'head', 0.07, 0.13, 0.035, 0.05, 0.035, 0.05, { '*': SW(1) }, { x: 0.105, faces: 'fblrt' });   // the earpiece
    bx(r, 'head', -0.14, 0.08, 0.02, 0.02, 0.02, 0.02, { '*': SW(2) }, { x: 0.112, z: -0.02, faces: 'fblr' });   // its coiled cord
    return r;
  },
  orlova() {   // SIGNATURE: a greatcoat flaring out like a bell under caped, fur-collared shoulders. A huge-crowned cap, a platinum bun, red lips
    const r = goon({ shoulder: 0.54, chestD: 0.3, waist: 0.34, thighW: 0.17, head: [0.22, 0.29, 0.24], neckW: 0.1 });
    bx(r, 'hips', 0.08, -0.8, 0.42, 0.3, 0.82, 0.62, { f: X1, '*': X2 }, { faces: 'fblr' });   // the greatcoat, flaring to the boot tops
    bx(r, 'torso', 0.3, 0.5, 0.78, 0.48, 0.56, 0.36, { '*': X3 }, { faces: 'fblrd' });   // the cape over her shoulders
    bx(r, 'torso', 0.46, 0.62, 0.44, 0.34, 0.38, 0.3, { '*': X4 }, { z: -0.01, faces: 'fblrt' });   // the fur collar
    peakedCap(r, { top: 0.52, w: 0.45, d: 0.43, lean: 0.06, tilt: 0.03, crown: X5, crownB: TD, topUV: SW(1), visor: SW(0), visorD: 0.14 });
    bx(r, 'head', 0.1, 0.25, 0.13, 0.11, 0.1, 0.09, { '*': X12 }, { z: -0.16, faces: 'fblrt' });   // the bun
    r.uarml[3] = [(a) => tbox(a, null, 0.04, -0.31, 0.15, 0.15, 0.12, 0.13, { '*': TC })];   // the red armband, on one arm
    return r;
  },
  chairman() {    // SIGNATURE: enormous eyebrows in a big jowly face under a fur hat. A sash and medals down to the belly; he waves from the stand
    const r = goon({ shoulder: 0.72, chestD: 0.46, waist: 0.62, neck: -0.03, head: [0.3, 0.32, 0.3], thighW: 0.22, neckW: 0.22, armK: 1.1, farmK: 1.05 });
    bx(r, 'torso', -0.04, 0.34, 0.64, 0.54, 0.72, 0.54, { f: X1, '*': X2 }, { z: 0.05, faces: 'fblr' });   // the belly
    bx(r, 'head', 0.29, 0.52, 0.34, 0.34, 0.38, 0.36, { '*': X5, t: SW(0) }, { z: -0.005, faces: 'fblrt' });   // the fur hat
    for (const s of [-1, 1]) bx(r, 'head', 0.19, 0.245, 0.15, 0.065, 0.17, 0.05, { '*': X4 }, { x: s * 0.08, x1: s * 0.03, z: 0.165 });   // the eyebrows
    bx(r, 'head', -0.04, 0.1, 0.37, 0.28, 0.31, 0.27, { '*': X12 }, { z: -0.01, faces: 'blrd' });   // the jowls
    bx(r, 'head', 0.08, 0.17, 0.095, 0.075, 0.075, 0.05, { '*': SW(1) }, { z: 0.165, faces: 'fblrd' });   // the nose
    return r;
  },
  // ---- the bar's officials (sheets: tools/goons_officials.py)
  harmony() {   // SIGNATURE: a big blond pompadour over a huge toothy grin. A loud red blazer, the closure notice held up, a thumbs-up
    const r = goon({ shoulder: 0.58, chestD: 0.32, waist: 0.42, head: [0.25, 0.29, 0.26], neckW: 0.12 });
    bx(r, 'head', 0.24, 0.39, 0.27, 0.28, 0.26, 0.27, { '*': X1, t: SW(0) }, { z: -0.01, faces: 'fblrt' });   // the hair
    bx(r, 'head', 0.3, 0.46, 0.25, 0.1, 0.23, 0.12, { '*': X1, t: SW(0) }, { z: 0.1, z1: 0.05, faces: 'fblrt' });   // the pompadour's wave
    bx(r, 'hips', -0.02, 0.12, 0.46, 0.31, 0.46, 0.31, { '*': X2 }, { faces: 'fblr' });   // blazer hem
    bx(r, 'torso', 0.3, 0.42, 0.1, 0.025, 0.1, 0.025, { '*': X3 }, { x: -0.16, z: 0.17, faces: 'fblr' });   // the rosette
    bx(r, 'handl', 0.08, -0.3, 0.3, 0.025, 0.3, 0.025, { b: X12, '*': SW(2) }, { z: -0.07 });   // the closure notice on its clipboard
    bx(r, 'handr', -0.1, -0.21, 0.045, 0.05, 0.04, 0.045, { '*': SW(3) }, { x: -0.03, faces: 'fblrd' });   // thumbs up
    return r;
  },
  enforcer() {  // SIGNATURE: a fedora pulled down over his eyes. A padded pinstripe suit, a toothpick, brass knuckles on big fists
    const r = goon({ shoulder: 0.68, chestD: 0.36, waist: 0.42, head: [0.24, 0.29, 0.26], neckW: 0.15, handK: 1.3, farmK: 1.1 });
    bx(r, 'head', 0.185, 0.21, 0.47, 0.47, 0.47, 0.47, { '*': X1 }, { z: 0.02 });   // the brim, pulled low
    bx(r, 'head', 0.21, 0.38, 0.29, 0.29, 0.24, 0.23, { '*': X2, t: SW(0) }, { faces: 'fblrt' });   // the crown and its band
    bx(r, 'head', 0.055, 0.1, 0.02, 0.02, 0.02, 0.02, { '*': SW(1) }, { x: -0.05, x1: -0.08, z: 0.15, faces: 'fblr' });   // the toothpick
    for (const nm of ['l', 'r']) bx(r, 'hand' + nm, -0.15, -0.2, 0.2, 0.08, 0.2, 0.08, { '*': X3 }, { z: 0.03 });   // brass knuckles
    bx(r, 'torso', 0.42, 0.51, 0.78, 0.37, 0.78, 0.37, { '*': X4 }, { faces: 'fblrt' });   // padded shoulders
    return r;
  },
  aokiagent() { // SIGNATURE: a red visor glowing across his eyes. A sleek black suit, a glowing company badge, sword-straight, a blade hand out
    const r = goon({ shoulder: 0.56, chestD: 0.3, waist: 0.34, thighW: 0.17, head: [0.22, 0.3, 0.24], neckW: 0.1 });
    bx(r, 'head', 0.13, 0.19, 0.245, 0.265, 0.245, 0.265, { '*': X1 }, { faces: 'fblr' });   // the visor's band, round his head
    bx(r, 'head', 0.135, 0.185, 0.27, 0.025, 0.27, 0.025, { '*': X2 }, { z: 0.14 });   // its red lens
    bx(r, 'head', 0.23, 0.37, 0.245, 0.27, 0.2, 0.25, { '*': X3, t: SW(0) }, { z: -0.01, z1: -0.02, faces: 'fblrt' });   // slicked hair
    bx(r, 'torso', 0.46, 0.6, 0.3, 0.24, 0.27, 0.22, { '*': X4 }, { faces: 'fblr' });   // a high stiff collar
    bx(r, 'torso', 0.31, 0.4, 0.08, 0.03, 0.08, 0.03, { '*': X5 }, { x: -0.13, z: 0.155, faces: 'fblr' });   // the glowing badge
    bx(r, 'hips', 0.12, -0.36, 0.4, 0.28, 0.46, 0.32, { '*': X12 }, { faces: 'fblr' });   // the jacket's long skirt
    return r;
  },
  ivan() {     // Krasnovian bouncer: wrestler frame in a tracksuit
    const r = humanoid({ torso: TA, legs: TB, arms: TA_S, hands: TC, feet: TD, shoulder: 0.68, chestD: 0.42, waist: 0.5,
      neck: -0.02, head: [0.25, 0.29, 0.27], thighW: 0.22 });
    r.torso[3].push((a) => tbox(a, null, 0.0, 0.34, 0.5, 0.38, 0.62, 0.46, chest(TA), { z: 0.02, faces: 'fblr' }));
    r.torso[3].push((a) => tbox(a, null, 0.44, 0.56, 0.5, 0.3, 0.3, 0.24, chest([33, 33, 47, 36]), { faces: 'fblrt' }));
    for (const nm of ['l', 'r']) r['uarm' + nm][3] = [(a) => tbox(a, null, 0.06, -0.31, 0.19, 0.19, 0.15, 0.16, { '*': TA_S })];
    return r;
  },
};

// Poses: degrees, Euler order YXZ. The character faces local +z.
const POSES = {
  boso: { torso: [6, 8, 0], head: [-6, -14, 4], uarml: [-8, 0, -12], farml: [-70, 30, 0], uarmr: [14, 0, 10], farmr: [-12, 0, 0],
    thighl: [-6, 0, -4], thighr: [4, 0, 6], shinl: [8, 0, 0], hips: [0, 10, 0] },
  boxer: { torso: [10, -10, 0], head: [8, 10, 0], uarml: [-62, 0, -26], farml: [-96, 0, 0], uarmr: [-48, 0, 24], farmr: [-108, 0, 0],
    thighl: [-20, 0, -6], shinl: [24, 0, 0], thighr: [16, 0, 6], shinr: [12, 0, 0], hips: [0, 20, 0], handl: [10, 0, 0], handr: [14, 0, 0] },
  wrestler: { torso: [14, 0, 0], head: [-4, 0, 0], uarml: [-40, 0, -40], farml: [-70, 0, 0], uarmr: [-40, 0, 40], farmr: [-70, 0, 0],
    thighl: [-14, 0, -22], thighr: [-14, 0, 22], shinl: [26, 0, 4], shinr: [26, 0, -4], footl: [-12, -14, 0], footr: [-12, 14, 0] },
  hurt: { torso: [-18, 12, -8], head: [-24, 20, -12], uarml: [-30, 0, -46], farml: [-40, 0, 0], uarmr: [10, 0, 40], farmr: [-20, 0, 0],
    thighl: [-10, 0, -8], shinl: [12, 0, 0], thighr: [12, 0, 10], hips: [0, 0, 6] },
  stagger: { torso: [-10, 0, 10], head: [-20, -25, 14], uarml: [10, 0, -30], farml: [-20, 0, 0], uarmr: [10, 0, 30], farmr: [-20, 0, 0],
    thighl: [-6, 0, -8], thighr: [6, 0, 8] },
  ko: { torso: [-20, 0, 12], head: [-20, 30, 10], uarml: [-20, 0, -100], uarmr: [-10, 0, 105], farml: [-30, 0, 0], farmr: [-40, 0, 0],
    thighl: [-30, 0, -10], shinl: [40, 0, 0], thighr: [-8, 0, 12] },
  held: { uarml: [-20, 0, -100], uarmr: [-20, 0, 100], farml: [-30, 0, 0], farmr: [-30, 0, 0], thighl: [-30, 0, -10], thighr: [10, 0, 10], shinl: [40, 0, 0] },
  grabWind: { torso: [16, 0, 0], uarml: [-60, 0, -60], uarmr: [-60, 0, 60], farml: [-40, 0, 0], farmr: [-40, 0, 0], thighl: [-20, 0, -22], thighr: [-20, 0, 22], shinl: [30, 0, 0], shinr: [30, 0, 0] },
  kneel: { torso: [28, 0, 0], head: [-12, 0, 0], thighl: [-85, 0, -6], shinl: [82, 0, 0], footl: [-10, 0, 0], thighr: [-8, 0, 8], shinr: [104, 0, 0], footr: [40, 0, 0],
    uarml: [-35, 0, -14], farml: [-20, 0, 0], uarmr: [-20, 0, 18], farmr: [-30, 0, 0] },
  clinch: { torso: [20, 0, 0], uarml: [-85, 0, -20], uarmr: [-85, 0, 20], farml: [-50, 0, 0], farmr: [-50, 0, 0], thighl: [-14, 0, -18], thighr: [-14, 0, 18] },
  batboy: { torso: [4, -6, 0], head: [-4, 8, 0], uarml: [-20, 0, -10], farml: [-40, 0, 0], uarmr: [-35, 0, 30], farmr: [-95, 0, 0],
    thighl: [-8, 0, -6], shinl: [10, 0, 0], thighr: [6, 0, 6], hips: [0, 12, 0] },
  cook: { torso: [-4, 0, 0], head: [-6, 0, 0], uarml: [6, 0, -28], farml: [-75, 20, 0], uarmr: [6, 0, 28], farmr: [-75, -20, 0], thighl: [-4, 0, -6], thighr: [4, 0, 6] },
  batWind: { torso: [0, 40, 0], head: [0, -30, 0], uarmr: [-150, 0, 40], farmr: [-60, 0, 0], uarml: [-80, 0, 30], farml: [-60, 0, 0],
    thighl: [-14, 0, -8], shinl: [16, 0, 0], thighr: [10, 0, 8], hips: [0, 25, 0] },
  batStrike: { torso: [8, -35, 0], head: [0, 20, 0], uarmr: [-90, 0, 10], farmr: [-10, 0, 0], uarml: [-70, 0, -10], farml: [-30, 0, 0],
    thighl: [-20, 0, -6], shinl: [20, 0, 0], thighr: [14, 0, 6], hips: [0, -20, 0] },
  poleWind: { torso: [4, 32, 0], head: [-4, -26, 0], uarmr: [-24, 0, 30], farmr: [-80, 0, 0], uarml: [-62, 0, -12], farml: [-50, 0, 0],
    thighl: [-18, 0, -8], shinl: [20, 0, 0], thighr: [10, 0, 8], hips: [0, 22, 0] },
  poleStrike: { torso: [18, -18, 0], head: [-10, 14, 0], uarmr: [-82, 0, 10], farmr: [-12, 0, 0], uarml: [-84, 0, -14], farml: [-36, 0, 0],
    thighl: [-36, 0, -6], shinl: [30, 0, 0], thighr: [18, 0, 8], hips: [0, -14, 0] },
  cartwheel: { torso: [0, 0, 0], head: [-6, 0, 0], uarml: [0, 0, -165], farml: [0, 0, 0], uarmr: [0, 0, 165], farmr: [0, 0, 0],
    thighl: [0, 0, -38], shinl: [0, 0, 0], thighr: [0, 0, 38], shinr: [0, 0, 0] },
  dodge: { hips: [0, -20, 0], torso: [-14, 22, 16], head: [-10, 0, 10], uarml: [-60, 0, -30], farml: [-100, 0, 0], uarmr: [-50, 0, 30], farmr: [-100, 0, 0],
    thighl: [-20, 0, -12], shinl: [24, 0, 0], thighr: [10, 0, 10] },
  lob: { torso: [-14, 20, 0], head: [-10, -15, 0], uarmr: [-160, 0, 20], farmr: [-50, 0, 0], uarml: [-60, 0, -20], farml: [-20, 0, 0], thighr: [8, 0, 6], thighl: [-10, 0, -6] },
  lobRelease: { torso: [16, -10, 0], head: [6, 0, 0], uarmr: [-110, 0, 6], farmr: [-6, 0, 0], uarml: [-20, 0, -14], farml: [-30, 0, 0], thighl: [-18, 0, -6], shinl: [18, 0, 0] },
};
POSES.rocco = POSES.boxer; POSES.ivan = POSES.wrestler; POSES.volkov = POSES.wrestler;
POSES.conscript = { torso: [12, 4, 0], head: [16, -10, 8], uarml: [2, 0, -8], farml: [-18, 0, 0], uarmr: [2, 0, 8], farmr: [-22, 0, 0],   // slouched, head lolling
  thighl: [-4, 0, -4], thighr: [4, 0, 4], hips: [0, 6, 0] };
POSES.laborer = { torso: [8, -6, 0], head: [-2, 6, 0], uarml: [-14, 0, -12], farml: [-36, 0, 0], uarmr: [-30, 0, 28], farmr: [-90, 0, 0],
  thighl: [-8, 0, -8], shinl: [10, 0, 0], thighr: [6, 0, 8], hips: [0, 10, 0] };
Object.assign(POSES, {
  secguard: { torso: [8, 0, 0], head: [-4, 0, 0], uarml: [-15, 0, 16], farml: [-55, 0, 0], uarmr: [10, 0, 14], farmr: [-30, 0, 0],
    thighl: [-10, 0, -6], shinl: [12, 0, 0], thighr: [8, 0, 6], hips: [0, -10, 0] },
  kicker: { hips: [0, 25, 0], torso: [6, -15, 0], head: [-4, -10, 0], uarml: [-50, 0, -20], farml: [-110, 0, 0], uarmr: [-35, 0, 25], farmr: [-120, 0, 0],
    thighl: [-18, 0, -8], shinl: [16, 0, 0], thighr: [12, 0, 10], shinr: [10, 0, 0] },
  kickHighWind: { hips: [0, 30, 0], torso: [-8, -20, 0], uarml: [-40, 0, -30], farml: [-110, 0, 0], uarmr: [-20, 0, 40], farmr: [-100, 0, 0],
    thighr: [-90, 0, 10], shinr: [115, 0, 0], thighl: [-6, 0, -6], shinl: [10, 0, 0] },
  kickHighStrike: { hips: [0, 40, 0], torso: [-25, -25, 0], uarml: [-30, 0, -40], farml: [-90, 0, 0], uarmr: [10, 0, 50], farmr: [-60, 0, 0],
    thighr: [-125, 0, 15], shinr: [0, 0, 0], footr: [-30, 0, 0], thighl: [-4, 0, -6], shinl: [8, 0, 0] },
  kickLowWind: { hips: [0, 10, 0], torso: [10, 10, 0], uarml: [-50, 0, -20], farml: [-110, 0, 0], uarmr: [-35, 0, 25], farmr: [-120, 0, 0],
    thighl: [-35, 0, -10], shinl: [80, 0, 0], thighr: [-10, 0, 8], shinr: [20, 0, 0] },
  kickLowStrike: { hips: [0, -25, 0], torso: [14, 25, 0], uarml: [-20, 0, -40], farml: [-80, 0, 0], uarmr: [-50, 0, 30], farmr: [-110, 0, 0],
    thighl: [-55, 0, 15], shinl: [0, 0, 0], thighr: [-14, 0, 8], shinr: [24, 0, 0] },
});
Object.assign(POSES, {   // the newer goons' idle poses: every one has attitude (docs/goon-style.md)
  sambo: { hips: [0, 10, 0], torso: [30, -6, 0], head: [-28, 6, 0], uarml: [-58, 0, -30], farml: [-44, 0, 0], uarmr: [-50, 0, 32], farmr: [-48, 0, 0],   // a low wrestler's crouch
    thighl: [-30, 0, -16], shinl: [42, 0, 4], thighr: [-24, 0, 16], shinr: [38, 0, -4], footl: [-12, -10, 0], footr: [-12, 10, 0] },
  gymnast: { hips: [0, 12, 0], torso: [-10, -6, 4], head: [-16, 8, -6], uarml: [6, 0, -48], farml: [-8, 0, -10], uarmr: [-10, 0, 150], farmr: [0, 0, 12],   // stuck the landing: one arm up
    thighl: [-16, 0, -4], shinl: [4, 0, 0], footl: [40, 0, 0], thighr: [4, 0, 8], shinr: [6, 0, 0] },
  lifter: { torso: [-4, 0, 0], head: [-8, 0, 0], uarml: [0, 0, -88], farml: [0, 0, -100], uarmr: [0, 0, 88], farmr: [0, 0, 100],   // a double-biceps flex
    thighl: [-20, 0, -20], shinl: [28, 0, 8], thighr: [-20, 0, 20], shinr: [28, 0, -8] },
  guard: { torso: [-7, 0, 0], head: [-12, 0, 0], uarml: [-8, 0, -8], farml: [-48, 0, 0], uarmr: [-18, 0, 14], farmr: [-78, 0, 0], thighl: [0, 0, -2], thighr: [0, 0, 2] },   // ramrod, hand on the sabre
  bandsman: { hips: [0, 6, 0], torso: [-8, 0, 0], head: [-8, 4, 0], uarml: [-34, 0, -24], farml: [-56, 0, 0], uarmr: [-140, 0, 24], farmr: [-36, 0, 0],   // high-stepping, mallet up
    thighl: [-58, 0, -4], shinl: [74, 0, 0], footl: [20, 0, 0], thighr: [3, 0, 4] },
  specialist: { torso: [10, -12, 0], head: [6, 14, -8], uarml: [-62, 0, -26], farml: [-96, 0, 0], uarmr: [-48, 0, 24], farmr: [-108, 0, 0],   // guard high, head cocked
    thighl: [-20, 0, -6], shinl: [24, 0, 0], thighr: [16, 0, 6], shinr: [12, 0, 0], hips: [0, 20, 0], handl: [10, 0, 0], handr: [14, 0, 0] },
  militia: { torso: [18, 0, 0], head: [-12, 0, 0], uarml: [-34, 0, -58], farml: [-58, 0, 0], uarmr: [-34, 0, 58], farmr: [-58, 0, 0],   // arms wide to grab
    thighl: [-16, 0, -24], shinl: [28, 0, 4], thighr: [-16, 0, 24], shinr: [28, 0, -4], footl: [-12, -14, 0], footr: [-12, 14, 0] },
  inspector: { hips: [0, -6, 0], torso: [-8, 0, 0], head: [-18, -12, 4], uarml: [-34, 0, -8], farml: [-104, 0, 0], uarmr: [-26, 0, 12], farmr: [-80, 0, 0],   // nose up, clipboard up
    thighl: [-2, 0, -3], thighr: [2, 0, 3] },
  clerk: { torso: [24, 0, 0], head: [-14, 0, 0], uarml: [-16, 0, -14], farml: [-84, 0, 32], uarmr: [-150, 0, 16], farmr: [-34, 0, 0],   // hunched, the stamp up
    thighl: [-8, 0, 5], shinl: [14, 0, -3], thighr: [-8, 0, -5], shinr: [14, 0, 3] },
  bodyguard: { hips: [0, 10, 0], torso: [10, -6, 0], head: [-6, 4, 0], uarml: [-46, 0, -34], farml: [-100, 0, 0], uarmr: [-40, 0, 34], farmr: [-104, 0, 0],   // a wall with fists up
    thighl: [-14, 0, -12], shinl: [16, 0, 0], thighr: [8, 0, 12] },
  orlova: { hips: [0, 8, 0], torso: [-6, 8, 0], head: [-12, -10, 6], uarml: [10, 0, -44], farml: [0, 0, 92], uarmr: [-24, 0, 30], farmr: [-100, 0, -16],   // hand on hip, baton up
    thighl: [-4, 0, -6], thighr: [4, 0, 4] },
  chairman: { torso: [-10, 0, 0], head: [-8, 6, 0], uarml: [-12, 0, -24], farml: [-74, 0, 24], uarmr: [-14, 0, 118], farmr: [0, 0, 26],   // belly out, waving from the stand
    thighl: [0, 0, -8], thighr: [0, 0, 8] },
  harmony: { hips: [0, 8, 0], torso: [4, -10, 0], head: [-6, 14, -12], uarml: [-24, 0, -30], farml: [-112, 0, 0], uarmr: [-26, 0, 16], farmr: [-118, 0, 0],   // notice up, thumbs up
    thighl: [-2, 0, -4], thighr: [4, 0, 6] },
  enforcer: { hips: [0, 18, 0], torso: [-6, -12, 0], head: [10, 10, -6], uarml: [-52, 0, -28], farml: [-100, 0, 0], uarmr: [-40, 0, 26], farmr: [-110, 0, 0],   // leaning back, fists up
    thighl: [-18, 0, -8], shinl: [20, 0, 0], thighr: [14, 0, 8], shinr: [10, 0, 0] },
  aokiagent: { hips: [0, 30, 0], torso: [-4, -24, 0], head: [-6, -6, 0], uarml: [30, 0, -8], farml: [-60, 0, 40], uarmr: [-72, 0, 8], farmr: [-24, 0, 0],   // bladed, one hand out
    thighl: [-10, 0, -4], shinl: [8, 0, 0], thighr: [6, 0, 6] },
});
function attackPose(type, side, phase) {   // phase: 'windup' | 'strike'
  if (type === 'batboy-bat') return phase === 'windup' ? POSES.batWind : POSES.batStrike;
  if (type === 'pole-bat') return phase === 'windup' ? POSES.poleWind : POSES.poleStrike;
  if (type === 'kickHigh' || type === 'kickLow') return POSES[type + (phase === 'windup' ? 'Wind' : 'Strike')];
  const base = Object.assign({}, POSES[type]);
  const s = side === 'r' ? 1 : -1, n = side;
  if (phase === 'windup') { base.torso = [4, 25 * s, 0]; base['uarm' + n] = [25, 0, 35 * s]; base['farm' + n] = [-110, 0, 0]; }
  else { base.torso = [6, -22 * s, 0]; base['uarm' + n] = [-88, 0, 6 * s]; base['farm' + n] = [-8, 0, 0]; }
  return base;
}

// ============================== hands (player model) ========================
function buildHandMesh(left) {
  const acc = new GeoAcc();
  const TAPE = [0, 0, 32, 32], KNUCK = [32, 0, 64, 32], ARM = [0, 32, 32, 64], DENIM = [32, 32, 48, 48], CUFF = [48, 32, 64, 48];
  const knu = left ? TAPE : KNUCK;   // the scar is on the right knuckles
  tbox(acc, null, -0.06, 0.07, 0.12, 0.13, 0.12, 0.13, { '*': TAPE, t: knu });
  tbox(acc, null, 0.07, 0.095, 0.11, 0.1, 0.105, 0.09, { '*': knu }, { faces: 'tflrb' });
  tbox(acc, null, -0.02, 0.06, 0.04, 0.05, 0.035, 0.045, { '*': TAPE }, { x: left ? 0.075 : -0.075, z: -0.03 });
  tbox(acc, null, -0.06, -0.16, 0.1, 0.11, 0.095, 0.1, { '*': left ? ARM : [0, 52, 32, 64] });   // tattoo on the left wrist
  tbox(acc, null, -0.16, -0.36, 0.095, 0.1, 0.11, 0.11, { '*': [0, 40, 32, 64] });
  tbox(acc, null, -0.33, -0.42, 0.14, 0.14, 0.14, 0.14, { '*': CUFF });
  tbox(acc, null, -0.42, -0.7, 0.13, 0.13, 0.15, 0.15, { '*': DENIM });
  return new THREE.Mesh(acc.geometry(), makeMat('sheet_hands', { tint: [0.85, 0.88, 0.95] }));
}
