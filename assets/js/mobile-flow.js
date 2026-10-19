/* Shared phone layout. Native scrolling; desktop content and routes are retained. */
(function(){'use strict';
 const mq=matchMedia('(max-width:767px),(max-width:1023px) and (pointer:coarse)');
 const root=document.documentElement;
 root.classList.add('mobile-ready');
 const head=document.getElementById('siteHead');if(head){const measure=()=>root.style.setProperty('--mobile-head-height',Math.ceil(head.getBoundingClientRect().height)+'px');if(window.ResizeObserver)new ResizeObserver(measure).observe(head);measure();}
 document.getElementById('menuBtn')?.setAttribute('aria-label','Open menu');
 const view=document.querySelector('[data-band-training]');
 if(view&&view.querySelector('.session-config')&&view.querySelector('[data-session-choices]')){
  const strip=view.querySelector('[data-session-choices]');
  let signature='';function sync(){const ex=[...view.querySelectorAll('#p100-exercise-sequence [data-exercise-index]')];const key=ex.map(b=>b.textContent+b.getAttribute('aria-current')).join();if(key===signature)return;signature=key;
   strip.replaceChildren(...ex.map(b=>{const n=document.createElement('button');n.type='button';n.dataset.exerciseIndex=b.dataset.exerciseIndex;const number=document.createElement('span'),name=document.createElement('strong'),meta=document.createElement('small');number.className='session-choice-number';number.textContent=String(Number(b.dataset.exerciseIndex)+1).padStart(2,'0');const title=b.querySelector('div');name.textContent=title?.childNodes[0]?.textContent?.trim()||b.textContent;meta.textContent=b.querySelector('small')?.textContent||'';n.append(number,name,meta);n.setAttribute('aria-label',b.textContent);n.setAttribute('aria-current',b.getAttribute('aria-current'));return n;}));
  }
  new MutationObserver(sync).observe(view.querySelector('.workbench'),{subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','aria-pressed']});sync();
 }
 function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}if(!id)return;const target=document.getElementById(id);if(!target)return;const toggle=target.closest('.mobile-folder')?.querySelector('.mobile-folder-toggle[aria-expanded=false]');let changed=!!toggle;toggle?.click();let p=target.parentElement;while(p){if(p.tagName==='DETAILS'&&!p.open){p.open=true;changed=true;}p=p.parentElement;}if(changed||mq.matches)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'auto'}));}
 function layout(){if(mq.matches)revealHash();}
 mq.addEventListener('change',layout);window.addEventListener('hashchange',revealHash);document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a)setTimeout(revealHash,0);});layout();
})();
