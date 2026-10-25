# Collection discovery and compact guide actions / 22 October 2026

Rotating collections now explain their automatic changes using a single source-owned presentation component: `assets/js/rotation-cues.js` and `assets/css/rotation-cues.css`. The shared component renders controls and state; each existing owner retains its actual timing, navigation, visibility and data model. No second autoplay clock is introduced.

## Presentation contract

- Previous/next buttons have visible action names and subtle destination previews. The owner supplies the actual adjacent item or first new item of the next four-card set. Preview images are decorative; the button's accessible name includes the destination title. Small screens retain the image and short action label; larger screens also show the title.
- A central range, explicit Pause/Resume auto-change action, countdown and 10px patterned progress strip explain what will happen next. Paused, manual-navigation hold, reading, changing and actual-image-loading states use distinct wording. Cached cards are never falsely described as a page still loading.
- Countdown text is not an unsolicited live announcement. Native progress/ARIA values reflect the owner clock; range announcements change with items, not every timer sample.
- Reduced-motion starts paused. An explicit Resume can start the local sequence and clear the site's motion pause. Pointer/keyboard reading holds and existing modal behavior are preserved. Collections with all items already visible hide unnecessary rotation controls; useful all-items actions remain available.
- The component owns its button classes, avoiding inherited circular/icon-only control dimensions. Retired library control rules are removed rather than countered by another override layer. Only the native `hidden` visibility contract uses a strong declaration.

## Owners

- `site.js`: four-card collections, overflowing media rows, selfie journal, overflow-choice hints.
- `salad-cards.js`: four-salad sets and actual recipe range, without changing ingredient/nutrition calculations.
- `p100-band-training.js`: six exercise groups; `card-previews.js` enhances only independent folder rails so the library never gets a second clock.
- `kinetics-showcase.js`: technique preview, native progress and all six slide selectors in the same compact block.
- `kinetics.js`: rig-photo scanner, actual image loading, adjacent photos and pause/resume.
- `meal-stories.js`: continuous photo-strip distance/velocity determines the next-photo estimate; original links and native swipe remain.
- `ninja-creami.js`: explicit import of the same component, with its own palette and five-second owner clock. All-flavours view keeps its return control.

The dependency is declared before deferred owners on shared-shell pages. The standalone CREAMi module imports it explicitly. No device sniffing or document-wide post-render control replacement is used.

## Exercise selection visibility correction

The print-selection owner wraps library tiles after their first four-item visibility pass. Each new wrapper now inherits the tile's previous hidden state and clears the inner tile's hidden flag. Subsequent set changes therefore show/hide the wrapper consistently, while checkboxes and full technique opening remain functional. This corrects blank later sets caused by hidden inner buttons.

## Compact book dock and noticeable guide links

The existing dock owner now caps width at 720px, uses smaller action/cover dimensions, reserves clearance for both rows once, and allows titles/descriptions to wrap rather than truncate. The original publications and viewer behavior remain unchanged:

- Encyclopedia V3.6: training, nutrition and evidence.
- Daily guidebook V3.7: routines, recipes and timing.

Each shows its version and an Open PDF action with an outward arrow. The PDFs remain unchanged. Kinetics' guide/planner and detailed-analysis links are accented two-column action tiles. Full technique and further-study links use matching compact borders and accents at their existing CSS owners; ordinary prose citations remain prose links.
