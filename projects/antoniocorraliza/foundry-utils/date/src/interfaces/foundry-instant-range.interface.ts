/** Half-open range of instants: `start` is included and `endExclusive` is not. */
export interface FoundryInstantRange {
  /** First instant of the range. */
  readonly start: Date;
  /** First instant after the range. */
  readonly endExclusive: Date;
}
