import type { FoundryCsvWriteOptions } from '../interfaces/foundry-csv-write-options.interface';

/**
 * Writes rows as a CSV text, with a line break after every line.
 * @throws {TypeError} When the rows, a column or an option are not valid, or a cell holds a value that a CSV cannot write.
 * @throws {RangeError} When a date is outside the years 1 to 9999.
 */
export function toCsv<Row extends object>(rows: ReadonlyArray<Row>, options?: FoundryCsvWriteOptions<Row>): string {
  throw new Error('[foundry-utils]: toCsv is not implemented yet');
}
