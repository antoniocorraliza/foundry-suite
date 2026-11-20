import type { FoundryKeyConversionOptions } from '../interfaces/foundry-key-conversion-options.interface';
import type { FoundryCamelCaseKeys } from '../types/foundry-camel-case-keys.type';

/**
 * Returns a copy with the keys of its plain objects converted to camelCase, in depth; other objects are kept by reference.
 * @throws {FoundryKeyCollisionError} When two keys of one object convert to the same key.
 * @throws {FoundryCircularReferenceError} When the value contains a cycle.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function toCamelCaseKeys<T>(value: T, options?: FoundryKeyConversionOptions): FoundryCamelCaseKeys<T> {
  throw new Error('[foundry-utils]: not implemented');
}
