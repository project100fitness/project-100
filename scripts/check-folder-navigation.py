"""Review the authored navigation across every published page and three browser engines."""
from pathlib import Path
from html.parser import HTMLParser
import json, threading, io, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
class Navigation(HTMLParser):
    def __init__(self):
        super().__init__();self.nav=False;self.links=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=="nav" and "tabs" in a.get("class","").split():self.nav=True
        if self.nav and tag=="a":self.links.append(a)
    def handle_endtag(self,tag):
        if tag=="nav":self.nav=False
pages=[]
for path in sorted(Path(".").glob("*.html")):
    source=path.read_text();p=Navigation();p.feed(source)
    if not p.links:continue
    assert len([a for a in p.links if a.get("aria-current")=="page"])==1,path
    assert all(a.get("data-folder") and Path(a["href"]).is_file() for a in p.links),path
    assert len(p.links)==(12 if 'data-site="protocol"' in source else 7),path
    if 'data-site="main"' in source:assert any(a["href"]=="kinetics.html" for a in p.links),path
    pages.append(path.name)
assert len(pages)==55
css=Path("assets/css/site.css").read_text()
assert not any("@keyframes "+s in css for s in ["tab-glow","tab-open","tab-breathe"])
assert "function addKinetics" not in Path("assets/js/site.js").read_text()
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*_):pass
server=ThreadingHTTPServer(("127.0.0.1",4180),Quiet)
threading.Thread(target=server.serve_forever,daemon=True).start()
base="http://127.0.0.1:4180/"
output=Path("docs/folder-navigation");output.mkdir(parents=True,exist_ok=True)
results=[];shots=[]
def quiet_media(route):
    if route.request.resource_type in ("image","media"):route.abort()
    else:route.continue_()
def check(page,path,width):
    page.goto(base+path,wait_until="domcontentloaded")
    page.locator(".tab[aria-current=page]").wait_for()
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(60)
    state=page.evaluate("""()=>{let head=document.querySelector('.site-head'),row=head.querySelector('.tabs__list'),links=[...row.querySelectorAll('.tab')],active=row.querySelector('[aria-current=page]'),r=row.getBoundingClientRect(),a=active.getBoundingClientRect(),s=getComputedStyle(active),edge=getComputedStyle(active,'::after');return {tabs:links.length,active:active.getAttribute('href'),activeVisible:a.left>=r.left-1&&a.right<=r.right+1,headWidth:head.getBoundingClientRect().width,headHeight:head.getBoundingClientRect().height,rows:[...new Set(links.map(a=>Math.round(a.getBoundingClientRect().top)))].length,smallTargets:links.filter(a=>a.getBoundingClientRect().height<44).length,animation:s.animationName,boxShadow:s.boxShadow,edgeShadow:edge.boxShadow,edgeWidth:edge.width,fontSize:parseFloat(s.fontSize),colours:[...new Set(links.map(a=>getComputedStyle(a).getPropertyValue('--folder-colour').trim()))],role:active.getAttribute('data-folder')}}""")
    assert state["headWidth"]<=width+1,(path,state)
    expected_rows=2 if width>=1100 and state["tabs"]==12 else 1
    assert state["rows"]==expected_rows and state["smallTargets"]==0,(path,state)
    assert state["headHeight"]<220,(path,state)
    assert state["activeVisible"],(path,state)
    assert state["fontSize"]>=16,(path,state)
    assert state["animation"]=="none" and state["boxShadow"]=="none",(path,state)
    assert state["edgeShadow"]!="none" and state["edgeWidth"]=="4px",(path,state)
    assert len(state["colours"])==1 and state["colours"][0]=="#e8500a",(path,state)
    alignment=page.evaluate("""()=>{let row=document.querySelector('.tabs__list'),bar=document.querySelector('.site-head__bar'),links=[...row.querySelectorAll('.tab')],r=row.getBoundingClientRect(),b=bar.getBoundingClientRect(),widths=links.map(a=>a.getBoundingClientRect().width),cv=document.createElement('canvas');cv.width=cv.height=1;let ctx=cv.getContext('2d');function rgb(c){ctx.clearRect(0,0,1,1);ctx.fillStyle=c;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3)}function lum(c){let q=rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});return q[0]*.2126+q[1]*.7152+q[2]*.0722}function contrast(a,b){let x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}let ratios=links.map(a=>contrast(getComputedStyle(a).color,getComputedStyle(a,'::before').backgroundColor));return{left:r.left,right:r.right,barLeft:b.left,barRight:b.right,overflow:row.scrollWidth-row.clientWidth,widthSpread:Math.max(...widths)-Math.min(...widths),contrast:Math.min(...ratios)}}""")
    assert abs(alignment["left"]-alignment["barLeft"])<1 and abs(alignment["right"]-alignment["barRight"])<1,(path,alignment)
    assert alignment["contrast"]>=7,(path,alignment)
    if width>=1100:
        assert alignment["overflow"]<=1 and alignment["widthSpread"]<1,(path,alignment)

    return state
with sync_playwright() as p:
    chromium=p.chromium.launch()
    for width in [390,1440]:
        context=chromium.new_context(viewport={"width":width,"height":900},color_scheme="dark")
        context.route("**/*",quiet_media)
        for path in pages:
            page=context.new_page()
            state=check(page,path,width);results.append({"engine":"Chromium","path":path,"width":width,"status":"passed","active":state["active"]});page.close()
        context.close()
    chromium.close()
    for engine,name in [(p.chromium,"Chromium"),(p.firefox,"Firefox"),(p.webkit,"WebKit")]:
        browser=engine.launch()
        for theme in ["light","dark"]:
            for width in [320,768,1440]:
                context=browser.new_context(viewport={"width":width,"height":900},color_scheme=theme,accept_downloads=True)
                context.route("**/*",quiet_media)
                for path in ["index.html","kinetics.html","fit-protocol.html","library.html"]:
                    page=context.new_page()
                    state=check(page,path,width)
                    section=page.locator(".hud-folder").first
                    if section.count():
                        assert section.evaluate("(el)=>getComputedStyle(el.querySelector('.hud-folder__body')).borderLeftWidth")=="3px"
                    results.append({"engine":name,"path":path,"width":width,"theme":theme,"status":"passed","active":state["active"]})
                    if name=="Chromium" and path in ["index.html","fit-protocol.html"] and width in [320,768,1440]:
                        shot=output/(path.removesuffix(".html")+"-"+str(width)+"-"+theme+".png")
                        page.locator(".site-head").screenshot(path=str(shot));shots.append(shot)
                        if width==1440:
                            page.screenshot(path=str(output/("layout-"+path.removesuffix(".html")+"-"+theme+".png")))

                        if page.locator(".hud-folder__head").count():
                            shot=output/("section-"+path.removesuffix(".html")+"-"+str(width)+"-"+theme+".png")
                            page.locator(".hud-folder__head").first.screenshot(path=str(shot));shots.append(shot)
                    if path=="index.html":
                        # Clicking an offscreen folder reaches its real destination.
                        link=page.locator('.tabs .tab[href="biometrics.html"]')
                        link.scroll_into_view_if_needed()
                        link.click();page.wait_for_url("**/biometrics.html")
                        assert page.locator('.tabs .tab[aria-current="page"]').get_attribute("href")=="biometrics.html"
                        switch=page.locator('#themeToggle[role="switch"]')
                        before=switch.get_attribute('aria-checked')
                        switch.click()
                        assert switch.get_attribute('aria-checked')!=before
                        assert page.locator('#menuBtn').count()==0
                    if path=="library.html":
                        # Native keyboard traversal remains available through every folder.
                        first=page.locator(".tabs .tab").first;first.focus()
                        for _ in range(11):page.keyboard.press("Tab")
                        assert page.locator('.tab[href="library.html"]').evaluate("(el)=>document.activeElement===el")
                    page.close()
                context.close()
        # Exercise matching folders and download browsers on actual pages.
        context=browser.new_context(viewport={"width":390,"height":844},color_scheme="dark")
        context.route("**/*",quiet_media);page=context.new_page()
        for path in ["index.html","kinetics.html","fit-protocol-vectors.html","liquid-intake.html"]:
            page.close();page=context.new_page()
            check(page,path,390)
            folders=page.locator("details.fold,details.kin-category-folder")
            if folders.count():
                folder=folders.first
                folder.evaluate("(el)=>el.open=false")
                folder.locator("summary").first.click()
                assert folder.evaluate("(el)=>el.open")
                folder.locator("summary").first.click()
                assert not folder.evaluate("(el)=>el.open")
            records=page.locator(".rv-tab")
            if records.count()>1:
                records.nth(1).click()
                assert records.nth(1).get_attribute("aria-selected")=="true"
            if path=="kinetics.html":
                page.locator('[data-kin-filter="triceps"]').click()
                assert page.locator('[data-kin-group="triceps"]:visible').count()>0
                page.locator('[data-kin-filter="all"]').click()
                page.locator('[data-kd-open="focused"]').first.click()
                page.locator("#manualLibrary[open]").wait_for()
                page.locator('[data-manual-filter="techniques"]').click()
                assert page.locator('.manual-card').count()==1
                page.locator("[data-manual-close]").click()
                page.locator("#manualLibrary").wait_for(state="hidden")
            if path=="index.html":
                page.evaluate("""()=>{document.documentElement.style.scrollBehavior="auto";scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"});dispatchEvent(new Event("scroll"));}""")
                page.wait_for_timeout(500)
                page.locator('.page-dock [data-manual-group="books"]').click()
                page.locator("#manualLibrary[open]").wait_for()
                assert page.locator('.manual-card').count()==4
                assert page.locator('.manual-card strong').first.inner_text()=="Guidebook"
                page.locator("[data-manual-close]").click()
                page.locator("#manualLibrary").wait_for(state="hidden")
            results.append({"engine":name,"path":path,"width":390,"status":"passed","test":"folder-and-download-interaction"})
        context.close()
        # Source navigation remains complete without JavaScript.
        context=browser.new_context(java_script_enabled=False,viewport={"width":390,"height":844})
        context.route("**/*",quiet_media);page=context.new_page()
        for path in ["index.html","kinetics.html","fit-protocol.html","library.html"]:
            page.goto(base+path,wait_until="domcontentloaded")
            assert page.locator(".tabs .tab").count() in [7,12]
            assert page.locator(".tabs [aria-current=page]").count()==1
        context.close();browser.close()
server.shutdown()
thumbs=[]
for path in shots:
    im=Image.open(path).convert("RGB")
    im.thumbnail((720,180))
    canvas=Image.new("RGB",(760,210),"#cbd3d9");canvas.paste(im,(20,25))
    ImageDraw.Draw(canvas).text((20,7),path.stem,fill="#17232b");thumbs.append(canvas)
contact=Image.new("RGB",(1520,210*((len(thumbs)+1)//2)),"#adb9c4")
for i,im in enumerate(thumbs):contact.paste(im,((i%2)*760,(i//2)*210))
contact.save(output/"navigation-review.jpg",quality=90)
report={"status":"passed","authoredPages":len(pages),"browserCases":len(results),"engines":["Chromium","Firefox","WebKit"],"checks":["one active folder per page","all original routes preserved","original orange/amber/graphite brand palette","side-only active glow","no navigation animation","centred content-aligned navigation","equal desktop columns","contained desktop rows","minimum 7:1 folder-label contrast","44px touch targets","active folder visible","direct navigation","dialog open/close","keyboard traversal","JavaScript disabled"],"results":results}
(output/"validation.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps({"status":"passed","authoredPages":len(pages),"browserCases":len(results)}))
