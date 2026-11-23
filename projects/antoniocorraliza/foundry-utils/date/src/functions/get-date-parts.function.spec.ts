import { describe, expect, it } from 'vitest';
import { getDateParts } from './get-date-parts.function';

describe('getDateParts', () => {
  it('gives every local part, with the month from 1 to 12', () => {
    expect(getDateParts(new Date(2026, 0, 31, 9, 30, 15, 42))).toEqual({
      year: 2026,
      month: 1,
      day: 31,
      hours: 9,
      minutes: 30,
      seconds: 15,
      milliseconds: 42,
    });
  });

  it('gives the UTC parts when asked', () => {
    expect(getDateParts(new Date('2026-12-31T23:30:00.000Z'), { timeZone: 'utc' })).toEqual({
      year: 2026,
      month: 12,
      day: 31,
      hours: 23,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    });
  });

  it('returns a new plain object each time', () => {
    const date: Date = new Date(2026, 0, 31);
    const parts: object = getDateParts(date);
    expect(parts).not.toBe(getDateParts(date));
    expect(Object.getPrototypeOf(parts)).toBe(Object.prototype);
  });
});
