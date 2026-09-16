/**
 * domain/validator.js — Aturan boleh/tidak BESERTA kalimatnya, dan
 * pemeriksa jawaban eksak.
 *
 * MATEMATIKA MURNI (Blueprint §5.3). Tidak ada `document`, `window`, atau
 * kelas CSS. Diuji di Node lewat `tests/engine.test.mjs`.
 *
 * ------------------------------------------------------------
 * DUA ATURAN KALIMAT
 * ------------------------------------------------------------
 * 1. KONTRAK 4 — penolakan tanpa alasan tidak mengajar apa-apa. Setiap
 *    penolakan adalah kalimat utuh dengan pola tiga bagian:
 *      sebut kondisinya → sebut akibatnya pada rumus → sebut alasannya.
 *
 * 2. AKSIOMA §1.1 — kalimat penolakan TIDAK PERNAH memuat kunci jawaban
 *    atau hasil penyederhanaannya. "√20 masih memuat faktor kuadrat" boleh;
 *    "√20 = 2√5" tidak, karena itu aplikasi yang menyederhanakan untuk
 *    siswa. Bentuk kanonik tetap tersedia di properti `canonical` untuk
 *    pembahasan SESUDAH penilaian, dan diuji tidak bocor ke `reason`.
 */

import * as S from './surd.js';
import * as V from './vector.js';

export { numbersMatch } from '../core/numeric.js';
export { fillTemplate } from '../core/text.js';

export function ok() {
  return { valid: true, reason: null };
}

export function fail(reason) {
  return { valid: false, reason };
}


/* ============================================================
   1. PRASYARAT OPERASI
   ============================================================ */

function dimensionWord(d) {
  return d === 3 ? 'ruang (3 komponen)' : 'bidang (2 komponen)';
}

export function canAddSubtract(u, v) {
  const du = V.dim(u);
  const dv = V.dim(v);
  if (du !== dv) {
    return fail(
      `Vektor pertama berada di ${dimensionWord(du)}, sedangkan vektor kedua di ${dimensionWord(dv)}. ` +
      'Penjumlahan dan pengurangan dilakukan komponen demi komponen, sehingga ada komponen ' +
      'yang tidak punya pasangan — kedua vektor harus berdimensi sama.'
    );
  }
  return ok();
}

export function canDot(u, v) {
  const du = V.dim(u);
  const dv = V.dim(v);
  if (du !== dv) {
    return fail(
      `Perkalian titik membutuhkan dua vektor berdimensi sama, tetapi yang ini ${du} dan ${dv} komponen. ` +
      'Rumus u·v = x₁x₂ + y₁y₂ + z₁z₂ memasangkan setiap komponen, jadi komponen yang berlebih ' +
      'tidak punya pasangan untuk dikalikan.'
    );
  }
  return ok();
}

export function canUnit(v) {
  if (V.isZero(v)) {
    return fail(
      'Vektor nol tidak punya vektor satuan, karena ia tidak menunjuk ke arah mana pun. ' +
      'Rumus ê = v / |v| akan membagi dengan panjang 0, dan pembagian dengan nol tidak terdefinisi.'
    );
  }
  return ok();
}

export function canAngle(u, v) {
  if (V.isZero(u) || V.isZero(v)) {
    return fail(
      'Sudut hanya bisa diukur di antara dua vektor yang punya arah, dan vektor nol tidak punya arah. ' +
      'Rumus cos θ = (u·v) / (|u||v|) akan membagi dengan panjang 0, sehingga sudutnya tidak terdefinisi.'
    );
  }
  return ok();
}

export function canProject(u, onto) {
  if (V.isZero(onto)) {
    return fail(
      'Vektor tidak bisa diproyeksikan ke vektor nol, karena vektor nol tidak punya arah untuk dijadikan garis acuan. ' +
      'Rumus proyeksi membagi dengan |v| atau |v|², dan keduanya bernilai 0.'
    );
  }
  return ok();
}

export function canSection(m, n, { outer = false } = {}) {
  if (!outer && m + n === 0) {
    return fail(
      `Perbandingan ${m} : ${n} tidak bisa dipakai untuk pembagian di dalam ruas garis. ` +
      'Rumus P = (n·A + m·B) / (m + n) akan membagi dengan m + n = 0, dan pembagian dengan nol tidak terdefinisi.'
    );
  }
  if (outer && m === n) {
    return fail(
      `Perbandingan ${m} : ${n} yang sama besar tidak bisa dipakai untuk pembagian di luar ruas garis. ` +
      'Rumus P = (m·B − n·A) / (m − n) akan membagi dengan m − n = 0 — titik seperti itu tidak pernah ada.'
    );
  }
  return ok();
}

export function canSolveCombination(u, v) {
  if (V.isParallel(u, v)) {
    return fail(
      'Kedua vektor acuan sejajar, sehingga keduanya hanya menunjuk sepanjang satu garis yang sama. ' +
      'Kombinasi a·u + b·v tidak bisa mencapai arah lain, dan pasangan (a, b) yang tunggal tidak ada.'
    );
  }
  return ok();
}


/* ============================================================
   2. PEMERIKSA ISIAN
   ============================================================ */

function isBlank(x) {
  return x === null || x === undefined || (typeof x === 'string' && x.trim() === '');
}

/** Isian ditulis dengan koma/titik desimal? (Bukan pecahan, bukan akar.) */
function isDecimalInput(x) {
  if (typeof x === 'number') return !Number.isInteger(x);
  return typeof x === 'string' && /\d[.,]\d/.test(x);
}

const REASON_EMPTY =
  'Jawabannya belum diisi. Ketuk kotak isian untuk membuka papan angka, lalu tulis nilainya — ' +
  'kotak yang kosong tidak dinilai sebagai nol.';

function reasonUnreadable(input) {
  return (
    `Isian "${input}" belum berupa bilangan yang utuh. ` +
    'Bentuk akar ditulis lengkap: koefisien di depan dan bilangan di dalam akar, misalnya 3√2.'
  );
}

/**
 * Validasi bentuk isian SEBELUM dinilai.
 * @returns {{ valid: boolean, reason: string|null, value?: object }}
 */
export function validateNumberInput(raw, { allowSurd = false } = {}) {
  if (isBlank(raw)) return fail(REASON_EMPTY);
  const value = S.parseSurd(raw);
  if (value === null) return fail(reasonUnreadable(raw));
  if (!allowSurd && !S.isRational(value)) {
    return fail(
      'Soal ini meminta bilangan biasa — bulat, pecahan, atau desimal — bukan bentuk akar. ' +
      'Lanjutkan hitunganmu sampai tidak ada akar yang tersisa.'
    );
  }
  return { valid: true, reason: null, value };
}

function verdict(correct, code, reason, canonical) {
  return { correct, code, reason, canonical };
}

/**
 * Nilai satu jawaban siswa terhadap kuncinya secara EKSAK.
 *
 * @param {string|number|null} student  Paling baik teks tampilan papan angka
 *                                       ("2√5"), bukan nilai desimalnya.
 * @param {string|number|object} key    Teks, bilangan, pecahan, akar, atau jumlah.
 * @param {object} [opts]
 * @param {boolean} [opts.requireSimplest=false]  Bentuk harus paling sederhana.
 * @param {boolean} [opts.allowDecimal=false]     Terima desimal pembulatan.
 * @param {number}  [opts.decimalTolerance=0.005] Selisih mutlak yang diterima.
 * @returns {{ correct: boolean,
 *             code: 'correct'|'empty'|'unreadable'|'not-simplest'|'decimal'|'sign'|'wrong',
 *             reason: string|null, canonical: string }}
 */
export function checkExactAnswer(student, key, {
  requireSimplest = false,
  allowDecimal = false,
  decimalTolerance = 0.005,
} = {}) {
  const keyValue = S.parseSurd(key);
  if (keyValue === null) {
    throw new TypeError(`Kunci jawaban bukan bilangan eksak yang bisa dibaca: ${key}`);
  }
  const canonical = S.toText(keyValue);

  if (isBlank(student)) return verdict(false, 'empty', REASON_EMPTY, canonical);

  const value = S.parseSurd(student);
  if (value === null) return verdict(false, 'unreadable', reasonUnreadable(student), canonical);

  const decimal = isDecimalInput(student);

  if (S.equalsS(value, keyValue)) {
    if (requireSimplest && !decimal && !S.isSimplestForm(student)) {
      return verdict(false, 'not-simplest',
        `Nilainya sudah tepat, tetapi ${student} belum bentuk paling sederhana. ` +
        'Keluarkan faktor kuadrat dari dalam akar, atau sederhanakan pecahannya, sampai tidak ada yang bisa ditarik lagi.',
        canonical);
    }
    return verdict(true, 'correct', null, canonical);
  }

  if (decimal) {
    if (allowDecimal && Math.abs(S.toNumber(value) - S.toNumber(keyValue)) <= decimalTolerance + 1e-12) {
      return verdict(true, 'correct', null, canonical);
    }
    if (!allowDecimal && !S.isRational(keyValue)) {
      return verdict(false, 'decimal',
        `${student} adalah hasil pembulatan, sedangkan nilai yang dicari tidak berhenti di belakang koma. ` +
        'Tulis bentuk akar eksaknya lewat mode Akar di papan angka — desimal selalu kehilangan sebagian nilainya.',
        canonical);
    }
  }

  if (!S.isZeroS(keyValue) && S.equalsS(value, S.negS(keyValue))) {
    return verdict(false, 'sign',
      'Besarnya sudah tepat, tetapi tandanya terbalik. ' +
      'Periksa lagi urutan pengurangan komponen atau tanda negatif yang ikut dikalikan.',
      canonical);
  }

  return verdict(false, 'wrong',
    'Nilainya belum tepat. Telusuri kembali langkah hitunganmu satu per satu, mulai dari komponen vektornya.',
    canonical);
}

const COMPONENT_NAMES = ['x', 'y', 'z'];

/**
 * Nilai jawaban vektor per komponen.
 * @param {Array} components  Isian siswa per komponen, urut x, y, (z).
 * @param {object} keyVector  Vektor kunci (komponen bilangan, pecahan, atau akar).
 */
export function checkVectorAnswer(components, keyVector, opts = {}) {
  const keys = keyVector.dim === 3
    ? [keyVector.x, keyVector.y, keyVector.z]
    : [keyVector.x, keyVector.y];

  if (!Array.isArray(components) || components.length !== keys.length) {
    const given = Array.isArray(components) ? components.length : 0;
    return {
      correct: false,
      code: 'dimension',
      reason:
        `Vektor ini punya ${keys.length} komponen, tetapi isian yang dikirim ${given}. ` +
        'Isi setiap baris di dalam kurung vektor — komponen yang kosong tidak dianggap nol.',
      results: [],
      wrongIndexes: [],
    };
  }

  const results = components.map((c, i) => checkExactAnswer(c, keys[i], opts));
  const wrongIndexes = results.flatMap((r, i) => (r.correct ? [] : [i]));
  const correct = wrongIndexes.length === 0;
  return {
    correct,
    code: correct ? 'correct' : 'wrong',
    reason: correct
      ? null
      : `Komponen ${wrongIndexes.map((i) => COMPONENT_NAMES[i]).join(' dan ')} belum tepat. ` +
        'Komponen lainnya sudah benar — periksa kembali hitungan pada baris yang ditandai saja.',
    results,
    wrongIndexes,
  };
}
