"""Keep reviewed grip/contact descriptions and accepted artwork synchronized.

This checks source/guide consistency, not biomechanical or clinical certification.
"""
import json
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
folder = root / 'downloads/kinetics'
db = json.loads((folder / 'training-plan-v0.3.json').read_text(encoding='utf8'))
records = [e for e in db['exercises'] + db['recordedVariants']
           if e.get('art') and e.get('trainingPrescriptionEligible') is not False]
assert len(records) == 115
assert len({e['art'] for e in records}) == 108
assert all(e.get('gripCategory') and e.get('gripLabel') and e.get('grip') for e in records)
register = json.loads((root / 'downloads/reference/grip-and-illustration-review-2026-10-19.json').read_text(encoding='utf8'))
assert len(register['illustrations']) == 108
approved = {e.get('replacement', e['art']) for e in register['illustrations']}
assert approved == {e['art'] for e in records}
registered = {id: e for e in register['illustrations'] for id in e['ids']}
for e in records:
    assert registered[e['id']]['gripLabel'] == e['gripLabel'], e['id']
    assert (root / 'assets/media/workout-guides' / e['art']).is_file()
    if e['id'] in ('supported-high-front-curl', 'standing-supported-high-front-curl'):
        assert e['isTrainingAdaptation'] and e['sourceObservedSetup']
        assert 'low front' in e['cardCues']['setup'].lower()
for e in db['exercises']:
    pdf = PdfReader(folder / 'pdf' / ('guide-' + e['id'] + '.pdf'))
    text = '\n'.join(page.extract_text() or '' for page in pdf.pages)
    assert 'GRIP /' in text, e['id']
    assert e['gripLabel'] in ' '.join(text.split()), e['id']
    if e.get('isTrainingAdaptation'):
        assert 'Training adaptation' in text, e['id']
print('PASS: 108 accepted illustrations, 115 grip/contact records and 39 individual PDF labels; source adaptation remains explicit.')
