# Arsip Mini Kuis — Ruang Vektor

Soal Mini Kuis di akhir setiap sub-topik beserta **kunci jawabannya**.
Di aplikasi, kunci & pembahasan baru tampil sesudah siswa menjawab benar
atau sesudah salah ke-3 pada soal yang sama.

> ⚠️ **Berkas ini DIBANGKITKAN dari data JSON.** Jangan disunting langsung —
> suntinganmu akan hilang saat dibangkitkan ulang. Ubah JSON-nya, lalu jalankan
> `python tests/archive_soal.py`.

---

## Bab 1: Konsep Dasar Vektor

### 1.1 Lahirnya Sebuah Vektor

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
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `pengertian_notasi`

Vektor $\vec{PQ}$ menyatakan perpindahan dari titik $P$ ke titik $Q$.

**Pernyataan yang benar tentang $\vec{QP}$ adalah ....**

A. $\vec{QP} = \vec{PQ}$
B. $\vec{QP} = -\vec{PQ}$
C. $|\vec{QP}| = -|\vec{PQ}|$
D. $\vec{QP} = \vec{0}$
E. $\vec{QP} \perp \vec{PQ}$

> **KUNCI JAWABAN:** **B** — $\vec{QP} = -\vec{PQ}$

**Pembahasan.** $\vec{QP}$ menempuh ruas garis yang sama persis, tetapi ke arah sebaliknya. Panjangnya tetap, arahnya berlawanan — itulah arti $\vec{QP} = -\vec{PQ}$. **Opsi B**.

---

#### Soal 3

- **ID:** `b1_01_3`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `pengertian_notasi`

Perhatikan lima besaran berikut.

**Pilih semua besaran yang termasuk besaran vektor.**

A. Suhu ruangan $24^\circ$C
B. Gaya dorong $20$ N ke kanan
C. Massa balok $5$ kg
D. Kecepatan angin $15$ km/jam ke utara
E. Waktu tempuh $2$ jam

> **KUNCI JAWABAN:** **B, D**

**Pembahasan.** Yang menjadikan sebuah besaran vektor bukan satuannya, melainkan adanya **keterangan arah**. Hanya gaya dorong dan kecepatan angin yang menyebutkan arah.

**Penjelasan per opsi:**

- **A.** Skalar — suhu punya nilai, tetapi tidak punya arah. Tidak ada "$24^\circ$C ke barat".
- **B.** **Vektor** — ada nilai ($20$ N) dan ada arah (ke kanan).
- **C.** Skalar — massa hanya menyatakan banyaknya materi, tidak menunjuk ke mana pun.
- **D.** **Vektor** — ada nilai ($15$ km/jam) dan ada arah (ke utara).
- **E.** Skalar — waktu mengalir satu arah untuk semua orang; itu bukan "arah" dalam pengertian ruang.

---

### 1.2 Tiga Cara Menulis Komponen

#### Soal 1

- **ID:** `b1_02_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `notasi_penyajian`

Diketahui sebuah vektor dalam bentuk basis vektor satuan.

$$ \vec{v} = 5\hat{i} - \hat{j} + 3\hat{k} $$

**Bentuk matriks kolom dari $\vec{v}$ adalah ....**

A. $\begin{pmatrix} 5 \\ 1 \\ 3 \end{pmatrix}$
B. $\begin{pmatrix} 5 \\ -1 \\ 3 \end{pmatrix}$
C. $\begin{pmatrix} 5 \\ 0 \\ 3 \end{pmatrix}$
D. $\begin{pmatrix} 5 \\ -3 \\ 1 \end{pmatrix}$
E. $\begin{pmatrix} -5 \\ 1 \\ -3 \end{pmatrix}$

> **KUNCI JAWABAN:** **B** — $\begin{pmatrix} 5 \\ -1 \\ 3 \end{pmatrix}$

**Pembahasan.** Koefisien $\hat{i}$, $\hat{j}$, dan $\hat{k}$ berturut-turut menjadi komponen $x$, $y$, dan $z$. Suku $-\hat{j}$ berkoefisien $-1$, jadi komponen $y = -1$. **Opsi B**.

---

#### Soal 2

- **ID:** `b1_02_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `notasi_penyajian`

Diketahui $\vec{w} = (0,\, -7,\, 2)$.

**Tentukan koefisien $\hat{j}$ ketika $\vec{w}$ ditulis dalam bentuk basis vektor satuan.**

> **KUNCI JAWABAN:** **-7**

**Pembahasan.** Pada pasangan terurut $(x,\, y,\, z)$, bilangan di posisi kedua adalah komponen $y$, dan komponen $y$ menjadi koefisien $\hat{j}$. Jadi $\vec{w} = -7\hat{j} + 2\hat{k}$, dan koefisien $\hat{j}$ adalah $-7$.

---

#### Soal 3

- **ID:** `b1_02_3`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `notasi_penyajian`

Diketahui $\vec{u} = -2\hat{i} + 4\hat{k}$.

**Tuliskan $\vec{u}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} -2 \\ 0 \\ 4 \end{pmatrix}$

**Pembahasan.** Huruf basis $\hat{j}$ tidak muncul sama sekali, artinya komponen $y$ bernilai $0$. Maka $\vec{u} = \begin{pmatrix} -2 \\ 0 \\ 4 \end{pmatrix}$.

---

### 1.3 Kalau Pangkalnya Bukan di Nol

#### Soal 1

- **ID:** `b1_03_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `vektor_posisi`

Diketahui titik $A(3,\, -2)$ dan $B(7,\, 5)$.

**Tentukan komponen $x$ dari vektor $\vec{AB}$.**

> **KUNCI JAWABAN:** **4**

**Pembahasan.** $\vec{AB} = B - A$, sehingga komponen $x$-nya adalah $7 - 3 = 4$.

---

#### Soal 2

- **ID:** `b1_03_2`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `vektor_posisi`

Diketahui titik $A(1,\, 4,\, -2)$ dan $B(5,\, 2,\, 3)$ di ruang.

**Tentukan $\vec{AB}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} 4 \\ -2 \\ 5 \end{pmatrix}$

**Pembahasan.** $\vec{AB} = B - A = \begin{pmatrix} 5-1 \\ 2-4 \\ 3-(-2) \end{pmatrix} = \begin{pmatrix} 4 \\ -2 \\ 5 \end{pmatrix}$. Perhatikan baris ketiga: mengurangi bilangan negatif berarti **menambah**.

---

#### Soal 3

- **ID:** `b1_03_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_posisi`

Diketahui vektor posisi $\vec{OA} = (2,\, 5)$ dan $\vec{OB} = (-1,\, 3)$.

**Tentukan $\vec{AB}$.**

A. $(3,\, 2)$
B. $(-3,\, -2)$
C. $(1,\, 8)$
D. $(-3,\, 2)$
E. $(3,\, -2)$

> **KUNCI JAWABAN:** **B** — $(-3,\, -2)$

**Pembahasan.** Vektor posisi $\vec{OA}$ dan $\vec{OB}$ berarti $A(2,5)$ dan $B(-1,3)$. Maka $\vec{AB} = B - A = (-1-2,\; 3-5) = (-3,\, -2)$. **Opsi B**.

---

#### Soal 4

- **ID:** `b1_03_4`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_posisi`

Diketahui $\vec{PQ} = (6,\, -4)$ dan koordinat titik $P(2,\, 1)$.

**Tentukan koordinat titik $Q$.**

A. $Q(4,\, -5)$
B. $Q(8,\, -3)$
C. $Q(-4,\, 5)$
D. $Q(12,\, -4)$
E. $Q(3,\, -2)$

> **KUNCI JAWABAN:** **B** — $Q(8,\, -3)$

**Pembahasan.** Dari $\vec{PQ} = Q - P$ diperoleh $Q = P + \vec{PQ} = (2+6,\; 1+(-4)) = (8,\, -3)$. **Opsi B**.

---

### 1.4 Modulus — Berapa Jauh Sebenarnya?

#### Soal 1

- **ID:** `b1_05_1`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `panjang_vektor`

Diketahui vektor $\vec{v} = (6,\, 8)$.

**Tentukan panjang vektor $\vec{v}$.**

> **KUNCI JAWABAN:** **10**

**Pembahasan.** $|\vec{v}| = \sqrt{6^2 + 8^2} = \sqrt{36 + 64} = \sqrt{100} = 10$. Ini kelipatan dari tripel Pythagoras $(3,4,5)$.

---

#### Soal 2

- **ID:** `b1_05_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `panjang_vektor`

Diketahui vektor $\vec{a} = (2,\, 4)$.

**Panjang vektor $\vec{a}$ dalam bentuk akar paling sederhana adalah ....**

A. $2\sqrt{5}$
B. $4\sqrt{5}$
C. $5\sqrt{2}$
D. $2\sqrt{10}$
E. $6$

> **KUNCI JAWABAN:** **A** — $2\sqrt{5}$

**Pembahasan.** $|\vec{a}| = \sqrt{2^2 + 4^2} = \sqrt{4 + 16} = \sqrt{20}$. Faktor kuadrat terbesar dari $20$ adalah $4$, sehingga $\sqrt{20} = \sqrt{4 \cdot 5} = 2\sqrt{5}$. **Opsi A**.

---

#### Soal 3

- **ID:** `b1_05_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `panjang_vektor`

Diketahui vektor di ruang $\vec{p} = (1,\, -2,\, 2)$.

**Tentukan $|\vec{p}|$.**

A. $1$
B. $3$
C. $\sqrt{5}$
D. $\sqrt{7}$
E. $5$

> **KUNCI JAWABAN:** **B** — $3$

**Pembahasan.** $|\vec{p}| = \sqrt{1^2 + (-2)^2 + 2^2} = \sqrt{1 + 4 + 4} = \sqrt{9} = 3$. Perhatikan $(-2)^2 = 4$, bukan $-4$. **Opsi B**.

---

#### Soal 4

- **ID:** `b1_05_4`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `panjang_vektor`

Diketahui $\vec{u} = (3,\, 4)$ dan $\vec{v} = (1,\, 6)$.

**Tanpa menghitung akarnya, tentukan pernyataan yang benar.**

A. $|\vec{u}| > |\vec{v}|$
B. $|\vec{u}| < |\vec{v}|$
C. $|\vec{u}| = |\vec{v}|$
D. $|\vec{u}| = 2|\vec{v}|$
E. Tidak dapat dibandingkan tanpa menghitung akarnya.

> **KUNCI JAWABAN:** **B** — $|\vec{u}| < |\vec{v}|$

**Pembahasan.** $|\vec{u}|^2 = 9 + 16 = 25$ dan $|\vec{v}|^2 = 1 + 36 = 37$. Karena $25 < 37$, maka $|\vec{u}| < |\vec{v}|$. Membandingkan kuadratnya sudah cukup — akar kuadrat adalah fungsi naik, sehingga urutannya tidak berubah. **Opsi B**.

---

### 1.5 Vektor Satuan — Kunci Arahnya

#### Soal 1

- **ID:** `b1_06_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_satuan`

Diketahui vektor $\vec{a} = (6,\, 8)$.

**Vektor satuan dari $\vec{a}$ adalah ....**

A. $\left(\tfrac{3}{5},\, \tfrac{4}{5}\right)$
B. $\left(\tfrac{6}{5},\, \tfrac{8}{5}\right)$
C. $\left(\tfrac{1}{6},\, \tfrac{1}{8}\right)$
D. $(6,\, 8)$
E. $\left(\tfrac{8}{10},\, \tfrac{6}{10}\right)$

> **KUNCI JAWABAN:** **A** — $\left(\tfrac{3}{5},\, \tfrac{4}{5}\right)$

**Pembahasan.** $|\vec{a}| = \sqrt{36+64} = 10$, sehingga $\hat{e} = \left(\tfrac{6}{10},\, \tfrac{8}{10}\right) = \left(\tfrac{3}{5},\, \tfrac{4}{5}\right)$. Periksa: $\tfrac{9}{25} + \tfrac{16}{25} = 1$. **Opsi A**.

---

#### Soal 2

- **ID:** `b1_06_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `vektor_satuan`

Vektor $\hat{e}$ adalah vektor satuan dari sebuah vektor $\vec{w}$ yang panjangnya $13$ satuan.

**Tentukan panjang vektor $\hat{e}$.**

> **KUNCI JAWABAN:** **1**

**Pembahasan.** Menurut definisinya, panjang vektor satuan **selalu** $1$ — berapa pun panjang vektor asalnya. Angka $13$ di soal tidak memengaruhi jawaban sama sekali.

---

#### Soal 3

- **ID:** `b1_06_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `vektor_satuan`

Seorang siswa mencoba menghitung vektor satuan dari $\vec{0} = (0,\, 0)$.

**Manakah alasan yang paling tepat mengapa hal itu tidak dapat dilakukan?**

A. Karena komponen vektor nol terlalu kecil untuk dibagi.
B. Karena $|\vec{0}| = 0$, sehingga rumus $\hat{e} = \tfrac{\vec{v}}{|\vec{v}|}$ membagi dengan nol — dan vektor nol memang tidak menunjuk ke arah mana pun.
C. Karena vektor satuan hanya berlaku untuk vektor di R³.
D. Karena hasilnya adalah $(0,\, 0)$, dan itu sudah merupakan vektor satuan.
E. Karena vektor nol tidak boleh ditulis dalam bentuk kolom.

> **KUNCI JAWABAN:** **B** — Karena $|\vec{0}| = 0$, sehingga rumus $\hat{e} = \tfrac{\vec{v}}{|\vec{v}|}$ membagi dengan nol — dan vektor nol memang tidak menunjuk ke arah mana pun.

**Pembahasan.** Dua alasan yang saling menguatkan: secara aljabar, pembagian dengan nol tidak terdefinisi; secara makna, vektor nol tidak punya arah untuk diwakili. **Opsi B**.

---

### 1.6 Melangkah ke Ruang Tiga Dimensi

#### Soal 1

- **ID:** `b1_04_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `komponen_r2_r3`

Sebuah drone bergerak $5$ satuan ke depan, $3$ satuan ke kiri, lalu naik $2$ satuan. Dipakai konvensi $Z$-Up: sumbu $X$ depan–belakang, sumbu $Y$ kanan–kiri, sumbu $Z$ atas–bawah.

**Vektor perpindahan drone tersebut adalah ....**

A. $(5,\, 3,\, 2)$
B. $(5,\, -3,\, 2)$
C. $(-5,\, 3,\, 2)$
D. $(5,\, 2,\, -3)$
E. $(2,\, -3,\, 5)$

> **KUNCI JAWABAN:** **B** — $(5,\, -3,\, 2)$

**Pembahasan.** Maju berarti $x$ positif, sehingga $x = 5$. Ke kiri berlawanan dengan arah $y$ positif, sehingga $y = -3$. Naik searah $z$ positif, sehingga $z = 2$. Maka perpindahannya $(5,\, -3,\, 2)$. **Opsi B**.

---

#### Soal 2

- **ID:** `b1_04_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `komponen_r2_r3`

Sebuah drone bergerak $3$ meter ke timur, $4$ meter ke selatan, dan naik $12$ meter. Arah timur dijadikan sumbu $x$ positif, arah utara sumbu $y$ positif, dan ke atas sumbu $z$ positif.

**Tentukan nilai komponen $y$ dari vektor perpindahan drone tersebut.**

> **KUNCI JAWABAN:** **-4**

**Pembahasan.** Arah utara ditetapkan sebagai $y$ positif, maka arah **selatan** adalah $y$ negatif. Perpindahan $4$ meter ke selatan berarti komponen $y = -4$.

---

#### Soal 3

- **ID:** `b1_04_3`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `komponen_r2_r3`

Perhatikan pernyataan-pernyataan tentang komponen vektor berikut.

**Pilih semua pernyataan yang benar.**

A. Vektor $(0,\, 0,\, 7)$ bergerak pada arah tegak saja, tanpa perpindahan mendatar.
B. Vektor $(-3,\, 0)$ adalah vektor nol karena salah satu komponennya $0$.
C. Semua rumus vektor di $R^2$ berlaku di $R^3$ dengan menambahkan satu komponen.
D. Vektor di kurikulum TKA dapat memiliki lebih dari tiga komponen.
E. Komponen bertanda negatif menunjukkan **arah**, bukan panjang yang negatif.

> **KUNCI JAWABAN:** **A, C, E**

**Pembahasan.** Kuncinya ada pada dua hal: vektor nol menuntut **semua** komponen nol, dan tanda negatif selalu berarti arah, bukan panjang negatif.

**Penjelasan per opsi:**

- **A.** **Benar** — komponen $x$ dan $y$ keduanya $0$, jadi yang tersisa hanya gerak naik sepanjang sumbu $z$.
- **B.** Salah — vektor nol mensyaratkan **semua** komponennya $0$. Vektor $(-3,0)$ masih punya panjang $3$.
- **C.** **Benar** — inilah sebabnya R³ tidak menuntut hafalan rumus baru.
- **D.** Salah — rincian Kemendikdasmen membatasi komponen vektor **maksimum tiga**.
- **E.** **Benar** — panjang tidak pernah negatif; tanda selalu bicara soal arah.

---

## Bab 2: Operasi & Bangun Datar

### 2.1 Aturan Segitiga & Poligon

#### Soal 1

- **ID:** `b2_01_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `penjumlahan_segitiga`

Perhatikan penjumlahan vektor berikut.

$$ \vec{AB} + \vec{BC} $$

**Hasil penjumlahan tersebut adalah ....**

A. $\vec{AC}$
B. $\vec{CA}$
C. $\vec{AB}$
D. $\vec{BC}$
E. $\vec{0}$

> **KUNCI JAWABAN:** **A** — $\vec{AC}$

**Pembahasan.** Ujung vektor pertama ($B$) bertemu pangkal vektor kedua ($B$), sehingga huruf $B$ saling menghapus. Yang tersisa adalah perjalanan dari $A$ ke $C$, yaitu $\vec{AC}$. **Opsi A**.

---

#### Soal 2

- **ID:** `b2_01_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `penjumlahan_segitiga`

Sebuah drone terbang dari $P$ ke $Q$, lalu ke $R$, lalu ke $S$.

$$ \vec{PQ} + \vec{QR} + \vec{RS} $$

**Vektor perpindahan total drone tersebut adalah ....**

A. $\vec{PR}$
B. $\vec{QS}$
C. $\vec{PS}$
D. $\vec{SP}$
E. $\vec{PQ} + \vec{RS}$

> **KUNCI JAWABAN:** **C** — $\vec{PS}$

**Pembahasan.** Aturan poligon: sambung terus ujung ke pangkal, lalu tarik satu vektor dari titik paling awal ($P$) ke titik paling akhir ($S$). Huruf $Q$ dan $R$ saling menghapus. **Opsi C**.

---

#### Soal 3

- **ID:** `b2_01_3`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `penjumlahan_segitiga`

Diketahui panjang $\vec{AB} = 12$ satuan.

**Tentukan panjang vektor $\vec{AB} + \vec{BA}$.**

> **KUNCI JAWABAN:** **0**

**Pembahasan.** $\vec{AB} + \vec{BA} = \vec{AA} = \vec{0}$, dan panjang vektor nol adalah $0$. Angka $12$ di soal sengaja disediakan sebagai pengecoh — berapa pun panjangnya, pergi lalu kembali menghasilkan perpindahan nol.

---

### 2.2 Aturan Jajar Genjang

#### Soal 1

- **ID:** `b2_02_1`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `penjumlahan_jajargenjang`

Diketahui jajar genjang $ABCD$ dengan $\vec{AB} = \vec{a}$ dan $\vec{AD} = \vec{b}$.

**Nyatakan diagonal $\vec{AC}$ dalam $\vec{a}$ dan $\vec{b}$.**

A. $\vec{a} - \vec{b}$
B. $\vec{a} + \vec{b}$
C. $\vec{b} - \vec{a}$
D. $2\vec{a}$
E. $\tfrac{1}{2}(\vec{a} + \vec{b})$

> **KUNCI JAWABAN:** **B** — $\vec{a} + \vec{b}$

**Pembahasan.** $\vec{AC} = \vec{AB} + \vec{BC}$. Pada jajar genjang, $\vec{BC} = \vec{AD} = \vec{b}$ karena sisi berhadapan sejajar dan sama panjang. Maka $\vec{AC} = \vec{a} + \vec{b}$. **Opsi B**.

---

#### Soal 2

- **ID:** `b2_02_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `penjumlahan_jajargenjang`

Masih pada jajar genjang $ABCD$ dengan $\vec{AB} = \vec{a}$ dan $\vec{AD} = \vec{b}$.

**Nyatakan diagonal $\vec{DB}$ dalam $\vec{a}$ dan $\vec{b}$.**

A. $\vec{a} + \vec{b}$
B. $\vec{a} - \vec{b}$
C. $\vec{b} - \vec{a}$
D. $-\vec{a} - \vec{b}$
E. $\vec{0}$

> **KUNCI JAWABAN:** **B** — $\vec{a} - \vec{b}$

**Pembahasan.** $\vec{DB} = \vec{DA} + \vec{AB} = -\vec{b} + \vec{a} = \vec{a} - \vec{b}$. **Opsi B**.

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

**Pembahasan.** $\vec{AB} = (2,\, 4)$ dan $\vec{AC} = (p-1,\, 12)$. Agar segaris, $\vec{AC} = k\,\vec{AB}$. Dari komponen $y$: $12 = 4k \Rightarrow k = 3$. Maka dari komponen $x$: $p - 1 = 3(2) = 6$, sehingga $p = 7$.

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

**Pembahasan.** Pada opsi B: $\vec{AB} = (2,3)$ dan $\vec{AC} = (6,9)$. Dari komponen $x$: $k = 3$; diuji pada komponen $y$: $3 \times 3 = 9$ ✓. Nilai $k$ sama untuk keduanya, jadi segaris. **Opsi B**.

---

#### Soal 3

- **ID:** `b2_07_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `titik_segaris`

Diketahui $\vec{AB} = (2,\, 4)$ dan $\vec{CD} = (1,\, 2)$, dengan $A$, $B$, $C$, $D$ empat titik yang berbeda dan tidak ada huruf yang berulang.

**Manakah kesimpulan yang paling tepat?**

A. Keempat titik pasti terletak pada satu garis lurus.
B. Ruas garis $AB$ dan $CD$ sejajar, tetapi belum tentu segaris.
C. Ruas garis $AB$ dan $CD$ pasti berpotongan.
D. Ruas garis $AB$ dan $CD$ pasti tegak lurus.
E. Tidak dapat disimpulkan apa pun dari data tersebut.

> **KUNCI JAWABAN:** **B** — Ruas garis $AB$ dan $CD$ sejajar, tetapi belum tentu segaris.

**Pembahasan.** $\vec{AB} = 2\,\vec{CD}$, sehingga keduanya **sejajar**. Tetapi karena kedua vektor tidak berbagi satu titik pun, keduanya bisa saja terletak pada dua garis sejajar yang berbeda. Sejajar tidak otomatis segaris. **Opsi B**.

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
D. Menghitung panjang $\vec{AB}$ lebih dahulu.
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

$$ \vec{AB} = \begin{pmatrix} 2m \\ m+3 \\ m \end{pmatrix} $$

**Jika panjang vektor $\vec{AB} = 9$ satuan panjang, maka nilai $m$ yang memenuhi adalah ....**

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

Diketahui trapesium sama kaki $ABCD$ dengan $AD = BC$ dan titik $A(0,\, 0)$. Vektor-vektor posisi pembentuk trapesium adalah $\vec{AD} = \begin{pmatrix} 1 \\ 4 \end{pmatrix}$, $\vec{AB} = \begin{pmatrix} 6 \\ 0 \end{pmatrix}$, dan $\vec{BC} = \begin{pmatrix} a \\ b \end{pmatrix}$.

**Nilai dari $a^2 + 2b$ adalah ....**

A. $5$
B. $7$
C. $9$
D. $10$
E. $13$

> **KUNCI JAWABAN:** **C** — $9$

**Pembahasan.** $\vec{AB}$ berkomponen $y$ nol, jadi alasnya mendatar; pada trapesium sama kaki beralas mendatar kedua kaki naik setinggi sama, sehingga $b = 4$. Dari $AD = BC$: $|\vec{AD}| = \sqrt{1+16} = \sqrt{17}$, maka $a^2 + b^2 = 17 \Rightarrow a^2 = 1$. Jadi $a^2 + 2b = 1 + 8 = 9$. **Opsi C**.

---

#### Soal 2

- **ID:** `b4_02_2`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `bangun_segiempat`

Diketahui jajar genjang $ABCD$ dengan $\vec{AB} = (5,\, 2)$ dan $\vec{AD} = (1,\, 4)$.

**Tentukan komponen $x$ dari diagonal $\vec{AC}$.**

> **KUNCI JAWABAN:** **6**

**Pembahasan.** Pada jajar genjang, $\vec{BC} = \vec{AD}$, sehingga $\vec{AC} = \vec{AB} + \vec{AD} = (5+1,\; 2+4) = (6,\, 6)$. Komponen $x$-nya adalah $6$.

---

#### Soal 3

- **ID:** `b4_02_3`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `bangun_segiempat`

Pada segiempat $ABCD$ diketahui sifat: "sisi berhadapan sejajar dan sama panjang".

**Manakah terjemahan vektor yang paling tepat untuk sifat tersebut?**

A. $\vec{AB} = \vec{CD}$
B. $\vec{AB} = \vec{DC}$
C. $|\vec{AB}| = |\vec{CD}|$
D. $\vec{AB} \cdot \vec{DC} = 0$
E. $\vec{AB} = k\,\vec{DC}$

> **KUNCI JAWABAN:** **B** — $\vec{AB} = \vec{DC}$

**Pembahasan.** Pada segiempat $ABCD$ yang titik-titiknya berurutan, sisi $AB$ berhadapan dengan sisi $DC$ — perhatikan arah penulisannya. Sejajar **dan** sama panjang berarti kedua vektornya **sama**, yaitu $\vec{AB} = \vec{DC}$. **Opsi B**.

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

**Pembahasan.** $\vec{AE} = (9,3,3)$ sehingga $|\vec{AE}| = \sqrt{99} \approx 9{,}95$ km, dengan waktu total $13$ menit. Jalan pintasnya: ambang waktu $t < \tfrac{3{,}5 \times 13}{9{,}95} \approx 4{,}57$ menit. Setiap ruas berwaktu di bawah $4{,}57$ menit memenuhi syarat — yaitu $BC$, $CD$, dan $DE$.

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

**Tentukan nilai $|\vec{AE}|^2$.**

> **KUNCI JAWABAN:** **99**

**Pembahasan.** $\vec{AE} = E - A = (9,\, 3,\, 3)$, sehingga $|\vec{AE}|^2 = 81 + 9 + 9 = 99$. Perhatikan bahwa soal menanyakan **kuadratnya**, jadi akarnya tidak perlu ditarik sama sekali.

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

**Tentukan panjang diagonal ruang $\vec{AG}$ dalam cm.**

> **KUNCI JAWABAN:** **13**

**Pembahasan.** $\vec{AG} = (12,\, 4,\, 3)$, sehingga $|\vec{AG}| = \sqrt{144 + 16 + 9} = \sqrt{169} = 13$ cm.

---

#### Soal 2

- **ID:** `b4_04_2`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `diagonal_balok`

Diketahui balok $ABCD.EFGH$ dengan $\vec{AB} = \vec{p}$, $\vec{AD} = \vec{l}$, dan $\vec{AE} = \vec{t}$.

**Nyatakan diagonal ruang $\vec{AG}$ dalam ketiga vektor rusuk tersebut.**

A. $\vec{p} + \vec{l}$
B. $\vec{p} + \vec{t}$
C. $\vec{p} + \vec{l} + \vec{t}$
D. $\vec{p} - \vec{l} + \vec{t}$
E. $2(\vec{p} + \vec{l} + \vec{t})$

> **KUNCI JAWABAN:** **C** — $\vec{p} + \vec{l} + \vec{t}$

**Pembahasan.** Titik $G$ berseberangan dengan $A$ menembus balok, sehingga untuk sampai ke sana kita harus menempuh ketiga arah rusuk sekali masing-masing: $\vec{AG} = \vec{p} + \vec{l} + \vec{t}$. **Opsi C**.

---

#### Soal 3

- **ID:** `b4_04_3`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `diagonal_balok`

Diketahui balok $ABCD.EFGH$ dengan $A$ di titik asal, $\vec{AB} = (6,\,0,\,0)$, $\vec{AD} = (0,\,3,\,0)$, dan $\vec{AE} = (0,\,0,\,2)$.

**Tentukan $\vec{BH}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} -6 \\ 3 \\ 2 \end{pmatrix}$

**Pembahasan.** $B = (6,0,0)$ dan $H = A + \vec{AD} + \vec{AE} = (0,3,2)$, sehingga $\vec{BH} = H - B = (0-6,\; 3-0,\; 2-0) = (-6,\, 3,\, 2)$. Komponen $x$-nya negatif karena perjalanan dari $B$ ke $H$ harus **mundur** sepanjang rusuk $AB$.

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

*Total 78 soal Mini Kuis.*
