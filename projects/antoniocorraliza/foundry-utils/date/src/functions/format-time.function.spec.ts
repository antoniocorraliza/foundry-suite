import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { formatTime } from './format-time.function';

describe('formatTime', () => {
  it('writes only the local time with seconds by default, without date or zone', () => {
    expect(formatTime(new Date(2026, 2, 1, 9, 30, 15, 42))).toBe('09:30:15');
  });

  it('writes the UTC time with a final Z in every time zone', () => {
    expect(formatTime(new Date('2026-03-01T08:30:15.042Z'), { timeZone: 'utc' })).toBe('08:30:15Z');
  });

  it('writes the local time without a Z when the mode is local', () => {
    expect(formatTime(new Date(2026, 2, 1, 9, 30), { timeZone: 'local', precision: 'minutes' })).toBe('09:30');
  });

  it('throws a RangeError for an invalid date', () => {
    expect(catchThrown(() => formatTime(new Date(Number.NaN)))).toBeInstanceOf(RangeError);
  });

  it('throws a RangeError for a date of the year 10000', () => {
    expect(catchThrown(() => formatTime(new Date(Date.UTC(10000, 0, 1, 12)), { timeZone: 'utc' }))).toBeInstanceOf(RangeError);
  });
});
