import { describe, expect, inject, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { compareDays } from './compare-days.function';

const timeZone: string = inject('expectedTimeZone');

describe('compareDays', () => {
  it('compares local days and ignores the time', () => {
    expect(compareDays(new Date(2026, 8, 6, 23, 0), new Date(2026, 8, 6, 1, 0))).toBe(0);
    expect(compareDays(new Date(2026, 8, 5, 23, 0), new Date(2026, 8, 6, 1, 0))).toBe(-1);
    expect(compareDays(new Date(2026, 8, 7, 0, 0), new Date(2026, 8, 6, 23, 59))).toBe(1);
  });

  it('sorts dates by day and keeps the order inside a day', () => {
    const late: Date = new Date(2026, 8, 6, 23, 0);
    const early: Date = new Date(2026, 8, 6, 1, 0);
    const before: Date = new Date(2026, 8, 5, 12, 0);
    expect([late, early, before].sort(compareDays)).toEqual([before, late, early]);
  });

  it.runIf(timeZone === 'America/Mexico_City')('decides by the local day, not the UTC day', () => {
    expect(compareDays(new Date('2026-03-01T03:00:00.000Z'), new Date('2026-03-01T10:00:00.000Z'))).toBe(-1);
  });

  it('throws a RangeError for an invalid date', () => {
    expect(catchThrown(() => compareDays(new Date(Number.NaN), new Date(2026, 8, 6)))).toBeInstanceOf(RangeError);
  });
});
