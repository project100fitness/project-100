"""Apply cache versions and brand consistency after all source/build overlays."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
for path in ROOT.glob('*.html'):
 soup=BeautifulSoup(path.read_text(),'html.parser')
 if not soup.select_one('.page-shell'):continue
 for node in soup.select('script[src]'):
  if node['src'].split('?')[0] in ['assets/js/v2.js','assets/js/fixonic.js','assets/js/vector-studio.js','assets/js/filing-navigation.js']:
   node['src']=node['src'].split('?')[0]+'?v=20261005-release'
 path.write_text(str(soup))
print('Applied tested release script versions.')
