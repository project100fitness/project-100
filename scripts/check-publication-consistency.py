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
versioned=['assets/css/site.css','assets/css/kinetics.css','assets/js/kinetics.js','assets/js/p100-band-training.js','assets/js/item-purpose.js','assets/js/salad-cards.js']
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

manifest=json.loads((ROOT/'assets/downloads/current-publications.json').read_text(encoding='utf8'))
assert {b['kind']:b['version'] for b in manifest['publications']}=={'guidebook':'3.7','encyclopedia':'3.6','technical-guidebook':'T1.0','technical-encyclopedia':'T1.0'}
for book in manifest['publications']:
    target=ROOT/book['path'];data=target.read_bytes();file=target.name
    assert len(data)==book['bytes'] and hashlib.sha256(data).hexdigest()==book['sha256'],file
    assert len(PdfReader(target,strict=True).pages)==book['pages'],file
    library=json.loads((ROOT/'assets/data/manual-library.json').read_text(encoding='utf8'))
    assert any(d.get('file')==book['path'] and d.get('pages')==book['pages'] for d in library['documents']),file
    for name in ['index.html','fit-protocol.html','exercises.html','guidebook.html']:
        assert 'id="manualLibrary"' in pages[name] and 'manual-library.js' in pages[name],name
    for name,source in pages.items():
        for number in re.findall(re.escape(file)+r'#page=(\d+)',source):
            assert 1<=int(number)<=book['pages'],(name,file,number)

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
assert len(training['exercises'])==reference['counts']['canonical_techniques']==39
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
# Responsive presentation belongs to component owners, with authored navigation markup.
import runpy
runpy.run_path(str(ROOT/'scripts/check-source-architecture.py'),run_name='__main__')
print(f'PASS: {len(pages)} current pages, {checked_links} local links; book bytes, day rule, benchmark, historical nutrition, bundles, evidence scope, full-body PDFs and technique counts. Archived editions excluded.')

# Kinetics is a programme index; rich setup content must retain its owning programme.
kinetics=pages['kinetics.html']
assert kinetics.count('data-kin-programme="focused"')==1
assert kinetics.count('data-kin-programme="fullbody"')==1
assert kinetics.count('class="kin-session-links"')==2
for programme,days in [('focused',[1,2,3]),('fullbody',[5,6])]:
    for day in days:
        assert f'panel=sessions&amp;programme={programme}&amp;day={day}' in kinetics,(programme,day)
assert 'class="exercise-entry' not in kinetics
assert 'class="kin-downloads ' not in kinetics
assert kinetics.count('class="kin-anchor-copy"')==3
assert 'data-analysis-reference-entry' not in kinetics
print('PASS: two Kinetics programmes, five direct day links and three readable anchor cards; duplicate entry banners removed.')

assert kinetics.count('class="kin-programme-choice"')==2
assert kinetics.count('<em>Open session</em>')==5
assert '<details class="kin-kit-summary">' in kinetics
assert 'class="kin-bar-diagram"' not in kinetics
for fact in ['Left pair','Right pair','260 lb nominal','rotating eyelets']:
    assert fact in kinetics,fact
assert 'data-background-toggle' not in kinetics
assert 'data-background-toggle' not in pages['index.html']
media=(ROOT/'assets/js/site.js').read_text(encoding='utf8')
assert "video[data-src], video[autoplay]" in media and "visibilitychange', sync" in media
print('PASS: illustrated programme choices, five session actions, preserved compact kit details and automatic background-video playback.')

for file in ['assets/media/gym-field/bands-session-004-mobile.mp4','assets/media/gym-field/bands-in-use-mobile.mp4','assets/video/hero-loop-mobile-compatible.mp4']:
    data=(ROOT/file).read_bytes(); at=data.find(b'avcC')
    assert at>=0 and data[at+5]==66,('Expected baseline H.264 compatibility copy',file)
assert 'function fitBackground()' in media
print('PASS: three baseline H.264 mobile clips and proportional background sizing.')

# Current four-book reconciliation: removed products must not survive in duplicate panels.
assert metrics['publication_review']['guidebook']=='3.7'
assert metrics['publication_review']['encyclopedia']=='3.6'
for name,source in pages.items():
    parsed=Text();parsed.feed(source);visible=' '.join(parsed.parts)
    assert not re.search(r'tart cherry.{0,16}500\s*mg',visible,re.I),(name,'retired tart-cherry dose')
    assert 'CanPrev calcium</span>' not in source,(name,'removed calcium ingredient')
    assert 'FIT PROTOCOL · V3.2' not in visible,(name,'stale protocol edition label')
for name in ['guidebook.html','liquid-intake.html','fit-protocol-vectors.html','fit-protocol-vector-v5.html']:
    assert 'data-source-conflict="v5-collagen"' in pages[name],name
assert '341 mg is below' in pages['fit-protocol-dose.html']
assert '300 mcg PureGenomics + 125 mcg MuscleEAA = 425 mcg' in pages['fit-protocol-dose.html']
print('PASS: four-book versions, removed calcium/cherry rows, biotin attribution, magnesium arithmetic and unresolved V5 source difference.')

assert "V5 type unresolved; bovine 10 g in V10" in pages["fit-protocol-pathways.html"]
assert "V5, marine" not in pages["fit-protocol-pathways.html"]
assert "V10 (marine)" not in pages["fit-protocol-pathways.html"]

vector_registry=json.loads((ROOT/"assets/data/vector-registry.json").read_text(encoding="utf8"))
assert any("Bovine collagen 1 scoop, about 10 g" in v["ingredients"] for v in vector_registry["vectors"] if v["id"]=="v10")
