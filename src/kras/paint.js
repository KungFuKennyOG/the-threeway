'use strict';
// ============================== Krasnovia interiors, painted textures ========================
// The stairwell of Superblock 14's point block (podezd 3): oil-paint green dado under whitewash, terracotta tiles,
// padded leatherette doors, a row of mailboxes, a lift, the communal kitchen; the roof's tar and gravel.
// Painted into the street atlas like everything else (no extra textures or draw calls).
Object.assign(PAINT, {
  stairWall() {   // one repeat = 2 m x 2.8 m: green oil paint to 1.5 m, a dark line, whitewash above, scuffs and graffiti
    const p = new Pix(32, 44); p.fill('#cfcabd'); p.speck('#bdb8aa', 30); p.speck('#dcd8cc', 20);
    p.rect(0, 20, 32, 24, '#3e6a5a'); p.speck('#4a7666', 26); p.speck('#2e5a4a', 18); p.rect(0, 20, 32, 1, '#24463a');
    for (let k = 0; k < 4; k++) { const x = Math.floor(prng() * 26), y = 6 + Math.floor(prng() * 10); p.rect(x, y, 2 + Math.floor(prng() * 5), 1, '#8a867a'); }
    if (prng() < 0.6) { const x = 2 + Math.floor(prng() * 20); p.text('ZENIT', x, 8, '#5a3a6a'); }
    p.rect(0, 42, 32, 2, '#2a2622'); return p;
  },
  stairFloor() { const p = new Pix(16, 16); p.fill('#7a4436'); for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x += 4) { p.rect(x, y, 3, 3, ['#8a4e3e', '#824a3a', '#7a4234'][(x + y) % 3]); } p.speck('#5a3226', 8); return p; },
  tread() {   // the cradle's deck plate
    const p = new Pix(16, 8); p.fill('#8a867e'); p.rect(0, 0, 16, 2, '#5a5650'); p.speck('#7a766e', 12); p.speck('#9a968e', 8); return p; },
  padDoor() {   // padded leatherette, diamond-tufted, a brass number and a peephole (one repeat = the door)
    const p = new Pix(16, 32); p.fill('#3a2a22'); p.rect(1, 1, 14, 31, '#6a3a2a');
    for (let y = 3; y < 30; y += 4) for (let x = 2 + ((y >> 2) & 1) * 2; x < 15; x += 4) p.set(x, y, '#3e2018');
    p.rect(6, 6, 4, 2, '#c9a04a'); p.set(8, 10, '#141014'); p.rect(12, 16, 2, 3, '#c9a04a'); return p;
  },
  liftDoor() { const p = new Pix(16, 32); p.fill('#5a5a3a'); p.rect(0, 0, 16, 2, '#3a3a24'); p.rect(7, 2, 2, 30, '#2a2a1a'); p.rect(2, 8, 4, 6, '#9a968a'); p.rect(10, 8, 4, 6, '#9a968a'); p.speck('#4a4a30', 10); return p; },
  liftCar() { const p = new Pix(16, 16); p.fill('#7a5a3a'); for (let y = 0; y < 16; y += 3) p.rect(0, y, 16, 1, '#6a4a2e'); p.rect(0, 0, 16, 1, '#c9a04a'); p.speck('#5a3e26', 10); return p; },
  mailboxes() { const p = new Pix(32, 16); p.fill('#4a5a6a'); for (let y = 1; y < 16; y += 5) for (let x = 1; x < 32; x += 5) { p.rect(x, y, 4, 4, '#6a7a8a'); p.rect(x + 1, y + 1, 2, 1, '#1e2228'); } return p; },
  radiator() { const p = new Pix(16, 8); p.fill('#b8b4a8'); for (let x = 0; x < 16; x += 2) p.rect(x, 0, 1, 8, '#8a867a'); return p; },
  kitchenTile() { const p = new Pix(16, 16); p.fill('#e6e2d6'); for (let k = 0; k < 16; k += 4) { p.rect(k, 0, 1, 16, '#b8b4a8'); p.rect(0, k, 16, 1, '#b8b4a8'); } p.speck('#c8c4b8', 6); return p; },
  stove() { const p = new Pix(16, 16); p.fill('#eeeae0'); for (const [x, y] of [[3, 3], [10, 3], [3, 10], [10, 10]]) { p.rect(x, y, 4, 4, '#1e1c1e'); p.rect(x + 1, y + 1, 2, 2, '#3a2a28'); } p.rect(0, 0, 16, 1, '#8a867a'); return p; },
  windowNight() {   // a stairwell window at night: frame, glazing bars, the city's lights beyond
    const p = new Pix(16, 24); p.fill('#e6e2d6'); p.rect(1, 1, 14, 22, '#14182a', EM);
    for (let k = 0; k < 12; k++) p.set(2 + Math.floor(prng() * 12), 8 + Math.floor(prng() * 14), ['#ffb060', '#ffd890', '#9ab8ff'][k % 3], EM);
    p.rect(7, 1, 2, 22, '#e6e2d6'); p.rect(1, 11, 14, 1, '#e6e2d6'); return p;
  },
  tarRoof() { const p = new Pix(32, 32); p.fill('#2e2a28'); p.speck('#3a3634', 60); p.speck('#24201e', 40); p.rect(0, 15, 32, 1, '#24201e'); return p; },
  liftSign() { const p = new Pix(32, 10); p.fill('#f2ede4', EM); p.rect(0, 0, 32, 1, '#b8231e', EM); p.rect(0, 9, 32, 1, '#b8231e', EM); p.text('LIFT', 4, 2, '#b8231e', EM); return p; },
  outOfOrder() { const p = new Pix(40, 10); p.fill('#f4ead0'); p.text('BROKEN', 2, 2, '#b8231e'); p.speck('#d8ccb0', 8); return p; },
  floorNum() { const p = new Pix(12, 10); p.fill('#1a3a7a', EM); p.text('7', 4, 2, '#f4f1ea', EM); return p; },
});
