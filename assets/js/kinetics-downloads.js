/* Older workout guide entry URLs now use the single document library. */
(function(){'use strict';if(!document.getElementById('manualLibrary'))return;
 document.addEventListener('click',function(e){var b=e.target.closest('[data-kd-open]');if(!b||e.defaultPrevented||e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();window.P100?.openManualLibrary?.('training',b)});
 var requested=new URLSearchParams(location.search).get('workout');if(requested)window.addEventListener('load',function(){window.P100?.openManualLibrary?.('training')},{once:true});
})();
