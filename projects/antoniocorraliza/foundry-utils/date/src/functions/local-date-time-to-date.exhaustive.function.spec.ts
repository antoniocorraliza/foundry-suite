import { describe, expect, it } from 'vitest';
import { MINUTE_IN_MILLISECONDS } from '@foundry-test/constants/time-units.constant';
import { findMismatches } from '@foundry-test/functions/find-mismatches.function';
import { listDaysOfYears } from '@foundry-test/functions/list-days-of-years.function';
import { localDateTimeToDate } from './local-date-time-to-date.function';
import { toLocalDateTime } from './to-local-date-time.function';

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

function findDayMismatch(day: string): string | null {
  const first: number = Date.parse(day);
  const times: Array<number> = Array.from({ length: 1440 }, (_entry, minute) => first + minute * MINUTE_IN_MILLISECONDS);
  return findMismatches(times, findMinuteMismatch, 1)[0] ?? null;
}

describe('localDateTimeToDate and toLocalDateTime on every minute from 2020 to 2030', () => {
  it('reads back each instant, with the later reading for the second of two repeated times, in every time zone', () => {
    expect(findMismatches(listDaysOfYears(2020, 2030), findDayMismatch)).toEqual([]);
  });
});
