/* Small static-site enhancements. All source text and downloads work without JS. */
(()=>{'use strict';
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const get=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
 // Integration hook for a future privacy-respecting analytics service; no remote tracking.
 const event=(name,detail={})=>document.dispatchEvent(new CustomEvent('project100:event',{detail:{name,...detail}}));
 $$('[data-door]').forEach(a=>a.addEventListener('click',()=>event('door_click',{door:a.dataset.door})));
 $$('a[download]').forEach(a=>a.addEventListener('click',()=>event('download',{file:a.getAttribute('href')})));
 const head=$('.site-head');if(head){const size=()=>document.documentElement.style.setProperty('--site-header-offset',Math.ceil(head.getBoundingClientRect().height)+'px');new ResizeObserver(size).observe(head);size()}
 if(document.body.classList.contains('v2-page')){
  const theme=$('#themeToggle'),stored=get('p100-v2-theme',null);if(stored)document.documentElement.dataset.theme=stored;
  const sync=()=>theme?.setAttribute('aria-checked',String(document.documentElement.dataset.theme!=='light'));sync();
  theme?.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=next;set('p100-v2-theme',next);sync()});
 }
 {
  const menu=$('#siteMenuTab'),drawer=$('#siteDrawer'),back=$('#siteDrawerBackdrop');let opener;
  const close=()=>{drawer?.classList.remove('open');back?.classList.remove('open');drawer?.setAttribute('aria-hidden','true');if(drawer)drawer.inert=true;menu?.setAttribute('aria-expanded','false');document.body.style.overflow='';opener?.focus()};
  const open=()=>{opener=document.activeElement;drawer?.classList.add('open');back?.classList.add('open');if(drawer)drawer.inert=false;drawer?.setAttribute('aria-hidden','false');menu?.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';$('#siteDrawerClose')?.focus()};
  if(drawer){drawer.inert=true;drawer.setAttribute('aria-hidden','true')}
  menu?.addEventListener('click',()=>drawer?.classList.contains('open')?close():open());back?.addEventListener('click',close);$('#siteDrawerClose')?.addEventListener('click',close);
  drawer?.addEventListener('click',e=>{if(e.target.closest('a'))close()});
  document.addEventListener('keydown',e=>{if(!drawer?.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='Tab'){const focus=$$('a,button',drawer).filter(x=>x.offsetParent!==null);if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===focus.at(-1)){e.preventDefault();focus[0]?.focus()}}});
 }
 const chapters=$$('.book-chapter');
 if(chapters.length){
  const search=$('#readerSearch'),facet=$('#readerCategory'),results=$('#readerResults'),links=$$('[data-chapter-link]'),progress=$('#readingProgress'),read=new Set(get('p100-v2-read',[]));
  links.forEach(a=>a.classList.toggle('read',read.has(a.dataset.chapterLink)));
  const resume=get('p100-v2-position',null),resumeBox=$('#resumeReading');if(resume&&resumeBox&&document.getElementById(resume.id)){resumeBox.hidden=false;const a=$('a',resumeBox);a.href='#'+resume.id;a.textContent='Continue: '+$('#'+resume.id+' h2')?.textContent;const dismiss=$('button',resumeBox);dismiss.addEventListener('click',()=>resumeBox.hidden=true)}
  let active='',ticking=false;
  const track=()=>{ticking=false;const offset=head?.getBoundingClientRect().height||0,visible=chapters.filter(x=>!x.hidden);if(!visible.length)return;const current=visible.filter(x=>x.getBoundingClientRect().top<=offset+100).at(-1)||visible[0];if(active!==current.id){active=current.id;links.forEach(a=>a.classList.toggle('active',a.dataset.chapterLink===active));set('p100-v2-position',{id:active});event('chapter_start',{chapter:active})}visible.forEach(x=>{if(x.getBoundingClientRect().bottom<offset+120&&!read.has(x.id)){read.add(x.id);set('p100-v2-read',[...read]);links.filter(a=>a.dataset.chapterLink===x.id).forEach(a=>a.classList.add('read'));event('chapter_finish',{chapter:x.id})}});if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%'}const status=$('#readerPosition');if(status)status.textContent=$('h2',current)?.textContent||''};
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
 const dayButtons=$$('[data-day]');if(dayButtons.length){const choose=day=>{document.body.classList.add('day-filtered');dayButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.day===day)));$$('.clock-card').forEach(c=>c.hidden=c.dataset.branch!==day);set('p100-v2-day',day);const label=$('#dayStatus');if(label)label.textContent=day==='training'?'Morning training day selected.':'Rest day selected. Training pill grids skipped.'};dayButtons.forEach(b=>b.addEventListener('click',()=>choose(b.dataset.day)));choose(get('p100-v2-day','training'))}
 // Video covers remain playable with a keyboard as well as a tap.
 $$('.log-media[data-yt]').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Play '+(el.closest('.log-card')?.querySelector('h4')?.textContent||'training video'));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}})});
})();
