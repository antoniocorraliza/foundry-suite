import type { BooleanOptionLookup } from '../interfaces/boolean-option-lookup.interface';
import { ɵgetOwnDataValue } from './get-own-data-value.function';

/** Returns the value of an option that takes a boolean, or its fallback when it is missing or not a boolean. */
export function ɵreadBooleanOption(lookup: BooleanOptionLookup): boolean {
  const value: unknown = ɵgetOwnDataValue(lookup.options, lookup.name);
  return typeof value === 'boolean' ? value : lookup.fallback;
}
