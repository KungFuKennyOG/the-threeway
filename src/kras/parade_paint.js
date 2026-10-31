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
  if (o.wip) {   // not finished: the right half is still primed canvas with the charcoal squaring-up grid and the outline
    for (let y = 3; y < H - 7; y++) for (let x = cx + 2; x < W - 2; x++) {
      const dh = Math.hypot((x - cx) / 6.3, (y - cy) / 8.2), sw = 9 + (y - 28) * 0.9, hel = Math.hypot((x - cx) / 7.4, (y - 13) / 7.5);
      const edge = (Math.abs(dh - 1) < 0.1 && y > 12) || (y >= 28 && Math.abs(x - cx - sw) < 0.7) || (y < 14 && Math.abs(hel - 1) < 0.09) || (y === 13 && x < cx + 8);
      p.set(x, y, edge ? '#3a3430' : (x % 4 === 0 || y % 4 === 0) ? '#c4b89c' : '#e8dcc0');
    }
    for (let y = 3; y < H - 7; y++) if (prng() < 0.6) p.set(cx + 2, y, prng() < 0.5 ? o.coat : o.skin);   // where the brush stopped
    p.rect(cx + 6, 20, 1, 1, '#3a3430'); p.rect(cx + 2, 17, 2, 1, '#3a3430');                              // an eye, sketched in
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
    p.rect(0, 0, 1, 16, '#e8b848', EM); p.rect(15, 0, 1, 16, '#e8b848', EM);   // gilt edges, lit: two gold lines from the Palace's doors to the Tower's
    for (let y = 1; y < 16; y += 4) { p.set(1, y, '#fff2c0', EM); p.set(14, y, '#fff2c0', EM); }   // inset lamps in the edge, every metre
    return p;
  },
  prMark() {   // chalk halts for the columns down the route: a T and its number, 1 to 5 (each 16 px of the strip, picked by v)
    const p = new Pix(16, 80); p.fill('#000000', 0);
    for (let k = 0; k < 5; k++) { const y = k * 16; p.rect(2, y + 2, 12, 2, '#e8e4dc'); p.rect(7, y + 4, 2, 4, '#e8e4dc'); p.text(String(k + 1), 6, y + 8, '#e8e4dc'); }
    p.speck('#000000', 30, 0); return p;
  },
  prChalk() {   // the honour guard's formation, chalked on the granite: seven files, eight ranks numbered, a cross per man (8 m x 12 m)
    const p = new Pix(64, 96); p.fill('#000000', 0); const C = '#e4e0d6';
    for (let r = 0; r < 8; r++) { const y = 8 + r * 11; p.text(String(r + 1), 1, y - 3, C); for (let c = 0; c < 7; c++) { const x = 13 + c * 8; p.rect(x - 1, y, 3, 1, C); p.rect(x, y - 1, 1, 3, C); } }
    for (let x = 9; x < 63; x += 3) { p.set(x, 1, C); p.set(x, 94, C); } for (let y = 1; y < 95; y += 3) { p.set(9, y, C); p.set(62, y, C); }   // the block, dashed
    p.rect(30, 88, 9, 1, C); p.set(31, 87, C); p.set(31, 89, C);   // an arrow: this way
    p.speck('#000000', 160, 0); return p;
  },
  prCableRamp() {   // a rubber cable ramp across the route: yellow and black (4 m x 0.5 m)
    const p = new Pix(32, 4); p.fill('#1e1c1e'); for (let x = 0; x < 32; x += 4) p.rect(x, 1, 2, 2, '#d8b030'); return p;
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
  prHero3() { return prHero(new Pix(32, 40), { bg1: '#c0402a', bg2: '#e87a32', coat: '#3a3430', coatDark: '#24201e', shirt: '#8a96a8', skin: '#c8906a', skinDark: '#8e5e40', hair: '#2a2420', hat: 'helmet', hatCol: '#e8c040', hatDark: '#a8842a', moustache: true, wip: true }); },   // the miner: half painted
  prChairBig() {   // the Chairman (invented: the man over the Tower's typing pool), 8 m x 11 m, going up on the Ministry for the 1st
    const p = new Pix(32, 44), cx = 16; p.fill('#9a1c18');
    for (let y = 0; y < 44; y++) for (let x = 0; x < 32; x++) { const a = Math.atan2(y - 50, x - 16); if (Math.floor(a * 14) % 2) p.set(x, y, '#b02a20'); }   // rays from below
    for (let y = 30; y < 44; y++) for (let x = 0; x < 32; x++) if (Math.abs(x - cx) < 10 + (y - 30) * 0.7) p.set(x, y, x > cx + 3 ? '#1e222c' : '#2a2e3a');   // the suit
    for (let y = 30; y < 40; y++) { const k = Math.floor((y - 30) * 0.5); p.rect(cx - 3 + k, y, 1, 1, '#14161e'); p.rect(cx + 3 - k, y, 1, 1, '#14161e'); }   // lapels
    p.rect(cx - 2, 30, 5, 6, '#e6e2d6'); p.rect(cx - 1, 31, 3, 9, '#8a1c18'); p.rect(cx, 32, 1, 7, '#a82a22');                       // shirt, the tie
    p.rect(cx - 7, 34, 2, 2, '#f2c14e'); p.set(cx - 6, 34, '#fff0b0');                                                              // the gold cog pin
    for (const [k, c] of [[0, '#e8352b'], [1, '#2a5a9a'], [2, '#f2c14e']]) p.rect(cx + 5 + k * 2, 35, 2, 1, c);                    // ribbons
    p.rect(cx - 4, 26, 9, 5, '#b07a5e'); p.rect(cx - 4, 26, 5, 4, '#c8906e');                                                        // the neck, heavy
    for (let y = 9; y < 31; y++) for (let x = 0; x < 32; x++) { const d = Math.hypot((x - cx) / 7.4, (y - 19) / 9.6); if (d < 1) p.set(x, y, x > cx + 2 || y > 27 ? '#b07a5e' : '#d8a888'); }   // a broad face
    for (let y = 5; y < 15; y++) for (let x = 0; x < 32; x++) { const d = Math.hypot((x - cx) / 8, (y - 13) / 7.6); if (d < 1 && (y < 11 || Math.abs(x - cx) > 6)) p.set(x, y, x > cx + 3 ? '#a8a8a0' : '#d0d0c8'); }   // grey hair, swept back
    p.rect(cx - 6, 15, 5, 2, '#2a2420'); p.rect(cx + 2, 15, 5, 2, '#2a2420');                                                        // heavy brows
    p.rect(cx - 5, 18, 3, 1, '#f4ead0'); p.rect(cx + 3, 18, 3, 1, '#e4dac0'); p.set(cx - 4, 18, '#1a1418'); p.set(cx + 4, 18, '#1a1418');   // eyes, level
    p.rect(cx, 19, 2, 4, '#b07a5e'); p.rect(cx - 1, 23, 4, 1, '#9a6448');                                                            // nose
    p.rect(cx - 3, 25, 7, 1, '#6a3a2a'); p.rect(cx - 5, 22, 1, 4, '#b07a5e'); p.rect(cx + 6, 22, 1, 4, '#9a6448');                   // a hard mouth, the jowls
    p.rect(0, 0, 32, 2, '#e8c060', EM); p.rect(0, 42, 32, 2, '#8a6a2a'); p.rect(0, 0, 2, 44, '#c9a04a'); p.rect(30, 0, 2, 44, '#8a6a2a');   // the gilt frame
    p.rect(2, 2, 28, 1, '#5a4018'); return p;
  },
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
  prLattice() {   // a floodlight mast's steel lattice, a whole face (14 m) in one: legs, rungs every 2 m, zigzag bracing (cut out between)
    const p = new Pix(8, 56); p.fill('#000000', 0);
    p.rect(0, 0, 1, 56, '#3a3c40'); p.rect(7, 0, 1, 56, '#3a3c40');
    for (let y = 0; y < 56; y += 8) { p.rect(0, y, 8, 1, '#3a3c40'); for (let k = 0; k < 8; k++) p.set(((y >> 3) & 1) ? 7 - k : k, y + k, '#4a4c52'); }
    return p;
  },
  prBoom() {   // the crane's lattice boom, its whole length (27 m) in one: chords, X bracing, yellow (cut out between)
    const p = new Pix(8, 120); p.fill('#000000', 0);
    p.rect(0, 0, 1, 120, '#c8961e'); p.rect(7, 0, 1, 120, '#c8961e');
    for (let y = 0; y < 120; y += 6) { p.rect(0, y, 8, 1, '#b07e18'); for (let k = 0; k < 6; k++) { p.set(1 + k, y + k, '#d8a830'); p.set(6 - k, y + k, '#9a6c14'); } }
    p.rect(0, 0, 8, 2, '#e8c040'); return p;
  },
  prScaffold() {   // a scaffold tower, its whole face (3 m x 21 m): standards, ledgers every 2 m, a brace, boards at three lifts (cut out between)
    const p = new Pix(24, 168); p.fill('#000000', 0); const T = '#8e9296', D = '#5e6266';
    p.rect(0, 0, 2, 168, T); p.rect(22, 0, 2, 168, T); p.rect(1, 0, 1, 168, D); p.rect(23, 0, 1, 168, D);
    for (let y = 0; y < 168; y += 16) p.rect(0, y, 24, 1, T);
    for (let y = 0; y < 168; y++) { const x = Math.round(2 + ((y % 32) < 16 ? (y % 16) : 15 - (y % 16)) * 1.25); p.set(x, y, D); }
    for (const y of [0, 48, 112]) { p.rect(0, y + 1, 24, 2, '#6a5034'); p.rect(0, y + 3, 24, 1, '#4a3624'); }
    return p;
  },
  prFlagRack() {   // the honour guard's spare flags: six staffs leaning on a rack, furled red, gilt finials (3 m x 3 m, cut out between)
    const p = new Pix(32, 32); p.fill('#000000', 0);
    for (let k = 0; k < 6; k++) {
      for (let y = 2; y < 32; y++) { const x = Math.round(3 + k * 5 + (31 - y) * 0.12); p.set(x, y, '#5a3a22'); if (y > 4 && y < 16) { p.set(x - 1, y, '#a82a22'); p.set(x + 1, y, y % 3 ? '#8a1e1a' : '#c03a2c'); } }
      p.set(Math.round(3 + k * 5 + 3.6), 1, '#f2c14e'); p.set(Math.round(3 + k * 5 + 3.6), 0, '#fff0b0');
    }
    p.rect(0, 20, 32, 1, '#3a3e42'); p.rect(0, 30, 32, 2, '#2a2e32'); return p;
  },
  prProgramme() {   // the rehearsal's running order for 1 May 1986, pinned up on a board as you come out of the Palace
    const p = new Pix(136, 76); p.fill('#e8e0c8'); p.speck('#d8d0b4', 60);
    p.rect(0, 0, 136, 12, '#a82a22'); p.rect(0, 12, 136, 1, '#c9a04a'); p.text('1 MAY 1986 · PROGRAMME', 2, 3, '#f2c14e');
    const L = [['09.00', 'HONOUR GUARD'], ['09.20', 'ZUBR KRASNOGRAD'], ['09.40', 'BAND OF WORKS 7'], ['10.00', 'COLUMNS OF LABOR'], ['11.00', 'THE CHAIRMAN']];
    L.forEach(([t, w], i) => { p.text(t, 2, 16 + i * 10, '#a82a22'); p.text(w, 38, 16 + i * 10, '#2a2a3a'); });
    p.text('REHEARSAL', 78, 67, '#c8342a'); p.rect(76, 65, 57, 1, '#c8342a'); p.rect(76, 75, 57, 1, '#c8342a');
    p.rect(0, 75, 76, 1, '#b8ae94'); return p;
  },
  prZubr() { const p = new Pix(112, 14); p.fill('#1a3a7a'); p.rect(0, 0, 112, 1, '#e6e2d6'); p.rect(0, 13, 112, 1, '#e6e2d6'); p.text('ZUBR · KRASNOGRAD', 5, 4, '#f4f1ea'); return p; },   // the gymnasts' club, up from the capital
  prWetPaint() { const p = new Pix(60, 12); p.fill('#f4ead0'); p.rect(0, 0, 60, 1, '#a82a22'); p.rect(0, 11, 60, 1, '#a82a22'); p.text('WET PAINT', 3, 3, '#a82a22'); return p; },
  prLadder() { const p = new Pix(8, 40); p.fill('#000000', 0); p.rect(0, 0, 1, 40, '#8a6a44'); p.rect(7, 0, 1, 40, '#6a5034'); for (let y = 3; y < 40; y += 5) p.rect(1, y, 6, 1, '#9a7a50'); p.speck('#c8342a', 3); return p; },
  prDropCloth() {   // the painters' sheet on the float's deck: canvas, splashes of the portrait's colours
    const p = new Pix(32, 16); p.fill('#c8bca0'); p.speck('#b8ac90', 30);
    for (const [x, y, c] of [[5, 4, '#c83a24'], [11, 9, '#e87a32'], [20, 5, '#e8c040'], [26, 11, '#3a3430'], [15, 13, '#c83a24'], [8, 12, '#e8dcc0']]) { p.rect(x, y, 2, 2, c); p.set(x + 2, y + 1, c); p.set(x - 1, y, c); }
    return p;
  },
  prTin() { const p = new Pix(8, 8); p.fill('#8a8e92'); p.rect(0, 0, 8, 1, '#b8bcc0'); p.rect(0, 3, 8, 3, '#e8dcc0'); p.rect(2, 4, 4, 1, '#a82a22'); p.rect(0, 2, 8, 1, '#c83a24'); return p; },
  prCrane() {   // the truck crane's body: signal orange, a black-and-yellow skirt, a stencilled number (one repeat = 4 m x 2 m)
    const p = new Pix(32, 16); p.fill('#d8782a'); p.rect(0, 0, 32, 1, '#f0a050'); p.speck('#c86a22', 10);
    for (let x = 0; x < 32; x += 4) { p.rect(x, 13, 2, 3, '#1e1c1e'); p.rect(x + 2, 13, 2, 3, '#e8c030'); }
    p.text('4', 13, 4, '#2a2420'); p.rect(20, 3, 1, 9, '#a85a1e'); return p;
  },
  prCraneCab() {   // the cab: orange, a dark windscreen catching the floods, a door (one repeat = the cab's face)
    const p = new Pix(16, 16); p.fill('#d8782a'); p.rect(0, 0, 16, 1, '#f0a050');
    p.rect(2, 2, 12, 6, '#1a2028'); p.rect(3, 3, 4, 2, '#5a6a7a'); p.rect(2, 8, 12, 1, '#a85a1e'); p.rect(0, 13, 16, 3, '#1e1c1e'); return p;
  },
  prRope() { const p = new Pix(4, 4); p.fill('#c8b48a'); p.set(1, 1, '#a8946a'); return p; },
  prFloodBank() {   // six lamps in a frame, blazing
    const p = new Pix(24, 16); p.fill('#2a2a2e');
    for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) { const d = Math.hypot(x - 3, y - 3); if (d < 3.4) p.set(1 + i * 8 + x, 1 + j * 8 + y, d < 2.2 ? '#fffaf0' : '#ffd890', EM); }
    return p;
  },
  // ---- the east side: empty bleachers for the parade, a slogan along the back
  prBleacher() {   // a tier's riser (one repeat = 8 m x the riser): concrete, the seat's oak edge, a row number every 4 m
    const p = new Pix(64, 8); p.fill('#7a766e'); p.rect(0, 0, 64, 3, '#6a4a2e'); p.rect(0, 3, 64, 1, '#3a2a1e'); p.speck('#6a665e', 20);
    for (const x of [8, 40]) p.rect(x, 5, 3, 2, '#e6dac0'); return p;
  },
  prBleachTop() { const p = new Pix(32, 32); p.fill('#5a4030'); for (let x = 0; x < 32; x += 4) p.rect(x, 0, 1, 32, '#3a2a1e'); for (let y = 0; y < 32; y += 16) p.rect(0, y, 32, 1, '#2e2018'); p.speck('#6a4a36', 20); return p; },   // oak seat planks (8 m)
  prStandWall() {   // the guest stand's back wall: granite panels between pilasters, a gilt band (one repeat = 8 m x 5.2 m)
    const p = new Pix(64, 40); p.fill('#7e7672'); p.speck('#726a66', 50); p.speck('#8a8280', 30);
    for (const x of [0, 32]) { p.rect(x, 0, 4, 40, '#948c88'); p.rect(x + 4, 0, 1, 40, '#5e5856'); }
    for (const x of [8, 40]) { p.rect(x, 5, 20, 26, '#6e6662'); p.rect(x, 5, 20, 1, '#5a5452'); p.rect(x, 30, 20, 1, '#8a8280'); }
    p.rect(0, 0, 64, 2, '#a8a09a'); p.rect(0, 34, 64, 1, '#c9a04a'); p.rect(0, 35, 64, 5, '#4e4846'); return p;
  },
  prSlogan() {   // cream on faded red: PEACE · LABOR · UNITY
    const p = new Pix(136, 14); p.fill('#9a2a24'); p.rect(0, 0, 136, 1, '#d8b048'); p.rect(0, 13, 136, 1, '#d8b048');
    p.text('PEACE · LABOR · UNITY', 5, 4, '#efe2c4'); return p;
  },
  // ---- the Ministry of Order: grey stone, tall dark windows, bronze doors, and one lit window
  prMinistry() {   // one bay x one storey (4 m x 4.67 m) of the colossal order: a full-height pilaster, a tall dark window, a spandrel panel
    const p = new Pix(32, 36); p.fill('#6e6a64'); p.speck('#64605a', 30); p.speck('#76726c', 20);
    p.rect(0, 0, 5, 36, '#8a867e'); p.rect(1, 0, 1, 36, '#9a968e'); p.rect(5, 0, 1, 36, '#4a4844');                 // the pilaster, lit on its edge
    p.rect(11, 4, 14, 23, '#54504c'); p.rect(12, 5, 12, 21, '#14161c'); p.rect(17, 5, 2, 21, '#2e2c2a'); p.rect(12, 13, 12, 1, '#2e2c2a');   // the window, dark
    p.rect(10, 2, 16, 2, '#8a867e'); p.rect(10, 27, 16, 2, '#8a867e'); p.rect(12, 30, 12, 4, '#5e5a56'); p.rect(12, 30, 12, 1, '#4a4844');   // head, sill, spandrel
    return p;
  },
  prMinCentre() {   // the central bays: taller windows under round heads, a carved wreath between storeys (4 m x 4.67 m)
    const p = new Pix(32, 36); p.fill('#74706a'); p.speck('#6a665e', 30);
    p.rect(0, 0, 5, 36, '#8e8a82'); p.rect(1, 0, 1, 36, '#a09c94'); p.rect(5, 0, 1, 36, '#4a4844');
    p.rect(12, 6, 12, 24, '#14161c'); for (let x = 12; x < 24; x++) { const h = Math.round(Math.sqrt(Math.max(0, 36 - (x - 17.5) ** 2))); p.rect(x, 6 - h, 1, h, '#14161c'); }
    p.rect(17, 2, 2, 28, '#2e2c2a'); p.rect(12, 16, 12, 1, '#2e2c2a'); p.rect(10, 30, 16, 2, '#9a968e');
    for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; p.set(18 + Math.round(Math.cos(t) * 2), 33 + Math.round(Math.sin(t) * 1.4), '#c9a04a'); }
    return p;
  },
  prMinRust() {   // the ground floor (4 m x 6 m): rusticated dark granite blocks, a deep window behind an iron grille (Lubyanka's base)
    const p = new Pix(32, 48); p.fill('#4a4244'); p.speck('#40383a', 40); p.speck('#564e50', 30);
    for (let y = 0; y < 44; y += 6) { p.rect(0, y, 32, 1, '#241e20'); for (let x = ((y / 6) & 1) * 8; x < 32; x += 16) p.rect(x, y, 1, 6, '#241e20'); }
    p.rect(10, 12, 12, 22, '#0e1014'); for (let x = 10; x < 22; x++) { const h = Math.round(Math.sqrt(Math.max(0, 36 - (x - 15.5) ** 2))); p.rect(x, 12 - h, 1, h, '#0e1014'); }
    for (let x = 11; x < 22; x += 3) p.rect(x, 7, 1, 27, '#3a3e42'); p.rect(10, 22, 12, 1, '#3a3e42');
    p.rect(0, 44, 32, 4, '#5a5254'); p.rect(0, 44, 32, 1, '#6a6264'); return p;
  },
  prMinAttic() {   // the attic over the cornice (4 m x 6 m): pairs of small square windows, a band, the parapet
    const p = new Pix(32, 48); p.fill('#6a665e'); p.speck('#605c56', 30);
    p.rect(0, 0, 32, 4, '#8a867e'); p.rect(0, 4, 32, 1, '#4a4844'); p.rect(0, 44, 32, 4, '#7e7a72');
    for (const x of [6, 18]) { p.rect(x, 16, 8, 10, '#54504c'); p.rect(x + 1, 17, 6, 8, '#14161c'); p.rect(x + 4, 17, 1, 8, '#2e2c2a'); }
    p.rect(0, 0, 3, 48, '#7e7a72'); return p;
  },
  prMinTower() {   // the clock tower's faces (4 m x 5 m): tall slit openings between paired pilasters
    const p = new Pix(32, 40); p.fill('#6e6a64'); p.speck('#64605a', 30);
    for (const x of [0, 4, 26]) p.rect(x, 0, 3, 40, '#8a867e');
    p.rect(12, 6, 8, 28, '#14161c'); p.rect(15, 6, 2, 28, '#2a2826'); p.rect(10, 34, 12, 2, '#9a968e'); return p;
  },
  prCornice() {   // the cornice's face (4 m x 1.2 m): a fascia over a row of dentils
    const p = new Pix(32, 10); p.fill('#8e8a82'); p.rect(0, 0, 32, 2, '#aaa69e'); p.rect(0, 5, 32, 1, '#5e5a56');
    for (let x = 0; x < 32; x += 3) p.rect(x, 6, 2, 3, '#9a968e'); p.rect(0, 9, 32, 1, '#3a3836'); return p;
  },
  prClock() {   // the Ministry's clock, lit from behind (it's seven past one)
    const p = new Pix(24, 24); p.fill('#000000', 0);
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) { const d = Math.hypot(x - 11.5, y - 11.5); if (d < 11.8) p.set(x, y, d > 10.3 ? '#c9a04a' : '#f4ead0', d > 10.3 ? 255 : EM); }
    for (let k = 0; k < 12; k++) { const t = k / 12 * Math.PI * 2; p.set(11.5 + Math.sin(t) * 8.8, 11.5 - Math.cos(t) * 8.8, '#2a2420', EM); if (k % 3 === 0) p.set(11.5 + Math.sin(t) * 7.8, 11.5 - Math.cos(t) * 7.8, '#2a2420', EM); }
    const hand = (a, r) => { for (let s = 0; s <= r; s += 0.5) p.set(11.5 + Math.sin(a) * s, 11.5 - Math.cos(a) * s, '#1a1410', EM); };
    hand((1 + 7 / 60) / 12 * Math.PI * 2, 5); hand(7 / 60 * Math.PI * 2, 8.5); p.rect(11, 11, 2, 2, '#a82a22', EM); return p;
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
