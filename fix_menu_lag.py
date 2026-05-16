import os
import re

files = ['index.html', 'intro.html', 'rooms.html', 'location.html', 'reviews.html', 'faq.html', 'policy.html']

css_to_add = """
        .fullscreen-menu {
            will-change: opacity;
            transform: translateZ(0);
        }
        
        .menu-link {
            transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease !important;
            will-change: opacity, transform;
        }

        .menu-links a:nth-child(1) { transition-delay: 0.1s, 0.1s, 0s; }
        .menu-links a:nth-child(2) { transition-delay: 0.15s, 0.15s, 0s; }
        .menu-links a:nth-child(3) { transition-delay: 0.2s, 0.2s, 0s; }
        .menu-links a:nth-child(4) { transition-delay: 0.25s, 0.25s, 0s; }
        .menu-links a:nth-child(5) { transition-delay: 0.3s, 0.3s, 0s; }
        .menu-links a:nth-child(6) { transition-delay: 0.35s, 0.35s, 0s; }
        .menu-links a:nth-child(7) { transition-delay: 0.4s, 0.4s, 0s; }
        .menu-links a:nth-child(8) { transition-delay: 0.45s, 0.45s, 0s; }
"""

for file in files:
    if not os.path.exists(file): continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Remove inline transition-delay
    content = re.sub(r'\s*style="transition-delay:\s*[\d\.]+s"', '', content)
    
    # We need to inject the CSS.
    # The easiest way is to add it before the closing </style> tag.
    if '</style>' in content:
        # First, remove the old transition from .menu-link if possible, or just let !important override it.
        # Let's replace the old transition just to be clean:
        content = content.replace('transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);', '')
        
        # Inject our new CSS rules
        content = content.replace('</style>', css_to_add + '\n    </style>')
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Menu lag fix applied successfully to all files.")
