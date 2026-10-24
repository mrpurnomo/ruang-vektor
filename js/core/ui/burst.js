/**
 * core/ui/burst.js — Pop-up umpan balik "heboh" yang sesaat.
 *
 *   burst('success', { anchor })   → "Tepat!"  kartu memantul + percikan + akor
 *   burst('error',   { anchor })   → "Belum tepat!" kartu bergetar + kilat + dentum
 *
 * Revisi guru: Mini Kuis terasa hambar — memeriksa jawaban harus terasa
 * seperti peristiwa. Pop-up ini HANYA perayaan/peringatan sesaat (±1 dtk):
 * ia tembus-ketuk (pointer-events: none) dan tidak membawa isi pelajaran.
 * Kalimat penjelasnya tetap di toast (aria-live), jadi pop-up ini
 * aria-hidden — pembaca layar tidak mendengar dua kali.
 *
 * Generik (core/): tidak tahu apa-apa soal vektor.
 */

import { icon } from './icons.js';
import sfx from './sfx.js';

const LIFE_MS = 1000;
/** Warna percikan = token palet hidup (sama dengan konfeti). */
const SPARK_TOKENS = ['--royal', '--yellow', '--cyan', '--success', '--magenta'];

let current = null;
let timer = 0;

function stillMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * @param {'success'|'error'} type
 * @param {{ title?: string, anchor?: HTMLElement|null }} [options]
 *   anchor — pop-up dipusatkan di atas elemen ini (mis. kartu soal);
 *   tanpa anchor, di tengah jendela.
 */
export function burst(type = 'success', { title = null, anchor = null } = {}) {
  if (typeof document === 'undefined') return null;
  dismissBurst();
  const ok = type === 'success';

  const node = document.createElement('div');
  node.className = `burst burst--${ok ? 'ok' : 'no'}${stillMotion() ? ' burst--still' : ''}`;
  node.setAttribute('aria-hidden', 'true');

  const sparks = ok && !stillMotion()
    ? Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * 360 + (i % 2 ? 8 : -8);
      const dist = 70 + (i % 3) * 22;
      return `<i style="--a:${angle}deg;--d:${dist}px;--c:var(${SPARK_TOKENS[i % SPARK_TOKENS.length]})"></i>`;
    }).join('')
    : '';

  node.innerHTML = `
    <div class="burst__sparks">${sparks}</div>
    <div class="burst__card">
      <span class="burst__icon">${icon(ok ? 'check' : 'x', { size: 34, stroke: 3 })}</span>
      <span class="burst__title">${title || (ok ? 'Tepat!' : 'Belum tepat!')}</span>
    </div>`;

  // Pusat pop-up = pusat anchor yang TERLIHAT (dibatasi jendela).
  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  if (anchor && anchor.getBoundingClientRect) {
    const r = anchor.getBoundingClientRect();
    const top = Math.max(r.top, 0);
    const bottom = Math.min(r.bottom, window.innerHeight);
    if (r.width && bottom > top) {
      cx = r.left + r.width / 2;
      cy = top + (bottom - top) / 2;
    }
  }
  node.style.setProperty('--bx', `${Math.round(cx)}px`);
  node.style.setProperty('--by', `${Math.round(cy)}px`);

  document.body.appendChild(node);
  current = node;
  if (ok) sfx.correct(); else sfx.oops();

  timer = setTimeout(dismissBurst, LIFE_MS);
  return node;
}

/** Bersihkan pop-up yang masih tampil (dipakai saat pindah layar). */
export function dismissBurst() {
  clearTimeout(timer);
  timer = 0;
  if (current) {
    current.remove();
    current = null;
  }
}

export default { burst, dismissBurst };
