/** Column of a CSV that `toCsv` writes. */
export interface FoundryCsvColumn<Row> {
  /** Text of the header line. */
  readonly header: string;
  /** Property of the row, or a function that computes the cell from the row. */
  readonly value: (keyof Row & string) | ((row: Row) => unknown);
  /** Turns the value into the text of the cell. Without it, the default conversion applies. */
  readonly format?: (value: unknown, row: Row) => string;
}
