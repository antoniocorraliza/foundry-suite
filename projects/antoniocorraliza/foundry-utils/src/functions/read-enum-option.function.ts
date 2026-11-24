import type { EnumOptionLookup } from '../interfaces/enum-option-lookup.interface';
import { getOwnDataValue } from './get-own-data-value.function';

/** Returns the value of an option that takes one value of a closed list, or its fallback when it is missing or not in the list. */
export function ɵreadEnumOption<Value extends string, Fallback extends Value | null>(
  lookup: EnumOptionLookup<Value, Fallback>,
): Value | Fallback {
  const value: unknown = getOwnDataValue(lookup.options, lookup.name);
  return lookup.allowedValues.find((allowed) => allowed === value) ?? lookup.fallback;
}
