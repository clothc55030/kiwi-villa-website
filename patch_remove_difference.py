import glob

files = [f for f in glob.glob("new*.html") if f != "newindex.html"]

for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    # 1. Remove mix-blend-mode from CSS nav block
    content = content.replace("mix-blend-mode: difference;", "mix-blend-mode: normal;")
    
    # 2. Replace JS mixBlendMode difference with normal
    content = content.replace("nav.style.mixBlendMode = 'difference';", "nav.style.mixBlendMode = 'normal';")
    
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)
    print(f"Removed difference blend mode from {f}")
