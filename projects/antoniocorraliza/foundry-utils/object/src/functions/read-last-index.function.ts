/** Reads the `lastIndex` of a regular expression from its own data property, which a structured clone sets back to 0. */
export function readLastIndex(regExp: object): unknown {
  return Object.getOwnPropertyDescriptor(regExp, 'lastIndex')?.value;
}
