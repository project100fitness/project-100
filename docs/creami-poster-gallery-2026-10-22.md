# CREAMi recipe poster gallery

The original flavour browser now uses a native horizontal scroll-snap rail: two cards on mobile, three at medium widths, four on desktop, plus an adjacent-card hint. Previous/Next move one visible group. View all 18 changes the same collection into a static grid. Search, protein filtering, milk pathways and all current recipe detail records are retained.

The collection owns a single six-second clock. The existing rotation-cues component presents the true countdown, previous/next thumbnails and explicit pause/resume state. Automatic changes wait offscreen, in book mode, when the parent is closed, while the document is hidden, during hover/focus/touch exploration, with recipe details or image dialog open, and during a six-second grace period after manual navigation. Reduced-motion preference starts paused and removes smooth navigation. Arrow keys, Home and End navigate the native card buttons.

All eighteen supplied Gemini posters are matched by recipe number, not filename order. Small 384-pixel WebP previews are separate from 1536-pixel full posters. Full posters are requested only by the explicit poster action inside a current recipe. The existing image-dialog owner handles loading, fit/zoom, scrolling, native Escape and focus restoration. No second gallery clock, shared CSS override layer or document-wide behavior patch is introduced.

## Edition reconciliation

These generated posters identify themselves as V2.13. They are dated visual references, not replacements for V2.14 recipe data. Each card identifies both editions and opens the existing readable V2.14 recipe, with its selected milk ledger and original page link. The enlarged poster shows an edition notice before its image: current web operating steps supersede the printed lid-off, masher/borehole and RE-SPIN-before-MIX-IN practices; Silk figures are historical estimates. Generated illustrations, printed nutritional figures, translations and appliance labels are not a newly verified label audit or appliance specification. No ingredient quantity or nutrition figure has been imported from the new artwork. Current numeric recipe data and the original 61-page V2.14 PDF remain byte-for-byte unchanged.

## Owned sources

- ninja-creami.html: gallery explanation and existing image-dialog markup.
- assets/css/ninja-creami.css: responsive rail/grid and zoom-stage styles.
- assets/js/ninja-creami.js: filtering, native scrolling, one clock, recipe links and viewer interaction.
- assets/js/ninja-creami-posters.js: explicit eighteen-recipe artwork mapping.
- assets/creami/posters/: separate preview and full-size web artwork.

Original supplied JFIF files remain unchanged outside the website. Existing clean food illustrations, technical chapters, Nutrition entry points, cookbook reader and PDF downloads remain available.
