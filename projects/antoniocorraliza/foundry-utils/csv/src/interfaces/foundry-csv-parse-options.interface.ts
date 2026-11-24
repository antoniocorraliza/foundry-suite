import type { FoundryCsvDelimiter } from '../types/foundry-csv-delimiter.type';

/** Options of `parseCsvRecords`, and of `parseCsv` and `readCsvFile` through `FoundryCsvTableOptions`. */
export interface FoundryCsvParseOptions {
  /** Separator of the cells, or `'auto'` to choose it from the first lines. By default `'auto'`. */
  readonly delimiter?: FoundryCsvDelimiter | 'auto';
  /** Removes the apostrophe that escapes a formula. By default `'prefixApostrophe'`. */
  readonly formulaEscaping?: 'prefixApostrophe' | 'none';
  /** Trims the spaces around every cell and header. By default `false`. */
  readonly trimCells?: boolean;
  /** Skips the lines without any character. By default `true`. */
  readonly skipEmptyLines?: boolean;
  /** Fills the missing cells of a row and drops its extra empty ones. By default `false`. */
  readonly relaxColumnCount?: boolean;
}
