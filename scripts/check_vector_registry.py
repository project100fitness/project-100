"""Verify the registry's live records, identity, source quantities and old URL compatibility."""
from pathlib import Path
import json, subprocess
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'assets/data/vector-registry.json').read_text())
assert [v['id'] for v in data['vectors']]==['v1','v2','v3','v4','v5','v6','v10']
for v in data['vectors']:
 s=BeautifulSoup((ROOT/f'fit-protocol-vector-{v["id"]}.html').read_text(),'html.parser')
 f=s.select_one('.folder-formula')
 assert f.h3.get_text(strip=True)==v['name']
 assert [n.get_text(' ',strip=True) for n in f.select('.folder-ingredients li')]==v['ingredients']
 assert f.select_one('.folder-timing').get_text(' ',strip=True)==v['timing']
 svg=(ROOT/f'assets/downloads/vector-diagrams/project100-{v["id"]}-ingredients.svg').read_text()
 assert v['name'] in svg and v['deployment'].replace('&','&amp;') in svg
 if v['id']!='v6':
  old=BeautifulSoup(subprocess.check_output(['git','show','21dc046c77bc23c78661c026797bc70dfccaac56:'+f'fit-protocol-vector-{v["id"]}.html'],cwd=ROOT,text=True),'html.parser')
  assert v['ingredients']==[n.get_text(' ',strip=True) for n in old.select('.folder-ingredients li')],v['id']+' ingredient drift'
v6=next(v for v in data['vectors'] if v['id']=='v6')
assert v6['ingredients'][0].endswith('2 scoops / 31 g')
assert v6['ingredients'][1].endswith('1 scoop / 17.73 g')
assert '250 mg, swallowed separately' in v6['ingredients'][-1]
assert 'V1 and V6 are never used on the same calendar day' in v6['clinical_html']
assert 'Both are inactive on rest days' in v6['clinical_html']
alias=(ROOT/'fit-protocol-vector-pump.html').read_text()
assert 'location.replace' in alias and 'location.search' in alias and '#vector-v6' in alias
for ext in ['png','svg']:
 assert (ROOT/f'assets/downloads/vector-diagrams/project100-pump-ingredients.{ext}').read_bytes()==(ROOT/f'assets/downloads/vector-diagrams/project100-v6-ingredients.{ext}').read_bytes()
print('PASS: seven numbered vectors; retained ingredient quantities; V6 formulation, exclusions, diagrams and legacy aliases.')
