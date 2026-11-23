import type { FoundryKeyConversionOptions } from '../interfaces/foundry-key-conversion-options.interface';
import type { FoundrySnakeCaseKeys } from '../types/foundry-snake-case-keys.type';
import { convertKeys } from './convert-keys.function';
import { toSnakeCase } from './to-snake-case.function';

/**
 * Returns a copy with the keys of its plain objects converted to snake_case, in depth. Other objects are kept by reference.
 * @throws {FoundryKeyCollisionError} When two keys of one object convert to the same key.
 * @throws {FoundryCircularReferenceError} When the value contains a cycle.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function toSnakeCaseKeys<T>(value: T, options?: FoundryKeyConversionOptions): FoundrySnakeCaseKeys<T> {
  return convertKeys(value, options, toSnakeCase) as FoundrySnakeCaseKeys<T>;
}
