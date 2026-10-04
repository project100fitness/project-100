# V2.0 release validation — 3 October 2026

- Source import: all source words preserved on all 26 Encyclopedia and 13 Guidebook PDF pages, checked by the builder before page generation. Source tables reconstructed from PDF geometry; physical PDF page links used.
- Static audit: PASS for 19 root HTML files, local/dynamic assets, section links, wrappers, primary headings, Encyclopedia access bars and both independent page loops.
- Chromium responsive matrix: 48 page/viewport combinations across 12 full pages at widths 320, 390, 768 and 1280 px (844 px high). Zero horizontal page overflow, header-control overlap, hidden reveal content, broken local images, missing local responses or runtime exceptions. Menu and theme interactions exercised.
- Integration: 26 checks passed for twelve-slide navigation, deep links, keyboard/horizontal-wheel navigation, reader search/highlights/category/no-result states, chapter offsets, local resume, rest-day persistence, URL training filters/history, keyboard video activation, query/hash-preserving redirects, direct downloads and menu focus behavior.
- `node --check assets/js/v2.js`, browser script syntax checks and `git diff --check`: PASS.
- Mobile reader clock and Daily Guidebook screenshots visually inspected. Social cards are 1200×630 deterministic layouts using an existing personal photograph. Download covers come from the actual delivered files.

Browser checks use intercepted local file responses with third-party fonts/social/video requests blocked. External embeds and destinations, physical devices and Instagram WebView behavior are not certified. Performance on real 4G was not measured. Source medical assertions were transcribed, not independently clinically validated. Per-chapter PDF uses the browser Print/Save as PDF function. Email automation and third-party analytics collection are not configured; optional hooks and release-update links do not claim to collect signups.
