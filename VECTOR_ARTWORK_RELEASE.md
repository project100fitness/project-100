# Two-style vector artwork release

The seven selected S01 varied portraits are used in PROJECT 100's Liquid Intake folders, with the nutrition category preview in the same style. FIT PROTOCOL uses the seven S02 white ingredient-only cards in the vector directory, each dedicated vector page, and related category previews. The Guidebook belongs to FIT PROTOCOL and uses white ingredient artwork.

Assets cover V1, V2, V3, V4, V5, V6 and V10. `assets/data/vector-artwork.json` records the selected paths, native 941 × 1672 dimensions and SHA-256 hashes. Full originals are retained, without cropping or stretching their ingredient panels. The final build overlay is `scripts/apply_vector_artwork.py`; rerunning it is idempotent.

Existing page text, recipe quantities, page order, navigation and expand-in-place behavior are preserved. The MAIN folders show compact portrait previews and reveal the full image when opened. Existing compact MAIN download links save the ingredient-only counterpart. Precise existing SVG/PNG descriptive diagrams remain available in FIT PROTOCOL. No extra navigation or video controls are added.

Validation: site audit; vector registry and focused source-content checks; unchanged visible text on modified pages; nutrition overview browser regression; all seven image mappings, native image loads, proportional rendering, in-place folders and no horizontal overflow at 320, 390, 768 and 1280 pixels in `scripts/check_vector_artwork.cjs`.
