const publications={enc:{title:'Encyclopedia · V3.5',file:'assets/downloads/project-100-encyclopedia-v3-5-2026-10-24.pdf'},guide:{title:'Daily guidebook · V3.6',file:'assets/downloads/project-100-guidebook-v3-6-2026-10-24.pdf'}};
const params=new URLSearchParams(location.search),book=publications[params.get('book')]||publications.guide,$=s=>document.querySelector(s),status=$('#readerStatus');
document.title=book.title+' · PROJECT 100';$('#readerTitle').textContent=book.title;const download=$('#downloadBook');download.href=book.file;download.download=book.file.split('/').pop();download.textContent='Download full '+(params.get('book')==='enc'?'encyclopedia':'guidebook')+' PDF ↓';
function notify(type,data={}){if(parent!==window)parent.postMessage({source:'p100-publication',type,...data},location.origin)}
function closeReader(){if(parent!==window)notify('close');else if(history.length>1)history.back();else location.href='index.html'}
$('#closeReader').onclick=closeReader;document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeReader()}});
try{
 const pdfjs=await import('../vendor/pdfjs/pdf.mjs');globalThis.pdfjsLib=pdfjs;pdfjs.GlobalWorkerOptions.workerSrc=new URL('../vendor/pdfjs/pdf.worker.mjs',import.meta.url).href;
 const {EventBus,PDFViewer,PDFLinkService}=await import('../vendor/pdfjs/pdf_viewer.mjs');const bus=new EventBus(),links=new PDFLinkService({eventBus:bus,externalLinkTarget:pdfjs.LinkTarget?.BLANK||2});
 const viewer=new PDFViewer({container:$('#pdfArea'),viewer:$('#pdfPages'),eventBus:bus,linkService:links,maxCanvasPixels:8388608,annotationEditorMode:pdfjs.AnnotationEditorType.DISABLE});links.setViewer(viewer);
 const task=pdfjs.getDocument({url:book.file,standardFontDataUrl:new URL('../vendor/pdfjs/standard_fonts/',import.meta.url).href,useWasm:false,disableAutoFetch:true,rangeChunkSize:262144});
 task.onProgress=p=>{if(p.total)status.textContent='Loading PDF · '+Math.min(100,Math.round(p.loaded/p.total*100))+'%'};
 const pdf=await task.promise;document.body.dataset.pages=String(pdf.numPages);$('#pageCount').textContent='/ '+pdf.numPages;$('#pageNumber').max=pdf.numPages;
 function sync(){const n=viewer.currentPageNumber;$('#pageNumber').value=n;$('#previousPage').disabled=n<=1;$('#nextPage').disabled=n>=pdf.numPages;notify('page',{page:n})}
 bus.on('pagesinit',()=>{viewer.currentScaleValue='page-width';viewer.currentPageNumber=Math.min(pdf.numPages,Math.max(1,Number(params.get('page'))||1));sync()});
 bus.on('pagechanging',sync);bus.on('pagerendered',()=>{status.hidden=true;document.body.dataset.ready='true'});bus.on('pagesloaded',()=>notify('ready',{pages:pdf.numPages}));
 viewer.setDocument(pdf);links.setDocument(pdf);
 $('#previousPage').onclick=()=>viewer.currentPageNumber=Math.max(1,viewer.currentPageNumber-1);$('#nextPage').onclick=()=>viewer.currentPageNumber=Math.min(pdf.numPages,viewer.currentPageNumber+1);
 $('#pageNumber').onchange=()=>{viewer.currentPageNumber=Math.min(pdf.numPages,Math.max(1,Number($('#pageNumber').value)||1));sync()};$('#zoomIn').onclick=()=>viewer.currentScale=Math.min(3,viewer.currentScale*1.2);$('#zoomOut').onclick=()=>viewer.currentScale=Math.max(.3,viewer.currentScale/1.2);$('#fitPage').onclick=()=>viewer.currentScaleValue='page-width';
 let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{if(viewer.currentScaleValue==='page-width')viewer.currentScaleValue='page-width'},150)});
 window.addEventListener('pagehide',()=>task.destroy(),{once:true});
}catch(error){status.hidden=false;status.textContent='The online reader could not load. Use Download full PDF below to read the original.';document.body.dataset.error=error.message;console.error(error)}
