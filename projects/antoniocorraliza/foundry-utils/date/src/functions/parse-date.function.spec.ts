import fc from 'fast-check';
import { describe, expect, inject, it } from 'vitest';
import { readWallClock } from '@foundry-test/functions/read-wall-clock.function';
import { formatDate } from './format-date.function';
import { parseDate } from './parse-date.function';

const timeZone: string = inject('expectedTimeZone');

function readLocalClock(date: Date | null): string | null {
  return date === null ? null : readWallClock(date);
}

describe('parseDate', () => {
  describe('dates', () => {
    it('returns a copy of a valid date, never the same object', () => {
      const input: Date = new Date(2026, 2, 1, 10, 30);
      const result: Date | null = parseDate(input);
      expect(result).not.toBe(input);
      expect(result?.getTime()).toBe(input.getTime());
    });

    it('ignores every option with a date', () => {
      const input: Date = new Date(2026, 2, 1, 10, 30);
      expect(parseDate(input, { format: 'eu', timeZone: 'utc', calendarDate: true, timestampUnit: 'seconds' })?.getTime()).toBe(
        input.getTime(),
      );
    });

    it('gives null for an invalid date', () => {
      expect(parseDate(new Date(Number.NaN))).toBeNull();
    });

    it('gives null for a date of the year 10000', () => {
      expect(parseDate(new Date(Date.UTC(10000, 0, 1, 12)))).toBeNull();
      expect(parseDate(new Date(Date.UTC(10000, 0, 1, 12)), { timeZone: 'utc' })).toBeNull();
    });

    it.runIf(timeZone !== 'UTC')('measures the year of a date in the mode it reads', () => {
      const date: Date = new Date('0001-01-01T00:00:00.000Z');
      expect(parseDate(date)).toBeNull();
      expect(parseDate(date, { timeZone: 'utc' })?.getTime()).toBe(date.getTime());
    });
  });

  describe('timestamps', () => {
    it.each([
      [1767225600000, '2026-01-01T00:00:00.000Z'],
      [0, '1970-01-01T00:00:00.000Z'],
      [-0, '1970-01-01T00:00:00.000Z'],
      [1.5, '1970-01-01T00:00:00.001Z'],
      [-1.5, '1969-12-31T23:59:59.999Z'],
    ])('reads %d milliseconds as %s, truncating decimals towards zero', (timestamp, expected) => {
      expect(parseDate(timestamp)?.toISOString()).toBe(expected);
    });

    it('reads seconds only when asked, and milliseconds by default', () => {
      expect(parseDate(1767225600, { timestampUnit: 'seconds' })?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(parseDate(1767225600.5, { timestampUnit: 'seconds' })?.toISOString()).toBe('2026-01-01T00:00:00.500Z');
      expect(parseDate(1767225600)?.toISOString()).toBe('1970-01-21T10:53:45.600Z');
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 8.64e15 + 1])('gives null for %d', (timestamp) => {
      expect(parseDate(timestamp)).toBeNull();
    });

    it('measures the range of a timestamp in UTC', () => {
      const firstOfYearOne: number = new Date('0001-01-01T00:00:00.000Z').getTime();
      expect(parseDate(firstOfYearOne)?.getTime()).toBe(firstOfYearOne);
      expect(parseDate(firstOfYearOne - 1)).toBeNull();
      expect(parseDate(new Date('9999-12-31T23:59:59.999Z').getTime() + 1)).toBeNull();
    });
  });

  describe('parts', () => {
    it.each([
      [{ year: 2026, month: 3, day: 1 }, '2026-03-01T00:00:00.000'],
      [{ year: 2026, month: 3, day: 1, hours: 10 }, '2026-03-01T10:00:00.000'],
      [{ year: 2026, month: 3, day: 1, hours: 10, minutes: 30 }, '2026-03-01T10:30:00.000'],
      [{ year: 2026, month: 3, day: 1, hours: 10, minutes: 30, seconds: 15, milliseconds: 42 }, '2026-03-01T10:30:15.042'],
      [{ year: 50, month: 1, day: 1 }, '0050-01-01T00:00:00.000'],
      [{ year: 2026, month: 3, day: 1, hours: undefined }, '2026-03-01T00:00:00.000'],
      [{ year: 2026, month: 9, day: 7, weekday: 1, name: 'x' }, '2026-09-07T00:00:00.000'],
    ])('reads %j as local %s, with the missing lower parts at zero', (parts, expected) => {
      expect(readLocalClock(parseDate(parts))).toBe(expected);
    });

    it('reads parts as UTC when asked', () => {
      expect(parseDate({ year: 2026, month: 3, day: 1, hours: 10 }, { timeZone: 'utc' })?.toISOString()).toBe('2026-03-01T10:00:00.000Z');
    });

    it('ignores an unknown hour key, so minutes without hours give null', () => {
      expect(parseDate({ year: 2026, month: 3, day: 1, hour: 10, minutes: 30, seconds: 0 })).toBeNull();
    });

    it('ignores an unknown hour key and reads only the day', () => {
      expect(parseDate({ year: 2026, month: 3, day: 1, hour: 10 })).toEqual(new Date(2026, 2, 1));
    });

    it.each<unknown>([
      { year: 2026, day: 15 },
      { month: 3, day: 1 },
      { year: 2026, month: 3 },
      { year: 2026, month: 13, day: 1 },
      { year: 2026, month: 0, day: 1 },
      { year: 2026, month: 4, day: 31 },
      { year: 2026, month: 2, day: 30 },
      { year: 2025, month: 2, day: 29 },
      { year: 2026, month: 3, day: 40 },
      { year: 2026, month: 3, day: 1, hours: 24 },
      { year: 2026, month: 3, day: 1, hours: 10, minutes: 60 },
      { year: 2026, month: 3, day: 1, hours: 10, minutes: 30, seconds: 60 },
      { year: 2026, month: 3, day: 1, hours: 10, minutes: 30, seconds: 0, milliseconds: 1000 },
      { year: 2026, month: 3, day: 1, minutes: 30 },
      { year: 2026, month: 3, day: 1, hours: 10, seconds: 30 },
      { year: 2026, month: 3, day: 1, hours: 10, minutes: 30, milliseconds: 5 },
      { year: 0, month: 1, day: 1 },
      { year: 10000, month: 1, day: 1 },
      { year: 2026, month: 1.5, day: 1 },
      { year: 2026, month: 3, day: 1, hours: 9.5 },
      { year: 2026, month: 3, day: 1, hours: null },
      { year: '2026', month: 3, day: 1 },
      { year: Number.NaN, month: 3, day: 1 },
      { year: -2026, month: 3, day: 1 },
    ])('gives null for the parts %j', (parts) => {
      expect(parseDate(parts)).toBeNull();
    });
  });

  describe('texts', () => {
    it('reads an iso day as that local day in every time zone, never the day before', () => {
      const date: Date | null = parseDate('2026-03-01');
      expect([date?.getFullYear(), date?.getMonth(), date?.getDate(), date?.getHours()]).toEqual([2026, 2, 1, 0]);
    });

    it('reads the iso format by default', () => {
      expect(readLocalClock(parseDate('2026-03-01'))).toBe(readLocalClock(parseDate('2026-03-01', { format: 'iso' })));
      expect(parseDate('01/03/2026')).toBeNull();
    });

    it.each(['2026-07-01T10:00:00+02:00', '2026-07-01T10:00:00+0200', '2026-07-01T10:00:00+02', '2026-07-01T08:00:00Z'])(
      'subtracts a positive offset to reach UTC in %s',
      (text) => {
        expect(parseDate(text)?.toISOString()).toBe('2026-07-01T08:00:00.000Z');
      },
    );

    it('reads a text without a time zone as UTC when asked', () => {
      expect(parseDate('2026-03-01T10:30', { timeZone: 'utc' })?.toISOString()).toBe('2026-03-01T10:30:00.000Z');
      expect(parseDate('2026-03-01', { timeZone: 'utc' })?.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    });

    it.each([
      ['14/11/2026 09:30', '2026-11-14T09:30:00.000'],
      ['14-11-2026 09:30:15', '2026-11-14T09:30:15.000'],
      ['14.11.2026 09:30:15.123', '2026-11-14T09:30:15.123'],
    ])('reads the eu text %j with its local time', (text, expected) => {
      expect(readLocalClock(parseDate(text, { format: 'eu' }))).toBe(expected);
    });

    it('reads the us text with its local time', () => {
      expect(readLocalClock(parseDate('11/14/2026 09:30', { format: 'us' }))).toBe('2026-11-14T09:30:00.000');
    });

    it.each([
      '14/11/2026 9:30',
      '14/11/2026 09:30:15.12',
      '14/11/2026 09:30:15.1234',
      '14/11/2026 09:30Z',
      '14/11/2026T09:30',
      '14/11/2026 09:30+01:00',
    ])('gives null for the eu text %j, whose time is outside the format', (text) => {
      expect(parseDate(text, { format: 'eu' })).toBeNull();
    });

    it.each(['1767225600000', '20260301', '2026/03/01', 'March 1, 2026', 'Thu, 01 Jan 2026 10:00:00 GMT', '2026-060'])(
      'gives null for %j instead of letting the engine guess',
      (text) => {
        expect(parseDate(text)).toBeNull();
      },
    );

    it('gives null for the texts that the engine writes for a date', () => {
      const date: Date = new Date(2026, 2, 1, 10, 30);
      expect(parseDate(date.toString())).toBeNull();
      expect(parseDate(date.toUTCString())).toBeNull();
      expect(parseDate(date.toDateString())).toBeNull();
    });
  });

  describe('values that are not a date', () => {
    it.each<unknown>([
      null,
      undefined,
      '',
      '   ',
      true,
      false,
      10n,
      Symbol('date'),
      (): Date => new Date(),
      new Number(0),
      new String('2026-03-01'),
      {},
      [],
    ])('gives null for %s, never the current date', (value) => {
      expect(parseDate(value)).toBeNull();
    });
  });

  describe('the calendarDate option', () => {
    it('has no effect on a date or on parts', () => {
      const input: Date = new Date(2026, 2, 1, 10, 30);
      expect(parseDate(input, { calendarDate: true })?.getTime()).toBe(input.getTime());
      expect(parseDate({ year: 2026, month: 3, day: 1, hours: 10 }, { calendarDate: true })).toEqual(new Date(2026, 2, 1, 10));
    });
  });

  describe.runIf(timeZone === 'Europe/Madrid')('in a time zone that moves the clock at 02:00', () => {
    it.each([
      ['2026-03-29 02:30', 'iso'],
      ['29/03/2026 02:30', 'eu'],
      ['03/29/2026 02:30', 'us'],
    ] as const)('gives null for %j in %s, a written time that does not exist', (text, format) => {
      expect(parseDate(text, { format })).toBeNull();
    });

    it('reads a time that does not exist locally when the time zone is utc', () => {
      expect(parseDate('2026-03-29 02:30', { timeZone: 'utc' })?.toISOString()).toBe('2026-03-29T02:30:00.000Z');
    });
  });

  describe.runIf(timeZone === 'America/Santiago')('in a time zone whose clock skips midnight', () => {
    it.each([
      ['2026-09-06', 'iso'],
      ['06/09/2026', 'eu'],
      ['09/06/2026', 'us'],
    ] as const)('reads the day %j in %s as its first instant, not null', (text, format) => {
      expect(parseDate(text, { format })?.toISOString()).toBe('2026-09-06T04:00:00.000Z');
    });

    it('reads a day without a midnight as its first instant from parts too', () => {
      expect(parseDate({ year: 2026, month: 9, day: 6 })?.toISOString()).toBe('2026-09-06T04:00:00.000Z');
    });

    it.each([
      ['2026-09-06T00:30', 'iso'],
      ['06/09/2026 00:00', 'eu'],
    ] as const)('gives null for %j in %s, a written time that does not exist', (text, format) => {
      expect(parseDate(text, { format })).toBeNull();
    });
  });

  it('never returns an invalid date or one outside the years 1 to 9999', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        const result: Date | null = parseDate(value);
        return result === null || (!Number.isNaN(result.getTime()) && result.getFullYear() >= 1 && result.getFullYear() <= 9999);
      }),
    );
  });

  it('reads back what formatDate writes, for generated dates of the years 1 to 9999', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('0001-01-02T00:00:00.000Z'), max: new Date('9999-12-30T00:00:00.000Z'), noInvalidDate: true }),
        (date) => {
          const text: string = formatDate(date, { time: 'milliseconds', timeZone: 'utc' });
          return parseDate(text, { timeZone: 'utc' })?.getTime() === date.getTime();
        },
      ),
    );
  });
});
