/**
 * lesson/simulations/simProducts.js — Engine simulasi Bab 3: Perkalian & Proyeksi.
 *
 *   dot_builder             Pasangkan, kalikan, jumlahkan
 *   product_property_cards  Sifat yang berlaku dan yang tidak
 *   angle_solver            Tiga tahap, tiga isian — busur tanpa angka
 *   perpendicular_check     Nol yang menentukan
 *   scalar_projection       Pilih alasnya dulu
 *   vector_projection       Panjang bayangan × arah alas
 *
 * Busur sudut, penanda siku, garis jatuh, dan panah bayangan adalah
 * JAWABAN yang digambar. Semuanya hanya muncul di `onSolved`.
 */

import { CaseSimulation, tex, texNum, texColumn, texTuple, same, givenBlock, AXES, pairBoard, pairStep } from './simKit.js';
import * as S from '../../domain/surd.js';
import * as V from '../../domain/vector.js';
import * as Val from '../../domain/validator.js';

const is2D = (arr) => Array.isArray(arr) && arr.length === 2 && arr.every((n) => typeof n === 'number');
const dot = (p, q) => p.reduce((acc, n, i) => acc + n * q[i], 0);
const normSq = (p) => dot(p, p);

function componentFields(dim, { prefix = 'c', mode = 'fraction' } = {}) {
  return AXES.slice(0, dim).map((axis) => ({ key: `${prefix}${axis}`, label: `$${axis}$`, mode, aria: `Komponen ${axis}` }));
}

function componentValues(values, dim, prefix = 'c') {
  return AXES.slice(0, dim).map((axis) => values[`${prefix}${axis}`].value);
}

/** Pemeriksa isian bentuk eksak: kalimat validator TIDAK PERNAH memuat kunci. */
function exactCheck(raw, key, extra) {
  const verdict = Val.checkExactAnswer(raw, key);
  if (verdict.correct) return true;
  // Desimal pembulatan lebih dulu: kalimat khusus engine ("kuadratkan
  // komponennya…") salah alamat untuk siswa yang hitungannya benar tetapi
  // menulis 1,41 alih-alih √2. Tanda terbalik TIDAK didahulukan — engine
  // proyeksi punya kalimat yang lebih tajam untuk itu (tandaDibuang).
  if (verdict.code === 'decimal') return { message: verdict.reason };
  const special = extra ? extra(S.parseSurd(raw)) : null;
  return special || { message: verdict.reason };
}

/* ============================================================
   15. dot_builder — Pasangkan, Kalikan, Jumlahkan
   ============================================================ */
export class DotBuilderSim extends CaseSimulation {
  usesPlane() {
    return false;
  }

  caseLabel(c) {
    return `$\\vec{${c.name[0]}} \\cdot \\vec{${c.name[1]}}$`;
  }

  setupCase(c) {
    this.pair = pairBoard(`\\vec{${c.name[0]}}`, c.u, '\\cdot', `\\vec{${c.name[1]}}`, c.v);
    this.givenEl.appendChild(this.pair.root);
  }

  buildSteps(c) {
    const products = c.u.map((n, i) => n * c.v[i]);
    const total = products.reduce((a, b) => a + b, 0);
    const steps = [];
    c.u.forEach((n, i) => {
      steps.push(pairStep({
        board: this.pair,
        index: i,
        label: `Pasangan ${AXES[i]}`,
        prompt: `Komponen ke-${i + 1} dari $\\vec{${c.name[0]}}$ sudah terpilih. Ketuk **pasangannya** di $\\vec{${c.name[1]}}$.`,
        wrong: () => ({ toast: 'komponenTidakSeletak', values: { indeks: i + 1 } }),
      }));
      steps.push({
        kind: 'fields',
        label: `Kalikan ${AXES[i]}`,
        prompt: `Kalikan pasangan ke-${i + 1}.`,
        fields: [{ key: `p${AXES[i]}`, label: `$(${n})(${c.v[i]}) =$`, mode: 'integer' }],
        check: (values) => {
          const s = values[`p${AXES[i]}`].value;
          if (same(s, products[i])) return true;
          if (same(s, n + c.v[i]) && n + c.v[i] !== products[i]) return { toast: 'menjumlahBukanMengali' };
          if (products[i] !== 0 && same(s, -products[i])) return { toast: 'lupaTandaNegatif', values: { a: n, b: c.v[i] } };
          return { message: `Belum tepat — kalikan $(${n})$ dengan $(${c.v[i]})$, bawa tandanya.` };
        },
        summary: () => `$(${n})(${c.v[i]}) = ${products[i]}$`,
      });
    });
    steps.push({
      kind: 'fields',
      label: 'Jumlahkan',
      prompt: 'Semua pasangan sudah dikalikan. Jumlahkan **seluruh** hasil kalinya.',
      fields: [{ key: 'total', label: `$${products.map((p) => `(${p})`).join(' + ')} =$`, mode: 'integer' }],
      check: (values) => same(values.total.value, total) || { toast: 'hasilSalah' },
      summary: () => `$\\vec{${c.name[0]}} \\cdot \\vec{${c.name[1]}} = ${total}$`,
    });
    return steps;
  }
}

/* ============================================================
   16. product_property_cards — Sifat yang Berlaku dan yang Tidak
   ============================================================ */
const CLAIMS = {
  komutatif: { title: 'Komutatif', tex: '\\vec{a}\\cdot\\vec{b} = \\vec{b}\\cdot\\vec{a}' },
  distributif: { title: 'Distributif', tex: '\\vec{a}\\cdot(\\vec{b}+\\vec{c}) = \\vec{a}\\cdot\\vec{b} + \\vec{a}\\cdot\\vec{c}' },
  asosiatif_titik: { title: 'Asosiatif?', tex: '(\\vec{a}\\cdot\\vec{b})\\cdot\\vec{c} = \\vec{a}\\cdot(\\vec{b}\\cdot\\vec{c})' },
  kuadrat_norma: { title: 'Kuadrat norma', tex: '\\vec{a}\\cdot\\vec{a} = |\\vec{a}|^2' },
  pencoretan: { title: 'Pencoretan?', tex: '\\vec{a}\\cdot\\vec{b} = \\vec{a}\\cdot\\vec{c} \\;\\Rightarrow\\; \\vec{b} = \\vec{c}' },
};

export class ProductPropertyCardsSim extends CaseSimulation {
  get cases() {
    return this.config.cards || [];
  }

  usesPlane() {
    return false;
  }

  caseLabel(card) {
    return (CLAIMS[card.claim] || { title: card.claim }).title;
  }

  setupCase(card) {
    const claim = CLAIMS[card.claim];
    this.givenEl.appendChild(givenBlock(`Pernyataan: ${tex(claim.tex)}`, 'sim-given--display'));
    const data = card.check || card.counter;
    if (data) {
      const parts = Object.entries(data).map(([name, v]) => `\\vec{${name}} = ${texColumn(v)}`);
      this.givenEl.appendChild(givenBlock(tex(parts.join(',\\quad ')), 'sim-given--display'));
    }
  }

  /** Dua ruas yang harus DIHITUNG siswa sebelum keputusannya diterima. */
  sides(card) {
    const d = card.check || card.counter || {};
    switch (card.claim) {
      case 'komutatif': return [['$\\vec{a}\\cdot\\vec{b} =$', dot(d.a, d.b)], ['$\\vec{b}\\cdot\\vec{a} =$', dot(d.b, d.a)]];
      case 'distributif': return [['$\\vec{a}\\cdot(\\vec{b}+\\vec{c}) =$', dot(d.a, d.b.map((n, i) => n + d.c[i]))], ['$\\vec{a}\\cdot\\vec{b} + \\vec{a}\\cdot\\vec{c} =$', dot(d.a, d.b) + dot(d.a, d.c)]];
      case 'kuadrat_norma': return [['$\\vec{a}\\cdot\\vec{a} =$', dot(d.a, d.a)], ['$|\\vec{a}|^2 =$', normSq(d.a)]];
      case 'pencoretan': return [['$\\vec{a}\\cdot\\vec{b} =$', dot(d.a, d.b)], ['$\\vec{a}\\cdot\\vec{c} =$', dot(d.a, d.c)]];
      default: return null;
    }
  }

  buildSteps(card) {
    if (card.claim === 'asosiatif_titik') {
      return [{
        kind: 'choice',
        label: 'Putuskan',
        prompt: 'Coba baca ruas kirinya dari dalam kurung. Apakah pernyataan ini berlaku?',
        options: [
          { key: 'valid', label: 'Berlaku — kedua ruas selalu sama' },
          { key: 'different', label: 'Tidak berlaku — nilainya bisa berbeda' },
          { key: 'undefined', label: 'Tidak bermakna — $\\vec{a}\\cdot\\vec{b}$ sebuah bilangan, tidak bisa di-titik-kan dengan $\\vec{c}$' },
        ],
        check: (key) => key === 'undefined' || { toast: 'asosiatifSalah' },
      }];
    }

    const sides = this.sides(card);
    const steps = [{
      kind: 'fields',
      label: 'Hitung kedua ruas',
      prompt: 'Buktikan dulu dengan angka: hitung **kedua ruas** memakai vektor yang tersedia.',
      fields: sides.map(([label], i) => ({ key: `s${i}`, label, mode: 'integer' })),
      check: (values) => {
        const wrong = sides.map(([, key], i) => (same(values[`s${i}`].value, key) ? null : `s${i}`)).filter(Boolean);
        if (!wrong.length) return true;
        const left = S.toText(values.s0.value);
        const right = S.toText(values.s1.value);
        if (card.valid && left !== right) return { toast: 'keduaRuasBeda', values: { kiri: left, kanan: right }, wrong };
        return { message: 'Belum tepat — hitung ulang ruas yang ditandai merah: pasangkan komponen seletak, kalikan, jumlahkan.', wrong };
      },
      summary: () => sides.map(([label, key]) => `${label.replace(/=\$$/, '= ')}${key}$`).join(' · '),
    }];

    steps.push({
      kind: 'choice',
      label: 'Putuskan',
      prompt: card.claim === 'pencoretan'
        ? 'Kedua hasil kali titiknya sudah kamu hitung. Apakah itu berarti $\\vec{b} = \\vec{c}$?'
        : 'Berdasarkan hitunganmu, apakah pernyataan ini berlaku?',
      options: card.claim === 'pencoretan'
        ? [
          { key: 'valid', label: 'Ya — $\\vec{a}$ bisa "dicoret" dari kedua ruas' },
          { key: 'invalid', label: 'Tidak — hasil kali titiknya sama, tetapi $\\vec{b} \\neq \\vec{c}$' },
        ]
        : [
          { key: 'valid', label: 'Berlaku' },
          { key: 'invalid', label: 'Tidak berlaku' },
        ],
      check: (key) => {
        const expected = card.valid ? 'valid' : 'invalid';
        if (key === expected) return true;
        if (card.claim === 'pencoretan') return { toast: 'pencoretanSalah' };
        return { message: 'Belum tepat — perhatikan hitunganmu sendiri: kedua ruasnya bernilai **sama**. Sifat ini berlaku karena perkalian bilangan di setiap komponen memang berlaku demikian.' };
      },
    });
    return steps;
  }
}

/* ============================================================
   17. angle_solver — Tiga Tahap, Tiga Isian
   ============================================================ */
const SPECIAL_ANGLES = '$0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ, 120^\\circ, 135^\\circ, 150^\\circ, 180^\\circ$';

export class AngleSolverSim extends CaseSimulation {
  usesPlane(c) {
    return is2D(c.u);
  }

  caseLabel(c, i) {
    return `Pasangan ${i + 1}`;
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`\\vec{a} = ${texColumn(c.u)},\\quad \\vec{b} = ${texColumn(c.v)}`), 'sim-given--display'));
    this.arc = null;
    if (this.plane) {
      this.drawVector({ to: c.u, name: 'a' }, { essential: true });
      this.drawVector({ to: c.v, name: 'b', tone: 'cyan' }, { essential: true });
      // Busur TANPA angka dan TANPA penanda siku: keduanya adalah jawaban.
      this.arc = this.plane.drawAngleArc(c.u, c.v, { label: null, rightMarker: false });
    }
  }

  buildSteps(c) {
    const u = V.fromArray(c.u);
    const v = V.fromArray(c.v);
    const d = V.dot(u, v);
    const nu = V.normExact(u);
    const nv = V.normExact(v);
    const cos = V.cosAngleExact(u, v);

    const lengthStep = (name, key) => ({
      kind: 'fields',
      label: `$|\\vec{${name}}|$`,
      prompt: `Tahap 2: panjang $\\vec{${name}}$, dalam bentuk akar eksak.`,
      fields: [{ key: `n${name}`, label: `$|\\vec{${name}}| =$`, mode: 'surd' }],
      check: (values) => exactCheck(values[`n${name}`].raw, key, () => ({ toast: 'panjangSalah', values: { nama: name } })),
      summary: () => `$|\\vec{${name}}| = ${S.toLatexS(key)}$`,
    });

    return [
      {
        kind: 'fields',
        label: 'Pembilang $\\vec{a}\\cdot\\vec{b}$',
        prompt: 'Tahap 1: pembilang rumus $\\cos\\theta$ adalah $\\vec{a}\\cdot\\vec{b}$.',
        fields: [{ key: 'dot', label: '$\\vec{a}\\cdot\\vec{b} =$', mode: 'integer' }],
        check: (values) => same(values.dot.value, d) || { message: 'Belum tepat — pasangkan komponen seletak, kalikan, lalu jumlahkan.' },
        summary: () => `$\\vec{a}\\cdot\\vec{b} = ${d}$`,
      },
      lengthStep('a', nu),
      lengthStep('b', nv),
      {
        kind: 'fields',
        label: '$\\cos\\theta$',
        prompt: 'Tahap 3: $\\cos\\theta = \\dfrac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|\\,|\\vec{b}|}$. Tulis dalam bentuk eksak yang dirasionalkan.',
        fields: [{ key: 'cos', label: '$\\cos\\theta =$', mode: 'surd' }],
        check: (values) => exactCheck(values.cos.raw, cos, (student) => {
          if (!student) return null;
          const value = S.toNumber(student);
          if (Math.abs(value) > 1 + 1e-9) return { toast: 'cosDiLuarRentang', values: { nilai: S.toLatexS(student) } };
          // Numerik, bukan divS: |a| + |b| bisa berupa JUMLAH akar (√2 + 1),
          // dan pembagian oleh jumlah suku sengaja tidak didukung surd.js.
          const summed = d / (S.toNumber(nu) + S.toNumber(nv));
          if (Math.abs(value - summed) < 1e-9 && Math.abs(summed - S.toNumber(cos)) > 1e-9) return { toast: 'lupaKalikanPanjang' };
          return null;
        }),
        summary: () => `$\\cos\\theta = ${S.toLatexS(cos)}$`,
      },
      {
        kind: 'fields',
        label: 'Sudut $\\theta$',
        prompt: `Sudut mana yang kosinusnya bernilai itu? Pilih dari sudut istimewa ${SPECIAL_ANGLES}.`,
        fields: [{ key: 'deg', label: '$\\theta =$', suffix: '$^\\circ$', mode: 'integer' }],
        check: (values) => same(values.deg.value, c.expectDeg) || { message: `Belum tepat — cocokkan nilai $\\cos\\theta$ dari tahap sebelumnya dengan tabel sudut istimewa. Ingat: kosinus **negatif** berarti sudutnya **tumpul**.` },
        summary: () => `$\\theta = ${c.expectDeg}^\\circ$`,
        onSolved: () => {
          if (this.arc) this.arc.setLabel(`\\theta = ${c.expectDeg}^\\circ`);
        },
      },
    ];
  }
}

/* ============================================================
   18. perpendicular_check — Nol yang Menentukan
   ============================================================ */
export class PerpendicularCheckSim extends CaseSimulation {
  usesPlane(c) {
    return is2D(c.a) && is2D(c.b);
  }

  caseLabel(c, i) {
    if (c.solveK !== undefined) return 'Cari $k$';
    if (c.isZero) return 'Vektor nol';
    return `Pasangan ${i + 1}`;
  }

  setupCase(c) {
    const show = (arr) => `\\begin{pmatrix} ${arr.join(' \\\\ ')} \\end{pmatrix}`;
    this.givenEl.appendChild(givenBlock(tex(`\\vec{a} = ${show(c.a)},\\quad \\vec{b} = ${show(c.b)}`), 'sim-given--display'));
    if (this.plane) {
      this.drawVector({ to: c.a, name: 'a' }, { essential: true });
      this.drawVector({ to: c.b, name: 'b', tone: 'cyan' }, { essential: true });
    }
  }

  buildSteps(c) {
    if (c.solveK !== undefined) {
      const kIndex = c.a.indexOf('k');
      const constant = c.a.reduce((acc, n, i) => (i === kIndex ? acc : acc + n * c.b[i]), 0);
      const coefficient = c.b[kIndex];
      return [
        {
          kind: 'fields',
          label: 'Susun $\\vec{a}\\cdot\\vec{b}$',
          prompt: 'Susun $\\vec{a}\\cdot\\vec{b}$ dengan $k$ di dalamnya: kumpulkan suku konstanta dan koefisien $k$.',
          fields: [
            { key: 'const', label: '$\\vec{a}\\cdot\\vec{b} =$', mode: 'integer' },
            { key: 'coef', label: '$+$', suffix: '$k$', mode: 'integer' },
          ],
          check: (values) => {
            const wrong = [];
            if (!same(values.const.value, constant)) wrong.push('const');
            if (!same(values.coef.value, coefficient)) wrong.push('coef');
            return wrong.length === 0 || { message: 'Belum tepat — kalikan komponen seletak. Suku yang memuat $k$ menyumbang koefisien $k$; suku lainnya dijumlahkan menjadi satu konstanta.', wrong };
          },
          summary: () => `$\\vec{a}\\cdot\\vec{b} = ${constant} ${coefficient < 0 ? '-' : '+'} ${Math.abs(coefficient) === 1 ? '' : Math.abs(coefficient)}k$`,
        },
        {
          kind: 'fields',
          label: 'Samakan dengan nol',
          prompt: 'Tegak lurus berarti $\\vec{a}\\cdot\\vec{b} = 0$. Selesaikan untuk $k$.',
          fields: [{ key: 'k', label: '$k =$', mode: 'fraction' }],
          check: (values) => {
            if (same(values.k.value, c.solveK)) return true;
            if (same(values.k.value, constant)) return { toast: 'lupaSamakanNol' };
            return { toast: 'kSalah' };
          },
          summary: () => `$k = ${c.solveK}$`,
        },
      ];
    }

    const d = dot(c.a, c.b);
    const steps = [{
      kind: 'fields',
      label: 'Hitung $\\vec{a}\\cdot\\vec{b}$',
      prompt: 'Hitung $\\vec{a}\\cdot\\vec{b}$ lebih dulu — gambar yang tampak siku-siku belum tentu siku-siku.',
      fields: [{ key: 'dot', label: '$\\vec{a}\\cdot\\vec{b} =$', mode: 'integer' }],
      check: (values) => same(values.dot.value, d) || { message: 'Belum tepat — pasangkan komponen seletak, kalikan, lalu jumlahkan.' },
      summary: () => `$\\vec{a}\\cdot\\vec{b} = ${d}$`,
    }];

    if (c.isZero) {
      steps.push({
        kind: 'choice',
        label: 'Putuskan',
        prompt: 'Hasilnya nol. Apakah $\\vec{a}$ dan $\\vec{b}$ tegak lurus?',
        options: [
          { key: 'yes', label: 'Ya — hasil kali titiknya nol' },
          { key: 'undetermined', label: 'Tidak bisa disimpulkan — $\\vec{a}$ vektor nol, tidak punya arah' },
        ],
        check: (key) => key === 'undetermined' || { toast: 'vektorNol' },
      });
      return steps;
    }

    steps.push({
      kind: 'choice',
      label: 'Putuskan',
      prompt: 'Berdasarkan hasil kali titiknya, apakah kedua vektor tegak lurus?',
      options: [
        { key: 'yes', label: 'Ya, tegak lurus' },
        { key: 'no', label: 'Tidak tegak lurus' },
      ],
      check: (key) => {
        if (c.perp) return key === 'yes' || { message: 'Belum tepat — hasil kali titiknya **nol**, dan kedua vektornya tak-nol. Itulah syarat tegak lurus.' };
        return key === 'no' || { toast: 'bukanNol', values: { nilai: d } };
      },
      onSolved: () => {
        if (this.plane && c.perp) this.plane.drawAngleArc(c.a, c.b);
      },
    });
    return steps;
  }
}

/* ============================================================
   19. scalar_projection — Pilih Alasnya Dulu
   ============================================================ */
export class ScalarProjectionSim extends CaseSimulation {
  usesPlane(c) {
    return is2D(c.a);
  }

  caseLabel(c) {
    const other = c.onto === 'a' ? 'b' : 'a';
    return `$\\vec{${other}}$ pada $\\vec{${c.onto}}$`;
  }

  setupCase(c) {
    const other = c.onto === 'a' ? 'b' : 'a';
    this.givenEl.appendChild(givenBlock(tex(`\\vec{a} = ${texColumn(c.a)},\\quad \\vec{b} = ${texColumn(c.b)}`), 'sim-given--display'));
    // `givenBlock` menerima HTML apa adanya: penekanan ditulis <strong>,
    // bukan markdown — tanda bintangnya akan terbaca mentah oleh siswa.
    this.givenEl.appendChild(givenBlock(`Tentukan proyeksi skalar ${tex(`\\vec{${other}}`)} <strong>pada</strong> ${tex(`\\vec{${c.onto}}`)}.`));
    this.arrows = {};
    if (this.plane) {
      this.arrows.a = this.drawVector({ to: c.a, name: 'a' }, { essential: true });
      this.arrows.b = this.drawVector({ to: c.b, name: 'b', tone: 'cyan' }, { essential: true });
    }
  }

  buildSteps(c) {
    const other = c.onto === 'a' ? 'b' : 'a';
    const base = c[c.onto];
    const shadowed = c[other];
    const d = dot(c.a, c.b);
    const baseLength = S.fromSquare(normSq(base));
    const result = S.divS(d, baseLength);

    const pick = (key) => key === c.onto || { toast: 'alasTerbalik', values: { yang: other, alas: c.onto } };
    const pickStep = this.plane
      ? {
        kind: 'tap',
        label: 'Pilih alas',
        prompt: 'Kata **"pada"** menunjuk alasnya. Ketuk vektor yang menjadi **alas**.',
        targets: () => [
          { key: 'a', arrow: this.arrows.a, label: 'Vektor a' },
          { key: 'b', arrow: this.arrows.b, label: 'Vektor b' },
        ],
        check: pick,
        onSolved: () => this.plane.drawProjection(shadowed, base),
      }
      : {
        kind: 'choice',
        label: 'Pilih alas',
        prompt: 'Kata **"pada"** menunjuk alasnya. Vektor mana yang menjadi **alas**?',
        options: [{ key: 'a', label: '$\\vec{a}$' }, { key: 'b', label: '$\\vec{b}$' }],
        check: pick,
      };

    return [
      pickStep,
      {
        kind: 'fields',
        label: '$\\vec{a}\\cdot\\vec{b}$',
        prompt: 'Hitung $\\vec{a}\\cdot\\vec{b}$.',
        fields: [{ key: 'dot', label: '$\\vec{a}\\cdot\\vec{b} =$', mode: 'integer' }],
        check: (values) => same(values.dot.value, d) || { toast: 'hasilSalah' },
        summary: () => `$\\vec{a}\\cdot\\vec{b} = ${d}$`,
      },
      {
        kind: 'fields',
        label: `$|\\vec{${c.onto}}|$`,
        prompt: `Hitung panjang alasnya, $|\\vec{${c.onto}}|$.`,
        fields: [{ key: 'len', label: `$|\\vec{${c.onto}}| =$`, mode: 'surd' }],
        check: (values) => exactCheck(values.len.raw, baseLength),
        summary: () => `$|\\vec{${c.onto}}| = ${S.toLatexS(baseLength)}$`,
      },
      {
        kind: 'fields',
        label: 'Proyeksi skalar',
        prompt: `Bagi: proyeksi skalar $= \\dfrac{\\vec{a}\\cdot\\vec{b}}{|\\vec{${c.onto}}|}$. Rasionalkan bila perlu.`,
        fields: [{ key: 'proj', label: 'Proyeksi skalar $=$', mode: 'surd' }],
        check: (values) => exactCheck(values.proj.raw, result, (student) => {
          if (!student) return null;
          if (same(student, S.fraction(d, normSq(base)))) return { toast: 'penyebutKuadrat' };
          if (!S.isZeroS(result) && same(student, S.negS(result))) return { toast: 'tandaDibuang' };
          return { toast: 'hasilSalah' };
        }),
        summary: () => `Proyeksi skalar $= ${S.toLatexS(result)}$`,
        onSolved: () => {
          if (!this.plane) return null;
          const shadow = V.projVector(V.fromArray(shadowed), V.fromArray(base));
          return this.drawVector({ to: [0, 0], name: 'p', label: null, tone: 'amber' }).setVector({ to: [shadow.x, shadow.y] }, { animate: true, duration: 420 });
        },
      },
    ];
  }
}

/* ============================================================
   20. vector_projection — Panjang Bayangan × Arah Alas
   ============================================================ */
export class VectorProjectionSim extends CaseSimulation {
  usesPlane(c) {
    return is2D(c.a);
  }

  caseLabel(c, i) {
    return c.isZeroBase ? 'Alas nol' : `Pasangan ${i + 1}`;
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`\\vec{a} = ${texColumn(c.a)},\\quad \\vec{b} = ${texColumn(c.b)}`), 'sim-given--display'));
    this.givenEl.appendChild(givenBlock(`Tentukan vektor proyeksi ${tex('\\vec{a}')} pada ${tex('\\vec{b}')}.`));
    if (this.plane) {
      this.drawVector({ to: c.a, name: 'a' }, { essential: true });
      this.drawVector({ to: c.b, name: 'b', tone: 'cyan' }, { essential: true });
    }
  }

  buildSteps(c) {
    const bb = normSq(c.b);
    const bbStep = {
      kind: 'fields',
      label: '$|\\vec{b}|^2$',
      prompt: 'Hitung $|\\vec{b}|^2$ — jumlah kuadrat komponennya, **tanpa** diakarkan.',
      fields: [{ key: 'bb', label: '$|\\vec{b}|^2 =$', mode: 'surd' }],
      check: (values) => {
        if (same(values.bb.value, bb)) return true;
        if (same(values.bb.value, S.fromSquare(bb))) return { toast: 'diakarkanDulu' };
        return { message: 'Belum tepat — kuadratkan setiap komponen $\\vec{b}$, lalu jumlahkan.' };
      },
      summary: () => `$|\\vec{b}|^2 = ${bb}$`,
    };

    if (c.isZeroBase) {
      return [
        bbStep,
        {
          kind: 'choice',
          label: 'Hasil proyeksi',
          prompt: 'Penyebut rumusnya $|\\vec{b}|^2$. Jadi, apa vektor proyeksi $\\vec{a}$ pada $\\vec{b}$?',
          options: [
            { key: 'zero', label: '$(0, 0)$' },
            { key: 'undefined', label: 'Tidak terdefinisi' },
          ],
          check: (key) => key === 'undefined' || { toast: 'alasNol' },
        },
      ];
    }

    const d = dot(c.a, c.b);
    const scalar = S.fraction(d, bb);
    const proj = c.b.map((n) => S.mulS(scalar, n));
    const dim = c.b.length;
    return [
      {
        kind: 'fields',
        label: '$\\vec{a}\\cdot\\vec{b}$',
        prompt: 'Hitung $\\vec{a}\\cdot\\vec{b}$.',
        fields: [{ key: 'dot', label: '$\\vec{a}\\cdot\\vec{b} =$', mode: 'integer' }],
        check: (values) => same(values.dot.value, d) || { message: 'Belum tepat — pasangkan komponen seletak, kalikan, lalu jumlahkan.' },
        summary: () => `$\\vec{a}\\cdot\\vec{b} = ${d}$`,
      },
      bbStep,
      {
        kind: 'fields',
        label: 'Skalar pengali',
        prompt: 'Tahap 1 — skalar pengali: $\\dfrac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|^2}$.',
        fields: [{ key: 'k', label: 'Skalar $=$', mode: 'surd' }],
        check: (values) => {
          if (same(values.k.value, scalar)) return true;
          if (same(values.k.value, S.divS(d, S.fromSquare(bb)))) return { toast: 'penyebutPangkatSatu' };
          return { message: 'Belum tepat — bagi hasil kali titik dengan $|\\vec{b}|^2$, lalu sederhanakan pecahannya.' };
        },
        summary: () => `Skalar $= ${S.toLatexS(scalar)}$`,
      },
      {
        kind: 'fields',
        label: 'Kalikan dengan $\\vec{b}$',
        prompt: 'Tahap 2 — kalikan skalar itu kembali dengan **alasnya**, $\\vec{b}$, komponen demi komponen.',
        fields: componentFields(dim, { mode: 'surd' }),
        check: (values) => {
          const s = componentValues(values, dim);
          if (proj.every((p, i) => same(s[i], p))) return true;
          const wrong = AXES.slice(0, dim).filter((a, i) => !same(s[i], proj[i])).map((a) => `c${a}`);
          if (c.a.every((n, i) => same(s[i], S.mulS(scalar, n)))) return { toast: 'arahTidakSejajar', wrong };
          return { message: 'Belum tepat — kalikan skalar dengan **setiap** komponen $\\vec{b}$.', wrong };
        },
        summary: () => `$\\text{proj}_{\\vec{b}}\\,\\vec{a} = \\left(${proj.map((p) => S.toLatexS(p)).join(',\\ ')}\\right)$`,
        onSolved: () => {
          if (!this.plane) return null;
          this.plane.drawProjection(c.a, c.b);
          return this.drawVector({ to: [0, 0], name: 'p', label: '\\text{proj}', tone: 'amber' }, { essential: true })
            .setVector({ to: proj.map((p) => S.toNumber(p)) }, { animate: true, duration: 420 });
        },
      },
    ];
  }
}

export const ENGINES = {
  dot_builder: DotBuilderSim,
  product_property_cards: ProductPropertyCardsSim,
  angle_solver: AngleSolverSim,
  perpendicular_check: PerpendicularCheckSim,
  scalar_projection: ScalarProjectionSim,
  vector_projection: VectorProjectionSim,
};
