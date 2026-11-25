import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { getCalendarMonthGrid } from './get-calendar-month-grid.function';
import { getFirstDayOfWeek } from './get-first-day-of-week.function';
import { parseWeekdayOption } from './parse-weekday-option.function';

describe('getCalendarMonthGrid', () => {
  it('gives 42 days from the Monday on or before the first day of the month by default', () => {
    const grid: Array<Date> = getCalendarMonthGrid(new Date(2026, 8, 15, 15, 30));
    expect(grid).toHaveLength(42);
    expect(grid[0]).toEqual(new Date(2026, 7, 31));
    expect(grid[41]).toEqual(new Date(2026, 9, 11));
  });

  it('starts on the first day of the month when it falls on the first day of the week', () => {
    expect(getCalendarMonthGrid(new Date(2026, 5, 20))[0]).toEqual(new Date(2026, 5, 1));
  });

  it('starts on the Sunday on or before the first day of the month when asked', () => {
    expect(getCalendarMonthGrid(new Date(2026, 8, 15), { firstDayOfWeek: 0 })[0]).toEqual(new Date(2026, 7, 30));
  });

  it('takes the first day of the week of a language from outside', () => {
    expect(getCalendarMonthGrid(new Date(2026, 8, 15), { firstDayOfWeek: getFirstDayOfWeek('en-US') })[0]).toEqual(new Date(2026, 7, 30));
  });

  it('rejects a first day of the week out of 0 to 6 as parseWeekdayOption does', () => {
    expect(catchError(() => getCalendarMonthGrid(new Date(2026, 8, 15), { firstDayOfWeek: 7 as 0 }), RangeError).message).toBe(
      catchError(() => parseWeekdayOption({ firstDayOfWeek: 7 }), RangeError).message,
    );
  });
});
