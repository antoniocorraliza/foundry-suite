import type { FoundryCsvTable } from '../interfaces/foundry-csv-table.interface';
import type { FoundryCsvTableOptions } from '../interfaces/foundry-csv-table-options.interface';

/**
 * Reads a CSV text with a header line into one object per row, with the headers as keys.
 * @throws {TypeError} When the text or an option are not valid.
 * @throws {FoundryCsvParseError} When a quote, a header or the number of cells of a row is wrong.
 */
export function parseCsv(text: string, options?: FoundryCsvTableOptions): FoundryCsvTable {
  throw new Error('[foundry-utils]: parseCsv is not implemented yet');
}
