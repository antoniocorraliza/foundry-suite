import type { ClockTime } from '../interfaces/clock-time.interface';

/** Clock time at the start of a day. */
export const MIDNIGHT: ClockTime = { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
/** Time that follows the `T` of a UTC midnight in ISO 8601. */
export const UTC_MIDNIGHT_TEXT: string = '00:00:00.000Z';
