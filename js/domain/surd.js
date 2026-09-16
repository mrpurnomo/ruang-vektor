/**
 * domain/surd.js — Bilangan eksak: pecahan dan bentuk akar.
 *
 * MATEMATIKA MURNI. Tidak ada `document`, `window`, atau kelas CSS di sini:
 * berkas ini diuji di Node lewat `tests/engine.test.mjs`.
 *
 * Kenapa berkas ini ada (Blueprint §5.2): di domain vektor, jawaban yang
 * benar hampir selalu berbentuk akar. ‖(2, 4)‖ = 2√5, bukan 4.472135955.
 * Angka desimal itu melanggar aksioma aplikasi dua kali: siswa tidak bisa
 * menelusurinya, dan ia bukan bentuk yang ditulis di lembar jawaban TKA.
 *
 * ------------------------------------------------------------
 * TIGA BENTUK DATA
 * ------------------------------------------------------------
 *   Pecahan   { n, d }        n/d, d > 0, sudah disederhanakan
 *   Akar      { n, d, r }     (n/d)·√r, r bebas kuadrat (r ≥ 1)
 *   Jumlah    { terms: [...] } Σ akar dengan radikan BERBEDA-BEDA
 *
 * Kenapa koefisien akar RASIONAL (n/d), bukan bulat seperti "k√r" di
 * Blueprint: proyeksi skalar 8/√5 dan cos θ = 7/√145 wajib dirasionalkan
 * menjadi 8√5/5 dan 7√145/145. Bentuk k√r dengan k bulat tidak bisa
 * menampung keduanya.
 *
 * Kenapa ada bentuk JUMLAH: √2 + √3 tidak bisa diringkas menjadi satu akar.
 * Keliling segitiga dari tiga panjang vektor (Bab 2) adalah jumlah seperti
 * itu, dan membulatkannya ke desimal adalah persis yang dilarang aksioma.
 *
 * ------------------------------------------------------------
 * KANONIK = BISA DIBANDINGKAN
 * ------------------------------------------------------------
 * Setiap nilai yang keluar dari modul ini sudah dalam bentuk kanonik:
 * pecahan tersederhana, radikan bebas kuadrat, suku sejenis digabung, suku
 * nol dibuang, suku diurutkan menurut radikan, nol selalu {0, 1, 1}.
 * Karena itu dua nilai yang sama PASTI punya struktur yang sama —
 * kesetaraan eksak tidak butuh toleransi desimal sama sekali.
 *
 * Semua bilangan bulat dijaga tetap di dalam Number.MAX_SAFE_INTEGER.
 * Yang melewatinya DITOLAK dengan RangeError, tidak dibulatkan diam-diam:
 * jawaban yang salah karena presisi hilang jauh lebih buruk daripada galat.
 */

/* ============================================================
   1. BILANGAN BULAT AMAN
   ============================================================ */

function assertSafeInteger(value, label = 'bilangan') {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new TypeError(`${label} harus bilangan bulat, diterima: ${value}`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${label} ${value} melampaui batas bilangan bulat yang bisa dihitung eksak`);
  }
  return value;
}

/** Hasil perkalian/penjumlahan yang tidak aman ditolak, bukan dibulatkan. */
function safe(value) {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError('Hasil perhitungan melampaui batas bilangan bulat yang bisa dihitung eksak');
  }
  return value;
}

export function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}


/* ============================================================
   2. PECAHAN
   ============================================================ */

/**
 * Pecahan tersederhana dengan tanda di pembilang.
 * fraction(2, 4) → {1, 2} · fraction(3, -6) → {-1, 2}
 */
export function fraction(numerator, denominator = 1) {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    const top = toFractionStrict(numerator);
    const bottom = toFractionStrict(denominator);
    return divQ(top, bottom);
  }
  assertSafeInteger(numerator, 'Pembilang');
  assertSafeInteger(denominator, 'Penyebut');
  if (denominator === 0) {
    throw new RangeError('Penyebut pecahan tidak boleh nol — pembagian dengan nol tidak terdefinisi');
  }
  if (numerator === 0) return Object.freeze({ n: 0, d: 1 });
  const g = gcd(numerator, denominator);
  const sign = denominator < 0 ? -1 : 1;
  return Object.freeze({ n: sign * numerator / g, d: Math.abs(denominator) / g });
}

function isFractionObject(x) {
  return x !== null && typeof x === 'object' && 'n' in x && 'd' in x && !('r' in x);
}

/**
 * Desimal/teks → pecahan eksak. Mengembalikan null bila tidak bisa dibaca.
 *
 * Desimal JS dibaca lewat 15 angka penting, bukan bit-nya: 0.1 + 0.2
 * (= 0.30000000000000004) dibaca sebagai 3/10 — nilai yang memang
 * dimaksud siapa pun yang menulisnya.
 */
export function toFraction(value) {
  if (value === null || value === undefined) return null;
  if (isFractionObject(value)) return fraction(value.n, value.d);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    if (Number.isInteger(value)) return fraction(value, 1);
    return decimalToFraction(String(Number(value.toPrecision(15))));
  }
  if (typeof value !== 'string') return null;

  const text = value.trim().replace(/[−–]/g, '-').replace(/,/g, '.');
  if (text === '') return null;
  if (text.includes('/')) {
    const parts = text.split('/');
    if (parts.length !== 2) return null;
    const top = decimalToFraction(parts[0].trim());
    const bottom = decimalToFraction(parts[1].trim());
    if (!top || !bottom || bottom.n === 0) return null;
    return divQ(top, bottom);
  }
  return decimalToFraction(text);
}

function decimalToFraction(text) {
  const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(text);
  if (!m || (m[2] === '' && (m[3] === undefined || m[3] === ''))) return null;
  const sign = m[1] === '-' ? -1 : 1;
  const intPart = m[2] || '0';
  const fracPart = m[3] || '';
  const exponent = Number(m[4] || 0) - fracPart.length;
  const digits = Number((intPart + fracPart).replace(/^0+(?=\d)/, ''));
  if (!Number.isSafeInteger(digits)) {
    throw new RangeError(`Angka ${text} terlalu panjang untuk dihitung eksak`);
  }
  if (exponent >= 0) return fraction(safe(sign * digits * 10 ** exponent), 1);
  return fraction(sign * digits, safe(10 ** -exponent));
}

function toFractionStrict(value) {
  const f = toFraction(value);
  if (!f) throw new TypeError(`Bukan bilangan yang bisa dihitung eksak: ${value}`);
  return f;
}

export function addQ(a, b) {
  const g = gcd(a.d, b.d);
  const d = safe((a.d / g) * b.d);
  return fraction(safe(a.n * (b.d / g) + b.n * (a.d / g)), d);
}

export function mulQ(a, b) {
  // Sederhanakan silang lebih dulu: memperkecil risiko melewati batas aman.
  const g1 = gcd(a.n, b.d) || 1;
  const g2 = gcd(b.n, a.d) || 1;
  return fraction(safe((a.n / g1) * (b.n / g2)), safe((a.d / g2) * (b.d / g1)));
}

export function divQ(a, b) {
  if (b.n === 0) {
    throw new RangeError('Pembagian dengan nol tidak terdefinisi');
  }
  return mulQ(a, fraction(b.d, b.n));
}


/* ============================================================
   3. AKAR TUNGGAL
   ============================================================ */

/**
 * Pisahkan n = outside² · inside, dengan inside bebas kuadrat.
 * squareFreeSplit(72) → { outside: 6, inside: 2 }   karena 72 = 6²·2
 */
export function squareFreeSplit(n) {
  assertSafeInteger(n, 'Bilangan di dalam akar');
  if (n < 0) {
    throw new RangeError(`Akar dari bilangan negatif (${n}) bukan bilangan real`);
  }
  if (n === 0) return { outside: 0, inside: 1 };

  let rest = n;
  let outside = 1;
  let inside = 1;
  for (let p = 2; p * p <= rest; p += (p === 2 ? 1 : 2)) {
    let exponent = 0;
    while (rest % p === 0) {
      rest /= p;
      exponent += 1;
    }
    outside *= p ** Math.floor(exponent / 2);
    if (exponent % 2 === 1) inside *= p;
  }
  inside *= rest;   // sisa > 1 adalah faktor prima berpangkat satu
  return { outside, inside };
}

function makeSurd(coefficient, radicand) {
  if (coefficient.n === 0) return Object.freeze({ n: 0, d: 1, r: 1 });
  return Object.freeze({ n: coefficient.n, d: coefficient.d, r: radicand });
}

/**
 * (koefisien)·√(radikan), langsung dalam bentuk paling sederhana.
 *
 * Koefisien dan radikan boleh bilangan bulat, desimal berhingga, teks,
 * atau pecahan {n, d}. Radikan pecahan dirasionalkan:
 *   √(a/b) = √(ab) / b          surd(1, 1/2) = √2/2
 */
export function surd(coefficient = 1, radicand = 1) {
  const c = toFractionStrict(coefficient);
  const rq = toFractionStrict(radicand);
  if (rq.n < 0) {
    throw new RangeError(`Akar dari bilangan negatif (${rq.n}/${rq.d}) bukan bilangan real`);
  }
  const { outside, inside } = squareFreeSplit(safe(rq.n * rq.d));
  const k = mulQ(c, fraction(outside, rq.d));
  return makeSurd(k, inside);
}

/** √n dalam bentuk paling sederhana: fromSquare(20) = 2√5. */
export function fromSquare(n) {
  return surd(1, n);
}

/** k·√r disederhanakan: simplify(3, 8) = 6√2. */
export function simplify(k, r) {
  return surd(k, r);
}

/** √q untuk q rasional — dipakai untuk panjang vektor berkomponen pecahan. */
export function sqrtQ(q) {
  return surd(1, q);
}


/* ============================================================
   4. NILAI UMUM: akar tunggal ATAU jumlah suku
   ============================================================ */

function isSurdObject(x) {
  return x !== null && typeof x === 'object' && 'r' in x && 'n' in x && 'd' in x;
}

export function isSum(x) {
  return x !== null && typeof x === 'object' && Array.isArray(x.terms);
}

/** Gabungkan suku sejenis, buang nol, urutkan menurut radikan. */
function normalize(terms) {
  const byRadicand = new Map();
  for (const t of terms) {
    const prev = byRadicand.get(t.r);
    byRadicand.set(t.r, prev ? addQ(prev, t) : fraction(t.n, t.d));
  }
  const out = [...byRadicand.entries()]
    .filter(([, q]) => q.n !== 0)
    .sort((a, b) => a[0] - b[0])
    .map(([r, q]) => makeSurd(q, r));
  if (out.length === 0) return makeSurd(fraction(0), 1);
  if (out.length === 1) return out[0];
  return Object.freeze({ terms: Object.freeze(out) });
}

/** Terima akar, jumlah, pecahan, angka, atau teks → nilai kanonik. */
function asValue(x) {
  if (isSum(x)) return normalize(x.terms);
  if (isSurdObject(x)) return surd(fraction(x.n, x.d), x.r);
  const parsed = parseSurd(x);
  if (parsed === null) {
    throw new TypeError(`Bukan bilangan eksak yang bisa dibaca: ${x}`);
  }
  return parsed;
}

function termsOf(x) {
  const v = asValue(x);
  return isSum(v) ? v.terms : [v];
}

export function isZeroS(x) {
  const v = asValue(x);
  return !isSum(v) && v.n === 0;
}

/** Rasional = tidak ada akar yang tersisa (r === 1). */
export function isRational(x) {
  const v = asValue(x);
  return !isSum(v) && v.r === 1;
}

export function negS(x) {
  return normalize(termsOf(x).map((t) => makeSurd(fraction(-t.n, t.d), t.r)));
}

export function addS(a, b) {
  return normalize([...termsOf(a), ...termsOf(b)]);
}

export function subS(a, b) {
  return addS(a, negS(b));
}

/** (p√r)(q√s) = pq·√(rs), lalu disederhanakan. Jumlah didistribusikan. */
export function mulS(a, b) {
  const products = [];
  for (const s of termsOf(a)) {
    for (const t of termsOf(b)) {
      products.push(surd(mulQ(s, t), safe(s.r * t.r)));
    }
  }
  return normalize(products);
}

/**
 * a / b dengan penyebut DIRASIONALKAN.
 *   1 / (q√r) = √r / (q·r)       sehingga 7/√5 = 7√5/5
 *
 * Membagi dengan JUMLAH suku (mis. 1/(√2 + √3)) butuh perkalian sekawan
 * dan tidak dipakai di kurikulum kelas 11 ini — ditolak dengan jelas.
 */
export function divS(a, b) {
  const divisor = asValue(b);
  if (isSum(divisor)) {
    throw new TypeError('Pembagian oleh jumlah beberapa akar (butuh bentuk sekawan) tidak didukung');
  }
  if (divisor.n === 0) {
    throw new RangeError('Pembagian dengan nol tidak terdefinisi');
  }
  const inverse = surd(fraction(divisor.d, safe(divisor.n * divisor.r)), divisor.r);
  return mulS(a, inverse);
}

/**
 * Desimal — HANYA untuk pemeriksaan, pengurutan, dan menggambar.
 * Tidak pernah untuk ditampilkan sebagai jawaban.
 */
export function toNumber(x) {
  return termsOf(x).reduce((sum, t) => sum + (t.n / t.d) * Math.sqrt(t.r), 0);
}

/** Kesetaraan EKSAK: selisihnya nol secara struktural, tanpa toleransi. */
export function equalsS(a, b) {
  try {
    return isZeroS(subS(a, b));
  } catch (err) {
    if (err instanceof TypeError) return false;
    throw err;
  }
}


/* ============================================================
   5. PENYAJIAN
   ============================================================ */

function termBody(t, style) {
  const n = Math.abs(t.n);
  if (t.r === 1) {
    if (t.d === 1) return String(n);
    return style === 'latex' ? `\\frac{${n}}{${t.d}}` : `${n}/${t.d}`;
  }
  const coef = n === 1 ? '' : String(n);
  const root = style === 'latex' ? `\\sqrt{${t.r}}` : `√${t.r}`;
  if (t.d === 1) return `${coef}${root}`;
  return style === 'latex' ? `\\frac{${coef}${root}}{${t.d}}` : `${coef}${root}/${t.d}`;
}

function render(x, style) {
  return termsOf(x)
    .map((t, i) => {
      const body = termBody(t, style);
      if (i === 0) return t.n < 0 ? `-${body}` : body;
      return t.n < 0 ? ` - ${body}` : ` + ${body}`;
    })
    .join('');
}

/** '2√5' · '√29' · '-√3' · '3/4' · '7√5/5' · '√2 + √3' */
export function toText(x) {
  return render(x, 'text');
}

/** '2\\sqrt{5}' · '\\frac{7\\sqrt{5}}{5}' · '-\\frac{3}{4}' */
export function toLatexS(x) {
  return render(x, 'latex');
}


/* ============================================================
   6. PENGURAIAN ISIAN SISWA
   ============================================================ */

/**
 * Pecah teks menjadi suku mentah TANPA menyederhanakan apa pun — bentuk
 * asli tulisan siswa harus tetap terbaca oleh isSimplestForm().
 *
 * Ejaan yang diterima: "2√5" (papan angka), "2akar5", "akar 5",
 * "sqrt(5)", "√(5)", tanda minus "−" (U+2212), desimal koma "2,5",
 * pecahan "3/4" dan "2√5/3", serta jumlah "√2 + √3".
 */
function tokenize(input) {
  if (typeof input !== 'string') return null;
  const text = input
    .toLowerCase()
    .replace(/[−–]/g, '-')
    .replace(/sqrt|akar/g, '√')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/√\((\d+(?:\.\d+)?)\)/g, '√$1');
  if (text === '') return null;

  const pieces = text.match(/[+-]?[^+-]+/g);
  if (!pieces || pieces.join('') !== text) return null;

  const termPattern = /^([+-]?)(\d+(?:\.\d+)?)?(?:√(\d+(?:\.\d+)?))?(?:\/(\d+(?:\.\d+)?))?$/;
  const terms = [];
  for (const piece of pieces) {
    const m = termPattern.exec(piece);
    if (!m || (m[2] === undefined && m[3] === undefined)) return null;
    terms.push({ sign: m[1] === '-' ? -1 : 1, coef: m[2], rad: m[3], den: m[4] });
  }
  return terms;
}

/**
 * Isian → nilai eksak kanonik, atau null bila bukan bilangan.
 *
 * null, BUKAN 0, untuk isian kosong: kotak kosong yang dinilai nol akan
 * membenarkan siswa yang belum menulis apa pun pada soal berkunci nol.
 */
export function parseSurd(input) {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') {
    const f = toFraction(input);
    return f ? surd(f, 1) : null;
  }
  if (isSum(input) || isSurdObject(input)) return asValue(input);
  if (isFractionObject(input)) return surd(input, 1);

  const terms = tokenize(input);
  if (!terms) return null;
  try {
    const values = terms.map(({ sign, coef, rad, den }) => {
      const c = fraction(sign, 1);
      const k = coef === undefined ? c : mulQ(c, toFractionStrict(coef));
      const q = den === undefined ? k : divQ(k, toFractionStrict(den));
      return surd(q, rad === undefined ? 1 : toFractionStrict(rad));
    });
    return normalize(values.flatMap((v) => (isSum(v) ? v.terms : [v])));
  } catch (err) {
    if (err instanceof RangeError || err instanceof TypeError) return null;
    throw err;
  }
}

/**
 * Apakah TULISAN siswa sudah bentuk paling sederhana?
 *
 * Nilainya boleh benar tapi tulisannya belum: √20 bernilai sama dengan
 * 2√5, tetapi lembar jawaban TKA menuntut 2√5. Yang diperiksa:
 *   · radikan tidak mengandung faktor kuadrat (√20, √25)
 *   · tidak ada √0 atau √1 yang tersisa
 *   · pecahan tidak bisa disederhanakan lagi (6/4) dan penyebut bukan 1
 *   · tidak ada dua suku berradikan sama (√2 + √2)
 */
export function isSimplestForm(input) {
  if (typeof input === 'number') return Number.isFinite(input);
  const terms = tokenize(input);
  if (!terms || parseSurd(input) === null) return false;

  const seen = new Set();
  for (const { coef, rad, den } of terms) {
    if (coef !== undefined && Number(coef) === 0) return false;
    if (rad !== undefined) {
      const r = Number(rad);
      if (!Number.isInteger(r) || r <= 1) return false;
      if (squareFreeSplit(r).outside !== 1) return false;
    }
    if (den !== undefined) {
      const d = Number(den);
      if (!Number.isInteger(d) || d === 1) return false;
      const c = coef === undefined ? 1 : Number(coef);
      if (Number.isInteger(c) && gcd(c, d) !== 1) return false;
    }
    const key = rad === undefined ? 1 : Number(rad);
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}
