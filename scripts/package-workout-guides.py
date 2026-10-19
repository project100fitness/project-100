"""Package canonical PDFs and their edition register; preserve the legacy ZIP URL."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo
from hashlib import sha256
import json

root=Path(__file__).resolve().parent.parent
folder=root/'downloads/kinetics'
build=json.loads((folder/'pdf-build-report.json').read_text(encoding='utf8'))
paths=[folder/'pdf'/row['filename'] for row in build]
paths += [folder/name for name in ['training-plan-v0.3.json','edition-coverage.json','guide-page-layout.json','pdf-build-report.json','exercise-source-catalogue.csv']]
manifest={'edition':'2026-10-18','canonicalPdfCount':len(build),'files':[{'path':p.relative_to(folder).as_posix(),'sha256':sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in paths]}
target=folder/'PROJECT100_Workout_Guides_2026-10-18.zip'
readme='''PROJECT 100 / WORKOUT GUIDES / 18 OCTOBER 2026

48 canonical PDF documents, including the complete illustrated book,
focused and Pilates sessions, quick guides, one-page weekly log,
individual techniques and the source catalogue.

PDFs in this ZIP are the blank published versions. To include your saved
weekly notes, use Download PDF in the website's workout document drawer.

Five training days each contain 12 distinct illustrated exercises.
Days 5 and 6 use the Pilates kit only. Your trainer manages resistance.
Planned sets are prescriptions; recorded set totals remain unverified.
Unreviewed videos are outside this edition. The source catalogue and
edition coverage register distinguish evidence from kit adaptations.

MANIFEST.json records the exact current files and their SHA-256 hashes.
The older dated ZIP URL is retained as a compatibility alias of this package.
'''
def add(z,name,data):
    info=ZipInfo(name,(2026,10,18,0,0,0));info.compress_type=ZIP_DEFLATED
    info.create_system=3
    z.writestr(info,data)
with ZipFile(target,'w',compression=ZIP_DEFLATED,compresslevel=6) as archive:
    for p in paths:add(archive,p.relative_to(folder).as_posix(),p.read_bytes())
    add(archive,'MANIFEST.json',json.dumps(manifest,indent=2).encode())
    add(archive,'START_HERE.txt',readme.encode())
legacy=folder/'PROJECT100_Workout_Guides_v0.3_2026-10-15.zip'
legacy.write_bytes(target.read_bytes())
print(json.dumps({'path':target.name,'bytes':target.stat().st_size,'pdfs':len(build),'legacyAliasIdentical':legacy.read_bytes()==target.read_bytes()}))
