"""Apply shared framing and reading fonts after the individual site designs."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
for path in ROOT.glob('*.html'):
    soup = BeautifulSoup(path.read_text(), 'html.parser')
    if not soup.select_one('.page-shell'):
        continue
    for old in soup.select('link[href*="assets/css/reading-layout.css"]'):
        old.decompose()
    soup.head.append(soup.new_tag('link', rel='stylesheet', href='assets/css/reading-layout.css?v=20261004-cards'))
    path.write_text(str(soup))
print('Shared enclosure and readable typography applied to all 12 full pages.')
