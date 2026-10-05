# Release review — 5 October 2026

Review used Astra to inspect the site change history and current carousel, folder, media and build code. Fixes preserve the approved enclosed layout, top navigation, independent Encyclopedia, muted background loops and persona-free vector downloads.

## Fixed

- Workout filters replaced cards without rebuilding carousel state. Rebuild each filtered row, dispose of old listeners and timers, and retain looping arrows, keyboard navigation, resize and browser Back behavior.
- Hidden carousel copies were receiving keyboard focus. Enhance only original video cards and avoid duplicate playback handlers.
- The workout rows drifted continuously, including under reduced-motion settings. Advance one card at a time only while visible; manual interaction stops automatic advancement. Decorative background video behavior follows the author's separate autoplay preference.
- MAIN and FIT PROTOCOL stored themes separately. Share the preference, migrate the previous setting, and keep the Encyclopedia's independent paper/dark preference.
- Different publications shared reading-position storage. Separate their progress, retain a saved position while returning to the reader cover, and preserve the visible chapter when switching reader themes.
- Vector folder keyboard navigation reserved header space twice. Keep one header offset plus an 18-pixel gap.
- Malformed URL fragments could stop filing-navigation initialization. Ignore invalid fragments safely.
- Full rebuilds could lose the carousel fixes. Include both final release overlays and declare the CairoSVG dependency used for diagram generation.

## Verification

- Full source rebuild preserves all words on the 26 Encyclopedia and 13 Guidebook PDF pages; regenerated HTML is repeatable.
- Targeted carousel tests cover filters, both wrap directions, resizing, browser history, original-card playback, hidden-copy focus and reduced motion.
- Reader tests cover shared themes, independent Encyclopedia preference, separate bookmarks, repeated reloads and vector anchor spacing.
- Existing responsive and interaction checks, static route audit and public-edition privacy checks remain release gates.

## Next priorities

The broader mobile layout pass remains deferred as requested. At a 390-pixel viewport, approximate initial page lengths were 27,461 pixels for Gear, 30,404 for Timing & Fuel and 49,166 for the Daily Guidebook. The largest gains will come from compact equipment groups and expandable secondary source material, with the complete reading master still available in the Encyclopedia.

The previously reported Bitdefender alert remains unresolved: the original screenshot did not contain the blocked URL or threat name. The source review found local application scripts and Google Fonts as automatic external assets, but this is not an antivirus verdict. See NAVIGATION_RELEASE.md for the specific missing event details.
