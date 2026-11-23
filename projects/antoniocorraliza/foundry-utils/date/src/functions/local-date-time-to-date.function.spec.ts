import { describe, expect, inject, it } from 'vitest';
import { localDateTimeToDate } from './local-date-time-to-date.function';

const timeZone: string = inject('expectedTimeZone');

describe('localDateTimeToDate', () => {
  it('builds the local instant of the value', () => {
    expect(localDateTimeToDate('2026-11-14T09:30')).toEqual(new Date(2026, 10, 14, 9, 30));
  });

  it('reads the value as UTC when asked, in every time zone', () => {
    expect(localDateTimeToDate('2026-09-06T00:00', { timeZone: 'utc' })?.toISOString()).toBe('2026-09-06T00:00:00.000Z');
  });

  it.runIf(timeZone === 'UTC')('builds the year 50 as that year', () => {
    expect(localDateTimeToDate('0050-01-01T10:00')?.toISOString()).toBe('0050-01-01T10:00:00.000Z');
  });
});
