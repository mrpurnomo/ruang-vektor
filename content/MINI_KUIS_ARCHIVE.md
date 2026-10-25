# Arsip Mini Kuis — Ruang Vektor

Soal Mini Kuis di akhir setiap sub-topik beserta **kunci jawabannya**.
Di aplikasi, kunci & pembahasan baru tampil sesudah siswa menjawab benar
atau sesudah salah ke-3 pada soal yang sama.

> ⚠️ **Berkas ini DIBANGKITKAN dari data JSON.** Jangan disunting langsung —
> suntinganmu akan hilang saat dibangkitkan ulang. Ubah JSON-nya, lalu jalankan
> `python tests/archive_soal.py`.

---

## Bab 1: Konsep Dasar Vektor

### 1.1 Konsep Dasar Vektor

#### Soal 1

- **ID:** `b1_01_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `pengertian_notasi`

Sebuah mobil bergerak dengan kelajuan $60$ km/jam **ke arah timur**.

**Bagian mana dari pernyataan itu yang menjadikannya besaran vektor?**

A. Angka $60$, karena vektor selalu punya nilai.
B. Satuan km/jam, karena satuan menentukan jenis besaran.
C. Frasa "ke arah timur".
D. Kata "mobil", karena benda bergerak selalu vektor.
E. Seluruh pernyataan, karena semua besaran gerak adalah vektor.

> **KUNCI JAWABAN:** **C** — Frasa "ke arah timur".

**Pembahasan.** Nilai $60$ km/jam saja hanya menjadikannya **kelajuan** — sebuah skalar. Yang menambahkan unsur **arah**, dan karenanya menjadikannya vektor (kecepatan), adalah frasa "ke arah timur". **Opsi C**.

---

#### Soal 2

- **ID:** `b1_01_2`
- **Tipe:** Ketuk titik di bidang kartesius
- **Sub-topik:** `pengertian_notasi`

Panah biru pada bidang adalah $\overrightarrow{PQ}$: perpindahan dari titik $P$ ke titik $Q$.

**Tunjukkan vektor lawannya, $\overrightarrow{QP}$! Ketuk titik pangkalnya, lalu ketuk titik ujungnya.**

*Bidang:* x ∈ [-4, 5], y ∈ [-2, 5] · titik P(-2, 1), Q(3, 3) · panah P→Q

> **KUNCI JAWABAN:** **Q(3, 3) → P(-2, 1)**

**Pembahasan.** $\overrightarrow{QP}$ berangkat dari $Q$ dan berakhir di $P$: ruas garisnya sama persis dengan $\overrightarrow{PQ}$, panjangnya sama, arahnya berlawanan. Karena itu $\overrightarrow{QP} = -\overrightarrow{PQ}$. Ketukan yang benar: pangkal $Q(3,\, 3)$, lalu ujung $P(-2,\, 1)$.

---

#### Soal 3

- **ID:** `b1_01_3`
- **Tipe:** Ketuk titik di bidang kartesius
- **Sub-topik:** `pengertian_notasi`

Vektor $\overrightarrow{OR}$ berpangkal di titik asal $O$ dan dapat ditulis $\overrightarrow{OR} = \begin{pmatrix} -3 \\ 2 \end{pmatrix}$.

**Ketuk letak titik ujungnya, $R$, pada bidang.**

*Bidang:* x ∈ [-5, 4], y ∈ [-4, 4] · titik O(0, 0)

> **KUNCI JAWABAN:** **(-3, 2)**

**Pembahasan.** Dari $O$, komponen atas $-3$ berarti $3$ satuan ke **kiri**, komponen bawah $2$ berarti $2$ satuan ke **atas**. Ujungnya $R(-3,\, 2)$, di kuadran II.

---

### 1.2 Bentuk Komponen Vektor

#### Soal 1

- **ID:** `b1_02_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `notasi_penyajian`

Diketahui $\vec{p} = -2\hat{i} + 5\hat{j}$.

**Bentuk vektor kolom dari $\vec{p}$ adalah…**

A. $\begin{pmatrix} 5 \\ -2 \end{pmatrix}$
B. $\begin{pmatrix} 2 \\ 5 \end{pmatrix}$
C. $\begin{pmatrix} -2 \\ 5 \end{pmatrix}$
D. $\begin{pmatrix} -2 \\ -5 \end{pmatrix}$
E. $\begin{pmatrix} -2\hat{i} \\ 5\hat{j} \end{pmatrix}$

> **KUNCI JAWABAN:** **C** — $\begin{pmatrix} -2 \\ 5 \end{pmatrix}$

**Pembahasan.** Koefisien $\hat{i}$ adalah langkah mendatar, jadi menempati baris **atas**: $-2$. Koefisien $\hat{j}$ adalah langkah tegak di baris **bawah**: $5$. Tanda ikut terbawa. **Opsi C**.

---

#### Soal 2

- **ID:** `b1_02_2`
- **Tipe:** Ketuk titik di bidang kartesius
- **Sub-topik:** `notasi_penyajian`

Vektor $\vec{u} = \begin{pmatrix} 3 \\ -2 \end{pmatrix}$ akan digambar dengan **pangkal di titik $P(-1,\, 2)$**, bukan di $O$.

**Gambar $\vec{u}$: ketuk pangkalnya, lalu ketuk titik ujungnya.**

*Bidang:* x ∈ [-4, 5], y ∈ [-4, 4] · titik P(-1, 2)

> **KUNCI JAWABAN:** **P(-1, 2) → (2, 0)**

**Pembahasan.** Berangkat dari $P(-1,\, 2)$: melangkah $3$ ke kanan dan $2$ ke bawah, sampai di $(2,\, 0)$. Panahnya berbeda tempat dengan panah dari $O$, tetapi vektornya **sama** — vektor itu bebas.

---

#### Soal 3

- **ID:** `b1_02_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `notasi_penyajian`

Vektor $\vec{q}$ menunjuk tepat **satu satuan ke bawah**: $\vec{q} = (0,\, -1)$.

**Bentuk basis yang baku (paling ringkas) untuk $\vec{q}$ adalah…**

A. $0\hat{i} - 1\hat{j}$
B. $-1\hat{j}$
C. $-\hat{i}$
D. $-\hat{j}$
E. $\hat{j}$

> **KUNCI JAWABAN:** **D** — $-\hat{j}$

**Pembahasan.** Komponen mendatarnya nol, jadi suku $\hat{i}$ tidak ditulis. Koefisien $-1$ cukup ditulis tandanya saja. Bentuk bakunya $-\hat{j}$. Pilihan $0\hat{i} - 1\hat{j}$ dan $-1\hat{j}$ bernilai sama tetapi belum baku. **Opsi D**.

---

### 1.3 Vektor Posisi & Selisih Titik

#### Soal 1

- **ID:** `b1_03_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_posisi`

Diketahui titik $A(3,\, -1)$ dan $B(-2,\, 4)$.

**Vektor $\overrightarrow{AB}$ adalah…**

A. $\begin{pmatrix} 5 \\ -5 \end{pmatrix}$
B. $\begin{pmatrix} 1 \\ 3 \end{pmatrix}$
C. $\begin{pmatrix} -5 \\ 5 \end{pmatrix}$
D. $\begin{pmatrix} -5 \\ 3 \end{pmatrix}$
E. $\begin{pmatrix} -1 \\ 5 \end{pmatrix}$

> **KUNCI JAWABAN:** **C** — $\begin{pmatrix} -5 \\ 5 \end{pmatrix}$

**Pembahasan.** $\overrightarrow{AB} = B - A = \begin{pmatrix} -2 - 3 \\ 4 - (-1) \end{pmatrix} = \begin{pmatrix} -5 \\ 5 \end{pmatrix}$. Ujung dikurangi pangkal. **Opsi C**.

---

#### Soal 2

- **ID:** `b1_03_2`
- **Tipe:** Ketuk titik di bidang kartesius
- **Sub-topik:** `vektor_posisi`

Diketahui $\overrightarrow{CD} = \begin{pmatrix} 4 \\ -3 \end{pmatrix}$ dan titik pangkal $C(-2,\, 2)$.

**Ketuk letak titik ujungnya, $D$, pada bidang.**

*Bidang:* x ∈ [-7, 4], y ∈ [-3, 6] · titik C(-2, 2)

> **KUNCI JAWABAN:** **(2, -1)**

**Pembahasan.** $D = C + \overrightarrow{CD} = (-2 + 4,\, 2 + (-3)) = (2,\, -1)$: dari $C$ melangkah $4$ ke kanan dan $3$ ke bawah.

---

#### Soal 3

- **ID:** `b1_03_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_posisi`

Diketahui $\overrightarrow{PQ} = \begin{pmatrix} -3 \\ 4 \end{pmatrix}$ dan titik ujung $Q(1,\, 1)$.

**Koordinat titik pangkal $P$ adalah…**

A. $(-2,\, 5)$
B. $(4,\, -3)$
C. $(-4,\, 3)$
D. $(3,\, -4)$
E. $(2,\, -5)$

> **KUNCI JAWABAN:** **B** — $(4,\, -3)$

**Pembahasan.** $\overrightarrow{PQ} = Q - P$, jadi $P = Q - \overrightarrow{PQ} = (1 - (-3),\, 1 - 4) = (4,\, -3)$. Cek: dari $(4,\, -3)$ melangkah $3$ ke kiri dan $4$ ke atas, tiba di $Q(1,\, 1)$. **Opsi B**.

---

### 1.4 Panjang Vektor (Modulus)

#### Soal 1

- **ID:** `b1_05_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `panjang_vektor`

Diketahui vektor $\vec{v} = (-5,\, 12)$.

**Tentukan panjang vektor $\vec{v}$.**

> **KUNCI JAWABAN:** **13**

**Pembahasan.** $|\vec{v}| = \sqrt{(-5)^2 + 12^2} = \sqrt{25 + 144} = \sqrt{169} = 13$. Tanda minus hilang begitu dikuadratkan.

---

#### Soal 2

- **ID:** `b1_05_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `panjang_vektor`

Diketahui vektor $\vec{a} = (4,\, -2)$.

**Panjang vektor $\vec{a}$ dalam bentuk akar paling sederhana adalah…**

A. $\sqrt{20}$
B. $2\sqrt{3}$
C. $2$
D. $2\sqrt{5}$
E. $4{,}47$

> **KUNCI JAWABAN:** **D** — $2\sqrt{5}$

**Pembahasan.** $|\vec{a}| = \sqrt{4^2 + (-2)^2} = \sqrt{16 + 4} = \sqrt{20} = \sqrt{4 \cdot 5} = 2\sqrt{5}$. $\sqrt{20}$ bernilai sama tetapi belum paling sederhana, dan $4{,}47$ hanya pembulatan. **Opsi D**.

---

#### Soal 3

- **ID:** `b1_05_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `panjang_vektor`

Tiga vektor: $\vec{p} = (5,\, 1)$, $\vec{q} = (3,\, 4)$, dan $\vec{r} = (-4,\, -3)$.

**Vektor manakah yang paling panjang?**

A. $\vec{q}$
B. $\vec{r}$
C. $\vec{q}$ dan $\vec{r}$, sama panjang
D. $\vec{p}$
E. Ketiganya sama panjang

> **KUNCI JAWABAN:** **D** — $\vec{p}$

**Pembahasan.** Bandingkan kuadrat panjangnya saja — akar tidak membalik urutan: $|\vec{p}|^2 = 25 + 1 = 26$, $|\vec{q}|^2 = 9 + 16 = 25$, $|\vec{r}|^2 = 16 + 9 = 25$. Jadi $\vec{p}$ paling panjang. **Opsi D**.

---

### 1.5 Vektor Satuan

#### Soal 1

- **ID:** `b1_06_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_satuan`

Diketahui $\vec{a} = (-5,\, 12)$, dengan $|\vec{a}| = 13$.

**Vektor satuan yang searah dengan $\vec{a}$ adalah…**

A. $\left(-\tfrac{5}{17},\ \tfrac{12}{17}\right)$
B. $\left(\tfrac{5}{13},\ \tfrac{12}{13}\right)$
C. $\left(-\tfrac{5}{13},\ \tfrac{12}{13}\right)$
D. $(-1,\ 1)$
E. $\left(-\tfrac{5}{13},\ 12\right)$

> **KUNCI JAWABAN:** **C** — $\left(-\tfrac{5}{13},\ \tfrac{12}{13}\right)$

**Pembahasan.** $\hat{a} = \dfrac{\vec{a}}{|\vec{a}|} = \left(\dfrac{-5}{13},\, \dfrac{12}{13}\right)$. Setiap komponen dibagi $13$, dan tanda minus tetap. **Opsi C**.

---

#### Soal 2

- **ID:** `b1_06_2`
- **Tipe:** Ketuk titik di bidang kartesius
- **Sub-topik:** `vektor_satuan`

Diketahui $\vec{v} = \begin{pmatrix} 0 \\ -7 \end{pmatrix}$, berpangkal di titik asal $O$.

**Ketuk letak ujung vektor satuan $\hat{v}$ pada bidang.**

*Bidang:* x ∈ [-4, 4], y ∈ [-8, 2] · titik O(0, 0)

> **KUNCI JAWABAN:** **(0, -1)**

**Pembahasan.** $|\vec{v}| = 7$, jadi $\hat{v} = \dfrac{1}{7}(0,\, -7) = (0,\, -1)$: satu satuan ke bawah dari $O$, tepat di lingkaran satuan.

---

#### Soal 3

- **ID:** `b1_06_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_satuan`

Diketahui $\vec{a} = (4,\, 3)$. Sebuah vektor $\vec{b}$ **searah** dengan $\vec{a}$ dan panjangnya $10$.

**Vektor $\vec{b}$ adalah…**

A. $(40,\, 30)$
B. $(6,\, 8)$
C. $(14,\, 13)$
D. $(8,\, 6)$
E. $\left(\tfrac{4}{5},\, \tfrac{3}{5}\right)$

> **KUNCI JAWABAN:** **D** — $(8,\, 6)$

**Pembahasan.** Vektor satuan $\vec{a}$: $|\vec{a}| = 5$, $\hat{a} = \left(\tfrac{4}{5},\, \tfrac{3}{5}\right)$. Panjang $10$ searah: $\vec{b} = 10\,\hat{a} = (8,\, 6)$. Pilihan $(6,\, 8)$ sama panjang tetapi arahnya lain. **Opsi D**.

---

### 1.6 Vektor di Ruang Tiga Dimensi ($R^3$)

#### Soal 1

- **ID:** `b1_04_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `komponen_r2_r3`

Diketahui vektor kolom $\vec{w} = \begin{pmatrix} 2 \\ -1 \\ 5 \end{pmatrix}$.

**Bentuk basis $\hat{i},\, \hat{j},\, \hat{k}$ dari $\vec{w}$ adalah…**

A. $2\hat{i} + \hat{j} + 5\hat{k}$
B. $2\hat{i} - \hat{j} + 5\hat{k}$
C. $-\hat{i} + 2\hat{j} + 5\hat{k}$
D. $2\hat{i} - \hat{j} + 5\hat{j}$
E. $2\hat{i} - 5\hat{k}$

> **KUNCI JAWABAN:** **B** — $2\hat{i} - \hat{j} + 5\hat{k}$

**Pembahasan.** Baris atas $\to \hat{i}$, baris tengah $\to \hat{j}$, baris bawah $\to \hat{k}$: $2\hat{i} - \hat{j} + 5\hat{k}$. Koefisien $-1$ cukup ditulis tandanya. **Opsi B**.

---

#### Soal 2

- **ID:** `b1_04_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `komponen_r2_r3`

Diketahui $\vec{u} = (2,\, -1,\, 2)$.

**Panjang vektor $\vec{u}$ adalah…**

A. $\sqrt{3}$
B. $5$
C. $3$
D. $\sqrt{5}$
E. $9$

> **KUNCI JAWABAN:** **C** — $3$

**Pembahasan.** $|\vec{u}| = \sqrt{2^2 + (-1)^2 + 2^2} = \sqrt{4 + 1 + 4} = \sqrt{9} = 3$. **Opsi C**.

---

#### Soal 3

- **ID:** `b1_04_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `komponen_r2_r3`

Diketahui titik $A(1,\, 0,\, 2)$ dan $B(3,\, -2,\, 2)$.

**Vektor $\overrightarrow{AB}$ adalah…**

A. $\begin{pmatrix} 2 \\ -2 \end{pmatrix}$
B. $\begin{pmatrix} -2 \\ 2 \\ 0 \end{pmatrix}$
C. $\begin{pmatrix} 4 \\ -2 \\ 4 \end{pmatrix}$
D. $\begin{pmatrix} 2 \\ -2 \\ 0 \end{pmatrix}$
E. $\begin{pmatrix} 2 \\ -2 \\ 4 \end{pmatrix}$

> **KUNCI JAWABAN:** **D** — $\begin{pmatrix} 2 \\ -2 \\ 0 \end{pmatrix}$

**Pembahasan.** $\overrightarrow{AB} = B - A = \begin{pmatrix} 3 - 1 \\ -2 - 0 \\ 2 - 2 \end{pmatrix} = \begin{pmatrix} 2 \\ -2 \\ 0 \end{pmatrix}$. Baris $z$ bernilai $0$ tetapi tetap ditulis. **Opsi D**.

---

## Bab 2: Operasi & Bangun Datar

### 2.1 Aturan Segitiga & Poligon

#### Soal 1

- **ID:** `b2_01_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `penjumlahan_segitiga`

Perhatikan penjumlahan vektor berikut.

$$ \overrightarrow{AB} + \overrightarrow{BC} $$

**Hasil penjumlahan tersebut adalah ....**

A. $\overrightarrow{AC}$
B. $\overrightarrow{CA}$
C. $\overrightarrow{AB}$
D. $\overrightarrow{BC}$
E. $\vec{0}$

> **KUNCI JAWABAN:** **A** — $\overrightarrow{AC}$

**Pembahasan.** Ujung vektor pertama ($B$) bertemu pangkal vektor kedua ($B$), sehingga huruf $B$ saling menghapus. Yang tersisa adalah perjalanan dari $A$ ke $C$, yaitu $\overrightarrow{AC}$. **Opsi A**.

---

#### Soal 2

- **ID:** `b2_01_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `penjumlahan_segitiga`

Sebuah drone terbang dari $P$ ke $Q$, lalu ke $R$, lalu ke $S$.

$$ \overrightarrow{PQ} + \overrightarrow{QR} + \overrightarrow{RS} $$

**Vektor perpindahan total drone tersebut adalah ....**

A. $\overrightarrow{PR}$
B. $\overrightarrow{QS}$
C. $\overrightarrow{PS}$
D. $\overrightarrow{SP}$
E. $\overrightarrow{PQ} + \overrightarrow{RS}$

> **KUNCI JAWABAN:** **C** — $\overrightarrow{PS}$

**Pembahasan.** Aturan poligon: sambung terus ujung ke pangkal, lalu tarik satu vektor dari titik paling awal ($P$) ke titik paling akhir ($S$). Huruf $Q$ dan $R$ saling menghapus. **Opsi C**.

---

#### Soal 3

- **ID:** `b2_01_3`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `penjumlahan_segitiga`

Diketahui panjang $\overrightarrow{AB} = 12$ satuan.

**Tentukan panjang vektor $\overrightarrow{AB} + \overrightarrow{BA}$.**

> **KUNCI JAWABAN:** **0**

**Pembahasan.** $\overrightarrow{AB} + \overrightarrow{BA} = \overrightarrow{AA} = \vec{0}$, dan panjang vektor nol adalah $0$. Angka $12$ di soal sengaja disediakan sebagai pengecoh — berapa pun panjangnya, pergi lalu kembali menghasilkan perpindahan nol.

---

### 2.2 Aturan Jajar Genjang

#### Soal 1

- **ID:** `b2_02_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `penjumlahan_jajargenjang`

Diketahui jajar genjang $ABCD$ dengan $\overrightarrow{AB} = \vec{a}$ dan $\overrightarrow{AD} = \vec{b}$.

**Nyatakan diagonal $\overrightarrow{AC}$ dalam $\vec{a}$ dan $\vec{b}$.**

A. $\vec{a} - \vec{b}$
B. $\vec{a} + \vec{b}$
C. $\vec{b} - \vec{a}$
D. $2\vec{a}$
E. $\tfrac{1}{2}(\vec{a} + \vec{b})$

> **KUNCI JAWABAN:** **B** — $\vec{a} + \vec{b}$

**Pembahasan.** $\overrightarrow{AC} = \overrightarrow{AB} + \overrightarrow{BC}$. Pada jajar genjang, $\overrightarrow{BC} = \overrightarrow{AD} = \vec{b}$ karena sisi berhadapan sejajar dan sama panjang. Maka $\overrightarrow{AC} = \vec{a} + \vec{b}$. **Opsi B**.

---

#### Soal 2

- **ID:** `b2_02_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `penjumlahan_jajargenjang`

Masih pada jajar genjang $ABCD$ dengan $\overrightarrow{AB} = \vec{a}$ dan $\overrightarrow{AD} = \vec{b}$.

**Nyatakan diagonal $\overrightarrow{DB}$ dalam $\vec{a}$ dan $\vec{b}$.**

A. $\vec{a} + \vec{b}$
B. $\vec{a} - \vec{b}$
C. $\vec{b} - \vec{a}$
D. $-\vec{a} - \vec{b}$
E. $\vec{0}$

> **KUNCI JAWABAN:** **B** — $\vec{a} - \vec{b}$

**Pembahasan.** $\overrightarrow{DB} = \overrightarrow{DA} + \overrightarrow{AB} = -\vec{b} + \vec{a} = \vec{a} - \vec{b}$. **Opsi B**.

---

#### Soal 3

- **ID:** `b2_02_3`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `penjumlahan_jajargenjang`

Perhatikan pernyataan tentang aturan segitiga dan aturan jajar genjang berikut.

**Pilih semua pernyataan yang benar.**

A. Keduanya selalu memberi resultan yang sama untuk dua vektor yang sama.
B. Aturan jajar genjang dapat langsung dipakai untuk menjumlahkan tiga vektor sekaligus.
C. Pada aturan jajar genjang, kedua vektor harus berpangkal di satu titik.
D. Diagonal jajar genjang yang menghubungkan kedua ujung vektor mewakili selisihnya.
E. Pada aturan segitiga, salah satu vektor boleh digeser asalkan panjang dan arahnya tetap.

> **KUNCI JAWABAN:** **A, C, D, E**

**Pembahasan.** Satu-satunya pernyataan yang keliru adalah tentang tiga vektor: bangun jajar genjang hanya punya dua sisi berpangkal, sehingga hanya dapat menjumlahkan dua vektor pada satu waktu.

**Penjelasan per opsi:**

- **A.** **Benar** — yang berbeda hanya cara menggambarnya, bukan hasilnya.
- **B.** Salah — jajar genjang hanya melayani **dua** vektor. Untuk tiga atau lebih, pakai aturan poligon.
- **C.** **Benar** — inilah syarat yang membedakannya dari aturan segitiga.
- **D.** **Benar** — diagonal dari pangkal bersama mewakili jumlah, diagonal antar-ujung mewakili selisih.
- **E.** **Benar** — vektor tidak terikat pada satu posisi, hanya pada panjang dan arahnya.

---

### 2.3 Jumlah & Selisih Komponen

#### Soal 1

- **ID:** `b2_03_1`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `operasi_komponen`

Diketahui $\vec{a} = (3,\, -2,\, 5)$ dan $\vec{b} = (-1,\, 4,\, 2)$.

**Tentukan $\vec{a} + \vec{b}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} 2 \\ 2 \\ 7 \end{pmatrix}$

**Pembahasan.** $\vec{a} + \vec{b} = \begin{pmatrix} 3+(-1) \\ -2+4 \\ 5+2 \end{pmatrix} = \begin{pmatrix} 2 \\ 2 \\ 7 \end{pmatrix}$.

---

#### Soal 2

- **ID:** `b2_03_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `operasi_komponen`

Diketahui $\vec{a} = (3,\, -2)$ dan $\vec{b} = (1,\, 5)$.

**Tentukan komponen $y$ dari $\vec{a} - \vec{b}$.**

> **KUNCI JAWABAN:** **-7**

**Pembahasan.** Komponen $y$ dari $\vec{a} - \vec{b}$ adalah $-2 - 5 = -7$.

---

#### Soal 3

- **ID:** `b2_03_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `operasi_komponen`

Diketahui $\vec{p} = (2,\, 7)$ dan $\vec{q} = (1,\, 0,\, 3)$.

**Manakah pernyataan yang paling tepat mengenai $\vec{p} + \vec{q}$?**

A. Hasilnya $(3,\, 7,\, 3)$, dengan komponen $z$ diambil dari $\vec{q}$.
B. Hasilnya $(3,\, 7)$, karena komponen $z$ diabaikan saja.
C. Operasi tidak terdefinisi karena dimensi keduanya berbeda.
D. Hasilnya $(2,\, 7,\, 0) + (1,\, 0,\, 3) = (3,\, 7,\, 3)$, dan itu selalu boleh dilakukan.
E. Operasi dapat dilakukan setelah $\vec{q}$ dijadikan vektor satuan.

> **KUNCI JAWABAN:** **C** — Operasi tidak terdefinisi karena dimensi keduanya berbeda.

**Pembahasan.** Penjumlahan vektor mensyaratkan **dimensi yang sama persis**. Vektor $\vec{p}$ hidup di bidang, $\vec{q}$ hidup di ruang; komponen $z$ pada $\vec{q}$ tidak punya pasangan. Menambahkan sendiri komponen $z=0$ pada $\vec{p}$ berarti **mengganti soal**, bukan menyelesaikannya. **Opsi C**.

---

### 2.4 Perkalian Skalar dengan Vektor

#### Soal 1

- **ID:** `b2_04_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `perkalian_skalar`

Diketahui $\vec{v} = (2,\, -4)$.

**Tentukan $-3\vec{v}$.**

A. $(-6,\, -12)$
B. $(-6,\, 12)$
C. $(6,\, 12)$
D. $(-6,\, -4)$
E. $(6,\, -12)$

> **KUNCI JAWABAN:** **B** — $(-6,\, 12)$

**Pembahasan.** $-3\vec{v} = (-3 \times 2,\; -3 \times -4) = (-6,\, 12)$. Komponen kedua berubah menjadi positif karena negatif dikali negatif menghasilkan positif. **Opsi B**.

---

#### Soal 2

- **ID:** `b2_04_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `perkalian_skalar`

Diketahui sebuah vektor $\vec{w}$ dengan panjang $|\vec{w}| = 7$ satuan.

**Tentukan panjang vektor $-3\vec{w}$.**

> **KUNCI JAWABAN:** **21**

**Pembahasan.** $|-3\vec{w}| = |-3| \cdot |\vec{w}| = 3 \times 7 = 21$. Tanda negatif membalik arah, tetapi **tidak** membuat panjangnya negatif.

---

#### Soal 3

- **ID:** `b2_04_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `perkalian_skalar`

Sebuah vektor $\vec{u}$ dikalikan dengan skalar $k = -\tfrac{1}{2}$.

**Manakah yang paling tepat menggambarkan hasilnya?**

A. Panjangnya menjadi setengahnya, arahnya tetap.
B. Panjangnya menjadi dua kali lipat, arahnya berlawanan.
C. Panjangnya menjadi setengahnya, arahnya berlawanan.
D. Panjangnya menjadi negatif setengah, arahnya tetap.
E. Panjangnya tetap, hanya arahnya yang berlawanan.

> **KUNCI JAWABAN:** **C** — Panjangnya menjadi setengahnya, arahnya berlawanan.

**Pembahasan.** Besar $|k| = \tfrac{1}{2}$ menentukan panjangnya menjadi setengah; tanda negatif pada $k$ menentukan arahnya berlawanan. **Opsi C**.

---

### 2.5 Kombinasi Operasi

#### Soal 1

- **ID:** `b2_05_1`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `kombinasi_operasi`

Diketahui $\vec{u} = (4,\, -1)$ dan $\vec{v} = (2,\, 3)$.

**Tentukan $2\vec{u} - 3\vec{v}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} 2 \\ -11 \end{pmatrix}$

**Pembahasan.** $2\vec{u} = (8,\, -2)$ dan $3\vec{v} = (6,\, 9)$, sehingga $2\vec{u} - 3\vec{v} = (8-6,\; -2-9) = (2,\, -11)$.

---

#### Soal 2

- **ID:** `b2_05_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `kombinasi_operasi`

Diketahui $\vec{a} = (1,\, 5)$ dan $\vec{b} = (-4,\, 2)$.

**Tentukan komponen $x$ dari $3\vec{a} + 2\vec{b}$.**

> **KUNCI JAWABAN:** **-5**

**Pembahasan.** Komponen $x$: $3(1) + 2(-4) = 3 + (-8) = -5$.

---

#### Soal 3

- **ID:** `b2_05_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `kombinasi_operasi`

Seorang siswa mengerjakan $2\vec{u} - 3\vec{v}$ dengan $\vec{u} = (4,\, -1)$ dan $\vec{v} = (2,\, 3)$, lalu menuliskan hasilnya $(2,\, -1)$.

**Di manakah letak kesalahannya?**

A. Ia mengurangkan $\vec{u}$ dan $\vec{v}$ sebelum mengalikan skalarnya.
B. Ia hanya mengalikan skalar ke komponen $x$, sehingga komponen $y$ tidak ikut diregangkan.
C. Ia menukar posisi $\vec{u}$ dan $\vec{v}$ pada pengurangan.
D. Ia menjumlahkan padahal seharusnya mengurangkan.
E. Tidak ada kesalahan; hasilnya memang $(2,\, -1)$.

> **KUNCI JAWABAN:** **B** — Ia hanya mengalikan skalar ke komponen $x$, sehingga komponen $y$ tidak ikut diregangkan.

**Pembahasan.** Komponen $x$-nya benar ($8-6=2$), tetapi komponen $y$-nya tertinggal di $-1$ — nilai asli $\vec{u}$ sebelum dikali $2$, dan $\vec{v}$ tidak ikut dikurangkan. Ini gejala khas skalar yang hanya disapukan ke komponen pertama. **Opsi B**.

---

### 2.6 Kesamaan Dua Vektor

#### Soal 1

- **ID:** `b2_06_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `kesamaan_vektor`

Diketahui kesamaan vektor berikut.

$$ \begin{pmatrix} 2x \\ y+1 \end{pmatrix} = \begin{pmatrix} 6 \\ 5 \end{pmatrix} $$

**Tentukan nilai $x$.**

> **KUNCI JAWABAN:** **3**

**Pembahasan.** Dari baris pertama, $2x = 6$, sehingga $x = 3$. Baris kedua tidak memuat $x$ sama sekali, jadi ia tidak perlu dilibatkan.

---

#### Soal 2

- **ID:** `b2_06_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `kesamaan_vektor`

Diketahui kesamaan vektor berikut.

$$ \begin{pmatrix} x+y \\ x-y \end{pmatrix} = \begin{pmatrix} 8 \\ 2 \end{pmatrix} $$

**Tentukan nilai $xy$.**

A. $6$
B. $10$
C. $12$
D. $15$
E. $24$

> **KUNCI JAWABAN:** **D** — $15$

**Pembahasan.** Kesamaan vektor memberi dua persamaan: $x+y=8$ dan $x-y=2$. Menjumlahkan keduanya: $2x=10 \Rightarrow x=5$, lalu $y=3$. Maka $xy = 15$. **Opsi D**.

---

#### Soal 3

- **ID:** `b2_06_3`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `kesamaan_vektor`

Perhatikan pernyataan tentang vektor sama dan vektor sejajar berikut.

**Pilih semua pernyataan yang benar.**

A. Dua vektor yang sama pasti sejajar.
B. Dua vektor yang sejajar pasti sama.
C. $\vec{a} = (2,\,4)$ dan $\vec{b} = (1,\,2)$ adalah dua vektor yang sejajar.
D. $\vec{a} = (2,\,4)$ dan $\vec{c} = (-2,\,-4)$ adalah dua vektor yang sejajar.
E. Satu persamaan vektor berdimensi tiga menyimpan tiga persamaan biasa.

> **KUNCI JAWABAN:** **A, C, D, E**

**Pembahasan.** Kuncinya satu arah saja: **sama ⇒ sejajar**, tetapi **sejajar ⇏ sama**. Arah berlawanan pun masih dihitung sejajar, karena keduanya tetap terletak pada satu garis arah.

**Penjelasan per opsi:**

- **A.** **Benar** — arah dan panjangnya identik, jadi syarat sejajar otomatis terpenuhi.
- **B.** Salah — sejajar hanya menuntut arah yang segaris, panjangnya boleh berbeda jauh.
- **C.** **Benar** — $\vec{a} = 2\vec{b}$, jadi keduanya kelipatan satu sama lain.
- **D.** **Benar** — $\vec{c} = -\vec{a}$; arah berlawanan tetap termasuk sejajar.
- **E.** **Benar** — banyaknya persamaan selalu sebanyak komponennya.

---

### 2.7 Titik-Titik Segaris (Kolinier)

#### Soal 1

- **ID:** `b2_07_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `titik_segaris`

Diketahui titik $A(1,\, 2)$, $B(3,\, 6)$, dan $C(p,\, 14)$ terletak pada satu garis lurus.

**Tentukan nilai $p$.**

> **KUNCI JAWABAN:** **7**

**Pembahasan.** $\overrightarrow{AB} = (2,\, 4)$ dan $\overrightarrow{AC} = (p-1,\, 12)$. Agar segaris, $\overrightarrow{AC} = k\,\overrightarrow{AB}$. Dari komponen $y$: $12 = 4k \Rightarrow k = 3$. Maka dari komponen $x$: $p - 1 = 3(2) = 6$, sehingga $p = 7$.

---

#### Soal 2

- **ID:** `b2_07_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `titik_segaris`

Perhatikan empat pasang titik berikut.

**Manakah yang ketiga titiknya terletak pada satu garis lurus?**

A. $A(0,0)$, $B(1,2)$, $C(3,5)$
B. $A(0,0)$, $B(2,3)$, $C(6,9)$
C. $A(1,1)$, $B(2,3)$, $C(4,6)$
D. $A(2,1)$, $B(4,3)$, $C(7,5)$
E. $A(1,0)$, $B(3,2)$, $C(6,4)$

> **KUNCI JAWABAN:** **B** — $A(0,0)$, $B(2,3)$, $C(6,9)$

**Pembahasan.** Pada opsi B: $\overrightarrow{AB} = (2,3)$ dan $\overrightarrow{AC} = (6,9)$. Dari komponen $x$: $k = 3$; diuji pada komponen $y$: $3 \times 3 = 9$ ✓. Nilai $k$ sama untuk keduanya, jadi segaris. **Opsi B**.

---

#### Soal 3

- **ID:** `b2_07_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `titik_segaris`

Diketahui $\overrightarrow{AB} = (2,\, 4)$ dan $\overrightarrow{CD} = (1,\, 2)$, dengan $A$, $B$, $C$, $D$ empat titik yang berbeda dan tidak ada huruf yang berulang.

**Manakah kesimpulan yang paling tepat?**

A. Keempat titik pasti terletak pada satu garis lurus.
B. Ruas garis $AB$ dan $CD$ sejajar, tetapi belum tentu segaris.
C. Ruas garis $AB$ dan $CD$ pasti berpotongan.
D. Ruas garis $AB$ dan $CD$ pasti tegak lurus.
E. Tidak dapat disimpulkan apa pun dari data tersebut.

> **KUNCI JAWABAN:** **B** — Ruas garis $AB$ dan $CD$ sejajar, tetapi belum tentu segaris.

**Pembahasan.** $\overrightarrow{AB} = 2\,\overrightarrow{CD}$, sehingga keduanya **sejajar**. Tetapi karena kedua vektor tidak berbagi satu titik pun, keduanya bisa saja terletak pada dua garis sejajar yang berbeda. Sejajar tidak otomatis segaris. **Opsi B**.

---

### 2.8 Pembagian Ruas Garis

#### Soal 1

- **ID:** `b2_08_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `pembagian_ruas_garis`

Diketahui titik $A(2,\, 1)$ dan $B(8,\, 7)$. Titik $P$ membagi ruas garis $AB$ dengan perbandingan $AP : PB = 2 : 1$.

**Tentukan koordinat titik $P$.**

A. $P(4,\, 3)$
B. $P(5,\, 4)$
C. $P(6,\, 5)$
D. $P(7,\, 6)$
E. $P(10,\, 9)$

> **KUNCI JAWABAN:** **C** — $P(6,\, 5)$

**Pembahasan.** $\vec{p} = \dfrac{2\vec{b} + 1\vec{a}}{2+1} = \dfrac{2(8,7) + (2,1)}{3} = \dfrac{(18,\, 15)}{3} = (6,\, 5)$. **Opsi C**.

---

#### Soal 2

- **ID:** `b2_08_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `pembagian_ruas_garis`

Diketahui titik $A(-3,\, 4)$ dan $B(7,\, -2)$. Titik $M$ adalah titik tengah ruas garis $AB$.

**Tentukan absis (komponen $x$) titik $M$.**

> **KUNCI JAWABAN:** **2**

**Pembahasan.** Titik tengah berarti $m : n = 1 : 1$, sehingga $\vec{m} = \dfrac{\vec{a}+\vec{b}}{2}$. Absisnya: $\dfrac{-3 + 7}{2} = \dfrac{4}{2} = 2$.

---

#### Soal 3

- **ID:** `b2_08_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `pembagian_ruas_garis`

Seorang siswa menuliskan rumus pembagian ruas garis untuk $AP : PB = m : n$ sebagai $\vec{p} = \dfrac{m\vec{a} + n\vec{b}}{m+n}$.

**Bagaimana cara tercepat membuktikan bahwa rumus tersebut keliru?**

A. Menggambar ruas garisnya terlebih dahulu di bidang koordinat.
B. Memasukkan $n = 0$: rumus itu memberi $\vec{p} = \vec{a}$, padahal $P$ seharusnya berimpit dengan $B$.
C. Memeriksa apakah penyebutnya bernilai positif.
D. Menghitung panjang $\overrightarrow{AB}$ lebih dahulu.
E. Rumus tersebut sebenarnya tidak keliru.

> **KUNCI JAWABAN:** **B** — Memasukkan $n = 0$: rumus itu memberi $\vec{p} = \vec{a}$, padahal $P$ seharusnya berimpit dengan $B$.

**Pembahasan.** Uji kasus ekstrem adalah cara tercepat. Dengan $n = 0$, perbandingan $AP:PB = m:0$ berarti $PB = 0$, sehingga $P$ berimpit dengan $B$ dan hasilnya harus $\vec{b}$. Rumus siswa itu justru memberi $\vec{a}$ — terbalik. **Opsi B**.

---

## Bab 3: Perkalian & Proyeksi

### 3.1 Perkalian Titik (Dot Product)

#### Soal 1

- **ID:** `b3_01_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `dot_product`

Diketahui $\vec{u} = (3,\, -1,\, 2)$ dan $\vec{v} = (1,\, 4,\, 0)$.

**Tentukan nilai $\vec{u} \cdot \vec{v}$.**

> **KUNCI JAWABAN:** **-1**

**Pembahasan.** $\vec{u}\cdot\vec{v} = 3(1) + (-1)(4) + 2(0) = 3 - 4 + 0 = -1$.

---

#### Soal 2

- **ID:** `b3_01_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `dot_product`

Diketahui $\vec{a} = (2,\, 5)$ dan $\vec{b} = (4,\, -1)$.

**Tentukan nilai $\vec{a} \cdot \vec{b}$.**

A. $-13$
B. $-3$
C. $3$
D. $8$
E. $13$

> **KUNCI JAWABAN:** **C** — $3$

**Pembahasan.** $\vec{a}\cdot\vec{b} = 2(4) + 5(-1) = 8 - 5 = 3$. **Opsi C**.

---

#### Soal 3

- **ID:** `b3_01_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `dot_product`

Dua vektor di ruang, $\vec{p}$ dan $\vec{q}$, dikalikan dengan perkalian titik.

**Hasil dari $\vec{p} \cdot \vec{q}$ berupa ....**

A. sebuah vektor di R³
B. sebuah bilangan real
C. sebuah vektor satuan
D. sebuah vektor di R², karena satu dimensi hilang
E. sebuah vektor yang tegak lurus terhadap keduanya

> **KUNCI JAWABAN:** **B** — sebuah bilangan real

**Pembahasan.** Perkalian titik menjumlahkan hasil kali komponen seletak — dan penjumlahan bilangan selalu menghasilkan bilangan. Itulah sebabnya operasi ini disebut *perkalian skalar dua vektor*. **Opsi B**.

---

### 3.2 Sifat & Tanda Hasil

#### Soal 1

- **ID:** `b3_02_1`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `sifat_perkalian`

Perhatikan pernyataan tentang perkalian titik berikut.

**Pilih semua pernyataan yang benar.**

A. $\vec{a} \cdot \vec{b} = \vec{b} \cdot \vec{a}$ selalu berlaku.
B. $\vec{a} \cdot (\vec{b} + \vec{c}) = \vec{a}\cdot\vec{b} + \vec{a}\cdot\vec{c}$ selalu berlaku.
C. $(\vec{a} \cdot \vec{b}) \cdot \vec{c}$ adalah operasi yang terdefinisi.
D. $\vec{a} \cdot \vec{a} = |\vec{a}|^2$ selalu berlaku.
E. Dari $\vec{a}\cdot\vec{b} = \vec{a}\cdot\vec{c}$ dapat disimpulkan $\vec{b} = \vec{c}$.

> **KUNCI JAWABAN:** **A, B, D**

**Pembahasan.** Perkalian titik mewarisi sifat komutatif dan distributif, tetapi **tidak** mewarisi asosiatif (karena tipe hasilnya berubah) maupun sifat pencoretan.

**Penjelasan per opsi:**

- **A.** **Benar** — komponen seletak dikalikan, dan perkalian bilangan bersifat komutatif.
- **B.** **Benar** — sifat distributif diwarisi utuh dari perkalian bilangan.
- **C.** Salah — $\vec{a}\cdot\vec{b}$ menghasilkan **bilangan**, dan bilangan tidak bisa di-*dot*-kan dengan vektor.
- **D.** **Benar** — $\vec{a}\cdot\vec{a} = a_1^2 + a_2^2 + a_3^2$, yang persis definisi $|\vec{a}|^2$.
- **E.** Salah — ambil $\vec{a}=(1,0)$, $\vec{b}=(2,5)$, $\vec{c}=(2,-7)$. Keduanya memberi hasil $2$, padahal $\vec{b} \ne \vec{c}$.

---

#### Soal 2

- **ID:** `b3_02_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `sifat_perkalian`

Diketahui $\vec{u} = (3,\, 1)$ dan $\vec{v} = (-2,\, 4)$.

**Tanpa menghitung besar sudutnya, tentukan jenis sudut antara $\vec{u}$ dan $\vec{v}$.**

A. Lancip, karena $\vec{u}\cdot\vec{v} > 0$.
B. Siku-siku, karena $\vec{u}\cdot\vec{v} = 0$.
C. Tumpul, karena $\vec{u}\cdot\vec{v} < 0$.
D. Lurus, karena kedua vektor berlawanan arah.
E. Tidak dapat ditentukan tanpa menghitung $\cos\theta$.

> **KUNCI JAWABAN:** **C** — Tumpul, karena $\vec{u}\cdot\vec{v} < 0$.

**Pembahasan.** $\vec{u}\cdot\vec{v} = 3(-2) + 1(4) = -6 + 4 = -2$. Karena hasilnya **negatif** dan kedua panjangnya pasti positif, maka $\cos\theta$ negatif, sehingga sudutnya **tumpul**. **Opsi C**.

---

#### Soal 3

- **ID:** `b3_02_3`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `sifat_perkalian`

Diketahui sebuah vektor $\vec{a}$ dengan panjang $|\vec{a}| = 5$ satuan.

**Tentukan nilai $\vec{a} \cdot \vec{a}$.**

> **KUNCI JAWABAN:** **25**

**Pembahasan.** Menurut sifat $\vec{a}\cdot\vec{a} = |\vec{a}|^2$, maka $\vec{a}\cdot\vec{a} = 5^2 = 25$. Komponen $\vec{a}$ tidak perlu diketahui sama sekali.

---

### 3.3 Sudut Antara Dua Vektor

#### Soal 1

- **ID:** `b3_03_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `sudut_antar_vektor`

Perhatikan dua vektor berikut!

$$ \vec{u} = (1,\, 1,\, 0), \quad \vec{v} = (0,\, 1,\, 1) $$

**Tentukan besar sudut antara $\vec{u}$ dan $\vec{v}$.**

A. $30^\circ$
B. $45^\circ$
C. $60^\circ$
D. $90^\circ$
E. $120^\circ$

> **KUNCI JAWABAN:** **C** — $60^\circ$

**Pembahasan.** $\vec{u}\cdot\vec{v} = 0 + 1 + 0 = 1$; $|\vec{u}| = |\vec{v}| = \sqrt{2}$, sehingga penyebutnya $\sqrt{2}\cdot\sqrt{2} = 2$. Maka $\cos\theta = \tfrac{1}{2}$ dan $\theta = 60^\circ$. **Opsi C**.

---

#### Soal 2

- **ID:** `b3_03_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `sudut_antar_vektor`

Diketahui $\vec{a} = (1,\, 1)$ dan $\vec{b} = (1,\, 0)$.

**Tentukan besar sudut antara $\vec{a}$ dan $\vec{b}$.**

A. $0^\circ$
B. $30^\circ$
C. $45^\circ$
D. $60^\circ$
E. $90^\circ$

> **KUNCI JAWABAN:** **C** — $45^\circ$

**Pembahasan.** $\vec{a}\cdot\vec{b} = 1$; $|\vec{a}| = \sqrt{2}$ dan $|\vec{b}| = 1$. Maka $\cos\theta = \dfrac{1}{\sqrt{2}} = \dfrac{1}{2}\sqrt{2}$, sehingga $\theta = 45^\circ$. **Opsi C**.

---

#### Soal 3

- **ID:** `b3_03_3`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `sudut_antar_vektor`

Diketahui $\vec{p} = (2,\, 0)$ dan $\vec{q} = (0,\, -3)$.

**Tentukan besar sudut antara $\vec{p}$ dan $\vec{q}$ dalam satuan derajat.**

> **KUNCI JAWABAN:** **90**

**Pembahasan.** $\vec{p}\cdot\vec{q} = 2(0) + 0(-3) = 0$. Karena pembilangnya nol sedangkan kedua vektor tak-nol, maka $\cos\theta = 0$ dan $\theta = 90^\circ$. Penyebutnya bahkan tidak perlu dihitung.

---

#### Soal 4

- **ID:** `b3_03_4`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `sudut_antar_vektor`

Seorang siswa menghitung sudut antara dua vektor dan memperoleh $\cos\theta = 1{,}8$.

**Kesimpulan yang paling tepat adalah ....**

A. Sudutnya sangat kecil, mendekati $0^\circ$.
B. Sudutnya lebih dari $180^\circ$.
C. Pasti ada kesalahan hitung, karena $\cos\theta$ selalu berada di antara $-1$ dan $1$.
D. Kedua vektor tersebut sejajar.
E. Hasil itu sah, tetapi sudutnya harus dinyatakan dalam radian.

> **KUNCI JAWABAN:** **C** — Pasti ada kesalahan hitung, karena $\cos\theta$ selalu berada di antara $-1$ dan $1$.

**Pembahasan.** Nilai kosinus **selalu** berada di rentang $[-1, 1]$, berapa pun sudutnya. Hasil $1{,}8$ berarti ada langkah aritmetika yang keliru — paling sering pada penyebutnya, misalnya panjang vektor yang dijumlahkan alih-alih dikalikan. **Opsi C**.

---

### 3.4 Syarat Ortogonal (Tegak Lurus)

#### Soal 1

- **ID:** `b3_04_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `vektor_tegak_lurus`

Diketahui $\vec{a} = (2,\, k,\, 1)$ dan $\vec{b} = (3,\, -1,\, 4)$ saling tegak lurus.

**Tentukan nilai $k$.**

> **KUNCI JAWABAN:** **10**

**Pembahasan.** Syarat tegak lurus: $\vec{a}\cdot\vec{b} = 0$, yaitu $2(3) + k(-1) + 1(4) = 0$, sehingga $6 - k + 4 = 0$ dan $k = 10$.

---

#### Soal 2

- **ID:** `b3_04_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_tegak_lurus`

Perhatikan lima pasang vektor berikut.

**Manakah pasangan yang saling tegak lurus?**

A. $(1,2) \text{ dan } (2,1)$
B. $(3,4) \text{ dan } (-4,3)$
C. $(2,3) \text{ dan } (3,2)$
D. $(1,1) \text{ dan } (1,1)$
E. $(1,0) \text{ dan } (1,1)$

> **KUNCI JAWABAN:** **B** — $(3,4) \text{ dan } (-4,3)$

**Pembahasan.** Pada opsi B: $3(-4) + 4(3) = -12 + 12 = 0$ ✓. Pasangan lainnya memberi hasil $4$, $12$, $2$, dan $1$ — semuanya bukan nol. **Opsi B**.

---

#### Soal 3

- **ID:** `b3_04_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_tegak_lurus`

Seorang siswa menyatakan: "Vektor nol tegak lurus terhadap semua vektor, karena $\vec{0}\cdot\vec{b} = 0$ untuk sembarang $\vec{b}$."

**Tanggapan yang paling tepat atas pernyataan itu adalah ....**

A. Benar sepenuhnya, karena syarat ortogonal memang $\vec{a}\cdot\vec{b}=0$.
B. Hitungannya benar, tetapi kesimpulannya tidak bermakna — vektor nol tidak punya arah, sehingga tidak ada sudut yang dapat diukur.
C. Salah, karena $\vec{0}\cdot\vec{b}$ sebenarnya tidak terdefinisi.
D. Salah, karena $\vec{0}\cdot\vec{b}$ bernilai $1$, bukan $0$.
E. Benar, tetapi hanya berlaku di R² dan tidak berlaku di R³.

> **KUNCI JAWABAN:** **B** — Hitungannya benar, tetapi kesimpulannya tidak bermakna — vektor nol tidak punya arah, sehingga tidak ada sudut yang dapat diukur.

**Pembahasan.** Perhitungannya memang menghasilkan nol. Yang keliru adalah penafsirannya: konsep "tegak lurus" mensyaratkan adanya **sudut**, dan sudut hanya ada bila kedua vektor punya arah. Karena itulah definisi ortogonal selalu menyebut "dua vektor **tak-nol**". **Opsi B**.

---

### 3.5 Proyeksi Skalar Ortogonal

#### Soal 1

- **ID:** `b3_05_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `proyeksi_skalar`

Diketahui $\vec{a} = (4,\, 3)$ dan $\vec{b} = (2,\, 0)$.

**Tentukan proyeksi skalar $\vec{a}$ pada $\vec{b}$.**

> **KUNCI JAWABAN:** **4**

**Pembahasan.** $\vec{a}\cdot\vec{b} = 8 + 0 = 8$ dan $|\vec{b}| = \sqrt{4+0} = 2$. Maka proyeksi skalarnya $\dfrac{8}{2} = 4$. Masuk akal: $\vec{b}$ terletak di sumbu $x$, jadi bayangan $\vec{a}$ padanya adalah komponen $x$ dari $\vec{a}$, yaitu $4$.

---

#### Soal 2

- **ID:** `b3_05_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `proyeksi_skalar`

Diketahui $\vec{a} = (1,\, 2,\, 2)$ dan $\vec{b} = (2,\, -1,\, 2)$.

**Tentukan proyeksi skalar $\vec{a}$ pada $\vec{b}$.**

A. $\tfrac{4}{9}$
B. $\tfrac{3}{4}$
C. $\tfrac{4}{3}$
D. $4$
E. $12$

> **KUNCI JAWABAN:** **C** — $\tfrac{4}{3}$

**Pembahasan.** $\vec{a}\cdot\vec{b} = 2 - 2 + 4 = 4$; $|\vec{b}| = \sqrt{4+1+4} = \sqrt{9} = 3$. Maka proyeksi skalarnya $\dfrac{4}{3}$. **Opsi C**.

---

#### Soal 3

- **ID:** `b3_05_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `proyeksi_skalar`

Soal meminta: "Tentukan proyeksi skalar ortogonal $\vec{u}$ pada $\vec{v}$."

**Vektor manakah yang panjangnya masuk ke penyebut?**

A. $\vec{u}$, karena ia yang disebut lebih dahulu.
B. $\vec{v}$, karena kata "pada" menunjuk alas proyeksinya.
C. Keduanya, karena penyebutnya $|\vec{u}||\vec{v}|$.
D. Tidak ada; penyebut proyeksi skalar selalu $1$.
E. Bebas, karena proyeksi bersifat komutatif seperti perkalian titik.

> **KUNCI JAWABAN:** **B** — $\vec{v}$, karena kata "pada" menunjuk alas proyeksinya.

**Pembahasan.** Kata **"pada"** selalu menunjuk alas proyeksinya. Jadi $\vec{v}$ menjadi alas, dan $|\vec{v}|$ masuk ke penyebut. Berbeda dengan perkalian titik, proyeksi **tidak** komutatif. **Opsi B**.

---

### 3.6 Vektor Proyeksi Ortogonal

#### Soal 1

- **ID:** `b3_06_1`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `proyeksi_vektor`

Diketahui $\vec{a} = (4,\, 3)$ dan $\vec{b} = (2,\, 0)$.

**Tentukan vektor proyeksi $\vec{a}$ pada $\vec{b}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} 4 \\ 0 \end{pmatrix}$

**Pembahasan.** $\vec{a}\cdot\vec{b} = 8$ dan $|\vec{b}|^2 = 4 + 0 = 4$, sehingga $\vec{c} = \dfrac{8}{4}(2,0) = 2(2,0) = (4,\, 0)$. Masuk akal: $\vec{b}$ terletak di sumbu $x$, jadi bayangannya memang vektor mendatar.

---

#### Soal 2

- **ID:** `b3_06_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `proyeksi_vektor`

Diketahui $\vec{a} = (1,\, 2,\, 2)$ dan $\vec{b} = (2,\, -1,\, 2)$.

**Tentukan vektor proyeksi $\vec{a}$ pada $\vec{b}$.**

A. $\tfrac{4}{3}(2,\, -1,\, 2)$
B. $\tfrac{4}{9}(2,\, -1,\, 2)$
C. $\tfrac{4}{9}(1,\, 2,\, 2)$
D. $\tfrac{9}{4}(2,\, -1,\, 2)$
E. $4(2,\, -1,\, 2)$

> **KUNCI JAWABAN:** **B** — $\tfrac{4}{9}(2,\, -1,\, 2)$

**Pembahasan.** $\vec{a}\cdot\vec{b} = 2 - 2 + 4 = 4$ dan $|\vec{b}|^2 = 4+1+4 = 9$, sehingga $\vec{c} = \dfrac{4}{9}(2,-1,2)$. **Opsi B**.

---

#### Soal 3

- **ID:** `b3_06_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `proyeksi_vektor`

Seorang siswa menghitung vektor proyeksi $\vec{p}$ pada $\vec{q}$ dan memperoleh jawaban berupa **sebuah angka**, yaitu $\tfrac{5}{2}$.

**Apa yang paling mungkin terlewat dalam pengerjaannya?**

A. Ia lupa mengakarkan penyebutnya.
B. Ia lupa mengalikan hasilnya kembali dengan vektor alasnya.
C. Ia menukar posisi $\vec{p}$ dan $\vec{q}$ pada pembilangnya.
D. Ia lupa mengambil nilai mutlak hasil akhirnya.
E. Tidak ada yang terlewat; vektor proyeksi memang berupa angka.

> **KUNCI JAWABAN:** **B** — Ia lupa mengalikan hasilnya kembali dengan vektor alasnya.

**Pembahasan.** Bagian $\dfrac{\vec{p}\cdot\vec{q}}{|\vec{q}|^2}$ hanyalah **skalar pengali**. Rumus vektor proyeksi belum selesai sampai skalar itu dikalikan kembali dengan $\vec{q}$ — dan hasil akhirnya harus berupa vektor. **Opsi B**.

---

## Bab 4: Pemodelan TKA & Geometri Ruang

### 4.1 Taktik TKA 1 — Parameter Tersembunyi pada Modulus

#### Soal 1 · Contoh Soal TKA · No. 12

- **ID:** `b4_01_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `parameter_modulus`

Diketahui vektor berikut.

$$ \overrightarrow{AB} = \begin{pmatrix} 2m \\ m+3 \\ m \end{pmatrix} $$

**Jika panjang vektor $\overrightarrow{AB} = 9$ satuan panjang, maka nilai $m$ yang memenuhi adalah ....**

A. $-4 \ \text{atau} \ -3$
B. $-4 \ \text{atau} \ 3$
C. $-3 \ \text{atau} \ 4$
D. $3 \ \text{atau} \ 4$
E. $3 \ \text{saja}$

> **KUNCI JAWABAN:** **B** — $-4 \ \text{atau} \ 3$

**Pembahasan.** $\sqrt{(2m)^2 + (m+3)^2 + m^2} = 9$. Kuadratkan: $4m^2 + m^2 + 6m + 9 + m^2 = 81$, sehingga $6m^2 + 6m - 72 = 0$ dan $m^2 + m - 12 = 0$. Faktorkan: $(m+4)(m-3) = 0$, jadi $m = -4$ atau $m = 3$. **Opsi B**.

---

#### Soal 2

- **ID:** `b4_01_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `parameter_modulus`

Diketahui $\vec{v} = (m,\, 2m,\, 2m)$ dengan $m > 0$, dan $|\vec{v}| = 9$.

**Tentukan nilai $m$.**

> **KUNCI JAWABAN:** **3**

**Pembahasan.** $m^2 + 4m^2 + 4m^2 = 81 \Rightarrow 9m^2 = 81 \Rightarrow m^2 = 9 \Rightarrow m = \pm 3$. Karena soal mensyaratkan $m > 0$, maka $m = 3$.

---

#### Soal 3

- **ID:** `b4_01_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `parameter_modulus`

Untuk $\vec{p} = (3k,\, k-2)$ dengan $|\vec{p}| = 10$, seorang siswa menulis langkah pertamanya sebagai $3k^2 + k^2 - 4 = 100$.

**Berapa banyak kesalahan yang terdapat pada langkah tersebut?**

A. Tidak ada; langkahnya sudah benar.
B. Satu kesalahan, yaitu pada suku pertama.
C. Satu kesalahan, yaitu pada suku kedua.
D. Dua kesalahan: $(3k)^2$ seharusnya $9k^2$, dan $(k-2)^2$ seharusnya $k^2 - 4k + 4$.
E. Dua kesalahan, tetapi keduanya terletak pada ruas kanan.

> **KUNCI JAWABAN:** **D** — Dua kesalahan: $(3k)^2$ seharusnya $9k^2$, dan $(k-2)^2$ seharusnya $k^2 - 4k + 4$.

**Pembahasan.** Keduanya salah. $(3k)^2 = 9k^2$ karena koefisiennya ikut terkuadratkan, dan $(k-2)^2 = k^2 - 4k + 4$ karena bentuk kuadrat sempurna punya suku tengah. Bentuk yang benar: $9k^2 + k^2 - 4k + 4 = 100$. **Opsi D**.

---

### 4.2 Taktik TKA 2 — Bedah Bangun Segiempat

#### Soal 1 · Contoh Soal TKA · No. 13

- **ID:** `b4_02_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `bangun_segiempat`

Diketahui trapesium sama kaki $ABCD$ dengan $AD = BC$ dan titik $A(0,\, 0)$. Vektor-vektor posisi pembentuk trapesium adalah $\overrightarrow{AD} = \begin{pmatrix} 1 \\ 4 \end{pmatrix}$, $\overrightarrow{AB} = \begin{pmatrix} 6 \\ 0 \end{pmatrix}$, dan $\overrightarrow{BC} = \begin{pmatrix} a \\ b \end{pmatrix}$.

**Nilai dari $a^2 + 2b$ adalah ....**

A. $5$
B. $7$
C. $9$
D. $10$
E. $13$

> **KUNCI JAWABAN:** **C** — $9$

**Pembahasan.** $\overrightarrow{AB}$ berkomponen $y$ nol, jadi alasnya mendatar; pada trapesium sama kaki beralas mendatar kedua kaki naik setinggi sama, sehingga $b = 4$. Dari $AD = BC$: $|\overrightarrow{AD}| = \sqrt{1+16} = \sqrt{17}$, maka $a^2 + b^2 = 17 \Rightarrow a^2 = 1$. Jadi $a^2 + 2b = 1 + 8 = 9$. **Opsi C**.

---

#### Soal 2

- **ID:** `b4_02_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `bangun_segiempat`

Diketahui jajar genjang $ABCD$ dengan $\overrightarrow{AB} = (5,\, 2)$ dan $\overrightarrow{AD} = (1,\, 4)$.

**Tentukan komponen $x$ dari diagonal $\overrightarrow{AC}$.**

> **KUNCI JAWABAN:** **6**

**Pembahasan.** Pada jajar genjang, $\overrightarrow{BC} = \overrightarrow{AD}$, sehingga $\overrightarrow{AC} = \overrightarrow{AB} + \overrightarrow{AD} = (5+1,\; 2+4) = (6,\, 6)$. Komponen $x$-nya adalah $6$.

---

#### Soal 3

- **ID:** `b4_02_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `bangun_segiempat`

Pada segiempat $ABCD$ diketahui sifat: "sisi berhadapan sejajar dan sama panjang".

**Manakah terjemahan vektor yang paling tepat untuk sifat tersebut?**

A. $\overrightarrow{AB} = \overrightarrow{CD}$
B. $\overrightarrow{AB} = \overrightarrow{DC}$
C. $|\overrightarrow{AB}| = |\overrightarrow{CD}|$
D. $\overrightarrow{AB} \cdot \overrightarrow{DC} = 0$
E. $\overrightarrow{AB} = k\,\overrightarrow{DC}$

> **KUNCI JAWABAN:** **B** — $\overrightarrow{AB} = \overrightarrow{DC}$

**Pembahasan.** Pada segiempat $ABCD$ yang titik-titiknya berurutan, sisi $AB$ berhadapan dengan sisi $DC$ — perhatikan arah penulisannya. Sejajar **dan** sama panjang berarti kedua vektornya **sama**, yaitu $\overrightarrow{AB} = \overrightarrow{DC}$. **Opsi B**.

---

### 4.3 Taktik TKA 3 — Kinematika & Proporsionalitas

#### Soal 1 · Contoh Soal TKA · No. 14

- **ID:** `b4_03_1`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `kinematika_lintasan`

Sebuah kereta api melaju dengan kecepatan konstan pada lintasan lurus dari stasiun $A$ sampai stasiun $E$. Koordinat stasiun $A$ dan $E$ (dalam km) berturut-turut adalah $(2,\,3,\,5)$ dan $(11,\,6,\,8)$. Waktu tempuh antar stasiun tercatat pada tabel berikut.

| Ruas | Waktu tempuh (menit) |
|---|---|
| $A \to B$ | 5 |
| $B \to C$ | 3 |
| $C \to D$ | 2 |
| $D \to E$ | 3 |

**Pilih semua pasangan stasiun yang jaraknya kurang dari $3{,}5$ km.**

A. $AB$
B. $BC$
C. $CD$
D. $DE$
E. $CE$

> **KUNCI JAWABAN:** **B, C, D**

**Pembahasan.** $\overrightarrow{AE} = (9,3,3)$ sehingga $|\overrightarrow{AE}| = \sqrt{99} \approx 9{,}95$ km, dengan waktu total $13$ menit. Jalan pintasnya: ambang waktu $t < \tfrac{3{,}5 \times 13}{9{,}95} \approx 4{,}57$ menit. Setiap ruas berwaktu di bawah $4{,}57$ menit memenuhi syarat — yaitu $BC$, $CD$, dan $DE$.

**Penjelasan per opsi:**

- **A.** Tidak memenuhi — $\tfrac{5}{13} \times 9{,}95 \approx 3{,}83$ km, masih di atas $3{,}5$ km.
- **B.** **Memenuhi** — $\tfrac{3}{13} \times 9{,}95 \approx 2{,}30$ km.
- **C.** **Memenuhi** — $\tfrac{2}{13} \times 9{,}95 \approx 1{,}53$ km, yang terpendek.
- **D.** **Memenuhi** — $\tfrac{3}{13} \times 9{,}95 \approx 2{,}30$ km, sama dengan $BC$.
- **E.** Tidak memenuhi — $CE$ adalah gabungan $CD + DE$, sehingga waktunya $2+3 = 5$ menit dan jaraknya $\approx 3{,}83$ km.

---

#### Soal 2

- **ID:** `b4_03_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `kinematika_lintasan`

Diketahui stasiun $A(2,\, 3,\, 5)$ dan stasiun $E(11,\, 6,\, 8)$ dalam satuan km.

**Tentukan nilai $|\overrightarrow{AE}|^2$.**

> **KUNCI JAWABAN:** **99**

**Pembahasan.** $\overrightarrow{AE} = E - A = (9,\, 3,\, 3)$, sehingga $|\overrightarrow{AE}|^2 = 81 + 9 + 9 = 99$. Perhatikan bahwa soal menanyakan **kuadratnya**, jadi akarnya tidak perlu ditarik sama sekali.

---

#### Soal 3

- **ID:** `b4_03_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `kinematika_lintasan`

Sebuah mobil melaju dengan kecepatan konstan pada lintasan lurus sepanjang $24$ km, ditempuh dalam $30$ menit. Titik $P$ dan $Q$ berada di lintasan tersebut, dan jarak $PQ$ ditempuh dalam $7$ menit.

**Tentukan jarak $PQ$.**

A. $4{,}8 \ \text{km}$
B. $5{,}6 \ \text{km}$
C. $7{,}0 \ \text{km}$
D. $8{,}4 \ \text{km}$
E. $10{,}3 \ \text{km}$

> **KUNCI JAWABAN:** **B** — $5{,}6 \ \text{km}$

**Pembahasan.** Jarak berbanding lurus dengan waktu: $PQ = \dfrac{7}{30} \times 24 = \dfrac{168}{30} = 5{,}6$ km. **Opsi B**.

---

### 4.4 Taktik TKA 4 — Vektor Diagonal Balok

#### Soal 1

- **ID:** `b4_04_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `diagonal_balok`

Diketahui balok $ABCD.EFGH$ dengan panjang $12$ cm, lebar $4$ cm, dan tinggi $3$ cm.

**Tentukan panjang diagonal ruang $\overrightarrow{AG}$ dalam cm.**

> **KUNCI JAWABAN:** **13**

**Pembahasan.** $\overrightarrow{AG} = (12,\, 4,\, 3)$, sehingga $|\overrightarrow{AG}| = \sqrt{144 + 16 + 9} = \sqrt{169} = 13$ cm.

---

#### Soal 2

- **ID:** `b4_04_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `diagonal_balok`

Diketahui balok $ABCD.EFGH$ dengan $\overrightarrow{AB} = \vec{p}$, $\overrightarrow{AD} = \vec{l}$, dan $\overrightarrow{AE} = \vec{t}$.

**Nyatakan diagonal ruang $\overrightarrow{AG}$ dalam ketiga vektor rusuk tersebut.**

A. $\vec{p} + \vec{l}$
B. $\vec{p} + \vec{t}$
C. $\vec{p} + \vec{l} + \vec{t}$
D. $\vec{p} - \vec{l} + \vec{t}$
E. $2(\vec{p} + \vec{l} + \vec{t})$

> **KUNCI JAWABAN:** **C** — $\vec{p} + \vec{l} + \vec{t}$

**Pembahasan.** Titik $G$ berseberangan dengan $A$ menembus balok, sehingga untuk sampai ke sana kita harus menempuh ketiga arah rusuk sekali masing-masing: $\overrightarrow{AG} = \vec{p} + \vec{l} + \vec{t}$. **Opsi C**.

---

#### Soal 3

- **ID:** `b4_04_3`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `diagonal_balok`

Diketahui balok $ABCD.EFGH$ dengan $A$ di titik asal, $\overrightarrow{AB} = (6,\,0,\,0)$, $\overrightarrow{AD} = (0,\,3,\,0)$, dan $\overrightarrow{AE} = (0,\,0,\,2)$.

**Tentukan $\overrightarrow{BH}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} -6 \\ 3 \\ 2 \end{pmatrix}$

**Pembahasan.** $B = (6,0,0)$ dan $H = A + \overrightarrow{AD} + \overrightarrow{AE} = (0,3,2)$, sehingga $\overrightarrow{BH} = H - B = (0-6,\; 3-0,\; 2-0) = (-6,\, 3,\, 2)$. Komponen $x$-nya negatif karena perjalanan dari $B$ ke $H$ harus **mundur** sepanjang rusuk $AB$.

---

### 4.5 Teknik Sniper Komponen

#### Soal 1

- **ID:** `b4_05_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `sniper_komponen`

Diketahui $\vec{u} = (2,\, k,\, 1)$ dan $\vec{v} = (3,\, 4,\, -1)$ dengan $\vec{u} \cdot \vec{v} = 5$.

**Tentukan nilai $k$.**

> **KUNCI JAWABAN:** **0**

**Pembahasan.** Suku konstantanya: $2(3) + 1(-1) = 6 - 1 = 5$. Suku parameternya: $4k$. Maka $5 + 4k = 5$, sehingga $4k = 0$ dan $k = 0$.

---

#### Soal 2

- **ID:** `b4_05_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `sniper_komponen`

Diketahui $\vec{a} = (1,\, p,\, 3)$ dan $\vec{b} = (2,\, -1,\, 4)$ saling tegak lurus.

**Tentukan nilai $p$.**

> **KUNCI JAWABAN:** **14**

**Pembahasan.** Syarat tegak lurus: $\vec{a}\cdot\vec{b} = 0$. Suku konstantanya $1(2) + 3(4) = 2 + 12 = 14$; suku parameternya $-p$. Maka $14 - p = 0$, sehingga $p = 14$.

---

#### Soal 3

- **ID:** `b4_05_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `sniper_komponen`

Perhatikan empat bentuk soal berikut, masing-masing memuat satu parameter.

**Pada bentuk soal manakah teknik sniper komponen TIDAK dapat dipakai?**

A. $\vec{u} \cdot \vec{v} = 12$, dengan satu komponen $\vec{u}$ memuat $k$.
B. $\vec{a} \perp \vec{b}$, dengan satu komponen $\vec{b}$ memuat $k$.
C. $|\vec{v}| = 10$, dengan komponen $\vec{v}$ memuat $m$.
D. Proyeksi skalar $\vec{a}$ pada $\vec{b}$ bernilai $3$, dengan pembilang memuat $k$.
E. $\vec{p} \cdot \vec{q} = 0$, dengan dua komponen $\vec{q}$ memuat $k$.

> **KUNCI JAWABAN:** **C** — $|\vec{v}| = 10$, dengan komponen $\vec{v}$ memuat $m$.

**Pembahasan.** Teknik sniper hanya bekerja pada operasi yang **linear** terhadap parameternya. Pada modulus, setiap komponen **dikuadratkan**, sehingga parameternya muncul sebagai $m^2$ dan tidak bisa dipisahkan sebagai satu suku linear. Bentuk itu harus dikerjakan dengan Taktik TKA 1. **Opsi C**.

---

*Total 76 soal Mini Kuis.*
