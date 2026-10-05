"""Apply the author's visual equipment manifest without invented kit variants."""
from pathlib import Path
from copy import deepcopy
import json
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'assets/data/gear-database.json').read_text())
files=['gear-resistance.html','gear-grips.html','gear-anchors.html','gear-recovery.html']
docs={f:BeautifulSoup((ROOT/f).read_text(),'html.parser') for f in files}
aliases={'kuzaro':'KUZARO','hpygn-bands':'HPYGN Heavy','bluslm':'BLUSLM','hxd':'HXD-ERGO','innstar':'INNSTAR','angles90':'Angles90','single-rope':'THEFITGUY Single','manueklear':'MANUEKLEAR','tribe':'Tribe Lifting','extensions':'THEFITGUY Ultimate','sled':'THEFITGUY Sled','jrsgs':'JRSGS','sleeves':'Neoprene','vehiclex':'VEHICLEX','nilight':'NILIGHT','miaoke':'MIAOKE','jooeer':'jooeer'}
cards={};extras={f:[] for f in files}
for f,s in docs.items():
 for c in s.select('.armory-item'):
  id=c.get('data-gear-record')
  if not id:
   name=c.select_one('.ai-name').get_text()
   id=next((id for id,prefix in aliases.items() if name.startswith(prefix)),None)
  if id:cards[id]=deepcopy(c)
  else:extras[f].append(deepcopy(c))
for record in data['records']:
 id=record['id'];c=cards.get(id)
 if c is None:
  c=BeautifulSoup('<div class="armory-item gear-text-only"><div class="ai-text"><span class="ai-name"></span><span class="ai-spec fx-shine"></span><p></p></div></div>','html.parser').div
 c['data-gear-record']=id
 for old in c.select('.kuzaro-overview,.kuzaro-setup,.gear-record-detail'):old.decompose()
 text=c.select_one('.ai-text');text.select_one('.ai-name').string=record['name'];text.select_one('.ai-spec').string=record['badge']
 for p in text.select('p'):p.decompose()
 p=BeautifulSoup('<p class="gear-record-detail"></p>','html.parser').p;p.string=record['description'];c.append(p)
 if id=='kuzaro':
  c['id']='kuzaro-multi-kit'
  text.select_one('.ai-spec').string='6 BUNDLES · 4 KITS'
  p.string='Six named matched-band configurations form the KUZARO setup. Bundle ratings describe the selected tubes; resistance changes with stretch.'
  box=BeautifulSoup('<div class="kuzaro-setup"><h4>Hex-Grid bundle directory</h4><div class="kuzaro-bundles"></div><details class="kuzaro-grade-reference"><summary>Individual tube grades · 360 lb listed set</summary><ul class="gear-grade-list"></ul></details><details class="kuzaro-grade-reference"><summary>Bundle connections &amp; protective tape</summary><p class="bundle-connections"></p></details></div>','html.parser').div
  for b in data['kuzaro']['bundles']:
   detail=BeautifulSoup('<details class="kuzaro-bundle"><summary><span class="bundle-name"></span><span class="bundle-force"></span></summary><p><strong class="bundle-composition"></strong><span class="bundle-color"></span></p><p class="bundle-use"></p></details>','html.parser').details
   detail.select_one('.bundle-name').string=b['name']
   detail.select_one('.bundle-force').string=f"{b['lb']} lb"+(' / hand' if b.get('per_hand') else '')
   detail.select_one('.bundle-composition').string=f"{b['band_count']} × {b['band_lb']} lb"+(' · separate bands' if b.get('per_hand') else ' · matched bundle')
   detail.select_one('.bundle-color').string=' · '+b['color']
   detail.select_one('.bundle-use').string=b['focus']+' · '+b['use']
   box.select_one('.kuzaro-bundles').append(detail)
  for g in data['kuzaro']['grades']:
   li=BeautifulSoup('<li><strong></strong><span></span></li>','html.parser').li
   li.strong.string=f"{g['lb']} lb · {g['kg']:.1f} kg";li.span.string=g['color'];box.ul.append(li)
  box.select_one('.bundle-connections').string=data['kuzaro']['bundle_modifiers']['tape']+' '+data['kuzaro']['bundle_modifiers']['connection']
  c.append(box)
 c['data-gear-page']=str(record['page']);cards[id]=c
layouts={
 'gear-resistance.html':[('resistance','Band systems & resistance grades')],
 'gear-grips.html':[('grips','Grips & cable attachments')],
 'gear-anchors.html':[('structural','Bars, harnesses & extension straps'),('connections','Connection hardware & bundle sleeves'),('anchors','Anchor infrastructure')],
 'gear-recovery.html':[('recovery','Recovery tools'),('logistics','Gear storage & logistics')],
}
for f,s in docs.items():
 section=s.select_one('section[data-main-source*="armory-"]');groups=section.select_one('.armory-groups');groups.clear()
 for category,title in layouts[f]:
  group=s.new_tag('div',attrs={'class':'armory-group','data-gear-category':category});h=s.new_tag('h3');h.string=title;group.append(h)
  listing=s.new_tag('div',attrs={'class':'armory-list'})
  for r in data['records']:
   if r['category']==category:listing.append(deepcopy(cards[r['id']]))
  group.append(listing);groups.append(group)
 if extras[f]:
  group=s.new_tag('div',attrs={'class':'armory-group','data-gear-category':'additional'});h=s.new_tag('h3');h.string='Additional items in the lived inventory';group.append(h)
  listing=s.new_tag('div',attrs={'class':'armory-list'})
  for c in extras[f]:listing.append(c)
  group.append(listing);groups.append(group)
 if f=='gear-anchors.html':
  s.select_one('.compact-page-identity h1,.main-file-intro h1').string='Bars, straps & anchors'
  section.select_one('.sec-head h2').string='Bars, connections & anchors'
 for note in section.select('.gear-manifest-note'):note.decompose()
 note=s.new_tag('p',attrs={'class':'gear-manifest-note'});note.string='Equipment identities and listed ratings follow the supplied PROJECT 100 visual recognition database. Tube ratings, combined set ratings and force at a particular stretch are different measurements.'
 section.select_one('.wrap').append(note)
 if f=='gear-resistance.html':
  physics=s.select_one('.focus-point p')
  if physics:physics.string='The manifest lists a 360 lb KUZARO set and a 330 lb HPYGN set. These are combined nominal ratings; band tension changes with the tubes selected and their stretch. The kit collection allows different resistance combinations.'
 (ROOT/f).write_text(str(s))
# Keep the duplicated safety inventory aligned with the same object identities.
safety_path=ROOT/'gear-safety.html'
safety=BeautifulSoup(safety_path.read_text(),'html.parser')
for c in safety.select('.armory-item'):
 name=c.select_one('.ai-name').get_text()
 id=next((id for id,prefix in aliases.items() if name.startswith(prefix)),None)
 if id:
  r=next(r for r in data['records'] if r['id']==id)
  c.select_one('.ai-name').string=r['name'];c.select_one('.ai-spec').string=r['badge']
  p=c.select_one('.ai-text p')
  if p:p.string=r['description']
safety_path.write_text(str(safety))
gov=ROOT/'CONTENT_GOVERNANCE.md'
g=gov.read_text().split('\n## KUZARO inventory correction')[0]
line='\nSee `GEAR_MANIFEST_RELEASE.md` for the author-supplied equipment database and current KUZARO grade mapping.\n'
if line.strip() not in g:gov.write_text(g+line)
print('Updated 19 equipment records in six manifest categories; retained additional owned accessories.')
