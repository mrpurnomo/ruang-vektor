/**
 * lesson/simulations/simOperations.js — Simulasi TERPANDU Bab 2 (Operasi & Bangun Datar).
 *
 * Kedelapan sub-topik ditulis ulang mengikuti pola sub-topik Bab 1 dan aturan
 * guru (handoff §9): gambar → pertanyaan → alat yang sudah dikenal → siswa
 * menghitung sendiri langkah demi langkah → kasus yang lebih sulit → kasus
 * tanpa gambar. Kasus tanpa gambar boleh memakai vektor tiga komponen —
 * cukup hitungannya, tanpa ruang 3D.
 *
 *   triangle_guided       Aturan segitiga & poligon (sambung ujung ke pangkal)
 *   parallelogram_guided  Aturan jajar genjang: dua diagonal, jumlah dan selisih
 *   component_guided      Jumlah & selisih komponen yang seletak
 *   scalar_guided         Perkalian skalar: v + v + v = 3v
 *   combo_guided          Kombinasi operasi: perkalian skalar dulu
 *   equality_guided       Kesamaan dua vektor & persamaan komponen
 *   collinear_guided      Titik segaris: satu nilai k untuk semua komponen
 *   section_guided        Pembagian ruas garis: bagian-bagian yang sama panjang
 *
 * Kontrak yang sama dengan Bab 1: gambar hasil HANYA di onSolved, kalimat
 * salah tidak membocorkan kunci, setiap langkah punya `hint`.
 */

import { CaseSimulation, tex, texNum, texColumnRaw, texTuple, same, givenBlock, mixed } from './simKit.js';
import * as S from '../../domain/surd.js';
import * as Val from '../../domain/validator.js';
import {
  ARROW_MS, stillMotion, springPop, animateHops, arrowStep, tapped, samePoint,
  componentFields, componentValues, firstWrong, wrongKeys, ghostHops, ghostCross, pulsePoint, ghostArrow,
} from './guidedKit.js';

/* ============================================================
   UTILITAS BERSAMA (tanpa kalimat toast — kalimat milik tiap kelas)
   ============================================================ */

const add = (p, q) => p.map((n, i) => n + q[i]);
const sub = (p, q) => p.map((n, i) => n - q[i]);
const mul = (k, p) => p.map((n) => k * n);
const neg = (p) => p.map((n) => -n);
const ORDINAL = ['pertama', 'kedua', 'ketiga'];

/** Vektor kolom eksak; komponen boleh pecahan. */
const col = (arr) => texColumnRaw(arr.map((n) => texNum(n)));

/** "A(1,\, 1)" untuk label titik dan kalimat. */
const pointTex = (name, p) => `${name}${texTuple(p)}`;
const named = (name, p) => `$${pointTex(name, p)}$`;

/** Bilangan dalam rumus: negatif diberi kurung, "4 - (-2)". */
const paren = (n) => (n < 0 ? `(${n})` : `${n}`);

/** Rentang bidang yang memuat O dan semua titik, dengan ruang untuk label. */
function boundsOf(points, { padX = [1, 2], padY = [1, 1] } = {}) {
  const pts = [[0, 0], ...points];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return {
    xRange: [Math.floor(Math.min(...xs)) - padX[0], Math.ceil(Math.max(...xs)) + padX[1]],
    yRange: [Math.floor(Math.min(...ys)) - padY[0], Math.ceil(Math.max(...ys)) + padY[1]],
  };
}

/** Isian vektor sudah tepat? */
const matches = (s, key) => firstWrong(s, key) < 0;

/**
 * Jenis kesalahan isian vektor, supaya kelas memilih kalimatnya sendiri:
 * 'ok' · 'sign' (semua tanda terbalik) · 'swap' (komponen tertukar) · 'other'.
 */
function vectorVerdict(s, key) {
  if (matches(s, key)) return 'ok';
  if (key.some((k) => k !== 0) && matches(s, neg(key))) return 'sign';
  if (key.length === 2 && key[0] !== key[1] && matches(s, [key[1], key[0]])) return 'swap';
  return 'other';
}

/** Titik berlabel koordinat; `this.marks[name]` dipakai panah dua ketukan. */
function markPoint(sim, name, p, { coords = true } = {}) {
  sim.marks[name] = sim.drawPoint(p, { label: coords ? pointTex(name, p) : name, essential: true });
  return sim.marks[name];
}

/** Panah yang tumbuh dari pangkal ke ujung (tempo konstan). */
async function growArrow(sim, from, to, { name, tone = 'blue', label, essential = true } = {}) {
  if (!sim.plane) return null;
  const arrow = sim.drawVector({ from, to: from, name, tone, label }, { essential });
  await arrow.setVector({ from, to }, { animate: !stillMotion(), duration: ARROW_MS });
  if (arrow.labelEl && arrow.labelEl.firstChild) springPop(arrow.labelEl.firstChild.firstChild);
  return arrow;
}

/** |k| salinan vektor `v` (atau −v bila k negatif) bersambung dari `from`. */
async function chainCopies(sim, from, v, k, { tone = 'muted' } = {}) {
  const step = k < 0 ? neg(v) : v;
  let at = from;
  for (let i = 0; i < Math.abs(k); i += 1) {
    const next = add(at, step);
    await growArrow(sim, at, next, { name: `salinan${i}`, tone, label: null, essential: false });
    at = next;
  }
}

/** Ujung-ujung garis melalui P berarah d, dipotong di tepi rentang bidang. */
function lineThrough(P, d, { xRange, yRange }) {
  let lo = -Infinity;
  let hi = Infinity;
  [[xRange, 0], [yRange, 1]].forEach(([[min, max], i]) => {
    if (d[i] === 0) return;
    const a = (min - P[i]) / d[i];
    const b = (max - P[i]) / d[i];
    lo = Math.max(lo, Math.min(a, b));
    hi = Math.min(hi, Math.max(a, b));
  });
  return [add(P, mul(lo, d)), add(P, mul(hi, d))];
}

/** Sorot panah bernama selama petunjuk tampil. */
function glow(sim, ...names) {
  names.forEach((n) => sim.plane && sim.plane.highlight(n, true));
  return () => names.forEach((n) => sim.plane && sim.plane.highlight(n, false));
}

/* ============================================================
   1. triangle_guided — Aturan Segitiga & Poligon

   Kasus 1 (terpandu): benda berpindah A → B → C; siswa menulis komponen
   a dan b, menggambar perpindahan total AC, menghitungnya dengan ujung −
   pangkal (Bab 1), lalu menemukan bahwa AC = a + b dan pangkal b ada di
   ujung a. Kasus 2: b tergambar terpisah → siswa memindahkannya sendiri.
   Kasus 3: tiga vektor bersambung (poligon). Kasus 4: tanpa gambar,
   cukup membaca huruf.
   ============================================================ */
export class GuidedTriangleSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind !== 'letters';
  }

  planeOptions(c) {
    if (c.kind === 'chain') return boundsOf([c.A, c.B, c.C]);
    if (c.kind === 'move') {
      const Q = add(c.P, c.a);
      return boundsOf([c.P, Q, c.R, add(c.R, c.b), add(Q, c.b)]);
    }
    return boundsOf([c.A, c.B, c.C, c.D]);
  }

  caseLabel(c) {
    return { chain: 'Bersambung', move: 'Digeser', polygon: 'Poligon', letters: 'Tanpa gambar' }[c.kind];
  }

  caseSuccessKey(c) {
    return { chain: 'success', move: 'successGeser', polygon: 'successPoligon', letters: 'successHuruf' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'chain') return 'Inilah **aturan segitiga**: pangkal $\\vec{b}$ di ujung $\\vec{a}$, lalu $\\vec{a} + \\vec{b}$ ditarik dari pangkal $\\vec{a}$ ke ujung $\\vec{b}$.';
    if (c.kind === 'polygon') return 'Aturan **poligon**: berapa pun banyaknya vektor yang bersambung, hasilnya dari titik **paling awal** ke titik **paling akhir**.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'move') return 'Bagaimana kalau kedua vektor **belum bersambung**? Kita geser dulu salah satunya.';
    if (next.kind === 'polygon') return 'Sekarang **tiga** vektor sekaligus. Apakah caranya masih sama?';
    return 'Terakhir, **tanpa gambar**: cukup perhatikan hurufnya.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Aturan Segitiga Dikuasai',
      recap: [
        '**Aturan segitiga**: pangkal $\\vec{b}$ diletakkan di ujung $\\vec{a}$; $\\vec{a} + \\vec{b}$ dari pangkal $\\vec{a}$ ke ujung $\\vec{b}$',
        'Vektor boleh **digeser** asalkan panjang dan arahnya tetap',
        '**Poligon**: $\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CD} = \\overrightarrow{AD}$, dan kembali ke awal = $\\vec{0}$',
      ],
    };
  }

  setupCase(c) {
    this.marks = {};
    if (c.kind === 'chain') {
      ['A', 'B', 'C'].forEach((n) => markPoint(this, n, c[n]));
      this.drawVector({ from: c.A, to: c.B, name: 'a', tone: 'blue' }, { essential: true });
      this.drawVector({ from: c.B, to: c.C, name: 'b', tone: 'blue' }, { essential: true });
      this.givenEl.appendChild(givenBlock(mixed(`Sebuah benda berpindah dari ${named('A', c.A)} ke ${named('B', c.B)} (vektor $\\vec{a}$), lalu dari $B$ ke ${named('C', c.C)} (vektor $\\vec{b}$).`)));
    } else if (c.kind === 'move') {
      const Q = add(c.P, c.a);
      const S0 = add(c.R, c.b);
      markPoint(this, 'P', c.P);
      markPoint(this, 'Q', Q);
      markPoint(this, 'R', c.R);
      markPoint(this, 'S', S0);
      this.drawVector({ from: c.P, to: Q, name: 'a', tone: 'blue' }, { essential: true });
      this.bArrow = this.drawVector({ from: c.R, to: S0, name: 'b', tone: 'blue' }, { essential: true });
      this.givenEl.appendChild(givenBlock(mixed('$\\vec{a} = \\overrightarrow{PQ}$ dan $\\vec{b} = \\overrightarrow{RS}$ tergambar **terpisah**. Kita ingin menghitung $\\vec{a} + \\vec{b}$.')));
    } else if (c.kind === 'polygon') {
      ['A', 'B', 'C', 'D'].forEach((n) => markPoint(this, n, c[n]));
      [['A', 'B'], ['B', 'C'], ['C', 'D']].forEach(([p, q]) => this.drawVector({ from: c[p], to: c[q], name: `${p}${q}`, tone: 'blue' }, { essential: true }));
      this.givenEl.appendChild(givenBlock(mixed('Benda berpindah tiga kali berturut-turut: dari $A$ ke $B$, dari $B$ ke $C$, lalu dari $C$ ke $D$.')));
    } else {
      this.givenEl.appendChild(givenBlock(mixed('Tanpa gambar. Perhatikan **huruf** pada nama setiap vektor: huruf pertama pangkal, huruf kedua ujung.'), 'sim-given--muted'));
    }
  }

  buildSteps(c) {
    if (c.kind === 'chain') return this.stepsChain(c);
    if (c.kind === 'move') return this.stepsMove(c);
    if (c.kind === 'polygon') return this.stepsPolygon(c);
    return this.stepsLetters();
  }

  stepsChain(c) {
    const { A, B, C } = c;
    const a = sub(B, A);
    const b = sub(C, B);
    const AC = sub(C, A);
    const points = () => ({ A, B, C });
    return [
      {
        kind: 'fields',
        label: 'Komponen $\\vec{a}$ dan $\\vec{b}$',
        prompt: 'Perhatikan gambar. Tulis dulu komponen $\\vec{a}$ dan $\\vec{b}$: hitung langkah mendatar dan tegaknya di kisi.',
        fields: [
          { key: 'ax', label: '$\\vec{a}$: $x$', mode: 'integer', aria: 'Komponen x vektor a' },
          { key: 'ay', label: '$y$', mode: 'integer', aria: 'Komponen y vektor a' },
          { key: 'bx', label: '$\\vec{b}$: $x$', mode: 'integer', aria: 'Komponen x vektor b' },
          { key: 'by', label: '$y$', mode: 'integer', aria: 'Komponen y vektor b' },
        ],
        check: (v) => {
          const sa = [v.ax.value, v.ay.value];
          const sb = [v.bx.value, v.by.value];
          const wa = vectorVerdict(sa, a);
          const wb = vectorVerdict(sb, b);
          if (wa === 'ok' && wb === 'ok') return true;
          const wrong = [...wrongKeys(sa, a, 'a'), ...wrongKeys(sb, b, 'b')];
          const bad = wa !== 'ok' ? wa : wb;
          if (bad === 'sign') return { toast: 'tandaKomponen', wrong };
          if (bad === 'swap') return { toast: 'komponenTertukar', wrong };
          return { toast: 'komponenSalah', wrong };
        },
        hint: () => ({
          text: 'Ikuti lompatan bayangan dari pangkal ke ujung setiap panah. Ke kanan dan ke atas bernilai **positif**, ke kiri dan ke bawah **negatif**.',
          show: () => {
            const x = ghostHops(this, A, a);
            const y = ghostHops(this, B, b);
            return () => { x(); y(); };
          },
          fields: 'wrong',
        }),
        summary: () => `$\\vec{a} = ${col(a)}$ dan $\\vec{b} = ${col(b)}$`,
      },
      arrowStep(this, {
        from: 'A',
        to: 'C',
        points,
        label: 'Gambar perpindahan total',
        prompt: 'Benda berangkat dari $A$ dan berhenti di $C$. Gambar **perpindahan totalnya**: ketuk pangkal, lalu ujungnya.',
        tone: 'cyan',
        summary: () => 'Perpindahan total: $\\overrightarrow{AC}$, dari titik berangkat ke titik berhenti.',
      }),
      {
        kind: 'fields',
        label: 'Hitung $\\overrightarrow{AC}$',
        prompt: 'Hitung komponen $\\overrightarrow{AC}$ dengan rumus dari Bab 1: **ujung dikurangi pangkal**.',
        fields: componentFields(2),
        check: (values) => {
          const s = componentValues(values, 2);
          const verdict = vectorVerdict(s, AC);
          if (verdict === 'ok') return true;
          if (verdict === 'sign') return { toast: 'tandaTerbalik', values: { nama: 'AC', kebalikan: 'CA' }, wrong: ['cx', 'cy'] };
          return { toast: 'hasilSalah', wrong: wrongKeys(s, AC) };
        },
        hint: () => ({
          text: `$\\overrightarrow{AC} = C - A$: $x = ${C[0]} - ${paren(A[0])}$ dan $y = ${C[1]} - ${paren(A[1])}$.`,
          fields: 'wrong',
        }),
        summary: () => `$\\overrightarrow{AC} = C - A = ${col(AC)}$`,
      },
      {
        kind: 'fields',
        label: 'Bandingkan dengan $\\vec{a}$ dan $\\vec{b}$',
        prompt: `Bandingkan $\\overrightarrow{AC} = ${texTuple(AC)}$ dengan $\\vec{a} = ${texTuple(a)}$. Lengkapi penjumlahannya.`,
        fields: [
          { key: 'px', label: `$${AC[0]} = ${a[0]} +$`, mode: 'integer', aria: 'Bilangan kedua baris x' },
          { key: 'py', label: `$${AC[1]} = ${a[1]} +$`, mode: 'integer', aria: 'Bilangan kedua baris y' },
        ],
        check: (v) => {
          const s = [v.px.value, v.py.value];
          if (matches(s, b)) return true;
          return { toast: 'polaSalah', wrong: wrongKeys(s, b, 'p') };
        },
        hint: () => ({
          text: 'Bilangan yang hilang adalah komponen vektor yang **kedua**. Lihat lagi jawaban langkah pertamamu.',
          show: () => glow(this, 'b'),
          fields: 'wrong',
        }),
        summary: () => `$\\overrightarrow{AC} = ${texColumnRaw([`${a[0]} + ${paren(b[0])}`, `${a[1]} + ${paren(b[1])}`])} = \\vec{a} + \\vec{b}$`,
      },
      {
        kind: 'choice',
        label: 'Syarat aturan segitiga',
        prompt: 'Jadi $\\vec{a} + \\vec{b} = \\overrightarrow{AC}$. Perhatikan $\\vec{b}$ pada gambar: **pangkalnya** ada di mana?',
        options: [
          { key: 'pangkal', label: 'Di pangkal $\\vec{a}$' },
          { key: 'ujung', label: 'Di **ujung** $\\vec{a}$' },
          { key: 'bebas', label: 'Di mana saja, tidak berpengaruh' },
        ],
        check: (key) => {
          if (key === 'ujung') return true;
          if (key === 'pangkal') return { toast: 'pangkalBersama' };
          return { toast: 'syaratUjungPangkal' };
        },
        hint: () => ({
          text: 'Lihat titik $B$ yang berdenyut: di situ panah $\\vec{a}$ berakhir dan panah $\\vec{b}$ dimulai.',
          show: () => pulsePoint(this, B),
        }),
        summary: () => 'Pangkal $\\vec{b}$ ada di **ujung** $\\vec{a}$ — **ujung ke pangkal**.',
        onSolved: () => this.plane && this.plane.highlight('AC'),
      },
    ];
  }

  stepsMove(c) {
    const Q = add(c.P, c.a);
    const T = add(Q, c.b);
    const sum = add(c.a, c.b);
    const points = () => ({ P: c.P, Q, T });
    return [
      {
        kind: 'pick',
        label: 'Geser $\\vec{b}$',
        prompt: '$\\vec{a}$ dan $\\vec{b}$ belum bersambung. Geser $\\vec{b}$ tanpa mengubah arah dan panjangnya: ketuk letak **pangkal** barunya.',
        check: (p) => {
          if (samePoint(p, Q)) return true;
          if (samePoint(p, c.P)) return { toast: 'pangkalBukanDiPangkal' };
          return { toast: 'geserSalah', values: { titik: tapped(p) } };
        },
        hint: () => ({
          text: 'Aturan segitiga: pangkal $\\vec{b}$ diletakkan di **ujung** $\\vec{a}$, yaitu titik yang berdenyut.',
          show: () => pulsePoint(this, Q),
        }),
        summary: () => 'Pangkal $\\vec{b}$ dipindah ke ujung $\\vec{a}$, yaitu titik $Q$.',
        onSolved: async () => {
          if (!this.bArrow) return;
          await this.bArrow.setVector({ from: Q, to: T }, { animate: !stillMotion(), duration: ARROW_MS });
          ['R', 'S'].forEach((n) => { if (this.marks[n]) { this.marks[n].remove(); delete this.marks[n]; } });
          markPoint(this, 'T', T);
        },
      },
      arrowStep(this, {
        from: 'P',
        to: 'T',
        points,
        label: 'Gambar $\\vec{a} + \\vec{b}$',
        prompt: 'Sekarang keduanya bersambung. Gambar $\\vec{a} + \\vec{b}$: dari **pangkal** $\\vec{a}$ ke **ujung** $\\vec{b}$.',
        tone: 'cyan',
        arrowLabel: '\\vec{a} + \\vec{b}',
        summary: () => '$\\vec{a} + \\vec{b} = \\overrightarrow{PT}$ tergambar.',
      }),
      {
        kind: 'fields',
        label: 'Komponen $\\vec{a} + \\vec{b}$',
        prompt: 'Berapa komponen $\\vec{a} + \\vec{b}$? Hitung langkah mendatar dan tegaknya dari $P$ ke $T$ di kisi.',
        fields: componentFields(2),
        check: (values) => {
          const s = componentValues(values, 2);
          const verdict = vectorVerdict(s, sum);
          if (verdict === 'ok') return true;
          if (verdict === 'sign') return { toast: 'tandaKomponen', wrong: ['cx', 'cy'] };
          if (verdict === 'swap') return { toast: 'komponenTertukar', wrong: ['cx', 'cy'] };
          return { toast: 'komponenSalah', wrong: wrongKeys(s, sum) };
        },
        hint: () => ({
          text: 'Ikuti lompatan bayangan dari $P$: hitung lompatan mendatarnya, lalu lompatan tegaknya.',
          show: () => ghostHops(this, c.P, sum),
          fields: 'wrong',
        }),
        summary: () => `$\\vec{a} + \\vec{b} = ${col(sum)}$`,
        onSolved: () => animateHops(this, c.P, sum),
      },
    ];
  }

  stepsPolygon(c) {
    const { A, D } = c;
    const AD = sub(D, A);
    const points = () => ({ A: c.A, B: c.B, C: c.C, D: c.D });
    return [
      {
        kind: 'choice',
        label: 'Perpindahan total',
        prompt: 'Tiga vektor bersambung: $\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CD}$. Perpindahan totalnya adalah…',
        options: [
          { key: 'AC', label: '$\\overrightarrow{AC}$' },
          { key: 'AD', label: '$\\overrightarrow{AD}$' },
          { key: 'DA', label: '$\\overrightarrow{DA}$' },
          { key: 'BD', label: '$\\overrightarrow{BD}$' },
        ],
        check: (key) => {
          if (key === 'AD') return true;
          if (key === 'DA') return { toast: 'arahTotalTerbalik' };
          return { toast: 'belumSampaiAkhir' };
        },
        hint: () => ({
          text: 'Perpindahan total hanya memperhatikan titik **berangkat** dan titik **berhenti** (keduanya berdenyut).',
          show: () => {
            const x = pulsePoint(this, A);
            const y = pulsePoint(this, D);
            return () => { x(); y(); };
          },
        }),
        summary: () => '$\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CD} = \\overrightarrow{AD}$',
      },
      arrowStep(this, {
        from: 'A',
        to: 'D',
        points,
        label: 'Gambar $\\overrightarrow{AD}$',
        prompt: 'Gambar $\\overrightarrow{AD}$: ketuk pangkal, lalu ujungnya.',
        tone: 'cyan',
        summary: () => '$\\overrightarrow{AD}$ menutup poligon $ABCD$.',
      }),
      {
        kind: 'fields',
        label: 'Hitung $\\overrightarrow{AD}$',
        prompt: 'Hitung komponen $\\overrightarrow{AD}$ dengan ujung dikurangi pangkal.',
        fields: componentFields(2),
        check: (values) => {
          const s = componentValues(values, 2);
          const verdict = vectorVerdict(s, AD);
          if (verdict === 'ok') return true;
          if (verdict === 'sign') return { toast: 'tandaTerbalik', values: { nama: 'AD', kebalikan: 'DA' }, wrong: ['cx', 'cy'] };
          return { toast: 'hasilSalah', wrong: wrongKeys(s, AD) };
        },
        hint: () => ({
          text: `$x = ${D[0]} - ${paren(A[0])}$ dan $y = ${D[1]} - ${paren(A[1])}$. Ingat: mengurangi bilangan negatif sama dengan menambah.`,
          fields: 'wrong',
        }),
        summary: () => `$\\overrightarrow{AD} = D - A = ${col(AD)}$`,
      },
    ];
  }

  stepsLetters() {
    return [
      {
        kind: 'choice',
        label: 'Dua vektor',
        prompt: 'Perhatikan hurufnya: $\\overrightarrow{PQ} + \\overrightarrow{QR} = \\dots$',
        options: [
          { key: 'PR', label: '$\\overrightarrow{PR}$' },
          { key: 'RP', label: '$\\overrightarrow{RP}$' },
          { key: 'QR', label: '$\\overrightarrow{QR}$' },
          { key: 'PQ', label: '$\\overrightarrow{PQ}$' },
        ],
        check: (key) => {
          if (key === 'PR') return true;
          if (key === 'RP') return { toast: 'arahTotalTerbalik' };
          return { toast: 'hurufTengah' };
        },
        hint: () => ({ text: 'Ujung vektor pertama ($Q$) sama dengan pangkal vektor kedua ($Q$). Huruf yang bertemu di tengah itu hilang; tersisa huruf pertama dan huruf terakhir.' }),
        summary: () => '$\\overrightarrow{PQ} + \\overrightarrow{QR} = \\overrightarrow{PR}$',
      },
      {
        kind: 'choice',
        label: 'Kembali ke awal',
        prompt: 'Tepat! Sekarang $\\overrightarrow{PQ} + \\overrightarrow{QR} + \\overrightarrow{RP} = \\dots$',
        options: [
          { key: 'PR', label: '$\\overrightarrow{PR}$' },
          { key: 'dua', label: '$2\\overrightarrow{PR}$' },
          { key: 'nol', label: '$\\vec{0}$ (vektor nol)' },
          { key: 'RP', label: '$\\overrightarrow{RP}$' },
        ],
        check: (key) => (key === 'nol' ? true : { toast: 'kembaliKeAwal' }),
        hint: () => ({ text: 'Berangkat dari $P$, singgah di $Q$ dan $R$, lalu berhenti di mana? Berapa perpindahannya dari titik berangkat?' }),
        summary: () => '$\\overrightarrow{PQ} + \\overrightarrow{QR} + \\overrightarrow{RP} = \\overrightarrow{PP} = \\vec{0}$',
      },
      {
        kind: 'choice',
        label: 'Urutkan dulu',
        prompt: 'Terakhir, $\\overrightarrow{AB} + \\overrightarrow{CA} = \\dots$ Hurufnya belum bersambung — perhatikan baik-baik.',
        options: [
          { key: 'AC', label: '$\\overrightarrow{AC}$' },
          { key: 'BC', label: '$\\overrightarrow{BC}$' },
          { key: 'CB', label: '$\\overrightarrow{CB}$' },
          { key: 'BA', label: '$\\overrightarrow{BA}$' },
        ],
        check: (key) => {
          if (key === 'CB') return true;
          if (key === 'BC') return { toast: 'arahTotalTerbalik' };
          return { toast: 'urutkanDulu' };
        },
        hint: () => ({ text: 'Penjumlahan boleh ditukar urutannya: tulis $\\overrightarrow{CA} + \\overrightarrow{AB}$. Sekarang hurufnya bersambung di $A$.' }),
        summary: () => '$\\overrightarrow{AB} + \\overrightarrow{CA} = \\overrightarrow{CA} + \\overrightarrow{AB} = \\overrightarrow{CB}$',
      },
    ];
  }
}

/* ============================================================
   2. parallelogram_guided — Aturan Jajar Genjang

   Kasus 1 (terpandu): a dan b berpangkal sama di O. Siswa menggeser b ke
   ujung a, lalu a ke ujung b; kedua salinan bertemu di C dan membentuk
   jajar genjang. Diagonal dari O = a + b. Kasus 2: diagonal yang lain =
   a − b (dari ujung b ke ujung a). Kasus 3: latihan dengan komponen
   negatif. Kasus 4: tanpa gambar, vektor tiga komponen.
   ============================================================ */
export class GuidedParallelogramSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind !== 'space';
  }

  planeOptions(c) {
    return boundsOf([c.a, c.b, add(c.a, c.b)]);
  }

  caseLabel(c) {
    return { sum: 'Diagonal jumlah', diff: 'Diagonal selisih', practice: 'Latihan', space: 'Tanpa gambar' }[c.kind];
  }

  caseSuccessKey(c) {
    return { sum: 'success', diff: 'successSelisih', practice: 'successLatihan', space: 'successRuang' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'sum') return 'Inilah **aturan jajar genjang**: pangkal kedua vektor berimpit, dan $\\vec{a} + \\vec{b}$ adalah diagonal dari pangkal bersama itu.';
    if (c.kind === 'diff') return 'Diagonal yang lain adalah **selisih**: $\\vec{a} - \\vec{b}$ berpangkal di ujung $\\vec{b}$ dan berujung di ujung $\\vec{a}$.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'diff') return 'Jajar genjang punya **dua** diagonal. Apa arti diagonal yang satu lagi?';
    if (next.kind === 'practice') return 'Sekarang kamu yang melengkapi jajar genjangnya sendiri.';
    return 'Terakhir, **tanpa gambar** — vektor dengan tiga komponen.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Aturan Jajar Genjang Dikuasai',
      recap: [
        'Pangkal $\\vec{a}$ dan $\\vec{b}$ **berimpit**; lengkapi menjadi jajar genjang',
        'Diagonal dari pangkal bersama: $\\vec{a} + \\vec{b}$',
        'Diagonal dari ujung $\\vec{b}$ ke ujung $\\vec{a}$: $\\vec{a} - \\vec{b}$',
      ],
    };
  }

  setupCase(c) {
    this.marks = {};
    if (c.kind === 'space') {
      this.givenEl.appendChild(givenBlock(tex(`\\vec{a} = ${col(c.a)} \\qquad \\vec{b} = ${col(c.b)}`), 'sim-given--display'));
      this.givenEl.appendChild(givenBlock(mixed('Jajar genjang $OACB$ di ruang dengan $\\overrightarrow{OA} = \\vec{a}$ dan $\\overrightarrow{OB} = \\vec{b}$.'), 'sim-given--muted'));
      return;
    }
    const C = add(c.a, c.b);
    markPoint(this, 'O', [0, 0], { coords: false });
    markPoint(this, 'A', c.a);
    markPoint(this, 'B', c.b);
    this.drawVector({ from: [0, 0], to: c.a, name: 'a', tone: 'blue' }, { essential: true });
    this.drawVector({ from: [0, 0], to: c.b, name: 'b', tone: 'blue' }, { essential: true });
    if (c.kind === 'diff') {
      this.plane.drawPolygon([[0, 0], c.a, C, c.b], { tone: 'cyan' });
      markPoint(this, 'C', C);
      this.drawVector({ from: [0, 0], to: C, name: 'OC', tone: 'cyan', label: '\\vec{a} + \\vec{b}' });
      this.givenEl.appendChild(givenBlock(mixed('Jajar genjang $OACB$ dari kasus sebelumnya, dengan $\\vec{a} = \\overrightarrow{OA}$ dan $\\vec{b} = \\overrightarrow{OB}$.')));
    } else {
      this.givenEl.appendChild(givenBlock(mixed(`Dua vektor berpangkal di titik yang sama, $O$: $\\vec{a} = \\overrightarrow{OA}$ dan $\\vec{b} = \\overrightarrow{OB}$.`)));
    }
  }

  /** Isian a + b atau a − b dengan pengenal diagonal yang tertukar. */
  diagonalStep(c, which, { label, prompt, hint, onSolved }) {
    const dim = c.a.length;
    const sum = add(c.a, c.b);
    const diff = sub(c.a, c.b);
    const key = which === 'sum' ? sum : diff;
    return {
      kind: 'fields',
      label,
      prompt,
      fields: componentFields(dim),
      check: (values) => {
        const s = componentValues(values, dim);
        if (matches(s, key)) return true;
        const wrong = wrongKeys(s, key);
        if (which === 'sum' && matches(s, diff)) return { toast: 'diagonalLain', wrong };
        if (which === 'diff' && matches(s, neg(diff))) return { toast: 'selisihTerbalik', wrong };
        if (which === 'diff' && matches(s, sum)) return { toast: 'diagonalJumlah', wrong };
        if (vectorVerdict(s, key) === 'sign') return { toast: 'tandaKomponen', wrong };
        return { toast: 'komponenSalah', wrong };
      },
      hint,
      summary: () => `$\\vec{a} ${which === 'sum' ? '+' : '-'} \\vec{b} = ${col(key)}$`,
      onSolved,
    };
  }

  buildSteps(c) {
    const O = [0, 0];
    const { a, b } = c;
    const C = add(a, b);
    const diff = sub(a, b);
    const points = () => ({ O, A: a, B: b, C });
    const exprHint = (op) => `$x = ${a[0]} ${op} ${paren(b[0])}$ dan $y = ${a[1]} ${op} ${paren(b[1])}$`;

    if (c.kind === 'sum') {
      return [
        {
          kind: 'pick',
          label: 'Geser $\\vec{b}$',
          prompt: 'Pangkal $\\vec{a}$ dan $\\vec{b}$ sama, di $O$. Pakai aturan segitiga: geser $\\vec{b}$ ke ujung $\\vec{a}$. Ketuk pangkal barunya.',
          check: (p) => {
            if (samePoint(p, a)) return true;
            if (samePoint(p, O)) return { toast: 'masihDiO' };
            return { toast: 'geserSalah', values: { titik: tapped(p) } };
          },
          hint: () => ({ text: 'Ujung $\\vec{a}$ adalah titik $A$ (berdenyut), tempat mata panah $\\vec{a}$.', show: () => pulsePoint(this, a) }),
          summary: () => 'Salinan $\\vec{b}$ berpangkal di $A$.',
          onSolved: () => growArrow(this, a, C, { name: 'b2', tone: 'muted', label: '\\vec{b}', essential: false }),
        },
        {
          kind: 'pick',
          label: 'Geser $\\vec{a}$',
          prompt: 'Sekarang sebaliknya: geser $\\vec{a}$ ke ujung $\\vec{b}$. Ketuk pangkal barunya.',
          check: (p) => {
            if (samePoint(p, b)) return true;
            if (samePoint(p, O)) return { toast: 'masihDiO' };
            return { toast: 'geserSalah', values: { titik: tapped(p) } };
          },
          hint: () => ({ text: 'Ujung $\\vec{b}$ adalah titik $B$ (berdenyut).', show: () => pulsePoint(this, b) }),
          summary: () => 'Salinan $\\vec{a}$ berpangkal di $B$; kedua salinan bertemu di $C$.',
          onSolved: async () => {
            await growArrow(this, b, C, { name: 'a2', tone: 'muted', label: '\\vec{a}', essential: false });
            if (!this.plane) return;
            this.plane.drawPolygon([O, a, C, b], { tone: 'cyan' });
            markPoint(this, 'C', C);
          },
        },
        {
          kind: 'choice',
          label: 'Nama bangunnya',
          prompt: 'Kedua salinan tiba di titik yang sama, $C$. Bangun $OACB$ yang terbentuk adalah…',
          options: [
            { key: 'trapesium', label: 'Trapesium' },
            { key: 'jajar', label: 'Jajar genjang' },
            { key: 'layang', label: 'Layang-layang' },
          ],
          check: (key) => (key === 'jajar' ? true : { toast: 'sisiBerhadapan' }),
          hint: () => ({ text: 'Sisi $OA$ dan $BC$ adalah vektor yang sama ($\\vec{a}$), begitu juga $OB$ dan $AC$ ($\\vec{b}$). Sisi yang berhadapan sejajar dan sama panjang.' }),
          summary: () => '$OACB$ adalah **jajar genjang**.',
        },
        arrowStep(this, {
          from: 'O',
          to: 'C',
          points,
          label: 'Gambar $\\vec{a} + \\vec{b}$',
          prompt: 'Gambar $\\vec{a} + \\vec{b}$: diagonal yang berpangkal di titik pangkal bersama, $O$.',
          tone: 'cyan',
          arrowLabel: '\\vec{a} + \\vec{b}',
          summary: () => '$\\vec{a} + \\vec{b} = \\overrightarrow{OC}$, diagonal dari pangkal bersama.',
        }),
        this.diagonalStep(c, 'sum', {
          label: 'Komponen $\\vec{a} + \\vec{b}$',
          prompt: 'Berapa komponen $\\vec{a} + \\vec{b}$? Hitung langkah dari $O$ ke $C$ di kisi.',
          hint: () => ({ text: 'Ikuti lompatan bayangan dari $O$ ke $C$.', show: () => ghostHops(this, O, C), fields: 'wrong' }),
        }),
      ];
    }

    if (c.kind === 'diff') {
      return [
        {
          kind: 'choice',
          label: 'Arti diagonal kedua',
          prompt: 'Diagonal kedua, $\\overrightarrow{BA}$, menghubungkan ujung $\\vec{b}$ ke ujung $\\vec{a}$. Nyatakan dalam $\\vec{a}$ dan $\\vec{b}$.',
          intro: 'Dari $O$ ke $A$ ada dua jalan: langsung lewat $\\vec{a}$, atau lewat $B$, yaitu $\\vec{b} + \\overrightarrow{BA}$. Jadi $\\vec{b} + \\overrightarrow{BA} = \\vec{a}$.',
          options: [
            { key: 'bma', label: '$\\overrightarrow{BA} = \\vec{b} - \\vec{a}$' },
            { key: 'apb', label: '$\\overrightarrow{BA} = \\vec{a} + \\vec{b}$' },
            { key: 'amb', label: '$\\overrightarrow{BA} = \\vec{a} - \\vec{b}$' },
          ],
          check: (key) => {
            if (key === 'amb') return true;
            if (key === 'bma') return { toast: 'selisihTerbalik' };
            return { toast: 'diagonalJumlah' };
          },
          hint: () => ({
            text: 'Dari $\\vec{b} + \\overrightarrow{BA} = \\vec{a}$, pindahkan $\\vec{b}$ ke ruas kanan seperti pada persamaan biasa.',
            show: () => ghostArrow(this, b, a),
          }),
          summary: () => '$\\vec{b} + \\overrightarrow{BA} = \\vec{a}$, jadi $\\overrightarrow{BA} = \\vec{a} - \\vec{b}$.',
        },
        arrowStep(this, {
          from: 'B',
          to: 'A',
          points,
          label: 'Gambar $\\vec{a} - \\vec{b}$',
          prompt: 'Gambar $\\vec{a} - \\vec{b} = \\overrightarrow{BA}$ pada jajar genjang: ketuk pangkal, lalu ujungnya.',
          tone: 'coral',
          arrowLabel: '\\vec{a} - \\vec{b}',
          summary: () => '$\\vec{a} - \\vec{b} = \\overrightarrow{BA}$ tergambar.',
        }),
        this.diagonalStep(c, 'diff', {
          label: 'Komponen $\\vec{a} - \\vec{b}$',
          prompt: 'Berapa komponen $\\vec{a} - \\vec{b}$? Hitung langkah dari $B$ ke $A$ di kisi.',
          hint: () => ({ text: 'Ikuti lompatan bayangan dari $B$ ke $A$. Ke kiri dan ke bawah bernilai negatif.', show: () => ghostHops(this, b, diff), fields: 'wrong' }),
        }),
      ];
    }

    if (c.kind === 'practice') {
      return [
        {
          kind: 'pick',
          label: 'Titik sudut $C$',
          prompt: 'Lengkapi jajar genjang dari $\\vec{a}$ dan $\\vec{b}$: ketuk titik sudut keempatnya, $C$.',
          check: (p) => (samePoint(p, C) ? true : { toast: 'sudutKeempat', values: { titik: tapped(p) } }),
          hint: () => ({ text: 'Dari ujung $\\vec{a}$, lakukan langkah $\\vec{b}$. Ikuti lompatan bayangannya.', show: () => ghostHops(this, a, b) }),
          summary: () => `Titik sudut keempat: ${named('C', C)}.`,
          onSolved: () => {
            if (!this.plane) return;
            this.plane.drawPolygon([O, a, C, b], { tone: 'cyan' });
            markPoint(this, 'C', C);
          },
        },
        this.diagonalStep(c, 'sum', {
          label: 'Komponen $\\vec{a} + \\vec{b}$',
          prompt: 'Tentukan komponen $\\vec{a} + \\vec{b}$.',
          hint: () => ({ text: `${exprHint('+')}. Hasilnya sama dengan koordinat $C$.`, fields: 'wrong' }),
          onSolved: () => growArrow(this, O, C, { name: 'OC', tone: 'cyan', label: '\\vec{a} + \\vec{b}' }),
        }),
        this.diagonalStep(c, 'diff', {
          label: 'Komponen $\\vec{a} - \\vec{b}$',
          prompt: 'Tentukan komponen $\\vec{a} - \\vec{b}$, diagonal dari ujung $\\vec{b}$ ke ujung $\\vec{a}$.',
          hint: () => ({ text: `${exprHint('-')}. Ingat: mengurangi bilangan negatif sama dengan menambah.`, fields: 'wrong' }),
          onSolved: () => growArrow(this, b, a, { name: 'BA', tone: 'coral', label: '\\vec{a} - \\vec{b}' }),
        }),
      ];
    }

    const exprHint3 = (op) => `$${a.map((n, i) => `${n} ${op} ${paren(b[i])}`).join(', \\quad ')}$`;
    return [
      this.diagonalStep(c, 'sum', {
        label: 'Diagonal $\\overrightarrow{OC}$',
        prompt: 'Tanpa gambar, di ruang. Tentukan diagonal $\\overrightarrow{OC} = \\vec{a} + \\vec{b}$.',
        hint: () => ({ text: `Jumlahkan komponen yang seletak: ${exprHint3('+')}.`, fields: 'wrong' }),
      }),
      this.diagonalStep(c, 'diff', {
        label: 'Diagonal $\\overrightarrow{BA}$',
        prompt: 'Sekarang diagonal yang lain, $\\overrightarrow{BA} = \\vec{a} - \\vec{b}$.',
        hint: () => ({ text: `Kurangkan komponen yang seletak, $\\vec{a}$ di depan: ${exprHint3('-')}.`, fields: 'wrong' }),
      }),
    ];
  }
}

/* ============================================================
   3. component_guided — Jumlah & Selisih Komponen

   Kasus 1 (terpandu): a + b tergambar bersambung; siswa menghitung
   komponennya dari kisi, lalu menemukan polanya: komponen seletak
   dijumlahkan. Kasus 2: a − b = a + (−b), dengan −b digambar di ujung a.
   Kasus 3: tiga komponen, tanpa gambar. Kasus 4: dimensi berbeda.
   ============================================================ */
export class GuidedComponentSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind === 'add' || c.kind === 'sub';
  }

  planeOptions(c) {
    if (c.kind === 'add') return boundsOf([c.a, add(c.a, c.b)]);
    return boundsOf([c.a, c.b, sub(c.a, c.b)]);
  }

  caseLabel(c) {
    return { add: 'Penjumlahan', sub: 'Pengurangan', space: 'Tiga komponen', dimension: 'Beda dimensi' }[c.kind];
  }

  caseSuccessKey(c) {
    return { add: 'success', sub: 'successKurang', space: 'successRuang', dimension: 'successDimensi' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'add') return 'Mudah, bukan? Untuk menjumlahkan vektor, **jumlahkan komponen yang seletak**: $x$ dengan $x$, $y$ dengan $y$.';
    if (c.kind === 'sub') return 'Pengurangan pun sama: **kurangkan komponen yang seletak**, dengan komponen $\\vec{a}$ di depan.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'sub') return 'Sekarang **pengurangan**: $\\vec{a} - \\vec{b}$.';
    if (next.kind === 'space') return 'Bagaimana dengan vektor **tiga komponen**? Kita hitung tanpa gambar.';
    return 'Terakhir: dua vektor yang banyak komponennya **berbeda**.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Operasi Komponen Dikuasai',
      recap: [
        '$\\vec{a} \\pm \\vec{b}$: jumlahkan atau kurangkan komponen yang **seletak**',
        '$\\vec{a} - \\vec{b} = \\vec{a} + (-\\vec{b})$; komponen $\\vec{a}$ ditulis di depan',
        'Kedua vektor harus punya **banyak komponen yang sama**',
      ],
    };
  }

  setupCase(c) {
    this.marks = {};
    if (c.kind === 'dimension') {
      this.givenEl.appendChild(givenBlock(tex(`\\vec{p} = ${col(c.p)} \\qquad \\vec{q} = ${col(c.q)}`), 'sim-given--display'));
      return;
    }
    this.givenEl.appendChild(givenBlock(tex(`\\vec{a} = ${col(c.a)} \\qquad \\vec{b} = ${col(c.b)}`), 'sim-given--display'));
    if (c.kind === 'add') {
      const C = add(c.a, c.b);
      markPoint(this, 'O', [0, 0], { coords: false });
      markPoint(this, 'A', c.a);
      markPoint(this, 'C', C);
      this.drawVector({ from: [0, 0], to: c.a, name: 'a', tone: 'blue' }, { essential: true });
      this.drawVector({ from: c.a, to: C, name: 'b', tone: 'blue' }, { essential: true });
    } else if (c.kind === 'sub') {
      markPoint(this, 'O', [0, 0], { coords: false });
      this.drawVector({ from: [0, 0], to: c.a, name: 'a', tone: 'blue' }, { essential: true });
      this.drawVector({ from: [0, 0], to: c.b, name: 'b', tone: 'blue' }, { essential: true });
    }
  }

  buildSteps(c) {
    if (c.kind === 'add') return this.stepsAdd(c);
    if (c.kind === 'sub') return this.stepsSub(c);
    if (c.kind === 'space') return this.stepsSpace(c);
    return this.stepsDimension(c);
  }

  stepsAdd(c) {
    const { a, b } = c;
    const sum = add(a, b);
    return [
      {
        kind: 'fields',
        label: 'Komponen dari kisi',
        prompt: 'Gambar ini sudah kamu kenal: $\\vec{a} + \\vec{b} = \\overrightarrow{OC}$. Hitung komponennya dari kisi.',
        fields: componentFields(2),
        check: (values) => {
          const s = componentValues(values, 2);
          const verdict = vectorVerdict(s, sum);
          if (verdict === 'ok') return true;
          if (verdict === 'sign') return { toast: 'tandaKomponen', wrong: ['cx', 'cy'] };
          return { toast: 'komponenSalah', wrong: wrongKeys(s, sum) };
        },
        hint: () => ({ text: 'Ikuti lompatan bayangan dari $O$ ke $C$: mendatar dulu, lalu tegak.', show: () => ghostHops(this, [0, 0], sum), fields: 'wrong' }),
        summary: () => `$\\vec{a} + \\vec{b} = ${col(sum)}$, dibaca dari kisi.`,
        onSolved: () => growArrow(this, [0, 0], sum, { name: 'OC', tone: 'cyan', label: '\\vec{a} + \\vec{b}' }),
      },
      {
        kind: 'fields',
        label: 'Temukan polanya',
        prompt: `Dari mana $${sum[0]}$ dan $${sum[1]}$? Lengkapi dengan komponen $\\vec{a}$ dan $\\vec{b}$ pada data soal.`,
        fields: [
          { key: 'xa', label: `$${sum[0]} =$`, mode: 'integer', aria: 'Bilangan pertama baris x' },
          { key: 'xb', label: '$+$', mode: 'integer', aria: 'Bilangan kedua baris x' },
          { key: 'ya', label: `$${sum[1]} =$`, mode: 'integer', aria: 'Bilangan pertama baris y' },
          { key: 'yb', label: '$+$', mode: 'integer', aria: 'Bilangan kedua baris y' },
        ],
        check: (v) => {
          const row = (p, q, i) => (same(p, a[i]) && same(q, b[i])) || (same(p, b[i]) && same(q, a[i]));
          const okX = row(v.xa.value, v.xb.value, 0);
          const okY = row(v.ya.value, v.yb.value, 1);
          if (okX && okY) return true;
          const wrong = [...(okX ? [] : ['xa', 'xb']), ...(okY ? [] : ['ya', 'yb'])];
          if (row(v.xa.value, v.xb.value, 1) || row(v.ya.value, v.yb.value, 0)) return { toast: 'tidakSeletak', wrong };
          return { toast: 'polaSalah', wrong };
        },
        hint: () => ({ text: 'Baris pertama memakai komponen **atas** (komponen $x$) kedua vektor; baris kedua memakai komponen **bawah** (komponen $y$).', fields: 'wrong' }),
        summary: () => `$\\vec{a} + \\vec{b} = ${texColumnRaw([`${a[0]} + ${paren(b[0])}`, `${a[1]} + ${paren(b[1])}`])} = ${col(sum)}$`,
      },
      {
        kind: 'choice',
        label: 'Aturannya',
        prompt: 'Jadi, bagaimana cara menjumlahkan dua vektor tanpa menggambar?',
        options: [
          { key: 'silang', label: 'Jumlahkan $x$ milik $\\vec{a}$ dengan $y$ milik $\\vec{b}$' },
          { key: 'satu', label: 'Jumlahkan semua angkanya menjadi satu bilangan' },
          { key: 'seletak', label: 'Jumlahkan komponen yang **seletak**: $x$ dengan $x$, $y$ dengan $y$' },
        ],
        check: (key) => {
          if (key === 'seletak') return true;
          if (key === 'silang') return { toast: 'tidakSeletak' };
          return { toast: 'hasilTetapVektor' };
        },
        hint: () => ({ text: 'Lihat lagi baris yang baru kamu lengkapi: komponen mana bertemu dengan komponen mana?' }),
        summary: () => 'Jumlahkan komponen yang **seletak**.',
      },
    ];
  }

  stepsSub(c) {
    const { a, b } = c;
    const nb = neg(b);
    const diff = sub(a, b);
    return [
      {
        kind: 'fields',
        label: 'Komponen $-\\vec{b}$',
        prompt: '$\\vec{a} - \\vec{b}$ sama dengan $\\vec{a} + (-\\vec{b})$. Tulis dulu komponen $-\\vec{b}$.',
        fields: componentFields(2),
        check: (values) => {
          const s = componentValues(values, 2);
          if (matches(s, nb)) return true;
          const wrong = wrongKeys(s, nb);
          if (matches(s, b)) return { toast: 'lupaMinus', wrong };
          if (wrong.length === 1) return { toast: 'minusSemua', wrong };
          return { toast: 'komponenSalah', wrong };
        },
        hint: () => ({ text: '$-\\vec{b}$ sama panjang dengan $\\vec{b}$ tetapi **berlawanan arah**: setiap komponennya berganti tanda.', show: () => glow(this, 'b'), fields: 'wrong' }),
        summary: () => `$-\\vec{b} = ${col(nb)}$`,
        onSolved: () => growArrow(this, a, diff, { name: 'nb', tone: 'coral', label: '-\\vec{b}' }),
      },
      {
        kind: 'fields',
        label: 'Hitung $\\vec{a} - \\vec{b}$',
        prompt: 'Sekarang jumlahkan $\\vec{a}$ dan $-\\vec{b}$ komponen demi komponen.',
        intro: 'Pada bidang, $-\\vec{b}$ sudah disambung di ujung $\\vec{a}$ — aturan segitiga yang kamu kenal.',
        fields: componentFields(2),
        check: (values) => {
          const s = componentValues(values, 2);
          if (matches(s, diff)) return true;
          const wrong = wrongKeys(s, diff);
          if (matches(s, add(a, b))) return { toast: 'masihDitambah', wrong };
          if (matches(s, neg(diff))) return { toast: 'urutanTerbalik', wrong };
          return { toast: 'hasilSalah', wrong };
        },
        hint: () => ({ text: `$x = ${a[0]} + ${paren(nb[0])}$ dan $y = ${a[1]} + ${paren(nb[1])}$.`, fields: 'wrong' }),
        summary: () => `$\\vec{a} - \\vec{b} = ${texColumnRaw([`${a[0]} - ${paren(b[0])}`, `${a[1]} - ${paren(b[1])}`])} = ${col(diff)}$`,
        onSolved: () => growArrow(this, [0, 0], diff, { name: 'amb', tone: 'cyan', label: '\\vec{a} - \\vec{b}' }),
      },
      {
        kind: 'choice',
        label: 'Cara singkat',
        prompt: 'Jadi $\\vec{a} - \\vec{b}$ cukup dihitung dengan…',
        options: [
          { key: 'balik', label: '$b_x - a_x$ dan $b_y - a_y$' },
          { key: 'kurang', label: '$a_x - b_x$ dan $a_y - b_y$' },
          { key: 'tambah', label: '$a_x + b_x$ dan $a_y + b_y$' },
        ],
        check: (key) => {
          if (key === 'kurang') return true;
          if (key === 'balik') return { toast: 'urutanTerbalik' };
          return { toast: 'masihDitambah' };
        },
        hint: () => ({ text: `Lihat hasilmu: komponen $x$-nya $${a[0]} - ${paren(b[0])}$. Komponen siapa yang ditulis di depan?` }),
        summary: () => 'Kurangkan komponen yang seletak: $a_x - b_x$ dan $a_y - b_y$.',
      },
    ];
  }

  stepsSpace(c) {
    const { a, b } = c;
    const sum = add(a, b);
    const diff = sub(a, b);
    return [
      {
        kind: 'fields',
        label: 'Hitung $\\vec{a} + \\vec{b}$',
        prompt: 'Vektor di ruang punya **tiga** komponen. Aturannya tetap sama: hitung $\\vec{a} + \\vec{b}$.',
        fields: componentFields(3),
        check: (values) => {
          const s = componentValues(values, 3);
          if (matches(s, sum)) return true;
          return { toast: 'hasilSalah', wrong: wrongKeys(s, sum) };
        },
        hint: () => ({ text: `Jumlahkan yang seletak, hati-hati dengan tandanya: $${a.map((n, i) => `${n} + ${paren(b[i])}`).join(', \\quad ')}$.`, fields: 'wrong' }),
        summary: () => `$\\vec{a} + \\vec{b} = ${col(sum)}$`,
      },
      {
        kind: 'fields',
        label: 'Hitung $\\vec{a} - \\vec{b}$',
        prompt: 'Sekarang $\\vec{a} - \\vec{b}$. Perhatikan komponen $\\vec{b}$ yang negatif.',
        fields: componentFields(3),
        check: (values) => {
          const s = componentValues(values, 3);
          if (matches(s, diff)) return true;
          const wrong = wrongKeys(s, diff);
          if (matches(s, sum)) return { toast: 'masihDitambah', wrong };
          if (matches(s, neg(diff))) return { toast: 'urutanTerbalik', wrong };
          const i = b.findIndex((n) => n < 0);
          if (i >= 0 && same(s[i], a[i] + b[i])) return { toast: 'kurangNegatif', wrong };
          return { toast: 'hasilSalah', wrong };
        },
        hint: () => ({ text: `$${a.map((n, i) => `${n} - ${paren(b[i])}`).join(', \\quad ')}$. Mengurangi bilangan negatif sama dengan menambah.`, fields: 'wrong' }),
        summary: () => `$\\vec{a} - \\vec{b} = ${col(diff)}$`,
      },
    ];
  }

  stepsDimension(c) {
    return [
      {
        kind: 'choice',
        label: 'Bisakah dijumlahkan?',
        prompt: '$\\vec{p}$ punya dua komponen, $\\vec{q}$ punya tiga. Bisakah $\\vec{p} + \\vec{q}$ dihitung?',
        options: [
          { key: 'nol', label: `Bisa: tambahkan $z = 0$ pada $\\vec{p}$, hasilnya $${texTuple(add([...c.p, 0], c.q))}$` },
          { key: 'abaikan', label: `Bisa: abaikan komponen $z$ milik $\\vec{q}$, hasilnya $${texTuple(add(c.p, c.q.slice(0, 2)))}$` },
          { key: 'tidak', label: '**Tidak** bisa: banyak komponennya berbeda' },
        ],
        check: (key) => {
          if (key === 'tidak') return true;
          if (key === 'nol') return { toast: 'tambahNol' };
          return { toast: 'abaikanZ' };
        },
        hint: () => ({ text: 'Komponen $z$ milik $\\vec{q}$ tidak punya **pasangan seletak** di $\\vec{p}$. Kita tidak boleh mengarang data soal.' }),
        summary: () => '$\\vec{p} + \\vec{q}$ **tidak terdefinisi**: banyak komponennya berbeda.',
      },
      {
        kind: 'choice',
        label: 'Syaratnya',
        prompt: 'Jadi, apa syarat dua vektor bisa dijumlahkan atau dikurangkan?',
        options: [
          { key: 'panjang', label: 'Panjangnya sama' },
          { key: 'dimensi', label: 'Banyak komponennya sama: sama-sama di bidang, atau sama-sama di ruang' },
          { key: 'arah', label: 'Arahnya sama' },
        ],
        check: (key) => (key === 'dimensi' ? true : { toast: 'syaratDimensi' }),
        hint: () => ({ text: 'Di kasus sebelumnya, vektor dengan panjang dan arah berbeda tetap bisa dijumlahkan. Yang membuat kasus ini gagal adalah **banyak komponennya**.' }),
        summary: () => 'Syarat: kedua vektor punya banyak komponen yang **sama**.',
      },
    ];
  }
}

/* ============================================================
   4. scalar_guided — Perkalian Skalar dengan Vektor

   Kasus 1 (terpandu): 3v = v + v + v — siswa menyambung salinan v ujung
   ke pangkal, membaca komponen 3v, lalu menemukan polanya: setiap
   komponen dikali 3. Kasus 2: k negatif membalik arah. Kasus 3: k = ½.
   Kasus 4: tiga komponen tanpa gambar + panjang |kv| = |k|·|v|.
   ============================================================ */
const kOf = (c) => S.parseSurd(String(c.k));
const kvOf = (c) => c.v.map((n) => S.mulS(kOf(c), S.parseSurd(n)));
const numeric = (arr) => arr.map((x) => S.toNumber(S.parseSurd(x)));

export class GuidedScalarSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind !== 'length';
  }

  planeOptions(c) {
    const kv = numeric(kvOf(c));
    return boundsOf([c.v, kv]);
  }

  caseLabel(c) {
    return `$${texNum(c.k)}\\vec{v}$`;
  }

  caseSuccessKey(c) {
    return { repeat: 'success', negative: 'successNegatif', fraction: 'successPecahan', length: 'successPanjang' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'repeat') return 'Perkalian skalar: **setiap komponen** dikali $k$. Untuk $k$ positif, arahnya tetap dan panjangnya menjadi $k$ kali.';
    if (c.kind === 'negative') return '$k$ negatif **membalik arah**. Besar $|k|$ tetap menentukan berapa kali panjangnya.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'negative') return 'Bagaimana kalau skalarnya **negatif**?';
    if (next.kind === 'fraction') return 'Sekarang skalarnya **pecahan**: $\\frac{1}{2}$.';
    return 'Terakhir, **tanpa gambar**: tiga komponen, lalu panjangnya.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Perkalian Skalar Dikuasai',
      recap: [
        '$k\\vec{v}$: **setiap** komponen $\\vec{v}$ dikali $k$',
        '$k > 0$ searah, $k < 0$ berlawanan arah; panjangnya $|k|$ kali',
        '$|k\\vec{v}| = |k| \\cdot |\\vec{v}|$, misalnya $|4\\vec{v}| = 4|\\vec{v}|$',
      ],
    };
  }

  setupCase(c) {
    this.marks = {};
    this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${col(c.v)} \\qquad k = ${texNum(c.k)}`), 'sim-given--display'));
    if (!this.plane) return;
    markPoint(this, 'O', [0, 0], { coords: false });
    this.vArrow = this.drawVector({ from: [0, 0], to: c.v, name: 'v', tone: 'blue' }, { essential: true });
  }

  /** Isian kv dengan pengenal kesalahan khas perkalian skalar. */
  scaleStep(c, { label, prompt, intro, hint, onSolved }) {
    const dim = c.v.length;
    const key = kvOf(c);
    const k = kOf(c);
    return {
      kind: 'fields',
      label,
      prompt,
      intro,
      fields: componentFields(dim, { mode: 'fraction' }),
      check: (values) => {
        const s = componentValues(values, dim);
        if (matches(s, key)) return true;
        const wrong = wrongKeys(s, key);
        if (matches(s, key.map(S.negS))) return { toast: 'tandaHilang', wrong };
        if (same(s[0], key[0]) && s.slice(1).every((x, i) => same(x, c.v[i + 1]))) return { toast: 'hanyaSatuKomponen', wrong };
        if (matches(s, c.v.map((n) => S.addS(S.parseSurd(n), k)))) return { toast: 'ditambahBukanDikali', wrong };
        if (matches(s, c.v.map((n) => S.divS(S.parseSurd(n), k)))) return { toast: 'dikaliDua', wrong };
        return { toast: 'hasilKaliSalah', wrong };
      },
      hint,
      summary: () => `$${texNum(c.k)}\\vec{v} = ${col(key)}$`,
      onSolved,
    };
  }

  /** Pilihan arah & panjang kv dibanding v. */
  compareStep(c, { prompt, options, right }) {
    return {
      kind: 'choice',
      label: 'Bandingkan dengan $\\vec{v}$',
      prompt,
      options,
      check: (key) => {
        if (key === right) return true;
        const [dirR, lenR] = right.split('-');
        const [dir] = key.split('-');
        return dir !== dirR || !lenR ? { toast: 'arahSalah' } : { toast: 'panjangBeda' };
      },
      hint: () => ({
        text: 'Lihat gambarnya: apakah panah baru menunjuk ke arah yang sama dengan $\\vec{v}$? Berapa kali panjang $\\vec{v}$?',
        show: () => glow(this, 'v', 'kv'),
      }),
      summary: () => `$${texNum(c.k)}\\vec{v}$: ${options.find((o) => o.key === right).label}.`,
    };
  }

  buildSteps(c) {
    const v = c.v;
    const kv = kvOf(c);
    const kvNum = numeric(kv);
    const kTex = texNum(c.k);
    const grow = () => growArrow(this, [0, 0], kvNum, { name: 'kv', tone: 'cyan', label: `${kTex}\\vec{v}` });

    if (c.kind === 'repeat') {
      const v2 = mul(2, v);
      const v3 = mul(3, v);
      return [
        {
          kind: 'pick',
          label: '$\\vec{v}$ kedua',
          prompt: '$3\\vec{v} = \\vec{v} + \\vec{v} + \\vec{v}$. Sambung $\\vec{v}$ kedua di ujung $\\vec{v}$: ketuk letak **ujungnya**.',
          check: (p) => {
            if (samePoint(p, v2)) return true;
            if (samePoint(p, v)) return { toast: 'ujungPertama' };
            return { toast: 'ujungSalinan', values: { titik: tapped(p) } };
          },
          hint: () => ({ text: `Dari ujung $\\vec{v}$, ulangi langkah $\\vec{v}$: $${v[0]}$ mendatar dan $${v[1]}$ tegak.`, show: () => ghostHops(this, v, v) }),
          summary: () => '$\\vec{v}$ kedua tersambung.',
          onSolved: () => growArrow(this, v, v2, { name: 'v2', tone: 'muted', label: '\\vec{v}', essential: false }),
        },
        {
          kind: 'pick',
          label: '$\\vec{v}$ ketiga',
          prompt: 'Sambung $\\vec{v}$ ketiga di ujung $\\vec{v}$ kedua: ketuk letak ujungnya.',
          check: (p) => (samePoint(p, v3) ? true : { toast: 'ujungSalinan', values: { titik: tapped(p) } }),
          hint: () => ({ text: 'Sekali lagi, dari ujung $\\vec{v}$ kedua ulangi langkah $\\vec{v}$.', show: () => ghostHops(this, v2, v) }),
          summary: () => '$\\vec{v} + \\vec{v} + \\vec{v}$ tersambung.',
          onSolved: () => growArrow(this, v2, v3, { name: 'v3', tone: 'muted', label: '\\vec{v}', essential: false }),
        },
        this.scaleStep(c, {
          label: 'Komponen $3\\vec{v}$',
          prompt: 'Dari $O$ sampai ujung $\\vec{v}$ ketiga: berapa komponen $3\\vec{v}$? Hitung di kisi.',
          hint: () => ({ text: 'Ikuti lompatan bayangan dari $O$ sampai ujung $\\vec{v}$ ketiga.', show: () => ghostHops(this, [0, 0], v3), fields: 'wrong' }),
          onSolved: grow,
        }),
        {
          kind: 'fields',
          label: 'Temukan polanya',
          prompt: `Dari mana $${kvNum[0]}$ dan $${kvNum[1]}$? Lengkapi perkaliannya.`,
          fields: [
            { key: 'px', label: `$${kvNum[0]} = 3 \\times$`, mode: 'integer', aria: 'Bilangan baris x' },
            { key: 'py', label: `$${kvNum[1]} = 3 \\times$`, mode: 'integer', aria: 'Bilangan baris y' },
          ],
          check: (vals) => {
            const s = [vals.px.value, vals.py.value];
            return matches(s, v) ? true : { toast: 'polaKali', wrong: wrongKeys(s, v, 'p') };
          },
          hint: () => ({ text: `Bilangan yang hilang adalah komponen $\\vec{v}$ pada data soal: $\\vec{v} = ${texTuple(v)}$.`, show: () => glow(this, 'v'), fields: 'wrong' }),
          summary: () => `$3\\vec{v} = ${texColumnRaw([`3 \\times ${v[0]}`, `3 \\times ${v[1]}`])}$: **setiap** komponen dikali $3$.`,
        },
        this.compareStep(c, {
          prompt: 'Bandingkan $3\\vec{v}$ dengan $\\vec{v}$ pada gambar.',
          options: [
            { key: 'lawan-panjang', label: 'Berlawanan arah, $3$ kali lebih panjang' },
            { key: 'searah-sama', label: 'Searah, sama panjang' },
            { key: 'searah-panjang', label: 'Searah, $3$ kali lebih panjang' },
          ],
          right: 'searah-panjang',
        }),
      ];
    }

    if (c.kind === 'negative') {
      return [
        this.scaleStep(c, {
          label: `Hitung $${kTex}\\vec{v}$`,
          prompt: `Sekarang $k$ negatif. Hitung $${kTex}\\vec{v}$: kalikan **setiap** komponen dengan $${kTex}$.`,
          hint: () => ({ text: `$${kTex} \\times ${v[0]}$ dan $${kTex} \\times ${paren(v[1])}$. Negatif kali positif hasilnya negatif.`, fields: 'wrong' }),
          onSolved: grow,
        }),
        this.compareStep(c, {
          prompt: `Bandingkan $${kTex}\\vec{v}$ dengan $\\vec{v}$ pada gambar.`,
          options: [
            { key: 'searah-panjang', label: 'Searah, $2$ kali lebih panjang' },
            { key: 'lawan-panjang', label: 'Berlawanan arah, $2$ kali lebih panjang' },
            { key: 'lawan-pendek', label: 'Berlawanan arah, setengah panjang $\\vec{v}$' },
          ],
          right: 'lawan-panjang',
        }),
      ];
    }

    if (c.kind === 'fraction') {
      return [
        this.scaleStep(c, {
          label: `Hitung $${kTex}\\vec{v}$`,
          prompt: `Hitung $${kTex}\\vec{v}$.`,
          intro: 'Mengalikan dengan $\\frac{1}{2}$ sama dengan **membagi dua**.',
          hint: () => ({ text: `$\\frac{1}{2} \\times ${v[0]} = ${v[0]} : 2$ dan $\\frac{1}{2} \\times ${paren(v[1])} = ${paren(v[1])} : 2$.`, fields: 'wrong' }),
          onSolved: grow,
        }),
        this.compareStep(c, {
          prompt: `Bandingkan $${kTex}\\vec{v}$ dengan $\\vec{v}$ pada gambar.`,
          options: [
            { key: 'searah-pendek', label: 'Searah, setengah panjang $\\vec{v}$' },
            { key: 'lawan-pendek', label: 'Berlawanan arah, setengah panjang $\\vec{v}$' },
            { key: 'searah-panjang', label: 'Searah, $2$ kali lebih panjang' },
          ],
          right: 'searah-pendek',
        }),
      ];
    }

    const sumSq = v.reduce((acc, n) => acc + n * n, 0);
    const len = S.fromSquare(sumSq);
    const kLen = S.mulS(kOf(c), len);
    return [
      this.scaleStep(c, {
        label: `Hitung $${kTex}\\vec{v}$`,
        prompt: `Di ruang pun sama. Hitung $${kTex}\\vec{v}$.`,
        hint: () => ({ text: `Kalikan ketiga komponen dengan $${kTex}$: $${v.map((n) => `${kTex} \\times ${paren(n)}`).join(', \\quad ')}$.`, fields: 'wrong' }),
      }),
      {
        kind: 'fields',
        label: 'Panjang $\\vec{v}$',
        prompt: 'Hitung panjang $\\vec{v}$: akar dari jumlah kuadrat **semua** komponennya (Bab 1).',
        fields: [{ key: 'len', label: '$|\\vec{v}| =$', mode: 'surd' }],
        check: (values) => {
          const verdict = Val.checkExactAnswer(values.len.raw, len, { requireSimplest: true });
          if (verdict.correct) return true;
          if (verdict.code === 'not-simplest') return { toast: 'belumDisederhanakan' };
          if (verdict.code === 'decimal') return { toast: 'terlanjurDesimal' };
          if (same(values.len.value, sumSq)) return { toast: 'belumDiakar' };
          if (same(values.len.value, v.reduce((acc, n) => acc + Math.abs(n), 0))) return { toast: 'lupaKuadrat' };
          return { toast: 'panjangSalah' };
        },
        hint: () => ({ text: `$|\\vec{v}| = \\sqrt{${v.map((n) => (n < 0 ? `(${n})^2` : `${n}^2`)).join(' + ')}}$. Cara mengetik: tekan **√**, lalu bilangannya.`, fields: ['len'] }),
        summary: () => `$|\\vec{v}| = \\sqrt{${sumSq}} = ${S.toLatexS(len)}$`,
      },
      {
        kind: 'fields',
        label: `Panjang $${kTex}\\vec{v}$`,
        prompt: `Sekarang panjang $${kTex}\\vec{v}$. Hitung dalam bentuk akar paling sederhana.`,
        fields: [{ key: 'klen', label: `$|${kTex}\\vec{v}| =$`, mode: 'surd' }],
        check: (values) => {
          const verdict = Val.checkExactAnswer(values.klen.raw, kLen, { requireSimplest: true });
          if (verdict.correct) return true;
          if (verdict.code === 'not-simplest') return { toast: 'belumDisederhanakan' };
          if (verdict.code === 'decimal') return { toast: 'terlanjurDesimal' };
          if (same(values.klen.value, len)) return { toast: 'lupaKaliK' };
          return { toast: 'panjangSalah' };
        },
        hint: () => ({ text: `Cara cepat: $|k\\vec{v}| = |k| \\times |\\vec{v}|$, jadi $${kTex} \\times ${S.toLatexS(len)}$. Cara mengetik: angka depan, lalu **√**, lalu angka di dalam akar.`, fields: ['klen'] }),
        summary: () => `$|${kTex}\\vec{v}| = ${kTex} \\times ${S.toLatexS(len)} = ${S.toLatexS(kLen)}$`,
      },
    ];
  }
}

/* ============================================================
   5. combo_guided — Kombinasi Operasi

   Kasus 1 (terpandu): 2u − v di bidang — perkalian skalar dulu (2u, −v),
   lalu dijumlahkan dengan aturan segitiga. Kasus 2: 3u + 2v tanpa gambar.
   Kasus 3: tiga komponen. Kasus 4: persamaan 2x + a = b.
   ============================================================ */
/** "2\vec{u} - \vec{v}" dari skalar ku, kv. */
function comboTex(ku, kv) {
  const term = (k, name, first) => {
    const abs = Math.abs(k);
    const body = `${abs === 1 ? '' : abs}\\vec{${name}}`;
    if (first) return k < 0 ? `-${body}` : body;
    return k < 0 ? ` - ${body}` : ` + ${body}`;
  };
  return `${term(ku, 'u', true)}${term(kv, 'v', false)}`;
}
const scaledTex = (k, name) => `${k === 1 ? '' : k === -1 ? '-' : k}\\vec{${name}}`;

export class GuidedComboSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind === 'plane';
  }

  planeOptions(c) {
    const su = mul(c.ku, c.u);
    return boundsOf([c.u, c.v, su, add(su, mul(c.kv, c.v))]);
  }

  caseLabel(c) {
    return c.kind === 'unknown' ? 'Cari $\\vec{x}$' : `$${comboTex(c.ku, c.kv)}$`;
  }

  caseSuccessKey(c) {
    return { plane: 'success', calc: 'successHitung', space: 'successRuang', unknown: 'successPersamaan' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'plane') return 'Urutannya seperti aljabar: **perkalian skalar dulu**, baru penjumlahan atau pengurangan komponen.';
    if (c.kind === 'unknown') return 'Persamaan vektor diselesaikan seperti persamaan biasa: pindahkan ruas, lalu bagi dengan skalarnya.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'calc') return 'Sekarang **tanpa gambar** — urutannya tetap sama.';
    if (next.kind === 'space') return 'Bagaimana dengan **tiga komponen**? Sama saja.';
    return 'Terakhir, **persamaan vektor**: cari $\\vec{x}$.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Kombinasi Operasi Dikuasai',
      recap: [
        '**Perkalian skalar dulu**, baru penjumlahan/pengurangan',
        'Skalar mengalikan **semua** komponen; tanda minus ikut dibawa',
        'Persamaan $2\\vec{x} + \\vec{a} = \\vec{b}$: $\\vec{x} = \\frac{1}{2}(\\vec{b} - \\vec{a})$',
      ],
    };
  }

  setupCase(c) {
    this.marks = {};
    if (c.kind === 'unknown') {
      this.givenEl.appendChild(givenBlock(tex(`${c.k}\\vec{x} + \\vec{a} = \\vec{b} \\qquad \\vec{a} = ${col(c.a)} \\qquad \\vec{b} = ${col(c.b)}`), 'sim-given--display'));
      return;
    }
    this.givenEl.appendChild(givenBlock(tex(`\\vec{u} = ${col(c.u)} \\qquad \\vec{v} = ${col(c.v)}`), 'sim-given--display'));
    this.givenEl.appendChild(givenBlock(mixed(`Hitung $${comboTex(c.ku, c.kv)}$.`), 'sim-given--muted'));
    if (!this.plane) return;
    markPoint(this, 'O', [0, 0], { coords: false });
    this.uArrow = this.drawVector({ from: [0, 0], to: c.u, name: 'u', tone: 'blue' }, { essential: true });
    this.vArrow = this.drawVector({ from: [0, 0], to: c.v, name: 'v', tone: 'blue' }, { essential: true });
  }

  /** Isian k·w (w = u atau v) dengan pengenal kesalahan perkalian. */
  scaleStep(k, w, name, { label, prompt, onSolved }) {
    const dim = w.length;
    const key = mul(k, w);
    const prefix = name;
    return {
      kind: 'fields',
      label,
      prompt,
      fields: componentFields(dim, { prefix, label: (axis) => `$${axis}$` }),
      check: (values) => {
        const s = componentValues(values, dim, prefix);
        if (matches(s, key)) return true;
        const wrong = wrongKeys(s, key, prefix);
        if (k !== 1 && k !== -1 && same(s[0], key[0]) && s.slice(1).every((x, i) => same(x, w[i + 1]))) return { toast: 'skalarSemua', wrong };
        if (matches(s, neg(key))) return { toast: 'tandaHilang', wrong };
        return { toast: 'hasilKaliSalah', wrong };
      },
      hint: () => ({ text: `Kalikan **setiap** komponen $\\vec{${name}}$ dengan $${k}$: $${w.map((n) => `${k} \\times ${paren(n)}`).join(', \\quad ')}$.`, fields: 'wrong' }),
      summary: () => `$${scaledTex(k, name)} = ${col(key)}$`,
      onSolved,
    };
  }

  resultStep(c, { label, prompt, onSolved }) {
    const su = mul(c.ku, c.u);
    const sv = mul(c.kv, c.v);
    const key = add(su, sv);
    const dim = key.length;
    return {
      kind: 'fields',
      label,
      prompt,
      fields: componentFields(dim),
      check: (values) => {
        const s = componentValues(values, dim);
        if (matches(s, key)) return true;
        const wrong = wrongKeys(s, key);
        if (matches(s, sub(su, sv))) return { toast: 'tandaKurangSalah', wrong };
        return { toast: 'hasilSalah', wrong };
      },
      hint: () => ({ text: `Jumlahkan hasil kedua perkalian, komponen demi komponen: $${su.map((n, i) => `${n} + ${paren(sv[i])}`).join(', \\quad ')}$.`, fields: 'wrong' }),
      summary: () => `$${comboTex(c.ku, c.kv)} = ${col(key)}$`,
      onSolved,
    };
  }

  buildSteps(c) {
    if (c.kind === 'unknown') return this.stepsUnknown(c);
    const su = mul(c.ku, c.u);
    const sv = mul(c.kv, c.v);
    const result = add(su, sv);
    const expr = comboTex(c.ku, c.kv);

    if (c.kind === 'plane') {
      return [
        {
          kind: 'choice',
          label: 'Urutan pengerjaan',
          prompt: `Bentuk $${expr}$ memuat perkalian skalar dan pengurangan. Mana yang dikerjakan **lebih dulu**?`,
          options: [
            { key: 'kurang', label: 'Pengurangan $\\vec{u} - \\vec{v}$ dulu, baru dikali $2$' },
            { key: 'kali', label: `Perkalian skalar dulu: $${scaledTex(c.ku, 'u')}$ dan $${scaledTex(c.kv, 'v')}$` },
          ],
          check: (key) => (key === 'kali' ? true : { toast: 'kaliDulu' }),
          hint: () => ({ text: 'Sama seperti aljabar: pada $2x - y$, yang dikerjakan lebih dulu adalah $2x$. Angka $2$ hanya menempel pada $\\vec{u}$.' }),
          summary: () => 'Perkalian skalar dikerjakan lebih dulu.',
        },
        this.scaleStep(c.ku, c.u, 'u', {
          label: `Hitung $${scaledTex(c.ku, 'u')}$`,
          prompt: `Hitung $${scaledTex(c.ku, 'u')}$.`,
          onSolved: async () => {
            if (this.uArrow) this.uArrow.setTone('muted');
            await growArrow(this, [0, 0], su, { name: 'su', tone: 'blue', label: scaledTex(c.ku, 'u') });
          },
        }),
        this.scaleStep(c.kv, c.v, 'v', {
          label: `Hitung $${scaledTex(c.kv, 'v')}$`,
          prompt: `Berikutnya $${scaledTex(c.kv, 'v')}$: kalikan setiap komponen $\\vec{v}$ dengan $${c.kv}$.`,
          onSolved: async () => {
            if (this.vArrow) this.vArrow.setTone('muted');
            await growArrow(this, su, result, { name: 'sv', tone: 'coral', label: scaledTex(c.kv, 'v') });
          },
        }),
        this.resultStep(c, {
          label: `Hitung $${expr}$`,
          prompt: `Terakhir, jumlahkan $${scaledTex(c.ku, 'u')}$ dan $${scaledTex(c.kv, 'v')}$ komponen demi komponen.`,
          onSolved: () => growArrow(this, [0, 0], result, { name: 'hasil', tone: 'cyan', label: expr }),
        }),
      ];
    }

    const steps = [
      this.scaleStep(c.ku, c.u, 'u', {
        label: `Hitung $${scaledTex(c.ku, 'u')}$`,
        prompt: c.kind === 'space' ? `Tiga komponen, urutannya sama. Hitung dulu $${scaledTex(c.ku, 'u')}$.` : `Tanpa gambar. Kerjakan perkalian dulu: hitung $${scaledTex(c.ku, 'u')}$.`,
      }),
    ];
    if (c.kv !== 1) {
      steps.push(this.scaleStep(c.kv, c.v, 'v', {
        label: `Hitung $${scaledTex(c.kv, 'v')}$`,
        prompt: `Sekarang hitung $${scaledTex(c.kv, 'v')}$.`,
      }));
    }
    steps.push(this.resultStep(c, {
      label: `Hitung $${expr}$`,
      prompt: `Jumlahkan kedua hasilnya untuk mendapat $${expr}$.`,
    }));
    return steps;
  }

  stepsUnknown(c) {
    const { a, b, k } = c;
    const bma = sub(b, a);
    const x = bma.map((n) => S.divS(S.parseSurd(n), S.parseSurd(k)));
    return [
      {
        kind: 'choice',
        label: 'Pindahkan $\\vec{a}$',
        prompt: `Seperti persamaan biasa, pindahkan $\\vec{a}$ ke ruas kanan. $${k}\\vec{x} = \\dots$`,
        options: [
          { key: 'bpa', label: '$\\vec{b} + \\vec{a}$' },
          { key: 'bma', label: '$\\vec{b} - \\vec{a}$' },
          { key: 'amb', label: '$\\vec{a} - \\vec{b}$' },
        ],
        check: (key) => (key === 'bma' ? true : { toast: 'pindahRuas' }),
        hint: () => ({ text: `Kurangi **kedua ruas** dengan $\\vec{a}$: ruas kiri tinggal $${k}\\vec{x}$.` }),
        summary: () => `$${k}\\vec{x} = \\vec{b} - \\vec{a}$`,
      },
      {
        kind: 'fields',
        label: 'Hitung $\\vec{b} - \\vec{a}$',
        prompt: 'Hitung $\\vec{b} - \\vec{a}$.',
        fields: componentFields(2),
        check: (values) => {
          const s = componentValues(values, 2);
          if (matches(s, bma)) return true;
          const wrong = wrongKeys(s, bma);
          if (matches(s, add(a, b))) return { toast: 'pindahRuas', wrong };
          return { toast: 'hasilSalah', wrong };
        },
        hint: () => ({ text: `$x = ${b[0]} - ${paren(a[0])}$ dan $y = ${b[1]} - ${paren(a[1])}$.`, fields: 'wrong' }),
        summary: () => `$${k}\\vec{x} = ${col(bma)}$`,
      },
      {
        kind: 'fields',
        label: 'Hitung $\\vec{x}$',
        prompt: `Jadi $${k}\\vec{x} = ${texTuple(bma)}$. Berapa $\\vec{x}$?`,
        fields: componentFields(2, { mode: 'fraction' }),
        check: (values) => {
          const s = componentValues(values, 2);
          if (matches(s, x)) return true;
          const wrong = wrongKeys(s, x);
          if (matches(s, bma)) return { toast: 'belumDibagi', wrong };
          if (matches(s, mul(k, bma))) return { toast: 'dikaliBukanDibagi', wrong };
          return { toast: 'hasilSalah', wrong };
        },
        hint: () => ({ text: `Bagi **setiap** komponen dengan $${k}$: $${bma[0]} : ${k}$ dan $${bma[1]} : ${k}$.`, fields: 'wrong' }),
        summary: () => `$\\vec{x} = ${col(x)}$`,
      },
    ];
  }
}

/* ============================================================
   6. equality_guided — Kesamaan Dua Vektor

   Kasus 1 (terpandu): AB dan CD di tempat berbeda tetapi komponennya sama
   → vektor yang sama; EF sama panjang tetapi berlawanan arah → bukan.
   Kasus 2–3: kesamaan vektor dipecah menjadi persamaan per komponen.
   Kasus 4: tiga komponen dengan penjumlahan.
   ============================================================ */
export class GuidedEqualitySim extends CaseSimulation {
  usesPlane(c) {
    return c.kind === 'compare';
  }

  planeOptions(c) {
    return boundsOf([c.A, c.B, c.C, c.D, c.E, c.F]);
  }

  caseLabel(c, i) {
    if (c.kind === 'compare') return 'Dua panah';
    if (c.kind === 'space') return 'Tiga komponen';
    return `Persamaan ${i}`;
  }

  caseSuccessKey(c) {
    return { compare: 'success', solve: 'successPersamaan', space: 'successRuang' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'compare') return 'Dua vektor **sama** jika **semua** komponen seletaknya sama — letaknya boleh berbeda. Panjang sama saja belum cukup.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'space') return 'Terakhir, **tiga komponen** dengan penjumlahan di ruas kiri.';
    return 'Sekarang kita pakai kesamaan vektor untuk **mencari nilai** yang belum diketahui.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Kesamaan Vektor Dikuasai',
      recap: [
        '$\\vec{a} = \\vec{b}$ jika dan hanya jika **semua** komponen seletaknya sama',
        'Letak boleh berbeda; panjang sama tetapi arah berlawanan berarti **tidak** sama',
        'Satu persamaan vektor = persamaan sebanyak komponennya',
      ],
    };
  }

  setupCase(c) {
    this.marks = {};
    if (c.kind === 'compare') {
      ['A', 'B', 'C', 'D'].forEach((n) => markPoint(this, n, c[n]));
      this.drawVector({ from: c.A, to: c.B, name: 'AB', tone: 'blue' }, { essential: true });
      this.drawVector({ from: c.C, to: c.D, name: 'CD', tone: 'blue' }, { essential: true });
      this.givenEl.appendChild(givenBlock(mixed('Dua panah, $\\overrightarrow{AB}$ dan $\\overrightarrow{CD}$, digambar di tempat yang berbeda.')));
      return;
    }
    const lhs = c.kind === 'space'
      ? `${texColumnRaw(c.p)} + ${texColumnRaw(c.q)} = ${texColumnRaw(c.r)}`
      : `${texColumnRaw(c.lhs)} = ${texColumnRaw(c.rhs.map(String))}`;
    this.givenEl.appendChild(givenBlock(tex(lhs), 'sim-given--display'));
  }

  /** Isian komponen satu ruas berarah dengan pengenal kesalahan. */
  segmentStep(c, from, to, prefix, { label, prompt, onSolved }) {
    const key = sub(c[to], c[from]);
    return {
      kind: 'fields',
      label,
      prompt,
      fields: componentFields(2, { prefix }),
      check: (values) => {
        const s = componentValues(values, 2, prefix);
        const verdict = vectorVerdict(s, key);
        if (verdict === 'ok') return true;
        const wrong = wrongKeys(s, key, prefix);
        if (verdict === 'sign') return { toast: 'tandaTerbalik', values: { nama: `${from}${to}`, kebalikan: `${to}${from}` }, wrong };
        if (verdict === 'swap') return { toast: 'komponenTertukar', wrong };
        return { toast: 'komponenSalah', wrong };
      },
      hint: () => ({
        text: `Ikuti lompatan bayangan dari $${from}$ ke $${to}$, atau hitung ujung − pangkal: $x = ${c[to][0]} - ${paren(c[from][0])}$.`,
        show: () => ghostHops(this, c[from], key),
        fields: 'wrong',
      }),
      summary: () => `$\\overrightarrow{${from}${to}} = ${col(key)}$`,
      onSolved,
    };
  }

  /** Satu persamaan komponen: a·var + b = rhs. */
  rowStep(row, i, { first }) {
    const key = S.divS(S.parseSurd(row.rhs - row.b), S.parseSurd(row.a));
    const field = `s${i}`;
    return {
      kind: 'fields',
      label: `Nilai $${row.v}$`,
      prompt: first
        ? `Dua vektor sama jika **semua** komponen seletaknya sama. Samakan komponen ${ORDINAL[i]} kedua ruas, lalu cari $${row.v}$.`
        : `Sekarang komponen ${ORDINAL[i]}: cari $${row.v}$.`,
      fields: [{ key: field, label: `$${row.v} =$`, mode: 'fraction' }],
      check: (values) => {
        const s = values[field].value;
        if (same(s, key)) return true;
        if (row.b !== 0 && same(s, S.divS(S.parseSurd(row.rhs + row.b), S.parseSurd(row.a)))) return { toast: 'pindahTanda' };
        if (row.a !== 1 && (same(s, row.rhs - row.b) || same(s, (row.rhs - row.b) * row.a))) return { toast: 'lupaBagi' };
        return { toast: 'nilaiSalah' };
      },
      hint: () => ({ text: `Komponen ${ORDINAL[i]} memberi persamaan $${row.eq}$. Selesaikan seperti persamaan biasa.`, fields: [field] }),
      summary: () => `$${row.eq} \\;\\Rightarrow\\; ${row.v} = ${texNum(key)}$`,
    };
  }

  buildSteps(c) {
    if (c.kind !== 'compare') return c.rows.map((row, i) => this.rowStep(row, i, { first: i === 0 }));
    const AB = sub(c.B, c.A);
    return [
      this.segmentStep(c, 'A', 'B', 'p', {
        label: 'Komponen $\\overrightarrow{AB}$',
        prompt: 'Perhatikan $\\overrightarrow{AB}$ dan $\\overrightarrow{CD}$: letaknya berbeda. Tulis dulu komponen $\\overrightarrow{AB}$.',
      }),
      this.segmentStep(c, 'C', 'D', 'q', {
        label: 'Komponen $\\overrightarrow{CD}$',
        prompt: 'Sekarang tulis komponen $\\overrightarrow{CD}$.',
      }),
      {
        kind: 'choice',
        label: 'Sama atau tidak?',
        prompt: 'Komponen keduanya ternyata sama. Apakah $\\overrightarrow{AB} = \\overrightarrow{CD}$?',
        options: [
          { key: 'beda', label: 'Tidak, karena letaknya berbeda' },
          { key: 'sama', label: 'Ya, sama: panjang dan arahnya sama, walaupun letaknya berbeda' },
        ],
        check: (key) => (key === 'sama' ? true : { toast: 'letakTidakPenting' }),
        hint: () => ({ text: 'Vektor hanya ditentukan oleh **panjang** dan **arah**-nya. Kalau digeser, apakah $\\overrightarrow{CD}$ bisa menempel tepat di $\\overrightarrow{AB}$?', show: () => ghostArrow(this, c.A, c.B) }),
        summary: () => '$\\overrightarrow{AB} = \\overrightarrow{CD}$: komponennya sama.',
        onSolved: async () => {
          if (!this.plane) return;
          const copy = this.drawVector({ from: c.C, to: c.D, name: 'salinan', tone: 'muted', label: null });
          await copy.setVector({ from: c.A, to: c.B }, { animate: !stillMotion(), duration: ARROW_MS });
          // Salinan sudah menempel tepat di AB; dibuang supaya AB tetap terbaca.
          await this.wait(stillMotion() ? 0 : 400);
          if (this.destroyed || !this.plane) return;
          copy.remove();
          markPoint(this, 'E', c.E);
          markPoint(this, 'F', c.F);
          await growArrow(this, c.E, c.F, { name: 'EF', tone: 'coral' });
        },
      },
      this.segmentStep(c, 'E', 'F', 'r', {
        label: 'Komponen $\\overrightarrow{EF}$',
        prompt: 'Sekarang panah ketiga, $\\overrightarrow{EF}$. Tulis komponennya.',
      }),
      {
        kind: 'choice',
        label: 'Panjang sama, arah?',
        prompt: 'Panjang $\\overrightarrow{EF}$ sama dengan $\\overrightarrow{AB}$. Apakah $\\overrightarrow{EF} = \\overrightarrow{AB}$?',
        options: [
          { key: 'sama', label: 'Ya, karena panjangnya sama' },
          { key: 'lawan', label: 'Tidak: arahnya berlawanan, $\\overrightarrow{EF} = -\\overrightarrow{AB}$' },
        ],
        check: (key) => (key === 'lawan' ? true : { toast: 'panjangSajaTidakCukup' }),
        hint: () => ({ text: `Bandingkan tanda komponennya: $\\overrightarrow{AB} = ${texTuple(AB)}$ dan $\\overrightarrow{EF} = ${texTuple(sub(c.F, c.E))}$.`, show: () => glow(this, 'AB', 'EF') }),
        summary: () => '$\\overrightarrow{EF} = -\\overrightarrow{AB}$: sama panjang, tetapi **tidak** sama.',
      },
    ];
  }
}

/* ============================================================
   7. collinear_guided — Titik-Titik Segaris (Kolinier)

   Kasus 1 (terpandu): hitung AB dan AC, cari k dari komponen x, uji pada
   komponen y; salinan AB yang bersambung tiba tepat di C. Kasus 2: k
   negatif (C di seberang A). Kasus 3: k gagal di komponen y → tidak
   segaris. Kasus 4: tiga komponen, mencari koordinat yang belum diketahui.
   ============================================================ */
export class GuidedCollinearSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind !== 'space';
  }

  planeOptions(c) {
    return boundsOf([c.A, c.B, c.C]);
  }

  caseLabel(c) {
    return { yes: 'Segaris?', negative: '$k$ negatif', no: 'Uji gagal', space: 'Tiga komponen' }[c.kind];
  }

  caseSuccessKey(c) {
    return { yes: 'success', negative: 'successBerlawanan', no: 'successTidak', space: 'successRuang' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'yes') return 'Tiga titik **segaris** jika $\\overrightarrow{AC} = k\\,\\overrightarrow{AB}$ dengan $k$ yang **sama** untuk semua komponen.';
    if (c.kind === 'no') return 'Satu komponen saja yang tidak cocok sudah cukup: titiknya **tidak segaris**.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'negative') return 'Bagaimana kalau $k$-nya **negatif**?';
    if (next.kind === 'no') return 'Sekarang tiga titik yang **kelihatannya** segaris. Kita uji.';
    return 'Terakhir, **tanpa gambar**: tiga komponen dan dua nilai yang dicari.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Titik Segaris Dikuasai',
      recap: [
        '$A$, $B$, $C$ segaris jika $\\overrightarrow{AC} = k\\,\\overrightarrow{AB}$',
        'Cari $k$ dari satu komponen, lalu **uji** pada komponen lainnya',
        '$k$ negatif: tetap segaris, $C$ berada di seberang $A$',
      ],
    };
  }

  setupCase(c) {
    this.marks = {};
    if (c.kind === 'space') {
      this.givenEl.appendChild(givenBlock(tex(`A${texTuple(c.A)} \\qquad B${texTuple(c.B)} \\qquad C(${c.Cx},\\, p,\\, q)`), 'sim-given--display'));
      this.givenEl.appendChild(givenBlock(mixed('Ketiga titik **segaris**. Tentukan $p$ dan $q$.'), 'sim-given--muted'));
      return;
    }
    ['A', 'B', 'C'].forEach((n) => markPoint(this, n, c[n]));
    this.givenEl.appendChild(givenBlock(mixed(`Tiga titik: ${named('A', c.A)}, ${named('B', c.B)}, dan ${named('C', c.C)}.`)));
  }

  differenceStep(c, end, prefix, { label, prompt, onSolved }) {
    const dim = c.A.length;
    const key = sub(c[end], c.A);
    return {
      kind: 'fields',
      label,
      prompt,
      fields: componentFields(dim, { prefix }),
      check: (values) => {
        const s = componentValues(values, dim, prefix);
        if (matches(s, key)) return true;
        const wrong = wrongKeys(s, key, prefix);
        if (matches(s, neg(key))) return { toast: 'tandaTerbalik', values: { nama: `A${end}`, kebalikan: `${end}A` }, wrong };
        return { toast: 'hasilSalah', wrong };
      },
      hint: () => ({ text: `Ujung − pangkal: $${c[end].map((n, i) => `${n} - ${paren(c.A[i])}`).join(', \\quad ')}$.`, fields: 'wrong' }),
      summary: () => `$\\overrightarrow{A${end}} = ${end} - A = ${col(key)}$`,
      onSolved,
    };
  }

  kStep(AB, AC, { label, prompt, onSolved }) {
    const i = AB[0] !== 0 ? 0 : 1;
    const key = S.divS(S.parseSurd(AC[i]), S.parseSurd(AB[i]));
    return {
      kind: 'fields',
      label,
      prompt,
      fields: [{ key: 'k', label: '$k =$', mode: 'fraction' }],
      check: (values) => {
        const s = values.k.value;
        if (same(s, key)) return true;
        if (same(s, AC[i] - AB[i])) return { toast: 'kurangBukanBagi' };
        if (AC[i] !== 0 && same(s, S.divS(S.parseSurd(AB[i]), S.parseSurd(AC[i])))) return { toast: 'kTerbalik' };
        if (same(s, S.negS(key))) return { toast: 'tandaK' };
        return { toast: 'kSalah' };
      },
      hint: () => ({ text: `$${AC[i]} = k \\times ${paren(AB[i])}$, jadi $k = ${AC[i]} : ${paren(AB[i])}$. Pecahan diketik dengan tuts **a/b**.`, fields: ['k'] }),
      summary: () => `$k = ${texNum(key)}$`,
      onSolved,
    };
  }

  testStep(AB, k, { prompt }) {
    const key = S.mulS(k, S.parseSurd(AB[1]));
    return {
      kind: 'fields',
      label: 'Uji komponen $y$',
      prompt,
      fields: [{ key: 'uji', label: `$${texNum(k)} \\times ${paren(AB[1])} =$`, mode: 'fraction' }],
      check: (values) => (same(values.uji.value, key) ? true : { toast: 'ujiSalah' }),
      hint: () => ({ text: `Kalikan $k = ${texNum(k)}$ dengan komponen $y$ $\\overrightarrow{AB}$, yaitu $${AB[1]}$.`, fields: ['uji'] }),
      summary: () => `Uji: $${texNum(k)} \\times ${paren(AB[1])} = ${texNum(key)}$`,
    };
  }

  buildSteps(c) {
    if (c.kind === 'space') return this.stepsSpace(c);
    const AB = sub(c.B, c.A);
    const AC = sub(c.C, c.A);
    const k = S.divS(S.parseSurd(AC[0]), S.parseSurd(AB[0]));
    const kNum = S.toNumber(k);
    const kTex = texNum(k);
    // Garis melalui A dan B, sepanjang bidang: C terletak di atasnya atau tidak.
    const [lineFrom, lineTo] = lineThrough(c.A, AB, this.planeOptions(c));
    const line = () => {
      if (this.plane) this.plane.drawSegment(lineFrom, lineTo, { dashed: true });
    };
    const steps = [
      this.differenceStep(c, 'B', 'p', {
        label: 'Hitung $\\overrightarrow{AB}$',
        prompt: c.kind === 'yes'
          ? 'Apakah ketiga titik ini **segaris**? Sulit dipastikan hanya dengan melihat. Hitung dulu $\\overrightarrow{AB}$.'
          : 'Hitung dulu $\\overrightarrow{AB}$.',
        onSolved: () => growArrow(this, c.A, c.B, { name: 'AB', tone: 'blue' }),
      }),
      this.differenceStep(c, 'C', 'q', {
        label: 'Hitung $\\overrightarrow{AC}$',
        prompt: 'Sekarang hitung $\\overrightarrow{AC}$.',
        onSolved: () => growArrow(this, c.A, c.C, { name: 'AC', tone: 'cyan' }),
      }),
      this.kStep(AB, AC, {
        label: 'Cari $k$',
        prompt: `Apakah $\\overrightarrow{AC} = k\\,\\overrightarrow{AB}$? Dari komponen $x$: $${AC[0]} = k \\times ${paren(AB[0])}$. Berapa $k$?`,
        onSolved: Number.isInteger(kNum) ? () => chainCopies(this, c.A, AB, kNum) : undefined,
      }),
      this.testStep(AB, k, {
        prompt: `Uji $k$ pada komponen $y$: hitung $${kTex} \\times ${paren(AB[1])}$, lalu bandingkan dengan komponen $y$ $\\overrightarrow{AC}$, yaitu $${AC[1]}$.`,
      }),
    ];
    if (c.kind === 'yes') {
      steps.push({
        kind: 'choice',
        label: 'Kesimpulan',
        prompt: `Hasil uji sama dengan $${AC[1]}$: $k$ berlaku untuk **kedua** komponen. Jadi…`,
        options: [
          { key: 'tidak', label: 'Tidak segaris' },
          { key: 'segaris', label: `$A$, $B$, $C$ segaris: $\\overrightarrow{AC} = ${kTex}\\overrightarrow{AB}$, keduanya berpangkal di $A$` },
        ],
        check: (key) => (key === 'segaris' ? true : { toast: 'kCocok' }),
        hint: () => ({ text: 'Salinan $\\overrightarrow{AB}$ yang bersambung tiba tepat di $C$. Apa artinya?' }),
        summary: () => `$\\overrightarrow{AC} = ${kTex}\\overrightarrow{AB}$: **segaris**.`,
        onSolved: line,
      });
    } else if (c.kind === 'negative') {
      steps.push({
        kind: 'choice',
        label: 'Kesimpulan',
        prompt: `$k = ${kTex}$ cocok untuk kedua komponen, tetapi negatif. Apakah $A$, $B$, $C$ segaris?`,
        options: [
          { key: 'tidak', label: 'Tidak, karena $k$ negatif' },
          { key: 'seberang', label: 'Ya, segaris: $C$ berada di seberang $A$, berlawanan arah dengan $B$' },
        ],
        check: (key) => (key === 'seberang' ? true : { toast: 'kNegatif' }),
        hint: () => ({ text: '$k$ negatif hanya membalik **arah** $\\overrightarrow{AC}$. Lihat gambar: apakah $B$, $A$, $C$ tetap pada satu garis lurus?' }),
        summary: () => `$\\overrightarrow{AC} = ${kTex}\\overrightarrow{AB}$: **segaris**, $C$ di seberang $A$.`,
        onSolved: line,
      });
    } else {
      steps.push({
        kind: 'choice',
        label: 'Kesimpulan',
        prompt: `Hasil uji $${texNum(S.mulS(k, S.parseSurd(AB[1])))}$, padahal komponen $y$ $\\overrightarrow{AC}$ adalah $${AC[1]}$. Jadi…`,
        options: [
          { key: 'segaris', label: 'Segaris, karena komponen $x$ sudah cocok' },
          { key: 'tidak', label: 'Tidak segaris: $k$ dari komponen $x$ tidak berlaku untuk komponen $y$' },
        ],
        check: (key) => (key === 'tidak' ? true : { toast: 'satuKomponenTidakCukup' }),
        hint: () => ({
          text: 'Syaratnya $k$ yang **sama** untuk **semua** komponen. Garis putus-putus melalui $A$ dan $B$: apakah $C$ terletak di atasnya?',
          show: () => {
            if (!this.plane) return () => {};
            const seg = this.plane.drawSegment(lineFrom, lineTo, { dashed: true });
            seg.el.classList.add('plane__segment--hint');
            return () => seg.remove();
          },
        }),
        summary: () => '$k$ tidak sama untuk kedua komponen: **tidak segaris**.',
        onSolved: line,
      });
    }
    return steps;
  }

  stepsSpace(c) {
    const AB = sub(c.B, c.A);
    const k = (c.Cx - c.A[0]) / AB[0];
    const p = c.A[1] + k * AB[1];
    const q = c.A[2] + k * AB[2];
    return [
      this.differenceStep(c, 'B', 'p', {
        label: 'Hitung $\\overrightarrow{AB}$',
        prompt: 'Titik $A$, $B$, $C$ segaris. Hitung dulu $\\overrightarrow{AB}$.',
      }),
      {
        kind: 'fields',
        label: 'Cari $k$',
        prompt: `$\\overrightarrow{AC} = k\\,\\overrightarrow{AB}$. Komponen $x$ sudah diketahui: $${c.Cx} - ${paren(c.A[0])} = k \\times ${paren(AB[0])}$. Berapa $k$?`,
        fields: [{ key: 'k', label: '$k =$', mode: 'fraction' }],
        check: (values) => {
          if (same(values.k.value, k)) return true;
          if (same(values.k.value, c.Cx / AB[0])) return { toast: 'lupaKurangA' };
          return { toast: 'kSalah' };
        },
        hint: () => ({ text: `Hitung dulu ruas kiri: $${c.Cx} - ${paren(c.A[0])}$. Lalu bagi dengan $${AB[0]}$.`, fields: ['k'] }),
        summary: () => `$k = ${k}$`,
      },
      {
        kind: 'fields',
        label: 'Cari $p$ dan $q$',
        prompt: 'Pakai $k$ yang sama untuk komponen $y$ dan $z$, lalu cari $p$ dan $q$.',
        fields: [
          { key: 'p', label: '$p =$', mode: 'fraction' },
          { key: 'q', label: '$q =$', mode: 'fraction' },
        ],
        check: (values) => {
          const okP = same(values.p.value, p);
          const okQ = same(values.q.value, q);
          if (okP && okQ) return true;
          const wrong = [...(okP ? [] : ['p']), ...(okQ ? [] : ['q'])];
          if ((!okP && same(values.p.value, k * AB[1])) || (!okQ && same(values.q.value, k * AB[2]))) return { toast: 'lupaTambahA', wrong };
          return { toast: 'nilaiSalah', wrong };
        },
        hint: () => ({ text: `Komponen $\\overrightarrow{AC}$: $p - ${paren(c.A[1])} = ${k} \\times ${paren(AB[1])}$ dan $q - ${paren(c.A[2])} = ${k} \\times ${paren(AB[2])}$.`, fields: 'wrong' }),
        summary: () => `$p = ${p}$ dan $q = ${q}$, jadi $C${texTuple([c.Cx, p, q])}$.`,
      },
    ];
  }
}

/* ============================================================
   8. section_guided — Pembagian Ruas Garis

   Kasus 1 (terpandu): AP : PB = 2 : 1 → AB dibagi 3 bagian sama panjang;
   satu bagian, AP = 2 bagian, P = A + AP, lalu dicocokkan dengan rumus
   yang BERSILANG. Kasus 2: titik tengah. Kasus 3: tiga komponen dengan
   rumus. Kasus 4: pembagian di luar ruas.
   ============================================================ */
const sectionPoint = (c) => c.A.map((a, i) => S.divS(S.parseSurd(c.m * c.B[i] + c.n * a), S.parseSurd(c.m + c.n)));

export class GuidedSectionSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind !== 'space';
  }

  planeOptions(c) {
    return boundsOf([c.A, c.B, numeric(sectionPoint(c))]);
  }

  caseLabel(c) {
    return { parts: '$2 : 1$', mid: 'Titik tengah', space: 'Tiga komponen', outer: 'Di luar ruas' }[c.kind];
  }

  caseSuccessKey(c) {
    return { parts: 'success', mid: 'successTengah', space: 'successRuang', outer: 'successLuar' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'parts') return 'Rumusnya **bersilang**: bagian di dekat $A$ ($m$) menjadi bobot $\\vec{b}$, bagian di dekat $B$ ($n$) menjadi bobot $\\vec{a}$.';
    if (c.kind === 'mid') return 'Titik tengah adalah kasus $1 : 1$: jumlahkan kedua vektor posisi, lalu bagi dua.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'mid') return 'Sekarang kasus yang paling sering muncul: **titik tengah**.';
    if (next.kind === 'space') return 'Bagaimana dengan **tiga komponen**? Kita pakai rumusnya langsung.';
    return 'Terakhir: titik $P$ yang berada **di luar** ruas $AB$.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Pembagian Ruas Garis Dikuasai',
      recap: [
        '$AP : PB = m : n$ → $\\overrightarrow{AB}$ dibagi $m + n$ bagian sama panjang',
        '$\\vec{p} = \\dfrac{m\\vec{b} + n\\vec{a}}{m + n}$ — bobotnya **bersilang**',
        'Titik tengah: $\\dfrac{\\vec{a} + \\vec{b}}{2}$; di luar ruas: salah satu bagian bertanda negatif',
      ],
    };
  }

  setupCase(c) {
    this.marks = {};
    const ratio = `AP : PB = ${c.m} : ${c.n < 0 ? `(${c.n})` : c.n}`;
    if (c.kind === 'space') {
      this.givenEl.appendChild(givenBlock(tex(`A${texTuple(c.A)} \\qquad B${texTuple(c.B)} \\qquad ${ratio}`), 'sim-given--display'));
      return;
    }
    markPoint(this, 'A', c.A);
    markPoint(this, 'B', c.B);
    this.plane.drawSegment(c.A, c.B);
    const text = c.kind === 'mid'
      ? 'Titik $M$ adalah titik tengah ruas garis $AB$.'
      : `Titik $P$ terletak pada garis $AB$ dengan $${ratio}$.`;
    this.givenEl.appendChild(givenBlock(mixed(text)));
  }

  /** Isian vektor 2D/3D umum dengan dua kesalahan khas yang diberikan engine. */
  vecStep({ dim, key, prefix = 'c', label, prompt, intro, mode = 'fraction', traps = [], hint, summary, onSolved }) {
    return {
      kind: 'fields',
      label,
      prompt,
      intro,
      fields: componentFields(dim, { prefix, mode }),
      check: (values) => {
        const s = componentValues(values, dim, prefix);
        if (matches(s, key)) return true;
        const wrong = wrongKeys(s, key, prefix);
        const trap = traps.find((t) => matches(s, t.value));
        return trap ? { ...trap.result, wrong } : { toast: 'hasilSalah', wrong };
      },
      hint,
      summary,
      onSolved,
    };
  }

  buildSteps(c) {
    if (c.kind === 'parts') return this.stepsParts(c);
    if (c.kind === 'mid') return this.stepsMid(c);
    if (c.kind === 'space') return this.stepsSpace(c);
    return this.stepsOuter(c);
  }

  stepsParts(c) {
    const { A, B, m, n } = c;
    const AB = sub(B, A);
    const total = m + n;
    const part = AB.map((x) => S.divS(S.parseSurd(x), S.parseSurd(total)));
    const partNum = numeric(part);
    const AP = mul(m, partNum);
    const P = add(A, AP);
    return [
      this.vecStep({
        dim: 2,
        key: AB,
        prefix: 'p',
        mode: 'integer',
        label: 'Hitung $\\overrightarrow{AB}$',
        prompt: 'Kita cari letak $P$ dengan vektor. Hitung dulu $\\overrightarrow{AB}$.',
        traps: [{ value: neg(AB), result: { toast: 'tandaTerbalik', values: { nama: 'AB', kebalikan: 'BA' } } }],
        hint: () => ({ text: `Ujung − pangkal: $x = ${B[0]} - ${paren(A[0])}$ dan $y = ${B[1]} - ${paren(A[1])}$.`, fields: 'wrong' }),
        summary: () => `$\\overrightarrow{AB} = ${col(AB)}$`,
        onSolved: () => growArrow(this, A, B, { name: 'AB', tone: 'blue' }),
      }),
      this.vecStep({
        dim: 2,
        key: part,
        prefix: 'q',
        label: 'Satu bagian',
        prompt: `$${m} : ${n}$ berarti $\\overrightarrow{AB}$ dibagi $${m} + ${n} = ${total}$ bagian sama panjang. Hitung **satu bagian**.`,
        traps: [
          { value: AB.map((x) => S.divS(S.parseSurd(x), S.parseSurd(m))), result: { toast: 'banyakBagian' } },
          { value: AB, result: { toast: 'belumDibagi' } },
        ],
        hint: () => ({ text: `Satu bagian $= \\frac{1}{${total}}\\overrightarrow{AB}$: bagi setiap komponen dengan $${total}$, yaitu $${AB[0]} : ${total}$ dan $${AB[1]} : ${total}$.`, fields: 'wrong' }),
        summary: () => `Satu bagian $= \\frac{1}{${total}}\\overrightarrow{AB} = ${col(part)}$`,
        onSolved: () => {
          if (!this.plane) return;
          for (let j = 1; j < total; j += 1) this.plane.drawPoint(add(A, mul(j, partNum)), { ghost: true });
        },
      }),
      this.vecStep({
        dim: 2,
        key: AP,
        prefix: 'r',
        label: 'Hitung $\\overrightarrow{AP}$',
        prompt: `$P$ berjarak **${m} bagian** dari $A$. Hitung $\\overrightarrow{AP}$.`,
        traps: [
          { value: partNum, result: { toast: 'baruSatuBagian' } },
          { value: AB, result: { toast: 'seluruhRuas' } },
        ],
        hint: () => ({ text: `$\\overrightarrow{AP} = ${m} \\times ${texTuple(partNum)}$: kalikan setiap komponen satu bagian dengan $${m}$.`, show: () => ghostHops(this, A, AP), fields: 'wrong' }),
        summary: () => `$\\overrightarrow{AP} = ${m} \\times ${col(partNum)} = ${col(AP)}$`,
      }),
      this.vecStep({
        dim: 2,
        key: P,
        label: 'Koordinat $P$',
        prompt: '$P = A + \\overrightarrow{AP}$. Tentukan koordinat $P$.',
        traps: [{ value: AP, result: { toast: 'lupaTambahA' } }],
        hint: () => ({ text: `Titik ujung = titik pangkal + vektor: $x_P = ${A[0]} + ${AP[0]}$ dan $y_P = ${A[1]} + ${AP[1]}$.`, fields: 'wrong' }),
        summary: () => `$P = A + \\overrightarrow{AP} = ${texTuple(P)}$`,
        onSolved: async () => {
          await growArrow(this, A, P, { name: 'AP', tone: 'cyan' });
          markPoint(this, 'P', P);
        },
      }),
      {
        kind: 'choice',
        label: 'Cocokkan dengan rumus',
        prompt: `Sekarang bandingkan dengan rumus. Manakah yang menghasilkan $P${texTuple(P)}$?`,
        options: [
          { key: 'lurus', label: `$\\vec{p} = \\dfrac{${m}\\vec{a} + ${n}\\vec{b}}{${total}}$` },
          { key: 'silang', label: `$\\vec{p} = \\dfrac{${m}\\vec{b} + ${n}\\vec{a}}{${total}}$` },
        ],
        check: (key) => (key === 'silang' ? true : { toast: 'mnTertukar' }),
        hint: () => ({ text: `Coba komponen $x$ pada setiap pilihan. Pilihan kedua: $(${m} \\times ${B[0]} + ${n} \\times ${paren(A[0])}) : ${total}$.` }),
        summary: () => `$\\vec{p} = \\dfrac{${m}\\vec{b} + ${n}\\vec{a}}{${total}}$ — bobotnya **bersilang**.`,
      },
    ];
  }

  stepsMid(c) {
    const { A, B } = c;
    const sum = add(A, B);
    const M = sum.map((x) => S.divS(S.parseSurd(x), S.parseSurd(2)));
    const Mnum = numeric(M);
    const half = sub(Mnum, A);
    return [
      {
        kind: 'pick',
        label: 'Ketuk $M$',
        prompt: 'Titik tengah $M$ membagi $AB$ dengan perbandingan $1 : 1$. Ketuk letak $M$ di bidang.',
        check: (p) => (samePoint(p, Mnum) ? true : { toast: 'bukanTengah', values: { titik: tapped(p) } }),
        hint: () => ({ text: 'Titik tengah ada di **separuh jalan** dari $A$ ke $B$. Ikuti lompatan bayangannya.', show: () => ghostHops(this, A, half) }),
        summary: () => `Titik tengah: ${named('M', Mnum)}.`,
        onSolved: () => markPoint(this, 'M', Mnum),
      },
      this.vecStep({
        dim: 2,
        key: sum,
        prefix: 's',
        mode: 'integer',
        label: 'Hitung $\\vec{a} + \\vec{b}$',
        prompt: 'Buktikan dengan rumus $\\vec{m} = \\frac{\\vec{a} + \\vec{b}}{2}$. Hitung dulu $\\vec{a} + \\vec{b}$.',
        traps: [{ value: sub(B, A), result: { toast: 'bukanSelisih' } }],
        hint: () => ({ text: `$\\vec{a}$ dan $\\vec{b}$ adalah vektor posisi $A$ dan $B$. Jumlahkan: $${A[0]} + ${paren(B[0])}$ dan $${A[1]} + ${paren(B[1])}$.`, fields: 'wrong' }),
        summary: () => `$\\vec{a} + \\vec{b} = ${col(sum)}$`,
      }),
      this.vecStep({
        dim: 2,
        key: M,
        label: 'Koordinat $M$',
        prompt: 'Bagi dua. Tentukan koordinat $M$.',
        traps: [{ value: sum, result: { toast: 'belumDibagi' } }],
        hint: () => ({ text: `Bagi setiap komponen dengan $2$: $${sum[0]} : 2$ dan $${sum[1]} : 2$.`, fields: 'wrong' }),
        summary: () => `$\\vec{m} = \\frac{1}{2}${col(sum)} = ${col(M)}$ — cocok dengan ketukanmu.`,
      }),
    ];
  }

  stepsSpace(c) {
    const { A, B, m, n } = c;
    const total = m + n;
    const top = add(mul(m, B), mul(n, A));
    const swapped = add(mul(m, A), mul(n, B));
    const P = sectionPoint(c);
    return [
      {
        kind: 'choice',
        label: 'Bobot yang tepat',
        prompt: `$AP : PB = ${m} : ${n}$. Rumus $\\vec{p}$ yang tepat adalah…`,
        options: [
          { key: 'lurus', label: `$\\vec{p} = \\dfrac{${m}\\vec{a} + ${n}\\vec{b}}{${total}}$` },
          { key: 'silang', label: `$\\vec{p} = \\dfrac{${m}\\vec{b} + ${n}\\vec{a}}{${total}}$` },
          { key: 'tengah', label: '$\\vec{p} = \\dfrac{\\vec{a} + \\vec{b}}{2}$' },
        ],
        check: (key) => {
          if (key === 'silang') return true;
          if (key === 'lurus') return { toast: 'mnTertukar' };
          return { toast: 'bukanTitikTengah' };
        },
        hint: () => ({ text: `Bobotnya **bersilang**: bagian di dekat $A$ ($AP = ${m}$) menjadi bobot $\\vec{b}$, bagian di dekat $B$ ($PB = ${n}$) menjadi bobot $\\vec{a}$.` }),
        summary: () => `$\\vec{p} = \\dfrac{${m}\\vec{b} + ${n}\\vec{a}}{${total}}$`,
      },
      this.vecStep({
        dim: 3,
        key: top,
        prefix: 't',
        mode: 'integer',
        label: 'Hitung pembilang',
        prompt: `Hitung pembilangnya: $${m === 1 ? '' : m}\\vec{b} + ${n === 1 ? '' : n}\\vec{a}$.`,
        traps: [{ value: swapped, result: { toast: 'mnTertukar' } }],
        hint: () => ({ text: `Kalikan dulu, lalu jumlahkan yang seletak: $${B.map((b, i) => `${m} \\times ${paren(b)} + ${n} \\times ${paren(A[i])}`).join(', \\quad ')}$.`, fields: 'wrong' }),
        summary: () => `$${m === 1 ? '' : m}\\vec{b} + ${n === 1 ? '' : n}\\vec{a} = ${col(top)}$`,
      }),
      this.vecStep({
        dim: 3,
        key: P,
        label: 'Koordinat $P$',
        prompt: `Bagi dengan $${total}$. Tentukan koordinat $P$.`,
        traps: [{ value: top, result: { toast: 'belumDibagi' } }],
        hint: () => ({ text: `Bagi setiap komponen pembilang dengan $${total}$.`, fields: 'wrong' }),
        summary: () => `$P = ${texTuple(numeric(P))}$`,
      }),
    ];
  }

  stepsOuter(c) {
    const { A, B, m, n } = c;
    const P = sectionPoint(c);
    const Pnum = numeric(P);
    const swapped = A.map((a, i) => S.divS(S.parseSurd(m * a + n * B[i]), S.parseSurd(m + n)));
    const unsigned = A.map((a, i) => S.divS(S.parseSurd(m * B[i] + Math.abs(n) * a), S.parseSurd(m + Math.abs(n))));
    return [
      {
        kind: 'choice',
        label: 'Letak $P$',
        prompt: `$AP : PB = ${m} : (${n})$. Tanda negatif berarti $P$ berada di **luar** ruas $AB$. Di mana letak $P$?`,
        options: [
          { key: 'dalam', label: 'Di antara $A$ dan $B$' },
          { key: 'sebelumA', label: 'Di perpanjangan, sebelum $A$' },
          { key: 'setelahB', label: 'Di perpanjangan, sesudah $B$' },
        ],
        check: (key) => {
          if (key === 'setelahB') return true;
          if (key === 'dalam') return { toast: 'bukanDiDalam' };
          return { toast: 'letakLuar' };
        },
        hint: () => ({ text: `$AP$ (${m} bagian) lebih panjang daripada $PB$ (${Math.abs(n)} bagian). Jadi $P$ lebih jauh dari $A$ daripada $B$.` }),
        summary: () => '$P$ berada di perpanjangan ruas, sesudah $B$.',
      },
      this.vecStep({
        dim: 2,
        key: P,
        label: 'Koordinat $P$',
        prompt: `Rumusnya tetap sama: $\\vec{p} = \\dfrac{${m}\\vec{b} + (${n})\\vec{a}}{${m} + (${n})}$. Tentukan koordinat $P$.`,
        traps: [
          { value: swapped, result: { toast: 'mnTertukar' } },
          { value: unsigned, result: { toast: 'tandaNegatifHilang' } },
        ],
        hint: () => ({ text: `Penyebutnya $${m} + (${n}) = ${m + n}$. Komponen $x$: $(${m} \\times ${B[0]} - ${Math.abs(n)} \\times ${paren(A[0])}) : ${m + n}$.`, fields: 'wrong' }),
        summary: () => `$\\vec{p} = \\dfrac{${m}\\vec{b} - ${Math.abs(n) === 1 ? '' : Math.abs(n)}\\vec{a}}{${m + n}} = ${col(P)}$`,
      }),
      {
        kind: 'pick',
        label: 'Buktikan di bidang',
        prompt: 'Buktikan jawabanmu: ketuk titik $P$ pada bidang.',
        check: (p) => (samePoint(p, Pnum) ? true : { toast: 'titikMeleset', values: { titik: tapped(p) } }),
        hint: () => ({ text: `Ketuk titik yang koordinatnya baru saja kamu hitung, $P${texTuple(Pnum)}$.`, show: () => ghostCross(this, Pnum) }),
        summary: () => `$P${texTuple(Pnum)}$: $B$ tepat di tengah $AP$, jadi $AP = 2\\,PB$.`,
        onSolved: async () => {
          if (!this.plane) return;
          this.plane.drawSegment(B, Pnum, { dashed: true });
          markPoint(this, 'P', Pnum);
          await growArrow(this, A, Pnum, { name: 'AP', tone: 'cyan' });
        },
      },
    ];
  }
}

export const ENGINES = {
  triangle_guided: GuidedTriangleSim,
  parallelogram_guided: GuidedParallelogramSim,
  component_guided: GuidedComponentSim,
  scalar_guided: GuidedScalarSim,
  combo_guided: GuidedComboSim,
  equality_guided: GuidedEqualitySim,
  collinear_guided: GuidedCollinearSim,
  section_guided: GuidedSectionSim,
};
