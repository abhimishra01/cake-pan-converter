// Pure maths for the cake pan converter. No DOM here, so node can test it.
// All sizes are stored in inches. Bundt and tube pans are stored as capacity in cups.

export const CUP_CU_IN = 14.4375; // 1 US cup in cubic inches
export const BUNDT_DEPTH = 3; // effective depth used to compare a bundt pan with flat pans (inches)

export const SHAPES = {
  round: { label: 'Round', dims: ['Diameter'], depth: 2 },
  square: { label: 'Square', dims: ['Side'], depth: 2 },
  rect: { label: 'Rectangle', dims: ['Width', 'Length'], depth: 2 },
  loaf: { label: 'Loaf', dims: ['Width', 'Length'], depth: 2.75 },
  bundt: { label: 'Bundt or tube', dims: ['Capacity (cups)'], depth: BUNDT_DEPTH },
  sheet: { label: 'Sheet', dims: ['Width', 'Length'], depth: 1 },
};

const cm = (n) => n / 2.54;

// Presets: [label, a, b] with sizes in inches (cm presets are converted).
export const PRESETS = {
  in: {
    round: [['6"', 6], ['7"', 7], ['8"', 8], ['9"', 9], ['10"', 10], ['12"', 12]],
    square: [['6"', 6], ['8"', 8], ['9"', 9], ['10"', 10]],
    rect: [['9 x 13"', 9, 13], ['7 x 11"', 7, 11], ['11 x 15"', 11, 15], ['8 x 12"', 8, 12]],
    loaf: [['9 x 5"', 5, 9], ['8.5 x 4.5"', 4.5, 8.5], ['8 x 4"', 4, 8]],
    bundt: [['6 cup', 6], ['9 cup', 9], ['10 cup', 10], ['12 cup', 12], ['15 cup', 15]],
    sheet: [['Half sheet 13 x 18"', 13, 18], ['Jelly roll 10 x 15"', 10, 15], ['Quarter sheet 9 x 13"', 9, 13]],
  },
  cm: {
    round: [15, 18, 20, 22, 23, 24, 26, 28].map((n) => [`${n} cm`, cm(n)]),
    square: [15, 18, 20, 23, 25].map((n) => [`${n} cm`, cm(n)]),
    rect: [[20, 30], [23, 33], [25, 35]].map(([w, l]) => [`${w} x ${l} cm`, cm(w), cm(l)]),
    loaf: [[11, 21], [13, 23], [10, 20]].map(([w, l]) => [`${w} x ${l} cm`, cm(w), cm(l)]),
    bundt: [['6 cup', 6], ['9 cup', 9], ['10 cup', 10], ['12 cup', 12], ['15 cup', 15]],
    sheet: [[33, 46], [25, 38]].map(([w, l]) => [`${w} x ${l} cm`, cm(w), cm(l)]),
  },
};

export function defaultPan(shape) {
  const s = SHAPES[shape];
  const pre = PRESETS.in[shape][shape === 'round' ? 2 : 0];
  return { shape, a: pre[1], b: pre[2] || 0, depth: s.depth, count: 1 };
}

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
export function panValid(p) {
  if (!SHAPES[p.shape]) return false;
  const two = SHAPES[p.shape].dims.length === 2;
  if (!(p.a > 0) || (two && !(p.b > 0))) return false;
  if (p.shape !== 'bundt' && !(p.depth > 0)) return false;
  return p.count >= 1;
}

export function fmtNum(n, max = 2) {
  const s = n.toFixed(max);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}
const sizeText = (n, unit) => (unit === 'cm' ? `${fmtNum(n * 2.54, 1)}` : fmtNum(n, 2));

export function panName(p, unit = 'in') {
  const mark = unit === 'cm' ? ' cm' : '"';
  let size;
  if (p.shape === 'bundt') size = `${fmtNum(p.a, 1)} cup bundt or tube`;
  else if (SHAPES[p.shape].dims.length === 2) {
    const [x, y] = [p.a, p.b].sort((m, n) => m - n);
    size = `${sizeText(x, unit)} x ${sizeText(y, unit)}${mark} ${p.shape === 'rect' ? 'rectangle' : p.shape}`;
  } else size = `${sizeText(p.a, unit)}${mark} ${p.shape}`;
  return p.count > 1 ? `${p.count} x ${size}` : size;
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

const roundTo = (n, step) => Math.round(n / step) * step;

// Bake time and temperature guide. depthRatio = batter depth in pan B / batter depth in pan A.
export function bakeGuide(res, A, B, minutes, temp, unit = 'in') {
  const r = res.depthRatio;
  const tl = unit === 'cm' ? '°C' : '°F';
  const drop = unit === 'cm' ? 15 : 25;
  const out = { kind: 'same', lines: [], range: null, temp: null };
  let mid = 1;
  if (r > 1.15) {
    out.kind = 'deeper';
    mid = Math.min(r, 2.5) ** 0.7;
    out.lines.push('The batter will be deeper in your pan, so the middle sets later than the edges.');
    out.lines.push(`Lower the oven by about ${drop} ${tl} and bake longer. Tent the top with foil if it browns too fast.`);
    if (temp) out.temp = Math.round(temp - drop);
  } else if (r < 0.85) {
    out.kind = 'shallower';
    mid = Math.max(r, 0.4) ** 0.7;
    out.lines.push('The batter will be thinner in your pan, so it bakes faster.');
    out.lines.push('Keep the oven temperature. Start checking early, about when 70% of the original time has passed.');
    if (temp) out.temp = Math.round(temp);
  } else {
    out.lines.push('The batter depth is close to the recipe pan. Keep the same oven temperature and check at about the same time.');
    if (temp) out.temp = Math.round(temp);
  }
  if (minutes > 0) {
    const lo = Math.max(5, roundTo(minutes * mid * 0.9, 5));
    const hi = Math.max(lo, roundTo(minutes * mid * 1.1, 5));
    out.range = [lo, hi];
  }
  if (B.shape === 'bundt' || A.shape === 'bundt') {
    out.lines.push('Bundt and tube pans heat from the middle too, so they often bake a little faster than a flat pan with the same volume.');
  }
  out.lines.push('Fill any pan no more than two thirds full. Bake leftover batter as cupcakes.');
  out.lines.push('This is a guide. Ovens differ. The cake is done when a toothpick comes out clean.');
  return out;
}

/* ---------- Fractions and ingredient scaling ---------- */

const UNI = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 };
const FR_ALL = [[0, ''], [1 / 8, '1/8'], [1 / 4, '1/4'], [1 / 3, '1/3'], [3 / 8, '3/8'], [1 / 2, '1/2'], [5 / 8, '5/8'], [2 / 3, '2/3'], [3 / 4, '3/4'], [7 / 8, '7/8'], [1, '']];
const FR_SPOON = [[0, ''], [1 / 8, '1/8'], [1 / 4, '1/4'], [1 / 3, '1/3'], [1 / 2, '1/2'], [2 / 3, '2/3'], [3 / 4, '3/4'], [1, '']];

export function niceFraction(v, table = FR_ALL) {
  let whole = Math.floor(v + 1e-9);
  const frac = v - whole;
  let best = table[0];
  for (const f of table) if (Math.abs(f[0] - frac) < Math.abs(best[0] - frac)) best = f;
  if (best[0] === 1) { whole += 1; best = table[0]; }
  if (whole === 0 && best[1] === '') return '0';
  return [whole > 0 ? String(whole) : '', best[1]].filter(Boolean).join(' ');
}

const NUM = String.raw`(?:\d+\s*[½¼¾⅓⅔⅛⅜⅝⅞]|\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|\.\d+|[½¼¾⅓⅔⅛⅜⅝⅞])`;
const UNIT = String.raw`(?:cups?|c|tablespoons?|tbsp|tbs|tbl|teaspoons?|tsp|grams?|g|kg|ounces?|oz|pounds?|lbs?|lb|ml|milliliters?|millilitres?|l|liters?|litres?|sticks?|pinch(?:es)?)`;
const LINE_RE = new RegExp(String.raw`^(\s*(?:[-*•]\s*)?)(${NUM})(?:\s*(?:-|–|to)\s*(${NUM}))?(\s*)(${UNIT})?(?![A-Za-z])\.?(.*)$`, 'i');
const INNER_RE = new RegExp(String.raw`(${NUM})(\s*)(g|grams?|kg|ml|milliliters?|millilitres?|oz|ounces?|lbs?|pounds?|l|liters?|litres?)(?![A-Za-z])`, 'gi');

export function parseNum(s) {
  s = s.trim();
  let m;
  if ((m = s.match(/^(\d+)\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/))) return +m[1] + UNI[m[2]];
  if (UNI[s] !== undefined) return UNI[s];
  if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
  if ((m = s.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2];
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
  if (kind === 'tbsp' && v >= 4 - 1e-9) { v /= 16; kind = 'cup'; }
  if (kind === 'tbsp' && v < 1 - 1e-9) { v *= 3; kind = 'tsp'; }
  if (kind === 'tsp' && v >= 3 - 1e-9) { v /= 3; kind = 'tbsp'; }
  if (kind === 'tbsp' && v >= 4 - 1e-9) { v /= 16; kind = 'cup'; }
  return { v, kind };
}
function render(v, kind) {
  const plural = (w, n) => (n > 1 + 1e-9 ? w + 's' : w);
  switch (kind) {
    case 'cup': { const t = niceFraction(v); return `${t} ${plural('cup', v)}`; }
    case 'tbsp': return `${niceFraction(v, FR_SPOON)} tbsp`;
    case 'tsp': return v < 1 / 16 ? 'a pinch' : `${niceFraction(v, FR_SPOON)} tsp`;
    case 'g': return `${v >= 10 ? Math.round(v) : fmtNum(v, 1)} g`;
    case 'ml': return `${v >= 10 ? Math.round(v) : fmtNum(v, 1)} ml`;
    case 'kg': return `${fmtNum(v, 2)} kg`;
    case 'l': return `${fmtNum(v, 2)} l`;
    case 'oz': return `${fmtNum(v, 1)} oz`;
    case 'lb': return `${niceFraction(v)} lb`;
    case 'stick': return `${niceFraction(v, FR_SPOON)} ${plural('stick', v)}`;
    case 'pinch': return v > 1.5 ? `${Math.round(v)} pinches` : 'a pinch';
    default: return niceFraction(v);
  }
}

function scaleInner(text, s) {
  return text.replace(INNER_RE, (m, n, sp, u) => {
    const kind = unitKind(u);
    return formatAmount(parseNum(n) * s, kind);
  });
}

// Scale one ingredient line. Returns { text, note }.
export function scaleLine(line, s) {
  const m = line.match(LINE_RE);
  if (!m) return { text: line, note: '' };
  const [, lead, n1, n2, sp, unit, restRaw] = m;
  let rest = restRaw;
  const kind = unitKind(unit);
  let v1 = parseNum(n1) * s;
  const v2 = n2 ? parseNum(n2) * s : null;
  let note = '';
  let qty;
  if (!kind && /\beggs?\b/i.test(rest)) {
    const half = Math.round(v1 * 2) / 2;
    qty = niceFraction(half);
    if (half % 1 !== 0) note = `You need about ${fmtNum(v1, 1)} eggs. Beat 1 extra egg and use half of it (about 2 tbsp).`;
    if (v2 !== null) qty = `${niceFraction(half)}-${niceFraction(Math.round(v2 * 2) / 2)}`;
  } else if (v2 !== null) {
    qty = `${render(v1, kind)}-${render(v2, kind)}`;
    if (kind) qty = qty.replace(/ (cups?|tbsp|tsp|g|ml|oz|lb|kg|l|sticks?)(?=-)/, '');
  } else qty = formatAmount(v1, kind);
  const unitGap = kind ? '' : (sp && rest ? ' ' : '');
  // When the unit word is not kept (no unit), keep spacing from the original text.
  rest = scaleInner(rest, s);
  const joiner = kind ? (rest && !/^[\s,.;:)]/.test(rest) ? ' ' : '') : unitGap;
  return { text: `${lead}${qty}${joiner}${rest}`.replace(/\s+$/, ''), note };
}

export function scaleRecipe(text, s) {
  return text.split(/\r?\n/).map((l) => (l.trim() ? scaleLine(l, s) : { text: '', note: '' }));
}

/* ---------- URL state ---------- */

const enc = (p) => [p.shape, fmtNum(p.a, 3), fmtNum(p.b || 0, 3), fmtNum(p.depth, 3), p.count].join(',');
export function dec(str) {
  if (!str) return null;
  const [shape, a, b, depth, count] = str.split(',');
  if (!SHAPES[shape]) return null;
  const clamp = (x, lo, hi, d) => { const n = parseFloat(x); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
  return {
    shape,
    a: clamp(a, 0, 500, 0),
    b: clamp(b, 0, 500, 0),
    depth: clamp(depth, 0, 50, SHAPES[shape].depth) || SHAPES[shape].depth,
    count: Math.round(clamp(count, 1, 24, 1)),
  };
}
export function toQuery(state) {
  const q = new URLSearchParams();
  q.set('a', enc(state.A));
  q.set('b', enc(state.B));
  if (state.unit === 'cm') q.set('u', 'cm');
  if (state.temp) q.set('t', String(state.temp));
  if (state.minutes) q.set('m', String(state.minutes));
  if (state.recipe) q.set('r', state.recipe.slice(0, 1500));
  return q.toString();
}
