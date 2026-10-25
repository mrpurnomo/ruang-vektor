/**
 * core/ui/sfx.js — Efek suara ringan, murni Web Audio API.
 *
 * Tidak ada berkas audio: semua bunyi DISINTESIS dari osilator, jadi tidak
 * ada aset yang bisa gagal dimuat di lab tanpa internet, dan ukurannya nol.
 *
 *   sfx.tap()      klik mekanis halus — ketukan yang diterima
 *   sfx.step(i)    blip bernada naik — langkah ke-i dari animasi lompatan
 *   sfx.success()  dua akor mayor — kasus/vektor berhasil terbentuk
 *   sfx.wrong()    dentum lembut + getar singkat (bila perangkat mendukung)
 *   sfx.reveal()   sapuan + denting — pop-up kesimpulan muncul
 *   sfx.page()     desir kertas — dokumen Rangkuman dibuka
 *
 * Kebijakan autoplay peramban hanya mengizinkan audio sesudah gestur
 * pengguna. Semua bunyi di sini memang dipicu ketukan, dan AudioContext
 * dibuat MALAS pada bunyi pertama. Kegagalan apa pun (peramban lama,
 * konteks ditangguhkan) DITELAN diam-diam: suara adalah bumbu, bukan jalur
 * umpan balik. Setiap bunyi selalu berpasangan dengan umpan balik visual.
 *
 * Modul ini generik (core/): ia tidak tahu apa-apa soal vektor.
 */

const STORE_KEY = 'vektorLab.sfx.v1';

let ctx = null;
let enabled = readEnabled();

function readEnabled() {
  try {
    return localStorage.getItem(STORE_KEY) !== 'off';
  } catch {
    return true;
  }
}

/** Nyalakan/matikan suara; pilihan disimpan per perangkat. */
export function setEnabled(on) {
  enabled = Boolean(on);
  try {
    localStorage.setItem(STORE_KEY, enabled ? 'on' : 'off');
  } catch { /* penyimpanan diblokir: tetap berlaku untuk sesi ini */ }
}

export function isEnabled() {
  return enabled;
}

function audio() {
  if (!enabled || typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Satu nada dengan selubung serang-cepat / luruh-eksponensial — tanpa
 * selubung, osilator berbunyi "klik" kasar saat mulai dan berhenti.
 */
function tone(freq, { type = 'sine', at = 0, dur = 0.12, gain = 0.06, slideTo = null } = {}) {
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + at;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  } catch { /* lihat catatan berkas: suara tidak boleh menggagalkan apa pun */ }
}

/** Tangga nada pentatonik mayor dari C5: naik terus tanpa pernah sumbang. */
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0];

function pentatonic(index) {
  const octave = Math.floor(index / PENTATONIC.length);
  return PENTATONIC[index % PENTATONIC.length] * 2 ** Math.min(octave, 2);
}

export function tap() {
  tone(2200, { type: 'triangle', dur: 0.035, gain: 0.035 });
  tone(1100, { type: 'sine', dur: 0.05, gain: 0.03 });
}

/** @param {number} i  urutan langkah, mulai 1 — nadanya naik bersama hitungan. */
export function step(i = 1) {
  tone(pentatonic(Math.max(0, i - 1)), { type: 'sine', dur: 0.09, gain: 0.05 });
}

export function success() {
  // Akor I lalu akor yang lebih tinggi: "berhasil", bukan "fanfare".
  [523.25, 659.25, 783.99].forEach((f) => tone(f, { type: 'triangle', dur: 0.32, gain: 0.035 }));
  [659.25, 783.99, 1046.5].forEach((f) => tone(f, { type: 'sine', at: 0.13, dur: 0.5, gain: 0.04 }));
}

export function wrong() {
  tone(190, { type: 'sine', dur: 0.16, gain: 0.09, slideTo: 95 });
  try {
    // Tanpa aktivasi pengguna yang masih hidup, Chromium menolak vibrate()
    // dan menulis peringatan "[Intervention]" ke konsol.
    const active = !navigator.userActivation || navigator.userActivation.isActive;
    if (enabled && active && navigator.vibrate) navigator.vibrate(35);
  } catch { /* getar tidak tersedia: abaikan */ }
}

/** Memilih opsi jawaban: blip lembut bernada sedang. */
export function select() {
  tone(880, { type: 'sine', dur: 0.06, gain: 0.04 });
  tone(1320, { type: 'triangle', at: 0.025, dur: 0.05, gain: 0.025 });
}

/** Jawaban benar di kuis: arpeggio naik cepat + kilau — lebih meriah dari success(). */
export function correct() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, { type: 'triangle', at: i * 0.07, dur: 0.22, gain: 0.045 }));
  tone(2093, { type: 'sine', at: 0.3, dur: 0.25, gain: 0.025 });
}

/** Jawaban salah di kuis: "dum-dum" turun — jelas salah, tidak menghukum. */
export function oops() {
  tone(330, { type: 'square', dur: 0.12, gain: 0.03, slideTo: 260 });
  tone(247, { type: 'square', at: 0.14, dur: 0.2, gain: 0.03, slideTo: 165 });
  try {
    const active = !navigator.userActivation || navigator.userActivation.isActive;
    if (enabled && active && navigator.vibrate) navigator.vibrate([40, 50, 40]);
  } catch { /* getar tidak tersedia */ }
}

/** Kuis tuntas: fanfare pendek tiga ketukan lalu akor panjang. */
export function fanfare() {
  [[523.25, 0], [659.25, 0.12], [783.99, 0.24]].forEach(([f, at]) => tone(f, { type: 'triangle', at, dur: 0.14, gain: 0.05 }));
  [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, { type: 'sine', at: 0.4, dur: 0.9, gain: 0.035 }));
}

/** Pop-up gagasan penting muncul (kesimpulan): sapuan naik + denting "aha!". */
export function reveal() {
  tone(392, { type: 'sine', dur: 0.28, gain: 0.03, slideTo: 784 });
  [1046.5, 1318.5, 1568].forEach((f, i) => tone(f, { type: 'triangle', at: 0.18 + i * 0.06, dur: 0.35, gain: 0.03 }));
}

/** Dokumen dibuka (Rangkuman): desir kertas pendek lalu ketuk lembut. */
export function page() {
  tone(1800, { type: 'triangle', dur: 0.09, gain: 0.018, slideTo: 600 });
  tone(2600, { type: 'sine', at: 0.03, dur: 0.07, gain: 0.012, slideTo: 1200 });
  tone(660, { type: 'sine', at: 0.1, dur: 0.12, gain: 0.035 });
  tone(990, { type: 'sine', at: 0.16, dur: 0.16, gain: 0.025 });
}

export default { tap, step, success, wrong, select, correct, oops, fanfare, reveal, page, setEnabled, isEnabled };
