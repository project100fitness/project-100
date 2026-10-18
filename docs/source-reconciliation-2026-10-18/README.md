# Current publication corrections and responsive source consolidation

18 October 2026. Baseline: `1d594db3ad44cdf5b3d8ca5410ab7843993b9fa8`.

## Source changes

The shared mobile stylesheet now has one maintained phone cascade. Narrow-phone exceptions retain their original cascade positions. Desktop, print and reduced-motion rules are separate. This replaces the sequence of later mobile blocks without concealing content or replacing the existing folder design. Intentional mobile geometry overrides remain in this stylesheet; this is not a claim that every `!important` declaration was removed.

Folders, all main navigation routes, floating controls, direct exercise selection, carousels and detail popups remain. Vertical page scrolling is free. Source HTML owns the structure; no new DOM-rewriting patch was added. Shared stylesheet and script URLs were versioned throughout the site so existing visitors receive the corrected assets.

## Book reconciliation

Sources are the supplied **Guidebook V3.4** (34 PDF pages) and **Encyclopedia V3.3** (84 PDF pages). Page numbers below are PDF page positions, not printed chapter numbering. Their supplied bytes remain unchanged. The register on Encyclopedia PDF page 4 and the new companion pages take precedence over retained historical text.

| Register | Current source treatment | Website coverage |
|---|---|---|
| C01 | Dated muscle estimates; no validated dry-tissue corridor, individual ceiling or fixed BIA water conversion | Mission, biometrics, dose and pathways; summary, tables and duplicate detail source corrected |
| C02 | Benchmark date 2 December 2025 | Home corrected; existing current-metrics date verified |
| C03 | At most one V1/V6 on a training day; neither on rest days | Mission, dose and pathways source corrected, including detail panels; existing registry rule retained |
| C04 | 2,780 kcal / 252 g protein / 69 g fat are historical planning references; daily intake unverified | Nutrition and meal dashboard labels, notes and related protocol references |
| C05 | 31 canonical techniques, including six editorial Pilates adaptations | Existing training and analysis arrays checked; no new video sightings inferred |
| C06 | 740 files; 18 sequential screenings, one partial, 24 pending; sets/reps unverified | Existing source analysis verified against the register |
| C07 | Trainer manages resistance; old level data is superseded schema | Current instruction retained; shared gear descriptions corrected without adding selectors |
| C08 | Photo estimates, prepared recipe models, dressing batches and actual consumption stay distinct | All 14 model ranges, egg/bean rules, two dressing batches and nine meal-story bases compared with current analysis; book rounding convention now shared by cards |
| C09 | Full-body full/quick guides each eight pages; same two sequences | Both actual PDFs parsed and checked; existing source links retained |
| C10 | 18 screened-status records and 15 detailed coverage objects are different counts | Both source counts checked, neither rewritten to imply missing screening |
| C11 | Current six bundles, including two Enforcer matched sets and Tricep Specialist | Gear JSON, both gear pages, protocol tables/pathways and shared item-purpose popups corrected; older visual records remain historical |

New companion data checked against Encyclopedia PDF pages 13–14 (nutrition), 18–19 (Kinetics), 58 (measurement) and Guidebook pages 10, 12 and 31. Direct current-edition links accompany the corrected website pages. The existing reference library remains the detailed analysis destination; no duplicate raw-data section was added to the UI.

## Verification

- `scripts/check-publication-consistency.py`: 65 current root pages; 5,013 local links; both exact book hashes; date/day rules; current bundles and popup facts; evidence counts; full-body PDF pagination; cache versions.
- `scripts/check-nutrition-book-models.cjs`: 14 independent book table expectations, both whole prepared dressing batches, egg rules, current analysis agreement and all nine caption-story serving bases. Raw model arithmetic is unchanged; midpoint display rounding matches the books.
- `scripts/check-workout-source.py`: 78 document links and source-owned mobile navigation.
- `scripts/validate-workout-guides.py`: 40 PDFs, 42 guide pages, 76 setups, 173 source windows; no broken guide links.
- Browser: baseline comparison on 56 phone pages, 56 desktop pages and 30 additional representative phone/tablet views at 320/390/430/768/1440 CSS pixels. Final 56-page phone sweep had no horizontal page overflow, hidden main content, mandatory vertical snapping or console errors. Source text changes were inspected separately.
- Direct interaction checks: exercise 12 route/counter; Pilates programme; group carousel; detail popup; complete menu; current book links; current Titan popup; floating controls.

Evidence: [verification.json](verification.json), [mobile view](mobile-exercises.png), [desktop gear](desktop-gear.png), [CSS consolidation counts](css-consolidation.json).

**Physical Android/Instagram and iPhone Safari were not connected and were not tested.** Viewport checks are browser checks, not a substitute for those device tests. The reconciliation is an editorial comparison with the supplied books and their correction register, not an independent medical or biomechanical validation of retained personal observations.

The new publication-consistency workflow runs the source and nutrition checks on pull requests and main pushes to prevent these contradictions returning.
