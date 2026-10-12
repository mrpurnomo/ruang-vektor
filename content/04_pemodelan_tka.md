# Bab 4 — Pemodelan TKA & Geometri Ruang

> **Empat taktik yang membedakan siswa yang hafal dari siswa yang bisa.**
> Semua rumus sudah kamu punya dari Bab 1–3. Bab ini tidak menambah satu rumus pun — ia mengajarkan **kapan** dan **bagaimana** memakainya.

---

## Sebelum Mulai: Kenapa Soal TKA Terasa Berbeda

Soal latihan di buku biasanya berbunyi: *"Diketahui $\vec{a} = (3,4)$, tentukan $|\vec{a}|$."* Kamu tahu persis rumus mana yang diminta.

Soal TKA berbunyi: *"Diketahui $\overrightarrow{AB} = (2m, m+3, m)$. Jika panjang $\overrightarrow{AB} = 9$, maka nilai $m$ adalah ...."*

Rumusnya sama persis. Yang berbeda: **kamu harus menemukan sendiri bahwa rumus itulah yang diminta**, lalu memakainya **terbalik** — dari hasil menuju komponen, bukan dari komponen menuju hasil.

Empat taktik di bab ini adalah empat pola arah-balik yang paling sering muncul.

---

## 4.1 💡 Taktik TKA 1 — Parameter Tersembunyi pada Modulus

### Pola soalnya

Nilai modulus **diketahui**, tetapi komponen penyusunnya memuat **variabel aljabar**. Yang ditanyakan justru variabelnya.

### Contoh kasus (bentuk asli soal TKA)

> Diketahui $\overrightarrow{AB} = \begin{pmatrix} 2m \\ m+3 \\ m \end{pmatrix}$. Jika panjang vektor $\overrightarrow{AB} = 9$ satuan panjang, maka nilai $m$ yang memenuhi adalah ....

### Langkah eksekusi

**Langkah 1 — pasang rumus modulusnya apa adanya.**

$$\sqrt{(2m)^2 + (m+3)^2 + m^2} = 9$$

**Langkah 2 — kuadratkan kedua ruas.** Inilah langkah yang membuka jalan; selama akar masih ada, tidak ada yang bisa dikerjakan.

$$4m^2 + (m^2 + 6m + 9) + m^2 = 81$$

**Langkah 3 — sederhanakan ke bentuk persamaan kuadrat baku.**

$$6m^2 + 6m + 9 = 81$$
$$6m^2 + 6m - 72 = 0$$
$$m^2 + m - 12 = 0$$

**Langkah 4 — faktorkan.**

$$(m+4)(m-3) = 0 \;\Rightarrow\; m = -4 \;\text{atau}\; m = 3$$

### ⚠️ Tiga jebakan di taktik ini

1. **$(2m)^2 = 4m^2$, bukan $2m^2$.** Koefisiennya ikut terkuadratkan. Ini penyumbang jawaban salah terbanyak di soal jenis ini.
2. **$(m+3)^2 = m^2 + 6m + 9$, bukan $m^2 + 9$.** Suku tengahnya tidak boleh hilang — ia justru yang membuat persamaannya kuadrat dan menghasilkan **dua** jawaban.
3. **Jangan berhenti di satu akar.** Soal berbunyi "nilai $m$ **yang memenuhi**", dan bentuk kuadrat biasanya punya dua. Pilihan jawaban TKA hampir selalu memasang "$3$ saja" atau "$-4$ saja" sebagai pengecoh.

### Kapan mengenalinya

Begitu kamu melihat **huruf di dalam komponen** dan **angka di luar tanda modulus** — taktik ini yang dipakai. Tidak ada variasi lain.

---

## 4.2 💡 Taktik TKA 2 — Bedah Bangun Segiempat

### Pola soalnya

Sebuah bangun datar (trapesium, jajar genjang, layang-layang) diberikan lewat vektor-vektor sisinya, dengan **satu sisi memuat variabel**. Yang ditanyakan adalah operasi atas variabel-variabel itu.

Kunci taktiknya: **sifat bangun datar itu sendiri adalah datanya.** Kamu tidak perlu menggambar grafik penuh — cukup menerjemahkan sifat bangunnya menjadi persamaan.

### Contoh kasus (bentuk asli soal TKA)

> Diketahui trapesium sama kaki $ABCD$ dengan $AD = BC$ dan titik $A(0,0)$. Vektor-vektor posisi pembentuk trapesium adalah $\overrightarrow{AD} = \begin{pmatrix} 1 \\ 4 \end{pmatrix}$, $\overrightarrow{AB} = \begin{pmatrix} 6 \\ 0 \end{pmatrix}$, dan $\overrightarrow{BC} = \begin{pmatrix} a \\ b \end{pmatrix}$. Nilai dari $a^2 + 2b$ adalah ....

### Langkah eksekusi

**Langkah 1 — analisis kesejajaran.**
$\overrightarrow{AB} = \begin{pmatrix} 6 \\ 0 \end{pmatrix}$ punya komponen $y$ nol. Artinya **alasnya mendatar**, sejajar sumbu $X$.

**Langkah 2 — terjemahkan sifat "sama kaki".**
Pada trapesium sama kaki beralas mendatar, kedua kaki miringnya naik setinggi yang sama. Karena $\overrightarrow{AD}$ naik $4$ satuan, maka $\overrightarrow{BC}$ juga harus naik $4$ satuan:

$$b = 4$$

**Langkah 3 — terjemahkan sifat "$AD = BC$" menjadi persamaan panjang.**

$$|\overrightarrow{AD}| = \sqrt{1^2 + 4^2} = \sqrt{17}$$

Karena $AD = BC$, maka $|\overrightarrow{BC}|$ juga harus $\sqrt{17}$:

$$\sqrt{a^2 + b^2} = \sqrt{17} \;\Rightarrow\; a^2 + 16 = 17 \;\Rightarrow\; a^2 = 1$$

**Langkah 4 — jawab apa yang ditanyakan.**

$$a^2 + 2b = 1 + 2(4) = 9$$

### 💡 Perhatikan hal cerdas di soal ini

Soal menanyakan $a^2 + 2b$, **bukan** $a$ dan $b$. Dan memang $a^2$-lah yang bisa kamu peroleh langsung dari persamaan panjang — tanpa perlu memutuskan apakah $a = 1$ atau $a = -1$.

> **Ini bukan kebetulan.** Penyusun soal sengaja menanyakan bentuk yang menghindari ambiguitas tanda. Kalau kamu mendapati dirinya bingung memilih tanda, **periksa dulu apakah yang ditanyakan memang membutuhkan tandanya.** Sering kali tidak.

### Kamus sifat bangun → persamaan vektor

| Sifat bangun | Terjemahan vektornya |
|---|---|
| Sisi berhadapan sejajar & sama panjang (jajar genjang) | $\overrightarrow{AB} = \overrightarrow{DC}$ |
| Kaki sama panjang (trapesium sama kaki, segitiga sama kaki) | $\lvert\overrightarrow{AD}\rvert = \lvert\overrightarrow{BC}\rvert$ |
| Sisi sejajar sumbu $X$ | Komponen $y$ bernilai $0$ |
| Sisi sejajar sumbu $Y$ | Komponen $x$ bernilai $0$ |
| Dua sisi sejajar (trapesium) | $\overrightarrow{AB} = k\,\overrightarrow{DC}$ |
| Sudut siku-siku di suatu titik | Hasil kali titik kedua sisinya $= 0$ |
| Diagonal saling tegak lurus (layang-layang, belah ketupat) | $\overrightarrow{AC} \cdot \overrightarrow{BD} = 0$ |

Hafalkan kamus ini. Ia yang mengubah kalimat soal menjadi persamaan.

---

## 4.3 💡 Taktik TKA 3 — Kinematika & Proporsionalitas Vektor

### Pola soalnya

Sebuah objek bergerak dengan **kecepatan konstan** pada **lintasan lurus**. Soal memberi koordinat titik awal dan akhir, lalu memberi data **waktu** antar titik di tengah.

### Prinsip tunggal yang menjalankan semuanya

> **Pada gerak berkecepatan konstan di lintasan lurus, panjang vektor (jarak) berbanding lurus dengan waktu.**

$$\frac{\text{jarak bagian}}{\text{jarak total}} = \frac{\text{waktu bagian}}{\text{waktu total}}$$

Itu saja. Tidak ada rumus kinematika lain yang diperlukan.

### Contoh kasus (bentuk asli soal TKA)

> Sebuah kereta api melaju dengan kecepatan konstan pada lintasan lurus dari stasiun $A$ sampai stasiun $E$. Koordinat stasiun $A$ dan $E$ (dalam km) berturut-turut $(2,3,5)$ dan $(11,6,8)$. Waktu tempuh antar stasiun: $A \to B$ 5 menit, $B \to C$ 3 menit, $C \to D$ 2 menit, $D \to E$ 3 menit.
> Manakah pasangan stasiun yang jaraknya kurang dari $3{,}5$ km? *(Pilih semua jawaban yang benar.)*

### Langkah eksekusi

**Langkah 1 — cari vektor lintasan total.**

$$\overrightarrow{AE} = E - A = \begin{pmatrix} 11-2 \\ 6-3 \\ 8-5 \end{pmatrix} = \begin{pmatrix} 9 \\ 3 \\ 3 \end{pmatrix}$$

**Langkah 2 — hitung jarak totalnya.**

$$|\overrightarrow{AE}| = \sqrt{81 + 9 + 9} = \sqrt{99} = 3\sqrt{11} \approx 9{,}95 \text{ km}$$

**Langkah 3 — jumlahkan waktu totalnya.**

$$5 + 3 + 2 + 3 = 13 \text{ menit}$$

**Langkah 4 — hitung tiap bagian dengan proporsi.**

| Ruas | Waktu | Jarak $= \dfrac{t}{13} \times 9{,}95$ | Kurang dari $3{,}5$ km? |
|---|---|---|---|
| $AB$ | 5 menit | $3{,}83$ km | ✗ |
| $BC$ | 3 menit | $2{,}30$ km | ✓ |
| $CD$ | 2 menit | $1{,}53$ km | ✓ |
| $DE$ | 3 menit | $2{,}30$ km | ✓ |
| $CE$ | $2+3 = 5$ menit | $3{,}83$ km | ✗ |

Jawabannya: **$BC$, $CD$, dan $DE$.**

### 💡 Jalan pintas yang menghemat setengah waktu

Kamu tidak perlu menghitung kelima jaraknya. Cari saja **ambang waktunya** lebih dahulu:

$$\frac{t}{13} \times 9{,}95 < 3{,}5 \;\Rightarrow\; t < \frac{3{,}5 \times 13}{9{,}95} \approx 4{,}57 \text{ menit}$$

Sekarang tinggal baca tabel waktunya: setiap ruas dengan waktu **kurang dari $4{,}57$ menit** memenuhi syarat. Ruas $AB$ (5 menit) dan $CE$ (5 menit) gugur; sisanya lolos.

**Satu perhitungan menggantikan lima.**

### ⚠️ Dua jebakan di taktik ini

1. **Ruas gabungan.** Pilihan $CE$ bukan salah satu ruas yang tertulis di gambar — ia gabungan $CD + DE$, jadi waktunya $2 + 3 = 5$ menit. Baca pilihannya baik-baik; yang gabungan hampir selalu disediakan.
2. **Jangan mengakarkan terlalu dini.** Simpan $\sqrt{99}$ apa adanya sampai langkah terakhir. Membulatkannya menjadi $9{,}9$ di awal bisa menggeser hasil di dekat ambang $3{,}5$ — dan soal jenis ini sengaja menaruh satu ruas tepat di dekat ambangnya.

---

## 4.4 💡 Taktik TKA 4 — Vektor Diagonal Balok

### Pola soalnya

Sebuah balok $ABCD.EFGH$ diberikan, dan yang ditanyakan adalah vektor atau panjang salah satu diagonalnya.

### Menyiapkan kerangka: tiga vektor rusuk

Ambil titik $A$ sebagai pangkal. Seluruh balok dapat dinyatakan dengan **tiga vektor rusuk** yang saling tegak lurus:

$$\overrightarrow{AB} = \text{panjang} \qquad \overrightarrow{AD} = \text{lebar} \qquad \overrightarrow{AE} = \text{tinggi}$$

Dalam koordinat, dengan balok berukuran $p \times l \times t$:

$$\overrightarrow{AB} = \begin{pmatrix} p \\ 0 \\ 0 \end{pmatrix} \quad \overrightarrow{AD} = \begin{pmatrix} 0 \\ l \\ 0 \end{pmatrix} \quad \overrightarrow{AE} = \begin{pmatrix} 0 \\ 0 \\ t \end{pmatrix}$$

### Dua jenis diagonal

**Diagonal bidang** — menghubungkan dua titik pada **satu sisi** balok. Ia adalah jumlah **dua** vektor rusuk.

$$\overrightarrow{AC} = \overrightarrow{AB} + \overrightarrow{BC} = \overrightarrow{AB} + \overrightarrow{AD} = \begin{pmatrix} p \\ l \\ 0 \end{pmatrix}$$

**Diagonal ruang** — menghubungkan dua titik yang **berseberangan menembus balok**. Ia adalah jumlah **ketiga** vektor rusuk.

$$\overrightarrow{AG} = \overrightarrow{AB} + \overrightarrow{AD} + \overrightarrow{AE} = \begin{pmatrix} p \\ l \\ t \end{pmatrix}$$

### Panjangnya

$$|\overrightarrow{AC}| = \sqrt{p^2 + l^2} \qquad\qquad |\overrightarrow{AG}| = \sqrt{p^2 + l^2 + t^2}$$

Perhatikan: rumus diagonal ruang **bukan rumus baru** — ia hanya modulus vektor di R³ dari Bab 1, dipakai pada bangun ruang.

### Contoh dengan angka

Balok berukuran $12 \times 4 \times 3$:

$$|\overrightarrow{AC}| = \sqrt{144 + 16} = \sqrt{160} = 4\sqrt{10}$$
$$|\overrightarrow{AG}| = \sqrt{144 + 16 + 9} = \sqrt{169} = 13$$

### Kamus diagonal balok $ABCD.EFGH$

| Vektor | Susunan rusuk | Komponen | Jenis |
|---|---|---|---|
| $\overrightarrow{AC}$ | $\overrightarrow{AB} + \overrightarrow{AD}$ | $(p, l, 0)$ | Diagonal bidang alas |
| $\overrightarrow{AF}$ | $\overrightarrow{AB} + \overrightarrow{AE}$ | $(p, 0, t)$ | Diagonal bidang depan |
| $\overrightarrow{AH}$ | $\overrightarrow{AD} + \overrightarrow{AE}$ | $(0, l, t)$ | Diagonal bidang samping |
| $\overrightarrow{AG}$ | $\overrightarrow{AB} + \overrightarrow{AD} + \overrightarrow{AE}$ | $(p, l, t)$ | **Diagonal ruang** |
| $\overrightarrow{BH}$ | $-\overrightarrow{AB} + \overrightarrow{AD} + \overrightarrow{AE}$ | $(-p, l, t)$ | **Diagonal ruang** |
| $\overrightarrow{EC}$ | $\overrightarrow{AB} + \overrightarrow{AD} - \overrightarrow{AE}$ | $(p, l, -t)$ | **Diagonal ruang** |

> ⚠️ **Perhatikan tanda pada dua baris terakhir.** $\overrightarrow{BH}$ berangkat dari $B$, jadi ia harus **mundur** sepanjang $\overrightarrow{AB}$ lebih dulu — komponennya menjadi $-p$. Salah tanda di sini tidak mengubah **panjang** diagonalnya (karena dikuadratkan), tetapi mengubah jawaban kalau soal menanyakan **sudut** atau **hasil kali titik**.

### 💡 Kombinasi favorit penyusun soal

Soal TKA jarang berhenti pada "tentukan panjang diagonal ruang". Yang lebih sering: **diagonal balok digabung dengan materi Bab 3** — sudut antara dua diagonal, proyeksi satu diagonal pada rusuk, atau syarat tegak lurus.

Contoh: *"Tentukan sudut antara diagonal ruang $\overrightarrow{AG}$ dan diagonal bidang $\overrightarrow{AC}$."*

Begitu kamu menuliskan keduanya sebagai komponen, soal itu kembali menjadi soal rutin Bab 3.

---

## 4.5 Teknik Sniper Komponen

### Masalahnya: mengerjakan lebih banyak daripada yang diminta

Perhatikan soal ini:

> Diketahui $\vec{u} \cdot \vec{v} = 5$, dengan $\vec{u} = (2, k, 1)$ dan $\vec{v} = (3, 4, -1)$. Tentukan $k$.

Reaksi pertama kebanyakan siswa: menulis lengkap $\vec{u}\cdot\vec{v} = 6 + 4k - 1$, lalu menyamakan dengan $5$.

Itu benar, dan tidak apa-apa. Tapi ada cara yang lebih tajam.

### Prinsip sniper

> **Cari suku yang memuat parameternya. Sisanya adalah konstanta yang bisa langsung dijumlahkan sekaligus.**

$$\underbrace{2(3) + 1(-1)}_{\text{konstanta} \;=\; 5} + \underbrace{4k}_{\text{suku parameter}} = 5$$

$$5 + 4k = 5 \;\Rightarrow\; 4k = 0 \;\Rightarrow\; k = 0$$

Bedanya terlihat kecil di soal sesederhana ini. Di soal dengan tiga parameter dan enam suku, bedanya adalah antara selesai dan kehabisan waktu.

### Kenapa taktik ini lebih aman, bukan sekadar lebih cepat

Kesalahan aritmetika hampir selalu terjadi pada suku yang **tidak** kamu perhatikan — suku bertanda negatif yang tersapu, atau suku bernilai nol yang terlewat. Dengan memisahkan "yang memuat parameter" dari "yang tidak", kamu memaksa dirimu **menyentuh setiap suku tepat satu kali**.

### Pola pengerjaan

1. **Baca apa yang ditanyakan.** Hanya satu huruf? Maka hanya suku yang memuat huruf itu yang penting bentuknya.
2. **Redupkan sisanya.** Jumlahkan semua suku konstanta menjadi satu angka. Sekali saja.
3. **Susun persamaan linearnya.** Biasanya berbentuk $(\text{konstanta}) + (\text{koefisien})k = (\text{hasil})$.
4. **Selesaikan.**

### Di mana taktik ini berlaku

| Bentuk soal | Suku yang diburu |
|---|---|
| $\vec{u}\cdot\vec{v} = c$, satu komponen memuat $k$ | Suku hasil kali yang memuat $k$ |
| $\vec{a} \perp \vec{b}$, satu komponen memuat $k$ | Sama, dengan $c = 0$ |
| $\lvert\vec{v}\rvert = c$, komponen memuat $m$ | **Semua** suku — di sini sniper tidak berlaku, karena semuanya dikuadratkan. Pakai Taktik 1 |
| Proyeksi bernilai tertentu | Suku pembilang yang memuat parameternya |

> ⚠️ **Baris ketiga itu penting.** Teknik sniper hanya bekerja pada operasi yang **linear** terhadap parameternya — seperti perkalian titik. Pada modulus, parameternya dikuadratkan, sehingga tidak ada suku yang bisa dipisahkan begitu saja. Mengenali kapan taktik **tidak** berlaku sama berharganya dengan mengenali kapan ia berlaku.

---

## Ringkasan Bab 4

| Taktik | Tanda pengenal soalnya | Langkah kuncinya |
|---|---|---|
| **1 · Parameter Tersembunyi** | Huruf di dalam komponen, angka di luar modulus | **Kuadratkan kedua ruas**, lalu faktorkan. Jangan berhenti di satu akar |
| **2 · Bedah Segiempat** | Bangun datar + satu sisi bervariabel | Terjemahkan **sifat bangunnya** menjadi persamaan vektor |
| **3 · Kinematika** | Kecepatan konstan + data waktu antar titik | Jarak **berbanding lurus** dengan waktu; cari ambang waktunya sekali saja |
| **4 · Diagonal Balok** | Balok $ABCD.EFGH$ | Diagonal bidang = 2 rusuk; diagonal ruang = 3 rusuk. Perhatikan tandanya |
| **5 · Sniper Komponen** | Satu parameter di dalam operasi **linear** | Pisahkan suku berparameter dari suku konstanta |

### Dan satu kebiasaan penutup

Sebelum mengisi lembar jawaban, tanyakan tiga hal:

1. **Apakah yang saya hitung memang yang ditanyakan?** ($a^2 + 2b$, bukan $a$ dan $b$.)
2. **Apakah bentuk jawabannya sudah benar?** (Akar eksak, bukan desimal panjang.)
3. **Apakah ada jawaban kedua yang saya lewatkan?** (Persamaan kuadrat punya dua akar.)

Tiga pertanyaan itu menyelamatkan lebih banyak nilai daripada rumus mana pun di seluruh modul ini.
