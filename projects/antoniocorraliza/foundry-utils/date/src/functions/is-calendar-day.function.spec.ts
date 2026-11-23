import { describe, expect, it } from 'vitest';
import { isCalendarDay } from './is-calendar-day.function';

describe('isCalendarDay', () => {
  it.each<unknown>([null, undefined, 3, new String('2026-09-06'), new Date(2026, 8, 6), { year: 2026, month: 9, day: 6 }])(
    'gives false for %j without throwing',
    (value) => {
      expect(isCalendarDay(value)).toBe(false);
    },
  );

  it('filters a list without throwing and ignores the index', () => {
    expect(['2026-09-06', 3, '2026-9-6', null].filter(isCalendarDay)).toEqual(['2026-09-06']);
  });
});
