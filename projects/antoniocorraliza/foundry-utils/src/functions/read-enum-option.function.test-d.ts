import { describe, expectTypeOf, it } from 'vitest';
import { ɵreadEnumOption } from './read-enum-option.function';

const COUNTRIES: ReadonlyArray<'ES' | 'PT'> = ['ES', 'PT'];

describe('ɵreadEnumOption', () => {
  it('adds null to the result only when the fallback is null', () => {
    expectTypeOf(() => ɵreadEnumOption({ options: 5, name: 'country', allowedValues: COUNTRIES, fallback: 'ES' })).returns.toEqualTypeOf<
      'ES' | 'PT'
    >();
    expectTypeOf(() => ɵreadEnumOption({ options: 5, name: 'country', allowedValues: COUNTRIES, fallback: null })).returns.toEqualTypeOf<
      'ES' | 'PT' | null
    >();
  });
});
