"""Idempotent October 6 content overlay; preserve the approved folder shell."""
from pathlib import Path
from bs4 import BeautifulSoup
import json, copy, html
ROOT=Path(__file__).resolve().parents[1]
def soup(s): return BeautifulSoup(s,'html.parser')
def fragment(s): return soup(s)
def load(name): return soup((ROOT/name).read_text())
def save(name,s): (ROOT/name).write_text(str(s))
def section(id,title,body): return f'<section class="addon-section" id="{id}"><h2>{title}</h2>{body}</section>'
def cards(items): return '<div class="addon-grid">'+''.join(f'<article class="addon-card"><h3>{html.escape(a)}</h3><p>{b}</p></article>' for a,b in items)+'</div>'
def note(s): return '<div class="v2-note page-description">'+s+'</div>'
PILLS=[
 ('Wake','4 regular capsules · 1 intermittent','TESTOFX: 3 capsules. New Roots boron: 1 capsule / 3 mg. LactoBif 100: 1 capsule, intermittent.'),
 ('Meal 1','5 capsules','Kyolic 104: 2. NAC: 1 / 900 mg. NMN: 1 / 175 mg. Digestive Enzymes Ultra: 1 with the meal.'),
 ('Pre-workout','1 capsule','AOR Xerenoos citicoline: 1 / 250 mg, separate from V1 or V6.'),
 ('Lunch / DMZ','8 regular units · up to 2 conditional','PureGenomics: 1. Omega 800: 1 softgel. UriCare: 2. KITABIO pumpkin seed / saw palmetto: 3 softgels. Curcumin: 1. Conditional: CanPrev calcium 1 / 200 mg; Liver GI 1.'),
 ('Afternoon cofactors','5 capsules','Higher Health beef liver: 3 / 1.5 g. Ligament Restore: 2. Meal-time enzymes are counted with their meal.'),
 ('Night','3 regular capsules · 1 conditional','Pure magnesium glycinate: 2 / 240 mg elemental magnesium. Tart cherry: 1 / 500 mg. Milk thistle: 1 only when selected; dose not supplied.')]
VECTOR_DATA={
 'v3':('V3 RECOVERY','Morning protein','Carnivor: 1 Canadian scoop / 33.9 g (23 g protein; no added creatine). PROMISE marine collagen 10 g. Rootalive black maca 5 g. ALLMAX L-carnitine 15 mL / 1,500 mg. Water. Separate: one gummy and NAKA Mint Vital Greens 20 mL.'),
 'v1':('V1 IGNITION','Morning training only','ALLMAX Impact Igniter Xtreme 2.0: 2 scoops / 28 g. ALLMAX MuscleEAA: 1 scoop / 17.73 g. ALLMAX PeakO2 2,000 mg. NOW betaine 2,500 mg. Citrulline malate 2:1: 4–6 g. Taurine: 2–3 g. Cold filtered water: 500–600 mL. Citicoline 250 mg is a separate capsule.'),
 'v6':('V6 PUMP','Evening training; replaces V1','ALLMAX PUMP Xtreme: 2 scoops / 31 g. ALLMAX MuscleEAA: 1 scoop / 17.73 g. ALLMAX PeakO2 2,000 mg. NOW betaine 2,500 mg. Citrulline malate 2:1: 4–6 g. Taurine: 2–3 g. Cold filtered water: 500–600 mL. No added caffeine, creatine or pink salt; total sodium is not established as zero. Citicoline 250 mg is separate.'),
 'v2':('V2 REFUEL','During training','BCAA Hyper Clear: 1 scoop / 7.5 g BCAA, 2:1:1. RapiDrem: 1 scoop, approximately 6.5 g. Kirkland Himalayan pink salt: 1/16 tsp. Water: 600–750 mL. Two or three Medjool dates are separate food.'),
 'v4':('V4 RELOAD','After training','BioSteel Recovery Protein Plus: 1 scoop / 36 g, half the listed full serving. Rootalive beetroot 7 g. Proline Nutrition creatine HCl 750 mg. Kirkland Himalayan pink salt: 1/16 tsp. Room-temperature water: 350–450 mL. AOR R-lipoic acid: one whole 300 mg capsule, separate before the drink.'),
 'v5':('V5 TRANSPORT','Rest day, when consumed','Proline Nutrition creatine HCl 750 mg. PROMISE marine collagen 10 g. ALLMAX L-carnitine 15 mL / 1,500 mg. RapiDrem: 1 scoop. Kirkland Himalayan pink salt: 1/16 tsp. Cold water: 500 mL.'),
 'v10':('V10 SHUTDOWN','Night','SD Pharmaceuticals Natural Series creatine HCl 750 mg. North Coast Naturals glutamine 5 g. AOR glycine 3–5 g. Traditional Medicinals hibiscus tisane: 800 mL, at a comfortable drinking temperature, in an insulated thermos. Optional: Medi-C 2.5 g; Hey Relax is a rare add-on. Confirm the current Medi-C formulation before using its label totals.')}
MINERALS=[
 ('Magnesium','341 mg training · 100 mg rest','Known supplemental base: 240 mg glycinate + 1 mg EAA + 100 mg RapiDrem on training days; RapiDrem alone on the recorded rest branch. Medi-C half serving adds 105 mg: training 446 mg / rest 205 mg. Hey Relax adds 200 mg: 541 / 300 mg; both add-ons 646 / 405 mg. Adult supplemental/medication UL: 350 mg; food magnesium is excluded from that UL.'),
 ('Calcium','1,536.5 mg training scenario · 1,216 mg rest','Includes 945 mL Silk at the recorded 1,134 mg calcium. Training supplements 402.5 mg include the conditional 200 mg CanPrev tablet; rest RapiDrem adds 82 mg. Without that tablet, subtract 200 mg from the training scenario. Other food is not counted. Total-intake UL: 2,500 mg at ages 19–50; 2,000 mg at 51+.'),
 ('Zinc','28.78 mg training · 3.78 mg rest','Training: 25 mg multivitamin + 3.78 mg recorded Silk contribution. Rest skips the multivitamin. Other food is excluded. Adult total-intake UL: 40 mg.'),
 ('Potassium','1,000 mg per RapiDrem scoop','Applies when V2 or V5 is consumed. Other food and beverages are excluded. No established general UL does not imply unlimited supplemental intake.'),
 ('Sodium','233 mg training · 59 mg rest, partial','Training: two 1/16 tsp salt portions at 59 mg each + 115 mg BioSteel. Rest: one salt portion. Igniter and other formula sodium are not included, so these are not daily totals. Recheck the current RapiDrem label before reconciling its ingredient and nutrition declarations.'),
 ('Vitamin C','452.9 mg training scenario · 150 mg rest scenario','Assumes the listed products are consumed, including conditional Liver GI and meal enzymes. Medi-C half serving adds 1,000 mg: 1,452.9 / 1,150 mg. Full serving adds 2,000 mg: training 2,452.9 mg. Adult total-intake UL: 2,000 mg. Other food is excluded.'),
 ('Biotin','425 mcg training','300 mcg multivitamin + 125 mcg EAA. Neither is included in the recorded rest branch; a complete rest-day total is not established. Tell the testing clinician about biotin; assay-specific instructions take priority over a fixed hold time.'),
 ('Boron','4 mg training · 3 mg rest','Training: 3 mg standalone capsule + 1 mg multivitamin. Rest: standalone capsule only. Adult total-intake UL: 20 mg.'),
 ('Creatine HCl','1,500 mg when both recorded drinks are consumed','Training: Proline 750 mg in V4 + SD Pharmaceuticals 750 mg in V10. Rest: Proline 750 mg in V5 + SD Pharmaceuticals 750 mg in V10. The Canadian Carnivor serving records no added creatine. Share creatine use with the clinician interpreting kidney markers.'),
 ('Caffeine','Approximately 413–443 mg, morning branch','Recorded Igniter estimate: approximately 373 mg + tea estimate 40–70 mg. Other sources are excluded. Health Canada guidance for adults: 400 mg/day. Evening V6 has no added caffeine; tea still counts.'),
 ('Piperine','14.5 mg training · 9.5 mg rest','Recorded TestoFX contribution 9.5 mg + curcumin product 5 mg on training days. Rest skips that curcumin grid. Review the full product list alongside medications; no safe upper limit is claimed here.')]
TIMELINE=[('2024 baseline','226.2 lb · 72.3 lb SMM · 37.0% body fat','Historical values transcribed from the supplied record.'),('28 June 2025','82.0 lb SMM','Only skeletal muscle mass supplied for this entry.'),('14 December 2025','197.1 lb · 88.2 lb SMM · 22.9% body fat','Dated benchmark recorded at Gym Fit Forme; 89.4 kg body weight / 40 kg SMM.'),('April 2026','191.5 lb · 93.7 lb SMM · 30.2% body fat','Operator-reported, unverified entry. Excluded from the progress trend.'),('24 July 2026','FFMI 25.71','Recorded index; not a measurement of skeletal muscle or a validated muscle ceiling.'),('August 2026','13.6% body fat, reported','Document milestone; the supporting scan image was not supplied with this addon.'),('September–October 2026','200.1 lb body weight','88.2 lb SMM is carried forward, not newly scanned. Approximately 22.5% body fat is an estimate. Weight change cannot establish muscle or water gain.'),('14–21 December 2026','Planned follow-up','Same unit at Gym Fit Forme where possible. A planned appointment is not a result.')]
def newpage(name,template,title,description,body,anchors):
 s=load(template)
 s.title.string=title+' · PROJECT 100'
 for m in s.select('meta[property="og:title"],meta[name="twitter:title"]'):m['content']=title+' · PROJECT 100'
 for m in s.select('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]'):m['content']=description
 for c in s.select('link[rel="canonical"]'):c['href']='https://project100.fit/'+name
 for m in s.select('meta[property="og:url"]'):m['content']='https://project100.fit/'+name
 content=s.select_one('.folder-page-content');content.clear()
 layout=s.select_one('.folder-page-layout');layout['class']=[c for c in layout.get('class',[]) if c!='single-file-layout']
 s.body['class']=s.body.get('class',[])+['biometrics-addon-page']
 content.append(fragment(f'<main class="wrap addon-content"><div class="v2-intro compact-page-identity" id="top"><span class="v2-kicker">{ "FIT PROTOCOL" if name.startswith("mineral") else "PROJECT 100" } · OCTOBER 2026</span><h1>{title}</h1></div>{note(description)}{body}</main>'))
 rail=s.select_one('.folder-page-rail')
 if rail is None:
  rail=s.new_tag('aside');rail['class']=['folder-page-rail'];content.insert_before(rail)
 rail.clear();rail.append(fragment('<nav class="page-tabs focused-subtabs" aria-label="'+title+' sections"><div class="wrap">'+''.join(f'<a class="page-tab" href="#{i}">{t}</a>' for i,t in anchors)+'</div></nav>'))
 # Shared scripts can infer shell from body. Remove page-specific JSON-LD inherited from the template.
 for j in s.select('script[type="application/ld+json"]'):j.decompose()
 save(name,s)
biobody=section('timeline','Dated record','<div class="addon-timeline">'+''.join(f'<article class="addon-card"><h3>{d}</h3><p class="addon-value">{v}</p><p>{n}</p></article>' for d,v,n in TIMELINE)+'</div>')
biobody+=section('corridor','Planning bands',cards([('90–93 lb SMM','Planning range, not a demonstrated physiological limit.'),('92–97 lb BIA readout','Anticipated printout range in the supplied plan; hydration and measurement conditions affect comparison.'),('100 lb stretch target','A stretch readout goal. No claim of 100 lb dry contractile muscle.')])+note('FFMI describes fat-free mass relative to height. Fat-free mass includes water, bone and organs as well as muscle; it cannot by itself establish a skeletal-muscle ceiling.'))
biobody+=section('scan-controls','Comparable scans',cards([('Use consistent conditions','Same device and time of day; record food, fluid and recent training. Follow the testing centre’s preparation instructions.'),('Record the context','The supplied plan uses a waking, post-void, pre-workout scan and avoids heavy training immediately beforehand. Do not deliberately dehydrate to change a result.'),('Keep the original result','Save the dated scan sheet. Compare measured values with measured values; mark carried values and estimates separately.')]))
biobody+=section('review','Next review','<p>Planned window: 14–21 December 2026. Replace estimates only after the new scan is available.</p><p><a href="mineral-chemistry.html">Open mineral accounting ↗</a></p><details><summary>Sources and measurement limits</summary><p>Values: supplied October 6, 2026 integration PDF and cross-check document. Original scan sheets were not supplied in this addon.</p><p><a href="https://inbodyusa.com/general/technology/">InBody: body composition and fat-free mass</a></p></details>')
newpage('biometrics.html','liquid-intake.html','Biometrics','Dated measurements, clearly marked estimates and the next scan plan.',biobody,[('timeline','Timeline'),('corridor','Planning bands'),('scan-controls','Scan controls'),('review','Review')])
minbody=section('accounting','Recorded intake scenarios',note('Partial accounting from your October 6 records. These scenarios depend on the selected products and optional servings; they exclude unlisted food. Upper limits have different scopes and are not target doses.')+'<div class="addon-grid">'+''.join(f'<article class="addon-card"><h3>{a}</h3><p class="addon-value">{b}</p><p>{c}</p></article>' for a,b,c in MINERALS)+'</div>')
minbody+=section('vector-chemistry','Vector contributions',cards([('Training · V2 + V4','RapiDrem contributes the recorded potassium, magnesium and calcium. BioSteel and two pink-salt portions contribute to the partial sodium account.'),('Rest · V5','One RapiDrem scoop and one pink-salt portion when the drink is consumed. The training multivitamin and EAA do not carry into this branch.'),('Night · V10','SD Pharmaceuticals creatine HCl 750 mg. Optional Medi-C or Hey Relax changes the totals; record the serving actually taken.')]))
minbody+=section('payloads','Product payloads',cards([('BioSteel · 36 g','Recorded half serving: 12 g protein, 19 g carbohydrate, 125 kcal, 90.5 mg calcium and 115 mg sodium.'),('RapiDrem · one scoop','Recorded label amounts: 1,000 mg potassium, 100 mg magnesium, 82 mg calcium and 45 mg vitamin C. Confirm your current container.'),('Medi-C · 2.5 g, conditional','Latest cross-check records the magnesium-ascorbate version: 105 mg magnesium, 1,000 mg vitamin C and 650 mg lysine. This differs from the older calcium formula; confirm the package before applying these numbers.')]))
minbody+=section('sources','Sources and limits','<p>Product amounts are transcribed from supplied records, not independently verified laboratory results. Totals are conditional sums, not complete dietary intake or a safety guarantee.</p><ul><li><a href="https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/">NIH ODS · magnesium</a></li><li><a href="https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/">NIH ODS · calcium</a></li><li><a href="https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/">NIH ODS · vitamin C</a></li><li><a href="https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/food-additives/caffeine-foods.html">Health Canada · caffeine guidance</a></li></ul>')
newpage('mineral-chemistry.html','fit-protocol-vector-reference.html','Mineral Chemistry','Conditional mineral, vitamin and stimulant accounting. Read the scope beside each number.',minbody,[('accounting','Daily accounting'),('vector-chemistry','Vectors'),('payloads','Product payloads'),('sources','Sources')])
# Registration and top-level navigation. Side arrows change top-level pages, preserving the approved behaviour.
for file,item,after in [('assets/js/main-files.json',{'file':'biometrics.html','label':'Biometrics','group':'biometrics'},'project-goals.html'),('assets/js/protocol-files.json',{'file':'mineral-chemistry.html','label':'Mineral Chemistry','group':'chemistry'},'fit-protocol-margins.html')]:
 data=json.loads((ROOT/file).read_text());data['files']=[x for x in data['files'] if x['file']!=item['file']];pos=next(i for i,x in enumerate(data['files']) if x['file']==after)+1;data['files'].insert(pos,item);(ROOT/file).write_text(json.dumps(data,indent=2)+'\n')
mainnames={x['file'] for x in json.loads((ROOT/'assets/js/main-files.json').read_text())['files']}
protonames={x['file'] for x in json.loads((ROOT/'assets/js/protocol-files.json').read_text())['files']}
for p in ROOT.glob('*.html'):
 if p.name not in mainnames|protonames: continue
 s=load(p.name)
 if p.name in mainnames|protonames:
  main=p.name in mainnames;dest='biometrics.html' if main else 'mineral-chemistry.html';label='Biometrics' if main else 'Minerals'
  nav=s.select_one('.site-head > .page-tabs:not(.focused-subtabs) .wrap')
  if nav:
   for a in nav.select(f'a[href="{dest}"]'):a.decompose()
   a=s.new_tag('a',href=dest);a['class']=['page-tab'];a.string=label
   if p.name==dest:
    for old in nav.select('a'):old['class']=[c for c in old.get('class',[]) if c!='current'];old.attrs.pop('aria-current',None)
    a['class'].append('current');a['aria-current']='page'
   nav.append(a)
   tabs=nav.select('a');current=next((i for i,t in enumerate(tabs) if 'current' in t.get('class',[])),0)
   for cls,delta in [('prev',-1),('next',1)]:
    for arrow in s.select('.page-nav-arrow.'+cls):arrow['href']=tabs[(current+delta)%len(tabs)]['href'];arrow['aria-label']='Previous page' if delta<0 else 'Next page'
  if p.name==dest:
   for a in s.select('.site-switch-float'):a['href']='fit-protocol.html' if main else 'index.html'
  if not s.select_one('link[href="assets/css/biometrics-addon.css"]'):
   s.head.append(s.new_tag('link',rel='stylesheet',href='assets/css/biometrics-addon.css'))
 save(p.name,s)
# Current vector records replace obsolete source tables; all details remain HTML and readable on a phone.
s=load('fit-protocol-vector-reference.html');chapter=s.select_one('#part3-vectors');chapter.clear();chapter.append(fragment('<h2>Current vector reference</h2>'+cards([(a,b+' · '+c) for a,b,c in VECTOR_DATA.values()])+note('V1 and V6 are mutually exclusive training options. V5 is the recorded rest-day drink. Use the current container label when flavour or formula versions differ.')));save('fit-protocol-vector-reference.html',s)
# Add the canonical recipe to each detailed vector and each existing folder without changing its open/close interaction.
for key,(label,timing,ingredients) in VECTOR_DATA.items():
 for name in [f'fit-protocol-vector-{key}.html','fit-protocol-vectors.html','liquid-intake.html']:
  s=load(name)
  for old in s.select(f'#record-{key}'):old.decompose()
  target=s.select_one(f'#vector-{key}') or s.select_one('main.wrap')
  if target:
   block=fragment(f'<div class="addon-card vector-current-record" id="record-{key}"><h3>{label} · current record</h3><p>{timing}</p><p>{ingredients}</p></div>')
   if target.name=='details':
    formula=target.select_one('.folder-formula')
    if formula:
     for part in list(formula.select('.folder-ingredients,.folder-timing')):part.decompose()
     formula.insert(0,block)
    else:
     summary=target.find('summary',recursive=False);summary.insert_after(block) if summary else target.append(block)
   else:target.append(block)
  save(name,s)
# Replace active pill and margin tables, preserving section IDs linked by the rest of the site.
s=load('fit-protocol-supplements.html');ch=s.select_one('#ch8');ch.clear();ch.append(fragment('<h2>Pill groups</h2>'+note('Counts are capsules and softgels, not product names. Conditional and intermittent units stay separate. Training groups are skipped on the recorded rest branch; wake items and meal enzymes remain.')+cards([(a,b+'<br>'+c) for a,b,c in PILLS])+'<p><a href="mineral-chemistry.html">Mineral, vitamin and stimulant accounting ↗</a></p>'));save('fit-protocol-supplements.html',s)
# Remove retired ingredients from active HTML; replace their obsolete table rows rather than claiming old source text is current.
import re
for name in protonames:
 s=load(name)
 for row in list(s.select('tr')):
  if re.search(r'\b(DMAE|Huperzine|S016)\b',row.get_text(),re.I):row.decompose()
 for el in list(s.select('p,li')):
  if re.search(r'\b(DMAE|Huperzine|S016)\b',el.get_text(),re.I):
   el.clear();el.append('Current training primer: citicoline 250 mg as a separate capsule. Review the complete formula and medication list; retired standalone nootropics are not part of the current schedule.')
 save(name,s)
# One complete selected branch. Reuse the original three controls and existing JS filtering.
BRANCHES={
 'training':[('Wake',PILLS[0][2]),('Morning · V3',VECTOR_DATA['v3'][2]),('Meal 1',PILLS[1][2]),('Before morning training · V1',VECTOR_DATA['v1'][2]),('During training · V2',VECTOR_DATA['v2'][2]),('After training · V4',VECTOR_DATA['v4'][2]),('Lunch / DMZ',PILLS[3][2]),('Afternoon',PILLS[4][2]),('Night capsules',PILLS[5][2]),('Night · V10',VECTOR_DATA['v10'][2])],
 'evening':[('Wake',PILLS[0][2]),('Morning · V3',VECTOR_DATA['v3'][2]),('Meal 1',PILLS[1][2]),('Lunch / DMZ',PILLS[3][2]),('Afternoon',PILLS[4][2]),('Before evening training · V6',VECTOR_DATA['v6'][2]),('During training · V2',VECTOR_DATA['v2'][2]),('After training · V4',VECTOR_DATA['v4'][2]),('Night capsules',PILLS[5][2]),('Night · V10',VECTOR_DATA['v10'][2])],
 'rest':[('Wake',PILLS[0][2]),('Morning · V3, when consumed',VECTOR_DATA['v3'][2]),('With meals','Digestive Enzymes Ultra: 1 capsule with each recorded meal. The training meal, lunch, afternoon and night pill grids are skipped.'),('V5, when consumed',VECTOR_DATA['v5'][2]),('Night · V10, when consumed',VECTOR_DATA['v10'][2])]}
s=load('guidebook.html');today=s.select_one('#today');controls=copy.deepcopy(today.select_one('.day-controls'));today.clear();today.append(fragment('<h2>Today at a glance</h2>'));today.append(controls);today.append(fragment(note('Choose one branch. V1 for morning training, V6 for evening training; neither on rest days. Times follow the workout and meals rather than rigid clock deadlines.')))
clock=s.new_tag('div');clock['class']=['daily-clock','addon-clock']
for branch,entries in BRANCHES.items():
 for title,body in entries:
  a=s.new_tag('article');a['class']=['clock-card'];a['data-branch']=branch
  if branch!='training':a['hidden']=''
  a.append(fragment('<h3>'+title+'</h3><p>'+body+'</p>'));clock.append(a)
today.append(clock);save('guidebook.html',s)
# Compact discovery cards, without replacing existing layouts.
for name,target in [('index.html','.folder-page-content'),('project-goals.html','.folder-page-content')]:
 s=load(name)
 for old in s.select('#biometric-milestone'):old.decompose()
 container=s.select_one(target)
 if container:container.append(fragment('<section class="wrap addon-section" id="biometric-milestone"><h2>Biometric record</h2><div class="addon-card"><p><strong>14 December 2025:</strong> 88.2 lb skeletal muscle · 197.1 lb body weight · 22.9% body fat.</p><p>October weight: 200.1 lb. Muscle value is carried forward; the next scan is planned for December.</p><a href="biometrics.html">Timeline and scan plan ↗</a></div></section>'))
 save(name,s)
# Keep the old clock and safety pages consistent with the current branch and accounting views.
s=load('fit-protocol-fuel.html');ch=s.select_one('#ch4');ch.clear();ch.append(fragment('<h2>Workout-relative sequence</h2>'+note('Morning: V1. Evening: V6. Rest: neither. Both training branches use V2 during training and V4 afterwards.')+cards([('Morning training','Wake → V3 → meal 1 → V1 + separate citicoline → V2 → V4 → lunch → afternoon cofactors → night capsules → V10.'),('Evening training','Wake → V3 → meal 1 → lunch → afternoon cofactors → V6 + separate citicoline → V2 → V4 → night capsules → V10.'),('Rest','Wake items; meal enzymes with meals. V3, V5 and V10 when consumed. Training pill grids are skipped.')])+'<p><a href="guidebook.html#today">Choose your complete day branch ↗</a></p>'));save('fit-protocol-fuel.html',s)
s=load('fit-protocol-margins.html')
for selector in ['#part5-margins','#guide-page-8']:
 ch=s.select_one(selector)
 if ch:
  ch.clear();ch.append(fragment('<h2>Current intake margins</h2>'+note('Compare conditional sums with the applicable reference. The magnesium UL covers supplements and medication; calcium and vitamin C limits cover total intake. A value below a limit does not establish personal safety.')+'<p><a href="mineral-chemistry.html#accounting">Open the current scenario calculations ↗</a></p>'))
save('fit-protocol-margins.html',s)
# Correct shared prose without creating a second recipe block on compact main-site folders.
for p in ROOT.glob('*.html'):
 text=p.read_text().replace('ALLMAX Essentials Betaine Anhydrous','NOW Betaine Anhydrous').replace('425 mcg total daily','425 mcg on the training branch').replace('425 mcg/day','425 mcg on training days').replace('425 mcg daily','425 mcg on training days')
 p.write_text(text)
s=load('liquid-intake.html')
for e in s.select('.vector-current-record'):e.decompose()
save('liquid-intake.html',s)
# Existing photos provide visual context without new rendering or unreadable text baked into images.
s=load('biometrics.html');target=s.select_one('#review');target.append(fragment('<figure class="addon-photo"><img src="assets/media/october-2026/bogdan-august-mirror.jpg" alt="August training progress portrait; photograph, not a body-composition measurement" loading="lazy" width="720" height="960"/><figcaption>Training journal · August 2026. Photos do not verify scan values.</figcaption></figure>'));save('biometrics.html',s)
s=load('project-story.html')
for old in s.select('#protocol-stations'):old.decompose()
s.select_one('.folder-page-content').append(fragment('<section class="wrap addon-section" id="protocol-stations"><h2>Protocol stations</h2><div class="addon-grid"><figure class="addon-photo"><img src="assets/media/october-2026/pill-organizer-february-2026.jpg" alt="Pill organiser photographed in February 2026" loading="lazy"/><figcaption>February 2026 · organiser record.</figcaption></figure><figure class="addon-photo"><img src="assets/media/october-2026/pill-organizer-may-2026.jpg" alt="Pill organiser photographed in May 2026" loading="lazy"/><figcaption>May 2026 · organiser record. Photos are historical, not the current dose schedule.</figcaption></figure></div></section>'));save('project-story.html',s)
# Include new routes in sitemap, using its existing format.
p=ROOT/'sitemap.xml';text=p.read_text()
for name in ['biometrics.html','mineral-chemistry.html']:
 if 'https://project100.fit/'+name not in text:text=text.replace('</urlset>',f'<url><loc>https://project100.fit/{name}</loc><lastmod>2026-10-06</lastmod></url>\n</urlset>')
p.write_text(text)
print('Applied biometrics, mineral scenarios, current vector records and complete day branches.')
