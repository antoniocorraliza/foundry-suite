import { describe, expect, inject, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { formatDate } from './format-date.function';
import { parseDate } from './parse-date.function';

const timeZone: string = inject('expectedTimeZone');

describe('formatDate', () => {
  it('writes the local day in iso, without time, by default', () => {
    expect(formatDate(new Date(2026, 8, 6, 23, 30))).toBe('2026-09-06');
  });

  it('separates eu and us dates with a slash by default', () => {
    expect(formatDate(new Date(2026, 8, 6), { format: 'eu' })).toBe('06/09/2026');
    expect(formatDate(new Date(2026, 8, 6), { format: 'us' })).toBe('09/06/2026');
  });

  it.each([
    ['iso', '2026-09-06T09:30:15.042'],
    ['eu', '06/09/2026 09:30:15.042'],
    ['us', '09/06/2026 09:30:15.042'],
  ] as const)('writes the %s date with its local time', (format, expected) => {
    expect(formatDate(new Date(2026, 8, 6, 9, 30, 15, 42), { format, time: 'milliseconds' })).toBe(expected);
  });

  it('writes the UTC day without a Z when there is no time', () => {
    expect(formatDate(new Date('2026-09-06T23:30:00.000Z'), { timeZone: 'utc' })).toBe('2026-09-06');
  });

  it('writes an iso UTC time with a T and a final Z', () => {
    expect(formatDate(new Date('2026-09-06T08:30:15.042Z'), { time: 'seconds', timeZone: 'utc' })).toBe('2026-09-06T08:30:15Z');
  });

  it('writes an eu or us UTC time without a Z, because those formats never read a time zone', () => {
    expect(formatDate(new Date('2026-09-06T08:30:15.042Z'), { format: 'eu', time: 'minutes', timeZone: 'utc' })).toBe('06/09/2026 08:30');
    expect(formatDate(new Date('2026-09-06T08:30:15.042Z'), { format: 'us', time: 'seconds', timeZone: 'utc' })).toBe(
      '09/06/2026 08:30:15',
    );
  });

  it('returns null for null', () => {
    expect(formatDate(null)).toBeNull();
  });

  it('throws a RangeError for an invalid date', () => {
    expect(catchThrown(() => formatDate(new Date(Number.NaN)))).toBeInstanceOf(RangeError);
  });

  it('throws a RangeError for a year outside 1 to 9999 in the mode it writes', () => {
    expect(catchThrown(() => formatDate(new Date(Date.UTC(10000, 0, 1, 12))))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => formatDate(new Date(Date.UTC(10000, 0, 1, 12)), { timeZone: 'utc' }))).toBeInstanceOf(RangeError);
  });

  it.runIf(timeZone !== 'UTC')(
    'writes the first instant of the year 1 in UTC, but not in a local time where it is still the year 0',
    () => {
      const date: Date = new Date('0001-01-01T00:00:00.000Z');
      expect(formatDate(date, { timeZone: 'utc' })).toBe('0001-01-01');
      expect(catchThrown(() => formatDate(date))).toBeInstanceOf(RangeError);
    },
  );

  it('writes the day and month of a day read without leading zeros with two digits', () => {
    expect(formatDate(parseDate('1/3/2026', { format: 'eu' }), { format: 'eu' })).toBe('01/03/2026');
  });

  it.each(['iso', 'eu', 'us'] as const)('writes a text that parseDate reads back in %s', (format) => {
    const text: string = formatDate(new Date(2026, 2, 1, 9, 30, 15, 42), { format, time: 'milliseconds' });
    expect(formatDate(parseDate(text, { format }), { format, time: 'milliseconds' })).toBe(text);
  });
});
