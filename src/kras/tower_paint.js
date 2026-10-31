'use strict';
// ============================== the Tower of Labor: painted textures ========================
// Krasnovia's seat of power (src/kras/tower.js): the stepped stone shell and its gilt, the marble lobby and its worker
// mosaic, the Ministry's office floor, the archive, the Chairman's office. Painted into the street atlas like everything
// else (no extra textures or draw calls). Faces and names are invented. Alpha 204 (EM) = the texel glows by itself.
Object.assign(PAINT, {
  // ---- the shell: pale stone piers, bays of tall office windows, a spandrel per floor (one repeat = 8 m x 8 m: 2 floors)
  towerFace() {
    const p = new Pix(32, 32); p.fill('#8e826c');
    for (let f = 0; f < 2; f++) {
      const y = f * 16; p.rect(0, y, 32, 3, '#7a705c'); p.rect(0, y, 32, 1, '#b4a88e');
      for (let x = 0; x < 32; x += 8) {
        const lit = prng() < 0.5, warm = prng() < 0.7;
        p.rect(x + 3, y + 4, 4, 11, lit ? (warm ? '#ffbe6a' : '#ffe2a8') : '#241e1c', lit ? EM : 255);
        p.rect(x + 3, y + 9, 4, 1, lit ? '#b07a44' : '#3a322a');
      }
    }
    for (let x = 0; x < 32; x += 8) { p.rect(x, 0, 2, 32, '#c8bca0'); p.rect(x + 2, 0, 1, 32, '#6a604e'); }
    p.speck('#9a8e78', 14); return p;
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
  phone() { const p = new Pix(8, 8); p.fill('#1a1a1e'); p.rect(1, 1, 6, 2, '#2e2e34'); p.rect(2, 4, 4, 3, '#c8c4b8'); p.set(3, 5, '#1a1a1e'); p.set(5, 5, '#1a1a1e'); return p; },
});
