"""Compare the deployed navigation and shared styles against the released source."""
from pathlib import Path
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
import urllib.request,json,time,hashlib
base="https://project100.fit/"
class Navigation(HTMLParser):
    def __init__(self):super().__init__();self.inside=False;self.links=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=="nav" and "tabs" in a.get("class","").split():self.inside=True
        if self.inside and tag=="a":self.links.append({k:a.get(k) for k in ["href","aria-current","data-folder"]})
    def handle_endtag(self,tag):
        if tag=="nav":self.inside=False
def read(path):
    request=urllib.request.Request(base+path+"?nav=20261015-original-brand&t="+str(time.time_ns()),headers={"User-Agent":"PROJECT100-navigation-validation","Cache-Control":"no-cache"})
    with urllib.request.urlopen(request,timeout=45) as response:
        assert response.status==200
        return response.read().decode("utf-8").replace("\r\n","\n")
for attempt in range(40):
    try:
        source=read("index.html")
        assert 'site.css?v=20261015-original-brand' in source and 'data-folder="project"' in source
        assert 'kinetics.css?v=20261015-unified-protocol' in read('kinetics.html')
        assert 'data-training-panel="library"' in read('exercises.html')
        break
    except Exception:
        if attempt==39:raise
        time.sleep(10)
paths=[]
for path in Path(".").glob("*.html"):
    p=Navigation();p.feed(path.read_text())
    if p.links:paths.append(path.name)
assert len(paths)==56
def page(path):
    local=Navigation();local.feed(Path(path).read_text())
    live=Navigation();live.feed(read(path))
    assert live.links==local.links,("Navigation differs",path)
    return {"path":path,"status":"passed","tabs":len(live.links)}
with ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(page,sorted(paths)))
assets=["assets/css/site.css","assets/css/hud.css","assets/css/mobile-rail.css","assets/css/kinetics.css","assets/js/site.js"]
for asset in assets:
    live=read(asset)
    assert live==Path(asset).read_text(),("Stale shared asset",asset)
    results.append({"path":asset,"status":"passed","sha256":hashlib.sha256(live.encode()).hexdigest()})
out={"status":"passed","base":base,"checkedPaths":len(results),"pages":len(paths),"sharedAssets":5,"results":results}
dest=Path("docs/folder-navigation");dest.mkdir(parents=True,exist_ok=True)
(dest/"live-validation.json").write_text(json.dumps(out,indent=2)+"\n")
print(json.dumps({k:v for k,v in out.items() if k!="results"},indent=2))
