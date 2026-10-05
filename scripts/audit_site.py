"""Check static routes and navigation before publishing the website."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
import sys
import json
ROOT = Path(__file__).resolve().parents[1]
class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.tags = []; self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
docs = {p: Document(p.read_text()) for p in ROOT.rglob('*.html')}
issues = []
main = [x['file'] for x in json.loads((ROOT/'assets/js/main-files.json').read_text())['files']]
protocol = [x['file'] for x in json.loads((ROOT/'assets/js/protocol-files.json').read_text())['files']]
for p, doc in docs.items():
    name = str(p.relative_to(ROOT)); text = p.read_text()
    for tag, attrs in doc.tags:
        for key in ['href', 'src', 'poster', 'data-full']:
            value = attrs.get(key)
            if not value: continue
            u = urlsplit(value)
            if u.scheme or u.netloc: continue
            dest = ROOT / unquote(u.path).lstrip('/') if u.path.startswith('/') else p.parent / unquote(u.path) if u.path else p
            dest = dest.resolve()
            if dest.is_dir(): dest /= 'index.html'
            if not dest.exists(): issues.append(f'{name}: missing {value}')
            elif key == 'href' and u.fragment and dest in docs:
                if not any(a.get('id') == unquote(u.fragment) or a.get('name') == unquote(u.fragment) for _, a in docs[dest].tags):
                    issues.append(f'{name}: missing section {value}')
    ids = Counter(a['id'] for _,a in doc.tags if 'id' in a)
    for key, count in ids.items():
        if count > 1: issues.append(f'{name}: duplicate ID {key}')
    if re.search(r'ninja|creami',text,re.I): issues.append(f'{name}: removed feature still referenced')
    if p.parent == ROOT:
        if name in ['fit-protocol-archive.html','encyclopedia.html','encyclopedia-guidebook.html','encyclopedia-archive.html']:
            if any('encyclopedia-site' in a.get('class','') or 'page-shell' in a.get('class','') for _,a in doc.tags):issues.append(f'{name}: suspended reader was restored')
        for wrapper in ['html','head','body']:
            if sum(t==wrapper for t,a in doc.tags) != 1: issues.append(f'{name}: invalid {wrapper} wrapper count')
        if name in main+protocol+['fit-protocol-archive.html','guidebook.html','library.html','404.html']:
            if sum(t=='h1' for t,a in doc.tags) != 1: issues.append(f'{name}: needs exactly one h1')
        if name in main+protocol:
            target='index.html' if name in protocol else 'fit-protocol.html'
            if not any('site-switch-float' in a.get('class','') and a.get('href') == target for _,a in doc.tags):issues.append(f'{name}: no floating site switch')
            if any('site-destinations' in a.get('class','') for _,a in doc.tags):issues.append(f'{name}: obsolete header site switch')
            if any(t=='a' and 'encyclopedia' in a.get('href','').lower() or t=='a' and 'fit-protocol-archive.html' in a.get('href','') for t,a in doc.tags):issues.append(f'{name}: retired reader access remains')
for ring in [main, protocol]:
    for i, name in enumerate(ring):
        for cls, delta in [('prev',-1),('next',1)]:
            links=[a.get('href') for t,a in docs[ROOT/name].tags if t=='a' and {'page-nav-arrow',cls} <= set(a.get('class','').split())]
            expected=ring[(i+delta)%len(ring)]
            if links != [expected]: issues.append(f'{name}: {cls} must link once to {expected}, found {links}')
# Scan local asset paths in dynamically generated markup and styles too.
for p in [*ROOT.glob('*.html'), *ROOT.glob('assets/js/*.js'), *ROOT.glob('assets/css/*.css')]:
    for value in set(re.findall(r"assets/(?:img|video|css|js|partials)/[\w.\-/]+", p.read_text())):
        if not (ROOT/value.rstrip(".")).exists(): issues.append(f'{p.relative_to(ROOT)}: missing dynamic asset {value}')
if issues:
    print('\n'.join(sorted(set(issues)))); sys.exit(1)
print(f'PASS: {len(list(ROOT.glob("*.html")))} pages; files, section links, headings, wrappers, guidebook bars, and both circular navigation routes.')
