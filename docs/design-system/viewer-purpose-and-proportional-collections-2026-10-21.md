# Viewer purpose and proportional collections

The personal story leads PROJECT 100. It explains the individual, the interruption and comeback, the physiological starting point and the goal. Navigation summaries are concise; detailed exercise, nutrition and protocol content remains complete. A relative increase from the recorded baseline is distinct from a verified population percentile.

Overview collections retain two columns on small displays. Media height, gaps, padding and preview type scale proportionally; opened detail retains a full reading width. Collections with four or more items use fixed positions, fade between sets and expose previous/next, pause and full-view actions. A final set overlaps preceding items when needed to retain four visible cards. Collections with fewer than four original items retain their actual contents.

Source ownership:

- Page HTML authors section meaning, navigation, footer disclosures and collection controls.
- `site.css` and the carousel controller in `site.js` own shared preview sets.
- `mega-salads.css` and `salad-cards.js` own recipe sets and the original food model. Opening a recipe spans both columns and exposes its quantities, dressing and all macros.
- `p100-band-training.css` and its matching controller own training/navigation and four-card technique previews. The Train, Library and Guides buttons communicate distinct tasks through icons, subtitles and shape details.
- `hud.css` retains two-column preview cards, while expanded content stays readable.
- The native table-card component explicitly gives its caption a block width on narrow displays, preventing the collapsed caption from wrapping one letter per line.
- The selfie journal clock pauses offscreen, when hidden or explicitly paused; mouse presence does not stop it. Scan and image changes use the same clock.
- Footers retain every destination in native disclosures, instead of permanent tall link lists.

No browser-specific repair stylesheet, browser-sniffing branch or runtime prose rewrite is introduced. Responsive geometry is based on available width and height. Automatic sequences stop while the visitor reads an expanded item or opens a viewer; manual controls remain available. Detailed text and asset sources are preserved.
