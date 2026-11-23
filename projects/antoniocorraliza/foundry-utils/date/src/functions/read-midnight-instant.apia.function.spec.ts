import { describe, expect, it } from 'vitest';
import { parseCalendarDay } from './parse-calendar-day.function';
import { parseDate } from './parse-date.function';

describe('readMidnightInstant in a time zone that skips a whole day', () => {
  it('gives null for the skipped day as a local date', () => {
    expect(parseDate('2011-12-30T00:00:00.000Z', { calendarDate: true })).toBeNull();
  });

  it('reads the skipped day as a calendar day, because a text does not look at the time zone', () => {
    expect(parseCalendarDay('2011-12-30T00:00:00.000Z', { acceptMidnightInstant: true })).toBe('2011-12-30');
  });

  it('gives the UTC midnight of the skipped day when the time zone is utc', () => {
    expect(parseDate('2011-12-30T00:00:00.000Z', { calendarDate: true, timeZone: 'utc' })?.toISOString()).toBe('2011-12-30T00:00:00.000Z');
  });
});
