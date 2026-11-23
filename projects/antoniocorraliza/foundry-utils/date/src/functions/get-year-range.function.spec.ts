import { afterEach, beforeEach, describe, expect, inject, it, vi } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { getYearRange } from './get-year-range.function';

const timeZone: string = inject('expectedTimeZone');

describe('getYearRange', () => {
  it('gives the years around the reference year, both ends included', () => {
    expect(getYearRange({ referenceYear: 2026, yearsBefore: 2, yearsAfter: 1 })).toEqual([2024, 2025, 2026, 2027]);
    expect(getYearRange({ referenceYear: 2026, yearsBefore: 0, yearsAfter: 0 })).toEqual([2026]);
  });

  describe('without a reference year', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-12-31T23:30:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('centres the range on the local year of the clock', () => {
      expect(getYearRange({ yearsBefore: 0, yearsAfter: 0 })).toEqual([timeZone === 'Europe/Madrid' ? 2027 : 2026]);
    });
  });

  it.each<unknown>([
    { referenceYear: 2026, yearsBefore: -1, yearsAfter: 0 },
    { referenceYear: 2026, yearsBefore: 1.5, yearsAfter: 0 },
    { referenceYear: 2026, yearsBefore: Number.NaN, yearsAfter: 0 },
    { referenceYear: 2026, yearsBefore: 0, yearsAfter: Number.POSITIVE_INFINITY },
    { referenceYear: 2026, yearsAfter: 0 },
    { referenceYear: 2026, yearsBefore: 0 },
    { referenceYear: 2026.5, yearsBefore: 0, yearsAfter: 0 },
    { referenceYear: 5, yearsBefore: 10, yearsAfter: 0 },
    { referenceYear: 9995, yearsBefore: 0, yearsAfter: 10 },
    undefined,
  ])('throws a RangeError for %j', (options) => {
    expect(catchThrown(() => getYearRange(options as never))).toBeInstanceOf(RangeError);
  });
});
