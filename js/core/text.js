/**
 * core/text.js
 * Pengisi templat kalimat — generik, tanpa pengetahuan domain.
 *
 * Kalimat umpan balik simulasi tinggal di JSON (`simulation.toasts`), bukan
 * di kode, supaya guru bisa memperbaikinya tanpa menyentuh JavaScript.
 * Nilai yang berubah-ubah disisipkan lewat placeholder.
 */

/**
 * Ganti setiap `{{kunci}}` dengan `values[kunci]`.
 *
 * KURUNG GANDA, bukan tunggal (Blueprint §4.4 butir 3): kurung tunggal
 * `{kunci}` bertabrakan dengan LaTeX (`\vec{AB}`, `\hat{j}`) yang memang
 * memenuhi kalimat-kalimat ini, dan placeholder yang salah tulis lolos
 * tanpa galat lalu tampil apa adanya di layar siswa.
 *
 * Kunci yang tidak punya nilai TIDAK dibiarkan tampil sebagai "{{kunci}}".
 * Ia dikosongkan, dan penulis datanya diberi tahu lewat konsol — siswa
 * tidak boleh pernah melihat kerangka templat.
 *
 * @param {string} template
 * @param {Record<string, unknown>} [values]
 */
export function fillTemplate(template, values = {}) {
  if (typeof template !== 'string' || !template.includes('{{')) return template || '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(values, key) && values[key] != null) {
      return String(values[key]);
    }
    console.warn(`[text] placeholder "{{${key}}}" tidak punya nilai`);
    return '';
  });
}
