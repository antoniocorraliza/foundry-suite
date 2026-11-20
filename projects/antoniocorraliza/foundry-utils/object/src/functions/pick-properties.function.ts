/**
 * Returns a new object with only the given own properties of a plain object.
 * @throws {TypeError} When the object is not a plain object.
 */
export function pickProperties<T extends object, K extends keyof T>(object: T, keys: ReadonlyArray<K>): Pick<T, K> {
  throw new Error('[foundry-utils]: not implemented');
}
