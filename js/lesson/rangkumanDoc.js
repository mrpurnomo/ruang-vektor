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
      const col = (side, cls) => `<div class="doc-conclude__col doc-conclude__col--${cls}"><b>${renderMixed(side.title)}</b><ul>${side.items.map((i) => `<li>${renderMixed(i)}</li>`).join('')}</ul></div>`;
      node.innerHTML = `<p class="doc-p">${renderMixed(c.definition)}</p><div class="doc-conclude__cols">${col(c.vector, 'vector')}${col(c.scalar, 'scalar')}</div>`;
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
  units.forEach((u) => {
    body.appendChild(u);
    if (overflows(body) && body.children.length > 1) {
      u.remove();
      body = newPage();
      body.appendChild(u);
    }
  });

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
