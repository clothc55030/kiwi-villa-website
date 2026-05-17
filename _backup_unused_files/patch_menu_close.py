import glob

files = glob.glob("new*.html")

old_css = """        body.menu-open nav {
            mix-blend-mode: normal;
            color: var(--color-bg) !important;
        }"""

new_css = """        body.menu-open nav {
            mix-blend-mode: normal !important;
            color: var(--color-bg) !important;
            background: transparent !important;
            box-shadow: none !important;
        }
        
        body.menu-open .logo-img {
            filter: brightness(0) invert(1) !important;
        }"""

for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    if "background: transparent !important;" not in content:
        # Some files might have slightly different spacing, so use replace on a smaller chunk
        # Let's do it robustly:
        content = content.replace("color: var(--color-bg) !important;", "color: var(--color-bg) !important;\n            background: transparent !important;\n            box-shadow: none !important;")
        content = content.replace("mix-blend-mode: normal;", "mix-blend-mode: normal !important;")
        
        # Add .logo-img rule right after body.menu-open { overflow: hidden; }
        if "body.menu-open .logo-img" not in content:
            content = content.replace("body.menu-open {\n            overflow: hidden;\n        }", "body.menu-open {\n            overflow: hidden;\n        }\n\n        body.menu-open .logo-img {\n            filter: brightness(0) invert(1) !important;\n        }")
        
        with open(f, "w", encoding="utf-8") as file:
            file.write(content)
    print(f"Patched menu close bug in {f}")
