/** Reads the size of a Map with the native getter, which an own `size` property of the value cannot fake. */
export function readMapSize(map: object): number {
  return Reflect.get(Map.prototype, 'size', map) as number;
}
