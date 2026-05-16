import os
import re

files = [f for f in os.listdir('.') if f.startswith('new') and f.endswith('.html')]

# Definitions for replacements
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Image fallback in newindex.html
    if file == 'newindex.html':
        content = re.sub(
            r'onerror="this\.src=\'https://images\.unsplash\.com/[^\']+\'"',
            r'onerror="this.src=\'images/hero/main-hall-environment-optimized.webp\'"',
            content
        )

    # 2. Slider buttons in newrooms.html (and any other file that might have them)
    content = content.replace(
        '<button class="slider-btn slider-prev">',
        '<button class="slider-btn slider-prev" aria-label="上一張圖片">'
    )
    content = content.replace(
        '<button class="slider-btn slider-next">',
        '<button class="slider-btn slider-next" aria-label="下一張圖片">'
    )

    # 3. Logo link aria-label
    content = content.replace(
        '<a href="newindex.html" class="logo">',
        '<a href="newindex.html" class="logo" aria-label="返回 Kiwi Villa 首頁">'
    )

    # 4. Menu button aria-label (it already has text "Menu", but we can enhance it)
    content = content.replace(
        '<button class="menu-btn" id="menu-toggle">Menu</button>',
        '<button class="menu-btn" id="menu-toggle" aria-label="展開或關閉選單">Menu</button>'
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Accessibility and image fallback patches applied successfully.")
