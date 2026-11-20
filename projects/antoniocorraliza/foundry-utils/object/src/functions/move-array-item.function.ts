function isIndexOf(index: number, array: ReadonlyArray<unknown>): boolean {
  return Number.isInteger(index) && index >= 0 && index < array.length;
}

/**
 * Returns a new array with one item moved to another position.
 * @throws {RangeError} When an index is not an integer inside the array.
 */
export function moveArrayItem<T>(array: ReadonlyArray<T>, fromIndex: number, toIndex: number): Array<T> {
  if (!isIndexOf(fromIndex, array) || !isIndexOf(toIndex, array)) {
    throw new RangeError(`[foundry-utils]: the indices ${fromIndex} and ${toIndex} must be integers from 0 to ${array.length - 1}`);
  }
  const copy: Array<T> = Array.from(array);
  copy.splice(toIndex, 0, ...copy.splice(fromIndex, 1));
  return copy;
}
