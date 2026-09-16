/**
 * quiz/quizResult.js
 * Layar hasil kuis: skor, rincian sub-topik yang lemah, dan jalur remedial
 * langsung kembali ke Mode Belajar.
 */

import { icon } from '../core/ui/icons.js';
import { renderMixed } from '../core/render/katexRenderer.js';

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

/**
 * Judul sub-topik untuk daftar "perlu diperkuat".
 *
 * Dulu berkas ini menyimpan PETA ID → JUDUL yang ditulis tangan — berisi
 * sub-topik "Ruang Matriks". Itu pengetahuan domain di dalam mesin soal
 * yang seharusnya generik (Blueprint §3.2), dan ia pasti basi begitu
 * kurikulumnya berganti. Judul kini diturunkan dari data yang sama yang
 * dibaca siswa: pemanggil mengirim `ctx.subtopicTitles`.
 *
 * Tanpa peta, ID dirapikan jadi judul yang masih terbaca — lebih baik
 * daripada menampilkan `kesamaan_vektor` mentah.
 */
function subtopicLabel(ctx, id) {
  const titles = ctx.subtopicTitles;
  if (titles instanceof Map && titles.has(id)) return titles.get(id);
  if (titles && typeof titles === 'object' && titles[id]) return titles[id];
  const words = String(id).replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Cari bab pemilik sebuah sub-topik dari manifest. */
function findChapterOf(manifest, subtopicId) {
  return manifest.chapters.find((ch) => ch.subtopicOrder.includes(subtopicId));
}

function verdict(score) {
  if (score === 100) return { title: 'Sempurna!', text: 'Semua soal kamu jawab dengan benar.', icon: 'trophy', color: 'var(--success)' };
  if (score >= 70) return { title: 'Bagus!', text: 'Sedikit lagi menuju sempurna.', icon: 'check-circle', color: 'var(--brand-primary)' };
  if (score >= 40) return { title: 'Lumayan', text: 'Beberapa konsep masih perlu diperkuat.', icon: 'target', color: 'var(--accent-amber-dark)' };
  return { title: 'Ayo Ulangi', text: 'Tidak apa-apa — ulangi materinya, kamu pasti bisa.', icon: 'refresh', color: 'var(--accent-coral-dark)' };
}

/**
 * Render layar hasil.
 * @param {object} ctx { result, manifest, onRetry, onExit, onRemedial }
 */
export function renderQuizResult(host, ctx) {
  const { result, manifest } = ctx;
  const v = verdict(result.score);

  host.innerHTML = '';
  const wrap = el('div', 'quiz anim-rise');

  const card = el('div', 'card');
  card.style.textAlign = 'center';
  card.innerHTML = `
    <div style="display:grid;place-items:center;gap:var(--sp-3)">
      <span style="color:${v.color}">${icon(v.icon, { size: 48 })}</span>
      <h2>${v.title}</h2>
      <p class="text-muted">${v.text}</p>
      <div style="font-family:var(--font-mono);font-size:var(--fs-2xl);font-weight:800;color:${v.color}">
        ${result.score}<span style="font-size:var(--fs-md);color:var(--ink-500)">/100</span>
      </div>
      <div class="badge">${result.correct} benar dari ${result.totalQuestions} soal</div>
    </div>
  `;
  wrap.appendChild(card);

  // Rincian sub-topik yang masih lemah + jalur remedial
  if (result.weakSubtopics && result.weakSubtopics.length) {
    const panel = el('div', 'panel');
    panel.style.marginTop = 'var(--sp-4)';
    panel.appendChild(el('div', 'panel__label', 'Perlu diperkuat'));

    const list = el('div', 'subtopic-list');

    result.weakSubtopics.forEach((id) => {
      const chapter = findChapterOf(manifest, id);
      const btn = el('button', 'subtopic-item');
      btn.type = 'button';
      btn.innerHTML = `
        <span class="subtopic-item__state" style="background:var(--danger-soft);color:var(--danger)">
          ${icon('refresh', { size: 15 })}
        </span>
        <span class="subtopic-item__title">
          ${subtopicLabel(ctx, id)}
          ${chapter ? `<br><span class="text-sm text-muted">Bab ${chapter.number} · ${chapter.title}</span>` : ''}
        </span>
        ${icon('chevron-right', { size: 16 })}
      `;

      if (chapter && typeof ctx.onRemedial === 'function') {
        btn.addEventListener('click', () => ctx.onRemedial(chapter.id, id));
      } else {
        btn.disabled = true;
      }

      list.appendChild(btn);
    });

    panel.appendChild(list);
    panel.appendChild(el('p', 'quiz__hint',
      'Ketuk salah satu untuk kembali mempelajari materinya.'));
    wrap.appendChild(panel);
  }

  const actions = el('div', 'actionbar');

  const exit = el('button', 'btn btn--ghost');
  exit.type = 'button';
  exit.innerHTML = `${icon('home', { size: 17 })}<span>Menu Utama</span>`;
  exit.addEventListener('click', () => ctx.onExit());
  actions.appendChild(exit);

  actions.appendChild(el('div', 'actionbar__spacer'));

  const retry = el('button', 'btn btn--primary');
  retry.type = 'button';
  retry.innerHTML = `${icon('refresh', { size: 17 })}<span>Ulangi Kuis</span>`;
  retry.addEventListener('click', () => ctx.onRetry());
  actions.appendChild(retry);

  wrap.appendChild(actions);
  host.appendChild(wrap);
}

export default renderQuizResult;
