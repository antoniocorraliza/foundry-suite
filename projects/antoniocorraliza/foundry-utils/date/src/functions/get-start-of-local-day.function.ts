import { MIDNIGHT } from '../constants/midnight.constant';
import { MILLISECONDS_PER_DAY } from '../constants/time-units.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import { buildLocalDate } from './build-local-date.function';
import { convertEpochDayToCivilDate } from './convert-epoch-day-to-civil-date.function';
import { createLocalDate } from './create-local-date.function';
import { getLocalEpochDay } from './get-local-epoch-day.function';

function findFirstTimeOfDay(epochDay: number, laterTime: number): number {
  let earlierTime: number = laterTime - MILLISECONDS_PER_DAY;
  while (laterTime - earlierTime > 1) {
    const middleTime: number = Math.floor((earlierTime + laterTime) / 2);
    if (getLocalEpochDay(new Date(middleTime)) >= epochDay) laterTime = middleTime;
    else earlierTime = middleTime;
  }
  return laterTime;
}

/** Returns the first instant whose local day is the given day or a later one: its midnight, or the instant its clock starts when it skips midnight. */
export function getStartOfLocalDay(epochDay: number): Date {
  const date: CivilDate = convertEpochDayToCivilDate(epochDay);
  const midnight: Date | null = buildLocalDate(date, MIDNIGHT, 'local');
  return midnight ?? new Date(findFirstTimeOfDay(epochDay, createLocalDate(date, MIDNIGHT).getTime()));
}
