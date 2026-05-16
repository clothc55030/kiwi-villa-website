with open('intro.html', 'r', encoding='utf-8') as f:
    content = f.read()

print('=== Verification ===')
print('menu-link blocks:', content.count('.menu-link {'))
print('fullscreen-menu blocks:', content.count('.fullscreen-menu {'))
print('will-change occurrences:', content.count('will-change'))
print('Correct open-only stagger:', 'fullscreen-menu.open .menu-links a:nth-child(1)' in content)
print('not(.open) reset present:', 'fullscreen-menu:not(.open)' in content)
print('Hover 0s delay:', 'transition-delay: 0s, 0s, 0s' in content or '0s !important' in content)
