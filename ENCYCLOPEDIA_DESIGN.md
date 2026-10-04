# Independent Encyclopedia reading site

The author requested a distinct design for the exhaustive Encyclopedia, separate from the PROJECT_100 and FIT PROTOCOL site navigation. The existing reader URL and all old chapter IDs/redirects remain valid. No new hostname is required.

The reading edition uses its own paper/teal/copper palette, Georgia serif reading typography, wider desktop layout, source-book cover, sticky chapter index, searchable text, category facets, original-PDF links, edition/source notes and a reading progress indicator. Mobile Contents opens the local chapter index; the menu contains only chapter/edition links. Theme choice is stored independently as `p100-encyclopedia-theme`.

The shared site switch, Protocol folder tabs, unrelated footer links and Encyclopedia self-link are removed from this page. Its lower-right floating action is `Back to PROJECT_100`, linking directly to `index.html`. All other sites keep their existing navigation and Encyclopedia access.

`scripts/apply_encyclopedia_design.py` verifies the source-word Counter before/after applying its presentation changes. The complete 26-page master text, chapter/source IDs, 21 reading sections, both annexes and source-download bytes are preserved. The rebuild sequence is V2 content, October assets, shared filing layout, then the independent Encyclopedia overlay. The shared filing overlay skips an already independent reader.

Verify with the static audit, responsive/browser interaction scripts and the source-text check. The design does not change the unresolved Bitdefender warning status documented in `NAVIGATION_RELEASE.md`.
