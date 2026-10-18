/* Workout publication browser; uses the site's native dialog/back-button behavior. */
(function(){
"use strict";
var dialog=document.getElementById("kinDownloadModal");
if(!dialog||typeof dialog.showModal!=="function")return;
// The published HTML owns document links, order and labels.
var documents=Array.from(dialog.querySelectorAll("[data-kd-doc]")).map(function(b){return {id:b.dataset.kdDoc,title:b.querySelector("b").textContent,category:b.dataset.kdCategory,eyebrow:b.querySelector("small").textContent,detail:b.querySelector("em").textContent,preview:b.dataset.kdPreview,pdf:b.dataset.kdPdf,note:b.dataset.kdNote};});
if(!documents.length)return;
var frame=dialog.querySelector("[data-kd-frame]"),selected=documents[0],filtered=documents.slice(),lastOpener=null,oldOverflow="",oldScrollBehavior="",scrollQueued=false,snapshots={},resistanceRecords={};
var bar=document.querySelector("[data-kd-bar]"),section=document.getElementById("workout-downloads");
function get(id){if(/^focused-[123]$/.test(id))id="focused";if(/^fullbody-[123]$/.test(id))id="fullbody";if(/^booklet-[123]$/.test(id))id="book";return documents.find(function(d){return d.id===id;});}
function saveValues(){if(!selected||!frame.contentDocument)return;try{if(frame.contentWindow.location.href==="about:blank"||new URL(frame.contentWindow.location.href).pathname!==new URL(selected.preview,location.href).pathname)return;var values={};frame.contentDocument.querySelectorAll("input[name],textarea[name],select[name]").forEach(function(el){values[el.name]=el.value;if(/^(rating-|count-|resistance-)/.test(el.name))resistanceRecords[el.name]=el.value;});snapshots[selected.id]=values;}catch(e){}}
function updateBar(){scrollQueued=false;if(!bar||!section)return;var left=document.documentElement.scrollHeight-(window.scrollY+window.innerHeight),range=Math.min(420,window.innerHeight*.55),p=Math.max(0,Math.min(1,1-left/range));bar.hidden=dialog.open||p<=0||window.innerHeight<540;bar.style.opacity=String(p);bar.style.setProperty("--kd-rise",String(p));}
function queueBar(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateBar);}}
function renderSelection(moveFrame,fragment){
dialog.dataset.category=selected.category;dialog.dataset.results=String(filtered.length);
dialog.querySelectorAll("[data-kd-doc]").forEach(function(b){var on=b.dataset.kdDoc===selected.id;b.setAttribute("aria-pressed",String(on));if(on)b.scrollIntoView({block:"nearest",inline:"nearest",behavior:"auto"});});
dialog.querySelector("[data-kd-eyebrow]").textContent=selected.eyebrow;
dialog.querySelector(".kd-preview-note").textContent=selected.note;
dialog.querySelector("[data-kd-document-title]").textContent=selected.title;
dialog.querySelector("[data-kd-document-note]").textContent=selected.detail+" / "+selected.note;
var dl=dialog.querySelector("[data-kd-download]");dl.href=selected.pdf+"?layout=20261015-unified-protocol";dl.setAttribute("download",selected.pdf.split("/").pop());
dialog.querySelector("[data-kd-full]").href=selected.preview+"?layout=20261015-unified-protocol";
frame.title="Preview: "+selected.title;
if(moveFrame)frame.src=selected.preview+"?embed=1&layout=20261015-unified-protocol"+(fragment||"");
var i=filtered.findIndex(function(d){return d.id===selected.id;});
dialog.querySelector("[data-kd-count]").textContent=(i+1)+" / "+filtered.length;
dialog.querySelector("[data-kd-prev]").disabled=i<=0;
dialog.querySelector("[data-kd-next]").disabled=i<0||i>=filtered.length-1;
}

function select(id,fragment){var d=get(id);if(!d)return;saveValues();selected=d;renderSelection(true,fragment);}
function applyFilter(){
filtered=documents.slice();
dialog.querySelectorAll("[data-kd-doc]").forEach(function(b){b.hidden=!filtered.some(function(d){return d.id===b.dataset.kdDoc;});});
dialog.querySelector("[data-kd-empty]").hidden=filtered.length>0;
if(filtered.length&&!filtered.some(function(d){return d.id===selected.id;}))select(filtered[0].id);
else renderSelection(false);
if(!filtered.length){dialog.querySelector("[data-kd-count]").textContent="0 / 0";dialog.querySelector("[data-kd-prev]").disabled=true;dialog.querySelector("[data-kd-next]").disabled=true;}
}
function open(opener,id){
lastOpener=opener||document.activeElement;applyFilter();
if(!dialog.open){var root=document.documentElement,x=window.scrollX,y=window.scrollY;oldOverflow=root.style.overflow;oldScrollBehavior=root.style.scrollBehavior;root.style.scrollBehavior="auto";window.scrollTo(x,y);dialog.showModal();root.style.overflow="hidden";window.scrollTo(x,y);}
select(get(id)?id:selected.id);dialog.querySelector("[data-kd-close]").focus();updateBar();
}
document.addEventListener("click",function(event){var opener=event.target.closest("[data-kd-open]");if(opener){if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();open(opener,opener.dataset.kdOpen);}});
dialog.addEventListener("click",function(event){
if(event.target.closest("[data-kd-download]")){if(window.Project100ExportPDF){event.preventDefault();var kinds={protocol:"focused-short",weekly:"weekly",focused:"focused",fullbody:"fullbody",guides:"guides",book:"book","fullbody-short":"fullbody-short","weekly-log":"weekly-overview"};window.Project100ExportPDF(null,{kind:kinds[selected.id]||"guide",guideId:kinds[selected.id]?null:selected.id});return;}try{var doc=frame.contentDocument,exporter=doc&&doc.querySelector("[data-download-pdf]"),edited=doc&&Array.from(doc.querySelectorAll("textarea[name],input[name],select[data-r-rating]")).some(function(el){return el.type!=="radio"&&el.value&&el.type!=="checkbox";});if(exporter&&frame.contentWindow.Project100ExportPDF&&new URL(frame.contentWindow.location.href).pathname===new URL(selected.preview,location.href).pathname){event.preventDefault();frame.contentWindow.Project100ExportPDF();return;}}catch(e){/* The ready-made PDF link remains the fallback. */}}
if(event.target.closest("[data-kd-close]")){dialog.close();return;}
var item=event.target.closest("[data-kd-doc]");if(item){select(item.dataset.kdDoc);return;}
var direction=event.target.closest("[data-kd-prev]")?-1:event.target.closest("[data-kd-next]")?1:0;
if(direction){var i=filtered.findIndex(function(d){return d.id===selected.id;});if(filtered[i+direction])select(filtered[i+direction].id);}
if(event.target===dialog){var box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}
});
dialog.addEventListener("close",function(){saveValues();document.documentElement.style.overflow=oldOverflow;document.documentElement.style.scrollBehavior=oldScrollBehavior;frame.src="about:blank";updateBar();if(lastOpener&&document.contains(lastOpener))lastOpener.focus({preventScroll:true});});
frame.addEventListener("load",function(){try{var doc=frame.contentDocument;if(!doc||frame.contentWindow.location.href==="about:blank")return;
doc.documentElement.classList.add("kd-in-frame");
var saved=Object.assign({},snapshots[selected.id]||{},resistanceRecords);doc.querySelectorAll("input[name],textarea[name],select[name]").forEach(function(el){if(!/^weekly-day-[1-7]-notes$/.test(el.name)&&Object.prototype.hasOwnProperty.call(saved,el.name))el.value=saved[el.name];});if(frame.contentWindow.Project100RefreshResistance)frame.contentWindow.Project100RefreshResistance();
doc.addEventListener("click",function(e){var a=e.target.closest("a[href]");if(!a)return;var u=new URL(a.href),match=documents.find(function(d){return new URL(d.preview,location.href).pathname===u.pathname&&u.origin===location.origin;});if(match){if(u.pathname===frame.contentWindow.location.pathname&&u.hash)return;e.preventDefault();select(match.id,u.hash);}else if(u.origin!==location.origin){a.target="_blank";a.rel="noopener noreferrer";}});
}catch(e){/* A full-page link remains available if a browser prevents framed interaction. */}});
window.addEventListener("scroll",queueBar,{passive:true});window.addEventListener("resize",queueBar);updateBar();
var requested=new URLSearchParams(location.search).get("workout");if(requested&&get(requested)){var openRequested=function(){requestAnimationFrame(function(){open(null,requested);});};if(document.readyState==="complete")openRequested();else window.addEventListener("load",openRequested,{once:true});}
})();