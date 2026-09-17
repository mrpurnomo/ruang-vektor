/**
 * lesson/simulations/simModeling.js — Engine simulasi Bab 4: Pemodelan TKA & Geometri Ruang.
 *
 *   parameter_hunter    Buru parameter di dalam modulus (Taktik TKA 1)
 *   quad_builder        Terjemahkan sifat bangun menjadi persamaan (Taktik TKA 2)
 *   chain_displacement  Ambang waktu sekali hitung (Taktik TKA 3)
 *   box_diagonal        Susun diagonal balok dari rusuk (Taktik TKA 4)
 *   sniper_component    Redupkan yang tidak dipakai (Taktik TKA 5)
 */

import { CaseSimulation, tex, texNum, texColumn, texColumnRaw, texTuple, same, givenBlock, AXES } from './simKit.js';
import { el, makeTappable } from './simCore.js';
import * as S from '../../domain/surd.js';
import * as Val from '../../domain/validator.js';

/* ------------------------------------------------------------
   Pembantu: bentuk linear c·x + d
   ------------------------------------------------------------ */
function parseLinear(expr) {
  const text = String(expr).replace(/\s+/g, '');
  if (/^-?\d+$/.test(text)) return { coef: 0, constant: Number(text), variable: null };
  const m = /^(-?\d*)([a-z])([+-]\d+)?$/.exec(text);
  if (!m) throw new Error(`Bentuk "${expr}" tidak dikenali`);
  const coef = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
  return { coef, variable: m[2], constant: m[3] ? Number(m[3]) : 0 };
}

const wrapTex = (expr) => (/^[a-z0-9]+$/i.test(expr) && !/[+-]/.test(expr) && !/^\d+[a-z]$/.test(expr) ? expr : `(${expr})`);

/* ============================================================
   21. parameter_hunter — Buru Parameternya
   ============================================================ */
export class ParameterHunterSim extends CaseSimulation {
  usesPlane() {
    return false;
  }

  caseLabel(c, i) {
    return `Soal ${i + 1}`;
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${texColumnRaw(c.v)},\\quad |\\vec{v}| = ${c.norm}`), 'sim-given--display'));
    if (c.constraint) this.givenEl.appendChild(givenBlock(`Syarat: ${tex(c.constraint)}`, 'sim-given--quote'));
  }

  buildSteps(c) {
    const terms = c.v.map(parseLinear);
    const A = terms.reduce((s, t) => s + t.coef * t.coef, 0);
    const B = terms.reduce((s, t) => s + 2 * t.coef * t.constant, 0);
    const C = terms.reduce((s, t) => s + t.constant * t.constant, 0);
    const R = c.norm * c.norm;
    const variable = terms.find((t) => t.variable).variable;
    const squares = c.v.map((e) => `${wrapTex(e)}^2`).join(' + ');
    const coefSuku = c.v.find((e) => Math.abs(parseLinear(e).coef) > 1) || c.v[0];
    const midSuku = c.v.find((e) => { const t = parseLinear(e); return t.coef !== 0 && t.constant !== 0; });

    const steps = [
      {
        kind: 'choice',
        label: 'Susun rumus modulus',
        prompt: 'Langkah 1: tulis persamaan panjangnya lebih dulu. Mana yang benar?',
        options: [
          { key: 'sum', label: `$${c.v.join(' + ')} = ${c.norm}$` },
          { key: 'modulus', label: `$\\sqrt{${squares}} = ${c.norm}$` },
          { key: 'squareSum', label: `$(${c.v.join(' + ')})^2 = ${c.norm}$` },
        ],
        check: (key) => key === 'modulus' || { message: 'Belum tepat — panjang vektor adalah **akar dari jumlah kuadrat** setiap komponennya, bukan jumlah komponennya.' },
        summary: () => `$\\sqrt{${squares}} = ${c.norm}$`,
      },
      {
        kind: 'fields',
        label: 'Kuadratkan kedua ruas',
        prompt: `Langkah 2: kuadratkan **kedua ruas**, uraikan, lalu kumpulkan suku sejenis menjadi $A${variable}^2 + B${variable} + C = R$.`,
        fields: [
          { key: 'A', label: '', suffix: `$${variable}^2 \\;+$`, mode: 'integer' },
          { key: 'B', label: '', suffix: `$${variable} \\;+$`, mode: 'integer' },
          { key: 'C', label: '', suffix: '$=$', mode: 'integer' },
          { key: 'R', label: '', mode: 'integer' },
        ],
        check: (values) => {
          const want = { A, B, C, R };
          const wrong = Object.keys(want).filter((k) => !same(values[k].value, want[k]));
          if (!wrong.length) return true;
          if (wrong.includes('R') && same(values.R.value, c.norm)) return { toast: 'ruasKananLupa', wrong };
          const naiveA = terms.reduce((s, t) => s + Math.abs(t.coef), 0);
          if (wrong.includes('A') && same(values.A.value, naiveA) && naiveA !== A) return { toast: 'koefisienTidakTerkuadrat', values: { suku: coefSuku }, wrong };
          if (wrong.includes('B') && B !== 0 && same(values.B.value, 0)) return { toast: 'sukuTengahHilang', values: { suku: midSuku || c.v[0] }, wrong };
          return { message: 'Belum tepat — uraikan setiap kuadrat satu per satu, lalu jumlahkan koefisien yang sejenis.', wrong };
        },
        // Suku nol dilewati: "9m² = 81", bukan "9m² + 0m + 0 = 81".
        summary: () => {
          const parts = [[A, `${variable}^2`], [B, variable], [C, '']]
            .filter(([k]) => k !== 0)
            .map(([k, v], i) => `${k < 0 ? '- ' : i ? '+ ' : ''}${Math.abs(k) === 1 && v ? '' : Math.abs(k)}${v}`);
          return `$${parts.join(' ')} = ${R}$`;
        },
      },
      {
        kind: 'fields',
        label: 'Kedua akar',
        prompt: `Langkah 3: selesaikan persamaan kuadratnya. Tulis **kedua** nilai $${variable}$ (urutan bebas).`,
        fields: [
          { key: 'r1', label: `$${variable}_1 =$`, mode: 'fraction' },
          { key: 'r2', label: `$${variable}_2 =$`, mode: 'fraction' },
        ],
        check: (values) => {
          const [a, b] = [values.r1.value, values.r2.value];
          const [p, q] = c.roots;
          if ((same(a, p) && same(b, q)) || (same(a, q) && same(b, p))) return true;
          const hits = [a, b].filter((x) => same(x, p) || same(x, q)).length;
          if (hits === 1) return { toast: 'akarKeduaBelumDicari', wrong: same(a, p) || same(a, q) ? ['r2'] : ['r1'] };
          return { message: `Belum tepat — pindahkan $${R}$ ke ruas kiri, bagi dengan faktor persekutuannya bila ada, lalu faktorkan.`, wrong: ['r1', 'r2'] };
        },
        summary: () => `$${variable} = ${c.roots[0]}$ atau $${variable} = ${c.roots[1]}$`,
      },
    ];

    if (c.constraint) {
      const valid = c.roots.filter((r) => (/>\s*0/.test(c.constraint) ? r > 0 : /<\s*0/.test(c.constraint) ? r < 0 : true));
      steps.push({
        kind: 'choice',
        label: 'Periksa syarat',
        prompt: `Langkah 4: soal memberi syarat $${c.constraint}$. Nilai mana yang memenuhi?`,
        options: [
          ...c.roots.map((r) => ({ key: `root${r}`, label: `$${variable} = ${r}$` })),
          { key: 'both', label: 'Keduanya' },
        ],
        check: (key) => {
          if (valid.length === 1 && key === `root${valid[0]}`) return true;
          if (key === 'both') return { toast: 'syaratTerlewat', values: { syarat: c.constraint } };
          return { message: `Belum tepat — substitusikan nilai itu ke syarat $${c.constraint}$: apakah benar?` };
        },
      });
    }
    return steps;
  }
}

/* ============================================================
   22. quad_builder — Terjemahkan Sifatnya
   ============================================================ */
// Pilihan terjemahan DITURUNKAN dari data soal (komponen AD), bukan ditulis mati.
const FACTS = {
  alas_mendatar: {
    label: 'alas mendatar',
    options: ({ AD }) => [
      { key: 'len', label: '$|\\overrightarrow{BC}| = |\\overrightarrow{AD}|$' },
      { key: 'ok', label: `Komponen $y$ keduanya sama: $b = ${AD[1]}$` },
      { key: 'eq', label: '$\\overrightarrow{BC} = \\overrightarrow{AD}$' },
    ],
  },
  kaki_sama_panjang: {
    label: 'kaki sama panjang',
    options: ({ AD }) => [
      { key: 'sum', label: `$a + b = ${AD[0]} + ${AD[1]}$` },
      { key: 'eq', label: '$\\overrightarrow{BC} = \\overrightarrow{AD}$' },
      { key: 'ok', label: `$a^2 + b^2 = ${AD[0]}^2 + ${AD[1]}^2$` },
    ],
  },
  sisi_berhadapan_sama: {
    label: 'sisi berhadapan sama (jajar genjang)',
    options: () => [
      { key: 'ok', label: '$\\overrightarrow{BC} = \\overrightarrow{AD}$' },
      { key: 'ab', label: '$\\overrightarrow{BC} = \\overrightarrow{AB}$' },
      { key: 'len', label: '$|\\overrightarrow{BC}| = |\\overrightarrow{AB}|$' },
    ],
  },
};

export class QuadBuilderSim extends CaseSimulation {
  caseLabel(c) {
    return c.shape === 'jajargenjang' ? 'Jajar genjang' : 'Trapesium';
  }

  setupCase(c) {
    const g = c.given;
    const parts = [`A${texTuple(g.A)}`, `\\overrightarrow{AB} = ${texColumn(g.AB)}`, `\\overrightarrow{AD} = ${texColumn(g.AD)}`];
    if (g.BC) parts.push(`\\overrightarrow{BC} = \\begin{pmatrix} ${g.BC.join(' \\\\ ')} \\end{pmatrix}`);
    const title = c.shape === 'jajargenjang' ? 'Jajar genjang $ABCD$' : 'Trapesium sama kaki $ABCD$ beralas mendatar';
    this.givenEl.appendChild(givenBlock(`${title}: ${tex(parts.join(',\\; '))}`));
    this.givenEl.appendChild(givenBlock(`Ditanyakan: ${tex(c.ask === 'AC' ? '\\overrightarrow{AC}' : c.ask)}`, 'sim-given--quote'));
    const B = g.AB.map((n, i) => g.A[i] + n);
    const D = g.AD.map((n, i) => g.A[i] + n);
    this.pts = { A: g.A, B, D };
    this.drawPoint(g.A, { label: 'A', essential: true });
    this.drawPoint(B, { label: 'B', essential: true });
    this.drawPoint(D, { label: 'D', essential: true });
    this.drawVector({ from: g.A, to: B, name: 'AB' });
    this.drawVector({ from: g.A, to: D, name: 'AD', tone: 'cyan' });
  }

  factStep(fact, given) {
    const spec = FACTS[fact];
    const options = spec.options(given);
    return {
      kind: 'choice',
      label: `Sifat: ${spec.label}`,
      prompt: `Terjemahkan kata **${spec.label}** menjadi persamaan vektor.`,
      options,
      check: (key) => key === 'ok' || { toast: 'salahTerjemahan', values: { sifat: spec.label } },
      summary: () => options.find((o) => o.key === 'ok').label,
    };
  }

  buildSteps(c) {
    const steps = c.facts.map((fact) => this.factStep(fact, c.given));
    const { B, D } = this.pts;

    if (c.shape === 'jajargenjang') {
      steps.push({
        kind: 'fields',
        label: '$\\overrightarrow{AC}$',
        prompt: '$\\overrightarrow{AC} = \\overrightarrow{AB} + \\overrightarrow{BC}$. Hitung komponennya.',
        fields: AXES.slice(0, 2).map((a) => ({ key: `c${a}`, label: `$${a}$`, mode: 'integer' })),
        check: (values) => {
          const s = [values.cx.value, values.cy.value];
          const wrong = ['cx', 'cy'].filter((k, i) => !same(s[i], c.answer[i]));
          return wrong.length === 0 || { message: 'Belum tepat — ganti $\\overrightarrow{BC}$ dengan vektor yang sama dengannya, lalu jumlahkan komponen seletak.', wrong };
        },
        summary: () => `$\\overrightarrow{AC} = ${texTuple(c.answer)}$`,
        onSolved: () => {
          const C = c.answer;
          this.drawPoint(C, { label: 'C', essential: true });
          this.drawVector({ from: B, to: C, name: 'BC', tone: 'muted' });
          this.drawVector({ from: [0, 0], to: C, name: 'AC', tone: 'success' }, { essential: true });
        },
      });
      return steps;
    }

    const aSquared = c.solve.a2;
    const b = c.solve.b;
    steps.push({
      kind: 'fields',
      label: '$a^2$',
      prompt: `Dengan $b = ${b}$, persamaan panjang menjadi $a^2 + ${b}^2 = ${c.given.AD[0] ** 2 + c.given.AD[1] ** 2}$. Berapa $a^2$? (Tidak perlu mencari $a$.)`,
      fields: [{ key: 'a2', label: '$a^2 =$', mode: 'integer' }],
      check: (values) => same(values.a2.value, aSquared) || { message: `Belum tepat — kurangkan $${b}^2$ dari kedua ruas.` },
      summary: () => `$a^2 = ${aSquared}$`,
    });
    steps.push({
      kind: 'fields',
      label: 'Jawab yang ditanya',
      prompt: `Soal menanyakan $${c.ask}$. Hitung nilainya.`,
      fields: [{ key: 'ans', label: `$${c.ask} =$`, mode: 'integer' }],
      check: (values) => {
        if (same(values.ans.value, c.answer)) return true;
        const other = [aSquared, b, 2 * b].find((x) => same(values.ans.value, x));
        if (other !== undefined) return { toast: 'jawabPertanyaanLain', values: { diperoleh: other, diminta: c.ask } };
        return { message: `Belum tepat — substitusikan $a^2 = ${aSquared}$ dan $b = ${b}$ ke $${c.ask}$.` };
      },
      summary: () => `$${c.ask} = ${c.answer}$`,
      onSolved: () => {
        const C = [D[0] + c.given.AB[0] - 2 * c.given.AD[0], D[1]];
        this.drawPoint(C, { label: 'C', essential: true });
        this.drawVector({ from: B, to: C, name: 'BC', tone: 'success' }, { essential: true });
        this.plane.drawSegment(D, C);
      },
    });
    return steps;
  }
}

/* ============================================================
   23. chain_displacement — Ambang Waktu Sekali Hitung
   ============================================================ */
export class ChainDisplacementSim extends CaseSimulation {
  usesPlane() {
    return false;
  }

  caseLabel() {
    return 'Kereta A → E';
  }

  setupCase(c) {
    const segments = c.stops.slice(1).map((s, i) => [`${c.stops[i]}${s}`, c.times[i]]);
    const rows = segments.map(([name, t]) => `<tr><td>${tex(`${name[0]} \\to ${name[1]}`)}</td><td class="num">${t} menit</td></tr>`).join('');
    this.givenEl.appendChild(givenBlock(`Kereta melaju lurus dengan kecepatan konstan dari ${tex(`A${texTuple(c.A)}`)} ke ${tex(`E${texTuple(c.E)}`)} (km).`));
    this.givenEl.appendChild(el('div', 'data-table-wrap', `<table class="data-table"><thead><tr><th>Ruas</th><th>Waktu</th></tr></thead><tbody>${rows}</tbody></table>`));
    this.givenEl.appendChild(givenBlock(`Ruas mana yang jaraknya <strong>kurang dari ${String(c.threshold).replace('.', ',')} km</strong>?`, 'sim-given--quote'));
  }

  buildSteps(c) {
    const AE = c.E.map((n, i) => n - c.A[i]);
    const sq = AE.reduce((s, n) => s + n * n, 0);
    const length = S.fromSquare(sq);
    const total = c.times.reduce((a, b) => a + b, 0);
    const lengthNum = Math.sqrt(sq);
    const tStar = (c.threshold * total) / lengthNum;
    const segmentTimes = Object.fromEntries(c.stops.slice(1).map((s, i) => [`${c.stops[i]}${s}`, c.times[i]]));
    segmentTimes.CE = (segmentTimes.CD || 0) + (segmentTimes.DE || 0);
    const options = [...c.stops.slice(1).map((s, i) => `${c.stops[i]}${s}`), 'CE'];
    const expected = new Set(c.answer);

    return [
      {
        kind: 'fields',
        label: '$\\overrightarrow{AE}$',
        prompt: 'Langkah 1: vektor lintasan total $\\overrightarrow{AE} = E - A$.',
        fields: AXES.map((a) => ({ key: `c${a}`, label: `$${a}$`, mode: 'integer' })),
        check: (values) => {
          const wrong = AXES.map((a, i) => (same(values[`c${a}`].value, AE[i]) ? null : `c${a}`)).filter(Boolean);
          return wrong.length === 0 || { message: 'Belum tepat — ujung dikurangi pangkal: $E - A$, komponen demi komponen.', wrong };
        },
        summary: () => `$\\overrightarrow{AE} = ${texTuple(AE)}$`,
      },
      {
        kind: 'fields',
        label: 'Jarak total',
        prompt: 'Langkah 2: jarak total $|\\overrightarrow{AE}|$ — **simpan dalam bentuk akar**, jangan dibulatkan.',
        fields: [{ key: 'len', label: '$|\\overrightarrow{AE}| =$', suffix: 'km', mode: 'surd' }],
        check: (values) => {
          const verdict = Val.checkExactAnswer(values.len.raw, length);
          if (verdict.correct) return true;
          if (verdict.code === 'decimal') return { toast: 'dibulatkanTerlaluDini' };
          return { message: verdict.reason };
        },
        summary: () => `$|\\overrightarrow{AE}| = \\sqrt{${sq}} = ${S.toLatexS(length)}$ km`,
      },
      {
        kind: 'fields',
        label: 'Waktu total',
        prompt: 'Langkah 3: waktu tempuh total dari tabel.',
        fields: [{ key: 'total', label: 'Total $=$', suffix: 'menit', mode: 'integer' }],
        check: (values) => same(values.total.value, total) || { toast: 'waktuTotalSalah' },
        summary: () => `Waktu total $= ${total}$ menit`,
      },
      {
        kind: 'fields',
        label: 'Ambang waktu',
        prompt: `Langkah 4: jarak berbanding lurus dengan waktu. Ruas berjarak tepat ${String(c.threshold).replace('.', ',')} km butuh berapa menit? Bulatkan **dua** angka di belakang koma — baru sekarang.`,
        fields: [{ key: 't', label: '$t^{*} =$', suffix: 'menit', mode: 'fraction' }],
        check: (values) => {
          const value = S.toNumber(values.t.value);
          if (Math.abs(value - tStar) <= 0.011) return true;
          if (Math.abs(value - (lengthNum * total) / c.threshold) <= 0.05) return { toast: 'prosesTerbalik' };
          return { message: 'Belum tepat — dari $\\dfrac{t}{\\text{waktu total}} \\times \\text{jarak total} = \\text{ambang}$, selesaikan untuk $t$.' };
        },
        summary: () => `$t^{*} \\approx ${tStar.toFixed(2).replace('.', '{,}')}$ menit`,
      },
      {
        kind: 'multi',
        label: 'Pilih ruas',
        prompt: 'Langkah 5: pilih **semua** ruas yang jaraknya kurang dari ambang — cukup bandingkan waktunya dengan $t^{*}$.',
        options: options.map((o) => ({ key: o, label: `$${o}$${o === 'CE' ? ' (gabungan)' : ''}` })),
        check: (picked) => {
          const same_ = picked.size === expected.size && [...expected].every((k) => picked.has(k));
          if (same_) return true;
          const extra = [...picked].find((k) => !expected.has(k));
          if (extra === 'CE') return { toast: 'ruasGabunganTerlewat', values: { ruas: 'CE' } };
          if (extra) return { message: `Ruas $${extra}$ butuh waktu yang **tidak** di bawah ambang $t^{*}$ — jaraknya tidak kurang dari ambang.` };
          return { message: 'Masih ada ruas yang waktunya di bawah ambang tetapi belum kamu pilih. Bandingkan setiap baris tabel dengan $t^{*}$.' };
        },
      },
    ];
  }
}

/* ============================================================
   24. box_diagonal — Susun Diagonalnya dari Rusuk
   ============================================================ */
const VERTICES = { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] };
const EDGES = ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'];
const SVG_NS = 'http://www.w3.org/2000/svg';

function boxFigure(p, l, t) {
  const W = 300;
  const H = 190;
  const scale = Math.min(170 / p, 90 / t, 120 / (l * 0.6 + 1));
  const project = ([x, y, z]) => [30 + x * p * scale + y * l * scale * 0.5, H - 20 - (z * t * scale + y * l * scale * 0.35)];
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'sim-box');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Balok ABCD.EFGH berukuran ${p} × ${l} × ${t}`);
  const hidden = new Set(['CD', 'DA', 'DH']);
  for (const edge of EDGES) {
    const [a, b] = [project(VERTICES[edge[0]]), project(VERTICES[edge[1]])];
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', a[0]); line.setAttribute('y1', a[1]);
    line.setAttribute('x2', b[0]); line.setAttribute('y2', b[1]);
    line.setAttribute('class', `sim-box__edge${hidden.has(edge) ? ' sim-box__edge--hidden' : ''}`);
    svg.appendChild(line);
  }
  for (const [name, v] of Object.entries(VERTICES)) {
    const [x, y] = project(v);
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', x + (v[0] ? 6 : -12));
    label.setAttribute('y', y + (v[2] ? -5 : 13));
    label.setAttribute('class', 'sim-box__label');
    label.textContent = name;
    svg.appendChild(label);
  }
  svg.drawDiagonal = (from, to) => {
    const [a, b] = [project(VERTICES[from]), project(VERTICES[to])];
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', a[0]); line.setAttribute('y1', a[1]);
    line.setAttribute('x2', b[0]); line.setAttribute('y2', b[1]);
    line.setAttribute('class', 'sim-box__diagonal');
    svg.appendChild(line);
  };
  return svg;
}

export class BoxDiagonalSim extends CaseSimulation {
  usesPlane() {
    return false;
  }

  caseLabel(c) {
    return `$\\overrightarrow{${c.ask}}$`;
  }

  setupCase(c) {
    this.figure = boxFigure(c.p, c.l, c.t);
    this.givenEl.appendChild(this.figure);
    this.givenEl.appendChild(givenBlock(`${tex(`\\overrightarrow{AB} = ${texColumn([c.p, 0, 0])},\\; \\overrightarrow{AD} = ${texColumn([0, c.l, 0])},\\; \\overrightarrow{AE} = ${texColumn([0, 0, c.t])}`)}`, 'sim-given--display'));
  }

  buildSteps(c) {
    const edgeFor = ['AB', 'AD', 'AE'];
    const expected = new Set(c.expect.map((n, i) => (n === 0 ? null : `${n < 0 ? '-' : '+'}${edgeFor[i]}`)).filter(Boolean));
    const count = expected.size;
    const kind = count === 3 ? 'diagonal ruang' : 'diagonal bidang';
    const sq = c.expect.reduce((s, n) => s + n * n, 0);
    const length = S.fromSquare(sq);
    const hasNegative = c.expect.some((n) => n < 0);

    return [
      {
        kind: 'multi',
        label: 'Pilih rusuk',
        prompt: `Susun $\\overrightarrow{${c.ask}}$ (sebuah ${kind}) dari rusuk-rusuk balok. Pilih rusuk **beserta arahnya**.`,
        options: ['+AB', '-AB', '+AD', '-AD', '+AE', '-AE'].map((key) => ({
          key,
          label: `$${key[0] === '-' ? '-' : '+'}\\overrightarrow{${key.slice(1)}}$`,
        })),
        check: (picked) => {
          if (picked.size === count && [...expected].every((k) => picked.has(k))) return true;
          if (picked.size < count) return { toast: 'rusukKurang', values: { nama: c.ask, jumlah: picked.size } };
          if (picked.size > count) return { toast: 'rusukBerlebih', values: { nama: c.ask, seharusnya: count } };
          if (picked.has('+AB') && expected.has('-AB')) return { toast: 'arahMundurTerlewat', values: { nama: c.ask, pangkal: c.ask[0] } };
          return { message: `Belum tepat — telusuri jalan dari titik $${c.ask[0]}$ ke titik $${c.ask[1]}$ sepanjang rusuk: arah mana saja yang dilewati, maju atau mundur?` };
        },
        onSolved: () => this.figure.drawDiagonal(c.ask[0], c.ask[1]),
      },
      {
        kind: 'fields',
        label: 'Komponen',
        prompt: `Jumlahkan rusuk-rusuk itu: tulis komponen $\\overrightarrow{${c.ask}}$.`,
        fields: AXES.map((a) => ({ key: `c${a}`, label: `$${a}$`, mode: 'integer' })),
        check: (values) => {
          const wrong = AXES.map((a, i) => (same(values[`c${a}`].value, c.expect[i]) ? null : `c${a}`)).filter(Boolean);
          if (!wrong.length) return true;
          if (hasNegative && same(values.cx.value, -c.expect[0])) return { toast: 'arahMundurTerlewat', values: { nama: c.ask, pangkal: c.ask[0] }, wrong };
          return { message: 'Belum tepat — setiap rusuk menyumbang ke satu komponen saja; rusuk yang ditempuh mundur menyumbang tanda negatif.', wrong };
        },
        summary: () => `$\\overrightarrow{${c.ask}} = ${texTuple(c.expect)}$`,
      },
      {
        kind: 'fields',
        label: 'Panjang',
        prompt: `Hitung panjang $\\overrightarrow{${c.ask}}$ dalam bentuk paling sederhana.`,
        fields: [{ key: 'len', label: `$|\\overrightarrow{${c.ask}}| =$`, mode: 'surd' }],
        check: (values) => {
          const verdict = Val.checkExactAnswer(values.len.raw, length, { requireSimplest: true });
          if (verdict.correct) return true;
          if (verdict.code === 'not-simplest' || verdict.code === 'decimal') return { message: verdict.reason };
          return { toast: 'panjangSalah' };
        },
        summary: () => `$|\\overrightarrow{${c.ask}}| = ${S.toLatexS(length)}$`,
        successToast: hasNegative ? 'tandaTidakBerpengaruh' : null,
      },
    ];
  }
}

/* ============================================================
   25. sniper_component — Redupkan yang Tidak Dipakai
   ============================================================ */
export class SniperComponentSim extends CaseSimulation {
  usesPlane() {
    return false;
  }

  caseLabel(c) {
    return c.op === 'norm' ? 'Modulus' : c.op === 'perp' ? 'Tegak lurus' : 'Hasil kali titik';
  }

  caseSuccessKey(c) {
    return c.sniperFails ? 'sniperTidakBerlaku' : 'success';
  }

  setupCase(c) {
    if (c.op === 'norm') {
      this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${texColumnRaw(c.v)},\\quad |\\vec{v}| = ${c.result}`), 'sim-given--display'));
      return;
    }
    const [L, R, ln, rn] = c.op === 'perp' ? [c.a, c.b, 'a', 'b'] : [c.u, c.v, 'u', 'v'];
    const show = (arr) => `\\begin{pmatrix} ${arr.join(' \\\\ ')} \\end{pmatrix}`;
    const relation = c.op === 'perp' ? `\\vec{${ln}} \\perp \\vec{${rn}}` : `\\vec{${ln}}\\cdot\\vec{${rn}} = ${c.result}`;
    this.givenEl.appendChild(givenBlock(tex(`\\vec{${ln}} = ${show(L)},\\quad \\vec{${rn}} = ${show(R)},\\quad ${relation}`), 'sim-given--display'));

    const row = el('div', 'sim-terms');
    this.termNodes = L.map((x, i) => {
      const node = el('button', 'sim-term', tex(`(${x})(${R[i]})`));
      node.type = 'button';
      row.appendChild(node);
      if (i < L.length - 1) row.appendChild(el('span', 'sim-term__plus', tex('+')));
      return node;
    });
    row.appendChild(el('span', 'sim-term__plus', tex(`= ${c.result}`)));
    this.givenEl.appendChild(row);
  }

  buildSteps(c) {
    if (c.op === 'norm') {
      return [{
        kind: 'choice',
        label: 'Sniper berlaku?',
        prompt: 'Parameter $m$ muncul di beberapa komponen. Bisakah taktik sniper (memisahkan satu suku linear) dipakai di sini?',
        options: [
          { key: 'yes', label: 'Bisa — buru suku yang memuat $m$' },
          { key: 'no', label: 'Tidak bisa — setiap komponen dikuadratkan, $m$ tidak lagi linear' },
        ],
        check: (key) => key === 'no' || { toast: 'sniperTidakBerlaku' },
      }];
    }

    const [L, R] = c.op === 'perp' ? [c.a, c.b] : [c.u, c.v];
    const pIndex = L.findIndex((x) => typeof x === 'string');
    const parameter = L[pIndex];
    const constant = L.reduce((s, x, i) => (i === pIndex ? s : s + x * R[i]), 0);
    const coefficient = R[pIndex];

    return [
      {
        kind: 'tap',
        label: 'Buru suku',
        prompt: `Ketuk suku yang memuat parameter $${parameter}$ — hanya suku itu yang perlu dijaga bentuknya.`,
        intro: 'Ketuk salah satu suku di baris hasil kali titik.',
        targets: () => this.termNodes.map((node, i) => ({ key: `t${i}`, node, label: `Suku ke-${i + 1}` })),
        check: (key) => key === `t${pIndex}` || { toast: 'sukuSalahDipilih', values: { parameter } },
        onSolved: () => this.termNodes.forEach((node, i) => node.classList.toggle('is-muted', i !== pIndex)),
      },
      {
        kind: 'fields',
        label: 'Satukan konstanta',
        prompt: 'Suku yang diredupkan hanyalah bilangan. Jumlahkan **semuanya sekaligus** menjadi satu konstanta.',
        fields: [{ key: 'const', label: 'Jumlah suku konstanta $=$', mode: 'integer' }],
        check: (values) => same(values.const.value, constant) || { toast: 'konstantaBelumDijumlah' },
        summary: () => `Konstanta $= ${constant}$`,
        onSolved: () => this.termNodes.forEach((node) => node.classList.remove('is-muted')),
      },
      {
        kind: 'fields',
        label: `Selesaikan $${parameter}$`,
        prompt: `Sekarang persamaannya linear: $${constant} ${coefficient < 0 ? '-' : '+'} ${Math.abs(coefficient) === 1 ? '' : Math.abs(coefficient)}${parameter} = ${c.result}$. Berapa $${parameter}$?`,
        fields: [{ key: 'p', label: `$${parameter} =$`, mode: 'fraction' }],
        check: (values) => same(values.p.value, c.solve) || { message: `Belum tepat — pindahkan $${constant}$ ke ruas kanan, lalu bagi dengan koefisien $${parameter}$, termasuk tandanya.` },
        summary: () => `$${parameter} = ${texNum(c.solve)}$`,
      },
    ];
  }
}

export const ENGINES = {
  parameter_hunter: ParameterHunterSim,
  quad_builder: QuadBuilderSim,
  chain_displacement: ChainDisplacementSim,
  box_diagonal: BoxDiagonalSim,
  sniper_component: SniperComponentSim,
};
