/**
 * lesson/simulations/simBasics.js — Engine simulasi Bab 1, sub-topik 1.
 *
 *   vector_anatomy     Membentuk vektor pertama dari bidang kosong
 *
 * Sub-topik 2–6 hidup di simGuided.js dan memakai pola yang sama (perkakas
 * bersama di guidedKit.js). Pola setiap engine: gambar DATA SOAL → langkah
 * dengan pemeriksa yang mengenali JENIS kesalahan → gambar HASIL hanya di
 * `onSolved`.
 */

import { CaseSimulation, texTuple, same, givenBlock, mixed, AXES } from './simKit.js';
import { HOP_MS, ARROW_MS, DIRECTION, stillMotion, springPop, animateHops, firstWrong } from './guidedKit.js';

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

export const ENGINES = {
  vector_anatomy: GuidedVectorIntroSim,
};
