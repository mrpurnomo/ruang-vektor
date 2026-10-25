/**
 * lesson/simulations/simGuided.js — Simulasi TERPANDU Bab 1, sub-topik 2–6.
 *
 * Revisi guru: kelima sub-topik ditulis ulang mengikuti "gold standard"
 * sub-topik 1 (GuidedVectorIntroSim di simBasics.js). Pola yang sama di
 * setiap engine:
 *
 *   - Materi TIDAK dibaca lebih dulu; ia terbentuk di tangan siswa:
 *     ketuk, hitung, gambar sendiri. Kasus pertama terpandu, sisanya latihan.
 *   - Pemeriksa mengenali JENIS kesalahan dan menjelaskannya tanpa
 *     membocorkan kunci (aksioma).
 *   - Gambar hasil (lompatan, panah, persegi, balok) HANYA di `onSolved`.
 *   - Tempo animasi konstan (guidedKit), label dirapikan declutter().
 *
 *   notation_guided   Satu vektor dalam tiga bentuk penulisan (kolom · basis · pasangan)
 *   position_guided   Vektor posisi & menemukan "ujung − pangkal"
 *   magnitude_guided  Panjang vektor dari persegi Pythagoras
 *   unit_guided       Vektor satuan di lingkaran satuan
 *   space_guided      Drone di ruang 3D yang bisa diputar
 */

import { CaseSimulation, tex, texColumn, texTuple, same, givenBlock, mixed, AXES } from './simKit.js';
import { el } from './simCore.js';
import * as S from '../../domain/surd.js';
import * as V from '../../domain/vector.js';
import * as Val from '../../domain/validator.js';
import toast from '../../core/ui/toast.js';
import sfx from '../../core/ui/sfx.js';
import {
  HOP_MS, ARROW_MS, DIRECTION, stillMotion, springPop, animateHops, createArrowDrawer,
  tapped, samePoint, componentFields, componentValues, firstWrong, wrongKeys,
  ghostHops, ghostCross, pulsePoint, ghostRoute3d,
} from './guidedKit.js';

/* ============================================================
   2. notation_guided — Satu vektor dapat ditulis dalam tiga bentuk

   Kasus 1 (terpandu): perintah "4 satuan ke kanan, 3 satuan ke bawah" →
   siswa mengetuk ujungnya → lompatan + panah → menulis bentuk kolom →
   bentuk basis (panah satuan î dan ĵ digambar sesudah benar) → memilih
   pasangan berurutan. Kotak "tiga bentuk penulisan" terisi dari jawaban
   siswa. Kasus 2 (LKPD): vektor yang sama digambar dari pangkal P(2, −4)
   → vektor boleh digambar dari pangkal mana saja. Kasus 3: bentuk baku.
   ============================================================ */
const BASIS = ['i', 'j', 'k'];

/** "−3î + 4ĵ" dari komponen (bentuk baku: nol dibuang, koefisien 1 tanpa angka). */
function basisTex(v) {
  const parts = [];
  v.forEach((n, i) => {
    if (n === 0) return;
    const coef = Math.abs(n) === 1 ? '' : String(Math.abs(n));
    const sign = n < 0 ? '-' : (parts.length ? '+' : '');
    parts.push(`${sign} ${coef}\\hat{${BASIS[i]}}`);
  });
  return parts.length ? parts.join(' ').trim() : '\\vec{0}';
}

/** Kotak "tiga bentuk penulisan": kolom · basis · pasangan, terisi sesudah benar. */
function notationForms() {
  const root = el('div', 'notation-shelf');
  const slots = {};
  [['kolom', 'Vektor kolom'], ['basis', 'Vektor basis'], ['pasangan', 'Pasangan berurutan']].forEach(([key, title]) => {
    const slot = el('div', 'notation-shelf__slot');
    slot.innerHTML = `<span class="notation-shelf__title">${mixed(title)}</span><span class="notation-shelf__value">?</span>`;
    root.appendChild(slot);
    slots[key] = slot;
  });
  return {
    root,
    fill(key, latex) {
      const slot = slots[key];
      slot.classList.add('is-filled');
      slot.querySelector('.notation-shelf__value').innerHTML = tex(latex);
      springPop(slot.querySelector('.notation-shelf__value'));
    },
  };
}

export class GuidedNotationSim extends CaseSimulation {
  usesPlane() {
    return true;
  }

  planeOptions(c) {
    const pts = [[0, 0], c.v];
    if (c.start) pts.push(c.start, c.start.map((n, i) => n + c.v[i]));
    if (c.w) pts.push(c.w);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    return {
      xRange: [Math.min(...xs) - 2, Math.max(...xs) + 2],
      yRange: [Math.min(...ys) - 1, Math.max(...ys) + 2],
    };
  }

  caseLabel(c) {
    return { build: 'Tiga bentuk', shift: 'Pangkal P', tidy: 'Bentuk baku' }[c.kind];
  }

  caseSuccessKey(c) {
    return { build: 'success', shift: 'successBebas', tidy: 'successBaku' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'build') {
      return 'Jadi **satu vektor dapat ditulis dalam tiga bentuk** (lihat kotak di lembar kerja), dan ketiganya menunjuk panah yang **sama**.';
    }
    if (c.kind === 'shift') {
      return 'Panah dari $O$ dan panah dari $P$ punya langkah yang sama, jadi keduanya vektor yang **sama**. Vektor boleh digambar dari pangkal mana saja.';
    }
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'shift') return 'Bagus! Sekarang kita gambar vektor yang **tidak** berangkat dari $O$.';
    return 'Terakhir, kita pelajari cara menulis yang **baku**.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: '3 Bentuk Penulisan Dikuasai',
      recap: [
        'Satu vektor dapat ditulis sebagai **vektor kolom**, **vektor basis** $\\hat{i},\\, \\hat{j}$, atau **pasangan berurutan**',
        'Komponen **pertama** adalah langkah mendatar ($x$, $\\hat{i}$), komponen **kedua** langkah tegak ($y$, $\\hat{j}$)',
        'Vektor boleh digambar dari pangkal mana saja asal langkahnya sama',
      ],
    };
  }

  setupCase(c) {
    this.ghostFromO = null;
    this.marks = { O: this.drawPoint([0, 0], { label: 'O', essential: true }) };
    if (c.kind === 'build') {
      // Perintahnya sudah ada di panduan; kolom kerja cukup memuat kotak
      // tiga bentuk penulisan (di 740×360 blok perintah mendorong isian ke
      // bawah layar).
      this.forms = notationForms();
      this.givenEl.appendChild(this.forms.root);
    } else if (c.kind === 'shift') {
      this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${basisTex(c.v)} \\qquad P${texTuple(c.start)}`), 'sim-given--display'));
      this.marks.P = this.drawPoint(c.start, { label: `P${texTuple(c.start)}`, essential: true });
    } else {
      this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${basisTex(c.v)} \\qquad \\vec{w} = ${texTuple(c.w)}`), 'sim-given--display'));
    }
  }

  /** Pemeriksa ketukan ujung: `from` + `v` = sasaran; kesalahan dikenali jenisnya. */
  checkTip(p, from, v, { fromOrigin = false } = {}) {
    const target = [from[0] + v[0], from[1] + v[1]];
    if (samePoint(p, target)) return true;
    const rel = [p[0] - from[0], p[1] - from[1]];
    if (fromOrigin && samePoint(p, v)) return { toast: 'dariO' };
    if (rel[0] === v[0] && rel[1] === -v[1] && v[1] !== 0) return { toast: 'arahTegakTerbalik', values: { arah: DIRECTION.y(v[1]) } };
    if (rel[0] === -v[0] && rel[1] === v[1] && v[0] !== 0) return { toast: 'arahMendatarTerbalik', values: { arah: DIRECTION.x(v[0]) } };
    if ((rel[0] === v[1] || rel[1] === v[0]) && v[0] !== v[1]) return { toast: 'urutanTertukar', values: { titik: tapped(p) } };
    return { toast: 'ujungMeleset', values: { titik: tapped(p) } };
  }

  /** Pemeriksa isian kolom (atau pasangan komponen) dari bentuk lain. */
  checkColumn(values, v, { fromBasis = false } = {}) {
    const s = componentValues(values, 2);
    if (firstWrong(s, v) < 0) return true;
    const wrong = wrongKeys(s, v);
    const i = firstWrong(s, v);
    const student = S.toNumber(s[i]);
    if (fromBasis && Math.abs(v[i]) === 1 && student === 0) return { toast: 'koefisienSatu', values: { basis: BASIS[i] }, wrong };
    if (firstWrong(s, [v[1], v[0]]) < 0 && v[0] !== v[1]) return { toast: 'kolomTertukar', wrong };
    if (student === -v[i]) return { toast: 'kolomSalahTanda', values: { sumbu: AXES[i] }, wrong };
    return { toast: 'kolomSalah', values: { sumbu: AXES[i] }, wrong };
  }

  /** Panah satuan: |x| buah î mendatar, lalu |y| buah ĵ tegak. */
  async drawBasisTiles(v, from = [0, 0]) {
    const [x, y] = v;
    const sx = Math.sign(x);
    const sy = Math.sign(y);
    const delay = stillMotion() ? 0 : HOP_MS;
    for (let k = 0; k < Math.abs(x); k += 1) {
      const a = [from[0] + sx * k, from[1]];
      this.drawVector({ from: a, to: [a[0] + sx, a[1]], name: `i${k}`, tone: 'cyan', label: k === 0 ? (sx > 0 ? '\\hat{i}' : '-\\hat{i}') : null });
      await this.wait(delay);
    }
    for (let k = 0; k < Math.abs(y); k += 1) {
      const a = [from[0] + x, from[1] + sy * k];
      this.drawVector({ from: a, to: [a[0], a[1] + sy], name: `j${k}`, tone: 'cyan', label: k === 0 ? (sy > 0 ? '\\hat{j}' : '-\\hat{j}') : null });
      await this.wait(delay);
    }
  }

  async drawResult(from, v, name) {
    const arrow = this.drawVector({ from, to: from, name, tone: 'blue' }, { essential: true });
    await arrow.setVector({ from, to: [from[0] + v[0], from[1] + v[1]] }, { animate: !stillMotion(), duration: ARROW_MS });
    if (arrow.labelEl) springPop(arrow.labelEl.firstChild.firstChild);
    return arrow;
  }

  columnFields() {
    return [
      { key: 'cx', label: '$x$', mode: 'integer', aria: 'Komponen x' },
      { key: 'cy', label: '$y$', mode: 'integer', aria: 'Komponen y' },
    ];
  }

  /** Petunjuk isian komponen: lompatan bayangan + kotak yang salah disorot. */
  componentHint(from, v, text) {
    return () => ({ text, show: () => ghostHops(this, from, v), fields: 'wrong' });
  }

  buildSteps(c) {
    if (c.kind === 'build') return this.buildSteps1(c);
    if (c.kind === 'shift') return this.buildSteps2(c);
    return this.buildSteps3(c);
  }

  buildSteps1(c) {
    const v = c.v;
    return [
      {
        kind: 'pick',
        label: 'Ketuk ujungnya',
        prompt: `Perhatikan perintah ini: vektor $\\vec{a}$ berangkat dari $O$, lalu bergerak **${c.say}**. Coba ketuk titik **ujungnya**.`,
        intro: 'Hitung kotak kisinya dari $O$: **mendatar** dulu, baru **tegak**.',
        check: (p) => this.checkTip(p, [0, 0], v),
        hint: () => ({
          text: 'Ikuti lompatan bayangan dari $O$: setiap lompatan satu kotak. Ujungnya ada di lompatan terakhir.',
          show: () => ghostHops(this, [0, 0], v),
        }),
        summary: () => `Ujung $\\vec{a}$ di $${texTuple(v)}$.`,
        onSolved: async () => {
          this.drawPoint(v, { ghost: true });
          await animateHops(this, [0, 0], v);
          await this.drawResult([0, 0], v, 'a');
        },
      },
      {
        kind: 'fields',
        label: 'Bentuk kolom',
        prompt: 'Tepat! Sekarang tulis $\\vec{a}$ sebagai **vektor kolom**.',
        intro: 'Langkah **mendatar** di baris atas, langkah **tegak** di baris bawah — lengkap dengan tandanya: ke kanan dan ke atas positif, ke kiri dan ke bawah negatif.',
        fieldsLayout: 'column',
        fields: this.columnFields(),
        check: (values) => this.checkColumn(values, v),
        hint: this.componentHint([0, 0], v, 'Hitung lompatan mendatar untuk baris atas, lalu lompatan tegak untuk baris bawah. Lompatan ke **bawah** ditulis dengan tanda **minus**.'),
        summary: () => `Bentuk kolom: $\\vec{a} = ${texColumn(v)}$`,
        onSolved: () => this.forms.fill('kolom', texColumn(v)),
      },
      {
        kind: 'fields',
        label: 'Bentuk basis',
        prompt: 'Bentuk kedua memakai **vektor basis**. Berapa banyak $\\hat{i}$ dan $\\hat{j}$ pada $\\vec{a}$?',
        intro: '$\\hat{i}$ adalah satu langkah searah sumbu $X$, dan $\\hat{j}$ satu langkah searah sumbu $Y$.',
        fields: [
          { key: 'cx', label: null, suffix: '$\\hat{i}\\;+$', mode: 'integer', aria: 'Koefisien i' },
          { key: 'cy', label: null, suffix: '$\\hat{j}$', mode: 'integer', aria: 'Koefisien j' },
        ],
        check: (values) => this.checkColumn(values, v),
        hint: () => ({ text: 'Angkanya sama dengan bentuk kolom yang baru kamu tulis: baris atas untuk $\\hat{i}$, baris bawah untuk $\\hat{j}$.', fields: 'wrong' }),
        summary: () => `Bentuk basis: $\\vec{a} = ${basisTex(v)}$`,
        onSolved: async () => {
          await this.drawBasisTiles(v);
          this.forms.fill('basis', basisTex(v));
        },
      },
      {
        kind: 'choice',
        label: 'Pasangan berurutan',
        prompt: 'Lihat gambarnya: $\\vec{a}$ tersusun dari panah-panah satuan $\\hat{i}$ dan $\\hat{j}$. Bentuk ketiga adalah **pasangan berurutan**. Pilih penulisan yang tepat untuk $\\vec{a}$.',
        options: [
          { key: 'swap', label: `$${texTuple([v[1], v[0]])}$` },
          { key: 'ok', label: `$${texTuple(v)}$` },
          { key: 'sign', label: `$${texTuple([v[0], -v[1]])}$` },
          { key: 'letters', label: `$(${v[0]}\\hat{i},\\, ${v[1]}\\hat{j})$` },
        ],
        check: (key) => {
          if (key === 'ok') return true;
          if (key === 'swap') return { toast: 'pasanganTertukar' };
          if (key === 'sign') return { toast: 'pasanganTanda' };
          return { toast: 'pasanganBerhuruf' };
        },
        hint: () => ({ text: 'Urutannya sama dengan bentuk kolom: angka mendatar dulu, lalu angka tegak — hanya bilangan, tanpa huruf $\\hat{i}$ dan $\\hat{j}$.' }),
        summary: () => `Pasangan berurutan: $\\vec{a} = ${texTuple(v)}$`,
        onSolved: () => {
          this.forms.fill('pasangan', texTuple(v));
          this.plane.highlight('a');
        },
      },
    ];
  }

  buildSteps2(c) {
    const { v, start } = c;
    const end = [start[0] + v[0], start[1] + v[1]];
    return [
      {
        kind: 'fields',
        label: 'Bentuk kolom',
        prompt: `Diketahui $\\vec{v} = ${basisTex(v)}$. Tulis dulu sebagai **vektor kolom**.`,
        fieldsLayout: 'column',
        fields: this.columnFields(),
        check: (values) => this.checkColumn(values, v, { fromBasis: true }),
        hint: () => ({ text: 'Koefisien $\\hat{i}$ masuk baris atas, koefisien $\\hat{j}$ masuk baris bawah. Huruf basis tanpa angka berarti **1**.', fields: 'wrong' }),
        summary: () => `$\\vec{v} = ${texColumn(v)}$`,
      },
      {
        kind: 'pick',
        label: 'Gambar dari $P$',
        prompt: `Sekarang gambar $\\vec{v}$ dengan **pangkal di $P${texTuple(start)}$**, bukan di $O$. Coba ketuk titik **ujungnya**.`,
        intro: 'Mulai menghitung kotak dari **$P$**: mendatar dulu, baru tegak.',
        check: (p) => this.checkTip(p, start, v, { fromOrigin: true }),
        hint: () => ({
          text: 'Ikuti lompatan bayangan yang berangkat dari **$P$**, bukan dari $O$.',
          show: () => ghostHops(this, start, v),
        }),
        summary: () => `Dari $P$, ujung $\\vec{v}$ berada di $${texTuple(end)}$.`,
        onSolved: async () => {
          this.drawPoint(end, { ghost: true });
          await animateHops(this, start, v);
          await this.drawResult(start, v, 'v');
        },
      },
      {
        kind: 'choice',
        label: 'Bandingkan',
        prompt: 'Panah yang sama kini juga digambar **dari $O$** (biru muda). Apa hubungan panah dari $O$ dan panah dari $P$?',
        onEnter: () => {
          if (this.ghostFromO) return;
          this.ghostFromO = this.drawVector({ from: [0, 0], to: v, name: 'vO', tone: 'cyan', label: '\\vec{v}' });
        },
        options: [
          { key: 'beda', label: 'Dua vektor **berbeda**, karena pangkalnya berbeda' },
          { key: 'sama', label: 'Vektor yang **sama**: langkah, panjang, dan arahnya sama' },
          { key: 'lawan', label: 'Vektor yang saling **berlawanan**' },
        ],
        check: (key) => {
          if (key === 'sama') return true;
          if (key === 'beda') return { toast: 'vektorBebas' };
          return { toast: 'bukanLawan' };
        },
        hint: () => ({ text: 'Bandingkan langkah kedua panah: berapa kotak mendatar dan berapa kotak tegak? Apakah arahnya sama?' }),
        summary: () => 'Vektor boleh digambar dari pangkal mana saja.',
        onSolved: () => {
          this.plane.highlight('v');
          this.plane.highlight('vO');
        },
      },
    ];
  }

  buildSteps3(c) {
    const { v, w } = c;
    return [
      {
        kind: 'fields',
        label: 'Kolom $\\vec{v}$',
        prompt: `Tulis $\\vec{v} = ${basisTex(v)}$ sebagai **vektor kolom**. Perhatikan suku yang **tidak** memakai angka.`,
        fieldsLayout: 'column',
        fields: this.columnFields(),
        check: (values) => this.checkColumn(values, v, { fromBasis: true }),
        hint: () => ({ text: '$\\hat{j}$ tanpa angka di depannya artinya $1\\hat{j}$ — satu langkah ke atas, bukan nol.', fields: 'wrong' }),
        summary: () => `$\\vec{v} = ${texColumn(v)}$`,
        onSolved: () => this.drawResult([0, 0], v, 'v'),
      },
      {
        kind: 'choice',
        label: 'Basis baku $\\vec{w}$',
        prompt: `Sekarang tulis $\\vec{w} = ${texTuple(w)}$ dalam **bentuk basis yang baku**, yaitu bentuk paling ringkas tanpa mengubah nilainya.`,
        options: [
          { key: 'nol', label: `$${w[0]}\\hat{i} + 0\\hat{j}$` },
          { key: 'ok', label: `$${basisTex(w)}$` },
          { key: 'sumbu', label: `$${w[0]}\\hat{j}$` },
          { key: 'skalar', label: `$${w[0]}$` },
        ],
        check: (key) => {
          if (key === 'ok') return true;
          if (key === 'nol') return { toast: 'belumBaku' };
          if (key === 'sumbu') return { toast: 'basisSumbuSalah' };
          return { toast: 'kehilanganArah' };
        },
        hint: () => ({ text: 'Dalam bentuk basis, suku yang bernilai **nol** tidak perlu ditulis. Tetapi huruf basisnya harus tetap ada.' }),
        summary: () => `$\\vec{w} = ${basisTex(w)}$`,
        onSolved: () => this.drawResult([0, 0], w, 'w'),
      },
      {
        kind: 'choice',
        label: 'Kolom $\\vec{w}$',
        prompt: 'Lalu dalam bentuk **kolom**, $\\vec{w}$ ditulis…',
        options: [
          { key: 'satu', label: `$\\begin{pmatrix} ${w[0]} \\end{pmatrix}$` },
          { key: 'balik', label: `$${texColumn([w[1], w[0]])}$` },
          { key: 'ok', label: `$${texColumn(w)}$` },
        ],
        check: (key) => {
          if (key === 'ok') return true;
          if (key === 'satu') return { toast: 'nolWajib' };
          return { toast: 'kolomTertukar' };
        },
        hint: () => ({ text: 'Bentuk kolom selalu punya **dua baris** di bidang: $x$ di atas, $y$ di bawah — angka $0$ tetap ditulis.' }),
        summary: () => `$\\vec{w} = ${texColumn(w)}$ — angka $0$ tetap ditulis.`,
      },
    ];
  }
}

/* ============================================================
   3. position_guided — Vektor posisi & rumus "ujung dikurangi pangkal"

   Kasus 1 (terpandu): tandai kelas A dan kantin B di denah → gambar
   vektor posisi a = OA → gambar AB → hitung sendiri langkahnya di kisi
   → lengkapi pola "6 = 8 − 2" → siswa menemukan AB = B − A sendiri.
   Revisi guru: fokus ke AB (tanpa panah O→B), setiap titik berlabel
   koordinat dan nama tempatnya.
   Kasus 2: hitung dulu dengan rumus, buktikan di kisi (LKPD 5) + vektor
   lawan. Kasus 3: koordinat ratusan tanpa kisi. Kasus 4: rumus dibalik
   untuk mencari titik pangkal R (LKPD 6).
   ============================================================ */
const pointName = (name, p) => `$${name}${texTuple(p)}$`;

export class GuidedPositionSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind !== 'nogrid';
  }

  planeOptions(c) {
    const pts = [[0, 0]];
    if (c.kind === 'discover') pts.push(c.A, c.B);
    if (c.kind === 'formula') pts.push(c.P, c.Q);
    if (c.kind === 'origin') pts.push(c.S, c.S.map((n, i) => n - c.RS[i]));
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    return {
      xRange: [Math.min(...xs) - 2, Math.max(...xs) + 3],
      yRange: [Math.min(...ys) - 1, Math.max(...ys) + 2],
    };
  }

  caseLabel(c) {
    return { discover: 'Denah', formula: '$\\overrightarrow{PQ}$', nogrid: 'Tanpa kisi', origin: 'Titik $R$' }[c.kind];
  }

  caseSuccessKey(c) {
    return { discover: 'success', formula: 'successRumus', nogrid: 'successBesar', origin: 'successPangkal' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'discover') {
      return 'Kamu menemukan rumusnya sendiri: $\\overrightarrow{AB} = B - A$, yaitu koordinat **ujung** dikurangi koordinat **pangkal**.';
    }
    if (c.kind === 'nogrid') {
      return 'Tanpa kertas berpetak pun bisa: **ujung − pangkal** untuk mencari vektor, dan **pangkal + vektor** untuk mencari titik ujung.';
    }
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'formula') return 'Bagus! Sekarang kita **hitung dulu** dengan rumus tadi, lalu buktikan di kisi.';
    if (next.kind === 'nogrid') return 'Bagaimana kalau koordinatnya **ratusan**? Kertas berpetak tidak cukup lagi.';
    return 'Terakhir, kita pakai rumusnya untuk mencari **titik pangkal**.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Rumus Ujung − Pangkal Ditemukan',
      recap: [
        '**Vektor posisi** titik $A$ adalah $\\vec{a} = \\overrightarrow{OA}$, pangkalnya di $O$',
        '$\\overrightarrow{AB} = B - A$: koordinat **ujung** dikurangi koordinat **pangkal**',
        'Titik ujung $= A + \\overrightarrow{AB}$, titik pangkal $= B - \\overrightarrow{AB}$',
      ],
    };
  }

  /** Titik berlabel "A(2, 3)" + nama tempat di bawahnya (bila ada). */
  markPoint(name, p, place = null) {
    this.marks[name] = this.drawPoint(p, { label: `${name}${texTuple(p)}`, essential: true });
    if (place && this.plane) this.plane.drawTag(p, `\\text{${place}}`, { offset: [0, 22], tone: 'muted' });
    return this.marks[name];
  }

  setupCase(c) {
    this.marks = {};
    this.posA = null;
    if (this.plane) {
      this.marks.O = this.drawPoint([0, 0], { label: 'O', essential: true });
      if (c.kind === 'discover') this.plane.drawTag([0, 0], '\\text{Gerbang}', { offset: [-36, 18], tone: 'muted' });
    }
    if (c.kind === 'discover') {
      this.givenEl.appendChild(givenBlock(mixed(`Denah sekolah: gerbang $O(0,\\, 0)$, kelas ${pointName('A', c.A)}, kantin ${pointName('B', c.B)}.`)));
    } else if (c.kind === 'formula') {
      this.givenEl.appendChild(givenBlock(tex(`P${texTuple(c.P)} \\qquad Q${texTuple(c.Q)}`), 'sim-given--display'));
      this.markPoint('P', c.P);
      this.markPoint('Q', c.Q);
    } else if (c.kind === 'nogrid') {
      this.givenEl.appendChild(givenBlock(tex(`K${texTuple(c.K)} \\qquad L${texTuple(c.L)}`), 'sim-given--display'));
      this.givenEl.appendChild(givenBlock('Koordinat sebesar ini tidak muat di kertas berpetak, jadi kita hitung dengan rumus.', 'sim-given--muted'));
    } else {
      this.givenEl.appendChild(givenBlock(tex(`\\overrightarrow{RS} = ${texColumn(c.RS)} \\qquad S${texTuple(c.S)}`), 'sim-given--display'));
      this.markPoint('S', c.S);
    }
  }

  /** Ketuk letak titik bernama; kesalahan "tertukar" dikenali. */
  pickPoint(name, target, place, prompt) {
    return {
      kind: 'pick',
      label: `Titik $${name}$`,
      prompt,
      check: (p) => {
        if (samePoint(p, target)) return true;
        if (samePoint(p, [target[1], target[0]])) return { toast: 'koordinatTertukar', values: { titik: tapped(p) } };
        return { toast: 'titikMeleset', values: { titik: tapped(p) } };
      },
      hint: () => ({
        text: `Dari $O$, hitung $${target[0]}$ kotak **mendatar**, lalu $${target[1]}$ kotak **tegak**. Garis putus-putus menunjukkan di mana keduanya bertemu.`,
        show: () => ghostCross(this, target),
      }),
      summary: () => `${pointName(name, target)} — ${place} — ditandai.`,
      onSolved: () => this.markPoint(name, target, place),
    };
  }

  /** Gambar panah dua ketukan dari titik bernama `from` ke `to`. */
  drawStep(from, to, { label, prompt, summary, tone = 'blue', points, after }) {
    const drawer = createArrowDrawer(this, { points, marks: () => this.marks, from, to, name: `${from}${to}` });
    return {
      kind: 'pick',
      label,
      prompt,
      intro: 'Ketuk dua titik di bidang: **pangkal** dulu, baru **ujung**.',
      onEnter: () => drawer.disarm(),
      onLeave: () => drawer.disarm(),
      check: (p) => drawer.check(p),
      hint: () => ({
        text: `Huruf **pertama** pada nama $\\overrightarrow{${from}${to}}$ adalah pangkal. Ketuk titik $${from}$ dulu (berdenyut), lalu titik $${to}$.`,
        show: () => pulsePoint(this, points()[from]),
      }),
      summary,
      onSolved: async () => {
        const P = points()[from];
        const Q = points()[to];
        const name = from === 'O' ? to.toLowerCase() : `${from}${to}`;
        const arrow = this.drawVector({ from: P, to: P, name, tone }, { essential: true });
        await arrow.setVector({ from: P, to: Q }, { animate: !stillMotion(), duration: ARROW_MS });
        if (arrow.labelEl) springPop(arrow.labelEl.firstChild.firstChild);
        if (after) await after(arrow);
      },
    };
  }

  /** Isian "ujung − pangkal" dengan pengenal kesalahan khas. */
  differenceStep(start, end, P, Q, { label, prompt }) {
    const key = Q.map((q, i) => q - P[i]);
    return {
      kind: 'fields',
      label,
      prompt,
      fields: componentFields(2),
      check: (values) => {
        const s = componentValues(values, 2);
        if (firstWrong(s, key) < 0) return true;
        const wrong = wrongKeys(s, key);
        if (firstWrong(s, key.map((n) => -n)) < 0) return { toast: 'tandaTerbalik', values: { nama: `${start}${end}`, kebalikan: `${end}${start}` }, wrong };
        if (same(s[0], Q[0] - P[1]) || same(s[1], Q[1] - P[0])) return { toast: 'komponenTidakSeletak', wrong };
        return { toast: 'hasilSalah', wrong };
      },
      hint: () => ({
        text: `Tulis seperti ini: $x = ${Q[0] < 0 ? `(${Q[0]})` : Q[0]} - ${P[0] < 0 ? `(${P[0]})` : P[0]}$ dan $y = ${Q[1] < 0 ? `(${Q[1]})` : Q[1]} - ${P[1] < 0 ? `(${P[1]})` : P[1]}$ — koordinat $${end}$ dikurangi koordinat $${start}$. Ingat: mengurangi bilangan negatif sama dengan menambah.`,
        fields: 'wrong',
      }),
      summary: () => `$\\overrightarrow{${start}${end}} = ${end} - ${start} = ${texColumn(key)}$`,
    };
  }

  buildSteps(c) {
    if (c.kind === 'discover') return this.stepsDiscover(c);
    if (c.kind === 'formula') return this.stepsFormula(c);
    if (c.kind === 'nogrid') return this.stepsNoGrid(c);
    return this.stepsOrigin(c);
  }

  stepsDiscover(c) {
    const { A, B } = c;
    const key = [B[0] - A[0], B[1] - A[1]];
    const points = () => ({ O: [0, 0], A, B });
    return [
      this.pickPoint('A', A, 'Kelas', `Perhatikan denah sekolah ini. Gerbang ada di $O(0,\\, 0)$. Coba tandai **kelasmu** di ${pointName('A', A)}: ketuk letaknya.`),
      this.pickPoint('B', B, 'Kantin', `Bagus! Sekarang tandai **kantin** di ${pointName('B', B)}.`),
      this.drawStep('O', 'A', {
        label: 'Vektor posisi $\\vec{a}$',
        prompt: 'Vektor yang **pangkalnya di $O$** disebut **vektor posisi**. Gambar vektor posisi kelas: ketuk $O$, lalu $A$.',
        summary: () => 'Vektor posisi kelas: $\\vec{a} = \\overrightarrow{OA}$.',
        tone: 'cyan',
        points,
        after: (arrow) => { this.posA = arrow; },
      }),
      this.drawStep('A', 'B', {
        label: 'Gambar $\\overrightarrow{AB}$',
        prompt: 'Saat istirahat, kamu berangkat dari **kelas**, bukan dari gerbang. Gambar $\\overrightarrow{AB}$: dari $A$ menuju $B$.',
        summary: () => '$\\overrightarrow{AB}$ tergambar: dari kelas ke kantin.',
        points,
        after: () => {
          // Fokus ke AB: vektor posisi a diredupkan.
          if (this.posA) this.posA.setTone('muted');
        },
      }),
      {
        kind: 'fields',
        label: 'Hitung di kisi',
        prompt: 'Sekarang hitung sendiri di kisi: dari $A$ ke $B$, **berapa satuan mendatar** dan **berapa satuan tegak**?',
        fields: [
          { key: 'dx', label: 'Mendatar', mode: 'integer', aria: 'Langkah mendatar' },
          { key: 'dy', label: 'Tegak', mode: 'integer', aria: 'Langkah tegak' },
        ],
        check: (v) => {
          const s = [v.dx.value, v.dy.value];
          const i = firstWrong(s, key);
          if (i < 0) return true;
          const wrong = [['dx', 'dy'][i]];
          if (same(s[i], -key[i])) {
            return { toast: 'langkahSalahTanda', values: { sumbu: i === 0 ? 'mendatar' : 'tegak', arah: DIRECTION[AXES[i]](key[i]) }, wrong };
          }
          return { toast: 'langkahSalahBesar', values: { sumbu: i === 0 ? 'mendatar' : 'tegak' }, wrong };
        },
        hint: () => ({
          text: 'Ikuti lompatan bayangan dari $A$: hitung lompatan mendatarnya, lalu lompatan tegaknya.',
          show: () => ghostHops(this, A, key),
          fields: 'wrong',
        }),
        summary: () => `Dari $A$ ke $B$: $${key[0]}$ ${DIRECTION.x(key[0])}, $${key[1]}$ ${DIRECTION.y(key[1])}.`,
        onSolved: () => animateHops(this, A, key),
      },
      {
        kind: 'fields',
        label: 'Temukan polanya',
        prompt: `Dari mana angka $${key[0]}$ dan $${key[1]}$ itu? Lihat koordinat $A$ dan $B$ pada label titiknya, lalu lengkapi.`,
        fields: [
          { key: 'xb', label: `$${key[0]} =$`, mode: 'integer', aria: 'Bilangan pertama baris x' },
          { key: 'xa', label: '$-$', mode: 'integer', aria: 'Bilangan kedua baris x' },
          { key: 'yb', label: `$${key[1]} =$`, mode: 'integer', aria: 'Bilangan pertama baris y' },
          { key: 'ya', label: '$-$', mode: 'integer', aria: 'Bilangan kedua baris y' },
        ],
        check: (v) => {
          const s = [v.xb.value, v.xa.value, v.yb.value, v.ya.value];
          const want = [B[0], A[0], B[1], A[1]];
          if (firstWrong(s, want) < 0) return true;
          const flipped = [A[0], B[0], A[1], B[1]];
          if (firstWrong(s, flipped) < 0) return { toast: 'urutanUjungPangkal' };
          return { toast: 'polaSalah', wrong: ['xb', 'xa', 'yb', 'ya'].filter((k, i) => !same(s[i], want[i])) };
        },
        hint: () => ({
          text: `Baris pertama memakai koordinat **$x$** kedua titik, baris kedua memakai koordinat **$y$**. Yang lebih besar (milik $B$, ujung) ditulis lebih dulu.`,
          show: () => {
            const a = this.marks.A && this.marks.A.el;
            const b = this.marks.B && this.marks.B.el;
            [a, b].forEach((n) => n && n.classList.add('is-armed'));
            return () => [a, b].forEach((n) => n && n.classList.remove('is-armed'));
          },
          fields: 'wrong',
        }),
        summary: () => '$\\overrightarrow{AB} = B - A$: **ujung dikurangi pangkal**.',
        onSolved: () => this.plane.highlight('AB'),
      },
    ];
  }

  stepsFormula(c) {
    const { P, Q } = c;
    const key = Q.map((q, i) => q - P[i]);
    return [
      {
        ...this.differenceStep('P', 'Q', P, Q, {
          label: 'Hitung $\\overrightarrow{PQ}$',
          prompt: 'Pakai rumus tadi, $\\overrightarrow{PQ} = Q - P$, untuk setiap komponen.',
        }),
        onSolved: async () => {
          await animateHops(this, P, key);
          const arrow = this.drawVector({ from: P, to: P, name: 'PQ', tone: 'blue' }, { essential: true });
          await arrow.setVector({ from: P, to: Q }, { animate: !stillMotion(), duration: ARROW_MS });
        },
      },
      {
        kind: 'fields',
        label: 'Vektor lawan $\\overrightarrow{QP}$',
        prompt: 'Sekarang $\\overrightarrow{QP}$: berangkat dari $Q$ menuju $P$.',
        intro: 'Lompatan di bidang cocok dengan hitunganmu. Perhatikan: pangkal dan ujungnya kini bertukar.',
        fields: componentFields(2),
        check: (values) => {
          const s = componentValues(values, 2);
          const want = key.map((n) => -n);
          if (firstWrong(s, want) < 0) return true;
          if (firstWrong(s, key) < 0) return { toast: 'lawanSama', wrong: ['cx', 'cy'] };
          return { toast: 'hasilSalah', wrong: wrongKeys(s, want) };
        },
        hint: () => ({ text: '$\\overrightarrow{QP}$ berarti pangkal $Q$, ujung $P$, jadi $P - Q$. Hasilnya sama dengan $\\overrightarrow{PQ}$ tetapi semua tandanya berlawanan.', fields: 'wrong' }),
        summary: () => `$\\overrightarrow{QP} = P - Q = ${texColumn(key.map((n) => -n))} = -\\overrightarrow{PQ}$`,
      },
    ];
  }

  stepsNoGrid(c) {
    const { K, L, KM } = c;
    const M = K.map((k, i) => k + KM[i]);
    return [
      this.differenceStep('K', 'L', K, L, {
        label: 'Hitung $\\overrightarrow{KL}$',
        prompt: 'Tentukan $\\overrightarrow{KL}$ tanpa menggambar — cukup dengan rumus.',
      }),
      {
        kind: 'fields',
        label: 'Titik ujung $M$',
        prompt: `Dari $K$ dilakukan perpindahan $\\overrightarrow{KM} = ${texColumn(KM)}$. Di mana titik **ujung** $M$?`,
        fields: componentFields(2, { label: (a) => `$${a}_M$` }),
        check: (values) => {
          const s = componentValues(values, 2);
          if (firstWrong(s, M) < 0) return true;
          const minus = K.map((k, i) => k - KM[i]);
          if (firstWrong(s, minus) < 0) return { toast: 'ujungBukanPangkal', wrong: ['cx', 'cy'] };
          return { toast: 'hasilSalah', wrong: wrongKeys(s, M) };
        },
        hint: () => ({ text: `Titik ujung = titik pangkal + perpindahan: $x_M = ${K[0]} + ${KM[0]}$ dan $y_M = ${K[1]} + ${KM[1]}$.`, fields: 'wrong' }),
        summary: () => `$M = K + \\overrightarrow{KM} = ${texTuple(M)}$`,
      },
    ];
  }

  stepsOrigin(c) {
    const { RS, S } = c;
    const R = S.map((s, i) => s - RS[i]);
    return [
      {
        kind: 'fields',
        label: 'Hitung $R$',
        prompt: 'Tentukan koordinat titik pangkal $R$.',
        intro: '$R$ adalah **pangkal** dan $S$ adalah **ujung**, jadi $\\overrightarrow{RS} = S - R$. Kalau rumusnya dibalik: $R = S - \\overrightarrow{RS}$.',
        fields: componentFields(2, { label: (a) => `$${a}_R$` }),
        check: (values) => {
          const s = componentValues(values, 2);
          if (firstWrong(s, R) < 0) return true;
          const plus = S.map((v, i) => v + RS[i]);
          if (firstWrong(s, plus) < 0) return { toast: 'pangkalBukanUjung', wrong: ['cx', 'cy'] };
          return { toast: 'hasilSalah', wrong: wrongKeys(s, R) };
        },
        hint: () => ({ text: `$x_R = ${S[0]} - ${RS[0]}$ dan $y_R = ${S[1]} - (${RS[1]})$. Ingat: mengurangi bilangan negatif sama dengan menambah.`, fields: 'wrong' }),
        summary: () => `$R = S - \\overrightarrow{RS} = ${texTuple(R)}$`,
      },
      {
        kind: 'pick',
        label: 'Buktikan di bidang',
        prompt: 'Sekarang buktikan jawabanmu: **ketuk titik $R$** pada bidang. Dari sana, $\\overrightarrow{RS}$ harus tiba tepat di $S$.',
        check: (p) => (samePoint(p, R) ? true : { toast: 'titikMeleset', values: { titik: tapped(p) } }),
        hint: () => ({ text: `Ketuk titik yang koordinatnya baru saja kamu hitung, $R${texTuple(R)}$.`, show: () => ghostCross(this, R) }),
        summary: () => 'Dari $R$, perpindahan $\\overrightarrow{RS}$ tiba tepat di $S$.',
        onSolved: async () => {
          this.markPoint('R', R);
          await animateHops(this, R, RS);
          const arrow = this.drawVector({ from: R, to: R, name: 'RS', tone: 'blue' }, { essential: true });
          await arrow.setVector({ from: R, to: S }, { animate: !stillMotion(), duration: ARROW_MS });
        },
      },
    ];
  }
}

/* ============================================================
   4. magnitude_guided — Panjang vektor dengan Teorema Pythagoras

   Alur guru (revisi): perhatikan vektor → langkah mendatar & tegaknya
   membentuk segitiga siku-siku (ketuk sudut sikunya) → apakah panjangnya
   sama dengan 3 + 4 = 7? (tidak, lebih pendek) → ingat Teorema Pythagoras
   dari SMP → siswa menghitung kuadrat, jumlah, dan akar sendiri.
   Kasus 2: hasilnya bukan kuadrat sempurna → √20 = √4 × √5 = 2√5.
   Kasus 3: tanpa gambar, langsung dengan rumus — komponen negatif.
   ============================================================ */

/** Persegi pada sisi a→b, ke kiri (dir +1) atau ke kanan (dir −1) arah a→b. */
function squareCorners(a, b, dir, k = 1) {
  const n = dir > 0 ? [-(b[1] - a[1]), b[0] - a[0]] : [b[1] - a[1], -(b[0] - a[0])];
  return [a, b, [b[0] + n[0] * k, b[1] + n[1] * k], [a[0] + n[0] * k, a[1] + n[1] * k]];
}

const sq = (n) => (n < 0 ? `(${n})^2` : `${n}^2`);

export class GuidedMagnitudeSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind !== 'formula';
  }

  planeOptions(c) {
    const [x, y] = c.v;
    if (c.kind === 'pythagoras') {
      // Ruang untuk ketiga persegi: di bawah sumbu X, di kanan sisi tegak,
      // dan di kiri atas sisi miring.
      const pts = [[0, 0], [x, y], [x + y, 0], [0, -x], [-y, x], [x - y, y + x]];
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      return { xRange: [Math.min(...xs) - 1, Math.max(...xs) + 1], yRange: [Math.min(...ys) - 1, Math.max(...ys) + 1] };
    }
    return {
      xRange: [Math.min(0, x) - 2, Math.max(0, x) + 2],
      yRange: [Math.min(0, y) - 1, Math.max(0, y) + 2],
    };
  }

  caseLabel(c) {
    return `$${texTuple(c.v)}$`;
  }

  caseSuccessKey(c) {
    return { pythagoras: 'success', simplify: 'successAkar', formula: 'successRumus' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'pythagoras') {
      return 'Mudah, bukan? Panjang vektor dihitung dengan **Teorema Pythagoras**: $|\\vec{v}| = \\sqrt{x^2 + y^2}$.';
    }
    if (c.kind === 'simplify') {
      return 'Begitu cara menyederhanakan akar: pecah menjadi **kuadrat sempurna × sisanya**, lalu akarkan kuadrat sempurnanya.';
    }
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'simplify') return 'Sekarang kita coba vektor yang hasilnya **bukan kuadrat sempurna**.';
    return 'Terakhir, kita hitung **tanpa gambar** — langsung dengan rumusnya.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Panjang Vektor Dikuasai',
      recap: [
        'Langkah mendatar dan tegak membentuk **segitiga siku-siku**; vektornya adalah sisi miring',
        '$|\\vec{v}| = \\sqrt{x^2 + y^2}$ — kuadratkan, jumlahkan, lalu akarkan',
        'Akar yang bukan kuadrat sempurna disederhanakan: $\\sqrt{20} = \\sqrt{4}\\sqrt{5} = 2\\sqrt{5}$',
      ],
    };
  }

  setupCase(c) {
    if (c.kind === 'formula') {
      this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${texColumn(c.v)}`), 'sim-given--display'));
      this.givenEl.appendChild(givenBlock(mixed('Rumus: $|\\vec{v}| = \\sqrt{x^2 + y^2}$ — akar dari jumlah kuadrat **semua** komponennya.'), 'sim-given--muted'));
      return;
    }
    this.marks = { O: this.drawPoint([0, 0], { label: 'O', essential: true }) };
    this.drawVector({ from: [0, 0], to: c.v, name: 'v', tone: 'blue' }, { essential: true });
    this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${texColumn(c.v)}`), 'sim-given--display'));
    // Kasus 2: segitiganya langsung tampak (siswa sudah mengenalnya di kasus 1).
    if (c.kind === 'simplify') this.drawLegs(c.v);
  }

  /** Sisi mendatar & tegak + tanda siku + panjang kedua sisi. */
  drawLegs(v) {
    const [x, y] = v;
    const corner = [x, 0];
    this.plane.drawSegment([0, 0], corner, { dashed: true });
    this.plane.drawSegment(corner, v, { dashed: true });
    this.plane.drawAngleArc([-x, 0], [0, y], { origin: corner });
    springPop(this.plane.drawTag([x / 2, 0], String(Math.abs(x)), { offset: [0, y >= 0 ? 15 : -15], tone: 'amber' }).inner);
    springPop(this.plane.drawTag([x, y / 2], String(Math.abs(y)), { offset: [x >= 0 ? 16 : -16, 0], tone: 'amber' }).inner);
  }

  /** Persegi muncul dari sisinya ke luar (320 ms), lalu angka luasnya. */
  async growSquare(a, b, dir, tone, area) {
    const poly = this.plane.drawPolygon(squareCorners(a, b, dir, 0.001), { tone });
    const ms = stillMotion() ? 0 : 320;
    const t0 = performance.now();
    await new Promise((resolve) => {
      const tick = (now) => {
        if (this.destroyed || !this.plane) { resolve(); return; }
        const k = ms ? Math.min(1, (now - t0) / ms) : 1;
        poly.setPoints(squareCorners(a, b, dir, Math.max(0.001, 1 - (1 - k) ** 3)));
        if (k < 1) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    if (this.destroyed || !this.plane) return;
    const pts = squareCorners(a, b, dir);
    const center = [(pts[0][0] + pts[2][0]) / 2, (pts[0][1] + pts[2][1]) / 2];
    springPop(this.plane.drawTag(center, String(area), { tone: tone === 'amber' ? 'amber' : 'blue' }).inner);
  }

  /** Kuadrat setiap komponen, dengan pengenal kesalahan khas. */
  squaresStep(v, { label, prompt, onSolved, summary }) {
    const squares = v.map((n) => n * n);
    return {
      kind: 'fields',
      label,
      prompt,
      fields: v.map((n, i) => ({ key: `q${AXES[i]}`, label: `$${sq(n)} =$`, mode: 'integer', aria: `Kuadrat dari ${n}` })),
      check: (values) => {
        const s = v.map((n, i) => values[`q${AXES[i]}`].value);
        const i = firstWrong(s, squares);
        if (i < 0) return true;
        const wrong = wrongKeys(s, squares, 'q');
        const student = S.toNumber(s[i]);
        if (student === -squares[i]) return { toast: 'tandaIkutMasuk', values: { nilai: v[i] }, wrong };
        if (Math.abs(student) === Math.abs(v[i]) && squares[i] !== Math.abs(v[i])) return { toast: 'lupaKuadrat', wrong };
        if (Math.abs(student) === 2 * Math.abs(v[i])) return { toast: 'kaliDua', wrong };
        return { toast: 'kuadratSalah', wrong };
      },
      hint: () => ({
        text: `Kuadrat artinya bilangan dikali **dirinya sendiri**: $${sq(v[0])} = (${v[0]}) \\times (${v[0]})$. Negatif × negatif hasilnya **positif**.`,
      }),
      summary: summary || (() => `$|\\vec{v}|^2 = ${v.map(sq).join(' + ')} = ${squares.join(' + ')}$`),
      onSolved,
    };
  }

  sumStep(v, { label, prompt, onSolved }) {
    const squares = v.map((n) => n * n);
    const sum = squares.reduce((a, b) => a + b, 0);
    return {
      kind: 'fields',
      label,
      prompt,
      fields: [{ key: 'sum', label: `$${squares.join(' + ')} =$`, mode: 'integer' }],
      check: (values) => {
        if (same(values.sum.value, sum)) return true;
        if (same(values.sum.value, Math.abs(v[0]) + Math.abs(v[1]))) return { toast: 'lupaKuadrat' };
        return { toast: 'jumlahSalah' };
      },
      hint: () => ({ text: `Jumlahkan dua bilangan yang baru kamu dapat: $${squares[0]}$ ditambah $${squares[1]}$.`, fields: ['sum'] }),
      summary: () => `$|\\vec{v}|^2 = ${sum}$`,
      onSolved,
    };
  }

  /** Tulis panjang dalam akar paling sederhana. */
  simplestStep(v, { label, prompt }) {
    const sum = v.reduce((a, n) => a + n * n, 0);
    const length = S.fromSquare(sum);
    const split = S.squareFreeSplit(sum);
    return {
      kind: 'fields',
      label,
      prompt,
      fields: [{ key: 'len', label: '$|\\vec{v}| =$', mode: 'surd' }],
      check: (values) => {
        const verdict = Val.checkExactAnswer(values.len.raw, length, { requireSimplest: true });
        if (verdict.correct) return true;
        if (verdict.code === 'not-simplest') return { toast: 'belumDisederhanakan', values: { radikan: sum } };
        if (verdict.code === 'decimal') return { toast: 'terlanjurDesimal' };
        if (same(values.len.value, sum)) return { toast: 'belumDiakar' };
        return { toast: 'panjangSalah' };
      },
      hint: () => ({
        text: split.outside > 1
          ? `Pecah $${sum}$ menjadi **kuadrat sempurna × sisanya**: $${sum} = ${split.outside ** 2} \\times ${split.inside}$. Akar dari $${split.outside ** 2}$ adalah $${split.outside}$. Cara mengetik: angka depan, lalu **√**, lalu angka di dalam akar.`
          : `Panjangnya akar dari $${sum}$. Cara mengetik: tekan **√**, lalu $${sum}$.`,
        fields: ['len'],
      }),
      summary: () => `$|\\vec{v}| = \\sqrt{${sum}} = ${S.toLatexS(length)}$`,
      onSolved: () => {
        if (!this.plane) return;
        springPop(this.plane.drawTag([v[0] / 2, v[1] / 2], `|\\vec{v}| = ${S.toLatexS(length)}`, { offset: [-30, -12], tone: 'amber' }).inner);
        this.plane.highlight('v');
      },
    };
  }

  buildSteps(c) {
    const v = c.v;
    const [x, y] = v;
    const sum = x * x + y * y;
    if (c.kind === 'pythagoras') {
      const corner = [x, 0];
      return [
        {
          kind: 'pick',
          label: 'Sudut siku-siku',
          prompt: 'Perhatikan vektor $\\vec{v}$. Langkah mendatar dan tegaknya membentuk **segitiga siku-siku**. Ketuk titik **sudut siku-sikunya**.',
          check: (p) => {
            if (samePoint(p, corner)) return true;
            if (samePoint(p, [0, y])) return { toast: 'sikuTegakDulu' };
            return { toast: 'sikuMeleset', values: { titik: tapped(p) } };
          },
          hint: () => ({
            text: `Dari $O$, jalan **mendatar** dulu sampai tepat di bawah ujung panah. Di situlah langkah mendatar berbelok menjadi tegak.`,
            show: () => ghostHops(this, [0, 0], [x, 0]),
          }),
          summary: () => `Segitiga siku-siku dengan sisi mendatar $${Math.abs(x)}$ dan sisi tegak $${Math.abs(y)}$.`,
          onSolved: () => this.drawLegs(v),
        },
        {
          kind: 'choice',
          label: 'Sama dengan 7?',
          prompt: `Tepat! Langkah mendatar + tegak $= ${Math.abs(x)} + ${Math.abs(y)} = ${Math.abs(x) + Math.abs(y)}$. Kalau berjalan **lurus** mengikuti $\\vec{v}$, apakah panjangnya juga $${Math.abs(x) + Math.abs(y)}$?`,
          options: [
            { key: 'sama', label: `Ya, sama dengan $${Math.abs(x) + Math.abs(y)}$` },
            { key: 'pendek', label: `Tidak, **lebih pendek** dari $${Math.abs(x) + Math.abs(y)}$` },
            { key: 'panjang', label: `Tidak, lebih panjang dari $${Math.abs(x) + Math.abs(y)}$` },
          ],
          check: (key) => (key === 'pendek' ? true : { toast: 'lurusLebihPendek' }),
          hint: () => ({ text: 'Bandingkan dua cara sampai ke ujung panah: berbelok di sudut, atau langsung lurus. Mana yang lebih dekat?' }),
          summary: () => `Panjang $\\vec{v}$ lebih pendek dari $${Math.abs(x) + Math.abs(y)}$ — berjalan lurus lebih cepat sampai.`,
        },
        this.squaresStep(v, {
          label: 'Kuadrat sisi siku-siku',
          prompt: 'Benar, jalan lurus lebih pendek. Ingatkah **Teorema Pythagoras** dari SMP? Hitung dulu kuadrat kedua sisi siku-siku.',
          intro: 'Pada segitiga siku-siku, **kuadrat sisi miring = jumlah kuadrat kedua sisi siku-sikunya**. Sisi miring segitiga ini adalah $\\vec{v}$.',
          onSolved: async () => {
            await this.growSquare([0, 0], corner, -1, 'amber', x * x);
            await this.growSquare(corner, v, -1, 'amber', y * y);
          },
        }),
        this.sumStep(v, {
          label: 'Jumlahkan',
          prompt: `Kedua persegi di atas menunjukkan $${sq(x)}$ dan $${sq(y)}$. Sekarang **jumlahkan** keduanya — hasilnya sama dengan kuadrat panjang $\\vec{v}$.`,
          onSolved: () => this.growSquare([0, 0], v, 1, 'blue', sum),
        }),
        {
          kind: 'fields',
          label: 'Akarkan',
          prompt: `Jadi $|\\vec{v}|^2 = ${sum}$, ditunjukkan persegi biru pada sisi miring. Panjang $\\vec{v}$ adalah **akar** dari ${sum}. Berapa $|\\vec{v}|$?`,
          fields: [{ key: 'len', label: '$|\\vec{v}| =$', mode: 'surd' }],
          check: (values) => {
            const verdict = Val.checkExactAnswer(values.len.raw, S.fromSquare(sum), { requireSimplest: true });
            if (verdict.correct) return true;
            if (verdict.code === 'decimal') return { toast: 'terlanjurDesimal' };
            if (same(values.len.value, sum)) return { toast: 'belumDiakar' };
            return { toast: 'panjangSalah' };
          },
          hint: () => ({ text: `Cari bilangan yang jika dikali dirinya sendiri hasilnya $${sum}$.`, fields: ['len'] }),
          summary: () => `$|\\vec{v}| = \\sqrt{${sum}} = ${S.toLatexS(S.fromSquare(sum))}$`,
          onSolved: () => {
            springPop(this.plane.drawTag([x / 2, y / 2], `|\\vec{v}| = ${S.toLatexS(S.fromSquare(sum))}`, { offset: [24, 14], tone: 'amber' }).inner);
            this.plane.highlight('v');
          },
        },
      ];
    }

    if (c.kind === 'simplify') {
      const split = S.squareFreeSplit(sum);
      const k2 = split.outside * split.outside;
      return [
        this.squaresStep(v, {
          label: 'Kuadratkan',
          prompt: `Segitiga siku-sikunya sudah tergambar: sisi $${Math.abs(x)}$ dan $${Math.abs(y)}$. Seperti tadi, hitung dulu kuadrat kedua sisi siku-sikunya.`,
        }),
        this.sumStep(v, { label: 'Jumlahkan', prompt: 'Jumlahkan kedua hasil kuadrat itu.' }),
        {
          kind: 'choice',
          label: 'Kuadrat sempurna',
          prompt: `Jadi $|\\vec{v}| = \\sqrt{${sum}}$. Karena $${sum}$ **bukan kuadrat sempurna**, akarnya perlu disederhanakan. Pilih bilangan yang tepat.`,
          intro: `Caranya: cari **kuadrat sempurna** ($4, 9, 16, \\dots$) yang **kurang dari** $${sum}$ dan jika dikalikan bilangan bulat lain hasilnya tepat $${sum}$.`,
          options: [
            { key: 'sembilan', label: '$9$' },
            { key: 'ok', label: `$${k2}$` },
            { key: 'dua', label: '$2$' },
            { key: 'enambelas', label: '$16$' },
          ].filter((o, i, arr) => arr.findIndex((p) => p.label === o.label) === i),
          check: (key) => {
            if (key === 'ok') return true;
            if (key === 'dua') return { toast: 'faktorBukanKuadrat' };
            return { toast: 'faktorTidakMembagi' };
          },
          hint: () => ({ text: `Coba satu per satu: apakah $${sum} \\div 4$, $${sum} \\div 9$, $${sum} \\div 16$ hasilnya bilangan bulat?` }),
          summary: () => `$${sum} = ${k2} \\times ${split.inside}$, jadi $\\sqrt{${sum}} = \\sqrt{${k2}} \\times \\sqrt{${split.inside}}$`,
        },
        {
          kind: 'fields',
          label: `Akar dari ${k2}`,
          prompt: `Tepat. Maka $\\sqrt{${sum}} = \\sqrt{${k2}} \\times \\sqrt{${split.inside}}$. Berapa $\\sqrt{${k2}}$?`,
          fields: [{ key: 'root', label: `$\\sqrt{${k2}} =$`, mode: 'integer' }],
          check: (values) => (same(values.root.value, split.outside) ? true : { toast: 'akarKuadratSalah' }),
          hint: () => ({ text: `Bilangan berapa yang dikali dirinya sendiri hasilnya $${k2}$?`, fields: ['root'] }),
          summary: () => `$\\sqrt{${k2}} = ${split.outside}$`,
        },
        this.simplestStep(v, {
          label: 'Bentuk sederhana',
          prompt: `Jadi $\\sqrt{${sum}} = ${split.outside}\\sqrt{${split.inside}}$. Tulis panjang $\\vec{v}$ dalam bentuk paling sederhana.`,
        }),
      ];
    }

    return [
      this.squaresStep(v, {
        label: 'Kuadratkan',
        prompt: 'Sekarang **tanpa gambar**. Hitung kuadrat **setiap** komponen $\\vec{v}$ — hati-hati dengan tanda minus.',
      }),
      this.sumStep(v, { label: 'Jumlahkan', prompt: 'Jumlahkan semua hasil kuadratnya.' }),
      this.simplestStep(v, {
        label: 'Akar paling sederhana',
        prompt: 'Panjang $\\vec{v}$ adalah akar dari jumlah itu. Tulis dalam bentuk akar **paling sederhana**.',
      }),
    ];
  }
}

/* ============================================================
   5. unit_guided — Vektor satuan dan lingkaran berjari-jari 1

   Kasus 1 (terpandu): hitung |v| = 5 → pilih caranya (dibagi panjangnya)
   → titik-titik membagi panah menjadi 5 bagian yang sama panjang →
   hitung v̂ → ujungnya tepat berada di lingkaran berjari-jari 1 → uji
   (3/5)² + (4/5)² = 1. Kasus 2: (6, 8) searah, vektor satuannya sama.
   Kasus 3: panjangnya berakar (papan angka: 1 → a/b → √ → 5).
   Kasus 4: vektor nol tidak punya vektor satuan.
   ============================================================ */
export class GuidedUnitSim extends CaseSimulation {
  usesPlane(c) {
    return c.kind !== 'zero';
  }

  planeOptions(c) {
    const [x, y] = c.v;
    return {
      xRange: [Math.min(0, x) - 2, Math.max(0, x) + 2],
      yRange: [Math.min(0, y) - 2, Math.max(0, y) + 2],
    };
  }

  caseLabel(c) {
    return c.kind === 'zero' ? 'Vektor nol' : `$${texTuple(c.v)}$`;
  }

  caseSuccessKey(c) {
    return { shrink: 'success', same: 'successSearah', surd: 'successAkar', zero: 'vektorNol' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'shrink') return 'Lihat: ujung $\\hat{v}$ tepat berada di **lingkaran berjari-jari 1**. Itu tanda panjangnya tepat 1, sedangkan arahnya tetap arah $\\vec{v}$.';
    if (c.kind === 'same') return 'Vektor $(6,\\, 8)$ dua kali lebih panjang, tetapi **searah** — karena itu vektor satuannya **sama persis**.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'same') return 'Bagus! Sekarang vektor yang **dua kali lebih panjang** — apakah vektor satuannya ikut berubah?';
    if (next.kind === 'surd') return 'Tidak semua panjang berupa bilangan bulat. Kita coba yang panjangnya **berbentuk akar**.';
    return 'Terakhir, bagaimana dengan vektor yang **panjangnya nol**?';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Vektor Satuan Dikuasai',
      recap: [
        'Vektor satuan **searah** dengan $\\vec{v}$, panjangnya tepat **1**',
        '$\\hat{e} = \\dfrac{\\vec{v}}{|\\vec{v}|}$ — bagi **setiap** komponen dengan panjangnya',
        'Vektor yang searah punya vektor satuan yang sama; $\\vec{0}$ tidak punya',
      ],
    };
  }

  setupCase(c) {
    this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${texColumn(c.v)}`), 'sim-given--display'));
    if (!this.plane) {
      this.givenEl.appendChild(givenBlock('Vektor ini tidak bisa digambar sebagai panah: pangkal dan ujungnya berada di titik yang sama.', 'sim-given--muted'));
      return;
    }
    this.plane.drawCircle([0, 0], 1, { tone: 'cyan' });
    this.drawPoint([0, 0], { label: 'O', essential: true });
    this.drawVector({ from: [0, 0], to: c.v, name: 'v', tone: 'blue' }, { essential: true });
  }

  /** Panjang eksak + vektor satuan; vektor nol tidak punya vektor satuan (null). */
  unitOf(v) {
    const length = V.normExact(V.fromArray(v));
    return { length, unit: S.isZeroS(length) ? null : v.map((n) => S.divS(n, length)) };
  }

  lengthStep(c, { prompt }) {
    const { length } = this.unitOf(c.v);
    const sumSq = c.v.reduce((a, n) => a + n * n, 0);
    return {
      kind: 'fields',
      label: 'Panjang $|\\vec{v}|$',
      prompt,
      fields: [{ key: 'len', label: '$|\\vec{v}| =$', mode: c.kind === 'zero' ? 'integer' : 'surd' }],
      check: (values) => {
        if (same(values.len.value, length)) return true;
        if (sumSq !== 0 && same(values.len.value, c.v.reduce((a, n) => a + Math.abs(n), 0))) return { toast: 'lupaKuadrat' };
        if (sumSq !== 0 && same(values.len.value, sumSq) && sumSq !== 1) return { toast: 'belumDiakar' };
        return { toast: 'panjangSalah' };
      },
      hint: () => ({
        text: `Seperti sub-topik sebelumnya: $|\\vec{v}| = \\sqrt{${c.v.map((n) => (n < 0 ? `(${n})^2` : `${n}^2`)).join(' + ')}}$.${sumSq && !Number.isInteger(Math.sqrt(sumSq)) ? ' Untuk menulis akar, tekan **√** lalu angkanya.' : ''}`,
        fields: ['len'],
      }),
      summary: () => `$|\\vec{v}| = ${S.toLatexS(length)}$`,
      onSolved: () => {
        if (!this.plane) return;
        springPop(this.plane.drawTag([c.v[0] / 2, c.v[1] / 2], `|\\vec{v}| = ${S.toLatexS(length)}`, { offset: [26, 10], tone: 'blue' }).inner);
      },
    };
  }

  unitStep(c, { prompt, mode = 'fraction', intro }) {
    const { length, unit } = this.unitOf(c.v);
    const dim = c.v.length;
    const lenTex = S.toLatexS(length);
    return {
      kind: 'fields',
      label: 'Bagi setiap komponen',
      prompt,
      intro,
      fields: componentFields(dim, { mode }),
      check: (values) => {
        const s = componentValues(values, dim);
        if (firstWrong(s, unit) < 0) return true;
        const wrong = wrongKeys(s, unit);
        const right = dim - wrong.length;
        if (right > 0 && s.some((x, i) => !same(x, unit[i]) && same(x, c.v[i]))) return { toast: 'hanyaSatuKomponen', wrong };
        if (s.every((x, i) => c.v[i] === 0 || same(x, Math.sign(c.v[i])))) return { toast: 'dibagiKomponen', wrong };
        if (firstWrong(s, unit.map((u) => (S.toNumber(u) < 0 ? S.negS(u) : u))) < 0) return { toast: 'tandaHilang', wrong };
        return { toast: 'satuanSalah', values: { panjang: lenTex }, wrong };
      },
      hint: () => ({
        text: `$\\hat{v} = \\left(\\dfrac{${c.v[0]}}{${lenTex}},\\ \\dfrac{${c.v[1]}}{${lenTex}}\\right)$ — tulis setiap komponen sebagai pecahan.${mode === 'surd' ? ` Cara mengetik: angka atas → **a/b** → **√** → angka di dalam akar.` : ''}`,
        fields: 'wrong',
      }),
      summary: () => `$\\hat{v} = \\left(${unit.map((u) => S.toLatexS(u)).join(',\\ ')}\\right)$`,
      onSolved: async () => {
        const tip = unit.map((u) => S.toNumber(u));
        const arrow = this.drawVector({ from: [0, 0], to: [0, 0], name: 'e', tone: 'amber', label: '\\hat{v}' }, { essential: true });
        await arrow.setVector({ to: tip }, { animate: !stillMotion(), duration: ARROW_MS });
        if (arrow.labelEl) springPop(arrow.labelEl.firstChild.firstChild);
        const ring = this.plane.drawPoint(tip, { ghost: true });
        ring.el.classList.add('is-armed');
      },
    };
  }

  buildSteps(c) {
    const [x, y] = c.v;
    if (c.kind === 'shrink') {
      const { length, unit } = this.unitOf(c.v);
      const n = S.toNumber(length);
      return [
        this.lengthStep(c, { prompt: 'Perhatikan lingkaran biru muda: jari-jarinya **1**. Kita ingin vektor yang searah $\\vec{v}$ tetapi panjangnya tepat 1. Mulai dengan menghitung panjang $\\vec{v}$.' }),
        {
          kind: 'choice',
          label: 'Pilih caranya',
          prompt: `Tepat, panjangnya $${n}$. Supaya panjangnya menjadi **tepat 1** tanpa mengubah arah, apa yang harus kita lakukan pada $\\vec{v}$?`,
          options: [
            { key: 'kurang', label: `Mengurangi setiap komponen dengan $${n - 1}$` },
            { key: 'komponen', label: `Membagi komponen pertama dengan $${x}$ dan komponen kedua dengan $${y}$` },
            { key: 'bagi', label: `Membagi **setiap** komponen dengan $${n}$` },
            { key: 'tetap', label: 'Menulis panjangnya $1$, komponennya dibiarkan' },
          ],
          check: (key) => {
            if (key === 'bagi') return true;
            if (key === 'kurang') return { toast: 'arahBerubah' };
            if (key === 'komponen') return { toast: 'dibagiKomponen' };
            return { toast: 'komponenTetap' };
          },
          hint: () => ({ text: `Panjangnya $${n}$ kali lebih besar dari yang kita mau. Agar arahnya tetap, semua komponen harus diperlakukan **sama**.` }),
          summary: () => `Bagi $\\vec{v}$ dengan panjangnya sendiri: $\\dfrac{\\vec{v}}{${n}}$.`,
          onSolved: async () => {
            // Panah dibagi menjadi n bagian sama panjang — bagian pertama
            // adalah vektor satuannya (komponennya tetap dihitung siswa).
            for (let k = 1; k < n; k += 1) {
              const dot = this.plane.drawPoint([(x * k) / n, (y * k) / n], { ghost: true });
              springPop(dot.el);
              await this.wait(stillMotion() ? 0 : 90);
            }
          },
        },
        this.unitStep(c, { prompt: `Titik-titik membagi $\\vec{v}$ menjadi $${n}$ bagian yang sama panjang. Bagian pertama itulah vektor satuannya. Bagi **setiap** komponen $\\vec{v}$ dengan $${n}$.` }),
        {
          kind: 'fields',
          label: 'Uji panjangnya',
          prompt: 'Kamu bisa memeriksa sendiri jawabanmu: kuadratkan setiap komponen $\\hat{v}$, lalu jumlahkan. Hasilnya harus…',
          fields: [{ key: 'chk', label: `$\\left(${S.toLatexS(unit[0])}\\right)^2 + \\left(${S.toLatexS(unit[1])}\\right)^2 =$`, mode: 'fraction' }],
          check: (values) => {
            if (same(values.chk.value, 1)) return true;
            if (same(values.chk.value, S.addS(unit[0], unit[1]))) return { toast: 'lupaKuadrat' };
            return { toast: 'verifikasiSalah' };
          },
          hint: () => ({ text: `Kuadratkan pembilang dan penyebutnya: $\\left(${S.toLatexS(unit[0])}\\right)^2 = \\dfrac{${x * x}}{${n * n}}$. Lakukan juga untuk komponen kedua, lalu jumlahkan.`, fields: ['chk'] }),
          summary: () => '$|\\hat{v}| = \\sqrt{1} = 1$ ✓',
          onSolved: () => {
            springPop(this.plane.drawTag(unit.map((u) => S.toNumber(u)), '|\\hat{v}| = 1', { offset: [34, -14], tone: 'amber' }).inner);
          },
        },
      ];
    }

    if (c.kind === 'same') {
      const ref = this.unitOf(c.ref).unit.map((u) => S.toLatexS(u)).join(',\\, ');
      const k = c.v[0] / c.ref[0];
      return [
        this.lengthStep(c, { prompt: 'Hitung panjang $\\vec{v}$.' }),
        this.unitStep(c, { prompt: 'Bagi **setiap** komponen dengan panjangnya. Sederhanakan pecahannya kalau bisa.' }),
        {
          kind: 'choice',
          label: 'Mengapa sama?',
          prompt: `Vektor satuannya berada di titik yang **sama** dengan kasus sebelumnya, $\\left(${ref}\\right)$. Mengapa?`,
          options: [
            { key: 'panjang', label: 'Karena kedua vektor sama panjang' },
            { key: 'searah', label: `Karena $${texTuple(c.v)} = ${k} \\times ${texTuple(c.ref)}$: kedua vektor **searah**` },
            { key: 'kebetulan', label: 'Kebetulan angkanya cocok' },
          ],
          check: (key) => {
            if (key === 'searah') return true;
            if (key === 'panjang') return { toast: 'panjangBeda' };
            return { toast: 'bukanKebetulan' };
          },
          hint: () => ({ text: `Bandingkan komponennya: $${c.v[0]}$ dengan $${c.ref[0]}$, dan $${c.v[1]}$ dengan $${c.ref[1]}$. Apa hubungannya?` }),
          summary: () => 'Vektor yang searah punya vektor satuan yang **sama**.',
        },
      ];
    }

    if (c.kind === 'surd') {
      return [
        this.lengthStep(c, { prompt: 'Hitung panjang $\\vec{v}$. Hasilnya berbentuk akar — tekan **√** di papan angka untuk menulisnya.' }),
        this.unitStep(c, {
          prompt: 'Sekarang bagi **setiap** komponen dengan panjangnya. Kamu boleh menulis akar di penyebut, atau bentuk yang sudah dirasionalkan.',
          intro: 'Cara mengetik $\\tfrac{1}{\\sqrt{5}}$: tekan **1**, lalu **a/b**, lalu **√**, lalu **5**. Untuk tanda minus, tekan **±**.',
          mode: 'surd',
        }),
      ];
    }

    return [
      this.lengthStep(c, { prompt: 'Hitung panjang $\\vec{v}$ lebih dulu — panjang ini akan menjadi pembagi.' }),
      {
        kind: 'choice',
        label: 'Vektor satuan?',
        prompt: 'Jadi, apa vektor satuan dari $\\vec{v}$?',
        options: [
          { key: 'nol', label: '$\\hat{v} = (0,\\, 0)$' },
          { key: 'satu', label: '$\\hat{v} = (1,\\, 1)$' },
          { key: 'none', label: 'Tidak ada — $\\dfrac{\\vec{0}}{0}$ tidak terdefinisi' },
        ],
        check: (key) => {
          if (key === 'none') return true;
          if (key === 'nol') return { toast: 'memaksaVektorNol' };
          return { toast: 'satuSembarang' };
        },
        hint: () => ({ text: 'Untuk mencari vektor satuan kita membagi dengan panjangnya. Panjangnya $0$ — bolehkah membagi dengan nol?' }),
        summary: () => '$\\vec{0}$ tidak punya arah, jadi tidak punya vektor satuan.',
      },
    ];
  }
}

/* ============================================================
   6. space_guided — Drone di ruang tiga dimensi (bisa diputar)

   Kasus 1 (terpandu): kemudikan drone dengan tombol arah (maju/kiri/naik)
   → balok bantu + panah OP muncul SESUDAH posisinya benar → tulis kolom
   tiga baris → basis î ĵ k̂ → panjang lewat DUA kali Pythagoras (diagonal
   lantai, lalu diagonal ruang). Kasus 2: komponen nol tetap di barisnya.
   Kasus 3: AB = B − A di ruang, panjang 3√3.
   ============================================================ */
const PAD_BUTTONS = [
  { key: 'x+', label: 'Maju $+X$', tone: 'x' },
  { key: 'x-', label: 'Mundur $-X$', tone: 'x' },
  { key: 'y+', label: 'Kanan $+Y$', tone: 'y' },
  { key: 'y-', label: 'Kiri $-Y$', tone: 'y' },
  { key: 'z+', label: 'Naik $+Z$', tone: 'z' },
  { key: 'z-', label: 'Turun $-Z$', tone: 'z' },
];
const AXIS_NAME = ['X', 'Y', 'Z'];
const tuple3 = (p) => `(${p.join(',\\, ')})`;

export class GuidedSpaceSim extends CaseSimulation {
  usesSpace() {
    return true;
  }

  spaceOptions(c) {
    return { range: c.range, ariaLabel: 'Ruang tiga dimensi — geser untuk memutar, atau pilih sudut pandang' };
  }

  caseLabel(c) {
    return { drone: 'Drone $P$', zero: 'Drone $Q$', between: '$\\overrightarrow{AB}$' }[c.kind];
  }

  caseSuccessKey(c) {
    return { drone: 'success', zero: 'successNol', between: 'successRuang' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'drone') return '**Dua kali Pythagoras = satu rumus:** $|\\vec{v}| = \\sqrt{x^2 + y^2 + z^2}$. Putar ruangnya untuk melihat kedua segitiga itu dari samping.';
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'zero') return 'Hebat! Drone berikutnya **tidak bergeser** ke kanan atau kiri — bagaimana menuliskannya?';
    return 'Terakhir: vektor di ruang yang **tidak** berangkat dari $O$.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Ruang 3D Dijelajahi',
      recap: [
        'Sumbu $Z$ tegak lurus $X$ dan $Y$: satu titik = $(x,\\, y,\\, z)$',
        'Basis baru $\\hat{k}$ = satu langkah **naik**',
        '$|\\vec{v}| = \\sqrt{x^2 + y^2 + z^2}$ — Pythagoras dua kali',
      ],
    };
  }

  setupCase(c) {
    this.pos = [0, 0, 0];
    this.hops = [];
    this.moves = 0;
    this.mover = null;
    if (c.kind === 'between') {
      this.givenEl.appendChild(givenBlock(tex(`A${tuple3(c.A)} \\qquad B${tuple3(c.B)}`), 'sim-given--display'));
      this.space.point(c.A, { label: 'A' });
      this.space.point(c.B, { label: 'B' });
      return;
    }
    // Perintahnya berdiri di panduan (langkah kemudi): di 740×360 blok
    // perintah terpisah mendorong tombol arah ke bawah lipatan.
    this.mover = this.space.mover([0, 0, 0], { label: 'drone' });
  }

  /** Satu tekan tombol = satu satuan, beranimasi; di luar area ditolak. */
  async press(key) {
    const axis = 'xyz'.indexOf(key[0]);
    const sign = key[1] === '+' ? 1 : -1;
    const next = this.pos.slice();
    next[axis] += sign;
    const r = this.cases[this.caseIndex].range;
    const lim = [r.x, r.y, r.z][axis];
    if (next[axis] < lim[0] - 1 || next[axis] > lim[1] + 1) {
      toast.warn(this.msg('keluarArea'));
      return;
    }
    this.hops.push(this.space.hop(this.pos, next));
    this.moves += 1;
    sfx.step(this.moves);
    await this.mover.moveTo(next, stillMotion() ? 0 : 150);
    this.pos = next;
  }

  resetDrone() {
    this.hops.forEach((h) => h.remove());
    this.hops = [];
    this.moves = 0;
    this.pos = [0, 0, 0];
    return this.mover.moveTo([0, 0, 0], 0);
  }

  padStep(c, { prompt, onSolved, intro }) {
    const target = c.P;
    return {
      kind: 'pad',
      label: 'Kemudikan drone',
      prompt,
      intro: intro || 'Satu tekan = **satu satuan**. Geser ruangnya untuk melihat dari sisi lain.',
      buttons: PAD_BUTTONS,
      onPress: (key) => this.press(key),
      onReset: () => this.resetDrone(),
      status: () => `Posisi drone: $${tuple3(this.pos)}$ · ${this.moves} langkah`,
      check: () => {
        if (this.pos.every((n, i) => n === target[i])) return true;
        if (!this.moves) return { toast: 'belumBergerak' };
        const i = this.pos.findIndex((n, k) => n !== target[k]);
        return { toast: 'posisiSalah', values: { sumbu: AXIS_NAME[i] } };
      },
      hint: () => {
        const words = [['Maju', 'Mundur'], ['Kanan', 'Kiri'], ['Naik', 'Turun']];
        const presses = target.map((n, i) => (n ? `**${words[i][n > 0 ? 0 : 1]}** ${Math.abs(n)} kali` : null)).filter(Boolean);
        return {
          text: `Garis putus-putus amber menunjukkan rutenya. Tekan **Ulang**, lalu tekan ${presses.join(', ')}.`,
          show: () => ghostRoute3d(this.space, target),
        };
      },
      summary: () => `Drone tiba di $P${tuple3(target)}$.`,
      onSolved,
    };
  }

  columnStep(key, { label, prompt, basis = false, nolCheck = false }) {
    return {
      kind: 'fields',
      label,
      prompt,
      fieldsLayout: basis ? undefined : 'column',
      fields: basis
        ? AXES.map((axis, i) => ({ key: `c${axis}`, label: null, suffix: `$\\hat{${'ijk'[i]}}${i < 2 ? '\\;+' : ''}$`, mode: 'integer', aria: `Koefisien ${'ijk'[i]}` }))
        : componentFields(3),
      check: (values) => {
        const s = componentValues(values, 3);
        const i = firstWrong(s, key);
        if (i < 0) return true;
        const wrong = wrongKeys(s, key);
        if (nolCheck) {
          const zero = key.indexOf(0);
          const shifted = key.filter((n) => n !== 0).concat([0]);
          if (zero >= 0 && firstWrong(s, shifted) < 0) return { toast: 'nolTergeser', wrong };
        }
        const sorted = (arr) => arr.map((n) => S.toNumber(n)).slice().sort((a, b) => a - b).join();
        if (sorted(s) === sorted(key) && S.toNumber(s[i]) !== -key[i]) return { toast: 'urutanSumbu', wrong };
        if (S.toNumber(s[i]) === -key[i]) return { toast: 'tandaKomponen', values: { sumbu: AXIS_NAME[i] }, wrong };
        return { toast: 'komponenSalah', values: { sumbu: AXIS_NAME[i] }, wrong };
      },
      hint: () => ({
        text: `Urutannya selalu: ${basis ? '$\\hat{i}$' : 'baris atas'} = maju/mundur ($X$), ${basis ? '$\\hat{j}$' : 'baris tengah'} = kanan/kiri ($Y$), ${basis ? '$\\hat{k}$' : 'baris bawah'} = naik/turun ($Z$). Mundur, kiri, dan turun bertanda **minus**; arah yang tidak dilalui ditulis $0$.`,
        fields: 'wrong',
      }),
      summary: () => (basis
        ? `$\\vec{v} = ${V.toLatex(V.fromArray(key), { style: 'ijk' })}$`
        : `$\\vec{v} = ${texColumn(key)}$`),
    };
  }

  lengthField(sumSq, { label, prompt, plain, simplest = false, onSolved, hintText }) {
    const length = S.fromSquare(sumSq);
    return {
      kind: 'fields',
      label,
      prompt,
      hint: () => ({
        text: `${hintText || ''} Hasilnya akar dari $${sumSq}$${simplest && S.squareFreeSplit(sumSq).outside > 1 ? `; sederhanakan: $${sumSq} = ${S.squareFreeSplit(sumSq).outside ** 2} \\times ${S.squareFreeSplit(sumSq).inside}$` : ''}. Tekan **√** untuk menulis akar.`.trim(),
        fields: ['len'],
      }),
      fields: [{ key: 'len', label: '$=$', mode: 'surd' }],
      check: (values) => {
        const verdict = Val.checkExactAnswer(values.len.raw, length, { requireSimplest: simplest });
        if (verdict.correct) return true;
        if (verdict.code === 'not-simplest') return { toast: 'belumDisederhanakan', values: { radikan: sumSq } };
        if (verdict.code === 'decimal') return { toast: 'terlanjurDesimal' };
        if (same(values.len.value, sumSq) && sumSq !== 1) return { toast: 'belumDiakar' };
        if (plain !== undefined && same(values.len.value, plain)) return { toast: 'lupaKuadrat' };
        return { toast: 'panjangSalah' };
      },
      summary: () => `$\\sqrt{${sumSq}} = ${S.toLatexS(length)}$`,
      onSolved,
    };
  }

  /** Panah O→P digambar + balok bantu + titik P; penanda drone dihapus. */
  async revealPoint(P, name) {
    if (this.mover) { this.mover.remove(); this.mover = null; }
    this.space.box(P);
    this.space.point(P, { label: name });
    const arrow = this.space.arrow([0, 0, 0], [0, 0, 0], { label: `\\overrightarrow{O${name}}`, tone: 'blue' });
    await arrow.grow(P, stillMotion() ? 0 : ARROW_MS);
  }

  buildSteps(c) {
    if (c.kind === 'drone') {
      const P = c.P;
      const floor = [P[0], P[1], 0];
      const floorSq = P[0] ** 2 + P[1] ** 2;
      const floorLen = S.fromSquare(floorSq);
      const floorNum = S.toNumber(floorLen);
      const sq = (n) => (n < 0 ? `(${n})^2` : `${n}^2`);
      return [
        this.padStep(c, {
          prompt: `Perintah drone: **${c.say}**. Kemudikan dengan tombol arah, lalu tekan **Periksa**.`,
          intro: 'Perhatikan ruang tiga dimensi ini: ada sumbu $X$, $Y$, dan sumbu baru $Z$ yang tegak ke atas. Satu tekan = **satu satuan**; geser ruangnya untuk melihat dari sisi lain.',
          onSolved: () => this.revealPoint(P, 'P'),
        }),
        this.columnStep(P, {
          label: 'Kolom tiga baris',
          prompt: 'Tepat! Posisi drone kini $P$, pojok sebuah balok. Tulis $\\overrightarrow{OP}$ sebagai **vektor kolom** — sekarang ada **tiga** baris: $x$, $y$, lalu $z$.',
        }),
        {
          ...this.columnStep(P, {
            label: 'Basis $\\hat{i},\\, \\hat{j},\\, \\hat{k}$',
            prompt: 'Di ruang ada vektor basis baru, $\\hat{k}$: satu langkah **naik** searah sumbu $Z$. Tulis $\\overrightarrow{OP}$ dengan $\\hat{i}$, $\\hat{j}$, dan $\\hat{k}$.',
            basis: true,
          }),
          onSolved: () => {
            [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach((u, i) => this.space.arrow([0, 0, 0], u, { label: `\\hat{${'ijk'[i]}}`, tone: 'cyan', labelOffset: [12, -10] }));
          },
        },
        this.lengthField(floorSq, {
          label: 'Diagonal lantai',
          prompt: 'Kita hitung panjangnya dengan Pythagoras **dua kali**. Pertama: berapa panjang garis dari $O$ ke bayangan $P$ di lantai?',
          intro: `Bayangan $P$ di lantai adalah $${tuple3(floor)}$ — titik tepat di bawah drone.`,
          plain: Math.abs(P[0]) + Math.abs(P[1]),
          hintText: `Di lantai ada segitiga siku-siku dengan sisi $${Math.abs(P[0])}$ dan $${Math.abs(P[1])}$: panjangnya $\\sqrt{${sq(P[0])} + ${sq(P[1])}}$.`,
          onSolved: () => {
            this.space.polygon([[0, 0, 0], [P[0], 0, 0], floor], { tone: 'cyan' });
            this.space.segment([0, 0, 0], floor, { tone: 'cyan' });
          },
        }),
        this.lengthField(floorSq + P[2] ** 2, {
          label: 'Diagonal ruang',
          prompt: `Kedua, garis lantai ($${S.toLatexS(floorLen)}$) dan tinggi drone ($${P[2]}$) membentuk segitiga siku-siku **tegak**. Berapa $|\\overrightarrow{OP}|$?`,
          plain: floorNum + Math.abs(P[2]),
          hintText: `Segitiga tegak itu punya sisi $${S.toLatexS(floorLen)}$ dan $${P[2]}$: panjangnya $\\sqrt{${S.toLatexS(floorLen)}^2 + ${P[2]}^2}$.`,
          onSolved: async () => {
            this.space.polygon([[0, 0, 0], floor, P], { tone: 'amber' });
            await this.space.setView('samping');
          },
        }),
      ];
    }

    if (c.kind === 'zero') {
      const P = c.P;
      const sumSq = P.reduce((a, n) => a + n * n, 0);
      return [
        this.padStep(c, {
          prompt: `Drone berikutnya. Perintahnya: **${c.say}**. Kemudikan drone, lalu tekan **Periksa**.`,
          onSolved: () => this.revealPoint(P, 'Q'),
        }),
        this.columnStep(P, {
          label: 'Kolom (ada nolnya)',
          prompt: 'Tulis $\\overrightarrow{OQ}$ sebagai vektor kolom. Arah yang **tidak** dilalui tetap punya barisnya sendiri, diisi $0$.',
          nolCheck: true,
        }),
        this.lengthField(sumSq, {
          label: 'Panjang $\\overrightarrow{OQ}$',
          prompt: 'Dua kali Pythagoras tadi bisa diringkas menjadi satu rumus: $|\\vec{v}| = \\sqrt{x^2 + y^2 + z^2}$. Hitung $|\\overrightarrow{OQ}|$.',
          plain: P.reduce((a, n) => a + Math.abs(n), 0),
          simplest: true,
          hintText: `$|\\overrightarrow{OQ}| = \\sqrt{${P.map((n) => (n < 0 ? `(${n})^2` : `${n}^2`)).join(' + ')}}$.`,
        }),
      ];
    }

    const { A, B } = c;
    const key = B.map((b, i) => b - A[i]);
    const sumSq = key.reduce((a, n) => a + n * n, 0);
    return [
      {
        kind: 'fields',
        label: '$\\overrightarrow{AB} = B - A$',
        prompt: 'Rumus **ujung − pangkal** tetap berlaku di ruang. Tentukan $\\overrightarrow{AB}$.',
        intro: 'Sama seperti sub-topik 3, hanya sekarang ada tiga baris: $x$, $y$, dan $z$.',
        fieldsLayout: 'column',
        fields: componentFields(3),
        check: (values) => {
          const s = componentValues(values, 3);
          if (firstWrong(s, key) < 0) return true;
          const wrong = wrongKeys(s, key);
          if (firstWrong(s, key.map((n) => -n)) < 0) return { toast: 'tandaTerbalik', values: { nama: 'AB', kebalikan: 'BA' }, wrong };
          return { toast: 'hasilSalah', wrong };
        },
        hint: () => ({
          text: `$x = ${B[0]} - ${A[0]}$, $y = ${B[1] < 0 ? `(${B[1]})` : B[1]} - ${A[1]}$, $z = ${B[2]} - ${A[2]}$ — koordinat $B$ dikurangi koordinat $A$.`,
          fields: 'wrong',
        }),
        summary: () => `$\\overrightarrow{AB} = ${texColumn(key)}$`,
        onSolved: async () => {
          const corner1 = [B[0], A[1], A[2]];
          const corner2 = [B[0], B[1], A[2]];
          this.space.segment(A, corner1, { dashed: true, tone: 'amber' });
          this.space.segment(corner1, corner2, { dashed: true, tone: 'amber' });
          this.space.segment(corner2, B, { dashed: true, tone: 'amber' });
          const arrow = this.space.arrow(A, A, { label: '\\overrightarrow{AB}', tone: 'blue' });
          await arrow.grow(B, stillMotion() ? 0 : ARROW_MS);
        },
      },
      this.lengthField(sumSq, {
        label: 'Panjang $\\overrightarrow{AB}$',
        prompt: 'Hitung panjangnya dalam bentuk akar **paling sederhana**.',
        intro: 'Pakai rumus panjang di ruang: $\\sqrt{x^2 + y^2 + z^2}$.',
        plain: key.reduce((a, n) => a + Math.abs(n), 0),
        simplest: true,
        hintText: `$|\\overrightarrow{AB}| = \\sqrt{${key.map((n) => (n < 0 ? `(${n})^2` : `${n}^2`)).join(' + ')}}$.`,
      }),
    ];
  }
}

export const ENGINES = {
  notation_guided: GuidedNotationSim,
  position_guided: GuidedPositionSim,
  magnitude_guided: GuidedMagnitudeSim,
  unit_guided: GuidedUnitSim,
  space_guided: GuidedSpaceSim,
};
