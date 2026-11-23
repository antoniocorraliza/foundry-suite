/** Holds the time of a parts object, with the missing lower parts at zero, and how many parts it had. */
export interface PartsTime {
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly milliseconds: number;
  readonly writtenParts: number;
}
