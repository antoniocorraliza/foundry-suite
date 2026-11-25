import { describe, expect, it } from 'vitest';
import { ɵcheckOptions } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import { isPromiseLike } from '@foundry-test/functions/is-promise-like.function';
import { listFunctionNames } from '@foundry-test/functions/list-function-names.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import type { CallWithOptions } from '@foundry-test/types/call-with-options.type';
import type { LooseFunction } from '@foundry-test/types/loose-function.type';
import * as entry from './public-api';

type UseDate = (date: Date) => unknown;

const DATE_USERS: ReadonlyArray<[string, UseDate]> = [
  ['parseDate', (date) => entry.parseDate(date)],
  ['parseCalendarDay', (date) => entry.parseCalendarDay(date, { acceptMidnightInstant: true })],
  ['parseLocalDateTime', (date) => entry.parseLocalDateTime(date)],
  ['formatDate', (date) => entry.formatDate(date, { time: 'milliseconds' })],
  ['formatTime', (date) => entry.formatTime(date)],
  ['toIsoStringWithOffset', (date) => entry.toIsoStringWithOffset(date)],
  ['toUtcCalendarDateString', (date) => entry.toUtcCalendarDateString(date)],
  ['getDateParts', (date) => entry.getDateParts(date)],
  ['startOfDay', (date) => entry.startOfDay(date)],
  ['endOfDay', (date) => entry.endOfDay(date)],
  ['isSameDay', (date) => entry.isSameDay(date, date)],
  ['compareDays', (date) => entry.compareDays(date, date)],
  ['addDays', (date) => entry.addDays(date, 1)],
  ['getDaysInRange', (date) => entry.getDaysInRange(date, date)],
  ['getConsecutiveDays', (date) => entry.getConsecutiveDays(date, 2)],
  ['getCalendarWeek', (date) => entry.getCalendarWeek(date)],
  ['getCalendarMonthGrid', (date) => entry.getCalendarMonthGrid(date)],
  ['toCalendarDay', (date) => entry.toCalendarDay(date)],
  ['toLocalDateTime', (date) => entry.toLocalDateTime(date)],
  ['getIsoWeek', (date) => entry.getIsoWeek(date)],
  ['getIsoWeeksOfMonth', (date) => entry.getIsoWeeksOfMonth(date)],
];

const OPTION_USERS: ReadonlyArray<[string, CallWithOptions]> = [
  ['parseDate', (options) => entry.parseDate('2026-03-01', options as never)],
  ['parseCalendarDay', (options) => entry.parseCalendarDay('2026-03-01', options as never)],
  ['parseLocalDateTime', (options) => entry.parseLocalDateTime('2026-03-01T10:00', options as never)],
  ['formatDate', (options) => entry.formatDate(new Date(2026, 2, 1), options as never)],
  ['formatTime', (options) => entry.formatTime(new Date(2026, 2, 1), options as never)],
  ['formatCalendarDay', (options) => entry.formatCalendarDay('2026-03-01', options as never)],
  ['formatLocalDateTime', (options) => entry.formatLocalDateTime('2026-03-01T10:00', options as never)],
  ['getDateParts', (options) => entry.getDateParts(new Date(2026, 2, 1), options as never)],
  ['getDaysInRange', (options) => entry.getDaysInRange(new Date(2026, 2, 1), new Date(2026, 2, 2), options as never)],
  ['getCalendarWeek', (options) => entry.getCalendarWeek(new Date(2026, 2, 1), options as never)],
  ['getCalendarMonthGrid', (options) => entry.getCalendarMonthGrid(new Date(2026, 2, 1), options as never)],
  ['toCalendarDay', (options) => entry.toCalendarDay(new Date(2026, 2, 1), options as never)],
  ['getTodayCalendarDay', (options) => entry.getTodayCalendarDay(options as never)],
  ['toInstantRange', (options) => entry.toInstantRange('2026-03-01', options as never)],
  ['toLocalDateTime', (options) => entry.toLocalDateTime(new Date(2026, 2, 1), options as never)],
  ['localDateTimeToDate', (options) => entry.localDateTimeToDate('2026-03-01T10:00', options as never)],
  ['getYearRange', (options) => entry.getYearRange(options as never)],
];

const UNKNOWN_OPTION_VALUES: ReadonlyArray<[string, CallWithOptions, unknown]> = [
  ['parseDate', (options) => entry.parseDate('2026-03-01', options as never), { format: 'EU' }],
  ['parseDate', (options) => entry.parseDate('2026-03-01', options as never), { timeZone: 'UTC' }],
  ['parseDate', (options) => entry.parseDate(1, options as never), { timestampUnit: 'ms' }],
  ['parseDate', (options) => entry.parseDate('2026-03-01', options as never), { calendarDate: 'yes' }],
  ['parseCalendarDay', (options) => entry.parseCalendarDay('2026-03-01', options as never), { format: 'EU' }],
  ['parseCalendarDay', (options) => entry.parseCalendarDay('2026-03-01', options as never), { acceptMidnightInstant: 1 }],
  ['parseCalendarDay', (options) => entry.parseCalendarDay(1, options as never), { acceptMidnightInstant: true, timestampUnit: 'minutes' }],
  ['parseLocalDateTime', (options) => entry.parseLocalDateTime('2026-03-01T10:00', options as never), { format: 'EU' }],
  ['formatDate', (options) => entry.formatDate(new Date(2026, 2, 1), options as never), { separator: '|' }],
  ['formatDate', (options) => entry.formatDate(new Date(2026, 2, 1), options as never), { time: 'hours' }],
  ['formatDate', (options) => entry.formatDate(new Date(2026, 2, 1), options as never), { timeZone: 'gmt' }],
  ['formatTime', (options) => entry.formatTime(new Date(2026, 2, 1), options as never), { precision: 'none' }],
  ['formatCalendarDay', (options) => entry.formatCalendarDay('2026-03-01', options as never), { separator: ',' }],
  ['formatLocalDateTime', (options) => entry.formatLocalDateTime('2026-03-01T10:00', options as never), { format: 'de' }],
  ['getDateParts', (options) => entry.getDateParts(new Date(2026, 2, 1), options as never), { timeZone: 'Z' }],
  ['toCalendarDay', (options) => entry.toCalendarDay(new Date(2026, 2, 1), options as never), { timeZone: 'Z' }],
  ['getTodayCalendarDay', (options) => entry.getTodayCalendarDay(options as never), { timeZone: 'Z' }],
  ['toInstantRange', (options) => entry.toInstantRange('2026-03-01', options as never), { timeZone: 'Z' }],
  ['toLocalDateTime', (options) => entry.toLocalDateTime(new Date(2026, 2, 1), options as never), { timeZone: 'Z' }],
  ['localDateTimeToDate', (options) => entry.localDateTimeToDate('2026-03-01T10:00', options as never), { repeatedTime: 'first' }],
];

const SAMPLE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [
  ['addCalendarDays', ['2026-09-05', 1]],
  ['addDays', [new Date(2026, 8, 5, 12), 1]],
  ['compareCalendarDays', ['2026-09-05', '2026-09-06']],
  ['compareDays', [new Date(2026, 8, 5, 12), new Date(2026, 8, 6, 12)]],
  ['endOfDay', [new Date(2026, 8, 5, 12)]],
  ['formatCalendarDay', ['2026-09-06']],
  ['formatDate', [new Date(2026, 8, 5, 12)]],
  ['formatDuration', [3723]],
  ['formatLocalDateTime', ['2026-11-14T09:30']],
  ['formatTime', [new Date(2026, 8, 5, 12)]],
  ['getCalendarDayParts', ['2026-09-06']],
  ['getCalendarDaysBetween', ['2026-09-05', '2026-09-06']],
  ['getCalendarMonthGrid', [new Date(2026, 8, 5, 12)]],
  ['getCalendarWeek', [new Date(2026, 8, 5, 12)]],
  ['getConsecutiveDays', [new Date(2026, 8, 5, 12), 2]],
  ['getDateParts', [new Date(2026, 8, 5, 12)]],
  ['getDaysInRange', [new Date(2026, 8, 5, 12), new Date(2026, 8, 7, 12)]],
  ['getFirstDayOfWeek', ['es-ES']],
  ['getIsoWeek', [new Date(2026, 8, 5, 12)]],
  ['getIsoWeeksOfMonth', [new Date(2026, 8, 5, 12)]],
  ['getTodayCalendarDay', []],
  ['getYearRange', [{ referenceYear: 2026, yearsBefore: 1, yearsAfter: 1 }]],
  ['isCalendarDay', ['2026-09-06']],
  ['isLocalDateTime', ['2026-11-14T09:30']],
  ['isSameDay', [new Date(2026, 8, 5, 12), new Date(2026, 8, 5, 18)]],
  ['localDateTimeToDate', ['2026-11-14T09:30']],
  ['parseCalendarDay', ['2026-09-06']],
  ['parseDate', ['2026-09-06']],
  ['parseLocalDateTime', ['2026-11-14T09:30']],
  ['splitDuration', [3723]],
  ['startOfDay', [new Date(2026, 8, 5, 12)]],
  ['toCalendarDay', [new Date(2026, 8, 5, 12)]],
  ['toInstantRange', ['2026-09-06']],
  ['toIsoStringWithOffset', [new Date(2026, 8, 5, 12)]],
  ['toLocalDateTime', [new Date(2026, 8, 5, 12)]],
  ['toUtcCalendarDateString', [new Date(2026, 8, 5, 12)]],
];

function isNodeProcess(): boolean {
  return typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function';
}

function createDateOfAnotherContext(time: number): Date {
  return process.getBuiltinModule('node:vm').runInNewContext(`new Date(${time})`) as Date;
}

describe('public API of the date entry', () => {
  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual([
      'addCalendarDays',
      'addDays',
      'compareCalendarDays',
      'compareDays',
      'endOfDay',
      'formatCalendarDay',
      'formatDate',
      'formatDuration',
      'formatLocalDateTime',
      'formatTime',
      'getCalendarDayParts',
      'getCalendarDaysBetween',
      'getCalendarMonthGrid',
      'getCalendarWeek',
      'getConsecutiveDays',
      'getDateParts',
      'getDaysInRange',
      'getFirstDayOfWeek',
      'getIsoWeek',
      'getIsoWeeksOfMonth',
      'getTodayCalendarDay',
      'getYearRange',
      'isCalendarDay',
      'isLocalDateTime',
      'isSameDay',
      'localDateTimeToDate',
      'parseCalendarDay',
      'parseDate',
      'parseLocalDateTime',
      'splitDuration',
      'startOfDay',
      'toCalendarDay',
      'toInstantRange',
      'toIsoStringWithOffset',
      'toLocalDateTime',
      'toUtcCalendarDateString',
    ]);
  });

  it('has a sample call for each export', () => {
    expect(SAMPLE_CALLS.map(([name]) => name).sort()).toEqual(listFunctionNames(entry));
  });

  it.each(SAMPLE_CALLS)('returns no promise from %s', (name, values) => {
    expect(isPromiseLike((entry[name] as LooseFunction)(...values))).toBe(false);
  });

  it.each(DATE_USERS)('leaves the date it receives unchanged through %s', (_name, useDate) => {
    const input: FrozenSnapshot<Date> = freezeAndSnapshot(new Date(2026, 8, 6, 15, 30, 45, 123));
    useDate(input.value);
    expect(input.listChanges()).toEqual([]);
  });

  describe.runIf(isNodeProcess())('with a date of another context', () => {
    it.each(DATE_USERS)('reads it through %s as a date of this context', (_name, useDate) => {
      const time: number = new Date(2026, 8, 6, 15, 30, 45, 123).getTime();
      expect(useDate(createDateOfAnotherContext(time))).toEqual(useDate(new Date(time)));
    });
  });

  it.each(OPTION_USERS)(
    'throws a TypeError through %s for options that are not an object, naming that function',
    (name, callWithOptions) => {
      expect(catchError(() => callWithOptions(5), TypeError).message).toBe(catchError(() => ɵcheckOptions(5, name), TypeError).message);
    },
  );

  it.each(UNKNOWN_OPTION_VALUES)('throws a TypeError through %s for the unknown option %j', (_name, callWithOptions, options) => {
    expect(catchThrown(() => callWithOptions(options))).toBeInstanceOf(TypeError);
  });

  it.each([
    ['parseDate', entry.parseDate],
    ['parseCalendarDay', entry.parseCalendarDay],
    ['parseLocalDateTime', entry.parseLocalDateTime],
  ])('throws a TypeError when map passes the index to %s as its options', (_name, parse) => {
    expect(catchThrown(() => ['2026-03-01'].map(parse as (value: unknown, index: number) => unknown))).toBeInstanceOf(TypeError);
  });
});
