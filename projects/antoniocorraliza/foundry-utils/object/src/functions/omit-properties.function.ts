/**
 * Returns a new object with the own properties of a plain object except the given ones.
 * @throws {TypeError} When the object is not a plain object.
 */
export function omitProperties<T extends object, K extends keyof T>(object: T, keys: ReadonlyArray<K>): Omit<T, K> {
  throw new Error('[foundry-utils]: not implemented');
}
