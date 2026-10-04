document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.era-scroll').forEach(row=>{
  if(row.dataset.loopReady)return;
  const wrap=document.createElement('div');wrap.className='carousel-wrap';row.before(wrap);wrap.append(row);
  row.style.margin='24px 0 18px';
  ['left','right'].forEach(dir=>{const b=document.createElement('button');b.type='button';b.className='carousel-arrow '+dir;b.setAttribute('aria-label','Explore journey '+dir);b.innerHTML=dir==='left'?'‹':'›';wrap.append(b)});
  window.ProjectCarousel.wireRow(wrap,row,'Personal journey chapters');
 });
});
