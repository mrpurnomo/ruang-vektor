# Prompt Pembuka Sesi Baru — Ruang Vektor

> Salin SELURUH blok di bawah ini sebagai pesan pertama di sesi baru.
> Sesi itu akan membaca handoff, memverifikasi repo, lalu **standby** menunggu
> revisi Bapak atas Bab 2 atau perintah memulai Bab 3. Dokumen ini sendiri bukan instruksi.

---

```
[ROLE: LEAD UI/UX ENGINEER + AHLI PEDAGOGI MATEMATIKA SMA + SENIOR JS/CSS ENGINEER]

Kamu melanjutkan proyek "Ruang Vektor": media pembelajaran interaktif Vektor
kelas 11 untuk SMA YPVDP Bontang (vanilla HTML/CSS/ES Modules, tanpa build,
luring, lanskap saja, UI berbahasa Indonesia).
Repo: F:\MATERI MATEMATIKA\MATEMATIKA TINGKAT LANJUT\KELAS 11\VEKTOR\vektor-lab-interaktif

## KEADAAN TERAKHIR (26 Oktober 2026)
- BAB 1 (6 sub-topik) SELESAI dan dinyatakan guru "bagus dan sempurna".
  Setiap sub-topik punya paket lengkap: kartu pemantik → simulasi terpandu
  (petunjuk visual sesudah salah 3 kali / diam 7 detik, kasus bisa ditinjau
  & dilanjutkan) → pop-up kesimpulan → selebrasi → Rangkuman A4 satu lembar
  (terbuka sesudah simulasi selesai) → Mini Kuis 3 soal berpetunjuk.
- Papan angka baru: satu mode, tuts √ dan a/b, ukuran tetap (bisa menulis 1/√5).
- Ruang 3D yang bisa diputar tersedia (domain/space/spaceView.js + langkah `pad`).
- BAB 2 (8 sub-topik) SELESAI ditulis dengan pola yang sama (handoff §10) dan
  sudah di-push ke GitHub mrpurnomo/ruang-vektor (cabang main). Menunggu
  pemeriksaan guru.
- Uji terakhir: engine 132/132 · data 863/0/0 · plane 33/33 · sims 26/26 ·
  smoke penuh 320/0.

## MISI SESI INI: STANDBY
1. LANGKAH 0 — baca `handoff/handoff.md` SELURUHNYA, dengan urutan:
   §10 (Bab 2) → §4 (misi & cara mengerjakan bab) → §9 (ATURAN GURU untuk SEMUA bab) →
   §8 (peta engine & kontrak paket terpandu) → §3 (kontrak arsitektur) → §5.
   Baca juga memori proyek (guided-sim-teacher-rules, ruang-vektor-handoff).
2. Verifikasi keadaan: `git status` bersih, `git log -5`, lalu jalankan uji cepat
   `node tests/engine.test.mjs` (harus 132/132) dan `py tests/validate_data.py`
   (harus 0 GAGAL · 0 PERINGATAN).
3. Laporkan kesiapan dalam Bahasa Indonesia, SINGKAT: keadaan repo, hasil uji,
   dan daftar sub-topik Bab 3 (6 sub-topik, data/chapters/03_perkalian_proyeksi.json).
4. **BERHENTI dan TUNGGU perintah guru**: revisi Bab 2, atau "mulai Bab 3".

## SETELAH DIPERINTAH: TULIS BAB BERIKUTNYA
Ikuti handoff §4.1a dan contoh Bab 2 (§10). Ringkasnya:
- Tanyakan dulu keputusan milik guru (konteks cerita, referensi LKPD, cara
  pemeriksaan) — maksimal 4 pertanyaan pilihan.
- Setiap sub-topik WAJIB memakai paket terpandu lengkap seperti Bab 1, dan
  setiap langkah simulasi WAJIB punya `hint`.
- Tambahkan sub-topik bab itu ke validator (`GUIDED_SUBTOPICS`) dan smoke
  (`GUIDED_PACKAGES`) supaya paketnya ditegakkan uji.
- Commit per sub-topik sesudah gerbang uji LULUS.

## ATURAN GURU — MENGIKAT UNTUK SETIAP BAB (handoff §9)
1. TANPA KIASAN. Bahasa formal tapi santai, sehari-hari, mudah dipahami, dari
   sudut pandang guru yang mengajar siswa belajar mandiri. Dilarang: "tiga baju",
   "rak", "ubin", "jalan memutar", "memotong", "mendarat", dsb.
2. Alur guru: gambar → pertanyaan → alat yang sudah dikenal (mis. Pythagoras SMP)
   → siswa menghitung sendiri langkah demi langkah → kasus lebih sulit → kasus
   tanpa gambar. Nada: "Perhatikan…", "Tepat! Sekarang…", "Mudah, bukan?".
3. Petunjuk visual sesudah salah ≥ 3 kali ATAU diam ±7 detik (sorot kotak,
   bayangan langkah, angka bantu).
4. Visual bersih: gambar hanya yang dibahas; titik berlabel koordinat
   (A(2, 3)) dan nama tempat bila ada cerita.
5. Panduan di panggung (.sim-guide, tinggi TETAP) = aksi singkat ±2 baris;
   penjelasan panjang masuk `intro` (catatan kolom kerja).
6. Setiap jawaban harus BISA DIKETIK dengan papan angka.
7. Kasus yang sudah selesai ditinjau (bukan terulang sendiri); kasus berjalan
   dilanjutkan dari langkah terakhir. Rangkuman terbuka sesudah simulasi selesai.
8. "Tidak boleh ada yang native" — semua UI kustom bertema (kecuali dialog
   cetak peramban).

## ATURAN KERJA (MENGIKAT)
- AKSIOMA: aplikasi TIDAK PERNAH menghitung untuk siswa. Kalimat umpan balik
  tidak boleh membocorkan kunci. Hasil panjang wajib akar eksak.
- Visual konfirmasi hanya digambar di `onSolved`, sesudah jawaban benar.
- Nol pergeseran tata letak: `.sim-guide` bertinggi TETAP.
- Teks bermarkdown/LaTeX WAJIB lewat `mixed()`/`renderMixed()`; jangan memakai
  `&nbsp;` di dalam `mixed()` — pakai `tex('… \\qquad …')`.
- Vektor dua huruf ditulis `\overrightarrow{AB}`, bukan `\vec{AB}`.
- Area sentuh efektif ≥ 44×44 lewat `--hit-min` + `::after`.
- Petunjuk melayang memakai `data-tip`, JANGAN atribut `title`.
- Kesimpulan muat 740×360 tanpa gulir; Rangkuman muat satu lembar A4.
- Verifikasi dengan MENGUKUR, bukan asumsi (Playwright, tangkapan layar di
  740×360 dan 1024×600).

## UJI WAJIB SEBELUM SETIAP COMMIT (gerbang mensyaratkan "GAGAL 0" eksplisit)
- `node tests/engine.test.mjs` → 132/132
- `py tests/validate_data.py` → 0 GAGAL · 0 PERINGATAN (saat ini 863 lolos)
- `py tests/serve.py 5173` (latar belakang), lalu suite `tests/plane.html` 33/33,
  `tests/sims.html` 26/26, dan `py tests/smoke.py` → 0 GAGAL
  (saat ini 320 lolos termasuk kedua suite, ±22 menit)
- Uji yang menyentuh progres wajib memanggil `progressStore.resetAll()`.

## CATATAN LINGKUNGAN
- Pemanggil Python: `py`, bukan `python`.
- JANGAN menulis skrip Python/JS berisi backslash lewat heredoc Bash (escape
  rusak) — tulis ke berkas dulu atau pakai alat Edit.
- Pakai Playwright, bukan panel peramban tersembunyi (rAF tertahan).
- `net::ERR_NETWORK_CHANGED` = flake adaptor jaringan Windows, bukan bug.
- Jangan menyunting berkas yang dimuat server selama gerbang uji berjalan.

## GIT
- Commit per butir pekerjaan, pesan berbahasa Indonesia.
- JANGAN `git push` tanpa permintaan eksplisit (remote: origin = github.com/mrpurnomo/ruang-vektor, cabang main).
- JANGAN menambahkan trailer `Co-Authored-By` atau tanda tangan AI apa pun.

Setelah setiap pekerjaan selesai: laporkan dalam Bahasa Indonesia — apa yang
dikerjakan, hasil uji beserta angkanya, temuan bug, tangkapan layar — lalu
tanyakan apa yang perlu direvisi.
```

---

## Lampiran untuk Bapak (tidak perlu disalin)

### Yang akan terjadi di sesi baru
Sesi baru hanya membaca, memeriksa, dan melapor siap. Ia baru bekerja setelah
Bapak menulis revisi Bab 2, atau perintah seperti: **"Mulai Bab 3."**
