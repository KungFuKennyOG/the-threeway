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
function humanoid(p) {
  const P = Object.assign({ torso: TA, legs: TD, arms: TC, hands: TC, feet: TD, shoulder: 0.56, chestD: 0.32, waist: 0.38, neck: 0.07,
    head: [0.23, 0.30, 0.26], thighW: 0.18, headSide: HAIR, uv: {} }, p);
  const [hw, hh, hd] = P.head, U = (k, r) => P.uv[k] || { '*': r };
  const parts = [
    ['hips', null, [0, 1.06, 0], [(a) => tbox(a, null, -0.12, 0.08, P.waist, 0.25, P.waist, 0.25, U('hips', P.legs))]],
    ['torso', 'hips', [0, 0.08, 0], [(a) => tbox(a, null, 0, 0.5, P.waist, 0.25, P.shoulder, P.chestD, chest(P.torso), { sub: 2, faces: 'fblrt' })]],
    ['head', 'torso', [0, 0.5 + P.neck, 0.01], [
      (a, f) => tbox(a, f, 0, hh, hw, hd, hw * 0.92, hd * 0.95, { f: FACE, b: P.headSide, l: P.headSide, r: P.headSide, t: P.headTop || (P.headSide === HEADS ? HEADT : P.headSide), d: P.headSide }, { sub: 2 }),
      (a) => tbox(a, null, -P.neck - 0.02, 0.02, 0.13, 0.13, 0.12, 0.12, { '*': TC }, { faces: 'fblr' })]],
  ];
  for (const [s, nm] of [[-1, 'l'], [1, 'r']]) {
    parts.push(['uarm' + nm, 'torso', [s * (P.shoulder / 2 + 0.04), 0.44, 0], [(a) => tbox(a, null, 0.04, -0.31, 0.15, 0.15, 0.12, 0.13, U('uarm', P.arms))]]);
    parts.push(['farm' + nm, 'uarm' + nm, [0, -0.31, 0], [(a) => tbox(a, null, 0.02, -0.27, 0.12, 0.12, 0.1, 0.1, U('farm', P.arms))]]);
    parts.push(['hand' + nm, 'farm' + nm, [0, -0.27, 0], [(a) => tbox(a, null, 0, -0.13, 0.13, 0.14, 0.13, 0.13, U('hand', P.hands))]]);
    parts.push(['thigh' + nm, 'hips', [s * 0.11, -0.08, 0], [(a) => tbox(a, null, 0.02, -0.47, P.thighW, P.thighW + 0.01, 0.14, 0.15, U('thigh', P.legs))]]);
    parts.push(['shin' + nm, 'thigh' + nm, [0, -0.47, 0], [(a) => tbox(a, null, 0.02, -0.43, 0.135, 0.14, 0.11, 0.12, U('shin', P.legs))]]);
    parts.push(['foot' + nm, 'shin' + nm, [0, -0.43, 0], [(a) => tbox(a, null, 0, -0.1, 0.13, 0.29, 0.13, 0.29, U('foot', P.feet), { z: 0.07 })]]);
  }
  const idx = {}; parts.forEach(p => idx[p[0]] = p);
  return idx;
}
// a peaked cap: a crown flaring out over the head (X1 round its side, SW(1) on top) and a black visor (SW(0)).
// The cap's band is painted on the face's top rows and on HEADS.
function peakedCap(r, o = {}) {
  const w = o.w || 0.33, d = o.d || 0.36, top = o.top || 0.38, y0 = o.y0 || 0.285;
  r.head[3].push((a) => tbox(a, null, y0, top, 0.245, 0.27, w, d, { '*': X1, t: SW(1) }, { z: 0.005, faces: 'fblrt' }));
  r.head[3].push((a) => tbox(a, null, y0 - 0.04, y0 - 0.018, 0.235, 0.12, 0.235, 0.12, { '*': SW(0) }, { z: 0.17 }));
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
  // ---- the Palace of Sport and Parade Square (sheets: tools/goons_palace.py)
  sambo() {    // a young sambo fighter: red kurtka with shoulder wings and a blue belt, blue shorts, bare legs, high wrestling shoes
    const r = humanoid({ torso: TA, legs: X4, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.56, chestD: 0.31, waist: 0.39, headSide: HEADS,
      uv: { hips: { '*': TB }, shin: { '*': X5 } } });
    r.hips[3].push((a) => tbox(a, null, 0.0, 0.07, 0.43, 0.28, 0.43, 0.28, { f: X2, '*': X3 }, { faces: 'fblr' }));   // the belt, knotted at the front
    r.torso[3].push((a) => tbox(a, null, 0.42, 0.51, 0.64, 0.3, 0.66, 0.3, chest([32, 32, 48, 35]), { faces: 'fblrt' }));   // the jacket's shoulder wings
    return r;
  },
  gymnast() {  // a gymnast: red zip-up tracksuit top with a gold stripe, red leotard, white leggings and slippers, hair slicked into a bun
    const r = humanoid({ torso: TA, legs: TB, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.5, chestD: 0.28, waist: 0.34, thighW: 0.16,
      head: [0.21, 0.29, 0.24], headSide: HEADS, uv: { hips: { '*': X2 } } });
    r.head[3].push((a) => tbox(a, null, 0.19, 0.31, 0.11, 0.1, 0.09, 0.08, { '*': X3 }, { z: -0.15 }));   // the bun
    r.torso[3].push((a) => tbox(a, null, 0.46, 0.57, 0.3, 0.24, 0.27, 0.21, chest([32, 32, 48, 34]), { faces: 'fblr' }));   // stand-up collar
    return r;
  },
  lifter() {   // a weightlifter: navy singlet, a wide leather belt, huge bare arms, wrist wraps, knee wraps, red lifting shoes
    const r = humanoid({ torso: TA, legs: X2, arms: X3, hands: X4, feet: TD_R, shoulder: 0.8, chestD: 0.48, waist: 0.6, neck: -0.04,
      head: [0.25, 0.29, 0.27], thighW: 0.25, headSide: HEADS, uv: { hips: { '*': TB }, shin: { '*': X5 } } });
    r.torso[3].push((a) => tbox(a, null, 0.0, 0.34, 0.62, 0.46, 0.72, 0.52, chest([32, 38, 48, 48]), { z: 0.03, faces: 'fblr' }));   // the belly
    r.hips[3].push((a) => tbox(a, null, 0.02, 0.2, 0.66, 0.5, 0.66, 0.5, { f: X6, '*': X7 }, { faces: 'fblr' }));   // the belt
    r.head[3].push((a) => tbox(a, null, 0.26, 0.35, 0.25, 0.27, 0.25, 0.27, { '*': SW(4) }, { faces: 'fblrt' }));   // the flat-top
    for (const nm of ['l', 'r']) {
      r['uarm' + nm][3] = [(a) => tbox(a, null, 0.06, -0.31, 0.24, 0.24, 0.19, 0.19, { '*': X3 })];
      r['farm' + nm][3] = [(a) => tbox(a, null, 0.02, -0.27, 0.18, 0.18, 0.14, 0.14, { '*': X3 })];
    }
    return r;
  },
  guard() {    // the honour guard: a long parade coat, white belt and gloves, gold aiguillette and shoulder boards, a tall peaked cap
    const r = humanoid({ torso: TA, legs: TD_L, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.6, chestD: 0.34, waist: 0.42, headSide: HEADS });
    r.hips[3].push((a) => tbox(a, null, 0.06, -0.62, 0.46, 0.32, 0.6, 0.42, { '*': TB }, { faces: 'fblr' }));   // the coat to the knee
    peakedCap(r, { w: 0.37, d: 0.39, top: 0.42 });
    for (const x of [-0.25, 0.25]) r.torso[3].push((a) => tbox(a, null, 0.47, 0.52, 0.13, 0.2, 0.13, 0.2, { '*': SW(2) }, { x }));   // gold shoulder boards
    return r;
  },
  bandsman() { // the brass band: a white-topped peaked cap, a red tunic with gold frogging, navy trousers, a snare drum on the hip
    const r = humanoid({ torso: TA, legs: TD_L, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.58, chestD: 0.34, waist: 0.44, headSide: HEADS, uv: { hips: { '*': TB } } });
    peakedCap(r, { w: 0.31, d: 0.34, top: 0.37 });
    r.hips[3].push((a) => tbox(a, null, -0.24, -0.06, 0.3, 0.3, 0.3, 0.3, { '*': X2, t: X3, d: X3 }, { x: -0.36, z: 0.08 }));   // the snare drum
    return r;
  },
  specialist() {   // the specialist: black leather jacket, collar up, black tracksuit trousers with white side stripes, white trainers, a crew cut
    const r = humanoid({ torso: TA, legs: X2, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.6, chestD: 0.33, waist: 0.4, headSide: HEADS,
      uv: { hips: { '*': TB }, thigh: { '*': X2, l: X3, r: X3 }, shin: { '*': X2, l: X3, r: X3 } } });
    r.torso[3].push((a) => tbox(a, null, 0.44, 0.6, 0.42, 0.31, 0.32, 0.25, chest([32, 32, 48, 34]), { faces: 'fblrt' }));   // the collar, turned up
    r.hips[3].push((a) => tbox(a, null, 0.0, 0.14, 0.46, 0.31, 0.46, 0.31, chest([32, 42, 48, 48]), { faces: 'fblr' }));   // jacket hem
    return r;
  },
  // ---- the Tower of Labor (sheets: tools/goons_tower.py)
  militia() {  // Ministry militiaman: grey-blue tunic with a belt and cross strap, red-banded peaked cap, a wrestler's build
    const r = humanoid({ torso: TA, legs: TD_L, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.66, chestD: 0.42, waist: 0.5,
      neck: -0.02, head: [0.25, 0.29, 0.27], thighW: 0.22, headSide: HEADS, uv: { hips: { '*': TB } } });
    r.torso[3].push((a) => tbox(a, null, 0.0, 0.32, 0.5, 0.36, 0.6, 0.44, chest([32, 40, 48, 48]), { z: 0.02, faces: 'fblr' }));   // barrel chest
    peakedCap(r, { w: 0.34, d: 0.37, top: 0.38, y0: 0.27 });
    return r;
  },
  inspector() {   // Ministry inspector: a long grey-blue uniform coat, blue-banded cap, a clipboard in the left hand
    const r = humanoid({ torso: TA, legs: TD_L, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.54, chestD: 0.3, waist: 0.4, headSide: HEADS });
    r.hips[3].push((a) => tbox(a, null, 0.06, -0.58, 0.44, 0.3, 0.54, 0.38, { '*': TB }, { faces: 'fblr' }));   // coat to the knee
    peakedCap(r, { w: 0.32, d: 0.35, top: 0.37 });
    r.handl[3].push((a) => tbox(a, null, -0.02, -0.36, 0.02, 0.26, 0.02, 0.26, { r: X2, l: X3, '*': SW(2) }, { x: 0.06, z: 0.04 }));   // the clipboard
    return r;
  },
  clerk() {    // office clerk: shirtsleeves with red garters, a brown waistcoat, glasses, a bald crown; a rubber stamp in his fist
    const r = humanoid({ torso: TA, legs: TD_L, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.52, chestD: 0.3, waist: 0.4, headSide: HEADS,
      uv: { hips: { '*': TB }, uarm: { '*': X2 }, farm: { '*': X3 } } });
    r.handr[3].push((a) => tbox(a, null, -0.1, -0.22, 0.05, 0.05, 0.045, 0.045, { '*': SW(2) }));            // the stamp's handle
    r.handr[3].push((a) => tbox(a, null, -0.22, -0.27, 0.12, 0.08, 0.12, 0.08, { '*': SW(3), d: SW(4) }));    // its pad
    return r;
  },
  bodyguard() {   // the Chairman's bodyguard: dark suit, a red tie (front only), sunglasses, an earpiece and its cord, a buzz cut
    const r = humanoid({ torso: TA, legs: TD_L, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.64, chestD: 0.36, waist: 0.46, headSide: HEADS, uv: { hips: { '*': TB } } });
    r.head[3].push((a) => tbox(a, null, 0.09, 0.16, 0.035, 0.06, 0.035, 0.06, { '*': SW(2) }, { x: 0.125, z: 0.01 }));    // the earpiece
    r.head[3].push((a) => tbox(a, null, -0.12, 0.09, 0.015, 0.015, 0.015, 0.015, { '*': SW(2) }, { x: 0.12, z: -0.03 }));  // its cord
    return r;
  },
  orlova() {   // Inspector Vera Orlova: a grey-blue Ministry greatcoat, gold epaulettes, a red armband, a peaked cap over a tight bun, black gloves and boots
    const r = humanoid({ torso: TA, legs: TD_L, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.54, chestD: 0.3, waist: 0.38, thighW: 0.17,
      head: [0.22, 0.29, 0.25], headSide: HEADS, uv: { shin: { '*': X4 } } });
    r.hips[3].push((a) => tbox(a, null, 0.06, -0.66, 0.44, 0.3, 0.58, 0.4, { '*': TB }, { faces: 'fblr' }));   // the greatcoat, to mid-calf
    peakedCap(r, { w: 0.31, d: 0.34, top: 0.37 });
    r.head[3].push((a) => tbox(a, null, 0.12, 0.24, 0.1, 0.09, 0.08, 0.07, { '*': X3 }, { z: -0.15 }));   // the bun under the cap
    for (const x of [-0.22, 0.22]) r.torso[3].push((a) => tbox(a, null, 0.47, 0.52, 0.12, 0.18, 0.12, 0.18, { '*': SW(2) }, { x }));   // gold epaulettes
    r.uarml[3] = [(a) => tbox(a, null, 0.04, -0.31, 0.15, 0.15, 0.12, 0.13, { '*': X2 })];   // the red armband, on one arm
    return r;
  },
  chairman() {    // the Chairman: elderly and heavy, a big grey suit, medals, a dark red tie, bushy grey eyebrows, a bald crown
    const r = humanoid({ torso: TA, legs: TD_L, arms: SLEEVE, hands: HAND, feet: TD_R, shoulder: 0.7, chestD: 0.44, waist: 0.6, neck: -0.02,
      head: [0.26, 0.3, 0.28], thighW: 0.22, headSide: HEADS, uv: { hips: { '*': TB } } });
    r.torso[3].push((a) => tbox(a, null, -0.02, 0.32, 0.62, 0.5, 0.68, 0.52, chest([32, 38, 48, 48]), { z: 0.04, faces: 'fblr' }));   // the belly
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
Object.assign(POSES, {   // the Palace of Sport and Parade Square
  sambo: { hips: [0, 10, 0], torso: [24, -6, 0], head: [-16, 6, 0], uarml: [-52, 0, -26], farml: [-62, 0, 0], uarmr: [-44, 0, 28], farmr: [-66, 0, 0],
    thighl: [-22, 0, -12], shinl: [30, 0, 0], thighr: [-8, 0, 12], shinr: [22, 0, 0] },
  gymnast: { hips: [0, 14, 0], torso: [-5, -4, 0], head: [-10, 6, 0], uarml: [8, 0, -16], farml: [-14, 0, 0], uarmr: [8, 0, 16], farmr: [-14, 0, 0],
    thighl: [-4, 0, -4], thighr: [5, 0, 7] },
  lifter: { torso: [6, 0, 0], head: [-6, 0, 0], uarml: [-10, 0, -20], farml: [-30, 0, 0], uarmr: [-10, 0, 20], farmr: [-30, 0, 0],
    thighl: [-6, 0, -10], thighr: [-6, 0, 10], shinl: [8, 0, 0], shinr: [8, 0, 0] },
  guard: { torso: [-2, 0, 0], head: [-6, 0, 0], uarml: [0, 0, -6], farml: [-8, 0, 0], uarmr: [-18, 0, 14], farmr: [-78, 0, 0], thighl: [0, 0, -3], thighr: [0, 0, 3] },
  bandsman: { torso: [-3, 0, 0], head: [-6, 4, 0], uarml: [4, 0, -24], farml: [-40, 0, 0], uarmr: [4, 0, 24], farmr: [-60, -10, 0], thighl: [-4, 0, -6], thighr: [4, 0, 6] },
});
POSES.specialist = POSES.boxer;
Object.assign(POSES, {   // the Tower of Labor
  militia: POSES.wrestler,
  inspector: { torso: [-2, 0, 0], head: [-8, -6, 0], uarml: [-20, 0, -8], farml: [-70, 30, 0], uarmr: [2, 0, 8], farmr: [-14, 0, 0], thighl: [-2, 0, -4], thighr: [2, 0, 4] },
  clerk: { torso: [14, 0, 0], head: [6, 0, 0], uarml: [-6, 0, -10], farml: [-30, 0, 0], uarmr: [-24, 0, 14], farmr: [-56, 0, 0], thighl: [-6, 0, -4], shinl: [8, 0, 0], thighr: [4, 0, 4] },
  bodyguard: { torso: [6, -6, 0], head: [-2, 6, 0], uarml: [-40, 0, -22], farml: [-96, 0, 0], uarmr: [-34, 0, 22], farmr: [-100, 0, 0],
    thighl: [-14, 0, -8], shinl: [16, 0, 0], thighr: [10, 0, 8], hips: [0, 12, 0] },
  orlova: { torso: [-4, 0, 0], head: [-10, 0, 0], uarml: [8, 0, -10], farml: [-20, 0, 0], uarmr: [-28, 0, 22], farmr: [-80, 0, 0], thighl: [-4, 0, -4], thighr: [4, 0, 5], hips: [0, 8, 0] },
  chairman: { torso: [-8, 0, 0], head: [-10, 0, 0], uarml: [6, 0, -18], farml: [-24, 0, 0], uarmr: [6, 0, 18], farmr: [-24, 0, 0], thighl: [0, 0, -6], thighr: [0, 0, 6] },
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
