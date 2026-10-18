"""Check fitted source photos and unambiguous workout-entry links."""
from pathlib import Path
import json,threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(("127.0.0.1",4181),Quiet)
threading.Thread(target=server.serve_forever,daemon=True).start()
out=Path("docs/folder-navigation");results=[]
with sync_playwright() as p:
    for engine in [p.chromium,p.firefox,p.webkit]:
        browser=engine.launch()
        for width in [390,768,1440]:
            page=browser.new_page(viewport={"width":width,"height":1000},color_scheme="dark")
            page.route("**/*",lambda r:r.abort() if r.request.resource_type=="media" else r.continue_())
            page.goto("http://127.0.0.1:4181/kinetics.html",wait_until="domcontentloaded")
            page.locator("[data-kg-play]").click()
            page.wait_for_function("document.querySelector('[data-kg-img]').naturalWidth>0")
            frame=page.locator(".kin-display-open")
            frame.scroll_into_view_if_needed()
            state=frame.evaluate("""el=>{let im=el.querySelector('img'),s=getComputedStyle(im),r=el.getBoundingClientRect(),i=im.getBoundingClientRect();return {fit:s.objectFit,position:s.objectPosition,bg:getComputedStyle(el).backgroundColor,left:i.left-r.left,right:r.right-i.right,top:i.top-r.top,bottom:r.bottom-i.bottom,width:r.width}}""")
            assert state["fit"]=="contain" and state["position"]=="50% 50%",state
            assert abs(state["left"]-state["right"])<2 and state["left"]>=15,state
            assert abs(state["top"]-state["bottom"])<2 and state["top"]>=15,state
            assert state["bg"]=="rgb(21, 26, 32)",state
            assert page.locator("[data-kg-bg]").count()==0
            assert len(page.locator("#kin-gallery-data").evaluate("(el)=>JSON.parse(el.textContent)"))==32
            assert page.locator('[data-kin-programme="focused"] .kin-session-links a').count()==3
            assert page.locator('[data-kin-programme="fullbody"] .kin-session-links a').count()==2
            assert page.locator('.exercise-entry,.kin-downloads').count()==0
            button=page.locator('[data-kin-programme="focused"] .kin-programme-guide')
            assert button.get_attribute("data-kd-open")=="focused"
            button.click()
            page.locator("#kinDownloadModal[open]").wait_for()
            assert page.locator('[data-kd-doc="focused"]').get_attribute("aria-pressed")=="true"
            page.locator("[data-kd-close]").click()
            if engine.name=="chromium":
                page.locator(".kin-display").screenshot(path=str(out/f"kinetics-framing-{width}.png"))
                page.locator(".kin-local-nav").screenshot(path=str(out/f"kinetics-guide-entry-{width}.png"))
            results.append({"engine":engine.name,"width":width,"status":"passed","frame":state})
            page.close()
        browser.close()
server.shutdown()
(out/"kinetics-framing-validation.json").write_text(json.dumps(results,indent=2)+"\n")
print(json.dumps({"status":"passed","galleryAndGuideCases":len(results)}))
