"""Build V2.0 reader and derivatives from the delivered PDFs without rewriting source text.

Requires PyMuPDF and BeautifulSoup. The deployed site requires no Python or backend.
Run from the repository root. Existing proof-page layouts are retained from the repair baseline.
"""
from pathlib import Path
from collections import Counter
from html import escape
import json, re, subprocess
import fitz
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = '2216895f34a720879abd7b8fda5ac050e04bee18'
DATE = '2026-10-03'
MASTER = 'project-100-encyclopedia-v2-0-2026-10-03.pdf'
GUIDE = 'project-100-guidebook-v2-0-2026-10-03.pdf'
DOWNLOAD = 'assets/downloads/'
DISCLAIMER = 'PROJECT 100 is a personal documented system, published as lived and audited. It is not medical advice. Consult your own clinician before adopting any protocol, supplement, or training method described here.'
CAT = ['Story','Metrics','System','Training','Fuel','Supplements','Safety & Clinical','Reference']

def original(name):
    return subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT,text=True)
def write(name,text):
    (ROOT/name).parent.mkdir(parents=True,exist_ok=True)
    (ROOT/name).write_text(text)
def link(anchor,label):
    return f'<a href="fit-protocol-archive.html#{anchor}">{escape(label)}</a>'
def button(href,label,primary=False,download=False):
    return f'<a class="v2-button{" primary" if primary else ""}" href="{href}"{" download" if download else ""}>{escape(label)}</a>'
def note(text):
    return f'<div class="v2-note">{text}</div>'

def tables(page):
    """Recover table geometry from original header cells and row rules, including all words."""
    draws=page.get_drawings(); groups={}
    for d in draws:
        r=d['rect']; fill=d.get('fill')
        if fill and max(fill)<.25 and r.width>5 and 10<r.height<60:
            groups.setdefault((round(r.y0,1),round(r.y1,1)),[]).append(r)
    found=[]
    for (y0,y1),cells in groups.items():
        cells=sorted(cells,key=lambda x:x.x0)
        if len(cells)<2 or any(abs(cells[i].x1-cells[i+1].x0)>2 for i in range(len(cells)-1)):continue
        xs=[cells[0].x0]+[r.x1 for r in cells]
        ys=sorted(set(round(d['rect'].y1,2) for d in draws if d['rect'].height<2 and abs(d['rect'].x0-xs[0])<2 and abs(d['rect'].x1-xs[1])<2 and d['rect'].y0>y1))
        # Table rules are contiguous; stop before a separate later table/callout.
        end=[];prev=y1
        for y in ys:
            if y-prev>160:break
            end.append(y);prev=y
        if not end:continue
        bounds=[y0,y1]+end
        words=page.get_text('words'); rows=[]
        for a,b in zip(bounds,bounds[1:]):
            row=[]
            for x,z in zip(xs,xs[1:]):
                cell=[w for w in words if x<=(w[0]+w[2])/2<z and a<=(w[1]+w[3])/2<b]
                cell.sort(key=lambda w:(round(w[1],1),w[0]))
                row.append(' '.join(w[4] for w in cell))
            rows.append(row)
        found.append({'rect':fitz.Rect(xs[0],y0,xs[-1],bounds[-1]),'rows':rows})
    return found

def table_html(rows,caption='Published source table'):
    if not rows:return ''
    heads=rows[0]
    h='<table class="v2-table"><caption>'+escape(caption)+'</caption><thead><tr>'+''.join('<th scope="col">'+escape(x)+'</th>' for x in heads)+'</tr></thead><tbody>'
    for row in rows[1:]:
        h+='<tr>'+''.join(f'<td data-label="{escape(heads[i],quote=True)}">{escape(x)}</td>' for i,x in enumerate(row))+'</tr>'
    return h+'</tbody></table>'

def footer_text(s):
    return bool(re.match(r'PROJECT 100 ENCYCLOPEDIA V2\.0 - 2026-10-03',s) or re.match(r'Project 100 Guidebook V2\.0',s) or s.startswith('PROJECT 100 • ENCYCLOPEDIA'))

def export_page(page,n,book='Encyclopedia'):
    ts=tables(page); events=[(t['rect'].y0,table_html(t['rows'],f'{book} V2.0 · PDF page {n}')) for t in ts]
    emitted=[]
    for t in ts:
        emitted.extend(' '.join(row) for row in t['rows'])
    for b in page.get_text('blocks'):
        if b[6]!=0:continue
        text=' '.join(b[4].split())
        if not text or footer_text(text):continue
        rect=fitz.Rect(b[:4])
        if any(t['rect'].intersects(rect) for t in ts):continue
        emitted.append(text)
        if re.match(r'(Chapter \d|Part [IVX]|Annex [IVX]|How to read|Introduction -|Contents$|Version history and closing)',text):tag='h3'
        elif len(text)<95 and not text.endswith(('.',':')) and rect.height<30:tag='h3'
        else:tag='p'
        cls=' class="analysis"' if text.startswith(('Analysis ','Clinical analysis','Red-flag checklist')) else ''
        events.append((rect.y0,f'<{tag}{cls}>{escape(text)}</{tag}>'))
    # Verify no substantive source words were dropped by table reconstruction.
    source=[b[4] for b in page.get_text('blocks') if b[6]==0 and not footer_text(' '.join(b[4].split()))]
    tokens=lambda values:Counter(re.findall(r'\S+',' '.join(values)))
    assert tokens(source)==tokens(emitted), f'Source text mismatch: {book} page {n}: {tokens(source)-tokens(emitted)}'
    return f'<div class="source-page" data-pdf-page="{n}"><div class="source-page-label">{book} V2.0 · PDF page {n}</div>'+''.join(x[1] for x in sorted(events,key=lambda x:x[0]))+'</div>'

import runpy
runpy.run_path(str(ROOT / 'scripts/apply_personal_privacy.py'))
master=fitz.open(ROOT/DOWNLOAD/MASTER)
guide=fitz.open(ROOT/DOWNLOAD/GUIDE)
source_pages=[export_page(p,i+1) for i,p in enumerate(master)]
guide_pages=[export_page(p,i+1,'Guidebook') for i,p in enumerate(guide)]

CHAPTERS=[
 ('how-to-read','How to Read + Contents','Reference',[0,1,2]),
 ('introduction','Introduction — The Architecture of Return','Story',[3]),
 ('ch1','1 · The Prime Directive + BIA Physics','Metrics',[4]),
 ('ch2','2 · Excavation and the Return to Training','Story',[5]),
 ('ch3','3 · Hardware Locks and Clinical Constraints','Safety & Clinical',[6]),
 ('ch4','4 · The Chronometer and Daily Sequence','System',[7]),
 ('ch5','5 · Solid Fuel and Nutrition Records','Fuel',[8]),
 ('ch6','6 · Training Mechanics and Movement Classes','Training',[9]),
 ('ch7','7 · The Failure Matrix and Correction Method','Safety & Clinical',[10]),
 ('ch8','8 · Supplements, Pills and Micronutrient Accounting','Supplements',[11,12]),
 ('ch9','9 · Planning over Months and Years','Training',[13]),
 ('ch10','10 · Connective Tissue and Injury Considerations','Safety & Clinical',[14]),
 ('ch11','11 · Hormonal and Metabolic Interpretation','Safety & Clinical',[15]),
 ('ch12','12 · The Singularity Philosophy','Story',[16]),
 ('part3-vectors','Part III · Vector Deep Dives','Supplements',[17,18]),
 ('part4-cascades','Part IV · The Five Interaction Cascades','Safety & Clinical',[19]),
 ('part5-margins','Part V · Toxicological Margins','Safety & Clinical',[20]),
 ('part6-lab-integrity','Part VI · Laboratory Integrity','Safety & Clinical',[21]),
 ('annex1','Annex I · Tactical Tables','Reference',[22]),
 ('annex2','Annex II · Operator + Red-Flag Checklists','Safety & Clinical',[23]),
 ('sources','Sources, Evidence Limits and Version History','Reference',[24,25]),
]
clock=tables(master[7])[0]['rows']
vectors=tables(master[17])[0]['rows'][1:]+tables(master[18])[0]['rows'][1:]
cas=tables(master[19])[0]['rows'][1:]
margins=tables(master[20])[0]['rows']

def clinical(mechanism,interaction,margin,monitor,stop,source='Part III · Parts IV–VI · Annex II',opened=False):
    pairs=[('Mechanism',mechanism),('Stack interaction',interaction),('Margin',margin),('Monitor',monitor),('Stop rule',stop)]
    return '<details class="clinical-card"'+(' open' if opened else '')+'><summary>Clinical notes · five lenses</summary><dl>'+''.join('<dt>'+a+'</dt><dd>'+escape(b)+'</dd>' for a,b in pairs)+'</dl><p class="clinical-source">Encyclopedia V2.0 · '+escape(source)+' · '+link('part4-cascades','Read the source cascades')+'</p></details>'

def vector_cards():
    out=''
    for row in vectors:
        name,timing,base,formula,mechanism=row
        key=name.split()[0]
        ci={'V1':cas[4],'V2':cas[3],'V3':cas[3],'V4':cas[2],'V5':cas[3],'V10':cas[3],'PUMP':cas[1]}[key]
        if key=='V1':margin='IGNITER about 373 mg caffeine before tea; with tea about 413–443 mg versus Health Canada 400 mg/day guidance.';monitor='Sleep duration and awakenings; session RPE and performance.';stop='Palpitations, fainting or sleep disruption that does not resolve when caffeine is pulled earlier.'
        elif key=='V4':margin='R-ALA 300 mg training days; no UL established. V4 is one 36 g half-serving, with 19 g carbohydrate.';monitor='Recurrent sweating, tremor or confusion after training.';stop='Recurrent sweating, tremor or confusion after training: stop and seek assessment.'
        elif key=='PUMP':margin='Inactive: never used with V1.';monitor='Branch selected correctly; morning stimulant session recorded.';stop='Do not combine this inactive evening alternative with V1.'
        else:margin='Supplemental magnesium: training baseline 341 mg; up to 646 mg with options, versus 350 mg/day supplemental UL. Rest totals are lower and not fully quantified.';monitor='Stool, pain, weakness, sleep and performance noted; options marked as taken or skipped.';stop='Recurrent watery stools with weight loss, oily stools or significant abdominal pain: stop and seek assessment.'
        out+=f'<article class="v2-card" id="vector-{key.lower()}" data-category="Supplements"><span class="v2-kicker">{"Inactive reference" if key=="PUMP" else "Recorded recipe"}</span><h3>{escape(name)}</h3><p><b>{escape(timing)}</b></p><p>{escape(base)}</p><p>{escape(formula)}</p>'+clinical(mechanism,ci[2]+' — '+ci[4],margin,monitor,stop,opened=True)+link('part3-vectors','Read the complete formulation')+'</article>'
    return out

def doors():
    return '<div class="v2-grid">'+''.join(f'<a class="v2-card v2-door" data-door="{key}" href="{url}"><span>{time}</span><h3>{title} ↗</h3><p>{description}</p></a>' for key,url,time,title,description in [
      ('start','fit-protocol.html','Door 1 · 5 minutes','Start Here','Who Bogdan is, the return, the baseline numbers, and the system on one screen.'),
      ('deep','fit-protocol-archive.html','Door 2 · The book','Go Deep','The Encyclopedia V2.0: 12 chapters, Parts III–VI and both annexes, unabridged and free.'),
      ('daily','guidebook.html','Door 3 · Daily','Run It Daily','Training or rest day, the clock, the vectors, and the fixes. Read or print the daily manual.')])+'</div>'

main_nav=[('index.html','PROJECT 100'),('fit-workout.html','Fit Workout'),('fit-nutrition.html','Fit Nutrition'),('gear-shop.html','Fit Gear')]
protocol_nav=[('fit-protocol.html','Start Here'),('fit-protocol-baseline.html','Baseline'),('fit-protocol-fuel.html','Timing & Fuel'),('fit-protocol-training.html','Training'),('fit-protocol-troubleshooting.html','Troubleshooting'),('guidebook.html','Daily Guidebook'),('library.html','Get the Books')]

def header(filename,protocol=False):
    soup=BeautifulSoup(original('index.html'),'html.parser')
    h=soup.select_one('header.site-head')
    h.select_one('.brand').clear();h.select_one('.brand').append(BeautifulSoup('PROJECT <b>100</b>','html.parser'))
    h.select_one('.site-destinations').clear()
    for url,label,selected in [('index.html','PROJECT_100',not protocol),('fit-protocol.html','FIT PROTOCOL',protocol)]:
        h.select_one('.site-destinations').append(BeautifulSoup(f'<a href="{url}"'+(' aria-current="page"' if selected else '')+f'>{label}</a>','html.parser'))
    bar=h.select_one('.guidebook-access');bar['href']='fit-protocol-archive.html';bar.select_one('strong').string='ENCYCLOPEDIA · V2.0';bar['data-door']='deep'
    wrap=h.select_one('.page-tabs .wrap');wrap.clear()
    for url,label in protocol_nav if protocol else main_nav:
        wrap.append(BeautifulSoup(f'<a class="page-tab'+(' current' if filename==url else '')+f'" href="{url}"'+(' aria-current="page"' if filename==url else '')+f'>{label}</a>','html.parser'))
    h.select_one('.page-tabs')['aria-label']='Fit Protocol pages' if protocol else 'PROJECT 100 pages'
    h.select_one('.cat-tabs').decompose()
    h.select_one('#siteMenuTab')['aria-controls']='siteDrawer';h.select_one('#siteMenuTab')['aria-expanded']='false'
    drawer=soup.select_one('#siteDrawer');drawer.select_one('.sd-brand').string='PROJECT 100';drawer.select_one('nav').clear()
    for url,label in (protocol_nav if protocol else main_nav)+[('fit-protocol-archive.html','Encyclopedia V2.0')]:
        drawer.select_one('nav').append(BeautifulSoup(f'<a href="{url}">{label} ↗</a>','html.parser'))
    return str(soup.select_one('#siteDrawerBackdrop'))+str(drawer)+str(h)

def footer(protocol=False):
    nav=protocol_nav if protocol else main_nav
    return '<footer class="v2-footer"><div class="v2-footer-grid"><div><h3>PROJECT 100</h3><p>Train like two. Eat for two.<br>Not a double dose, a double commitment.</p><p>Encyclopedia V2.0 · 3 October 2026</p></div><div><h3>'+('Read' if protocol else 'Live proof')+'</h3>'+''.join(f'<a href="{url}">{label}</a>' for url,label in nav)+'</div><div><h3>Reference</h3><a href="fit-protocol-archive.html">Encyclopedia</a><a href="library.html">Books &amp; Downloads</a><a href="fit-protocol-archive.html#changelog">Changelog</a></div><div><h3>Follow</h3><a href="https://www.instagram.com/fudge_fit/" target="_blank" rel="noopener">@fudge_fit ↗</a><a href="https://www.youtube.com/@FUDGE_fit" target="_blank" rel="noopener">YouTube ↗</a></div></div><p>'+DISCLAIMER+'</p></footer>'

titles={'fit-protocol.html':'Start Here (The Deck)','fit-protocol-archive.html':'The Encyclopedia','guidebook.html':'Guidebook: Run It Daily','library.html':'Books & Downloads','index.html':'Bogdan’s Muscle Mass Excavation','fit-workout.html':'Training Log','fit-nutrition.html':'Nutrition & Meals','gear-shop.html':'Gear & Armory','fit-protocol-baseline.html':'Baseline & Constraints','fit-protocol-fuel.html':'Timing & Fuel','fit-protocol-training.html':'Training & Progression','fit-protocol-troubleshooting.html':'Troubleshooting & Reference'}
def metadata(filename,description):
    title='PROJECT 100 — '+titles[filename]+" | Bogdan’s Muscle Mass Excavation"
    return f'<title>{escape(title)}</title><meta name="description" content="{escape(description,quote=True)}"><link rel="canonical" href="https://project100.fit/{"" if filename=="index.html" else filename}"><meta property="og:type" content="website"><meta property="og:title" content="{escape(title,quote=True)}"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:url" content="https://project100.fit/{filename}"><meta property="og:image" content="https://project100.fit/assets/img/v2/social-{filename[:-5]}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">'

def page(filename,body,description,classes='',arrows=None):
    head='<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+metadata(filename,description)+'<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="assets/css/fixonic.css"><link rel="stylesheet" href="assets/css/site-repairs.css?v=20261003"><link rel="stylesheet" href="assets/css/v2.css?v=20261004">'
    arrow=''
    if arrows:
        arrow=f'<a class="page-nav-arrow prev" href="{arrows[0]}" aria-label="Previous page">‹</a><a class="page-nav-arrow next" href="{arrows[1]}" aria-label="Next page">›</a>'
    write(filename,'<!DOCTYPE html><html lang="en"><head>'+head+'</head><body class="v2-page '+classes+'">'+header(filename,True)+arrow+body+footer(True)+'<script src="assets/js/v2.js?v=20261004" defer></script></body></html>')

def chapter_links():
    return ''.join(f'<a href="#{id}" data-chapter-link="{id}">{escape(title)}</a>' for id,title,cat,nums in CHAPTERS)

reader='<div class="reader-progress" aria-hidden="true"><span id="readingProgress"></span></div><div class="wrap v2-intro" id="top"><span class="v2-kicker">PROJECT 100 · Encyclopedia V2.0 · 3 October 2026</span><h1>The complete<br>Encyclopedia.</h1><p>The single master volume. Read the Introduction, 12 chapters, Parts III–VI, and both annexes in full. On-site chapters stay free either way.</p><div class="v2-actions">'+button(DOWNLOAD+MASTER,'Download the Encyclopedia PDF',True,True)+button('guidebook.html','Run It Daily')+'</div>'+note('The Encyclopedia governs when an older summary disagrees. These are personal records, not a prescription.')+'<div id="resumeReading" class="v2-note" hidden><a href="#introduction">Continue reading</a> <button class="v2-button" type="button">Dismiss</button></div></div>'
reader+='<div class="reader-layout"><aside class="reader-rail" aria-label="Chapter index"><b>Chapters</b>'+chapter_links()+'</aside><main id="mainContent"><details class="reader-mobile-index"><summary>Chapters · open index</summary><nav>'+chapter_links()+'</nav></details><div class="reader-toolbar"><label>Search the book<input type="search" id="readerSearch" placeholder="Try: R-ALA, zinc, sleep…"></label><label>Category<select id="readerCategory"><option value="all">All categories</option>'+''.join(f'<option>{escape(c)}</option>' for c in CAT)+'</select></label><div class="reader-results" id="readerResults" aria-live="polite">21 sections · complete source text</div><p id="readerPosition" class="v2-provenance"></p></div>'
for id,title,cat,nums in CHAPTERS:
    nums_label=', '.join(str(n+1) for n in nums)
    reader+=f'<section class="book-chapter" id="{id}" data-category="{escape(cat)}"><span class="v2-kicker">{escape(cat)}</span><h2>{escape(title)}</h2><div class="chapter-source">Encyclopedia V2.0 · PDF page(s) {nums_label} · <a href="{DOWNLOAD+MASTER}#page={nums[0]+1}">Open original PDF</a> <button class="v2-button" type="button" data-print-chapter="{id}">Print / Save this chapter as PDF</button></div><div class="book-text">'+''.join(source_pages[n] for n in nums)+'</div>'
    if id in ['ch4','ch5','ch6','ch7']:reader+=note('Running this today? '+button('guidebook.html','Open the Daily Guidebook'))
    if id in ['ch3','ch4','ch5','ch6','ch7','ch8']:reader+=f'<p class="v2-provenance" id="{id}-clinical-notes">Clinical reference: '+link('part4-cascades','Five interaction cascades')+' · '+link('part5-margins','Margins')+' · '+link('part6-lab-integrity','Laboratory integrity')+'</p>'
    reader+='</section>'
history = BeautifulSoup(original('encyclopedia-guidebook.html'),'html.parser').select_one('#changelog .chapter-body')
for table in history.select('table'):
    table['class']='v2-table'
    heads=[h.get_text(' ',strip=True) for h in table.select('tr')[0].select('th')]
    for row in table.select('tr')[1:]:
        for i,cell in enumerate(row.select('td')):cell['data-label']=heads[i] if i<len(heads) else 'Record'
reader+='<section class="book-chapter" id="changelog"><h2>Website Changelog</h2><p>3 October 2026 · V2.0 website release: authoritative Encyclopedia and Guidebook imported; separate entry pages, mobile reader tables, direct downloads, and source links published. Preserved the repaired top menus, site switch and homepage media framing. Dedicated appliance content remains excluded by author instruction.</p><details><summary>Historical website changelog · superseded editions</summary>'+str(history)+'</details></section></main></div>'
page('fit-protocol-archive.html',reader,'The complete PROJECT 100 Encyclopedia V2.0: twelve chapters, vector deep dives, clinical cascades, margins and laboratory integrity. Free online.', 'reader-page')

# The daily view comes from the master clock. The delivered Guidebook follows in full.
daily='<main class="wrap"><div class="v2-intro" id="top"><span class="v2-kicker">Door 3 · Run It Daily · V2.0</span><h1>The daily<br>Guidebook.</h1><p>The clock, the branches, the records and the fixes. Choose a day type, then read the source notes before changing a protocol.</p><div class="v2-actions">'+button(DOWNLOAD+GUIDE,'Download the Guidebook PDF',True,True)+button('fit-protocol-archive.html#ch4','Read the source clock')+'</div></div><section class="guide-spread" id="today"><h2>Today at a glance</h2><div class="day-controls"><button class="v2-button" data-day="training" aria-pressed="true">Training day</button><button class="v2-button" data-day="rest" aria-pressed="false">Rest day</button><span id="dayStatus" aria-live="polite"></span></div>'+note('Clock times are reference anchors, not rigid deadlines. PUMP is inactive. Training pill grids are skipped on rest days.')+'<div class="daily-clock">'
for row in clock[1:]:
    for branch,col in [('training',1),('rest',2)]:
        daily+=f'<article class="clock-card" data-branch="{branch}"><span class="branch-name">{branch.upper()} DAY</span><p><time>{escape(row[0])}</time></p><p>{escape(row[col])}</p><p class="v2-provenance">{escape(row[3])}</p>'+link('ch4','Encyclopedia · Chapter 4')+'</article>'
daily+='</div></section><section class="guide-spread" id="vectors"><h2>The recorded vectors</h2><div class="v2-grid">'+vector_cards()+'</div></section>'
for i,html in enumerate(guide_pages):
    # Cover is represented by the page hero; all remaining source text remains available.
    source=['ch1','how-to-read','introduction','ch4','ch6','ch5','ch8','part5-margins','part3-vectors','part6-lab-integrity','annex1','ch7','annex2'][min(i,12)]
    title=' '.join(guide[i].get_text().splitlines()[:1])
    daily+=f'<section class="book-chapter guide-spread" id="guide-page-{i+1}"><h2>{escape(title if i else "Guidebook V2.0 · Cover record")}</h2><div class="book-text">{html}</div><p class="chapter-source">Source: '+link(source,'Encyclopedia V2.0 · '+source)+'</p></section>'
daily+='<section class="guide-spread" id="red-flags"><h2>Red-flag checklist</h2><div class="book-text">'+source_pages[23]+'</div><div class="v2-actions">'+button(DOWNLOAD+'project-100-red-flag-checklist-v2-0-2026-10-03.pdf','Download the one-page checklist',True,True)+'</div></section>'+doors()+'</main>'
page('guidebook.html',daily,'PROJECT 100 Guidebook V2.0: a printable daily manual with training/rest branches, source-linked vectors, clinical notes and monitoring checklists.','daily-page')

# A true one-page source extract, not a newly invented medical checklist.
red=fitz.open();red.insert_pdf(master,from_page=23,to_page=23);red.save(ROOT/DOWNLOAD/'project-100-red-flag-checklist-v2-0-2026-10-03.pdf')

library='<main class="wrap"><div class="v2-intro" id="top"><span class="v2-kicker">PROJECT 100 · Published files · V2.0</span><h1>One source.<br>The complete set.</h1><p>The Encyclopedia is the master. The Guidebook, Simplified Structure and Marketing Slider are its dated derivatives. Direct downloads, no account required.</p></div>'
items=[(MASTER,'Encyclopedia V2.0','The single master volume: operational record and clinical analysis in one book.','encyclopedia-cover.png'),(GUIDE,'Guidebook V2.0','The condensed daily manual, generated from the Encyclopedia.','guidebook-cover.png'),('project-100-simplified-structure-v2-0-2026-10-03.pdf','Simplified Structure V2.0','Plain-language structure and source-linked operating records.','simplified-cover.png'),('project-100-marketing-slider-v2-0-2026-10-03.pdf','Marketing Slider V2.0','The visual walkthrough as a PDF deck, with the editable PowerPoint below.','marketing-cover.png'),('project-100-red-flag-checklist-v2-0-2026-10-03.pdf','Operator + Red-Flag Checklist','Annex II extracted directly from the Encyclopedia: one printable source page.','checklist-cover.png')]
for file,title,description,cover in items:
    p=ROOT/DOWNLOAD/file;count=len(fitz.open(p));size=p.stat().st_size/1024/1024
    library+=f'<article class="download-card"><img src="assets/img/v2/{cover}" alt="{escape(title)} source cover" loading="lazy"><div><span class="download-badge">V2.0 · {DATE} · LIVE</span><h2>{title}</h2><p>{description}</p><p class="file-info">PDF · {count} page{"s" if count!=1 else ""} · {size:.2f} MB</p><div class="v2-actions">'+button(DOWNLOAD+file,'Download PDF',True,True)
    if file==MASTER:library+=button('fit-protocol-archive.html','Read the Encyclopedia')
    if file==GUIDE:library+=button('guidebook.html','Run It Daily')
    if 'marketing-slider' in file:library+=button(DOWNLOAD+file.replace('.pdf','.pptx'),'Download editable PowerPoint',False,True)
    library+='</div></div></article>'
library+='<section class="v2-card" id="kindle"><span class="download-badge">KINDLE · COMING SOON</span><h2>Own the full manuscript.</h2><p>Everything on these pages is drawn from one book. The complete Project 100 Encyclopedia V2.0 is being converted into a standalone eBook for Amazon’s Kindle store. These on-site chapters stay free either way.</p><p>Follow '+button('https://www.instagram.com/fudge_fit/','@fudge_fit for release updates')+'.</p></section>'+doors()+'</main>'
page('library.html',library,'Download the PROJECT 100 Encyclopedia V2.0, Guidebook, Simplified Structure, Marketing Slider PDF/PowerPoint and source red-flag checklist.','library-page')

# Twelve-slide orientation: claims condense the master and point directly into its text.
slide_data=[
 ('cover','88.2 → 100 LBS OF MUSCLE.','introduction','Train like two. Eat for two. — not a double dose, a double commitment: sufficient food, sufficient recovery, no shortcuts.','gym-selfie-black-shirt.jpg'),
 ('return','The architecture of return.','introduction','A difficult personal period interrupted regular routines. A fresh start brought renewed attention to health and gym training during 2026. The February publication’s baseline and the current profile are separate dated records.','gym-selfie-backpack.jpg'),
 ('code','Durability is the method.','ch12','Measure honestly. Train repeatably. Eat with a record. Sleep. Let symptoms set the ceiling. A larger stack, longer session or bigger meal does not prove better adaptation.','gym-photo-rig-bench.jpg'),
 ('system','INTAKE × VECTOR × TIME.','ch4','Morning training and rest days are different branches. Clock times are reference anchors. Symptoms override the schedule.','gym-bench-closeup.jpg'),
 ('vectors','A recorded recipe. A defined branch.','part3-vectors','Training: V3, V1, V2, V4 and V10. Rest: V3 when consumed, V5 if consumed, and V10. PUMP is preserved strictly as inactive reference.',''),
 ('train','Repeatable loading. Honest recovery.','ch6','Supported rows, presses and machine work dominate where hardware locks require spinal protection. Free axial loading is progressed conservatively. Record setup, tempo and pain response.','gym-photo-turf-dumbbells.jpg'),
 ('fuel','Food is a record, not a rigid ceiling.','ch5','Known totals are partial label calculations, not a measured whole diet. The historical 2,780 kcal, 252 g protein and 69 g fat figures are legacy planning figures.','protein-wrap-trio.jpg'),
 ('supplements','Statuses do not drift.','ch8','Zinc Supreme removed. Separate copper paused. Boron locked at one 3 mg capsule. Lunch and afternoon grids are skipped on rest days. Optional Medi-C and rare Hey Relax remain optional.',''),
 ('rules','Symptoms govern the session.','ch3','Progressive weakness, bowel or bladder change, saddle numbness, jaundice, significant abdominal pain, fainting or chest symptoms require assessment. They are not training variables.','gym-photo-dumbbell-rack.jpg'),
 ('recap','Golden data recap.','annex1','One source of truth. One daily branch. No silent re-adds. Review the master dose record, the cascades and the laboratory disclosures together.',''),
 ('books','The book behind the system.','sources','Encyclopedia V2.0 is the single master volume. Read it free online or get the delivered PDF, Guidebook, Simplified Structure and editable Marketing Slider.',''),
 ('follow','One link. Every channel.','sources','Training sessions, food records and protocol updates belong to one documented project. Follow the lived record at @fudge_fit.','gym-photo-sled-harness.jpg'),
]
deck='<main class="wrap"><div class="v2-intro" id="top"><span class="v2-kicker">FIT PROTOCOL · Door 1 · Start Here</span><h1>The system.<br>One screen at a time.</h1><p>A five-minute orientation. Swipe, use the arrow keys, or tap Next. Every slide links to the exact source chapter.</p></div><div class="deck-toolbar"><button class="v2-button" id="slideBack" type="button">← Back</button><span id="slideCount" aria-live="polite">1 of 12</span><progress id="deckProgress" max="12" value="1" aria-label="Deck progress"></progress><button class="v2-button" id="slideNext" type="button">Next →</button></div><div class="deck-v2" id="v2Deck">'
for i,(id,title,anchor,text,img) in enumerate(slide_data):
    deck+=f'<section class="deck-slide" id="slide-{id}" data-source="fit-protocol-archive.html#{anchor}"><span class="v2-kicker">{i+1:02} / 12 · V2.0</span><h2>{escape(title)}</h2><p>{escape(text)}</p>'
    if img:deck+=f'<img class="deck-photo" src="assets/img/{img}" alt="{escape(title)} — Bogdan’s own training and meal documentation" loading="lazy">'
    if id=='cover':deck+='<div class="v2-stats"><div class="v2-stat"><strong>88.2 → 100 lb</strong><small>SMM baseline → target</small></div><div class="v2-stat"><strong>22.9% → &lt;15%</strong><small>Body fat baseline → target</small></div><div class="v2-stat"><strong>23.86 → 25.71</strong><small>Historical FFMI trajectory</small></div><div class="v2-stat"><strong>46</strong><small>Age in V2.0</small></div></div>'+note('BIA estimates muscle; fluid shifts can move the number. Targets are personal aspirations, not guarantees or deadlines.')
    if id=='system':deck+=table_html([clock[0]]+clock[1:4],'Encyclopedia Chapter 4 · selected anchors')
    if id=='vectors':deck+='<div class="v2-actions">'+button('guidebook.html#vectors','Read the vector cards')+'</div>'+note('Point-of-use formulas, five-lens notes and stop rules are in the Daily Guidebook and Encyclopedia Part III.')
    if id=='supplements':deck+=note('Part IV: piperine, cholinergic, ALA–IAS, osmotic and stimulant cascades. IGNITER about 373 mg caffeine before tea; training total about 413–443 mg versus 400 mg/day guidance.')
    if id=='recap':deck+=table_html([margins[0]]+margins[1:4],'Encyclopedia Part V · selected exposure margins')
    if id=='books':deck+='<div class="v2-actions">'+button('library.html','Get the Books',True)+button(DOWNLOAD+MASTER,'Download the master PDF',False,True)+'</div>'
    if id=='follow':deck+='<div class="v2-actions">'+button('https://www.instagram.com/fudge_fit/','Follow @fudge_fit',True)+'</div>'+doors()
    deck+='<p>'+link(anchor,'Read the full source chapter →')+'</p></section>'
deck+='</div><div class="deck-bottom">'+button('fit-protocol-archive.html#introduction','Read the full chapter')+button('library.html','Get the Books')+'<button class="v2-button" id="slideShare" type="button">Share this slide</button><span id="shareStatus" role="status"></span></div></main>'
deck=deck.replace('href="fit-protocol-archive.html#introduction">Read the full chapter','id="slideSource" href="fit-protocol-archive.html#introduction">Read the full chapter')
page('fit-protocol.html',deck,'Start Here: a twelve-slide introduction to Bogdan’s PROJECT 100 return, baseline, daily branches, training, fuel and the Encyclopedia V2.0.','deck-page',('fit-protocol-troubleshooting.html','fit-protocol-baseline.html'))

# Existing five-page Protocol loop remains; all four detail pages now use current source text.
details=[('fit-protocol-baseline.html','Baseline & Constraints',['introduction','ch1','ch2','ch3'],'fit-protocol.html','fit-protocol-fuel.html'),('fit-protocol-fuel.html','Timing & Fuel',['ch4','ch5','ch8','part3-vectors','part4-cascades','part5-margins'],'fit-protocol-baseline.html','fit-protocol-training.html'),('fit-protocol-training.html','Training & Progression',['ch6','ch9','ch10'],'fit-protocol-fuel.html','fit-protocol-troubleshooting.html'),('fit-protocol-troubleshooting.html','Troubleshooting & Reference',['ch7','ch11','part6-lab-integrity','annex2'],'fit-protocol-training.html','fit-protocol.html')]
old_anchors={'fit-protocol-fuel.html':{'s-clock':'ch4','s-vectors':'part3-vectors','s-fuel':'ch5','s-arsenal':'ch8'},'fit-protocol-baseline.html':{'s-origin':'introduction','s-metric':'ch1','s-patches':'ch3'},'fit-protocol-training.html':{'s-training':'ch6','s-roadmap':'ch9'},'fit-protocol-troubleshooting.html':{'s-fail':'ch7','s-qr':'annex2'}}
for file,title,ids,prev,nxt in details:
    body=f'<main class="wrap"><div class="v2-intro" id="top"><span class="v2-kicker">FIT PROTOCOL · V2.0</span><h1>{title}</h1><p>Current excerpts from the single master Encyclopedia. Open the complete reader for the full context.</p><div class="v2-actions">'+button('fit-protocol-archive.html','Read the Encyclopedia',True)+button('guidebook.html','Run It Daily')+'</div></div>'
    for id in ids:
        _,ct,cat,nums=next(c for c in CHAPTERS if c[0]==id)
        body+=f'<section class="book-chapter" id="{id}"><h2>{escape(ct)}</h2><div class="book-text">'+''.join(source_pages[n] for n in nums)+'</div><p class="chapter-source">'+link(id,'Read this chapter in the complete Encyclopedia')+'</p></section>'
    for a,target in old_anchors.get(file,{}).items():body+=f'<span class="v2-anchor" id="{a}" data-alias="{target}"></span>'
    # Preserve every legacy fragment, mapping it to the most relevant current source.
    old=BeautifulSoup(original(file),'html.parser')
    existing=set(ids)|{'top'}|set(old_anchors.get(file,{}))
    for e in old.select('[id]'):
        a=e['id']
        if a.startswith('s-') and a not in existing:
            body+=f'<span id="{a}" data-alias="{ids[0]}"></span>';existing.add(a)
    body+='</main><script>document.querySelectorAll("[data-alias]").forEach(function(e){if(location.hash==="#"+e.id)location.replace("#"+e.dataset.alias)});</script>'
    page(file,body,f'PROJECT 100 V2.0 {title.lower()}: current operational records and clinical notes sourced directly from the Encyclopedia.',arrows=(prev,nxt))

def retrofit(name):
    s=BeautifulSoup(original(name),'html.parser')
    s.select_one('header.site-head').replace_with(BeautifulSoup(header(name),'html.parser').select_one('header'))
    # Keep the same menu and existing menu runtime, updating only its destinations.
    s.select_one('#siteDrawer').replace_with(BeautifulSoup(header(name),'html.parser').select_one('#siteDrawer'))
    s.select_one('footer').replace_with(BeautifulSoup(footer(),'html.parser'))
    for el in s.select('title,meta[name="description"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"]'):el.decompose()
    s.head.append(BeautifulSoup(metadata(name,'Bogdan’s PROJECT 100 '+titles[name].lower()+': the lived record, current V2.0 source links and real training photography.'),'html.parser'))
    s.head.append(BeautifulSoup('<link rel="stylesheet" href="assets/css/v2.css?v=20261004">','html.parser'))
    s.body.append(BeautifulSoup('<script src="assets/js/v2.js?v=20261004" defer></script>','html.parser'))
    for runtime in s.select('script:not([src])'):
        if "var tab=document.getElementById('siteMenuTab')" in runtime.text:runtime.decompose()
    for img in s.select('img'):
        if not img.get('alt'):img['alt']='PROJECT 100 personal training documentation'
    return s

home=retrofit('index.html')
home.select_one('.hero .eyebrow').string='PROJECT 100 · Bogdan’s Muscle Mass Excavation'
home.select_one('.chips .chip').clear();home.select_one('.chips .chip').append(BeautifulSoup('<b>88.2 lbs</b> recorded SMM baseline','html.parser'))
home.select_one('.hero-ctas').clear();home.select_one('.hero-ctas').append(BeautifulSoup(button('fit-protocol.html','Start Here',True)+button('fit-protocol-archive.html','Read the Encyclopedia')+button('#explore','Explore the lived record'),'html.parser'))
home.select_one('.hero').insert_after(BeautifulSoup('<section class="v2-doors" id="doors"><div class="wrap"><span class="eyebrow">Three ways into Fit Protocol</span><h2>Start. Read. Run it daily.</h2>'+doors()+'</div></section>','html.parser'))
home.select_one('#mission .sec-head p').string='The personal goal is 100 lb of bioimpedance-estimated skeletal muscle mass below 15% body fat. Track comparable measurements, waist, performance and symptoms together. The target is an aspiration, not a guaranteed result or a biological ceiling.'
for sub,text in zip(home.select('#mission .stat-card .sub'),['+11.8 lb from the recorded baseline to the target','Personal body-fat aspiration','Historical planning trajectory; not a biological ceiling']):sub.string=text
anomaly=home.select_one('.anomaly');anomaly.clear();anomaly.append(BeautifulSoup(note('BIA estimates skeletal muscle from water-sensitive algorithms. Creatine, glycogen and electrolytes can move the estimate without new contractile tissue. '+link('ch1','Read the measurement rules')+'.'),'html.parser'))
home.select_one('#roadmap .sec-head p').string='The earlier three-phase roadmap is a planning illustration. V2.0 uses quarterly review, comparable measurements and symptom-guided progression; it does not promise a fixed growth rate or completion deadline.'
home.select_one('#roadmap .field-note p').string='LOAD FOLLOWS TOLERANCE. A rigid +2.5 lb every three weeks is not a current V2.0 prescription. If pain changes form or neurological signs appear, stop and assess.'
phases=home.select('#roadmap .phase')
for phase,title,text in zip(phases,['Rebuild the routine','Repeat the loading signal','Review and adjust'],['Regular training, sleep and repeatable setups come first.','Supported work and recovery guide progression; no automatic load escalation.','Compare body composition, waist and function under consistent conditions.']):
    phase.select_one('h3').string=title;phase.select_one('p').string=text
    phase.select_one('.foot').clear();phase.select_one('.foot').string='Historical planning phase · '+title
home.select_one('#roadmap h2').string='The long-term excavation.'
home.select_one('#explore h2').string='Explore PROJECT 100.'
for a in home.select('.faq-a'):
    t=a.get_text()
    if 'linear progression' in t:a.clear();a.append(BeautifulSoup('<p>A documented personal comeback at 46: the goal is 100 lb of bioimpedance-estimated skeletal muscle below 15% body fat. The Encyclopedia V2.0 is the master record, with no guaranteed timeline.</p>','html.parser'))
    if 'thirteen chapters' in t:a.clear();a.append(BeautifulSoup('<p>Fit Protocol is the system behind the lived record: the Start Here deck, the complete Encyclopedia with 12 chapters and Parts III–VI, and the Daily Guidebook.</p>','html.parser'))
for summary in home.select('.faq-item summary'):
    if 'PROJ3K' in summary.text:summary.string='What is PROJECT 100?'
home.select_one('#story .origin-copy>p').string='The journey began in 2010. A difficult personal period later interrupted regular routines. A fresh start brought renewed attention to health, training and recovery in 2026. Earlier dated baselines remain part of the documented journey.'
home.select_one('#story').append(BeautifulSoup('<div class="wrap v2-provenance">Formerly published as PROJ3K_100. '+link('introduction','Read the current chronology and evidence limits')+'.</div>','html.parser'))
write('index.html',str(home))

work=retrofit('fit-workout.html')
work.select_one('.focus-point p').clear();work.select_one('.focus-point p').append(BeautifulSoup('Morning training and rest are separate branches. The master clock uses reference anchors, with supported loading governed by symptoms. '+link('ch4','Read the Master Chronometer')+' · '+link('ch6','Read the training source')+'.','html.parser'))
for f in work.select('.filter'):
    f.name='button';f['type']='button';f['aria-pressed']='true' if 'active' in f.get('class',[]) else 'false'
for sc in work.select('script:not([src])'):
    if 'function renderLog' in sc.text:
        js=sc.text
        js=js.replace("renderLog('all');", "const logParams = new URLSearchParams(location.search);\nconst initialCategory = Object.hasOwn(CAT_LABEL, logParams.get('cat')) ? logParams.get('cat') : 'all';\nrenderLog(initialCategory);\ndocument.querySelectorAll('.filter').forEach(f=>{f.classList.toggle('active',f.dataset.filter===initialCategory);f.setAttribute('aria-pressed',String(f.dataset.filter===initialCategory));});")
        js=js.replace("f.classList.add('active');", "f.classList.add('active');\n    document.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed',String(x===f)));\n    const url=new URL(location.href);if(f.dataset.filter==='all')url.searchParams.delete('cat');else url.searchParams.set('cat',f.dataset.filter);history.pushState(null,'',url);")
        js=js.replace('card.dataset.logDate = d.date;',"card.dataset.logDate = d.date; card.dataset.category='Training';")
        js=js.replace('const mediaEl = card.querySelector(\'.log-media\');',"const mediaEl = card.querySelector('.log-media');\n      mediaEl.tabIndex=0;mediaEl.setAttribute('role','button');mediaEl.setAttribute('aria-label','Play '+d.title);mediaEl.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();mediaEl.click()}});")
        js=js.replace('<div class="stats"><span>♥ ${d.likes}', '<p class="recipe-record">Symptom-guided loading · Encyclopedia Ch. 3 &amp; 6</p><div class="stats"><span>♥ ${d.likes}')
        js+='\naddEventListener("popstate",()=>{const cat=new URLSearchParams(location.search).get("cat")||"all";renderLog(Object.hasOwn(CAT_LABEL,cat)?cat:"all");document.querySelectorAll(".filter").forEach(f=>{f.classList.toggle("active",f.dataset.filter===cat);f.setAttribute("aria-pressed",String(f.dataset.filter===cat))})});'
        sc.string=js
work.select_one('#log').insert_after(BeautifulSoup('<section class="wrap">'+clinical('Progressive mechanical tension with adequate recovery.','Stimulant vectors can mask fatigue; sleep and joint response govern the next session.','Volume landmarks are individual; no fixed template is endorsed for every reader.','Record load, RPE, setup, pain and recovery.','Stop for progressive weakness, new numbness or bowel/bladder change.','Chapters 3, 6 · Annex II',True)+'</section>','html.parser'))
write('fit-workout.html',str(work))

food=retrofit('fit-nutrition.html')
food.select_one('.placeholder-hero').insert_after(BeautifulSoup('<section class="wrap">'+note('Train like two. Eat for two. — not a double dose, a double commitment. The historical 252 g protein and 69 g fat figures are legacy planning values; whole-diet verification remains deferred. '+link('ch5','Read the V2.0 nutrition record')+'.')+'</section>','html.parser'))
for card in food.select('.log-card'):
    card['data-category']='Fuel'
    body=card.select_one('.log-body')
    if body:body.append(BeautifulSoup('<p class="recipe-record">Meal from the lived record</p>','html.parser'))
food.select_one('#connect').insert_before(BeautifulSoup('<section class="wrap" id="clinical-nutrition"><h2>Nutrition · source notes</h2>'+clinical('Protein, adequate energy and meal tolerance support repeatable training.','Fat boluses, supplemental magnesium and vitamin C compound GI tolerance in the recorded no-gallbladder context.','Known totals are partial labels. Training supplemental Mg baseline 341 mg; options may increase it to 646 mg versus 350 mg/day supplemental UL.','Record stool, abdominal pain and the optional items actually taken.','Recurrent watery stools with weight loss, oily stools or significant abdominal pain require assessment.','Chapter 5 · Parts IV–V · Annex II',True)+table_html(tables(master[8])[0]['rows'],'Encyclopedia Chapter 5 · preserved legacy modules')+'</section>','html.parser'))
for a in food.select('a[href="fit-protocol-fuel.html"]'):a['href']='fit-protocol-archive.html#part3-vectors'
write('fit-nutrition.html',str(food))

gear=retrofit('gear-shop.html')
g=gear.select_one('#guide');g.clear();g.append(BeautifulSoup('<div class="wrap"><h2>The complete books, in one place.</h2><p>Read the master Encyclopedia or get its dated derivatives. On-site chapters stay free either way.</p><div class="v2-actions">'+button('library.html','Get the Books',True)+button('fit-protocol-archive.html','Read the Encyclopedia')+'</div><span id="encyclopedia"></span></div>','html.parser'))
gear.select_one('#connect').insert_before(BeautifulSoup('<section class="wrap" id="gear-source"><h2>The system behind the hardware</h2>'+note('Band resistance changes with extension. Supported setups and symptom response matter; no piece of hardware guarantees zero spinal load. '+link('ch6','Read the current loading logic')+'.')+clinical('Repeatable supported loading and controlled ranges.','Spine, nerve, shoulder and elbow constraints govern exercise selection before ambition.','Manufacturer ratings are not a guarantee for a home rig; inspect the entire anchor-to-user chain.','Record setup, range, pain response and changes in hand strength.','Progressive weakness, new numbness or bowel/bladder changes stop the session and require assessment.','Chapters 3, 6 · Annex II',True)+'</section>','html.parser'))
for item in gear.select('.gear-item'):
    item['data-category']='Reference'
write('gear-shop.html',str(gear))

def redirect(file,target,mapping=None):
    m=json.dumps(mapping or {})
    write(file,f'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PROJECT 100 — Page moved</title><link rel="canonical" href="https://project100.fit/{target}"><meta http-equiv="refresh" content="0;url={target}"></head><body><p>This page has moved. <a href="{target}">Read PROJECT 100</a>.</p><script>const map={m};const id=location.hash.slice(1);location.replace({json.dumps(target)}+location.search+(id?"#"+(map[id]||id):""));</script></body></html>')
legacy={'origins':'introduction','preface':'how-to-read','ch5':'ch8','ch6':'ch5','ch7':'part3-vectors','ch8':'ch6','ch10':'ch7','ch11':'annex1','ch12':'ch8','quickref':'annex1','note':'sources'}
for name in ['encyclopedia-guidebook.html','encyclopedia.html','encyclopedia-archive.html']:redirect(name,'fit-protocol-archive.html',legacy)

# Redirect URLs remain explicit files because GitHub Pages cannot emit host-level 301s.
urls=list(titles)
write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>https://project100.fit/{"" if x=="index.html" else x}</loc><lastmod>{DATE}</lastmod></url>' for x in urls)+'</urlset>')
write('robots.txt','User-agent: *\nAllow: /\nSitemap: https://project100.fit/sitemap.xml\n')
for name in ['index.html','fit-protocol-archive.html','library.html']:
    schema={'@context':'https://schema.org','@type':'WebSite' if name=='index.html' else 'Book','name':'PROJECT 100' if name=='index.html' else 'Project 100 Encyclopedia V2.0','url':'https://project100.fit/'+('' if name=='index.html' else name),'author':{'@type':'Person','name':'Bogdan Dospi','sameAs':['https://www.instagram.com/fudge_fit/']}}
    text=(ROOT/name).read_text();write(name,text.replace('</head>','<script type="application/ld+json">'+json.dumps(schema)+'</script></head>'))
    if name=='index.html':
        home_schema=BeautifulSoup((ROOT/name).read_text(),'html.parser')
        questions=[{'@type':'Question','name':d.select_one('summary').get_text(' ',strip=True),'acceptedAnswer':{'@type':'Answer','text':d.select_one('.faq-a').get_text(' ',strip=True)}} for d in home_schema.select('.faq-item')]
        faq=home_schema.new_tag('script',type='application/ld+json');faq.string=json.dumps({'@context':'https://schema.org','@type':'FAQPage','mainEntity':questions});home_schema.head.append(faq);write(name,str(home_schema))
write('CONTENT_GOVERNANCE.md','''# PROJECT 100 V2.0 website release

The Encyclopedia V2.0 dated 2026-10-03 is the only reading master. Public editions incorporate the author's requested privacy edits to personal background, using a neutral description of a difficult personal period and rebuilding routines. Operational records, doses and measured baselines are unchanged. The website preserves the public master's text and derives the daily clock and vector formulas directly from its tables. Its 26 physical PDF pages differ from the page references printed in its inherited contents; website source links use physical PDF pages.

Author instructions override the build brief: keep the repaired design, top menus and PROJECT_100 / FIT PROTOCOL switch. Do not restore the dedicated appliance content. Preserve both page navigation loops. Encyclopedia access floats at the lower right, outside navigation; the Daily Guidebook is a distinct page.

Legacy 252 g protein / 69 g fat values are planning figures, not hard caps. Fixed roadmap gains and guaranteed tissue growth are retired claims. The master groups 23 audited records; it does not itemize every product and dose, so absent pill values and social-meal codes are not invented. The standalone Full Detailed and Clinical Analysis PDFs are superseded and are not offered as current downloads.

Available downloads: Encyclopedia, Guidebook, Simplified Structure, Marketing Slider PDF/PPTX and the exact Annex II one-page extract. A separate Slide Deck file was not supplied; Marketing Slider is the delivered visual deck. Kindle is coming soon. No email signup is shown because no double-opt-in service is configured. Privacy analytics emit local custom events only; no third-party collection is claimed. Contact/press and live email automation remain Phase 2.

Legacy redirects use static HTML plus JavaScript (including queries and remapped hashes), because GitHub Pages does not support custom host-level 301 redirects. All old protocol section anchors are retained as aliases. Historical changelog entries remain explicitly superseded.

Verify with `python scripts/audit_site.py`, `node --check assets/js/v2.js`, source-text equality checks in `scripts/build_v2.py`, and responsive browser tests before publishing.
''')
import runpy
runpy.run_path(str(ROOT / 'scripts/apply_october_assets.py'))
runpy.run_path(str(ROOT / 'scripts/apply_filing_navigation.py'))
runpy.run_path(str(ROOT / 'scripts/apply_encyclopedia_design.py'))
runpy.run_path(str(ROOT / 'scripts/apply_reading_layout.py'))
runpy.run_path(str(ROOT / 'scripts/apply_vector_studio.py'))
runpy.run_path(str(ROOT / 'scripts/apply_editorial_sections.py'))
runpy.run_path(str(ROOT / 'scripts/apply_vector_folders.py'))
runpy.run_path(str(ROOT / 'scripts/apply_quiet_motion.py'))
runpy.run_path(str(ROOT / 'scripts/apply_carousel_repairs.py'))
runpy.run_path(str(ROOT / 'scripts/apply_release_fixes.py'))
runpy.run_path(str(ROOT / 'scripts/apply_focused_protocol.py'))
runpy.run_path(str(ROOT / 'scripts/apply_focused_main.py'))
runpy.run_path(str(ROOT / 'scripts/apply_gear_database.py'))
runpy.run_path(str(ROOT / 'scripts/apply_vector_registry.py'))
runpy.run_path(str(ROOT / 'scripts/apply_polished_shell.py'))
print(f'Built {len(titles)} current pages. Verified complete source words on {len(master)} Encyclopedia + {len(guide)} Guidebook PDF pages.')
