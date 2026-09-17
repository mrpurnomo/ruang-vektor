/**
 * lesson/simulations/simOperations.js — Engine simulasi Bab 2: Operasi & Bangun Datar.
 *
 *   triangle_rule       Sambung ujung ke pangkal
 *   parallelogram_rule  Dua diagonal, dua makna
 *   component_add       Pasangkan yang seletak
 *   scalar_sweep        Sapu skalar ke tiap komponen
 *   combo_vector_op     Dua tahap, satu per satu
 *   equality_link       Satu persamaan vektor, banyak persamaan biasa
 *   collinear_check     Cari k, lalu uji ulang
 *   section_point       Titik pembagi ruas garis
 */

import {
  CaseSimulation, tex, texNum, texColumn, texTuple, same, givenBlock, AXES,
  pairBoard, pairStep, detachedStart,
} from './simKit.js';
import * as S from '../../domain/surd.js';
import * as V from '../../domain/vector.js';

/* ------------------------------------------------------------
   Pembantu bersama
   ------------------------------------------------------------ */
function componentFields(dim, { prefix = 'c', label = (axis) => `$${axis}$`, mode = 'fraction' } = {}) {
  return AXES.slice(0, dim).map((axis) => ({ key: `${prefix}${axis}`, label: label(axis), mode, aria: `Komponen ${axis}` }));
}

function componentValues(values, dim, prefix = 'c') {
  return AXES.slice(0, dim).map((axis) => values[`${prefix}${axis}`].value);
}

function wrongKeys(student, key, prefix = 'c') {
  return key.map((k, i) => (same(student[i], k) ? null : `${prefix}${AXES[i]}`)).filter(Boolean);
}

const add = (p, q) => p.map((n, i) => n + q[i]);
const sub = (p, q) => p.map((n, i) => n - q[i]);
const mul = (k, p) => p.map((n) => k * n);
const matches = (student, key) => key.every((k, i) => same(student[i], k));

/* ============================================================
   7. triangle_rule — Sambung Ujung ke Pangkal
   ============================================================ */
export class TriangleRuleSim extends CaseSimulation {
  caseLabel(c) {
    return `$\\vec{${c.label[0]}} + \\vec{${c.label[1]}}$`;
  }

  caseSuccessKey(c) {
    return c.isZeroResult ? 'hasilNol' : 'success';
  }

  setupCase(c) {
    const [p, q] = c.label;
    this.givenEl.appendChild(givenBlock(tex(`\\vec{${p}} = ${texColumn(c.a)},\\quad \\vec{${q}} = ${texColumn(c.b)}`), 'sim-given--display'));
    this.first = this.drawVector({ to: c.a, name: p }, { essential: true });
    const start = detachedStart(c.b, [[0, 0], c.a], this.planeOptions());
    this.second = this.drawVector({ from: start, to: add(start, c.b), name: q, tone: 'cyan' }, { essential: true });
  }

  buildSteps(c) {
    const [p, q] = c.label;
    const sum = add(c.a, c.b);
    const origin = () => this.plane.drawPoint([0, 0], { ghost: true });
    let joint;
    let tail;
    let end;

    return [
      {
        kind: 'tap',
        label: 'Vektor yang dipindah',
        prompt: `Untuk $\\vec{${p}} + \\vec{${q}}$ dengan aturan segitiga, vektor mana yang **dipindahkan** agar pangkalnya menempel?`,
        targets: () => [
          { key: 'first', arrow: this.first, label: `Vektor ${p}` },
          { key: 'second', arrow: this.second, label: `Vektor ${q}` },
        ],
        check: (key) => key === 'second' || { toast: 'geserKeUjungSalah', values: { kedua: q, pertama: p } },
      },
      {
        kind: 'tap',
        label: 'Tempat pangkalnya',
        prompt: `Ke titik mana **pangkal** $\\vec{${q}}$ harus ditempelkan?`,
        targets: () => {
          tail = tail || origin();
          joint = joint || this.plane.drawPoint(c.a, { ghost: true });
          return [
            { key: 'tail', mark: tail, label: 'Titik pangkal' },
            { key: 'joint', mark: joint, label: 'Titik ujung' },
          ];
        },
        check: (key) => key === 'joint' || { message: `Belum tepat — pangkal yang ditempelkan ke pangkal membentuk **jajar genjang**, bukan segitiga. Aturan segitiga: pangkal $\\vec{${q}}$ bertemu **ujung** $\\vec{${p}}$.` },
        onSolved: () => this.second.setVector({ from: c.a, to: sum }, { animate: true, duration: 520 }),
      },
      {
        kind: 'tap',
        label: 'Pangkal resultan',
        prompt: 'Resultan ditarik dari titik mana?',
        targets: () => {
          // Resultan NOL: ujung rantai kembali tepat ke pangkal. Dua titik
          // berimpit berarti SATU titik — kalau digambar dua, yang di atas
          // menelan setiap ketukan dan langkah ini tidak bisa diselesaikan.
          const closes = sum[0] === 0 && sum[1] === 0;
          end = end || (closes ? tail : this.plane.drawPoint(sum, { ghost: true }));
          const list = [
            { key: 'tail', mark: tail, label: 'Titik pertama rantai' },
            { key: 'joint', mark: joint, label: 'Titik sambungan' },
          ];
          if (end !== tail) list.push({ key: 'end', mark: end, label: 'Titik terakhir rantai' });
          return list;
        },
        check: (key) => {
          if (key === 'tail') return true;
          if (key === 'joint') return { toast: 'resultanSalahPangkal' };
          return { message: 'Itu **ujung terakhir** rantainya. Resultan berangkat dari pangkal yang paling awal dan berakhir di sana.' };
        },
      },
      {
        kind: 'tap',
        label: 'Ujung resultan',
        prompt: 'Dan resultan berakhir di titik mana?',
        targets: () => [
          { key: 'joint', mark: joint, label: 'Titik sambungan' },
          { key: end === tail ? 'tail' : 'end', mark: end, label: 'Titik terakhir rantai' },
        ],
        check: (key) => key === 'end' || (end === tail && key === 'tail') || { toast: 'resultanSalahPangkal' },
      },
      {
        kind: 'fields',
        label: 'Komponen resultan',
        prompt: `Hitung $\\vec{${p}} + \\vec{${q}}$ komponen demi komponen.`,
        fields: componentFields(2, { mode: 'integer' }),
        check: (values) => {
          const s = componentValues(values, 2);
          if (matches(s, sum)) return true;
          const wrong = wrongKeys(s, sum);
          if (matches(s, sub(c.a, c.b)) || matches(s, sub(c.b, c.a))) {
            return { message: 'Itu **selisih** kedua vektor, bukan jumlahnya. Aturan segitiga menjumlahkan komponen seletak.', wrong };
          }
          return { message: 'Belum tepat — jumlahkan komponen $x$ dengan komponen $x$, komponen $y$ dengan komponen $y$.', wrong };
        },
        summary: () => `$\\vec{${p}} + \\vec{${q}} = ${texTuple(sum)}$`,
        onSolved: () => {
          this.drawVector({ to: [0, 0], name: 'r', label: `\\vec{${p}}+\\vec{${q}}`, tone: 'success' }, { essential: true })
            .setVector({ to: sum }, { animate: true, duration: 420 });
          this.first.mute(true);
          this.second.mute(true);
        },
      },
    ];
  }
}

/* ============================================================
   8. parallelogram_rule — Dua Diagonal, Dua Makna
   ============================================================ */
export class ParallelogramRuleSim extends CaseSimulation {
  caseLabel(c) {
    return c.ask === 'sum' ? '$\\vec{a} + \\vec{b}$' : '$\\vec{a} - \\vec{b}$';
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`\\vec{a} = ${texColumn(c.a)},\\quad \\vec{b} = ${texColumn(c.b)}`), 'sim-given--display'));
    this.va = this.drawVector({ to: c.a, name: 'a' }, { essential: true });
    const start = detachedStart(c.b, [[0, 0], c.a], this.planeOptions());
    this.vb = this.drawVector({ from: start, to: add(start, c.b), name: 'b', tone: 'cyan' }, { essential: true });
  }

  buildSteps(c) {
    const target = c.ask === 'sum' ? add(c.a, c.b) : sub(c.a, c.b);
    let tail;
    let tipA;

    const steps = [
      {
        kind: 'tap',
        label: 'Pangkal bersama',
        prompt: 'Aturan jajar genjang dimulai dari **satu pangkal bersama**. Ke titik mana pangkal $\\vec{b}$ harus dipindahkan?',
        targets: () => {
          tail = tail || this.plane.drawPoint([0, 0], { ghost: true });
          tipA = tipA || this.plane.drawPoint(c.a, { ghost: true });
          return [
            { key: 'tail', mark: tail, label: 'Pangkal vektor a' },
            { key: 'tip', mark: tipA, label: 'Ujung vektor a' },
          ];
        },
        check: (key) => key === 'tail' || { toast: 'pangkalTidakBerimpit' },
        onSolved: async () => {
          await this.vb.setVector({ from: [0, 0], to: c.b }, { animate: true, duration: 520 });
          this.plane.drawParallelogram(c.a, c.b);
        },
      },
      {
        kind: 'choice',
        label: 'Pilih diagonal',
        prompt: `Diagonal mana yang mewakili **${c.ask === 'sum' ? '$\\vec{a} + \\vec{b}$' : '$\\vec{a} - \\vec{b}$'}**?`,
        options: [
          { key: 'common', label: 'Diagonal yang berangkat dari **pangkal bersama**' },
          { key: 'tips', label: 'Diagonal yang menghubungkan **kedua ujung**' },
        ],
        check: (key) => {
          if (c.ask === 'sum') return key === 'common' || { toast: 'diagonalSalah' };
          return key === 'tips' || { message: 'Belum tepat — diagonal dari pangkal bersama mewakili **jumlah**. Selisih diwakili diagonal yang menghubungkan kedua **ujung** vektor.' };
        },
      },
    ];

    if (c.ask === 'diff') {
      steps.push({
        kind: 'choice',
        label: 'Arah selisih',
        prompt: 'Diagonal selisih punya arah. Untuk $\\vec{a} - \\vec{b}$, ia ditarik dari mana ke mana?',
        options: [
          { key: 'ba', label: 'Dari ujung $\\vec{b}$ ke ujung $\\vec{a}$' },
          { key: 'ab', label: 'Dari ujung $\\vec{a}$ ke ujung $\\vec{b}$' },
        ],
        check: (key) => key === 'ba' || { toast: 'arahSelisihTerbalik', values: { dari: 'a', ke: 'b' } },
      });
    }

    steps.push({
      kind: 'fields',
      label: 'Komponen hasil',
      prompt: `Hitung ${c.ask === 'sum' ? '$\\vec{a} + \\vec{b}$' : '$\\vec{a} - \\vec{b}$'} komponen demi komponen.`,
      fields: componentFields(2, { mode: 'integer' }),
      check: (values) => {
        const s = componentValues(values, 2);
        if (matches(s, target)) return true;
        const wrong = wrongKeys(s, target);
        if (c.ask === 'diff' && matches(s, sub(c.b, c.a))) return { toast: 'arahSelisihTerbalik', values: { dari: 'a', ke: 'b' }, wrong };
        if (c.ask === 'diff' && matches(s, add(c.a, c.b))) return { message: 'Itu **jumlah**, bukan selisih. Kurangkan komponen $\\vec{b}$ dari komponen $\\vec{a}$.', wrong };
        if (c.ask === 'sum' && matches(s, sub(c.a, c.b))) return { toast: 'diagonalSalah', wrong };
        return { message: 'Belum tepat — kerjakan komponen seletak satu per satu, bawa tandanya apa adanya.', wrong };
      },
      summary: () => `$\\vec{a} ${c.ask === 'sum' ? '+' : '-'} \\vec{b} = ${texTuple(target)}$`,
      onSolved: () => {
        const label = c.ask === 'sum' ? '\\vec{a}+\\vec{b}' : '\\vec{a}-\\vec{b}';
        const from = c.ask === 'sum' ? [0, 0] : c.b;
        const to = c.ask === 'sum' ? target : c.a;
        this.drawVector({ from, to: from, name: 'r', label, tone: 'success' }, { essential: true })
          .setVector({ to }, { animate: true, duration: 420 });
      },
    });
    return steps;
  }
}

/* ============================================================
   9. component_add — Pasangkan yang Seletak
   ============================================================ */
export class ComponentAddSim extends CaseSimulation {
  usesPlane() {
    return false;
  }

  caseLabel(c) {
    if (c.invalid) return 'Beda dimensi';
    return `${c.op === 'add' ? 'Jumlah' : 'Selisih'} ${c.a.length}D`;
  }

  caseSuccessKey(c) {
    return c.invalid ? 'dimensiBeda' : 'success';
  }

  setupCase(c) {
    this.pair = pairBoard('\\vec{a}', c.a, c.op === 'add' ? '+' : '-', '\\vec{b}', c.b);
    this.givenEl.appendChild(this.pair.root);
  }

  buildSteps(c) {
    if (c.invalid) {
      const padded = c.b.map((n, i) => (c.a[i] ?? 0) + n);
      const trimmed = c.a.map((n, i) => n + c.b[i]);
      return [{
        kind: 'choice',
        label: 'Hasil operasi',
        prompt: 'Pasangkan komponennya satu per satu dalam pikiranmu. Apa hasil $\\vec{a} + \\vec{b}$?',
        options: [
          { key: 'padded', label: `$${texTuple(padded)}$` },
          { key: 'trimmed', label: `$${texTuple(trimmed)}$` },
          { key: 'undefined', label: 'Tidak terdefinisi' },
        ],
        check: (key) => key === 'undefined' || { toast: 'dimensiBeda', values: { dimA: c.a.length, dimB: c.b.length } },
      }];
    }

    const sign = c.op === 'add' ? 1 : -1;
    const result = c.a.map((n, i) => n + sign * c.b[i]);
    const steps = [];
    c.a.forEach((n, i) => {
      steps.push(pairStep({
        board: this.pair,
        index: i,
        label: `Pasangan ${AXES[i]}`,
        prompt: `Komponen ke-${i + 1} dari $\\vec{a}$ sudah terpilih. Ketuk **pasangannya** di $\\vec{b}$.`,
        wrong: () => ({ toast: 'komponenTidakSeletak', values: { indeks: i + 1 } }),
      }));
      steps.push({
        kind: 'fields',
        label: `Hitung ${AXES[i]}`,
        prompt: `Hitung komponen ke-${i + 1}: $(${n}) ${c.op === 'add' ? '+' : '-'} (${c.b[i]})$.`,
        fields: [{ key: `r${AXES[i]}`, label: `$${AXES[i]} =$`, mode: 'integer' }],
        check: (values) => {
          const s = values[`r${AXES[i]}`].value;
          if (same(s, result[i])) return true;
          if (c.op === 'sub' && same(s, n + c.b[i])) return { toast: 'tandaKurangTerlewat' };
          return { toast: 'hasilSalah' };
        },
        summary: () => `Komponen ke-${i + 1}: $(${n}) ${c.op === 'add' ? '+' : '-'} (${c.b[i]}) = ${result[i]}$`,
      });
    });
    steps[steps.length - 1].onSolved = () => {
      this.givenEl.appendChild(givenBlock(tex(`\\vec{a} ${c.op === 'add' ? '+' : '-'} \\vec{b} = ${texColumn(result)}`), 'sim-given--display'));
    };
    return steps;
  }
}

/* ============================================================
   10. scalar_sweep — Sapu Skalar ke Tiap Komponen
   ============================================================ */
export class ScalarSweepSim extends CaseSimulation {
  usesPlane(c) {
    return c.v.length === 2;
  }

  caseLabel(c) {
    return `$k = ${texNum(c.k)}$`;
  }

  caseSuccessKey(c) {
    return c.isZeroResult ? 'hasilNol' : 'success';
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`k = ${texNum(c.k)},\\quad \\vec{v} = ${texColumn(c.v)}`), 'sim-given--display'));
    // Direset SETIAP kasus: kasus ruang tidak punya bidang, dan panah dari
    // kasus sebelumnya milik bidang yang sudah dihancurkan (terukur: macet).
    this.arrow = this.plane ? this.drawVector({ to: c.v, name: 'v' }, { essential: true }) : null;
  }

  buildSteps(c) {
    const k = S.toFraction(c.k);
    const scaled = c.v.map((n) => S.mulS(k, n));
    const kTex = texNum(c.k);
    const steps = c.v.map((n, i) => ({
      kind: 'fields',
      label: `$k \\cdot v_${AXES[i]}$`,
      prompt: `Bawa skalar ke komponen $${AXES[i]}$: hitung $${kTex} \\times (${n})$.`,
      fields: [{ key: `k${AXES[i]}`, label: `$${kTex} \\times (${n}) =$`, mode: 'fraction' }],
      check: (values) => {
        const s = values[`k${AXES[i]}`].value;
        if (same(s, scaled[i])) return true;
        if (!S.isZeroS(scaled[i]) && same(s, S.negS(scaled[i]))) {
          // {{k}} dipakai DUA kali di kalimatnya: sekali di teks biasa, sekali di
          // dalam $…$. "1/2" sah di keduanya; "\frac{1}{2}" tampil mentah di teks.
          return { toast: 'tandaHilang', values: { k: S.toText(k), komponen: n, tandaHasil: S.toNumber(scaled[i]) > 0 ? 'positif' : 'negatif' } };
        }
        return { message: `Belum tepat — kalikan skalar $${kTex}$ dengan komponen $${AXES[i]}$ saja, bawa tandanya.` };
      },
      summary: () => `$${kTex} \\times (${n}) = ${S.toLatexS(scaled[i])}$`,
    }));

    const kNum = S.toNumber(k);
    const direction = kNum === 0 ? 'zero' : kNum < 0 ? 'opp' : 'same';
    const longer = Math.abs(kNum) > 1;
    const expected = direction === 'zero' ? 'zero' : `${direction}-${longer ? 'long' : 'short'}`;
    steps.push({
      kind: 'choice',
      label: 'Ramalkan panahnya',
      prompt: `Sebelum digambar: dibanding $\\vec{v}$, bagaimana panah $${kTex}\\vec{v}$?`,
      options: [
        { key: 'same-long', label: 'Searah, lebih panjang' },
        { key: 'opp-long', label: 'Berlawanan arah, lebih panjang' },
        { key: 'same-short', label: 'Searah, lebih pendek' },
        { key: 'opp-short', label: 'Berlawanan arah, lebih pendek' },
        { key: 'zero', label: 'Vektor nol — tidak punya arah' },
      ],
      check: (key) => {
        if (key === expected) return true;
        if (expected === 'zero') return { message: 'Belum tepat — dikalikan $0$, setiap komponennya menjadi $0$. Hasilnya bukan panah sama sekali.' };
        if (key === 'zero') return { message: 'Skalarnya bukan nol, jadi hasilnya tetap sebuah panah yang punya arah.' };
        if (!key.startsWith(direction)) return { toast: 'arahSalah' };
        return { toast: 'panjangSalah' };
      },
      onSolved: () => {
        if (!this.arrow) return null;
        this.arrow.mute(true);
        return this.drawVector({ to: c.v, name: 'kv', label: `${kTex}\\vec{v}`, tone: 'amber' }, { essential: true })
          .setVector({ to: scaled.map((x) => S.toNumber(x)) }, { animate: true, duration: 520 });
      },
    });
    return steps;
  }
}

/* ============================================================
   11. combo_vector_op — Dua Tahap, Satu per Satu
   ============================================================ */
function termTex(k, name, first) {
  const abs = Math.abs(k);
  const coef = abs === 1 ? '' : String(abs);
  if (first) return `${k < 0 ? '-' : ''}${coef}\\vec{${name}}`;
  return ` ${k < 0 ? '-' : '+'} ${coef}\\vec{${name}}`;
}

export class ComboVectorOpSim extends CaseSimulation {
  usesPlane() {
    return false;
  }

  caseLabel(c) {
    return `$${termTex(c.ku, 'u', true)}${termTex(c.kv, 'v', false)}$`;
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`\\vec{u} = ${texColumn(c.u)},\\quad \\vec{v} = ${texColumn(c.v)}`), 'sim-given--display'));
    this.givenEl.appendChild(givenBlock(`Hitung ${tex(`${termTex(c.ku, 'u', true)}${termTex(c.kv, 'v', false)}`)}.`));
  }

  buildSteps(c) {
    const dim = c.u.length;
    const su = mul(c.ku, c.u);
    const sv = mul(c.kv, c.v);
    const result = add(su, sv);
    const kvTex = `${c.kv < 0 ? '-' : ''}${Math.abs(c.kv) === 1 ? '' : Math.abs(c.kv)}`;
    const scaleCheck = (vec, key, prefix) => (values) => {
      const s = componentValues(values, dim, prefix);
      if (matches(s, key)) return true;
      const wrong = wrongKeys(s, key, prefix);
      if (s.some((x, i) => !same(x, key[i]) && same(x, vec[i]))) return { toast: 'skalarHanyaSatuKomponen', wrong };
      return { message: 'Belum tepat — kalikan skalarnya dengan **setiap** komponen, dan bawa tandanya.', wrong };
    };

    return [
      {
        kind: 'fields',
        label: `Tahap 1: $${c.ku}\\vec{u}$`,
        prompt: `**Tahap perkalian.** Hitung $${c.ku}\\vec{u}$.`,
        fields: componentFields(dim, { prefix: 'u', mode: 'integer' }),
        check: scaleCheck(c.u, su, 'u'),
        summary: () => `$${c.ku}\\vec{u} = ${texTuple(su)}$`,
      },
      {
        kind: 'fields',
        label: `Tahap 1: $${kvTex}\\vec{v}$`,
        prompt: `Masih tahap perkalian. Hitung $${kvTex}\\vec{v}$ — tanda skalarnya ikut.`,
        fields: componentFields(dim, { prefix: 'v', mode: 'integer' }),
        check: scaleCheck(c.v, sv, 'v'),
        summary: () => `$${kvTex}\\vec{v} = ${texTuple(sv)}$`,
      },
      {
        kind: 'fields',
        label: 'Tahap 2: gabungkan',
        prompt: 'Tahap perkalian tuntas. Sekarang **gabungkan** kedua hasil itu komponen demi komponen.',
        fields: componentFields(dim, { mode: 'integer' }),
        check: (values) => {
          const s = componentValues(values, dim);
          if (matches(s, result)) return true;
          const wrong = wrongKeys(s, result);
          if (matches(s, sub(su, sv))) return { toast: 'tandaKurangSalah', wrong };
          if (matches(s, mul(c.ku, add(c.u, mul(Math.sign(c.kv), c.v))))) return { toast: 'urutanTerbalik', wrong };
          return { message: 'Belum tepat — jumlahkan hasil tahap 1 komponen demi komponen, dengan tanda yang sudah kamu tentukan.', wrong };
        },
        summary: () => `$${termTex(c.ku, 'u', true)}${termTex(c.kv, 'v', false)} = ${texTuple(result)}$`,
      },
    ];
  }
}

/* ============================================================
   12. equality_link — Satu Persamaan, Banyak Persamaan
   ============================================================ */
function parseLinear(expr) {
  const m = /^(-?\d*)([a-z])([+-]\d+)?$/.exec(expr.replace(/\s+/g, ''));
  if (!m) throw new Error(`Bentuk komponen "${expr}" tidak dikenali`);
  const coef = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
  return { coef, variable: m[2], constant: m[3] ? Number(m[3]) : 0 };
}

export class EqualityLinkSim extends CaseSimulation {
  usesPlane() {
    return false;
  }

  caseLabel(c) {
    return `$${Object.keys(c.solve).join(', ')}$`;
  }

  setupCase(c) {
    this.pair = pairBoard('', c.left, '=', '', c.right, { leftFormat: (e) => e });
    this.givenEl.appendChild(this.pair.root);
  }

  buildSteps(c) {
    const steps = [];
    c.left.forEach((expr, i) => {
      const { variable } = parseLinear(expr);
      const equation = `${expr} = ${c.right[i]}`;
      steps.push(pairStep({
        board: this.pair,
        index: i,
        label: `Baris ${i + 1}`,
        prompt: `Komponen ke-${i + 1} ruas kiri sudah terpilih. Ketuk **pasangannya** di ruas kanan.`,
        wrong: () => ({ toast: 'tidakSeletak', values: { kiri: i + 1 } }),
      }));
      steps.push({
        kind: 'fields',
        label: `Selesaikan $${variable}$`,
        prompt: `Baris ${i + 1} menjadi persamaan biasa: $${equation}$. Berapa $${variable}$?`,
        fields: [{ key: `s${i}`, label: `$${variable} =$`, mode: 'fraction' }],
        check: (values) => same(values[`s${i}`].value, c.solve[variable]) || { toast: 'nilaiSalah', values: { persamaan: equation } },
        summary: () => `$${equation} \\;\\Rightarrow\\; ${variable} = ${texNum(c.solve[variable])}$`,
      });
    });
    return steps;
  }
}

/* ============================================================
   13. collinear_check — Cari k, Lalu Uji Ulang
   ============================================================ */
export class CollinearCheckSim extends CaseSimulation {
  caseLabel(c, i) {
    return `Titik set ${i + 1}`;
  }

  caseSuccessKey(c) {
    return c.collinear ? 'success' : 'tidakSegaris';
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`A${texTuple(c.A)},\\; B${texTuple(c.B)},\\; C${texTuple(c.C)}`), 'sim-given--display'));
    this.drawPoint(c.A, { label: 'A', essential: true });
    this.drawPoint(c.B, { label: 'B', essential: true });
    this.drawPoint(c.C, { label: 'C', essential: true });
  }

  buildSteps(c) {
    const AB = sub(c.B, c.A);
    const AC = sub(c.C, c.A);
    const ix = AB[0] !== 0 ? 0 : 1;
    const iy = 1 - ix;
    const k1 = S.fraction(AC[ix], AB[ix]);
    const k2 = AB[iy] !== 0 ? S.fraction(AC[iy], AB[iy]) : null;
    const vecStep = (name, key) => ({
      kind: 'fields',
      label: `$\\overrightarrow{${name}}$`,
      prompt: `Hitung $\\overrightarrow{${name}} = ${name[1]} - ${name[0]}$.`,
      fields: componentFields(2, { prefix: name, mode: 'integer' }),
      check: (values) => {
        const s = componentValues(values, 2, name);
        if (matches(s, key)) return true;
        const wrong = wrongKeys(s, key, name);
        if (matches(s, key.map((n) => -n))) return { message: `Tandanya terbalik — $\\overrightarrow{${name}}$ adalah **ujung dikurangi pangkal**: $${name[1]} - ${name[0]}$.`, wrong };
        return { message: 'Belum tepat — kurangkan koordinat seletak: ujung dikurangi pangkal.', wrong };
      },
      summary: () => `$\\overrightarrow{${name}} = ${texTuple(key)}$`,
    });

    const steps = [
      vecStep('AB', AB),
      vecStep('AC', AC),
      {
        kind: 'fields',
        label: `$k$ dari komponen $${AXES[ix]}$`,
        prompt: `Kalau $\\overrightarrow{AC} = k\\,\\overrightarrow{AB}$, maka dari komponen $${AXES[ix]}$: $${AC[ix]} = k \\cdot (${AB[ix]})$. Berapa $k$?`,
        fields: [{ key: 'k1', label: '$k =$', mode: 'fraction' }],
        check: (values) => same(values.k1.value, k1) || { message: `Belum tepat — selesaikan $${AC[ix]} = k \\cdot (${AB[ix]})$ untuk $k$: bagi kedua ruas dengan $${AB[ix]}$.` },
        summary: () => `Dari komponen $${AXES[ix]}$: $k = ${S.toLatexS(k1)}$`,
      },
    ];

    if (k2) {
      steps.push({
        kind: 'fields',
        label: `Uji di komponen $${AXES[iy]}$`,
        prompt: `Uji ulang di komponen $${AXES[iy]}$: dari $${AC[iy]} = k \\cdot (${AB[iy]})$, berapa $k$?`,
        fields: [{ key: 'k2', label: '$k =$', mode: 'fraction' }],
        check: (values) => same(values.k2.value, k2) || { message: `Belum tepat — selesaikan $${AC[iy]} = k \\cdot (${AB[iy]})$ untuk $k$, terlepas dari hasil komponen sebelumnya.` },
        summary: () => `Dari komponen $${AXES[iy]}$: $k = ${S.toLatexS(k2)}$`,
      });
    }

    steps.push({
      kind: 'choice',
      label: 'Kesimpulan',
      prompt: 'Bandingkan kedua nilai $k$ itu. Apakah $A$, $B$, dan $C$ segaris?',
      options: [
        { key: 'yes', label: 'Segaris — nilai $k$ sama di setiap komponen' },
        { key: 'no', label: 'Tidak segaris — nilai $k$ berbeda' },
      ],
      check: (key) => {
        if (c.collinear) return key === 'yes' || { message: 'Belum tepat — kedua komponen memberi $k$ yang **sama**, jadi $\\overrightarrow{AC}$ memang kelipatan $\\overrightarrow{AB}$ dan berbagi titik $A$.' };
        return key === 'no' || { toast: 'kBeda', values: { kx: S.toLatexS(k1), ky: S.toLatexS(k2) } };
      },
      onSolved: () => {
        this.drawVector({ from: c.A, to: c.B, name: 'AB', tone: 'blue' }, { essential: false });
        this.drawVector({ from: c.A, to: c.C, name: 'AC', tone: c.collinear ? 'success' : 'coral' }, { essential: true });
      },
    });
    return steps;
  }
}

/* ============================================================
   14. section_point — Geser Titik Pembagi
   ============================================================ */
export class SectionPointSim extends CaseSimulation {
  caseLabel(c) {
    return c.isOuter ? 'Pembagian luar' : c.isMidpoint ? 'Titik tengah' : `$${c.m} : ${c.n}$`;
  }

  setupCase(c) {
    const ratio = c.n < 0 ? `${c.m} : (${c.n})` : `${c.m} : ${c.n}`;
    this.givenEl.appendChild(givenBlock(tex(`A${texTuple(c.A)},\\; B${texTuple(c.B)},\\; AP : PB = ${ratio}`), 'sim-given--display'));
    if (c.isOuter) {
      this.givenEl.appendChild(givenBlock('Salah satu bagian perbandingannya negatif: $P$ terletak di **luar** ruas $AB$, pada perpanjangannya.', 'sim-given--muted'));
    }
    this.drawPoint(c.A, { label: 'A', essential: true });
    this.drawPoint(c.B, { label: 'B', essential: true });
    this.plane.drawSegment(c.A, c.B, { dashed: true });
  }

  buildSteps(c) {
    const total = c.m + c.n;
    const P = c.A.map((a, i) => S.fraction(c.n * a + c.m * c.B[i], total));
    const swapped = c.A.map((a, i) => S.fraction(c.m * a + c.n * c.B[i], total));
    return [
      {
        kind: 'fields',
        label: 'Penyebut',
        prompt: 'Rumus titik pembagi: $\\vec{p} = \\dfrac{n\\,\\vec{a} + m\\,\\vec{b}}{m + n}$. Berapa **penyebutnya**?',
        fields: [{ key: 'den', label: '$m + n =$', mode: 'integer' }],
        check: (values) => same(values.den.value, total) || { toast: 'penyebutSalah' },
        summary: () => `$m + n = ${total}$`,
      },
      {
        kind: 'fields',
        label: 'Koordinat $P$',
        prompt: 'Hitung koordinat $P$. Pecahan boleh dipakai.',
        fields: componentFields(2, { mode: 'fraction' }),
        check: (values) => {
          const s = componentValues(values, 2);
          if (matches(s, P)) return true;
          const wrong = wrongKeys(s, P);
          if (matches(s, swapped)) return { toast: 'mnTertukar', values: { m: c.m, n: c.n }, wrong };
          if (c.m > 0 && c.n > 0) {
            const t = [0, 1].map((i) => (c.B[i] === c.A[i] ? null : (S.toNumber(s[i]) - c.A[i]) / (c.B[i] - c.A[i]))).filter((x) => x !== null);
            if (t.some((x) => x < 0 || x > 1)) return { toast: 'titikDiLuarRuas', values: { m: c.m, n: c.n }, wrong };
          }
          return { toast: 'ujiEkstremGagal', wrong };
        },
        summary: () => `$P = \\left(${P.map((q) => S.toLatexS(q)).join(',\\ ')}\\right)$`,
        onSolved: () => {
          const point = P.map((q) => S.toNumber(q));
          const vp = this.plane.viewport;
          if (vp && point[0] >= vp.xMin && point[0] <= vp.xMax && point[1] >= vp.yMin && point[1] <= vp.yMax) {
            this.drawPoint(point, { label: 'P', essential: true });
            this.plane.drawSegment(c.A, point, { dashed: false });
          } else {
            this.givenEl.appendChild(givenBlock(`$P${texTuple(point)}$ berada di luar area bidang yang ditampilkan — jauh di perpanjangan ruas $AB$.`, 'sim-given--muted'));
          }
        },
      },
    ];
  }
}

export const ENGINES = {
  triangle_rule: TriangleRuleSim,
  parallelogram_rule: ParallelogramRuleSim,
  component_add: ComponentAddSim,
  scalar_sweep: ScalarSweepSim,
  combo_vector_op: ComboVectorOpSim,
  equality_link: EqualityLinkSim,
  collinear_check: CollinearCheckSim,
  section_point: SectionPointSim,
};
