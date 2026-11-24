import { describe, expectTypeOf, it } from 'vitest';
import { ɵparseEnumOption } from './parse-enum-option.function';

const MODES: ReadonlyArray<'up' | 'down'> = ['up', 'down'];

describe('ɵparseEnumOption', () => {
  it('returns a value of the list when there is a fallback of the list or none', () => {
    expectTypeOf(() => ɵparseEnumOption({ options: {}, name: 'mode', allowedValues: MODES, fallback: 'up' })).returns.toEqualTypeOf<
      'up' | 'down'
    >();
    expectTypeOf(() => ɵparseEnumOption({ options: {}, name: 'mode', allowedValues: MODES })).returns.toEqualTypeOf<'up' | 'down'>();
  });

  it('adds null to the result only when the fallback is null', () => {
    expectTypeOf(() => ɵparseEnumOption({ options: {}, name: 'mode', allowedValues: MODES, fallback: null })).returns.toEqualTypeOf<
      'up' | 'down' | null
    >();
  });

  it('rejects a fallback that is not in the list', () => {
    // @ts-expect-error the fallback must be one of the allowed values
    ɵparseEnumOption({ options: {}, name: 'mode', allowedValues: MODES, fallback: 'sideways' });
  });
});
