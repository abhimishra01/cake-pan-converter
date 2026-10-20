# Code review, minimalism: cake-pan-converter

Verdict: lean and pass-worthy. No dead features, tests pass, only 4 runtime deps. No must-fix items; a few cheap deletions and one duplicated-geometry cleanup would shrink Tool.astro by roughly 40 lines.

| Sev | file:line | Finding | Why | Fix |
|---|---|---|---|---|
| should | screenshots/* (5 PNGs, 3.2 MB, tracked in git) | Review screenshots are committed, one has a space in its name (`home-390 844-.png`) and is a near-duplicate. | Binary bloat in the repo, not part of the site. | `git rm -r screenshots`, add `screenshots` to .gitignore (ignore list only covers `screenshots/.tmp`). |
| should | scripts/new-tool.sh | Template scaffolding script copied into a finished site. It references `microtool-template` and a sibling `sites/` dir that make no sense here. | Dead script, could clone the wrong thing. | Delete it. Keep the template-level copy only. |
| should | README.md:1-47 | Whole file is the unchanged template README (title "Microtool site template", "replace the demo", mentions a `favicon.svg.ts` that does not exist). | Leftover template text, misleads a future maintainer. | Replace with 10 lines: what the tool is, `npm test`, `npm run build`, where calc lives (`src/lib/calc.js`), deploy note. |
| should | src/components/Tool.astro:139-166, 151, 163 | `drawPan` and `extent` both encode the same geometry (round, bundt radius `sqrt(area/(PI*0.8))`, square, rect). The bundt radius formula appears twice. | Two places to change when a shape changes. | Make `extent(p)` return the `[w,l]` and compute bundt R once (add `bundtRadius(p)` to calc.js or one local const). `drawPan` can then take `[w,l]` from `extent`. |
| should | src/components/Tool.astro:174-185 | Two `<text>` nodes built with 8 `setAttribute` calls each, and `NS` redeclared (also at line 140). | Verbose for a label. | Reuse the existing `mk(tag, attrs)` helper (hoist it to module level) for the text nodes and for `NS`. Saves about 10 lines. |
| should | src/components/Tool.astro:218-225 | Unit literals `6.4516`, `16.387`, `14.4375` and `1000` repeated inline. `14.4375` is already `CUP_CU_IN` in calc.js. | Duplicated constant, easy to drift. | Import `CUP_CU_IN`; add `SQ_IN_TO_CM2`, `CU_IN_TO_ML` constants (or a `areaText`/`volText` helper in calc.js, which also becomes testable). |
| should | src/pages/index.astro:42-47 | In-page link row (About, Privacy, Terms, Contact) under the tool duplicates the Header and Footer nav on the same page. | Third copy of the same four links, no extra value. | Delete the paragraph. |
| nice | src/components/Tool.astro:92-95 | `presetsFor` assigns to a local and returns it. | Needless wrapper body. | `return (PRESETS as any)[state.unit][shape];` |
| nice | src/components/Tool.astro:191 | `update(fromTyping = true)` parameter is never read or passed. | Dead parameter. | Remove it. |
| nice | src/components/Tool.astro:100-101, 195, 336 | Repeated `as unknown as HTMLSelectElement/HTMLTextAreaElement` casts on `inp()`. | Noise. | Make `inp` generic: `const inp = <T extends HTMLElement = HTMLInputElement>(id) => document.getElementById(id) as T;`. |
| nice | src/components/Tool.astro:343 and 268 | Share link built with the same template string twice. | Duplicate. | `const link = () => ...` used in both. |
| nice | src/lib/calc.js:184-188 | `normalize` repeats the `tbsp >= 4` to cup step twice (lines 185 and 188). | Redundant branch order. | Keep one: reorder so tsp to tbsp comes first, then a single tbsp to cup step. Run `npm test` to confirm. |
| nice | src/lib/calc.js:259 | `clamp(depth, 0, 50, SHAPES[shape].depth) \|\| SHAPES[shape].depth` repeats the default. | A depth of 0 falls back anyway. | Use `clamp(depth, 0, 50, 0) \|\| SHAPES[shape].depth`. |
| nice | src/lib/calc.js:236-239 | `unitGap` variable plus a comment ("keep spacing") placed after it, spread over three lines. | Harder to read than needed. | Inline into `joiner`, move the comment above it. |
| nice | src/lib/calc.js:28-35 | `PRESETS.cm.bundt` is a copy of `PRESETS.in.bundt` (cups). | Duplicate data. | Define `const bundtCups = [...]` once and reuse in both. |
| nice | src/components/Header.astro:15 | Brand text "Cake Pan Converter" hardcoded though `site.name` exists. | Template leftover, breaks if name changes. | Render `site.name` (split on the last word if the colored span is wanted). |
| nice | src/components/Article.astro:2 and Faq/Page comments | Fine as is; `Article.astro` has an empty frontmatter with only a comment. | Harmless. | Optional: drop the empty frontmatter block. |
| nice | .playwright-cli/ (untracked, ignored) and dist/ | Local tool output present on disk. | Ignored by git, so no repo cost. | Delete `.playwright-cli` folder when done. |

Checked and fine: runtime dependencies are minimal (astro, sitemap, tailwind; wrangler only as a dev dependency for deploy). No unused components (all 9 are imported). No unused exports of note in calc.js. Client JS bundle is 15.5 KB unminified-ish for the whole tool, which is reasonable. `npm test` passes.
