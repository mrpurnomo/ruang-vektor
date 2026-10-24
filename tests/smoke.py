# -*- coding: utf-8 -*-
"""
tests/smoke.py — Uji asap end-to-end Ruang Vektor dengan Playwright.

Satu perintah untuk memeriksa aplikasi SEUTUHNYA di peramban sungguhan:

   1. Boot bersih: nol galat konsol, nol permintaan ke luar origin, nol dialog native.
   2. Penjaga identitas: tanpa identitas setiap rute berujung di #/login;
      isian teks layar masuk tunduk pada mathpad (keyboard OS diblokir).
   3. Semua rute utama & rute tak dikenal tergambar tanpa galat.
   4. 25 sub-topik: Materi → Simulasi terpasang, KaTeX tanpa galat render.
   5. Identitas visual "Instrumen Teknik": font Barlow / Barlow Condensed /
      JetBrains Mono (tanpa Montserrat/Roboto warisan), token palet, urutan @layer.
   6. Lanskap 740×360 · 1024×600 · 1440×900: viewport terkunci, nol luapan,
      rasio Sidebar 22–31%; potret memunculkan pengunci rotasi.
   7. Mathpad: readonly + inputmode=none, Escape = BATAL & dipulihkan,
      klik di luar = SIMPAN.
   8. Mini Kuis: `QuizEngine.REVEAL_AFTER = 3` — kunci & pembahasan TIDAK tampil
      pada salah ke-1 dan ke-2, baru tampil pada salah ke-3.
   9. Penjaga keluar ujian: tombol rumah & hash manual ditahan modal kustom.
  10. Papan coret: tombol, 4 pena = token palet, kontras goresan ≥ 4,5:1 (piksel).
  11. Konfeti: warna = token palet, host dibersihkan.
  12. Suite peramban: tests/plane.html 32/32 dan tests/sims.html 26/26.

Area sentuh (6b) diukur EFEKTIF: tombol boleh tampil lebih kecil dari 44px,
tetapi kotak 44×44 di sekelilingnya harus seluruhnya mengenai tombol itu
(lihat `--hit-min` di css/tokens.css). Ini GAGAL, bukan catatan.

Jalankan:
    python tests/smoke.py            # server sudah hidup di :5173
    python tests/smoke.py --serve    # nyalakan tests/serve.py sendiri
    python tests/smoke.py --skip-suites   # lewati suite plane/sims (±60 detik)
"""

import argparse
import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

# Konsol Windows default-nya cp1252 dan akan meledak pada karakter seperti "→".
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Playwright belum terpasang. Jalankan:  pip install playwright && playwright install chromium")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
PORT = 5173
BASE = f"http://localhost:{PORT}"
IDENTITY = {"nama": "Uji Asap", "sekolah": "SMAS YPVDP Bontang"}

EXPECTED_SUBTOPICS = 25
EXPECTED_PLANE_TESTS = 33
EXPECTED_SIM_TESTS = 26
VIEWPORTS = [(740, 360), (1024, 600), (1440, 900)]
SIDEBAR_RATIO = (22.0, 31.0)
PEN_TOKENS = [["Grafit", "--graphite"], ["Kobalt", "--royal"], ["Amber", "--accent-amber"], ["Beri", "--magenta"]]
CONFETTI_TOKENS = ["--royal", "--yellow", "--cyan", "--magenta", "--success"]
LAYER_ORDER = "@layer reset, tokens, layout, components, domain, workspace, utilities, overrides;"

results = []
notes = []


def record(name, ok, detail=""):
    results.append((name, ok, detail))
    line = f"  [{'LOLOS' if ok else 'GAGAL'}] {name}"
    if detail and not ok:
        line += f"\n          → {detail}"
    print(line)
    return ok


def note(name, detail):
    notes.append((name, detail))
    print(f"  [CATATAN] {name}\n          → {detail}")


def load_manifest():
    lessons = json.loads((ROOT / "data" / "lessons.json").read_text(encoding="utf-8"))
    chapters = []
    for c in lessons["chapters"]:
        chapters.append((c["id"], c["subtopicOrder"]))
    return chapters


# ============================================================
# Perkakas halaman
# ============================================================

NATIVE_DIALOG_SPY = """
    window.__nativeDialogCalls = [];
    ['alert', 'confirm', 'prompt'].forEach(function (fn) {
        window[fn] = function () {
            window.__nativeDialogCalls.push(fn);
            return fn === 'confirm' ? false : null;
        };
    });
"""


def wait_ready(page):
    page.wait_for_selector("[data-app-ready='true']", timeout=10000)


def reset_storage(page, identity=True):
    """Kosongkan PENCAPAIAN, POSISI, dan identitas; pasang identitas uji bila diminta."""
    page.evaluate(
        """(identity) => {
            try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
            if (identity) localStorage.setItem('vektorLab.identity.v1', JSON.stringify(identity));
        }""",
        IDENTITY if identity else None,
    )


def open_route(page, route, settle=900):
    """
    Buka rute dari muat ulang penuh: navigasi hash tidak memuat ulang modul.

    `net::ERR_NETWORK_CHANGED` dicoba ulang: di Windows, adaptor jaringan yang
    berganti status membuat Chromium membatalkan pemuatan — bahkan ke
    localhost — dan modul yang batal dimuat membuat aplikasi tidak pernah
    `data-app-ready`. Terukur sebagai satu-satunya penyebab timeout acak.
    """
    for attempt in range(3):
        try:
            page.goto(f"{BASE}/{route}")
            page.reload()
            wait_ready(page)
            break
        except Exception as err:
            if attempt == 2:
                raise
            print(f"  [ULANG] {route}: {str(err).splitlines()[0][:90]}")
            page.wait_for_timeout(1500)
    page.wait_for_timeout(settle)


def fresh_position(page):
    """Buang ingatan POSISI saja (sessionState), pencapaian & identitas tetap."""
    page.evaluate("() => { try { sessionStorage.clear(); } catch (e) {} }")


def open_mini_quiz(page, chapter_id, subtopic_id):
    """
    Mendarat langsung di Mini Kuis lewat ingatan POSISI sesi — jalur resmi
    aplikasi untuk siswa yang sudah menuntaskan simulasi. Tombol "Lewati
    Simulasi" sengaja baru muncul sesudah 30 detik, jadi uji tidak memakainya.
    """
    fresh_position(page)
    page.evaluate(
        """async ([c, s]) => {
            const m = await import('/js/core/state/sessionState.js');
            // Tahap 0 = Simulasi, tahap 1 = Mini Kuis (Materi kini Rangkuman).
            m.patchResume(m.lessonKey(c, s), { step: 1, simulationDone: true });
        }""",
        [chapter_id, subtopic_id],
    )
    open_route(page, f"#/belajar/{chapter_id}/{subtopic_id}", settle=900)


def click_text(page, text, timeout=4000):
    page.locator(f"button:has-text('{text}')").first.click(timeout=timeout)


LAYOUT_PROBE = """() => {
    const W = innerWidth, H = innerHeight;
    const html = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    const overflow = [];
    document.querySelectorAll('#app *').forEach((e) => {
        if (!e.offsetParent) return;
        const r = e.getBoundingClientRect();
        if (!r.width || (r.right <= W + 1 && r.bottom <= H + 1 && r.left >= -1)) return;
        // Luapan di dalam wadah gulir/terpotong bukan luapan layar.
        for (let p = e.parentElement; p; p = p.parentElement) {
            if (getComputedStyle(p).overflow !== 'visible') return;
        }
        overflow.push(`${e.className} → ${Math.round(r.right)}×${Math.round(r.bottom)}`);
    });
    const side = document.querySelector('.ws-side');
    return {
        htmlPos: html.position, bodyPos: body.position, htmlOverflow: html.overflow,
        scrollX: document.scrollingElement.scrollWidth > W + 1,
        scrollY: document.scrollingElement.scrollHeight > H + 1,
        overflow: overflow.slice(0, 6),
        sideRatio: side ? +(side.getBoundingClientRect().width / W * 100).toFixed(1) : null,
    };
}"""

# Area sentuh EFEKTIF, bukan ukuran kotak: jejak jari berdiameter minimal 44px
# (elips seukuran max(44, lebar) × max(44, tinggi)) yang berpusat di elemen
# disampel dengan elementFromPoint, dan SETIAP titik harus mengenai elemen itu
# sendiri. Area yang terpotong wadah `overflow`, tertutup tetangga, atau saling
# tumpuk dengan target lain ikut gagal. Titik di luar layar diabaikan: tepi
# layar tidak bisa dilewati jari. `scope` membatasi penilaian ke lapisan yang
# sedang aktif (papan angka, modal) — tombol di bawah scrim memang tidak bisa diketuk.
HIT_TARGET_PROBE = """(scope) => {
    const HIT = 44;
    const SEL = 'button, a[href], input, select, textarea, [role="button"], [role="checkbox"], '
              + '[role="radio"], [role="tab"], [role="switch"], [tabindex="0"]';
    const name = (e) => String(e.className && (e.className.baseVal ?? e.className) || e.tagName)
        .split(' ').filter(Boolean).slice(0, 2).join('.');
    const owns = (e, node) => node && (node === e || e.contains(node));
    const fails = [];
    let checked = 0;
    for (const e of document.querySelectorAll(SEL)) {
        if (scope && !e.closest(scope)) continue;
        if (e.closest('[hidden], [aria-hidden="true"], .hidden')) continue;
        const cs = getComputedStyle(e);
        if (cs.visibility === 'hidden' || cs.pointerEvents === 'none' || cs.display === 'none') continue;
        if (!e.getBoundingClientRect().width || !e.getBoundingClientRect().height) continue;
        // `center`, bukan `nearest`: `nearest` menempelkan elemen tepat di tepi
        // wadah gulir, padahal siswa bisa menggulir lebih jauh.
        e.scrollIntoView({ block: 'center', inline: 'center' });
        const r = e.getBoundingClientRect();
        // Bagian yang benar-benar terlihat: dipotong setiap leluhur ber-overflow.
        let vis = { l: Math.max(0, r.left), t: Math.max(0, r.top), r: Math.min(innerWidth, r.right), b: Math.min(innerHeight, r.bottom) };
        for (let p = e.parentElement; p; p = p.parentElement) {
            if (getComputedStyle(p).overflow === 'visible') continue;
            const q = p.getBoundingClientRect();
            vis = { l: Math.max(vis.l, q.left), t: Math.max(vis.t, q.top), r: Math.min(vis.r, q.right), b: Math.min(vis.b, q.bottom) };
        }
        if (vis.r - vis.l < 4 || vis.b - vis.t < 4) continue;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const top = document.elementFromPoint((vis.l + vis.r) / 2, (vis.t + vis.b) / 2);
        const owner = top && top.closest(SEL);
        // Tertutup lapisan non-interaktif (scrim, modal, papan coret): tidak bisa
        // diketuk saat ini, dinilai di keadaan lain.
        if (!owns(e, top) && !owner) continue;
        // Setiap target — besar maupun kecil — tidak boleh DICURI area sentuh
        // tetangganya: titik di bagian terlihatnya sendiri harus mengenai dirinya.
        let stolen = null;
        for (let i = 1; i < 4 && !stolen; i++) for (let j = 1; j < 4 && !stolen; j++) {
            const hit = document.elementFromPoint(vis.l + (vis.r - vis.l) * i / 4, vis.t + (vis.b - vis.t) * j / 4);
            const thief = hit && hit.closest(SEL);
            if (thief && thief !== e && !e.contains(thief) && !thief.contains(e)) stolen = thief;
        }
        // Lapisan overlay yang SENGAJA menutupi panggung (papan coret, papan
        // angka, modal): target di bawahnya memang tidak untuk diketuk saat itu.
        const OVERLAY = '.pad, .mathpad, .modal-scrim';
        if (stolen && stolen.closest(OVERLAY) && !e.closest(OVERLAY)) continue;
        if (stolen) {
            fails.push({ target: name(e), size: `${Math.round(r.width)}×${Math.round(r.height)}`, miss: 1, hits: ['dicuri ' + name(stolen)] });
            continue;
        }
        if (r.width >= HIT && r.height >= HIT) continue;
        checked++;
        const w = Math.max(HIT, r.width), h = Math.max(HIT, r.height);
        const misses = [];
        for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
            const u = -1 + 2 * i / 6, v = -1 + 2 * j / 6;
            if (u * u + v * v > 1) continue;
            const x = cx + u * (w / 2 - 1), y = cy + v * (h / 2 - 1);
            if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
            const hit = document.elementFromPoint(x, y);
            if (!owns(e, hit)) misses.push(hit ? name(hit.closest(SEL) || hit) : 'luar-layar');
        }
        if (misses.length) fails.push({ target: name(e), size: `${Math.round(r.width)}×${Math.round(r.height)}`,
                                        miss: misses.length, hits: [...new Set(misses)].slice(0, 3) });
    }
    const seen = new Set();
    return { checked, fails: fails.filter((f) => { const k = f.target + f.size; if (seen.has(k)) return false; seen.add(k); return true; }) };
}"""


# ============================================================
# Bagian uji
# ============================================================

def section_boot(page, errors, requests):
    print("\n1. Boot bersih & offline")
    errors.clear()
    requests.clear()
    page.goto(f"{BASE}/")
    reset_storage(page, identity=False)
    open_route(page, "#/")
    record("Boot tanpa galat konsol", not errors, "; ".join(errors[:3]))
    outside = [u for u in requests if not u.startswith(BASE) and not u.startswith("data:")]
    record(f"Nol permintaan ke luar origin ({len(requests)} permintaan)", not outside, "; ".join(outside[:3]))
    record("data-theme=light terpasang", page.evaluate("() => document.documentElement.dataset.theme") == "light")
    record("Permukaan uji window.__vektorLab ada",
           page.evaluate("() => !!(window.__vektorLab && window.__vektorLab.router)"))


def section_identity(page, errors):
    print("\n2. Penjaga identitas & layar masuk")
    for route in ["#/", "#/belajar", "#/belajar/01_konsep_dasar/pengertian_notasi", "#/tka", "#/kuis"]:
        open_route(page, route, settle=500)
        record(f"Tanpa identitas {route} → #/login", page.evaluate("() => location.hash") == "#/login",
               page.evaluate("() => location.hash"))
    fields = page.evaluate("""() => [...document.querySelectorAll('.login input')].map((i) => ({
        readOnly: i.readOnly, inputmode: i.getAttribute('inputmode'), autocomplete: i.getAttribute('autocomplete') }))""")
    record("Layar masuk punya isian", len(fields) >= 2, json.dumps(fields))
    record("Isian layar masuk readonly + inputmode=none + autocomplete=off",
           all(f["readOnly"] and f["inputmode"] == "none" and f["autocomplete"] == "off" for f in fields), json.dumps(fields))
    reset_storage(page)
    open_route(page, "#/login", settle=500)
    record("Identitas tersimpan → keluar dari layar masuk diizinkan", page.evaluate("() => { location.hash = '#/'; return true; }"))
    page.wait_for_timeout(500)
    record("Menu utama menyapa siswa", "Uji" in (page.text_content(".menu__title") or ""), page.text_content(".menu__title") or "")


def section_routes(page, errors, chapters):
    print("\n3. Rute utama")
    routes = [("#/", ".menu"), ("#/belajar", None), ("#/tka", None), ("#/kuis", None)]
    routes += [(f"#/belajar/{cid}", None) for cid, _ in chapters]
    for route, selector in routes:
        errors.clear()
        fresh_position(page)
        open_route(page, route, settle=600)
        ok = not errors and page.evaluate("() => document.querySelector('#screen-host').children.length > 0")
        if selector:
            ok = ok and page.query_selector(selector) is not None
        record(f"Rute {route}", ok, "; ".join(errors[:2]) or "layar kosong")
    errors.clear()
    open_route(page, "#/tidak-ada", settle=500)
    record("Rute tak dikenal → layar 'tidak ditemukan'", page.query_selector(".empty-state") is not None and not errors,
           "; ".join(errors[:2]))


def section_subtopics(page, errors, chapters):
    print("\n4. 25 sub-topik: mendarat langsung di Simulasi")
    count = 0
    for cid, order in chapters:
        for sid in order:
            count += 1
            errors.clear()
            fresh_position(page)
            open_route(page, f"#/belajar/{cid}/{sid}", settle=700)
            # Tidak ada lagi tahap Materi: simulasi terpasang begitu sub-topik dibuka.
            try:
                page.wait_for_selector(".sim-host .sim-board, .sim-host .sim", timeout=5000)
                mounted = True
            except Exception:
                mounted = False
            page.wait_for_timeout(300)
            katex_err = page.evaluate("() => document.querySelectorAll('.katex-error').length")
            guide = page.evaluate("() => { const g = document.querySelector('.sim-guide__text'); return g ? g.textContent.trim().length : 0; }")
            # Teks bermarkdown/LaTeX yang lupa lewat renderMixed() tampil mentah
            # ke siswa ("**Inilah vektor.**", "\vec{a}") — terukur pernah terjadi.
            mentah = page.evaluate("""() => {
                const host = document.querySelector('#screen-host');
                if (!host) return ['layar kosong'];
                // KaTeX menyimpan sumber LaTeX-nya di <annotation> MathML — itu
                // tidak terlihat siswa, jadi ia dibuang dulu sebelum diperiksa.
                const copy = host.cloneNode(true);
                copy.querySelectorAll('.katex-mathml, annotation').forEach((n) => n.remove());
                const t = copy.textContent || '';
                const bad = [];
                if (t.includes('**')) bad.push('markdown **');
                // Dua kali 92: di dalam string RegExp, garis miring literal ditulis ganda.
                const latex = new RegExp(String.fromCharCode(92, 92) + '(vec|begin|frac|sqrt|hat|overrightarrow)');
                if (latex.test(t)) bad.push('LaTeX mentah');
                return bad;
            }""")
            ok = mounted and not errors and katex_err == 0 and guide > 0 and not mentah
            record(f"{cid}/{sid}", ok,
                   f"simulasi={mounted} panduan={guide} katex-error={katex_err} mentah={mentah} galat={'; '.join(errors[:2])}")
    record(f"{EXPECTED_SUBTOPICS} sub-topik terjelajahi", count == EXPECTED_SUBTOPICS, f"ada {count}")

    # Materi teks tetap ada sebagai Rangkuman opsional, bukan layar pertama.
    errors.clear()
    fresh_position(page)
    open_route(page, "#/belajar/01_konsep_dasar/pengertian_notasi", settle=700)
    record("Sub-topik dibuka langsung di Simulasi, bukan Materi",
           page.query_selector(".sim-host") is not None and page.query_selector(".materi") is None)
    click_text(page, "Rangkuman")
    page.wait_for_timeout(500)
    record("Tombol Rangkuman membuka materi teks", page.query_selector(".materi") is not None)
    click_text(page, "Kembali ke Simulasi")
    page.wait_for_timeout(600)
    record("Kembali dari Rangkuman mendarat di Simulasi lagi",
           page.query_selector(".sim-host") is not None and page.query_selector(".materi") is None)
    record("Tanpa galat konsol selama Rangkuman", not errors, "; ".join(errors[:2]))


def section_visual(page):
    print("\n5. Identitas visual \"Instrumen Teknik\"")
    fresh_position(page)
    open_route(page, "#/", settle=700)
    fonts = page.evaluate("""async () => {
        await document.fonts.ready;
        const families = new Set();
        document.querySelectorAll('body *').forEach((e) => families.add(getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim()));
        return {
            barlow: document.fonts.check('16px "Barlow"'),
            condensed: document.fonts.check('700 16px "Barlow Condensed"'),
            mono: document.fonts.check('16px "JetBrains Mono"'),
            loaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')),
            families: [...families],
        };
    }""")
    loaded = set(fonts["loaded"])
    record("Font Barlow termuat", "Barlow" in loaded, str(sorted(loaded)))
    record("Font Barlow Condensed termuat", "Barlow Condensed" in loaded, str(sorted(loaded)))
    record("Font JetBrains Mono tersedia", fonts["mono"], str(sorted(loaded)))
    legacy = [f for f in fonts["families"] if f in ("Montserrat", "Roboto", "Inter")]
    record("Tidak ada font warisan (Montserrat/Roboto)", not legacy, str(legacy))

    tokens = page.evaluate("""() => { const cs = getComputedStyle(document.documentElement);
        const t = (n) => cs.getPropertyValue(n).trim().toUpperCase();
        return { graphite: t('--graphite'), royal: t('--royal'), yellow: t('--yellow'),
                 magenta: t('--magenta'), cyan: t('--cyan'), success: t('--success') }; }""")
    record("Token ARAH --royal = #2F3DE0", tokens["royal"] == "#2F3DE0", json.dumps(tokens))
    record("Token BESARAN --yellow = #FFB000", tokens["yellow"] == "#FFB000", json.dumps(tokens))
    record("Token --graphite = #0D1320", tokens["graphite"] == "#0D1320", json.dumps(tokens))

    first = (ROOT / "css" / "tokens.css").read_text(encoding="utf-8")
    layer_lines = [l.strip() for l in first.splitlines() if l.strip().startswith("@layer ") and l.strip().endswith(";")]
    record("Urutan @layer tunggal & mengikat", layer_lines == [LAYER_ORDER], str(layer_lines))
    others = [p.name for p in (ROOT / "css").glob("*.css")
              if p.name != "tokens.css" and any(l.strip().startswith("@layer ") and l.strip().endswith(";")
                                                for l in p.read_text(encoding="utf-8").splitlines())]
    record("Tidak ada deklarasi urutan @layer kedua", not others, str(others))
    empty_overrides = "@layer overrides {" not in "".join(p.read_text(encoding="utf-8") for p in (ROOT / "css").glob("*.css"))
    record("Lapisan overrides tetap kosong", empty_overrides)


def section_landscape(page, errors):
    print("\n6. Lanskap, nol luapan, Sidebar & Stage")
    for w, h in VIEWPORTS:
        page.set_viewport_size({"width": w, "height": h})
        for route, sim in [("#/", False), ("#/belajar/02_operasi_bangun_datar/operasi_komponen", True),
                           ("#/kuis/latihan_bab/01_konsep_dasar", False)]:
            errors.clear()
            fresh_position(page)
            open_route(page, route, settle=700)
            if sim:
                page.wait_for_timeout(900)
            m = page.evaluate(LAYOUT_PROBE)
            label = f"{w}×{h} {route}"
            record(f"{label}: viewport terkunci (fixed, tanpa gulir halaman)",
                   m["htmlPos"] == "fixed" and m["bodyPos"] == "fixed" and not m["scrollX"] and not m["scrollY"], json.dumps(m))
            record(f"{label}: nol luapan keluar layar", not m["overflow"], "; ".join(m["overflow"]))
            if route != "#/":
                lo, hi = SIDEBAR_RATIO
                record(f"{label}: rasio Sidebar {m['sideRatio']}%", m["sideRatio"] is not None and lo <= m["sideRatio"] <= hi,
                       f"di luar {lo}–{hi}%")
            # Kunjungan ujian ditinggalkan: lepaskan penjaga keluar untuk rute berikutnya.
            page.evaluate("() => { const v = window.__vektorLab.state.activeView; if (v && v.hasUnsavedWork) v.hasUnsavedWork = () => false; }")

    page.set_viewport_size({"width": 600, "height": 900})
    page.wait_for_timeout(400)
    portrait = page.evaluate("""() => {
        const hidden = (sel) => { const e = document.querySelector(sel); if (!e) return true;
            const cs = getComputedStyle(e); return cs.display === 'none' || cs.visibility === 'hidden'; };
        return { lock: !hidden('.rotate-lock'), app: hidden('#app'), fs: hidden('.fs-btn'), sound: hidden('[data-role="sound"]') };
    }""")
    record("Potret: pengunci rotasi tampil, #app & tombol layar penuh tersembunyi", all(portrait.values()), json.dumps(portrait))
    page.set_viewport_size({"width": 1024, "height": 600})


GUIDED_ROUTE = "#/belajar/01_konsep_dasar/pengertian_notasi"

# Kasus terpandu dimajukan lewat solveStep() — jalan maju resmi engine —
# supaya jejak, gambar konfirmasi, dan toast sukses benar-benar terbentuk.
SOLVE_GUIDED = """async () => {
    const sim = window.__vektorLab.state.activeView.simulation;
    const payloads = [[0, 0], [7, 4], {}, 'benar'];
    for (const p of payloads) await sim.solveStep(sim.currentStep, p);
    await new Promise((r) => setTimeout(r, 400));
    return sim.solved.has(0);
}"""


def section_guided_stage(page, errors):
    print("\n6c. Panggung simulasi terpandu di lanskap pendek 740×360")
    page.set_viewport_size({"width": 740, "height": 360})
    fresh_position(page)
    open_route(page, GUIDED_ROUTE, settle=900)
    record("Kasus terpandu tuntas lewat solveStep()", page.evaluate(SOLVE_GUIDED))
    trail = page.evaluate("""() => [...document.querySelectorAll('.sim-board__trail-item')]
        .map((li) => ({ t: li.innerText.slice(0, 30), sh: li.scrollHeight, ch: li.clientHeight }))""")
    squashed = [f"{i['t']!r} {i['ch']}<{i['sh']}" for i in trail if i["sh"] > i["ch"] + 1]
    record(f"Jejak langkah ({len(trail)} item) tidak tergencet: teks & mata panah \\vec utuh",
           len(trail) == 4 and not squashed, "; ".join(squashed) or f"{len(trail)} item")
    newest = page.evaluate("""() => { const t = document.querySelector('.sim-board__trail');
        const a = t.getBoundingClientRect(), b = t.lastElementChild.getBoundingClientRect();
        return { box: [Math.round(a.top), Math.round(a.bottom)], item: [Math.round(b.top), Math.round(b.bottom)] }; }""")
    record("Jejak yang bergulir menampilkan item TERBARU (hasil OA = a)",
           newest["item"][0] >= newest["box"][0] - 1 and newest["item"][1] <= newest["box"][1] + 1, json.dumps(newest))
    # Mata panah \vec KaTeX = SVG absolut di dalam .accent-body selebar 0.
    # Reset `svg { max-width: 100% }` pernah memangkasnya jadi 0px di SELURUH
    # aplikasi: "vektor OA" tampil tanpa tanda panahnya.
    accents = page.evaluate("""() => [...document.querySelectorAll('.katex-html .accent svg')]
        .map((s) => Math.round(s.getBoundingClientRect().width * 10) / 10)""")
    record(f"Mata panah \\vec terlihat ({len(accents)} aksen, lebar > 0)",
           bool(accents) and all(w > 2 for w in accents), str(accents[:8]))
    # Notasi baku: ruas berarah dua huruf = \overrightarrow, juga untuk teks
    # yang dirakit engine saat berjalan (sumber TeX terbaca di anotasi MathML).
    pairs = page.evaluate(r"""() => [...document.querySelectorAll('annotation')]
        .map((a) => a.textContent).filter((t) => /\\vec\{(?:[A-Z]'*){2,}\}/.test(t))""")
    record("Ruas berarah dua huruf dirender \\overrightarrow, bukan \\vec", not pairs, str(pairs[:3]))
    toasts = page.evaluate("""() => [...document.querySelectorAll('.toast')].map((t) => {
        const r = t.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; })""")
    record(f"Toast sukses utuh di dalam layar (lebar {page.viewport_size['width']})",
           bool(toasts) and all(l >= 0 and r <= page.viewport_size["width"] for l, r in toasts), str(toasts))
    # Lanskap pendek: toast ramping di KANAN BAWAH, tidak menutupi bidang,
    # dan hilang paling lambat 2,2 detik (keputusan pengguna 13 Okt 2026).
    over = page.evaluate("""() => {
        const p = document.querySelector('.plane-host').getBoundingClientRect();
        return [...document.querySelectorAll('.toast')].map((t) => { const r = t.getBoundingClientRect();
            return { box: [r.left, r.top, r.right, r.bottom].map(Math.round), h: Math.round(r.height),
                     hit: !(r.right <= p.left || p.right <= r.left || r.bottom <= p.top || p.bottom <= r.top) }; });
    }""")
    record("740×360: toast tidak menutupi bidang kartesius", bool(over) and not any(o["hit"] for o in over), json.dumps(over))
    page.wait_for_timeout(2600)
    left = page.evaluate("() => document.querySelectorAll('.toast').length")
    record("740×360: toast hilang paling lambat 2,2 detik", left == 0, f"masih {left} toast")
    # Kasus berikutnya harus bisa dicapai DARI PANGGUNG: tombol di sidebar
    # terukur berada di bawah lipatan panel kiri di 740×360.
    cta = page.evaluate("""() => {
        const body = document.querySelector('.ws-stage > .workspace__body').getBoundingClientRect();
        const go = document.querySelector('.sim-board__work [data-sim-action="next-case-stage"]');
        const chip = document.querySelector('.case-chip[data-next="true"]');
        if (!go) return { go: null };
        const r = go.getBoundingClientRect();
        return { go: [Math.round(r.top), Math.round(r.bottom)], view: [Math.round(body.top), Math.round(body.bottom)],
                 text: go.innerText, chip: chip ? chip.innerText : null, pulse: go.classList.contains('btn--pulse') };
    }""")
    record("Tombol 'Lanjut ke kasus berikutnya' ada di panggung dan terlihat",
           bool(cta.get("go")) and cta["go"][0] >= cta["view"][0] and cta["go"][1] <= cta["view"][1], json.dumps(cta, ensure_ascii=False))
    record("Chip kasus berikutnya ditandai berdenyut (data-next)", cta.get("chip") == "Titik B", json.dumps(cta, ensure_ascii=False))
    record("Tombol 'Lanjut ke Titik B' berdenyut (kompas mata siswa)", cta.get("pulse") is True, json.dumps(cta, ensure_ascii=False))
    # Tombol "Lewati Simulasi" muncul sesudah 30 detik; di lanskap pendek ia
    # pernah menjepit tombol utama jadi "L… KE M… K…".
    squeeze = page.evaluate("""() => {
        const bar = document.querySelector('.ws-side__actions .actionbar');
        const skip = document.createElement('button');
        skip.type = 'button'; skip.className = 'btn btn--quiet'; skip.innerHTML = '<span>Lewati Simulasi</span>';
        bar.insertBefore(skip, bar.querySelector('.actionbar__spacer'));
        const main = bar.querySelector('.btn--success');
        const r = main.getBoundingClientRect();
        const lines = Math.round(main.querySelector('span').getBoundingClientRect().height / parseFloat(getComputedStyle(main).lineHeight || 16));
        const out = { w: Math.round(r.width), h: Math.round(r.height), clipped: main.scrollWidth > main.clientWidth + 1 };
        skip.remove();
        return out;
    }""")
    record("Tombol utama sidebar tetap utuh saat 'Lewati Simulasi' muncul", squeeze["w"] >= 120 and not squeeze["clipped"] and squeeze["h"] <= 44,
           json.dumps(squeeze))
    # Perintah hidup di panggung justru karena mata siswa terkunci di sana:
    # menggulir lembar kerja ke bawah tidak boleh membuang perintahnya.
    stuck = page.evaluate("""() => {
        const body = document.querySelector('.ws-stage > .workspace__body');
        body.scrollTop = body.scrollHeight;
        const b = body.getBoundingClientRect();
        const g = document.querySelector('.sim-guide').getBoundingClientRect();
        const p = document.querySelector('.plane-host').getBoundingClientRect();
        return { scrolls: body.scrollHeight > body.clientHeight + 1, scrollTop: body.scrollTop,
                 guide: [Math.round(g.top), Math.round(g.bottom)], view: [Math.round(b.top), Math.round(b.bottom)],
                 plane: [Math.round(p.top), Math.round(p.bottom)] };
    }""")
    record("Panggung memang bergulir di 740×360 (uji berikut bermakna)", stuck["scrolls"], json.dumps(stuck))
    record("Perintah .sim-guide tetap terlihat utuh saat lembar kerja digulir ke dasar",
           stuck["guide"][0] >= stuck["view"][0] - 1 and stuck["guide"][1] <= stuck["view"][1] + 1, json.dumps(stuck))
    record("Bidang tidak tertutup perintah yang menempel", stuck["plane"][0] >= stuck["guide"][1], json.dumps(stuck))
    # Kasus berikutnya dibuka dari panggung yang masih tergulir ke dasar.
    page.evaluate("() => document.querySelector('[data-sim-action=\"next-case\"]').click()")
    page.wait_for_timeout(700)
    fresh = page.evaluate("""() => {
        const body = document.querySelector('.ws-stage > .workspace__body');
        const g = document.querySelector('.sim-guide').getBoundingClientRect();
        const d = document.querySelector('.sim-board__given').getBoundingClientRect();
        return { scrollTop: body.scrollTop, guideBottom: Math.round(g.bottom), given: [Math.round(d.top), Math.round(d.bottom)],
                 text: document.querySelector('.sim-board__given').innerText.slice(0, 40) };
    }""")
    record("Kasus baru dibuka dari atas panggung: data kasusnya tidak tertutup panduan",
           fresh["scrollTop"] == 0 and fresh["given"][0] >= fresh["guideBottom"], json.dumps(fresh, ensure_ascii=False))
    record("Tanpa galat konsol di panggung terpandu", not errors, "; ".join(errors[:2]))
    page.set_viewport_size({"width": 1024, "height": 600})


SOLVE_ALL_CASES = """async () => {
    const sim = window.__vektorLab.state.activeView.simulation;
    for (let i = 0; i < sim.cases.length; i += 1) {
        if (sim.solved.has(i)) continue;
        sim.goToCase(i);
        while (sim.currentStep && sim.caseIndex === i) await sim.solveStep(sim.currentStep, [0, 0]);
    }
    return sim.solved.size === sim.cases.length;
}"""

CELEBRATION = """() => {
    const m = document.querySelector('.modal--celebrate');
    if (!m) return null;
    const r = m.getBoundingClientRect(), b = m.querySelector('.modal__body');
    return { box: [Math.round(r.top), Math.round(r.bottom)], vh: innerHeight,
             bodyScrolls: b.scrollHeight > b.clientHeight + 1,
             badge: m.querySelector('.celebrate__badge').innerText,
             recap: m.querySelectorAll('.celebrate__recap li').length,
             stats: m.querySelector('.celebrate__stats').innerText,
             actions: [...m.querySelectorAll('.modal__actions .btn')].map((x) => x.innerText.trim()),
             toasts: document.querySelectorAll('.toast').length,
             focus: document.activeElement && document.activeElement.classList.contains('btn--primary') };
}"""


def section_celebration(page, errors):
    print("\n6f. Selebrasi simulasi tuntas + dua jalan (Rangkuman · Mini Kuis)")
    for (w, h), pick in [((740, 360), "Mulai Mini Kuis"), ((1024, 600), "Buka Rangkuman Konsep")]:
        page.set_viewport_size({"width": w, "height": h})
        fresh_position(page)
        open_route(page, GUIDED_ROUTE, settle=700)
        record(f"{w}×{h}: keempat kasus tuntas lewat solveStep()", page.evaluate(SOLVE_ALL_CASES))
        page.wait_for_timeout(1500)
        # Revisi guru: KESIMPULAN "vektor = nilai + arah" muncul lebih dulu.
        k = page.evaluate("""() => { const m = document.querySelector('.modal--conclusion');
            if (!m) return null; const r = m.getBoundingClientRect(), b = m.querySelector('.modal__body');
            return { box: [Math.round(r.top), Math.round(r.bottom)], vh: innerHeight, scrolls: b.scrollHeight > b.clientHeight + 1,
                     def: m.querySelector('.conclude__def').innerText.slice(0, 60), cols: m.querySelectorAll('.conclude__col li').length }; }""")
        record(f"{w}×{h}: pop-up kesimpulan muncul sebelum selebrasi (nilai + arah, contoh vektor & skalar)",
               bool(k) and "arah" in k["def"] and k["cols"] >= 4, json.dumps(k, ensure_ascii=False))
        if k:
            record(f"{w}×{h}: pop-up kesimpulan muat tanpa menggulir", k["box"][0] >= 0 and k["box"][1] <= k["vh"] and not k["scrolls"], json.dumps(k))
            page.locator(".modal--conclusion .modal__actions .btn--primary").click()
            page.wait_for_timeout(600)
        c = page.evaluate(CELEBRATION)
        record(f"{w}×{h}: modal selebrasi muncul", bool(c), json.dumps(c, ensure_ascii=False))
        if not c:
            continue
        record(f"{w}×{h}: lencana menyebut 4 kuadran yang dikuasai", "4 KUADRAN" in c["badge"].upper(), c["badge"])
        record(f"{w}×{h}: rekap 3 gagasan + statistik yang bisa ditelusuri", c["recap"] == 3 and "4 kasus" in c["stats"], json.dumps(c, ensure_ascii=False))
        record(f"{w}×{h}: modal muat di layar tanpa menggulir isinya",
               c["box"][0] >= 0 and c["box"][1] <= c["vh"] and not c["bodyScrolls"], json.dumps(c))
        record(f"{w}×{h}: dua aksi — Rangkuman & Mini Kuis",
               any("RANGKUMAN" in a.upper() for a in c["actions"]) and any("MINI KUIS" in a.upper() for a in c["actions"]), str(c["actions"]))
        record(f"{w}×{h}: toast dibersihkan, fokus di aksi utama Mini Kuis", c["toasts"] == 0 and c["focus"], json.dumps(c, ensure_ascii=False))
        page.locator(".modal__actions .btn", has_text=pick).click()
        page.wait_for_timeout(700)
        landed = page.evaluate("() => ({ quiz: !!document.querySelector('.quiz'), materi: !!document.querySelector('.materi-card'), modal: !!document.querySelector('.modal--celebrate') })")
        want = "quiz" if "Kuis" in pick else "materi"
        record(f"{w}×{h}: '{pick}' membawa siswa ke tujuannya", landed[want] and not landed["modal"], json.dumps(landed))
    # Kunjungan ulang simulasi yang sudah tuntas: TANPA selebrasi lagi.
    page.evaluate("() => { const v = window.__vektorLab.state.activeView; v.step = 0; v.renderStep(); }")
    page.wait_for_timeout(1600)
    record("Kunjungan ulang simulasi tuntas tidak memunculkan selebrasi lagi", page.evaluate(CELEBRATION) is None)
    # Revisi guru: kembali ke simulasi yang sudah tuntas TIDAK boleh langsung
    # mengulang kasus pertama — penutup "Simulasi tuntas" sampai Ulangi ditekan.
    cov = page.evaluate("""() => ({ cover: !!document.querySelector('.sim-complete'),
        boardHidden: getComputedStyle(document.querySelector('.sim-board')).visibility === 'hidden',
        actions: [...document.querySelectorAll('.sim-complete [data-sim-action]')].map((b) => b.dataset.simAction) })""")
    record("Kembali ke simulasi tuntas: penutup 'Simulasi tuntas', papan tidak terulang sendiri",
           cov["cover"] and cov["boardHidden"], json.dumps(cov))
    record("Penutup menyediakan Ulangi · Rangkuman · Mini Kuis",
           set(cov["actions"]) == {"restart", "review", "quiz"}, json.dumps(cov))
    page.click('.sim-complete [data-sim-action="restart"]')
    page.wait_for_timeout(500)
    rs = page.evaluate("""() => { const s = window.__vektorLab.state.activeView.simulation;
        return { cover: !!document.querySelector('.sim-complete'), solved: s.solved.size, step: s.stepIndex, case: s.caseIndex }; }""")
    record("Ulangi memulai simulasi dari kasus pertama", not rs["cover"] and rs["solved"] == 0 and rs["case"] == 0, json.dumps(rs))
    record("Tanpa galat konsol selama selebrasi", not errors, "; ".join(errors[:2]))
    page.set_viewport_size({"width": 1024, "height": 600})


def tap_quiz_plane(page, x, y):
    """Klik mouse SUNGGUHAN pada titik kisi (x, y) bidang soal — lewat garis kisinya."""
    # Seperti siswa: gulir bidangnya ke pandangan dulu (bilah aksi menempel di dasar).
    page.evaluate("() => document.querySelector('.quiz-plane svg.plane').scrollIntoView({ block: 'center' })")
    page.wait_for_timeout(120)
    xy = page.evaluate("""([x, y]) => {
        const svg = document.querySelector('.quiz-plane svg.plane');
        const lx = svg.querySelector(`line[data-axis="x"][data-value="${x}"]`);
        const ly = svg.querySelector(`line[data-axis="y"][data-value="${y}"]`);
        const pt = new DOMPoint(+lx.getAttribute('x1'), +ly.getAttribute('y1')).matrixTransform(svg.getScreenCTM());
        return [pt.x, pt.y];
    }""", [x, y])
    page.mouse.click(xy[0], xy[1])
    page.wait_for_timeout(200)


def last_toast(page):
    return page.evaluate("() => { const t = [...document.querySelectorAll('.toast')].pop(); return t ? t.innerText : ''; }")


SFX_SPY = """async () => { const m = await import('/js/core/ui/sfx.js'); window.__sfx = [];
    for (const k of ['select', 'correct', 'oops', 'fanfare']) { const f = m.default[k];
        m.default[k] = (...a) => { window.__sfx.push(k); return f(...a); }; } }"""


def burst_state(page):
    return page.evaluate("""() => { const b = document.querySelector('.burst');
        return b ? { ok: b.classList.contains('burst--ok'), title: b.innerText.trim() } : null; }""")


def section_quiz_plane(page, errors):
    print("\n6h. Mini Kuis sub-topik 1: soal ketuk-bidang (plane_tap)")
    page.set_viewport_size({"width": 1024, "height": 600})
    open_mini_quiz(page, "01_konsep_dasar", "pengertian_notasi")
    page.wait_for_timeout(400)
    page.evaluate(SFX_SPY)
    # Soal 1: pilihan salah dulu (opsi 1), lalu benar (frasa "ke arah timur").
    page.locator(".quiz .option").nth(0).click()
    record("Memilih opsi berbunyi (sfx.select)", page.evaluate("() => window.__sfx.includes('select')"), str(page.evaluate("() => window.__sfx")))
    page.locator(".quiz .actionbar .btn--primary").click()
    page.wait_for_timeout(250)
    b = burst_state(page)
    record("Jawaban salah: pop-up 'Belum tepat!' + bunyi oops + kartu bergetar",
           bool(b) and not b["ok"] and page.evaluate("() => window.__sfx.includes('oops') && !!document.querySelector('.quiz__card.is-no')"), json.dumps(b, ensure_ascii=False))
    page.wait_for_timeout(1000)
    record("Pop-up hilang sendiri dalam ±1 detik", burst_state(page) is None)
    page.locator(".quiz .actionbar button", has_text="Coba Lagi").click()
    page.wait_for_timeout(400)
    page.locator(".quiz .option").nth(2).click()
    page.locator(".quiz .actionbar .btn--primary").click()
    page.wait_for_timeout(250)
    b = burst_state(page)
    record("Jawaban benar: pop-up 'Tepat!' + bunyi meriah + kartu berdenyut",
           bool(b) and b["ok"] and page.evaluate("() => window.__sfx.includes('correct') && !!document.querySelector('.quiz__card.is-ok')"), json.dumps(b, ensure_ascii=False))
    page.wait_for_timeout(400)
    page.locator(".quiz .actionbar .btn--primary", has_text="Berikutnya").click()
    page.wait_for_timeout(500)
    # Petunjuk: ada di soal ini, tertutup, dan terbuka saat diketuk.
    page.locator(".quiz__hint-btn").click()
    page.wait_for_timeout(200)
    hint = page.evaluate("() => { const t = document.querySelector('.quiz__hint-text'); return t && !t.hidden ? t.innerText : null; }")
    record("Soal 2 punya Petunjuk yang terbuka saat diketuk", bool(hint) and "pangkal" in hint, str(hint)[:80])
    record("Soal 2 menampilkan bidang kartesius dengan panah PQ",
           page.evaluate("() => !!document.querySelector('.quiz-plane svg.plane .plane__arrow')"))
    # Salah KHAS: urutan terbalik (P lalu Q) = menggambar PQ lagi.
    tap_quiz_plane(page, -2, 1); tap_quiz_plane(page, 3, 3)
    page.locator(".quiz .actionbar .btn--primary").click()
    page.wait_for_timeout(300)
    t = last_toast(page)
    record("Urutan terbalik ditolak dengan kalimat khasnya (PQ lagi)", "lagi" in t and "sebaliknya" in t, t[:120])
    record("Kalimat salah tidak menyebut koordinat kunci", "(3, 3)" not in t and "(−2, 1)" not in t, t[:120])
    page.locator(".quiz .actionbar button", has_text="Coba Lagi").click()
    page.wait_for_timeout(400)
    tap_quiz_plane(page, 3, 3); tap_quiz_plane(page, -2, 1)
    page.locator(".quiz .actionbar .btn--primary").click()
    page.wait_for_timeout(300)
    b = burst_state(page)
    record("Ketukan Q lalu P diterima sebagai QP (pop-up Tepat!)", bool(b) and b["ok"], json.dumps(b, ensure_ascii=False))
    qp = page.evaluate("() => { const a = [...document.querySelectorAll('.quiz-plane .plane__arrow')].pop(); return a ? { blue: a.classList.contains('plane__arrow--blue') } : null; }")
    record("Panah QP siswa diwarnai kobalt sesudah benar", bool(qp) and qp["blue"], json.dumps(qp))
    page.locator(".quiz .actionbar .btn--primary", has_text="Berikutnya").click()
    page.wait_for_timeout(500)
    # Soal 3: komponen tertukar → kalimat khas, lalu jawaban benar.
    tap_quiz_plane(page, 2, -3)
    page.locator(".quiz .actionbar .btn--primary").click()
    page.wait_for_timeout(300)
    t = last_toast(page)
    record("Soal 3: komponen tertukar ditolak dengan kalimat khasnya", "tertukar" in t, t[:120])
    page.locator(".quiz .actionbar button", has_text="Coba Lagi").click()
    page.wait_for_timeout(400)
    tap_quiz_plane(page, -3, 2)
    page.locator(".quiz .actionbar .btn--primary").click()
    page.wait_for_timeout(300)
    b = burst_state(page)
    record("Soal 3: ketukan R(−3, 2) diterima (pop-up Tepat!)", bool(b) and b["ok"], json.dumps(b, ensure_ascii=False))
    page.wait_for_timeout(700)
    orr = page.evaluate("""() => { const svg = document.querySelector('.quiz-plane svg.plane');
        const labels = [...svg.querySelectorAll('.plane__label')].map((l) => l.textContent);
        return { arrows: svg.querySelectorAll('.plane__arrow').length, hasOR: labels.some((t) => t.includes('OR')) }; }""")
    record("Soal 3: panah OR muncul ke titik R yang diketuk siswa", orr["arrows"] >= 1 and orr["hasOR"], json.dumps(orr))
    page.locator(".quiz .actionbar .btn--success").click()
    page.wait_for_timeout(800)
    done = page.evaluate("() => ({ done: !!document.querySelector('.lesson-done'), planes: document.querySelectorAll('svg.plane').length })")
    record("Kuis selesai; bidang soal dibongkar tuntas", done["done"] and done["planes"] == 0, json.dumps(done))
    record("Tanpa galat konsol selama soal ketuk-bidang", not errors, "; ".join(errors[:2]))
    reset_storage(page)


def section_quiz_retry(page, errors):
    print("\n6g. Coba Lagi Kuis tanpa menurunkan rekor")
    page.set_viewport_size({"width": 1024, "height": 600})
    fresh_position(page)
    # Rekor 100 sudah tercatat: sub-topik tuntas.
    page.evaluate("""async () => { const p = await import('/js/core/state/progressStore.js');
        p.markSubtopicCompleted('01_konsep_dasar', 'pengertian_notasi', 100); }""")
    page.evaluate("""async () => { const m = await import('/js/core/state/sessionState.js');
        m.patchResume(m.lessonKey('01_konsep_dasar', 'pengertian_notasi'), { step: 1, simulationDone: true }); }""")
    open_route(page, GUIDED_ROUTE, settle=800)
    btn = page.locator("button", has_text="Coba Lagi Kuis")
    record("Mode review Mini Kuis menyediakan tombol 'Coba Lagi Kuis'", btn.count() > 0)
    if not btn.count():
        return
    btn.first.click()
    page.wait_for_timeout(600)
    live = page.evaluate("() => !!document.querySelector('.quiz .actionbar .btn--primary') && !document.querySelector('.answer-key')")
    record("'Coba Lagi Kuis' membuka kuis yang bisa dijawab (bukan kunci jawaban)", live)
    # Percobaan latihan berakhir dengan skor lebih rendah.
    page.evaluate("""() => { const v = window.__vektorLab.state.activeView;
        const host = document.querySelector('.ws-stage .workspace__body > div') || v.body; v.onQuizFinish({ score: 60 }, host); }""")
    page.wait_for_timeout(500)
    after = page.evaluate("""async () => { const p = await import('/js/core/state/progressStore.js');
        const s = p.getSubtopicProgress('01_konsep_dasar', 'pengertian_notasi');
        return { best: s.bestQuizScore, status: s.status, text: (document.querySelector('.lesson-done') || {}).innerText || '',
                 again: !!document.querySelector('.lesson-done button') && [...document.querySelectorAll('.lesson-done button')].some((b) => /coba lagi/i.test(b.innerText)) }; }""")
    record("Skor latihan 60 TIDAK menurunkan rekor 100; status tetap tuntas",
           after["best"] == 100 and after["status"] == "completed", json.dumps(after, ensure_ascii=False))
    record("Layar hasil menyebut rekor terbaik yang tetap", "100" in after["text"] and "60" in after["text"], after["text"][:160])
    record("Layar hasil menyediakan 'Coba Lagi Kuis' lagi", after["again"], json.dumps(after, ensure_ascii=False))
    for w, h in [(740, 360), (1024, 600)]:
        page.set_viewport_size({"width": w, "height": h})
        page.wait_for_timeout(300)
        hit = page.evaluate("""() => { const fab = document.querySelector('.pad-fab').getBoundingClientRect();
            return [...document.querySelectorAll('.lesson-done .actionbar .btn')].filter((x) => { const b = x.getBoundingClientRect();
                return !(fab.right <= b.left || b.right <= fab.left || fab.bottom <= b.top || b.bottom <= fab.top); }).map((x) => x.innerText); }""")
        record(f"{w}×{h}: tombol papan coret tidak menimpa tombol layar hasil", not hit, str(hit))
    page.set_viewport_size({"width": 1024, "height": 600})
    record("Tanpa galat konsol selama coba lagi kuis", not errors, "; ".join(errors[:2]))
    # Isolasi: rekor buatan uji ini tidak boleh bocor ke bagian sesudahnya.
    reset_storage(page)


def section_sound_toggle(page, errors):
    print("\n6e. Tombol suara di header")
    for w, h in [(740, 360), (1024, 600), (1440, 900)]:
        page.set_viewport_size({"width": w, "height": h})
        open_route(page, GUIDED_ROUTE, settle=500)
        m = page.evaluate("""() => {
            const s = document.querySelector('[data-role="sound"]');
            if (!s) return null;
            const r = (e) => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; };
            const hit = (a, b) => !(a[2] <= b[0] || b[2] <= a[0] || a[3] <= b[1] || b[3] <= a[1]);
            const others = ['.header-center', '.brand', '[data-role="fullscreen"]'].map((q) => document.querySelector(q)).filter(Boolean);
            return { box: r(s).map(Math.round), overlap: others.filter((o) => hit(r(s), r(o))).map((o) => o.className),
                     visible: getComputedStyle(s).visibility !== 'hidden', pressed: s.getAttribute('aria-pressed') };
        }""")
        record(f"{w}×{h}: tombol suara ada, terlihat, tidak menimpa header", bool(m) and m["visible"] and not m["overlap"], json.dumps(m))
    page.set_viewport_size({"width": 1024, "height": 600})
    state = """async () => { const m = await import('/js/core/ui/sfx.js');
        const b = document.querySelector('[data-role="sound"]');
        return { on: m.isEnabled(), pressed: b.getAttribute('aria-pressed'), stored: localStorage.getItem('vektorLab.sfx.v1') }; }"""
    first = page.evaluate(state)
    record("Suara AKTIF secara bawaan", first["on"] is True and first["pressed"] == "true", json.dumps(first))
    page.click('[data-role="sound"]')
    off = page.evaluate(state)
    record("Ketuk tombol = BISU (sfx.setEnabled(false), tersimpan)", off["on"] is False and off["pressed"] == "false" and off["stored"] == "off", json.dumps(off))
    open_route(page, GUIDED_ROUTE, settle=400)
    kept = page.evaluate(state)
    record("Pilihan bisu bertahan sesudah muat ulang", kept["on"] is False and kept["pressed"] == "false", json.dumps(kept))
    page.click('[data-role="sound"]')
    on = page.evaluate(state)
    record("Ketuk lagi = suara AKTIF kembali", on["on"] is True and on["pressed"] == "true" and on["stored"] == "on", json.dumps(on))
    record("Tanpa galat konsol saat menyalakan/membisukan suara", not errors, "; ".join(errors[:2]))


QUIZ_BAR = """() => {
    const body = document.querySelector('.ws-stage > .workspace__body');
    const bar = document.querySelector('.quiz .actionbar');
    const b = body.getBoundingClientRect(), r = bar.getBoundingClientRect();
    return { scrolls: body.scrollHeight > body.clientHeight + 1, view: [Math.round(b.top), Math.round(b.bottom)],
             bar: [Math.round(r.top), Math.round(r.bottom)], bg: getComputedStyle(bar).backgroundColor };
}"""


def section_quiz_sticky(page, errors):
    print("\n6d. Mini Kuis: bilah aksi selalu terlihat tanpa menggulir")
    for w, h in [(740, 360), (1024, 600)]:
        page.set_viewport_size({"width": w, "height": h})
        open_mini_quiz(page, "01_konsep_dasar", "pengertian_notasi")
        page.wait_for_timeout(500)
        m = page.evaluate(QUIZ_BAR)
        inside = lambda m: m["bar"][0] >= m["view"][0] - 1 and m["bar"][1] <= m["view"][1] + 1
        record(f"{w}×{h}: kartu soal memang lebih tinggi dari panggung (uji bermakna)", m["scrolls"], json.dumps(m))
        record(f"{w}×{h}: tombol Periksa terlihat tanpa menggulir", inside(m), json.dumps(m))
        page.evaluate("() => { const b = document.querySelector('.ws-stage > .workspace__body'); b.scrollTop = b.scrollHeight / 2; }")
        page.wait_for_timeout(150)
        m2 = page.evaluate(QUIZ_BAR)
        record(f"{w}×{h}: tetap terlihat saat soal digulir, berlatar pejal", inside(m2) and not m2["bg"].endswith(", 0)"), json.dumps(m2))
        # Tombol papan coret (FAB) melayang di pojok kanan bawah panggung —
        # tepat di atas bilah yang kini menempel di dasar.
        hit = page.evaluate("""() => {
            const fab = document.querySelector('.pad-fab'), btn = document.querySelector('.quiz .actionbar .btn--primary');
            if (!fab || !btn) return null;
            const a = fab.getBoundingClientRect(), b = btn.getBoundingClientRect();
            return { fab: [Math.round(a.left), Math.round(a.right)], btn: [Math.round(b.left), Math.round(b.right)],
                     overlap: !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top) };
        }""")
        record(f"{w}×{h}: tombol papan coret tidak menimpa tombol Periksa", hit is not None and not hit["overlap"], json.dumps(hit))
    page.set_viewport_size({"width": 1024, "height": 600})


def section_tap_targets(page, errors):
    print("\n6b. Area sentuh efektif ≥ 44×44 (kontrak §3.3)")

    def leave_exam():
        page.evaluate("() => { const v = window.__vektorLab.state.activeView; if (v && v.hasUnsavedWork) v.hasUnsavedWork = () => false; }")

    def measure(label, scope=None):
        page.wait_for_timeout(350)
        result = page.evaluate(HIT_TARGET_PROBE, scope)
        detail = "; ".join(f"{f['target']} {f['size']} ({f['miss']} titik meleset → {', '.join(f['hits'])})" for f in result["fails"])
        record(f"{label}: {result['checked']} target kecil, semua ≥ 44×44", not result["fails"], detail)

    for w, h in [(740, 360), (1024, 600)]:
        page.set_viewport_size({"width": w, "height": h})
        v = f"{w}×{h}"
        fresh_position(page)
        open_route(page, "#/", settle=700)
        measure(f"{v} menu")
        click_text(page, "Reset Progres")
        page.wait_for_selector(".modal-scrim[data-open='true']", timeout=3000)
        measure(f"{v} modal konfirmasi", ".modal")
        page.keyboard.press("Escape")
        page.wait_for_timeout(400)

        open_route(page, "#/belajar", settle=700)
        measure(f"{v} daftar bab")
        open_route(page, "#/belajar/01_konsep_dasar", settle=700)
        measure(f"{v} daftar sub-topik")

        fresh_position(page)
        open_route(page, "#/belajar/01_konsep_dasar/pengertian_notasi", settle=900)
        measure(f"{v} simulasi terpandu (vector_anatomy)")
        click_text(page, "Rangkuman")
        page.wait_for_timeout(600)
        measure(f"{v} rangkuman")
        click_text(page, "Kembali ke Simulasi")
        page.wait_for_timeout(600)
        page.click(".pad-fab")
        page.wait_for_timeout(500)
        measure(f"{v} papan coret terbuka")

        fresh_position(page)
        open_route(page, "#/belajar/02_operasi_bangun_datar/operasi_komponen", settle=900)
        measure(f"{v} simulasi sel (component_add)")

        open_mini_quiz(page, "01_konsep_dasar", "panjang_vektor")
        measure(f"{v} Mini Kuis")
        page.locator(".quiz .numfield").first.click()
        page.wait_for_timeout(500)
        measure(f"{v} papan angka terbuka", ".mathpad")
        page.keyboard.press("Escape")

        fresh_position(page)
        open_route(page, "#/kuis/latihan_bab/01_konsep_dasar", settle=900)
        measure(f"{v} ujian per bab")
        leave_exam()
        fresh_position(page)
        open_route(page, "#/tka", settle=900)
        measure(f"{v} ujian TKA")
        leave_exam()

        page.evaluate("() => localStorage.removeItem('vektorLab.identity.v1')")
        open_route(page, "#/login", settle=700)
        measure(f"{v} layar masuk")
        reset_storage(page)
    page.set_viewport_size({"width": 1024, "height": 600})


def section_mathpad(page, errors):
    print("\n7. Mathpad (satu-satunya jalur input)")
    open_mini_quiz(page, "01_konsep_dasar", "panjang_vektor")
    page.wait_for_selector(".quiz .numfield", timeout=5000)
    attrs = page.evaluate("""() => { const i = document.querySelector('.quiz .numfield');
        return { readOnly: i.readOnly, inputmode: i.getAttribute('inputmode'), autocomplete: i.getAttribute('autocomplete'), value: i.value }; }""")
    record("Kotak isian readonly + inputmode=none + autocomplete=off",
           attrs["readOnly"] and attrs["inputmode"] == "none" and attrs["autocomplete"] == "off", json.dumps(attrs))

    is_open = "() => document.querySelector('.mathpad') && document.querySelector('.mathpad').dataset.open === 'true'"
    field = page.locator(".quiz .numfield").first
    field.click()
    page.wait_for_timeout(400)
    record("Mengetuk kotak membuka papan angka", page.evaluate(is_open))
    page.keyboard.press("7")
    page.wait_for_timeout(150)
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)
    restored = page.evaluate("() => document.querySelector('.quiz .numfield').value")
    record("Escape = BATAL, kotak dipulihkan", not page.evaluate(is_open) and restored == attrs["value"], f"nilai={restored!r}")

    field.click()
    page.wait_for_timeout(400)
    page.keyboard.press("7")
    page.wait_for_timeout(150)
    page.mouse.click(5, page.viewport_size["height"] // 2)
    page.wait_for_timeout(400)
    saved = page.evaluate("() => document.querySelector('.quiz .numfield').value")
    record("Klik di luar = SIMPAN", not page.evaluate(is_open) and "7" in saved, f"nilai={saved!r}")
    record("Tanpa galat konsol selama mathpad", not errors, "; ".join(errors[:2]))


def section_reveal_policy(page, errors):
    print("\n8. Mini Kuis: kunci baru tampil sesudah salah ke-3")
    reveal_after = page.evaluate("async () => (await import('/js/quiz/quizEngine.js')).QuizEngine.REVEAL_AFTER")
    record("QuizEngine.REVEAL_AFTER = 3", reveal_after == 3, str(reveal_after))

    # b1_01_1: single_choice, kunci indeks 2 ("ke arah timur"); opsi 0 salah.
    open_mini_quiz(page, "01_konsep_dasar", "pengertian_notasi")
    page.wait_for_selector(".quiz .option", timeout=5000)
    correct_text = page.evaluate("() => document.querySelectorAll('.quiz .option')[2].textContent.trim()")
    state = """() => ({ correct: document.querySelectorAll('.quiz .option--correct').length,
                        explain: document.querySelectorAll('.quiz .explain').length,
                        toast: [...document.querySelectorAll('.toast--error')].map((t) => t.textContent.trim()).pop() || '' })"""
    for attempt in range(1, reveal_after + 1 if isinstance(reveal_after, int) else 4):
        page.locator(".quiz .option").nth(0).click()
        page.wait_for_timeout(150)
        click_text(page, "Periksa")
        page.wait_for_timeout(600)
        s = page.evaluate(state)
        if attempt < 3:
            record(f"Salah ke-{attempt}: kunci & pembahasan TIDAK tampil", s["correct"] == 0 and s["explain"] == 0, json.dumps(s, ensure_ascii=False))
            record(f"Salah ke-{attempt}: toast penjelas tanpa menyebut opsi benar",
                   bool(s["toast"]) and "timur" not in s["toast"], s["toast"][:120])
            # Toast melayang tepat di atas bilah aksi. Selama ia tampil, ketukan
            # pada "Coba Lagi" HARUS tetap sampai ke tombolnya.
            reach = page.evaluate("""() => {
                const toast = document.querySelector('.toast');
                const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Coba Lagi'));
                if (!toast || !btn) return { toast: !!toast, btn: !!btn };
                const r = btn.getBoundingClientRect();
                const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                return { toast: true, btn: true, sampai: !!hit && btn.contains(hit),
                         tertutup: hit ? String(hit.className) : null };
            }""")
            record(f"Salah ke-{attempt}: ketukan tembus toast sampai ke tombol Coba Lagi",
                   reach.get("sampai") is True, json.dumps(reach, ensure_ascii=False))
            click_text(page, "Coba Lagi")
            page.wait_for_timeout(400)
        else:
            record("Salah ke-3: kunci & pembahasan tampil", s["correct"] == 1 and s["explain"] == 1, json.dumps(s, ensure_ascii=False))
    record("Opsi benar yang ditandai = opsi kunci JSON",
           page.evaluate("() => (document.querySelector('.quiz .option--correct') || {}).textContent || ''").strip() == correct_text)
    record("Tanpa galat konsol selama Mini Kuis", not errors, "; ".join(errors[:2]))


def section_leave_guard(page, errors):
    print("\n9. Penjaga keluar ujian")
    fresh_position(page)
    open_route(page, "#/kuis/latihan_bab/01_konsep_dasar", settle=900)
    page.locator(".quiz .option").nth(1).click()
    page.wait_for_timeout(300)
    route = "#/kuis/latihan_bab/01_konsep_dasar"
    modal_open = "() => !!document.querySelector('.modal-scrim[data-open=\"true\"]')"

    page.click("[data-role=home]")
    page.wait_for_timeout(600)
    record("Tombol rumah ditahan modal kustom", page.evaluate(modal_open) and page.evaluate("() => location.hash") == route)
    click_text(page, "Batal")
    page.wait_for_timeout(500)
    record("Batal → tetap di ujian", not page.evaluate(modal_open) and page.evaluate("() => location.hash") == route)

    page.evaluate("() => { location.hash = '#/belajar'; }")
    page.wait_for_timeout(600)
    record("Hash manual ditahan modal kustom", page.evaluate(modal_open) and page.evaluate("() => location.hash") == route,
           page.evaluate("() => location.hash"))
    click_text(page, "Ya, Keluar")
    page.wait_for_timeout(800)
    record("Ya, Keluar → berpindah", page.evaluate("() => location.hash") == "#/belajar", page.evaluate("() => location.hash"))
    calls = page.evaluate("() => window.__nativeDialogCalls || []")
    record("alert/confirm/prompt native tidak pernah dipanggil", not calls, str(calls))
    record("Tanpa galat konsol selama penjaga keluar", not errors, "; ".join(errors[:2]))


def section_scratchpad(page, errors):
    print("\n10. Papan coret")
    fresh_position(page)
    open_route(page, "#/belajar/01_konsep_dasar/pengertian_notasi", settle=800)
    record("Tombol papan coret ada", page.query_selector(".pad-fab") is not None)
    record("Papan tertutup di awal", page.evaluate("() => document.querySelector('.pad').hidden === true"))
    page.click(".pad-fab")
    page.wait_for_timeout(500)
    swatches = page.evaluate("""() => [...document.querySelectorAll('.pad__swatch')].map((b) => ({
        label: b.getAttribute('aria-label'), color: b.style.getPropertyValue('--swatch').trim() }))""")
    record("Empat warna pena", len(swatches) == 4, json.dumps(swatches, ensure_ascii=False))
    ink = page.evaluate("""() => new Promise((resolve) => {
        const cv = document.querySelector('.pad__canvas');
        const r = cv.getBoundingClientRect();
        const pe = (x, y, t) => new PointerEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y,
            pointerId: 1, pointerType: 'pen', isPrimary: true, button: 0, buttons: 1 });
        const X = r.left + 60, Y = r.top + 80;
        cv.dispatchEvent(pe(X, Y, 'pointerdown'));
        for (let i = 1; i <= 20; i++) cv.dispatchEvent(pe(X + i * 8, Y + Math.sin(i / 3) * 16, 'pointermove'));
        cv.dispatchEvent(pe(X + 160, Y, 'pointerup'));
        setTimeout(() => {
            const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
            let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
            resolve(n);
        }, 200);
    })""")
    record("Goresan menghasilkan tinta di kanvas", ink > 50, f"{ink} piksel")

    # Pena mengikuti palet "Instrumen Teknik" di css/tokens.css — dibaca dari
    # token yang HIDUP, jadi mengganti nilai token ikut mengganti pena.
    expected = page.evaluate("""() => { const cs = getComputedStyle(document.documentElement);
        return PEN_TOKENS.map(([label, token]) => ({ label: 'Warna ' + label, color: cs.getPropertyValue(token).trim().toUpperCase() })); }"""
                             .replace("PEN_TOKENS", json.dumps(PEN_TOKENS)))
    actual = [{"label": s["label"], "color": s["color"].upper()} for s in swatches]
    record("Warna & label pena = token palet (grafit, kobalt, amber tinta, beri)", actual == expected,
           f"didapat {actual}, diharapkan {expected}")

    # Kontras DIUKUR dari piksel goresan sungguhan terhadap latar kanvas.
    contrast = page.evaluate("""async () => {
        const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
                                     return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
        const cv = document.querySelector('.pad__canvas');
        const bg = getComputedStyle(cv).backgroundColor.match(/\\d+/g).map(Number);
        const ctx = cv.getContext('2d');
        const out = [];
        const swatches = [...document.querySelectorAll('.pad__swatch')];
        document.querySelector('.pad__width[aria-label="Ketebalan Tebal"]').click();
        for (let s = 0; s < swatches.length; s++) {
            swatches[s].click();
            const r = cv.getBoundingClientRect();
            const y = r.top + 150 + s * 40, x0 = r.left + 40;
            const pe = (x, t) => new PointerEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y,
                pointerId: 1, pointerType: 'pen', isPrimary: true, button: 0, buttons: 1 });
            cv.dispatchEvent(pe(x0, 'pointerdown'));
            for (let i = 1; i <= 12; i++) cv.dispatchEvent(pe(x0 + i * 10, 'pointermove'));
            cv.dispatchEvent(pe(x0 + 120, 'pointerup'));
            await new Promise((res) => setTimeout(res, 60));
            const dpr = cv.width / r.width;
            const px = ctx.getImageData(Math.round(60 * dpr), Math.round((150 + s * 40) * dpr), 1, 1).data;
            out.push({ label: swatches[s].getAttribute('aria-label'), rgb: [px[0], px[1], px[2]], alpha: px[3],
                       ratio: +ratio([px[0], px[1], px[2]], bg).toFixed(2) });
        }
        return out;
    }""")
    weak = [c for c in contrast if c["alpha"] < 250 or c["ratio"] < 4.5]
    record("Kontras goresan tiap pena ≥ 4,5:1 di atas kanvas (diukur dari piksel)", not weak,
           json.dumps(contrast, ensure_ascii=False))
    record("Tanpa galat konsol selama papan coret", not errors, "; ".join(errors[:2]))

    # Lanskap pendek: bilah alat SATU baris yang digulir horizontal, bukan
    # membungkus jadi dua baris yang menutup ±¼ kanvas.
    page.set_viewport_size({"width": 740, "height": 360})
    fresh_position(page)
    open_route(page, "#/belajar/01_konsep_dasar/pengertian_notasi", settle=800)
    page.click(".pad-fab")
    page.wait_for_timeout(500)
    bar = page.evaluate("""async () => {
        const bar = document.querySelector('.pad__bar');
        const pad = document.querySelector('.pad').getBoundingClientRect();
        const cs = getComputedStyle(bar);
        const controls = [...bar.querySelectorAll('button')];
        const rows = new Set(controls.map((b) => { const r = b.getBoundingClientRect(); return Math.round(r.top + r.height / 2); }));
        const reachable = [];
        for (const b of controls) {
            b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            await new Promise((r) => requestAnimationFrame(r));
            const r = b.getBoundingClientRect(), q = bar.getBoundingClientRect();
            reachable.push(r.left >= q.left - 1 && r.right <= q.right + 1);
        }
        const fade = async (left) => { bar.scrollLeft = left; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            const c = getComputedStyle(bar); return [c.getPropertyValue('--pad-fade-l').trim(), c.getPropertyValue('--pad-fade-r').trim()]; };
        const fadeStart = await fade(0), fadeEnd = await fade(bar.scrollWidth);
        bar.scrollLeft = 0;
        return { fadeStart, fadeEnd,
            rows: rows.size, controls: controls.length, wrap: cs.flexWrap, overflowX: cs.overflowX,
            scrollbarWidth: cs.scrollbarWidth, scrollbarSpace: bar.offsetHeight - bar.clientHeight
                - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth),
            scrolls: bar.scrollWidth > bar.clientWidth, height: Math.round(bar.getBoundingClientRect().height),
            coverage: +(bar.getBoundingClientRect().height / pad.height * 100).toFixed(1),
            unreachable: controls.filter((_, i) => !reachable[i]).map((b) => b.getAttribute('aria-label')),
        };
    }""")
    record("740×360: bilah papan coret satu baris (nowrap)", bar["rows"] == 1 and bar["wrap"] == "nowrap", json.dumps(bar, ensure_ascii=False))
    record(f"740×360: tinggi bilah {bar['height']}px ≤ 48px ({bar['coverage']}% kanvas)", bar["height"] <= 48, json.dumps(bar, ensure_ascii=False))
    record("740×360: bilah digulir horizontal dengan scrollbar tersembunyi",
           bar["overflowX"] == "auto" and bar["scrollbarWidth"] == "none" and bar["scrollbarSpace"] <= 0, json.dumps(bar, ensure_ascii=False))
    record(f"740×360: {bar['controls']} kendali semuanya terjangkau lewat gulir", not bar["unreachable"], str(bar["unreachable"]))
    record("740×360: petunjuk gulir — awal pudar kanan saja, ujung pudar kiri saja",
           bar["fadeStart"] == ["0px", "28px"] and bar["fadeEnd"] == ["28px", "0px"],
           json.dumps(bar, ensure_ascii=False))
    page.set_viewport_size({"width": 1024, "height": 600})


def section_confetti(page, errors):
    print("\n11. Konfeti perayaan")
    fresh_position(page)
    open_route(page, "#/", settle=600)
    got = page.evaluate("""async (tokens) => {
        const m = await import('/js/core/interactions/flyToAnimation.js');
        const cs = getComputedStyle(document.documentElement);
        m.celebrate({ pieces: 20, duration: 400 });
        const bits = [...document.querySelectorAll('.confetti-host .confetti-piece > i')];
        const used = [...new Set(bits.map((b) => b.style.getPropertyValue('--cf-color').trim().toUpperCase()))];
        const expected = tokens.map((t) => cs.getPropertyValue(t).trim().toUpperCase());
        await new Promise((r) => setTimeout(r, 400 + 900 + 200));   // celebrate() membuang host pada duration + 900 ms
        return { used, expected, pieces: bits.length, cleaned: !document.querySelector('.confetti-host') };
    }""", CONFETTI_TOKENS)
    record("Konfeti tergambar", got["pieces"] == 20, json.dumps(got))
    record("Warna konfeti = token palet (kobalt, amber, sian, beri, sukses)",
           sorted(got["used"]) == sorted(got["expected"]) and len(got["expected"]) == 5 and all(got["expected"]),
           json.dumps(got))
    record("Konfeti dibersihkan sesudah durasinya", got["cleaned"], json.dumps(got))
    record("Tanpa galat konsol selama konfeti", not errors, "; ".join(errors[:2]))


def run_suite(browser, name, global_name, expected):
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page_errors = []
    page.on("pageerror", lambda e: page_errors.append(str(e)))
    page.goto(f"{BASE}/tests/{name}.html")
    deadline = time.time() + 240
    result = None
    # Sengaja memakai jeda + evaluate, BUKAN wait_for_function: pemantau milik
    # Playwright memasang listener global sendiri, dan plane.html menghitung
    # listener window untuk membuktikan destroy() tuntas.
    while time.time() < deadline:
        page.wait_for_timeout(1000)
        result = page.evaluate(f"() => window.{global_name} && window.{global_name}.done ? window.{global_name} : null")
        if result:
            break
    page.close()
    if not result:
        record(f"tests/{name}.html selesai", False, "waktu habis")
        return
    failures = [f.get("name", "") + ": " + f.get("error", "") for f in (result.get("failures") or [])]
    record(f"tests/{name}.html → {result.get('passed')}/{expected}",
           result.get("passed") == expected and not result.get("failed") and not page_errors,
           "; ".join(failures[:3] + page_errors[:2]))


# ============================================================
# Main
# ============================================================

def server_alive():
    try:
        urllib.request.urlopen(f"{BASE}/index.html", timeout=2)
        return True
    except Exception:
        return False


def main():
    parser = argparse.ArgumentParser(description="Uji asap Ruang Vektor")
    parser.add_argument("--serve", action="store_true", help="nyalakan tests/serve.py bila server belum hidup")
    parser.add_argument("--skip-suites", action="store_true", help="lewati tests/plane.html & tests/sims.html")
    parser.add_argument("--headed", action="store_true", help="tampilkan jendela peramban")
    args = parser.parse_args()

    server = None
    if not server_alive():
        if not args.serve:
            print(f"Server belum hidup di {BASE}. Jalankan `python tests/serve.py` atau pakai --serve.")
            return 1
        server = subprocess.Popen([sys.executable, str(ROOT / "tests" / "serve.py"), str(PORT)], cwd=str(ROOT),
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(40):
            if server_alive():
                break
            time.sleep(0.25)

    chapters = load_manifest()
    started = time.time()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=not args.headed)
            context = browser.new_context(viewport={"width": 1024, "height": 600})
            context.add_init_script(NATIVE_DIALOG_SPY)
            page = context.new_page()
            errors, requests = [], []
            # `net::ERR_NETWORK_CHANGED` adalah kejadian adaptor jaringan Windows
            # (lihat open_route), bukan galat aplikasi — navigasinya diulang.
            page.on("console", lambda m: m.type == "error" and "ERR_NETWORK_CHANGED" not in m.text and errors.append(m.text))
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("request", lambda r: requests.append(r.url))

            print(f"Uji asap Ruang Vektor → {BASE}")
            section_boot(page, errors, requests)
            section_identity(page, errors)
            section_routes(page, errors, chapters)
            section_subtopics(page, errors, chapters)
            section_visual(page)
            section_landscape(page, errors)
            section_guided_stage(page, errors)
            section_quiz_sticky(page, errors)
            section_sound_toggle(page, errors)
            section_celebration(page, errors)
            section_quiz_retry(page, errors)
            section_quiz_plane(page, errors)
            section_tap_targets(page, errors)
            section_mathpad(page, errors)
            section_reveal_policy(page, errors)
            section_leave_guard(page, errors)
            section_scratchpad(page, errors)
            section_confetti(page, errors)

            if not args.skip_suites:
                print("\n12. Suite peramban")
                run_suite(browser, "plane", "__planeTest", EXPECTED_PLANE_TESTS)
                run_suite(browser, "sims", "__simTest", EXPECTED_SIM_TESTS)
            browser.close()
    finally:
        if server:
            server.terminate()

    failed = [r for r in results if not r[1]]
    print("\n" + "=" * 60)
    print(f"LOLOS {len(results) - len(failed)} · GAGAL {len(failed)} · CATATAN {len(notes)} · {time.time() - started:.0f} detik")
    for name, _, detail in failed:
        print(f"  - {name}" + (f" — {detail}" if detail else ""))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
