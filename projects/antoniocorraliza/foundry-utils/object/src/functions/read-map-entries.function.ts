/** Reads the entries of a Map with the native iterator, which an own `entries` property of the value cannot fake. */
export function readMapEntries(map: object): Array<[unknown, unknown]> {
  return Array.from(Map.prototype.entries.call(map) as Iterable<[unknown, unknown]>);
}
