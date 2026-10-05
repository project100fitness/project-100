/* Native files remain usable without JS; enhance them with folding and cyclic slides. */
(()=>{
 const studio=document.querySelector('.vector-studio');if(!studio)return;
 const files=[...studio.querySelectorAll('.vector-stack-file')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function open(index){
  const target=files[(index+files.length)%files.length];
  files.forEach(file=>{file.open=file===target});
  target.querySelector('summary').focus({preventScroll:true});
  target.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
 }
 files.forEach((file,index)=>{
  file.style.scrollMarginTop='18px';
  file.addEventListener('toggle',()=>{
   if(file.open)files.forEach(other=>{if(other!==file)other.open=false});
   if(file.open&&!reduced.matches)file.querySelector('.stack-content').animate(
    [{opacity:0,transform:'perspective(900px) rotateX(-8deg) translateY(-8px)'},{opacity:1,transform:'perspective(900px) rotateX(0deg) translateY(0)'}],
    {duration:350,easing:'cubic-bezier(.2,.7,.2,1)'});
  });
  file.querySelectorAll('[data-stack-step]').forEach(button=>{
   button.hidden=false;
   button.addEventListener('click',()=>open(index+(button.dataset.stackStep==='next'?1:-1)));
  });
  file.querySelector('summary').addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   open(event.key==='Home'?0:event.key==='End'?files.length-1:index+(event.key==='ArrowRight'?1:-1));
  });
 });
})();
