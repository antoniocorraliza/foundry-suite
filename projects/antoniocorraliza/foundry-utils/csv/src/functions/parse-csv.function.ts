import { ɵdefineOwnProperty, ɵisOptionsValue, ɵparseBooleanOption, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { DUPLICATE_HEADER_MODES } from '../constants/duplicate-header-modes.constant';
import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import type { CsvRecord } from '../interfaces/csv-record.interface';
import type { CsvRecordsReading } from '../interfaces/csv-records-reading.interface';
import type { FoundryCsvTable } from '../interfaces/foundry-csv-table.interface';
import type { FoundryCsvTableOptions } from '../interfaces/foundry-csv-table-options.interface';
import type { DuplicateHeaderMode } from '../types/duplicate-header-mode.type';
import { checkCellCount } from './check-cell-count.function';
import { getCellLine } from './get-cell-line.function';
import { readCsvRecords } from './read-csv-records.function';

function findFreeHeader(header: string, takenHeaders: ReadonlySet<string>): string {
  let suffix: number = 2;
  while (takenHeaders.has(`${header}_${suffix}`)) suffix += 1;
  return `${header}_${suffix}`;
}

function readHeaders(record: CsvRecord, duplicateHeaders: DuplicateHeaderMode): Array<string> {
  const takenHeaders: Set<string> = new Set<string>(record.cells);
  const usedHeaders: Set<string> = new Set<string>();
  return record.cells.map((cell, index) => {
    const line: number = getCellLine(record, index);
    if (cell.trim() === '') throw new FoundryCsvParseError({ reason: 'emptyHeader', line, column: index + 1 });
    if (usedHeaders.has(cell) && duplicateHeaders === 'error') {
      throw new FoundryCsvParseError({ reason: 'duplicateHeader', line, column: index + 1 });
    }
    const header: string = usedHeaders.has(cell) ? findFreeHeader(cell, takenHeaders) : cell;
    takenHeaders.add(header);
    usedHeaders.add(header);
    return header;
  });
}

function readRowCells(record: CsvRecord, headerCount: number, isRelaxed: boolean): ReadonlyArray<string> {
  checkCellCount(record, headerCount, isRelaxed);
  return Array.from({ length: headerCount }, (_value, index) => record.cells[index] ?? '');
}

function writeRow(headers: ReadonlyArray<string>, cells: ReadonlyArray<string>): Record<string, string> {
  const row: Record<string, string> = {};
  headers.forEach((header, index) => ɵdefineOwnProperty(row, header, cells[index]));
  return row;
}

/**
 * Reads a CSV text with a header line into one object per row, with the headers as keys.
 * @throws {TypeError} When the text or an option are not valid.
 * @throws {FoundryCsvParseError} When a quote, a header or the number of cells of a row is wrong.
 */
export function parseCsv(text: string, options?: FoundryCsvTableOptions): FoundryCsvTable {
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of parseCsv must be an object');
  const reading: CsvRecordsReading = readCsvRecords(text, options);
  const isRelaxed: boolean = ɵparseBooleanOption({ options, name: 'relaxColumnCount', fallback: false });
  const duplicateHeaders: DuplicateHeaderMode = ɵparseEnumOption({
    options,
    name: 'duplicateHeaders',
    allowedValues: DUPLICATE_HEADER_MODES,
    fallback: 'error',
  });
  const [headerRecord, ...dataRecords] = reading.records;
  if (headerRecord === undefined) return { delimiter: reading.delimiter, headers: [], rows: [] };
  const headers: Array<string> = readHeaders(headerRecord, duplicateHeaders);
  const rows: Array<Record<string, string>> = dataRecords.map((record) =>
    writeRow(headers, readRowCells(record, headers.length, isRelaxed)),
  );
  return { delimiter: reading.delimiter, headers, rows };
}
