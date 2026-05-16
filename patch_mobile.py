import glob
import re

files = glob.glob("new*.html")
mobile_css = """
        /* Global Mobile Fixes */
        @media (max-width: 768px) {
            :root {
                --spacing-md: 2rem;
                --spacing-lg: 3rem;
                --spacing-xl: 4.5rem;
                --spacing-xxl: 6rem;
            }
            nav {
                padding: 1.2rem 6% !important;
            }
            .logo {
                font-size: 1.2rem;
            }
            .footer-grid {
                grid-template-columns: 1fr;
                gap: var(--spacing-md);
            }
        }
"""

for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    # Check if we already injected
    if "/* Global Mobile Fixes */" not in content:
        # Inject CSS
        content = content.replace("</style>", mobile_css + "    </style>")
        
        # Patch JS for nav padding so we don't need !important exclusively
        content = content.replace("nav.style.padding = '1rem 4rem';", "nav.style.padding = window.innerWidth <= 768 ? '1rem 6%' : '1rem 4rem';")
        content = content.replace("nav.style.padding = '2rem 4rem';", "nav.style.padding = window.innerWidth <= 768 ? '1.2rem 6%' : '2rem 4rem';")
        
        with open(f, "w", encoding="utf-8") as file:
            file.write(content)
    print(f"Patched {f}")
