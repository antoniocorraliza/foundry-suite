import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { startOfDay } from './start-of-day.function';

describe('startOfDay', () => {
  it('returns a new date at the start of the local day', () => {
    const input: Date = new Date(2026, 10, 14, 15, 30, 45, 123);
    const result: Date = startOfDay(input);
    expect(result).toEqual(new Date(2026, 10, 14));
    expect(result).not.toBe(input);
  });

  it('keeps the years 1 to 99', () => {
    const input: Date = new Date(2026, 5, 14, 12);
    input.setFullYear(50);
    expect(startOfDay(input).getFullYear()).toBe(50);
  });

  it('throws a RangeError for an invalid date or one of the year 10000', () => {
    expect(catchThrown(() => startOfDay(new Date(Number.NaN)))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => startOfDay(new Date(Date.UTC(10000, 0, 1, 12))))).toBeInstanceOf(RangeError);
  });
});
