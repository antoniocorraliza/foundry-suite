import type { ClockTime } from '../interfaces/clock-time.interface';
import type { FoundryTimePrecision } from '../types/foundry-time-precision.type';

/** Returns a clock time as `'HH:mm'`, `'HH:mm:ss'` or `'HH:mm:ss.sss'`, truncated to the precision. */
export function writeTimeText(time: ClockTime, precision: Exclude<FoundryTimePrecision, 'none'>): string {
  const hoursAndMinutes: string = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
  if (precision === 'minutes') return hoursAndMinutes;
  const seconds: string = `${hoursAndMinutes}:${String(time.seconds).padStart(2, '0')}`;
  return precision === 'seconds' ? seconds : `${seconds}.${String(time.milliseconds).padStart(3, '0')}`;
}
