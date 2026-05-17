import os
import re

files = ['index.html', 'intro.html', 'rooms.html', 'location.html', 'reviews.html', 'faq.html', 'policy.html']

# The fix strategy:
# 1. Stagger delays should ONLY apply when menu is .open (not on close)
# 2. On close, all items should transition simultaneously with 0s delay
# 3. Hover color must be instant (0s delay, short duration)
# 4. Remove noise-overlay's will-change: transform (not needed for static element)

# Regex to find the stagger nth-child block we injected previously
NTH_CHILD_PATTERN = re.compile(
    r'(\s*\.menu-links a:nth-child\(\d\) \{ transition-delay: [^\}]+ \}\s*\n?)+',
    re.MULTILINE
)

# Regex to find the close reset block
CLOSE_RESET_PATTERN = re.compile(
    r'\s*\/\* When menu closes[^}]+\}[^\n]*\n',
    re.DOTALL
)

# The correct stagger block — delays only when OPEN
CORRECT_STAGGER = """
        /* Stagger delays apply ONLY on open, not on close */
        .fullscreen-menu.open .menu-links a:nth-child(1) { transition-delay: 0.05s, 0.05s, 0s; }
        .fullscreen-menu.open .menu-links a:nth-child(2) { transition-delay: 0.10s, 0.10s, 0s; }
        .fullscreen-menu.open .menu-links a:nth-child(3) { transition-delay: 0.15s, 0.15s, 0s; }
        .fullscreen-menu.open .menu-links a:nth-child(4) { transition-delay: 0.20s, 0.20s, 0s; }
        .fullscreen-menu.open .menu-links a:nth-child(5) { transition-delay: 0.25s, 0.25s, 0s; }
        .fullscreen-menu.open .menu-links a:nth-child(6) { transition-delay: 0.30s, 0.30s, 0s; }
        .fullscreen-menu.open .menu-links a:nth-child(7) { transition-delay: 0.35s, 0.35s, 0s; }
        .fullscreen-menu.open .menu-links a:nth-child(8) { transition-delay: 0.40s, 0.40s, 0s; }

        /* On close: all items exit simultaneously, no delay */
        .fullscreen-menu:not(.open) .menu-link {
            transition-delay: 0s !important;
        }
"""

for filename in files:
    if not os.path.exists(filename):
        print(f"[SKIP] {filename} not found")
        continue

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove old bare nth-child stagger blocks (both .menu-links and .fullscreen-menu.open versions)
    content = re.sub(
        r'(\s*(\.fullscreen-menu\.open )?\.menu-links a:nth-child\(\d\) \{ transition-delay: [^\}]+ \}\s*\n?)+',
        '\n',
        content
    )

    # 2. Remove old "not(.open)" reset blocks (may have been added by previous scripts)
    content = re.sub(
        r'\s*\/\* When menu closes.*?\}\s*\n',
        '\n',
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r'\s*\.fullscreen-menu:not\(\.open\) \.menu-link \{[^}]+\}',
        '',
        content
    )

    # 3. Remove will-change: transform from .noise-overlay (it's a static element)
    content = re.sub(
        r'(\s*will-change: transform;\s*\n)',
        '\n',
        content
    )

    # 4. Inject the correct stagger block before </style>
    # First check if our stagger is already there correctly
    if '.fullscreen-menu.open .menu-links a:nth-child(1)' not in content:
        content = content.replace('    </style>', CORRECT_STAGGER + '\n    </style>', 1)
    else:
        print(f"[INFO] {filename} already has correct stagger, skipping inject")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] {filename}")

print("\nDone. Menu open/close lag fixed across all pages.")
