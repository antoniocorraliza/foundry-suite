import { describe, expect, it } from 'vitest';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { formatDate } from './format-date.function';
import { formatLocalDateTime } from './format-local-date-time.function';
import { formatTime } from './format-time.function';
import { toIsoStringWithOffset } from './to-iso-string-with-offset.function';

type TimePrecision = 'minutes' | 'seconds' | 'milliseconds';

type WriteTime = (date: Date, precision: TimePrecision, timeZone: FoundryTimeZoneMode) => string;

interface TimeWriter {
  readonly name: string;
  readonly write: WriteTime;
}

const PRECISIONS: ReadonlyArray<TimePrecision> = ['minutes', 'seconds', 'milliseconds'];

const DAY_IN_MILLISECONDS: number = 86_400_000;

const WRITERS: ReadonlyArray<TimeWriter> = [
  { name: 'formatTime', write: (date, precision, timeZone) => formatTime(date, { precision, timeZone }) },
  {
    name: 'formatDate with a time',
    write: (date, precision, timeZone) => formatDate(date, { time: precision, timeZone }).slice(11),
  },
];

function listInstantsOfYear(year: number, stepInMinutes: number): Array<Date> {
  const first: number = Date.UTC(year, 0, 1);
  const count: number = (365 * DAY_IN_MILLISECONDS) / (stepInMinutes * 60_000);
  return Array.from({ length: count }, (_entry, index) => new Date(first + index * stepInMinutes * 60_000 + index * 1_001));
}

describe('writeTimeText', () => {
  describe.each(WRITERS)('through $name', ({ write }) => {
    it.each<[TimePrecision, string]>([
      ['minutes', '09:30'],
      ['seconds', '09:30:15'],
      ['milliseconds', '09:30:15.042'],
    ])('writes the local time with %s as %s', (precision, expected) => {
      expect(write(new Date(2026, 2, 1, 9, 30, 15, 42), precision, 'local')).toBe(expected);
    });

    it.each<[TimePrecision, string]>([
      ['minutes', '09:30'],
      ['seconds', '09:30:59'],
      ['milliseconds', '09:30:59.999'],
    ])('truncates the local time with %s to %s, never rounding up', (precision, expected) => {
      expect(write(new Date(2026, 2, 1, 9, 30, 59, 999), precision, 'local')).toBe(expected);
    });

    it.each<[TimePrecision, string]>([
      ['minutes', '00:05'],
      ['seconds', '00:05:07'],
      ['milliseconds', '00:05:07.003'],
    ])('pads each part with zeros, with %s as %s', (precision, expected) => {
      expect(write(new Date(2026, 2, 1, 0, 5, 7, 3), precision, 'local')).toBe(expected);
    });

    it.each<[TimePrecision, string]>([
      ['minutes', '08:30Z'],
      ['seconds', '08:30:15Z'],
      ['milliseconds', '08:30:15.042Z'],
    ])('writes the UTC time with %s as %s, ending in Z', (precision, expected) => {
      expect(write(new Date('2026-03-01T08:30:15.042Z'), precision, 'utc')).toBe(expected);
    });
  });

  it('writes the same time through formatTime and formatDate, every 97 minutes of 2026', () => {
    const mismatches: Array<string> = listInstantsOfYear(2026, 97).flatMap((date) =>
      PRECISIONS.flatMap((precision) =>
        (['local', 'utc'] as const)
          .filter((timeZone) => formatTime(date, { precision, timeZone }) !== formatDate(date, { time: precision, timeZone }).slice(11))
          .map((timeZone) => `${date.toISOString()} ${precision} ${timeZone}`),
      ),
    );
    expect(mismatches).toEqual([]);
  });

  it('writes the local time with milliseconds in the text with offset', () => {
    const date: Date = new Date(2026, 2, 1, 9, 30, 15, 42);
    expect(toIsoStringWithOffset(date).slice(11, 23)).toBe(formatTime(date, { precision: 'milliseconds' }));
  });

  it('writes the time of a local date and time with two digits for the hours', () => {
    expect(formatLocalDateTime('2026-11-14T09:05', { format: 'eu' })).toBe('14/11/2026 09:05');
    expect(formatLocalDateTime('2026-11-14T21:30', { format: 'us' })).toBe('11/14/2026 21:30');
  });
});
