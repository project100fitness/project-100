"""Reuse decorative illustration layers under readable HTML, without new sections."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
for file,selector,art in [('liquid-intake.html','#liquid-description .focus-point','j04'),('fit-protocol-vectors.html','#metrics-summary','j09'),('fit-protocol-supplements.html','#metrics-summary','j18')]:
 p=ROOT/file;s=BeautifulSoup(p.read_text(),'html.parser');box=s.select_one(selector)
 if not box:raise RuntimeError(file+' missing '+selector)
 box['class']=list(dict.fromkeys(box.get('class',[])+['illustration-info','illustration-'+art]))
 for old in box.select('.illustration-context-art'):old.decompose()
 im=s.new_tag('img',src=f'assets/media/illustration-design/{art}.webp',alt='',attrs={'class':'illustration-context-art','aria-hidden':'true','loading':'lazy','decoding':'async'})
 box.insert(0,im)
 for old in s.select('link[href*="illustration-layers.css"]'):old.decompose()
 s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/illustration-layers.css?v=20261006'))
 # Complete, readable, persona-free PNG replaces the existing diagram download.
 for details in s.select('details.simple-liquid-file,details.vector-stack-file'):
  id=details.get('id','').removeprefix('vector-')
  if id not in ['v1','v2','v3','v4','v5','v6','v10']:continue
  style='j04' if file=='liquid-intake.html' else 'j12'
  for a in details.select('a[download]'):
   if a.get('href','').endswith('.png'):
    a['href']=f'assets/downloads/complete-vector-cards/readable-{style}-{id}.png';a['download']=f'project100-{id}-complete-ingredients.png'
 p.write_text(str(s))
print('Integrated three artwork layers into existing info cards and upgraded 14 diagram downloads.')
