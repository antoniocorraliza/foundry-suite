/** Reads the size of a Set with the native getter, which an own `size` property of the value cannot fake. */
export function readSetSize(set: object): number {
  return Reflect.get(Set.prototype, 'size', set) as number;
}
