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
  10. Papan coret: tombol, 4 warna, goresan menghasilkan tinta.
  11. Suite peramban: tests/plane.html 32/32 dan tests/sims.html 26/26.

Pemeriksaan sasaran sentuh (<44px) dilaporkan sebagai CATATAN, bukan GAGAL:
desain saat ini sengaja memakai tombol 34–40px di lanskap pendek (lihat
`--touch-min` di css/tokens.css). Keputusan mengubahnya ada di pengguna.

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
EXPECTED_PLANE_TESTS = 32
EXPECTED_SIM_TESTS = 26
VIEWPORTS = [(740, 360), (1024, 600), (1440, 900)]
SIDEBAR_RATIO = (22.0, 31.0)
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
    """Buka rute dari muat ulang penuh: navigasi hash tidak memuat ulang modul."""
    page.goto(f"{BASE}/{route}")
    page.reload()
    wait_ready(page)
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
            m.patchResume(m.lessonKey(c, s), { step: 2, simulationDone: true });
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

SMALL_TARGETS = """() => [...document.querySelectorAll('#app button, #app [role=button], .fs-btn')]
    .filter((e) => e.offsetParent || getComputedStyle(e).position === 'fixed')
    .map((e) => { const r = e.getBoundingClientRect();
                  return { c: String(e.className.baseVal ?? e.className).split(' ')[0],
                           w: Math.round(r.width), h: Math.round(r.height) }; })
    .filter((x) => x.w > 0 && (x.w < 44 || x.h < 44))"""


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
    print("\n4. 25 sub-topik: Materi → Simulasi")
    count = 0
    for cid, order in chapters:
        for sid in order:
            count += 1
            errors.clear()
            fresh_position(page)
            open_route(page, f"#/belajar/{cid}/{sid}", settle=700)
            materi = page.query_selector(".materi") is not None
            try:
                click_text(page, "Mulai Simulasi")
                page.wait_for_selector(".sim-host .sim-board, .sim-host .sim", timeout=5000)
                mounted = True
            except Exception:
                mounted = False
            page.wait_for_timeout(300)
            katex_err = page.evaluate("() => document.querySelectorAll('.katex-error').length")
            ok = materi and mounted and not errors and katex_err == 0
            record(f"{cid}/{sid}", ok,
                   f"materi={materi} simulasi={mounted} katex-error={katex_err} galat={'; '.join(errors[:2])}")
    record(f"{EXPECTED_SUBTOPICS} sub-topik terjelajahi", count == EXPECTED_SUBTOPICS, f"ada {count}")


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
    small_seen = {}
    for w, h in VIEWPORTS:
        page.set_viewport_size({"width": w, "height": h})
        for route, sim in [("#/", False), ("#/belajar/02_operasi_bangun_datar/operasi_komponen", True),
                           ("#/kuis/latihan_bab/01_konsep_dasar", False)]:
            errors.clear()
            fresh_position(page)
            open_route(page, route, settle=700)
            if sim:
                click_text(page, "Mulai Simulasi")
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
            for t in page.evaluate(SMALL_TARGETS):
                small_seen.setdefault(t["c"], set()).add(f"{t['w']}×{t['h']}@{w}×{h}")
            # Kunjungan ujian ditinggalkan: lepaskan penjaga keluar untuk rute berikutnya.
            page.evaluate("() => { const v = window.__vektorLab.state.activeView; if (v && v.hasUnsavedWork) v.hasUnsavedWork = () => false; }")
    if small_seen:
        detail = "; ".join(f"{c}: {', '.join(sorted(s)[:3])}" for c, s in sorted(small_seen.items()))
        note(f"{len(small_seen)} jenis sasaran sentuh < 44px (kontrak §3.3)", detail)

    page.set_viewport_size({"width": 600, "height": 900})
    page.wait_for_timeout(400)
    portrait = page.evaluate("""() => {
        const hidden = (sel) => { const e = document.querySelector(sel); if (!e) return true;
            const cs = getComputedStyle(e); return cs.display === 'none' || cs.visibility === 'hidden'; };
        return { lock: !hidden('.rotate-lock'), app: hidden('#app'), fs: hidden('.fs-btn') };
    }""")
    record("Potret: pengunci rotasi tampil, #app & tombol layar penuh tersembunyi", all(portrait.values()), json.dumps(portrait))
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
    record("Tanpa galat konsol selama papan coret", not errors, "; ".join(errors[:2]))


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
            page.on("console", lambda m: m.type == "error" and errors.append(m.text))
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("request", lambda r: requests.append(r.url))

            print(f"Uji asap Ruang Vektor → {BASE}")
            section_boot(page, errors, requests)
            section_identity(page, errors)
            section_routes(page, errors, chapters)
            section_subtopics(page, errors, chapters)
            section_visual(page)
            section_landscape(page, errors)
            section_mathpad(page, errors)
            section_reveal_policy(page, errors)
            section_leave_guard(page, errors)
            section_scratchpad(page, errors)

            if not args.skip_suites:
                print("\n11. Suite peramban")
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
