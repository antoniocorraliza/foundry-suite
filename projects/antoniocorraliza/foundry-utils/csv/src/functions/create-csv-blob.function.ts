import type { FoundryCsvWriteOptions } from '../interfaces/foundry-csv-write-options.interface';

/**
 * Writes rows as a CSV file in UTF-8, with a byte order mark unless `byteOrderMark` is `false`, of type `text/csv;charset=utf-8`.
 * @throws {TypeError} When the rows, a column or an option are not valid, or a cell holds a value that a CSV cannot write.
 * @throws {RangeError} When a date is outside the years 1 to 9999.
 */
export function createCsvBlob<Row extends object>(
  rows: ReadonlyArray<Row>,
  options?: FoundryCsvWriteOptions<Row> & { readonly byteOrderMark?: boolean },
): Blob {
  throw new Error('[foundry-utils]: createCsvBlob is not implemented yet');
}
