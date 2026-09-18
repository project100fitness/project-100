/* ===================================================================
   PROJECT 100 — Standardized Carousel Row System (site-wide)

   Call window.ProjectCarousel.init() once the cards for a
   [data-carousel] container are in the DOM (this file itself does
   NOT auto-run on DOMContentLoaded, so pages with dynamically
   rendered cards — e.g. filtered data — can call init() at the
   right moment, after their cards exist).

   Works two ways:
     1) Auto-build (most pages): the container holds a flat list of
        card elements. This script chunks them into rows of
        `data-carousel-max` (default 3) and builds the
        .carousel-wrap > .carousel-row + arrow-button markup itself.
     2) Pre-built rows: the container already holds
        .carousel-wrap > .carousel-row groups (used when a page needs
        custom card distribution across rows, e.g. round-robin across
        filtered categories). This script only wires up the arrows.
   =================================================================== */
(function(){
  function arrowSVG(dir){
    var d = dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="' + d + '"/></svg>';
  }

  function makeArrow(dir, label){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'carousel-arrow ' + dir + (dir === 'left' ? ' hidden' : '');
    btn.setAttribute('aria-label', 'Scroll ' + label + ' ' + dir);
    btn.innerHTML = arrowSVG(dir);
    return btn;
  }

  function wireRow(wrap, row, label){
    var prevBtn = wrap.querySelector(':scope > .carousel-arrow.left');
    var nextBtn = wrap.querySelector(':scope > .carousel-arrow.right');
    if(!prevBtn || !nextBtn) return;

    function step(){
      var card = row.querySelector(':scope > *');
      return card ? (card.getBoundingClientRect().width + 18) : (row.clientWidth * 0.9);
    }
    function update(){
      var max = row.scrollWidth - row.clientWidth;
      prevBtn.classList.toggle('hidden', row.scrollLeft <= 4);
      nextBtn.classList.toggle('hidden', max <= 4 || row.scrollLeft >= max - 4);
    }
    function nav(dir){
      // let any page-specific auto-scroll (index.html) know this was a manual nudge
      row.dispatchEvent(new CustomEvent('carousel:nav'));
      row.scrollBy({left: dir * step() * 3, behavior:'smooth'});
    }
    prevBtn.addEventListener('click', function(){ nav(-1); });
    nextBtn.addEventListener('click', function(){ nav(1); });
    row.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    new MutationObserver(update).observe(row, {childList:true});
    setTimeout(update, 300);
  }

  function buildRow(cards, index, container){
    var wrap = document.createElement('div');
    wrap.className = 'carousel-wrap';
    var label = 'row ' + (index + 1);
    var left = makeArrow('left', label);
    var right = makeArrow('right', label);
    var row = document.createElement('div');
    row.className = 'carousel-row';
    row.setAttribute('data-row', index);
    cards.forEach(function(c){ row.appendChild(c); });
    wrap.appendChild(left);
    wrap.appendChild(row);
    wrap.appendChild(right);
    container.appendChild(wrap);
    wireRow(wrap, row, label);
  }

  function initContainer(container){
    if(container.dataset.carouselReady) return;
    container.dataset.carouselReady = '1';
    var max = parseInt(container.getAttribute('data-carousel-max'), 10) || 3;

    var existingWraps = Array.prototype.slice.call(container.querySelectorAll(':scope > .carousel-wrap'));
    if(existingWraps.length){
      existingWraps.forEach(function(wrap, i){
        var row = wrap.querySelector('.carousel-row');
        if(row) wireRow(wrap, row, 'row ' + (i + 1));
      });
      return;
    }

    var cards = Array.prototype.slice.call(container.children);
    if(!cards.length) return;
    container.innerHTML = '';
    for(var i = 0; i < cards.length; i += max){
      buildRow(cards.slice(i, i + max), i / max, container);
    }
  }

  function init(){
    document.querySelectorAll('[data-carousel]').forEach(initContainer);
  }

  window.ProjectCarousel = { init: init };
})();
