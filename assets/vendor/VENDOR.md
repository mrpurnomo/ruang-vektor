# Pustaka pihak ketiga (lokal)

Dimuat lokal agar aplikasi tetap jalan di lab sekolah tanpa internet
atau yang memblokir CDN (Blueprint §2.4). CDN hanya cadangan `onerror`.

| Pustaka | Versi | Sumber |
|---|---|---|
| KaTeX | 0.16.9 | cdn.jsdelivr.net/npm/katex@0.16.9/dist |
| GSAP + MotionPathPlugin | 3.12.5 | cdn.jsdelivr.net/npm/gsap@3.12.5/dist |
| Montserrat 700/800/900, Roboto 400/500/700/900, Roboto Mono 400/700 | Google Fonts | subset latin |

Hanya format **woff2** yang disimpan. Blok `src` di `katex.min.css` sudah
dipangkas ke woff2 saja; seluruh peramban target (batas `@layer`: Chrome/Edge
99+, Safari 15.4+, Firefox 97+) mendukungnya.

Jangan menyunting berkas di sini dengan tangan — unduh ulang versi yang sama.
