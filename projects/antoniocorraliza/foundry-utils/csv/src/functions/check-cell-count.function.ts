import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import type { CsvRecord } from '../interfaces/csv-record.interface';
import { getCellLine } from './get-cell-line.function';

/**
 * Checks that a record has the number of cells of the table. Relaxed, it only rejects a cell beyond them that is not empty.
 * @throws {FoundryCsvParseError} When a cell is left over or missing, at the first cell that is wrong.
 */
export function checkCellCount(record: CsvRecord, cellCount: number, isRelaxed: boolean): void {
  const extraIndex: number = record.cells.findIndex((cell, index) => index >= cellCount && (!isRelaxed || cell !== ''));
  if (extraIndex !== -1) {
    throw new FoundryCsvParseError({ reason: 'columnCountMismatch', line: getCellLine(record, extraIndex), column: extraIndex + 1 });
  }
  if (record.cells.length < cellCount && !isRelaxed) {
    throw new FoundryCsvParseError({ reason: 'columnCountMismatch', line: record.endLine, column: record.cells.length + 1 });
  }
}
