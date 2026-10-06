/* Small static-site enhancements. All source text and downloads work without JS. */
(()=>{'use strict';
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const get=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
 // Integration hook for a future privacy-respecting analytics service; no remote tracking.
 const event=(name,detail={})=>document.dispatchEvent(new CustomEvent('project100:event',{detail:{name,...detail}}));
 $$('[data-door]').forEach(a=>a.addEventListener('click',()=>event('door_click',{door:a.dataset.door})));
 $$('a[download]').forEach(a=>a.addEventListener('click',()=>event('download',{file:a.getAttribute('href')})));
 if(document.body.classList.contains('encyclopedia-site')){
  const openIndex=()=>{if(location.hash==='#book-index'&&innerWidth<=900){const index=$('.reader-mobile-index');if(index)index.open=true}};
  addEventListener('hashchange',openIndex);openIndex();
 }
 let preservingView=false;
 const head=$('.site-head');if(head){const size=()=>document.documentElement.style.setProperty('--site-header-offset',Math.ceil(head.getBoundingClientRect().height)+'px');new ResizeObserver(size).observe(head);size()}
 if(document.body.classList.contains('v2-page')){
  const theme=$('#themeToggle'),independent=document.body.classList.contains('encyclopedia-site');
  const themeKey=independent?'p100-encyclopedia-theme':'p100-theme';
  let stored=independent?get(themeKey,null):null;
  if(!independent){try{stored=localStorage.getItem(themeKey)||get('p100-v2-theme',null)}catch{}}
  const valid=value=>value==='light'||value==='dark';
  const system=matchMedia('(prefers-color-scheme: dark)');
  document.documentElement.dataset.theme=valid(stored)?stored:(independent?'light':system.matches?'dark':'light');
  const sync=()=>theme?.setAttribute('aria-checked',String(document.documentElement.dataset.theme==='dark'));sync();
  theme?.addEventListener('click',()=>{
   const offset=head?.getBoundingClientRect().height||0;
   const anchor=$$('.book-chapter').filter(e=>!e.hidden&&e.getBoundingClientRect().top<=offset+100).at(-1);
   const top=anchor?.getBoundingClientRect().top;preservingView=!!anchor;
   const next=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=next;
   if(anchor){
    const restore=()=>window.scrollBy({top:anchor.getBoundingClientRect().top-top,behavior:'instant'});
    restore();requestAnimationFrame(()=>{restore();preservingView=false;window.dispatchEvent(new Event('scroll'))});
   }
   if(independent)set(themeKey,next);else{try{localStorage.setItem(themeKey,next)}catch{}}sync();
  });
 }
 {
  const menu=$('#siteMenuTab'),drawer=$('#siteDrawer'),back=$('#siteDrawerBackdrop');let opener,drawerPushed=false;
 addEventListener('popstate',()=>{if(drawer&&drawer.classList.contains('open'))close()});
  const close=()=>{drawer?.classList.remove('open');back?.classList.remove('open');drawer?.setAttribute('aria-hidden','true');if(drawer)drawer.inert=true;menu?.setAttribute('aria-expanded','false');document.body.style.overflow='';drawerPushed=false;opener?.focus()};
  const open=()=>{opener=document.activeElement;drawer?.classList.add('open');back?.classList.add('open');if(drawer)drawer.inert=false;drawer?.setAttribute('aria-hidden','false');menu?.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';$('#siteDrawerClose')?.focus();if(!drawerPushed){try{history.pushState({p100drawer:1},document.title)}catch{}drawerPushed=true}};
  if(drawer){drawer.inert=true;drawer.setAttribute('aria-hidden','true')}
  menu?.addEventListener('click',()=>drawer?.classList.contains('open')?close():open());back?.addEventListener('click',close);$('#siteDrawerClose')?.addEventListener('click',close);
  drawer?.addEventListener('click',e=>{if(e.target.closest('a'))close()});
  document.addEventListener('keydown',e=>{if(!drawer?.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='Tab'){const focus=$$('a,button',drawer).filter(x=>x.offsetParent!==null);if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===focus.at(-1)){e.preventDefault();focus[0]?.focus()}}});
 }
 const chapters=$$('.book-chapter');
 if(chapters.length){
  const search=$('#readerSearch'),facet=$('#readerCategory'),results=$('#readerResults'),links=$$('[data-chapter-link]'),progress=$('#readingProgress'),readerKey=document.body.classList.contains('encyclopedia-site')?'p100-encyclopedia':document.body.classList.contains('daily-page')?'p100-guidebook':'p100-'+location.pathname.split('/').pop(),readKey=readerKey+'-read',positionKey=readerKey+'-position';
  const savedRead=get(readKey,get('p100-v2-read',[]));
  const read=new Set((Array.isArray(savedRead)?savedRead:[]).filter(id=>chapters.some(c=>c.id===id)));
  links.forEach(a=>a.classList.toggle('read',read.has(a.dataset.chapterLink)));
  const resume=get(positionKey,get('p100-v2-position',null)),resumeBox=$('#resumeReading');if(resume&&resumeBox&&document.getElementById(resume.id)){resumeBox.hidden=false;const a=$('a',resumeBox);a.href='#'+resume.id;a.textContent='Continue: '+document.getElementById(resume.id).querySelector('h2')?.textContent;const dismiss=$('button',resumeBox);dismiss.addEventListener('click',()=>resumeBox.hidden=true)}
  let active='',ticking=false;
  const track=()=>{ticking=false;if(preservingView)return;const offset=head?.getBoundingClientRect().height||0,visible=chapters.filter(x=>!x.hidden);if(!visible.length)return;const reached=visible.filter(x=>x.getBoundingClientRect().top<=offset+100).at(-1),current=reached||visible[0];if(active!==current.id){active=current.id;links.forEach(a=>a.classList.toggle('active',a.dataset.chapterLink===active));event('chapter_start',{chapter:active})}if(reached)set(positionKey,{id:active});visible.forEach(x=>{if(x.getBoundingClientRect().bottom<offset+120&&!read.has(x.id)){read.add(x.id);set(readKey,[...read]);links.filter(a=>a.dataset.chapterLink===x.id).forEach(a=>a.classList.add('read'));event('chapter_finish',{chapter:x.id})}});if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%'}const status=$('#readerPosition');if(status)status.textContent=$('h2',current)?.textContent||''};
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(track)}},{passive:true});track();
  const clearMarks=()=>$$('.book-text mark').forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));
  const highlight=(node,query)=>{const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);const texts=[];while(walker.nextNode())texts.push(walker.currentNode);texts.forEach(t=>{const value=t.textContent,low=value.toLowerCase();if(!low.includes(query))return;const frag=document.createDocumentFragment();let start=0,pos;while((pos=low.indexOf(query,start))!==-1){frag.append(value.slice(start,pos));const mark=document.createElement('mark');mark.textContent=value.slice(pos,pos+query.length);frag.append(mark);start=pos+query.length}frag.append(value.slice(start));t.replaceWith(frag)})};
  let timer;
  const filter=()=>{clearMarks();const q=(search?.value||'').trim().toLowerCase(),cat=facet?.value||'all';let count=0;chapters.forEach(c=>{const match=(cat==='all'||c.dataset.category===cat)&&(!q||c.textContent.toLowerCase().includes(q));c.hidden=!match;if(match){count++;if(q)highlight($('.book-text',c),q)}});links.forEach(a=>a.hidden=!!document.getElementById(a.dataset.chapterLink)?.hidden);if(results)results.textContent=count?`${count} sections${q?' match “'+search.value.trim()+'”':''}.`:'No matching sections. Clear the search or choose another category.';track();if(q)event('reader_search',{matches:count})};
  search?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(filter,150)});facet?.addEventListener('change',filter);
  $$('[data-print-chapter]').forEach(b=>b.addEventListener('click',()=>{const c=document.getElementById(b.dataset.printChapter);if(!c)return;document.body.classList.add('print-one');c.classList.add('printing');$$('details',c).forEach(d=>d.open=true);window.print()}));
  addEventListener('afterprint',()=>{document.body.classList.remove('print-one');$$('.printing').forEach(x=>x.classList.remove('printing'))});
  $$('[data-chapter-link]').forEach(a=>a.addEventListener('click',()=>{$('.reader-mobile-index')?.removeAttribute('open')}));
 }
 const deck=$('#v2Deck');if(deck){
  const slides=$$('.deck-slide',deck),progress=$('#deckProgress'),label=$('#slideCount'),back=$('#slideBack'),next=$('#slideNext'),source=$('#slideSource');let index=0,start;
  const fromHash=()=>{const n=slides.findIndex(s=>'#'+s.id===location.hash);return n<0?0:n};
  const show=(n,update=true)=>{index=Math.max(0,Math.min(n,slides.length-1));slides.forEach((s,i)=>s.hidden=i!==index);label.textContent=`${index+1} of ${slides.length}`;progress.value=index+1;back.disabled=index===0;next.disabled=index===slides.length-1;source.href=slides[index].dataset.source;if(update)history.replaceState(null,'','#'+slides[index].id);if(index===slides.length-1)event('deck_complete');};
  deck.classList.add('is-enhanced');show(fromHash(),false);back.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));
  addEventListener('hashchange',()=>show(fromHash(),false));document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||e.target.isContentEditable)return;if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();show(index+1)}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();show(index-1)}});
  deck.addEventListener('touchstart',e=>{start={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}},{passive:true});deck.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.4)show(index+(dx<0?1:-1));start=null},{passive:true});
  let wheelTotal=0,lastWheel=0;deck.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();if(Date.now()-lastWheel<400)return;wheelTotal+=e.deltaX;if(Math.abs(wheelTotal)>90){show(index+(wheelTotal>0?1:-1));wheelTotal=0;lastWheel=Date.now()}},{passive:false});
  $('#slideShare')?.addEventListener('click',async()=>{const url=location.href;try{if(navigator.share)await navigator.share({title:'PROJECT 100 — '+$('h2',slides[index]).textContent,url});else{await navigator.clipboard.writeText(url);$('#shareStatus').textContent='Slide link copied.'}}catch{const status=$('#shareStatus');status.textContent='Slide link: '+url}});
 }
 const dayButtons=$$('[data-day]');if(dayButtons.length){const choose=day=>{if(!dayButtons.some(b=>b.dataset.day===day))day='training';document.body.classList.add('day-filtered');dayButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.day===day)));$$('.clock-card').forEach(c=>c.hidden=c.dataset.branch!==day);set('p100-v2-day',day);const label=$('#dayStatus');if(label)label.textContent=day==='training'?'Morning training · State A. V6 inactive.':day==='evening'?'Evening training · State C. V1 and V5 inactive.':'Rest · State B. V1, V2, V4 and V6 inactive; training pill grids skipped.'};dayButtons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.day)));choose(get('p100-v2-day','training'))}
 // Video covers remain playable with a keyboard as well as a tap.
 $$('.log-media[data-yt]').filter(el=>!el.closest('[data-loop-copy]')).forEach(el=>{if(el.hasAttribute('data-video-keyboard-ready'))return;el.setAttribute('data-video-keyboard-ready','');el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Play '+(el.closest('.log-card')?.querySelector('h4')?.textContent||'training video'));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}})});
})();

/* Smart Folders — progressive disclosure for long content blocks.
   Folds sections taller than SF_THRESHOLD on mobile (<=900px) into tappable
   folders with a smooth slide animation. Zero per-page markup: targets are
   detected at runtime. Opt out with data-sf="off", force open with
   data-sf="open", custom title with data-sf-title="...". */
(()=>{'use strict';
 const MOBILE_MQ=matchMedia('(max-width: 900px)');
 const THRESHOLD=480, FOLDED=new Set();
 const isMobile=()=>MOBILE_MQ.matches;
 const $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const cssHref='assets/css/smart-folders.css';
 if(!document.querySelector('link[href="'+cssHref+'"]')){
   const l=document.createElement('link');l.rel='stylesheet';l.href=cssHref;
   document.head.appendChild(l);
 }
 const headingOf=el=>{
   let h=el.querySelector(':scope > h1,:scope > h2,:scope > h3,:scope > h4')
        ||el.querySelector('h1,h2,h3,h4');
   if(!h){const p=el.previousElementSibling;if(p&&/^H[1-4]$/.test(p.tagName))h=p}
   if(!h)h=el.querySelector('caption');
   if(h)return h.textContent.trim().replace(/\s+/g,' ').slice(0,80);
   return el.getAttribute('data-sf-title')||'Details';
 };
 const itemCount=el=>{const n=el.querySelectorAll('ul > li, ol > li').length;return n>2?n:0};
 const foldable=el=>{
   if(el.hasAttribute('data-sf-fold'))return false;
   if(el.closest('[data-sf-fold]')||el.closest('details')||el.closest('#v2Deck'))return false;
   if(el.dataset.sf==='off')return false;
   return el.getBoundingClientRect().height>THRESHOLD;
 };
 const toggle=(wrap,force)=>{
   const open=force!==undefined?force:wrap.getAttribute('data-open')!=='true';
   wrap.setAttribute('data-open',String(open));
   wrap.querySelector('.sf-head').setAttribute('aria-expanded',String(open));
   updateExpandAll();
 };
 const fold=el=>{
   const wrap=document.createElement('div');
   wrap.className='sf-fold';wrap.setAttribute('data-sf-fold','');
   const startOpen=el.dataset.sf==='open';
   wrap.setAttribute('data-open',String(startOpen));
   if(el.id){wrap.id=el.id;el.removeAttribute('id')}
   const head=document.createElement('button');
   head.className='sf-head';head.type='button';
   head.setAttribute('aria-expanded',String(startOpen));
   const title=document.createElement('span');title.className='sf-title';
   title.textContent=headingOf(el);
   head.appendChild(title);
   const n=itemCount(el);
   if(n){const c=document.createElement('span');c.className='sf-count';c.textContent=n+' items';head.appendChild(c)}
   const hint=document.createElement('span');hint.className='sf-hint';hint.textContent='Tap to read';head.appendChild(hint);
   head.insertAdjacentHTML('beforeend','<svg class="sf-chev" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>');
   const body=document.createElement('div');body.className='sf-body';
   const inner=document.createElement('div');inner.className='sf-inner';
   el.replaceWith(wrap);inner.appendChild(el);body.appendChild(inner);
   wrap.appendChild(head);wrap.appendChild(body);
   head.addEventListener('click',()=>toggle(wrap));
   FOLDED.add(wrap);
 };
 const unfold=wrap=>{
   const el=wrap.querySelector(':scope > .sf-body > .sf-inner')?.firstElementChild;
   if(!el)return;
   if(wrap.id)el.id=wrap.id;
   wrap.replaceWith(el);FOLDED.delete(wrap);
 };
 const updateExpandAll=()=>{
   const btn=document.getElementById('sfExpandAll');
   if(!btn)return;
   const anyClosed=[...FOLDED].some(w=>w.getAttribute('data-open')!=='true');
   btn.classList.toggle('show',isMobile()&&FOLDED.size>=2);
   btn.querySelector('span').textContent=anyClosed?'Expand all':'Collapse all';
 };
 const ensureExpandAll=()=>{
   if(document.getElementById('sfExpandAll'))return;
   const b=document.createElement('button');
   b.id='sfExpandAll';b.className='sf-expandall';b.type='button';
   b.innerHTML='<span>Expand all</span>';
   b.addEventListener('click',()=>{
     const anyClosed=[...FOLDED].some(w=>w.getAttribute('data-open')!=='true');
     FOLDED.forEach(w=>toggle(w,anyClosed));
   });
   document.body.appendChild(b);
 };
 const openForHash=()=>{
   const id=location.hash.slice(1);if(!id)return;
   const t=document.getElementById(id);
   const wrap=t&&t.closest('[data-sf-fold]');
   if(wrap)toggle(wrap,true);
 };
 const SELECTORS='main article, main .book-chapter, main .addon-card, main table';
 const apply=()=>{
   if(!isMobile()){[...FOLDED].forEach(unfold);document.getElementById('sfExpandAll')?.remove();return}
   $$(SELECTORS).forEach(el=>{if(foldable(el))fold(el)});
   if(FOLDED.size)ensureExpandAll();
   updateExpandAll();openForHash();
 };
 let rT;
 addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(apply,250)});
 if(MOBILE_MQ.addEventListener)MOBILE_MQ.addEventListener('change',apply);
 addEventListener('hashchange',openForHash);
 requestAnimationFrame(()=>setTimeout(apply,60));
 addEventListener('load',apply);
})();

/* Mobile section rail: reliable tap-to-section jumps with header offset. */
(()=>{'use strict';
 const links=[...document.querySelectorAll('.folder-page-rail a.page-tab[href^="#"]')];
 if(!links.length)return;
 const head=()=>document.querySelector('.site-head');
 links.forEach(a=>a.addEventListener('click',e=>{
   const t=document.getElementById(a.getAttribute('href').slice(1));
   if(!t)return;
   e.preventDefault();
   const y=t.getBoundingClientRect().top+window.scrollY-(head()?.getBoundingClientRect().height||0)-12;
   window.scrollTo({top:Math.max(0,y),behavior:'smooth'});
   try{history.replaceState(null,'','#'+t.id)}catch{}
   links.forEach(x=>x.classList.toggle('current',x===a));
 }));
})();
