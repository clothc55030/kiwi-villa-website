#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
萬泰名產代訂頁（/wantai）：從萬泰食品官網更新商品照片與介紹

做的事：
1. 讀 public/wantai.html 裡的 PMAP（價目表品名 → 萬泰官網商品網址的 handle）
2. 逐一抓 https://www.9279149.com.tw/products/<handle>.json（每次間隔約 1 秒，不要改快）
3. 照片轉成 WebP 存到 public/images/wantai/：
     <商品id>-<照片id>.webp    商品介紹用（500px，每個商品最多 4 張）
     <商品id>-<照片id>-t.webp  第一張的列表縮圖（144px 正方形）
   檔名含萬泰的照片 id：萬泰換照片就會換檔名，不會被 /images/* 的一年快取卡住
4. 改寫 wantai.html 裡 CATALOG:BEGIN 與 CATALOG:END 之間的資料，並刪掉不再用到的舊照片

任何一個商品抓失敗就整批不寫入（頁面維持原樣），把錯誤訊息貼給 Claude 即可。

用法（專案根目錄）：python tools/update-wantai-catalog.py
需要：Python 3.8+、Pillow（pip install pillow）
"""
import base64
import html
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow：請先執行 pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "public" / "wantai.html"
IMG_DIR = ROOT / "public" / "images" / "wantai"
SHOP = "https://www.9279149.com.tw"
UA = "Mozilla/5.0 (compatible; KiwiVilla-catalog/1.0; +https://www.kiwi-villa.com/wantai)"
MAX_PHOTOS = 4
BIG, THUMB = 500, 144


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read()
            return data if binary else data.decode("utf-8")
        except Exception:
            if attempt == 2:
                raise
            time.sleep(3 + attempt * 4)


def lines_of(fragment):
    """HTML 片段 → 去掉標籤的文字行（空行不留）"""
    s = re.sub(r"<br\s*/?>", "\n", fragment or "", flags=re.I)
    s = re.sub(r"</(p|li|div|h\d)>", "\n", s, flags=re.I)
    s = html.unescape(re.sub(r"<[^>]+>", "", s)).replace("\r", "")
    out = [re.sub(r"\s+", " ", ln).strip() for ln in s.split("\n")]
    return [ln for ln in out if ln]


def photo_pairs(d):
    """把 photos（有 id）和 photo_urls（有網址）對起來：用網址裡編碼的檔名比對，不靠順序"""
    photos = [p.get("photo", p) for p in d.get("photos") or []]
    pairs = []
    for u in d.get("photo_urls") or []:
        url = u.get("original") or u.get("grande") or ""
        try:
            token = url.split("/media/", 1)[1].split("?", 1)[0]
            decoded = base64.urlsafe_b64decode(token + "=" * (-len(token) % 4)).decode("utf-8", "replace")
        except Exception:
            continue
        match = next((p for p in photos if p.get("product_image_uid") and p["product_image_uid"] in decoded), None)
        if match:
            pairs.append((match.get("position") or 0, match["id"], "https:" + url if url.startswith("//") else url))
    pairs.sort()
    return [(pid, url) for _, pid, url in pairs]


def to_rgb(im):
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert("RGB")


def js_value(v):
    s = json.dumps(v, ensure_ascii=False, separators=(", ", ": "))
    return s.replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def main():
    src = PAGE.read_text(encoding="utf-8")
    m = re.search(r"var PMAP = (\{.*?\});", src, re.S)
    if not m:
        sys.exit("❌ wantai.html 裡找不到 var PMAP = {...};")
    pmap = json.loads(m.group(1))
    handles = sorted(set(pmap.values()))
    print(f"PMAP：{len(pmap)} 個品項 → {len(handles)} 個萬泰商品\n")

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    catalog, keep, failed = {}, set(), []
    for i, h in enumerate(handles, 1):
        try:
            d = json.loads(fetch(f"{SHOP}/products/{urllib.parse.quote(h)}.json"))
            brief = " ".join(lines_of(d.get("brief"))) or " ".join(lines_of(d.get("body_html")))
            spec = []
            for o in d.get("other_descriptions") or []:
                if (o.get("setting_name") or "").endswith("_spec"):
                    spec += lines_of(o.get("body_html"))
            ids = []
            for photo_id, url in photo_pairs(d)[:MAX_PHOTOS]:
                big = IMG_DIR / f"{d['id']}-{photo_id}.webp"
                if not big.exists():
                    im = to_rgb(Image.open(io.BytesIO(fetch(url, binary=True))))
                    im.thumbnail((BIG, BIG), Image.LANCZOS)
                    im.save(big, "WEBP", quality=76, method=6)
                    time.sleep(0.5)
                keep.add(big.name)
                if not ids:
                    thumb = IMG_DIR / f"{d['id']}-{photo_id}-t.webp"
                    if not thumb.exists():
                        im = to_rgb(Image.open(big))
                        w, hh = im.size
                        side = min(w, hh)
                        left, top = (w - side) // 2, (hh - side) // 2
                        im = im.crop((left, top, left + side, top + side)).resize((THUMB, THUMB), Image.LANCZOS)
                        im.save(thumb, "WEBP", quality=78, method=6)
                    keep.add(thumb.name)
                ids.append(photo_id)
            catalog[h] = {"id": d["id"], "t": (d.get("title") or h).strip(), "s": (d.get("slogan") or "").strip(),
                          "b": brief, "spec": spec, "img": ids}
            print(f"  ✓ {i:>2}/{len(handles)} {h}（照片 {len(ids)} 張）")
        except Exception as e:
            failed.append(h)
            print(f"  ✗ {i:>2}/{len(handles)} {h}：{type(e).__name__} {e}")
        time.sleep(0.8)

    if failed:
        sys.exit(f"\n💥 有 {len(failed)} 個商品抓失敗（{'、'.join(failed)}），這次不寫入。")

    rows = sorted(catalog.items())
    block = "  var CATALOG = {\n" + ",\n".join(f"    {js_value(h)}: {js_value(v)}" for h, v in rows) + "\n  };"
    pattern = re.compile(r"(/\* CATALOG:BEGIN[^\n]*\n).*?(\n[ \t]*/\* CATALOG:END \*/)", re.S)
    if not pattern.search(src):
        sys.exit("❌ wantai.html 裡找不到 CATALOG:BEGIN / CATALOG:END 標記")
    new = pattern.sub(lambda mm: mm.group(1) + block + mm.group(2), src, count=1)

    # 自我檢查：資料可解析、檔案沒有被截斷（見 CLAUDE.md「檔案截斷陷阱」）
    json.loads(block.split("=", 1)[1].rsplit(";", 1)[0])
    if not new.rstrip().endswith("</html>") or "</body>" not in new:
        sys.exit("❌ 產生的 wantai.html 結尾不完整，這次不寫入。")
    with open(PAGE, "w", encoding="utf-8", newline="\n") as f:
        f.write(new)

    stale = [p for p in IMG_DIR.glob("*.webp") if p.name not in keep]
    for p in stale:
        p.unlink()
    size = sum(p.stat().st_size for p in IMG_DIR.glob("*.webp")) / 1024 / 1024
    print(f"\n🎉 已更新 {len(catalog)} 個商品；照片 {len(keep)} 個檔（{size:.1f} MB），刪除舊檔 {len(stale)} 個。")


if __name__ == "__main__":
    main()
