/* One browser-local selection, shared by Train, Library and print preview. */
(function(){'use strict';
const db=window.PROJECT100_KINETICS;if(!db)return;const key='project100-print-selection-v1';
const types=Object.fromEntries(db.recordedMovementTypes.map(t=>[t.id,t]));const by={};
db.recordedVariants.filter(v=>v.art&&v.trainingPrescriptionEligible!==false).forEach(v=>{const t=types[v.movement_type_id],r=v.roleOverrides||{};by[v.id]={...v,main:r.main||t.main,secondary:r.secondary||t.secondary,base:r.base||v.supportCue||t.base};});db.exercises.forEach(e=>by[e.id]=e);
const allowed=id=>Object.hasOwn(by,id)&&!!by[id].art;let chosen=[];
try{const value=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(value))chosen=[...new Set(value.filter(allowed))];}catch(_){}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(key,JSON.stringify(chosen));}catch(_){}refresh();}
function refresh(){
 document.querySelectorAll('[data-select-exercise]').forEach(e=>{e.checked=chosen.includes(e.dataset.selectExercise);});
 document.querySelectorAll('[data-selection-count]').forEach(e=>{const text=chosen.length+' exercise'+(chosen.length===1?'':'s')+' selected';if(e.textContent!==text)e.textContent=text;});
 document.querySelectorAll('[data-selection-review]').forEach(e=>{e.setAttribute('aria-disabled',String(!chosen.length));e.href='/downloads/kinetics/my-exercises.html?ids='+encodeURIComponent(chosen.join(','));});
 const inLibrary=document.querySelector('[data-training-section="sessions"]')?.hidden;document.querySelectorAll('[data-select-day]').forEach(e=>{if(e.hidden!==!!inLibrary)e.hidden=!!inLibrary;});
 document.querySelectorAll('#p100-library-grid .library-tile').forEach(button=>{
  if(button.parentElement.classList.contains('library-choice'))return;
  const id=button.dataset.open;if(!allowed(id))return;const wrapper=document.createElement('div');wrapper.className='library-choice';wrapper.hidden=button.hidden;button.hidden=false;button.before(wrapper);wrapper.append(button);const label=document.createElement('label');label.className='exercise-check';const input=document.createElement('input');input.type='checkbox';input.dataset.selectExercise=id;input.checked=chosen.includes(id);input.setAttribute('aria-label','Select '+by[id].name+' for printing');label.append(input,document.createTextNode('Add to print list'));wrapper.append(label);
 });
}
document.addEventListener('change',e=>{const input=e.target.closest('[data-select-exercise]');if(!input||!allowed(input.dataset.selectExercise))return;const id=input.dataset.selectExercise;if(input.checked&&!chosen.includes(id))chosen.push(id);else if(!input.checked)chosen=chosen.filter(x=>x!==id);save();});
document.addEventListener('click',e=>{
 if(e.target.closest('[data-selection-clear]')){chosen=[];save();}
 if(e.target.closest('[data-select-day]')){document.querySelectorAll('.session-folders [data-select-exercise]').forEach(e=>{if(allowed(e.dataset.selectExercise)&&!chosen.includes(e.dataset.selectExercise))chosen.push(e.dataset.selectExercise);});save();}
 if(e.target.closest('[data-selection-review][aria-disabled="true"]')){e.preventDefault();const status=document.querySelector('[data-selection-status]');if(status)status.textContent='Check at least one exercise to build your printable document.';}
});
window.addEventListener('storage',e=>{if(e.key!==key)return;try{const value=JSON.parse(e.newValue||'[]');chosen=Array.isArray(value)?[...new Set(value.filter(allowed))]:[];refresh();}catch(_){}});
window.P100ExerciseSelection={refresh,ids:()=>chosen.slice()};
const view=document.querySelector('[data-band-training]');if(view){new MutationObserver(refresh).observe(view,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});refresh();}
const printRoot=document.querySelector('[data-personal-print]');if(!printRoot)return;
const params=new URLSearchParams(location.search);const ids=params.has('ids')?[...new Set(params.get('ids').split(',').filter(allowed))]:chosen.slice();
const title=document.querySelector('[data-document-title]');const titleValue=(params.get('title')||'My selected exercises').slice(0,80);title.value=titleValue;
const heading=document.querySelector('[data-print-title]');heading.textContent=titleValue;
const count=document.querySelector('[data-print-count]');count.textContent=ids.length+' exercise'+(ids.length===1?'':'s')+' · In selection order';
printRoot.innerHTML=ids.length?ids.map((id,i)=>{const e=by[id];return '<article class="personal-exercise"><header><span>PROJECT 100 · '+(i+1)+' / '+ids.length+'</span><h2>'+esc(e.name)+'</h2></header><figure><img src="/assets/media/workout-guides/'+esc(e.art)+'" alt="'+esc(e.name)+' — reviewed anatomical illustration"><figcaption>'+esc((e.artCaption||'Position A / Position B').replace(/\s{3,}/g,' · '))+'</figcaption></figure><div class="personal-cues">'+(e.gripLabel?'<p><b>GRIP / CONTACT</b> '+esc(e.gripLabel)+'</p>':'')+(e.grip?'<p>'+esc(e.grip)+'</p>':'')+['setup','move','return'].map(k=>'<p><b>'+k.toUpperCase()+'</b> '+esc(e.cardCues?.[k]||'See the linked technique guide.')+'</p>').join('')+'</div><div class="personal-roles">'+['main','secondary','base'].map((k,j)=>'<p class="'+k+'"><b>'+['MAIN / RED','SECONDARY / BLUE','SUPPORT / GREEN'][j]+'</b> '+esc(e[k])+'</p>').join('')+'</div>'+(e.isEditorialTechnique?'<p class="provenance">Added resistance-band technique; not claimed as verified personal footage.</p>':'')+(e.isTrainingAdaptation?'<p class="provenance">'+esc(e.adaptationNote)+'</p>':'')+'<p class="personal-notes"><b>Sets:</b> ______ <b>Repetitions:</b> ______ <b>Band / notes:</b> _______________________</p></article>';}).join(''):'<p class="empty-selection">No exercises selected. Return to Train or Library and check the exercises you want.</p>';
title.addEventListener('input',()=>{heading.textContent=title.value||'My selected exercises';document.title=heading.textContent+' · PROJECT 100';});
async function ready(){await Promise.all([...printRoot.querySelectorAll('img')].map(async img=>{await img.decode();}));}
document.querySelector('[data-print-selection]').addEventListener('click',async()=>{try{await ready();window.print();}catch(_){document.querySelector('[data-pdf-status]').textContent='An illustration could not load. Reconnect and reload before printing.';}});
document.querySelector('[data-save-selection]').addEventListener('click',async e=>{if(!ids.length)return;const button=e.currentTarget;button.disabled=true;try{await window.Project100ExportPDF(null,{kind:'selected',selectedIds:ids,title:title.value||'My selected exercises'});}finally{button.disabled=false;}});
document.querySelectorAll('[data-print-selection],[data-save-selection]').forEach(e=>e.disabled=!ids.length);
})();
