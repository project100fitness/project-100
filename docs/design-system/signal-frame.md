# PROJECT 100 signal-frame profile

Historical profile: the 20 October [clear-contrast profile](clear-contrast.md) supersedes the tinted surfaces, supporting palette and page profile name below. The authored component structure remains in use.

The profile extends the shaded folder interface through authored HTML on all 117 shared-site pages. Each page declares `data-design-profile="signal-frame"`; sections declare their purpose with `section-tone--training`, `--reference`, `--data` or `--content`. Folder, table, callout and accordion variants are written directly into the HTML. Their rules live beside the original component definitions in site.css, hud.css, p100-band-training.css and session-folders.css. There is no extra override stylesheet or runtime styling injection. Print documents and source illustrations retain their established formatting and colours.

## Visual roles

| Role | Treatment | Components |
| --- | --- | --- |
| Brand and primary action | Existing orange, charcoal and shaded folder edges | Selected navigation, programme/day choices, primary buttons, training folders |
| Reference, data and tools | One muted teal, fine keylines and a restrained grid/diagonal pattern | Guide cards, print collection, source references, table headers, supporting accordions |
| Content and status | Existing neutral body text and semantic colours | Anatomy red/blue/green, clinical warnings, biometric goal/status values, photos and videos |

## Tokens and themes

`--section-signal`: #24635b in light mode; #87b8b0 in dark mode. `--section-signal-soft`: #e7efeb / #142320. Keylines and washes derive from the signal and existing neutral tokens. One profile supports OS preference and the explicit theme toggle. Main typography remains Inter; only short metadata uses the existing monospace token.

## Interaction states

Folder depth, cut corners and native expand/collapse affordances are retained. Active actions remain orange; supporting links use the teal token with existing underlines. The empty print-selection action is visibly inactive, becoming orange after selection. Hover adds a fine auxiliary edge; focus remains visible. The profile adds no flashing, continuous motion, playback controls, hidden menus or fixed overlays. Reduced-motion preferences suppress the profile's optional transitions.

## Maintenance

Assign auxiliary accents by component purpose, never by an alternating palette or muscle group. Keep reading surfaces quiet and grids faint. Do not apply this decorative profile to generated PDFs, anatomical illustrations, floating-dock backgrounds or the transparent theme icon. Update the cache fingerprint on every linked page after changing an owning stylesheet. The page-by-page variant inventory is `page-roles.json`.

## Component ownership and HTML contracts

| Component | Authored variant | Owner | Behaviour |
| --- | --- | --- | --- |
| Chapter folder | `hud-folder--training/content/reference/data` | hud.css | Existing folder/tab structure; orange training/content edge or teal reference/data edge |
| Supporting note | `callout--reference` | site.css | Teal wash; warning, danger and success variants keep semantic colours |
| Supporting accordion | `acc--reference` | site.css | Native details/summary, keyboard toggle and shaded summary |
| Data table | `table-wrap--data` | site.css | Teal frame/header; retains mobile row cards and horizontal scrolling |
| Reference file | `hud-card--reference` | hud.css | Dark label and muted teal marker; source artwork unchanged |
| Training folders | `#p100-session-folders.session-folders` | session-folders.css | Independent of legacy carousel selectors; all planned rows remain visible inside native folders |
| Personal print selection | `.exercise-selection-bar` | session-folders.css | Teal tool surface, orange enabled primary action, neutral disabled action |

## Accessibility and verification scope

The new signal is designed for neutral light/dark reading surfaces. Reference poster labels use always-dark tokens so their text remains visible in both themes. Links retain their affordances; keyboard focus and native controls remain available. The session container has its own ID to prevent obsolete carousel rules from turning selected text white in light mode. Anatomical muscle colours and safety/status colours are separate semantic systems and are unchanged. Browser and Android checks cover layout and interaction; they do not certify medical or anatomical correctness.
