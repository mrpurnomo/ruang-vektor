/**
 * tests/engine.test.mjs — Uji mesin matematika vektor (Node murni).
 *
 *   node tests/engine.test.mjs
 *
 * Tanpa dependensi, tanpa peramban, tanpa DOM. Keluar dengan kode 1 bila
 * satu uji pun gagal, supaya bisa dipakai sebagai gerbang sebelum commit.
 *
 * Modul diimpor sebagai NAMESPACE (`import * as S`), bukan impor bernama:
 * fungsi yang belum ada membuat SATU uji gagal dengan pesan jelas, bukan
 * membuat seluruh berkas gagal dimuat.
 */

import assert from 'node:assert/strict';
import * as S from '../js/domain/surd.js';
import * as V from '../js/domain/vector.js';
import * as Val from '../js/domain/validator.js';
import * as G from '../js/domain/plane/planeGeometry.js';

/* ------------------------------------------------------------
   Harness mini
   ------------------------------------------------------------ */
// Uji DIANTREKAN lalu dijalankan berurutan dengan `await`. Harness versi
// pertama memanggil fn() tanpa menunggu: uji async yang gagal akan lolos
// diam-diam sebagai "✓" dan penolakannya muncul sesudah ringkasan dicetak.
const queue = [];
let currentGroup = '';

function group(name) {
  currentGroup = name;
  queue.push({ kind: 'group', name });
}

function test(name, fn) {
  queue.push({ kind: 'test', group: currentGroup, name, fn });
}

/** Bandingkan bentuk akar lewat properti {n, d, r} — tanpa desimal. */
function assertSurd(actual, n, d, r, msg) {
  assert.ok(actual && typeof actual === 'object', msg || 'bukan objek akar');
  assert.deepEqual({ n: actual.n, d: actual.d, r: actual.r }, { n, d, r }, msg);
}

function assertClose(actual, expected, tol = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tol, `${actual} ≉ ${expected}`);
}

/* ============================================================
   1. surd.js — pecahan & akar eksak
   ============================================================ */
group('surd.js · pecahan');

test('fraction menyederhanakan dan memindahkan tanda ke pembilang', () => {
  assert.deepEqual(S.fraction(2, 4), { n: 1, d: 2 });
  assert.deepEqual(S.fraction(3, -6), { n: -1, d: 2 });
  assert.deepEqual(S.fraction(0, -5), { n: 0, d: 1 });
});

test('toFraction membaca 0.1 + 0.2 sebagai 3/10, bukan pecahan bit floating-point', () => {
  assert.deepEqual(S.toFraction(0.1 + 0.2), { n: 3, d: 10 });
});

test('fraction menolak penyebut nol dengan RangeError', () => {
  assert.throws(() => S.fraction(1, 0), RangeError);
});

test('toFraction mengubah desimal berhingga menjadi pecahan eksak', () => {
  assert.deepEqual(S.toFraction(0.25), { n: 1, d: 4 });
  assert.deepEqual(S.toFraction(-1.5), { n: -3, d: 2 });
  assert.deepEqual(S.toFraction('2,5'), { n: 5, d: 2 });
  assert.deepEqual(S.toFraction('3/4'), { n: 3, d: 4 });
  assert.equal(S.toFraction('abc'), null);
});

group('surd.js · penyederhanaan akar');

test('squareFreeSplit menarik keluar faktor kuadrat terbesar', () => {
  assert.deepEqual(S.squareFreeSplit(20), { outside: 2, inside: 5 });
  assert.deepEqual(S.squareFreeSplit(72), { outside: 6, inside: 2 });
  assert.deepEqual(S.squareFreeSplit(100), { outside: 10, inside: 1 });
});

test('akar bilangan prima tidak bisa disederhanakan', () => {
  for (const p of [2, 3, 5, 7, 29, 97, 7919]) {
    assertSurd(S.fromSquare(p), 1, 1, p, `√${p}`);
  }
});

test('properti: untuk n = 1…5000, fromSquare(n) bebas kuadrat dan (k√r)² = n tepat', () => {
  for (let n = 1; n <= 5000; n += 1) {
    const s = S.fromSquare(n);
    assert.equal(s.d, 1, `√${n} berpenyebut`);
    assert.equal(s.n * s.n * s.r, n, `(${s.n}√${s.r})² ≠ ${n}`);
    for (let p = 2; p * p <= s.r; p += 1) {
      assert.notEqual(s.r % (p * p), 0, `radikan √${s.r} dari n=${n} masih memuat ${p}²`);
    }
  }
});

test('√20 → 2√5, √50 → 5√2, √8 → 2√2', () => {
  assertSurd(S.fromSquare(20), 2, 1, 5);
  assertSurd(S.fromSquare(50), 5, 1, 2);
  assertSurd(S.fromSquare(8), 2, 1, 2);
});

test('kuadrat sempurna menjadi bilangan bulat: √25 = 5, √1 = 1', () => {
  assertSurd(S.fromSquare(25), 5, 1, 1);
  assertSurd(S.fromSquare(1), 1, 1, 1);
  assert.equal(S.isRational(S.fromSquare(144)), true);
});

test('√0 dan koefisien 0 dinormalkan ke nol kanonik {0,1,1}', () => {
  assertSurd(S.fromSquare(0), 0, 1, 1);
  assertSurd(S.surd(0, 7), 0, 1, 1);
  assert.equal(S.isZeroS(S.surd(0, 7)), true);
});

test('simplify(3, 8) = 6√2 — koefisien ikut dikalikan', () => {
  assertSurd(S.simplify(3, 8), 6, 1, 2);
});

test('akar pecahan dirasionalkan: √(1/2) = √2/2, √2,5 = √10/2', () => {
  assertSurd(S.surd(1, S.fraction(1, 2)), 1, 2, 2);
  assertSurd(S.surd(1, 2.5), 1, 2, 10);
});

test('akar bilangan negatif ditolak (bukan bilangan real)', () => {
  assert.throws(() => S.fromSquare(-4), RangeError);
});

test('bilangan di luar batas bilangan bulat aman ditolak, bukan dibulatkan diam-diam', () => {
  assert.throws(() => S.fromSquare(2 ** 60), RangeError);
});

group('surd.js · aritmetika eksak');

test('penjumlahan akar sejenis: √2 + √8 = 3√2', () => {
  assertSurd(S.addS(S.fromSquare(2), S.fromSquare(8)), 3, 1, 2);
});

test('penjumlahan akar tak sejenis tetap eksak sebagai jumlah suku: √2 + √3', () => {
  const sum = S.addS(S.fromSquare(2), S.fromSquare(3));
  assert.equal(S.isSum(sum), true);
  assert.equal(sum.terms.length, 2);
  assert.equal(S.toText(sum), '√2 + √3');
  assertClose(S.toNumber(sum), Math.SQRT2 + Math.sqrt(3));
});

test('jumlah suku yang saling menghapus kembali menjadi akar tunggal', () => {
  const sum = S.addS(S.fromSquare(2), S.fromSquare(3));
  const back = S.subS(sum, S.fromSquare(2));
  assert.equal(S.isSum(back), false);
  assertSurd(back, 1, 1, 3);
});

test('pengurangan akar yang sama menghasilkan nol: 2√5 − √20 = 0', () => {
  const r = S.subS(S.surd(2, 5), S.fromSquare(20));
  assert.equal(S.isZeroS(r), true);
});

test('bilangan bulat biasa diterima sebagai operand: 2 + √5 dan 3 + 4 = 7', () => {
  assert.equal(S.toText(S.addS(2, S.fromSquare(5))), '2 + √5');
  assertSurd(S.addS(3, 4), 7, 1, 1);
});

test('perkalian: √2·√8 = 4, 2√3·3√6 = 18√2', () => {
  assertSurd(S.mulS(S.fromSquare(2), S.fromSquare(8)), 4, 1, 1);
  assertSurd(S.mulS(S.surd(2, 3), S.surd(3, 6)), 18, 1, 2);
});

test('perkalian jumlah suku didistribusikan: (√2 + √3)·√2 = 2 + √6', () => {
  const sum = S.addS(S.fromSquare(2), S.fromSquare(3));
  assert.equal(S.toText(S.mulS(sum, S.fromSquare(2))), '2 + √6');
});

test('pembagian dirasionalkan: 7/√5 = 7√5/5, √2/√3 = √6/3, √20/√5 = 2', () => {
  assertSurd(S.divS(7, S.fromSquare(5)), 7, 5, 5);
  assertSurd(S.divS(S.fromSquare(2), S.fromSquare(3)), 1, 3, 6);
  assertSurd(S.divS(S.fromSquare(20), S.fromSquare(5)), 2, 1, 1);
});

test('cos θ contoh Blueprint: 7/(√29·√5) = 7√145/145', () => {
  const cos = S.divS(7, S.mulS(S.fromSquare(29), S.fromSquare(5)));
  assertSurd(cos, 7, 145, 145);
  assert.equal(S.toLatexS(cos), '\\frac{7\\sqrt{145}}{145}');
});

test('pembagian dengan nol ditolak dengan RangeError', () => {
  assert.throws(() => S.divS(S.fromSquare(5), 0), RangeError);
});

test('pembagian oleh jumlah suku ditolak (butuh sekawan, di luar cakupan)', () => {
  const sum = S.addS(S.fromSquare(2), S.fromSquare(3));
  assert.throws(() => S.divS(1, sum), TypeError);
});

test('negS membalik tanda tanpa mengubah radikan', () => {
  assertSurd(S.negS(S.surd(2, 5)), -2, 1, 5);
});

group('surd.js · penyajian & penguraian');

test('toText: 2√5 · √29 · -√3 · 5 · 3/4 · 7√5/5 · -√5/5', () => {
  assert.equal(S.toText(S.surd(2, 5)), '2√5');
  assert.equal(S.toText(S.fromSquare(29)), '√29');
  assert.equal(S.toText(S.surd(-1, 3)), '-√3');
  assert.equal(S.toText(S.fromSquare(25)), '5');
  assert.equal(S.toText(S.surd(S.fraction(3, 4))), '3/4');
  assert.equal(S.toText(S.divS(7, S.fromSquare(5))), '7√5/5');
  assert.equal(S.toText(S.divS(-1, S.fromSquare(5))), '-√5/5');
});

test('toLatexS: akar, bulat, pecahan, dan pecahan negatif', () => {
  assert.equal(S.toLatexS(S.surd(2, 5)), '2\\sqrt{5}');
  assert.equal(S.toLatexS(S.fromSquare(29)), '\\sqrt{29}');
  assert.equal(S.toLatexS(S.fromSquare(25)), '5');
  assert.equal(S.toLatexS(S.surd(S.fraction(-3, 4))), '-\\frac{3}{4}');
  assert.equal(S.toLatexS(S.divS(-1, S.fromSquare(5))), '-\\frac{\\sqrt{5}}{5}');
});

test('parseSurd membaca keluaran papan angka: "2√5", "√29", "-√3", "-3√29"', () => {
  assertSurd(S.parseSurd('2√5'), 2, 1, 5);
  assertSurd(S.parseSurd('√29'), 1, 1, 29);
  assertSurd(S.parseSurd('-√3'), -1, 1, 3);
  assertSurd(S.parseSurd('-3√29'), -3, 1, 29);
});

test('parseSurd menyederhanakan dan menerima ejaan lain: "√20", "2akar5", "sqrt(20)", "−√3"', () => {
  assertSurd(S.parseSurd('√20'), 2, 1, 5);
  assertSurd(S.parseSurd('2akar5'), 2, 1, 5);
  assertSurd(S.parseSurd('akar 20'), 2, 1, 5);
  assertSurd(S.parseSurd('sqrt(20)'), 2, 1, 5);
  assertSurd(S.parseSurd('√(20)'), 2, 1, 5);
  assertSurd(S.parseSurd('−√3'), -1, 1, 3);
});

test('parseSurd membaca bilangan bulat, pecahan, desimal koma, dan akar per bilangan', () => {
  assertSurd(S.parseSurd('-7'), -7, 1, 1);
  assertSurd(S.parseSurd('3/4'), 3, 4, 1);
  assertSurd(S.parseSurd('2,5'), 5, 2, 1);
  assertSurd(S.parseSurd('2√5/3'), 2, 3, 5);
  assertSurd(S.parseSurd(4), 4, 1, 1);
});

test('parseSurd membaca jumlah suku: "√2 + √3" dan "3 - √5"', () => {
  assert.equal(S.toText(S.parseSurd('√2 + √3')), '√2 + √3');
  assert.equal(S.toText(S.parseSurd('3 - √5')), '3 - √5');
});

test('parseSurd mengembalikan null untuk isian kosong, setengah jadi, atau tak bermakna', () => {
  for (const bad of ['', '   ', '2√', '√', 'abc', '√-4', '1/0', null, undefined]) {
    assert.equal(S.parseSurd(bad), null, `"${bad}" seharusnya null`);
  }
});

test('isSimplestForm membedakan √20 (belum) dari 2√5 (sudah)', () => {
  assert.equal(S.isSimplestForm('2√5'), true);
  assert.equal(S.isSimplestForm('√29'), true);
  assert.equal(S.isSimplestForm('5'), true);
  assert.equal(S.isSimplestForm('3/4'), true);
  assert.equal(S.isSimplestForm('√20'), false);
  assert.equal(S.isSimplestForm('√25'), false);
  assert.equal(S.isSimplestForm('6/4'), false);
});

test('equalsS membandingkan secara eksak lintas bentuk: √20 = 2√5 = "2√5"', () => {
  assert.equal(S.equalsS(S.fromSquare(20), S.surd(2, 5)), true);
  assert.equal(S.equalsS('√20', '2√5'), true);
  assert.equal(S.equalsS('√20', '√21'), false);
  assert.equal(S.equalsS('√2 + √3', '√3 + √2'), true);
});

/* ============================================================
   2. vector.js — operasi vektor
   ============================================================ */
group('vector.js · konstruksi');

test('vec(x, y) berdimensi 2 dengan z = 0; vec(x, y, 0) tetap berdimensi 3', () => {
  const a = V.vec(3, -4);
  assert.deepEqual([a.x, a.y, a.z, a.dim], [3, -4, 0, 2]);
  assert.equal(V.vec(1, 2, 0).dim, 3);
  assert.equal(V.dim(V.vec(1, 2, 0)), 3);
});

test('vec bersifat beku: operasi tidak pernah mengubah vektor masukan', () => {
  const a = V.vec(1, 2);
  assert.throws(() => { 'use strict'; a.x = 99; }, TypeError);
  V.add(a, V.vec(5, 5));
  assert.equal(a.x, 1);
});

test('vec menolak komponen yang bukan bilangan', () => {
  assert.throws(() => V.vec('a', 2), TypeError);
  assert.throws(() => V.vec(NaN, 2), TypeError);
});

test('fromArray/toArray bolak-balik mempertahankan dimensi', () => {
  assert.deepEqual(V.toArray(V.fromArray([1, -2])), [1, -2]);
  assert.deepEqual(V.toArray(V.fromArray([1, -2, 0])), [1, -2, 0]);
});

test('fromPoints(A, B) = B − A (vektor posisi AB), menerima titik berupa array', () => {
  assert.deepEqual(V.toArray(V.fromPoints([1, 2], [4, 6])), [3, 4]);
  assert.deepEqual(V.toArray(V.fromPoints(V.vec(2, -1, 3), V.vec(0, 0, 0))), [-2, 1, -3]);
});

test('zero(dim) dan isZero', () => {
  assert.equal(V.isZero(V.zero(3)), true);
  assert.equal(V.zero(3).dim, 3);
  assert.equal(V.isZero(V.vec(0, 0.000001)), false);
});

group('vector.js · operasi dasar');

test('penjumlahan & pengurangan per komponen, termasuk komponen negatif', () => {
  assert.deepEqual(V.toArray(V.add(V.vec(2, -3), V.vec(-5, 7))), [-3, 4]);
  assert.deepEqual(V.toArray(V.subtract(V.vec(1, 2, 3), V.vec(4, -5, 6))), [-3, 7, -3]);
});

test('u + 0 = u dan u − u = 0 (identitas & invers)', () => {
  const u = V.vec(3, -7, 2);
  assert.equal(V.equals(V.add(u, V.zero(3)), u), true);
  assert.equal(V.isZero(V.subtract(u, u)), true);
});

test('penjumlahan bersifat komutatif', () => {
  const u = V.vec(1, 4, -2);
  const v = V.vec(-3, 0, 5);
  assert.equal(V.equals(V.add(u, v), V.add(v, u)), true);
});

test('perkalian skalar: 3·(2, −1) = (6, −3); −1·u = negate(u); 0·u = 0', () => {
  assert.deepEqual(V.toArray(V.scale(3, V.vec(2, -1))), [6, -3]);
  assert.equal(V.equals(V.scale(-1, V.vec(4, 5)), V.negate(V.vec(4, 5))), true);
  assert.equal(V.isZero(V.scale(0, V.vec(4, 5))), true);
});

test('perkalian skalar pecahan tetap eksak: ½·(3, 5) = (3/2, 5/2)', () => {
  const half = V.scale(S.fraction(1, 2), V.vec(3, 5));
  assert.deepEqual(half.x, { n: 3, d: 2 });
  assert.deepEqual(half.y, { n: 5, d: 2 });
});

test('equals memakai toleransi untuk komponen desimal', () => {
  assert.equal(V.equals(V.vec(0.1 + 0.2, 1), V.vec(0.3, 1)), true);
  assert.equal(V.equals(V.vec(0.31, 1), V.vec(0.3, 1)), false);
});

group('vector.js · perkalian titik & panjang');

test('dot: (1, 2, 3)·(4, −5, 6) = 12; vektor tegak lurus → 0', () => {
  assert.equal(V.dot(V.vec(1, 2, 3), V.vec(4, -5, 6)), 12);
  assert.equal(V.dot(V.vec(2, 3), V.vec(-3, 2)), 0);
});

test('dot dengan vektor nol selalu 0, dan u·u = ‖u‖²', () => {
  assert.equal(V.dot(V.vec(7, -9), V.zero(2)), 0);
  const u = V.vec(2, -3, 6);
  assert.equal(V.dot(u, u), V.normSquared(u));
  assert.equal(V.normSquared(u), 49);
});

test('normExact mengembalikan AKAR EKSAK: ‖(2, 4)‖ = 2√5, ‖(2, 5)‖ = √29', () => {
  assertSurd(V.normExact(V.vec(2, 4)), 2, 1, 5);
  assertSurd(V.normExact(V.vec(2, 5)), 1, 1, 29);
});

test('normExact: komponen negatif ikut dikuadratkan — ‖(−8, 6)‖ = 10, ‖(3, −4)‖ = 5', () => {
  assertSurd(V.normExact(V.vec(-8, 6)), 10, 1, 1);
  assertSurd(V.normExact(V.vec(3, -4)), 5, 1, 1);
});

test('normExact di R³ dan untuk vektor nol: ‖(1, 1, 1)‖ = √3, ‖0‖ = 0', () => {
  assertSurd(V.normExact(V.vec(1, 1, 1)), 1, 1, 3);
  assertSurd(V.normExact(V.zero(3)), 0, 1, 1);
});

test('normExact untuk komponen pecahan: ‖(½, ½)‖ = √2/2', () => {
  assertSurd(V.normExact(V.vec(S.fraction(1, 2), S.fraction(1, 2))), 1, 2, 2);
});

test('norm (desimal) konsisten dengan normExact', () => {
  assertClose(V.norm(V.vec(2, 4)), S.toNumber(V.normExact(V.vec(2, 4))));
});

test('distanceExact(A, B) = ‖B − A‖: A(1, 2), B(4, 6) → 5; O, (2, 4) → 2√5', () => {
  assertSurd(V.distanceExact(V.vec(1, 2), V.vec(4, 6)), 5, 1, 1);
  assertSurd(V.distanceExact([0, 0], [2, 4]), 2, 1, 5);
});

test('midpoint(A, B) = ½(A + B)', () => {
  assert.deepEqual(V.toArray(V.midpoint(V.vec(1, 2), V.vec(4, 6))).map(Number), [2.5, 4]);
});

group('vector.js · vektor satuan, sudut, proyeksi');

test('unitExact: (3, 4) → (3/5, 4/5); (1, 1) → (√2/2, √2/2)', () => {
  const e = V.unitExact(V.vec(3, 4));
  assertSurd(e.x, 3, 5, 1);
  assertSurd(e.y, 4, 5, 1);
  const f = V.unitExact(V.vec(1, 1));
  assertSurd(f.x, 1, 2, 2);
  assertSurd(f.y, 1, 2, 2);
});

test('vektor satuan panjangnya tepat 1', () => {
  assertClose(V.norm(V.unit(V.vec(-6, 8, 5))), 1);
});

test('vektor nol tidak punya vektor satuan — RangeError', () => {
  assert.throws(() => V.unit(V.zero(2)), RangeError);
  assert.throws(() => V.unitExact(V.zero(2)), RangeError);
});

test('angleBetween dalam derajat: 90°, 45°, 180°, dan 0°', () => {
  assertClose(V.angleBetween(V.vec(1, 0), V.vec(0, 1), { degrees: true }), 90);
  assertClose(V.angleBetween(V.vec(1, 1), V.vec(1, 0), { degrees: true }), 45);
  assertClose(V.angleBetween(V.vec(2, 3), V.vec(-4, -6), { degrees: true }), 180);
  assertClose(V.angleBetween(V.vec(2, 3), V.vec(4, 6), { degrees: true }), 0);
});

test('cosAngle dijepit ke [−1, 1] walau galat floating-point melewatinya', () => {
  const c = V.cosAngle(V.vec(0.1, 0.2, 0.3), V.vec(0.2, 0.4, 0.6));
  assert.ok(c <= 1 && c >= -1);
  assert.equal(Number.isNaN(V.angleBetween(V.vec(0.1, 0.2, 0.3), V.vec(0.2, 0.4, 0.6))), false);
});

test('cosAngleExact: (1, 2) dan (3, 1) → √2/2; tegak lurus → 0', () => {
  assertSurd(V.cosAngleExact(V.vec(1, 2), V.vec(3, 1)), 1, 2, 2);
  assertSurd(V.cosAngleExact(V.vec(2, 3), V.vec(-3, 2)), 0, 1, 1);
});

test('sudut dengan vektor nol tidak terdefinisi — RangeError', () => {
  assert.throws(() => V.cosAngle(V.zero(2), V.vec(1, 1)), RangeError);
  assert.throws(() => V.cosAngleExact(V.vec(1, 1), V.zero(2)), RangeError);
});

test('projScalarExact: (2, 3) pada (1, 2) = 8√5/5; pada sumbu x = komponen x', () => {
  assertSurd(V.projScalarExact(V.vec(2, 3), V.vec(1, 2)), 8, 5, 5);
  assertSurd(V.projScalarExact(V.vec(-3, 1), V.vec(1, 0)), -3, 1, 1);
  assertClose(V.projScalar(V.vec(2, 3), V.vec(1, 2)), 8 / Math.sqrt(5));
});

test('projVectorExact: (2, 3) pada (1, 2) = (8/5, 16/5)', () => {
  const p = V.projVectorExact(V.vec(2, 3), V.vec(1, 2));
  assert.deepEqual(p.x, { n: 8, d: 5 });
  assert.deepEqual(p.y, { n: 16, d: 5 });
});

test('proyeksi vektor sejajar dengan vektor tujuan, dan sisa (reject) tegak lurus padanya', () => {
  const u = V.vec(4, -1, 3);
  const onto = V.vec(1, 2, 2);
  assert.equal(V.isParallel(V.projVector(u, onto), onto), true);
  assert.equal(V.isPerpendicular(V.reject(u, onto), onto), true);
  assert.equal(V.equals(V.add(V.projVector(u, onto), V.reject(u, onto)), u), true);
});

test('proyeksi ke vektor nol ditolak — RangeError', () => {
  assert.throws(() => V.projScalarExact(V.vec(1, 2), V.zero(2)), RangeError);
  assert.throws(() => V.projVector(V.vec(1, 2), V.zero(2)), RangeError);
});

group('vector.js · relasi, pembagian ruas garis, kombinasi linear');

test('isParallel: (2, 4) ∥ (−1, −2); (1, 2) ∦ (2, 1); R³ (1, 2, 3) ∥ (2, 4, 6)', () => {
  assert.equal(V.isParallel(V.vec(2, 4), V.vec(-1, -2)), true);
  assert.equal(V.isParallel(V.vec(1, 2), V.vec(2, 1)), false);
  assert.equal(V.isParallel(V.vec(1, 2, 3), V.vec(2, 4, 6)), true);
  assert.equal(V.isParallel(V.vec(1, 2, 3), V.vec(2, 4, 7)), false);
});

test('isParallel memeriksa minor y–z: (0, 1, 2) ∦ (0, 2, 5) walau minor x–y dan x–z nol', () => {
  // Regresi dari uji mutasi: tanpa minor y–z, pasangan ini lolos sebagai sejajar.
  assert.equal(V.isParallel(V.vec(0, 1, 2), V.vec(0, 2, 5)), false);
  assert.equal(V.isParallel(V.vec(0, 1, 2), V.vec(0, -3, -6)), true);
});

test('isCollinear: A(1, 1), B(2, 2), C(3, 3) segaris; C(3, 4) tidak', () => {
  assert.equal(V.isCollinear([1, 1], [2, 2], [3, 3]), true);
  assert.equal(V.isCollinear([1, 1], [2, 2], [3, 4]), false);
});

test('sectionPoint (dalam): P membagi A(1, 2)–B(7, 8) dengan AP:PB = 1:2 → (3, 4)', () => {
  assert.deepEqual(V.toArray(V.sectionPoint([1, 2], [7, 8], 1, 2)).map(Number), [3, 4]);
});

test('sectionPointOuter (luar): A(1, 2), B(4, 5), AP:PB = 2:1 → (7, 8)', () => {
  assert.deepEqual(V.toArray(V.sectionPointOuter([1, 2], [4, 5], 2, 1)).map(Number), [7, 8]);
});

test('pembagian tak terdefinisi ditolak: dalam m + n = 0, luar m = n', () => {
  assert.throws(() => V.sectionPoint([0, 0], [1, 1], 2, -2), RangeError);
  assert.throws(() => V.sectionPointOuter([0, 0], [1, 1], 3, 3), RangeError);
});

test('linearCombination(2, −1; î, ĵ) = (2, −1)', () => {
  const r = V.linearCombination([2, -1], [V.vec(1, 0), V.vec(0, 1)]);
  assert.deepEqual(V.toArray(r), [2, -1]);
});

test('solveCombination2D: a(1, 2) + b(2, 1) = (4, 5) → a = 2, b = 1', () => {
  const sol = V.solveCombination2D(V.vec(4, 5), V.vec(1, 2), V.vec(2, 1));
  assert.deepEqual(sol, { a: { n: 2, d: 1 }, b: { n: 1, d: 1 } });
});

test('solveCombination2D mengembalikan null bila kedua vektor sejajar', () => {
  assert.equal(V.solveCombination2D(V.vec(4, 5), V.vec(1, 2), V.vec(2, 4)), null);
});

group('vector.js · penyajian');

test('toLatex column / ijk / tuple', () => {
  const v = V.vec(3, -1, 2);
  assert.equal(V.toLatex(v, { style: 'column' }), '\\begin{pmatrix} 3 \\\\ -1 \\\\ 2 \\end{pmatrix}');
  assert.equal(V.toLatex(v, { style: 'ijk' }), '3\\hat{i} - \\hat{j} + 2\\hat{k}');
  assert.equal(V.toLatex(v, { style: 'tuple' }), '(3, -1, 2)');
});

test('toLatex ijk melewati komponen nol dan menulis vektor nol sebagai \\vec{0}', () => {
  assert.equal(V.toLatex(V.vec(0, 2), { style: 'ijk' }), '2\\hat{j}');
  assert.equal(V.toLatex(V.vec(0, -1, 0), { style: 'ijk' }), '-\\hat{j}');
  assert.equal(V.toLatex(V.zero(2), { style: 'ijk' }), '\\vec{0}');
});

test('toLatex menulis komponen pecahan sebagai \\frac', () => {
  const p = V.projVectorExact(V.vec(2, 3), V.vec(1, 2));
  assert.equal(V.toLatex(p, { style: 'tuple' }), '(\\frac{8}{5}, \\frac{16}{5})');
});

/* ============================================================
   3. validator.js — prasyarat operasi & pemeriksa jawaban
   ============================================================ */
group('validator.js · prasyarat operasi (dengan kalimat)');

test('ok() dan fail() berbentuk seragam { valid, reason }', () => {
  assert.deepEqual(Val.ok(), { valid: true, reason: null });
  assert.deepEqual(Val.fail('Alasan.'), { valid: false, reason: 'Alasan.' });
});

test('canAddSubtract menolak dimensi berbeda dan menyebut kedua dimensinya', () => {
  const r = Val.canAddSubtract(V.vec(1, 2), V.vec(1, 2, 3));
  assert.equal(r.valid, false);
  assert.match(r.reason, /2/);
  assert.match(r.reason, /3/);
  assert.equal(Val.canAddSubtract(V.vec(1, 2), V.vec(-4, 0)).valid, true);
});

test('canDot menolak dimensi berbeda', () => {
  assert.equal(Val.canDot(V.vec(1, 2, 3), V.vec(1, 2)).valid, false);
  assert.equal(Val.canDot(V.vec(1, 2, 3), V.vec(0, 0, 0)).valid, true);
});

test('canUnit menolak vektor nol dan menjelaskan bahwa ia tidak punya arah', () => {
  const r = Val.canUnit(V.zero(2));
  assert.equal(r.valid, false);
  assert.match(r.reason, /nol/i);
  assert.match(r.reason, /arah/i);
  assert.equal(Val.canUnit(V.vec(0, -3)).valid, true);
});

test('canAngle menolak bila salah satu vektor nol', () => {
  assert.equal(Val.canAngle(V.vec(1, 2), V.zero(2)).valid, false);
  assert.equal(Val.canAngle(V.zero(2), V.vec(1, 2)).valid, false);
  assert.equal(Val.canAngle(V.vec(1, 2), V.vec(2, 1)).valid, true);
});

test('canProject menolak proyeksi KE vektor nol, tetapi memproyeksikan vektor nol itu sah', () => {
  assert.equal(Val.canProject(V.vec(1, 2), V.zero(2)).valid, false);
  assert.equal(Val.canProject(V.zero(2), V.vec(1, 2)).valid, true);
});

test('canSection: dalam m + n = 0 dan luar m = n ditolak', () => {
  assert.equal(Val.canSection(2, -2).valid, false);
  assert.equal(Val.canSection(3, 3, { outer: true }).valid, false);
  assert.equal(Val.canSection(3, 3).valid, true);
  assert.equal(Val.canSection(2, 1, { outer: true }).valid, true);
});

test('canSolveCombination menolak dua vektor sejajar', () => {
  assert.equal(Val.canSolveCombination(V.vec(1, 2), V.vec(-2, -4)).valid, false);
  assert.equal(Val.canSolveCombination(V.vec(1, 2), V.vec(2, 1)).valid, true);
});

test('Kontrak 4: setiap penolakan adalah KALIMAT lengkap, bukan kode galat', () => {
  const rejections = [
    Val.canAddSubtract(V.vec(1, 2), V.vec(1, 2, 3)),
    Val.canDot(V.vec(1, 2), V.vec(1, 2, 3)),
    Val.canUnit(V.zero(3)),
    Val.canAngle(V.zero(2), V.vec(1, 0)),
    Val.canProject(V.vec(1, 0), V.zero(2)),
    Val.canSection(1, -1),
    Val.canSection(2, 2, { outer: true }),
    Val.canSolveCombination(V.vec(1, 1), V.vec(2, 2)),
  ];
  for (const r of rejections) {
    assert.equal(r.valid, false);
    assert.ok(typeof r.reason === 'string' && r.reason.length >= 40, `terlalu pendek: ${r.reason}`);
    assert.match(r.reason, /[.!]$/, `tidak diakhiri tanda baca: ${r.reason}`);
  }
});

test('numbersMatch dan fillTemplate diekspor ulang dari core', () => {
  assert.equal(Val.numbersMatch(0.1 + 0.2, 0.3), true);
  assert.equal(Val.fillTemplate('Panjang {{p}}', { p: '2√5' }), 'Panjang 2√5');
});

group('validator.js · pemeriksa jawaban eksak');

test('INTI: jawaban 2√5 BENAR untuk kunci √20 (dan sebaliknya)', () => {
  assert.equal(Val.checkExactAnswer('2√5', '√20').correct, true);
  assert.equal(Val.checkExactAnswer('√20', '2√5').correct, true);
});

test('kunci boleh berupa objek akar dari vector.js: ‖(2, 4)‖', () => {
  const key = V.normExact(V.vec(2, 4));
  const r = Val.checkExactAnswer('2√5', key);
  assert.equal(r.correct, true);
  assert.equal(r.code, 'correct');
  assert.equal(r.canonical, '2√5');
});

test('kunci bilangan bulat: √25 dan 5 sama-sama benar untuk kunci 5', () => {
  assert.equal(Val.checkExactAnswer('5', 5).correct, true);
  assert.equal(Val.checkExactAnswer('√25', 5).correct, true);
});

test('requireSimplest: √20 bernilai benar tetapi ditolak berkode not-simplest', () => {
  const r = Val.checkExactAnswer('√20', '2√5', { requireSimplest: true });
  assert.equal(r.correct, false);
  assert.equal(r.code, 'not-simplest');
  // Kalimat menyebut tulisan SISWA, tetapi TIDAK membocorkan bentuk
  // sederhananya — menyederhanakan adalah pekerjaan siswa (aksioma §1.1).
  assert.match(r.reason, /√20/);
  assert.doesNotMatch(r.reason, /2√5/);
});

test('tanda terbalik dikenali: -2√5 untuk kunci 2√5 berkode sign', () => {
  const r = Val.checkExactAnswer('-2√5', '2√5');
  assert.equal(r.correct, false);
  assert.equal(r.code, 'sign');
  assert.ok(r.reason.length > 0);
  assert.doesNotMatch(r.reason, /2√5/, 'kunci jawaban bocor di kalimat penolakan');
});

test('desimal pembulatan untuk kunci irasional ditolak berkode decimal', () => {
  const r = Val.checkExactAnswer('4,47', '2√5');
  assert.equal(r.correct, false);
  assert.equal(r.code, 'decimal');
  assert.match(r.reason, /akar/i);
  assert.doesNotMatch(r.reason, /2√5|√20/, 'kunci jawaban bocor di kalimat penolakan');
});

test('allowDecimal: 4,47 diterima untuk 2√5 dalam toleransi, 4,3 tetap salah', () => {
  assert.equal(Val.checkExactAnswer('4,47', '2√5', { allowDecimal: true }).correct, true);
  assert.equal(Val.checkExactAnswer(4.3, '2√5', { allowDecimal: true }).code, 'wrong');
});

test('desimal yang EKSAK untuk kunci rasional itu benar: 0,75 untuk 3/4', () => {
  assert.equal(Val.checkExactAnswer('0,75', '3/4').correct, true);
  assert.equal(Val.checkExactAnswer(0.75, S.fraction(3, 4)).correct, true);
});

test('isian kosong berkode empty — BUKAN dinilai sebagai nol', () => {
  for (const blank of ['', '   ', null, undefined]) {
    const r = Val.checkExactAnswer(blank, 0);
    assert.equal(r.correct, false, `"${blank}"`);
    assert.equal(r.code, 'empty');
  }
});

test('isian tak terbaca berkode unreadable; jawaban beda nilai berkode wrong', () => {
  assert.equal(Val.checkExactAnswer('2√', '2√5').code, 'unreadable');
  assert.equal(Val.checkExactAnswer('√21', '√20').code, 'wrong');
});

test('jumlah suku dinilai tanpa memedulikan urutan: √3 + √2 benar untuk √2 + √3', () => {
  assert.equal(Val.checkExactAnswer('√3 + √2', '√2 + √3').correct, true);
});

test('checkVectorAnswer: semua komponen benar, termasuk pecahan dari projVectorExact', () => {
  const key = V.projVectorExact(V.vec(2, 3), V.vec(1, 2));
  const r = Val.checkVectorAnswer(['8/5', '16/5'], key);
  assert.equal(r.correct, true);
  assert.deepEqual(r.wrongIndexes, []);
});

test('checkVectorAnswer menunjuk komponen yang salah lewat indeksnya', () => {
  const r = Val.checkVectorAnswer(['3', '5', '-1'], V.vec(3, 4, -1));
  assert.equal(r.correct, false);
  assert.deepEqual(r.wrongIndexes, [1]);
  assert.equal(r.results[1].code, 'wrong');
});

test('checkVectorAnswer menolak jumlah komponen yang tidak sesuai dimensi kunci', () => {
  const r = Val.checkVectorAnswer(['3', '4'], V.vec(3, 4, 0));
  assert.equal(r.correct, false);
  assert.equal(r.code, 'dimension');
  assert.match(r.reason, /3/);
});

test('validateNumberInput: kosong ditolak; akar hanya diterima bila allowSurd', () => {
  assert.equal(Val.validateNumberInput('').valid, false);
  assert.equal(Val.validateNumberInput('2√5').valid, false);
  const r = Val.validateNumberInput('2√5', { allowSurd: true });
  assert.equal(r.valid, true);
  assertSurd(r.value, 2, 1, 5);
  assert.equal(Val.validateNumberInput('-7').valid, true);
});

/* ============================================================
   4. Uji silang acak — eksak vs desimal, lewat jalur yang berbeda
   ============================================================ */
group('silang · 500 pasang vektor acak (benih tetap)');

/** PRNG mulberry32: hasil acak yang SAMA di setiap run — kegagalan bisa diulang. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomPairs(count) {
  const rand = rng(20260917);
  const int = () => Math.floor(rand() * 21) - 10;   // −10 … 10
  const pairs = [];
  while (pairs.length < count) {
    const three = rand() < 0.5;
    const u = three ? V.vec(int(), int(), int()) : V.vec(int(), int());
    const v = three ? V.vec(int(), int(), int()) : V.vec(int(), int());
    if (!V.isZero(u) && !V.isZero(v)) pairs.push([u, v]);
  }
  return pairs;
}

const PAIRS = randomPairs(500);

test('‖u‖ eksak = √(x² + y² + z²) yang dihitung langsung dengan Math', () => {
  for (const [u] of PAIRS) {
    const direct = Math.sqrt(u.x ** 2 + u.y ** 2 + u.z ** 2);
    assertClose(S.toNumber(V.normExact(u)), direct, 1e-9);
  }
});

test('cos θ eksak = u·v / (‖u‖‖v‖) desimal, dan tetap di [−1, 1]', () => {
  for (const [u, v] of PAIRS) {
    const exact = S.toNumber(V.cosAngleExact(u, v));
    assertClose(exact, V.cosAngle(u, v), 1e-9);
    assert.ok(exact >= -1 - 1e-12 && exact <= 1 + 1e-12);
  }
});

test('proyeksi skalar & vektor eksak = versi desimalnya; |proj skalar| = ‖proj vektor‖', () => {
  for (const [u, v] of PAIRS) {
    assertClose(S.toNumber(V.projScalarExact(u, v)), V.projScalar(u, v), 1e-9);
    const p = V.projVectorExact(u, v);
    const q = V.projVector(u, v);
    for (const key of ['x', 'y', 'z']) assertClose(p[key].n / p[key].d, q[key], 1e-9);
    assertClose(Math.abs(V.projScalar(u, v)), V.norm(q), 1e-9);
  }
});

test('vektor satuan eksak berpanjang tepat 1: Σ(komponen²) = 1 secara EKSAK', () => {
  for (const [u] of PAIRS) {
    const e = V.unitExact(u);
    const sumSquares = ['x', 'y', 'z']
      .map((k) => S.mulS(e[k], e[k]))
      .reduce((acc, s) => S.addS(acc, s), 0);
    assert.equal(S.equalsS(sumSquares, 1), true, `‖ê‖² ≠ 1 untuk ${V.toComponentText(u)}`);
  }
});

test('pulang-pergi teks: parseSurd(toText(x)) = x untuk panjang, cos θ, dan proyeksi', () => {
  for (const [u, v] of PAIRS) {
    for (const value of [V.normExact(u), V.cosAngleExact(u, v), V.projScalarExact(u, v)]) {
      assert.equal(S.equalsS(S.parseSurd(S.toText(value)), value), true, S.toText(value));
    }
  }
});

test('validator membenarkan jawaban kanonik dan setiap bentuk tak-sederhana yang setara', () => {
  for (const [u] of PAIRS) {
    const key = V.normExact(u);
    assert.equal(Val.checkExactAnswer(S.toText(key), key, { requireSimplest: true }).correct, true);
    const raw = `√${V.normSquared(u)}`;          // bentuk belum disederhanakan
    assert.equal(Val.checkExactAnswer(raw, key).correct, true, raw);
  }
});

/* ============================================================
   5. plane/planeGeometry.js — geometri layar bidang kartesius
   ============================================================ */
group('planeGeometry.js · pemetaan koordinat (kontrak 1 & 2)');

const VP = () => G.createViewport({ xRange: [-6, 6], yRange: [-4, 4], width: 640, height: 400, padding: 20 });

test('skala SERAGAM: satu satuan x = satu satuan y dalam piksel, memakai sisi yang lebih sempit', () => {
  const vp = VP();
  // lebar: (640 − 40) / 12 = 50 · tinggi: (400 − 40) / 8 = 45 → 45 px/satuan
  assert.equal(vp.scale, 45);
  const [x0] = vp.toScreen([0, 0]);
  const [x1] = vp.toScreen([1, 0]);
  const [, y0] = vp.toScreen([0, 0]);
  const [, y1] = vp.toScreen([0, 1]);
  assert.equal(x1 - x0, y0 - y1);
});

test('sumbu Y TERBALIK: (0, 3) di layar lebih ATAS (y lebih kecil) daripada (0, −3)', () => {
  const vp = VP();
  assert.ok(vp.toScreen([0, 3])[1] < vp.toScreen([0, -3])[1]);
  assert.ok(vp.toScreen([3, 0])[0] > vp.toScreen([-3, 0])[0]);
});

test('pusat rentang yang diminta jatuh tepat di pusat layar', () => {
  const vp = G.createViewport({ xRange: [-8, 10], yRange: [-5, 8], width: 500, height: 300, padding: 0 });
  assert.deepEqual(vp.toScreen([1, 1.5]), [250, 150]);
});

test('toMath membalik toScreen tepat (pulang-pergi) untuk titik bulat dan pecahan', () => {
  const vp = VP();
  for (const p of [[0, 0], [3, -2], [-6, 4], [2.5, -0.75]]) {
    const back = vp.toMath(vp.toScreen(p));
    assertClose(back[0], p[0], 1e-12);
    assertClose(back[1], p[1], 1e-12);
  }
});

test('45° matematis tetap 45° di layar pada wadah yang sangat lebar maupun tinggi', () => {
  for (const [width, height] of [[1200, 300], [300, 900], [737, 361]]) {
    const vp = G.createViewport({ xRange: [-6, 6], yRange: [-4, 4], width, height, padding: 12 });
    const [ax, ay] = vp.toScreen([0, 0]);
    const [bx, by] = vp.toScreen([3, 3]);
    assertClose((Math.atan2(ay - by, bx - ax) * 180) / Math.PI, 45, 1e-9);
  }
});

test('rentang terlihat selalu MEMUAT rentang yang diminta, dan melebar mengisi sisa ruang', () => {
  const vp = VP();
  assert.ok(vp.xMin <= -6 && vp.xMax >= 6 && vp.yMin <= -4 && vp.yMax >= 4);
  assertClose(vp.toScreen([vp.xMin, 0])[0], 0, 1e-9);
  assertClose(vp.toScreen([vp.xMax, 0])[0], 640, 1e-9);
  assertClose(vp.toScreen([0, vp.yMax])[1], 0, 1e-9);
});

test('ukuran wadah tidak valid ditolak dengan RangeError (bukan skala NaN/negatif)', () => {
  assert.throws(() => G.createViewport({ xRange: [-6, 6], yRange: [-4, 4], width: 30, height: 400, padding: 20 }), RangeError);
  assert.throws(() => G.createViewport({ xRange: [6, -6], yRange: [-4, 4], width: 600, height: 400 }), RangeError);
});

test('toPlanePoint menerima [x, y] dan vec(), menolak vektor ruang ber-z bukan nol', () => {
  assert.deepEqual(G.toPlanePoint([2, -1]), [2, -1]);
  assert.deepEqual(G.toPlanePoint(V.vec(2, -1)), [2, -1]);
  assert.deepEqual(G.toPlanePoint(V.vec(2, -1, 0)), [2, -1]);
  assert.throws(() => G.toPlanePoint(V.vec(1, 2, 3)), TypeError);
  assert.throws(() => G.toPlanePoint([1, Number.NaN]), TypeError);
});

group('planeGeometry.js · kisi, panah, busur, label');

test('tickStep memilih 1-2-5 terkecil yang tidak berdesakan', () => {
  assert.equal(G.tickStep(45, 24), 1);
  assert.equal(G.tickStep(15, 24), 2);
  assert.equal(G.tickStep(6, 24), 5);
  assert.equal(G.tickStep(2, 24), 20);
});

test('gridValues: kelipatan langkah di dalam rentang, tanpa −0', () => {
  assert.deepEqual(G.gridValues(-2.5, 3.2, 1), [-2, -1, 0, 1, 2, 3]);
  assert.deepEqual(G.gridValues(-7, 7, 5), [-5, 0, 5]);
  assert.ok(G.gridValues(-1, 1, 1).every((v) => !Object.is(v, -0)));
});

test('arrowShaft memendekkan batang sepanjang kepala: ujung panah jatuh TEPAT di titik', () => {
  const shaft = G.arrowShaft([0, 0], [100, 0], 12);
  assert.deepEqual(shaft.end, [88, 0]);
  assert.equal(shaft.degenerate, false);
  const diag = G.arrowShaft([10, 10], [40, 50], 10);   // panjang 50
  assertClose(diag.end[0], 34, 1e-9);
  assertClose(diag.end[1], 42, 1e-9);
});

test('arrowShaft: panah lebih pendek dari kepalanya tetap berarah, vektor nol ditandai degenerate', () => {
  const tiny = G.arrowShaft([0, 0], [5, 0], 12);
  assert.equal(tiny.degenerate, false);
  assert.ok(tiny.end[0] > 0 && tiny.end[0] < 5, 'arah batang hilang');
  assert.equal(G.arrowShaft([7, 7], [7, 7], 12).degenerate, true);
});

test('arcPoints: semua titik berjari-jari sama dan menyapu sudut KECIL di antara dua vektor', () => {
  const vp = VP();
  const { points, labelAt } = G.arcPoints(vp, [0, 0], [1, 0], [0, 1], 30, 12);
  const [ox, oy] = vp.toScreen([0, 0]);
  for (const [px, py] of points) assertClose(Math.hypot(px - ox, py - oy), 30, 1e-9);
  assertClose(points[0][1], oy, 1e-9);                 // mulai di arah u (kanan)
  assertClose(points[points.length - 1][0], ox, 1e-9); // berakhir di arah v (atas)
  assert.ok(points.every(([, py]) => py <= oy + 1e-9), 'busur menyapu ke bawah (sudut refleks)');
  assert.ok(labelAt[0] > ox && labelAt[1] < oy, 'label tidak di garis bagi sudut');
});

test('arcPoints memilih sisi yang benar untuk 135°: dari (1, 0) ke (−1, 1) lewat atas', () => {
  const vp = VP();
  const [, oy] = vp.toScreen([0, 0]);
  const { points } = G.arcPoints(vp, [0, 0], [1, 0], [-1, 1], 30, 16);
  assert.ok(points.every(([, py]) => py <= oy + 1e-9));
});

test('arcPoints tidak pernah menyapu sudut refleks: (0, −1) ke (−1, 1) = 135° lewat KIRI', () => {
  // Regresi dari uji mutasi: selisih atan2 mentah di sini 225°. Tanpa
  // normalisasi, busurnya memutar lewat kanan dan menandai sudut yang salah.
  const vp = VP();
  const [ox, oy] = vp.toScreen([0, 0]);
  const { points } = G.arcPoints(vp, [0, 0], [0, -1], [-1, 1], 30, 24);
  assert.ok(points.every(([px]) => px <= ox + 1e-9), 'busur lewat sisi kanan');
  const first = Math.atan2(oy - points[0][1], points[0][0] - ox);
  const last = Math.atan2(oy - points[24][1], points[24][0] - ox);
  let sweep = Math.abs(last - first);
  if (sweep > Math.PI) sweep = 2 * Math.PI - sweep;
  assertClose((sweep * 180) / Math.PI, 135, 1e-9);
});

test('rightAngleMarker membentuk persegi siku di pangkal untuk vektor tegak lurus', () => {
  const vp = VP();
  const [p1, corner, p2] = G.rightAngleMarker(vp, [0, 0], [3, 4], [-4, 3], 10);
  const [ox, oy] = vp.toScreen([0, 0]);
  assertClose(Math.hypot(p1[0] - ox, p1[1] - oy), 10, 1e-9);
  assertClose(Math.hypot(p2[0] - ox, p2[1] - oy), 10, 1e-9);
  assertClose(Math.hypot(corner[0] - ox, corner[1] - oy), 10 * Math.SQRT2, 1e-9);
});

test('labelAnchor: di tengah panah, bergeser tegak lurus ke kiri arah panah', () => {
  assert.deepEqual(G.labelAnchor([0, 100], [100, 100], 14), [50, 86]);   // mendatar → di atas
  assert.deepEqual(G.labelAnchor([50, 100], [50, 0], 14), [36, 50]);     // naik → di kiri
  assert.deepEqual(G.labelAnchor([5, 5], [5, 5], 14), [5, -9]);          // nol → di atas
});

test('fmt menulis atribut SVG ringkas tanpa −0 dan tanpa NaN diam-diam', () => {
  assert.equal(G.fmt(12.3456), '12.35');
  assert.equal(G.fmt(-0.0001), '0');
  assert.equal(G.fmt(40), '40');
  assert.throws(() => G.fmt(Number.NaN), TypeError);
});

test('snapPoint membulatkan ke kisi dan menjepit ke dalam rentang terlihat', () => {
  const vp = VP();
  assert.deepEqual(G.snapPoint([2.4, -1.6], vp), [2, -2]);
  const far = G.snapPoint([99, -99], vp);
  assert.ok(far[0] <= vp.xMax && far[1] >= vp.yMin);
  assert.ok(Number.isInteger(far[0]) && Number.isInteger(far[1]));
});

test('domain/*.js tidak menyebut document, window, atau DOM sama sekali', async () => {
  const { readFileSync } = await import('node:fs');
  for (const file of ['surd.js', 'vector.js', 'validator.js', 'plane/planeGeometry.js']) {
    const src = readFileSync(new URL(`../js/domain/${file}`, import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(src, /\b(document|window|HTMLElement|querySelector|classList)\b/, file);
  }
});

/* ------------------------------------------------------------
   Ringkasan
   ------------------------------------------------------------ */
let passed = 0;
const failures = [];
for (const item of queue) {
  if (item.kind === 'group') {
    console.log(`\n${item.name}`);
    continue;
  }
  try {
    await item.fn();
    passed += 1;
    console.log(`  ✓ ${item.name}`);
  } catch (err) {
    failures.push({ group: item.group, name: item.name, err });
    console.log(`  ✗ ${item.name}\n      ${String(err && err.message).split('\n')[0]}`);
  }
}

const total = passed + failures.length;
console.log(`\n${passed}/${total} lolos`);
if (failures.length) {
  console.log(`${failures.length} GAGAL:`);
  for (const f of failures) console.log(`  - [${f.group}] ${f.name}`);
  process.exitCode = 1;
}
