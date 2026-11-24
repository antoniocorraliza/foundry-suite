import { describe, expectTypeOf, it } from 'vitest';
import { ɵparseIntegerOption } from './parse-integer-option.function';

describe('ɵparseIntegerOption', () => {
  it('returns a number when there is a numeric fallback or none', () => {
    expectTypeOf(ɵparseIntegerOption({ options: {}, name: 'weeks', minimum: 1, fallback: 1 })).toEqualTypeOf<number>();
    expectTypeOf(ɵparseIntegerOption({ options: {}, name: 'weeks', minimum: 1 })).toEqualTypeOf<number>();
  });

  it('adds null to the result only when the fallback is null', () => {
    expectTypeOf(ɵparseIntegerOption({ options: {}, name: 'digits', minimum: 0, fallback: null })).toEqualTypeOf<number | null>();
  });
});
