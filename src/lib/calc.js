// Pure maths for the cake pan converter. No DOM here, so node can test it.
// All sizes are stored in inches. Bundt and tube pans are stored as capacity in cups.

export const CUP_CU_IN = 14.4375; // 1 US cup in cubic inches
export const IN_TO_CM = 2.54;
export const SQIN_TO_SQCM = 6.4516;
export const CUIN_TO_ML = 16.387;
export const BUNDT_DEPTH = 3; // effective depth used to compare a bundt pan with flat pans (inches)

// Limits that keep typed input sane (inches, cups, pans).
export const LIMITS = { size: 100, depth: 20, cups: 60, count: 24, minSize: 0.5, minDepth: 0.25, minCups: 1 };

// Bundt depth is only used to compare a bundt pan's area with flat pans; its volume comes from cups.
export const SHAPES = {
  round: { label: 'Round', dims: ['Diameter'], depth: 2 },
  square: { label: 'Square', dims: ['Side'], depth: 2 },
  rect: { label: 'Rectangle', dims: ['Width', 'Length'], depth: 2 },
  loaf: { label: 'Loaf', dims: ['Length', 'Width'], depth: 2.75 },
  bundt: { label: 'Bundt or tube', dims: ['Capacity (cups)'], depth: BUNDT_DEPTH },
  // Fill depth, not rim height: a 9x13 recipe in a half sheet pan fills it to the same depth by default.
  sheet: { label: 'Sheet', dims: ['Width', 'Length'], depth: 2 },
};

export const hasShape = (shape) => Object.hasOwn(SHAPES, shape);

const cm = (n) => n / IN_TO_CM;
const bundtCups = [['6 cup', 6], ['9 cup', 9], ['10 cup', 10], ['12 cup', 12], ['15 cup', 15]];
const cmPair = ([w, l]) => [`${w} x ${l} cm`, cm(w), cm(l)];

// Presets: [label, a, b] with sizes in inches (cm presets are converted).
export const PRESETS = {
  in: {
    round: [['6"', 6], ['7"', 7], ['8"', 8], ['9"', 9], ['10"', 10], ['12"', 12]],
    square: [['6"', 6], ['8"', 8], ['9"', 9], ['10"', 10]],
    rect: [['9 x 13"', 9, 13], ['7 x 11"', 7, 11], ['11 x 15"', 11, 15], ['8 x 12"', 8, 12]],
    loaf: [['9 x 5"', 9, 5], ['8.5 x 4.5"', 8.5, 4.5], ['8 x 4"', 8, 4]],
    bundt: bundtCups,
    sheet: [['Half sheet 13 x 18"', 13, 18], ['Jelly roll 10 x 15"', 10, 15], ['Quarter sheet 9 x 13"', 9, 13]],
  },
  cm: {
    round: [15, 18, 20, 22, 23, 24, 26, 28].map((n) => [`${n} cm`, cm(n)]),
    square: [15, 18, 20, 23, 25].map((n) => [`${n} cm`, cm(n)]),
    rect: [[20, 30], [23, 33], [25, 35]].map(cmPair),
    loaf: [[21, 11], [23, 13], [20, 10]].map(cmPair),
    bundt: bundtCups,
    sheet: [[33, 46], [25, 38]].map(cmPair),
  },
};

// Index of the preset to select when the shape changes. 8" round and 9x13 in inches, 20 cm round in cm.
const defaultIndex = (shape) => (shape === 'round' ? 2 : 0);

export function defaultPan(shape, unit = 'in') {
  const pre = PRESETS[unit][shape][defaultIndex(shape)];
  return { shape, a: pre[1], b: pre[2] || 0, depth: SHAPES[shape].depth, count: 1 };
}

// Radius of the outline drawn for a bundt pan: the ring has a hole of 30% of the radius, and 0.8 of the disc is batter.
export const bundtRadius = (p) => Math.sqrt(panArea(p) / (Math.PI * 0.8));

export function panArea(p) {
  switch (p.shape) {
    case 'round': return Math.PI * (p.a / 2) ** 2;
    case 'square': return p.a * p.a;
    case 'bundt': return panVolume(p) / BUNDT_DEPTH;
    default: return p.a * p.b;
  }
}
export function panVolume(p) {
  if (p.shape === 'bundt') return p.a * CUP_CU_IN;
  return panArea(p) * p.depth;
}

// First problem with a pan, or '' when it is fine. Returns 'size', 'depth' or 'count' so the page can name the field.
export function panProblem(p) {
  if (!hasShape(p.shape)) return 'size';
  const ok = (x, min, max) => Number.isFinite(x) && x >= min && x <= max;
  const bundt = p.shape === 'bundt';
  const two = SHAPES[p.shape].dims.length === 2;
  if (!(bundt ? ok(p.a, LIMITS.minCups, LIMITS.cups) : ok(p.a, LIMITS.minSize, LIMITS.size)) || (two && !ok(p.b, LIMITS.minSize, LIMITS.size))) return 'size';
  if (!bundt && !ok(p.depth, LIMITS.minDepth, LIMITS.depth)) return 'depth';
  if (!Number.isInteger(p.count) || p.count < 1 || p.count > LIMITS.count) return 'count';
  return '';
}
export const panValid = (p) => panProblem(p) === '';

export function fmtNum(n, max = 2) {
  const s = n.toFixed(max);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}
const sizeText = (n, unit) => (unit === 'cm' ? `${fmtNum(n * IN_TO_CM, 1)}` : fmtNum(n, 2));

// Read a size typed by a person: "9", "9.5", "9,5", "8 1/2", "8½", "9 in", "23 cm". NaN when it is not a plain number.
export function parseSize(s) {
  s = String(s).trim().replace(/(inches|inch|in|cm|")$/i, '').trim().replace(/^(\d+),(\d+)$/, '$1.$2');
  if (!/^[\d\s./½¼¾⅓⅔⅛⅜⅝⅞]+$/.test(s) || s === '') return NaN;
  return parseNum(s);
}

// withCount false leaves the pan count out, for places that show it elsewhere.
export function panName(p, unit = 'in', withCount = true) {
  const mark = unit === 'cm' ? ' cm' : '"';
  let size;
  if (p.shape === 'bundt') size = `${fmtNum(p.a, 1)} cup bundt or tube`;
  else if (SHAPES[p.shape].dims.length === 2) {
    // Loaf pans are named long side first (9 x 5), other pans short side first (9 x 13).
    const sorted = [p.a, p.b].sort((m, n) => (p.shape === 'loaf' ? n - m : m - n));
    size = `${sizeText(sorted[0], unit)} x ${sizeText(sorted[1], unit)}${mark} ${p.shape === 'rect' ? 'rectangle' : p.shape}`;
  } else size = `${sizeText(p.a, unit)}${mark} ${p.shape}`;
  return withCount && p.count > 1 ? `${size} (${p.count} pans)` : size;
}

export function convert(A, B) {
  const vA = panVolume(A) * A.count, vB = panVolume(B) * B.count;
  const aA = panArea(A) * A.count, aB = panArea(B) * B.count;
  const dA = vA / aA, dB = vB / aB; // effective batter depth per pan
  return {
    scale: vB / vA,
    areaA: aA, areaB: aB, volA: vA, volB: vB,
    areaRatio: aB / aA,
    depthRatio: dB / dA,
  };
}

// One sentence a person can say out loud, with the factor as a kitchen fraction.
export function sayScale(scale) {
  const frac = niceFraction(scale, FRACTIONS_CUP);
  const exact = Math.abs(eval_(frac) - scale) < 0.02;
  if (frac === '1') return `Use the recipe as it is. Each ingredient times ${scale.toFixed(2)}.`;
  const lead = exact ? 'Make' : 'Make about';
  const body = scale >= 1 ? `${lead} ${frac} times the recipe.` : `${lead} ${frac} of the recipe.`;
  return `${body} Each ingredient times ${scale.toFixed(2)}.`;
}
function eval_(t) {
  return t.split(' ').reduce((sum, part) => sum + (part.includes('/') ? part.split('/')[0] / part.split('/')[1] : Number(part)), 0);
}

// Sheet pans have a 1 inch rim, but the tool fills them to 2 inches like a cake pan. A cake batter fills about half the
// pan depth. Returns { full, text } when the scaled batter would pass two thirds of the rim, or null.
export const SHEET_RIM = 1;
export function fillWarning(B) {
  if (B.shape !== 'sheet') return null;
  const fill = (0.5 * B.depth) / SHEET_RIM;
  if (fill <= 2 / 3) return null;
  const how = fill >= 1 ? 'to the rim' : `about ${niceFraction(fill, [[0, ''], [1 / 2, '1/2'], [2 / 3, '2/3'], [3 / 4, '3/4'], [1, '']])} full`;
  return `Batter will fill this pan ${how}. Aim for 2/3 or less: set the depth to 1 inch, or bake the extra batter as cupcakes.`;
}

// Pans a home baker might own. A pan within 10% of the recipe pan's volume is a good swap.
export const OWNABLE = [
  { id: 'r6', label: '6" round', pan: { shape: 'round', a: 6, b: 0, depth: 2 } },
  { id: 'r8', label: '8" round', pan: { shape: 'round', a: 8, b: 0, depth: 2 } },
  { id: 'r9', label: '9" round', pan: { shape: 'round', a: 9, b: 0, depth: 2 } },
  { id: 'r10', label: '10" round', pan: { shape: 'round', a: 10, b: 0, depth: 2 } },
  { id: 's8', label: '8" square', pan: { shape: 'square', a: 8, b: 0, depth: 2 } },
  { id: 's9', label: '9" square', pan: { shape: 'square', a: 9, b: 0, depth: 2 } },
  { id: 'x13', label: '9 x 13" pan', pan: { shape: 'rect', a: 9, b: 13, depth: 2 } },
  { id: 'l9', label: '9 x 5" loaf', pan: { shape: 'loaf', a: 9, b: 5, depth: 2.75 } },
  { id: 'l8', label: '8 x 4" loaf', pan: { shape: 'loaf', a: 8, b: 4, depth: 2.75 } },
  { id: 'b12', label: '12 cup bundt', pan: { shape: 'bundt', a: 12, b: 0, depth: 3 } },
  { id: 'b10', label: '10 cup bundt', pan: { shape: 'bundt', a: 10, b: 0, depth: 3 } },
];

// Which of the owned pans (ids from OWNABLE) can stand in for pan A? Returns candidates sorted by closeness, with the
// factor for each. Round and square pans are also tried as a pair. `near` is true when within `tol` of A's volume.
export function matchPans(A, ownedIds, tol = 0.1) {
  const out = [];
  const vA = panVolume(A) * A.count;
  for (const o of OWNABLE) {
    if (!ownedIds.includes(o.id)) continue;
    const counts = o.pan.shape === 'round' || o.pan.shape === 'square' ? [1, 2] : [1];
    for (const count of counts) {
      const pan = { ...o.pan, count };
      const scale = (panVolume(pan) * count) / vA;
      out.push({ id: o.id, count, pan, label: count > 1 ? `two ${o.label} pans` : o.label, scale, near: Math.abs(scale - 1) <= tol });
    }
  }
  return out.sort((x, y) => Math.abs(x.scale - 1) - Math.abs(y.scale - 1));
}

export const areaText = (sqIn, unit) => (unit === 'cm' ? `${fmtNum(sqIn * SQIN_TO_SQCM, 1)} cm²` : `${fmtNum(sqIn, 1)} sq in`);
export const volumeText = (cuIn, unit) => (unit === 'cm' ? `${fmtNum((cuIn * CUIN_TO_ML) / 1000, 2)} L` : `${fmtNum(cuIn / CUP_CU_IN, 1)} cups`);

// One plain sentence about the result, for the page and the copy text.
export function describeScale(res, A, B, unit = 'in') {
  const pct = Math.round(Math.abs(res.scale - 1) * 100);
  const [a, b] = [panName(A, unit), panName(B, unit)];
  if (pct === 0) return `${b} holds the same amount of batter as ${a}. Use the recipe as it is.`;
  const more = res.scale > 1;
  return `${b} holds ${pct}% ${more ? 'more' : 'less'} batter than ${a}. Make ${pct}% ${more ? 'more' : 'less'} than the recipe.`;
}

const roundTo = (n, step) => Math.round(n / step) * step;

// Bake time and temperature guide. depthRatio = batter depth in pan B / batter depth in pan A.
// tempUnit is 'F' or 'C'. It is separate from the size unit.
export function bakeGuide(res, A, B, minutes, temp, tempUnit = 'F') {
  const r = res.depthRatio;
  const celsius = tempUnit === 'C';
  const tl = celsius ? '°C' : '°F';
  const drop = celsius ? 15 : 25;
  const out = { kind: 'same', lines: [], range: null, temp: null };
  let lowMul = 0.9, highMul = 1.1, step = 5;
  if (A.shape === 'bundt' || B.shape === 'bundt') {
    // Depth is not a good guide for bundt and tube pans, so use one rule for them.
    out.kind = 'bundt';
    const toBundt = B.shape === 'bundt' && A.shape !== 'bundt';
    const fromBundt = A.shape === 'bundt' && B.shape !== 'bundt';
    if (toBundt) { lowMul = 1; highMul = 1.5; }
    if (fromBundt) { lowMul = 0.6; highMul = 0.9; }
    out.lines.push('Bundt and tube pans are deep and heat from the middle. Keep the oven temperature the same and check often near the end.');
    if (temp) out.temp = Math.round(temp);
  } else if (r > 1.15) {
    out.kind = 'deeper';
    const mid = Math.min(r, 2.5) ** 0.7;
    lowMul = 0.9 * mid; highMul = 1.1 * mid;
    out.lines.push('The batter will be deeper in your pan, so the middle sets later than the edges.');
    out.lines.push(`Lower the oven by about ${drop} ${tl} and bake longer. Tent the top with foil if it browns too fast.`);
    if (temp) out.temp = Math.round(temp - drop);
  } else if (r < 0.85) {
    out.kind = 'shallower';
    const mid = Math.max(r, 0.4) ** 0.7;
    lowMul = 0.9 * mid; highMul = 1.1 * mid;
    out.lines.push('The batter will be thinner in your pan, so it bakes faster.');
    out.lines.push('Keep the oven temperature and start checking early.');
    if (temp) out.temp = Math.round(temp);
  } else {
    lowMul = 0.95; highMul = 1.05; step = 1;
    out.lines.push('The batter depth is close to the recipe pan. Keep the same oven temperature and check at about the same time.');
    if (temp) out.temp = Math.round(temp);
  }
  if (minutes > 0) {
    const lo = Math.max(step, roundTo(minutes * lowMul, step));
    const hi = Math.max(lo, roundTo(minutes * highMul, step));
    out.range = [lo, hi];
  }
  out.lines.push('Fill any pan no more than two thirds full. Bake leftover batter as cupcakes.');
  out.lines.push('This is a guide. Ovens differ. The cake is done when a toothpick comes out clean.');
  return out;
}

/* ---------- Fractions and ingredient scaling ---------- */

const UNICODE_FRACTIONS = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 };
const FRACTIONS_CUP = [[0, ''], [1 / 8, '1/8'], [1 / 4, '1/4'], [1 / 3, '1/3'], [3 / 8, '3/8'], [1 / 2, '1/2'], [5 / 8, '5/8'], [2 / 3, '2/3'], [3 / 4, '3/4'], [7 / 8, '7/8'], [1, '']];
const FRACTIONS_SPOON = [[0, ''], [1 / 8, '1/8'], [1 / 4, '1/4'], [1 / 3, '1/3'], [1 / 2, '1/2'], [2 / 3, '2/3'], [3 / 4, '3/4'], [1, '']];
const FRACTIONS_QUARTER = [[0, ''], [1 / 4, '1/4'], [1 / 2, '1/2'], [3 / 4, '3/4'], [1, '']];

// Rounding mode for printed amounts: 'fine' (eighths and thirds) or 'quarter' (quarters only).
let rounding = 'fine';
export function setRounding(mode) { rounding = mode === 'quarter' ? 'quarter' : 'fine'; }
export const getRounding = () => rounding;
const cupTable = () => (rounding === 'quarter' ? FRACTIONS_QUARTER : FRACTIONS_CUP);
const spoonTable = () => (rounding === 'quarter' ? FRACTIONS_QUARTER : FRACTIONS_SPOON);

export function niceFraction(v, table = cupTable()) {
  let whole = Math.floor(v + 1e-9);
  const frac = v - whole;
  let best = table[0];
  for (const f of table) if (Math.abs(f[0] - frac) < Math.abs(best[0] - frac)) best = f;
  if (best[0] === 1) { whole += 1; best = table[0]; }
  // A small positive amount never prints as 0: it prints as the smallest fraction.
  if (whole === 0 && best[1] === '') return v > 0 ? table[1][1] : '0';
  return [whole > 0 ? String(whole) : '', best[1]].filter(Boolean).join(' ');
}

const FR = '½¼¾⅓⅔⅛⅜⅝⅞';
const NUM = String.raw`(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+,\d{1,2}(?!\d)|\d+-\d+\/\d+|\d+\s*[${FR}]|\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|\.\d+|[${FR}])`;
const RANGE = String.raw`(?:\s*(?:-|–|to)\s*(${NUM}))?`;
const UNIT = String.raw`(?:cups?|c|tablespoons?|tbsp|tbs|tbl|teaspoons?|tsp|grams?|g|kg|ounces?|oz|pounds?|lbs?|lb|ml|milliliters?|millilitres?|l|liters?|litres?|sticks?|pinch(?:es)?)`;
const INNER_UNIT = String.raw`(?:cups?|tablespoons?|tbsp|tbs|teaspoons?|tsp|g|grams?|kg|ml|milliliters?|millilitres?|oz|ounces?|lbs?|pounds?|l|liters?|litres?|sticks?)`;
const STEP_RE = new RegExp(String.raw`^(\s*\d+[.)]\s+)(?=${NUM})`);
const LINE_RE = new RegExp(String.raw`^(\s*(?:[-*•]\s*)?)(${NUM})${RANGE}(\s*)(${UNIT})?(?![A-Za-z])\.?(.*)$`, 'i');
const INNER_RE = new RegExp(String.raw`(${NUM})${RANGE}(\s*)(${INNER_UNIT})(?![A-Za-z])`, 'gi');
// A number that is not an amount to scale: temperatures, times, sizes, servings.
const NOT_AN_AMOUNT_RE = /^\s*(?:°|º|degrees?\b|deg\b|minutes?\b|mins?\b|hours?\b|hrs?\b|inch(?:es)?\b|in\b|"|”|cm\b|mm\b|pans?\b|layers?\b|servings?\b|slices?\b)/i;
const EGG_RE = /\beggs?\b(\s+(?:yolks?|whites?))?/i;
const CONTAINER_RE = /^\s*(?:\([^)]*\)\s*)?(?:cans?|packages?|pkgs?|jars?|box(?:es)?|bags?|containers?|cartons?|bottles?|tubs?|envelopes?|packets?)\b/i;

export function parseNum(s) {
  s = s.trim();
  let m;
  // "1,200" has a thousands comma. "1,5" is a decimal comma.
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) return parseFloat(s.replace(/,/g, ''));
  if (/^\d+,\d{1,2}$/.test(s)) return parseFloat(s.replace(',', '.'));
  if ((m = s.match(/^(\d+)\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/))) return +m[1] + UNICODE_FRACTIONS[m[2]];
  if (UNICODE_FRACTIONS[s] !== undefined) return UNICODE_FRACTIONS[s];
  if ((m = s.match(/^(\d+)[\s-]+(\d+)\/(\d+)$/))) return +m[3] ? +m[1] + m[2] / m[3] : NaN;
  if ((m = s.match(/^(\d+)\/(\d+)$/))) return +m[2] ? m[1] / m[2] : NaN;
  return parseFloat(s);
}

function unitKind(u) {
  u = (u || '').toLowerCase();
  if (/^c(ups?)?$/.test(u)) return 'cup';
  if (/^(tablespoons?|tbsp|tbs|tbl)$/.test(u)) return 'tbsp';
  if (/^(teaspoons?|tsp)$/.test(u)) return 'tsp';
  if (/^(g|grams?)$/.test(u)) return 'g';
  if (u === 'kg') return 'kg';
  if (/^(oz|ounces?)$/.test(u)) return 'oz';
  if (/^(lbs?|pounds?)$/.test(u)) return 'lb';
  if (/^(ml|milli)/.test(u)) return 'ml';
  if (/^(l|lit)/.test(u)) return 'l';
  if (/^stick/.test(u)) return 'stick';
  if (/^pinch/.test(u)) return 'pinch';
  return '';
}

// Turn a quantity and unit kind into display text. Moves small and large amounts to a handier unit.
export function formatAmount(v, kind) {
  ({ v, kind } = normalize(v, kind));
  return render(v, kind);
}
function normalize(v, kind) {
  if (kind === 'cup' && v < 0.25 - 1e-9) { v *= 16; kind = 'tbsp'; }
  if (kind === 'tbsp' && v < 1 - 1e-9) { v *= 3; kind = 'tsp'; }
  if (kind === 'tsp' && v >= 3 - 1e-9) { v /= 3; kind = 'tbsp'; }
  if (kind === 'tbsp' && v >= 4 - 1e-9) { v /= 16; kind = 'cup'; }
  return { v, kind };
}
// "1" and plain fractions take the singular noun: 1 cup, 3/4 cup, 1 1/2 cups.
const isPlural = (t) => t !== '1' && !/^\d+\/\d+$/.test(t);
function render(v, kind) {
  switch (kind) {
    case 'cup': { const t = niceFraction(v); return `${t} ${isPlural(t) ? 'cups' : 'cup'}`; }
    case 'tbsp': return `${niceFraction(v, spoonTable())} tbsp`;
    case 'tsp': return v <= 1 / 16 + 1e-9 ? 'a pinch' : `${niceFraction(v, spoonTable())} tsp`;
    case 'g': return `${v >= 10 ? Math.round(v) : fmtNum(v, 1)} g`;
    case 'ml': return `${v >= 10 ? Math.round(v) : fmtNum(v, 1)} ml`;
    case 'kg': return `${fmtNum(v, 2)} kg`;
    case 'l': return `${fmtNum(v, 2)} l`;
    case 'oz': return `${fmtNum(v, 1)} oz`;
    case 'lb': return `${niceFraction(v)} lb`;
    case 'stick': { const t = niceFraction(v, spoonTable()); return `${t} ${isPlural(t) ? 'sticks' : 'stick'}`; }
    case 'pinch': return v > 1.5 ? `${Math.round(v)} pinches` : 'a pinch';
    default: return niceFraction(v);
  }
}

// "1 1/2-2 cups" style: the unit word appears once, after the second number.
function rangeText(v1, v2, kind) {
  const first = render(v1, kind).replace(/ (cups?|tbsp|tsp|g|ml|oz|lb|kg|l|sticks?)$/, '');
  return `${first}-${render(v2, kind)}`;
}

// Scale every "number unit" pair found in the text (cups, spoons, sticks, grams, ounces and so on).
function scaleInner(text, s) {
  return text.replace(INNER_RE, (m, n1, n2, sp, u) => {
    const kind = unitKind(u);
    const v1 = parseNum(n1) * s;
    if (!Number.isFinite(v1) || (n2 && !Number.isFinite(parseNum(n2)))) return m;
    return n2 ? rangeText(v1, parseNum(n2) * s, kind) : formatAmount(v1, kind);
  });
}

function scaleEggs(rest, v1, v2) {
  const tail = rest.match(EGG_RE)[1] || '';
  const part = /yolk|white/i.test(tail); // yolks and whites come in whole numbers
  const snap = (v) => (v === 0 ? 0 : part ? Math.max(1, Math.round(v)) : Math.max(0.5, Math.round(v * 2) / 2));
  const q = snap(v1);
  const plural = (v2 === null ? q : snap(v2)) > 1 || q === 0;
  const word = (w) => (plural ? `${w}s` : w);
  const noun = tail ? `egg${tail.replace(/(yolk|white)s?/i, (_, w) => word(w))}` : `egg${plural ? 's' : ''}`;
  let note = '';
  if (part) {
    if (Math.abs(v1 - q) > 0.2) note = `Exact scaling gives ${fmtNum(v1, 1)}. Rounded to a whole number.`;
  } else if (q % 1 !== 0) {
    const whole = Math.floor(q);
    note = whole === 0
      ? 'Use about 2 tbsp of a beaten egg (half an egg).'
      : `Use ${whole} whole ${whole === 1 ? 'egg' : 'eggs'} and about 2 tbsp of a beaten egg (half an egg).`;
  }
  const qty = v2 === null ? niceFraction(q) : `${niceFraction(q)}-${niceFraction(snap(v2))}`;
  return { qty, rest: rest.replace(EGG_RE, noun), note };
}

// Scale one ingredient line. Returns { text, note }. A note asks the person to check the line.
export function scaleLine(line, s) {
  const step = line.match(STEP_RE);
  const prefix = step ? step[1] : '';
  const body = step ? line.slice(prefix.length) : line;
  const m = body.match(LINE_RE);
  if (!m) {
    // No quantity at the start. Scale amounts found later in the text, but ask for a check.
    const out = scaleInner(body, s);
    return out === body ? { text: line, note: '' } : { text: prefix + out, note: 'Check this line. It did not start with an amount, so only the amounts inside it were scaled.' };
  }
  const [, lead, n1, n2, sp, unit, restRaw] = m;
  let rest = restRaw;
  const kind = unitKind(unit);
  if (!kind && NOT_AN_AMOUNT_RE.test(rest)) return { text: line, note: '' };
  const v1 = parseNum(n1) * s;
  const v2 = n2 ? parseNum(n2) * s : null;
  if (!Number.isFinite(v1) || (v2 !== null && !Number.isFinite(v2))) return { text: line, note: 'Check this line. The amount could not be read.' };
  let note = '';
  let qty;
  let keep = ''; // text in front of the rest that must not be scaled again
  if (!kind && EGG_RE.test(rest)) {
    ({ qty, rest, note } = scaleEggs(rest, v1, v2));
  } else if (!kind && (/^\s*\(/.test(rest) || CONTAINER_RE.test(rest))) {
    // Cans and packages come in whole units. The size in brackets is the size of one, so it stays.
    const whole = Math.max(1, Math.round(v1));
    qty = String(whole);
    if (Math.abs(v1 - whole) > 0.15) note = `Exact scaling gives ${niceFraction(v1)}. Rounded to whole containers.`;
    const br = rest.match(/^(\s*\([^)]*\))(.*)$/);
    if (br) { keep = br[1]; rest = br[2]; }
  } else if (v2 !== null) {
    qty = kind ? rangeText(v1, v2, kind) : `${niceFraction(v1)}-${niceFraction(v2)}`;
  } else qty = formatAmount(v1, kind);
  rest = scaleInner(rest, s);
  if (qty === 'a pinch' && rest && !/^\s*of\b/i.test(rest)) rest = ` of ${rest.trimStart()}`;
  const gap = kind ? (rest && !/^[\s,.;:)\/]/.test(rest) ? ' ' : '') : (sp && (keep || rest) ? ' ' : '');
  const text = `${prefix}${lead}${qty}${gap}${keep}${rest}`.replace(/\s+$/, '');
  return { text, note };
}

export function scaleRecipe(text, s) {
  return text.split(/\r?\n/).map((l) => (l.trim() ? scaleLine(l, s) : { text: '', note: '' }));
}

/* ---------- URL state ---------- */

// Sizes are written in the unit the person chose, so a link shows 20 and not 7.874.
const enc = (p, unit) => {
  const k = unit === 'cm' && p.shape !== 'bundt' ? IN_TO_CM : 1;
  return [p.shape, fmtNum(p.a * k, 3), fmtNum((p.b || 0) * k, 3), fmtNum(p.depth * k, 3), p.count].join(',');
};
export function dec(str, unit = 'in') {
  if (!str) return null;
  const [shape, a, b, depth, count] = str.split(',');
  if (!hasShape(shape)) return null;
  const k = unit === 'cm' && shape !== 'bundt' ? IN_TO_CM : 1;
  const clamp = (x, lo, hi, d) => { const n = parseFloat(x); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
  const defaultDepth = SHAPES[shape].depth;
  return {
    shape,
    a: clamp(a, 0, 500, 0) / k,
    b: clamp(b, 0, 500, 0) / k,
    depth: (clamp(depth, 0, 100, 0) / (shape === 'bundt' ? 1 : k)) || defaultDepth,
    count: Math.round(clamp(count, 1, LIMITS.count, 1)),
  };
}
// Query string for a fixed pair of pans in inches. Used by the ready-made pages.
export const presetQuery = (A, B) => toQuery({ A: { count: 1, ...A }, B: { count: 1, ...B }, unit: 'in' });
export const RECIPE_URL_LIMIT = 1500;
export function toQuery(state) {
  const q = new URLSearchParams();
  q.set('a', enc(state.A, state.unit));
  q.set('b', enc(state.B, state.unit));
  if (state.unit === 'cm') q.set('u', 'cm');
  if (state.tempUnit === 'C') q.set('tu', 'c');
  if (rounding === 'quarter') q.set('f', '4');
  if (state.temp) q.set('t', String(state.temp));
  if (state.minutes) q.set('m', String(state.minutes));
  if (state.recipe) q.set('r', state.recipe.slice(0, RECIPE_URL_LIMIT));
  return q.toString();
}
