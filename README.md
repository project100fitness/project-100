# PROJECT 100 — Landing Site

A standalone, single-page site: the hype/story front door for Project 100, meant to sit at a short link in your Instagram/Facebook bio. It links out to the full 13-chapter encyclopedia for anyone who wants the deep protocol.

Built from your real @fudge_fit Reels — captions, dates, likes/comments, and 7 of your own training photos and 3 of your own official Project 100 diagrams (Aug/Sep 2026).

## What's in this folder

- `index.html` — the whole site (self-contained, no build step)
- `assets/img/` — 10 images (~2 MB total): your training photos + your V185.80/83/99 protocol diagrams

## Publish it on GitHub Pages (free, ~5 minutes)

1. On github.com, create a new **public** repository — e.g. `project-100`.
2. Upload these files to it: either drag `index.html` and the `assets` folder into the GitHub web uploader, or from a terminal:
   ```
   cd project-100
   git init
   git add .
   git commit -m "Project 100 landing site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/project-100.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**. Under "Build and deployment", set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. GitHub gives you a live URL in a minute or two, usually:
   `https://<your-username>.github.io/project-100/`

## Get a short link for your bio

Once the GitHub Pages URL is live, shorten it with any link shortener — e.g. [bit.ly](https://bit.ly), [TinyURL](https://tinyurl.com), or [is.gd](https://is.gd). Paste the GitHub Pages URL in, and it hands you something like `bit.ly/project100` to drop straight into your Instagram and Facebook bios.

(A custom domain works too, if you ever want `project100.fit` instead of a shortener — GitHub Pages supports that under Settings → Pages → Custom domain — but a shortener is the fastest path today.)

## Updating it later

Once this is pushed, updating is just editing `index.html` (or swapping files in `assets/img/`) and pushing again — GitHub Pages redeploys automatically within a minute or two. The training log grid near the bottom of the page is data-driven: look for the `LOG_DATA` array near the end of `index.html` to add new posts without touching any layout code.

## A note on the images

Everything here is your own content — training photos and the official Project 100 diagrams pulled straight from your Reels. A few "hook" cover images seen on some of your carousels (recipe/nutrition graphics, generic muscle diagrams) were deliberately left out, since those slides were reposts from other creators rather than your own material — better to keep this site 100% yours.
