/* Shared phone layout. Native scrolling; desktop content and routes are retained. */
(function(){'use strict';
 const mq=matchMedia('(max-width:767px),(max-width:1023px) and (pointer:coarse)');
 const root=document.documentElement;
 const dock=document.createElement('div');dock.className='mobile-dock-background';dock.setAttribute('aria-hidden','true');document.body.append(dock);
 root.classList.add('mobile-ready');
 const head=document.getElementById('siteHead');if(head){const measure=()=>root.style.setProperty('--mobile-head-height',Math.ceil(head.getBoundingClientRect().height)+'px');if(window.ResizeObserver)new ResizeObserver(measure).observe(head);measure();}
 document.getElementById('menuBtn')?.setAttribute('aria-label','Open menu');
 const view=document.querySelector('[data-band-training]');
 function selector(label,cls){const l=document.createElement('label');l.className=cls||'';l.append(document.createTextNode(label));const s=document.createElement('select');l.append(s);return[l,s];}
 if(view&&view.querySelector('.session-config')){
  const box=document.createElement('div');box.className='mobile-training-controls';const[ml,ms]=selector('PROGRAMME'),[dl,ds]=selector('TRAINING DAY');box.append(ml,dl);view.querySelector('.session-config').before(box);
  const[el,es]=selector('EXERCISE · CHOOSE ANY OF THE 12','mobile-exercise-picker');view.querySelector('.active-exercise').prepend(el);const strip=document.createElement('nav');strip.className='mobile-exercise-strip';strip.setAttribute('aria-label','Choose session exercise');el.after(strip);
  let signature='';function sync(){const modes=[...view.querySelectorAll('[data-mode]')],days=[...view.querySelectorAll('[data-day]')],ex=[...view.querySelectorAll('#p100-exercise-sequence [data-exercise-index]')];const key=modes.map(b=>b.getAttribute('aria-pressed')).join()+days.map(b=>b.textContent+b.getAttribute('aria-pressed')).join()+ex.map(b=>b.textContent+b.getAttribute('aria-current')).join();if(key===signature)return;signature=key;
   ms.replaceChildren(...modes.map(b=>new Option(b.dataset.mode==='focused'?'3-day focus':'2-day Pilates',b.dataset.mode,false,b.getAttribute('aria-pressed')==='true')));
   ds.replaceChildren(...days.map(b=>new Option(b.textContent,b.dataset.day,false,b.getAttribute('aria-pressed')==='true')));
   es.replaceChildren(...ex.map(b=>new Option((b.querySelector('span')?.textContent+' · '+b.querySelector('div')?.childNodes[0]?.textContent).trim(),b.dataset.exerciseIndex,false,b.getAttribute('aria-current')==='step')));
   strip.replaceChildren(...ex.map(b=>{const n=document.createElement('button');n.type='button';n.dataset.exerciseIndex=b.dataset.exerciseIndex;n.textContent=String(Number(b.dataset.exerciseIndex)+1).padStart(2,'0');n.setAttribute('aria-label',b.textContent);n.setAttribute('aria-current',b.getAttribute('aria-current'));return n;}));requestAnimationFrame(()=>{const n=strip.querySelector('[aria-current=step]');if(n){const r=n.getBoundingClientRect(),a=strip.getBoundingClientRect();if(r.left<a.left||r.right>a.right)strip.scrollLeft+=r.left-a.left;}});
  }
  ms.addEventListener('change',()=>view.querySelector('[data-mode="'+ms.value+'"]').click());ds.addEventListener('change',()=>view.querySelector('[data-day="'+ds.value+'"]').click());es.addEventListener('change',()=>view.querySelector('[data-exercise-index="'+es.value+'"]').click());
  new MutationObserver(sync).observe(view.querySelector('.workbench'),{subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','aria-pressed']});sync();
  view.querySelectorAll('[data-training-panel]').forEach(b=>{b.dataset.desktopLabel=b.textContent;});
 }

 const reader=document.querySelector('.guide-main.reader'),readerCards=reader?[...reader.querySelectorAll('.print-page .swipe-card')]:[];
 if(readerCards.length>1){
  const controls=document.createElement('nav');controls.className='mobile-reader-controls';controls.setAttribute('aria-label','Browse guide exercises');
  const[label,picker]=selector('CHOOSE AN EXERCISE');const row=document.createElement('div'),prev=document.createElement('button'),next=document.createElement('button'),count=document.createElement('span');prev.textContent='← Previous';next.textContent='Next →';prev.type=next.type='button';count.setAttribute('aria-live','polite');row.append(prev,count,next);const modes=document.createElement('div'),all=document.createElement('button'),one=document.createElement('button');all.type=one.type='button';all.textContent='Free scroll';one.textContent='One exercise';all.setAttribute('aria-pressed','true');one.setAttribute('aria-pressed','false');modes.className='reader-display-modes';modes.append(all,one);controls.append(modes,label,row);reader.querySelector('.print-top').after(controls);
  readerCards.forEach((card,i)=>picker.add(new Option((i+1)+' · '+card.querySelector('h4').textContent,i)));let index=0,single=false;
  function show(indexNext){index=Math.max(0,Math.min(readerCards.length-1,indexNext));picker.value=String(index);readerCards.forEach((c,i)=>c.classList.toggle('mobile-reader-card-hidden',single&&i!==index));reader.querySelectorAll('.print-page').forEach(page=>page.classList.toggle('mobile-reader-page-hidden',single&&!page.contains(readerCards[index])));count.textContent=(index+1)+' / '+readerCards.length;prev.disabled=index===0;next.disabled=index===readerCards.length-1;}
  function navigate(n){show(n);if(!single)readerCards[index].scrollIntoView({block:'start',behavior:'auto'});}all.addEventListener('click',()=>{single=false;all.setAttribute('aria-pressed','true');one.setAttribute('aria-pressed','false');show(index);});one.addEventListener('click',()=>{single=true;all.setAttribute('aria-pressed','false');one.setAttribute('aria-pressed','true');show(index);});picker.addEventListener('change',()=>navigate(Number(picker.value)));prev.addEventListener('click',()=>navigate(index-1));next.addEventListener('click',()=>navigate(index+1));show(0);
 }
 const folds=[];
 function foldContent(node,title,open){if(!node||node.closest('.mobile-detail'))return;const d=document.createElement('details');d.className='mobile-detail';d.open=!!open;const s=document.createElement('summary');s.textContent=title;const wrap=document.createElement('div');node.before(d);d.append(s,wrap);wrap.append(node);folds.push({d,node});}
 function unwrap(){folds.splice(0).reverse().forEach(({d,node})=>{d.before(node);d.remove();});}
 function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}if(!id)return;const target=document.getElementById(id);if(!target)return;const toggle=target.closest('.mobile-folder')?.querySelector('.mobile-folder-toggle[aria-expanded=false]');let changed=!!toggle;toggle?.click();let p=target.parentElement;while(p){if(p.tagName==='DETAILS'&&!p.open){p.open=true;changed=true;}p=p.parentElement;}if(changed)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'auto'}));}
 const downloads=document.getElementById('p100-downloads'),reference=downloads?.querySelector('[data-analysis-reference-entry]');if(reference)downloads.append(reference);
 function layout(){unwrap();view?.querySelectorAll('[data-training-panel]').forEach(b=>{if(b.dataset.desktopLabel)b.textContent=mq.matches?({sessions:'Train',library:'Library',downloads:'Guides'}[b.dataset.trainingPanel]):b.dataset.desktopLabel;});if(!mq.matches)return;
  document.querySelectorAll('.weekly-notes').forEach(n=>foldContent(n,'Weekly notes & training log'));
  revealHash();
 }
 window.addEventListener('beforeprint',unwrap);window.addEventListener('afterprint',layout);
 mq.addEventListener('change',layout);window.addEventListener('hashchange',revealHash);document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a)setTimeout(revealHash,0);});layout();
})();
