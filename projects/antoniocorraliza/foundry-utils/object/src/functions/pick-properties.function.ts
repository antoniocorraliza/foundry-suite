import { copyOwnProperties } from './copy-own-properties.function';
import { propertyNames } from './property-names.function';

/**
 * Returns a new object with only the given own properties of a plain object.
 * @throws {TypeError} When the object is not a plain object.
 */
export function pickProperties<T extends object, K extends keyof T>(object: T, keys: ReadonlyArray<K>): Pick<T, K> {
  const names: Set<string> = propertyNames(keys);
  return copyOwnProperties(object, 'pickProperties', (key) => names.has(key)) as Pick<T, K>;
}
