import os
import glob
import re

directory = "c:/Users/kiwi_villa/Documents/GitHub/kiwi-villa-website"
html_files = glob.glob(os.path.join(directory, "*.html"))
css_files = glob.glob(os.path.join(directory, "css", "**", "*.css"), recursive=True)

all_text = ""

for fpath in html_files + css_files:
    with open(fpath, "r", encoding="utf-8") as f:
        all_text += f.read()

image_files = glob.glob(os.path.join(directory, "images", "**", "*.*"), recursive=True)

unused_images = []
for img in image_files:
    # normalize path separator and get relative path
    rel_path = os.path.relpath(img, directory).replace("\\", "/")
    filename = os.path.basename(img)
    
    # Simple check: does the filename appear anywhere in HTML/CSS?
    if filename not in all_text:
        unused_images.append(rel_path)

print("--- UNUSED IMAGES (By filename check) ---")
for img in unused_images:
    print(img)
