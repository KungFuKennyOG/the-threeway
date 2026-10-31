'use strict';
// ============================== Act 1, level 2: the Krasnovian gate and Superblock 14, painted textures =====
// Krasnovia at home: grey panel slabs with lit kitchens and TV-blue rooms, lock-up garages, a courtyard of packed
// dirt, laundry on the lines. Painted into the street atlas like everything outdoors (no extra textures or draw calls).
Object.assign(PAINT, {
  slab() {   // 4 bays x 4 storeys of precast panels (one repeat = 12 m x 11.2 m): windows, some balconies, some lit
    const p = new Pix(64, 64); p.fill('#7a766e');
    for (let s = 0; s < 4; s++) for (let b = 0; b < 4; b++) {
      const x = b * 16, y = s * 16, tone = ['#7a766e', '#76726a', '#807c74', '#726e66'][(s * 3 + b) % 4];
      p.rect(x + 1, y + 1, 15, 15, tone);
      const q = prng(), lit = q < 0.34, tv = q < 0.07;
      p.rect(x + 4, y + 3, 8, 7, lit ? (tv ? '#9ab8ff' : (prng() < 0.5 ? '#ffd890' : '#ffb868')) : '#24201e', lit ? EM : 255);
      p.rect(x + 7, y + 3, 1, 7, lit ? '#8a6a48' : '#3a3632'); p.rect(x + 4, y + 6, 8, 1, lit ? '#8a6a48' : '#3a3632');
      if (lit && !tv && prng() < 0.5) p.rect(x + 4, y + 3, 3, 7, '#d88a4a', EM);   // a curtain
      if ((b + s) % 3 === 0) { p.rect(x + 2, y + 10, 12, 4, '#5e5a54'); p.rect(x + 2, y + 10, 12, 1, '#9a968e'); for (let k = x + 3; k < x + 14; k += 2) p.set(k, y + 11, '#4a4640'); }   // balcony
      else p.rect(x + 3, y + 10, 10, 1, '#5e5a54');                                    // sill
    }
    for (let k = 0; k < 64; k += 16) { p.rect(k, 0, 1, 64, '#5a5650'); p.rect(0, k, 64, 1, '#5a5650'); }   // panel joints
    p.speck('#6a665e', 40); p.speck('#8a867e', 20);
    return p;
  },
  slabEnd() { const p = new Pix(32, 32); p.fill('#726e66'); for (let k = 0; k < 32; k += 8) { p.rect(k, 0, 1, 32, '#56524c'); p.rect(0, k, 32, 1, '#56524c'); } p.speck('#7e7a72', 30); p.speck('#625e58', 20); return p; },
  garage() {   // lock-up garages: two painted steel doors between concrete posts (one repeat = 6 m x 2.6 m)
    const p = new Pix(32, 16); p.fill('#8a867e');
    const cols = ['#4a6a4a', '#7a3a2a', '#3a4a6a', '#6a6a3a', '#5a3a4a'];
    for (const x of [2, 18]) {
      const c = cols[Math.floor(prng() * cols.length)];
      p.rect(x, 3, 12, 13, c); for (let y = 4; y < 16; y += 2) p.rect(x, y, 12, 1, '#2a2622');
      p.rect(x + 5, 9, 2, 1, '#c9a04a'); p.speck('#8a5a3a', 4);
    }
    p.rect(0, 0, 32, 2, '#6a665e'); return p;
  },
  dirt() {   // the courtyard: packed dirt, tired grass, a cracked path edge
    const p = new Pix(32, 32); p.fill('#4a4238');
    p.speck('#5a5044', 60); p.speck('#3a342c', 40);
    for (let k = 0; k < 7; k++) { const x = Math.floor(prng() * 28), y = Math.floor(prng() * 28); p.rect(x, y, 3 + Math.floor(prng() * 4), 2, '#3e4a30'); p.set(x + 1, y - 1, '#4e5a38'); }
    return p;
  },
  sandpit() { const p = new Pix(16, 16); p.fill('#9a8a62'); p.speck('#aa9a70', 30); p.speck('#7a6c4c', 20); return p; },
  boothK() {   // Krasnovian sentry box: red skirt, cream top, a lit window, a gold cog
    const p = new Pix(32, 32); p.fill('#e6dac0'); p.rect(0, 18, 32, 14, '#b8231e'); p.rect(0, 18, 32, 1, '#ff9a3c');
    p.rect(4, 4, 24, 11, '#ffe0a0', EM); p.rect(15, 4, 2, 11, '#8a7a6a'); p.rect(4, 4, 24, 1, '#8a7a6a');
    for (let a = 0; a < 10; a++) { const t = a / 10 * Math.PI * 2; p.set(16 + Math.round(Math.cos(t) * 4), 25 + Math.round(Math.sin(t) * 4), '#f2c14e'); }
    p.rect(15, 24, 2, 2, '#f2c14e'); return p;
  },
  krasSign() {   // over the gate: KRASNOVIAN SECTOR (of Vostburg, not the country), cream on red, gold rules
    const p = new Pix(104, 14); p.fill('#b8231e', EM); p.rect(0, 0, 104, 1, '#f2c14e', EM); p.rect(0, 13, 104, 1, '#f2c14e', EM);
    p.text('KRASNOVIAN SECTOR', 2, 4, '#f4ead0', EM); return p;
  },
  blockSign() {   // enamel house plate by the door: block 14
    const p = new Pix(32, 16); p.fill('#1a3a7a', EM); p.rect(0, 0, 32, 1, '#e6dac0', EM); p.rect(0, 15, 32, 1, '#e6dac0', EM);
    p.bigText('14', 5, 1, '#f4f1ea', EM); return p;
  },
  steelDoor() { const p = new Pix(16, 24); p.fill('#3a3e44'); p.rect(1, 1, 14, 22, '#4a4e56'); p.rect(4, 4, 8, 5, '#ffe0a0', EM); p.rect(7, 4, 1, 5, '#3a3e44'); p.rect(12, 13, 2, 2, '#c9a04a'); p.speck('#2e3238', 10); return p; },
  carK() {   // a beige Krasnovian saloon, side view (one repeat = the whole car)
    const p = new Pix(32, 12); p.fill('#c8b890'); p.rect(0, 0, 32, 1, '#a89870');
    p.rect(7, 1, 18, 4, '#1e2228'); p.rect(15, 1, 1, 4, '#c8b890'); p.rect(0, 7, 32, 1, '#a89870');
    p.rect(4, 9, 6, 3, '#141214'); p.rect(22, 9, 6, 3, '#141214'); p.rect(6, 10, 2, 1, '#8a8a8a'); p.rect(24, 10, 2, 1, '#8a8a8a');
    p.rect(30, 3, 2, 2, '#ff6040', EM); return p;
  },
  carKEnd() { const p = new Pix(16, 12); p.fill('#c8b890'); p.rect(2, 1, 12, 4, '#1e2228'); p.rect(1, 7, 3, 2, '#ffe8b0', EM); p.rect(12, 7, 3, 2, '#ffe8b0', EM); p.rect(4, 8, 8, 2, '#8a8a8a'); return p; },
  laundry() {   // sheets and shirts on a line; the gaps are cut out
    const p = new Pix(48, 12); p.fill('#000000', 0);
    const cols = ['#e8e4dc', '#b8c8e0', '#e0b0b8', '#f2ede4', '#c8d8a8', '#e8c868', '#b8231e'];
    let x = 1;
    while (x < 46) { const w = 3 + Math.floor(prng() * 6), h = 5 + Math.floor(prng() * 7), c = cols[Math.floor(prng() * cols.length)]; p.rect(x, 0, Math.min(w, 47 - x), h, c); p.rect(x, h - 1, Math.min(w, 47 - x), 1, '#8a8478'); x += w + 1 + Math.floor(prng() * 2); }
    p.rect(0, 0, 48, 1, '#9a968e'); return p;
  },
  // ---- a ground-floor kitchen beside podezd 3's door (1.6 m x 1.35 m): fridge, net curtains, oilcloth, a teapot, and
  // the family's big console set; its screen is a plate of its own (tvParade, cut by SBX.tv in build.js)
  kitchenTV() {
    const p = new Pix(48, 40); p.fill('#c8bf98', EM);
    for (let y = 22; y < 40; y += 3) p.rect(0, y, 48, 1, '#a8a882', EM);                                 // tiles below the dado
    for (let x = 1; x < 48; x += 4) p.rect(x, 22, 1, 18, '#a8a882', EM);
    p.rect(0, 21, 48, 1, '#8a7a5a', EM);
    p.rect(27, 0, 1, 3, '#3a3026', EM); p.rect(24, 3, 7, 2, '#e8803a', EM); p.rect(26, 5, 3, 1, '#fff0c0', EM);   // the lamp
    p.rect(3, 9, 10, 31, '#e8e4dc', EM); p.rect(3, 9, 10, 1, '#fff8ee', EM); p.rect(3, 20, 10, 1, '#a8a49c', EM);   // the fridge
    p.rect(11, 12, 1, 5, '#8a867e', EM); p.rect(11, 23, 1, 6, '#8a867e', EM); p.set(6, 14, '#c8302a', EM); p.set(8, 25, '#3a6aaa', EM);
    p.rect(19, 10, 28, 20, '#5a3620', EM); p.rect(19, 10, 28, 1, '#8a5a34', EM); p.rect(20, 29, 2, 3, '#3a2214', EM); p.rect(44, 29, 2, 3, '#3a2214', EM);   // the set
    p.rect(21, 11, 21, 17, '#1a1a20', EM);                                                               // the bezel (the screen is a plate over it)
    for (const y of [14, 18, 22]) { p.set(44, y, '#c9a04a', EM); p.set(44, y + 1, '#8a6a2a', EM); }       // knobs
    for (let x = 16; x < 48; x++) for (let y = 32; y < 40; y++) p.set(x, y, ((x >> 1) + (y >> 1)) % 2 ? '#c8302a' : '#f0e8dc', EM);   // oilcloth
    p.rect(22, 29, 5, 3, '#3a6aaa', EM); p.rect(23, 28, 3, 1, '#3a6aaa', EM); p.set(27, 30, '#3a6aaa', EM); p.set(23, 30, '#f0e8dc', EM);   // the teapot
    for (let y = 0; y < 40; y++) for (const x of [1, 2, 45, 46]) if ((x + y) % 2) p.set(x, y, '#f4f0e8', EM);   // net curtains
    p.rect(0, 0, 48, 1, '#d8d4c8'); p.rect(0, 39, 48, 1, '#d8d4c8'); p.rect(0, 0, 1, 40, '#d8d4c8'); p.rect(47, 0, 1, 40, '#d8d4c8');   // the frame
    p.rect(15, 0, 2, 40, '#d8d4c8'); p.rect(1, 12, 14, 1, '#d8d4c8');                                    // the mullion, the vent's transom
    return p;
  },
  // the Krasnograd May Day parade on Central Television (64 x 48): the wide shot, the vast square, ranks to the horizon, the
  // Palace of the Union under the original gilded cog, a caption along the foot. The TV cuts to a zoom on the Palace and
  // its cog (the top middle quarter of this picture: SB.tvZoom) and back
  tvParade() {
    const p = new Pix(64, 48);
    for (let y = 0; y < 26; y++) for (let x = 0; x < 64; x++) p.set(x, y, y < 9 ? '#4a5a7a' : y < 18 ? ((x + y) % 2 ? '#5a6a88' : '#4a5a7a') : '#6a7890', EM);   // the sky
    for (const [x0, w, top] of [[0, 12, 13], [52, 12, 12], [10, 8, 17], [46, 8, 16]]) {                 // the square's walls of ministries
      p.rect(x0, top, w, 27 - top, '#9a9488', EM); for (let y = top + 2; y < 26; y += 3) for (let x = x0 + 1; x < x0 + w - 1; x += 2) p.set(x, y, '#ffe0a0', EM);
    }
    p.rect(12, 21, 40, 6, '#d8d0bc', EM);                                                                // the Palace of the Union: a vast stepped base
    for (let x = 13; x < 52; x += 3) p.rect(x, 22, 1, 5, '#a8a08c', EM);                                 // its colonnade
    for (const [w, y0, y1] of [[22, 16, 21], [16, 13, 16], [11, 11, 13], [7, 9, 11]]) { p.rect(32 - w / 2, y0, w, y1 - y0, '#e8e0cc', EM); p.rect(32 - w / 2, y0, w, 1, '#f2c14e', EM); p.rect(32 - w / 2 + 1, y0 + 2, 1, y1 - y0 - 2, '#b8b09c', EM); }
    for (const x of [20, 26, 37, 43]) p.rect(x, 16, 2, 5, '#c8302a', EM);                               // banners down its front
    plpCog(p, 32, 5.5, 4.6, '#f2c14e', '#c8902a', EM); p.set(32, 5, '#fff2b0', EM); p.set(31, 6, '#fff2b0', EM);   // the cog, over all of it
    for (let y = 27; y < 40; y++) for (let x = 0; x < 64; x++) {                                          // the square: ranks to the horizon
      const d = y - 24, u = (x - 31.5) / d, rank = Math.floor(18 / d * 3) % 2, file = Math.floor(u * 2.2 + 100) % 2;
      p.set(x, y, rank && file ? ((x + y) % 3 ? '#c8302a' : '#e8d8b8') : '#6a6a70', EM);
    }
    p.rect(0, 40, 64, 8, '#101018', EM); p.text('KRASNOGRAD', 3, 41, '#f4ead0', EM);
    for (const [x, y] of [[0, 0], [1, 0], [0, 1], [63, 0], [62, 0], [63, 1], [0, 47], [63, 47]]) p.set(x, y, '#101018', EM);   // the tube's round corners
    return p;
  },
  mosaicK() {   // a worker mosaic on the slab beside the arch: a steelworker under a gold cog and a red sun
    const p = new Pix(24, 40); p.fill('#2a5a6a');
    p.checker = p.checker || null;
    for (let y = 0; y < 40; y++) for (let x = 0; x < 24; x++) if ((x + y) % 2 === 0) p.set(x, y, '#30626e');
    for (let y = 0; y < 14; y++) for (let x = 0; x < 24; x++) { const d = Math.hypot(x - 12, y - 8); if (d < 7) p.set(x, y, d < 4 ? '#ffb060' : '#e8352b'); }
    for (let a = 0; a < 12; a++) { const t = a / 12 * Math.PI * 2; p.set(12 + Math.round(Math.cos(t) * 5), 8 + Math.round(Math.sin(t) * 5), '#f2c14e'); }
    p.rect(9, 15, 6, 6, '#e0b08c'); p.rect(9, 15, 6, 2, '#5a4a3a'); p.rect(7, 21, 10, 11, '#3a4250'); p.rect(4, 21, 3, 8, '#3a4250'); p.rect(17, 19, 3, 8, '#3a4250');
    p.rect(18, 14, 2, 6, '#9aa2ae'); p.rect(16, 13, 6, 2, '#5a626c');   // the hammer, raised
    p.rect(8, 32, 3, 8, '#2a2622'); p.rect(13, 32, 3, 8, '#2a2622'); p.rect(0, 36, 24, 4, '#b8231e');
    return p;
  },
});
