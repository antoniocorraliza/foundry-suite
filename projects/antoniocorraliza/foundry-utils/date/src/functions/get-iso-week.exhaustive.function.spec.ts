import { describe, expect, it } from 'vitest';
import { DAY_IN_MILLISECONDS } from '@foundry-test/constants/time-units.constant';
import { createLocalTestDate } from '@foundry-test/functions/create-local-test-date.function';
import { listDaysOfYears } from '@foundry-test/functions/list-days-of-years.function';
import type { FoundryIsoWeek } from '../interfaces/foundry-iso-week.interface';
import { getIsoWeek } from './get-iso-week.function';

function findIsoWeekByThursday(year: number, month: number, day: number): FoundryIsoWeek {
  const time: number = Date.UTC(year, month, day);
  const thursday: number = time + (3 - ((new Date(time).getUTCDay() + 6) % 7)) * DAY_IN_MILLISECONDS;
  const weekYear: number = new Date(thursday).getUTCFullYear();
  return { year: weekYear, week: Math.floor((thursday - Date.UTC(weekYear, 0, 1)) / (7 * DAY_IN_MILLISECONDS)) + 1 };
}

describe('getIsoWeek on every day from 2020 to 2030', () => {
  it('agrees with the Thursday rule for the local day', () => {
    const mismatches: Array<string> = listDaysOfYears(2020, 2030)
      .map((day) => createLocalTestDate(day))
      .filter((date) => {
        const expected: FoundryIsoWeek = findIsoWeekByThursday(date.getFullYear(), date.getMonth(), date.getDate());
        const week: FoundryIsoWeek = getIsoWeek(date);
        return week.year !== expected.year || week.week !== expected.week || week.week < 1 || week.week > 53;
      })
      .map((date) => date.toDateString());
    expect(mismatches).toEqual([]);
  });
});
