# Verified checkpoint continuation — 18 October 2026

Base: ef1e49f6090c6309ae7a9638ebb6d10cdf50e878 (PR 110).
Work was performed in a separate checkout; the older PC working copy and its
uncommitted changes were not reset, staged or overwritten.

## Corrections

- Both HTML document drawers now preview `weekly-overview.html` for the one-page
  log. Its source title and `data-document` export kind now identify the log,
  rather than a Pilates row with `data-guide="None"`.
- The log exporter skips unrelated anatomy-image loading. Seven weekly note
  fields remain interactive and shared across documents.
- Session-choice container, number explanation, return link and responsive tab
  labels are defined in Exercises HTML. JavaScript updates the current choices
  from the shared day data. The publication-reference section has its final
  position in HTML. Mobile JavaScript no longer moves it, rewrites tab labels or
  conceals weekly notes inside generated disclosure wrappers.
- Removed 89 overwritten declarations from the existing mobile stylesheet,
  retaining cascade order. Sticky jumps no longer add the full measured header
  twice. Existing component styles own the tab labels and readable note labels.
  This is a scoped consolidation, not a claim that every legacy `!important`
  rule across the entire site has been eliminated.
- Drawer selection aligns at the start of its rail and remains visible when
  the viewport changes. Native vertical scrolling, main folders, floating links,
  artwork, detail popups and reduced-motion behavior are preserved.
- Current ZIP contains all 40 canonical PDFs and five source/edition registers,
  with a SHA-256 manifest. The old dated ZIP URL is an identical compatibility
  alias. The reference-source ZIP also matches its current source files.
- `.gitattributes` prevents PDF/ZIP newline conversion. The initial PDF index
  warning was caused by Windows checkout conversion: the published Git PDF was
  already valid. Regenerating the local log reproduced the Git bytes exactly.
- CI now checks source-owned navigation, builds the archive and audits current
  PDF fields, aliases, archive hashes and catalogue/session references.

## Verification performed

- Fully styled pages in the Codex in-app browser: Exercises sessions, library
  and downloads plus Kinetics at 320, 390, 430, 768 and 1440 pixels.
- All 56 root pages using the mobile stylesheet at 390 pixels: no page overflow
  or hidden `.hud-folder__body` elements. This does not establish correctness of
  every interaction on all 56 pages.
- Six library groups reachable; technique popup shows all three muscle roles;
  Pilates folder expands; day 5/day 6 show 12 choices and reset to exercise 1.
- Mobile Kinetics section heading clears the header (about 170px versus a 146px
  header), instead of leaving the earlier duplicated offset of about 368px.
- Folder Next moved scroll position 0 -> 178.7 -> 0. Browser reduced-motion
  preference was enabled, so automatic-motion resumption was not re-tested in
  this browser run. PR 109's unchanged resumption implementation is retained.
- Actual drawer flow: enter test note, switch to planner, return to log, reload,
  reopen log, download PDF, reopen downloaded file. One page, seven canonical
  fields/widgets, saved value and nonempty appearances confirmed and rendered.
- Actual standalone `Build my PDF`: retained day 1 and day 7 test notes; one page,
  seven fields, visible appearances. Local test notes were cleared afterwards.
- All 40 canonical PDFs (188 pages) rendered with Poppler. All pages reviewed on
  contact sheets, with enlarged dense Pilates/source pages and saved form pages.
  No observed clipping, overlapping cards or missing art. Individual technique
  sheets intentionally contain one technique; multi-technique pages contain
  three cards.
- Strict PDF parsing, field/widget consistency, field bounds, 13 legacy PDF
  aliases, archive CRCs/manifests, 78 drawer paths and existing guide links pass.
- Catalogue reconciliation: 31 database entries, 80 catalogued setups, 76
  illustrated eligible setups and 173 source passages. Five active days have
  12 distinct IDs and artwork files; both full-body days use the Pilates kit.
  Six kit adaptations remain explicitly distinguished from recording evidence.

## Limits

No physical Android Chrome or iPhone Safari was available. No Firefox/WebKit
rerun, new video analysis, image generation, verified recorded-set count, full PC
backup or comprehensive online-book table rewrite is claimed. Existing supplied
Guidebook V3.7 and Encyclopedia V3.6 integration remains intact. Static ZIP PDFs
are blank; website PDF export includes the browser's saved notes. Long note
values remain editable PDF fields; printed field appearances have limited space.

Machine-readable reports: `browser-checks.json`, `publication-evidence-audit.json`.
Reusable checks: `scripts/check-workout-source.py` and
`scripts/audit-publication-evidence.py`. Packaging:
`scripts/package-workout-guides.py`.
