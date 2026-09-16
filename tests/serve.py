"""Server statis untuk pengembangan & pengujian — `python tests/serve.py`.

Pengganti `python -m http.server 5173` dengan SATU perbedaan: setiap
respons membawa `Cache-Control: no-cache`.

Kenapa perlu: http.server bawaan tidak mengirim header cache apa pun, jadi
peramban menyimpan modul ES secara heuristik. Terukur saat Tahap 1: setelah
jalur import app.js diperbaiki, peramban tetap menjalankan salinan LAMA dari
cache dan meminta 13 berkas yang sudah tidak ada. Uji yang berjalan di atas
kode basi tidak membuktikan apa pun (Blueprint §8.1).

`no-cache` bukan `no-store`: peramban tetap boleh menyimpan, tetapi wajib
bertanya ulang ke server (If-Modified-Since) sebelum memakainya — murah di
jaringan lokal, dan selalu benar.
"""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".json": "application/json",
        ".woff2": "font/woff2",
        ".svg": "image/svg+xml",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Hanya galat yang dicatat; 200 OK memenuhi log tanpa informasi.
        if len(args) > 1 and str(args[1]).startswith(("4", "5")):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
        print(f"Ruang Vektor -> http://localhost:{PORT}  (Ctrl+C untuk berhenti)")
        httpd.serve_forever()
