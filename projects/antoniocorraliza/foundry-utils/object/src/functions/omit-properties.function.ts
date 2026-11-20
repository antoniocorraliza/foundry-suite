import { copyOwnProperties } from './copy-own-properties.function';
import { getPropertyNames } from './get-property-names.function';

/**
 * Returns a new object with the own properties of a plain object except the given ones.
 * @throws {TypeError} When the object is not a plain object.
 */
export function omitProperties<T extends object, K extends keyof T>(object: T, keys: ReadonlyArray<K>): Omit<T, K> {
  const names: Set<string> = getPropertyNames(keys);
  return copyOwnProperties(object, 'omitProperties', (key) => !names.has(key)) as Omit<T, K>;
}
