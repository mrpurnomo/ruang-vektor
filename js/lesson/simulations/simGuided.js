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
 *   notation_guided   Satu vektor, tiga baju (kolom · basis · pasangan)
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
} from './guidedKit.js';

/* ============================================================
   2. notation_guided — Satu vektor, tiga "baju"

   Kasus 1 (terpandu): perintah kalimat "4 ke kanan, 3 ke bawah" → siswa
   mengetuk ujungnya → lompatan + panah → menulis kolom → basis (ubin î, ĵ
   baru muncul sesudah benar) → memilih pasangan. Rak "tiga baju" terisi
   satu per satu. Kasus 2 (LKPD): vektor yang sama digambar dari pangkal
   P(2, −4) → penemuan VEKTOR BEBAS. Kasus 3: bentuk baku (koefisien 1,
   komponen nol).
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

/** Rak "tiga baju": slot kolom · basis · pasangan, terisi sesudah benar. */
function notationShelf() {
  const root = el('div', 'notation-shelf');
  const slots = {};
  [['kolom', 'Kolom'], ['basis', 'Basis $\\hat{i},\\, \\hat{j}$'], ['pasangan', 'Pasangan']].forEach(([key, title]) => {
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
    return { build: 'Tiga baju', shift: 'Pangkal P', tidy: 'Bentuk baku' }[c.kind];
  }

  caseSuccessKey(c) {
    return { build: 'success', shift: 'successBebas', tidy: 'successBaku' }[c.kind];
  }

  caseDonePrompt(c, allDone) {
    if (c.kind === 'build') {
      return `**Satu vektor, tiga baju**: $${texColumn(c.v)} = ${basisTex(c.v)} = ${texTuple(c.v)}$. Ketiganya menggambar panah yang **sama**.`;
    }
    if (c.kind === 'shift') {
      return '**Vektor itu bebas**: panah dari $O$ dan panah dari $P$ punya langkah yang sama, jadi keduanya vektor yang **sama**.';
    }
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'shift') return 'Hebat! Sekarang gambar vektor yang **tidak** berangkat dari $O$.';
    return 'Terakhir: rapikan penulisannya menjadi **bentuk baku**.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: '3 Bentuk Penulisan Dikuasai',
      recap: [
        'Satu vektor, tiga baju: **kolom**, **basis** $\\hat{i},\\, \\hat{j}$, dan **pasangan**',
        'Komponen **pertama** mendatar ($x$, $\\hat{i}$), **kedua** tegak ($y$, $\\hat{j}$)',
        'Vektor **bebas**: boleh digambar dari pangkal mana pun',
      ],
    };
  }

  setupCase(c) {
    this.ghostFromO = null;
    this.marks = { O: this.drawPoint([0, 0], { label: 'O', essential: true }) };
    if (c.kind === 'build') {
      // Perintahnya sudah berdiri di panduan; kolom kerja cukup memuat rak
      // "tiga baju" (di 740×360 blok perintah mendorong isian ke bawah lipatan).
      this.shelf = notationShelf();
      this.givenEl.appendChild(this.shelf.root);
    } else if (c.kind === 'shift') {
      this.givenEl.appendChild(givenBlock(tex(`\\vec{v} = ${basisTex(c.v)} \\qquad P${texTuple(c.start)}`), 'sim-given--display'));
      this.marks.P = this.drawPoint(c.start, { label: 'P', essential: true });
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

  /** Ubin vektor satuan: v₁ salinan î mendatar, lalu v₂ salinan ĵ tegak. */
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
        prompt: `Vektor $\\vec{a}$ berpangkal di $O$ dan bergerak **${c.say}**. **Ketuk titik ujungnya.**`,
        intro: 'Hitung kotak kisinya dari $O$: **mendatar** dulu, baru **tegak**.',
        check: (p) => this.checkTip(p, [0, 0], v),
        summary: () => `Ujung $\\vec{a}$ di $${texTuple(v)}$.`,
        onSolved: async () => {
          this.drawPoint(v, { ghost: true });
          await animateHops(this, [0, 0], v);
          await this.drawResult([0, 0], v, 'a');
        },
      },
      {
        kind: 'fields',
        label: 'Baju 1: kolom',
        prompt: 'Tulis $\\vec{a}$ sebagai **vektor kolom**: langkah **mendatar** di atas, langkah **tegak** di bawah — lengkap dengan tandanya.',
        fieldsLayout: 'column',
        fields: this.columnFields(),
        check: (values) => this.checkColumn(values, v),
        summary: () => `Kolom: $\\vec{a} = ${texColumn(v)}$`,
        onSolved: () => this.shelf.fill('kolom', texColumn(v)),
      },
      {
        kind: 'fields',
        label: 'Baju 2: basis',
        prompt: 'Sekarang dengan **vektor basis**: $\\hat{i}$ = satu langkah searah sumbu $X$, $\\hat{j}$ = satu langkah searah sumbu $Y$. Berapa $\\hat{i}$ dan berapa $\\hat{j}$?',
        fields: [
          { key: 'cx', label: null, suffix: '$\\hat{i}\\;+$', mode: 'integer', aria: 'Koefisien i' },
          { key: 'cy', label: null, suffix: '$\\hat{j}$', mode: 'integer', aria: 'Koefisien j' },
        ],
        check: (values) => this.checkColumn(values, v),
        summary: () => `Basis: $\\vec{a} = ${basisTex(v)}$`,
        onSolved: async () => {
          await this.drawBasisTiles(v);
          this.shelf.fill('basis', basisTex(v));
        },
      },
      {
        kind: 'choice',
        label: 'Baju 3: pasangan',
        prompt: 'Terakhir, pilih penulisan **pasangan berurutan** yang tepat untuk $\\vec{a}$.',
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
        summary: () => `Pasangan: $\\vec{a} = ${texTuple(v)}$`,
        onSolved: () => {
          this.shelf.fill('pasangan', texTuple(v));
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
        label: 'Kolom dari basis',
        prompt: `Tulis $\\vec{v} = ${basisTex(v)}$ sebagai **vektor kolom** lebih dulu.`,
        fieldsLayout: 'column',
        fields: this.columnFields(),
        check: (values) => this.checkColumn(values, v, { fromBasis: true }),
        summary: () => `$\\vec{v} = ${texColumn(v)}$`,
      },
      {
        kind: 'pick',
        label: 'Gambar dari $P$',
        prompt: `Gambar $\\vec{v}$ dengan **pangkal di $P${texTuple(start)}$** — bukan di $O$. **Ketuk titik ujungnya.**`,
        intro: 'Mulai menghitung kotak dari **$P$**: mendatar dulu, baru tegak.',
        check: (p) => this.checkTip(p, start, v, { fromOrigin: true }),
        summary: () => `Dari $P$, ujung $\\vec{v}$ jatuh di $${texTuple(end)}$.`,
        onSolved: async () => {
          this.drawPoint(end, { ghost: true });
          await animateHops(this, start, v);
          await this.drawResult(start, v, 'v');
        },
      },
      {
        kind: 'choice',
        label: 'Bandingkan',
        prompt: 'Panah yang sama kini digambar **dari $O$** (biru muda). Apa hubungan panah dari $O$ dan panah dari $P$?',
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
        summary: () => 'Vektor **bebas**: pangkal boleh di mana saja.',
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
        prompt: `Tulis $\\vec{v} = ${basisTex(v)}$ sebagai **vektor kolom**. Perhatikan suku yang **tidak** bertuliskan angka.`,
        fieldsLayout: 'column',
        fields: this.columnFields(),
        check: (values) => this.checkColumn(values, v, { fromBasis: true }),
        summary: () => `$\\vec{v} = ${texColumn(v)}$`,
        onSolved: () => this.drawResult([0, 0], v, 'v'),
      },
      {
        kind: 'choice',
        label: 'Basis baku $\\vec{w}$',
        prompt: `Tulis $\\vec{w} = ${texTuple(w)}$ dalam **bentuk basis yang baku** — paling ringkas tanpa mengubah nilainya.`,
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
        summary: () => `$\\vec{w} = ${texColumn(w)}$ — angka $0$ tetap ditulis.`,
      },
    ];
  }
}

/* ============================================================
   3. position_guided — Vektor posisi & "ujung dikurangi pangkal"

   Kasus 1 (terpandu, inkuiri): tandai A dan B → gambar vektor posisi
   a = OA → gambar AB → hitung langkahnya di kisi (lompatan dari A) →
   lengkapi pola "6 = 8 − 2" → siswa MENEMUKAN AB = B − A sendiri.
   Kasus 2: hitung dulu, buktikan di kisi (LKPD 5) + vektor lawan.
   Kasus 3: koordinat ratusan — tanpa kisi, rumus menyelamatkan.
   Kasus 4: rumus dibalik — mencari titik PANGKAL (LKPD 6).
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
      xRange: [Math.min(...xs) - 2, Math.max(...xs) + 2],
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
      return '**Kamu menemukan rumusnya sendiri:** $\\overrightarrow{AB} = \\vec{b} - \\vec{a}$ — koordinat **ujung** dikurangi koordinat **pangkal**.';
    }
    if (c.kind === 'nogrid') {
      return 'Tanpa kertas berpetak pun beres: **ujung − pangkal** untuk vektor, **pangkal + vektor** untuk titik ujung.';
    }
    return super.caseDonePrompt(c, allDone);
  }

  nextCaseInvite(next) {
    if (next.kind === 'formula') return 'Hebat! Sekarang **hitung dulu** dengan rumusmu, baru buktikan di kisi.';
    if (next.kind === 'nogrid') return 'Bagaimana kalau koordinatnya **ratusan**? Kertas berpetak tidak cukup lagi.';
    return 'Terakhir: rumusnya **dibalik** — cari titik pangkalnya.';
  }

  celebration() {
    return {
      ...super.celebration(),
      badge: 'Rumus Ujung − Pangkal Ditemukan',
      recap: [
        '**Vektor posisi** titik $A$: $\\vec{a} = \\overrightarrow{OA}$, pangkalnya di $O$',
        '$\\overrightarrow{AB} = \\vec{b} - \\vec{a}$: koordinat **ujung** dikurangi **pangkal**',
        'Dibalik: ujung $= A + \\overrightarrow{AB}$, pangkal $= B - \\overrightarrow{AB}$',
      ],
    };
  }

  setupCase(c) {
    this.marks = {};
    if (this.plane) this.marks.O = this.drawPoint([0, 0], { label: 'O', essential: true });
    if (c.kind === 'discover') {
      this.givenEl.appendChild(givenBlock(mixed(`Denah sekolah: gerbang $O(0,\\, 0)$, kelas ${pointName('A', c.A)}, kantin ${pointName('B', c.B)}.`)));
    } else if (c.kind === 'formula') {
      this.givenEl.appendChild(givenBlock(tex(`P${texTuple(c.P)} \\qquad Q${texTuple(c.Q)}`), 'sim-given--display'));
      this.marks.P = this.drawPoint(c.P, { label: 'P', essential: true });
      this.marks.Q = this.drawPoint(c.Q, { label: 'Q', essential: true });
    } else if (c.kind === 'nogrid') {
      this.givenEl.appendChild(givenBlock(tex(`K${texTuple(c.K)} \\qquad L${texTuple(c.L)}`), 'sim-given--display'));
      this.givenEl.appendChild(givenBlock('Koordinat sebesar ini tidak muat di kertas berpetak — hanya rumus yang bisa menolongmu.', 'sim-given--muted'));
    } else {
      this.givenEl.appendChild(givenBlock(tex(`\\overrightarrow{RS} = ${texColumn(c.RS)} \\qquad S${texTuple(c.S)}`), 'sim-given--display'));
      this.marks.S = this.drawPoint(c.S, { label: 'S', essential: true });
    }
  }

  /** Ketuk letak titik bernama; kesalahan "tertukar" dikenali. */
  pickPoint(name, target) {
    return {
      kind: 'pick',
      label: `Titik $${name}$`,
      prompt: `Ketuk letak titik ${pointName(name, target)} pada denah.`,
      check: (p) => {
        if (samePoint(p, target)) return true;
        if (samePoint(p, [target[1], target[0]])) return { toast: 'koordinatTertukar', values: { titik: tapped(p) } };
        return { toast: 'titikMeleset', values: { titik: tapped(p) } };
      },
      summary: () => `${pointName(name, target)} ditandai.`,
      onSolved: () => {
        this.marks[name] = this.drawPoint(target, { label: name, essential: true });
      },
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
      summary,
      onSolved: async () => {
        const P = points()[from];
        const Q = points()[to];
        const name = from === 'O' ? to.toLowerCase() : `${from}${to}`;
        const arrow = this.drawVector({ from: P, to: P, name, tone }, { essential: true });
        await arrow.setVector({ from: P, to: Q }, { animate: !stillMotion(), duration: ARROW_MS });
        if (arrow.labelEl) springPop(arrow.labelEl.firstChild.firstChild);
        if (after) await after();
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
      this.pickPoint('A', A),
      this.pickPoint('B', B),
      this.drawStep('O', 'A', {
        label: 'Vektor posisi $\\vec{a}$',
        prompt: 'Vektor yang **pangkalnya di $O$** disebut **vektor posisi**. Gambar vektor posisi titik $A$: ketuk $O$, lalu $A$.',
        summary: () => 'Vektor posisi $\\vec{a} = \\overrightarrow{OA}$.',
        tone: 'cyan',
        points,
      }),
      this.drawStep('A', 'B', {
        label: 'Gambar $\\overrightarrow{AB}$',
        prompt: 'Kamu berangkat dari **kelas**, bukan dari gerbang. Gambar $\\overrightarrow{AB}$: dari $A$ menuju $B$.',
        summary: () => '$\\overrightarrow{AB}$ tergambar — dan vektor posisi $\\vec{b}$ ikut muncul.',
        points,
        after: async () => {
          const b = this.drawVector({ from: [0, 0], to: [0, 0], name: 'b', tone: 'cyan' }, { essential: true });
          await b.setVector({ to: B }, { animate: !stillMotion(), duration: ARROW_MS });
        },
      }),
      {
        kind: 'fields',
        label: 'Hitung di kisi',
        prompt: 'Hitung kotak kisinya: dari $A$ ke $B$, **berapa satuan mendatar** dan **berapa satuan tegak**?',
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
        summary: () => `Dari $A$ ke $B$: $${key[0]}$ ${DIRECTION.x(key[0])}, $${key[1]}$ ${DIRECTION.y(key[1])}.`,
        onSolved: () => animateHops(this, A, key),
      },
      {
        kind: 'fields',
        label: 'Temukan polanya',
        prompt: `Dari mana angka $${key[0]}$ dan $${key[1]}$ itu muncul? Lengkapi dengan **koordinat** $A$ dan $B$.`,
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
          prompt: 'Pakai rumus temuanmu: $\\overrightarrow{PQ} = Q - P$, komponen demi komponen.',
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
        prompt: 'Sekarang $\\overrightarrow{QP}$ — berangkat dari $Q$ menuju $P$.',
        fields: componentFields(2),
        check: (values) => {
          const s = componentValues(values, 2);
          const want = key.map((n) => -n);
          if (firstWrong(s, want) < 0) return true;
          if (firstWrong(s, key) < 0) return { toast: 'lawanSama', wrong: ['cx', 'cy'] };
          return { toast: 'hasilSalah', wrong: wrongKeys(s, want) };
        },
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
        prompt: 'Tentukan $\\overrightarrow{KL}$ tanpa menggambar.',
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
        prompt: '$R$ adalah **pangkal** dan $S$ **ujung**, jadi $\\overrightarrow{RS} = S - R$. Balik rumusnya: tentukan koordinat $R$.',
        fields: componentFields(2, { label: (a) => `$${a}_R$` }),
        check: (values) => {
          const s = componentValues(values, 2);
          if (firstWrong(s, R) < 0) return true;
          const plus = S.map((v, i) => v + RS[i]);
          if (firstWrong(s, plus) < 0) return { toast: 'pangkalBukanUjung', wrong: ['cx', 'cy'] };
          return { toast: 'hasilSalah', wrong: wrongKeys(s, R) };
        },
        summary: () => `$R = S - \\overrightarrow{RS} = ${texTuple(R)}$`,
      },
      {
        kind: 'pick',
        label: 'Buktikan di bidang',
        prompt: 'Buktikan jawabanmu: **ketuk titik $R$** pada bidang. Dari sana, $\\overrightarrow{RS}$ harus tiba tepat di $S$.',
        check: (p) => (samePoint(p, R) ? true : { toast: 'titikMeleset', values: { titik: tapped(p) } }),
        summary: () => `Dari $R$, langkah $\\overrightarrow{RS}$ tiba tepat di $S$.`,
        onSolved: async () => {
          this.marks.R = this.drawPoint(R, { label: 'R', essential: true });
          await animateHops(this, R, RS);
          const arrow = this.drawVector({ from: R, to: R, name: 'RS', tone: 'blue' }, { essential: true });
          await arrow.setVector({ from: R, to: S }, { animate: !stillMotion(), duration: ARROW_MS });
        },
      },
    ];
  }
}

export const ENGINES = {
  notation_guided: GuidedNotationSim,
  position_guided: GuidedPositionSim,
};
