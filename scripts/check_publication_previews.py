"""Validate public metadata, matched assets and preserved download filenames."""
from pathlib import Path
import json
from bs4 import BeautifulSoup
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
records=json.loads((ROOT/'assets/data/publication-previews.json').read_text())['pages']
files=[v['file'] for m in ['main-files','protocol-files'] for v in json.loads((ROOT/'assets/js'/f'{m}.json').read_text())['files']]
assert set(records)==set(files)
assert len({r['description'] for r in records.values()})==len(files)
for name,record in records.items():
 s=BeautifulSoup((ROOT/name).read_text(),'html.parser')
 for selector in ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]']:
  assert s.select_one(selector)['content']==record['description'],name
 with Image.open(ROOT/record['image']) as photo:w,h=photo.size
 assert s.select_one('meta[property="og:image"]')['content']=='https://project100.fit/'+record['image']
 assert s.select_one('meta[name="twitter:image"]')['content']=='https://project100.fit/'+record['image']
 assert s.select_one('meta[property="og:image:width"]')['content']==str(w)
 assert s.select_one('meta[property="og:image:height"]')['content']==str(h)
 assert not s.select_one('.site-head .focused-subtabs'),name+' layout regressed'
 if 'vector-v6' in name:assert 'V6 PUMP' in record['description'] and 'PUMP EVENING' not in record['description']
s=BeautifulSoup((ROOT/'library.html').read_text(),'html.parser')
assert len(s.select('#download-help'))==1
for a in s.select('a[href^="assets/downloads/"][download]'):assert a['download']==Path(a['href']).name
print(f'PASS: {len(files)} unique descriptions, valid contextual previews/dimensions, preserved folder layout and explicit dated download filenames.')
