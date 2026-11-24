import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import type { CsvDecoderEncoding } from '../types/csv-decoder-encoding.type';
import type { FoundryTextEncoding } from '../types/foundry-text-encoding.type';

function hasPrefix(bytes: Uint8Array, prefix: ReadonlyArray<number>): boolean {
  return prefix.every((value, index) => bytes[index] === value);
}

function decodeStrictly(bytes: Uint8Array, encoding: CsvDecoderEncoding): string {
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(bytes);
  } catch (error) {
    throw new FoundryCsvParseError({ reason: 'invalidEncoding', line: 0, column: 0 }, { cause: error });
  }
}

function decodeUnmarkedBytes(bytes: Uint8Array): string {
  if (bytes.includes(0)) throw new FoundryCsvParseError({ reason: 'invalidEncoding', line: 0, column: 0 });
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

/**
 * Turns the bytes of a CSV file into text, choosing the encoding from its first bytes with `'auto'`.
 * @throws {FoundryCsvParseError} When the bytes are not valid in the chosen encoding, or have zero bytes without a byte order mark.
 */
export function decodeCsvBytes(bytes: Uint8Array, encoding: FoundryTextEncoding): string {
  if (encoding !== 'auto') return decodeStrictly(bytes, encoding);
  if (hasPrefix(bytes, [0xef, 0xbb, 0xbf])) return decodeStrictly(bytes, 'utf-8');
  if (hasPrefix(bytes, [0xff, 0xfe])) return decodeStrictly(bytes, 'utf-16le');
  if (hasPrefix(bytes, [0xfe, 0xff])) return decodeStrictly(bytes, 'utf-16be');
  return decodeUnmarkedBytes(bytes);
}
