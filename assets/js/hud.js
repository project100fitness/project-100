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
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = document.querySelectorAll('[data-hud-cards]');
  if (!groups.length) return;

  groups.forEach(function (list) {
    var cards = [].slice.call(list.querySelectorAll('[data-hud-card]'));
    var wrap = document.querySelector(list.getAttribute('data-hud-for') || '[data-hud-details]');
    if (!wrap) return;
    var details = [].slice.call(wrap.querySelectorAll('[data-hud-detail]'));
    var byId = {}; details.forEach(function (d) { byId[d.id] = d; });
    var stage = document.createElement('div'); stage.className = 'hud-stage'; stage.setAttribute('aria-live', 'polite');
    var current = null;

    function cols() { return getComputedStyle(list).gridTemplateColumns.split(' ').length || 1; }
    function lastInRow(card) {
      var li = card.parentNode, items = [].slice.call(list.children).filter(function (x) { return x !== stage; });
      var i = items.indexOf(li), c = cols(), end = Math.min(items.length - 1, (Math.floor(i / c) + 1) * c - 1);
      return items[end];
    }
    function cardForHash(h) {
      return cards.filter(function (c) { return c.getAttribute('href') === '#' + h || c.getAttribute('aria-controls') === h; })[0];
    }
    function park(d) { if (d && d.parentNode !== wrap) wrap.appendChild(d); }
    function setState(card, on) { if (card) card.setAttribute('aria-expanded', on ? 'true' : 'false'); }

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
      if (!opts.keepHash && history.replaceState && location.hash && cardForHash(location.hash.slice(1))) history.replaceState(null, '', location.pathname + location.search);
    }

    function open(card, opts) {
      opts = opts || {};
      var id = card.getAttribute('aria-controls'), d = byId[id];
      if (!d) return;
      if (current === d) { close({ focus: true }); return; }
      if (current) close({ instant: true, keepHash: true });
      current = d;
      cards.forEach(function (c) { setState(c, c === card); });
      list.classList.add('is-open');
      stage.appendChild(d);
      list.parentNode.insertBefore(stage, list);   // always ABOVE every card, never between rows
      d.classList.remove('is-closing');
      if (history.replaceState) history.replaceState(null, '', (card.getAttribute('href') || '#' + id));
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
      if (card) open(card);
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function (e) { e.preventDefault(); open(card); });
    });
    function onBtn(e) {
      var b = e.target.closest('[data-hud-close],[data-hud-prev],[data-hud-next]');
      if (!b) return;
      if (b.hasAttribute('data-hud-close')) close({ focus: true });
      else step(b.hasAttribute('data-hud-prev') ? -1 : 1);
    }
    wrap.addEventListener('click', onBtn);
    stage.addEventListener('click', onBtn);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && current && !document.querySelector('dialog[open]')) close({ focus: true });
    });
    // re-seat the stage if the column count changes (rotate, resize)
    var lastCols = 0;
    window.addEventListener('resize', function () {
      if (!current) return;
      var c = cols(); if (c === lastCols) return; lastCols = c;
    });
    // deep link: page.html#vector-v4 opens that card
    function fromHash() {
      var card = cardForHash(location.hash.slice(1));
      if (card && current !== byId[card.getAttribute('aria-controls')]) open(card, { noScroll: false });
    }
    window.addEventListener('hashchange', fromHash);
    // map nodes (or any [data-hud-open="detail-id"]) open the matching card
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-hud-open]'); if (!t) return;
      var card = cards.filter(function (c) { return c.getAttribute('aria-controls') === t.getAttribute('data-hud-open'); })[0];
      if (card) { e.preventDefault(); if (current && byId[card.getAttribute('aria-controls')] === current) { stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return; } open(card); }
    });
    lastCols = cols();
    if (location.hash) setTimeout(fromHash, 60);
  });
})();
