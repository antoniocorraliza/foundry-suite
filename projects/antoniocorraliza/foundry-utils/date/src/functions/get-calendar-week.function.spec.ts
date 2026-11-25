import { describe, expect, it } from 'vitest';
import { ɵparseIntegerOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { MAX_CALENDAR_WEEKS } from '../constants/date-limits.constant';
import { getCalendarWeek } from './get-calendar-week.function';
import { parseWeekdayOption } from './parse-weekday-option.function';

describe('getCalendarWeek', () => {
  it('starts on the Monday of the week by default', () => {
    const week: Array<Date> = getCalendarWeek(new Date(2026, 8, 3, 15, 30));
    expect(week).toHaveLength(7);
    expect(week[0]).toEqual(new Date(2026, 7, 31));
    expect(week[6]).toEqual(new Date(2026, 8, 6));
  });

  it('starts on the Sunday on or before the date when asked', () => {
    expect(getCalendarWeek(new Date(2026, 8, 3), { firstDayOfWeek: 0 })[0]).toEqual(new Date(2026, 7, 30));
    expect(getCalendarWeek(new Date(2026, 8, 6), { firstDayOfWeek: 0 })[0]).toEqual(new Date(2026, 8, 6));
  });

  it('gives several weeks in a row', () => {
    const weeks: Array<Date> = getCalendarWeek(new Date(2026, 8, 3), { weeks: 2 });
    expect(weeks).toHaveLength(14);
    expect(weeks[13]).toEqual(new Date(2026, 8, 13));
  });

  it('gives up to 5228 weeks and throws a RangeError beyond them', () => {
    expect(getCalendarWeek(new Date(2000, 0, 3), { weeks: 5228 })).toHaveLength(36_596);
    expect(catchThrown(() => getCalendarWeek(new Date(2000, 0, 3), { weeks: 5229 }))).toBeInstanceOf(RangeError);
  });

  it('rejects 0 weeks as parseIntegerOption does', () => {
    expect(catchError(() => getCalendarWeek(new Date(2026, 8, 3), { weeks: 0 }), RangeError).message).toBe(
      catchError(() => ɵparseIntegerOption({ options: { weeks: 0 }, name: 'weeks', minimum: 1, maximum: MAX_CALENDAR_WEEKS }), RangeError)
        .message,
    );
  });

  it('rejects a first day of the week out of 0 to 6 as parseWeekdayOption does', () => {
    expect(catchError(() => getCalendarWeek(new Date(2026, 8, 3), { firstDayOfWeek: 7 as 0 }), RangeError).message).toBe(
      catchError(() => parseWeekdayOption({ firstDayOfWeek: 7 }), RangeError).message,
    );
  });
});
