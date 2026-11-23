import type { FoundryWeekday } from '../types/foundry-weekday.type';

/**
 * Returns the `firstDayOfWeek` option, Monday by default.
 * @throws {RangeError} When the value is not an integer from 0 to 6.
 */
export function parseWeekdayOption(options: Readonly<Record<string, unknown>> | undefined): FoundryWeekday {
  const value: unknown = options?.['firstDayOfWeek'] ?? 1;
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 6) {
    throw new RangeError(`[foundry-utils]: firstDayOfWeek must be an integer from 0 to 6, got ${String(value)}`);
  }
  return value as FoundryWeekday;
}
