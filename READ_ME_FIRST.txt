PROJECT 100 - UPDATE 7  (8 Oct 2026)
Needs Update 6 already published (it is).

WHAT CHANGED
 1. The @ links panel has a round X in its top-right corner (also Esc / tap outside / tap a link).
    The side Menu already had its X; the picture viewer already has its X.
 2. Carousels
    - side arrows removed; the red bar underneath is now thick (and can be dragged)
    - the extra black/white text under each picture is gone (Workout, Meals, Nutrition, Gym tours, Gym photos):
      pictures only. Page-link rows (Home, Gear, Fit Protocol) keep just the file name.
    - they keep drifting on their own: after you touch, swipe or tap one it waits ~2 seconds and carries on.
      (Before, a touch left it stuck.) The small round Pause button at the right of each title stops it.
    - rows with 6 or 8 page links (Home "Open a file", Gear files, Fit Protocol files) are now TWO rows deep,
      so more of them are in view and nothing is lost at the end of one long line.
 3. Everything that used to wrap into stacked blocks is now ONE row you swipe sideways:
    top page tabs, the filter chips (Meals, Workout, Gym tours...), and the footer "Explore" / "Elsewhere" links.
 4. Page order: hero -> ONE glowing info card -> the pictures (carousels, vector slides) -> background text last.
    Moved to the bottom: "Food, drinks & context" and "Straight from @fudge_fit" (Nutrition, Meals),
    "The last 60 days, unfiltered" (Workout), the gym/photo intro lines, the Fit Protocol nutrition overview,
    and on the vector pages the facts list and "Branch rules at a glance".
    The vector pages now start with a compact key card (2-3 tiles across instead of one tall column).
    The story page leads with the photos and chapters; the long text follows.
 5. Phone page headers are shorter, so the carousels appear without scrolling first.

HOW TO PUBLISH (same as before, GitHub Desktop)
 1. Download P100_UPDATE_7_2026-10-08.zip (attached in the chat) to E:\DOWNLOADS\ and extract it there.
 2. Copy everything inside E:\DOWNLOADS\P100_UPDATE_7_2026-10-08\ into your project-100 repo folder.
    Yes to all / Replace. Files in it: assets\js\site.js, assets\css\site.css and the changed .html pages.
 3. GitHub Desktop: summary "Update 7: close X, thick bars, rows, page order", Commit to main, Push origin.
 4. After 1-3 minutes open https://project100.fit/ and press Ctrl+F5 (phone: close the tab and reopen it).

NOT CHANGED (tell me if you want these too)
 - The left vertical page menu on phones (you asked for it earlier) still uses a slim column.
 - Liquid Intake file rows (7 expandable cards) and the Gear item lists (grips, anchors, safety...) are still stacked
   lists, because they carry spec text. I can turn them into swipe rows if you want.
 - Meals still shows one row per category in the "All" view; the chips jump to one category.
