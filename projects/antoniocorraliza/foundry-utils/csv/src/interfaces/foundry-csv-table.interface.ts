import type { FoundryCsvDelimiter } from '../types/foundry-csv-delimiter.type';

/** CSV read with its header line. */
export interface FoundryCsvTable {
  /** Separator used to read it, also when it was chosen with `'auto'`. */
  readonly delimiter: FoundryCsvDelimiter;
  /** Headers in the order of the file. */
  readonly headers: ReadonlyArray<string>;
  /** One object per row, with the headers as keys. */
  readonly rows: ReadonlyArray<Readonly<Record<string, string>>>;
}
