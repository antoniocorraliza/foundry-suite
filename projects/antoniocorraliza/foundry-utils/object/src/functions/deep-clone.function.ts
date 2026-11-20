import { checkCloneable } from './check-cloneable.function';
import { copyValue } from './copy-value.function';

/**
 * Returns a deep copy, or throws when the copy would change the data; files and blobs are kept by reference.
 * @throws {FoundryCloneError} When a value cannot be copied without changing it.
 */
export function deepClone<T>(value: T): T {
  checkCloneable(value);
  return copyValue(value) as T;
}
