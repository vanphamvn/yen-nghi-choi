#!/usr/bin/env python3
"""Normalize 4x4 transparent RGBA sheets for Yencafeday 2D.

Requires Pillow: python -m pip install Pillow
Example:
 python game/preview-2d/tools/normalize_sprites.py \
   game/preview-2d/assets/sprites/barista.png --output /tmp/yen-sprites/barista

This tool NEVER overwrites the input. Individual frames retain the 256x320
canvas and bottom-center pivot. Fully transparent pixels receive nearest
opaque RGB values to avoid dark halos during texture interpolation.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from PIL import Image

SHEET_SIZE = (1024, 1280)
FRAME_SIZE = (256, 320)
COLUMNS = ROWS = 4
PIVOT = (128, 312)


def normalize_frame(frame: Image.Image, alpha_cutoff: int = 3, bleed: int = 4) -> Image.Image:
    rgba = frame.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    # Preserve antialiased outlines, only remove almost-invisible specks.
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a <= alpha_cutoff:
                pixels[x, y] = (r, g, b, 0)
    # Extend edge RGB into transparent pixels. Alpha stays exactly 0.
    # Working from a fixed frontier avoids moving the visible silhouette.
    opaque = [(x, y) for y in range(height) for x in range(width) if pixels[x, y][3] > 0]
    frontier = opaque
    seen = set(opaque)
    for _ in range(bleed):
        next_frontier = []
        for x, y in frontier:
            color = pixels[x, y][:3]
            for nx, ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in seen:
                    seen.add((nx, ny))
                    if pixels[nx, ny][3] == 0:
                        pixels[nx, ny] = (*color, 0)
                        next_frontier.append((nx, ny))
        frontier = next_frontier
    return rgba


def process(source: Path, output: Path, cutoff: int, bleed: int) -> dict:
    with Image.open(source) as img:
        if img.size != SHEET_SIZE:
            raise ValueError(f"Expected {SHEET_SIZE}, got {img.size}: {source}")
        sheet = img.convert("RGBA")
    output.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", SHEET_SIZE)
    metrics = []
    for index in range(COLUMNS * ROWS):
        x, y = index % COLUMNS * FRAME_SIZE[0], index // COLUMNS * FRAME_SIZE[1]
        frame = normalize_frame(sheet.crop((x,y,x+FRAME_SIZE[0],y+FRAME_SIZE[1])),cutoff,bleed)
        bbox = frame.getchannel("A").getbbox()
        frame.save(output / f"frame-{index:02}.png")
        atlas.paste(frame,(x,y))
        metrics.append({"index":index,"alphaBounds":list(bbox) if bbox else None})
    atlas.save(output / f"{source.stem}.png",optimize=True)
    meta={"source":source.name,"sheetSize":SHEET_SIZE,"grid":[COLUMNS,ROWS],
          "frameSize":FRAME_SIZE,"pivot":PIVOT,"frames":metrics,
          "alphaCutoff":cutoff,"rgbBleedPixels":bleed}
    (output/"frames.json").write_text(json.dumps(meta,indent=2)+"\n",encoding="utf-8")
    return meta


if __name__ == "__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source",type=Path)
    parser.add_argument("--output",type=Path,required=True)
    parser.add_argument("--alpha-cutoff",type=int,default=3)
    parser.add_argument("--bleed",type=int,default=4)
    args=parser.parse_args()
    if not 0 <= args.alpha_cutoff <= 20 or not 0 <= args.bleed <= 16:
        parser.error("alpha-cutoff must be 0..20 and bleed 0..16")
    result=process(args.source,args.output,args.alpha_cutoff,args.bleed)
    print(f"Wrote 16 frames and atlas to {args.output} (pivot {result['pivot']})")
