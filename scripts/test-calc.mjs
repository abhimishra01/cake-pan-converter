import test from 'node:test';
import assert from 'node:assert/strict';
import * as c from '../src/lib/calc.js';

const near = (a, b, e = 0.005) => assert.ok(Math.abs(a - b) < e, `${a} vs ${b}`);
const R = (d, depth = 2, count = 1) => ({ shape: 'round', a: d, b: 0, depth, count });
const rect = (a, b, depth = 2, count = 1) => ({ shape: 'rect', a, b, depth, count });
const s = (line, f) => c.scaleLine(line, f).text;

test('pan maths and known checks', () => {
  near(c.convert(R(8), R(9)).scale, 1.2656);
  near(c.panArea(rect(9, 13)), 117, 0.001);
  near(c.convert(rect(9, 13), R(8, 2, 2)).scale, 100.53 / 117, 0.005);
  near(c.convert(R(8, 2, 2), R(9)).scale, 0.633, 0.005);
  near(c.convert(R(8, 2), R(8, 3)).depthRatio, 1.5);
  near(c.panArea({ shape: 'loaf', a: 9, b: 5 }), 45, 0.001);
  near(c.panVolume({ shape: 'bundt', a: 12 }), 173.25, 0.001);
  near(c.convert(rect(9, 13), { shape: 'bundt', a: 12, b: 0, depth: 3, count: 1 }).scale, 0.74, 0.005);
});

test('half sheet holds the same fill depth as a 9x13 by default', () => {
  const sheet = { ...c.defaultPan('sheet'), a: 13, b: 18 };
  near(c.convert(rect(9, 13), sheet).scale, 2, 0.001);
});

test('pan validation: limits, Infinity, NaN, count', () => {
  assert.equal(c.panProblem(R(8)), '');
  assert.equal(c.panProblem(R(Infinity)), 'size');
  assert.equal(c.panProblem(R(NaN)), 'size');
  assert.equal(c.panProblem(R(400)), 'size');
  assert.equal(c.panProblem(R(8, 0)), 'depth');
  assert.equal(c.panProblem(R(8, 2, 0)), 'count');
  assert.equal(c.panProblem(R(8, 2, 30)), 'count');
  assert.equal(c.panProblem({ shape: 'constructor', a: 8, b: 0, depth: 2, count: 1 }), 'size');
});

test('parseSize reads fractions and refuses junk', () => {
  assert.equal(c.parseSize('8 1/2'), 8.5);
  assert.equal(c.parseSize('9,5'), 9.5);
  assert.equal(c.parseSize('8½'), 8.5);
  assert.equal(c.parseSize('9 in'), 9);
  assert.equal(c.parseSize('23cm'), 23);
  assert.ok(Number.isNaN(c.parseSize('abc')));
  assert.ok(Number.isNaN(c.parseSize('8 foo')));
  assert.ok(Number.isNaN(c.parseSize('')));
});

test('pan names: loaf long side first, count not mistaken for a size', () => {
  assert.equal(c.panName({ shape: 'loaf', a: 5, b: 9, depth: 2.75, count: 1 }), '9 x 5" loaf');
  assert.equal(c.panName(rect(13, 9)), '9 x 13" rectangle');
  assert.equal(c.panName({ shape: 'loaf', a: 9, b: 5, depth: 2.75, count: 2 }), '9 x 5" loaf (2 pans)');
  assert.equal(c.panName(R(8, 2, 2), 'in', false), '8" round');
  assert.equal(c.panName(c.defaultPan('loaf', 'cm'), 'cm'), '21 x 11 cm loaf');
});

test('describeScale and text helpers', () => {
  const r = c.convert(rect(9, 13), R(8, 2, 2));
  assert.match(c.describeScale(r, rect(9, 13), R(8, 2, 2)), /14% less batter/);
  assert.match(c.describeScale(c.convert(R(8), R(8)), R(8), R(8)), /same amount/);
  assert.equal(c.areaText(117, 'in'), '117 sq in');
  assert.equal(c.volumeText(173.25, 'in'), '12 cups');
});

test('fractions', () => {
  assert.equal(c.niceFraction(1.5), '1 1/2');
  assert.equal(c.niceFraction(0.34), '1/3');
  assert.equal(c.niceFraction(1.97), '2');
  assert.equal(c.niceFraction(2), '2');
  assert.equal(c.niceFraction(0.04), '1/8', 'a small amount never prints as 0');
});

test('ingredient lines: basics', () => {
  assert.equal(s('1 1/2 cups flour', 1.2656), '1 7/8 cups flour');
  assert.equal(s('2 cups sugar', 1.5), '3 cups sugar');
  assert.equal(s('1 tsp baking powder', 0.5), '1/2 tsp baking powder');
  assert.equal(s('1/2 cup butter', 0.5), '1/4 cup butter');
  assert.equal(s('1/4 cup oil', 0.5), '2 tbsp oil');
  assert.equal(s('2 tbsp milk', 2), '1/4 cup milk');
  assert.equal(s('½ cup milk', 2), '1 cup milk');
  assert.equal(s('200 g flour', 1.27), '254 g flour');
  assert.equal(s('1 cup (240 ml) milk', 1.5), '1 1/2 cups (360 ml) milk');
  assert.equal(s('Pinch of salt', 2), 'Pinch of salt');
  assert.equal(s('1-2 tsp vanilla', 2), '2-4 tsp vanilla');
  assert.equal(s('2 3/4 cups cake flour, sifted', 1), '2 3/4 cups cake flour, sifted');
  assert.equal(s('Frosting', 2), 'Frosting');
});

test('hyphenated mixed number is one amount, not a range', () => {
  assert.equal(s('1-1/2 cups sugar', 2), '3 cups sugar');
});

test('tiny amounts never become 0', () => {
  assert.equal(s('1/8 tsp salt', 0.5), 'a pinch of salt');
  assert.ok(!/^0/.test(s('1/4 tsp salt', 0.1)));
});

test('plural follows the printed amount', () => {
  assert.equal(s('3/4 cup milk', 1.34), '1 cup milk');
  assert.equal(s('1 cup milk', 1.0001), '1 cup milk');
  assert.equal(s('1 1/2 sticks butter', 1), '1 1/2 sticks butter');
  assert.equal(s('2 sticks butter', 0.5), '1 stick butter');
});

test('every amount on the line is scaled', () => {
  assert.equal(s('1 cup plus 2 tbsp flour', 2), '2 cups plus 1/4 cup flour');
  assert.equal(s('1 cup (2 sticks) butter', 2), '2 cups (4 sticks) butter');
  assert.equal(s('1 tablespoon + 1 teaspoon vanilla', 2), '2 tbsp + 2 tsp vanilla');
  assert.equal(s('1 cup/240ml milk', 2), '2 cups/480 ml milk');
});

test('cans and packages: whole count, bracket size is not scaled twice', () => {
  const a = c.scaleLine('2 (8 ounce) packages cream cheese', 1.5);
  assert.equal(a.text, '3 (8 ounce) packages cream cheese');
  const b = c.scaleLine('1 (14 oz) can sweetened condensed milk', 1.27);
  assert.equal(b.text, '1 (14 oz) can sweetened condensed milk');
  assert.ok(b.note.includes('Rounded'));
  assert.equal(s('1 can pumpkin', 2), '2 can pumpkin');
});

test('eggs: noun, floor, yolks, note', () => {
  assert.equal(s('3 large eggs', 1.27), '4 large eggs');
  assert.ok(c.scaleLine('3 large eggs', 1.5).note.includes('half'));
  assert.equal(s('2 eggs', 0.5), '1 egg');
  assert.equal(s('1 egg', 2), '2 eggs');
  assert.equal(s('1 large egg', 0.2), '1/2 large egg');
  assert.equal(s('1 egg yolk', 2), '2 egg yolks');
  assert.equal(c.scaleLine('1 large egg yolk', 1.5).note.includes('beaten'), false);
});

test('lines that are not amounts stay as they are', () => {
  assert.equal(s('350 degrees F', 0.67), '350 degrees F');
  assert.equal(s('12 servings', 2), '12 servings');
  assert.equal(c.scaleLine('Serves 12', 2).note, '');
});

test('step numbers do not become amounts; mid-line amounts get a check note', () => {
  assert.equal(s('1. 2 cups flour', 2), '1. 4 cups flour');
  const m = c.scaleLine('Add 1 cup flour to the bowl', 2);
  assert.equal(m.text, 'Add 2 cups flour to the bowl');
  assert.ok(m.note.startsWith('Check this line'));
});

test('bake guide', () => {
  const g = c.bakeGuide(c.convert(R(8), R(8, 3)), R(8), R(8, 3), 30, 350);
  assert.equal(g.kind, 'deeper'); assert.equal(g.temp, 325);
  const gc = c.bakeGuide(c.convert(R(8), R(8, 3)), R(8), R(8, 3), 30, 175, 'C');
  assert.equal(gc.temp, 160);
  const shallow = c.bakeGuide(c.convert(R(8, 2), R(8, 1)), R(8, 2), R(8, 1), 30, 350);
  assert.equal(shallow.kind, 'shallower');
  assert.ok(!shallow.lines.join(' ').includes('70%'));
  const same = c.bakeGuide(c.convert(R(8), R(9)), R(8), R(9), 35, 350);
  assert.deepEqual(same.range, [33, 37]);
});

test('bundt gives one rule, not two opposite ones', () => {
  const bundt = { shape: 'bundt', a: 12, b: 0, depth: 3, count: 1 };
  const g = c.bakeGuide(c.convert(rect(9, 13), bundt), rect(9, 13), bundt, 30, 350);
  assert.equal(g.kind, 'bundt');
  assert.equal(g.temp, 350);
  assert.ok(!g.lines.join(' ').includes('Lower the oven'));
  assert.ok(g.range[1] > 30);
});

test('url state round trip, both units, no drift', () => {
  const st = { A: R(8), B: R(9), unit: 'in', temp: 350, minutes: 30, recipe: '1 cup flour' };
  const back = c.dec(new URLSearchParams(c.toQuery(st)).get('a'));
  assert.equal(back.a, 8);
  const cmState = { ...st, A: { ...R(0), a: 20 / 2.54 }, B: { ...R(0), a: 23 / 2.54 }, unit: 'cm', tempUnit: 'C' };
  const q = new URLSearchParams(c.toQuery(cmState));
  assert.match(q.get('a'), /^round,20,/);
  assert.equal(q.get('tu'), 'c');
  near(c.dec(q.get('a'), 'cm').a, 20 / 2.54, 1e-4);
  // five unit toggles never change a stored size: state stays in inches and is only displayed
  let a = 8;
  for (let i = 0; i < 5; i++) a = c.parseSize(String(Number((a * 2.54).toFixed(1)))) / 2.54;
  assert.ok(Math.abs(a - 8) < 0.02);
});

test('url decoder rejects bad shapes and bad numbers', () => {
  for (const bad of ['constructor,1,0,2,1', '__proto__,1,0,2,1', 'toString,1,0,2,1', 'nope,1,0,2,1', '']) {
    assert.equal(c.dec(bad), null, bad);
  }
  const d = c.dec('round,abc,,x,999');
  assert.equal(d.count, 24);
  assert.equal(d.depth, 2);
});

test('say-out-loud sentence', () => {
  assert.equal(c.sayScale(1.2656), 'Make 1 1/4 times the recipe. Each ingredient times 1.27.');
  assert.equal(c.sayScale(0.79), 'Make about 3/4 of the recipe. Each ingredient times 0.79.');
  assert.equal(c.sayScale(2), 'Make 2 times the recipe. Each ingredient times 2.00.');
  assert.match(c.sayScale(0.994), /^Use the recipe as it is/);
});

test('fill warning only for a sheet pan filled past two thirds of its rim', () => {
  const sheet = { shape: 'sheet', a: 13, b: 18, depth: 2, count: 1 };
  assert.match(c.fillWarning(sheet), /to the rim/);
  assert.equal(c.fillWarning({ ...sheet, depth: 1 }), null);
  assert.equal(c.fillWarning(R(9)), null);
});

test('which pans work: sorted by closeness, pairs tried, 10% rule', () => {
  const out = c.matchPans(R(9), ['r8', 's8', 'r10', 'x13']);
  assert.equal(out[0].id, 's8'); // 64 vs 63.6 sq in
  near(out[0].scale, 64 / 63.617, 0.001);
  assert.ok(out[0].near);
  assert.ok(out.find((m) => m.id === 'r8' && m.count === 1 && !m.near)); // 0.79
  assert.ok(out.find((m) => m.id === 'r8' && m.count === 2)); // two 8 inch rounds: 1.58
  assert.equal(c.matchPans(R(9), []).length, 0);
});

test('quarter rounding mode', () => {
  c.setRounding('quarter');
  try {
    assert.equal(s('1 1/2 cups flour', 1.27), '2 cups flour'); // 1.905 -> 2
    assert.equal(s('1 cup sugar', 1.27), '1 1/4 cups sugar');
    assert.match(c.toQuery({ A: R(8), B: R(9), unit: 'in', tempUnit: 'F', temp: 0, minutes: 0, recipe: '' }), /f=4/);
  } finally { c.setRounding('fine'); }
  assert.equal(s('1 1/2 cups flour', 1.27), '1 7/8 cups flour');
});

test('ready-made pages: text matches the calculator', async () => {
  const { pairs } = await import('../src/data/pairs.ts');
  assert.equal(pairs.length, 10);
  for (const p of pairs) {
    const A = { ...p.A, count: p.countA ?? 1 }, B = { ...p.B, count: p.countB ?? 1 };
    assert.equal(c.panProblem(A), '');
    assert.equal(c.panProblem(B), '');
    const x = c.convert(A, B).scale.toFixed(2);
    assert.ok((p.intro + p.description + p.faq.map((f) => f.a).join(' ')).includes(x), `${p.slug} should state ${x}`);
    assert.ok(p.title.length <= 52 && p.description.length <= 170, p.slug);
    assert.ok(p.notes.length >= 3 && p.faq.length === 2);
    for (const r of p.related) assert.ok(pairs.some((q) => q.slug === r), `${p.slug} links to missing ${r}`);
    // the preset round-trips through the tool's URL decoder
    const q = new URLSearchParams(c.presetQuery(A, B));
    near(c.convert(c.dec(q.get('a')), c.dec(q.get('b'))).scale, c.convert(A, B).scale, 0.0001);
  }
});
