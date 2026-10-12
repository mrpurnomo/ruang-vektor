/**
 * ui/toast.js
 * Pengganti SATU-SATUNYA untuk alert(). Notifikasi non-blocking yang tidak
 * pernah mencuri fokus (aria-live="polite"), sesuai PRD §7.4.
 *
 * Toast error sengaja tampil lebih lama (5 detik) karena isinya kalimat
 * penjelas yang harus benar-benar dibaca, bukan sekadar dilirik.
 */

import { renderMixed } from '../render/katexRenderer.js';
import { icon } from './icons.js';

const DURATIONS = { info: 3500, success: 3500, warn: 4500, error: 5000 };
const MAX_VISIBLE = 2;
/** Sama dengan media query lanskap pendek di tokens.css / components.css. */
const COMPACT_QUERY = '(orientation: landscape) and (max-height: 470px)';
const COMPACT_MAX_MS = 2200;

let host = null;
const active = new Set();

/* ------------------------------------------------------------
   Penambatan toast (Fase 12, isu 5)

   Toast dulu dipusatkan ke SELURUH JENDELA. Di layar belajar itu salah
   sasaran: mata siswa sedang berada di kolom kanan (panggung), sementara
   pesannya muncul di tengah layar — yang di monitor lebar berarti
   melayang di atas panel kendali, jauh dari matriks yang baru saja ia
   sentuh. Umpan balik harus muncul dekat penyebabnya.

   Jadi toast ditambatkan ke sebuah elemen (biasanya `.ws-stage`), dan
   posisinya disalurkan ke CSS lewat dua custom property. Kalau tidak ada
   tambatan, ia kembali ke tengah jendela seperti semula.
   ------------------------------------------------------------ */
let anchorEl = null;
let anchorFrame = 0;

function applyAnchor() {
  anchorFrame = 0;
  const root = document.documentElement;

  if (!anchorEl || !document.body.contains(anchorEl)) {
    root.style.removeProperty('--toast-anchor-x');
    root.style.removeProperty('--toast-anchor-w');
    return;
  }

  const r = anchorEl.getBoundingClientRect();
  if (!r.width) return;

  /**
   * Yang diukur adalah KOTAK ISI, bukan kotak elemen.
   *
   * Kolom panggung memakai `margin-right` negatif agar scrollbar-nya
   * memeluk tepi layar (kontrak §5 butir 23), lalu mengembalikan jarak itu
   * sebagai `padding-right` di dalamnya. Kotak elemennya karena itu lebih
   * lebar daripada ruang yang benar-benar ditempati isi, dan titik tengahnya
   * bergeser ~12px ke kanan dari sumbu matriks di panggung.
   *
   * Mengurangi padding kiri-kanan membuat toast berbagi sumbu tengah yang
   * sama PERSIS dengan kartu dan matriks di dalamnya (Fase 13, isu 5).
   */
  const cs = getComputedStyle(anchorEl);
  const padLeft = parseFloat(cs.paddingLeft) || 0;
  const padRight = parseFloat(cs.paddingRight) || 0;
  const width = r.width - padLeft - padRight;
  if (width <= 0) return;

  root.style.setProperty('--toast-anchor-x', `${Math.round(r.left + padLeft + width / 2)}px`);
  root.style.setProperty('--toast-anchor-w', `${Math.round(width)}px`);
}

function scheduleAnchor() {
  if (anchorFrame) return;
  anchorFrame = requestAnimationFrame(applyAnchor);
}

/**
 * Tambatkan toast ke sebuah kolom. Panggil dengan `null` untuk
 * mengembalikannya ke tengah jendela.
 * @param {HTMLElement|null} element
 */
export function anchorToasts(element) {
  anchorEl = element || null;
  applyAnchor();
}

if (typeof window !== 'undefined') {
  // Lebar kolom berubah saat jendela diubah ukurannya atau masuk layar penuh.
  window.addEventListener('resize', scheduleAnchor);
}

/**
 * Toast kesalahan bersifat SINGLETON: hanya boleh ada satu pada satu waktu.
 * Kalau kesalahan baru muncul, yang lama langsung diganti — bukan ditumpuk,
 * supaya siswa selalu membaca satu pesan yang paling relevan.
 */
let activeError = null;

function ensureHost() {
  if (host && document.body.contains(host)) return host;
  host = document.createElement('div');
  host.className = 'toast-host';
  host.setAttribute('role', 'status');
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-atomic', 'false');
  document.body.appendChild(host);
  return host;
}

const ICON_FOR = {
  info: 'info',
  success: 'check-circle',
  warn: 'alert-triangle',
  error: 'alert-circle',
};

/**
 * Judul bawaan per tipe.
 *
 * `success` SENGAJA tanpa judul. Toast sukses dipakai untuk dua hal yang
 * berbeda register-nya: jawaban yang benar ("Tepat! $ec{AB} = B - A$") dan
 * notifikasi sistem ("Progres berhasil direset"). Judul bawaan "Tepat!"
 * membuat yang kedua terbaca aneh — seolah siswa menjawab sesuatu — dan
 * kalimat jawaban yang benar sudah membuka dirinya dengan "Tepat!".
 */
const TITLE_FOR = {
  info: null,
  success: null,
  warn: 'Perhatikan',
  error: 'Belum tepat',
};

/**
 * Tampilkan toast.
 * @param {string} message  Teks penjelas (mendukung $latex$ dan **tebal**).
 * @param {object} options  { type, title, duration }
 */
export function showToast(message, options = {}) {
  const type = options.type || 'info';
  const parent = ensureHost();

  // Kolom panggung bisa baru selesai diukur pada frame ini juga.
  applyAnchor();

  // Satu error pada satu waktu: yang lama diganti seketika.
  if (type === 'error' && activeError) {
    dismiss(activeError, true);
    activeError = null;
  }

  // Batasi jumlah toast agar layar tidak tertutup tumpukan pesan.
  while (active.size >= MAX_VISIBLE) {
    const oldest = active.values().next().value;
    dismiss(oldest, true);
  }

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');

  let title = options.title !== undefined ? options.title : TITLE_FOR[type];

  // Kalimat penjelas yang sudah DIBUKA dengan judulnya sendiri ("Belum tepat —
  // …") tidak perlu judul lagi di atasnya. Tanpa ini siswa membaca "Belum
  // tepat / Belum tepat — …": pengulangan yang membuang satu baris layar
  // dan membuat pesan terdengar seperti galat sistem.
  if (title && typeof message === 'string'
      && message.trim().toLowerCase().startsWith(String(title).toLowerCase().replace(/[!.]$/, ''))) {
    title = null;
  }

  el.innerHTML = `
    <span class="toast__icon">${icon(ICON_FOR[type] || 'info')}</span>
    <div class="toast__body">
      ${title ? `<div class="toast__title">${renderMixed(title)}</div>` : ''}
      <div>${renderMixed(message)}</div>
    </div>
  `;

  let duration = options.duration ?? DURATIONS[type] ?? 3500;
  // Lanskap pendek (740×360): ruang layar terlalu berharga — toast ramping
  // di kanan bawah dan pergi paling lambat 2,2 detik (keputusan pengguna,
  // 13 Okt 2026). Kalimat penjelas tetap utuh; hanya waktunya dipangkas.
  if (typeof matchMedia === 'function' && matchMedia(COMPACT_QUERY).matches) {
    duration = Math.min(duration, COMPACT_MAX_MS);
  }
  const timer = setTimeout(() => dismiss(el), duration);

  // SENGAJA tidak ada "tutup dengan mengetuk": toast melayang di atas bilah
  // aksi, dan selama ia bisa menerima ketukan, ketukan siswa pada tombol di
  // bawahnya (mis. "Coba Lagi") hanya menutup toast dan hilang begitu saja.
  // Toast menutup dirinya sendiri setelah `duration`; lihat components.css.

  el._timer = timer;
  parent.appendChild(el);
  active.add(el);
  if (type === 'error') activeError = el;

  return el;
}

function dismiss(el, immediate = false) {
  if (!el || !active.has(el)) return;
  active.delete(el);
  if (activeError === el) activeError = null;
  clearTimeout(el._timer);

  if (immediate) {
    el.remove();
    return;
  }

  el.dataset.closing = 'true';
  el.addEventListener('animationend', () => el.remove(), { once: true });
  // Jaring pengaman kalau animasi tidak berjalan (mis. reduced-motion).
  setTimeout(() => el.remove(), 400);
}

/** Tutup seluruh toast — dipakai saat berpindah layar. */
export function clearToasts() {
  [...active].forEach((el) => dismiss(el, true));
}

const VALID_TYPES = new Set(['info', 'success', 'warn', 'error']);

/**
 * Pintu tunggal bergaya `toast.show('error', 'Pesan')`.
 *
 * Tipe yang tidak dikenal TIDAK dilempar sebagai galat: ia dicatat di konsol
 * dan ditampilkan sebagai `info`. Umpan balik yang gagal muncul karena salah
 * ketik nama tipe lebih merugikan siswa daripada umpan balik bernada netral.
 *
 * @param {'info'|'success'|'warn'|'error'} type
 * @param {string} message  mendukung $latex$ dan **tebal**
 * @param {{title?: string, duration?: number}} [options]
 */
export function show(type, message, options = {}) {
  let safeType = type;
  if (!VALID_TYPES.has(type)) {
    console.warn(`[toast] tipe "${type}" tidak dikenal — ditampilkan sebagai info`);
    safeType = 'info';
  }
  return showToast(message, { ...options, type: safeType });
}

export const toast = {
  show,
  anchorTo: anchorToasts,
  info: (msg, opts) => showToast(msg, { ...opts, type: 'info' }),
  success: (msg, opts) => showToast(msg, { ...opts, type: 'success' }),
  warn: (msg, opts) => showToast(msg, { ...opts, type: 'warn' }),
  /**
   * Toast kesalahan. Ini jalur WAJIB setiap kali interaksi siswa ditolak —
   * indikator visual (merah/getar) tidak pernah boleh berdiri sendiri.
   */
  error: (msg, opts) => showToast(msg, { ...opts, type: 'error' }),
  clear: clearToasts,
};

export default toast;
