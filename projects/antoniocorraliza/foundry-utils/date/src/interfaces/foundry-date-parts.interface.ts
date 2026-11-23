/** Parts of a date, with the month from 1 to 12. */
export interface FoundryDateParts {
  /** Year, from 1 to 9999. */
  readonly year: number;
  /** Month, from 1 to 12. */
  readonly month: number;
  /** Day of the month, from 1 to 31. */
  readonly day: number;
  /** Hours, from 0 to 23. */
  readonly hours?: number;
  /** Minutes, from 0 to 59. */
  readonly minutes?: number;
  /** Seconds, from 0 to 59. */
  readonly seconds?: number;
  /** Milliseconds, from 0 to 999. */
  readonly milliseconds?: number;
}
