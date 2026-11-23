import { describe, expect, it } from 'vitest';
import { parseCalendarDay } from './parse-calendar-day.function';

describe('parseCalendarDay in a time zone that skips a whole day', () => {
  it('reads the skipped day, because a calendar day does not depend on the time zone', () => {
    expect(parseCalendarDay('2011-12-30')).toBe('2011-12-30');
  });
});
