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

    if(row.dataset.loopReady) return;
    row.dataset.loopReady='1';
    var cards=Array.from(row.children), count=cards.length;
    row.tabIndex=0; row.setAttribute('role','region');
    row.setAttribute('aria-label',label+'; use left and right arrows to explore');
    if(count<2){prevBtn.classList.add('hidden');nextBtn.classList.add('hidden');return;}
    wrap.style.width='100%';wrap.style.minWidth='0';wrap.style.marginInline='auto';
    var start=0,period=0,timer;
    var reduced=matchMedia('(prefers-reduced-motion: reduce)');
    var estimate=cards[0].getBoundingClientRect().width*count||200;
    var copies=2+Math.ceil(row.clientWidth/estimate);
    function clone(card){
      var copy=card.cloneNode(true);copy.dataset.loopCopy='1';copy.setAttribute('aria-hidden','true');
      [copy].concat(Array.from(copy.querySelectorAll('*'))).forEach(function(el){
        el.removeAttribute('id');Array.from(el.attributes).forEach(function(a){if(/^on/i.test(a.name))el.removeAttribute(a.name)});
        if(el.matches('a,button,input,select,textarea,[tabindex]'))el.tabIndex=-1;
        if(el.tagName==='IMG')el.loading='lazy';
      });
      copy.addEventListener('click',function(event){
        event.preventDefault();event.stopImmediatePropagation();
        var original=card, path=[],node=event.target;
        while(node!==copy){path.unshift(Array.from(node.parentNode.children).indexOf(node));node=node.parentNode;}
        path.forEach(function(i){original=original.children[i]});
        original=original.closest('a,button')||original;
        while(original&&!original.click)original=original.parentElement;
        row.scrollTo({left:card.offsetLeft-row.offsetLeft,behavior:'instant'});
        if(original)original.click();
      },true);return copy;
    }
    var before=document.createDocumentFragment(),after=document.createDocumentFragment();
    for(var k=0;k<copies;k++){cards.forEach(function(c){before.appendChild(clone(c));after.appendChild(clone(c))})}
    row.prepend(before);row.append(after);
    function measure(){
      var old=period?((row.scrollLeft-start)%period+period)%period:0;
      wrap.style.maxWidth='none';
      var all=Array.from(row.children),first=cards[0],next=all[all.indexOf(first)+count];
      start=first.offsetLeft-row.offsetLeft;period=next.offsetLeft-first.offsetLeft;
      wrap.style.maxWidth=(period+parseFloat(getComputedStyle(row).paddingLeft||0)+parseFloat(getComputedStyle(row).paddingRight||0))+'px';
      start=first.offsetLeft-row.offsetLeft;period=next.offsetLeft-first.offsetLeft;
      row.scrollTo({left:start+old,behavior:'instant'});
      prevBtn.classList.remove('hidden');nextBtn.classList.remove('hidden');
    }
    function normalize(){
      if(!period)return;
      var pos=start+((row.scrollLeft-start)%period+period)%period;
      if(Math.abs(pos-row.scrollLeft)>1)row.scrollTo({left:pos,behavior:'instant'});
    }
    function nav(dir){
      normalize();row.dispatchEvent(new CustomEvent('carousel:nav'));
      var distance=cards[1].offsetLeft-cards[0].offsetLeft;
      row.scrollBy({left:dir*distance,behavior:reduced.matches?'instant':'smooth'});
    }
    prevBtn.addEventListener('click',function(){nav(-1)});
    nextBtn.addEventListener('click',function(){nav(1)});
    row.addEventListener('keydown',function(e){if(e.target!==row||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();nav(e.key==='ArrowLeft'?-1:1)});
    row.addEventListener('scroll',function(){clearTimeout(timer);timer=setTimeout(normalize,140)},{passive:true});
    row.addEventListener('scrollend',normalize);
    window.addEventListener('resize',measure);
    requestAnimationFrame(measure);

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

  window.ProjectCarousel = { init: init, wireRow: wireRow };
})();
