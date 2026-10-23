/* Compact shared navigation. Collection owners keep their own playback state. */
(()=>{'use strict';
function item(node){if(!node)return null;const image=node.matches?.('img')?node:node.querySelector?.('img');return{title:node.querySelector?.('h3,h4,strong')?.textContent?.trim()||image?.alt||'',src:image?.getAttribute('src')||''}}
function create(options){
 const{host,previous,next,pause,position}=options;if(!host)return null;if(host._rotationCues)return host._rotationCues;
 const saved=[...host.children].filter(n=>![previous,next,pause,position,options.meter].includes(n));
 host.classList.add('rotation-controls');const center=document.createElement('div');center.className='rotation-controls__center';
 if(position){position.setAttribute('aria-live','off');center.append(position)}
 if(pause){pause.type='button';pause.className='rotation-pause';center.append(pause)}
 function step(button,label,symbol){if(!button)return;button.type='button';button.className='rotation-step';button.textContent=symbol;button.setAttribute('aria-label',label);button.title=label}
 step(previous,options.previousLabel||'Previous items','←');step(next,options.nextLabel||'Next items','→');
 host.replaceChildren();if(previous)host.append(previous);host.append(center);if(next)host.append(next);
 if(saved.length){const extra=document.createElement('div');extra.className='rotation-controls__extra';extra.append(...saved);host.append(extra)}
 // Existing showcase owners may still reference their original progress element.
 if(options.meter){options.meter.hidden=true;host.append(options.meter)}
 let signature='';const api={update(state){
  const enabled=state.enabled!==false&&(state.total||0)>1,paused=!!state.paused;
  const key=[enabled,paused,state.range||''].join('|');if(key===signature)return;signature=key;
  const actions=saved.some(n=>n.matches('button,a')||n.querySelector('button,a'));host.hidden=!enabled&&!actions;center.hidden=!enabled;
  if(previous)previous.hidden=!enabled;if(next)next.hidden=!enabled;if(!enabled)return;
  if(position&&state.range){position.textContent=state.range.replace(/^(Cards|Techniques|Salads|Photos|Technique|Photo)\s+/i,'').replace(/\s+(?:of)\s+/,' / ');position.setAttribute('aria-label',state.range)}
  if(pause){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Play automatic changes':'Pause automatic changes');pause.title=paused?'Play automatic changes':'Pause automatic changes'}
  host.dataset.rotationState=paused?'paused':'running';
 },element:host};host._rotationCues=api;return api;
}
function autoplay(){try{return !matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('p100-motion-paused')==='false'}catch(_){return !matchMedia('(prefers-reduced-motion: reduce)').matches}}
window.P100Rotation={create,item,autoplay};
})();
