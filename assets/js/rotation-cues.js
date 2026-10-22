/* Shared presentation only. Each collection owner supplies its real clock,
   range and adjacent items; this component never advances a collection. */
(()=>{'use strict';
const text=(node,value)=>{if(node.textContent!==value)node.textContent=value};
function item(node){if(!node)return null;const image=node.matches?.('img')?node:node.querySelector?.('img'),video=node.querySelector?.('video');return {title:node.querySelector?.('.card__title,.file-card__title,h3,h4,strong,.hud-card__name')?.textContent?.trim()||image?.alt||node.getAttribute?.('aria-label')||'',src:image?.getAttribute('src')||image?.getAttribute('data-src')||video?.poster||''}}
function create(options){
 const {host,previous,next,pause,position}=options;if(!host)return null;
 if(host._rotationCues)return host._rotationCues;
 host.classList.add('rotation-controls');const center=document.createElement('div');center.className='rotation-controls__center';
 const status=document.createElement('span');status.className='rotation-controls__status';status.setAttribute('aria-live','off');
 const meter=options.meter||document.createElement('div');meter.classList.add('rotation-meter');meter.hidden=false;
 const native=meter.tagName==='PROGRESS';if(!native){meter.setAttribute('role','progressbar');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','100');if(!meter.firstElementChild)meter.append(document.createElement('span'))}
 meter.setAttribute('aria-label','Time until the next '+(options.unit||'items'));
 const middle=document.createElement('div');middle.className='rotation-controls__middle';if(position)middle.append(position);if(pause){pause.type='button';pause.className='rotation-pause';middle.append(pause);}
 center.append(middle,status,meter);
 const saved=[...host.children].filter(n=>![previous,next,pause,position,meter].includes(n));
 function setup(button,label){if(!button)return null;button.type='button';button.className='rotation-step';const im=document.createElement('img');im.alt='';im.hidden=true;im.loading='lazy';const copy=document.createElement('span'),name=document.createElement('b'),title=document.createElement('small');name.textContent=label;copy.append(name,title);button.replaceChildren(im,copy);button.setAttribute('aria-label',label);return{button,im,title}}
 const prev=setup(previous,options.previousLabel||'Previous items'),after=setup(next,options.nextLabel||'Next items');
 host.replaceChildren();if(previous)host.append(previous);else host.append(document.createElement('span'));host.append(center);if(next)host.append(next);else host.append(document.createElement('span'));
 if(saved.length){const extra=document.createElement('div');extra.className='rotation-controls__extra';extra.append(...saved);host.append(extra)}
 let lastPaint=0,lastStatus='';
 function peek(slot,value){if(!slot)return;const data=value?.nodeType?item(value):value;if(data?.src){if(slot.im.getAttribute('src')!==data.src)slot.im.src=data.src;slot.im.hidden=false}else slot.im.hidden=true;const title=data?.title?.trim()||'';text(slot.title,title);slot.title.hidden=!title;slot.button.title=(slot===prev?options.previousLabel||'Previous items':options.nextLabel||'Next items')+(title?': '+title:'');slot.button.setAttribute('aria-label',slot.button.title)}
 const api={update(state){
  const now=performance.now();if(!state.force&&now-lastPaint<100)return;lastPaint=now;
  const total=state.total||0,unit=state.unit||options.unit||'items',enabled=state.enabled!==false&&total>1;
  const actions=saved.some(n=>n.matches('button,a')||n.querySelector('button,a'));host.hidden=!enabled&&!actions;center.hidden=!enabled;if(previous)previous.hidden=!enabled;if(next)next.hidden=!enabled;if(!enabled)return;
  const fraction=Math.max(0,Math.min(1,state.progress||0));
  if(native)meter.value=fraction*(Number(meter.max)||1);else{meter.firstElementChild.style.transform='scaleX('+fraction+')';meter.setAttribute('aria-valuenow',String(Math.round(fraction*100)))}
  const seconds=Math.max(1,Math.ceil((state.remaining||0)/1000));let message;
  if(state.loading)message='Loading next '+unit+'…';else if(state.changing)message='Changing '+unit+'…';else if(state.paused)message='Auto-change paused · choose Next';else if(state.resume>0)message='Auto-change resumes in '+Math.ceil(state.resume/1000)+'s';else if(state.waiting)message=state.waiting;else message=(state.action||'Next '+unit)+' in '+seconds+'s';
  if(message!==lastStatus){text(status,message);meter.setAttribute('aria-valuetext',message);lastStatus=message}
  host.dataset.rotationState=state.loading?'loading':state.changing?'changing':state.paused?'paused':state.resume>0?'holding':state.waiting?'waiting':'running';
  if(pause){text(pause,state.paused?'Resume auto-change':'Pause auto-change');pause.setAttribute('aria-pressed',String(!!state.paused));pause.setAttribute('aria-label',state.paused?'Resume automatic '+unit+' changes':'Pause automatic '+unit+' changes')}
  if(state.range&&position)text(position,state.range);
  if(state.previous!==undefined)peek(prev,state.previous);if(state.next!==undefined)peek(after,state.next);
 },element:host};host._rotationCues=api;return api;
}
window.P100Rotation={create,item};
})();
