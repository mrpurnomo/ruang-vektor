/**
 * lesson/simulations/simBasics.js — Engine simulasi Bab 1: Konsep Dasar Vektor.
 *
 *   vector_anatomy     Bedah satu tanda panah
 *   notation_morph     Ganti baju vektor (ijk ↔ kolom ↔ pasangan)
 *   position_vector    Ujung dikurangi pangkal
 *   component_builder  Susun vektor dari instruksi kalimat
 *   magnitude_builder  Bangun akar panjang vektor sendiri
 *   unit_vector        Buang panjang, sisakan arah
 *
 * Pola setiap engine: gambar DATA SOAL → langkah dengan pemeriksa yang
 * mengenali JENIS kesalahan → gambar HASIL hanya di `onSolved`.
 */

import { CaseSimulation, tex, texNum, texColumn, texTuple, same, givenBlock, AXES } from './simKit.js';
import * as S from '../../domain/surd.js';
import * as V from '../../domain/vector.js';
import * as Val from '../../domain/validator.js';

/* ------------------------------------------------------------
   Pembantu bersama
   ------------------------------------------------------------ */

/** Isian satu per komponen: kx, ky, (kz). */
function componentFields(dim, { prefix = 'c', label = (axis) => `$${axis}$`, mode = 'fraction' } = {}) {
  return AXES.slice(0, dim).map((axis) => ({ key: `${prefix}${axis}`, label: label(axis), mode, aria: `Komponen ${axis}` }));
}

/** Nilai eksak isian komponen, urut x, y, z. */
function componentValues(values, dim, prefix = 'c') {
  return AXES.slice(0, dim).map((axis) => values[`${prefix}${axis}`].value);
}

/** Indeks komponen pertama yang belum sama dengan kunci, atau -1. */
function firstWrong(student, key) {
  return key.findIndex((k, i) => !same(student[i], k));
}

const DIRECTION = {
  x: (sign) => (sign > 0 ? 'ke kanan' : 'ke kiri'),
  y: (sign) => (sign > 0 ? 'ke atas' : 'ke bawah'),
  z: (sign) => (sign > 0 ? 'keluar bidang' : 'masuk bidang'),
};

const is2D = (arr) => Array.isArray(arr) && arr.length === 2;

/* ============================================================
   1. vector_anatomy — Bedah Satu Tanda Panah
   ============================================================ */
export class VectorAnatomySim extends CaseSimulation {
  get cases() {
    return [this.config.vector];
  }

  setupCase(c) {
    const { from, to, name } = c;
    this.given = { from, to, name };
    this.givenEl.appendChild(givenBlock(`Panah yang tergambar adalah ${tex(`\\overrightarrow{${name}}`)}.`));
    this.arrow = this.drawVector({ from, to, name }, { essential: true });
    // Kedua ujung TIDAK diberi huruf lebih dulu: menentukan mana pangkal
    // adalah pekerjaan langkah ini.
    this.tailMark = this.plane.drawPoint(from, { ghost: true });
    this.tipMark = this.plane.drawPoint(to, { ghost: true });
  }

  buildSteps(c) {
    const [p, q] = [c.name[0], c.name[1]];
    const d = [c.to[0] - c.from[0], c.to[1] - c.from[1]];
    const reverse = (this.config.reverseCase && this.config.reverseCase.name) || `${q}${p}`;
    const endTargets = () => [
      { key: 'pangkal', mark: this.tailMark, label: 'Salah satu ujung panah' },
      { key: 'ujung', mark: this.tipMark, label: 'Salah satu ujung panah' },
    ];

    return [
      {
        kind: 'tap',
        label: 'Pangkal',
        prompt: `Ketuk titik **pangkal** dari $\\overrightarrow{${c.name}}$.`,
        targets: endTargets,
        check: (key) => key === 'pangkal' || { toast: 'salahBagian', values: { terketuk: 'ujung', diminta: 'pangkal' } },
        onSolved: () => this.tailMark.setLabel(p),
      },
      {
        kind: 'tap',
        label: 'Ujung',
        prompt: `Sekarang ketuk titik **ujung** dari $\\overrightarrow{${c.name}}$.`,
        targets: endTargets,
        check: (key) => key === 'ujung' || { toast: 'salahBagian', values: { terketuk: 'pangkal', diminta: 'ujung' } },
        onSolved: () => this.tipMark.setLabel(q),
      },
      {
        kind: 'fields',
        label: 'Arah mendatar & tegak',
        prompt: `Hitung kotak kisi dari pangkal ke ujung. Berapa satuan **mendatar** (kanan positif) dan **tegak** (atas positif)?`,
        fields: [
          { key: 'dx', label: 'Mendatar', mode: 'integer' },
          { key: 'dy', label: 'Tegak', mode: 'integer' },
        ],
        check: (v) => {
          const s = [v.dx.value, v.dy.value];
          const i = firstWrong(s, d);
          if (i < 0) return true;
          const flipped = same(s[i], -d[i]);
          return flipped
            ? { toast: 'arahSalah', values: { sumbu: i === 0 ? 'mendatar' : 'tegak' }, wrong: [i === 0 ? 'dx' : 'dy'] }
            : { message: 'Belum tepat — hitung ulang kotak kisinya satu per satu, mulai dari **pangkal**, bukan dari titik asal $O$.', wrong: [i === 0 ? 'dx' : 'dy'] };
        },
        summary: () => `$\\overrightarrow{${c.name}} = ${texTuple(d)}$`,
        onSolved: () => this.plane.drawGuides(this.arrow),
      },
      {
        kind: 'fields',
        label: `Vektor $\\overrightarrow{${reverse}}$`,
        prompt: `Bagaimana dengan $\\overrightarrow{${reverse}}$ — dari ${q} kembali ke ${p}? Tulis kedua komponennya.`,
        fields: componentFields(2, { mode: 'integer' }),
        check: (v) => {
          const s = componentValues(v, 2);
          const key = d.map((n) => -n);
          if (firstWrong(s, key) < 0) return true;
          const wrong = AXES.slice(0, 2).filter((a, i) => !same(s[i], key[i])).map((a) => `c${a}`);
          // Menyalin AB apa adanya = lupa membalik tanda. Selain itu: salah hitung biasa.
          if (firstWrong(s, d) < 0) return { toast: 'tandaSalah', wrong };
          return { message: `Belum tepat — $\\overrightarrow{${reverse}}$ menempuh kotak kisi yang sama dengan $\\overrightarrow{${c.name}}$, hanya arahnya yang berlawanan. Hitung ulang dari ${q} ke ${p}.`, wrong };
        },
        summary: () => `$\\overrightarrow{${reverse}} = ${texTuple(d.map((n) => -n))}$`,
        onSolved: async () => {
          this.arrow.mute(true);
          const back = this.drawVector({ from: c.to, to: c.from, name: reverse, tone: 'amber' }, { essential: true });
          back.pulse(true);
          await this.wait(900);
          back.pulse(false);
        },
      },
    ];
  }
}

/* ============================================================
   2. notation_morph — Ganti Baju Vektor
   ============================================================ */
const NOTATION_NAME = { ijk: 'vektor basis $\\hat{i}, \\hat{j}, \\hat{k}$', column: 'vektor kolom', tuple: 'pasangan berurutan' };
const BASIS = ['i', 'j', 'k'];

export class NotationMorphSim extends CaseSimulation {
  usesPlane() {
    return false;
  }

  caseLabel(c, i) {
    return `Kasus ${i + 1}`;
  }

  setupCase(c) {
    const v = V.fromArray(c.v);
    this.givenEl.appendChild(givenBlock(`${tex(`\\vec{v} = ${V.toLatex(v, { style: c.from })}`)}`, 'sim-given--display'));
  }

  buildSteps(c) {
    const dim = c.v.length;
    const fields = AXES.slice(0, dim).map((axis, i) => ({
      key: `c${axis}`,
      label: c.to === 'ijk' ? null : `$${axis}$`,
      suffix: c.to === 'ijk' ? `$\\hat{${BASIS[i]}}$` : null,
      mode: 'integer',
      aria: `Komponen ${axis}`,
    }));
    return [
      {
        kind: 'fields',
        label: `Tulis sebagai ${NOTATION_NAME[c.to]}`,
        prompt: `Tulis ulang $\\vec{v}$ sebagai **${NOTATION_NAME[c.to]}**, komponen demi komponen.`,
        fieldsLayout: c.to === 'column' ? 'column' : 'row',
        fields,
        check: (values) => {
          const s = componentValues(values, dim);
          const i = firstWrong(s, c.v);
          if (i < 0) return true;
          const wrong = AXES.slice(0, dim).filter((a, j) => !same(s[j], c.v[j])).map((a) => `c${a}`);
          const key = c.v[i];
          const student = S.toNumber(s[i]);
          if (c.from === 'ijk' && Math.abs(key) === 1 && student === 0) return { toast: 'koefisienSatu', wrong };
          if (c.from === 'ijk' && key === 0 && Math.abs(student) === 1) return { toast: 'basisHilang', values: { basis: BASIS[i] }, wrong };
          return { toast: 'komponenSalah', values: { sumbu: AXES[i], basis: BASIS[i] }, wrong };
        },
        summary: () => `$\\vec{v} = ${V.toLatex(V.fromArray(c.v), { style: c.to })}$`,
      },
    ];
  }
}

/* ============================================================
   3. position_vector — Ujung Dikurangi Pangkal
   ============================================================ */
export class PositionVectorSim extends CaseSimulation {
  usesPlane(c) {
    return is2D(c.A);
  }

  caseLabel(c) {
    return `$\\overrightarrow{${c.ask}}$${c.A.length === 3 ? ' (ruang)' : ''}`;
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(`${tex(`A${texTuple(c.A)}`)} &nbsp; ${tex(`B${texTuple(c.B)}`)} &nbsp;→&nbsp; tentukan ${tex(`\\overrightarrow{${c.ask}}`)}`));
    this.marks = {};
    if (this.plane) {
      this.marks.A = this.drawPoint(c.A, { label: 'A', essential: true });
      this.marks.B = this.drawPoint(c.B, { label: 'B', essential: true });
    }
  }

  buildSteps(c) {
    const start = c.ask[0];
    const end = c.ask[1];
    const P = start === 'A' ? c.A : c.B;
    const Q = end === 'A' ? c.A : c.B;
    const dim = c.A.length;
    const key = Q.map((q, i) => q - P[i]);
    const reverse = `${end}${start}`;

    const pickCheck = (letter) => letter === start || { toast: 'pangkalUjungTertukar', values: { titik: start, nama: c.ask } };

    const pickStep = this.plane
      ? {
        kind: 'tap',
        label: 'Pangkal',
        prompt: `Pada $\\overrightarrow{${c.ask}}$, titik mana yang menjadi **pangkal**? Ketuk titiknya.`,
        targets: () => [{ key: 'A', mark: this.marks.A, label: 'Titik A' }, { key: 'B', mark: this.marks.B, label: 'Titik B' }],
        check: pickCheck,
      }
      : {
        kind: 'choice',
        label: 'Pangkal',
        prompt: `Pada $\\overrightarrow{${c.ask}}$, titik mana yang menjadi **pangkal**?`,
        options: [{ key: 'A', label: 'Titik $A$' }, { key: 'B', label: 'Titik $B$' }],
        check: pickCheck,
      };

    return [
      pickStep,
      {
        kind: 'fields',
        label: 'Ujung − pangkal',
        prompt: `Hitung $\\overrightarrow{${c.ask}} = ${end} - ${start}$ komponen demi komponen.`,
        fields: componentFields(dim, { mode: 'integer' }),
        check: (values) => {
          const s = componentValues(values, dim);
          if (firstWrong(s, key) < 0) return true;
          const wrong = AXES.slice(0, dim).filter((a, i) => !same(s[i], key[i])).map((a) => `c${a}`);
          if (firstWrong(s, key.map((n) => -n)) < 0) return { toast: 'tandaTerbalik', values: { kebalikan: reverse, nama: c.ask }, wrong };
          if (dim >= 2 && same(s[0], Q[0] - P[1]) && !same(s[0], key[0])) return { toast: 'komponenTidakSeletak', wrong };
          return { toast: 'hasilSalah', wrong };
        },
        summary: () => `$\\overrightarrow{${c.ask}} = ${texColumn(key)}$`,
        onSolved: () => {
          if (this.plane) this.drawVector({ from: P, to: Q, name: c.ask, tone: 'amber' }, { essential: true });
        },
      },
    ];
  }
}

/* ============================================================
   4. component_builder — Susun Vektor dari Instruksinya
   ============================================================ */
export class ComponentBuilderSim extends CaseSimulation {
  usesPlane(c) {
    return is2D(c.answer);
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(`<strong>Instruksi:</strong> ${c.text}`, 'sim-given--quote'));
    if (!this.plane) {
      this.givenEl.appendChild(givenBlock('Vektor ruang tidak digambar di bidang datar — komponen $z$-nya keluar dari layar.', 'sim-given--muted'));
    }
  }

  buildSteps(c) {
    const dim = c.answer.length;
    const key = c.answer;
    return [
      {
        kind: 'fields',
        label: 'Komponen dari instruksi',
        prompt: 'Terjemahkan instruksinya menjadi komponen. Tulis **0** untuk arah yang tidak bergerak.',
        fields: componentFields(dim, { mode: 'integer' }),
        check: (values) => {
          const s = componentValues(values, dim);
          const i = firstWrong(s, key);
          if (i < 0) return true;
          const wrong = AXES.slice(0, dim).filter((a, j) => !same(s[j], key[j])).map((a) => `c${a}`);
          const student = S.toNumber(s[i]);
          if (key[i] === 0) return { toast: 'nolBukanKosong', wrong };
          if (student === -key[i]) {
            return { toast: 'tandaSalah', values: { arah: DIRECTION[AXES[i]](key[i]), tanda: key[i] > 0 ? 'positif' : 'negatif', sumbu: AXES[i] }, wrong };
          }
          const j = key.findIndex((k, idx) => idx !== i && k !== 0 && Math.abs(k) === Math.abs(student));
          if (j >= 0) return { toast: 'sumbuTertukar', values: { benar: AXES[j], salah: AXES[i] }, wrong };
          return { message: `Belum tepat — baca lagi bagian instruksi untuk arah $${AXES[i]}$: berapa langkah, dan ke mana?`, wrong };
        },
        summary: () => `$\\vec{v} = ${texColumn(key)}$`,
        onSolved: () => {
          if (this.plane) return this.drawVector({ to: [0, 0], name: 'v', tone: 'amber' }, { essential: true }).setVector({ to: key }, { animate: true, duration: 420 });
          return null;
        },
      },
    ];
  }
}

/* ============================================================
   5. magnitude_builder — Bangun Akarnya Sendiri
   ============================================================ */
export class MagnitudeBuilderSim extends CaseSimulation {
  usesPlane(c) {
    return is2D(c.v);
  }

  caseLabel(c) {
    return `$${texTuple(c.v)}$`;
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${texColumn(c.v)}`), 'sim-given--display'));
    if (this.plane) {
      const arrow = this.drawVector({ to: c.v, name: 'v' }, { essential: true });
      if (this.config.showGuides) this.plane.drawGuides(arrow);
    }
  }

  buildSteps(c) {
    const dim = c.v.length;
    const squares = c.v.map((n) => n * n);
    const sum = squares.reduce((a, b) => a + b, 0);
    const length = S.fromSquare(sum);

    const decimalOr = (raw, fallback) => (/\d[.,]\d/.test(raw) ? { toast: 'terlanjurDesimal' } : fallback);

    return [
      {
        kind: 'fields',
        label: 'Kuadratkan',
        prompt: 'Kuadratkan **setiap** komponen.',
        fields: c.v.map((n, i) => ({ key: `q${AXES[i]}`, label: `$(${n})^2 =$`, mode: 'integer' })),
        check: (values) => {
          const s = c.v.map((n, i) => values[`q${AXES[i]}`].value);
          const i = firstWrong(s, squares);
          if (i < 0) return true;
          const wrong = c.v.map((n, j) => (same(s[j], squares[j]) ? null : `q${AXES[j]}`)).filter(Boolean);
          const student = S.toNumber(s[i]);
          if (student === c.v[i] && c.v[i] !== squares[i]) return { toast: 'lupaKuadrat', wrong };
          if (student === -squares[i]) return { toast: 'tandaIkutMasuk', values: { nilai: c.v[i] }, wrong };
          return { message: `Belum tepat — kuadrat berarti bilangan dikalikan dengan **dirinya sendiri**: $(${c.v[i]}) \\times (${c.v[i]})$.`, wrong };
        },
        summary: () => c.v.map((n, i) => `$(${n})^2 = ${squares[i]}$`).join(' · '),
      },
      {
        kind: 'fields',
        label: 'Jumlahkan',
        prompt: 'Jumlahkan seluruh hasil kuadratnya.',
        fields: [{ key: 'sum', label: `$${squares.join(' + ')} =$`, mode: 'integer' }],
        check: (values) => {
          if (same(values.sum.value, sum)) return true;
          const plain = c.v.reduce((a, b) => a + b, 0);
          if (same(values.sum.value, plain)) return { toast: 'lupaKuadrat' };
          return { toast: 'jumlahSalah' };
        },
        summary: () => `$${squares.join(' + ')} = ${sum}$`,
      },
      {
        kind: 'fields',
        label: 'Akarkan',
        prompt: 'Panjang vektor adalah **akar** dari jumlah itu. Tulis dalam bentuk akar (mode Akar di papan angka).',
        fields: [{ key: 'root', label: '$|\\vec{v}| =$', mode: 'surd' }],
        check: (values) => {
          if (same(values.root.value, length)) return true;
          return decimalOr(values.root.raw, { message: `Belum tepat — panjangnya adalah akar dari jumlah kuadrat yang baru saja kamu hitung, bukan jumlahnya sendiri.` });
        },
        summary: () => `$|\\vec{v}| = \\sqrt{${sum}}$`,
      },
      {
        kind: 'fields',
        label: 'Sederhanakan',
        prompt: 'Tulis panjangnya dalam bentuk **paling sederhana**.',
        fields: [{ key: 'simple', label: '$|\\vec{v}| =$', mode: 'surd' }],
        check: (values) => {
          const verdict = Val.checkExactAnswer(values.simple.raw, length, { requireSimplest: true });
          if (verdict.correct) return true;
          if (verdict.code === 'not-simplest') return { toast: 'belumDisederhanakan', values: { radikan: sum } };
          if (verdict.code === 'decimal') return { toast: 'terlanjurDesimal' };
          return { message: verdict.reason };
        },
        summary: () => `$|\\vec{v}| = \\sqrt{${sum}} = ${S.toLatexS(length)}$`,
        onSolved: () => {
          if (this.plane) this.plane.highlight('v');
        },
      },
    ];
  }
}

/* ============================================================
   6. unit_vector — Buang Panjang, Sisakan Arah
   ============================================================ */
export class UnitVectorSim extends CaseSimulation {
  usesPlane(c) {
    return is2D(c.v);
  }

  caseLabel(c) {
    return c.isZero ? 'Vektor nol' : `$${texTuple(c.v)}$`;
  }

  caseSuccessKey(c) {
    return c.isZero ? 'vektorNol' : 'success';
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${texColumn(c.v)}`), 'sim-given--display'));
    if (this.plane) this.drawVector({ to: c.v, name: 'v' }, { essential: true });
  }

  buildSteps(c) {
    const vector = V.fromArray(c.v);
    const length = V.normExact(vector);
    const dim = c.v.length;

    const lengthStep = {
      kind: 'fields',
      label: 'Panjang $|\\vec{v}|$',
      prompt: 'Hitung panjang $\\vec{v}$ lebih dulu — ia akan menjadi pembagi.',
      fields: [{ key: 'len', label: '$|\\vec{v}| =$', mode: 'surd' }],
      check: (values) => {
        const verdict = Val.checkExactAnswer(values.len.raw, length);
        return verdict.correct || { message: verdict.reason };
      },
      summary: () => `$|\\vec{v}| = ${S.toLatexS(length)}$`,
    };

    if (c.isZero) {
      return [
        lengthStep,
        {
          kind: 'choice',
          label: 'Vektor satuan',
          prompt: 'Jadi, apa vektor satuan dari $\\vec{v}$?',
          options: [
            { key: 'nol', label: '$\\hat{v} = (0, 0)$' },
            { key: 'none', label: 'Tidak ada — $\\frac{\\vec{0}}{0}$ tidak terdefinisi' },
            { key: 'satu', label: '$\\hat{v} = (1, 1)$' },
          ],
          check: (key) => {
            if (key === 'none') return true;
            if (key === 'nol') return { toast: 'memaksaVektorNol' };
            return { message: 'Belum tepat — $(1, 1)$ tidak punya hubungan apa pun dengan $\\vec{0}$, dan panjangnya pun $\\sqrt{2}$, bukan $1$. Periksa dulu apakah pembaginya boleh dipakai.' };
          },
        },
      ];
    }

    const unit = c.v.map((n) => S.divS(n, length));
    return [
      lengthStep,
      {
        kind: 'fields',
        label: 'Bagi setiap komponen',
        prompt: 'Bagi **setiap** komponen dengan $|\\vec{v}|$. Pecahan dan akar boleh dipakai.',
        fields: componentFields(dim, { mode: 'surd' }),
        check: (values) => {
          const s = componentValues(values, dim);
          if (firstWrong(s, unit) < 0) return true;
          const wrong = AXES.slice(0, dim).filter((a, i) => !same(s[i], unit[i])).map((a) => `c${a}`);
          const correctCount = dim - wrong.length;
          const undivided = s.findIndex((x, i) => !same(x, unit[i]) && same(x, c.v[i]));
          if (undivided >= 0 && correctCount > 0) return { toast: 'hanyaSatuKomponen', wrong };
          const byComponent = s.some((x, i) => c.v.some((d) => d !== 0 && !same(x, unit[i]) && same(x, S.divS(c.v[i], d))));
          if (byComponent) return { toast: 'dibagiKomponen', wrong };
          return { toast: 'panjangBukanSatu', values: { x: c.v[0], y: c.v[1], n: S.toLatexS(length) }, wrong };
        },
        summary: () => `$\\hat{v} = \\left(${unit.map((u) => S.toLatexS(u)).join(',\\ ')}\\right)$`,
        onSolved: () => {
          if (!this.plane) return null;
          return this.drawVector({ to: [0, 0], name: 'e', label: '\\hat{v}', tone: 'amber' }, { essential: true })
            .setVector({ to: unit.map((u) => S.toNumber(u)) }, { animate: true, duration: 420 });
        },
      },
    ];
  }
}

export const ENGINES = {
  vector_anatomy: VectorAnatomySim,
  notation_morph: NotationMorphSim,
  position_vector: PositionVectorSim,
  component_builder: ComponentBuilderSim,
  magnitude_builder: MagnitudeBuilderSim,
  unit_vector: UnitVectorSim,
};
