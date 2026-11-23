import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { getCalendarMonthGrid } from './get-calendar-month-grid.function';
import { getFirstDayOfWeek } from './get-first-day-of-week.function';

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

  it.each([7, -1, 1.5, Number.NaN])('throws a RangeError for the first day of the week %d', (firstDayOfWeek) => {
    expect(catchThrown(() => getCalendarMonthGrid(new Date(2026, 8, 15), { firstDayOfWeek: firstDayOfWeek as 0 }))).toBeInstanceOf(
      RangeError,
    );
  });
});
