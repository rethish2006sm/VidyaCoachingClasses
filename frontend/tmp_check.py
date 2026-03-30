from pathlib import Path
text = Path('src/pages/Gallery.jsx').read_text(encoding='utf-8')
pattern = 'image.featured ?  \\u2b50 Featured : \\U0001f4c1 In folder'
print(pattern in text)
