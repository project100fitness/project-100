"""Moved main-site records retain their text, cards and media."""
from pathlib import Path
from collections import Counter
import subprocess
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
BASE='461812d56783067c4c977da4e90b12a78c3557bd'
def old(file):return BeautifulSoup(subprocess.check_output(['git','show',BASE+':'+file],cwd=ROOT,text=True),'html.parser')
docs=[BeautifulSoup(p.read_text(),'html.parser') for p in ROOT.glob('*.html')]
sections={e['data-main-source']:e for s in docs for e in s.select('section[data-main-source]')}
count=0
for file,ids in [('index.html',['story','mission','roadmap','faq']),('fit-nutrition.html',['reels','clinical-nutrition']),('gear-shop.html',['gym-tour','reels','safety','gear-source'])]:
    before=old(file)
    for id in ids:
        a=before.find(id=id);b=sections[file+':'+id]
        assert Counter(a.get_text().split())<=Counter(b.get_text().split()),(file,id,'text')
        assert Counter(e.get('src') for e in a.select('img'))<=Counter(e.get('src') for e in b.select('img')),(file,id,'images')
        count+=1
before=old('gear-shop.html')
for key,group in zip(['resistance','grips','anchors','recovery'],before.select('.armory-groups .armory-group')):
    a=group.select_one('.armory-list');b=sections['gear-shop.html:armory-'+key].select_one('.armory-list')
    assert Counter(e.get('src') for e in a.select('img'))==Counter(e.get('src') for e in b.select('img')),key
    if key=='resistance':
        # The author corrected only KUZARO to a four-kit inventory on 2026-10-05.
        for listing in [a,b]:
            next(c for c in listing.select('.armory-item') if 'KUZARO' in c.get_text()).decompose()
    assert Counter(a.get_text().split())==Counter(b.get_text().split()),key
    assert Counter(e.get('src') for e in a.select('img'))==Counter(e.get('src') for e in b.select('img')),key
print(f'PASS: {count} moved sections and all equipment images retained; unchanged equipment text preserved outside the authorized KUZARO correction.')
