import os
import re

files = ['index.html', 'intro.html', 'rooms.html', 'location.html', 'reviews.html', 'faq.html', 'policy.html']

# High-performance Base64 Noise Image (100x100) instead of expensive SVG filter
NOISE_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAAAAP////////////////////////8zX/HkAAAACHRSTlMAf4+Pj4+Pj/BP/0AAAAAoSURBVDjLxdGxDQAgDATAxX7/nbxgI0TqS6z70rZfXdd1Xdd1Xdc9G2kEwQv6rJAAAAAASUVORK5CYII="

for file in files:
    if not os.path.exists(file): continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace expensive SVG noise with lightweight PNG noise
    svg_noise_pattern = r'background-image:\s*url\("data:image/svg\+xml,[^"]+"\);'
    content = re.sub(svg_noise_pattern, f'background-image: url("{NOISE_PNG}");\n            background-repeat: repeat;\n            opacity: 0.03;\n            will-change: transform;', content)
    
    # 2. Fix the transition overriding issue (remove !important from transition)
    content = content.replace('color 0.2s ease !important;', 'color 0.2s ease;')
    
    # Also ensure there's no rogue !important blocking the delays
    # (Just in case)
    
    # 3. Add explicit display: none to noise-overlay when menu is open to save GPU
    if 'body.menu-open .noise-overlay' not in content:
        if '</style>' in content:
            content = content.replace('</style>', '''
        body.menu-open .noise-overlay {
            display: none;
        }
    </style>''')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Performance patches applied.")
