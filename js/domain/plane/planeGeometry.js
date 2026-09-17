/**
 * domain/plane/planeGeometry.js — Geometri layar bidang kartesius.
 *
 * GEOMETRI MURNI: tidak ada `document`, `window`, atau node SVG di sini.
 * Semua yang bisa salah secara MATEMATIS — arah sumbu y, skala 1:1, posisi
 * busur, ujung panah — tinggal di berkas ini dan diuji di Node
 * (`tests/engine.test.mjs`). Lapisan SVG (`vectorPlane.js`, `arrow.js`)
 * hanya menyalin angka yang keluar dari sini ke atribut.
 *
 * ------------------------------------------------------------
 * KONTRAK 1 — SUMBU Y TERBALIK
 * ------------------------------------------------------------
 * Di layar, y bertambah KE BAWAH. Satu-satunya tempat tanda minus itu
 * ditulis adalah `toScreen()` dan `toMath()` di bawah. Busur, penanda siku,
 * dan garis bagi dihitung di RUANG MATEMATIKA lalu dikonversi — tidak ada
 * fungsi lain yang membalik y dengan tangannya sendiri.
 *
 * ------------------------------------------------------------
 * KONTRAK 2 — SKALA x = SKALA y
 * ------------------------------------------------------------
 * Viewport memakai SATU angka `scale` (piksel per satuan) untuk kedua sumbu,
 * yaitu yang terkecil dari lebar/rentang-x dan tinggi/rentang-y. Rentang
 * yang diminta selalu terlihat utuh; sisa ruang di sumbu yang lebih lapang
 * diisi kisi tambahan, bukan diregangkan. Sudut 45° tetap 45°.
 */

/* ============================================================
   1. TITIK MASUKAN
   ============================================================ */

function toFinite(value, label) {
  const n = value !== null && typeof value === 'object' && 'n' in value && 'd' in value
    ? value.n / value.d
    : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw new TypeError(`${label} harus bilangan berhingga, diterima: ${value}`);
  }
  return n;
}

/**
 * [x, y] · vec(x, y) · vec(x, y, 0) → [x, y] desimal.
 *
 * Bidang ini DUA dimensi. Vektor ruang dengan z ≠ 0 ditolak keras, bukan
 * diproyeksikan diam-diam ke bidang xy — gambar yang membuang satu
 * komponen adalah gambar yang salah.
 */
export function toPlanePoint(p) {
  let x;
  let y;
  let z = 0;
  if (Array.isArray(p)) {
    if (p.length !== 2 && p.length !== 3) throw new TypeError('Titik bidang harus [x, y]');
    [x, y, z = 0] = p;
  } else if (p && typeof p === 'object' && 'x' in p && 'y' in p) {
    ({ x, y } = p);
    z = p.z === undefined ? 0 : p.z;
  } else {
    throw new TypeError('Titik bidang harus [x, y] atau vektor dari vec()');
  }
  if (toFinite(z, 'Komponen z') !== 0) {
    throw new TypeError('Bidang kartesius hanya menggambar vektor bidang; komponen z-nya harus 0');
  }
  return [toFinite(x, 'Komponen x'), toFinite(y, 'Komponen y')];
}


/* ============================================================
   2. VIEWPORT
   ============================================================ */

/**
 * @param {{ xRange: [number, number], yRange: [number, number],
 *           width: number, height: number, padding?: number }} spec
 */
export function createViewport({ xRange, yRange, width, height, padding = 0 }) {
  const [x0, x1] = xRange.map((v) => toFinite(v, 'Rentang x'));
  const [y0, y1] = yRange.map((v) => toFinite(v, 'Rentang y'));
  if (!(x1 > x0) || !(y1 > y0)) {
    throw new RangeError('Rentang sumbu harus [minimum, maksimum] dengan minimum < maksimum');
  }
  const innerW = toFinite(width, 'Lebar') - 2 * padding;
  const innerH = toFinite(height, 'Tinggi') - 2 * padding;
  if (!(innerW > 0) || !(innerH > 0)) {
    throw new RangeError(`Wadah ${width}×${height}px terlalu kecil untuk padding ${padding}px`);
  }

  const scale = Math.min(innerW / (x1 - x0), innerH / (y1 - y0));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const halfW = width / 2;
  const halfH = height / 2;

  return Object.freeze({
    width,
    height,
    scale,
    xMin: cx - halfW / scale,
    xMax: cx + halfW / scale,
    yMin: cy - halfH / scale,
    yMax: cy + halfH / scale,

    /** Matematika → piksel SVG. SATU-SATUNYA pembalik sumbu y. */
    toScreen([x, y]) {
      return [halfW + (x - cx) * scale, halfH - (y - cy) * scale];
    },

    /** Piksel SVG → matematika. Kebalikan persis dari toScreen. */
    toMath([px, py]) {
      return [cx + (px - halfW) / scale, cy - (py - halfH) / scale];
    },
  });
}


/* ============================================================
   3. KISI
   ============================================================ */

/** Langkah label 1-2-5 terkecil yang jaraknya minimal `minPx` piksel. */
export function tickStep(scale, minPx = 24) {
  for (let magnitude = 1; magnitude < 1e9; magnitude *= 10) {
    for (const base of [1, 2, 5]) {
      if (base * magnitude * scale >= minPx) return base * magnitude;
    }
  }
  return 1e9;
}

function noNegativeZero(v) {
  return Object.is(v, -0) ? 0 : v;
}

/** Kelipatan `step` di dalam [min, max], tanpa −0. */
export function gridValues(min, max, step) {
  const values = [];
  for (let i = Math.ceil(min / step); i * step <= max + 1e-9; i += 1) {
    values.push(noNegativeZero(i * step));
  }
  return values;
}


/* ============================================================
   4. PANAH
   ============================================================ */

/**
 * Ujung BATANG panah (piksel). Batangnya berhenti sepanjang kepala sebelum
 * titik ujung, supaya puncak kepala — bukan ujung bulat garisnya — yang
 * jatuh tepat di koordinat vektor.
 *
 * Panah yang lebih pendek dari kepalanya tetap diberi batang mini searah,
 * karena `orient="auto"` pada marker butuh arah garis. Hanya vektor nol
 * yang `degenerate` dan digambar sebagai titik oleh pemakainya.
 */
export function arrowShaft(start, tip, headLength) {
  const dx = tip[0] - start[0];
  const dy = tip[1] - start[1];
  const length = Math.hypot(dx, dy);
  if (length < 1e-9) return { end: [start[0], start[1]], length: 0, degenerate: true };
  const ux = dx / length;
  const uy = dy / length;
  const shaft = length > headLength ? length - headLength : length * 0.25;
  return {
    end: [start[0] + ux * shaft, start[1] + uy * shaft],
    length,
    degenerate: false,
  };
}

/**
 * Posisi label di tengah panah, digeser tegak lurus ke KIRI arah panah
 * (di layar). Panah mendatar ke kanan → label di atasnya.
 */
export function labelAnchor(start, tip, offset = 14) {
  const mx = (start[0] + tip[0]) / 2;
  const my = (start[1] + tip[1]) / 2;
  const dx = tip[0] - start[0];
  const dy = tip[1] - start[1];
  const length = Math.hypot(dx, dy);
  if (length < 1e-9) return [mx, my - offset];
  return [noNegativeZero(mx + (dy / length) * offset), noNegativeZero(my - (dx / length) * offset)];
}


/* ============================================================
   5. BUSUR SUDUT & PENANDA SIKU
   ============================================================ */

function unitOf([x, y]) {
  const length = Math.hypot(x, y);
  if (length < 1e-12) throw new RangeError('Vektor nol tidak punya arah untuk busur sudut');
  return [x / length, y / length];
}

/**
 * Titik-titik busur di antara arah u dan v, SELALU menyapu sudut kecil
 * (≤ 180°) — sudut antara dua vektor yang dimaksud rumus cos θ.
 *
 * Busur dihitung di ruang matematika (jari-jari piksel dibagi skala) lalu
 * dikonversi lewat toScreen — tidak ada flag sweep SVG yang bisa salah arah.
 *
 * @returns {{ points: number[][], labelAt: number[] }}
 */
export function arcPoints(viewport, origin, u, v, radiusPx = 28, segments = 24) {
  const [ux, uy] = unitOf(u);
  const [vx, vy] = unitOf(v);
  const start = Math.atan2(uy, ux);
  let delta = Math.atan2(vy, vx) - start;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;

  const [ox, oy] = origin;
  const at = (angle, px) => {
    const r = px / viewport.scale;
    return viewport.toScreen([ox + r * Math.cos(angle), oy + r * Math.sin(angle)]);
  };

  const points = [];
  for (let i = 0; i <= segments; i += 1) points.push(at(start + (delta * i) / segments, radiusPx));
  return { points, labelAt: at(start + delta / 2, radiusPx + 16) };
}

/** Persegi siku kecil di pangkal: [di u, sudut persegi, di v] dalam piksel. */
export function rightAngleMarker(viewport, origin, u, v, sizePx = 10) {
  const [ux, uy] = unitOf(u);
  const [vx, vy] = unitOf(v);
  const r = sizePx / viewport.scale;
  const [ox, oy] = origin;
  return [
    viewport.toScreen([ox + r * ux, oy + r * uy]),
    viewport.toScreen([ox + r * (ux + vx), oy + r * (uy + vy)]),
    viewport.toScreen([ox + r * vx, oy + r * vy]),
  ];
}


/* ============================================================
   6. SERET & ATRIBUT
   ============================================================ */

/** Bulatkan ke kelipatan `step`, lalu jepit ke dalam rentang terlihat. */
export function snapPoint([x, y], viewport, step = 1) {
  const snap = (value, min, max) => {
    const lo = Math.ceil(min / step) * step;
    const hi = Math.floor(max / step) * step;
    return noNegativeZero(Math.min(hi, Math.max(lo, Math.round(value / step) * step)));
  };
  return [snap(x, viewport.xMin, viewport.xMax), snap(y, viewport.yMin, viewport.yMax)];
}

/**
 * Angka → atribut SVG, 2 desimal. NaN DILEMPAR, tidak ditulis: atribut
 * "NaN" tidak memunculkan galat apa pun, ia hanya membuat panah lenyap.
 */
export function fmt(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Koordinat SVG tidak valid: ${value}`);
  }
  return String(noNegativeZero(Math.round(value * 100) / 100));
}

/** Titik piksel → perintah path "M x y L x y …". */
export function polylinePath(points) {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${fmt(x)} ${fmt(y)}`).join(' ');
}
