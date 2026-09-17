# Arsip Latihan Soal TKA — Ruang Vektor

Set **10 soal** yang dipakai mode *Latihan Soal TKA*,
urut persis seperti yang dilihat siswa (bank `tka_2026`).

*Urutan TETAP, dipilih tangan sebagai penutup bergaya HOTS: dibuka dengan parameter tersembunyi, ditutup dengan multi-kondisi kasus batas.*

> ⚠️ **Berkas ini DIBANGKITKAN dari data JSON.** Jangan disunting langsung —
> suntinganmu akan hilang saat dibangkitkan ulang. Ubah JSON-nya, lalu jalankan
> `python tests/archive_soal.py`.

Rujukan gaya soal: `docs/Contoh_Soal_TKA_Vektor_1–3.png` dan
`docs/Rincian_Vektor_TKA_Kemendikdasmen.png`.

---

### Soal 1 · Latihan TKA · No. 1

- **ID:** `tka26_01`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `parameter_modulus`

Diketahui vektor berikut.

$$ \vec{v} = \begin{pmatrix} 2m \\ m \\ 2m \end{pmatrix} $$

**Jika $|\vec{v}| = 12$, maka nilai $m$ yang memenuhi adalah ....**

A. $-4 \ \text{atau} \ 4$
B. $-3 \ \text{atau} \ 3$
C. $4 \ \text{saja}$
D. $-2 \ \text{atau} \ 2$
E. $-6 \ \text{atau} \ 6$

> **KUNCI JAWABAN:** **A** — $-4 \ \text{atau} \ 4$

**Pembahasan.** $4m^2 + m^2 + 4m^2 = 144 \Rightarrow 9m^2 = 144 \Rightarrow m^2 = 16 \Rightarrow m = \pm 4$. **Opsi A**.

---

### Soal 2 · Latihan TKA · No. 2

- **ID:** `tka26_02`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `kinematika_lintasan`

Sebuah kereta melaju dengan kecepatan konstan pada lintasan lurus dari stasiun $A(1,\, 2,\, 2)$ hingga stasiun $E(7,\, 5,\, 8)$, koordinat dalam km. Waktu tempuh antar stasiun tercatat pada tabel berikut.

| Ruas | Waktu tempuh (menit) |
|---|---|
| $A \to B$ | 4 |
| $B \to C$ | 2 |
| $C \to D$ | 3 |
| $D \to E$ | 1 |

**Pilih semua pasangan stasiun yang jaraknya kurang dari $2{,}5$ km.**

A. $AB$
B. $BC$
C. $CD$
D. $DE$
E. $CE$

> **KUNCI JAWABAN:** **B, D**

**Pembahasan.** $\vec{AE} = (6,\,3,\,6)$, sehingga $|\vec{AE}| = \sqrt{36+9+36} = \sqrt{81} = 9$ km dengan waktu total $10$ menit. Ambang waktunya: $t < \tfrac{2{,}5 \times 10}{9} \approx 2{,}78$ menit. Hanya $BC$ ($2$ menit) dan $DE$ ($1$ menit) yang lolos.

**Penjelasan per opsi:**

- **A.** Tidak memenuhi — $\tfrac{4}{10} \times 9 = 3{,}6$ km.
- **B.** **Memenuhi** — $\tfrac{2}{10} \times 9 = 1{,}8$ km.
- **C.** Tidak memenuhi — $\tfrac{3}{10} \times 9 = 2{,}7$ km, hanya sedikit di atas ambang.
- **D.** **Memenuhi** — $\tfrac{1}{10} \times 9 = 0{,}9$ km, yang terpendek.
- **E.** Tidak memenuhi — $CE$ gabungan $CD + DE$, sehingga waktunya $3+1 = 4$ menit dan jaraknya $3{,}6$ km.

---

### Soal 3 · Latihan TKA · No. 3

- **ID:** `tka26_03`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `bangun_segiempat`

Diketahui jajar genjang $ABCD$ dengan $A(1,\, 2)$, $B(6,\, 3)$, dan $D(3,\, 7)$.

**Tentukan koordinat titik $C$.**

A. $C(4,\, 8)$
B. $C(8,\, 8)$
C. $C(10,\, 12)$
D. $C(2,\, 6)$
E. $C(9,\, 10)$

> **KUNCI JAWABAN:** **B** — $C(8,\, 8)$

**Pembahasan.** Pada jajar genjang $ABCD$, $\vec{BC} = \vec{AD} = D - A = (2,\, 5)$. Maka $C = B + \vec{BC} = (6+2,\; 3+5) = (8,\, 8)$. **Opsi B**.

---

### Soal 4 · Latihan TKA · No. 4

- **ID:** `tka26_04`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `sudut_antar_vektor`

Diketahui $\vec{u} = (1,\, -1,\, 0)$ dan $\vec{v} = (1,\, 0,\, -1)$.

**Tentukan besar sudut antara $\vec{u}$ dan $\vec{v}$ dalam satuan derajat.**

> **KUNCI JAWABAN:** **60**

**Pembahasan.** $\vec{u}\cdot\vec{v} = 1 + 0 + 0 = 1$; $|\vec{u}| = |\vec{v}| = \sqrt{2}$, sehingga penyebutnya $2$. Maka $\cos\theta = \tfrac{1}{2}$ dan $\theta = 60^\circ$.

---

### Soal 5 · Latihan TKA · No. 5

- **ID:** `tka26_05`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `proyeksi_vektor`

Diketahui $\vec{a} = (4,\, -2,\, 4)$ dan $\vec{b} = (1,\, 2,\, 2)$.

**Tentukan vektor proyeksi ortogonal $\vec{a}$ pada $\vec{b}$.**

A. $\tfrac{8}{3}(1,\, 2,\, 2)$
B. $\tfrac{8}{9}(1,\, 2,\, 2)$
C. $\tfrac{8}{9}(4,\, -2,\, 4)$
D. $\tfrac{9}{8}(1,\, 2,\, 2)$
E. $8(1,\, 2,\, 2)$

> **KUNCI JAWABAN:** **B** — $\tfrac{8}{9}(1,\, 2,\, 2)$

**Pembahasan.** $\vec{a}\cdot\vec{b} = 4 - 4 + 8 = 8$ dan $|\vec{b}|^2 = 1+4+4 = 9$, sehingga vektor proyeksinya $\tfrac{8}{9}(1,2,2)$. **Opsi B**.

---

### Soal 6 · Latihan TKA · No. 6

- **ID:** `tka26_06`
- **Tipe:** Isian vektor kolom
- **Sub-topik:** `diagonal_balok`

Diketahui balok $ABCD.EFGH$ dengan $A$ berimpit titik asal, $\vec{AB} = (10,\,0,\,0)$, $\vec{AD} = (0,\,10,\,0)$, dan $\vec{AE} = (0,\,0,\,5)$.

**Tentukan $\vec{EC}$ dalam bentuk vektor kolom.**

> **KUNCI JAWABAN:** $\begin{pmatrix} 10 \\ 10 \\ -5 \end{pmatrix}$

**Pembahasan.** $E = (0,0,5)$ dan $C = A + \vec{AB} + \vec{AD} = (10,10,0)$, sehingga $\vec{EC} = C - E = (10,\, 10,\, -5)$. Komponen $z$ bertanda negatif karena perjalanan dari $E$ ke $C$ bergerak **turun**.

---

### Soal 7 · Latihan TKA · No. 7

- **ID:** `tka26_07`
- **Tipe:** Isian angka (papan angka)
- **Sub-topik:** `vektor_tegak_lurus`

Diketahui $\vec{a} = (k,\, 3,\, -1)$ dan $\vec{b} = (2,\, 1,\, 5)$ saling tegak lurus.

**Tentukan nilai $k$.**

> **KUNCI JAWABAN:** **1**

**Pembahasan.** $\vec{a}\cdot\vec{b} = 2k + 3 - 5 = 0$, sehingga $2k = 2$ dan $k = 1$.

---

### Soal 8 · Latihan TKA · No. 8

- **ID:** `tka26_08`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `titik_segaris`

Diketahui titik $A(2,\, -1,\, 3)$, $B(4,\, 1,\, 5)$, dan $C(8,\, 5,\, p)$ terletak pada satu garis lurus.

**Tentukan nilai $p$.**

A. $6$
B. $7$
C. $8$
D. $9$
E. $11$

> **KUNCI JAWABAN:** **D** — $9$

**Pembahasan.** $\vec{AB} = (2,\,2,\,2)$ dan $\vec{AC} = (6,\,6,\,p-3)$. Agar segaris, $\vec{AC} = k\,\vec{AB}$; dari komponen $x$ diperoleh $k = 3$. Maka $p - 3 = 3(2) = 6$, sehingga $p = 9$. **Opsi D**.

---

### Soal 9 · Latihan TKA · No. 9

- **ID:** `tka26_09`
- **Tipe:** Pilihan ganda (satu jawaban benar)
- **Sub-topik:** `dot_product`

Diketahui $|\vec{a}| = 3$, $|\vec{b}| = 4$, dan sudut antara $\vec{a}$ dan $\vec{b}$ adalah $60^\circ$.

**Tentukan nilai $\vec{a} \cdot \vec{b}$.**

A. $2\sqrt{3}$
B. $6$
C. $6\sqrt{3}$
D. $10$
E. $12$

> **KUNCI JAWABAN:** **B** — $6$

**Pembahasan.** Pakai rumus geometri: $\vec{a}\cdot\vec{b} = |\vec{a}||\vec{b}|\cos\theta = 3 \times 4 \times \cos 60^\circ = 12 \times \tfrac{1}{2} = 6$. **Opsi B**.

---

### Soal 10 · Latihan TKA · No. 10

- **ID:** `tka26_10`
- **Tipe:** Pilih semua jawaban benar
- **Sub-topik:** `sifat_perkalian`

Perhatikan pernyataan-pernyataan berikut.

**Pilih semua pernyataan yang benar.**

A. Jika $\vec{u} \cdot \vec{v} = 0$, maka $\vec{u}$ dan $\vec{v}$ pasti saling tegak lurus.
B. $\vec{a} \cdot \vec{a} = |\vec{a}|^2$ berlaku untuk setiap vektor $\vec{a}$.
C. Proyeksi skalar ortogonal dapat bernilai negatif.
D. Vektor proyeksi ortogonal selalu sejajar dengan vektor alasnya.
E. Jika $|\vec{u}| = |\vec{v}|$, maka $\vec{u} = \vec{v}$.

> **KUNCI JAWABAN:** **B, C, D**

**Pembahasan.** Kedua pernyataan yang keliru menyentuh kasus batas yang sama seringnya diuji: vektor nol pada syarat ortogonal, dan anggapan bahwa panjang menentukan vektor secara tunggal.

**Penjelasan per opsi:**

- **A.** Salah — kalau salah satunya **vektor nol**, hasil kali titiknya tetap nol padahal tidak ada sudut yang dapat diukur. Syarat ortogonal mensyaratkan kedua vektor **tak-nol**.
- **B.** **Benar** — berlaku bahkan untuk vektor nol, karena keduanya bernilai $0$.
- **C.** **Benar** — bernilai negatif ketika sudutnya tumpul, artinya bayangan jatuh berlawanan arah dengan alasnya.
- **D.** **Benar** — rumusnya berakhir dengan perkalian terhadap vektor alas, sehingga arahnya mengikuti alas.
- **E.** Salah — panjang yang sama sama sekali tidak menjamin arah yang sama. Contoh: $(3,0)$ dan $(0,3)$.

---

## Ringkasan Kunci Jawaban

| No | ID | Tipe | Kunci |
|---|---|---|---|
| 1 | `tka26_01` | Pilihan ganda (satu jawaban benar) | **A** |
| 2 | `tka26_02` | Pilih semua jawaban benar | **B, D** |
| 3 | `tka26_03` | Pilihan ganda (satu jawaban benar) | **B** |
| 4 | `tka26_04` | Isian angka (papan angka) | **60** |
| 5 | `tka26_05` | Pilihan ganda (satu jawaban benar) | **B** |
| 6 | `tka26_06` | Isian vektor kolom | **(10, 10, -5)** |
| 7 | `tka26_07` | Isian angka (papan angka) | **1** |
| 8 | `tka26_08` | Pilihan ganda (satu jawaban benar) | **D** |
| 9 | `tka26_09` | Pilihan ganda (satu jawaban benar) | **B** |
| 10 | `tka26_10` | Pilih semua jawaban benar | **B, C, D** |
