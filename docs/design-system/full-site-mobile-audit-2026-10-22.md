# Full-site mobile audit — 22 October 2026

The nutrition overview presents a four-card salad browser and concise routes to the full Meals journal, 26 unique kitchen photographs, all 14 salads, and the ingredient-role reference. Complete recipe and ingredient text stays on the owning detail pages; existing overview fragments remain reachable.

Footer clearance belongs to the existing download/dock component in site.css and site.js. Its ResizeObserver measures the actual dock height, including wrapped labels, and sets the reserved bottom space. Header actions, navigation tabs, dock actions and collection pause controls use at least 44 px height. No second dock or page-specific repair stylesheet is introduced.

HUD previews reserve their own geometry and use a toned canvas. The small vector preview images are eager, while full artwork and book pages retain their existing loading behavior. Repaired legacy WebP payloads preserve their encoded image pixels; empty/corrupt legacy artwork is restored from its matching hosted vector artwork.

Contrast belongs to each component owner: HUD metadata, inside-protocol numbers, Kinetics labels, session-folder numbers, nutrition dashboard labels and training-guide numbers. Information buttons for accordion entries are placed in the expanded body, outside the interactive summary.

The stale movement-index route leads to the actual exercise library. Home and Workout related-page links lead to contextual destinations. The retired Peptan article is replaced by the current manufacturer brand/source page. Asset dependency versions are refreshed in authored HTML so returning visitors receive the source corrections.

Verification: complete HTML/reference and asset-integrity crawls; syntax and source-architecture checks; all 37 videos confirmed without audio tracks; Chrome, Firefox and WebKit responsive navigation; dedicated 360/412 px interactions; automated WCAG A/AA checks across all 119 site-shell pages in light/dark themes, with focused rechecks of findings. Fixed-layout illustration/export sheets are source artwork, not responsive reading pages. Physical-device and screen-reader certification are outside the automated browser evidence. Private audit evidence and a complete verified website archive accompany the release.
