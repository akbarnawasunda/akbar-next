#!/usr/bin/env python3
"""Ukur lebar judul dari font self-hosted yang aktif di repo ini.

Dipakai saat menala `clamp()` Recons agar angka ukuran mengikuti metrik font,
bukan tebakan. Sumber kebenaran lebar adalah advance width glyph dalam woff2
(sama dengan yang dipakai `measureText` peramban, selama tidak ada kerning
kontekstual khusus pada teks uppercase yang diukur).

Roster yang diperiksa:
  - Recons: primary display / H1 / wordmark
  - NEXROID: secondary display / H2–H4
  - Good Times: body dan UI

Jalankan: `pip install fonttools brotli && python3 scripts/measure-title-type.py`
"""
from __future__ import annotations

import sys

try:
    from fontTools.ttLib import TTFont
except ImportError:  # pragma: no cover - alat bantu, bukan bagian build
    sys.exit("Butuh fontTools: pip install fonttools brotli")

FONTS = {
    "Recons (primary display)": "client/public/assets/fonts/fontsource/Recons-Regular.woff2",
    "NEXROID (secondary display)": "client/public/assets/fonts/fontsource/NEXROID-Regular.woff2",
    "Good Times (text/UI)": "client/public/assets/fonts/fontsource/Good Times Rg.woff2",
}
WORDS = ["NAWASUNDA.", "NAWASUNDA", "AKBAR", "AKBAR NAWASUNDA"]
TRACKING = [0.0, 0.02]


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
            print(f"  {word:<18} {row}")


if __name__ == "__main__":
    main()
