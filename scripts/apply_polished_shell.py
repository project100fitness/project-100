"""Compact page identities, consistent social access and contained photographs."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
main=['index.html','project-story.html','project-goals.html','fit-workout.html','fit-nutrition.html','fit-meals.html','fit-nutrition-notes.html','gear-shop.html','gear-gym.html','gear-photos.html','gear-rig.html','gear-resistance.html','gear-grips.html','gear-anchors.html','gear-recovery.html','gear-safety.html']
# Explicit editorial matches: absent subjects remain unillustrated, never a selfie fallback.
images={
 'project-story.html':'assets/media/october-2026/bogdan-november-2025.jpg',
 'project-goals.html':'assets/img/objective-100lbs-smm.jpg',
 'fit-workout.html':'assets/media/october-2026/bogdan-gym-session.jpg',
 'fit-nutrition.html':'assets/img/mega-salad-mango-chickpea.jpg',
 'fit-meals.html':'assets/img/carnivore-omelette.jpg',
 'fit-nutrition-notes.html':'assets/media/october-2026/nutrition-pantry-july-2026.jpg',
 'gear-shop.html':'assets/media/october-2026/gym-turf-rig.jpg',
 'gear-gym.html':'assets/media/october-2026/gym-august-floor.jpg',
 'gear-photos.html':'assets/media/october-2026/gym-july-turf.jpg',
 'gear-rig.html':'assets/media/october-2026/gym-bench-august.jpg',
 'gear-resistance.html':'assets/img/gear-item-tubing.jpg',
 'gear-grips.html':'assets/img/gear-item-angles90.jpg',
 'gear-anchors.html':'assets/img/gear-item-carabiner.jpg',
 'gear-recovery.html':'assets/img/gear-item-miaoke.jpg',
 'gear-safety.html':None,
 'fit-protocol.html':'assets/img/protocol-systemic-fueling.jpg',
 'fit-protocol-baseline.html':'assets/img/objective-100lbs-smm.jpg',
 'fit-protocol-history.html':'assets/media/october-2026/bogdan-june-2026.jpg',
 'fit-protocol-constraints.html':None,
 'guidebook.html':'assets/img/protocol-24hr-clock.jpg',
 'fit-protocol-fuel.html':'assets/img/protocol-24hr-clock.jpg',
 'fit-protocol-checklists.html':'assets/media/october-2026/pill-organizer-may-2026.jpg',
 'fit-protocol-vectors.html':'assets/img/liquid-intake-vectors.jpg',
 'fit-protocol-vector-reference.html':'assets/img/diagram-matrix.jpg',
 'fit-protocol-nutrition.html':'assets/img/mega-salad-kale-tuna.jpg',
 'fit-protocol-supplements.html':'assets/media/october-2026/pill-organizer-february-2026.jpg',
 'fit-protocol-interactions.html':'assets/media/october-2026/pill-organizer-may-2026.jpg',
 'fit-protocol-margins.html':None,
 'fit-protocol-training.html':'assets/media/october-2026/bogdan-gym-session.jpg',
 'fit-protocol-progression.html':'assets/img/resistance-band-001.jpg',
 'fit-protocol-joints.html':'assets/img/warmups-stretch-001.jpg',
 'fit-protocol-monitoring.html':None,
 'fit-protocol-labs.html':None,
 'fit-protocol-troubleshooting.html':None,
 'library.html':'assets/img/v2/guidebook-cover.png',
}
for key in ['v1','v2','v3','v4','v5','v10','pump','v6']:
 images['fit-protocol-vector-'+key+'.html']='assets/media/october-2026/vector-'+('pump' if key=='v6' else key)+'.jpg'
category_images=images
for path in ROOT.glob('*.html'):
 s=BeautifulSoup(path.read_text(),'html.parser')
 if not s.select_one('.page-shell'):continue
 for logo in s.select('#nav .brand'):logo['href']='index.html'
 for node in s.select('.fc-root'):node.decompose()
 host=s.new_tag('div',attrs={'class':'fc-root'})
 host.append(BeautifulSoup((ROOT/'assets/partials/float-connect.html').read_text(),'html.parser'));s.body.insert(0,host)
 for node in s.select('script[src*="float-connect.js"],link[href*="float-connect.css"],link[href*="polished-shell.css"]'):node.decompose()
 s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/float-connect.css?v=20261005-shell'))
 s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/polished-shell.css?v='+('20261005-v6')))
 s.head.append(s.new_tag('script',src='assets/js/float-connect.js?v=20261005-shell',defer=''))
 # Publication access belongs in one full-width footer bar, outside content menus.
 for link in s.select('.page-tabs a,.focused-cabinet a,#siteDrawer a'):
  if link.get('href','').split('#')[0]=='library.html':link.decompose()
 for bar in s.select('.publication-bar'):bar.decompose()
 footer=s.select_one('footer')
 if footer:
  for link in footer.select('a[href="library.html"]'):link.decompose()
  for column in footer.select('.v2-footer-grid > div'):
   if column.h3 and column.h3.get_text(strip=True)=='Reference':column.decompose()
  bar=s.new_tag('a',href='library.html',attrs={'class':'publication-bar'})
  bar.string='Guidebook · Published files · Downloads ↗'
  if path.name=='library.html':bar['aria-current']='page'
  footer.insert_before(bar)
 # Category folders share a compact preview; the entire folder stays the link.
 for folder in s.select('.focused-cabinet:not(.vector-cabinet) > a.focused-folder'):
  target=folder.get('href','').split('#')[0]
  image=category_images.get(target)
  if target not in category_images:raise ValueError('Unmapped category: '+target)
  if image and not (ROOT/image).is_file():raise ValueError('Missing preview asset: '+image)
  for old in folder.select('img'):old.decompose()
  if 'main-folder' not in folder.get('class',[]) and not folder.select_one('.category-folder-copy'):
   content=s.new_tag('span',attrs={'class':'category-folder-copy'})
   for child in list(folder.contents):content.append(child.extract())
   folder.append(content)
  folder['class']=list(dict.fromkeys(folder.get('class',[])+['category-folder']))
  if image:folder.insert(0,s.new_tag('img',src=image,alt='',width='76',height='76',loading='lazy',attrs={'class':'folder-background','aria-hidden':'true'}))
 # Only the meaningful original landing hero retains a decorative video.
 for motion in s.select('.section-motion'):
  parent=motion.parent
  if path.name=='index.html' and parent.get('id')=='top':continue
  motion.decompose()
  parent['class']=[c for c in parent.get('class',[]) if c!='has-section-motion']
  parent.attrs.pop('style',None)
 # Keep the approved landing hero; other title-only banners become small IDs.
 if path.name!='index.html':
  intro=s.select_one('.main-file-intro,.v2-intro,#top.placeholder-hero')
  if intro:
   for node in intro.select('.section-motion,.page-identity-image'):node.decompose()
   intro['class']=list(dict.fromkeys([c for c in intro.get('class',[]) if c not in ['has-section-motion','placeholder-hero','fx-aurora','fx-spotlight']]+['compact-page-identity']))
   intro.attrs.pop('style',None)
   if path.name not in images:raise ValueError('Unmapped page identity: '+path.name)
   image=images[path.name]
   if image:
    if not (ROOT/image).is_file():raise ValueError('Missing identity asset: '+image)
    intro.insert(0,s.new_tag('img',src=image,alt='',width='1600',height='900',attrs={'class':'page-identity-image','aria-hidden':'true'}))
   for p in intro.select(':scope > p,.wrap > p'):
    if p.get_text().startswith('One focused file'):p.decompose()
 if path.name=='project-story.html':
  story=s.select_one('#story')
  for node in story.select('.section-motion'):node.decompose()
  story['class']=[c for c in story.get('class',[]) if c!='has-section-motion'];story.attrs.pop('style',None)
  photos=story.select_one('.origin-photos');photos.clear()
  for asset,caption in [('bogdan-november-2025.jpg','November 2025'),('bogdan-june-2026.jpg','June 2026'),('bogdan-july-2026.jpg','July 2026'),('bogdan-august-mirror.jpg','August 2026'),('bogdan-gym-session.jpg','Training journal'),('gym-bench-august.jpg','The training setup')]:
   figure=s.new_tag('figure');figure.append(s.new_tag('img',src='assets/media/october-2026/'+asset,alt=caption+' · original photograph',loading='lazy',attrs={'class':'zoomable'}))
   label=s.new_tag('figcaption');label.string=caption;figure.append(label);photos.append(figure)
 # Remove remote font loading once bundled fonts are installed.
 if (ROOT/'assets/css/local-fonts.css').exists():
  for node in s.select('link[href*="fonts.googleapis.com"],link[href*="fonts.gstatic.com"]'):node.decompose()
  if not s.select_one('link[href*="local-fonts.css"]'):s.head.insert(0,s.new_tag('link',rel='stylesheet',href='assets/css/local-fonts.css?v=20261005-local'))
 path.write_text(str(s))
print('Polished every full-page shell: home logo, social access, compact identities and fitted photos.')
