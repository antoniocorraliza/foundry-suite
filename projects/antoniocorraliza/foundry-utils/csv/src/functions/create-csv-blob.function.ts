import { ɵcheckOptions, ɵparseBooleanOption } from '@antoniocorraliza/foundry-utils';
import { BYTE_ORDER_MARK } from '../constants/byte-order-mark.constant';
import type { FoundryCsvWriteOptions } from '../interfaces/foundry-csv-write-options.interface';
import { toCsv } from './to-csv.function';

/**
 * Writes rows as a CSV file in UTF-8, with a byte order mark unless `byteOrderMark` is `false`, of type `text/csv;charset=utf-8`.
 * @throws {TypeError} When the rows, a column or an option are not valid, or a cell holds a value that a CSV cannot write.
 * @throws {RangeError} When a date is outside the years 1 to 9999.
 */
export function createCsvBlob<Row extends object>(
  rows: ReadonlyArray<Row>,
  options?: FoundryCsvWriteOptions<Row> & { readonly byteOrderMark?: boolean },
): Blob {
  ɵcheckOptions(options, 'createCsvBlob');
  const text: string = toCsv(rows, options);
  const hasByteOrderMark: boolean = ɵparseBooleanOption({ options, name: 'byteOrderMark', fallback: true });
  return new Blob([hasByteOrderMark ? `${BYTE_ORDER_MARK}${text}` : text], { type: 'text/csv;charset=utf-8' });
}
