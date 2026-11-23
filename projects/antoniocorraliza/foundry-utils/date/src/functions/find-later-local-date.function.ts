import { MILLISECONDS_PER_HOUR, MILLISECONDS_PER_MINUTE } from '../constants/time-units.constant';

/** Returns the last instant whose local clock shows the same time as a first instant, or a copy of it when the time does not repeat. */
export function findLaterLocalDate(earlier: Date): Date {
  const offset: number = earlier.getTimezoneOffset();
  const laterOffset: number = new Date(earlier.getTime() + 6 * MILLISECONDS_PER_HOUR).getTimezoneOffset();
  const later: Date = new Date(earlier.getTime() + (laterOffset - offset) * MILLISECONDS_PER_MINUTE);
  return laterOffset > offset && later.getTimezoneOffset() === laterOffset ? later : new Date(earlier.getTime());
}
