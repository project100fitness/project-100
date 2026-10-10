/* Keep one chart expanded in browsers that do not support details[name]. */
(function () {
  'use strict';
  document.querySelectorAll('[data-protocol-accordion]').forEach(function (accordion) {
    var panels = Array.from(accordion.querySelectorAll('.protocol-panel'));
    panels.forEach(function (panel) {
      panel.addEventListener('toggle', function () {
        if (!panel.open) return;
        panels.forEach(function (other) {
          if (other !== panel) other.open = false;
        });
      });
    });
  });
})();
