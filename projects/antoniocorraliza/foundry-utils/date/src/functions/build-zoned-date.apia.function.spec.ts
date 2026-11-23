import { describe, expect, it } from 'vitest';
import { localDateTimeToDate } from './local-date-time-to-date.function';
import { parseDate } from './parse-date.function';

describe('buildZonedDate in a time zone that skips a whole day', () => {
  it.each<[string, () => Date | null]>([
    ['parseDate with an iso day', () => parseDate('2011-12-30')],
    ['parseDate with an eu day', () => parseDate('30/12/2011', { format: 'eu' })],
    ['parseDate with parts', () => parseDate({ year: 2011, month: 12, day: 30 })],
    ['parseDate with a time', () => parseDate('2011-12-30T12:00')],
    ['localDateTimeToDate', () => localDateTimeToDate('2011-12-30T12:00')],
    ['localDateTimeToDate with the later reading', () => localDateTimeToDate('2011-12-30T12:00', { repeatedTime: 'later' })],
  ])('gives null for the skipped day through %s', (_name, build) => {
    expect(build()).toBeNull();
  });

  it('builds the last minute before the skipped day and the first one after it', () => {
    expect(localDateTimeToDate('2011-12-29T23:59')?.toISOString()).toBe('2011-12-30T09:59:00.000Z');
    expect(parseDate('2011-12-31')?.toISOString()).toBe('2011-12-30T10:00:00.000Z');
  });

  it('builds the skipped day as UTC when asked', () => {
    expect(parseDate('2011-12-30', { timeZone: 'utc' })?.toISOString()).toBe('2011-12-30T00:00:00.000Z');
  });
});
