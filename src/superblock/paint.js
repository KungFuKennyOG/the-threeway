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
    const p = new Pix(32, 32); p.fill('#625646');
    p.speck('#72644e', 60); p.speck('#4e4438', 40); p.speck('#7a6e5a', 16);
    for (let k = 0; k < 7; k++) { const x = Math.floor(prng() * 28), y = Math.floor(prng() * 28); p.rect(x, y, 3 + Math.floor(prng() * 4), 2, '#3e4a30'); p.set(x + 1, y - 1, '#4e5a38'); }
    return p;
  },
  sandpit() { const p = new Pix(16, 16); p.fill('#9a8a62'); p.speck('#aa9a70', 30); p.speck('#7a6c4c', 20); return p; },
  blockSign() {   // enamel house plate by the door: block 14
    const p = new Pix(32, 16); p.fill('#1a3a7a', EM); p.rect(0, 0, 32, 1, '#e6dac0', EM); p.rect(0, 15, 32, 1, '#e6dac0', EM);
    p.bigText('14', 5, 1, '#f4f1ea', EM); return p;
  },
  podezdSign() { const p = new Pix(24, 18); p.fill('#1a3a7a', EM); p.rect(0, 0, 24, 1, '#e6dac0', EM); p.rect(0, 17, 24, 1, '#e6dac0', EM); p.text('3', 9, 1, '#f4f1ea', EM); p.text('1-88', 0, 10, '#e6dac0', EM); return p; },
  steelDoor() { const p = new Pix(16, 24); p.fill('#3a3e44'); p.rect(1, 1, 14, 22, '#4a4e56'); p.rect(4, 4, 8, 5, '#ffe0a0', EM); p.rect(7, 4, 1, 5, '#3a3e44'); p.rect(12, 13, 2, 2, '#c9a04a'); p.speck('#2e3238', 10); return p; },
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

  // ======== the polish pass: the border post, the forecourt, the yard, podezd 3 inside, the roof ========
  // ---- the Krasnovian gate: a Brutalist concrete portal, the emblem, the sentry box, the chicane, the lane's paint
  pylon() {   // board-marked concrete (one repeat = 1 m x 2 m): the boards' lines, a darker tide line at the foot
    const p = new Pix(16, 32); p.fill('#8e8a80');
    for (let y = 0; y < 32; y += 4) { p.rect(0, y, 16, 1, '#7a766c'); p.rect(0, y + 1, 16, 1, '#9a968c'); }
    for (let k = 0; k < 6; k++) p.rect(Math.floor(prng() * 15), Math.floor(prng() * 30), 1, 2, '#6e6a62');
    p.speck('#827e74', 14); return p;
  },
  krasLintel() {   // the portal's lintel toward the Ring Road: KRASNOVIAN SECTOR on a red band cast into the concrete, lit
    const p = new Pix(112, 14); p.fill('#8e8a80'); for (let x = 0; x < 112; x += 4) p.rect(x, 0, 1, 14, '#827e74');
    p.rect(3, 2, 106, 10, '#b8231e', EM); p.rect(3, 2, 106, 1, '#f2c14e', EM); p.rect(3, 11, 106, 1, '#f2c14e', EM);
    p.text('KRASNOVIAN SECTOR', 6, 4, '#fff0d0', EM); p.rect(0, 13, 112, 1, '#6e6a62'); return p;
  },
  krasLintelIn() {   // the same lintel seen from the forecourt: GLORY TO LABOR
    const p = new Pix(112, 14); p.fill('#8e8a80'); for (let x = 0; x < 112; x += 4) p.rect(x, 0, 1, 14, '#827e74');
    p.rect(10, 2, 92, 10, '#b8231e', EM); p.rect(10, 2, 92, 1, '#f2c14e', EM); p.rect(10, 11, 92, 1, '#f2c14e', EM);
    p.text('GLORY TO LABOR', 15, 4, '#fff0d0', EM); p.rect(0, 13, 112, 1, '#6e6a62'); return p;
  },
  krasEmblem() {   // over the portal: a gold cog in a wreath of wheat, a red sun behind, a red ribbon round the foot (cut out, lit)
    const p = new Pix(48, 48), cx = 24, cy = 21;
    for (let y = 0; y < 40; y++) for (let x = 0; x < 48; x++) { const d = Math.hypot(x - cx, y - cy), a = Math.atan2(y - cy, x - cx); if (d < 15 && (d < 11 || Math.floor((a + 4) * 16 / Math.PI) % 2)) p.set(x, y, d < 11 ? '#e8432a' : '#c8331e', EM); }
    plpCog(p, cx, cy, 8.4, '#f2c14e', '#b8862a', EM); plpDisc(p, cx, cy, 3.6, '#b8231e', EM); plpDisc(p, cx - 1, cy - 1, 1.2, '#ff7a50', EM);
    for (const m of [-1, 1]) for (let k = 0; k < 11; k++) {   // the wheat: ears up both sides
      const t = 0.15 + k * 0.105, x = cx + m * Math.sin(t * Math.PI) * 19, y = 41 - t * 34;
      p.rect(Math.round(x) - 1, Math.round(y), 3, 2, '#e8b84a', EM); p.set(Math.round(x + m * 2), Math.round(y) - 1, '#a8782a', EM); p.set(Math.round(x), Math.round(y) + 2, '#a8782a', EM);
    }
    for (let x = 6; x < 42; x++) { const y = 40 + Math.round(Math.abs(x - 24) * 0.12); p.rect(x, y, 1, 4, (x >> 2) % 3 === 1 ? '#e8352b' : '#b8231e', EM); p.set(x, y, '#f2c14e', EM); }
    return p;
  },
  boothK2() {   // the sentry box: cream over a red skirt, a gold line (one repeat = the box's side)
    const p = new Pix(32, 32); p.fill('#e6dac0'); p.speck('#d8ccb0', 14); p.rect(0, 20, 32, 12, '#b8231e'); p.rect(0, 19, 32, 1, '#f2c14e'); p.speck('#a01c18', 8);
    p.rect(0, 0, 32, 1, '#8a7e66'); return p;
  },
  boothKWin() {   // the sentry box toward the Ring Road: a lit window, the sentry inside (peaked cap, epaulettes), his lamp
    const p = new Pix(32, 32); p.fill('#e6dac0'); p.rect(0, 20, 32, 12, '#b8231e'); p.rect(0, 19, 32, 1, '#f2c14e');
    p.rect(3, 4, 26, 13, '#ffe0a0', EM); p.rect(3, 4, 26, 2, '#ffd080', EM);
    plpDisc(p, 13, 10, 2.4, '#2a2024', EM); p.rect(9, 6, 9, 2, '#1e2a22', EM); p.rect(10, 5, 7, 1, '#1e2a22', EM); p.rect(10, 8, 7, 1, '#141014', EM); p.set(13, 6, '#f2c14e', EM);   // the head, the cap, its badge
    for (let y = 13; y < 17; y++) p.rect(13 - (y - 10), y, (y - 10) * 2 + 1, 1, '#2a3428', EM); p.rect(6, 13, 2, 1, '#f2c14e', EM); p.rect(19, 13, 2, 1, '#f2c14e', EM);   // shoulders, epaulettes
    p.rect(23, 10, 4, 2, '#3a2a20', EM); p.rect(24, 12, 1, 4, '#3a2a20', EM); p.rect(22, 16, 6, 1, '#3a2a20', EM);   // a desk lamp
    p.rect(16, 4, 1, 13, '#8a7a6a'); p.rect(3, 4, 26, 1, '#8a7a6a'); p.rect(3, 16, 26, 1, '#8a7a6a'); return p;
  },
  boothKWin2() {   // its side window on the lane: lit, the blind half down, a telephone on the sill
    const p = new Pix(32, 32); p.fill('#e6dac0'); p.rect(0, 20, 32, 12, '#b8231e'); p.rect(0, 19, 32, 1, '#f2c14e');
    p.rect(3, 4, 26, 13, '#ffe0a0', EM); for (let y = 4; y < 10; y += 2) p.rect(3, y, 26, 1, '#d8b070', EM);
    p.rect(19, 13, 6, 3, '#1a1a1e', EM); p.rect(20, 12, 4, 1, '#1a1a1e', EM);
    p.rect(16, 4, 1, 13, '#8a7a6a'); p.rect(3, 4, 26, 1, '#8a7a6a'); p.rect(3, 16, 26, 1, '#8a7a6a'); return p;
  },
  krasControl() { const s = 'PASSPORT CONTROL', p = new Pix(100, 12); p.fill('#1a3a7a', EM); p.rect(0, 0, 100, 1, '#f2c14e', EM); p.rect(0, 11, 100, 1, '#f2c14e', EM); p.text(s, Math.round(50 - textW(s) / 2), 3, '#f4ead0', EM); return p; },
  chicane() {   // a concrete chicane block, red and white stripes along its top (one repeat = 1.2 m x 0.9 m)
    const p = new Pix(16, 12); p.fill('#8a867e'); p.speck('#76726a', 10);
    for (let y = 0; y < 6; y++) for (let x = 0; x < 16; x++) p.set(x, y, ((x + y) >> 2) % 2 ? '#f0ece4' : '#b8231e');
    p.rect(0, 6, 16, 1, '#5e5a54'); return p;
  },
  laneStop() {   // painted on the lane, read from the Ring Road: a stop bar and STOP (cut out: the asphalt shows)
    const p = new Pix(48, 18); p.rect(0, 0, 48, 3, '#e8e4d8');
    p.bigText('STOP', 1, 4, '#e8e4d8');
    for (let k = 0; k < 40; k++) p.set(Math.floor(prng() * 48), Math.floor(prng() * 18), '#000000', 0);   // worn
    return p;
  },
  laneLine() { const p = new Pix(4, 16); p.fill('#e8c040'); for (let k = 0; k < 10; k++) p.set(Math.floor(prng() * 4), Math.floor(prng() * 16), '#000000', 0); return p; },
  borderWall() {   // the Krasnovian wall, Ring Road side: 1.2 m precast panels, a capping pipe, streaks, the Free City's graffiti (4.8 m x 3.4 m)
    const p = new Pix(64, 32); p.fill('#8e8a82'); p.speck('#82807a', 50); p.speck('#9a968e', 30);
    for (let x = 0; x < 64; x += 16) { p.rect(x, 0, 1, 32, '#5e5a54'); p.rect(x + 1, 0, 1, 32, '#a4a098'); }
    for (let k = 0; k < 9; k++) { const x = Math.floor(prng() * 63); p.rect(x, 3, 1, 6 + Math.floor(prng() * 14), '#7a766e'); }   // rain streaks
    p.rect(0, 0, 64, 1, '#b8b4ac'); p.rect(0, 1, 64, 1, '#a8a49c'); p.rect(0, 2, 64, 1, '#6a665e');   // the pipe along the top
    p.rect(0, 29, 64, 3, '#5a564e');
    p.text('FREE', 4, 14, '#ff5aa0'); p.text('VOST', 37, 19, '#3ad0c0');
    for (const [x, y] of [[29, 12], [31, 12], [28, 13], [29, 13], [30, 13], [31, 13], [32, 13], [29, 14], [30, 14], [31, 14], [30, 15]]) p.set(x, y, '#e8352b');   // a heart
    for (let x = 2; x < 26; x++) p.set(x, 23 + Math.round(Math.sin(x * 0.9) * 1.2), '#e8e4dc');   // a white scrawl under FREE
    p.rect(50, 8, 9, 11, '#c8bf98'); p.rect(51, 9, 7, 3, '#b8231e'); p.rect(51, 13, 7, 1, '#5a564e'); p.rect(51, 15, 5, 1, '#5a564e'); p.set(57, 18, '#8e8a82');   // a torn bill
    return p;
  },
  borderWallK() {   // the wall's Krasnovian side: whitewashed panels, nothing written on them (2.4 m x 3.4 m)
    const p = new Pix(32, 32); p.fill('#d6d2c6'); p.speck('#c8c4b8', 30);
    for (let x = 0; x < 32; x += 16) p.rect(x, 0, 1, 32, '#9a968c');
    p.rect(0, 0, 32, 1, '#b8b4ac'); p.rect(0, 2, 32, 1, '#8a867e'); p.rect(0, 28, 32, 4, '#8a8478'); return p;
  },
  roofSlogan() {   // red neon letters on the south slab's roof: PEACE · LABOR · MAY (cut out between the letters)
    const s = 'PEACE · LABOR · MAY', p = new Pix(112, 9);
    p.text(s, 2, 1, '#ff3a2a', EM);
    for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3] && ((i / 4) % 112 + Math.floor(i / 448)) % 3 === 0) { p.d[i] = 255; p.d[i + 1] = 160; p.d[i + 2] = 140; }   // hot cores
    return p;
  },
  sloganBack() {   // the same sign from behind: the letters' dark backs on their frame (cut out)
    const s = 'PEACE · LABOR · MAY', p = new Pix(112, 9);
    p.rect(0, 8, 112, 1, '#3a3632'); for (let x = 1; x < 112; x += 9) p.rect(x, 1, 1, 8, '#3a3632');
    let cx = 2; for (const ch of s.split('').reverse()) { const g = GLYPHS[ch]; if (g) for (let i = 0; i < 35; i++) if (g[i] === '1') p.set(cx + 4 - (i % 5), 1 + Math.floor(i / 5), '#2a2622'); cx += 6; }
    for (let k = 0; k < 14; k++) p.set(2 + Math.floor(prng() * 106), 1 + Math.floor(prng() * 7), '#ff5a3a', EM);   // the neon's glow round the edges
    return p;
  },
  stairStrip() {   // the point block's stairwell, one window per landing up all 21 floors (one repeat = 1.2 m x 58.8 m)
    const p = new Pix(8, 168); p.fill('#7a766e');
    for (let k = 0; k < 21; k++) { const y = 2 + k * 8, q = prng(); p.rect(1, y, 6, 4, q < 0.15 ? '#3a3632' : q < 0.4 ? '#e8d090' : '#ffe0a0', q < 0.15 ? 255 : EM); p.rect(1, y + 4, 6, 1, '#5e5a54'); }
    return p;
  },
  // ---- the forecourt: the mosaic, the arch, the board of honour, the press kiosk
  mosaicSpace() {   // Soviet-modernist smalt mosaic on the slab's end (72 x 104 = 11 m x 16 m): TO THE STARS. A red sun round a gold
    // cog, a rocket climbing out of it on a white trail, a woman lifting a dove and a steelworker with his hammer, wheat
    const W = 72, H = 104, p = new Pix(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const q = prng(); p.set(x, y, q < 0.45 ? '#1e4a66' : q < 0.8 ? '#245470' : '#1a405a'); }
    const sx = 32, sy = 30;
    for (let y = 0; y < 66; y++) for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - sx, y - sy), a = Math.atan2(y - sy, x - sx);
      if (d < 21) p.set(x, y, d < 9 ? '#ffc860' : d < 15 ? (prng() < 0.8 ? '#ff8a3a' : '#f07a30') : (prng() < 0.8 ? '#e8432a' : '#d83a26'));
      else if (d < 38 && Math.floor((a + Math.PI) / Math.PI * 10) % 2 === 0) p.set(x, y, prng() < 0.75 ? '#a8301c' : '#982a1a');
    }
    plpCog(p, sx, sy, 12, '#f2c14e', '#c8902a', EM);
    plpDisc(p, sx, sy, 5.6, '#2a6a9a'); for (const [x, y, r] of [[30, 28, 1.8], [34, 32, 1.5], [31, 33, 1]]) plpDisc(p, x, y, r, '#3a8a4a');   // the globe in the cog
    for (let t = 0; t < 1; t += 0.01) {   // the trail: from the bottom left up to the rocket's tail
      const x = 4 + t * 46 + Math.sin(t * 3.2) * 6, y = 74 - t * 30 - t * t * 10;
      plpDisc(p, x, y, 1.6 + t * 0.8, prng() < 0.6 ? '#e8eef4' : '#c8d8e8');
    }
    plpLine(p, 51, 36, 63, 12, '#f4f0e6', 5); plpLine(p, 52, 36, 62, 16, '#d8d4cc', 2);           // the rocket: body,
    plpLine(p, 61, 16, 65, 7, '#e8352b', 3); p.set(65, 6, '#e8352b');                               // nose,
    plpLine(p, 48, 33, 46, 39, '#e8352b', 2); plpLine(p, 55, 38, 56, 42, '#e8352b', 2); plpDisc(p, 58, 23, 1.2, '#2a6a9a');   // fins, porthole
    for (let y = 38; y < 46; y++) p.set(49 + (y & 1), y, y < 42 ? '#ffc860' : '#ff8a3a', EM);       // its flame
    // the woman: white headscarf, red dress, both arms up, a dove leaving her hands
    plpDisc(p, 19, 63, 3.2, '#e8b890'); p.rect(16, 59, 7, 3, '#f4f0e6'); p.rect(15, 61, 2, 4, '#f4f0e6');
    for (let y = 67; y < 92; y++) { const w = 7 + Math.round((y - 67) * 0.32); p.rect(19 - (w >> 1), y, w, 1, prng() < 0.85 ? '#c8302a' : '#b02824'); }
    plpLine(p, 22, 69, 27, 56, '#e8b890', 2); plpLine(p, 16, 69, 22, 55, '#e8b890', 2);
    plpDisc(p, 26, 50, 2.2, '#f8f8f4'); plpLine(p, 22, 47, 26, 50, '#f8f8f4', 2); plpLine(p, 30, 46, 26, 50, '#f8f8f4', 2); p.set(28, 49, '#e8a030');
    // the steelworker: helmet, blue overalls, the hammer over his shoulder, his free hand up to the rocket
    p.rect(45, 58, 8, 3, '#d8a030'); p.rect(44, 60, 10, 1, '#b8802a'); plpDisc(p, 49, 63, 3.2, '#d8a888');
    for (let y = 67; y < 92; y++) { const w = 11 + Math.round((y - 67) * 0.08); p.rect(49 - (w >> 1), y, w, 1, prng() < 0.85 ? '#2a4a8a' : '#24407a'); }
    plpLine(p, 53, 69, 58, 58, '#d8a888', 2); plpLine(p, 45, 70, 41, 62, '#d8a888', 2);
    plpLine(p, 41, 63, 37, 51, '#6a4a2a', 1); p.rect(34, 49, 6, 3, '#9aa2ae'); p.rect(34, 49, 6, 1, '#c8ccd2');
    for (const x of [15, 21, 45, 51]) p.rect(x, 92, 3, 3, '#2a2622');
    for (const m of [-1, 1]) for (let k = 0; k < 9; k++) { const x = (m < 0 ? 5 : 66) + m * Math.round(k * 0.4), y = 92 - k * 4; p.rect(x - 1, y, 3, 2, '#e8b84a', EM); p.set(x + m, y - 1, '#a8782a'); }   // wheat
    p.rect(0, 95, W, 9, '#9a1c18'); p.rect(0, 95, W, 1, '#f2c14e', EM); p.rect(0, 103, W, 1, '#c9a04a');
    p.text('TO THE STARS', 1, 96, '#f4ead0');
    p.rect(0, 0, W, 1, '#8a6a3a'); p.rect(0, 0, 1, 95, '#8a6a3a'); p.rect(W - 1, 0, 1, 95, '#8a6a3a');
    return p;
  },
  archTile() {   // the arch's walls: an underpass's glazed tiles, sea green to the dado, cream above (one repeat = 2 m x 2.8 m)
    const p = new Pix(16, 22); p.fill('#d8d2c0');
    p.rect(0, 12, 16, 10, '#3a6a64'); p.rect(0, 11, 16, 1, '#b8231e');
    for (let y = 0; y < 22; y += 2) p.rect(0, y, 16, 1, y < 12 ? '#c4beac' : '#2e5a54');
    for (let x = 0; x < 16; x += 2) for (let y = 0; y < 22; y++) if (((y >> 1) & 1) === (x >> 1 & 1)) p.set(x, y, y < 12 ? '#c4beac' : '#2e5a54');
    p.speck('#8a8478', 6); return p;
  },
  archSign() { const s = 'SUPERBLOCK 14', p = new Pix(88, 12); p.fill('#1a3a7a', EM); p.rect(0, 0, 88, 1, '#e6dac0', EM); p.rect(0, 11, 88, 1, '#e6dac0', EM); p.text(s, Math.round(44 - textW(s) / 2), 3, '#f4f1ea', EM); return p; },
  honorBoard() {   // BOARD OF HONOR: the estate's best workers, two rows of photographs under a red header (84 x 44 = 3.8 m x 2 m)
    const p = new Pix(84, 44); p.fill('#e6dac0'); p.rect(0, 0, 84, 10, '#b8231e'); p.rect(0, 9, 84, 1, '#f2c14e');
    p.text('BOARD OF HONOR', 1, 2, '#f2c14e');
    const hair = ['#3a2418', '#8a6a3a', '#1a1414', '#c8c4b8', '#5a3a22', '#a8782a'], shirt = ['#3a4a6a', '#e8e4dc', '#5a5a5a', '#8a3a2a', '#2a3a2a', '#e8e4dc'];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
      const x = 3 + c * 13.5, y = 12 + r * 16, i = (r * 6 + c * 5) % 6, X = Math.round(x);
      p.rect(X, y, 11, 12, '#f8f4ec'); p.rect(X + 1, y + 1, 9, 10, '#8a9aa8');
      plpDisc(p, X + 5.5, y + 5, 2.4, '#d8a888'); p.rect(X + 3, y + 2, 6, 2, hair[i]); if (i === 3) p.rect(X + 2, y + 2, 8, 3, '#e8e4dc');   // a kerchief
      p.rect(X + 2, y + 8, 8, 3, shirt[(i + r) % 6]); p.rect(X + 2, y + 13, 7, 1, '#5a564e');
    }
    p.rect(0, 43, 84, 1, '#8a7e66'); return p;
  },
  kioskFront() {   // a press kiosk: PRESS on a blue band, the lit window full of papers and magazines (2.2 m x 1.65 m)
    const p = new Pix(32, 24); p.fill('#5a7aa8'); p.rect(0, 0, 32, 6, '#1a3a7a', EM); p.text('PRESS', 2, 0, '#f4ead0', EM);
    p.rect(2, 7, 28, 10, '#ffe8b0', EM);
    for (let k = 0; k < 9; k++) { const x = 3 + (k % 5) * 5 + (k > 4 ? 2 : 0), y = k > 4 ? 12 : 8; p.rect(x, y, 4, 4, ['#c8302a', '#2a6a9a', '#e8c040', '#3a8a4a', '#e8e4dc'][(k * 3) % 5], EM); }
    p.rect(2, 16, 28, 1, '#3a3632'); p.rect(0, 18, 32, 1, '#3a5a8a'); p.speck('#4a6a98', 10); return p;
  },
  kioskSide() { const p = new Pix(16, 16); p.fill('#5a7aa8'); for (let x = 0; x < 16; x += 4) p.rect(x, 0, 1, 16, '#4a6a98'); p.rect(0, 0, 16, 4, '#1a3a7a'); return p; },
  // ---- the yard: the rocket, the carpet on its rail, the saloon with its bonnet up, chalk, an open garage, the pigeon loft
  rocketCage() {   // one side of the rocket's cage: red bars, yellow and blue hoops, open between (one repeat = a side, 3.3 m tall)
    const p = new Pix(8, 48);
    for (let y = 0; y < 48; y++) { p.set(0, y, '#c8302a'); p.set(4, y, '#b8282a'); }
    for (let y = 2; y < 48; y += 7) p.rect(0, y, 8, 1, ((y - 2) / 7) % 2 ? '#3a6aba' : '#f2c14e');
    p.rect(0, 46, 8, 2, '#c8302a'); return p;
  },
  rocketCabin() {   // the cabin band at the top of the cage: white sheet steel, a red stripe, a porthole on every other side
    const p = new Pix(8, 16); p.fill('#eeeae2'); p.rect(0, 0, 8, 2, '#c8302a'); p.rect(0, 14, 8, 2, '#c8302a');
    plpDisc(p, 3.5, 8, 2.6, '#8a9aa8'); plpDisc(p, 3.5, 8, 1.8, '#2a3a5a'); p.set(3, 7, '#9ab8e8'); return p;
  },
  rocketNose() { const p = new Pix(8, 16); p.fill('#c8302a'); p.rect(0, 9, 8, 3, '#eeeae2'); p.rect(0, 0, 8, 2, '#e8e4dc'); p.rect(2, 2, 1, 7, '#e8483a'); return p; },
  rocketFin() {   // a swept fin (cut out): blue, a white edge, a red tip
    const p = new Pix(16, 24);
    for (let y = 0; y < 24; y++) { const w = Math.min(16, Math.round(2 + y * 0.62)); for (let x = 0; x < w; x++) p.set(x, y, x === w - 1 ? '#f4f0e6' : y > 19 ? '#c8302a' : '#2a4a9a'); }
    return p;
  },
  carpet() {   // a wall carpet out for a beating: deep red field, a navy border, a medallion, a fringe (cut out)
    const p = new Pix(32, 48); p.fill('#8a1a1a');
    p.rect(0, 1, 32, 46, '#1a2a5a'); p.rect(3, 4, 26, 40, '#8a1a1a');
    for (let k = 0; k < 32; k += 3) { p.set(k, 2, '#e6dac0'); p.set(k, 45, '#e6dac0'); } for (let k = 4; k < 46; k += 3) { p.set(1, k, '#e6dac0'); p.set(30, k, '#e6dac0'); }
    for (let y = 0; y < 48; y++) for (let x = 0; x < 32; x++) { const d = Math.abs(x - 15.5) / 9 + Math.abs(y - 23.5) / 14; if (d < 1 && d > 0.62) p.set(x, y, '#1a2a5a'); else if (d <= 0.62 && d > 0.38) p.set(x, y, '#c9a04a'); else if (d <= 0.38) p.set(x, y, '#e6dac0'); }
    for (const [x, y] of [[8, 10], [23, 10], [8, 37], [23, 37]]) { p.rect(x - 1, y - 1, 3, 3, '#c9a04a'); p.set(x, y, '#1a2a5a'); }
    for (let x = 0; x < 32; x += 2) { p.set(x, 0, '#000000', 0); p.set(x, 47, '#000000', 0); } p.speck('#7a1616', 20); return p;
  },
  saloonSide() {   // a cream Krasnovian saloon's flank (one repeat = 4.15 m x 0.72 m): doors, a chrome strip, the wheel arches, rust
    const p = new Pix(32, 8); p.fill('#d4cab0'); p.rect(0, 3, 32, 1, '#c8ccd0'); p.rect(0, 2, 32, 1, '#e8e0cc');
    for (const x of [12, 21]) p.rect(x, 0, 1, 7, '#8a8270'); for (const x of [14, 23]) p.rect(x, 2, 2, 1, '#9aa2ae');
    for (const c of [6.5, 25.5]) for (let y = 4; y < 8; y++) for (let x = 0; x < 32; x++) if (Math.hypot(x - c, y - 8) < 4) p.set(x, y, '#1a1816');
    p.speck('#8a5a3a', 5); p.rect(0, 7, 32, 1, '#a89a78'); return p;
  },
  saloonCabin() { const p = new Pix(32, 8); p.fill('#d4cab0'); p.rect(2, 1, 28, 6, '#1e2630'); p.rect(15, 1, 2, 6, '#d4cab0'); p.rect(4, 2, 6, 1, '#4a5a6a'); p.rect(19, 2, 4, 1, '#4a5a6a'); return p; },
  saloonFront() { const p = new Pix(16, 8); p.fill('#d4cab0'); p.rect(4, 1, 8, 4, '#2a2826'); for (let x = 5; x < 12; x += 2) p.rect(x, 1, 1, 4, '#9aa2ae'); for (const x of [0, 13]) p.rect(x + 1, 1, 2, 3, '#e8e4d0'); p.rect(0, 6, 16, 2, '#b8bcc0'); return p; },
  saloonRear() { const p = new Pix(16, 8); p.fill('#d4cab0'); for (const x of [1, 12]) p.rect(x, 1, 3, 3, '#8a2020'); p.rect(5, 3, 6, 2, '#e8e4dc'); p.rect(6, 3, 4, 1, '#3a3632'); p.rect(0, 6, 16, 2, '#b8bcc0'); return p; },
  saloonPaint() { const p = new Pix(8, 8); p.fill('#d4cab0'); p.speck('#c8bea0', 4); return p; },
  engineBay() {   // under the bonnet: the block, the air filter, the battery, hoses, all of it oily
    const p = new Pix(16, 16); p.fill('#2a2826'); p.rect(3, 4, 8, 7, '#4a4a4c'); p.rect(4, 5, 6, 1, '#6a6a6e');
    plpDisc(p, 7, 7.5, 2.6, '#1a1a1c'); plpDisc(p, 7, 7.5, 1.2, '#3a3a3c'); p.rect(12, 2, 3, 4, '#3a3a40'); p.rect(12, 2, 1, 1, '#c8302a');
    p.rect(1, 12, 12, 1, '#1a1414'); p.rect(11, 6, 1, 7, '#1a1414'); p.speck('#141210', 10); return p;
  },
  hopscotch() {   // chalk on the path (cut out): 1 2 3, 4|5, 6, 7|8, home (one repeat = 1 m x 3 m)
    const p = new Pix(16, 48), c = '#ece8e0', D = { 1: '010110010010111', 2: '111001111100111', 3: '111001011001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001010010', 8: '111101111101111' };
    const dig = (n, x, y, col) => { const g = D[n]; for (let i = 0; i < 15; i++) if (g[i] === '1') p.set(x + (i % 3), y + Math.floor(i / 3), col); };
    const box = (x0, y0, w, h) => { p.rect(x0, y0, w, 1, c); p.rect(x0, y0 + h - 1, w, 1, c); p.rect(x0, y0, 1, h, c); p.rect(x0 + w - 1, y0, 1, h, c); };
    const rows = [[47 - 6, [1]], [41 - 6, [2]], [35 - 6, [3]], [29 - 6, [4, 5]], [23 - 6, [6]], [17 - 6, [7, 8]]];
    for (const [y, ns] of rows) { if (ns.length === 1) { box(3, y, 10, 7); dig(ns[0], 7, y + 1, '#ff9ac8'); } else { box(0, y, 8, 7); box(8, y, 8, 7); dig(ns[0], 3, y + 1, '#f2e080'); dig(ns[1], 11, y + 1, '#f2e080'); } }
    for (let a = 0; a <= 16; a++) { const t = a / 16 * Math.PI; p.set(Math.round(8 - Math.cos(t) * 6.5), Math.round(11 - Math.sin(t) * 7), c); }
    for (let k = 0; k < 30; k++) p.set(Math.floor(prng() * 16), Math.floor(prng() * 48), '#000000', 0);
    return p;
  },
  chalkArt() {   // more chalk: a sun, a rocket going up on a flame, a family holding hands (cut out)
    const p = new Pix(32, 32);
    plpDisc(p, 6, 6, 3.2, '#f2e080'); for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; p.set(Math.round(6 + Math.cos(t) * 5.5), Math.round(6 + Math.sin(t) * 5.5), '#f2e080'); }
    plpLine(p, 15, 22, 22, 6, '#ece8e0', 2); plpLine(p, 21, 7, 23, 3, '#ff7a9a', 1); plpLine(p, 14, 21, 12, 25, '#ff9a40', 1); plpLine(p, 16, 23, 15, 27, '#ff9a40', 1);
    for (const [x, h] of [[4, 8], [9, 6], [13, 9]]) { plpDisc(p, x, 29 - h, 1.1, '#9ac8ff'); p.rect(x, 30 - h, 1, h - 3, '#9ac8ff'); p.rect(x - 1, 29, 1, 2, '#9ac8ff'); p.rect(x + 1, 29, 1, 2, '#9ac8ff'); }
    p.rect(4, 25, 10, 1, '#9ac8ff'); return p;
  },
  garageOpen() {   // a lock-up with its door open: lit, shelves of jars and tins, a motorcycle and sidecar, a tyre on the wall
    const p = new Pix(24, 20); p.fill('#c89a58', EM);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 24; x++) { const d = Math.hypot(x - 12, y - 2) / 16; if (d > 0.7) p.set(x, y, '#8a6a3a', EM); else if (d < 0.35) p.set(x, y, '#ffd890', EM); }
    p.rect(11, 0, 2, 2, '#fff8e0', EM);
    for (const y of [5, 9]) { p.rect(1, y, 6, 1, '#5a3a22', EM); for (let x = 1; x < 7; x += 2) p.rect(x, y - 2, 1, 2, ['#3a8a4a', '#c8302a', '#9aa2ae'][(x + y) % 3], EM); }
    plpDisc(p, 20, 6, 2.8, '#1a1816', EM); plpDisc(p, 20, 6, 1.4, '#8a6a3a', EM);
    p.rect(8, 11, 9, 4, '#2e4a32', EM); p.rect(14, 10, 6, 3, '#2e4a32', EM); p.rect(10, 9, 3, 2, '#1a1a1a', EM);
    for (const x of [9, 17, 21]) { plpDisc(p, x, 17, 1.9, '#141210', EM); p.set(x, 17, '#9aa2ae', EM); }
    p.rect(0, 0, 24, 1, '#3a3632'); p.rect(0, 0, 1, 20, '#3a3632'); p.rect(23, 0, 1, 20, '#3a3632'); return p;
  },
  pigeonLoft() { const p = new Pix(16, 16); p.fill('#6a4a2a'); for (let y = 0; y < 16; y += 3) p.rect(0, y, 16, 1, '#4a3018'); p.rect(4, 4, 8, 6, '#1a1612'); for (let x = 4; x < 12; x += 2) p.rect(x, 4, 1, 6, '#9a968e'); for (let y = 5; y < 10; y += 2) p.rect(4, y, 8, 1, '#9a968e'); p.rect(3, 11, 10, 1, '#c8b48a'); return p; },
  benchBag() {   // a string bag on the bench (cut out): a bottle of kefir, a loaf, the mesh
    const p = new Pix(8, 10); p.rect(3, 0, 1, 3, '#c8c4b8'); p.rect(2, 0, 3, 1, '#c8c4b8');
    for (let y = 3; y < 10; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2 === 0 && Math.abs(x - 3.5) < 1 + (y - 3) * 0.6) p.set(x, y, '#c8c4b8');
    p.rect(2, 4, 2, 5, '#f4f2ea'); p.rect(2, 3, 2, 1, '#3a6aaa'); p.rect(4, 6, 3, 3, '#b8803a'); return p;
  },
  // ---- the windows that tell a story (16 x 14 = one of the slab's windows, 1.5 m x 1.225 m): the frame, then the room
  winParty() { return sbWin('#ffcf86', (p) => { for (let x = 1; x < 15; x += 2) p.set(x, 1 + (x % 4 === 1 ? 1 : 0), ['#ff3a3a', '#3aff6a', '#3a8aff', '#ffe03a'][(x >> 1) % 4], EM); for (const [x, s] of [[3, 1], [8, -1], [12, 1]]) sbDancer(p, x, s); p.rect(13, 3, 2, 10, '#ff6ab8', EM); }); },
  winParty2() { return sbWin('#c86ae8', (p) => { p.rect(1, 1, 7, 12, '#5a8aff', EM); for (const [x, s] of [[4, -1], [10, 1]]) sbDancer(p, x, s); p.set(7, 2, '#ffffff', EM); }); },
  winQuarrel() { return sbWin('#ffe0a0', (p) => { p.rect(7, 1, 1, 3, '#3a3026', EM); p.rect(6, 4, 3, 1, '#fff4d0', EM); sbBust(p, 4, 6, '#2a1e18'); plpLine(p, 6, 8, 8, 3, '#2a1e18', 1); sbBust(p, 12, 7, '#2a1e18'); }); },
  winTV() { return sbWin('#22305a', (p) => { for (let y = 1; y < 13; y++) for (let x = 1; x < 15; x++) if (Math.hypot(x - 15, y - 12) < 9 && (x + y) % 2) p.set(x, y, '#9ab8ff', EM); p.rect(1, 10, 14, 3, '#141424', EM); for (const x of [4, 7, 10]) plpDisc(p, x, 9.5, 1.5, '#141424', EM); }); },
  winCat() { return sbWin('#ffd890', (p) => { p.rect(1, 1, 4, 12, '#c86a2a', EM); p.rect(11, 1, 4, 12, '#c86a2a', EM); plpDisc(p, 8, 10, 2.2, '#1a1414', EM); plpDisc(p, 8, 6.5, 1.5, '#1a1414', EM); p.set(7, 4, '#1a1414', EM); p.set(9, 4, '#1a1414', EM); p.rect(10, 11, 3, 1, '#1a1414', EM); p.rect(12, 9, 1, 2, '#1a1414', EM); }); },
  winSmoker() { return sbWin('#1e1c26', (p) => { p.rect(1, 1, 14, 5, '#2a3048', EM); sbBust(p, 7, 5, '#0e0c10'); p.set(9, 7, '#ff6020', EM); p.set(10, 6, '#8a8a9a', EM); p.set(11, 4, '#6a6a7a', EM); }); },
  winStudent() { return sbWin('#2a2620', (p) => { for (let y = 6; y < 13; y++) for (let x = 1; x < 9; x++) if (Math.hypot(x - 4, y - 7) < 5) p.set(x, y, '#c8e0a0', EM); p.rect(3, 4, 3, 2, '#2a6a3a', EM); sbBust(p, 10, 6, '#141210'); p.rect(2, 11, 6, 1, '#e8e4dc', EM); }); },
  winGran() { return sbWin('#ffe8b8', (p) => { for (let y = 1; y < 13; y++) for (let x = 1; x < 15; x++) if ((x * 3 + y * 5) % 7 === 0) p.set(x, y, '#fff8ec', EM); sbBust(p, 8, 5, '#3a2a2a'); p.rect(6, 4, 5, 2, '#e8e4dc', EM); p.rect(1, 11, 14, 2, '#5a3a22', EM); for (const x of [3, 12]) { p.rect(x - 1, 9, 3, 2, '#3a7a2a', EM); p.set(x, 8, '#e8302a', EM); } }); },
  winFamily() { return sbWin('#ffd890', (p) => { p.rect(6, 1, 4, 2, '#e87a2a', EM); for (const x of [3, 8, 13]) sbBust(p, x, 6, '#3a2418'); p.rect(1, 11, 14, 2, '#f0e8dc', EM); p.set(5, 11, '#c8302a', EM); p.set(10, 11, '#3a6aaa', EM); }); },
  winKitchen7() { return sbWin('#dcecf4', (p) => { for (let x = 1; x < 15; x += 3) p.rect(x, 1, 1, 12, '#c4d4dc', EM); p.rect(1, 2, 14, 1, '#8a8a8a', EM); for (const [x, c] of [[2, '#e8e4dc'], [6, '#c86a8a'], [10, '#6a8ac8']]) p.rect(x, 3, 3, 3, c, EM); sbBust(p, 7, 7, '#3a3a40'); p.rect(1, 11, 14, 2, '#e8e8e0', EM); p.rect(3, 10, 3, 1, '#c8302a', EM); }); },
  winLanding() { return sbWin('#d8e4dc', (p) => { p.rect(1, 8, 14, 5, '#3e6a5a', EM); p.rect(1, 8, 14, 1, '#24463a', EM); p.rect(7, 1, 1, 2, '#3a3026', EM); p.rect(6, 3, 3, 1, '#fff4d0', EM); p.rect(10, 6, 4, 7, '#6a3a2a', EM); }); },
  // ---- podezd 3 inside: the lobby, the 7th, the corridor, the communal kitchen
  pzMail() {   // the mailboxes: 4 rows of 8 tin boxes, dented, one burnt, letters sticking out, one airmail from Krasnograd (2.4 m x 1.2 m)
    const p = new Pix(48, 24); p.fill('#3a4a5a');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
      const x = 1 + c * 6, y = 1 + r * 6, q = prng(); p.rect(x, y, 5, 5, q < 0.08 ? '#1e1c1e' : '#6a7a8a'); p.rect(x + 1, y + 1, 3, 1, '#1e2228'); p.set(x + 4, y + 4, '#c9a04a');
      if (q > 0.08 && q < 0.25) { p.set(x + 1, y + 3, '#4a5a6a'); p.set(x + 2, y + 2, '#4a5a6a'); }   // dented
      if (q > 0.6) p.rect(x + 1, y, 3, 1, '#f4f0e6');                                                 // a letter in the slot
    }
    p.rect(19, 13, 3, 1, '#f4f0e6'); p.set(19, 13, '#c8302a'); p.set(21, 13, '#3a6aaa');            // the airmail stripes
    return p;
  },
  pzNotice() {   // the notice board: cork, papers: WATER OFF THU, CLEAN UP SAT 9.00, LOST CAT, LIFT A BROKEN AT 7 (1.6 m x 0.96 m)
    const p = new Pix(100, 60); p.fill('#5a3a22'); p.rect(2, 2, 96, 56, '#a87a4a'); p.speck('#98703e', 80); p.speck('#b8885a', 40);
    const paper = (x, y, w, h, col) => { p.rect(x, y, w, h, col); p.rect(x + 1, y + h, w, 1, '#6a4a2a'); p.set(x + (w >> 1), y + 1, '#c8302a'); };
    paper(4, 6, 44, 22, '#f4f0e6'); p.text('WATER', 6, 9, '#2a2622'); p.text('OFF THU', 6, 18, '#2a2622');
    paper(50, 4, 48, 24, '#f2e8a0'); p.text('CLEAN UP', 50, 7, '#b8231e'); p.text('SAT 9.00', 50, 17, '#2a2622');
    paper(4, 32, 40, 25, '#e8e4dc'); p.text('LOST', 6, 34, '#2a2622'); p.text('CAT', 6, 43, '#2a2622'); plpDisc(p, 34, 46, 3, '#3a3632'); plpDisc(p, 34, 41.5, 2, '#3a3632'); p.set(33, 39, '#3a3632'); p.set(35, 39, '#3a3632');
    paper(48, 31, 48, 27, '#f4f0e6'); p.rect(48, 31, 48, 2, '#b8231e'); p.text('LIFT A', 50, 34, '#b8231e'); p.text('BROKEN', 50, 42, '#2a2622'); p.text('AT 7', 50, 50, '#2a2622');
    return p;
  },
  pzPlant() {   // a geranium's leaves and flowers (cut out), for the babushka's pots
    const p = new Pix(16, 16);
    for (let k = 0; k < 14; k++) plpDisc(p, 3 + prng() * 10, 5 + prng() * 10, 1.4 + prng() * 1.4, prng() < 0.5 ? '#3a6a2a' : '#4a7a32');
    for (let k = 0; k < 5; k++) { const x = 2 + prng() * 12, y = 1 + prng() * 7; plpDisc(p, x, y, 1.3, '#e8302a'); p.set(Math.round(x), Math.round(y), '#ff7a6a'); }
    return p;
  },
  pzTube() { const p = new Pix(16, 4); p.fill('#eef8ff', EM); p.rect(0, 0, 5, 4, '#7a8088'); p.rect(4, 1, 1, 2, '#c8d4dc', EM); p.rect(0, 0, 16, 1, '#8a9aa8'); p.rect(0, 3, 16, 1, '#8a9aa8'); return p; },
  pzStairs() { const s = 'STAIRS CLOSED', p = new Pix(80, 10); p.fill('#f4ead0'); p.rect(0, 0, 80, 1, '#b8231e'); p.rect(0, 9, 80, 1, '#b8231e'); p.text(s, Math.round(40 - textW(s) / 2), 2, '#b8231e'); p.speck('#d8ccb0', 10); return p; },
  pzNoteLift() {   // taped by lift A on the 7th, in a resident's hand: USE LIFT B, an arrow toward the north wing
    const p = new Pix(48, 26); p.fill('#f4f0e0'); p.speck('#e4dcc8', 20);
    for (const [x, y] of [[0, 0], [44, 0], [0, 23], [44, 23]]) p.rect(x, y, 4, 3, '#d8d0a8');
    p.text('USE', 3, 3, '#2a3a8a'); p.text('LIFT B', 3, 12, '#b8231e');
    plpLine(p, 10, 22, 40, 22, '#2a3a8a', 1); plpLine(p, 40, 22, 36, 19, '#2a3a8a', 1); plpLine(p, 40, 22, 36, 25, '#2a3a8a', 1);
    return p;
  },
  pzArrow() {   // stencilled on the 7th's wall: LIFT B and a big red arrow (pointing to the left of the picture)
    const p = new Pix(56, 16); p.text('LIFT B', 20, 1, '#b8231e');
    for (let y = 9; y < 16; y++) { const w = 6 - Math.abs(y - 12) * 2; if (w > 0) p.rect(2 + Math.abs(y - 12) * 2, y, 6, 1, '#b8231e'); }
    p.rect(8, 11, 44, 3, '#b8231e'); return p;
  },
  pzBike() {   // a child's bicycle leaning on the wall (cut out)
    const p = new Pix(32, 20), c = '#2a3a6a', m = '#9aa2ae';
    for (const cx of [7, 25]) for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; p.set(Math.round(cx + Math.cos(t) * 6), Math.round(13 + Math.sin(t) * 6), '#1a1a1a'); }
    plpLine(p, 7, 13, 14, 13, c, 1); plpLine(p, 14, 13, 11, 6, c, 1); plpLine(p, 11, 6, 22, 6, c, 1); plpLine(p, 22, 6, 25, 13, c, 1); plpLine(p, 22, 6, 14, 13, c, 1); plpLine(p, 7, 13, 11, 6, c, 1);
    p.rect(9, 4, 5, 1, '#3a2418'); plpLine(p, 22, 6, 21, 2, m, 1); p.rect(19, 2, 4, 1, m); return p;
  },
  pzWallNews() {   // the block's wall newspaper: OUR BLOCK, columns, a drawing of the yard's rocket, a photograph
    const p = new Pix(64, 32); p.fill('#f4f0e6'); p.rect(0, 0, 64, 9, '#b8231e'); p.text('OUR BLOCK', 5, 1, '#f4ead0');
    for (let c = 0; c < 3; c++) for (let y = 12; y < 30; y += 2) p.rect(2 + c * 21, y, 14 + (y * 7 + c) % 5, 1, '#8a8478');
    p.rect(44, 12, 16, 16, '#f4f0e6'); plpLine(p, 49, 26, 55, 13, '#c8302a', 2); plpLine(p, 47, 26, 50, 22, '#2a4a9a', 1); plpLine(p, 57, 26, 54, 22, '#2a4a9a', 1);
    p.rect(23, 12, 14, 10, '#6a7a8a'); plpDisc(p, 30, 16, 2, '#c8b49a'); p.rect(27, 18, 7, 4, '#3a3632'); return p;
  },
  pzOilcloth() { const p = new Pix(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p.set(x, y, ((x >> 2) + (y >> 2)) % 2 ? '#c8302a' : '#f0e8dc'); for (const [x, y] of [[4, 4], [12, 12], [4, 12], [12, 4]]) p.set(x, y, '#3a7a3a'); return p; },
  pzRadio() {   // a valve radio on the shelf: walnut, a cloth grille, the dial glowing amber, two knobs
    const p = new Pix(24, 16); p.fill('#5a2e16'); p.rect(1, 1, 22, 14, '#6a3a1e'); p.rect(2, 3, 11, 10, '#c8b48a');
    for (let x = 3; x < 13; x += 2) p.rect(x, 3, 1, 10, '#a8946a');
    p.rect(14, 3, 8, 5, '#ffc060', EM); p.rect(14, 5, 8, 1, '#c88a30', EM); p.rect(17, 3, 1, 5, '#5a2e16', EM);
    for (const x of [15, 20]) { plpDisc(p, x, 11, 1.4, '#2a1a10'); p.set(x, 10, '#c9a04a'); } return p;
  },
  pzGeyser() { const p = new Pix(16, 24); p.fill('#e8e4dc'); p.rect(0, 0, 16, 2, '#9aa2ae'); p.rect(0, 22, 16, 2, '#9aa2ae'); p.rect(5, 13, 6, 4, '#141418'); p.rect(6, 15, 4, 2, '#4aa0ff', EM); p.set(7, 14, '#9ac8ff', EM); plpDisc(p, 8, 19, 1.4, '#3a3a40'); p.rect(2, 4, 12, 1, '#c8c4b8'); return p; },
  pzShelf() {   // the kitchen's open shelves (cut out between the jars): pickles, jam, tins, a stack of plates
    const p = new Pix(32, 16);
    for (const y of [7, 15]) p.rect(0, y, 32, 1, '#6a4a2a');
    const jar = (x, y, w, h, c) => { p.rect(x, y - h, w, h, c); p.rect(x, y - h, w, 1, '#c8c4b8'); };
    jar(1, 7, 3, 5, '#5a8a3a'); jar(5, 7, 3, 4, '#a8302a'); jar(9, 7, 3, 5, '#5a8a3a'); jar(14, 7, 4, 3, '#c8a040'); jar(20, 7, 3, 6, '#e8e4dc'); jar(25, 7, 5, 2, '#f4f0e6'); p.rect(25, 3, 5, 1, '#f4f0e6');
    jar(2, 15, 4, 4, '#9aa2ae'); jar(8, 15, 3, 5, '#a8302a'); jar(13, 15, 3, 5, '#e8a030'); jar(18, 15, 6, 3, '#3a6aaa'); jar(26, 15, 3, 6, '#5a8a3a');
    return p;
  },
  pzCalendar() {   // a wall calendar: the Palace of the Union, Krasnograd, over May (the 1st circled)
    const p = new Pix(24, 32); p.fill('#f4f0e6'); p.rect(1, 1, 22, 14, '#5a7ab8');
    for (const [w, y0, y1] of [[16, 11, 15], [10, 7, 11], [6, 4, 7], [2, 1, 4]]) p.rect(12 - w / 2, y0, w, y1 - y0, '#e8e0cc');
    p.set(12, 1, '#f2c14e'); p.set(11, 2, '#f2c14e'); p.set(13, 2, '#f2c14e');
    p.text('MAY', 3, 16, '#b8231e');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) p.set(3 + c * 3, 25 + r * 2, '#5a564e');
    plpDisc(p, 3, 25, 1.4, '#e8302a'); p.set(3, 25, '#5a564e'); return p;
  },
  pzKitchenWin() {   // the communal kitchen's window: night over the yard, the slab opposite, the rocket lit white down there
    const p = new Pix(16, 24); p.fill('#e6e2d6'); p.rect(1, 1, 14, 22, '#141a2e', EM);
    for (let y = 9; y < 17; y += 2) for (let x = 2; x < 15; x += 2) if (prng() < 0.4) p.set(x, y, prng() < 0.2 ? '#9ab8ff' : '#ffc870', EM);
    p.rect(1, 17, 14, 6, '#2a2018', EM); for (let x = 1; x < 15; x++) if ((x * 5) % 7 < 3) p.set(x, 18 + (x % 3), '#c86a2a', EM);
    p.rect(9, 18, 2, 4, '#e8ecf4', EM); p.set(9, 17, '#e8352b', EM); p.set(10, 17, '#e8352b', EM);
    p.rect(7, 1, 2, 22, '#e6e2d6'); p.rect(1, 11, 14, 1, '#e6e2d6'); return p;
  },
  pzSteam() {   // steam off the pots (cut out): dense over the pot, thinning as it rises and drifts
    const p = new Pix(16, 32), B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) { const cx = 8 + Math.sin(y * 0.35) * 2.5, d = Math.abs(x - cx) / (2 + (32 - y) * 0.12), k = (y / 32) * (1 - d) * 0.8; if (B[(x & 3) + (y & 3) * 4] / 16 < k) p.set(x, y, y > 20 ? '#f4f6f8' : '#dce2e8'); }
    return p;
  },
  pzFlame() { const p = new Pix(8, 8); for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2; p.set(Math.round(3.5 + Math.cos(t) * 3), Math.round(3.5 + Math.sin(t) * 3), a % 3 ? '#3a7aff' : '#9ac8ff', EM); } return p; },
  pzShade() { const p = new Pix(8, 8); p.fill('#e87a2a', EM); p.rect(0, 6, 8, 2, '#c85a1a', EM); for (let x = 0; x < 8; x += 2) p.set(x, 7, '#000000', 0); return p; },
  pzMat() { const p = new Pix(16, 8); p.fill('#5a3a2a'); p.rect(1, 1, 14, 6, '#6a4a32'); for (let x = 2; x < 14; x += 3) p.rect(x, 2, 1, 4, '#4a2a1a'); return p; },
  pzTVGlow() { const p = new Pix(8, 2); p.fill('#7a9aff', EM); p.set(3, 0, '#c8d8ff', EM); return p; },
  roofGravel() {   // the wing's roof: grey gravel over bitumen, the felt's seams, a few puddles catching the sky (one repeat = 4 m)
    const p = new Pix(32, 32); p.fill('#5a564e'); p.speck('#6e6a62', 90); p.speck('#46423c', 70); p.speck('#7a766c', 30);
    for (let y = 0; y < 32; y += 8) p.rect(0, y, 32, 1, '#34302c');
    for (const [x, y, w] of [[5, 11, 6], [20, 25, 4]]) { p.rect(x, y, w, 2, '#3a3e4a'); p.rect(x + 1, y, w - 2, 1, '#4a5060'); }
    return p;
  },
  stoveFront() {   // a gas stove's front: white enamel, four knobs, the oven door with its window and handle
    const p = new Pix(16, 16); p.fill('#e8e4dc'); p.rect(0, 0, 16, 1, '#8a867a');
    for (let x = 2; x < 15; x += 4) { p.rect(x, 2, 2, 2, '#2a2a2e'); p.set(x, 2, '#9aa2ae'); }
    p.rect(1, 5, 14, 10, '#d8d4cc'); p.rect(2, 6, 12, 1, '#9aa2ae'); p.rect(4, 8, 8, 5, '#2a2622'); p.rect(5, 9, 3, 1, '#4a4642'); p.rect(0, 15, 16, 1, '#5a564e'); return p;
  },
  yardPath() {   // the yard's asphalt paths: grey, patched, cracked (one repeat = 4 m)
    const p = new Pix(32, 32); p.fill('#46423e'); p.speck('#524e48', 50); p.speck('#36322e', 40);
    p.rect(6, 14, 9, 6, '#3c3834'); for (let k = 0; k < 14; k++) p.set(18 + k, 4 + Math.round(Math.sin(k * 0.8) * 1.5) + (k >> 2), '#2a2622'); return p;
  },
  pzYagi() {   // a TV aerial's elements on their boom, against the sky (cut out)
    const p = new Pix(32, 12), c = '#2a2c30';
    p.rect(0, 6, 32, 1, c); for (let k = 0; k < 8; k++) { const x = 2 + k * 4, h = 5 - Math.round(k * 0.45); p.rect(x, 6 - h, 1, h * 2 + 1, c); }
    p.rect(30, 3, 1, 7, c); p.rect(28, 3, 3, 1, c); return p;
  },
  pzDanger() { const p = new Pix(24, 16); p.fill('#e8c020'); p.rect(0, 0, 24, 1, '#1a1a1a'); p.rect(0, 15, 24, 1, '#1a1a1a'); p.rect(0, 0, 1, 16, '#1a1a1a'); p.rect(23, 0, 1, 16, '#1a1a1a'); plpLine(p, 13, 2, 9, 8, '#1a1a1a', 2); plpLine(p, 9, 8, 15, 8, '#1a1a1a', 2); plpLine(p, 15, 8, 10, 14, '#1a1a1a', 2); return p; },
  pzMachineWin() { const p = new Pix(16, 12); p.fill('#e6e2d6'); p.rect(1, 1, 14, 10, '#c89850', EM); plpDisc(p, 8, 7, 3.2, '#3a2a1a', EM); plpDisc(p, 8, 7, 1.4, '#7a6040', EM); p.rect(3, 2, 2, 2, '#fff4d0', EM); p.rect(7, 1, 2, 10, '#e6e2d6'); return p; },
});
// ---- painting helpers for the story windows
function sbWin(bg, room) {   // a lit window over one of the slab's: the room, then the frame, the mullion and the transom over it
  const p = new Pix(16, 14); p.fill(bg, EM); room(p);
  p.rect(0, 0, 16, 1, '#5e5a54'); p.rect(0, 13, 16, 1, '#5e5a54'); p.rect(0, 0, 1, 14, '#5e5a54'); p.rect(15, 0, 1, 14, '#5e5a54');
  p.rect(7, 1, 1, 12, '#8a6a48'); p.rect(1, 6, 14, 1, '#8a6a48'); return p;
}
function sbBust(p, cx, top, col) {   // a figure from the chest up, its head at (cx, top + 1)
  plpDisc(p, cx, top + 1, 1.6, col, EM);
  for (let y = top + 3; y < 13; y++) { const w = Math.min(7, 1 + (y - top - 3) * 2); p.rect(cx - (w >> 1), y, w, 1, col, EM); }
}
function sbDancer(p, x, s) {   // a dancer, arms up, hips swung to side s
  plpDisc(p, x, 4, 1.3, '#3a2018', EM); p.rect(x - 1, 6, 3, 4, '#3a2018', EM); p.rect(x - 1 + s, 10, 1, 3, '#3a2018', EM); p.rect(x + 1 + s, 10, 1, 3, '#3a2018', EM);
  p.set(x - 2, 5, '#3a2018', EM); p.set(x - 2, 4, '#3a2018', EM); p.set(x + 2, 5, '#3a2018', EM); p.set(x + 3, 4, '#3a2018', EM);
}

