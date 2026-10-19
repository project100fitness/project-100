"""Guard source-owned workout navigation and one-page preview/export consistency."""
from pathlib import Path
from html.parser import HTMLParser
import re

root=Path(__file__).resolve().parent.parent
class Source(HTMLParser):
    def __init__(self):super().__init__();self.docs=[];self.ids=[];self.notes=[];self.body={}
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if 'data-kd-doc' in a:self.docs.append(a)
        if tag=='textarea':self.notes.append(a.get('name'))
        if tag=='body':self.body=a

for filename in ('kinetics.html','exercises.html'):
    t=(root/filename).read_text(encoding='utf8');s=Source();s.feed(t)
    assert len(s.ids)==len(set(s.ids)),filename
    assert len(s.docs)==47 and len({d['data-kd-doc'] for d in s.docs})==47
    log=next(d for d in s.docs if d['data-kd-doc']=='weekly-log')
    assert log['data-kd-preview'].endswith('/weekly-overview.html')
    assert log['data-kd-pdf'].endswith('/weekly-overview.pdf')
    for d in s.docs:
        for key in ('data-kd-preview','data-kd-pdf'):assert (root/d[key]).is_file(),(filename,d[key])

s=Source();t=(root/'downloads/kinetics/weekly-overview.html').read_text(encoding='utf8');s.feed(t)
assert s.body['data-document']=='weekly-overview' and 'data-guide' not in s.body
assert '<h1>Weekly training log</h1>' in t
assert set(s.notes)=={f'weekly-day-{i}-notes' for i in range(1,8)}
t=(root/'exercises.html').read_text(encoding='utf8')
assert t.count('id="session-exercise-choices"')==1 and t.count('data-session-choices')==1
assert 'EXERCISE 01 OF 06' not in t and '01 / 06' not in t
assert t.index('id="p100-download-cards"')<t.index('data-analysis-reference-entry')
assert 'training-label-short" aria-hidden' not in t
mobile=(root/'assets/js/mobile-flow.js').read_text(encoding='utf8')
assert 'foldContent' not in mobile and 'dataset.desktopLabel' not in mobile
print('Source check passed: 94 document links, one-page log, visible labels and source-owned mobile navigation.')
