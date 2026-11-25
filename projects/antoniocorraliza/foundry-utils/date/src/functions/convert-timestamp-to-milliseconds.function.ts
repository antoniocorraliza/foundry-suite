import { MILLISECONDS_PER_SECOND } from '../constants/time-units.constant';
import type { TimestampUnit } from '../types/timestamp-unit.type';

/** Returns a timestamp in milliseconds from one in the given unit, keeping its decimals for the caller to truncate. */
export function convertTimestampToMilliseconds(timestamp: number, unit: TimestampUnit): number {
  return unit === 'seconds' ? timestamp * MILLISECONDS_PER_SECOND : timestamp;
}
