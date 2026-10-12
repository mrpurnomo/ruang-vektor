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

## 1.1 Lahirnya Sebuah Vektor

### Mulai dari bidang yang benar-benar kosong

Ambil selembar kertas milimeter — atau bayangkan bidang kartesius yang masih kosong. Belum ada apa pun di sana: hanya sumbu $X$ yang mendatar dan sumbu $Y$ yang tegak, berpotongan di satu titik.

**Tiga langkah melahirkan sebuah vektor:**

1. **Tandai titik berangkat.** Letakkan di pusat semesta kita, $O(0,\, 0)$.
2. **Tandai titik tujuan.** Misalnya rumah temanmu di $A(7,\, 4)$.
3. **Hubungkan keduanya** dengan ruas garis, lalu bubuhkan mata panah **di $A$**.

Selamat — kamu baru saja melahirkan sebuah vektor.

> **Definisi.** **Vektor** adalah besaran yang memiliki **nilai (panjang)** sekaligus **arah**. Bandingkan dengan **skalar**, yang hanya punya nilai: suhu $30^\circ$C, massa 5 kg, waktu 2 jam.

Panah tadi bernama **vektor $\vec{OA}$**, dibaca *dari $O$ menuju $A$*. Kalau tidak ingin menyebut kedua titiknya, cukup beri satu huruf kecil berpanah:

$$\vec{OA} = \vec{a}$$

### Melacak langkahnya di atas kisi

Pertanyaan yang menentukan segalanya: **bagaimana caranya berpindah** dari $O$ sampai ke $A$? Jangan melompat — telusuri kotak kisinya.

- Melangkah **7 satuan ke kanan** sepanjang sumbu $X$ → perpindahan mendatar $+7$.
- Melangkah **4 satuan ke atas** sepanjang sumbu $Y$ → perpindahan tegak $+4$.

Dua angka itulah seluruh isi vektor $\vec{a}$: **7 dan 4**.

### ⚠️ Titik bukan vektor

Ini kekeliruan nomor satu siswa kelas 11, jadi mari kita tegaskan sejak awal.

Titik $A(7,\, 4)$ menjawab pertanyaan **"di mana?"** — ia diam di satu tempat. Vektor $\vec{a}$ menjawab **"berpindah ke mana, sejauh apa?"** — ia prosesnya, bukan tempatnya. Karena itulah vektor yang sama boleh digambar di mana saja, asal panjang dan arahnya tidak berubah.

### Cara membaca nama vektor

Huruf **pertama** selalu pangkal (ekor), huruf **kedua** selalu ujung (mata panah). Jadi $\vec{AO}$ berangkat dari $A$ dan berakhir di $O$: panjangnya sama persis, arahnya berlawanan.

$$\vec{AO} = -\vec{OA}$$

> Tanda minus pada vektor **tidak** berarti "negatif" seperti pada bilangan biasa. Ia berarti **arah berlawanan**. Panjangnya sama sekali tidak berubah.

---

## 1.2 Tiga Cara Menulis Komponen

Langkah tadi — 7 ke kanan, 4 ke atas — punya tiga gaya penulisan resmi. Ketiganya membicarakan vektor yang **sama persis**; yang berbeda hanya bajunya.

### a. Bentuk baris (pasangan terurut)

$$(7,\, 4)$$

Paling ringkas, dan paling sering muncul di kalimat soal.

### b. Bentuk matriks kolom

$$\begin{pmatrix} 7 \\ 4 \end{pmatrix}$$

Paling nyaman untuk **menghitung**: komponen $x$ di atas, $y$ di bawah, tidak mungkin tertukar.

### c. Bentuk basis vektor satuan

$$7\hat{i} + 4\hat{j}$$

Menegaskan arah sumbunya: $\hat{i}$ berarti satu langkah searah sumbu $X$, $\hat{j}$ satu langkah searah sumbu $Y$.

> Nama vektornya sendiri tetap ditulis $\vec{a}$ atau $\mathbf{a}$ — itu **namanya**, bukan komponennya.

### Berkeliling empat kuadran

Bagian yang paling menentukan nilai ujianmu adalah **tanda**. Semua berangkat dari $O$:

| Kuadran | Tujuan | Langkahnya | Komponen | Bentuk basis |
|---|---|---|---|---|
| I | $A(7,\, 4)$ | 7 kanan, 4 atas | $(7,\, 4)$ | $7\hat{i} + 4\hat{j}$ |
| II | $B(-5,\, 3)$ | 5 **kiri**, 3 atas | $(-5,\, 3)$ | $-5\hat{i} + 3\hat{j}$ |
| III | $C(-4,\, -6)$ | 4 **kiri**, 6 **bawah** | $(-4,\, -6)$ | $-4\hat{i} - 6\hat{j}$ |
| IV | $D(3,\, -5)$ | 3 kanan, 5 **bawah** | $(3,\, -5)$ | $3\hat{i} - 5\hat{j}$ |

### ⚠️ Minus tidak memperpendek apa pun

Tanda minus pada komponen **bukan** pengurang panjang. Ia perintah arah: minus pada $x$ berarti **ke kiri**, minus pada $y$ berarti **ke bawah**. Vektor $(-4,\, -6)$ sama panjangnya dengan $(4,\, 6)$ — yang berbeda hanya ke mana ia menunjuk.

### Dua kebiasaan penulisan baku

- Komponen bernilai 0 tidak perlu ditulis huruf basisnya: $(5,\, 0) = 5\hat{i}$.
- Koefisien 1 tidak perlu ditulis angkanya: $(0,\, 1) = \hat{j}$, bukan $1\hat{j}$.
- Tetapi di bentuk **kolom** dan **baris**, angka 0 itu **wajib** tetap ditulis.

---

## 1.3 Kalau Pangkalnya Bukan di Nol

Sejauh ini kita selalu enak: berangkat dari titik asal $O(0,\, 0)$. Sekarang naikkan taruhannya — berangkat dari $A(2,\, 3)$ menuju $B(8,\, 7)$. Panah itu bernama $\vec{AB}$: pangkalnya di $A$, ujungnya di $B$.

### Cara pertama — hitung langsung di grafik

1. Mendatar: dari $x = 2$ sampai $x = 8$, berarti **6 satuan ke kanan**.
2. Tegak: dari $y = 3$ sampai $y = 7$, berarti **4 satuan ke atas**.

$$\vec{AB} = \begin{pmatrix} 6 \\ 4 \end{pmatrix}$$

### Cara itu aman — selama ada kertas berpetak

Bagaimana kalau koordinatnya ratusan, atau grafiknya memang tidak digambar? Perhatikan dulu dari mana dua angka tadi muncul:

$$6 = 8 - 2 \qquad\text{dan}\qquad 4 = 7 - 3$$

Polanya sama di kedua baris: koordinat **ujung** dikurangi koordinat **pangkal**. Kamu baru saja menemukan rumusnya sendiri — tanpa menghafal.

$$\vec{AB} = \vec{b} - \vec{a} = \begin{pmatrix} x_B - x_A \\ y_B - y_A \end{pmatrix}$$

> **Definisi.** **Vektor posisi** adalah vektor yang pangkalnya dipatok di $O(0,\, 0)$, ditulis $\vec{a} = \vec{OA}$. Vektor sembarang $\vec{AB}$ selalu merupakan selisih dua vektor posisi: **ujung dikurangi pangkal**.

### ⚠️ Jebakan paling mahal di ujian

Jangan terbalik menjadi $A - B$. Yang kamu hitung bukan lagi $\vec{AB}$, melainkan $\vec{BA}$ — arahnya berputar $180^\circ$ dan seluruh komponen jawabanmu berganti tanda, padahal angkanya terlihat *mirip* benar.

### Rumusnya bisa dibalik

Kalau yang ditanyakan justru titik ujungnya, pindahkan saja ruasnya:

$$\vec{AB} = B - A \;\Longrightarrow\; B = A + \vec{AB}$$

---

## 1.4 Modulus — Berapa Jauh Sebenarnya?

Vektor $\vec{v} = \begin{pmatrix} 3 \\ 4 \end{pmatrix}$ melangkah 3 ke kanan lalu 4 ke atas. Tetapi berapa **jarak lurus** dari pangkal langsung ke mata panahnya? Jelas bukan $3 + 4$ — itu panjang jalur memutarnya, bukan panjang panahnya.

### Segitiga siku-siku yang selalu ada di bawah panah

Tarik dua garis bantu: satu mendatar sepanjang 3, satu tegak sepanjang 4. Keduanya bertemu **siku-siku**, dan panah vektormu menjadi **sisi miring** segitiga itu. Alat lama dari SMP pun langsung berguna.

> **Definisi.** Panjang vektor ditulis dengan tanda mutlak $|\vec{v}|$, dan dihitung dengan Teorema Pythagoras: akar dari jumlah kuadrat seluruh komponennya.

$$|\vec{v}| = \sqrt{x^2 + y^2}$$

**Contoh $\vec{v} = (3,\, 4)$:**

1. Kuadratkan setiap komponen: $3^2 = 9$ dan $4^2 = 16$.
2. Jumlahkan: $9 + 16 = 25$.
3. Akarkan: $|\vec{v}| = \sqrt{25} = 5$.

### Wajib bentuk akar eksak

Tidak semua hasil sebulat itu. Coba $\vec{u} = (2,\, 4)$:

$$|\vec{u}| = \sqrt{2^2 + 4^2} = \sqrt{4 + 16} = \sqrt{20} = 2\sqrt{5}$$

> **Jangan diubah menjadi desimal.** $\sqrt{20}$ ditulis $2\sqrt{5}$, bukan $4{,}47\ldots$ — desimal itu hasil pembulatan, dan jawaban bulat-bulatan dinilai salah. Caranya: tarik keluar faktor kuadrat terbesarnya, $20 = 4 \times 5$, sehingga $\sqrt{20} = \sqrt{4}\sqrt{5} = 2\sqrt{5}$.

### ⚠️ Tanda minus ikut terkuadratkan

$(-2)^2 = 4$, bukan $-4$. Setelah dikuadratkan, tanda minus selalu hilang — karena itu panjang vektor **tidak pernah** bernilai negatif.

### Taktik cepat membandingkan panjang

Kalau soal hanya menanyakan vektor mana yang lebih panjang, jangan buang waktu mengakarkan. Bandingkan saja nilai $x^2 + y^2$ keduanya — akar kuadrat tidak pernah membalik urutan:

$$|\vec{u}| > |\vec{v}| \iff |\vec{u}|^2 > |\vec{v}|^2$$

---

## 1.5 Vektor Satuan — Kunci Arahnya

Bayangkan kamu membuat kompas penunjuk jalan. Yang perlu ditunjukkan hanya **ke arah sana** — tidak peduli jalannya panjang atau pendek. Untuk itu kita butuh vektor yang arahnya tetap, tetapi panjangnya distandarkan.

> **Definisi.** **Vektor satuan** adalah vektor yang panjangnya tepat **1 satuan**, searah dengan vektor asalnya. Vektor satuan dari $\vec{v}$ ditulis $\hat{e}$ (dibaca *e topi*) atau $\hat{v}$.

### Dari tongkat 5 meter menjadi 1 meter

Pikirkan tongkat sepanjang 5 meter. Supaya menjadi 1 meter tanpa mengubah arahnya, tongkat itu **dibagi 5** — dibagi panjangnya sendiri. Vektor pun begitu:

$$\hat{e} = \frac{\vec{v}}{|\vec{v}|} = \frac{1}{|\vec{v}|}\,\vec{v}$$

**Contoh $\vec{v} = (3,\, 4)$:**

1. Hitung panjangnya dulu: $|\vec{v}| = \sqrt{3^2 + 4^2} = 5$.
2. Bagi **setiap** komponen dengan 5 — bukan hanya satu.
3. Hasilnya $\hat{e} = \left(\tfrac{3}{5},\, \tfrac{4}{5}\right)$.

### Uji verifikasi mandiri

Kamu tidak perlu bertanya kepada siapa pun apakah jawabanmu benar — hitung saja panjangnya, dan hasilnya wajib tepat 1:

$$\left|\hat{e}\right| = \sqrt{\left(\tfrac{3}{5}\right)^2 + \left(\tfrac{4}{5}\right)^2} = \sqrt{\tfrac{9}{25} + \tfrac{16}{25}} = \sqrt{\tfrac{25}{25}} = 1 \;\checkmark$$

> **Biasakan langkah ini.** Ia gratis, cepat, dan menangkap hampir semua kesalahan aritmetika sebelum lembar jawabanmu dikumpulkan.

### ⚠️ Satu-satunya vektor tanpa vektor satuan

$$\vec{0} = \begin{pmatrix} 0 \\ 0 \end{pmatrix} \;\longrightarrow\; |\vec{0}| = 0 \;\longrightarrow\; \hat{e} = \frac{\vec{0}}{0} \;=\; \textbf{tidak terdefinisi}$$

Secara aljabar, rumusnya membagi dengan nol. Secara makna, alasannya lebih dalam: **vektor nol memang tidak menunjuk ke arah mana pun.** Meminta arahnya sama saja dengan bertanya "ke mana arah diam?"

---

## 1.6 Melangkah ke Ruang Tiga Dimensi

Dunia nyata tidak datar. Drone yang lepas landas, pesawat yang menanjak, sampai karakter di dalam game bergerak di **ruang** tiga dimensi ($R^3$). Bidang kita kekurangan satu arah: naik dan turun.

> **Definisi.** Di ruang ditambahkan sumbu $Z$ yang tegak lurus terhadap sumbu $X$ **dan** sumbu $Y$ sekaligus. Satu titik kini ditulis $(x,\, y,\, z)$, dan satu vektor punya tiga komponen.

### Konvensi $Z$-Up — standar matematika, fisika, dan teknik

| Sumbu | Arah | Positif | Negatif |
|---|---|---|---|
| $X$ | depan–belakang | maju | mundur |
| $Y$ | kanan–kiri | ke kanan | ke kiri |
| $Z$ | atas–bawah | naik | turun |

> **Wawasan: $Z$-Up vs $Y$-Up.** Kurikulum matematika dan fisika Indonesia, juga perangkat lunak CAD dan teknik, memakai **$Z$-Up**: $Z$-lah yang mengukur ketinggian. Sebagian *game engine* dan perangkat grafika justru memakai **$Y$-Up**, yaitu $Y$ yang menjadi tinggi. Matematikanya sama persis — yang berbeda hanya kesepakatan penamaan sumbu. Di ruang pelajaran kita, tinggi selalu $Z$.

### Tiga cara menulis vektor di $R^3$

$$(x,\, y,\, z) \qquad \begin{pmatrix} x \\ y \\ z \end{pmatrix} \qquad x\hat{i} + y\hat{j} + z\hat{k}$$

Basis baru $\hat{k}$ adalah satu langkah searah sumbu $Z$, yaitu ke atas. Contoh: $(4,\, -3,\, 2)$ berarti maju 4, ke kiri 3, naik 2.

### Panjang vektor di ruang

Pythagoras diperluas ke **diagonal ruang** sebuah balok — cukup selipkan satu suku lagi di dalam akar:

$$|\vec{v}| = \sqrt{x^2 + y^2 + z^2}$$

### ⚠️ Komponen nol tetap harus ditulis

Kalau satu arah tidak dilalui, komponennya 0 dan **tetap menempati posisinya**. Vektor $(4,\, 0,\, 3)$ berbeda jauh dari $(4,\, 3)$ maupun $(4,\, 3,\, 0)$ — menggeser angka naik satu baris berarti mengganti sumbunya.

### Tidak ada rumus baru di ruang

Semua yang sudah kamu kuasai di bidang berlaku utuh di ruang: $\vec{AB} = B - A$, modulus, dan vektor satuan. Cukup tambahkan komponen ketiga — satu angka $z$, atau satu suku $\hat{k}$.

---

## Ringkasan Bab 1

| Yang kamu kuasai sekarang | Rumus kuncinya |
|---|---|
| Vektor lahir dari pangkal, ujung, dan langkah di antaranya | $\vec{OA} = \vec{a}$ |
| Arah dibalik, tanda ikut terbalik | $\vec{AO} = -\vec{OA}$ |
| Tiga notasi yang saling tukar | $\begin{pmatrix} 7 \\ 4 \end{pmatrix} = (7,\, 4) = 7\hat{i} + 4\hat{j}$ |
| Vektor dari dua titik sembarang | $\vec{AB} = B - A$ (**ujung − pangkal**) |
| Panjang vektor (Pythagoras) | $\lvert\vec{v}\rvert = \sqrt{x^2 + y^2 + z^2}$ |
| Jawaban dalam akar eksak | $\sqrt{20} = 2\sqrt{5}$ |
| Membandingkan panjang tanpa akar | $\lvert\vec{u}\rvert > \lvert\vec{v}\rvert \iff \lvert\vec{u}\rvert^2 > \lvert\vec{v}\rvert^2$ |
| Vektor satuan | $\hat{e} = \dfrac{\vec{v}}{\lvert\vec{v}\rvert}$, dan $\lvert\hat{e}\rvert = 1$ |
| Kasus batas | Vektor nol tidak punya vektor satuan |
| Ruang tiga dimensi | Konvensi $Z$-Up; $\hat{k}$ searah sumbu $Z$ |

**Selanjutnya — Bab 2:** sekarang kamu bisa membaca satu vektor. Waktunya membuat dua vektor saling berinteraksi.
