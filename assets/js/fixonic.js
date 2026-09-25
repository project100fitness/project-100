/* ===================================================================
   PROJECT 100 — "Fixonic" design-system runtime (site-wide)
   Auto-inits on DOMContentLoaded: nav-scroll arrows, sticky condensed
   nav, scroll-reveal, animated stat counters. Exposes window.Fixonic
   for page-specific pieces (before/after slider, gallery lightbox)
   that need to init after a page builds its own markup.
   =================================================================== */
(function(){

  /* ---- 1. Nav scroll-affordance: inject arrows + track can-l/can-r ---- */
  function setupTabScroller(nav){
    var wrap = nav.querySelector('.wrap');
    if(!wrap || nav.dataset.fxNav) return;
    nav.dataset.fxNav = '1';

    var arrowL = document.createElement('button');
    arrowL.type = 'button'; arrowL.className = 'tab-arrow arrow-l'; arrowL.setAttribute('aria-label','Scroll left'); arrowL.textContent = '‹';
    var arrowR = document.createElement('button');
    arrowR.type = 'button'; arrowR.className = 'tab-arrow arrow-r'; arrowR.setAttribute('aria-label','Scroll right'); arrowR.textContent = '›';
    nav.appendChild(arrowL); nav.appendChild(arrowR);

    function update(){
      wrap.classList.toggle('can-l', wrap.scrollLeft > 2);
      wrap.classList.toggle('can-r', wrap.scrollLeft < (wrap.scrollWidth - wrap.clientWidth - 2));
    }
    wrap.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update);
    arrowL.addEventListener('click', function(){ wrap.scrollBy({ left:-140, behavior:'smooth' }); });
    arrowR.addEventListener('click', function(){ wrap.scrollBy({ left:140, behavior:'smooth' }); });

    var current = wrap.querySelector('.page-tab.current, a.active');
    if(current){
      wrap.scrollLeft = Math.max(0, current.offsetLeft - (wrap.clientWidth / 2) + (current.offsetWidth / 2));
    }
    update();
  }
  function initNavScroll(){
    document.querySelectorAll('.page-tabs, .cat-tabs').forEach(setupTabScroller);
  }

  /* ---- 2. Sticky condensed nav ---- */
  function initCondenseNav(){
    var head = document.querySelector('.site-head');
    if(!head) return;
    var toggling = false;
    function onScroll(){
      if(toggling) return;
      toggling = true;
      requestAnimationFrame(function(){
        head.classList.toggle('condensed', window.scrollY > 60);
        toggling = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

  /* ---- 3. Scroll-reveal for [data-reveal] / .fx-reveal elements ---- */
  function initReveal(){
    var els = document.querySelectorAll('.fx-reveal');
    if(!els.length) return;
    if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('fx-in'); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('fx-in'); io.unobserve(e.target); }
      });
    }, { threshold:.2, rootMargin:'0px 0px -8% 0px' });
    els.forEach(function(e){ io.observe(e); });
  }

  /* ---- 4. Animated stat counters: <span class="stat-num" data-count-to="185" data-suffix="+"> ---- */
  function animateCount(el){
    var to = parseFloat(el.getAttribute('data-count-to'));
    if(isNaN(to)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'),10) : 0;
    var dur = 1400, start = null;
    el.classList.add('counting');
    function step(ts){
      if(start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = to * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if(p < 1) requestAnimationFrame(step);
      else el.textContent = to.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  function initStatCounters(){
    var els = document.querySelectorAll('.stat-num[data-count-to]');
    if(!els.length) return;
    if(!('IntersectionObserver' in window)){ els.forEach(animateCount); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animateCount(e.target); io.unobserve(e.target); }
      });
    }, { threshold:.5 });
    els.forEach(function(e){ io.observe(e); });
  }

  /* ---- 5. Before/after slider: call Fixonic.initBeforeAfter(el) per instance ---- */
  function initBeforeAfter(root){
    (root || document).querySelectorAll('.ba-slider').forEach(function(slider){
      if(slider.dataset.fxBa) return;
      slider.dataset.fxBa = '1';
      var afterWrap = slider.querySelector('.ba-after-wrap');
      var handle = slider.querySelector('.ba-handle');
      var range = slider.querySelector('input[type="range"]');
      if(!afterWrap || !range) return;
      function set(pct){
        pct = Math.max(0, Math.min(100, pct));
        afterWrap.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
        if(handle) handle.style.left = pct + '%';
      }
      range.addEventListener('input', function(){ set(parseFloat(range.value)); });
      set(parseFloat(range.value || 50));
    });
  }

  /* ---- 6. Gallery lightbox: call Fixonic.initGallery(el) per instance ---- */
  function initGallery(root){
    (root || document).querySelectorAll('.fx-gallery').forEach(function(gal){
      if(gal.dataset.fxGal) return;
      gal.dataset.fxGal = '1';
      var buttons = Array.prototype.slice.call(gal.querySelectorAll('button[data-full]'));
      if(!buttons.length) return;

      var lb = document.createElement('div');
      lb.className = 'fx-lightbox';
      lb.innerHTML = '<button type="button" class="fx-lb-close" aria-label="Close">✕</button>' +
        '<button type="button" class="fx-lb-nav prev" aria-label="Previous">‹</button>' +
        '<img alt="">' +
        '<button type="button" class="fx-lb-nav next" aria-label="Next">›</button>';
      document.body.appendChild(lb);
      var img = lb.querySelector('img');
      var idx = 0;
      function show(i){
        idx = (i + buttons.length) % buttons.length;
        img.src = buttons[idx].getAttribute('data-full');
        img.alt = buttons[idx].getAttribute('aria-label') || '';
      }
      buttons.forEach(function(btn, i){
        btn.addEventListener('click', function(){ show(i); lb.classList.add('open'); });
      });
      lb.querySelector('.fx-lb-close').addEventListener('click', function(){ lb.classList.remove('open'); });
      lb.querySelector('.prev').addEventListener('click', function(){ show(idx - 1); });
      lb.querySelector('.next').addEventListener('click', function(){ show(idx + 1); });
      lb.addEventListener('click', function(e){ if(e.target === lb) lb.classList.remove('open'); });
      document.addEventListener('keydown', function(e){
        if(!lb.classList.contains('open')) return;
        if(e.key === 'Escape') lb.classList.remove('open');
        if(e.key === 'ArrowLeft') show(idx - 1);
        if(e.key === 'ArrowRight') show(idx + 1);
      });
    });
  }

  /* ---- 7. Spotlight cursor glow: track the pointer over any .fx-spotlight
     element and write it into --sx/--sy (consumed by fixonic.css's
     radial-gradient overlay). Fine-pointer devices only. ---- */
  function initSpotlight(root){
    if(!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    (root || document).querySelectorAll('.fx-spotlight').forEach(function(el){
      if(el.dataset.fxSpot) return;
      el.dataset.fxSpot = '1';
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        el.style.setProperty('--sx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--sy', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---- 8. Auto-scrolling carousel rows: any [data-autoscroll] container
     nudges its .carousel-row along on a timer, pausing on hover/touch/
     manual nav, and looping back to the start at the end. Skips entirely
     under reduced-motion. Call after the row markup exists (carousel.js
     builds it), same pattern as initGallery/initBeforeAfter. ---- */
  function initAutoScroll(root){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    (root || document).querySelectorAll('[data-autoscroll]').forEach(function(container){
      if(container.dataset.fxAuto) return;
      container.dataset.fxAuto = '1';
      container.querySelectorAll('.carousel-row').forEach(function(row){
        var paused = false;
        function step(){
          if(paused) return;
          var card = row.querySelector(':scope > *');
          var amt = card ? (card.getBoundingClientRect().width + 18) : 260;
          var max = row.scrollWidth - row.clientWidth;
          if(max <= 4) return;
          if(row.scrollLeft >= max - 4){ row.scrollTo({ left:0, behavior:'smooth' }); }
          else{ row.scrollBy({ left:amt, behavior:'smooth' }); }
        }
        var timer = setInterval(step, 4200);
        function pause(){ paused = true; }
        function resume(){ paused = false; }
        row.addEventListener('mouseenter', pause);
        row.addEventListener('mouseleave', resume);
        row.addEventListener('touchstart', pause, { passive:true });
        row.addEventListener('focusin', pause);
        row.addEventListener('focusout', resume);
        row.addEventListener('carousel:nav', function(){ paused = true; clearInterval(timer); });
      });
    });
  }

  function initAll(){
    initNavScroll();
    initCondenseNav();
    initReveal();
    initStatCounters();
    initBeforeAfter();
    initGallery();
    initSpotlight();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.Fixonic = {
    initNavScroll: initNavScroll,
    initBeforeAfter: initBeforeAfter,
    initGallery: initGallery,
    initStatCounters: initStatCounters,
    initReveal: initReveal,
    initSpotlight: initSpotlight,
    initAutoScroll: initAutoScroll
  };
})();
