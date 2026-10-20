# Mock-customer test: Cake pan converter

Tester: Shuri. Built with `npm run build`, served from `dist/` on port 4407 (astro preview was already running on 4406 for another reviewer, so I served the same build with a static server on my own port). Each persona used the live page in playwright-cli with real values at the stated viewport.

## Linda, 62, retired, laptop 1280x800, beginner
Task: a 9x13 yellow cake recipe, she owns two 8 inch round pans.
Story: She picked Rectangle, then Round, then looked for "two pans". She found "Number of pans" only after reading every field. Result: 0.86x, "14% less batter". Her list of 8 ingredients scaled well (2 5/8 cups flour, 7/8 cup butter). The egg line said "3 1/2 large eggs" and then "You need about 3.4 eggs. Beat 1 extra egg and use half of it". She stopped and re-read it twice.
- Click on Google over others? Yes, the title says what I want.
- Done under 30 seconds? About 45 seconds. Too long finding the pan count.
- Confused me: "Volume 16.2 cups / 13.9 cups". Is that batter or pan size? Also the egg note (3.4 vs 3 1/2). Also my pasted list scrolls inside a small box, so I could not see all my lines.
- To bookmark: a plain answer sentence such as "Your two 8 inch pans need 86% of the 9x13 recipe".
- Trust: mostly. I wanted a line that says the layers will bake about 5 minutes less.
- Come back: yes.

## Jess, 34, iPhone 390x844, intermediate
Task: 8 inch round recipe to 9 inch round, with a pasted list from a recipe blog (fractions like 1½ and ¾, sticks, "1 (14 oz) can", grams, "pinch").
Story: The page opens with 8 to 9 inch already set, so she had the answer (1.27x) but only after scrolling past two tall forms. On her screen the first view shows only the "Pan in the recipe" form. Unicode fractions pasted fine: 1½ cups became 1 7/8 cups. Sticks, ml and grams scaled. "Pinch of salt" stayed. Bad: "1 1/4 (17.7 oz) can sweetened condensed milk" and "10.1 oz cream cheese". Nobody can buy 1 1/4 cans, and 10.1 oz is not a measure.
- Click on Google? Yes.
- Under 30 seconds? Yes, once I scrolled. I almost missed the result.
- Confused me: the answer is far below the pan forms. The Copy buttons are at the very bottom.
- To bookmark: a sticky result bar at the top on phone. A "Copy result" next to the answer.
- Trust: yes for flour and sugar. No for cans. I would check them by hand.
- Come back: yes, if the answer sits at the top.

## Marcus, 28, small phone 375x667, beginner
Task: banana bread from a 9x5 loaf recipe into a 10 cup bundt pan.
Story: Picked Loaf, then Bundt, 10 cup. Result 1.17x. Ingredients scaled (3 1/2 bananas, 1 1/8 tsp baking soda). "1 egg" stayed "1 egg" with no note, although 1.17x of an egg is not 1. The drawing shows the loaf as "5 x 9" loaf" while the preset menu says "9 x 5"". Width and Length labels are in the opposite order to how people say it. On this small screen the "Recipe bake time (min)" label wraps to two lines and the two boxes sit at different heights.
- Click on Google? Yes.
- Under 30 seconds? About 40 seconds on a phone with many dropdowns.
- Confused me: "Area 45 sq in / 48.1 sq in" for a bundt. A bundt has no flat area. Why show it?
- To bookmark: it needs to say "bundt pans hold less than the label if filled to the top".
- Trust: medium. The bake time advice (check at 55 min) matched what I expected.
- Come back: maybe.

## Priya, 45, iPad 820x1180, experienced
Task: UK blog recipe in grams, 20 cm round at 180 C, she has a 23 cm round.
Story: Centimeters button worked, the presets (20 cm, 23 cm) are right, and the oven label changed to degrees C. Result 1.32x. "150g" with no space parsed. Grams and ml scaled (265 g flour, 159 ml milk, 4 eggs from 3). The drawing and the L/cm2 numbers looked right. Complaint: one button switches both pan size and oven unit. I wanted cm pans but F, because my oven is in F. Also the saved link stores odd numbers (7.874) because it stores inches.
- Click on Google? Yes, I search "cake tin converter" too, and the page mentions it in the text.
- Under 30 seconds? Yes, 25 seconds.
- Confused me: nothing major. The result list is not grouped by what to buy.
- To bookmark: separate oven unit. A weight toggle (cups to grams).
- Trust: yes, the numbers add up. 20 cm to 23 cm matches my own sums.
- Come back: yes.

## Dave, 51, desktop 1440x900, expert (competitive baker)
Task: try to break it. Edge cases and sheet pans.
Story:
- 9x13 to half sheet 13x18 gives "1.00x. Use the recipe as it is" while the half sheet is double the area. The tool compares pan depth (2 in against 1 in), not the batter depth. A real baker fills both pans from the same bowl, so the answer feels wrong. The bake line then says "thinner batter, bakes faster", which contradicts "use as is".
- Ranges scale well: "2-3 tbsp" became "1 1/3-2 tbsp".
- "Preheat oven to 350°F" and "Bake 30 minutes" lines stay untouched. Good. But the line "350 degrees F" on its own was scaled to "235 degrees F".
- "1 1/2 sticks butter" became "1 sticks butter". "1 cup (2 sticks) butter" became "2/3 cup (2 sticks) butter": the bracket was not scaled. "1 tablespoon + 1 teaspoon vanilla" scaled only the first part. "Serves 12" and "Makes 24 cupcakes" did not change.
- "3 eggs, separated" and "1 large egg yolk" produce an egg note on the wrong line ("0.7 eggs").
- A bad pan size shows a clear message and fades the old result. 0, -5, text and empty are caught. 99999 gives "67126705.60x" with no warning. "9,5" is read as 9.5. 
- The link restores everything on reload. Swap works. Copy result worked.
- Click on Google? Yes.
- Done in under 30 seconds? Yes.
- Trust: the pan maths yes (9x13 = 117 sq in, 8 to 9 inch = 1.27). The sheet pan answer, no.
- To bookmark: show batter depth as an input, not only pan depth, or default sheet pans to the same fill.
- Come back: yes if the sheet pan case is fixed.

## Ranked change list (5 personas)
| Rank | Change | Level | Asked by |
|---|---|---|---|
| 1 | On phones, show the scale factor and "Copy result" close to the top (sticky result bar or result before the second form). The answer is below two tall forms. | Must | 3 (Jess, Marcus, Linda) |
| 2 | Fix sheet pan and mixed-depth logic. 9x13 to half sheet says 1.00x. Default sheet depth to the same batter depth, or add a "batter depth" field with a plain note. | Must | 1 (Dave), 2 more who bake sheets would hit it |
| 3 | Fix ingredient parsing: "1 sticks", brackets like "(2 sticks)" and "(8-ounce)" not scaled or scaled wrongly, a lone "350 degrees F" scaled, "1 tbsp + 1 tsp", can counts such as "1 1/4 can", "Serves 12". Show a flag "check this line" instead of a wrong value. | Must | 3 (Jess, Dave, Marcus) |
| 4 | Make "Number of pans" easier to see (put it next to Shape, or add "x2" quick buttons), and add a plain one-line answer: "Two 8 inch rounds need 86% of the recipe". | Should | 2 (Linda, Jess) |
| 5 | Clear egg handling: one note on the egg line only, with a simple rule ("use 3 eggs and 1 tbsp beaten egg"), no note on yolk/white lines, and say "1 egg" stays "1 egg" when under half. | Should | 3 (Linda, Marcus, Dave) |
| 6 | Explain "Volume" (pan capacity, not batter) and hide Area for bundt pans. | Should | 2 (Linda, Marcus) |
| 7 | Split the cm toggle from the oven unit (cm pans with F oven). | Should | 1 (Priya) |
| 8 | Show loaf as "9 x 5" everywhere (labels, drawing, link). Make bake-time label not wrap and align the two boxes at 375 px. | Should | 1 (Marcus) |
| 9 | Make the ingredient box taller or auto-grow so a pasted list is fully visible. | Should | 2 (Linda, Jess) |
| 10 | Warn on absurd sizes (over 60 in or 150 cm). | Nice | 1 (Dave) |
| 11 | Weight toggle (cups to grams) for the scaled list. | Nice | 1 (Priya) |
| 12 | Store the link in the unit the user typed (no 7.874 in cm links). | Nice | 1 (Priya) |

## Overall
All five would click it on Google and return. All five trusted the pan maths (known checks pass: 8 to 9 inch round = 1.27x, 9x13 = 117 sq in, 20 to 23 cm = 1.32x). No page overflow at 375, 390, 820 or 1440 px. The risks are the phone layout (answer too low), the sheet pan answer, and the ingredient edge cases.
