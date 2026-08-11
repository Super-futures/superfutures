#!/usr/bin/env python3
"""
Superfutures — Open Graph share card generator.

Produces og-image.png at 1200x630. Flat violet ground, true white type,
no gradient, no blur, no shadow. The structure carries the far read:
one thesis line at display scale, a mono metadata strip, the swatch mark.

FONTS
-----
This writes with whatever it finds in FONT_DISPLAY / FONT_MONO below.
Before shipping, point these at the real faces so the card matches the site:

    FONT_DISPLAY = "/path/to/Archivo_Condensed-Bold.ttf"   (or Archivo wdth 125, wght 800)
    FONT_MONO    = "/path/to/DMMono-Regular.ttf"

Then:  python3 tools/make-og-image.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

# ── Palette: taken from styles.css, unmodulated ──────────────────────
BRAND = (0x8A, 0x3F, 0xE8)   # --c-brand
WHITE = (0xFF, 0xFF, 0xFF)
SOFT = (0xF6, 0xF0, 0xFD)   # --ink-soft on violet (4.75:1)

W, H = 1200, 630
PAD = 76

# ── Fonts: replace these two paths with Archivo and DM Mono ──────────
FONT_DISPLAY = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

THESIS = ["The model and the world",
          "it governs are not",
          "the same thing."]
WORDMARK = "Superfutures"
META = "INDEPENDENT RESEARCH PRACTICE  ·  TĀMAKI MAKAURAU AUCKLAND"


def load(path, size):
    if not os.path.exists(path):
        raise SystemExit(f"Font not found: {path}\nEdit FONT_DISPLAY / FONT_MONO at the top of this file.")
    return ImageFont.truetype(path, size)


def main():
    img = Image.new("RGB", (W, H), BRAND)
    d = ImageDraw.Draw(img)

    f_display = load(FONT_DISPLAY, 78)
    f_mark = load(FONT_DISPLAY, 34)
    f_meta = load(FONT_MONO, 19)

    # ── swatch mark + wordmark, top left ──
    sq = 20
    d.rectangle([PAD, PAD, PAD + sq, PAD + sq], fill=WHITE)
    d.text((PAD + sq + 16, PAD - 6), WORDMARK, font=f_mark, fill=WHITE)

    # ── thesis, set to the bottom-left corner: the far read ──
    line_h = 92
    block_h = line_h * len(THESIS)
    y = H - PAD - block_h - 58
    for line in THESIS:
        d.text((PAD, y), line, font=f_display, fill=WHITE)
        y += line_h

    # ── mono metadata strip, sitting on a hard rule ──
    rule_y = H - PAD - 34
    d.line([(PAD, rule_y), (W - PAD, rule_y)], fill=WHITE, width=2)
    d.text((PAD, rule_y + 12), META, font=f_meta, fill=SOFT)

    out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "og-image.png")
    img.save(out, "PNG", optimize=True)
    print(f"wrote {out}  ({W}x{H})")


if __name__ == "__main__":
    main()
