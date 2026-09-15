# Bab 1 — Konsep Dasar Vektor

> **Kenali arah dan besar sebelum menghitung apa pun.**
> Bab ini adalah fondasi. Semua yang ada di Bab 2, 3, dan 4 berdiri di atasnya.

---

## Sebelum Mulai: Satu Pertanyaan

Bayangkan temanmu bertanya, *"Rumahmu jauh, nggak?"* dan kamu menjawab **"3 kilometer."**

Apakah temanmu sudah bisa sampai ke rumahmu?

Belum. Ia tahu **seberapa jauh**, tapi tidak tahu **ke mana**. Tiga kilometer ke utara dan tiga kilometer ke selatan sama-sama "3 kilometer" — dan keduanya membawa temanmu ke tempat yang berbeda sejauh 6 kilometer.

Di situlah vektor lahir.

---

## 1.1 Pengertian & Anatomi Vektor

### Dua besaran, dua dunia

| | Besaran Skalar | Besaran Vektor |
|---|---|---|
| Yang dimiliki | Nilai saja | Nilai **dan** arah |
| Contoh | Suhu $30^\circ$C, massa 5 kg, waktu 2 jam | Perpindahan 3 km ke utara, gaya 10 N ke kanan, kecepatan angin 20 km/jam ke timur laut |

> **Definisi.** **Vektor** adalah besaran yang memiliki **nilai (panjang)** dan **arah**.

### Vektor bukan titik

Ini kekeliruan nomor satu siswa kelas 11, jadi mari kita tegaskan sejak awal.

Titik koordinat $A(3, 2)$ menjawab pertanyaan **"di mana?"** — ia statis, ia sebuah lokasi.

Vektor menjawab pertanyaan **"bergerak ke mana, sejauh apa?"** — ia **perpindahan**. Vektor yang sama bisa digambar di mana saja di bidang koordinat, asalkan panjang dan arahnya tidak berubah.

### Anatomi tanda panah

Vektor digambarkan sebagai tanda panah. Setiap panah punya empat bagian yang wajib kamu kenali:

1. **Titik pangkal** — tempat panah dimulai (ekornya).
2. **Titik ujung** — tempat panah berakhir (mata panahnya).
3. **Panjang** — jarak dari pangkal ke ujung. Inilah "nilai"-nya.
4. **Arah** — ke mana mata panah menunjuk.

**Cara membaca perpindahannya:**

- Komponen $x$ → perpindahan **horizontal**. Ke kanan **positif**, ke kiri **negatif**.
- Komponen $y$ → perpindahan **vertikal**. Ke atas **positif**, ke bawah **negatif**.

### Arah itu menentukan segalanya

Vektor $\vec{AB}$ berarti bergerak **dari** titik pangkal $A$ **menuju** titik ujung $B$.

Sekarang balik urutannya. Vektor $\vec{BA}$ berarti bergerak dari $B$ menuju $A$ — panjangnya persis sama, tetapi arahnya berlawanan. Maka:

$$\vec{BA} = -\vec{AB}$$

> **Ingat ini baik-baik.** Tanda minus pada vektor **tidak** berarti "negatif" seperti pada bilangan. Ia berarti **arah berlawanan**. Panjangnya sama sekali tidak berubah.

---

## 1.2 Empat Cara Menulis Vektor

Satu vektor, empat cara menuliskannya. Soal TKA suka berganti-ganti notasi dalam satu paket soal — kalau kamu hanya hafal satu bentuk, kamu akan berhenti di baris pertama.

### a. Huruf kecil bergaris atau tebal

$$\vec{a} \quad \text{atau} \quad \mathbf{a}$$

Kalau vektornya disebut dari dua titiknya, tulis kedua hurufnya: $\vec{AB}$, $\vec{PQ}$.

### b. Matriks kolom

Bentuk yang paling sering dipakai saat menghitung, karena komponennya tersusun rapi ke bawah.

$$\text{2D: } \begin{pmatrix} x \\ y \end{pmatrix} \qquad \text{3D: } \begin{pmatrix} x \\ y \\ z \end{pmatrix}$$

### c. Koordinat pasangan terurut

Bentuk paling ringkas, paling sering muncul di teks soal.

$$(x,\, y) \qquad \text{atau} \qquad (x,\, y,\, z)$$

### d. Basis vektor satuan $\hat{i}$, $\hat{j}$, $\hat{k}$

Bentuk yang paling sering muncul di soal fisika dan di soal TKA bergaya universitas.

- $\hat{i}$ = vektor satuan searah sumbu $X$
- $\hat{j}$ = vektor satuan searah sumbu $Y$
- $\hat{k}$ = vektor satuan searah sumbu $Z$

$$\vec{v} = x\hat{i} + y\hat{j} + z\hat{k}$$

**Contoh satu vektor dalam empat baju:**

$$\vec{v} = \begin{pmatrix} 3 \\ -1 \\ 2 \end{pmatrix} = (3,\, -1,\, 2) = 3\hat{i} - \hat{j} + 2\hat{k}$$

> 💡 Perhatikan komponen $y$-nya. Di bentuk $\hat{i}\hat{j}\hat{k}$, angka $-1$ ditulis cukup sebagai $-\hat{j}$, bukan $-1\hat{j}$. Ini penyebab salah baca yang sangat sering: siswa membaca $-\hat{j}$ sebagai "tidak ada komponen $y$", padahal komponennya $-1$.

---

## 1.3 Vektor Posisi

### Vektor posisi dari titik pusat

Vektor posisi adalah vektor yang **pangkalnya selalu di titik pusat** $O(0,0)$.

Jika titik $A$ berkoordinat $(x, y)$, maka vektor posisi titik $A$ adalah:

$$\vec{OA} = \vec{a} = \begin{pmatrix} x \\ y \end{pmatrix}$$

Perhatikan betapa mudahnya: **koordinat titiknya langsung menjadi komponen vektornya.** Ini hanya berlaku untuk vektor posisi, karena pangkalnya di $O$.

### Vektor dari dua titik sembarang — rumus paling sering dipakai

Bagaimana kalau pangkalnya **bukan** di titik pusat? Misalnya kamu diminta mencari $\vec{AB}$ dengan $A$ dan $B$ dua titik sembarang.

Jika $A(x_1, y_1, z_1)$ dan $B(x_2, y_2, z_2)$, maka:

$$\vec{AB} = B - A = \begin{pmatrix} x_2 - x_1 \\ y_2 - y_1 \\ z_2 - z_1 \end{pmatrix}$$

> ### ⚠️ Jebakan paling mahal di seluruh bab ini
>
> **Ujung dikurangi pangkal.** Bukan sebaliknya.
>
> $\vec{AB}$ dibaca "dari $A$ ke $B$", jadi $B$ (ujung) yang berdiri di depan. Kalau kamu tertukar, yang kamu dapat adalah $\vec{BA}$ — panjangnya benar, tetapi **seluruh tandanya terbalik**. Di soal pilihan ganda, jawaban terbalik itu hampir selalu disediakan sebagai pengecoh.

**Cara mengingat:** huruf **belakang** dikurangi huruf **depan**. $\vec{AB} = B - A$. $\vec{PQ} = Q - P$.

---

## 1.4 Komponen di Bidang & Ruang

### Membaca komponen sebagai instruksi jalan kaki

Anggap komponen vektor sebagai daftar instruksi:

$$\vec{v} = \begin{pmatrix} 4 \\ -3 \end{pmatrix} \;\longrightarrow\; \text{"Jalan 4 langkah ke kanan, lalu 3 langkah ke bawah."}$$

Tanda komponennya bukan hiasan — ia **arah**:

| Komponen | Positif berarti | Negatif berarti |
|---|---|---|
| $x$ | ke kanan | ke kiri |
| $y$ | ke atas | ke bawah |
| $z$ | ke depan / keluar bidang | ke belakang / masuk bidang |

### Dari bidang ke ruang

Di bidang (R²) kamu punya dua komponen. Di ruang (R³) bertambah satu: komponen $z$.

Kabar baiknya: **semua rumus yang kamu pelajari di R² berlaku apa adanya di R³** — kamu tinggal menambahkan satu suku lagi. Tidak ada rumus baru yang harus dihafal.

> 📌 **Batas kurikulum TKA.** Rincian materi Kemendikdasmen menyebut dengan tegas: **komponen vektor maksimum tiga**. Jadi kamu tidak akan pernah menemui vektor berdimensi 4 atau lebih di ujian. Tenang.

### Vektor nol

$$\vec{0} = \begin{pmatrix} 0 \\ 0 \end{pmatrix}$$

Vektor yang semua komponennya nol. Panjangnya nol, dan — ini yang penting — **ia tidak menunjuk ke arah mana pun**. Nanti di sub-bab 1.6 kamu akan melihat kenapa sifat ini membuat vektor nol jadi kasus istimewa yang harus diperlakukan khusus.

---

## 1.5 Modulus (Panjang Vektor)

### Pythagoras yang menyamar

Modulus, atau panjang vektor, dinotasikan dengan tanda mutlak: $|\vec{v}|$.

Dari mana rumusnya? Gambar saja vektornya di bidang koordinat, lalu tarik garis bantu ke sumbu-sumbunya. Yang terbentuk adalah **segitiga siku-siku**, dengan komponen $x$ dan $y$ sebagai kedua sisi tegaknya, dan vektor itu sendiri sebagai sisi miringnya.

Jadi rumus modulus **bukan rumus baru**. Ia Pythagoras yang kamu pelajari sejak SMP.

**Modulus vektor 2D.** Jika $\vec{v} = \begin{pmatrix} x \\ y \end{pmatrix}$:

$$|\vec{v}| = \sqrt{x^2 + y^2}$$

**Modulus vektor 3D.** Jika $\vec{v} = \begin{pmatrix} x \\ y \\ z \end{pmatrix}$:

$$|\vec{v}| = \sqrt{x^2 + y^2 + z^2}$$

### Kenapa tanda komponennya tidak berpengaruh

Perhatikan bahwa setiap komponen **dikuadratkan** lebih dulu. Artinya:

$$\left|\begin{pmatrix} 3 \\ -4 \end{pmatrix}\right| = \sqrt{9 + 16} = 5 \qquad \text{dan} \qquad \left|\begin{pmatrix} -3 \\ 4 \end{pmatrix}\right| = \sqrt{9 + 16} = 5$$

Masuk akal: panjang adalah jarak, dan jarak tidak pernah negatif. Vektor yang arahnya berlawanan tetap sama panjangnya.

$$|\vec{v}| = |-\vec{v}|$$

### Jawaban ditulis dalam bentuk akar eksak

Ini bukan sekadar selera. Ini cara menulis jawaban yang benar di lembar jawaban TKA.

$$|(2, 5)| = \sqrt{29} \qquad \textbf{bukan} \qquad 5{,}385164807\ldots$$

$$|(2, 4)| = \sqrt{20} = 2\sqrt{5} \qquad \textbf{bukan} \qquad 4{,}472135955\ldots$$

**Cara menyederhanakan akar:** tarik keluar faktor kuadrat terbesar.

$$\sqrt{20} = \sqrt{4 \cdot 5} = \sqrt{4} \cdot \sqrt{5} = 2\sqrt{5}$$

$$\sqrt{72} = \sqrt{36 \cdot 2} = 6\sqrt{2}$$

$$\sqrt{29} = \sqrt{29} \quad \text{(29 bilangan prima — sudah paling sederhana)}$$

> 💡 **Trik hemat waktu yang wajib kamu kuasai.** Kalau soal hanya menanyakan **mana yang lebih panjang**, jangan pernah repot mengakarkan.
>
> $$|\vec{u}| > |\vec{v}| \iff |\vec{u}|^2 > |\vec{v}|^2$$
>
> Cukup bandingkan $x^2 + y^2 + z^2$-nya. Angkanya selalu bilangan bulat, tidak ada akar, tidak ada pembulatan, tidak ada peluang salah hitung.

> 🔗 **Kalau modulusnya diketahui tapi komponennya memuat huruf** — misalnya $\vec{AB} = (2m,\, m+3,\, m)$ dengan $|\vec{AB}| = 9$ — itu adalah **Taktik TKA 1**, dibahas tuntas di **Bab 4 · Parameter Tersembunyi pada Modulus**.

---

## 1.6 Vektor Satuan

### Membuang panjang, menyisakan arah

Kadang kamu hanya butuh **arah** sebuah vektor, tanpa peduli panjangnya. Untuk itulah vektor satuan ada.

> **Definisi.** **Vektor satuan** ($\hat{e}$) adalah vektor yang **searah** dengan vektor asalnya, tetapi panjangnya **tepat 1 satuan**.

$$\hat{e} = \frac{\vec{v}}{|\vec{v}|}$$

### Membacanya sebagai "membagi rata"

Rumus itu sebenarnya sederhana sekali: **bagi setiap komponen dengan panjang vektornya.**

Contoh dengan $\vec{v} = \begin{pmatrix} 3 \\ 4 \end{pmatrix}$:

1. Hitung panjangnya dulu: $|\vec{v}| = \sqrt{9 + 16} = \sqrt{25} = 5$.
2. Bagi setiap komponen dengan 5:

$$\hat{e} = \frac{1}{5}\begin{pmatrix} 3 \\ 4 \end{pmatrix} = \begin{pmatrix} 3/5 \\ 4/5 \end{pmatrix}$$

3. **Periksa hasilnya** — panjang vektor satuan harus tepat 1:

$$\left|\hat{e}\right| = \sqrt{\left(\tfrac{3}{5}\right)^2 + \left(\tfrac{4}{5}\right)^2} = \sqrt{\tfrac{9}{25} + \tfrac{16}{25}} = \sqrt{\tfrac{25}{25}} = 1 \;\checkmark$$

> **Biasakan langkah ketiga itu.** Ia gratis, cepat, dan menangkap hampir semua kesalahan aritmetika sebelum kamu menyerahkan lembar jawaban.

### ⚠️ Kasus batas: vektor nol tidak punya vektor satuan

$$\vec{0} = \begin{pmatrix} 0 \\ 0 \end{pmatrix} \;\longrightarrow\; |\vec{0}| = 0 \;\longrightarrow\; \hat{e} = \frac{\vec{0}}{0} \;=\; \textbf{tidak terdefinisi}$$

Rumus $\hat{e} = \frac{\vec{v}}{|\vec{v}|}$ akan membagi dengan nol, dan pembagian dengan nol tidak terdefinisi.

Tapi alasan sebenarnya lebih dalam daripada sekadar aturan aljabar: **vektor nol memang tidak menunjuk ke arah mana pun.** Meminta arahnya sama saja dengan bertanya "ke mana arah diam?" — pertanyaannya sendiri yang tidak bermakna.

---

## Ringkasan Bab 1

| Yang kamu kuasai sekarang | Rumus kuncinya |
|---|---|
| Vektor = nilai **dan** arah | $\vec{BA} = -\vec{AB}$ |
| Empat notasi yang saling tukar | $\begin{pmatrix} 3 \\ -1 \end{pmatrix} = (3,-1) = 3\hat{i} - \hat{j}$ |
| Vektor dari dua titik | $\vec{AB} = B - A$ (**ujung − pangkal**) |
| Panjang vektor | $\lvert\vec{v}\rvert = \sqrt{x^2 + y^2 + z^2}$ |
| Jawaban dalam akar eksak | $\sqrt{20} = 2\sqrt{5}$ |
| Membandingkan panjang tanpa akar | $\lvert\vec{u}\rvert > \lvert\vec{v}\rvert \iff \lvert\vec{u}\rvert^2 > \lvert\vec{v}\rvert^2$ |
| Vektor satuan | $\hat{e} = \dfrac{\vec{v}}{\lvert\vec{v}\rvert}$, dan $\lvert\hat{e}\rvert = 1$ |
| Kasus batas | Vektor nol tidak punya vektor satuan |

**Selanjutnya — Bab 2:** sekarang kamu bisa membaca satu vektor. Waktunya membuat dua vektor saling berinteraksi.
