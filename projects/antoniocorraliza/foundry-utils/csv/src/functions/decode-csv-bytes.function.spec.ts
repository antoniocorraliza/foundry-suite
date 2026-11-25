import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { FoundryCsvParseError } from '../errors/foundry-csv-parse.error';
import { decodeCsvBytes } from './decode-csv-bytes.function';

const WINDOWS_1252_HIGH_CONTROLS: string = '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f' + '\u0090‘’“”•–—˜™š›œ\u009džŸ';

function createBytes(...values: Array<number>): Uint8Array {
  return new Uint8Array(values);
}

describe('decodeCsvBytes', () => {
  describe('auto', () => {
    it('reads UTF-8 after its byte order mark, and removes the mark', () => {
      expect(decodeCsvBytes(createBytes(0xef, 0xbb, 0xbf, 0x4e, 0x75, 0xc3, 0xb1, 0x65, 0x7a), 'auto')).toBe('Nuñez');
    });

    it('reads UTF-16 in the byte order of its mark, as the Unicode text of Excel', () => {
      expect(decodeCsvBytes(createBytes(0xff, 0xfe, 0x4e, 0x00, 0xf1, 0x00, 0x3b, 0x00), 'auto')).toBe('Nñ;');
      expect(decodeCsvBytes(createBytes(0xfe, 0xff, 0x00, 0x4e, 0x00, 0xf1, 0x00, 0x3b), 'auto')).toBe('Nñ;');
    });

    it.each([[[0x4e, 0x00, 0xf1, 0x00]], [[0x4e, 0x00, 0x75, 0x00]], [[0x41, 0x42, 0x00]]])(
      'rejects the zero bytes of %j without a byte order mark as invalidEncoding, without a position',
      (values) => {
        const error: FoundryCsvParseError = catchError(() => decodeCsvBytes(createBytes(...values), 'auto'), FoundryCsvParseError);
        expect([error.reason, error.line, error.column]).toEqual(['invalidEncoding', 0, 0]);
      },
    );

    it('reads valid UTF-8 without a byte order mark as UTF-8', () => {
      expect(decodeCsvBytes(createBytes(0x4e, 0x75, 0xc3, 0xb1, 0x65, 0x7a), 'auto')).toBe('Nuñez');
      expect(decodeCsvBytes(createBytes(0x61, 0x3b, 0x62), 'auto')).toBe('a;b');
    });

    it('reads Windows-1252 when the bytes are not valid UTF-8, as the CSV that Excel in Spanish saves', () => {
      expect(decodeCsvBytes(createBytes(0x4e, 0x75, 0xf1, 0x65, 0x7a), 'auto')).toBe('Nuñez');
      expect(decodeCsvBytes(createBytes(0x80, 0x31, 0x32), 'auto')).toBe('€12');
    });

    it.each([
      [[0xc0, 0xaf], 'À¯'],
      [[0xed, 0xa0, 0x80], 'í €'],
      [[0xe2, 0x82], 'â‚'],
      [[0xf4, 0x90, 0x80, 0x80], 'ô\u0090€€'],
    ])('reads %j, which strict UTF-8 rejects, as Windows-1252', (values, text) => {
      expect(decodeCsvBytes(createBytes(...values), 'auto')).toBe(text);
    });

    it('rejects bytes that are not valid UTF-8 after the UTF-8 byte order mark, with the error of the decoder as the cause', () => {
      const error: FoundryCsvParseError = catchError(
        () => decodeCsvBytes(createBytes(0xef, 0xbb, 0xbf, 0x4e, 0xf1), 'auto'),
        FoundryCsvParseError,
      );
      expect([error.reason, error.line, error.column]).toEqual(['invalidEncoding', 0, 0]);
      expect(error.cause).toBeInstanceOf(TypeError);
    });

    it.each([[[0xff, 0xfe, 0x4e, 0x00, 0xf1]], [[0xff, 0xfe, 0x00, 0xd8, 0x41, 0x00]], [[0xfe, 0xff, 0x00, 0x4e, 0x00]]])(
      'rejects %j, an odd number of bytes or a lone surrogate after a UTF-16 byte order mark',
      (values) => {
        expect(catchError(() => decodeCsvBytes(createBytes(...values), 'auto'), FoundryCsvParseError).reason).toBe('invalidEncoding');
      },
    );

    it('returns an empty text for no bytes and for a byte order mark alone', () => {
      expect(decodeCsvBytes(createBytes(), 'auto')).toBe('');
      expect(decodeCsvBytes(createBytes(0xef, 0xbb, 0xbf), 'auto')).toBe('');
      expect(decodeCsvBytes(createBytes(0xff, 0xfe), 'auto')).toBe('');
    });
  });

  describe('an explicit encoding', () => {
    it('reads the bytes 80 to 9F of Windows-1252 with the table of the encoding standard', () => {
      const bytes: Uint8Array = new Uint8Array(Array.from({ length: 32 }, (_value, index) => 0x80 + index));
      expect(decodeCsvBytes(bytes, 'windows-1252')).toBe(WINDOWS_1252_HIGH_CONTROLS);
    });

    it('uses the asked encoding without looking for zero bytes', () => {
      expect(decodeCsvBytes(createBytes(0x4e, 0x00, 0xf1, 0x00), 'utf-16le')).toBe('Nñ');
      expect(decodeCsvBytes(createBytes(0x41, 0x00, 0x42), 'windows-1252')).toBe('A\u0000B');
    });

    it('removes the byte order mark of the asked encoding, and does not interpret the mark of another one', () => {
      expect(decodeCsvBytes(createBytes(0xef, 0xbb, 0xbf, 0x41), 'utf-8')).toBe('A');
      expect(decodeCsvBytes(createBytes(0xff, 0xfe, 0x41, 0x00), 'utf-16le')).toBe('A');
      expect(decodeCsvBytes(createBytes(0xef, 0xbb, 0xbf, 0x41), 'windows-1252')).toBe('ï»¿A');
    });

    it('rejects bytes that are not valid in the asked encoding instead of writing replacement characters', () => {
      expect(catchError(() => decodeCsvBytes(createBytes(0x4e, 0x75, 0xf1, 0x65, 0x7a), 'utf-8'), FoundryCsvParseError).reason).toBe(
        'invalidEncoding',
      );
      expect(catchError(() => decodeCsvBytes(createBytes(0x4e, 0x00, 0xf1), 'utf-16le'), FoundryCsvParseError).reason).toBe(
        'invalidEncoding',
      );
    });
  });
});
