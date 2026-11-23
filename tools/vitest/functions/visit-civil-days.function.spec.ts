import { describe, expect, it } from 'vitest';
import { visitCivilDays } from './visit-civil-days.function.ts';

describe('visitCivilDays', () => {
  it('visits the 3652059 days from 0001-01-01, a Monday, to 9999-12-31, a Friday, in the order of the proleptic Gregorian calendar', () => {
    const date: Date = new Date(0);
    date.setUTCFullYear(1, 0, 1);
    const weekdays: Map<string, number> = new Map();
    let mismatches: number = 0;
    let count: number = 0;
    visitCivilDays((day, index, weekday) => {
      if (day !== date.toISOString().slice(0, 10) || weekday !== date.getUTCDay() || index !== count) mismatches++;
      if (day === '0001-01-01' || day === '1970-01-01' || day === '9999-12-31') weekdays.set(day, weekday);
      date.setUTCDate(date.getUTCDate() + 1);
      count++;
    });
    expect([count, mismatches]).toEqual([3652059, 0]);
    expect(Object.fromEntries(weekdays)).toEqual({ '0001-01-01': 1, '1970-01-01': 4, '9999-12-31': 5 });
  }, 60_000);
});
