"""Restore expressive section composition without changing operational source text."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
for p in ROOT.glob('*.html'):
    s=BeautifulSoup(p.read_text(),'html.parser')
    if not s.body or 'filing-layout' not in s.body.get('class',[]):continue
    for old in s.select('link[href*="editorial-sections.css"]'):old.decompose()
    s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/editorial-sections.css?v=20261004'))
    if p.name=='index.html':
        era=s.select_one('.era-scroll')
        if era and not s.select_one('.story-chapters'):
            chapters=s.new_tag('div',**{'class':'wrap story-chapters'})
            title=s.new_tag('h3');title.string='The chapters of the return.';chapters.append(title)
            cue=s.new_tag('p',**{'class':'chapter-cue'});cue.string='Explore the chapters horizontally →';chapters.append(cue)
            era['tabindex']='0';era['role']='region';era['aria-label']='Personal journey chapters; scroll horizontally to explore'
            chapters.append(era.extract());s.select_one('.origin-grid').insert_after(chapters)
        for node in s.find_all(string=True):
            if 'The Dark Stage' in node:node.replace_with(str(node).replace('The Dark Stage','The Interruption'))
            elif 'Depth of the Dark Stage' in node:node.replace_with(str(node).replace('Depth of the Dark Stage','During the interruption'))
        panels=s.select('.era-panel')
        if len(panels)>3:panels[3].select_one('p').string='A difficult personal period interrupted regular routines. The return begins with a fresh start and a repeatable day.'
    p.write_text(str(s))
