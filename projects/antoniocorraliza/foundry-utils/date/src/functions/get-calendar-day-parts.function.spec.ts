import { describe, expect, it } from 'vitest';
import { getCalendarDayParts } from './get-calendar-day-parts.function';

describe('getCalendarDayParts', () => {
  it('gives the year, the month, the day and the weekday, with Sunday as 0', () => {
    expect(getCalendarDayParts('2026-09-06')).toEqual({ year: 2026, month: 9, day: 6, weekday: 0 });
  });

  it('returns a new plain object each time', () => {
    const parts: object = getCalendarDayParts('2026-09-06');
    expect(parts).not.toBe(getCalendarDayParts('2026-09-06'));
    expect(Object.getPrototypeOf(parts)).toBe(Object.prototype);
  });
});
