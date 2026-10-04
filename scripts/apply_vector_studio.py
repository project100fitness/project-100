"""Fit the uploaded persona artwork and animated clips into the approved shell."""
from pathlib import Path
from bs4 import BeautifulSoup
import json

ROOT=Path(__file__).resolve().parents[1]
MEDIA='assets/media/october-2026/'
VECTORS=[('v1','V1 IGNITION','green-ignition', '#b7ed42'),('v2','V2 REFUEL','blue-refuel','#50d7f0'),
 ('v3','V3 RECOVERY','recovery-mix','#e7ba57'),('v4','V4 RELOAD','ruby-reload','#f06778'),
 ('v5','V5 TRANSPORT','greens-transport','#ce8fe9'),('v10','V10 SHUTDOWN','night-steam','#cc9de9'),
 ('pump','PUMP EVENING',None,'#799bd6')]
BACKGROUNDS={
 'index.html':[('.cta-band','athlete-shaker'),('#mission h2','tech-shaker')],
 'fit-workout.html':[('#top','gear-setup')],
 'fit-nutrition.html':[('#top','tea'),('#vectors','shake'),('#clinical-nutrition h2','greens-transport')],
 'gear-shop.html':[('#top','gear-setup'),('#armory h2','shaker-steam')],
 'fit-protocol.html':[('#top','athlete-shaker')],
 'fit-protocol-baseline.html':[('#top','athlete-shaker')],
 'fit-protocol-fuel.html':[('#top','hydration')],
 'fit-protocol-training.html':[('#top','gear-setup')],
 'fit-protocol-troubleshooting.html':[('#top','tech-shaker')],
 'guidebook.html':[('#top','shaker-steam')],
 'library.html':[('#top','sunlit-shaker')],
}

def motion(soup,section,slug,poster=None):
    for old in section.select(':scope > .section-motion,:scope > .motion-control'):old.decompose()
    section['class']=list(dict.fromkeys(section.get('class',[])+['has-section-motion']))
    poster=poster or MEDIA+slug+'-loop.jpg'
    section['style']=f"--motion-poster:url('/{poster}')"
    backdrop=soup.new_tag('div',**{'class':'section-motion','aria-hidden':'true'})
    backdrop.append(soup.new_tag('video',loop='',muted='',playsinline='',preload='none',poster=poster,
         **{'data-background-src':MEDIA+slug+'-loop.mp4','tabindex':'-1'}))
    section.insert(0,backdrop)
    control=soup.new_tag('button',type='button',**{'class':'motion-control','aria-label':'Pause background animation','aria-pressed':'false'})
    control.string='Pause background';section.append(control)

mapping={}
for name,items in BACKGROUNDS.items():
    p=ROOT/name;s=BeautifulSoup(p.read_text(),'html.parser')
    for tag,key,filename in [('link','href','media-backgrounds.css'),('script','src','media-backgrounds.js')]:
        for old in s.find_all(tag):
            if filename in old.get(key,''):old.decompose()
    s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/media-backgrounds.css?v=20261004-stacks'))
    s.head.append(s.new_tag('script',src='assets/js/media-backgrounds.js?v=20261004-stacks',defer=''))
    if name in ['fit-nutrition.html','guidebook.html']:
        for old in s.select('link[href*="vector-studio.css"]'):old.decompose()
        s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/vector-studio.css?v=20261004'))
    if name=='fit-nutrition.html':
        for old in s.select('script[src*="vector-studio.js"]'):old.decompose()
        s.head.append(s.new_tag('script',src='assets/js/vector-studio.js?v=20261004',defer=''))
    for selector,slug in items:
        e=s.select_one(selector)
        if e.name in ['h2','h3']:
            if 'asset-scene' in e.parent.get('class',[]):e=e.parent
            else:
                scene=s.new_tag('div',**{'class':'asset-scene'});e.wrap(scene);e=scene
        # The Nutrition intro becomes the compact entry to the unfolding artwork.
        if name=='fit-nutrition.html' and selector=='#vectors':
            if not e.select_one(':scope > .vector-entry'):
                entry=s.new_tag('div',**{'class':'vector-entry'})
                for child in list(e.children):
                    if getattr(child,'name',None) and child.get('class') and any(x in child['class'] for x in ['section-motion','motion-control']):continue
                    entry.append(child.extract())
                e.append(entry)
            e=e.select_one('.vector-entry')
        motion(s,e,slug);mapping[name+':'+selector]=slug
    if name=='fit-nutrition.html':
        outer=s.select_one('#vectors')
        # Remove the old section-wide layer now that only its entry uses motion.
        for old in outer.select(':scope > .section-motion,:scope > .motion-control,:scope > .vector-studio'):old.decompose()
        outer['class']=[x for x in outer.get('class',[]) if x!='has-section-motion'];outer.attrs.pop('style',None)
        title=outer.select_one('h2');title.string='The vector stack.'
        studio=s.new_tag('div',**{'class':'vector-studio','aria-label':'Uploaded vector artwork: unfold a file to explore'})
        for key,label,clip,color in VECTORS:
            f=s.new_tag('details',**{'class':'vector-stack-file','style':f'--vector-accent:{color};--stack-art:url("/{MEDIA}vector-{key}.jpg")'})
            summary=s.new_tag('summary');preview=s.new_tag('span',**{'class':'stack-preview'})
            preview.append(s.new_tag('img',src=MEDIA+f'vector-{key}.jpg',alt='',loading='lazy',width='1600',height='900'))
            summary.append(preview)
            text=s.new_tag('span',**{'class':'stack-label'});text.string=label;summary.append(text)
            hint=s.new_tag('span',**{'class':'stack-hint'});hint.string='Inactive reference · unfold' if key=='pump' else 'Unfold artwork + formula';summary.append(hint)
            f.append(summary)
            content=s.new_tag('div',**{'class':'stack-content'})
            frame=s.new_tag('div',**{'class':'stack-art-frame'})
            frame.append(s.new_tag('img',src=MEDIA+f'vector-{key}.jpg',alt=f'Uploaded {label} illustration with Bogdan’s digital persona and product arrangement',loading='lazy',width='1600',height='900'))
            for direction,symbol,accessible in [('prev','‹','Previous vector artwork'),('next','›','Next vector artwork')]:
                step=s.new_tag('button',type='button',**{'class':'stack-step '+direction,'data-stack-step':direction,'aria-label':accessible,'hidden':''});step.string=symbol;frame.append(step)
            content.append(frame)
            source=s.new_tag('p');source.string='Uploaded artwork · '+('inactive reference; never used with V1.' if key=='pump' else 'current formula and clinical notes are in the Guidebook.')
            content.append(source)
            a=s.new_tag('a',href=f'guidebook.html#vector-{key}',**{'class':'stack-source'});a.string='Open the current record →';content.append(a)
            f.append(content);studio.append(f)
        outer.append(studio)
    if name=='guidebook.html':
        for key,label,clip,color in VECTORS:
            card=s.select_one('#vector-'+key)
            if not card:continue
            scene=card.select_one(':scope > .vector-scene')
            if not scene:
                scene=s.new_tag('div',**{'class':'vector-scene','style':f'--vector-accent:{color}'})
                # Keep all source words; move only the title and timing into the visual header.
                for child in list(card.children):
                    if getattr(child,'name',None) in ['span','h3'] or (getattr(child,'name',None)=='p' and child.find('b')):scene.append(child.extract())
                card.insert(0,scene)
            if clip:motion(s,scene,clip,MEDIA+f'vector-{key}.jpg')
            else:
                scene['class']=list(dict.fromkeys(scene.get('class',[])+['vector-reference-scene']))
                scene['style']=f'--motion-poster:url("/{MEDIA}vector-{key}.jpg")'
            mapping[name+':#vector-'+key]=clip or 'inactive artwork'
    if name=='index.html':
        first=s.select_one('.origin-photos img');first['src']=MEDIA+'bogdan-november-2025.jpg';first['alt']='Original November 2025 photograph of Bogdan at the beginning of the return'
        training=s.select_one('a[href="fit-workout.html"] .ex-media img')
        if training:training['src']=MEDIA+'bogdan-july-2026.jpg';training['alt']='Original July 2026 gym photograph of Bogdan'
        for old,new,alt in [('assets/img/gym-photo-rig-bench.jpg','gym-august-floor.jpg','Original August 2026 gym floor photograph'),
                            ('assets/img/protocol-matrix-6panel.jpg','vector-v1.jpg','Uploaded V1 Ignition visual artwork')]:
            for img in s.find_all('img',src=old):img['src']=MEDIA+new;img['alt']=alt
    if name=='fit-protocol.html':
        photos=s.select('.deck-photo');slugs=['bogdan-gym-session','bogdan-june-2026','gym-turf-rig','gym-bench-august','gym-july-session',None,'gym-august-weights','gym-july-turf']
        for img,slug in zip(photos,slugs):
            if slug:img['src']=MEDIA+slug+'.jpg';img['alt']='Original uploaded photograph · '+slug.replace('-',' ');img['loading']='lazy'
    if name=='gear-shop.html':
        for old,new in [('assets/img/gym-photo-dumbbell-rack.jpg','gym-august-weights'),('assets/img/gym-photo-turf-dumbbells.jpg','gym-july-turf'),('assets/img/gym-photo-machine-corner.jpg','gym-july-session')]:
            for img in s.find_all('img',src=old):
                img['src']=MEDIA+new+'.jpg';img['alt']='Original gym photograph · '+new.replace('-',' ')
                button=img.find_parent('button')
                if button and button.has_attr('data-full'):button['data-full']=img['src']
    p.write_text(str(s))
cpath=ROOT/'assets/media/october-2026/catalog.json';c=json.loads(cpath.read_text())
c['expanded_section_mapping']=mapping;cpath.write_text(json.dumps(c,indent=2)+'\n')
print('Expanded backgrounds and folding vector artwork applied to 11 pages.')
