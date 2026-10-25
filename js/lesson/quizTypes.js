/**
 * lesson/quizTypes.js — Tipe soal Mini Kuis yang tahu soal vektor.
 *
 * `js/quiz/` sengaja tidak tahu apa-apa soal vektor. Tipe soal interaktif
 * yang membutuhkan bidang kartesius didaftarkan DI SINI, di lapisan
 * pelajaran, lewat `QuizEngine.registerType` — titik sambung domain yang
 * sejajar dengan registry simulasi.
 *
 * ------------------------------------------------------------
 * plane_tap — soal dijawab dengan KETUKAN di bidang kartesius
 * ------------------------------------------------------------
 *   {
 *     "input_type": "plane_tap",
 *     "plane":  { "xRange": [-4, 5], "yRange": [-2, 4] },
 *     "points": { "P": [-2, 1], "Q": [3, 3] },          // titik bernama (data soal)
 *     "arrows": [{ "from": "P", "to": "Q" }],          // panah yang diberikan
 *     "answer": { "taps": [[3, 3], [-2, 1]] },         // 1 ketukan = letak titik,
 *                                                      // 2 ketukan = pangkal → ujung
 *     "feedback": [{ "taps": [[-2, 1], [3, 3]], "message": "…" }]  // salah KHAS
 *   }
 *
 * Aksioma: aplikasi tidak menggambar jawaban. Yang tergambar sebelum
 * diperiksa hanya jejak ketukan siswa sendiri (titik atau panahnya).
 */

import { QuizEngine } from '../quiz/quizEngine.js';
import { createVectorPlane } from '../domain/plane/vectorPlane.js';
import { renderMixed } from '../core/render/katexRenderer.js';
import toast from '../core/ui/toast.js';
import sfx from '../core/ui/sfx.js';

const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const sameSeq = (xs, ys) => xs.length === ys.length && xs.every((x, i) => same(x, ys[i]));
const tuple = ([x, y]) => `(${String(x).replace('-', '−')},\\, ${String(y).replace('-', '−')})`;

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

/** Nama titik bila ketukan jatuh tepat di titik bernama — untuk label jejak. */
function nameAt(points, p) {
  const hit = Object.entries(points || {}).find(([, q]) => same(q, p));
  return hit ? hit[0] : null;
}

QuizEngine.registerType('plane_tap', {
  render(api) {
    const { q, host } = api;
    const need = q.answer.taps.length;

    const wrap = el('div', 'quiz-plane');
    const planeHost = el('div', 'plane-host quiz-plane__host');
    const status = el('p', 'quiz-plane__status');
    wrap.append(planeHost, status);
    host.appendChild(wrap);

    const plane = createVectorPlane(planeHost, {
      xRange: q.plane.xRange,
      yRange: q.plane.yRange,
      ariaLabel: 'Bidang kartesius soal — ketuk titik jawabanmu',
    });
    api.onCleanup(() => plane.destroy());

    const marks = {};
    Object.entries(q.points || {}).forEach(([name, p]) => {
      marks[name] = plane.drawPoint(p, { label: name });
    });
    (q.arrows || []).forEach((a) => {
      plane.drawVector({ from: q.points[a.from], to: q.points[a.to], name: a.name || `${a.from}${a.to}`, tone: 'blue' });
    });

    let taps = [];
    let trail = [];
    let studentArrow = null;
    const clearTrail = () => {
      trail.forEach((m) => m.remove());
      trail = [];
      studentArrow = null;
      Object.values(marks).forEach((m) => m.el.classList.remove('is-armed'));
    };
    const say = () => {
      status.innerHTML = renderMixed(taps.length
        ? `Ketukan **${taps.length}/${need}**: $${taps.map(tuple).join(' \\to ')}$${taps.length < need ? ' — lanjutkan.' : ' — tekan **Periksa Jawaban**.'}`
        : need === 1
          ? 'Ketuk **satu titik** pada bidang.'
          : 'Ketuk **pangkal** lebih dulu, lalu **ujung**.');
    };

    const release = plane.enablePointPicking((p) => {
      if (api.isAnswered()) return;
      if (taps.length >= need) { taps = []; clearTrail(); }
      taps.push(p);
      sfx.tap();
      const at = nameAt(q.points, p);
      if (need === 1 || taps.length === 1) {
        // Ketukan pertama dari dua = pangkal: titik bernama berdenyut,
        // titik kosong diberi penanda sementara.
        if (at && need > 1) marks[at].el.classList.add('is-armed');
        else trail.push(plane.drawPoint(p, { ghost: true }));
      } else {
        // Panah MILIK SISWA (bukan kunci): dari ketukan pertama ke kedua.
        const arrow = plane.drawVector({ from: taps[0], to: taps[1], name: 'jawaban', tone: 'amber', label: null });
        trail.push(arrow);
        studentArrow = arrow;
      }
      say();
    });
    api.onCleanup(release);
    say();

    api.addSubmit(() => {
      if (taps.length < need) {
        toast.warn(need === 1 ? 'Ketuk dulu satu titik di bidang.' : `Baru ${taps.length} dari ${need} ketukan — ketuk pangkal lalu ujungnya.`);
        return;
      }
      const ok = sameSeq(taps, q.answer.taps);
      const special = ok ? null : (q.feedback || []).find((f) => sameSeq(taps, f.taps));
      if (!ok) plane.flashMiss(taps[taps.length - 1]);
      api.judge(ok, special ? special.message : null);
      revealArrow(ok);
    });

    /**
     * Sesudah diperiksa, vektor MILIK SISWA ditampilkan utuh (revisi guru:
     * "OR harus muncul sesuai titik yang dibuat siswa"). Kobalt bila benar,
     * beri bila salah — siswa melihat vektor yang benar-benar ia buat.
     */
    function revealArrow(ok) {
      const rv = q.reveal;
      if (!rv) return;
      const tone = ok ? 'blue' : 'coral';
      status.innerHTML = renderMixed(ok
        ? `**Benar!** Inilah vektor $${rv.label || `\\overrightarrow{${rv.name}}`}$ yang kamu buat.`
        : `Inilah vektor $${rv.label || `\\overrightarrow{${rv.name}}`}$ yang kamu buat — bandingkan dengan yang diminta, lalu coba lagi.`);
      // Nama dua huruf = \overrightarrow; vektor satu huruf (û, v̂) memberi `label` sendiri.
      const label = rv.label || `\\overrightarrow{${rv.name}}`;
      if (need === 1 && rv.from && q.points[rv.from]) {
        const from = q.points[rv.from];
        const to = taps[0];
        trail.forEach((m) => m.remove());
        trail = [];
        plane.drawPoint(to, { label: ok && !rv.label ? rv.name.slice(-1) : null });
        const arrow = plane.drawVector({ from, to: from, name: rv.name, tone, label });
        arrow.setVector({ from, to }, { animate: true, duration: 520 });
      } else if (studentArrow) {
        studentArrow.setTone(tone);
        studentArrow.setLabel(label);
      }
    }
  },

  /** Kunci untuk mode review: urutan ketukan yang benar, bertitik nama. */
  answerKey(q) {
    const parts = q.answer.taps.map((p) => {
      const n = nameAt(q.points, p);
      return n ? `${n}${tuple(p)}` : tuple(p);
    });
    const how = q.answer.taps.length > 1 ? 'Ketuk berurutan (pangkal → ujung)' : 'Ketuk titik';
    return renderMixed(`${how}: $${parts.join(' \\to ')}$`);
  },
});
