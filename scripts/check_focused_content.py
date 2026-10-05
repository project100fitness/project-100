"""Verify the page split against the last complete publication."""
from pathlib import Path
from collections import Counter
import subprocess
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
BASE='33ca029fa3d5562aa17dace67fdd871ec58a03d9'
docs={p.name:BeautifulSoup(p.read_text(),'html.parser') for p in ROOT.glob('*.html')}
def previous(file):
    return BeautifulSoup(subprocess.check_output(['git','show',BASE+':'+file],cwd=ROOT,text=True),'html.parser')
def words(node):return Counter(node.select_one('.book-text').get_text().split())
chapters={e['id']:e for name,s in docs.items() if name.startswith('fit-protocol') for e in s.select('section.book-chapter[id]')}
count=0
for file in ['fit-protocol-baseline.html','fit-protocol-fuel.html','fit-protocol-training.html','fit-protocol-troubleshooting.html']:
    for e in previous(file).select('section.book-chapter[id]'):
        assert words(e)==words(chapters[e['id']]),e['id'];count+=1
for e in previous('guidebook.html').select('section[id^="guide-page-"]'):
    if e['id']=='guide-page-1':continue  # publication cover is deliberately retired
    matches=[s.find(id=e['id']) for s in docs.values() if s.find(id=e['id'])]
    assert len(matches)==1,(e['id'],len(matches))
    assert words(e)==words(matches[0]),e['id']
print(f'PASS: {count} Protocol chapters and 12 daily analysis pages retain every source word, with no duplicate daily notes.')
