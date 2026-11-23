import { describe, expect, inject, it } from 'vitest';
import type { FoundryFormatCalendarDayOptions } from '../interfaces/foundry-format-calendar-day-options.interface';
import { formatCalendarDay } from './format-calendar-day.function';
import { formatDate } from './format-date.function';
import { formatLocalDateTime } from './format-local-date-time.function';
import { toIsoStringWithOffset } from './to-iso-string-with-offset.function';
import { toUtcCalendarDateString } from './to-utc-calendar-date-string.function';

type WriteDay = (day: string, options: FoundryFormatCalendarDayOptions) => string;

interface DayWriter {
  readonly name: string;
  readonly write: WriteDay;
}

const timeZone: string = inject('expectedTimeZone');

function createLocalNoon(day: string): Date {
  const [year, month, dayOfMonth]: Array<number> = day.split('-').map(Number);
  const date: Date = new Date(2000, 0, 1, 12);
  date.setFullYear(year ?? 0, (month ?? 0) - 1, dayOfMonth ?? 0);
  return date;
}

const WRITERS: ReadonlyArray<DayWriter> = [
  { name: 'formatDate', write: (day, options) => formatDate(createLocalNoon(day), options) },
  { name: 'formatCalendarDay', write: (day, options) => formatCalendarDay(day, options) },
  { name: 'formatLocalDateTime', write: (day, options) => formatLocalDateTime([day, '21:30'].join('T'), options).slice(0, 10) },
];

describe('writeDateText', () => {
  describe.each(WRITERS)('through $name', ({ write }) => {
    it.each<[FoundryFormatCalendarDayOptions, string]>([
      [{ format: 'iso' }, '2026-09-06'],
      [{ format: 'iso', separator: '.' }, '2026-09-06'],
      [{ format: 'eu' }, '06/09/2026'],
      [{ format: 'eu', separator: '-' }, '06-09-2026'],
      [{ format: 'eu', separator: '.' }, '06.09.2026'],
      [{ format: 'us' }, '09/06/2026'],
      [{ format: 'us', separator: '-' }, '09-06-2026'],
    ])('writes the day with %j as %s', (options, expected) => {
      expect(write('2026-09-06', options)).toBe(expected);
    });

    it.each<[string, FoundryFormatCalendarDayOptions, string]>([
      ['0050-03-01', { format: 'iso' }, '0050-03-01'],
      ['0050-03-01', { format: 'eu' }, '01/03/0050'],
      ['0001-01-01', { format: 'us' }, '01/01/0001'],
      ['9999-12-31', { format: 'eu' }, '31/12/9999'],
    ])('writes %s with a four-digit year, %j as %s', (day, options, expected) => {
      expect(write(day, options)).toBe(expected);
    });
  });

  it('writes a four-digit year in the UTC calendar date', () => {
    expect(toUtcCalendarDateString(createLocalNoon('0050-01-01'))).toBe('0050-01-01T00:00:00.000Z');
    expect(toUtcCalendarDateString('0050-01-01')).toBe('0050-01-01T00:00:00.000Z');
  });

  it.runIf(timeZone === 'UTC')('writes a four-digit year in the text with offset', () => {
    expect(toIsoStringWithOffset(createLocalNoon('0050-01-01'))).toBe('0050-01-01T12:00:00.000+00:00');
  });
});
