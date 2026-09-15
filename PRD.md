# PRD.md — "Ruang Vektor"

> **Product Requirement Document**
> Media Pembelajaran Interaktif — Vektor, Matematika Tingkat Lanjut Kelas 11
> Kurikulum Merdeka · Target audiens: siswa SMAS YPVDP Bontang
> Disusun 16 September 2026 · Turunan langsung dari `docs/EDTECH_BLUEPRINT.md`

---

## DAFTAR ISI

| § | Bagian |
|---|---|
| 1 | [Ringkasan Produk](#1-ringkasan-produk) |
| 2 | [Kontrak Pedagogis](#2-kontrak-pedagogis) |
| 3 | [Spesifikasi Teknis](#3-spesifikasi-teknis) |
| 4 | [Arsitektur Sistem](#4-arsitektur-sistem) |
| 5 | [Kurikulum — 4 Bab, 25 Sub-Topik](#5-kurikulum--4-bab-25-sub-topik) |
| 6 | [Skema Data](#6-skema-data) |
| 7 | [Aturan UI/UX](#7-aturan-uiux) |
| 8 | [Lapisan Domain Vektor](#8-lapisan-domain-vektor) |
| 9 | [Strategi Pengujian](#9-strategi-pengujian) |
| 10 | [Urutan Eksekusi & Definition of Done](#10-urutan-eksekusi--definition-of-done) |
| 11 | [Di Luar Cakupan](#11-di-luar-cakupan) |

---

## 1. RINGKASAN PRODUK

### 1.1 Identitas

| Bidang | Nilai |
|---|---|
| **Nama produk** | Ruang Vektor |
| **Sub-judul** | Matematika Tingkat Lanjut — Kelas 11 |
| **Bentuk** | Single Page Application (SPA), satu berkas `index.html` |
| **Bahasa antarmuka** | Bahasa Indonesia, seluruhnya |
| **Orientasi** | **Lanskap saja**. Potret memunculkan `.rotate-lock` |
| **Tema** | **Deep Navy Canvas · White Cards · Vibrant Yellow**, permanen. Tidak ada pengalih tema |
| **Distribusi** | Hosting statis · GitHub Pages · **flash disk di lab sekolah (offline)** |
| **Footer wajib** | `© Penta Putra Purnomo, S.Pd., Gr. \| SMAS YPVDP Bontang.` |

### 1.2 Masalah yang dipecahkan

Siswa kelas 11 gagal di soal vektor TKA/SNBT bukan karena tidak paham definisi,
melainkan karena tidak pernah **mengerjakan** langkahnya sendiri. Buku dan video
menampilkan hasil; ujian meminta proses. Aplikasi ini menutup jarak itu dengan
satu cara: **setiap angka akhir harus keluar dari kepala siswa.**

### 1.3 Tujuan terukur

| # | Tujuan | Cara mengukurnya |
|---|---|---|
| 1 | Siswa dapat menghitung modulus dalam **bentuk akar eksak** | Sub-topik `panjang_vektor` tuntas tanpa bantuan |
| 2 | Siswa dapat menurunkan sudut dari $\cos\theta = \frac{u \cdot v}{\|u\|\|v\|}$ dalam tiga tahap terpisah | Sub-topik `sudut_antar_vektor` tuntas |
| 3 | Siswa mengenali 4 taktik TKA dan tahu kapan memakainya | Bab 4 tuntas + skor Latihan TKA ≥ 70 |
| 4 | Aplikasi berjalan penuh **tanpa internet** | Uji dengan jaringan dimatikan |
| 5 | Seluruh alur bisa diselesaikan **dengan jempol, satu tangan, di ponsel 6 inci lanskap** | Uji sentuh manual + target ≥ 44px |

### 1.4 Persona

| Persona | Kebutuhan | Konsekuensi desain |
|---|---|---|
| **Siswa** (15–17 th, ponsel Android kelas menengah, jaringan sekolah tidak stabil) | Latihan berulang, umpan balik yang menjelaskan | Vendor lokal, papan angka kustom, toast berkalimat sebab |
| **Guru** (pemilik repo) | Arsip soal cetak yang **selalu sinkron** dengan yang dilihat siswa | `tests/archive_soal.py` membangkitkan arsip DARI `quizzes.json` — tidak pernah ditulis tangan |
| **Perangkat kelas bersama** | Dipakai bergantian beberapa siswa | Identitas terpisah dari progres + tombol "Ganti Akun" |

---

## 2. KONTRAK PEDAGOGIS

### 2.1 Aksioma Tunggal

> # **APLIKASI TIDAK PERNAH MENGHITUNG UNTUK SISWA.**

Ini penyaring keputusan nomor satu. `js/domain/vector.js` memang punya `dot()`,
`norm()`, `angleBetween()`, `projScalar()` — tetapi fungsi-fungsi itu **hanya**
dipakai untuk:

1. **memeriksa** jawaban yang sudah diketik siswa, dan
2. **membangkitkan kunci** soal saat penulisan data.

Tidak pernah untuk menampilkan hasil yang belum dikerjakan siswa.

### 2.2 Bentuk pelanggaran khas domain Vektor

Di Matriks, pelanggaran aksioma mudah terlihat: angka muncul di sel. Di Vektor,
ia **menyamar sebagai gambar yang terlalu pintar**.

| Godaan | Yang benar |
|---|---|
| Seret ujung vektor → `‖v‖ = 5.39` tampil hidup | Tampilkan **komponennya saja** ($v = (2,5)$). Panjang muncul setelah siswa mengisi $\sqrt{2^2+5^2}$ |
| Busur sudut otomatis berlabel $58^\circ$ | Busur digambar **tanpa angka**. Siswa isi $u \cdot v$ → $\|u\|$, $\|v\|$ → baru $\theta$ |
| Resultan tergambar begitu dua vektor ada di kanvas | Siswa **memindahkan pangkal** $v$ ke ujung $u$ dulu (tap-tap), baru resultan boleh digambar |
| Garis tegak lurus proyeksi jatuh otomatis | Siswa memilih dulu **vektor mana yang jadi alas**, baru menghitung skalarnya |
| $\|v\| = 5.385164807$ | **Bentuk akar eksak**: $\sqrt{29}$ |

### 2.3 Sebelas kontrak turunan (wajib, masing-masing punya pengujian)

| # | Kontrak |
|---|---|
| 1 | Aplikasi tidak pernah menghitung untuk siswa |
| 2 | `alert()` / `confirm()` / `prompt()` **dilarang total** — pakai `toast.js` & `modal.js` |
| 3 | Seluruh input angka lewat **papan angka kustom**; field selalu `readOnly` + `inputmode="none"` |
| 4 | Setiap penolakan interaksi wajib disertai **ALASAN** berupa kalimat |
| 5 | Setiap drag **wajib punya padanan tap-tap** (atau tidak ada drag sama sekali) |
| 6 | Setiap pilihan **imun klik-beruntun** — kunci diambil sinkron lewat `claim()` |
| 7 | **Viewport terkunci**, nol gulir halaman |
| 8 | **Nol pergeseran tata letak** — `remove()` dilarang untuk elemen yang menempati aliran |
| 9 | Setiap soal **menuliskan pertanyaannya**, tepat di atas pilihan (bidang `after`) |
| 10 | Teks ber-markdown wajib lewat `renderMixed()` |
| 11 | Jangan pernah menampilkan angka yang tidak bisa ditelusuri siswa |

### 2.4 Tes tiga pertanyaan

Sebelum menambahkan mekanik apa pun. Satu "tidak" = rancang ulang.

1. Apakah siswa **mengerjakan** matematikanya sendiri, atau hanya menyaksikan?
2. Kalau siswa salah, apakah ia tahu **KENAPA** — dari kalimat, bukan dari warna?
3. Apakah ini bisa diselesaikan **dengan jempol** di ponsel 6 inci, satu tangan?

### 2.5 Fitur yang dicabut permanen

**Pengalih tema** (mode gelap/terang) · streak harian · pengatur kecepatan
animasi · lencana tanpa sistem lencana · mekanik "titik temu".
**Jangan dihidupkan lagi.**

> Yang dicabut adalah **pengalihnya**, bukan pilihan warnanya. Aplikasi ini
> memakai satu tema tetap berkanvas navy (§7.1); yang dilarang adalah
> menghadirkan dua tema yang bisa ditukar siswa.

---

## 3. SPESIFIKASI TEKNIS

### 3.1 Tumpukan

| Lapisan | Pilihan |
|---|---|
| Bahasa | HTML5 + CSS3 + **JavaScript ES Modules** |
| Build | **TIDAK ADA** — tanpa npm, tanpa bundler, tanpa `node_modules` di repo |
| Backend | **TIDAK ADA** — JSON statis + `localStorage` |
| Cara jalan | `python -m http.server 5173` (ES Modules butuh `http://`, bukan `file://`) |
| Matematika | KaTeX 0.16.9 — **vendor lokal**, dibungkus `katexRenderer.js` |
| Animasi | GSAP 3.12.5 + MotionPathPlugin — **vendor lokal**, dipakai selektif |
| Ikon | SVG inline (`js/core/ui/icons.js`). Emoji **dilarang** sebagai ikon struktural |
| Penyimpanan | `localStorage` (permanen) + `sessionStorage` (posisi sesi) |
| Pengujian | Node murni (`engine.test.mjs`) + Playwright Python (`smoke.py`) |

### 3.2 Nol-Build — harganya dibayar sadar

| Keuntungan | Harga |
|---|---|
| Umur simpan panjang, tidak ada dependensi yang membusuk | Setiap komponen UI ditulis sendiri |
| Performa tinggi, tanpa hidrasi framework | Tanpa type-checking — dikompensasi pengujian pengukuran |
| **Bisa dijalankan dari flash disk tanpa internet** | Urutan `<link>` CSS mengikat |
| Debugging jujur — DevTools menampilkan berkas sumber persis | Refactor lintas-berkas manual |

**Verdict: PERTAHANKAN NOL-BUILD.** Alasan terkuatnya lapangan, bukan teknis:
aplikasi dipakai di lab sekolah dengan jaringan yang tidak bisa diandalkan.

### 3.3 Vendor lokal — WAJIB sejak awal

```
assets/vendor/
├── katex/   katex.min.css · katex.min.js · fonts/
├── gsap/    gsap.min.js · MotionPathPlugin.min.js
└── fonts/   Montserrat + Roboto + Roboto Mono (woff2, subset latin)
```

Dimuat **tanpa** atribut `integrity` (SRI hanya bermakna untuk CDN).
Salinan CDN boleh dipertahankan sebagai cadangan lewat pola `onerror`.
**Jangan memuat SortableJS** — sistem seret memakai Pointer Events sendiri.

### 3.4 Dukungan peramban

Chrome 99+ · Edge 99+ · Safari 15.4+ · Firefox 97+ (batas `@layer`, Maret 2022).
Bila tablet kelas ternyata lebih tua, jatuh kembali ke urutan `<link>` eksplisit —
**dan tetap pertahankan aturan satu-komponen-satu-berkas.**

### 3.5 Permukaan pengujian

```js
window.__vektorLab = { state, router, navigate, getOverallProgress, getIdentity, setIdentity };
```

Penanda kesiapan: `document.documentElement.dataset.appReady = 'true'`,
dipasang di blok **`finally`**.

---

## 4. ARSITEKTUR SISTEM

### 4.1 Pohon direktori

```
vektor-lab-interaktif/
├── index.html                  satu-satunya halaman
├── PRD.md · README.md
├── docs/                       EDTECH_BLUEPRINT.md + rancangan materi + gambar TKA
│
├── js/
│   ├── core/                   ══ TIDAK TAHU APA-APA SOAL VEKTOR ══
│   │   ├── router.js
│   │   ├── state/              progressStore.js · sessionState.js
│   │   ├── ui/                 mathpad.js · scratchpad.js · toast.js · modal.js · icons.js
│   │   ├── interactions/       dragDrop.js · flyToAnimation.js · motion.js
│   │   └── render/             katexRenderer.js
│   │
│   ├── quiz/                   ══ GENERIK, DUA KONTRAK BERLAWANAN ══
│   │   ├── quizEngine.js       Mini Kuis — umpan balik LANGSUNG
│   │   ├── examEngine.js       Ujian CBT — umpan balik TERTUNDA
│   │   └── quizResult.js
│   │
│   ├── domain/                 ══ SELURUHNYA BARU ══
│   │   ├── vector.js           matematika MURNI, tanpa DOM
│   │   ├── surd.js             aritmetika akar eksak
│   │   ├── validator.js        aturan boleh/tidak + kalimat penjelasnya
│   │   └── plane/
│   │       ├── vectorPlane.js  kanvas kartesius SVG
│   │       ├── arrow.js        primitif panah, kepala panah, busur sudut
│   │       └── arrowAnimation.js
│   │
│   ├── lesson/
│   │   ├── lessonRenderer.js
│   │   └── simulations/
│   │       ├── simCore.js      kelas dasar Simulation + helper render vektor
│   │       ├── index.js        REGISTRY: string → kelas engine
│   │       ├── simBasics.js       engine Bab 1
│   │       ├── simOperations.js   engine Bab 2
│   │       ├── simProducts.js     engine Bab 3
│   │       └── simModeling.js     engine Bab 4
│   │
│   └── app.js                  komposisi layar + pendaftaran rute
│
├── css/    tokens · layout · components · workspace · quiz · mathpad
│           scratchpad · animations · scrollbars · vector · plane · simulations
│
├── data/   lessons.json · quizzes.json · chapters/*.json
├── content/ *.md                materi bacaan + arsip soal ter-generate
├── assets/vendor/               katex · gsap · fonts
└── tests/  engine.test.mjs · smoke.py · validate_data.py · archive_soal.py
```

### 4.2 Batas Core ↔ Domain — bisa ditegakkan, bukan sekadar konvensi

> Tidak satu pun berkas di `js/core/` dan `js/quiz/` boleh memuat kata
> "vektor", "vector", "dot", "proyeksi", atau nama domain lainnya.

```bash
grep -riE "vektor|vector|dot|proyeksi|matriks|matrix" js/core js/quiz
```

Keluaran kosong = batasnya utuh. **Ini bagian uji di `smoke.py`**, bukan niat baik.

### 4.3 Tiga titik sambung — jaga jumlahnya tetap tiga

| # | Titik sambung | Bentuk |
|---|---|---|
| 1 | **Registry simulasi** | `simulations/index.js` memetakan `string → kelas` |
| 2 | **Data JSON** | `data/chapters/*.json` menyebut `simulation.engine` sebagai string |
| 3 | **Kelas dasar `Simulation`** | Engine domain mewarisinya; inti hanya memanggil `build()` & `destroy()` |

Router, penyimpanan, papan angka, papan coret, toast, modal, mesin kuis —
**tidak boleh tahu** bahwa aplikasi ini soal vektor.

### 4.4 Rute

```
#/login                            Layar masuk (nama & asal sekolah)
#/                                 Menu utama
#/belajar                          Daftar bab
#/belajar/:chapterId               Daftar sub-topik
#/belajar/:chapterId/:subtopicId   Satu sub-topik (Materi → Simulasi → Mini Kuis)
#/kuis                             Menu kuis
#/kuis/:mode/:bankId               Sesi kuis / ujian
#/tka                              Latihan Soal TKA
```

Tiga keputusan router yang wajib dipertahankan:
1. **Penjaga berjalan SEBELUM pengecekan "hash yang sama"**.
2. **Pengalihan memakai `history.replaceState`**, bukan `location.hash`.
3. **Penjaga dipasang sekali di router**, bukan ditulis ulang tiap handler.

### 4.5 Dua penyimpanan dengan umur berbeda — JANGAN dicampur

| | `progressStore.js` | `sessionState.js` |
|---|---|---|
| Media | `localStorage` | `sessionStorage` |
| Isi | **PENCAPAIAN** | **POSISI** |
| Umur | Selamanya, sampai "Reset Progres" | Selama tab dibuka |
| Pemilik | **Perangkat**, bukan satu siswa | Sesi berjalan |
| Kunci | `vektorLab.v1` | `vektorLab.session.v1` |

**Kunci sub-topik DIHITUNG, tidak DISIMPAN** — `isSubtopicUnlocked()`
menyimpulkannya dari `subtopicOrder` + status sub-topik sebelumnya.

**Identitas** hidup di kunci sendiri (`vektorLab.identity.v1`), **bukan** di
dalam `progressStore`. Dua aturan berpasangan:
1. Identitas menempel ⇒ **WAJIB ada tombol "Ganti Akun"**.
2. Keluar akun membuang identitas + posisi, **TIDAK** membuang pencapaian.

**Pola ketahanan wajib:** uji tulis **sungguhan** (`setItem` + `removeItem`)
dalam `try/catch`, jatuh ke cache memori bila gagal. Mode privat Safari punya
objek `localStorage` yang **ada** tetapi `setItem()`-nya melempar.

### 4.6 Kontrak siklus hidup — `mountScreen()`

```js
clearToasts();
closeMathpad();                 // pad hidup di document.body
anchorToasts(null);
state.activeView?.destroy();    // LessonView / ExamEngine / scratchpad
killAllMotion();                // HARUS mendahului pembongkaran DOM
screenHost.innerHTML = '';
```

Yang **selamat** dari `innerHTML = ''` dan wajib dibunuh eksplisit:
timeline GSAP · chip terbang di `document.body` · peta `zones` di `dragDrop.js` ·
`setTimeout` tertunda · `ResizeObserver` papan coret **dan kanvas SVG** ·
listener `window` · mathpad di `document.body` · gaya global.

---

## 5. KURIKULUM — 4 BAB, 25 SUB-TOPIK

### 5.1 Peta peleburan 8 Fase → 4 Bab

| Bab | Fase sumber | Fokus |
|---|---|---|
| **1. Konsep Dasar Vektor** | Fase 1 + 2 | Representasi visual, notasi, vektor posisi, modulus, vektor satuan |
| **2. Operasi & Bangun Datar** | Fase 3 + 4 + 5 | Operasi aljabar & geometri, kesamaan vektor, titik segaris, pembagian ruas garis |
| **3. Perkalian & Proyeksi** | Fase 6 + 7 | Dot product, sudut, syarat ortogonal, proyeksi skalar & vektor |
| **4. Pemodelan TKA & Geometri Ruang** | Fase 8 + seluruh Taktik TKA | Parameter tersembunyi, bangun segiempat, kinematika, diagonal balok |

> **Aturan dua-lapis.** Konsep diajarkan **tuntas di bab asalnya**; *taktik
> pengerjaan soal TKA*-nya diajarkan **tuntas lagi di Bab 4** sebagai
> masterclass pemodelan. Tidak ada materi yang terpotong di kedua lapis.

### 5.2 Bab 1 — `01_konsep_dasar` (6 sub-topik)

| # | ID sub-topik | Judul | Engine | Isi inti |
|---|---|---|---|---|
| 1 | `pengertian_notasi` | Pengertian & Anatomi Vektor | `vector_anatomy` | Besaran ber-**nilai** dan ber-**arah**; perpindahan vs titik statis; pangkal & ujung; $\vec{BA} = -\vec{AB}$ |
| 2 | `notasi_penyajian` | Empat Cara Menulis Vektor | `notation_morph` | $\vec{a}$ / $\mathbf{a}$ · kolom · pasangan terurut · basis $\hat{i}, \hat{j}, \hat{k}$ |
| 3 | `vektor_posisi` | Vektor Posisi | `position_vector` | $\vec{OA} = \vec{a}$; $\vec{AB} = B - A$ |
| 4 | `komponen_r2_r3` | Komponen di Bidang & Ruang | `component_builder` | Komponen $x$, $y$, $z$; tanda arah; **maksimum tiga komponen** |
| 5 | `panjang_vektor` | Modulus (Panjang Vektor) | `magnitude_builder` | $\|\vec{v}\| = \sqrt{x^2+y^2}$ dan $\sqrt{x^2+y^2+z^2}$; **akar eksak** |
| 6 | `vektor_satuan` | Vektor Satuan | `unit_vector` | $\hat{e} = \frac{\vec{v}}{\|\vec{v}\|}$; kasus batas vektor nol |

### 5.3 Bab 2 — `02_operasi_bangun_datar` (8 sub-topik)

| # | ID sub-topik | Judul | Engine | Isi inti |
|---|---|---|---|---|
| 1 | `penjumlahan_segitiga` | Aturan Segitiga & Poligon | `triangle_rule` | Ujung ke pangkal; resultan pangkal-awal → ujung-akhir |
| 2 | `penjumlahan_jajargenjang` | Aturan Jajar Genjang | `parallelogram_rule` | Dua pangkal berimpit; resultan = diagonal |
| 3 | `operasi_komponen` | Jumlah & Selisih Komponen | `component_add` | $\vec{a} \pm \vec{b}$ komponen seletak; makna geometris $\vec{a}-\vec{b}$ |
| 4 | `perkalian_skalar` | Perkalian Skalar dengan Vektor | `scalar_sweep` | $k\vec{v}$; $k>0$ arah sama, $k<0$ arah berlawanan |
| 5 | `kombinasi_operasi` | Kombinasi Operasi | `combo_vector_op` | $2\vec{u} - 3\vec{v}$ — bongkar tuntas tiap tahap |
| 6 | `kesamaan_vektor` | Kesamaan Dua Vektor | `equality_link` | Semua komponen seletak sama persis |
| 7 | `titik_segaris` | Titik-Titik Segaris (Kolinier) | `collinear_check` | $\vec{AB} = k\,\vec{BC}$ |
| 8 | `pembagian_ruas_garis` | Pembagian Ruas Garis | `section_point` | $\vec{p} = \frac{m\vec{b} + n\vec{a}}{m+n}$, dalam & luar |

### 5.4 Bab 3 — `03_perkalian_proyeksi` (6 sub-topik)

| # | ID sub-topik | Judul | Engine | Isi inti |
|---|---|---|---|---|
| 1 | `dot_product` | Perkalian Titik | `dot_builder` | $\vec{a}\cdot\vec{b} = a_1b_1 + a_2b_2 + a_3b_3$; hasilnya **skalar** |
| 2 | `sifat_perkalian` | Sifat & Tanda Hasil | `product_property_cards` | Komutatif, distributif; tanda hasil → lancip / siku / tumpul |
| 3 | `sudut_antar_vektor` | Sudut Antara Dua Vektor | `angle_solver` | $\cos\theta = \frac{\vec{a}\cdot\vec{b}}{\|\vec{a}\|\|\vec{b}\|}$ — **tiga tahap terpisah** |
| 4 | `vektor_tegak_lurus` | Syarat Ortogonal | `perpendicular_check` | $\vec{a}\cdot\vec{b}=0$ untuk vektor tak-nol |
| 5 | `proyeksi_skalar` | Proyeksi Skalar Ortogonal | `scalar_projection` | $\|\vec{c}\| = \frac{\vec{a}\cdot\vec{b}}{\|\vec{b}\|}$ |
| 6 | `proyeksi_vektor` | Vektor Proyeksi Ortogonal | `vector_projection` | $\vec{c} = \left(\frac{\vec{a}\cdot\vec{b}}{\|\vec{b}\|^2}\right)\vec{b}$ |

### 5.5 Bab 4 — `04_pemodelan_tka` (5 sub-topik)

| # | ID sub-topik | Judul | Engine | Taktik |
|---|---|---|---|---|
| 1 | `parameter_modulus` | Parameter Tersembunyi pada Modulus | `parameter_hunter` | **Taktik TKA 1** — TKA No. 12 |
| 2 | `bangun_segiempat` | Bedah Bangun Segiempat | `quad_builder` | **Taktik TKA 2** — TKA No. 13 |
| 3 | `kinematika_lintasan` | Kinematika & Proporsionalitas | `chain_displacement` | **Taktik TKA 3** — TKA No. 14 |
| 4 | `diagonal_balok` | Vektor Diagonal Balok | `box_diagonal` | **Taktik TKA 4** — diagonal bidang & ruang |
| 5 | `sniper_komponen` | Teknik Sniper Komponen | `sniper_component` | Ekstraksi satu suku yang memuat parameter |

### 5.6 Pra-Materi (prasyarat wajib)

Ditampilkan sebagai kartu pembuka di `#/belajar`, bukan sub-topik berkunci:

1. **Teorema Pythagoras lanjut** — menyederhanakan bentuk akar, diagonal ruang 3D.
2. **Aljabar kuadratik** — mengkuadratkan kedua ruas, memfaktorkan.
3. **Sifat bangun datar** — jajar genjang, trapesium sama kaki.
4. **Perbandingan senilai** — proporsionalitas jarak dan waktu.

### 5.7 Relevansi materi

Kartu pembuka di menu utama: komputasi & AI · astronomi & navigasi GPS ·
fisika (gaya, medan elektromagnetik, gaya Lorentz).

---

## 6. SKEMA DATA

### 6.1 `data/lessons.json`

```json
{
  "schemaVersion": 1,
  "title": "Ruang Vektor",
  "subtitle": "Matematika Tingkat Lanjut — Kelas 11",
  "chapters": [
    {
      "id": "01_konsep_dasar",
      "number": 1,
      "title": "Konsep Dasar Vektor",
      "tagline": "Kenali arah dan besar sebelum menghitung apa pun.",
      "accent": "primary",
      "src": "data/chapters/01_konsep_dasar.json",
      "subtopicOrder": ["pengertian_notasi", "notasi_penyajian", "vektor_posisi",
                        "komponen_r2_r3", "panjang_vektor", "vektor_satuan"]
    }
  ]
}
```

`subtopicOrder` adalah **sumber kebenaran urutan DAN kunci**.
`accent` yang tersedia: `primary` · `coral` · `amber` · `success`.

### 6.2 Jenis blok `materi[]`

| `t` | Bidang | Tampilan |
|---|---|---|
| `p` | `x` | Paragraf |
| `def` | `title`, `x` | Kartu definisi |
| `tip` | `title`, `x` | Kartu tips |
| `warn` | `title`, `x` | Kartu peringatan |
| `tex` | `x` | Rumus display mode |
| `steps` | `items[]` | Daftar bernomor |
| `list` | `items[]` | Daftar berpoin |
| `typegroup` | `n`, `title`, `lead`, `items[{name,tex,text}]`, `note` | Kelompok klasifikasi |
| `carousel` | `items[]` | Kartu bergeser |

### 6.3 Empat tipe soal

| Tipe | Bentuk jawaban | Bidang kunci |
|---|---|---|
| `mathpad` | `string` | `answer` (angka), `tolerance` |
| `single_choice` | `number` indeks | `options[]`, `answerIndex` |
| `multi_select` | `number[]` terurut | `options[]`, `answerIndices`, `perOptionFeedback` |
| `matrix_input` | `string[][]` | `rows`, `cols`, `answer` — vektor kolom R³ = `rows:3, cols:1` |

**Urutan bidang soal — kontrak yang tidak boleh dilanggar:**

```
prompt  → konteks        ("Perhatikan dua vektor berikut!")
table   → data tabel
tex     → data rumus
after   → PERTANYAANNYA  ("**Tentukan besar sudut antara $u$ dan $v$.**")
options → pilihan
```

Setiap soal **wajib** punya `id`, `input_type`, `subtopic`, `prompt`, `after`,
`explanation`, `toastWrong`.

### 6.4 Aturan menulis LaTeX di dalam JSON

| Aturan | Contoh |
|---|---|
| Backslash di JSON **selalu ganda** | `"$\\sqrt{29}$"` |
| Hanya `$…$` yang dikenali `renderMixed()` | `$$…$$` → dolar mentah. Pakai bidang `tex` |
| Skrip Python penulis LaTeX **wajib raw string** | `r"\times"` |
| Placeholder toast memakai kurung **ganda** | `{{indeks}}` |
| Tabel ditulis sebagai **data**, bukan markdown | `{headers, rows}` |
| Norma ditulis `\\|v\\|` atau `\\lVert v \\rVert` | Jangan `\|v\|` telanjang |
| Setiap `$…$` berjumlah **GENAP** | Dolar ganjil = LaTeX bocor ke layar |

### 6.5 Validator data — ditulis di Fase 1, bukan Fase 15

`tests/validate_data.py` memeriksa:
1. Setiap ID di `subtopicOrder` punya blok di `chapters/*.json` (dan sebaliknya).
2. Setiap `simulation.engine` terdaftar di `SIMULATION_REGISTRY`.
3. Setiap soal punya `id` unik, `subtopic` yang ada, `after`, `explanation`, `toastWrong`.
4. `answerIndex < len(options)`; `answerIndices` ⊆ indeks yang sah.
5. `matrix_input`: `len(answer) == rows`, `len(answer[0]) == cols`.
6. Setiap `{{placeholder}}` di `toasts` ada nilainya di pemanggilan engine.
7. Setiap `$…$` berjumlah genap.

---

## 7. ATURAN UI/UX

### 7.1 Tema: Deep Navy Canvas · White Cards · Vibrant Yellow (permanen)

Satu tema, dipasang permanen. **Tidak ada pengalih tema dan tidak ada mode
gelap** — yang dicabut di Blueprint §1.5 adalah *pengalihnya*, bukan
pilihan warnanya. `<html data-theme="light">` **tetap dipasang**: sejumlah
komponen memakainya untuk menentukan warna teks tombol, dan mencabutnya akan
mematikan aturan-aturan itu diam-diam. Ia menandai *"kartu bacanya terang"*,
bukan *"kanvasnya terang"*.

**Palet sumber** — angka inilah acuan desain:

```css
--navy-900: #060F2B;   /* sumur terdalam       */
--navy-800: #0A1B45;   /* KANVAS UTAMA         */
--navy-700: #122A5E;   /* bilah header & footer */
--yellow:   #FFC800;   /* WARNA NILAI          */
--royal:    #1D4ED8;   /* interaktif, di atas putih */
--white:    #FFFFFF;   /* KARTU BACA           */
```

**Pemetaan semantik** — inilah yang dipakai komponen:

```css
--bg-canvas:     var(--navy-800);   /* bidang kartesius        */
--bg-surface:    var(--white);      /* kartu baca — selalu putih */
--bg-instrument: var(--navy-800);   /* panel alat DI DALAM kartu */
--ink-900:       var(--ink);        /* teks di atas KARTU      */
--on-navy:       #F2F6FF;           /* teks di atas KANVAS     */
--value:         var(--yellow);
--brand-primary: var(--royal);
```

> **Ganti nilainya, PERTAHANKAN namanya.** Kalau menambah warna: tambahkan di
> palet sumber lalu petakan — **jangan pernah menulis hex langsung di berkas
> komponen.**

#### Tiga aturan yang menjaga tema ini tetap benar

**1. Dua skala tinta, bukan satu.**
`--ink-*` untuk teks di atas **kartu putih**; `--on-navy-*` untuk teks di atas
**kanvas navy**. Memakai yang salah menghasilkan teks yang **hilang**, bukan
sekadar jelek. Tinta *bawaan* adalah tinta kartu, karena hampir seluruh teks
aplikasi hidup di dalam kartu — daftar elemen yang duduk langsung di kanvas
sengaja dijaga pendek dan dicatat di `css/shell.css` §8.

**2. Kuning adalah warna NILAI.**
Kuning dipakai hampir eksklusif untuk **angka yang dihasilkan atau harus
dihasilkan siswa**: pratinjau papan angka, isian jawaban yang sedang aktif,
penghitung progres, dan tombol aksi utama. Label, judul, dan kerangka tidak
pernah kuning. Aturan ini membuat Aksioma §2.1 terbaca dari paletnya sendiri.

> Konsekuensi kontras: `#FFC800` di atas putih hanya mencapai 1,6:1. Ia hanya
> boleh dipakai sebagai **latar** atau **di atas navy**. Untuk teks kuning di
> atas putih, pakai `--accent-amber` (`#8A6200`, 6,4:1).

**3. Navy di dalam kartu berarti "ini alat".**
Satu-satunya objek gelap di dalam kartu putih adalah **bidang kartesius SVG**
dan **papan angka**. Keduanya instrumen, bukan bacaan — dan latar gelapnya
yang menyatakan itu tanpa satu kata pun.

#### Karakter visual

Modern, **flat design** tanpa bevel: kanvas navy pekat sebagai bidang
koordinat (kisi satuan + kisi mayor + dua batang vektor yang hanyut pelan),
kartu putih opak dengan sudut membulat dan bayangan dalam yang mengangkatnya
dari kanvas, kontras tinggi, whitespace lega, ikon SVG duotone bersudut
membulat, dan aksen kuning yang muncul tepat di tempat siswa harus bertindak.

#### Struktur eyebrow & ikonografi

Penanda struktural aplikasi ini adalah **panah vektor**, bukan garis atau
titik generik: eyebrow diawali batang berujung runcing (`clip-path`), swatch
legenda berbentuk panah, dan lencana merek adalah panah bersudut membulat.
Penanda itu diambil dari kosakata subjeknya sendiri.

### 7.2 Arsitektur "Sidebar & Stage" — ini arsitektur, bukan gaya

| Kolom | Lebar | Isi |
|---|---|---|
| `.ws-side` | **25–30%** | Tombol kembali · judul bab & sub-topik · tab Materi/Simulasi/Kuis · `.ws-side__hint` (brief, legenda, prompt, checklist, pemilih kasus, slider langkah) · bilah aksi |
| `.ws-stage` | **69–76%** | **HANYA kanvas**: bidang kartesius, vektor, persamaan, atau teks teori |

```css
.workspace--split {
  display: grid;
  grid-template-columns: minmax(240px, 28%) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: clamp(var(--sp-3), 1.4vw, var(--sp-5));
  align-items: stretch;
  height: 100%;
  min-height: 0;
}
.ws-side { display: flex; flex-direction: column; gap: var(--sp-3);
           min-height: 0; min-width: 0; }
.ws-side__hint { flex: 1 1 auto; min-height: 0;
                 overflow-y: auto; overscroll-behavior: contain; }
```

**Aturan turunan:**
- Panggung **TIDAK boleh berisi** tab, prompt, atau bilah aksi.
- Simulasi menaruh petunjuknya lewat `Simulation.addHint()`, **bukan** `root.appendChild()`.
- Scrollbar memeluk tepi kanan layar — yang menggulir adalah kolom panggung selebar penuh.
- Bilah aksi hidup di `.workspace__actions`, baris grid **di luar** `.workspace__body`.

### 7.3 Viewport terkunci — nol pergeseran tata letak

```css
html, body { height:100%; max-height:100%; overflow:hidden !important;
             overscroll-behavior:none; position:fixed; inset:0;
             width:100%; touch-action:manipulation; }
#app { height:100dvh; min-height:100vh; display:grid;
       grid-template-rows:auto 1fr;
       grid-template-columns:minmax(0,1fr);   /* WAJIB EKSPLISIT */
       overflow:hidden; }
#app > * { min-width: 0; }
```

Scroll **hanya** hidup di: `.scroll-area`, `.workspace__body`, `.ws-side__hint`, `.menu`.

| Masalah | Pola yang benar |
|---|---|
| Banner sukses menyisip di aliran | `position: absolute`, tidak menempati ruang |
| Tombol selesai dipakai lalu dibuang | `visibility: hidden` + `disabled` — **`remove()` mengempiskan barisnya** |
| Panggung mengembang-mengempis | `min-height: clamp(200px, 34vh, 320px)` |
| Tombol muncul di tengah alur | Ruangnya dipesan sejak awal (`min-height`) |
| Teks `nowrap` melebarkan grid | `min-width: 0` + `text-overflow: ellipsis` |
| Nama yang berubah menggeser gambar | **Lebar TETAP** untuk label yang berganti |

> ⚠️ Kotak **kosong** yang di-`visibility:hidden` memesan ruang **nol**.
> **Isi kotaknya lebih dulu, baru sembunyikan.**

### 7.4 Ukuran, sentuhan, orientasi

- Ukuran isi panggung terikat viewport lewat `clamp()`, **44px** batas bawah sentuh.
- Setiap wadah yang bisa meluap butuh `overflow-y:auto` **DAN** `min-height:0`.
- Aplikasi hanya berjalan **lanskap**; potret memunculkan `.rotate-lock` dan
  menyembunyikan `#app` **beserta** `.fs-btn`.

### 7.5 Seret & ketuk

> **Ketukan adalah jalur WAJIB; seret hanya pelengkap.**

Interaksi presisi tinggi (memilih ujung vektor, memilih komponen, membalik
tanda) **sebaiknya ketuk saja**. Seret hanya untuk perpindahan bertarget besar.
Satu interaksi aktif pada satu waktu; selalu ada jalan membatalkan; tujuan yang
salah **tetap boleh diketuk** supaya penolakannya bisa dijelaskan.

### 7.6 Anti klik-beruntun — sistemik

> Setiap evaluasi yang benar **WAJIB** mengambil `claim()` lebih dulu, lalu
> memanggil `lockChoices()`. `setBusy()` saja **tidak cukup**.

Nama kunci `claim()` harus **TETAP** — kunci berindeks (`claim('sel-' + i)`)
tidak menahan apa pun.

### 7.7 Struktur CSS — Cascade Layers

```css
/* Satu-satunya baris yang menentukan urutan. Di tokens.css, paling atas. */
@layer reset, tokens, layout, components, domain, workspace, utilities, overrides;
```

| Lapisan | Berkas |
|---|---|
| `reset` · `tokens` · `utilities` | `tokens.css` |
| `layout` | `layout.css` → `shell.css` → `screens.css` |
| `components` | `components.css` · `mathpad.css` · `lesson.css` · `quiz.css` |
| `domain` | `vector.css` · `plane.css` · `simulations.css` · `scratchpad.css` |
| `workspace` | `workspace.css` |
| `utilities` | `animations.css` · `scrollbars.css` |

1. **Satu komponen = satu berkas.** `.plane__*` hanya boleh ada di `plane.css`;
   kerangka aplikasi hanya di `shell.css`; papan angka hanya di `mathpad.css`.
2. **`overrides` harus tetap kosong atau nyaris kosong.** Saat ini: kosong.
3. **`workspace` berdiri SESUDAH `domain`, bukan bagian dari `layout`.**
   Arsitektur Sidebar & Stage bertugas *menyesuaikan* setiap komponen —
   termasuk komponen domain — ke kolom selebar 190px: menyembunyikan brief
   simulasi di lanskap pendek, meratakan legenda jadi satu kolom, merampingkan
   tab langkah. Itu hanya bermakna kalau ia bisa mengalahkan berkas yang
   mendefinisikan komponennya.

   > Ini terukur, bukan teoretis. Sebelum urutan ini dipakai,
   > `vector.css .sim__brief { display: flex }` (domain) mengalahkan
   > `workspace.css .ws-side__hint .sim__brief { display: none }` (layout),
   > dan brief yang seharusnya lenyap di layar setinggi 360px tetap tampil —
   > mendorong prompt langkah keluar dari kartu.
4. Ukur dukungan peramban di perangkat kelas yang sebenarnya sebelum memutuskan.

### 7.8 Aturan tampilan lain

| Aturan | Alasan |
|---|---|
| Tidak ada tautan teks telanjang — setiap yang bisa diklik punya kotak, batas, padding, hover | Sasaran sentuh |
| Konten selalu di **kartu opak** | Keterbacaan di atas latar berpola |
| **Bahasa warna, bukan jargon** — "yang **berwarna biru**", bukan "yang disorot" | Siswa tidak tahu apa itu "disorot" |
| Denyut mengubah **LATAR**, bukan hanya tepi; teks tetap ≥4,5:1 **diukur** | Kontras |
| Kecepatan animasi konstan; satu-satunya penyimpangan `prefers-reduced-motion` | Pengatur kecepatan dicabut |
| Opsi salah **dikunci permanen**; jawaban benar mengunci pilihannya seketika | Mengerucut, bukan menebak |
| Panel yang baru muncul dibawa ke pandangan (`scrollIntoView`) | Alur yang tumbuh ke bawah |
| Footer berbunyi persis, memakai simbol `©` bukan kata | Kontrak |

---

## 8. LAPISAN DOMAIN VEKTOR

### 8.1 `domain/vector.js` — matematika MURNI, tanpa DOM

**Tanpa satu pun rujukan `document`**, supaya bisa diuji di Node murni.

```
vec · fromArray · toArray · fromPoints · zero · isZero · dim
add · subtract · scale · negate · equals
normSquared · norm · unit · distance · midpoint
dot · cross · tripleScalar
cosAngle · angleBetween · projScalar · projVector · reject
isPerpendicular · isParallel · isCollinear · isCoplanar
sectionPoint · sectionPointOuter
linearCombination · solveCombination2D
formatNumber · toLatex · toComponentText
```

**Keputusan:** R² diperlakukan sebagai R³ dengan `z = 0`. `dim(v)` hanya dipakai
di lapisan penyajian dan validator — bukan di aritmetikanya.

### 8.2 `domain/surd.js` — akar eksak

```
‖(2,5)‖ = √29      BUKAN 5.385164807134504
‖(2,4)‖ = 2√5      BUKAN 4.47213595499958
```

Bentuk $k\sqrt{r}$, dengan $r$ bebas kuadrat.

```
surd · fromSquare · simplify · mulS · divS · isRational
toNumber · toLatexS · toText · parseSurd · equalsS
```

| Situasi | Yang dipakai |
|---|---|
| Menampilkan panjang ke siswa | `toLatexS(fromSquare(normSquared(v)))` |
| Memeriksa jawaban | `equalsS()` atau `numbersMatch(toNumber(...), tol)` |
| Menghitung sudut | Desimal boleh — sudut dibulatkan ke derajat |
| **Membandingkan dua panjang** | **`normSquared` saja, tanpa akar sama sekali** |

> $\|u\| > \|v\| \iff \|u\|^2 > \|v\|^2$, dan `normSquared()` bilangan bulat.
> Nol floating-point, nol toleransi, nol bug pembulatan.

### 8.3 `domain/validator.js` — aturan **beserta kalimatnya**

```js
function ok()         { return { valid: true,  reason: null }; }
function fail(reason) { return { valid: false, reason }; }
```

`canAddSubtract` · `canDot` · `canCross` · `canUnit` · `canAngle` ·
`canProject` · `canSection` · `fillTemplate` · `validateNumberInput` · `numbersMatch`

**Pola kalimat — tiga bagian, selalu:**
sebut kondisinya → sebut akibatnya pada rumusnya → sebut alasan matematisnya.

### 8.4 `domain/plane/vectorPlane.js` — kanvas kartesius **SVG**

SVG dipilih karena: tiap panah adalah node DOM (tap/drag langsung), bisa diukur
`getBoundingClientRect()` / `elementFromPoint()`, bisa ditema token CSS, dan
tajam saat diubah ukuran. `<canvas>` bitmap **hanya** dipakai papan coret.

```js
const plane = createVectorPlane(host, { xRange, yRange, grid, axisLabels,
                                        showOrigin, interactive });
plane.drawVector · drawPoint · drawSegment · drawAngleArc
     · drawComponentGuides · drawParallelogram · drawProjection
plane.toScreen · toMath · destroy
arrow.setTappable · setDraggableTip · setTone · setValue
     · highlight · mute · lock
```

**Enam aturan wajib:**

1. **Sumbu Y terbalik** — semua konversi lewat `toScreen()`/`toMath()`, tidak
   pernah aritmetika langsung di tempat lain.
2. **`viewBox` tetap + `preserveAspectRatio="xMidYMid meet"`** — skala 1 satuan
   sumbu $x$ **harus** sama persis dengan sumbu $y$. **Ini kebenaran matematis,
   bukan estetika.**
3. **Kisi & sumbu di lapisan terpisah, di belakang, `pointer-events: none`.**
4. **Kepala panah `<marker markerUnits="userSpaceOnUse">`**, `fill` disetel
   **eksplisit** setiap kali warna garis berubah.
5. **Label sebagai `<foreignObject>`** berisi `renderToString()`, bukan `<text>`.
6. **`ResizeObserver` + gambar ulang**, dan `destroy()` yang melepasnya.

### 8.5 Anatomi engine simulasi

```js
export class XxxSim extends Simulation {
  build() {
    this.scaffold({ brief, promptText, promptStep, legend });
    // … bangun panggung; petunjuk lewat addHint() …
    if (this.savedState) this.restore(this.savedState);
  }
  onPilih(el) {
    if (!this.claim('langkah1')) return;   // SINKRON, baris pertama
    this.lockChoices(this.stage, { keep: el });
    // … animasi lewat this.later()/this.wait() …
  }
  destroy() { /* hanya bila memegang sub-engine atau observer sendiri */ super.destroy(); }
}
```

API yang diwarisi: `scaffold` · `addHint` · `setPrompt` · `resetStage` ·
`reserveSlot` · `claim`/`release` · `lockChoices` · `useSteps`/`useStepsSilent` ·
`markSlideSolved` · `track` · `later` · `wait` · `msg` · `reject` ·
`rejectAndLock` · `complete` · `saveState`.

`locksOnComplete = false` **wajib** untuk simulasi multi-kasus.

Engine yang **tidak terdaftar** di registry tidak melempar error — ia
menampilkan empty-state dan **tetap mengizinkan siswa lanjut ke Mini Kuis**.

### 8.6 Dua mesin soal — kontrak berlawanan, JANGAN disatukan

| | `QuizEngine` (Mini Kuis) | `ExamEngine` (Ujian CBT) |
|---|---|---|
| Umpan balik | **LANGSUNG**, per soal | **TERTUNDA**, saat "Kumpulkan" |
| Navigasi | **Terkunci** | **Bebas**, kisi nomor 1..N |
| Lanjut sesi | **YA** | **TIDAK** — sengaja |
| Pelabelan opsi | Titik/angka | **Huruf A–E gaya UTBK** |
| Papan coret | Opsional | **Wajib**, dibuat sekali per sesi |
| Pedagogi | *Mastery learning* | Manajemen waktu & keraguan ruang ujian |

`getHistory` **harus berupa FUNGSI**, bukan array statis.

---

## 9. STRATEGI PENGUJIAN

### 9.1 Dua suite

| Suite | Perkakas | Isi | Durasi |
|---|---|---|---|
| `tests/engine.test.mjs` | Node murni, nol dependensi | Matematika vektor murni | Instan |
| `tests/smoke.py` | Playwright (Python) | Perilaku, geometri, kontrak | ±12 menit |

### 9.2 Doktrin: **UKUR, jangan baca kode**

Bug paling mahal lolos dari pembacaan kode berkali-kali dan hanya ketahuan
setelah geometri **diukur** di peramban.
**Corollary: curigai pengujianmu sendiri, bukan hanya kodenya.**

### 9.3 Bagian uji khas domain Vektor

| Yang diuji | Cara mengukurnya |
|---|---|
| **Skala sumbu benar-benar sama** | Jarak piksel 1 satuan di $x$ dan $y$ lewat `toScreen()`; selisih ≤1px |
| **Sumbu Y terbalik dengan benar** | $(0,3)$ punya `screenY` **lebih kecil** daripada $(0,-3)$ |
| **Panah bisa diketuk** | `elementFromPoint()` di titik tengah panah mengembalikan node panah |
| **Kepala panah tidak membesar saat disorot** | `getBoundingClientRect()` `<marker>` sebelum/sesudah `highlight()` identik |
| **Sudut digambar = sudut dihitung** | Atribut busur vs `angleBetween()` ± 0,5° |
| **Tidak ada angka bocor sebelum siswa mengisi** | `textContent` panggung tidak memuat hasil akhir sebelum `onCommit` pertama — **uji terpenting di seluruh suite** |
| **Bentuk akar eksak** | Ada `√` / `\sqrt`, **tidak** ada regex `\d\.\d{4,}` |
| **Kanvas dibongkar tuntas** | `querySelectorAll('svg.plane').length === 0` setelah pindah layar |

### 9.4 Aturan proses

> **Setiap perbaikan bug UI mendapat pengujian regresi.**

### 9.5 Perintah harian

```bash
python -m http.server 5173     # WAJIB hidup lebih dulu
node tests/engine.test.mjs     # instan
python tests/validate_data.py  # instan
python tests/smoke.py          # ±12 menit, jalankan di latar belakang
python tests/archive_soal.py   # arsip guru, DIBANGKITKAN dari quizzes.json
grep -riE "vektor|vector|dot|proyeksi" js/core js/quiz   # batas Core↔Domain
grep -n ",$" css/*.css                                   # selektor berkoma menggantung
```

---

## 10. URUTAN EKSEKUSI & DEFINITION OF DONE

### 10.1 Empat tahap eksekusi kode

> **JANGAN merender visualisasi materi sebelum Tahap 1–3 selesai dan stabil.**

| Tahap | Isi | Bukti selesai |
|---|---|---|
| **1 — Inti** | Router SPA · `progressStore` · `sessionState` · `mathpad` · `toast`/`modal` · penyambungan jalur import · re-brand `index.html` | Aplikasi kosong boot: login → menu → 404, nol galat konsol |
| **2 — Mesin Matematika** | `vector.js` · `surd.js` · `validator.js` — **tanpa DOM** | `engine.test.mjs` ≥ 40 pengujian hijau |
| **3 — Kanvas SVG** | `vectorPlane.js` · `arrow.js` · `plane.css` | Uji skala sumbu, sumbu-Y, `elementFromPoint` hijau |
| **4 — Engine Simulasi** | `index.html` dirakit · engine Bab 1 → 2 → 3 → 4 berurutan | Tiap bab: semua engine mount tanpa galat konsol |

**Pemisahan mutlak `js/core` ↔ `js/domain` ditegakkan sejak Tahap 1.**

### 10.2 Definition of Done per sub-topik (14 butir)

**Konten**
- [ ] ID terdaftar di `subtopicOrder` **dan** ada bloknya di `chapters/*.json`
- [ ] `materi[]` lengkap: minimal satu `def`, satu `tip` atau `warn`
- [ ] `content/<bab>.md` sinkron dengan JSON-nya

**Simulasi**
- [ ] `simulation.engine` terdaftar di `SIMULATION_REGISTRY`
- [ ] Siswa **menghitung sendiri** setiap angka akhir (tes tiga pertanyaan §2.4)
- [ ] Setiap penolakan punya kalimat `toasts` yang menjelaskan **kenapa**
- [ ] Setiap drag punya padanan tap-tap — **atau** tidak ada drag sama sekali
- [ ] Setiap evaluasi memanggil `claim()` **lalu** `lockChoices()`
- [ ] Petunjuk lewat `addHint()`; panggung hanya berisi kanvas
- [ ] `destroy()` membongkar sub-engine, observer, dan listener `window`
- [ ] Posisi siswa dipulihkan (`useSteps`/`useStepsSilent` + `saveState`)

**Kuis**
- [ ] Setiap soal punya `after`, `explanation`, `toastWrong`
- [ ] Kunci jawaban **diverifikasi matematis**, bukan disalin dari niat penulis

**Pengujian**
- [ ] Bagian uji baru di `smoke.py` yang **mengukur**, bukan membaca kode
- [ ] Nol galat konsol saat sub-topik dibuka, dikerjakan, dan ditinggalkan

### 10.3 Aturan git

| Aturan | Alasan |
|---|---|
| 🚫 **JANGAN PERNAH `git push` tanpa permintaan eksplisit** di sesi yang sedang berjalan | Siswa memakai versi yang ada di remote |
| 🚫 **Jangan menambahkan trailer `Co-Authored-By`, `Generated with`, atau tanda tangan AI apa pun** | Riwayat repo ini pernah ditulis ulang sekali demi ini |
| Sub-topik yang isinya berganti total mendapat **ID BARU** | ID lama menandai siswa menyelesaikan sesuatu yang tidak pernah dikerjakan |
| Arsip soal **DIBANGKITKAN** dari JSON, tidak pernah ditulis tangan | Arsip yang menyimpang lebih berbahaya daripada tidak ada arsip |
| Komentar kode dalam **Bahasa Indonesia**, menjelaskan **kenapa**, bukan **apa** | Sebagian besar nilai dokumentasi ada di sana |

---

## 11. DI LUAR CAKUPAN

Keputusan sadar, bukan kelalaian. Masing-masing disertai alasannya.

| Yang tidak dibangun | Alasan |
|---|---|
| **Perkalian silang (cross product)** sebagai sub-topik inti | Tidak ada di `Rancangan_Materi_Vektor_TKA.md`, dan tidak disebut di rincian TKA Kemendikdasmen (yang mencakup: *vektor pada bidang dan ruang · panjang vektor · operasi vektor*, **komponen maksimum tiga**). `vector.js` tetap menyediakan `cross()` untuk keperluan internal (uji kesejajaran di R³) — **tetapi tidak pernah ditawarkan ke siswa sebagai materi**. Bila kelak dibutuhkan, `validator.canCross()` sudah menyiapkan kalimat penolakannya |
| **Backend / akun guru / bank soal daring** | Nol-build & offline-first. Ditinjau ulang hanya bila skor terpusat benar-benar dibutuhkan |
| **Pengalih tema (mode gelap/terang)** | Dicabut permanen. Atribut `data-theme="light"` TETAP dipasang karena sejumlah komponen memakainya untuk menentukan warna teks tombol — ia menandai "kartu bacanya terang", bukan "kanvasnya terang" |
| **Streak harian & lencana** | Mengukur kehadiran, bukan penguasaan (kontrak 11) |
| **Pengatur kecepatan animasi** | Satu-satunya penyimpangan kecepatan yang sah adalah `prefers-reduced-motion` |
| **Mode potret** | Kanvas kartesius + Sidebar & Stage tidak bermakna di bawah ~700px lebar |
| **SortableJS atau pustaka drag pihak ketiga** | Sistem seret memakai Pointer Events sendiri |

---

## PENUTUP

> **Aplikasi tidak pernah menghitung untuk siswa.**
> Nilai setiap keputusan dari pertanyaan itu, dan sisanya akan mengikuti.

*Dokumen ini adalah kontrak. Bila implementasi menyimpang darinya, salah satu
dari keduanya harus diperbaiki — dan keputusannya dicatat di sini.*
