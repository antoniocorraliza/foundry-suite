/** Holds the time read from a text, its milliseconds truncated, and its offset from UTC in minutes when it has one. */
export interface TimeTextReading {
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly milliseconds: number;
  readonly isWholeMinute: boolean;
  readonly offsetMinutes: number | null;
}
