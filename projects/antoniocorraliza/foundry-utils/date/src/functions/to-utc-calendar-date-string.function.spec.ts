import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { toUtcCalendarDateString } from './to-utc-calendar-date-string.function';

describe('toUtcCalendarDateString', () => {
  it('writes the local day of a date as a UTC midnight in every time zone', () => {
    expect(toUtcCalendarDateString(new Date(2026, 2, 1))).toBe('2026-03-01T00:00:00.000Z');
    expect(toUtcCalendarDateString(new Date(2026, 2, 1, 23, 59, 59, 999))).toBe('2026-03-01T00:00:00.000Z');
  });

  it('writes a calendar day as a UTC midnight, without looking at the time zone', () => {
    expect(toUtcCalendarDateString('2026-03-01')).toBe('2026-03-01T00:00:00.000Z');
  });

  it('throws a RangeError for an invalid date', () => {
    expect(catchThrown(() => toUtcCalendarDateString(new Date(Number.NaN)))).toBeInstanceOf(RangeError);
  });
});
