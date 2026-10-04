/* Decorative loops are silent, visible-only, and opt out for reduced motion/data saving. */
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const clips=[...document.querySelectorAll('video[data-background-src]')];
 const states=new Map(clips.map(video=>[video,{visible:false,paused:false}]));
 function update(video){
  const state=states.get(video),button=video.closest('.has-section-motion').querySelector('.motion-control');
  const blocked=preference.matches||navigator.connection?.saveData;
  button.hidden=!!blocked;
  button.textContent=state.paused?'Play motion':'Pause motion';
  button.setAttribute('aria-label',state.paused?'Play background animation':'Pause background animation');
  button.setAttribute('aria-pressed',String(state.paused));
  if(blocked||state.paused||!state.visible||document.hidden){video.pause();return}
  video.muted=true;
  if(!video.getAttribute('src'))video.src=video.dataset.backgroundSrc;
  video.play().catch(()=>{state.paused=true;button.textContent='Play motion';button.setAttribute('aria-label','Play background animation');button.setAttribute('aria-pressed','true')});
 }
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{states.get(entry.target).visible=entry.isIntersecting;update(entry.target)}),{threshold:.15});
 clips.forEach(video=>{observer.observe(video);video.closest('.has-section-motion').querySelector('.motion-control').addEventListener('click',()=>{const state=states.get(video);state.paused=!state.paused;update(video)});update(video)});
 document.addEventListener('visibilitychange',()=>clips.forEach(update));
 preference.addEventListener('change',()=>clips.forEach(update));
})();
