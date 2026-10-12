/**
 * tests/plane.browser.mjs — Uji pengukuran bidang kartesius SVG di peramban.
 * Dimuat oleh tests/plane.html. Lihat komentar di sana untuk cara menjalankan.
 *
 * Doktrin Blueprint §8.2: UKUR, jangan baca kode. Setiap uji di sini membaca
 * hasil render (CTM, bounding box, elementFromPoint, gaya terhitung), bukan
 * atribut yang ditulis kode sendiri — kecuali atribut itu memang kontraknya.
 */

/* ------------------------------------------------------------
   Spy dipasang SEBELUM modul bidang dimuat: ResizeObserver dan
   add/removeEventListener di window & document.
   ------------------------------------------------------------ */
const spy = { observers: [], listeners: new Map() };

const NativeRO = window.ResizeObserver;
window.ResizeObserver = class SpyResizeObserver extends NativeRO {
  constructor(cb) {
    const record = { observed: 0, disconnected: false, calls: 0 };
    super((entries, obs) => { record.calls += 1; cb(entries, obs); });
    this.__record = record;
    spy.observers.push(record);
  }
  observe(...args) { this.__record.observed += 1; return super.observe(...args); }
  disconnect() { this.__record.disconnected = true; return super.disconnect(); }
};

for (const target of [window, document]) {
  const add = target.addEventListener.bind(target);
  const remove = target.removeEventListener.bind(target);
  const key = target === window ? 'window' : 'document';
  target.addEventListener = (type, fn, opts) => {
    const k = `${key}:${type}`;
    spy.listeners.set(k, (spy.listeners.get(k) || 0) + 1);
    return add(type, fn, opts);
  };
  target.removeEventListener = (type, fn, opts) => {
    const k = `${key}:${type}`;
    spy.listeners.set(k, (spy.listeners.get(k) || 0) - 1);
    return remove(type, fn, opts);
  };
}

const consoleErrors = [];
window.addEventListener('error', (e) => consoleErrors.push(String(e.message)));
window.addEventListener('unhandledrejection', (e) => consoleErrors.push(String(e.reason)));
const baselineListeners = new Map(spy.listeners);

const { createVectorPlane } = await import('../js/domain/plane/vectorPlane.js');
const V = await import('../js/domain/vector.js');

/* ------------------------------------------------------------
   Harness
   ------------------------------------------------------------ */
const results = [];
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

function assert(cond, message) {
  if (!cond) throw new Error(message || 'asersi gagal');
}
function near(a, b, tol, label) {
  assert(Math.abs(a - b) <= tol, `${label || ''} ${a} ≉ ${b} (±${tol})`);
}

const host = document.getElementById('host');
const rig = document.getElementById('rig');
const frames = (n = 2) => new Promise((r) => {
  const step = () => (n-- <= 0 ? r() : requestAnimationFrame(step));
  requestAnimationFrame(step);
});

function fresh(opts = {}) {
  rig.style.width = '640px';
  rig.style.height = '360px';
  return createVectorPlane(host, { xRange: [-6, 6], yRange: [-4, 4], ...opts });
}

/** Titik SVG (unit pengguna) → titik klien (px layar) lewat CTM yang DIRENDER. */
function toClient(svg, [x, y]) {
  const p = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM());
  return [p.x, p.y];
}

/** Ujung-ujung path "M x y L x y" → titik klien. */
function pathEnds(svg, pathEl) {
  const nums = pathEl.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
  return [toClient(svg, [nums[0], nums[1]]), toClient(svg, [nums[nums.length - 2], nums[nums.length - 1]])];
}

function center(el) {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}

function pointer(el, type, [clientX, clientY], extra = {}) {
  el.dispatchEvent(new PointerEvent(type, {
    bubbles: true, cancelable: true, composed: true,
    pointerId: 7, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1,
    clientX, clientY, ...extra,
  }));
}

/* ============================================================
   KONTRAK 2 — skala 1:1 & viewBox
   ============================================================ */
test('SVG terpasang dengan preserveAspectRatio xMidYMid meet dan lapisan berurutan', async () => {
  const plane = fresh();
  try {
    const svg = host.querySelector('svg.plane');
    assert(svg, 'svg.plane tidak ada');
    assert(svg.getAttribute('preserveAspectRatio') === 'xMidYMid meet', 'preserveAspectRatio salah');
    const order = [...svg.children].filter((n) => n.classList.contains('plane__layer')).map((n) => n.classList[1]);
    assert(order.join(',') === 'plane__layer--grid,plane__layer--axis,plane__layer--pick,plane__layer--shape,plane__layer--interactive,plane__layer--label',
      `urutan lapisan: ${order}`);
  } finally { plane.destroy(); }
});

test('viewBox = ukuran piksel wadah, CTM seragam (a = d, tanpa geser miring)', async () => {
  const plane = fresh();
  try {
    const svg = plane.svg;
    const r = svg.getBoundingClientRect();
    const cs = getComputedStyle(svg);
    const contentW = r.width - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
    const contentH = r.height - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth);
    const [, , w, h] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    // Dibandingkan dengan KOTAK KONTEN: versi lama membandingkan kotak luar
    // (termasuk border) dan meloloskan skala 0,997 yang meleset.
    near(w, contentW, 0.5, 'lebar viewBox');
    near(h, contentH, 0.5, 'tinggi viewBox');
    const m = svg.getScreenCTM();
    near(m.a, 1, 1e-3, '1 satuan pengguna = 1 piksel CSS');
    near(m.a, m.d, 1e-6, 'skala x vs y');
    near(m.b, 0, 1e-9, 'b');
    near(m.c, 0, 1e-9, 'c');
  } finally { plane.destroy(); }
});

test('DIUKUR: jarak kisi 1 satuan di x sama dengan di y (≤ 0,5 px)', async () => {
  const plane = fresh();
  try {
    const line = (axis, v) => plane.svg.querySelector(`.plane__grid-line[data-axis="${axis}"][data-value="${v}"]`);
    const dx = line('x', 1).getBoundingClientRect().left - line('x', 0).getBoundingClientRect().left;
    const dy = line('y', 0).getBoundingClientRect().top - line('y', 1).getBoundingClientRect().top;
    assert(dx > 10, `jarak kisi x terlalu kecil: ${dx}`);
    near(dx, dy, 0.5, 'satuan x vs y');
  } finally { plane.destroy(); }
});

/* ============================================================
   KONTRAK 1 — sumbu y terbalik
   ============================================================ */
test('DIUKUR: titik (0, 3) dirender DI ATAS titik (0, −3)', async () => {
  const plane = fresh();
  try {
    const up = plane.drawPoint([0, 3]);
    const down = plane.drawPoint([0, -3]);
    assert(center(up.el)[1] < center(down.el)[1] - 100, 'sumbu y tidak terbalik');
  } finally { plane.destroy(); }
});

test('DIUKUR: vektor (3, 3) tampil tepat 45° di layar', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [3, 3], name: 'u' });
    const [[x0, y0], [x1, y1]] = pathEnds(plane.svg, a.el.querySelector('.plane__arrow-hit'));
    near((Math.atan2(y0 - y1, x1 - x0) * 180) / Math.PI, 45, 0.5, 'sudut layar');
  } finally { plane.destroy(); }
});

test('Ujung kepala panah jatuh tepat di koordinat vektor', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ from: [-2, -1], to: [3, 2], name: 'v' });
    const [, tip] = pathEnds(plane.svg, a.el.querySelector('.plane__arrow-hit'));
    const expected = toClient(plane.svg, plane.toScreen([3, 2]));
    near(tip[0], expected[0], 0.5, 'tip x');
    near(tip[1], expected[1], 0.5, 'tip y');
    const [, shaftEnd] = pathEnds(plane.svg, a.el.querySelector('.plane__arrow-line'));
    const marker = a.el.querySelector('marker');
    const headLength = Number(marker.getAttribute('markerWidth'));
    near(Math.hypot(tip[0] - shaftEnd[0], tip[1] - shaftEnd[1]), headLength, 0.6, 'celah batang–ujung = panjang kepala');
  } finally { plane.destroy(); }
});

/* ============================================================
   KONTRAK 3 — pointer-events
   ============================================================ */
test('Lapisan kisi & sumbu bergaya pointer-events: none (terhitung)', async () => {
  const plane = fresh();
  try {
    for (const cls of ['grid', 'axis', 'label']) {
      const layer = plane.svg.querySelector(`.plane__layer--${cls}`);
      assert(getComputedStyle(layer).pointerEvents === 'none', `${cls}: ${getComputedStyle(layer).pointerEvents}`);
    }
  } finally { plane.destroy(); }
});

test('DIUKUR: elementFromPoint di tengah panah mengenai PANAH, di sumbu tidak pernah garis kisi', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ from: [-3, 0], to: [3, 0], name: 'w' });   // tepat menimpa sumbu x
    const mid = toClient(plane.svg, plane.toScreen([1, 0]));
    const hit = document.elementFromPoint(mid[0], mid[1]);
    assert(hit && hit.closest('.plane__arrow') === a.el, `yang terkena: ${hit && hit.getAttribute('class')}`);
    const empty = toClient(plane.svg, plane.toScreen([-5, 3]));             // perpotongan kisi kosong
    const other = document.elementFromPoint(empty[0], empty[1]);
    assert(!other.closest('.plane__grid-line, .plane__axis, .plane__axis-tick'), 'kisi menangkap pointer');
  } finally { plane.destroy(); }
});

/* ============================================================
   KONTRAK 4 — marker kepala panah
   ============================================================ */
test('Marker per panah: userSpaceOnUse, di DALAM grup panah, warnanya mewarisi nada', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [2, 3], name: 'u', tone: 'amber' });
    const line = a.el.querySelector('.plane__arrow-line');
    const ref = line.getAttribute('marker-end').match(/#([^)]+)\)/)[1];
    const marker = document.getElementById(ref);
    assert(marker && a.el.contains(marker), 'marker tidak di dalam grup panah');
    assert(marker.getAttribute('markerUnits') === 'userSpaceOnUse', 'markerUnits bukan userSpaceOnUse');
    const head = marker.querySelector('.plane__arrow-head');
    assert(getComputedStyle(head).fill === getComputedStyle(line).stroke, `kepala ${getComputedStyle(head).fill} ≠ garis ${getComputedStyle(line).stroke}`);
    // Amber di kertas grafik terang = --plane-amber (#B45309), bukan amber murni.
    assert(getComputedStyle(head).fill === 'rgb(180, 83, 9)', `nada amber: ${getComputedStyle(head).fill}`);
  } finally { plane.destroy(); }
});

test('Sorotan menebalkan GARIS, ukuran kepala tetap', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [4, 1], name: 'u' });
    const line = a.el.querySelector('.plane__arrow-line');
    const marker = a.el.querySelector('marker');
    const before = [marker.getAttribute('markerWidth'), marker.getAttribute('markerHeight'), getComputedStyle(line).strokeWidth];
    plane.highlight('u');
    await frames(3);
    const after = [marker.getAttribute('markerWidth'), marker.getAttribute('markerHeight'), getComputedStyle(line).strokeWidth];
    assert(a.el.classList.contains('is-highlight'), 'kelas sorotan tidak terpasang');
    assert(parseFloat(after[2]) > parseFloat(before[2]), `garis tidak menebal: ${before[2]} → ${after[2]}`);
    assert(before[0] === after[0] && before[1] === after[1], 'ukuran kepala berubah');
  } finally { plane.destroy(); }
});

/**
 * Hitung piksel KEPALA panah yang benar-benar dirender perenderer SVG.
 *
 * Konten <marker> tidak bisa diukur lewat DOM: getBoundingClientRect = 0×0
 * dan getBBox selalu melaporkan ukuran lokal 13×10 apa pun markerUnits-nya
 * (terukur). Jadi grup panah diserialisasi ke SVG mandiri — kepala diwarnai
 * biru murni, batang merah murni, lebar batang disalin dari gaya terhitung —
 * lalu dirender ke <canvas> dan piksel birunya dihitung.
 */
async function renderedHeadPixels(arrow, strokeWidth) {
  const clone = arrow.el.cloneNode(true);
  clone.querySelector('.plane__arrow-hit').remove();
  const head = clone.querySelector('.plane__arrow-head');
  head.setAttribute('style', 'fill:#0000ff');
  const line = clone.querySelector('.plane__arrow-line');
  line.setAttribute('style', `fill:none;stroke:#ff0000;stroke-width:${strokeWidth};stroke-linecap:round`);
  const [, , w, h] = arrow.el.ownerSVGElement.getAttribute('viewBox').split(/\s+/).map(Number);
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(w)}" height="${Math.ceil(h)}" viewBox="0 0 ${w} ${h}">${clone.outerHTML}</svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w);
  canvas.height = Math.ceil(h);
  const g = canvas.getContext('2d');
  g.drawImage(img, 0, 0);
  const { data } = g.getImageData(0, 0, canvas.width, canvas.height);
  let blue = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 2] > 128 && data[i] < 100 && data[i + 1] < 100 && data[i + 3] > 128) blue += 1;
  }
  return blue;
}

test('DIUKUR (piksel): kepala panah berukuran SAMA pada garis normal dan garis sorotan', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [4, 1], name: 'u' });
    const line = a.el.querySelector('.plane__arrow-line');
    const normalWidth = getComputedStyle(line).strokeWidth;
    plane.highlight('u');
    await frames(3);
    const highlightWidth = getComputedStyle(line).strokeWidth;
    assert(parseFloat(highlightWidth) > parseFloat(normalWidth), 'sorotan tidak menebalkan garis');
    const normal = await renderedHeadPixels(a, normalWidth);
    const highlighted = await renderedHeadPixels(a, highlightWidth);
    assert(normal > 20, `kepala tidak terlihat di render (${normal} px)`);
    near(highlighted / normal, 1, 0.08, `rasio piksel kepala ${highlighted}/${normal}`);
  } finally { plane.destroy(); }
});

test('setTone mengganti warna garis DAN kepala bersamaan', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [1, 3], name: 'u', tone: 'blue' });
    a.setTone('success');
    const line = a.el.querySelector('.plane__arrow-line');
    const head = a.el.querySelector('.plane__arrow-head');
    assert(!a.el.classList.contains('plane__arrow--blue') && a.el.classList.contains('plane__arrow--success'), 'kelas nada');
    assert(getComputedStyle(head).fill === getComputedStyle(line).stroke, 'kepala tertinggal nada lama');
  } finally { plane.destroy(); }
});

/* ============================================================
   KONTRAK 5 — label <foreignObject> + KaTeX
   ============================================================ */
test('Label panah adalah foreignObject berisi KaTeX; tidak ada <text> di lapisan label', async () => {
  const plane = fresh();
  try {
    plane.drawVector({ to: [3, 1], name: 'u' });
    plane.drawVector({ from: [-3, -1], to: [2, 3], name: 'AB' });
    const labels = plane.svg.querySelectorAll('.plane__layer--label foreignObject.plane__label');
    assert(labels.length === 2, `label: ${labels.length}`);
    labels.forEach((fo) => assert(fo.querySelector('.plane__label-inner .katex'), 'KaTeX tidak dirender'));
    assert(plane.svg.querySelectorAll('.plane__layer--label text').length === 0, '<text> di lapisan label');
    const box = labels[0].querySelector('.plane__label-inner').getBoundingClientRect();
    assert(box.width > 8 && box.height > 8, 'label tidak terlihat');
  } finally { plane.destroy(); }
});

test('Aksioma §1.1: busur sudut TANPA angka; siku-siku memakai penanda persegi', async () => {
  const plane = fresh();
  try {
    const arc = plane.drawAngleArc([3, 1], [1, 3]);
    assert(arc.el.querySelector('.plane__arc'), 'busur tidak ada');
    const slot = plane.svg.querySelector('.plane__arc-slot');
    assert(slot && slot.textContent.trim() === '', `slot bocor: "${slot && slot.textContent}"`);
    const right = plane.drawAngleArc([3, 4], [-4, 3]);
    assert(right.el.querySelector('.plane__arc--right'), 'penanda siku tidak ada');
    arc.setLabel('\\theta');
    assert(slot.querySelector('.katex'), 'setLabel tidak merender KaTeX');
  } finally { plane.destroy(); }
});

/* ============================================================
   INTERAKSI
   ============================================================ */
test('setTappable: klik nyata di elementFromPoint dan Enter memanggil handler; role & aria', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [4, 2], name: 'u' });
    const calls = [];
    a.setTappable((arrow) => calls.push(arrow), 'Pilih vektor u');
    const mid = toClient(plane.svg, plane.toScreen([2, 1]));
    document.elementFromPoint(mid[0], mid[1]).dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: mid[0], clientY: mid[1] }));
    a.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    assert(calls.length === 2 && calls[0] === a, `panggilan: ${calls.length}`);
    assert(a.el.getAttribute('role') === 'button' && a.el.getAttribute('tabindex') === '0', 'role/tabindex');
    assert(a.el.getAttribute('aria-label') === 'Pilih vektor u', 'aria-label');
    assert(a.el.classList.contains('is-tappable'), 'kelas is-tappable');
  } finally { plane.destroy(); }
});

test('Titik yang bisa diketuk punya sasaran sentuh ≥ 44px; titik biasa tidak menghalangi panah', async () => {
  // Regresi Tahap 4: titik 5,5px terukur 11×11px — hampir mustahil diketuk jempol.
  const plane = fresh();
  try {
    const a = plane.drawVector({ from: [-4, 0], to: [4, 0], name: 'u' });
    const idle = plane.drawPoint([0, 0]);
    const near = toClient(plane.svg, plane.toScreen([0.3, 0]));
    assert(document.elementFromPoint(near[0], near[1]).closest('.plane__arrow') === a.el, 'titik tak-ketuk menghalangi panah');
    const taps = [];
    idle.setTappable(() => taps.push(1), 'Titik asal');
    const hit = idle.el.querySelector('.plane__point-hit').getBoundingClientRect();
    assert(hit.width >= 44 && hit.height >= 44, `sasaran ${hit.width}×${hit.height}`);
    const edge = toClient(plane.svg, plane.toScreen([0, 0]));
    document.elementFromPoint(edge[0] + 18, edge[1] - 10).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    assert(taps.length === 1, 'ketukan 18px dari pusat titik tidak mengenai titik');
  } finally { plane.destroy(); }
});

test('Mode pilih-titik: ketukan di pangkal panah & di titik tak-ketuk sampai ke lapisan pilih', async () => {
  // Regresi soal ketuk-bidang: titik P pada panah PQ tertelan jalur ketuk
  // panah (22px) dan titik 11px — siswa mengetuk P, tidak terjadi apa-apa.
  const plane = fresh();
  try {
    const a = plane.drawVector({ from: [-2, 1], to: [3, 2], name: 'PQ' });
    plane.drawPoint([-2, 1], { label: 'P' });
    const atP = toClient(plane.svg, plane.toScreen([-2, 1]));
    assert(document.elementFromPoint(atP[0], atP[1]).closest('.plane__arrow') === a.el, 'di luar mode pilih, panah harus tetap terkena');
    const picks = [];
    const release = plane.enablePointPicking((p) => picks.push(p));
    const target = document.elementFromPoint(atP[0], atP[1]);
    assert(target && target.classList.contains('plane__pick'), `yang terkena: ${target && (target.getAttribute('class') || target.tagName)}`);
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: atP[0], clientY: atP[1] }));
    assert(picks.length === 1 && picks[0][0] === -2 && picks[0][1] === 1, `pilihan ${JSON.stringify(picks)}`);
    release();
    assert(!plane.svg.classList.contains('is-picking'), 'kelas is-picking tertinggal sesudah dilepas');
    assert(document.elementFromPoint(atP[0], atP[1]).closest('.plane__arrow') === a.el, 'panah tidak kembali terkena sesudah mode pilih');
  } finally { plane.destroy(); }
});

test('lock(): panah terkunci tidak lagi menerima ketukan (diukur lewat elementFromPoint)', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [4, 2], name: 'u' });
    a.setTappable(() => {});
    a.lock(true);
    const mid = toClient(plane.svg, plane.toScreen([2, 1]));
    const hit = document.elementFromPoint(mid[0], mid[1]);
    assert(!hit.closest('.plane__arrow'), 'panah terkunci masih tertangkap');
  } finally { plane.destroy(); }
});

test('Seret ujung: pointer ke (4, 1) → onChange([4, 1]); dibulatkan ke kisi; path ikut pindah', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [2, 2], name: 'u' });
    const changes = [];
    a.setDraggableTip((p) => changes.push(p));
    const handle = a.el.querySelector('.plane__tip-hit');
    assert(handle, 'pegangan ujung tidak ada');
    const r = handle.getBoundingClientRect();
    assert(r.width >= 40 && r.height >= 40, `sasaran sentuh ${r.width}×${r.height} < 44px`);
    pointer(handle, 'pointerdown', center(handle));
    pointer(handle, 'pointermove', toClient(plane.svg, plane.toScreen([4.3, 0.8])));
    pointer(handle, 'pointerup', toClient(plane.svg, plane.toScreen([4.3, 0.8])));
    assert(JSON.stringify(changes.at(-1)) === '[4,1]', `onChange: ${JSON.stringify(changes)}`);
    assert(JSON.stringify(a.to) === '[4,1]', `arrow.to: ${JSON.stringify(a.to)}`);
    const [, tip] = pathEnds(plane.svg, a.el.querySelector('.plane__arrow-hit'));
    const expected = toClient(plane.svg, plane.toScreen([4, 1]));
    near(tip[0], expected[0], 0.5); near(tip[1], expected[1], 0.5);
  } finally { plane.destroy(); }
});

test('Padanan tanpa seret: tombol panah pada pegangan menggeser ujung satu satuan', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [2, 2], name: 'u' });
    const changes = [];
    a.setDraggableTip((p) => changes.push(p));
    const handle = a.el.querySelector('.plane__tip-hit');
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    assert(JSON.stringify(a.to) === '[3,1]', `arrow.to: ${JSON.stringify(a.to)}`);
    assert(changes.length === 2, `onChange: ${changes.length}`);
  } finally { plane.destroy(); }
});

test('Pemilihan titik: ketuk kisi kosong → titik matematika terbulat; ketuk panah tetap milik panah', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [4, 2], name: 'u' });
    const picks = [];
    const arrowTaps = [];
    a.setTappable(() => arrowTaps.push(1));
    plane.enablePointPicking((p) => picks.push(p));
    const spot = toClient(plane.svg, plane.toScreen([-2.2, -1.1]));
    document.elementFromPoint(spot[0], spot[1]).dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: spot[0], clientY: spot[1] }));
    const mid = toClient(plane.svg, plane.toScreen([2, 1]));
    document.elementFromPoint(mid[0], mid[1]).dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: mid[0], clientY: mid[1] }));
    assert(JSON.stringify(picks) === '[[-2,-1]]', `picks: ${JSON.stringify(picks)}`);
    assert(arrowTaps.length === 1, 'ketukan panah dicuri lapisan pilih');
  } finally { plane.destroy(); }
});

/* ============================================================
   RESIZE
   ============================================================ */
test('Resize: viewBox mengikuti, skala tetap seragam, panah digambar ulang di koordinat yang sama', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [3, 3], name: 'u' });
    const hostHeight = host.getBoundingClientRect().height;
    let layouts = 0;
    plane.onLayout(() => { layouts += 1; });
    rig.style.width = '420px';
    await frames(4);
    assert(layouts >= 1, 'tidak ada layout ulang');
    const [, , w] = plane.svg.getAttribute('viewBox').split(/\s+/).map(Number);
    near(w, 418, 0.5, 'viewBox baru = 420 − border 2px');
    const m = plane.svg.getScreenCTM();
    near(m.a, m.d, 1e-6, 'skala seragam sesudah resize');
    const [[x0, y0], [x1, y1]] = pathEnds(plane.svg, a.el.querySelector('.plane__arrow-hit'));
    near((Math.atan2(y0 - y1, x1 - x0) * 180) / Math.PI, 45, 0.5, 'sudut sesudah resize');
    const expected = toClient(plane.svg, plane.toScreen([3, 3]));
    near(x1, expected[0], 0.5); near(y1, expected[1], 0.5);
    near(host.getBoundingClientRect().height, hostHeight, 0.5, 'tinggi wadah bergeser');
    const labelFo = plane.svg.querySelector('.plane__layer--label foreignObject');
    const labelMid = center(labelFo.querySelector('.plane__label-inner'));
    const arrowMid = toClient(plane.svg, plane.toScreen([1.5, 1.5]));
    assert(Math.hypot(labelMid[0] - arrowMid[0], labelMid[1] - arrowMid[1]) < 40, 'label tertinggal di posisi lama');
  } finally { plane.destroy(); }
});

test('Wadah tersembunyi (0×0) tidak melempar dan tidak menulis NaN; pulih saat tampil lagi', async () => {
  const plane = fresh();
  try {
    plane.drawVector({ to: [2, 1], name: 'u' });
    rig.style.display = 'none';
    await frames(3);
    assert(!plane.svg.outerHTML.includes('NaN'), 'NaN tertulis saat tersembunyi');
    rig.style.display = '';
    await frames(4);
    assert(!plane.svg.outerHTML.includes('NaN'), 'NaN sesudah tampil');
    const m = plane.svg.getScreenCTM();
    near(m.a, m.d, 1e-6);
  } finally { rig.style.display = ''; plane.destroy(); }
});

/* ============================================================
   ANIMASI, KASUS TEPI, PROYEKSI
   ============================================================ */
test('setVector beranimasi dan berakhir tepat di koordinat baru', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [1, 1], name: 'u' });
    const done = await a.setVector({ to: [-2, 3] }, { animate: true, duration: 120 });
    assert(done === true, 'animasi tidak selesai');
    const [, tip] = pathEnds(plane.svg, a.el.querySelector('.plane__arrow-hit'));
    const expected = toClient(plane.svg, plane.toScreen([-2, 3]));
    near(tip[0], expected[0], 0.5); near(tip[1], expected[1], 0.5);
  } finally { plane.destroy(); }
});

test('Vektor nol digambar sebagai titik (tanpa NaN) dan kembali jadi panah saat diubah', async () => {
  const plane = fresh();
  try {
    const a = plane.drawVector({ to: [0, 0], name: 'o' });
    assert(a.el.classList.contains('is-zero'), 'kelas is-zero');
    const dot = a.el.querySelector('.plane__arrow-zero');
    assert(dot && getComputedStyle(dot).display !== 'none', 'titik nol tidak tampil');
    assert(!plane.svg.outerHTML.includes('NaN'), 'NaN');
    a.setVector({ to: [2, 0] });
    assert(!a.el.classList.contains('is-zero'), 'masih is-zero');
    assert(getComputedStyle(a.el.querySelector('.plane__arrow-line')).display !== 'none', 'garis tidak kembali');
  } finally { plane.destroy(); }
});

test('Vektor ruang (z ≠ 0) ditolak dengan TypeError; vec(x, y) diterima', async () => {
  const plane = fresh();
  try {
    let threw = null;
    try { plane.drawVector({ to: V.vec(1, 2, 3), name: 'r' }); } catch (e) { threw = e; }
    assert(threw instanceof TypeError, `lemparan: ${threw}`);
    const ok = plane.drawVector({ to: V.vec(1, 2), name: 's' });
    assert(JSON.stringify(ok.to) === '[1,2]');
  } finally { plane.destroy(); }
});

test('Proyeksi: kaki tegak lurus jatuh di proj_b a yang dihitung vector.js', async () => {
  const plane = fresh();
  try {
    const proj = plane.drawProjection([4, 3], [2, 1]);
    const foot = V.projVector(V.vec(4, 3), V.vec(2, 1));
    const drop = proj.el.querySelector('.plane__proj-drop');
    assert(drop, 'garis jatuh tidak ada');
    const [start, end] = pathEnds(plane.svg, drop);
    const tipA = toClient(plane.svg, plane.toScreen([4, 3]));
    const footScreen = toClient(plane.svg, plane.toScreen([foot.x, foot.y]));
    near(start[0], tipA[0], 0.5); near(start[1], tipA[1], 0.5);
    near(end[0], footScreen[0], 0.5); near(end[1], footScreen[1], 0.5);
    assert(proj.el.querySelector('.plane__proj-foot'), 'penanda kaki');
  } finally { plane.destroy(); }
});

test('Jajargenjang & garis bantu komponen berada di lapisan bentuk dan tidak menangkap pointer', async () => {
  const plane = fresh();
  try {
    const u = plane.drawVector({ to: [3, 1], name: 'u' });
    const para = plane.drawParallelogram([3, 1], [1, 2]);
    const guides = plane.drawGuides(u);
    assert(para.el.closest('.plane__layer--shape') && guides.el.closest('.plane__layer--shape'), 'lapisan');
    assert(guides.el.querySelectorAll('.plane__guide').length === 2, 'dua garis bantu');
    const inside = toClient(plane.svg, plane.toScreen([2, 1.6]));
    const hit = document.elementFromPoint(inside[0], inside[1]);
    assert(!hit.closest('.plane__parallelogram'), 'jajargenjang menangkap pointer');
  } finally { plane.destroy(); }
});

test('API panggung: highlight / pulse / mute berdasarkan nama, getArrow, clear()', async () => {
  const plane = fresh();
  try {
    plane.drawVector({ to: [3, 1], name: 'u' });
    plane.drawVector({ to: [1, 3], name: 'v' });
    plane.pulse('u');
    plane.mute('v');
    assert(plane.getArrow('u').el.classList.contains('is-pulse'), 'pulse');
    assert(plane.getArrow('v').el.classList.contains('is-muted'), 'mute');
    plane.pulse('u', false);
    assert(!plane.getArrow('u').el.classList.contains('is-pulse'), 'pulse off');
    plane.clear();
    assert(plane.getArrow('u') === null, 'clear tidak membuang panah');
    assert(plane.svg.querySelectorAll('.plane__layer--interactive > *, .plane__layer--label > *').length === 0, 'sisa node');
    assert(plane.svg.querySelectorAll('.plane__grid-line').length > 0, 'clear membuang kisi');
  } finally { plane.destroy(); }
});

/* ============================================================
   KONTRAK 6 — destroy()
   ============================================================ */
test('destroy(): SVG dilepas, ResizeObserver diputus, animasi dibatalkan, pemanggilan berikutnya ditolak', async () => {
  const before = spy.observers.length;
  const plane = fresh();
  const a = plane.drawVector({ to: [1, 1], name: 'u' });
  const record = spy.observers[before];
  assert(record && record.observed >= 1, 'ResizeObserver tidak dipakai');
  const pending = a.setVector({ to: [5, 3] }, { animate: true, duration: 2000 });
  plane.destroy();
  assert(record.disconnected, 'ResizeObserver tidak diputus');
  assert(!host.querySelector('svg'), 'svg tertinggal');
  assert((await pending) === false, 'animasi tidak dibatalkan');
  const calls = record.calls;
  rig.style.width = '500px';
  await frames(4);
  assert(record.calls === calls, 'observer masih menembak sesudah destroy');
  let threw = false;
  try { plane.drawVector({ to: [1, 0] }); } catch { threw = true; }
  assert(threw, 'drawVector sesudah destroy tidak ditolak');
  a.highlight(); a.setTone('amber');   // tidak boleh melempar
  plane.destroy();                      // idempoten
});

test('destroy() di TENGAH seretan melepas listener window yang dipasang saat seret', async () => {
  const plane = fresh();
  const a = plane.drawVector({ to: [2, 2], name: 'u' });
  a.setDraggableTip(() => {});
  const snapshot = () => ['pointermove', 'pointerup', 'pointercancel'].map((t) => spy.listeners.get(`window:${t}`) || 0);
  const idle = snapshot();
  const handle = a.el.querySelector('.plane__tip-hit');
  pointer(handle, 'pointerdown', center(handle));
  const dragging = snapshot();
  assert(dragging.some((n, i) => n > idle[i]), 'seret tidak memasang listener window (tidak bisa diuji)');
  plane.destroy();
  assert(JSON.stringify(snapshot()) === JSON.stringify(idle), `listener bocor: ${idle} → ${snapshot()}`);
});

test('20 siklus buat–gambar–hancurkan: nol SVG, nol observer hidup, listener kembali ke awal', async () => {
  const start = spy.observers.length;
  for (let i = 0; i < 20; i += 1) {
    const plane = fresh();
    const a = plane.drawVector({ to: [i % 5, 2], name: `u${i}` });
    a.setTappable(() => {});
    a.setDraggableTip(() => {});
    plane.enablePointPicking(() => {});
    plane.drawAngleArc([1, 0], [0, 1]);
    plane.destroy();
  }
  assert(host.children.length === 0, `sisa anak host: ${host.children.length}`);
  const created = spy.observers.slice(start);
  assert(created.length === 20 && created.every((r) => r.disconnected), 'observer hidup tersisa');
  for (const [key, count] of spy.listeners) {
    if ((baselineListeners.get(key) || 0) !== count && !key.endsWith(':error') && !key.endsWith(':unhandledrejection')) {
      throw new Error(`listener ${key}: ${baselineListeners.get(key) || 0} → ${count}`);
    }
  }
});

test('Tidak ada galat konsol selama seluruh uji', async () => {
  await frames(2);
  assert(consoleErrors.length === 0, consoleErrors.join(' | '));
});

/* ------------------------------------------------------------
   Jalankan
   ------------------------------------------------------------ */
const log = document.getElementById('log');
for (const { name, fn } of tests) {
  try {
    await fn();
    results.push({ name, ok: true });
    log.insertAdjacentHTML('beforeend', `<div class="ok">✓ ${name}</div>`);
  } catch (err) {
    results.push({ name, ok: false, error: String(err && err.message) });
    log.insertAdjacentHTML('beforeend', `<div class="no">✗ ${name}\n    ${String(err && err.message)}</div>`);
  }
}
const failed = results.filter((r) => !r.ok);
log.insertAdjacentHTML('afterbegin', `<div class="${failed.length ? 'no' : 'ok'}">${results.length - failed.length}/${results.length} lolos · viewport ${innerWidth}×${innerHeight}</div>`);
window.__planeTest = { done: true, passed: results.length - failed.length, failed: failed.length, failures: failed };
