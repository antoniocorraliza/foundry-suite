import type { IntegerOptionLookup } from '../interfaces/integer-option-lookup.interface';

/** Returns the value of an option that takes an integer within limits, or its fallback when it is missing or not such an integer. */
export function ɵreadIntegerOption<Fallback extends number | null>(lookup: IntegerOptionLookup<Fallback>): number | Fallback {
  throw new Error(`[foundry-utils]: not implemented yet: ${lookup.name}`);
}
