import glob

files = [f for f in glob.glob("new*.html") if f != "newindex.html"]

logo_html = """        <a href="newindex.html" class="logo">
            <picture>
                <source srcset="images/logo/kiwi-villa-logo.avif" type="image/avif">
                <source srcset="images/logo/kiwi-villa-logo.webp" type="image/webp">
                <img src="images/logo/kiwi-villa-logo.webp" alt="Kiwi Villa Logo" class="logo-img">
            </picture>
        </a>"""

css_logo = """        .logo {
            font-family: var(--font-display);
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: 0.2em;
            text-decoration: none;
            color: inherit;
            text-transform: uppercase;
            display: flex;
            align-items: center;
        }

        .logo-img {
            height: 45px;
            width: auto;
            object-fit: contain;
            transition: filter 0.5s ease;
        }"""

for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    # Replace Logo HTML
    # It currently might be <a href="newindex.html" class="logo">KIWI VILLA</a>
    # or <a href="#" class="logo">KIWI VILLA</a>
    import re
    content = re.sub(r'<a href="[^"]*" class="logo">KIWI VILLA</a>', logo_html, content)
    
    # Replace CSS
    # It currently is:
    #         .logo {
    #            ...
    #            text-transform: uppercase;
    #        }
    content = re.sub(r'\.logo\s*\{[^}]*\}', css_logo, content)
    
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)
    print(f"Synced Image Logo to {f}")
