import { describe, expectTypeOf, it } from 'vitest';
import { ɵparseTextOption } from './parse-text-option.function';

describe('ɵparseTextOption', () => {
  it('returns a string when there is a text fallback or none', () => {
    expectTypeOf(ɵparseTextOption({ options: {}, name: 'suffix', fallback: '...' })).toEqualTypeOf<string>();
    expectTypeOf(ɵparseTextOption({ options: {}, name: 'locale' })).toEqualTypeOf<string>();
  });

  it('adds null to the result only when the fallback is null', () => {
    expectTypeOf(ɵparseTextOption({ options: {}, name: 'locale', fallback: null })).toEqualTypeOf<string | null>();
  });
});
