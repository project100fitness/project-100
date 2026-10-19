"""Read-only audit of current guides, legacy aliases, source evidence and archives.

Run with Python and pypdf from the repository root. No browser result is inferred
from this static audit; physical devices and visible PDF review remain separate.
"""
from pathlib import Path
from pypdf import PdfReader
from zipfile import ZipFile
from hashlib import sha256
import json, re

root=Path(__file__).resolve().parent.parent
folder=root/'downloads/kinetics'
db=json.loads((folder/'training-plan-v0.3.json').read_text(encoding='utf8'))
build=json.loads((folder/'pdf-build-report.json').read_text(encoding='utf8'))
report={'pdfs':[], 'aliases':[], 'archives':[], 'sessions':[]}
for item in build:
    p=folder/'pdf'/item['filename']; pdf=PdfReader(p,strict=True)
    assert len(pdf.pages)==item['pages'],p
    fields=pdf.get_fields() or {}; widgets=[]
    for page_number,page in enumerate(pdf.pages,1):
        w,h=float(page.mediabox.width),float(page.mediabox.height)
        for reference in page.get('/Annots',[]):
            a=reference.get_object()
            if a.get('/Subtype')!='/Widget':continue
            parent=a.get('/Parent'); parent=parent.get_object() if parent else a
            name=a.get('/T',parent.get('/T')); value=a.get('/V',parent.get('/V',''))
            rect=list(map(float,a['/Rect']))
            assert 0<=rect[0]<rect[2]<=w and 0<=rect[1]<rect[3]<=h,(p,name,rect)
            assert name in fields and fields[name].get('/V','')==value,(p,name,'field/widget mismatch')
            appearance=a.get('/AP',{}).get('/N')
            assert appearance and appearance.get_object().get_data(),(p,name,'missing appearance')
            widgets.append({'name':name,'page':page_number,'rect':rect})
    assert len(widgets)==len(fields),(p,'duplicate/orphan fields')
    if p.name in ('weekly-planner.pdf','weekly-overview.pdf'):assert len(fields)==7
    report['pdfs'].append({'name':p.name,'pages':len(pdf.pages),'fields':len(fields),'widgets':widgets,'sha256':sha256(p.read_bytes()).hexdigest()})

for p in sorted((folder/'pdf').glob('*.pdf')):
    if not re.search(r'level-[123]\.pdf$',p.name) and p.name!='protocols.pdf':continue
    canonical='complete-guide.pdf' if p.name.startswith('booklet') else 'focused-days.pdf' if p.name.startswith('focused') else 'full-body.pdf' if p.name.startswith('full-body') else 'weekly-planner.pdf' if p.name.startswith('planner') else 'exercise-guides.pdf'
    match=p.read_bytes()==(folder/'pdf'/canonical).read_bytes()
    assert match,(p,canonical)
    report['aliases'].append({'path':str(p.relative_to(root)),'canonical':canonical,'identical':match})

for p in sorted((root/'downloads').rglob('*.zip')):
    matched=[];stale=[];unmapped=[]
    with ZipFile(p) as archive:
        assert archive.testzip() is None,p
        if 'MANIFEST.json' in archive.namelist():
            manifest=json.loads(archive.read('MANIFEST.json'))
            assert manifest['canonicalPdfCount']==48
            for entry in manifest['files']:
                data=archive.read(entry['path'])
                assert sha256(data).hexdigest()==entry['sha256']
                assert data==(p.parent/entry['path']).read_bytes(),entry['path']
        for name in archive.namelist():
            if name.endswith('/'):continue
            if name in ('START_HERE.txt','MANIFEST.json'):continue
            rel=Path(name)
            candidates=[root/rel,p.parent/rel]
            # Packages can carry a top-level directory; resolve its published suffix.
            for i in range(1,len(rel.parts)):candidates.extend([root/Path(*rel.parts[i:]),p.parent/Path(*rel.parts[i:])])
            target=next((x for x in candidates if x.is_file() and x.suffix==rel.suffix),None)
            if not target:unmapped.append(name);continue
            (matched if archive.read(name)==target.read_bytes() else stale).append(name)
    assert not stale,(p,stale)
    report['archives'].append({'path':str(p.relative_to(root)),'matched':matched,'stale':stale,'unmapped':unmapped})

by={e['id']:e for e in db['exercises']+db['recordedVariants']}
for day in db['days']:
    if not day['slots']:continue
    ids=[s[0] for s in day['slots']];assert len(ids)==len(set(ids))==12
    assert len({by[id]['art'] for id in ids})==12
    if day['day'] in (5,6):assert all(by[id]['resistance']['system']=='hpygn-pilates' for id in ids)
    report['sessions'].append({'day':day['day'],'count':len(ids),'ids':ids,'plannedSets':'prescription, not observed recording counts'})
assert len({e['id'] for e in db['exercises']})==len(db['exercises'])
assert len({e['id'] for e in db['recordedVariants']})==len(db['recordedVariants'])
for v in db['recordedVariants']:
    assert v['sources'],v['id']
    if v.get('art'):assert (root/'assets/media/workout-guides'/v['art']).is_file(),v['id']
report['evidence']={'databaseEntries':len(db['exercises']),'cataloguedSetups':len(db['recordedVariants']),'illustratedEligibleSetups':sum(bool(v.get('art')) and v.get('trainingPrescriptionEligible') is not False for v in db['recordedVariants']),'sourcePassages':sum(len(v['sources']) for v in db['recordedVariants']),'recordedSetCountsVerified':False,'unreviewedVideosIncluded':False,'kitAdaptations':[e['id'] for e in db['exercises'] if e.get('isKitAdaptation')],'limits':'IDs, assets, references and planned slots reconciled; recordings were not re-analyzed.'}
output=root/'docs/continuation-2026-10-18'
output.mkdir(exist_ok=True)
(output/'publication-evidence-audit.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'pdfs':len(report['pdfs']),'pages':sum(x['pages'] for x in report['pdfs']),'aliases':len(report['aliases']),'archives':[{k:len(v) if isinstance(v,list) else v for k,v in x.items()} for x in report['archives']],'evidence':report['evidence']},indent=2))
