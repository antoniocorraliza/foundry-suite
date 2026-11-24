import { describe, expectTypeOf, it } from 'vitest';
import type { normalizeUrl } from '../functions/normalize-url.function';
import type { DEFAULT_PROTOCOLS } from './default-protocols.constant';

describe('DEFAULT_PROTOCOLS', () => {
  it('has the same values as the option of normalizeUrl', () => {
    expectTypeOf<(typeof DEFAULT_PROTOCOLS)[number]>().toEqualTypeOf<
      NonNullable<NonNullable<Parameters<typeof normalizeUrl>[1]>['defaultProtocol']>
    >();
  });
});
