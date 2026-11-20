import type { FoundryDeepEqualOptions } from '../interfaces/foundry-deep-equal-options.interface';

/** Compares two values in depth; dates, maps, sets and buffers by content, files and class instances by reference. */
export function isDeepEqual(first: unknown, second: unknown, options?: FoundryDeepEqualOptions): boolean {
  throw new Error('[foundry-utils]: not implemented');
}
