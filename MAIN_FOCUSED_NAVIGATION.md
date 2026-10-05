# PROJECT_100 focused files — 5 October 2026

The main site now follows the same folder system as FIT PROTOCOL. Four top-level folders—PROJECT 100, Workout, Nutrition and Gear—lead to related file tabs. The lower-right switch opens FIT PROTOCOL from every main-site file. Side arrows wrap through all sixteen PROJECT_100 files.

The landing page keeps the original animated hero, measurements, concise introduction and FAQ, then uses compact folder previews to open the story, goals, training log, nutrition, gear and documented Protocol. The long story and roadmap no longer appear in the landing-page scroll. The roadmap is expandable within the goals file.

Nutrition becomes a compact directory: meals and recipes, source notes, vector folders and the documented food system. All existing meal media stays on the separate meals page. Vectors continue to use their individual Protocol files and descriptive downloads.

Gear becomes a compact directory. Gym walkthroughs, gym photos, rig photographs, resistance bands, grips/handles, straps/anchors, recovery tools and safety guidance each have a focused file. The original equipment markup nested later inventory groups inside the first group; the split explicitly separates those groups to prevent repeated equipment records.

Equipment records use compact thumbnails beside readable descriptions. The existing image viewer still opens the full photographs. At a 390-pixel viewport, the entry pages measured 3,983 pixels for Home, 2,258 for Nutrition and 2,680 for Gear—approximately 68%, 78% and 90% shorter than the preceding combined pages.

The moved story, goals, roadmap, FAQ, meal records, nutrition notes, gym media, safety guidance and clinical equipment notes retain their words and images. Equipment records also retain their words and images. Hero introductions and directory copy are shortened. Existing section bookmarks redirect to the new files; the Workout filters remain in place.

Build order: `scripts/apply_focused_main.py` runs after the focused Protocol overlay. `assets/js/main-files.json` defines the page ring and migrated section destinations. Verify source preservation with `scripts/check_focused_main_content.py` and navigation/playback with `scripts/check_focused_main.cjs`; the responsive suite covers both site manifests.

The older navigation/review documents describe prior releases. `FOCUSED_NAVIGATION.md` and this document describe the current structure. The previously reported antivirus event still requires its blocked URL and threat name for diagnosis.
