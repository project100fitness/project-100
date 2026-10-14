# Project 100 / Fit Protocol mobile HTML review — 14 October 2026

## Scope and preservation

Reviewed all 67 root HTML pages individually: 20 Project 100 pages, 35 Fit Protocol pages, and 12 redirect/error pages. Reviewed all 10 component stylesheets, the relevant script initializers, navigation targets, tables, scrolling image rows and expandable details. No page, item, ingredient, image, video or text was removed. Desktop structure, top menus, site switching, source queues and the 3.5-second image intervals remain.

The initial proposed catch-all stylesheet was discarded before publication. Changes are integrated into six existing stylesheets and the particular HTML regions that need corrections. Healthy page structures are retained; stylesheet URL updates let returning visitors load the changes.

## Concrete findings and fixes

- On V1, a span crossed two paragraph boundaries. Corrected its closing position without changing either paragraph.
- Browser checks identified three titles that overflowed narrow phones: Troubleshooting, Monitoring and Gym walkthroughs. Added natural word-break opportunities without changing their text and constrained hero text to its grid column.
- Labelled and enabled keyboard focus on existing scrolling regions using their own caption or heading. This also makes horizontal table/photo scrolling discoverable without changing rows, cells or images.
- Increased phone menu, carousel, detail-navigation and Kinetics playback/source and ingredient-information controls to 44px targets. Reserved room beside Kinetics thumbnails so arrows do not cover them.
- Reworked the existing narrow-screen detail-header rules so long titles and their navigation controls can wrap separately. Reduced nested folder/detail padding to 12px while preserving text size and content.
- Allowed long folder titles and protocol prose to wrap within their panels.
- Made the existing floating site switch less tall while keeping its text and glyph. Slightly enlarged mobile metric labels and source-thumbnail captions.
- Removed only the forced 480px mobile minimum on the Kinetics hero and 350px mobile banner minimum. Both still size naturally to their complete content.
- Allowed food-viewer controls to wrap and added a visible focus outline to food photo rows.
- Kept V5's empty section anchor in the same grid row as its detail content, preventing an empty additional grid row.

## Verification

- All 67 edited pages parse with zero HTML parser errors.
- Exact DOM text matches each page before the changes. Image/video sources, srcsets and link destinations also match; only changed CSS cache query strings are normalized for comparison.
- No duplicate IDs, broken local section targets or missing image alt attributes were found.
- All 5,000 local asset/link references checked resolve to files in the repository.
- All 10 stylesheets parse, including nested media/container/supports rules and declaration lists.
- Whitespace checks pass with the repository's mixed line-ending conventions preserved.

Browser validation on the final source: all 55 content pages were tested at 320, 360, 412, 800 and 1363 CSS pixels (275 page/viewport combinations). No JavaScript errors or document overflow were found; the audited heading/panel geometry also stayed in bounds. An additional 134 combinations of open detail panels and expanded sections were tested at 360px.

Interaction checks passed for all 32 Kinetics thumbnail entries, last/first arrow wrapping, the six retained bundles, 44px gallery controls, the phone menu, the Fit Protocol section drawer, and recipe dialog opening/closing. All three long-title corrections were checked at 320px.

These checks use an isolated Chromium browser with phone/tablet emulation. They are not a physical Android-device certification. External video and social services were excluded from local rendering tests; their URLs and sources remain unchanged. Live deployment verification follows publication.

## Per-page review

| Page | Family | HTML action |
| --- | --- | --- |
| `404.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `archive.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `biometrics.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `daily-pill-cards.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `encyclopedia-archive.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `encyclopedia-guidebook.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `encyclopedia.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `fit-food.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `fit-gear.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `fit-meals.html` | main | 1 scrolling region(s) labelled and keyboard-focusable |
| `fit-nutrition-notes.html` | main | 1 scrolling region(s) labelled and keyboard-focusable |
| `fit-nutrition.html` | main | 1 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-archive.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-baseline.html` | protocol | 1 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-biometrics.html` | protocol | 6 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-checklists.html` | protocol | 1 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-constraints.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-dose.html` | protocol | 6 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-fuel.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-gear.html` | protocol | 10 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-history.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-interactions.html` | protocol | 1 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-joints.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-labs.html` | protocol | 1 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-margins.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-meals.html` | protocol | 6 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-mission.html` | protocol | 7 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-monitoring.html` | protocol | Natural break point in the measurements title; all original text retained |
| `fit-protocol-nutrition.html` | protocol | 2 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-pathways.html` | protocol | 3 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-progression.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-supplements.html` | protocol | 1 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-training.html` | protocol | 2 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-troubleshooting.html` | protocol | 2 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-vector-pump.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-vector-reference.html` | protocol | 1 scrolling region(s) labelled and keyboard-focusable |
| `fit-protocol-vector-v1.html` | protocol | Corrected span crossing two paragraphs; text preserved |
| `fit-protocol-vector-v10.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-vector-v2.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-vector-v3.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-vector-v4.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-vector-v5.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-vector-v6.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol-vectors.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `fit-protocol.html` | protocol | 2 scrolling region(s) labelled and keyboard-focusable |
| `fit-shop.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `fit-workout.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `gear-anchors.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `gear-grips.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `gear-gym.html` | main | Natural break point in the walkthroughs title; all original text retained |
| `gear-photos.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `gear-recovery.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `gear-resistance.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `gear-rig.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `gear-safety.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `gear-shop.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `guidebook.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `hud-preview-daily.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `hud-preview-liquid.html` | Redirect / error | Original structure retained; applicable CSS cache references refreshed |
| `index.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `kinetics.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `library.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `liquid-intake.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `mega-salads.html` | main | 1 scrolling region(s) labelled and keyboard-focusable |
| `mineral-chemistry.html` | protocol | Original structure retained; applicable CSS cache references refreshed |
| `project-goals.html` | main | Original structure retained; applicable CSS cache references refreshed |
| `project-story.html` | main | 1 scrolling region(s) labelled and keyboard-focusable |

Scrolling-region HTML fixes: 57 regions across 21 pages. V1 additionally has the paragraph-span correction.
