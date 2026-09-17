/**
 * domain/plane/arrow.js — Satu panah vektor di bidang kartesius.
 *
 * Dibuat HANYA oleh `VectorPlane.drawVector()`. Panah menyimpan koordinat
 * MATEMATIKANYA (from, to) dan menggambar ulang dirinya dari sana setiap
 * kali bidangnya berubah ukuran — tidak pernah menyimpan piksel.
 *
 * ------------------------------------------------------------
 * ANATOMI SVG
 * ------------------------------------------------------------
 *   <g class="plane__arrow plane__arrow--blue">
 *     <defs><marker markerUnits="userSpaceOnUse">  ← KONTRAK 4
 *       <path class="plane__arrow-head"/></marker></defs>
 *     <path class="plane__arrow-hit"/>    jalur ketuk 22px, tak terlihat
 *     <path class="plane__arrow-line"/>   batang, berhenti sebelum kepala
 *     <circle class="plane__arrow-zero"/> pengganti panah untuk vektor nol
 *     <g class="plane__tip">…</g>         pegangan seret (bila diaktifkan)
 *   </g>
 *
 * Kenapa marker TIAP panah ada DI DALAM grupnya sendiri, bukan satu marker
 * bersama di <defs> teratas: properti CSS diwariskan lewat pohon DOM, bukan
 * lewat rujukan `marker-end`. Marker di <defs> teratas tidak pernah melihat
 * `--tone` panah pemakainya, dan kepala panah amber tampil biru. Di dalam
 * grup, `fill: var(--tone)` benar-benar terwariskan.
 *
 * `markerUnits="userSpaceOnUse"`: ukuran kepala dalam piksel bidang, TIDAK
 * dikalikan lebar garis. Garis yang ditebalkan untuk sorotan tidak ikut
 * membesarkan kepalanya.
 */

import { toPlanePoint, arrowShaft, labelAnchor, fmt, snapPoint } from './planeGeometry.js';
import { tween } from './arrowAnimation.js';

export const SVG_NS = 'http://www.w3.org/2000/svg';
export const HEAD_LENGTH = 13;
export const HEAD_WIDTH = 10;
export const TONES = Object.freeze(['blue', 'amber', 'cyan', 'coral', 'success', 'muted', 'ghost']);

export function svgEl(tag, attrs = {}, className = '') {
  const node = document.createElementNS(SVG_NS, tag);
  if (className) node.setAttribute('class', className);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

export function linePath(a, b) {
  return `M ${fmt(a[0])} ${fmt(a[1])} L ${fmt(b[0])} ${fmt(b[1])}`;
}

function assertTone(tone) {
  if (!TONES.includes(tone)) {
    throw new TypeError(`Nada panah "${tone}" tidak dikenal. Pilihan: ${TONES.join(', ')}`);
  }
  return tone;
}

/** Nada label mengikuti panahnya; hanya tiga yang punya gaya label khusus. */
export function labelToneClass(tone) {
  if (tone === 'blue' || tone === 'amber') return `plane__label--${tone}`;
  if (tone === 'muted' || tone === 'ghost') return 'plane__label--muted';
  return '';
}

/** u → \vec{u} · AB → \overrightarrow{AB} */
function defaultLabel(name) {
  if (!name) return null;
  return name.length === 1 ? `\\vec{${name}}` : `\\overrightarrow{${name}}`;
}

/**
 * Jadikan elemen SVG bisa diketuk: tetikus, sentuh, DAN papan ketik
 * (Enter/Spasi). Pola yang sama dengan `makeTappable()` di simCore.js —
 * di Vektor, panah SVG mengambil peran sel matriks (Blueprint §5.4).
 * @returns {() => void} pelepas
 */
export function makeSvgTappable(node, handler, ariaLabel) {
  node.setAttribute('role', 'button');
  node.setAttribute('tabindex', '0');
  if (ariaLabel) node.setAttribute('aria-label', ariaLabel);
  node.classList.add('is-tappable');

  const onClick = (event) => {
    event.preventDefault();
    handler(event);
  };
  const onKey = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handler(event);
  };
  node.addEventListener('click', onClick);
  node.addEventListener('keydown', onKey);

  return () => {
    node.removeEventListener('click', onClick);
    node.removeEventListener('keydown', onKey);
    node.classList.remove('is-tappable');
    node.removeAttribute('role');
    node.removeAttribute('tabindex');
    node.removeAttribute('aria-label');
  };
}

export class Arrow {
  /**
   * @param {object} ctx  Konteks milik VectorPlane (viewport, lapisan, label).
   * @param {{ from?: number[]|object, to: number[]|object, name?: string,
   *           tone?: string, label?: string|null }} spec
   */
  constructor(ctx, { from = [0, 0], to, name = null, tone = 'blue', label } = {}) {
    this.ctx = ctx;
    this.name = name;
    this.from = toPlanePoint(from);
    this.to = toPlanePoint(to);
    this.tone = assertTone(tone);
    this.removed = false;
    this.anim = null;
    this.tappableCleanup = null;
    this.dragCleanup = null;

    const markerId = ctx.nextId('head');
    this.el = svgEl('g', { 'data-name': name ?? '' }, `plane__arrow plane__arrow--${tone}`);

    const defs = svgEl('defs');
    const marker = svgEl('marker', {
      id: markerId,
      markerUnits: 'userSpaceOnUse',
      markerWidth: HEAD_LENGTH,
      markerHeight: HEAD_WIDTH,
      viewBox: `0 0 ${HEAD_LENGTH} ${HEAD_WIDTH}`,
      refX: 0,
      refY: HEAD_WIDTH / 2,
      orient: 'auto',
      overflow: 'visible',
    }, 'plane__arrow-marker');
    marker.appendChild(svgEl('path', { d: `M 0 0 L ${HEAD_LENGTH} ${HEAD_WIDTH / 2} L 0 ${HEAD_WIDTH} Z` }, 'plane__arrow-head'));
    defs.appendChild(marker);

    this.hitEl = svgEl('path', {}, 'plane__arrow-hit');
    this.lineEl = svgEl('path', { 'marker-end': `url(#${markerId})` }, 'plane__arrow-line');
    this.zeroEl = svgEl('circle', { r: 4.5 }, 'plane__arrow-zero');
    this.el.append(defs, this.hitEl, this.lineEl, this.zeroEl);
    ctx.layers.interactive.appendChild(this.el);

    this.labelEl = null;
    const tex = label === undefined ? defaultLabel(name) : label;
    if (tex) this.setLabel(tex);

    this.layout();
  }

  /** Vektor yang digambar: to − from, sebagai [x, y]. */
  get vector() {
    return [this.to[0] - this.from[0], this.to[1] - this.from[1]];
  }

  /** Gambar ulang dari koordinat matematika. Dipanggil juga oleh resize. */
  layout() {
    const vp = this.ctx.viewport;
    if (this.removed || !vp) return;
    const start = vp.toScreen(this.from);
    const tip = vp.toScreen(this.to);
    const shaft = arrowShaft(start, tip, HEAD_LENGTH);

    this.el.classList.toggle('is-zero', shaft.degenerate);
    this.hitEl.setAttribute('d', linePath(start, tip));
    this.lineEl.setAttribute('d', linePath(start, shaft.end));
    this.zeroEl.setAttribute('cx', fmt(start[0]));
    this.zeroEl.setAttribute('cy', fmt(start[1]));

    if (this.labelEl) this.ctx.placeLabel(this.labelEl, labelAnchor(start, tip, 16));
    if (this.tipEl) this.tipEl.setAttribute('transform', `translate(${fmt(tip[0])} ${fmt(tip[1])})`);
  }

  /**
   * Pindahkan panah. Dengan `animate`, perpindahan ditween di RUANG
   * MATEMATIKA sehingga tetap benar walau wadah berubah ukuran di tengahnya.
   * @returns {Promise<boolean>} true bila sampai, false bila dibatalkan.
   */
  setVector({ from, to } = {}, { animate = false, duration = 320 } = {}) {
    if (this.removed) return Promise.resolve(false);
    const nextFrom = from === undefined ? this.from : toPlanePoint(from);
    const nextTo = to === undefined ? this.to : toPlanePoint(to);
    this.cancelAnimation();

    if (!animate) {
      this.from = nextFrom;
      this.to = nextTo;
      this.layout();
      return Promise.resolve(true);
    }

    const handle = tween({
      from: [...this.from, ...this.to],
      to: [...nextFrom, ...nextTo],
      duration,
      onFrame: ([fx, fy, tx, ty]) => {
        this.from = [fx, fy];
        this.to = [tx, ty];
        this.layout();
      },
    });
    this.anim = handle;
    this.ctx.animations.add(handle);
    return handle.finished.then((ok) => {
      this.ctx.animations.delete(handle);
      if (this.anim === handle) this.anim = null;
      return ok;
    });
  }

  cancelAnimation() {
    if (this.anim) this.anim.cancel();
    this.anim = null;
  }

  setTone(tone) {
    if (this.removed) return this;
    assertTone(tone);
    this.el.classList.remove(`plane__arrow--${this.tone}`);
    this.el.classList.add(`plane__arrow--${tone}`);
    if (this.labelEl) {
      const old = labelToneClass(this.tone);
      const next = labelToneClass(tone);
      if (old) this.labelEl.classList.remove(old);
      if (next) this.labelEl.classList.add(next);
    }
    this.tone = tone;
    return this;
  }

  toggleState(className, on) {
    if (!this.removed) this.el.classList.toggle(className, Boolean(on));
    return this;
  }

  highlight(on = true) { return this.toggleState('is-highlight', on); }
  pulse(on = true) { return this.toggleState('is-pulse', on); }
  mute(on = true) { return this.toggleState('is-muted', on); }
  lock(on = true) { return this.toggleState('is-locked', on); }
  /** Tandai sebagai tujuan sah saat mode ketuk-ketuk menyala (`.is-tap-armed`). */
  setTarget(on = true) { return this.toggleState('plane__arrow--target', on); }

  /** Label KaTeX lewat <foreignObject> (KONTRAK 5). null membuangnya. */
  setLabel(tex) {
    if (this.removed) return this;
    if (!tex) {
      if (this.labelEl) this.labelEl.remove();
      this.labelEl = null;
      return this;
    }
    if (!this.labelEl) this.labelEl = this.ctx.createLabel(labelToneClass(this.tone));
    this.ctx.setLabelContent(this.labelEl, tex);
    this.layout();
    return this;
  }

  /**
   * Panah bisa diketuk. `handler(arrow, event)`. Ketukan pada panah yang
   * terkunci diabaikan (CSS juga mematikan pointer-nya).
   * @returns {() => void} pelepas
   */
  setTappable(handler, ariaLabel) {
    if (this.removed) return () => {};
    if (this.tappableCleanup) this.tappableCleanup();
    const release = makeSvgTappable(this.el, (event) => {
      if (this.el.classList.contains('is-locked')) return;
      handler(this, event);
    }, ariaLabel || (this.name ? `Vektor ${this.name}` : 'Vektor'));
    this.tappableCleanup = () => {
      release();
      this.tappableCleanup = null;
    };
    return this.tappableCleanup;
  }

  /**
   * Ujung panah bisa diseret DAN digeser dengan tombol panah — seret tidak
   * pernah menjadi satu-satunya jalan (Kontrak 5 Blueprint).
   * Posisi dibulatkan ke kisi `step` dan dijepit ke rentang terlihat.
   * `onChange([x, y], arrow)` dipanggil hanya bila posisinya BERUBAH.
   * @returns {() => void} pelepas
   */
  setDraggableTip(onChange, { step = 1 } = {}) {
    if (this.removed) return () => {};
    if (this.dragCleanup) this.dragCleanup();

    const tipEl = svgEl('g', {}, 'plane__tip');
    const ring = svgEl('circle', { r: 8 }, 'plane__tip-ring');
    const hit = svgEl('circle', {
      r: 22,
      tabindex: 0,
      role: 'button',
      'aria-label': `Ujung vektor ${this.name || ''}. Seret, atau geser dengan tombol panah.`.replace('  ', ' '),
    }, 'plane__tip-hit');
    tipEl.append(ring, hit);
    this.el.appendChild(tipEl);
    this.tipEl = tipEl;

    const moveTo = (point) => {
      const vp = this.ctx.viewport;
      if (!vp || !point) return;
      const next = snapPoint(point, vp, step);
      if (next[0] === this.to[0] && next[1] === this.to[1]) return;
      this.cancelAnimation();
      this.to = next;
      this.layout();
      onChange(next.slice(), this);
    };

    let dragging = false;
    const onMove = (event) => {
      if (!dragging) return;
      event.preventDefault();
      moveTo(this.ctx.clientToMath(event.clientX, event.clientY));
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      this.el.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
    const onDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (this.el.classList.contains('is-locked')) return;
      event.preventDefault();
      event.stopPropagation();
      dragging = true;
      this.el.classList.add('is-dragging');
      // Listener di window, bukan di pegangan: jari yang bergerak cepat
      // meninggalkan lingkaran 44px sebelum frame berikutnya.
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
    };
    const KEYS = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    const onKey = (event) => {
      const delta = KEYS[event.key];
      if (!delta) return;
      event.preventDefault();
      event.stopPropagation();
      moveTo([this.to[0] + delta[0] * step, this.to[1] + delta[1] * step]);
    };

    hit.addEventListener('pointerdown', onDown);
    hit.addEventListener('keydown', onKey);
    this.layout();

    this.dragCleanup = () => {
      endDrag();
      hit.removeEventListener('pointerdown', onDown);
      hit.removeEventListener('keydown', onKey);
      tipEl.remove();
      this.tipEl = null;
      this.dragCleanup = null;
    };
    return this.dragCleanup;
  }

  /** Lepas seluruh listener & animasi tanpa menyentuh DOM (dipakai destroy). */
  dispose() {
    if (this.removed) return;
    this.cancelAnimation();
    if (this.dragCleanup) this.dragCleanup();
    if (this.tappableCleanup) this.tappableCleanup();
    this.removed = true;
  }

  /** Buang panah ini dari bidangnya. */
  remove() {
    if (this.removed) return;
    this.dispose();
    this.el.remove();
    if (this.labelEl) this.labelEl.remove();
    this.ctx.unregister(this);
  }
}
