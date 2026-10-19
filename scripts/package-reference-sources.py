"""Repackage current source records with their explicitly dated reference papers."""
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
folder = root / 'downloads/reference'
analysis = json.loads((folder / 'project100-analysis-data.json').read_text(encoding='utf8'))
(folder / 'source-manifest.json').write_text(json.dumps(analysis['source_manifest'], indent=2) + '\n', encoding='utf8')
target = folder / 'project100-reference-source-package.zip'
names = ['long-recording-review.csv', 'media-inventory.csv', 'project100-analysis-data.json',
         'project100-encyclopedia-update.md', 'project100-encyclopedia-update.pdf',
         'project100-guidebook-update.md', 'project100-guidebook-update.pdf',
         'project100-master-analysis-reference.md', 'project100-master-analysis-reference.pdf',
         'README.md', 'recording-source-passages.csv', 'reference-build-report.json',
         'salad-model-scenarios.csv', 'source-manifest.json',
         'chest-source-review-2026-10-19.md', 'grip-and-illustration-review-2026-10-19.json']
with ZipFile(target, 'w', compression=ZIP_DEFLATED, compresslevel=6) as archive:
    for name in names:
        info = ZipInfo(name, (2026, 10, 19, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.create_system = 3
        archive.writestr(info, (folder / name).read_bytes())
print('Packaged current reference sources with dated papers and the 19 October correction registers.')
