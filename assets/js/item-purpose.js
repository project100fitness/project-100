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
    [new RegExp("testofx", "i"), "Botanical vitality blend", "TestoFX combines botanical extracts for the manufacturer’s male-vitality purpose. This is a multi-ingredient formula, distinct from a single mineral or amino acid; its morning position is the recorded routine, not an immediate pre-workout effect.", "https://ca.allmaxnutrition.com/products/testofx"],
    [new RegExp("boron", "i"), "Trace mineral", "Boron is a trace element studied in calcium, vitamin D and bone-mineral metabolism. The morning capsule supplies the recorded mineral amount; timing here is a routine anchor rather than a required workout window.", "https://www.newrootsherbal.com/index.php/shop/boron"],
    [new RegExp("lactobif", "i"), "Probiotic cultures", "LactoBif supplies live bacterial strains intended to support the intestinal microbiome and digestive function. Strain identity and viable count define the formula; the intermittent wake placement follows the recorded schedule.", "https://www.iherb.com/pr/p/69435"],
    [new RegExp("kyolic|aged garlic", "i"), "Aged garlic & lecithin", "Aged garlic supplies sulfur-containing compounds for the manufacturer’s cardiovascular-support purpose; Formula 104 also includes lecithin. This meal-time botanical formula differs from omega-3 oil, which supplies membrane fatty acids.", "https://kyolic.com/product/kyolic-formula-104/"],
    [new RegExp("\\bnac\\b|n-acetyl.*cysteine", "i"), "Glutathione precursor", "NAC provides cysteine used in the body’s antioxidant system.", "https://www.pureencapsulationspro.com/our-products/all-products/nac-n-acetyl-l-cysteine-900-mg.html"],
    [new RegExp("\\bnmn\\b", "i"), "NAD+ precursor", "NMN is a building block for the coenzyme NAD+, involved in cellular metabolism.", "https://api.ods.od.nih.gov/staging-s3/pdf/318843.pdf"],
    [new RegExp("digestive enzymes ultra", "i"), "Meal digestion", "Vegetarian enzymes support protein, carbohydrate, fat, fiber and dairy digestion.", "https://www.pureencapsulationspro.com/digestive-enzymes-ultra"],
    [new RegExp("puregenomics", "i"), "Daily micronutrients", "Vitamins and minerals provide enzyme cofactors for energy metabolism and normal tissue function. PureGenomics is the broad micronutrient formula in the meal grid; it is distinct from the separate calcium or magnesium dose.", "https://www.pureencapsulationspro.com/puregenomics-multivitamin-60-s-improved.html"],
    [new RegExp("canprev.*calcium|calcium malate", "i"), "Calcium supply", "Calcium provides bone mineral and supports muscle contraction and nerve signaling. CanPrev’s malate-based capsule is counted as elemental calcium. Its conditional afternoon placement separates the recorded mineral servings; calcium does not universally block magnesium.", "https://canprev.ca/products/calcium-malate-bis%C2%B7glycinate-200/"],
    [new RegExp("omega.?800", "i"), "EPA & DHA", "EPA and DHA become components of cell membranes and participate in lipid-signaling pathways. Omega 800 is a concentrated fish-oil formula; its meal placement groups the oil with food rather than with the pre-workout ingredients.", "https://www.iherb.com/c/cgn-omega-800"],
    [new RegExp("liver[ -]g\\.?i\\.?|liver gi", "i"), "Liver & digestive support", "The Liver-GI blend combines nutrients and botanicals for the manufacturer’s liver and gastrointestinal-support purpose, including support of normal metabolic processing. Its conditional meal-grid placement is separate from enzymes that directly break down food.", "https://www.pureencapsulationspro.com/media/pdf_upload/Pure_PIS_LiverGIDetox.pdf"],
    [new RegExp("uricare", "i"), "Urinary wellness", "UriCare is a botanical formula intended to support normal urinary flow and bladder function. It belongs to the daily urinary-support grid, rather than the hydration or workout electrolyte blend.", "https://himalayausa.com/products/uricare"],
    [new RegExp("kitabio|pumpkin seed.*saw palmetto", "i"), "Seed oil & botanicals", "Pumpkin seed oil and saw palmetto form a botanical blend intended for urinary and prostate wellness. Its softgel matrix is distinct from EPA/DHA fish oil; the recorded meal-time placement groups the oils with food.", null],
    [new RegExp("curcumin", "i"), "Antioxidant support", "Curcuminoids participate in antioxidant and inflammatory-signaling pathways. The recorded Curcumin 500 formula includes BioPerine to support absorption; its meal placement concerns the formula, not an acute training boost.", "https://www.pureencapsulationspro.com/curcumin-500-with-bioperine.html"],
    [new RegExp("magnesium glycinate", "i"), "Muscle & nerve function", "Magnesium supports ATP-dependent enzymes, nerve signaling and muscle function; glycinate identifies the glycine-bound form. The recorded evening placement separates mineral servings and anchors the night routine. It is not a universal calcium–magnesium incompatibility.", "https://www.pureencapsulationspro.com/our-products/all-products/magnesium-glycinate.html"],
    [new RegExp("tart cherry", "i"), "Fruit-derived antioxidants", "Tart cherry supplies anthocyanin-rich fruit compounds for the manufacturer’s recovery and evening-rest purpose. It is a botanical extract, distinct from magnesium’s mineral role or glycine’s amino-acid role.", "https://organika.com/products/tart-cherry"],
    [new RegExp("milk thistle", "i"), "Botanical support", "Milk thistle contains silymarin, a group of compounds studied for antioxidant and cellular-protective activity. Its intended role is liver support; the recorded capsule remains an optional night-stage item.", null],
    [new RegExp("beef liver|higher health", "i"), "Food-based micronutrients", "Beef liver supplies a food-based matrix including vitamin B12, preformed vitamin A and iron, supporting blood-cell formation and nutrient metabolism. It is a micronutrient capsule, distinct from the gram-level beef protein used in shakes.", "https://www.higherhealths.com/products/beef-liver"],
    [new RegExp("ligament restore", "i"), "Connective-tissue support", "Ligament Restore combines connective-tissue nutrients, including glucosamine-related support for the proteoglycan matrix. Its purpose concerns ligaments and joint-supporting tissues; it complements collagen peptides rather than replacing a muscle-protein serving.", "https://www.pureencapsulationspro.com/ligament-restore.html"],
    [new RegExp("r[ -]lipoic|r-ala", "i"), "Antioxidant & metabolic support", "R-lipoic acid participates in mitochondrial metabolism and antioxidant processes.", "https://aor.ca/product/high-dose-r-lipoic-acid/"],
    [new RegExp("hibiscus", "i"), "Warm herbal base", "Hibiscus supplies a caffeine-free fluid base and plant polyphenols. In V10 it provides the evening drink vehicle; the separate amino acids and creatine retain their own functions.", null],
    [new RegExp("^water$|(?:cold|room-temperature).*water", "i"), "Hydration base", "Water supplies the solvent for mixing and supports blood volume, temperature regulation and fluid balance. It carries the ingredients without adding a protein, mineral or stimulant dose.", null],
    [new RegExp("^medi-c(?:$|\\s|\\()", "i"), "Vitamin C & lysine", "Vitamin C is a cofactor for collagen-forming enzymes; lysine is an amino-acid building block. Medi-C’s magnesium-ascorbate version also contributes magnesium to the daily total, so this optional night addition must be counted with the other mineral servings.", "https://assurednatural.com/brands/"],
    [new RegExp("^choline$", "i"), "Choline source", "Choline is a building block for cell membranes and acetylcholine.", null],
    [new RegExp("^tyrosine$", "i"), "Neurotransmitter precursor", "Tyrosine is used to make catecholamine neurotransmitters.", null],
    [new RegExp("^theanine$", "i"), "Tea-derived amino acid", "Theanine is a tea-associated amino acid included for relaxed attention. Within the pre-workout blend it serves a different purpose from caffeine’s adenosine-blocking alertness effect.", null],
    [new RegExp("^dmae$", "i"), "Formula-native component", "DMAE is a choline-related compound included for the formula’s focus purpose. Its presence is counted within the pre-workout matrix, separately from the citicoline capsule.", null],
    [new RegExp("^huperzine", "i"), "Formula-native component", "Huperzine-A inhibits acetylcholinesterase, the enzyme that breaks down acetylcholine. It is a formula-native focus ingredient; V1 and V6 are alternative branches so their amounts do not stack.", null],
    [new RegExp("^bacopa$", "i"), "Botanical component", "Bacopa contains bacosides and is included for cognitive support. It is a botanical component of the focus matrix, distinct from the immediate alertness role of caffeine.", null],
    [new RegExp("^juniper$", "i"), "Botanical component", "Juniper is a botanical traditionally used for digestive and urinary support. Within this formula it has a botanical role, distinct from the stimulant and nitric-oxide ingredients.", null],
    [new RegExp("^l-?arginine|^arginine$", "i"), "Nitric oxide precursor", "Arginine participates in nitric oxide production.", null],
    [new RegExp("^glycerpump", "i"), "Glycerol component", "Glycerol is an osmolyte involved in fluid retention and cellular hydration. GlycerPump supplies this hydration-focused component of the pump formula, distinct from the nitric-oxide ingredients.", null],
    [new RegExp("^nitrovascine", "i"), "Pump-formula blend", "NitroVascine is the recorded inositol-stabilized arginine-silicate ingredient. Its intended role is arginine availability and nitric-oxide support within the stimulant-free pump matrix.", null],
    [new RegExp("^sodium$", "i"), "Fluid balance", "Sodium contributes to fluid balance and normal nerve and muscle function.", null],
    [new RegExp("roasted kasha|^kasha", "i"), "Carbohydrate base", "Buckwheat starch supplies glucose for energy and glycogen replenishment, while its fiber contributes meal structure and digestive bulk. Kasha serves the carbohydrate-food role in the meal.", null],
    [new RegExp("^almond butter", "i"), "Portioned fats", "Almond butter supplies energy-dense fats plus some protein and fiber. Its role is a portioned nut-food contribution, distinct from the meal’s main protein or carbohydrate base.", null],
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
    [/electrolyte|rapidrem/i, 'Fluid & mineral balance', "Electrolytes supply charged minerals for fluid distribution, nerve impulses and muscle contraction. Sodium, potassium, magnesium and calcium have different roles; the selected product’s label determines the actual mineral mix.", null],
    [/pink salt|himalayan.*salt/i, 'Sodium supply', 'Sodium supports fluid balance and normal nerve and muscle function.', null],
    [/medjool|dates/i, 'Carbohydrate fuel', 'Dates supply carbohydrates for exercise energy.', null],
    [/filtered water/i, 'Hydration base', "Water supplies the solvent for mixing and supports blood volume, temperature regulation and fluid balance. It carries the ingredients without adding a protein, mineral or stimulant dose.", null],
    [/medi.?c plus/i, 'Vitamin C & lysine', "Vitamin C is a cofactor for collagen-forming enzymes; lysine is an amino-acid building block. Medi-C’s magnesium-ascorbate version also contributes magnesium to the daily total, so this optional night addition must be counted with the other mineral servings.", null],
    [/pro\s?line.*creatine/i, 'Muscle energy support', 'Creatine participates in energy supply for short, intense muscular efforts.', 'https://prolinenutrition.ca/product/creatine-hcl-120g/'],
    [/bcaa.*hyper|hyper.*bcaa/i, 'Branched-chain amino acids', 'Provides leucine, isoleucine and valine: three essential amino acids.', 'https://ca.perfectsports.com/products/essential-bcaa-growth-and-recovery/'],
    [/vital greens/i, 'Plant-based nutrients', "NAKA Vital Greens combines plant ingredients, herbs and micronutrients for daily nutritional support. It serves the plant-and-micronutrient role, distinct from the shake’s protein and collagen; the separate glass follows the recorded preparation.", 'https://nakapro.com/products/bonus-size-platinum-vital-greens600ml'],
    [/igniter/i, 'Energy & focus', "Igniter combines caffeine-driven alertness with amino-acid and focus ingredients. Caffeine blocks adenosine signaling; citrulline supports nitric oxide and beta-alanine builds muscle carnosine. Count the complete branded matrix alongside any added ingredients.", 'https://www.allmaxnutrition.com/products/allmax-impact-igniter-xtreme-2'],
    [/muscl(?:e)?(?:e)?aa/i, 'Essential amino acids', 'Supplies amino acids for muscle protein synthesis and recovery.', 'https://ca.allmaxnutrition.com/products/muscleaa-xtreme'],
    [/peak\s?o2/i, 'Oxygen use & endurance', "PeakO2 is a six-mushroom blend designed by its supplier to support oxygen utilization and exercise work capacity. This endurance-focused matrix differs from caffeine’s alertness and creatine’s short-effort energy role.", 'https://compoundsolutions.com/ingredients/peako2/'],
    [/^(?:NOW\s+)?Betaine(?:\s+Anhydrous|$)/i, 'Creatine synthesis support', "Betaine (TMG) donates methyl groups in normal metabolism, including creatine synthesis, and acts as an osmolyte for cell-fluid balance. Count the formula-native and added amounts together.", 'https://www.nowfoods.com/products/sports-nutrition/betaine-powder'],
    [/citrulline/i, 'Nitric oxide support', 'Supports arginine metabolism and blood flow during exercise.', 'https://ca.allmaxnutrition.com/products/citrulline-malate-2-1'],
    [/taurine/i, 'Cellular hydration', 'Supports fluid balance within muscle cells.', 'https://www.allmaxnutrition.com/products/allmax-taurine'],
    [/citicoline/i, 'Attention & focus', "Citicoline supplies choline and cytidine for acetylcholine synthesis and membrane phospholipids. The separate capsule is the recorded pre-training primer; formula-native choline ingredients remain part of the same daily accounting.", 'https://aor.ca/ingredients/xerenoos-citicoline/'],
    [/(?:impact.*pump|allmax.*pump)/i, 'Stimulant-free pump support', "Impact Pump combines nitric-oxide precursors, osmolytes and focus ingredients without caffeine. Citrulline/arginine support the blood-flow pathway; glycerol, taurine and betaine address fluid balance. Count native creatine and added ingredients separately.", 'https://www.allmaxnutrition.com/products/allmax-impact-pump-xtreme'],
    [/carnivor|beef protein/i, 'Protein for recovery', "Carnivor’s beef-derived protein supplies amino acids for tissue repair and muscle-protein synthesis. Its dairy-free matrix differs from milk-derived whey and from collagen’s connective-tissue amino-acid pattern. Use the recorded Canadian serving label for protein and creatine accounting.", 'https://musclemedsrx.com/products/carnivor'],
    [/marine collagen|promise.*collagen/i, 'Collagen peptides', "PROMISE uses fish-derived Peptan type I collagen peptides. Hydrolysis produces smaller peptides supplying glycine, proline and hydroxyproline for connective-tissue turnover in skin, tendons and bone. Marine describes the source, not a universal advantage over bovine; this matrix complements the main muscle-protein serving.", 'https://promisenut.com/products/promise-pure-marine-collagen-525g-powder'],
    [/black maca|gelatinized.*maca/i, 'Plant-based nourishment', "Gelatinized black maca is processed root powder with starch reduced by gelatinization. The manufacturer positions it for vitality; it adds a food-and-plant-nutrient matrix rather than caffeine, a complete protein serving or a direct hormone replacement.", 'https://www.rootalive.com/products/organic-gelatinized-black-maca-powder-200g'],
    [/c defense|c-defense/i, 'Vitamin C support', 'Vitamin C supports immune function and collagen synthesis.', 'https://megafood.com/products/c-defense-gummies'],
    [/biosteel.*protein/i, 'Post-workout protein', "BioSteel Recovery Protein Plus combines three protein sources, including whey isolate, with carbohydrates and recovery factors. Protein supplies repair amino acids; carbohydrate supplies glycogen fuel. This mixed recovery matrix differs from plain whey isolate or the dairy-free Carnivor serving.", 'https://biosteel.com/collections/recovery-protein-plus'],
    [/beetroot/i, 'Plant nutrients', "Beetroot supplies plant compounds and dietary nitrate, which can enter the nitrate → nitrite → nitric-oxide pathway for blood-flow support. Nitrate content varies with the powder; grams of beetroot are not grams of nitrate.", 'https://www.rootalive.com/products/oragnic-beetroot-powder-454g'],
    [/sd pharmaceuticals.*creatine/i, 'Muscle energy support', 'Creatine supports the energy system used in brief, intense exercise.', 'https://sdpharmaceuticals.com/en-us/products/creatine-hcl-powder'],
    [/glutamine/i, 'Recovery amino acid', "Glutamine carries nitrogen between tissues and serves as a fuel for intestinal and immune cells. The fermented L-glutamine in V10 is an evening amino-acid component, distinct from complete meal protein or collagen peptides.", 'https://northcoastnaturals.ca/products/fermented-glutamine'],
    [/glycine/i, 'Protein-building amino acid', "Glycine is used in collagen and glutathione synthesis and acts in inhibitory nerve signaling. V10 uses this separate amino acid for its evening purpose; collagen also supplies glycine within a peptide matrix.", 'https://aor.ca/ingredients/glycine/'],
    [/hey.?\s*relax|niyama/i, 'Evening relaxation', 'Magnesium-based blend designed for a calming evening routine.', 'https://niyama-wellness.ca/products/hey-relax-magnesium-glycinate-powder-fresh-pineapple-flavour']
    ,[/bovine collagen/i, 'Bovine collagen peptides', 'Bovine identifies a cattle-derived source. Hydrolyzed peptides supply connective-tissue amino acids; the tissue and product determine the collagen types. Source alone does not make it interchangeable with a complete muscle-protein serving.', 'https://www.peptan.com/bovine-collagen/']
    ,[/casein|skyr/i, 'Milk-protein matrix', 'Casein is a milk protein digested more gradually than whey. Skyr contributes a cultured dairy-protein food matrix; these serve the recorded evening protein meal, with other ingredients determining its carbohydrate and fat balance.', null]
    ,[/whey(?: protein)? isolate/i, 'Concentrated dairy protein', 'Whey isolate concentrates milk protein while reducing much of its fat and lactose. It supplies essential amino acids for muscle-protein synthesis; a branded recovery blend may additionally contain carbohydrates or other protein sources.', null]
    ,[/^potassium$/i, 'Fluid and electrical balance', 'Potassium is the major intracellular electrolyte. It supports fluid distribution, nerve impulses and normal muscle contraction; the product label defines the amount supplied.', null]
    ,[/^magnesium$/i, 'Enzyme and muscle function', 'Magnesium supports ATP-dependent enzymes and normal nerve and muscle function. Elemental magnesium is the amount counted; the compound form and total supplemental intake are separate considerations.', null]
    ,[/^calcium$/i, 'Bone and contraction signaling', 'Calcium supplies bone mineral and participates in contraction and nerve signaling. Count elemental calcium across food and supplements; serving size and chemical form affect absorption.', null]
    ,[/^zinc$/i, 'Protein and enzyme metabolism', 'Zinc supports numerous enzymes, protein synthesis and normal immune function. It is a micronutrient contribution rather than an immediate stimulant or muscle-fuel source.', null]
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
