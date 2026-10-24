/* PROJECT 100 – site script (2026-10-08 update 13: selector rows drift + fade + position bar; video pop-up fallback link). */
/* ===== 00-core.js ===== */
/* PROJECT 100 – site script. Small, dependency-free, progressive enhancement:
   every page is fully readable and navigable with JavaScript turned off. */
(function () {
  'use strict';
  var P = window.P100 = window.P100 || {};
  P.$ = function (s, r) { return (r || document).querySelector(s); };
  P.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  P.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  P.store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  /* Authored visible-motion preference; background clips explicitly opt into continuous playback. */
  // Authored embedded-reader mode keeps the host's persistent controls in charge.
  if(window.parent!==window&&new URLSearchParams(location.search).get('reader')==='1')document.documentElement.dataset.resourceReader='true';
  P.motionPaused = P.store.get('p100-motion-paused') === 'true' || (P.reduceMotion.matches && P.store.get('p100-motion-paused') !== 'false');
  function motionLabels() {
    document.documentElement.dataset.motion = P.motionPaused ? 'paused' : 'running';
    P.$$('[data-motion-toggle]').forEach(function (b) {
      var blocked = !!document.querySelector('video[data-playback="blocked"]');
      b.setAttribute('aria-pressed', String(P.motionPaused));
      b.setAttribute('aria-label', P.motionPaused || blocked ? 'Play background motion' : 'Pause background motion');
      b.querySelector('[data-motion-label]').textContent = P.motionPaused || blocked ? 'Play motion' : 'Pause motion';
      b.querySelector('[data-motion-symbol]').textContent = P.motionPaused || blocked ? '▶' : 'Ⅱ';
    });
  }
  P.setMotionPaused = function (paused) { P.motionPaused = paused; P.store.set('p100-motion-paused', String(paused)); motionLabels(); document.dispatchEvent(new CustomEvent('p100:motion')); };
  P.refreshMotionLabels = motionLabels;
  P.$$('[data-motion-toggle]').forEach(function (b) { b.addEventListener('click', function () { P.setMotionPaused(document.querySelector('video[data-playback="blocked"]') ? false : !P.motionPaused); }); });
  motionLabels();
  P.reduceMotion.addEventListener('change', function (event) { if (event.matches) P.setMotionPaused(true); });
  /* Pages routes that older bookmarks and PDFs still use (#ch6 → fit-protocol-training.html#ch6) */
  P.legacyRoutes = {"introduction": "fit-protocol-baseline.html#introduction", "ch1": "fit-protocol-baseline.html#ch1", "ch2": "fit-protocol-history.html#ch2", "ch3": "fit-protocol-constraints.html#ch3", "ch4": "fit-protocol-fuel.html#ch4", "annex2": "fit-protocol-checklists.html#annex2", "part3-vectors": "fit-protocol-vector-reference.html#part3-vectors", "ch5": "fit-protocol-nutrition.html#ch5", "ch8": "fit-protocol-supplements.html#ch8", "part4-cascades": "fit-protocol-interactions.html#part4-cascades", "part5-margins": "fit-protocol-margins.html#part5-margins", "ch6": "fit-protocol-training.html#ch6", "ch9": "fit-protocol-progression.html#ch9", "ch10": "fit-protocol-joints.html#ch10", "ch11": "fit-protocol-monitoring.html#ch11", "part6-lab-integrity": "fit-protocol-labs.html#part6-lab-integrity", "ch7": "fit-protocol-troubleshooting.html#ch7", "guide-page-2": "fit-protocol.html#guide-page-2", "guide-page-4": "fit-protocol.html#guide-page-4", "guide-page-3": "fit-protocol-baseline.html#guide-page-3", "guide-page-11": "fit-protocol-checklists.html#guide-page-11", "guide-page-13": "fit-protocol-checklists.html#guide-page-13", "guide-page-9": "fit-protocol-vector-reference.html#guide-page-9", "guide-page-6": "fit-protocol-nutrition.html#guide-page-6", "guide-page-7": "fit-protocol-supplements.html#guide-page-7", "guide-page-8": "fit-protocol-margins.html#guide-page-8", "guide-page-5": "fit-protocol-training.html#guide-page-5", "guide-page-10": "fit-protocol-labs.html#guide-page-10", "guide-page-12": "fit-protocol-troubleshooting.html#guide-page-12", "vector-v3": "fit-protocol-vector-v3.html#vector-v3", "vector-v1": "fit-protocol-vector-v1.html#vector-v1", "vector-v2": "fit-protocol-vector-v2.html#vector-v2", "vector-v4": "fit-protocol-vector-v4.html#vector-v4", "vector-v5": "fit-protocol-vector-v5.html#vector-v5", "vector-v10": "fit-protocol-vector-v10.html#vector-v10", "vector-pump": "fit-protocol-vector-pump.html#vector-pump", "vectors": "fit-protocol-vectors.html", "today": "guidebook.html#today", "red-flags": "fit-protocol-checklists.html#annex2", "s-clock": "fit-protocol-fuel.html#ch4", "s-vectors": "fit-protocol-vectors.html", "s-fuel": "fit-protocol-nutrition.html#ch5", "s-arsenal": "fit-protocol-supplements.html#ch8", "s-origin": "fit-protocol-baseline.html#introduction", "s-metric": "fit-protocol-baseline.html#ch1", "s-patches": "fit-protocol-constraints.html#ch3", "s-training": "fit-protocol-training.html#ch6", "s-roadmap": "fit-protocol-progression.html#ch9", "s-fail": "fit-protocol-troubleshooting.html#ch7", "s-qr": "fit-protocol-checklists.html#annex2", "quickref": "fit-protocol-checklists.html#annex2", "annex1": "fit-protocol-supplements.html#ch8", "ch12": "fit-protocol-labs.html#part6-lab-integrity"};
})();

/* ===== 10-theme.js ===== */
/* Light / dark theme. The saved choice wins; otherwise the OS preference decides. */
(function () {
  'use strict';
  var P = window.P100, btn = P.$('#themeToggle'), root = document.documentElement;
  if (!btn) return;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function effective() { return root.dataset.theme || (mq.matches ? 'dark' : 'light'); }
  function sync() {
    var dark = effective() === 'dark';
    btn.setAttribute('aria-checked', String(dark));
    btn.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  }
  btn.addEventListener('click', function () {
    var next = effective() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    P.store.set('p100-theme', next);
    sync();
  });
  if (mq.addEventListener) mq.addEventListener('change', sync);
  sync();
})();

/* ===== 20-header.js ===== */
/* Header follows deliberate scroll direction, with a quiet zone at the top. */
(function () {
  'use strict';
  var P = window.P100, head = P.$('#siteHead');
  if (!head) return;
  var lastY = Math.max(0, window.scrollY), travel = 0, direction = 0, ticking = false;
  function update() {
    var y = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - innerHeight));
    var delta = y - lastY, next = delta > 0 ? 1 : delta < 0 ? -1 : direction;
    if (next !== direction) travel = 0;
    travel += Math.abs(delta); direction = next; lastY = y;
    var keyboardFocus = head.querySelector(':focus-visible');
    if (y <= 24 || keyboardFocus) head.dataset.hidden = 'false';
    else if (next > 0 && y > head.offsetHeight + 24 && travel >= 40) head.dataset.hidden = 'true';
    else if (next < 0 && travel >= 24) head.dataset.hidden = 'false';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  head.addEventListener('focusin', function () {
    if (head.querySelector(':focus-visible')) head.dataset.hidden = 'false';
  });
  window.addEventListener('pageshow', update);
  update();


  // The shared header owns its measured geometry; responsive components consume these variables.
  function measureHeader() {
    var root=document.documentElement,height=Math.ceil(head.getBoundingClientRect().height),offset=head.dataset.hidden==='true'?0:height;
    if (root.style.getPropertyValue('--site-header-height') !== height+'px') root.style.setProperty('--site-header-height',height+'px');
    if (root.style.getPropertyValue('--site-header-offset') !== offset+'px') root.style.setProperty('--site-header-offset',offset+'px');
  }
  var headerMeasureFrame = 0;
  function queueHeaderMeasure() {
    if (headerMeasureFrame) return;
    headerMeasureFrame = requestAnimationFrame(function () { headerMeasureFrame = 0; measureHeader(); });
  }
  if(window.ResizeObserver)new ResizeObserver(queueHeaderMeasure).observe(head);
  if(window.MutationObserver)new MutationObserver(queueHeaderMeasure).observe(head,{attributes:true,attributeFilter:['data-hidden']});
  window.addEventListener('resize',measureHeader);measureHeader();

  var list = P.$('.tabs__list');
  function revealCurrent() {
    var cur = list && P.$('[aria-current="page"]', list);
    if (!cur) return;
    var row = list.getBoundingClientRect(), tab = cur.getBoundingClientRect();
    list.scrollLeft = Math.max(0, list.scrollLeft + tab.left - row.left - (list.clientWidth - tab.width) / 2);
  }
  requestAnimationFrame(revealCurrent);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(revealCurrent);
  if (list && 'ResizeObserver' in window) new ResizeObserver(revealCurrent).observe(list);
  else window.addEventListener('resize', revealCurrent);
})();

/* ===== 05-back.js ===== */
/* Back button / Back gesture: closes whatever is open on top (menu, download box, image viewer) instead of leaving the site.
   Every native <dialog> that opens adds one history entry; Back (or closing it any other way) removes it again. */
(function () {
  'use strict';
  var P = window.P100, pending = [], timer = 0, layers = [], known = new Map(), navigating = false, serial = 0, guarded = new WeakSet();
  function flush() { clearTimeout(timer); timer = 0; var q = pending; pending = []; q.forEach(function (f) { f(); }); }
  P.afterLayer = function (fn) { if (!timer && !pending.length) { fn(); return; } pending.push(fn); };
  function removeLayer(layer) {
    var index=layers.indexOf(layer); if(index<0||navigating)return;
    var removed=layers.splice(index);navigating=true;
    try { removed.slice().reverse().forEach(function(l){l.close();}); } finally { navigating=false; }
    history.go(-removed.length);timer=setTimeout(flush,400);
  }
  // Each enclosed view owns one Back/Forward entry, including views within a dialog.
  P.openLayer = function (close,restore) {
    var layer={id:'view-'+Date.now()+'-'+(++serial),close:close,restore:restore};
    known.set(layer.id,layer);layers.push(layer);
    var st=Object.assign({},history.state);st.p100dlg=layers.length;st.p100layers=layers.map(function(l){return l.id;});
    history.pushState(st,'',location.href);return layer;
  };
  P.closeLayer = removeLayer;
  P.closeTopLayer = function(){if(layers.length)removeLayer(layers[layers.length-1]);};
  P.openDialog = function (d,onRestore) {
    if(timer){P.afterLayer(function(){P.openDialog(d,onRestore);});return;}
    if(d.open)return;
    if(!guarded.has(d)){d.addEventListener('close',function(e){if(d.open)e.stopImmediatePropagation();},true);guarded.add(d);}
    var layer;
    function show(restoring){if(restoring&&onRestore)onRestore();if(!d.open){if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');}d.addEventListener('close',function(){P.closeLayer(layer);},{once:true});}
    show(false);layer=P.openLayer(function(){if(d.open)d.close();},function(){show(true);});
  };
  var host=null;
  try{if(window.parent!==window&&document.documentElement.dataset.resourceReader==='true')host=window.parent.P100;}catch(_){}
  if(host){P.openLayer=function(close,restore){return host.openLayer(close,restore);};P.closeLayer=function(layer){host.closeLayer(layer);};P.afterLayer=function(fn){host.afterLayer(fn);};P.closeTopLayer=function(){host.closeTopLayer();};}
  else {
  window.addEventListener('popstate',function(e){
    var ids=e.state&&e.state.p100layers||[],common=0;
    while(common<layers.length&&common<ids.length&&layers[common].id===ids[common])common++;
    var removed=layers.splice(common);navigating=true;
    try{
      removed.reverse().forEach(function(l){l.close();});
      ids.slice(common).forEach(function(id){var l=known.get(id);if(l){layers.push(l);l.restore();}});
    }finally{navigating=false;}
    flush();
  });
  function heal(){if(history.state&&history.state.p100dlg&&!layers.length&&!document.querySelector('dialog[open]')){var st=Object.assign({},history.state);delete st.p100dlg;delete st.p100layers;history.replaceState(st,'',location.href);}}
  window.addEventListener('pageshow',heal);heal();
  }
  /* links clicked inside an open dialog: close it first, then follow the link, so the history stays tidy */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('dialog[open] a[href]');
    if (!a || e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var href = a.getAttribute('href'), dlg = a.closest('dialog');
    if (!href || /^(mailto|tel|sms):/i.test(href)) return;
    e.preventDefault();
    var url = a.href, same = url.split('#')[0] === location.href.split('#')[0];
    if (history.state && history.state.p100dlg) { clearTimeout(timer); timer = setTimeout(flush, 400); }   /* hold the link until the Back step is done */
    dlg.close();
    P.afterLayer(function () { if (same && href.charAt(0) === '#') location.hash = href; else location.assign(url); });
  });
})();

/* ===== native section navigation ===== */
/* Markup belongs to each page. JavaScript only opens/closes its authored dialog. */
(function(){
 'use strict';var P=window.P100,button=document.querySelector('.rail-toggle'),dialog=document.getElementById('mobile-sections');
 if(!button||!dialog||typeof dialog.showModal!=='function')return;
 var layout=button.closest('.layout'),links=dialog.querySelector('.rail__list'),close=dialog.querySelector('.rail-drawer__close'),restore=false;
 var mobile=matchMedia('(max-width:719px),(max-width:1023px) and (pointer:coarse)');
 button.hidden=false;layout.classList.add('has-mobile-rail');
 function shut(focus){restore=focus;if(dialog.open)dialog.close();}
 button.addEventListener('click',function(){if(!mobile.matches)return;if(dialog.open){shut(true);return;}P.openDialog(dialog);button.setAttribute('aria-expanded','true');var selected=links.querySelector('[aria-current="page"]')||links.querySelector('a');if(selected)selected.focus({preventScroll:true});});
 close.addEventListener('click',function(){shut(true);});
 dialog.addEventListener('click',function(e){if(e.target===dialog){var box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)shut(true);}if(e.target.closest('a'))shut(false);});
 dialog.addEventListener('cancel',function(){restore=true;});
 dialog.addEventListener('close',function(){button.setAttribute('aria-expanded','false');if(restore&&mobile.matches)button.focus({preventScroll:true});restore=false;});
 mobile.addEventListener('change',function(){if(!mobile.matches)shut(false);});
})();

/* ===== external links: always a new tab ===== */
(function () {
  'use strict';
  function fix(root) {
    (root.querySelectorAll ? root.querySelectorAll('a[href^="http"]') : []).forEach(function (a) {
      var u; try { u = new URL(a.href); } catch (e) { return; }
      if (u.host === location.host || a.hasAttribute('download')) return;
      a.target = '_blank';
      var r = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['noopener', 'noreferrer'].forEach(function (k) { if (r.indexOf(k) < 0) r.push(k); });
      a.setAttribute('rel', r.join(' '));
    });
  }
  fix(document);
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href^="http"]'); if (a) fix(a.parentNode || document); }, true);
})();

/* ===== 40-hash.js ===== */
/* Deep links: open any collapsed <details> that contains the target, and honour old bookmarks. */
(function () {
  'use strict';
  var P = window.P100;
  function targetFromHash() {
    var id; try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) { return null; }
    return id ? { id: id, el: document.getElementById(id) } : null;
  }
  function follow() {
    var t = targetFromHash();
    if (!t) return;
    if (!t.el && P.legacyRoutes && P.legacyRoutes[t.id]) {
      var dest = P.legacyRoutes[t.id].split('#'), here = location.pathname.split('/').pop() || 'index.html';
      if (dest[0] !== here) { location.replace(P.legacyRoutes[t.id]); return; }
      t.el = document.getElementById(dest[1]);
    }
    if (!t.el) return;
    var d = t.el.closest('details');
    while (d) { d.open = true; d = d.parentElement && d.parentElement.closest('details'); }
    if (t.el.tagName === 'DETAILS') t.el.open = true;
    requestAnimationFrame(function () { t.el.scrollIntoView({ block: 'start' }); });
  }
  window.addEventListener('hashchange', follow);
  window.addEventListener('load', follow);
  document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(a&&a.hash===location.hash)requestAnimationFrame(follow);});
  follow();
})();

/* ===== 50-spy.js ===== */
/* Scroll-spy for in-page navigation: any [data-spy] list of #anchor links highlights the section in view. */
(function () {
  'use strict';
  var P = window.P100;
  P.$$('[data-spy]').forEach(function (nav) {
    var links = P.$$('a[href^="#"]', nav), map = {};
    links.forEach(function (a) { var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) map[el.id] = a; });
    var ids = Object.keys(map);
    if (!ids.length || !('IntersectionObserver' in window)) return;
    var visible = {};
    function mark() {
      var pick = ids.filter(function (id) { return visible[id]; })[0] || null;
      links.forEach(function (a) { a.classList.toggle('is-active', pick && map[pick] === a); });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      mark();
    }, { rootMargin: '-20% 0px -65% 0px' });
    ids.forEach(function (id) { io.observe(document.getElementById(id)); });
  });
})();

/* ===== 60-scroller.js ===== */
/* Horizontal scroll-snap rows ([data-scroller]) with previous / next buttons. No autoplay, no cloned nodes. */
(function () {
  'use strict';
  var P = window.P100;
  var ICON = { prev: 'M15 18l-6-6 6-6', next: 'M9 6l6 6-6 6' };
  function button(dir, label) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'scroller__btn scroller__btn--' + dir;
    b.setAttribute('aria-label', label);
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + ICON[dir] + '"/></svg>';
    return b;
  }
  function init(root) {
    if (root.dataset.ready) return;
    var track = P.$('.scroller__track', root); if (!track) return;
    root.dataset.ready = '1';
    var prev = button('prev', 'Scroll left'), next = button('next', 'Scroll right');
    root.appendChild(prev); root.appendChild(next);
    function step() { var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 16 : track.clientWidth * .8; }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max;
      root.dataset.overflow = max > 0 ? 'true' : 'false';
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: P.reduceMotion.matches ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: P.reduceMotion.matches ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if (!track.hasAttribute('tabindex')) track.tabIndex = 0;
    track.addEventListener('keydown', function (e) {
      if (e.target !== track) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    update();
  }
  P.initScrollers = function (scope) { P.$$('[data-scroller]', scope).forEach(init); };
  P.initScrollers(document);
})();

/* ===== 64-deskart.js ===== */
/* Phone-light / desktop-rich: pictures marked .desk-only carry their address in data-desk-src and are only fetched on screens
   1000px wide or more (and not when Data Saver is on). On a phone they are hidden and cost zero bytes. */
(function () {
  'use strict';
  var mq = window.matchMedia ? window.matchMedia('(min-width: 1000px)') : null, done = false, saver = false;
  try { var c = navigator.connection; saver = !!(c && c.saveData); } catch (e) {}
  if (saver) { document.documentElement.classList.add('deskart-off'); return; }
  function run() {
    if (done || !mq || !mq.matches) return;
    done = true;
    Array.prototype.forEach.call(document.querySelectorAll('img[data-desk-src]'), function (im) {
      var ss = im.getAttribute('data-desk-srcset');
      if (ss) im.setAttribute('srcset', ss);
      im.src = im.getAttribute('data-desk-src');
      im.removeAttribute('data-desk-src'); im.removeAttribute('data-desk-srcset');
    });
    document.documentElement.classList.add('has-deskart');
  }
  run();
  if (mq) { if (mq.addEventListener) mq.addEventListener('change', run); else if (mq.addListener) mq.addListener(run); }
})();

/* ===== 70-lightbox.js ===== */
/* Image lightbox. Any element with data-full="<big image>" opens it; elements inside the same [data-gallery]
   become a set you can step through. Uses a native <dialog>, so focus, Esc and the backdrop come for free. */
(function () {
  'use strict';
  var P = window.P100, dlg, img, cap, dl, full, post, set = [], idx = 0, opener;
  function build() {
    if (dlg) return;
    dlg = document.createElement('dialog');
    dlg.className = 'lightbox'; dlg.setAttribute('aria-label', 'Image viewer');
    dlg.innerHTML =
      '<figure class="lightbox__fig"><img alt=""><figcaption></figcaption></figure>' +
      '<div class="lightbox__bar">' +
      '<button type="button" class="lightbox__btn" data-lb="prev" aria-label="Previous image">‹</button>' +
      '<button type="button" class="lightbox__btn" data-lb="next" aria-label="Next image">›</button>' +
      '<button type="button" class="lightbox__btn" data-lb="zoom" aria-label="Zoom image" aria-pressed="false">+</button>' +
      '<a class="lightbox__btn" data-lb="download" download aria-label="Download image">↓</a>' +
      '<a class="lightbox__btn" data-lb="full" target="_blank" rel="noopener" aria-label="Open full size">↗</a>' +
      '<a class="lightbox__btn" data-lb="post" target="_blank" rel="noopener" aria-label="Open the Instagram post" hidden>Instagram ↗</a>' +
      '<button type="button" class="lightbox__btn" data-lb="close" aria-label="Close">×</button></div>';
    document.body.appendChild(dlg);
    img = P.$('img', dlg); cap = P.$('figcaption', dlg); dl = P.$('[data-lb="download"]', dlg); full = P.$('[data-lb="full"]', dlg); post = P.$('[data-lb="post"]', dlg);
    dlg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lb]'), k = b && b.dataset.lb;
      if (k === 'close' || e.target === dlg) dlg.close();
      if (k === 'prev') show(idx - 1);
      if (k === 'next') show(idx + 1);
      if (k === 'zoom') { var zoomed = dlg.classList.toggle('is-wide'); b.setAttribute('aria-pressed', String(zoomed)); b.textContent = zoomed ? '−' : '+'; }
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    /* Horizontal gestures browse the queue; zoomed images retain normal panning. */
    (function () {
      var sx = 0, sy = 0, finger = null, fig = P.$('.lightbox__fig', dlg);
      function reset() { finger = null; }
      fig.addEventListener('touchstart', function (e) {
        reset();
        if (e.touches.length !== 1 || dlg.classList.contains('is-wide')) return;
        var touch = e.touches[0];
        finger = touch.identifier; sx = touch.clientX; sy = touch.clientY;
      }, { passive: true });
      fig.addEventListener('touchmove', function (e) {
        if (e.touches.length !== 1) reset();
      }, { passive: true });
      fig.addEventListener('touchcancel', reset, { passive: true });
      fig.addEventListener('touchend', function (e) {
        var touch = Array.prototype.find.call(e.changedTouches, function (t) { return t.identifier === finger; });
        var active = finger !== null; reset();
        if (!active || !touch || set.length < 2 || dlg.classList.contains('is-wide')) return;
        var dx = touch.clientX - sx, dy = touch.clientY - sy;
        if (Math.abs(dx) > 45 && Math.abs(dy) < Math.abs(dx) * .75) show(idx + (dx < 0 ? 1 : -1));
      }, { passive: true });
    })();
    /* Every original opens fitted to the viewport; zoom is an explicit action. */
    dlg.addEventListener('close', function () { dlg.classList.remove('is-wide'); document.documentElement.classList.remove('no-scroll'); if (opener) opener.focus(); img.removeAttribute('src'); });
  }
  var originalImages = {"assets/media/october-2026/vector-v5.jpg":"assets/media/source-originals/vector-v5.png","assets/media/october-2026/vector-v10.jpg":"assets/media/source-originals/vector-v10.png","assets/media/october-2026/vector-v1.jpg":"assets/media/source-originals/vector-v1.png","assets/media/october-2026/vector-v3.jpg":"assets/media/source-originals/vector-v3.png","assets/media/october-2026/vector-pump.jpg":"assets/media/source-originals/vector-pump.jfif","assets/media/october-2026/bogdan-november-2025.jpg":"assets/media/source-originals/bogdan-november-2025.jpg","assets/media/october-2026/bogdan-june-2026.jpg":"assets/media/source-originals/bogdan-june-2026.jpg","assets/media/october-2026/gym-turf-rig.jpg":"assets/media/source-originals/gym-turf-rig.jpg","assets/media/october-2026/bogdan-july-2026.jpg":"assets/media/source-originals/bogdan-july-2026.jpg","assets/media/october-2026/gym-july-session.jpg":"assets/media/source-originals/gym-july-session.jpg","assets/media/october-2026/gym-july-turf.jpg":"assets/media/source-originals/gym-july-turf.jpg","assets/media/october-2026/gym-august-floor.jpg":"assets/media/source-originals/gym-august-floor.jpg","assets/media/october-2026/bogdan-august-mirror.jpg":"assets/media/source-originals/bogdan-august-mirror.jpg","assets/media/october-2026/bogdan-gym-session.jpg":"assets/media/source-originals/bogdan-gym-session.jpg","assets/media/october-2026/gym-august-weights.jpg":"assets/media/source-originals/gym-august-weights.jpg","assets/media/october-2026/gym-bench-august.jpg":"assets/media/source-originals/gym-bench-august.jpg","assets/media/october-2026/vector-v4.jpg":"assets/media/source-originals/vector-v4.png","assets/media/october-2026/vector-v2.jpg":"assets/media/source-originals/vector-v2.png","assets/img/gear-rig-setup.jpg":"assets/media/source-originals/gear-rig-setup.jpg","assets/img/gear-rope-carabiners.jpg":"assets/media/source-originals/gear-rope-carabiners.jpg","assets/img/gym-photo-sled-harness.jpg":"assets/media/source-originals/bogdan-november-2025.jpg","assets/web/media-october-2026-bogdan-august-mirror-1600.webp":"assets/media/source-originals/bogdan-august-mirror.jpg","assets/web/media-october-2026-bogdan-july-2026-1205.webp":"assets/media/source-originals/bogdan-july-2026.jpg","assets/web/media-october-2026-bogdan-june-2026-1205.webp":"assets/media/source-originals/bogdan-june-2026.jpg","assets/web/media-october-2026-bogdan-november-2025-1205.webp":"assets/media/source-originals/bogdan-november-2025.jpg","assets/media/pill-cards/J15_meal1.webp":"assets/media/illustration-design/IMAGES/J15_meal1.png","assets/media/pill-cards/J15_dmz.webp":"assets/media/illustration-design/IMAGES/J15_dmz.png","assets/media/pill-cards/J15_wake.webp":"assets/media/illustration-design/IMAGES/J15_wake.png","assets/media/pill-cards/J15_primer.webp":"assets/media/illustration-design/IMAGES/J15_primer.png","assets/media/pill-cards/J15_night.webp":"assets/media/illustration-design/IMAGES/J15_night.png","assets/media/pill-cards/J15_cofactors.webp":"assets/media/illustration-design/IMAGES/J15_cofactors.png","assets/media/vector-artwork/mega/V6_PUMP_J04_NEON_MATRIX.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J04_NEON_MATRIX.png","assets/media/vector-artwork/mega/V6_PUMP_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J07_MONOCHROME_FLOW.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J07_MONOCHROME_FLOW.png","assets/media/vector-artwork/mega/V4_RELOAD_J16_ROUNDED_BOARD.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J16_ROUNDED_BOARD.png","assets/media/vector-artwork/mega/V4_RELOAD_J06_NEON_BLUEPRINT.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J06_NEON_BLUEPRINT.png","assets/media/vector-artwork/mega/V2_REFUEL_J05_CINEMATIC_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J05_CINEMATIC_CONSOLE.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J05_CINEMATIC_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J05_CINEMATIC_CONSOLE.png","assets/media/vector-artwork/mega/J14-STATE-A_PILLS.webp":"assets/media/vector-artwork/mega/originals/J14-STATE-A_PILLS.png","assets/media/vector-artwork/mega/J18-LUNCH_PILLS.webp":"assets/media/vector-artwork/mega/originals/J18-LUNCH_PILLS.png","assets/media/vector-artwork/mega/J15-BREAKFAST_PILLS.webp":"assets/media/vector-artwork/mega/originals/J15-BREAKFAST_PILLS.png","assets/media/vector-artwork/mega/V6_PUMP_J11_BIOLOGY_BOARD.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J11_BIOLOGY_BOARD.png","assets/media/vector-artwork/mega/NIGHT_PILLS_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/NIGHT_PILLS_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V6_PUMP_J08_ENGINEERING.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J08_ENGINEERING.png","assets/media/vector-artwork/mega/V4_RELOAD_J19_WHITE_BLUEPRINT.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J19_WHITE_BLUEPRINT.png","assets/media/vector-artwork/mega/V4_RELOAD_J03_CLINICAL_ANATOMY.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J03_CLINICAL_ANATOMY.png","assets/media/vector-artwork/mega/J12_SIX_VECTOR_RECIPE_MASTER.webp":"assets/media/vector-artwork/mega/originals/J12_SIX_VECTOR_RECIPE_MASTER.png","assets/media/vector-artwork/mega/J14-STATE-C_PILLS.webp":"assets/media/vector-artwork/mega/originals/J14-STATE-C_PILLS.png","assets/media/vector-artwork/mega/J10_FULL_DAILY_INTAKE_STATE_A.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_A.png","assets/media/vector-artwork/mega/J03_CLINICAL_ANATOMY_MASTER.webp":"assets/media/vector-artwork/mega/originals/J03_CLINICAL_ANATOMY_MASTER.png","assets/media/vector-artwork/mega/BREAKFAST_PILLS_J13_PILL_GRID.webp":"assets/media/vector-artwork/mega/originals/BREAKFAST_PILLS_J13_PILL_GRID.png","assets/media/vector-artwork/mega/V3_RECOVERY_J05_CINEMATIC_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J05_CINEMATIC_CONSOLE.png","assets/media/vector-artwork/mega/V3_RECOVERY_J07_MONOCHROME_FLOW.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J07_MONOCHROME_FLOW.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J12_PRINT_RECIPE.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J12_PRINT_RECIPE.png","assets/media/vector-artwork/mega/J15-LUNCH_PILLS.webp":"assets/media/vector-artwork/mega/originals/J15-LUNCH_PILLS.png","assets/media/vector-artwork/mega/V1_IGNITION_J17_VECTOR_ARCHITECTURE.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J17_VECTOR_ARCHITECTURE.png","assets/media/vector-artwork/mega/R_ALA_J06_NEON_BLUEPRINT.webp":"assets/media/vector-artwork/mega/originals/R_ALA_J06_NEON_BLUEPRINT.png","assets/media/vector-artwork/mega/BREAKFAST_PILLS_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/BREAKFAST_PILLS_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V4_RELOAD_J05_CINEMATIC_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J05_CINEMATIC_CONSOLE.png","assets/media/vector-artwork/mega/J17_VECTOR_ARCHITECTURE_MASTER.webp":"assets/media/vector-artwork/mega/originals/J17_VECTOR_ARCHITECTURE_MASTER.png","assets/media/vector-artwork/mega/V3_RECOVERY_J03_CLINICAL_ANATOMY.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J03_CLINICAL_ANATOMY.png","assets/media/vector-artwork/mega/V3_RECOVERY_J17_VECTOR_ARCHITECTURE.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J17_VECTOR_ARCHITECTURE.png","assets/media/vector-artwork/mega/V2_REFUEL_J12_PRINT_RECIPE.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J12_PRINT_RECIPE.png","assets/media/vector-artwork/mega/V4_RELOAD_J17_VECTOR_ARCHITECTURE.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J17_VECTOR_ARCHITECTURE.png","assets/media/vector-artwork/mega/J09_STATE_B_DAILY_PATTERN.webp":"assets/media/vector-artwork/mega/originals/J09_STATE_B_DAILY_PATTERN.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J04_NEON_MATRIX.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J04_NEON_MATRIX.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J08_ENGINEERING.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J08_ENGINEERING.png","assets/media/vector-artwork/mega/V1_IGNITION_J12_PRINT_RECIPE.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J12_PRINT_RECIPE.png","assets/media/vector-artwork/mega/V6_PUMP_J17_VECTOR_ARCHITECTURE.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J17_VECTOR_ARCHITECTURE.png","assets/media/vector-artwork/mega/V1_IGNITION_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/PRE-V4_PILLS_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/PRE-V4_PILLS_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V6_PUMP_J19_GYM_PANEL.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J19_GYM_PANEL.png","assets/media/vector-artwork/mega/V3_RECOVERY_J04_NEON_MATRIX.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J04_NEON_MATRIX.png","assets/media/vector-artwork/mega/J15-WAKE_PILLS.webp":"assets/media/vector-artwork/mega/originals/J15-WAKE_PILLS.png","assets/media/vector-artwork/mega/V4_RELOAD_J07_MONOCHROME_FLOW.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J07_MONOCHROME_FLOW.png","assets/media/vector-artwork/mega/V2_REFUEL_J19_WHITE_BLUEPRINT.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J19_WHITE_BLUEPRINT.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J16_ROUNDED_BOARD.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J16_ROUNDED_BOARD.png","assets/media/vector-artwork/mega/J18_PILL_ARCHITECTURE_MASTER.webp":"assets/media/vector-artwork/mega/originals/J18_PILL_ARCHITECTURE_MASTER.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J17_VECTOR_ARCHITECTURE.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J17_VECTOR_ARCHITECTURE.png","assets/media/vector-artwork/mega/V1_IGNITION_J03_CLINICAL_ANATOMY.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J03_CLINICAL_ANATOMY.png","assets/media/vector-artwork/mega/J10_FULL_DAILY_INTAKE_STATE_C.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_C.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J03_CLINICAL_ANATOMY.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J03_CLINICAL_ANATOMY.png","assets/media/vector-artwork/mega/V2_REFUEL_J16_ROUNDED_BOARD.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J16_ROUNDED_BOARD.png","assets/media/vector-artwork/mega/LUNCH_PILLS_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/LUNCH_PILLS_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J11_BIOLOGY_BOARD.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J11_BIOLOGY_BOARD.png","assets/media/vector-artwork/mega/V3_RECOVERY_J11_BIOLOGY_BOARD.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J11_BIOLOGY_BOARD.png","assets/media/vector-artwork/mega/J15-PRIMER_PILLS.webp":"assets/media/vector-artwork/mega/originals/J15-PRIMER_PILLS.png","assets/media/vector-artwork/mega/J16_GRID_PAPER_VESSEL_MASTER.webp":"assets/media/vector-artwork/mega/originals/J16_GRID_PAPER_VESSEL_MASTER.png","assets/media/vector-artwork/mega/WAKE_PILLS_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/WAKE_PILLS_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V1_IGNITION_J16_ROUNDED_BOARD.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J16_ROUNDED_BOARD.png","assets/media/vector-artwork/mega/V1_IGNITION_J07_MONOCHROME_FLOW.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J07_MONOCHROME_FLOW.png","assets/media/vector-artwork/mega/J15-NIGHT_PILLS.webp":"assets/media/vector-artwork/mega/originals/J15-NIGHT_PILLS.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V2_REFUEL_J06_NEON_BLUEPRINT.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J06_NEON_BLUEPRINT.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J12_PRINT_RECIPE.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J12_PRINT_RECIPE.png","assets/media/vector-artwork/mega/V4_RELOAD_J11_BIOLOGY_BOARD.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J11_BIOLOGY_BOARD.png","assets/media/vector-artwork/mega/J15-PRE-V4_PILLS.webp":"assets/media/vector-artwork/mega/originals/J15-PRE-V4_PILLS.png","assets/media/vector-artwork/mega/J05_CINEMATIC_CONSOLE_MASTER.webp":"assets/media/vector-artwork/mega/originals/J05_CINEMATIC_CONSOLE_MASTER.png","assets/media/vector-artwork/mega/V3_RECOVERY_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/J18-PRIMER_PILLS.webp":"assets/media/vector-artwork/mega/originals/J18-PRIMER_PILLS.png","assets/media/vector-artwork/mega/J18-WAKE_PILLS.webp":"assets/media/vector-artwork/mega/originals/J18-WAKE_PILLS.png","assets/media/vector-artwork/mega/V6_PUMP_J07_MONOCHROME_FLOW.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J07_MONOCHROME_FLOW.png","assets/media/vector-artwork/mega/V4_RELOAD_J08_ENGINEERING.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J08_ENGINEERING.png","assets/media/vector-artwork/mega/PRE-V4_PILLS_J13_PILL_GRID.webp":"assets/media/vector-artwork/mega/originals/PRE-V4_PILLS_J13_PILL_GRID.png","assets/media/vector-artwork/mega/J18-NIGHT_PILLS.webp":"assets/media/vector-artwork/mega/originals/J18-NIGHT_PILLS.png","assets/media/vector-artwork/mega/V3_RECOVERY_J12_PRINT_RECIPE.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J12_PRINT_RECIPE.png","assets/media/vector-artwork/mega/J09_STATE_C_DAILY_PATTERN.webp":"assets/media/vector-artwork/mega/originals/J09_STATE_C_DAILY_PATTERN.png","assets/media/vector-artwork/mega/V6_PUMP_J05_CINEMATIC_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J05_CINEMATIC_CONSOLE.png","assets/media/vector-artwork/mega/J09_COMBINED_DAILY_PATTERNS_ABC.webp":"assets/media/vector-artwork/mega/originals/J09_COMBINED_DAILY_PATTERNS_ABC.png","assets/media/vector-artwork/mega/V2_REFUEL_J08_ENGINEERING.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J08_ENGINEERING.png","assets/media/vector-artwork/mega/J11_SCIENTIFIC_BOARD_MASTER.webp":"assets/media/vector-artwork/mega/originals/J11_SCIENTIFIC_BOARD_MASTER.png","assets/media/vector-artwork/mega/J18-BREAKFAST_PILLS.webp":"assets/media/vector-artwork/mega/originals/J18-BREAKFAST_PILLS.png","assets/media/vector-artwork/mega/V6_PUMP_J12_PRINT_RECIPE.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J12_PRINT_RECIPE.png","assets/media/vector-artwork/mega/V4_RELOAD_J04_NEON_MATRIX.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J04_NEON_MATRIX.png","assets/media/vector-artwork/mega/J19_GYM_SEQUENCE_MASTER.webp":"assets/media/vector-artwork/mega/originals/J19_GYM_SEQUENCE_MASTER.png","assets/media/vector-artwork/mega/V1_IGNITION_J08_ENGINEERING.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J08_ENGINEERING.png","assets/media/vector-artwork/mega/V1_IGNITION_J05_CINEMATIC_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J05_CINEMATIC_CONSOLE.png","assets/media/vector-artwork/mega/V6_PUMP_J06_NEON_BLUEPRINT.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J06_NEON_BLUEPRINT.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J08_ENGINEERING.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J08_ENGINEERING.png","assets/media/vector-artwork/mega/V1_IGNITION_J04_NEON_MATRIX.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J04_NEON_MATRIX.png","assets/media/vector-artwork/mega/V3_RECOVERY_J08_ENGINEERING.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J08_ENGINEERING.png","assets/media/vector-artwork/mega/J15-AFTERNOON_PILLS.webp":"assets/media/vector-artwork/mega/originals/J15-AFTERNOON_PILLS.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J03_CLINICAL_ANATOMY.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J03_CLINICAL_ANATOMY.png","assets/media/vector-artwork/mega/V1_IGNITION_J19_WHITE_BLUEPRINT.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J19_WHITE_BLUEPRINT.png","assets/media/vector-artwork/mega/J15_FULL_PILL_CHRONOMETER.webp":"assets/media/vector-artwork/mega/originals/J15_FULL_PILL_CHRONOMETER.png","assets/media/vector-artwork/mega/V2_REFUEL_J11_BIOLOGY_BOARD.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J11_BIOLOGY_BOARD.png","assets/media/vector-artwork/mega/V2_REFUEL_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/J13_PILL_GRID_MASTER.webp":"assets/media/vector-artwork/mega/originals/J13_PILL_GRID_MASTER.png","assets/media/vector-artwork/mega/J14-STATE-B_PILLS.webp":"assets/media/vector-artwork/mega/originals/J14-STATE-B_PILLS.png","assets/media/vector-artwork/mega/V6_PUMP_J03_CLINICAL_ANATOMY.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J03_CLINICAL_ANATOMY.png","assets/media/vector-artwork/mega/R-ALA_PILLS_J19_GYM_PANEL.webp":"assets/media/vector-artwork/mega/originals/R-ALA_PILLS_J19_GYM_PANEL.png","assets/media/vector-artwork/mega/AFTERNOON_PILLS_J13_PILL_GRID.webp":"assets/media/vector-artwork/mega/originals/AFTERNOON_PILLS_J13_PILL_GRID.png","assets/media/vector-artwork/mega/V2_REFUEL_J17_VECTOR_ARCHITECTURE.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J17_VECTOR_ARCHITECTURE.png","assets/media/vector-artwork/mega/J18-AFTERNOON_PILLS.webp":"assets/media/vector-artwork/mega/originals/J18-AFTERNOON_PILLS.png","assets/media/vector-artwork/mega/V2_REFUEL_J03_CLINICAL_ANATOMY.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J03_CLINICAL_ANATOMY.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J07_MONOCHROME_FLOW.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J07_MONOCHROME_FLOW.png","assets/media/vector-artwork/mega/V4_RELOAD_J12_PRINT_RECIPE.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J12_PRINT_RECIPE.png","assets/media/vector-artwork/mega/WAKE_PILLS_J13_PILL_GRID.webp":"assets/media/vector-artwork/mega/originals/WAKE_PILLS_J13_PILL_GRID.png","assets/media/vector-artwork/mega/J07_MONOCHROME_FLOW_MASTER.webp":"assets/media/vector-artwork/mega/originals/J07_MONOCHROME_FLOW_MASTER.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J17_VECTOR_ARCHITECTURE.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J17_VECTOR_ARCHITECTURE.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J16_GRID_PAPER.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J16_GRID_PAPER.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J04_NEON_MATRIX.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J04_NEON_MATRIX.png","assets/media/vector-artwork/mega/PRIMER_PILLS_J13_PILL_GRID.webp":"assets/media/vector-artwork/mega/originals/PRIMER_PILLS_J13_PILL_GRID.png","assets/media/vector-artwork/mega/J14_LIQUID_PILL_CROSSCHECK_MASTER.webp":"assets/media/vector-artwork/mega/originals/J14_LIQUID_PILL_CROSSCHECK_MASTER.png","assets/media/vector-artwork/mega/V3_RECOVERY_J16_ROUNDED_BOARD.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J16_ROUNDED_BOARD.png","assets/media/vector-artwork/mega/J10_FULL_DAILY_INTAKE_STATE_B.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_B.png","assets/media/vector-artwork/mega/V10_SHUTDOWN_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V6_PUMP_J16_ROUNDED_BOARD.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J16_ROUNDED_BOARD.png","assets/media/vector-artwork/mega/J04_NEON_RECIPE_MATRIX_MASTER.webp":"assets/media/vector-artwork/mega/originals/J04_NEON_RECIPE_MATRIX_MASTER.png","assets/media/vector-artwork/mega/V1_IGNITION_J11_BIOLOGY_BOARD.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J11_BIOLOGY_BOARD.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J11_BIOLOGY_BOARD.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J11_BIOLOGY_BOARD.png","assets/media/vector-artwork/mega/V1_IGNITION_J06_NEON_BLUEPRINT.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J06_NEON_BLUEPRINT.png","assets/media/vector-artwork/mega/NIGHT_PILLS_J13_PILL_GRID.webp":"assets/media/vector-artwork/mega/originals/NIGHT_PILLS_J13_PILL_GRID.png","assets/media/vector-artwork/mega/J09_STATE_A_DAILY_PATTERN.webp":"assets/media/vector-artwork/mega/originals/J09_STATE_A_DAILY_PATTERN.png","assets/media/vector-artwork/mega/V2_REFUEL_J04_NEON_MATRIX.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J04_NEON_MATRIX.png","assets/media/vector-artwork/mega/J06_GYM_SEQUENCE_MASTER.webp":"assets/media/vector-artwork/mega/originals/J06_GYM_SEQUENCE_MASTER.png","assets/media/vector-artwork/mega/AFTERNOON_PILLS_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/AFTERNOON_PILLS_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V4_RELOAD_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/V5_TRANSPORT_J05_CINEMATIC_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J05_CINEMATIC_CONSOLE.png","assets/media/vector-artwork/mega/PRIMER_PILLS_J10_DAILY_CONSOLE.webp":"assets/media/vector-artwork/mega/originals/PRIMER_PILLS_J10_DAILY_CONSOLE.png","assets/media/vector-artwork/mega/J08_VERTICAL_ENGINEERING_MASTER.webp":"assets/media/vector-artwork/mega/originals/J08_VERTICAL_ENGINEERING_MASTER.png","assets/media/vector-artwork/mega/LUNCH_PILLS_J13_PILL_GRID.webp":"assets/media/vector-artwork/mega/originals/LUNCH_PILLS_J13_PILL_GRID.png","assets/media/vector-artwork/mega/J18-PRE-V4_PILLS.webp":"assets/media/vector-artwork/mega/originals/J18-PRE-V4_PILLS.png","assets/media/vector-artwork/mega/V2_REFUEL_J07_MONOCHROME_FLOW.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J07_MONOCHROME_FLOW.png","assets/web/media-october-2026-hydration-loop-960.webp":"assets/media/october-2026/hydration-loop.jpg","assets/web/media-october-2026-gym-august-weights-1200.webp":"assets/media/source-originals/gym-august-weights.jpg","assets/web/img-gear-item-jooeer-500.webp":"assets/img/gear-item-jooeer.jpg","assets/web/img-protein-choco-fudge-480.webp":"assets/img/protein-choco-fudge.jpg","assets/web/media-october-2026-pill-organizer-may-2026-960.webp":"assets/media/october-2026/pill-organizer-may-2026.jpg","assets/web/img-chest-series-001-720.webp":"assets/img/chest-series-001.jpg","assets/web/img-shoulders-up-sessions-480.webp":"assets/img/shoulders-up-sessions.jpg","assets/web/img-mega-salad-mango-chickpea-1200.webp":"assets/img/mega-salad-mango-chickpea.jpg","assets/web/img-gear-rope-carabiners-480.webp":"assets/media/source-originals/gear-rope-carabiners.jpg","assets/web/img-biceps-back-workout-202.webp":"assets/img/biceps-back-workout.jpg","assets/web/img-kinetic-rig-architecture-720.webp":"assets/img/kinetic-rig-architecture.jpg","assets/web/img-protocol-systemic-fueling-800.webp":"assets/img/protocol-systemic-fueling.jpg","assets/web/media-october-2026-bogdan-august-mirror-960.webp":"assets/media/source-originals/bogdan-august-mirror.jpg","assets/web/img-gear-item-miaoke-500.webp":"assets/img/gear-item-miaoke.jpg","assets/web/img-story-2-800.webp":"assets/img/story-2.jpg","assets/web/media-october-2026-gym-august-floor-960.webp":"assets/media/source-originals/gym-august-floor.jpg","assets/web/img-sweat-sundays-480.webp":"assets/img/sweat-sundays.jpg","assets/web/img-gear-item-tricep-rope-1000.webp":"assets/img/gear-item-tricep-rope.jpg","assets/web/media-october-2026-pill-organizer-may-2026-1528.webp":"assets/media/october-2026/pill-organizer-may-2026.jpg","assets/web/media-october-2026-gym-august-weights-480.webp":"assets/media/source-originals/gym-august-weights.jpg","assets/web/img-gear-item-resistance-bar-500.webp":"assets/img/gear-item-resistance-bar.jpg","assets/web/img-plyosoft-core-001-720.webp":"assets/img/plyosoft-core-001.jpg","assets/web/img-gear-item-bluslm-500.webp":"assets/img/gear-item-bluslm.jpg","assets/web/media-october-2026-pill-organizer-february-2026-960.webp":"assets/media/october-2026/pill-organizer-february-2026.jpg","assets/web/img-hero-loop-poster-480.webp":"assets/img/hero-loop-poster.jpg","assets/web/img-gear-item-hxd-ergo-480.webp":"assets/img/gear-item-hxd-ergo.jpg","assets/web/media-october-2026-gym-bench-august-480.webp":"assets/media/source-originals/gym-bench-august.jpg","assets/web/media-october-2026-bogdan-june-2026-480.webp":"assets/media/source-originals/bogdan-june-2026.jpg","assets/web/img-gear-item-angles90-699.webp":"assets/img/gear-item-angles90.jpg","assets/web/media-october-2026-gym-july-turf-960.webp":"assets/media/source-originals/gym-july-turf.jpg","assets/web/img-shoulders-up-sessions-720.webp":"assets/img/shoulders-up-sessions.jpg","assets/web/img-carnivore-omelette-480.webp":"assets/img/carnivore-omelette.jpg","assets/web/img-mega-salad-mango-chickpea-960.webp":"assets/img/mega-salad-mango-chickpea.jpg","assets/web/media-october-2026-nutrition-pantry-july-2026-1200.webp":"assets/media/october-2026/nutrition-pantry-july-2026.jpg","assets/web/img-strength-fridays-480.webp":"assets/img/strength-fridays.jpg","assets/web/img-gym-photo-sled-harness-960.webp":"assets/media/source-originals/bogdan-november-2025.jpg","assets/web/media-october-2026-gym-july-turf-1200.webp":"assets/media/source-originals/gym-july-turf.jpg","assets/web/img-kinetic-rig-architecture-480.webp":"assets/img/kinetic-rig-architecture.jpg","assets/web/img-featured-fuel-check-960.webp":"assets/img/featured-fuel-check.jpg","assets/web/img-gear-item-manueklear-rope-700.webp":"assets/img/gear-item-manueklear-rope.jpg","assets/web/img-gear-item-seleware-500.webp":"assets/img/gear-item-seleware.jpg","assets/web/media-october-2026-nutrition-pantry-july-2026-1528.webp":"assets/media/october-2026/nutrition-pantry-july-2026.jpg","assets/web/img-monday-mornings-locker-room-480.webp":"assets/img/monday-mornings-locker-room.jpg","assets/web/img-gear-item-vehiclex-700.webp":"assets/img/gear-item-vehiclex.jpg","assets/web/img-hypertrophy-friday-720.webp":"assets/img/hypertrophy-friday.jpg","assets/web/img-post-workout-air-fry-meals-721.webp":"assets/img/post-workout-air-fry-meals.jpg","assets/web/img-protein-wrap-trio-480.webp":"assets/img/protein-wrap-trio.jpg","assets/web/media-october-2026-hydration-loop-480.webp":"assets/media/october-2026/hydration-loop.jpg","assets/web/img-protocol-24hr-clock-1000.webp":"assets/img/protocol-24hr-clock.jpg","assets/web/img-mega-salad-kale-tuna-1200.webp":"assets/img/mega-salad-kale-tuna.jpg","assets/web/img-choco-blueberry-recovery-800.webp":"assets/img/choco-blueberry-recovery.jpg","assets/web/img-anabolic-recovery-bowl-480.webp":"assets/img/anabolic-recovery-bowl.jpg","assets/web/media-october-2026-pill-organizer-may-2026-1200.webp":"assets/media/october-2026/pill-organizer-may-2026.jpg","assets/web/img-post-workout-air-fry-meals-480.webp":"assets/img/post-workout-air-fry-meals.jpg","assets/web/img-gear-rope-carabiners-1100.webp":"assets/media/source-originals/gear-rope-carabiners.jpg","assets/web/img-resistance-band-001-720.webp":"assets/img/resistance-band-001.jpg","assets/web/img-gear-item-tricep-rope-480.webp":"assets/img/gear-item-tricep-rope.jpg","assets/web/img-gear-item-rauuueo-500.webp":"assets/img/gear-item-rauuueo.jpg","assets/web/media-october-2026-gym-turf-rig-1200.webp":"assets/media/source-originals/gym-turf-rig.jpg","assets/web/img-objective-100lbs-smm-960.webp":"assets/img/objective-100lbs-smm.jpg","assets/web/media-october-2026-gym-bench-august-1600.webp":"assets/media/source-originals/gym-bench-august.jpg","assets/web/img-gear-rig-setup-480.webp":"assets/media/source-originals/gear-rig-setup.jpg","assets/web/img-hypertrophy-friday-480.webp":"assets/img/hypertrophy-friday.jpg","assets/web/img-protein-berries-smoothie-800.webp":"assets/img/protein-berries-smoothie.jpg","assets/web/img-gear-item-sled-belt-1000.webp":"assets/img/gear-item-sled-belt.jpg","assets/web/media-october-2026-gym-august-floor-480.webp":"assets/media/source-originals/gym-august-floor.jpg","assets/web/img-resistance-band-002-720.webp":"assets/img/resistance-band-002.jpg","assets/web/media-october-2026-pill-organizer-february-2026-1200.webp":"assets/media/october-2026/pill-organizer-february-2026.jpg","assets/web/img-carnivore-omelette-800.webp":"assets/img/carnivore-omelette.jpg","assets/web/img-gear-rig-setup-960.webp":"assets/media/source-originals/gear-rig-setup.jpg","assets/web/img-choco-blueberry-recovery-480.webp":"assets/img/choco-blueberry-recovery.jpg","assets/web/img-anabolic-recovery-bowl-800.webp":"assets/img/anabolic-recovery-bowl.jpg","assets/web/media-october-2026-bogdan-july-2026-960.webp":"assets/media/source-originals/bogdan-july-2026.jpg","assets/web/img-gear-item-angles90-480.webp":"assets/img/gear-item-angles90.jpg","assets/web/media-october-2026-bogdan-gym-session-1600.webp":"assets/media/source-originals/bogdan-gym-session.jpg","assets/web/img-gear-item-xstrap-500.webp":"assets/img/gear-item-xstrap.jpg","assets/web/img-arm-blaster-6x6x6-480.webp":"assets/img/arm-blaster-6x6x6.jpg","assets/web/media-october-2026-bogdan-gym-session-960.webp":"assets/media/source-originals/bogdan-gym-session.jpg","assets/web/media-october-2026-gym-august-floor-1200.webp":"assets/media/source-originals/gym-august-floor.jpg","assets/web/img-gear-item-carabiner-480.webp":"assets/img/gear-item-carabiner.jpg","assets/web/media-october-2026-gym-august-weights-960.webp":"assets/media/source-originals/gym-august-weights.jpg","assets/web/img-gear-rope-carabiners-960.webp":"assets/media/source-originals/gear-rope-carabiners.jpg","assets/web/img-resistance-band-001-480.webp":"assets/img/resistance-band-001.jpg","assets/web/img-gear-item-sled-belt-480.webp":"assets/img/gear-item-sled-belt.jpg","assets/web/img-monday-mornings-locker-room-800.webp":"assets/img/monday-mornings-locker-room.jpg","assets/web/img-gear-item-thefitguy-ext-straps-700.webp":"assets/img/gear-item-thefitguy-ext-straps.jpg","assets/web/img-resistance-band-003-480.webp":"assets/img/resistance-band-003.jpg","assets/web/img-gear-item-nilight-500.webp":"assets/img/gear-item-nilight.jpg","assets/web/img-protein-berries-smoothie-480.webp":"assets/img/protein-berries-smoothie.jpg","assets/web/img-shoulder-push-001-480.webp":"assets/img/shoulder-push-001.jpg","assets/web/img-featured-fuel-check-480.webp":"assets/img/featured-fuel-check.jpg","assets/web/img-story-2-480.webp":"assets/img/story-2.jpg","assets/web/media-october-2026-bogdan-gym-session-1200.webp":"assets/media/source-originals/bogdan-gym-session.jpg","assets/web/img-gear-item-manueklear-rope-480.webp":"assets/img/gear-item-manueklear-rope.jpg","assets/web/img-protein-wrap-trio-800.webp":"assets/img/protein-wrap-trio.jpg","assets/web/img-arms-blast-001-720.webp":"assets/img/arms-blast-001.jpg","assets/web/img-resistance-band-002-480.webp":"assets/img/resistance-band-002.jpg","assets/web/media-october-2026-gym-july-session-1205.webp":"assets/media/source-originals/gym-july-session.jpg","assets/web/img-objective-100lbs-smm-480.webp":"assets/img/objective-100lbs-smm.jpg","assets/web/img-gear-item-hpygn-bands-700.webp":"assets/img/gear-item-hpygn-bands.jpg","assets/web/media-october-2026-gym-bench-august-1200.webp":"assets/media/source-originals/gym-bench-august.jpg","assets/web/media-october-2026-gym-turf-rig-960.webp":"assets/media/source-originals/gym-turf-rig.jpg","assets/web/img-protein-choco-fudge-800.webp":"assets/img/protein-choco-fudge.jpg","assets/web/img-shoulder-push-001-720.webp":"assets/img/shoulder-push-001.jpg","assets/web/img-gear-item-vehiclex-480.webp":"assets/img/gear-item-vehiclex.jpg","assets/web/media-october-2026-bogdan-november-2025-480.webp":"assets/media/source-originals/bogdan-november-2025.jpg","assets/web/img-protocol-24hr-clock-480.webp":"assets/img/protocol-24hr-clock.jpg","assets/web/img-gear-item-innstar-stirrup-700.webp":"assets/img/gear-item-innstar-stirrup.jpg","assets/web/img-strength-fridays-720.webp":"assets/img/strength-fridays.jpg","assets/web/img-protocol-systemic-fueling-480.webp":"assets/img/protocol-systemic-fueling.jpg","assets/web/img-gear-item-hxd-ergo-1000.webp":"assets/img/gear-item-hxd-ergo.jpg","assets/web/img-resistance-band-003-720.webp":"assets/img/resistance-band-003.jpg","assets/web/img-gear-item-vulken-500.webp":"assets/img/gear-item-vulken.jpg","assets/web/media-october-2026-bogdan-gym-session-480.webp":"assets/media/source-originals/bogdan-gym-session.jpg","assets/web/media-october-2026-pill-organizer-february-2026-1600.webp":"assets/media/october-2026/pill-organizer-february-2026.jpg","assets/web/media-october-2026-gym-july-turf-480.webp":"assets/media/source-originals/gym-july-turf.jpg","assets/web/media-october-2026-gym-august-floor-1600.webp":"assets/media/source-originals/gym-august-floor.jpg","assets/web/img-gear-item-thefitguy-ext-straps-480.webp":"assets/img/gear-item-thefitguy-ext-straps.jpg","assets/web/img-story-5-600.webp":"assets/img/story-5.jpg","assets/web/media-october-2026-pill-organizer-february-2026-480.webp":"assets/media/october-2026/pill-organizer-february-2026.jpg","assets/web/media-october-2026-gym-august-weights-1600.webp":"assets/media/source-originals/gym-august-weights.jpg","assets/web/media-october-2026-pill-organizer-may-2026-480.webp":"assets/media/october-2026/pill-organizer-may-2026.jpg","assets/web/img-gym-photo-sled-harness-480.webp":"assets/media/source-originals/bogdan-november-2025.jpg","assets/web/img-gear-item-innstar-stirrup-480.webp":"assets/img/gear-item-innstar-stirrup.jpg","assets/web/media-october-2026-bogdan-june-2026-960.webp":"assets/media/source-originals/bogdan-june-2026.jpg","assets/web/img-chest-series-001-480.webp":"assets/img/chest-series-001.jpg","assets/web/media-october-2026-nutrition-pantry-july-2026-960.webp":"assets/media/october-2026/nutrition-pantry-july-2026.jpg","assets/web/media-october-2026-bogdan-august-mirror-1200.webp":"assets/media/source-originals/bogdan-august-mirror.jpg","assets/web/img-warmups-stretch-001-480.webp":"assets/img/warmups-stretch-001.jpg","assets/web/img-gear-item-cablegeeker-500.webp":"assets/img/gear-item-cablegeeker.jpg","assets/web/media-october-2026-gym-july-session-960.webp":"assets/media/source-originals/gym-july-session.jpg","assets/web/img-hero-loop-poster-960.webp":"assets/img/hero-loop-poster.jpg","assets/web/media-october-2026-gym-turf-rig-1600.webp":"assets/media/source-originals/gym-turf-rig.jpg","assets/web/img-gear-item-hpygn-bands-480.webp":"assets/img/gear-item-hpygn-bands.jpg","assets/web/img-warmups-stretch-001-720.webp":"assets/img/warmups-stretch-001.jpg","assets/web/img-mega-salad-kale-tuna-960.webp":"assets/img/mega-salad-kale-tuna.jpg","assets/web/media-october-2026-gym-bench-august-960.webp":"assets/media/source-originals/gym-bench-august.jpg","assets/web/img-arms-blast-001-480.webp":"assets/img/arms-blast-001.jpg","assets/web/img-mega-salad-kale-tuna-480.webp":"assets/img/mega-salad-kale-tuna.jpg","assets/web/media-october-2026-gym-turf-rig-480.webp":"assets/media/source-originals/gym-turf-rig.jpg","assets/web/img-plyosoft-core-001-480.webp":"assets/img/plyosoft-core-001.jpg","assets/web/media-october-2026-bogdan-july-2026-480.webp":"assets/media/source-originals/bogdan-july-2026.jpg","assets/web/img-sweat-sundays-709.webp":"assets/img/sweat-sundays.jpg","assets/web/img-gym-photo-sled-harness-1200.webp":"assets/media/source-originals/bogdan-november-2025.jpg","assets/web/img-story-5-480.webp":"assets/img/story-5.jpg","assets/web/media-october-2026-bogdan-august-mirror-480.webp":"assets/media/source-originals/bogdan-august-mirror.jpg","assets/web/media-october-2026-bogdan-november-2025-960.webp":"assets/media/source-originals/bogdan-november-2025.jpg","assets/web/img-arm-blaster-6x6x6-720.webp":"assets/img/arm-blaster-6x6x6.jpg","assets/web/img-mega-salad-mango-chickpea-480.webp":"assets/img/mega-salad-mango-chickpea.jpg","assets/web/img-gear-item-tubing-308.webp":"assets/img/gear-item-tubing.jpg","assets/web/media-october-2026-gym-july-session-480.webp":"assets/media/source-originals/gym-july-session.jpg","assets/web/img-objective-100lbs-smm-1200.webp":"assets/img/objective-100lbs-smm.jpg","assets/web/img-gear-rig-setup-1100.webp":"assets/media/source-originals/gear-rig-setup.jpg","assets/web/media-october-2026-nutrition-pantry-july-2026-480.webp":"assets/media/october-2026/nutrition-pantry-july-2026.jpg","assets/web/img-gear-item-carabiner-1000.webp":"assets/img/gear-item-carabiner.jpg","assets/web/mega/V2_REFUEL_J04_NEON_MATRIX--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J04_NEON_MATRIX.png","assets/web/mega/V6_PUMP_J12_PRINT_RECIPE--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J12_PRINT_RECIPE.png","assets/web/mega/V1_IGNITION_J11_BIOLOGY_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J11_BIOLOGY_BOARD.png","assets/web/mega/V5_TRANSPORT_J12_PRINT_RECIPE--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J12_PRINT_RECIPE.png","assets/web/mega/J18-PRIMER_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J18-PRIMER_PILLS.png","assets/web/mega/V3_RECOVERY_J16_ROUNDED_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J16_ROUNDED_BOARD.png","assets/web/mega/J09_COMBINED_DAILY_PATTERNS_ABC--w480.webp":"assets/media/vector-artwork/mega/originals/J09_COMBINED_DAILY_PATTERNS_ABC.png","assets/web/mega/BREAKFAST_PILLS_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/BREAKFAST_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/J18_PILL_ARCHITECTURE_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J18_PILL_ARCHITECTURE_MASTER.png","assets/web/mega/V2_REFUEL_J16_ROUNDED_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J16_ROUNDED_BOARD.png","assets/web/mega/V4_RELOAD_J05_CINEMATIC_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J05_CINEMATIC_CONSOLE.png","assets/web/mega/J14-STATE-C_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J14-STATE-C_PILLS.png","assets/web/mega/LUNCH_PILLS_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/LUNCH_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/V4_RELOAD_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J10_DAILY_CONSOLE.png","assets/web/mega/V3_RECOVERY_J17_VECTOR_ARCHITECTURE--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/WAKE_PILLS_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/WAKE_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/V3_RECOVERY_J05_CINEMATIC_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J05_CINEMATIC_CONSOLE.png","assets/web/mega/V6_PUMP_J05_CINEMATIC_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J05_CINEMATIC_CONSOLE.png","assets/web/mega/J11_SCIENTIFIC_BOARD_MASTER--w1200.webp":"assets/media/vector-artwork/mega/originals/J11_SCIENTIFIC_BOARD_MASTER.png","assets/web/mega/V10_SHUTDOWN_J04_NEON_MATRIX--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J04_NEON_MATRIX.png","assets/web/mega/V10_SHUTDOWN_J12_PRINT_RECIPE--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J12_PRINT_RECIPE.png","assets/web/mega/J06_GYM_SEQUENCE_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J06_GYM_SEQUENCE_MASTER.png","assets/web/mega/V10_SHUTDOWN_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J10_DAILY_CONSOLE.png","assets/web/mega/V6_PUMP_J03_CLINICAL_ANATOMY--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J03_CLINICAL_ANATOMY.png","assets/web/mega/V6_PUMP_J19_GYM_PANEL--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J19_GYM_PANEL.png","assets/web/mega/J15-PRIMER_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J15-PRIMER_PILLS.png","assets/web/mega/J19_GYM_SEQUENCE_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J19_GYM_SEQUENCE_MASTER.png","assets/web/mega/V5_TRANSPORT_J05_CINEMATIC_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J05_CINEMATIC_CONSOLE.png","assets/web/mega/WAKE_PILLS_J13_PILL_GRID--w480.webp":"assets/media/vector-artwork/mega/originals/WAKE_PILLS_J13_PILL_GRID.png","assets/web/mega/J09_STATE_C_DAILY_PATTERN--w480.webp":"assets/media/vector-artwork/mega/originals/J09_STATE_C_DAILY_PATTERN.png","assets/web/mega/V2_REFUEL_J05_CINEMATIC_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J05_CINEMATIC_CONSOLE.png","assets/web/mega/V3_RECOVERY_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J10_DAILY_CONSOLE.png","assets/web/mega/V2_REFUEL_J04_NEON_MATRIX--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J04_NEON_MATRIX.png","assets/web/mega/J15-AFTERNOON_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J15-AFTERNOON_PILLS.png","assets/web/mega/V6_PUMP_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J10_DAILY_CONSOLE.png","assets/web/mega/V2_REFUEL_J05_CINEMATIC_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J05_CINEMATIC_CONSOLE.png","assets/web/mega/PRE-V4_PILLS_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/PRE-V4_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/V4_RELOAD_J04_NEON_MATRIX--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J04_NEON_MATRIX.png","assets/web/mega/V4_RELOAD_J11_BIOLOGY_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J11_BIOLOGY_BOARD.png","assets/web/mega/V3_RECOVERY_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J10_DAILY_CONSOLE.png","assets/web/mega/V6_PUMP_J05_CINEMATIC_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J05_CINEMATIC_CONSOLE.png","assets/web/mega/V6_PUMP_J11_BIOLOGY_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J11_BIOLOGY_BOARD.png","assets/web/mega/V1_IGNITION_J12_PRINT_RECIPE--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J12_PRINT_RECIPE.png","assets/web/mega/V6_PUMP_J06_NEON_BLUEPRINT--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J06_NEON_BLUEPRINT.png","assets/web/mega/V2_REFUEL_J19_WHITE_BLUEPRINT--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J19_WHITE_BLUEPRINT.png","assets/web/mega/V5_TRANSPORT_J08_ENGINEERING--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J08_ENGINEERING.png","assets/web/mega/V6_PUMP_J04_NEON_MATRIX--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J04_NEON_MATRIX.png","assets/web/mega/V1_IGNITION_J16_ROUNDED_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J16_ROUNDED_BOARD.png","assets/web/mega/V4_RELOAD_J03_CLINICAL_ANATOMY--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J03_CLINICAL_ANATOMY.png","assets/web/mega/V1_IGNITION_J08_ENGINEERING--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J08_ENGINEERING.png","assets/web/mega/V5_TRANSPORT_J07_MONOCHROME_FLOW--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J07_MONOCHROME_FLOW.png","assets/web/mega/J18-PRIMER_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J18-PRIMER_PILLS.png","assets/web/mega/V5_TRANSPORT_J11_BIOLOGY_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J11_BIOLOGY_BOARD.png","assets/web/mega/R_ALA_J06_NEON_BLUEPRINT--w800.webp":"assets/media/vector-artwork/mega/originals/R_ALA_J06_NEON_BLUEPRINT.png","assets/web/mega/J15-PRE-V4_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J15-PRE-V4_PILLS.png","assets/web/mega/V4_RELOAD_J06_NEON_BLUEPRINT--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J06_NEON_BLUEPRINT.png","assets/web/mega/V1_IGNITION_J04_NEON_MATRIX--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J04_NEON_MATRIX.png","assets/web/mega/J18-LUNCH_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J18-LUNCH_PILLS.png","assets/web/mega/J09_STATE_B_DAILY_PATTERN--w480.webp":"assets/media/vector-artwork/mega/originals/J09_STATE_B_DAILY_PATTERN.png","assets/web/mega/V2_REFUEL_J12_PRINT_RECIPE--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J12_PRINT_RECIPE.png","assets/web/mega/V4_RELOAD_J19_WHITE_BLUEPRINT--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J19_WHITE_BLUEPRINT.png","assets/web/mega/J18-PRE-V4_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J18-PRE-V4_PILLS.png","assets/web/mega/V1_IGNITION_J06_NEON_BLUEPRINT--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J06_NEON_BLUEPRINT.png","assets/web/mega/V4_RELOAD_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J10_DAILY_CONSOLE.png","assets/web/mega/V6_PUMP_J07_MONOCHROME_FLOW--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J07_MONOCHROME_FLOW.png","assets/web/mega/V6_PUMP_J12_PRINT_RECIPE--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J12_PRINT_RECIPE.png","assets/web/mega/V3_RECOVERY_J11_BIOLOGY_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J11_BIOLOGY_BOARD.png","assets/web/mega/J14_LIQUID_PILL_CROSSCHECK_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J14_LIQUID_PILL_CROSSCHECK_MASTER.png","assets/web/mega/V4_RELOAD_J06_NEON_BLUEPRINT--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J06_NEON_BLUEPRINT.png","assets/web/mega/J09_STATE_A_DAILY_PATTERN--w480.webp":"assets/media/vector-artwork/mega/originals/J09_STATE_A_DAILY_PATTERN.png","assets/web/mega/V1_IGNITION_J06_NEON_BLUEPRINT--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J06_NEON_BLUEPRINT.png","assets/web/mega/V10_SHUTDOWN_J03_CLINICAL_ANATOMY--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J03_CLINICAL_ANATOMY.png","assets/web/mega/V6_PUMP_J08_ENGINEERING--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J08_ENGINEERING.png","assets/web/mega/J14-STATE-B_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J14-STATE-B_PILLS.png","assets/web/mega/V6_PUMP_J07_MONOCHROME_FLOW--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J07_MONOCHROME_FLOW.png","assets/web/mega/NIGHT_PILLS_J13_PILL_GRID--w480.webp":"assets/media/vector-artwork/mega/originals/NIGHT_PILLS_J13_PILL_GRID.png","assets/web/mega/J04_NEON_RECIPE_MATRIX_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J04_NEON_RECIPE_MATRIX_MASTER.png","assets/web/mega/V1_IGNITION_J03_CLINICAL_ANATOMY--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J03_CLINICAL_ANATOMY.png","assets/web/mega/BREAKFAST_PILLS_J13_PILL_GRID--w800.webp":"assets/media/vector-artwork/mega/originals/BREAKFAST_PILLS_J13_PILL_GRID.png","assets/web/mega/J11_SCIENTIFIC_BOARD_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J11_SCIENTIFIC_BOARD_MASTER.png","assets/web/mega/V5_TRANSPORT_J04_NEON_MATRIX--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J04_NEON_MATRIX.png","assets/web/mega/J15_FULL_PILL_CHRONOMETER--w800.webp":"assets/media/vector-artwork/mega/originals/J15_FULL_PILL_CHRONOMETER.png","assets/web/mega/J18-AFTERNOON_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J18-AFTERNOON_PILLS.png","assets/web/mega/V3_RECOVERY_J12_PRINT_RECIPE--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J12_PRINT_RECIPE.png","assets/web/mega/J13_PILL_GRID_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J13_PILL_GRID_MASTER.png","assets/web/mega/V2_REFUEL_J06_NEON_BLUEPRINT--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J06_NEON_BLUEPRINT.png","assets/web/mega/J10_FULL_DAILY_INTAKE_STATE_A--w480.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_A.png","assets/web/mega/PRIMER_PILLS_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/PRIMER_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/J16_GRID_PAPER_VESSEL_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J16_GRID_PAPER_VESSEL_MASTER.png","assets/web/mega/J18-WAKE_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J18-WAKE_PILLS.png","assets/web/mega/V2_REFUEL_J17_VECTOR_ARCHITECTURE--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V6_PUMP_J17_VECTOR_ARCHITECTURE--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V10_SHUTDOWN_J07_MONOCHROME_FLOW--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J07_MONOCHROME_FLOW.png","assets/web/mega/J05_CINEMATIC_CONSOLE_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J05_CINEMATIC_CONSOLE_MASTER.png","assets/web/mega/V5_TRANSPORT_J12_PRINT_RECIPE--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J12_PRINT_RECIPE.png","assets/web/mega/J19_GYM_SEQUENCE_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J19_GYM_SEQUENCE_MASTER.png","assets/web/mega/V4_RELOAD_J08_ENGINEERING--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J08_ENGINEERING.png","assets/web/mega/J15-WAKE_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J15-WAKE_PILLS.png","assets/web/mega/R_ALA_J06_NEON_BLUEPRINT--w480.webp":"assets/media/vector-artwork/mega/originals/R_ALA_J06_NEON_BLUEPRINT.png","assets/web/mega/V1_IGNITION_J05_CINEMATIC_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J05_CINEMATIC_CONSOLE.png","assets/web/mega/J10_FULL_DAILY_INTAKE_STATE_C--w1200.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_C.png","assets/web/mega/V3_RECOVERY_J08_ENGINEERING--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J08_ENGINEERING.png","assets/web/mega/V3_RECOVERY_J11_BIOLOGY_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J11_BIOLOGY_BOARD.png","assets/web/mega/V10_SHUTDOWN_J11_BIOLOGY_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J11_BIOLOGY_BOARD.png","assets/web/mega/V1_IGNITION_J17_VECTOR_ARCHITECTURE--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V10_SHUTDOWN_J08_ENGINEERING--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J08_ENGINEERING.png","assets/web/mega/V4_RELOAD_J04_NEON_MATRIX--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J04_NEON_MATRIX.png","assets/web/mega/V1_IGNITION_J17_VECTOR_ARCHITECTURE--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V6_PUMP_J17_VECTOR_ARCHITECTURE--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V2_REFUEL_J08_ENGINEERING--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J08_ENGINEERING.png","assets/web/mega/J13_PILL_GRID_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J13_PILL_GRID_MASTER.png","assets/web/mega/J07_MONOCHROME_FLOW_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J07_MONOCHROME_FLOW_MASTER.png","assets/web/mega/V5_TRANSPORT_J04_NEON_MATRIX--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J04_NEON_MATRIX.png","assets/web/mega/V3_RECOVERY_J12_PRINT_RECIPE--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J12_PRINT_RECIPE.png","assets/web/mega/J18-NIGHT_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J18-NIGHT_PILLS.png","assets/web/mega/J14_LIQUID_PILL_CROSSCHECK_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J14_LIQUID_PILL_CROSSCHECK_MASTER.png","assets/web/mega/V5_TRANSPORT_J17_VECTOR_ARCHITECTURE--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/J15-LUNCH_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J15-LUNCH_PILLS.png","assets/web/mega/J03_CLINICAL_ANATOMY_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J03_CLINICAL_ANATOMY_MASTER.png","assets/web/mega/J18-BREAKFAST_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J18-BREAKFAST_PILLS.png","assets/web/mega/J14-STATE-B_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J14-STATE-B_PILLS.png","assets/web/mega/V1_IGNITION_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J10_DAILY_CONSOLE.png","assets/web/mega/J10_FULL_DAILY_INTAKE_STATE_A--w1200.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_A.png","assets/web/mega/V2_REFUEL_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J10_DAILY_CONSOLE.png","assets/web/mega/J05_CINEMATIC_CONSOLE_MASTER--w1200.webp":"assets/media/vector-artwork/mega/originals/J05_CINEMATIC_CONSOLE_MASTER.png","assets/web/mega/V2_REFUEL_J07_MONOCHROME_FLOW--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J07_MONOCHROME_FLOW.png","assets/web/mega/BREAKFAST_PILLS_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/BREAKFAST_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/V4_RELOAD_J19_WHITE_BLUEPRINT--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J19_WHITE_BLUEPRINT.png","assets/web/mega/V4_RELOAD_J07_MONOCHROME_FLOW--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J07_MONOCHROME_FLOW.png","assets/web/mega/PRIMER_PILLS_J13_PILL_GRID--w480.webp":"assets/media/vector-artwork/mega/originals/PRIMER_PILLS_J13_PILL_GRID.png","assets/web/mega/V3_RECOVERY_J08_ENGINEERING--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J08_ENGINEERING.png","assets/web/mega/J11_SCIENTIFIC_BOARD_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J11_SCIENTIFIC_BOARD_MASTER.png","assets/web/mega/LUNCH_PILLS_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/LUNCH_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/WAKE_PILLS_J13_PILL_GRID--w800.webp":"assets/media/vector-artwork/mega/originals/WAKE_PILLS_J13_PILL_GRID.png","assets/web/mega/J15-NIGHT_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J15-NIGHT_PILLS.png","assets/web/mega/J12_SIX_VECTOR_RECIPE_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J12_SIX_VECTOR_RECIPE_MASTER.png","assets/web/mega/V1_IGNITION_J07_MONOCHROME_FLOW--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J07_MONOCHROME_FLOW.png","assets/web/mega/BREAKFAST_PILLS_J13_PILL_GRID--w480.webp":"assets/media/vector-artwork/mega/originals/BREAKFAST_PILLS_J13_PILL_GRID.png","assets/web/mega/LUNCH_PILLS_J13_PILL_GRID--w480.webp":"assets/media/vector-artwork/mega/originals/LUNCH_PILLS_J13_PILL_GRID.png","assets/web/mega/V4_RELOAD_J17_VECTOR_ARCHITECTURE--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V1_IGNITION_J07_MONOCHROME_FLOW--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J07_MONOCHROME_FLOW.png","assets/web/mega/V3_RECOVERY_J04_NEON_MATRIX--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J04_NEON_MATRIX.png","assets/web/mega/J18-LUNCH_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J18-LUNCH_PILLS.png","assets/web/mega/V10_SHUTDOWN_J17_VECTOR_ARCHITECTURE--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V10_SHUTDOWN_J08_ENGINEERING--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J08_ENGINEERING.png","assets/web/mega/J15-PRIMER_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J15-PRIMER_PILLS.png","assets/web/mega/LUNCH_PILLS_J13_PILL_GRID--w800.webp":"assets/media/vector-artwork/mega/originals/LUNCH_PILLS_J13_PILL_GRID.png","assets/web/mega/J09_STATE_A_DAILY_PATTERN--w800.webp":"assets/media/vector-artwork/mega/originals/J09_STATE_A_DAILY_PATTERN.png","assets/web/mega/V10_SHUTDOWN_J05_CINEMATIC_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J05_CINEMATIC_CONSOLE.png","assets/web/mega/J10_FULL_DAILY_INTAKE_STATE_C--w800.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_C.png","assets/web/mega/V3_RECOVERY_J17_VECTOR_ARCHITECTURE--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/J17_VECTOR_ARCHITECTURE_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J17_VECTOR_ARCHITECTURE_MASTER.png","assets/web/mega/PRE-V4_PILLS_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/PRE-V4_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/J14-STATE-C_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J14-STATE-C_PILLS.png","assets/web/mega/J15-BREAKFAST_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J15-BREAKFAST_PILLS.png","assets/web/mega/V6_PUMP_J06_NEON_BLUEPRINT--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J06_NEON_BLUEPRINT.png","assets/web/mega/V2_REFUEL_J16_ROUNDED_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J16_ROUNDED_BOARD.png","assets/web/mega/V2_REFUEL_J03_CLINICAL_ANATOMY--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J03_CLINICAL_ANATOMY.png","assets/web/mega/J10_FULL_DAILY_INTAKE_STATE_A--w800.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_A.png","assets/web/mega/V2_REFUEL_J17_VECTOR_ARCHITECTURE--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V1_IGNITION_J05_CINEMATIC_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J05_CINEMATIC_CONSOLE.png","assets/web/mega/V2_REFUEL_J07_MONOCHROME_FLOW--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J07_MONOCHROME_FLOW.png","assets/web/mega/J10_FULL_DAILY_INTAKE_STATE_B--w800.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_B.png","assets/web/mega/PRIMER_PILLS_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/PRIMER_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/J18-BREAKFAST_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J18-BREAKFAST_PILLS.png","assets/web/mega/V10_SHUTDOWN_J03_CLINICAL_ANATOMY--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J03_CLINICAL_ANATOMY.png","assets/web/mega/J10_FULL_DAILY_INTAKE_STATE_C--w480.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_C.png","assets/web/mega/NIGHT_PILLS_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/NIGHT_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/V6_PUMP_J04_NEON_MATRIX--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J04_NEON_MATRIX.png","assets/web/mega/V6_PUMP_J16_ROUNDED_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J16_ROUNDED_BOARD.png","assets/web/mega/V6_PUMP_J16_ROUNDED_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J16_ROUNDED_BOARD.png","assets/web/mega/J16_GRID_PAPER_VESSEL_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J16_GRID_PAPER_VESSEL_MASTER.png","assets/web/mega/V10_SHUTDOWN_J12_PRINT_RECIPE--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J12_PRINT_RECIPE.png","assets/web/mega/V4_RELOAD_J11_BIOLOGY_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J11_BIOLOGY_BOARD.png","assets/web/mega/V1_IGNITION_J11_BIOLOGY_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J11_BIOLOGY_BOARD.png","assets/web/mega/V10_SHUTDOWN_J05_CINEMATIC_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J05_CINEMATIC_CONSOLE.png","assets/web/mega/J19_GYM_SEQUENCE_MASTER--w1200.webp":"assets/media/vector-artwork/mega/originals/J19_GYM_SEQUENCE_MASTER.png","assets/web/mega/J18_PILL_ARCHITECTURE_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J18_PILL_ARCHITECTURE_MASTER.png","assets/web/mega/J08_VERTICAL_ENGINEERING_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J08_VERTICAL_ENGINEERING_MASTER.png","assets/web/mega/V5_TRANSPORT_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J10_DAILY_CONSOLE.png","assets/web/mega/J06_GYM_SEQUENCE_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J06_GYM_SEQUENCE_MASTER.png","assets/web/mega/AFTERNOON_PILLS_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/AFTERNOON_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/V6_PUMP_J11_BIOLOGY_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J11_BIOLOGY_BOARD.png","assets/web/mega/R-ALA_PILLS_J19_GYM_PANEL--w480.webp":"assets/media/vector-artwork/mega/originals/R-ALA_PILLS_J19_GYM_PANEL.png","assets/web/mega/V2_REFUEL_J11_BIOLOGY_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J11_BIOLOGY_BOARD.png","assets/web/mega/V2_REFUEL_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J10_DAILY_CONSOLE.png","assets/web/mega/V5_TRANSPORT_J05_CINEMATIC_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J05_CINEMATIC_CONSOLE.png","assets/web/mega/V1_IGNITION_J08_ENGINEERING--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J08_ENGINEERING.png","assets/web/mega/J06_GYM_SEQUENCE_MASTER--w1200.webp":"assets/media/vector-artwork/mega/originals/J06_GYM_SEQUENCE_MASTER.png","assets/web/mega/V3_RECOVERY_J07_MONOCHROME_FLOW--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J07_MONOCHROME_FLOW.png","assets/web/mega/V1_IGNITION_J04_NEON_MATRIX--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J04_NEON_MATRIX.png","assets/web/mega/AFTERNOON_PILLS_J13_PILL_GRID--w800.webp":"assets/media/vector-artwork/mega/originals/AFTERNOON_PILLS_J13_PILL_GRID.png","assets/web/mega/V5_TRANSPORT_J11_BIOLOGY_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J11_BIOLOGY_BOARD.png","assets/web/mega/J12_SIX_VECTOR_RECIPE_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J12_SIX_VECTOR_RECIPE_MASTER.png","assets/web/mega/J18-PRE-V4_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J18-PRE-V4_PILLS.png","assets/web/mega/V3_RECOVERY_J04_NEON_MATRIX--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J04_NEON_MATRIX.png","assets/web/mega/R-ALA_PILLS_J19_GYM_PANEL--w800.webp":"assets/media/vector-artwork/mega/originals/R-ALA_PILLS_J19_GYM_PANEL.png","assets/web/mega/V2_REFUEL_J06_NEON_BLUEPRINT--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J06_NEON_BLUEPRINT.png","assets/web/mega/J08_VERTICAL_ENGINEERING_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J08_VERTICAL_ENGINEERING_MASTER.png","assets/web/mega/V10_SHUTDOWN_J07_MONOCHROME_FLOW--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J07_MONOCHROME_FLOW.png","assets/web/mega/V5_TRANSPORT_J08_ENGINEERING--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J08_ENGINEERING.png","assets/web/mega/J09_COMBINED_DAILY_PATTERNS_ABC--w1200.webp":"assets/media/vector-artwork/mega/originals/J09_COMBINED_DAILY_PATTERNS_ABC.png","assets/web/mega/J15-AFTERNOON_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J15-AFTERNOON_PILLS.png","assets/web/mega/J09_STATE_B_DAILY_PATTERN--w800.webp":"assets/media/vector-artwork/mega/originals/J09_STATE_B_DAILY_PATTERN.png","assets/web/mega/V10_SHUTDOWN_J11_BIOLOGY_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J11_BIOLOGY_BOARD.png","assets/web/mega/V4_RELOAD_J03_CLINICAL_ANATOMY--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J03_CLINICAL_ANATOMY.png","assets/web/mega/V3_RECOVERY_J05_CINEMATIC_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J05_CINEMATIC_CONSOLE.png","assets/web/mega/V10_SHUTDOWN_J16_GRID_PAPER--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J16_GRID_PAPER.png","assets/web/mega/V5_TRANSPORT_J03_CLINICAL_ANATOMY--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J03_CLINICAL_ANATOMY.png","assets/web/mega/NIGHT_PILLS_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/NIGHT_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/V2_REFUEL_J12_PRINT_RECIPE--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J12_PRINT_RECIPE.png","assets/web/mega/J14-STATE-A_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J14-STATE-A_PILLS.png","assets/web/mega/V6_PUMP_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J10_DAILY_CONSOLE.png","assets/web/mega/V4_RELOAD_J12_PRINT_RECIPE--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J12_PRINT_RECIPE.png","assets/web/mega/J15-NIGHT_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J15-NIGHT_PILLS.png","assets/web/mega/J07_MONOCHROME_FLOW_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J07_MONOCHROME_FLOW_MASTER.png","assets/web/mega/PRIMER_PILLS_J13_PILL_GRID--w800.webp":"assets/media/vector-artwork/mega/originals/PRIMER_PILLS_J13_PILL_GRID.png","assets/web/mega/V5_TRANSPORT_J16_ROUNDED_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J16_ROUNDED_BOARD.png","assets/web/mega/J03_CLINICAL_ANATOMY_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J03_CLINICAL_ANATOMY_MASTER.png","assets/web/mega/V3_RECOVERY_J16_ROUNDED_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J16_ROUNDED_BOARD.png","assets/web/mega/V10_SHUTDOWN_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J10_DAILY_CONSOLE.png","assets/web/mega/V4_RELOAD_J07_MONOCHROME_FLOW--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J07_MONOCHROME_FLOW.png","assets/web/mega/V1_IGNITION_J19_WHITE_BLUEPRINT--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J19_WHITE_BLUEPRINT.png","assets/web/mega/V5_TRANSPORT_J07_MONOCHROME_FLOW--w800.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J07_MONOCHROME_FLOW.png","assets/web/mega/J04_NEON_RECIPE_MATRIX_MASTER--w1200.webp":"assets/media/vector-artwork/mega/originals/J04_NEON_RECIPE_MATRIX_MASTER.png","assets/web/mega/V4_RELOAD_J17_VECTOR_ARCHITECTURE--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V4_RELOAD_J12_PRINT_RECIPE--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J12_PRINT_RECIPE.png","assets/web/mega/AFTERNOON_PILLS_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/AFTERNOON_PILLS_J10_DAILY_CONSOLE.png","assets/web/mega/J17_VECTOR_ARCHITECTURE_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J17_VECTOR_ARCHITECTURE_MASTER.png","assets/web/mega/V1_IGNITION_J12_PRINT_RECIPE--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J12_PRINT_RECIPE.png","assets/web/mega/NIGHT_PILLS_J13_PILL_GRID--w800.webp":"assets/media/vector-artwork/mega/originals/NIGHT_PILLS_J13_PILL_GRID.png","assets/web/mega/J10_FULL_DAILY_INTAKE_STATE_B--w480.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_B.png","assets/web/mega/V4_RELOAD_J05_CINEMATIC_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J05_CINEMATIC_CONSOLE.png","assets/web/mega/V3_RECOVERY_J03_CLINICAL_ANATOMY--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J03_CLINICAL_ANATOMY.png","assets/web/mega/J04_NEON_RECIPE_MATRIX_MASTER--w800.webp":"assets/media/vector-artwork/mega/originals/J04_NEON_RECIPE_MATRIX_MASTER.png","assets/web/mega/J18-NIGHT_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J18-NIGHT_PILLS.png","assets/web/mega/J15_FULL_PILL_CHRONOMETER--w480.webp":"assets/media/vector-artwork/mega/originals/J15_FULL_PILL_CHRONOMETER.png","assets/web/mega/V4_RELOAD_J08_ENGINEERING--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J08_ENGINEERING.png","assets/web/mega/V5_TRANSPORT_J03_CLINICAL_ANATOMY--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J03_CLINICAL_ANATOMY.png","assets/web/mega/J18-AFTERNOON_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J18-AFTERNOON_PILLS.png","assets/web/mega/V3_RECOVERY_J03_CLINICAL_ANATOMY--w480.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J03_CLINICAL_ANATOMY.png","assets/web/mega/J18-WAKE_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J18-WAKE_PILLS.png","assets/web/mega/V6_PUMP_J19_GYM_PANEL--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J19_GYM_PANEL.png","assets/web/mega/V6_PUMP_J03_CLINICAL_ANATOMY--w800.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J03_CLINICAL_ANATOMY.png","assets/web/mega/J16_GRID_PAPER_VESSEL_MASTER--w1200.webp":"assets/media/vector-artwork/mega/originals/J16_GRID_PAPER_VESSEL_MASTER.png","assets/web/mega/V2_REFUEL_J11_BIOLOGY_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J11_BIOLOGY_BOARD.png","assets/web/mega/V10_SHUTDOWN_J04_NEON_MATRIX--w800.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J04_NEON_MATRIX.png","assets/web/mega/J15-BREAKFAST_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J15-BREAKFAST_PILLS.png","assets/web/mega/J14-STATE-A_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J14-STATE-A_PILLS.png","assets/web/mega/J10_FULL_DAILY_INTAKE_STATE_B--w1200.webp":"assets/media/vector-artwork/mega/originals/J10_FULL_DAILY_INTAKE_STATE_B.png","assets/web/mega/J09_COMBINED_DAILY_PATTERNS_ABC--w800.webp":"assets/media/vector-artwork/mega/originals/J09_COMBINED_DAILY_PATTERNS_ABC.png","assets/web/mega/J09_STATE_C_DAILY_PATTERN--w800.webp":"assets/media/vector-artwork/mega/originals/J09_STATE_C_DAILY_PATTERN.png","assets/web/mega/J12_SIX_VECTOR_RECIPE_MASTER--w1200.webp":"assets/media/vector-artwork/mega/originals/J12_SIX_VECTOR_RECIPE_MASTER.png","assets/web/mega/J05_CINEMATIC_CONSOLE_MASTER--w480.webp":"assets/media/vector-artwork/mega/originals/J05_CINEMATIC_CONSOLE_MASTER.png","assets/web/mega/V1_IGNITION_J16_ROUNDED_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J16_ROUNDED_BOARD.png","assets/web/mega/J15-WAKE_PILLS--w480.webp":"assets/media/vector-artwork/mega/originals/J15-WAKE_PILLS.png","assets/web/mega/V4_RELOAD_J16_ROUNDED_BOARD--w800.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J16_ROUNDED_BOARD.png","assets/web/mega/V1_IGNITION_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J10_DAILY_CONSOLE.png","assets/web/mega/J15-LUNCH_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J15-LUNCH_PILLS.png","assets/web/mega/V4_RELOAD_J06_NEON_BLUEPRINT--w1200.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J06_NEON_BLUEPRINT.png","assets/web/mega/V2_REFUEL_J19_WHITE_BLUEPRINT--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J19_WHITE_BLUEPRINT.png","assets/web/mega/PRE-V4_PILLS_J13_PILL_GRID--w480.webp":"assets/media/vector-artwork/mega/originals/PRE-V4_PILLS_J13_PILL_GRID.png","assets/web/mega/PRE-V4_PILLS_J13_PILL_GRID--w800.webp":"assets/media/vector-artwork/mega/originals/PRE-V4_PILLS_J13_PILL_GRID.png","assets/web/mega/V6_PUMP_J08_ENGINEERING--w480.webp":"assets/media/vector-artwork/mega/originals/V6_PUMP_J08_ENGINEERING.png","assets/web/mega/V10_SHUTDOWN_J17_VECTOR_ARCHITECTURE--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V2_REFUEL_J03_CLINICAL_ANATOMY--w480.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J03_CLINICAL_ANATOMY.png","assets/web/mega/V1_IGNITION_J19_WHITE_BLUEPRINT--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J19_WHITE_BLUEPRINT.png","assets/web/mega/V3_RECOVERY_J07_MONOCHROME_FLOW--w800.webp":"assets/media/vector-artwork/mega/originals/V3_RECOVERY_J07_MONOCHROME_FLOW.png","assets/web/mega/AFTERNOON_PILLS_J13_PILL_GRID--w480.webp":"assets/media/vector-artwork/mega/originals/AFTERNOON_PILLS_J13_PILL_GRID.png","assets/web/mega/J15-PRE-V4_PILLS--w800.webp":"assets/media/vector-artwork/mega/originals/J15-PRE-V4_PILLS.png","assets/web/mega/J07_MONOCHROME_FLOW_MASTER--w1200.webp":"assets/media/vector-artwork/mega/originals/J07_MONOCHROME_FLOW_MASTER.png","assets/web/mega/V5_TRANSPORT_J17_VECTOR_ARCHITECTURE--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J17_VECTOR_ARCHITECTURE.png","assets/web/mega/V4_RELOAD_J16_ROUNDED_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V4_RELOAD_J16_ROUNDED_BOARD.png","assets/web/mega/V5_TRANSPORT_J10_DAILY_CONSOLE--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J10_DAILY_CONSOLE.png","assets/web/mega/V2_REFUEL_J08_ENGINEERING--w800.webp":"assets/media/vector-artwork/mega/originals/V2_REFUEL_J08_ENGINEERING.png","assets/web/mega/V5_TRANSPORT_J16_ROUNDED_BOARD--w480.webp":"assets/media/vector-artwork/mega/originals/V5_TRANSPORT_J16_ROUNDED_BOARD.png","assets/web/mega/V1_IGNITION_J03_CLINICAL_ANATOMY--w800.webp":"assets/media/vector-artwork/mega/originals/V1_IGNITION_J03_CLINICAL_ANATOMY.png","assets/web/mega/V10_SHUTDOWN_J16_GRID_PAPER--w480.webp":"assets/media/vector-artwork/mega/originals/V10_SHUTDOWN_J16_GRID_PAPER.png","assets/web/mega/WAKE_PILLS_J10_DAILY_CONSOLE--w800.webp":"assets/media/vector-artwork/mega/originals/WAKE_PILLS_J10_DAILY_CONSOLE.png","assets/img/gear-rope-carabiners.webp":"assets/media/source-originals/gear-rope-carabiners.jpg","assets/img/protein-choco-fudge.webp":"assets/img/protein-choco-fudge.jpg","assets/img/gear-rig-setup.webp":"assets/media/source-originals/gear-rig-setup.jpg","assets/media/october-2026/gym-august-weights.webp":"assets/media/source-originals/gym-august-weights.jpg","assets/media/october-2026/pill-organizer-may-2026.webp":"assets/media/october-2026/pill-organizer-may-2026.jpg","assets/media/october-2026/nutrition-pantry-july-2026.webp":"assets/media/october-2026/nutrition-pantry-july-2026.jpg","assets/media/october-2026/gym-august-floor.webp":"assets/media/source-originals/gym-august-floor.jpg","assets/media/october-2026/gym-turf-rig.webp":"assets/media/source-originals/gym-turf-rig.jpg","assets/media/october-2026/gym-july-turf.webp":"assets/media/source-originals/gym-july-turf.jpg","assets/media/october-2026/bogdan-gym-session.webp":"assets/media/source-originals/bogdan-gym-session.jpg","assets/media/october-2026/bogdan-august-mirror.webp":"assets/media/source-originals/bogdan-august-mirror.jpg","assets/media/october-2026/gym-july-session.webp":"assets/media/source-originals/gym-july-session.jpg","assets/media/october-2026/gym-bench-august.webp":"assets/media/source-originals/gym-bench-august.jpg","assets/media/october-2026/pill-organizer-february-2026.webp":"assets/media/october-2026/pill-organizer-february-2026.jpg"};
  function originalSource(src) {
    if (!src) return src;
    try { var u = new URL(src, document.baseURI); if (u.origin !== location.origin) return src; return originalImages[u.pathname.replace(/^\//, "")] || src; } catch (e) { return src; }
  }
  function srcOf(el) { return originalSource(el.getAttribute('data-orig') || el.getAttribute('data-full') || (el.querySelector('img') || el).currentSrc || el.src); }
  /* Explicit originals take priority for viewing, opening and downloading. */
  function viewOf(el) { return srcOf(el); }
  function labelOf(el) { var i = el.matches('img') ? el : el.querySelector('img'); return el.getAttribute('aria-label') || (i && i.alt) || ''; }
  function show(i) {
    idx = (i + set.length) % set.length;
    var el = set[idx], src = srcOf(el);
    dlg.classList.remove('is-wide'); var zoom = P.$('[data-lb="zoom"]', dlg); zoom.setAttribute('aria-pressed', 'false'); zoom.textContent = '+'; var fig = img.parentNode; fig.scrollTop = fig.scrollLeft = 0; img.src = viewOf(el); img.alt = labelOf(el); cap.textContent = labelOf(el) + (set.length > 1 ? ' · ' + (idx + 1) + ' / ' + set.length : '');
    var org = src; dl.href = org; dl.setAttribute('download', org.split('/').pop().split('?')[0]); full.href = org;   /* data-orig = hi-res original (download); data-full = web version */
    post.hidden = !el.getAttribute('data-post'); if (!post.hidden) post.href = el.getAttribute('data-post');   /* picture cards that come from an Instagram post */
    P.$$('[data-lb="prev"],[data-lb="next"]', dlg).forEach(function (b) { b.hidden = set.length < 2; });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-full]');
    if (!t || t.closest('[data-no-lightbox]')) return;
    e.preventDefault();
    build();
    var g = t.closest('[data-gallery]');
    set = g ? P.$$('[data-full]', g).filter(function (x) { if (x.closest('[data-clone]')) return false; var d = x.closest('.desk-only'); return !d || getComputedStyle(d).display !== 'none'; }) : [t];
    /* A scanning display has one live link but a complete JSON photo queue. */
    var source = t.getAttribute('data-gallery-source');
    if (source) {
      var data = document.getElementById(source);
      try {
        var photos = data && JSON.parse(data.textContent);
        if (Array.isArray(photos)) {
          var queue = photos.filter(function (photo) { return photo && typeof photo.src === 'string' && photo.src; }).map(function (photo) {
            var link = document.createElement('a');
            link.setAttribute('data-full', photo.src);
            link.setAttribute('aria-label', photo.title || 'Photo');
            if (photo.original) link.setAttribute('data-orig', photo.original);
            if (photo.post) link.setAttribute('data-post', photo.post);
            return link;
          });
          if (queue.length) set = queue;
        }
      } catch (error) { /* A malformed optional queue still opens the selected image. */ }
    } else if (!g && t.matches('.rv-link')) {
      /* Recipe, pill-stage and day-state panels form a page-ordered queue. */
      set = P.$$('.rv-link[data-full]', t.closest('main') || document);
    }
    /* Responsive copies of the same original are one queue entry. */
    var sources = new Set();
    set = set.filter(function (entry) {
      var src = srcOf(entry);
      if (sources.has(src)) return false;
      sources.add(src); return true;
    });
    opener = t;
    var at = set.indexOf(t);
    if (at < 0) { var want = srcOf(t); set.forEach(function (x, n) { if (at < 0 && srcOf(x) === want) at = n; }); }
    show(Math.max(0, at));
    if (dlg.showModal) window.P100.openDialog(dlg,function(){show(idx);document.documentElement.classList.add('no-scroll');}); else dlg.setAttribute('open', '');
    document.documentElement.classList.add('no-scroll');
  });
})();

/* ===== 80-media.js ===== */
/* Media: click-to-play YouTube (nothing loads until asked) and a hero video that only plays when it should. */
(function () {
  'use strict';
  var P = window.P100;

  /* Click-to-play opens a bigger pop-up player (native <dialog>, same look as the image viewer). Nothing from YouTube loads until a card is
     tapped, the player is removed again on close, and the rows behind it stop drifting while it is open. Prev / next step through the row. */
  var vdlg, vbox, vtitle, vlink, valt, vset = [], vidx = 0, vopener;
  function vbuild() {
    if (vdlg) return;
    vdlg = document.createElement('dialog');
    vdlg.className = 'lightbox lightbox--video'; vdlg.setAttribute('aria-label', 'Video player');
    vdlg.innerHTML =
      '<div class="lightbox__bar"><span class="lightbox__title"></span>' +
      '<button type="button" class="lightbox__btn" data-vp="prev" aria-label="Previous video">‹</button>' +
      '<button type="button" class="lightbox__btn" data-vp="next" aria-label="Next video">›</button>' +
      '<a class="lightbox__btn" data-vp="yt" target="_blank" rel="noopener" aria-label="Open on YouTube">YouTube ↗</a>' +
      '<button type="button" class="lightbox__btn" data-vp="close" aria-label="Close video">×</button></div>' +
      '<div class="vplayer"><div class="vplayer__frame"></div>' +
      '<a class="vplayer__alt" data-vp="alt" target="_blank" rel="noopener">Not playing? Watch it on YouTube \u2197</a></div>';
    document.body.appendChild(vdlg);
    vbox = vdlg.querySelector('.vplayer__frame'); vtitle = vdlg.querySelector('.lightbox__title'); vlink = vdlg.querySelector('[data-vp="yt"]'); valt = vdlg.querySelector('[data-vp="alt"]');
    vdlg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-vp]'), k = b && b.dataset.vp;
      if (k === 'close' || e.target === vdlg) vdlg.close();
      if (k === 'prev') vshow(vidx - 1);
      if (k === 'next') vshow(vidx + 1);
    });
    vdlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') vshow(vidx - 1);
      if (e.key === 'ArrowRight') vshow(vidx + 1);
    });
    vdlg.addEventListener('close', function () {
      vbox.innerHTML = '';                                           /* removes the player, so the sound stops */
      document.documentElement.classList.remove('no-scroll');
      if (vopener) { try { vopener.focus({ preventScroll: true }); } catch (x) {} }
    });
  }
  function vlabel(b) { return (b.getAttribute('aria-label') || 'Video').replace(/^Play:\s*/, ''); }
  function vshow(i) {
    vidx = (i + vset.length) % vset.length;
    var b = vset[vidx], id = b.dataset.yt;
    vbox.innerHTML = '';
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&mute=0&playsinline=1&rel=0' + (/^https?:$/.test(location.protocol) ? '&origin=' + encodeURIComponent(location.origin) : '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');            /* YouTube refuses to play when it is told nothing about the page (in-app browsers) */
    f.title = vlabel(b);
    f.allow = 'autoplay; encrypted-media; picture-in-picture; web-share; fullscreen';
    f.allowFullscreen = true;
    vbox.appendChild(f);
    vtitle.textContent = vlabel(b);
    vlink.href = valt.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
    P.$$('[data-vp="prev"],[data-vp="next"]', vdlg).forEach(function (n) { n.hidden = vset.length < 2; });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-yt]');
    if (!t) return;
    e.preventDefault();
    vbuild();
    var row = t.closest('.carousel') || t.closest('[data-gallery]');
    vset = row ? P.$$('[data-yt]', row).filter(function (x) { return !x.closest('[data-clone]'); }) : [t];
    var at = vset.indexOf(t);
    if (at < 0) vset.forEach(function (x, n) { if (at < 0 && x.dataset.yt === t.dataset.yt) at = n; });   /* a cloned card in the looping row */
    vopener = t.closest('[data-clone]') ? null : t;
    vshow(Math.max(0, at));
    if (vdlg.showModal) window.P100.openDialog(vdlg,function(){vshow(vidx);document.documentElement.classList.add('no-scroll');}); else vdlg.setAttribute('open', '');
    document.documentElement.classList.add('no-scroll');
  });

  /* Reading previews are for unlinked text cards. Linked cards use native navigation. */
  var pdlg, pimg, pkick, ptitle, ptext, pgo, pset = [], pidx = 0, popener;
  function pbuild() {
    if (pdlg) return;
    pdlg = document.createElement('dialog');
    pdlg.className = 'lightbox lightbox--card'; pdlg.setAttribute('aria-label', 'Preview');
    pdlg.innerHTML =
      '<div class="lightbox__bar"><span class="lightbox__title"></span>' +
      '<button type="button" class="lightbox__btn" data-pv="prev" aria-label="Previous">‹</button>' +
      '<button type="button" class="lightbox__btn" data-pv="next" aria-label="Next">›</button>' +
      '<button type="button" class="lightbox__btn" data-pv="close" aria-label="Close">×</button></div>' +
      '<div class="pv"><img class="pv__img" alt=""><div class="pv__body"><p class="pv__kick"></p><h3 class="pv__title"></h3><p class="pv__text"></p>' +
      '<a class="lightbox__btn pv__go" data-pv="go">Open page →</a></div></div>';
    document.body.appendChild(pdlg);
    pimg = pdlg.querySelector('.pv__img'); pkick = pdlg.querySelector('.pv__kick'); ptitle = pdlg.querySelector('.pv__title'); ptext = pdlg.querySelector('.pv__text'); pgo = pdlg.querySelector('.pv__go');
    pdlg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pv]'), k = b && b.dataset.pv;
      if (k === 'close' || e.target === pdlg) pdlg.close();
      if (k === 'prev') pshow(pidx - 1);
      if (k === 'next') pshow(pidx + 1);
    });
    pdlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') pshow(pidx - 1);
      if (e.key === 'ArrowRight') pshow(pidx + 1);
    });
    pdlg.addEventListener('close', function () {
      document.documentElement.classList.remove('no-scroll');
      pimg.removeAttribute('src');
      if (popener) { try { popener.focus({ preventScroll: true }); } catch (x) {} }
    });
  }
  function pbiggest(img) {
    var ss = img.getAttribute('srcset'), best = img.getAttribute('src'), w = 0;
    if (ss) ss.split(',').forEach(function (c) { var q = c.trim().split(/\s+/), n = parseInt(q[1], 10) || 0; if (n >= w) { w = n; best = q[0]; } });
    return best;
  }
  function ptxt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function pshow(i) {
    pidx = (i + pset.length) % pset.length;
    var it = pset[pidx], a = it.querySelector('a[href]'), im = it.querySelector('img');
    var title = ptxt(it.querySelector('.card__title,.file-card__title,h3,h4')) || (a && a.getAttribute('aria-label')) || '';
    var kick = [ptxt(it.querySelector('.home-era__num')), ptxt(it.querySelector('.home-era__range'))].filter(Boolean).join(' · ');
    var para = ptxt(it.querySelector('p'));
    pdlg.querySelector('.lightbox__title').textContent = title;
    ptitle.textContent = title; pkick.textContent = kick; pkick.hidden = !kick; ptext.textContent = para; ptext.hidden = !para;
    if (im) { pimg.src = pbiggest(im); pimg.alt = im.alt || title; pimg.hidden = false; } else { pimg.removeAttribute('src'); pimg.hidden = true; }
    if (a) { pgo.href = a.getAttribute('href'); pgo.hidden = false; } else { pgo.removeAttribute('href'); pgo.hidden = true; }
    P.$$('[data-pv="prev"],[data-pv="next"]', pdlg).forEach(function (n) { n.hidden = pset.length < 2; });
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var it = e.target.closest('[data-preview] .carousel__item');
    if (!it) return;
    var row = it.closest('[data-preview]');
    if (it.querySelector('a[href]')) return; /* A page card opens its destination directly. */
    if (e.target.closest('a,button')) return;
    e.preventDefault();
    pbuild();
    pset = P.$$('.carousel__item', row);
    popener = it.querySelector('a[href]') || null;
    pshow(Math.max(0, pset.indexOf(it)));
    if (pdlg.showModal) window.P100.openDialog(pdlg,function(){pshow(pidx);document.documentElement.classList.add('no-scroll');}); else pdlg.setAttribute('open', '');
    document.documentElement.classList.add('no-scroll');
  });

  var conn = navigator.connection || {};
  var mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  P.$$('video[data-src], video[autoplay]').forEach(function (v) {
    var near = false;
    v.muted = true; v.defaultMuted = true; v.volume = 0; v.playsInline = true;
    // Size the media itself: Android renderers can blank a vertically cropped object-fit surface.
    if (v.hasAttribute('data-background-video')) {
      function fitBackground() {
        var box = v.parentElement, ratio = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : (v.width && v.height ? v.width / v.height : 16 / 9);
        var width = Math.ceil((v.dataset.fit === 'contain' ? Math.min(box.clientWidth, box.clientHeight * ratio) : Math.max(box.clientWidth, box.clientHeight * ratio)));
        v.style.width = width + 'px'; v.style.height = Math.ceil(width / ratio) + 'px';
      }
      v.addEventListener('loadedmetadata', fitBackground);
      if ('ResizeObserver' in window) new ResizeObserver(fitBackground).observe(v.parentElement);
      else window.addEventListener('resize', fitBackground);
      fitBackground();
    }
    // Android can decode a cropped hero without compositing its video layer.
    // An authored canvas presents those same decoded frames, without a second clip.
    var surface = v.parentElement.querySelector('[data-video-surface]');
    if (surface && /Android/i.test(navigator.userAgent)) {
      var ctx = surface.getContext('2d', { alpha:false }), poster = new Image(), pending = false;
      function drawSurface() {
        var image = v.readyState >= 2 ? v : (poster.complete && poster.naturalWidth ? poster : null);
        if (!image || document.hidden || !near) return;
        var box = v.parentElement, dpr = Math.min(window.devicePixelRatio || 1, 1.5), w = Math.max(1,Math.round(box.clientWidth*dpr)), h = Math.max(1,Math.round(box.clientHeight*dpr));
        if(surface.width!==w || surface.height!==h){surface.width=w;surface.height=h;}
        var iw=image.videoWidth||image.naturalWidth,ih=image.videoHeight||image.naturalHeight,contain=v.dataset.fit==='contain',scale=contain?Math.min(w/iw,h/ih):Math.max(w/iw,h/ih),dw=iw*scale,dh=ih*scale;
        ctx.fillStyle="#08090c";ctx.fillRect(0,0,w,h);
        var topAligned=v.classList.contains('home-hero__img')&&matchMedia('(max-width:1099px)').matches;
        ctx.drawImage(image,0,0,iw,ih,(w-dw)/2,topAligned?0:(h-dh)/2,dw,dh);
        surface.hidden=false;box.classList.add('has-video-surface');
      }
      function surfaceFrame() {
        pending=false;drawSurface();
        if (!v.paused && near && !document.hidden && !pending) {
          pending=true;
          if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(surfaceFrame);
          else requestAnimationFrame(surfaceFrame);
        }
      }
      poster.onload=drawSurface;poster.src=v.poster;
      v.addEventListener('playing',function(){if(!pending)surfaceFrame();});
      v.addEventListener('loadeddata',drawSurface);
      window.addEventListener('resize',drawSurface);
      document.addEventListener('p100:motion',drawSurface);
    }
    function isVisible() {
      var box = v.parentElement.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < window.innerHeight && box.right > 0 && box.left < window.innerWidth && v.getClientRects().length > 0;
    }
    function sync() {
      // Reconcile actual layout on every lifecycle event. Embedded browsers can
      // retain an obsolete intersection result after their panel becomes visible.
      near = isVisible();
      v.muted = true; v.defaultMuted = true; v.volume = 0;
      if (!near || document.hidden || P.motionPaused || (mediaMotion.matches && !v.hasAttribute('data-always')) || (conn.saveData && !v.hasAttribute('data-always'))) { v.pause(); if (!near) { delete v.dataset.playback; P.refreshMotionLabels(); } return; }
      if (v.dataset.src && !v.getAttribute('src')) {
        v.src = (v.dataset.srcMobile && window.matchMedia('(max-width: 760px)').matches) ? v.dataset.srcMobile : v.dataset.src;
        v.load();
      }
      if (!v.paused && !v.ended) return;
      var playing = v.play();
      if (playing && playing.then) playing.then(function () { if (!v.paused) v.dataset.playback = 'playing'; P.refreshMotionLabels(); }).catch(function (error) { if (error.name === 'NotAllowedError' && near && !P.motionPaused) v.dataset.playback = 'blocked'; else delete v.dataset.playback; P.refreshMotionLabels(); });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(sync, { threshold: [0, .05] }).observe(v.parentElement);
    }
    if (v.dataset.srcMobile && window.matchMedia('(max-width: 760px)').matches && v.getAttribute('src') !== v.dataset.srcMobile) {
      v.src = v.dataset.srcMobile;
    }
    sync();
    var visibilityFrame = 0;
    function scheduleVisibility() {
      if (!visibilityFrame) visibilityFrame = requestAnimationFrame(function () { visibilityFrame = 0; sync(); });
    }
    window.addEventListener('scroll', scheduleVisibility, { passive: true });
    window.addEventListener('resize', scheduleVisibility, { passive: true });
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('p100:motion', sync);
    v.addEventListener('canplay', sync);
    v.addEventListener('play', sync);
    v.addEventListener('playing', function () { v.dataset.playback = 'playing'; P.refreshMotionLabels(); });
    v.addEventListener('pause', function () {
      delete v.dataset.playback;
      if (!document.hidden && !P.motionPaused && isVisible()) scheduleVisibility();
      P.refreshMotionLabels();
    });
    window.addEventListener('online', sync);
    var fallbackTried = false;
    v.addEventListener('error', function () { if (!fallbackTried && v.dataset.srcMobile && v.currentSrc.indexOf(v.dataset.srcMobile) < 0) { fallbackTried = true; v.src = v.dataset.srcMobile; v.load(); } });
    setInterval(function () { if (v.paused && !document.hidden && !P.motionPaused) sync(); }, 2000);
    window.addEventListener('pageshow', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('pointerdown', sync, { passive: true });
    if (mediaMotion.addEventListener) mediaMotion.addEventListener('change', sync);
    else if (mediaMotion.addListener) mediaMotion.addListener(sync);
  });
})();

/* ===== 90-filters.js ===== */
/* Filter chips ([data-filter-group]) over cards that carry data-cat. Works without JS: every card is rendered. */
(function () {
  'use strict';
  var P = window.P100;
  P.$$('[data-filter-group]').forEach(function (group) {
    var scope = document.getElementById(group.dataset.filterGroup) || document;
    var buttons = P.$$('[data-filter]', group), cards = P.$$('[data-cat]', scope);
    var param = group.dataset.param || 'cat';
    function apply(cat, push) {
      buttons.forEach(function (b) { var on = b.dataset.filter === cat; b.setAttribute('aria-pressed', String(on)); b.classList.toggle('is-active', on); });
      var n = 0;
      cards.forEach(function (c) { var show = cat === 'all' || c.dataset.cat === cat; c.hidden = !show; if (show) n++; });
      var live = P.$('[data-filter-status]', group.parentElement);
      if (live) {
        var rows = cards.filter(function(c) { return !c.hidden; });
        var grouped = rows.length && rows.every(function(c) { return c.hasAttribute('data-count'); });
        if (grouped) {
          var total = rows.reduce(function(sum, c) { return sum + Number(c.dataset.count || 0); }, 0);
          live.textContent = total + (total === 1 ? ' item' : ' items') + ' · ' + n + (n === 1 ? ' category' : ' categories');
        } else live.textContent = n + (n === 1 ? ' entry' : ' entries');
      }
      if (push) { var u = new URL(location.href); if (cat === 'all') u.searchParams.delete(param); else u.searchParams.set(param, cat); history.replaceState(null, '', u); }
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.filter, true); }); });
    var start = new URLSearchParams(location.search).get(param);
    apply(buttons.some(function (b) { return b.dataset.filter === start; }) ? start : 'all', false);
  });
})();

/* ===== 35-fab.js ===== */
/* Floating "@" button: opens / closes the Links panel (all socials + email). Closes on Esc, outside tap or link tap. */
(function () {
  'use strict';
  var P = window.P100, btn = P.$('#fabAt'), panel = P.$('#fabPanel');
  if (!btn || !panel) return;
  /* Keep the @ panel focused on contact and social links. Downloads remain available
     from the existing bottom bar and the main site menu; only these two panel rows go. */
  var removeRows = [panel.querySelector('[data-dl-open]')].concat(
    Array.prototype.slice.call(panel.querySelectorAll('a.fab-row')).filter(function (link) {
      return (link.textContent + ' ' + link.href).toLowerCase().indexOf('project100.fit') !== -1;
    })
  );
  removeRows.forEach(function (item) {
    var row = item && item.closest('li');
    if (row) row.remove();
  });
  function isOpen() { return !panel.hidden; }
  function open() { panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
  function close(refocus) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); }
  btn.addEventListener('click', function (e) { e.stopPropagation(); if (isOpen()) close(); else open(); });
  document.addEventListener('click', function (e) {
    if (isOpen() && !panel.contains(e.target) && !btn.contains(e.target)) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(true); });
  panel.addEventListener('click', function (e) {
    if (e.target.closest('[data-pop-close]')) { close(true); return; }
    if (e.target.closest('a')) setTimeout(function () { close(); }, 60);
  });
  /* opening the site menu or scrolling a long way closes the panel so it never sits over content */
})();

/* ===== 36-downloads.js ===== */
/* Books, Links and space shortcuts appear together only near the end of a page. */
(function () {
  'use strict';
  var P = window.P100, bar = P.$('#dlBar'), dlg = P.$('#dlModal'), last = null, ticking = false, last_p = -1;
  if (!dlg && !document.body.hasAttribute('data-bottom-controls')) return;
  var dock = P.$('.page-dock'), dockHeight = 0, dockMeasureFrame = 0;
  function measureDock() {
    if (!dock) return;
    var height = Math.ceil(dock.getBoundingClientRect().height);
    if (height > 0 && height !== dockHeight) {
      dockHeight = height;
      document.body.style.setProperty('--page-dock-height', height + 'px');
    }
  }
  measureDock();
  function queueDockMeasure() {
    if (dockMeasureFrame) return;
    dockMeasureFrame = requestAnimationFrame(function () { dockMeasureFrame = 0; measureDock(); });
  }
  if (dock && 'ResizeObserver' in window) new ResizeObserver(queueDockMeasure).observe(dock);
  window.addEventListener('resize', measureDock);
  window.addEventListener('load', measureDock);
  var RANGE = 420;                                                    /* px before the very end of the page where the bar starts rising */
  function check() {
    ticking = false;

    var left = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    var range = Math.min(RANGE, window.innerHeight * 0.55);
    var p = left <= 2 ? 1 : Math.max(0, Math.min(1, 1 - left / range));   /* 0 = hidden below the screen, 1 = fully up at the very bottom */
    if (p === last_p) return;
    last_p = p;
    if (bar) bar.style.setProperty('--dl-p', p.toFixed(3));
    document.documentElement.style.setProperty('--dl-p', p.toFixed(3));
    if (bar) bar.classList.toggle('is-in', p > 0);
    document.body.toggleAttribute('data-bottom-visible', p > 0);
    P.$$('.page-dock').forEach(function (el) { el.inert = p === 0; });
    if (!p) { var panel = P.$('#fabPanel'), at = P.$('#fabAt'); if (panel) panel.hidden = true; if (at) at.setAttribute('aria-expanded', 'false'); }
  }
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
  function open(from) {
    last = from || null;
    var panel = P.$('#fabPanel'), at = P.$('#fabAt');
    if (panel && !panel.hidden) { panel.hidden = true; if (at) at.setAttribute('aria-expanded', 'false'); }
    if (typeof dlg.showModal === 'function') { if (!dlg.open) window.P100.openDialog(dlg); } else dlg.setAttribute('open', '');
    var want = from && from.getAttribute ? from.getAttribute('data-dl-doc') : null;   /* the bar's two halves pick their own file */
    P.$$('.dl-file', dlg).forEach(function (f) { var on = !!want && f.getAttribute('data-doc') === want; f.classList.toggle('is-picked', on); if (on && f.scrollIntoView) f.scrollIntoView({ block: 'nearest' }); });
    var close = P.$('[data-dl-close]', dlg); if (close) close.focus();
  }
  function close() {
    if (typeof dlg.close === 'function' && dlg.open) dlg.close(); else dlg.removeAttribute('open');
    if (last && document.contains(last) && last.offsetParent !== null) { try { last.focus(); } catch (e) { /* ignore */ } }
  }
  document.addEventListener('click', function (e) {
    if (!dlg) return;
    var o = e.target.closest('[data-dl-open]');
    if (o) { e.preventDefault(); open(o); return; }
    if (e.target.closest('[data-dl-close]')) { e.preventDefault(); close(); return; }
    if (e.target === dlg) close();                                   /* tap on the dimmed backdrop */
    else if (dlg.open && e.target.closest('a[download]')) setTimeout(close, 400);
  });
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('load', queue);
  if ('ResizeObserver' in window) new ResizeObserver(queue).observe(document.body);
  queue();
})();

/* Footer destinations remain stationary and wrap; no cloned links or automatic scrolling. */

/* ===== 62-carousel.js ===== */
/* Carousels ([data-carousel]). Structure: .carousel > .carousel__head + .carousel__stage > .carousel__track > .carousel__item.
   - Rows that are wider than the screen drift on their own, left to right until the last card, rest a moment, then drift back to the
     first card, and so on. Nothing loops or repeats: every card appears once, so a visitor always knows where they are.
   - A touch, drag, wheel or tap pauses it for a moment and it then carries on from wherever the visitor left it; hovering with a
     mouse pauses it; the round Pause button stops it for good. While a pop-up viewer is open every row stands still.
   - A thick position bar underneath shows where you are (click or drag it to jump); arrow keys work when the row has focus.
   - "reduce motion": no automatic movement unless the visitor presses Play. Without JS it is a normal scroll-snap strip. */
(function () {
  'use strict';
  var P = window.P100, SPEED = 34, RESUME = 500, REST = 800;   /* px per second; ms of calm after a touch; ms of rest at either end */
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }


  function initCollection(root) {
    if(root.dataset.ready)return;root.dataset.ready='1';
    var track=P.$('.carousel__track',root),items=P.$$('.carousel__item',track),position=P.$('[data-collection-position]',root),pause=P.$('[data-collection-pause]',root);
    if(!track||!position||!pause)return;
    var previous=P.$('[data-collection-prev]',root),next=P.$('[data-collection-next]',root),controls=P.$('.collection-controls',root);
    var cues=P100Rotation.create({host:controls,viewport:root.querySelector('.carousel__stage'),touchTarget:root,previous:previous,next:next,pause:pause,position:position,unit:'cards',previousLabel:'Previous cards',nextLabel:'Next cards'});
    var index=0,seen=false,paused=!P100Rotation.autoplay(),last=Date.now(),tick=last,hold=0,keys=false,changing=false,touching=false;
    function start(page){var pages=Math.ceil(items.length/4);return Math.min(((page+pages)%pages)*4,Math.max(0,items.length-4));}
    function peek(page){var target=start(page),current=start(index);return items.slice(target,target+4).find(function(x,i){return target+i<current||target+i>=current+4;})||items[target];}
    function feedback(){var time=Date.now(),from=start(index),waiting=!seen||document.hidden?'Auto-change when in view':document.querySelector('dialog[open]')||root.querySelector('.carousel__item:not([hidden]) details[open]')||(keys&&root.contains(document.activeElement))?'Paused while you explore':null;cues.update({enabled:items.length>4,total:items.length,range:'Cards '+(from+1)+'–'+Math.min(items.length,from+4)+' of '+items.length,progress:(time-last)/4000,remaining:4000-(time-last),resume:Math.max(0,hold-time),paused:paused||P.motionPaused,waiting:waiting,changing:changing,previous:peek(index-1),next:peek(index+1)});}
    function show(page,manual){
      if(changing)return;changing=true;if(manual)hold=0;
      var pages=Math.ceil(items.length/4);index=(page+pages)%pages;root.classList.add('is-changing');feedback();
      setTimeout(function(){var from=start(index);items.forEach(function(item,i){item.hidden=i<from||i>=from+4;});root.classList.remove('is-changing');last=Date.now();changing=false;feedback();},P.reduceMotion.matches?0:180);
    }
    document.addEventListener('p100:motion',function(){if(!P.motionPaused){paused=false;last=Date.now();}feedback();});
    previous.addEventListener('click',function(){show(index-1,true);});next.addEventListener('click',function(){show(index+1,true);});
    pause.addEventListener('click',function(){if(P.motionPaused){P.setMotionPaused(false);paused=false;}else paused=!paused;last=Date.now();feedback();});
    root.addEventListener('keydown',function(e){keys=true;if(e.target===track&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1),true);}});
    root.addEventListener('pointerdown',function(){keys=false;},{passive:true});root.addEventListener('touchstart',function(){touching=true;},{passive:true});['touchend','touchcancel'].forEach(function(name){root.addEventListener(name,function(){touching=false;},{passive:true});});
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){seen=es[0].isIntersecting;tick=Date.now();},{threshold:.01}).observe(root);else seen=true;
    setInterval(function(){var at=Date.now(),delta=at-tick;tick=at;if(!seen||touching||cues.touching||document.hidden||paused||P.motionPaused||changing||document.querySelector('dialog[open]')||root.querySelector('.carousel__item:not([hidden]) details[open]')||(keys&&root.contains(document.activeElement))||Date.now()<hold){last+=delta;feedback();return;}feedback();if(Date.now()-last>=4000)show(index+1,false);},100);
    track.tabIndex=0;show(0,false);
  }

  function init(root) {
    if(root.hasAttribute('data-collection-grid')){initCollection(root);return;}
    var track = P.$('.carousel__track', root), stage = P.$('.carousel__stage', root), head = P.$('.carousel__head', root);
    if (!track || !stage || root.dataset.ready) return;
    var items = P.$$('.carousel__item', track);
    root.dataset.ready = '1';
    if (items.length < 2) { root.classList.add('is-single'); return; }

    var bar = document.createElement('div'); bar.className = 'carousel__bar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<span class="carousel__thumb"></span>';
    var thumb = bar.firstChild;
    var pp = document.createElement('button'); pp.type = 'button'; pp.className = 'carousel__pp';
    stage.appendChild(bar);
    var controls=document.createElement('div');controls.className='carousel-controls';var prev=document.createElement('button'),next=document.createElement('button'),position=document.createElement('span');root.insertBefore(controls,stage);var cues=P100Rotation.create({host:controls,viewport:stage,touchTarget:root,previous:prev,next:next,pause:pp,position:position,unit:'items'});prev.addEventListener('click',function(){go(-1);});next.addEventListener('click',function(){go(1);});pp.addEventListener('click',function(){if(P.motionPaused){P.setMotionPaused(false);userPaused=false;}else userPaused=!userPaused;label();});
    if (!track.hasAttribute('tabindex')) track.tabIndex = 0;

    var active = false, lastW = -1, pos = null, last = 0, hold = 0, dir = 1, inView = true, lastAuto = 0;
    var mouseOver = false, touching = false, keyFocus = false, userPaused = !P100Rotation.autoplay(), idle = 0, raf = 0;

    document.addEventListener('p100:motion',function(){if(!P.motionPaused)userPaused=false;});
    function maxScroll() { return Math.max(0, track.scrollWidth - track.clientWidth); }
    function measure() {
      lastW = track.clientWidth;
      var over = lastW >= 40 && maxScroll() > 4;                        /* hidden (filtered out) or everything already fits: nothing to drift */
      active = over; controls.hidden=!over; pp.hidden = !over; bar.hidden = !over;
      root.classList.toggle('is-drift', over);
      pos = null; lastAuto = track.scrollLeft; sync();
    }
    function sync() {
      if (!active) return;
      var m = maxScroll() || 1, w = Math.max(.12, Math.min(1, track.clientWidth / track.scrollWidth)), f = Math.max(0, Math.min(1, track.scrollLeft / m));
      thumb.style.width = (w * 100) + '%'; thumb.style.left = (f * (1 - w) * 100) + '%';
      var size=step()||1,start=Math.min(items.length-1,Math.floor(track.scrollLeft/size)),end=Math.min(items.length,Math.ceil((track.scrollLeft+track.clientWidth)/size)),distance=dir>0?size-(track.scrollLeft%size):track.scrollLeft%size||size;
      cues.update({enabled:active,total:items.length,range:'Items '+(start+1)+'–'+end+' of '+items.length,progress:1-distance/size,remaining:distance/SPEED*1000,resume:Math.max(0,hold-now()),paused:userPaused||P.motionPaused,waiting:mouseOver||keyFocus||touching?'Paused while you explore':!inView?'Auto-browse when in view':null,previous:items[Math.max(0,start-1)],next:items[end%items.length]});
    }
    function playing() { return active && !P.motionPaused && !userPaused && !mouseOver && !document.documentElement.classList.contains('no-scroll') && inView && !touching && !cues.touching && !keyFocus && !document.hidden && now() > hold; }
    function label() {
      pp.textContent = userPaused ? 'Resume auto-change' : 'Pause auto-change';
      pp.setAttribute('aria-label', userPaused ? 'Start auto-scroll' : 'Pause auto-scroll');
      pp.setAttribute('aria-pressed', String(userPaused)); pp.title = pp.getAttribute('aria-label');
    }
    function tick(ts) {
      raf = requestAnimationFrame(tick);
      var dt = Math.min(64, ts - last); last = ts;
      if (!playing()) { pos = null; sync(); return; }
      var m = maxScroll();
      if (pos === null) {
        pos = track.scrollLeft;
        if (pos >= m - 1) dir = -1; else if (pos <= 1) dir = 1;          /* picked up at an end: head the other way */
      }
      pos += dir * SPEED * dt / 1000;
      if (pos >= m) { pos = m; dir = -1; hold = now() + REST; }          /* reached the last card: rest, then back */
      else if (pos <= 0) { pos = 0; dir = 1; hold = now() + REST; }       /* back at the first card: rest, then forward */
      track.scrollLeft = pos; lastAuto = track.scrollLeft; sync();
    }
    function holdFor(ms) { hold = Math.max(hold, now() + ms); pos = null; }
    function step() { var c = items[0]; var g = getComputedStyle(track); return c ? c.getBoundingClientRect().width + (parseFloat(g.columnGap) || parseFloat(g.gap) || 0) : track.clientWidth * .8; }
    function go(d) { holdFor(800); track.scrollBy({ left: d * step(), behavior: P.reduceMotion.matches ? 'auto' : 'smooth' }); }


    track.addEventListener('keydown', function (e) {
      if (e.target !== track) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    /* any scroll that did not come from the drift itself (finger, wheel, bar, keys) keeps it calm, then it resumes from there */
    track.addEventListener('scroll', function () {
      if (Math.abs(track.scrollLeft - lastAuto) > 2) { holdFor(RESUME); lastAuto = track.scrollLeft; }
      sync();
    }, { passive: true });
    track.addEventListener('wheel', function () { holdFor(RESUME); }, { passive: true });
    /* mouse only: a finger never "hovers", so touch screens cannot get stuck paused */
    root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') mouseOver = true; });
    root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { mouseOver = false; holdFor(500); } });
    track.addEventListener('touchstart', function () { touching = true; pos = null; }, { passive: true });
    function endTouch() { touching = false; hold = now(); }
    track.addEventListener('touchend', endTouch, { passive: true });
    track.addEventListener('touchcancel', endTouch, { passive: true });
    window.addEventListener('blur', function () { touching = false; mouseOver = false; });
    /* keyboard focus pauses; a tap that merely leaves focus on a card does not */
    var usingKeys = false;
    document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || e.key.indexOf('Arrow') === 0) usingKeys = true; }, true);
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) { document.addEventListener(ev, function () { usingKeys = false; keyFocus = false; }, true); });
    root.addEventListener('focusin', function () { keyFocus = usingKeys; });
    root.addEventListener('focusout', function () { keyFocus = false; holdFor(300); });
    document.addEventListener('visibilitychange', function () { pos = null; holdFor(400); });

    /* mouse drag on the row */
    (function () {
      var down = false, sx = 0, sl = 0, moved = false;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0 || !active) return;
        down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; pos = null;
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - sx;
        if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
        if (moved) track.scrollLeft = sl - dx;
      });
      window.addEventListener('pointerup', function () {
        if (!down) return; down = false;
        setTimeout(function () { track.classList.remove('is-dragging'); }, 0);
        holdFor(RESUME);
      });
    })();

    /* the thick bar underneath: where you are in the row; click or drag it to jump */
    (function () {
      var drag = false;
      function jump(e) {
        var r = bar.getBoundingClientRect(), f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        track.scrollLeft = f * maxScroll(); holdFor(800);
      }
      bar.addEventListener('pointerdown', function (e) { drag = true; try { bar.setPointerCapture(e.pointerId); } catch (x) {} jump(e); });
      bar.addEventListener('pointermove', function (e) { if (drag) jump(e); });
      bar.addEventListener('pointerup', function () { drag = false; });
      bar.addEventListener('pointercancel', function () { drag = false; });
    })();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (!inView) pos = null; }, { threshold: .12 }).observe(root);
    }
    function remeasure() { if (track.clientWidth !== lastW) measure(); }
    var resizeFrame = 0;
    function scheduleRemeasure() {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(function () { resizeFrame = 0; remeasure(); });
    }
    if ('ResizeObserver' in window) new ResizeObserver(scheduleRemeasure).observe(stage); else window.addEventListener('resize', remeasure);
    window.addEventListener('load', measure);                           /* images / fonts settled */
    label(); measure();
    hold = now() + 1600;                                               /* open on the first card for a moment, then start drifting */
    if (!raf) raf = requestAnimationFrame(function (t) { last = t; tick(t); });
  }
  P.initCarousels = function (scope) { P.$$('[data-carousel]', scope).forEach(init); };
  P.initCarousels(document);
})();

/* ===== 63-rowhint.js ===== */
/* Selector rows (.filters = category chips, .subnav = page chips): rows wider than the screen show a fade on the side that has more,
   a thin position bar underneath, and drift left to right and back like the carousels, so nobody misses the hidden choices.
   A touch / tap / hover pauses it; it never runs under "reduce motion" or while a pop-up is open. */
(function () {
  'use strict';
  var P = window.P100, SPEED = 30, REST = 800, RESUME = 500;
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
  function init(row) {
    if (row.dataset.hint) return; row.dataset.hint = '1';
    var bar = document.createElement('div'); bar.className = 'rowbar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<span></span>';
    var thumb = bar.firstChild; row.parentNode.insertBefore(bar, row.nextSibling);var hint=document.createElement('div');hint.className='rowhint-status';hint.textContent='More choices · swipe sideways';bar.after(hint);
    var active = false, pos = null, dir = 1, hold = now() + 1800, last = 0, lastAuto = 0, inView = true, touching = false, mouse = false, keyFocus = false, usingKeys = false, lastW = -1;
    var still = !P100Rotation.autoplay();document.addEventListener('p100:motion',function(){if(!P.motionPaused)still=false;});
    function max() { return Math.max(0, row.scrollWidth - row.clientWidth); }
    function paint() {
      var m = max(), x = row.scrollLeft;
      row.style.setProperty('--fl', active && x > 4 ? '2.2rem' : '0px');
      row.style.setProperty('--fr', active && x < m - 4 ? '2.8rem' : '0px');
      if (!active) return;
      var w = Math.max(.14, Math.min(1, row.clientWidth / row.scrollWidth));
      thumb.style.width = (w * 100) + '%'; thumb.style.left = (Math.min(1, x / (m || 1)) * (1 - w) * 100) + '%';
    }
    function measure() {
      lastW = row.clientWidth; active = lastW >= 40 && max() > 4;
      row.classList.toggle('is-drift', active); bar.hidden = !active;hint.hidden=!active; pos = null; lastAuto = row.scrollLeft; paint();
    }
    function holdFor(ms) { hold = Math.max(hold, now() + ms); pos = null; }
    function playing() { return active && !P.motionPaused && !still && inView && !touching && !(row._scrollEdges&&row._scrollEdges.touching) && !mouse && !keyFocus && !document.hidden && !document.documentElement.classList.contains('no-scroll') && now() > hold; }
    function tick(ts) {
      requestAnimationFrame(tick);
      var dt = Math.min(64, ts - last); last = ts;
      if (!playing()) { pos = null; return; }
      var m = max();
      if (pos === null) { pos = row.scrollLeft; if (pos >= m - 1) dir = -1; else if (pos <= 1) dir = 1; }
      pos += dir * SPEED * dt / 1000;
      if (pos >= m) { pos = m; dir = -1; hold = now() + REST; } else if (pos <= 0) { pos = 0; dir = 1; hold = now() + REST; }
      row.scrollLeft = pos; lastAuto = row.scrollLeft; paint();
    }
    row.addEventListener('scroll', function () { if (Math.abs(row.scrollLeft - lastAuto) > 2) { holdFor(RESUME); lastAuto = row.scrollLeft; } paint(); }, { passive: true });
    row.addEventListener('touchstart', function () { touching = true; pos = null; }, { passive: true });
    function endTouch() { touching = false; hold = now(); }
    row.addEventListener('touchend', endTouch, { passive: true }); row.addEventListener('touchcancel', endTouch, { passive: true });
    row.addEventListener('wheel', function () { holdFor(RESUME); }, { passive: true });
    row.addEventListener('click', function () { holdFor(800); });
    row.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') mouse = true; });
    row.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { mouse = false; holdFor(500); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || e.key.indexOf('Arrow') === 0) usingKeys = true; }, true);
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) { document.addEventListener(ev, function () { usingKeys = false; keyFocus = false; }, true); });
    row.addEventListener('focusin', function () { keyFocus = usingKeys; }); row.addEventListener('focusout', function () { keyFocus = false; holdFor(300); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (!inView) pos = null; }, { threshold: .2 }).observe(row);
    function remeasure() { if (row.clientWidth !== lastW) measure(); }
    var resizeFrame = 0;
    function scheduleRemeasure() {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(function () { resizeFrame = 0; remeasure(); });
    }
    if ('ResizeObserver' in window) new ResizeObserver(scheduleRemeasure).observe(row); else window.addEventListener('resize', remeasure);
    window.addEventListener('load', measure);
    measure(); requestAnimationFrame(function (t) { last = t; tick(t); });
  }
  P.initRowHints = function (scope) { P.$$('.filters, .subnav', scope).forEach(function(row){init(row);P100Rotation.scrollEdges(row);}); };
  P.initRowHints(document);
})();

/* ===== 65-countup.js ===== */
/* Mechanical entrance and meter fills: exact recorded numbers remain authored at every frame. */
(function () {
  'use strict'; var P=window.P100;
  if (!('IntersectionObserver' in window)) return;
  var io=new IntersectionObserver(function(entries){entries.forEach(function(en){
    var on=en.isIntersecting&&!P.motionPaused;
    en.target.classList.toggle('is-revealed',on);
    if(en.target.classList.contains('meter')) en.target.classList.toggle('is-armed',!on&&!P.reduceMotion.matches);
  });},{threshold:.2});
  P.$$('[data-stat-reveal],.meter').forEach(function(el){io.observe(el);});
})();

/* ===== 72-recview.js ===== */
/* Record viewer: subject tabs (vector / state / stage / gym step) + style-edition tabs. One picture is shown at a time and only the selected one is fetched;
   the native recipe text beside it never changes with the style. Without JavaScript the edition links simply open the pictures. */
(function () {
  'use strict';
  var reduce = window.P100.reduceMotion.matches;
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function arrowNav(list, cur, e, go) {
    var k = e.key, n = list.length, i = list.indexOf(cur), t = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') t = (i + 1) % n;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') t = (i - 1 + n) % n;
    else if (k === 'Home') t = 0; else if (k === 'End') t = n - 1;
    if (t < 0) return; e.preventDefault(); go(t, true);
  }
  function hydrate(panel) {
    all('img[data-src]', panel).forEach(function (im) {
      var ss = im.getAttribute('data-srcset'); if (ss) im.setAttribute('srcset', ss);
      im.loading = 'eager'; im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); im.removeAttribute('data-srcset');
    });
  }
  function initPanel(panel) {
    var eds = all('[data-rv-ed]', panel), fig = panel.querySelector('[data-rv-fig]'); if (!eds.length || !fig) return;
    var list = panel.querySelector('[data-rv-eds]'), link = fig.querySelector('.rv-link'), im = fig.querySelector('img'), frame = fig.querySelector('.rv-frame'),
        capt = fig.querySelector('[data-rv-capt]'), kind = fig.querySelector('[data-rv-kind]'), dl = fig.querySelector('[data-rv-dl]'), size = fig.querySelector('[data-rv-size]');
    list.setAttribute('role', 'tablist'); all('li', list).forEach(function (li) { li.setAttribute('role', 'presentation'); });
    fig.setAttribute('role', 'tabpanel');
    eds.forEach(function (a, n) {
      a.id = a.id || (panel.id + '-ed' + n); a.setAttribute('role', 'tab');
    });
    function pick(n, focus) {
      var a = eds[n];
      eds.forEach(function (x, m) { var on = m === n; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; });
      fig.setAttribute('aria-labelledby', a.id);
      var w = +a.dataset.w, h = +a.dataset.h, wide = w > h;
      im.loading = 'eager'; im.setAttribute('sizes', wide ? '(min-width: 56rem) 60rem, 96vw' : '(min-width: 56rem) 26rem, min(100vw, 24rem)');
      im.setAttribute('srcset', a.dataset.srcset); im.src = a.dataset.src; im.alt = a.dataset.alt; im.width = w; im.height = h;
      frame.style.aspectRatio = w + ' / ' + h; panel.classList.toggle('is-wide', wide);
      link.dataset.full = a.dataset.full; link.dataset.orig = a.dataset.orig; link.href = a.dataset.full; link.setAttribute('aria-label', 'Enlarge: ' + a.dataset.alt);
      capt.textContent = a.dataset.cap; kind.textContent = a.dataset.kind; dl.href = a.dataset.orig; size.textContent = a.dataset.size;
      if (!reduce) { fig.classList.remove('is-swap'); void fig.offsetWidth; fig.classList.add('is-swap'); }
      if (focus) a.focus();
    }
    eds.forEach(function (a, n) {
      a.addEventListener('click', function (e) { e.preventDefault(); pick(n, false); });
      a.addEventListener('keydown', function (e) { arrowNav(eds, a, e, pick); });
    });
    var start = Math.max(0, eds.findIndex(function (a) { return a.classList.contains('is-on'); }));
    eds.forEach(function (x, m) { var on = m === start; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; });
    fig.setAttribute('aria-labelledby', eds[start].id);
  }
  function init(root) {
    var tabs = all('[data-rv-tab]', root), panels = all('[data-rv-panel]', root);
    panels.forEach(initPanel);
    if (!tabs.length) return;
    function pick(i, focus) {
      tabs.forEach(function (t, n) { var on = n === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; t.classList.toggle('is-on', on); panels[n].hidden = !on; });
      hydrate(panels[i]);
      if (focus) tabs[i].focus();
      try { tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) {}
    }
    tabs.forEach(function (t, n) {
      t.addEventListener('click', function () { pick(n, false); });
      t.addEventListener('keydown', function (e) { arrowNav(tabs, t, e, pick); });
    });
    root._rvPick = pick; root._rvPanels = panels;
  }
  all('[data-recview]').forEach(init);
  /* deep links: #rv-day-c opens State C, #rv-cards-v4 opens V4, and so on */
  function fromHash() {
    var id = (location.hash || '').slice(1); if (!/^rv-/.test(id)) return;
    all('[data-recview]').some(function (r) {
      var ps = r._rvPanels || []; for (var i = 0; i < ps.length; i++) if (ps[i].id === id) { r._rvPick(i, false); r.scrollIntoView({ block: 'start' }); return true; }
    });
  }
  fromHash(); window.addEventListener('hashchange', fromHash);
})();

/* ===== 73-journal.js ===== */
/* Biometrics selfie journal: a stage that plays through dated photos (crossfade, scan-line, pointer tilt, swipe, arrow keys),
   a bordered thumbnail strip, and a flip-through of one training session. Pictures open in the shared viewer ([data-gallery] links). */
(function () {
  'use strict';
  var root = document.querySelector('[data-journal]');
  if (!root) return;
  var reduce = window.P100.reduceMotion.matches;
  var q = function (s, r) { return (r || root).querySelector(s); }, qa = function (s, r) { return [].slice.call((r || root).querySelectorAll(s)); };
  var stage = q('[data-jr-stage]'), img = q('[data-jr-img]'), bg = q('[data-jr-bg]'), frame = q('[data-jr-frame]'), prog = q('[data-jr-prog]');
  var thumbs = qa('[data-jr-go]'), links = qa('[data-jr-lb] a'), strip = q('[data-jr-strip]');
  var t = { n: q('[data-jr-n]'), date: q('[data-jr-date]'), place: q('[data-jr-place]'), cap: q('[data-jr-cap]'), stamp: q('[data-jr-stamp]') };

  var DUR = 3500, i = 0, timer = 0, playing = P100Rotation.autoplay(), inView = false, elapsed = 0, last = null, loading = false, loadVersion = 0, swiped = false, hovering = false;
  if (!stage || !thumbs.length) return;
  root.style.setProperty('--jr-dur', DUR + 'ms');

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function show(n, user) {
    var len = thumbs.length; i = (n + len) % len;
    elapsed = 0; last = null; loading = true; var version = ++loadVersion, completed = false; prog.style.transform = 'scaleX(0)'; schedule();
    var b = thumbs[i], d = b.dataset;
    img.classList.remove('is-in');
    var next = new Image();
    var done = function () {
      if (completed || version !== loadVersion) return; completed = true;
      img.srcset = d.srcset; img.src = d.src; img.alt = d.alt; img.width = +d.w; img.height = +d.h;
      bg.style.backgroundImage = "url('" + d.bg + "')";
      void img.offsetWidth; img.classList.add('is-in'); loading = false; schedule();
    };
    next.onload = next.onerror = done;
    next.sizes = img.sizes; next.srcset = d.srcset; next.src = d.src;
    if (next.complete) done();
    t.n.textContent = pad(i + 1); t.date.textContent = d.date; t.place.textContent = d.place; t.cap.textContent = d.cap; t.stamp.textContent = d.date.toUpperCase();
    thumbs.forEach(function (x, k) { if (k === i) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
    var li = b.parentNode, want = li.offsetLeft - (strip.clientWidth - li.offsetWidth) / 2;
    try { strip.scrollTo({ left: Math.max(0, want), behavior: reduce || !user ? 'auto' : 'smooth' }); } catch (e) { strip.scrollLeft = Math.max(0, want); }
    schedule();
  }
  /* One clock controls both the fill and the image change. Pauses freeze both. */
  function schedule() {
    rootWindowCancel(); last = null;
    if (window.P100.motionPaused || !playing || !inView || document.hidden || loading || (journalCues&&journalCues.touching) || document.querySelector('dialog[open]')) return;
    timer = requestAnimationFrame(tick);
  }
  function rootWindowCancel() { if (timer) cancelAnimationFrame(timer); timer = 0; }
  function tick(now) {
    timer = 0;
    if (window.P100.motionPaused || !playing || !inView || document.hidden || loading || (journalCues&&journalCues.touching) || document.querySelector('dialog[open]')) { last = null; return; }
    if (last !== null) elapsed += now - last;
    last = now;
    prog.style.transform = 'scaleX(' + Math.min(1, elapsed / DUR) + ')';
    if (elapsed >= DUR) { show(i + 1, false); return; }
    timer = requestAnimationFrame(tick);
  }
  function setPlay(on) {
    playing = on; schedule();
  }
  var pause = q('[data-jr-pause]');
  var journalCues=P100Rotation.create({host:q('.jr__ctl'),viewport:stage,touchTarget:root,previous:q('[data-jr-prev]'),next:q('[data-jr-next]'),pause:pause,unit:'photos',previousLabel:'Previous photo',nextLabel:'Next photo'});
  setInterval(function(){if(!timer&&playing&&inView&&!loading&&!document.hidden&&!journalCues.touching&&!window.P100.motionPaused&&!document.querySelector('dialog[open]'))schedule();journalCues.update({total:thumbs.length,range:'Photo '+(i+1)+' of '+thumbs.length,progress:elapsed/DUR,remaining:DUR-elapsed,paused:!playing||window.P100.motionPaused,loading:loading,action:'Next photo',previous:{src:thumbs[(i-1+thumbs.length)%thumbs.length].dataset.bg,title:thumbs[(i-1+thumbs.length)%thumbs.length].dataset.date},next:{src:thumbs[(i+1)%thumbs.length].dataset.bg,title:thumbs[(i+1)%thumbs.length].dataset.date}});},100);
  stage.addEventListener('rotation:touch',schedule);P100Rotation.scrollEdges(strip);
  if(pause) pause.addEventListener('click', function(){if(window.P100.motionPaused){window.P100.setMotionPaused(false);setPlay(true);}else setPlay(!playing);pause.textContent=playing?'Pause auto-change':'Resume auto-change';pause.setAttribute('aria-pressed',String(!playing));});
  q('[data-jr-prev]').addEventListener('click', function () { show(i - 1, true); });
  q('[data-jr-next]').addEventListener('click', function () { show(i + 1, true); });
  thumbs.forEach(function (b, k) { b.addEventListener('click', function () { show(k, true); }); });
  stage.addEventListener('focusin', function(e){if(e.target.matches(':focus-visible')){playing=false;schedule();if(pause){pause.textContent='Resume auto-change';pause.setAttribute('aria-pressed','true');}}});
  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('p100:motion', function(){if(!window.P100.motionPaused)playing=true;if(window.P100.motionPaused||window.P100.reduceMotion.matches){frame.style.setProperty('--rx','0deg');frame.style.setProperty('--ry','0deg');stage.classList.remove('is-tilt')}schedule()});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; schedule(); }, { threshold: 0.01 }).observe(stage);
  } else { inView = true; }

  /* open the shared viewer on the matching hidden gallery link */
  function openViewer() { if (links[i]) links[i].click(); }
  q('[data-jr-open]').addEventListener('click', function (e) { if (swiped) { swiped = false; e.preventDefault(); return; } openViewer(); });
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1, true); }
  });

  /* swipe on touch, tilt with a mouse */
  var sx = 0, sy = 0, down = false;
  stage.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; down = true; sx = e.clientX; sy = e.clientY; swiped = false; });
  stage.addEventListener('pointerup', function (e) {
    if (!down) return; down = false;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = true; show(i + (dx < 0 ? 1 : -1), true); setTimeout(function () { swiped = false; }, 350); }
  });
  stage.addEventListener('pointercancel', function () { down = false; });
  if (!reduce) {
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || window.P100.motionPaused || window.P100.reduceMotion.matches) return;
      var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      frame.style.setProperty('--ry', ((x - .5) * 9).toFixed(2) + 'deg'); frame.style.setProperty('--rx', ((.5 - y) * 7).toFixed(2) + 'deg');
      frame.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); frame.style.setProperty('--gy', (y * 100).toFixed(1) + '%'); stage.classList.add('is-tilt');
    });
    stage.addEventListener('pointerleave', function () { frame.style.setProperty('--rx', '0deg'); frame.style.setProperty('--ry', '0deg'); stage.classList.remove('is-tilt'); });
  }
  img.classList.add('is-in'); thumbs[0].setAttribute('aria-current', 'true');
  setPlay(playing);

})();
/* ===== 74-flipcard.js ===== */
/* Two-sided picture card: turns over by itself every few seconds while it is on screen (random direction, now and then a long spin),
   turns on tap of the Flip button, pauses while hovered or just used. Reduced motion: no automatic turning. Both sides open in the shared lightbox. */
(function () {
  'use strict';
  var motion = window.P100.reduceMotion;
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function init(root) {
    var card = root.querySelector('.flipc__card'), btn = root.querySelector('[data-flip-btn]'),
        dl = root.querySelector('[data-flip-dl]'), dots = all('.pcap__dots i', root),
        faces = all('.flipc__face', root), caps = (root.dataset.caps || '').split('|'), origs = (root.dataset.origs || '').split('|'), sizes = (root.dataset.sizes || '').split('|');
    if (!card || !btn || faces.length < 2) return;
    var turns = 0, side = 0, timer = 0, hold = 0, seen = false, hover = false, keyboard = false;
    function reading() { return keyboard && root.contains(document.activeElement); }
    function visiblePart() {
      var box = root.getBoundingClientRect(), left = 0, top = 0, right = window.innerWidth, bottom = window.innerHeight;
      if (!root.getClientRects().length || !box.width || !box.height) return false;
      for (var parent = root.parentElement; parent && parent !== document.documentElement; parent = parent.parentElement) {
        var style = getComputedStyle(parent), clip = parent.getBoundingClientRect();
        if (/auto|scroll|hidden|clip/.test(style.overflowX)) { left = Math.max(left, clip.left + parent.clientLeft); right = Math.min(right, clip.left + parent.clientLeft + parent.clientWidth); }
        if (/auto|scroll|hidden|clip/.test(style.overflowY)) { top = Math.max(top, clip.top + parent.clientTop); bottom = Math.min(bottom, clip.top + parent.clientTop + parent.clientHeight); }
      }
      return Math.min(box.right, right) - Math.max(box.left, left) > Math.min(box.width, window.innerWidth) * .35 && Math.min(box.bottom, bottom) - Math.max(box.top, top) > Math.min(box.height, window.innerHeight) * .35;
    }
    function show() {
      root.dataset.side = side; btn.setAttribute('aria-label', 'Flip to ' + (caps[1 - side] || 'the other side')); if (dl) { dl.href = origs[side] || dl.href; var lab = 'Download the original image (PNG, ' + (sizes[side] || '') + ')'; dl.setAttribute('aria-label', lab); dl.title = 'Download original · PNG ' + (sizes[side] || ''); }
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === side); });
      faces.forEach(function (f, i) { if (i === side) { f.removeAttribute('aria-hidden'); f.removeAttribute('tabindex'); } else { f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; } });
    }
    function flip(manual) {
      var dir = Math.random() < .5 ? -1 : 1, spin = !manual && Math.random() < .25 ? 3 : 1;
      side = 1 - side; turns += dir * spin;
      card.style.setProperty('--dur', (spin > 1 ? 1.6 : .95) + 's'); card.style.setProperty('--turn', (turns * 180) + 'deg');
      if (!motion.matches && !window.P100.motionPaused) { root.classList.remove('is-turning'); void root.offsetWidth; root.classList.add('is-turning'); }
      show();
    }
    function schedule() {
      seen = visiblePart();
      clearTimeout(timer); if (!P100Rotation.autoplay() || window.P100.motionPaused || !seen || hover || document.hidden || document.querySelector('dialog[open]') || reading()) return;
      var wait = Date.now() < hold ? hold - Date.now() : 3500;
      timer = setTimeout(function () { if (seen && !hover && !document.hidden && P100Rotation.autoplay() && !window.P100.motionPaused && !document.querySelector('dialog[open]') && !reading() && Date.now() >= hold) flip(false); schedule(); }, wait);
    }
    btn.addEventListener('click', function () { hold = Date.now() + 3500; flip(true); schedule(); });
    root.addEventListener('pointerenter', function (event) { if (event.pointerType === 'mouse') { hover = true; clearTimeout(timer); } });
    root.addEventListener('pointerleave', function (event) { if (event.pointerType === 'mouse') { hover = false; schedule(); } });
    document.addEventListener('keydown', function (event) { if (event.key === 'Tab' || event.key.indexOf('Arrow') === 0) { keyboard = true; schedule(); } });
    document.addEventListener('pointerdown', function (event) { var wasKeyboard = keyboard; keyboard = false; if (root.contains(event.target)) { hold = Date.now() + 3500; schedule(); } else if (wasKeyboard) schedule(); }, { passive: true });
    root.addEventListener('focusin', schedule);root.addEventListener('focusout', function(){setTimeout(schedule,0)});motion.addEventListener('change', schedule);
    document.addEventListener('visibilitychange', schedule);
    document.addEventListener('close', schedule, true);
  document.addEventListener('p100:motion', schedule);
    var viewFrame = 0;
    function scheduleView() { if (!viewFrame) viewFrame = requestAnimationFrame(function () { viewFrame = 0; schedule(); }); }
    document.addEventListener('click', scheduleView);
    document.addEventListener('scroll', scheduleView, { capture: true, passive: true });
    window.addEventListener('resize', scheduleView, { passive: true });
    window.addEventListener('pageshow', scheduleView);
    window.addEventListener('popstate', scheduleView);
    window.addEventListener('hashchange', scheduleView);
    if ('IntersectionObserver' in window) new IntersectionObserver(scheduleView, { threshold: [0, .35, .6] }).observe(root);
    show();
  }
  all('[data-flip]').forEach(init);
})();

/* A vocabulary link opens its native disclosure before the reader arrives. */
(function(){
  function revealTerms(){
    if(location.hash !== '#protocol-terms') return;
    var terms=document.getElementById('protocol-terms');
    if(terms && terms.tagName === 'DETAILS') terms.open=true;
  }
  window.addEventListener('hashchange',revealTerms);
  revealTerms();
})();
