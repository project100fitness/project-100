"""Visible related files: desktop vertical rail, mobile grid, wrapping primary tabs."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
for path in ROOT.glob('*.html'):
 doc=BeautifulSoup(path.read_text(),'html.parser');shell=doc.select_one('.page-shell')
 if not shell:continue
 # Category entry starts at the first related page; explicit lab links stay intact.
 for link in doc.select('.site-head > .page-tabs:not(.focused-subtabs) a,#siteDrawer a,.focused-cabinet > a,.page-nav-arrow'):
  if link.get('href')!='fit-protocol-labs.html':continue
  text=link.get_text(' ',strip=True)
  if text=='Monitoring' or ' Monitoring Open file' in text or link.get('aria-label','').endswith('page: Monitoring'):
   link['href']='fit-protocol-monitoring.html'
 related=doc.select_one('.site-head .focused-subtabs')
 if related:
  layout=doc.new_tag('div',attrs={'class':'folder-page-layout'})
  content=doc.new_tag('div',attrs={'class':'folder-page-content'})
  rail=doc.new_tag('aside',attrs={'class':'folder-page-rail'})
  title=doc.new_tag('p',attrs={'class':'folder-rail-title'});title.string='Related pages';rail.append(title)
  related.extract();rail.append(related)
  layout.append(rail);layout.append(content)
  header=shell.select_one('.site-head');header.insert_after(layout)
  # Keep the publications footer and page scripts outside the content rail.
  for node in list(layout.next_siblings):
   if not getattr(node,'name',None):continue
   if node.name in ['footer','script'] or 'publication-bar' in node.get('class',[]):continue
   content.append(node.extract())
 for old in doc.select('link[href*="visible-folders.css"]'):old.decompose()
 doc.head.append(doc.new_tag('link',rel='stylesheet',href='assets/css/visible-folders.css?v=20261005-folders'))
 for old in doc.select('script[src*="visible-folders.js"]'):old.decompose()
 doc.head.append(doc.new_tag('script',src='assets/js/visible-folders.js?v=20261005-folders',defer=''))
 path.write_text(str(doc))
print('Visible folder navigation applied across both sites.')
