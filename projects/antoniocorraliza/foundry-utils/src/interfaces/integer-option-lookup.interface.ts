/** Option of a function that never throws, which takes an integer within limits, and whatever was passed as its options. */
export interface IntegerOptionLookup<Fallback extends number | null> {
  readonly options: unknown;
  readonly name: string;
  readonly minimum: number;
  readonly maximum?: number;
  readonly fallback: Fallback;
}
