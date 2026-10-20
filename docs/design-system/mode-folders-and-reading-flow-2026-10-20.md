# Mode folders and approved reading-flow changes — 20 October 2026

## User-approved scope
PROJECT 100 and FIT PROTOCOL are now two large top folder tabs. Each is its mode's home link. The duplicate wordmark and duplicate home item in the lower section folders are removed. The selected mode says “Current mode · Home”; the other says “Switch mode”. The selected folder has an orange base, a solid indicator and a short arrival sheen. Keyboard focus remains visible. Reduced-motion readers receive a stationary selection indicator.

The existing floating contact and cross-site controls are intentionally unchanged, as explicitly requested. Their known mid-page overlap risk is not claimed to be fixed by adding these tabs.

## Component ownership
Authored HTML owns the two semantic navigation links on all 105 pages that use the shared header. Print-only and special standalone pages do not receive navigation they did not previously have. `assets/css/site.css` owns mode-folder styling, desktop layout, stationary footer, destination links and optional reference disclosures. `assets/css/mobile-site.css` owns the phone header grid, tested three-column secondary navigation and content-driven programme/day choices. No patch stylesheet or runtime-injected brand switch was added.

The mode navigation is ordinary linked-page navigation, not an ARIA tab widget that changes a hidden panel. `aria-current="true"` describes the current site mode; lower section links retain their specific current-page indicators. Theme and Menu remain separate controls.

## Recommendation dispositions
| ID | Result |
|---|---|
| R01 | Removed factual count-up rewrites. Authored age, measurements and targets stay visible and unchanged. Decorative meter fills remain. |
| R02 | Floating controls preserved by explicit user exception. No claim of eliminating their known content overlap. |
| R03 | Added an authored grouped All sections page, visible from both home contexts and every shared footer. Child/reference destinations remain reachable from their parent pages. |
| R04 | Retained valid parent/child current-page indicators. |
| R05 | Footer links wrap into stationary readable rows. Removed navigation marquee clones and drift. |
| R06 | Secondary navigation uses three columns from 360px, two at 320px, preserving 44px targets and full labels. |
| R07 | No forced-display patch: the alleged missing stat strips were not reproduced. Existing strips retained and layout regressions checked. |
| R08 | Workout now has distinct Journal, Programmes and Exercises & guides destination links. |
| R09 | Retained intrinsic image dimensions, labelled previews, source images and uncropped instructional plates. No blanket image-loading replacement. |
| R10 | Main-site global pagers now say Related pages; the guided reading route remains the explicit next step. Detailed reference chapter pagers retained. |
| R11 | Nutrition uses compact photo/title/basis previews and visible category filters. Full recipes/nutrition stay available on Meals, native ingredient disclosures and the existing detail viewer. All 14 salads and nine meal-story records retained. |
| R12 | Both programmes and all five direct day links stay visible. Long equipment/media reference material folds in two explicitly labelled native disclosures, preserving its original anchors and content in the same page. The compact kit summary stays outside the reference fold. |
| R13 | Training role hints appear in the deliberate destination navigation and existing page-purpose contexts. Brand section names retained. |
| R14 | Measured layout, text enlargement, workflow and Android touch gates run. No claim of testing physical iPhones or Safari. |
| R15 | The new paired brand/home tabs replace the duplicate wordmark and home folders. Existing visible section folders remain below; actual measured height is recorded, not a promised percentage saving. |
| R16 | Rejected tiny target prescriptions; ordinary section navigation and secondary targets remain readable and touchable. |
| R17 | Retained visible Protocol grid and complete planned-exercise lists. No blanket swipe-only navigation. |
| R18 | Optional home protocol panels start closed; all descriptive summaries and illustrations remain available. |
| R19 | Added visible Workout category filters, All option, pressed state, live counts and URL state/reload persistence. Without JavaScript all source blocks remain visible. |
| R20 | Only overview recipe previews are compact. Full recipe reading and salad controls keep their detailed layouts. |
| R21 | Phone programme/day choices use an 84px minimum rather than 108px, with content allowed to grow. Titles, counts, kickers and checks retained. |
| R22 | Added State A/B/C and V-code explanation immediately before home protocol panels, linking the terminology reference. |
| R23 | Removed repeated follow promotions from Story and Goals; homepage follow region, shared contact/footer links and floating contact panel retained. |
| R24 | Implemented the requested fancy two-mode folder switch as authored header/home navigation, alongside the unchanged floating switch. |
| R25 | Changed existing component owners and removed obsolete marquee/count-up behavior; no extra CSS override file. Broad historical cascade refactoring deliberately avoided to protect validated unrelated components. |
| R26 | Shared motion preference now reads the browser setting; mode sheen, decorative meter activation, record-view transitions, carousel scroll behavior and meal-photo drift respect it. Existing normal background media retained. This is not a claim that every historical decorative animation has been audited to WCAG conformance. |
| R27 | Replaced unsupported rolling “last 60 days” copy with “recorded training collection”; no clip dates invented. |
| R28 | Preserved 15/15/15 focused days, 12/12 Pilates, 69 weekly slots, Chest 12 focused + 2 assists, book versions and illustration provenance. |

## Validation and practical limits
118-page inventory, checked at phone dark, phone light and desktop widths: 354 layout reviews, no detected horizontal overflow, clipped headings, broken loaded local images or JavaScript page errors. 25 training/day layout and selection/print/PDF scenarios passed. Four nutrition reading/calculation scenarios passed. 20 mode-folder layouts passed across 320–1440px in both themes. Targeted workflow checks cover stable figures, stationary footer, workout filtering/reload, recipe filtering/detail, optional equipment reference, page index and 200% root text size. Actual LDPlayer/Android Chrome touch checks cover both mode/home links and Workout filtering.

Source checks validate the focused split, workout sources, nutrition/book model agreement and current-publication consistency. A full local link/anchor inventory checks the 118-page collection. Floating HTML on 105 shared-header pages, the floating-control script owner and 1,936 protected book/exercise/media assets are checked against the verified PR130 backup (text line-ending normalization only where relevant).

These UI checks do not constitute a new medical, biomechanical or clinical certification of every illustration. Existing reviewed artwork and supplied books are preserved byte-for-byte for binary assets; no new generated anatomy is introduced.

## Restore point
The verified pre-change full-site archive remains `PROJECT100_FULL_SITE_REVISED_PR130_2026-10-20.zip`, SHA256 `dd57b1bc6a76716b933cc2f9d7b0f48d3ba0264809c4a0e0119414c767de6a3b`. It has not been overwritten. The deployment change set is tracked separately in the release manifest and GitHub pull request.
