"""Author-confirmed four-kit KUZARO inventory; no invented kit ratings."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'gear-resistance.html'
s=BeautifulSoup(path.read_text(),'html.parser')
card=next(c for c in s.select('.armory-item') if 'KUZARO' in c.select_one('.ai-name').get_text())
card['id']='kuzaro-multi-kit'
card.select_one('.ai-name').string='KUZARO · Multi-band setup'
card.select_one('.ai-spec').string='4 KITS · MULTI-BAND BUNDLES'
text=card.select_one('.ai-text')
for old in card.select('.kuzaro-overview'):old.decompose()
intro=text.select_one('p')
if intro is None:intro=s.new_tag('p')
intro.string='Four kits, multiple band bundles and selectable resistance combinations for different movements.'
intro['class']='kuzaro-overview'
card.append(intro)
for old in card.select('.kuzaro-setup'):old.decompose()
box=s.new_tag('div',attrs={'class':'kuzaro-setup'})
box.append(BeautifulSoup('''<h4>Four-kit resistance setup</h4><p><strong>Pure Triad reference:</strong> 35–85 lb per tube, with a 360 lb combined setup recorded in the earlier gear inventory.</p><p>Log the kit and connected tubes for each movement. Bundle ratings differ from individual tube ratings; actual resistance changes with stretch.</p>''','html.parser'))
card.append(box)
path.write_text(str(s))
print('Updated KUZARO to four-kit multi-band inventory; missing kit-specific ratings remain unassigned.')
