import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import type { TIME_ZONE_MODES } from './time-zone-modes.constant';

describe('TIME_ZONE_MODES', () => {
  it('has the same values as FoundryTimeZoneMode', () => {
    expectTypeOf<(typeof TIME_ZONE_MODES)[number]>().toEqualTypeOf<FoundryTimeZoneMode>();
  });
});
