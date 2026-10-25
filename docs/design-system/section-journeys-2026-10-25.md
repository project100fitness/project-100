# PROJECT 100 · section journeys and crisp typography

The main pages now share a black/white/orange/yellow visual language while using different structures for different information.

## Colour and typography
- Reading foreground: #FFFFFF on dark surfaces, #000000 on light surfaces. Secondary reading text stays opaque; size and spacing establish hierarchy.
- Reference signal: #FFCC00 on dark surfaces; #000000 on light surfaces. Yellow tabs carry black labels in both themes.
- Action text: #FF8800 on dark surfaces; #A83200 on light surfaces. Orange filled actions retain their accessible darker fill and white label.
- Text has no glow, gradient fill or static opacity reduction. Source artwork is preserved as supplied; text embedded inside an image or video cannot inherit CSS typography.
- The independent CREAMi palettes are preserved.

## Native components
- `section-journeys.css`: measurement ledger with native details, four-step training rail, paired blueprint grid, linked day branches, compact historical fuel panel, source-basis disclosure, food-record navigation and contextual next links.
- All dated biometrics values remain visible. Verification labels distinguish historical, partial, benchmark, unverified, index, carried/estimated and planned records. Opening a row reveals its original explanatory notes.
- All eight historical nutrition values remain visible. Individual basis notes are retained in one labelled disclosure, with an always-visible warning that whole-day intake is unverified.
- Repeated liquid day headings are merged. Existing fragment IDs and complete schedule destinations remain available.
- Kinetics previews use compact portrait holders and the correct individual session poster. Full reference material, programme controls and five day links remain.
- The CREAMi launch card reveals once, then stays visible. Its two fine yellow edge marks animate only while onscreen, with page visibility, reduced motion and the existing global motion preference respected. No new timer or pause clutter.

## Implementation and preservation
The changes are authored in HTML and the original component owners, with one stylesheet for genuinely new components. There is no runtime layout repair, native-dialog monkey patch or injected style override. Asset content fingerprints are updated in every referring HTML source.

Current four-book documents, download catalogues, nested readers, the unresolved V5 source conflict, creatine separation, conditional pill counts, historical nutrition distinctions and original media are preserved. Complete books remain first in the landing-page dock; the dock is not expanded to other pages.

## Design basis
Hierarchy and readable grouping follow [Material layout guidance](https://m2.material.io/design/layout/understanding-layout.html). Motion is selective and purposeful, following [Carbon motion guidance](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview). Nonessential movement respects [W3C reduced-motion technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39).
