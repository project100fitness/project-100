# Native source ownership and responsive consolidation
21 October 2026

## Retired implementation layers
Removed from the published source and every page import:
- assets/css/mobile-site.css
- assets/css/mobile-rail.css
- assets/js/mobile-flow.js
- assets/js/mobile-rail.js

Their necessary behavior is maintained in proper owners, not copied into another override sheet. Responsive rules belong to site.css (shared layout/navigation/media/footer), hud.css (content components), kinetics.css (programme components), p100-band-training.css (session/library/document components), mega-salads.css (nutrition metric spacing) and analysis-reference.css (reference layout). Conditional groups retain their intended viewport/touch behavior. Eighty-six dead legacy selector branches and 186 shadowed declarations were removed with a CSS parser; value fallbacks were preserved. No new stylesheet was introduced.

## Authored markup and behavior
Thirty-five pages now author their section-nav button and complete native dialog/link markup in HTML. No runtime cloning, drawer construction or layout repair script is needed. With JavaScript unavailable, the original sidebar remains the fallback; with JavaScript, the binding only handles open/close/focus and viewport transitions. Exercise pages also have explicit no-script links to the full illustrated guides.

The native HTMLDialogElement prototype is no longer overwritten. Eight modal call sites use P100.openDialog, whose owner records the history entry and invokes the normal browser API. Browser Back, Escape, close, in-dialog routes and focus behavior remain. One header component measures its actual height and publishes geometry variables; duplicate mobile observers and deep-link handlers are removed. Native details/deep-link behavior remains in the existing hash-navigation owner.

## What remains intentionally dynamic
Exercise cards and selections render from the shared programme data, retaining synchronization with library/guides. Print/PDF export, filters, media playback, carousel progress, dialog content and saved state use their own JavaScript components. These are functional application behavior, not emergency layout patches. Styles exported into a self-contained offline guide remain necessary to make that downloaded document portable; they do not inject a repair sheet into the live site.

Existing hidden/print/responsive declaration priorities remain in their component definitions; CSS priority flags are not themselves proof of a patch. No additional late repair layer or browser API monkey patch is used. Historic navigation markup with unique destinations is retained rather than silently discarding its links; its obsolete hamburger controller is removed.

## Verification contract
scripts/check-source-architecture.py prevents the retired files/imports and native dialog prototype replacement from returning. Source/ID/import/link inventories cover all 602 HTML files, including 118 viewer/reference entry pages. Before/after computed styles cover three viewport/theme/touch profiles. The 404 page intentionally now receives the shared responsive typography; moving highlight colors are time-dependent rather than static layout regressions. Component-specific lead, metric and reference layout states preserve their intended mobile values.

Browser testing covers Chromium/Chrome, Firefox and WebKit engines, native dialogs/Back/Escape, full nutrition and exercise content, layouts, theme, print/selection and Android touch/playback. WebKit engine tests on Windows are not a physical Safari/iOS device certification. Current publication PDFs, quantities, artwork and programme data remain protected.
