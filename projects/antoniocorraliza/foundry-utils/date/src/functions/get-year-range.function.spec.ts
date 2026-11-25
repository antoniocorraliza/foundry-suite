import { afterEach, beforeEach, describe, expect, inject, it, vi } from 'vitest';
import { ɵparseIntegerOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { MAX_YEAR, MIN_YEAR } from '../constants/date-limits.constant';
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

  it.each<unknown>([{ referenceYear: 2026, yearsAfter: 0 }, { referenceYear: 2026, yearsBefore: 0 }, undefined])(
    'throws a TypeError for %j, which leaves out a number of years that has no default',
    (options) => {
      expect(catchThrown(() => getYearRange(options as never))).toBeInstanceOf(TypeError);
    },
  );

  it.each<unknown>([
    { referenceYear: 5, yearsBefore: 10, yearsAfter: 0 },
    { referenceYear: 9995, yearsBefore: 0, yearsAfter: 10 },
  ])('throws a RangeError for %j, whose range leaves the years 1 to 9999', (options) => {
    expect(catchThrown(() => getYearRange(options as never))).toBeInstanceOf(RangeError);
  });

  it('rejects a reference year that is not an integer as parseIntegerOption does', () => {
    expect(catchError(() => getYearRange({ referenceYear: 2026.5, yearsBefore: 0, yearsAfter: 0 }), RangeError).message).toBe(
      catchError(
        () => ɵparseIntegerOption({ options: { referenceYear: 2026.5 }, name: 'referenceYear', minimum: MIN_YEAR, maximum: MAX_YEAR }),
        RangeError,
      ).message,
    );
  });

  it('rejects a number of years that is not an integer of at least 0 as parseIntegerOption does', () => {
    expect(catchError(() => getYearRange({ referenceYear: 2026, yearsBefore: 1.5, yearsAfter: 0 }), RangeError).message).toBe(
      catchError(() => ɵparseIntegerOption({ options: { yearsBefore: 1.5 }, name: 'yearsBefore', minimum: 0 }), RangeError).message,
    );
  });
});
