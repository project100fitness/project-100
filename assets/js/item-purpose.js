/* Shared item facts: biological roles, evidence limits and practical food/gear functions. */
(function () {
  'use strict';
  var facts = [
    [/^Juggernaut$/i, 'Chest & pressing', 'The recorded 3 × 85 lb bundle is used for chest presses and horizontal pushing.', null],
    [/^Titan$/i, 'Rows & lat work', 'The recorded 3 × 65 lb bundle is used for back-focused pulling.', null],
    [/^Enforcer$/i, 'Triceps work', 'The recorded 3 × 55 lb bundle is used for press-downs and extensions.', null],
    [/^Viper$/i, 'Drop sets & finishers', 'The recorded 3 × 45 lb bundle is the reserve option for drop sets and finishers.', null],
    [/^Scalpel$/i, 'Deltoid isolation', 'The recorded 3 × 35 lb bundle is used for precise shoulder isolation and warm-up work.', null],
    [/^Twin Cobras$/i, 'Unilateral curls', 'Two separate 75 lb bands provide one band per hand for the recorded curl setup.', null],
    [new RegExp("testofx", "i"), "Botanical vitality blend", "TestoFX combines fenugreek, ashwagandha and other botanicals with boron and compounds such as DIM. These are studied for stress and hormone-related pathways, but ingredient mechanisms do not establish a testosterone increase or muscle gain from the complete blend. This is your recorded daily botanical stage; morning timing itself is not a proven mechanism.", "https://ca.allmaxnutrition.com/products/testofx"],
    [new RegExp("boron", "i"), "Trace mineral", "Boron is a trace element studied in calcium, vitamin D and bone-mineral metabolism. The morning capsule supplies the recorded mineral amount; timing here is a routine anchor rather than a required workout window.", "https://www.newrootsherbal.com/index.php/shop/boron"],
    [new RegExp("lactobif", "i"), "Probiotic cultures", "LactoBif supplies live bacterial strains intended to support the intestinal microbiome and digestive function. Strain identity and viable count define the formula; the intermittent wake placement follows the recorded schedule.", "https://www.iherb.com/pr/p/69435"],
    [new RegExp("kyolic|aged garlic", "i"), "Aged garlic & lecithin", "Aged garlic provides sulfur compounds, including S-allyl cysteine, studied for vascular and antioxidant effects. Lecithin supplies phospholipids used in cell membranes. This is the meal-linked cardiovascular-support item; it does not provide the EPA/DHA supplied by fish oil.", "https://kyolic.com/product/kyolic-formula-104/"],
    [new RegExp("\\bnac\\b|n-acetyl.*cysteine", "i"), "Glutathione precursor", "NAC supplies cysteine, one of the three amino acids used to make glutathione. Glutathione participates in cellular redox balance and peroxide handling. Its routine role is antioxidant substrate supply; this mechanism alone does not establish faster muscle recovery.", "https://www.pureencapsulationspro.com/our-products/all-products/nac-n-acetyl-l-cysteine-900-mg.html"],
    [new RegExp("\\bnmn\\b", "i"), "NAD+ precursor", "NMN is converted into NAD+, a coenzyme that transfers electrons during energy metabolism and is consumed by enzymes involved in DNA repair and cell signaling. Raising a precursor is not proof of greater strength, longevity or muscle growth in humans.", "https://api.ods.od.nih.gov/staging-s3/pdf/318843.pdf"],
    [new RegExp("digestive enzymes ultra", "i"), "Meal digestion", "Proteases split proteins into smaller peptides, amylase breaks down starch, lipase acts on fats and lactase splits lactose. The blend acts on food in the digestive tract, which explains its meal placement. It is not a muscle-building signal or a substitute for adequate food intake.", "https://www.pureencapsulationspro.com/digestive-enzymes-ultra"],
    [new RegExp("puregenomics", "i"), "Daily micronutrients", "Vitamins and minerals provide enzyme cofactors for energy metabolism and normal tissue function. PureGenomics is the broad micronutrient formula in the meal grid; it is distinct from the separate calcium or magnesium dose.", "https://www.pureencapsulationspro.com/puregenomics-multivitamin-60-s-improved.html"],
    [new RegExp("canprev.*calcium|calcium malate", "i"), "Calcium supply", "Calcium provides bone mineral and supports muscle contraction and nerve signaling. CanPrev’s malate-based capsule is counted as elemental calcium. Its conditional afternoon placement separates the recorded mineral servings; calcium does not universally block magnesium.", "https://canprev.ca/products/calcium-malate-bis%C2%B7glycinate-200/"],
    [new RegExp("omega.?800", "i"), "EPA & DHA", "EPA and DHA become components of cell membranes and participate in lipid-signaling pathways. Omega 800 is a concentrated fish-oil formula; its meal placement groups the oil with food rather than with the pre-workout ingredients.", "https://www.iherb.com/c/cgn-omega-800"],
    [new RegExp("liver[ -]g\\.?i\\.?|liver gi", "i"), "Liver & digestive support", "The recorded Liver-GI blend includes NAC for glutathione synthesis, alpha-lipoic acid for redox metabolism, glycine/taurine/methionine for liver conjugation pathways, and glutamine as intestinal-cell fuel. Its botanicals include silymarin, curcumin and broccoli-sprout compounds. These explain its intended metabolic role; they do not demonstrate that the blend removes unspecified toxins or repairs liver disease.", "https://www.pureencapsulationspro.com/media/pdf_upload/Pure_PIS_LiverGIDetox.pdf"],
    [new RegExp("uricare", "i"), "Urinary wellness", "UriCare is the botanical urinary-support item in your routine. Its proposed actions concern urinary flow and bladder function; a reliable clinical mechanism and benefit for the complete blend are not established here. It should not be presented as a way to replace sweat minerals or improve muscle growth.", "https://himalayausa.com/products/uricare"],
    [new RegExp("kitabio|pumpkin seed.*saw palmetto", "i"), "Seed oil & botanicals", "Pumpkin seed oil supplies fatty acids and phytosterols; saw palmetto supplies fatty acids studied in prostate-related hormone pathways. This explains the intended urinary/prostate role, but trials of saw palmetto alone show little or no benefit for enlarged-prostate symptoms. The combination is not equivalent to proven symptom treatment.", "https://www.nccih.nih.gov/health/saw-palmetto"],
    [new RegExp("curcumin", "i"), "Antioxidant support", "Curcuminoids are studied for effects on inflammatory and redox signaling. BioPerine supplies piperine to change absorption, so this is a formulated botanical supplement rather than turmeric used as food. Human benefits vary by condition and preparation; reduced soreness or greater muscle growth is not guaranteed.", "https://www.nccih.nih.gov/health/turmeric"],
    [new RegExp("magnesium glycinate", "i"), "Muscle & nerve function", "Magnesium supports ATP-dependent enzymes, nerve signaling and muscle function; glycinate identifies the glycine-bound form. It participates in energy reactions and calcium/potassium transport across membranes. Evening placement is your routine anchor, not proof of a sedative effect; count elemental magnesium across all servings.", "https://www.pureencapsulationspro.com/our-products/all-products/magnesium-glycinate.html"],
    [new RegExp("tart cherry", "i"), "Fruit-derived antioxidants", "Tart cherry supplies anthocyanins and other polyphenols studied for exercise-related soreness and sleep outcomes. Studies use different juices, concentrates and extracts, so results cannot automatically be transferred to this capsule. Its recorded role is evening recovery support; it does not supply the ATP-related function of magnesium.", "https://organika.com/products/tart-cherry"],
    [new RegExp("milk thistle", "i"), "Botanical support", "Milk thistle supplies silymarin, a mixture studied for redox and cell-signaling effects. This explains its intended liver-support role, but human evidence for treating liver conditions is inconclusive. The optional night capsule is not evidence of detoxification or faster training recovery.", "https://www.nccih.nih.gov/health/milk-thistle"],
    [new RegExp("beef liver|higher health", "i"), "Food-based micronutrients", "Beef liver supplies a food-based matrix including vitamin B12, preformed vitamin A and iron, supporting blood-cell formation and nutrient metabolism. It is a micronutrient capsule, distinct from the gram-level beef protein used in shakes.", "https://www.higherhealths.com/products/beef-liver"],
    [new RegExp("ligament restore", "i"), "Connective-tissue support", "The recorded joint formula combines nutrients intended for connective-tissue turnover. Glucosamine participates in pathways producing glycosaminoglycans, components of the cartilage and proteoglycan matrix. Supplying an ingredient does not prove that the blend rebuilds ligaments or prevents injury; this complements the connective-tissue stage of the routine.", "https://www.pureencapsulationspro.com/ligament-restore.html"],
    [new RegExp("r[ -]lipoic|r-ala", "i"), "Antioxidant & metabolic support", "Lipoic acid is a cofactor in mitochondrial enzyme complexes that process fuel for energy. It also participates in redox reactions. The recorded R-ALA capsule belongs to the metabolic-support stage; its biological role is not proof of extra glucose disposal, fat loss or muscle gain from the dose.", "https://aor.ca/product/high-dose-r-lipoic-acid/"],
    [new RegExp("hibiscus", "i"), "Warm herbal base", "Hibiscus supplies a caffeine-free fluid base and plant polyphenols. In V10 it provides the evening drink vehicle; the separate amino acids and creatine retain their own functions.", null],
    [new RegExp("^water$|(?:cold|room-temperature).*water", "i"), "Hydration base", "Water supplies the solvent for mixing and supports blood volume, temperature regulation and fluid balance. It carries the ingredients without adding a protein, mineral or stimulant dose.", null],
    [new RegExp("^medi-c(?:$|\\s|\\()", "i"), "Vitamin C & lysine", "Vitamin C is a cofactor for collagen-forming enzymes; lysine is an amino-acid building block. Medi-C’s magnesium-ascorbate version also contributes magnesium to the daily total, so this optional night addition must be counted with the other mineral servings.", "https://assurednatural.com/brands/"],
    [new RegExp("^choline$", "i"), "Choline source", "Choline is used to make phosphatidylcholine for cell membranes and acetylcholine for nerve signaling, including the signal from motor nerves to muscle. It can also be converted to betaine for methyl-group metabolism. Formula-native choline and the separate citicoline capsule belong to the same intake accounting.", null],
    [new RegExp("^tyrosine$", "i"), "Neurotransmitter precursor", "Tyrosine is a precursor of dopamine, noradrenaline and adrenaline. These chemicals participate in attention and the stress response. The focus formula supplies substrate for these pathways; extra tyrosine does not automatically increase neurotransmitter release or training performance.", null],
    [new RegExp("^theanine$", "i"), "Tea-derived amino acid", "Theanine is a tea-associated amino acid included for relaxed attention. Within the pre-workout blend it serves a different purpose from caffeine’s adenosine-blocking alertness effect.", null],
    [new RegExp("^dmae$", "i"), "Formula-native component", "DMAE is structurally related to choline and is included in the focus blend. A reliable cognitive or training benefit from oral DMAE has not been established. Count it as part of the formula rather than describing it as a proven source of acetylcholine or alertness.", null],
    [new RegExp("^huperzine", "i"), "Formula-native component", "Huperzine-A inhibits acetylcholinesterase, the enzyme that breaks down acetylcholine. It is a formula-native focus ingredient; V1 and V6 are alternative branches so their amounts do not stack.", null],
    [new RegExp("^bacopa$", "i"), "Botanical component", "Bacopa supplies bacosides studied in memory-related processes. Human studies generally examine repeated use over weeks, not an immediate workout effect. Its role in the formula is intended cognitive support; it should not be described as an acute stimulant.", null],
    [new RegExp("^juniper$", "i"), "Botanical component", "Juniper contains aromatic plant compounds and has traditional digestive and urinary uses. There is no established workout-performance mechanism for its amount in this blend. It is a recorded botanical component; its presence should not imply better hydration, strength or recovery.", null],
    [new RegExp("^l-?arginine|^arginine$", "i"), "Nitric oxide precursor", "Arginine is the substrate nitric-oxide synthase uses to make nitric oxide, which signals blood vessels to relax. It also participates in the urea cycle. This explains its intended pump role, but oral arginine does not reliably improve exercise performance in trials.", null],
    [new RegExp("^glycerpump", "i"), "Glycerol component", "Glycerol is an osmolyte: when taken with fluid it can promote water retention. That explains the hydration role of GlycerPump in the formula, rather than nitric-oxide production. The effect depends on fluid intake and dose; retained water does not represent new muscle tissue.", null],
    [new RegExp("^nitrovascine", "i"), "Pump-formula blend", "NitroVascine is the recorded inositol-stabilized arginine-silicate ingredient. Its intended role is arginine availability and nitric-oxide support within the stimulant-free pump matrix.", null],
    [new RegExp("^sodium$", "i"), "Fluid balance", "Sodium is the main electrolyte outside cells. It helps maintain fluid volume and generates the electrical changes used by nerves and muscles. Count sodium from salt, food and formula ingredients together; sodium-driven water changes are not new muscle tissue.", null],
    [new RegExp("roasted kasha|^kasha", "i"), "Carbohydrate base", "Buckwheat starch supplies glucose for energy and glycogen replenishment, while its fiber contributes meal structure and digestive bulk. Kasha serves the carbohydrate-food role in the meal.", null],
    [new RegExp("^almond butter", "i"), "Portioned fats", "Almond butter provides energy-dense fats, some protein and fiber. Dietary fats supply fuel and fatty acids used in cell membranes; portion size makes a substantial difference to meal calories. It complements the meal rather than replacing its main protein serving.", null],
    [new RegExp("^zero-sugar syrup", "i"), "Flavor & consistency", "Adds sweetness to make the recorded meal easy to repeat.", null],
    [new RegExp("^earl grey", "i"), "Morning tea", "Earl Grey supplies tea-derived caffeine, which blocks adenosine receptors and can reduce perceived fatigue, plus tea polyphenols. Caffeine intake varies with brewing and serving size. Count it with the workout formulas when assessing the daily stimulant total.", null],
    [new RegExp("protein berries smoothie", "i"), "Protein & fruit", "Protein supplies amino acids for tissue repair and muscle-protein synthesis; fruit supplies carbohydrate for energy, plus fiber and micronutrients. This smoothie combines those roles in one meal. The recipe and portions determine whether it meets the intended protein and calorie contribution.", null],
    [new RegExp("anabolic recovery bowl", "i"), "Composed recovery meal", "Chickpeas contribute starch, fiber and plant protein; vegetables add volume and micronutrients. Carbohydrate supports glycogen replenishment and protein supplies repair amino acids. The name “anabolic” does not establish a special growth effect beyond the meal’s actual nutrients and training context.", null],
    [new RegExp("dark choco blueberry recovery", "i"), "Oats & berries", "Oats supply starch for energy and glycogen replenishment and beta-glucan fiber for digestive function. Berries contribute fiber and polyphenols. This is the carbohydrate-and-plant-food portion of the recipe; its protein contribution comes from the listed protein ingredients.", null],
    [new RegExp("post-workout protein wrap", "i"), "Portable protein meal", "The listed protein filling supplies repair amino acids; the wrap contributes carbohydrate for energy and glycogen replenishment. Vegetables and sauces alter fiber, fats and sodium. The practical purpose is a portable post-training meal with portions that can be counted.", null],
    [new RegExp("post-workout carnivore omelette", "i"), "Egg-based meal", "Eggs supply complete protein, choline and dietary fat. Their amino acids support muscle-protein synthesis; choline participates in cell membranes and nerve signaling. Egg count, added fats and accompanying carbohydrate determine the meal totals.", null],
    [new RegExp("post-workout air fry meals", "i"), "Practical meal preparation", "Air frying is a cooking method, not a recovery mechanism. The meal’s protein ingredients supply repair amino acids; carbohydrate foods replenish glycogen and added oil contributes calories. Cooking it this way makes preparation repeatable, while the ingredient portions determine its nutritional role.", null],
    [new RegExp("protein choco fudge", "i"), "Protein dessert", "The listed protein ingredient supplies amino acids; the chocolate, sweeteners and added fats determine much of the dessert’s energy content. Its purpose is a countable protein-containing treat that helps make the food routine repeatable. The dessert name does not establish a special anabolic effect.", null],
    [new RegExp("^ms-01|mega shake", "i"), "Blended meal", "Milk and the listed protein ingredients supply amino acids for muscle-protein synthesis; the carbohydrate ingredients provide energy and glycogen substrate. Fats increase calorie density, while plant foods contribute fiber and micronutrients. This is a substantial meal within the daily intake, not just a hydration drink.", null],
    [new RegExp("^sb-01|salad bowl", "i"), "Protein & plant foods", "Tuna supplies complete protein; beans add plant protein, starch and fiber. Vegetables contribute water, potassium and other micronutrients. Dressing changes fat and calorie totals, so the bowl’s purpose is a protein-and-fiber meal whose complete intake includes the chosen dressing.", null],
    [new RegExp("^fusion_2a|dark matter casein|^night fuel$", "i"), "Evening protein meal", "Casein and skyr supply milk protein, digested more gradually than whey, for ongoing amino-acid availability. Cereal and berries supply carbohydrate and fiber. Its night placement is a practical way to meet daily protein and energy needs; timing alone does not guarantee more muscle growth.", null],
    [new RegExp("^solid meal", "i"), "Protein & carbohydrate meal", "The solid meal supplies protein amino acids for tissue repair and carbohydrate for energy and glycogen. Its fats, fiber and food volume support a complete eating routine between drink stages. The actual recipe and portions, rather than the scheduled name, define its contribution.", null],
    [new RegExp("^cocoa$", "i"), "Flavor component", "Cocoa adds flavor and plant polyphenols, including flavanols; it also contains small amounts of caffeine and theobromine. Flavor helps make the blend repeatable. A culinary amount is not equivalent to a standardized flavanol dose used in vascular studies.", null],
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
    [/electrolyte|rapidrem/i, 'Fluid & mineral balance', ["Sodium (Na⁺): the main electrolyte outside cells. It helps maintain circulating fluid volume and initiates the electrical signals that activate nerves and muscles. In V2/V5, the separately listed pink salt also contributes sodium.", "Potassium (K⁺): the main electrolyte inside cells. The sodium–potassium pump maintains the voltage difference across cell membranes, allowing nerve impulses, repeated muscle contractions and normal heart rhythm.", "Magnesium (Mg²⁺): supports ATP-dependent energy reactions, protein synthesis and movement of calcium and potassium across membranes. These processes help regulate nerve signaling and muscle contraction.", "Calcium (Ca²⁺): acts as the signal that lets muscle fibers contract; it also supports nerve communication and bone structure.", "PROJECT 100: these minerals support hydration and normal training function. Water shifts can change a BIA muscle estimate without new muscle tissue. The powder’s scoop weight is not the amount of each mineral; count its elemental amounts and the added salt separately."], 'https://medlineplus.gov/fluidandelectrolytebalance.html'],
    [/pink salt|himalayan.*salt/i, 'Sodium supply', "Pink salt supplies sodium and chloride. Sodium helps maintain fluid volume outside cells and starts nerve-to-muscle electrical signals; chloride contributes to fluid and acid–base balance. Count this added salt alongside the electrolyte powder; trace minerals do not replace a magnesium or potassium serving.", 'https://medlineplus.gov/fluidandelectrolytebalance.html'],
    [/medjool|dates/i, 'Carbohydrate fuel', "Dates provide sugars that can be absorbed and used as exercise fuel or to replenish glycogen. Their fiber contributes digestive bulk. In V2 they are the separate solid carbohydrate source; they do not perform the nerve-signaling function of the electrolyte minerals.", null],
    [/filtered water/i, 'Hydration base', "Water supplies the solvent for mixing and supports blood volume, temperature regulation and fluid balance. It carries the ingredients without adding a protein, mineral or stimulant dose.", null],
    [/medi.?c plus/i, 'Vitamin C & lysine', "Vitamin C is a cofactor for collagen-forming enzymes; lysine is an amino-acid building block. Medi-C’s magnesium-ascorbate version also contributes magnesium to the daily total, so this optional night addition must be counted with the other mineral servings.", null],
    [/pro\s?line.*creatine/i, 'Muscle energy support', "Creatine supports the phosphocreatine system, which rapidly transfers a phosphate to ADP to regenerate ATP during brief, intense efforts. Consistent intake is intended to maintain muscle stores rather than create an instant effect from each pulse. Most performance evidence concerns creatine monohydrate; HCl is not established as superior.", 'https://prolinenutrition.ca/product/creatine-hcl-120g/'],
    [/bcaa.*hyper|hyper.*bcaa/i, 'Branched-chain amino acids', "Leucine participates in signaling that initiates muscle-protein synthesis; isoleucine and valine are essential amino acids used in protein and energy metabolism. BCAAs supply only three of the nine essential amino acids. Complete meal protein supplies the full building-block set; BCAAs alone cannot replace it.", 'https://ca.perfectsports.com/products/essential-bcaa-growth-and-recovery/'],
    [/vital greens/i, 'Plant-based nutrients', "Vital Greens is a mixed plant and micronutrient preparation. Vitamins and minerals can serve as enzyme cofactors, while plant compounds add dietary variety. It is the recorded plant-food supplement alongside the shake; it does not supply the same fiber and food volume as a full vegetable serving.", 'https://nakapro.com/products/bonus-size-platinum-vital-greens600ml'],
    [/igniter/i, 'Energy & focus', "Igniter combines caffeine-driven alertness with amino-acid and focus ingredients. Caffeine blocks adenosine signaling; citrulline supports nitric oxide and beta-alanine builds muscle carnosine. Count the complete branded matrix alongside any added ingredients.", 'https://www.allmaxnutrition.com/products/allmax-impact-igniter-xtreme-2'],
    [/muscl(?:e)?(?:e)?aa/i, 'Essential amino acids', "Essential amino acids must come from food or supplements. They supply the building blocks for new muscle protein, with leucine contributing to the signal that initiates synthesis. Their role depends on adequate total protein, energy and training; the blend is not a substitute for complete meals.", 'https://ca.allmaxnutrition.com/products/muscleaa-xtreme'],
    [/peak\s?o2/i, 'Oxygen use & endurance', "PeakO2 is a six-mushroom blend investigated for exercise work capacity and oxygen-use outcomes. The proposed performance effect concerns sustained exercise, but a clear mechanism and reliable benefit for this routine are not established. Its inclusion is an intended endurance adjunct rather than oxygen delivered directly to muscles.", 'https://compoundsolutions.com/ingredients/peako2/'],
    [/^(?:NOW\s+)?Betaine(?:\s+Anhydrous|$)/i, 'Creatine synthesis support', "Betaine (TMG) donates methyl groups in normal metabolism, including creatine synthesis, and acts as an osmolyte for cell-fluid balance. Count the formula-native and added amounts together.", 'https://www.nowfoods.com/products/sports-nutrition/betaine-powder'],
    [/citrulline/i, 'Nitric oxide support', "Citrulline is converted to arginine, providing substrate for nitric-oxide production and blood-vessel signaling. This is the intended circulation/pump pathway in the formula. An increase in a precursor does not guarantee a strength or endurance benefit; trial results are mixed.", 'https://ca.allmaxnutrition.com/products/citrulline-malate-2-1'],
    [/taurine/i, 'Cellular hydration', "Taurine helps regulate cell volume and calcium handling, including in muscle tissue. This explains its osmolyte role in the formula. Cellular fluid regulation is different from adding calories or supplying complete muscle-building protein.", 'https://www.allmaxnutrition.com/products/allmax-taurine'],
    [/citicoline/i, 'Attention & focus', "Citicoline supplies choline and cytidine for acetylcholine synthesis and membrane phospholipids. The separate capsule is the recorded pre-training primer; formula-native choline ingredients remain part of the same daily accounting.", 'https://aor.ca/ingredients/xerenoos-citicoline/'],
    [/(?:impact.*pump|allmax.*pump)/i, 'Stimulant-free pump support', "Impact Pump combines nitric-oxide precursors, osmolytes and focus ingredients without caffeine. Citrulline/arginine support the blood-flow pathway; glycerol, taurine and betaine address fluid balance. Count native creatine and added ingredients separately.", 'https://www.allmaxnutrition.com/products/allmax-impact-pump-xtreme'],
    [/carnivor|beef protein/i, 'Protein for recovery', "Carnivor’s beef-derived protein supplies amino acids for tissue repair and muscle-protein synthesis. Its dairy-free matrix differs from milk-derived whey and from collagen’s connective-tissue amino-acid pattern. Use the recorded Canadian serving label for protein and creatine accounting.", 'https://musclemedsrx.com/products/carnivor'],
    [/marine collagen|promise.*collagen/i, 'Collagen peptides', "PROMISE uses fish-derived Peptan type I collagen peptides. Hydrolysis produces smaller peptides supplying glycine, proline and hydroxyproline for connective-tissue turnover in skin, tendons and bone. Marine describes the source, not a universal advantage over bovine; this matrix complements the main muscle-protein serving.", 'https://promisenut.com/products/promise-pure-marine-collagen-525g-powder'],
    [/black maca|gelatinized.*maca/i, 'Plant-based nourishment', "Gelatinized black maca is a processed root powder containing carbohydrates and plant compounds. Gelatinization cooks the starch to improve preparation and digestibility; it does not make maca a hormone. Its shake role is a plant-food addition; evidence does not establish a reliable testosterone or muscle-growth effect.", 'https://www.rootalive.com/products/organic-gelatinized-black-maca-powder-200g'],
    [/c defense|c-defense/i, 'Vitamin C support', "Vitamin C is required by enzymes that stabilize newly formed collagen and acts in antioxidant chemistry; it also supports non-heme iron absorption. This is the micronutrient contribution to tissue maintenance, not a direct stimulant or an extra protein serving.", 'https://megafood.com/products/c-defense-gummies'],
    [/biosteel.*protein/i, 'Post-workout protein', "BioSteel Recovery Protein Plus combines three protein sources, including whey isolate, with carbohydrates and recovery factors. Protein supplies repair amino acids; carbohydrate supplies glycogen fuel. This mixed recovery matrix differs from plain whey isolate or the dairy-free Carnivor serving.", 'https://biosteel.com/collections/recovery-protein-plus'],
    [/beetroot/i, 'Plant nutrients', "Beetroot supplies plant compounds and dietary nitrate, which can enter the nitrate → nitrite → nitric-oxide pathway for blood-flow support. Nitrate content varies with the powder; grams of beetroot are not grams of nitrate.", 'https://www.rootalive.com/products/oragnic-beetroot-powder-454g'],
    [/sd pharmaceuticals.*creatine/i, 'Muscle energy support', "Creatine supports the phosphocreatine system, which rapidly transfers a phosphate to ADP to regenerate ATP during brief, intense efforts. Consistent intake is intended to maintain muscle stores rather than create an instant effect from each pulse. Most performance evidence concerns creatine monohydrate; HCl is not established as superior.", 'https://sdpharmaceuticals.com/en-us/products/creatine-hcl-powder'],
    [/glutamine/i, 'Recovery amino acid', "Glutamine carries nitrogen between tissues and serves as a fuel for intestinal and immune cells. The fermented L-glutamine in V10 is an evening amino-acid component, distinct from complete meal protein or collagen peptides.", 'https://northcoastnaturals.ca/products/fermented-glutamine'],
    [/glycine/i, 'Protein-building amino acid', "Glycine is used in collagen and glutathione synthesis and acts in inhibitory nerve signaling. V10 uses this separate amino acid for its evening purpose; collagen also supplies glycine within a peptide matrix.", 'https://aor.ca/ingredients/glycine/'],
    [/hey.?\s*relax|niyama/i, 'Evening relaxation', "Magnesium participates in ATP-dependent reactions, nerve signaling and muscle contraction; glycinate identifies its glycine-bound form. The recorded blend is placed in the evening routine. Magnesium has no guaranteed sedative effect, and the elemental amount must be counted with other magnesium servings.", 'https://niyama-wellness.ca/products/hey-relax-magnesium-glycinate-powder-fresh-pineapple-flavour']
    ,[/bovine collagen/i, 'Bovine collagen peptides', 'Bovine identifies a cattle-derived source. Hydrolyzed peptides supply connective-tissue amino acids; the tissue and product determine the collagen types. Source alone does not make it interchangeable with a complete muscle-protein serving.', 'https://www.peptan.com/bovine-collagen/']
    ,[/casein|skyr/i, 'Milk-protein matrix', 'Casein is a milk protein digested more gradually than whey. Skyr contributes a cultured dairy-protein food matrix; these serve the recorded evening protein meal, with other ingredients determining its carbohydrate and fat balance.', null]
    ,[/whey(?: protein)? isolate/i, 'Concentrated dairy protein', 'Whey isolate concentrates milk protein while reducing much of its fat and lactose. It supplies essential amino acids for muscle-protein synthesis; a branded recovery blend may additionally contain carbohydrates or other protein sources.', null]
    ,[/^potassium$/i, 'Fluid and electrical balance', "Potassium (K⁺): the main electrolyte inside cells. The sodium–potassium pump maintains the voltage difference across cell membranes, allowing nerve impulses, repeated muscle contractions and normal heart rhythm.", 'https://ods.od.nih.gov/factsheets/Potassium-HealthProfessional/']
    ,[/^magnesium$/i, 'Enzyme and muscle function', "Magnesium (Mg²⁺): supports ATP-dependent energy reactions, protein synthesis and movement of calcium and potassium across membranes. These processes help regulate nerve signaling and muscle contraction. Count elemental magnesium across the recorded daily servings.", 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/']
    ,[/^calcium$/i, 'Bone and contraction signaling', "Calcium (Ca²⁺): acts as the signal that lets muscle fibers contract; it also supports nerve communication and bone structure.", 'https://medlineplus.gov/fluidandelectrolytebalance.html']
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
      var block = document.createElement('div'), title = document.createElement('strong');
      title.textContent = f[1]; block.appendChild(title);
      (Array.isArray(f[2]) ? f[2] : [f[2]]).forEach(function (description) { var text = document.createElement('p'); text.textContent = description; block.appendChild(text); });
      if (f[3]) {
        var link = document.createElement('a'); link.textContent = /ods\.od\.nih\.gov|medlineplus\.gov|nccih\.nih\.gov/.test(f[3]) ? 'Biology reference ↗' : 'Product details ↗';
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
