/* Shared phone layout. Native scrolling; desktop content and routes are retained. */
(function(){'use strict';
 const mq=matchMedia('(max-width:767px),(max-width:1023px) and (pointer:coarse)');
 const root=document.documentElement, main=document.querySelector('main');
 const head=document.querySelector('.site-head__bar'), links=[...document.querySelectorAll('.site-head .tabs a')];
 if(head&&links.length){const select=document.createElement('select');select.className='mobile-site-switch';select.setAttribute('aria-label','Website section');links.forEach(a=>{const o=new Option(a.textContent.trim(),a.href);o.selected=a.getAttribute('aria-current')==='page';select.add(o);});head.insertBefore(select,head.querySelector('.site-head__actions'));select.addEventListener('change',()=>location.assign(select.value));}
 root.classList.add('mobile-ready');
 document.getElementById('menuBtn')?.setAttribute('aria-label','Open menu');
 const view=document.querySelector('[data-band-training]');
 function selector(label,cls){const l=document.createElement('label');l.className=cls||'';l.append(document.createTextNode(label));const s=document.createElement('select');l.append(s);return[l,s];}
 if(view&&view.querySelector('.session-config')){
  const box=document.createElement('div');box.className='mobile-training-controls';const[ml,ms]=selector('PROGRAMME'),[dl,ds]=selector('TRAINING DAY');box.append(ml,dl);view.querySelector('.session-config').before(box);
  const[el,es]=selector('EXERCISE · CHOOSE ANY OF THE 12','mobile-exercise-picker');view.querySelector('.active-exercise').prepend(el);
  let signature='';function sync(){const modes=[...view.querySelectorAll('[data-mode]')],days=[...view.querySelectorAll('[data-day]')],ex=[...view.querySelectorAll('[data-exercise-index]')];const key=modes.map(b=>b.getAttribute('aria-pressed')).join()+days.map(b=>b.textContent+b.getAttribute('aria-pressed')).join()+ex.map(b=>b.textContent+b.getAttribute('aria-current')).join();if(key===signature)return;signature=key;
   ms.replaceChildren(...modes.map(b=>new Option(b.dataset.mode==='focused'?'3-day focus':'2-day Pilates',b.dataset.mode,false,b.getAttribute('aria-pressed')==='true')));
   ds.replaceChildren(...days.map(b=>new Option(b.textContent,b.dataset.day,false,b.getAttribute('aria-pressed')==='true')));
   es.replaceChildren(...ex.map(b=>new Option((b.querySelector('span')?.textContent+' · '+b.querySelector('div')?.childNodes[0]?.textContent).trim(),b.dataset.exerciseIndex,false,b.getAttribute('aria-current')==='step')));
  }
  ms.addEventListener('change',()=>view.querySelector('[data-mode="'+ms.value+'"]').click());ds.addEventListener('change',()=>view.querySelector('[data-day="'+ds.value+'"]').click());es.addEventListener('change',()=>view.querySelector('[data-exercise-index="'+es.value+'"]').click());
  new MutationObserver(sync).observe(view.querySelector('.workbench'),{subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','aria-pressed']});sync();
  view.querySelectorAll('[data-training-panel]').forEach(b=>{b.dataset.desktopLabel=b.textContent;});
 }

 const reader=document.querySelector('.guide-main.reader'),readerCards=reader?[...reader.querySelectorAll('.print-page .swipe-card')]:[];
 if(readerCards.length>1){
  const controls=document.createElement('nav');controls.className='mobile-reader-controls';controls.setAttribute('aria-label','Browse guide exercises');
  const[label,picker]=selector('CHOOSE AN EXERCISE');const row=document.createElement('div'),prev=document.createElement('button'),next=document.createElement('button'),count=document.createElement('span');prev.textContent='← Previous';next.textContent='Next →';prev.type=next.type='button';count.setAttribute('aria-live','polite');row.append(prev,count,next);controls.append(label,row);reader.querySelector('.print-top').after(controls);
  readerCards.forEach((card,i)=>picker.add(new Option((i+1)+' · '+card.querySelector('h4').textContent,i)));let index=0;
  function show(indexNext){index=Math.max(0,Math.min(readerCards.length-1,indexNext));picker.value=String(index);readerCards.forEach((c,i)=>c.classList.toggle('mobile-reader-card-hidden',i!==index));reader.querySelectorAll('.print-page').forEach(page=>page.classList.toggle('mobile-reader-page-hidden',!page.contains(readerCards[index])));count.textContent=(index+1)+' / '+readerCards.length;prev.disabled=index===0;next.disabled=index===readerCards.length-1;}
  picker.addEventListener('change',()=>show(Number(picker.value)));prev.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));show(0);
 }
 const folds=[];
 function foldContent(node,title,open){if(!node||node.closest('.mobile-detail'))return;const d=document.createElement('details');d.className='mobile-detail';d.open=!!open;const s=document.createElement('summary');s.textContent=title;const wrap=document.createElement('div');node.before(d);d.append(s,wrap);wrap.append(node);folds.push({d,node});}
 function unwrap(){folds.splice(0).reverse().forEach(({d,node})=>{d.before(node);d.remove();});}
 function enhanceCard(){if(!mq.matches)return;document.querySelectorAll('.swipe-card .cues').forEach(n=>foldContent(n,'Setup, movement & return',true));document.querySelectorAll('.swipe-card .roles').forEach(n=>foldContent(n,'Muscles · red / blue / green',false));}
 const deck=document.querySelector('#p100-exercise-deck');if(deck)new MutationObserver(enhanceCard).observe(deck,{childList:true});
 const folders=[...document.querySelectorAll('main .hud-folder')].filter(f=>f.querySelector(':scope > .hud-folder__body')&&!f.closest('[data-band-training]'));
 folders.forEach((f,i)=>{const body=f.querySelector(':scope > .hud-folder__body'),h=f.querySelector(':scope > .hud-folder__head'),title=h?.querySelector('h2,h3')?.textContent.trim()||h?.textContent.trim();if(!title)return;const b=document.createElement('button');b.className='mobile-folder-toggle';b.textContent=title;body.id=body.id||'mobile-folder-body-'+i;b.setAttribute('aria-controls',body.id);b.setAttribute('aria-expanded','false');f.prepend(b);f.classList.add('mobile-folder');f.dataset.mobileOpen='false';b.addEventListener('click',()=>{const open=f.dataset.mobileOpen!=='true';f.dataset.mobileOpen=String(open);b.setAttribute('aria-expanded',String(open));window.dispatchEvent(new Event('resize'));});});
 function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}if(!id)return;const target=document.getElementById(id);if(!target)return;const toggle=target.closest('.mobile-folder')?.querySelector('.mobile-folder-toggle[aria-expanded=false]');let changed=!!toggle;toggle?.click();let p=target.parentElement;while(p){if(p.tagName==='DETAILS'&&!p.open){p.open=true;changed=true;}p=p.parentElement;}if(changed)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'auto'}));}
 function layout(){unwrap();view?.querySelectorAll('[data-training-panel]').forEach(b=>{if(b.dataset.desktopLabel)b.textContent=mq.matches?({sessions:'Train',library:'Library',downloads:'Guides'}[b.dataset.trainingPanel]):b.dataset.desktopLabel;});if(!mq.matches)return;enhanceCard();
  document.querySelectorAll('.weekly-notes').forEach(n=>foldContent(n,'Weekly notes & training log'));
  document.querySelectorAll('.goalmeter').forEach(n=>foldContent(n,'Progress & measurements'));
  document.querySelectorAll('.kin-connected-gallery').forEach(n=>foldContent(n,'Setup photographs & band directory'));
  document.querySelectorAll('.kin-vector-grid').forEach(n=>foldContent(n,'Anchor zones · high / middle / low'));
  document.querySelectorAll('.kin-steps').forEach(n=>foldContent(n,'Session flow · prepare to record'));
  document.querySelectorAll('.kin-bundles').forEach(n=>foldContent(n,'Band combinations & equipment'));
  document.querySelectorAll('.kin-mounts').forEach(n=>foldContent(n,'Mounting positions · view setups'));
  document.querySelectorAll('.kin-pilates-atlas').forEach(n=>foldContent(n,'Pilates movement atlas'));
  document.querySelectorAll('.site-foot__inner').forEach(n=>foldContent(n,'Explore PROJECT 100 & contact'));
  revealHash();
 }
 window.addEventListener('beforeprint',unwrap);window.addEventListener('afterprint',layout);
 mq.addEventListener('change',layout);window.addEventListener('hashchange',revealHash);document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a)setTimeout(revealHash,0);});layout();
})();
