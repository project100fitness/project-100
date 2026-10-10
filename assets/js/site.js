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
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.title = btn.getAttribute('aria-label');
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
/* Header: only shown near the very top of the page (or while something inside it has keyboard focus), so it never covers the picture or card being read.
   Scrolling up in the middle of a page does NOT bring it back; scroll to the top for the menu. Also centres the current tab. */
(function () {
  'use strict';
  var P = window.P100, head = P.$('#siteHead');
  if (!head) return;
  var SHOW_BELOW = 140, ticking = false;
  function update() {
    var y = window.scrollY;
    if (head.contains(document.activeElement) && document.activeElement !== document.body) head.dataset.hidden = 'false';
    else head.dataset.hidden = y < SHOW_BELOW ? 'false' : 'true';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  head.addEventListener('focusin', function () { head.dataset.hidden = 'false'; });
  head.addEventListener('focusout', function () { setTimeout(update, 0); });
  update();

  var list = P.$('.tabs__list'), cur = list && P.$('[aria-current="page"]', list);
  if (cur) list.scrollLeft = Math.max(0, cur.offsetLeft - (list.clientWidth - cur.offsetWidth) / 2);
})();

/* ===== 05-back.js ===== */
/* Back button / Back gesture: closes whatever is open on top (menu, download box, image viewer) instead of leaving the site.
   Every native <dialog> that opens adds one history entry; Back (or closing it any other way) removes it again. */
(function () {
  'use strict';
  var P = window.P100, proto = window.HTMLDialogElement && HTMLDialogElement.prototype, pending = [], timer = 0;
  if (!proto || !history.pushState) { P.afterLayer = function (fn) { fn(); }; return; }
  function flush() { clearTimeout(timer); timer = 0; var q = pending; pending = []; q.forEach(function (f) { f(); }); }
  /* run fn once a dialog's history entry has been removed (so a link click inside a dialog cannot race the Back step) */
  P.afterLayer = function (fn) { if (!timer && !pending.length) { fn(); return; } pending.push(fn); };
  var showModal = proto.showModal;
  proto.showModal = function () {
    var d = this, was = d.open;
    showModal.apply(d, arguments);
    if (was || !d.open) return;
    var st = {}; try { st = Object.assign({}, history.state); } catch (e) { /* ignore */ }
    st.p100dlg = 1;
    history.pushState(st, '', location.href);
    d.addEventListener('close', function () {
      if (history.state && history.state.p100dlg) {
        history.back();
        timer = setTimeout(flush, 300);            /* safety net if no popstate arrives */
      }
    }, { once: true });
  };
  window.addEventListener('popstate', function (e) {
    if (!(e.state && e.state.p100dlg)) P.$$('dialog[open]').forEach(function (d) { d.close(); });
    flush();
  });
  /* coming back to a page whose saved entry says "dialog open" while none is: neutralise it */
  function heal() { if (history.state && history.state.p100dlg && !document.querySelector('dialog[open]')) { var st = Object.assign({}, history.state); delete st.p100dlg; history.replaceState(st, '', location.href); } }
  window.addEventListener('pageshow', heal); heal();
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

/* ===== 30-menu.js ===== */
/* Site menu: one native <dialog> replaces the old links panel, page drawer and floating switch. */
(function () {
  'use strict';
  var P = window.P100, dlg = P.$('#menu'), openBtn = P.$('#menuBtn');
  if (!dlg || !openBtn) return;
  function open() {
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    openBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('no-scroll');
  }
  function close() {
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
  }
  openBtn.setAttribute('aria-expanded', 'false');
  openBtn.addEventListener('click', open);
  dlg.addEventListener('close', function () {
    openBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('no-scroll');
    openBtn.focus();
  });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target.closest('[data-menu-close]')) close();
  });
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
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    /* phones: swipe the picture left / right to step through the set */
    (function () {
      var sx = 0, sy = 0, t0 = 0, fig = P.$('.lightbox__fig', dlg);
      fig.addEventListener('touchstart', function (e) { if (e.touches.length !== 1) { t0 = 0; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; t0 = Date.now(); }, { passive: true });
      fig.addEventListener('touchend', function (e) {
        if (!t0 || set.length < 2 || !e.changedTouches.length || dlg.classList.contains('is-wide')) return;
        var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
        if (Date.now() - t0 < 700 && Math.abs(dx) > 55 && Math.abs(dy) < Math.abs(dx) * .6) show(idx + (dx < 0 ? 1 : -1));
        t0 = 0;
      }, { passive: true });
    })();
    /* wide dense boards on a phone: show them big and let the picture be dragged around (and pinch-zoomed) instead of squeezing them to thumbnail size */
    img.addEventListener('load', function () { var wide = img.naturalWidth / (img.naturalHeight || 1) > 1.4 && window.innerWidth < 720; dlg.classList.toggle('is-wide', wide); if (wide) { var f = img.parentNode.parentNode; f.scrollLeft = 0; f.scrollTop = 0; } });
    dlg.addEventListener('close', function () { dlg.classList.remove('is-wide'); document.documentElement.classList.remove('no-scroll'); if (opener) opener.focus(); img.removeAttribute('src'); });
  }
  function srcOf(el) { return el.getAttribute('data-full') || (el.querySelector('img') || el).currentSrc || el.src; }
  /* what the viewer shows: the biggest web version from the card's own srcset (fast on phones); the hi-res original stays behind Download / Full size */
  function viewOf(el) {
    var im = el.matches('img') ? el : el.querySelector('img'), ss = im && im.getAttribute('srcset'), best = '', w = 0;
    if (ss) ss.split(',').forEach(function (c) { var q = c.trim().split(/\s+/), n = parseInt(q[1], 10) || 0; if (n > w && n <= 1700) { w = n; best = q[0]; } });
    return best || srcOf(el);
  }
  function labelOf(el) { var i = el.matches('img') ? el : el.querySelector('img'); return el.getAttribute('aria-label') || (i && i.alt) || ''; }
  function show(i) {
    idx = (i + set.length) % set.length;
    var el = set[idx], src = srcOf(el);
    dlg.classList.remove('is-wide'); img.src = viewOf(el); img.alt = labelOf(el); cap.textContent = labelOf(el);
    var org = el.getAttribute('data-orig') || src; dl.href = org; dl.setAttribute('download', org.split('/').pop().split('?')[0]); full.href = src;   /* data-orig = hi-res original (download); data-full = web version */
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
    opener = t;
    var at = set.indexOf(t);
    if (at < 0) { var want = srcOf(t); set.forEach(function (x, n) { if (at < 0 && srcOf(x) === want) at = n; }); }
    show(Math.max(0, at));
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
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
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&playsinline=1&rel=0&modestbranding=1' + (/^https?:$/.test(location.protocol) ? '&origin=' + encodeURIComponent(location.origin) : '');
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
    if (vdlg.showModal) vdlg.showModal(); else vdlg.setAttribute('open', '');
    document.documentElement.classList.add('no-scroll');
  });

  /* Preview pop-up for page-link rows ([data-preview] carousels): a bigger picture, the title and an "Open page" button, so a stray tap
     never throws a visitor off the page. Text-only cards (the story chapters) open as a large readable card. Prev / next step through the row. */
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
    if (it.querySelector('a[href]') && !e.target.closest('a[href]')) return;      /* only a tap on the card itself */
    if (!it.querySelector('a[href]') && e.target.closest('a,button')) return;
    e.preventDefault();
    pbuild();
    pset = P.$$('.carousel__item', row);
    popener = it.querySelector('a[href]') || null;
    pshow(Math.max(0, pset.indexOf(it)));
    if (pdlg.showModal) pdlg.showModal(); else pdlg.setAttribute('open', '');
    document.documentElement.classList.add('no-scroll');
  });

  var conn = navigator.connection || {};
  P.$$('video[data-src]').forEach(function (v) {
    if (P.reduceMotion.matches || conn.saveData) return;       /* poster only */
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (!v.src) { v.src = (v.dataset.srcMobile && window.matchMedia('(max-width: 760px)').matches) ? v.dataset.srcMobile : v.dataset.src; v.load(); }   /* phones get the small clip */
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: .15 });
    io.observe(v);
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
      var live = P.$('[data-filter-status]', group.parentElement); if (live) live.textContent = n + (n === 1 ? ' entry' : ' entries');
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
  var menu = P.$('#menuBtn'); if (menu) menu.addEventListener('click', function () { close(); });
})();

/* ===== 36-downloads.js ===== */
/* "Free downloads" pop-out (Encyclopedia + Guidebook PDFs) opens from the "Downloads" row in the @ panel on every page.
   On the home page and Fit Protocol only, a two-half bar rises into view as the page approaches its end (tied to the scroll
   position) and is fully up at the very bottom; scrolling back up lowers it again. */
(function () {
  'use strict';
  var P = window.P100, bar = P.$('#dlBar'), dlg = P.$('#dlModal'), last = null, ticking = false, last_p = -1;
  if (!dlg) return;
  var RANGE = 420;                                                    /* px before the very end of the page where the bar starts rising */
  function check() {
    ticking = false;
    if (!bar) return;
    var left = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    var range = Math.min(RANGE, window.innerHeight * 0.55);
    var p = left <= 2 ? 1 : Math.max(0, Math.min(1, 1 - left / range));   /* 0 = hidden below the screen, 1 = fully up at the very bottom */
    if (p === last_p) return;
    last_p = p;
    bar.style.setProperty('--dl-p', p.toFixed(3));
    document.documentElement.style.setProperty('--dl-p', p.toFixed(3));
    bar.classList.toggle('is-in', p > 0);
  }
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
  function open(from) {
    last = from || null;
    var panel = P.$('#fabPanel'), at = P.$('#fabAt');
    if (panel && !panel.hidden) { panel.hidden = true; if (at) at.setAttribute('aria-expanded', 'false'); }
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    var want = from && from.getAttribute ? from.getAttribute('data-dl-doc') : null;   /* the bar's two halves pick their own file */
    P.$$('.dl-file', dlg).forEach(function (f) { var on = !!want && f.getAttribute('data-doc') === want; f.classList.toggle('is-picked', on); if (on && f.scrollIntoView) f.scrollIntoView({ block: 'nearest' }); });
    var close = P.$('[data-dl-close]', dlg); if (close) close.focus();
  }
  function close() {
    if (typeof dlg.close === 'function' && dlg.open) dlg.close(); else dlg.removeAttribute('open');
    if (last && document.contains(last) && last.offsetParent !== null) { try { last.focus(); } catch (e) { /* ignore */ } }
  }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-dl-open]');
    if (o) { e.preventDefault(); open(o); return; }
    if (e.target.closest('[data-dl-close]')) { e.preventDefault(); close(); return; }
    if (e.target === dlg) close();                                   /* tap on the dimmed backdrop */
    else if (dlg.open && e.target.closest('a[download]')) setTimeout(close, 400);
  });
  if (bar) {
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    window.addEventListener('load', queue);
    queue();
  }
})();

/* ===== 58-marquee.js ===== */
/* Footer "Explore" and "Elsewhere" link rows drift sideways by themselves, forever (the row is cloned so it has no end).
   A finger, the mouse or keyboard focus pauses it; ~2 s after you let go it carries on. */
(function () {
  'use strict';
  var P = window.P100, SPEED = 30, RESUME = 2000;
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
  function init(ul) {
    if (ul.dataset.marquee) return;
    var items = P.$$(':scope > li', ul);
    if (items.length < 2) return;
    var active = false, setW = 0, base = 0, pos = null, last = 0, hold = 0, lastAuto = -1, lastW = -1;
    var inView = true, mouseOver = false, touching = false, keyFocus = false, usingKeys = false, idle = 0;

    function gapPx() { var g = getComputedStyle(ul); return parseFloat(g.columnGap) || parseFloat(g.gap) || 0; }
    function teardown() { P.$$(':scope > [data-clone]', ul).forEach(function (n) { n.remove(); }); ul.removeAttribute('data-marquee'); active = false; pos = null; }
    function tame(c) {
      c.setAttribute('data-clone', ''); c.setAttribute('aria-hidden', 'true');
      P.$$('a,button', c).forEach(function (n) { n.setAttribute('tabindex', '-1'); });
    }
    function build() {
      var w = ul.clientWidth; lastW = w; teardown();
      if (w < 40) return;                                            /* runs even with "reduce motion": it is a slow, small, pausable drift the site owner wants always on */
      var first = items[0], lastIt = items[items.length - 1];
      var natural = lastIt.offsetLeft + lastIt.offsetWidth - first.offsetLeft + gapPx();
      if (natural <= w + 4) return;                                  /* everything fits: nothing to scroll */
      var n = Math.min(4, Math.max(1, Math.ceil(w * 1.5 / natural)));
      var before = document.createDocumentFragment(), after = document.createDocumentFragment(), i, k, c;
      for (k = 0; k < n; k++) {
        for (i = 0; i < items.length; i++) { c = items[i].cloneNode(true); tame(c); after.appendChild(c); }
        for (i = 0; i < items.length; i++) { c = items[i].cloneNode(true); tame(c); before.appendChild(c); }
      }
      ul.insertBefore(before, items[0]); ul.appendChild(after);
      ul.setAttribute('data-marquee', '1'); active = true;
      var firstClone = lastIt.nextElementSibling;
      setW = firstClone ? firstClone.offsetLeft - items[0].offsetLeft : natural;
      base = items[0].offsetLeft; ul.scrollLeft = base; lastAuto = base; pos = null;
    }
    function wrap() {
      if (!active || !setW) return;
      var x = ul.scrollLeft;
      if (x < base - setW * 0.5 || x >= base + setW * 1.5) ul.scrollLeft = base + (((x - base) % setW) + setW) % setW;
      else if (x < base) ul.scrollLeft = x + setW;
      else if (x >= base + setW) ul.scrollLeft = x - setW;
      lastAuto = ul.scrollLeft; pos = null;
    }
    function holdFor(ms) { hold = Math.max(hold, now() + ms); pos = null; }
    function playing() { return active && inView && !mouseOver && !touching && !keyFocus && !document.hidden && now() > hold; }
    function tick(ts) {
      requestAnimationFrame(tick);
      var dt = Math.min(64, ts - last); last = ts;
      if (!playing()) { pos = null; return; }
      if (pos === null) pos = ul.scrollLeft;
      pos += SPEED * dt / 1000;
      if (pos >= base + setW) pos -= setW;
      ul.scrollLeft = pos; lastAuto = ul.scrollLeft;
    }
    ul.addEventListener('scroll', function () {
      if (Math.abs(ul.scrollLeft - lastAuto) > 2) { holdFor(RESUME); lastAuto = ul.scrollLeft; }
      clearTimeout(idle); idle = setTimeout(wrap, 140);
    }, { passive: true });
    ul.addEventListener('wheel', function () { holdFor(RESUME + 800); }, { passive: true });
    ul.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') mouseOver = true; });
    ul.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { mouseOver = false; holdFor(500); } });
    ul.addEventListener('touchstart', function () { touching = true; pos = null; }, { passive: true });
    function endTouch() { touching = false; holdFor(RESUME + 600); }
    ul.addEventListener('touchend', endTouch, { passive: true });
    ul.addEventListener('touchcancel', endTouch, { passive: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || /^Arrow/.test(e.key)) usingKeys = true; }, true);
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (t) { document.addEventListener(t, function () { usingKeys = false; }, true); });
    ul.addEventListener('focusin', function () { keyFocus = usingKeys; });
    ul.addEventListener('focusout', function () { keyFocus = false; holdFor(1200); });
    document.addEventListener('visibilitychange', function () { pos = null; holdFor(400); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (!inView) pos = null; }, { threshold: .1 }).observe(ul);
    function remeasure() { if (ul.clientWidth !== lastW) build(); }
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(ul.parentNode); else window.addEventListener('resize', remeasure);
    window.addEventListener('load', build);
    build();
    requestAnimationFrame(function (t) { last = t; tick(t); });
  }
  P.$$('.site-foot ul').forEach(init);
})();

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
  var P = window.P100, SPEED = 34, RESUME = 2200, REST = 1400;   /* px per second; ms of calm after a touch; ms of rest at either end */
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }

  function init(root) {
    var track = P.$('.carousel__track', root), stage = P.$('.carousel__stage', root), head = P.$('.carousel__head', root);
    if (!track || !stage || root.dataset.ready) return;
    var items = P.$$('.carousel__item', track);
    root.dataset.ready = '1';
    if (items.length < 2) { root.classList.add('is-single'); return; }

    var bar = document.createElement('div'); bar.className = 'carousel__bar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<span class="carousel__thumb"></span>';
    var thumb = bar.firstChild;
    var pp = document.createElement('button'); pp.type = 'button'; pp.className = 'carousel__pp';
    stage.appendChild(bar);
    if (head) head.appendChild(pp);
    if (!track.hasAttribute('tabindex')) track.tabIndex = 0;

    var active = false, lastW = -1, pos = null, last = 0, hold = 0, dir = 1, inView = true, lastAuto = 0;
    var mouseOver = false, touching = false, keyFocus = false, userPaused = P.reduceMotion.matches, idle = 0, raf = 0;

    function maxScroll() { return Math.max(0, track.scrollWidth - track.clientWidth); }
    function measure() {
      lastW = track.clientWidth;
      var over = lastW >= 40 && maxScroll() > 4;                        /* hidden (filtered out) or everything already fits: nothing to drift */
      active = over; pp.hidden = !over; bar.hidden = !over;
      root.classList.toggle('is-drift', over);
      pos = null; lastAuto = track.scrollLeft; sync();
    }
    function sync() {
      if (!active) return;
      var m = maxScroll() || 1, w = Math.max(.12, Math.min(1, track.clientWidth / track.scrollWidth)), f = Math.max(0, Math.min(1, track.scrollLeft / m));
      thumb.style.width = (w * 100) + '%'; thumb.style.left = (f * (1 - w) * 100) + '%';
    }
    function playing() { return active && !userPaused && !document.documentElement.classList.contains('no-scroll') && inView && !mouseOver && !touching && !keyFocus && !document.hidden && now() > hold; }
    function label() {
      pp.innerHTML = userPaused ? PLAY : PAUSE;
      pp.setAttribute('aria-label', userPaused ? 'Start auto-scroll' : 'Pause auto-scroll');
      pp.setAttribute('aria-pressed', String(userPaused)); pp.title = pp.getAttribute('aria-label');
    }
    function tick(ts) {
      raf = requestAnimationFrame(tick);
      var dt = Math.min(64, ts - last); last = ts;
      if (!playing()) { pos = null; return; }
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
    function go(d) { holdFor(RESUME + 2500); track.scrollBy({ left: d * step(), behavior: P.reduceMotion.matches ? 'auto' : 'smooth' }); }

    pp.addEventListener('click', function () { userPaused = !userPaused; pos = null; label(); });
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
    track.addEventListener('wheel', function () { holdFor(RESUME + 800); }, { passive: true });
    /* mouse only: a finger never "hovers", so touch screens cannot get stuck paused */
    root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') mouseOver = true; });
    root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { mouseOver = false; holdFor(500); } });
    track.addEventListener('touchstart', function () { touching = true; pos = null; }, { passive: true });
    function endTouch() { touching = false; holdFor(RESUME + 800); }
    track.addEventListener('touchend', endTouch, { passive: true });
    track.addEventListener('touchcancel', endTouch, { passive: true });
    window.addEventListener('blur', function () { touching = false; mouseOver = false; });
    /* keyboard focus pauses; a tap that merely leaves focus on a card does not */
    var usingKeys = false;
    document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || e.key.indexOf('Arrow') === 0) usingKeys = true; }, true);
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) { document.addEventListener(ev, function () { usingKeys = false; keyFocus = false; }, true); });
    root.addEventListener('focusin', function () { keyFocus = usingKeys; });
    root.addEventListener('focusout', function () { keyFocus = false; holdFor(1200); });
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
        track.scrollLeft = f * maxScroll(); holdFor(RESUME + 1500);
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
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(stage); else window.addEventListener('resize', remeasure);
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
  var P = window.P100, SPEED = 30, REST = 1200, RESUME = 3200;
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
  function init(row) {
    if (row.dataset.hint) return; row.dataset.hint = '1';
    var bar = document.createElement('div'); bar.className = 'rowbar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<span></span>';
    var thumb = bar.firstChild; row.parentNode.insertBefore(bar, row.nextSibling);
    var active = false, pos = null, dir = 1, hold = now() + 1800, last = 0, lastAuto = 0, inView = true, touching = false, mouse = false, keyFocus = false, usingKeys = false, lastW = -1;
    var still = P.reduceMotion.matches;
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
      row.classList.toggle('is-drift', active); bar.hidden = !active; pos = null; lastAuto = row.scrollLeft; paint();
    }
    function holdFor(ms) { hold = Math.max(hold, now() + ms); pos = null; }
    function playing() { return active && !still && inView && !touching && !mouse && !keyFocus && !document.hidden && !document.documentElement.classList.contains('no-scroll') && now() > hold; }
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
    function endTouch() { touching = false; holdFor(RESUME); }
    row.addEventListener('touchend', endTouch, { passive: true }); row.addEventListener('touchcancel', endTouch, { passive: true });
    row.addEventListener('wheel', function () { holdFor(RESUME); }, { passive: true });
    row.addEventListener('click', function () { holdFor(RESUME + 2500); });
    row.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') mouse = true; });
    row.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { mouse = false; holdFor(500); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || e.key.indexOf('Arrow') === 0) usingKeys = true; }, true);
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) { document.addEventListener(ev, function () { usingKeys = false; keyFocus = false; }, true); });
    row.addEventListener('focusin', function () { keyFocus = usingKeys; }); row.addEventListener('focusout', function () { keyFocus = false; holdFor(1200); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (!inView) pos = null; }, { threshold: .2 }).observe(row);
    function remeasure() { if (row.clientWidth !== lastW) measure(); }
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(row); else window.addEventListener('resize', remeasure);
    window.addEventListener('load', measure);
    measure(); requestAnimationFrame(function (t) { last = t; tick(t); });
  }
  P.initRowHints = function (scope) { P.$$('.filters, .subnav', scope).forEach(init); };
  P.initRowHints(document);
})();

/* ===== 65-countup.js ===== */
/* Count-up numbers + status-versus-goal meters. Numbers start at 0 and run to their real value when scrolled into view.
   Every .stat__value that is a single plain number (e.g. "2,780", "252g", "88.2 lbs", "<15%") counts up; [data-countup] forces it.
   .meter bars fill to their value; [data-tone="now"|"goal"] colours current-status figures versus goal figures.
   Reduced-motion visitors, and browsers without IntersectionObserver, just see the final figures. */
(function () {
  'use strict';
  var P = window.P100;
  var re = /^([<>~≈+]?\s?)(\d[\d,]*(?:\.\d+)?)([^\d]*)$/;
  var DUR = 1500;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function fmt(v, dec, comma) {
    var s = v.toFixed(dec);
    if (comma) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = p.join('.'); }
    return s;
  }
  function parse(el) {
    if (el.children.length) return null;
    var txt = el.textContent.trim(), m = re.exec(txt);
    if (!m) return null;
    var num = m[2], target = parseFloat(num.replace(/,/g, ''));
    if (!isFinite(target) || target <= 0) return null;
    return { el: el, text: el.textContent, pre: m[1], suf: m[3], target: target, dec: (num.split('.')[1] || '').length, comma: num.indexOf(',') > -1 };
  }
  function run(c) {
    var t0 = null;
    c.el.classList.add('is-counting');
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / DUR);
      c.el.textContent = c.pre + fmt(c.target * ease(p), c.dec, c.comma) + c.suf;
      if (p < 1) requestAnimationFrame(frame);
      else { c.el.textContent = c.text; c.el.classList.remove('is-counting'); c.el.classList.add('is-counted'); }
    }
    requestAnimationFrame(frame);
  }
  var canAnimate = 'IntersectionObserver' in window && !P.reduceMotion.matches;
  var counters = P.$$('.stat__value,[data-countup]').map(parse).filter(Boolean);
  var meters = P.$$('.meter');
  if (!canAnimate) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      var c = en.target._cu;
      if (c) run(c);
      if (en.target.classList.contains('meter')) en.target.classList.remove('is-armed');
    });
  }, { threshold: .35 });
  counters.forEach(function (c) { c.el._cu = c; c.el.textContent = c.pre + fmt(0, c.dec, c.comma) + c.suf; io.observe(c.el); });
  meters.forEach(function (m) { m.classList.add('is-armed'); io.observe(m); });
})();

/* ===== 72-recview.js ===== */
/* Record viewer: subject tabs (vector / state / stage / gym step) + style-edition tabs. One picture is shown at a time and only the selected one is fetched;
   the native recipe text beside it never changes with the style. Without JavaScript the edition links simply open the pictures. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var q = function (s, r) { return (r || root).querySelector(s); }, qa = function (s, r) { return [].slice.call((r || root).querySelectorAll(s)); };
  var stage = q('[data-jr-stage]'), img = q('[data-jr-img]'), bg = q('[data-jr-bg]'), frame = q('[data-jr-frame]'), prog = q('[data-jr-prog]');
  var thumbs = qa('[data-jr-go]'), links = qa('[data-jr-lb] a'), strip = q('[data-jr-strip]');
  var t = { n: q('[data-jr-n]'), date: q('[data-jr-date]'), place: q('[data-jr-place]'), cap: q('[data-jr-cap]'), stamp: q('[data-jr-stamp]') };
  var pp = q('[data-jr-pp]'), ppl = q('[data-jr-pplabel]');
  var DUR = 6000, i = 0, timer = 0, playing = true, inView = false, holdUntil = 0, swiped = false, hovering = false;
  if (!stage || !thumbs.length) return;
  root.style.setProperty('--jr-dur', DUR + 'ms');

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function show(n, user) {
    var len = thumbs.length; i = (n + len) % len;
    var b = thumbs[i], d = b.dataset;
    img.classList.remove('is-in');
    var next = new Image();
    var done = function () {
      img.srcset = d.srcset; img.src = d.src; img.alt = d.alt; img.width = +d.w; img.height = +d.h;
      bg.style.backgroundImage = "url('" + d.bg + "')";
      void img.offsetWidth; img.classList.add('is-in');
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
  function schedule() {
    clearTimeout(timer); prog.classList.remove('run'); void prog.offsetWidth;
    if (!playing) return;
    if (inView && !document.hidden) prog.classList.add('run');
    timer = setTimeout(tick, Math.max(DUR, holdUntil - Date.now() + 60));
  }
  function tick() {
    if (!playing || !inView || document.hidden || hovering || Date.now() < holdUntil) { schedule(); return; }
    show(i + 1, false);
  }
  function setPlay(on) {
    playing = !!on; pp.setAttribute('aria-pressed', playing ? 'true' : 'false'); ppl.textContent = playing ? 'Pause' : 'Play'; schedule();
  }
  pp.addEventListener('click', function () { setPlay(!playing); });
  q('[data-jr-prev]').addEventListener('click', function () { holdUntil = Date.now() + 4000; show(i - 1, true); });
  q('[data-jr-next]').addEventListener('click', function () { holdUntil = Date.now() + 4000; show(i + 1, true); });
  thumbs.forEach(function (b, k) { b.addEventListener('click', function () { holdUntil = Date.now() + 4000; show(k, true); }); });
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; schedule(); }, { threshold: 0.2 }).observe(stage);
  } else { inView = true; }

  /* open the shared viewer on the matching hidden gallery link */
  function openViewer() { if (links[i]) links[i].click(); }
  q('[data-jr-open]').addEventListener('click', function (e) { if (swiped) { swiped = false; e.preventDefault(); return; } openViewer(); });
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); holdUntil = Date.now() + 4000; show(i + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); holdUntil = Date.now() + 4000; show(i - 1, true); }
  });

  /* swipe on touch, tilt with a mouse */
  var sx = 0, sy = 0, down = false;
  stage.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovering = true; } });
  stage.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; schedule(); } });
  stage.addEventListener('pointerdown', function (e) { holdUntil = Date.now() + 4000; if (e.pointerType === 'mouse') return; down = true; sx = e.clientX; sy = e.clientY; swiped = false; });
  stage.addEventListener('pointerup', function (e) {
    if (!down) return; down = false;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = true; show(i + (dx < 0 ? 1 : -1), true); setTimeout(function () { swiped = false; }, 350); }
  });
  stage.addEventListener('pointercancel', function () { down = false; });
  if (!reduce) {
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
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
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function init(root) {
    var card = root.querySelector('.flipc__card'), btn = root.querySelector('[data-flip-btn]') || (root.closest('.hud-detail') || document).querySelector('[data-flip-btn]'), cap = root.querySelector('[data-flip-cap]'),
        dl = root.querySelector('[data-flip-dl]'), size = root.querySelector('[data-flip-size]'), dots = all('.flipc__dots i', root),
        faces = all('.flipc__face', root), caps = (root.dataset.caps || '').split('|'), origs = (root.dataset.origs || '').split('|'), sizes = (root.dataset.sizes || '').split('|');
    if (!card || !btn || faces.length < 2) return;
    var turns = 0, side = 0, timer = 0, hold = 0, seen = false, hover = false, first = true;
    function show() {
      root.dataset.side = side; cap.textContent = caps[side] || ''; if (dl) dl.href = origs[side] || dl.href; if (size) size.textContent = sizes[side] || '';
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === side); });
      faces.forEach(function (f, i) { if (i === side) { f.removeAttribute('aria-hidden'); f.removeAttribute('tabindex'); } else { f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; } });
    }
    function flip(manual) {
      var dir = Math.random() < .5 ? -1 : 1, spin = !manual && Math.random() < .25 ? 3 : 1;
      side = 1 - side; turns += dir * spin;
      card.style.setProperty('--dur', (spin > 1 ? 1.6 : .95) + 's'); card.style.setProperty('--turn', (turns * 180) + 'deg');
      if (!reduce) { root.classList.remove('is-turning'); void root.offsetWidth; root.classList.add('is-turning'); }
      show();
    }
    function schedule() {
      clearTimeout(timer); if (reduce || !seen || hover || document.hidden) return;
      var wait = Date.now() < hold ? hold - Date.now() : (first ? 2200 : 4200 + Math.random() * 4800); first = false;
      timer = setTimeout(function () { if (seen && !hover && !document.hidden && Date.now() >= hold) flip(false); schedule(); }, wait);
    }
    btn.addEventListener('click', function () { hold = Date.now() + 16000; flip(true); schedule(); });
    root.addEventListener('mouseenter', function () { hover = true; clearTimeout(timer); });
    root.addEventListener('mouseleave', function () { hover = false; schedule(); });
    root.addEventListener('touchstart', function () { hold = Date.now() + 16000; }, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting && es[0].intersectionRatio > .35; first = first && seen; schedule(); }, { threshold: [0, .35, .6] }).observe(root);
    show();
  }
  all('[data-flip]').forEach(init);
})();
