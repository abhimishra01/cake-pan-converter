// The 12 most common conversions on the printable chart. Factors are computed, never typed by hand.
import type { Pan } from './pairs.ts';
const round = (d: number, count = 1) => ({ shape: 'round', a: d, b: 0, depth: 2, count });
const square = (d: number) => ({ shape: 'square', a: d, b: 0, depth: 2, count: 1 });
const nine13 = { shape: 'rect', a: 9, b: 13, depth: 2, count: 1 };
const bundt = (c: number) => ({ shape: 'bundt', a: c, b: 0, depth: 3, count: 1 });
const loaf = (l: number, w: number) => ({ shape: 'loaf', a: l, b: w, depth: 2.75, count: 1 });
type P = Pan & { count: number };
export const chart: { A: P; B: P }[] = [
  { A: round(8), B: round(9) },
  { A: round(9), B: round(8) },
  { A: round(8), B: round(10) },
  { A: round(9), B: round(10) },
  { A: round(8), B: square(8) },
  { A: round(9), B: square(9) },
  { A: square(8), B: nine13 },
  { A: nine13, B: square(9) },
  { A: nine13, B: round(8, 2) },
  { A: round(8, 2), B: nine13 },
  { A: nine13, B: bundt(12) },
  { A: loaf(9, 5), B: loaf(8, 4) },
];
export const sizes: { A: P }[] = [
  { A: round(6) }, { A: round(8) }, { A: round(9) }, { A: round(10) }, { A: square(8) }, { A: square(9) },
  { A: nine13 }, { A: loaf(9, 5) }, { A: loaf(8, 4) }, { A: bundt(12) },
];
