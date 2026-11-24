import { describe, expectTypeOf, it } from 'vitest';
import type { isDniOrNie } from '../functions/is-dni-or-nie.function';
import type { IDENTITY_DOCUMENT_KINDS } from './identity-document-kinds.constant';

describe('IDENTITY_DOCUMENT_KINDS', () => {
  it('has the same values as the option of isDniOrNie', () => {
    expectTypeOf<(typeof IDENTITY_DOCUMENT_KINDS)[number]>().toEqualTypeOf<
      NonNullable<NonNullable<Parameters<typeof isDniOrNie>[1]>['accept']>[number]
    >();
  });
});
