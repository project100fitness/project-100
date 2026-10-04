"""Check public text, untouched operational pages, and raster PowerPoint slides."""
from pathlib import Path
from zipfile import ZipFile
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
import subprocess, tempfile, re
import fitz
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
FORBIDDEN=re.compile(r'alcohol|heavy drinking|cessation|steatosis',re.I)
for p in ROOT.glob('*.html'):
    assert not FORBIDDEN.search(BeautifulSoup(p.read_text(),'html.parser').get_text()),p
allowed={'encyclopedia':{3},'simplified-structure':{3,20},'marketing-slider':{2,13}}
for p in (ROOT/'assets/downloads').glob('*.pdf'):
    current=fitz.open(p)
    original=fitz.open(stream=subprocess.check_output(['git','show','6af8793:'+str(p.relative_to(ROOT))],cwd=ROOT),filetype='pdf')
    assert len(current)==len(original),p
    permitted=next((v for k,v in allowed.items() if k in p.name),set())
    for i,page in enumerate(current):
        assert not FORBIDDEN.search(page.get_text()),(p,i)
        if i not in permitted:
            assert Counter(page.get_text().split())==Counter(original[i].get_text().split()),(p,i,'Operational text changed')
deck=next((ROOT/'assets/downloads').glob('*.pptx'))
with ZipFile(deck) as z, tempfile.TemporaryDirectory() as temp:
    images=[]
    for n in z.namelist():
        if n.startswith('ppt/media/'):
            p=Path(temp)/Path(n).name;p.write_bytes(z.read(n));images.append(p)
        elif n.endswith('.xml'):assert not FORBIDDEN.search(z.read(n).decode()),n
    def ocr(p):
        text=subprocess.check_output(['tesseract',str(p),'stdout'],stderr=subprocess.DEVNULL,text=True)
        assert not FORBIDDEN.search(text),(p.name,'Slide image privacy leak')
    with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(ocr,images))
print('PASS: public HTML, all PDF pages and all PowerPoint slide images are private; operational pages unchanged.')
