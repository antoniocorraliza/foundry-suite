import { ɵisOptionsValue, ɵparseBooleanOption } from '@antoniocorraliza/foundry-utils';
import type { CsvRecordsReading } from '../interfaces/csv-records-reading.interface';
import type { FoundryCsvParseOptions } from '../interfaces/foundry-csv-parse-options.interface';
import { checkCellCount } from './check-cell-count.function';
import { readCsvRecords } from './read-csv-records.function';

/**
 * Reads a CSV text into a list of records, without taking the first line as headers.
 * @throws {TypeError} When the text or an option are not valid.
 * @throws {FoundryCsvParseError} When a quote is wrong, or a record has another number of cells than the first one.
 */
export function parseCsvRecords(text: string, options?: FoundryCsvParseOptions): Array<Array<string>> {
  const reading: CsvRecordsReading = readCsvRecords(text, options);
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of parseCsvRecords must be an object');
  const isRelaxed: boolean = ɵparseBooleanOption({ options, name: 'relaxColumnCount', fallback: false });
  const cellCount: number = reading.records[0]?.cells.length ?? 0;
  if (!isRelaxed) reading.records.forEach((record) => checkCellCount(record, cellCount, false));
  return reading.records.map((record) => [...record.cells]);
}
