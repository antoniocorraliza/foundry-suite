import { describe, expect, it } from 'vitest';
import type { FoundryIsoWeek } from '../interfaces/foundry-iso-week.interface';
import { getIsoWeek } from './get-iso-week.function';

const DAY_IN_MILLISECONDS: number = 86_400_000;

function findIsoWeekByThursday(year: number, month: number, day: number): FoundryIsoWeek {
  const time: number = Date.UTC(year, month, day);
  const thursday: number = time + (3 - ((new Date(time).getUTCDay() + 6) % 7)) * DAY_IN_MILLISECONDS;
  const weekYear: number = new Date(thursday).getUTCFullYear();
  return { year: weekYear, week: Math.floor((thursday - Date.UTC(weekYear, 0, 1)) / (7 * DAY_IN_MILLISECONDS)) + 1 };
}

describe('getIsoWeek on every day from 2020 to 2030', () => {
  it('agrees with the Thursday rule for the local day', () => {
    const first: number = Date.UTC(2020, 0, 1);
    const count: number = (Date.UTC(2030, 11, 31) - first) / DAY_IN_MILLISECONDS + 1;
    const mismatches: Array<string> = Array.from({ length: count }, (_entry, index) => new Date(first + index * DAY_IN_MILLISECONDS))
      .map((utcDay) => new Date(utcDay.getUTCFullYear(), utcDay.getUTCMonth(), utcDay.getUTCDate(), 12))
      .filter((date) => {
        const expected: FoundryIsoWeek = findIsoWeekByThursday(date.getFullYear(), date.getMonth(), date.getDate());
        const week: FoundryIsoWeek = getIsoWeek(date);
        return week.year !== expected.year || week.week !== expected.week || week.week < 1 || week.week > 53;
      })
      .map((date) => date.toDateString());
    expect(mismatches).toEqual([]);
  });
});
