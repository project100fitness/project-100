"""Author-requested page loops, inline liquid files and compact gallery geometry."""
from pathlib import Path
from copy import deepcopy
import json
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
records={v['id']:v for v in json.loads((ROOT/'assets/data/vector-registry.json').read_text())['vectors']}
hub=BeautifulSoup((ROOT/'fit-protocol-vectors.html').read_text(),'html.parser')
cabinet=hub.select_one('.vector-cabinet,.liquid-cabinet')
studio=hub.new_tag('div',attrs={'class':'vector-studio liquid-cabinet','aria-label':'Liquid intake folders; open and close on this page'})
colors={}
for key in ['v3','v1','v2','v4','v5','v10','v6']:
 p=ROOT/f'fit-protocol-vector-{key}.html';doc=BeautifulSoup(p.read_text(),'html.parser')
 folder=doc.select_one('.vector-stack-file');color=folder['style'].split('--vector-accent:')[1].split(';')[0];colors[key]=color
 doc.body['style']='--vector-accent:'+color
 for tab in doc.select('.page-tabs a'):
  if tab.get('href')==p.name:tab['style']='--folder-accent:'+color
 for source in folder.select('.stack-source'):source.decompose()
 source=doc.new_tag('a',href='fit-protocol-vector-reference.html',attrs={'class':'stack-source'});source.string='Read the source vector notes →';folder.select_one('.folder-formula').append(source)
 copy=deepcopy(folder);copy.attrs.pop('open',None);copy['name']='liquid-intake';copy['id']='vector-'+key
 copy.select_one('.stack-source')['href']=p.name
 copy.select_one('.stack-source').string='Full vector details →'
 copy.summary.select_one('.stack-label').string=records[key]['name']
 copy.summary.select_one('.stack-hint').string=records[key]['deployment']
 copy.summary.select_one('.stack-open').string='Open / close ingredients and protocol'
 studio.append(copy);p.write_text(str(doc))
cabinet.replace_with(studio)
hub.h1.string='Liquid Intake'
hub.select_one('.compact-page-identity p').string='Open a folder here to read its ingredients and protocol. Close it in place, or follow the full details link at the end.'
(ROOT/'fit-protocol-vectors.html').write_text(str(hub))
for p in ROOT.glob('*.html'):
 doc=BeautifulSoup(p.read_text(),'html.parser')
 if not doc.select_one('.page-shell'):continue
 tabs=doc.select('.site-head > .page-tabs:not(.focused-subtabs) .wrap a')
 if tabs:
  current=next((i for i,t in enumerate(tabs) if 'current' in t.get('class',[])),0)
  for cls,delta in [('prev',-1),('next',1)]:
   target=tabs[(current+delta)%len(tabs)]
   arrow=doc.select_one('.page-nav-arrow.'+cls)
   if arrow:arrow['href']=target['href'].split('#')[0];arrow['aria-label']=('Previous' if delta<0 else 'Next')+' page: '+target.get_text(' ',strip=True)
 for a in doc.select('a[href="fit-protocol-vectors.html"]'):
  if not a.select('img'):a.string='Liquid Intake'
 for a in doc.select('.focused-subtabs a[href*="fit-protocol-vector-v"]'):
  key=a['href'].removeprefix('fit-protocol-vector-').removesuffix('.html')
  if key in colors:a['style']='--folder-accent:'+colors[key]
 for tag in doc.select('link[href^="assets/css/"],script[src^="assets/js/"]'):
  attr='href' if tag.name=='link' else 'src';tag[attr]=tag[attr].split('?')[0]+'?v=20261005-liquid'
 for attr,value in [('rel','stylesheet')]:
  if not doc.select_one('link[href*="vector-studio.css"]'):doc.head.append(doc.new_tag('link',rel=value,href='assets/css/vector-studio.css?v=20261005-liquid'))
 if doc.select_one('.liquid-cabinet') and not doc.select_one('script[src*="vector-studio.js"]'):doc.head.append(doc.new_tag('script',src='assets/js/vector-studio.js?v=20261005-liquid',defer=''))
 p.write_text(str(doc))
print('Applied category page loops, inline liquid folders and synchronized accents.')

# The old unnumbered URL always remains a bookmark-compatible redirect.
(ROOT/'fit-protocol-vector-pump.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>V6 PUMP — PROJECT 100</title><link rel="canonical" href="https://project100.fit/fit-protocol-vector-v6.html"><meta http-equiv="refresh" content="0; url=fit-protocol-vector-v6.html"></head><body><a href="fit-protocol-vector-v6.html">Continue to V6 PUMP</a><script>location.replace("fit-protocol-vector-v6.html"+location.search+(location.hash==="#vector-pump"?"#vector-v6":location.hash))</script></body></html>')
