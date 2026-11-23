import { describe, expect, it } from 'vitest';
import { localDateTimeToDate } from './local-date-time-to-date.function';
import { toLocalDateTime } from './to-local-date-time.function';

const MINUTE_IN_MILLISECONDS: number = 60_000;

const MAXIMUM_MISMATCHES: number = 10;

function findMinuteMismatch(time: number): string | null {
  const date: Date = new Date(time);
  const text: string = toLocalDateTime(date);
  const earlier: Date | null = localDateTimeToDate(text);
  const later: Date | null = localDateTimeToDate(text, { repeatedTime: 'later' });
  if (earlier?.getTime() !== time && later?.getTime() !== time) return `${date.toISOString()} does not come back from ${text}`;
  if (earlier !== null && toLocalDateTime(earlier) !== text) return `${text} does not come back from the earlier reading`;
  if (later !== null && toLocalDateTime(later) !== text) return `${text} does not come back from the later reading`;
  const utcText: string = toLocalDateTime(date, { timeZone: 'utc' });
  return localDateTimeToDate(utcText, { timeZone: 'utc' })?.getTime() === time ? null : `${date.toISOString()} does not come back in UTC`;
}

describe('localDateTimeToDate and toLocalDateTime on every minute from 2020 to 2030', () => {
  it('reads back each instant, with the later reading for the second of two repeated times, in every time zone', () => {
    const first: number = Date.UTC(2020, 0, 1);
    const count: number = (Date.UTC(2031, 0, 1) - first) / MINUTE_IN_MILLISECONDS;
    const mismatches: Array<string> = [];
    Array.from({ length: count / 1440 }, (_entry, day) => day).some((day) =>
      Array.from({ length: 1440 }, (_entry, minute) => first + (day * 1440 + minute) * MINUTE_IN_MILLISECONDS).some((time) => {
        const mismatch: string | null = findMinuteMismatch(time);
        if (mismatch !== null) mismatches.push(mismatch);
        return mismatches.length >= MAXIMUM_MISMATCHES;
      }),
    );
    expect(mismatches).toEqual([]);
  });
});
