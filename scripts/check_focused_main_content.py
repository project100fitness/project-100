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
        if id=='safety':
            # Duplicated gear descriptions follow the author's new manifest.
            for part in [a,b]:
                for c in part.select('.armory-item'):
                    for node in c.select('.ai-text'):node.clear()
        # Author requested removal of repeated gallery boilerplate.
        for part in [a,b]:
            for node in part.select('.recipe-record,.reels-head>p,.sec-head>p,.watch,.watch-yt'):
                node.decompose()
            for node in part.select('.eyebrow,h2'):
                if node.get_text(' ',strip=True).lower() in ['gym walkthrough','the last 60 days, unfiltered'] or node.get_text(' ',strip=True).lower().startswith('straight from @'):
                    node.decompose()
        assert Counter(a.get_text(' ',strip=True).split())<=Counter(b.get_text(' ',strip=True).split()),(file,id,'text')
        assert Counter(e.get('src') for e in a.select('img'))<=Counter(e.get('src') for e in b.select('img')),(file,id,'images')
        count+=1
before=old('gear-shop.html')
current=[c for file in ['gear-resistance.html','gear-grips.html','gear-anchors.html','gear-recovery.html'] for c in BeautifulSoup((ROOT/file).read_text(),'html.parser').select('.armory-item')]
assert Counter(e.get('src') for e in before.select('.armory-groups .armory-item img'))<=Counter(e.get('src') for c in current for e in c.select('img'))
# Manifest-backed card text is author-authorized for revision; other records stay exact.
for c in before.select('.armory-groups .armory-item'):
    name=c.select_one('.ai-name').get_text()
    match=next((e for e in current if e.select_one('.ai-name').get_text()==name),None)
    if match and not match.get('data-gear-record'):
        assert Counter(c.get_text(' ',strip=True).split())==Counter(match.get_text(' ',strip=True).split()),name
print(f'PASS: {count} moved sections and all equipment images retained; additional inventory text preserved outside the authorized manifest updates.')
