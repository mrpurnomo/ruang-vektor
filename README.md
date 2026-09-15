# Ruang Vektor

Media pembelajaran interaktif **Vektor** untuk Matematika Tingkat Lanjut Kelas 11
(Kurikulum Merdeka) — SMAS YPVDP Bontang.

Dibangun **murni HTML5 + CSS3 + JavaScript ES Modules**. Tanpa npm, tanpa
bundler, tanpa `node_modules`. Bisa dijalankan dari hosting statis, GitHub Pages,
bahkan **flash disk di lab sekolah tanpa internet**.

> ### Aplikasi tidak pernah menghitung untuk siswa.
> Setiap angka akhir keluar dari kepala siswa. Aplikasi hanya memeriksa,
> menolak dengan alasan, dan mengonfirmasi.

---

## Menjalankan

ES Modules butuh `http://`, **bukan** `file://`. Nyalakan server statis apa pun
dari direktori ini:

```bash
python -m http.server 5173
```

Lalu buka <http://localhost:5173>.

> Aplikasi hanya berjalan dalam **mode lanskap**. Di potret akan muncul pengunci
> orientasi.

---

## Perintah harian

| Perintah | Kegunaan | Durasi |
|---|---|---|
| `node tests/engine.test.mjs` | Uji matematika vektor murni (tanpa peramban) | instan |
| `python tests/validate_data.py` | Validasi konsistensi `data/**.json` | instan |
| `python tests/smoke.py` | Uji perilaku & geometri (Playwright) | ±12 menit |
| `python tests/archive_soal.py` | Bangkitkan arsip soal guru dari `quizzes.json` | instan |

Pemeriksaan batas arsitektur:

```bash
grep -riE "vektor|vector|dot|proyeksi" js/core js/quiz
```

Keluaran **kosong** berarti batas Core ↔ Domain masih utuh.

---

## Struktur

```
js/core/      inti — tidak tahu apa-apa soal vektor (router, state, UI, interaksi)
js/quiz/      mesin soal generik (Mini Kuis & Ujian CBT)
js/domain/    matematika vektor + kanvas kartesius SVG
js/lesson/    pembaca materi + engine simulasi per bab
css/          token → layout → komponen → domain (Cascade Layers)
data/         manifest bab, bank soal, konfigurasi simulasi per sub-topik
content/      materi bacaan (Markdown) + arsip soal ter-generate
assets/vendor/ KaTeX, GSAP, font — dimuat lokal agar tetap jalan tanpa internet
tests/        uji engine (Node) + uji perilaku (Playwright) + validator data
docs/         EDTECH_BLUEPRINT.md — sumber kebenaran arsitektur
```

---

## Kurikulum

| Bab | Judul | Sub-topik |
|---|---|---|
| 1 | Konsep Dasar Vektor | 6 |
| 2 | Operasi & Bangun Datar | 8 |
| 3 | Perkalian & Proyeksi | 6 |
| 4 | Pemodelan TKA & Geometri Ruang | 5 |

Rinciannya di [`PRD.md`](PRD.md) §5.

---

## Dokumen

| Berkas | Isi |
|---|---|
| [`PRD.md`](PRD.md) | Spesifikasi produk, arsitektur, kontrak pedagogis, kurikulum |
| [`docs/EDTECH_BLUEPRINT.md`](docs/EDTECH_BLUEPRINT.md) | Kerangka arsitektur & daftar jebakan yang sudah dibayar |
| [`docs/Rancangan_Materi_Vektor_TKA.md`](docs/Rancangan_Materi_Vektor_TKA.md) | Rancangan materi 8 Fase + 4 Taktik TKA |

---

© Penta Putra Purnomo, S.Pd., Gr. | SMAS YPVDP Bontang.
