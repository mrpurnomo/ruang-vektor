/**
 * lesson/hookArt.js — Ilustrasi kartu pemantik tiap sub-topik.
 *
 * SVG murni bertema (warna lewat kelas `ha-*` di lesson.css, bukan hex),
 * satu gagasan per gambar: gambar itu MENGAJUKAN pertanyaan, simulasinya
 * yang menjawab. Tidak ada angka kunci jawaban Mini Kuis di sini.
 */

const grid = (x0, y0, cols, rows, u) => {
  let out = '';
  for (let i = 0; i <= cols; i += 1) out += `<line class="ha-grid" x1="${x0 + i * u}" y1="${y0}" x2="${x0 + i * u}" y2="${y0 + rows * u}"/>`;
  for (let j = 0; j <= rows; j += 1) out += `<line class="ha-grid" x1="${x0}" y1="${y0 + j * u}" x2="${x0 + cols * u}" y2="${y0 + j * u}"/>`;
  return out;
};

/** Mata panah segitiga di ujung (x2, y2) searah (x1,y1)→(x2,y2). */
const head = (x1, y1, x2, y2, cls = 'ha-head', size = 9) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const bx = x2 - ux * size;
  const by = y2 - uy * size;
  const w = size * 0.5;
  return `<path class="${cls}" d="M${x2} ${y2}L${(bx - uy * w).toFixed(1)} ${(by + ux * w).toFixed(1)}L${(bx + uy * w).toFixed(1)} ${(by - ux * w).toFixed(1)}Z"/>`;
};

const arrow = (x1, y1, x2, y2, cls = 'ha-vec', headCls = 'ha-head') => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const k = (len - 8) / len;
  return `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${(x1 + (x2 - x1) * k).toFixed(1)}" y2="${(y1 + (y2 - y1) * k).toFixed(1)}"/>${head(x1, y1, x2, y2, headCls)}`;
};

const ART = {
  /** Sub-topik 1: "3 km" saja menghasilkan SATU LINGKARAN kemungkinan. */
  peta() {
    const cx = 92; const cy = 86; const r = 52;
    const pins = [70, 135, 250, 305].map((deg) => {
      const a = (deg * Math.PI) / 180;
      const x = cx + r * Math.cos(a);
      const y = cy - r * Math.sin(a);
      return `<g class="ha-pin"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"/><text x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}">?</text></g>`;
    }).join('');
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(10, 10, 20, 14, 10)}
      <circle class="ha-ring" cx="${cx}" cy="${cy}" r="${r}"/>
      <path class="ha-house" d="M${cx - 9} ${cy + 7}v-10l9-8 9 8v10z"/>
      ${pins}
      <path class="ha-radius" d="M${cx} ${cy}L${(cx - r * 0.94).toFixed(1)} ${(cy + r * 0.34).toFixed(1)}"/>
      <text class="ha-label ha-label--amber" x="${cx - 24}" y="${cy + 29}">3 km</text>
      ${arrow(cx, cy, 196, 40)}
      <text class="ha-label ha-label--blue" x="160" y="28">ke mana?</text>
    </svg>`;
  },

  /** Sub-topik 2: satu panah, tiga "baju" penulisan. */
  bentuk() {
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(10, 22, 9, 11, 10)}
      <line class="ha-axis" x1="10" y1="62" x2="100" y2="62"/><line class="ha-axis" x1="30" y1="22" x2="30" y2="132"/>
      <path class="ha-dash" d="M30 62h40v30"/>
      ${arrow(30, 62, 70, 92)}
      <circle class="ha-dot" cx="30" cy="62" r="3.5"/>
      <g class="ha-tag"><rect x="122" y="18" width="88" height="30" rx="4"/><text x="166" y="38">(4, −3)</text></g>
      <g class="ha-tag"><rect x="122" y="60" width="88" height="38" rx="4"/>
        <path class="ha-bracket" d="M152 64q-5 15 0 30M180 64q5 15 0 30"/>
        <text x="166" y="77">4</text><text x="166" y="93">−3</text></g>
      <g class="ha-tag"><rect x="122" y="110" width="88" height="30" rx="4"/><text x="166" y="130">4î − 3ĵ</text></g>
      <path class="ha-link" d="M78 92C100 92 104 33 122 33M78 92C100 92 104 79 122 79M78 92C100 92 104 125 122 125"/>
    </svg>`;
  },

  /** Sub-topik 3: denah sekolah — berangkat dari kelas, bukan dari gerbang. */
  denah() {
    const u = 12; const ox = 22; const oy = 140;
    const X = (x) => ox + x * u;
    const Y = (y) => oy - y * u;
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(10, 8, 17, 11, 12)}
      <line class="ha-axis" x1="${X(-1)}" y1="${Y(0)}" x2="${X(15.5)}" y2="${Y(0)}"/><line class="ha-axis" x1="${X(0)}" y1="${Y(0.5)}" x2="${X(0)}" y2="${Y(10.8)}"/>
      <line class="ha-pos" x1="${X(0)}" y1="${Y(0)}" x2="${X(3)}" y2="${Y(4)}"/>
      <line class="ha-pos" x1="${X(0)}" y1="${Y(0)}" x2="${X(12)}" y2="${Y(8)}"/>
      <rect class="ha-bldg" x="${X(1.6)}" y="${Y(6.2)}" width="34" height="22" rx="3"/><text class="ha-bldg-t" x="${X(3)}" y="${Y(5)}">Kelas</text>
      <rect class="ha-bldg ha-bldg--amber" x="${X(10.5)}" y="${Y(10.4)}" width="40" height="22" rx="3"/><text class="ha-bldg-t" x="${X(12.2)}" y="${Y(9.2)}">Kantin</text>
      ${arrow(X(3), Y(4), X(12), Y(8))}
      <circle class="ha-dot" cx="${X(3)}" cy="${Y(4)}" r="4"/><circle class="ha-dot ha-dot--amber" cx="${X(12)}" cy="${Y(8)}" r="4"/>
      <text class="ha-label" x="${X(0) - 10}" y="${Y(0) + 13}">O</text>
      <text class="ha-label ha-label--blue" x="${X(7.6)}" y="${Y(7.4)}">?</text>
    </svg>`;
  },

  /** Sub-topik 4: jalan memutar 3 + 4 vs terbang lurus. */
  jarak() {
    const u = 24; const ox = 40; const oy = 138;
    const X = (x) => ox + x * u;
    const Y = (y) => oy - y * u;
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(16, 18, 8, 5, 24)}
      <path class="ha-route" d="M${X(0)} ${Y(0)}H${X(3)}V${Y(4)}"/>
      <text class="ha-label ha-label--amber" x="${X(1.5)}" y="${Y(0) + 15}">3 blok</text>
      <text class="ha-label ha-label--amber" x="${X(3) + 26}" y="${Y(2)}">4 blok</text>
      ${arrow(X(0), Y(0), X(3), Y(4))}
      <text class="ha-label ha-label--blue" x="${X(1.1)}" y="${Y(2.4)}">?</text>
      <g class="ha-drone" transform="translate(${X(3)} ${Y(4)})"><circle r="6"/><path d="M-13 -6h8M5 -6h8M-13 6h8M5 6h8"/></g>
      <circle class="ha-dot" cx="${X(0)}" cy="${Y(0)}" r="4"/>
    </svg>`;
  },

  /** Sub-topik 5: penunjuk arah di peta game — panjangnya selalu sama. */
  kompas() {
    const cx = 74; const cy = 82;
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      <circle class="ha-map" cx="${cx}" cy="${cy}" r="62"/>
      <circle class="ha-ring" cx="${cx}" cy="${cy}" r="22"/>
      <path class="ha-dash" d="M${cx} ${cy}L200 18"/>
      ${arrow(cx, cy, cx + 19.6, cy - 10, 'ha-vec ha-vec--amber', 'ha-head ha-head--amber')}
      <circle class="ha-dot" cx="${cx}" cy="${cy}" r="4"/>
      <g class="ha-pin"><circle cx="128" cy="54.6" r="7"/><text x="128" y="58.1">!</text></g>
      <g class="ha-pin"><circle cx="196" cy="20" r="7"/><text x="196" y="23.5">!</text></g>
      <text class="ha-label" x="128" y="76">dekat</text>
      <text class="ha-label" x="190" y="42">jauh</text>
      <text class="ha-label ha-label--amber" x="${cx}" y="${cy + 38}">panjang 1</text>
    </svg>`;
  },

  /** Sub-topik 6: drone lepas landas — maju, ke samping, lalu NAIK. */
  ruang() {
    // Proyeksi miring sederhana: X serong kiri-bawah, Y kanan, Z atas.
    const P = (x, y, z) => [100 + y * 22 - x * 13, 112 + x * 9 - z * 24];
    const p = (x, y, z) => P(x, y, z).map((v) => v.toFixed(1)).join(' ');
    const box = [[[0, 0, 0], [4, 0, 0]], [[4, 0, 0], [4, 3, 0]], [[4, 3, 0], [0, 3, 0]], [[0, 0, 0], [0, 3, 0]],
      [[0, 0, 2], [4, 0, 2]], [[4, 0, 2], [4, 3, 2]], [[4, 3, 2], [0, 3, 2]], [[0, 0, 2], [0, 3, 2]],
      [[4, 0, 0], [4, 0, 2]], [[4, 3, 0], [4, 3, 2]], [[0, 3, 0], [0, 3, 2]], [[0, 0, 0], [0, 0, 2]]]
      .map(([a, b]) => `<path class="ha-dash" d="M${p(...a)}L${p(...b)}"/>`).join('');
    const [dx, dy] = P(4, 3, 2);
    const [ox, oy] = P(0, 0, 0);
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      <path class="ha-axis ha-axis--x" d="M${p(0, 0, 0)}L${p(6.4, 0, 0)}"/>
      <path class="ha-axis ha-axis--y" d="M${p(0, 0, 0)}L${p(0, 4.6, 0)}"/>
      <path class="ha-axis ha-axis--z" d="M${p(0, 0, 0)}L${p(0, 0, 3.8)}"/>
      ${box}
      ${arrow(ox, oy, dx, dy)}
      <g class="ha-drone" transform="translate(${dx} ${dy})"><circle r="6"/><path d="M-13 -6h8M5 -6h8M-13 6h8M5 6h8"/></g>
      <text class="ha-label ha-label--x" x="${P(6.6, 0, 0)[0] - 6}" y="${P(6.6, 0, 0)[1] + 10}">X</text>
      <text class="ha-label ha-label--y" x="${P(0, 4.9, 0)[0] + 6}" y="${P(0, 4.9, 0)[1] + 4}">Y</text>
      <text class="ha-label ha-label--z" x="${P(0, 0, 4.1)[0]}" y="${P(0, 0, 4.1)[1] - 2}">Z</text>
      <circle class="ha-dot" cx="${ox}" cy="${oy}" r="3.5"/>
    </svg>`;
  },

  /* ---------------- Bab 2 ---------------- */

  /** Bab 2.1: A → B → C bersambung; perpindahan A → C ditanyakan. */
  perpindahan() {
    const u = 18; const ox = 22; const oy = 140;
    const X = (x) => ox + x * u;
    const Y = (y) => oy - y * u;
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(13, 14, 11, 7, 18)}
      ${arrow(X(0), Y(0), X(6), Y(1))}
      ${arrow(X(6), Y(1), X(8), Y(6))}
      <path class="ha-dash" d="M${X(0)} ${Y(0)}L${X(8)} ${Y(6)}"/>
      <circle class="ha-dot" cx="${X(0)}" cy="${Y(0)}" r="4"/><circle class="ha-dot" cx="${X(6)}" cy="${Y(1)}" r="4"/><circle class="ha-dot ha-dot--amber" cx="${X(8)}" cy="${Y(6)}" r="4"/>
      <text class="ha-label" x="${X(0) - 4}" y="${Y(0) + 15}">A</text>
      <text class="ha-label" x="${X(6) + 10}" y="${Y(1) + 12}">B</text>
      <text class="ha-label" x="${X(8) + 10}" y="${Y(6) - 4}">C</text>
      <text class="ha-label ha-label--blue" x="${X(3.4)}" y="${Y(3.6)}">?</text>
    </svg>`;
  },

  /** Bab 2.2: dua tarikan dari satu titik; jajar genjang belum lengkap. */
  jajar() {
    const u = 20; const ox = 40; const oy = 128;
    const X = (x) => ox + x * u;
    const Y = (y) => oy - y * u;
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(10, 8, 10, 7, 20)}
      <path class="ha-dash" d="M${X(5)} ${Y(1)}L${X(6.5)} ${Y(5)}L${X(1.5)} ${Y(4)}"/>
      ${arrow(X(0), Y(0), X(5), Y(1))}
      ${arrow(X(0), Y(0), X(1.5), Y(4), 'ha-vec ha-vec--amber', 'ha-head ha-head--amber')}
      <rect class="ha-bldg" x="${X(0) - 11}" y="${Y(0) - 9}" width="22" height="18" rx="2"/>
      <text class="ha-label ha-label--blue" x="${X(3.9)}" y="${Y(3.4)}">?</text>
    </svg>`;
  },

  /** Bab 2.3: komponen ratusan — kertas berpetak tidak cukup. */
  komponen() {
    const col = (x, top, bottom) => `<g class="ha-tag"><rect x="${x}" y="36" width="44" height="58" rx="4"/>
      <path class="ha-bracket" d="M${x + 8} 42q-6 23 0 46M${x + 36} 42q6 23 0 46"/>
      <text x="${x + 22}" y="61">${top}</text><text x="${x + 22}" y="83">${bottom}</text></g>`;
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${col(8, '125', '−40')}
      <text class="ha-label ha-label--blue" x="64" y="70">+</text>
      ${col(76, '−60', '95')}
      <text class="ha-label ha-label--blue" x="132" y="70">=</text>
      ${col(144, '?', '?')}
      ${grid(30, 112, 16, 3, 10)}
      <text class="ha-label ha-label--amber" x="110" y="152">tanpa gambar?</text>
    </svg>`;
  },

  /** Bab 2.4: langkah yang sama diulang tiga kali. */
  kelipatan() {
    const u = 22; const ox = 26; const oy = 128;
    const X = (x) => ox + x * u;
    const Y = (y) => oy - y * u;
    const hops = [0, 1, 2].map((k) => arrow(X(2 * k), Y(k), X(2 * k + 2), Y(k + 1))).join('');
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(4, 18, 9, 5, 22)}
      ${hops}
      <circle class="ha-dot" cx="${X(0)}" cy="${Y(0)}" r="4"/>
      <text class="ha-label" x="${X(1)}" y="${Y(0.5) + 16}">1</text>
      <text class="ha-label" x="${X(3)}" y="${Y(1.5) + 16}">2</text>
      <text class="ha-label" x="${X(5)}" y="${Y(2.5) + 16}">3</text>
      <g class="ha-drone" transform="translate(${X(6)} ${Y(3)})"><circle r="6"/><path d="M-13 -6h8M5 -6h8M-13 6h8M5 6h8"/></g>
      <text class="ha-label ha-label--blue" x="${X(6.6)}" y="${Y(4.1)}">3v?</text>
    </svg>`;
  },

  /** Bab 2.5: 2u lalu −v — urutan mengerjakannya ditanyakan. */
  kombinasi() {
    const u = 24; const ox = 24; const oy = 112;
    const X = (x) => ox + x * u;
    const Y = (y) => oy - y * u;
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(12, 16, 8, 5, 24)}
      ${arrow(X(0), Y(0), X(6), Y(2))}
      ${arrow(X(6), Y(2), X(5), Y(0), 'ha-vec ha-vec--amber', 'ha-head ha-head--amber')}
      <path class="ha-dash" d="M${X(0)} ${Y(0)}L${X(5)} ${Y(0)}"/>
      <circle class="ha-dot" cx="${X(0)}" cy="${Y(0)}" r="4"/>
      <text class="ha-label ha-label--blue" x="${X(2.6)}" y="${Y(1.6)}">2u</text>
      <text class="ha-label ha-label--amber" x="${X(6.4) + 6}" y="${Y(1)}">−v</text>
      <g class="ha-tag"><rect x="58" y="128" width="104" height="26" rx="4"/><text x="110" y="146">2u − v = ?</text></g>
    </svg>`;
  },

  /** Bab 2.6: dua panah sama panjang & searah di tempat berjauhan. */
  kembar() {
    const u = 20; const ox = 20; const oy = 136;
    const X = (x) => ox + x * u;
    const Y = (y) => oy - y * u;
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(10, 16, 10, 6, 20)}
      ${arrow(X(0), Y(1), X(3), Y(3))}
      ${arrow(X(5), Y(3), X(8), Y(5))}
      <circle class="ha-dot" cx="${X(0)}" cy="${Y(1)}" r="3.5"/><circle class="ha-dot" cx="${X(5)}" cy="${Y(3)}" r="3.5"/>
      <text class="ha-label ha-label--blue" x="${X(4)}" y="${Y(1.2)}">= ?</text>
    </svg>`;
  },

  /** Bab 2.7: tiga tiang lampu — benar-benar segaris? */
  segaris() {
    const pole = (x, y) => `<path class="ha-axis" d="M${x} ${y}v-30"/><circle class="ha-dot ha-dot--amber" cx="${x}" cy="${y - 33}" r="5"/><circle class="ha-dot" cx="${x}" cy="${y}" r="3.5"/>`;
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(10, 10, 20, 14, 10)}
      <path class="ha-dash" d="M14 138L206 42"/>
      ${pole(40, 125)}${pole(110, 90)}${pole(176, 59)}
      <text class="ha-label" x="40" y="146">A</text><text class="ha-label" x="110" y="111">B</text><text class="ha-label" x="176" y="80">C</text>
      <text class="ha-label ha-label--blue" x="196" y="28">?</text>
    </svg>`;
  },

  /** Bab 2.8: jalan lurus A–B dengan halte P di dua pertiga jalan. */
  bagi() {
    const A = [24, 118]; const B = [196, 54];
    const at = (t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
    const ticks = [1 / 3, 2 / 3].map((t) => { const [x, y] = at(t); return `<circle class="ha-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5"/>`; }).join('');
    const [px, py] = at(2 / 3);
    return `<svg viewBox="0 0 220 160" aria-hidden="true">
      ${grid(10, 10, 20, 14, 10)}
      <path class="ha-route" d="M${A[0]} ${A[1]}L${B[0]} ${B[1]}"/>
      ${ticks}
      <circle class="ha-dot" cx="${A[0]}" cy="${A[1]}" r="4"/><circle class="ha-dot" cx="${B[0]}" cy="${B[1]}" r="4"/>
      <rect class="ha-bldg ha-bldg--amber" x="${(px - 14).toFixed(1)}" y="${(py - 34).toFixed(1)}" width="28" height="18" rx="3"/>
      <text class="ha-bldg-t" x="${px.toFixed(1)}" y="${(py - 22).toFixed(1)}">P?</text>
      <text class="ha-label" x="${A[0]}" y="${A[1] + 18}">A</text><text class="ha-label" x="${B[0]}" y="${B[1] - 10}">B</text>
      <text class="ha-label ha-label--amber" x="${at(1 / 3)[0].toFixed(1)}" y="${(at(1 / 3)[1] + 22).toFixed(1)}">2 bagian</text>
      <text class="ha-label ha-label--amber" x="${(at(5 / 6)[0] + 6).toFixed(1)}" y="${(at(5 / 6)[1] + 22).toFixed(1)}">1 bagian</text>
    </svg>`;
  },
};

export function hookArt(name) {
  return ART[name] ? ART[name]() : '';
}

export const HOOK_ARTS = Object.keys(ART);
