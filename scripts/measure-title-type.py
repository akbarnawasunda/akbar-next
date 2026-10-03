#!/usr/bin/env python3
"""Ukur lebar kata judul dari file font yang BENAR-BENAR di-host di repo ini.

Dipakai untuk mengkalibrasi `clamp()` judul saat font judul diganti, supaya
angkanya diukur, bukan ditebak. Sumber kebenaran lebar = advance width glyph
di dalam woff2 (sama dengan yang dipakai `measureText` di kanvas/peramban,
selama tidak ada kerning kontekstual yang aktif pada teks uppercase ini).

Dipakai di Fase 6 untuk memutuskan:
  - faktor skala seluruh clamp judul (0,60), dan
  - konstanta HERO_WORD_EM di server/mobileLayout.test.ts (11,463).

Jalankan:  pip install fonttools brotli && python3 scripts/measure-title-type.py
"""
from __future__ import annotations

import sys

try:
    from fontTools.ttLib import TTFont
except ImportError:  # pragma: no cover - alat bantu, bukan bagian build
    sys.exit("Butuh fontTools: pip install fonttools brotli")

FONTS = {
    "clash-display-600 (lama, H1)": "client/public/assets/fonts/fontshare/clash-display-600.woff2",
    "clash-display-700 (lama, tes)": "client/public/assets/fonts/fontshare/clash-display-700.woff2",
    "syne-800 (baru, H1)": "client/public/assets/fonts/fontsource/syne-800.woff2",
}
WORDS = ["NAWASUNDA.", "NAWASUNDA", "AKBAR", "AKBAR NAWASUNDA"]
TRACKING = [0.0, -0.05, -0.06]


def em_width(path: str, text: str, tracking: float) -> float:
    font = TTFont(path)
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    total = 0
    for char in text:
        glyph = cmap.get(ord(char))
        if glyph is None:
            raise SystemExit(f"{path}: glyph {char!r} tidak ada")
        total += hmtx[glyph][0]
    return total / upem + tracking * len(text)


def main() -> None:
    for label, path in FONTS.items():
        print(f"\n{label}  ({path})")
        for word in WORDS:
            row = "  ".join(
                f"ls{track:+.2f}em = {em_width(path, word, track):7.3f}em"
                for track in TRACKING
            )
            print(f'  {word:<18} {row}')


if __name__ == "__main__":
    main()
