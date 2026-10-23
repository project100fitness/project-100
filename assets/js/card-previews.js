/* Existing folder rails: gentle previews, explicit controls, native links and swipes. */
(function(){'use strict';
 let keyboardInteraction=false;document.addEventListener('keydown',e=>{if(e.key==='Tab'||e.key.startsWith('Arrow'))keyboardInteraction=true;},true);document.addEventListener('pointerdown',()=>keyboardInteraction=false,true);document.addEventListener('touchstart',()=>keyboardInteraction=false,{capture:true,passive:true});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),known=new WeakSet(),states=new Set();
 function attach(rail){
  if(rail.hasAttribute('data-group-carousel')||known.has(rail))return;known.add(rail);
  const section=rail.closest('.library-muscle-section'),entry=rail.classList.contains('exercise-entry-grid');
  let controls=section?.querySelector('.library-group-controls'),count=section?.querySelector('[data-group-position]');
  if(!controls){controls=document.createElement('div');controls.className='card-preview-bar';controls.innerHTML='<span class="card-preview-hint">'+(entry?'Swipe folders':'Swipe exercises')+'</span><button type="button" data-preview-step="-1" aria-label="Previous cards">←</button><span data-preview-position></span><button type="button" data-preview-step="1" aria-label="Next cards">→</button>';rail.before(controls);count=controls.querySelector('[data-preview-position]');}
  const pauseButton=document.createElement('button');controls.append(pauseButton);const cues=P100Rotation.create({host:controls,previous:controls.querySelector('[data-preview-step="-1"]'),next:controls.querySelector('[data-preview-step="1"]'),pause:pauseButton,position:count,unit:'folders',previousLabel:'Previous folders',nextLabel:'Next folders'});const state={rail,controls,cues,paused:!P100Rotation.autoplay(),last:performance.now(),inside:false,touching:false};pauseButton.onclick=()=>{if(window.P100?.motionPaused){window.P100.setMotionPaused(false);state.paused=false;}else state.paused=!state.paused;state.last=performance.now()};states.add(state);
  // Interactions defer the next preview; none permanently stop its loop.
  function pause(){state.last=performance.now();}
  function step(direction){const first=rail.firstElementChild;if(!first)return;const gap=parseFloat(getComputedStyle(rail).columnGap)||0,size=first.getBoundingClientRect().width+gap,max=rail.scrollWidth-rail.clientWidth;
   const target=direction>0?(rail.scrollLeft>=max-2?0:Math.min(max,rail.scrollLeft+size)):(rail.scrollLeft<=2?max:Math.max(0,rail.scrollLeft-size));
   rail.scrollTo({left:target,behavior:reduced.matches?'auto':'smooth'});pause();}
  function update(){
   const overflowing=rail.clientWidth>0&&rail.scrollWidth>rail.clientWidth+3;
   if(!section){controls.hidden=!overflowing;const first=rail.firstElementChild;if(!first||!rail.clientWidth)return;const gap=parseFloat(getComputedStyle(rail).columnGap)||0,size=first.getBoundingClientRect().width+gap,rows=1,start=Math.round(rail.scrollLeft/size)*rows,total=rail.children.length,visible=Math.max(rows,Math.round((rail.clientWidth+gap)/size)*rows);count.textContent=(start+1)+(visible>1?'–'+Math.min(total,start+visible):'')+' / '+total;controls.querySelectorAll('[data-preview-step]').forEach(b=>b.disabled=false);}
  }
  controls.addEventListener('pointerdown',pause,{passive:true});
  controls.querySelectorAll('[data-preview-step]').forEach(b=>b.addEventListener('click',()=>step(Number(b.dataset.previewStep))));
  ['pointerdown','wheel','keydown','focusin'].forEach(name=>rail.addEventListener(name,pause,{passive:true}));
  rail.addEventListener('touchstart',()=>{state.touching=true;pause();},{passive:true});
  ['touchend','touchcancel'].forEach(name=>rail.addEventListener(name,()=>{state.touching=false;pause();},{passive:true}));
  rail.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')state.inside=true;});
  rail.addEventListener('pointerleave',()=>{state.inside=false;pause();});
  rail.addEventListener('scroll',update,{passive:true});new MutationObserver(()=>{if(rail.hasAttribute('data-session-choices')&&rail.clientWidth){const active=rail.querySelector('[aria-current=step]');if(active){const a=active.getBoundingClientRect(),r=rail.getBoundingClientRect();if(a.left<r.left)rail.scrollTo({left:rail.scrollLeft+a.left-r.left,behavior:'auto'});else if(a.right>r.right)rail.scrollTo({left:rail.scrollLeft+a.right-r.right,behavior:'auto'});}}update();}).observe(rail,{childList:true});if(window.ResizeObserver)new ResizeObserver(update).observe(rail);
  state.step=step;update();
 }
 function scan(){document.querySelectorAll('[data-group-carousel],.exercise-entry-grid').forEach(attach);}
 document.addEventListener('p100:motion',()=>{if(!window.P100?.motionPaused)for(const s of states){s.paused=false;s.last=performance.now();}});
 scan();const library=document.querySelector('#p100-library-grid');if(library)new MutationObserver(scan).observe(library,{childList:true});
 setInterval(()=>{const now=performance.now();for(const s of states){if(!s.rail.isConnected){states.delete(s);continue;}const first=s.rail.firstElementChild,gap=parseFloat(getComputedStyle(s.rail).columnGap)||0,size=(first?.getBoundingClientRect().width||1)+gap,start=Math.floor(s.rail.scrollLeft/size),visible=Math.max(1,Math.round(s.rail.clientWidth/size)),items=[...s.rail.children];s.cues.update({enabled:s.rail.scrollWidth>s.rail.clientWidth+3,total:items.length,progress:s.paused||window.P100?.motionPaused?0:(now-s.last)/5500,remaining:s.paused||window.P100?.motionPaused?5500:5500-(now-s.last),paused:s.paused||window.P100?.motionPaused,waiting:s.inside||(keyboardInteraction&&s.rail.contains(document.activeElement))?'Paused while you explore':null,previous:items[Math.max(0,start-1)],next:items[(start+visible)%items.length]});const r=s.rail.getBoundingClientRect(),head=document.querySelector('.site-head')?.getBoundingClientRect().bottom||0;if(window.P100?.motionPaused||document.hidden||document.querySelector('dialog[open]')||s.touching||s.inside||(keyboardInteraction&&s.rail.contains(document.activeElement))||s.paused||!r.width||Math.min(r.bottom,innerHeight-60)-Math.max(r.top,head)<r.height*.5||s.rail.scrollWidth<=s.rail.clientWidth+3){s.last=now;continue;}if(now-s.last>=5500)s.step(1);}},250);
})();
