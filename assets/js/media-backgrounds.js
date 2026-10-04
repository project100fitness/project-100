/* Silent section loops. System preferences default to posters; explicit Play opts in. */
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const clips=[...document.querySelectorAll('video[data-background-src]')];
 const states=new Map(clips.map(video=>[video,{visible:false,paused:false,optedIn:false}]));
 function render(video){
  const state=states.get(video),section=video.closest('.has-section-motion'),button=section.querySelector(':scope > .motion-control');
  const blocked=(preference.matches||navigator.connection?.saveData)&&!state.optedIn;
  const paused=blocked||state.paused;
  section.dataset.motionPolicy=paused?'paused':'playing';
  button.textContent=paused?'Play background':'Pause background';
  button.setAttribute('aria-label',paused?'Play background animation':'Pause background animation');
  button.setAttribute('aria-pressed',String(paused));
  button.hidden=false;
  return blocked;
 }
 function update(video){
  const state=states.get(video),blocked=render(video);
  if(blocked||state.paused||!state.visible||document.hidden){video.pause();return}
  video.muted=true;
  if(!video.getAttribute('src'))video.src=video.dataset.backgroundSrc;
  else if(video.error)video.load();
  video.play().catch(error=>{
   // Scrolling offscreen while loading cancels play; that is not a user's pause.
   if(error.name==='AbortError'||!state.visible||document.hidden)return;
   state.paused=true;render(video);
  });
 }
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{states.get(entry.target).visible=entry.isIntersecting;update(entry.target)}),{threshold:0});
 clips.forEach(video=>{
  observer.observe(video);
  video.closest('.has-section-motion').querySelector(':scope > .motion-control').addEventListener('click',()=>{
   const state=states.get(video);
   if((preference.matches||navigator.connection?.saveData)&&!state.optedIn){state.optedIn=true;state.paused=false}
   else state.paused=!state.paused;
   update(video);
  });
  update(video);
 });
 document.addEventListener('visibilitychange',()=>clips.forEach(update));
 preference.addEventListener('change',()=>clips.forEach(update));
 navigator.connection?.addEventListener('change',()=>clips.forEach(update));
})();
