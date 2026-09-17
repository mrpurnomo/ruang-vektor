/**
 * domain/plane/arrowAnimation.js — Tween angka untuk panah yang berpindah.
 *
 * Kenapa bukan GSAP: panah digambar ulang dari KOORDINAT MATEMATIKA setiap
 * frame (lewat toScreen), bukan dari atribut piksel. Tween di ruang
 * matematika membuat animasi tetap benar walau wadahnya berubah ukuran di
 * tengah jalan — GSAP yang menganimasikan atribut `d` akan membawa piksel
 * lama ke viewport baru.
 *
 * Setiap tween BISA DIBATALKAN dan `finished` selalu selesai:
 *   true  → sampai tujuan
 *   false → dibatalkan (mis. bidangnya dihancurkan di tengah animasi)
 * Pemanggil yang menunggu `await` tidak pernah menggantung selamanya.
 */

export const easeOutCubic = (t) => 1 - (1 - t) ** 3;

function reducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * @param {{ from: number[], to: number[], duration?: number,
 *           easing?: (t: number) => number, onFrame: (values: number[]) => void }} spec
 * @returns {{ cancel: () => void, finished: Promise<boolean> }}
 */
export function tween({ from, to, duration = 320, easing = easeOutCubic, onFrame }) {
  let raf = 0;
  let settled = false;
  let resolve;
  const finished = new Promise((r) => { resolve = r; });

  const settle = (ok) => {
    if (settled) return;
    settled = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    resolve(ok);
  };

  // Gerak dikurangi: langsung ke tujuan. URUTAN pedagogisnya tetap —
  // yang hilang hanya perpindahannya.
  if (!(duration > 0) || reducedMotion()) {
    onFrame(to.slice());
    settle(true);
    return { cancel: () => settle(false), finished };
  }

  const start = performance.now();
  const step = (now) => {
    if (settled) return;
    const t = Math.min(1, (now - start) / duration);
    // Frame terakhir menulis nilai tujuan PERSIS, bukan hasil interpolasi
    // yang bisa meleset 1e-16 dan membuat "sampai di (3, 2)" tidak tepat.
    if (t >= 1) {
      raf = 0;
      onFrame(to.slice());
      settle(true);
      return;
    }
    const e = easing(t);
    onFrame(from.map((a, i) => a + (to[i] - a) * e));
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);

  return { cancel: () => settle(false), finished };
}
