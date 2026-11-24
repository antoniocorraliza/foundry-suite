import type { FoundryCsvParseOptions } from '../interfaces/foundry-csv-parse-options.interface';

/**
 * Reads a CSV text into a list of records, without taking the first line as headers.
 * @throws {TypeError} When the text or an option are not valid.
 * @throws {FoundryCsvParseError} When a quote is wrong, or a record has another number of cells than the first one.
 */
export function parseCsvRecords(text: string, options?: FoundryCsvParseOptions): Array<Array<string>> {
  throw new Error('[foundry-utils]: parseCsvRecords is not implemented yet');
}
