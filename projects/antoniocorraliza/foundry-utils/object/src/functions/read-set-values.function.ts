/** Reads the values of a Set with the native iterator, which an own `values` property of the value cannot fake. */
export function readSetValues(set: object): Array<unknown> {
  return Array.from(Set.prototype.values.call(set) as Iterable<unknown>);
}
