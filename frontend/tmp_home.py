from pathlib import Path
print(Path('src/pages/Home.jsx').read_text()[:1000])
