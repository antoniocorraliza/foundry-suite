import { ɵgetOwnDataEntries, ɵisPlainObject } from '@antoniocorraliza/foundry-utils';
import { TIME_PARTS } from '../constants/time-parts.constant';
import type { CivilDate } from '../interfaces/civil-date.interface';
import type { DatePartsReading } from '../interfaces/date-parts-reading.interface';
import type { PartsTime } from '../interfaces/parts-time.interface';
import { isExistingCivilDate } from './is-existing-civil-date.function';

function isTimePartInRange(value: unknown, maximum: number): boolean {
  return value === undefined || (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= maximum);
}

function readPartsTime(entries: ReadonlyMap<string, unknown>): PartsTime | null {
  const values: Array<unknown> = TIME_PARTS.map((part) => entries.get(part.name));
  const writtenParts: number = values.filter((value) => value !== undefined).length;
  const isComplete: boolean = values.slice(writtenParts).every((value) => value === undefined);
  const isInRange: boolean = TIME_PARTS.every((part) => isTimePartInRange(entries.get(part.name), part.maximum));
  if (!isComplete || !isInRange) return null;
  const [hours = 0, minutes = 0, seconds = 0, milliseconds = 0] = values.filter((value) => typeof value === 'number');
  return { hours, minutes, seconds, milliseconds, writtenParts };
}

/**
 * Reads the day and the time of a plain object with integer parts, without running getters, or returns `null` when it has no day.
 * The time is `null` when a time part is invalid or missing above a written one.
 */
export function readDateParts(value: unknown): DatePartsReading | null {
  if (!ɵisPlainObject(value)) return null;
  const entries: ReadonlyMap<string, unknown> = new Map(ɵgetOwnDataEntries(value));
  const [year, month, day] = ['year', 'month', 'day'].map((name) => entries.get(name));
  if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') return null;
  if (![year, month, day].every(Number.isInteger)) return null;
  const date: CivilDate = { year, month, day };
  return isExistingCivilDate(date) ? { date, time: readPartsTime(entries) } : null;
}
