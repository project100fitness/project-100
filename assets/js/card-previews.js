/* Existing folder rails: gentle previews, explicit controls, native links and swipes. */
(function(){'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),known=new WeakSet(),states=new Set();
 function attach(rail){
  if(known.has(rail))return;known.add(rail);
  const section=rail.closest('.library-muscle-section'),entry=rail.classList.contains('exercise-entry-grid');
  let controls=section?.querySelector('.library-group-controls'),count=section?.querySelector('[data-group-position]');
  if(!controls){controls=document.createElement('div');controls.className='card-preview-bar';controls.innerHTML='<span class="card-preview-hint">'+(entry?'Swipe folders':'Swipe exercises')+'</span><button type="button" data-preview-step="-1" aria-label="Previous cards">←</button><span data-preview-position></span><button type="button" data-preview-step="1" aria-label="Next cards">→</button>';rail.before(controls);count=controls.querySelector('[data-preview-position]');}
  const toggle=document.createElement('button');toggle.type='button';toggle.className='card-preview-toggle';controls.insertBefore(toggle,controls.lastElementChild);
  const state={rail,controls,toggle,playing:!reduced.matches,last:performance.now(),inside:false};states.add(state);
  function toggleLabel(){toggle.textContent=state.playing?'Pause':'Play';toggle.setAttribute('aria-label',(state.playing?'Pause':'Play')+' card preview');toggle.setAttribute('aria-pressed',String(state.playing));}
  function pause(){state.playing=false;rail.scrollTo({left:rail.scrollLeft,behavior:'auto'});toggleLabel();}
  function step(direction,automatic){const first=rail.firstElementChild;if(!first)return;const gap=parseFloat(getComputedStyle(rail).columnGap)||0,size=first.getBoundingClientRect().width+gap,max=rail.scrollWidth-rail.clientWidth;if(!automatic)pause();rail.scrollTo({left:automatic&&rail.scrollLeft>=max-2?0:Math.max(0,Math.min(max,rail.scrollLeft+direction*size)),behavior:reduced.matches||(automatic&&rail.scrollLeft>=max-2)?'auto':'smooth'});state.last=performance.now();}
  function update(){
   const overflowing=rail.clientWidth>0&&rail.scrollWidth>rail.clientWidth+3;toggle.hidden=!overflowing;
   if(!section){controls.hidden=!overflowing;const first=rail.firstElementChild;if(!first||!rail.clientWidth)return;const gap=parseFloat(getComputedStyle(rail).columnGap)||0,size=first.getBoundingClientRect().width+gap,rows=1,start=Math.round(rail.scrollLeft/size)*rows,total=rail.children.length,visible=Math.max(rows,Math.round((rail.clientWidth+gap)/size)*rows);count.textContent=(start+1)+(visible>1?'–'+Math.min(total,start+visible):'')+' / '+total;controls.querySelector('[data-preview-step="-1"]').disabled=rail.scrollLeft<2;controls.querySelector('[data-preview-step="1"]').disabled=rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2;}
  }
  toggle.addEventListener('click',()=>{state.playing=!state.playing;state.last=performance.now();toggleLabel();});
  controls.addEventListener('pointerdown',e=>{if(e.target!==toggle&&!toggle.contains(e.target))pause();},{passive:true});
  controls.querySelectorAll('[data-preview-step]').forEach(b=>b.addEventListener('click',()=>step(Number(b.dataset.previewStep),false)));
  ['pointerdown','touchstart','wheel','keydown'].forEach(name=>rail.addEventListener(name,pause,{passive:true}));
  rail.addEventListener('focusin',pause);rail.addEventListener('mouseenter',()=>state.inside=true);rail.addEventListener('mouseleave',()=>{state.inside=false;state.last=performance.now();});
  rail.addEventListener('scroll',update,{passive:true});new MutationObserver(()=>{if(rail.hasAttribute('data-session-choices')&&rail.clientWidth){const active=rail.querySelector('[aria-current=step]');if(active){const a=active.getBoundingClientRect(),r=rail.getBoundingClientRect();if(a.left<r.left)rail.scrollTo({left:rail.scrollLeft+a.left-r.left,behavior:'auto'});else if(a.right>r.right)rail.scrollTo({left:rail.scrollLeft+a.right-r.right,behavior:'auto'});}}update();}).observe(rail,{childList:true});if(window.ResizeObserver)new ResizeObserver(update).observe(rail);
  state.step=step;toggleLabel();update();
 }
 function scan(){document.querySelectorAll('[data-group-carousel],.exercise-entry-grid,[data-session-choices]').forEach(attach);}
 scan();const library=document.querySelector('#p100-library-grid');if(library)new MutationObserver(scan).observe(library,{childList:true});
 reduced.addEventListener('change',()=>states.forEach(s=>{if(reduced.matches){s.playing=false;s.toggle.textContent='Play';s.toggle.setAttribute('aria-label','Play card preview');s.toggle.setAttribute('aria-pressed','false');}}));
 setInterval(()=>{const now=performance.now();for(const s of states){if(!s.rail.isConnected){states.delete(s);continue;}const r=s.rail.getBoundingClientRect(),head=document.querySelector('.site-head')?.getBoundingClientRect().bottom||0;if(document.hidden||document.querySelector('dialog[open]')||s.inside||!s.playing||!r.width||Math.min(r.bottom,innerHeight-60)-Math.max(r.top,head)<r.height*.5||s.rail.scrollWidth<=s.rail.clientWidth+3){s.last=now;continue;}if(now-s.last>=5500)s.step(1,true);}},250);
})();
