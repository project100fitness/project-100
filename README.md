# PROJECT 100 — Full Site

This folder is the complete, current site — every page and asset it needs. Upload this whole folder to GitHub (replacing what's there) and everything stays linked correctly, since all the internal links are relative paths.

## Pages

- `index.html` — homepage
- `fit-protocol.html` — the Fit Protocol deck (condensed)
- `fit-protocol-archive.html` — the full Singularity Archive (unabridged)
- `fit-workout.html` — training log
- `fit-nutrition.html` — meals + supplement timeline
- `gear-shop.html` — **Fit Gear** (gym walkthrough, gym photos, training-gear database, guide book)
- `ninja-creami.html` — Ninja CREAMi recipes

A few tiny redirect stubs (`fit-gear.html`, `fit-shop.html`, `encyclopedia.html`, `encyclopedia-archive.html`, `fit-food.html`) exist only so old links/bookmarks still land somewhere real — they instantly forward to the pages above. Keep them; they're harmless.

## Assets

- `assets/css/` — stylesheets (shared across all pages)
- `assets/js/` — carousel, connect widget, lightbox gallery, floating connect button
- `assets/img/` — every photo used across the site (~80 files)
- `assets/video/` — self-hosted background-loop clips (see note below)
- `assets/partials/` — shared HTML snippets (the "connect" footer block)
- `.nojekyll` — tells GitHub Pages not to run Jekyll processing on this (needed since some filenames/folders would otherwise get mangled)

## Do you need to cut or compress any video?

**No — nothing needs cutting or compressing to upload this.** Two separate things live on the site, and both are already in good shape:

1. **The Gym Tour walkthrough videos** (the 9 clips on the Fit Gear page) aren't files in this folder at all — they play straight from YouTube (your `@FUDGE_fit` channel), loaded only when someone taps a card. Nothing to compress; YouTube already handles that.
2. **The 7 short looping background clips** in `assets/video/` are your hero/CTA-band loops. They're already small (672 KB – 1.2 MB each) and web-ready as-is.

One thing worth knowing: only `featured-plyo-protocol.mp4` (and its poster image) is actually wired into a page right now — it's the homepage hero loop. The other 5 (`featured-focus-check`, `featured-fuel-check`, `featured-gear-setup`, `featured-greens-scoop`, `featured-preworkout-mix`) — plus their matching poster JPGs — are sitting in the folder unused. They're not hurting anything if you upload them (harmless, just unused), but if you want a leaner repo you could leave those 10 files out. Say the word if you'd like me to actually place them on a page instead of just carrying them around unused.

## Publishing (GitHub Pages)

If this repo isn't set up yet: create a public GitHub repo, push this whole folder's contents to it, then in the repo go to **Settings → Pages**, set Source to "Deploy from a branch", branch `main`, folder `/ (root)`. GitHub gives you a live URL within a minute or two.

If the repo already exists: just replace everything in it with this folder's contents and push — GitHub Pages redeploys automatically.
