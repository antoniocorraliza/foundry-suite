/** Column that `toCsv` writes, already checked. */
export interface CsvWriteColumn {
  readonly header: string;
  readonly readValue: (row: object) => unknown;
  readonly format: ((value: unknown, row: object) => unknown) | null;
}
