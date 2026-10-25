/**
 * lesson/simulations/guidedKit.js — Perkakas simulasi TERPANDU Bab 1.
 *
 * Sub-topik 1 menetapkan pola "gold standard": siswa mengetuk, menghitung,
 * lalu MENGGAMBAR sendiri; aplikasi baru menganimasikan hasilnya sesudah
 * jawabannya benar. Pola itu dipakai ulang oleh kelima sub-topik lain, jadi
 * potongan yang sama hidup di sini sekali saja:
 *
 *   animateHops(sim, from, delta)   lompatan satu-satuan ala Manim + lencana
 *   createArrowDrawer(sim, spec)    panah dua ketukan (pangkal → ujung)
 *   drawStroke / springPop          goresan tertulis & muncul memantul
 *
 * Tempo KONSTAN di semua kasus dan sub-topik (HOP_MS, ARROW_MS): irama yang
 * berubah-ubah terasa seperti aplikasi "tidak sabar" dan mengacaukan hitungan.
 */

import sfx from '../../core/ui/sfx.js';
import { texTuple, same, AXES } from './simKit.js';

export const HOP_MS = 110;
export const ARROW_MS = 520;

export const DIRECTION = {
  x: (sign) => (sign > 0 ? 'ke kanan' : 'ke kiri'),
  y: (sign) => (sign > 0 ? 'ke atas' : 'ke bawah'),
  z: (sign) => (sign > 0 ? 'naik' : 'turun'),
};

/** Pengguna meminta gerak dikurangi: animasi diganti keadaan akhirnya. */
export function stillMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Goresan yang "ditulis" dari pangkal ke ujung (WAAPI pada stroke-dashoffset). */
export function drawStroke(path, ms) {
  if (stillMotion() || !path || !path.animate || !path.getTotalLength) return;
  const len = path.getTotalLength();
  if (!(len > 0)) return;
  path.style.strokeDasharray = `${len}`;
  const anim = path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: ms, easing: 'ease-out' });
  anim.onfinish = () => { path.style.strokeDasharray = ''; };
}

/** Muncul memantul (spring): label & lencana yang baru lahir. */
export function springPop(node) {
  if (!node || stillMotion() || !node.animate) return;
  node.animate([
    { transform: 'scale(.35)', opacity: 0 },
    { transform: 'scale(1.18)', opacity: 1, offset: 0.6 },
    { transform: 'scale(1)', opacity: 1 },
  ], { duration: 300, easing: 'cubic-bezier(.3, 1.3, .5, 1)' });
}

/** "+7" / "−5": langkah bertanda, sebagaimana siswa menuliskannya. */
export const signedStep = (n, sign) => (sign < 0 ? `-${n}` : `+${n}`);

/** Titik apa adanya untuk kalimat umpan balik: "(3, −2)". */
export const tapped = (point) => texTuple(point);

export const samePoint = (p, q) => p[0] === q[0] && p[1] === q[1];

/**
 * Animasi langkah — diputar di `onSolved`, SESUDAH siswa sendiri menuliskan
 * jumlah langkahnya. Lompat satu satuan demi satuan sepanjang sumbu X, lalu
 * sepanjang sumbu Y, mulai dari `from`; lencana hitungan ikut berjalan dan
 * nadanya naik. Hasil akhirnya menetap: "+7" mendatar, "+4" tegak.
 */
export async function animateHops(sim, from, delta, { hopMs = HOP_MS, finalTags = true } = {}) {
  const [fx, fy] = from;
  const [tx, ty] = delta;
  const plane = sim.plane;
  if (!plane) return;
  const sx = Math.sign(tx) || 1;
  const sy = Math.sign(ty) || 1;
  // Busur mendatar menonjol KE ARAH tujuan; busur tegak menonjol KE LUAR.
  const arcY = ty >= 0 ? 1 : -1;
  const arcX = tx >= 0 ? 1 : -1;
  const delay = stillMotion() ? 0 : hopMs;
  let count = 0;

  const phase = async (n, start, step, side, badgeOffset, sign) => {
    if (!n) return;
    const badge = plane.drawTag(start, '', { offset: badgeOffset });
    for (let k = 1; k <= n; k += 1) {
      const a = [start[0] + step[0] * (k - 1), start[1] + step[1] * (k - 1)];
      const b = [start[0] + step[0] * k, start[1] + step[1] * k];
      const hop = plane.drawHop(a, b, { side });
      count += 1;
      sfx.step(count);
      drawStroke(hop.path, Math.max(60, delay - 20));
      badge.setPosition(b).setText(signedStep(k, sign));
      springPop(badge.inner);
      await sim.wait(delay);
      if (sim.destroyed || !sim.plane) return;
    }
    badge.remove();
  };

  await phase(Math.abs(tx), [fx, fy], [sx, 0], [0, arcY], [0, -20 * arcY], sx);
  if (tx && ty) await sim.wait(delay);
  if (sim.destroyed || !sim.plane) return;
  await phase(Math.abs(ty), [fx + tx, fy], [0, sy], [arcX, 0], [22 * arcX, 0], sy);
  if (!finalTags || sim.destroyed || !sim.plane) return;

  // Lencana akhir di sisi SEBERANG busurnya, supaya tidak saling tindih.
  if (tx) springPop(plane.drawTag([fx + tx / 2, fy], signedStep(Math.abs(tx), sx), { offset: [0, 15 * arcY] }).inner);
  if (ty) springPop(plane.drawTag([fx + tx, fy + ty / 2], signedStep(Math.abs(ty), sy), { offset: [-24 * arcX, 0] }).inner);
}

/**
 * Panah DUA KETUKAN: pangkal, lalu ujung. Ketukan pertama pada titik yang
 * sah hanya "dipersenjatai" (`pending`) — belum benar, belum salah, karena
 * urutannya baru diketahui di ketukan kedua. Urutan terbalik ditolak dengan
 * nama vektor yang SEBENARNYA digambar siswa.
 *
 *   const drawer = createArrowDrawer(sim, {
 *     points: () => ({ O: [0, 0], A: [7, 4] }),   // titik yang sudah ditandai
 *     marks: () => sim.marks,                      // penanda bidangnya (untuk denyut)
 *     from: 'O', to: 'A', name: 'OA',
 *   });
 *   step.check = (p) => drawer.check(p);  step.onEnter/onLeave = drawer.disarm
 *
 * Toast yang dipakai (wajib ada di JSON engine): pangkalBukanTitik,
 * ujungBukanTitik, arahPanahTerbalik ({{nama}}, {{balik}}, {{titik}}).
 */
export function createArrowDrawer(sim, { points, marks, from, to, name }) {
  let armed = null;
  const markOf = (key) => {
    const all = typeof marks === 'function' ? marks() : marks;
    return all && all[key];
  };
  const disarm = () => {
    const m = armed && markOf(armed);
    if (m) m.el.classList.remove('is-armed');
    armed = null;
  };
  const arm = (key) => {
    armed = key;
    const m = markOf(key);
    if (m) m.el.classList.add('is-armed');
  };
  const check = (p) => {
    const named = typeof points === 'function' ? points() : points;
    const hitEntry = Object.entries(named).find(([, q]) => samePoint(p, q));
    const hit = hitEntry ? hitEntry[0] : null;
    if (!armed) {
      if (!hit) return { toast: 'pangkalBukanTitik', values: { titik: tapped(p) } };
      arm(hit);
      return { pending: true };
    }
    // Mengetuk ulang pangkal yang sama: tetap menunggu ujungnya.
    if (hit === armed) return { pending: true };
    const start = armed;
    disarm();
    if (start === from && hit === to) return true;
    if (start === to && hit === from) {
      return { toast: 'arahPanahTerbalik', values: { nama: name, balik: `${to}${from}` } };
    }
    if (start !== from && hit) {
      return { toast: 'arahPanahTerbalik', values: { nama: name, balik: `${start}${hit}` } };
    }
    return { toast: 'ujungBukanTitik', values: { titik: tapped(p) } };
  };
  return { check, disarm, get armed() { return armed; } };
}

/** Isian satu per komponen: cx, cy, (cz). */
export function componentFields(dim, { prefix = 'c', label = (axis) => `$${axis}$`, mode = 'integer' } = {}) {
  return AXES.slice(0, dim).map((axis) => ({ key: `${prefix}${axis}`, label: label(axis), mode, aria: `Komponen ${axis}` }));
}

/** Nilai eksak isian komponen, urut x, y, z. */
export function componentValues(values, dim, prefix = 'c') {
  return AXES.slice(0, dim).map((axis) => values[`${prefix}${axis}`].value);
}

/** Indeks komponen pertama yang belum sama dengan kunci, atau -1. */
export function firstWrong(student, key) {
  return key.findIndex((k, i) => !same(student[i], k));
}

/** Kunci isian yang salah (untuk menandai kotaknya). */
export function wrongKeys(student, key, prefix = 'c') {
  return key.map((k, i) => (same(student[i], k) ? null : `${prefix}${AXES[i]}`)).filter(Boolean);
}
