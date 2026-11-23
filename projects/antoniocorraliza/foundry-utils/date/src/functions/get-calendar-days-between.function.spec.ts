import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { addCalendarDays } from './add-calendar-days.function';
import { compareCalendarDays } from './compare-calendar-days.function';
import { getCalendarDaysBetween } from './get-calendar-days-between.function';

const CANONICAL_DAY: fc.Arbitrary<string> = fc
  .date({ min: new Date('0001-01-01T00:00:00.000Z'), max: new Date('9999-12-31T00:00:00.000Z'), noInvalidDate: true })
  .map((date) => `${String(date.getUTCFullYear()).padStart(4, '0')}-${date.toISOString().slice(5, 10)}`);

describe('getCalendarDaysBetween', () => {
  it('counts whole days, signed, with a day always one day long', () => {
    expect(getCalendarDaysBetween('2026-01-01', '2026-12-31')).toBe(364);
    expect(getCalendarDaysBetween('2026-09-07', '2026-09-06')).toBe(-1);
    expect(getCalendarDaysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(getCalendarDaysBetween('2026-09-06', '2026-09-06')).toBe(0);
  });

  it('agrees with addCalendarDays and compareCalendarDays for any two days', () => {
    fc.assert(
      fc.property(CANONICAL_DAY, CANONICAL_DAY, (first, second) => {
        const days: number = getCalendarDaysBetween(first, second);
        return (
          Number.isInteger(days) &&
          addCalendarDays(first, days) === second &&
          compareCalendarDays(first, second) === Math.sign(getCalendarDaysBetween(second, first))
        );
      }),
    );
  });
});
