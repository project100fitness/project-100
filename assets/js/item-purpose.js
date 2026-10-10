/* Shared item facts: manufacturer descriptions and recorded food/gear roles. */
(function () {
  'use strict';
  var facts = [
    [/^Juggernaut$/i, 'Chest & pressing', 'The recorded 3 × 85 lb bundle is used for chest presses and horizontal pushing.', null],
    [/^Titan$/i, 'Rows & lat work', 'The recorded 3 × 65 lb bundle is used for back-focused pulling.', null],
    [/^Enforcer$/i, 'Triceps work', 'The recorded 3 × 55 lb bundle is used for press-downs and extensions.', null],
    [/^Viper$/i, 'Drop sets & finishers', 'The recorded 3 × 45 lb bundle is the reserve option for drop sets and finishers.', null],
    [/^Scalpel$/i, 'Deltoid isolation', 'The recorded 3 × 35 lb bundle is used for precise shoulder isolation and warm-up work.', null],
    [/^Twin Cobras$/i, 'Unilateral curls', 'Two separate 75 lb bands provide one band per hand for the recorded curl setup.', null],
    [new RegExp("testofx", "i"), "Botanical vitality blend", "Manufacturer-designed daily male-vitality formula.", "https://ca.allmaxnutrition.com/products/testofx"],
    [new RegExp("boron", "i"), "Trace mineral", "Provides boron as part of the recorded mineral routine.", "https://www.newrootsherbal.com/index.php/shop/boron"],
    [new RegExp("lactobif", "i"), "Probiotic cultures", "Supplies probiotic strains for digestive support.", "https://www.iherb.com/pr/p/69435"],
    [new RegExp("kyolic|aged garlic", "i"), "Aged garlic & lecithin", "Formula 104 is designed for cardiovascular wellness.", "https://kyolic.com/product/kyolic-formula-104/"],
    [new RegExp("\\bnac\\b|n-acetyl.*cysteine", "i"), "Glutathione precursor", "NAC provides cysteine used in the body’s antioxidant system.", "https://www.pureencapsulationspro.com/our-products/all-products/nac-n-acetyl-l-cysteine-900-mg.html"],
    [new RegExp("\\bnmn\\b", "i"), "NAD+ precursor", "NMN is a building block for the coenzyme NAD+, involved in cellular metabolism.", "https://api.ods.od.nih.gov/staging-s3/pdf/318843.pdf"],
    [new RegExp("digestive enzymes ultra", "i"), "Meal digestion", "Vegetarian enzymes support protein, carbohydrate, fat, fiber and dairy digestion.", "https://www.pureencapsulationspro.com/digestive-enzymes-ultra"],
    [new RegExp("puregenomics", "i"), "Daily micronutrients", "A multivitamin and mineral formula for daily nutritional support.", "https://www.pureencapsulationspro.com/puregenomics-multivitamin-60-s-improved.html"],
    [new RegExp("canprev.*calcium|calcium malate", "i"), "Calcium supply", "Calcium contributes to bone maintenance and normal muscle function.", "https://canprev.ca/products/calcium-malate-bis%C2%B7glycinate-200/"],
    [new RegExp("omega.?800", "i"), "EPA & DHA", "Concentrated fish oil supplies omega-3 fatty acids.", "https://www.iherb.com/c/cgn-omega-800"],
    [new RegExp("liver[ -]g\\.?i\\.?|liver gi", "i"), "Liver & digestive support", "A nutrient and botanical blend designed for liver and gastrointestinal support.", "https://www.pureencapsulationspro.com/media/pdf_upload/Pure_PIS_LiverGIDetox.pdf"],
    [new RegExp("uricare", "i"), "Urinary wellness", "Herbal formula designed to support normal urinary function.", "https://himalayausa.com/products/uricare"],
    [new RegExp("kitabio|pumpkin seed.*saw palmetto", "i"), "Seed oil & botanicals", "Combines pumpkin seed oil and saw palmetto in the recorded softgel formula.", null],
    [new RegExp("curcumin", "i"), "Antioxidant support", "Turmeric-derived curcumin; the listed BioPerine blend supports absorption.", "https://www.pureencapsulationspro.com/curcumin-500-with-bioperine.html"],
    [new RegExp("magnesium glycinate", "i"), "Muscle & nerve function", "Magnesium contributes to normal neuromuscular function and energy metabolism.", "https://www.pureencapsulationspro.com/our-products/all-products/magnesium-glycinate.html"],
    [new RegExp("tart cherry", "i"), "Fruit-derived antioxidants", "Tart cherry extract adds fruit-derived compounds to the evening routine.", "https://organika.com/products/tart-cherry"],
    [new RegExp("milk thistle", "i"), "Botanical support", "Milk thistle is the botanical component of the recorded optional capsule.", null],
    [new RegExp("beef liver|higher health", "i"), "Food-based micronutrients", "Beef liver supplies naturally occurring organ-food nutrients.", "https://www.higherhealths.com/products/beef-liver"],
    [new RegExp("ligament restore", "i"), "Connective-tissue support", "A formula designed to support healthy ligaments and connective tissue.", "https://www.pureencapsulationspro.com/ligament-restore.html"],
    [new RegExp("r[ -]lipoic|r-ala", "i"), "Antioxidant & metabolic support", "R-lipoic acid participates in mitochondrial metabolism and antioxidant processes.", "https://aor.ca/product/high-dose-r-lipoic-acid/"],
    [new RegExp("hibiscus", "i"), "Warm herbal base", "Hibiscus provides the caffeine-free tisane base for the evening drink.", null],
    [new RegExp("^water$|(?:cold|room-temperature).*water", "i"), "Hydration base", "Water provides the fluid base for the preparation.", null],
    [new RegExp("^medi-c(?:$|\\s|\\()", "i"), "Vitamin C & lysine", "Adds vitamin C and lysine to the recorded evening routine.", "https://assurednatural.com/brands/"],
    [new RegExp("^choline$", "i"), "Choline source", "Choline is a building block for cell membranes and acetylcholine.", null],
    [new RegExp("^tyrosine$", "i"), "Neurotransmitter precursor", "Tyrosine is used to make catecholamine neurotransmitters.", null],
    [new RegExp("^theanine$", "i"), "Tea-derived amino acid", "Theanine is a tea-associated amino acid in the recorded formula.", null],
    [new RegExp("^dmae$", "i"), "Formula-native component", "DMAE is part of the recorded pre-workout blend.", null],
    [new RegExp("^huperzine", "i"), "Formula-native component", "Huperzine-A is included within the recorded pre-workout formula.", null],
    [new RegExp("^bacopa$", "i"), "Botanical component", "Bacopa contributes a botanical extract to the recorded blend.", null],
    [new RegExp("^juniper$", "i"), "Botanical component", "Juniper contributes a botanical component to the recorded blend.", null],
    [new RegExp("^l-?arginine|^arginine$", "i"), "Nitric oxide precursor", "Arginine participates in nitric oxide production.", null],
    [new RegExp("^glycerpump", "i"), "Glycerol component", "Glycerol contributes to the formula’s fluid-balance design.", null],
    [new RegExp("^nitrovascine", "i"), "Pump-formula blend", "A branded ingredient blend within the recorded stimulant-free formula.", null],
    [new RegExp("^sodium$", "i"), "Fluid balance", "Sodium contributes to fluid balance and normal nerve and muscle function.", null],
    [new RegExp("roasted kasha|^kasha", "i"), "Carbohydrate base", "Buckwheat provides a carbohydrate base for the meal.", null],
    [new RegExp("^almond butter", "i"), "Portioned fats", "Almond butter adds fats and a nut-based component.", null],
    [new RegExp("^zero-sugar syrup", "i"), "Flavor & consistency", "Adds sweetness to make the recorded meal easy to repeat.", null],
    [new RegExp("^earl grey", "i"), "Morning tea", "A tea-based morning drink with the recorded caffeine contribution.", null],
    [new RegExp("protein berries smoothie", "i"), "Protein & fruit", "A blended protein-and-fruit meal from the food journal.", null],
    [new RegExp("anabolic recovery bowl", "i"), "Composed recovery meal", "A chickpea and vegetable bowl provides plant foods and meal volume.", null],
    [new RegExp("dark choco blueberry recovery", "i"), "Oats & berries", "A blended oat-and-berry meal adds carbohydrate foods to the routine.", null],
    [new RegExp("post-workout protein wrap", "i"), "Portable protein meal", "A handheld protein meal makes post-training food convenient.", null],
    [new RegExp("post-workout carnivore omelette", "i"), "Egg-based meal", "An omelette provides an egg-based protein option.", null],
    [new RegExp("post-workout air fry meals", "i"), "Practical meal preparation", "Air-fryer preparation is a repeatable option for the recorded post-workout meal.", null],
    [new RegExp("protein choco fudge", "i"), "Protein dessert", "A chocolate-style protein treat adds variety to the food routine.", null],
    [new RegExp("^ms-01|mega shake", "i"), "Blended meal", "The recorded milk, protein and plant-food blend offers a substantial meal option.", null],
    [new RegExp("^sb-01|salad bowl", "i"), "Protein & plant foods", "Tuna, beans and vegetables bring protein and plant foods into one bowl.", null],
    [new RegExp("^fusion_2a|dark matter casein|^night fuel$", "i"), "Evening protein meal", "The recorded protein, skyr, cereal and berry blend adds an evening meal option.", null],
    [new RegExp("^solid meal", "i"), "Protein & carbohydrate meal", "A solid meal provides a repeatable food anchor between the liquid stages.", null],
    [new RegExp("^cocoa$", "i"), "Flavor component", "Cocoa adds a chocolate flavor component to the recorded blend.", null],
    [new RegExp("KUZARO", "i"), "Matched resistance bundles", "Six configurations cover presses, pulls, isolation and unilateral curls. Choose the named bundle for the movement; keep the listed tube grades and connections.", null],
    [new RegExp("HPYGN\\ Heavy\\-Duty\\ Compression", "i"), "Compact band resistance", "Shrouded bands provide a portable resistance option. Use the recorded low-anchor setup and control the return through each repetition.", null],
    [new RegExp("BLUSLM", "i"), "Two-hand rope work", "Twin rope arms offer separate hand positions for cable-style extensions. Use for controlled triceps extensions and press-downs.", null],
    [new RegExp("HXD\\-ERGO", "i"), "Ergonomic hand position", "Curved handles offer an alternative grip for pulling and pressing. Select a comfortable wrist angle and a controlled range.", null],
    [new RegExp("INNSTAR", "i"), "Textured stirrup grip", "Honeycomb grips provide hand contact for band and cable-style movements. Use as paired handles for rows, presses and isolation work.", null],
    [new RegExp("Angles90", "i"), "Free-moving pull grip", "Curved handles and slings allow the hands to rotate during pulling. Use for pull-ups and rows with a comfortable grip orientation.", null],
    [new RegExp("THEFITGUY\\ Single\\-Arm", "i"), "Unilateral rope work", "A single rope lets each arm work independently. Use for single-arm triceps extensions and controlled press-downs.", null],
    [new RegExp("MANUEKLEAR", "i"), "Three grip positions", "Sewn grip pockets offer three hand positions in one attachment. Choose the pocket that fits the movement and comfortable reach.", null],
    [new RegExp("SELEWARE", "i"), "Grip and forearm work", "Ball grips create a crush-grip challenge during pulling. Use for controlled grip work and forearm finishers.", null],
    [new RegExp("Vulken", "i"), "Two-hand rope work", "A second braided rope option provides paired hand contact. Use for triceps press-downs and cable-style rope movements.", null],
    [new RegExp("Rauuueo", "i"), "Neutral-grip pulling", "Angled handles offer a neutral hand position. Use for rows and pull-ups within a comfortable range.", null],
    [new RegExp("Tribe\\ Lifting", "i"), "Rotating bar connection", "Swivel rings let the attachment rotate as the bar moves. Use for the recorded band setup with controlled, even loading.", null],
    [new RegExp("HPYGN\\ Heavy\\ Pilates", "i"), "Padded bar contact", "A foam-covered bar provides a broad hand-contact surface. Use for supported band movements with the documented terminal straps.", null],
    [new RegExp("THEFITGUY\\ Ultimate\\ Extension", "i"), "Adjustable attachment reach", "D-ring straps extend the working attachment point. Use to position the handle or band for the recorded setup.", null],
    [new RegExp("THEFITGUY\\ Sled", "i"), "Waist-based sled pulling", "The belt and pulling straps connect the sled to the waist. Use for controlled sled pulls with the listed kit connections.", null],
    [new RegExp("Oak\\-Sports", "i"), "Locking connection", "Screw-lock carabiners connect rated hardware in the load path. Close and lock the gate; align the load along the spine.", null],
    [new RegExp("JRSGS", "i"), "Locking connection", "Gate-lock clips close the connection between strap, band and handle. Check the gate and load orientation before every set.", null],
    [new RegExp("Neoprene\\ Cable", "i"), "Bundle organization", "Flexible sleeves keep multi-band arrays together and shield contact points. Wrap the selected bundle without covering inspection points.", null],
    [new RegExp("VEHICLEX", "i"), "Extended anchor reach", "Sleeved webbing brings an anchor point to a D-ring terminal. Use the documented anchor arrangement and inspect the webbing.", null],
    [new RegExp("NILIGHT", "i"), "Soft-loop anchoring", "Webbing loops create a non-marking connection around the structural anchor. Use at the recorded anchor point and inspect the loop before loading.", null],
    [new RegExp("XSTRAP", "i"), "Soft-loop anchoring", "A second webbing-loop option provides non-marking anchor contact. Use only in the documented setup; inspect the webbing and connections.", null],
    [new RegExp("jooeer", "i"), "Targeted rolling", "Nested rollers and a massage stick offer different contact surfaces. Choose the tool and pressure for a comfortable rolling session.", null],
    [new RegExp("MIAOKE", "i"), "Portable gear storage", "A duffel and organizer keep attachments together for transport. Separate hardware and small items into the recorded storage compartments.", null],
    [/carnitine/i, 'Fatty-acid transport', 'Carnitine transports fatty acids into mitochondria for energy metabolism.', 'https://ca.allmaxnutrition.com/products/l-carnitine-liquid/'],
    [/electrolyte|rapidrem/i, 'Fluid & mineral balance', 'Adds electrolytes to the hydration routine.', null],
    [/pink salt|himalayan.*salt/i, 'Sodium supply', 'Sodium supports fluid balance and normal nerve and muscle function.', null],
    [/medjool|dates/i, 'Carbohydrate fuel', 'Dates supply carbohydrates for exercise energy.', null],
    [/filtered water/i, 'Hydration base', 'Water provides the fluid base for this preparation.', null],
    [/medi.?c plus/i, 'Vitamin C & lysine', 'Adds vitamin C and lysine to the recorded evening routine.', null],
    [/pro\s?line.*creatine/i, 'Muscle energy support', 'Creatine participates in energy supply for short, intense muscular efforts.', 'https://prolinenutrition.ca/product/creatine-hcl-120g/'],
    [/bcaa.*hyper|hyper.*bcaa/i, 'Branched-chain amino acids', 'Provides leucine, isoleucine and valine: three essential amino acids.', 'https://ca.perfectsports.com/products/essential-bcaa-growth-and-recovery/'],
    [/vital greens/i, 'Plant-based nutrients', 'Liquid greens blend adds plant ingredients to the daily routine.', 'https://nakapro.com/products/bonus-size-platinum-vital-greens600ml'],
    [/igniter/i, 'Energy & focus', 'Pre-workout formula for alertness and workout preparation.', 'https://www.allmaxnutrition.com/products/allmax-impact-igniter-xtreme-2'],
    [/muscl(?:e)?(?:e)?aa/i, 'Essential amino acids', 'Supplies amino acids for muscle protein synthesis and recovery.', 'https://ca.allmaxnutrition.com/products/muscleaa-xtreme'],
    [/peak\s?o2/i, 'Oxygen use & endurance', 'Performance mushroom blend designed to support exercise endurance.', 'https://compoundsolutions.com/ingredients/peako2/'],
    [/^(?:NOW\s+)?Betaine(?:\s+Anhydrous|$)/i, 'Creatine synthesis support', 'TMG participates in normal cellular reactions, including creatine synthesis.', 'https://www.nowfoods.com/products/sports-nutrition/betaine-powder'],
    [/citrulline/i, 'Nitric oxide support', 'Supports arginine metabolism and blood flow during exercise.', 'https://ca.allmaxnutrition.com/products/citrulline-malate-2-1'],
    [/taurine/i, 'Cellular hydration', 'Supports fluid balance within muscle cells.', 'https://www.allmaxnutrition.com/products/allmax-taurine'],
    [/citicoline/i, 'Attention & focus', 'Choline source that supports cognitive function.', 'https://aor.ca/ingredients/xerenoos-citicoline/'],
    [/(?:impact.*pump|allmax.*pump)/i, 'Stimulant-free pump support', 'Pre-workout formula designed for muscle pumps and focus.', 'https://www.allmaxnutrition.com/products/allmax-impact-pump-xtreme'],
    [/carnivor|beef protein/i, 'Protein for recovery', 'Beef-derived protein supplies muscle-building amino acids.', 'https://musclemedsrx.com/products/carnivor'],
    [/marine collagen/i, 'Collagen peptides', 'Hydrolyzed marine protein adds collagen-derived peptides.', 'https://promisenut.com/products/promise-pure-marine-collagen-525g-powder'],
    [/black maca|gelatinized.*maca/i, 'Plant-based nourishment', 'Gelatinized black maca root adds a plant-based component.', 'https://www.rootalive.com/products/organic-gelatinized-black-maca-powder-200g'],
    [/c defense|c-defense/i, 'Vitamin C support', 'Vitamin C supports immune function and collagen synthesis.', 'https://megafood.com/products/c-defense-gummies'],
    [/biosteel.*protein/i, 'Post-workout protein', 'Protein blend designed to support post-workout recovery.', 'https://biosteel.com/collections/recovery-protein-plus'],
    [/beetroot/i, 'Plant nutrients', 'Beetroot powder adds a whole-food plant ingredient.', 'https://www.rootalive.com/products/oragnic-beetroot-powder-454g'],
    [/sd pharmaceuticals.*creatine/i, 'Muscle energy support', 'Creatine supports the energy system used in brief, intense exercise.', 'https://sdpharmaceuticals.com/en-us/products/creatine-hcl-powder'],
    [/glutamine/i, 'Recovery amino acid', 'Fermented L-glutamine provides amino-acid support for recovery.', 'https://northcoastnaturals.ca/products/fermented-glutamine'],
    [/glycine/i, 'Protein-building amino acid', 'Glycine contributes to proteins, including collagen.', 'https://aor.ca/ingredients/glycine/'],
    [/hey.?\s*relax|niyama/i, 'Evening relaxation', 'Magnesium-based blend designed for a calming evening routine.', 'https://niyama-wellness.ca/products/hey-relax-magnesium-glycinate-powder-fresh-pineapple-flavour']
  ];

  var bubble = document.createElement('div');
  bubble.className = 'ingredient-tip'; bubble.id = 'item-purpose-tip';
  bubble.hidden = true; bubble.setAttribute('role', 'dialog');
  bubble.setAttribute('aria-label', 'Item purpose'); document.body.appendChild(bubble);
  var active = null, timer, restoringFocus = false;
  function close(restore) {
    clearTimeout(timer);
    var previous = active; active = null; bubble.hidden = true;
    if (previous) previous.setAttribute('aria-expanded', 'false');
    if (restore && previous && bubble.contains(document.activeElement)) {
      restoringFocus = true; previous.focus(); restoringFocus = false;
    }
  }
  function position() {
    if (!active) return;
    var r = active.getBoundingClientRect(), b = bubble.getBoundingClientRect();
    var top = r.bottom + 8;
    if (top + b.height > window.innerHeight - 12) top = r.top - b.height - 8;
    bubble.style.left = Math.max(12, Math.min(r.left, window.innerWidth - b.width - 12)) + 'px';
    bubble.style.top = Math.max(12, Math.min(top, window.innerHeight - b.height - 12)) + 'px';
  }
  function show(button, matches) {
    close(); active = button; button.setAttribute('aria-expanded', 'true');
    bubble.replaceChildren();
    var dismiss = document.createElement('button'); dismiss.type = 'button';
    dismiss.className = 'ingredient-tip__close'; dismiss.textContent = '×';
    dismiss.setAttribute('aria-label', 'Close item purpose');
    dismiss.addEventListener('click', function() { close(true); }); bubble.appendChild(dismiss);
    matches.forEach(function (f) {
      var block = document.createElement('div'), title = document.createElement('strong'), text = document.createElement('p');
      title.textContent = f[1]; text.textContent = f[2]; block.append(title, text);
      if (f[3]) {
        var link = document.createElement('a'); link.textContent = f[3].indexOf('ods.od.nih.gov') >= 0 ? 'Product label ↗' : 'Product details ↗';
        link.href = f[3]; link.target = '_blank'; link.rel = 'noopener noreferrer'; block.appendChild(link);
      }
      bubble.appendChild(block);
    });
    bubble.hidden = false; position();
  }
  function scheduleClose() {
    clearTimeout(timer);
    timer = setTimeout(function() { if (document.activeElement !== active && !bubble.contains(document.activeElement)) close(); }, 220);
  }
  var selector = '.hud-list > li, .vec-ingredients > li, .ing-list > li, .gear-item .card__title, .gear-bundle__name, .nut-meal[aria-label], .item-facts-table tbody tr > td:first-child';
  document.querySelectorAll(selector).forEach(function (row) {
    if (row.matches('.ing--group, .ing--note, .ing--aside')) return;
    var name = row.querySelector('.ing__name'), bold = row.querySelector('b');
    var text = row.getAttribute('aria-label') || (name ? name.textContent : (row.matches('.hud-list > li') && bold ? bold.textContent : row.textContent));
    var matches = facts.filter(function (f) { return f[0].test(text); });
    // A product may have both a specific entry and a generic ingredient entry.
    matches = matches.filter(function(f, i) { return matches.findIndex(function(g) { return g[1] === f[1]; }) === i; });
    if (!matches.length) return;
    var host = row, surface = row, button = document.createElement('button');
    button.type = 'button'; button.className = 'ingredient-info'; button.textContent = 'i';
    button.setAttribute('aria-label', 'Item purpose: ' + text.trim());
    button.setAttribute('aria-controls', bubble.id); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('data-purpose-keys', matches.map(function(f) { return facts.indexOf(f); }).join(','));
    // Keep controls beside a linked meal image, never nested inside its link.
    if (row.matches('.nut-meal[aria-label]')) {
      host = row.parentElement.querySelector('.item-caption');
      if (!host) return;
      surface = host;
    }
    host.appendChild(button); host.classList.add('ingredient-row');
  });
  // Delegation keeps copied carousel cards interactive after a resize or loop rebuild.
  function fromButton(button) {
    var matches = button.getAttribute('data-purpose-keys').split(',').map(function(k) { return facts[Number(k)]; });
    show(button, matches);
  }
  document.addEventListener('pointerover', function(e) {
    if (e.pointerType !== 'mouse') return;
    var row = e.target.closest('.ingredient-row');
    if (!row || (e.relatedTarget && row.contains(e.relatedTarget))) return;
    var button = row.querySelector('.ingredient-info[data-purpose-keys]');
    if (button) fromButton(button);
  });
  document.addEventListener('pointerout', function(e) {
    var row = e.target.closest('.ingredient-row');
    if (row && (!e.relatedTarget || !row.contains(e.relatedTarget))) scheduleClose();
  });
  document.addEventListener('click', function(e) {
    var button = e.target.closest('.ingredient-info[data-purpose-keys]');
    if (button) { e.stopPropagation(); fromButton(button); }
  });
  bubble.addEventListener('pointerenter', function() { clearTimeout(timer); });
  bubble.addEventListener('pointerleave', scheduleClose);
  document.addEventListener('pointerdown', function(e) { if (active && !bubble.contains(e.target) && e.target !== active) close(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(true); });
  document.addEventListener('focusin', function(e) {
    if (e.target.matches('.ingredient-info[data-purpose-keys]') && !restoringFocus) fromButton(e.target);
    else if (active && e.target !== active && !bubble.contains(e.target)) close();
  });
  window.addEventListener('scroll', function() { close(); }, {passive:true});
  window.addEventListener('resize', position);
})();
