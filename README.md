# PROJECT 100

Static website hosted at https://project100.fit using GitHub Pages.

## Website destinations

- PROJ3K_100: `index.html`, `fit-workout.html`, `fit-nutrition.html`, `gear-shop.html`.
  Previous/next page arrows loop through these four pages in both directions.
- Fit Protocol: `fit-protocol.html`, `fit-protocol-baseline.html`, `fit-protocol-fuel.html`,
  `fit-protocol-training.html`, `fit-protocol-troubleshooting.html`.
  Its page arrows loop through these five pages independently.
- PROJECT 100 — Encyclopedia Guidebook: `encyclopedia-guidebook.html`.
  Access it through the gold bar below the website navigation on every full page.

Legacy URLs redirect to current pages. Keep the redirect files for bookmarks.
`404.html` provides navigation when a genuinely unknown URL is requested.

## Publishing

GitHub Pages deploys `main` from the repository root. Keep `CNAME` and `.nojekyll`.
Upload or merge all changed files together, including `assets/css/site-repairs.css`.
The dedicated appliance feature and associated assets have been removed.

## Verification

Run `python scripts/audit_site.py` to verify internal files, section links, HTML wrappers,
primary headings, guidebook access, and circular navigation. Browser checks should cover
320, 390, and 768-pixel mobile widths plus desktop, scrolling each page and opening menus.
