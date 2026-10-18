/* Illustrated movement showcase. Autoplay runs only while visible and respects reduced motion. */
(function(){'use strict';const root=document.querySelector('[data-kin-showcase]');if(!root)return;
const base='assets/media/workout-guides/',slides=[
 ['row','row-plyosoft-box-v2-personal-v1.jpg','Box-supported one-arm row'],
 ['press','press-plyosoft-box-v2-personal-v1.jpg','Supported single-arm chest press'],
 ['pressdown','pressdown-plyosoft-box-v2-personal-v1.jpg','Seated straight-bar pressdown'],
 ['standing-curl','standing-alternating-curl-connections-v3-personal-v1.jpg','Standing alternating curl'],
 ['shoulder-band-bar-squat','shoulder-band-bar-squat-matched-pairs-v2-personal-v1.jpg','Pilates bar squat'],
 ['pilates-row','pilates-row-matched-pair-v1-personal-v1.jpg','Pilates matched-pair row']
];
const image=root.querySelector('img'),link=root.querySelector('[data-showcase-link]'),caption=root.querySelector('figcaption'),counter=root.querySelector('[data-showcase-count]'),toggle=root.querySelector('[data-showcase-toggle]'),dots=root.querySelector('[data-showcase-dots]'),motion=matchMedia('(prefers-reduced-motion: reduce)');let index=0,playing=!motion.matches,elapsed=0,lastTick=Date.now();
dots.innerHTML=slides.map((s,i)=>'<button type="button" data-showcase-slide="'+i+'" aria-label="Show '+s[2]+'" aria-pressed="'+(i===0)+'"></button>').join('');
function controls(){toggle.hidden=true;}
function show(n,manual){index=(n+slides.length)%slides.length;elapsed=0;root.querySelector('progress').value=0;lastTick=Date.now();const s=slides[index];image.src=base+s[1];image.alt=s[2]+' — start and finish, personal anatomical profile';link.href='downloads/kinetics/guide-'+s[0]+'.html';link.dataset.kdOpen=s[0];link.setAttribute('aria-label','Open '+s[2]+' guide');caption.textContent=s[2]+' / START → FINISH';counter.textContent=(index+1)+' / '+slides.length;dots.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));if(!motion.matches)image.animate([{opacity:.35},{opacity:1}],{duration:450,easing:'ease-out'});controls();}
root.querySelector('[data-showcase-prev]').onclick=()=>show(index-1,true);root.querySelector('[data-showcase-next]').onclick=()=>show(index+1,true);toggle.onclick=()=>{playing=!playing;elapsed=0;lastTick=Date.now();controls();};dots.onclick=e=>{const b=e.target.closest('[data-showcase-slide]');if(b)show(Number(b.dataset.showcaseSlide),true);};
root.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1),true);}});
let start=null;root.addEventListener('touchstart',e=>start={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY},{passive:true});root.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1),true);start=null;},{passive:true});

motion.addEventListener('change',()=>{if(motion.matches)playing=false;controls();});setInterval(()=>{const now=Date.now(),delta=now-lastTick;lastTick=now;const box=root.getBoundingClientRect(),onScreen=box.bottom>0&&box.top<innerHeight&&box.right>0&&box.left<innerWidth;if(playing&&onScreen&&!document.hidden){elapsed+=Math.min(delta,1000);root.querySelector('progress').value=elapsed;if(elapsed>=6500)show(index+1,false);}},250);show(0,false);
})();
