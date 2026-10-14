(() => {
  'use strict';
  const grid = document.querySelector('.kin-exercises');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('[data-kin-group]')];
  const folders = [...grid.querySelectorAll('[data-kin-category]')];
  const filters = [...document.querySelectorAll('[data-kin-filter]')];
  const search = document.querySelector('#kin-search');
  const count = document.querySelector('.kin-library-count');
  let group = 'all';
  let wasFiltered = false;
  const folderStates = new Map();

  function apply() {
    const query = search.value.trim().toLowerCase();
    const isFiltered = group !== 'all' || query !== '';
    if (isFiltered && !wasFiltered) {
      folders.forEach(folder => folderStates.set(folder, folder.open));
    }
    let matches = 0;
    cards.forEach(card => {
      const show = (group === 'all' || card.dataset.kinGroup === group)
        && card.textContent.toLowerCase().includes(query);
      card.hidden = !show;
      if (show) matches++;
      else card.open = false;
    });
    folders.forEach(folder => {
      const entries = [...folder.querySelectorAll('[data-kin-group]')];
      const visibleCount = entries.filter(card => !card.hidden).length;
      const badge = folder.querySelector('.kin-folder-count');
      if (badge) {
        badge.firstChild.textContent = String(visibleCount).padStart(2, '0');
        badge.setAttribute('aria-label', visibleCount + ' of ' + entries.length + ' movements');
      }
      folder.hidden = visibleCount === 0;
      if (isFiltered && visibleCount) folder.open = true;
      else if (!isFiltered && wasFiltered) folder.open = folderStates.get(folder) ?? false;
    });
    wasFiltered = isFiltered;
    count.textContent = matches === 0
      ? 'No movements match. Clear the search or choose All movements.'
      : matches + ' movement' + (matches === 1 ? '' : 's')
        + (query ? ' matching “' + search.value.trim() + '”' : '');
  }
  filters.forEach(button => button.addEventListener('click', () => {
    group = button.dataset.kinFilter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    apply();
  }));
  search.addEventListener('input', apply);
  const strip = document.querySelector('.kin-strip[data-gallery="kin-portable"]');
  if (strip) {
    for (const [selector, direction] of [['.kin-gallery-prev', -1], ['.kin-gallery-next', 1]]) {
      document.querySelector(selector)?.addEventListener('click', () => strip.scrollBy({
        left: direction * strip.clientWidth * .8,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      }));
    }
  }
  apply();
})();
/* Scrollable source images feed the scanning display; automatic sequence loops. */
(()=>{'use strict';const root=document.querySelector('[data-kin-gallery]'),node=document.querySelector('#kin-gallery-data');if(!root||!node)return;const photos=JSON.parse(node.textContent),pools={all:photos},positions={all:0},q=s=>root.querySelector(s),display=q('[data-kg-display]'),img=q('[data-kg-img]'),open=q('[data-kg-open]'),bg=q('[data-kg-bg]'),progress=q('[data-kg-progress]'),bar=q('[role="progressbar"]'),status=q('[data-kg-status]'),play=q('[data-kg-play]');let current='',version=0,elapsed=0,last=0,raf=0,visible=false,loading=false,playing=true;const duration=3500,sequence=photos;
function updatePreview(pool){const box=q('[data-kg-pool="'+pool+'"]'),photo=pools[pool][positions[pool]],rail=box.querySelector('[data-kg-rail]');box.querySelector('[data-kg-pool-count]').textContent=String(positions[pool]+1).padStart(2,'0')+' / '+String(pools[pool].length).padStart(2,'0');rail.querySelectorAll('[data-kg-thumb]').forEach(button=>{const selected=button.dataset.kgThumb===photo.id;button.classList.toggle('is-current',selected);button.setAttribute('aria-pressed',String(selected));if(selected){const left=button.offsetLeft;if(left<rail.scrollLeft||left+button.offsetWidth>rail.scrollLeft+rail.clientWidth)rail.scrollTo({left,behavior:'smooth'});}});}
function highlight(photo){const refs=photo.bundleRefs||[],names=[];document.querySelectorAll('[data-kin-bundle]').forEach(card=>{const active=refs.includes(card.dataset.kinBundle);card.classList.toggle('is-related',active);if(active){card.setAttribute('aria-label',card.querySelector('h4').textContent+' — linked to selected setup');names.push(card.querySelector('h4').textContent);}else card.removeAttribute('aria-label');});const short=refs.includes('hpygn');q('[data-kg-hpygn]').hidden=!short;q('[data-kg-system]').textContent=short?'HPYGN / SHORT-BAND BAR':'HEX-GRID / KUZARO';q('[data-kg-related]').textContent=short?'Selected system → HPYGN / Tribe bar · 2 × (65 + 55 lb)':'Setup links → '+names.join(' · ');}
function clock(){cancelAnimationFrame(raf);last=0;if(playing&&visible&&!document.hidden&&!loading)raf=requestAnimationFrame(tick);}
function tick(now){if(!playing||!visible||document.hidden||loading){last=0;return;}if(last)elapsed+=now-last;last=now;const ratio=Math.min(1,elapsed/duration);progress.style.transform='scaleX('+ratio+')';bar.setAttribute('aria-valuenow',Math.round(ratio*100));if(ratio===1){const next=sequence[(positions.all+1)%sequence.length];show(next);return;}raf=requestAnimationFrame(tick);}
function show(photo){if(photo.id===current)return;const token=++version;current=photo.id;loading=true;elapsed=0;progress.style.transform='scaleX(0)';status.textContent='Loading photo';display.classList.add('is-loading');display.classList.remove('is-scanning');positions.all=photos.findIndex(x=>x.id===photo.id);updatePreview('all');highlight(photo);q('[data-kg-title]').textContent=photo.title;q('[data-kg-muscles]').textContent=photo.muscles;q('[data-kg-vector]').textContent=photo.vector;q('[data-kg-count]').textContent=String(photos.indexOf(photo)+1).padStart(2,'0')+' / '+String(photos.length).padStart(2,'0');const next=new Image();let settled=false;function done(ok){if(settled||token!==version)return;settled=true;loading=false;if(ok){img.src=photo.src;img.alt=photo.title;open.href=photo.src;open.dataset.full=photo.src;open.setAttribute('aria-label','Enlarge '+photo.title);bg.style.backgroundImage='url("'+photo.thumb+'")';display.classList.remove('is-loading');void display.offsetWidth;display.classList.add('is-scanning');status.textContent=playing?'Next image after scan cycle':'Sequence paused';}else{display.classList.remove('is-loading');status.textContent='Photo unavailable · choose another';}clock();}next.onload=()=>done(true);next.onerror=()=>done(false);next.src=photo.src;if(next.complete&&next.naturalWidth)done(true);clock();}
root.querySelectorAll('[data-kg-pool]').forEach(box=>{const pool=box.dataset.kgPool,rail=box.querySelector('[data-kg-rail]');pools[pool].forEach(photo=>{const button=document.createElement('button');button.type='button';button.className='kin-source-thumb';button.dataset.kgThumb=photo.id;button.setAttribute('aria-label','Show '+photo.title);button.setAttribute('aria-pressed','false');const image=document.createElement('img');image.src=photo.thumb;image.alt=photo.title;image.loading='lazy';image.draggable=false;const label=document.createElement('span');label.textContent=photo.title;button.append(image,label);button.addEventListener('click',()=>show(photo));rail.append(button);});function step(dir){positions[pool]=(positions[pool]+dir+pools[pool].length)%pools[pool].length;show(pools[pool][positions[pool]]);}box.querySelectorAll('[data-kg-step]').forEach(b=>b.addEventListener('click',()=>step(+b.dataset.kgStep)));box.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});});
play.addEventListener('click',()=>{playing=!playing;play.textContent=playing?'Ⅱ':'▶';play.setAttribute('aria-label',playing?'Pause gallery sequence':'Resume gallery sequence');status.textContent=playing?'Next image after scan cycle':'Sequence paused';clock();});document.addEventListener('visibilitychange',clock);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;clock();},{threshold:.2}).observe(root);show(sequence[0]);})();
