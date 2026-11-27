"""Crop and convert the 2025 team photos to grayscale WebP.

Usage: python3 -I scripts/process-photos.py <source_dir> <out_dir>
Square crops feed avatars and cards; 4:5 crops feed the profile sheet.
"""
import os
import sys
from PIL import Image, ImageOps, ImageEnhance

SRC, OUT = sys.argv[1], sys.argv[2]
# (file, id, square box, portrait box) in source pixels
CROPS = [
    ("Nasir.png", "nasir", (0, 48, 1536, 1584), (0, 0, 1536, 1920)),
    ("Fakhruddin.png", "fakhru", (0, 0, 719, 719), (36, 0, 611, 719)),
    ("Oli.png", "oli", (0, 132, 1536, 1668), (0, 36, 1536, 1956)),
    ("Moin.png", "moin", (100, 0, 1108, 1008), (201, 0, 1007, 1008)),
    ("Atif.png", "atif", (0, 0, 3007, 3007), (300, 0, 2706, 3007)),
]

def mono(im):
    g = ImageOps.grayscale(im.convert("RGB"))
    g = ImageOps.autocontrast(g, cutoff=0.5)
    g = ImageEnhance.Contrast(g).enhance(1.06)
    return g

os.makedirs(OUT, exist_ok=True)
for name, pid, sq, pt in CROPS:
    im = Image.open(os.path.join(SRC, name))
    s = mono(im.crop(sq))
    for size in (160, 320, 640):
        s.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, f"{pid}-{size}.webp"), quality=82, method=6)
    p = mono(im.crop(pt)).resize((720, 900), Image.LANCZOS)
    p.save(os.path.join(OUT, f"{pid}-portrait.webp"), quality=82, method=6)
    print(pid, "ok")
