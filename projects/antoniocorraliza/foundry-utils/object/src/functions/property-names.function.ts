/** Returns the string and number keys of a list as property names, leaving symbols out. */
export function propertyNames(keys: ReadonlyArray<PropertyKey>): Set<string> {
  return new Set<string>(keys.filter((key) => typeof key !== 'symbol').map((key) => String(key)));
}
