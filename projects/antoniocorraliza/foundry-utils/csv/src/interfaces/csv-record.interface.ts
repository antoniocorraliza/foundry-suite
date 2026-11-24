/** Logical line of a CSV, split into cells, with the physical lines where each cell starts and where the record ends. */
export interface CsvRecord {
  readonly cells: ReadonlyArray<string>;
  readonly cellLines: ReadonlyArray<number>;
  readonly endLine: number;
}
