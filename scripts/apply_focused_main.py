"""Keep PROJECT_100 compact, with the same folder system as FIT PROTOCOL."""
from pathlib import Path
from copy import deepcopy
from html import escape
import json
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
docs={p.name:BeautifulSoup(p.read_text(),'html.parser') for p in ROOT.glob('*.html')}
SOURCES=['index.html','fit-workout.html','fit-nutrition.html','gear-shop.html']
sections={}
for doc in docs.values():
    for e in doc.select('section[data-main-source]'):sections[e['data-main-source']]=deepcopy(e)
for file in SOURCES:
    for e in docs[file].select('.page-shell > section[id]'):
        if e.get('data-main-directory'):continue
        copy=deepcopy(e);copy['data-main-source']=file+':'+e['id'];sections[file+':'+e['id']]=copy
gear=sections.get('gear-shop.html:armory')
if gear:
    groups=gear.select('.armory-groups .armory-group')
    for key,group in zip(['resistance','grips','anchors','recovery'],groups):
        part=deepcopy(gear);part['id']='armory-'+key
        for node in part.select('.armory-photos'):node.decompose()
        box=part.select_one('.armory-groups');box.clear()
        chosen=deepcopy(group)
        for nested in list(chosen.select('.armory-group')):nested.decompose()
        box.append(chosen)
        part['data-main-source']='gear-shop.html:armory-'+key
        heading=chosen.select_one('h3').get_text(' ',strip=True)
        part.select_one('.sec-head h2').string=heading
        sections[part['data-main-source']]=part
    rig=deepcopy(gear);rig['id']='rig';rig['data-main-source']='gear-shop.html:rig'
    for node in rig.select('.armory-groups'):node.decompose()
    rig.select_one('.sec-head h2').string='The rig in pictures.'
    sections[rig['data-main-source']]=rig

# file, label, group, original template, content sections
FILES=[
 ('index.html','Home','home','index.html',[]),
 ('project-story.html','The story','home','index.html',['story']),
 ('project-goals.html','Goals & roadmap','home','index.html',['mission','roadmap']),
 ('fit-workout.html','Training log','workout','fit-workout.html',None),
 ('fit-nutrition.html','Nutrition folders','nutrition','fit-nutrition.html',[]),
 ('fit-meals.html','Meals & recipes','nutrition','fit-nutrition.html',['reels']),
 ('fit-nutrition-notes.html','Nutrition notes','nutrition','fit-nutrition.html',['clinical-nutrition']),
 ('gear-shop.html','Gear folders','gear','gear-shop.html',[]),
 ('gear-gym.html','Gym walkthroughs','gear','gear-shop.html',['gym-tour']),
 ('gear-photos.html','Gym photo journal','gear','gear-shop.html',['reels']),
 ('gear-rig.html','The rig','gear','gear-shop.html',['rig']),
 ('gear-resistance.html','Resistance bands','gear','gear-shop.html',['armory-resistance']),
 ('gear-grips.html','Grips & handles','gear','gear-shop.html',['armory-grips']),
 ('gear-anchors.html','Straps & anchors','gear','gear-shop.html',['armory-anchors']),
 ('gear-recovery.html','Recovery tools','gear','gear-shop.html',['armory-recovery']),
 ('gear-safety.html','Hardware safety','gear','gear-shop.html',['safety','gear-source']),
]
GROUPS=[('home','PROJECT 100','index.html'),('workout','Workout','fit-workout.html'),('nutrition','Nutrition','fit-nutrition.html'),('gear','Gear','gear-shop.html')]
routes={source+':'+id:file+'#'+id for file,_,_,source,ids in FILES if ids for id in ids}
routes.update({'index.html:explore':'index.html#explore','gear-shop.html:armory':'gear-shop.html#gear-files','gear-shop.html:guide':'library.html','fit-nutrition.html:vectors':'fit-protocol-vectors.html'})
def links(items,current):
    return ''.join('<a class="page-tab'+(' current' if f==current else '')+'" href="'+f+'"'+(' aria-current="page"' if f==current else '')+'>'+escape(l)+'</a>' for f,l in items)
def cabinet(items):
    out='<div class="focused-cabinet">'
    for i,(file,label,image) in enumerate(items):
        out+='<a class="focused-folder main-folder" href="'+file+'">'
        if image:out+='<img src="'+image+'" alt="" width="1600" height="900" loading="lazy">'
        out+='<span><span class="folder-number">FILE '+f'{i+1:02d}'+'</span><strong>'+escape(label)+'</strong><span class="main-folder-open">Open file ↗</span></span></a>'
    return out+'</div>'
def directory(doc,id,title,items):
    section=doc.new_tag('section',id=id,attrs={'class':'main-directory','data-main-directory':''})
    section.append(BeautifulSoup('<div class="wrap"><h2>'+title+'</h2>'+cabinet(items)+'</div>','html.parser'));return section

for file,label,group,source,ids in FILES:
    doc=deepcopy(docs[file] if file in docs else docs[source])
    shell=doc.select_one('.page-shell')
    if ids is not None:
        for e in list(shell.find_all(['section','details'],recursive=False)):e.decompose()
        if file=='index.html':
            hero=deepcopy(sections['index.html:top'])
            for e in hero.select('.hero-ctas'):e.decompose()
            lead=hero.select_one('.lead')
            if lead:lead.string='A personal return to training at 46. The goal: 100 lb of measured skeletal muscle, built through consistent training, food and recovery.'
            hero['class']=list(dict.fromkeys(hero.get('class',[])+['compact-main-hero']))
        else:
            original=sections[source+':top']
            hero=doc.new_tag('section',id='top',attrs={'class':'main-file-intro has-section-motion','style':original.get('style','')})
            motion=original.select_one('.section-motion')
            if motion:hero.append(deepcopy(motion))
            hero.append(BeautifulSoup('<div class="wrap"><span class="v2-kicker">PROJECT_100 · '+escape(group.upper())+'</span><h1>'+escape(label)+'</h1><p>One focused file from the lived record. Explore related folders above, or continue with the side arrows.</p></div>','html.parser'))
        shell.select_one('.site-head').insert_after(hero)
        cursor=hero
        for id in ids:
            part=deepcopy(sections[source+':'+id]);cursor.insert_after(part);cursor=part
        if file=='index.html':
            cursor.insert_after(directory(doc,'explore','Explore PROJECT_100.',[
                ('project-story.html','The story','assets/media/october-2026/real-photo-01.jpg'),
                ('project-goals.html','Goals & roadmap',None),
                ('fit-workout.html','Training log',None),('fit-nutrition.html','Nutrition folders',None),
                ('gear-shop.html','Gear folders',None),('fit-protocol.html','The documented system',None)]))
            # Use an existing photo only; resolve below if this optional preview
            # name is not in the curated archive.
            faq=sections.get('index.html:faq')
            if faq:shell.select_one('footer').insert_before(deepcopy(faq))
        elif file=='fit-nutrition.html':
            cursor.insert_after(directory(doc,'nutrition-files','Choose a nutrition file.',[
                ('fit-meals.html','Meals & recipes',None),('fit-nutrition-notes.html','Nutrition notes',None),
                ('fit-protocol-vectors.html','Vector folders','assets/media/october-2026/vector-v4.jpg'),
                ('fit-protocol-nutrition.html','The documented food system',None)]))
        elif file=='gear-shop.html':
            cursor.insert_after(directory(doc,'gear-files','Choose a gear file.',[(f,l,None) for f,l,g,_,_ in FILES if g=='gear' and f!=file]))
        if file=='project-goals.html':
            road=doc.select_one('#roadmap')
            if road:
                detail=doc.new_tag('details',attrs={'class':'focused-notes'})
                summary=doc.new_tag('summary');summary.string='Open the planning roadmap';detail.append(summary)
                road.replace_with(detail);detail.append(road)
    # Curated images retain their proportions and never use a missing placeholder.
    for img in doc.select('.main-directory img'):
        if not (ROOT/img['src']).exists():
            photo=docs['index.html'].select_one('#story img') or docs.get('project-story.html',doc).select_one('#story img')
            if photo:img['src']=photo['src']
            else:img.decompose()
    doc.body['class']=list(dict.fromkeys(doc.body.get('class',[])+['focused-main']))
    header=doc.select_one('.site-head')
    for e in header.select('.page-tabs,.cat-tabs'):e.decompose()
    header.append(BeautifulSoup('<nav class="page-tabs" aria-label="PROJECT_100 folders"><div class="wrap">'+links([(f,l) for g,l,f in GROUPS],next(f for g,l,f in GROUPS if g==group))+'</div></nav>','html.parser'))
    related=[(f,l) for f,l,g,_,_ in FILES if g==group]
    if len(related)>1:header.append(BeautifulSoup('<nav class="page-tabs focused-subtabs" aria-label="Related '+group+' files"><div class="wrap">'+links(related,file)+'</div></nav>','html.parser'))
    drawer=doc.select_one('#siteDrawer nav');drawer.clear();drawer.append(BeautifulSoup(links([(f,l) for g,l,f in GROUPS],None),'html.parser'))
    for e in doc.select('.page-nav-arrow'):e.decompose()
    ring=[f for f,_,_,_,_ in FILES];i=ring.index(file)
    for cls,delta,char in [('prev',-1,'‹'),('next',1,'›')]:
        a=doc.new_tag('a',href=ring[(i+delta)%len(ring)],attrs={'class':f'page-nav-arrow {cls}','aria-label':('Previous' if delta<0 else 'Next')+' file: '+FILES[(i+delta)%len(ring)][1]});a.string=char;doc.body.append(a)
    access=doc.select_one('.site-switch-float');access['href']='fit-protocol.html';access['aria-label']='Switch to FIT PROTOCOL'
    access.select_one('span:last-child').string='FIT PROTOCOL'
    doc.title.string='PROJECT 100 | '+label
    for e in doc.select('link[rel="canonical"],meta[property="og:url"]'):e['href' if e.name=='link' else 'content']='https://project100.fit/'+('' if file=='index.html' else file)
    for e in doc.select('meta[property="og:title"],meta[name="twitter:title"]'):e['content']=doc.title.string
    for e in doc.select('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]'):e['content']='PROJECT_100: '+label+'. A focused file from the training, food and equipment record.'
    if file!='index.html':
        for e in doc.select('script[type="application/ld+json"]'):e.decompose()
    for e in doc.select('script[src*="main-files.js"],link[href*="focused-main.css"]'):e.decompose()
    doc.head.append(doc.new_tag('link',rel='stylesheet',href='assets/css/focused-main.css?v=20261005-main'))
    doc.head.append(doc.new_tag('script',src='assets/js/main-files.js?v=20261005-main',defer=''))
    docs[file]=doc

# Retarget every internal link to a moved main-site section.
for file,doc in docs.items():
    if not doc.select_one('.page-shell'):continue
    for a in doc.select('a[href]'):
        href=a['href']
        if '#' not in href or '://' in href:continue
        dest,hash=href.split('#',1);key=(dest or file)+':'+hash
        if key in routes:a['href']=routes[key]
    (ROOT/file).write_text(str(doc))
manifest={'files':[{'file':f,'label':l,'group':g} for f,l,g,_,_ in FILES],'routes':routes}
(ROOT/'assets/js/main-files.json').write_text(json.dumps(manifest,indent=2)+'\n')
(ROOT/'assets/js/main-files.js').write_text('/* Preserve main-site section bookmarks after splitting the files. */\n(()=>{const routes='+json.dumps(routes)+';const current=location.pathname.split("/").pop()||"index.html";const follow=()=>{let hash;try{hash=decodeURIComponent(location.hash.slice(1))}catch{return};const target=routes[current+":"+hash];if(!target)return;const [file,id]=target.split("#");if(file!==current){location.replace(target);return}const el=document.getElementById(id);const parent=el?.closest("details");if(parent)parent.open=true;};addEventListener("hashchange",follow);follow()})();\n')
protocol=json.loads((ROOT/'assets/js/protocol-files.json').read_text())['files']
active=[x['file'] for x in manifest['files']]+[x['file'] for x in protocol]
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>https://project100.fit/'+('' if f=='index.html' else f)+'</loc><lastmod>2026-10-05</lastmod></url>' for f in active)+'</urlset>\n')
print(f'Built {len(FILES)} focused PROJECT_100 files; landing, nutrition and gear are compact directories.')
