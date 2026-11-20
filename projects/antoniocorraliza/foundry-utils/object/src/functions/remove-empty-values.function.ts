import type { FoundryRemoveEmptyValuesOptions } from '../interfaces/foundry-remove-empty-values-options.interface';
import type { FoundryWithoutEmptyValues } from '../types/foundry-without-empty-values.type';

/**
 * Returns a copy without `null` and `undefined` properties, in depth; dates, files and other objects are kept as they are.
 * @throws {FoundryCircularReferenceError} When the value contains a cycle.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function removeEmptyValues<T>(
  value: T,
  options?: FoundryRemoveEmptyValuesOptions & { readonly removeEmptyArrayItems?: false },
): FoundryWithoutEmptyValues<T>;

/**
 * Returns a copy without `null` and `undefined` properties or array items, in depth.
 * @throws {FoundryCircularReferenceError} When the value contains a cycle.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function removeEmptyValues<T>(
  value: T,
  options: FoundryRemoveEmptyValuesOptions & { readonly removeEmptyArrayItems: true },
): FoundryWithoutEmptyValues<T, true>;

export function removeEmptyValues(value: unknown, options?: FoundryRemoveEmptyValuesOptions): unknown {
  throw new Error('[foundry-utils]: not implemented');
}
