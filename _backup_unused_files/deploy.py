import os
import shutil
import re

# The mapping from new files to the original names
file_map = {
    'newindex.html': 'index.html',
    'newintro.html': 'intro.html',
    'newrooms.html': 'rooms.html',
    'newlocation.html': 'location.html',
    'newreviews.html': 'reviews.html',
    'newfaq.html': 'faq.html',
    'newpolicy.html': 'policy.html',
}

# The link replacements for going live (back to absolute extensionless routes)
link_replacements = {
    r'href="newindex.html"': r'href="/"',
    r'href="newintro.html"': r'href="/intro"',
    r'href="newrooms.html"': r'href="/rooms"',
    r'href="newlocation.html"': r'href="/location"',
    r'href="newreviews.html"': r'href="/reviews"',
    r'href="newfaq.html"': r'href="/faq"',
    r'href="newpolicy.html"': r'href="/policy"',
}

# 1. Update links in new*.html files and save to the final filename
for new_file, target_file in file_map.items():
    if not os.path.exists(new_file):
        print(f"Warning: {new_file} not found, skipping.")
        continue

    with open(new_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply all link replacements
    for old_link, new_link in link_replacements.items():
        content = content.replace(old_link, new_link)

    # Overwrite the target file
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Replaced {target_file} with content from {new_file} and updated links.")

# 2. Delete the new*.html files now that we have deployed them
for new_file in file_map.keys():
    if os.path.exists(new_file):
        os.remove(new_file)
        print(f"Removed temporary file {new_file}")

print("Deployment complete!")
