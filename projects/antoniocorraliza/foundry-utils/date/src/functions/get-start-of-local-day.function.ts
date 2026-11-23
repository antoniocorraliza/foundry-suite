import { MIDNIGHT } from '../constants/midnight.constant';
import { MILLISECONDS_PER_DAY } from '../constants/time-units.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import { buildZonedDate } from './build-zoned-date.function';
import { convertEpochDayToCivilDate } from './convert-epoch-day-to-civil-date.function';
import { getEpochDayOfValidDate } from './get-epoch-day-of-valid-date.function';
import { setLocalClockTime } from './set-local-clock-time.function';

function findFirstTimeOfDay(epochDay: number, laterTime: number): number {
  let earlierTime: number = laterTime - MILLISECONDS_PER_DAY;
  while (laterTime - earlierTime > 1) {
    const middleTime: number = Math.floor((earlierTime + laterTime) / 2);
    if (getEpochDayOfValidDate(new Date(middleTime)) >= epochDay) laterTime = middleTime;
    else earlierTime = middleTime;
  }
  return laterTime;
}

/** Returns the first instant whose local day is the given day or a later one: its midnight, or the instant its clock starts when it skips midnight. */
export function getStartOfLocalDay(epochDay: number): Date {
  const date: CivilDate = convertEpochDayToCivilDate(epochDay);
  const midnight: Date | null = buildZonedDate(date, MIDNIGHT, 'local');
  return midnight ?? new Date(findFirstTimeOfDay(epochDay, setLocalClockTime(date, MIDNIGHT).getTime()));
}
