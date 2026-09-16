/**
 * quiz/questionBody.js
 * SATU-SATUNYA perender badan soal: konteks, data, dan pertanyaannya.
 *
 * Kenapa berkas ini ada: urutan bidang soal adalah KONTRAK (Blueprint §4.9),
 * dan sebelumnya ia ditulis ulang di tiga tempat — Mini Kuis, Ujian CBT, dan
 * mode tinjau sub-topik. Hanya Ujian CBT yang menuliskannya lengkap. Terukur
 * saat Tahap 1: Mini Kuis menampilkan "Sebuah mobil bergerak …" lalu langsung
 * lima pilihan, tanpa pernah menampilkan `after` — pertanyaannya sendiri.
 * Siswa dipaksa menebak apa yang diminta (Kontrak 9), dan soal bertabel
 * kehilangan tabelnya.
 *
 * Tiga salinan dari satu kontrak pasti menyimpang. Sekarang hanya ada satu.
 *
 *   prompt → konteks          ("Perhatikan dua vektor berikut!")
 *   table  → data tabel       (bila ada)
 *   tex    → data rumus       (bila ada)
 *   after  → PERTANYAANNYA    — sesudah data, tepat di atas pilihan
 */

import { renderMixed, renderToString } from '../core/render/katexRenderer.js';

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

/**
 * Tabel data sebagai node DOM sungguhan.
 *
 * `renderMixed()` meng-escape seluruh masukannya dan tidak mengenal sintaks
 * tabel markdown — pipa-pipanya tampil mentah. Karena itu tabel ditulis di
 * JSON sebagai DATA `{headers, rows}` dan dibangun di sini, sel demi sel.
 *
 * @param {{headers: string[], rows: Array<Array<string|number>>}} table
 */
export function renderDataTable(table) {
  const wrap = el('div', 'data-table-wrap');
  const tbl = el('table', 'data-table');

  const thead = el('thead');
  const headRow = el('tr');
  (table.headers || []).forEach((h) => headRow.appendChild(el('th', null, renderMixed(String(h)))));
  thead.appendChild(headRow);
  tbl.appendChild(thead);

  const tbody = el('tbody');
  (table.rows || []).forEach((row) => {
    const tr = el('tr');
    row.forEach((cell) => tr.appendChild(el('td', null, renderMixed(String(cell)))));
    tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);

  wrap.appendChild(tbl);
  return wrap;
}

/**
 * Tempelkan badan soal ke `card`, dalam urutan kontrak.
 *
 * @param {HTMLElement} card
 * @param {{prompt?: string, table?: object, tex?: string, after?: string}} q
 */
export function renderQuestionBody(card, q) {
  if (q.prompt) card.appendChild(el('div', 'quiz__prompt', renderMixed(q.prompt)));
  if (q.table) card.appendChild(renderDataTable(q.table));
  if (q.tex) card.appendChild(el('div', 'quiz__tex', renderToString(q.tex, { display: true })));
  if (q.after) card.appendChild(el('div', 'quiz__prompt quiz__after', renderMixed(q.after)));
}
