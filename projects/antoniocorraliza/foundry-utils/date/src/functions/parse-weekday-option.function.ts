import { ɵparseIntegerOption } from '@antoniocorraliza/foundry-utils';
import type { FoundryWeekday } from '../types/foundry-weekday.type';

/**
 * Returns the `firstDayOfWeek` option, Monday by default.
 * @throws {TypeError} When the value is not a number.
 * @throws {RangeError} When the value is not an integer from 0 to 6.
 */
export function parseWeekdayOption(options: Readonly<Record<string, unknown>> | undefined): FoundryWeekday {
  return ɵparseIntegerOption({ options, name: 'firstDayOfWeek', minimum: 0, maximum: 6, fallback: 1 }) as FoundryWeekday;
}
