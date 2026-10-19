"""Check responsive Kinetics sections and preview autoplay using local repository assets.
Run from the repository root after installing playwright and Chromium.
"""
from playwright.sync_api import sync_playwright
import json
from pathlib import Path
from urllib.parse import urlparse,unquote
import mimetypes
def route(r):
 path=Path(unquote(urlparse(r.request.url).path).lstrip("/"))
 if r.request.url.startswith("http://127.0.0.1") and path.is_file():r.fulfill(body=path.read_bytes(),content_type=mimetypes.guess_type(str(path))[0] or "application/octet-stream")
 else:r.abort()
with sync_playwright() as p:
 b=p.chromium.launch(args=['--no-sandbox'])
 for width in [320,390,430,768,1440]:
  c=b.new_context(viewport={'width':width,'height':900},is_mobile=width<800,has_touch=width<800,color_scheme='dark')
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',route)
  page.goto('http://127.0.0.1:4185/kinetics.html',wait_until='networkidle')
  data=page.evaluate('''()=>({overflow:document.documentElement.scrollWidth-innerWidth,head:document.querySelector('.site-head').getBoundingClientRect().height,grids:[...document.querySelectorAll('.kin-steps,.kin-pilates-atlas,.kin-bundles')].map(e=>({type:e.className,overflow:e.scrollWidth-e.clientWidth,display:getComputedStyle(e).display})),pause:[...document.querySelectorAll('button')].filter(e=>/pause|play slideshow/i.test(e.textContent+' '+e.getAttribute('aria-label'))&&e.getBoundingClientRect().height>0).map(e=>e.outerHTML)})''')
  print(width,json.dumps(data),errors,flush=True)
  assert data['overflow']<=1,(width,data)
  assert page.locator('[data-background-toggle]').count()==0
  if width<800:assert all(x['overflow']<=1 and x['display']=='grid' for x in data['grids']),data
  if width==390:
   entries=page.locator('.kin-local-nav a')
   assert entries.count()==2
   assert entries.nth(1).evaluate('(e)=>{let r=e.getBoundingClientRect();return r.right<=innerWidth}'), 'both programmes should fit'
   assert page.locator('[data-kin-programme="focused"] .kin-session-links a').count()==3
   assert page.locator('[data-kin-programme="fullbody"] .kin-session-links a').count()==2
   page.locator('#p100-programmes').scroll_into_view_if_needed();page.screenshot(path='/tmp/p100-mobile-folders.png')
   page.locator('.kin-pilates-atlas').scroll_into_view_if_needed();page.screenshot(path='/tmp/p100-mobile-pilates.png')
   page.locator('.kin-bundle-panel').scroll_into_view_if_needed();page.screenshot(path='/tmp/p100-mobile-bundles.png')
  page.goto('http://127.0.0.1:4185/exercises.html',wait_until='networkidle')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),width
  page.locator('[data-training-panel="library"]').click();page.wait_for_timeout(500)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),width
  assert not errors,errors
  c.close()
 b.close()
