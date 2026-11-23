import { describe, expect, it } from 'vitest';
import { compareCalendarDays } from './compare-calendar-days.function';

describe('compareCalendarDays', () => {
  it('compares two days like their texts', () => {
    expect(compareCalendarDays('2026-10-01', '2026-09-30')).toBe(1);
    expect(compareCalendarDays('2026-09-30', '2026-10-01')).toBe(-1);
    expect(compareCalendarDays('0999-12-31', '0999-12-31')).toBe(0);
  });

  it('sorts a list of days', () => {
    expect(['2026-10-01', '0050-01-01', '2026-09-30'].sort(compareCalendarDays)).toEqual(['0050-01-01', '2026-09-30', '2026-10-01']);
  });
});
