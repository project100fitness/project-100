"""Exercise the published-source UI and actual downloads at three responsive widths."""
import json, threading, tempfile, functools, io
from PIL import Image
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
from pypdf import PdfReader
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_): pass
server=ThreadingHTTPServer(("127.0.0.1",4173),Quiet)
threading.Thread(target=server.serve_forever,daemon=True).start()
base="http://127.0.0.1:4173"
out=Path("docs/workout-guides");out.mkdir(parents=True,exist_ok=True)
checks=[]
with sync_playwright() as p:
    browser=p.chromium.launch()
    for width,height,label in [(390,844,"phone"),(768,1024,"tablet"),(1280,900,"desktop")]:
        context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
        page=context.new_page();errors=[]
        page.on("pageerror",lambda e: errors.append(str(e)))
        page.goto(base+"/kinetics.html?workout=weekly#workout-downloads",wait_until="domcontentloaded")
        modal=page.locator("#kinDownloadModal");modal.wait_for(state="visible")
        assert page.locator("[data-kd-doc]").count()==20
        assert page.locator("[data-kd-document-title]").inner_text()=="The one-page weekly planner"
        frame=page.frame_locator("[data-kd-frame]")
        frame.locator(".wg-weekly").wait_for()
        assert page.locator(".kin-downloads").count()==2
        assert page.locator("#full-body-downloads").count()==1
        page.wait_for_timeout(350)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
        box=modal.bounding_box()
        assert box["width"]<=width+1
        assert box["y"]>=-1 and box["y"]+box["height"]<=height+1, box
        foot=page.locator(".kd-footer").bounding_box()
        assert foot["y"]+foot["height"]<=height+1, foot
        shot=page.screenshot(path=str(out/("browser-"+label+"-weekly.png")))
        geometry=modal.evaluate("(el)=>({box:el.getBoundingClientRect().toJSON(),top:getComputedStyle(el).top,height:getComputedStyle(el).height,inset:getComputedStyle(el).inset,position:getComputedStyle(el).position,transform:getComputedStyle(el).transform,scroll:scrollY,innerHeight:innerHeight,viewport:visualViewport?{offsetTop:visualViewport.offsetTop,height:visualViewport.height}:null})")
        pixel=Image.open(io.BytesIO(shot)).convert("RGB").getpixel((width//2,20))
        print("MODAL_GEOMETRY",label,json.dumps(geometry),"TOP_PIXEL",pixel,flush=True)
        if all(v>210 for v in pixel):
            state=page.evaluate("""() => {let sels=['html','body','#kinDownloadModal','.kd-head','.kd-controls','.kd-workspace','.kd-footer'];return {hit:document.elementFromPoint(innerWidth/2,20)?.outerHTML?.slice(0,250),styles:sels.map(s=>{let e=document.querySelector(s),c=getComputedStyle(e);return {s,rect:e.getBoundingClientRect().toJSON(),bg:c.backgroundColor,overflow:c.overflow,opacity:c.opacity,transform:c.transform,padding:c.padding,display:c.display,align:c.alignItems,justify:c.justifyContent,scroll:e.scrollTop};})};}""")
            print("PAINT_STATE",json.dumps(state),flush=True)
            probes=[("body-overflow","document.documentElement.style.overflow='';document.body.style.overflow='hidden'"),("instant-root-scroll","document.documentElement.style.scrollBehavior='auto';scrollTo({top:scrollY,behavior:'instant'})"),("root-top","scrollTo({top:0,behavior:'instant'})")]
            for name,script in probes:
                page.evaluate(script);page.wait_for_timeout(200)
                b=page.screenshot()
                p0=Image.open(io.BytesIO(b)).convert("RGB").getpixel((width//2,20))
                print("PAINT_PROBE",name,p0,flush=True)
            raise AssertionError(("Modal screenshot has a blank top region",geometry,pixel))
        page.locator('[data-kd-filter="focused"]').click()
        assert page.locator(".kd-doc:not([hidden])").count()==3
        frame.locator('body[data-document="focused"]').wait_for()
        assert page.locator("[data-kd-document-title]").inner_text().endswith("Level 1")
        with page.expect_download() as info:
            page.locator("[data-kd-download]").click()
        with tempfile.TemporaryDirectory() as tmp:
            dest=Path(tmp)/"focused.pdf";info.value.save_as(dest)
            r=PdfReader(dest);assert len(r.pages)==17 and len(r.get_fields())==15
        page.locator('[data-kd-filter="guides"]').click()
        page.locator("[data-kd-search]").fill("hamstring")
        assert page.locator(".kd-doc:not([hidden])").count()==1
        assert page.locator('[data-kd-doc="hamstring-curl"]').get_attribute("aria-pressed")=="true"
        page.locator("[data-kd-search]").fill("")
        page.locator('[data-kd-doc="row"]').click()
        frame.locator('body[data-guide="row"]').wait_for()
        frame.locator(".wg-phase img").first.wait_for()
        page.wait_for_function("document.querySelector('[data-kd-frame]').contentDocument.querySelector('.wg-phase img').naturalWidth>0")
        page.screenshot(path=str(out/("browser-"+label+"-row.png")))
        page.locator("[data-kd-close]").click()
        modal.wait_for(state="hidden");page.wait_for_timeout(450)
        page.evaluate("scrollTo(0,document.documentElement.scrollHeight)")
        page.locator("[data-kd-bar]").wait_for(state="visible")
        page.locator('[data-kd-bar] [data-kd-open="weekly"]').click()
        modal.wait_for(state="visible")
        assert page.locator("[data-kd-document-title]").inner_text()=="The one-page weekly planner"
        page.locator("[data-kd-search]").focus();page.keyboard.press("Escape");modal.wait_for(state="hidden")
        page.wait_for_timeout(450)
        page.goto(base+"/downloads/kinetics/weekly-planner.html",wait_until="domcontentloaded")
        page.locator('[name="weekly-day-1-notes"]').fill("QA / controlled return / comfortable range")
        with page.expect_download() as generated:
            page.locator("[data-download-pdf]").click()
        with tempfile.TemporaryDirectory() as tmp:
            dest=Path(tmp)/"weekly-filled.pdf";generated.value.save_as(dest)
            r=PdfReader(dest);assert len(r.pages)==1
            fields=r.get_fields();assert len(fields)==7
            assert fields["weekly-day-1-notes"]["/V"]=="QA / controlled return / comfortable range"
            widgets=[ref.get_object() for ref in r.pages[0]["/Annots"]]
            assert all(w.get("/AP",{}).get("/N") for w in widgets)
        assert not errors, errors
        checks.append({"viewport":label,"width":width,"height":height,"status":"passed","checks":["full-view open/close","weekly preview","two on-page placements","20 browse documents","focused guide filter","17-page PDF download","search","naturalistic row preview","end-scroll bar","Escape close","filled one-page PDF export","canonical field value","no uncaught JavaScript errors"]})
        context.close()
    browser.close()
server.shutdown()
(out/"browser-validation-v0.3.json").write_text(json.dumps({"status":"passed","engine":"Chromium","viewports":checks},indent=2)+"\n")
print(json.dumps(checks,indent=2))
