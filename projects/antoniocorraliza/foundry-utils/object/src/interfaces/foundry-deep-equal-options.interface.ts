/** Options of `isDeepEqual` and `getObjectDifferences`. */
export interface FoundryDeepEqualOptions {
  /** Runs on every pair before the default rule: `true` or `false` decides, `undefined` leaves it to the default rule. */
  readonly customEquality?: (first: unknown, second: unknown) => boolean | undefined;
}
