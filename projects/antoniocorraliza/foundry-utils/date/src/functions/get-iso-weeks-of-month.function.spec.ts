import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { getIsoWeeksOfMonth } from './get-iso-weeks-of-month.function';

describe('getIsoWeeksOfMonth', () => {
  it('gives the weeks of the days of the local month, in order and without repeating', () => {
    expect(getIsoWeeksOfMonth(new Date(2026, 8, 15))).toEqual([
      { year: 2026, week: 36 },
      { year: 2026, week: 37 },
      { year: 2026, week: 38 },
      { year: 2026, week: 39 },
      { year: 2026, week: 40 },
    ]);
  });

  it('starts January with the last week of the year before when its first days belong to it', () => {
    expect(getIsoWeeksOfMonth(new Date(2021, 0, 15))[0]).toEqual({ year: 2020, week: 53 });
    expect(getIsoWeeksOfMonth(new Date(2027, 0, 15))[0]).toEqual({ year: 2026, week: 53 });
  });

  it('ends December with the first week of the next year when its last days belong to it', () => {
    expect(getIsoWeeksOfMonth(new Date(2024, 11, 15)).at(-1)).toEqual({ year: 2025, week: 1 });
  });

  it('throws a RangeError for an invalid date', () => {
    expect(catchThrown(() => getIsoWeeksOfMonth(new Date(Number.NaN)))).toBeInstanceOf(RangeError);
  });
});
