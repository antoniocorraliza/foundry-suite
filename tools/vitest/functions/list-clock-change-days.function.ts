import { DAY_IN_MILLISECONDS } from '../constants/time-units.constant';
import { listDaysOfYears } from './list-days-of-years.function';
import { readWallClock } from './read-wall-clock.function';

/** Lists the local days, as `'YYYY-MM-DD'`, around each change of the UTC offset of the process between two years. */
export function listClockChangeDays(firstYear: number, lastYear: number): Array<string> {
  const days: Set<string> = new Set<string>();
  listDaysOfYears(firstYear, lastYear)
    .map((day) => Date.parse(day))
    .filter((time) => new Date(time).getTimezoneOffset() !== new Date(time + DAY_IN_MILLISECONDS).getTimezoneOffset())
    .flatMap((time) => [time, time + DAY_IN_MILLISECONDS / 2, time + DAY_IN_MILLISECONDS])
    .forEach((time) => days.add(readWallClock(new Date(time)).slice(0, 10)));
  return [...days].sort();
}
