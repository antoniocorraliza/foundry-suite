import { describe, expectTypeOf, it } from 'vitest';
import type { getObjectDifferences } from '../functions/get-object-differences.function';
import type { ArrayMode } from './array-mode.type';

describe('ArrayMode', () => {
  it('has the same values as the arrays option of getObjectDifferences', () => {
    expectTypeOf<ArrayMode>().toEqualTypeOf<NonNullable<NonNullable<Parameters<typeof getObjectDifferences>[2]>['arrays']>>();
  });
});
