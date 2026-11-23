import type { CivilDate } from '../interfaces/civil-date.interface';

/** Returns the day that is a number of days after 1970-01-01, with integer arithmetic and without `Date`. */
export function convertEpochDayToCivilDate(epochDay: number): CivilDate {
  const shiftedDay: number = epochDay + 719_468;
  const era: number = Math.floor(shiftedDay / 146_097);
  const dayOfEra: number = shiftedDay - era * 146_097;
  const yearOfEra: number = Math.floor(
    (dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36_524) - Math.floor(dayOfEra / 146_096)) / 365,
  );
  const dayOfYear: number = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const shiftedMonth: number = Math.floor((5 * dayOfYear + 2) / 153);
  const month: number = shiftedMonth < 10 ? shiftedMonth + 3 : shiftedMonth - 9;
  const year: number = yearOfEra + era * 400 + (month <= 2 ? 1 : 0);
  return { year, month, day: dayOfYear - Math.floor((153 * shiftedMonth + 2) / 5) + 1 };
}
