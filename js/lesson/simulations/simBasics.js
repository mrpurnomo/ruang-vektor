/**
 * lesson/simulations/simBasics.js — Engine simulasi Bab 1: Konsep Dasar Vektor.
 *
 *   vector_anatomy     Bedah satu tanda panah
 *   component_builder  Susun vektor dari instruksi kalimat
 *   magnitude_builder  Bangun akar panjang vektor sendiri
 *   unit_vector        Buang panjang, sisakan arah
 *
 * Pola setiap engine: gambar DATA SOAL → langkah dengan pemeriksa yang
 * mengenali JENIS kesalahan → gambar HASIL hanya di `onSolved`.
 */

import { CaseSimulation, tex, texNum, texColumn, texTuple, same, givenBlock, mixed, AXES } from './simKit.js';
import * as S from '../../domain/surd.js';
import * as V from '../../domain/vector.js';
import * as Val from '../../domain/validator.js';
import { HOP_MS, ARROW_MS, DIRECTION, stillMotion, springPop, animateHops } from './guidedKit.js';

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

const is2D = (arr) => Array.isArray(arr) && arr.length === 2;

/* ============================================================
   1. vector_anatomy — Simulasi TERPANDU: dari bidang kosong ke vektor

   Materinya TIDAK dibaca lebih dulu; ia terbentuk di tangan siswa:
   ketuk titik asal → cari titik tujuan → lacak langkahnya → barulah
   panahnya DIGAMBAR siswa sendiri (ketuk pangkal, lalu ujung). Kasus
   berikutnya memindahkan tujuan ke kuadran lain, supaya tanda minus punya
   makna arah, bukan hafalan. Aplikasi tidak pernah menunjukkan letak
   titiknya lebih dulu; animasi lompatan per satuan baru diputar SESUDAH
   siswa menuliskan jumlah langkahnya dengan benar.
   ============================================================ */
export class GuidedVectorIntroSim extends CaseSimulation {
  usesPlane() {
    return true;
  }

  /** Bidang dipotong per kasus: titik tujuan selalu punya ruang napas 2 satuan. */
  planeOptions(c) {
    const [x, y] = c.to;
    const pad = 2;
    return {
      xRange: [Math.min(-pad, x - pad), Math.max(pad, x + pad)],
      yRange: [Math.min(-pad, y - pad), Math.max(pad, y + pad)],
    };
  }

  caseLabel(c) {
    // "Titik A", bukan "Vektor pertama": empat chip harus muat satu baris di
    // sidebar 190px (740×360); label dua kata membungkus dan mendorong chip
    // keempat ke baris kedua (terukur).
    return `Titik ${c.point}`;
  }

  /**
   * Kalimat `success` menceritakan $\vec{OA}$ lengkap dengan angkanya. Kasus
   * latihan memakai kalimat sendiri — tanpa itu siswa yang baru menuntaskan
   * $\vec{OD}$ di kuadran IV membaca "7 ke kanan, 4 ke atas" (terukur).
   */
  caseSuccessKey(c) {
    return c.guided ? 'success' : 'successLatihan';
  }

  /**
   * Kesimpulan kasus terpandu hidup di PANDUAN yang menempel, bukan di kolom
   * kerja: di 740×360 kolom kerja sudah tergulir ke bawah saat panah selesai,
   * dan blok "Inilah vektor…" di puncaknya tertutup panduan (terukur).
   */
  caseDonePrompt(c, allDone) {
    if (c.guided) {
      return `**Inilah vektor $\\overrightarrow{${c.name}}$**, boleh ditulis $\\vec{a}$: ia punya **nilai** — panjang perpindahannya — dan **arah**, dari $O$ menuju $${c.point}$.`;
    }
    return super.caseDonePrompt(c, allDone);
  }

  /** Selebrasi: kuadran yang benar-benar dijelajahi + rekap tiga gagasan inti. */
  celebration() {
    const base = super.celebration();
    const quadrant = ([x, y]) => (x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III'));
    const quadrants = new Set(this.cases.filter((c) => c.to[0] && c.to[1]).map((c) => quadrant(c.to)));
    const first = this.cases.find((c) => c.guided) || this.cases[0];
    return {
      ...base,
      badge: `${quadrants.size} Kuadran Dikuasai`,
      recap: [
        `Dari titik asal $O$ menuju titik tujuan $${first.point}$`,
        'Langkah **mendatar** dulu, lalu **tegak** — tandanya adalah arah',
        `$\\overrightarrow{${first.name}} = \\vec{a}$: punya **nilai** dan **arah**`,
      ],
    };
  }

  nextCaseInvite(next) {
    const lead = this.cases[this.caseIndex].guided ? 'Hebat! Sekarang coba kuasai' : 'Sekarang';
    return `${lead} **kuadran ${next.quadrant}** dengan **titik ${next.point}**.`;
  }

  setupCase(c) {
    this.marks = {};
    this.drawFrom = null;
    // Kasus terpandu TIDAK diberi catatan pembuka: perintahnya sudah berdiri
    // di panggung, dan catatan "bidang masih kosong" akan basi begitu titik
    // pertama muncul.
    if (!c.guided) {
      this.givenEl.appendChild(givenBlock(mixed(`Tujuan berikutnya: $${c.point}${texTuple(c.to)}$ — kuadran ${c.quadrant}.`)));
      // Titik asal sudah dikenal sejak kasus pertama. Di latihan ia langsung
      // hadir, karena panahnya nanti digambar siswa DARI titik ini.
      this.marks.O = this.drawPoint([0, 0], { label: 'O', essential: true });
    }
  }

  /** Titik pangkal yang sudah diketuk berdenyut menunggu ujungnya. */
  arm(key) {
    this.drawFrom = key;
    if (this.marks[key]) this.marks[key].el.classList.add('is-armed');
  }

  disarm() {
    if (this.drawFrom && this.marks && this.marks[this.drawFrom]) this.marks[this.drawFrom].el.classList.remove('is-armed');
    this.drawFrom = null;
  }

  /**
   * Pemeriksa DUA ketukan untuk menggambar panah. Ketukan pertama pada titik
   * yang sah hanya "dipersenjatai" (`pending`) — belum benar, belum salah,
   * karena urutannya baru diketahui di ketukan kedua.
   */
  checkDraw(p, c) {
    const at = (q) => p[0] === q[0] && p[1] === q[1];
    const hit = at([0, 0]) ? 'O' : at(c.to) ? c.point : null;
    if (!this.drawFrom) {
      if (!hit) return { toast: 'pangkalBukanTitik', values: { titik: this.tapped(p) } };
      this.arm(hit);
      return { pending: true };
    }
    // Mengetuk ulang pangkal yang sama: tetap menunggu ujungnya.
    if (hit === this.drawFrom) return { pending: true };
    const from = this.drawFrom;
    this.disarm();
    if (from === 'O' && hit === c.point) return true;
    if (from === c.point && hit === 'O') return { toast: 'arahPanahTerbalik', values: { nama: c.name, balik: `${c.point}O` } };
    return { toast: 'ujungBukanTitik', values: { titik: this.tapped(p) } };
  }

  /** Animasi langkah ala Manim (guidedKit) — diputar SESUDAH siswa menulis langkahnya. */
  async animateSteps(target, { hopMs }) {
    return animateHops(this, [0, 0], target, { hopMs });
  }

  /** Titik yang diketuk, apa adanya — dipakai kalimat umpan balik. */
  tapped(point) {
    return texTuple(point);
  }

  buildSteps(c) {
    const target = c.to;
    const [tx, ty] = target;
    const name = c.name;
    const label = c.point;

    const originStep = {
      kind: 'pick',
      label: 'Titik asal $O$',
      prompt: 'Perhatikan bidang kartesius ini. **Ketuk titik pusat koordinat $O(0,\\, 0)$** — tempat sumbu $X$ dan sumbu $Y$ berpotongan.',
      intro: 'Ketuk langsung pada **bidang koordinat** di sebelah kiri.',
      check: (p) => (p[0] === 0 && p[1] === 0)
        || { toast: 'pusatSalah', values: { titik: this.tapped(p) } },
      summary: () => '$O(0,\\, 0)$ ditandai.',
      onSolved: () => {
        this.marks.O = this.drawPoint([0, 0], { label: 'O', essential: true });
      },
    };

    const findStep = {
      kind: 'pick',
      label: `Titik ${label}`,
      prompt: c.guided
        ? `Sekarang ada titik tujuan $${label}(${tx},\\, ${ty})$. **Cari letaknya, lalu ketuk titiknya** — hitung kotak kisinya dari $O$.`
        : `Ketuk letak titik $${label}(${tx},\\, ${ty})$. Perhatikan tandanya sebelum menghitung kotak.`,
      intro: 'Ketuk langsung pada **bidang koordinat** di sebelah kiri.',
      check: (p) => {
        if (p[0] === tx && p[1] === ty) return true;
        if (p[0] === ty && p[1] === tx) return { toast: 'koordinatTertukar', values: { titik: this.tapped(p), x: tx, y: ty } };
        if (p[0] === -tx && p[1] === ty) return { toast: 'tandaKuadran', values: { sumbu: 'x', arah: tx < 0 ? 'kiri' : 'kanan' } };
        if (p[0] === tx && p[1] === -ty) return { toast: 'tandaKuadran', values: { sumbu: 'y', arah: ty < 0 ? 'bawah' : 'atas' } };
        // Tertukar SEBAGIAN: angka kedua dipakai mendatar, atau angka pertama
        // dipakai tegak. Bidang dipotong rapat di sekitar tujuan, jadi titik
        // tertukar utuhnya sering di LUAR bidang — siswa yang menuju (4, 7)
        // berhenti di tepi, mis. (4, 6). Tanpa cabang ini ia hanya mendengar
        // "meleset" dan tidak pernah tahu urutan angkanya yang terbalik.
        if ((p[0] === ty && ty !== tx) || (p[1] === tx && tx !== ty)) {
          return { toast: 'koordinatTertukar', values: { titik: this.tapped(p), x: tx, y: ty } };
        }
        return { toast: 'titikMeleset', values: { titik: this.tapped(p) } };
      },
      summary: () => `$${label}${texTuple(target)}$ ditandai.`,
      onSolved: () => {
        this.marks[label] = this.drawPoint(target, { label, essential: true });
        // Garis proyeksi putus-putus: menautkan titik ke kedua sumbunya,
        // supaya "7 ke kanan, 4 ke atas" terbaca dari gambar.
        if (tx !== 0) this.plane.drawSegment([tx, 0], target, { dashed: true });
        if (ty !== 0) this.plane.drawSegment([0, ty], target, { dashed: true });
      },
    };

    const traceStep = {
      kind: 'fields',
      label: 'Lacak langkahnya',
      prompt: c.guided
        ? `Kamu berada di $O$ dan ingin sampai ke $${label}$. **Berapa satuan mendatar, lalu berapa satuan tegak?** Ke kanan dan ke atas bernilai positif.`
        : `Tulis langkah dari $O$ ke $${label}$: berapa satuan mendatar, berapa satuan tegak — **lengkap dengan tandanya**.`,
      fields: [
        { key: 'dx', label: 'Mendatar', mode: 'integer', aria: 'Langkah mendatar' },
        { key: 'dy', label: 'Tegak', mode: 'integer', aria: 'Langkah tegak' },
      ],
      check: (v) => {
        const s = [v.dx.value, v.dy.value];
        const i = firstWrong(s, target);
        if (i < 0) return true;
        const key = ['dx', 'dy'][i];
        const wrong = [key];
        if (same(s[i], -target[i])) {
          return {
            toast: 'langkahSalahTanda',
            values: { sumbu: i === 0 ? 'mendatar' : 'tegak', arah: DIRECTION[AXES[i]](target[i]) },
            wrong,
          };
        }
        return { toast: 'langkahSalahBesar', values: { sumbu: i === 0 ? 'mendatar' : 'tegak' }, wrong };
      },
      summary: () => `Langkah: $${tx}$ ${DIRECTION.x(tx)}, $${ty}$ ${DIRECTION.y(ty)}.`,
      // Jejak langkah digambar SESUDAH siswa menghitungnya sendiri.
      onSolved: () => this.animateSteps(target, { hopMs: HOP_MS }),
    };

    // Vektor adalah TINDAKAN, bukan tebakan: panahnya digambar dengan dua
    // ketukan — pangkal, lalu ujung. Urutan terbalik ditolak dengan nama
    // vektor yang sebenarnya digambar siswa (AO, bukan OA).
    const drawStep = {
      kind: 'pick',
      label: 'Gambar panahnya',
      prompt: c.guided
        ? `Sekarang **gambar vektor $\\overrightarrow{${name}}$**! Ketuk titik **pangkalnya**, lalu ketuk titik **ujungnya**.`
        : `Gambar $\\overrightarrow{${name}}$: ketuk **pangkalnya**, lalu **ujungnya**.`,
      intro: 'Ketuk dua titik di bidang: **pangkal** dulu, baru **ujung**.',
      onEnter: () => this.disarm(),
      onLeave: () => this.disarm(),
      check: (p) => this.checkDraw(p, c),
      summary: () => (c.guided
        ? `$\\overrightarrow{${name}} = \\vec{a} = ${texTuple(target)}$`
        : `$\\overrightarrow{${name}} = ${texTuple(target)}$`),
      onSolved: async () => {
        const arrow = this.drawVector({
          to: [0, 0],
          name,
          tone: 'blue',
          // Nama dua huruf = \overrightarrow, sama dengan label bawaan bidang.
          label: c.guided ? `\\overrightarrow{${name}} = \\vec{a}` : undefined,
        }, { essential: true });
        await arrow.setVector({ to: target }, { animate: !stillMotion(), duration: ARROW_MS });
        if (arrow.labelEl) springPop(arrow.labelEl.firstChild.firstChild);
      },
    };

    return c.guided
      ? [originStep, findStep, traceStep, drawStep]
      : [findStep, traceStep, drawStep];
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
  vector_anatomy: GuidedVectorIntroSim,
  component_builder: ComponentBuilderSim,
  magnitude_builder: MagnitudeBuilderSim,
  unit_vector: UnitVectorSim,
};
