/* Keep the vertical file rail below the measured horizontal page header. */
(()=>{const header=document.querySelector('.site-head');if(!header)return;
const measure=()=>document.documentElement.style.setProperty('--folder-header-height',header.getBoundingClientRect().height+'px');
measure();new ResizeObserver(measure).observe(header);document.fonts?.ready.then(measure);
})();
