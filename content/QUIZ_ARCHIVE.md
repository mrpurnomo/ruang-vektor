# Arsip Soal Latihan per Bab — Ruang Vektor

Salinan cetak bank soal mode *Latihan per Bab* beserta **kunci jawabannya**,
untuk pegangan guru.

> ⚠️ **Berkas ini DIBANGKITKAN dari data JSON.** Jangan disunting langsung —
> suntinganmu akan hilang saat dibangkitkan ulang. Ubah JSON-nya, lalu jalankan
> `python tests/archive_soal.py`.

Konsistensi datanya diperiksa `python tests/validate_data.py`.

---

## Bab 1: Konsep Dasar Vektor

*6 soal.*

### Soal 1

- **ID:** `u1_01`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_posisi`

Diketahui titik $P(-2,\, 5)$ dan $Q(4,\, -1)$.

**Tentukan vektor $\overrightarrow{PQ}$.**

A. $(2,\, 4)$
B. $(6,\, -6)$
C. $(-6,\, 6)$
D. $(-8,\, 4)$
E. $(6,\, 6)$

> **KUNCI JAWABAN:** **B** — $(6,\, -6)$

**Pembahasan.** $\overrightarrow{PQ} = Q - P = (4-(-2),\; -1-5) = (6,\, -6)$. Perhatikan komponen $x$: mengurangi bilangan negatif berarti menambah.

---

### Soal 2

- **ID:** `u1_02`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `panjang_vektor`

Diketahui vektor $\vec{a} = (-8,\, 6)$.

**Tentukan panjang vektor $\vec{a}$.**

> **KUNCI JAWABAN:** **10**

**Pembahasan.** $|\vec{a}| = \sqrt{(-8)^2 + 6^2} = \sqrt{64 + 36} = \sqrt{100} = 10$. Tanda negatif hilang karena dikuadratkan.

---

### Soal 3

- **ID:** `u1_03`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `notasi_penyajian`

Diketahui vektor dalam bentuk basis vektor satuan.

$$ \vec{v} = -4\hat{i} + 3\hat{k} $$

**Bentuk vektor kolom dari $\vec{v}$ adalah ....**

A. $\begin{pmatrix} -4 \\ 3 \end{pmatrix}$
B. $\begin{pmatrix} -4 \\ 0 \\ 3 \end{pmatrix}$
C. $\begin{pmatrix} -4 \\ 1 \\ 3 \end{pmatrix}$
D. $\begin{pmatrix} -4 \\ 3 \\ 0 \end{pmatrix}$
E. $\begin{pmatrix} 0 \\ -4 \\ 3 \end{pmatrix}$

> **KUNCI JAWABAN:** **B** — $\begin{pmatrix} -4 \\ 0 \\ 3 \end{pmatrix}$

**Pembahasan.** Huruf basis $\hat{j}$ tidak muncul, artinya komponen $y$ bernilai $0$ — bukan dihilangkan dari daftar. Maka $\vec{v} = (-4,\, 0,\, 3)$. **Opsi B**.

---

### Soal 4

- **ID:** `u1_04`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_satuan`

Diketahui vektor $\vec{b} = (-6,\, 8)$.

**Vektor satuan dari $\vec{b}$ adalah ....**

A. $\left(-\tfrac{3}{5},\, \tfrac{4}{5}\right)$
B. $\left(-\tfrac{6}{5},\, \tfrac{8}{5}\right)$
C. $\left(\tfrac{3}{5},\, \tfrac{4}{5}\right)$
D. $\left(-\tfrac{1}{6},\, \tfrac{1}{8}\right)$
E. $\left(-\tfrac{3}{4},\, 1\right)$

> **KUNCI JAWABAN:** **A** — $\left(-\tfrac{3}{5},\, \tfrac{4}{5}\right)$

**Pembahasan.** $|\vec{b}| = \sqrt{36+64} = 10$, sehingga $\hat{e} = \left(\tfrac{-6}{10},\, \tfrac{8}{10}\right) = \left(-\tfrac{3}{5},\, \tfrac{4}{5}\right)$. Periksa: $\tfrac{9}{25}+\tfrac{16}{25} = 1$ ✓.

---

### Soal 5

- **ID:** `u1_05`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `vektor_posisi`

Diketahui titik $A(4,\, -1,\, 2)$ dan $B(1,\, 3,\, -2)$ di ruang.

**Tentukan $\overrightarrow{AB}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} -3 \\ 4 \\ -4 \end{pmatrix}$

**Pembahasan.** $\overrightarrow{AB} = B - A = (1-4,\; 3-(-1),\; -2-2) = (-3,\, 4,\, -4)$.

---

### Soal 6

- **ID:** `u1_06`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `panjang_vektor`

Perhatikan pernyataan-pernyataan tentang panjang vektor berikut.

**Pilih semua pernyataan yang benar.**

A. $|\vec{v}| = |-\vec{v}|$ untuk setiap vektor $\vec{v}$.
B. Vektor $(0,\,0)$ memiliki vektor satuan, yaitu $(0,\,0)$.
C. $|(3,\,-4)| = 5$.
D. $\sqrt{50}$ dapat disederhanakan menjadi $5\sqrt{2}$.
E. Jika $|\vec{u}|^2 = 25$ dan $|\vec{v}|^2 = 36$, maka $|\vec{u}| > |\vec{v}|$.

> **KUNCI JAWABAN:** **A, C, D**

**Pembahasan.** Dua pernyataan yang keliru menyentuh dua kasus khusus yang paling sering menjebak: vektor nol yang tidak punya arah, dan perbandingan kuadrat panjang yang urutannya terbalik.

**Penjelasan per opsi:**

- **A.** **Benar** — setiap komponen dikuadratkan, sehingga tanda tidak berpengaruh pada panjang.
- **B.** Salah — vektor nol **tidak punya** vektor satuan. Lagi pula $|(0,0)| = 0$, sedangkan vektor satuan harus berpanjang $1$.
- **C.** **Benar** — $\sqrt{9+16} = \sqrt{25} = 5$.
- **D.** **Benar** — $\sqrt{50} = \sqrt{25 \cdot 2} = 5\sqrt{2}$.
- **E.** Salah — justru sebaliknya. Karena $25 < 36$, maka $|\vec{u}| < |\vec{v}|$.

---

## Bab 2: Operasi & Bangun Datar

*6 soal.*

### Soal 1

- **ID:** `u2_01`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `penjumlahan_segitiga`

Perhatikan penjumlahan vektor berikut.

$$ \overrightarrow{AB} + \overrightarrow{BC} + \overrightarrow{CA} $$

**Hasil penjumlahan tersebut adalah ....**

A. $\overrightarrow{AC}$
B. $\overrightarrow{CA}$
C. $\vec{0}$
D. $2\overrightarrow{AB}$
E. $\overrightarrow{AA} + \overrightarrow{BB}$

> **KUNCI JAWABAN:** **C** — $\vec{0}$

**Pembahasan.** Rantainya berangkat dari $A$ dan berakhir kembali di $A$: $\overrightarrow{AB}+\overrightarrow{BC}+\overrightarrow{CA} = \overrightarrow{AA} = \vec{0}$. Berkeliling kembali ke titik semula menghasilkan perpindahan nol. **Opsi C**.

---

### Soal 2

- **ID:** `u2_02`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `kombinasi_operasi`

Diketahui $\vec{a} = (7,\, -3)$ dan $\vec{b} = (-2,\, 5)$.

**Tentukan $3\vec{a} - 2\vec{b}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} 25 \\ -19 \end{pmatrix}$

**Pembahasan.** $3\vec{a} = (21,\, -9)$ dan $2\vec{b} = (-4,\, 10)$, sehingga $3\vec{a} - 2\vec{b} = (21-(-4),\; -9-10) = (25,\, -19)$.

---

### Soal 3

- **ID:** `u2_03`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `kesamaan_vektor`

Diketahui kesamaan vektor berikut.

$$ \begin{pmatrix} 4x \\ y-2 \end{pmatrix} = \begin{pmatrix} 20 \\ 3 \end{pmatrix} $$

**Tentukan nilai $x + y$.**

> **KUNCI JAWABAN:** **10**

**Pembahasan.** Baris pertama: $4x = 20 \Rightarrow x = 5$. Baris kedua: $y - 2 = 3 \Rightarrow y = 5$. Maka $x + y = 10$.

---

### Soal 4

- **ID:** `u2_04`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `pembagian_ruas_garis`

Diketahui titik $A(1,\, -2)$ dan $B(5,\, 6)$. Titik $P$ membagi ruas garis $AB$ dengan perbandingan $AP : PB = 3 : 1$.

**Tentukan koordinat titik $P$.**

A. $P(2,\, 0)$
B. $P(3,\, 2)$
C. $P(4,\, 4)$
D. $P(4{,}5,\, 5)$
E. $P(6,\, 8)$

> **KUNCI JAWABAN:** **C** — $P(4,\, 4)$

**Pembahasan.** $\vec{p} = \dfrac{3\vec{b} + 1\vec{a}}{3+1} = \dfrac{3(5,6) + (1,-2)}{4} = \dfrac{(16,\, 16)}{4} = (4,\, 4)$. **Opsi C**.

---

### Soal 5

- **ID:** `u2_05`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `perkalian_skalar`

Diketahui sebuah vektor $\vec{v}$ dengan $|\vec{v}| = \sqrt{13}$.

**Tentukan panjang vektor $-2\vec{v}$.**

A. $-2\sqrt{13}$
B. $\sqrt{13}$
C. $2\sqrt{13}$
D. $4\sqrt{13}$
E. $\sqrt{26}$

> **KUNCI JAWABAN:** **C** — $2\sqrt{13}$

**Pembahasan.** $|-2\vec{v}| = |-2| \cdot |\vec{v}| = 2\sqrt{13}$. Tanda negatif membalik arah, tetapi panjang tidak pernah negatif. **Opsi C**.

---

### Soal 6

- **ID:** `u2_06`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `titik_segaris`

Perhatikan pernyataan tentang vektor sejajar dan titik segaris berikut.

**Pilih semua pernyataan yang benar.**

A. Jika $\overrightarrow{AB} = 3\,\overrightarrow{BC}$, maka titik $A$, $B$, dan $C$ segaris.
B. Dua vektor sejajar selalu terletak pada satu garis yang sama.
C. Vektor $(2,\,-6)$ dan $(-1,\,3)$ saling sejajar.
D. Pada jajar genjang $ABCD$ berlaku $\overrightarrow{AB} = \overrightarrow{DC}$.
E. Untuk membuktikan tiga titik segaris, cukup memeriksa satu komponen saja.

> **KUNCI JAWABAN:** **A, C, D**

**Pembahasan.** Dua pernyataan yang keliru menyentuh syarat yang sama dari dua sisi: sejajar saja tidak cukup untuk segaris (butuh titik bersama), dan satu komponen saja tidak cukup untuk membuktikannya (butuh $k$ yang konsisten).

**Penjelasan per opsi:**

- **A.** **Benar** — keduanya sejajar **dan** berbagi titik $B$, sehingga pasti satu garis.
- **B.** Salah — tanpa titik bersama, dua vektor sejajar hanya membentuk dua garis sejajar yang berbeda.
- **C.** **Benar** — $(2,-6) = -2(-1,3)$, jadi keduanya kelipatan satu sama lain.
- **D.** **Benar** — sisi berhadapan jajar genjang sejajar dan sama panjang, dengan arah penulisan yang searah.
- **E.** Salah — nilai $k$ dari satu komponen **wajib** diuji pada komponen lainnya. Banyak pasangan cocok di satu komponen dan meleset di komponen berikutnya.

---

## Bab 3: Perkalian & Proyeksi

*6 soal.*

### Soal 1

- **ID:** `u3_01`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `dot_product`

Diketahui $\vec{a} = (5,\, -2,\, 1)$ dan $\vec{b} = (3,\, 4,\, -2)$.

**Tentukan nilai $\vec{a} \cdot \vec{b}$.**

> **KUNCI JAWABAN:** **5**

**Pembahasan.** $\vec{a}\cdot\vec{b} = 5(3) + (-2)(4) + 1(-2) = 15 - 8 - 2 = 5$.

---

### Soal 2

- **ID:** `u3_02`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `sudut_antar_vektor`

Diketahui $\vec{u} = (2,\, 2)$ dan $\vec{v} = (0,\, 3)$.

**Tentukan besar sudut antara $\vec{u}$ dan $\vec{v}$.**

A. $0^\circ$
B. $30^\circ$
C. $45^\circ$
D. $60^\circ$
E. $90^\circ$

> **KUNCI JAWABAN:** **C** — $45^\circ$

**Pembahasan.** $\vec{u}\cdot\vec{v} = 0 + 6 = 6$; $|\vec{u}| = \sqrt{8} = 2\sqrt{2}$ dan $|\vec{v}| = 3$, sehingga penyebutnya $6\sqrt{2}$. Maka $\cos\theta = \dfrac{6}{6\sqrt{2}} = \dfrac{1}{\sqrt{2}} = \dfrac{1}{2}\sqrt{2}$, dan $\theta = 45^\circ$. **Opsi C**.

---

### Soal 3

- **ID:** `u3_03`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `vektor_tegak_lurus`

Diketahui $\vec{a} = (2,\, 3,\, m)$ dan $\vec{b} = (1,\, -2,\, 2)$ saling tegak lurus.

**Tentukan nilai $m$.**

> **KUNCI JAWABAN:** **2**

**Pembahasan.** Syarat tegak lurus: $2(1) + 3(-2) + m(2) = 0$, yaitu $2 - 6 + 2m = 0$, sehingga $2m = 4$ dan $m = 2$.

---

### Soal 4

- **ID:** `u3_04`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `proyeksi_skalar`

Diketahui $\vec{a} = (2,\, 3,\, 6)$ dan $\vec{b} = (1,\, 2,\, 2)$.

**Tentukan proyeksi skalar ortogonal $\vec{a}$ pada $\vec{b}$.**

A. $\tfrac{20}{9}$
B. $\tfrac{20}{7}$
C. $\tfrac{20}{3}$
D. $20$
E. $\tfrac{3}{20}$

> **KUNCI JAWABAN:** **C** — $\tfrac{20}{3}$

**Pembahasan.** $\vec{a}\cdot\vec{b} = 2 + 6 + 12 = 20$; $|\vec{b}| = \sqrt{1+4+4} = 3$. Maka proyeksi skalarnya $\dfrac{20}{3}$. **Opsi C**.

---

### Soal 5

- **ID:** `u3_05`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `proyeksi_vektor`

Diketahui $\vec{a} = (6,\, 2)$ dan $\vec{b} = (1,\, 1)$.

**Tentukan vektor proyeksi ortogonal $\vec{a}$ pada $\vec{b}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} 4 \\ 4 \end{pmatrix}$

**Pembahasan.** $\vec{a}\cdot\vec{b} = 6 + 2 = 8$ dan $|\vec{b}|^2 = 1+1 = 2$, sehingga $\vec{c} = \dfrac{8}{2}(1,1) = 4(1,1) = (4,\, 4)$.

---

### Soal 6

- **ID:** `u3_06`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `sifat_perkalian`

Perhatikan pernyataan tentang perkalian titik dan proyeksi berikut.

**Pilih semua pernyataan yang benar.**

A. Hasil $\vec{a} \cdot \vec{b}$ selalu berupa bilangan real.
B. Proyeksi $\vec{a}$ pada $\vec{b}$ sama dengan proyeksi $\vec{b}$ pada $\vec{a}$.
C. Jika $\vec{a} \cdot \vec{b} < 0$, maka sudut antara keduanya tumpul.
D. $\vec{a} \cdot (\vec{b}+\vec{c}) = \vec{a}\cdot\vec{b} + \vec{a}\cdot\vec{c}$.
E. Vektor proyeksi $\vec{a}$ pada $\vec{b}$ selalu sejajar dengan $\vec{b}$.

> **KUNCI JAWABAN:** **A, C, D, E**

**Pembahasan.** Satu-satunya pernyataan yang keliru adalah tentang komutativitas proyeksi. Perkalian titik memang komutatif, tetapi proyeksi bukan — karena penyebutnya bergantung pada siapa yang menjadi alas.

**Penjelasan per opsi:**

- **A.** **Benar** — penjumlahan hasil kali bilangan selalu menghasilkan bilangan.
- **B.** Salah — pembilangnya memang sama, tetapi penyebutnya berbeda. Proyeksi **tidak** komutatif.
- **C.** **Benar** — kedua panjangnya positif, jadi tanda negatif hanya bisa datang dari $\cos\theta$.
- **D.** **Benar** — sifat distributif diwarisi utuh dari perkalian bilangan.
- **E.** **Benar** — rumusnya berakhir dengan perkalian terhadap $\vec{b}$, sehingga arahnya mengikuti $\vec{b}$.

---

## Bab 4: Pemodelan TKA & Geometri Ruang

*6 soal.*

### Soal 1

- **ID:** `u4_01`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `parameter_modulus`

Diketahui vektor $\vec{v} = (3m,\, 4m)$ dengan $|\vec{v}| = 20$.

**Nilai $m$ yang memenuhi adalah ....**

A. $2 \ \text{atau} \ -2$
B. $4 \ \text{atau} \ -4$
C. $5 \ \text{atau} \ -5$
D. $4 \ \text{saja}$
E. $20 \ \text{saja}$

> **KUNCI JAWABAN:** **B** — $4 \ \text{atau} \ -4$

**Pembahasan.** $\sqrt{9m^2 + 16m^2} = 20 \Rightarrow \sqrt{25m^2} = 20 \Rightarrow 5|m| = 20 \Rightarrow m = \pm 4$. **Opsi B**.

---

### Soal 2

- **ID:** `u4_02`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `diagonal_balok`

Diketahui balok $ABCD.EFGH$ dengan panjang $8$ cm, lebar $6$ cm, dan tinggi $24$ cm.

**Tentukan panjang diagonal ruang $\overrightarrow{AG}$ dalam cm.**

> **KUNCI JAWABAN:** **26**

**Pembahasan.** $|\overrightarrow{AG}| = \sqrt{8^2 + 6^2 + 24^2} = \sqrt{64 + 36 + 576} = \sqrt{676} = 26$ cm.

---

### Soal 3

- **ID:** `u4_03`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `bangun_segiempat`

Diketahui jajar genjang $ABCD$ dengan $\overrightarrow{AB} = (4,\, 1)$ dan $\overrightarrow{BC} = (2,\, 5)$.

**Tentukan diagonal $\overrightarrow{AC}$.**

A. $(2,\, -4)$
B. $(-2,\, 4)$
C. $(6,\, 6)$
D. $(8,\, 5)$
E. $(6,\, 4)$

> **KUNCI JAWABAN:** **C** — $(6,\, 6)$

**Pembahasan.** $\overrightarrow{AC} = \overrightarrow{AB} + \overrightarrow{BC} = (4+2,\; 1+5) = (6,\, 6)$. **Opsi C**.

---

### Soal 4

- **ID:** `u4_04`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `kinematika_lintasan`

Sebuah kendaraan melaju dengan kecepatan konstan pada lintasan lurus sepanjang $45$ km, ditempuh dalam $60$ menit. Titik $P$ dan $Q$ terletak pada lintasan itu, dan jarak $PQ$ ditempuh dalam $12$ menit.

**Tentukan jarak $PQ$ dalam km.**

> **KUNCI JAWABAN:** **9**

**Pembahasan.** Jarak berbanding lurus dengan waktu: $PQ = \dfrac{12}{60} \times 45 = \dfrac{1}{5} \times 45 = 9$ km.

---

### Soal 5

- **ID:** `u4_05`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `sniper_komponen`

Diketahui $\vec{u} = (3,\, k,\, -2)$ dan $\vec{v} = (1,\, 2,\, 4)$ dengan $\vec{u} \cdot \vec{v} = -1$.

**Tentukan nilai $k$.**

> **KUNCI JAWABAN:** **2**

**Pembahasan.** Suku konstantanya $3(1) + (-2)(4) = 3 - 8 = -5$; suku parameternya $2k$. Maka $-5 + 2k = -1$, sehingga $2k = 4$ dan $k = 2$.

---

### Soal 6

- **ID:** `u4_06`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `sniper_komponen`

Perhatikan empat bentuk soal berikut, masing-masing memuat satu parameter.

**Pilih semua bentuk soal yang dapat dikerjakan dengan teknik sniper komponen.**

A. $\vec{u} \cdot \vec{v} = 12$, dengan satu komponen $\vec{u}$ memuat $k$.
B. $|\vec{v}| = 10$, dengan satu komponen $\vec{v}$ memuat $m$.
C. $\vec{a} \perp \vec{b}$, dengan satu komponen $\vec{b}$ memuat $k$.
D. Proyeksi skalar $\vec{a}$ pada $\vec{b}$ bernilai $4$, dengan satu komponen $\vec{a}$ memuat $k$.
E. $|\vec{u}|^2 + |\vec{v}|^2 = 50$, dengan satu komponen $\vec{u}$ memuat $p$.

> **KUNCI JAWABAN:** **A, C, D**

**Pembahasan.** Teknik sniper hanya bekerja pada operasi yang **linear** terhadap parameternya. Setiap operasi yang mengkuadratkan komponen — modulus dan kuadrat panjang — mengeluarkan parameternya dari jangkauan taktik ini.

**Penjelasan per opsi:**

- **A.** **Bisa** — perkalian titik bersifat linear terhadap parameternya.
- **B.** Tidak bisa — di dalam modulus setiap komponen **dikuadratkan**, sehingga parameternya berpangkat dua. Pakai Taktik TKA 1.
- **C.** **Bisa** — syarat ortogonal hanyalah perkalian titik yang disamakan dengan nol.
- **D.** **Bisa** — parameternya hanya muncul di pembilang, yang berupa perkalian titik. Penyebutnya konstanta.
- **E.** Tidak bisa — kuadrat panjang membuat parameternya berpangkat dua, sama seperti kasus modulus.

---

*Total 24 soal latihan per bab.*
