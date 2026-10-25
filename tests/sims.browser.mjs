/**
 * tests/sims.browser.mjs — Uji alur engine simulasi di peramban.
 * Dimuat oleh tests/sims.html.
 *
 * Kunci jawaban di berkas ini DIHITUNG ULANG dari konfigurasi JSON, bukan
 * dibaca dari engine — uji yang meminjam jawaban dari kode yang diujinya
 * tidak membuktikan apa pun.
 */

import { mountSimulation, isRegistered } from '../js/lesson/simulations/index.js';
import * as S from '../js/domain/surd.js';
import * as V from '../js/domain/vector.js';
import { isMathpadOpen } from '../js/core/ui/mathpad.js';

const CHAPTERS = ['01_konsep_dasar', '02_operasi_bangun_datar', '03_perkalian_proyeksi', '04_pemodelan_tka'];
const only = new URLSearchParams(location.search).get('engine');

/* ------------------------------------------------------------
   Rekaman toast & galat
   ------------------------------------------------------------ */
const toasts = [];
new MutationObserver((records) => {
  for (const r of records) {
    r.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      const nodes = n.matches('.toast') ? [n] : [...n.querySelectorAll('.toast')];
      nodes.forEach((t) => toasts.push({
        type: ['error', 'warn', 'success', 'info'].find((k) => t.classList.contains(`toast--${k}`)),
        text: t.textContent,
        html: t.innerHTML,
      }));
    });
  }
}).observe(document.body, { childList: true, subtree: true });

const consoleErrors = [];
window.addEventListener('error', (e) => consoleErrors.push(String(e.message)));
window.addEventListener('unhandledrejection', (e) => consoleErrors.push(String(e.reason && e.reason.stack || e.reason)));
const origError = console.error;
console.error = (...args) => { consoleErrors.push(args.map(String).join(' ')); origError(...args); };
// fillTemplate tidak melempar galat untuk placeholder tanpa nilai: ia
// mengosongkannya dan hanya memperingatkan. Siswa lalu membaca kalimat
// bolong ("punya  komponen"), jadi peringatan itu dihitung sebagai kegagalan.
const templateWarnings = [];
const origWarn = console.warn;
console.warn = (...args) => {
  const text = args.map(String).join(' ');
  if (text.includes('placeholder')) templateWarnings.push(text);
  origWarn(...args);
};

/* ------------------------------------------------------------
   Aksi generik atas DOM kit
   ------------------------------------------------------------ */
const host = document.getElementById('host');
const hint = document.getElementById('hint');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const frames = (n = 2) => new Promise((r) => { const s = () => (n-- <= 0 ? r() : requestAnimationFrame(s)); requestAnimationFrame(s); });

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function waitFor(predicate, timeout = 3000, label = 'kondisi') {
  const start = performance.now();
  while (performance.now() - start < timeout) {
    if (predicate()) return;
    await sleep(25);
  }
  throw new Error(`waktu habis menunggu ${label}`);
}

async function act(sim, action) {
  // Deret aksi = beberapa ketukan untuk SATU jawaban (mis. pangkal lalu ujung panah).
  if (Array.isArray(action)) {
    for (const part of action) {
      await act(sim, part);
      await frames(1);
    }
    return;
  }
  if (action.fields) {
    for (const [key, text] of Object.entries(action.fields)) {
      const input = host.querySelector(`[data-sim-field="${key}"]`);
      assert(input, `isian "${key}" tidak ditemukan (langkah ${sim.stepIndex + 1})`);
      input.value = text;
    }
    const check = host.querySelector('[data-sim-action="check"]');
    assert(check, 'tombol Periksa tidak ada');
    check.click();
  } else if (action.choice) {
    const btn = host.querySelector(`[data-sim-choice="${action.choice}"]`);
    assert(btn, `pilihan "${action.choice}" tidak ditemukan`);
    btn.click();
  } else if (action.multi) {
    // Pilihan yang tertinggal dari percobaan salah dilepas dulu — persis
    // seperti siswa yang mengoreksi pilihannya.
    host.querySelectorAll('[data-sim-choice][aria-checked="true"]').forEach((btn) => {
      if (!action.multi.includes(btn.dataset.simChoice)) btn.click();
    });
    for (const key of action.multi) {
      const btn = host.querySelector(`[data-sim-choice="${key}"]`);
      assert(btn, `pilihan "${key}" tidak ditemukan`);
      if (btn.getAttribute('aria-checked') !== 'true') btn.click();
    }
    host.querySelector('[data-sim-action="check"]').click();
  } else if (action.unmulti) {
    for (const key of action.unmulti) {
      const btn = host.querySelector(`[data-sim-choice="${key}"]`);
      if (btn && btn.getAttribute('aria-checked') === 'true') btn.click();
    }
  } else if (action.pick) {
    // Ketukan pada bidang KOSONG: koordinat matematika diubah ke piksel
    // klien lewat CTM yang benar-benar dirender, sama seperti jari siswa.
    const plane = sim.plane;
    assert(plane, 'aksi pick butuh bidang kartesius');
    const rect = host.querySelector('.plane__pick');
    assert(rect, 'lapisan pilih tidak aktif di langkah ini');
    const [sx, sy] = plane.toScreen(action.pick);
    const pt = new DOMPoint(sx, sy).matrixTransform(plane.svg.getScreenCTM());
    rect.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: pt.x, clientY: pt.y }));
  } else if (action.pad) {
    // Papan kemudi: (Ulang dulu bila diminta) → tekan tombol arah → Periksa.
    // Tekanan diantrekan engine, Periksa menunggu antrean habis.
    if (action.reset) host.querySelector('[data-sim-action="reset"]').click();
    for (const key of action.pad) {
      const btn = host.querySelector(`[data-sim-pad="${key}"]`);
      assert(btn, `tombol kemudi "${key}" tidak ditemukan`);
      btn.click();
    }
    await sim.padChain;
    host.querySelector('[data-sim-action="check"]').click();
    await sim.padChain;
    await sleep(30);
  } else if (action.tap) {
    const node = host.querySelector(`[data-sim-tap="${action.tap}"]`);
    assert(node, `target ketuk "${action.tap}" tidak ditemukan`);
    node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  } else {
    throw new Error(`aksi tidak dikenal: ${JSON.stringify(action)}`);
  }
}

/** Potongan kalimat BIASA terpanjang dari templat: rumus KaTeX dan
    placeholder dipotong keluar, karena teks rendernya berbeda. */
function probeOf(template) {
  return template
    .replace(/\$[^$]*\$|\{\{[^}]*\}\}/g, '|')
    .replace(/\*\*/g, '')
    .split(/[|—.,:;()]/)
    .map((p) => p.trim())
    .sort((a, b) => b.length - a.length)[0];
}

/** Kunci toast sukses yang WAJIB berbunyi saat sebuah kasus tuntas. */
const CASE_SUCCESS = {
  space_guided: (c) => ({ drone: 'success', zero: 'successNol', between: 'successRuang' }[c.kind]),
  unit_guided: (c) => ({ shrink: 'success', same: 'successSearah', surd: 'successAkar', zero: 'vektorNol' }[c.kind]),
  magnitude_guided: (c) => ({ pythagoras: 'success', simplify: 'successAkar', formula: 'successRumus' }[c.kind]),
  position_guided: (c) => ({ discover: 'success', formula: 'successRumus', nogrid: 'successBesar', origin: 'successPangkal' }[c.kind]),
  notation_guided: (c) => ({ build: 'success', shift: 'successBebas', tidy: 'successBaku' }[c.kind]),
  vector_anatomy: (c) => (c.guided ? 'success' : 'successLatihan'),
};

/**
 * Pasangan label bidang yang saling menimpa, atau menimpa titik.
 * Terukur 26 tumpang-tindih di simulasi terpandu sebelum declutter().
 */
function labelClashes() {
  const svg = host.querySelector('svg.plane');
  if (!svg) return [];
  const labels = [...svg.querySelectorAll('.plane__label-inner, .plane__arc-slot')]
    .filter((e) => e.textContent.trim())
    .map((e) => ({ t: e.textContent.trim().slice(0, 10), r: e.getBoundingClientRect() }));
  const dots = [...svg.querySelectorAll('.plane__point:not(.plane__point--ghost)')].map((e) => e.getBoundingClientRect());
  const hit = (a, b, pad = 1) => !(a.right - pad <= b.left || b.right - pad <= a.left || a.bottom - pad <= b.top || b.bottom - pad <= a.top);
  const out = [];
  labels.forEach((a, i) => {
    labels.slice(i + 1).forEach((b) => { if (hit(a.r, b.r)) out.push(`${a.t} ⟷ ${b.t}`); });
    dots.forEach((d) => { if (hit(a.r, d, 0.5)) out.push(`${a.t} ⟷ titik`); });
  });
  return out;
}

function planeRect() {
  const p = host.querySelector('.plane-host');
  if (!p) return null;
  // Banner "lanjut ke kasus berikutnya" menggulir panggung ke pandangan —
  // itu GULIRAN, bukan pergeseran tata letak. Panggung dikembalikan ke atas
  // dulu (bidangnya sticky), lalu posisinya diukur dalam koordinat dokumen.
  const body = host.closest('.workspace__body');
  if (body) body.scrollTop = 0;
  const r = p.getBoundingClientRect();
  return [Math.round(r.left + scrollX), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)].join(',');
}

/* ------------------------------------------------------------
   Pemandu satu engine
   ------------------------------------------------------------ */
async function runEngine(def, plan) {
  host.innerHTML = '';
  hint.innerHTML = '';
  toasts.length = 0;
  let completes = 0;
  const sim = mountSimulation(host, def, () => { completes += 1; }, { hintHost: hint });
  assert(sim && sim.cases, `engine "${def.engine}" tidak terpasang sebagai CaseSimulation`);
  const notes = [];

  try {
    for (let ci = 0; ci < sim.cases.length; ci += 1) {
      await waitFor(() => sim.caseIndex === ci && sim.currentStep, 3000, `kasus ${ci + 1}`);
      const steps = plan(sim.cases[ci], ci, def.config);
      assert(steps.length === sim.steps.length, `kasus ${ci + 1}: rencana ${steps.length} langkah, engine ${sim.steps.length}`);
      const rect0 = planeRect();

      for (let si = 0; si < steps.length; si += 1) {
        const s = steps[si];
        await waitFor(() => sim.stepIndex === si && host.querySelector('.sim-board__inputs > *'), 3000, `langkah ${si + 1}`);

        if (s.wrong) {
          const before = toasts.length;
          // Aksioma di GAMBAR: jawaban salah tidak boleh menambah panah,
          // titik, label, atau bentuk apa pun di bidang.
          const drawn = () => (host.querySelector('svg.plane')
            ? host.querySelectorAll('.plane__arrow, .plane__point, .plane__label, .plane__layer--shape > *').length
            : 0);
          const drawnBefore = drawn();
          await act(sim, s.wrong);
          await frames(3);
          assert(drawn() === drawnBefore, `kasus ${ci + 1} langkah ${si + 1}: jawaban SALAH menggambar sesuatu di bidang (${drawnBefore} → ${drawn()})`);
          assert(sim.stepIndex === si && sim.caseIndex === ci, `kasus ${ci + 1} langkah ${si + 1}: jawaban SALAH memajukan langkah`);
          const fresh = toasts.slice(before).filter((t) => t.type === 'error' || t.type === 'warn');
          assert(fresh.length, `kasus ${ci + 1} langkah ${si + 1}: jawaban salah tanpa toast penjelas`);
          const last = fresh[fresh.length - 1];
          // Hanya placeholder {{kunci}} yang belum terisi; kurung ganda LaTeX
          // seperti \dfrac{\text{…}}{\text{…}} sah dan bukan kebocoran templat.
          assert(!/\{\{\s*\w+\s*\}\}/.test(last.text), `templat bocor: ${last.text}`);
          for (const leak of s.leak || []) {
            // Angka UTUH pada teks yang terlihat: "5" tidak boleh cocok dengan
            // "25", dan angka di atribut gaya HTML KaTeX bukan kebocoran.
            // Kunci berupa KATA dibatasi huruf, bukan angka: "terdefinisi."
            // tetap kebocoran walau diikuti titik.
            const escaped = leak.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = /\d/.test(leak)
              ? new RegExp(`(^|[^\\d/√,.])${escaped}($|[^\\d/√,.])`)
              : new RegExp(`(^|[^\\p{L}])${escaped}($|[^\\p{L}])`, 'iu');
            assert(!pattern.test(last.text), `kasus ${ci + 1} langkah ${si + 1}: toast MEMBOCORKAN "${leak}": ${last.text}`);
          }
          if (s.expectToast) {
            const expected = def.toasts[s.expectToast];
            assert(expected, `toast "${s.expectToast}" tidak ada di JSON`);
            const probe = probeOf(expected);
            assert(!probe || probe.length < 8 || last.text.includes(probe), `kasus ${ci + 1} langkah ${si + 1}: diharapkan toast "${s.expectToast}" ("${probe}"), didapat: ${last.text}`);
          }
          notes.push(`K${ci + 1}L${si + 1} salah → "${last.text.slice(0, 70)}…"`);
        }

        if (s.beforeRight) s.beforeRight(sim);
        await act(sim, s.right);
        await waitFor(() => sim.stepIndex > si || sim.caseIndex !== ci || sim.solved.has(ci), 4000, `kasus ${ci + 1} langkah ${si + 1} diterima`);
        await frames(2);
        const rect = planeRect();
        assert(rect === rect0, `kasus ${ci + 1} langkah ${si + 1}: bidang SVG BERGESER ${rect0} → ${rect}`);
      }

      await waitFor(() => sim.solved.has(ci), 3000, `kasus ${ci + 1} selesai`);
      // Panah hasil boleh masih beranimasi sesudah kasus tuntas: tunggu
      // sampai diam, lalu beri declutter() satu frame.
      await sleep(700);
      await frames(2);
      const clash = labelClashes();
      assert(!clash.length, `kasus ${ci + 1}: label bidang bertumpuk — ${clash.slice(0, 3).join('; ')}`);
      // Toast sukses harus milik kasus INI. Terukur di purwarupa terpandu:
      // kasus latihan B, C, D membunyikan "Dari O ke A: 7 ke kanan…".
      const wantKey = CASE_SUCCESS[def.engine] && CASE_SUCCESS[def.engine](sim.cases[ci]);
      if (wantKey) {
        const probe = probeOf(def.toasts[wantKey] || '');
        const done = toasts.filter((t) => t.type === 'success');
        const last = done[done.length - 1];
        assert(probe && last && last.text.includes(probe), `kasus ${ci + 1}: diharapkan toast sukses "${wantKey}" ("${probe}"), didapat: ${last ? last.text : '(tidak ada)'}`);
      }
      if (ci < sim.cases.length - 1) {
        const next = hint.querySelector('[data-sim-action="next-case"]');
        assert(next && next.style.visibility === 'visible', `kasus ${ci + 1}: tombol kasus berikutnya tidak tampil`);
        next.click();
      }
    }

    await frames(2);
    assert(completes === 1, `onComplete dipanggil ${completes}× (harus 1)`);
    assert(!host.textContent.includes('NaN') && !host.innerHTML.includes('NaN'), 'NaN tertulis di panggung');
  } finally {
    sim.destroy();
  }
  assert(!host.querySelector('svg.plane'), 'SVG bidang tertinggal sesudah destroy');
  assert(!isMathpadOpen(), 'papan angka masih terbuka sesudah destroy');
  return notes;
}

/* ------------------------------------------------------------
   Rencana jawaban per engine — DIHITUNG dari konfigurasi
   ------------------------------------------------------------ */
const AX = ['x', 'y', 'z'];
const txt = (value) => S.toText(S.parseSurd(value));
const comps = (arr, prefix = 'c') => Object.fromEntries(arr.map((v, i) => [`${prefix}${AX[i]}`, txt(v)]));

const PLANS = {
  vector_anatomy: (c) => {
    const [x, y] = c.to;
    // Rentang bidang dihitung ULANG dari konfigurasi (engine memotongnya per
    // kasus), supaya titik salah yang diketuk uji tetap berada di dalam bidang.
    const pad = 2;
    const inside = (p) => p[0] >= Math.min(-pad, x - pad) && p[0] <= Math.max(pad, x + pad)
      && p[1] >= Math.min(-pad, y - pad) && p[1] <= Math.max(pad, y + pad);
    const swapped = [y, x];
    // Tertukar SEBAGIAN: titik tertukar utuh sering di luar bidang yang
    // dipotong rapat; siswa yang menukar urutan berhenti di tepi bidang.
    const yMax = Math.max(pad, y + pad);
    const partial = [y, Math.min(x, yMax)];
    const findStep = inside(swapped)
      ? { wrong: { pick: swapped }, right: { pick: c.to }, expectToast: 'koordinatTertukar' }
      : (x !== y && inside(partial) && partial[1] !== y)
        ? { wrong: { pick: partial }, right: { pick: c.to }, expectToast: 'koordinatTertukar' }
        : { wrong: { pick: [x - Math.sign(x || 1), y] }, right: { pick: c.to }, expectToast: 'titikMeleset' };
    const traceStep = {
      wrong: { fields: { dx: txt(-x), dy: txt(y) } },
      right: { fields: { dx: txt(x), dy: txt(y) } },
      expectToast: 'langkahSalahTanda',
      leak: [`${x}, ${y}`],
    };
    // Panah digambar dengan DUA ketukan. Urutan terbalik (ujung → pangkal)
    // harus ditolak berkalimat, tanpa menggambar panah apa pun.
    const drawStep = {
      wrong: [{ pick: c.to }, { pick: [0, 0] }],
      right: [{ pick: [0, 0] }, { pick: c.to }],
      expectToast: 'arahPanahTerbalik',
    };
    if (!c.guided) return [findStep, traceStep, drawStep];
    return [
      { wrong: { pick: [1, 1] }, right: { pick: [0, 0] }, expectToast: 'pusatSalah' },
      findStep,
      traceStep,
      drawStep,
    ];
  },

  notation_guided: (c) => {
    const [x, y] = c.v;
    const col = (a, b) => ({ fields: { cx: txt(a), cy: txt(b) } });
    if (c.kind === 'build') {
      return [
        { wrong: { pick: [x - 1, y] }, right: { pick: c.v }, expectToast: 'ujungMeleset' },
        { wrong: col(x, -y), right: col(x, y), expectToast: 'kolomSalahTanda', leak: [`${x}, ${y}`] },
        { wrong: col(y, x), right: col(x, y), expectToast: 'kolomTertukar' },
        { wrong: { choice: 'swap' }, right: { choice: 'ok' }, expectToast: 'pasanganTertukar' },
      ];
    }
    if (c.kind === 'shift') {
      return [
        { wrong: col(y, x), right: col(x, y), expectToast: 'kolomTertukar' },
        { wrong: { pick: c.v }, right: { pick: [c.start[0] + x, c.start[1] + y] }, expectToast: 'dariO' },
        { wrong: { choice: 'beda' }, right: { choice: 'sama' }, expectToast: 'vektorBebas' },
      ];
    }
    return [
      { wrong: col(x, 0), right: col(x, y), expectToast: 'koefisienSatu' },
      { wrong: { choice: 'nol' }, right: { choice: 'ok' }, expectToast: 'belumBaku' },
      { wrong: { choice: 'satu' }, right: { choice: 'ok' }, expectToast: 'nolWajib' },
    ];
  },


  position_guided: (c) => {
    if (c.kind === 'discover') {
      const { A, B } = c;
      const key = vsub(B, A);
      return [
        { wrong: { pick: [A[1], A[0]] }, right: { pick: A }, expectToast: 'koordinatTertukar' },
        { wrong: { pick: [B[1], B[0]] }, right: { pick: B }, expectToast: 'koordinatTertukar' },
        { wrong: [{ pick: A }, { pick: [0, 0] }], right: [{ pick: [0, 0] }, { pick: A }], expectToast: 'arahPanahTerbalik' },
        { wrong: [{ pick: B }, { pick: A }], right: [{ pick: A }, { pick: B }], expectToast: 'arahPanahTerbalik' },
        { wrong: { fields: { dx: txt(-key[0]), dy: txt(key[1]) } }, right: { fields: { dx: txt(key[0]), dy: txt(key[1]) } }, expectToast: 'langkahSalahTanda', leak: [`${key[0]}, ${key[1]}`] },
        {
          wrong: { fields: { xb: txt(A[0]), xa: txt(B[0]), yb: txt(A[1]), ya: txt(B[1]) } },
          right: { fields: { xb: txt(B[0]), xa: txt(A[0]), yb: txt(B[1]), ya: txt(A[1]) } },
          expectToast: 'urutanUjungPangkal',
        },
      ];
    }
    if (c.kind === 'formula') {
      const key = vsub(c.Q, c.P);
      return [
        { wrong: { fields: comps(vmul(-1, key)) }, right: { fields: comps(key) }, expectToast: 'tandaTerbalik', leak: [key.join(', ')] },
        { wrong: { fields: comps(key) }, right: { fields: comps(vmul(-1, key)) }, expectToast: 'lawanSama' },
      ];
    }
    if (c.kind === 'nogrid') {
      const key = vsub(c.L, c.K);
      return [
        { wrong: { fields: comps(vmul(-1, key)) }, right: { fields: comps(key) }, expectToast: 'tandaTerbalik', leak: [key.join(', ')] },
        { wrong: { fields: comps(vsub(c.K, c.KM)) }, right: { fields: comps(vadd(c.K, c.KM)) }, expectToast: 'ujungBukanPangkal' },
      ];
    }
    const R = vsub(c.S, c.RS);
    return [
      { wrong: { fields: comps(vadd(c.S, c.RS)) }, right: { fields: comps(R) }, expectToast: 'pangkalBukanUjung', leak: [R.join(', ')] },
      { wrong: { pick: [R[0] + 1, R[1]] }, right: { pick: R }, expectToast: 'titikMeleset' },
    ];
  },

  space_guided: (c) => {
    const pad = (P) => P.flatMap((n, i) => Array(Math.abs(n)).fill(`${'xyz'[i]}${n > 0 ? '+' : '-'}`));
    if (c.kind === 'between') {
      const key = vsub(c.B, c.A);
      const sumSq = key.reduce((a, n) => a + n * n, 0);
      return [
        { wrong: { fields: comps(vmul(-1, key)) }, right: { fields: comps(key) }, expectToast: 'tandaTerbalik', leak: [key.join(', ')] },
        { wrong: { fields: { len: `√${sumSq}` } }, right: { fields: { len: S.toText(S.fromSquare(sumSq)) } }, expectToast: 'belumDisederhanakan' },
      ];
    }
    const P = c.P;
    // Salah: tombol sumbu Y ditekan ke arah sebaliknya (atau, bila Y = 0, lupa satu langkah naik).
    const wrongPad = P[1] !== 0 ? pad([P[0], -P[1], P[2]]) : pad([P[0], 0, P[2] - 1]);
    const padStep = { wrong: { pad: wrongPad }, right: { pad: pad(P), reset: true }, expectToast: 'posisiSalah' };
    const sumSq = P.reduce((a, n) => a + n * n, 0);
    if (c.kind === 'zero') {
      const shifted = P.filter((n) => n !== 0).concat([0]);
      return [
        padStep,
        { wrong: { fields: comps(shifted) }, right: { fields: comps(P) }, expectToast: 'nolTergeser' },
        { wrong: { fields: { len: String(sumSq) } }, right: { fields: { len: S.toText(S.fromSquare(sumSq)) } }, expectToast: 'belumDiakar' },
      ];
    }
    const floorSq = P[0] ** 2 + P[1] ** 2;
    return [
      padStep,
      { wrong: { fields: comps([P[0], -P[1], P[2]]) }, right: { fields: comps(P) }, expectToast: 'tandaKomponen' },
      { wrong: { fields: comps([P[1], P[0], P[2]]) }, right: { fields: comps(P) }, expectToast: 'urutanSumbu' },
      { wrong: { fields: { len: String(Math.abs(P[0]) + Math.abs(P[1])) } }, right: { fields: { len: S.toText(S.fromSquare(floorSq)) } }, expectToast: 'lupaKuadrat' },
      { wrong: { fields: { len: String(sumSq) } }, right: { fields: { len: S.toText(S.fromSquare(sumSq)) } }, expectToast: 'belumDiakar' },
    ];
  },

  magnitude_guided: (c) => {
    const v = c.v;
    const squares = v.map((n) => n * n);
    const sum = squares.reduce((a, b) => a + b, 0);
    const simple = S.toText(S.fromSquare(sum));
    if (c.kind === 'pythagoras') {
      return [
        { wrong: { pick: [0, v[1]] }, right: { pick: [v[0], 0] }, expectToast: 'sikuTegakDulu' },
        { wrong: { choice: 'sama' }, right: { choice: 'pendek' }, expectToast: 'lurusLebihPendek' },
        { wrong: { fields: comps(v.map(Math.abs), 'q') }, right: { fields: comps(squares, 'q') }, expectToast: 'lupaKuadrat' },
        { wrong: { fields: { sum: txt(Math.abs(v[0]) + Math.abs(v[1])) } }, right: { fields: { sum: String(sum) } }, expectToast: 'lupaKuadrat' },
        { wrong: { fields: { len: String(sum) } }, right: { fields: { len: simple } }, expectToast: 'belumDiakar', leak: [simple] },
      ];
    }
    const squaresStep = c.kind === 'formula'
      ? { wrong: { fields: comps([-squares[0], squares[1]], 'q') }, right: { fields: comps(squares, 'q') }, expectToast: 'tandaIkutMasuk' }
      : { wrong: { fields: comps(v.map(Math.abs), 'q') }, right: { fields: comps(squares, 'q') }, expectToast: 'lupaKuadrat' };
    const sumStep = { wrong: { fields: { sum: String(sum + 1) } }, right: { fields: { sum: String(sum) } }, expectToast: 'jumlahSalah' };
    const simplest = { wrong: { fields: { len: `√${sum}` } }, right: { fields: { len: simple } }, expectToast: 'belumDisederhanakan', leak: [simple] };
    if (c.kind === 'simplify') {
      const k = S.squareFreeSplit(sum).outside;
      return [
        squaresStep,
        sumStep,
        { wrong: { choice: 'dua' }, right: { choice: 'ok' }, expectToast: 'faktorBukanKuadrat' },
        { wrong: { fields: { root: String(k * k) } }, right: { fields: { root: String(k) } }, expectToast: 'akarKuadratSalah' },
        simplest,
      ];
    }
    return [squaresStep, sumStep, simplest];
  },

  unit_guided: (c) => {
    const vec = V.fromArray(c.v);
    const n = V.normExact(vec);
    const sumSq = V.normSquared(vec);
    const lenText = S.toText(n);
    if (c.kind === 'zero') {
      return [
        { wrong: { fields: { len: '1' } }, right: { fields: { len: '0' } }, expectToast: 'panjangSalah' },
        { wrong: { choice: 'nol' }, right: { choice: 'none' }, expectToast: 'memaksaVektorNol' },
      ];
    }
    const unit = c.v.map((x) => S.toText(S.divS(x, n)));
    const lenStep = c.kind === 'surd'
      ? { wrong: { fields: { len: String(sumSq) } }, right: { fields: { len: lenText } }, expectToast: 'belumDiakar', leak: [lenText] }
      : { wrong: { fields: { len: String(Math.abs(c.v[0]) + Math.abs(c.v[1])) } }, right: { fields: { len: lenText } }, expectToast: 'lupaKuadrat', leak: [lenText] };
    const half = unit.slice();
    half[0] = String(c.v[0]);
    const unitStep = c.kind === 'surd'
      ? { wrong: { fields: { cx: unit[0], cy: unit[1].replace('-', '') } }, right: { fields: { cx: unit[0], cy: unit[1] } }, expectToast: 'tandaHilang' }
      : { wrong: { fields: { cx: half[0], cy: half[1] } }, right: { fields: { cx: unit[0], cy: unit[1] } }, expectToast: 'hanyaSatuKomponen', leak: [unit[0]] };
    if (c.kind === 'shrink') {
      const plainSum = S.toText(S.addS(S.parseSurd(unit[0]), S.parseSurd(unit[1])));
      return [
        lenStep,
        { wrong: { choice: 'kurang' }, right: { choice: 'bagi' }, expectToast: 'arahBerubah' },
        unitStep,
        { wrong: { fields: { chk: plainSum } }, right: { fields: { chk: '1' } }, expectToast: 'lupaKuadrat' },
      ];
    }
    if (c.kind === 'same') {
      return [lenStep, unitStep, { wrong: { choice: 'panjang' }, right: { choice: 'searah' }, expectToast: 'panjangBeda' }];
    }
    return [lenStep, unitStep];
  },
};

const vadd = (p, q) => p.map((n, i) => n + q[i]);
const vsub = (p, q) => p.map((n, i) => n - q[i]);
const vmul = (k, p) => p.map((n) => k * n);
const bump = (arr) => { const out = arr.slice(); out[0] = S.addS(S.parseSurd(out[0]), 1); return out; };

Object.assign(PLANS, {
  triangle_rule: (c) => {
    const sum = vadd(c.a, c.b);
    const closes = sum[0] === 0 && sum[1] === 0;
    return [
      { wrong: { tap: 'first' }, right: { tap: 'second' }, expectToast: 'geserKeUjungSalah' },
      { wrong: { tap: 'tail' }, right: { tap: 'joint' } },
      { wrong: { tap: 'joint' }, right: { tap: 'tail' }, expectToast: 'resultanSalahPangkal' },
      { wrong: { tap: 'joint' }, right: { tap: closes ? 'tail' : 'end' }, expectToast: 'resultanSalahPangkal' },
      { wrong: { fields: comps(vsub(c.a, c.b)) }, right: { fields: comps(sum) }, leak: sum[0] || sum[1] ? [sum.join(', ')] : [] },
    ];
  },

  parallelogram_rule: (c) => {
    const target = c.ask === 'sum' ? vadd(c.a, c.b) : vsub(c.a, c.b);
    const steps = [
      { wrong: { tap: 'tip' }, right: { tap: 'tail' }, expectToast: 'pangkalTidakBerimpit' },
      c.ask === 'sum'
        ? { wrong: { choice: 'tips' }, right: { choice: 'common' }, expectToast: 'diagonalSalah' }
        : { wrong: { choice: 'common' }, right: { choice: 'tips' } },
    ];
    if (c.ask === 'diff') steps.push({ wrong: { choice: 'ab' }, right: { choice: 'ba' }, expectToast: 'arahSelisihTerbalik' });
    steps.push(c.ask === 'sum'
      ? { wrong: { fields: comps(vsub(c.a, c.b)) }, right: { fields: comps(target) }, expectToast: 'diagonalSalah' }
      : { wrong: { fields: comps(vsub(c.b, c.a)) }, right: { fields: comps(target) }, expectToast: 'arahSelisihTerbalik' });
    return steps;
  },

  component_add: (c) => {
    // Kunci langkah ini berupa KATA, bukan angka: kalimat salah tidak boleh
    // langsung menyebut "tidak terdefinisi".
    if (c.invalid) return [{ wrong: { choice: 'padded' }, right: { choice: 'undefined' }, expectToast: 'dimensiBeda', leak: ['tidak terdefinisi'] }];
    const sign = c.op === 'add' ? 1 : -1;
    const steps = [];
    c.a.forEach((n, i) => {
      steps.push({ wrong: { tap: `r${(i + 1) % c.a.length}` }, right: { tap: `r${i}` }, expectToast: 'komponenTidakSeletak' });
      const result = n + sign * c.b[i];
      steps.push(c.op === 'sub' && c.b[i] !== 0
        ? { wrong: { fields: { [`r${AX[i]}`]: String(n + c.b[i]) } }, right: { fields: { [`r${AX[i]}`]: String(result) } }, expectToast: 'tandaKurangTerlewat', leak: [String(result)] }
        : { wrong: { fields: { [`r${AX[i]}`]: String(result + 1) } }, right: { fields: { [`r${AX[i]}`]: String(result) } }, expectToast: 'hasilSalah', leak: [String(result)] });
    });
    return steps;
  },

  scalar_sweep: (c) => {
    const scaled = c.v.map((n) => S.mulS(S.toFraction(c.k), n));
    const steps = scaled.map((value, i) => (S.isZeroS(value)
      ? { wrong: { fields: { [`k${AX[i]}`]: '1' } }, right: { fields: { [`k${AX[i]}`]: '0' } } }
      : { wrong: { fields: { [`k${AX[i]}`]: S.toText(S.negS(value)) } }, right: { fields: { [`k${AX[i]}`]: S.toText(value) } }, expectToast: 'tandaHilang', leak: Math.abs(c.v[i]) === 1 ? [] : [S.toText(value)] }));
    const k = Number(c.k);
    const direction = k === 0 ? 'zero' : k < 0 ? 'opp' : 'same';
    const expected = direction === 'zero' ? 'zero' : `${direction}-${Math.abs(k) > 1 ? 'long' : 'short'}`;
    const wrongDir = direction === 'zero' ? 'same-long' : `${direction === 'same' ? 'opp' : 'same'}-${Math.abs(k) > 1 ? 'long' : 'short'}`;
    steps.push({ wrong: { choice: wrongDir }, right: { choice: expected }, expectToast: direction === 'zero' ? undefined : 'arahSalah' });
    return steps;
  },

  combo_vector_op: (c) => {
    const su = vmul(c.ku, c.u);
    const sv = vmul(c.kv, c.v);
    const result = vadd(su, sv);
    const vWrong = c.kv === 1 ? bump(sv) : c.v;
    return [
      { wrong: { fields: comps(c.u, 'u') }, right: { fields: comps(su, 'u') }, expectToast: 'skalarHanyaSatuKomponen', leak: [su.join(', ')] },
      { wrong: { fields: comps(vWrong, 'v') }, right: { fields: comps(sv, 'v') }, expectToast: c.kv === 1 ? undefined : 'skalarHanyaSatuKomponen' },
      { wrong: { fields: comps(vsub(su, sv)) }, right: { fields: comps(result) }, expectToast: 'tandaKurangSalah', leak: [result.join(', ')] },
    ];
  },

  equality_link: (c) => {
    const steps = [];
    c.left.forEach((expr, i) => {
      const variable = /[a-z]/.exec(expr)[0];
      steps.push({ wrong: { tap: `r${(i + 1) % c.left.length}` }, right: { tap: `r${i}` }, expectToast: 'tidakSeletak' });
      // Baris identitas (p = −1) memuat jawabannya di DATA soal — bukan kebocoran.
      const trivial = expr === variable;
      steps.push({ wrong: { fields: { [`s${i}`]: String(c.solve[variable] + 1) } }, right: { fields: { [`s${i}`]: String(c.solve[variable]) } }, expectToast: 'nilaiSalah', leak: trivial ? [] : [String(c.solve[variable])] });
    });
    return steps;
  },

  collinear_check: (c) => {
    const AB = vsub(c.B, c.A);
    const AC = vsub(c.C, c.A);
    const ix = AB[0] !== 0 ? 0 : 1;
    const iy = 1 - ix;
    const k1 = S.toText(S.fraction(AC[ix], AB[ix]));
    const k2 = S.toText(S.fraction(AC[iy], AB[iy]));
    const kWrong = (k) => S.toText(S.addS(S.parseSurd(k), 1));
    return [
      { wrong: { fields: comps(AB.map((n) => -n), 'AB') }, right: { fields: comps(AB, 'AB') } },
      { wrong: { fields: comps(AC.map((n) => -n), 'AC') }, right: { fields: comps(AC, 'AC') } },
      { wrong: { fields: { k1: kWrong(k1) } }, right: { fields: { k1 } }, leak: Math.abs(AB[ix]) === 1 ? [] : [k1] },
      { wrong: { fields: { k2: kWrong(k2) } }, right: { fields: { k2 } }, leak: Math.abs(AB[iy]) === 1 ? [] : [k2] },
      c.collinear
        ? { wrong: { choice: 'no' }, right: { choice: 'yes' } }
        : { wrong: { choice: 'yes' }, right: { choice: 'no' }, expectToast: 'kBeda' },
    ];
  },

  section_point: (c) => {
    const total = c.m + c.n;
    const P = c.A.map((a, i) => S.toText(S.fraction(c.n * a + c.m * c.B[i], total)));
    const swapped = c.A.map((a, i) => S.toText(S.fraction(c.m * a + c.n * c.B[i], total)));
    const canSwap = swapped.some((s, i) => s !== P[i]);
    return [
      { wrong: { fields: { den: String(total + 1) } }, right: { fields: { den: String(total) } }, expectToast: 'penyebutSalah', leak: [String(total)] },
      canSwap
        ? { wrong: { fields: comps(swapped) }, right: { fields: comps(P) }, expectToast: 'mnTertukar', leak: [P.join(', ')] }
        : { wrong: { fields: comps(bump(P).map((x) => S.toText(S.parseSurd(x)))) }, right: { fields: comps(P) }, leak: [P.join(', ')] },
    ];
  },
});

const dotp = (p, q) => p.reduce((acc, n, i) => acc + n * q[i], 0);
const plus1 = (value) => S.toText(S.addS(S.parseSurd(value), 1));

Object.assign(PLANS, {
  dot_builder: (c) => {
    const steps = [];
    c.u.forEach((n, i) => {
      const product = n * c.v[i];
      steps.push({ wrong: { tap: `r${(i + 1) % c.u.length}` }, right: { tap: `r${i}` }, expectToast: 'komponenTidakSeletak' });
      steps.push(n + c.v[i] !== product
        ? { wrong: { fields: { [`p${AX[i]}`]: String(n + c.v[i]) } }, right: { fields: { [`p${AX[i]}`]: String(product) } }, expectToast: 'menjumlahBukanMengali' }
        : { wrong: { fields: { [`p${AX[i]}`]: String(product + 1) } }, right: { fields: { [`p${AX[i]}`]: String(product) } } });
    });
    const total = dotp(c.u, c.v);
    steps.push({ wrong: { fields: { total: String(total + 1) } }, right: { fields: { total: String(total) } }, expectToast: 'hasilSalah', leak: [String(total)] });
    return steps;
  },

  product_property_cards: (card) => {
    if (card.claim === 'asosiatif_titik') return [{ wrong: { choice: 'different' }, right: { choice: 'undefined' }, expectToast: 'asosiatifSalah' }];
    const d = card.check || card.counter;
    const sides = {
      komutatif: () => [dotp(d.a, d.b), dotp(d.b, d.a)],
      distributif: () => [dotp(d.a, d.b.map((n, i) => n + d.c[i])), dotp(d.a, d.b) + dotp(d.a, d.c)],
      kuadrat_norma: () => [dotp(d.a, d.a), dotp(d.a, d.a)],
      pencoretan: () => [dotp(d.a, d.b), dotp(d.a, d.c)],
    }[card.claim]();
    return [
      { wrong: { fields: { s0: String(sides[0] + 1), s1: String(sides[1]) } }, right: { fields: { s0: String(sides[0]), s1: String(sides[1]) } }, expectToast: card.valid ? 'keduaRuasBeda' : undefined },
      card.valid
        ? { wrong: { choice: 'invalid' }, right: { choice: 'valid' } }
        : { wrong: { choice: 'valid' }, right: { choice: 'invalid' }, expectToast: 'pencoretanSalah' },
    ];
  },

  angle_solver: (c) => {
    const u = V.fromArray(c.u);
    const v = V.fromArray(c.v);
    const d = V.dot(u, v);
    const nu = V.normExact(u);
    const nv = V.normExact(v);
    const cos = V.cosAngleExact(u, v);
    return [
      { wrong: { fields: { dot: String(d + 1) } }, right: { fields: { dot: String(d) } }, leak: [String(d)] },
      { wrong: { fields: { na: String(V.normSquared(u) + 1) } }, right: { fields: { na: S.toText(nu) } }, expectToast: 'panjangSalah', leak: [S.toText(nu)] },
      { wrong: { fields: { nb: String(V.normSquared(v) + 1) } }, right: { fields: { nb: S.toText(nv) } }, expectToast: 'panjangSalah', leak: [S.toText(nv)] },
      { wrong: { fields: { cos: '2' } }, right: { fields: { cos: S.toText(cos) } }, expectToast: 'cosDiLuarRentang', leak: [S.toText(cos)] },
      { wrong: { fields: { deg: String(c.expectDeg + 15) } }, right: { fields: { deg: String(c.expectDeg) } }, leak: [String(c.expectDeg)] },
    ];
  },

  perpendicular_check: (c) => {
    if (c.solveK !== undefined) {
      const kIndex = c.a.indexOf('k');
      const constant = c.a.reduce((acc, n, i) => (i === kIndex ? acc : acc + n * c.b[i]), 0);
      const coef = c.b[kIndex];
      return [
        { wrong: { fields: { const: String(constant + 1), coef: String(coef) } }, right: { fields: { const: String(constant), coef: String(coef) } } },
        { wrong: { fields: { k: String(c.solveK + 1) } }, right: { fields: { k: String(c.solveK) } }, expectToast: 'kSalah', leak: [String(c.solveK)] },
      ];
    }
    const d = dotp(c.a, c.b);
    const dotStep = { wrong: { fields: { dot: String(d + 1) } }, right: { fields: { dot: String(d) } } };
    if (c.isZero) return [dotStep, { wrong: { choice: 'yes' }, right: { choice: 'undetermined' }, expectToast: 'vektorNol' }];
    return [dotStep, c.perp
      ? { wrong: { choice: 'no' }, right: { choice: 'yes' } }
      : { wrong: { choice: 'yes' }, right: { choice: 'no' }, expectToast: 'bukanNol' }];
  },

  scalar_projection: (c) => {
    const other = c.onto === 'a' ? 'b' : 'a';
    const base = c[c.onto];
    const d = dotp(c.a, c.b);
    const len = S.fromSquare(dotp(base, base));
    const result = S.divS(d, len);
    const pick = c.a.length === 2 ? (k) => ({ tap: k }) : (k) => ({ choice: k });
    return [
      { wrong: pick(other), right: pick(c.onto), expectToast: 'alasTerbalik' },
      { wrong: { fields: { dot: String(d + 1) } }, right: { fields: { dot: String(d) } }, expectToast: 'hasilSalah' },
      { wrong: { fields: { len: String(dotp(base, base) + 1) } }, right: { fields: { len: S.toText(len) } }, leak: [S.toText(len)] },
      c.negative
        ? { wrong: { fields: { proj: S.toText(S.negS(result)) } }, right: { fields: { proj: S.toText(result) } }, expectToast: 'tandaDibuang', leak: [S.toText(result)] }
        : { wrong: { fields: { proj: S.toText(S.fraction(d, dotp(base, base))) } }, right: { fields: { proj: S.toText(result) } }, expectToast: 'penyebutKuadrat', leak: [S.toText(result)] },
    ];
  },

  vector_projection: (c) => {
    const bb = dotp(c.b, c.b);
    if (c.isZeroBase) {
      return [
        { wrong: { fields: { bb: '1' } }, right: { fields: { bb: '0' } } },
        { wrong: { choice: 'zero' }, right: { choice: 'undefined' }, expectToast: 'alasNol' },
      ];
    }
    const d = dotp(c.a, c.b);
    const scalar = S.fraction(d, bb);
    const proj = c.b.map((n) => S.toText(S.mulS(scalar, n)));
    const alongA = c.a.map((n) => S.toText(S.mulS(scalar, n)));
    return [
      { wrong: { fields: { dot: String(d + 1) } }, right: { fields: { dot: String(d) } } },
      { wrong: { fields: { bb: S.toText(S.fromSquare(bb)) } }, right: { fields: { bb: String(bb) } }, expectToast: 'diakarkanDulu', leak: [String(bb)] },
      // Kunci "2" tidak diperiksa: pangkat pada rumus |b|² di kalimatnya juga "2".
      { wrong: { fields: { k: S.toText(S.divS(d, S.fromSquare(bb))) } }, right: { fields: { k: S.toText(scalar) } }, expectToast: 'penyebutPangkatSatu', leak: S.toText(scalar) === '2' ? [] : [S.toText(scalar)] },
      { wrong: { fields: comps(alongA) }, right: { fields: comps(proj) }, expectToast: 'arahTidakSejajar' },
    ];
  },
});

const linear = (expr) => {
  const t = String(expr);
  if (/^-?\d+$/.test(t)) return [0, Number(t)];
  const m = /^(-?\d*)[a-z]([+-]\d+)?$/.exec(t);
  return [m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]), m[2] ? Number(m[2]) : 0];
};

Object.assign(PLANS, {
  parameter_hunter: (c) => {
    const terms = c.v.map(linear);
    const A = terms.reduce((s, [k]) => s + k * k, 0);
    const B = terms.reduce((s, [k, d]) => s + 2 * k * d, 0);
    const C = terms.reduce((s, [, d]) => s + d * d, 0);
    const R = c.norm * c.norm;
    const steps = [
      { wrong: { choice: 'sum' }, right: { choice: 'modulus' } },
      { wrong: { fields: { A: String(A), B: String(B), C: String(C), R: String(c.norm) } }, right: { fields: { A: String(A), B: String(B), C: String(C), R: String(R) } }, expectToast: 'ruasKananLupa', leak: [String(R)] },
      { wrong: { fields: { r1: String(c.roots[0]), r2: String(c.roots[0] + 100) } }, right: { fields: { r1: String(c.roots[1]), r2: String(c.roots[0]) } }, expectToast: 'akarKeduaBelumDicari', leak: [String(c.roots[1])] },
    ];
    if (c.constraint) {
      const valid = c.roots.filter((r) => r > 0);
      steps.push({ wrong: { choice: 'both' }, right: { choice: `root${valid[0]}` }, expectToast: 'syaratTerlewat' });
    }
    return steps;
  },

  quad_builder: (c) => {
    if (c.shape === 'jajargenjang') {
      const wrongAC = c.given.AB.map((n, i) => n - c.given.AD[i]);
      return [
        { wrong: { choice: 'ab' }, right: { choice: 'ok' }, expectToast: 'salahTerjemahan' },
        { wrong: { fields: comps(wrongAC) }, right: { fields: comps(c.answer) }, leak: [c.answer.join(', ')] },
      ];
    }
    return [
      ...c.facts.map(() => ({ wrong: { choice: 'eq' }, right: { choice: 'ok' }, expectToast: 'salahTerjemahan' })),
      { wrong: { fields: { a2: String(c.solve.a2 + 1) } }, right: { fields: { a2: String(c.solve.a2) } } },
      { wrong: { fields: { ans: String(c.solve.b) } }, right: { fields: { ans: String(c.answer) } }, expectToast: 'jawabPertanyaanLain', leak: [String(c.answer)] },
    ];
  },

  chain_displacement: (c) => {
    const AE = c.E.map((n, i) => n - c.A[i]);
    const sq = AE.reduce((s, n) => s + n * n, 0);
    const total = c.times.reduce((a, b) => a + b, 0);
    const tStar = (c.threshold * total) / Math.sqrt(sq);
    const inverted = (Math.sqrt(sq) * total) / c.threshold;
    const dec = (x) => x.toFixed(2).replace('.', ',');
    return [
      { wrong: { fields: comps(AE.map((n) => -n)) }, right: { fields: comps(AE) } },
      { wrong: { fields: { len: dec(Math.sqrt(sq)) } }, right: { fields: { len: S.toText(S.fromSquare(sq)) } }, expectToast: 'dibulatkanTerlaluDini' },
      { wrong: { fields: { total: String(total - 1) } }, right: { fields: { total: String(total) } }, expectToast: 'waktuTotalSalah', leak: [String(total)] },
      { wrong: { fields: { t: dec(inverted) } }, right: { fields: { t: dec(tStar) } }, expectToast: 'prosesTerbalik', leak: [dec(tStar)] },
      { wrong: { multi: [...c.answer, 'CE'] }, right: { multi: c.answer }, expectToast: 'ruasGabunganTerlewat' },
    ];
  },

  box_diagonal: (c) => {
    const edges = ['AB', 'AD', 'AE'];
    const set = c.expect.map((n, i) => (n === 0 ? null : `${n < 0 ? '-' : '+'}${edges[i]}`)).filter(Boolean);
    const negative = c.expect[0] < 0;
    const sq = c.expect.reduce((s, n) => s + n * n, 0);
    const len = S.toText(S.fromSquare(sq));
    return [
      negative
        ? { wrong: { multi: set.map((k) => k.replace('-AB', '+AB')) }, right: { multi: set }, expectToast: 'arahMundurTerlewat' }
        : { wrong: { multi: [set[0]] }, right: { multi: set }, expectToast: 'rusukKurang' },
      negative
        ? { wrong: { fields: comps(c.expect.map((n, i) => (i === 0 ? -n : n))) }, right: { fields: comps(c.expect) }, expectToast: 'arahMundurTerlewat' }
        : { wrong: { fields: comps(c.expect.map((n, i) => (i === 0 ? n + 1 : n))) }, right: { fields: comps(c.expect) } },
      len.includes('√')
        ? { wrong: { fields: { len: `√${sq}` } }, right: { fields: { len } }, leak: [len] }
        : { wrong: { fields: { len: String(Math.sqrt(sq) + 1) } }, right: { fields: { len } }, expectToast: 'panjangSalah', leak: [len] },
    ];
  },

  sniper_component: (c) => {
    if (c.op === 'norm') return [{ wrong: { choice: 'yes' }, right: { choice: 'no' }, expectToast: 'sniperTidakBerlaku' }];
    const [L, R] = c.op === 'perp' ? [c.a, c.b] : [c.u, c.v];
    const p = L.findIndex((x) => typeof x === 'string');
    const constant = L.reduce((s, x, i) => (i === p ? s : s + x * R[i]), 0);
    return [
      { wrong: { tap: `t${(p + 1) % L.length}` }, right: { tap: `t${p}` }, expectToast: 'sukuSalahDipilih' },
      { wrong: { fields: { const: String(constant + 1) } }, right: { fields: { const: String(constant) } }, expectToast: 'konstantaBelumDijumlah', leak: [String(constant)] },
      { wrong: { fields: { p: String(c.solve + 1) } }, right: { fields: { p: String(c.solve) } } },
    ];
  },
});

/* ------------------------------------------------------------
   Jalankan
   ------------------------------------------------------------ */
const log = document.getElementById('log');
const results = [];

for (const chapter of CHAPTERS) {
  const data = await (await fetch(`../data/chapters/${chapter}.json`, { cache: 'no-store' })).json();
  for (const sub of data.subtopics) {
    const def = sub.simulation;
    if (only && def.engine !== only) continue;
    if (!isRegistered(def.engine)) {
      results.push({ name: def.engine, ok: null });
      log.insertAdjacentHTML('beforeend', `<div>· ${def.engine} — belum terdaftar</div>`);
      continue;
    }
    const plan = PLANS[def.engine];
    try {
      assert(plan, 'rencana uji belum ditulis');
      const errorsBefore = consoleErrors.length;
      const warningsBefore = templateWarnings.length;
      const notes = await runEngine(def, plan);
      assert(consoleErrors.length === errorsBefore, `galat konsol: ${consoleErrors.slice(errorsBefore).join(' | ')}`);
      assert(templateWarnings.length === warningsBefore, `kalimat bolong: ${templateWarnings.slice(warningsBefore).join(' | ')}`);
      results.push({ name: def.engine, ok: true, notes });
      log.insertAdjacentHTML('beforeend', `<div class="ok">✓ ${def.engine} (${notes.length} jawaban salah ditolak berkalimat)</div>`);
    } catch (err) {
      results.push({ name: def.engine, ok: false, error: String(err && err.message) });
      log.insertAdjacentHTML('beforeend', `<div class="no">✗ ${def.engine}\n    ${String(err && err.message)}</div>`);
    }
  }
}

/* ------------------------------------------------------------
   Pemulihan sesi — sekali, pada engine multi-kasus berbidang
   ------------------------------------------------------------ */
if (!only || only === 'position_guided') {
  const data = await (await fetch('../data/chapters/01_konsep_dasar.json', { cache: 'no-store' })).json();
  const def = data.subtopics.find((s) => s.simulation.engine === 'position_guided').simulation;
  try {
    host.innerHTML = '';
    hint.innerHTML = '';
    let completes = 0;
    const saved = [];
    // Kasus 1 selesai, siswa terakhir di kasus 2 → harus mendarat di kasus 2.
    let sim = mountSimulation(host, def, () => { completes += 1; }, {
      hintHost: hint,
      resumeState: { solved: [0], caseIndex: 1 },
      resumeSlide: 1,
      onStateChange: (p) => saved.push(p),
    });
    assert(sim.caseIndex === 1, `pemulihan: mendarat di kasus ${sim.caseIndex + 1}, seharusnya 2`);
    assert(sim.solved.has(0) && !sim.solved.has(1), 'pemulihan: status kasus selesai tidak dipulihkan');
    const chips = [...hint.querySelectorAll('.case-chip')].map((c) => c.dataset.state);
    assert(chips.join() === 'solved,current,locked,locked', `pemulihan: status chip ${chips.join()}`);
    assert(completes === 0, 'pemulihan: onComplete terpanggil padahal belum tuntas');
    sim.destroy();

    // Lompatan ke kasus yang BELUM terjangkau ditolak.
    host.innerHTML = '';
    hint.innerHTML = '';
    sim = mountSimulation(host, def, () => {}, { hintHost: hint, resumeState: { solved: [], caseIndex: 0 }, resumeSlide: 2 });
    assert(sim.caseIndex === 0, `pemulihan: lompat ke kasus terkunci ${sim.caseIndex + 1}`);
    sim.destroy();

    // Semua kasus pernah selesai → Mini Kuis terbuka TANPA toast sukses ulang.
    host.innerHTML = '';
    hint.innerHTML = '';
    toasts.length = 0;
    completes = 0;
    sim = mountSimulation(host, def, () => { completes += 1; }, { hintHost: hint, resumeState: { solved: [0, 1, 2, 3], caseIndex: 3 } });
    await frames(2);
    assert(completes === 1, `kunjungan ulang: onComplete ${completes}×`);
    assert(!toasts.some((t) => t.type === 'success'), 'kunjungan ulang: toast sukses berbunyi lagi');
    // Simulasi tuntas TIDAK boleh terulang sendiri: penutup "tuntas" tampil,
    // papan tersembunyi, chip kasus terkunci — baru "Ulangi" yang membukanya.
    const cover = host.querySelector('.sim-complete');
    assert(cover, 'kunjungan ulang: penutup "Simulasi tuntas" tidak tampil');
    assert(getComputedStyle(host.querySelector('.sim-board')).visibility === 'hidden', 'kunjungan ulang: papan simulasi masih bisa dikerjakan');
    assert([...hint.querySelectorAll('.case-chip')].every((c) => c.disabled), 'kunjungan ulang: chip kasus masih bisa diketuk');
    cover.querySelector('[data-sim-action="restart"]').click();
    await frames(2);
    assert(!host.querySelector('.sim-complete') && sim.solved.size === 0 && sim.caseIndex === 0 && sim.currentStep,
      'Ulangi tidak memulai simulasi dari kasus pertama');
    sim.destroy();
    results.push({ name: 'pemulihan-sesi', ok: true, notes: [] });
    log.insertAdjacentHTML('beforeend', '<div class="ok">✓ pemulihan sesi (kasus, chip, lompatan terkunci, kunjungan ulang)</div>');
  } catch (err) {
    results.push({ name: 'pemulihan-sesi', ok: false, error: String(err && err.message) });
    log.insertAdjacentHTML('beforeend', `<div class="no">✗ pemulihan sesi\n    ${String(err && err.message)}</div>`);
  }
}

const tested = results.filter((r) => r.ok !== null);
const failed = tested.filter((r) => !r.ok);
log.insertAdjacentHTML('afterbegin', `<div class="${failed.length ? 'no' : 'ok'}">${tested.length - failed.length}/${tested.length} engine lolos · ${results.length - tested.length} belum terdaftar</div>`);
window.__simTest = { done: true, passed: tested.length - failed.length, failed: failed.length, pending: results.length - tested.length, failures: failed, results };
