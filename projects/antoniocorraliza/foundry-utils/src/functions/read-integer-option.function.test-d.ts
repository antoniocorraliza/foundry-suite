import { describe, expectTypeOf, it } from 'vitest';
import { ɵreadIntegerOption } from './read-integer-option.function';

describe('ɵreadIntegerOption', () => {
  it('adds null to the result only when the fallback is null', () => {
    expectTypeOf(ɵreadIntegerOption({ options: 5, name: 'minimumLength', minimum: 1, fallback: 8 })).toEqualTypeOf<number>();
    expectTypeOf(ɵreadIntegerOption({ options: 5, name: 'version', minimum: 1, maximum: 8, fallback: null })).toEqualTypeOf<
      number | null
    >();
  });
});
