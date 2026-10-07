/* 2026-10-07 Bogdan: Site-wide image lightbox - download and full view */
/* Coded feature, not a patch. Auto-attaches to content images. */
(function(){
  if(document.getElementById('siteLightbox')) return;
  
  const lb = document.createElement('div');
  lb.id = 'siteLightbox';
  lb.hidden = true;
  lb.innerHTML = `
    <div class="sl-backdrop"></div>
    <div class="sl-box">
      <button class="sl-close" aria-label="Close">&times;</button>
      <div class="sl-title"></div>
      <div class="sl-wrap">
        <img class="sl-img" alt="">
        <div class="sl-actions">
          <a class="sl-action sl-download" download title="Download image" aria-label="Download">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </a>
          <a class="sl-action sl-fullview" target="_blank" rel="noopener" title="Open full size" aria-label="Full size">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </a>
        </div>
      </div>
      <div class="sl-hint">Click X or press ESC to close &bull; Full-view opens hi-res in new tab</div>
    </div>
    <style>
    #siteLightbox{ position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; }
    #siteLightbox[hidden]{ display:none; }
    .sl-backdrop{ position:absolute; inset:0; background:rgba(0,0,0,.88); backdrop-filter:blur(10px); }
    .sl-box{ position:relative; width:min(94vw, 720px); max-height:92vh; background:var(--surface,#14161c);
      border:1px solid var(--border,#2a2e38); border-radius:20px; padding:24px;
      box-shadow:0 20px 60px rgba(0,0,0,.6), 0 0 40px rgba(230,39,63,.15);
      animation:slIn .3s ease-out; overflow-y:auto; }
    @keyframes slIn{ from{ opacity:0; transform:scale(.92) translateY(20px);} to{ opacity:1; transform:scale(1) translateY(0);} }
    .sl-close{ position:absolute; top:12px; right:12px; width:44px; height:44px; border-radius:50%;
      background:rgba(0,0,0,.6); border:1px solid rgba(255,255,255,.2); color:#fff;
      font-size:1.5rem; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:2; }
    .sl-close:hover{ background:var(--red,#e6273f); border-color:var(--red,#e6273f); }
    .sl-title{ font-weight:800; font-size:1.1rem; margin-bottom:16px; text-align:center; padding-right:40px; }
    .sl-wrap{ position:relative; }
    .sl-img{ width:100%; border-radius:12px; display:block; background:#000; }
    .sl-actions{ position:absolute; top:12px; right:12px; display:flex; gap:8px; }
    .sl-action{ width:40px; height:40px; border-radius:50%; background:rgba(0,0,0,.7);
      backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,.25); color:#fff;
      display:flex; align-items:center; justify-content:center; cursor:pointer; text-decoration:none; }
    .sl-action:hover{ background:var(--red,#e6273f); border-color:var(--red,#e6273f); transform:scale(1.1); }
    .sl-hint{ text-align:center; font-size:.8rem; color:var(--muted,#9aa0ae); margin-top:12px; }
    img[data-lightbox]{ cursor:zoom-in; }
    </style>
  `;
  document.body.appendChild(lb);
  
  const imgEl = lb.querySelector('.sl-img');
  const titleEl = lb.querySelector('.sl-title');
  const dlEl = lb.querySelector('.sl-download');
  const fvEl = lb.querySelector('.sl-fullview');
  
  function open(src, title){
    imgEl.src = src;
    titleEl.textContent = title || '';
    dlEl.href = src;
    dlEl.setAttribute('download', src.split('/').pop().split('?')[0]);
    fvEl.href = src;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lb.hidden = true;
    document.body.style.overflow = '';
    imgEl.src = '';
  }
  
  lb.querySelector('.sl-close').onclick = close;
  lb.querySelector('.sl-backdrop').onclick = close;
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !lb.hidden) close(); });
  
  // Auto-attach to content images (not icons, logos, or tiny images)
  document.addEventListener('click', e => {
    const img = e.target.closest('img[data-lightbox]');
    if(img){
      e.preventDefault();
      open(img.src, img.alt || img.title || '');
    }
  });
  
  // Mark eligible images
  function markImages(){
    document.querySelectorAll('main img, .content img, article img').forEach(img => {
      // Skip tiny images, icons, logos
      if(img.width < 100 && img.naturalWidth < 100) return;
      if(img.closest('.brand') || img.closest('header') || img.closest('nav')) return;
      if(img.hasAttribute('data-lightbox')) return;
      img.setAttribute('data-lightbox', '');
    });
  }
  
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', markImages);
  } else {
    markImages();
  }
  // Re-mark after dynamic content
  setTimeout(markImages, 2000);
})();
