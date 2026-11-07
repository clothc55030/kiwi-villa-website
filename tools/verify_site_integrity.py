#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
澎湖期遇度假會館 (Kiwi Villa) - 網站完整性自動化驗證工具
每一頁：
1. 所有 HTML 檔案閉合完整性 (</body></html>)
2. 所有 JSON-LD 結構化資料合法性 (json.loads)
3. og:image / twitter:image 副檔名守則 (不可使用 webp)
4. <img> 的 src / srcset 指到的本機圖檔都存在
5. 沒有 Font Awesome 圖示標籤（2026-11 起圖示改內嵌 SVG，<i class="fas ..."> 不會顯示）
全站（2026-11 加入）：
6. 8 個內容頁的共用區塊一致：全螢幕選單、頁尾、手機浮動列、GA4 點擊追蹤
7. 每個網頁路徑在 _headers 都有 Cache-Control
8. 站內連結都對得到檔案、_redirects 或頁內的 id
9. sitemap.xml 的 lastmod 不早於該頁最後一次 commit（需要完整 git 歷史；淺層 clone 會略過）
10. 房型價格一致（平日起價；房型卡若另標旺季起價，llms.txt 也要一樣）：房型頁 ↔ 房型一覽、首頁房型卡、llms.txt
"""

import sys
import os
import glob
import re
import json
import subprocess
from urllib.parse import unquote

# 避免 Windows 主控台 cp950 編碼輸出問題
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

SHARED_PAGES = ['index', 'intro', 'rooms', 'location', 'reviews', 'faq', 'policy', 'moses']


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def verify_site():
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    html_files = sorted(glob.glob(os.path.join(workspace_dir, "public", "*.html"))) or sorted(glob.glob(os.path.join(workspace_dir, "*.html")))

    if not html_files:
        print("❌ 未找到任何 HTML 檔案！")
        return False

    has_error = False
    print(f"🔍 開始驗證 {len(html_files)} 個 HTML 檔案的完整性...\n")

    for filepath in html_files:
        filename = os.path.basename(filepath)
        errors = []

        content = read(filepath)

        # 1. 檢查結尾閉合
        stripped = content.rstrip()
        if not (stripped.endswith("</html>") and "</body>" in content):
            errors.append("檔案未正常閉合 (缺少 </body> 或 </html>，可能遭到意外截斷)")

        # 2. 檢查 JSON-LD
        json_ld_blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.S)
        for idx, block in enumerate(json_ld_blocks, start=1):
            try:
                json.loads(block)
            except json.JSONDecodeError as e:
                errors.append(f"JSON-LD 區塊 #{idx} 格式無效 ({e})")

        # 3. 檢查 og:image / twitter:image
        og_images = re.findall(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', content, re.I)
        og_images += re.findall(r'<meta\s+name=["\']twitter:image["\']\s+content=["\']([^"\']+)["\']', content, re.I)
        for img_url in og_images:
            if img_url.lower().endswith(".webp"):
                errors.append(f"社群分享圖不可使用 WebP 格式 ({img_url})")

        # 4. 檢查 <img> 的 src / srcset 指到的本機圖檔都存在（例如房型照的 -1600／-2400 大圖）
        missing = []
        for tag in re.findall(r'<img\b[^>]*>', content, re.I):
            urls = re.findall(r'\ssrc=["\']([^"\']+)["\']', tag, re.I)
            for srcset in re.findall(r'\ssrcset=["\']([^"\']+)["\']', tag, re.I):
                urls += [c.split()[0] for c in srcset.split(',') if c.strip()]
            for url in urls:
                # 外部網址、data: 內嵌圖、JS 樣板字串裡的變數不檢查
                if re.match(r'(?:[a-z][a-z0-9+.-]*:|//)', url, re.I) or '${' in url or '{{' in url:
                    continue
                path = unquote(url.split('#')[0].split('?')[0])
                if not os.path.isfile(os.path.join(os.path.dirname(filepath), path.lstrip('/'))) and path not in missing:
                    missing.append(path)
        for path in missing:
            errors.append(f"圖片檔不存在 ({path})")

        # 5. Font Awesome 已移除：圖示要用內嵌 SVG（複製同頁現有的 <svg class="icon" ...>），樣式 .icon 要在
        if re.search(r'<i\s+class="(?:fas|fab|far|fa|fa-solid|fa-brands|fa-regular)\b', content):
            errors.append('找到 Font Awesome 圖示標籤 <i class="fa...">：2026-11 起已改內嵌 SVG，這種寫法不會顯示')
        if '<svg class="icon' in content and not re.search(r'\.icon\s*\{', content):
            errors.append('頁面用了 <svg class="icon">，但 <style> 裡沒有 .icon 樣式（圖示會變得很大）')

        # 輸出結果
        if errors:
            has_error = True
            print(f"❌ [{filename}] 發現 {len(errors)} 個問題:")
            for err in errors:
                print(f"    - {err}")
        else:
            print(f"✅ [{filename}] 檢查通過 (JSON-LD: {len(json_ld_blocks)} 段)")

    print("-" * 50)
    site_errors = verify_sitewide(workspace_dir)
    if site_errors:
        has_error = True
        print(f"❌ [全站] 發現 {len(site_errors)} 個問題:")
        for err in site_errors:
            print(f"    - {err}")
    else:
        print("✅ [全站] 共用區塊、快取標頭、站內連結、sitemap 日期、房型價格檢查通過")

    print("-" * 50)
    if has_error:
        print("💥 驗證失敗！請修復上述錯誤後再進行 commit 或部署。")
        return False
    else:
        print("🎉 所有 HTML 檔案完整性與語法驗證通過！")
        return True


def _norm(s):
    return re.sub(r'\s+', ' ', s).strip()


def _shared_blocks(content):
    pats = {
        '全螢幕選單': r'<div class="fullscreen-menu".*?</div>\s*</div>',
        '頁尾': r'<footer>.*?</footer>',
        '手機浮動列': r'<div class="mobile-cta-bar".*?</div>',
        'GA4 點擊追蹤': r'<script>\s*// 轉換追蹤（GA4 事件）.*?</script>',
    }
    out = {}
    for name, pat in pats.items():
        m = re.search(pat, content, re.S)
        out[name] = _norm(m.group(0)) if m else None
    return out


def _room_prices_from_rooms_page(rooms):
    """房號 → (房名, 平日起價, 旺季起價或 None)。價格標「平日 NT$… 起」（Ricky 2026-11-07 定的標準）。"""
    prices = {}
    for m in re.finditer(r'<article class="room-showcase[^"]*" id="room-(\d+)">(.*?)</article>', rooms, re.S):
        name = re.search(r'<h2 class="room-name">(.*?)</h2>', m.group(2), re.S)
        text = re.sub(r'<[^>]+>', '', m.group(2))
        price = re.search(r'平日 NT\$([\d,]+) 起', text)
        peak = re.search(r'旺季 NT\$([\d,]+) 起', text)
        if name and price:
            prices[m.group(1)] = (re.sub(r'<[^>]+>', '', name.group(1)).strip(), price.group(1),
                                  peak.group(1) if peak else None)
    return prices


def verify_sitewide(workspace_dir):
    errors = []
    public = os.path.join(workspace_dir, 'public')
    pages = {os.path.splitext(os.path.basename(p))[0]: read(p) for p in glob.glob(os.path.join(public, '*.html'))}

    # 6. 共用區塊一致（以 index.html 為準，比對時忽略空白差異）
    if all(p in pages for p in SHARED_PAGES):
        base = _shared_blocks(pages['index'])
        for name, block in base.items():
            if block is None:
                errors.append(f'index.html 找不到共用區塊「{name}」')
        for page in SHARED_PAGES[1:]:
            blocks = _shared_blocks(pages[page])
            for name, block in blocks.items():
                if base[name] is not None and block != base[name]:
                    errors.append(f'{page}.html 的「{name}」與 index.html 不一致（共用區塊要 8 頁一起改）')

    # 7. 每個網頁路徑在 _headers 都要有 Cache-Control（Cloudflare 會把多條規則的同名標頭串起來，所以不放在 /*）
    headers_path = os.path.join(public, '_headers')
    if os.path.isfile(headers_path):
        rules, cur = {}, None
        for line in read(headers_path).splitlines():
            if not line.strip() or line.lstrip().startswith('#'):
                continue
            if not line[0].isspace():
                cur = line.strip()
                rules.setdefault(cur, [])
            elif cur:
                rules[cur].append(line.strip().lower())
        for page in sorted(pages):
            if page == '404':
                continue
            route = '/' if page == 'index' else '/' + page
            if not any(h.startswith('cache-control:') for h in rules.get(route, [])):
                errors.append(f'_headers 沒有 {route} 的 Cache-Control（新增頁面要補一條）')

    # 8. 站內連結：/開頭的連結要對得到檔案、頁面或 _redirects；#錨點要有對應的 id
    redirects = set()
    redirects_path = os.path.join(public, '_redirects')
    if os.path.isfile(redirects_path):
        for line in read(redirects_path).splitlines():
            if line.strip() and not line.lstrip().startswith('#'):
                redirects.add(line.split()[0])

    def page_of(path):
        if path in ('', '/'):
            return 'index'
        name = path.strip('/')
        if name.endswith('.html'):
            name = name[:-5]
        return name if name in pages else None

    for page, content in sorted(pages.items()):
        bad = []
        for href in re.findall(r'<a\b[^>]*?\shref="([^"]+)"', content):
            href = href.replace('&amp;', '&')
            if href.startswith('#'):
                frag, target = href[1:], page
            elif href.startswith('/') and not href.startswith('//'):
                path, _, frag = href.partition('#')
                path = unquote(path.split('?')[0])
                target = page_of(path)
                if target is None:
                    if path in redirects or os.path.isfile(os.path.join(public, path.lstrip('/'))):
                        continue
                    bad.append(f'{href}（找不到頁面或檔案）')
                    continue
            else:
                continue
            if frag and not re.search(r'\sid="%s"' % re.escape(frag), pages[target]):
                bad.append(f'{href}（{target}.html 沒有 id="{frag}"）')
        for b in sorted(set(bad)):
            errors.append(f'{page}.html 的站內連結 {b}')

    # 9. sitemap.xml 的 lastmod 不能早於該頁最後一次 commit（Google 只在 lastmod 一直準確時才採用）
    sitemap_path = os.path.join(public, 'sitemap.xml')
    try:
        shallow = subprocess.run(['git', 'rev-parse', '--is-shallow-repository'], cwd=workspace_dir,
                                 capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.SubprocessError):
        shallow = None
    if os.path.isfile(sitemap_path):
        if shallow is None or shallow.returncode != 0:
            print('ℹ️  不是 git 工作目錄，略過 sitemap 日期檢查')
        elif shallow.stdout.strip() == 'true':
            print('ℹ️  淺層 clone 沒有完整歷史，略過 sitemap 日期檢查')
        else:
            for loc, lastmod in re.findall(r'<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>', read(sitemap_path)):
                route = re.sub(r'^https?://[^/]+', '', loc) or '/'
                page = page_of(route)
                if page is None:
                    errors.append(f'sitemap.xml 的 {loc} 對不到任何頁面')
                    continue
                last = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', f'public/{page}.html'], cwd=workspace_dir,
                                      capture_output=True, text=True, timeout=30).stdout.strip()
                if last and last > lastmod[:10]:
                    errors.append(f'sitemap.xml 的 {loc} lastmod 是 {lastmod}，但這頁 {last} 有改過（改頁面時一起更新日期）')

    # 10. 房型價格：房型頁的每間房（平日起價；若另標旺季起價也比對）↔ 房型一覽、首頁房型卡、llms.txt
    if 'rooms' in pages:
        prices = _room_prices_from_rooms_page(pages['rooms'])
        if len(prices) < 6:
            errors.append('房型頁找不到 6 種房型的「平日 NT$… 起」價格')
        for room, price in re.findall(r'<a href="#room-(\d+)">.*?</a></th>(?:<td>[^<]*</td>){2}<td>NT\$([\d,]+)</td>', pages['rooms']):
            if room in prices and prices[room][1] != price:
                errors.append(f'房型一覽的 {room} 寫 NT${price}，房型卡寫 NT${prices[room][1]}')
        for room, card in re.findall(r'<a class="home-room[^"]*" href="/rooms#room-(\d+)">(.*?)</a>', pages.get('index', ''), re.S):
            if room not in prices:
                continue
            card = re.sub(r'<[^>]+>', '', card)
            price = re.search(r'平日 NT\$([\d,]+) 起', card)
            peak = re.search(r'旺季 NT\$([\d,]+) 起', card)
            if not price:
                errors.append(f'首頁房型卡 {room} 找不到「平日 NT$… 起」')
            elif price.group(1) != prices[room][1]:
                errors.append(f'首頁房型卡 {room} 寫 NT${price.group(1)}，房型頁寫 NT${prices[room][1]}')
            if peak and peak.group(1) != prices[room][2]:
                errors.append(f'首頁房型卡 {room} 旺季寫 NT${peak.group(1)}，房型頁寫 {prices[room][2] and "NT$" + prices[room][2]}')
        llms_path = os.path.join(public, 'llms.txt')
        if os.path.isfile(llms_path):
            llms = read(llms_path)
            for room, (name, price, peak) in prices.items():
                line = next((ln for ln in llms.splitlines() if ln.startswith('- ' + name)), None)
                if line is None:
                    errors.append(f'llms.txt 找不到「{name}」這一行')
                    continue
                if f'平日 NT${price} 起' not in line:
                    errors.append(f'llms.txt 的「{name}」平日價格與房型頁（NT${price}）不同')
                llms_peak = re.search(r'旺季 NT\$([\d,]+) 起', line)
                if (llms_peak.group(1) if llms_peak else None) != peak:
                    errors.append(f'llms.txt 的「{name}」旺季價格與房型頁不同（房型頁：{peak and "NT$" + peak or "沒寫"}）')
    return errors


if __name__ == "__main__":
    success = verify_site()
    sys.exit(0 if success else 1)
