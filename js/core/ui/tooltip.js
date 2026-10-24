/**
 * core/ui/tooltip.js — Tooltip bertema, pengganti `title` bawaan peramban.
 *
 * Revisi guru: "tidak boleh ada yang native, semua custom menyesuaikan
 * tema." Kotak kuning-pucat bawaan peramban (atribut `title`) tidak bisa
 * diberi gaya, jadi semua petunjuk ditulis sebagai `data-tip` dan digambar
 * di sini: pelat grafit kecil berpanah, satu node untuk seluruh aplikasi.
 *
 *   el.dataset.tip = 'Soal berikutnya';   // cukup ini; tidak ada pemasangan
 *
 * Delegasi di `document` — elemen yang dibuat belakangan ikut terlayani.
 * Jaring pengaman: elemen yang MASIH membawa `title` diubah ke `data-tip`
 * saat pertama disentuh/difokus, sebelum jeda tooltip bawaan sempat muncul.
 *
 * Sentuhan tidak memunculkan tooltip (ketukan = tindakan, bukan "melayang");
 * tetikus menunggu sejenak, fokus papan ketik langsung tampil.
 * Generik (core/): tidak tahu apa-apa soal vektor.
 */

const HOVER_DELAY_MS = 380;
const GAP = 8;        // jarak tooltip dari elemen
const EDGE = 8;       // jarak minimum dari tepi jendela

let node = null;
let target = null;
let timer = 0;
let installed = false;

function tipNode() {
  if (node && node.isConnected) return node;
  node = document.createElement('div');
  node.className = 'tip';
  node.id = 'app-tooltip';
  node.setAttribute('role', 'tooltip');
  node.hidden = true;
  document.body.appendChild(node);
  return node;
}

/** Pindahkan `title` bawaan ke `data-tip` supaya kotak bawaan tidak muncul. */
function adopt(el) {
  const t = el.getAttribute('title');
  if (t === null) return;
  el.removeAttribute('title');
  if (t.trim() && !el.dataset.tip) el.dataset.tip = t;
}

function findTarget(from) {
  const el = from instanceof Element ? from.closest('[data-tip], [title]') : null;
  if (!el || el.closest('.tip')) return null;
  adopt(el);
  return el.dataset.tip ? el : null;
}

function place(el) {
  const tip = tipNode();
  const r = el.getBoundingClientRect();
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  const vw = document.documentElement.clientWidth;
  // Di atas bila muat; kalau tidak, di bawah.
  const above = r.top - GAP - h >= EDGE;
  const top = above ? r.top - GAP - h : r.bottom + GAP;
  const center = r.left + r.width / 2;
  const left = Math.min(Math.max(center - w / 2, EDGE), vw - w - EDGE);
  tip.dataset.side = above ? 'top' : 'bottom';
  tip.style.left = `${Math.round(left)}px`;
  tip.style.top = `${Math.round(top)}px`;
  // Panah tetap menunjuk pusat elemen walau kotaknya digeser dari tepi.
  tip.style.setProperty('--tip-x', `${Math.round(Math.min(Math.max(center - left, 10), w - 10))}px`);
}

function show(el) {
  clearTimeout(timer);
  const tip = tipNode();
  target = el;
  tip.textContent = el.dataset.tip;
  tip.hidden = false;
  tip.classList.remove('is-on');
  place(el);
  el.setAttribute('aria-describedby', tip.id);
  // Bingkai berikutnya: transisi masuk berjalan dari keadaan awal.
  requestAnimationFrame(() => { if (target === el) tip.classList.add('is-on'); });
}

export function hideTooltip() {
  clearTimeout(timer);
  if (target && target.getAttribute('aria-describedby') === 'app-tooltip') target.removeAttribute('aria-describedby');
  target = null;
  if (node) {
    node.classList.remove('is-on');
    node.hidden = true;
  }
}

function schedule(el, delay) {
  clearTimeout(timer);
  if (target === el) return;
  hideTooltip();
  timer = setTimeout(() => { if (el.isConnected) show(el); }, delay);
}

export function initTooltips() {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('pointerover', (e) => {
    const el = findTarget(e.target);
    if (!el) return;
    if (e.pointerType === 'touch') return;
    schedule(el, HOVER_DELAY_MS);
  });
  document.addEventListener('pointerout', (e) => {
    const el = findTarget(e.target);
    if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
    hideTooltip();
  });
  document.addEventListener('focusin', (e) => {
    const el = findTarget(e.target);
    if (!el) return;
    // Hanya fokus papan ketik; fokus akibat ketukan tidak perlu tooltip.
    if (e.target instanceof Element && e.target.matches(':focus-visible')) schedule(el, 0);
  });
  document.addEventListener('focusout', hideTooltip);
  document.addEventListener('pointerdown', hideTooltip, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTooltip(); });
  window.addEventListener('scroll', hideTooltip, true);
  window.addEventListener('resize', hideTooltip);
  // Layar berganti (router) → jangan tinggalkan tooltip yatim.
  window.addEventListener('hashchange', hideTooltip);
}

export default { initTooltips, hideTooltip };
