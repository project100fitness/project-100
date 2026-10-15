"""Verify the consolidated library, gauges, entered PDF records and responsive layouts."""
import json,threading,tempfile
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
from pypdf import PdfReader
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(("127.0.0.1",4173),Quiet);threading.Thread(target=server.serve_forever,daemon=True).start()
base="http://127.0.0.1:4173";out=Path("docs/workout-guides");out.mkdir(parents=True,exist_ok=True);results=[]
def ready(page,kind):
    page.wait_for_function("(kind)=>{let f=document.querySelector('[data-kd-frame]'),w=f&&f.contentWindow,d=f&&f.contentDocument;return d&&d.body&&d.body.dataset.document===kind&&d.readyState==='complete'&&typeof w.Project100ExportPDF==='function';}",arg=kind)
def downloaded(page,selector):
    with page.expect_download(timeout=90000) as info:page.locator(selector).click()
    with tempfile.TemporaryDirectory() as tmp:
        dest=Path(tmp)/"guide.pdf";info.value.save_as(dest);r=PdfReader(dest);fields=r.get_fields() or {};print("PDF_EXPORT",info.value.suggested_filename,{"weeklyNote":str(fields.get("weekly-day-1-notes",{}).get("/V",""))},flush=True);return len(r.pages),fields,[p.extract_text() for p in r.pages]
with sync_playwright() as p:
    for engine in [p.chromium,p.firefox,p.webkit]:
        browser=engine.launch()
        for width,height,label in [(390,844,"phone"),(768,1024,"tablet"),(1280,900,"desktop")]:
            context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
            page=context.new_page();errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
            page.route("**/*",lambda r:r.abort() if r.request.resource_type=="media" else r.continue_())
            page.goto(base+"/kinetics.html?workout=protocol",wait_until="domcontentloaded")
            modal=page.locator("#kinDownloadModal");modal.wait_for(state="visible");frame=page.frame_locator("[data-kd-frame]")
            frame.locator('body[data-document="protocol"]').wait_for();ready(page,"protocol")
            assert page.locator("[data-kd-doc]").count()==18
            assert page.locator('[data-kd-doc="focused"]').count()==1
            assert page.locator('[data-kd-doc^="focused-"]').count()==0
            assert frame.locator("#band-levels").count()==1
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
            if engine.name=="chromium":page.screenshot(path=str(out/f"unified-{label}-protocol.png"))
            page.locator('[data-kd-filter="guides"]').click()
            assert page.locator(".kd-doc:not([hidden])").count()==13
            page.locator("[data-kd-search]").fill("hamstring")
            assert page.locator(".kd-doc:not([hidden])").count()==1
            page.locator("[data-kd-search]").fill("")
            page.locator('[data-kd-doc="row"]').click()
            frame.locator('body[data-guide="row"]').wait_for();ready(page,"guide")
            assert frame.locator(".wg-steps>section").count()==4
            assert frame.locator("[data-resistance]").count()==1
            assert frame.locator(".wg-gauge-row").count()==3
            assert frame.locator(".wg-gauge-row output").all_text_contents()==["Not recorded"]*3
            frame.locator('[data-r-level="2"] summary strong').click()
            assert frame.locator('[data-r-level="2"]').evaluate("(el)=>el.open"), "Resistance editor did not open"
            frame.locator('[data-r-level="2"] [data-r-rating]').select_option("65")
            frame.locator('[data-r-level="2"] [data-r-count]').select_option("2")
            assert frame.locator('[data-r-level="2"] output').inner_text()=="130 lb nominal / line"
            assert frame.locator('[data-r-level="2"] meter').get_attribute("value")=="130"
            assert frame.locator('body').evaluate("(el)=>el.scrollWidth<=innerWidth+1")
            assert frame.locator(".wg-gauge-row select").first.evaluate("(el)=>getComputedStyle(el).minHeight")=="44px"
            pages,fields,text=downloaded(page,"[data-kd-download]")
            assert pages==1 and len(fields)==3,(engine.name,pages,len(fields))
            assert fields["resistance-row-r2"]["/V"]=="65 x 2 = 130 lb nominal"
            if engine.name=="chromium":page.screenshot(path=str(out/f"unified-{label}-row.png"))
            page.locator('[data-kd-filter="all"]').click();page.locator('[data-kd-doc="book"]').click()
            frame.locator('body[data-document="book"]').wait_for();ready(page,"book")
            assert frame.locator(".wg-guide").count()==12
            assert frame.locator('[data-resistance="row"] [data-r-level="2"] output').inner_text()=="130 lb nominal / line"
            assert frame.locator('[data-resistance="brace"]').get_attribute("data-mode")=="unloaded"
            assert frame.locator('[data-resistance="brace"] .wg-gauge-row').count()==0
            if engine.name=="chromium" and label=="desktop":
                pages,fields,text=downloaded(page,"[data-kd-download]")
                assert pages==22 and len(fields)==47,(pages,len(fields))
                assert fields["resistance-row-r2"]["/V"]=="65 x 2 = 130 lb nominal"
                for e in json.loads(Path("downloads/kinetics/training-plan-v0.3.json").read_text())["exercises"]:
                    assert frame.locator("#"+e["id"]+".wg-guide").count()==1
            page.locator('[data-kd-doc="weekly"]').click();frame.locator('body[data-document="weekly"]').wait_for();ready(page,"weekly")
            assert frame.locator(".wg-day-card").count()==7
            assert frame.locator("[data-week-level]").count()==0
            frame.locator('[name="weekly-day-1-notes"]').click()
            frame.locator('[name="weekly-day-1-notes"]').press_sequentially("QA / controlled return")
            print("NOTE_STATE",engine.name,label,frame.locator('[name="weekly-day-1-notes"]').input_value(),page.evaluate("document.querySelector(\'[data-kd-frame]\').contentWindow.Project100ReadValues()[\'weekly-day-1-notes\']"),flush=True)
            pages,fields,text=downloaded(page,"[data-kd-download]")
            assert pages==1 and len(fields)==7
            assert fields["weekly-day-1-notes"]["/V"]=="QA / controlled return", (engine.name,label,str(fields["weekly-day-1-notes"]["/V"]))
            page.locator('[data-kd-doc="focused"]').click();frame.locator('body[data-document="focused"]').wait_for();ready(page,"focused")
            assert frame.locator('section[id^="day-"]').count()==3
            assert frame.locator(".wg-guide").count()==0
            page.locator('[data-kd-doc="fullbody"]').click();frame.locator('body[data-document="fullbody"]').wait_for();ready(page,"fullbody")
            assert frame.locator('section[id^="day-"]').count()==2
            page.locator("[data-kd-close]").click();modal.wait_for(state="hidden")
            page.goto(base+"/downloads/kinetics/focused-days-level-3.html",wait_until="domcontentloaded")
            page.wait_for_url("**/focused-days.html")
            assert not errors,errors
            results.append({"engine":engine.name,"viewport":label,"status":"passed","checks":["18 unique library documents","one protocol","one session edition","12 unique exercises in book","R2 65x2 nominal total","blank unassigned records","unloaded no-band version","filled exercise PDF","shared records across documents","weekly entered PDF","legacy-link compatibility","no horizontal overflow"]})
            context.close()
        browser.close()
server.shutdown()
(out/"browser-validation-v0.3.json").write_text(json.dumps({"status":"passed","edition":"unified-protocol","cases":results},indent=2)+"\n")
print(json.dumps({"status":"passed","cases":len(results),"engines":["Chromium","Firefox","WebKit"]}))
