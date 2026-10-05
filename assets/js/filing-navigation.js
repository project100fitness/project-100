/* Source links to overview files open the matching folder before scrolling. */
(()=>{
 const openFile=()=>{let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return};if(!id)return;const file=document.getElementById(id);if(!file?.classList.contains('protocol-file'))return;const details=file.querySelector('details');if(details)details.open=true;requestAnimationFrame(()=>file.scrollIntoView({block:'start'}))};
 addEventListener('hashchange',openFile);openFile();
 const tabs=document.querySelector('.page-tabs .current');tabs?.scrollIntoView({block:'nearest',inline:'nearest'});
})();
