/* Nutrition owns the fullscreen shell; the isolated guide owns its content. */
(()=>{'use strict';const d=document.getElementById('creami-window');if(!d)return;
const palettes=['berry','blueberry','caramel'];let palette='berry';try{const saved=localStorage.getItem('p100-creami-palette');if(palettes.includes(saved))palette=saved}catch(e){}
const frame=d.querySelector('iframe');let trigger=null,pending={mode:'guide'},port=null;
const theme=()=>document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function send(){if(port)port.postMessage({type:'creami-view',...pending,theme:theme(),palette,motionPaused:!!window.P100?.motionPaused})}
function sendTheme(){port?.postMessage({type:'creami-theme',theme:theme(),palette,motionPaused:!!window.P100?.motionPaused})}
const menu=d.querySelector('[data-creami-palette-menu]');
function setPalette(value){if(!palettes.includes(value))return;palette=value;document.documentElement.dataset.creamiPalette=value;menu.querySelectorAll('input').forEach(input=>input.checked=input.value===value);try{localStorage.setItem('p100-creami-palette',value)}catch(e){}sendTheme()}
menu.addEventListener('change',e=>{if(e.target.matches('input'))setPalette(e.target.value)});
window.addEventListener('blur',()=>{if(document.activeElement===frame)menu.open=false});
menu.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){e.preventDefault();e.stopPropagation();menu.open=false;menu.querySelector('summary').focus()}});
document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))menu.open=false});
setPalette(palette);
function mode(value,page){pending={mode:value,page:page||1};d.querySelectorAll('[data-creami-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.creamiMode===value)));send()}
function open(button){trigger=button||document.querySelector('[data-creami-open]');if(!d.open){port?.close();port=null;mode('guide');if(window.P100&&P100.openDialog)P100.openDialog(d);else d.showModal();/* A fresh replacement avoids an iframe history step and a restored blank
 document when the parent dialog's Back entry is removed. */frame.contentWindow.location.replace('ninja-creami.html?embedded=1&v=6481db0be984')}else mode('guide')}
// Reveal once, then keep the card readable. Its decorative edge runs only while visible.
const entry=document.querySelector('.creami-entry');
if(entry){
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let visible=false;
 const syncEntry=()=>{entry.classList.toggle('is-motion-active',visible&&!document.hidden&&!reduced.matches&&!window.P100?.motionPaused);if(reduced.matches)entry.classList.add('is-in-view')};
 if('IntersectionObserver' in window){
  if(!reduced.matches)entry.classList.add('creami-entry--animated');
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)entry.classList.add('is-in-view');syncEntry()},{threshold:.15}).observe(entry);
 }else{visible=true;entry.classList.add('is-in-view');syncEntry()}
 document.addEventListener('visibilitychange',syncEntry);document.addEventListener('p100:motion',syncEntry);
 if(reduced.addEventListener)reduced.addEventListener('change',syncEntry);else reduced.addListener(syncEntry);
}

document.querySelectorAll('[data-creami-open]').forEach(b=>b.addEventListener('click',()=>open(b)));
d.querySelector('[data-creami-close]').addEventListener('click',()=>window.P100?.closeTopLayer?P100.closeTopLayer():d.close());
d.querySelectorAll('[data-creami-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.creamiMode)));
new MutationObserver(()=>{if(d.open)send()}).observe(d,{attributes:true,attributeFilter:['open']});
frame.addEventListener('load',send);document.addEventListener('p100:motion',()=>port?.postMessage({type:'creami-motion',paused:!!window.P100?.motionPaused}));
/* Authenticate the initial handshake, then use its private port. This also
   avoids relying on WindowProxy identity after focus changes in embedded views. */
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='creami-ready')return;port?.close();const channel=new MessageChannel();port=channel.port1;port.onmessage=event=>{const request=event.data;if(request?.type==='creami-book')mode(request.mode==='guide'?'guide':'book',request.page);if(request?.type==='creami-close'){if(window.P100?.closeTopLayer)P100.closeTopLayer();else d.close();}if(request?.type==='creami-motion-request'&&request.paused===false)window.P100?.setMotionPaused(false)};frame.contentWindow.postMessage({type:'creami-connect'},location.origin,[channel.port2]);send()});
d.addEventListener('close',()=>{menu.open=false;port?.postMessage({type:'creami-suspend'});trigger?.focus({preventScroll:true})});
new MutationObserver(sendTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',sendTheme);
if(new URLSearchParams(location.search).get('creami')==='open'){const u=new URL(location.href);u.searchParams.delete('creami');history.replaceState(history.state,'',u.pathname+u.search+u.hash);open()}
})();
