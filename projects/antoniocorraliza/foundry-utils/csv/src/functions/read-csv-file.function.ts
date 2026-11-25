import { ɵisBlobLike, ɵisOptionsValue, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { TEXT_ENCODINGS } from '../constants/text-encodings.constant';
import type { FoundryCsvTable } from '../interfaces/foundry-csv-table.interface';
import type { FoundryCsvTableOptions } from '../interfaces/foundry-csv-table-options.interface';
import type { FoundryTextEncoding } from '../types/foundry-text-encoding.type';
import { decodeCsvBytes } from './decode-csv-bytes.function';
import { parseCsv } from './parse-csv.function';

/**
 * Reads a CSV file or Blob as `parseCsv` reads a text. Every error, an invalid argument included, comes as a rejected promise.
 * @throws {TypeError} When the file or an option are not valid, or the environment lacks `TextDecoder` or `Blob.prototype.arrayBuffer`.
 * @throws {FoundryCsvParseError} When the encoding, a quote, a header or the number of cells of a row is wrong.
 */
export async function readCsvFile(
  file: Blob,
  options?: FoundryCsvTableOptions & { readonly encoding?: FoundryTextEncoding },
): Promise<FoundryCsvTable> {
  if (!ɵisBlobLike(file)) {
    throw new TypeError(`[foundry-utils]: readCsvFile needs a Blob or a File, got ${String(file)}`);
  }
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of readCsvFile must be an object');
  const encoding: FoundryTextEncoding = ɵparseEnumOption({ options, name: 'encoding', allowedValues: TEXT_ENCODINGS, fallback: 'auto' });
  if (typeof TextDecoder !== 'function' || typeof file.arrayBuffer !== 'function') {
    throw new TypeError('[foundry-utils]: readCsvFile needs TextDecoder and Blob.prototype.arrayBuffer, which this environment lacks');
  }
  return parseCsv(decodeCsvBytes(new Uint8Array(await file.arrayBuffer()), encoding), options);
}
