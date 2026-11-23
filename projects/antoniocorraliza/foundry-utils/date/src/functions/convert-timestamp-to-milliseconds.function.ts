import { MILLISECONDS_PER_SECOND } from '../constants/time-units.constant';
import type { TimestampUnit } from '../types/timestamp-unit.type';

/** Returns a timestamp in milliseconds from a timestamp in the given unit. */
export function convertTimestampToMilliseconds(timestamp: number, unit: TimestampUnit): number {
  return unit === 'seconds' ? timestamp * MILLISECONDS_PER_SECOND : timestamp;
}
