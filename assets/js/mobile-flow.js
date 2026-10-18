/* Shared phone layout. Native scrolling; desktop content and routes are retained. */
(function(){'use strict';
 const mq=matchMedia('(max-width:767px),(max-width:1023px) and (pointer:coarse)');
 const root=document.documentElement;
 const dock=document.createElement('div');dock.className='mobile-dock-background';dock.setAttribute('aria-hidden','true');document.body.append(dock);
 root.classList.add('mobile-ready');
 const head=document.getElementById('siteHead');if(head){const measure=()=>root.style.setProperty('--mobile-head-height',Math.ceil(head.getBoundingClientRect().height)+'px');if(window.ResizeObserver)new ResizeObserver(measure).observe(head);measure();}
 document.getElementById('menuBtn')?.setAttribute('aria-label','Open menu');
 const view=document.querySelector('[data-band-training]');
 if(view&&view.querySelector('.session-config')){
  const strip=document.createElement('nav');strip.className='mobile-exercise-strip';strip.setAttribute('aria-label','Choose session exercise');view.querySelector('.active-exercise').prepend(strip);
  let signature='';function sync(){const ex=[...view.querySelectorAll('#p100-exercise-sequence [data-exercise-index]')];const key=ex.map(b=>b.textContent+b.getAttribute('aria-current')).join();if(key===signature)return;signature=key;
   strip.replaceChildren(...ex.map(b=>{const n=document.createElement('button');n.type='button';n.dataset.exerciseIndex=b.dataset.exerciseIndex;n.textContent=String(Number(b.dataset.exerciseIndex)+1).padStart(2,'0');n.setAttribute('aria-label',b.textContent);n.setAttribute('aria-current',b.getAttribute('aria-current'));return n;}));
  }
  new MutationObserver(sync).observe(view.querySelector('.workbench'),{subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','aria-pressed']});sync();
  view.querySelectorAll('[data-training-panel]').forEach(b=>{b.dataset.desktopLabel=b.textContent;});
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
