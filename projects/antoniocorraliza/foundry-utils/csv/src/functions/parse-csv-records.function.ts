import { ɵparseBooleanOption } from '@antoniocorraliza/foundry-utils';
import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import type { CsvRecord } from '../interfaces/csv-record.interface';
import type { CsvRecordsReading } from '../interfaces/csv-records-reading.interface';
import type { FoundryCsvParseOptions } from '../interfaces/foundry-csv-parse-options.interface';
import { readCsvRecords } from './read-csv-records.function';

function checkCellCount(record: CsvRecord, cellCount: number): void {
  if (record.cells.length > cellCount) {
    throw new FoundryCsvParseError({
      reason: 'columnCountMismatch',
      line: record.cellLines[cellCount] ?? record.endLine,
      column: cellCount + 1,
    });
  }
  if (record.cells.length < cellCount) {
    throw new FoundryCsvParseError({ reason: 'columnCountMismatch', line: record.endLine, column: record.cells.length + 1 });
  }
}

/**
 * Reads a CSV text into a list of records, without taking the first line as headers.
 * @throws {TypeError} When the text or an option are not valid.
 * @throws {FoundryCsvParseError} When a quote is wrong, or a record has another number of cells than the first one.
 */
export function parseCsvRecords(text: string, options?: FoundryCsvParseOptions): Array<Array<string>> {
  const reading: CsvRecordsReading = readCsvRecords(text, options);
  const isRelaxed: boolean = ɵparseBooleanOption({
    options: options as Readonly<Record<string, unknown>> | undefined,
    name: 'relaxColumnCount',
    fallback: false,
  });
  const cellCount: number = reading.records[0]?.cells.length ?? 0;
  if (!isRelaxed) reading.records.forEach((record) => checkCellCount(record, cellCount));
  return reading.records.map((record) => [...record.cells]);
}
