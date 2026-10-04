/* Decorative, silent loops: autoplay when visible, pause offscreen or in a hidden tab. */
(()=>{
 const clips=[...document.querySelectorAll('video[data-background-src]')];
 const visible=new Map(clips.map(video=>[video,false]));
 function update(video){
  if(!visible.get(video)||document.hidden){video.pause();return}
  video.muted=true;video.loop=true;video.playsInline=true;video.controls=false;
  if(!video.getAttribute('src'))video.src=video.dataset.backgroundSrc;
  else if(video.error)video.load();
  video.play().catch(()=>{}); // Browser playback restrictions fall back to the existing poster.
 }
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{visible.set(entry.target,entry.isIntersecting);update(entry.target)}),{threshold:0});
 clips.forEach(video=>{
  video.autoplay=true;video.muted=true;video.loop=true;video.playsInline=true;
  video.controls=false;observer.observe(video);
 });
 document.addEventListener('visibilitychange',()=>clips.forEach(update));
})();
