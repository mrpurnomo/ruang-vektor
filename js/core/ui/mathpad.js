/**
 * core/ui/mathpad.js
 * Papan angka on-screen kustom — satu-satunya jalur input angka di aplikasi ini.
 *
 * SATU mode angka yang menulis bentuk eksak secara langsung, seperti
 * kalkulator ilmiah (revisi guru: pindah-pindah mode Angka/Pecahan/Akar
 * tidak efisien, ukurannya berubah-ubah, dan 1/√5 tidak bisa ditulis):
 *
 *   7 8 9 ⌫ C      digit · hapus satu · bersihkan
 *   4 5 6 √ ±      √ = akar pada bagian aktif · ± = tanda
 *   1 2 3 a/b ,    a/b = pecahan (penyebut) · koma desimal
 *   0 ……… ✓        selesai
 *
 *   "2√5"  →  2 √ 5          "1/√5"  →  1 a/b √ 5
 *   "√5/5" →  √ 5 a/b 5      "−3"    →  ± 3        "2,5" → 2 , 5
 *
 * Ukuran papan TETAP di semua keadaan: layar bentuk bertinggi tetap, kisi
 * 20 tuts tetap. Tuts yang tidak berlaku di sebuah isian (mis. √ untuk
 * bilangan bulat) diredupkan dan menjelaskan dirinya bila ditekan.
 *
 * Dua mode lain: `letter` (satu huruf variabel) dan `text` (papan huruf
 * penuh untuk nama & asal sekolah).
 *
 * Kenapa ini wajib (PRD §7.4): keyboard bawaan OS akan mendorong/merusak
 * tata letak 100vh yang sudah dirancang presisi, dan gayanya keluar dari tema.
 * Karena itu setiap field angka diberi readonly + inputmode="none" sehingga
 * keyboard native TIDAK PERNAH muncul, lalu papan ini yang mengisinya.
 */

import { icon } from './icons.js';
import toast from './toast.js';

/**
 * Batas isian angka.
 *
 * Bagian bulat dinaikkan dari 2 ke 4 digit (Blueprint §4.6): batas −99…99
 * adalah keputusan era sel kecil, sedangkan soal pemodelan bisa menyebut
 * gaya 250 N atau jarak 1200 m. Batasnya TETAP ADA — digit berikutnya
 * ditolak dengan penjelasan, bukan diterima diam-diam lalu terpotong.
 */
const LIMITS = {
  intDigits: 4,
  decimalDigits: 3,
  radicandDigits: 4,
  textChars: 40,
};

let padEl = null;
let scrimEl = null;
let session = null;

const KEYS = [
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { key: 'backspace', icon: 'delete', style: 'danger', aria: 'Hapus satu angka' },
  { key: 'clear', label: 'C', style: 'util', aria: 'Bersihkan isian' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { key: 'root', label: '√', style: 'form', aria: 'Akar pada bagian yang aktif', tip: 'Akar: angka berikutnya masuk ke dalam akar' },
  { key: 'sign', icon: 'plus-minus', style: 'util', aria: 'Ganti tanda positif atau negatif' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { key: 'frac', label: 'a/b', style: 'form', aria: 'Pecahan: pindah ke penyebut', tip: 'Pecahan: angka berikutnya menjadi penyebut' },
  { label: ',', value: '.', aria: 'Koma desimal' },
  { label: '0', value: '0', span: 3 },
  { key: 'confirm', icon: 'check', style: 'confirm', aria: 'Selesai', span: 2 },
];

/** Bagian kosong: koefisien '' dan tanpa akar. */
const emptyPart = () => ({ coef: '', rad: null });

function build() {
  if (padEl && document.body.contains(padEl)) return;

  scrimEl = document.createElement('div');
  scrimEl.className = 'mathpad-scrim hidden';
  /**
   * Mengetuk di luar pad menutupnya dengan MENYIMPAN, bukan membuang.
   *
   * Sebelumnya ia memanggil `close(true)` — jalur pembatalan yang sama
   * dengan Escape — sehingga angka yang sudah diketik siswa lenyap tanpa
   * jejak hanya karena jarinya meleset ke luar kotak. Di isian matriks
   * yang punya empat sampai sembilan sel, itu berarti mengulang seluruh
   * pengetikan.
   */
  scrimEl.addEventListener('pointerdown', () => close({ simpan: true }));

  padEl = document.createElement('div');
  padEl.className = 'mathpad';
  padEl.setAttribute('role', 'group');
  padEl.setAttribute('aria-label', 'Papan angka');
  padEl.dataset.open = 'false';
  padEl.dataset.mode = 'number';

  padEl.innerHTML = `
    <div class="mathpad__head">
      <div class="mathpad__mode" data-role="mode">
        <button type="button" data-mode-btn="number" aria-pressed="true">Angka</button>
        <button type="button" data-mode-btn="letter" aria-pressed="false">Variabel</button>
      </div>
      <!-- Layar bentuk: bertinggi TETAP, menampilkan isian sebagaimana ditulis
           di buku (pecahan bertumpuk, akar beratap). Bagiannya bisa diketuk. -->
      <div class="mathpad__preview" data-role="preview" data-empty="true" aria-live="polite"></div>
    </div>
    <div class="mathpad__grid" data-role="grid"></div>
    <div class="mathpad__letters" data-role="letters"></div>
    <div class="mathpad__abc" data-role="abc"></div>
  `;

  const grid = padEl.querySelector('[data-role="grid"]');
  KEYS.forEach((k) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `mp-key${k.style ? ` mp-key--${k.style}` : ''}`;
    if (k.span) btn.style.gridColumn = `span ${k.span}`;
    if (k.key) btn.dataset.key = k.key;
    if (k.value === '.') btn.dataset.key = 'decimal';
    btn.innerHTML = k.icon ? icon(k.icon) : `<span>${k.label}</span>`;
    btn.setAttribute('aria-label', k.aria || k.label);
    if (k.tip) btn.dataset.tip = k.tip;
    // pointerdown (bukan click) agar respons terasa <100ms dan tidak
    // memicu blur pada field sumber.
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleKey(k);
    });
    grid.appendChild(btn);
  });

  // Bagian pecahan di layar bentuk bisa diketuk untuk dipilih.
  padEl.querySelector('[data-role="preview"]').addEventListener('pointerdown', (e) => {
    const part = e.target.closest('[data-part]');
    if (!part || !session || session.mode !== 'number') return;
    e.preventDefault();
    session.part = part.dataset.part;
    sync();
  });

  buildAbc(padEl.querySelector('[data-role="abc"]'));

  // Papan huruf: variabel dibatasi SATU huruf (A–Z / a–z), sesuai konvensi
  // penulisan variabel di buku pelajaran.
  const letters = padEl.querySelector('[data-role="letters"]');
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((ch) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mp-letter';
    btn.textContent = ch;
    btn.setAttribute('aria-label', `Variabel ${ch}`);
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      setLetter(ch);
    });
    letters.appendChild(btn);
  });

  const caseBtn = document.createElement('button');
  caseBtn.type = 'button';
  caseBtn.className = 'mp-letter mp-letter--case';
  caseBtn.textContent = 'aA';
  caseBtn.setAttribute('aria-label', 'Ganti huruf besar atau kecil');
  caseBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    padEl.dataset.letterCase = padEl.dataset.letterCase === 'lower' ? 'upper' : 'lower';
    const lower = padEl.dataset.letterCase === 'lower';
    letters.querySelectorAll('.mp-letter:not(.mp-letter--case)').forEach((b) => {
      b.textContent = lower ? b.textContent.toLowerCase() : b.textContent.toUpperCase();
    });
  });
  letters.appendChild(caseBtn);

  padEl.querySelectorAll('[data-mode-btn]').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      setMode(btn.dataset.modeBtn);
    });
  });

  // Cegah pad menutup saat area kosongnya ditekan.
  padEl.addEventListener('pointerdown', (e) => e.stopPropagation());

  document.body.appendChild(scrimEl);
  document.body.appendChild(padEl);
}

/**
 * Papan huruf penuh untuk isian TEKS (nama, asal sekolah).
 *
 * Berbeda dari papan variabel di atas yang sengaja dibatasi satu huruf, papan
 * ini menerima kalimat. Ia tetap dibangun sendiri — bukan memanggil keyboard
 * OS — karena keyboard bawaan mendorong tata letak 100vh yang sudah dikunci
 * dan menutupi separuh layar di perangkat lanskap.
 *
 * Tata letaknya QWERTY supaya cocok dengan kebiasaan mengetik siswa.
 */
const ABC_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

function buildAbc(host) {
  if (!host) return;
  host.innerHTML = '';

  const press = (btn, handler) => {
    // pointerdown, bukan click: responsnya terasa langsung dan field sumber
    // tidak sempat kehilangan fokus.
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handler();
    });
  };

  ABC_ROWS.forEach((row, index) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'mathpad__abc-row';

    // Baris terakhir dititipi tombol hapus dan Shift agar jempol mudah
    // menjangkaunya tanpa menambah baris baru.
    if (index === 2) {
      const shift = document.createElement('button');
      shift.type = 'button';
      shift.className = 'mp-abc mp-abc--util mp-abc--wide';
      shift.dataset.role = 'abc-shift';
      shift.textContent = 'Aa';
      shift.setAttribute('aria-label', 'Ganti huruf besar atau kecil');
      press(shift, toggleAbcCase);
      rowEl.appendChild(shift);
    }

    row.forEach((ch) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mp-abc';
      btn.dataset.letter = ch;
      btn.textContent = ch;
      press(btn, () => typeText(session && session.abcUpper === false ? ch.toLowerCase() : ch));
      rowEl.appendChild(btn);
    });

    if (index === 2) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'mp-abc mp-abc--util mp-abc--wide';
      back.innerHTML = icon('delete', { size: 16 });
      back.setAttribute('aria-label', 'Hapus satu huruf');
      press(back, () => {
        session.buffer = session.buffer.slice(0, -1);
        sync();
      });
      rowEl.appendChild(back);
    }

    host.appendChild(rowEl);
  });

  // Baris terakhir: spasi, bersihkan, selesai.
  const utilRow = document.createElement('div');
  utilRow.className = 'mathpad__abc-row';

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'mp-abc mp-abc--util mp-abc--wide';
  clear.textContent = 'Hapus';
  clear.setAttribute('aria-label', 'Bersihkan seluruh isian');
  press(clear, () => { session.buffer = ''; sync(); });

  const space = document.createElement('button');
  space.type = 'button';
  space.className = 'mp-abc mp-abc--space';
  space.textContent = 'Spasi';
  space.setAttribute('aria-label', 'Spasi');
  press(space, () => typeText(' '));

  const ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'mp-abc mp-abc--util mp-abc--ok mp-abc--wide';
  ok.textContent = 'Selesai';
  ok.setAttribute('aria-label', 'Selesai mengisi');
  press(ok, () => { commit(); close(); });

  utilRow.append(clear, space, ok);
  host.appendChild(utilRow);
}

/** Sisipkan satu karakter ke isian teks, dengan batas panjang yang wajar. */
function typeText(ch) {
  if (!session || session.mode !== 'text') return;

  // 40 karakter cukup untuk nama lengkap maupun nama sekolah, dan menjaga
  // sapaan di menu tetap muat satu baris.
  if (session.buffer.length >= LIMITS.textChars) {
    flashLimit(`Isian ini paling banyak ${LIMITS.textChars} karakter.`);
    return;
  }

  // Spasi ganda tidak menambah makna, hanya merusak tampilan sapaan.
  if (ch === ' ' && (session.buffer === '' || session.buffer.endsWith(' '))) return;

  session.buffer += ch;
  sync();
}

function toggleAbcCase() {
  if (!session) return;
  session.abcUpper = session.abcUpper === false;
  padEl.querySelectorAll('[data-letter]').forEach((btn) => {
    btn.textContent = session.abcUpper ? btn.dataset.letter : btn.dataset.letter.toLowerCase();
  });
  const shift = padEl.querySelector('[data-role="abc-shift"]');
  if (shift) shift.setAttribute('aria-pressed', String(Boolean(session.abcUpper)));
}

/* ------------------------------------------------------------
   Mode angka: isian = { num, den } — masing-masing { coef, rad }.
   coef: teks bertanda ("", "-", "12", "2.5"); rad: null (tanpa akar)
   atau teks digit di dalam akar ("" = akar baru dibuka). den: null bila
   bukan pecahan. `part` = bagian yang sedang diketik.
   ------------------------------------------------------------ */

function activePart() {
  return session.part === 'den' && session.den ? session.den : session.num;
}

function isBlank(p) {
  return !p || ((p.coef === '' || p.coef === '-') && p.rad === null);
}

function handleKey(k) {
  if (!session) return;

  if (k.key === 'confirm') {
    commit();
    close();
    return;
  }

  if (session.mode !== 'number') {
    // Mode huruf: hanya hapus/bersihkan yang berlaku.
    if (k.key === 'backspace') session.buffer = session.buffer.slice(0, -1);
    if (k.key === 'clear') session.buffer = '';
    sync();
    return;
  }

  if (k.key === 'clear') {
    session.num = emptyPart();
    session.den = null;
    session.part = 'num';
    sync();
    return;
  }

  if (k.key === 'backspace') {
    const p = activePart();
    if (p.rad !== null) {
      if (p.rad !== '') p.rad = p.rad.slice(0, -1);
      else p.rad = null;
    } else if (p.coef !== '') {
      p.coef = p.coef.slice(0, -1);
    } else if (session.part === 'den') {
      // Penyebut kosong dihapus → kembali menjadi bilangan biasa.
      session.den = null;
      session.part = 'num';
    }
    sync();
    return;
  }

  if (k.key === 'sign') {
    // Tanda milik pembilang/koefisien, tidak pernah milik penyebut atau isi
    // akar: √(−5) bukan bilangan real.
    const c = session.num.coef;
    session.num.coef = c.startsWith('-') ? c.slice(1) : `-${c}`;
    sync();
    return;
  }

  if (k.key === 'root') {
    if (!session.allow.root) {
      flashLimit('Isian ini tidak memakai bentuk akar — tulis bilangan biasa.');
      return;
    }
    const p = activePart();
    if (p.rad === null) {
      if (p.coef.includes('.')) {
        flashLimit('Bentuk akar ditulis dengan bilangan bulat, misalnya 2√5.');
        return;
      }
      p.rad = '';
    } else if (p.rad === '') {
      p.rad = null;          // √ ditekan dua kali: batal
    } else {
      flashLimit('Akar ini sudah berisi. Hapus dulu angka di dalamnya untuk membuang akarnya.');
      return;
    }
    sync();
    return;
  }

  if (k.key === 'frac') {
    if (!session.allow.frac) {
      flashLimit('Isian ini hanya menerima bilangan bulat — tidak memakai pecahan.');
      return;
    }
    if (!session.den) {
      if (isBlank(session.num) || (session.num.rad === '')) {
        flashLimit('Tulis pembilangnya dulu, baru tekan a/b untuk penyebutnya.');
        return;
      }
      if (session.num.coef.includes('.')) {
        flashLimit('Pecahan ditulis dengan bilangan bulat — pembilangnya tidak memakai koma.');
        return;
      }
      session.den = emptyPart();
      session.part = 'den';
    } else {
      session.part = session.part === 'den' ? 'num' : 'den';
    }
    sync();
    return;
  }

  // Digit / koma
  const p = activePart();
  if (k.value === '.') {
    if (session.den || p.rad !== null) {
      flashLimit('Koma hanya untuk bilangan desimal biasa — pecahan dan akar ditulis dengan bilangan bulat.');
      return;
    }
    if (p.coef.includes('.')) return;
    p.coef = (p.coef === '' || p.coef === '-') ? `${p.coef}0.` : `${p.coef}.`;
    sync();
    return;
  }

  if (p.rad !== null) {
    if (p.rad.length >= LIMITS.radicandDigits) {
      flashLimit(`Bilangan di dalam akar paling banyak ${LIMITS.radicandDigits} digit.`);
      return;
    }
    p.rad = p.rad === '0' ? k.value : p.rad + k.value;
    sync();
    return;
  }

  const cur = p.coef;
  if (cur === '0') { p.coef = k.value; sync(); return; }
  if (cur === '-0') { p.coef = `-${k.value}`; sync(); return; }
  const unsigned = cur.replace('-', '');
  const [intPart, decPart] = unsigned.split('.');
  if (decPart !== undefined) {
    if (decPart.length >= LIMITS.decimalDigits) {
      flashLimit(`Paling banyak ${LIMITS.decimalDigits} angka di belakang koma.`);
      return;
    }
  } else if (intPart.length >= LIMITS.intDigits) {
    flashLimit(`Paling banyak ${LIMITS.intDigits} digit. Periksa lagi — jawaban soal di sini tidak pernah sepanjang itu.`);
    return;
  }
  p.coef = cur + k.value;
  sync();
}

/** Pilih satu huruf sebagai variabel — langsung menggantikan isi sebelumnya. */
function setLetter(ch) {
  if (!session) return;
  session.buffer = ch;
  sync();
}

/**
 * Tolak satu ketukan: guncang pratinjau DAN jelaskan alasannya.
 *
 * Kontrak 4 berlaku juga untuk papan ini — guncangan merah tanpa kalimat
 * hanya mengajarkan "coba ketuk lagi". Kalimatnya dibatasi sekali per
 * 2,5 detik: siswa yang menekan tombol yang sama lima kali tidak perlu
 * membaca lima toast yang identik.
 */
let lastLimitMessage = '';
let lastLimitAt = 0;
let limitTimer = null;

function flashLimit(message) {
  const preview = padEl && padEl.querySelector('[data-role="preview"]');
  if (preview) {
    preview.classList.remove('is-limit');
    void preview.offsetWidth;          // mulai ulang animasi yang sama
    preview.classList.add('is-limit');
    clearTimeout(limitTimer);
    limitTimer = setTimeout(() => preview.classList.remove('is-limit'), 420);
  }

  if (!message) return;
  const now = Date.now();
  if (message === lastLimitMessage && now - lastLimitAt < 2500) return;
  lastLimitMessage = message;
  lastLimitAt = now;
  toast.warn(message, { title: 'Batas isian' });
}

function setMode(mode) {
  if (!session) return;
  session.mode = mode;
  padEl.dataset.mode = mode;
  padEl.querySelectorAll('[data-mode-btn]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.modeBtn === mode));
  });
  sync();

  // Papan huruf punya tinggi berbeda, jadi posisinya dihitung ulang.
  // Sesi DITANGKAP sekarang dan diperiksa ulang di dalam callback: mengetuk
  // mode lalu langsung "✓" menutup papan di frame yang sama (terukur).
  const opened = session;
  if (opened.field) {
    requestAnimationFrame(() => {
      if (session === opened) position(opened.field);
    });
  }
}

const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
/** Tulisan koefisien untuk layar: minus tipografis, koma desimal. */
const showCoef = (c) => esc(c.replace('-', '−').replace('.', ','));
const PLACEHOLDER = '<i class="mp-ph">□</i>';

function partHtml(p, name) {
  const active = session.part === name;
  const coef = (!p.coef && p.rad === null) ? PLACEHOLDER : showCoef(p.coef === '-' && p.rad === null ? '-' : p.coef);
  const rad = p.rad === null ? ''
    : `<span class="mp-rad"><span class="mp-rad__sign">√</span><span class="mp-rad__body">${p.rad ? esc(p.rad) : PLACEHOLDER}</span></span>`;
  return `<span class="mp-part${active ? ' is-active' : ''}" data-part="${name}">${coef}${rad}</span>`;
}

/** Layar bentuk: isian sebagaimana ditulis di buku — pecahan bertumpuk, akar beratap. */
function renderStage(preview) {
  const { num, den } = session;
  const blank = isBlank(num) && !den;
  preview.dataset.empty = String(blank && num.coef === '');
  preview.dataset.frac = String(Boolean(den));
  preview.innerHTML = den
    ? `<span class="mp-frac">${partHtml(num, 'num')}<span class="mp-frac__bar" aria-hidden="true"></span>${partHtml(den, 'den')}</span>`
    : (num.coef === '' && num.rad === null ? '<span class="mp-part is-active" data-part="num"><i class="mp-ph">0</i></span>' : partHtml(num, 'num'));
}

/** Tuts yang tidak berlaku diredupkan; tuts bentuk menyala saat sedang dipakai. */
function syncKeys() {
  const p = activePart();
  const set = (key, attr, on) => {
    const b = padEl.querySelector(`.mathpad__grid [data-key="${key}"]`);
    if (b) b.toggleAttribute(attr, Boolean(on));
  };
  set('root', 'data-off', !session.allow.root);
  set('frac', 'data-off', !session.allow.frac);
  set('decimal', 'data-off', Boolean(session.den) || p.rad !== null);
  set('root', 'data-on', p.rad === '');
  set('frac', 'data-on', Boolean(session.den));
}

function sync() {
  if (!session) return;

  const preview = padEl.querySelector('[data-role="preview"]');
  if (session.mode === 'number') {
    renderStage(preview);
    syncKeys();
  } else {
    const text = session.buffer;
    preview.textContent = text || '—';
    preview.dataset.empty = String(!text);
    preview.dataset.frac = 'false';
  }

  // Tampilkan nilai berjalan di field sumber (tanpa keyboard OS terlibat).
  if (session.field) session.field.value = displayValue();
  if (typeof session.onInput === 'function') session.onInput(currentValue(), displayValue());
}

/** Bagian lengkap: punya digit, atau akar yang sudah berisi. */
function partComplete(p) {
  return p.rad === null ? /\d/.test(p.coef) : p.rad !== '';
}

function partText(p) {
  const coef = p.coef.endsWith('.') ? p.coef.slice(0, -1) : p.coef;
  return p.rad === null ? coef : `${coef}√${p.rad}`;
}

/**
 * Teks isian untuk field & pemeriksa: "2√5", "1/√5", "√5/5", "-3", "2.5".
 * Bentuk yang belum selesai (akar kosong) menghasilkan "" — kotaknya tetap
 * kosong, bukan menampilkan "2√" yang tampak seperti jawaban setengah jadi.
 * Pecahan tanpa penyebut ditulis sebagai pembilangnya saja (bukan "1/1").
 */
function displayValue() {
  if (!session) return '';
  if (session.mode !== 'number') return session.buffer;
  const { num, den } = session;
  if (!partComplete(num)) return '';
  const top = partText(num);
  if (den && partComplete(den)) return `${top}/${partText(den)}`;
  return top;
}

function partValue(p) {
  const k = p.coef === '' || p.coef === '-' ? (p.coef === '-' ? -1 : 1) : Number(p.coef);
  if (p.rad === null) return /\d/.test(p.coef) ? k : NaN;
  if (p.rad === '') return NaN;
  return k * Math.sqrt(Number(p.rad));
}

function currentValue() {
  if (!session) return NaN;
  if (session.mode === 'text') return session.buffer;   // teks: nilainya string
  if (session.mode === 'letter') return NaN;            // variabel tidak punya nilai numerik
  // Nilai desimal di sini HANYA untuk pemeriksa toleransi. Yang ditampilkan
  // ke siswa — dan diperiksa eksak oleh simulasi — tetap teks displayValue().
  const top = partValue(session.num);
  const bottom = session.den && partComplete(session.den) ? partValue(session.den) : 1;
  const v = top / bottom;
  return Number.isFinite(v) ? v : NaN;
}

function commit() {
  if (!session) return;
  // Ditandai lebih dulu: `close()` memakai penanda ini untuk memastikan
  // satu penutupan tidak pernah mengirim dua kali.
  session.committed = true;
  if (typeof session.onCommit !== 'function') return;
  session.onCommit(currentValue(), displayValue());
}

/**
 * Apakah ada yang PANTAS disimpan otomatis?
 *
 * Dua penjagaan, dan keduanya perlu:
 *   · isian kosong tidak pernah dikirim — ia akan menimpa nilai lama
 *     dengan kekosongan;
 *   · isian yang TIDAK BERUBAH juga tidak dikirim — beberapa pemakai
 *     menilai jawaban tepat saat `onCommit`, dan membuka pad lalu
 *     menutupnya tanpa mengetik apa pun tidak boleh dihitung sebagai
 *     jawaban yang keliru.
 */
function layakDisimpanOtomatis() {
  if (!session || session.committed) return false;
  const tampil = displayValue();
  if (tampil === '' || tampil == null) return false;
  return String(tampil) !== String(session.initialDisplay || '');
}

/**
 * Posisikan pad di dekat field pemicu (popover di desktop).
 * Di mobile, CSS mengambil alih dan menjadikannya bottom-sheet.
 */
/**
 * Beri tahu CSS di tepi mana papan berada, supaya toast menyingkir ke tepi
 * SEBERANGNYA.
 *
 * Terukur saat pertama dijalankan: toast galat "Namamu belum diisi" muncul
 * di dasar layar — persis di atas deret Z–M dan tombol "Selesai" papan
 * huruf. Toast berada di lapisan z-index tertinggi dan bisa diketuk, jadi
 * ketukan siswa pada tombol di bawahnya justru menutup toast. Papan terasa
 * "tidak merespons" tepat ketika siswa sedang diminta mengisinya.
 */
function markPadEdge() {
  if (!padEl) return;
  const r = padEl.getBoundingClientRect();
  const edge = (r.top + r.height / 2) > window.innerHeight / 2 ? 'bottom' : 'top';
  document.documentElement.dataset.mathpad = edge;
}

function position(anchor) {
  if (window.innerWidth <= 768) {
    // Bottom-sheet: CSS menempelkannya ke dasar layar.
    const opened = session;
    requestAnimationFrame(() => { if (session === opened) markPadEdge(); });
    return;
  }

  const rect = anchor.getBoundingClientRect();
  const padRect = padEl.getBoundingClientRect();
  const gap = 10;
  const margin = 12;
  const vh = window.innerHeight;

  let top = rect.bottom + gap;
  let origin = 'top center';

  // 1) Coba di bawah field. 2) Kalau tidak muat, balik ke atas field.
  if (top + padRect.height > vh - margin) {
    const above = rect.top - padRect.height - gap;
    if (above >= margin) {
      top = above;
      origin = 'bottom center';
    } else {
      // 3) Tidak muat di atas MAUPUN di bawah (kasus mode pecahan pada layar
      //    pendek): tempelkan ke tepi bawah layar. Tinggi pad dibatasi lewat
      //    CSS max-height sehingga isinya bisa di-scroll, bukan terpotong.
      top = Math.max(margin, vh - padRect.height - margin);
      origin = 'center center';
    }
  }
  top = Math.max(margin, top);

  let left = rect.left + rect.width / 2 - padRect.width / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - padRect.width - 12));

  padEl.style.top = `${top}px`;
  padEl.style.left = `${left}px`;
  padEl.style.setProperty('--mp-origin', origin);
  markPadEdge();
}

/** Isian awal "2√5/3", "1/√5", "-3", "2.5" → bagian pembilang & penyebut. */
function parseInitial(text) {
  const m = /^(-?\d*(?:\.\d*)?)(?:√(\d*))?(?:\/(\d*)(?:√(\d*))?)?$/.exec(text);
  if (!m || text === '') return { num: emptyPart(), den: null };
  const num = { coef: m[1] || '', rad: m[2] === undefined ? null : m[2] };
  const hasDen = text.includes('/');
  const den = hasDen ? { coef: m[3] || '', rad: m[4] === undefined ? null : m[4] } : null;
  return { num, den };
}

/**
 * Buka papan untuk sebuah field.
 * @param {HTMLElement} field  Elemen input/target (akan dibuat readonly).
 * @param {object} options     { initial, mode, allowFraction, allowSurd, allowLetter, onInput, onCommit, onClose }
 *   allowFraction === false → tuts a/b diredupkan (bilangan bulat saja)
 *   allowSurd               → tuts √ aktif (bentuk akar eksak)
 */
export function openMathpad(field, options = {}) {
  build();

  // Sesi lama yang masih terbuka ditutup DENGAN MENYIMPAN lebih dulu. Tanpa
  // ini, membuka kotak kedua (mis. lewat keyboard) menimpa `session` begitu
  // saja: pendengar keydown terpasang dua kali dan angka di kotak pertama
  // hilang tanpa pernah dikirim.
  if (session) close({ simpan: true });

  const initial = options.initial != null ? String(options.initial) : '';
  const isLetter = /^[A-Za-z]$/.test(initial);
  const hasRoot = initial.includes('√');

  // Mode teks dipilih eksplisit lewat opsi; ia tidak pernah ditebak dari isi
  // awal, karena nama seperti "7" pun harus tetap dianggap teks.
  const textMode = options.mode === 'text';
  const parsed = parseInitial(textMode || isLetter ? '' : initial);

  session = {
    field,
    abcUpper: true,
    buffer: textMode || isLetter ? initial : '',
    num: parsed.num,
    den: parsed.den,
    part: parsed.den ? 'den' : 'num',
    allow: {
      frac: options.allowFraction !== false,
      root: Boolean(options.allowSurd) || hasRoot,
    },
    mode: textMode ? 'text' : (isLetter ? 'letter' : 'number'),
    committed: false,
    // Pembanding untuk auto-simpan: hanya yang BERUBAH yang dikirim.
    initialDisplay: initial,
    onInput: options.onInput,
    onCommit: options.onCommit,
    onClose: options.onClose,
  };

  // Papan teks memakai kerangka yang sama tapi tampilan berbeda total, jadi
  // ia ditandai dengan kelas agar CSS bisa menyembunyikan tombol angka.
  padEl.classList.toggle('mathpad--text', textMode);
  padEl.setAttribute('aria-label', textMode ? 'Papan huruf' : 'Papan angka');

  if (textMode) toggleAbcCase(), toggleAbcCase();   // pulihkan huruf besar

  // Pemilih Angka/Variabel hanya tampil bila konteksnya menerima variabel.
  padEl.querySelector('[data-role="mode"]').hidden = !options.allowLetter;

  setMode(session.mode);

  scrimEl.classList.remove('hidden');
  padEl.dataset.open = 'true';
  if (field) field.dataset.active = 'true';

  position(field);
  sync();

  document.addEventListener('keydown', onGlobalKey);
  window.addEventListener('resize', onReposition);
}

function onReposition() {
  if (session && session.field) position(session.field);
}

/**
 * Keyboard fisik tetap didukung sebagai jalur alternatif (aksesibilitas).
 * Yang dilarang adalah keyboard VIRTUAL bawaan OS yang merusak tata letak.
 */
/**
 * Kenali tombol kendali lewat TIGA sumber, bukan `event.key` saja.
 *
 * Sebagian keyboard Android dan driver lama melaporkan `event.key` sebagai
 * `"Unidentified"` sambil tetap mengisi `code` atau `keyCode`. Kalau hanya
 * `key` yang diperiksa, papan tidak pernah bisa ditutup dengan Enter di
 * perangkat itu — dan siswa tidak tahu kenapa. `code` dan `keyCode`
 * menutup celah itu tanpa mengubah perilaku di perangkat yang normal.
 */
function keyIs(event, name) {
  const CODES = {
    Enter: { codes: ['Enter', 'NumpadEnter'], keyCode: 13 },
    Escape: { codes: ['Escape'], keyCode: 27 },
    Backspace: { codes: ['Backspace'], keyCode: 8 },
  };
  const spec = CODES[name];
  return event.key === name
    || (spec && spec.codes.includes(event.code))
    || (spec && event.keyCode === spec.keyCode);
}

function onGlobalKey(event) {
  if (!session) return;

  // Mode teks: keyboard fisik diteruskan apa adanya (jalur aksesibilitas).
  // Yang dilarang tetap keyboard VIRTUAL bawaan OS, bukan papan fisik.
  if (session.mode === 'text' && event.key && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    typeText(event.key);
    return;
  }

  if (keyIs(event, 'Escape')) {
    event.preventDefault();
    // Escape adalah SATU-SATUNYA gestur yang benar-benar membatalkan.
    close({ batal: true });
    return;
  }
  if (keyIs(event, 'Enter')) {
    event.preventDefault();
    commit();
    close();
    return;
  }
  if (keyIs(event, 'Backspace')) {
    event.preventDefault();
    if (session.mode === 'text') {
      session.buffer = session.buffer.slice(0, -1);
      sync();
      return;
    }
    handleKey({ key: 'backspace' });
    return;
  }
  if (session.mode === 'letter' && /^[A-Za-z]$/.test(event.key)) {
    event.preventDefault();
    setLetter(event.key);
    return;
  }
  if (/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    handleKey({ value: event.key });
    return;
  }
  // Keyboard fisik: "/" = pecahan, "r" = akar, "." atau "," = koma, "-" = tanda.
  const map = { '/': 'frac', r: 'root', R: 'root', '-': 'sign' };
  if (map[event.key]) {
    event.preventDefault();
    handleKey({ key: map[event.key] });
    return;
  }
  if (event.key === '.' || event.key === ',') {
    event.preventDefault();
    handleKey({ value: '.' });
  }
}

/**
 * Tutup pad dari luar — dipakai `mountScreen()` saat layar berganti.
 *
 * Bawaannya MENYIMPAN: pindah layar sambil membawa angka yang sudah
 * diketik jauh lebih masuk akal daripada membuangnya diam-diam. Pad
 * sendiri hidup di `document.body`, jadi tanpa pemanggilan ini ia akan
 * tetap mengambang di atas layar yang baru.
 */
export function closeMathpad(cancelled = false) {
  close(cancelled ? { batal: true } : { simpan: true });
}

/**
 * Tutup pad.
 *
 * @param {object} opt
 *   simpan — kirim dulu apa yang sudah diketik lewat `onCommit`
 *            (klik di luar, atau pindah layar)
 *   batal  — siswa memang membatalkan (Escape); tidak ada yang disimpan
 *
 * Menerima `true` juga demi pemanggil lama, dan itu berarti BATAL.
 */
function close(opt = {}) {
  if (!padEl) return;

  const { simpan = false, batal = false } = (opt === true ? { batal: true } : opt);

  // Simpan SEBELUM sesinya dilepas — `currentValue()` membaca dari sesi itu.
  if (simpan && layakDisimpanOtomatis()) commit();

  /**
   * Membatalkan berarti KOTAKNYA ikut kembali seperti semula.
   *
   * `sync()` menulis tiap ketukan langsung ke field sebagai pratinjau
   * berjalan. Tanpa pemulihan ini, menekan Escape meninggalkan angka yang
   * terlihat di kotak padahal tidak pernah tersimpan — layar mengatakan
   * "99" sementara ujiannya mencatat soal itu masih kosong. Kotak yang
   * berbohong lebih berbahaya daripada kotak yang kosong.
   */
  if (batal && session && session.field) {
    session.field.value = session.initialDisplay || '';
  }

  document.removeEventListener('keydown', onGlobalKey);
  window.removeEventListener('resize', onReposition);

  padEl.dataset.open = 'false';
  scrimEl.classList.add('hidden');
  delete document.documentElement.dataset.mathpad;

  if (session) {
    if (session.field) delete session.field.dataset.active;
    if (typeof session.onClose === 'function') session.onClose(batal, currentValue(), displayValue());
  }
  session = null;
}

export function isMathpadOpen() {
  return Boolean(session);
}

/**
 * Siapkan sebuah <input> agar HANYA bisa diisi lewat Mathpad.
 * Inilah pintu gerbang yang mencegah keyboard OS muncul.
 */
const attached = new WeakMap();

export function attachMathpad(input, options = {}) {
  /**
   * Pemasangan ULANG hanya memperbarui opsinya.
   *
   * Layar yang merender ulang soal bisa memanggil fungsi ini dua kali pada
   * elemen yang sama. Tanpa penjaga ini, setiap pemanggilan menambah satu
   * pendengar `pointerdown` lagi — satu ketukan membuka papan dua kali, dan
   * `onCommit` terkirim ganda sehingga jawaban dinilai dua kali.
   */
  if (attached.has(input)) {
    attached.set(input, options);
    return input;
  }
  attached.set(input, options);

  input.readOnly = true;                    // keyboard virtual tidak muncul
  input.setAttribute('inputmode', 'none');  // sinyal eksplisit ke browser mobile
  input.setAttribute('autocomplete', 'off');

  // Isian teks punya gayanya sendiri (.login__input) — memaksakan .numfield
  // di sana akan membuatnya tampil seperti kotak angka kecil.
  if (options.mode !== 'text') input.classList.add('numfield');

  const open = (event) => {
    event.preventDefault();
    // Field yang dimatikan (soal sudah dinilai, pilihan dikunci) tidak boleh
    // membuka papan — kalau tidak, jawaban yang sudah dikunci bisa diubah.
    if (input.disabled) return;
    const opts = attached.get(input) || {};
    // Cegah field mendapat fokus keyboard yang bisa memicu IME di sebagian browser.
    input.blur();
    input.dataset.padOpen = 'true';
    openMathpad(input, {
      ...opts,
      initial: input.value,
      onCommit: (value, display) => {
        input.value = display;
        if (typeof opts.onCommit === 'function') opts.onCommit(value, display, input);
      },
      onClose: () => {
        delete input.dataset.padOpen;
        if (typeof opts.onClose === 'function') opts.onClose();
      },
    });
  };

  input.addEventListener('pointerdown', open);
  input.addEventListener('keydown', (event) => {
    // Buka pad lewat keyboard demi aksesibilitas.
    if (event.key === 'Enter' || event.key === ' ') open(event);
  });

  return input;
}

export default { openMathpad, closeMathpad, attachMathpad, isMathpadOpen };
