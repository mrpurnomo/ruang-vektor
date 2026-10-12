/**
 * lesson/simulations/simKit.js — Kerangka bersama 25 engine simulasi vektor.
 *
 * Setiap simulasi di Ruang Vektor punya bentuk yang sama:
 *
 *   KASUS → LANGKAH → INTERAKSI → PEMERIKSAAN → UMPAN BALIK → KONFIRMASI VISUAL
 *
 * Berkas ini memegang seluruh alur itu sekali saja. Engine (simBasics.js,
 * simOperations.js, simProducts.js, simModeling.js) hanya MENDEKLARASIKAN:
 * data apa yang digambar, langkah apa yang dikerjakan, cara memeriksanya,
 * dan apa yang boleh digambar SESUDAH jawabannya benar.
 *
 * ------------------------------------------------------------
 * EMPAT KONTRAK YANG DITEGAKKAN DI SINI, BUKAN DI TIAP ENGINE
 * ------------------------------------------------------------
 * 1. AKSIOMA — aplikasi tidak menghitung untuk siswa. Langkah berikutnya,
 *    gambar hasil, dan kalimat sukses hanya muncul lewat `solveStep()`,
 *    yang hanya dipanggil pemeriksa yang LOLOS. Tidak ada jalur lain.
 * 2. LABEL PINTAR — `drawVector()` kit menilai skala bidang. Di bawah
 *    COMPACT_SCALE px/satuan (ponsel lanskap), hanya label yang ditandai
 *    `essential` yang tampil. Dinilai ulang setiap bidang berubah ukuran.
 * 3. NOL PERGESERAN — bidang SVG duduk di kolomnya sendiri dengan tinggi
 *    tercadangkan. Isian, pilihan, dan jejak langkah hanya tumbuh di kolom
 *    kerja; tombol "kasus berikutnya" dicadangkan dan hanya di-visibility.
 * 4. BERSIH — semua listener, bidang, papan angka, dan timer milik kasus
 *    dilepas saat kasus berganti DAN saat simulasi dihancurkan.
 */

import { Simulation, el, makeTappable } from './simCore.js';
import { createVectorPlane } from '../../domain/plane/vectorPlane.js';
import { attachMathpad, closeMathpad, isMathpadOpen } from '../../core/ui/mathpad.js';
import { renderMixed, renderToString } from '../../core/render/katexRenderer.js';
import { fillTemplate } from '../../core/text.js';
import { icon } from '../../core/ui/icons.js';
import toast from '../../core/ui/toast.js';
import { rejectShake } from '../../core/interactions/flyToAnimation.js';
import sfx from '../../core/ui/sfx.js';
import * as S from '../../domain/surd.js';
import * as V from '../../domain/vector.js';

/** Di bawah skala ini (px per satuan) label non-esensial disembunyikan. */
export const COMPACT_SCALE = 26;

const DEFAULTS = {
  empty: 'Masih ada kotak yang kosong. Isi semuanya lebih dulu, baru periksa.',
  unreadable: 'Isian itu belum berupa bilangan yang utuh. Bentuk akar ditulis lengkap, misalnya $3\\sqrt{2}$.',
  wrong: 'Belum tepat — telusuri lagi langkahmu satu per satu.',
  pickFirst: 'Pilih salah satu jawaban lebih dulu, baru periksa.',
};

/* ============================================================
   UTILITAS MATEMATIKA & TAMPILAN
   ============================================================ */

export const tex = (source) => renderToString(source);
export const mixed = (text) => renderMixed(text);

/** Nilai eksak dari teks isian papan angka, atau null. */
export function exact(raw) {
  return S.parseSurd(raw);
}

/** Kesetaraan eksak yang aman terhadap isian tak terbaca. */
export function same(a, b) {
  try {
    return S.equalsS(a, b);
  } catch {
    return false;
  }
}

/** Bilangan → teks LaTeX eksak (pecahan & akar ikut). */
export function texNum(value) {
  return S.toLatexS(S.parseSurd(value));
}

/** [x, y, (z)] → LaTeX vektor kolom. */
export function texColumn(components) {
  return V.toLatex(V.fromArray(components), { style: 'column' });
}

/**
 * Vektor kolom SIMBOLIK ("2m", "m+3") — hanya untuk ditampilkan.
 * texColumn() melewati vector.js yang dengan benar menolak komponen bukan
 * bilangan; vektor berparameter memang tidak boleh dihitung, cukup ditulis.
 */
export function texColumnRaw(components) {
  return `\\begin{pmatrix} ${components.join(' \\\\ ')} \\end{pmatrix}`;
}

export function texTuple(components) {
  return V.toLatex(V.fromArray(components), { style: 'tuple' });
}

export const AXES = ['x', 'y', 'z'];

/* ============================================================
   KELAS DASAR
   ============================================================ */

export class CaseSimulation extends Simulation {
  constructor(container, config, toasts, onComplete) {
    super(container, config, toasts, onComplete);
    // "Selesai" berlaku per KASUS; kit yang mengunci per kasus.
    this.locksOnComplete = false;
    this.caseIndex = 0;
    this.solved = new Set();
    this.plane = null;
    this.steps = [];
    this.stepIndex = 0;
    this.caseCleanups = [];
    this.stepCleanups = [];
    this.labelled = [];
  }

  /* ---------- untuk ditimpa engine ---------- */

  /** Daftar kasus. Kebanyakan engine memakai `config.cases`. */
  get cases() {
    return this.config.cases || [];
  }

  caseLabel(c, i) {
    return `Kasus ${i + 1}`;
  }

  /** Apakah kasus ini memakai bidang kartesius? Bawaan: ada rentang & semua 2D. */
  usesPlane() {
    return Boolean(this.config.xRange);
  }

  planeOptions() {
    return { xRange: this.config.xRange || [-6, 6], yRange: this.config.yRange || [-4, 4] };
  }

  /** Tampilkan data soal (bidang, teks). Dipanggil sekali per kasus. */
  setupCase() {}

  /** @returns {Array<object>} deskriptor langkah — lihat komentar di atas berkas. */
  buildSteps() {
    return [];
  }

  /**
   * Isi panduan di panggung saat kasus tuntas. Panduan itu MENEMPEL dan
   * selalu terlihat, jadi engine boleh menaruh kesimpulan kasusnya di sini
   * (mis. "Inilah vektor…") alih-alih di kolom kerja yang bisa tergulir.
   */
  caseDonePrompt(c, allDone) {
    return allDone
      ? 'Semua kasus selesai. Lanjutkan ke Mini Kuis, atau buka kasus mana pun untuk mengulang.'
      : 'Kasus ini selesai. Lanjut ke kasus berikutnya.';
  }

  /**
   * Isi selebrasi saat SEMUA kasus tuntas — hanya yang bisa ditelusuri
   * siswa (Kontrak 11): berapa kasus & langkah yang ia tuntaskan sendiri,
   * dan nama kasusnya. Tidak ada skor, persentase, atau lencana koleksi.
   * Engine boleh menimpa `badge` dan `recap` (deret teks bermarkdown).
   */
  celebration() {
    const counts = this.caseStepCounts || {};
    const known = this.cases.every((_, i) => Number.isInteger(counts[i]));
    return {
      badge: `${this.cases.length} Kasus Dikuasai`,
      recap: this.cases.map((c, i) => this.caseLabel(c, i)),
      cases: this.cases.length,
      steps: known ? this.cases.reduce((sum, _, i) => sum + counts[i], 0) : null,
    };
  }

  /** Kalimat ajakan di banner panggung menuju kasus berikutnya (bermarkdown). */
  nextCaseInvite(next, index) {
    return `Berikutnya: **${this.caseLabel(next, index)}**.`;
  }

  /** Kunci toast sukses per kasus (bawaan 'success'). */
  caseSuccessKey() {
    return 'success';
  }

  /* ---------- siklus hidup ---------- */

  build() {
    this.root = el('div', 'sim sim-kit');
    this.container.appendChild(this.root);

    // INSTRUKSI HIDUP DI PANGGUNG, BUKAN DI SIDEBAR.
    // Terukur di kelas: mata siswa terkunci pada kanvas, dan kolom kiri
    // praktis tidak pernah dibaca — mereka mengerjakan simulasi sambil
    // menebak apa yang diminta. Panel kiri kini berisi STATUS (daftar
    // langkah, pemilih kasus), sedangkan perintah yang sedang berjalan
    // menempel di atas kanvas tempat tangannya bekerja.
    this.guideEl = el('div', 'sim-guide');
    this.promptStep = el('span', 'sim-guide__step');
    this.promptText = el('span', 'sim-guide__text');
    this.guideEl.append(this.promptStep, this.promptText);

    if (this.cases.length > 1) this.caseBar = this.addHint(this.buildCaseBar());

    this.checklist = this.addHint(el('ol', 'sim-steps'));

    // Tombol kasus berikutnya DICADANGKAN: ia selalu ada, hanya terlihat saat
    // boleh dipakai. Memunculkannya dengan append akan mendorong panel.
    this.nextCaseBtn = el('button', 'btn btn--primary btn--sm case-next');
    this.nextCaseBtn.type = 'button';
    this.nextCaseBtn.dataset.simAction = 'next-case';
    this.nextCaseBtn.innerHTML = `<span>Kasus berikutnya</span>${icon('arrow-right', { size: 15 })}`;
    this.nextCaseBtn.style.visibility = 'hidden';
    const onNext = () => this.goToCase(this.firstUnsolved());
    this.nextCaseBtn.addEventListener('click', onNext);
    this.track(() => this.nextCaseBtn.removeEventListener('click', onNext));
    this.addHint(this.nextCaseBtn);

    const def = this.definition || {};
    if (def.brief) {
      const brief = el('div', 'sim__brief');
      brief.innerHTML = `${icon('lightbulb', { size: 18 })}<span>${mixed(def.brief)}</span>`;
      this.addHint(brief);
    }

    this.board = el('div', 'sim-board');
    this.planeCol = el('div', 'sim-board__plane');
    this.workCol = el('div', 'sim-board__work');
    this.givenEl = el('div', 'sim-board__given');
    this.trailEl = el('ol', 'sim-board__trail');
    this.inputsEl = el('div', 'sim-board__inputs');
    this.workCol.append(this.givenEl, this.trailEl, this.inputsEl);
    this.board.append(this.guideEl, this.planeCol, this.workCol);
    this.root.appendChild(this.board);

    // Kasus sebagai "langkah" simulasi: pemulihan sesi & laporan posisi.
    // Lompatan pemulihan tetap tunduk pada aturan jangkauan: sesi yang
    // tercatat di kasus 3 tidak boleh membuka kasus 3 kalau kasus 2 belum.
    this.useStepsSilent(this.cases.length, (i) => {
      if (this.isReachable(i)) this.goToCase(i);
    });
    this.track(() => this.disposeCase());

    const saved = this.savedState;
    if (saved && Array.isArray(saved.solved)) {
      saved.solved.filter((i) => i >= 0 && i < this.cases.length).forEach((i) => this.solved.add(i));
    }
    if (this.solved.size === this.cases.length && this.cases.length) {
      // Kunjungan ulang sesudah tuntas: Mini Kuis tetap terbuka, TANPA toast
      // sukses yang berbunyi lagi setiap kali siswa membuka simulasinya.
      this.goToCase(0);
      this.finished = true;
      this.onComplete();
      return;
    }
    this.goToCase(this.firstUnsolved());
  }

  firstUnsolved() {
    for (let i = 0; i < this.cases.length; i += 1) if (!this.solved.has(i)) return i;
    return 0;
  }

  isReachable(i) {
    return this.solved.has(i) || i <= this.firstUnsolved();
  }

  buildCaseBar() {
    const bar = el('div', 'case-bar');
    bar.setAttribute('role', 'tablist');
    // Jumlah kasus untuk CSS: kisi chip di lanskap pendek mengikuti jumlahnya.
    bar.dataset.count = String(this.cases.length);
    this.caseChips = this.cases.map((c, i) => {
      const chip = el('button', 'case-chip');
      chip.type = 'button';
      chip.setAttribute('role', 'tab');
      // `caseLabel` boleh memuat rumus ($\vec{a} + \vec{b}$); tanpa mixed()
      // siswa membaca sumber LaTeX-nya mentah-mentah di pemilih kasus.
      chip.innerHTML = `<b>${mixed(this.caseLabel(c, i))}</b>`;
      const onClick = () => {
        if (!this.isReachable(i) || i === this.caseIndex) return;
        this.goToCase(i);
      };
      chip.addEventListener('click', onClick);
      this.track(() => chip.removeEventListener('click', onClick));
      bar.appendChild(chip);
      return chip;
    });
    return bar;
  }

  syncCaseBar() {
    if (!this.caseChips) return;
    this.caseChips.forEach((chip, i) => {
      const state = i === this.caseIndex ? 'current' : this.solved.has(i) ? 'solved' : this.isReachable(i) ? 'open' : 'locked';
      chip.dataset.state = state;
      chip.disabled = state === 'locked';
      chip.setAttribute('aria-selected', String(i === this.caseIndex));
      // Pembaca layar tidak perlu mendengar tanda dolar pembatas rumus.
      const spoken = String(this.caseLabel(this.cases[i], i)).replace(/\$/g, '');
      chip.setAttribute('aria-label', `${spoken}${this.solved.has(i) ? ' (selesai)' : state === 'locked' ? ' (terkunci)' : ''}`);
      // Chip yang DITUJU berikutnya berdenyut selama kasus ini sudah tuntas.
      const isNext = this.solved.has(this.caseIndex) && i === this.firstUnsolved() && !this.solved.has(i);
      if (isNext) chip.dataset.next = 'true'; else delete chip.dataset.next;
    });
  }

  /** Lepaskan semua milik kasus: listener, bidang, papan angka, timer. */
  disposeCase() {
    this.disposeStep();
    this.caseCleanups.forEach((fn) => { try { fn(); } catch (err) { console.warn('[sim] cleanup kasus:', err); } });
    this.caseCleanups = [];
    if (isMathpadOpen()) closeMathpad(true);
    if (this.plane) {
      this.plane.destroy();
      this.plane = null;
    }
    this.labelled = [];
    this.clearTimers();
    this.releaseAllClaims();
  }

  disposeStep() {
    this.stepCleanups.forEach((fn) => { try { fn(); } catch (err) { console.warn('[sim] cleanup langkah:', err); } });
    this.stepCleanups = [];
  }

  goToCase(index) {
    if (this.destroyed || index < 0 || index >= this.cases.length) return;
    this.disposeCase();
    this.caseIndex = index;
    this.setStep(index);
    this.saveState({ solved: [...this.solved], caseIndex: index });

    const c = this.cases[index];
    this.givenEl.innerHTML = '';
    this.trailEl.innerHTML = '';
    this.inputsEl.innerHTML = '';
    this.planeCol.innerHTML = '';
    this.nextCaseBtn.style.visibility = 'hidden';
    // Kasus baru dibaca dari ATAS: posisi gulir kasus lama membuat data kasus
    // baru tersembunyi di bawah panduan yang menempel (terukur di 740×360).
    for (let n = this.root.parentElement; n; n = n.parentElement) {
      if (n.scrollTop) n.scrollTop = 0;
    }

    const withPlane = this.usesPlane(c, index);
    this.board.classList.toggle('sim-board--plane', withPlane);
    if (withPlane) {
      const host = el('div', 'plane-host');
      this.planeCol.appendChild(host);
      this.plane = createVectorPlane(host, this.planeOptions(c, index));
      const off = this.plane.onLayout(() => this.applyLabelBudget());
      this.caseCleanups.push(off);
    }

    this.setupCase(c, index);
    this.steps = this.buildSteps(c, index).filter(Boolean);
    this.renderChecklist();
    this.syncCaseBar();
    this.stepIndex = 0;
    this.renderStep();
  }

  renderChecklist() {
    this.checklist.innerHTML = '';
    this.checkItems = this.steps.map((step) => {
      const item = el('li', 'sim-steps__item', `<span class="sim-steps__mark"></span><span>${mixed(step.label || '')}</span>`);
      this.checklist.appendChild(item);
      return item;
    });
  }

  syncChecklist() {
    this.checkItems.forEach((item, i) => {
      item.dataset.state = i < this.stepIndex ? 'done' : i === this.stepIndex ? 'active' : 'locked';
    });
  }

  get currentStep() {
    return this.steps[this.stepIndex] || null;
  }

  setPromptText(text, chip) {
    // Chip langkah memuat `caseLabel`, yang boleh berisi rumus — ia pun wajib
    // lewat mixed(), kalau tidak sumber LaTeX-nya terbaca mentah oleh siswa.
    this.promptStep.innerHTML = chip ? mixed(chip) : '';
    this.promptText.innerHTML = mixed(text);
  }

  renderStep() {
    this.disposeStep();
    this.inputsEl.innerHTML = '';
    this.syncChecklist();
    const step = this.currentStep;
    if (!step) return this.caseDone();

    const total = this.steps.length;
    const chip = this.cases.length > 1
      ? `${this.caseLabel(this.cases[this.caseIndex], this.caseIndex)} · Langkah ${this.stepIndex + 1}/${total}`
      : `Langkah ${this.stepIndex + 1}/${total}`;
    this.setPromptText(step.prompt || '', chip);

    const renderers = { fields: 'renderFields', choice: 'renderChoice', multi: 'renderMulti', tap: 'renderTap', pick: 'renderPick' };
    const method = renderers[step.kind];
    if (!method) throw new Error(`Jenis langkah "${step.kind}" tidak dikenal`);
    // Kait penanda: onEnter menyiapkan sorotan langkah (mis. komponen sumber
    // yang sedang dipasangkan), onLeave membersihkannya saat langkah berganti.
    if (typeof step.onEnter === 'function') step.onEnter();
    if (typeof step.onLeave === 'function') this.stepCleanups.push(step.onLeave);
    this[method](step);
  }

  /* ---------- umpan balik ---------- */

  message(result, fallback) {
    if (result && result.message) return fillTemplate(result.message, result.values || {});
    if (result && result.toast && this.toasts[result.toast]) return this.msg(result.toast, result.values || {});
    return fallback;
  }

  fail(result, element) {
    if (element) rejectShake(element);
    sfx.wrong();
    toast.error(this.message(result, DEFAULTS.wrong));
  }

  /**
   * SATU-SATUNYA jalan maju. Dipanggil hanya oleh pemeriksa yang lolos.
   * Kunci `claim` mencegah ketukan ganda memajukan dua langkah sekaligus.
   */
  async solveStep(step, payload) {
    if (!this.claim('solve')) return;
    sfx.tap();
    try {
      if (step.summary) {
        const line = el('li', 'sim-board__trail-item', mixed(step.summary(payload)));
        this.trailEl.appendChild(line);
        // Di lanskap pendek jejak menggulir di dalam tingginya sendiri; tanpa
        // ini baris TERBARU — mis. hasil OA = a — tersembunyi di bawah.
        this.trailEl.scrollTop = this.trailEl.scrollHeight;
      }
      if (typeof step.onSolved === 'function') {
        // Gambar konfirmasi yang gagal TIDAK boleh menahan siswa di langkah
        // yang sudah ia jawab benar. Galatnya dicatat (dan ditangkap uji),
        // pembelajarannya jalan terus.
        try {
          await step.onSolved(payload);
        } catch (err) {
          console.error('[sim] konfirmasi visual gagal:', err);
        }
      }
      if (this.destroyed) return;
      const note = step.successToast ? this.message({ toast: step.successToast, values: step.successValues }, null) : null;
      if (note) toast.success(note);
      // Jeda singkat SEBELUM indeks dinaikkan: selama jeda, status internal
      // dan layar harus tetap menunjuk langkah yang sama.
      if (this.stepIndex + 1 < this.steps.length) await this.wait(180);
      this.stepIndex += 1;
      this.renderStep();
    } finally {
      this.release('solve');
    }
  }

  caseDone() {
    this.syncChecklist();
    const wasSolved = this.solved.has(this.caseIndex);
    this.solved.add(this.caseIndex);
    // Jumlah langkah kasus ini, untuk statistik selebrasi yang bisa ditelusuri.
    this.caseStepCounts = { ...(this.caseStepCounts || {}), [this.caseIndex]: this.steps.length };
    this.saveState({ solved: [...this.solved], caseIndex: this.caseIndex });
    this.syncCaseBar();

    const c = this.cases[this.caseIndex];
    const allDone = this.solved.size === this.cases.length;
    this.setPromptText(this.caseDonePrompt(c, allDone), 'Selesai');
    if (!wasSolved) sfx.success();
    this.inputsEl.innerHTML = '';
    this.inputsEl.appendChild(el('div', 'slide-solved', `${icon('check-circle', { size: 18 })}<span>${mixed(this.caseLabel(c, this.caseIndex))} selesai.</span>`));

    const text = this.msg(this.caseSuccessKey(c, this.caseIndex)) || this.msg('success');
    if (allDone && !this.finished) {
      this.markAllDone(text);
      return;
    }
    if (text && !wasSolved) toast.success(text);
    this.nextCaseBtn.style.visibility = allDone ? 'hidden' : 'visible';
    if (!allDone) this.showNextCaseInvite();
  }

  /**
   * Ajakan ke kasus berikutnya DI PANGGUNG. Tombol di sidebar terukur berada
   * di bawah lipatan panel kiri di 740×360: panduan berkata "lanjut", tetapi
   * tombolnya tidak terlihat. Banner ini duduk di kolom kerja dan digulir
   * masuk ke pandangan; tombol sidebar tetap ada untuk konsistensi.
   */
  showNextCaseInvite() {
    const index = this.firstUnsolved();
    const next = this.cases[index];
    const invite = el('div', 'case-invite');
    invite.appendChild(el('p', 'case-invite__text', mixed(this.nextCaseInvite(next, index))));
    // Berdenyut: kompas mata siswa ke aksi berikutnya.
    const go = el('button', 'btn btn--primary btn--pulse case-invite__go');
    go.type = 'button';
    go.dataset.simAction = 'next-case-stage';
    go.innerHTML = `<span>Lanjut ke ${mixed(this.caseLabel(next, index))}</span>${icon('arrow-right', { size: 16 })}`;
    const onGo = () => this.goToCase(index);
    go.addEventListener('click', onGo);
    this.caseCleanups.push(() => go.removeEventListener('click', onGo));
    invite.appendChild(go);
    this.inputsEl.appendChild(invite);
    this.syncCaseBar();
    go.scrollIntoView({ block: 'nearest' });
  }

  markAllDone(text) {
    this.nextCaseBtn.style.visibility = 'hidden';
    if (this.caseChips) this.syncCaseBar();
    this.complete(text);
  }

  /* ============================================================
     JENIS LANGKAH
     ============================================================ */

  /** Buat satu kotak isian papan angka. `mode`: decimal | fraction | surd. */
  makeInput(spec) {
    const input = document.createElement('input');
    input.placeholder = spec.placeholder || '?';
    input.dataset.simField = spec.key;
    // Label pembaca layar dari teks label yang TERLIHAT, bukan kunci internal
    // ("Isian dx" terbaca di aplikasi — tidak berarti apa pun bagi siswa).
    const plain = String(spec.label || '').replace(/\$|\\[a-zA-Z]+|[{}]/g, '').replace(/\s+/g, ' ').replace(/=\s*$/, '').trim();
    input.setAttribute('aria-label', spec.aria || plain || 'Isian jawaban');
    attachMathpad(input, {
      allowFraction: spec.mode !== 'integer',
      allowSurd: spec.mode === 'surd',
      onCommit: () => input.classList.remove('numfield--no'),
    });
    return input;
  }

  renderFields(step) {
    const inputs = {};
    const wrap = el('div', 'sim-fields');
    if (step.fieldsLayout === 'column') wrap.classList.add('sim-fields--column');

    step.fields.forEach((spec) => {
      const input = this.makeInput(spec);
      inputs[spec.key] = input;
      const cell = el('label', 'sim-field');
      if (spec.label) cell.appendChild(el('span', 'sim-field__label', mixed(spec.label)));
      cell.appendChild(input);
      if (spec.suffix) cell.appendChild(el('span', 'sim-field__suffix', mixed(spec.suffix)));
      wrap.appendChild(cell);
    });

    if (step.intro) this.inputsEl.appendChild(el('div', 'sim-note', mixed(step.intro)));
    this.inputsEl.appendChild(wrap);

    const actions = el('div', 'sim-board__actions');
    const check = el('button', 'btn btn--primary');
    check.type = 'button';
    check.dataset.simAction = 'check';
    check.innerHTML = `${icon('check', { size: 16 })}<span>Periksa</span>`;
    actions.appendChild(check);
    this.inputsEl.appendChild(actions);

    const onCheck = () => {
      if (this.busy) return;
      if (isMathpadOpen()) closeMathpad(false);
      const values = {};
      const empty = [];
      const unreadable = [];
      for (const spec of step.fields) {
        const raw = inputs[spec.key].value.trim();
        const value = raw ? exact(raw) : null;
        if (!raw) empty.push(spec.key);
        else if (!value) unreadable.push(spec.key);
        values[spec.key] = { raw, value };
      }
      const mark = (keys) => keys.forEach((k) => { inputs[k].classList.add('numfield--no'); });
      if (empty.length) {
        mark(empty);
        rejectShake(inputs[empty[0]]);
        toast.warn(this.msg('belumLengkap') || DEFAULTS.empty);
        return;
      }
      if (unreadable.length) {
        mark(unreadable);
        this.fail({ message: DEFAULTS.unreadable }, inputs[unreadable[0]]);
        return;
      }
      const result = step.check(values);
      if (result === true) {
        Object.values(inputs).forEach((input) => {
          input.classList.remove('numfield--no');
          input.classList.add('numfield--ok');
          input.disabled = true;
        });
        check.disabled = true;
        this.solveStep(step, values);
        return;
      }
      const wrong = (result && result.wrong) || step.fields.map((f) => f.key);
      mark(wrong);
      this.fail(result, inputs[wrong[0]] || check);
    };
    check.addEventListener('click', onCheck);
    this.stepCleanups.push(() => check.removeEventListener('click', onCheck));
  }

  renderChoice(step) {
    if (step.intro) this.inputsEl.appendChild(el('div', 'sim-note', mixed(step.intro)));
    const list = el('div', 'options sim-choices');
    list.dataset.multi = 'false';
    list.setAttribute('role', 'radiogroup');
    step.options.forEach((opt) => {
      const btn = el('button', 'option');
      btn.type = 'button';
      btn.dataset.simChoice = opt.key;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.innerHTML = `<span class="option__box">${icon('check', { size: 14 })}</span><span class="option__label">${mixed(opt.label)}</span>`;
      const onClick = () => {
        if (this.busy || btn.classList.contains('option--locked')) return;
        const result = step.check(opt.key);
        if (result === true) {
          btn.setAttribute('aria-checked', 'true');
          btn.classList.add('option--correct');
          list.querySelectorAll('.option').forEach((b) => b.classList.add('option--locked'));
          this.solveStep(step, opt.key);
          return;
        }
        // Pilihan salah dikunci SEKALIGUS dijelaskan: siswa tidak bisa
        // menebak opsi yang sama berulang, dan tahu kenapa ia salah.
        btn.classList.add('option--wrong', 'option--locked');
        btn.setAttribute('aria-disabled', 'true');
        this.fail(result, btn);
      };
      btn.addEventListener('click', onClick);
      this.stepCleanups.push(() => btn.removeEventListener('click', onClick));
      list.appendChild(btn);
    });
    this.inputsEl.appendChild(list);
  }

  renderMulti(step) {
    if (step.intro) this.inputsEl.appendChild(el('div', 'sim-note', mixed(step.intro)));
    const list = el('div', 'options sim-choices');
    list.dataset.multi = 'true';
    list.setAttribute('role', 'group');
    const picked = new Set();
    const buttons = step.options.map((opt) => {
      const btn = el('button', 'option');
      btn.type = 'button';
      btn.dataset.simChoice = opt.key;
      btn.setAttribute('role', 'checkbox');
      btn.setAttribute('aria-checked', 'false');
      btn.innerHTML = `<span class="option__box">${icon('check', { size: 14 })}</span><span class="option__label">${mixed(opt.label)}</span>`;
      const onClick = () => {
        if (btn.classList.contains('option--locked')) return;
        if (picked.has(opt.key)) picked.delete(opt.key); else picked.add(opt.key);
        btn.setAttribute('aria-checked', String(picked.has(opt.key)));
      };
      btn.addEventListener('click', onClick);
      this.stepCleanups.push(() => btn.removeEventListener('click', onClick));
      list.appendChild(btn);
      return btn;
    });
    this.inputsEl.appendChild(list);

    const actions = el('div', 'sim-board__actions');
    const check = el('button', 'btn btn--primary');
    check.type = 'button';
    check.dataset.simAction = 'check';
    check.innerHTML = `${icon('check', { size: 16 })}<span>Periksa</span>`;
    actions.appendChild(check);
    this.inputsEl.appendChild(actions);
    const onCheck = () => {
      if (!picked.size) {
        rejectShake(check);
        toast.warn(DEFAULTS.pickFirst);
        return;
      }
      const result = step.check(new Set(picked));
      if (result === true) {
        buttons.forEach((b) => b.classList.add('option--locked'));
        buttons.filter((b) => picked.has(b.dataset.simChoice)).forEach((b) => b.classList.add('option--correct'));
        check.disabled = true;
        this.solveStep(step, new Set(picked));
        return;
      }
      // Pilihan TIDAK dibongkar mana yang salah: kalimatnya yang menuntun.
      this.fail(result, check);
    };
    check.addEventListener('click', onCheck);
    this.stepCleanups.push(() => check.removeEventListener('click', onCheck));
  }

  /**
   * Ketuk target. `targets`: [{ key, arrow } | { key, mark } | { key, node, label }].
   * Target bisa panah/titik di bidang atau elemen DOM di lembar kerja.
   */
  /**
   * Ketuk KOORDINAT di bidang kosong — bukan objek yang sudah digambar.
   *
   * `step.check([x, y])` menerima titik kisi terdekat (hasil snap), sehingga
   * siswa benar-benar MENCARI letak koordinatnya sendiri; aplikasi tidak
   * pernah menunjukkan lebih dulu. Lapisan pilih ada DI BAWAH lapisan
   * interaktif, jadi panah dan titik yang sudah ada tetap menerima ketukannya.
   */
  renderPick(step) {
    if (!this.plane) throw new Error('Langkah "pick" membutuhkan bidang kartesius');
    const intro = step.intro || 'Ketuk langsung pada **bidang koordinat**.';
    this.inputsEl.appendChild(el('div', 'sim-note', mixed(intro)));
    const release = this.plane.enablePointPicking((point) => {
      if (this.busy) return;
      const result = step.check(point);
      if (result === true) {
        this.solveStep(step, point);
        return;
      }
      // Ketukan SAH yang belum menuntaskan langkah (mis. pangkal panah,
      // sebelum ujungnya diketuk): diakui dengan bunyi, tanpa umpan balik salah.
      if (result && result.pending) {
        sfx.tap();
        return;
      }
      this.plane.flashMiss(point);
      this.fail(result, null);
    }, { step: step.snap || 1 });
    this.stepCleanups.push(release);
  }

  renderTap(step) {
    const targets = typeof step.targets === 'function' ? step.targets() : step.targets;
    // Kolom kerja tidak boleh kosong: di tata letak bertumpuk, siswa yang
    // memandang lembar kerja harus tahu bahwa jawabannya diketuk di tempat lain.
    const onPlane = targets.some((t) => t.arrow || t.mark);
    const intro = step.intro || (onPlane ? 'Ketuk langsung pada **bidang koordinat**.' : null);
    if (intro) this.inputsEl.appendChild(el('div', 'sim-note', mixed(intro)));
    targets.forEach((t) => {
      const handler = () => {
        if (this.busy) return;
        const result = step.check(t.key);
        if (result === true) {
          if (t.arrow) t.arrow.highlight(true);
          if (t.node) t.node.classList.add('is-picked');
          this.solveStep(step, t.key);
          return;
        }
        this.fail(result, t.node || null);
      };
      let release;
      if (t.arrow) release = t.arrow.setTappable(handler, t.label);
      else if (t.mark) release = t.mark.setTappable(handler, t.label);
      else release = makeTappable(t.node, handler, t.label);
      if (t.node) t.node.dataset.simTap = t.key;
      if (t.arrow) t.arrow.el.dataset.simTap = t.key;
      if (t.mark) t.mark.el.dataset.simTap = t.key;
      this.stepCleanups.push(() => {
        release();
        if (t.arrow) t.arrow.highlight(false);
      });
    });
  }

  /* ============================================================
     BIDANG — label pintar
     ============================================================ */

  get compact() {
    return Boolean(this.plane && this.plane.viewport && this.plane.viewport.scale < COMPACT_SCALE);
  }

  /**
   * Gambar panah dengan anggaran label. `essential: true` untuk panah yang
   * sedang dibicarakan langkah ini; sisanya kehilangan label di layar kecil.
   */
  drawVector(spec, { essential = false } = {}) {
    if (!this.plane) return null;
    const arrow = this.plane.drawVector({ ...spec, label: undefined });
    const label = spec.label === undefined ? arrowLabel(spec.name) : spec.label;
    this.labelled.push({ target: arrow, label, essential });
    this.applyLabelBudget();
    return arrow;
  }

  drawPoint(point, { label = null, essential = false, ghost = false } = {}) {
    if (!this.plane) return null;
    const mark = this.plane.drawPoint(point, { ghost });
    if (label) {
      this.labelled.push({ target: mark, label, essential });
      this.applyLabelBudget();
    }
    return mark;
  }

  applyLabelBudget() {
    const compact = this.compact;
    this.labelled = this.labelled.filter(({ target }) => !target.removed);
    for (const item of this.labelled) {
      const show = !compact || item.essential;
      if (item.shown === show) continue;
      item.target.setLabel(show ? item.label : null);
      item.shown = show;
    }
  }

  markEssential(target, essential = true) {
    const item = this.labelled.find((l) => l.target === target);
    if (item) {
      item.essential = essential;
      item.shown = undefined;
      this.applyLabelBudget();
    }
  }
}

function arrowLabel(name) {
  if (!name) return null;
  return name.length === 1 ? `\\vec{${name}}` : `\\overrightarrow{${name}}`;
}

/* ============================================================
   LEMBAR KERJA: VEKTOR KOLOM YANG BISA DIKETUK
   ============================================================ */

/**
 * Vektor kolom berkurung dengan komponen yang bisa diketuk (bukan isian).
 * @returns {{ root: HTMLElement, cells: HTMLElement[] }}
 */
export function tappableColumn(name, components, { formatter = texNum } = {}) {
  const root = el('div', 'matrix sim-column');
  if (name) root.appendChild(el('span', 'matrix__name', tex(name)));
  const bracket = el('div', 'matrix__bracket');
  const grid = el('div', 'matrix__grid');
  grid.style.gridTemplateColumns = 'auto';
  const cells = components.map((value, i) => {
    const cell = el('div', 'cell', tex(formatter(value)));
    cell.dataset.index = String(i);
    grid.appendChild(cell);
    return cell;
  });
  bracket.appendChild(grid);
  root.appendChild(bracket);
  return { root, cells };
}

/** Blok rumus LaTeX untuk data soal. */
export function givenBlock(html, className = '') {
  return el('div', `sim-given ${className}`.trim(), html);
}

/**
 * Dua vektor kolom berdampingan dengan operator di tengah — panggung untuk
 * mekanik "pasangkan komponen seletak".
 * @returns {{ root, left: HTMLElement[], right: HTMLElement[] }}
 */
export function pairBoard(leftName, leftValues, operator, rightName, rightValues, { leftFormat, rightFormat } = {}) {
  const root = el('div', 'stage__row stage__row--equation sim-pair');
  const L = tappableColumn(leftName, leftValues, leftFormat ? { formatter: leftFormat } : {});
  const R = tappableColumn(rightName, rightValues, rightFormat ? { formatter: rightFormat } : {});
  root.append(L.root, el('div', 'op-glyph', tex(operator)), R.root);
  return { root, left: L.cells, right: R.cells };
}

/**
 * Langkah "ketuk pasangan seletak": komponen ke-i di kiri sudah disorot;
 * siswa mengetuk pasangannya di kanan. Salah indeks → kalimat dari engine.
 */
export function pairStep({ board, index, prompt, label, wrong, extraTargets = [] }) {
  return {
    kind: 'tap',
    label,
    prompt,
    intro: 'Komponen yang disorot biru sudah terpilih. Ketuk **pasangannya** di vektor kedua.',
    onEnter: () => board.left[index].classList.add('is-picked'),
    onLeave: () => board.left[index].classList.remove('is-picked'),
    targets: () => [
      ...board.right.map((node, j) => ({ key: `r${j}`, node, label: `Komponen ke-${j + 1} vektor kedua` })),
      ...extraTargets,
    ],
    check: (key) => key === `r${index}` || wrong(key),
    onSolved: () => {
      board.right.forEach((n) => n.classList.remove('is-picked'));
      board.left[index].classList.add('is-done');
      board.right[index].classList.add('is-done');
    },
  };
}

/**
 * Titik pangkal untuk panah yang digambar TERPISAH dari panah pertama,
 * di dalam rentang bidang dan tidak menempel pada titik yang dihindari.
 */
export function detachedStart(vector, avoid, { xRange = [-6, 6], yRange = [-4, 4] } = {}) {
  const inside = ([x, y]) => x >= xRange[0] + 1 && x <= xRange[1] - 1 && y >= yRange[0] + 1 && y <= yRange[1] - 1;
  const clash = (p) => avoid.some((q) => Math.abs(q[0] - p[0]) < 1 && Math.abs(q[1] - p[1]) < 1);
  for (let y = yRange[0] + 1; y <= yRange[1] - 1; y += 1) {
    for (let x = xRange[0] + 1; x <= xRange[1] - 1; x += 1) {
      const start = [x, y];
      const end = [x + vector[0], y + vector[1]];
      if (inside(start) && inside(end) && !clash(start) && !clash(end)) return start;
    }
  }
  return [xRange[0] + 1, yRange[0] + 1];
}
