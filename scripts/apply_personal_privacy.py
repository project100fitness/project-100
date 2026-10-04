"""Author-requested privacy edits to public editions; preserve operational records."""
from pathlib import Path
import fitz
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import io
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FILES = ROOT / 'assets/downloads'

def replace(page, spans, text, bold=False, size=None, width=None):
    rect = fitz.Rect(spans[0]['bbox'])
    for span in spans[1:]: rect |= fitz.Rect(span['bbox'])
    # Remove actual text objects, not a visual cover that leaves searchable text.
    for span in spans: page.add_redact_annot(fitz.Rect(span['bbox']), fill=False)
    page.apply_redactions(images=0, graphics=0)
    rect.x1 = rect.x0 + width if width else max(rect.x1, page.rect.width - 49)
    font_size = size or spans[0]['size']
    rect.y0 -= 1
    rect.y1 += 2
    font = 'hebo' if bold else 'helv'
    while page.insert_textbox(rect, text, fontsize=font_size, fontname=font,
                             color=(.12,.12,.12), lineheight=1.15) < 0:
        font_size -= .25
        if font_size < 7: raise RuntimeError('Replacement does not fit')

def spans(page):
    return [s for b in page.get_text('dict')['blocks'] if 'lines' in b
            for line in b['lines'] for s in line['spans']]

def edit(name, callback):
    path = FILES / name
    doc = fitz.open(path)
    changed = callback(doc)
    if changed:
        temp = path.with_suffix('.privacy.pdf')
        doc.save(temp, garbage=4, deflate=True)
        doc.close(); temp.replace(path)
    else: doc.close()
    print(name, 'privacy updated' if changed else 'already private')

def master(doc):
    page = doc[3]; ss = spans(page)
    if not any('heavy alcohol' in s['text'].lower() for s in ss): return False
    history = [s for s in ss if 140 < s['bbox'][1] < 170]
    replace(page, history, 'A difficult personal period disrupted routines. In 2026, attention returned to health and gym training. The current source profile reports age 46 and body weight')
    heading = [s for s in ss if 389 < s['bbox'][1] < 402]
    replace(page, heading, 'Clinical analysis - rebuilding after a prolonged interruption.', bold=True)
    body = [s for s in ss if 406 < s['bbox'][1] < 451]
    replace(page, body, 'A prolonged interruption can affect strength, nutrition, sleep and recovery. Retraining builds capacity through repeatable mechanical loading, adequate energy and sleep. The 2026 ACSM position supports individualized')
    return True

def simplified(doc):
    page = doc[3]; ss = spans(page)
    if not any('heavy' in s['text'].lower() for s in ss): return False
    replace(page, [s for s in ss if 119 < s['bbox'][1] < 146],
            'Underneath the tables, Project 100 is a return story: a difficult personal period, a fresh start, and rebuilding a daily structure for training, recovery and sleep.')
    replace(page, [s for s in ss if 184 < s['bbox'][1] < 194 and s['bbox'][0] > 170],
            'A difficult personal period interrupted regular routines.', size=8.295)
    replace(page, [s for s in ss if 207 < s['bbox'][1] < 230 and s['bbox'][0] > 170],
            'A fresh start. Attention returns to health and a repeatable daily routine.', size=8.295)
    page = doc[20]; ss = spans(page)
    replace(page, [s for s in ss if 'heavy drinking' in s['text'].lower()],
            'Project 100 is my return: a difficult personal period, a fresh start, and rebuilding through 2026.')
    return True

def marketing(doc):
    changed=False
    for page in doc:
        blocks=[b for b in page.get_text('dict')['blocks'] if 'lines' in b]
        for b in blocks:
            group=[s for l in b['lines'] for s in l['spans']]
            text=''.join(s['text'] for s in group).lower()
            if 'alcohol' in text:
                replace(page,group,'Difficult personal period.\nInterrupted routines,\nreduced strength,\nbroken sleep.',width=137);changed=True
            elif 'cessation' in text and page.number==2:
                replace(page,group,'A fresh start.\nRebuilding routines,\nrecovery and\nconsistent training.',width=137);changed=True
            elif 'cessation' in text:
                replace(page,group,'Clinical consensus. Retraining, progressive load,\nadequate nutrition, sleep and routine recovery.',width=385);changed=True
    return changed

edit('project-100-encyclopedia-v2-0-2026-10-03.pdf', master)
edit('project-100-simplified-structure-v2-0-2026-10-03.pdf', simplified)
edit('project-100-marketing-slider-v2-0-2026-10-03.pdf', marketing)

# The editable deck uses slide-sized bitmap artwork, so text XML searches alone
# cannot verify privacy. Replace the affected slides from the public PDF pages.
deck=FILES/'project-100-marketing-slider-v2-0-2026-10-03.pptx'
pdf=fitz.open(FILES/'project-100-marketing-slider-v2-0-2026-10-03.pdf')
with ZipFile(deck) as z:
    entries={n:z.read(n) for n in z.namelist()}
    deck_changed=False
    for number in [3,14]:
        rels=ET.fromstring(entries[f'ppt/slides/_rels/slide{number}.xml.rels'])
        images=[r for r in rels if r.attrib.get('Type','').endswith('/image')]
        if len(images)!=1: raise RuntimeError('Unexpected Marketing slide image structure')
        target='ppt/'+images[0].attrib['Target'].replace('../','')
        original=Image.open(io.BytesIO(entries[target])); w,h=original.size
        page=pdf[number-1]; pix=page.get_pixmap(matrix=fitz.Matrix(w/page.rect.width,h/page.rect.height))
        rendered=pix.tobytes('png')
        deck_changed |= entries[target]!=rendered
        entries[target]=rendered
if deck_changed:
    temp=deck.with_suffix('.privacy.pptx')
    with ZipFile(temp,'w') as z:
        for n,data in entries.items(): z.writestr(n,data)
    temp.replace(deck)
