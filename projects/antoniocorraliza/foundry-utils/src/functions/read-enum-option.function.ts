import type { EnumOptionLookup } from '../interfaces/enum-option-lookup.interface';

/** Returns the value of an option that takes one value of a closed list, or its fallback when it is missing or not in the list. */
export function ɵreadEnumOption<Value extends string, Fallback extends Value | null>(
  lookup: EnumOptionLookup<Value, Fallback>,
): Value | Fallback {
  throw new Error(`[foundry-utils]: not implemented yet: ${lookup.name}`);
}
