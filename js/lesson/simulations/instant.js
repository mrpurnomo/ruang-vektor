/**
 * lesson/simulations/instant.js — Mode "seketika" untuk memulihkan kasus.
 *
 * Revisi guru: siswa yang kembali ke kasus yang sudah selesai harus
 * melihat KEADAAN AKHIRNYA, dan kasus yang sedang berjalan dilanjutkan
 * dari langkah terakhir — bukan diulang dari awal. Kit memulihkannya
 * dengan memutar ulang `onSolved` setiap langkah yang sudah dikerjakan.
 * Selama pemutaran ulang itu animasi dan bunyi harus mati: gambarnya
 * langsung pada keadaan akhir, tanpa lompatan dan denting berderet.
 *
 * Modul kecil tersendiri supaya simKit.js dan guidedKit.js sama-sama bisa
 * membacanya tanpa impor melingkar.
 */

let instant = 0;

export function isInstant() {
  return instant > 0;
}

/** Jalankan `fn` (boleh async) dalam mode seketika. */
export async function withInstant(fn) {
  instant += 1;
  try {
    return await fn();
  } finally {
    instant -= 1;
  }
}
