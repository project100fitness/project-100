/* Shared phone layout. Native scrolling; desktop content and routes are retained. */
(function(){'use strict';
 const mq=matchMedia('(max-width:767px),(max-width:1023px) and (pointer:coarse)');
 const root=document.documentElement;
 root.classList.add('mobile-ready');
 const head=document.getElementById('siteHead');if(head){const measure=()=>{const height=Math.ceil(head.getBoundingClientRect().height);root.style.setProperty('--mobile-head-height',height+'px');root.style.setProperty('--mobile-head-offset',head.dataset.hidden==='true'?'0px':height+'px');};if(window.ResizeObserver)new ResizeObserver(measure).observe(head);new MutationObserver(measure).observe(head,{attributes:true,attributeFilter:['data-hidden']});measure();}
 document.getElementById('menuBtn')?.setAttribute('aria-label','Open menu');
 const view=document.querySelector('[data-band-training]');

 function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}if(!id)return;const target=document.getElementById(id);if(!target)return;const toggle=target.closest('.mobile-folder')?.querySelector('.mobile-folder-toggle[aria-expanded=false]');let changed=!!toggle;toggle?.click();let p=target.parentElement;while(p){if(p.tagName==='DETAILS'&&!p.open){p.open=true;changed=true;}p=p.parentElement;}if(changed||mq.matches)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'auto'}));}
 function layout(){if(mq.matches)revealHash();}
 mq.addEventListener('change',layout);window.addEventListener('hashchange',revealHash);document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a)setTimeout(revealHash,0);});layout();
})();
