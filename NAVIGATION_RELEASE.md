# Shared navigation and filing layout

The author's October 3 follow-up replaces the full-width Encyclopedia header bar with a compact gold reference link fixed at the lower right. This link stays outside the site/page hierarchy. Both websites use the same boxed 980 px shell, common logo/menu/site switch, and folder-shaped page tabs. Small screens retain horizontal scrolling tabs. Previous/next page arrows stay centered vertically on the left/right sides at every viewport size. The two existing page loops and all source routes are retained.

The Fit Protocol introduction is organized into twelve expandable files. All supplied overview text, photographs, source links and old section IDs remain available. The standalone slideshow toolbar and sticky button strip are removed. Deep links open the corresponding file. Other Protocol pages preserve the complete source text while using the same shell and folder navigation. The original landing animation is reused behind its introduction; photographs are not enlarged or retouched.

Rebuild with `python scripts/build_v2.py`; it applies October media first and filing navigation second. `python scripts/apply_filing_navigation.py` also updates existing pages independently. Browser checks include responsive layouts, overview filing/deep links, both page loops, reader search/resume, daily mode, accessible menus, folder tabs, centered-arrow geometry and the floating reference position.

## Bitdefender warning: unresolved, detection details needed

The supplied screenshot shows “Online threat detected” but does not include the blocked URL, threat name, process or full event details. It is not sufficient to establish that PROJECT 100 itself was flagged or to identify a root cause. No claim of a false positive or a completed security fix is made.

The public root and www address return HTTP 200 over normally validated HTTPS; www redirects to the canonical root. The landing page's JavaScript and media are local, and its automatic external assets are Google Fonts. The local script review did not find a remote script loader or an obfuscated payload. This is a limited source/request review, not an antivirus verdict. The direct socket certificate probe could not resolve DNS in the execution environment; HTTPS checks used the configured network proxy instead.

Next evidence: open the Bitdefender event's More details / Notifications and provide its exact blocked URL and threat name. Then compare that URL with the site's request list and investigate the specific request or domain classification. Do not disable protection or whitelist the site to conceal the warning.
