"""Use supplied illustration layers with readable live labels; retain current site shell."""
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
def load(f):return BeautifulSoup((ROOT/f).read_text(),'html.parser')
def save(f,s):(ROOT/f).write_text(str(s))
def fragment(s):return BeautifulSoup(s,'html.parser')
BOOKS={'project-100-encyclopedia-v3-2-2026-10-06.pdf','project-100-guidebook-v3-3-2026-10-06.pdf'}
for p in ROOT.glob('*.html'):
 s=load(p.name);changed=False
 for ul in s.select('.home-downloads'):
  for li in list(ul.find_all('li',recursive=False)):
   links=li.select('a[download]')
   if links and not any(a.get('href','').split('/')[-1] in BOOKS for a in links):li.decompose();changed=True
 if p.name=='library.html':
  for selector in ['#kindle','.home-doors','#vector-registry-release']:
   for e in s.select(selector):e.decompose()
  for a in s.select('.home-downloads a:not([download])'):a.decompose()
  changed=True
 if changed:save(p.name,s)
# Artwork is deliberately presented as a schematic, not evidence of a scan or supplement effect.
PLATES={
'biometrics.html':('biometric-illustration','Body composition record', '''<div class="schematic-body"><div class="schematic-anatomy" role="img" aria-label="Schematic anatomy illustration labelled muscle, nerves, joints, bone, organs, water and tissue; not a portrait or body scan"><span style="--x:16.5%;--y:22%">Muscle</span><span style="--x:16.5%;--y:47%">Joints</span><span style="--x:16.5%;--y:71%">Tissue</span><span style="--x:83%;--y:22%">Nerves</span><span style="--x:83%;--y:42%">Organs</span><span style="--x:83%;--y:61%">Bone</span><span style="--x:83%;--y:80%">Water</span></div><div class="schematic-readout"><span class="eyebrow">14 December 2025 · recorded benchmark</span><dl><div><dt>Skeletal muscle estimate</dt><dd>88.2 <small>lb</small></dd></div><div><dt>Body weight</dt><dd>197.1 <small>lb</small></dd></div><div><dt>Body fat estimate</dt><dd>22.9 <small>%</small></dd></div></dl><p>October weight: <strong>200.1 lb</strong>. Muscle mass is carried forward, not a new scan.</p></div></div><p class="schematic-caption">Illustration only. Measurement dates and source status are listed below.</p>'''),
'mineral-chemistry.html':('mineral-illustration','Magnesium · baseline and options', '''<div class="schematic-minerals"><div class="schematic-console"><div class="schematic-console-label"><span>Training base</span><strong>341 mg</strong><span>Rest base · when V5 is consumed</span><strong>100 mg</strong></div></div><div class="schematic-formula"><span class="eyebrow">Recorded supplemental magnesium · training scenario</span><p class="schematic-equation">240 + 1 + 100 = <strong>341 mg</strong></p><p>Glycinate + EAA + RapiDrem</p><dl class="schematic-options"><div><dt>+ Medi-C half serving</dt><dd>446 mg</dd></div><div><dt>+ Hey Relax</dt><dd>541 mg</dd></div><div><dt>+ both options</dt><dd>646 mg</dd></div></dl></div></div><p class="schematic-caption">Conditional sums, not prescribed doses. Rest-day base: 100 mg when V5 is consumed. Food magnesium is outside this supplemental account.</p>'''),
'liquid-intake.html':('liquid-schematic','The intake sequence', '''<div class="schematic-sequence"><div><span class="schematic-step">01 · Morning</span><div class="schematic-science schematic-science--protein" role="img" aria-label="Protein and connective-tissue illustration"></div><h3>V3 · Recovery</h3><p>Protein, collagen and the recorded morning ingredients.</p></div><div><span class="schematic-step">02 · Before training</span><div class="schematic-science schematic-science--nerve" role="img" aria-label="Nervous-system schematic"></div><h3>V1 or V6</h3><p>Morning Ignition or evening Pump. Choose one training branch.</p></div><div><span class="schematic-step">03 · Training & night</span><div class="schematic-science schematic-science--night" role="img" aria-label="Thermos and evening-drink illustration"></div><h3>Refuel → Reload → Night</h3><p>V2 during training, V4 after. V10 uses an insulated thermos.</p></div></div><p class="schematic-caption">Schematic illustrations describe the sequence, not proven biological outcomes. Rest-day V5 stays in its own folder.</p>''')}
for name,(id,title,body) in PLATES.items():
 s=load(name)
 for old in s.select('#'+id):old.decompose()
 section=fragment(f'<section class="section schematic-section" id="{id}" aria-label="{title}"><h2>{title}</h2>{body}</section>')
 if name=='biometrics.html':s.select_one('#timeline').insert_before(section)
 elif name=='mineral-chemistry.html':s.select_one('#accounting').insert_before(section)
 else:s.select_one('#liquid-overview').insert_before(section)
 if not s.select_one('link[href^="assets/css/schematic-sections.css"]'):
  s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/schematic-sections.css?v=20261007'))
 save(name,s)
print('Downloads: two final books. New illustrated sections: Biometrics, Mineral Chemistry, Liquid Intake.')
