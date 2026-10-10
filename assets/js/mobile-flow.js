/* Fast vertical swipes advance one reading view; deliberate drags stay native. */
(function(){
 'use strict';
 var mobile=window.matchMedia('(max-width:719px),(max-width:1023px) and (pointer:coarse)'),gesture=null;
 var skip='a,button,input,select,textarea,summary,dialog,.ingredient-tip,.rail,[data-carousel],[data-recview],.salad-gallery,.scroller__track,.tabs';
 function offset(){var h=document.getElementById('siteHead'),bar=document.querySelector('.rail-toggle'),off=h&&h.getAttribute('data-hidden')!=='true'?h.getBoundingClientRect().height+12:12;if(bar&&bar.getBoundingClientRect().height)off=Math.max(off,bar.getBoundingClientRect().bottom+12);return off;}
 function destination(start,dir){
  var off=offset(),view=Math.max(180,window.innerHeight-off-24),max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight),stops=[0,max];
  document.querySelectorAll('.main>.hud-hero,.main>.page-hero,.main>.home-hero,.main>section,.main .hud-folder,.main .goalmeter').forEach(function(el){
   var r=el.getBoundingClientRect();if(!r.height)return;var top=Math.max(0,Math.min(max,window.scrollY+r.top-off)),end=Math.min(max,top+Math.max(0,r.height-view));
   stops.push(top);for(var y=top+view;y<end;y+=view)stops.push(y);if(end>top+40)stops.push(end);
  });
  stops.sort(function(a,b){return a-b;});
  var next=dir>0?stops.filter(function(y){return y>start+40;})[0]:stops.filter(function(y){return y<start-40;}).pop();
  if(next===undefined)next=dir>0?max:0;
  return Math.max(0,Math.min(max,dir>0?Math.min(next,start+view):Math.max(next,start-view)));
 }
 document.addEventListener('touchstart',function(e){
  gesture=null;if(!mobile.matches||e.touches.length!==1||document.querySelector('dialog[open]')||e.target.closest(skip))return;
  var t=e.touches[0];gesture={x:t.clientX,y:t.clientY,scroll:window.scrollY,time:performance.now()};
 },{passive:true});
 document.addEventListener('touchmove',function(e){if(e.touches.length!==1)gesture=null;},{passive:true});
 document.addEventListener('touchcancel',function(){gesture=null;},{passive:true});
 document.addEventListener('touchend',function(e){
  var g=gesture;gesture=null;if(!g||!mobile.matches||!e.changedTouches.length)return;
  var t=e.changedTouches[0],dy=t.clientY-g.y,dx=t.clientX-g.x,elapsed=performance.now()-g.time;
  if(elapsed>300||Math.abs(dy)<60||Math.abs(dy)<Math.abs(dx)*1.5||Math.abs(dy)/Math.max(1,elapsed)<.45)return;
  var target=destination(g.scroll,dy<0?1:-1);
  requestAnimationFrame(function(){window.scrollTo({top:window.scrollY,behavior:'instant'});window.scrollTo({top:target,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});});
 },{passive:true});
})();
