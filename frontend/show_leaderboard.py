from pathlib import Path
path = Path('src/pages/Leaderboard.jsx')
lines = path.read_text(encoding='utf-8').splitlines()
for i,line in enumerate(lines,1):
    print(f"{i:03d}: {line}")
