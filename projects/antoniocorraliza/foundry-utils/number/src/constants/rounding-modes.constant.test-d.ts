import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryRoundingMode } from '../types/foundry-rounding-mode.type';
import type { ROUNDING_MODES } from './rounding-modes.constant';

describe('ROUNDING_MODES', () => {
  it('has the same values as the public type', () => {
    expectTypeOf<(typeof ROUNDING_MODES)[number]>().toEqualTypeOf<FoundryRoundingMode>();
  });
});
