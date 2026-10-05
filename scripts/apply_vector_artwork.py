"""Apply the selected two-style artwork without changing recipes or navigation.
Run last in build_v2.py so earlier legacy artwork overlays cannot restore old art.
"""
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
ART = json.loads((ROOT / 'assets/data/vector-artwork.json').read_text())
CSS = 'assets/css/vector-artwork.css?v=20261005-artwork'

def set_image(img, key, kind):
    item = ART[key][kind]
    img['src'] = item['src']
    img['width'], img['height'] = str(item['width']), str(item['height'])
    img['loading'], img['decoding'] = 'lazy', 'async'
    img['class'] = list(dict.fromkeys(img.get('class', []) + ['selected-vector-art']))
    if img.get('aria-hidden') != 'true':
        img['alt'] = f'{key.upper()} — ' + ('varied portrait and recorded ingredients' if kind == 'portraits' else 'white ingredient-only illustration and recorded formula')

def old_key(src):
    match = re.search(r'(?:vector-|ingredient-cards/|liquid-overview/|vector-artwork/(?:portraits|ingredients)/)(v(?:10|[1-6])|pump)(?:[-.]|$)', src)
    return ('v6' if match[1] == 'pump' else match[1]) if match else None

for path in ROOT.glob('*.html'):
    soup = BeautifulSoup(path.read_text(), 'html.parser')
    protocol = path.name.startswith('fit-protocol') or 'focused-protocol' in soup.body.get('class', []) if soup.body else False
    kind = 'ingredients' if protocol else 'portraits'
    changed = False
    for img in soup.select('img'):
        key = old_key(img.get('src', ''))
        if key in ART:
            set_image(img, key, kind)
            changed = True
        # Compact folder preview for the whole Liquid Intake category.
        if img.get('src') == 'assets/img/liquid-intake-vectors.jpg':
            set_image(img, 'v1', kind)
            changed = True
    for folder in soup.select('details.vector-stack-file[data-vector]'):
        key = folder['data-vector']
        if key not in ART:
            continue
        folder['style'] = re.sub(r'--stack-art:url\([^)]*\)', f'--stack-art:url("/{ART[key]["ingredients"]["src"]}")', folder.get('style', ''))
        for img in folder.select('.stack-preview img, .folder-diagram img'):
            set_image(img, key, 'ingredients')
        changed = True
    if path.name == 'liquid-intake.html':
        for folder in soup.select('details.simple-liquid-file'):
            key = folder['id'].removeprefix('vector-')
            set_image(folder.select_one('summary img'), key, 'portraits')
            content = folder.select_one('.simple-liquid-content')
            for previous in content.select('.white-ingredient-card, .portrait-vector-card'):
                previous.decompose()
            card = soup.new_tag('div', attrs={'class': 'portrait-vector-card'})
            img = soup.new_tag('img')
            set_image(img, key, 'portraits')
            card.append(img)
            content.insert(0, card)
            # Existing compact download link always saves the persona-free version.
            for link in content.select('a[download]'):
                link['href'] = ART[key]['ingredients']['src']
                link['download'] = f'project100-{key}-ingredients.png'
        changed = True
    # Category links retain their existing layout and label, with a portrait preview on MAIN.
    if path.name == 'fit-nutrition.html':
        link = soup.select_one('#nutrition-files a[href="liquid-intake.html"]')
        if link:
            img = link.select_one('img')
            if img:
                set_image(img, 'v4', 'portraits')
                changed = True
    hero_key = 'v4' if path.name == 'liquid-intake.html' else ('v1' if path.name == 'fit-protocol-vectors.html' else None)
    match = re.fullmatch(r'fit-protocol-vector-(v(?:10|[1-6]))\.html', path.name)
    if match:
        hero_key = match[1]
    if hero_key:
        item = ART[hero_key][kind]
        for tag in soup.select('meta[property="og:image"], meta[name="twitter:image"]'):
            tag['content'] = 'https://project100.fit/' + item['src']
        for dimension in ('width', 'height'):
            tag = soup.select_one(f'meta[property="og:image:{dimension}"]')
            if tag:
                tag['content'] = str(item[dimension])
        changed = True
    if changed:
        if not soup.select_one('link[href^="assets/css/vector-artwork.css"]'):
            soup.head.append(soup.new_tag('link', rel='stylesheet', href=CSS))
        path.write_text(str(soup))

preview_path = ROOT / 'assets/data/publication-previews.json'
previews = json.loads(preview_path.read_text())
# Keep social previews consistent with the site that owns each page.
for page, preview in previews.get('pages', {}).items():
    image = preview.get('image', '')
    match = re.search(r'/((?:v10|v[1-6]))\.png$', image)
    key = match[1] if match else old_key(image)
    if page == 'liquid-intake.html':
        key = 'v4'
    if key in ART:
        kind = 'ingredients' if (page.startswith('fit-protocol') or page == 'guidebook.html') else 'portraits'
        preview['image'] = ART[key][kind]['src']
preview_path.write_text(json.dumps(previews, indent=2) + '\n')
print('Applied seven MAIN portraits and seven FIT ingredient-only cards.')
