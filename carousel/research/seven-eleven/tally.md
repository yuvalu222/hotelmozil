# 7-Eleven Thailand carousels: what gets shown, and how

Source: 17 viral TikTok carousels (213 slides, 190 product slides), harvested into `carousel/harvest/sources/`. Combined plays: 15,199,300. Every slide was read; per-slide data is in `items.jsonl`.

Handles requested but not in the harvest folder (skipped): bangkokfoodie, marissamaexx, helenanuic, thairiffictours1, travel.with.marcu2.

| Creator | Plays | Slides | Angle |
|---|---:|---:|---|
| lifebypolina | 2,800,000 | 8 | self-care picks, one line each, all hand-held in aisle |
| goravepassan | 1,200,000 | 11 | snack ratings N/10 + baht = GBP price |
| aarono6888 | 1,100,000 | 6 | designed drink-combo cheat sheet (15 recipes) |
| aqsaxiqbal | 1,000,000 | 12 | mixed must-buys, one line each |
| julie_in_asia | 1,000,000 | 6 | must-buys, chatty one-liners |
| nomap.needed | 924,000 | 7 | must-haves part 2, bullet-style tips |
| viedeselin | 884,900 | 24 | French full Thailand haul rated /10, flat lays (many items not from 7-Eleven) |
| starrose222 | 836,600 | 8 | what I brought home, flat lays on carpet |
| liisapihlak | 779,400 | 16 | what I brought home, long product explainers |
| mor_hagay | 765,600 | 20 | Hebrew, beauty-heavy haul held in front of the haul table |
| keethc | 746,600 | 9 | souvenir haul, 2-5 word labels, floor flat lays |
| shannonince15 | 745,100 | 16 | top buys with baht + GBP price on almost every slide |
| keeleydegay15 | 634,100 | 13 | skincare-heavy ratings N/10 |
| adrianavsworld | 484,000 | 16 | snacks rated honestly N/10 (family) |
| nika_plaksina | 442,300 | 8 | Thailand survival kit (health/remedies), headline + caption box |
| fulltimetrippin | 432,100 | 16 | must-haves after 2 months, TITLE + paragraph + (Cost = THB / USD) |
| ellielee996 | 424,600 | 17 | things I always repurchase, "N/10 -" + one sentence |

## 1. Products ranked by number of distinct creators

Ranked by distinct creators who feature the product on a slide, then by the summed plays of those posts. A product counts once per creator even if it appears on several of their slides. Flavour / filling / variant differences are merged inside one product line (e.g. Rojukiss 10X vs 5X masks, ham-cheese vs tuna toastie); different brands are NOT merged here (see section 2 for brand-agnostic concepts). Ingredients that appear only inside aarono6888's drink-combo infographic are not counted as a creator showing the product; they are noted in brackets after the product name. Example captions are the full slide text, so on multi-product slides they may also mention the other products.

| # | Product | Category | Creators | Summed plays | Who | Example caption 1 | Example caption 2 |
|---:|---|---|---:|---:|---|---|---|
| 1 | Vita-Keratin salon daily treatment hair mask (sachet) | toiletries | 8 | 7,538,300 | lifebypolina, viedeselin, starrose222, liisapihlak, keethc, keeleydegay15, fulltimetrippin, ellielee996 | lifebypolina: "The BEST hair mask to help nourish your hair" | keethc: "vita-keratin hair mask" |
| 2 | Soffell mosquito repellent spray (floral / pink) | toiletries | 6 | 4,996,300 | julie_in_asia, aqsaxiqbal, nomap.needed, viedeselin, shannonince15, nika_plaksina | aqsaxiqbal: "The best mosquito spray and it smells so good. (Can get a mini version too)" | julie_in_asia: "Mosquito 🦟 spray. Don’t bring yours from your own country. Thai mosquitos don’t care. They only fear this one 😁" |
| 3 | EZY Taste toastie (7-Eleven toasted sandwich, any filling) | food | 6 | 4,435,900 | goravepassan, julie_in_asia, shannonince15, keeleydegay15, fulltimetrippin, ellielee996 | goravepassan: "The Best Toastie IMO🤩 10/10! / Sounds Nasty But it’s So Flavoursome! If You Love Fish You’ll Love This! / 32 Baht = 72p!" | julie_in_asia: "$1-1.2 sandwiches paradise. Quick meal idea 🥪" |
| 4 | Handy Herb G'nite sleep gummies / capsules | other | 6 | 4,375,300 | aqsaxiqbal, viedeselin, starrose222, liisapihlak, nika_plaksina, fulltimetrippin | aqsaxiqbal: "Similar to the drink but not as strong. Still handy to have in your bag when travelling." | starrose222: "G nite gummies / Wish I actually bought more of these they had so many, take 2 gummies before bed" |
| 5 | Rojukiss serum sheet masks (10X / 5X / PDRN / BHA / B12 / Vit C) | skincare | 6 | 4,306,200 | viedeselin, starrose222, liisapihlak, keethc, keeleydegay15, ellielee996 | starrose222: "Viral face masks / Really wish I grabbed the collagen one to, they have tons to choose from!" | liisapihlak: "Rojukiss 10X Treatment Mask PDRN / Long flight, bad sleep or too much sun - this mask sorts it out. 10 minutes and your skin genuinely looks more alive." |
| 6 | EZY Sweet chocolate lava cake (7-Eleven) | food | 6 | 3,940,400 | goravepassan, mor_hagay, keeleydegay15, adrianavsworld, fulltimetrippin, ellielee996 | goravepassan: "Chocolate Lava Cake - 100/10!🍫 / Gotta Ask For It Hot! So Gooey And Rich🤤 / 32 Baht = 72p!" | mor_hagay: "סופלה הכי טעים בעולםםם / 🤤 [EN: Tastiest soufflé in the worlddd]" |
| 7 | Hanuman brand yadom herbal inhaler (green jar) | other | 5 | 3,560,300 | starrose222, liisapihlak, mor_hagay, keethc, fulltimetrippin | liisapihlak: "Have you even been to Thailand if you didn't stock up on these??? / Locals use these constantly and once you start you genuinely don’t stop, I carry these with me everywhere / YADOM INHALERS / Fits in your pocket, costs next to no [...]" | mor_hagay: "תמצית מטורפת להריח מעוררת ופותחת את כל דרכי הנשימה / 👃🏼 [EN: Crazy essence to sniff, invigorating and opens all the airways]" |
| 8 | Red-bow (Bow Daeng) herbal inhaler | other | 4 | 3,415,700 | aqsaxiqbal, nomap.needed, keethc, shannonince15 | aqsaxiqbal: "This stuff is addictive. The best herbal inhaler." | shannonince15: "Clears your sinuses and relives blocked noses (use due to some air cons!) / 40 baht (£1)" |
| 9 | Tiger Balm ointment (white / red) | other | 4 | 3,175,000 | viedeselin, liisapihlak, mor_hagay, shannonince15 | mor_hagay: "משחת טייגר שעושה פלאים!!! / הלבנה- מקררת ומרגיעה את האיזור לסובלים ממיגרנות- מריחה על המצח האדומה- מחממת ומרגיעה כאבי שרירים [EN: Tiger balm that works wonders!!! / The white one cools and soothes the area, for migraine sufferers [...]" | shannonince15: "Relieves aches and pains of muscles and joints / 67 baht (1.53)" |
| 10 | Baby Bright Aloe Vera & Fresh Collagen eye roller serum | skincare | 4 | 2,982,900 | starrose222, mor_hagay, keethc, keeleydegay15 | mor_hagay: "אלוורה מתחת לעיניים מורידה נפיחות וכהויות [EN: Aloe vera for under the eyes, reduces puffiness and dark circles]" | keethc: "baby bright eyeroller" |
| 11 | Dove Intense Repair daily hair vitamin capsules | toiletries | 4 | 2,892,700 | viedeselin, starrose222, keethc, ellielee996 | starrose222: "Repair hair oil / These are good because come in small pods easy for one use and can bin, Keeps your hair from drying out" | ellielee996: "10/10 - These saved my hair from the water and heat over here. Just pop some in your damp hair and style. Makes your hair so soft!" |
| 12 | Rasyan herbal clove toothpaste | toiletries | 3 | 4,011,500 | lifebypolina, liisapihlak, fulltimetrippin | lifebypolina: "Toothpaste that will whiten your teeth instantly (not to be used daily, can lead to heightened sensitivity)" | fulltimetrippin: "HERBAL TOOTHPASTE My teeth have never felt cleaner. This gives you that post-dentist, squeaky clean freshness! It’s a clove toothpaste and has strong antibacterial properties. (Cost = 49 THB / $1.48 USD)" |
| 13 | Sunsilk Power Shot treatment hair mask sachet | toiletries | 3 | 2,540,000 | nomap.needed, starrose222, liisapihlak | nomap.needed: "THIS hair mask / - did wonders to my hair - best mask I've tried" | starrose222: "The viral hair masks / These are 10/10 make your hair sooo soft and silky, worth the hype" |
| 14 | Baby Bright eye mask (aloe collagen / Sleep Well heating) | skincare | 3 | 2,500,900 | viedeselin, starrose222, liisapihlak | viedeselin: "7/10 des yeux moins gonflés au réveil" | liisapihlak: "Aloe Vera & Fresh Collagen Eye Mask / Under eye patches packed with Aloe Vera and Fresh Collagen that genuinely depuff and hydrate / They’re cooling, soothing, and the kind of thing you use when you’ve had a rough night and need y [...]" |
| 15 | Tiger Balm medicated plaster | other | 3 | 2,429,900 | viedeselin, liisapihlak, mor_hagay | mor_hagay: "אותו המוצר גם במדבקות וזה חוסך את המריחות [EN: The same product also as patches, which saves the rubbing on]" | viedeselin: "10000/10 !! Merci pour cette invention" |
| 16 | Lerpang cupcake (banana / blueberry) | food | 3 | 2,369,700 | goravepassan, shannonince15, ellielee996 | goravepassan: "🍌9/10!🍫 / An Elite Cupcake, Super Soft And Moist. So Many Other Flavour Varieties Too! / 12 Baht = 27p!" | shannonince15: "The muffins have my heart! All different flavours / Blueberry is the best! / 12 baht (0.27p)" |
| 17 | Neo-Lyte electrolyte sachet (orange) (also in combo: Aloe-ha (Neo-Lyte Orange)) | drink | 3 | 1,601,800 | shannonince15, fulltimetrippin, ellielee996 | shannonince15: "Electrolyte sachets!! No point bringing them from home when taste amazing and are so cheap😝" | fulltimetrippin: "ELECTROLYTES We actually drink one every day. Bangkok heat/humidity is no joke & this helps with hydration. ~ 20 calories per packet. (Cost = 5 THB / $0.15 USD)" |
| 18 | Cooling gel fever patches (Bye Bye-Fever / Koolfever) | other | 2 | 3,800,000 | lifebypolina, julie_in_asia | lifebypolina: "Amazing for sun burns, migraines or fever relief" | julie_in_asia: "Cooling patches. It’s actually for fever but it’s soo gooood with the Bangkok heat" |
| 19 | Biore UV Aqua Rich sunscreen SPF50+ | skincare | 2 | 3,684,900 | lifebypolina, viedeselin | lifebypolina: "The best SPF for your face, super lightweight, doesn’t clog your pores, a very different formula to the one they sell in the UK" | viedeselin: "100/10 crème solaire bioré / C’est sous forme de « gel » ne grasse pas la peau / 6/10 contours des yeux, ça rafraîchit mais sans +" |
| 20 | C-Lyte glucose electrolyte sachet | drink | 2 | 3,579,400 | lifebypolina, liisapihlak | lifebypolina: "The best electrolytes to restore your hydration" | liisapihlak: "ELECTROLYTES / Electrolyte drink sachets that you just mix into water / The unsung heroes of any Thailand trip and honestly of life in general / I actually bought back so much more just never got around to taking a picture of them [...]" |
| 21 | Hiruscar Post Acne gel | skincare | 2 | 3,565,600 | lifebypolina, mor_hagay | lifebypolina: "Best treatment if you’ve had a breakout and now have a scar, it will be gone in a day" | mor_hagay: "משחה לצלקות אחרי אקנה וכו [EN: Ointment for post-acne scars etc]" |
| 22 | 7-Select self-serve iced drink dispenser (espresso / Thai tea / Choco Boom / lemon tea) | drink | 2 | 1,745,100 | aqsaxiqbal, shannonince15 | aqsaxiqbal: "You will not have tasted a better iced coffee. (The first one)" | shannonince15: "But this is on another level! / Coffee, Thai tea, choc milk, lemon tea! / 26 baht(0.59p)" |
| 23 | Meiji flavoured milk (chocolate / strawberry / banana / coffee) (also in combo: Matchaberry (Meiji Strawberry Milk), Cocoa-nana (Meiji Banana Milk)) | drink | 2 | 1,745,100 | aqsaxiqbal, shannonince15 | aqsaxiqbal: "The best chocolate milk evaaa 😍" | shannonince15: "Chocolate milk is my fav but they are all so nice!👌 / 29 baht (0.66p)" |
| 24 | EZYGO salmon onigiri (grilled / teriyaki salmon) | food | 2 | 1,684,000 | goravepassan, adrianavsworld | goravepassan: "Teriyaki Salmon Onigiri Triangles - 1000/10! / The Best Flavour Onigiri. FULL Of Salmon With a Sweet-Sticky Teriyaki Sauce. Do I Need To Say More?🍣 / 30 Baht = 68p" | adrianavsworld: "7/10 / They’re alright. Good snack, but had a lot of rice and not a lot of fish. Can taste kinda stale." |
| 25 | Pocket nasal inhalers (Poy-Sian / Tiger Balm / Pastel) | other | 2 | 1,664,300 | viedeselin, liisapihlak | viedeselin: "10/10" | liisapihlak: "TIGER BALM PLASTERS / Brilliant for headaches, muscle aches, congestion or basically anything that needs sorting out naturally / GREEN HERBAL BALM / COBRA BLACK BALM / 555 TIGER BALM / TIGER BALM / These cooling medicated plasters [...]" |
| 26 | Rojukiss PDRN hydrogel mask | skincare | 2 | 1,664,300 | viedeselin, liisapihlak | viedeselin: "100/10 que des masques coréens" | liisapihlak: "PDRN HYDROGEL MASKS / 3H mask for glassy skin / VITAMIN C EYE MASKS / MORE KOREAN SKIN CARE / SLEEPING MASK / Your skins overnight best friend 💤 / SHEET MASKS" |
| 27 | Twelve Plus x Babi Mild perfume body mist | toiletries | 2 | 1,631,500 | viedeselin, keethc | keethc: "twelve plus perfume" | viedeselin: "100000000/10 !!!! Vous sentez le PROPRE / ♾️/10 !!!! Je regrette de pas en avoir acheté +" |
| 28 | Vaseline Healthy Bright SPF50 serum sachet | skincare | 2 | 1,631,500 | viedeselin, keethc | viedeselin: "100/10 crème solaire bioré / C’est sous forme de « gel » ne grasse pas la peau / 6/10 contours des yeux, ça rafraîchit mais sans +" | keethc: "dove hair vitamin / vaseline brightening serum / antergan (great for heat rash)" |
| 29 | Supaporn herbal tooth polishing powder | toiletries | 2 | 1,545,000 | liisapihlak, mor_hagay | mor_hagay: "מלבין שיניים הכי טוב שהכרתי / הטעם מגעיל אבל תהיו חזקים [EN: Best teeth whitener I've known / The taste is disgusting but be strong]" | liisapihlak: "DENTAL CARE / At just a few Thai baht, these are one of the best beauty bargains you can grab before leaving Thailand! / TOOTH POLISHING POWDER / HERBAL TOOTHPASTE / Unlike standard toothpastes, you only need to use a tiny amount. [...]" |
| 30 | Royal-D electrolyte sachet | drink | 2 | 1,524,500 | liisapihlak, shannonince15 | shannonince15: "..and another! 7 baht (0.16p)" | liisapihlak: "ELECTROLYTES / Electrolyte drink sachets that you just mix into water / The unsung heroes of any Thailand trip and honestly of life in general / I actually bought back so much more just never got around to taking a picture of them [...]" |
| 31 | Glico Pocky (almond noir / strawberry) | snack | 2 | 1,424,600 | aqsaxiqbal, ellielee996 | aqsaxiqbal: "The best to snack on! Super addictive." | ellielee996: "10/10 - This was my first time trying these. They taste like a milkshake." |
| 32 | Handy Herb Fiber Flow gummy | other | 2 | 1,317,000 | viedeselin, fulltimetrippin | fulltimetrippin: "FIBER GUMMIES These worked SO well the one time we needed them. The main fiber ingredients are prebioitc. It’s gentle – not a laxative. (Cost = 40 THB / $1.21 USD)" | viedeselin: "8.5/10 aide à dormir / Pas encore testé/10" |
| 33 | Senka Perfect Whip face wash | skincare | 2 | 1,309,500 | viedeselin, ellielee996 | ellielee996: "8/10 - If you forget your face wash or run out. This is perfect. Such an amazing face wash and left my skin so soft and clean." | viedeselin: "10000/10 nettoie le visage en PROFONDEUR" |
| 34 | Hawaiian Style tanning lotion SPF4 | skincare | 2 | 1,190,200 | mor_hagay, ellielee996 | mor_hagay: "קרם שיזוף מושלםםם / **כל המוצרים מהסדרה הזו מומלצים [EN: Perfecttt tanning lotion / **All the products from this line are recommended]" | ellielee996: "7/10 - I have only used this product for about a week and half and I have gotten more tan so I do love it but bit overhyped on Tik Tok." |
| 35 | Johnson's baby lotion (bedtime / mini) | skincare | 2 | 1,190,200 | mor_hagay, ellielee996 | mor_hagay: "מיני קרם גוף גונסון בייבי [EN: Mini Johnson's baby body lotion]" | ellielee996: "1000000000/10 - Omgggggg I cannot even explain how nice this product is, it’s small so perfect for travelling and it smells clean and like my childhood!" |
| 36 | B'lue vitamin flavoured water | drink | 2 | 1,177,200 | shannonince15, fulltimetrippin | shannonince15: "Vitamin drink🥤 / Tastes so good / 21 baht (0.46p) / Fav is peach / So good if you have been sweating due to humidity!" | fulltimetrippin: "0 CALORIE FLAVORED WATER Always so refreshing on a hot afternoon! Lots of great flavors. (Cost = 20 THB / $0.60 USD)" |

**Shown by one creator only** (product, creator):

- **food**: EZY Sweet chocolate cake slice (aqsaxiqbal); Takachi pistachio choco daifuku (keeleydegay15); 7-Eleven bakery chicken curry pie (adrianavsworld); CP / Oishi Eato frozen dumplings (gyoza, pork & chive, wonton) (adrianavsworld); CP peeled boiled egg (adrianavsworld); CP roasted teriyaki chicken (adrianavsworld); EZY Sweet x April's Bakery Dubai mochi cookie (adrianavsworld); EZYGO stir-fried noodles with chicken (ready meal) (adrianavsworld); Lerpang pandan roll cake (adrianavsworld)
- **drink**: Meiji High Protein banana drink (goravepassan); QminC probiotic green smoothie (goravepassan); Singha lemon soda zero + Schweppes zero sodas (goravepassan); Peptein Good Night GABA sleep drink (aqsaxiqbal); Collagen drink powders (Fresh Doze, Blink, Pink Gluta) (viedeselin); Dutch Mill High Protein chocolate (shannonince15); All Café fresh-brewed coffee (adrianavsworld); Malee 100% coconut water (adrianavsworld; also in combo: Siamese Ruby (Malee Coconut Water)); Proten 35g protein Thai tea milk (adrianavsworld); Gatorade No Sugar strawberry (nika_plaksina); Handy Herb PostBio D-TXV gut drink (nika_plaksina); Coca-Cola slush supercooler (bottle turns to slush, free) (fulltimetrippin); HooRay! protein shake (coffee latte) (fulltimetrippin); C-vitt vitamin C drink (ellielee996; also in combo: Pink Lemonade (C-vitt Lemon))
- **snack**: Cornae tomato corn cones (goravepassan); Glico Ice-no-Mi grape ice-cream balls (goravepassan); PR Big Bag seaweed rice-cracker rings (aqsaxiqbal); Assorted snacks (Haribo, OLE gummies, Wel-B freeze-dried fruit, Shin Ramyun, Samyang Buldak) (liisapihlak); Chocolate bars (Hershey's Nuggets, Kinder Tronky, Snickers, KitKat Milo) (mor_hagay); Garrett popcorn tins + dried mango (keethc); Glico Alfie cookies & cream bar (shannonince15); Jack 'n Jill Cream-O cookies (shannonince15); Quanta Breaksta chocolate wafer (shannonince15); Koh-Kae coconut-coated peanuts (adrianavsworld); Lay's nori seaweed chips (adrianavsworld)
- **skincare**: Merci Vitamin C glass-skin serum sachet (aqsaxiqbal); Eye-contour roller serums (brand not visible) (viedeselin); Garnier Bright Complete Vit C face wash + Banila Co Clean it Zero balm (viedeselin); Johnson's baby oil (viedeselin); OHO Clear Nose scrub (viedeselin); Pond's powders + Charmiss / Merrezca blush + lip tints (viedeselin); Skinfood carrot toner pads (viedeselin); Torriden Cellmazing vitamin C mask (viedeselin); Lalio Moist Hya B5 gel cream (liisapihlak); Rojukiss Sleeping Mask Reju-PDRN (liisapihlak); VC Vit C magnet eye mask (liisapihlak); BQ Cover mascara (mor_hagay); Brown Lab Dr.dreamderm pimple patches (mor_hagay); KA Magic Lip colour-changing balm (mor_hagay); Plantnery tea tree acne spot gel (mor_hagay); V tint lip & cheek tint (mor_hagay); The Original charcoal nose strips + peel-off mask (keethc); Get Glow lip gloss / tint (keeleydegay15); Joji Secret Young avocado sheet mask (keeleydegay15); MizuMi Aloe Plus C Booster gel sachet (keeleydegay15); Nazzly green tea blackhead peel (keeleydegay15); Clear Nose moist toner pads (ellielee996)
- **toiletries**: My Items Fresh Cool refreshing towel (aqsaxiqbal); Sofy Cooling Fresh sanitary pads (julie_in_asia); Haku Extra Cooling menthol wipes (nomap.needed); Colgate Optic White O2 toothpaste (viedeselin); Exsense perfume roll-on (viedeselin); Frangipani / mango shaped Thai soaps (viedeselin); Hair oils & masks (Fino, BioWoman, &honey) (viedeselin); Sunsilk 5x Biotin hair vitamin capsules (liisapihlak); Green Bio Super Treatment hair mask sachet (mor_hagay); Johnson's Blossoms baby powder cologne (mini) (mor_hagay); Nivea roll-on deodorant (mini) (mor_hagay); Schwarzkopf Taft hairspray (mini) (mor_hagay); Protex Icy Cool bar soap (fulltimetrippin); Dove 10in1 hair mask sachet (ellielee996); Sunsilk Damage Restore shampoo + conditioner (ellielee996)
- **other**: Ta Khaab herbal cough lozenges (lifebypolina); Unison enema (julie_in_asia); Golden Dragon herbal inhaler (nomap.needed); My Items disposable raincoat poncho (nomap.needed); Ammeltz Yoko Yoko heat patch (viedeselin); Hong Thai herbal inhaler (viedeselin); Moshi Moshi stationery & accessories (viedeselin); Pop Mart Labubu / blind-box figures (viedeselin); Thai incense / candle sets + Buddha figurine (viedeselin); Therma Plast heat pads (viedeselin); Vicks VapoRub mini (viedeselin); Yanhee green balm (viedeselin); Air-X anti-bloating chewable tablets (starrose222); Golden Elephant balm set (cobra black, green herbal, 555) (liisapihlak); Happy Noz kids onion stickers (liisapihlak); Antergan anti-itch cream (keethc); Golden Cup balm (shannonince15); Luang Sit Pimsaen liquid balm (keeleydegay15); FOD Plus hangover sachet (nika_plaksina); Flying Rabbit Thai stomach mixture (nika_plaksina)

## 2. Brand-agnostic concepts (what the creator is really recommending)

Creators often recommend the *type* ("herbal inhaler", "electrolytes", "the viral hair mask") and show whichever brand they bought. Grouping by concept:

| # | Concept | Creators | Summed plays | Products under it |
|---:|---|---:|---:|---|
| 1 | Hair mask sachet | 10 | 9,227,900 | Vita-Keratin salon daily treatment hair mask (sachet) (8); Sunsilk Power Shot treatment hair mask sachet (3); Green Bio Super Treatment hair mask sachet (1); Dove 10in1 hair mask sachet (1); Hair oils & masks (Fino, BioWoman, &honey) (1) |
| 2 | Herbal inhaler (yadom) | 9 | 7,114,300 | Hanuman brand yadom herbal inhaler (green jar) (5); Red-bow (Bow Daeng) herbal inhaler (4); Pocket nasal inhalers (Poy-Sian / Tiger Balm / Pastel) (2); Hong Thai herbal inhaler (1); Golden Dragon herbal inhaler (1) |
| 3 | Electrolyte drink | 6 | 5,623,500 | Neo-Lyte electrolyte sachet (orange) (3); Royal-D electrolyte sachet (2); C-Lyte glucose electrolyte sachet (2); Gatorade No Sugar strawberry (1) |
| 4 | Mosquito repellent | 6 | 4,996,300 | Soffell mosquito repellent spray (floral / pink) (6) |
| 5 | Under-eye products | 6 | 4,647,200 | Baby Bright Aloe Vera & Fresh Collagen eye roller serum (4); Baby Bright eye mask (aloe collagen / Sleep Well heating) (3); VC Vit C magnet eye mask (1); Eye-contour roller serums (brand not visible) (1) |
| 6 | 7-Eleven toastie | 6 | 4,435,900 | EZY Taste toastie (7-Eleven toasted sandwich, any filling) (6) |
| 7 | Sleep aid | 6 | 4,375,300 | Handy Herb G'nite sleep gummies / capsules (6); Peptein Good Night GABA sleep drink (1) |
| 8 | Korean-style face masks | 6 | 4,306,200 | Rojukiss serum sheet masks (10X / 5X / PDRN / BHA / B12 / Vit C) (6); Rojukiss PDRN hydrogel mask (2); Joji Secret Young avocado sheet mask (1); Torriden Cellmazing vitamin C mask (1); Rojukiss Sleeping Mask Reju-PDRN (1) |
| 9 | Chocolate lava cake | 6 | 3,940,400 | EZY Sweet chocolate lava cake (7-Eleven) (6) |
| 10 | Balm | 5 | 3,809,100 | Tiger Balm ointment (white / red) (4); Luang Sit Pimsaen liquid balm (1); Yanhee green balm (1); Vicks VapoRub mini (1); Golden Cup balm (1); Golden Elephant balm set (cobra black, green herbal, 555) (1) |
| 11 | Hair vitamin capsules | 5 | 3,672,100 | Dove Intense Repair daily hair vitamin capsules (4); Sunsilk 5x Biotin hair vitamin capsules (1) |
| 12 | Digestion remedy | 5 | 3,595,900 | Handy Herb Fiber Flow gummy (2); Flying Rabbit Thai stomach mixture (1); Air-X anti-bloating chewable tablets (1); Unison enema (1) |
| 13 | Thai herbal tooth care | 4 | 4,777,100 | Rasyan herbal clove toothpaste (3); Supaporn herbal tooth polishing powder (2) |
| 14 | Medicine / remedy | 4 | 4,768,300 | FOD Plus hangover sachet (1); Happy Noz kids onion stickers (1); Antergan anti-itch cream (1); Ta Khaab herbal cough lozenges (1) |
| 15 | Protein drink | 4 | 2,861,200 | Meiji High Protein banana drink (1); Proten 35g protein Thai tea milk (1); HooRay! protein shake (coffee latte) (1); Dutch Mill High Protein chocolate (1) |
| 16 | Lerpang bakery cake | 4 | 2,853,700 | Lerpang cupcake (banana / blueberry) (3); Lerpang pandan roll cake (1) |
| 17 | Sunscreen | 3 | 4,431,500 | Biore UV Aqua Rich sunscreen SPF50+ (2); Vaseline Healthy Bright SPF50 serum sachet (2) |
| 18 | Crackers & chips | 3 | 2,684,000 | Lay's nori seaweed chips (1); Cornae tomato corn cones (1); PR Big Bag seaweed rice-cracker rings (1) |
| 19 | Pain patch | 3 | 2,429,900 | Tiger Balm medicated plaster (3); Therma Plast heat pads (1); Ammeltz Yoko Yoko heat patch (1) |
| 20 | Lip / makeup | 3 | 2,284,600 | Get Glow lip gloss / tint (1); V tint lip & cheek tint (1); BQ Cover mascara (1); KA Magic Lip colour-changing balm (1); Pond's powders + Charmiss / Merrezca blush + lip tints (1) |
| 21 | Nose / blackhead | 3 | 2,265,600 | Nazzly green tea blackhead peel (1); OHO Clear Nose scrub (1); The Original charcoal nose strips + peel-off mask (1) |
| 22 | Johnson's baby range | 3 | 2,075,100 | Johnson's baby lotion (bedtime / mini) (2); Johnson's Blossoms baby powder cologne (mini) (1); Johnson's baby oil (1) |
| 23 | Vitamin water | 3 | 1,601,800 | B'lue vitamin flavoured water (2); C-vitt vitamin C drink (1) |
| 24 | Cooling gel patch | 2 | 3,800,000 | Cooling gel fever patches (Bye Bye-Fever / Koolfever) (2) |
| 25 | Acne treatment | 2 | 3,565,600 | Hiruscar Post Acne gel (2); Brown Lab Dr.dreamderm pimple patches (1); Plantnery tea tree acne spot gel (1) |
| 26 | Cooling wipes | 2 | 1,924,000 | My Items Fresh Cool refreshing towel (1); Haku Extra Cooling menthol wipes (1) |
| 27 | Flavoured milk | 2 | 1,745,100 | Meiji flavoured milk (chocolate / strawberry / banana / coffee) (2) |
| 28 | Self-serve iced drink | 2 | 1,745,100 | 7-Select self-serve iced drink dispenser (espresso / Thai tea / Choco Boom / lemon tea) (2) |
| 29 | Onigiri | 2 | 1,684,000 | EZYGO salmon onigiri (grilled / teriyaki salmon) (2) |
| 30 | Probiotic drink | 2 | 1,642,300 | QminC probiotic green smoothie (1); Handy Herb PostBio D-TXV gut drink (1) |
| 31 | Body mist | 2 | 1,631,500 | Twelve Plus x Babi Mild perfume body mist (2); Exsense perfume roll-on (1) |
| 32 | Souvenir snacks | 2 | 1,526,000 | Assorted snacks (Haribo, OLE gummies, Wel-B freeze-dried fruit, Shin Ramyun, Samyang Buldak) (1); Garrett popcorn tins + dried mango (1) |
| 33 | Chocolate & biscuits | 2 | 1,510,700 | Chocolate bars (Hershey's Nuggets, Kinder Tronky, Snickers, KitKat Milo) (1); Quanta Breaksta chocolate wafer (1); Jack 'n Jill Cream-O cookies (1); Glico Alfie cookies & cream bar (1) |
| 34 | Pocky | 2 | 1,424,600 | Glico Pocky (almond noir / strawberry) (2) |
| 35 | Gel cream | 2 | 1,413,500 | Lalio Moist Hya B5 gel cream (1); MizuMi Aloe Plus C Booster gel sachet (1) |
| 36 | Soap | 2 | 1,317,000 | Protex Icy Cool bar soap (1); Frangipani / mango shaped Thai soaps (1) |
| 37 | Face wash | 2 | 1,309,500 | Senka Perfect Whip face wash (2); Garnier Bright Complete Vit C face wash + Banila Co Clean it Zero balm (1) |
| 38 | Toner pads | 2 | 1,309,500 | Skinfood carrot toner pads (1); Clear Nose moist toner pads (1) |
| 39 | Tanning lotion | 2 | 1,190,200 | Hawaiian Style tanning lotion SPF4 (2) |

Note: the drink-combo post (aarono6888) is not inside these counts; it would add 1 creator to Electrolyte drink (Neo-Lyte), Vitamin water (C-vitt), Flavoured milk (Meiji) and Coconut water (Malee).

### Category mix (product slides)

| Category | Product slides | Share |
|---|---:|---:|
| skincare | 43 | 23% |
| other | 38 | 20% |
| toiletries | 37 | 19% |
| food | 27 | 14% |
| drink | 25 | 13% |
| snack | 13 | 7% |
| drink-combo | 7 | 4% |

"other" is mostly Thai remedies (inhalers, balms, patches, sleep gummies, stomach medicine) plus viedeselin's Pop Mart / souvenir slides.

## 3. Photo style

Over all 190 product slides (covers/outros excluded):

| Style | Slides | Share |
|---|---:|---:|
| hand-held in store (or just outside) | 90 | 47.4% |
| flat lay at home / hotel | 45 | 23.7% |
| hand-held at home / hotel | 36 | 18.9% |
| in store, not held (shelf / fridge / machine) | 12 | 6.3% |
| designed infographic (packshot cut-outs) | 5 | 2.6% |
| collage | 2 | 1.1% |

**Hand-held (any location): 126/190 = 66%.** Hand-held *in the store* alone: 90/190 = 47%. No creator used a brand packshot/stock image of a single product; the only non-photo slides are aarono6888's designed infographics.

Per creator (dominant style of product slides):

| Creator | Plays | Dominant style | Share |
|---|---:|---|---:|
| lifebypolina | 2,800,000 | hand-held in store (or just outside) | 7/7 |
| goravepassan | 1,200,000 | hand-held in store (or just outside) | 6/9 |
| aarono6888 | 1,100,000 | designed infographic (packshot cut-outs) | 5/5 |
| aqsaxiqbal | 1,000,000 | hand-held in store (or just outside) | 10/11 |
| julie_in_asia | 1,000,000 | hand-held in store (or just outside) | 4/5 |
| nomap.needed | 924,000 | hand-held in store (or just outside) | 5/5 |
| viedeselin | 884,900 | flat lay at home / hotel | 23/23 |
| starrose222 | 836,600 | flat lay at home / hotel | 6/7 |
| liisapihlak | 779,400 | flat lay at home / hotel | 8/15 |
| mor_hagay | 765,600 | hand-held at home / hotel | 19/19 |
| keethc | 746,600 | flat lay at home / hotel | 8/8 |
| shannonince15 | 745,100 | hand-held in store (or just outside) | 10/15 |
| keeleydegay15 | 634,100 | hand-held in store (or just outside) | 9/11 |
| adrianavsworld | 484,000 | hand-held in store (or just outside) | 11/14 |
| nika_plaksina | 442,300 | hand-held at home / hotel | 5/6 |
| fulltimetrippin | 432,100 | hand-held in store (or just outside) | 11/14 |
| ellielee996 | 424,600 | hand-held in store (or just outside) | 16/16 |

Covers: storefront / scene (no product) 12, collage 2, designed infographic (packshot cut-outs) 1, flat lay at home / hotel 1, in store, not held (shelf / fridge / machine) 1, creator in frame 1. The typical cover is the green-orange 7-Eleven storefront (often at night or against blue sky) with a big white "must-haves / what to buy at 7/11 in Thailand" title; exceptions are a full flat-lay haul (keethc, viedeselin, mor_hagay), a beach (keeleydegay15), a selfie on the hotel bed with the 7-Eleven bag (nika_plaksina), the creator posing outside the store (shannonince15) and a designed graphic (aarono6888).

Patterns:
- **In-store hand-held** is the default for "what to buy" posts (lifebypolina 7/7, aqsaxiqbal 10/11, ellielee996 16/16, nomap.needed, julie_in_asia, fulltimetrippin, goravepassan, keeleydegay15): one product, held up close in the aisle or in front of the fridge, shelf blurred behind, phone-camera quality.
- **"What I brought home" posts** switch to flat lays on a bed / blanket / carpet / floor at home (starrose222, liisapihlak, keethc, viedeselin), often with several products per slide.
- **Food and drink** are the slides most often shot without a hand (product on the chiller shelf, toastie wall, drink dispenser, slush machine) - shannonince15 and goravepassan do this for toasties, onigiri and drinks.

## 4. How creators write the per-product text

| Creator | Language | Median words / slide | With price | With N/10 rating | With emoji | First person |
|---|---|---:|---:|---:|---:|---:|
| lifebypolina | English | 15 | 0/7 | 0/7 | 0/7 | 0/7 |
| goravepassan | English | 20 | 9/9 | 9/9 | 9/9 | 1/9 |
| aarono6888 | English | 45 | 0/5 | 0/5 | 0/5 | 0/5 |
| aqsaxiqbal | English | 8 | 0/11 | 0/11 | 4/11 | 1/11 |
| julie_in_asia | English | 11 | 1/5 | 0/5 | 3/5 | 1/5 |
| nomap.needed | English | 18 | 0/5 | 0/5 | 0/5 | 1/5 |
| viedeselin | French | 7 | 0/23 | 21/23 | 7/23 | 5/23 |
| starrose222 | English | 18 | 0/7 | 1/7 | 1/7 | 2/7 |
| liisapihlak | English | 49 | 2/15 | 1/15 | 2/15 | 6/15 |
| mor_hagay | Hebrew | 6 | 0/19 | 0/19 | 2/19 | n/a |
| keethc | English | 3 | 0/8 | 0/8 | 0/8 | 0/8 |
| shannonince15 | English | 17 | 14/15 | 0/15 | 5/15 | 5/15 |
| keeleydegay15 | English | 21 | 0/11 | 11/11 | 1/11 | 8/11 |
| adrianavsworld | English | 27 | 0/14 | 14/14 | 3/14 | 4/14 |
| nika_plaksina | English | 32 | 0/6 | 0/6 | 6/6 | 0/6 |
| fulltimetrippin | English | 30 | 11/14 | 1/14 | 1/14 | 9/14 |
| ellielee996 | English | 23 | 1/16 | 16/16 | 0/16 | 11/16 |

Median across all product slides: 18 words (range 0-78).

Five recurring templates:

1. **One-line verdict, no number** (lifebypolina 2.8M, aqsaxiqbal 1M, julie_in_asia 1M, nomap.needed): a single sentence of 6-20 words that says what it does for you. Superlatives carry it ("The best...", "life saver", "must have").
   - lifebypolina: "At the first sign of sore throat or a cough these are a life saver"
   - aqsaxiqbal: "The best chocolate milk evaaa 😍"
   - julie_in_asia: "Mosquito 🦟 spray. Don’t bring yours from your own country. Thai mosquitos don’t care. They only fear this one 😁"
   - nomap.needed: "cooling wipes / - really nice especially in that heat - great when u can't wash ur hands"
2. **Rating first, then one or two sentences** (goravepassan, ellielee996, keeleydegay15, adrianavsworld, viedeselin): "N/10" up top, exaggerated scores are part of the joke (100/10, 100000/10, 1000000000/10, ♾️/10, -1000/10), and a few low scores (1/10, 3/10) are used to look honest.
   - ellielee996: "11/10 - Toasties are worth the hype. They heat them up in 7-11 and they taste like the Toasties from school."
   - keeleydegay15: "3/10 / I was so disappointed in this after seeing all over my fyp , there are far better desserts from 7/11 in my opinion"
   - adrianavsworld: "100000/10 / These are phenomenal! It’s a mochi Dubai cookie and it’s super popular all over Asia. The big malls sell them for 3X more. Buy it!"
3. **Rating + price conversion line** (goravepassan, shannonince15, fulltimetrippin): the price is given in baht AND the home currency, as its own line.
   - goravepassan: "Chocolate Lava Cake - 100/10!🍫 / Gotta Ask For It Hot! So Gooey And Rich🤤 / 32 Baht = 72p!"
   - shannonince15: "The muffins have my heart! All different flavours / Blueberry is the best! / 12 baht (0.27p)"
   - fulltimetrippin: "ELECTROLYTES We actually drink one every day. Bangkok heat/humidity is no joke & this helps with hydration. ~ 20 calories per packet. (Cost = 5 THB / $0.15 USD)"
4. **ALL-CAPS product title + explainer paragraph** (liisapihlak, fulltimetrippin, nika_plaksina): a headline naming the category ("THE VIRAL HAIR MASKS", "YADOM INHALERS", "SLEEP GUMMIES") and 30-90 words of benefits. Longest texts in the set.
   - liisapihlak: "Have you even been to Thailand if you didn't stock up on these??? / Locals use these constantly and once you start you genuinely don’t stop, I carry these with me everywhere / YADOM INHALERS / ..."
   - nika_plaksina: "FROM THAI MOSQUITOES — 🫩 THIS IS A MUST / Buy this on your first day! / Smells good, not sticky. ..."
5. **Bare label** (keethc 747K, starrose222 headers): just the product name in 2-5 lowercase words; the photo does the work.
   - keethc: "rojukiss face mask", "yadom thai inhaler", "dove hair vitamin / vaseline brightening serum / antergan (great for heat rash)"

Other observations:
- **First person is the norm** in the long-form templates ("I use these pads every night", "We actually drink one every day", "I literally just had to take a lil hit while writing this"); one-line and label templates are mostly second person / imperative ("Buy this on your first day!", "Don’t skip the instant meals").
- **Social proof words** recur: "viral", "worth the hype", "everyone recommends", "the tiktok girlies came throughhhhh", "overhyped on Tik Tok". Several creators deliberately disagree with the hype (lava cake 3/10 twice, Colgate -100/10, "Don’t get the hype" for balm).
- **Practical tips** are what make a caption long: ask for the lava cake / toastie heated at checkout, put eye masks in the fridge, buy 2-3 mosquito sprays because they sell out, coconut water + espresso.
- **Emoji**: usually 0-1 per slide, mostly at the end of a line (😍 🤤 🤩 🍫 🍌 ☀️); nika_plaksina puts one inside every headline ("PERFECT AFTER 🫢 SPICY THAI FOOD"); rows of emoji only on covers and in post descriptions.
- Text sits in white rounded boxes (TikTok native text style) or white text with black outline, centred in the upper or lower third so the product stays visible.

## 5. Drink-combo posts

**aarono6888-7648908057291918599** (1,100,000 plays, 55,554 saves - the highest save count in the set): "Thailand 🇹🇭 / 7/11 Must Try! Drink Combo / Save this for your next trip!". Five designed infographic slides, three recipes each; each recipe = product cut-outs + "+ Ice" = result cup with a name:

| Slide | Combo name | Exact combo |
|---:|---|---|
| 2 | Lychee Cola | Coke Original + Kato Lychee + Ice |
| 2 | Matchaberry | Nichi Matcha Latte + Meiji Strawberry Milk + Ice |
| 2 | Shark Attack | 2x Kato Soda Blue Hawaii + Hello Sala Syrup + Ice |
| 3 | Pink Lemonade | Kato Strawberry + C-vitt Lemon + Ice |
| 3 | Orange Yogurt | Dutchie Probiotic Yogurt + 2x Malee Orange Juice + Ice |
| 3 | Grape Recharger | Red Bull + Kato Grape + Ice |
| 4 | Creamy Blue Hawaii | Betagen Drinking Yogurt + Kato Soda Blue Hawaii + Ice |
| 4 | Thai Tea Overload | Tiger Thai Tea + Grass Jelly Cup + Ice |
| 4 | Aloe-ha | Aloe Nova Watermelon Aloe + Neo-Lyte Orange + Ice |
| 5 | One Night In Bangkok | Kato Orange + Kato Soda Lychee + Ice |
| 5 | Tropical Blast | Kato Grape + Aloe Nova Original Aloe + Ice |
| 5 | Ultra Glow | if Chrysanthemum + Longan + Ice |
| 6 | Cocoa-nana | Meiji Banana Milk + Milo + Ice |
| 6 | Fruit Chillers | Malee Orange Juice + Kato Grape + Ice |
| 6 | Siamese Ruby | Malee Coconut Water + Aloe Nova Watermelon Aloe + Ice |

(Slide 3 header says "Grape Recharger", the result label says "Grape Recharge".)

Combos inside other posts:

- **adrianavsworld-7646788480843959566** slide 14 (484,000 plays): Malee coconut water + 7-Eleven espresso (iced). Text: "10/10 / Heres a hint. Espresso with milk doesn’t make sense in Thailand (too hot 🥵) instead Thai people love to mix coconut water with espresso. It’s naturally sweet, takes away all the bitterness, and super refreshing!"
- **ellielee996-7650960457527725314** slide 13 (424,600 plays): C-vitt + Neo-Lyte electrolyte sachet + water in an ice cup. Text: "10/10 - I also add this to a ice cup with water and the sachet of electrolytes and it makes the perfect refreshing drink. It’s a MUST try!!"

Kato is the most-used mixer in the cheat sheet (8 of 15 combos), followed by Aloe Nova and Malee (3 each). No other creator in this set shows Kato; Neo-Lyte, C-vitt, Meiji milk and Malee coconut water are the bridge products that also appear as stand-alone recommendations.

