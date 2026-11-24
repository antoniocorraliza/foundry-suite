import type { FoundryCsvTable } from '../interfaces/foundry-csv-table.interface';
import type { FoundryCsvTableOptions } from '../interfaces/foundry-csv-table-options.interface';
import type { FoundryTextEncoding } from '../types/foundry-text-encoding.type';

/**
 * Reads a CSV file or Blob as `parseCsv` reads a text. Every error, an invalid argument included, comes as a rejected promise.
 * @throws {TypeError} When the file or an option are not valid, or the environment lacks `TextDecoder` or `Blob.prototype.arrayBuffer`.
 * @throws {FoundryCsvParseError} When the encoding, a quote, a header or the number of cells of a row is wrong.
 */
export async function readCsvFile(
  file: Blob,
  options?: FoundryCsvTableOptions & { readonly encoding?: FoundryTextEncoding },
): Promise<FoundryCsvTable> {
  throw new Error('[foundry-utils]: readCsvFile is not implemented yet');
}
