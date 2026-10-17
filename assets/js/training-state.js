/* One browser-local training record for sessions, guides, weekly notes and PDF exports. */
(function(){'use strict';
const KEY='project100-training-state-v2',OLD='project100-exercise-band-setups-v1';let memory=null;
function clean(value){const result={version:2,setups:{},notes:{}};if(!value||typeof value!=='object')return result;for(const[id,s]of Object.entries(value.setups||{})){if(!/^[a-zA-Z0-9-]{1,110}$/.test(id)||!s)continue;const level=Number(s.level);result.setups[id]={level:level>=1&&level<=3?level:1,bundle:String(s.bundle||'').slice(0,100)};}for(const[k,v]of Object.entries(value.notes||{}))if(/^weekly-day-[1-7]-notes$/.test(k))result.notes[k]=String(v||'').slice(0,2000);return result;}
function read(){try{const raw=localStorage.getItem(KEY);if(raw)return clean(JSON.parse(raw));return clean({setups:JSON.parse(localStorage.getItem(OLD)||'{}')});}catch(e){return memory||clean(null);}}
let state=read();function announce(id){window.dispatchEvent(new CustomEvent('p100:trainingchange',{detail:{id:id||null}}));}
function persist(id){memory=clean(state);try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}announce(id);}
const api={get(id){return {...(state.setups[id]||{level:1,bundle:''})};},set(id,patch){const candidate=clean({setups:{[id]:{...api.get(id),...patch}}});if(!candidate.setups[id])return;state.setups[id]=candidate.setups[id];persist(id);},note(key,value){if(!/^weekly-day-[1-7]-notes$/.test(key))return;state.notes[key]=String(value).slice(0,2000);persist(null);},snapshot(){return JSON.parse(JSON.stringify(state));},pdfValues(){return {...state.notes,'exercise-setups':JSON.parse(JSON.stringify(state.setups))};},import(value){state=clean(value);persist(null);},export(){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(api.snapshot(),null,2)],{type:'application/json'}));a.href=u;a.download='PROJECT100-my-training-setups.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}};
window.P100Training=api;window.addEventListener('storage',e=>{if(e.key===KEY){state=read();announce(null);}});
document.addEventListener('input',e=>{if(e.target.name&&/^weekly-day-[1-7]-notes$/.test(e.target.name))api.note(e.target.name,e.target.value);});
document.addEventListener('DOMContentLoaded',()=>{for(const el of document.querySelectorAll('textarea[name^="weekly-day-"]'))el.value=state.notes[el.name]||'';});
})();
