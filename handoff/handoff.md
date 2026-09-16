# HANDOFF — Ruang Vektor

> **Memori inti untuk sesi baru.** Baca dokumen ini SEBELUM menyentuh kode apa pun.
> Ditulis 17 September 2026, pada commit `73e746e`.
> Dokumen rujukan yang tetap berlaku: `PRD.md` (kontrak produk) dan
> `docs/EDTECH_BLUEPRINT.md` (kerangka arsitektur + 40 jebakan yang sudah dibayar).

---

## 1. PROJECT OVERVIEW

**Ruang Vektor** adalah media pembelajaran interaktif untuk materi **Vektor —
Matematika Tingkat Lanjut Kelas 11** (Kurikulum Merdeka), target siswa SMAS
YPVDP Bontang, berorientasi TKA/SNBT.

| Aspek | Keputusan |
|---|---|
| Bentuk | SPA satu berkas `index.html`, router berbasis hash |
| Bahasa | HTML5 + CSS3 murni + JavaScript ES Modules (vanilla) |
| Build | **TIDAK ADA** — tanpa npm, bundler, framework, TypeScript |
| Backend | Tidak ada — JSON statis + `localStorage`/`sessionStorage` |
| Pustaka | KaTeX 0.16.9 + GSAP 3.12.5 + font, **lokal** di `assets/vendor/` (CDN hanya cadangan) |
| Distribusi | Hosting statis / flash disk di lab sekolah **tanpa internet** |
| Orientasi | **Lanskap saja** |
| Bahasa UI | Bahasa Indonesia seluruhnya; komentar kode juga Bahasa Indonesia (menjelaskan *kenapa*) |

**Aksioma tunggal (penyaring semua keputusan):**
> ### APLIKASI TIDAK PERNAH MENGHITUNG UNTUK SISWA.
> Setiap angka akhir keluar dari kepala siswa. Aplikasi hanya memeriksa, menolak
> dengan alasan, dan mengonfirmasi. Di domain Vektor, pelanggaran menyamar sebagai
> **gambar yang terlalu pintar** (resultan/sudut/proyeksi yang tergambar sebelum
> siswa mengerjakannya). Hasil panjang wajib **akar eksak** (`√29`, bukan `5,385…`).

**Soal interaktivitas:** aplikasi ini interaktif, tetapi **sengaja TIDAK
gamified** dalam arti streak/lencana/poin. Streak, lencana, dan pengatur
kecepatan animasi **dicabut permanen** (Blueprint §1.5, Kontrak 11: jangan
tampilkan angka/lencana yang tidak bisa ditelusuri siswa). Motivasi datang dari
progres yang nyata: sub-topik tuntas, bab tuntas, skor TKA terbaik.

**Kurikulum:** 4 bab, 25 sub-topik, 112 soal (78 Mini Kuis + 34 bank ujian).

| Bab | ID | Sub-topik |
|---|---|---|
| 1 Konsep Dasar Vektor | `01_konsep_dasar` | 6 |
| 2 Operasi & Bangun Datar | `02_operasi_bangun_datar` | 8 |
| 3 Perkalian & Proyeksi | `03_perkalian_proyeksi` | 6 |
| 4 Pemodelan TKA & Geometri Ruang | `04_pemodelan_tka` | 5 |

Perkalian silang (cross product) **sengaja di luar cakupan** (tidak ada di rancangan
materi maupun rincian TKA Kemendikdasmen) — disetujui pengguna.

**Cara jalan:** `python tests/serve.py` → `http://localhost:5173`
(server ini mengirim `Cache-Control: no-cache`; `python -m http.server` terbukti
membuat peramban menjalankan modul JS basi).

---

## 2. CURRENT STATUS (SELESAI)

| Langkah | Isi | Commit |
|---|---|---|
| 1 | Analisis dokumen, skills proyek di `.claude/skills/` | — |
| 2 | `PRD.md` + struktur folder + `README.md` | `1476809` |
| 3 | Konten lengkap: `content/*.md` (4 bab) + `data/lessons.json` + `data/chapters/*.json` + `data/quizzes.json`. Seluruh kunci numerik diverifikasi ulang secara independen | `74741cf` |
| **4** | **Arsitektur HTML/CSS**: `index.html`, 15 berkas CSS berlapis `@layer`, tema kanvas navy + kartu putih + kuning, Sidebar & Stage, pengunci orientasi, mathpad/modal/toast bergaya kustom | `5e3b560` |
| **5 · Tahap 1** | **Inti JS tersambung & fungsional**: boot, router + penjaga identitas + penjaga keluar, `progressStore` reaktif, `sessionState`, mathpad (batas digit, mode Akar), toast/modal, navrail, vendor lokal | `73e746e` |

### Yang terverifikasi di peramban (diukur, bukan dibaca dari kode)
- Boot bersih, **nol galat konsol**, 0 import rusak (32 berkas).
- **54 permintaan saat muat, 0 ke luar origin** — jalan tanpa internet.
- Alur masuk → menu → bab → sub-topik → Materi → Simulasi → Mini Kuis → selesai.
- Cincin progres naik **0% → 4% dalam 150 ms** tanpa pindah layar (`progressStore.subscribe`).
- Posisi sesi dipulihkan setelah muat ulang; progres bertahan; sinkron antar tab.
- Penjaga keluar menahan ujian berjalan dari navrail, tombol rumah, Back peramban, hash manual.
- Mathpad: digit ke-5 ditolak **berkalimat**, toast menyingkir dari papan, Escape memulihkan kotak, mode Akar `−3√29`, 20 siklus buka–ganti–tutup tanpa galat.
- "Ganti Akun" membuang identitas + posisi, **mempertahankan** progres.
- Nol kebocoran state antar layar (papan angka, scrim, papan coret, tambatan toast).

### Yang BELUM ada
- `js/domain/vector.js`, `surd.js`, `validator.js`, `plane/*.js` → **berkas kosong** (Tahap 2–3).
- `js/lesson/simulations/sim*.js` → kosong; **25 engine belum ada**, semua sub-topik
  menampilkan "Simulasi sedang disiapkan" dan tetap membuka Mini Kuis (Tahap 4).
- `tests/engine.test.mjs`, `tests/validate_data.py` → kosong. `tests/smoke.py` &
  `archive_soal.py` masih warisan Matriks, belum diadaptasi.
- Pertanyaan terbuka ke pengguna: Mini Kuis menampilkan kunci (hijau) langsung setelah
  jawaban salah lalu mengizinkan "Coba Lagi" — perilaku warisan, dipertanyakan secara
  pedagogis, belum diputuskan.

---

## 3. STRICT ARCHITECTURAL CONTRACTS

### 3.1 CSS Cascade Layers — urutan MENGIKAT

Satu-satunya deklarasi urutan ada di baris teratas `css/tokens.css`:

```css
@layer reset, tokens, layout, components, domain, workspace, utilities, overrides;
```

| Lapisan | Berkas |
|---|---|
| `tokens` · `reset` · `utilities` | `tokens.css` |
| `layout` | `layout.css` → `shell.css` → `screens.css` |
| `components` | `components.css` · `mathpad.css` · `lesson.css` · `quiz.css` |
| `domain` | `vector.css` · `plane.css` · `simulations.css` · `scratchpad.css` |
| `workspace` | `workspace.css` |
| `utilities` | `animations.css` · `scrollbars.css` |

Aturan:
1. **`workspace` HARUS sesudah `domain`.** Sidebar & Stage menyesuaikan komponen domain
   ke kolom 190px. Terukur: bila terbalik, `vector.css .sim__brief{display:flex}`
   mengalahkan `display:none` di lanskap pendek dan prompt meluap keluar kartu.
2. **`overrides` tetap kosong.** Kalau tumbuh, lapisan di bawahnya salah rancang.
3. **Satu komponen = satu berkas.** Kerangka app hanya di `shell.css`; mathpad hanya di
   `mathpad.css`; `.plane__*` hanya di `plane.css`.
4. **Ganti NILAI token, pertahankan NAMA dan MAKNANYA.** Contoh yang pernah rusak:
   `--bg-deep` berarti "permukaan sedikit lebih dalam DI DALAM kartu terang" — sempat
   dipetakan ke navy dan merusak 10 pemakai (bilah progres 0/6 tampil penuh).
5. **Jangan menulis hex langsung di berkas komponen** — tambahkan ke palet sumber lalu petakan.
6. **Dua skala tinta.** Tinta bawaan `body` = tinta kartu (`--ink-*`). Hanya elemen yang
   BENAR-BENAR duduk di kanvas diberi tinta kanvas, satu per satu (`shell.css §8`).
   **Jangan pernah mewarnai WADAH** (mis. `.menu {color}`) — warisannya bocor ke kartu
   dan menghasilkan teks putih di atas putih (terukur dua kali).
7. `data-theme="light"` di `<html>` **tetap dipasang** (komponen memakainya untuk warna
   teks tombol). Tidak ada pengalih tema.
8. Semua CSS harus lolos: kurung seimbang per berkas, dan
   `grep -n ",$" css/*.css` tidak menyisakan selektor berkoma menggantung yang salah.

### 3.2 Mathpad — satu-satunya jalur input

- **Keyboard OS DILARANG.** Setiap kotak isian dipasang lewat `attachMathpad(input, opts)`
  yang memaksa `readOnly = true`, `inputmode="none"`, `autocomplete="off"`.
  Isian teks (nama, sekolah) juga lewat mathpad `mode:'text'`.
- API: `attachMathpad`, `openMathpad`, `closeMathpad`, `isMathpadOpen`
  (`js/core/ui/mathpad.js`). Opsi: `mode`, `allowFraction`, `allowLetter`,
  **`allowSurd`**, `onInput`, `onCommit(value, display, input)`, `onClose`.
- Mode: `decimal` · `fraction` (bertumpuk) · `surd` (`k√r`, nilai desimal hanya untuk
  pemeriksa, tampilan eksak) · `letter` · `text`.
- **Kontrak simpan/batal:** klik di luar (scrim) = **SIMPAN**; pindah layar = **SIMPAN**;
  **Escape = BATAL dan kotak DIPULIHKAN** ke isi awal. Auto-simpan terjadi saat papan
  DITUTUP, bukan per ketukan.
- **Batas:** 4 digit bulat, 3 desimal, radikan 4 digit, teks 40 karakter. Penolakan
  wajib **berkalimat** lewat `flashLimit(message)` (animasi `.is-limit` + toast,
  dibatasi sekali per 2,5 detik).
- Kebal pemasangan ganda (WeakMap). Membuka sesi baru menutup-simpan sesi lama.
- Tombol kendali dikenali lewat `key`, `code`, **dan** `keyCode` (keyboard "Unidentified").
- Papan menulis `<html data-mathpad="top|bottom">`; toast menyingkir ke tepi seberang
  dan `pointer-events:none` selama papan terbuka.
- Callback `requestAnimationFrame` wajib menangkap sesi dan memeriksa ulang
  (`if (session === opened)`) — race nyata pernah melempar TypeError.

### 3.3 UI lanskap, Sidebar & Stage, nol pergeseran tata letak

- **Lanskap absolut.** `@media (orientation: portrait)` memunculkan `.rotate-lock`
  dan menyembunyikan `#app` **beserta `.fs-btn`** (tombol layar penuh hidup di luar `#app`).
- **Viewport terkunci:** `html, body { position:fixed; inset:0; overflow:hidden }`.
  `#app` grid `var(--h-header) / 1fr / var(--h-footer)` dengan
  `grid-template-columns: minmax(0,1fr)` **eksplisit**. Scroll hanya di wadah
  bertanda: `.workspace__body`, `.ws-side__hint`, `.menu`, `.login`.
- **Sidebar & Stage:** `.ws-side` 25–30% (kendali: judul, tab langkah, petunjuk, bilah
  aksi) · `.ws-stage` sisanya (**HANYA kanvas**). Terukur 27,3% / 25,4% / 28,4% di
  740×360 / 1024×600 / 1440×900. Petunjuk simulasi lewat `Simulation.addHint()`,
  tidak pernah ditempel ke panggung.
- **Navigasi utama di HEADER** (`[data-nav="belajar|tka"]`), bukan rail kiri — kolom
  kiri sudah milik `.ws-side`. Status aktif (`aria-current="page"`) DIHITUNG dari rute.
- **Nol layout shift:** overlay `position:absolute`; tombol yang selesai dipakai
  `visibility:hidden` bukan `remove()`; tinggi dicadangkan lewat `.reserved-slot`,
  `.sim { min-height: clamp(...) }`, `.sim__prompt { min-height }`; label yang berganti
  berlebar TETAP. Kotak kosong ber-`visibility:hidden` memesan ruang NOL — isi dulu.
- **Lanskap pendek (≤470px tinggi):** token tipografi & bilah menyusut di `tokens.css`;
  bilah aksi sidebar satu baris; `.ws-side__hint { min-height:58px }`.
- Sasaran sentuh ≥ 44px (`--touch-min`). Tidak ada tautan teks telanjang.

### 3.4 Kontrak JS inti yang tidak boleh dirusak

- **Batas Core ↔ Domain:** `js/core/` dan `js/quiz/` tidak boleh tahu soal vektor.
  Helper generik ada di `core/numeric.js` (`numbersMatch`, `formatNumber`,
  `parseNumberInput`) dan `core/text.js` (`fillTemplate`, placeholder `{{kunci}}`).
  Titik sambung ke domain hanya 3: registry `lesson/simulations/index.js`, string
  `simulation.engine` di JSON, dan kelas dasar `Simulation` di `simCore.js`.
- **Router** (`core/router.js`): `setGuard` (masuk), `setLeaveGuard` (keluar; menolak
  tanpa merender ulang), `refresh()` (gambar ulang layar yang sama), `navigate(path,{replace})`.
  Pengalihan pakai `replaceState`.
- **`mountScreen()`** (app.js) urutannya mengikat: `clearToasts → closeMathpad →
  anchorToasts(null) → activeView.destroy() → killAllMotion → innerHTML=''`.
  Toast yang harus terlihat sesudah menggambar ulang dimunculkan SESUDAH `refresh()`.
- **Penyimpanan:** `progressStore` = PENCAPAIAN (`localStorage` `vektorLab.v1`, reaktif via
  `subscribe()`); `sessionState` = POSISI (`sessionStorage` `vektorLab.session.v1`);
  identitas terpisah `vektorLab.identity.v1`. Jangan dicampur. Kunci sub-topik
  DIHITUNG dari `subtopicOrder`, tidak disimpan.
- **Badan soal** hanya lewat `quiz/questionBody.js` → urutan `prompt → table → tex → after`
  (Kontrak 9). Opsi soal hanya berkunci `label` atau `tex`.
- `alert/confirm/prompt` native **dilarang** → `toast.show(type, msg)`, `confirmAction()`.
- Teks bermarkdown/LaTeX wajib lewat `renderMixed()`; argumen ketiga `el()` masuk
  sebagai innerHTML mentah.
- `ExamEngine.hasUnsavedWork()` + `static leavePrompt()` dipakai penjaga keluar.
- Permukaan uji: `window.__vektorLab`, `document.documentElement.dataset.appReady`.

### 3.5 Git
- **Jangan `git push`** tanpa permintaan eksplisit di sesi itu.
- **Jangan menambah trailer `Co-Authored-By` / tanda tangan AI** (Blueprint §10.4, disetujui pengguna).
- Commit di akhir setiap langkah besar, lalu laporkan dan tanyakan apakah lanjut.

---

## 4. THE IMMEDIATE NEXT STEP — MISI SESI BARU

> ### ⚠️ Tugas PERTAMA sesi baru BUKAN melanjutkan Tahap 2 JavaScript.
> ### Tugas utamanya: **PEROMBAKAN VISUAL (UI/UX OVERHAUL) TOTAL.**

**Instruksi pengguna (dikutip apa adanya):**
> "Desain visual saat ini terlalu mirip dengan warisan Ruang Matriks (gaya
> Claymorphism putih, tebal, membulat). Di sesi baru, Claude diberikan OTONOMI
> KREATIF PENUH untuk merombak `tokens.css` dan desain antarmuka. Temanya adalah
> 'Vektor' (Arah, Besaran, Geometri, Presisi, Instrumen). Desain harus beridentitas
> sendiri, premium, segar, dan tidak membosankan."

### Yang boleh dirombak total
- Seluruh nilai di `css/tokens.css`: palet, tipografi, radius, bayangan, spasi, motion.
- Bahasa bentuk komponen di semua berkas CSS (kartu, tombol, pil, bayangan tebal,
  sudut membulat besar, gradien "sheen" — semua warisan yang membuat tampilan terasa
  seperti Ruang Matriks).
- Latar `.backdrop`, header, layar muat, layar masuk, menu, navrail, papan angka, toast, modal.
- Keputusan tema Langkah 4 (kanvas navy / kartu putih / kuning) **tidak mengikat** —
  boleh diganti bila arah baru lebih kuat.
- Tipografi boleh berganti keluarga, **dengan syarat font baru ikut di-vendor lokal**
  (woff2, subset latin) ke `assets/vendor/fonts/` dan `fonts.css` diperbarui.

### Yang TETAP wajib (jangan dilanggar oleh perombakan)
1. Urutan `@layer` dan pembagian berkas per lapisan (§3.1) — kecuali ada alasan terukur,
   dan alasannya dicatat di komentar `tokens.css`.
2. **Nama kelas yang dipancarkan JS.** CSS harus menarget kelas yang sudah ada
   (±245 kelas, mis. `.ws-side`, `.ws-stage`, `.mathpad`, `.mp-key`, `.option--picked`,
   `.quiz__after`, `.exam-nav__item`, `.plane__arrow`). Inventaris ulang dengan grep di
   `js/` sebelum menghapus selektor apa pun. Kelas baru boleh ditambah di JS bila perlu.
3. Semua kontrak §3.2–§3.4: lanskap, Sidebar & Stage (rasio 25–30%), nol layout shift,
   mathpad readOnly, sasaran sentuh ≥44px, kontras teks ≥4,5:1 (**diukur**).
4. Tanpa build, tanpa framework CSS, tanpa CDN baru.
5. `prefers-reduced-motion` dihormati; tidak ada pengatur kecepatan animasi.

### Cara kerja yang disarankan
1. Panggil skill `frontend-design` (dan `ui-ux-pro-max` bila perlu) — pengguna memintanya
   untuk urusan desain.
2. Susun rencana desain singkat (palet 4–6 hex bernama, tipografi, konsep tata letak,
   **satu elemen tanda tangan** yang berakar pada tema Vektor/instrumen), kritik agar
   tidak jatuh ke gaya generik, baru eksekusi.
3. **Verifikasi di peramban dengan MENGUKUR**, bukan melihat saja:
   `getComputedStyle` (warna teks vs latar), `getBoundingClientRect` (rasio kolom,
   luapan, klip `scrollHeight > clientHeight`), di minimal 740×360, 1024×600, 1440×900,
   plus potret. Cek layar: masuk, menu, daftar bab, sub-topik (Materi / Simulasi
   kosong / Mini Kuis benar & salah / selesai), ujian TKA, mathpad (Angka/Pecahan/Akar/
   teks), modal, toast, pengunci orientasi, layar muat.
4. Jebakan peramban saat menguji: navigasi hash **tidak** memuat ulang CSS/JS — pakai
   `fetch(url,{cache:'reload'})` lalu `location.reload()`; atau origin `127.0.0.1`.
   Koordinat klik alat bisa bergeser bila panel menskalakan viewport — pakai `ref` atau
   event sintetis + `elementFromPoint` untuk memastikan.
5. Commit, laporkan dengan tangkapan layar, tanyakan apakah lanjut.

### Sesudah perombakan visual: urutan yang tertunda
- **Tahap 2:** `js/domain/vector.js`, `surd.js`, `validator.js` (tanpa DOM) +
  `tests/engine.test.mjs` (Node murni, ≥40 uji). API rujukan: Blueprint §5.1–§5.3.
- **Tahap 3:** `js/domain/plane/vectorPlane.js` + `arrow.js` (SVG, 6 aturan Blueprint §5.4;
  kelas CSS sudah disiapkan di `plane.css`).
- **Tahap 4:** 25 engine simulasi Bab 1 → 4 (`simBasics/Operations/Products/Modeling.js`),
  didaftarkan lewat `registerSimulation(key, Class)`; kunci = `simulation.engine` di JSON.
  Konfigurasi & kalimat toast tiap engine sudah tertulis di `data/chapters/*.json`.
- Utang: `tests/validate_data.py`, adaptasi `tests/smoke.py`, keputusan soal kunci
  jawaban Mini Kuis setelah salah (§2).

---

## 5. PROJECT FILE TREE

```
vektor-lab-interaktif/
├── index.html                 SPA tunggal: backdrop, rotate-lock, boot loader, header
│                              (brand · navrail · progress-ring), #screen-host, footer, fs-btn;
│                              vendor lokal + cadangan CDN "cek global"
├── PRD.md                     kontrak produk (tema §7.1 & layer §7.7 sudah diselaraskan Langkah 4)
├── README.md                  cara jalan & perintah harian
├── handoff/handoff.md         dokumen ini
├── docs/                      EDTECH_BLUEPRINT.md · Rancangan_Materi_Vektor_TKA.md · 4 gambar soal TKA
├── .claude/
│   ├── launch.json            server pratinjau → python tests/serve.py 5173
│   └── skills/                webapp-testing · test-driven-development · systematic-debugging ·
│                              verification-before-completion · writing-plans
├── skills/                    pustaka skills mentah (bukan kode aplikasi)
│
├── assets/vendor/             VENDOR.md · katex/ (js, css, 20 font woff2) · gsap/ (gsap, MotionPath) ·
│                              fonts/ (Montserrat 700–900, Roboto 400–900, Roboto Mono 400/700 + fonts.css)
│
├── css/                       15 berkas, semuanya dibungkus @layer
│   ├── tokens.css             [tokens·reset·utilities] deklarasi urutan layer, palet, skala, reset
│   ├── layout.css             [layout] menu, hero, kartu bab/sub-topik, langkah
│   ├── shell.css              [layout] backdrop, #app grid, header, navrail, progress-ring,
│   │                          footer, fs-btn, boot, rotate-lock, tinta kanvas (§8)
│   ├── screens.css            [layout] layar masuk, layar "belum tersedia"
│   ├── components.css         [components] tombol, kartu, callout, opsi, toast, modal, slider
│   ├── mathpad.css            [components] numfield, scrim, papan angka semua mode
│   ├── lesson.css             [components] typegroup, carousel, quiz-nav, answer-key, lesson-done
│   ├── quiz.css               [components] ujian CBT
│   ├── vector.css             [domain] sel, kurung vektor kolom, chip, stage, sim, checklist
│   ├── plane.css              [domain] bidang kartesius SVG (disiapkan untuk Tahap 3)
│   ├── simulations.css        [domain] sim-host, reserved-slot, overlay selesai, tap-armed
│   ├── scratchpad.css         [domain] papan coret
│   ├── workspace.css          [workspace] Sidebar & Stage + penyesuaian lanskap pendek
│   ├── animations.css         [utilities]
│   └── scrollbars.css         [utilities]
│
├── js/
│   ├── app.js                 komposisi layar, rute, penjaga identitas & keluar, navrail,
│   │                          header reaktif, layar penuh, boot → revealApp()
│   ├── core/                  ══ tidak tahu apa-apa soal vektor ══
│   │   ├── router.js          hash router: route · setGuard · setLeaveGuard · refresh · navigate
│   │   ├── numeric.js         numbersMatch · formatNumber · parseNumberInput
│   │   ├── text.js            fillTemplate ({{kunci}})
│   │   ├── state/             progressStore.js (subscribe) · sessionState.js
│   │   ├── ui/                mathpad.js · toast.js (show) · modal.js · icons.js · scratchpad.js
│   │   ├── interactions/      dragDrop.js · flyToAnimation.js · motion.js
│   │   └── render/            katexRenderer.js (renderMixed · renderToString · renderBlock)
│   ├── quiz/                  ══ generik ══
│   │   ├── questionBody.js    perender tunggal badan soal + renderDataTable
│   │   ├── quizEngine.js      Mini Kuis — umpan balik langsung
│   │   ├── examEngine.js      Ujian CBT — umpan balik tertunda, hasUnsavedWork()
│   │   └── quizResult.js      layar hasil (judul sub-topik dari ctx.subtopicTitles)
│   ├── lesson/
│   │   ├── lessonRenderer.js  LessonView: Materi → Simulasi → Mini Kuis → selesai
│   │   └── simulations/
│   │       ├── index.js       SIMULATION_REGISTRY · registerSimulation · mountSimulation
│   │       ├── simCore.js     kelas dasar Simulation + helper (renderColumnVector, dll.)
│   │       └── simBasics.js · simOperations.js · simProducts.js · simModeling.js   ← KOSONG
│   └── domain/                ← SEMUA KOSONG (Tahap 2–3)
│       ├── vector.js · surd.js · validator.js
│       └── plane/ vectorPlane.js · arrow.js · arrowAnimation.js
│
├── data/
│   ├── lessons.json           manifest 4 bab (subtopicOrder = sumber kebenaran urutan & kunci),
│   │                          relevansi, prasyarat
│   ├── chapters/*.json        25 sub-topik: materi[] · simulation{engine, brief, config, toasts} · quiz[]
│   └── quizzes.json           banks per bab (6 soal) + tka_2026 (10 soal) + tkaSimulation.questionOrder
│
├── content/*.md               materi bacaan 4 bab (sinkron dengan JSON)
│
└── tests/
    ├── serve.py               server dev no-cache  ← PAKAI INI
    ├── engine.test.mjs        KOSONG (Tahap 2)
    ├── validate_data.py       KOSONG
    ├── smoke.py               warisan Matriks, belum diadaptasi
    └── archive_soal.py        warisan Matriks, belum diadaptasi
```

**Ukuran saat ini:** ±15.400 baris JS + CSS, 4 berkas konten, 6 berkas data.

---

*Dokumen transisi. Bila isinya bertentangan dengan kode, kode yang diukur di peramban
yang benar — perbarui dokumen ini, jangan kodenya dipaksa mengikuti dokumen.*
