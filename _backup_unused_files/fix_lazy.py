import re

# Read raw bytes
with open('rooms.html', 'rb') as f:
    raw = f.read()

# Strip BOM if present
if raw.startswith(b'\xef\xbb\xbf'):
    raw = raw[3:]
    print("Stripped BOM")
else:
    print("No BOM found")

# Decode
content = raw.decode('utf-8')

# Step 1: remove any existing loading="lazy" (clean slate)
content = content.replace(' loading="lazy">', '>')

# Step 2: add loading="lazy" only to class="slide"> (not class="slide active">)
content = re.sub(r'(class="slide")>', r'\1 loading="lazy">', content)

# Step 3: Write back as UTF-8 without BOM, preserve original line endings (CRLF)
out = content.encode('utf-8')
with open('rooms.html', 'wb') as f:
    f.write(out)

# Verify
with open('rooms.html', 'rb') as f:
    check = f.read()

has_bom = check.startswith(b'\xef\xbb\xbf')
check_content = check.decode('utf-8')
lazy = check_content.count('loading="lazy"')
active = check_content.count('class="slide active"')
zh_ok = '豪華家庭房' in check_content

print(f"Has BOM: {has_bom}")
print(f"loading=lazy count: {lazy}")
print(f"slide active (untouched): {active}")
print(f"Chinese text OK: {zh_ok}")
