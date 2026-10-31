'use strict';
// ============================== the Tower of Labor: painted textures ========================
// Krasnovia's seat of power (src/kras/tower.js): the stepped stone shell and its gilt, the marble lobby and its worker
// mosaic, the Ministry's office floor, the archive, the Chairman's office. Painted into the street atlas like everything
// else (no extra textures or draw calls). Faces and names are invented. Alpha 204 (EM) = the texel glows by itself.
Object.assign(PAINT, {
  // ---- the shell: floodlit limestone. Strong pale piers carry the eye up (Moscow's high-rises), the bays between them
  // are recessed with small deep windows, most of them dark at night: stone that the floodlights wash, not a lit grid.
  // One repeat = 8 m x 8 m: 4 bays, 2 floors.
  towerFace() {
    const p = new Pix(32, 32); p.fill('#9a8c70');
    for (let x = 0; x < 32; x += 8) p.rect(x + 2, 0, 6, 32, '#86785e');                         // the recessed bays
    for (let f = 0; f < 2; f++) {
      const y = f * 16; p.rect(0, y + 13, 32, 3, '#a4967a'); p.rect(0, y + 13, 32, 1, '#c4b698');   // a spandrel per floor
      for (let x = 0; x < 32; x += 8) {
        const lit = prng() < 0.16, warm = prng() < 0.75;
        p.rect(x + 3, y + 3, 4, 8, '#3a3026'); p.rect(x + 4, y + 4, 2, 7, lit ? (warm ? '#ffc070' : '#ffe2a8') : '#2a241e', lit ? EM : 255);
        if (lit) p.rect(x + 4, y + 7, 2, 1, '#a8703c', EM);
        p.rect(x + 3, y + 11, 4, 1, '#c4b698');                                                   // the sill
      }
    }
    for (let x = 0; x < 32; x += 8) { p.rect(x, 0, 2, 32, '#d8ccb0'); p.set(x + 1, 0, '#e8dcc0'); p.rect(x + 2, 0, 1, 32, '#5e5240'); }   // the piers
    p.speck('#8e8268', 12); return p;
  },
  twTrim() { const p = new Pix(8, 8); p.fill('#c8bca0'); p.rect(0, 0, 8, 1, '#e2d6ba'); p.rect(0, 7, 8, 1, '#8e826a'); p.speck('#b4a88c', 4); return p; },   // plain floodlit stone (pinnacles, plinths, the tribune)
  twGold() {   // the crown's gilt: brighter than any other gold in the city, self-lit (bands, ribs, the lantern's frame)
    const p = new Pix(16, 8); p.fill('#f0b43c', EM); p.rect(0, 0, 16, 1, '#ffe080', EM); p.rect(0, 7, 16, 1, '#a8701c', EM);
    for (let x = 1; x < 16; x += 4) { p.rect(x, 2, 2, 4, '#ffcc50', EM); p.set(x + 2, 3, '#c08424', EM); } return p;
  },
  twLantern() {   // the crown's lantern: a ring of tall arched openings blazing gold between dark stone columns (one repeat = 4 m x 9 m)
    const p = new Pix(16, 32); p.fill('#5e5240');
    p.rect(3, 4, 10, 26, '#ffd870', EM); p.rect(4, 3, 8, 1, '#ffd870', EM); p.rect(5, 2, 6, 1, '#ffd870', EM);
    p.rect(5, 6, 6, 22, '#fff2c0', EM); p.rect(7, 4, 2, 26, '#c8902a', EM);
    p.rect(0, 0, 16, 1, '#ffd25a', EM); p.rect(0, 31, 16, 1, '#ffd25a', EM); p.rect(0, 0, 2, 32, '#7a6a52'); p.rect(14, 0, 2, 32, '#7a6a52'); return p;
  },
  twCog() {   // the gilded cog: twelve teeth, a rim, six spokes, the hub (self-lit: the brightest thing in the sky)
    const p = new Pix(48, 48), c = 23.5;
    for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
      const d = Math.hypot(x - c, y - c), a = Math.atan2(y - c, x - c), tooth = Math.cos(a * 12) > 0.15;
      let col = null;
      if (d < 23.5 && d >= 19 && tooth) col = d > 22.5 ? '#c8902a' : '#ffd25a';
      else if (d < 19 && d >= 14.5) col = d > 18 ? '#fff2b0' : d < 15.5 ? '#c8902a' : '#ffcc4a';
      else if (d < 14.5 && d >= 5.5 && Math.abs(Math.sin(a * 3)) < 0.16) col = '#ffd25a';
      else if (d < 5.5) col = d < 2 ? '#fff6d0' : d > 4.5 ? '#c8902a' : '#ffdc6a';
      if (col) p.set(x, y, col, EM);
    }
    return p;
  },
  twHalo() {   // drawn additively round the cog and the crown: a soft gold glow, dithered (black adds nothing)
    const p = new Pix(32, 32);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const d = Math.hypot(x - 15.5, y - 15.5) / 16; if (d < 1) { const k = Math.pow(1 - d, 2.2); p.set(x, y, [Math.round(255 * k), Math.round(190 * k), Math.round(80 * k)]); } }
    return p;
  },
  twBeam() {   // a searchlight's beam, drawn additively: a bright core, soft edges (u across, v along; the fade along it is in the vertices)
    const p = new Pix(16, 4);
    for (let x = 0; x < 16; x++) { const k = Math.pow(1 - Math.abs(x - 7.5) / 8, 1.6); for (let y = 0; y < 4; y++) p.set(x, y, [Math.round(255 * k), Math.round(236 * k), Math.round(196 * k)]); }
    return p;
  },
  twDoorsLit() {   // the Chairman's doors seen from far below: tall glazed bronze doors, the office blazing behind them (additive)
    const p = new Pix(16, 12); p.fill('#5a3c18');
    for (const x of [1, 9]) { p.rect(x, 1, 6, 11, '#ffc870'); p.rect(x + 1, 2, 4, 9, '#ffe2a0'); p.rect(x + 3, 1, 1, 11, '#8a6028'); }
    p.rect(0, 5, 16, 1, '#8a6028'); return p;
  },
  twBannerTall() {   // the facade's giant banners: red, a gold field with the cog at the top, gold edges and fringe (16 x 64: 1 x 4)
    const p = new Pix(16, 64); p.fill('#a81c18');
    p.rect(0, 0, 16, 64, '#a81c18'); p.rect(1, 0, 1, 60, '#e8b84a', EM); p.rect(14, 0, 1, 60, '#e8b84a', EM);
    p.rect(2, 2, 12, 13, '#7e1210');
    for (let y = 0; y < 13; y++) for (let x = 0; x < 12; x++) { const d = Math.hypot(x - 5.5, y - 6), a = Math.atan2(y - 6, x - 5.5); if ((d < 4 && d > 2) || (d < 5.4 && d >= 4 && Math.cos(a * 8) > 0.2)) p.set(x + 2, y + 2, '#ffd25a', EM); }
    for (let y = 20; y < 56; y += 6) p.rect(4, y, 8, 1, '#c82a24');
    p.rect(3, 18, 10, 1, '#e8b84a', EM); p.rect(3, 57, 10, 1, '#e8b84a', EM);
    for (let x = 0; x < 16; x += 2) p.rect(x, 60, 1, 4, '#e8b84a', EM);
    return p;
  },
  twGlass() {   // the glass lift's panes: clear, with a few streaks of reflected light (the rest isn't drawn)
    const p = new Pix(16, 32);   // one repeat = a whole pane: two short diagonal glints, nothing else
    for (const [x0, y0, n] of [[3, 4, 6], [5, 5, 3], [10, 20, 5]]) for (let k = 0; k < n; k++) p.set(x0 + k, y0 + k * 2, '#b8d4dc', 230);
    return p;
  },
  twStatue() { const p = new Pix(8, 8); p.fill('#a49c8a'); p.rect(0, 0, 8, 1, '#c4bca8'); p.rect(0, 7, 1, 1, '#6e6858'); p.speck('#8e8878', 5); p.speck('#b4ac9a', 3); return p; },   // the heroes: floodlit pale granite
  twBalustrade() {   // the tribune's parapet: stone balusters under a rail (one repeat = 2 m x 1.1 m)
    const p = new Pix(16, 9); p.fill('#c8bca0'); p.rect(0, 2, 16, 6, '#3a3026');
    for (let x = 1; x < 16; x += 3) { p.rect(x, 2, 2, 6, '#b8ac90'); p.set(x, 4, '#d8ccb0'); p.set(x + 1, 6, '#8e826a'); }
    p.rect(0, 0, 16, 2, '#d8ccb0'); p.rect(0, 8, 16, 1, '#8e826a'); return p;
  },
  litPanorama() {   // the Chairman's window seen from outside: a warm band with mullions
    const p = new Pix(32, 8); p.fill('#ffd28a', EM); for (let x = 0; x < 32; x += 4) p.rect(x, 0, 1, 8, '#4a3a2a'); p.rect(0, 0, 32, 1, '#4a3a2a'); p.rect(0, 7, 32, 1, '#4a3a2a');
    p.rect(9, 3, 3, 4, '#c88a4a', EM); p.rect(20, 2, 2, 5, '#b8231e', EM); return p;
  },
  towerSign() {   // over the south doors
    const p = new Pix(96, 13); p.fill('#5a1410', EM); p.rect(0, 0, 96, 1, '#f2c14e', EM); p.rect(0, 12, 96, 1, '#f2c14e', EM);
    p.text('TOWER OF LABOR', 6, 3, '#f2c14e', EM); return p;
  },
  granite() {   // the apron: big grey granite slabs (one repeat = 4 m)
    const p = new Pix(16, 16); p.fill('#4a4644'); p.rect(0, 0, 16, 1, '#2e2a2a'); p.rect(0, 8, 16, 1, '#2e2a2a'); p.rect(0, 0, 1, 8, '#2e2a2a'); p.rect(8, 8, 1, 8, '#2e2a2a');
    p.speck('#5a5654', 16); p.speck('#3e3a3a', 10); return p;
  },
  bronzeDoor() {   // a leaf of the south doors: bronze panels, a cog boss
    const p = new Pix(16, 24); p.fill('#5a3e22'); p.rect(1, 1, 14, 22, '#7a5630');
    for (const y of [2, 12]) { p.rect(2, y, 12, 9, '#6a4a28'); p.rect(3, y + 1, 10, 7, '#8a6438'); }
    for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; p.set(8 + Math.round(Math.cos(t) * 3), 6 + Math.round(Math.sin(t) * 3), '#c9a04a'); }
    p.set(8, 6, '#c9a04a'); p.rect(14, 11, 1, 3, '#c9a04a'); return p;
  },
  // ---- the lobby
  marble() {   // floor: cream and oxblood marble squares (one repeat = 2 m), a few veins
    const p = new Pix(16, 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p.set(x, y, ((x >> 3) + (y >> 3)) & 1 ? '#6a2a26' : '#d6ccb8');
    for (let k = 0; k < 10; k++) { let x = Math.floor(prng() * 16), y = Math.floor(prng() * 16); for (let s = 0; s < 4; s++) { const dark = ((x >> 3) + (y >> 3)) & 1; p.set(x, y, dark ? '#82403a' : '#bcb09a'); x += 1; y += prng() < 0.5 ? 1 : 0; } }
    p.rect(0, 0, 16, 1, '#a89c86'); p.rect(0, 0, 1, 16, '#a89c86'); return p;
  },
  marbleWall() {   // walls: veined cream marble over an oxblood skirting (one repeat = the whole wall height)
    const p = new Pix(16, 32); p.fill('#cfc4ae'); p.speck('#c0b49c', 20); p.speck('#ddd4c0', 10);
    for (let k = 0; k < 4; k++) { let x = Math.floor(prng() * 16), y = Math.floor(prng() * 24); for (let s = 0; s < 6; s++) { p.set(x, y, '#a89a80'); x += prng() < 0.5 ? 1 : 0; y++; } }
    p.rect(0, 28, 16, 4, '#6a2a26'); p.rect(0, 27, 16, 1, '#c9a04a'); p.rect(0, 0, 16, 1, '#c9a04a'); return p;
  },
  coffer() {   // the lobby ceiling: cream coffers with gilt rims (one repeat = 2 m)
    const p = new Pix(16, 16); p.fill('#b8ac94'); p.rect(2, 2, 12, 12, '#8e8270'); p.rect(4, 4, 8, 8, '#a89c86'); p.rect(2, 2, 12, 1, '#c9a04a'); p.rect(2, 2, 1, 12, '#c9a04a'); p.set(8, 8, '#f2c14e'); return p;
  },
  carpetRed() {   // the runner: banner red, a gold border down both edges (u spans the width)
    const p = new Pix(16, 16); p.fill('#9a1c18'); p.rect(0, 0, 2, 16, '#c9a04a'); p.rect(14, 0, 2, 16, '#c9a04a'); p.rect(2, 0, 1, 16, '#6a1210'); p.rect(13, 0, 1, 16, '#6a1210');
    p.speck('#aa2420', 12); return p;
  },
  mosaicLabor() {   // the giant worker mosaic: a steelworker and a harvester hold up a gold cog against a red sun (invented)
    const p = new Pix(48, 24);
    for (let y = 0; y < 24; y++) for (let x = 0; x < 48; x++) p.set(x, y, (x + y) & 1 ? '#2a5a6a' : '#326676');
    for (let y = 0; y < 24; y++) for (let x = 0; x < 48; x++) { const d = Math.hypot(x - 23.5, y - 9); if (d < 8.5) p.set(x, y, d < 5 ? '#ffb060' : '#d8322a'); else if (d < 14 && Math.floor(Math.atan2(y - 9, x - 23.5) / Math.PI * 8) & 1) p.set(x, y, '#3a7080'); }
    for (let y = 0; y < 24; y++) for (let x = 0; x < 48; x++) { const d = Math.hypot(x - 23.5, y - 9), a = Math.atan2(y - 9, x - 23.5); if ((d < 4.6 && d > 2.4) || (d < 6 && d >= 4.6 && Math.cos(a * 8) > 0.2)) p.set(x, y, '#f2c14e'); }
    // the steelworker (left): cap, raised arm to the cog, overalls
    p.rect(10, 5, 4, 2, '#3a4250'); p.rect(10, 7, 4, 3, '#e0b08c'); p.rect(9, 10, 6, 7, '#3a4a6a'); p.rect(14, 6, 2, 5, '#3a4a6a'); p.rect(15, 5, 3, 2, '#e0b08c');
    p.rect(9, 17, 2, 6, '#2a2622'); p.rect(13, 17, 2, 6, '#2a2622');
    // the harvester (right): headscarf, raised arm, a sheaf
    p.rect(33, 5, 4, 2, '#d8322a'); p.rect(33, 7, 4, 3, '#e0b08c'); p.rect(32, 10, 6, 8, '#6a5a3a'); p.rect(31, 6, 2, 5, '#6a5a3a'); p.rect(29, 5, 3, 2, '#e0b08c');
    p.rect(38, 11, 3, 7, '#f2c14e'); p.rect(33, 18, 2, 5, '#2a2622'); p.rect(36, 18, 2, 5, '#2a2622');
    p.rect(0, 22, 48, 2, '#b8231e'); p.rect(0, 0, 48, 1, '#c9a04a'); p.rect(0, 23, 48, 1, '#c9a04a'); return p;
  },
  bronze() { const p = new Pix(8, 8); p.fill('#6a4a2a'); p.rect(0, 0, 8, 1, '#a07a44'); p.rect(0, 0, 1, 8, '#8a643a'); p.speck('#4a321c', 6); return p; },
  oakDoor() {   // a tall double door in a marble wall: dark oak, brass handles
    const p = new Pix(16, 24); p.fill('#c9a04a'); p.rect(1, 1, 14, 23, '#3e2414'); p.rect(8, 1, 1, 23, '#24140a');
    for (const x of [2, 9]) { p.rect(x, 3, 5, 8, '#4e2e1a'); p.rect(x, 13, 5, 9, '#4e2e1a'); }
    p.rect(6, 12, 1, 2, '#f2c14e'); p.rect(10, 12, 1, 2, '#f2c14e'); return p;
  },
  liftBrass() {   // the Ministry's lift doors: brass, a gold cog boss on each leaf
    const p = new Pix(16, 32); p.fill('#8a6a34'); p.rect(0, 0, 16, 2, '#5a4220'); p.rect(0, 30, 16, 2, '#5a4220'); p.rect(7, 2, 2, 28, '#5a4220');
    for (const cx of [3.5, 12.5]) for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; p.set(Math.round(cx + Math.cos(t) * 2), Math.round(13 + Math.sin(t) * 2), '#f2c14e'); }
    p.speck('#9a7a44', 12); return p;
  },
  // ---- the Ministry's office floor
  officeWall() {   // institutional green over an oak dado (one repeat = 2 m x 3.4 m)
    const p = new Pix(16, 28); p.fill('#7a9a84'); p.speck('#6e8e78', 16); p.speck('#86a690', 8);
    p.rect(0, 18, 16, 10, '#5a3a22'); p.rect(0, 18, 16, 1, '#3a2414'); for (let x = 0; x < 16; x += 8) p.rect(x, 19, 1, 9, '#4a2e1a');
    p.rect(0, 0, 16, 1, '#e6dac0'); return p;
  },
  parquet() {   // herringbone oak (one repeat = 1.6 m)
    const p = new Pix(16, 16); p.fill('#7a4e2a');
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const k = (x + y) >> 2, l = (x - y + 16) >> 2; p.set(x, y, ((k + l) & 1) ? (k & 1 ? '#8a5a32' : '#82542e') : (l & 1 ? '#6e4424' : '#764a28')); }
    return p;
  },
  ceilTile() { const p = new Pix(16, 16); p.fill('#d6d0c0'); p.rect(0, 0, 16, 1, '#a8a294'); p.rect(0, 0, 1, 16, '#a8a294'); p.speck('#c4beb0', 18); return p; },
  deskTop() { const p = new Pix(16, 8); p.fill('#2e4a32'); p.rect(0, 0, 16, 1, '#5a3a22'); p.rect(0, 7, 16, 1, '#5a3a22'); p.rect(0, 0, 1, 8, '#5a3a22'); p.rect(15, 0, 1, 8, '#5a3a22'); p.speck('#36563a', 6); return p; },
  typewriter() { const p = new Pix(8, 8); p.fill('#22262a'); for (let y = 3; y < 7; y++) for (let x = 1; x < 7; x += 2) p.set(x + (y & 1), y, '#c8c4b8'); p.rect(0, 0, 8, 2, '#3a3e42'); p.rect(2, 0, 4, 1, '#e6e2d6'); return p; },
  filing() {   // olive steel filing cabinet: four drawers with label cards
    const p = new Pix(8, 16); p.fill('#5a6044'); for (let y = 0; y < 16; y += 4) { p.rect(0, y, 8, 1, '#3e422e'); p.rect(2, y + 1, 4, 1, '#e6dac0'); p.rect(3, y + 2, 2, 1, '#9a9a88'); } return p;
  },
  portraits() {   // four invented ministers in gilt frames (u 0-0.25, 0.25-0.5, ...)
    const p = new Pix(64, 20);
    const skin = ['#e0b08c', '#c8987a', '#d8a888', '#d0a080'], hair = ['#4a4a4a', '#c8c8c0', '#2a1e14', '#8a7a6a'], bg = ['#3a4a6a', '#5a2a2a', '#2e4a3a', '#4a3a5a'];
    for (let k = 0; k < 4; k++) {
      const x = k * 16; p.rect(x, 0, 16, 20, '#c9a04a'); p.rect(x + 1, 1, 14, 18, '#8a6a2a'); p.rect(x + 2, 2, 12, 16, bg[k]);
      p.rect(x + 5, 4, 6, 7, skin[k]); p.rect(x + 5, 4, 6, k === 1 ? 1 : 2, hair[k]); if (k === 3) { p.rect(x + 4, 4, 1, 5, hair[k]); p.rect(x + 11, 4, 1, 5, hair[k]); }
      p.set(x + 6, 7, '#1e1414'); p.set(x + 9, 7, '#1e1414'); p.rect(x + 7, 9, 2, 1, k === 2 ? '#5a3a2a' : '#8a5a4a'); if (k === 0) p.rect(x + 6, 9, 4, 1, '#4a4a4a');
      p.rect(x + 3, 11, 10, 7, '#2a2a30'); p.rect(x + 7, 11, 2, 4, '#e6e2d6'); p.rect(x + 7, 12, 2, 3, '#8a1c18');
      p.set(x + 4, 14, '#f2c14e'); p.set(x + 5, 15, '#e8352b'); p.set(x + 11, 14, '#f2c14e');
    }
    return p;
  },
  slogan() { const p = new Pix(84, 11); p.fill('#9a1c18', EM); p.rect(0, 0, 84, 1, '#f2c14e', EM); p.rect(0, 10, 84, 1, '#f2c14e', EM); p.text('LABOR · ORDER', 4, 2, '#f2c14e', EM); return p; },
  // ---- the archive
  archiveShelf() {   // grey steel shelving, five shelves of labelled archive boxes, a few blue binders (one repeat = 2 m x 2.6 m)
    const p = new Pix(16, 25); p.fill('#24221e');
    for (let s = 0; s < 5; s++) {
      const y = s * 5; p.rect(0, y + 4, 16, 1, '#8a8a82');
      for (let x = 0; x < 15; x += 4) { if (prng() < 0.12) continue; const c = ['#b89a6a', '#a88a5a', '#c4a676', '#5a6a8a'][Math.floor(prng() * 4)]; p.rect(x, y, 3, 4, c); p.set(x + 1, y + 1, '#ece4cc'); p.rect(x + 2, y, 1, 4, '#8a7048'); }
    }
    p.rect(15, 0, 1, 25, '#8a8a82'); return p;
  },
  cardIndex() {   // the card index: a bank of small oak drawers with brass label holders
    const p = new Pix(16, 8); p.fill('#5a3a22'); for (let y = 0; y < 8; y += 2) for (let x = 0; x < 16; x += 4) { p.rect(x, y, 4, 2, '#7a5030'); p.rect(x, y, 4, 1, '#6a4428'); p.set(x + 1, y + 1, '#c9a04a'); p.set(x + 2, y + 1, '#e6dac0'); }
    return p;
  },
  lino() { const p = new Pix(16, 16); p.fill('#4a5a52'); for (let k = 0; k < 16; k += 8) { p.rect(k, 0, 1, 16, '#3a4842'); p.rect(0, k, 16, 1, '#3a4842'); } p.speck('#56665e', 14); p.speck('#3e4c46', 8); return p; },
  archiveWall() { const p = new Pix(16, 24); p.fill('#9aa0a0'); p.speck('#8a9090', 18); p.rect(0, 16, 16, 8, '#5a6a6e'); p.rect(0, 16, 16, 1, '#3a4648'); p.rect(0, 0, 16, 1, '#b8bebe'); return p; },
  // ---- the Chairman's office
  oakPanel() {   // tall oak panelling, a gilt picture rail (one repeat = 2 m x 5.6 m)
    const p = new Pix(16, 40); p.fill('#4a2c18');
    for (const [y, h] of [[2, 22], [27, 11]]) for (const x of [1, 9]) { p.rect(x, y, 6, h, '#5a361e'); p.rect(x, y, 6, 1, '#6a4428'); p.rect(x, y, 1, h, '#6a4428'); }
    p.rect(0, 25, 16, 1, '#c9a04a'); p.rect(0, 0, 16, 1, '#c9a04a'); p.rect(0, 39, 16, 1, '#24140a'); return p;
  },
  rugRed() {   // the Chairman's rug: red field, gold border, a cog medallion (the whole rug is one repeat)
    const p = new Pix(32, 20); p.fill('#7a1814'); p.rect(0, 0, 32, 20, '#c9a04a'); p.rect(1, 1, 30, 18, '#3a1a14'); p.rect(2, 2, 28, 16, '#8a1c18');
    for (let y = 0; y < 20; y++) for (let x = 0; x < 32; x++) { const d = Math.hypot((x - 15.5) * 0.8, y - 9.5), a = Math.atan2(y - 9.5, x - 15.5); if ((d < 4 && d > 2.2) || (d < 5.2 && d >= 4 && Math.cos(a * 8) > 0.2)) p.set(x, y, '#c9a04a'); }
    for (let x = 4; x < 28; x += 3) { p.set(x, 3, '#c9a04a'); p.set(x, 16, '#c9a04a'); } return p;
  },
  portraitChair() {   // the Chairman's own portrait (invented): grey hair, heavy brows, a gold cog pin, red curtain behind
    const p = new Pix(20, 26); p.fill('#c9a04a'); p.rect(1, 1, 18, 24, '#8a6a2a'); p.rect(2, 2, 16, 22, '#6a1c18'); p.rect(2, 2, 3, 22, '#8a2420');
    p.rect(7, 5, 7, 8, '#d8a888'); p.rect(6, 4, 9, 2, '#b8b8b0'); p.rect(6, 6, 1, 3, '#b8b8b0'); p.rect(14, 6, 1, 3, '#b8b8b0');
    p.rect(8, 8, 2, 1, '#4a4a4a'); p.rect(11, 8, 2, 1, '#4a4a4a'); p.set(8, 9, '#1e1414'); p.set(11, 9, '#1e1414'); p.rect(9, 11, 3, 1, '#8a5a4a');
    p.rect(4, 13, 13, 11, '#2a2e3a'); p.rect(9, 13, 3, 5, '#e6e2d6'); p.rect(10, 14, 1, 4, '#3a3a4a'); p.set(6, 16, '#f2c14e'); p.set(14, 16, '#f2c14e'); p.set(15, 17, '#e8352b');
    return p;
  },
  permit() {   // the permit to reopen The Threeway, signed
    const p = new Pix(16, 12); p.fill('#efe6cc'); p.rect(0, 0, 16, 1, '#b8231e'); p.text('OK', 1, 2, '#2a2a3a');
    for (let y = 9; y < 11; y++) p.rect(2, y, 6, 1, '#9a9282'); p.set(10, 9, '#1a2a6a'); p.set(11, 8, '#1a2a6a'); p.set(12, 9, '#1a2a6a'); p.set(13, 8, '#1a2a6a'); p.set(14, 9, '#1a2a6a');
    for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; p.set(12 + Math.round(Math.cos(t) * 2), 4 + Math.round(Math.sin(t) * 2), '#b8231e'); }
    return p;
  },
  // ---- the typing pool: the Chairman over everyone, the plan board, brass tubes, green lamps
  portraitGiant() {   // the Chairman, eight metres wide over the typing pool (invented): grey hair, heavy brows, a gold cog pin, red drapes
    const p = new Pix(48, 28); p.fill('#c9a04a'); p.rect(1, 1, 46, 26, '#8a6a2a'); p.rect(2, 2, 44, 24, '#7a1c18');
    for (let x = 2; x < 46; x += 4) p.rect(x, 2, 1, 24, '#8e2420');
    p.rect(16, 2, 16, 24, '#3a4a6a'); p.rect(15, 2, 1, 24, '#c9a04a'); p.rect(32, 2, 1, 24, '#c9a04a');
    p.rect(20, 5, 8, 9, '#d8a888'); p.rect(19, 4, 10, 2, '#c8c8c0'); p.rect(19, 6, 1, 4, '#c8c8c0'); p.rect(28, 6, 1, 4, '#c8c8c0');
    p.rect(21, 8, 2, 1, '#3a3a3a'); p.rect(25, 8, 2, 1, '#3a3a3a'); p.set(22, 9, '#1e1414'); p.set(25, 9, '#1e1414'); p.rect(23, 10, 2, 1, '#b88868'); p.rect(22, 12, 4, 1, '#8a5a4a');
    p.rect(17, 14, 14, 12, '#2a2e3a'); p.rect(22, 14, 4, 6, '#e6e2d6'); p.rect(23, 15, 2, 5, '#8a1c18'); p.set(19, 17, '#f2c14e'); p.set(20, 18, '#f2c14e'); p.set(28, 17, '#e8352b');
    for (const x of [6, 39]) { for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; p.set(x + Math.round(Math.cos(t) * 3), 12 + Math.round(Math.sin(t) * 3), '#f2c14e'); } p.set(x, 12, '#f2c14e'); }
    return p;
  },
  planBoard() {   // the plan board: rows of lit figures, the month's fulfilment in red
    const p = new Pix(48, 16); p.fill('#1a1e1a'); p.rect(0, 0, 48, 1, '#c9a04a'); p.rect(0, 15, 48, 1, '#c9a04a');
    p.text('PLAN', 2, 2, '#f2c14e', EM); p.text('104', 28, 2, '#ff4030', EM);
    for (let y = 10; y < 14; y += 2) for (let x = 2; x < 46; x += 3) p.rect(x, y, 2, 1, prng() < 0.7 ? '#9ae0a0' : '#2a3a2a', prng() < 0.7 ? EM : 255);
    return p;
  },
  tubeExchange() {   // the pneumatic post's exchange: brass pipes into a bank of hatches and gauges
    const p = new Pix(32, 16); p.fill('#3a2e22');
    for (let x = 1; x < 32; x += 4) { p.rect(x, 0, 2, 9, '#c9a04a'); p.rect(x, 0, 1, 9, '#f2d68a'); p.rect(x - 1, 9, 4, 3, '#6a5030'); p.set(x, 10, '#1a1410'); }
    for (let x = 3; x < 32; x += 8) { p.rect(x, 13, 3, 2, '#e6e2d6'); p.set(x + 1, 13, '#8a1c18'); }
    return p;
  },
  greenShade() { const p = new Pix(8, 4); p.fill('#2a9a52', EM); p.rect(0, 0, 8, 1, '#7ad890', EM); p.rect(0, 1, 8, 1, '#48b868', EM); p.rect(0, 3, 8, 1, '#ffe8a0', EM); return p; },   // a bankers' lamp: green glass, lit through
  // ---- the archive canyon
  archiveTall() {   // floor-to-ceiling steel shelving: eight shelves of boxes and ledgers (one repeat = 2 m x 4 m: half the height)
    const p = new Pix(16, 32); p.fill('#2a2620');
    for (let s = 0; s < 8; s++) {
      const y = s * 4; p.rect(0, y + 3, 16, 1, '#7a7a72');
      for (let x = 0; x < 15; x += 2) { if (prng() < 0.1) continue; const c = ['#b89a6a', '#a88a5a', '#c4a676', '#5a6a8a', '#7a5a3a', '#8a3a2a'][Math.floor(prng() * 6)]; p.rect(x, y, 2, 3, c); p.set(x, y + 1, '#ece4cc'); }
    }
    p.rect(15, 0, 1, 32, '#6a6a62'); return p;
  },
  cardWall() {   // the card index as a wall: hundreds of little oak drawers, brass pulls, white labels (one repeat = 1.6 m x 1.6 m)
    const p = new Pix(16, 16); p.fill('#3e2414');
    for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x += 4) { p.rect(x, y, 4, 4, '#6a4024'); p.rect(x, y, 4, 1, '#7a5030'); p.rect(x, y, 1, 4, '#5a361e'); p.set(x + 1, y + 2, '#e6dac0'); p.set(x + 2, y + 2, '#c9a04a'); }
    return p;
  },
  twBulb() { const p = new Pix(4, 4); p.fill('#fff4c8', EM); p.set(1, 1, '#ffffff', EM); return p; },
  phone() { const p = new Pix(8, 8); p.fill('#1a1a1e'); p.rect(1, 1, 6, 2, '#2e2e34'); p.rect(2, 4, 4, 3, '#c8c4b8'); p.set(3, 5, '#1a1a1e'); p.set(5, 5, '#1a1a1e'); return p; },
});
