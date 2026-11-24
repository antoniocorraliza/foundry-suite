import type { CsvRecord } from './csv-record.interface';

/** Records read from the start of a CSV text, and the offset where the reading stopped. */
export interface CsvTextSplit {
  readonly records: ReadonlyArray<CsvRecord>;
  readonly end: number;
}
