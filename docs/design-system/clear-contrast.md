# Clear contrast profile / 20 October 2026

The owner found the purple-grey text, pastel Nutrition palette, tinted panels and decorative washes hazy. This profile replaces that presentation in the authored shared-site pages and their existing component owners.

## Reading and surface contract

All 117 shared-site pages declare `data-design-profile="clear-contrast"`. Headings, paragraphs and metadata carry explicit `reading-heading`, `reading-copy` and `reading-meta` source classes. Folder and selection reading surfaces declare `surface-solid`. Nutrition cards declare `salad-card--neutral` in both authored markup and the maintained card renderer. The page inventory is in `clear-contrast-pages.json`.

Dark mode uses neutral black/charcoal surfaces, #f5f5f5 primary text and #d9d9d9 supporting text. Light mode uses white/neutral-grey surfaces, #161616 primary text and #333333 supporting text. Metadata shares the supporting text colour; it is distinguished by size/weight, not lower opacity or a third coloured grey. The system theme and explicit theme choice use the same definitions.

Orange identifies primary/selected actions. Shaded folder navigation and raised programme/day controls retain their depth. Reference links remain underlined with neutral foregrounds. Status colours and red/blue/green anatomical role labels remain separate semantic systems.

## Component changes

- Shared folder reading panels use solid surfaces; their decorative grid pseudo-element is removed at its owning definition.
- Session row, folder footer and print-selection surfaces use solid neutral fills. The print workbench's diagonal hatch and tinted wash are removed. Selected/disabled controls retain their existing distinct behaviour.
- Supporting text no longer uses purple-grey aliases. Choice metadata has full opacity and titles have no text shadow.
- The Nutrition stylesheet no longer assigns sage/plum/gold colours by recipe category or nutrient. Dates, ingredient text and ordinary nutrient values use neutral reading colours; the energy value keeps the orange emphasis. Solid card/control backgrounds follow the page theme.
- The separate meal-story palette is migrated to the same owned theme tokens. Photographs, videos, food calculations and source records are unchanged.
- Existing HUD expansion no longer dims all other file cards through brightness filters.

## Ownership and boundaries

Changes are maintained in site.css, hud.css, session-folders.css, p100-band-training.css, mega-salads.css and meal-stories.css, plus the authored HTML and salad-card renderer. No new override stylesheet, injected style element, blanket recolouring script or image edit is used. Reading-role rules are screen-only. Original manuals, generated workout PDFs, the 15/15/15 focused split, the 12/12 Pilates sessions, printable selection, image labels and source evidence remain as published.

## States and accessibility

Typography provides hierarchy while normal text keeps strong foreground contrast. Selected action colour/check marks, native folder disclosures, underlined links and keyboard focus remain. Empty print selection stays visibly neutral; selecting exercises enables its orange action. The neutral palette does not replace warning/success meaning or anatomical role meaning.
