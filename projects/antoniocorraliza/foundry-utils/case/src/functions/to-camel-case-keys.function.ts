import type { FoundryKeyConversionOptions } from '../interfaces/foundry-key-conversion-options.interface';
import type { FoundryCamelCaseKeys } from '../types/foundry-camel-case-keys.type';
import { convertKeys } from './convert-keys.function';
import { toCamelCase } from './to-camel-case.function';

/**
 * Returns a copy with the keys of its plain objects converted to camelCase, in depth. Other objects are kept by reference.
 * @throws {FoundryKeyCollisionError} When two keys of one object convert to the same key.
 * @throws {FoundryCircularReferenceError} When the value contains a cycle.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function toCamelCaseKeys<T>(value: T, options?: FoundryKeyConversionOptions): FoundryCamelCaseKeys<T> {
  return convertKeys(value, options, toCamelCase) as FoundryCamelCaseKeys<T>;
}
