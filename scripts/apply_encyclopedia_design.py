"""Give the unabridged reader its own site identity without changing source text."""
from pathlib import Path
from collections import Counter
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'fit-protocol-archive.html'
s=BeautifulSoup(p.read_text(),'html.parser')
before=Counter(' '.join(x.get_text(' ',strip=True) for x in s.select('.book-text')).split())
s.body['class']=['v2-page','encyclopedia-site']
s.html['data-theme']='light'
for link in s.select('link[rel="stylesheet"]'):
    if any(x in link.get('href','') for x in ['shell.css','filing-navigation.css']):link.decompose()
for script in s.select('script[src]'):
    if 'filing-navigation.js' in script['src']:script.decompose()
if not s.find('link',href='assets/css/encyclopedia.css?v=20261004'):
    s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/encyclopedia.css?v=20261004'))
for script in s.select('script[src]'):
    if 'assets/js/v2.js' in script['src']:script['src']='assets/js/v2.js?v=20261004-encyclopedia'
s.title.string='PROJECT 100 Encyclopedia — The complete reading edition'
for meta in s.select('meta[property="og:title"]'):meta['content']=s.title.string
for meta in s.select('meta[name="description"],meta[property="og:description"]'):
    meta['content']='The complete PROJECT 100 Encyclopedia V2.0: an independent reading edition with chapter navigation, book search, source notes and the original PDF.'
old_header=s.select_one('.site-head')
theme=old_header.select_one('#themeToggle').extract()
header=BeautifulSoup('''<header class="site-head"><nav id="nav" aria-label="Encyclopedia controls"><div class="wrap"><button class="site-menu-tab" id="siteMenuTab" type="button" aria-controls="siteDrawer" aria-expanded="false" aria-label="Open Encyclopedia chapter index">Index</button><div class="nav-wordmark"><a class="brand" href="#top">Encyclopedia<span>PROJECT 100 · READING EDITION</span></a></div></div></nav><nav class="book-navigation" aria-label="Encyclopedia navigation"><a href="#book-index">Contents</a><a href="#reader-tools">Search the book</a><a href="#sources">Sources</a><a href="#changelog">Edition notes</a></nav></header>''','html.parser').header
header.select_one('#nav .wrap').append(theme)
old_header.replace_with(header)
rail=s.select_one('.reader-rail');rail['id']='chapter-index'
s.select_one('.reader-layout')['id']='book-index'
toolbar=s.select_one('.reader-toolbar');toolbar['id']='reader-tools'
mobile=s.select_one('.reader-mobile-index');mobile['id']='mobile-index'
mobile.summary.string='Browse the chapter index'
drawer=s.select_one('#siteDrawer')
drawer.select_one('.sd-brand')['href']='#top';drawer.select_one('.sd-brand').string='Encyclopedia index'
nav=drawer.select_one('nav');nav.clear()
for link in rail.select('a'):
    copy=BeautifulSoup(str(link),'html.parser').a
    # The reader's active state is shared with the desktop/mobile chapter lists.
    nav.append(copy)
drawer.select_one('#siteDrawerClose')['aria-label']='Close chapter index'
intro=s.select_one('.v2-intro,.book-masthead')
resume=intro.select_one('#resumeReading')
if resume:resume=resume.extract()
intro.clear();intro['class']=['book-masthead'];intro['id']='top'
masthead=BeautifulSoup('''<div class="book-opening"><span class="book-edition">VOLUME V2.0 · 03 OCTOBER 2026</span><h1>The Project 100<br/>Encyclopedia.</h1><p class="book-deck">A documented system.<br/>A complete record.</p><p class="book-description">Read the Introduction, twelve chapters, Parts III–VI and both annexes in full. Search the complete text or follow the chapter index at your own pace.</p><div class="book-actions"><a href="assets/downloads/project-100-encyclopedia-v2-0-2026-10-03.pdf" download="">Download the source PDF ↗</a><a href="#book-index">Explore the contents ↓</a></div></div><figure class="book-cover"><img src="assets/img/v2/encyclopedia-cover.png" alt="Original cover of the PROJECT 100 Encyclopedia V2.0"/><figcaption>The single master volume<br/>26 original PDF pages</figcaption></figure><div class="book-edition-strip"><span>12 chapters</span><span>Parts III–VI</span><span>2 annexes</span><span>Unabridged source text</span></div><div class="v2-note">The Encyclopedia governs when an older summary disagrees. These are personal records, not a prescription.</div>''','html.parser')
for node in list(masthead.children):intro.append(node.extract())
if resume:intro.append(resume)
for floated in s.select('.encyclopedia-float,.return-project'):floated.decompose()
back=s.new_tag('a',href='index.html',**{'class':'return-project','aria-label':'Back to PROJECT_100 main website'})
back.string='← Back to PROJECT_100';s.body.append(back)
footer=s.select_one('.v2-footer,.book-footer')
footer.clear();footer['class']=['book-footer']
foot=BeautifulSoup('''<div><span class="book-edition">PROJECT 100 ENCYCLOPEDIA</span><h2>The source stays open.</h2><p>Reading edition · V2.0 · 03 October 2026</p><nav aria-label="Encyclopedia reference links"><a href="#sources">Source record</a><a href="#changelog">Edition history</a><a href="assets/downloads/project-100-encyclopedia-v2-0-2026-10-03.pdf" download="">Original PDF</a></nav></div><p class="book-scope">PROJECT 100 is a personal documented system, published as lived and audited. It is not medical advice. Consult your own clinician before adopting any protocol, supplement, or training method described here.</p>''','html.parser')
for node in list(foot.children):footer.append(node.extract())
assert before==Counter(' '.join(x.get_text(' ',strip=True) for x in s.select('.book-text')).split()),'Reader source text changed'
p.write_text(str(s))
print('Independent Encyclopedia identity applied; complete reader source words preserved.')
