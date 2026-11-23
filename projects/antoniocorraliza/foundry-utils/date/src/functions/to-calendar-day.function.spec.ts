import { describe, expect, it } from 'vitest';
import { parseDate } from './parse-date.function';
import { toCalendarDay } from './to-calendar-day.function';

describe('toCalendarDay', () => {
  it('gives the local day of a date', () => {
    expect(toCalendarDay(new Date(2026, 8, 6, 23, 59))).toBe('2026-09-06');
  });

  it('gives back the day that parseDate read, in every time zone', () => {
    const date: Date | null = parseDate('2026-09-06');
    expect(date === null ? null : toCalendarDay(date)).toBe('2026-09-06');
  });

  it('gives the UTC day when asked', () => {
    expect(toCalendarDay(new Date('2026-09-06T23:30:00.000Z'), { timeZone: 'utc' })).toBe('2026-09-06');
    expect(toCalendarDay(new Date('2026-09-06T00:30:00.000Z'), { timeZone: 'utc' })).toBe('2026-09-06');
  });
});
