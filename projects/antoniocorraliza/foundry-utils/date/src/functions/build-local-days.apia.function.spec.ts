import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { getCalendarMonthGrid } from './get-calendar-month-grid.function';
import { getCalendarWeek } from './get-calendar-week.function';
import { getConsecutiveDays } from './get-consecutive-days.function';
import { getDaysInRange } from './get-days-in-range.function';

describe('buildLocalDays in a time zone that skips a whole day', () => {
  it.each<[string, () => unknown]>([
    ['getDaysInRange', () => getDaysInRange(new Date(2011, 11, 29), new Date(2011, 11, 31))],
    ['getConsecutiveDays', () => getConsecutiveDays(new Date(2011, 11, 29), 3)],
    ['getCalendarWeek', () => getCalendarWeek(new Date(2011, 11, 29))],
    ['getCalendarMonthGrid', () => getCalendarMonthGrid(new Date(2011, 11, 1))],
  ])('throws through %s a RangeError naming the skipped day instead of leaving it out', (_name, listDays) => {
    expect(catchError(listDays, RangeError).message).toContain('2011-12-30');
  });

  it('lists the days around the skipped day when the list does not contain it', () => {
    expect(getDaysInRange(new Date(2011, 11, 31), new Date(2012, 0, 2)).map((date) => date.toISOString())).toEqual([
      '2011-12-30T10:00:00.000Z',
      '2011-12-31T10:00:00.000Z',
      '2012-01-01T10:00:00.000Z',
    ]);
    expect(getCalendarMonthGrid(new Date(2012, 1, 1))).toHaveLength(42);
  });
});
