import { describe, expect, it } from 'vitest';
import { formatCalendarDay } from './format-calendar-day.function';

describe('formatCalendarDay', () => {
  it('writes the day as it is in iso by default', () => {
    expect(formatCalendarDay('2026-09-06')).toBe('2026-09-06');
  });

  it('separates eu and us days with a slash by default', () => {
    expect(formatCalendarDay('2026-09-06', { format: 'eu' })).toBe('06/09/2026');
    expect(formatCalendarDay('2026-09-06', { format: 'us' })).toBe('09/06/2026');
  });

  it('returns null for null', () => {
    expect(formatCalendarDay(null)).toBeNull();
  });
});
