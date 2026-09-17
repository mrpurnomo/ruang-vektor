/**
 * domain/plane/vectorPlane.js — Bidang kartesius SVG interaktif.
 *
 * Komponen domain terbesar (Blueprint §5.4). Pemakaian dari engine simulasi:
 *
 *   const plane = createVectorPlane(host, { xRange: [-6, 6], yRange: [-4, 4] });
 *   const u = plane.drawVector({ to: [3, 2], name: 'u', tone: 'blue' });
 *   plane.highlight('u');                   // sorot berdasarkan nama
 *   plane.pulse('v');                       // denyut: "lihat yang ini"
 *   u.setTappable((arrow) => …, 'Pilih vektor u');
 *   u.setDraggableTip(([x, y]) => …);       // + tombol panah di keyboard
 *   await u.setVector({ to: [4, 1] }, { animate: true });
 *   this.track(() => plane.destroy());      // WAJIB — lihat kontrak 6
 *
 * ------------------------------------------------------------
 * ENAM KONTRAK — di mana masing-masing ditegakkan
 * ------------------------------------------------------------
 * 1. Sumbu y terbalik     → HANYA viewport.toScreen/toMath (planeGeometry.js).
 *                           Berkas ini tidak pernah membalik y sendiri.
 * 2. Skala x = skala y    → viewBox = ukuran piksel wadah, satu `scale`
 *                           untuk kedua sumbu; preserveAspectRatio "meet".
 * 3. Pointer-events       → lapisan grid/axis/shape/label TULI (plane.css).
 *                           Hanya `interactive` dan `pick` yang mendengar.
 * 4. Kepala panah stabil  → marker userSpaceOnUse per panah (arrow.js).
 * 5. Label KaTeX          → <foreignObject> + renderToString(). <text> hanya
 *                           untuk angka skala & huruf sumbu (tanpa KaTeX).
 * 6. destroy()            → putus ResizeObserver, batalkan rAF & tween,
 *                           lepas listener seret/ketuk/pilih, buang SVG.
 *
 * Semua gambar menyimpan KOORDINAT MATEMATIKA dan menggambar ulang dirinya
 * lewat `layout()` saat wadah berubah ukuran. Tidak ada yang menyimpan piksel.
 */

import { renderToString } from '../../core/render/katexRenderer.js';
import * as V from '../vector.js';
import {
  createViewport, toPlanePoint, tickStep, gridValues,
  arcPoints, rightAngleMarker, snapPoint, fmt, polylinePath,
} from './planeGeometry.js';
import { Arrow, svgEl, linePath, makeSvgTappable } from './arrow.js';

const XHTML_NS = 'http://www.w3.org/1999/xhtml';
const LABEL_W = 140;
const LABEL_H = 34;
const LAYERS = ['grid', 'axis', 'pick', 'shape', 'interactive', 'label'];

let planeCount = 0;

/** [x, y], vec(), atau Arrow → vektor [x, y] (untuk busur, jajargenjang, proyeksi). */
function asDirection(value) {
  if (value instanceof Arrow) return value.vector;
  return toPlanePoint(value);
}

/**
 * Penanda non-panah: titik, ruas, garis bantu, jajargenjang, busur,
 * proyeksi. Memegang node-nya, fungsi `layout` untuk resize, dan pelepas.
 */
class Mark {
  constructor(plane, el, layout) {
    this.plane = plane;
    this.el = el;
    this.labelEl = null;
    this.layoutFn = layout;
    this.cleanups = [];
    this.removed = false;
  }

  layout() {
    if (!this.removed && this.plane.viewport) this.layoutFn(this.plane.viewport, this);
  }

  dispose() {
    if (this.removed) return;
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    this.removed = true;
  }

  remove() {
    if (this.removed) return;
    this.dispose();
    this.el.remove();
    if (this.labelEl) this.labelEl.remove();
    this.plane.marks.delete(this);
  }
}

export class VectorPlane {
  /**
   * @param {HTMLElement} host  Wadah berposisi relatif dengan tinggi DICADANGKAN
   *                            (.plane-host) — bidang tidak menentukan ukurannya sendiri.
   * @param {{ xRange?: number[], yRange?: number[], padding?: number,
   *           grid?: 'unit'|'none', axisLabels?: string[]|null,
   *           showOrigin?: boolean, tickLabels?: boolean, ariaLabel?: string }} [options]
   */
  constructor(host, options = {}) {
    if (!host || typeof host.appendChild !== 'function') {
      throw new TypeError('createVectorPlane membutuhkan elemen wadah');
    }
    this.options = {
      xRange: [-6, 6],
      yRange: [-4, 4],
      padding: 16,
      grid: 'unit',
      axisLabels: ['x', 'y'],
      showOrigin: true,
      tickLabels: true,
      ariaLabel: 'Bidang kartesius',
      ...options,
    };
    // Validasi rentang SEKARANG, bukan saat resize pertama: rentang terbalik
    // harus gagal di tempat engine menuliskannya.
    createViewport({ xRange: this.options.xRange, yRange: this.options.yRange, width: 100, height: 100 });

    this.host = host;
    this.uid = ++planeCount;
    this.seq = 0;
    this.viewport = null;
    this.size = [0, 0];
    this.raf = 0;
    this.destroyed = false;
    this.arrows = new Set();
    this.arrowsByName = new Map();
    this.marks = new Set();
    this.animations = new Set();
    this.layoutListeners = new Set();
    this.pickCleanup = null;

    this.svg = svgEl('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
      'aria-label': this.options.ariaLabel,
    }, 'plane');
    this.layers = {};
    for (const name of LAYERS) {
      this.layers[name] = svgEl('g', {}, `plane__layer plane__layer--${name}`);
      this.svg.appendChild(this.layers[name]);
    }
    host.appendChild(this.svg);

    const plane = this;
    this.ctx = {
      get viewport() { return plane.viewport; },
      layers: this.layers,
      animations: this.animations,
      nextId: (prefix) => `rvp${plane.uid}-${prefix}${++plane.seq}`,
      createLabel: (toneClass) => plane.createLabel(toneClass),
      setLabelContent: (fo, tex) => plane.setLabelContent(fo, tex),
      placeLabel: (fo, at) => plane.placeLabel(fo, at),
      clientToMath: (x, y) => plane.clientToMath(x, y),
      unregister: (arrow) => plane.unregisterArrow(arrow),
    };

    this.measure();
    this.observer = new ResizeObserver(() => this.scheduleLayout());
    this.observer.observe(host);
  }

  /* ============================================================
     SIKLUS HIDUP & UKURAN
     ============================================================ */

  assertAlive() {
    if (this.destroyed) throw new Error('Bidang kartesius ini sudah dihancurkan');
  }

  /** Satu layout per frame, berapa pun banyak notifikasi resize yang datang. */
  scheduleLayout() {
    if (this.destroyed || this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.measure();
    });
  }

  /**
   * Ukur wadah dan gambar ulang bila ukurannya berubah.
   * Wadah tersembunyi (0×0) DIABAIKAN: viewport lama dipertahankan, tidak
   * ada skala nol, tidak ada NaN yang ditulis ke atribut.
   */
  measure() {
    if (this.destroyed) return false;
    const rect = this.host.getBoundingClientRect();
    const { width, height } = rect;
    const pad = this.options.padding;
    if (!(width > 2 * pad + 1) || !(height > 2 * pad + 1)) return false;
    if (width === this.size[0] && height === this.size[1]) return false;

    this.size = [width, height];
    this.viewport = createViewport({
      xRange: this.options.xRange,
      yRange: this.options.yRange,
      width,
      height,
      padding: pad,
    });
    // viewBox dalam piksel wadah: satu satuan pengguna = satu piksel CSS,
    // sehingga lebar garis & ukuran kepala panah sama di setiap layar.
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.relayout();
    return true;
  }

  /** Gambar ulang kisi, sumbu, dan seluruh gambar dari koordinat matematika. */
  relayout() {
    if (this.destroyed || !this.viewport) return;
    this.drawGrid();
    this.drawAxes();
    this.arrows.forEach((arrow) => arrow.layout());
    this.marks.forEach((mark) => mark.layout());
    this.layoutListeners.forEach((fn) => fn(this.viewport));
  }

  /** Dipanggil setiap kali bidang digambar ulang (mis. untuk memosisikan overlay). */
  onLayout(fn) {
    this.layoutListeners.add(fn);
    return () => this.layoutListeners.delete(fn);
  }

  toScreen(point) {
    this.assertAlive();
    return this.viewport ? this.viewport.toScreen(toPlanePoint(point)) : null;
  }

  toMath(pixel) {
    this.assertAlive();
    return this.viewport ? this.viewport.toMath(pixel) : null;
  }

  /** Koordinat klien (PointerEvent) → matematika, lewat CTM yang dirender. */
  clientToMath(clientX, clientY) {
    if (this.destroyed || !this.viewport) return null;
    const ctm = this.svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return this.viewport.toMath([p.x, p.y]);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.observer.disconnect();
    this.animations.forEach((handle) => handle.cancel());
    this.animations.clear();
    this.arrows.forEach((arrow) => arrow.dispose());
    this.marks.forEach((mark) => mark.dispose());
    if (this.pickCleanup) this.pickCleanup();
    this.arrows.clear();
    this.arrowsByName.clear();
    this.marks.clear();
    this.layoutListeners.clear();
    this.svg.remove();
  }

  /* ============================================================
     KISI & SUMBU
     ============================================================ */

  drawGrid() {
    const layer = this.layers.grid;
    layer.replaceChildren();
    if (this.options.grid === 'none') return;
    const vp = this.viewport;
    // Kisi tidak pernah lebih rapat dari 8px — di bawah itu ia hanya noise.
    const step = tickStep(vp.scale, 8);

    for (const x of gridValues(vp.xMin, vp.xMax, step)) {
      const [px] = vp.toScreen([x, 0]);
      layer.appendChild(svgEl('line', {
        x1: fmt(px), x2: fmt(px), y1: 0, y2: fmt(vp.height), 'data-axis': 'x', 'data-value': x,
      }, x % (step * 5) === 0 ? 'plane__grid-line plane__grid-line--major' : 'plane__grid-line'));
    }
    for (const y of gridValues(vp.yMin, vp.yMax, step)) {
      const [, py] = vp.toScreen([0, y]);
      layer.appendChild(svgEl('line', {
        x1: 0, x2: fmt(vp.width), y1: fmt(py), y2: fmt(py), 'data-axis': 'y', 'data-value': y,
      }, y % (step * 5) === 0 ? 'plane__grid-line plane__grid-line--major' : 'plane__grid-line'));
    }
  }

  drawAxes() {
    const layer = this.layers.axis;
    layer.replaceChildren();
    const vp = this.viewport;
    const [ox, oy] = vp.toScreen([0, 0]);
    const xAxisVisible = vp.yMin <= 0 && vp.yMax >= 0;
    const yAxisVisible = vp.xMin <= 0 && vp.xMax >= 0;
    const step = tickStep(vp.scale, 28);

    if (xAxisVisible) {
      layer.appendChild(svgEl('line', { x1: 0, x2: fmt(vp.width), y1: fmt(oy), y2: fmt(oy) }, 'plane__axis plane__axis--x'));
      for (const x of gridValues(vp.xMin, vp.xMax, step)) {
        const [px] = vp.toScreen([x, 0]);
        if (x === 0 || px < 12 || px > vp.width - 12) continue;
        layer.appendChild(svgEl('line', { x1: fmt(px), x2: fmt(px), y1: fmt(oy - 4), y2: fmt(oy + 4) }, 'plane__axis-tick'));
        if (this.options.tickLabels) this.axisText(String(x).replace('-', '−'), px, oy + 16, 'middle', 'plane__tick-label');
      }
      if (this.options.axisLabels) this.axisText(this.options.axisLabels[0], vp.width - 10, oy - 8, 'end', 'plane__axis-label');
    }
    if (yAxisVisible) {
      layer.appendChild(svgEl('line', { x1: fmt(ox), x2: fmt(ox), y1: 0, y2: fmt(vp.height) }, 'plane__axis plane__axis--y'));
      for (const y of gridValues(vp.yMin, vp.yMax, step)) {
        const [, py] = vp.toScreen([0, y]);
        if (y === 0 || py < 12 || py > vp.height - 12) continue;
        layer.appendChild(svgEl('line', { x1: fmt(ox - 4), x2: fmt(ox + 4), y1: fmt(py), y2: fmt(py) }, 'plane__axis-tick'));
        if (this.options.tickLabels) this.axisText(String(y).replace('-', '−'), ox - 8, py + 4, 'end', 'plane__tick-label');
      }
      if (this.options.axisLabels) this.axisText(this.options.axisLabels[1], ox + 10, 16, 'start', 'plane__axis-label');
    }
    if (this.options.showOrigin && xAxisVisible && yAxisVisible) {
      layer.appendChild(svgEl('circle', { cx: fmt(ox), cy: fmt(oy), r: 2.5 }, 'plane__origin'));
    }
  }

  /** Angka skala & huruf sumbu: teks biasa tanpa KaTeX, jadi <text> cukup. */
  axisText(content, x, y, anchor, className) {
    const node = svgEl('text', { x: fmt(x), y: fmt(y), 'text-anchor': anchor }, className);
    node.textContent = content;
    this.layers.axis.appendChild(node);
  }

  /* ============================================================
     LABEL — <foreignObject> + KaTeX (kontrak 5)
     ============================================================ */

  createLabel(toneClass = '', innerClass = 'plane__label-inner') {
    const fo = svgEl('foreignObject', { width: LABEL_W, height: LABEL_H }, `plane__label ${toneClass}`.trim());
    const box = document.createElementNS(XHTML_NS, 'div');
    box.className = 'plane__label-box';
    const inner = document.createElementNS(XHTML_NS, 'span');
    inner.className = innerClass;
    box.appendChild(inner);
    fo.appendChild(box);
    this.layers.label.appendChild(fo);
    return fo;
  }

  setLabelContent(fo, tex) {
    const inner = fo.firstChild.firstChild;
    inner.innerHTML = tex ? renderToString(tex) : '';
  }

  /** Pusatkan kotak label pada titik jangkar (piksel). */
  placeLabel(fo, [x, y]) {
    fo.setAttribute('x', fmt(x - LABEL_W / 2));
    fo.setAttribute('y', fmt(y - LABEL_H / 2));
  }

  /* ============================================================
     PANAH
     ============================================================ */

  /**
   * @param {{ from?: number[]|object, to: number[]|object, name?: string,
   *           tone?: 'blue'|'amber'|'cyan'|'coral'|'success'|'muted'|'ghost',
   *           label?: string|null }} spec
   *   `label` default: \vec{u} untuk nama satu huruf, \overrightarrow{AB}
   *   untuk dua huruf. `null` = tanpa label.
   * @returns {Arrow}
   */
  drawVector(spec) {
    this.assertAlive();
    if (spec && spec.name && this.arrowsByName.has(spec.name)) {
      // Menggambar ulang nama yang sama menggantikan panah lama — engine
      // yang mengulang langkah tidak meninggalkan panah kembar.
      this.arrowsByName.get(spec.name).remove();
    }
    const arrow = new Arrow(this.ctx, spec);
    this.arrows.add(arrow);
    if (arrow.name) this.arrowsByName.set(arrow.name, arrow);
    return arrow;
  }

  unregisterArrow(arrow) {
    this.arrows.delete(arrow);
    if (arrow.name && this.arrowsByName.get(arrow.name) === arrow) this.arrowsByName.delete(arrow.name);
  }

  getArrow(name) {
    return this.arrowsByName.get(name) ?? null;
  }

  highlight(name, on = true) { return this.getArrow(name)?.highlight(on) ?? null; }
  pulse(name, on = true) { return this.getArrow(name)?.pulse(on) ?? null; }
  mute(name, on = true) { return this.getArrow(name)?.mute(on) ?? null; }
  lock(name, on = true) { return this.getArrow(name)?.lock(on) ?? null; }

  /* ============================================================
     PENANDA LAIN
     ============================================================ */

  addMark(layerName, el, layout) {
    this.assertAlive();
    this.layers[layerName].appendChild(el);
    const mark = new Mark(this, el, layout);
    this.marks.add(mark);
    mark.layout();
    return mark;
  }

  /** Titik dengan label opsional (mis. A, B). `setPosition`, `setTappable`. */
  drawPoint(point, { label = null, ghost = false } = {}) {
    let position = toPlanePoint(point);
    const circle = svgEl('circle', { r: 5.5 }, ghost ? 'plane__point plane__point--ghost' : 'plane__point');
    const mark = this.addMark('interactive', circle, (vp, m) => {
      const [x, y] = vp.toScreen(position);
      circle.setAttribute('cx', fmt(x));
      circle.setAttribute('cy', fmt(y));
      if (m.labelEl) this.placeLabel(m.labelEl, [x + 14, y - 14]);
    });
    mark.setPosition = (p) => { position = toPlanePoint(p); mark.layout(); return mark; };
    mark.setLabel = (tex) => {
      if (!mark.labelEl && tex) mark.labelEl = this.createLabel();
      if (mark.labelEl) this.setLabelContent(mark.labelEl, tex);
      mark.layout();
      return mark;
    };
    mark.setTappable = (handler, ariaLabel) => {
      const release = makeSvgTappable(circle, (event) => handler(mark, event), ariaLabel);
      mark.cleanups.push(release);
      return release;
    };
    Object.defineProperty(mark, 'position', { get: () => position.slice() });
    if (label) mark.setLabel(label);
    return mark;
  }

  /** Ruas garis antara dua titik. */
  drawSegment(a, b, { dashed = false } = {}) {
    const p = toPlanePoint(a);
    const q = toPlanePoint(b);
    const path = svgEl('path', {}, dashed ? 'plane__segment plane__segment--dashed' : 'plane__segment');
    return this.addMark('shape', path, (vp) => path.setAttribute('d', linePath(vp.toScreen(p), vp.toScreen(q))));
  }

  /**
   * Garis bantu komponen: dari ujung ke garis mendatar & tegak yang melewati
   * pangkal. Menerima Arrow (mengikuti posisinya yang sekarang) atau titik.
   * Aksioma: gambarkan SETELAH siswa membaca komponennya, bukan sebelum.
   */
  drawGuides(target) {
    const group = svgEl('g');
    const toX = svgEl('path', {}, 'plane__guide');
    const toY = svgEl('path', {}, 'plane__guide');
    group.append(toX, toY);
    return this.addMark('shape', group, (vp) => {
      const from = target instanceof Arrow ? target.from : [0, 0];
      const to = target instanceof Arrow ? target.to : toPlanePoint(target);
      toX.setAttribute('d', linePath(vp.toScreen(to), vp.toScreen([to[0], from[1]])));
      toY.setAttribute('d', linePath(vp.toScreen(to), vp.toScreen([from[0], to[1]])));
    });
  }

  /** Jajargenjang O, O+u, O+u+v, O+v — aturan jajargenjang. */
  drawParallelogram(u, v, { origin = [0, 0] } = {}) {
    const polygon = svgEl('polygon', {}, 'plane__parallelogram');
    return this.addMark('shape', polygon, (vp) => {
      const [ox, oy] = toPlanePoint(origin);
      const [ux, uy] = asDirection(u);
      const [vx, vy] = asDirection(v);
      const corners = [[ox, oy], [ox + ux, oy + uy], [ox + ux + vx, oy + uy + vy], [ox + vx, oy + vy]];
      polygon.setAttribute('points', corners.map((c) => vp.toScreen(c).map(fmt).join(',')).join(' '));
    });
  }

  /**
   * Busur sudut di antara u dan v, TANPA ANGKA (aksioma §1.1). Slot labelnya
   * ada sejak awal tetapi kosong; `setLabel('\\theta')` mengisinya.
   * Vektor tegak lurus diberi penanda persegi, bukan busur.
   */
  drawAngleArc(u, v, { origin = [0, 0], radius = 28, label = null } = {}) {
    const du = asDirection(u);
    const dv = asDirection(v);
    if (Math.hypot(...du) === 0 || Math.hypot(...dv) === 0) {
      throw new RangeError('Busur sudut tidak bisa digambar untuk vektor nol');
    }
    const group = svgEl('g');
    const perpendicular = V.isPerpendicular(V.vec(...du), V.vec(...dv));
    const path = svgEl('path', {}, perpendicular ? 'plane__arc plane__arc--right' : 'plane__arc');
    group.appendChild(path);

    const mark = this.addMark('shape', group, (vp, m) => {
      const o = toPlanePoint(origin);
      if (perpendicular) {
        path.setAttribute('d', polylinePath(rightAngleMarker(vp, o, du, dv, radius * 0.45)));
      } else {
        path.setAttribute('d', polylinePath(arcPoints(vp, o, du, dv, radius).points));
      }
      if (m.labelEl) this.placeLabel(m.labelEl, arcPoints(vp, o, du, dv, radius).labelAt);
    });
    mark.labelEl = this.createLabel('', 'plane__arc-slot');
    mark.setLabel = (tex) => {
      this.setLabelContent(mark.labelEl, tex);
      return mark;
    };
    if (label) mark.setLabel(label);
    mark.layout();
    return mark;
  }

  /**
   * Garis jatuh tegak lurus dari ujung u ke garis `onto`, dengan penanda
   * siku di kakinya. Kakinya dihitung vector.js (proyeksi vektor), bukan di sini.
   */
  drawProjection(u, onto, { origin = [0, 0], showFoot = true } = {}) {
    const du = asDirection(u);
    const dOnto = asDirection(onto);
    const proj = V.projVector(V.vec(...du), V.vec(...dOnto));   // RangeError bila onto = 0
    const group = svgEl('g');
    const drop = svgEl('path', {}, 'plane__proj-drop');
    const foot = svgEl('path', {}, 'plane__proj-foot');
    group.append(drop, foot);

    return this.addMark('shape', group, (vp) => {
      const [ox, oy] = toPlanePoint(origin);
      const tip = [ox + du[0], oy + du[1]];
      const footPoint = [ox + proj.x, oy + proj.y];
      drop.setAttribute('d', linePath(vp.toScreen(tip), vp.toScreen(footPoint)));
      const toTip = [tip[0] - footPoint[0], tip[1] - footPoint[1]];
      const showMarker = showFoot && Math.hypot(...toTip) > 1e-9;
      foot.style.display = showMarker ? '' : 'none';
      if (showMarker) {
        // Penanda siku menghadap BALIK ke pangkal bila proyeksi searah onto,
        // supaya persegi kecilnya tidak menumpuk di atas panah proyeksi.
        const along = proj.x * dOnto[0] + proj.y * dOnto[1] >= 0 ? [-dOnto[0], -dOnto[1]] : dOnto;
        foot.setAttribute('d', polylinePath(rightAngleMarker(vp, footPoint, along, toTip, 9)));
      }
    });
  }

  /* ============================================================
     PEMILIHAN TITIK — padanan ketuk untuk seret
     ============================================================ */

  /**
   * Ketukan pada bidang KOSONG melaporkan titik kisi terdekat:
   * `handler([x, y])`. Panah & titik tetap menerima ketukannya sendiri
   * karena lapisan pilih ada DI BAWAH lapisan interaktif.
   * @returns {() => void} pelepas
   */
  enablePointPicking(handler, { step = 1 } = {}) {
    this.assertAlive();
    if (this.pickCleanup) this.pickCleanup();
    const rect = svgEl('rect', { x: 0, y: 0, width: '100%', height: '100%' }, 'plane__pick');
    this.layers.pick.appendChild(rect);
    const onClick = (event) => {
      const point = this.clientToMath(event.clientX, event.clientY);
      if (!point) return;
      handler(snapPoint(point, this.viewport, step));
    };
    rect.addEventListener('click', onClick);
    this.pickCleanup = () => {
      rect.removeEventListener('click', onClick);
      rect.remove();
      this.pickCleanup = null;
    };
    return this.pickCleanup;
  }

  /** Buang semua panah & penanda; kisi dan sumbu tetap. */
  clear() {
    this.assertAlive();
    [...this.arrows].forEach((arrow) => arrow.remove());
    [...this.marks].forEach((mark) => mark.remove());
    if (this.pickCleanup) this.pickCleanup();
  }
}

/** @returns {VectorPlane} */
export function createVectorPlane(host, options) {
  return new VectorPlane(host, options);
}
