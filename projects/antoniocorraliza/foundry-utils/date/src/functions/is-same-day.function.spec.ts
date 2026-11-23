import { describe, expect, inject, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { isSameDay } from './is-same-day.function';

const timeZone: string = inject('expectedTimeZone');

describe('isSameDay', () => {
  it('tells two times of the same local day apart from two days', () => {
    expect(isSameDay(new Date(2026, 8, 6, 0, 30), new Date(2026, 8, 6, 23, 59))).toBe(true);
    expect(isSameDay(new Date(2026, 8, 6, 23, 59), new Date(2026, 8, 7, 0, 0))).toBe(false);
  });

  it.runIf(timeZone === 'America/Mexico_City')('decides by the local day, not the UTC day', () => {
    expect(isSameDay(new Date('2026-03-01T03:00:00.000Z'), new Date('2026-03-01T10:00:00.000Z'))).toBe(false);
  });

  it('throws a RangeError for an invalid date, because it compares dates instead of guarding data', () => {
    expect(catchThrown(() => isSameDay(new Date(Number.NaN), new Date(2026, 8, 6)))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => isSameDay(new Date(2026, 8, 6), new Date(Number.NaN)))).toBeInstanceOf(RangeError);
  });
});
