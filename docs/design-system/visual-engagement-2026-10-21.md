# Visual engagement and media reliability — 21 October 2026

Owner request: restore engaging visible previews and continuous in-view animation while retaining compact, informative pages. Later clarification: no extra full-width motion status row.

## Authored page changes
- Five entry pages gain relevant existing video backgrounds: FIT PROTOCOL, Liquid Intake, Vectors, Workout and Gear.
- Main landing-page training/food/gear cards retain their original still images and gain silent clips. The closing follow panel gains its own existing clip.
- Five training-day cards gain start/finish thumbnails. Two programme field clips sit outside the closed reference sections. The original six-plate movement showcase is restored with automatic advance, previous/next, slide dots and pause.
- Eleven reader-context panels keep every definition and destination in a smaller illustrated composition. The home status cards come before the introductory panel. Intro-to-status spacing is reduced.
- The closing Eat/Sleep/Train/Repeat slogan is restored to one compact line rather than five central bullets. Generic point lists explicitly align left. Current-edition source links sit within the content width and wrap.
- Motion control is a small accessible icon over the hero; it adds no row or status legend.

## Playback and rendering
Authored decorative backgrounds explicitly use data-always: play while visible even when the system requests reduced motion or data saving. A visitor can pause and save that choice. Other reduced-motion CSS treatments remain. Hidden tabs/offscreen containers pause; playback retries after visibility return, canplay, online and a permitted gesture. A bounded compatible-source fallback remains for the two original mobile variants. An interrupted play promise is distinguished from a browser permission block.

Visibility observes the clipped container, not an oversized video surface. The Android home hero uses its authored canvas to present the same decoded frames when the compositor fails to paint the transformed video layer. It does not load a second video. Desktop keeps the native video surface. Canvas work follows decoded frames and stops offscreen/hidden/paused.

## Instruments and carousel behavior
The home status numbers have a mechanical entrance and the goal meters animate their fills/sheen. Exact recorded figures and targets remain unchanged at every frame; they are not replaced with intermediate fake measurements. Main visual carousels no longer stop permanently just because a desktop pointer rests over their large surface; explicit interaction and keyboard focus still defer movement. Full detail panels, recipe/exercise models, current PDFs and existing images/clip files are preserved.

## Source ownership
Direct page HTML plus existing site.css, kinetics.css, site.js, kinetics-showcase.js and card-previews.js. No patch stylesheet and no runtime prose rewrite. Every changed asset reference uses its content hash. Validation evidence and release details are saved separately in VISUAL_ENGAGEMENT_QA_2026-10-21.
