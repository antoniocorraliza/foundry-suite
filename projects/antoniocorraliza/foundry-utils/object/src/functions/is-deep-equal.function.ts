import type { FoundryDeepEqualOptions } from '../interfaces/foundry-deep-equal-options.interface';
import { areValuesEqual } from './are-values-equal.function';
import { readCustomEquality } from './read-custom-equality.function';

/** Compares two values in depth: dates, maps, sets and buffers by content, files and class instances by reference. */
export function isDeepEqual(first: unknown, second: unknown, options?: FoundryDeepEqualOptions): boolean {
  return areValuesEqual(first, second, readCustomEquality(options));
}
