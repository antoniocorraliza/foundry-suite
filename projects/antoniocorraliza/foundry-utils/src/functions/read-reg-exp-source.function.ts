/** Reads the source of a regular expression with the native getter, which throws when the value is not one. */
export function ɵreadRegExpSource(value: object): unknown {
  return Object.getOwnPropertyDescriptor(RegExp.prototype, 'source')?.get?.call(value);
}
