with open('rooms.html', 'rb') as f:
    raw = f.read()

has_bom = raw.startswith(b'\xef\xbb\xbf')
print('Has BOM:', has_bom)

content = raw.decode('utf-8')
lazy_count = content.count('loading="lazy"')
active_count = content.count('class="slide active"')
print('loading=lazy count:', lazy_count)
print('slide active (untouched):', active_count)

idx = content.find('\u8c6a\u83ef\u5bb6\u5ead\u623f')
print('Chinese text OK:', content[idx:idx+6] if idx != -1 else 'NOT FOUND')
