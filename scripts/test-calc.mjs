import assert from 'node:assert/strict';
import * as c from '../src/lib/calc.js';
const near = (a, b, e = 0.005) => assert.ok(Math.abs(a - b) < e, `${a} vs ${b}`);
const R = (d, depth = 2, count = 1) => ({ shape: 'round', a: d, b: 0, depth, count });
// 8" to 9" round
near(c.convert(R(8), R(9)).scale, 1.2656);
// 9x13 area
near(c.panArea({ shape: 'rect', a: 9, b: 13 }), 117, 0.001);
// 9x13 vs two 8" rounds
near(c.convert({ shape: 'rect', a: 9, b: 13, depth: 2, count: 1 }, R(8, 2, 2)).scale, 100.53 / 117, 0.005);
// two 8" rounds to one 9" round: 63.6 / 100.5
near(c.convert(R(8, 2, 2), R(9)).scale, 0.633, 0.005);
// deeper pan, same area: scale 1.5, depth ratio 1.5
near(c.convert(R(8, 2), R(8, 3)).depthRatio, 1.5);
// 9x5 loaf area 45
near(c.panArea({ shape: 'loaf', a: 5, b: 9 }), 45, 0.001);
// 12 cup bundt volume
near(c.panVolume({ shape: 'bundt', a: 12 }), 173.25, 0.001);
// fractions
assert.equal(c.niceFraction(1.5), '1 1/2');
assert.equal(c.niceFraction(0.34), '1/3');
assert.equal(c.niceFraction(1.97), '2');
assert.equal(c.niceFraction(2), '2');
const s = (l, f) => c.scaleLine(l, f).text;
assert.equal(s('1 1/2 cups flour', 1.2656), '1 7/8 cups flour');
assert.equal(s('2 cups sugar', 1.5), '3 cups sugar');
assert.equal(s('1 tsp baking powder', 0.5), '1/2 tsp baking powder');
assert.equal(s('1/2 cup butter', 0.5), '1/4 cup butter');
assert.equal(s('1/4 cup oil', 0.5), '2 tbsp oil');
assert.equal(s('2 tbsp milk', 2), '1/4 cup milk');
assert.equal(s('½ cup milk', 2), '1 cup milk');
assert.equal(s('200 g flour', 1.27), '254 g flour');
assert.equal(s('1 cup (240 ml) milk', 1.5), '1 1/2 cups (360 ml) milk');
assert.equal(s('3 large eggs', 1.27), '4 large eggs');
assert.ok(c.scaleLine('3 large eggs', 1.5).note.includes('half'));
assert.equal(s('Pinch of salt', 2), 'Pinch of salt');
assert.equal(s('1-2 tsp vanilla', 2), '2-4 tsp vanilla');
assert.equal(s('2 3/4 cups cake flour, sifted', 1), '2 3/4 cups cake flour, sifted');
assert.equal(s('Frosting', 2), 'Frosting');
// bake guide
const g = c.bakeGuide(c.convert(R(8), R(8, 3)), R(8), R(8, 3), 30, 350);
assert.equal(g.kind, 'deeper'); assert.equal(g.temp, 325);
// query round trip
const st = { A: R(8), B: R(9), unit: 'in', temp: 350, minutes: 30, recipe: '1 cup flour' };
const back = c.dec(new URLSearchParams(c.toQuery(st)).get('a'));
assert.equal(back.a, 8);
console.log('all calc tests passed');
