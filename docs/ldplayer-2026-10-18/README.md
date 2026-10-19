# Kinetics programme layout and Android validation — 18 October 2026

Kinetics now has two source-owned programme sections: three muscle-focus days and two Pilates full-body days. Each section contains its day links, programme guide and relevant setup information. The duplicated exercise showcase, oversized guide banners and top analysis banner were removed; downloads and analysis remain accessible through compact links. Three anchor cards use one diagram and normal-width text each. All 32 source photographs remain registered; the focused gallery presents its 29 relevant photographs while Pilates retains its three setup photographs.

Android testing revealed a duplicated homepage heading caused by a transformed, masked video layer. The homepage now uses explicit video, shade and content stacking without that mask. Switching exercise sections now reveals the selected section beneath the visible navigation instead of retaining a deep scroll position.

## Validation

- LDPlayer Android 14, Chrome 124.0.6367.82: all 56 main pages at 360 and 412 CSS pixels. Both passes detected zero page overflow, clipped heading/navigation labels or broken initially visible images. Full measurements remain locally beside this report; the committed compact report lists all tested paths.
- Native Android touches: menu open/close, light/dark theme, focused and Pilates programme guides, direct Pilates Day 5 link, horizontal exercise swipes to exercises 11–12, direct selection of exercise 12, section switching, and technique detail popup.
- The exercise section switch correction was independently measured after changing sections: the section heading starts below both visible navigation rows.
- Desktop guide drawer opened the focused programme; desktop programme jump and 320 px anchor-card widths checked through the in-app browser.
- Publication consistency: 65 current pages and 5,003 local links; supplied book hashes and reconciled source claims pass. Workout validation: 40 PDFs, 42 guide pages, 76 illustrated setups and 173 source windows. Nutrition/book models and document-drawer checks pass.

These are Android emulator checks. They do not establish physical Android or iPhone Safari coverage, or certify every possible user interaction. The 360/412 sweeps inspect loaded layouts and initially visible images, not every lazy-loaded image. The supplied Guidebook v3.4 and Encyclopedia v3.3 remain byte-identical.

QA recordings, profiles and third-party guide source material are excluded from this source change. Free device scrolling, the main folder navigation and floating links remain available.
