import glob
import re

files = [f for f in glob.glob("new*.html") if f != "newindex.html"]

for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    # Replace initial CSS color for nav
    nav_css_pattern = re.compile(r"(nav\s*\{[^}]*?)color:\s*white;")
    content = nav_css_pattern.sub(r"\1color: var(--color-text);", content)
    
    # Replace JS color change
    # We want to replace nav.style.color = 'white'; with nav.style.color = 'var(--color-text)';
    content = content.replace("nav.style.color = 'white';", "nav.style.color = 'var(--color-text)';")
    
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)
    print(f"Patched light nav bug in {f}")
