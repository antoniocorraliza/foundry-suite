import type { CsvRecordsReading } from '../interfaces/csv-records-reading.interface';
import type { FoundryCsvParseOptions } from '../interfaces/foundry-csv-parse-options.interface';

/**
 * Splits a CSV text into records, choosing the separator with `'auto'`, trimming and removing the escape apostrophe as asked.
 * @throws {TypeError} When the text or an option are not valid.
 * @throws {FoundryCsvParseError} When a quote is not closed or is out of place.
 */
export function readCsvRecords(text: string, options: FoundryCsvParseOptions | undefined): CsvRecordsReading {
  throw new Error('[foundry-utils]: readCsvRecords is not implemented yet');
}
