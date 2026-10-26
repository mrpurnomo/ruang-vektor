# HANDOFF — Ruang Vektor

> **Memori inti untuk sesi baru.** Baca dokumen ini SEBELUM menyentuh kode apa pun.
> Ditulis 17 September 2026; diperbarui terakhir **25 Oktober 2026** sesudah Bab 1 dirombak
> total dan dinyatakan **"bagus dan sempurna"** oleh guru (commit `827e15e`).
> Urutan baca yang disarankan: §4 (misi sesi baru) → §9 (aturan guru untuk SEMUA bab) →
> §8 (peta engine & kontrak paket terpandu) → §3 (kontrak arsitektur) → §5 (pohon berkas).
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

**Cara jalan:** `py tests/serve.py` → `http://localhost:5173` (di mesin ini `py`, bukan `python`)
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
| **6 · Visual** | **Perombakan visual "Instrumen Ukur"**: film abu dingin berpetak mm + pelat bersudut 2–8px + layar instrumen gelap; ARAH = kobalt `#2F3DE0`, BESARAN = amber `#FFB000`; tanda tangan = mistar (bezel header, panggung), sudut bidik (pelat pintu masuk), piringan busur derajat (cincin progres); font Barlow / Barlow Condensed / JetBrains Mono (vendor lokal, font lama dilepas). DOM & nama kelas tidak berubah; urutan `@layer` tetap. Terukur: kontras 0 pelanggaran di 6 rute, 0 luapan di 740×360 / 1024×600 / 1440×900, rasio sidebar 26,5 / 23,8 / 28%, 0 galat konsol | `d291138` |
| **7 · Tahap 2** | **Mesin matematika domain (TDD)**: `surd.js` (pecahan & akar eksak `(n/d)√r`, jumlah suku, rasionalisasi, `parseSurd` untuk keluaran papan angka, `isSimplestForm`), `vector.js` (R²/R³ dengan `dim` tersimpan; eksak masuk → eksak keluar; fungsi `*Exact` mengembalikan bentuk akar), `validator.js` (`can*` berkalimat + `checkExactAnswer` / `checkVectorAnswer` berkode `correct·empty·unreadable·not-simplest·decimal·sign·wrong`; kalimat TIDAK membocorkan kunci). `node tests/engine.test.mjs` → 111/111, termasuk 500 pasang vektor acak berbenih; uji mutasi 18 mutan, 17 tertangkap + 1 kode mati dibuang, 1 celah (minor y–z) ditutup | `24f856e` |
| **8 · Tahap 3** | **Bidang kartesius SVG**: `plane/planeGeometry.js` (murni, tanpa DOM: viewport skala seragam, y terbalik HANYA di toScreen/toMath, busur, siku, panah, label, snap), `arrow.js` (marker per panah DI DALAM grupnya + userSpaceOnUse, ketuk + Enter/Spasi, seret ujung + tombol panah), `arrowAnimation.js` (tween di ruang matematika, bisa dibatalkan, hormati reduced-motion), `vectorPlane.js` (lapisan grid·axis·pick·shape·interactive·label, ResizeObserver+rAF, destroy tuntas). Uji: Node 130/130 (19 geometri) + peramban `tests/plane.html` 31/31 (CTM, elementFromPoint, hitung piksel kepala panah, spy ResizeObserver & listener). Uji mutasi: 4 geometri + 8 kontrak SVG, semua tertangkap sesudah 2 celah ditutup. Terverifikasi di dalam aplikasi pada 740×360 / 1024×600 / 1440×900 | `ebde1a7` |
| **9 · Tahap 4** | **25 engine simulasi** di `simBasics` (6) · `simOperations` (8) · `simProducts` (6) · `simModeling` (5), didaftarkan lewat `ENGINES` per bab di `index.js` (25 terdaftar = 25 engine JSON). Kerangka bersama `simKit.js` → `CaseSimulation`: kasus → langkah `fields·choice·multi·tap`; `check()` → `true` atau `{message|toast, values, wrong}`; **`solveStep()` satu-satunya jalan maju**, visual konfirmasi (`onSolved`) baru digambar SESUDAH siswa benar. Anggaran label (`essential`), sasaran titik 44px, slot tercadang. Mini Kuis: kunci & pembahasan tidak lagi tampil saat salah — baru sesudah salah ke-3 (`QuizEngine.REVEAL_AFTER`). Kalimat toast JSON yang membocorkan kunci ditulis ulang. Uji: Node 130/130 · `tests/plane.html` 32/32 · `tests/sims.html` 26/26 (260 jawaban salah ditolak berkalimat, tanpa gambar baru, tanpa `{{kunci}}`, tanpa bocor angka kunci, bidang tidak bergeser, destroy tuntas, resume sesi) | `6b630d7` |
| **10 · QA** | **Final Polish & QA** (4 commit): (1) `tests/validate_data.py` — validator data Python murni: manifest ↔ bab, registry `ENGINES` ↔ JSON, analisis statis kunci toast & `{{placeholder}}` per titik pemakaian engine, karakter kendali, LaTeX seimbang, bentuk soal, 78 + 34 soal, `questionOrder`, `toastWrong` yang menyebut kunci; uji mutasi 14/14. Bug ditemukan & diperbaiki: `component_add` kasus beda dimensi (kalimat salah menyebut vonis "tidak terdefinisi", dan kalimat yang sama dipakai sebagai toast tuntas tanpa nilai → `{{dimA}}` bolong; dipecah jadi `dimensiBeda` + `dimensiBedaTuntas`), `b3_04_1`/`b4_05_2` (`toastWrong` menulis persamaan akhir = kunci). (2) `tests/smoke.py` ditulis ulang untuk Ruang Vektor (uji warisan Matriks dihapus); `archive_soal.py` diadaptasi + arsip Mini Kuis, keluaran di `content/*_ARCHIVE.md`. (3) Pena papan coret = token hidup: Grafit/Kobalt/Amber(`--accent-amber`)/Beri; kontras goresan terukur dari piksel 18,6/7,3/6,3/5,7 (sebelumnya merah 3,9 & kuning 1,55). (4) Konfeti = token hidup kobalt/amber/sian/beri/sukses. Uji: Node 130/130 · data 724 lolos/0 gagal · smoke 115/0 (termasuk plane 32/32 & sims 26/26) | `981d932` `b28956d` `5e3c82c` `1a57e36` |
| **11 · Final Polish** | (1) **Area sentuh efektif ≥ 44×44** tanpa mengubah ukuran tampil: token `--hit-min: 44px` (tidak menyusut seperti `--touch-min`) + `::after` transparan `inset: min(0px, calc((100% - var(--hit-min)) / 2))` di berkas komponennya; jarak pusat-ke-pusat ≥ 44px (navrail, baris chip, kendali papan coret), skala swatch dibalik di `::after`, ellipsis label sidebar pindah ke `<span>`, `.ws-side__hint` padding 5px, bilah papan coret menyisihkan zona FAB. Terukur: ukuran tampil 164 tombol identik sebelum/sesudah; smoke §6b 26 keadaan, mutan `--hit-min:30px` tertangkap. (2) **29 kalimat toast mati** dari 19 sub-topik dibuang (±5,1 KB); kalimat tak terpakai kini GAGAL di validator. (3) **Bilah papan coret satu baris** digulir horizontal (`.no-scrollbar`, `touch-action: pan-x`, pudar tepi scroll-driven): 740×360 dari 130px/48,9% kanvas → 46px/17,3%. (4) **PRD §7.1** = "Meja Gambar Teknik · Instrumen Ukur" + kontras terukur; §7.4 kontrak `--hit-min`. Flake `smoke.py` terjelaskan: `net::ERR_NETWORK_CHANGED` (adaptor jaringan Windows) → `open_route` mengulang. Uji: Node 130/130 · data 749/0/0 · smoke 146/0 (plane 32/32, sims 26/26) | `abaa5c6` `cdeddfd` `327bf8a` `70159e7` |

| **12 · Bab 1** | **Revisi total isi Bab 1** mengikuti skenario guru: sub-topik 1 berangkat dari bidang kosong (O → A(7,4) → panah), sub-topik 2 tiga bentuk komponen + keliling empat kuadran, sub-topik 3 inkuiri sampai menemukan sendiri `AB = B − A`, sub-topik 4 modulus dari segitiga Pythagoras (akar eksak), sub-topik 5 vektor satuan lewat analogi tongkat dibagi panjangnya, sub-topik 6 **pindah ke akhir bab**: ruang 3D, konvensi Z-Up (matematika/CAD) vs Y-Up (game engine), basis k̂. `subtopicOrder` di `lessons.json` ikut berubah. Judul sub-topik dibuat lugas tanpa majas (Konsep Dasar Vektor, Bentuk Komponen Vektor, Vektor Posisi & Selisih Titik, Panjang Vektor (Modulus), Vektor Satuan, Vektor di Ruang Tiga Dimensi). Konfigurasi simulasi & kalimat toast ditulis ulang; `content/01_konsep_dasar.md` disinkronkan. Bug diperbaiki: toast `pointer-events: auto` **menelan ketukan** tombol "Coba Lagi"; validator menolak `\"` yang ikut tampil | `e62f5e2` `a1b47a7` `d8f3834` |
| **13 · Terpandu** | **Materi dilebur ke simulasi** (purwarupa sub-topik 1). Alur pelajaran kini **dua tahap** — Simulasi → Mini Kuis — dan sub-topik dibuka langsung di simulasi; materi teks tetap hidup sebagai **Rangkuman** opsional (`REVIEW_STEP`, di luar deret tab). **Instruksi pindah ke panggung** (`.sim-guide`, tinggi TETAP), sidebar jadi panel status. Jenis langkah baru **`pick`** = ketuk koordinat di bidang kosong. Engine `vector_anatomy` ditulis ulang jadi `GuidedVectorIntroSim`: ketuk O → cari & ketuk A → hitung langkah → bentuk panah → latihan kuadran II/III/IV. Bug ditemukan: chip kasus & chip langkah menampilkan **sumber LaTeX mentah** di 8 sub-topik, `**pada**` mentah di `scalar_projection`, panduan menggeser kanvas 22px, dan kanvas terdorong keluar layar di 740×360 (papan kini dua kolom mulai 420px). Uji: Node 130/130 · data 749/0/0 · smoke **152/0** (plane 32/32, sims 26/26) | `54455b8` |
| **14 · QA purwarupa** | Purwarupa sub-topik 1 dijalankan dengan ketukan mouse sungguhan di 740×360 & 1024×600 (Playwright, tangkapan layar per langkah). **5 bug terukur, diperbaiki satu commit per bug, masing-masing dengan uji yang MERAH lebih dulu:** (1) kasus latihan B/C/D membunyikan toast sukses milik OA ("Dari O ke A: 7 ke kanan…") → `caseSuccessKey` → `successLatihan` (kalimat umum, tanpa angka); `sims.browser.mjs` kini memeriksa toast sukses per kasus (`CASE_SUCCESS`). (2) Item jejak langkah **tergencet** di lanskap pendek (tinggi 20px, isi 29–49px: "4 ke atas" & mata panah `\vec` terpotong) → `grid-auto-rows: max-content`; berlaku untuk 25 engine. (3) Toast **meluap 82px** keluar tepi kanan di bawah 768px (lebar `100vw` padahal tengahnya tertambat ke panggung) → lebar mengikuti `--toast-anchor-w`. (4) **Perintah `.sim-guide` tergulir keluar layar** di 740×360 (top −272px; langkah 4 tampil tanpa pertanyaannya) → panduan `sticky`, bidang menempel di bawahnya, bantalan bawah kartu dipindah ke kolom kerja. (5) Jejak tidak bergeser ke baris terbaru; kasus baru dibuka dari posisi gulir lama → `scrollTop` jejak & panggung. `smoke.py` §6c baru (9 cek panggung terpandu 740×360). Uji: Node 130/130 · data 749/0/0 · smoke **161/0** (plane 32/32, sims 26/26). 1024×600 terukur identik sebelum/sesudah | `7c7a5d4` `614f733` `8a11e4e` `b539745` `2debdf2` |

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

### Catatan kecil yang tersisa (terukur, di luar lingkup The Final Polish — tidak diubah)
- Teks putih di atas `--success` (`#08875A`) — huruf/centang opsi benar di ujian dan Mini
  Kuis — **4,38:1**, sedikit di bawah 4,5:1 untuk teks kecil. Pilihan: pakai `--success-hi`
  (`#066B47`) sebagai latar penanda itu.
- Di 740×360, toast sukses ("Jawabanmu tepat!") menutupi tombol papan coret selama toast tampil
  (sementara, lalu hilang sendiri). Masih berlaku sesudah perbaikan lebar toast (toast 239–689px).

### Temuan terbuka dari QA purwarupa — SUDAH DISELESAIKAN (lihat §6–§9); dibiarkan sebagai riwayat
- **Tombol "Kasus berikutnya" tak terlihat di 740×360.** Ia hidup di panel kiri (`addHint`), di bawah
  pemilih kasus yang membungkus jadi dua baris; panduan di panggung berkata "Lanjut ke kasus
  berikutnya" tetapi tombolnya ada di luar pandangan. Chip kasus berikutnya memang terbuka dan bisa
  diketuk. Usulan: tombol kasus berikutnya ikut pindah ke panggung (kolom kerja).
- **Blok "Inilah vektor…" (puncak penemuan) tergulir di bawah panduan** di 740×360 saat kasus OA
  tuntas, karena ia di puncak kolom kerja sedangkan panggung sudah menggulir ke pilihan jawaban.
- **Cabang `koordinatTertukar` tak terjangkau untuk A(7,4)**: bidang dipotong sampai y = 6, jadi
  titik tertukar (4,7) di luar bidang; ketukan di luar bidang tidak diberi umpan balik apa pun.
- Di 740×360 tab tahap sidebar hanya bertuliskan "1" dan "2"; chip "Vektor pertama" membungkus dua baris.

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
- **Sidebar & Stage (DIUBAH 12 Okt 2026).** `.ws-side` 25–30% kini **panel STATUS**:
  judul, tab tahap, pemilih kasus, daftar langkah, bilah aksi (Rangkuman · Ulangi ·
  Lanjut). **INSTRUKSI LANGKAH HIDUP DI PANGGUNG**, bukan di sidebar: `.sim-guide`
  membentang di atas kanvas (`simKit.build()`), karena terukur di kelas mata siswa
  terkunci pada kanvas dan kolom kiri praktis tidak dibaca. Rasio kolom tetap
  27,3% / 25,4% / 28,4% di 740×360 / 1024×600 / 1440×900.
  · `.sim-guide` **bertinggi TETAP** (`--guide-h`: 104px; 84px di lanskap pendek) + `overflow-y: auto`.
    Jangan diganti `min-height`: panel yang tumbuh satu baris menggeser bidang 22px.
  · `.sim-guide` **MENEMPEL** (`position: sticky; top: 0`) dan bidang menempel tepat di bawahnya
    (`top: calc(--guide-h + --board-gap)`). Di 740×360 lembar kerja lebih tinggi dari panggung;
    tanpa ini perintahnya tergulir hilang. Elemen tempel tidak bisa keluar dari area gridnya, jadi
    di lanskap pendek bantalan bawah kartu papan bidang dipindah ke `.sim-board__work`
    (`workspace.css`). Ganti tinggi panduan/bidang = ukur ulang `smoke.py` §6c.
  · Papan simulasi dua kolom mulai **420px** (container query `.sim-host`), karena
    panggung di 740×360 hanya 430px dan tata letak bertumpuk mendorong kanvas keluar layar.
  · Panel kiri masih memakai `Simulation.addHint()` untuk STATUS, bukan untuk perintah.
- **Navigasi utama di HEADER** (`[data-nav="belajar|tka"]`), bukan rail kiri — kolom
  kiri sudah milik `.ws-side`. Status aktif (`aria-current="page"`) DIHITUNG dari rute.
- **Nol layout shift:** overlay `position:absolute`; tombol yang selesai dipakai
  `visibility:hidden` bukan `remove()`; tinggi dicadangkan lewat `.reserved-slot`,
  `.sim { min-height: clamp(...) }`, `.sim-guide { height }`; label yang berganti
  berlebar TETAP. Kotak kosong ber-`visibility:hidden` memesan ruang NOL — isi dulu.
- **Lanskap pendek (≤470px tinggi):** token tipografi & bilah menyusut di `tokens.css`;
  bilah aksi sidebar satu baris; `.ws-side__hint { min-height:58px }`.
- **Area sentuh ≥ 44×44 (`--hit-min`), ukuran tampil boleh lebih kecil** (`--touch-min` menyusut ke
  40px di lanskap pendek). Pola: `position: relative` + `::after { content:''; position:absolute;
  inset: min(0px, calc((100% - var(--hit-min)) / 2)); }` di berkas komponennya. Jarak pusat-ke-pusat
  ≥ 44px; jangan `overflow: hidden` pada tombol (pindahkan ke labelnya); skala visual (`transform:
  scale`) harus dibalik di `::after`. Diukur `smoke.py` §6b. Tidak ada tautan teks telanjang.

### 3.4 Kontrak JS inti yang tidak boleh dirusak

- **Batas Core ↔ Domain:** `js/core/` dan `js/quiz/` tidak boleh tahu soal vektor.
  Helper generik ada di `core/numeric.js` (`numbersMatch`, `formatNumber`,
  `parseNumberInput`) dan `core/text.js` (`fillTemplate`, placeholder `{{kunci}}`).
  Titik sambung ke domain hanya 4: registry `lesson/simulations/index.js`, string
  `simulation.engine` di JSON, kelas dasar `Simulation` di `simCore.js`, dan
  **registri tipe soal** `QuizEngine.registerType` (diisi `lesson/quizTypes.js`, tipe
  `plane_tap`). `QuizEngine.dispose()` WAJIB dipanggil pemilik layar: bidang SVG di soal
  memegang ResizeObserver yang selamat dari `innerHTML = ''`.
- **Notasi:** ruas berarah dua huruf = `\overrightarrow{AB}`; `\vec{a}` hanya satu huruf.
  `katexRenderer.normalizeNotation()` menjaga teks yang dirakit saat berjalan; validator
  menolak `\vec{XY}` di data.
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

> ### 🎯 MISI: STANDBY — MENUNGGU PENILAIAN GURU ATAS BAB 2
>
> **Bab 1 SELESAI** ("bagus dan sempurna", 25 Okt 2026). **Bab 2 SELESAI ditulis** (26 Okt 2026,
> §10) dan sudah di-push ke GitHub `mrpurnomo/ruang-vektor`; menunggu pemeriksaan guru.
> Sesi baru **TIDAK langsung bekerja**: baca handoff ini (§10 lalu §9), verifikasi repo & uji,
> laporkan kesiapan singkat, lalu **TUNGGU** revisi guru atas Bab 2 atau perintah memulai Bab 3.
> Pola §4.1a di bawah berlaku sama untuk Bab 3.

### 4.1 Antrean yang sudah disetujui

1. **Bab 2 — Operasi & Bangun Datar** (`data/chapters/02_operasi_bangun_datar.json`,
   engine di `js/lesson/simulations/simOperations.js`), 8 sub-topik:
   | # | id | Judul | Engine lama |
   |---|---|---|---|
   | 1 | `penjumlahan_segitiga` | Aturan Segitiga & Poligon | `triangle_rule` |
   | 2 | `penjumlahan_jajargenjang` | Aturan Jajar Genjang | `parallelogram_rule` |
   | 3 | `operasi_komponen` | Jumlah & Selisih Komponen | `component_add` |
   | 4 | `perkalian_skalar` | Perkalian Skalar dengan Vektor | `scalar_sweep` |
   | 5 | `kombinasi_operasi` | Kombinasi Operasi | `combo_vector_op` |
   | 6 | `kesamaan_vektor` | Kesamaan Dua Vektor | `equality_link` |
   | 7 | `titik_segaris` | Titik-Titik Segaris (Kolinier) | `collinear_check` |
   | 8 | `pembagian_ruas_garis` | Pembagian Ruas Garis | `section_point` |
2. Sesudah Bab 2 dinilai: Bab 3 (Perkalian & Proyeksi, 6 sub-topik), lalu Bab 4 (Pemodelan TKA, 5).

### 4.1a Cara mengerjakan Bab 2 (SETELAH diperintah) — pola yang sudah terbukti di Bab 1

1. **Tanyakan dulu** keputusan yang memang milik guru (pakai pertanyaan pilihan, maks. 4):
   mis. skenario/konteks cerita per sub-topik, apakah ada referensi LKPD Bab 2
   (`../LKPD-1.html`, `../LKPD-2.html`, `../LKPD/`, `../XI/LKPD Vektor 1 - SMA YPVDP - XI.pdf`), dan cara pemeriksaan
   (satu bab sekaligus vs per sub-topik — di Bab 1 guru memilih **sekaligus**).
2. Baca dulu: engine lama Bab 2, data JSON-nya, `content/02_operasi_bangun_datar.md`,
   `docs/Rancangan_Materi_Vektor_TKA.md` (Fase 3–5), dan LKPD guru.
3. Untuk SETIAP sub-topik, paket lengkap (validator §4b + smoke §6l/§6m menegakkannya —
   tambahkan id sub-topik Bab 2 ke `GUIDED_SUBTOPICS` dan `BAB1_SUBTOPICS`-padanannya):
   `hook` (+ ilustrasi baru di `lesson/hookArt.js`) · simulasi terpandu (engine baru di
   berkas `simGuided*.js`/`simOperations.js` memakai `guidedKit.js`) · **`hint` di SETIAP
   langkah** · `simulation.conclusion` (definisi ≤ ±130 karakter, ≤ 3 kolom, muat 740×360) ·
   selebrasi (`celebration()`, `nextCaseInvite`, `caseDonePrompt`) · `rangkuman` terstruktur
   satu lembar A4 (+ gambar baru di `FIGURES` rangkumanDoc.js, `fill: none` untuk path) ·
   Mini Kuis **3 soal** ber-`hint` (boleh `plane_tap`) · rencana uji di `tests/sims.browser.mjs`.
4. Draf engine di scratchpad lalu dirakit (pola `assemble.py` sesi lalu) — JANGAN menyunting
   berkas yang dimuat server selama gerbang uji berjalan.
5. Verifikasi dengan MENGUKUR: tur visual tiap sub-topik di 740×360 & 1024×600, ukur luapan
   panduan di SETIAP langkah, jalankan setiap kasus sebagai siswa yang macet (3 salah + diam
   7 detik), pastikan setiap jawaban bisa diketik dengan papan angka.
6. Commit per sub-topik sesudah gerbang LULUS; laporan akhir berbahasa Indonesia + tangkapan
   layar, lalu tanyakan revisi.

### 4.1b Keputusan pengguna yang sudah mengikat (jangan ditawar ulang)
- Materi teks **tidak dihapus**: ia jadi **Rangkuman**, bukan layar pertama.
- Alur sub-topik: **pemantik → simulasi terpandu → kesimpulan → selebrasi → Rangkuman (terbuka
  sesudah simulasi selesai) → Mini Kuis 3 soal**.
- Ruang 3D dipakai bila perlu (sudah ada `domain/space/spaceView.js` + langkah `pad`).
- **Semua aturan §9** (tanpa kiasan, sudut pandang guru, petunjuk 3 salah/7 dtk, visual bersih,
  panduan ringkas, jawaban bisa diketik, Rangkuman terkunci) berlaku untuk setiap bab.

### 4.2 Kontrak yang tetap mengikat selama polish
- **Aksioma** (§1): aplikasi tidak pernah menghitung untuk siswa; kalimat toast tidak
  boleh memuat angka kunci.
- **Engine simulasi:** `CaseSimulation` di `simKit.js`; `solveStep()` satu-satunya jalan
  maju; visual konfirmasi (`onSolved`) digambar SESUDAH jawaban benar. Bidang dibuat per
  kasus dan dihancurkan di `goToCase`; referensi panah wajib di-reset per kasus.
- **Bidang:** `createVectorPlane(host, {xRange, yRange})` lalu
  `this.track(() => plane.destroy())`; wadah `.plane-host` bertinggi tercadangkan;
  `measure()` memakai kotak ISI (border SVG dikurangi) → 1 unit = 1 px CSS.
- **Domain:** tampilkan jawaban lewat `toLatexS(...Exact())`; periksa isian lewat
  `checkExactAnswer(displayString, key)` dengan TEKS papan angka ("2√5"). Perkalian
  silang sengaja tidak ada.
- **Visual:** `--ink-*` = teks di film & pelat terang; `--on-navy-*` = teks di layar
  instrumen gelap; kisi bidang memakai `--scope-grid*`/`--scope-axis`. Amber hanya untuk
  besaran; aksi utama kobalt. Jangan menulis hex langsung di berkas CSS komponen.
- Semua kontrak §3 (layer, mathpad, lanskap, nol layout shift, sasaran sentuh ≥44px,
  kontras ≥4,5:1, Git).

### 4.3 Uji wajib sebelum setiap commit
- `node tests/engine.test.mjs` → **132/132**.
- `py tests/validate_data.py` → **0 GAGAL** (saat ini 799 lolos, 0 PERINGATAN).
- `py tests/serve.py`, lalu `py tests/smoke.py` → **0 GAGAL** (saat ini 293 lolos dengan `--skip-suites`,
  ±8 menit; sudah menjalankan `tests/plane.html` **33/33** dan `tests/sims.html` **26/26**).
  Versi cepat tanpa kedua suite: `--skip-suites`. Server belum hidup: `--serve`.
- Suite peramban juga bisa dibuka manual: `/tests/plane.html` → `window.__planeTest`,
  `/tests/sims.html` → `window.__simTest`. **Pane peramban yang tersembunyi menahan
  `requestAnimationFrame`** sehingga sims tidak pernah selesai — pakai Playwright/`smoke.py`.
- Perubahan warna/tata letak diverifikasi di aplikasi pada 740×360 dan 1024×600, dengan tangkapan layar.
- Jebakan uji yang sudah dibayar:
  - Navigasi hash tidak memuat ulang modul → `location.reload()`. Di Windows, berkas yang
    dipulihkan mempertahankan mtime lama sehingga server menjawab 304 → sentuh berkasnya.
  - `page.wait_for_function` Playwright memasang listener global sendiri
    (`__playwright_global_listeners_check__`) dan menggagalkan uji listener `plane.html` → tunggu
    dengan jeda + `evaluate`.
  - Tombol "Lewati Simulasi" baru muncul sesudah 30 detik → masuk Mini Kuis lewat
    `sessionState.patchResume(lessonKey(bab, sub), { step: 1, simulationDone: true })`
    (sejak alur dua tahap: 0 = Simulasi, 1 = Mini Kuis).
  - **Playwright menggulir elemen ke dalam pandangan sebelum `click()`.** Uji tata letak gulir
    (mis. panduan yang menempel) mengatur `scrollTop` sendiri lalu mengukur, bukan mengandalkan klik.
  - `PointerEvent` sintetis di papan coret harus `pointerId: 1`; id lain ditolak `setPointerCapture`.
  - Konsol Windows cp1252: skrip Python wajib `sys.stdout.reconfigure(encoding="utf-8")`.
  - **Pemanggil Python di mesin ini `py`, bukan `python`** (alias Microsoft Store
    membajak `python` di shell Bash).
  - **Teks bermarkdown/LaTeX WAJIB lewat `mixed()`/`renderMixed()`.** `givenBlock()`,
    `chip.innerHTML`, dan `setPromptText()` menerima HTML apa adanya; yang lupa akan
    menampilkan `**tebal**` atau `$\vec{a}$` mentah ke siswa. Dijaga `smoke.py` §4
    (anotasi MathML KaTeX dikecualikan karena memang memuat sumber LaTeX).
  - Heredoc Bash sering merusak regex/kutip pada skrip Python sekali pakai — tulis
    skripnya ke berkas lebih dulu, jangan lewat `<<EOF`.
  - Raw-string Python mempertahankan `\"`: pakai raw-string **berkutip tunggal** untuk
    teks yang memuat tanda kutip (validator sekarang menangkapnya).
  - `net::ERR_NETWORK_CHANGED` (adaptor jaringan Windows berganti status) membatalkan pemuatan
    modul bahkan ke localhost → aplikasi tak pernah `data-app-ready`. `open_route` di `smoke.py`
    mengulang; skrip Playwright lain harus melakukan hal yang sama.
  - Uji area sentuh: `scrollIntoView({block:'center'})`, bukan `nearest` (menempel di tepi wadah
    gulir dan memotong `::after`); sampel hanya bagian yang terlihat; target di bawah overlay
    `.pad`/`.mathpad`/`.modal-scrim` bukan kebocoran.

---

## 5. PROJECT FILE TREE

```
vektor-lab-interaktif/
├── index.html                 SPA tunggal: backdrop, rotate-lock, boot loader, header
│                              (brand · navrail · progress-ring), #screen-host, footer, fs-btn;
│                              vendor lokal + cadangan CDN "cek global"
├── PRD.md                     kontrak produk (tema §7.1 "Meja Gambar Teknik" & §7.4 --hit-min diselaraskan Final Polish)
├── README.md                  cara jalan & perintah harian
├── handoff/handoff.md         dokumen ini
├── handoff/PROMPT_SESI_BARU.md  prompt pembuka siap-tempel untuk sesi berikutnya
├── docs/                      EDTECH_BLUEPRINT.md · Rancangan_Materi_Vektor_TKA.md · 4 gambar soal TKA
├── .claude/
│   ├── launch.json            server pratinjau → python tests/serve.py 5173
│   └── skills/                webapp-testing · test-driven-development · systematic-debugging ·
│                              verification-before-completion · writing-plans
├── skills/                    pustaka skills mentah (bukan kode aplikasi)
│
├── assets/vendor/             VENDOR.md · katex/ (js, css, 20 font woff2) · gsap/ (gsap, MotionPath) ·
│                              fonts/ (Barlow 400–700, Barlow Condensed 600/700, JetBrains Mono variabel + fonts.css)
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
│   ├── document.css           [components] dokumen Rangkuman A4 + aturan cetak
│   ├── vector.css             [domain] sel, kurung vektor kolom, chip, stage, sim, checklist
│   ├── plane.css              [domain] bidang kartesius SVG (.plane__*, titik ketuk 44px)
│   ├── simulations.css        [domain] sim-host, sim-board, case-bar, sim-steps, isian & jejak kerja
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
│   │   ├── ui/                mathpad.js · toast.js (show) · modal.js · icons.js · scratchpad.js · sfx.js · burst.js · tooltip.js · signaturePad.js
│   │   ├── interactions/      dragDrop.js · flyToAnimation.js · motion.js
│   │   └── render/            katexRenderer.js (renderMixed · renderToString · renderBlock)
│   ├── quiz/                  ══ generik ══
│   │   ├── questionBody.js    perender tunggal badan soal + renderDataTable
│   │   ├── quizEngine.js      Mini Kuis — umpan balik langsung
│   │   ├── examEngine.js      Ujian CBT — umpan balik tertunda, hasUnsavedWork()
│   │   └── quizResult.js      layar hasil (judul sub-topik dari ctx.subtopicTitles)
│   ├── lesson/
│   │   ├── lessonRenderer.js  LessonView: Simulasi → Mini Kuis (+ Rangkuman opsional)
│   │   ├── rangkumanDoc.js    Rangkuman → lembar A4 (identitas, tanda tangan, cetak)
│   │   ├── quizTypes.js       tipe soal Mini Kuis tambahan (plane_tap)
│   │   └── simulations/
│   │       ├── index.js       SIMULATION_REGISTRY · registerSimulation · mountSimulation
│   │       ├── simCore.js     kelas dasar Simulation + helper (renderColumnVector, dll.)
│   │       ├── simKit.js      CaseSimulation: kasus → langkah fields·choice·multi·tap, anggaran label
│   │       ├── simBasics.js   Bab 1 — 6 engine
│   │       ├── simOperations.js  Bab 2 — 8 engine
│   │       ├── simProducts.js Bab 3 — 6 engine
│   │       └── simModeling.js Bab 4 — 5 engine
│   └── domain/                ══ aritmetika eksak tanpa DOM + bidang SVG ══
│       ├── vector.js · surd.js · validator.js
│       └── plane/ planeGeometry.js · vectorPlane.js · arrow.js · arrowAnimation.js
│
├── data/
│   ├── lessons.json           manifest 4 bab (subtopicOrder = sumber kebenaran urutan & kunci),
│   │                          relevansi, prasyarat
│   ├── chapters/*.json        25 sub-topik: materi[] · simulation{engine, brief, config, toasts} · quiz[]
│   └── quizzes.json           banks per bab (6 soal) + tka_2026 (10 soal) + tkaSimulation.questionOrder
│
├── content/*.md               materi bacaan 4 bab (sinkron dengan JSON) + 3 arsip soal guru (DIBANGKITKAN)
│
└── tests/
    ├── serve.py               server dev no-cache  ← PAKAI INI
    ├── engine.test.mjs        Node murni, 130 uji (surd · vector · validator · geometri bidang)
    ├── plane.html · plane.browser.mjs   uji peramban bidang SVG, 32 uji → window.__planeTest
    ├── sims.html · sims.browser.mjs     uji peramban 25 engine + resume, 26 uji → window.__simTest
    ├── validate_data.py       validator data statis (Python murni), uji mutasi 14/14
    ├── smoke.py               uji asap Playwright end-to-end + menjalankan plane & sims
    └── archive_soal.py        pembangkit arsip guru → content/{QUIZ,TKA,MINI_KUIS}_ARCHIVE.md
```

**Ukuran saat ini:** ±21.600 baris JS + CSS, 4 berkas konten, 6 berkas data.

---

*Dokumen transisi. Bila isinya bertentangan dengan kode, kode yang diukur di peramban
yang benar — perbarui dokumen ini, jangan kodenya dipaksa mengikuti dokumen.*

---

## 6. ADENDUM 13 Okt 2026 — Finalisasi sub-topik 1 (gold standard)

Sub-topik 1 kini patokan untuk mereplikasi lima sub-topik Bab 1 lainnya. Semua butir
ter-commit dengan uji yang MERAH lebih dulu (atau uji mutasi), lalu gerbang penuh.

| Commit | Isi |
|---|---|
| `b8660da` | Temuan 3 & 4: koordinat tertukar SEBAGIAN dikenali; tab tahap berlabel; chip kasus 2×2 |
| `d27df4b` | Bidang = kertas grafik terang (`--plane-*`, `--scope-*` nilai baru), mata panah sumbu |
| `bc18e2d` | **Bug global:** mata panah `\vec` selebar 0px (reset `svg{max-width:100%}`) |
| `202c9e8` | Animasi lompatan per satuan (onSolved), panah kinestetik dua ketukan, `core/ui/sfx.js` |
| `604146b` | CTA kasus berikutnya di panggung + chip berdenyut; tombol sidebar terjepit |
| `90af8b7` | Bilah aksi Mini Kuis menempel (sticky) + zona FAB |
| `252ddcd` | Tempo animasi KONSTAN (`HOP_MS` 110, `ARROW_MS` 520), denyut amber pangkal |
| `23202b1` | Notasi baku: 410 `\vec{XY}` → `\overrightarrow{XY}` + `normalizeNotation()` |
| `65441e6` | Tombol suara di header (bawaan aktif, bisu tersimpan `vektorLab.sfx.v1`) |
| `8e4dd38` | Toast lanskap pendek: pelat ramping kanan bawah, ≤ 2,2 detik |
| `6be88c5` | Selebrasi simulasi tuntas (segel, lencana, rekap, statistik tertelusur) + 2 jalan |
| `1619a80` `7efc256` | "Coba Lagi Kuis" (rekor tidak turun). **Catatan jujur:** `1619a80` ter-commit dengan 3 GAGAL smoke §6b (gerbang hanya memeriksa ada keluaran); diperbaiki di `7efc256` (area sentuh tab mode review + isolasi uji). Gerbang commit kini mensyaratkan "GAGAL 0" eksplisit |
| `2b11aaf` | Mini Kuis interaktif: tipe `plane_tap` (soal 2 gambar QP, soal 3 ketuk R) |
| `f52bbc3` | UI premium: kartu bab (`.chapter-card`, aksen `--ch-1..4`), menu kuis, Beranda |

**Kontrak baru yang mengikat:**
- `.sim-guide` & bidang MENEMPEL; bilah aksi Mini Kuis menempel; zona FAB disisihkan.
- Selama `enablePointPicking` aktif, svg berkelas `.is-picking` dan panah tak-ketuk tuli
  pointer; titik tak-ketuk selalu tuli pointer.
- Selebrasi hanya pada penuntasan PERTAMA; statistiknya hanya yang bisa ditelusuri
  (jumlah kasus & langkah) — Kontrak 11. Lencana berbunyi "**Simulasi** Sub-topik n
  Tuntas", karena sub-topik baru tuntas di `progressStore` sesudah Mini Kuis.
- Latihan ulang Mini Kuis memakai `markSubtopicCompleted` (max rekor) — rekor tak turun.

**Uji terakhir:** Node 130/130 · data **755**/0/0 (+6 cek notasi; skema `plane_tap`,
4 mutan tertangkap) · plane **33**/33 · sims 26/26 · smoke penuh **219**/0 (217 dengan `--skip-suites`).

**Antrean berikutnya (§4.1):** lima sub-topik Bab 1 lain ke pola terpandu sub-topik 1
(+ Mini Kuis `plane_tap` bila cocok). **Catatan terbuka:** toast 740×360 (≤ 2,2 dtk)
masih bisa menutupi tombol di kolom kerja kanan sesaat (tembus-ketuk); toast galat
di layar besar tetap 5 detik.

---

## 7. ADENDUM 25 Okt 2026 — Tujuh revisi guru atas sub-topik 1

| Commit | Revisi | Isi |
|---|---|---|
| `b763b58` | 2 | **Label bidang tidak bertumpuk** di 25 simulasi: `VectorPlane.declutter()` (kandidat geser atas/bawah/kanan/kiri/diagonal ×1/1,6/2,3; rintangan = lingkaran titik non-hantu; prioritas label titik 3 > tag/busur 2 > panah 1). `sims.browser.mjs` memeriksa `labelClashes()` tiap kasus |
| `ab38e07` | 1 | **Simulasi tuntas tidak terulang sendiri**: kembali dari Mini Kuis/Rangkuman → penutup "Simulasi tuntas" (`showCompleteCover()`, papan disembunyikan), tombol `data-sim-action` = `restart`·`review`·`quiz`; mengulang hanya lewat **Ulangi** (`restart()`) |
| `f06510a` | 5 | **Pop-up kesimpulan** "Apa itu vektor?" (`simulation.conclusion` di JSON: definisi + contoh vektor/skalar + ingat) muncul sebelum selebrasi; **petunjuk** (`hint`) per soal Mini Kuis |
| `789a96c` | 6 | **Mini Kuis seru**: `sfx.select` saat memilih, `core/ui/burst.js` (pop-up ±1 dtk, tembus-ketuk, `aria-hidden`) + `sfx.correct`/`sfx.oops`, kartu `is-ok`/`is-no`; `plane_tap.reveal` menggambar panah siswa (soal 3: panah OR ke titik yang diketuk) |
| `eb034c1` | 7 | **Layar hasil Mini Kuis**: dial skor beranimasi + sinar, hitung naik + `sfx.fanfare`, statistik & rekor, tautan Beranda / Daftar Sub-topik / Coba Lagi Kuis, bilah aksi menempel |
| `3c6070e` | 3 | **Rangkuman = dokumen A4 potret** (`lesson/rangkumanDoc.js`, `css/document.css`): kepala bezel + identitas (nama, sekolah, tanggal), dua kolom seimbang, kaki bertanda tangan & nomor halaman; luapan diukur dari kotak tiap unit (bukan `scrollHeight` — kontainer berkolom tidak melaporkannya) lalu pindah lembar. Tombol **Cetak / Simpan PDF** (`#print-root` + `html.is-printing` + `@page A4`). Sub-topik 1 punya `rangkuman` terstruktur di JSON (`subtitle`, `sections[].blocks`, `notes`) sesuai simulasi; 24 sub-topik lain memakai materi lama per blok. Terukur: **25/25 muat 1 lembar**, PDF sub-topik 1 = 1 halaman. Layar masuk: **tanda tangan opsional** (`core/ui/signaturePad.js`, PNG terpangkas di `vektorLab.identity.v1.ttd`) |
| `bd32672` | 4 | **Nol UI bawaan**: `core/ui/tooltip.js` menggantikan SEMUA atribut `title` (23 titik + `index.html`) dengan `data-tip` — pelat grafit berpanah, delegasi di `document`, jeda hover 380 ms, fokus papan ketik langsung, sentuhan tidak memunculkan, `aria-describedby` saat tampil; jaring pengaman mengubah `title` yang tersisa saat disentuh. `::selection` bertema. (Scrollbar, modal, toast sudah kustom sejak awal.) **Satu-satunya yang tetap bawaan:** dialog cetak peramban — tidak bisa diberi gaya oleh halaman web |

**Kontrak baru yang mengikat:**
- Petunjuk melayang = `el.dataset.tip`, **jangan pernah `title`** (smoke §6j menghitung `[title]` = 0).
- Label bidang lewat `createLabel(tone, cls, priority)`/`placeLabel`; jangan memposisikan
  `foreignObject` label secara manual — `declutter()` yang menata.
- Tipe soal Mini Kuis baru didaftarkan lewat `QuizEngine.registerType(name, {render, answerKey})`
  (contoh: `lesson/quizTypes.js` → `plane_tap`).
- Rangkuman baru per sub-topik: isi `subtopic.rangkuman` terstruktur (lihat sub-topik 1),
  wajib muat satu lembar (smoke §6i mencatat jumlah lembar 25 sub-topik).
- Identitas `{nama, sekolah, ttd, at}`; `ctx.identity` & `ctx.onHome` tersedia di LessonView.
- Uji yang menyentuh progres wajib `progressStore.resetAll()` — `localStorage.clear()` saja
  ditulis balik dari memori.

**Uji terakhir (`bd32672`):** Node 130/130 · data 755/0/0 · plane 33/33 · sims 26/26 ·
smoke `--skip-suites` **250**/0 (1 CATATAN = jumlah lembar Rangkuman per sub-topik).

**Antrean berikutnya:** tunggu penilaian guru atas tujuh revisi ini, lalu §4.1 butir 2
(lima sub-topik Bab 1 lain ke pola terpandu, masing-masing dengan `conclusion`,
`rangkuman` terstruktur, dan Mini Kuis ber-`hint`).

---

## 8. ADENDUM 25 Okt 2026 (lanjutan) — Bab 1 dirombak total ke pola sub-topik 1

Keputusan guru (mengikat): ruang 3D **bisa diputar**; **kartu pemantik** di setiap sub-topik;
Mini Kuis **3 soal** per sub-topik; kelima sub-topik dikerjakan sekaligus lalu dinilai.

| Commit | Isi |
|---|---|
| `91aa183` | Bug: simulasi tuntas terulang sesudah peramban ditutup — status tuntas kini PERMANEN (`progressStore.markSimulationDone`, `startComplete`). Bunyi `sfx.reveal` (kesimpulan), `sfx.fanfare` (selebrasi), `sfx.page` (Rangkuman) |
| `d9a1ba2` | Infrastruktur: kartu pemantik (`subtopic.hook` + `lesson/hookArt.js`, sekali, `progress.hookSeen`), kesimpulan generik (`columns`, `formula`), `domain/space/spaceView.js` (ruang 3D SVG bisa diputar, Z-Up, 4 sudut pandang baku), langkah `pad` di simKit, `guidedKit.js` (lompatan, panah dua ketukan), `plane.drawPolygon/drawCircle`; validator §4b paket terpandu |
| `a3dffa0` | Sub-topik 2 `notation_guided` — satu vektor, tiga baju; vektor bebas dari pangkal $P(2,-4)$ (LKPD); bentuk baku. Rangkuman terstruktur kini dua kolom berurutan dengan bagian UTUH (`layoutColumns`) |
| `f69001b` | Sub-topik 3 `position_guided` — siswa MENEMUKAN $\overrightarrow{AB} = B - A$ dari denah; koordinat ratusan; mencari titik pangkal $R$ (LKPD) |
| `6877b46` | Sub-topik 4 `magnitude_guided` — persegi Pythagoras tumbuh (9 + 16 = 25); $\sqrt{20} = 2\sqrt5$; tanda minus terkuadratkan |
| `2c4d1d8` | Sub-topik 5 `unit_guided` — panah dipotong 5 bagian, $\hat v$ mendarat di lingkaran satuan; searah ⇒ satuan sama; vektor nol |
| `210a109` | `space_guided` — drone dikemudikan di ruang 3D (papan kemudi), balok bantu, Pythagoras dua kali ($5$ lalu $\sqrt{29}$); komponen nol; $\overrightarrow{AB}$ di ruang = $3\sqrt3$. Smoke §6l: keenam sub-topik (pemantik → simulasi terpandu, kesimpulan muat 740×360, Rangkuman 1 lembar) |

**Peta engine Bab 1:** `vector_anatomy` (simBasics.js) · `notation_guided` · `position_guided` ·
`magnitude_guided` · `unit_guided` · `space_guided` (simGuided.js). Engine lama
`notation_morph`, `position_vector`, `component_builder`, `magnitude_builder`, `unit_vector` dihapus.

**Kontrak baru yang mengikat:**
- Setiap sub-topik terpandu WAJIB punya paket: `hook` (art dari `hookArt.js`), `simulation.conclusion`
  (definisi ≤ ±130 karakter, ≤ 3 kolom), `rangkuman` terstruktur (≥ 2 catatan), Mini Kuis 3 soal ber-`hint`.
  Validator §4b (`GUIDED_SUBTOPICS`) dan smoke §6l menegakkannya; kesimpulan wajib muat 740×360 tanpa gulir.
- Engine terpandu memakai `guidedKit.js`: `animateHops`, `createArrowDrawer` (toast
  `pangkalBukanTitik`/`ujungBukanTitik` {titik}, `arahPanahTerbalik` {nama, balik} — validator `KIT_TOASTS`).
- Data soal tidak memakai `&nbsp;` di dalam `mixed()`; pakai `tex('… \\qquad …')`.
- Panggung 3D: `usesSpace(c)` + `spaceOptions(c)` → `this.space`; langkah `pad`
  `{buttons, onPress, onReset, status, check}`; harness `{ pad: [...], reset: true }`.
- `plane_tap.reveal` satu huruf wajib membawa `label` (`\\vec{u}`, `\\hat{v}`).

**Uji terakhir:** Node 130/130 · data 799/0/0 · plane 33/33 · sims 26/26 · smoke `--skip-suites` **280**/0 (`210a109`).

**Antrean berikutnya:** penilaian guru atas Bab 1; sesudah disetujui, pola yang sama untuk Bab 2–4.

---

## 9. ADENDUM 25 Okt 2026 (revisi guru atas Bab 1) — aturan baru untuk SEMUA bab

Tujuh revisi guru sesudah meninjau Bab 1. Aturan 1–7 di bawah **berlaku untuk setiap bab
berikutnya** — jangan diulangi kesalahannya.

| Commit | Revisi | Isi |
|---|---|---|
| `23180c8` | 6 | **Papan angka baru**: SATU mode seperti kalkulator ilmiah — tuts **√** (akar pada bagian aktif) dan **a/b** (penyebut) menyusun `2√5`, `1/√5`, `√5/5`, `−3`, `2,5` tanpa pindah mode. Ukuran papan TETAP (layar bentuk bertinggi tetap, 20 tuts; tuts yang tidak berlaku diredupkan & menjelaskan diri). `parseSurd` membaca akar di penyebut. Uji mesin **132** |
| `4402972` | 2, 3 | **Petunjuk** (`step.hint`) sesudah salah ≥ 3 kali atau diam 7 detik: kartu "Petunjuk" + sorotan kotak (`fields: 'wrong'`) + bayangan amber (`ghostHops`, `ghostCross`, `pulsePoint`, `ghostRoute3d`), dibersihkan saat langkah berganti. **Kontinuitas kasus**: kasus selesai dibuka lagi → keadaan akhir + "Ulangi kasus ini / Lanjut"; kasus berjalan dilanjutkan dari langkah terakhir (`caseProgress`, ikut disimpan sesi; diputar ulang seketika lewat `instant.js`) |
| `0881615` | 4 | Tombol **Rangkuman** terkunci sampai simulasi selesai; layar Mini Kuis selesai punya tombol Rangkuman (juga ikon di lanskap pendek) |
| `2adf415` | 1, 2, 5 | Bahasa **tanpa kiasan**, sudut pandang guru; panjang vektor mengikuti skenario guru (segitiga siku-siku → "apakah 7?" → Teorema Pythagoras → √20 = √4·√5 = 2√5 → tanpa gambar); vektor posisi fokus ke $\overrightarrow{AB}$ (tanpa panah O→B), titik berlabel koordinat + nama tempat; gambar Rangkuman tanpa blok hitam (`.docfig .d { fill: none }`); panduan ringkas + penjelasan guru di catatan kolom kerja (`intro`) |

**Aturan mengikat (dari guru):**
1. **Tanpa kiasan.** Formal tapi santai, bahasa sehari-hari, sudut pandang guru yang mengajar
   siswa belajar mandiri. Dilarang: "tiga baju", "rak", "ubin", "jalan memutar", "memotong",
   "mendarat", dsb. Tulis lugas: "satu vektor dapat ditulis dalam tiga bentuk".
2. **Alur guru:** gambar → pertanyaan → alat yang sudah dikenal → siswa menghitung sendiri
   langkah demi langkah → kasus yang lebih sulit → kasus tanpa gambar.
3. **Setiap langkah punya `hint`.** Tanpa `hint`, kit memakai kalimat umum — itu tanda engine belum selesai.
4. **Visual bersih:** gambar hanya yang dibahas langkah itu; titik berlabel koordinat
   (`A(2, 3)`) dan nama tempat bila ada cerita.
5. **Panduan (`.sim-guide`) = aksi singkat** (±2 baris, tinggi tetap). Penjelasan panjang
   masuk `intro` (catatan kolom kerja). Smoke §6m mengukur SETIAP langkah keenam sub-topik.
6. **Jawaban harus bisa diketik** dengan papan angka (uji di §6m: 1/√5).
7. **Rangkuman** hanya terbuka sesudah simulasi selesai.

**Uji terakhir (`2adf415`):** Node 132/132 · data 799/0/0 · plane 33/33 · sims 26/26 · smoke `--skip-suites` **293**/0.

---

## 10. ADENDUM 26 Okt 2026 — Bab 2 ditulis ulang ke pola terpandu (8 sub-topik)

Keputusan guru (mengikat): konteks cerita **mengikuti materi, tidak dipaksakan**, sudut pandang
guru seperti Bab 1; **tanpa LKPD** (kreasi sendiri); 8 sub-topik **sekaligus** lalu diperiksa;
**cukup 2D** — vektor tiga komponen boleh dipakai di kasus tanpa gambar dan di Mini Kuis, hanya
hitungannya (tanpa ruang 3D). Sesudah selesai: **push ke GitHub `mrpurnomo/ruang-vektor`**
(guru mem-publish manual di Vercel).

**Peta engine Bab 2** (`simOperations.js`, ditulis ulang; engine lama `triangle_rule`,
`parallelogram_rule`, `component_add`, `scalar_sweep`, `combo_vector_op`, `equality_link`,
`collinear_check`, `section_point` dihapus):

| Sub-topik | Engine | Kasus (yang pertama terpandu) |
|---|---|---|
| `penjumlahan_segitiga` | `triangle_guided` | Bersambung A→B→C (AC = a + b) · Digeser (siswa memindah b) · Poligon AD · Tanpa gambar (huruf, vektor nol, urutkan dulu) |
| `penjumlahan_jajargenjang` | `parallelogram_guided` | Geser b & a → jajar genjang, diagonal a + b · Diagonal selisih a − b · Latihan sudut keempat · 3 komponen |
| `operasi_komponen` | `component_guided` | Dari kisi ke pola komponen seletak · a − b = a + (−b) · 3 komponen · Beda dimensi |
| `perkalian_skalar` | `scalar_guided` | v + v + v = 3v · k = −2 · k = ½ · 3 komponen + \|kv\| = \|k\|\|v\| (4√14) |
| `kombinasi_operasi` | `combo_guided` | 2u − v di bidang (urutan) · 3u + 2v · −2u + v (3 komponen) · 2x + a = b |
| `kesamaan_vektor` | `equality_guided` | AB = CD beda letak, EF = −AB · dua persamaan · dua persamaan · 3 komponen |
| `titik_segaris` | `collinear_guided` | k = 3 + uji · k = −2 · k = 5/2 gagal uji · 3 komponen cari p, q |
| `pembagian_ruas_garis` | `section_guided` | 2 : 1 lewat bagian sama panjang → rumus bersilang · Titik tengah · 1 : 2 di ruang · 2 : (−1) di luar ruas |

**Perkakas baru (`guidedKit.js`):** `arrowStep(sim, {from, to, points, …})` = langkah panah dua
ketukan siap pakai (validator `KIT_TOASTS["arrowStep("]`), `ghostArrow(sim, from, to)` = ruas
bayangan petunjuk. Helper modul di `simOperations.js` (tanpa kalimat toast): `boundsOf`,
`vectorVerdict` (ok/sign/swap/other), `markPoint`, `growArrow`, `chainCopies`, `lineThrough`, `glow`.
Kalimat toast tetap literal `{ toast: '…' }` di tiap kelas supaya validator §3 bisa memeriksanya.

**Data:** setiap sub-topik Bab 2 punya `hook` (ilustrasi baru di `hookArt.js`: perpindahan, jajar,
komponen, kelipatan, kombinasi, kembar, segaris, bagi), `simulation.conclusion`, `rangkuman`
terstruktur (gambar baru di `FIGURES`: segitiga, jajargenjang, komponen, skalar, kombinasi,
kesamaan, segaris, pembagian), Mini Kuis 3 soal ber-`hint`. Soal baru: `b2_01_3` (plane_tap,
ujung a + b), `b2_05_2` (komponen z, 3 komponen), `b2_08_2` (titik tengah 3 komponen). Data
dibangun dengan skrip Python raw-string (bukan heredoc). `content/MINI_KUIS_ARCHIVE.md`
dibangkitkan ulang. `content/02_operasi_bangun_datar.md` (bacaan lama) BELUM disinkronkan.

**Uji:** validator `GUIDED_SUBTOPICS` + smoke `GUIDED_PACKAGES` (§6l paket & Rangkuman 1 lembar,
§6m panduan muat di setiap langkah 740×360) kini mencakup Bab 2; §6m baru: `k = 5/2` diketik
dengan tuts a/b. `sims.browser.mjs`: rencana 8 engine baru + `CASE_SUCCESS`. **Bug alat ukur
diperbaiki:** `planeRect()` hanya mengembalikan `.workspace__body` ke atas, padahal `<body>`
halaman uji juga wadah gulir (rig 620px > viewport 600px) sehingga `scrollIntoView` terbaca
sebagai "bidang bergeser 12–19px"; kini semua leluhur dikembalikan.

**Temuan & perbaikan saat verifikasi:** panduan sesudah kasus 1 pembagian ruas garis meluap
+13px (rumus `\dfrac` dua tingkat) → kalimat tanpa pecahan; salinan CD yang digeser menutupi AB
(AB tampak abu-abu) → salinan dibuang sesudah animasi; dua kiasan tersisa di b2_05_3
("disapukan", "diregangkan") diganti.

**Uji terakhir:** Node 132/132 · data **863**/0/0 · plane 33/33 · sims 26/26 · smoke penuh
**320**/0 (1 CATATAN = jumlah lembar Rangkuman: 25/25 satu lembar), ±22 menit.

**Antrean berikutnya:** penilaian guru atas Bab 2; sesudah disetujui, Bab 3 (Perkalian &
Proyeksi, 6 sub-topik) dengan pola yang sama.
