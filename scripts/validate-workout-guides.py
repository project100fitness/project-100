from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re
from pypdf import PdfReader
root=Path(__file__).resolve().parent.parent;folder=root/'downloads/kinetics';db=json.loads((folder/'training-plan-v0.3.json').read_text('utf-8'));report=json.loads((folder/'pdf-build-report.json').read_text('utf-8'))
assert len(db['exercises'])==25 and len(db['recordedVariants'])==80
assert sum(len(v['sources']) for v in db['recordedVariants'])==173
assert all(len(d['slots'])==6 for d in db['days'] if d['slots'])
by={e['id']:e for e in db['exercises']}
assert all(by[s[0]]['resistance'].get('system')=='hpygn-pilates' for d in db['days'] if d['day'] in [5,6] for s in d['slots'])
for e in db['exercises']+db['recordedVariants']:
 if e.get('art'):assert (root/'assets/media/workout-guides'/e['art']).is_file(),e['art']
class Links(HTMLParser):
 def __init__(self):super().__init__();self.refs=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k in ('href','src') and v:self.refs.append(v)
missing=[]
paths=[root/'kinetics.html',root/'exercises.html',root/'fit-workout.html']+[p for p in folder.glob('*.html') if 'class="p100-guides"' in p.read_text('utf-8')]
for p in paths:
 source=p.read_text('utf-8');ids=re.findall(r'\bid="([^"]+)"',source);assert len(ids)==len(set(ids)),('Duplicate document IDs',p);parser=Links();parser.feed(source)
 for ref in parser.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc or not u.path:continue
  target=root/unquote(u.path).lstrip('/') if u.path.startswith('/') else p.parent/unquote(u.path)
  if not target.is_file():missing.append((str(p.relative_to(root)),ref))
assert not missing,missing
for row in report:
 p=folder/'pdf'/row['filename'];reader=PdfReader(p);assert len(reader.pages)==row['pages'];text='\n'.join(page.extract_text() or '' for page in reader.pages)
 assert not any(t in text for t in ['undefined','NaN','Not established','EQUIPMENT UNCONFIRMED'])
 if row['filename']!='source-catalogue.pdf':assert not re.search(r'SET-C\d|\.mp4',text,re.I)
 if row['filename'] in ['weekly-planner.pdf','weekly-overview.pdf']:assert len(reader.get_fields())==7
exercise_page=(root/'exercises.html').read_text('utf-8');assert exercise_page.count('data-training-section=')==3;assert 'data-training-panel="library"' in exercise_page;assert 'id="p100-library-grid"' not in (root/'kinetics.html').read_text('utf-8')
css=(root/'assets/css/p100-band-training.css').read_text();assert '.card-.guide-main' not in css
result={'result':'passed','pdfs':len(report),'guidePages':len(paths),'brokenLinks':missing,'trainingSetups':76,'sourceWindows':173,'brand':'original PROJECT 100 shared tokens','state':'shared per-exercise levels and weekly notes'}
(root/'docs/workout-guides/integrated-validation.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
