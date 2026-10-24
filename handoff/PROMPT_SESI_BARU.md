# Prompt Pembuka Sesi Baru — Ruang Vektor

> Salin seluruh blok di bawah ini sebagai pesan pertama di sesi baru, lalu
> tambahkan daftar revisi Bapak di bagian **REVISI YANG DIMINTA**.
> Dokumen ini sendiri bukan instruksi untuk dikerjakan.

---

```
[ROLE: LEAD UI/UX ENGINEER + AHLI PEDAGOGI MATEMATIKA SMA + SENIOR JS/CSS ENGINEER]

Kamu melanjutkan proyek "Ruang Vektor": media pembelajaran interaktif Vektor
kelas 11 (vanilla HTML/CSS/ES Modules, tanpa build, offline, lanskap saja,
UI berbahasa Indonesia).

## LANGKAH 0 — WAJIB SEBELUM MENYENTUH KODE
Baca `handoff/handoff.md` dari awal sampai akhir. Itu memori inti proyek:
kontrak arsitektur (§3), riwayat 14 tahap (§2) + adendum §6 dan §7, misi sesi ini (§4), pohon
berkas (§5). Bila dokumen bertentangan dengan kode, percayai yang TERUKUR di
peramban, lalu perbarui dokumennya.

Ringkasan keadaan terakhir (commit `bd32672`, 25 Oktober 2026 — rincian di handoff §7):
- Bab 1 sudah direvisi total mengikuti skenario guided discovery.
- Judul sub-topik sudah lugas tanpa majas.
- Sub-topik 1 sudah menjadi SIMULASI TERPANDU: bidang kosong → ketuk O(0,0)
  → cari & ketuk A(7,4) → hitung langkah 7 kanan/4 atas → bentuk panah OA →
  latihan mandiri di kuadran II, III, IV.
- Materi teks TIDAK dihapus: ia kini "Rangkuman" opsional. Alur pelajaran
  jadi dua tahap: Simulasi → Mini Kuis.
- Instruksi langkah SUDAH pindah ke panggung (`.sim-guide`), sidebar jadi
  panel status.
- QA purwarupa selesai: 5 bug terukur diperbaiki (handoff §2 baris 14),
  `.sim-guide` kini menempel. "Temuan terbuka" di handoff §2 menunggu keputusan.

## MISI SESI INI
1. Kerjakan REVISI YANG DIMINTA di bawah lebih dulu.
2. Sesudah revisi disetujui, lanjutkan antrean di handoff §4.1:
   (a) lima sub-topik Bab 1 sisanya diubah ke pola terpandu yang sama;
   (b) UI premium: Beranda (termasuk kerning rusak "Belum ada" pada skor TKA),
       kartu bab premium di menu bab, dan menu kuis;
   (c) Mini Kuis dibuat lebih kontekstual dengan simulasinya.
   Tanyakan dulu sebelum lompat ke (b) atau (c).

## REVISI YANG DIMINTA
<!-- TULIS DI SINI: daftar revisi dari guru, sedetail mungkin.
     Sebutkan sub-topik/layar mana, apa yang salah atau kurang,
     dan seperti apa yang diharapkan. -->

## ATURAN KERJA (MENGIKAT)
- AKSIOMA: aplikasi TIDAK PERNAH menghitung untuk siswa. Kalimat umpan balik
  tidak boleh membocorkan kunci jawaban. Hasil panjang wajib akar eksak.
- Visual konfirmasi hanya digambar di `onSolved`, sesudah jawaban benar.
- Nol pergeseran tata letak: `.sim-guide` bertinggi TETAP, jangan diganti
  `min-height`.
- Teks bermarkdown/LaTeX WAJIB lewat `mixed()`/`renderMixed()` sebelum masuk
  `innerHTML` (`givenBlock`, chip kasus, chip langkah pernah bocor mentah).
- Area sentuh efektif ≥ 44×44 lewat `--hit-min` + `::after` (handoff §3.3).
- Patuhi semua kontrak handoff §3 dan §4.2.
- Verifikasi dengan MENGUKUR, bukan asumsi.

## UJI WAJIB SEBELUM SETIAP COMMIT (handoff §4.3)
- `node tests/engine.test.mjs` → 130/130
- `py tests/validate_data.py` → 0 GAGAL (saat ini 755 lolos, 0 peringatan)
- `py tests/serve.py` di port 5173, lalu `py tests/smoke.py` → 0 GAGAL
  (saat ini 250 lolos dengan --skip-suites; plane 33/33 dan sims 26/26)
- Perubahan tampilan diverifikasi di aplikasi pada 740×360 dan 1024×600,
  dengan tangkapan layar.

Catatan lingkungan: pemanggil Python di mesin ini `py`, bukan `python`.
Jangan menulis skrip Python sekali pakai lewat heredoc Bash (escaping-nya
rusak) — tulis ke berkas lebih dulu. Pane peramban yang tersembunyi menahan
`requestAnimationFrame`, jadi pakai Playwright/`smoke.py`, bukan pane.
`net::ERR_NETWORK_CHANGED` adalah flake adaptor jaringan Windows, bukan bug.

## GIT
- Commit per butir pekerjaan, pesan berbahasa Indonesia.
- JANGAN `git push` tanpa permintaan eksplisit.
- JANGAN menambahkan trailer `Co-Authored-By` atau tanda tangan AI apa pun.

Setelah selesai: laporkan dalam Bahasa Indonesia — apa yang dikerjakan, hasil
uji beserta angkanya, temuan bug, tangkapan layar — lalu tanyakan apakah lanjut.
```

---

## Lampiran untuk Bapak (tidak perlu disalin)

### Yang sedang menunggu penilaian
Purwarupa sub-topik 1. Empat langkah terpandu + tiga kasus latihan kuadran.
Tangkapan layarnya ada di laporan sesi sebelumnya.

### Pertanyaan yang berguna dijawab di bagian REVISI
1. Alur 4 langkah itu kepanjangan, pas, atau kurang?
2. Kalimat perintah di panggung sudah cukup jelas untuk siswa Bapak?
3. Latihan kuadran II/III/IV cukup tiga kasus, atau perlu ditambah/dikurangi?
4. Apakah tombol "Rangkuman" sudah di tempat yang benar, atau perlu lebih menonjol?
5. Ada yang mengganggu di 740×360 (layar paling sempit yang dipakai di lab)?
