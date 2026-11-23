import { describe, expect, it } from 'vitest';
import { getIsoWeek } from './get-iso-week.function';

describe('getIsoWeek', () => {
  it.each([
    [new Date(2026, 0, 1), { year: 2026, week: 1 }],
    [new Date(2026, 0, 5), { year: 2026, week: 2 }],
    [new Date(2026, 11, 31), { year: 2026, week: 53 }],
    [new Date(2027, 0, 1), { year: 2026, week: 53 }],
    [new Date(2021, 0, 3), { year: 2020, week: 53 }],
    [new Date(2024, 11, 30), { year: 2025, week: 1 }],
  ])('gives the week of %s as %j, starting on Monday', (date, expected) => {
    expect(getIsoWeek(date)).toEqual(expected);
  });

  it('returns a new object each time', () => {
    const date: Date = new Date(2026, 0, 1);
    expect(getIsoWeek(date)).not.toBe(getIsoWeek(date));
  });
});
