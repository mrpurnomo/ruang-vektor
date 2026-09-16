/**
 * domain/vector.js — Operasi vektor di R² dan R³.
 *
 * MATEMATIKA MURNI (Blueprint §5.1). Tidak ada `document`, `window`, atau
 * kelas CSS. Diuji di Node lewat `tests/engine.test.mjs`.
 *
 * ------------------------------------------------------------
 * EMPAT KEPUTUSAN
 * ------------------------------------------------------------
 * 1. SATU HIMPUNAN FUNGSI untuk R² dan R³. Vektor selalu punya x, y, z;
 *    di R² z = 0. Tetapi dimensinya DISIMPAN (`dim`), tidak ditebak dari
 *    z: vektor ruang (1, 2, 0) tetap tiga komponen saat ditampilkan, dan
 *    validator bisa menolak "(1, 2) + (1, 2, 3)" dengan alasan yang benar.
 *
 * 2. EKSAK MASUK → EKSAK KELUAR. Komponen boleh angka JS atau pecahan
 *    {n, d} dari surd.js. Bila satu saja operand berupa pecahan, hitungannya
 *    memakai pecahan dan hasilnya pecahan: ½·(3, 5) = (3/2, 5/2), bukan
 *    (1.5, 2.5). Semua angka biasa → hasil angka biasa.
 *
 * 3. FUNGSI BERAKHIRAN `Exact` MENGEMBALIKAN BENTUK AKAR, bukan desimal:
 *    normExact((2, 4)) = 2√5. Versi tanpa akhiran (norm, cosAngle, …)
 *    mengembalikan desimal dan HANYA untuk memeriksa, menggambar, atau
 *    menghitung sudut — tidak pernah untuk ditampilkan sebagai jawaban.
 *
 * 4. KONDISI TAK TERDEFINISI MELEMPAR RangeError (vektor satuan dari
 *    vektor nol, proyeksi ke vektor nol, pembagian ruas m + n = 0).
 *    Modul ini tidak menyusun kalimat untuk siswa — itu tugas validator.js,
 *    yang memeriksa LEBIH DULU sehingga lemparan di sini tidak pernah
 *    sampai ke layar.
 *
 * Perkalian silang sengaja TIDAK ada: di luar cakupan rancangan materi dan
 * rincian TKA (keputusan pengguna, handoff §1).
 */

import * as S from './surd.js';

/* ============================================================
   1. SKALAR: angka JS atau pecahan {n, d}
   ============================================================ */

function isFractionScalar(x) {
  return x !== null && typeof x === 'object' && 'n' in x && 'd' in x && !('r' in x);
}

function assertScalar(x, label = 'Komponen') {
  if (typeof x === 'number') {
    if (!Number.isFinite(x)) throw new TypeError(`${label} harus bilangan berhingga, diterima: ${x}`);
    return x;
  }
  if (isFractionScalar(x)) return x;
  throw new TypeError(`${label} harus bilangan atau pecahan {n, d}, diterima: ${x}`);
}

function Q(x) {
  return typeof x === 'number' ? S.toFraction(x) : S.fraction(x.n, x.d);
}

function bothNumbers(a, b) {
  return typeof a === 'number' && typeof b === 'number';
}

const sAdd = (a, b) => (bothNumbers(a, b) ? a + b : S.addQ(Q(a), Q(b)));
const sNeg = (a) => (typeof a === 'number' ? -a || 0 : S.fraction(-a.n, a.d));
const sSub = (a, b) => sAdd(a, sNeg(b));
const sMul = (a, b) => (bothNumbers(a, b) ? a * b : S.mulQ(Q(a), Q(b)));

function sDiv(a, b) {
  if (isZeroScalar(b)) throw new RangeError('Pembagian dengan nol tidak terdefinisi');
  return bothNumbers(a, b) ? a / b : S.divQ(Q(a), Q(b));
}

function isZeroScalar(x) {
  return typeof x === 'number' ? x === 0 : x.n === 0;
}

/** Nilai desimal sebuah skalar — hanya untuk pemeriksaan & sudut. */
function toNum(x) {
  return typeof x === 'number' ? x : x.n / x.d;
}


/* ============================================================
   2. KONSTRUKSI
   ============================================================ */

function make(dimension, x, y, z = 0) {
  return Object.freeze({
    x: assertScalar(x, 'Komponen x'),
    y: assertScalar(y, 'Komponen y'),
    z: assertScalar(z, 'Komponen z'),
    dim: dimension,
  });
}

/** vec(3, -4) → vektor bidang · vec(1, 2, 0) → vektor ruang (dim 3). */
export function vec(x, y, z) {
  return z === undefined ? make(2, x, y, 0) : make(3, x, y, z);
}

export function fromArray(components) {
  if (!Array.isArray(components) || (components.length !== 2 && components.length !== 3)) {
    throw new TypeError('Vektor harus punya 2 atau 3 komponen');
  }
  return vec(...components);
}

export function toArray(v) {
  return v.dim === 3 ? [v.x, v.y, v.z] : [v.x, v.y];
}

/** Terima vektor atau titik berupa array [x, y] / [x, y, z]. */
function asVec(p) {
  if (Array.isArray(p)) return fromArray(p);
  if (p && typeof p === 'object' && (p.dim === 2 || p.dim === 3)) return p;
  throw new TypeError('Diharapkan vektor dari vec() atau array komponen');
}

export function zero(dimension = 2) {
  return dimension === 3 ? vec(0, 0, 0) : vec(0, 0);
}

export function dim(v) {
  return asVec(v).dim;
}

export function isZero(v) {
  const u = asVec(v);
  return isZeroScalar(u.x) && isZeroScalar(u.y) && isZeroScalar(u.z);
}

/** Vektor AB = B − A. */
export function fromPoints(A, B) {
  return subtract(asVec(B), asVec(A));
}


/* ============================================================
   3. OPERASI DASAR
   ============================================================ */

function combine(u, v, op) {
  const a = asVec(u);
  const b = asVec(v);
  return make(Math.max(a.dim, b.dim), op(a.x, b.x), op(a.y, b.y), op(a.z, b.z));
}

export function add(u, v) {
  return combine(u, v, sAdd);
}

export function subtract(u, v) {
  return combine(u, v, sSub);
}

export function scale(k, v) {
  assertScalar(k, 'Skalar');
  const u = asVec(v);
  return make(u.dim, sMul(k, u.x), sMul(k, u.y), sMul(k, u.z));
}

export function negate(v) {
  return scale(-1, v);
}

/** Sama per komponen dengan toleransi relatif (untuk komponen desimal). */
export function equals(u, v, tol = 1e-9) {
  const a = asVec(u);
  const b = asVec(v);
  if (a.dim !== b.dim) return false;
  return ['x', 'y', 'z'].every((key) => {
    const p = toNum(a[key]);
    const q = toNum(b[key]);
    return Math.abs(p - q) <= tol * Math.max(1, Math.abs(p), Math.abs(q));
  });
}

function toNumericVec(v) {
  const u = asVec(v);
  return make(u.dim, toNum(u.x), toNum(u.y), toNum(u.z));
}


/* ============================================================
   4. PERKALIAN TITIK & PANJANG
   ============================================================ */

export function dot(u, v) {
  const a = asVec(u);
  const b = asVec(v);
  return sAdd(sAdd(sMul(a.x, b.x), sMul(a.y, b.y)), sMul(a.z, b.z));
}

/**
 * ‖v‖² — bilangan bulat untuk komponen bulat. Untuk MEMBANDINGKAN panjang,
 * pakai ini, bukan norm(): ‖u‖ > ‖v‖ ⟺ ‖u‖² > ‖v‖², tanpa akar dan tanpa
 * galat pembulatan (Blueprint §5.2).
 */
export function normSquared(v) {
  return dot(v, v);
}

/** Desimal — HANYA untuk pemeriksaan dan menggambar. */
export function norm(v) {
  return Math.sqrt(toNum(normSquared(v)));
}

/** ‖v‖ dalam bentuk akar eksak: ‖(2, 4)‖ = 2√5. */
export function normExact(v) {
  return S.sqrtQ(Q(normSquared(v)));
}

export function distance(A, B) {
  return norm(fromPoints(A, B));
}

export function distanceExact(A, B) {
  return normExact(fromPoints(A, B));
}

export function midpoint(A, B) {
  const a = asVec(A);
  const b = asVec(B);
  const half = (p, q) => sDiv(sAdd(p, q), 2);
  return make(Math.max(a.dim, b.dim), half(a.x, b.x), half(a.y, b.y), half(a.z, b.z));
}


/* ============================================================
   5. VEKTOR SATUAN, SUDUT, PROYEKSI
   ============================================================ */

function requireNonZero(v, message) {
  if (isZero(v)) throw new RangeError(message);
}

export function unit(v) {
  requireNonZero(v, 'Vektor nol tidak punya vektor satuan: ia tidak menunjuk ke arah mana pun');
  const u = toNumericVec(v);
  return scale(1 / norm(u), u);
}

/** Komponen vektor satuan sebagai akar eksak: (1, 1) → (√2/2, √2/2). */
export function unitExact(v) {
  requireNonZero(v, 'Vektor nol tidak punya vektor satuan: ia tidak menunjuk ke arah mana pun');
  const u = asVec(v);
  const length = normExact(u);
  const part = (c) => S.divS(Q(c), length);
  return Object.freeze({ x: part(u.x), y: part(u.y), z: part(u.z), dim: u.dim });
}

/** cos θ desimal, DIJEPIT ke [−1, 1]: galat 1.0000000000000002 membuat acos NaN. */
export function cosAngle(u, v) {
  requireNonZero(u, 'Sudut dengan vektor nol tidak terdefinisi');
  requireNonZero(v, 'Sudut dengan vektor nol tidak terdefinisi');
  const c = toNum(dot(u, v)) / (norm(u) * norm(v));
  return Math.min(1, Math.max(-1, c));
}

/** Sudut boleh desimal — ia memang dibulatkan ke derajat. */
export function angleBetween(u, v, { degrees = false } = {}) {
  const radians = Math.acos(cosAngle(u, v));
  return degrees ? (radians * 180) / Math.PI : radians;
}

/** cos θ = (u·v) / (‖u‖‖v‖), dirasionalkan: (1, 2),(3, 1) → √2/2. */
export function cosAngleExact(u, v) {
  requireNonZero(u, 'Sudut dengan vektor nol tidak terdefinisi');
  requireNonZero(v, 'Sudut dengan vektor nol tidak terdefinisi');
  return S.divS(Q(dot(u, v)), S.mulS(normExact(u), normExact(v)));
}

const PROJECT_ZERO = 'Proyeksi ke vektor nol tidak terdefinisi: vektor nol tidak punya arah';

/** Proyeksi skalar ortogonal u pada `onto` = (u·v)/‖v‖ — desimal. */
export function projScalar(u, onto) {
  requireNonZero(onto, PROJECT_ZERO);
  return toNum(dot(u, onto)) / norm(onto);
}

/** Proyeksi skalar dalam bentuk eksak: (2, 3) pada (1, 2) = 8√5/5. */
export function projScalarExact(u, onto) {
  requireNonZero(onto, PROJECT_ZERO);
  return S.divS(Q(dot(u, onto)), normExact(onto));
}

/** Proyeksi vektor ortogonal = ((u·v)/‖v‖²)·v — desimal. */
export function projVector(u, onto) {
  requireNonZero(onto, PROJECT_ZERO);
  const factor = toNum(dot(u, onto)) / toNum(normSquared(onto));
  return scale(factor, toNumericVec(onto));
}

/** Proyeksi vektor dengan komponen pecahan eksak: (8/5, 16/5). */
export function projVectorExact(u, onto) {
  requireNonZero(onto, PROJECT_ZERO);
  const factor = S.divQ(Q(dot(u, onto)), Q(normSquared(onto)));
  return scale(factor, onto);
}

/** Komponen u yang tegak lurus `onto`: u − proj. */
export function reject(u, onto) {
  return subtract(toNumericVec(u), projVector(u, onto));
}


/* ============================================================
   6. RELASI
   ============================================================ */

function nearZero(value, magnitude, tol) {
  return Math.abs(value) <= tol * Math.max(1, magnitude);
}

export function isPerpendicular(u, v, tol = 1e-9) {
  return nearZero(toNum(dot(u, v)), norm(u) * norm(v), tol);
}

/**
 * Sejajar ⟺ semua minor 2×2 dari [u; v] nol. Berlaku di R² dan R³ tanpa
 * perkalian silang. Vektor nol dianggap sejajar dengan semua vektor.
 */
export function isParallel(u, v, tol = 1e-9) {
  const a = toNumericVec(u);
  const b = toNumericVec(v);
  const scaleRef = norm(a) * norm(b);
  return [
    a.x * b.y - a.y * b.x,
    a.x * b.z - a.z * b.x,
    a.y * b.z - a.z * b.y,
  ].every((minor) => nearZero(minor, scaleRef, tol));
}

export function isCollinear(A, B, C, tol = 1e-9) {
  return isParallel(fromPoints(A, B), fromPoints(A, C), tol);
}


/* ============================================================
   7. PEMBAGIAN RUAS GARIS
   ============================================================ */

/** P pada AB dengan AP:PB = m:n (dalam): P = (n·A + m·B) / (m + n). */
export function sectionPoint(A, B, m, n) {
  const total = sAdd(assertScalar(m, 'm'), assertScalar(n, 'n'));
  if (isZeroScalar(total)) {
    throw new RangeError('Pembagian dalam dengan m + n = 0 tidak terdefinisi');
  }
  const sum = add(scale(n, asVec(A)), scale(m, asVec(B)));
  return make(sum.dim, sDiv(sum.x, total), sDiv(sum.y, total), sDiv(sum.z, total));
}

/** P di luar AB dengan AP:PB = m:n: P = (m·B − n·A) / (m − n). */
export function sectionPointOuter(A, B, m, n) {
  const diff = sSub(assertScalar(m, 'm'), assertScalar(n, 'n'));
  if (isZeroScalar(diff)) {
    throw new RangeError('Pembagian luar dengan m = n tidak terdefinisi');
  }
  const top = subtract(scale(m, asVec(B)), scale(n, asVec(A)));
  return make(top.dim, sDiv(top.x, diff), sDiv(top.y, diff), sDiv(top.z, diff));
}


/* ============================================================
   8. KOMBINASI LINEAR
   ============================================================ */

export function linearCombination(coeffs, vectors) {
  if (!Array.isArray(coeffs) || !Array.isArray(vectors) || coeffs.length !== vectors.length || !coeffs.length) {
    throw new TypeError('Banyak koefisien harus sama dengan banyak vektor');
  }
  return coeffs.reduce((acc, k, i) => add(acc, scale(k, vectors[i])), zero(asVec(vectors[0]).dim));
}

/**
 * Cari a, b sehingga a·u + b·v = target (aturan Cramer, EKSAK).
 * Mengembalikan null bila u ∥ v — tidak ada pasangan tunggal.
 */
export function solveCombination2D(target, u, v) {
  const t = asVec(target);
  const p = asVec(u);
  const q = asVec(v);
  const det = S.addQ(S.mulQ(Q(p.x), Q(q.y)), S.mulQ(S.fraction(-1), S.mulQ(Q(q.x), Q(p.y))));
  if (det.n === 0) return null;
  const cross2 = (a, b, c, d) => S.addQ(S.mulQ(Q(a), Q(b)), S.mulQ(S.fraction(-1), S.mulQ(Q(c), Q(d))));
  return {
    a: S.divQ(cross2(t.x, q.y, q.x, t.y), det),
    b: S.divQ(cross2(p.x, t.y, t.x, p.y), det),
  };
}


/* ============================================================
   9. PENYAJIAN
   ============================================================ */

function componentLatex(c) {
  if (typeof c === 'number') return Number.isInteger(c) ? String(c) : S.toLatexS(Q(c));
  return S.toLatexS(c);   // pecahan {n, d} atau akar dari unitExact
}

function componentText(c) {
  if (typeof c === 'number') return Number.isInteger(c) ? String(c) : S.toText(Q(c));
  return S.toText(c);
}

function componentsOf(v) {
  const u = v && typeof v === 'object' && (v.dim === 2 || v.dim === 3) ? v : asVec(v);
  return u.dim === 3 ? [u.x, u.y, u.z] : [u.x, u.y];
}

function isZeroComponent(c) {
  if (typeof c === 'number') return c === 0;
  return c.n === 0 && !('terms' in c);
}

/**
 * 'column' → \begin{pmatrix} 3 \\ -1 \\ 2 \end{pmatrix}
 * 'ijk'    → 3\hat{i} - \hat{j} + 2\hat{k}
 * 'tuple'  → (3, -1, 2)
 */
export function toLatex(v, { style = 'column' } = {}) {
  const comps = componentsOf(v);
  if (style === 'tuple') return `(${comps.map(componentLatex).join(', ')})`;
  if (style === 'column') return `\\begin{pmatrix} ${comps.map(componentLatex).join(' \\\\ ')} \\end{pmatrix}`;

  const basis = ['\\hat{i}', '\\hat{j}', '\\hat{k}'];
  const parts = [];
  comps.forEach((c, i) => {
    if (isZeroComponent(c)) return;
    let coef = componentLatex(c);
    if (coef === '1') coef = '';
    else if (coef === '-1') coef = '-';
    parts.push(`${coef}${basis[i]}`);
  });
  if (!parts.length) return '\\vec{0}';
  return parts
    .map((part, i) => {
      if (i === 0) return part;
      return part.startsWith('-') ? ` - ${part.slice(1)}` : ` + ${part}`;
    })
    .join('');
}

/** Teks biasa untuk toast dan aria-label: '(3, -1, 2)', '(8/5, 16/5)'. */
export function toComponentText(v) {
  return `(${componentsOf(v).map(componentText).join(', ')})`;
}
