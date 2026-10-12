# HANDOFF — Ruang Vektor

> **Memori inti untuk sesi baru.** Baca dokumen ini SEBELUM menyentuh kode apa pun.
> Ditulis 17 September 2026; diperbarui 12 Oktober 2026 sesudah revisi Bab 1,
> purwarupa simulasi terpandu (commit `54455b8`), dan QA purwarupa (commit `2debdf2`).
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

### Temuan terbuka dari QA purwarupa (terukur, MENUNGGU keputusan pengguna — belum diubah)
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

> ### 🎯 MISI: REVISI PURWARUPA TERPANDU, LALU LANJUTKAN
>
> Pengguna sudah melihat purwarupa sub-topik 1 (baris 13 di §2) dan **punya revisi**.
> QA purwarupa (baris 14) sudah membereskan 5 bug terukur; revisi dari guru BELUM diterima.
> Sesi baru dimulai dengan MENANYAKAN/MEMBACA revisi itu (plus keputusan atas "Temuan terbuka"
> di §2), mengerjakannya, lalu baru melanjutkan daftar di §4.1. Jangan merombak ulang baris
> 1–14 tanpa diminta.

### 4.1 Antrean pekerjaan yang sudah disetujui pengguna

1. **Revisi purwarupa sub-topik 1** (menunggu arahan pengguna di sesi baru).
2. **Lima sub-topik Bab 1 sisanya** diubah ke pola terpandu yang sama:
   `notasi_penyajian` · `vektor_posisi` · `panjang_vektor` · `vektor_satuan` ·
   `komponen_r2_r3`. Pola: perintah di panggung, langkah `pick`/`fields`/`choice`,
   visual konfirmasi hanya di `onSolved`, latihan mandiri sebagai kasus tambahan.
3. **UI premium** (belum disentuh sama sekali):
   - Beranda: tipografi & kerning rusak pada skor TKA ("Belum   ada"), tata letak Hero
     + panel pencapaian dibuat lebih lega, aksen kobalt untuk Belajar dan amber untuk capaian.
   - Menu bab & menu kuis: ganti daftar putih polos dengan **kartu bab premium**
     (lencana nomor, bilah progres elegan, sketsa ikonik konsep bab, hover/active).
4. Mini Kuis dibuat lebih kontekstual dengan simulasi yang baru dipelajari.

### 4.1b Keputusan pengguna yang sudah mengikat (jangan ditawar ulang)
- Materi teks **tidak dihapus**: ia jadi **Rangkuman opsional**, bukan layar pertama.
- Pengerjaan **bertahap**: purwarupa dulu, dinilai, baru sisanya.
- Simulasi terpandu didahulukan daripada UI premium.

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
- `node tests/engine.test.mjs` → **130/130**.
- `py tests/validate_data.py` → **0 GAGAL** (saat ini 749 lolos, 0 PERINGATAN).
- `py tests/serve.py`, lalu `py tests/smoke.py` → **0 GAGAL** (saat ini 161 lolos,
  ±8 menit; sudah menjalankan `tests/plane.html` **32/32** dan `tests/sims.html` **26/26**).
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
│   │   ├── ui/                mathpad.js · toast.js (show) · modal.js · icons.js · scratchpad.js
│   │   ├── interactions/      dragDrop.js · flyToAnimation.js · motion.js
│   │   └── render/            katexRenderer.js (renderMixed · renderToString · renderBlock)
│   ├── quiz/                  ══ generik ══
│   │   ├── questionBody.js    perender tunggal badan soal + renderDataTable
│   │   ├── quizEngine.js      Mini Kuis — umpan balik langsung
│   │   ├── examEngine.js      Ujian CBT — umpan balik tertunda, hasUnsavedWork()
│   │   └── quizResult.js      layar hasil (judul sub-topik dari ctx.subtopicTitles)
│   ├── lesson/
│   │   ├── lessonRenderer.js  LessonView: Simulasi → Mini Kuis (+ Rangkuman opsional)
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
