# Bab 2 — Operasi & Bangun Datar

> **Menjumlah, mengurang, dan membaca bentuk dari vektornya.**
> Di Bab 1 kamu belajar membaca **satu** vektor. Sekarang kita buat dua vektor saling berinteraksi.

---

## Sebelum Mulai: Satu Pertanyaan

Kamu berjalan 3 km ke timur, lalu 4 km ke utara.

Berapa jarak kamu dari titik awal sekarang?

Kalau jawabanmu **7 km**, kamu baru saja menjumlahkan dua vektor seolah-olah keduanya skalar. Jawaban sebenarnya **5 km** — dan seluruh Bab 2 lahir dari perbedaan 2 km itu.

> **Kunci pemahamannya:** vektor tidak dijumlahkan dengan menambah angkanya begitu saja. Arah ikut menentukan hasilnya.

---

## 2.1 Aturan Segitiga & Poligon

### Cara geometri: sambung ujung ke pangkal

Untuk menjumlahkan $\vec{a} + \vec{b}$ secara geometri:

1. Gambar $\vec{a}$ apa adanya.
2. **Pindahkan pangkal $\vec{b}$ ke ujung $\vec{a}$** — ingat, vektor boleh digeser asalkan panjang dan arahnya tidak berubah.
3. Tarik vektor baru dari **pangkal $\vec{a}$** ke **ujung $\vec{b}$**. Itulah resultannya.

Bentuk yang terjadi adalah segitiga — karena itu namanya **aturan segitiga**.

### Aturan poligon: untuk tiga vektor atau lebih

Aturan yang sama berlaku berapa pun banyaknya vektor. Sambung terus ujung ke pangkal, lalu tarik satu vektor dari titik paling awal ke titik paling akhir.

$$\vec{AB} + \vec{BC} + \vec{CD} = \vec{AD}$$

> 💡 **Perhatikan hurufnya.** Huruf yang "bertemu" di tengah saling menghapus: $A\underline{B} + \underline{B}C = AC$. Kalau kamu melihat pola ini di soal, kamu bisa menjawab tanpa menghitung satu komponen pun.

Kasus istimewanya:

$$\vec{AB} + \vec{BA} = \vec{AA} = \vec{0}$$

Berangkat lalu kembali ke titik semula — perpindahan totalnya nol.

---

## 2.2 Aturan Jajar Genjang

### Cara geometri: dua pangkal berimpit

Aturan segitiga menuntut kamu **memindahkan** salah satu vektor. Aturan jajar genjang tidak.

1. Tempelkan **pangkal kedua vektor pada satu titik** yang sama.
2. Lengkapi bangun menjadi jajar genjang (tarik garis sejajar dari tiap ujung).
3. Resultannya adalah **diagonal** jajar genjang tersebut, diukur dari titik pangkal bersama.

### Kapan memakai yang mana?

| Situasi | Aturan yang lebih nyaman |
|---|---|
| Vektor-vektor sudah tersusun sambung-menyambung ($\vec{AB}$, $\vec{BC}$) | **Segitiga / poligon** |
| Dua vektor berpangkal sama, misalnya dua gaya pada satu benda | **Jajar genjang** |
| Lebih dari dua vektor | **Poligon** (jajar genjang hanya untuk dua) |

> **Keduanya memberi hasil yang sama persis.** Yang berbeda hanya cara menggambarnya. Kalau hasilmu berbeda, ada langkah menggambar yang keliru — bukan aturannya yang berbeda.

### Diagonal yang satu lagi

Jajar genjang punya **dua** diagonal. Diagonal dari titik pangkal bersama adalah $\vec{a} + \vec{b}$. Diagonal yang lain — yang menghubungkan kedua ujung — adalah **selisihnya**, $\vec{a} - \vec{b}$ atau $\vec{b} - \vec{a}$, tergantung arah menariknya.

Ingat baik-baik gambar itu. Ia muncul terus di soal bangun datar.

---

## 2.3 Jumlah & Selisih Komponen

### Cara aljabar: jauh lebih cepat

Menggambar itu bagus untuk **memahami**. Tapi saat mengerjakan soal, kamu menghitung lewat komponen.

$$\vec{a} \pm \vec{b} = \begin{pmatrix} a_1 \\ a_2 \end{pmatrix} \pm \begin{pmatrix} b_1 \\ b_2 \end{pmatrix} = \begin{pmatrix} a_1 \pm b_1 \\ a_2 \pm b_2 \end{pmatrix}$$

Aturannya satu kalimat: **jumlahkan (atau kurangkan) komponen yang seletak.**

- Komponen $x$ hanya boleh bertemu komponen $x$.
- Komponen $y$ hanya boleh bertemu komponen $y$.
- Komponen $z$ hanya boleh bertemu komponen $z$.

> ⚠️ **Syarat yang sering dilupakan:** kedua vektor harus punya **dimensi yang sama**. Vektor di bidang (2 komponen) tidak bisa dijumlahkan dengan vektor di ruang (3 komponen) — tidak ada pasangan untuk komponen $z$-nya.

### Makna geometris pengurangan

Apa arti $\vec{a} - \vec{b}$ pada gambar?

Tulis ulang sebagai $\vec{a} + (-\vec{b})$. Artinya: **balik arah $\vec{b}$ lebih dulu**, baru jumlahkan dengan aturan segitiga.

Ada cara baca yang lebih berguna lagi. Kalau $\vec{a} = \vec{OA}$ dan $\vec{b} = \vec{OB}$ adalah vektor posisi, maka:

$$\vec{a} - \vec{b} = \vec{OA} - \vec{OB} = \vec{BA}$$

Yaitu **vektor dari ujung $\vec{b}$ menuju ujung $\vec{a}$**. Inilah bentuk $\vec{AB} = B - A$ dari Bab 1, dilihat dari sudut pandang lain.

---

## 2.4 Perkalian Skalar dengan Vektor

### Meregangkan tanpa membelokkan

Jika skalar $k$ dikalikan dengan vektor $\vec{v}$, **setiap** komponennya dikalikan $k$:

$$k \cdot \vec{v} = k\begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} kx \\ ky \end{pmatrix}$$

### Apa yang terjadi pada gambarnya

| Nilai $k$ | Panjang | Arah |
|---|---|---|
| $k > 1$ | Diperbesar | **Sama** |
| $0 < k < 1$ | Diperkecil | **Sama** |
| $k = 1$ | Tetap | Sama (tidak berubah sama sekali) |
| $k = 0$ | Menjadi nol | Tidak ada arah — hasilnya vektor nol |
| $-1 < k < 0$ | Diperkecil | **Berlawanan** |
| $k < -1$ | Diperbesar | **Berlawanan** |

Dua kalimat yang merangkum semuanya:

- **Besar $|k|$ menentukan seberapa diregangkan.**
- **Tanda $k$ menentukan searah atau berlawanan arah.**

### Hubungan dengan panjang

$$|k\vec{v}| = |k| \cdot |\vec{v}|$$

Perhatikan tanda mutlak pada $k$. Panjang tidak pernah negatif, jadi mengalikan dengan $-3$ membuat vektornya **tiga kali lebih panjang**, bukan "negatif tiga kali".

> 💡 **Jalan pintas yang sah.** Kalau kamu sudah tahu $|\vec{v}| = \sqrt{13}$, maka $|5\vec{v}| = 5\sqrt{13}$ — langsung, tanpa mengalikan komponen dan mengakarkan ulang. Di soal TKA, jalan pintas ini menghemat waktu yang nyata.

---

## 2.5 Kombinasi Operasi

### Beberapa operasi dalam satu baris

Soal jarang meminta $\vec{u} + \vec{v}$ saja. Yang lebih sering muncul bentuknya seperti ini:

$$2\vec{u} - 3\vec{v}$$

### Urutan pengerjaan

Persis seperti aljabar biasa: **perkalian dulu, penjumlahan/pengurangan kemudian.**

1. Kalikan $\vec{u}$ dengan $2$ → dapat vektor baru.
2. Kalikan $\vec{v}$ dengan $3$ → dapat vektor baru.
3. Kurangkan hasil langkah 2 dari hasil langkah 1, komponen demi komponen.

Contoh dengan $\vec{u} = (4, -1)$ dan $\vec{v} = (2, 3)$:

$$2\vec{u} = (8, -2) \qquad 3\vec{v} = (6, 9)$$

$$2\vec{u} - 3\vec{v} = (8 - 6,\; -2 - 9) = (2,\, -11)$$

> ⚠️ **Kesalahan paling sering:** mengalikan skalar hanya ke komponen pertama. $2\vec{u}$ dengan $\vec{u} = (4,-1)$ adalah $(8,-2)$, **bukan** $(8,-1)$. Skalar menyentuh **semua** komponen tanpa kecuali.

> ⚠️ **Kesalahan kedua:** tanda pada langkah pengurangan. $-2 - 9$ adalah $-11$, bukan $7$ dan bukan $-7$.

---

## 2.6 Kesamaan Dua Vektor

### Definisi yang tegas

> Dua vektor dikatakan **sama** ($\vec{a} = \vec{b}$) **jika dan hanya jika** semua komponen seletaknya bernilai sama persis.

$$\begin{pmatrix} a_1 \\ a_2 \end{pmatrix} = \begin{pmatrix} b_1 \\ b_2 \end{pmatrix} \iff a_1 = b_1 \;\textbf{dan}\; a_2 = b_2$$

Perhatikan kata **dan**. Satu komponen cocok saja tidak cukup — semuanya harus cocok.

### Kenapa ini penting: satu persamaan vektor = beberapa persamaan biasa

Inilah kegunaan sebenarnya dari kesamaan vektor di soal.

Kalau soal memberitahu:

$$\begin{pmatrix} 2x \\ y+1 \end{pmatrix} = \begin{pmatrix} 6 \\ 5 \end{pmatrix}$$

maka kamu sebenarnya sedang memegang **dua** persamaan sekaligus:

$$2x = 6 \quad \Rightarrow\; x = 3 \qquad\qquad y + 1 = 5 \quad \Rightarrow\; y = 4$$

Satu persamaan vektor **pecah** menjadi sebanyak komponennya. Ini teknik yang dipakai berulang kali di Bab 4.

### Vektor sama vs vektor sejajar — jangan tertukar

| | Vektor **sama** | Vektor **sejajar** |
|---|---|---|
| Panjang | Harus sama | Boleh berbeda |
| Arah | Harus sama | Sama **atau** berlawanan |
| Bentuk aljabar | $\vec{a} = \vec{b}$ | $\vec{a} = k\,\vec{b}$ untuk suatu skalar $k \ne 0$ |

Vektor yang sama pasti sejajar. Vektor yang sejajar belum tentu sama.

---

## 2.7 Titik-Titik Segaris (Kolinier)

### Kapan tiga titik terletak pada satu garis?

Titik $A$, $B$, dan $C$ dikatakan **segaris** (kolinier) jika terdapat skalar $k$ sehingga:

$$\vec{AB} = k \cdot \vec{BC} \qquad \text{atau} \qquad \vec{AB} = k \cdot \vec{AC}$$

### Kenapa rumus itu masuk akal

Kalau ketiga titik ada di satu garis lurus, maka $\vec{AB}$ dan $\vec{BC}$ pasti **sejajar** — keduanya menunjuk sepanjang garis yang sama. Dan dua vektor sejajar selalu bisa ditulis sebagai kelipatan satu sama lain.

Jadi "segaris" hanyalah nama lain untuk "kedua vektornya sejajar **dan** punya titik bersama".

> **Kata terakhir itu penting.** Dua vektor sejajar yang tidak berbagi titik hanya membentuk dua garis sejajar, bukan satu garis. Itulah sebabnya rumusnya memakai vektor yang berbagi huruf: $\vec{AB}$ dan $\vec{BC}$ sama-sama memuat $B$.

### Langkah pengerjaan di soal

1. Hitung $\vec{AB} = B - A$.
2. Hitung $\vec{BC} = C - B$.
3. Periksa apakah ada $k$ tunggal yang memenuhi **semua** komponennya sekaligus.

Contoh: $\vec{AB} = (2, 4)$ dan $\vec{BC} = (3, 6)$.
Dari komponen $x$: $2 = k \cdot 3 \Rightarrow k = \tfrac{2}{3}$.
Periksa komponen $y$: $k \cdot 6 = \tfrac{2}{3} \cdot 6 = 4$ ✓.
Nilai $k$ yang sama berlaku untuk keduanya → **segaris**.

> ⚠️ Kalau komponen $x$ memberi $k = \tfrac{2}{3}$ tetapi komponen $y$ memberi $k = 2$, maka **tidak segaris**. Cukup satu komponen yang tidak cocok untuk menggugurkannya.

> 🔗 Teknik ini dipakai lagi untuk membaca **bangun datar** dari vektor-vektornya — trapesium, jajar genjang, layang-layang. Itu **Taktik TKA 2**, dibahas tuntas di **Bab 4 · Bedah Bangun Segiempat**.

---

## 2.8 Pembagian Ruas Garis

### Titik yang membagi sebuah ruas

Jika titik $P$ membagi ruas garis $AB$ dengan perbandingan $AP : PB = m : n$, maka vektor posisi titik $P$ adalah:

$$\vec{p} = \frac{m\,\vec{b} + n\,\vec{a}}{m + n}$$

### ⚠️ Perhatikan penempatan $m$ dan $n$ — ia bersilang

Ini bagian yang paling sering salah, jadi mari kita perlambat.

Perbandingannya $AP : PB = m : n$. Tetapi di rumusnya:

- $m$ (bagian yang **dekat $A$**) justru berpasangan dengan $\vec{b}$;
- $n$ (bagian yang **dekat $B$**) justru berpasangan dengan $\vec{a}$.

**Silang.** Bukan lurus.

**Cara mengingatnya:** kalau $m$ besar, artinya $P$ jauh dari $A$ dan **dekat ke $B$** — jadi masuk akal kalau $\vec{b}$ yang mendapat bobot besar.

### Uji cepat yang selalu berhasil

Masukkan kasus ekstrem. Ambil $n = 0$, artinya $P$ berimpit dengan $B$:

$$\vec{p} = \frac{m\vec{b} + 0 \cdot \vec{a}}{m + 0} = \vec{b} \;\checkmark$$

Hasilnya memang $\vec{b}$. Rumusnya benar. Lakukan uji ini setiap kali kamu ragu apakah $m$ dan $n$ sudah di tempat yang tepat — butuh tiga detik, dan menyelamatkan satu soal penuh.

### Kasus istimewa: titik tengah

Kalau $P$ tepat di tengah, maka $m : n = 1 : 1$:

$$\vec{p} = \frac{\vec{a} + \vec{b}}{2}$$

Rumus titik tengah yang kamu kenal sejak SMP — ternyata hanya kasus khusus dari rumus pembagian ruas garis.

### Pembagian luar

Kalau $P$ berada **di luar** ruas $AB$ (di perpanjangannya), perbandingannya ditulis dengan salah satu suku negatif, misalnya $AP : PB = m : (-n)$. Rumusnya tetap sama; yang berubah hanya tandanya:

$$\vec{p} = \frac{m\,\vec{b} - n\,\vec{a}}{m - n}$$

> 🔗 Konsep perbandingan vektor ini menjadi kunci soal **lintasan kendaraan berkecepatan tetap** — itu **Taktik TKA 3**, dibahas tuntas di **Bab 4 · Kinematika & Proporsionalitas**.

---

## Ringkasan Bab 2

| Yang kamu kuasai sekarang | Rumus kuncinya |
|---|---|
| Penjumlahan geometri | Aturan segitiga (ujung ke pangkal) & jajar genjang (pangkal berimpit) |
| Aturan poligon | $\vec{AB} + \vec{BC} + \vec{CD} = \vec{AD}$ |
| Penjumlahan aljabar | Jumlahkan komponen **seletak**; dimensi harus sama |
| Perkalian skalar | $k\vec{v} = (kx,\, ky)$ — menyentuh **semua** komponen |
| Panjang setelah dikali skalar | $\lvert k\vec{v}\rvert = \lvert k\rvert \cdot \lvert\vec{v}\rvert$ |
| Kesamaan vektor | Satu persamaan vektor **pecah** menjadi beberapa persamaan biasa |
| Titik segaris | $\vec{AB} = k\,\vec{BC}$ dengan $k$ yang **sama** untuk semua komponen |
| Pembagian ruas garis | $\vec{p} = \dfrac{m\vec{b} + n\vec{a}}{m+n}$ — **bersilang** |
| Titik tengah | $\vec{p} = \dfrac{\vec{a}+\vec{b}}{2}$ |

**Selanjutnya — Bab 3:** dua vektor bisa dijumlahkan. Tapi bisakah dua vektor **dikalikan**? Bisa — dan hasilnya akan mengejutkanmu.
