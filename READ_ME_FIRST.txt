PROJECT 100 - UPDATE 6  (7 Oct 2026)
What this fixes
  1. The "@" floating button now opens the Links panel: Email, Project 100 Blueprint, Instagram, YouTube,
     Facebook, TikTok, Twitch, Gym playlist. Tap outside, press Esc, or tap a link to close it.
     The same "Project 100 Blueprint" row was also added to the side Menu list.
  2. Animated count-up numbers are back. Every stat number counts up when it scrolls into view.
     The home page also has a new "Status vs goal" block: current figures in red, goal figures in green,
     with bars that fill (muscle 88.2 -> 100 lb, body fat 22.5% estimate -> under 15%).
  3. Carousels now drift on their own and loop in both directions, on every page that has them
     (Home, Workout, Nutrition/Meals, Gear gym tours, Protocol vectors, Story, Photos, Shop).
     They pause when you touch, hover or focus them, and have a small round Pause/Play button on the right of
     each carousel title. Phones set to "reduce motion" start paused.

Why they had disappeared
  The page HTML and CSS for the @ panel and carousels were on the site, but the JavaScript that runs them
  was missing from assets/js/site.js. This update puts it back.

What to copy (same folder layout as the site - copy over, Yes to all / Replace)
  assets/js/site.js          (new JavaScript)
  assets/css/site.css        (new styles)
  index.html                 (home: goal meters + colours)
  + the other .html pages in this folder (only the Links panel/menu row and the file version tag changed)

How to publish (GitHub Desktop)
  1. Extract P100_UPDATE_6_2026-10-07.zip.
  2. Copy everything inside it into your repo folder for project100fitness/project-100, replacing files.
  3. GitHub Desktop: write a summary like "Update 6: @ panel, carousel autoplay, count-up", Commit to main, Push origin.
  4. Wait 1-3 minutes, open https://project100.fit/ and press Ctrl+F5 (phone: close and reopen the tab).
