/** Returns the `[object Type]` tag of a value, which does not depend on the context that created it. */
export function ɵgetFoundryValueTag(value: unknown): string {
  return Object.prototype.toString.call(value);
}
