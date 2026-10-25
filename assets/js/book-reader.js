import {transport,blockSize} from './document-cache.js?v=c352c21f45d1';
const params=new URLSearchParams(location.search),$=s=>document.querySelector(s),status=$('#readerStatus');let key=params.get('document')||params.get('book')||'guide';
function notify(type,data={}){if(parent!==window)parent.postMessage({source:'p100-publication',type,...data},location.origin)}
function closeReader(){if(parent!==window)notify('close');else if(history.length>1)history.back();else location.href='index.html'}
$('#closeReader').onclick=closeReader;document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeReader()}});
try{
 let catalog;try{if(parent!==window&&parent.P100Manuals)catalog=await parent.P100Manuals.catalog()}catch(_){}
 catalog||=await fetch('assets/data/manual-library.json?v=d3f4f54c6ffb').then(r=>{if(!r.ok)throw Error('Document list unavailable');return r.json()});
 const doc=catalog.documents.find(x=>x.id===key)||catalog.documents.find(x=>x.id==='guide');
 if(doc.type!=='pdf')throw Error('This item is a source download');
 document.title=doc.title+' · PROJECT 100';$('#readerTitle').textContent=doc.title+(doc.version?' · '+(doc.version.startsWith('T')?doc.version:'V'+doc.version):'');
 const preview=$('#readerPreview');preview.src=doc.cover;preview.alt=doc.title+' · first page';preview.hidden=false;
 const download=$('#downloadBook');download.href=doc.file;download.download=doc.file.split('/').pop();download.textContent='Download full PDF ↓';
 $('#pageCount').textContent='/ '+doc.pages;$('#pageNumber').max=doc.pages;status.textContent='Opening document…';
 const pdfjs=await import('../vendor/pdfjs/pdf.mjs');globalThis.pdfjsLib=pdfjs;pdfjs.GlobalWorkerOptions.workerSrc=new URL('../vendor/pdfjs/pdf.worker.mjs',import.meta.url).href;
 const {EventBus,PDFViewer,PDFLinkService}=await import('../vendor/pdfjs/pdf_viewer.mjs');const bus=new EventBus(),links=new PDFLinkService({eventBus:bus,externalLinkTarget:2});
 const viewer=new PDFViewer({container:$('#pdfArea'),viewer:$('#pdfPages'),eventBus:bus,linkService:links,maxCanvasPixels:8388608,annotationEditorMode:pdfjs.AnnotationEditorType.DISABLE});links.setViewer(viewer);
 const range=await transport(doc,pdfjs),task=pdfjs.getDocument({range,rangeChunkSize:blockSize,disableStream:true,disableAutoFetch:true,standardFontDataUrl:new URL('../vendor/pdfjs/standard_fonts/',import.meta.url).href,useWasm:false});
 const pdf=await task.promise;document.body.dataset.pages=String(pdf.numPages);document.body.dataset.document=doc.id;$('#pageCount').textContent='/ '+pdf.numPages;$('#pageNumber').max=pdf.numPages;
 function sync(){const n=viewer.currentPageNumber;$('#pageNumber').value=n;$('#previousPage').disabled=n<=1;$('#nextPage').disabled=n>=pdf.numPages;notify('page',{page:n})}
 bus.on('pagesinit',()=>{viewer.currentScaleValue='page-width';viewer.currentPageNumber=Math.min(pdf.numPages,Math.max(1,Number(params.get('page'))||1));sync()});
 bus.on('pagechanging',sync);bus.on('pagerendered',()=>{status.hidden=true;preview.hidden=true;document.body.dataset.ready='true'});bus.on('pagesloaded',()=>notify('ready',{pages:pdf.numPages}));
 viewer.setDocument(pdf);links.setDocument(pdf);
 $('#previousPage').onclick=()=>viewer.currentPageNumber=Math.max(1,viewer.currentPageNumber-1);$('#nextPage').onclick=()=>viewer.currentPageNumber=Math.min(pdf.numPages,viewer.currentPageNumber+1);
 $('#pageNumber').onchange=()=>{viewer.currentPageNumber=Math.min(pdf.numPages,Math.max(1,Number($('#pageNumber').value)||1));sync()};$('#zoomIn').onclick=()=>viewer.currentScale=Math.min(3,viewer.currentScale*1.2);$('#zoomOut').onclick=()=>viewer.currentScale=Math.max(.3,viewer.currentScale/1.2);$('#fitPage').onclick=()=>viewer.currentScaleValue='page-width';
 pdf.annotationStorage.onSetModified=()=>download.textContent='Download PDF with entries ↓';
 download.addEventListener('click',async e=>{if(!pdf.annotationStorage.size)return;e.preventDefault();const blob=new Blob([await pdf.saveDocument()],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=download.download;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)});
 let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{if(viewer.currentScaleValue==='page-width')viewer.currentScaleValue='page-width'},150)});window.addEventListener('pagehide',()=>task.destroy(),{once:true});
}catch(error){status.hidden=false;status.textContent='The online reader could not load. Use Download full PDF below to read the original.';document.body.dataset.error=error.message;console.error(error)}
