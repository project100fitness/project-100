/* ===================================================================
   PROJECT 100 — Floating "@" Connect button loader

   Sitewide overlay, not tied to any page's own markup. A page just
   links assets/css/float-connect.css in <head>, drops
   <script src="assets/js/float-connect.js"></script> near the other
   scripts, and calls ProjectFloatConnect.init() — this fetches the
   shared partial once and appends the button + popover straight onto
   <body>, so every page gets the exact same floating widget for free.
   =================================================================== */
(function(){
  var PARTIAL_URL = 'assets/partials/float-connect.html';

  function fetchPartial(){
    return fetch(PARTIAL_URL).then(function(res){
      if(!res.ok) throw new Error('float-connect.html ' + res.status);
      return res.text();
    });
  }

  function wire(root){
    var trigger = root.querySelector('#fcTrigger');
    var backdrop = root.querySelector('#fcBackdrop');
    var panel = root.querySelector('#fcPanel');
    var closeBtn = root.querySelector('#fcClose');
    if(!trigger || !backdrop || !panel) return;

    function restartCascade(){
      // CSS animations with fill-forwards only play once; pulling each
      // row out of the document and back in restarts the stagger every
      // time the menu opens, so it always "cascades" in fresh.
      var rows = panel.querySelectorAll('.fc-row');
      rows.forEach(function(row){
        row.style.animation = 'none';
        // eslint-disable-next-line no-unused-expressions
        row.offsetHeight; // force reflow
        row.style.animation = '';
      });
    }

    function open(){
      backdrop.hidden = false;
      panel.hidden = false;
      trigger.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      restartCascade();
      document.addEventListener('keydown', onKeydown);
    }
    function close(){
      backdrop.hidden = true;
      panel.hidden = true;
      trigger.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKeydown);
    }
    function onKeydown(e){ if(e.key === 'Escape') close(); }

    trigger.addEventListener('click', function(){
      if(panel.hidden) open(); else close();
    });
    backdrop.addEventListener('click', close);
    if(closeBtn) closeBtn.addEventListener('click', close);
  }

  function init(){
    if(document.getElementById('fcTrigger')) return; // already mounted
    fetchPartial().then(function(html){
      var host = document.createElement('div');
      host.className = 'fc-root';
      host.innerHTML = html;
      document.body.appendChild(host);
      wire(host);
    }).catch(function(err){
      // Fail quiet — the rest of the site works fine without the widget.
      console.warn('[float-connect] could not load shared component:', err);
    });
  }

  window.ProjectFloatConnect = { init: init };
})();
