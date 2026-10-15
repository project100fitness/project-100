"""Read the already-deployed public site and verify all workout download routes."""
import json, urllib.request, concurrent.futures, sys, time
from pathlib import Path
base="https://project100.fit/"
paths=["kinetics.html","assets/css/kinetics.css","assets/css/workout-guides.css","assets/js/kinetics-downloads.js","assets/js/workout-guides.js","assets/media/workout-guides/row-three-roles-v1.png","downloads/kinetics/PROJECT100_Workout_Guides_v0.3_2026-10-15.zip"]
if "--baseline" not in sys.argv:
    db=json.loads(Path("downloads/kinetics/training-plan-v0.3.json").read_text())
    paths += ["assets/media/workout-guides/"+e["art"] for e in db["exercises"] if e["id"]!="row"]
if "--wait" in sys.argv:
    target=base+"assets/media/workout-guides/press-three-roles-v1.png"
    for attempt in range(30):
        try:
            with urllib.request.urlopen(target+"?release=20261015",timeout=20) as response:
                assert response.status==200
            break
        except Exception:
            if attempt==29: raise
            time.sleep(10)
paths += ["downloads/kinetics/"+p.name for p in Path("downloads/kinetics").glob("*.html")]
paths += ["downloads/kinetics/pdf/"+f["name"] for f in json.loads(Path("downloads/kinetics/pdf/build-manifest.json").read_text())["files"]]
def check(path):
    req=urllib.request.Request(base+path,headers={"User-Agent":"PROJECT100-download-validation","Cache-Control":"no-cache"})
    with urllib.request.urlopen(req,timeout=45) as r:
        data=r.read(4096)
        assert r.status==200,(path,r.status)
        if path.endswith(".pdf"):assert data.startswith(b"%PDF-"),path
        elif path.endswith(".zip"):assert data.startswith(b"PK"),path
        elif path.endswith(".png"):assert data.startswith(b"\x89PNG"),path
        elif path.endswith(".html"):assert b"<html" in data.lower(),path
        return {"path":path,"status":r.status,"type":r.headers.get("Content-Type")}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(check,paths))
out={"status":"passed","base":base,"checkedPaths":len(results),"results":results}
Path("docs/workout-guides/live-validation-v0.3.json").write_text(json.dumps(out,indent=2)+"\n")
print(json.dumps({"status":out["status"],"checkedPaths":len(results)},indent=2))
