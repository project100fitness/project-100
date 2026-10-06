"""Final overlay: single-page nutrition, ordered tabs and compact publication footer."""
from pathlib import Path
from copy import deepcopy
import json
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
ORDER=['index.html','fit-workout.html','liquid-intake.html','fit-nutrition.html','gear-shop.html']
s=BeautifulSoup((ROOT/'fit-nutrition.html').read_text(),'html.parser')
directory=s.select_one('#nutrition-files')
if directory:directory.decompose()
content=s.select_one('.folder-page-content')
for file,id in [('fit-meals.html','reels'),('fit-nutrition-notes.html','clinical-nutrition')]:
 if not s.select_one('#'+id):
  source=BeautifulSoup((ROOT/file).read_text(),'html.parser').select_one('#'+id)
  content.append(deepcopy(source))
# Shared meal widgets need the same styles/scripts as the original meal page.
meal=BeautifulSoup((ROOT/'fit-meals.html').read_text(),'html.parser')
for tag in meal.select('link[rel="stylesheet"],script[src]'):
 attr='href' if tag.name=='link' else 'src'
 if not s.find(tag.name,attrs={attr:tag[attr]}):s.head.append(deepcopy(tag))
# Keep historical tables available without a long default mobile scroll.
notes=s.select_one('#clinical-nutrition')
if notes and not notes.select_one('.nutrition-history'):
 table=notes.select_one('table')
 if table:
  details=s.new_tag('details',attrs={'class':'nutrition-history nutrition-source-file'})
  summary=s.new_tag('summary');summary.string='Historical meal modules · ingredients & macros'
  details.append(summary);table.replace_with(details);details.append(table)
(ROOT/'fit-nutrition.html').write_text(str(s))
manifest=json.loads((ROOT/'assets/js/main-files.json').read_text())
for key in ['fit-nutrition.html:reels','fit-nutrition.html:clinical-nutrition']:manifest['routes'].pop(key,None)
(ROOT/'assets/js/main-files.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
p=ROOT/'assets/js/main-files.js';text=p.read_text()
for key,target in [('reels','fit-meals.html#reels'),('clinical-nutrition','fit-nutrition-notes.html#clinical-nutrition')]:text=text.replace('"fit-nutrition.html:'+key+'": "'+target+'", ','')
p.write_text(text)
COPY={
 '80 g dry roasted kasha + Earl Grey tea in the recorded breakfast.':'80 g dry roasted kasha + Earl Grey tea.',
 'Smoothies, bowls, wraps and salads from the meal journal.':'Smoothies · bowls · wraps · salads.',
 'Seven vectors: morning training, rest or evening training.':'Seven vectors · morning, rest and evening branches.',
 'Train like 2, eat for 2. The historical 252 g protein and 69 g fat figures are legacy planning values. Whole-diet verification remains deferred; use the current Encyclopedia for their context and limits.':'Historical plan: 252 g protein · 69 g fat. Whole-day intake remains unverified. See the source notes for context.',
 '360 lbs of Variable Linear Resistance banding, light at the bottom of the rep and heaviest at lockout, matching the human strength curve instead of fighting it. The gym walkthrough and the full rig database are both below.':'Recorded band setup: 360 lb nominal rating. Tension increases with stretch; actual force varies by configuration.',
 'The earlier three-phase roadmap is a planning illustration. V2.0 uses quarterly review, comparable measurements and symptom-guided progression; it does not promise a fixed growth rate or completion deadline.':'Plan: quarterly review · comparable measurements · symptom-guided progression. No fixed growth rate or completion deadline.',
 'The personal goal is 100 lb of bioimpedance-estimated skeletal muscle mass below 15% body fat. Track comparable measurements, waist, performance and symptoms together. The target is an aspiration, not a guaranteed result or a biological ceiling.':'Goal: 100 lb bioimpedance-estimated skeletal muscle mass · below 15% body fat. Track measurements, waist, performance and symptoms together. Aspirational; no guaranteed result.',
}
for p in ROOT.glob('*.html'):
 s=BeautifulSoup(p.read_text(),'html.parser')
 if not s.select_one('.page-shell'):continue
 nav=s.select_one('.site-head > .page-tabs:not(.focused-subtabs) .wrap')
 if nav and nav.find('a',href='liquid-intake.html'):
  links={a.get('href'):a for a in nav.select('a')}
  if all(file in links for file in ORDER):
   nav.clear()
   for file in ORDER:nav.append(links[file])
   current=next((i for i,file in enumerate(ORDER) if 'current' in links[file].get('class',[])),0)
   for a in s.select('.page-nav-arrow'):
    delta=-1 if 'prev' in a.get('class',[]) else 1;target=ORDER[(current+delta)%len(ORDER)]
    a['href']=target;a['aria-label']=('Previous' if delta<0 else 'Next')+' page: '+links[target].get_text(strip=True)
   drawer=s.select_one('#siteDrawer nav')
   if drawer:
    drawer.clear()
    for file in ORDER:drawer.append(deepcopy(links[file]))
 if p.name in ['fit-nutrition.html','fit-meals.html','fit-nutrition-notes.html']:
  for rail in s.select('.folder-page-rail'):rail.decompose()
  layout=s.select_one('.folder-page-layout')
  if layout and 'single-file-layout' not in layout.get('class',[]):layout['class']=layout.get('class',[])+['single-file-layout']
 for a in s.select('a[href]'):
  href=a['href'];file=href.split('#')[0]
  if file in ['fit-meals.html','fit-nutrition-notes.html']:
   a['href']='fit-nutrition.html#'+(href.split('#',1)[1] if '#' in href else ('reels' if file=='fit-meals.html' else 'clinical-nutrition'))
 for x in s.select('p'):
  t=x.get_text(' ',strip=True)
  if t in COPY:x.clear();x.append(COPY[t])
 for footer in s.select('.v2-footer'):
  footer.clear();footer['class']=['v2-footer','compact-footer']
  fragment=BeautifulSoup('<div class="compact-footer-links"><a href="index.html">PROJECT 100</a><a href="https://www.instagram.com/fudge_fit/" target="_blank" rel="noopener">Instagram ↗</a><a href="https://www.youtube.com/@FUDGE_fit" target="_blank" rel="noopener">YouTube ↗</a></div><p>Personal record · not medical advice. Consult your clinician before changing medication, supplements or training.</p>','html.parser')
  for tag in list(fragment.contents):footer.append(tag)
 for bar in s.select('.publication-bar'):bar.string='Guidebook · Files · Downloads ↗'
 for old in s.select('link[href*="compact-pages.css"]'):old.decompose()
 s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/compact-pages.css?v=20261006'))
 p.write_text(str(s))
print('Applied single-page nutrition, navigation order, concise summaries and compact footer.')
