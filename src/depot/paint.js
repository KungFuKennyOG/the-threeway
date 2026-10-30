'use strict';
// ============================== level 3: Tram Depot 7, painted textures =====
// Krasnovia: concrete, soot-dark brick, green trams with a cream stripe, sodium orange outside, cold tubes inside.
// Painted in code like the street, into the same atlas (so the depot costs no extra textures or draw calls).
Object.assign(PAINT, {
  asphaltK() { const p = new Pix(32, 32); p.fill('#2a2624'); p.speck('#36302c', 40); p.speck('#1e1a1a', 30); p.rect(3, 20, 9, 1, '#22201e'); p.rect(18, 7, 1, 8, '#22201e'); return p; },
  track() {   // sleepers in gravel, two rails (one repeat = 2 m of track, 2.4 m wide)
    const p = new Pix(16, 16); p.fill('#3a3430'); p.speck('#4a443e', 26); p.speck('#2a2622', 18);
    for (let y = 1; y < 16; y += 4) p.rect(1, y, 14, 2, '#4a3426');
    p.rect(3, 0, 1, 16, '#9aa2ae'); p.rect(12, 0, 1, 16, '#9aa2ae'); p.rect(4, 0, 1, 16, '#5a6068'); p.rect(13, 0, 1, 16, '#5a6068');
    return p;
  },
  pit() { const p = new Pix(16, 16); p.fill('#141012'); p.rect(0, 0, 16, 1, '#c9a04a'); p.rect(0, 15, 16, 1, '#c9a04a'); for (let x = 0; x < 16; x += 4) p.rect(x, 0, 2, 1, '#1a1214'); p.rect(3, 2, 1, 14, '#9aa2ae'); p.rect(12, 2, 1, 14, '#9aa2ae'); return p; },
  brickHall() {   // soot-dark industrial brick, a lighter band every few courses
    const p = new Pix(32, 32); p.fill('#3a2420');
    for (let y = 0; y < 32; y += 4) for (let x = ((y >> 2) & 1) * 4; x < 32; x += 8) { p.rect(x, y, 7, 3, ['#5a3228', '#52302a', '#623a2c'][(x + y) % 3]); }
    p.rect(0, 15, 32, 1, '#7a6a5a'); p.speck('#2a1c1a', 24); return p;
  },
  brickIn() { const p = new Pix(32, 32); p.fill('#4a3a34'); for (let y = 0; y < 32; y += 4) for (let x = ((y >> 2) & 1) * 4; x < 32; x += 8) p.rect(x, y, 7, 3, ['#6e584e', '#66524a', '#7a6458'][(x + y) % 3]); p.rect(0, 28, 32, 4, '#2e4a44'); p.speck('#3a2c28', 20); return p; },
  concreteFloor() { const p = new Pix(32, 32); p.fill('#5a5650'); p.rect(0, 0, 32, 1, '#4a4640'); p.rect(0, 0, 1, 32, '#4a4640'); p.speck('#66625a', 30); p.speck('#46423c', 30); p.rect(9, 12, 7, 3, '#3e3a34'); return p; },
  tram() {   // Krasnovian tram side: green, cream stripe, windows (lit and dark), route board
    const p = new Pix(32, 16); p.fill('#2e5a3a');
    p.rect(0, 9, 32, 2, '#e6dac0'); p.rect(0, 15, 32, 1, '#1a2a1e');
    for (let x = 1; x < 32; x += 8) { const lit = prng() < 0.4; p.rect(x, 2, 6, 6, lit ? '#ffd890' : '#1e2a24', lit ? EM : 255); p.rect(x, 2, 6, 1, '#3e6a4a'); }
    p.rect(0, 12, 32, 1, '#24482e'); return p;
  },
  tramEnd() { const p = new Pix(16, 16); p.fill('#2e5a3a'); p.rect(2, 2, 12, 6, '#1e2a24'); p.rect(3, 3, 10, 4, '#304a40'); p.rect(0, 9, 16, 2, '#e6dac0'); p.rect(2, 12, 3, 2, '#ffe8b0', EM); p.rect(11, 12, 3, 2, '#ffe8b0', EM); p.rect(5, 0, 6, 2, '#1a1a1a'); p.text('7', 6, 0, '#ffb060', EM); return p; },
  corrugated() { const p = new Pix(16, 16); p.fill('#4a4e52'); for (let x = 0; x < 16; x += 2) p.rect(x, 0, 1, 16, '#3a3e42'); p.speck('#6a4a3a', 10); return p; },
  skylight() { const p = new Pix(16, 16); p.fill('#2a3448', EM); for (let x = 0; x < 16; x += 4) p.rect(x, 0, 1, 16, '#14181e'); p.rect(0, 7, 16, 1, '#14181e'); p.speck('#3a4860', 10, EM); return p; },
  fluor() { const p = new Pix(8, 4); p.fill('#eef8ff', EM); p.rect(0, 0, 8, 1, '#8a9aa8'); p.rect(0, 3, 8, 1, '#8a9aa8'); return p; },
  canvas() { const p = new Pix(16, 16); p.fill('#d8ccb0'); p.speck('#c8bca0', 30); p.speck('#8a3a30', 4); p.rect(0, 0, 16, 1, '#b8ac90'); return p; },
  rope() { const p = new Pix(8, 2); p.fill('#c8202c'); p.rect(0, 1, 8, 1, '#8a1018'); return p; },
  padRed() { const p = new Pix(8, 8); p.fill('#b8231e'); p.rect(0, 0, 8, 1, '#e8352b'); return p; },
  padBlue() { const p = new Pix(8, 8); p.fill('#2a4a8a'); p.rect(0, 0, 8, 1, '#4a6ab0'); return p; },
  locker() { const p = new Pix(16, 32); p.fill('#5a6a5e'); for (let x = 0; x < 16; x += 8) { p.rect(x, 0, 1, 32, '#3a463e'); p.rect(x + 2, 3, 4, 1, '#3a463e'); p.rect(x + 2, 5, 4, 1, '#3a463e'); p.rect(x + 6, 14, 1, 3, '#c9a04a'); } return p; },
  workbench() { const p = new Pix(16, 8); p.fill('#5a3a24'); p.rect(0, 0, 16, 2, '#7a5434'); p.rect(2, 3, 3, 3, '#3a4a5a'); p.rect(8, 3, 5, 2, '#9aa2ae'); return p; },
  toolboard() { const p = new Pix(32, 16); p.fill('#6a5a44'); p.speck('#5a4a36', 30); for (let x = 2; x < 32; x += 5) { p.rect(x, 3, 1, 8, '#9aa2ae'); p.rect(x - 1, 3, 3, 2, '#3a3e44'); } p.rect(24, 9, 6, 3, '#b8231e'); return p; },
  depotSign() { const p = new Pix(96, 16); p.fill('#b8231e', EM); p.rect(0, 0, 96, 1, '#ffb060', EM); p.rect(0, 15, 96, 1, '#ffb060', EM); p.bigText('DEPOT 7', 12, 1, '#ffe8c0', EM); for (let a = 0; a < 10; a++) { const t = a / 10 * Math.PI * 2; p.set(6 + Math.round(Math.cos(t) * 4), 8 + Math.round(Math.sin(t) * 4), '#f2c14e', EM); } return p; },
  volkovPoster() {   // a fight poster, red and cream: the Bear, champion 1979
    const p = new Pix(24, 32); p.fill('#e6dac0'); p.rect(1, 1, 22, 30, '#b8231e');
    p.rect(7, 6, 10, 9, '#d8a888'); p.rect(7, 12, 10, 4, '#9a968e'); p.rect(5, 15, 14, 9, '#f2c14e'); p.rect(9, 8, 2, 1, '#140b12'); p.rect(13, 8, 2, 1, '#140b12');
    p.text('BEAR', 1, 24, '#e6dac0'); return p;
  },
  sodiumHead() { const p = new Pix(8, 4); p.fill('#ff9a3c', EM); p.rect(0, 0, 8, 1, '#3a3632'); return p; },
  gate() { const p = new Pix(16, 16); p.fill('#2a2e2a'); for (let x = 1; x < 16; x += 3) p.rect(x, 0, 1, 16, '#5a6058'); p.rect(0, 2, 16, 1, '#5a6058'); p.rect(0, 13, 16, 1, '#5a6058'); for (let k = 0; k < 16; k++) p.set(k, k, '#4a5048'); return p; },
});
