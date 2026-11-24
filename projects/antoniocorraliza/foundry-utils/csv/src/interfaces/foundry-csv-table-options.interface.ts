import type { FoundryCsvParseOptions } from './foundry-csv-parse-options.interface';

/** Options of `parseCsv` and `readCsvFile`. */
export interface FoundryCsvTableOptions extends FoundryCsvParseOptions {
  /** Throws on a repeated header, or renames it with the next free suffix (`Importe_2`). By default `'error'`. */
  readonly duplicateHeaders?: 'error' | 'suffix';
}
