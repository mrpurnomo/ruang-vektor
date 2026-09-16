/**
 * lesson/simulations/index.js
 * REGISTRY simulasi — titik sambung #1 dari tiga titik sambung Core ↔ Domain
 * (Blueprint §3.3).
 *
 * Data JSON menyebut engine sebagai STRING (`simulation.engine`), dan hanya
 * berkas inilah yang tahu kelas mana yang menjawab string itu. Pembaca
 * materi tidak pernah tahu engine apa saja yang ada.
 *
 * Kunci registry HARUS sama persis dengan `simulation.engine` di
 * data/chapters/*.json. Satu salah ketik menampilkan layar kosong yang
 * terlihat "sengaja" — karena itu engine yang tidak terdaftar ditangani
 * terang-terangan di bawah, bukan diam-diam.
 */

import { el } from './simCore.js';
import { icon } from '../../core/ui/icons.js';
import { renderMixed } from '../../core/render/katexRenderer.js';

/**
 * string engine → kelas turunan `Simulation`.
 *
 * Diisi bertahap di Tahap 4 Langkah 5:
 *   Bab 1 → simBasics.js   · Bab 2 → simOperations.js
 *   Bab 3 → simProducts.js · Bab 4 → simModeling.js
 */
export const SIMULATION_REGISTRY = {};

/** Daftarkan engine dari berkas bab. Dipanggil sekali per kelas. */
export function registerSimulation(key, EngineClass) {
  if (SIMULATION_REGISTRY[key] && SIMULATION_REGISTRY[key] !== EngineClass) {
    console.warn(`[sim] engine "${key}" didaftarkan ulang dengan kelas berbeda`);
  }
  SIMULATION_REGISTRY[key] = EngineClass;
}

export function isRegistered(key) {
  return Boolean(key && SIMULATION_REGISTRY[key]);
}

/**
 * Pasang satu simulasi ke `container`.
 *
 * Urutan di bawah ini adalah KONTRAK (Blueprint §4.8), bukan selera:
 * `onSlideChange`, `savedState`, `onStateChange`, dan `hintHost` dipasang
 * SEBELUM `build()`, karena `scaffold()` sudah memakainya saat itu juga.
 *
 * @param {HTMLElement} container
 * @param {{engine: string, title?: string, brief?: string, config?: object, toasts?: object}} definition
 * @param {() => void} onComplete  dipanggil saat simulasi tuntas — membuka Mini Kuis
 * @param {object} [options]
 * @returns {{ destroy(): void }}
 */
export function mountSimulation(container, definition, onComplete, options = {}) {
  const def = definition || {};
  const EngineClass = SIMULATION_REGISTRY[def.engine];

  if (!EngineClass) return mountUnavailable(container, def, onComplete, options);

  const sim = new EngineClass(container, def.config || {}, def.toasts || {}, onComplete);
  sim.hintHost = options.hintHost || null;
  sim.onSlideChange = options.onSlideChange || null;
  sim.savedState = options.resumeState ?? null;
  sim.onStateChange = options.onStateChange || null;

  try {
    sim.build();
    if (Number.isInteger(options.resumeSlide) && options.resumeSlide > 0) {
      sim.resumeToStep(options.resumeSlide);
    }
  } catch (err) {
    // Engine yang meledak saat dibangun tidak boleh menjebak siswa di layar
    // buntu. Bongkar apa pun yang sempat terpasang, lalu jatuh ke jalur
    // "belum tersedia" yang tetap membuka Mini Kuis.
    console.error(`[sim] engine "${def.engine}" gagal dibangun:`, err);
    try { sim.destroy(); } catch (_) { /* sudah rusak */ }
    container.innerHTML = '';
    return mountUnavailable(container, def, onComplete, options, true);
  }

  return sim;
}

/**
 * Jalur untuk engine yang belum ada atau gagal dibangun.
 *
 * Tidak melempar error, dan TETAP mengizinkan siswa lanjut ke Mini Kuis
 * (Blueprint §5.6): siswa tidak boleh pernah terjebak di layar buntu karena
 * kesalahan penulis data. Kalimatnya jujur tentang apa yang terjadi — bukan
 * kotak kosong yang terlihat seperti simulasi yang belum dimuat.
 */
function mountUnavailable(container, def, onComplete, options, crashed = false) {
  if (!crashed) {
    console.warn(`[sim] engine "${def.engine}" belum terdaftar di SIMULATION_REGISTRY`);
  }

  const box = el('div', 'empty-state');
  box.innerHTML = `
    <span style="color:var(--accent-amber)">${icon('info', { size: 40 })}</span>
    <h3>${crashed ? 'Simulasi gagal dimuat' : 'Simulasi sedang disiapkan'}</h3>
    <p class="text-sm">
      ${crashed
        ? 'Ada masalah saat menyiapkan simulasi ini. Kamu tetap bisa lanjut ke Mini Kuis.'
        : 'Simulasi interaktif untuk sub-topik ini belum tersedia. Kamu tetap bisa lanjut ke Mini Kuis.'}
    </p>
  `;
  container.appendChild(box);

  if (options.hintHost && def.brief) {
    // renderMixed WAJIB: argumen ketiga el() masuk sebagai innerHTML mentah,
    // dan brief memuat **tebal** serta $LaTeX$ (Blueprint §10.1 jebakan 5).
    options.hintHost.appendChild(el('div', 'sim__brief', renderMixed(def.brief)));
  }

  // Dijadwalkan, bukan dipanggil sinkron: pemanggil masih sedang memasang
  // tombol "Lanjut" yang akan diaktifkan oleh callback ini.
  let cancelled = false;
  queueMicrotask(() => { if (!cancelled) onComplete(); });

  return {
    destroy() { cancelled = true; },
  };
}
