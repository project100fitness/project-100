"""Place existing glowing descriptions before items and repair imageless gear cards."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
for p in ROOT.glob('*.html'):
 s=BeautifulSoup(p.read_text(),'html.parser')
 if not s.select_one('.page-shell'):continue
 changed=False
 for card in s.select('.focus-point-wrap'):
  parent=card.parent
  top=parent.find(id='top',recursive=False)
  if top:
   card.extract();top.insert_after(card);card.attrs.pop('style',None)
   card['class']=list(dict.fromkeys(card.get('class',[])+['page-description']))
   changed=True
 if p.name=='liquid-intake.html':
  top=s.select_one('#top')
  if not s.select_one('#liquid-description'):
   intro=BeautifulSoup('<div id="liquid-description" class="focus-point-wrap wrap page-description"><div class="focus-point fx-reveal fx-pulse-glow"><span class="fp-tag">Liquid Intake</span><p>Seven drink protocols · ingredients, preparation and descriptive downloads. Open a vector for its recipe; follow the morning, rest or evening branch. V1 and V6 are never combined on the same day. Personal record, not a prescription.</p></div></div>','html.parser').div
   top.insert_after(intro)
  files=s.select_one('#liquid-files');annex=s.select_one('#liquid-overview')
  if files and annex:
   annex.extract();files.insert_after(annex)
   note=annex.select_one('.nutrition-small-note')
   if note:note.string='V1 and V6 are never combined on the same day. Recipes document the personal record, not a prescription.'
  changed=True
 for item in s.select('.armory-item'):
  name=item.select_one('.ai-name')
  if name and 'XSTRAP' in name.get_text() and not item.select_one('.ai-thumb'):
   thumb=BeautifulSoup('<div class="ai-thumb fx-gallery"><button aria-label="Photo: XSTRAP motorcycle soft loop tie-down straps" data-full="assets/img/gear-item-xstrap.jpg" type="button"><img alt="XSTRAP motorcycle soft loop tie-down straps" loading="lazy" src="assets/img/gear-item-xstrap.jpg"/></button></div>','html.parser').div
   item.insert(0,thumb);changed=True
  if not item.select_one('.ai-thumb') and 'gear-text-only' not in item.get('class',[]):
   item['class']=item.get('class',[])+['gear-text-only'];changed=True
 if changed:
  for old in s.select('link[href*="description-order.css"]'):old.decompose()
  s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/description-order.css?v=20261006'))
  p.write_text(str(s))
print('Description cards precede items; Liquid Intake annex follows vectors; gear cards repaired.')
