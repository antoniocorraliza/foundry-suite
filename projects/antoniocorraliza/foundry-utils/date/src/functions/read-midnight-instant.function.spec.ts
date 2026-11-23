import { describe, expect, inject, it } from 'vitest';
import { readWallClock } from '@foundry-test/functions/read-wall-clock.function';
import { parseCalendarDay } from './parse-calendar-day.function';
import { parseDate } from './parse-date.function';

type ReadMidnightDay = (value: unknown, timestampUnit: 'milliseconds' | 'seconds') => string | null;

interface MidnightReader {
  readonly name: string;
  readonly read: ReadMidnightDay;
}

const timeZone: string = inject('expectedTimeZone');

const STARTS_OF_MARCH_FIRST: Readonly<Record<string, string>> = {
  'Europe/Madrid': '2026-02-28T23:00:00.000Z',
  'America/Mexico_City': '2026-03-01T06:00:00.000Z',
  'America/Santiago': '2026-03-01T03:00:00.000Z',
  UTC: '2026-03-01T00:00:00.000Z',
};

const READERS: ReadonlyArray<MidnightReader> = [
  {
    name: 'parseDate with calendarDate',
    read: (value, timestampUnit) => {
      const date: Date | null = parseDate(value, { calendarDate: true, timestampUnit });
      return date === null ? null : readWallClock(date).slice(0, 10);
    },
  },
  {
    name: 'parseCalendarDay with acceptMidnightInstant',
    read: (value, timestampUnit) => parseCalendarDay(value, { acceptMidnightInstant: true, timestampUnit }),
  },
];

describe('readMidnightInstant', () => {
  describe.each(READERS)('through $name', ({ read }) => {
    it.each([
      '2026-03-01T00:00:00.000Z',
      '2026-03-01T00:00:00Z',
      '2026-03-01T00:00:00.000000Z',
      '2026-03-01T00:00Z',
      '2026-03-01T00:00:00+02:00',
      '2026-03-01T00:00:00-05:00',
      '2026-03-01T00:00:00',
      '2026-03-01 00:00',
      '2026-03-01',
    ])('reads the day written in %j, whatever the time zone', (text) => {
      expect(read(text, 'milliseconds')).toBe('2026-03-01');
    });

    it('reads a timestamp at UTC midnight as that UTC day', () => {
      expect(read(1772323200000, 'milliseconds')).toBe('2026-03-01');
      expect(read(1772323200, 'seconds')).toBe('2026-03-01');
    });

    it.each([
      '2026-03-01T10:00:00Z',
      '2026-03-01T00:00:01Z',
      '2026-03-01T00:00:00.001Z',
      '2026-03-01T23:00:00-01:00',
      '2026-03-01T10:00:00',
    ])('gives null for %j, which is not a midnight', (text) => {
      expect(read(text, 'milliseconds')).toBeNull();
    });

    it('gives null for a timestamp that is not a UTC midnight', () => {
      expect(read(1772323200001, 'milliseconds')).toBeNull();
      expect(read(1772323200, 'milliseconds')).toBeNull();
    });
  });

  describe('through parseDate with calendarDate', () => {
    it('gives the first local instant of the written day', () => {
      expect(parseDate('2026-03-01T00:00:00.000Z', { calendarDate: true })?.toISOString()).toBe(STARTS_OF_MARCH_FIRST[timeZone]);
      expect(parseDate(1772323200000, { calendarDate: true })?.toISOString()).toBe(STARTS_OF_MARCH_FIRST[timeZone]);
    });

    it.each(['2026-03-01T00:00:00+02:00', '2026-03-01T00:00:00', '2026-03-01'])(
      'gives the UTC midnight of the written day in %j when the time zone is utc',
      (text) => {
        expect(parseDate(text, { calendarDate: true, timeZone: 'utc' })?.toISOString()).toBe('2026-03-01T00:00:00.000Z');
      },
    );

    it('gives the UTC midnight of a midnight timestamp when the time zone is utc', () => {
      expect(parseDate(1772323200000, { calendarDate: true, timeZone: 'utc' })?.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    });

    it.runIf(timeZone === 'America/Santiago')('gives the first instant of a day without a midnight, not null', () => {
      expect(parseDate('2026-09-06T00:00:00.000Z', { calendarDate: true })?.toISOString()).toBe('2026-09-06T04:00:00.000Z');
      expect(parseDate('2026-09-06T00:00:00', { calendarDate: true })?.toISOString()).toBe('2026-09-06T04:00:00.000Z');
    });
  });
});
