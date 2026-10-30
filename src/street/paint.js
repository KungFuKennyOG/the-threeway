'use strict';
// ============================== the street: painted textures ================
// Tripoint Square, the old road and the militia checkpoint. Every street texture is painted in code here
// (same painter as the Vostburg map) and packed into one atlas, so the whole street is one draw call and
// the skylines another. Alpha 204 = the texel glows by itself (windows, neon, gas mantles).
const EM = 204;
let prng = (() => { let s = 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
const seedPaint = (key) => { let s = key.split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 99991, 7) + 1; prng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
const hexRGB = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8Array(w * h * 4); }
  set(x, y, col, a = 255) {
    x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const c = typeof col === 'string' ? hexRGB(col) : col, i = (y * this.w + x) * 4;
    this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = a;
  }
  rect(x, y, w, h, col, a = 255) { const c = typeof col === 'string' ? hexRGB(col) : col; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c, a); }
  fill(col, a = 255) { this.rect(0, 0, this.w, this.h, col, a); }
  speck(col, n, a = 255) { for (let k = 0; k < n; k++) this.set(Math.floor(prng() * this.w), Math.floor(prng() * this.h), col, a); }
  checker(x, y, w, h, col, a = 255) { for (let j = 0; j < h; j++) for (let i = (j & 1); i < w; i += 2) this.set(x + i, y + j, col, a); }
  text(s, x, y, col, a = 255) {
    let cx = x;
    for (const ch of String(s).toUpperCase()) { const g = GLYPHS[ch]; if (g) for (let i = 0; i < 35; i++) if (g[i] === '1') this.set(cx + (i % 5), y + Math.floor(i / 5), col, a); cx += 6; }
  }
  bigText(s, x, y, col, a = 255, k = 2) {   // the 5x7 font at k x k pixels per dot
    let cx = x;
    for (const ch of String(s).toUpperCase()) { const g = GLYPHS[ch]; if (g) for (let i = 0; i < 35; i++) if (g[i] === '1') this.rect(cx + (i % 5) * k, y + Math.floor(i / 5) * k, k, k, col, a); cx += 6 * k; }
  }
  glyph(g, x, y, col, a = 255) { const G2 = BRUSH[g % BRUSH.length]; for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) if (G2[j][i] === '1') this.set(x + i, y + j, col, a); }
}
const textW = (s) => String(s).length * 6 - 1;
const GLYPHS = {
  A: '01110100011000111111100011000110001', B: '11110100011000111110100011000111110', C: '01110100011000010000100001000101110',
  D: '11100100101000110001100011001011100', E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000',
  G: '01110100011000010111100011000101111', H: '10001100011000111111100011000110001', I: '01110001000010000100001000010001110',
  J: '00111000100001000010000101001001100', K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111',
  M: '10001110111010110101100011000110001', N: '10001100011100110101100111000110001', O: '01110100011000110001100011000101110',
  P: '11110100011000111110100001000010000', Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001',
  S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100', U: '10001100011000110001100011000101110',
  V: '10001100011000110001100010101000100', W: '10001100011000110101101011010101010', X: '10001100010101000100010101000110001',
  Y: '10001100011000101010001000010000100', Z: '11111000010001000100010001000011111',
  0: '01110100011001110101110011000101110', 1: '00100011000010000100001000010001110', 2: '01110100010000100010001000100011111',
  3: '11111000100010000010000011000101110', 4: '00010001100101010010111110001000010', 5: '11111100001111000001000011000101110',
  6: '00110010001000011110100011000101110', 7: '11111000010001000100010000100001000', 8: '01110100011000101110100011000101110',
  9: '01110100011000101111000010001001100', '.': '00000000000000000000000000110001100', '-': '00000000000000011111000000000000000',
  '!': '00100001000010000100001000000000100', '·': '00000000000000001100011000000000000',
};
const BRUSH = [
  ['11111', '00100', '11111', '00100', '01110', '10101', '00100'], ['10001', '11111', '10101', '11111', '00100', '11111', '00100'],
  ['00100', '11111', '01010', '11111', '01010', '11011', '10001'], ['11110', '10010', '11110', '00100', '11111', '00100', '01010'],
  ['01000', '11111', '01001', '01111', '01001', '11111', '00001'], ['00100', '01010', '10001', '01110', '00100', '11111', '00100'],
];
const PC = {
  plum: '#140b12', brass: '#c9a04a', cream: '#e6dac0', lantern: '#e8352b', sodium: '#ff9a3c', pink: '#ff4f9a', teal: '#33e0d0', gold: '#f2c14e',
  fluor: '#eef8ff', banner: '#b8231e', warm: '#ffcf86', gas: '#e8f2d0', militia: '#4a2440',
};
// each painter returns a Pix. Sizes are small on purpose: nearest-filtered, ≤16 colours each.
const PAINT = {
  // ---- old Vostburg (the Old Quarter)
  cobble() {   // basalt setts in staggered rows, a few worn bright, moss in the joints
    const p = new Pix(32, 32); p.fill('#231c20');
    for (let y = 0; y < 32; y += 4) for (let x = ((y >> 2) & 1) * 3 - 3; x < 32; x += 6) {
      const c = ['#5a4e52', '#52474b', '#625458', '#4a4044'][Math.floor(prng() * 4)];
      p.rect(x + 1, y + 1, 4, 3, c); p.set(x + 1, y + 1, '#5e5154'); p.set(x + 4, y + 3, '#2c2428');
    }
    p.speck('#2e3a2a', 10); return p;
  },
  setts() {   // the square: fan-laid setts (arcs)
    const p = new Pix(32, 32); p.fill('#241d21');
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const cx = (x % 16) - 8, cy = (y % 16), d = Math.hypot(cx, cy), ring = Math.floor(d / 3), ang = Math.atan2(cy, cx);
      const brick = Math.floor(ang * (2 + ring) * 1.3);
      if (d % 3 > 0.8 && (ang * (2 + ring) * 1.3) % 1 > 0.18) p.set(x, y, (ring + brick) % 3 === 0 ? '#524649' : (ring + brick) % 3 === 1 ? '#463c40' : '#3e3539');
    }
    p.speck('#5e5154', 12); return p;
  },
  flags() {   // pavement: big worn flagstones
    const p = new Pix(16, 16); p.fill('#4e4646');
    p.rect(0, 0, 16, 1, '#3a3234'); p.rect(0, 8, 16, 1, '#3a3234'); p.rect(0, 0, 1, 8, '#3a3234'); p.rect(9, 8, 1, 8, '#3a3234');
    p.speck('#5a5252', 14); p.speck('#433b3c', 10); return p;
  },
  curb() { const p = new Pix(16, 4); p.fill('#6a6264'); p.rect(0, 0, 16, 1, '#8a8284'); p.rect(0, 3, 16, 1, '#3a3234'); p.rect(7, 0, 1, 4, '#4a4244'); return p; },
  brassLine() { const p = new Pix(8, 4); p.fill('#c9a04a'); p.rect(0, 0, 8, 1, '#ffe7a0'); p.rect(0, 3, 8, 1, '#7a5a22'); p.set(3, 1, '#ffe7a0'); return p; },
  // plaster tenement upper floors: 4 bays x 2 floors; plaster colour comes from the vertex tint
  tenement() {   // Krasnovian painted window surrounds with peaked crowns
    const p = new Pix(64, 32); p.fill('#d8d0c4');
    const frames = ['#2a8a7a', '#b8231e', '#c9a04a', '#2a4a8a'];
    for (let f = 0; f < 2; f++) {
      p.rect(0, f * 16 + 15, 64, 1, '#b0a898');
      for (let b = 0; b < 4; b++) {
        const x = b * 16 + 5, y = f * 16 + 5, lit = prng() < 0.4, fr = frames[(b + f * 2) % 4];
        p.rect(x - 2, y - 3, 10, 13, fr); p.rect(x - 1, y - 4, 8, 1, fr); p.rect(x + 1, y - 5, 4, 1, fr);
        p.rect(x, y, 6, 8, lit ? PC.warm : '#2a2430', lit ? EM : 255); p.rect(x + 2, y, 2, 8, '#3a3036'); p.rect(x, y + 3, 6, 1, '#3a3036');
        p.rect(x - 2, y + 9, 10, 1, '#f2ede4');
      }
    }
    return p;
  },
  tenementPlain() {   // plain Central European: tall windows, shutters
    const p = new Pix(64, 32); p.fill('#d8d0c4');
    for (let f = 0; f < 2; f++) {
      p.rect(0, f * 16 + 15, 64, 1, '#b8b0a4'); p.rect(0, f * 16 + 14, 64, 1, '#c8c0b4');
      for (let b = 0; b < 4; b++) {
        const x = b * 16 + 5, y = f * 16 + 3, lit = prng() < 0.33;
        p.rect(x - 1, y - 1, 8, 11, '#3a3036'); p.rect(x, y, 6, 9, lit ? PC.warm : '#2a2430', lit ? EM : 255);
        if (lit && prng() < 0.5) p.rect(x, y + 6, 6, 3, '#e8a868', EM);   // a lamp in the room
        p.rect(x + 2, y, 2, 9, '#3a3036'); p.rect(x - 3, y, 2, 9, '#7a6a5a'); p.rect(x + 7, y, 2, 9, '#7a6a5a');
        p.rect(x - 1, y + 10, 8, 1, '#efe6da');
      }
    }
    return p;
  },
  shops() {   // Columbian cast-iron fronts: green iron columns, big warm glass, a brass sign band
    const p = new Pix(64, 16); p.fill('#1e2a24');
    for (let k = 0; k < 4; k++) {
      const x = k * 16, lit = prng() < 0.55;
      p.rect(x, 0, 16, 3, PC.brass); p.rect(x + 2, 1, 12, 1, '#4a3020');
      p.rect(x + 2, 5, 9, 10, lit ? '#d8955a' : '#2a2a30', lit ? EM : 255); p.rect(x + 6, 5, 1, 10, '#1e2a24'); p.rect(x + 12, 6, 3, 10, '#3a2418');
      if (lit) { p.rect(x + 2, 5, 9, 1, '#ffd8a0', EM); p.rect(x + 3, 11, 3, 4, '#8a4a2a', EM); p.rect(x + 8, 10, 2, 5, '#6a3a5a', EM); p.rect(x + 2, 14, 9, 1, '#5a3020', EM); }
      p.rect(x, 3, 1, 13, '#3a4a42'); p.rect(x + 15, 3, 1, 13, '#3a4a42');
    }
    return p;
  },
  shopsPlain() {   // shuttered Vostburger shops, cream signboards
    const p = new Pix(64, 16); p.fill('#4a3020');
    for (let k = 0; k < 4; k++) {
      const x = k * 16, lit = prng() < 0.4;
      p.rect(x + 1, 1, 14, 4, PC.cream); p.rect(x + 1, 1, 14, 1, PC.brass);
      if (lit) { p.rect(x + 2, 7, 8, 8, '#d8955a', EM); p.rect(x + 2, 7, 8, 1, '#ffd8a0', EM); p.rect(x + 3, 11, 2, 4, '#7a4026', EM); p.rect(x + 6, 12, 3, 3, '#5a3a4a', EM); } else { p.rect(x + 2, 7, 8, 8, '#5a5a62'); for (let y = 8; y < 15; y += 2) p.rect(x + 2, y, 8, 1, '#44444c'); }
      p.rect(x + 11, 7, 4, 9, '#2a1a12'); p.set(x + 12, 11, PC.brass);
    }
    return p;
  },
  mansard() { const p = new Pix(32, 16); p.fill('#34343f'); for (let x = 0; x < 32; x += 3) p.rect(x, 0, 1, 16, '#2a2a34'); for (let x = 4; x < 32; x += 12) { p.rect(x, 4, 7, 9, '#5a5464'); p.rect(x + 1, 6, 5, 7, prng() < 0.45 ? PC.warm : '#22202a', prng() < 0.45 ? EM : 255); p.rect(x - 1, 3, 9, 1, '#6a6474'); } p.rect(0, 15, 32, 1, PC.brass); return p; },
  copper() { const p = new Pix(32, 16); p.fill('#46806e'); for (let x = 0; x < 32; x += 3) p.rect(x, 0, 1, 16, '#3a6c5e'); p.speck('#62a08a', 14); p.speck('#2e5a4c', 8); for (let x = 4; x < 32; x += 12) { p.rect(x, 4, 7, 9, '#3a6a5c'); p.rect(x + 1, 6, 5, 7, prng() < 0.5 ? PC.warm : '#22202a', prng() < 0.5 ? EM : 255); p.rect(x - 1, 3, 9, 1, '#5aa08a'); } p.rect(0, 15, 32, 1, PC.brass); return p; },
  copperTop() { const p = new Pix(16, 16); p.fill('#46806e'); for (let x = 0; x < 16; x += 3) p.rect(x, 0, 1, 16, '#3a6c5e'); p.speck('#62a08a', 8); return p; },
  slate() { const p = new Pix(16, 16); p.fill('#2e2e38'); for (let y = 0; y < 16; y += 3) for (let x = (y % 2) * 2; x < 16; x += 4) p.rect(x, y, 3, 2, '#3a3a46'); return p; },
  kawara() { const p = new Pix(16, 16); p.fill('#4a4e58'); for (let x = 0; x < 16; x += 3) p.rect(x, 0, 1, 16, '#363a44'); for (let y = 3; y < 16; y += 4) p.rect(0, y, 16, 1, '#5a606c'); return p; },
  lacquer() { const p = new Pix(8, 8); p.fill('#9a1e18'); p.rect(0, 0, 8, 1, '#c8342a'); return p; },
  onion() { const p = new Pix(16, 16); p.fill('#2a8a7a'); for (let y = 0; y < 16; y += 4) for (let x = (y >> 2 & 1) * 2; x < 16; x += 4) p.rect(x, y, 2, 2, '#c9a04a'); return p; },
  gilt() { const p = new Pix(8, 8); p.fill(PC.gold); p.rect(0, 0, 8, 1, '#fff0b0'); p.rect(0, 7, 8, 1, '#9a7420'); return p; },
  iron() { const p = new Pix(8, 8); p.fill('#22262a'); p.rect(0, 0, 8, 1, '#3e4448'); p.rect(0, 0, 1, 8, '#34393e'); return p; },
  stone() { const p = new Pix(16, 16); p.fill('#8a8070'); p.rect(0, 7, 16, 1, '#6a6254'); p.rect(0, 15, 16, 1, '#6a6254'); p.rect(5, 0, 1, 7, '#6a6254'); p.rect(12, 8, 1, 7, '#6a6254'); p.speck('#9a9080', 10); return p; },
  plaster() { const p = new Pix(16, 16); p.fill('#d0c8bc'); p.speck('#c0b8ac', 18); p.speck('#ddd6ca', 8); return p; },
  darkwood() { const p = new Pix(8, 8); p.fill('#3a2418'); p.rect(0, 3, 8, 1, '#2a180e'); p.set(5, 1, '#4a3020'); return p; },
  black() { const p = new Pix(4, 4); p.fill('#0a0608'); return p; },
  // ---- the Threeway's own front
  threewayFront() {   // 48x16: dark lacquered wood, two big windows glowing pink and amber from inside, door gap in the middle
    const p = new Pix(48, 16); p.fill('#2a1410');
    p.rect(0, 0, 48, 2, PC.brass); p.rect(0, 15, 48, 1, '#1a0c08');
    for (const x of [2, 30]) { p.rect(x, 4, 16, 9, '#ff9ab8', EM); p.rect(x, 4, 16, 1, '#ffd0a0', EM); p.rect(x + 5, 4, 1, 9, '#2a1410'); p.rect(x + 10, 4, 1, 9, '#2a1410'); p.rect(x + 2, 9, 3, 4, '#c03a6a', EM); p.rect(x + 12, 8, 2, 5, '#e8a040', EM); }
    p.rect(20, 3, 8, 13, '#140806');
    return p;
  },
  neonThreeway() { const p = new Pix(152, 20); p.fill('#1a0a14', EM); p.bigText('THE THREEWAY', 5, 3, '#6a1838', EM); p.bigText('THE THREEWAY', 4, 2, PC.pink, EM); p.rect(0, 0, 152, 1, '#a8285e', EM); p.rect(0, 19, 152, 1, '#a8285e', EM); return p; },
  // ---- street furniture
  gaslamp() { const p = new Pix(8, 8); p.fill('#e8f2d0', EM); p.rect(0, 0, 8, 1, '#22262a'); p.rect(0, 7, 8, 1, '#22262a'); p.rect(0, 0, 1, 8, '#22262a'); p.rect(7, 0, 1, 8, '#22262a'); p.rect(3, 2, 2, 4, '#ffffff', EM); return p; },
  clockFace() { const p = new Pix(16, 16); p.fill(PC.brass); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d < 6.6) p.set(x, y, '#f4ead0', EM); if (d >= 5.6 && d < 6.6 && (Math.round(Math.atan2(y - 7.5, x - 7.5) / Math.PI * 6) % 1 === 0)) p.set(x, y, '#3a2a1a', EM); } p.rect(7, 3, 2, 5, '#1a1008', EM); p.rect(8, 7, 3, 2, '#1a1008', EM); p.set(7, 7, '#b8231e', EM); return p; },
  enamel() { const p = new Pix(32, 8); p.fill(PC.militia); p.rect(0, 0, 32, 1, PC.brass); p.rect(0, 7, 32, 1, PC.brass); p.text('TRIPOINT', 2, 1, '#f2ede4'); return p; },
  station() {   // the sealed metro entrance: an iron arch sign over welded plate
    const p = new Pix(48, 16); p.fill('#22262a');
    p.rect(0, 0, 48, 9, '#1e3a6a'); p.rect(0, 0, 48, 1, PC.brass); p.rect(0, 8, 48, 1, PC.brass); p.text('TRIPOINT', 4, 1, '#f2ede4'); p.text('M', 41, 1, PC.lantern);
    for (let x = 0; x < 48; x += 4) p.rect(x, 9, 1, 7, '#3e4448');
    p.rect(0, 12, 48, 1, '#5a3a20'); p.rect(14, 10, 20, 5, '#e8dcc0'); p.text('SEALED', 15, 9, '#b8231e');
    return p;
  },
  barricade() { const p = new Pix(32, 8); for (let x = 0; x < 32; x++) p.rect(x, 0, 1, 8, Math.floor((x + 2) / 4) % 2 ? '#f2ede4' : PC.militia); p.rect(0, 0, 32, 1, '#1a1014'); return p; },
  closed() { const p = new Pix(48, 16); p.fill('#f2ede4'); p.rect(0, 0, 48, 2, PC.militia); p.rect(0, 14, 48, 2, PC.militia); p.text('ROAD', 12, 3, PC.militia); p.text('CLOSED', 6, 9 - 1, '#b8231e'); return p; },
  // ---- the joint-militia checkpoint
  booth() { const p = new Pix(32, 32); p.fill('#c8c4bc'); p.rect(0, 0, 32, 4, PC.militia); p.rect(0, 4, 32, 1, PC.brass); p.rect(3, 8, 26, 12, '#dff0ff', EM); p.rect(15, 8, 2, 12, '#9a968e'); p.rect(4, 15, 6, 5, '#a8c0d8', EM); p.rect(0, 24, 32, 2, '#9a968e'); p.speck('#b0aca4', 20); return p; },
  boom() { const p = new Pix(16, 4); for (let x = 0; x < 16; x++) p.rect(x, 0, 1, 4, Math.floor(x / 4) % 2 ? '#f2ede4' : '#b8231e'); p.set(2, 1, '#ffe8c0', EM); p.set(10, 1, '#ff6040', EM); return p; },
  concrete() { const p = new Pix(16, 16); p.fill('#8a867e'); p.rect(0, 0, 16, 1, '#a8a49c'); p.rect(7, 0, 1, 16, '#6e6a62'); p.speck('#76726a', 16); p.speck('#9a968e', 8); return p; },
  wallTop() { const p = new Pix(16, 8); p.fill('#9a968e'); p.rect(0, 0, 16, 2, '#b8b4ac'); for (let x = 0; x < 16; x += 2) p.set(x, 0, '#3a3a40'); return p; },
  sandbag() { const p = new Pix(16, 8); p.fill('#6a6048'); for (let y = 0; y < 8; y += 4) for (let x = (y / 4 % 2) * 4; x < 16; x += 8) { p.rect(x, y, 7, 3, '#8a7c5c'); p.rect(x, y, 7, 1, '#9a8c6a'); } return p; },
  militiaSign() { const p = new Pix(128, 32); p.fill(PC.militia); p.rect(0, 0, 128, 2, PC.brass); p.rect(0, 30, 128, 2, PC.brass); p.bigText('CHECKPOINT', 4, 3, '#f2ede4'); p.text('JOINT CITY MILITIA', 4, 21, PC.brass); p.rect(116, 6, 7, 20, PC.brass); p.rect(118, 8, 3, 18, PC.militia); return p; },
  halt() { const p = new Pix(28, 12); p.fill('#b8231e', EM); p.rect(0, 0, 28, 1, '#ffffff', EM); p.rect(0, 11, 28, 1, '#ffffff', EM); p.text('HALT', 3, 3, '#ffffff', EM); return p; },
  flood() { const p = new Pix(8, 8); p.fill('#f4f8ff', EM); p.rect(0, 0, 8, 1, '#5a5a62'); p.rect(0, 7, 8, 1, '#5a5a62'); return p; },
  // ---- flags (Hinomoto, Krasnovia, Columbia, the old Free City): from the art set
  flag_hino() { const p = new Pix(24, 16); p.fill('#eef3f8'); p.rect(0, 13, 24, 2, PC.lantern); p.rect(7, 2, 10, 10, PC.gold); p.rect(8, 3, 8, 8, PC.lantern); p.rect(10, 4, 4, 1, '#ffffff'); p.rect(11, 5, 2, 4, '#ffffff'); p.rect(9, 7, 6, 1, '#ffffff'); p.set(10, 9, '#ffffff'); p.set(13, 9, '#ffffff'); return p; },
  flag_kras() { const p = new Pix(24, 16); p.fill(PC.banner); p.rect(0, 0, 6, 16, PC.sodium); for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) { const d = Math.hypot(x, y); if (d <= 4.2 && d >= 2.4) p.set(15 + x, 8 + y, PC.gold); } for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; p.set(15 + Math.round(Math.cos(t) * 5), 8 + Math.round(Math.sin(t) * 5), PC.gold); } return p; },
  flag_colu() {
    const p = new Pix(24, 16); p.fill('#1a2a5a');
    for (let y = 0; y < 16; y++) for (let x = 0; x < 24; x++) { const dx = x - 11.5, dy = 11 - y, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx); if (dy >= 0 && d < 9.6 && (d < 3.2 || Math.floor(a / Math.PI * 13) % 2 === 0)) p.set(x, y, d < 3.2 ? '#fff0b0' : PC.gold); }
    p.rect(0, 11, 24, 1, PC.gold); p.rect(0, 12, 24, 1, '#c8202c'); p.rect(0, 13, 24, 1, '#f0e6cc'); p.rect(0, 14, 24, 1, '#c8202c');
    p.rect(0, 0, 24, 1, PC.gold); p.rect(0, 15, 24, 1, PC.gold); p.rect(0, 0, 1, 16, PC.gold); p.rect(23, 0, 1, 16, PC.gold); return p;
  },
  flag_vost() { const p = new Pix(24, 16); p.rect(0, 0, 24, 8, '#4a2440'); p.rect(0, 8, 24, 8, PC.brass); p.rect(10, 3, 4, 10, PC.brass); p.rect(11, 4, 2, 9, '#4a2440'); p.rect(9, 2, 6, 2, PC.brass); return p; },
  poster() { const p = new Pix(16, 24); p.fill('#d8c8a0'); p.rect(1, 1, 14, 12, '#b8231e'); p.rect(4, 3, 8, 8, '#f2c14e'); p.rect(1, 15, 14, 1, '#2a2018'); p.rect(1, 18, 10, 1, '#2a2018'); p.rect(1, 21, 12, 1, '#2a2018'); p.speck('#a89870', 10); return p; },
  // ---- props (crate, bin, street sign)
  crate() { const p = new Pix(16, 16); p.fill('#8a6a3a'); for (let y = 0; y < 16; y += 4) p.rect(0, y, 16, 1, '#5a4020'); p.rect(0, 0, 2, 16, '#6a4a24'); p.rect(14, 0, 2, 16, '#6a4a24'); for (let k = 0; k < 14; k++) p.set(1 + k, 1 + k, '#6a4a24'); p.text('V', 6, 5, '#2a1a0c'); return p; },
  bin() { const p = new Pix(16, 16); p.fill('#7a8088'); for (let x = 0; x < 16; x += 4) p.rect(x, 0, 1, 16, '#5a6068'); p.rect(0, 0, 16, 2, '#9aa0a8'); p.rect(0, 7, 16, 1, '#5a6068'); p.speck('#6a5040', 8); return p; },
  signPlate() { const p = new Pix(16, 8); p.fill(PC.militia); p.rect(0, 0, 16, 1, PC.brass); p.rect(0, 7, 16, 1, PC.brass); p.rect(2, 3, 12, 2, '#f2ede4'); p.rect(12, 2, 2, 4, '#f2ede4'); return p; },
  // ---- the three sectors, far away (skyline): ported from the map
  glassN() {   // black glass, floors lit in runs (offices), a few neon-coloured floors
    const p = new Pix(32, 32); p.fill('#141826'); for (let x = 0; x < 32; x += 8) p.rect(x, 0, 1, 32, '#20263a');
    for (let y = 1; y < 32; y += 4) { let x = 0; while (x < 32) { const run = 4 + Math.floor(prng() * 10), q = prng(); if (q < 0.45) p.rect(x, y, Math.min(run, 32 - x), 2, q < 0.06 ? PC.pink : (q < 0.12 ? PC.teal : '#cfe0f8'), EM); x += run + 1 + Math.floor(prng() * 4); } }
    return p;
  },
  neonSigns() { const p = new Pix(48, 48), rows = [['#e8352b', '#ffffff', '#ffffff'], ['#120812', '#ff3fb0', '#ff3fb0'], ['#06141a', '#3ff0ff', '#3ff0ff'], ['#f4f8fc', '#e8352b', '#1a1e26']]; rows.forEach(([bg, fg, edge], k) => { const y = k * 12; p.rect(0, y, 48, 12, bg, EM); p.rect(0, y, 48, 1, edge, EM); p.rect(0, y + 11, 48, 1, edge, EM); for (let g = 0; g < 7; g++) p.glyph(k * 3 + g, 2 + g * 6 + (g > 3 ? 1 : 0), y + 3, fg, EM); }); return p; },
  neonV() { const p = new Pix(32, 48), cols = [['#e8352b', '#fff'], ['#ff3fb0', '#140812'], ['#3ff0ff', '#06141a'], ['#f2c14e', '#1a1208']]; cols.forEach(([bg, fg], k) => { p.rect(k * 8, 0, 8, 48, bg, EM); for (let g = 0; g < 5; g++) p.glyph(k * 5 + g, k * 8 + 1, 2 + g * 9, fg, EM); }); return p; },
  litRed() { const p = new Pix(4, 4); p.fill('#ff3020', EM); return p; },
  litCyan() { const p = new Pix(4, 4); p.fill('#3ff0ff', EM); return p; },
  litMagenta() { const p = new Pix(4, 4); p.fill('#ff3fb0', EM); return p; },
  litWarm() { const p = new Pix(4, 4); p.fill('#ffe8b0', EM); return p; },
  litSodium() { const p = new Pix(4, 4); p.fill(PC.sodium, EM); return p; },
  panel() { const p = new Pix(32, 32); p.fill('#4e4a46'); for (let y = 0; y < 32; y += 8) p.rect(0, y, 32, 1, '#3a3632'); for (let y = 2; y < 32; y += 8) for (let x = 2; x < 32; x += 8) { const lit = prng() < 0.32; p.rect(x, y, 5, 4, lit ? '#ffb060' : '#221c1a', lit ? EM : 255); } return p; },
  stepped() { const p = new Pix(32, 32); p.fill('#6e6454'); for (let x = 0; x < 32; x += 4) p.rect(x, 0, 1, 32, '#564e42'); for (let y = 1; y < 32; y += 4) for (let x = 2; x < 32; x += 4) { const lit = prng() < 0.4; p.rect(x, y, 1, 2, lit ? '#ffc070' : '#2a2420', lit ? EM : 255); } return p; },
  banner() { const p = new Pix(16, 32); p.fill(PC.banner, EM); p.rect(0, 0, 16, 6, PC.sodium, EM); for (let a = 0; a < 12; a++) { const t = a / 12 * Math.PI * 2; p.set(8 + Math.round(Math.cos(t) * 5), 16 + Math.round(Math.sin(t) * 5), PC.gold, EM); } p.rect(7, 15, 2, 2, PC.gold, EM); return p; },
  cog() { const p = new Pix(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 7.5), a = Math.atan2(y - 7.5, x - 7.5); if ((d < 5.6 && d > 3) || (d < 7.4 && d >= 5.6 && Math.cos(a * 8) > 0.2)) p.set(x, y, PC.gold, EM); } return p; },
  decoStone() {   // cream piers, deep-green spandrels, warm offices: vertical strips that read from far away
    const p = new Pix(32, 32); p.fill('#a89c84'); for (let x = 0; x < 32; x += 8) p.rect(x, 0, 3, 32, '#c8bca2');
    for (let x = 3; x < 32; x += 8) { const litCol = prng() < 0.6; for (let y = 0; y < 32; y += 4) { const lit = litCol ? prng() < 0.75 : prng() < 0.15; p.rect(x, y, 5, 3, lit ? '#ffc870' : '#2e2a22', lit ? EM : 255); p.rect(x, y + 3, 5, 1, '#1e4a42'); } }
    return p;
  },
  decoGold() { const p = new Pix(16, 8); p.fill('#c9a04a', EM); p.rect(0, 0, 16, 1, '#fff0b0', EM); for (let x = 1; x < 16; x += 3) p.rect(x, 2, 1, 6, '#9a7420', EM); return p; },
  sunburst() { const p = new Pix(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const a = Math.atan2(15 - y, x - 7.5), d = Math.hypot(x - 7.5, 15 - y); if (a > 0 && d < 8.5 && (Math.floor(a / Math.PI * 11) % 2 === 0 || d < 2.5)) p.set(x, y, d < 2.5 ? '#fff0b0' : PC.gold, EM); } return p; },
  roofDark() { const p = new Pix(8, 8); p.fill('#1e1c22'); p.speck('#2a2830', 6); return p; },
  beam() { const p = new Pix(8, 8); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 3 === 0) p.set(x, y, '#ffe8b8', EM); return p; },
  smoke() { const p = new Pix(8, 8); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) & 1 && (x - 3.5) ** 2 + (y - 3.5) ** 2 < 14) p.set(x, y, '#3a2e34'); return p; },
  white() { const p = new Pix(4, 4); p.fill('#ffffff'); return p; },
  // ---- LOD stand-ins: one box per far building, its lit windows painted on (4 floors x 4 bays per repeat)
  farOld() { const p = new Pix(32, 32); p.fill('#8a7e6e'); for (let y = 0; y < 32; y += 8) { p.rect(0, y + 7, 32, 1, '#6e6456'); for (let x = 2; x < 32; x += 8) { const lit = prng() < 0.38; p.rect(x, y + 2, 4, 4, lit ? '#ffcf86' : '#2a2430', lit ? EM : 255); } } return p; },
  farHino() { const p = new Pix(32, 32); p.fill('#3a3438'); for (let y = 0; y < 32; y += 8) { p.rect(0, y, 32, 1, '#24222a'); for (let x = 1; x < 32; x += 8) { const q = prng(); p.rect(x, y + 3, 6, 3, q < 0.18 ? '#ff3020' : q < 0.28 ? '#ff3fb0' : q < 0.36 ? '#3ff0ff' : q < 0.6 ? '#ffd0a0' : '#1a1418', q < 0.6 ? EM : 255); } } return p; },
  farGround() { const p = new Pix(8, 8); p.fill('#1a1418'); return p; },
  farCol() { const p = new Pix(32, 32); p.fill('#6a3a32'); for (let y = 0; y < 32; y += 8) { p.rect(0, y + 7, 32, 1, '#c9a04a'); for (let x = 2; x < 32; x += 8) { const lit = prng() < 0.42; p.rect(x, y + 1, 4, 5, lit ? '#ffd8a0' : '#1e1418', lit ? EM : 255); } } return p; },
};
// pack every painting into one atlas (shelf packing); returns { tex, rect: { key: [u0, v0, u1, v1] } }
function paintAtlas() {
  const keys = Object.keys(PAINT), imgs = {};
  for (const k of keys) { seedPaint(k); imgs[k] = PAINT[k](); }
  // Each picture gets an 8 px gutter of its own wrapped pixels, on an 8 px grid, so the atlas can be mipmapped:
  // up close it's still nearest-filtered PS1 texels, far away it averages instead of sparkling.
  const G = CFG.street.atlasGutter, W = 512, al = (v) => Math.ceil(v / G) * G;
  const order = keys.slice().sort((a, b) => imgs[b].h - imgs[a].h || imgs[b].w - imgs[a].w);
  let x = 0, y = 0, rowH = 0; const at = {};
  for (const k of order) {
    const im = imgs[k], cw = al(im.w) + 2 * G, ch = al(im.h) + 2 * G;
    if (x + cw > W) { x = 0; y += rowH; rowH = 0; }
    at[k] = [x + G, y + G]; x += cw; rowH = Math.max(rowH, ch);
  }
  let H = 1; while (H < y + rowH) H *= 2;
  const data = new Uint8Array(W * H * 4), rect = {};
  for (const k of keys) {
    const im = imgs[k], [ax, ay] = at[k];
    for (let j = -G; j < al(im.h) + G; j++) for (let i = -G; i < al(im.w) + G; i++) {
      const sx = ((i % im.w) + im.w) % im.w, sy = ((j % im.h) + im.h) % im.h, si = (sy * im.w + sx) * 4, di = ((ay + j) * W + ax + i) * 4;
      data[di] = im.d[si]; data[di + 1] = im.d[si + 1]; data[di + 2] = im.d[si + 2]; data[di + 3] = im.d[si + 3];
    }
    const e = 0.02;   // stay a hair inside each picture so nearest sampling never picks a neighbour
    rect[k] = [(ax + e) / W, (ay + e) / H, (ax + im.w - e) / W, (ay + im.h - e) / H];
  }
  const t = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true; t.flipY = false; t.needsUpdate = true;
  return { tex: t, rect, W, H, size: (k) => [imgs[k].w, imgs[k].h] };
}
