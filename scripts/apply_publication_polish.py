"""Approved metadata, contextual preview and download clarity improvements."""
from pathlib import Path
import ast,json
from bs4 import BeautifulSoup
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
D={
'index.html':'PROJECT 100: Bogdan’s documented training, nutrition and equipment journey toward the 100 lb skeletal muscle mass goal.',
'project-story.html':'The PROJECT 100 story: rebuilding daily routines, returning to training and documenting progress through original photographs.',
'project-goals.html':'PROJECT 100 goals and roadmap: the skeletal muscle mass target, recorded baseline and progress tracking.',
'fit-workout.html':'Explore the PROJECT 100 training journal, original gym videos and recorded workout categories.',
'fit-nutrition.html':'Explore PROJECT 100 nutrition folders: meals, recipes and notes from the documented food record.',
'fit-meals.html':'Browse PROJECT 100 meals and recipes, including protein smoothies, recovery bowls, wraps and salads.',
'fit-nutrition-notes.html':'PROJECT 100 nutrition notes: recorded meal structure, food tolerance and the source context behind the recipes.',
'gear-shop.html':'Explore PROJECT 100 equipment folders: resistance bands, grips, anchors, recovery tools and gym setup photographs.',
'gear-gym.html':'PROJECT 100 gym walkthroughs: original training-floor footage and equipment setup references.',
'gear-photos.html':'Browse the PROJECT 100 gym photo journal: original equipment and training-space photographs.',
'gear-rig.html':'The PROJECT 100 training rig: setup photographs and the documented equipment configuration.',
'gear-resistance.html':'PROJECT 100 resistance gear: four KUZARO kits, six named band bundles and their recorded resistance ratings.',
'gear-grips.html':'PROJECT 100 grips and handles: the equipment inventory, setup images and related hardware references.',
'gear-anchors.html':'PROJECT 100 straps and anchors: attachment hardware, carabiners and the recorded rig connections.',
'gear-recovery.html':'PROJECT 100 recovery tools: original equipment images and the documented recovery hardware inventory.',
'gear-safety.html':'PROJECT 100 hardware safety: setup checks, inspection notes and the source context for the training rig.',
'fit-protocol.html':'FIT PROTOCOL: explore the documented PROJECT 100 baseline, daily guide, liquid intake, training and monitoring pages.',
'fit-protocol-baseline.html':'FIT PROTOCOL baseline: the recorded goals, measurements and starting context for PROJECT 100.',
'fit-protocol-history.html':'FIT PROTOCOL training history: the documented return to exercise and the context behind the current system.',
'fit-protocol-constraints.html':'FIT PROTOCOL constraints: the recorded limitations and source notes that guide the personal training system.',
'guidebook.html':'PROJECT 100 Daily Guidebook: select morning training, rest or evening training and follow the corresponding daily schedule.',
'fit-protocol-fuel.html':'FIT PROTOCOL daily clock: the recorded timing anchors and meal structure for the PROJECT 100 system.',
'fit-protocol-checklists.html':'FIT PROTOCOL checklists: daily checks, source notes and the documented stop-rule references.',
'fit-protocol-vectors.html':'PROJECT 100 Liquid Intake: open seven vector folders in place to read ingredients, protocols and descriptive diagram downloads.',
'fit-protocol-vector-reference.html':'FIT PROTOCOL vector notes: source context and reference material for the seven registered liquid-intake records.',
'fit-protocol-nutrition.html':'FIT PROTOCOL food and nutrition: the recorded meal structure, source tables and nutrition context.',
'fit-protocol-supplements.html':'FIT PROTOCOL pills and accounting: the documented supplement records and source analysis.',
'fit-protocol-interactions.html':'FIT PROTOCOL interactions: the recorded stack relationships and source analysis for the personal system.',
'fit-protocol-margins.html':'FIT PROTOCOL safety margins: the published source analysis and monitoring references.',
'fit-protocol-training.html':'FIT PROTOCOL training mechanics: supported loading, recorded exercise constraints and the source training framework.',
'fit-protocol-progression.html':'FIT PROTOCOL progression: the documented training roadmap and recorded loading context.',
'fit-protocol-joints.html':'FIT PROTOCOL joints and recovery: recorded movement constraints and recovery source notes.',
'fit-protocol-monitoring.html':'FIT PROTOCOL metabolic context: the first Monitoring page, with recorded measurements and source analysis.',
'fit-protocol-labs.html':'FIT PROTOCOL lab monitoring: laboratory interpretation context, supplement disclosure and source notes.',
'fit-protocol-troubleshooting.html':'FIT PROTOCOL troubleshooting: recorded problems, source checks and monitoring references.',
'library.html':'PROJECT 100 published downloads: dated Guidebook, Simplified Structure, visual walkthrough, checklist and current vector diagrams.',
}
records=json.loads((ROOT/'assets/data/vector-registry.json').read_text())['vectors']
for v in records:D[f'fit-protocol-vector-{v["id"]}.html']=f'{v["name"]}: {v["deployment"]}. Read the recorded ingredients, protocol and persona-free diagram downloads.'
# Reuse the explicit editorial asset map; never choose an arbitrary photograph.
module=ast.parse((ROOT/'scripts/apply_polished_shell.py').read_text())
images=next(ast.literal_eval(n.value) for n in module.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='images' for t in n.targets))
images['index.html']='assets/media/october-2026/bogdan-gym-session.jpg'
images['guidebook.html']='assets/media/october-2026/pill-organizer-may-2026.jpg'
for v in records:images[f'fit-protocol-vector-{v["id"]}.html']='assets/media/october-2026/vector-'+('pump' if v['id']=='v6' else v['id'])+'.jpg'
# Source/checklist covers remain relevant for reference pages with no matched photo.
for name in D:
 if not images.get(name):images[name]='assets/img/v2/checklist-cover.png'
for name,description in D.items():
 path=ROOT/name;s=BeautifulSoup(path.read_text(),'html.parser')
 for selector,key,value in [('meta[name="description"]','name','description'),('meta[property="og:description"]','property','og:description'),('meta[name="twitter:description"]','name','twitter:description')]:
  tag=s.select_one(selector)
  if not tag:tag=s.new_tag('meta',attrs={key:value});s.head.append(tag)
  tag['content']=description
 image=images[name]
 with Image.open(ROOT/image) as photo:w,h=photo.size
 for key,value in [('og:image','https://project100.fit/'+image),('og:image:width',str(w)),('og:image:height',str(h)),('og:image:alt',s.title.get_text(strip=True))]:
  tag=s.select_one(f'meta[property="{key}"]')
  if not tag:tag=s.new_tag('meta',attrs={'property':key});s.head.append(tag)
  tag['content']=value
 for key,value in [('twitter:card','summary_large_image'),('twitter:image','https://project100.fit/'+image),('twitter:image:alt',s.title.get_text(strip=True))]:
  tag=s.select_one(f'meta[name="{key}"]')
  if not tag:tag=s.new_tag('meta',attrs={'name':key});s.head.append(tag)
  tag['content']=value
 # Contextual background retains its existing enclosure and geometry.
 if name=='guidebook.html':
  art=s.select_one('.page-identity-image')
  if art:art['src']=image;art['width']=str(w);art['height']=str(h)
 # Make remaining inline handle mentions actionable without another control.
 for node in list(s.find_all(string=lambda t:t and '@fudge_fit' in t)):
  if node.parent.name in ['script','style','title'] or node.find_parent('a'):continue
  parts=str(node).split('@fudge_fit')
  for i,part in enumerate(parts):
   if part:node.insert_before(part)
   if i<len(parts)-1:
    a=s.new_tag('a',href='https://www.instagram.com/fudge_fit/',target='_blank',rel='noopener');a.string='@fudge_fit';node.insert_before(a)
  node.extract()
 if name=='project-goals.html':
  old=s.select_one('#reported-smm-history')
  if old:old.decompose()
  note=s.new_tag('div',id='reported-smm-history',attrs={'class':'v2-note'})
  heading=s.new_tag('strong');heading.string='Reported measurement history';note.append(heading)
  history=s.new_tag('p');history.string='June 28, 2025: 82.0 lb estimated SMM. December 14, 2025: 88.2 lb estimated SMM, used for the February 2026 baseline lock. The reported change is +6.2 lb in estimated SMM; original scan reports remain to be verified. These readings do not establish a gain of 6.2 lb of dry muscle tissue.';note.append(history)
  review=s.new_tag('p');review.string='Planned review window: December 14–21, 2026, using the same InBody unit at Gym Fit Forme and comparable measurement conditions. This is a planned review, not a completed scan or a deadline for reaching the goal.';note.append(review)
  s.select_one('#mission .anomaly').append(note)
 if name=='library.html':
  old=s.select_one('#download-help')
  if old:old.decompose()
  note=s.new_tag('p',id='download-help',attrs={'class':'file-info'});note.string='If a PDF opens in a viewer, use its download icon to save.'
  s.select_one('.v2-intro').insert_after(note)
  for a in s.select('a[href^="assets/downloads/"][download]'):a['download']=Path(a['href']).name
 path.write_text(str(s))
(ROOT/'assets/data/publication-previews.json').write_text(json.dumps({'pages':{n:{'description':D[n],'image':images[n]} for n in D}},ensure_ascii=False,indent=2)+'\n')
print(f'Polished {len(D)} page descriptions and contextual share previews; clarified downloads without adding buttons.')
