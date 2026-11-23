import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { getCalendarWeek } from './get-calendar-week.function';

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

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('throws a RangeError for %d weeks', (weeks) => {
    expect(catchThrown(() => getCalendarWeek(new Date(2026, 8, 3), { weeks }))).toBeInstanceOf(RangeError);
  });

  it.each([7, -1, 1.5, Number.NaN])('throws a RangeError for the first day of the week %d', (firstDayOfWeek) => {
    expect(catchThrown(() => getCalendarWeek(new Date(2026, 8, 3), { firstDayOfWeek: firstDayOfWeek as 0 }))).toBeInstanceOf(RangeError);
  });
});
