/** Tells whether a value is an array whose items are all texts. */
export function ɵisTextList(value: unknown): value is ReadonlyArray<string> {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
