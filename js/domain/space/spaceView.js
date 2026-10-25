/**
 * domain/space/spaceView.js — Ruang tiga dimensi yang BISA DIPUTAR.
 *
 * Revisi guru (sub-topik 6): bidang datar kehabisan arah, dan gambar miring
 * statis di buku tidak bisa dilihat dari sisi lain. Ruang ini digambar
 * sendiri dengan SVG (tanpa pustaka, tetap luring): proyeksi ORTOGONAL dengan
 * dua sudut kamera — azimut (putar di sekitar sumbu Z) dan elevasi.
 *
 * Konvensi Z-Up (kurikulum matematika & fisika): X = depan–belakang (positif
 * mendekati penonton), Y = kanan–kiri, Z = atas–bawah. Sudut bawaan menyerupai
 * gambar buku paket: X serong ke kiri bawah, Y ke kanan, Z tegak.
 *
 *   const space = createSpaceView(host, { range: { x: [-1, 5], y: [-4, 3], z: [0, 3] } });
 *   space.point([4, -3, 2], { label: 'P' });
 *   space.arrow([0, 0, 0], [0, 0, 0], { label: '\\overrightarrow{OP}' }).grow([4, -3, 2]);
 *   space.box([4, -3, 2]);                         // balok bantu O–P
 *   const drone = space.mover([0, 0, 0]);  await drone.moveTo([1, 0, 0], 110);
 *   space.setView('atas');                         // iso | depan | atas | samping
 *
 * Interaksi: geser (mouse/jari) memutar; papan ketik ←↑→↓ saat fokus; empat
 * tombol sudut pandang baku. Label memakai KaTeX di lapisan HTML di atas SVG.
 * Modul ini DOMAIN murni: tidak tahu apa-apa soal langkah atau umpan balik.
 */

import { renderToString } from '../../core/render/katexRenderer.js';

const NS = 'http://www.w3.org/2000/svg';
const DEG = Math.PI / 180;

export const VIEWS = {
  iso: { az: 28, el: 22, label: 'Miring' },
  depan: { az: 0, el: 0, label: 'Depan' },
  samping: { az: 90, el: 0, label: 'Samping' },
  atas: { az: 0, el: 90, label: 'Atas' },
};

const fmt = (n) => (Math.round(n * 100) / 100).toString();

function svgEl(tag, attrs = {}, className = '') {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (className) node.setAttribute('class', className);
  return node;
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

function still() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class SpaceView {
  constructor(host, { range, ariaLabel = 'Ruang tiga dimensi — geser untuk memutar' } = {}) {
    this.host = host;
    this.range = {
      x: (range && range.x) || [-1, 4],
      y: (range && range.y) || [-1, 4],
      z: (range && range.z) || [-1, 4],
    };
    this.az = VIEWS.iso.az;
    this.el = VIEWS.iso.el;
    this.items = new Set();
    this.cleanups = [];
    this.destroyed = false;
    this.w = 0;
    this.h = 0;

    host.classList.add('space-host');
    this.root = el('div', 'space');
    this.svg = svgEl('svg', { role: 'img', 'aria-label': ariaLabel, tabindex: '0' }, 'space__svg');
    this.layers = {};
    ['floor', 'axis', 'guide', 'shape', 'line', 'arrow', 'point'].forEach((name) => {
      this.layers[name] = svgEl('g', {}, `space__layer space__layer--${name}`);
      this.svg.appendChild(this.layers[name]);
    });
    this.labelLayer = el('div', 'space__labels');
    this.root.append(this.svg, this.labelLayer);

    // Tombol sudut pandang baku + petunjuk putar.
    this.viewBar = el('div', 'space__views');
    this.viewBtns = Object.entries(VIEWS).map(([key, v]) => {
      const b = el('button', 'space__view', v.label);
      b.type = 'button';
      b.dataset.view = key;
      b.dataset.tip = `Lihat dari ${v.label.toLowerCase()}`;
      const on = () => this.setView(key);
      b.addEventListener('click', on);
      this.cleanups.push(() => b.removeEventListener('click', on));
      this.viewBar.appendChild(b);
      return b;
    });
    this.root.appendChild(this.viewBar);
    this.root.appendChild(el('div', 'space__hint', 'Geser untuk memutar'));
    host.appendChild(this.root);

    this.buildFrame();
    this.bindRotate();

    this.observer = new ResizeObserver(() => this.measure());
    this.observer.observe(host);
    this.measure();
  }

  /* ---------------- proyeksi ---------------- */

  basis() {
    const a = this.az * DEG;
    const e = this.el * DEG;
    return {
      right: [-Math.sin(a), Math.cos(a), 0],
      up: [-Math.sin(e) * Math.cos(a), -Math.sin(e) * Math.sin(a), Math.cos(e)],
    };
  }

  /** Titik ruang → piksel layar (y ke bawah). */
  project(p) {
    const { right, up } = this.basis();
    const sx = p[0] * right[0] + p[1] * right[1] + p[2] * right[2];
    const sy = p[0] * up[0] + p[1] * up[1] + p[2] * up[2];
    return [this.cx + sx * this.scale, this.cy - sy * this.scale];
  }

  measure() {
    if (this.destroyed) return;
    const r = this.host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    this.w = w;
    this.h = h;
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.fit();
    this.render();
  }

  /** Pojok kotak rentang + ujung sumbu, diproyeksikan TANPA skala/geser. */
  extents() {
    const { x, y, z } = this.range;
    const xs = [x[0] - 0.4, x[1] + 1];
    const ys = [y[0] - 0.4, y[1] + 1];
    const zs = [Math.min(z[0], 0) - 0.4, z[1] + 1];
    const { right, up } = this.basis();
    const pts = [];
    xs.forEach((a) => ys.forEach((b) => zs.forEach((c) => {
      pts.push([a * right[0] + b * right[1] + c * right[2], a * up[0] + b * up[1] + c * up[2]]);
    })));
    const sx = pts.map((p) => p[0]);
    const sy = pts.map((p) => p[1]);
    return { minX: Math.min(...sx), maxX: Math.max(...sx), minY: Math.min(...sy), maxY: Math.max(...sy) };
  }

  /**
   * Skala dipasang agar kotak rentang MEMENUHI layar pada sudut pandang ini
   * (skala tetap untuk semua sudut membuat ruang tampak kecil dan jauh —
   * terukur ±21 px/satuan). Dihitung ulang saat ukuran atau sudut pandang
   * baku berganti, TIDAK selama digeser, supaya ruang tidak "berdenyut".
   */
  fit() {
    const e = this.extents();
    const padX = 24;
    // Ruang untuk tombol sudut pandang — di panggung pendek (lanskap 360px)
    // ruangnya boleh menyelinap di bawah tombol daripada mengecil.
    const short = this.h < 230;
    const padTop = short ? 12 : 40;
    const padBottom = short ? 10 : 22;
    this.scale = Math.max(4, Math.min(
      (this.w - padX * 2) / Math.max(0.1, e.maxX - e.minX),
      (this.h - padTop - padBottom) / Math.max(0.1, e.maxY - e.minY),
    ));
  }

  render() {
    if (this.destroyed || !this.scale) return;
    // Pusat = tengah kotak rentang yang terproyeksi, sedikit turun dari tombol.
    const e = this.extents();
    this.cx = this.w / 2 - ((e.minX + e.maxX) / 2) * this.scale;
    const shift = this.h < 230 ? 1 : 9;   // = (padTop − padBottom) / 2 dari fit()
    this.cy = this.h / 2 + shift + ((e.minY + e.maxY) / 2) * this.scale;
    this.items.forEach((item) => item.draw());
    this.viewBtns.forEach((b) => {
      const v = VIEWS[b.dataset.view];
      b.setAttribute('aria-pressed', String(Math.abs(v.az - this.az) < 0.5 && Math.abs(v.el - this.el) < 0.5));
    });
  }

  /* ---------------- interaksi ---------------- */

  bindRotate() {
    let drag = null;
    const down = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, az: this.az, el: this.el };
      this.svg.setPointerCapture?.(e.pointerId);
      this.root.classList.add('is-dragging');
    };
    const move = (e) => {
      if (!drag) return;
      this.cancelTween();
      this.az = drag.az - (e.clientX - drag.x) * 0.45;
      this.el = Math.max(-5, Math.min(88, drag.el + (e.clientY - drag.y) * 0.35));
      this.render();
    };
    const up = () => {
      drag = null;
      this.root.classList.remove('is-dragging');
    };
    const key = (e) => {
      const d = { ArrowLeft: [6, 0], ArrowRight: [-6, 0], ArrowUp: [0, 5], ArrowDown: [0, -5] }[e.key];
      if (!d) return;
      e.preventDefault();
      this.cancelTween();
      this.az += d[0];
      this.el = Math.max(-5, Math.min(88, this.el + d[1]));
      this.render();
    };
    this.svg.addEventListener('pointerdown', down);
    this.svg.addEventListener('pointermove', move);
    this.svg.addEventListener('pointerup', up);
    this.svg.addEventListener('pointercancel', up);
    this.svg.addEventListener('keydown', key);
    this.cleanups.push(() => {
      this.svg.removeEventListener('pointerdown', down);
      this.svg.removeEventListener('pointermove', move);
      this.svg.removeEventListener('pointerup', up);
      this.svg.removeEventListener('pointercancel', up);
      this.svg.removeEventListener('keydown', key);
    });
  }

  cancelTween() {
    if (this.tween) cancelAnimationFrame(this.tween);
    this.tween = 0;
  }

  /** Putar ke sudut pandang baku (beranimasi 380 ms). */
  setView(name, { animate = true } = {}) {
    const v = VIEWS[name];
    if (!v || this.destroyed) return Promise.resolve();
    this.cancelTween();
    // Jalur putar terpendek untuk azimut.
    let from = ((this.az % 360) + 540) % 360 - 180;
    let to = v.az;
    if (to - from > 180) from += 360;
    if (from - to > 180) from -= 360;
    const fromEl = this.el;
    if (!animate || still()) {
      this.az = v.az;
      this.el = v.el;
      this.fit();
      this.render();
      return Promise.resolve();
    }
    const t0 = performance.now();
    return new Promise((resolve) => {
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / 380);
        const ease = 1 - (1 - k) ** 3;
        this.az = from + (to - from) * ease;
        this.el = fromEl + (v.el - fromEl) * ease;
        // Zoom ikut menyesuaikan selama perpindahan sudut pandang baku (mulus, bukan melompat).
        this.fit();
        this.render();
        if (k < 1 && !this.destroyed) this.tween = requestAnimationFrame(tick);
        else { this.tween = 0; resolve(); }
      };
      this.tween = requestAnimationFrame(tick);
    });
  }

  /* ---------------- kerangka: lantai, sumbu ---------------- */

  buildFrame() {
    const { x, y, z } = this.range;
    // Kisi lantai z = 0: menegaskan "tanah" tempat langkah X dan Y berjalan.
    for (let i = Math.ceil(x[0]); i <= Math.floor(x[1]); i += 1) {
      this.addLine('floor', [i, y[0], 0], [i, y[1], 0], 'space__grid');
    }
    for (let j = Math.ceil(y[0]); j <= Math.floor(y[1]); j += 1) {
      this.addLine('floor', [x[0], j, 0], [x[1], j, 0], 'space__grid');
    }
    const axes = [
      { key: 'x', from: [x[0] - 0.4, 0, 0], to: [x[1] + 1, 0, 0], label: 'X' },
      { key: 'y', from: [0, y[0] - 0.4, 0], to: [0, y[1] + 1, 0], label: 'Y' },
      { key: 'z', from: [0, 0, Math.min(z[0], 0) - 0.4], to: [0, 0, z[1] + 1], label: 'Z' },
    ];
    axes.forEach((a) => {
      this.addArrowShape('axis', a.from, a.to, `space__axis space__axis--${a.key}`, 9);
      const lab = this.addLabel(a.to, a.label, `space__axis-label space__axis-label--${a.key}`, [0, 0]);
      lab.pushOut = true;
    });
    // Tik satuan + angka pada tiap sumbu (angka setiap satuan, tanpa nol).
    const ticks = [['x', x], ['y', y], ['z', z]];
    ticks.forEach(([axis, [lo, hi]]) => {
      for (let n = Math.ceil(lo); n <= Math.floor(hi); n += 1) {
        if (n === 0) continue;
        const p = [0, 0, 0];
        p[{ x: 0, y: 1, z: 2 }[axis]] = n;
        this.addTick(p, axis);
      }
    });
    this.addLabel([0, 0, 0], 'O', 'space__origin', [-10, 12]);
  }

  /* ---------------- primitif internal ---------------- */

  track(item) {
    this.items.add(item);
    if (this.scale) item.draw();
    item.remove = () => {
      this.items.delete(item);
      (item.nodes || []).forEach((n) => n.remove());
    };
    return item;
  }

  addLine(layer, a, b, cls) {
    const line = svgEl('line', {}, cls);
    this.layers[layer].appendChild(line);
    return this.track({
      nodes: [line],
      a,
      b,
      draw() {
        const view = this.view;
        const [x1, y1] = view.project(this.a);
        const [x2, y2] = view.project(this.b);
        line.setAttribute('x1', fmt(x1));
        line.setAttribute('y1', fmt(y1));
        line.setAttribute('x2', fmt(x2));
        line.setAttribute('y2', fmt(y2));
      },
      view: this,
    });
  }

  addArrowShape(layer, from, to, cls, head = 11) {
    const g = svgEl('g', {}, cls);
    const shaft = svgEl('line', {}, 'space__shaft');
    const tip = svgEl('polygon', {}, 'space__head');
    g.append(shaft, tip);
    this.layers[layer].appendChild(g);
    const view = this;
    return this.track({
      nodes: [g],
      el: g,
      from,
      to,
      draw() {
        const [x1, y1] = view.project(this.from);
        const [x2, y2] = view.project(this.to);
        const len = Math.hypot(x2 - x1, y2 - y1);
        // Panah yang menghadap penonton (tampak sebagai titik) tidak berkepala.
        const show = len > head * 0.9;
        const ux = len ? (x2 - x1) / len : 0;
        const uy = len ? (y2 - y1) / len : 0;
        const bx = x2 - ux * head;
        const by = y2 - uy * head;
        shaft.setAttribute('x1', fmt(x1));
        shaft.setAttribute('y1', fmt(y1));
        shaft.setAttribute('x2', fmt(show ? bx : x2));
        shaft.setAttribute('y2', fmt(show ? by : y2));
        tip.style.display = show ? '' : 'none';
        if (show) {
          const w = head * 0.45;
          tip.setAttribute('points', [
            [x2, y2], [bx - uy * w, by + ux * w], [bx + uy * w, by - ux * w],
          ].map((p) => p.map(fmt).join(',')).join(' '));
        }
      },
    });
  }

  addTick(p, axis) {
    const line = svgEl('line', {}, 'space__tick');
    this.layers.axis.appendChild(line);
    const view = this;
    const label = el('span', 'space__num', String(p[0] || p[1] || p[2]).replace('-', '−'));
    this.labelLayer.appendChild(label);
    return this.track({
      nodes: [line, label],
      draw() {
        const [x, y] = view.project(p);
        // Tik tegak lurus arah sumbu DI LAYAR.
        const unit = [0, 0, 0];
        unit[{ x: 0, y: 1, z: 2 }[axis]] = 1;
        const [ex, ey] = view.project(unit);
        const [ox, oy] = view.project([0, 0, 0]);
        let dx = ex - ox;
        let dy = ey - oy;
        const len = Math.hypot(dx, dy);
        const visible = len > 6;
        line.style.display = visible ? '' : 'none';
        label.style.display = visible && len > 14 ? '' : 'none';
        if (!visible) return;
        dx /= len;
        dy /= len;
        const nx = -dy * 4;
        const ny = dx * 4;
        line.setAttribute('x1', fmt(x - nx));
        line.setAttribute('y1', fmt(y - ny));
        line.setAttribute('x2', fmt(x + nx));
        line.setAttribute('y2', fmt(y + ny));
        // Angka di sisi "bawah/kanan" sumbu, menjauh dari panah lain.
        const side = ny >= 0 ? 1 : -1;
        label.style.transform = `translate(${fmt(x + nx * 3 * side)}px, ${fmt(y + ny * 3 * side)}px) translate(-50%, -50%)`;
      },
    });
  }

  addLabel(p, tex, cls, offset = [10, -12]) {
    const node = el('span', `space__label ${cls || ''}`);
    node.innerHTML = /[\\^_{}]/.test(tex) ? renderToString(tex) : tex;
    this.labelLayer.appendChild(node);
    const view = this;
    const item = this.track({
      nodes: [node],
      p,
      offset,
      draw() {
        let [x, y] = view.project(this.p);
        if (this.pushOut) {
          // Huruf sumbu sedikit di luar ujung panahnya, searah sumbu di layar.
          const [ox, oy] = view.project([0, 0, 0]);
          const len = Math.hypot(x - ox, y - oy) || 1;
          node.style.display = len > 20 ? '' : 'none';
          x += ((x - ox) / len) * 12;
          y += ((y - oy) / len) * 12;
        }
        node.style.transform = `translate(${fmt(x + this.offset[0])}px, ${fmt(y + this.offset[1])}px) translate(-50%, -50%)`;
      },
    });
    item.setText = (t) => { node.innerHTML = /[\\^_{}]/.test(t) ? renderToString(t) : t; return item; };
    item.setPosition = (q) => { item.p = q; item.draw(); return item; };
    item.node = node;
    return item;
  }

  /* ---------------- API publik ---------------- */

  /** Titik berlabel opsional. */
  point(p, { label = null, tone = 'amber', labelOffset = [12, -12] } = {}) {
    const dot = svgEl('circle', { r: 5.5 }, `space__point space__point--${tone}`);
    this.layers.point.appendChild(dot);
    const view = this;
    const item = this.track({
      nodes: [dot],
      p,
      draw() {
        const [x, y] = view.project(this.p);
        dot.setAttribute('cx', fmt(x));
        dot.setAttribute('cy', fmt(y));
      },
    });
    if (label) {
      item.label = this.addLabel(p, label, `space__label--${tone}`, labelOffset);
      const base = item.remove;
      item.remove = () => { base(); item.label.remove(); };
    }
    item.el = dot;
    return item;
  }

  /** Ruas garis; `dashed` untuk garis bantu (rusuk balok, proyeksi). */
  segment(a, b, { dashed = false, tone = 'ink' } = {}) {
    return this.addLine(dashed ? 'guide' : 'line', a, b, `space__seg space__seg--${tone}${dashed ? ' space__seg--dashed' : ''}`);
  }

  /** Panah vektor dari `from` ke `to`, label KaTeX opsional di tengahnya. */
  arrow(from, to, { label = null, tone = 'blue', labelOffset = [0, -14] } = {}) {
    const item = this.addArrowShape('arrow', from, to, `space__arrow space__arrow--${tone}`, 13);
    if (label) {
      const mid = () => from.map((v, i) => (v + item.to[i]) / 2);
      item.label = this.addLabel(mid(), label, `space__label--${tone} space__label--vec`, labelOffset);
      const baseDraw = item.draw;
      item.draw = function draw() { baseDraw.call(this); if (item.label) item.label.setPosition(mid()); };
      const base = item.remove;
      item.remove = () => { base(); item.label.remove(); };
    }
    /** Ujung panah tumbuh dari pangkal ke `target` (beranimasi). */
    item.grow = (target = to, ms = 520) => this.tweenPoint(from, target, ms, (p) => { item.to = p; item.draw(); });
    return item;
  }

  /** Lintasan lompat satu satuan (busur kecil di layar). */
  hop(a, b, { tone = 'blue' } = {}) {
    const path = svgEl('path', {}, `space__hop space__hop--${tone}`);
    this.layers.line.appendChild(path);
    const view = this;
    const item = this.track({
      nodes: [path],
      draw() {
        const [x1, y1] = view.project(a);
        const [x2, y2] = view.project(b);
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        // Tonjolan tegak lurus lintasan di layar, condong ke atas.
        let nx = -(y2 - y1) / len;
        let ny = (x2 - x1) / len;
        if (ny > 0) { nx = -nx; ny = -ny; }
        const bulge = Math.min(14, len * 0.35);
        const cx = (x1 + x2) / 2 + nx * bulge;
        const cy = (y1 + y2) / 2 + ny * bulge;
        path.setAttribute('d', `M${fmt(x1)} ${fmt(y1)} Q${fmt(cx)} ${fmt(cy)} ${fmt(x2)} ${fmt(y2)}`);
      },
    });
    item.path = path;
    return item;
  }

  /** Bidang poligon (mis. segitiga diagonal lantai) berwarna lembut. */
  polygon(points, { tone = 'cyan' } = {}) {
    const poly = svgEl('polygon', {}, `space__poly space__poly--${tone}`);
    this.layers.shape.appendChild(poly);
    const view = this;
    return this.track({
      nodes: [poly],
      draw() {
        poly.setAttribute('points', points.map((p) => view.project(p).map(fmt).join(',')).join(' '));
      },
    });
  }

  /**
   * Balok bantu dengan pojok O dan P: 12 rusuk putus-putus. Siswa membaca
   * "maju x, ke samping y, naik z" sebagai tiga rusuk dari O.
   */
  box(p, { tone = 'ink' } = {}) {
    const [x, y, z] = p;
    const c = [[0, 0, 0], [x, 0, 0], [x, y, 0], [0, y, 0], [0, 0, z], [x, 0, z], [x, y, z], [0, y, z]];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const lines = edges
      .filter(([i, j]) => c[i].some((v, k) => v !== c[j][k]))
      .map(([i, j]) => this.segment(c[i], c[j], { dashed: true, tone }));
    return { remove: () => lines.forEach((l) => l.remove()) };
  }

  /** Penanda bergerak (drone): `moveTo(p, ms)` beranimasi, mengembalikan janji. */
  mover(p, { label = null } = {}) {
    const g = svgEl('g', {}, 'space__mover');
    const ring = svgEl('circle', { r: 11 }, 'space__mover-ring');
    const body = svgEl('circle', { r: 6 }, 'space__mover-body');
    g.append(ring, body);
    this.layers.point.appendChild(g);
    const view = this;
    const item = this.track({
      nodes: [g],
      p: p.slice(),
      draw() {
        const [x, y] = view.project(this.p);
        g.setAttribute('transform', `translate(${fmt(x)} ${fmt(y)})`);
      },
    });
    if (label) {
      item.label = this.addLabel(item.p, label, 'space__label--mover', [16, -16]);
      const base = item.remove;
      item.remove = () => { base(); item.label.remove(); };
    }
    item.moveTo = (q, ms = 110) => this.tweenPoint(item.p, q, ms, (pt) => {
      item.p = pt;
      item.draw();
      if (item.label) item.label.setPosition(pt);
    });
    item.el = g;
    return item;
  }

  tweenPoint(from, to, ms, apply) {
    const a = from.slice();
    if (!ms || still() || this.destroyed) {
      apply(to.slice());
      return Promise.resolve();
    }
    const t0 = performance.now();
    return new Promise((resolve) => {
      const tick = (now) => {
        if (this.destroyed) { resolve(); return; }
        const k = Math.min(1, (now - t0) / ms);
        const e = k < 0.5 ? 2 * k * k : 1 - ((-2 * k + 2) ** 2) / 2;
        apply(a.map((v, i) => v + (to[i] - v) * e));
        if (k < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  destroy() {
    if (this.destroyed) return;
    this.cancelTween();
    this.destroyed = true;
    this.observer.disconnect();
    this.cleanups.forEach((fn) => { try { fn(); } catch { /* sudah lepas */ } });
    this.items.clear();
    this.root.remove();
    this.host.classList.remove('space-host');
  }
}

/** @returns {SpaceView} */
export function createSpaceView(host, options) {
  return new SpaceView(host, options);
}
