# Kinetics workout downloads / 15 October 2026

The on-page card above movement filters and the end-of-page download bar both open the native full-view publication browser. It follows the existing main-page `dl-modal`, `pop-close` and scroll-reveal patterns, with teal/blue publication accents. The original page content is retained.

## Contents

- Three complete 21-page level booklets, three separate 8-page weekly planners, 12 individual technique PDFs and one 13-page technique collection.
- The approved bench-supported row has a naturalistic anatomical plate: main red, secondary blue, base green. Bands remain orange-edged charcoal at every level.
- Other technique sheets use their own verified written muscle roles and cues. They do not reuse the row plate for another exercise. Their dedicated naturalistic plates remain future illustration work.
- Each sheet covers setup, base/support, movement, range and return, common compensation and an easier option. No fixed label sum is treated as hand force, hardware rating or a prescribed personal load.
- Day 6 remains easy skill practice or rest at every level; the two consecutive full-body days are not both programmed hard.
- The reusable JSON is the source for site displays and PDF generation. The original private v0.1/v0.2 Library files are not overwritten by this website release.

## Verification

The branch workflow builds the PDFs from the browser export module, validates every page with pypdf and Poppler, and verifies the canonical AcroForm fields, widgets and appearance streams. Build details and a rendered contact sheet are saved beside this file.

The local workspace was offline during implementation. Browser/phone interaction verification is therefore a separate limitation until an interactive browser is available; source-level syntax, links, state and PDF structure checks are performed before publishing.

## Rebuild

Convert the 1774 by 887 PNG row plate to RGB JPEG. Run `node scripts/build-workout-guides.cjs PATH_TO_JPEG`, then `python scripts/validate-workout-guides.py` with pypdf, Pillow and pdftoppm installed. The guarded PR workflow does this automatically for same-repository branches beginning `workout-guides-`.

The JSON records source scope and the distinction between personal Kinetics movements and supported editorial adaptations. No uploaded guidebook illustration or full book is redistributed.
