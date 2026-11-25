import type { IsEmptyEntries } from '../types/is-empty-entries.type';
import { ɵgetOwnDataEntries } from './get-own-data-entries.function';
import { ɵgetValueKind } from './get-value-kind.function';
import { ɵreadMapSize } from './read-map-size.function';
import { ɵreadSetSize } from './read-set-size.function';

/**
 * Tells whether a value is empty: `null`, `undefined`, blank text, `NaN`, an invalid date, an empty map or set, or an array or plain
 * object without own data entries. `isEmptyEntries` decides for an array or plain object that has entries.
 */
export function ɵisEmptyValue(value: unknown, isEmptyEntries: IsEmptyEntries): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value !== 'object') return false;
  switch (ɵgetValueKind(value)) {
    case 'date':
      return Number.isNaN(Date.prototype.getTime.call(value));
    case 'map':
      return ɵreadMapSize(value) === 0;
    case 'set':
      return ɵreadSetSize(value) === 0;
    case 'array':
    case 'plainObject': {
      const entries: Array<[string, unknown]> = ɵgetOwnDataEntries(value);
      return entries.length === 0 || isEmptyEntries(value, entries);
    }
    default:
      return false;
  }
}
