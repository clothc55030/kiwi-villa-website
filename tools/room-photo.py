#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
房型照片輸出工具：從原檔產生房型頁用的三種寬度 WebP，並印出可直接貼進 rooms.html 的 <img>。

用法（在專案根目錄）：
  python tools/room-photo.py <原檔.jpg> <房型資料夾> <檔名（不含 .webp）>

例：
  python tools/room-photo.py "C:\\Users\\wang2\\Desktop\\民宿照片\\201\\201精选\\201-臥室-04.jpg" luxuryFamily penghu-kiwi-villa-luxury-family-room11

會在 public/images/rooms/<房型資料夾>/ 寫出：
  <檔名>.webp（1008 寬，src 的預設圖）、<檔名>-1600.webp、<檔名>-2400.webp

規則（與 2026-11 房型頁全部 71 張一致）：
  - 原檔直接縮（Lanczos），不裁切、不調色；非 sRGB 的原檔（例如手機 Display P3）先轉成 sRGB
  - WebP 品質 80；壓完每像素超過 0.8 bit（石材牆、植栽等紋理很重的照片）改用 74，肉眼看不出差別
  - 不覆蓋既有檔名：/images 有一年快取，換照片請換新檔名
需要 Pillow：pip install pillow
"""

import io
import os
import re
import sys

from PIL import Image, ImageCms, ImageOps

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOMS_DIR = os.path.join(ROOT, "public", "images", "rooms")
ROOMS_HTML = os.path.join(ROOT, "public", "rooms.html")

WIDTHS = (1008, 1600, 2400)
QUALITY, QUALITY_HEAVY, BPP_CAP = 80, 74, 0.8

# sizes＝照片框經 object-fit: cover 後「實際被畫出來的寬度」（與 rooms.html 內相同，改版面要一起改）
#   照片框：桌機 寬 60%（單數房型）或 40%（雙數房型）× 高 80vh；≤1024px 寬 100% × 高 60vh；≤768px 寬 100% × 高 50vh
SIZES_LANDSCAPE = ("(max-width: 768px) 100vw, (max-width: 1024px) max(100vw, 90vh), (max-width: 1024px) 100vw, "
                   "max(min(60vw, 960px), 120vh), 120vh")
SIZES_PORTRAIT = {
    "wide": "(max-width: 1024px) 100vw, min(60vw, 960px), 60vw",                      # 單數房型（照片在 6fr 欄）
    "narrow": "(max-width: 1024px) 100vw, max(min(40vw, 640px), 53vh), 40vw",          # 雙數房型（照片在 4fr 欄）
}


def fail(msg):
    print(f"❌ {msg}")
    sys.exit(1)


def to_srgb(im):
    """套用 EXIF 旋轉；有內嵌非 sRGB 的色彩描述檔就轉成 sRGB。"""
    im = ImageOps.exif_transpose(im)
    icc = im.info.get("icc_profile")
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        if "srgb" not in ImageCms.getProfileDescription(src).lower().replace(" ", ""):
            im = ImageCms.profileToProfile(im, src, ImageCms.createProfile("sRGB"), outputMode="RGB")
    return im.convert("RGB")


def room_position(folder):
    """這個房型資料夾的照片在 rooms.html 第幾個房型區塊：單數 → wide、雙數 → narrow。"""
    try:
        html = open(ROOMS_HTML, encoding="utf-8").read()
    except OSError:
        return None
    for idx, block in enumerate(re.split(r'<article class="room-showcase', html)[1:], start=1):
        if f"images/rooms/{folder}/" in block:
            return "wide" if idx % 2 else "narrow"
    return None


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)
    src_path, folder, name = sys.argv[1], sys.argv[2], sys.argv[3]
    if name.endswith(".webp"):
        name = name[:-5]
    if not re.fullmatch(r"[a-z0-9-]+", name):
        fail(f"檔名只用小寫英文、數字和連字號：{name}")
    if not os.path.isfile(src_path):
        fail(f"找不到原檔：{src_path}")
    out_dir = os.path.join(ROOMS_DIR, folder)
    if not os.path.isdir(out_dir):
        fail(f"沒有這個房型資料夾：public/images/rooms/{folder}（現有：{', '.join(sorted(os.listdir(ROOMS_DIR)))}）")

    targets = {w: os.path.join(out_dir, name + ("" if w == 1008 else f"-{w}") + ".webp") for w in WIDTHS}
    exists = [p for p in targets.values() if os.path.exists(p)]
    if exists:
        fail("檔名已存在（/images 有一年快取，換照片請換新檔名，例如 room11 → room27）：\n    "
             + "\n    ".join(os.path.relpath(p, ROOT) for p in exists))

    im = to_srgb(Image.open(src_path))
    W, H = im.size
    print(f"原檔 {W}x{H}（{'直式' if H > W else '橫式'}）")
    dims = {}
    for w in WIDTHS:
        h = round(w * H / W)
        small = im.resize((w, h), Image.LANCZOS, reducing_gap=3.0)
        path = targets[w]
        small.save(path, "WEBP", quality=QUALITY, method=6)
        q = QUALITY
        if os.path.getsize(path) * 8 / (w * h) > BPP_CAP:
            small.save(path, "WEBP", quality=QUALITY_HEAVY, method=6)
            q = QUALITY_HEAVY
        dims[w] = (w, h)
        print(f"  ✅ {os.path.relpath(path, ROOT)}  {w}x{h}  {os.path.getsize(path) // 1024}KB  (q{q})")

    if H > W:
        pos = room_position(folder)
        if pos is None:
            print(f"⚠️ rooms.html 裡還沒有 {folder} 的照片，先用「單數房型」的直式 sizes；放進去後確認該房型是第幾個區塊。")
            pos = "wide"
        sizes = SIZES_PORTRAIT[pos]
    else:
        sizes = SIZES_LANDSCAPE
    base = f"images/rooms/{folder}/{name}"
    w0, h0 = dims[1008]
    print("\n貼進 rooms.html 該房型的 <div class=\"room-slider\"> 裡（alt 照實描述照片內容）：\n")
    print(f'                        <img width="{w0}" height="{h0}" src="{base}.webp" alt="（照實描述照片內容）"')
    print(f'                            srcset="{base}.webp 1008w, {base}-1600.webp 1600w, {base}-2400.webp 2400w"')
    print(f'                            sizes="{sizes}"')
    print('                            class="slide" loading="lazy">')
    print("\n貼好後跑 python tools/verify_site_integrity.py 確認檔案都在。")


if __name__ == "__main__":
    main()
