/** Creates an array of that length with items only at the given indices, so every other index is a hole. */
export function createSparseArray(length: number, items: Readonly<Record<number, unknown>>): Array<unknown> {
  return Object.assign(new Array<unknown>(length), items);
}
