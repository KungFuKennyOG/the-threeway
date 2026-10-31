'use strict';
// ============================== Act 1: Parade Square, painted textures ======================
// A May Day parade rehearsal at night: granite paving and the red route, faded banners, portrait floats (invented,
// generic heroic workers: nobody real), the reviewing stand, the brass band's drums, gym mats, floodlight masts, and
// the Ministry of Order's grey stepped front. Painted into the street atlas like everything outdoors.
// Every key starts with 'pr' so it can't collide with another level's paintings.
// a heroic worker's head and shoulders against a sunrise (32 x 40, inside a gilt frame). o: the look
function prHero(p, o) {
  const W = p.w, H = p.h;
  p.fill(o.bg1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = Math.atan2(H + 6 - y, x + 4); if (Math.floor(a * 9) % 2) p.set(x, y, o.bg2); }   // sunrise rays
  for (let y = 0; y < 13; y++) for (let x = 0; x < W; x++) if (Math.hypot(x - 25, y - 4) < 4) p.set(x, y, '#f2c14e');           // the sun, top right
  const cx = 16, cy = 18;
  for (let y = 28; y < H; y++) for (let x = 0; x < W; x++) if (Math.abs(x - cx) < 9 + (y - 28) * 0.9) p.set(x, y, x > cx + 3 ? o.coatDark : o.coat);   // shoulders
  p.rect(cx - 2, 31, 5, 4, o.shirt); p.set(cx - 3, 30, o.shirt); p.set(cx + 3, 30, o.shirt);                                       // open collar
  p.rect(cx - 3, 24, 7, 6, o.skinDark); p.rect(cx - 3, 24, 4, 5, o.skin);                                                         // neck
  for (let y = 8; y < 28; y++) for (let x = 0; x < W; x++) { const d = Math.hypot((x - cx) / 6.3, (y - cy) / 8.2); if (d < 1) p.set(x, y, x > cx + 2 || y > 25 ? o.skinDark : o.skin); }   // the head, lit from the left
  p.rect(cx - 5, 15, 4, 1, o.hair); p.rect(cx + 1, 15, 4, 1, o.hair);                                                               // brows
  p.rect(cx - 4, 17, 2, 1, '#1a1418'); p.rect(cx + 2, 17, 2, 1, '#1a1418'); p.set(cx - 3, 16, '#f4ead0'); p.set(cx + 3, 16, '#f4ead0');   // eyes, looking up to the future
  p.rect(cx, 18, 1, 3, o.skinDark); p.rect(cx - 1, 21, 3, 1, o.skinDark);                                                         // nose
  if (o.moustache) p.rect(cx - 3, 22, 7, 1, o.hair);
  p.rect(cx - 2, 23, 5, 1, '#7a3a2a');                                                                                            // a firm mouth
  p.rect(cx - 6, 18, 1, 3, o.skinDark); p.rect(cx + 6, 18, 1, 3, o.skinDark);                                                      // ears
  if (o.hat === 'cap') {          // a flat worker's cap
    p.rect(cx - 7, 9, 14, 4, o.hatCol); p.rect(cx - 6, 8, 11, 1, o.hatCol); p.rect(cx - 8, 13, 13, 1, o.hatDark); p.rect(cx - 7, 12, 14, 1, o.hatDark);
  } else if (o.hat === 'scarf') { // a kerchief, knotted under the chin
    for (let y = 7; y < 27; y++) for (let x = 0; x < W; x++) { const d = Math.hypot((x - cx) / 7.6, (y - cy) / 9.6); if (d < 1 && (d > 0.83 || y < 13)) p.set(x, y, y < 13 || x < cx ? o.hatCol : o.hatDark); }
    p.rect(cx - 1, 27, 3, 2, o.hatCol); p.set(cx - 4, 10, '#f4ead0'); p.set(cx + 1, 9, '#f4ead0'); p.set(cx + 4, 11, '#f4ead0');   // white polka dots
  } else if (o.hat === 'helmet') { // a miner's helmet with its lamp
    for (let y = 5; y < 14; y++) for (let x = 0; x < W; x++) if (Math.hypot((x - cx) / 7.4, (y - 13) / 7.5) < 1) p.set(x, y, x > cx + 2 ? o.hatDark : o.hatCol);
    p.rect(cx - 8, 13, 16, 1, o.hatDark); p.rect(cx - 2, 8, 4, 3, '#fff0b0'); p.rect(cx - 1, 9, 2, 1, '#ffffff');
  }
  // the gilt frame and a red ribbon across the foot
  p.rect(0, 0, W, 2, '#c9a04a'); p.rect(0, H - 2, W, 2, '#8a6a2a'); p.rect(0, 0, 2, H, '#c9a04a'); p.rect(W - 2, 0, 2, H, '#8a6a2a');
  p.rect(2, 2, W - 4, 1, '#5a4018'); p.rect(2, H - 7, W - 4, 5, '#a82a22'); p.rect(2, H - 7, W - 4, 1, '#f2c14e');
  for (let x = 5; x < W - 4; x += 4) p.set(x, H - 5, '#f2c14e');
  return p;
}
Object.assign(PAINT, {
  // ---- the square
  prGranite() {   // grey-pink granite slabs, 1 m x 2 m, staggered (one repeat = 4 m)
    const p = new Pix(32, 32); p.fill('#4c4648');
    for (let y = 0; y < 32; y += 8) for (let x = ((y >> 3) & 1) * 8 - 16; x < 32; x += 16) {
      p.rect(x + 1, y + 1, 15, 7, ['#76706f', '#6e6868', '#7a7472', '#706a6c'][Math.floor(prng() * 4)]);
    }
    p.speck('#8a8484', 40); p.speck('#5e585a', 30); p.speck('#86747a', 14);
    return p;
  },
  prRoute() {   // the parade route: polished red granite, edged in gilt (one repeat = the route's 4 m width x 4 m)
    const p = new Pix(16, 16); p.fill('#4a1c1a');
    for (let y = 0; y < 16; y += 4) for (let x = ((y >> 2) & 1) * 3 - 6; x < 16; x += 6) p.rect(x + 1, y + 1, 5, 3, ['#8a2e26', '#7e2a24', '#92342a'][Math.floor(prng() * 3)]);
    p.speck('#a8443a', 8);
    p.rect(0, 0, 1, 16, '#c9a04a'); p.rect(15, 0, 1, 16, '#c9a04a'); return p;
  },
  prMark() {   // painted rehearsal marks on the paving: where each column halts (white chalk T, a number)
    const p = new Pix(16, 16); p.fill('#000000', 0); p.rect(2, 2, 12, 2, '#e8e4dc'); p.rect(7, 4, 2, 8, '#e8e4dc'); p.speck('#000000', 6, 0); return p;
  },
  prBanner() {   // a faded red banner on a pole: the sodium-orange hoist band, the gold cogwheel, a gilt fringe (16 x 48)
    const p = new Pix(16, 48); p.fill('#9a2a24');
    for (let x = 1; x < 16; x += 4) p.rect(x, 6, 1, 38, '#86221e');
    p.rect(0, 0, 16, 6, '#d8823a'); p.rect(0, 6, 16, 1, '#5a1a16');
    for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) { const d = Math.hypot(x, y), a = Math.atan2(y, x); if ((d <= 4.4 && d >= 2.6) || (d > 4.4 && d < 6.2 && Math.cos(a * 8) > 0.3)) p.set(8 + x, 21 + y, '#d8b048'); }
    p.rect(7, 20, 2, 2, '#d8b048');
    p.rect(2, 32, 12, 1, '#d8b048'); p.rect(2, 34, 12, 1, '#d8b048');
    for (let x = 0; x < 16; x++) p.rect(x, 44, 1, x % 2 ? 4 : 3, '#c9a04a');
    p.rect(0, 47, 16, 1, '#000000', 0); for (let x = 0; x < 16; x += 2) p.set(x, 47, '#c9a04a');
    return p;
  },
  // ---- the portrait floats: three invented, generic heroic workers
  prHero1() { return prHero(new Pix(32, 40), { bg1: '#c83a24', bg2: '#e0602e', coat: '#2e3a4a', coatDark: '#1e2834', shirt: '#d8d0c0', skin: '#e0a882', skinDark: '#a8704e', hair: '#3a2a1e', hat: 'cap', hatCol: '#3a4250', hatDark: '#22262e' }); },
  prHero2() { return prHero(new Pix(32, 40), { bg1: '#b82a2a', bg2: '#d8582a', coat: '#4a5a3a', coatDark: '#323e26', shirt: '#e8dcc4', skin: '#e8b48c', skinDark: '#b07a56', hair: '#6a3a1e', hat: 'scarf', hatCol: '#c8281e', hatDark: '#8a1a16' }); },
  prHero3() { return prHero(new Pix(32, 40), { bg1: '#c0402a', bg2: '#e87a32', coat: '#3a3430', coatDark: '#24201e', shirt: '#8a96a8', skin: '#c8906a', skinDark: '#8e5e40', hair: '#2a2420', hat: 'helmet', hatCol: '#e8c040', hatDark: '#a8842a', moustache: true }); },
  prSkirt() {   // the float's skirt: red drapery in folds, a gilt band on top, a gold fringe (one repeat = 2 m x 1.3 m)
    const p = new Pix(32, 12); p.fill('#a82a22');
    for (let x = 0; x < 32; x += 4) { p.rect(x, 2, 1, 9, '#7a1c18'); p.rect(x + 2, 2, 1, 9, '#c0382c'); }
    p.rect(0, 0, 32, 2, '#c9a04a'); for (let x = 0; x < 32; x++) if (x % 3) p.rect(x, 10, 1, 2, '#e8b848'); else p.set(x, 10, '#e8b848');
    return p;
  },
  prBoards() { const p = new Pix(16, 16); p.fill('#4a3424'); for (let y = 0; y < 16; y += 4) p.rect(0, y, 16, 1, '#2e2018'); p.speck('#5a4230', 12); return p; },
  prPlywood() {   // the back of a portrait: battens and plywood, stencilled
    const p = new Pix(16, 16); p.fill('#6a5a44'); p.rect(0, 0, 16, 2, '#4a3e2e'); p.rect(0, 7, 16, 2, '#4a3e2e'); p.rect(7, 0, 2, 16, '#4a3e2e');
    p.text('7', 2, 9, '#2a221a'); p.speck('#7a6a52', 10); return p;
  },
  // ---- the reviewing stand
  prStand() {   // granite front, a red drape panel with the gold cog between pilasters (one repeat = 4 m x 2.6 m)
    const p = new Pix(32, 20); p.fill('#7a7470'); p.rect(0, 0, 32, 2, '#9a948e'); p.rect(0, 18, 32, 2, '#4a4644');
    p.rect(0, 2, 3, 16, '#8a847e'); p.rect(29, 2, 3, 16, '#8a847e');
    p.rect(6, 2, 20, 16, '#a82a22'); for (let x = 7; x < 26; x += 3) p.rect(x, 4, 1, 14, '#861e1a'); p.rect(6, 2, 20, 2, '#c9a04a');
    for (let a = 0; a < 10; a++) { const t = a / 10 * Math.PI * 2; p.set(16 + Math.round(Math.cos(t) * 4), 10 + Math.round(Math.sin(t) * 4), '#f2c14e'); }
    p.rect(15, 9, 2, 2, '#f2c14e'); p.speck('#6e6864', 10); return p;
  },
  prCanopy() {   // the canopy's edge: red cloth, gold scallops (one repeat = 2 m x 0.6 m)
    const p = new Pix(16, 8); p.fill('#b02a22'); p.rect(0, 0, 16, 1, '#f2c14e');
    for (let x = 0; x < 16; x++) { const d = Math.abs((x % 8) - 3.5); p.rect(x, 5, 1, d < 3 ? 3 : 2, '#b02a22'); if (d > 2.5) p.rect(x, 5, 1, 3, '#000000', 0); p.set(x, d < 3 ? 6 + (d < 1.5 ? 1 : 0) : 5, '#f2c14e'); }
    p.rect(0, 3, 16, 1, '#e8b848'); return p;
  },
  prStandSign() { const p = new Pix(92, 14); p.fill('#a82a22', EM); p.rect(0, 0, 92, 1, '#f2c14e', EM); p.rect(0, 13, 92, 1, '#f2c14e', EM); p.text('GLORY TO LABOR', 4, 4, '#f4ead0', EM); return p; },
  prStandSign2() { const p = new Pix(92, 14); p.fill('#a82a22', EM); p.rect(0, 0, 92, 1, '#f2c14e', EM); p.rect(0, 13, 92, 1, '#f2c14e', EM); p.text('1 MAY 1986', 16, 4, '#f4ead0', EM); return p; },
  // ---- the brass band, the gymnasts
  prDrum() {   // a parade drum's shell: red, white rims, gold cords in a zigzag (one repeat = around the drum)
    const p = new Pix(16, 8); p.fill('#b8231e'); p.rect(0, 0, 16, 1, '#e6dac0'); p.rect(0, 7, 16, 1, '#e6dac0');
    for (let x = 0; x < 16; x++) p.set(x, 1 + Math.abs((x % 8) - 4) * 1.4, '#f2c14e');
    return p;
  },
  prDrumHead() {   // a drum's skin, seen end on (round: the corners are cut out)
    const p = new Pix(16, 16); p.fill('#000000', 0);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.hypot(x - 7.5, y - 7.5); if (d < 8) p.set(x, y, d > 6.6 ? '#e6dac0' : '#d8ccb0'); }
    for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; p.set(7.5 + Math.cos(t) * 7.2, 7.5 + Math.sin(t) * 7.2, '#c9a04a'); }
    for (let a = 0; a < 10; a++) { const t = a / 10 * Math.PI * 2; p.set(7.5 + Math.cos(t) * 3.2, 7.5 + Math.sin(t) * 3.2, '#c9a04a'); }   // a gold cog
    p.rect(7, 7, 2, 2, '#c9a04a'); return p;
  },
  prTimpani() { const p = new Pix(16, 8); p.fill('#b06a34'); p.rect(0, 0, 16, 1, '#e8c890'); p.rect(0, 1, 16, 1, '#5a5650'); for (let x = 2; x < 16; x += 5) p.rect(x, 2, 1, 6, '#e8b070'); p.speck('#8a5028', 6); return p; },
  prBandSign() { const p = new Pix(100, 10); p.fill('#1a3a7a'); p.rect(0, 0, 100, 1, '#c9a04a'); p.rect(0, 9, 100, 1, '#c9a04a'); p.text('BRASS BAND OF WORKS 7', 1, 2, '#f4f1ea'); return p; },
  prSheet() { const p = new Pix(8, 8); p.fill('#e8e0c8'); for (let y = 1; y < 8; y += 2) p.rect(1, y, 6, 1, '#4a4440'); p.set(3, 2, '#141014'); p.set(5, 4, '#141014'); return p; },
  prMat() {   // a gym mat: blue vinyl, white edge, a seam (one repeat = one 2 m x 2 m mat)
    const p = new Pix(16, 16); p.fill('#2a4a8a'); p.rect(0, 0, 16, 1, '#d8dce4'); p.rect(0, 15, 16, 1, '#d8dce4'); p.rect(0, 0, 1, 16, '#d8dce4'); p.rect(15, 0, 1, 16, '#d8dce4');
    p.rect(1, 7, 14, 1, '#22407a'); p.speck('#3a5a9a', 10); return p;
  },
  prMatRed() { const p = new Pix(16, 16); p.fill('#a82a2a'); p.rect(0, 0, 16, 1, '#e8dcd4'); p.rect(0, 15, 16, 1, '#e8dcd4'); p.rect(0, 0, 1, 16, '#e8dcd4'); p.rect(15, 0, 1, 16, '#e8dcd4'); p.rect(1, 7, 14, 1, '#8a2020'); p.speck('#b83a36', 10); return p; },
  prLeather() { const p = new Pix(8, 8); p.fill('#6a3a22'); p.speck('#7a4a2e', 6); p.rect(0, 0, 8, 1, '#4a2616'); return p; },
  // ---- floodlights
  prLattice() {   // a floodlight mast's steel lattice (cut out between the members)
    const p = new Pix(8, 16); p.fill('#000000', 0);
    p.rect(0, 0, 1, 16, '#3a3c40'); p.rect(7, 0, 1, 16, '#3a3c40'); p.rect(0, 0, 8, 1, '#3a3c40'); p.rect(0, 8, 8, 1, '#3a3c40');
    for (let k = 0; k < 8; k++) { p.set(k, k, '#4a4c52'); p.set(7 - k, 8 + k, '#4a4c52'); }
    return p;
  },
  prFloodBank() {   // six lamps in a frame, blazing
    const p = new Pix(24, 16); p.fill('#2a2a2e');
    for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) { const d = Math.hypot(x - 3, y - 3); if (d < 3.4) p.set(1 + i * 8 + x, 1 + j * 8 + y, d < 2.2 ? '#fffaf0' : '#ffd890', EM); }
    return p;
  },
  // ---- the east side: empty bleachers for the parade, a slogan along the back
  prBleacher() { const p = new Pix(16, 8); p.fill('#7a766e'); p.rect(0, 0, 16, 3, '#6a4a2e'); p.rect(0, 3, 16, 1, '#3a2a1e'); p.speck('#6a665e', 6); return p; },
  prSlogan() {   // cream on faded red: PEACE · LABOR · UNITY
    const p = new Pix(136, 14); p.fill('#9a2a24'); p.rect(0, 0, 136, 1, '#d8b048'); p.rect(0, 13, 136, 1, '#d8b048');
    p.text('PEACE · LABOR · UNITY', 5, 4, '#efe2c4'); return p;
  },
  // ---- the Ministry of Order: grey stone, tall dark windows, bronze doors, and one lit window
  prMinistry() {   // one bay x one storey (4 m x 4 m): a pilaster, a tall window, all dark
    const p = new Pix(32, 32); p.fill('#62605e'); p.rect(0, 0, 4, 32, '#72706c'); p.rect(4, 0, 1, 32, '#4e4c4a'); p.rect(0, 31, 32, 1, '#4e4c4a');
    p.rect(11, 5, 12, 21, '#4a4846'); p.rect(12, 6, 10, 19, '#181a20'); p.rect(16, 6, 2, 19, '#3a3836'); p.rect(12, 14, 10, 1, '#3a3836');
    p.rect(10, 26, 14, 2, '#7a7874'); p.speck('#585654', 24); p.speck('#6c6a66', 16);
    return p;
  },
  prOrlovaWin() {   // the one lit window, high up: blinds half down, and someone standing in it, watching the square
    const p = new Pix(16, 24); p.fill('#4a4846'); p.rect(1, 1, 14, 22, '#ffd890', EM);
    for (let y = 2; y < 9; y += 2) p.rect(1, y, 14, 1, '#d8a050', EM);
    p.rect(6, 11, 4, 4, '#2a2024', EM); p.rect(4, 15, 8, 8, '#2a2024', EM); p.rect(5, 10, 6, 1, '#2a2024', EM);   // a figure in a peaked cap
    p.rect(7, 1, 2, 22, '#4a4846'); p.rect(1, 23, 14, 1, '#7a7874'); return p;
  },
  prMinistrySign() { const p = new Pix(108, 12); p.fill('#2a2a30'); p.rect(0, 0, 108, 1, '#c9a04a'); p.rect(0, 11, 108, 1, '#c9a04a'); p.text('MINISTRY OF ORDER', 3, 3, '#e0c060'); return p; },
  prBronze() {   // the ministry's bronze doors: shut
    const p = new Pix(16, 24); p.fill('#4a3420'); p.rect(1, 1, 6, 22, '#6a4a2a'); p.rect(9, 1, 6, 22, '#6a4a2a'); p.rect(7, 0, 2, 24, '#2a1e14');
    for (const x of [2, 10]) { p.rect(x + 1, 3, 3, 6, '#8a6234'); p.rect(x + 1, 13, 3, 7, '#8a6234'); }
    p.set(6, 12, '#d8b048'); p.set(9, 12, '#d8b048'); return p;
  },
});
