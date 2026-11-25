import type { CsvRecord } from '../interfaces/csv-record.interface';

/** Returns the physical line where a cell of a record starts, or the line where the record ends when the cell is missing. */
export function getCellLine(record: CsvRecord, index: number): number {
  return record.cellLines[index] ?? record.endLine;
}
