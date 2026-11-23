import { DAY_IN_MILLISECONDS } from '../constants/time-units.constant';

/** Lists every day as `'YYYY-MM-DD'` from the first day of a year to the last day of another, both included. */
export function listDaysOfYears(firstYear: number, lastYear: number): Array<string> {
  const first: number = Date.UTC(firstYear, 0, 1);
  const count: number = (Date.UTC(lastYear, 11, 31) - first) / DAY_IN_MILLISECONDS + 1;
  return Array.from({ length: count }, (_entry, index) => new Date(first + index * DAY_IN_MILLISECONDS).toISOString().slice(0, 10));
}
