import os
import re

files = ['index.html', 'intro.html', 'rooms.html', 'location.html', 'reviews.html', 'faq.html', 'policy.html']

# This is the definitive, clean, merged menu CSS block to inject
CLEAN_MENU_CSS = """        /* ========================
           MENU SYSTEM (DEFINITIVE)
           ======================== */

        /* Fullscreen overlay */
        .fullscreen-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: var(--color-ocean);
            z-index: 90;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            /* Use visibility instead of pointer-events for better perf */
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
                        visibility 0.45s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: opacity;
        }

        .fullscreen-menu.open {
            visibility: visible;
            opacity: 1;
        }

        /* Menu item list */
        .menu-links {
            display: flex;
            flex-direction: column;
            gap: clamp(0.5rem, 2vh, 1.5rem);
            text-align: center;
        }

        /* SINGLE, COMPLETE .menu-link definition */
        .menu-link {
            font-family: var(--font-display);
            font-size: clamp(1.5rem, 5vh, 3rem);
            color: var(--color-bg);
            text-decoration: none;
            font-style: italic;
            display: block;
            opacity: 0;
            transform: translateY(20px);
            /* Stagger animation uses opacity+transform, hover uses color.
               Use separate transition so hover never inherits stagger delay. */
            transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                        color 0.15s ease;
        }

        /* Reveal state (when menu is open) */
        .fullscreen-menu.open .menu-link {
            opacity: 1;
            transform: translateY(0);
        }

        /* Stagger delays — only for opacity & transform (index 0 & 1), NOT color (index 2) */
        .menu-links a:nth-child(1) { transition-delay: 0.05s, 0.05s, 0s; }
        .menu-links a:nth-child(2) { transition-delay: 0.10s, 0.10s, 0s; }
        .menu-links a:nth-child(3) { transition-delay: 0.15s, 0.15s, 0s; }
        .menu-links a:nth-child(4) { transition-delay: 0.20s, 0.20s, 0s; }
        .menu-links a:nth-child(5) { transition-delay: 0.25s, 0.25s, 0s; }
        .menu-links a:nth-child(6) { transition-delay: 0.30s, 0.30s, 0s; }
        .menu-links a:nth-child(7) { transition-delay: 0.35s, 0.35s, 0s; }
        .menu-links a:nth-child(8) { transition-delay: 0.40s, 0.40s, 0s; }

        /* Hover: instant color change, no delay whatsoever */
        .menu-link:hover {
            color: var(--color-accent);
            transition-delay: 0s, 0s, 0s;
        }

        /* When menu closes, reset stagger so items slide out cleanly */
        .fullscreen-menu:not(.open) .menu-link {
            transition-delay: 0s, 0s, 0s;
        }

        /* Navbar overrides when menu is open */
        body.menu-open nav {
            mix-blend-mode: normal !important;
            color: var(--color-bg) !important;
            background: transparent !important;
            box-shadow: none !important;
        }

        body.menu-open .logo-img {
            filter: brightness(0) invert(1) !important;
        }

        /* Hide noise when menu open (avoids compositing overhead) */
        body.menu-open .noise-overlay {
            display: none;
        }
"""

for file in files:
    if not os.path.exists(file):
        print(f"Skipping (not found): {file}")
        continue

    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # STEP 1 — Remove ALL previous conflicting menu-related CSS blocks
    patterns_to_purge = [
        # Standalone .fullscreen-menu { ... } blocks (not .fullscreen-menu.open)
        r'        /\* 全螢幕選單 \*/\s*\n        \.fullscreen-menu \{[^}]+\}\s*\n\s*\.fullscreen-menu\.open \{[^}]+\}\s*\n\s*\.menu-links \{[^}]+\}\s*\n\s*\.menu-link \{[^}]+\}\s*\n\s*\.fullscreen-menu\.open \.menu-link \{[^}]+\}\s*\n\s*\.menu-link:hover \{[^}]+\}\s*\n\s*body\.menu-open nav \{[^}]+\}\s*\n\s*\s*\n\s*body\.menu-open \{[^}]+\}\s*\n\s*body\.menu-open \.logo-img \{[^}]+\}',
        # Injected duplicate from fix_menu_lag.py
        r'\s*\.fullscreen-menu \{\s*\n\s*will-change: opacity;\s*\n\s*transform: translateZ\(0\);\s*\n\s*\}\s*\n\s*\.menu-link \{\s*\n[^}]+\}\s*\n(\s*\.menu-links a:nth-child\(\d\) \{[^\}]+\}\s*\n)+',
        # Injected nth-child delays only block
        r'(\s*\.menu-links a:nth-child\(\d\) \{ transition-delay: [^}]+ \}\s*\n)+',
        # Injected body.menu-open .noise-overlay
        r'\s*body\.menu-open \.noise-overlay \{\s*\n\s*display: none;\s*\n\s*\}',
        # Previous will-change lines on fullscreen-menu
        r'\s*\.fullscreen-menu \{\s*\n\s*will-change: opacity;\s*\n\s*transform: translateZ\(0\);\s*\n\s*\}',
    ]

    for pattern in patterns_to_purge:
        content = re.sub(pattern, '', content, flags=re.MULTILINE)

    # STEP 2 — Locate the old menu block and replace it entirely.
    # Strategy: find the comment "/* 全螢幕選單 */" block and remove everything up to
    # (and including) the body.menu-open .logo-img block, which immediately follows.
    old_menu_block_pattern = re.compile(
        r'/\* 全螢幕選單 \*/'
        r'.*?'
        r'body\.menu-open \.logo-img \{[^}]+\}',
        re.DOTALL
    )
    if old_menu_block_pattern.search(content):
        content = old_menu_block_pattern.sub('', content)

    # Also remove inline transition-delay styles that were once in HTML attributes
    content = re.sub(r'\s*style="transition-delay:\s*[\d.]+s"', '', content)

    # STEP 3 — Remove any residual duplicate .menu-link or .fullscreen-menu blocks
    # that were added by the patch scripts (they appear AFTER the closing @media block)
    # We identify them by looking for the specific injected pattern
    injected_block_pattern = re.compile(
        r'/\* MENU SYSTEM \(DEFINITIVE\) \*/.*?</style>',
        re.DOTALL
    )
    # Remove previously injected "DEFINITIVE" blocks if any (idempotent)
    if injected_block_pattern.search(content):
        content = injected_block_pattern.sub('</style>', content)

    # STEP 4 — Inject our single clean menu block just before </style>
    content = content.replace('</style>', CLEAN_MENU_CSS + '\n    </style>', 1)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] {file} - menu CSS rebuilt cleanly")

print("\nAll done. Menu CSS is now conflict-free.")
