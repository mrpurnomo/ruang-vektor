/**
 * core/numeric.js
 * Pembanding dan pemformat angka yang GENERIK — tidak tahu apa-apa soal
 * vektor, matriks, atau topik mana pun.
 *
 * Kenapa berkas ini ada di core, bukan di domain/validator.js:
 * mesin soal (`js/quiz/`) perlu membandingkan jawaban angka siswa dengan
 * kuncinya. Di "Ruang Matriks" fungsi itu diimpor dari validator domain,
 * sehingga mesin soal diam-diam bergantung pada topiknya — batas Core ↔
 * Domain (Blueprint §3.2) bocor lewat satu import. Membandingkan dua angka
 * dengan toleransi bukan pengetahuan domain, jadi tempatnya di sini.
 * `domain/validator.js` cukup mengekspor ulang.
 */

/**
 * Apakah dua angka sama, dengan toleransi untuk galat floating-point.
 *
 * Toleransinya RELATIF untuk angka besar dan MUTLAK untuk angka kecil:
 * soal pemodelan bisa menyebut gaya 250 N, dan toleransi mutlak 1e-6 di
 * sana terlalu ketat untuk hasil yang lewat beberapa pembagian.
 *
 * @param {number} actual
 * @param {number} expected
 * @param {number} [tolerance=1e-6]
 */
export function numbersMatch(actual, expected, tolerance = 1e-6) {
  const a = Number(actual);
  const b = Number(expected);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= tolerance * scale;
}

/**
 * Tampilkan angka untuk siswa: bilangan bulat tanpa desimal, desimal
 * dibulatkan dan memakai KOMA (konvensi Indonesia), nol negatif dirapikan.
 *
 * @param {number} value
 * @param {number} [maxDecimals=2]
 */
export function formatNumber(value, maxDecimals = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (Object.is(n, -0) || Math.abs(n) < 1e-12) return '0';
  if (Number.isInteger(n)) return String(n);
  const factor = 10 ** maxDecimals;
  const rounded = Math.round(n * factor) / factor;
  return String(rounded).replace('.', ',');
}

/**
 * Urai isian papan angka menjadi bilangan.
 *
 * Menerima "3", "-1", "2,5", "2.5", dan pecahan "3/4". Isian kosong atau
 * yang tidak bisa diurai mengembalikan `null` — BUKAN 0. Kotak kosong yang
 * dinilai sebagai nol akan membenarkan jawaban siswa yang belum menulis
 * apa pun pada soal yang kuncinya nol.
 *
 * @param {string|number|null|undefined} raw
 * @returns {number|null}
 */
export function parseNumberInput(raw) {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim().replace(',', '.');
  if (text === '' || text === '-' || text === '.') return null;

  if (text.includes('/')) {
    const [n, d] = text.split('/');
    const num = Number(n);
    const den = Number(d);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
    return num / den;
  }

  const v = Number(text);
  return Number.isFinite(v) ? v : null;
}
