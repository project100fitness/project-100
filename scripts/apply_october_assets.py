"""Apply the curated October archive to current pages; safe to run repeatedly."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
MEDIA = 'assets/media/october-2026/'
BACKGROUNDS = {
    'fit-protocol.html': [('#top', 'assets/video/hero-loop.mp4', 'assets/img/hero-loop-poster.jpg')],
    'index.html': [('#top', 'assets/video/hero-loop.mp4', 'assets/img/hero-loop-poster.jpg'),
                   ('.cta-band', 'assets/video/featured-plyo-protocol.mp4', 'assets/img/featured-plyo-protocol.jpg')],
    'fit-workout.html': [('#top', 'assets/video/hero-loop.mp4', 'assets/img/hero-loop-poster.jpg')],
    'fit-nutrition.html': [('#top', MEDIA+'tea-loop.mp4', MEDIA+'tea-loop.jpg'),
                           ('#vectors', MEDIA+'shake-loop.mp4', MEDIA+'shake-loop.jpg')],
    'fit-protocol-fuel.html': [('#top', MEDIA+'hydration-loop.mp4', MEDIA+'hydration-loop.jpg')],
}

for name in dict.fromkeys(['index.html', 'gear-shop.html', *BACKGROUNDS]):
    page = ROOT / name
    soup = BeautifulSoup(page.read_text(), 'html.parser')
    if name in BACKGROUNDS:
        for tag, attrs in [('link', {'rel': 'stylesheet', 'href': 'assets/css/media-backgrounds.css'}),
                           ('script', {'src': 'assets/js/media-backgrounds.js', 'defer': ''})]:
            key = 'href' if tag == 'link' else 'src'
            if not soup.find(tag, attrs={key: attrs[key]}):
                soup.head.append(soup.new_tag(tag, **attrs))
        for selector, video, poster in BACKGROUNDS[name]:
            section = soup.select_one(selector)
            section['style'] = f"--motion-poster:url('/{poster}')"
            if section.select_one('.section-motion'): continue
            if name == 'index.html':
                for old in section.select('.hero-bg, .hero-scrim, .cta-bg'): old.decompose()
            section['class'] = section.get('class', []) + ['has-section-motion']
            backdrop = soup.new_tag('div', **{'class': 'section-motion', 'aria-hidden': 'true'})
            clip = soup.new_tag('video', **{'loop': '', 'muted': '', 'playsinline': '',
                'preload': 'none', 'poster': poster, 'data-background-src': video, 'tabindex': '-1'})
            backdrop.append(clip)
            section.insert(0, backdrop)
            control = soup.new_tag('button', type='button', **{'class': 'motion-control',
                'aria-label': 'Pause background animation', 'aria-pressed': 'false'})
            control.string = 'Pause motion'
            section.append(control)
    if name == 'index.html':
        photos = soup.select('.origin-photos img')
        photos[1]['src'] = MEDIA+'bogdan-august-mirror.jpg'
        photos[1]['alt'] = 'Bogdan’s original August 2026 locker-room mirror photo'
        photos[2]['src'] = MEDIA+'gym-bench-august.jpg'
        photos[2]['alt'] = 'Original August 2026 photo of the bench and barbell setup'
        for image in photos:
            image['loading'] = 'lazy'
        training = soup.select_one('a[href="fit-workout.html"] .ex-media img')
        if training:
            training['src'] = MEDIA+'bogdan-gym-session.jpg'
            training['alt'] = 'Bogdan’s original August 2026 gym session photo'
    if name == 'gear-shop.html':
        # Retain the established gallery and caption; improve the same rig/turf view.
        for image in soup.select('img[src="assets/img/gym-photo-rig-bench.jpg"]'):
            image['src'] = MEDIA+'gym-turf-rig.jpg'
            image['alt'] = 'Original photo of the gym rig, bench and turf training area'
            button = image.find_parent('button')
            if button and button.has_attr('data-full'): button['data-full'] = image['src']
    if name == 'fit-nutrition.html':
        note = soup.select_one('.focus-point--cyan p')
        if note:
            note.clear()
            note.append('Train like 2, eat for 2. The historical 252 g protein and 69 g fat figures are legacy planning values. Whole-diet verification remains deferred; use the current Encyclopedia for their context and limits.')
    page.write_text(str(soup))
