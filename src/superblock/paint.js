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
