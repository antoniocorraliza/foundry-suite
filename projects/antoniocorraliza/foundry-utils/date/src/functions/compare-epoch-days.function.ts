/** Compares two days counted from 1970-01-01, for `sort`. */
export function compareEpochDays(first: number, second: number): -1 | 0 | 1 {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}
