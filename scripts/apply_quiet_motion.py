"""Finish the build with silent background loops and a shared brand accent."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
for p in ROOT.glob('*.html'):
 s=BeautifulSoup(p.read_text(),'html.parser')
 if not s.select_one('script[src*="media-backgrounds.js"]'):continue
 for button in s.select('.motion-control,.folder-controls'):button.decompose()
 for v in s.select('video[data-background-src]'):
  for attr in ['autoplay','muted','loop','playsinline']:v[attr]=''
  v.attrs.pop('controls',None)
  section=v.find_parent(class_='has-section-motion')
  if section:section.attrs.pop('data-motion-policy',None)
 for tag in s.select('script[src*="media-backgrounds.js"],link[href*="media-backgrounds.css"],link[href*="filing-navigation.css"],link[href*="vector-studio.css"]'):
  key='src' if tag.name=='script' else 'href';tag[key]=tag[key].split('?')[0]+'?v=20261004-quiet'
 p.write_text(str(s))
governance=ROOT/'CONTENT_GOVERNANCE.md'
if 'Background animation follows the author' not in governance.read_text():
 governance.write_text(governance.read_text()+'\nBackground animation follows the author’s explicit autoplay preference: silent looping when visible, automatic pause offscreen or in hidden tabs, poster fallback if the browser blocks playback, and no extra play/pause buttons. PROJECT 100 and Fit Protocol share the same red accents per theme. Vector folders use their covers and keyboard navigation; download links remain compact text links.\n')
print('Removed decorative controls; applied silent autoplay loops and shared accents.')
