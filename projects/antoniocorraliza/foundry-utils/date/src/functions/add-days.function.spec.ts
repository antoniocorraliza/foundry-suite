import { describe, expect, inject, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { addDays } from './add-days.function';
import { startOfDay } from './start-of-day.function';

const timeZone: string = inject('expectedTimeZone');

describe('addDays', () => {
  it('adds calendar days and keeps the local time', () => {
    expect(addDays(new Date(2026, 2, 27, 10, 30), 3)).toEqual(new Date(2026, 2, 30, 10, 30));
    expect(addDays(new Date(2026, 0, 1, 10, 30), -1)).toEqual(new Date(2025, 11, 31, 10, 30));
  });

  it.each([0, -0])('returns a new date at the same instant when it adds %d', (days) => {
    const input: Date = new Date(2026, 2, 27, 10, 30);
    const result: Date = addDays(input, days);
    expect(result).not.toBe(input);
    expect(result.getTime()).toBe(input.getTime());
  });

  it('keeps the years 1 to 99', () => {
    const input: Date = new Date(2026, 0, 1, 12);
    input.setFullYear(50);
    expect(addDays(input, -1).getFullYear()).toBe(49);
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('throws a RangeError for %d days', (days) => {
    expect(catchThrown(() => addDays(new Date(2026, 2, 27), days))).toBeInstanceOf(RangeError);
  });

  it('throws a RangeError for an invalid date or a result in the year 10000', () => {
    expect(catchThrown(() => addDays(new Date(Number.NaN), 1))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => addDays(new Date(9999, 11, 31, 12), 1))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => addDays(new Date(2026, 0, 1), 3_000_000))).toBeInstanceOf(RangeError);
  });

  describe.runIf(timeZone === 'America/Santiago')('in a time zone whose clock skips midnight', () => {
    it('moves a time that does not exist on the target day forward, as the engine does', () => {
      expect(addDays(new Date(2026, 8, 5, 0, 0), 1).toISOString()).toBe('2026-09-06T04:00:00.000Z');
    });

    it('keeps the time and not the start of the day, so the start of the sixth plus one is 01:00 on the seventh', () => {
      expect(addDays(startOfDay(new Date(2026, 8, 6, 12)), 1).toISOString()).toBe('2026-09-07T04:00:00.000Z');
    });

    it('gives the first of two repeated times on the target day', () => {
      expect(addDays(new Date(2026, 3, 3, 23, 30), 1).toISOString()).toBe('2026-04-05T02:30:00.000Z');
    });
  });
});
