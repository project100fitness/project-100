"""Content regressions for conflicting dates, branches and units in the addon."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,re
ROOT=Path(__file__).resolve().parents[1]
def doc(name):return BeautifulSoup((ROOT/name).read_text(),'html.parser')
b=doc('biometrics.html');text=b.get_text(' ',strip=True)
assert '14 December 2025' in text and 'Operator-reported, unverified' in text
assert 'carried forward, not newly scanned' in text and 'planned' in text.lower()
assert 'not a measurement of skeletal muscle' in text
m=doc('mineral-chemistry.html').get_text(' ',strip=True)
assert '341 mg training' in m and '646 / 405 mg' in m
assert 'Neither is included in the recorded rest branch' in m
assert 'not daily totals' in m and 'subtract 200 mg' in m
g=doc('guidebook.html');cards=g.select('.clock-card')
branches={k:[c.get_text(' ',strip=True) for c in cards if c['data-branch']==k] for k in ['training','rest','evening']}
assert [len(branches[k]) for k in ['training','rest','evening']]==[10,5,10]
assert any(re.search(r'\bV1\b',c) for c in branches['training']) and not any(re.search(r'\bV6\b',c) for c in branches['training'])
assert any(re.search(r'\bV6\b',c) for c in branches['evening']) and not any(re.search(r'\bV1\b',c) for c in branches['evening'])
assert not any(re.search(r'\bV[1246]\b',c) for c in branches['rest'])
assert '8 regular units' in doc('fit-protocol-supplements.html').get_text()
for p in ROOT.glob('fit-protocol*.html'):
 assert not re.search(r'\b(DMAE|Huperzine|S016)\b',doc(p.name).get_text(),re.I),p.name
assert 'Proline Nutrition creatine HCl 750 mg' in doc('fit-protocol-vector-v4.html').get_text()
assert 'SD Pharmaceuticals Natural Series creatine HCl 750 mg' in doc('fit-protocol-vector-v10.html').get_text()
for name in ['biometrics.html','mineral-chemistry.html']:
 s=doc(name);assert len(s.select('h1'))==1
 assert s.select_one('.site-head a.current')['href']==name
 assert s.select_one('.site-switch-float')
print('PASS: dated biometrics, partial mineral sums, pill units, exclusive day branches, brands and new folder navigation.')
