/* Nutrition owns the fullscreen shell; the isolated guide owns its content. */
(()=>{'use strict';const d=document.getElementById('creami-window');if(!d)return;
const frame=d.querySelector('iframe');let trigger=null,pending={mode:'guide'},port=null;
const theme=()=>document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function send(){if(port)port.postMessage({type:'creami-view',...pending,theme:theme()})}
function sendTheme(){port?.postMessage({type:'creami-theme',theme:theme()})}
function mode(value,page){pending={mode:value,page:page||1};d.querySelectorAll('[data-creami-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.creamiMode===value)));send()}
function open(button){trigger=button||document.querySelector('[data-creami-open]');if(!d.open){port?.close();port=null;mode('guide');if(window.P100&&P100.openDialog)P100.openDialog(d);else d.showModal();/* A fresh replacement avoids an iframe history step and a restored blank
 document when the parent dialog's Back entry is removed. */frame.contentWindow.location.replace('ninja-creami.html?embedded=1')}else mode('guide')}
const entry=document.querySelector('.creami-entry');if(entry&&'IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){entry.classList.add('creami-entry--animated');new IntersectionObserver(es=>entry.classList.toggle('is-in-view',es[0].isIntersecting),{threshold:.12}).observe(entry)}
document.querySelectorAll('[data-creami-open]').forEach(b=>b.addEventListener('click',()=>open(b)));
d.querySelector('[data-creami-close]').addEventListener('click',()=>d.close());
d.querySelectorAll('[data-creami-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.creamiMode)));
frame.addEventListener('load',send);
/* Authenticate the initial handshake, then use its private port. This also
   avoids relying on WindowProxy identity after focus changes in embedded views. */
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='creami-ready')return;port?.close();const channel=new MessageChannel();port=channel.port1;port.onmessage=event=>{const request=event.data;if(request?.type==='creami-book')mode(request.mode==='guide'?'guide':'book',request.page);if(request?.type==='creami-close')d.close()};frame.contentWindow.postMessage({type:'creami-connect'},location.origin,[channel.port2]);send()});
d.addEventListener('close',()=>{port?.postMessage({type:'creami-suspend'});trigger?.focus({preventScroll:true})});
new MutationObserver(sendTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',sendTheme);
if(new URLSearchParams(location.search).get('creami')==='open'){const u=new URL(location.href);u.searchParams.delete('creami');history.replaceState(history.state,'',u.pathname+u.search+u.hash);open()}
})();
