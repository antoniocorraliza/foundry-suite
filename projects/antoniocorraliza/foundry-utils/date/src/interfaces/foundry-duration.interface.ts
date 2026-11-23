/** Duration split into its sign, hours, minutes and seconds. */
export interface FoundryDuration {
  /** Sign of the duration; `1` for zero. */
  readonly sign: 1 | -1;
  /** Whole hours, not limited to 24. */
  readonly hours: number;
  /** Minutes, from 0 to 59. */
  readonly minutes: number;
  /** Seconds, from 0 to 59. */
  readonly seconds: number;
}
