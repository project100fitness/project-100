# Kinetics illustrated workout guides / 15 October 2026

Guide A sits in the KUZARO movement library and covers days 1-3. Guide B sits beside the HPYGN/Pilates atlas and covers days 5-6. Each family provides levels 1-3. The end-scroll publication bar opens a one-page weekly planner connecting both detailed guides. Equipment is identified per exercise; chapter placement does not change a movement's band system.

There are twelve original naturalistic start/finish plates. Main focus is red, secondary assistance/local control blue and base/support green. Band lines stay orange-edged charcoal. Some assisting muscles are deep or out of view, so a blue surface patch is not forced onto unrelated anatomy. Read ART_REVIEW.md and the complete muscle-role panel.

The JSON database drives PDF generation. Source HTML remains directly editable. The image-bank exporter embeds each exercise's own plate, checks page bounds and preserves fillable logs. The weekly overview remains one page. Detailed focused guides are 17 pages and full-body guides 11 pages; additional combined reference booklets remain available.

The guarded PR workflow prepares JPEG embeddings from the original PNGs, builds 26 PDFs, validates canonical form fields and appearances, renders all pages, checks image identity, runs responsive Chromium browsing/download tests and packages the dated offline ZIP. A separate post-deployment workflow checks the public URLs. Physical-device and Safari testing are not claimed.

To rebuild, create an image-bank JSON mapping each exercise id to its JPEG path, width and height, then run `node scripts/build-workout-guides.cjs PATH_TO_IMAGE_BANK_JSON` and `python scripts/validate-workout-guides.py` with pypdf, Pillow and Poppler installed. The workflow contains the complete preparation commands.

No named bundle is prescribed automatically; actual resistance selection and current individual restrictions remain unconfirmed. The source retains the distinction between KUZARO stock and HPYGN's four 65 lb bands, two per side, 260 lb combined nominal.
