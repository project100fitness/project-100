from pathlib import Path
from copy import deepcopy
from html import escape as e
import json
from bs4 import BeautifulSoup
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
REG=json.loads((ROOT/'assets/data/vector-registry.json').read_text())['vectors']
M=json.loads((ROOT/'assets/data/current-metrics.json').read_text())
CSS='assets/css/nutrition-overview.css'
main=json.loads((ROOT/'assets/js/main-files.json').read_text())
if not any(x['file']=='liquid-intake.html' for x in main['files']):
 i=next(i for i,x in enumerate(main['files']) if x['file']=='gear-shop.html')
 main['files'].insert(i,{'file':'liquid-intake.html','label':'Liquid Intake','group':'liquid'})
for x in main['files']:
 if x['file']=='fit-nutrition.html':x['label']='Nutrition overview'
main['routes']['fit-nutrition.html:vectors']='liquid-intake.html'
(ROOT/'assets/js/main-files.json').write_text(json.dumps(main,indent=2)+'\n')
# The main-site bookmark must remain on the main site.
p=ROOT/'assets/js/main-files.js';p.write_text(p.read_text().replace('"fit-nutrition.html:vectors": "fit-protocol-vectors.html"','"fit-nutrition.html:vectors": "liquid-intake.html"'))

def img(src,alt='',cls=''):
 with Image.open(ROOT/src) as photo:w,h=photo.size
 return f'<img src="{src}" alt="{e(alt)}" width="{w}" height="{h}" loading="lazy" class="{cls}">'
def section(s,id,markup):
 tag=s.new_tag('section',id=id,attrs={'class':'nutrition-overview wrap'})
 tag.append(BeautifulSoup(markup,'html.parser'));return tag
def note_card(title,text,src=None):
 return '<article class="nutrition-info-card">'+(img(src,'') if src else '')+'<div><h3>'+e(title)+'</h3><p>'+e(text)+'</p></div></article>'
def summary_cards():
 n=M['historical_nutrition_plan']
 return '<div class="nutrition-info-grid">'+''.join([
 note_card('Breakfast / primer','80 g dry roasted kasha + Earl Grey tea in the recorded breakfast.','assets/media/october-2026/nutrition-pantry-july-2026.jpg'),
 note_card('Meals from the journal','Smoothies, bowls, wraps and salads from the meal journal.','assets/img/protein-berries-smoothie.jpg'),
 note_card('Liquid routine','Seven vectors: morning training, rest or evening training.'),
 note_card('Planning reference',f"{n['energy_kcal']:,} kcal · {n['protein_g']} g protein · {n['fat_g']} g fat. Historical plan; whole-day intake is not verified.")])+'</div>'
# A separate MAIN-site page uses neutral, source-labelled vessel diagrams,
# not the persona photographs used by the detailed FIT PROTOCOL files.
s=BeautifulSoup((ROOT/'fit-nutrition.html').read_text(),'html.parser')
content=s.select_one('.folder-page-content');content.clear()
for rail in s.select('.folder-page-rail'):rail.decompose()
layout=s.select_one('.folder-page-layout');layout['class']=layout.get('class',[])+['single-file-layout']
hero=s.new_tag('section',id='top',attrs={'class':'main-file-intro compact-page-identity'})
hero.append(BeautifulSoup('<div class="wrap"><span class="v2-kicker">PROJECT_100 · LIQUID INTAKE</span><h1>Liquid Intake</h1><p>A simple guide to the recorded drinks. Open each file here; full protocol notes stay at the end.</p></div>','html.parser'));content.append(hero)
content.append(section(s,'liquid-overview','<div class="liquid-branch-strip"><span><strong>Morning training</strong> V1 before the session</span><span><strong>Rest</strong> V1 and V6 inactive</span><span><strong>Evening training</strong> V6 replaces V1</span></div><p class="nutrition-small-note">V1 and V6 are never combined on the same calendar day. Ingredients below reproduce the personal record, not a prescription.</p>'))
white_cards={'v3':'assets/media/october-2026/ingredient-cards/v3-white.png','v4':'assets/media/october-2026/ingredient-cards/v4-white.png'}
colors={'v1':'#a6c969','v2':'#64c9d6','v3':'#dfbf75','v4':'#ea637c','v5':'#94a9dd','v6':'#cd94de','v10':'#b2a0cf'}
artdir=ROOT/'assets/img/liquid-overview';artdir.mkdir(exist_ok=True)
cards=[]
for key in ['v3','v1','v2','v4','v5','v10','v6']:
 v=next(v for v in REG if v['id']==key);color=colors[key]
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><rect width="320" height="180" rx="16" fill="#171b23"/><circle cx="258" cy="45" r="67" fill="{color}" opacity=".13"/><g fill="none" stroke="{color}" stroke-width="3"><path d="M119 53h82l-10 104h-62z"/><path d="M118 53v-15h84v15M140 38v-9h30v9M130 101h60M135 114h49M137 127h18"/></g><text x="24" y="30" fill="{color}" font-family="sans-serif" font-size="18" font-weight="700">{key.upper()}</text><text x="24" y="163" fill="#bfc6d0" font-family="sans-serif" font-size="10">SCHEMATIC · NOT A PRODUCT PHOTO</text></svg>'''
 (artdir/f'{key}.svg').write_text(svg)
 preview=white_cards.get(key,f'assets/img/liquid-overview/{key}.svg')
 pw,ph=(320,180)
 if key in white_cards:
  with Image.open(ROOT/preview) as photo:pw,ph=photo.size
 full_card='<a class="white-ingredient-card" href="'+preview+'" target="_blank" rel="noopener">'+img(preview,v['name']+' ingredient illustration')+'</a>' if key in white_cards else ''
 ingredients=''.join('<li>'+e(i)+'</li>' for i in v['ingredients'])
 extra='Whole R-ALA 300 mg is taken separately before the shaker.' if key=='v4' else 'No added salt or creatine HCl in this shaker.' if key=='v6' else ''
 cards.append(f'''<details class="simple-liquid-file" id="vector-{key}" style="--liquid-accent:{color}" name="main-liquid-files"><summary><img src="{preview}" alt="" width="{pw}" height="{ph}" loading="lazy"><span><strong>{e(v['name'])}</strong><small>{e(v['deployment'])}</small></span><span class="liquid-fold-mark" aria-hidden="true">+</span></summary><div class="simple-liquid-content">{full_card}<p class="liquid-base"><strong>Base</strong> {e(v['base'])}</p><ul class="simple-liquid-ingredients">{ingredients}</ul><p><strong>Protocol</strong> {e(v['timing'])}</p>{'<p>'+e(extra)+'</p>' if extra else ''}<p class="simple-liquid-links"><a href="{white_cards.get(key,"assets/downloads/vector-diagrams/project100-"+key+"-ingredients.png")}" download="project100-{key}-ingredients.png">Save descriptive diagram</a> · <a href="fit-protocol-vector-{key}.html">Full protocol details →</a></p></div></details>''')
content.append(section(s,'liquid-files','<h2>Seven recorded files</h2><div class="simple-liquid-grid">'+''.join(cards)+'</div>'))
for tag in s.select('script[src*="vector-studio.js"]'):tag.decompose()
s.title.string='PROJECT 100 | Liquid Intake'
for selector,key,value in [('meta[name="description"]','content','A simple PROJECT 100 Liquid Intake guide: seven source-backed vectors, branch rules, ingredients and descriptive diagram downloads.'),('meta[property="og:title"]','content',s.title.string),('meta[name="twitter:title"]','content',s.title.string),('link[rel="canonical"]','href','https://project100.fit/liquid-intake.html'),('meta[property="og:url"]','content','https://project100.fit/liquid-intake.html')]:
 tag=s.select_one(selector)
 if tag:tag[key]=value
for tag in s.select('meta[property="og:description"],meta[name="twitter:description"]'):tag['content']=s.select_one('meta[name="description"]')['content']
image='assets/media/october-2026/ingredient-cards/v4-white.png'
with Image.open(ROOT/image) as photo:w,h=photo.size
for tag in s.select('meta[property="og:image"],meta[name="twitter:image"]'):tag['content']='https://project100.fit/'+image
for tag in s.select('meta[property="og:image:width"]'):tag['content']=str(w)
for tag in s.select('meta[property="og:image:height"]'):tag['content']=str(h)
for tag in s.select('meta[property="og:image:alt"],meta[name="twitter:image:alt"]'):tag['content']='V4 RELOAD white ingredient illustration'
(ROOT/'liquid-intake.html').write_text(str(s))
# Nutrition: concise information precedes the folder directory.
s=BeautifulSoup((ROOT/'fit-nutrition.html').read_text(),'html.parser')
for tag in s.select('#nutrition-overview'):tag.decompose()
s.h1.string='Nutrition'
s.select_one('#top').insert_after(section(s,'nutrition-overview','<span class="v2-kicker">THE EVERYDAY RECORD</span><h2>Food, drinks &amp; context</h2>'+summary_cards()))
for a in s.select('#nutrition-files a[href="fit-protocol-vectors.html"]'):
 a['href']='liquid-intake.html';a.select_one('strong').string='Liquid Intake'
 for image in a.select('img'):image.decompose()
 a.insert(0,BeautifulSoup('<img src="assets/media/october-2026/ingredient-cards/v4-white.png" alt="" width="2560" height="1440" loading="lazy">','html.parser'))
# The large legacy operating-law panel belongs in an optional context folder.
for law in s.select('.field-note'):
 if law.find_parent('section'):continue
 if law.find_parent('details'):continue
 detail=s.new_tag('details',attrs={'class':'focused-notes'});summary=s.new_tag('summary');summary.string='Historical planning context';detail.append(summary);law.replace_with(detail);detail.append(law)
(ROOT/'fit-nutrition.html').write_text(str(s))
# FIT PROTOCOL keeps every source paragraph/table, folded behind the overview.
s=BeautifulSoup((ROOT/'fit-protocol-nutrition.html').read_text(),'html.parser')
for tag in s.select('#metrics-summary,#nutrition-overview,#nutrition-source-folders'):tag.decompose()
intro=s.select_one('.v2-intro');overview=section(s,'nutrition-overview','<span class="v2-kicker">FOOD &amp; NUTRITION</span><h2>The record at a glance</h2>'+summary_cards()+'<p class="nutrition-small-note">The database’s 4 L hydration reference is a reported record, not a universal ceiling.</p>');intro.insert_after(overview)
folders=section(s,'nutrition-source-folders','<h2>Open a nutrition file</h2><div class="nutrition-source-links"><a href="fit-meals.html">Meals &amp; recipe images →</a><a href="liquid-intake.html">Simple Liquid Intake →</a><a href="fit-protocol-vectors.html">Detailed vector folders →</a></div>');overview.insert_after(folders)
chapter=s.select_one('#ch5')
if chapter and not chapter.find_parent('details'):
 detail=s.new_tag('details',attrs={'class':'focused-notes nutrition-source-file'});summary=s.new_tag('summary');summary.string='Meal modules · ingredients, historical macros & source notes';detail.append(summary);chapter.replace_with(detail);detail.append(chapter)
(ROOT/'fit-protocol-nutrition.html').write_text(str(s))
# Add a main-site primary tab and drawer destination to every MAIN page.
groups=[('index.html','PROJECT 100','home'),('fit-workout.html','Workout','workout'),('fit-nutrition.html','Nutrition','nutrition'),('liquid-intake.html','Liquid Intake','liquid'),('gear-shop.html','Gear','gear')]
for item in main['files']:
 p=ROOT/item['file'];s=BeautifulSoup(p.read_text(),'html.parser');nav=s.select_one('.site-head > .page-tabs:not(.focused-subtabs) .wrap');nav.clear()
 for file,label,group in groups:
  a=s.new_tag('a',href=file,attrs={'class':'page-tab'+(' current' if group==item['group'] else '')});a.string=label
  if group==item['group']:a['aria-current']='page'
  nav.append(a)
 drawer=s.select_one('#siteDrawer nav');drawer.clear()
 for a in nav.select('a'):drawer.append(deepcopy(a))
 for a in s.select('.focused-subtabs a[href="fit-nutrition.html"]'):a.string='Nutrition overview'
 for a in s.select('.page-nav-arrow'):
  delta=-1 if 'prev' in a.get('class',[]) else 1;i=next(i for i,g in enumerate(groups) if g[2]==item['group']);target=groups[(i+delta)%len(groups)]
  a['href']=target[0];a['aria-label']=('Previous' if delta<0 else 'Next')+' page: '+target[1];a.string='‹' if delta<0 else '›'
 for tag in s.select('link[href*="nutrition-overview.css"]'):tag.decompose()
 s.head.append(s.new_tag('link',rel='stylesheet',href=CSS+'?v=20261005-nutrition'))
 for old in s.select('script[src*="nutrition-overview.js"]'):old.decompose()
 s.head.append(s.new_tag('script',src='assets/js/nutrition-overview.js?v=20261005-nutrition',defer=''))
 p.write_text(str(s))
# Fix arrows carrying an accidental destination label instead of the arrow glyph.
for p in ROOT.glob('*.html'):
 s=BeautifulSoup(p.read_text(),'html.parser')
 if not s.select_one('.page-shell'):continue
 for a in s.select('.page-nav-arrow'):a.string='‹' if 'prev' in a.get('class',[]) else '›'
 if p.name=='fit-protocol-nutrition.html':
  for old in s.select('link[href*="nutrition-overview.css"],script[src*="nutrition-overview.js"]'):old.decompose()
  s.head.append(s.new_tag('link',rel='stylesheet',href=CSS+'?v=20261005-nutrition'))
  s.head.append(s.new_tag('script',src='assets/js/nutrition-overview.js?v=20261005-nutrition',defer=''))
 p.write_text(str(s))
# Extend discovery and the publication preview record for the new page.
p=ROOT/'sitemap.xml';text=p.read_text();url='<url><loc>https://project100.fit/liquid-intake.html</loc><lastmod>2026-10-05</lastmod></url>'
if 'https://project100.fit/liquid-intake.html' not in text:p.write_text(text.replace('</urlset>',url+'</urlset>'))
p=ROOT/'assets/data/publication-previews.json';d=json.loads(p.read_text());d['pages']['liquid-intake.html']={'description':'A simple PROJECT 100 Liquid Intake guide: seven source-backed vectors, branch rules, ingredients and descriptive diagram downloads.','image':'assets/media/october-2026/ingredient-cards/v4-white.png'};p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print('Nutrition overviews first; source folders second; MAIN Liquid Intake with seven current files and circular menu access.')
