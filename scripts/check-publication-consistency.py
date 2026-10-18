"""Keep current source claims aligned with the two supplied October 2026 books.

Archived editions/illustrations remain dated records. This checks current HTML,
including its duplicate popup source, rather than trusting a summary disclaimer.
"""
from pathlib import Path
import hashlib, json, re
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.skip=0; self.parts=[]; self.refs=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.skip+=1
        self.refs.extend(v for k,v in attrs if k in ('href','src') and v)
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.skip-=1
    def handle_data(self,data):
        if not self.skip:self.parts.append(data)

pages={p.name:p.read_text(encoding='utf8') for p in ROOT.glob('*.html') if 'archive' not in p.name}
checked_links=0
versioned=['assets/css/mobile-site.css','assets/js/item-purpose.js','assets/js/salad-cards.js']
for name,source in pages.items():
    parser=Text(); parser.feed(source); text=' '.join(parser.parts)
    for pattern in [r'V1\s+xor\s+V6',r'validated corridor',r'BIA adds 2-4',r'252 g ceiling',r'22\.9% on 14 December 2025',r'The same tissue plus 2-4',r'corridor is (?:therefore )?a tissue claim',r'Three matched bands per bundle']:
        assert not re.search(pattern,text,re.I),(name,pattern)
    for ref in parser.refs:
        url=urlsplit(ref)
        if url.scheme or url.netloc or not url.path:continue
        target=ROOT/unquote(url.path).lstrip('/')
        if target.is_dir():target=target/'index.html'
        assert target.is_file(),(name,ref)
        checked_links+=1
        if url.path in versioned:
            digest=hashlib.sha256(target.read_text(encoding='utf8').encode('utf8')).hexdigest()[:12]
            assert url.query=='v='+digest,(name,ref,digest)

books={
 'project-100-guidebook-v3-4-2026-10-18.pdf':'8d819f4cf9bb4fdd1aca033ffcbe735cc835f0c04765782789cf8ba06a8966a8',
 'project-100-encyclopedia-v3-3-2026-10-18.pdf':'8dd95ea3bdae172f94b8482feb9743ad22b23e6b8a861ac1051cbcacc505f4e7',
}
for file,expected in books.items():
    assert hashlib.sha256((ROOT/'assets/downloads'/file).read_bytes()).hexdigest()==expected,file
    for name in ['index.html','fit-protocol.html','exercises.html','guidebook.html']:
        assert file in pages[name],(name,file)

metrics=json.loads((ROOT/'assets/data/current-metrics.json').read_text(encoding='utf8'))
assert metrics['profile']['baseline_smm_scan_date_reported']=='2025-12-02'
assert metrics['historical_nutrition_plan']['energy_kcal']==2780
assert 'deferred' in metrics['historical_nutrition_plan']['status']
assert 'rest days' in metrics['protocol_accounting']['v1_v6_rule']
gear=json.loads((ROOT/'assets/data/gear-database.json').read_text(encoding='utf8'))
expected=[('Juggernaut',3,85,255),('Titan',4,75,300),('Enforcer',2,65,130),('Tricep Specialist',3,55,165),('Viper',4,45,180),('Scalpel',4,35,140)]
actual=[(b['name'],b['band_count'],b['band_lb'],b['lb']) for b in gear['kuzaro']['bundles']]
assert actual==expected
assert gear['kuzaro']['bundles'][2]['set_count']==2
for name in ['fit-protocol-gear.html','gear-resistance.html']:
    for bundle,_,_,nominal in expected:
        assert bundle in pages[name] and f'{nominal} lb' in pages[name],(name,bundle)
    assert not re.search(r'Titan</(?:strong|span)>.{0,70}195 lb',pages[name]),name
purposes=(ROOT/'assets/js/item-purpose.js').read_text(encoding='utf8')
for bundle,_,_,nominal in expected:
    row=next(line for line in purposes.splitlines() if f'/^{bundle}$/' in line)
    assert f'{nominal} lb' in row,(bundle,row)
for name in ['fit-meals.html','fit-nutrition.html']:
    assert 'PROJECT 100 · HISTORICAL PLAN' in pages[name]
    assert 'Historical protein plan' in pages[name]
    assert 'whole-day intake unverified' in pages[name]

training=json.loads((ROOT/'downloads/kinetics/training-plan-v0.3.json').read_text(encoding='utf8'))
reference=json.loads((ROOT/'downloads/reference/project100-analysis-data.json').read_text(encoding='utf8'))
assert len(training['exercises'])==reference['counts']['canonical_techniques']==31
assert sum(bool(e.get('isKitAdaptation')) for e in training['exercises'])==6
assert reference['counts']['inventoried_files']==740
statuses=[item['full_timeline_review'] for item in reference['recording_review']]
assert sum(s.startswith('Sequential') for s in statuses)==18
assert sum(s.startswith('Partial') for s in statuses)==1
assert statuses.count('pending')==24
assert len(reference['detailed_recording_coverage'])==15
assert len(reference['salad_model']['recipes'])==14
assert len(reference['meal_stories'])==9
for name in ['full-body.pdf','full-body-short.pdf']:
    assert len(PdfReader(ROOT/'downloads/kinetics/pdf'/name,strict=True).pages)==8
# Mobile has one maintained phone cascade, not a succession of page patches.
css=(ROOT/'assets/css/mobile-site.css').read_text(encoding='utf8')
assert css.count('screen and (max-width:767px), screen and (max-width:1023px) and (pointer:coarse)')==1
assert css.count('{')==css.count('}')
assert not re.search(r'scroll-snap-type\s*:\s*y\s+mandatory',css)
print(f'PASS: {len(pages)} current pages, {checked_links} local links; book bytes, day rule, benchmark, historical nutrition, bundles, evidence scope, full-body PDFs and technique counts. Archived editions excluded.')
