from pathlib import Path
import urllib.request,time,json,argparse
p=argparse.ArgumentParser();p.add_argument('--wait',action='store_true');p.add_argument('--baseline',action='store_true');args=p.parse_args()
root=Path(__file__).resolve().parent.parent;base='https://project100.fit';paths=['exercises.html','kinetics.html','assets/js/training-state.js','assets/js/p100-band-training.js','downloads/kinetics/training-plan-v0.3.json','downloads/kinetics/weekly-planner.html','downloads/kinetics/guide-pilates-row.html','downloads/kinetics/pdf/complete-guide.pdf','downloads/kinetics/pdf/full-body.pdf']
for attempt in range(40 if args.wait else 1):
 try:
  result=[]
  for path in paths:
   with urllib.request.urlopen(urllib.request.Request(base+'/'+path,headers={'User-Agent':'PROJECT100-publication-check'}),timeout=30) as r:
    head=r.read(128);assert r.status==200
    if path.endswith('.pdf'):assert head.startswith(b'%PDF-')
    result.append({'path':path,'status':r.status})
  break
 except Exception:
  if attempt+1== (40 if args.wait else 1):raise
  time.sleep(15)
out=root/'docs/workout-guides/live-validation-v0.3.json';out.write_text(json.dumps({'result':'passed','routes':result},indent=2));print('Live training routes and PDFs passed.')
