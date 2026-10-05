"""Apply the author-supplied October 5 registry after the historical publication build."""
from pathlib import Path
from copy import deepcopy
from html import escape
import json, textwrap, shutil
from bs4 import BeautifulSoup
import cairosvg

ROOT=Path(__file__).resolve().parents[1]
registry=json.loads((ROOT/'assets/data/vector-registry.json').read_text())
vectors={v['id']:v for v in registry['vectors']}
ORDER=['v3','v1','v2','v4','v5','v10','v6']
OUT=ROOT/'assets/downloads/vector-diagrams'
OUT.mkdir(parents=True,exist_ok=True)
for key,v in vectors.items():
 blocks=[('DEPLOYMENT',v['deployment']),('BASE',v['base']),('INGREDIENTS','; '.join(v['ingredients'])),('PROTOCOL',v['timing'])]
 clinical=BeautifulSoup(v['clinical_html'],'html.parser')
 for dt in clinical.select('dt'):
  blocks.append((dt.get_text(' ',strip=True).upper(),dt.find_next_sibling('dd').get_text(' ',strip=True)))
 rows=[];y=180
 for title,value in blocks:
  rows.append(f'<text x="64" y="{y}" font-size="18" font-weight="700" fill="#534b42">{escape(title)}</text>');y+=34
  for line in textwrap.wrap(value,width=84,break_long_words=False):
   rows.append(f'<text x="64" y="{y}" font-size="22" fill="#242424">{escape(line)}</text>');y+=32
  y+=28
 height=y+100
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{height}" viewBox="0 0 1200 {height}" role="img" aria-label="{escape(v["name"])} descriptive record"><rect width="1200" height="{height}" fill="#f6f2e9"/><rect width="1200" height="128" fill="#ec6278"/><g font-family="DejaVu Sans,Arial,sans-serif"><text x="64" y="46" font-size="16">PROJECT 100 / DESCRIPTIVE VECTOR RECORD / 5 OCTOBER 2026</text><text x="64" y="96" font-size="36" font-weight="700">{escape(v["name"])}</text>'+''.join(rows)+f'<text x="64" y="{y+20}" font-size="16">Personal system record; not a safety guarantee or prescription.</text><text x="64" y="{y+48}" font-size="16">project100.fit/fit-protocol-vector-{key}.html</text></g></svg>'
 (OUT/f'project100-{key}-ingredients.svg').write_text(svg)
 cairosvg.svg2png(bytestring=svg.encode(),write_to=str(OUT/f'project100-{key}-ingredients.png'))
 # Existing download URLs also receive the corrected V6 record.
 if key=='v6':
  for ext in ['svg','png']:shutil.copyfile(OUT/f'project100-v6-ingredients.{ext}',OUT/f'project100-pump-ingredients.{ext}')

old=ROOT/'fit-protocol-vector-pump.html'
if old.exists() and BeautifulSoup(old.read_text(),'html.parser').select_one('.page-shell'):
 (ROOT/'fit-protocol-vector-v6.html').write_text(old.read_text())

replacements={
 'PUMP is preserved for reference and strictly inactive.':'V6 PUMP is the evening-training override; inactive during morning training and rest days.',
 'PUMP is inactive.':'V6 PUMP is the evening-training override and is inactive in States A and B.',
 'the inactive PUMP':'V6 PUMP (evening override)',
 'The evening PUMP alternative is inactive.':'V6 PUMP is the evening-training override, excluded from morning training and rest days.',
 'PUMP branch inactive.':'V6 PUMP now has a separate evening-training branch (5 October 2026).',
 'PUMP inactive':'V6 PUMP inactive in morning/rest branches; evening override only',
}
for path in ROOT.glob('*.html'):
 s=BeautifulSoup(path.read_text(),'html.parser')
 if not s.select_one('.page-shell'):continue
 for node in s.find_all(string=True):
  if node.parent.name in ['script','style']:continue
  value=str(node)
  for before,after in replacements.items():value=value.replace(before,after)
  if value!=str(node):node.replace_with(value)
 for p in s.select('p'):
  if p.get_text().endswith('The evening PUMP branch is strictly'):
   p.string=p.get_text().replace('The evening PUMP branch is strictly','V6 PUMP is an evening-training override.')
   sibling=p.find_next_sibling('p')
   if sibling and sibling.get_text().startswith('inactive and must never'):sibling.string='V6 remains inactive on morning/rest days and must never be combined with V1 on the same calendar day.'
 for a in s.select('a[href]'):
  a['href']=a['href'].replace('fit-protocol-vector-pump.html','fit-protocol-vector-v6.html').replace('#vector-pump','#vector-v6')
  if a.get_text(' ',strip=True)=='PUMP EVENING':a.string='V6 PUMP'
 for script in s.select('script[src*="v2.js"],script[src*="filing-navigation.js"]'):script['src']=script['src'].split('?')[0]+'?v=20261005-v6'
 for folder in s.select('.vector-stack-file'):
  key=folder.get('data-vector');key='v6' if key=='pump' else key
  if key not in vectors:continue
  v=vectors[key];folder['data-vector']=key
  label=folder.select_one('.stack-label');label.string=v['name']
  folder.select_one('.stack-index').string='V6 · EVENING OVERRIDE' if key=='v6' else f'FILE {ORDER.index(key)+1:02d}'
  folder.select_one('.stack-hint').string=v['deployment']
  for node in folder.select('[id="vector-pump"]'):node['id']='vector-v6'
  formula=folder.select_one('.folder-formula');formula.h3.string=v['name']
  ps=formula.select(':scope > p');ps[0].string=v['timing'];ps[1].string=v['base']
  ul=formula.select_one('.folder-ingredients');ul.clear()
  for ingredient in v['ingredients']:
   li=s.new_tag('li');li.string=ingredient;ul.append(li)
  clinical=formula.select_one('.clinical-card')
  clinical.replace_with(BeautifulSoup(v['clinical_html'],'html.parser'))
  diagram=folder.select_one('.folder-diagram img');diagram['src']=f'assets/downloads/vector-diagrams/project100-{key}-ingredients.svg';diagram['alt']=v['name']+' ingredients and deployment; no digital persona'
  # Dimensions match the newly generated SVG, avoiding stale layout proportions.
  svg=BeautifulSoup((OUT/f'project100-{key}-ingredients.svg').read_text(),'xml').svg
  diagram['width']=svg['width'];diagram['height']=svg['height']
  for a in folder.select('.folder-downloads a'):
   ext=a['href'].split('.')[-1];a['href']=f'assets/downloads/vector-diagrams/project100-{key}-ingredients.{ext}';a['download']=f'project100-{key}-ingredients.{ext}'
  source=folder.select_one('.stack-source');source['href']=f'fit-protocol-vector-{key}.html#vector-{key}';source.string='Read the current vector record →'
 for holder in s.select('[id="vector-pump"]'):holder['id']='vector-v6'
 for tr in s.select('tr'):
  cells=tr.select(':scope > td')
  if cells and cells[0].get_text(' ',strip=True) in ['PUMP EVENING','PUMP branch']:
   cells[0].string='V6 PUMP'
   if len(cells)==4:
    cells[1].string=vectors['v6']['deployment'];cells[2].string=vectors['v6']['base']+'; '+'; '.join(vectors['v6']['ingredients']);cells[3].string='Documented evening override; V1 and V6 mutually exclusive.'
   else:
    for cell in cells[1:]:cell.string='Inactive on morning/rest days; State C evening override replaces V1.'
 if path.name=='fit-protocol-vector-v6.html':
  s.title.string='PROJECT 100 — FIT PROTOCOL | V6 PUMP'
  intro=s.select_one('.v2-intro,.compact-page-identity');intro.h1.string='V6 PUMP'
  for canonical in s.select('link[rel="canonical"],meta[property="og:url"]'):canonical['href' if canonical.name=='link' else 'content']='https://project100.fit/fit-protocol-vector-v6.html'
  for tag in s.select('meta[property="og:title"],meta[name="twitter:title"]'):tag['content']=s.title.string
 if path.name=='guidebook.html':
  today=s.select_one('#today')
  for old_card in today.select('.clock-card[data-branch="evening"]'):old_card.decompose()
  controls=today.select_one('.day-controls')
  controls.select_one('[data-day="training"]').string='Morning gym'
  if not controls.select_one('[data-day="evening"]'):
   b=s.new_tag('button',type='button',attrs={'class':'v2-button','data-day':'evening','aria-pressed':'false'});b.string='Evening gym';controls.select_one('#dayStatus').insert_before(b)
  today.select_one('.v2-note').string='Reference anchors, not rigid deadlines. Choose one branch: V1 morning or V6 evening; neither on rest days. Evening pill-grid timing is not specified by the new vector documents.'
  clock=today.select_one('.daily-clock')
  for time,text,key in [('04:00 reference','V3 RECOVERY — daily anchor','v3'),('T−30 minutes','Citicoline 250 mg, swallowed separately; V1 is inactive','v6'),('20–30 minutes before the session','V6 PUMP — evening-training override; V5 is inactive','v6'),('During the evening session','V2 REFUEL — same recorded formula, session-relative timing','v2'),('After the evening session','Whole R-ALA 300 mg with water, then V4 RELOAD; capsule stays outside the shaker','v4'),('Night anchor','V10 SHUTDOWN — comfortable-temperature tisane','v10')]:
   card=s.new_tag('article',attrs={'class':'clock-card','data-branch':'evening'});card.append(BeautifulSoup(f'<span class="branch-name">EVENING GYM · STATE C</span><p><time>{escape(time)}</time></p><p>{escape(text)}</p><a href="fit-protocol-vector-{key}.html">Open the vector record ↗</a>','html.parser'));clock.append(card)
 # A short registry summary makes the new authority explicit beside older source chapters.
 if path.name in ['fit-protocol-vector-reference.html','fit-protocol-fuel.html','fit-protocol.html']:
  for prior in s.select('.vector-registry-update'):prior.decompose()
  section=s.new_tag('section',attrs={'class':'vector-registry-update focused-notes'})
  section.append(BeautifulSoup('<h2>Vector registry · 5 October 2026</h2><p>Morning: V3, V1, V2, V4, V10. Rest: V3 when consumed, V5, V10. Evening override: V3, V6, V2 during the session, V4 afterward, V10 at night. V1 and V6 are never combined on the same calendar day; both are inactive on rest days. V7–V9 have no supplied records.</p><p>V6 supersedes the older unnumbered, permanently inactive PUMP designation. Existing artwork may still say PUMP; the page record and descriptive downloads carry V6.</p>','html.parser'))
  intro=s.select_one('.v2-intro,.compact-page-identity');intro.insert_after(section)
 if path.name=='library.html':
  for prior in s.select('#vector-registry-release'):prior.decompose()
  section=s.new_tag('section',id='vector-registry-release',attrs={'class':'focused-notes'})
  section.append(BeautifulSoup('<h2>Latest vector registry · 5 October 2026</h2><p>The 3 October book files remain dated publications. The live vector pages and descriptive PNG/SVG downloads include the V6 evening override added on 5 October.</p><p><a href="fit-protocol-vectors.html">Open the current vector directory ↗</a></p>','html.parser'));s.select_one('main').append(section)
 path.write_text(str(s))

for manifest in ['main-files.json','protocol-files.json']:
 p=ROOT/'assets/js'/manifest;data=json.loads(p.read_text())
 for item in data['files']:
  if item['file']=='fit-protocol-vector-pump.html':item['file']='fit-protocol-vector-v6.html';item['label']='V6 PUMP'
 p.write_text(json.dumps(data,indent=2)+'\n')
js=ROOT/'assets/js/filing-navigation.js'
text=js.read_text().replace('fit-protocol-vector-pump.html#vector-pump','fit-protocol-vector-v6.html#vector-v6')
text=text.replace('"vector-pump":','"vector-v6": "fit-protocol-vector-v6.html#vector-v6", "vector-pump":') if '"vector-v6":' not in text else text
js.write_text(text)
# Preserve inbound bookmarks while giving V6 one canonical page.
old.write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>V6 PUMP — PROJECT 100</title><link rel="canonical" href="https://project100.fit/fit-protocol-vector-v6.html"><meta http-equiv="refresh" content="0; url=fit-protocol-vector-v6.html"></head><body><a href="fit-protocol-vector-v6.html">Continue to V6 PUMP</a><script>location.replace("fit-protocol-vector-v6.html"+location.search+(location.hash==="#vector-pump"?"#vector-v6":location.hash))</script></body></html>')
governance=ROOT/'CONTENT_GOVERNANCE.md'
update='\n5 October registry extension: latest author PDFs formally assign PUMP to V6, with a separate evening override. Older unnumbered/permanently inactive PUMP passages are superseded. Live records and diagrams follow assets/data/vector-registry.json; source limits are documented in VECTOR_REGISTRY_RELEASE.md.\n'
if update.strip() not in governance.read_text():governance.write_text(governance.read_text()+update)
sitemap=ROOT/'sitemap.xml'
sitemap.write_text(sitemap.read_text().replace('fit-protocol-vector-pump.html','fit-protocol-vector-v6.html'))
print('Applied seven source-backed vector records, V6 route, three deployment states and corrected diagrams.')
