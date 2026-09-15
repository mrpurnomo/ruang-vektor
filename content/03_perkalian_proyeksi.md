# Bab 3 — Perkalian & Proyeksi

> **Dua vektor dikalikan, hasilnya justru sebuah bilangan.**
> Bab ini memperkenalkan operasi yang paling banyak muncul di soal TKA — dan paling sering dikerjakan setengah jalan.

---

## Sebelum Mulai: Satu Pertanyaan

Dua vektor bisa dijumlahkan, dan hasilnya vektor. Dua vektor bisa dikurangkan, hasilnya juga vektor. Vektor bisa dikalikan skalar, hasilnya masih vektor.

Sekarang: dua vektor dikalikan **satu sama lain**. Hasilnya apa?

Jawabannya mengejutkan: **sebuah bilangan biasa.** Bukan vektor.

Dan justru karena hasilnya bilangan, operasi ini bisa dipakai untuk menjawab pertanyaan yang tidak bisa dijawab operasi mana pun sebelumnya — **berapa besar sudut antara dua vektor?**

---

## 3.1 Perkalian Titik (Dot Product)

### Definisi aljabar

Hasil perkalian titik dua vektor adalah **skalar** — berupa angka real biasa. Itulah sebabnya ia juga disebut *perkalian skalar dua vektor*.

$$\vec{a} \cdot \vec{b} = a_1 b_1 + a_2 b_2 + a_3 b_3$$

Aturannya satu kalimat: **kalikan komponen yang seletak, lalu jumlahkan semuanya.**

### Kerjakan pelan-pelan, pasangan demi pasangan

Contoh dengan $\vec{a} = (3, -1, 2)$ dan $\vec{b} = (1, 4, 0)$:

| Pasangan | Hasil kali |
|---|---|
| $a_1 b_1$ | $3 \times 1 = 3$ |
| $a_2 b_2$ | $(-1) \times 4 = -4$ |
| $a_3 b_3$ | $2 \times 0 = 0$ |

$$\vec{a} \cdot \vec{b} = 3 + (-4) + 0 = -1$$

> ⚠️ **Suku bernilai nol tetap ikut dijumlahkan.** Ia tidak mengubah hasilnya, tapi melewatkannya berarti kamu tidak memeriksa komponen ketiga sama sekali — dan di soal berikutnya komponen itu mungkin bukan nol.

### Definisi geometri

Ada rumus kedua yang menyatakan hal yang sama, tetapi lewat sudut:

$$\vec{a} \cdot \vec{b} = |\vec{a}|\, |\vec{b}| \cos \theta$$

dengan $\theta$ adalah sudut di antara kedua vektor **ketika keduanya berpangkal di satu titik**.

### Kenapa dua rumus untuk satu operasi?

Karena masing-masing menjawab arah pertanyaan yang berbeda:

| Yang diketahui | Rumus yang dipakai |
|---|---|
| Komponen kedua vektor | **Aljabar** — $a_1b_1 + a_2b_2 + a_3b_3$ |
| Panjang keduanya dan sudutnya | **Geometri** — $\lvert\vec{a}\rvert \lvert\vec{b}\rvert\cos\theta$ |
| Komponen keduanya, tetapi yang dicari **sudutnya** | **Keduanya**, disamakan — lihat sub-bab 3.3 |

Baris terakhir itulah mesin dari seluruh sisa bab ini.

---

## 3.2 Sifat & Tanda Hasil

### Sifat-sifat perkalian titik

- **Komutatif:** $\vec{a} \cdot \vec{b} = \vec{b} \cdot \vec{a}$. Urutan tidak berpengaruh.
- **Distributif:** $\vec{a} \cdot (\vec{b} + \vec{c}) = \vec{a}\cdot\vec{b} + \vec{a}\cdot\vec{c}$.
- **Terhadap skalar:** $(k\vec{a}) \cdot \vec{b} = k(\vec{a} \cdot \vec{b})$.
- **Terhadap dirinya sendiri:** $\vec{a} \cdot \vec{a} = |\vec{a}|^2$.

> 💡 Sifat terakhir itu sangat berguna dan jarang disadari. Kalau kamu butuh $|\vec{a}|^2$ tetapi hanya punya bentuk perkalian titik, keduanya adalah hal yang sama. Ia juga menjelaskan kenapa $\vec{a}\cdot\vec{a}$ tidak pernah negatif.

### ⚠️ Yang TIDAK berlaku

Perkalian titik **tidak** punya sifat asosiatif dalam bentuk $(\vec{a}\cdot\vec{b})\cdot\vec{c}$ — dan alasannya sederhana sekali:

$\vec{a}\cdot\vec{b}$ menghasilkan **bilangan**, dan bilangan tidak bisa di-*dot*-kan dengan vektor. Operasinya bahkan tidak terdefinisi, bukan sekadar bernilai lain.

Perkalian titik juga **tidak bisa dibalik**: dari $\vec{a}\cdot\vec{b} = \vec{a}\cdot\vec{c}$ kamu **tidak** boleh menyimpulkan $\vec{b} = \vec{c}$. Banyak vektor berbeda yang memberi hasil kali titik yang sama.

### Tanda hasilnya langsung memberi tahu jenis sudutnya

Ini alat tercepat di seluruh Bab 3. Karena $|\vec{a}|$ dan $|\vec{b}|$ selalu positif, maka **tanda $\vec{a}\cdot\vec{b}$ ditentukan sepenuhnya oleh tanda $\cos\theta$**.

| Jika | Maka $\cos\theta$ | Sudutnya |
|---|---|---|
| $\vec{a} \cdot \vec{b} > 0$ | positif | **Lancip** ($0^\circ \le \theta < 90^\circ$) |
| $\vec{a} \cdot \vec{b} = 0$ | nol | **Siku-siku** ($\theta = 90^\circ$) |
| $\vec{a} \cdot \vec{b} < 0$ | negatif | **Tumpul** ($90^\circ < \theta \le 180^\circ$) |

> **Kamu tidak perlu menghitung sudutnya untuk tahu jenisnya.** Kalau soal hanya bertanya "lancip atau tumpul?", berhenti setelah mendapat tanda hasilnya. Menghitung $\theta$ penuh adalah pekerjaan yang tidak diminta.

---

## 3.3 Sudut Antara Dua Vektor

### Menyamakan dua rumus

Kamu punya dua ekspresi untuk benda yang sama. Samakan keduanya:

$$a_1b_1 + a_2b_2 + a_3b_3 \;=\; |\vec{a}|\,|\vec{b}|\cos\theta$$

Pindahkan panjangnya ke ruas kiri:

$$\boxed{\;\cos \theta = \frac{\vec{a} \cdot \vec{b}}{|\vec{a}|\, |\vec{b}|}\;}$$

### Tiga tahap yang tidak boleh ditumpuk

Inilah rumus yang paling sering dikerjakan setengah jalan. Kerjakan **satu tahap penuh sebelum pindah ke tahap berikutnya**:

**Tahap 1 — pembilangnya.** Hitung $\vec{a}\cdot\vec{b}$. Satu angka, selesai.

**Tahap 2 — penyebutnya.** Hitung $|\vec{a}|$, lalu $|\vec{b}|$ — masing-masing dalam bentuk akar eksak. Baru kalikan keduanya.

**Tahap 3 — susun dan tarik sudutnya.** Bagi, sederhanakan, lalu cari $\theta$ dari nilai $\cos\theta$-nya.

### Contoh lengkap

Diketahui $\vec{u} = (1, 1, 0)$ dan $\vec{v} = (0, 1, 1)$.

**Tahap 1:** $\vec{u}\cdot\vec{v} = (1)(0) + (1)(1) + (0)(1) = 1$.

**Tahap 2:** $|\vec{u}| = \sqrt{1+1+0} = \sqrt{2}$, dan $|\vec{v}| = \sqrt{0+1+1} = \sqrt{2}$.
Maka $|\vec{u}||\vec{v}| = \sqrt{2}\cdot\sqrt{2} = 2$.

**Tahap 3:** $\cos\theta = \dfrac{1}{2}$, sehingga $\theta = 60^\circ$.

### Nilai kosinus yang wajib kamu hafal

Soal TKA hampir selalu dirancang supaya hasilnya jatuh ke salah satu nilai istimewa ini:

| $\cos\theta$ | $1$ | $\frac{1}{2}\sqrt{3}$ | $\frac{1}{2}\sqrt{2}$ | $\frac{1}{2}$ | $0$ | $-\frac{1}{2}$ | $-\frac{1}{2}\sqrt{2}$ | $-\frac{1}{2}\sqrt{3}$ | $-1$ |
|---|---|---|---|---|---|---|---|---|---|
| $\theta$ | $0^\circ$ | $30^\circ$ | $45^\circ$ | $60^\circ$ | $90^\circ$ | $120^\circ$ | $135^\circ$ | $150^\circ$ | $180^\circ$ |

> 💡 **Ini alat pemeriksa jawaban yang ampuh.** Kalau hasil hitunganmu adalah $\cos\theta = 0{,}374$ — sebuah angka yang tidak ada di tabel — kemungkinan besar ada langkah aritmetika yang keliru. Periksa ulang sebelum melanjutkan.

> ⚠️ **Jangan lupa merasionalkan.** Bentuk $\dfrac{7}{\sqrt{29}\cdot\sqrt{5}} = \dfrac{7}{\sqrt{145}} = \dfrac{7\sqrt{145}}{145}$. Bentuk terakhir itulah yang ditulis di lembar jawaban.

---

## 3.4 Syarat Ortogonal (Tegak Lurus)

### Kasus istimewa yang paling sering ditanyakan

Dua vektor **tak-nol** saling tegak lurus (ortogonal) **jika dan hanya jika**:

$$\vec{a} \cdot \vec{b} = 0$$

### Kenapa demikian

Masukkan $\theta = 90^\circ$ ke rumus geometri:

$$\vec{a}\cdot\vec{b} = |\vec{a}||\vec{b}|\cos 90^\circ = |\vec{a}||\vec{b}| \cdot 0 = 0$$

Sebaliknya juga berlaku: jika hasil kali titiknya nol sedangkan kedua panjangnya bukan nol, maka satu-satunya kemungkinan adalah $\cos\theta = 0$, yaitu $\theta = 90^\circ$.

### ⚠️ Perhatikan syarat "tak-nol"

Vektor nol menghasilkan $\vec{0}\cdot\vec{b} = 0$ untuk **sembarang** $\vec{b}$. Apakah itu berarti vektor nol tegak lurus terhadap semua vektor?

Secara hitungan, ya. Secara geometri, **pertanyaannya tidak bermakna** — vektor nol tidak punya arah, jadi tidak ada sudut yang bisa diukur. Itulah sebabnya definisinya menyebut "dua vektor tak-nol" secara eksplisit.

### Bentuk soal yang paling sering muncul

Soal jarang bertanya "apakah tegak lurus?". Yang lebih sering: **"tentukan nilai $k$ agar kedua vektor tegak lurus."**

Caranya selalu sama:

1. Susun $\vec{a}\cdot\vec{b}$ dengan $k$ masih di dalamnya.
2. Samakan dengan nol.
3. Selesaikan persamaan linearnya.

Contoh: $\vec{a} = (2, k, 1)$ dan $\vec{b} = (3, -1, 4)$ tegak lurus.

$$6 - k + 4 = 0 \;\Rightarrow\; k = 10$$

Satu persamaan linear sederhana — itu saja.

---

## 3.5 Proyeksi Skalar Ortogonal

### Bayangan sebuah vektor

Bayangkan $\vec{a}$ disorot lampu tegak lurus ke arah garis $\vec{b}$. Bayangan yang jatuh di garis itu disebut **proyeksi**.

Kalau yang ditanyakan hanya **panjang bayangannya** (sebuah angka), itu **proyeksi skalar**:

$$|\vec{c}| = \frac{\vec{a} \cdot \vec{b}}{|\vec{b}|}$$

### Membaca rumusnya

Perhatikan penyebutnya: $|\vec{b}|$, **pangkat satu**.

Kalimat yang membantu mengingat: *"dot dibagi panjang alasnya."*

Dan perhatikan siapa yang jadi **alas**: vektor $\vec{b}$ — vektor yang **diproyeksikan kepadanya**. Ini sumber kekeliruan nomor satu di seluruh sub-bab ini.

### ⚠️ Proyeksi tidak komutatif

$$\text{proyeksi } \vec{a} \text{ pada } \vec{b} \;\ne\; \text{proyeksi } \vec{b} \text{ pada } \vec{a}$$

Berbeda dengan perkalian titik yang komutatif, urutan pada proyeksi **sangat menentukan**. Pembilangnya memang sama ($\vec{a}\cdot\vec{b}$), tetapi penyebutnya berbeda.

**Cara membaca soal:** kalimat *"proyeksi $\vec{a}$ **pada** $\vec{b}$"* berarti $\vec{b}$ yang menjadi alas, sehingga $|\vec{b}|$ yang masuk ke penyebut. Kata **"pada"** selalu menunjuk alasnya.

### Proyeksi skalar boleh bernilai negatif

Karena pembilangnya $\vec{a}\cdot\vec{b}$ bisa negatif, hasil proyeksi skalar juga bisa negatif. Artinya: bayangannya jatuh ke arah **berlawanan** dengan $\vec{b}$ — yang terjadi persis ketika sudut antara keduanya tumpul.

Kalau soal meminta **panjang** proyeksi, ambil nilai mutlaknya. Kalau soal meminta **proyeksi skalar**, biarkan tandanya — ia membawa informasi arah.

---

## 3.6 Vektor Proyeksi Ortogonal

### Ketika yang ditanyakan adalah bayangannya sendiri

Kalau yang diminta bukan panjang bayangannya, melainkan **bayangannya sebagai sebuah vektor**, maka hasilnya adalah vektor baru yang **sejajar dengan alasnya**:

$$\vec{c} = \left( \frac{\vec{a} \cdot \vec{b}}{|\vec{b}|^2} \right) \vec{b}$$

### Perhatikan dua perbedaannya dari proyeksi skalar

1. Penyebutnya **$|\vec{b}|^2$**, bukan $|\vec{b}|$.
2. Seluruh pecahan itu **dikalikan kembali dengan $\vec{b}$**.

Bagian dalam kurung adalah sebuah **skalar** — ia menentukan seberapa panjang bayangannya. Vektor $\vec{b}$ di belakangnya menentukan **arahnya**.

### Hubungan antara keduanya

$$\vec{c} = \underbrace{\frac{\vec{a}\cdot\vec{b}}{|\vec{b}|}}_{\text{proyeksi skalar}} \cdot \underbrace{\frac{\vec{b}}{|\vec{b}|}}_{\text{vektor satuan } \vec{b}}$$

Dibaca sebagai kalimat: **panjang bayangan × arah alas.** Kalau kamu lupa rumusnya, susun ulang dari kalimat ini — dan kamu akan sampai ke bentuk yang sama.

> 💡 **Trik hemat waktu:** $|\vec{b}|^2$ tidak perlu diakarkan sama sekali. Untuk $\vec{b} = (2,-1,2)$, langsung tulis $|\vec{b}|^2 = 4+1+4 = 9$. Banyak siswa mengakarkan lebih dulu menjadi $3$, lalu mengkuadratkannya kembali menjadi $9$ — dua langkah yang saling membatalkan.

### Contoh lengkap

Diketahui $\vec{a} = (4, 3)$ dan $\vec{b} = (2, 0)$. Tentukan vektor proyeksi $\vec{a}$ pada $\vec{b}$.

1. $\vec{a}\cdot\vec{b} = 8 + 0 = 8$.
2. $|\vec{b}|^2 = 4 + 0 = 4$.
3. $\vec{c} = \dfrac{8}{4}(2,0) = 2(2,0) = (4, 0)$.

Periksa masuk akalnya: $\vec{b}$ terletak di sumbu $x$, jadi bayangan $\vec{a}$ padanya memang harus berupa vektor mendatar sepanjang komponen $x$ dari $\vec{a}$, yaitu $(4,0)$ ✓.

### ⚠️ Vektor nol sebagai alas

Memproyeksikan ke $\vec{0}$ **tidak terdefinisi**. Penyebutnya $|\vec{0}|^2 = 0$, dan lagi pula: vektor nol tidak menentukan arah garis mana pun untuk menampung bayangannya.

---

## Ringkasan Bab 3

| Yang kamu kuasai sekarang | Rumus kuncinya |
|---|---|
| Perkalian titik (aljabar) | $\vec{a}\cdot\vec{b} = a_1b_1 + a_2b_2 + a_3b_3$ — hasilnya **skalar** |
| Perkalian titik (geometri) | $\vec{a}\cdot\vec{b} = \lvert\vec{a}\rvert\lvert\vec{b}\rvert\cos\theta$ |
| Kuadrat panjang | $\vec{a}\cdot\vec{a} = \lvert\vec{a}\rvert^2$ |
| Tanda hasil → jenis sudut | positif lancip · nol siku-siku · negatif tumpul |
| Sudut antara dua vektor | $\cos\theta = \dfrac{\vec{a}\cdot\vec{b}}{\lvert\vec{a}\rvert\lvert\vec{b}\rvert}$ — **tiga tahap** |
| Syarat tegak lurus | $\vec{a}\cdot\vec{b} = 0$ (untuk vektor tak-nol) |
| Proyeksi **skalar** | $\dfrac{\vec{a}\cdot\vec{b}}{\lvert\vec{b}\rvert}$ — penyebut **pangkat satu** |
| Vektor proyeksi | $\left(\dfrac{\vec{a}\cdot\vec{b}}{\lvert\vec{b}\rvert^2}\right)\vec{b}$ — penyebut **kuadrat**, lalu dikali $\vec{b}$ |
| Kata "pada" | Selalu menunjuk **alas** proyeksinya |

**Selanjutnya — Bab 4:** semua alat sudah lengkap. Sekarang kita pakai untuk membongkar soal TKA yang sebenarnya.
