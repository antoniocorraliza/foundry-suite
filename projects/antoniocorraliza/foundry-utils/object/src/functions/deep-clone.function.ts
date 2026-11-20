/**
 * Returns a deep copy, or throws when the copy would change the data; files and blobs are kept by reference.
 * @throws {FoundryCloneError} When a value cannot be copied without changing it.
 *
 */
export function deepClone<T>(value: T): T {
  throw new Error('[foundry-utils]: not implemented');
}
