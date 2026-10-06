"""Last build overlay: concise preview copy and consistent mobile carousel layout."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
CSS='assets/css/mobile-focus.css?v=20261005-focus'
removed=0;pages=0
for path in ROOT.glob('*.html'):
 text=path.read_text()
 if 'filing-layout' not in text:continue
 original=text
 # Remove only repeated presentation instructions; keep recipe, protocol and source content.
 text,n=re.subn(r'<p class="recipe-record">(?:Meal from the lived record|Symptom-guided loading · Encyclopedia Ch\. 3 &amp; 6)</p>','',text);removed+=n
 text,n=re.subn(r'<p class="folder-rail-title">Related pages</p>','',text);removed+=n
 text,n=re.subn(r'<span class="stack-open">[^<]*</span>','',text);removed+=n
 for sentence in [
 'Choose a folder for the information you need. Daily execution, vectors, training and monitoring each have their own focused files.',
 'Open a folder here to read its ingredients and protocol. Close it in place, or follow the full details link at the end.',
 'A simple guide to the recorded drinks. Open each file here; full protocol notes stay at the end.',
 'Choose your day type, follow the clock, then open the individual vector or checklist you need.'
 ]:text=text.replace('<p>'+sentence+'</p>','')
 text=re.sub(r'<div class="eyebrow fx-reveal">(?:Straight From @[^<]+|The Last 60 Days, Unfiltered)</div>','',text)
 text=re.sub(r'<p class="eyebrow fx-reveal">(?:Straight From @[^<]+|The Last 60 Days, Unfiltered)</p>','',text)
 text=re.sub(r'<p class="fx-reveal">Every real recipe, sorted by category.*?</p>','',text,flags=re.S)
 text=text.replace('<p class="fx-reveal">Training sessions by exercise type.</p>','')
 if path.name=='gear-gym.html':
  text=re.sub(r'<h2 class="fx-reveal">Gym Walkthrough</h2>','',text)
 # Explicit platform links remain, with shorter preview labels.
 text=text.replace('▶ Watch on YouTube','YouTube ↗').replace('▶ Watch on Instagram','Instagram ↗')
 text=text.replace('Real walk-throughs of Gym Fit Forme Laval, station by station — tap any card to play it right here.','Gym Fit Forme Laval')
 text=text.replace('Every training block, sorted by exercise type, with the real dates and engagement. Tap a cover to play it right here, or open it on YouTube Shorts. Food reels live on Fit Nutrition · gym photo drops live on Fit Gear .','Training sessions by exercise type.')
 text=re.sub(r'(<p class="fx-reveal">)Every training block, sorted by exercise type,.*?(</p>)',r'\1Training sessions by exercise type.\2',text,flags=re.S)
 # One shared continuous motion controller replaces both old interval engines.
 if path.name=='fit-workout.html':
  text=re.sub(r'// gentle auto-scroll for the training-log carousel.*?(?=// scrollspy:)', '// Continuous gallery motion is owned by ProjectCarousel.\n\n',text,flags=re.S)
 text=re.sub(r'assets/js/carousel\.js\?[^"\s]+','assets/js/carousel.js?v=20261005-focus',text)
 text=re.sub(r'assets/js/fixonic\.js\?[^"\s]+','assets/js/fixonic.js?v=20261005-focus',text)
 if CSS not in text:text=text.replace('</head>','<link rel="stylesheet" href="'+CSS+'"/>\n</head>',1)
 if text!=original:path.write_text(text);pages+=1
print(f'Mobile focus overlay: {pages} pages; {removed} repeated text elements removed.')
