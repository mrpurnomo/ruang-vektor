/**
 * core/ui/signaturePad.js — Bantalan tanda tangan bertema (kanvas kustom).
 *
 *   const pad = createSignaturePad(host, { onChange });
 *   pad.isEmpty()  pad.clear()  pad.toDataURL()  pad.destroy()
 *
 * Dipakai layar masuk (tanda tangan siswa, OPSIONAL) dan ditampilkan di
 * kaki dokumen Rangkuman. Tanpa elemen native: kanvas + tombol bertema.
 *
 * Kanvas sadar DPR (tajam di layar padat), goresan dihaluskan dengan kurva
 * kuadratik, dan ekspornya DIPANGKAS ke area tinta — PNG kecil (±5–20 KB)
 * yang muat di localStorage bersama identitas.
 */

const INK_TOKEN = '--graphite';

export function createSignaturePad(host, { onChange = null, height = 120 } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'sigpad';
  const canvas = document.createElement('canvas');
  canvas.className = 'sigpad__canvas';
  canvas.setAttribute('aria-label', 'Area tanda tangan — tanda tangani dengan jari atau mouse');
  canvas.setAttribute('role', 'img');
  const hint = document.createElement('span');
  hint.className = 'sigpad__hint';
  hint.textContent = 'Tanda tangan di sini';
  const baseline = document.createElement('span');
  baseline.className = 'sigpad__line';
  wrap.append(canvas, baseline, hint);
  host.appendChild(wrap);

  const ctx = canvas.getContext('2d');
  let strokes = 0;
  let drawing = false;
  let last = null;
  let lastMid = null;
  let pointerId = null;
  const ink = getComputedStyle(document.documentElement).getPropertyValue(INK_TOKEN).trim() || '#0D1320';

  function size() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(rect.width));
    const h = height;
    // Mengubah ukuran kanvas menghapus isinya: simpan lalu gambar ulang.
    const prev = strokes ? canvas.toDataURL() : null;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    if (prev) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, w, h);
      img.src = prev;
    }
  }

  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  function down(e) {
    if (pointerId !== null) return;
    pointerId = e.pointerId;
    try { canvas.setPointerCapture(e.pointerId); } catch { /* pointer sintetis */ }
    drawing = true;
    last = point(e);
    lastMid = last;
    ctx.beginPath();
    ctx.arc(last[0], last[1], 1.1, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
    e.preventDefault();
  }

  function move(e) {
    if (!drawing || e.pointerId !== pointerId) return;
    const p = point(e);
    const mid = [(last[0] + p[0]) / 2, (last[1] + p[1]) / 2];
    ctx.beginPath();
    ctx.moveTo(lastMid[0], lastMid[1]);
    ctx.quadraticCurveTo(last[0], last[1], mid[0], mid[1]);
    ctx.stroke();
    last = p;
    lastMid = mid;
    e.preventDefault();
  }

  function up(e) {
    if (!drawing || e.pointerId !== pointerId) return;
    drawing = false;
    pointerId = null;
    strokes += 1;
    wrap.classList.add('is-signed');
    if (onChange) onChange(api);
  }

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  const ro = new ResizeObserver(() => size());
  ro.observe(wrap);
  size();

  /** PNG yang dipangkas ke area bertinta (+ margin), atau null bila kosong. */
  function toDataURL() {
    if (!strokes) return null;
    const { width, height: h } = canvas;
    const data = ctx.getImageData(0, 0, width, h).data;
    let minX = width; let minY = h; let maxX = -1; let maxY = -1;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] > 8) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    const pad = 8;
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad); maxY = Math.min(h - 1, maxY + pad);
    const out = document.createElement('canvas');
    out.width = maxX - minX + 1;
    out.height = maxY - minY + 1;
    out.getContext('2d').drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  }

  const api = {
    element: wrap,
    isEmpty: () => strokes === 0,
    clear() {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      strokes = 0;
      wrap.classList.remove('is-signed');
      if (onChange) onChange(api);
    },
    toDataURL,
    destroy() {
      ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      wrap.remove();
    },
  };
  return api;
}

export default { createSignaturePad };
