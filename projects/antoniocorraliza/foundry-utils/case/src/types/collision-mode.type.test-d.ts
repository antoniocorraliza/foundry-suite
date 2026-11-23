import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryKeyConversionOptions } from '../interfaces/foundry-key-conversion-options.interface';
import type { CollisionMode } from './collision-mode.type';

describe('CollisionMode', () => {
  it('has the same values as the onCollision option', () => {
    expectTypeOf<CollisionMode>().toEqualTypeOf<NonNullable<FoundryKeyConversionOptions['onCollision']>>();
  });
});
