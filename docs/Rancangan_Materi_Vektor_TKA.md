# Modul Pembelajaran Vektor SMA Kelas 11: Zero to Hero TKA & SNBT

## 📌 Relevansi Materi: Mengapa Mempelajari Vektor?
Vektor adalah fondasi penting untuk berbagai bidang ilmu lanjutan dan teknologi modern:
*   **Komputasi & Digital:** Representasi data pada Kecerdasan Artifisial (AI) dan enkripsi informasi kriptografi.
*   **Astronomi & Navigasi:** Perhitungan lintasan satelit, jarak terpendek penerbangan (GPS), dan navigasi arah angin.
*   **Fisika:** Representasi gaya, medan elektromagnetik, dan gaya Lorentz.

---

## 🛠️ Pra-Materi (Prasyarat Wajib)
Sebelum mempelajari bab Vektor, pastikan kamu telah menguasai:
1.  **Teorema Pythagoras Lanjut:** Menyederhanakan bentuk akar dan menghitung diagonal ruang 3D ($\sqrt{p^2 + l^2 + t^2}$).
2.  **Aljabar Kuadratik:** Menyusun persamaan dari bentuk akar (dengan mengkuadratkan kedua ruas) dan memfaktorkan persamaan kuadrat.
3.  **Sifat Bangun Datar:** Memahami definisi jajar genjang (sisi berhadapan sejajar dan sama panjang) serta trapesium sama kaki (kaki miring sama panjang).
4.  **Perbandingan Senilai:** Logika rasio dasar (proporsionalitas jarak dan waktu).

---

## FASE 1: Konsep Dasar & Representasi Vektor

### 1. Pengenalan Visual di Bidang Kartesius
Vektor adalah besaran yang memiliki **nilai (panjang)** dan **arah**. Berbeda dengan titik koordinat statis, vektor menunjukkan **perpindahan**.
*   **Visualisasi Langkah (Geometris):** Vektor digambarkan berupa tanda panah.
    *   Komponen $x$: Perpindahan horizontal (kanan = positif, kiri = negatif).
    *   Komponen $y$: Perpindahan vertikal (atas = positif, bawah = negatif).
*   **Titik Pangkal dan Titik Ujung:**
    *   Vektor $\vec{AB}$ berarti bergerak dari titik pangkal $A$ menuju titik ujung $B$.
    *   Arah sangat menentukan: $\vec{BA}$ adalah kebalikan dari $\vec{AB}$, sehingga berlaku hubungan:
        $$\vec{BA} = -\vec{AB}$$

### 2. Penyajian Bentuk Notasi Vektor
Vektor dapat dituliskan dalam beberapa bentuk notasi:
*   **Huruf Kecil Bergaris/Tebal:** $\vec{a}$ atau $\mathbf{a}$.
*   **Matriks Kolom:**
    *   2D: $\begin{pmatrix} x \\ y \end{pmatrix}$
    *   3D: $\begin{pmatrix} x \\ y \\ z \end{pmatrix}$
*   **Koordinat Pasangan Terurut:** $(x, y)$ atau $(x, y, z)$
*   **Basis Vektor Satuan ($\hat{i}, \hat{j}, \hat{k}$):**
    *   $\hat{i}$ = vektor satuan searah sumbu X
    *   $\hat{j}$ = vektor satuan searah sumbu Y
    *   $\hat{k}$ = vektor satuan searah sumbu Z
    *   Bentuk penulisan: $\vec{v} = x\hat{i} + y\hat{j} + z\hat{k}$

### 3. Vektor Posisi
*   **Vektor Posisi dari Pusat $O(0,0)$:** Vektor posisi titik $A(x, y)$ terhadap titik pusat $O$ adalah $\vec{OA} = \vec{a} = \begin{pmatrix} x \\ y \end{pmatrix}$.
*   **Vektor Posisi dari Dua Titik:** Jika diketahui titik $A(x_1, y_1, z_1)$ dan $B(x_2, y_2, z_2)$, maka vektor $\vec{AB}$ dirumuskan:
    $$\vec{AB} = B - A = \begin{pmatrix} x_2 - x_1 \\ y_2 - y_1 \\ z_2 - z_1 \end{pmatrix}$$

---

## FASE 2: Modulus (Panjang) & Vektor Satuan

### 1. Modulus (Panjang Vektor)
Modulus atau panjang vektor dinotasikan dengan tanda mutlak $|\vec{v}|$. Panjang vektor dihitung menggunakan Teorema Pythagoras.
*   **Modulus Vektor 2D:** Jika $\vec{v} = \begin{pmatrix} x \\ y \end{pmatrix}$, maka:
    $$|\vec{v}| = \sqrt{x^2 + y^2}$$
*   **Modulus Vektor 3D:** Jika $\vec{v} = \begin{pmatrix} x \\ y \\ z \end{pmatrix}$, maka:
    $$|\vec{v}| = \sqrt{x^2 + y^2 + z^2}$$

### 2. Vektor Satuan
Vektor satuan ($\hat{e}$) adalah vektor yang searah dengan suatu vektor asal, tetapi memiliki panjang tepat **1 satuan**.
$$\hat{e} = \frac{\vec{v}}{|\vec{v}|}$$

### 💡 [TAKTIK TKA 1] Parameter Tersembunyi pada Modulus
Pada soal TKA, nilai modulus sering kali diketahui, namun komponen penyusunnya berisi variabel aljabar.

**Contoh Kasus:** 
Diketahui $\vec{AB} = \begin{pmatrix} 2m \\ m+3 \\ m \end{pmatrix}$. Jika panjang vektor $\vec{AB} = 9$, tentukan nilai $m$!

**Langkah Eksekusi:**
1. Gunakan rumus modulus: $\sqrt{(2m)^2 + (m+3)^2 + m^2} = 9$
2. Kuadratkan kedua ruas: $4m^2 + (m^2 + 6m + 9) + m^2 = 81$
3. Sederhanakan ke bentuk persamaan kuadrat: $6m^2 + 6m - 72 = 0 \Rightarrow m^2 + m - 12 = 0$
4. Faktorkan: $(m+4)(m-3) = 0$. Maka $m = -4$ atau $m = 3$.

---

## FASE 3: Operasi Aljabar & Geometri Vektor

### 1. Penjumlahan & Pengurangan Vektor
*   **Geometri (Aturan Segitiga/Poligon):** Sambungkan ujung vektor pertama dengan pangkal vektor kedua. Vektor hasil (resultan) ditarik dari pangkal awal ke ujung akhir.
*   **Geometri (Aturan Jajar Genjang):** Tempelkan pangkal kedua vektor pada satu titik, lalu bentuk bangun jajar genjang. Resultan adalah diagonal bangun tersebut dari titik pangkal.
*   **Aljabar (Komponen):**
    $$\vec{a} \pm \vec{b} = \begin{pmatrix} a_1 \\ a_2 \end{pmatrix} \pm \begin{pmatrix} b_1 \\ b_2 \end{pmatrix} = \begin{pmatrix} a_1 \pm b_1 \\ a_2 \pm b_2 \end{pmatrix}$$

### 2. Perkalian Skalar dengan Vektor
Jika skalar $k$ dikalikan dengan vektor $\vec{v}$:
$$k \cdot \vec{v} = k \begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} kx \\ ky \end{pmatrix}$$
*   Jika $k > 0$, panjang diperbesar/diperkecil, arah **sama**.
*   Jika $k < 0$, panjang diperbesar/diperkecil, arah **berlawanan**.

---

## FASE 4: Kesamaan Vektor, Titik Segaris, & Bangun Datar

### 1. Kesamaan Dua Vektor
Dua vektor dikatakan sama ($\vec{a} = \vec{b}$) jika dan hanya jika semua komponen seletaknya bernilai sama persis.

### 2. Titik-Titik Segaris (Kolinier)
Titik $A$, $B$, dan $C$ dikatakan segaris (kolinier) jika terdapat skalar $k$ sehingga berlaku:
$$\vec{AB} = k \cdot \vec{BC} \quad \text{atau} \quad \vec{AB} = k \cdot \vec{AC}$$

### 💡 [TAKTIK TKA 2] Bedah Bangun Segiempat Terbuka
Vektor dapat digunakan untuk menentukan komponen tanpa menggambar grafik penuh, memanfaatkan sifat bangun datar.

**Contoh Kasus (Trapesium Sama Kaki):**
Diketahui trapesium sama kaki $ABCD$ dengan titik acuan $A(0,0)$. Panjang $AD = BC$, $\vec{AD} = \begin{pmatrix} 1 \\ 4 \end{pmatrix}$, $\vec{AB} = \begin{pmatrix} 6 \\ 0 \end{pmatrix}$, dan $\vec{BC} = \begin{pmatrix} a \\ b \end{pmatrix}$. Tentukan $a^2 + 2b$!

**Langkah Eksekusi:**
1. **Analisis Kesejajaran:** $\vec{AB} = \begin{pmatrix} 6 \\ 0 \end{pmatrix}$ menunjukkan alas sejajar sumbu X.
2. **Analisis Kesamaan Kaki:** Karena $ABCD$ trapesium sama kaki yang alasnya mendatar, tinggi absolut kaki miringnya harus sama ($|b| = 4$).
3. **Syarat Panjang Sama:** $|\vec{AD}| = \sqrt{1^2 + 4^2} = \sqrt{17}$. Maka $|\vec{BC}|$ juga harus $\sqrt{17}$.
4. **Hitung Nilai $a$:** $\sqrt{a^2 + b^2} = \sqrt{17} \Rightarrow a^2 + 16 = 17 \Rightarrow a^2 = 1$.

---

## FASE 5: Perbandingan Vektor & Kinematika Lintasan

### 1. Perbandingan Ruas Garis
Jika titik $P$ membagi ruas garis $AB$ dengan perbandingan $AP : PB = m : n$, maka vektor posisi titik $P$ adalah:
$$\vec{p} = \frac{m\vec{b} + n\vec{a}}{m + n}$$

### 💡 [TAKTIK TKA 3] Kinematika 3D & Proporsionalitas Vektor
Pada objek yang melaju dengan kecepatan konstan di lintasan lurus, **Panjang Vektor (Jarak) berbanding lurus dengan Waktu ($t$)**.

**Contoh Kasus:** 
Kereta melaju konstan dari Stasiun A(2, 3, 5) ke E(11, 6, 8) dalam waktu 13 menit. Titik B, C, D berada di antara A dan E. Jarak C ke D ditempuh dalam 2 menit. Berapa jarak CD?

**Langkah Eksekusi:**
1. Cari vektor lintasan total: $\vec{AE} = E - A = \begin{pmatrix} 11-2 \\ 6-3 \\ 8-5 \end{pmatrix} = \begin{pmatrix} 9 \\ 3 \\ 3 \end{pmatrix}$.
2. Hitung jarak total: $|\vec{AE}| = \sqrt{9^2 + 3^2 + 3^2} = \sqrt{99} \approx 9,95$ km.
3. Gunakan proporsi waktu: Jarak CD = $\frac{\text{waktu CD}}{\text{waktu total}} \times |\vec{AE}| = \frac{2}{13} \times \sqrt{99}$ km.

---

## FASE 6: Perkalian Skalar Dua Vektor (Dot Product)

### 1. Operasi Perkalian Titik (Dot Product)
Hasil dari perkalian titik dua vektor adalah **Skalar** (berupa angka real).
*   **Berdasarkan Komponen Aljabar:**
    $$\vec{a} \cdot \vec{b} = a_1 b_1 + a_2 b_2 + a_3 b_3$$
*   **Berdasarkan Sudut (Geometri):**
    $$\vec{a} \cdot \vec{b} = |\vec{a}| |\vec{b}| \cos \theta$$

### 2. Menentukan Sudut dan Syarat Ortogonalitas
*   **Sudut Antara Dua Vektor:**
    $$\cos \theta = \frac{\vec{a} \cdot \vec{b}}{|\vec{a}| |\vec{b}|}$$
*   **Kondisi Tegak Lurus (Ortogonal):** Dua vektor non-nol saling tegak lurus ($\theta = 90^\circ$) jika dan hanya jika:
    $$\vec{a} \cdot \vec{b} = 0$$

---

## FASE 7: Proyeksi Ortogonal

### 1. Proyeksi Skalar Ortogonal (Panjang Proyeksi)
Proyeksi skalar dari vektor $\vec{a}$ pada vektor $\vec{b}$ menghasilkan suatu **nilai skalar** (panjang bayangan).
$$|\vec{c}| = \frac{\vec{a} \cdot \vec{b}}{|\vec{b}|}$$

### 2. Vektor Proyeksi Ortogonal
Vektor proyeksi dari vektor $\vec{a}$ pada vektor $\vec{b}$ menghasilkan **vektor baru** yang arahnya sejajar dengan vektor tumpuan ($\vec{b}$).
$$\vec{c} = \left( \frac{\vec{a} \cdot \vec{b}}{|\vec{b}|^2} \right) \vec{b}$$

---

## FASE 8: Geometri Ruang Lanjut (Pengayaan TKA)

### 💡 [TAKTIK TKA 4] Vektor Diagonal Balok
Untuk menganalisis komponen diagonal pada bangun ruang balok $ABCD.EFGH$:
*   **Diagonal Bidang Alas:** $\vec{AC} = \vec{AB} + \vec{BC}$
*   **Diagonal Ruang:** $\vec{AG} = \vec{AB} + \vec{AD} + \vec{AE}$ (penjumlahan vektor panjang, lebar, dan tinggi).