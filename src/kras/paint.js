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
// ---- the Palace of Sport: the cream bowl and its portico, the sports floor, the crowd in the stands, the gym
// pixel helpers for the Palace's murals and reliefs: a thick line, a disc, a gold cog, a little athlete in relief
function plpLine(p, x0, y0, x1, y1, col, t = 1, a = 255) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2) + 1;
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; p.rect(Math.round(x - (t - 1) / 2), Math.round(y - (t - 1) / 2), t, t, col, a); }
}
function plpDisc(p, cx, cy, r, col, a = 255) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if (Math.hypot(x - cx, y - cy) <= r) p.set(x, y, col, a); }
function plpCog(p, cx, cy, r, col, dark, a = 255) {   // a ring with eight teeth, hollow in the middle
  for (let y = Math.floor(cy - r * 1.3); y <= cy + r * 1.3; y++) for (let x = Math.floor(cx - r * 1.3); x <= cx + r * 1.3; x++) {
    const d = Math.hypot(x - cx, y - cy), an = Math.atan2(y - cy, x - cx);
    if (d <= r * 0.86 && d >= r * 0.5) p.set(x, y, d < r * 0.62 ? dark : col, a);
    else if (d > r * 0.86 && d <= r * 1.22 && Math.cos(an * 8) > 0.3) p.set(x, y, col, a);
  }
}
function plpFig(p, x, pose, m) {   // a 10 px athlete in cream relief, facing m (+1 right, -1 left), feet on row 10
  const c = '#eadcb8', s = '#7a6040', L = (x0, y0, x1, y1, t = 1) => plpLine(p, x + x0 * m, y0, x + x1 * m, y1, c, t), H = (hx, hy) => { p.rect(Math.round(x + hx * m - 0.5), hy, 2, 2, c); };
  if (pose === 'run') { H(1, 1); L(0.5, 3, 0, 6, 2); L(1, 4, 3, 5); L(0, 4, -2, 3); L(0, 7, 3, 8); L(3, 8, 3, 10); L(0, 7, -2, 9); L(-2, 9, -4, 8); }
  else if (pose === 'lift') { H(0, 3); L(-4, 1, 4, 1); p.rect(Math.round(x - 5), 0, 1, 3, s); p.rect(Math.round(x + 4), 0, 1, 3, s); L(-1, 4, -3, 1); L(1, 4, 3, 1); L(0, 5, 0, 7, 2); L(0, 8, -2, 10); L(0, 8, 2, 10); }
  else if (pose === 'leap') { H(0, 0); L(-2, 0, 0, 3); L(2, 0, 0, 3); L(0, 2, 0, 5, 2); L(0, 6, 5, 5); L(0, 6, -5, 7); }
  else if (pose === 'jav') { H(0, 1); plpLine(p, x - 4 * m, 5, x + 5 * m, 0, s, 1); L(0, 3, -2, 5); L(0, 3, 2, 2); L(0, 3, 0, 6, 2); L(0, 7, 2, 10); L(0, 7, -2, 10); }
  else { H(0, 1); plpLine(p, x + 2 * m, 0, x + 2 * m, 10, s, 1); p.rect(Math.round(x + (m > 0 ? 3 : -6)), 0, 4, 3, '#b8231e'); L(0, 3, 2, 3); L(0, 3, 0, 7, 2); L(0, 7, -1, 10); L(0, 7, 1, 10); }
  for (let y = 0; y < 11; y++) for (let xx = Math.max(1, x - 7); xx < Math.min(p.w - 1, x + 7); xx++) {   // a shadow edge on the right of every raised pixel
    const i = (y * p.w + xx) * 4, j = (y * p.w + xx + 1) * 4;
    if (p.d[i] === 0xea && p.d[i + 1] === 0xdc && !(p.d[j] === 0xea && p.d[j + 1] === 0xdc)) p.set(xx + 1, y, s);
  }
}
Object.assign(PAINT, {
  glassFront() { const p = new Pix(16, 16); p.fill('#1e2a34', EM); for (let x = 0; x < 16; x += 4) p.rect(x, 0, 1, 16, '#9aa2ae'); p.rect(0, 0, 16, 1, '#9aa2ae'); p.rect(0, 8, 16, 1, '#9aa2ae'); p.rect(2, 10, 9, 5, '#ffd8a0', EM); p.speck('#3a4a5a', 6, EM); return p; },   // East Station's glass
  palaceSign() { const p = new Pix(104, 14); p.fill('#e6dac0', EM); p.rect(0, 0, 104, 1, '#b8231e', EM); p.rect(0, 13, 104, 1, '#b8231e', EM); p.text('PALACE OF SPORT', 7, 4, '#b8231e', EM); return p; },
  sportFloor() { const p = new Pix(32, 32); p.fill('#b07a48'); for (let y = 0; y < 32; y += 2) p.rect(0, y, 32, 1, '#a06c3e'); for (let x = 0; x < 32; x += 8) p.rect(x, 0, 1, 32, '#946238'); p.rect(0, 15, 32, 1, '#e6dac0'); return p; },
  crowd() {   // rows of heads and coats in the stands, a few waving scarves (one repeat = 4 m of a 0.5 m tier)
    const p = new Pix(32, 8); p.fill('#2a2428');
    for (let x = 1; x < 32; x += 3) { const c = ['#4a3a3a', '#3a4250', '#5a4a3a', '#b8231e', '#3e4a3a', '#6a5a4a'][Math.floor(prng() * 6)]; p.rect(x, 4, 2, 4, c); p.rect(x, 2, 2, 2, ['#e0b08c', '#c8987a', '#d8a888'][Math.floor(prng() * 3)]); if (prng() < 0.25) p.rect(x, 0, 2, 2, prng() < 0.5 ? '#b8231e' : '#f2c14e'); }
    return p;
  },
  mat() { const p = new Pix(16, 16); p.fill('#2a4a8a'); p.rect(0, 0, 16, 1, '#1a3a6a'); p.rect(0, 0, 1, 16, '#1a3a6a'); p.speck('#3a5a9a', 10); return p; },
  tree() { const p = new Pix(16, 16); p.fill('#2e3a24'); p.speck('#3e4a2e', 40); p.speck('#22301c', 30); p.speck('#5a6a3a', 8); return p; },
  bark() { const p = new Pix(8, 16); p.fill('#4a3e32'); for (let y = 0; y < 16; y += 3) p.rect(0, y, 8, 1, '#3a3026'); return p; },
  trainSide() {   // a green Krasnovian electric train: cream stripe, lit windows (one repeat = one 18 m car)
    const p = new Pix(64, 16); p.fill('#2e5a3a'); p.rect(0, 9, 64, 2, '#e6dac0'); p.rect(0, 15, 64, 1, '#1a2a1e');
    for (let x = 3; x < 60; x += 5) { const lit = prng() < 0.8; p.rect(x, 2, 4, 6, lit ? '#ffe0a0' : '#1e2a24', lit ? EM : 255); }
    p.rect(0, 0, 1, 16, '#14201a'); p.rect(63, 0, 1, 16, '#14201a'); return p;
  },
  crossSign() { const p = new Pix(16, 16); p.fill('#000000', 0); for (let k = 0; k < 16; k++) { p.rect(k, k, 2, 2, k % 4 < 2 ? '#b8231e' : '#f2ede4'); p.rect(15 - k, k, 2, 2, k % 4 < 2 ? '#b8231e' : '#f2ede4'); } return p; },
  trainFront() {   // the cab end: two windscreens, a headlight, a red nose stripe (one repeat = the 3.2 m x 4 m end)
    const p = new Pix(16, 20); p.fill('#2e5a3a'); p.rect(0, 13, 16, 2, '#e6dac0'); p.rect(0, 16, 16, 2, '#b8231e');
    p.rect(1, 3, 6, 6, '#a8c8d8', EM); p.rect(9, 3, 6, 6, '#a8c8d8', EM); p.rect(7, 2, 2, 8, '#1a2a1e');
    p.rect(6, 11, 4, 2, '#fff4d0', EM); p.rect(1, 18, 3, 1, '#ffd890', EM); p.rect(12, 18, 3, 1, '#ffd890', EM); return p;
  },
  paving() { const p = new Pix(32, 32); p.fill('#6a6660'); for (let y = 0; y < 32; y += 8) for (let x = (y / 8 % 2) * 8; x < 32; x += 16) p.rect(x, y, 8, 8, '#625e58'); for (let k = 0; k < 32; k += 8) { p.rect(0, k, 32, 1, '#4a4640'); p.rect(k, 0, 1, 32, '#4a4640'); } p.speck('#7a766e', 24); p.speck('#56524c', 18); return p; },
  creamWall() { const p = new Pix(16, 16); p.fill('#d8d2c0'); p.speck('#ccc6b4', 14); p.speck('#e2dccc', 8); return p; },
  sportWall() { const p = new Pix(16, 32); p.fill('#d8d2c0'); p.speck('#ccc6b4', 16); p.rect(0, 18, 16, 14, '#3a5a8a'); p.rect(0, 18, 16, 1, '#b8231e'); p.speck('#466698', 12); return p; },   // one repeat = 2 m x 4 m: cream over a blue dado
  arenaBoard() {   // the boards round the floor: slogans, red and cream (one repeat = 4 m x 1.1 m)
    const p = new Pix(32, 9); const w = ['SPORT', 'HEALTH', 'LABOUR', 'GLORY', 'VOSTOK'][Math.floor(prng() * 5)], red = prng() < 0.5;
    p.fill(red ? '#b8231e' : '#e6dac0'); p.rect(0, 0, 32, 1, '#2a2226'); p.rect(0, 8, 32, 1, '#2a2226');
    p.text(w, Math.floor((32 - w.length * 6) / 2) + 1, 2, red ? '#f4ead0' : '#b8231e'); return p;
  },
  scoreboard() {   // amber bulbs on black: the Bear against the guest
    const p = new Pix(48, 24); p.fill('#141214', EM); p.rect(0, 0, 48, 1, '#b8231e', EM); p.rect(0, 23, 48, 1, '#b8231e', EM); p.rect(39, 1, 1, 22, '#3a2a2a', EM);
    p.text('VOLKOV', 2, 3, '#ffb040', EM); p.text('GUEST', 2, 14, '#ffb040', EM); p.text('9', 42, 3, '#ff6040', EM); p.text('0', 42, 14, '#ff6040', EM); return p;
  },
  ticketWin() { const p = new Pix(16, 16); p.fill('#5a4a3a'); p.rect(2, 3, 12, 8, '#ffe0a0', EM); p.rect(2, 7, 12, 1, '#8a7a6a'); p.rect(4, 12, 8, 2, '#2a2226'); p.rect(5, 0, 6, 2, '#b8231e'); return p; },
  trophy() { const p = new Pix(16, 16); p.fill('#1e2a34', EM); p.rect(0, 0, 16, 1, '#8a6a3a'); p.rect(0, 8, 16, 1, '#8a6a3a'); p.rect(0, 15, 16, 1, '#8a6a3a');
    for (const [x, y] of [[2, 3], [7, 2], [12, 4], [3, 10], [9, 10]]) { p.rect(x, y, 3, 3, '#f2c14e', EM); p.rect(x + 1, y + 3, 1, 2, '#c9a04a', EM); } return p; },
  // ---- the gym: the national training hall at night
  gymMural() {   // over the tunnel door: a gymnast mid-leap, her head in a gold cog, red rays on night-blue tiles (12 m x 3 m)
    const p = new Pix(96, 26), cx = 48, cy = 8;
    for (let y = 0; y < 26; y++) for (let x = 0; x < 96; x++) {
      const a = Math.atan2(y - cy, x - cx), ray = Math.floor((a + 4) * 12 / Math.PI) & 1, t = (x + y) & 1;
      p.set(x, y, ray ? (t ? '#8e2422' : '#842020') : (t ? '#1c2a4a' : '#22325a'));
    }
    plpCog(p, cx, cy, 6.4, '#f2c14e', '#9a7420'); plpDisc(p, cx, cy, 3.4, '#ffd890');
    const skin = '#e8b890', suit = '#f4ead0';
    plpLine(p, 47, 9, 42, 3, skin, 2); plpLine(p, 50, 9, 55, 3, skin, 2);                  // arms up in a V
    plpLine(p, 49, 13, 64, 11, skin, 2); plpLine(p, 64, 11, 67, 11, skin, 1);              // the front leg, toe pointed
    plpLine(p, 47, 13, 32, 15, skin, 2); plpLine(p, 32, 15, 29, 16, skin, 1);              // the back leg
    plpLine(p, 49, 8, 48, 13, suit, 3); p.rect(47, 12, 4, 2, suit); p.rect(48, 9, 2, 1, '#b8231e');   // white leotard, red trim
    plpDisc(p, 48.5, 6, 1.7, skin); p.rect(47, 4, 4, 1, '#3a2418'); p.set(46, 5, '#3a2418');  // head, hair
    for (let x = 55; x < 80; x++) p.set(x, Math.round(3 + 2.6 * Math.sin((x - 55) / 3.2) + (x - 55) * 0.12), '#ffcf40');   // her ribbon
    p.rect(0, 18, 96, 8, '#9a1c18'); p.rect(0, 18, 96, 1, '#f2c14e'); p.rect(0, 25, 96, 1, '#c9a04a');
    p.text('GLORY TO SPORT', 7, 19, '#f2c14e');
    return p;
  },
  gymBars() {   // wall bars, cut out: the wall shows between the rungs (one repeat = a 1 m x 1 m section)
    const p = new Pix(16, 32);
    for (let y = 0; y < 32; y += 8) { p.rect(0, y, 16, 1, '#e6c088'); p.rect(0, y + 1, 16, 1, '#a07a48'); }
    p.rect(0, 0, 2, 32, '#7a5230'); p.rect(14, 0, 2, 32, '#6a4628'); p.rect(0, 0, 1, 32, '#9a6a3a');
    return p;
  },
  gymRope() { const p = new Pix(4, 8); p.fill('#b89a62'); for (let y = 0; y < 8; y++) p.set((y >> 1) % 4, y, '#7a6038'); return p; },
  gymRing() { const p = new Pix(8, 8); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const d = Math.hypot(x - 3.5, y - 3.5); if (d > 2.2 && d < 3.9) p.set(x, y, y < 3 ? '#9a6a3a' : '#5a3a20'); } return p; },
  gymPodSide() { const p = new Pix(8, 8); p.fill('#e8e2d2'); p.rect(0, 0, 8, 2, '#b8231e'); p.rect(0, 7, 8, 1, '#a8a294'); return p; },
  gymPodNum() { const p = new Pix(24, 10); p.fill('#e8e2d2'); for (let k = 0; k < 3; k++) { p.text(String(k + 1), k * 8 + 2, 1, '#b8231e'); p.rect(k * 8, 0, 1, 10, '#c8c2b2'); } return p; },
  gymChamps() {   // four champions' banners: a medal, a name, a year (invented), swallow-tailed (cut out)
    const p = new Pix(96, 36), who = [['ZOYA', '1964'], ['LEV', '1972'], ['NINA', '1976'], ['ILYA', '1980']];
    who.forEach(([n, y], k) => {
      const x0 = k * 24; p.rect(x0, 1, 24, 35, '#b8231e'); p.rect(x0 + 1, 1, 1, 35, '#f2c14e'); p.rect(x0 + 22, 1, 1, 35, '#f2c14e'); p.rect(x0, 0, 24, 1, '#c9a04a');
      plpLine(p, x0 + 9, 1, x0 + 12, 6, '#2a4a8a', 2); plpLine(p, x0 + 15, 1, x0 + 12, 6, '#2a4a8a', 2); plpDisc(p, x0 + 11.5, 8, 3.2, '#f2c14e'); plpDisc(p, x0 + 11.5, 8, 1.6, '#c9a04a');
      p.text(n, x0 + Math.floor((24 - n.length * 6) / 2) + 1, 14, '#f4ead0'); p.text(y, x0 + 1, 23, '#f2c14e');
      for (let yy = 29; yy < 36; yy++) for (let xx = 0; xx < 24; xx++) if (Math.abs(xx - 11.5) < (yy - 28) * 1.6) p.set(x0 + xx, yy, '#000000', 0);
    });
    return p;
  },
  gymSlogan() { const p = new Pix(156, 11); p.fill('#9a1c18'); p.rect(0, 0, 156, 1, '#f2c14e'); p.rect(0, 10, 156, 1, '#f2c14e'); p.text('GLORY TO KRASNOVIAN SPORT', 4, 2, '#f4ead0'); return p; },
  coachWin() {   // the coach's office, up on the mezzanine: lit, the blind half down, a man in a cap watching
    const p = new Pix(32, 20); p.fill('#3a3a40');
    p.rect(1, 1, 30, 17, '#f0c070', EM); for (let y = 1; y < 8; y += 2) p.rect(1, y, 30, 1, '#c89848', EM);
    p.rect(15, 1, 2, 17, '#3a3a40');
    plpDisc(p, 9, 8, 2.6, '#141016', EM); p.rect(5, 5, 8, 2, '#141016', EM); p.rect(4, 7, 4, 1, '#141016', EM);   // head, the cap's brim
    for (let y = 11; y < 18; y++) p.rect(9 - (y - 9), y, (y - 9) * 2 + 1, 1, '#141016', EM);                    // shoulders
    p.rect(23, 10, 5, 2, '#2a2420', EM); p.rect(25, 12, 1, 4, '#2a2420', EM); p.rect(22, 16, 8, 1, '#2a2420', EM);   // a desk lamp
    p.rect(0, 18, 32, 2, '#d8d2c0'); return p;
  },
  gymChalk() { const p = new Pix(16, 16); for (let k = 0; k < 9; k++) plpDisc(p, 2 + prng() * 12, 2 + prng() * 12, 0.8 + prng() * 2.2, prng() < 0.5 ? '#f4f2ea' : '#d8d6ce'); return p; },
  gymLane() { const p = new Pix(8, 8); p.fill('#a8302a'); p.rect(0, 0, 8, 1, '#efe8dc'); p.rect(0, 7, 8, 1, '#efe8dc'); p.speck('#98282a', 6); return p; },
  gymLeather() { const p = new Pix(8, 8); p.fill('#6a3a22'); p.rect(0, 1, 8, 1, '#8a5a3a'); p.rect(0, 6, 8, 1, '#4a2614'); return p; },
  gymSpring() { const p = new Pix(8, 8); p.fill('#c8a06a'); p.rect(0, 0, 8, 1, '#e8e2d2'); p.rect(0, 7, 8, 1, '#b8231e'); p.rect(3, 0, 1, 8, '#a8804a'); return p; },
  // ---- the bowl
  domeRib() { const p = new Pix(16, 16); p.fill('#26242a'); p.rect(0, 0, 2, 16, '#4a4650'); p.rect(2, 0, 1, 16, '#18161c'); p.speck('#2e2c34', 10); return p; },
  // ---- outside: a broad, low cream bowl of two storeys, pilasters, a cornice, an attic, the columned portico
  plFacade() {   // one bay between two pilasters (3.5 m x 9.6 m): a tall band of warm glass on each storey, cream plaster between
    const p = new Pix(12, 32); p.fill('#d6c08e'); p.speck('#cbb482', 10);
    const glass = (y0, y1) => {
      p.rect(1, y0 - 1, 10, y1 - y0 + 2, '#efe6d2');
      for (let y = y0; y < y1; y++) p.rect(2, y, 8, 1, y < y0 + 2 ? '#ffe2a8' : y > y1 - 3 ? '#e8a050' : '#ffc870', EM);
      p.rect(5, y0, 2, y1 - y0, '#6a4e30', EM); for (let y = y0 + 3; y < y1; y += 4) p.rect(2, y, 8, 1, '#8a6238', EM);
    };
    glass(2, 14); p.rect(0, 15, 12, 2, '#efe6d2'); p.rect(0, 17, 12, 1, '#a8946a'); glass(19, 30);
    p.rect(0, 31, 12, 1, '#b8a478'); return p;
  },
  plPilaster() {   // a square pilaster, one storey per repeat (4.8 m): a white capital on top, a base at the foot
    const p = new Pix(8, 16); p.fill('#e4d4aa'); p.rect(0, 0, 1, 16, '#f2e6c8'); p.rect(7, 0, 1, 16, '#b8a47a');
    p.rect(0, 0, 8, 2, '#f4ecdc'); p.rect(0, 2, 8, 1, '#a89470'); p.rect(0, 15, 8, 1, '#c8b48a'); return p;
  },
  plCornice() { const p = new Pix(16, 8); p.fill('#ece4d0'); p.rect(0, 0, 16, 1, '#faf4e6'); for (let x = 0; x < 16; x += 2) p.rect(x, 5, 1, 2, '#b8ac94'); p.rect(0, 7, 16, 1, '#8a7e66'); return p; },
  plAttic() { const p = new Pix(16, 8); p.fill('#d8c494'); p.rect(0, 0, 16, 1, '#f4ecdc'); p.rect(2, 2, 12, 4, '#cdb886'); p.rect(0, 7, 16, 1, '#b8a478'); return p; },
  plRoofM() { const p = new Pix(16, 16); p.fill('#5a5e66'); for (let x = 0; x < 16; x += 4) p.rect(x, 0, 1, 16, '#767a84'); p.speck('#50545c', 10); return p; },
  plLetters() {   // P A L C E O F S R T: red letters, gilt-edged, lit (cut out between them)
    const p = new Pix(70, 9);
    [...'PALCEOFSRT'].forEach((ch, k) => {
      const g = GLYPHS[ch], x0 = k * 7 + 1;
      for (let i = 0; i < 35; i++) if (g[i] === '1') for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) p.set(x0 + (i % 5) + dx, 1 + Math.floor(i / 5) + dy, '#f2c14e', EM);
      for (let i = 0; i < 35; i++) if (g[i] === '1') p.set(x0 + (i % 5), 1 + Math.floor(i / 5), '#e8352b', EM);
    });
    return p;
  },
  plFrieze() {   // the relief over the portico: a procession of athletes (invented) toward a gold cog
    const p = new Pix(128, 12); p.fill('#a88a5a'); p.rect(0, 0, 128, 1, '#efe6d2'); p.rect(0, 11, 128, 1, '#efe6d2'); p.rect(0, 10, 128, 1, '#8a6e44');
    plpCog(p, 64, 5.5, 4.2, '#f2c14e', '#9a7420'); plpDisc(p, 64, 5.5, 1.6, '#ffd890');
    const poses = ['flag', 'run', 'lift', 'leap', 'jav', 'run'];
    [5, 15, 25, 35, 45, 54].forEach((x, k) => { plpFig(p, x, poses[k], 1); plpFig(p, 127 - x, poses[k], -1); });
    return p;
  },
  plDoors() {   // the main doors: bronze frames and push bars, warm glass with the foyer's light behind (one repeat = a 2 m pair)
    const p = new Pix(16, 22); p.fill('#4a3220');
    for (const x of [1, 9]) { p.rect(x, 2, 6, 19, '#d08a40', EM); p.rect(x, 2, 6, 4, '#f0b868', EM); p.rect(x, 14, 6, 7, '#b87034', EM); p.rect(x, 11, 6, 1, '#c9a04a'); p.rect(x + 1, 12, 4, 1, '#7a5228'); }
    p.rect(7, 2, 2, 20, '#2a1a10'); p.rect(0, 0, 16, 2, '#c9a04a'); p.rect(0, 21, 16, 1, '#2a1a10'); return p;
  },
  plColumn() { const p = new Pix(8, 16); p.fill('#eadfc4'); for (let x = 1; x < 8; x += 3) p.rect(x, 0, 1, 16, '#c8b88e'); p.rect(0, 0, 8, 1, '#f8f0e0'); return p; },
  plStepEdge() { const p = new Pix(16, 4); p.fill('#8e8880'); p.rect(0, 0, 16, 1, '#aaa49a'); p.rect(0, 3, 16, 1, '#3e3a36'); p.speck('#7e7870', 6); return p; },
  plLattice() {   // a floodlight mast's steel lattice (cut out): legs, rungs and X bracing, two 3 m bays per repeat
    const p = new Pix(8, 32), c = '#5a5e66';
    p.rect(0, 0, 1, 32, c); p.rect(7, 0, 1, 32, c); p.rect(0, 0, 8, 1, c); p.rect(0, 16, 8, 1, c);
    for (const y0 of [0, 16]) for (let k = 0; k < 16; k++) { p.set(Math.round(k * 7 / 15), y0 + k, '#4a4e56'); p.set(7 - Math.round(k * 7 / 15), y0 + k, '#4a4e56'); }
    return p;
  },
  plLatticeTall() {   // the stadium masts' lattice (cut out): four 3 m bays per repeat, the legs heavier
    const p = new Pix(8, 64), c = '#5a5e66';
    p.rect(0, 0, 1, 64, c); p.rect(7, 0, 1, 64, c); for (let y = 0; y < 64; y += 16) { p.rect(0, y, 8, 1, c); for (let k = 0; k < 16; k++) { p.set(Math.round(k * 7 / 15), y + k, '#4a4e56'); p.set(7 - Math.round(k * 7 / 15), y + k, '#4a4e56'); } }
    return p;
  },
  plFloodBank() { const p = new Pix(16, 12); p.fill('#2a2c30'); for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) { plpDisc(p, 2 + i * 4, 2 + j * 4, 1.5, '#fff4d8', EM); p.set(2 + i * 4, 2 + j * 4, '#ffffff', EM); } return p; },
  // ---- the stadium from outside: a light bank's back (its frame, light spilling round the lamp hoods), the floodlight
  // haze over the rim and the shafts falling into the bowl (screen-door dither: dense at the source, thinning out), the
  // stands and the pitch seen from above in floodlight, and the marquee boards facing the boulevard
  plGates() {   // eight bays of the ground storey (A to H): a lit sector letter over a gate to the stands, the turnstiles inside
    const p = new Pix(128, 20);
    for (let k = 0; k < 8; k++) {
      const x = k * 16; p.rect(x, 0, 16, 20, '#d6c08e'); p.speck('#cbb482', 4);
      p.rect(x + 4, 0, 8, 9, '#f2c14e', EM); p.rect(x + 5, 1, 6, 7, '#b8231e', EM); p.text('ABCDEFGH'[k], x + 6, 1, '#fff4e0', EM);
      p.rect(x + 2, 10, 12, 10, '#efe6d2'); p.rect(x + 3, 11, 10, 9, '#3a2a20');
      p.rect(x + 3, 11, 10, 4, '#e8a050', EM); p.rect(x + 3, 11, 10, 1, '#ffd890', EM);
      for (let t = 0; t < 3; t++) { p.rect(x + 4 + t * 3, 15, 2, 4, '#8a8478'); p.set(x + 4 + t * 3, 15, '#c8c0b0'); }
      p.rect(x + 3, 19, 10, 1, '#5a4636');
    }
    return p;
  },
  plBrimUnder() { const p = new Pix(16, 8); p.fill('#3a3632'); p.rect(0, 0, 16, 1, '#2a2622'); for (const x of [3, 11]) { p.rect(x, 3, 2, 2, '#fff0c8', EM); p.set(x, 2, '#ffd890', EM); } return p; },   // one repeat = one bay
  plFloodBack() {
    const p = new Pix(16, 12); p.fill('#24262a'); p.rect(0, 0, 16, 1, '#fff0c8', EM); p.rect(0, 11, 16, 1, '#3a3c42');
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) { p.rect(1 + i * 4, 1 + j * 4, 3, 3, '#3a3c42'); p.set(2 + i * 4, 1 + j * 4, '#ffe6b0', EM); }
    p.rect(0, 0, 1, 12, '#ffe6b0', EM); p.rect(15, 0, 1, 12, '#ffe6b0', EM); return p;
  },
  plHaze() {   // the floodlight glow over the rim: bottom row dense, thinning to nothing at the top (ordered dither)
    const p = new Pix(8, 16), B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { const d = Math.pow((y + 1) / 16, 1.6) * 0.9; if (B[(x & 3) + (y & 3) * 4] / 16 < d) p.set(x, y, y > 11 ? '#ffe8b8' : '#ffd890', EM); }
    return p;
  },
  plHalo() {   // the bloom round a floodlight bank: dense in the middle, thinning to nothing at the edge (ordered dither)
    const p = new Pix(16, 16), B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const r = Math.hypot((x - 7.5) / 8, (y - 7.5) / 8), d = Math.max(0, 1 - r) * 0.75; if (B[(x & 3) + (y & 3) * 4] / 16 < d) p.set(x, y, r < 0.45 ? '#fff4dc' : '#ffe0a8', EM); }
    return p;
  },
  plPitchTop() { const p = new Pix(16, 16); p.fill('#e8cc98', EM); p.speck('#f4dcb0', 30, EM); p.speck('#d8b880', 14, EM); return p; },   // the floor under the floods, from far above
  plStandsBack() {   // the stands' concrete backs: rakers, and a row of lit stairwell windows (one repeat = one bay)
    const p = new Pix(16, 16); p.fill('#8e897e'); p.speck('#7e7a70', 10); for (let x = 0; x < 16; x += 8) p.rect(x, 0, 2, 16, '#6a665e');
    for (let x = 3; x < 16; x += 4) if (x % 8 !== 0 && x % 8 !== 1) p.rect(x, 9, 2, 3, '#ffcf86', EM);
    p.rect(0, 0, 16, 1, '#b0aa9c'); return p;
  },
  plStandsTop() {   // the stands from far above, full and floodlit (self-lit: the floods are on): rows of coats and faces, scarves
    const p = new Pix(16, 8); p.fill('#9a785c', EM);
    for (let y = 0; y < 8; y += 2) { p.rect(0, y, 16, 1, '#d0ac84', EM); for (let x = (y >> 1) & 1; x < 16; x += 2) p.set(x, y + 1, ['#6a5450', '#5a6070', '#d8483a', '#f0c098', '#8a7454'][Math.floor(prng() * 5)], EM); }
    return p;
  },
  plMarquee() {   // two boards (top and bottom half): red, gilt-edged, lit lettering
    const p = new Pix(96, 56);
    for (const [y0, big, small] of [[0, 'TONIGHT', 'VOLKOV  VS  GUEST'], [28, 'SOLD OUT', 'ALL STANDS FULL']]) {
      p.rect(0, y0, 96, 28, '#f2c14e', EM); p.rect(1, y0 + 1, 94, 26, '#8a1612', EM);
      p.bigText(big, Math.round((96 - (big.length * 12 - 2)) / 2), y0 + 3, '#fff0c0', EM, 2);
      p.text(small, Math.round((96 - textW(small)) / 2), y0 + 19, '#f2c14e', EM);
    }
    return p;
  },
});
// ---- East Station, on Station Square north of the level crossing (src/kras/palace.js)
Object.assign(PAINT, {
  stationSign() { const p = new Pix(84, 13); p.fill('#1e3a6a', EM); p.rect(0, 0, 84, 1, '#f2c14e', EM); p.rect(0, 12, 84, 1, '#f2c14e', EM); p.text('EAST STATION', 6, 3, '#f2ede4', EM); return p; },
});
