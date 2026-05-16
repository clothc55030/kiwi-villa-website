import os
import glob

directory = "c:/Users/kiwi_villa/Documents/GitHub/kiwi-villa-website"

target_str = """                <p>澎湖縣馬公市西衛里347號</p>
                <p>0933-636-373</p>"""

replacement_str = """                <a href="https://www.google.com/maps/search/?api=1&query=澎湖期遇度假會館" target="_blank">澎湖縣馬公市西衛里347號</a>
                <a href="tel:0933636373">0933-636-373</a>"""

html_files = glob.glob(os.path.join(directory, "*.html"))

count = 0
for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    if target_str in content:
        new_content = content.replace(target_str, replacement_str)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {os.path.basename(file_path)}")
        count += 1

print(f"Total updated files: {count}")
