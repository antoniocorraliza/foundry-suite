/** Logical line of a CSV, split into cells. */
export interface CsvRecord {
  readonly cells: ReadonlyArray<string>;
}
