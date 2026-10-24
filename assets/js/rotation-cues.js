/* Shared gallery indicators use the owning gallery's elapsed time. */
(()=>{'use strict';
const pendingPointers=new Set();
function releasePointers(){const pending=[...pendingPointers];pendingPointers.clear();pending.forEach(release=>release())}
for(const event of ['pointerup','pointercancel','blur'])window.addEventListener(event,releasePointers,{passive:true});
function item(node){if(!node)return null;const image=node.matches?.('img')?node:node.querySelector?.('img');return{title:node.querySelector?.('h3,h4,strong')?.textContent?.trim()||image?.alt||'',src:image?.getAttribute('src')||''}}
function sides({viewport,previous,next,touchTarget}){
 if(!viewport)return null;
 const frame=document.createElement('div');frame.className='rotation-viewport';viewport.before(frame);frame.append(viewport);
 const state={frame,touching:false};
 for(const [button,direction] of [[previous,'previous'],[next,'next']])if(button){button.classList.add('rotation-edge','rotation-edge--'+direction);frame.append(button)}
 let touch=false,pointer=false;
 function sync(){const on=touch||pointer;if(state.touching===on)return;state.touching=on;frame.dataset.touching=String(on);viewport.dispatchEvent(new Event('rotation:touch'))}
 (touchTarget||frame).addEventListener('touchstart',()=>{touch=true;sync()},{passive:true});
 for(const event of ['touchend','touchcancel'])(touchTarget||frame).addEventListener(event,e=>{touch=!!e.touches?.length;sync()},{passive:true});
 const release=()=>{pointer=false;sync()};
 (touchTarget||frame).addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'){pointer=true;pendingPointers.add(release);sync()}},{passive:true});
 return state;
}
function scrollEdges(viewport){
 if(!viewport||viewport._scrollEdges)return;
 const previous=document.createElement('button'),next=document.createElement('button');
 for(const [button,label,symbol] of [[previous,'Scroll left','←'],[next,'Scroll right','→']]){button.type='button';button.className='rotation-step';button.setAttribute('aria-label',label);button.title=label;button.textContent=symbol}
 const state=sides({viewport,previous,next});viewport._scrollEdges=state;
 const paint=()=>{const max=viewport.scrollWidth-viewport.clientWidth,active=viewport.scrollWidth>state.frame.clientWidth+3;state.frame.classList.toggle('rotation-viewport--bounded',active);previous.hidden=next.hidden=!active;previous.disabled=viewport.scrollLeft<=2;next.disabled=viewport.scrollLeft>=max-2};
 for(const [button,direction] of [[previous,-1],[next,1]])button.addEventListener('click',()=>viewport.scrollBy({left:direction*viewport.clientWidth*.75,behavior:'auto'}));
 viewport.addEventListener('scroll',paint,{passive:true});new ResizeObserver(paint).observe(viewport);new MutationObserver(paint).observe(viewport,{childList:true});paint();return state;
}
function create(options){
 const{host,previous,next,pause,position}=options;if(!host)return null;if(host._rotationCues)return host._rotationCues;
 const saved=[...host.children].filter(n=>![previous,next,pause,position,options.meter].includes(n));
 host.classList.add('rotation-controls');const center=document.createElement('div');center.className='rotation-controls__center';
 if(position){position.setAttribute('aria-live','off');center.append(position)}
 if(pause){pause.type='button';pause.className='rotation-pause';center.append(pause)}
 const meter=document.createElement('span'),fill=document.createElement('i');meter.className='rotation-progress';meter.setAttribute('aria-hidden','true');meter.append(fill);center.append(meter);
 function step(button,label,symbol){if(!button)return;button.type='button';button.className='rotation-step';button.textContent=symbol;button.setAttribute('aria-label',label);button.title=label}
 step(previous,options.previousLabel||'Previous items','←');step(next,options.nextLabel||'Next items','→');
 host.replaceChildren();host.append(center);
 const edges=sides({viewport:options.viewport,previous,next,touchTarget:options.touchTarget});if(edges){edges.frame.append(meter);center.classList.add('rotation-controls__center--edge')}if(!edges){if(previous)host.prepend(previous);if(next)host.append(next)}
 if(saved.length){const extra=document.createElement('div');extra.className='rotation-controls__extra';extra.append(...saved);host.append(extra)}
 if(options.meter){options.meter.hidden=true;host.append(options.meter)}
 let signature='',lastRange='',lastProgress=-1;const api={get touching(){return !!edges?.touching},update(state){
  const enabled=state.enabled!==false&&(state.total||0)>1,paused=!!state.paused,waiting=api.touching||paused||state.loading||state.waiting;
  const range=state.range||'',progress=Math.round(Math.max(0,Math.min(1,Number(state.progress)||0))*1000)/1000;
  if((!waiting||range!==lastRange)&&progress!==lastProgress){fill.style.transform='scaleX('+progress+')';lastProgress=progress}lastRange=range;
  meter.dataset.paused=String(!!waiting);meter.hidden=!enabled||state.progress===undefined;
  const key=[enabled,paused,range].join('|');if(key===signature)return;signature=key;
  const actions=saved.some(n=>n.matches('button,a')||n.querySelector('button,a'));host.hidden=!enabled&&!actions;center.hidden=!enabled;
  if(previous)previous.hidden=!enabled;if(next)next.hidden=!enabled;if(!enabled)return;
  if(position&&state.range){position.textContent=state.range.replace(/^(Cards|Techniques|Salads|Photos|Technique|Photo)\s+/i,'').replace(/\s+(?:of)\s+/,' / ');position.setAttribute('aria-label',state.range)}
  if(pause){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Play automatic changes':'Pause automatic changes');pause.title=paused?'Play automatic changes':'Pause automatic changes'}
  host.dataset.rotationState=paused?'paused':'running';
 },element:host};host._rotationCues=api;return api;
}
function autoplay(){try{return !matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('p100-motion-paused')==='false'}catch(_){return !matchMedia('(prefers-reduced-motion: reduce)').matches}}
window.P100Rotation={create,item,autoplay,sides,scrollEdges};
})();
