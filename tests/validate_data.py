# -*- coding: utf-8 -*-
"""Validator data statis Ruang Vektor — Python murni, tanpa dependensi.

    python tests/validate_data.py            # ringkas: hanya GAGAL & PERINGATAN
    python tests/validate_data.py --verbose  # tampilkan juga setiap LOLOS

Kode keluar 0 bila tidak ada GAGAL (PERINGATAN tidak menggagalkan), 1 bila ada.

Kenapa berkas ini ada: aplikasi membaca JSON statis tanpa skema dan tanpa build.
Kesalahan data tidak melempar galat — ia tampil diam-diam di layar siswa sebagai
toast kosong, placeholder yang hilang, rumus rusak, atau kunci yang salah indeks.
Pemeriksaan di sini menangkapnya sebelum sampai ke kelas.

Yang diperiksa:
  1. Manifest `data/lessons.json` ↔ `data/chapters/*.json` (4 bab, 25 sub-topik).
  2. Registry engine: setiap `simulation.engine` terdaftar di peta `ENGINES`
     pada `js/lesson/simulations/sim*.js`, dan sebaliknya (25 = 25).
  3. Kalimat toast simulasi: setiap kunci yang dipakai engine ada di JSON, dan
     setiap placeholder `{{kunci}}` diberi nilai oleh engine di SETIAP titik
     pemakaiannya (dianalisis statis dari kode engine).
  4. Tidak ada karakter kendali di JSON (jebakan nyata: `\\vec` yang ditulis
     `\vec` menjadi tab vertikal + "ec").
  5. Soal: bentuk per tipe, `answerIndex`/`answerIndices` di dalam rentang,
     opsi hanya berkunci `label` atau `tex`, id unik, jumlah 78 Mini Kuis +
     34 bank ujian, `tkaSimulation.questionOrder` valid.
  6. LaTeX: kurung kurawal seimbang, `$` berpasangan, `\\left`/`\\right` dan
     `\\begin`/`\\end` berpasangan.
  7. Aksioma: kalimat salah (`toastWrong`) Mini Kuis/ujian tidak menyebut kunci
     jawaban (angka kunci isian, atau huruf opsi benar).
"""
import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    # Konsol Windows default-nya cp1252 dan meledak pada "→", "√", "—".
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SIM_DIR = ROOT / "js" / "lesson" / "simulations"
ENGINE_FILES = ["simBasics.js", "simOperations.js", "simProducts.js", "simModeling.js"]

EXPECTED_CHAPTERS = 4
EXPECTED_SUBTOPICS = 25
EXPECTED_ENGINES = 25
EXPECTED_MINI_QUIZ = 78
EXPECTED_BANK_TOTAL = 34
EXPECTED_BANK_SIZES = {
    "01_konsep_dasar": 6,
    "02_operasi_bangun_datar": 6,
    "03_perkalian_proyeksi": 6,
    "04_pemodelan_tka": 6,
    "tka_2026": 10,
}

MATERI_TYPES = {
    # tipe blok → kolom wajib (lihat switch di js/lesson/lessonRenderer.js)
    "p": ("x",), "tex": ("x",), "def": ("x",), "tip": ("x",), "warn": ("x",),
    "list": ("items",), "steps": ("items",), "typegroup": ("items",), "carousel": ("items",),
}
INPUT_TYPES = {"single_choice", "multi_select", "mathpad", "matrix_input"}
OPTION_KEYS = {"label", "tex"}
HURUF = "ABCDEFGHIJ"

# Kunci toast yang dipakai kerangka bersama (simKit.js / simCore.js), bukan
# oleh kelas engine. Boleh ada di JSON tanpa disebut kelasnya.
FRAMEWORK_TOAST_KEYS = {"success", "belumLengkap"}

PLACEHOLDER_RE = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")
MALFORMED_RE = re.compile(r"\{\{(?!\s*[a-zA-Z0-9_]+\s*\}\})")


# ============================================================
# Pencatat hasil
# ============================================================

class Report:
    def __init__(self, verbose):
        self.verbose = verbose
        self.passed = 0
        self.failed = []
        self.warned = []
        self.section = ""

    def start(self, title):
        self.section = title
        print(f"\n{title}")

    def check(self, ok, name, detail=""):
        if ok:
            self.passed += 1
            if self.verbose:
                print(f"  [LOLOS] {name}")
        else:
            self.failed.append(f"{name} — {detail}" if detail else name)
            print(f"  [GAGAL] {name}" + (f"\n          → {detail}" if detail else ""))
        return ok

    def warn(self, name, detail=""):
        self.warned.append(name)
        print(f"  [PERINGATAN] {name}" + (f"\n          → {detail}" if detail else ""))


def load_json(path, rep):
    """Muat JSON, sekaligus periksa karakter kendali pada teks mentahnya."""
    raw = path.read_bytes()
    rep.check(not raw.startswith(b"\xef\xbb\xbf"), f"{path.name}: tanpa BOM UTF-8")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as err:
        rep.check(False, f"{path.name}: UTF-8 valid", str(err))
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError as err:
        rep.check(False, f"{path.name}: JSON valid", str(err))
        return None


def walk_strings(node, path=""):
    """Hasilkan (jalur, string) untuk setiap string di pohon JSON."""
    if isinstance(node, str):
        yield path, node
    elif isinstance(node, list):
        for i, item in enumerate(node):
            yield from walk_strings(item, f"{path}[{i}]")
    elif isinstance(node, dict):
        for key, item in node.items():
            yield from walk_strings(item, f"{path}.{key}" if path else key)


# ============================================================
# 4 + 6. Karakter kendali & LaTeX
# ============================================================

# Karakter kendali yang lahir dari garis miring tunggal di depan perintah LaTeX:
# \v(ec) \t(ext|imes|heta) \f(rac) \b(egin|ar) \r(ight) \a(lpha) \0.
CONTROL_RE = re.compile(r"[\x00-\x09\x0b-\x1f\x7f]")
# "\n" sah sebagai pemisah paragraf, tetapi "\neq", "\nabla", "\not", "\nu"
# yang kehilangan garis miringnya juga menjadi "\n" + huruf kecil.
EATEN_N_RE = re.compile(r"\n(eq|abla|ot|u\b|leq|geq|ewline|orm)")


def strip_escaped(s):
    return s.replace("\\\\", "").replace("\\{", "").replace("\\}", "").replace("\\$", "")


def latex_problems(s, is_pure_tex):
    """Kembalikan daftar masalah LaTeX pada satu string (kosong = beres)."""
    problems = []
    t = strip_escaped(s)
    depth = 0
    for ch in t:
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth < 0:
                break
    if depth != 0:
        problems.append("kurung kurawal tidak seimbang")
    if not is_pure_tex:
        # `$$` dihitung sebagai dua `$`, jadi paritas tetap berlaku.
        if t.count("$") % 2:
            problems.append("jumlah tanda $ ganjil (rumus tidak tertutup)")
    lefts = len(re.findall(r"\\left(?![a-zA-Z])", s))
    rights = len(re.findall(r"\\right(?![a-zA-Z])", s))
    if lefts != rights:
        problems.append(f"\\left ({lefts}) ≠ \\right ({rights})")
    begins = re.findall(r"\\begin\{([a-zA-Z*]+)\}", s)
    ends = re.findall(r"\\end\{([a-zA-Z*]+)\}", s)
    if sorted(begins) != sorted(ends):
        problems.append(f"\\begin{{{','.join(begins)}}} ≠ \\end{{{','.join(ends)}}}")
    return problems


PURE_TEX_KEYS = {"tex"}


def check_text_hygiene(name, tree, rep):
    control_bad, latex_bad = [], []
    for path, s in walk_strings(tree):
        m = CONTROL_RE.search(s)
        if m:
            control_bad.append(f"{path}: U+{ord(m.group()):04X} dekat «{s[max(0, m.start() - 12):m.start() + 12]!r}»")
        m = EATEN_N_RE.search(s)
        if m:
            control_bad.append(f"{path}: \"\\n{m.group(1)}\" — garis miring LaTeX termakan?")
        leaf = path.rsplit(".", 1)[-1]
        for problem in latex_problems(s, leaf in PURE_TEX_KEYS):
            latex_bad.append(f"{path}: {problem}")
    rep.check(not control_bad, f"{name}: tanpa karakter kendali", "; ".join(control_bad[:5]))
    rep.check(not latex_bad, f"{name}: LaTeX seimbang", "; ".join(latex_bad[:5]))


# ============================================================
# 1. Manifest ↔ berkas bab
# ============================================================

def check_manifest(rep):
    rep.start("1. Manifest lessons.json ↔ data/chapters/*.json")
    lessons = load_json(DATA / "lessons.json", rep)
    if lessons is None:
        return None, {}
    check_text_hygiene("lessons.json", lessons, rep)

    chapters = lessons.get("chapters", [])
    rep.check(len(chapters) == EXPECTED_CHAPTERS, f"{EXPECTED_CHAPTERS} bab", f"ada {len(chapters)}")
    rep.check([c.get("number") for c in chapters] == list(range(1, len(chapters) + 1)),
              "Nomor bab berurutan 1..n", str([c.get("number") for c in chapters]))
    ids = [c.get("id") for c in chapters]
    rep.check(len(set(ids)) == len(ids), "Id bab unik", str(ids))

    chapter_data = {}
    total = 0
    for c in chapters:
        cid = c.get("id")
        src = c.get("src", "")
        path = ROOT / src
        if not rep.check(path.is_file(), f"{cid}: berkas src ada", src):
            continue
        rep.check(src == f"data/chapters/{cid}.json", f"{cid}: src bernama sesuai id", src)
        data = load_json(path, rep)
        if data is None:
            continue
        chapter_data[cid] = data
        check_text_hygiene(path.name, data, rep)
        rep.check(data.get("id") == cid, f"{cid}: id berkas = id manifest", str(data.get("id")))

        order = c.get("subtopicOrder", [])
        subs = [s.get("id") for s in data.get("subtopics", [])]
        total += len(order)
        rep.check(len(set(order)) == len(order), f"{cid}: subtopicOrder tanpa duplikat", str(order))
        missing = [s for s in order if s not in subs]
        orphan = [s for s in subs if s not in order]
        rep.check(not missing, f"{cid}: setiap id subtopicOrder punya sub-topik", f"tidak ada: {missing}")
        rep.check(not orphan, f"{cid}: setiap sub-topik tercantum di subtopicOrder", f"yatim: {orphan}")
        if not missing and not orphan and subs != order:
            rep.warn(f"{cid}: urutan berkas berbeda dari subtopicOrder",
                     "aplikasi memakai subtopicOrder; samakan agar mudah dibaca")

        for s in data.get("subtopics", []):
            sid = s.get("id")
            for key in ("id", "title", "materi", "simulation", "quiz"):
                rep.check(key in s, f"{cid}/{sid}: kolom `{key}` ada")
            bad_blocks = []
            for i, block in enumerate(s.get("materi", [])):
                req = MATERI_TYPES.get(block.get("t"))
                if req is None:
                    bad_blocks.append(f"materi[{i}] tipe tak dikenal {block.get('t')!r}")
                    continue
                for field in req:
                    if not block.get(field):
                        bad_blocks.append(f"materi[{i}] ({block['t']}) tanpa `{field}`")
            rep.check(not bad_blocks, f"{cid}/{sid}: blok materi sah", "; ".join(bad_blocks))

    rep.check(total == EXPECTED_SUBTOPICS, f"{EXPECTED_SUBTOPICS} sub-topik", f"ada {total}")
    return lessons, chapter_data


# ============================================================
# 2 + 3. Registry engine & kalimat toast
# ============================================================

def find_matching(text, open_pos):
    """Indeks kurung penutup yang berpasangan dengan kurung di `open_pos`."""
    pairs = {"{": "}", "(": ")", "[": "]"}
    stack = []
    i = open_pos
    quote = None
    while i < len(text):
        ch = text[i]
        if quote:
            if ch == "\\":
                i += 2
                continue
            if ch == quote:
                quote = None
            elif quote == "`" and text.startswith("${", i):
                # Interpolasi di template literal: lompati sebagai ekspresi.
                end = find_matching(text, i + 1)
                if end < 0:
                    return -1
                i = end + 1
                continue
        elif ch in "'\"`":
            quote = ch
        elif text.startswith("//", i):
            nl = text.find("\n", i)
            i = len(text) if nl < 0 else nl
            continue
        elif text.startswith("/*", i):
            end = text.find("*/", i)
            i = len(text) if end < 0 else end + 2
            continue
        elif ch in pairs:
            stack.append(pairs[ch])
        elif ch in ")]}":
            if not stack or stack.pop() != ch:
                return -1
            if not stack:
                return i
        i += 1
    return -1


def top_level_keys(obj_src):
    """Kunci tingkat atas sebuah literal objek JS `{ a: 1, b, 'c': 2 }`."""
    body = obj_src[1:-1]
    keys, depth, token = [], 0, ""
    parts = []
    quote = None
    for ch in body:
        if quote:
            token += ch
            if ch == quote:
                quote = None
            continue
        if ch in "'\"`":
            quote = ch
        elif ch in "{[(":
            depth += 1
        elif ch in "}])":
            depth -= 1
        elif ch == "," and depth == 0:
            parts.append(token)
            token = ""
            continue
        token += ch
    parts.append(token)
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if part.startswith("..."):
            keys.append(None)                      # spread: tak bisa dipastikan statis
            continue
        m = re.match(r"""^['"]?([A-Za-z_$][\w$]*)['"]?\s*(:|$)""", part)
        if m:
            keys.append(m.group(1))
    return keys


def enclosing_object_end(text, pos):
    """Dari `pos` di dalam literal objek, cari posisi `}` penutup objek itu."""
    depth = 0
    i = pos
    quote = None
    while i < len(text):
        ch = text[i]
        if quote:
            if ch == "\\":
                i += 2
                continue
            if ch == quote:
                quote = None
        elif ch in "'\"`":
            quote = ch
        elif ch in "{[(":
            depth += 1
        elif ch in "}])":
            if depth == 0:
                return i
            depth -= 1
        i += 1
    return len(text)


def engine_sources():
    """Peta engine → (berkas, nama kelas, sumber kelas)."""
    engines = {}
    for fname in ENGINE_FILES:
        src = (SIM_DIR / fname).read_text(encoding="utf-8")
        m = re.search(r"export const ENGINES\s*=\s*\{", src)
        if not m:
            engines.setdefault("__missing_map__", []).append(fname)
            continue
        end = find_matching(src, m.end() - 1)
        entries = re.findall(r"([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)", src[m.end():end])
        # Sumber kelas = dari `class X` sampai deklarasi kelas berikutnya / peta ENGINES.
        starts = [(mm.start(), mm.group(1)) for mm in re.finditer(r"^(?:export\s+)?class\s+(\w+)", src, re.M)]
        bounds = {}
        for idx, (pos, cname) in enumerate(starts):
            stop = starts[idx + 1][0] if idx + 1 < len(starts) else m.start()
            bounds[cname] = src[pos:stop]
        for engine, cname in entries:
            engines[engine] = (fname, cname, bounds.get(cname))
    return engines


def toast_uses(class_src):
    """
    Semua titik pemakaian kunci toast di sumber kelas.
    Kembalikan daftar (kunci, himpunan kunci nilai | None bila tak bisa dipastikan).

    Pola yang dikenali:
      { toast: 'k', values: { a, b } }          → hasil check()
      { toast: c ? 'k1' : 'k2', values: {...} }  → kedua cabang
      successToast: 'k', successValues: {...}
      this.msg('k', {...}) · this.reject(el, 'k', {...})
      caseSuccessKey(): return 'k'               → tanpa nilai
    """
    uses = []

    def values_after(anchor_end, value_key):
        end = enclosing_object_end(class_src, anchor_end)
        segment = class_src[anchor_end:end]
        vm = re.search(r"\b" + value_key + r"\s*:\s*", segment)
        if not vm:
            return set()
        start = anchor_end + vm.end()
        if class_src[start] != "{":
            return None                            # variabel, bukan literal
        close = find_matching(class_src, start)
        keys = top_level_keys(class_src[start:close + 1])
        return None if None in keys else set(keys)

    for m in re.finditer(r"\btoast\s*:\s*([^,}\n]+)", class_src):
        names = re.findall(r"'([A-Za-z_]\w*)'", m.group(1))
        vals = values_after(m.end(), "values")
        for name in names:
            uses.append((name, vals))
    for m in re.finditer(r"\bsuccessToast\s*:\s*([^,}\n]+)", class_src):
        names = re.findall(r"'([A-Za-z_]\w*)'", m.group(1))
        vals = values_after(m.end(), "successValues")
        for name in names:
            uses.append((name, vals))
    for m in re.finditer(r"\bthis\.(msg|reject)\(", class_src):
        close = find_matching(class_src, m.end() - 1)
        args = class_src[m.end():close]
        names = re.findall(r"'([A-Za-z_]\w*)'", args.split("{", 1)[0])
        brace = args.find("{")
        if brace >= 0:
            obj_start = m.end() + brace
            keys = top_level_keys(class_src[obj_start:find_matching(class_src, obj_start) + 1])
            vals = None if None in keys else set(keys)
        else:
            vals = set()
        for name in names[:1]:
            uses.append((name, vals))
    cm = re.search(r"caseSuccessKey\([^)]*\)\s*\{", class_src)
    if cm:
        body = class_src[cm.end():find_matching(class_src, cm.end() - 1)]
        for name in re.findall(r"'([A-Za-z_]\w*)'", body):
            uses.append((name, set()))
    return uses


def check_engines_and_toasts(chapter_data, rep):
    rep.start("2. Registry engine ↔ simulation.engine")
    engines = engine_sources()
    rep.check("__missing_map__" not in engines, "Setiap berkas sim*.js mengekspor ENGINES",
              str(engines.get("__missing_map__")))
    engines.pop("__missing_map__", None)

    index_src = (SIM_DIR / "index.js").read_text(encoding="utf-8")
    for fname in ENGINE_FILES:
        rep.check(f"from './{fname}'" in index_src, f"index.js mengimpor ENGINES dari {fname}")

    used = {}
    for cid, data in chapter_data.items():
        for s in data.get("subtopics", []):
            engine = (s.get("simulation") or {}).get("engine")
            used.setdefault(engine, []).append(f"{cid}/{s.get('id')}")

    rep.check(len(engines) == EXPECTED_ENGINES, f"{EXPECTED_ENGINES} engine terdaftar", f"ada {len(engines)}")
    rep.check(len(used) == EXPECTED_ENGINES, f"{EXPECTED_ENGINES} engine dipakai JSON", f"ada {len(used)}")
    unregistered = sorted(k for k in used if k not in engines)
    unused = sorted(k for k in engines if k not in used)
    dup = {k: v for k, v in used.items() if len(v) > 1}
    rep.check(not unregistered, "Setiap simulation.engine terdaftar", f"tak terdaftar: {unregistered}")
    rep.check(not unused, "Setiap engine terdaftar dipakai sub-topik", f"menganggur: {unused}")
    rep.check(not dup, "Satu engine = satu sub-topik", str(dup))
    no_class = sorted(k for k, v in engines.items() if v[2] is None)
    rep.check(not no_class, "Kelas setiap engine ditemukan di berkasnya", str(no_class))

    rep.start("3. Kalimat toast simulasi & placeholder {{kunci}}")
    for cid, data in chapter_data.items():
        for s in data.get("subtopics", []):
            sim = s.get("simulation") or {}
            engine = sim.get("engine")
            label = f"{s.get('id')} ({engine})"
            toasts = sim.get("toasts") or {}
            rep.check(isinstance(toasts, dict) and toasts, f"{label}: punya toasts")
            rep.check(bool(toasts.get("success")), f"{label}: toast `success` ada")
            empty = [k for k, v in toasts.items() if not isinstance(v, str) or not v.strip()]
            rep.check(not empty, f"{label}: tidak ada toast kosong", str(empty))
            if engine not in engines or engines[engine][2] is None:
                continue

            uses = toast_uses(engines[engine][2])
            referenced = {name for name, _ in uses}
            missing = sorted(referenced - set(toasts))
            rep.check(not missing, f"{label}: setiap kunci toast yang dipakai engine ada di JSON",
                      f"hilang: {missing}")
            # Kalimat yang tidak pernah dipakai engine = data mati: ikut terunduh
            # setiap sub-topik dibuka, dan menyesatkan guru yang menyuntingnya.
            unused = sorted(set(toasts) - referenced - FRAMEWORK_TOAST_KEYS)
            rep.check(not unused, f"{label}: tidak ada kalimat toast yang tak terpakai", str(unused))

            unfilled, unverifiable, extra = [], [], []
            for name, vals in uses:
                template = toasts.get(name)
                if not isinstance(template, str):
                    continue
                wanted = set(PLACEHOLDER_RE.findall(template))
                if vals is None:
                    if wanted:
                        unverifiable.append(name)
                    continue
                if wanted - vals:
                    unfilled.append(f"{name}: {{{{{', '.join(sorted(wanted - vals))}}}}} tanpa nilai")
                if vals - wanted:
                    extra.append(f"{name}: {sorted(vals - wanted)}")
            rep.check(not unfilled, f"{label}: setiap placeholder diberi nilai engine", "; ".join(unfilled))
            if unverifiable:
                rep.warn(f"{label}: nilai placeholder tak bisa diperiksa statis", str(sorted(set(unverifiable))))
            if extra:
                rep.warn(f"{label}: engine mengirim nilai yang tidak dipakai kalimat", "; ".join(extra))

            # `{{ kunci-rusak }}` tidak cocok dengan pola fillTemplate dan tampil
            # apa adanya di layar siswa.
            # Placeholder sah dibuang dulu: `\vec{{{nama}}}` = kurung LaTeX
            # yang membungkus placeholder, dan itu benar.
            malformed = sorted(k for k, t in toasts.items()
                               if isinstance(t, str) and MALFORMED_RE.search(PLACEHOLDER_RE.sub("", t)))
            rep.check(not malformed, f"{label}: tidak ada placeholder cacat", str(malformed))


# ============================================================
# 5 + 7. Soal
# ============================================================

# Angka kunci yang muncul di toastWrong tetapi SUDAH ditinjau manual dan bukan
# kebocoran. Setiap entri wajib beralasan; jangan dipakai untuk membungkam.
LEAK_REVIEWED = {
    "b3_05_1": "angka 4 di kalimat adalah |b|² yang DITOLAK sebagai penyebut; "
               "kebetulan sama dengan kunci, tidak menyatakan hasil",
}

NUM_RE = re.compile(r"(?<![\w.,^_{])-?\d+(?:[.,]\d+)?(?![\w.,]*\d)")


def numbers_in(text):
    found = set()
    for token in NUM_RE.findall(text or ""):
        try:
            found.add(float(token.replace(",", ".")))
        except ValueError:
            pass
    return found


def check_question(q, where, rep, subtopic_ids):
    qid = q.get("id", "?")
    problems = []
    for key in ("id", "input_type", "subtopic", "prompt", "after", "explanation", "toastWrong"):
        if not q.get(key) and q.get(key) != 0:
            problems.append(f"kolom `{key}` kosong/hilang")
    itype = q.get("input_type")
    if itype not in INPUT_TYPES:
        problems.append(f"input_type tak dikenal {itype!r}")
    if q.get("subtopic") not in subtopic_ids:
        problems.append(f"subtopic {q.get('subtopic')!r} tidak dikenal")

    options = q.get("options")
    if itype in ("single_choice", "multi_select"):
        if not isinstance(options, list) or len(options) < 2:
            problems.append("opsi kurang dari 2")
            options = []
        if len(options) > len(HURUF):
            problems.append(f"opsi lebih dari {len(HURUF)}")
        for i, opt in enumerate(options):
            keys = set(opt) if isinstance(opt, dict) else set()
            if not keys or not keys <= OPTION_KEYS or len(keys) != 1:
                problems.append(f"opsi[{i}] berkunci {sorted(keys)} (wajib tepat satu dari label/tex)")
            elif not str(next(iter(opt.values()))).strip():
                problems.append(f"opsi[{i}] kosong")
        texts = [json.dumps(o, sort_keys=True, ensure_ascii=False) for o in options]
        if len(set(texts)) != len(texts):
            problems.append("ada opsi kembar")
    elif options is not None:
        problems.append(f"tipe {itype} tidak memakai `options`")

    if itype == "single_choice":
        idx = q.get("answerIndex")
        if not isinstance(idx, int) or isinstance(idx, bool) or not 0 <= idx < len(options or []):
            problems.append(f"answerIndex {idx!r} di luar rentang 0..{len(options or []) - 1}")
        if "answerIndices" in q or "answer" in q:
            problems.append("single_choice memuat kunci tipe lain")
    elif itype == "multi_select":
        idx = q.get("answerIndices")
        if not isinstance(idx, list) or not idx:
            problems.append("answerIndices kosong")
        else:
            if any(not isinstance(i, int) or isinstance(i, bool) or not 0 <= i < len(options) for i in idx):
                problems.append(f"answerIndices {idx} di luar rentang")
            if len(set(idx)) != len(idx):
                problems.append(f"answerIndices {idx} kembar")
        pof = q.get("perOptionFeedback")
        if pof is not None and len(pof) != len(options):
            problems.append(f"perOptionFeedback {len(pof)} ≠ opsi {len(options)}")
    elif itype == "mathpad":
        ans = q.get("answer")
        if not isinstance(ans, (int, float)) or isinstance(ans, bool):
            problems.append(f"answer {ans!r} bukan angka")
        tol = q.get("tolerance")
        if not isinstance(tol, (int, float)) or tol < 0 or tol > 0.5:
            problems.append(f"tolerance {tol!r} tidak wajar")
    elif itype == "matrix_input":
        rows, cols, ans = q.get("rows"), q.get("cols"), q.get("answer")
        shape_ok = (isinstance(ans, list) and len(ans) == rows
                    and all(isinstance(r, list) and len(r) == cols for r in ans))
        if not shape_ok:
            problems.append(f"answer tidak berbentuk {rows}×{cols}: {ans!r}")
        elif any(not isinstance(v, (int, float)) or isinstance(v, bool) for r in ans for v in r):
            problems.append("answer memuat bukan-angka")

    if q.get("table"):
        t = q["table"]
        if not t.get("headers") or any(len(r) != len(t["headers"]) for r in t.get("rows", [])):
            problems.append("tabel: jumlah kolom baris ≠ header")

    rep.check(not problems, f"{where}/{qid}: bentuk soal sah", "; ".join(problems))

    # --- Aksioma: kalimat salah tidak boleh membocorkan kunci ---
    leak = []
    wrong = q.get("toastWrong") or ""
    if qid in LEAK_REVIEWED:
        rep.check(True, f"{where}/{qid}: toastWrong ditinjau manual — {LEAK_REVIEWED[qid]}")
    elif itype == "mathpad" and isinstance(q.get("answer"), (int, float)):
        if float(q["answer"]) in numbers_in(wrong) and abs(float(q["answer"])) not in (0.0, 1.0, 2.0):
            leak.append(f"menyebut angka kunci {q['answer']}")
    if itype == "matrix_input" and isinstance(q.get("answer"), list):
        flat = [v for r in q["answer"] for v in r if isinstance(v, (int, float))]
        body = ",".join(str(v) for v in flat)
        compact = re.sub(r"[\s\\,;{}()$]|pmatrix|begin|end", "", wrong)
        if len(flat) > 1 and "".join(str(v) for v in flat) in compact:
            leak.append(f"menyebut vektor kunci ({body})")
    if itype == "single_choice" and isinstance(q.get("answerIndex"), int):
        letter = HURUF[q["answerIndex"]] if q["answerIndex"] < len(HURUF) else "?"
        if re.search(r"\b[Oo]psi\s+\**" + letter + r"\b", wrong):
            leak.append(f"menyebut opsi benar {letter}")
    rep.check(not leak, f"{where}/{qid}: toastWrong tidak membocorkan kunci", "; ".join(leak))


def check_questions(lessons, chapter_data, rep):
    rep.start("4. Soal Mini Kuis & bank ujian")
    subtopic_owner = {}
    for cid, data in chapter_data.items():
        for s in data.get("subtopics", []):
            subtopic_owner[s.get("id")] = cid
    all_ids = {}

    mini = 0
    for cid, data in chapter_data.items():
        for s in data.get("subtopics", []):
            quiz = s.get("quiz", [])
            rep.check(len(quiz) >= 1, f"{cid}/{s.get('id')}: Mini Kuis berisi soal", f"ada {len(quiz)}")
            for q in quiz:
                mini += 1
                all_ids.setdefault(q.get("id"), []).append(f"{cid}/{s.get('id')}")
                check_question(q, f"{cid}/{s.get('id')}", rep, subtopic_owner)
                rep.check(q.get("subtopic") == s.get("id"), f"{q.get('id')}: subtopic = sub-topik pemiliknya",
                          f"{q.get('subtopic')} ≠ {s.get('id')}")
    rep.check(mini == EXPECTED_MINI_QUIZ, f"{EXPECTED_MINI_QUIZ} soal Mini Kuis", f"ada {mini}")

    quizzes = load_json(DATA / "quizzes.json", rep)
    if quizzes is None:
        return
    check_text_hygiene("quizzes.json", quizzes, rep)
    banks = quizzes.get("banks", {})
    rep.check(set(banks) == set(EXPECTED_BANK_SIZES), "Bank ujian = 4 bab + tka_2026", str(sorted(banks)))
    chapter_ids = {c["id"] for c in (lessons or {}).get("chapters", [])}
    bank_total = 0
    for bank_id, items in banks.items():
        expected = EXPECTED_BANK_SIZES.get(bank_id)
        rep.check(len(items) == expected, f"bank {bank_id}: {expected} soal", f"ada {len(items)}")
        for q in items:
            bank_total += 1
            all_ids.setdefault(q.get("id"), []).append(f"banks.{bank_id}")
            check_question(q, f"banks.{bank_id}", rep, subtopic_owner)
            if bank_id in chapter_ids:
                owner = subtopic_owner.get(q.get("subtopic"))
                rep.check(owner == bank_id, f"{q.get('id')}: sub-topik milik bab bank ini", f"milik {owner}")
    rep.check(bank_total == EXPECTED_BANK_TOTAL, f"{EXPECTED_BANK_TOTAL} soal bank ujian", f"ada {bank_total}")

    dup = {k: v for k, v in all_ids.items() if len(v) > 1}
    rep.check(not dup, "Id soal unik di seluruh data", str(dup))

    modes = quizzes.get("modes", [])
    rep.check({m.get("id") for m in modes} == {"latihan_bab", "simulasi_tka"}, "Mode kuis: latihan_bab + simulasi_tka",
              str([m.get("id") for m in modes]))

    tka = quizzes.get("tkaSimulation", {})
    order = tka.get("questionOrder", [])
    bank = {q.get("id") for q in banks.get(tka.get("bankId"), [])}
    rep.check(tka.get("bankId") in banks, "tkaSimulation.bankId menunjuk bank yang ada", str(tka.get("bankId")))
    rep.check(tka.get("questionCount") == len(order), "questionCount = panjang questionOrder",
              f"{tka.get('questionCount')} ≠ {len(order)}")
    rep.check(len(set(order)) == len(order), "questionOrder tanpa duplikat", str(order))
    rep.check(all(qid in bank for qid in order), "Setiap id questionOrder ada di bank TKA",
              str([qid for qid in order if qid not in bank]))
    rep.check(set(order) == bank, "questionOrder memakai seluruh bank TKA",
              f"tidak dipakai: {sorted(bank - set(order))}")


def main():
    rep = Report(verbose="--verbose" in sys.argv or "-v" in sys.argv)
    print("Validasi data Ruang Vektor")
    lessons, chapter_data = check_manifest(rep)
    check_engines_and_toasts(chapter_data, rep)
    check_questions(lessons, chapter_data, rep)

    print("\n" + "=" * 60)
    print(f"LOLOS {rep.passed} · GAGAL {len(rep.failed)} · PERINGATAN {len(rep.warned)}")
    if rep.failed:
        print("\nDaftar GAGAL:")
        for item in rep.failed:
            print(f"  - {item}")
    return 1 if rep.failed else 0


if __name__ == "__main__":
    sys.exit(main())
