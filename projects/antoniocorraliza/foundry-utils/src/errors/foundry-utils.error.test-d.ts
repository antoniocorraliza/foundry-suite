import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCircularReferenceError } from './foundry-circular-reference.error';
import type { FoundryCryptoUnavailableError } from './foundry-crypto-unavailable.error';
import type { FoundryUtilsError } from './foundry-utils.error';

describe('error names', () => {
  it('declares the name of the base class as a string so subclasses can narrow it', () => {
    expectTypeOf<FoundryUtilsError['name']>().toEqualTypeOf<string>();
  });

  it('declares the name of each subclass as its literal', () => {
    expectTypeOf<FoundryCircularReferenceError['name']>().toEqualTypeOf<'FoundryCircularReferenceError'>();
    expectTypeOf<FoundryCryptoUnavailableError['name']>().toEqualTypeOf<'FoundryCryptoUnavailableError'>();
  });

  it('exposes the details as read-only properties', () => {
    expectTypeOf<FoundryCircularReferenceError['path']>().toEqualTypeOf<ReadonlyArray<string | number>>();
    expectTypeOf<FoundryCryptoUnavailableError['missingApi']>().toEqualTypeOf<'crypto' | 'crypto.getRandomValues' | 'crypto.subtle'>();
  });
});
