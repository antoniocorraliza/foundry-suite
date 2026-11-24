/** Option of a function that never throws, which takes a boolean, and whatever was passed as its options. */
export interface BooleanOptionLookup {
  readonly options: unknown;
  readonly name: string;
  readonly fallback: boolean;
}
