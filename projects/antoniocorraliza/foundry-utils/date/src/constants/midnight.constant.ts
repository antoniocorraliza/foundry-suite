import type { ClockTime } from '../interfaces/clock-time.interface';

/** Gives the clock time at the start of a day. */
export const MIDNIGHT: ClockTime = { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
/** Gives the time that follows the `T` of a UTC midnight in ISO 8601. */
export const UTC_MIDNIGHT_TEXT: string = '00:00:00.000Z';
