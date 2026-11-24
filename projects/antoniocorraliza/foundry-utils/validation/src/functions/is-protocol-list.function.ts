/** Tells whether a value is a list of protocols, which are texts. */
export function isProtocolList(value: unknown): value is ReadonlyArray<string> {
  return Array.isArray(value) && value.every((protocol) => typeof protocol === 'string');
}
