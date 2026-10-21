"""Verify authored component ownership without browser or third-party parsing dependencies."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
retired=['assets/css/mobile-site.css','assets/css/mobile-rail.css','assets/js/mobile-flow.js','assets/js/mobile-rail.js']
for name in retired:assert not (ROOT/name).exists(),name
pages=list(ROOT.rglob('*.html'));drawers=0
for page in pages:
 source=page.read_text(encoding='utf8')
 for name in retired:assert name not in source,(page,name)
 if 'id="mobile-sections"' in source:
  drawers+=1
  assert re.search(r'<button[^>]*class="rail-toggle"',source),page
  assert 'class="rail-drawer"' in source and 'mobile-sections-title' in source,page
assert drawers==35,drawers
core=(ROOT/'assets/js/site.js').read_text(encoding='utf8')
assert 'P.openDialog = function (d)' in core
assert 'proto.showModal =' not in core and 'HTMLDialogElement.prototype' not in core
assert 'function measureHeader()' in core
for name in ['site.css','hud.css','kinetics.css','p100-band-training.css']:
 text=(ROOT/'assets/css'/name).read_text(encoding='utf8')
 assert 'Native component responsive states' in text,name
 assert 'mobile-ready' not in text,name
print(f'PASS: {len(pages)} HTML sources, {drawers} authored section drawers; four retired files absent, native dialog API unmodified, responsive rules in component owners.')
