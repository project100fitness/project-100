# Ninja CREAMi XL guide / 21 October 2026

Nutrition and protocol Nutrition contain one compact, keyboard/touch-operable rollover launcher. It opens an isolated standalone guide in a viewport-filling native dialog. Each opening loads the standalone document with replacement navigation, avoiding a separate embedded-page history step or a stale document restored by Back. The normal top-level route redirects to Nutrition and opens the same dialog. No legacy release shell, global override stylesheet or user-agent/device detection is imported.

Ownership:
- `assets/css/creami-shell.css` and `assets/js/creami-shell.js`: Nutrition entry, dialog, toolbar, focus restoration and existing P100 native dialog/history API.
- `ninja-creami.html`, `assets/css/ninja-creami.css`, `assets/js/ninja-creami.js`, `assets/js/ninja-creami-data.js`: chapters, filters, eighteen measured recipes, four-card fade sets, timer, batch/gum controls, image lightbox and book reader.
- `assets/creami/`: exact supplied photo/illustration originals and 37 rendered book pages with accessible extracted text.
- `assets/downloads/project-100-ninja-creami-guidebook-v2-0-2026-10-21.pdf`: unchanged supplied original.

Recipe data is an explicit ES module dependency rather than a separately ordered script or shared global. The shell authenticates the iframe's initial message by exact origin and source, then exchanges commands over a dedicated MessageChannel. This avoids WindowProxy identity differences after focus changes without relaxing sender authentication. Message listeners are not used for arbitrary navigation or HTML injection.

The velvet-red, purple and vanilla palette has light/dark variables. Width-based fluid geometry keeps four-item overviews in two columns, with equal fractional rows; opened recipes use a readable single-column flow at narrow widths. No text is clipped to a fixed number of lines. A full-width patterned progress strip shows the five-second rotation. Pointer hover on hover-capable devices, keyboard focus in cards, an opened detail, hidden document, book mode or closed parent pauses rotation; reduced-motion starts paused. Manual arrows, all-flavours view, family filter and search remain available. Final sets overlap preceding cards where necessary to retain four visible items without blank placeholders.

The book reader uses page images rather than relying on an embedded PDF plugin. All 37 pages have page selection, arrows, keyboard navigation, fit/zoom, selectable page text and the original download. The supplied PDF is 2,938,408 bytes, SHA-256 `ac72bebc865f3a682368c15d66e7aaf97b3a42d48e24f630bc5dd1e5a341a741`.

Content rules:
- Ingredient amounts and recipe macro ledgers are transcribed from Final Edition pages 10–11 and 18–21. Grams/millilitres govern; scoop/spoon equivalents are labelled approximate or product-calibrated. The three-pint protein range is the arithmetic 3 × 38–45 g = 114–135 g, rather than rounding the lower end to 115 g.
- The Kirkland ledger is the current display. The older Silk ledger is accessible in original book pages 22–24 and the labelled archival recipe posters. Neither is presented as a fresh label audit. Milk alternatives do not remove whey/casein allergens.
- Historical operator figures are edition context, not an update to the site's current personal data or universal targets.
- The original PDF and historical plates are not silently rewritten. Web operating steps distinguish owner practices from the manufacturer baseline: covered/level 24-hour freezing, uneven-base melt/refreeze remedy, LITE ICE CREAM for lean/substitute-sugar mixtures, MIX-IN before any RE-SPIN when using inclusions, and damp-cloth motor/spindle cleaning. Knife/drilling and forceful frozen-block procedures are not current web instructions.
- The allulose molecular-mass comparison is not a measured freezing curve. The gum concentration calculation does not establish a universal cross-link threshold. Collagen peptides are not equated with gelatin.

Reference: SharkNinja-authored NC500-series owner's guide, available through official support and the manufacturer PDF hosted at `https://images.thdstatic.com/catalog/pdfImages/98/983e8f60-c3aa-4209-95a2-68e93f4a6daa.pdf`. The user's older HTML supplies a structural baseline only; its missing legacy dependencies and superseded amounts are not imported.
