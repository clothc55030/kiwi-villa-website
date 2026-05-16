import os
import re

files = [f for f in os.listdir('.') if f.startswith('new') and f.endswith('.html')]

replacements = {
    r'href="/intro"': r'href="newintro.html"',
    r'href="/rooms"': r'href="newrooms.html"',
    r'href="/location"': r'href="newlocation.html"',
    r'href="/reviews"': r'href="newreviews.html"',
    r'href="/faq"': r'href="newfaq.html"',
    r'href="/policy"': r'href="newpolicy.html"',
}

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Do targeted replacements
    for old, new in replacements.items():
        content = content.replace(old.replace('\\', ''), new.replace('\\', ''))
        
    # Extra check for href="/" just in case, but usually it's handled properly if we only target menu links
    # Let's replace any `href="/"` that isn't `href="/..."`
    # We can use regex for this specific case
    content = re.sub(r'href="/"', r'href="newindex.html"', content)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Successfully updated links in:", files)
