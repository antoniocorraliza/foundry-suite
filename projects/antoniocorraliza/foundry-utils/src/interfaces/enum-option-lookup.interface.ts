/** Option of a function that never throws, which takes one value of a closed list, and whatever was passed as its options. */
export interface EnumOptionLookup<Value extends string, Fallback extends Value | null> {
  readonly options: unknown;
  readonly name: string;
  readonly allowedValues: ReadonlyArray<Value>;
  readonly fallback: Fallback;
}
