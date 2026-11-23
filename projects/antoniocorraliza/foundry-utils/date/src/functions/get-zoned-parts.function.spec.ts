import { describe, expect, inject, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { readWallClock } from '@foundry-test/functions/read-wall-clock.function';
import type { FoundryDateParts } from '../interfaces/foundry-date-parts.interface';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { getDateParts } from './get-date-parts.function';
import { getIsoWeek } from './get-iso-week.function';
import { toCalendarDay } from './to-calendar-day.function';
import { toLocalDateTime } from './to-local-date-time.function';

type ReadZonedDay = (date: Date, timeZone: FoundryTimeZoneMode) => unknown;

const timeZone: string = inject('expectedTimeZone');

const ZONED_READERS: ReadonlyArray<[string, ReadZonedDay]> = [
  ['toCalendarDay', (date, mode) => toCalendarDay(date, { timeZone: mode })],
  ['toLocalDateTime', (date, mode) => toLocalDateTime(date, { timeZone: mode })],
  ['getDateParts', (date, mode) => getDateParts(date, { timeZone: mode })],
];

function writeDateParts(date: Date, mode: FoundryTimeZoneMode): string {
  const parts: Required<FoundryDateParts> = getDateParts(date, { timeZone: mode });
  const day: string = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  const time: string = [parts.hours, parts.minutes, parts.seconds].map((part) => String(part).padStart(2, '0')).join(':');
  return `${day}T${time}.${String(parts.milliseconds).padStart(3, '0')}`;
}

function listInstantsOfYear(year: number, stepInMinutes: number): Array<Date> {
  const first: number = Date.UTC(year, 0, 1);
  return Array.from(
    { length: (365 * 1440) / stepInMinutes },
    (_entry, index) => new Date(first + index * stepInMinutes * 60_000 + index * 7),
  );
}

describe('getZonedParts', () => {
  it('reads the same local and UTC day through every function, every 433 minutes of 2026', () => {
    const mismatches: Array<string> = listInstantsOfYear(2026, 433).flatMap((date) => {
      const local: string = readWallClock(date);
      const utc: string = date.toISOString().slice(0, 23);
      const checks: Array<boolean> = [
        toCalendarDay(date) === local.slice(0, 10),
        toLocalDateTime(date) === local.slice(0, 16),
        writeDateParts(date, 'local') === local,
        toCalendarDay(date, { timeZone: 'utc' }) === utc.slice(0, 10),
        toLocalDateTime(date, { timeZone: 'utc' }) === utc.slice(0, 16),
        writeDateParts(date, 'utc') === utc,
        toLocalDateTime(date).slice(0, 10) === toCalendarDay(date),
      ];
      return checks.every(Boolean) ? [] : [date.toISOString()];
    });
    expect(mismatches).toEqual([]);
  });

  describe.each(ZONED_READERS)('through %s', (_name, readDay) => {
    it('throws a RangeError for an invalid date in both modes', () => {
      expect(catchThrown(() => readDay(new Date(Number.NaN), 'local'))).toBeInstanceOf(RangeError);
      expect(catchThrown(() => readDay(new Date(Number.NaN), 'utc'))).toBeInstanceOf(RangeError);
    });

    it('throws a RangeError for a date of the year 10000 in both modes', () => {
      const date: Date = new Date(Date.UTC(10000, 0, 1, 12));
      expect(catchThrown(() => readDay(date, 'local'))).toBeInstanceOf(RangeError);
      expect(catchThrown(() => readDay(date, 'utc'))).toBeInstanceOf(RangeError);
    });

    it.runIf(timeZone !== 'UTC')(
      'measures the range in the mode it reads, where the first instant of the year 1 in UTC is still the year 0',
      () => {
        const date: Date = new Date('0001-01-01T00:00:00.000Z');
        expect(catchThrown(() => readDay(date, 'local'))).toBeInstanceOf(RangeError);
        expect(catchThrown(() => readDay(date, 'utc'))).toBeNull();
      },
    );

    it.runIf(timeZone === 'UTC')('reads the first instant of the year 1 in both modes', () => {
      const date: Date = new Date('0001-01-01T00:00:00.000Z');
      expect(catchThrown(() => readDay(date, 'local'))).toBeNull();
      expect(catchThrown(() => readDay(date, 'utc'))).toBeNull();
    });
  });

  describe('through getIsoWeek', () => {
    it('throws a RangeError for an invalid date', () => {
      expect(catchThrown(() => getIsoWeek(new Date(Number.NaN)))).toBeInstanceOf(RangeError);
    });

    it.runIf(timeZone !== 'UTC')('throws a RangeError for a date whose local year is 0', () => {
      expect(catchThrown(() => getIsoWeek(new Date('0001-01-01T00:00:00.000Z')))).toBeInstanceOf(RangeError);
    });

    it('reads the week of the local day', () => {
      expect(getIsoWeek(new Date(2026, 11, 31, 23, 30))).toEqual({ year: 2026, week: 53 });
      expect(getIsoWeek(new Date(2027, 0, 1, 0, 30))).toEqual({ year: 2026, week: 53 });
      expect(getIsoWeek(new Date(2024, 11, 30, 12))).toEqual({ year: 2025, week: 1 });
    });
  });
});
