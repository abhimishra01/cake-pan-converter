# Cake pan converter

Converts a cake recipe from one pan to another. Live at https://cakepanconverter.com (domain not bought yet; until then the site is served from GitHub Pages at https://abhimishra01.github.io/cake-pan-converter/).

It compares the volume of two pans (round, square, rectangle, loaf, sheet, bundt or tube), gives the scale factor, scales a pasted ingredient list with kitchen fractions, gives a bake time and temperature guide, draws both pans to scale, and keeps the whole state in the page address so a link can be shared.

Stack: Astro (static) and Tailwind 4. No backend.

## Where things are

- `src/lib/calc.js`: all the logic, with no browser code. Pan maths, validation, names, the bake guide, ingredient scaling, URL state. Tested by `npm test`.
- `src/components/Tool.astro` and `PanForm.astro`: the tool UI. The script at the end of `Tool.astro` reads the boxes, calls `calc.js` and draws the result.
- `src/components/Article.astro`, `src/data/faq.ts`: the text under the tool. The FAQ also becomes FAQPage schema.
- `src/site.config.ts`: name, domain, brand color, description, the date shown on Privacy and Terms.
- `src/lib/paths.ts`: `url()` for links that work on the domain root and under a sub path.

## Commands

- `npm run dev`: work on the site.
- `npm test`: unit tests for `calc.js` (`node --test`).
- `npm run build`: build into `dist/`.
- `npm run preview`: serve the build.
- `npm run deploy`: run the tests, build, and upload to Cloudflare Pages (needs `npx wrangler login` once, done by the owner).

## How the tool works

- Sizes are stored in inches at full precision. The boxes show inches or centimeters, and a box is read only when someone types in it, so switching units never changes a pan.
- Bundt and tube pans are stored in cups and compared by volume (1 cup = 14.4375 cubic inches).
- Scale factor = volume of your pan x pans, divided by volume of the recipe pan x pans.
- Bake guide: the ratio of batter depth sets the rule (deeper: lower the oven and bake longer; thinner: bake sooner; bundt: one separate rule). The numbers are a rule of thumb, and the page says so.
- Ingredient lines: every amount on the line is scaled (cups, spoons, sticks, grams, ounces). Cans and packages stay whole, and eggs keep a note for the half egg. A line the tool is unsure about gets a "Check this line" note. Lines such as "350 degrees" or "12 servings" are left alone.
- Link format: `#a=<shape,size,size2,depth,count>&b=...&u=cm&tu=c&t=<oven>&m=<minutes>&r=<recipe, first 1500 characters>`. Sizes are in the unit in `u`.
- Limits: sizes up to 100 (inches or cm), depth up to 20, bundt up to 60 cups, 1 to 24 pans.

## GitHub Pages

`.github/workflows/pages.yml` runs on every push to `main`: install, test, build with `PAGES_BASE=/cake-pan-converter/` and `PAGES_SITE=https://abhimishra01.github.io`, then deploy. Canonical links always point to the real domain. To try a Pages build locally: `PAGES_BASE=/cake-pan-converter/ PAGES_SITE=https://abhimishra01.github.io npx astro build --outDir dist-pages`.

## Going live on the real domain

Follow the go-live steps in the microtools playbook (`~/Desktop/personal/microtools/PLAYBOOK.md`): buy the domain, add it to Cloudflare, `npm run deploy`, add Search Console, then GA4 and AdSense IDs in `src/site.config.ts`.
