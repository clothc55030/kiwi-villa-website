import glob
import re

files = glob.glob("new*.html")

old_link = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&family=Noto+Serif+TC:wght@300;400;600&display=swap" rel="stylesheet">'
new_link = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&family=LXGW+WenKai+TC:wght@300;400&family=Noto+Sans+TC:wght@300;400;500&display=swap" rel="stylesheet">'

for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    # Update Google Fonts link
    content = content.replace(old_link, new_link)
    
    # Update CSS Variables
    content = content.replace("--font-display: 'Cormorant Garamond', serif;", "--font-display: 'Cormorant Garamond', 'LXGW WenKai TC', serif;")
    content = content.replace("--font-body: 'Inter', 'Noto Serif TC', serif;", "--font-body: 'Inter', 'Noto Sans TC', sans-serif;")
    
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)
    print(f"Patched fonts in {f}")
