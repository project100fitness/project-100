"""Keep dynamically filtered training rows in sync with the infinite carousel."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'fit-workout.html'
text = path.read_text()
text = text.replace("rows.forEach(r => r.innerHTML = '');", """rows.forEach(r => {
    window.ProjectCarousel?.destroyRow(r);
    r.innerHTML = '';
  });""")
text = text.replace("  window.Fixonic && window.Fixonic.initReveal && window.Fixonic.initReveal();\n}", """  wraps.forEach((wrap, index) => {
    if(index < activeRows) window.ProjectCarousel?.wireRow(wrap, rows[index], 'training row ' + (index + 1));
  });
  window.Fixonic && window.Fixonic.initReveal && window.Fixonic.initReveal();
}""") if 'training row ' not in text else text
text = text.replace("mediaEl.tabIndex=0;", "mediaEl.dataset.videoKeyboardReady='1';mediaEl.tabIndex=0;") if "mediaEl.dataset.videoKeyboardReady" not in text else text
start = text.index('// gentle auto-scroll for the training-log carousel')
end = text.index('// scrollspy:', start)
text = text[:start] + """// gentle auto-scroll for the training-log carousel: one card at a time,
// only while visible; manual interaction gives the reader full control.
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('#logGrid .carousel-row').forEach(function(grid){
    let paused = false;
    ['touchstart','pointerdown','wheel','carousel:nav','focusin'].forEach(ev =>
      grid.addEventListener(ev, () => { paused = true; }, {passive:true}));
    setInterval(() => {
      if(paused || reduced.matches || document.hidden || window.innerWidth > 900) return;
      const bounds = grid.getBoundingClientRect();
      if(!bounds.width || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      const cards = grid.querySelectorAll(':scope > :not([data-loop-copy])');
      if(cards.length < 2) return;
      grid.scrollBy({left:cards[1].offsetLeft-cards[0].offsetLeft,behavior:'smooth'});
    }, 4200);
  });
})();

""" + text[end:]
text = re.sub(r'assets/js/carousel\.js\?[^"\s]+', 'assets/js/carousel.js?v=20261004-release', text)
path.write_text(text)
for name in ['index.html', 'fit-nutrition.html', 'gear-shop.html']:
    page = ROOT / name
    html = re.sub(r'assets/js/carousel\.js\?[^"\s]+', 'assets/js/carousel.js?v=20261004-release', page.read_text())
    page.write_text(html)
print('Repaired dynamic carousel lifecycle and reduced-motion training rows.')
