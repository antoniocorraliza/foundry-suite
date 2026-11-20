import type { FoundryDeepEqualOptions } from '../interfaces/foundry-deep-equal-options.interface';
import type { FoundryObjectDifference } from '../interfaces/foundry-object-difference.interface';

/**
 * Lists the values added, removed or changed between two values, each with its path.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function getObjectDifferences(
  previous: unknown,
  current: unknown,
  options?: { readonly arrays?: 'atomic' | 'byIndex' } & FoundryDeepEqualOptions,
): ReadonlyArray<FoundryObjectDifference> {
  throw new Error('[foundry-utils]: not implemented');
}
