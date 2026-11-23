import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { addCalendarDays } from './add-calendar-days.function';

describe('addCalendarDays', () => {
  it.each([
    ['2026-09-05', 1, '2026-09-06'],
    ['2024-02-28', 1, '2024-02-29'],
    ['2026-03-01', -1, '2026-02-28'],
    ['0050-01-01', -1, '0049-12-31'],
    ['2026-09-06', 0, '2026-09-06'],
    ['2026-09-06', -0, '2026-09-06'],
  ])('adds to %s the days %d and gives %s', (day, days, expected) => {
    expect(addCalendarDays(day, days)).toBe(expected);
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('throws a RangeError for %d days', (days) => {
    expect(catchThrown(() => addCalendarDays('2026-09-06', days))).toBeInstanceOf(RangeError);
  });

  it.each([
    ['9999-12-31', 1],
    ['0001-01-01', -1],
    ['2026-09-06', 1e9],
    ['2026-09-06', Number.MAX_SAFE_INTEGER],
  ])('throws a RangeError when %s plus %d days leaves the years 1 to 9999', (day, days) => {
    expect(catchThrown(() => addCalendarDays(day, days))).toBeInstanceOf(RangeError);
  });
});
