import { ɵisOptionsValue } from '@antoniocorraliza/foundry-utils';
import { buildLocalDays } from './build-local-days.function';
import { getEpochDayOfDate } from './get-epoch-day-of-date.function';

/**
 * Returns the local days from `start` to `end`, both included, each at its first instant.
 * @throws {RangeError} When a date is invalid, `start` is after `end`, the step is not a positive integer, the list passes 36600 days or a day is skipped by the time zone.
 * @throws {TypeError} When the options are not an object.
 */
export function getDaysInRange(start: Date, end: Date, options?: { readonly stepInDays?: number }): Array<Date> {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of getDaysInRange must be an object');
  const step: unknown = options?.['stepInDays'] ?? 1;
  if (!Number.isInteger(step) || (step as number) < 1) {
    throw new RangeError(`[foundry-utils]: stepInDays must be a positive integer, got ${String(step)}`);
  }
  const startEpochDay: number = getEpochDayOfDate(start);
  const endEpochDay: number = getEpochDayOfDate(end);
  if (startEpochDay > endEpochDay) throw new RangeError('[foundry-utils]: the start of the range is after its end');
  return buildLocalDays(startEpochDay, Math.floor((endEpochDay - startEpochDay) / (step as number)) + 1, step as number);
}
