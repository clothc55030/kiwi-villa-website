#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
為全站 HTML 檔案更新 no-js 防禦 fallback 與 reveal 安全兜底機制
"""

import sys
import glob
import os
import re

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def patch_html(filepath):
    filename = os.path.basename(filepath)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content

    # 1. 替換 <html...>
    if 'class="no-js"' not in content:
        content = re.sub(r'<html([^>]*)>', r'<html\1 class="no-js">', content, count=1)
        content = content.replace('class="no-js" class="no-js"', 'class="no-js"')

    # 2. 插入 top head script
    head_script = '<script>document.documentElement.classList.replace("no-js","js");</script>'
    if head_script not in content:
        content = content.replace('<head>', f'<head>\n    {head_script}')

    # 3. 插入 CSS fallback
    css_fallback = """
        .no-js .reveal-up {
            opacity: 1 !important;
            transform: none !important;
            visibility: visible !important;
        }"""
    
    if '.no-js .reveal-up' not in content:
        # 尋找 .reveal-up 區塊
        if '.reveal-up {' in content:
            content = content.replace('.reveal-up {', f'.no-js .reveal-up {{\n            opacity: 1 !important;\n            transform: none !important;\n            visibility: visible !important;\n        }}\n        .reveal-up {{', 1)
        elif '</style>' in content:
            content = content.replace('</style>', f'{css_fallback}\n    </style>', 1)

    # 4. 插入 reveal timeout 兜底
    timeout_js = """
            // 3秒超時安全兜底：防止滾動事件或 Observer 異常時內容隱形
            setTimeout(function() {
                document.querySelectorAll('.reveal-up:not(.active)').forEach(function(el) {
                    el.classList.add('active');
                });
            }, 3000);"""
    
    if 'document.querySelectorAll(\'.reveal-up:not(.active)\')' not in content and 'reveal-up' in content:
        if 'const reveals = document.querySelectorAll(\'.reveal-up\');' in content:
            content = content.replace(
                'const reveals = document.querySelectorAll(\'.reveal-up\');',
                f'const reveals = document.querySelectorAll(\'.reveal-up\');\n{timeout_js}'
            )

    if content != original_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ 已更新 [{filename}] 的 no-js 防禦與 reveal 兜底機制")
    else:
        print(f"ℹ️ [{filename}] 無需更新或已包含防禦機制")

if __name__ == "__main__":
    html_files = sorted(glob.glob("*.html"))
    for fp in html_files:
        patch_html(fp)
