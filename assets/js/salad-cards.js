/* Salad recipes: representative portion ranges, independent of the old photo estimates. */
(function(root){'use strict';
// Generic rounded food composition per 100 g: kcal, protein, carbohydrate, fat, fiber.
// USDA generic food references; product labels and weighed portions take priority.
const food={romaine:[17,1.2,3.3,.3,2.1],beans:[110,7,19,.6,6],pepper:[31,1,6,.3,2.1],cucumber:[15,.7,3.6,.1,.5],kale:[35,2.9,4.4,1.5,4.1],beets:[65,.8,16,.1,2],olives:[145,1,4,15,3],tuna:[116,26,0,1,0],lupini:[119,15.6,9.9,2.9,2.8],feta:[265,14,4,21,0],tomato:[18,.9,3.9,.2,1.2],cabbage:[31,1.4,7.4,.2,2.1],spinach:[23,2.9,3.6,.4,2.2],egg:[155,12.6,1.1,10.6,0],chicken:[165,31,0,3.6,0],avocado:[160,2,8.5,14.7,6.7],oil:[884,0,0,100,0]};
const names={romaine:'Romaine / lettuce',beans:'Drained mixed beans',pepper:'Bell pepper',cucumber:'Cucumber',kale:'Kale',beets:'Pickled beets',olives:'Olives',tuna:'Drained water-packed tuna',lupini:'Drained lupini',feta:'Feta',tomato:'Tomato',cabbage:'Red cabbage',spinach:'Spinach',egg:'Boiled eggs, chopped',chicken:'Cooked chicken breast'};
// Portion ranges are disclosed modeling assumptions, not measurements from photographs.
const portions={romaine:[100,200],beans:[120,180],pepper:[50,100],cucumber:[100,200],kale:[20,50],beets:[40,80],olives:[20,40],tuna:[100,150],lupini:[60,100],feta:[50,90],tomato:[100,180],cabbage:[50,100],spinach:[70,130],egg:[200,200],chicken:[120,180]};
const recipes=[
 ['20260207_161926','Romaine, beans & feta',['romaine','cucumber','pepper','feta','beans'],'beans'],
 ['20260221_151235','Spinach, pepper & feta',['spinach','feta','pepper','cucumber'],'beans','The archive mentions unidentified protein pieces. They are excluded until identified.'],
 ['20260223_174930','Creamy greens & protein topping',['kale','cucumber','feta','beans','olives'],'chicken','The archive calls the topping chicken, but its species is not confirmed. Nutrition below excludes that topping.'],
 ['20260708_135631','Chicken & leafy greens',['romaine','kale','cabbage','chicken'],'chicken','The photo shows purple cabbage; the archive instead lists pickled beets. This working recipe uses cabbage.'],
 ['20260724_123441','Tuna, tomato & mixed beans',['kale','tomato','tuna','beans','feta'],'tuna'],
 ['20260816_133146','Chopped tuna & bean bowl',['romaine','kale','tomato','beets','beans','tuna'],'tuna'],
 ['20260903_115514','Layered beans, lupini & feta',['romaine','cabbage','beans','lupini','feta'],'beans','The central topping is not confidently identified; it is excluded from the modeled totals.'],
 ['20260910_142924','Kidney beans, lupini & beets',['beans','lupini','beets','feta','tomato'],'beans','The archive identifies tuna, but the central topping is uncertain. It is excluded from the modeled totals.'],
 ['20260919_111914','Romaine, tuna & bean mix',['romaine','tuna','beans','feta'],'tuna'],
 ['20260920_104323','Beans, olives & chopped vegetables',['romaine','olives','tomato','beans','beets','cucumber'],'beans','The central topping is uncertain; it is excluded. The selected dressing replaces any pictured drizzle.'],
 ['20260923_151755','Tomato, beans, feta & olives',['beans','tomato','feta','olives'],'beans','The archive calls the protein tuna; the photo shows browned pieces. Protein topping is excluded pending identification.'],
 ['20260924_111519','Four-egg recovery mega salad',['romaine','cucumber','beets','cabbage','feta','egg'],'eggs','Egg-led version: four eggs, without mixed beans or lupini. Vegetable and feta portions remain estimates.'],
 ['20260925_113245','Two eggs, mixed beans & lupini',['cabbage','romaine','cucumber','beets','beans','lupini','olives','tomato','egg','feta'],'eggs','Mixed-bean and lupini version: two eggs, following your portion rule. Eggs in this chopped photo still need visual confirmation.'],
 ['20261002_114802','Tuna, kidney beans & crunchy greens',['romaine','beans','beets','pepper','cucumber','tuna'],'tuna']
].map(([id,title,ingredients,category,note])=>({id,title,ingredients,category,note}));
function eggCount(recipe){return recipe.ingredients.includes('egg')?(recipe.ingredients.some(k=>k==='beans'||k==='lupini')?2:4):0;}
function recipePortions(recipe){const amounts={...portions};if(eggCount(recipe))amounts.egg=[eggCount(recipe)*50,eggCount(recipe)*50];if(recipe.ingredients.includes('tuna')&&recipe.ingredients.includes('beans')&&!recipe.ingredients.includes('egg')&&!recipe.ingredients.includes('lupini'))amounts.beans=[240,360];return amounts;}
function sum(ingredients,end,amounts=portions){return ingredients.reduce((v,key)=>v.map((x,i)=>x+food[key][i]*amounts[key][end]/100),[0,0,0,0,0]);}
function dressing(mode,end){
 if(mode==='none')return [0,0,0,0,0];
 if(mode==='heavy'){const avocado=end?200:130,oil=(end?3:2)*14;return food.avocado.map((n,i)=>n*avocado/100+food.oil[i]*oil/100);}
 // 4–5 tbsp oil and glaze; generic glaze assumption 7–12 g carbohydrate per 15 mL.
 const spoons=end?5:4,oil=spoons*15*.91,carbs=spoons*(end?12:7);
 return [oil*8.84+carbs*4+22,0,carbs,oil,0];
}
function totals(recipe,mode){return [0,1].map(end=>sum(recipe.ingredients,end,recipePortions(recipe)).map((x,i)=>x+dressing(mode,end)[i]));}
// Match the books: midpoint values round to the nearest even integer.
function roundBook(value){const lower=Math.floor(value),fraction=value-lower;return Math.abs(fraction-.5)<1e-9?(lower%2===0?lower:lower+1):Math.round(value);}
const api={food,portions,recipes,sum,dressing,totals,eggCount,recipePortions,roundBook};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(!root.document)return;
const doc=root.document,gallery=doc.getElementById('salad-gallery');if(!gallery)return;
const mobile=root.matchMedia('(max-width:599px)');
let filter='all',indexOpen=false,current=0,chosen=[];
const labels=['Energy','Protein','Carbs','Fat','Fiber'],units=['kcal','g','g','g','g'];
function range(lo,hi,unit){return roundBook(lo)+'–'+roundBook(hi)+' '+unit;}
function el(tag,text,cls){const e=doc.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
const nav=doc.querySelector('[data-salad-navigation]'),previous=nav.querySelector('[data-salad-previous]'),next=nav.querySelector('[data-salad-next]'),position=nav.querySelector('[data-salad-position]'),browse=nav.querySelector('[data-salad-browse]'),pause=nav.querySelector('[data-salad-pause]'),overview=doc.getElementById('salad-overview');
let paused=false,visible=false,lastChange=Date.now(),holdUntil=0,transitioning=false,keyboard=false;
function pageSize(){return 4;}
function updatePosition(){
 const size=pageSize(),page=Math.floor(current/size),pages=Math.ceil(chosen.length/size);
 position.textContent='Set '+(page+1)+' / '+pages;
 previous.disabled=next.disabled=chosen.length<=size;
 overview.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i>=current&&i<current+size)));
}
function revealSet(){
 const size=pageSize();current=Math.floor(current/size)*size;
 const start=Math.min(current,Math.max(0,chosen.length-size));gallery.querySelectorAll('.salad-card').forEach((c,i)=>c.hidden=i<start||i>=start+size);
 gallery.dataset.set=String(Math.floor(current/size)+1);updatePosition();lastChange=Date.now();
}
function goTo(i,manual=true){
 if(transitioning||!chosen.length)return;
 const size=pageSize(),pages=Math.ceil(chosen.length/size),page=((Math.floor(i/size)%pages)+pages)%pages;
 if(manual)holdUntil=Date.now()+12000;
 transitioning=true;const oldHeight=gallery.getBoundingClientRect().height;
 gallery.style.minHeight=oldHeight+'px';gallery.classList.add('is-fading');
 setTimeout(()=>{current=page*size;revealSet();gallery.classList.remove('is-fading');transitioning=false;gallery.style.minHeight='';},220);
}
function toggleOverview(){indexOpen=!indexOpen;overview.hidden=!indexOpen;browse.setAttribute('aria-expanded',String(indexOpen));holdUntil=Date.now()+12000;}
function layout(){nav.hidden=false;overview.hidden=!indexOpen;gallery.setAttribute('aria-label','Four salad recipes in a fixed two-by-two grid');revealSet();}
previous.addEventListener('click',()=>goTo(current-pageSize()));next.addEventListener('click',()=>goTo(current+pageSize()));browse.addEventListener('click',toggleOverview);
pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));lastChange=Date.now();});
gallery.addEventListener('keydown',e=>{if(e.target!==gallery)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goTo(current+(e.key==='ArrowRight'?pageSize():-pageSize()));}});
doc.addEventListener('keydown',e=>{if(e.key==='Tab')keyboard=true;},true);doc.addEventListener('pointerdown',()=>keyboard=false,true);
gallery.addEventListener('pointerdown',()=>holdUntil=Date.now()+12000,{passive:true});
mobile.addEventListener('change',layout);
if(root.IntersectionObserver)new root.IntersectionObserver(es=>{visible=es[0].isIntersecting;lastChange=Date.now();},{threshold:.01}).observe(gallery);else visible=true;
setInterval(()=>{
 const reading=gallery.querySelector('details[open]')||doc.querySelector('dialog[open]')||indexOpen||(keyboard&&gallery.contains(doc.activeElement))||gallery.querySelector('select:focus');
 if(paused||!visible||doc.hidden||root.P100?.motionPaused||reading||transitioning||Date.now()<holdUntil){lastChange=Date.now();return;}
 if(Date.now()-lastChange>=4800)goTo(current+pageSize(),false);
},200);
function draw(){gallery.scrollLeft=0;gallery.replaceChildren();chosen=recipes.filter(p=>filter==='all'||p.category===filter).slice().reverse();const featured=['20260207_161926','20260708_135631'];chosen.sort((a,b)=>{const rank=p=>featured.includes(p.id)?featured.indexOf(p.id):featured.length;return rank(a)-rank(b);});overview.replaceChildren();browse.textContent='All '+chosen.length+' salads';current=0;indexOpen=false;browse.setAttribute('aria-expanded','false');
chosen.forEach((p,i)=>{
 const pick=el('button',null,'salad-browser-pick');pick.type='button';pick.setAttribute('aria-label','Open salad '+(i+1)+': '+p.title);const thumb=el('img');thumb.src='assets/web/mega-salads/'+p.id+'-480.webp';thumb.alt='';thumb.loading='lazy';pick.append(thumb,el('span',(i+1)+'. '+p.title));pick.addEventListener('click',()=>{toggleOverview();goTo(i);gallery.scrollIntoView({block:'start',behavior:'auto'});gallery.focus({preventScroll:true});});overview.append(pick);
 const card=el('article',null,'salad-card salad-card--neutral');card.dataset.saladCategory=p.category;
 const photo=el('button',null,'salad-photo zoom');photo.type='button';photo.dataset.full='assets/web/mega-salads/'+p.id+'-1200.webp';photo.setAttribute('aria-label','Enlarge '+p.title);
 const img=el('img');img.src='assets/web/mega-salads/'+p.id+'-480.webp';
 // This photo's existing 1200px asset is empty; retain the valid preview.
 if(p.id==='20260923_151755'||p.id==='20260708_135631'){photo.dataset.full=img.src;img.srcset=img.src+' 480w';}else img.srcset=img.src+' 480w, '+photo.dataset.full+' 1200w';
 photo.dataset.orig='assets/media/mega-salads/originals/'+p.id+'.jpg';photo.dataset.full=photo.dataset.orig;
 img.sizes='(min-width: 900px) 30vw, (min-width: 600px) 48vw, 100vw';img.alt=p.title;img.loading='lazy';img.decoding='async';photo.append(img);
 const body=el('div',null,'salad-card__body'),time=el('time',p.id.slice(0,4)+'-'+p.id.slice(4,6)+'-'+p.id.slice(6,8));time.dateTime=time.textContent;
 const amounts=recipePortions(p),count=eggCount(p),wholeCan=amounts.beans!==portions.beans;
 body.append(el('h3',p.title),el('p',p.ingredients.map(k=>k==='egg'?count+' boiled eggs':k==='beans'&&wholeCan?'1 whole can mixed beans':names[k].replace('Drained ','')).join(' · '),'salad-ingredient-preview'));
 const choice=el('label','Dressing','salad-card-choice'),select=el('select');select.setAttribute('aria-label','Dressing for '+p.title);
 [['heavy','Heavy · avocado'],['light','Light · olive oil & glaze'],['none','Without dressing']].forEach(([value,text])=>{const o=el('option',text);o.value=value;select.append(o);});choice.append(select);const photoArea=el('div',null,'salad-photo-area');photoArea.append(photo);body.insertBefore(time,body.firstChild);
 const results=el('div',null,'salad-card-metrics');results.setAttribute('aria-live','polite');body.append(results);
 const details=el('details',null,'salad-recipe-details');const summary=el('summary','Full recipe');details.append(summary,choice);details.addEventListener('toggle',()=>{summary.textContent=details.open?'Close recipe':'Full recipe';card.classList.toggle('is-reading',details.open);});
 const list=el('ul');p.ingredients.forEach(k=>list.append(el('li',(k==='egg'?'Boiled eggs, chopped':names[k])+': '+(k==='egg'?count+' eggs (about '+count*50+' g edible)':k==='beans'&&wholeCan?'1 whole can; provisional '+amounts[k][0]+'–'+amounts[k][1]+' g drained':amounts[k][0]+'–'+amounts[k][1]+' g'))));details.append(list);
 if(wholeCan)details.append(el('p','Whole-can drained weight is provisionally estimated at 240–360 g. Can size and the package drained weight are needed to refine the totals.'));
 if(p.note)details.append(el('p',p.note,'salad-identification-note'));
 const detailedMetrics=el('p',null,'salad-full-metrics');details.append(detailedMetrics);const breakdown=el('p'),purpose=el('p','Protein foods support the daily protein total; beans and vegetables add carbohydrate and fiber. Dressing changes energy and fat.');details.append(breakdown,purpose);
 details.append(el('p','Sodium, sugars, saturated fat and numeric micronutrient totals need product labels and verified portions; they are not assumed to be zero. Greens contribute folate and vitamin K; peppers vitamin C; feta calcium; eggs choline and B12.'));
 details.append(el('p','Recipe quantities are modeling assumptions, not measured photo portions. The full prepared dressing is included; leftover dressing means actual intake is lower by an unmeasured amount.'));
 const study=el('a','Study portions, labels & nutrition-estimate uncertainty →');study.href='/downloads/reference/evidence-notes-2026-10-21.html#nutrition-measurements';details.append(study);
 body.append(details);card.append(photoArea,body);gallery.append(card);
 function update(){const mode=select.value,t=totals(p,mode);detailedMetrics.textContent=labels.map((label,i)=>label+': '+range(t[0][i],t[1][i],units[i])).join(' · ');results.replaceChildren();labels.forEach((label,i)=>{const cell=el('div');cell.append(el('b',range(t[0][i],t[1][i],units[i])),el('span',label));results.append(cell);});
 const b=[sum(p.ingredients,0,amounts),sum(p.ingredients,1,amounts)],d=[dressing(mode,0),dressing(mode,1)];const measured=mode==='heavy'?' Heavy dressing: 2–3 tbsp [30–45 mL; 28–42 g model] avocado oil + 130–200 g edible avocado.':mode==='light'?' Light dressing: 4–5 tbsp [60–75 mL] each olive oil and balsamic glaze + about 120 mL white wine vinegar.':'';breakdown.textContent='Base: '+range(b[0][0],b[1][0],'kcal')+' · '+range(b[0][1],b[1][1],'g protein')+'. Prepared dressing: '+range(d[0][0],d[1][0],'kcal')+'. Combined estimates shown above.'+measured;}
 select.addEventListener('change',update);update();
});
doc.getElementById('salad-count').textContent=chosen.length+' salads';layout();}
doc.querySelectorAll('[data-salad-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.saladFilter;doc.querySelectorAll('[data-salad-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw();}));
root.addEventListener('resize',updatePosition);
draw();
})(typeof window==='undefined'?globalThis:window);
