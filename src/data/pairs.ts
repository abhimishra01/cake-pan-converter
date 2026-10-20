// Ready-made conversion pages. Each page loads the tool with these two pans.
// Numbers in the text are checked against the calculator by scripts/test-calc.mjs (the "pairs" test).
export type Pan = { shape: string; a: number; b: number; depth: number };

const round = (d: number): Pan => ({ shape: 'round', a: d, b: 0, depth: 2 });
const square = (d: number): Pan => ({ shape: 'square', a: d, b: 0, depth: 2 });
const nine13: Pan = { shape: 'rect', a: 9, b: 13, depth: 2 };
const loaf = (l: number, w: number): Pan => ({ shape: 'loaf', a: l, b: w, depth: 2.75 });
const bundt = (cups: number): Pan => ({ shape: 'bundt', a: cups, b: 0, depth: 3 });
const halfSheet: Pan = { shape: 'sheet', a: 13, b: 18, depth: 2 };

export interface PairPage {
  slug: string;
  title: string; // goes before " | Cake Pan Converter"
  h1: string;
  description: string;
  A: Pan; B: Pan;
  countA?: number; countB?: number;
  intro: string; // the plain answer, with the factor
  notes: string[]; // unique, useful points for this exact swap
  faq: { q: string; a: string }[];
  related: string[]; // slugs
}

export const pairs: PairPage[] = [
  {
    slug: '9x13-to-two-8-inch-round-pans',
    title: 'Convert 9x13 to Two 8 Inch Round Pans',
    h1: '9x13 pan to two 8 inch round pans',
    description: 'A 9x13 recipe fits two 8 inch rounds at 0.86 times the batter. Get the scaled ingredients, bake time and a drawing of both pans.',
    A: nine13, B: round(8), countB: 2,
    intro: 'A 9x13 pan holds 117 square inches of batter. Two 8 inch rounds hold 100.5. Multiply the recipe by 0.86, a little under 7/8, and split the batter evenly between the two pans.',
    notes: [
      'You will have less batter than the 9x13 recipe makes, so cut each amount by about 14%. If that is awkward, use the full recipe and bake the extra batter as 2 or 3 cupcakes.',
      'Weigh the batter into each pan, or use a scale, so both layers match. Uneven layers bake at different speeds.',
      'The batter is the same depth, so keep the oven at the recipe temperature. Thin layers can finish a little early, so start checking 3 to 5 minutes before the recipe time.',
      'Going the other way, a recipe for two 8 inch rounds fits a 9x13 pan at 1.16 times the batter.',
    ],
    faq: [
      { q: 'Can I use two 8 inch rounds for a 9x13 cake recipe?', a: 'Yes. Multiply the recipe by 0.86 and divide the batter between the two pans. If you do not want to cut every amount, use the full recipe and bake the extra as cupcakes.' },
      { q: 'How long do two 8 inch layers bake compared with a 9x13?', a: 'The batter is the same depth, so the time is close to the same. For a recipe that says 35 minutes, start checking at about 33 and use a toothpick.' },
    ],
    related: ['9x13-to-9-inch-round-cake-pan', '8-inch-to-9-inch-round-cake-pan', '9x13-to-12-cup-bundt-pan'],
  },
  {
    slug: '9x13-to-9-inch-round-cake-pan',
    title: 'Convert 9x13 to a 9 Inch Round Pan',
    h1: '9x13 pan to a 9 inch round pan',
    description: 'A single 9 inch round holds 0.54 times a 9x13 recipe. Scale the ingredients, check the bake time, or use two rounds instead.',
    A: nine13, B: round(9),
    intro: 'One 9 inch round covers 63.6 square inches. A 9x13 covers 117. A single 9 inch round takes 0.54 times the recipe, a little over half. If you want the whole recipe, use two 9 inch rounds, which hold 1.09 times as much.',
    notes: [
      'Half a 9x13 recipe is a common trap. Eggs do not halve cleanly. At 0.54 times a 3 egg recipe, you need 1 1/2 eggs: beat one extra egg and use half of it.',
      'Two 9 inch rounds are 127 square inches, so a full 9x13 recipe fits with a little room. Set "Number of pans" to 2 on the pan you will use to see the exact factor.',
      'The batter is the same depth, so keep the oven temperature and check at about the recipe time.',
    ],
    faq: [
      { q: 'How much batter does a 9 inch round hold compared with a 9x13?', a: 'About 54%. A 9x13 holds 117 square inches and a 9 inch round holds 63.6. The depth is the same, so the ratio is the same by volume.' },
      { q: 'Can I bake a full 9x13 recipe in one 9 inch round?', a: 'No. The batter would overflow. Use 0.54 times the recipe, or split a full recipe between two 9 inch rounds.' },
    ],
    related: ['9x13-to-two-8-inch-round-pans', '9-inch-to-8-inch-round-cake-pan', '8-inch-square-to-9-inch-round-cake-pan'],
  },
  {
    slug: '8-inch-to-9-inch-round-cake-pan',
    title: 'Convert 8 Inch to 9 Inch Round Cake Pan',
    h1: '8 inch round to 9 inch round cake pan',
    description: 'Going from an 8 inch to a 9 inch round? Multiply the recipe by 1.27. See scaled ingredients, egg rounding and bake time.',
    A: round(8), B: round(9),
    intro: 'An 8 inch round covers 50.3 square inches and a 9 inch round covers 63.6. Multiply the recipe by 1.27, which is about 1 1/4 times. Every ingredient goes up by 27%.',
    notes: [
      'One inch of diameter looks small, but it adds 27% more batter.',
      'The batter stays the same depth, so keep the oven at the recipe temperature. A wider cake can finish a few minutes sooner, so check early.',
      'A 3 egg recipe needs about 3.8 eggs, so use 4.',
      'The same factor works for an 8 inch square to a 9 inch square, because both ratios are 81 to 64.',
    ],
    faq: [
      { q: 'How much more batter does a 9 inch round need than an 8 inch round?', a: 'About 27% more. Multiply every ingredient by 1.27. A cup of sugar becomes 1 1/4 cups.' },
      { q: 'Do I change the bake time for a 9 inch pan?', a: 'Not much. The batter depth stays the same. Start checking a few minutes early and test with a toothpick.' },
    ],
    related: ['9-inch-to-8-inch-round-cake-pan', '8-inch-square-to-9-inch-round-cake-pan', '9x13-to-9-inch-round-cake-pan'],
  },
  {
    slug: '9-inch-to-8-inch-round-cake-pan',
    title: 'Convert 9 Inch to 8 Inch Round Cake Pan',
    h1: '9 inch round to 8 inch round cake pan',
    description: 'An 8 inch round holds 0.79 times a 9 inch recipe. Scale the ingredients and bake time, and avoid an overfilled pan.',
    A: round(9), B: round(8),
    intro: 'A 9 inch round covers 63.6 square inches and an 8 inch round covers 50.3. Multiply the recipe by 0.79, about 3/4. If you bake the full recipe in the smaller pan, the batter will overflow.',
    notes: [
      'If you do not want to cut every amount, use the full recipe and bake the extra batter as cupcakes. Fill each paper liner two thirds full.',
      'Cut ingredients to 79%. A cup of flour becomes 3/4 cup. Four eggs become 3.2 eggs, so use 3.',
      'The batter stays the same depth, so keep the oven temperature and the recipe time, and test with a toothpick.',
    ],
    faq: [
      { q: 'Can I bake a 9 inch cake recipe in an 8 inch pan?', a: 'Yes, with 79% of the batter. The rest bakes as cupcakes. A full recipe in an 8 inch pan can spill over the rim.' },
      { q: 'What fraction of the recipe is that?', a: 'Close to 3/4. The exact factor is 0.79, and the tool rounds each amount to a size you can measure.' },
    ],
    related: ['8-inch-to-9-inch-round-cake-pan', '9x13-to-9-inch-round-cake-pan', '8-inch-square-to-9-inch-round-cake-pan'],
  },
  {
    slug: 'bundt-pan-to-9x13',
    title: 'Convert a Bundt Pan Recipe to a 9x13 Pan',
    h1: '12 cup bundt pan to 9x13 pan',
    description: 'A 12 cup bundt recipe in a 9x13 pan needs 1.35 times the batter at 2 inches deep. Get the factor, bake time and fixes.',
    A: bundt(12), B: nine13,
    intro: 'A 12 cup bundt pan holds about 12 cups of batter to the rim. A 9x13 pan filled 2 inches deep holds 16.2 cups. Multiply the recipe by 1.35 for a cake the same depth as a normal 9x13. Or keep the amounts as they are for a thinner cake.',
    notes: [
      'Bundt pans are sold by capacity, so this tool compares the two pans by volume, not by area.',
      'The 9x13 cake is shallower than a bundt, so it bakes faster. The recipe time is usually too long. The tool suggests checking at 60% to 90% of it, then testing with a toothpick.',
      'Keep the oven at the recipe temperature. A flat pan does not need the long, slow bake that a deep bundt needs.',
      'Grease the pan well and line the bottom with parchment, so the cake lifts out in one piece.',
    ],
    faq: [
      { q: 'Can I bake bundt cake batter in a 9x13 pan?', a: 'Yes. Pour it in and bake it as a sheet cake. A 12 cup recipe fills the pan about 1 1/2 inches deep if you pour all of it in. It bakes faster than in a bundt pan.' },
      { q: 'How long do I bake it?', a: 'The tool suggests checking at 60% to 90% of the bundt time. A recipe that says 60 minutes may be done between 35 and 55 minutes in a 9x13.' },
    ],
    related: ['9x13-to-12-cup-bundt-pan', 'loaf-pan-to-9x13', '9x13-to-half-sheet-pan'],
  },
  {
    slug: '9x13-to-12-cup-bundt-pan',
    title: 'Convert 9x13 to a 12 Cup Bundt Pan',
    h1: '9x13 pan to 12 cup bundt pan',
    description: 'A 12 cup bundt pan takes 0.74 times a 9x13 recipe. Scale the ingredients and plan a longer bake at the same temperature.',
    A: nine13, B: bundt(12),
    intro: 'A 9x13 pan filled 2 inches deep holds 16.2 cups of batter. A 12 cup bundt pan holds 12. Multiply the recipe by 0.74, which is about 3/4. If your bundt pan holds 10 cups, the factor is 0.62.',
    notes: [
      'Check the capacity on the bottom of the pan or fill it with water cup by cup. Pan makers do not all use the same size.',
      'Fill a bundt pan no more than two thirds full. The batter rises, and a full pan can overflow into the oven.',
      'A deep bundt cake bakes longer than a flat cake. The tool keeps your oven temperature and gives a time range of 1 to 1 1/2 times the recipe time. Check often near the end.',
      'Grease and flour every groove. Let the cake cool in the pan for 10 minutes before you turn it out.',
    ],
    faq: [
      { q: 'How much of a 9x13 recipe fits a 12 cup bundt pan?', a: 'About 74%, or just under 3/4. Fill the bundt pan no more than two thirds full. If you have batter left, bake it as cupcakes.' },
      { q: 'How much longer does a bundt cake bake?', a: 'Plan on 1 to 1 1/2 times the 9x13 time at the same oven temperature. Test with a toothpick near the center.' },
    ],
    related: ['bundt-pan-to-9x13', '9x13-to-two-8-inch-round-pans', '9x13-to-half-sheet-pan'],
  },
  {
    slug: 'loaf-pan-to-9x13',
    title: 'Convert a 9x5 Loaf Pan to a 9x13 Pan',
    h1: '9x5 loaf pan to 9x13 pan',
    description: 'A 9x13 pan needs 1.89 times a 9x5 loaf recipe. See scaled ingredients and a bake time for the shallower cake.',
    A: loaf(9, 5), B: nine13,
    intro: 'A 9x5 loaf pan covers 45 square inches and holds about 8.6 cups at 2 3/4 inches deep. A 9x13 pan filled 2 inches deep holds 16.2 cups. Multiply the recipe by 1.89, close to double.',
    notes: [
      'Most loaf recipes fill the pan deeper than a 9x13 does, so the cake in the flat pan is thinner and bakes faster.',
      'The tool suggests checking at 70% to 90% of the loaf time. A bread that bakes for 60 minutes may be done between 45 and 55 minutes in the flat pan.',
      'If you simply double the recipe, you get 2 times the batter. That is 6% more than the 9x13 holds, so bake the extra as muffins.',
    ],
    faq: [
      { q: 'Can I double a loaf recipe for a 9x13 pan?', a: 'Almost. The exact factor is 1.89, so doubling gives about 6% too much batter. Use 1.89, or double it and bake a few muffins.' },
      { q: 'Does a 9x13 bake faster than a loaf pan?', a: 'Yes. The batter is shallower. Check at 70% to 90% of the loaf time at the same temperature.' },
    ],
    related: ['9x5-loaf-to-8x4-loaf', 'bundt-pan-to-9x13', '9x13-to-half-sheet-pan'],
  },
  {
    slug: '9x5-loaf-to-8x4-loaf',
    title: 'Convert a 9x5 Loaf Pan to an 8x4 Loaf Pan',
    h1: '9x5 loaf pan to 8x4 loaf pan',
    description: 'An 8x4 loaf pan holds 0.71 times a 9x5 recipe. Scale the ingredients and see how the bake time changes.',
    A: loaf(9, 5), B: loaf(8, 4),
    intro: 'A 9x5 loaf pan covers 45 square inches. An 8x4 covers 32. Multiply the recipe by 0.71, about 3/4 minus a little. A full 9x5 recipe in an 8x4 pan will spill over the rim.',
    notes: [
      'Loaf pans vary. Many pans sold as 9x5 measure 8 1/2 by 4 1/2 inside. Measure the top of your pan from inside edge to inside edge and type the real size in the tool.',
      'Use the extra batter for muffins. Fill the liners two thirds full.',
      'Both pans are the same depth, so keep the oven temperature and check at about the recipe time.',
    ],
    faq: [
      { q: 'What is the size difference between a 9x5 and an 8x4 loaf pan?', a: 'The 9x5 holds about 8.6 cups to 2 3/4 inches deep, and the 8x4 holds about 6.1 cups. That is 71% of the batter.' },
      { q: 'How do I scale three eggs to 71%?', a: '3 eggs times 0.71 is 2 1/8, so use 2 eggs. The tool rounds eggs to the nearest half and tells you how to measure half an egg.' },
    ],
    related: ['loaf-pan-to-9x13', '9-inch-to-8-inch-round-cake-pan', 'bundt-pan-to-9x13'],
  },
  {
    slug: '9x13-to-half-sheet-pan',
    title: 'Convert 9x13 to a Half Sheet Pan',
    h1: '9x13 pan to half sheet pan',
    description: 'A half sheet pan (13x18) is twice the area of a 9x13. Multiply by 2, then check the rim: the batter can overflow.',
    A: nine13, B: halfSheet,
    intro: 'A 13x18 half sheet pan covers 234 square inches, twice a 9x13 at 117. The factor is 2.00 at the same batter depth, but a sheet pan rim is only 1 inch tall, so a double batch may fill it to the top.',
    notes: [
      'The tool sets the sheet pan depth to 2 inches by default, like a cake pan. A real sheet pan has a 1 inch rim, so it warns you when the batter would pass two thirds of the rim.',
      'For a thin sheet cake, set the depth of the half sheet to 1 inch. The factor becomes 1.00, so you use the 9x13 recipe once and spread it thin, about half an inch deep.',
      'A thin cake bakes fast. The tool suggests checking at 55% to 70% of the recipe time. Keep the oven temperature.',
      'Line the pan with parchment, because thin cakes stick. Let it cool in the pan before you cut.',
    ],
    faq: [
      { q: 'Can I bake a double 9x13 recipe in a half sheet pan?', a: 'A double batch of a recipe that fills a 9x13 about half full would reach the 1 inch rim of a half sheet pan. That is too full. Use the recipe once for a thin cake, or bake two 9x13 pans.' },
      { q: 'What is a half sheet pan?', a: 'A metal pan that measures 13 by 18 inches with a 1 inch rim. A quarter sheet is 9 by 13, the same size as a standard cake pan.' },
    ],
    related: ['9x13-to-two-8-inch-round-pans', 'bundt-pan-to-9x13', 'loaf-pan-to-9x13'],
  },
  {
    slug: '8-inch-square-to-9-inch-round-cake-pan',
    title: 'Convert 8 Inch Square to 9 Inch Round Pan',
    h1: '8 inch square pan to 9 inch round pan',
    description: 'An 8 inch square and a 9 inch round hold the same batter. The factor is 0.99, so use the recipe as it is.',
    A: square(8), B: round(9),
    intro: 'An 8 inch square covers 64 square inches. A 9 inch round covers 63.6. The factor is 0.99, so use the recipe as it is. These two pans are a near perfect swap.',
    notes: [
      'This is the easiest swap in the cupboard. A cake that asks for an 8 inch square pan bakes well in a 9 inch round, and the other way round.',
      'A 9 inch square is a different story. It covers 81 square inches, so a 9 inch round takes only 0.79 times a 9 inch square recipe.',
      'The batter depth does not change, so keep the oven temperature and check at the recipe time.',
    ],
    faq: [
      { q: 'Is an 8 inch square the same as a 9 inch round?', a: 'By area, yes: 64 and 63.6 square inches. You can use either pan with the same recipe.' },
      { q: 'What round pan replaces a 9 inch square?', a: 'A 10 inch round is 78.5 square inches, close to the 81 of a 9 inch square. The factor from 9 inch square to 10 inch round is 0.97.' },
    ],
    related: ['8-inch-to-9-inch-round-cake-pan', '9-inch-to-8-inch-round-cake-pan', '9x13-to-9-inch-round-cake-pan'],
  },
];

export const bySlug = (slug: string) => pairs.find((p) => p.slug === slug)!;
