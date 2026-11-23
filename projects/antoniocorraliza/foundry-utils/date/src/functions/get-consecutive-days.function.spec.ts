import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { getConsecutiveDays } from './get-consecutive-days.function';

describe('getConsecutiveDays', () => {
  it('gives the days from the local day of the start, the date first and the count second', () => {
    expect(getConsecutiveDays(new Date(2026, 2, 1, 15, 30), 2)).toEqual([new Date(2026, 2, 1), new Date(2026, 2, 2)]);
  });

  it('gives an empty list for zero days', () => {
    expect(getConsecutiveDays(new Date(2026, 2, 1), 0)).toEqual([]);
  });

  it('gives up to 36600 days and throws a RangeError beyond them', () => {
    expect(getConsecutiveDays(new Date(2000, 0, 1), 36_600)).toHaveLength(36_600);
    expect(catchThrown(() => getConsecutiveDays(new Date(2000, 0, 1), 36_601))).toBeInstanceOf(RangeError);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('throws a RangeError for a count of %d', (count) => {
    expect(catchThrown(() => getConsecutiveDays(new Date(2026, 2, 1), count))).toBeInstanceOf(RangeError);
  });
});
