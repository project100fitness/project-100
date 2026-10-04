"""Chronological vector folders and persona-free diagrams from the published Guidebook."""
from pathlib import Path
from bs4 import BeautifulSoup
from copy import deepcopy
from html import escape
import textwrap
ROOT=Path(__file__).resolve().parents[1]
s=BeautifulSoup((ROOT/'fit-nutrition.html').read_text(),'html.parser')
g=BeautifulSoup((ROOT/'guidebook.html').read_text(),'html.parser')
studio=s.select_one('.vector-studio');old={x.select_one('.stack-source')['href'].split('-')[-1]:x for x in studio.select('.vector-stack-file')}
studio.clear();studio['aria-label']='Chronological vector folders; open to read ingredients and protocols'
out=ROOT/'assets/downloads/vector-diagrams';out.mkdir(parents=True,exist_ok=True)
for i,key in enumerate(['v3','v1','v2','v4','v5','v10','pump']):
 record=g.select_one('#vector-'+key);label=record.h3.get_text(' ',strip=True);timing=record.select_one('.vector-scene b').get_text(' ',strip=True)
 ps=record.select(':scope > p');base=ps[0].get_text(' ',strip=True);ingredients=ps[1].get_text(' ',strip=True)
 file=deepcopy(old[key]);file['name']='vector-folders';file['data-vector']=key;file.attrs.pop('open',None)
 summary=file.summary;summary.clear()
 preview=s.new_tag('span',attrs={'class':'stack-preview'});preview.append(s.new_tag('img',src=f'assets/media/october-2026/vector-{key}.jpg',alt='',loading='lazy',width='1600',height='900'));summary.append(preview)
 text=s.new_tag('span',attrs={'class':'stack-title'});summary.append(text)
 for cls,value in [('stack-index',f'FILE {i+1:02d}' if key!='pump' else 'INACTIVE REFERENCE'),('stack-label',label),('stack-hint',timing.split('. Preceded')[0]),('stack-open','Open ingredients + protocol ↗')]:
  t=s.new_tag('span',attrs={'class':cls});t.string=value;text.append(t)
 content=file.select_one('.stack-content');content.clear()
 # Exact source words become a clean, persona-free illustrated ingredient sheet.
 color=file['style'].split('--vector-accent:')[1].split(';')[0]
 blocks=[('BASE',base),('INGREDIENTS',ingredients),('PROTOCOL',timing)]
 dl=record.select_one('.clinical-card dl')
 blocks += [(dt.get_text(' ',strip=True).upper(),dt.find_next_sibling('dd').get_text(' ',strip=True)) for dt in dl.select('dt')]
 rows=[];y=188
 for heading,value in blocks:
  rows.append(f'<text x="64" y="{y}" font-size="18" font-weight="700" fill="#534b42">{escape(heading)}</text>');y+=34
  for line in textwrap.wrap(value,width=88,break_long_words=False):
   rows.append(f'<text x="64" y="{y}" font-size="22" fill="#242424">{escape(line)}</text>');y+=32
  y+=30
 height=y+100
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{height}" viewBox="0 0 1200 {height}" role="img" aria-label="{escape(label)} ingredients and protocol"><rect width="1200" height="{height}" fill="#f6f2e9"/><rect width="1200" height="128" fill="{color}"/><g font-family="DejaVu Sans,Arial,sans-serif"><text x="64" y="46" font-size="16" fill="#242424">PROJECT 100 / DESCRIPTIVE VECTOR RECORD / V2.0</text><text x="64" y="96" font-size="36" font-weight="700" fill="#151515">{label}</text>'+''.join(rows)+f'<text x="64" y="{y+20}" font-size="16" fill="#534b42">Personal system record. Read the source before adopting a protocol.</text><text x="64" y="{y+48}" font-size="16" fill="#534b42">project100.fit/guidebook.html#vector-{key}</text></g></svg>'
 stem=f'project100-{key}-ingredients';(out/(stem+'.svg')).write_text(svg)
 import cairosvg
 cairosvg.svg2png(bytestring=svg.encode(),write_to=str(out/(stem+'.png')))
 sheet=s.new_tag('div',attrs={'class':'folder-sheet'})
 art=s.new_tag('div',attrs={'class':'folder-diagram'});art.append(s.new_tag('img',src=f'assets/downloads/vector-diagrams/{stem}.svg',alt=f'{label}: ingredient amounts, timing and protocol notes; no digital persona',loading='lazy',width='1200',height=str(height)));sheet.append(art)
 formula=s.new_tag('div',attrs={'class':'folder-formula'});sheet.append(formula)
 h=s.new_tag('h3');h.string=label;formula.append(h)
 p=s.new_tag('p',attrs={'class':'folder-timing'});p.string=timing;formula.append(p)
 p=s.new_tag('p');p.string=base;formula.append(p)
 ul=s.new_tag('ul',attrs={'class':'folder-ingredients'})
 for part in ingredients.split(';'):
  li=s.new_tag('li');li.string=part.strip();ul.append(li)
 formula.append(ul)
 clinical=deepcopy(record.select_one('.clinical-card'));clinical.attrs.pop('open',None);formula.append(clinical)
 downloads=s.new_tag('div',attrs={'class':'folder-downloads'})
 for ext in ['png','svg']:
  a=s.new_tag('a',href=f'assets/downloads/vector-diagrams/{stem}.{ext}',download=f'{stem}.{ext}');a.string=f'Download {ext.upper()} ↓';downloads.append(a)
 formula.append(downloads)
 a=s.new_tag('a',href=f'guidebook.html#vector-{key}',attrs={'class':'stack-source'});a.string='Read the current Guidebook record →';formula.append(a)
 content.append(sheet)
 studio.append(file)
s.select_one('#vectors .vector-entry p').string='Open a folder in daily order to explore its ingredients, timing and current protocol. Save a descriptive diagram without the digital persona.'
(ROOT/'fit-nutrition.html').write_text(str(s))
for name in ['index.html','fit-workout.html','fit-nutrition.html','gear-shop.html']:
 p=ROOT/name;doc=BeautifulSoup(p.read_text(),'html.parser')
 for tag in doc.select('script[src*="carousel.js"],script[src*="fixonic.js"],script[src*="vector-studio.js"]'):tag['src']=tag['src'].split('?')[0]+'?v=20261004-folders'
 for tag in doc.select('link[href*="vector-studio.css"]'):tag['href']=tag['href'].split('?')[0]+'?v=20261004-folders'
 if name=='index.html' and not doc.select_one('script[src*="journey-loop.js"]'):doc.head.append(doc.new_tag('script',src='assets/js/journey-loop.js?v=20261004-folders',defer=''))
 p.write_text(str(doc))
governance=ROOT/'CONTENT_GOVERNANCE.md'
if 'Vector folders follow the published daily order' not in governance.read_text():
 governance.write_text(governance.read_text()+'\nVector folders follow the published daily order: V3, V1, V2, V4, V5, V10, then inactive PUMP. Each offers a persona-free PNG and SVG diagram generated from the current Guidebook. Regenerate with `python scripts/apply_vector_folders.py`.\n')
print('Built 7 chronological folders and 14 persona-free diagram downloads.')
