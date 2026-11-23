import { describe, expect, inject, it } from 'vitest';
import { DAY_IN_MILLISECONDS } from '@foundry-test/constants/time-units.constant';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createLocalTestDate } from '@foundry-test/functions/create-local-test-date.function';
import { readWallClock } from '@foundry-test/functions/read-wall-clock.function';
import { getCalendarMonthGrid } from './get-calendar-month-grid.function';
import { getCalendarWeek } from './get-calendar-week.function';
import { getConsecutiveDays } from './get-consecutive-days.function';
import { getDaysInRange } from './get-days-in-range.function';

type ListDays = (around: Date) => Array<Date>;

interface DayList {
  readonly name: string;
  readonly listDays: ListDays;
  readonly findFirstDay: (around: string) => string;
  readonly count: number;
}

const timeZone: string = inject('expectedTimeZone');

function addDaysToText(day: string, days: number): string {
  return new Date(Date.parse(day) + days * DAY_IN_MILLISECONDS).toISOString().slice(0, 10);
}

function findMonday(day: string): string {
  const weekday: number = new Date(Date.parse(day)).getUTCDay();
  return addDaysToText(day, -((weekday + 6) % 7));
}

const DAY_LISTS: ReadonlyArray<DayList> = [
  {
    name: 'getDaysInRange',
    listDays: (around) =>
      getDaysInRange(new Date(around.getTime() - 2 * DAY_IN_MILLISECONDS), new Date(around.getTime() + 2 * DAY_IN_MILLISECONDS)),
    findFirstDay: (around) => addDaysToText(around, -2),
    count: 5,
  },
  {
    name: 'getConsecutiveDays',
    listDays: (around) => getConsecutiveDays(new Date(around.getTime() - 2 * DAY_IN_MILLISECONDS), 5),
    findFirstDay: (around) => addDaysToText(around, -2),
    count: 5,
  },
  { name: 'getCalendarWeek', listDays: (around) => getCalendarWeek(around), findFirstDay: (around) => findMonday(around), count: 7 },
  {
    name: 'getCalendarMonthGrid',
    listDays: (around) => getCalendarMonthGrid(around),
    findFirstDay: (around) => findMonday(`${around.slice(0, 8)}01`),
    count: 42,
  },
];

describe('buildLocalDays', () => {
  describe.each(DAY_LISTS)('through $name', ({ listDays, findFirstDay, count }) => {
    it.each([
      ['2026-09-06', 15, 30],
      ['2026-03-29', 2, 30],
      ['2026-10-25', 2, 30],
      ['2026-04-04', 23, 30],
      ['2026-11-14', 0, 0],
    ])('builds each day around %s from its parts, at its first instant, from an input at %i:%i', (day, hours, minutes) => {
      const days: Array<Date> = listDays(createLocalTestDate(day, hours, minutes));
      const firstDay: string = findFirstDay(day);
      expect(days.map((date) => readWallClock(date).slice(0, 10))).toEqual(
        Array.from({ length: count }, (_entry, index) => addDaysToText(firstDay, index)),
      );
      expect(days.filter((date) => readWallClock(new Date(date.getTime() - 1)).slice(0, 10) === readWallClock(date).slice(0, 10))).toEqual(
        [],
      );
    });

    it('builds the days of the year 50 in that year', () => {
      const days: Array<Date> = listDays(createLocalTestDate('0050-06-14'));
      expect(days.every((date) => date.getFullYear() === 50)).toBe(true);
    });

    it('returns a new list of new dates each time', () => {
      const input: Date = createLocalTestDate('2026-11-14', 0);
      const first: Array<Date> = listDays(input);
      const second: Array<Date> = listDays(input);
      expect(first).not.toBe(second);
      expect(first[0]).not.toBe(second[0]);
      expect(first.includes(input)).toBe(false);
    });

    it('throws a RangeError for an invalid date', () => {
      expect(catchThrown(() => listDays(new Date(Number.NaN)))).toBeInstanceOf(RangeError);
    });

    it('throws a RangeError when a day falls in the year 10000', () => {
      expect(catchThrown(() => listDays(createLocalTestDate('9999-12-31')))).toBeInstanceOf(RangeError);
    });

    it.runIf(timeZone === 'America/Santiago')('gives the day without a midnight at 01:00', () => {
      const days: Array<Date> = listDays(createLocalTestDate('2026-09-06', 15, 30));
      expect(days.find((date) => readWallClock(date).startsWith('2026-09-06'))?.toISOString()).toBe('2026-09-06T04:00:00.000Z');
    });
  });

  it('throws a RangeError for a week that starts in the year 0', () => {
    expect(catchThrown(() => getCalendarWeek(createLocalTestDate('0001-01-01'), { firstDayOfWeek: 0 }))).toBeInstanceOf(RangeError);
  });
});
