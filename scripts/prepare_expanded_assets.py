"""Optimize selected uploaded originals without retouching photos or artwork."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, zipfile, subprocess, tempfile

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/'assets/media/october-2026/catalog.json'
catalog=json.loads(CATALOG.read_text())
assets={a['id']:a for a in catalog['assets']}
archive=ROOT.parent/'upload/PROJECT 100 - ASSETS OCTOBER 2026.zip'
out=ROOT/'assets/media/october-2026'
images={43:'vector-v1',167:'vector-v2',44:'vector-v3',161:'vector-v4',38:'vector-v5',41:'vector-v10',75:'vector-pump',
        82:'bogdan-november-2025',87:'bogdan-june-2026',103:'bogdan-july-2026',105:'gym-july-session',107:'gym-july-turf',110:'gym-august-floor',114:'gym-august-weights'}
videos={4:'night-steam',9:'shaker-steam',12:'sunlit-shaker',15:'athlete-shaker',19:'blue-refuel',27:'ruby-reload',33:'green-ignition',37:'recovery-mix',68:'greens-transport',70:'tech-shaker',116:'gear-setup'}
for a in catalog['assets']:
    if a['id'] not in images and any(Path(w['path']).stem in images.values() for w in a.get('web_outputs',[])):
        a['selection']='archived-not-selected';a.pop('web_outputs',None)
with zipfile.ZipFile(archive) as z, tempfile.TemporaryDirectory() as tmp:
    names={Path(n).name:n for n in z.namelist() if not n.endswith('/')}
    for aid,slug in images.items():
        a=assets[aid];source=Path(tmp)/a['name'];source.write_bytes(z.read(names[a['name']]))
        im=ImageOps.exif_transpose(Image.open(source)).convert('RGB');im.thumbnail((1600,1600))
        dest=out/(slug+'.jpg');im.save(dest,quality=85,optimize=True)
        a['selection']='vector-artwork' if aid<82 or aid>=117 else 'original-photo'
        a['web_outputs']=[{'path':str(dest.relative_to(ROOT)),'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}]
    for aid,slug in videos.items():
        a=assets[aid];source=Path(tmp)/a['name'];source.write_bytes(z.read(names[a['name']]))
        dest=out/(slug+'-loop.mp4');poster=out/(slug+'-loop.jpg');encoded=Path(tmp)/(slug+'.mp4');frame=Path(tmp)/(slug+'.jpg')
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(source),'-an','-vf','scale=960:540:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=20','-c:v','libx264','-preset','fast','-crf','28','-maxrate','700k','-bufsize','1400k','-pix_fmt','yuv420p','-movflags','+faststart',str(encoded)],check=True)
        subprocess.run(['ffmpeg','-v','error','-i',str(encoded),'-f','null','-'],check=True)
        subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','2','-i',str(encoded),'-frames:v','1','-q:v','3',str(frame)],check=True)
        # Publish only complete, decoded derivatives to the site working tree.
        dest.write_bytes(encoded.read_bytes());poster.write_bytes(frame.read_bytes())
        a['selection']='animated-background'
        a['web_outputs']=[{'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [dest,poster]]
CATALOG.write_text(json.dumps(catalog,indent=2)+'\n')
print(f'Prepared {len(images)} images and {len(videos)} additional silent clips.')
