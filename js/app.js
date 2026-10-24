/**
 * app.js — Entry point "Ruang Vektor".
 * Memuat manifest, memasang rute, dan merender tiap layar.
 *
 * Urutan boot (lihat `boot()` di dasar berkas):
 *   1. pustaka pihak ketiga sudah dieksekusi (skrip sinkron di index.html)
 *   2. init(): langganan progres, sesi, layar penuh, navigasi, rute, manifest
 *   3. router.start() merender layar pertama
 *   4. revealApp() di `finally` — layar muat SELALU turun, berhasil atau gagal
 */

import * as router from './core/router.js';
import { icon } from './core/ui/icons.js';
import toast, { clearToasts, anchorToasts } from './core/ui/toast.js';
import { showModal, confirmAction } from './core/ui/modal.js';
import { renderMixed } from './core/render/katexRenderer.js';
import { LessonView } from './lesson/lessonRenderer.js';
import { QuizEngine } from './quiz/quizEngine.js';
import { ExamEngine } from './quiz/examEngine.js';
import { renderQuizResult } from './quiz/quizResult.js';
import {
  touchSession, getOverallProgress, getChapterProgress, getSubtopicProgress,
  isSubtopicUnlocked, getLastVisited, saveQuizResult, getQuizHistory, getState,
  isStorageAvailable, resetAll, subscribe as subscribeProgress,
} from './core/state/progressStore.js';
import { quizKey, clearAllResume } from './core/state/sessionState.js';
import { attachMathpad, closeMathpad } from './core/ui/mathpad.js';
import { killAllMotion } from './core/interactions/motion.js';
import sfx from './core/ui/sfx.js';

/* ------------------------------------------------------------
   State aplikasi
   ------------------------------------------------------------ */
const state = {
  manifest: null,
  chapters: new Map(),   // cache konten bab (lazy-load per bab)
  quizzes: null,
  activeView: null,
};

const screenHost = document.getElementById('screen-host');

/* ------------------------------------------------------------
   Identitas siswa

   Disimpan di localStorage (sejak Fase 14), bukan sessionStorage.
   Alasannya lapangan: sessionStorage hanya hidup di SATU tab. Siswa yang
   tidak sengaja menyegarkan halaman — atau membuka tautan di tab baru —
   dilempar kembali ke layar masuk dan harus mengetik namanya lagi lewat
   papan huruf. Di jaringan sekolah yang lambat itu terasa seperti aplikasi
   yang kehilangan pekerjaannya.

   Konsekuensinya diakui dan ditangani: perangkat kelas yang dipakai
   bergantian kini MENGINGAT siswa pertama sampai ada yang menggantinya.
   Karena itu tombol "Ganti Akun" di menu utama BUKAN pelengkap — ia
   syarat supaya keputusan ini aman. Jangan hapus salah satunya tanpa
   yang lain.
   ------------------------------------------------------------ */
const IDENTITY_KEY = 'vektorLab.identity.v1';

/** Penyimpanan identitas; null kalau peramban memblokirnya (mode privat). */
function identityStore() {
  try {
    const s = window.localStorage;
    const probe = `${IDENTITY_KEY}.probe`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch (err) {
    return null;
  }
}

function getIdentity() {
  const store = identityStore();
  if (!store) return null;
  try {
    const raw = store.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && data.nama ? data : null;
  } catch (err) {
    return null;
  }
}

function setIdentity(identity) {
  const store = identityStore();
  if (!store) {
    console.warn('[app] penyimpanan diblokir — identitas tidak bisa disimpan');
    return;
  }
  try {
    store.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch (err) {
    console.warn('[app] identitas gagal disimpan:', err);
  }
}

/**
 * Lupakan siswa yang sedang masuk.
 *
 * Yang dihapus HANYA identitas dan posisi belajarnya. Pencapaian di
 * `progressStore` sengaja DIBIARKAN: ia milik perangkat, bukan milik satu
 * siswa, dan menghapusnya diam-diam setiap pergantian akun akan membuang
 * pekerjaan seisi kelas. Menghapus progres punya pintunya sendiri
 * ("Reset Progres") yang meminta konfirmasi terpisah.
 */
function clearIdentity() {
  const store = identityStore();
  try {
    if (store) store.removeItem(IDENTITY_KEY);
  } catch (err) {
    console.warn('[app] identitas gagal dihapus:', err);
  }
  // Posisi terakhir milik siswa sebelumnya tidak boleh diwarisi.
  clearAllResume();
}

/** Nama panggilan: kata pertama saja, agar sapaan tetap ringkas. */
function firstName(nama) {
  return String(nama || '').trim().split(/\s+/)[0] || 'Siswa';
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

/* ------------------------------------------------------------
   KARTU BAB PREMIUM — dipakai daftar bab & menu kuis
   ------------------------------------------------------------ */

/**
 * Sketsa konsep tiap bab (viewBox 72×52, garis = currentColor = aksen bab).
 * Ilustrasi, bukan soal: tidak ada angka, tidak ada jawaban.
 */
const CHAPTER_ART = {
  // Bab 1 — satu panah dari titik asal di atas sumbu.
  1: '<path class="art-grid" d="M8 46H66M8 46V6"/><path d="M8 46 50 16"/><path class="art-head" d="M50 16l-9.5 2 5.6 5.4z"/><circle cx="8" cy="46" r="2.6" class="art-dot"/>',
  // Bab 2 — aturan segitiga: a, lalu b dari ujung a, resultan putus-putus.
  2: '<path d="M8 42 34 20"/><path class="art-head" d="M34 20l-9.4 1.6 5.2 5.7z"/><path d="M34 20 62 34"/><path class="art-head" d="M62 34l-6.5-7-2.6 7.1z"/><path class="art-dash" d="M8 42 62 34"/>',
  // Bab 3 — dua vektor, proyeksi tegak lurus, penanda siku.
  3: '<path d="M8 44H62"/><path class="art-head" d="M62 44l-8.5-4v8z"/><path d="M8 44 44 12"/><path class="art-head" d="M44 12l-9 2.2 5.5 5.6z"/><path class="art-dash" d="M44 12V44"/><path class="art-thin" d="M44 38h-6v6"/>',
  // Bab 4 — kubus isometrik dengan diagonal ruang.
  4: '<path class="art-thin" d="M14 18 34 8 58 16 38 26z"/><path class="art-thin" d="M14 18v22l24 8V26M58 16v22l-20 10"/><path class="art-dash" d="M14 40 34 30 58 38M34 8v22"/><path d="M14 40 58 16"/><path class="art-head" d="M58 16l-9.6 1.4 4.6 6.1z"/>',
  tka: '<path class="art-grid" d="M8 46H66"/><rect x="12" y="30" width="9" height="16" rx="1.5"/><rect x="27" y="20" width="9" height="26" rx="1.5"/><rect x="42" y="10" width="9" height="36" rx="1.5"/><path class="art-dash" d="M10 26 30 14 50 6"/>',
};

function chapterArt(key) {
  const body = CHAPTER_ART[key] || CHAPTER_ART[1];
  return `<svg class="chapter-card__art" viewBox="0 0 72 52" aria-hidden="true">${body}</svg>`;
}

/**
 * Satu kartu bab. `foot` = HTML baris bawah (capaian / jumlah soal), `done`
 * menandai bab tuntas. Aksen datang dari --ch-{nomor} (tokens.css).
 */
function chapterCard({ key, number, badgeLabel = 'Bab', badgeValue, title, tag, foot, done = false, feature = false }) {
  const card = el('button', `chapter-card${done ? ' chapter-card--done' : ''}${feature ? ' chapter-card--feature' : ''}`);
  card.type = 'button';
  card.style.setProperty('--ch', key === 'tka' ? 'var(--amber-700)' : `var(--ch-${number})`);
  card.innerHTML = `
    <span class="chapter-card__badge" aria-hidden="true">
      <span class="chapter-card__badge-label">${badgeLabel}</span>
      <span class="chapter-card__badge-value">${badgeValue}</span>
    </span>
    <span class="chapter-card__body">
      <span class="chapter-card__title">${title}${done ? `<span class="chapter-card__done">${icon('trophy', { size: 13 })}Tuntas</span>` : ''}</span>
      <span class="chapter-card__tag">${tag}</span>
    </span>
    ${chapterArt(key)}
    <span class="chapter-card__foot">${foot}<span class="chapter-card__go">${icon('arrow-right', { size: 16 })}</span></span>`;
  return card;
}

/** Bilah capaian beraksen bab + teks hitungannya. */
function chapterProgressFoot(progress, unit = 'sub-topik') {
  return `<span class="chapter-card__count"><b>${progress.completed}</b>/${progress.total} ${unit}</span>
    <span class="chapter-card__bar" role="presentation"><i style="width:${progress.percent}%"></i></span>`;
}

/* ------------------------------------------------------------
   Pemuatan data
   ------------------------------------------------------------ */
async function fetchJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Gagal memuat ${path} (${res.status})`);
  return res.json();
}

async function loadManifest() {
  if (state.manifest) return state.manifest;
  state.manifest = await fetchJSON('data/lessons.json');
  return state.manifest;
}

/** Lazy-load: konten bab hanya diambil saat benar-benar dibuka. */
async function loadChapter(chapterId) {
  if (state.chapters.has(chapterId)) return state.chapters.get(chapterId);

  const meta = state.manifest.chapters.find((c) => c.id === chapterId);
  if (!meta) throw new Error(`Bab "${chapterId}" tidak ditemukan`);

  const data = await fetchJSON(meta.src);
  state.chapters.set(chapterId, data);
  return data;
}

async function loadQuizzes() {
  if (state.quizzes) return state.quizzes;
  state.quizzes = await fetchJSON('data/quizzes.json');
  return state.quizzes;
}

/* ------------------------------------------------------------
   Kerangka layar
   ------------------------------------------------------------ */
function mountScreen(builder, { isBack = false } = {}) {
  clearToasts();

  /**
   * Papan angka hidup di `document.body`, bukan di dalam layar — jadi
   * berpindah layar TIDAK membongkarnya, dan ia akan mengambang di atas
   * layar berikutnya. Ditutup di sini, dan ditutup dengan MENYIMPAN:
   * angka yang sudah diketik siswa tidak boleh hilang hanya karena
   * layarnya berganti.
   */
  closeMathpad();

  // Tambatan toast milik layar sebelumnya ikut dilepas; layar yang punya
  // kolom panggung akan memasangnya kembali saat ia dirender.
  anchorToasts(null);

  if (state.activeView && typeof state.activeView.destroy === 'function') {
    state.activeView.destroy();
    state.activeView = null;
  }

  // Membuang HTML layar TIDAK menghentikan animasinya. Timeline GSAP hidup di
  // objek global, dan chip terbang menempel di `document.body` — keduanya
  // selamat dari baris di bawah lalu terus berjalan di latar. Karena itu
  // pembunuhannya harus mendahului pembongkaran (Fase 11, isu 5).
  killAllMotion();

  screenHost.innerHTML = '';

  const screen = el('div', `screen ${isBack ? 'screen--enter-back' : 'screen--enter'}`);
  const container = el('div', 'container');
  screen.appendChild(container);
  screenHost.appendChild(screen);

  builder(container);
  updateHeader();
}

function showLoading(container, message = 'Memuat…') {
  container.innerHTML = `
    <div class="empty-state">
      <div class="skeleton" style="width:220px;height:18px"></div>
      <p class="text-sm">${message}</p>
    </div>
  `;
}

function showError(container, error) {
  console.error(error);
  container.innerHTML = `
    <div class="empty-state">
      <span style="color:var(--danger)">${icon('alert-circle', { size: 44 })}</span>
      <h3>Konten gagal dimuat</h3>
      <p class="text-sm">${error.message}</p>
      <p class="text-sm text-muted">
        Pastikan aplikasi dijalankan lewat server lokal (bukan dibuka langsung
        sebagai file), karena browser memblokir <code>fetch</code> pada protokol <code>file://</code>.
      </p>
    </div>
  `;
}

/* ------------------------------------------------------------
   Header: progress ring
   ------------------------------------------------------------ */
function updateHeader() {
  // LAPIS 2 dari penjaga masuk (isu 4): di layar masuk, tombol rumah dan
  // cincin progres tidak punya makna — yang satu melompati perkenalan, yang
  // lain melaporkan progres siswa yang belum diketahui siapa. Keduanya
  // disembunyikan DAN dimatikan, bukan sekadar diredupkan.
  const onLogin = router.getCurrentPath() === 'login';
  document.body.classList.toggle('is-login-screen', onLogin);

  const homeBtn = document.querySelector('[data-role="home"]');
  if (homeBtn) {
    homeBtn.disabled = onLogin;
    homeBtn.setAttribute('aria-hidden', String(onLogin));
    homeBtn.tabIndex = onLogin ? -1 : 0;
  }

  syncNavrail(onLogin);
  updateProgressRing();
}

/**
 * Cincin progres di header.
 *
 * Dipisah dari `updateHeader()` karena ia punya DUA pemicu: perpindahan
 * layar, dan setiap penulisan ke `progressStore` (lewat `subscribe`).
 * Pemicu kedua itulah yang membuat angkanya naik PADA SAAT Mini Kuis
 * dituntaskan, bukan setelah siswa kembali ke menu.
 */
function updateProgressRing() {
  if (!state.manifest) return;

  const overall = getOverallProgress(state.manifest);
  const ring = document.querySelector('.progress-ring__bar');
  const label = document.querySelector('.progress-ring__label');

  if (ring) {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    ring.style.strokeDasharray = String(circumference);
    ring.style.strokeDashoffset = String(circumference * (1 - overall.percent / 100));
  }
  if (label) label.textContent = `${overall.percent}%`;

  const holder = document.querySelector('.progress-ring');
  if (holder) {
    holder.setAttribute('aria-label',
      `Penguasaan kurikulum ${overall.percent}% — ${overall.completed} dari ${overall.total} sub-topik tuntas`);
  }
}

/* ------------------------------------------------------------
   Navigasi utama (header)

   Dua tujuan: Belajar dan Latihan TKA. Status aktifnya DIHITUNG dari rute
   yang sedang tampil, tidak disimpan — sama seperti kunci sub-topik
   (Blueprint §4.3). Menyimpannya sebagai state terpisah menciptakan dua
   sumber kebenaran yang bisa saling bertentangan, dan tombol Back peramban
   akan menampilkan tab yang salah.
   ------------------------------------------------------------ */
const NAV_TARGETS = {
  belajar: { path: 'belajar', owns: (p) => p === 'belajar' || p.startsWith('belajar/') },
  tka: { path: 'kuis', owns: (p) => p === 'kuis' || p.startsWith('kuis/') || p === 'tka' },
};

function syncNavrail(onLogin) {
  const current = router.getCurrentPath();
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    const target = NAV_TARGETS[btn.dataset.nav];
    const active = Boolean(target && target.owns(current));
    btn.setAttribute('aria-current', active ? 'page' : 'false');
    // Lapis 2 penjaga masuk — sama dengan tombol rumah: di layar masuk,
    // navigasi dikeluarkan dari urutan tab DAN dimatikan, bukan diredupkan.
    btn.disabled = onLogin;
    btn.tabIndex = onLogin ? -1 : 0;
  });
}

function initNavrail() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = NAV_TARGETS[btn.dataset.nav];
      if (!target) return;
      if (!getIdentity()) {
        toast.info('Isi dulu nama dan asal sekolahmu untuk masuk.');
        return;
      }
      // Tab yang sudah aktif, diketuk di akarnya sendiri: tidak memuat ulang
      // apa pun. Diketuk dari halaman dalamnya (mis. dari sebuah sub-topik):
      // kembali ke akar tab itu — perilaku tab yang lazim.
      if (router.getCurrentPath() === target.path) return;
      router.navigate(target.path);
    });
  });
}

/* ------------------------------------------------------------
   Layar: Masuk
   Dua isian, keduanya lewat papan huruf kustom — keyboard OS tidak
   pernah muncul di aplikasi ini, termasuk untuk teks.
   ------------------------------------------------------------ */
function renderLogin(params, options) {
  mountScreen((container) => {
    container.classList.add('login');

    const card = el('div', 'login__card anim-rise');

    card.appendChild(el('span', 'login__mark', icon('arrow-up-right', { size: 30 })));
    card.appendChild(el('div', 'login__eyebrow', 'Ruang Vektor'));
    card.appendChild(el('h1', 'login__title', 'Selamat Datang'));
    card.appendChild(el('p', 'login__lead',
      'Lengkapi identitas Anda untuk memulai sesi belajar.'));

    const fields = el('div', 'login__fields');

    const makeField = (label, placeholder, name) => {
      const wrap = el('div', 'login__field');
      const id = `login-${name}`;

      const lbl = el('label', 'login__label', label);
      lbl.setAttribute('for', id);

      const input = document.createElement('input');
      input.id = id;
      input.className = 'login__input';
      input.placeholder = placeholder;
      input.setAttribute('aria-label', label);
      attachMathpad(input, { mode: 'text' });

      wrap.append(lbl, input);
      fields.appendChild(wrap);
      return input;
    };

    const namaInput = makeField('Nama', 'Ketuk untuk mengisi', 'nama');
    const sekolahInput = makeField('Asal Sekolah', 'Ketuk untuk mengisi', 'sekolah');

    card.appendChild(fields);

    const submit = el('button', 'btn btn--primary btn--lg login__submit');
    submit.type = 'button';
    submit.innerHTML = `<span>Mulai Belajar</span>${icon('arrow-right', { size: 18 })}`;

    submit.addEventListener('click', () => {
      const nama = namaInput.value.trim();
      const sekolah = sekolahInput.value.trim();

      // Penolakan SELALU menjelaskan apa yang kurang, dan menunjuk fieldnya.
      if (!nama) {
        namaInput.classList.add('is-invalid');
        setTimeout(() => namaInput.classList.remove('is-invalid'), 1200);
        toast.error('Namamu belum diisi — ketuk kolom Nama untuk membuka papan huruf.');
        return;
      }
      if (!sekolah) {
        sekolahInput.classList.add('is-invalid');
        setTimeout(() => sekolahInput.classList.remove('is-invalid'), 1200);
        toast.error('Asal sekolah belum diisi — ketuk kolomnya untuk membuka papan huruf.');
        return;
      }

      setIdentity({ nama, sekolah, at: Date.now() });
      toast.success(`Selamat belajar, ${firstName(nama)}!`);
      router.navigate('');
    });

    card.appendChild(submit);

    const note = el('div', 'login__note');
    note.innerHTML = `${icon('info', { size: 14 })}<span>Datamu hanya tersimpan di perangkat ini selama sesi belajar.</span>`;
    card.appendChild(note);

    container.appendChild(card);
  }, options);
}

/* ------------------------------------------------------------
   Rute: #/tka

   Dulu layar "segera hadir". Bank `tka_2026` kini ada di quizzes.json, jadi
   rute ini hanyalah alamat pendek yang mudah diingat guru untuk langsung
   membuka ujiannya. Pengalihannya memakai `replace` supaya tombol Back tidak
   memantul kembali ke alamat pendek ini selamanya (Blueprint §4.2 butir 2).
   ------------------------------------------------------------ */
function renderTka() {
  router.navigate('kuis/simulasi_tka/all', { replace: true });
}

/**
 * Keluar dari identitas yang tersimpan, lalu kembali ke layar masuk.
 *
 * Dikonfirmasi lebih dulu lewat `modal.js` (kontrak §5 butir 1 melarang
 * `confirm()` bawaan). Konfirmasinya bukan basa-basi: di tablet kelas,
 * salah sentuh akan melempar siswa keluar di tengah pengerjaan, dan satu
 * ketukan tambahan jauh lebih murah daripada mengetik ulang nama lewat
 * papan huruf.
 */
async function switchAccount(identity) {
  const ok = await confirmAction({
    title: 'Ganti akun?',
    // Tebalnya ditulis **markdown**, bukan <b>: `renderMixed()` meng-escape
    // seluruh masukannya, jadi tag HTML akan tampil mentah sebagai teks.
    body: `Kamu akan keluar dari **${firstName(identity.nama)}** dan kembali ke layar masuk. `
      + 'Pencapaian yang sudah tersimpan di perangkat ini **tidak** dihapus.',
    confirmLabel: 'Ya, Ganti Akun',
    cancelLabel: 'Batal',
    icon: 'refresh',
  });
  if (!ok) return;

  clearIdentity();
  toast.info('Sampai jumpa! Silakan masuk dengan nama yang baru.');

  // Penjaga rute akan menahan rute mana pun tanpa identitas, jadi cukup
  // arahkan ke layar masuk dan biarkan ia bekerja.
  router.navigate('login');
}

/* ------------------------------------------------------------
   Layar: Main Menu
   ------------------------------------------------------------ */
const MODE_CARDS = [
  {
    id: 'belajar', title: 'Belajar', icon: 'book', variant: 'primary',
    desc: 'Materi Bab 1–4 dengan simulasi interaktif dan mini kuis di tiap sub-topik.',
    meta: 'Jalur terstruktur', href: 'belajar',
  },
  {
    id: 'kuis', title: 'Kuis', icon: 'puzzle', variant: 'coral',
    desc: 'Latihan soal per bab untuk menguji pemahamanmu setelah belajar.',
    meta: 'Uji pemahaman', href: 'kuis',
  },
];

/* Latihan Soal TKA sengaja TIDAK ada di deretan kartu ini. Pintu masuknya cukup
   satu — tombol di panel Pencapaianmu — supaya siswa tidak melihat dua jalan
   menuju layar yang sama. */

/** Ambil kalimat pembuka materi sebagai cuplikan untuk hero. */
function snippetOf(subtopic) {
  const first = (subtopic.materi || []).find((b) => b.t === 'p' || b.t === 'def');
  if (!first) return 'Buka sub-topik ini untuk melanjutkan belajarmu.';
  return first.x;
}

async function renderMenu(params, options) {
  mountScreen(async (container) => {
    showLoading(container);

    try {
      await loadManifest();
    } catch (err) {
      return showError(container, err);
    }

    container.innerHTML = '';
    container.classList.add('menu');

    const overall = getOverallProgress(state.manifest);
    const profile = getState().profile;

    const identity = getIdentity();

    const head = el('div', 'menu__head');

    if (identity) {
      const greet = el('span', 'menu__greet');
      greet.innerHTML = `${icon('check-circle', { size: 14 })}<span>${identity.sekolah}</span>`;
      head.appendChild(greet);
    } else {
      head.appendChild(el('div', 'menu__eyebrow', 'Matematika Tingkat Lanjut - Kelas 11'));
    }

    const title = el('h1', 'menu__title', identity
      ? `Halo, ${firstName(identity.nama)}.`
      : (overall.completed > 0 ? 'Selamat datang kembali.' : 'Ruang Vektor'));

    if (identity) {
      /**
       * Jalan keluar dari identitas yang menempel.
       *
       * Sejak identitas pindah ke localStorage (Fase 14), perangkat kelas
       * yang dipakai bergantian akan terus menyapa siswa PERTAMA sampai ada
       * yang menggantinya. Tombol ini karena itu bukan pelengkap — ia yang
       * membuat keputusan localStorage aman dipakai bersama.
       *
       * Letaknya menempel pada sapaan nama, karena di situlah siswa
       * berikutnya menyadari "ini bukan saya".
       */
      const row = el('div', 'menu__identity');
      row.appendChild(title);

      const swap = el('button', 'btn--switch');
      swap.type = 'button';
      swap.innerHTML = `${icon('refresh', { size: 14 })}<span>Ganti Akun</span>`;
      swap.setAttribute('aria-label',
        `Keluar dari akun ${firstName(identity.nama)} dan masuk sebagai siswa lain`);
      swap.title = 'Keluar dan masuk sebagai siswa lain';
      swap.addEventListener('click', () => switchAccount(identity));

      row.appendChild(swap);
      head.appendChild(row);
    } else {
      head.appendChild(title);
    }
    head.appendChild(el('p', 'menu__lead',
      'Arah dan besar — kamu yang menghitungnya, bukan aplikasinya.'));
    container.appendChild(head);

    /* ---------- HERO: dua panel ala Learnara ---------- */
    const hero = el('div', 'hero');

    // Panel kiri: lanjutkan / mulai belajar, lengkap dengan cuplikan materi
    const last = getLastVisited();
    let heroChapter = null;
    let heroSub = null;

    try {
      const targetChapter = last ? last.chapter : state.manifest.chapters[0].id;
      const targetSub = last ? last.subtopic : state.manifest.chapters[0].subtopicOrder[0];
      heroChapter = state.manifest.chapters.find((c) => c.id === targetChapter);
      const chapterData = await loadChapter(targetChapter);
      heroSub = chapterData.subtopics.find((s) => s.id === targetSub);
    } catch (err) {
      console.warn('[app] gagal memuat hero:', err);
    }

    if (heroChapter && heroSub) {
      const chProgress = getChapterProgress(heroChapter.id, heroChapter.subtopicOrder);
      const subIndex = heroChapter.subtopicOrder.indexOf(heroSub.id) + 1;

      const panel = el('div', 'hero__panel');
      panel.style.setProperty('--ch', `var(--ch-${heroChapter.number})`);
      panel.innerHTML = `
        ${chapterArt(heroChapter.number).replace('chapter-card__art', 'hero__art')}
        <div class="hero__eyebrow">${last ? 'Lanjutkan Belajar' : 'Mulai Dari Sini'}</div>
        <h2 class="hero__title">${renderMixed(heroSub.title)}</h2>
        <div class="hero__meta">
          <span class="badge badge--primary">Bab ${heroChapter.number}</span>
          <span>${heroChapter.title}</span>
          <span>·</span>
          <span>Sub-topik ${subIndex} dari ${heroChapter.subtopicOrder.length}</span>
        </div>
        <div class="hero__snippet">${renderMixed(snippetOf(heroSub))}</div>
        <div>
          <div class="hero__progress-label">
            <span>Progres Bab ${heroChapter.number}</span>
            <span>${chProgress.completed}/${chProgress.total}</span>
          </div>
          <div class="progressbar"><div class="progressbar__fill" style="width:${chProgress.percent}%"></div></div>
        </div>
      `;

      const actions = el('div', 'hero__actions');

      const go = el('button', 'btn btn--primary btn--lg');
      go.type = 'button';
      go.innerHTML = `${icon('play', { size: 18 })}<span>${last ? 'Lanjutkan' : 'Mulai Pelajaran'}</span>`;
      go.addEventListener('click', () => router.navigate(`belajar/${heroChapter.id}/${heroSub.id}`));
      actions.appendChild(go);

      const seePath = el('button', 'btn btn--ghost btn--lg');
      seePath.type = 'button';
      seePath.innerHTML = `${icon('layers', { size: 18 })}<span>Lihat Semua Bab</span>`;
      seePath.addEventListener('click', () => router.navigate('belajar'));
      actions.appendChild(seePath);

      panel.appendChild(actions);
      hero.appendChild(panel);
    }

    // Panel kanan: ringkasan pencapaian
    const stats = el('div', 'hero__panel hero__panel--next');
    stats.innerHTML = `<div class="hero__eyebrow">Pencapaianmu</div>`;

    const statGrid = el('div', 'hero__stats');
    [
      { value: `${overall.percent}%`, label: 'Kurikulum dikuasai', color: 'var(--brand-primary)' },
      { value: `${overall.completed}/${overall.total}`, label: 'Sub-topik selesai', color: 'var(--success)' },
      /**
       * Dulu di sini ada "N Lencana terbuka" — dan itu MENIPU: sistem
       * lencananya tidak pernah ada. `unlockBadge()` memang menyimpan
       * penanda, tetapi tidak ada satu pun layar yang menampilkan lencana,
       * menjelaskan apa artinya, atau bisa dibuka siswa dengan sengaja.
       * Angka yang tidak bisa ditelusuri lebih buruk daripada tidak ada
       * angka sama sekali.
       *
       * Gantinya angka yang benar-benar berarti dan bisa dikejar: nilai
       * TERBAIK dari seluruh percobaan Latihan Soal TKA.
       */
      { value: skorTkaTertinggi(), label: 'Skor TKA tertinggi', color: 'var(--accent-amber)', empty: 'Belum ada skor' },
    ].forEach((s) => {
      const box = el('div', 'hero-stat');
      box.style.setProperty('--stat-color', s.color);
      // "Belum ada" dulu memakai fon ANGKA mono berukuran besar dan terbaca
      // renggang ("Belum   ada"). Keadaan kosong adalah kalimat, bukan nilai.
      const value = s.value === null
        ? `<div class="hero-stat__value hero-stat__value--empty">${s.empty}</div>`
        : `<div class="hero-stat__value">${s.value}</div>`;
      box.innerHTML = `${value}<div class="hero-stat__label">${s.label}</div>`;
      statGrid.appendChild(box);
    });

    stats.appendChild(statGrid);

    const statActions = el('div', 'hero__actions');
    const toQuiz = el('button', 'btn btn--amber btn--lg');
    toQuiz.type = 'button';
    toQuiz.innerHTML = `${icon('trophy', { size: 18 })}<span>Latihan Soal TKA</span>`;
    toQuiz.addEventListener('click', () => router.navigate('kuis/simulasi_tka/all'));
    statActions.appendChild(toQuiz);
    stats.appendChild(statActions);

    hero.appendChild(stats);
    container.appendChild(hero);

    const grid = el('div', 'menu__grid stagger');
    // Lencana status berkontras tinggi: angka yang bisa ditelusuri siswa.
    const best = skorTkaTertinggi();
    const statusOf = {
      belajar: `${overall.completed}/${overall.total} sub-topik`,
      kuis: best === null ? '4 bab + TKA' : `TKA terbaik ${best}`,
    };
    MODE_CARDS.forEach((card) => {
      const node = el('button', `mode-card mode-card--${card.variant}`);
      node.type = 'button';
      node.dataset.sheet = `LEMBAR 0${MODE_CARDS.indexOf(card) + 1}`;
      node.innerHTML = `
        <span class="mode-card__icon">${icon(card.icon, { size: 26 })}</span>
        <span class="mode-card__title">${card.title}<span class="mode-card__status">${statusOf[card.id]}</span></span>
        <span class="mode-card__desc">${card.desc}</span>
        <span class="mode-card__meta">${card.meta} ${icon('arrow-right', { size: 15 })}</span>
      `;
      node.addEventListener('click', () => router.navigate(card.href));
      grid.appendChild(node);
    });
    container.appendChild(grid);

    // Peringatan bila localStorage tidak tersedia (mode privat/penyimpanan penuh).
    if (!isStorageAvailable()) {
      container.appendChild(el('div', 'callout callout--warn',
        `<span class="callout__icon">${icon('alert-triangle')}</span>
         <div class="callout__body">
           <div class="callout__title">Progres tidak bisa disimpan</div>
           <div class="callout__text">Browser memblokir penyimpanan lokal, jadi kemajuan belajarmu tidak akan tersimpan setelah tab ditutup.</div>
         </div>`));
    }

    // Baris aksi bawah memakai kelasnya sendiri supaya bisa dirapatkan di
    // lanskap pendek — gaya sebaris tidak bisa mengikuti media query.
    const footer = el('div', 'menu__footer');

    const resetBtn = el('button', 'btn btn--danger btn--sm');
    resetBtn.type = 'button';
    resetBtn.innerHTML = `${icon('trash', { size: 15 })}<span>Reset Progres</span>`;
    resetBtn.addEventListener('click', async () => {
      // Modal kustom, bukan confirm() bawaan.
      const ok = await confirmAction({
        title: 'Reset seluruh progres?',
        body: 'Semua kemajuan belajar dan riwayat kuis akan **dihapus permanen**. Tindakan ini tidak bisa dibatalkan.',
        confirmLabel: 'Ya, Hapus Semua Progres',
        cancelLabel: 'Batal, Simpan Progres Saya',
        variant: 'danger',
        icon: 'alert-triangle',
      });
      if (ok) {
        resetAll();
        // Reset progres juga membuang ingatan posisi — kalau tidak, siswa
        // dengan progres kosong tetap mendarat di tengah sub-topik.
        clearAllResume();
        // Siswa sudah berada di rute menu, jadi navigate('') maupun resolve()
        // tidak memicu apa pun — router mengabaikan hash yang sama. refresh()
        // adalah jalur eksplisit untuk menggambar ulang layar yang sedang
        // tampil. Dulu navigate() + renderMenu() dipanggil berdampingan, dan
        // dua pemasangan layar saling membongkar.
        router.refresh();
        // Toast SESUDAH refresh: mountScreen() membersihkan semua toast, jadi
        // konfirmasi yang dimunculkan lebih dulu terhapus sebelum terbaca.
        toast.success('Progres berhasil direset.');
      }
    });
    footer.appendChild(resetBtn);
    container.appendChild(footer);
  }, options);
}

/* ------------------------------------------------------------
   Layar: Daftar Bab
   ------------------------------------------------------------ */
function renderChapterList(params, options) {
  mountScreen(async (container) => {
    showLoading(container);
    try { await loadManifest(); } catch (err) { return showError(container, err); }

    container.innerHTML = '';
    const workspace = el('div', 'workspace');

    workspace.appendChild(buildBar({
      eyebrow: 'Mode Belajar',
      title: 'Pilih Bab',
      onBack: () => router.navigate(''),
    }));

    const body = el('div', 'workspace__body');
    const list = el('div', 'chapter-grid stagger');

    state.manifest.chapters.forEach((ch) => {
      const progress = getChapterProgress(ch.id, ch.subtopicOrder);
      const isDone = progress.total > 0 && progress.completed === progress.total;
      const card = chapterCard({
        key: ch.number,
        number: ch.number,
        badgeValue: ch.number,
        title: ch.title,
        tag: isDone ? 'Semua sub-topik selesai — buka lagi untuk review.' : ch.tagline,
        foot: chapterProgressFoot(progress),
        done: isDone,
      });
      card.setAttribute('aria-label', `Bab ${ch.number}: ${ch.title}. ${progress.completed} dari ${progress.total} sub-topik selesai.`);
      card.addEventListener('click', () => router.navigate(`belajar/${ch.id}`));
      list.appendChild(card);
    });

    body.appendChild(list);
    workspace.appendChild(body);
    container.appendChild(workspace);
  }, options);
}

/* ------------------------------------------------------------
   Layar: Daftar Sub-topik
   ------------------------------------------------------------ */
function renderSubtopicList(params, options) {
  mountScreen(async (container) => {
    showLoading(container);

    let chapterMeta;
    let chapterData;
    try {
      await loadManifest();
      chapterMeta = state.manifest.chapters.find((c) => c.id === params.chapterId);
      if (!chapterMeta) throw new Error('Bab tidak ditemukan');
      chapterData = await loadChapter(params.chapterId);
    } catch (err) {
      return showError(container, err);
    }

    container.innerHTML = '';
    const workspace = el('div', 'workspace');

    workspace.appendChild(buildBar({
      eyebrow: `Bab ${chapterMeta.number}`,
      title: chapterMeta.title,
      onBack: () => router.navigate('belajar'),
    }));

    const body = el('div', 'workspace__body');
    const list = el('div', 'subtopic-list stagger');

    chapterMeta.subtopicOrder.forEach((id, index) => {
      const sub = chapterData.subtopics.find((s) => s.id === id);
      if (!sub) return;

      const progress = getSubtopicProgress(chapterMeta.id, id);
      const unlocked = isSubtopicUnlocked(chapterMeta.id, chapterMeta.subtopicOrder, id);

      const isDone = progress.status === 'completed';
      const item = el('button', `subtopic-item${isDone ? ' subtopic-item--completed' : ''}`);
      item.type = 'button';
      item.dataset.state = progress.status;
      item.disabled = !unlocked;

      const stateIcon = isDone ? 'check' : unlocked ? 'play' : 'lock';

      item.innerHTML = `
        <span class="subtopic-item__state">${icon(stateIcon, { size: 15 })}</span>
        <span class="subtopic-item__title">${index + 1}. ${renderMixed(sub.title)}</span>
        ${isDone
          ? `<span class="badge badge--success">${progress.bestQuizScore}</span>
             <span class="badge badge--primary">Review</span>`
          : ''}
        ${icon('chevron-right', { size: 16 })}
      `;

      if (unlocked) {
        item.addEventListener('click', () =>
          router.navigate(`belajar/${chapterMeta.id}/${id}`));
      } else {
        // Tombol terkunci tetap menjelaskan alasannya.
        item.title = 'Selesaikan sub-topik sebelumnya untuk membuka yang ini.';
      }

      list.appendChild(item);
    });

    body.appendChild(list);
    body.appendChild(el('p', 'quiz__hint',
      'Sub-topik terbuka berurutan — selesaikan Mini Kuis untuk membuka yang berikutnya.'));
    workspace.appendChild(body);
    container.appendChild(workspace);
  }, options);
}

/* ------------------------------------------------------------
   Layar: Satu sub-topik (Materi → Simulasi → Kuis)
   ------------------------------------------------------------ */
function renderLesson(params, options) {
  mountScreen(async (container) => {
    showLoading(container);

    let chapterMeta;
    let chapterData;
    let subtopic;
    try {
      await loadManifest();
      chapterMeta = state.manifest.chapters.find((c) => c.id === params.chapterId);
      chapterData = await loadChapter(params.chapterId);
      subtopic = chapterData.subtopics.find((s) => s.id === params.subtopicId);
      if (!subtopic) throw new Error('Sub-topik tidak ditemukan');
    } catch (err) {
      return showError(container, err);
    }

    container.innerHTML = '';

    const view = new LessonView(container, {
      chapter: chapterMeta,
      subtopic,
      subtopicOrder: chapterMeta.subtopicOrder,
      onExit: () => router.navigate(`belajar/${chapterMeta.id}`),
      onHome: () => router.navigate(''),
      // Identitas dibaca saat layar dibuka: Rangkuman mencetak nama, sekolah, tanda tangan.
      identity: getIdentity(),
      onNextSubtopic: (nextId) => router.navigate(`belajar/${chapterMeta.id}/${nextId}`),
    });

    state.activeView = view;
    view.mount();
  }, options);
}

/* ------------------------------------------------------------
   Layar: Menu Kuis
   ------------------------------------------------------------ */
function renderQuizMenu(params, options) {
  mountScreen(async (container) => {
    showLoading(container);
    try {
      await loadManifest();
      await loadQuizzes();
    } catch (err) {
      return showError(container, err);
    }

    container.innerHTML = '';
    const workspace = el('div', 'workspace');

    workspace.appendChild(buildBar({
      eyebrow: 'Mode Kuis',
      title: 'Pilih Jenis Latihan',
      onBack: () => router.navigate(''),
    }));

    const body = el('div', 'workspace__body');

    // --- Latihan Soal TKA: 10 soal tetap, empat di antaranya soal asli 2025 ---
    body.appendChild(el('div', 'panel__label', 'Latihan Soal TKA'));

    const tkaSet = buildTkaSet(state.quizzes);
    const tkaTitle = (state.quizzes.tkaSimulation && state.quizzes.tkaSimulation.title)
      || 'Latihan Soal TKA';
    const best = skorTkaTertinggi();
    const tkaItem = chapterCard({
      key: 'tka',
      number: 0,
      badgeLabel: 'TKA',
      badgeValue: icon('trophy', { size: 20 }),
      title: tkaTitle,
      tag: `${tkaSet.length} soal · gaya ujian sesungguhnya`,
      foot: `<span class="chapter-card__count">${best === null ? 'Belum ada skor' : `Skor terbaik <b>${best}</b>`}</span>${attemptChips('simulasi_tka', 'all')}`,
      feature: true,
    });
    tkaItem.dataset.role = 'tka-entry';
    tkaItem.addEventListener('click', () => router.navigate('kuis/simulasi_tka/all'));
    body.appendChild(tkaItem);

    body.appendChild(el('div', 'panel__label', 'Latihan per Bab'));

    const list = el('div', 'chapter-grid stagger');
    state.manifest.chapters.forEach((ch) => {
      const bank = state.quizzes.banks[ch.id] || [];
      const tries = attemptsFor('latihan_bab', ch.id);
      const card = chapterCard({
        key: ch.number,
        number: ch.number,
        badgeValue: ch.number,
        title: ch.title,
        tag: `${bank.length} soal tersedia`,
        foot: `<span class="chapter-card__count">${tries.length ? `Skor terbaik <b>${Math.max(...tries.map((a) => a.score))}</b>` : 'Belum dicoba'}</span>${attemptChips('latihan_bab', ch.id)}`,
      });
      card.disabled = bank.length === 0;
      card.addEventListener('click', () => router.navigate(`kuis/latihan_bab/${ch.id}`));
      list.appendChild(card);
    });

    body.appendChild(list);
    workspace.appendChild(body);
    container.appendChild(workspace);
  }, options);
}

/* ------------------------------------------------------------
   Layar: Sesi Kuis
   ------------------------------------------------------------ */
/**
 * Riwayat percobaan untuk satu set soal, urut dari yang PERTAMA.
 *
 * `progressStore` menyimpan seluruh riwayat kuis dalam satu daftar
 * (terbaru di depan), jadi nomor percobaannya dihitung ulang di sini
 * setelah disaring — tanpa itu, "Percobaan 1" pada Bab 3 bisa berarti
 * percobaan ke-9 secara keseluruhan.
 */
/**
 * Nilai TERBAIK dari seluruh percobaan Latihan Soal TKA.
 *
 * Dibaca dari riwayat kuis di `localStorage`. Belum pernah mencoba berarti
 * belum punya skor — dan itu dikatakan apa adanya, bukan disamarkan jadi "0"
 * yang terbaca seperti nilai nol.
 */
function skorTkaTertinggi() {
  const list = attemptsFor('simulasi_tka', 'all');
  if (!list.length) return null;
  return String(Math.max(...list.map((a) => a.score)));
}

function attemptsFor(mode, bankId) {
  const semua = getQuizHistory(50)
    .filter((h) => h.mode === mode && (h.chapter || 'all') === (bankId || 'all'))
    .slice()
    .reverse();                       // yang paling lama lebih dulu
  return semua.map((h, i) => ({ attempt: i + 1, score: h.score, finishedAt: h.finishedAt }));
}

/** Deretan chip "Percobaan n: skor" untuk kartu di menu kuis. */
function attemptChips(mode, bankId) {
  const list = attemptsFor(mode, bankId);
  if (!list.length) return '';
  // Hanya lima terakhir yang ditampilkan di kartu; sisanya ada di panel ujian.
  const tampil = list.slice(-5);
  const chips = tampil.map((a) => {
    const tone = a.score === 100 ? ' data-tone="perfect"' : '';
    return `<span class="quiz-attempt"${tone}>P${a.attempt}<b>${a.score}</b></span>`;
  }).join('');
  return `<span class="quiz-attempts">${chips}</span>`;
}

function pickRandom(array, count) {
  const pool = [...array];
  const out = [];
  while (pool.length && out.length < count) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

/**
 * Susun set Latihan Soal TKA.
 *
 * Urutannya TETAP (`tkaSimulation.questionOrder`), bukan diundi: set ini
 * dirancang berjenjang — dibuka parameter tersembunyi, ditutup multi-kondisi
 * kasus batas — dan mengundinya merusak jenjang itu. Id dicari di SELURUH
 * bank, jadi urutan boleh mencampur soal bank TKA dengan soal bank bab.
 * Id yang tidak ditemukan dilewati dengan peringatan — lebih baik ujiannya
 * lebih pendek daripada gagal total.
 */
function buildTkaSet(quizzes) {
  const config = quizzes.tkaSimulation || {};

  if (Array.isArray(config.questionOrder) && config.questionOrder.length) {
    const index = new Map();
    Object.values(quizzes.banks || {}).forEach((bank) => {
      (bank || []).forEach((q) => index.set(q.id, q));
    });

    const set = [];
    config.questionOrder.forEach((id) => {
      const q = index.get(id);
      if (q) set.push(q);
      else console.warn(`[kuis] soal "${id}" tidak ditemukan di bank mana pun`);
    });
    return set;
  }

  // Jalur lama (undian) tetap didukung untuk konfigurasi tanpa urutan tetap.
  const picked = [];
  (config.drawFrom || []).forEach((bankId) => {
    const bank = quizzes.banks[bankId] || [];
    picked.push(...pickRandom(bank, config.weight[bankId] || 2));
  });
  return pickRandom(picked, config.questionCount || picked.length);
}

function renderQuizSession(params, options) {
  mountScreen(async (container) => {
    showLoading(container);
    try {
      await loadManifest();
      await loadQuizzes();
    } catch (err) {
      return showError(container, err);
    }

    const isTka = params.mode === 'simulasi_tka';
    const questions = isTka
      ? buildTkaSet(state.quizzes)
      : (state.quizzes.banks[params.bankId] || []);

    if (!questions.length) {
      container.innerHTML = '';
      container.appendChild(el('div', 'empty-state',
        `${icon('info', { size: 44 })}<p>Belum ada soal untuk pilihan ini.</p>`));
      return;
    }

    const chapterMeta = state.manifest.chapters.find((c) => c.id === params.bankId);

    /**
     * Mode Kuis mandiri memakai MESIN UJIAN (Fase 18), bukan `QuizEngine`.
     *
     * `QuizEngine` tetap melayani Mini Kuis di dalam sub-topik, tempat umpan
     * balik langsung memang benar (mastery learning). Di sini yang dilatih
     * pengalaman ujian: navigasi bebas, jawaban bisa diubah, dan penilaian
     * baru terjadi setelah dikumpulkan.
     */
    const run = () => {
      /**
       * Sesi lama DIBONGKAR lebih dulu, bukan cuma ditimpa `innerHTML`.
       *
       * Mesin ujian memasang papan coret, dan papan itu memegang
       * `ResizeObserver` serta listener di `window` (kontrak §5 butir 31:
       * pembongkaran harus menyentuh state tingkat-MODUL, bukan hanya DOM).
       * Menekan "Ulangi Ujian" tanpa membongkar akan menumpuk satu papan
       * beserta pengamatnya pada setiap percobaan.
       */
      if (state.activeView && typeof state.activeView.destroy === 'function') {
        state.activeView.destroy();
      }
      container.innerHTML = '';
      const startedAt = new Date().toISOString();

      const engine = new ExamEngine(container, questions, {
        eyebrow: isTka ? 'Latihan Soal TKA' : `Bab ${chapterMeta ? chapterMeta.number : ''}`,
        title: isTka
          ? 'Sepuluh Soal Gaya Ujian'
          : (chapterMeta ? chapterMeta.title : 'Latihan'),
        getHistory: () => attemptsFor(params.mode, params.bankId),
        onExit: () => router.navigate('kuis'),
        onRetry: () => run(),
        onFinish: (result) => {
          saveQuizResult({
            mode: params.mode,
            chapter: params.bankId,
            startedAt,
            finishedAt: new Date().toISOString(),
            ...result,
          });
          updateHeader();
        },
      });
      engine.start();
      // Didaftarkan supaya `mountScreen()` ikut membongkarnya saat siswa
      // berpindah layar.
      state.activeView = engine;
    };

    run();
  }, options);
}

/* ------------------------------------------------------------
   Utilitas UI
   ------------------------------------------------------------ */
function buildBar({ eyebrow, title, onBack }) {
  const bar = el('div', 'workspace__bar');

  const back = el('button', 'btn btn--icon btn--ghost');
  back.type = 'button';
  back.setAttribute('aria-label', 'Kembali');
  back.innerHTML = icon('arrow-left', { size: 18 });
  back.addEventListener('click', onBack);
  bar.appendChild(back);

  const titles = el('div', 'workspace__titles');
  titles.appendChild(el('div', 'workspace__eyebrow', eyebrow));
  titles.appendChild(el('div', 'workspace__title', renderMixed(title)));
  bar.appendChild(titles);

  return bar;
}

/* ------------------------------------------------------------
   Bootstrap
   ------------------------------------------------------------ */
/**
 * Penjaga identitas — LAPIS 1 (Fase 11, isu 4).
 *
 * Berjalan pada setiap perpindahan rute, jadi ia menutup semua pintu masuk
 * sekaligus: tombol rumah di header, tombol Back peramban, dan deep-link yang
 * diketik manual di bilah alamat. Menyembunyikan tombolnya saja (lapis 2 di
 * `updateHeader()`) tidak pernah cukup.
 */
function identityGuard(path) {
  if (path === 'login') return null;          // layar masuk selalu boleh dibuka
  return getIdentity() ? null : 'login';      // sisanya butuh perkenalan
}

/**
 * Penjaga keluar — melindungi pekerjaan yang belum tersimpan.
 *
 * Satu-satunya layar yang bisa kehilangan pekerjaan adalah Ujian CBT: ia
 * SENGAJA tidak mengingat jawaban antar sesi (Blueprint §4.9). Layar belajar
 * dan Mini Kuis menyimpan posisinya di sessionState, jadi meninggalkannya
 * tidak membuang apa pun.
 *
 * Penjaga router bersifat sinkron, sedangkan modal bersifat asinkron. Maka
 * perpindahan pertama DITOLAK, modal ditampilkan, dan bila siswa setuju,
 * perpindahan yang sama diulang dengan satu izin sekali pakai.
 */
let leaveApprovedFor = null;
let leavePromptOpen = false;

function unsavedWorkGuard(fromPath, toPath) {
  if (leaveApprovedFor === toPath) {
    leaveApprovedFor = null;
    return true;
  }
  const view = state.activeView;
  if (!view || typeof view.hasUnsavedWork !== 'function' || !view.hasUnsavedWork()) return true;

  // Ketukan kedua saat modal masih terbuka tidak boleh menumpuk modal kedua.
  if (!leavePromptOpen) {
    leavePromptOpen = true;
    const prompt = typeof view.constructor.leavePrompt === 'function'
      ? view.constructor.leavePrompt()
      : {
        title: 'Tinggalkan layar ini?',
        body: 'Pekerjaan yang belum disimpan akan hilang.',
        confirmLabel: 'Ya, Tinggalkan',
        cancelLabel: 'Batal',
        variant: 'danger',
      };
    confirmAction(prompt).then((ok) => {
      leavePromptOpen = false;
      if (!ok) return;
      leaveApprovedFor = toPath;
      router.navigate(toPath);
    });
  }
  return false;
}

function registerRoutes() {
  router.setGuard(identityGuard);
  router.setLeaveGuard(unsavedWorkGuard);
  router.route('/login', renderLogin);
  router.route('/tka', renderTka);
  router.route('/', renderMenu);
  router.route('/belajar', renderChapterList);
  router.route('/belajar/:chapterId', renderSubtopicList);
  router.route('/belajar/:chapterId/:subtopicId', renderLesson);
  router.route('/kuis', renderQuizMenu);
  router.route('/kuis/:mode/:bankId', renderQuizSession);

  router.setNotFound(() => {
    mountScreen((container) => {
      container.appendChild(el('div', 'empty-state', `
        ${icon('search', { size: 44 })}
        <h3>Halaman tidak ditemukan</h3>
        <p class="text-sm">Rute yang kamu tuju tidak dikenali.</p>
      `));
      const btn = el('button', 'btn btn--primary');
      btn.type = 'button';
      btn.innerHTML = `${icon('home', { size: 17 })}<span>Kembali ke Menu</span>`;
      btn.addEventListener('click', () => router.navigate(''));
      container.querySelector('.empty-state').appendChild(btn);
    });
  });
}

/* ------------------------------------------------------------
   Layar penuh
   Media ini dipakai di proyektor dan tablet kelas; layar penuh
   menghilangkan bilah peramban yang memangkas tinggi lanskap.
   ------------------------------------------------------------ */
function syncFullscreenButton() {
  const btn = document.querySelector('[data-role="fullscreen"]');
  if (!btn) return;

  const active = Boolean(document.fullscreenElement);
  const label = btn.querySelector('span');
  if (label) label.textContent = active ? 'Keluar Penuh' : 'Layar Penuh';
  btn.setAttribute('aria-label', active ? 'Keluar dari mode layar penuh' : 'Masuk mode layar penuh');
}

/* ------------------------------------------------------------
   Suara — sakelar global di samping layar penuh. Bawaan AKTIF; pilihan
   bisu disimpan per perangkat oleh sfx.js (satu lab, banyak komputer:
   guru bisa membisukan yang perlu tanpa mematikan speaker).
   ------------------------------------------------------------ */
function syncSoundButton() {
  const btn = document.querySelector('[data-role="sound"]');
  if (!btn) return;
  const on = sfx.isEnabled();
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', on ? 'Suara aktif. Ketuk untuk membisukan' : 'Suara bisu. Ketuk untuk menyalakan');
  btn.title = on ? 'Suara aktif' : 'Suara bisu';
  btn.innerHTML = icon(on ? 'volume' : 'volume-x', { size: 16 });
}

function initSound() {
  const btn = document.querySelector('[data-role="sound"]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    sfx.setEnabled(!sfx.isEnabled());
    syncSoundButton();
    // Bukti dengar bahwa suara kini menyala.
    if (sfx.isEnabled()) sfx.tap();
  });
  syncSoundButton();
}

function initFullscreen() {
  const btn = document.querySelector('[data-role="fullscreen"]');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (err) {
      // Sebagian peramban menolak tanpa gestur langsung, atau memblokirnya
      // di iframe. Katakan apa adanya, jangan gagal diam-diam.
      toast.warn('Peramban ini menolak mode layar penuh. Coba tekan tombol F11.');
    }
  });

  document.addEventListener('fullscreenchange', syncFullscreenButton);
  syncFullscreenButton();
}

/**
 * Turunkan layar muat dan munculkan aplikasinya.
 *
 * Dipanggil dari `finally` supaya ia berjalan APA PUN yang terjadi. Kalau
 * `init()` gagal di tengah jalan, siswa harus melihat pesan galat aplikasi —
 * bukan layar muat yang berdenyut selamanya tanpa pernah menjelaskan apa-apa.
 */
function revealApp() {
  document.documentElement.dataset.appReady = 'true';

  const boot = document.getElementById('boot-loader');
  if (!boot) return;

  boot.dataset.done = 'true';
  // Node-nya dibuang setelah transisinya selesai; membiarkannya berarti
  // menyisakan lapisan fixed setinggi layar yang tidak pernah dipakai lagi.
  const drop = () => boot.remove();
  boot.addEventListener('transitionend', drop, { once: true });
  setTimeout(drop, 700);   // jaring pengaman kalau transisinya tidak berjalan
}

async function init() {
  // Berlangganan SEBELUM tulisan pertama (touchSession), supaya tidak ada
  // perubahan progres yang terjadi tanpa pernah tercermin di header.
  subscribeProgress(() => updateProgressRing());

  touchSession();
  initFullscreen();
  initSound();
  initNavrail();
  registerRoutes();

  try {
    await loadManifest();
  } catch (err) {
    console.error('[app] manifest gagal dimuat:', err);
  }

  // Tombol Home di header. Penjaga rute sudah menahan navigasinya, tapi
  // tombolnya juga menolak berbunyi di layar masuk supaya siswa tidak melihat
  // klik yang "tidak melakukan apa-apa" tanpa penjelasan.
  const homeBtn = document.querySelector('[data-role="home"]');
  if (homeBtn) {
    homeBtn.addEventListener('click', (event) => {
      if (!getIdentity()) {
        event.preventDefault();
        toast.info('Isi dulu nama dan asal sekolahmu untuk masuk.');
        return;
      }
      router.navigate('');
    });
  }

  // Pengalihan awal kini ditangani `identityGuard` di dalam router, jadi ia
  // ikut berjalan pada setiap perpindahan berikutnya — bukan sekali saja.
  router.start();
  updateHeader();
}

// Ekspos sedikit permukaan untuk keperluan pengujian otomatis.
window.__vektorLab = {
  state,
  router,
  navigate: (p) => router.navigate(p),
  getOverallProgress: () => getOverallProgress(state.manifest),
  getIdentity,
  setIdentity,
};

/**
 * Bootstrap.
 *
 * `revealApp()` dipanggil di `finally`, jadi layar muat SELALU turun — baik
 * saat semuanya berhasil maupun saat manifesnya gagal diambil. Sampai saat
 * itu, `#app` tetap `opacity: 0`, sehingga siswa tidak pernah melihat header
 * dan footer tergambar duluan di atas isi yang masih kosong.
 */
async function boot() {
  try {
    await init();
  } catch (err) {
    console.error('[app] gagal memulai:', err);
  } finally {
    revealApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
