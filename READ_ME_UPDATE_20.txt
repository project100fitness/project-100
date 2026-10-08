UPDATE 20 - new story photo (the November 2025 vest photo is no longer used)

Copy these 3 files into the repo, keeping the same folders, then push:
  index.html                              -> repo root
  project-story.html                      -> repo root
  assets/data/publication-previews.json   -> assets/data/

What changed
  - index.html: "The story" card now shows the July 2026 photo (grey tee, locker room).
  - project-story.html: hero background, share image (og:image) and the photo gallery no longer use the November 2025 photo.
    The gallery now starts at June 2026.
  - publication-previews.json: story page preview image points to the July 2026 photo.
  No new image files are needed - the July 2026 photo is already in the repo.

OPTIONAL clean-up (so the old photo is not publicly reachable by its direct address):
  Delete these 4 files from the repo:
    assets/media/october-2026/bogdan-november-2025.jpg
    assets/web/media-october-2026-bogdan-november-2025-480.webp
    assets/web/media-october-2026-bogdan-november-2025-960.webp
    assets/web/media-october-2026-bogdan-november-2025-1205.webp
  (Nothing on the site uses them any more. assets/media/october-2026/catalog.json only lists the name.)
