"""Final build overlay: focused Protocol files and one floating site switch.

Run after the source-based build. Re-running also reads the focused files so no
chapter, clinical note or vector recipe is lost on a second pass.
"""
from pathlib import Path
from copy import deepcopy
from html import escape
from urllib.parse import urlsplit
import json
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
def read(name):
    return BeautifulSoup((ROOT / name).read_text(), 'html.parser')
docs = {p.name: read(p.name) for p in ROOT.glob('*.html')}
chapters, notes, records = {}, {}, {}
for name, doc in docs.items():
    if name.startswith('fit-protocol') or name == 'guidebook.html':
        for section in doc.select('section.book-chapter'):
            if not section.get('id'):continue
            target = notes if section.get('id', '').startswith('guide-page-') else chapters
            target[section['id']] = deepcopy(section)
        for record in doc.select('article[id^="vector-"]'):
            records[record['id']] = deepcopy(record)
        for detail in doc.select('details.focused-notes[id^="guide-page-"]'):
            section = detail.select_one('section')
            if section:
                section = deepcopy(section);section['id'] = detail['id']
                heading=doc.new_tag('h2');heading.string=detail.summary.get_text(' ',strip=True).removeprefix('Daily guide notes · ')
                section.insert(0,heading);notes[detail['id']]=section
        for record in doc.select('article[data-source-vector]'):
            records[record['data-source-vector']]=deepcopy(record)
# Newly rebuilt canonical publications take precedence over older focused files.
for name in ['fit-protocol-baseline.html','fit-protocol-fuel.html','fit-protocol-training.html','fit-protocol-troubleshooting.html','guidebook.html','fit-protocol-archive.html']:
    for section in docs[name].select('section.book-chapter[id]'):
        target = notes if section['id'].startswith('guide-page-') else chapters
        target[section['id']] = deepcopy(section)
template = deepcopy(docs['fit-protocol-fuel.html'])
daily = deepcopy(docs['guidebook.html'].select_one('#today'))
folders = {x['data-vector']: deepcopy(x) for x in docs['fit-nutrition.html'].select('.vector-stack-file')}
for name, doc in docs.items():
    if name.startswith('fit-protocol-vector-'):
        for x in doc.select('.vector-stack-file'): folders[x['data-vector']] = deepcopy(x)

# filename, folder label, group, chapter IDs, optional daily analysis pages
FILES = [
 ('fit-protocol.html', 'Overview', 'overview', [], [2, 4]),
 ('fit-protocol-baseline.html', 'Goals & baseline', 'baseline', ['introduction', 'ch1'], [3]),
 ('fit-protocol-history.html', 'Return to training', 'baseline', ['ch2'], []),
 ('fit-protocol-constraints.html', 'Constraints', 'baseline', ['ch3'], []),
 ('guidebook.html', 'Today', 'daily', [], []),
 ('fit-protocol-fuel.html', 'Daily clock', 'daily', ['ch4'], []),
 ('fit-protocol-checklists.html', 'Checklists', 'daily', ['annex2'], [11, 13]),
 ('fit-protocol-vectors.html', 'Vector folders', 'vectors', [], []),
 ('fit-protocol-vector-reference.html', 'Vector notes', 'vectors', ['part3-vectors'], [9]),
 ('fit-protocol-nutrition.html', 'Food & nutrition', 'nutrition', ['ch5'], [6]),
 ('fit-protocol-supplements.html', 'Pills & accounting', 'supplements', ['ch8'], [7]),
 ('fit-protocol-interactions.html', 'Interactions', 'supplements', ['part4-cascades'], []),
 ('fit-protocol-margins.html', 'Safety margins', 'supplements', ['part5-margins'], [8]),
 ('fit-protocol-training.html', 'Training mechanics', 'training', ['ch6'], [5]),
 ('fit-protocol-progression.html', 'Progression', 'training', ['ch9'], []),
 ('fit-protocol-joints.html', 'Joints & recovery', 'training', ['ch10'], []),
 ('fit-protocol-monitoring.html', 'Metabolic context', 'monitoring', ['ch11'], []),
 ('fit-protocol-labs.html', 'Lab monitoring', 'monitoring', ['part6-lab-integrity'], [10]),
 ('fit-protocol-troubleshooting.html', 'Troubleshooting', 'troubleshooting', ['ch7'], [12]),
 ('library.html', 'Downloads', 'downloads', [], []),
]
ORDER = ['v3', 'v1', 'v2', 'v4', 'v5', 'v10', 'pump']
for key in ORDER:
    label = folders[key].select_one('.stack-label').get_text(' ', strip=True)
    FILES.insert(8 + ORDER.index(key), (f'fit-protocol-vector-{key}.html', label, 'vectors', [], []))
GROUPS = [
 ('overview','Overview','fit-protocol.html'), ('baseline','Baseline','fit-protocol-baseline.html'),
 ('daily','Daily','guidebook.html'), ('vectors','Vectors','fit-protocol-vectors.html'),
 ('nutrition','Nutrition','fit-protocol-nutrition.html'), ('supplements','Supplements','fit-protocol-supplements.html'),
 ('training','Training','fit-protocol-training.html'), ('monitoring','Monitoring','fit-protocol-labs.html'),
 ('troubleshooting','Fixes','fit-protocol-troubleshooting.html'), ('downloads','Downloads','library.html'),
]
routes = {id: f'{name}#{id}' for name, _, _, ids, _ in FILES for id in ids}
routes.update({f'guide-page-{n}': f'{name}#guide-page-{n}' for name, _, _, _, nums in FILES for n in nums})
routes.update({f'vector-{key}': f'fit-protocol-vector-{key}.html#vector-{key}' for key in ORDER})
routes.update({'vectors':'fit-protocol-vectors.html','today':'guidebook.html#today','red-flags':'fit-protocol-checklists.html#annex2'})
routes.update({'s-clock':'fit-protocol-fuel.html#ch4','s-vectors':'fit-protocol-vectors.html','s-fuel':'fit-protocol-nutrition.html#ch5','s-arsenal':'fit-protocol-supplements.html#ch8','s-origin':'fit-protocol-baseline.html#introduction','s-metric':'fit-protocol-baseline.html#ch1','s-patches':'fit-protocol-constraints.html#ch3','s-training':'fit-protocol-training.html#ch6','s-roadmap':'fit-protocol-progression.html#ch9','s-fail':'fit-protocol-troubleshooting.html#ch7','s-qr':'fit-protocol-checklists.html#annex2'})
routes.update({'quickref':'fit-protocol-checklists.html#annex2','annex1':'fit-protocol-supplements.html#ch8','ch12':'fit-protocol-labs.html#part6-lab-integrity'})

def links(items, current=None, cls='page-tab'):
    return ''.join(f'<a class="{cls}{" current" if file == current else ""}" href="{file}"{chr(32)+"aria-current=\"page\"" if file == current else ""}>{escape(label)}</a>' for file, label in items)

def cabinet(items):
    return '<div class="focused-cabinet">'+''.join(f'<a class="focused-folder" href="{file}"><span class="folder-number">FILE {i+1:02d}</span><strong>{escape(label)}</strong><span>Open file ↗</span></a>' for i,(file,label) in enumerate(items))+'</div>'

def vector_cabinet():
    out = '<div class="focused-cabinet vector-cabinet">'
    for key in ORDER:
        folder = folders[key]
        label = folder.select_one('.stack-label').get_text(' ',strip=True)
        hint = folder.select_one('.stack-hint').get_text(' ',strip=True)
        out += f'<a class="focused-folder" style="{escape(folder["style"],quote=True)}" href="fit-protocol-vector-{key}.html"><img src="assets/media/october-2026/vector-{key}.jpg" alt="" width="1600" height="900" loading="lazy"><span><strong>{escape(label)}</strong><small>{escape(hint)}</small><span>Open ingredients + protocol ↗</span></span></a>'
    return out+'</div>'

for name, label, group, ids, nums in FILES:
    if name in docs and docs[name].select_one("main"):
        doc = deepcopy(docs[name])
    else:
        doc = deepcopy(template)
    main = doc.select_one('main')
    if name != 'library.html':
        intro = deepcopy(main.select_one('.v2-intro'))
        main.clear();main.append(intro)
        intro.h1.clear();intro.h1.string = label
        if not intro.p:intro.append(doc.new_tag('p'))
        intro.p.string = 'One focused file. Use the folder tabs to explore related records, or the side arrows to continue through FIT PROTOCOL.'
        for node in intro.select('.v2-actions'):node.decompose()
        if name == 'fit-protocol.html':
            intro.h1.string = 'The system behind the goal.'
            intro.p.string = 'Choose a folder for the information you need. Daily execution, vectors, training and monitoring each have their own focused files.'
            main.append(BeautifulSoup(cabinet([(f,l) for _,l,f in GROUPS if f!=name]),'html.parser'))
        elif name == 'guidebook.html':
            intro.p.string = 'Choose your day type, follow the clock, then open the individual vector or checklist you need.'
            main.append(deepcopy(daily))
            main.append(BeautifulSoup(cabinet([('fit-protocol-fuel.html','Daily clock'),('fit-protocol-vectors.html','Vector folders'),('fit-protocol-checklists.html','Checklists'),('fit-protocol-troubleshooting.html','Troubleshooting')]),'html.parser'))
        elif name == 'fit-protocol-vectors.html':
            intro.p.string = 'The recorded vectors in daily order. Each folder opens a separate ingredient and protocol page with descriptive downloads.'
            main.append(BeautifulSoup(vector_cabinet(),'html.parser'))
        elif name.startswith('fit-protocol-vector-') and name != 'fit-protocol-vector-reference.html':
            key = name.removeprefix('fit-protocol-vector-').removesuffix('.html')
            record = records.get(f'vector-{key}')
            scene = record.select_one('.vector-scene') if record else None
            if scene:
                intro['style']=scene.get('style','')
                motion=intro.select_one('.section-motion')
                if motion:motion.decompose()
                if scene.select_one('.section-motion'):intro.insert(0,deepcopy(scene.select_one('.section-motion')))
            studio = doc.new_tag('div',attrs={'class':'vector-studio focused-vector','id':f'vector-{key}'})
            folder = deepcopy(folders[key]);folder['open']='';folder.attrs.pop('name',None)
            studio.append(folder);main.append(studio)
            # Keep the recorded ingredients and five clinical lenses searchable,
            # without repeating the persona artwork inside the opened folder.
        for id in ids:
            section = deepcopy(chapters[id])
            for c in section.select('.chapter-source'):c.decompose()
            main.append(section)
        for n in nums:
            section = deepcopy(notes[f'guide-page-{n}'])
            detail=doc.new_tag('details',attrs={'class':'focused-notes','id':section['id']})
            section.attrs.pop('id',None)
            summary=doc.new_tag('summary');summary.string='Daily guide notes · '+section.h2.get_text(' ',strip=True)
            section.h2.decompose();detail.append(summary);detail.append(section);main.append(detail)
    doc.body['class'] = list(dict.fromkeys([c for c in doc.body.get('class',[]) if c not in ['deck-page','daily-page','encyclopedia-site']]+['focused-protocol']))
    doc.title.string = f'PROJECT 100 — FIT PROTOCOL | {label}'
    for meta in doc.select('meta[name="description"],meta[property="og:description"]'):meta['content']=f'FIT PROTOCOL: {label}. A focused PROJECT 100 record with related folder navigation.'
    for meta in doc.select('meta[property="og:title"],meta[name="twitter:title"]'):meta['content']=doc.title.string
    for meta in doc.select('meta[property="og:url"],link[rel="canonical"]'):
        meta['href' if meta.name=='link' else 'content']='https://project100.fit/'+name
    header=doc.select_one('.site-head')
    for old in header.select('.page-tabs,.cat-tabs'):old.decompose()
    nav=BeautifulSoup('<nav class="page-tabs" aria-label="FIT PROTOCOL folders"><div class="wrap">'+links([(f,l) for g,l,f in GROUPS],next(f for g,l,f in GROUPS if g==group))+'</div></nav>','html.parser')
    header.append(nav)
    related=[(f,l) for f,l,g,_,_ in FILES if g==group]
    if len(related)>1:
        header.append(BeautifulSoup('<nav class="page-tabs focused-subtabs" aria-label="'+escape(label)+' related files"><div class="wrap">'+links(related,name)+'</div></nav>','html.parser'))
    drawer=doc.select_one('#siteDrawer nav');drawer.clear();drawer.append(BeautifulSoup(links([(f,l) for g,l,f in GROUPS],cls='drawer-file'),'html.parser'))
    for arrow in doc.select('.page-nav-arrow'):arrow.decompose()
    ring=[f for f,_,_,_,_ in FILES];i=ring.index(name)
    for cls,delta,glyph in [('prev',-1,'‹'),('next',1,'›')]:
        a=doc.new_tag('a',href=ring[(i+delta)%len(ring)],attrs={'class':f'page-nav-arrow {cls}','aria-label':f'{"Previous" if delta<0 else "Next"} file: '+FILES[(i+delta)%len(ring)][1]});a.string=glyph;doc.body.append(a)
    docs[name]=doc

# Retire the complete reader while preserving incoming chapter bookmarks.
for name in ['fit-protocol-archive.html','encyclopedia.html','encyclopedia-guidebook.html','encyclopedia-archive.html']:
    docs[name]=BeautifulSoup('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>PROJECT 100 — FIT PROTOCOL</title><meta http-equiv="refresh" content="0;url=fit-protocol.html"><script>const routes='+json.dumps(routes)+';let key;try{key=decodeURIComponent(location.hash.slice(1))}catch{};location.replace(routes[key]||"fit-protocol.html");</script></head><body><h1>FIT PROTOCOL</h1><p><a href="fit-protocol.html">Open the focused protocol files</a></p></body></html>','html.parser')

for name, doc in docs.items():
    if not doc.select_one('.page-shell'):continue
    protocol = name in [f for f,_,_,_,_ in FILES]
    for old in doc.select('.site-destinations'):old.decompose()
    access=doc.select_one('.guidebook-access')
    if access:
        access['class']=['guidebook-access','site-switch-float']
        access['href']='index.html' if protocol else 'fit-protocol.html'
        access.attrs.pop('data-door',None)
        access['aria-label']='Switch to PROJECT_100' if protocol else 'Switch to FIT PROTOCOL'
        access.clear()
        icon=doc.new_tag('span',attrs={'class':'guidebook-mark','aria-hidden':'true'});icon.string='↔';access.append(icon)
        text=doc.new_tag('span');text.string='PROJECT_100' if protocol else 'FIT PROTOCOL';access.append(text)
    for a in list(doc.select('a[href]')):
        u=urlsplit(a['href']);file=u.path.split('/')[-1]
        if file in ['fit-protocol-archive.html','encyclopedia.html','encyclopedia-guidebook.html','encyclopedia-archive.html']:
            if u.fragment in routes:
                a['href']=routes[u.fragment]
                if 'encyclopedia' in a.get_text(' ',strip=True).lower():a.string='Open the focused protocol file ↗'
            else:a.decompose()
        elif file=='guidebook.html' and u.fragment in routes:a['href']=routes[u.fragment]
        elif file in ['fit-protocol-fuel.html','fit-protocol-baseline.html','fit-protocol-training.html','fit-protocol-troubleshooting.html'] and u.fragment in routes:a['href']=routes[u.fragment]
        elif 'project-100-encyclopedia-' in file:
            card=a.find_parent(class_='v2-card')
            if card and name=='library.html':card.decompose()
            else:a.decompose()
    # Replace the homepage's old three-door block with two clear entries.
    if name=='index.html':
        doors=doc.select_one('#doors')
        if doors:
            doors.clear();doors.append(BeautifulSoup('<div class="wrap"><h2>Explore FIT PROTOCOL</h2>'+cabinet([('fit-protocol.html','Browse the system'),('guidebook.html','Run it daily')])+'</div>','html.parser'))
        for answer in doc.select('.faq-a'):
            text=answer.get_text(' ',strip=True)
            if 'The Encyclopedia V2.0 is the master record' in text:answer.string='A documented personal comeback at 46: the goal is 100 lb of bioimpedance-estimated skeletal muscle below 15% body fat, with no guaranteed timeline.'
            elif 'the complete Encyclopedia with 12 chapters' in text:answer.string='FIT PROTOCOL is the system behind the lived record: focused files for daily execution, vectors, nutrition, training and monitoring.'
        for schema in doc.select('script[type="application/ld+json"]'):
            if 'FAQPage' in schema.get_text():
                schema.string=json.dumps({'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':d.summary.get_text(' ',strip=True),'acceptedAnswer':{'@type':'Answer','text':d.select_one('.faq-a').get_text(' ',strip=True)}} for d in doc.select('.faq-item')]})
    if name=='gear-shop.html':
        guide=doc.select_one('#guide')
        if guide:
            guide.h2.string='Focused files and downloads.'
            guide.p.string='Explore the documented system or download the daily guide and reference material.'
    if name=='library.html':
        intro=doc.select_one('.v2-intro')
        if intro:intro.p.string='Download the Daily Guidebook, Simplified Structure, visual walkthrough and checklist. Direct downloads, no account required.'
    if name=='fit-nutrition.html':
        studio=doc.select_one('.vector-studio')
        if studio:studio.replace_with(BeautifulSoup(vector_cabinet(),'html.parser'))
        p=doc.select_one('#vectors .vector-entry p')
        if p:p.string='Choose a compact folder preview. Ingredients, protocol notes and diagram downloads open on their own focused pages.'
    for tag in doc.select('link[href*="focused-protocol.css"]'):tag.decompose()
    doc.head.append(doc.new_tag('link',rel='stylesheet',href='assets/css/focused-protocol.css?v=20261005-files'))
    if protocol and not doc.select_one('link[href*="vector-studio.css"]'):
        doc.head.append(doc.new_tag('link',rel='stylesheet',href='assets/css/vector-studio.css?v=20261004-quiet'))
    for tag in doc.select('script[src*="filing-navigation.js"]'):tag['src']='assets/js/filing-navigation.js?v=20261005-files'
    # No stale reader resume bar or publication index on focused pages.
    if protocol:
        for node in doc.select('#resumeReading,.reader-progress,.reader-sidebar,.reader-toc'):node.decompose()
    footer=doc.select_one('.v2-footer')
    if footer:
        for p in footer.select('p'):
            if p.get_text(' ',strip=True).startswith('Encyclopedia V2.0'):p.string='PROJECT 100 · V2.0 · 3 October 2026'
    (ROOT/name).write_text(str(doc))
for name in ['fit-protocol-archive.html','encyclopedia.html','encyclopedia-guidebook.html','encyclopedia-archive.html']:(ROOT/name).write_text(str(docs[name]))

manifest={'files':[{'file':f,'label':l,'group':g} for f,l,g,_,_ in FILES],'routes':routes}
(ROOT/'assets/js/protocol-files.json').write_text(json.dumps(manifest,indent=2)+'\n')
active=['index.html','fit-workout.html','fit-nutrition.html','gear-shop.html']+[f for f,_,_,_,_ in FILES]
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>https://project100.fit/'+('' if f=='index.html' else f)+'</loc><lastmod>2026-10-05</lastmod></url>' for f in active)+'</urlset>\n')
# Static mapping keeps existing bookmarks working without a network fetch.
js=ROOT/'assets/js/filing-navigation.js'
text=js.read_text().split('/* Focused protocol bookmark routes. */')[0].rstrip()
text+='\n/* Focused protocol bookmark routes. */\n(()=>{const routes='+json.dumps(routes)+';const current=location.pathname.split("/").pop();if(!current.startsWith("fit-protocol")&&current!=="guidebook.html")return;const follow=()=>{let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return};const target=routes[id];if(!target)return;const [file,hash]=target.split("#");if(file!==current){location.replace(target);return}const el=document.getElementById(hash);if(el?.tagName==="DETAILS")el.open=true;};addEventListener("hashchange",follow);follow()})();\n'
js.write_text(text)
print(f'Built {len(FILES)} focused Protocol files; retired full-reader access and moved the site switch.')
governance=ROOT/'CONTENT_GOVERNANCE.md'
text=governance.read_text()
text=text.replace('keep the repaired design, top menus and PROJECT_100 / FIT PROTOCOL switch.', 'keep the repaired design and folder menus; use one lower-right PROJECT_100 / FIT PROTOCOL switch.')
text=text.replace('Encyclopedia access floats at the lower right, outside navigation; the Daily Guidebook is a distinct page.', 'The complete Encyclopedia reader and its public links are suspended. The Daily Guidebook is a compact execution page, with notes distributed across focused topic files.')
text=text.replace('Available downloads: Encyclopedia, Guidebook,', 'Available downloads: Guidebook,')
governance.write_text(text)
