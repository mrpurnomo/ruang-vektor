# -*- coding: utf-8 -*-
"""Bangun arsip soal (hardcopy guru) Ruang Vektor dari data JSON.

    python tests/archive_soal.py

Menghasilkan tiga berkas di `content/`:

  · QUIZ_ARCHIVE.md       — bank ujian "Latihan per Bab" (quizzes.json, 4 bab)
  · TKA_ARCHIVE.md        — set Latihan Soal TKA (urutan tetap tkaSimulation)
  · MINI_KUIS_ARCHIVE.md  — Mini Kuis setiap sub-topik (data/chapters/*.json)

⚠️ Ketiganya DIBANGKITKAN, bukan ditulis tangan. Menyuntingnya langsung akan
hilang pada pembangkitan berikutnya — ubah JSON-nya, lalu jalankan ulang skrip
ini. Dengan begitu arsip guru tidak akan pernah menyimpang dari soal yang
benar-benar dilihat siswa (PRD §2, persona Guru).
"""
import io
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUIZZES = os.path.join(ROOT, "data", "quizzes.json")
LESSONS = os.path.join(ROOT, "data", "lessons.json")
OUT_DIR = os.path.join(ROOT, "content")

HURUF = "ABCDEFGHIJ"

TIPE = {
    "single_choice": "Pilihan ganda (satu jawaban benar)",
    "multi_select": "Pilih semua jawaban benar",
    "mathpad": "Isian angka (papan angka)",
    "matrix_input": "Isian vektor kolom",
}

PERINGATAN = [
    "> ⚠️ **Berkas ini DIBANGKITKAN dari data JSON.** Jangan disunting langsung —",
    "> suntinganmu akan hilang saat dibangkitkan ulang. Ubah JSON-nya, lalu jalankan",
    "> `python tests/archive_soal.py`.",
]


def vektor_kolom_tex(m):
    """`matrix_input` di Ruang Vektor selalu vektor kolom n×1."""
    baris = " \\\\ ".join(" & ".join(str(v) for v in row) for row in m)
    return f"\\begin{{pmatrix}} {baris} \\end{{pmatrix}}"


def opsi_teks(opt):
    return f"${opt['tex']}$" if opt.get("tex") else opt.get("label", "")


def kunci_ringkas(q):
    t = q["input_type"]
    if t == "single_choice":
        return HURUF[q["answerIndex"]]
    if t == "multi_select":
        return ", ".join(HURUF[i] for i in q["answerIndices"])
    if t == "matrix_input":
        return "(" + ", ".join(str(r[0]) for r in q["answer"]) + ")"
    return str(q["answer"])


def tulis_soal(out, nomor, q, level="###"):
    """Satu soal lengkap dengan opsi dan kunci jawabannya."""
    judul = f"{level} Soal {nomor}"
    if q.get("source"):
        judul += f" · {q['source']}"
    out.append(judul)
    out.append("")
    out.append(f"- **ID:** `{q['id']}`")
    out.append(f"- **Tipe:** {TIPE.get(q['input_type'], q['input_type'])}")
    if q.get("subtopic"):
        out.append(f"- **Sub-topik:** `{q['subtopic']}`")
    out.append("")
    out.append(q["prompt"])
    out.append("")

    if q.get("table"):
        t = q["table"]
        out.append("| " + " | ".join(t["headers"]) + " |")
        out.append("|" + "---|" * len(t["headers"]))
        for row in t["rows"]:
            out.append("| " + " | ".join(str(c) for c in row) + " |")
        out.append("")

    if q.get("tex"):
        out.append(f"$$ {q['tex']} $$")
        out.append("")

    if q.get("after"):
        out.append(q["after"])
        out.append("")

    # --- Opsi ---
    if q["input_type"] in ("single_choice", "multi_select"):
        for i, opt in enumerate(q["options"]):
            out.append(f"{HURUF[i]}. {opsi_teks(opt)}")
        out.append("")

    # --- Kunci ---
    t = q["input_type"]
    if t == "single_choice":
        i = q["answerIndex"]
        kunci = f"**{HURUF[i]}** — {opsi_teks(q['options'][i])}"
    elif t == "multi_select":
        kunci = f"**{kunci_ringkas(q)}**"
    elif t == "matrix_input":
        kunci = f"${vektor_kolom_tex(q['answer'])}$"
    else:
        kunci = f"**{q['answer']}**"

    out.append(f"> **KUNCI JAWABAN:** {kunci}")
    out.append("")

    if q.get("explanation"):
        out.append("**Pembahasan.** " + q["explanation"].replace("\n\n", " "))
        out.append("")

    if q.get("perOptionFeedback"):
        out.append("**Penjelasan per opsi:**")
        out.append("")
        for i, fb in enumerate(q["perOptionFeedback"]):
            out.append(f"- **{HURUF[i]}.** {fb}")
        out.append("")

    out.append("---")
    out.append("")


def simpan(nama, baris):
    path = os.path.join(OUT_DIR, nama)
    io.open(path, "w", encoding="utf-8", newline="\r\n").write("\n".join(baris))


def main():
    q = json.load(io.open(QUIZZES, encoding="utf-8"))
    lessons = json.load(io.open(LESSONS, encoding="utf-8"))
    judul_bab = {c["id"]: f"Bab {c['number']}: {c['title']}" for c in lessons["chapters"]}
    cfg = q["tkaSimulation"]
    bank_tka = cfg["bankId"]

    index = {}
    for bank in q["banks"].values():
        for item in bank:
            index[item["id"]] = item

    # ------------------------------------------------------------
    # 1. QUIZ_ARCHIVE.md — bank "Latihan per Bab"
    # ------------------------------------------------------------
    out = [
        "# Arsip Soal Latihan per Bab — Ruang Vektor",
        "",
        "Salinan cetak bank soal mode *Latihan per Bab* beserta **kunci jawabannya**,",
        "untuk pegangan guru.",
        "",
        *PERINGATAN,
        "",
        "Konsistensi datanya diperiksa `python tests/validate_data.py`.",
        "",
        "---",
        "",
    ]
    total = 0
    bank_bab = [b for b in q["banks"] if b != bank_tka]
    for bank_id in bank_bab:
        items = q["banks"][bank_id]
        out.append(f"## {judul_bab.get(bank_id, bank_id)}")
        out.append("")
        out.append(f"*{len(items)} soal.*")
        out.append("")
        for i, item in enumerate(items, 1):
            tulis_soal(out, i, item)
            total += 1
    out.append(f"*Total {total} soal latihan per bab.*")
    out.append("")
    simpan("QUIZ_ARCHIVE.md", out)
    print(f"QUIZ_ARCHIVE.md      : {total} soal dari {len(bank_bab)} bank")

    # ------------------------------------------------------------
    # 2. TKA_ARCHIVE.md — set Latihan Soal TKA
    # ------------------------------------------------------------
    urutan = cfg.get("questionOrder", [])
    out = [
        "# Arsip Latihan Soal TKA — Ruang Vektor",
        "",
        f"Set **{len(urutan)} soal** yang dipakai mode *{cfg.get('title', 'Latihan Soal TKA')}*,",
        f"urut persis seperti yang dilihat siswa (bank `{bank_tka}`).",
        "",
        f"*{cfg['note']}*" if cfg.get("note") else "",
        "",
        *PERINGATAN,
        "",
        "Rujukan gaya soal: `docs/Contoh_Soal_TKA_Vektor_1–3.png` dan",
        "`docs/Rincian_Vektor_TKA_Kemendikdasmen.png`.",
        "",
        "---",
        "",
    ]
    for i, qid in enumerate(urutan, 1):
        item = index.get(qid)
        if not item:
            out += [f"### Soal {i}", "", f"> ⚠️ Soal `{qid}` tidak ditemukan di bank mana pun.", "", "---", ""]
            continue
        tulis_soal(out, i, item)

    out += ["## Ringkasan Kunci Jawaban", "", "| No | ID | Tipe | Kunci |", "|---|---|---|---|"]
    for i, qid in enumerate(urutan, 1):
        item = index.get(qid)
        if not item:
            out.append(f"| {i} | `{qid}` | — | tidak ditemukan |")
            continue
        t = item["input_type"]
        out.append(f"| {i} | `{qid}` | {TIPE.get(t, t)} | **{kunci_ringkas(item)}** |")
    out.append("")
    simpan("TKA_ARCHIVE.md", out)
    print(f"TKA_ARCHIVE.md       : {len(urutan)} soal")

    # ------------------------------------------------------------
    # 3. MINI_KUIS_ARCHIVE.md — Mini Kuis per sub-topik
    # ------------------------------------------------------------
    out = [
        "# Arsip Mini Kuis — Ruang Vektor",
        "",
        "Soal Mini Kuis di akhir setiap sub-topik beserta **kunci jawabannya**.",
        "Di aplikasi, kunci & pembahasan baru tampil sesudah siswa menjawab benar",
        "atau sesudah salah ke-3 pada soal yang sama.",
        "",
        *PERINGATAN,
        "",
        "---",
        "",
    ]
    total = 0
    for c in lessons["chapters"]:
        data = json.load(io.open(os.path.join(ROOT, c["src"]), encoding="utf-8"))
        subs = {s["id"]: s for s in data["subtopics"]}
        out.append(f"## {judul_bab[c['id']]}")
        out.append("")
        for n, sid in enumerate(c["subtopicOrder"], 1):
            s = subs[sid]
            out.append(f"### {c['number']}.{n} {s['title']}")
            out.append("")
            for i, item in enumerate(s.get("quiz", []), 1):
                tulis_soal(out, i, item, level="####")
                total += 1
    out.append(f"*Total {total} soal Mini Kuis.*")
    out.append("")
    simpan("MINI_KUIS_ARCHIVE.md", out)
    print(f"MINI_KUIS_ARCHIVE.md : {total} soal dari {len(lessons['chapters'])} bab")


if __name__ == "__main__":
    main()
