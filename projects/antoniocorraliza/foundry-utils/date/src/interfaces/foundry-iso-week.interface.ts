/** ISO 8601 week with the year it belongs to. */
export interface FoundryIsoWeek {
  /** Year of the week, which can differ from the year of the day. */
  readonly year: number;
  /** Week, from 1 to 53. */
  readonly week: number;
}
