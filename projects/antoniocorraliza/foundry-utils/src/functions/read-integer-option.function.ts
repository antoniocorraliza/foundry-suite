import type { IntegerOptionLookup } from '../interfaces/integer-option-lookup.interface';
import { getOwnDataValue } from './get-own-data-value.function';

/** Returns the value of an option that takes an integer within limits, or its fallback when it is missing or not such an integer. */
export function ɵreadIntegerOption<Fallback extends number | null>(lookup: IntegerOptionLookup<Fallback>): number | Fallback {
  const value: unknown = getOwnDataValue(lookup.options, lookup.name);
  const maximum: number = lookup.maximum ?? Number.POSITIVE_INFINITY;
  return typeof value === 'number' && Number.isInteger(value) && value >= lookup.minimum && value <= maximum ? value : lookup.fallback;
}
