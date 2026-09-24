/* ===================================================================
   PROJECT 100 — Connect ("Find Me Everywhere") component loader

   The Connect block is ONE component that every page mounts, not
   markup any page owns. A page just drops an empty, pre-styled mount
   point:

     <section class="connect-section" id="connect" data-connect-mount></section>

   and calls ProjectConnect.init() after assets/css/connect.css is
   linked in <head>. This script fetches the shared partial once and
   injects it into every mount point found on the page (normally
   there's only one, but it's safe if a page has more).
   =================================================================== */
(function(){
  var PARTIAL_URL = 'assets/partials/connect.html';
  var cachedHTML = null;
  var pending = null;

  function fetchPartial(){
    if(cachedHTML !== null) return Promise.resolve(cachedHTML);
    if(pending) return pending;
    pending = fetch(PARTIAL_URL)
      .then(function(res){
        if(!res.ok) throw new Error('connect.html ' + res.status);
        return res.text();
      })
      .then(function(html){ cachedHTML = html; return html; });
    return pending;
  }

  function mountInto(el, html){
    el.innerHTML = html;
    el.setAttribute('data-connect-loaded', '');
  }

  function init(){
    var mounts = document.querySelectorAll('[data-connect-mount]');
    if(!mounts.length) return;
    fetchPartial().then(function(html){
      mounts.forEach(function(el){ mountInto(el, html); });
    }).catch(function(err){
      // Fail quiet on GitHub Pages / static hosting hiccups — the rest of
      // the page still works, the section just stays empty instead of
      // breaking anything above or below it.
      console.warn('[connect] could not load shared component:', err);
    });
  }

  window.ProjectConnect = { init: init };
})();
