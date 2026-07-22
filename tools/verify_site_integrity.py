#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
澎湖期遇度假會館 (Kiwi Villa) - 網站完整性自動化驗證工具
檢查項目：
1. 所有 HTML 檔案閉合完整性 (</body></html>)
2. 所有 JSON-LD 結構化資料合法性 (json.loads)
3. og:image / twitter:image 副檔名守則 (不可使用 webp)
"""

import sys
import os
import glob
import re
import json

# 避免 Windows 主控台 cp950 編碼輸出問題
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def verify_site():
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    html_files = sorted(glob.glob(os.path.join(workspace_dir, "*.html")))
    
    if not html_files:
        print("❌ 未找到任何 HTML 檔案！")
        return False
        
    has_error = False
    print(f"🔍 開始驗證 {len(html_files)} 個 HTML 檔案的完整性...\n")
    
    for filepath in html_files:
        filename = os.path.basename(filepath)
        errors = []
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
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

        # 輸出結果
        if errors:
            has_error = True
            print(f"❌ [{filename}] 發現 {len(errors)} 個問題:")
            for err in errors:
                print(f"    - {err}")
        else:
            print(f"✅ [{filename}] 檢查通過 (JSON-LD: {len(json_ld_blocks)} 段)")

    print("-" * 50)
    if has_error:
        print("💥 驗證失敗！請修復上述錯誤後再進行 commit 或部署。")
        return False
    else:
        print("🎉 所有 HTML 檔案完整性與語法驗證通過！")
        return True

if __name__ == "__main__":
    success = verify_site()
    sys.exit(0 if success else 1)
