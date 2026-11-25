/** Value of a form sent as a text part with its JSON. */
export interface FoundryFormDataJson {
  /** The value that `JSON.stringify` writes. */
  readonly json: unknown;
}
