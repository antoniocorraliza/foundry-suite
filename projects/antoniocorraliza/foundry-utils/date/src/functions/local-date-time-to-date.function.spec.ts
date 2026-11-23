import { describe, expect, it } from 'vitest';
import { localDateTimeToDate } from './local-date-time-to-date.function';

describe('localDateTimeToDate', () => {
  it('builds the local instant of the value', () => {
    expect(localDateTimeToDate('2026-11-14T09:30')).toEqual(new Date(2026, 10, 14, 9, 30));
  });
});
