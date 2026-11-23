import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { runWithoutDate } from '@foundry-test/functions/run-without-date.function';
import { addCalendarDays } from './add-calendar-days.function';
import { compareCalendarDays } from './compare-calendar-days.function';
import { formatCalendarDay } from './format-calendar-day.function';
import { getCalendarDayParts } from './get-calendar-day-parts.function';
import { getCalendarDaysBetween } from './get-calendar-days-between.function';
import { isCalendarDay } from './is-calendar-day.function';
import { parseCalendarDay } from './parse-calendar-day.function';
import { toInstantRange } from './to-instant-range.function';
import { toUtcCalendarDateString } from './to-utc-calendar-date-string.function';

type UseCalendarDay = (day: string) => unknown;

const NOT_CANONICAL_DAYS: ReadonlyArray<string> = [
  ' 2026-09-06',
  '2026-09-06 ',
  '2026-9-6',
  '2026-02-29',
  '2026-04-31',
  '0000-01-01',
  '10000-01-01',
  '2026-09-06T00:00',
  '2026/09/06',
  '06/09/2026',
  '20260906',
  '',
];

const DAY_USERS: ReadonlyArray<[string, UseCalendarDay]> = [
  ['addCalendarDays', (day) => addCalendarDays(day, 1)],
  ['getCalendarDaysBetween as the first day', (day) => getCalendarDaysBetween(day, '2026-09-06')],
  ['getCalendarDaysBetween as the second day', (day) => getCalendarDaysBetween('2026-09-06', day)],
  ['compareCalendarDays as the first day', (day) => compareCalendarDays(day, '2026-09-06')],
  ['compareCalendarDays as the second day', (day) => compareCalendarDays('2026-09-06', day)],
  ['getCalendarDayParts', (day) => getCalendarDayParts(day)],
  ['formatCalendarDay', (day) => formatCalendarDay(day, { format: 'eu' })],
  ['toUtcCalendarDateString', (day) => toUtcCalendarDateString(day)],
  ['toInstantRange with a day', (day) => toInstantRange(day)],
  ['toInstantRange as the start', (day) => toInstantRange({ start: day, end: '2026-09-06' })],
  ['toInstantRange as the end', (day) => toInstantRange({ start: '2026-09-06', end: day })],
];

const TEXT_FUNCTIONS: ReadonlyArray<[string, () => unknown]> = [
  ['isCalendarDay', () => isCalendarDay('2026-09-06')],
  ['parseCalendarDay', () => parseCalendarDay('6/9/2026', { format: 'eu' })],
  ['parseCalendarDay with parts', () => parseCalendarDay({ year: 2026, month: 9, day: 6 })],
  ['parseCalendarDay with a midnight instant', () => parseCalendarDay('2026-09-06T00:00:00Z', { acceptMidnightInstant: true })],
  ['formatCalendarDay', () => formatCalendarDay('2026-09-06', { format: 'us' })],
  ['addCalendarDays', () => addCalendarDays('2026-09-05', 1)],
  ['getCalendarDaysBetween', () => getCalendarDaysBetween('2026-01-01', '2026-12-31')],
  ['compareCalendarDays', () => compareCalendarDays('2026-10-01', '2026-09-30')],
  ['getCalendarDayParts', () => getCalendarDayParts('2026-09-06')],
  ['toUtcCalendarDateString with a day', () => toUtcCalendarDateString('2026-09-06')],
];

describe('readCalendarDay', () => {
  describe('through isCalendarDay', () => {
    it.each(['2026-09-06', '0001-01-01', '9999-12-31', '2024-02-29', '2000-02-29'])('accepts the canonical day %j', (day) => {
      expect(isCalendarDay(day)).toBe(true);
    });

    it.each([...NOT_CANONICAL_DAYS, '1900-02-29', '2026-13-01', '2026-00-10', '2026-09-00'])('rejects %j', (day) => {
      expect(isCalendarDay(day)).toBe(false);
    });
  });

  describe.each(DAY_USERS)('through %s', (_name, useDay) => {
    it.each(NOT_CANONICAL_DAYS)('throws a RangeError for %j instead of reading it', (day) => {
      expect(catchThrown(() => useDay(day))).toBeInstanceOf(RangeError);
    });
  });

  describe('through the arithmetic of calendar days', () => {
    it('counts every day of the range, from the first to the last', () => {
      expect(getCalendarDaysBetween('0001-01-01', '9999-12-31')).toBe(3_652_058);
      expect(addCalendarDays('0001-01-01', 3_652_058)).toBe('9999-12-31');
      expect(addCalendarDays('9999-12-31', -3_652_058)).toBe('0001-01-01');
    });

    it.each([
      ['1900-02-28', '1900-03-01'],
      ['2000-02-28', '2000-02-29'],
      ['2100-02-28', '2100-03-01'],
      ['1582-10-04', '1582-10-05'],
      ['0099-12-31', '0100-01-01'],
      ['2026-12-31', '2027-01-01'],
    ])('follows %s with %s in the proleptic Gregorian calendar', (day, next) => {
      expect(addCalendarDays(day, 1)).toBe(next);
      expect(getCalendarDaysBetween(day, next)).toBe(1);
      expect(compareCalendarDays(day, next)).toBe(-1);
    });

    it.each([
      ['0001-01-01', 1],
      ['1970-01-01', 4],
      ['2000-02-29', 2],
      ['2026-09-06', 0],
      ['9999-12-31', 5],
    ])('gives %s the weekday %i', (day, weekday) => {
      expect(getCalendarDayParts(day).weekday).toBe(weekday);
    });
  });

  it.each(TEXT_FUNCTIONS)('gives the same result through %s when Date is not available', (_name, useText) => {
    const expected: unknown = useText();
    expect(runWithoutDate(useText)).toEqual(expected);
  });
});
