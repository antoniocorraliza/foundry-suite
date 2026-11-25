import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import type { NumberWriter } from '../interfaces/number-writer.interface';
import { writeNumber } from './write-number.function';

const WRITER: NumberWriter = { format: new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }), fallback: 'n/a' };

describe('writeNumber', () => {
  it('writes a finite number with the number format', () => {
    expect(writeNumber(1234.567, WRITER)).toBe(WRITER.format.format(1234.567));
    expect(writeNumber(0, WRITER)).toBe(WRITER.format.format(0));
    expect(writeNumber(-5, WRITER)).toBe(WRITER.format.format(-5));
  });

  it.each<unknown>([null, undefined, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'returns the fallback for %j, never a zero or an infinity sign',
    (value) => {
      expect(writeNumber(value, WRITER)).toBe('n/a');
    },
  );

  it.each<unknown>(['1.234', 'abc', '', 12n, new Number(5), {}, true, [5]])(
    'throws a TypeError for %s, which is not a number, instead of writing it as one',
    (value) => {
      const error: TypeError = catchError(() => writeNumber(value, WRITER), TypeError);
      expect(error.message).toMatch(/^\[foundry-utils\]: /u);
    },
  );
});
