import { describe, expect, it } from 'vitest';
import { findMismatches } from './find-mismatches.function.ts';

describe('findMismatches', () => {
  it('returns the mismatches in order and nothing when every item matches', () => {
    expect(findMismatches([1, 2, 3, 4], (item) => (item % 2 === 0 ? `${item} is even` : null))).toEqual(['2 is even', '4 is even']);
    expect(findMismatches([1, 3], () => null)).toEqual([]);
  });

  it('stops checking at ten mismatches by default', () => {
    const checked: Array<number> = [];
    const items: Array<number> = Array.from({ length: 20 }, (_entry, index) => index);
    const mismatches: Array<string> = findMismatches(items, (item) => {
      checked.push(item);
      return String(item);
    });
    expect([mismatches.length, checked.length]).toEqual([10, 10]);
  });

  it('stops checking at the given maximum', () => {
    expect(findMismatches(['a', 'b', 'c'], (item) => item, 1)).toEqual(['a']);
  });
});
