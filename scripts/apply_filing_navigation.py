"""Unify both sites' shells and move reference access out of the header."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['index.html','fit-workout.html','fit-nutrition.html','gear-shop.html',
         'fit-protocol.html','fit-protocol-baseline.html','fit-protocol-fuel.html',
         'fit-protocol-training.html','fit-protocol-troubleshooting.html',
         'fit-protocol-archive.html','guidebook.html','library.html']
for name in PAGES:
    page = ROOT/name
    soup = BeautifulSoup(page.read_text(), 'html.parser')
    for tag, attrs in [('link', {'rel':'stylesheet','href':'assets/css/shell.css'}),
                       ('link', {'rel':'stylesheet','href':'assets/css/filing-navigation.css?v=20261004-2'}),
                       ('script', {'defer':'','src':'assets/js/filing-navigation.js?v=20261004-2'})]:
        key = 'href' if tag == 'link' else 'src'
        if not soup.find(tag,attrs={key:attrs[key]}):soup.head.append(soup.new_tag(tag,**attrs))
    soup.body['class'] = list(dict.fromkeys(soup.body.get('class',[])+['filing-layout']))
    access = soup.select_one('.guidebook-access')
    if access:
        access.extract()
        access['class'] = ['guidebook-access','encyclopedia-float']
        access['aria-label'] = 'Open the full PROJECT 100 Encyclopedia'
        access.clear()
        icon=soup.new_tag('span',**{'class':'guidebook-mark','aria-hidden':'true'});icon.string='100'
        access.append(icon)
        label=soup.new_tag('span');label.string='Encyclopedia'
        access.append(label)
        soup.body.append(access)
    shell=soup.select_one('.page-shell')
    if not shell:
        shell=soup.new_tag('div',**{'class':'page-shell'})
        for node in list(soup.body.children):
            if not getattr(node,'name',None):continue
            classes=node.get('class',[])
            if node.name=='script' or any(c in classes for c in ['site-drawer','site-drawer-backdrop','reader-progress','page-nav-arrow','encyclopedia-float']):continue
            shell.append(node.extract())
        soup.body.insert(0,shell)
    for arrow in soup.select('.page-nav-arrow'):
        if 'deck-page' not in soup.body.get('class',[]):continue
        arrow.extract();soup.body.append(arrow)
    if name=='fit-protocol.html':
        soup.title.string='PROJECT 100 — Fit Protocol | The documented system'
        for meta in soup.select('meta[name="description"],meta[property="og:description"]'):
            meta['content']='The documented PROJECT 100 system: twelve organized files covering the baseline, daily branches, training, fuel and source chapters.'
        for meta in soup.select('meta[property="og:title"]'):meta['content']=soup.title.string
        intro=soup.select_one('.v2-intro')
        intro.h1.clear();intro.h1.append('The system behind the goal.')
        intro.p.string='The documented baseline, daily branches, training and fuel. Open a file below, or use the side arrows to move through Fit Protocol.'
        for el in soup.select('.deck-toolbar,.deck-bottom'):el.decompose()
        overview=soup.select_one('#v2Deck')
        if overview:overview['id']='protocolOverview'
        for section in soup.select('.deck-slide'):
            section['class']=['protocol-file']
            section.attrs.pop('hidden',None)
            if section.find('details',recursive=False):continue
            heading=section.find('h2');kicker=section.select_one('.v2-kicker')
            details=soup.new_tag('details')
            if section['id']=='slide-cover':details['open']=''
            summary=soup.new_tag('summary')
            if kicker:summary.append(kicker.extract())
            summary.append(heading.extract())
            details.append(summary)
            content=soup.new_tag('div',**{'class':'protocol-file-content'})
            for node in list(section.children):content.append(node.extract())
            source=soup.new_tag('a',href=section['data-source'],**{'class':'file-source'})
            source.string='Read the source chapter ↗';content.append(source)
            details.append(content);section.append(details)
    if name.startswith('fit-protocol'):
        for link in soup.select('.v2-actions a.v2-button'):
            link['class']=['file-source']
    page.write_text(str(soup))
