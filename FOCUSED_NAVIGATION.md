# Focused site structure — 5 October 2026

The author's new direction replaces the header site selector with one compact lower-right switch: PROJECT_100 pages link to FIT PROTOCOL, and Protocol pages link back to PROJECT_100. The previous Encyclopedia reader and its navigation/download links are suspended. Source PDFs remain build inputs; the approved reader design remains in the build scripts for a future return.

The top folder row now belongs to the current site. PROJECT_100 retains Home, Workout, Nutrition and Gear. FIT PROTOCOL has ten topic folders and related subfolders, covering 27 focused files. Both sets of side arrows wrap continuously through their respective pages.

Timing & Fuel's six combined topics become separate clock, nutrition, supplements, vector context, interactions and margins files. Baseline, training and monitoring also have focused subfiles. Each of the seven vector folders gets its own page with the existing persona cover, descriptive ingredient sheet, protocol notes and PNG/SVG downloads. Nutrition and the vector index use compact previews rather than seven expandable full records.

The Daily Guidebook is now a training/rest execution page. Its twelve analysis/reference pages move to the related topic files as expandable notes; the old cover page is retired. All 17 existing Protocol chapter texts and the twelve daily note bodies are preserved word for word. The complete Encyclopedia page is no longer rendered publicly. Old reader URLs and source fragments lead to the corresponding focused files where available, or the Protocol overview.

The new overlay runs last in `scripts/build_v2.py`. `assets/js/protocol-files.json` defines the page ring and bookmark routing. Verify with `python scripts/audit_site.py`, `python scripts/check_focused_content.py`, `node scripts/check_focused_protocol.cjs`, `node scripts/check_responsive.cjs` and the carousel/privacy regression checks. Historical reader-only tests describe the suspended reader and do not apply to this release.

Large MAIN equipment groups remain a separate mobile layout improvement. The previously reported antivirus warning still requires its blocked URL and threat name for diagnosis.
