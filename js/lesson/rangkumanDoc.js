/**
 * lesson/rangkumanDoc.js — Dokumen Rangkuman siap cetak (A4 tegak).
 *
 *   const doc = renderRangkumanDoc(host, { chapter, subtopic, number, identity });
 *   doc.print();  doc.pages;  doc.destroy();
 *
 * Revisi guru: rangkuman harus SESUAI dengan yang disimulasikan, rapi, dan
 * siap cetak/unduh A4 — diusahakan selembar, boleh dua lembar dengan
 * navigasi — lengkap dengan kepala & kaki dokumen, nama dan asal sekolah
 * siswa, serta tanda tangan siswa (opsional, dari layar masuk).
 *
 * Isi: `subtopic.rangkuman` (terstruktur, ditulis mengikuti simulasinya).
 * Sub-topik yang belum punya rangkuman terstruktur memakai `materi` lama
 * dengan tata letak dokumen yang sama.
 *
 * Lembar berukuran TETAP 794×1123 px (A4 @96 dpi). Di layar ia diperkecil
 * dengan transform di dalam bingkai berukuran-skala; saat dicetak salinan
 * lembar tanpa transform dan @page A4 membuat satu lembar = satu halaman.
 */

import { renderMixed, renderToString } from '../core/render/katexRenderer.js';
import { icon } from '../core/ui/icons.js';

const PAGE_W = 794;
const PAGE_H = 1123;

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------------------
   Gambar statis untuk dokumen (SVG murni, ramah cetak)
   ------------------------------------------------------------ */
/** Kisi + sumbu untuk gambar dokumen: rentang x/y dalam satuan, u px/satuan. */
function gridFig(xr, yr, u, pad = 16) {
  const w = (xr[1] - xr[0]) * u + pad * 2;
  const h = (yr[1] - yr[0]) * u + pad * 2;
  const X = (x) => pad + (x - xr[0]) * u;
  const Y = (y) => pad + (yr[1] - y) * u;
  let grid = '';
  for (let x = xr[0]; x <= xr[1]; x += 1) grid += `<line x1="${X(x)}" y1="${Y(yr[0])}" x2="${X(x)}" y2="${Y(yr[1])}" class="g"/>`;
  for (let y = yr[0]; y <= yr[1]; y += 1) grid += `<line x1="${X(xr[0])}" y1="${Y(y)}" x2="${X(xr[1])}" y2="${Y(y)}" class="g"/>`;
  grid += `<line class="ax" x1="${X(xr[0])}" y1="${Y(0)}" x2="${X(xr[1])}" y2="${Y(0)}"/><line class="ax" x1="${X(0)}" y1="${Y(yr[0])}" x2="${X(0)}" y2="${Y(yr[1])}"/>`;
  return { w, h, X, Y, grid };
}

/** Panah dokumen (garis + kepala segitiga) dari (x1,y1) ke (x2,y2) piksel. */
function docArrow(x1, y1, x2, y2, cls = 'v', headCls = 'vh') {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const bx = x2 - ux * 9;
  const by = y2 - uy * 9;
  const f = (n) => n.toFixed(1);
  return `<line class="${cls}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(bx)}" y2="${f(by)}"/>`
    + `<path class="${headCls}" d="M${f(x2)} ${f(y2)}L${f(bx - uy * 4.5)} ${f(by + ux * 4.5)}L${f(bx + uy * 4.5)} ${f(by - ux * 4.5)}Z"/>`;
}

const FIGURES = {
  /** O → A(7, 4): langkah +7 mendatar, +4 tegak, lalu panah OA. */
  vektor_oa() {
    const u = 26; const ox = 34; const oy = 150;
    const X = (x) => ox + x * u;
    const Y = (y) => oy - y * u;
    let grid = '';
    for (let x = -1; x <= 9; x += 1) grid += `<line x1="${X(x)}" y1="${Y(-1)}" x2="${X(x)}" y2="${Y(5)}" class="g"/>`;
    for (let y = -1; y <= 5; y += 1) grid += `<line x1="${X(-1)}" y1="${Y(y)}" x2="${X(9)}" y2="${Y(y)}" class="g"/>`;
    let hops = '';
    for (let k = 0; k < 7; k += 1) hops += `<path class="h" d="M${X(k)} ${Y(0)} Q${X(k + 0.5)} ${Y(0) - 14} ${X(k + 1)} ${Y(0)}"/>`;
    for (let k = 0; k < 4; k += 1) hops += `<path class="h" d="M${X(7)} ${Y(k)} Q${X(7) + 14} ${Y(k + 0.5)} ${X(7)} ${Y(k + 1)}"/>`;
    return `<svg class="docfig" viewBox="0 0 280 176" role="img" aria-label="Vektor OA dari O(0,0) ke A(7,4)">
      ${grid}
      <line class="ax" x1="${X(-1)}" y1="${Y(0)}" x2="${X(9) + 4}" y2="${Y(0)}"/><line class="ax" x1="${X(0)}" y1="${Y(5) - 4}" x2="${X(0)}" y2="${Y(-1)}"/>
      ${hops}
      <line class="d" x1="${X(7)}" y1="${Y(4)}" x2="${X(0)}" y2="${Y(4)}"/>
      <line class="v" x1="${X(0)}" y1="${Y(0)}" x2="${X(7) - 9}" y2="${Y(4) + 5.2}"/>
      <path class="vh" d="M${X(7)} ${Y(4)} l-12.5 1.2 4.6 7.6z"/>
      <circle class="p" cx="${X(0)}" cy="${Y(0)}" r="4.5"/><circle class="p" cx="${X(7)}" cy="${Y(4)}" r="4.5"/>
      <text x="${X(0) - 14}" y="${Y(0) + 15}" class="t">O</text>
      <text x="${X(7) + 8}" y="${Y(4) - 6}" class="t">A(7, 4)</text>
      <text x="${X(3.5) - 9}" y="${Y(0) + 17}" class="n">+7</text>
      <text x="${X(7) + 18}" y="${Y(2) + 4}" class="n">+4</text>
      <text x="${X(3) - 12}" y="${Y(2.3) - 4}" class="o">OA</text>
      <path class="oa" d="M${X(3) - 12} ${Y(2.3) - 16}h17"/><path class="vh" d="M${X(3) + 7} ${Y(2.3) - 16}l-4 -2.4v4.8z"/>
    </svg>`;
  },
  /** "4 ke kanan, 3 ke bawah": ubin î lalu −ĵ, panah a. */
  tiga_bentuk() {
    const { w, h, X, Y, grid } = gridFig([-1, 6], [-4, 1], 28);
    let tiles = '';
    for (let k = 0; k < 4; k += 1) tiles += docArrow(X(k), Y(0), X(k + 1), Y(0), 'c', 'ch');
    for (let k = 0; k < 3; k += 1) tiles += docArrow(X(4), Y(-k), X(4), Y(-k - 1), 'c', 'ch');
    return `<svg class="docfig" viewBox="0 0 ${w} ${h}" role="img" aria-label="Vektor a = 4i − 3j sebagai ubin vektor satuan">
      ${grid}${tiles}
      ${docArrow(X(0), Y(0), X(4), Y(-3))}
      <circle class="p" cx="${X(0)}" cy="${Y(0)}" r="4"/>
      <text class="t" x="${X(0) - 13}" y="${Y(0) - 5}">O</text>
      <text class="n n--c" x="${X(1.7)}" y="${Y(0) - 6}">4î</text>
      <text class="n n--c" x="${X(4) + 6}" y="${Y(-1.6)}">−3ĵ</text>
      <text class="o" x="${X(1.4)}" y="${Y(-1.9)}">a</text>
    </svg>`;
  },

  /** Vektor posisi a, b dan AB = b − a. */
  selisih_titik() {
    const { w, h, X, Y, grid } = gridFig([-1, 10], [-1, 8], 20);
    // Revisi guru: fokus ke AB — tanpa panah O→B; setiap titik berlabel
    // koordinat dan nama tempatnya.
    return `<svg class="docfig" viewBox="0 0 ${w} ${h}" role="img" aria-label="Vektor posisi a dan vektor AB dari kelas ke kantin">
      ${grid}
      ${docArrow(X(0), Y(0), X(2), Y(3), 'c', 'ch')}
      <path class="d" d="M${X(2)} ${Y(3)}H${X(8)}V${Y(7)}"/>
      ${docArrow(X(2), Y(3), X(8), Y(7))}
      <circle class="p" cx="${X(0)}" cy="${Y(0)}" r="3.5"/>
      <circle class="p" cx="${X(2)}" cy="${Y(3)}" r="4"/><circle class="p" cx="${X(8)}" cy="${Y(7)}" r="4"/>
      <text class="t" x="${X(0) + 5}" y="${Y(0) + 13}">O · Gerbang</text>
      <text class="t" x="${X(2) - 4}" y="${Y(3) + 16}">A(2, 3) · Kelas</text>
      <text class="t" x="${X(8) - 64}" y="${Y(7) - 8}">B(8, 7) · Kantin</text>
      <text class="o o--c" x="${X(0.3)}" y="${Y(2)}">a</text>
      <text class="o" x="${X(4.1)}" y="${Y(5.8)}">AB</text>
      <text class="n" x="${X(4.6)}" y="${Y(3) - 5}">+6</text>
      <text class="n" x="${X(8) + 5}" y="${Y(5)}">+4</text>
    </svg>`;
  },

  /** Persegi Pythagoras 9 + 16 = 25 pada v = (3, 4). */
  pythagoras() {
    const { w, h, X, Y, grid } = gridFig([-4, 7], [-3, 7], 16);
    const poly = (pts, cls) => `<polygon class="${cls}" points="${pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}"/>`;
    return `<svg class="docfig" viewBox="0 0 ${w} ${h}" role="img" aria-label="Persegi Pythagoras pada vektor (3, 4)">
      ${grid}
      ${poly([[0, 0], [3, 0], [3, -3], [0, -3]], 'sq')}
      ${poly([[3, 0], [7, 0], [7, 4], [3, 4]], 'sq')}
      ${poly([[0, 0], [3, 4], [-1, 7], [-4, 3]], 'sqb')}
      ${docArrow(X(0), Y(0), X(3), Y(4))}
      <text class="n n--a" x="${X(1.1)}" y="${Y(-1.7)}">9</text>
      <text class="n n--a" x="${X(4.6)}" y="${Y(1.8)}">16</text>
      <text class="n" x="${X(-0.9)}" y="${Y(3.6)}">25</text>
      <text class="o" x="${X(1.9)}" y="${Y(2.4)}">v</text>
    </svg>`;
  },

  /** v = (3, 4) dipotong 5; v̂ di lingkaran satuan. */
  satuan() {
    const { w, h, X, Y, grid } = gridFig([-2, 5], [-2, 5], 26);
    let dots = '';
    for (let k = 1; k < 5; k += 1) dots += `<circle class="dot" cx="${X(0.6 * k)}" cy="${Y(0.8 * k)}" r="2.6"/>`;
    return `<svg class="docfig" viewBox="0 0 ${w} ${h}" role="img" aria-label="Vektor (3, 4) dan vektor satuannya di lingkaran satuan">
      ${grid}
      <circle class="ring" cx="${X(0)}" cy="${Y(0)}" r="26"/>
      ${docArrow(X(0), Y(0), X(3), Y(4))}
      ${dots}
      ${docArrow(X(0), Y(0), X(0.6), Y(0.8), 'va', 'vha')}
      <text class="o" x="${X(2.1)}" y="${Y(3.2)}">v</text>
      <text class="o o--a" x="${X(0.75)}" y="${Y(0.15)}">v̂</text>
      <text class="n n--c" x="${X(-1.9)}" y="${Y(-1.3)}">r = 1</text>
    </svg>`;
  },

  /** Balok O–P(4, −3, 2) dengan diagonal lantai dan diagonal ruang. */
  balok() {
    const P = (x, y, z) => [180 + y * 30 - x * 17, 116 + x * 11 - z * 30];
    const s = (p) => p.map((n) => n.toFixed(1)).join(' ');
    const L = (a, b, cls) => `<path class="${cls}" d="M${s(P(...a))}L${s(P(...b))}"/>`;
    const c = [[0, 0, 0], [4, 0, 0], [4, -3, 0], [0, -3, 0], [0, 0, 2], [4, 0, 2], [4, -3, 2], [0, -3, 2]];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const [ox, oy] = P(0, 0, 0);
    const [px, py] = P(4, -3, 2);
    const [fx, fy] = P(4, -3, 0);
    return `<svg class="docfig" viewBox="0 0 280 202" role="img" aria-label="Balok dari O ke P(4, −3, 2)">
      ${L([0, 0, 0], [6, 0, 0], 'ax axx')}${L([0, -4.5, 0], [0, 2, 0], 'ax axy')}${L([0, 0, 0], [0, 0, 3.3], 'ax axz')}
      ${edges.map(([i, j]) => L(c[i], c[j], 'd')).join('')}
      <polygon class="sqc" points="${s(P(0, 0, 0))} ${s(P(4, 0, 0))} ${s(P(4, -3, 0))}"/>
      <polygon class="sq" points="${s(P(0, 0, 0))} ${s(P(4, -3, 0))} ${s(P(4, -3, 2))}"/>
      ${docArrow(ox, oy, px, py)}
      <circle class="p" cx="${px}" cy="${py}" r="4"/>
      <text class="t" x="${px - 10}" y="${py - 9}">P(4, −3, 2)</text>
      <text class="t" x="${ox + 6}" y="${oy + 13}">O</text>
      <text class="n n--c" x="${(ox + fx) / 2 - 4}" y="${(oy + fy) / 2 + 13}">5</text>
      <text class="n n--a" x="${fx + 5}" y="${(fy + py) / 2 + 3}">2</text>
      <text class="t tx" x="${P(6.2, 0, 0)[0] - 8}" y="${P(6.2, 0, 0)[1] + 8}">X</text>
      <text class="t ty" x="${P(0, 2.3, 0)[0]}" y="${P(0, 2.3, 0)[1] + 4}">Y</text>
      <text class="t tz" x="${P(0, 0, 3.5)[0] - 4}" y="${P(0, 0, 3.5)[1]}">Z</text>
    </svg>`;
  },
};

/* ------------------------------------------------------------
   Blok isi dokumen
   ------------------------------------------------------------ */
function block(b, ctx) {
  switch (b.t) {
    case 'p': return el('p', 'doc-p', renderMixed(b.x));
    case 'tex': return el('div', 'doc-tex', renderToString(b.x, { display: true }));
    case 'list': {
      const ul = el('ul', 'doc-list');
      b.items.forEach((it) => ul.appendChild(el('li', null, renderMixed(it))));
      return ul;
    }
    case 'steps': {
      const ol = el('ol', 'doc-steps');
      b.items.forEach((it) => ol.appendChild(el('li', null, renderMixed(it))));
      return ol;
    }
    case 'table': {
      const t = el('table', 'doc-table');
      t.innerHTML = `<thead><tr>${b.headers.map((h) => `<th>${renderMixed(h)}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${renderMixed(String(c))}</td>`).join('')}</tr>`).join('')}</tbody>`;
      return t;
    }
    case 'figure': {
      const f = el('figure', 'doc-figure');
      f.innerHTML = (FIGURES[b.key] ? FIGURES[b.key]() : '') + (b.caption ? `<figcaption>${renderMixed(b.caption)}</figcaption>` : '');
      return f;
    }
    case 'conclusion': {
      const c = ctx.subtopic.simulation && ctx.subtopic.simulation.conclusion;
      if (!c) return el('div');
      const node = el('div', 'doc-conclude');
      // Kolom bebas (`columns`) atau bentuk lama vektor/skalar (sub-topik 1).
      const cols = Array.isArray(c.columns) ? c.columns
        : [c.vector && { ...c.vector, tone: 'vector' }, c.scalar && { ...c.scalar, tone: 'scalar' }].filter(Boolean);
      const col = (side) => `<div class="doc-conclude__col doc-conclude__col--${side.tone || 'vector'}"><b>${renderMixed(side.title)}</b><ul>${side.items.map((i) => `<li>${renderMixed(i)}</li>`).join('')}</ul></div>`;
      node.innerHTML = `<p class="doc-p">${renderMixed(c.definition)}</p>`
        + (c.formula ? `<div class="doc-tex">${renderToString(c.formula, { display: true })}</div>` : '')
        + (cols.length ? `<div class="doc-conclude__cols" data-count="${cols.length}">${cols.map(col).join('')}</div>` : '');
      return node;
    }
    case 'def': case 'tip': case 'warn': {
      const box = el('div', `doc-callout doc-callout--${b.t}`);
      box.innerHTML = `${b.title ? `<b>${renderMixed(b.title)}</b> ` : ''}${renderMixed(b.x || '')}`;
      return box;
    }
    default: {
      // Blok materi lama yang tidak dikenal (carousel, typegroup): ambil teksnya.
      const text = [b.title, b.x, ...(b.items || []).map((i) => (typeof i === 'string' ? i : i.x || i.title || ''))].filter(Boolean).join(' — ');
      return text ? el('p', 'doc-p', renderMixed(text)) : el('div');
    }
  }
}

/** Bagian dokumen dari rangkuman terstruktur, atau dari materi lama. */
function sectionsOf(subtopic) {
  const r = subtopic.rangkuman;
  if (r && Array.isArray(r.sections)) return { subtitle: r.subtitle || '', sections: r.sections, notes: r.notes || [] };
  // Materi lama: setiap blok judul memulai bagian baru.
  const sections = [];
  let current = { title: 'Catatan', blocks: [] };
  (subtopic.materi || []).forEach((b) => {
    if (b.t === 'h' || b.t === 'h2' || b.t === 'h3') {
      if (current.blocks.length) sections.push(current);
      current = { title: b.x, blocks: [] };
    } else current.blocks.push(b);
  });
  if (current.blocks.length) sections.push(current);
  return { subtitle: '', sections, notes: [] };
}

/* ------------------------------------------------------------
   Lembar
   ------------------------------------------------------------ */
function sheet(ctx, { first }) {
  const { chapter, subtopic, number, identity } = ctx;
  const node = el('article', 'doc-sheet');
  const nama = identity && identity.nama ? esc(identity.nama) : '—';
  const sekolah = identity && identity.sekolah ? esc(identity.sekolah) : '—';
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  node.innerHTML = `
    <header class="doc-head">
      <div class="doc-brand">
        <span class="doc-brand__mark">${icon('arrow-up-right', { size: 22, stroke: 2.6 })}</span>
        <span class="doc-brand__text"><b>RUANG VEKTOR</b><small>Rangkuman Belajar · Matematika Tingkat Lanjut Kelas 11</small></span>
      </div>
      <div class="doc-head__meta"><b>Bab ${chapter.number} · Sub-topik ${number}</b><small>${esc(chapter.title)}</small></div>
    </header>
    <div class="doc-ident">
      <span><small>Nama</small><b>${nama}</b></span>
      <span><small>Asal sekolah</small><b>${sekolah}</b></span>
      <span><small>Tanggal</small><b>${tanggal}</b></span>
    </div>
    ${first ? `<div class="doc-title"><h1>${renderMixed(subtopic.title)}</h1><p></p></div>` : ''}
    <div class="doc-body"></div>
    <footer class="doc-foot">
      <div class="doc-sign">
        <div class="doc-sign__box">${identity && identity.ttd ? `<img src="${identity.ttd}" alt="Tanda tangan ${nama}">` : ''}</div>
        <div class="doc-sign__name"><b>${nama}</b><small>Tanda tangan siswa</small></div>
      </div>
      <div class="doc-foot__right">
        <span class="doc-foot__page"></span>
        <small>Dibuat di Ruang Vektor · © Penta Putra Purnomo, S.Pd., Gr. · SMAS YPVDP Bontang</small>
      </div>
    </footer>`;
  return node;
}

export function renderRangkumanDoc(host, ctx) {
  const root = el('div', 'doc');
  const nav = el('div', 'doc-nav');
  const stack = el('div', 'doc-stack');
  root.append(nav, stack);
  host.appendChild(root);

  const { subtitle, sections, notes } = sectionsOf(ctx.subtopic);
  const pages = [];
  const newPage = () => {
    const s = sheet(ctx, { first: pages.length === 0 });
    // Bingkai berukuran-skala + transform (bukan zoom): `zoom` ikut mengubah
    // pembungkusan baris di skala kecil sehingga lembar yang muat di 1024×600
    // meluap di 740×360 (terukur). transform tidak menyentuh tata letak —
    // isi lembar di layar IDENTIK dengan yang tercetak.
    const frame = el('div', 'doc-frame');
    frame.appendChild(s);
    stack.appendChild(frame);
    pages.push(s);
    if (pages.length === 1) s.querySelector('.doc-title p').innerHTML = renderMixed(subtitle);
    return s.querySelector('.doc-body');
  };

  // Aliran bagian: tambahkan ke lembar ini; bila meluap, pindah ke lembar baru.
  let body = newPage();
  // Luapan dibaca dari POSISI tiap unit terhadap kotak isi, bukan dari
  // scrollHeight: kontainer berkolom tidak melaporkan unit yang terpotong di
  // dasar kolom lewat scrollHeight (terukur: materi lama terpotong diam-diam).
  const overflows = (b) => {
    const box = b.getBoundingClientRect();
    return b.scrollWidth > b.clientWidth + 1 || [...b.children].some((c) => {
      const r = c.getBoundingClientRect();
      return r.bottom > box.bottom + 1 || r.right > box.right + 1;
    });
  };
  const structured = Boolean(ctx.subtopic.rangkuman && Array.isArray(ctx.subtopic.rangkuman.sections));
  const units = structured
    ? sections.map((sec) => {
      const node = el('section', 'doc-sec');
      node.appendChild(el('h2', 'doc-sec__title', renderMixed(sec.title)));
      sec.blocks.forEach((b) => node.appendChild(block(b, ctx)));
      return node;
    })
    // Materi lama: SETIAP BLOK satu unit, supaya isi panjang bisa mengalir
    // antarkolom dan antarlembar alih-alih satu bagian raksasa yang terpotong.
    : sections.flatMap((sec, i) => {
      const head = el('h2', 'doc-unit doc-unit--title', renderMixed(sec.title));
      const parts = sec.blocks.map((b) => {
        const u = el('div', 'doc-unit');
        u.appendChild(block(b, ctx));
        return u;
      });
      return i === 0 && sec.title === 'Catatan' ? parts : [head, ...parts];
    });
  if (notes.length) {
    const box = el('section', 'doc-sec doc-notes');
    box.innerHTML = `<h2 class="doc-sec__title">${icon('lightbulb', { size: 14 })} Catatan kecil</h2><ul>${notes.map((n) => `<li>${renderMixed(n)}</li>`).join('')}</ul>`;
    units.push(box);
  }
  if (structured) layoutColumns(units);
  else {
    units.forEach((u) => {
      body.appendChild(u);
      if (overflows(body) && body.children.length > 1) {
        u.remove();
        body = newPage();
        body.appendChild(u);
      }
    });
  }

  /**
   * Rangkuman terstruktur: dua kolom berurutan (kiri dulu, lalu kanan) dengan
   * setiap bagian UTUH. Kolom CSS yang diseimbangkan memotong bagian tinggi
   * di tengah — gambarnya di kiri, langkahnya di kanan tanpa judul (terukur
   * di sub-topik 2). Di sini tinggi tiap bagian diukur, lalu dicari titik
   * belah yang membuat kedua kolom muat dan setinggi mungkin seimbang;
   * sisanya pindah ke lembar berikut.
   */
  function layoutColumns(list) {
    const columnsOf = (b) => {
      b.classList.add('doc-body--cols');
      const cols = [el('div', 'doc-col'), el('div', 'doc-col')];
      b.append(...cols);
      return cols;
    };
    let cols = columnsOf(body);
    const gap = 10;
    const heights = list.map((u) => {
      cols[0].appendChild(u);
      const h = u.offsetHeight + gap;
      u.remove();
      return h;
    });
    const limit = body.clientHeight + gap;
    let start = 0;
    while (start < list.length) {
      let best = null;
      for (let end = list.length; end > start && !best; end -= 1) {
        for (let k = start; k <= end; k += 1) {
          const left = heights.slice(start, k).reduce((a, h) => a + h, 0);
          const right = heights.slice(k, end).reduce((a, h) => a + h, 0);
          if (left <= limit && right <= limit && (!best || Math.max(left, right) < best.tall)) {
            best = { k, end, tall: Math.max(left, right) };
          }
        }
      }
      // Satu bagian yang lebih tinggi dari selembar: biarkan sendiri.
      if (!best) best = { k: start + 1, end: start + 1 };
      list.slice(start, best.k).forEach((u) => cols[0].appendChild(u));
      list.slice(best.k, best.end).forEach((u) => cols[1].appendChild(u));
      start = best.end;
      if (start < list.length) {
        body = newPage();
        cols = columnsOf(body);
      }
    }
  }

  pages.forEach((p, i) => {
    p.querySelector('.doc-foot__page').textContent = `Halaman ${i + 1} dari ${pages.length}`;
  });

  // Skala tampilan: lembar 794px diperkecil agar pas lebar panggung.
  const fit = () => {
    const w = stack.clientWidth;
    if (!w) return;
    root.style.setProperty('--doc-zoom', String(Math.min(1, w / PAGE_W)));
  };
  const ro = new ResizeObserver(fit);
  ro.observe(stack);
  fit();

  // Navigasi lembar (hanya bila > 1).
  if (pages.length > 1) {
    nav.innerHTML = `<span class="doc-nav__label">Rangkuman ini ${pages.length} lembar</span>`;
    pages.forEach((p, i) => {
      const b = el('button', 'btn btn--ghost btn--sm doc-nav__go');
      b.type = 'button';
      b.innerHTML = `${icon('arrow-down', { size: 14 })}<span>Lembar ${i + 1}</span>`;
      b.addEventListener('click', () => p.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      nav.appendChild(b);
    });
  } else nav.remove();

  /** Cetak / simpan PDF: hanya lembar dokumen, tanpa kerangka aplikasi. */
  function print() {
    const printRoot = el('div', null);
    printRoot.id = 'print-root';
    pages.forEach((p) => printRoot.appendChild(p.cloneNode(true)));
    document.body.appendChild(printRoot);
    document.documentElement.classList.add('is-printing');
    const done = () => {
      document.documentElement.classList.remove('is-printing');
      printRoot.remove();
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
    // Peramban yang tidak memancarkan afterprint: bersihkan sesudah dialog.
    setTimeout(() => { if (printRoot.isConnected && !matchMedia('print').matches) done(); }, 1500);
  }

  return {
    pages,
    print,
    destroy() {
      ro.disconnect();
      root.remove();
    },
  };
}

export default { renderRangkumanDoc };
