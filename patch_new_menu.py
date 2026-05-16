import re

with open("newindex.html", "r", encoding="utf-8") as file:
    content = file.read()

# 1. Replace HTML Menu Structure
old_html_menu = re.compile(r'<div class="fullscreen-menu" id="fullscreen-menu">[\s\S]*?</div>\s*<!-- Hero -->')
new_html_menu = """    <div class="fullscreen-menu" id="fullscreen-menu">
        <div class="menu-container">
            <div class="menu-left">
                <a href="newindex.html" class="menu-link" style="transition-delay: 0.1s">
                    <span class="menu-num">01</span> 首頁 <span class="menu-en">Home</span>
                </a>
                <a href="newintro.html" class="menu-link" style="transition-delay: 0.15s">
                    <span class="menu-num">02</span> 細說期遇 <span class="menu-en">The Villa</span>
                </a>
                <a href="newrooms.html" class="menu-link" style="transition-delay: 0.2s">
                    <span class="menu-num">03</span> 房型設施 <span class="menu-en">Rooms</span>
                </a>
                <a href="newlocation.html" class="menu-link" style="transition-delay: 0.25s">
                    <span class="menu-num">04</span> 地理資訊 <span class="menu-en">Location</span>
                </a>
                <a href="newreviews.html" class="menu-link" style="transition-delay: 0.3s">
                    <span class="menu-num">05</span> 客戶評價 <span class="menu-en">Reviews</span>
                </a>
                <a href="newfaq.html" class="menu-link" style="transition-delay: 0.35s">
                    <span class="menu-num">06</span> 常見問題 <span class="menu-en">FAQ</span>
                </a>
                <a href="newpolicy.html" class="menu-link" style="transition-delay: 0.4s">
                    <span class="menu-num">07</span> 訂房須知 <span class="menu-en">Policy</span>
                </a>
                <a href="https://booking.owlting.com/kiwi-villa" class="menu-link highlight" style="transition-delay: 0.45s" target="_blank">
                    <span class="menu-num">08</span> 立即訂房 <span class="menu-en">Book Now</span>
                </a>
            </div>
            <div class="menu-right" style="transition-delay: 0.5s">
                <div class="menu-info-block">
                    <h5>Get in touch</h5>
                    <p>0933-636-373</p>
                    <a href="https://page.line.me/ucz4004x" target="_blank">LINE 官方諮詢</a>
                </div>
                <div class="menu-info-block">
                    <h5>Location</h5>
                    <p>澎湖縣馬公市<br>西衛里347號</p>
                </div>
                <div class="menu-info-block">
                    <h5>Social</h5>
                    <a href="https://www.instagram.com/kiwi_villa/" target="_blank">Instagram</a>
                    <a href="https://www.facebook.com/kiwivilla.home/" target="_blank">Facebook</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Hero -->"""
content = old_html_menu.sub(new_html_menu, content)

# 2. Replace CSS Menu styles
old_css_menu = re.compile(r'/\*\s*全螢幕選單\s*\*\/[\s\S]*?body\.menu-open\s*\{\s*overflow:\s*hidden;\s*\}')
new_css_menu = """/* 升級版全螢幕選單 (Light Editorial) */
        .fullscreen-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(249, 247, 243, 0.97); /* 暖白透視背景 */
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            z-index: 90;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .fullscreen-menu.open {
            opacity: 1;
            pointer-events: auto;
        }

        .menu-container {
            width: 100%;
            max-width: 1400px;
            padding: 0 10%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .menu-left {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .menu-link {
            font-family: var(--font-display);
            font-size: clamp(2rem, 5vw, 4rem);
            color: var(--color-text);
            text-decoration: none;
            display: flex;
            align-items: center;
            opacity: 0;
            transform: translateY(30px) rotate(2deg);
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            transform-origin: left;
        }
        
        .fullscreen-menu.open .menu-link {
            opacity: 1;
            transform: translateY(0) rotate(0);
        }

        .menu-link:hover {
            color: var(--color-accent);
            transform: translateX(15px);
        }

        .menu-num {
            font-family: var(--font-body);
            font-size: 1rem;
            margin-right: 2rem;
            opacity: 0.3;
            font-weight: 300;
            letter-spacing: 0.1em;
            transform: translateY(-5px);
        }

        .menu-en {
            font-family: var(--font-display);
            font-style: italic;
            margin-left: 1.5rem;
            color: var(--color-text-light);
            font-size: 0.6em;
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.4s ease;
        }

        .menu-link:hover .menu-en {
            opacity: 1;
            transform: translateX(0);
        }

        .menu-link.highlight {
            color: var(--color-accent);
            margin-top: 1rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(0,0,0,0.1);
        }

        .menu-right {
            display: flex;
            flex-direction: column;
            gap: 3rem;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fullscreen-menu.open .menu-right {
            opacity: 1;
            transform: translateY(0);
        }

        .menu-info-block h5 {
            font-family: var(--font-display);
            font-size: 1.2rem;
            font-style: italic;
            color: var(--color-text-light);
            margin-bottom: 1rem;
        }

        .menu-info-block p, .menu-info-block a {
            font-family: var(--font-body);
            color: var(--color-text);
            text-decoration: none;
            display: block;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
            font-weight: 300;
            transition: color 0.3s;
        }

        .menu-info-block a:hover {
            color: var(--color-accent);
        }
        
        body.menu-open {
            overflow: hidden;
        }"""
content = old_css_menu.sub(new_css_menu, content)

# 3. Replace menu open override rules (body.menu-open nav)
old_menu_open_css = re.compile(r'body\.menu-open\s*\.logo-img\s*\{\s*filter:\s*brightness\(0\)\s*invert\(1\)\s*!important;\s*\}')
content = old_menu_open_css.sub(r'body.menu-open .logo-img {\n            filter: none !important;\n        }', content)

old_menu_nav_css = re.compile(r'color:\s*var\(--color-bg\)\s*!important;')
content = old_menu_nav_css.sub('color: var(--color-text) !important;', content)

# 4. Inject mobile RWD for menu
rwd_css = """
        @media (max-width: 1024px) {
            .menu-container {
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
                gap: 3rem;
                padding: 10% 8%;
                height: 100vh;
                overflow-y: auto;
            }
            .menu-right {
                flex-direction: row;
                flex-wrap: wrap;
                gap: 2rem;
                border-top: 1px solid rgba(0,0,0,0.1);
                padding-top: 2rem;
                width: 100%;
            }
            .menu-link {
                font-size: 2rem;
            }
            .menu-num {
                margin-right: 1rem;
            }
        }
"""
content = content.replace("/* Global Mobile Fixes */", rwd_css + "\n        /* Global Mobile Fixes */")

with open("newindex.html", "w", encoding="utf-8") as file:
    file.write(content)
print("Updated menu design on newindex.html")
