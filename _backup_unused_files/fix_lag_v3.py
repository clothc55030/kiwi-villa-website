import os
import re

files = ['index.html', 'intro.html', 'rooms.html', 'location.html', 'reviews.html', 'faq.html', 'policy.html']

for file in files:
    if not os.path.exists(file): continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove body.menu-open { overflow: hidden; } to prevent scrollbar layout thrashing
    content = re.sub(r'body\.menu-open\s*\{\s*overflow:\s*hidden;\s*\}', '', content)
    
    # 2. Add transition-delay: 0s !important to hover to guarantee snappiness
    if 'transition-delay: 0s !important;' not in content:
        content = content.replace(
            '.menu-link:hover {',
            '.menu-link:hover {\n            transition-delay: 0s !important;'
        )
        
    # 3. Add overscroll-behavior: contain to fullscreen menu to prevent scrolling underlying body
    if 'overscroll-behavior: contain;' not in content:
        content = content.replace(
            '.fullscreen-menu.open {',
            '.fullscreen-menu.open {\n            overscroll-behavior: contain;'
        )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("V3 patches applied.")
