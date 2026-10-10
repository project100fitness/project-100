/* PROJECT 100 · HUD cards (preview v1)
   Markup contract:
     <ul class="hud-cards" data-hud-cards>
       <li><a class="hud-card" href="#detail-id" data-hud-card aria-expanded="false" aria-controls="detail-id">…</a></li>
     </ul>
     <div class="hud-details" data-hud-details data-gallery>
       <article class="hud-detail" id="detail-id" data-hud-detail> … <button data-hud-close> <button data-hud-prev> <button data-hud-next>
     </div>
   Without JS every detail is simply shown below the cards (no hiding), cards are plain links.
   With JS: clicking a card opens ONE detail "stage" directly under the card's row; clicking again, Esc or ✕ closes it. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = document.querySelectorAll('[data-hud-cards]');
  if (!groups.length) return;
  var registry = [];   // every folder's card group, so opening one closes the others

  groups.forEach(function (list) {
    var cards = [].slice.call(list.querySelectorAll('[data-hud-card]'));
    var wrap = document.querySelector(list.getAttribute('data-hud-for') || '[data-hud-details]');
    if (!wrap) return;
    var details = [].slice.call(wrap.querySelectorAll('[data-hud-detail]'));
    var byId = {}; details.forEach(function (d) { byId[d.id] = d; });
    var flow = true;
    list.classList.add('hud-cards--inline-flow');
    var stage = document.createElement(flow ? 'li' : 'div'); stage.className = 'hud-stage' + (details.length < 2 ? ' hud-stage--single' : ''); stage.setAttribute('aria-live', 'polite');
    if (flow) details.forEach(function (d) {
      var topNav = d.querySelector('.hud-detail__nav');
      if (!topNav) return;
      var position = document.createElement('span'); position.setAttribute('data-hud-position', ''); position.className = 'hud-flow-position'; topNav.insertBefore(position, topNav.children[1]);
      var bottom = topNav.cloneNode(true); bottom.classList.add('hud-flow-bottom');
      bottom.querySelector('[data-hud-prev]').textContent = '‹ Previous'; bottom.querySelector('[data-hud-next]').textContent = 'Next ›';
      d.appendChild(bottom);
    });
    var current = null;
    var me = { isOpen: function () { return !!current; }, close: function (o) { close(o); } };
    registry.push(me);

    function cols() {
      var its = [].slice.call(list.children).filter(function (x) { return x !== stage && !x.classList.contains('hud-stage'); });
      if (!its.length) return 1;
      var top = its[0].offsetTop, n = 0;
      for (var q = 0; q < its.length; q++) { if (Math.abs(its[q].offsetTop - top) < 4) n++; else break; }
      return Math.max(1, n);
    }
    function lastInRow(card) {
      var li = card.parentNode, items = [].slice.call(list.children).filter(function (x) { return x !== stage; });
      var top = li.offsetTop, last = li;
      items.forEach(function (item) { if (Math.abs(item.offsetTop - top) < 4) last = item; });
      return last;
    }
    function cardForHash(h) {
      var hit = cards.filter(function (c) { return c.getAttribute('href') === '#' + h || c.getAttribute('aria-controls') === h; })[0];
      if (hit) return hit;
      // a link to something INSIDE a card opens that card first
      var el = h && document.getElementById(h), det = el && el.closest && el.closest('[data-hud-detail]');
      return det ? cards.filter(function (c) { return c.getAttribute('aria-controls') === det.id; })[0] : undefined;
    }
    function park(d) { if (d && d.parentNode !== wrap) wrap.appendChild(d); }
    function setState(card, on) { if (card) card.setAttribute('aria-expanded', on ? 'true' : 'false'); }

    /* History: opening a card by tap adds ONE entry, so the Back button/gesture closes the card instead of leaving the page. */
    function setHist(card, id, mode) {
      if (!history.pushState) return;
      var url = card.getAttribute('href') || '#' + id, st = history.state || {};
      if (st.hud) history.replaceState({ hud: id, pushed: st.pushed }, '', url);          // switching card: same entry
      else if (mode === 'user') history.pushState({ hud: id, pushed: true }, '', url);     // tap: new entry
      else history.replaceState({ hud: id, pushed: mode === 'hash' }, '', url);           // arrived by link / bookmark
    }
    function userClose(o) {
      var st = history.state;
      if (current && st && st.hud && st.pushed) {
        var d = current; history.back();                                                     // popstate closes it
        setTimeout(function () { if (current === d) close(o); }, 350);
      } else close(o);
    }

    function close(opts) {
      opts = opts || {};
      if (!current) return;
      var d = current, card = cards.filter(function (c) { return c.getAttribute('aria-controls') === d.id; })[0];
      current = null; setState(card, false); list.classList.remove('is-open');
      var finish = function () { d.classList.remove('is-closing'); park(d); if (stage.parentNode) stage.parentNode.removeChild(stage); };
      if (reduce || opts.instant) finish();
      else { d.classList.add('is-closing'); setTimeout(finish, 260); }
      if (opts.focus && card) {
        card.focus({ preventScroll: true });
        // after closing, bring you back to the card you opened if it is off screen
        var r = card.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      }
      if (!opts.keepHash && history.replaceState && ((history.state && history.state.hud) || (location.hash && cardForHash(location.hash.slice(1))))) history.replaceState(null, '', location.pathname + location.search);
    }

    function open(card, opts) {
      opts = opts || {};
      var id = card.getAttribute('aria-controls'), d = byId[id];
      if (!d) return;
      if (current === d) { userClose({ focus: true }); return; }
      registry.forEach(function (g) { if (g !== me && g.isOpen()) g.close({ instant: true, keepHash: true }); });
      if (current) close({ instant: true, keepHash: true });
      current = d;
      cards.forEach(function (c) { setState(c, c === card); });
      list.classList.add('is-open');
      stage.appendChild(d);
      if (flow) { var rowEnd = lastInRow(card); list.insertBefore(stage, rowEnd.nextSibling); }
      else list.parentNode.insertBefore(stage, list);
      if (flow) d.querySelectorAll('[data-hud-position]').forEach(function (x) { x.textContent = (cards.indexOf(card) + 1) + ' of ' + cards.length; });
      d.classList.remove('is-closing');
      if (!opts.nohist) setHist(card, id, opts.mode || 'user');
      if (!opts.noScroll) {
        var head = document.getElementById('siteHead'), off = (head ? head.offsetHeight : 0) + 12;
        // bring the top of the opened card just under the header
        var y = window.pageYOffset + stage.getBoundingClientRect().top - off;
        window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    function step(dir) {
      if (!current) return;
      var i = details.indexOf(current), n = details.length;
      var card = cards.filter(function (c) { return c.getAttribute('aria-controls') === details[(i + dir + n) % n].id; })[0];
      if (card) { open(card); current.setAttribute('tabindex', '-1'); current.focus({ preventScroll: true }); }
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function (e) { e.preventDefault(); open(card); });
    });
    function onBtn(e) {
      var b = e.target.closest('[data-hud-close],[data-hud-prev],[data-hud-next]');
      if (!b) return;
      if (b.hasAttribute('data-hud-close')) userClose({ focus: true });
      else step(b.hasAttribute('data-hud-prev') ? -1 : 1);
    }
    wrap.addEventListener('click', onBtn);
    stage.addEventListener('click', onBtn);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && current && !document.querySelector('dialog[open]')) userClose({ focus: true });
    });
    // re-seat the stage if the column count changes (rotate, resize)
    var lastCols = 0;
    window.addEventListener('resize', function () {
      if (!current) return;
      var c = cols(); lastCols = c;
      if (flow) { var active = cards.filter(function (x) { return x.getAttribute('aria-expanded') === 'true'; })[0]; if (active) { stage.remove(); var end = lastInRow(active); list.insertBefore(stage, end.nextSibling); } }
    });
    // deep link: page.html#vector-v4 opens that card
    function fromHash(opts) {
      var card = cardForHash(location.hash.slice(1));
      if (card && current !== byId[card.getAttribute('aria-controls')]) open(card, { noScroll: false, mode: opts && opts.initial ? 'initial' : 'hash' });
    }
    window.addEventListener('hashchange', function () { fromHash(); });
    // Back / Forward: follow the history entry
    window.addEventListener('popstate', function (e) {
      var st = e.state, card = st && st.hud && cards.filter(function (c) { return c.getAttribute('aria-controls') === st.hud; })[0];
      if (card) { if (current !== byId[st.hud]) open(card, { nohist: true, noScroll: true }); }
      else if (current && !(location.hash && cardForHash(location.hash.slice(1)))) close({ focus: true, keepHash: true });
    });
    // map nodes (or any [data-hud-open="detail-id"]) open the matching card
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-hud-open]'); if (!t) return;
      var card = cards.filter(function (c) { return c.getAttribute('aria-controls') === t.getAttribute('data-hud-open'); })[0];
      if (card) { e.preventDefault(); if (current && byId[card.getAttribute('aria-controls')] === current) { stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return; } open(card); }
    });
    lastCols = cols();
    if (location.hash) setTimeout(function () { fromHash({ initial: true }); }, 60);
  });
})();
