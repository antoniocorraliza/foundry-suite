import { MINUTE_IN_MILLISECONDS } from '../constants/time-units.constant';

/** Lists instants of a UTC year every given number of minutes plus a drift, so they fall on varied seconds and milliseconds. */
export function listInstantsOfYear(year: number, stepInMinutes: number, driftInMilliseconds: number): Array<Date> {
  const first: number = Date.UTC(year, 0, 1);
  const count: number = Math.floor((Date.UTC(year + 1, 0, 1) - first) / (stepInMinutes * MINUTE_IN_MILLISECONDS));
  return Array.from(
    { length: count },
    (_entry, index) => new Date(first + index * (stepInMinutes * MINUTE_IN_MILLISECONDS + driftInMilliseconds)),
  );
}
