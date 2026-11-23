import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryTimePrecision } from '../types/foundry-time-precision.type';
import type { TIME_PRECISIONS } from './time-precisions.constant';

describe('TIME_PRECISIONS', () => {
  it('has the same values as FoundryTimePrecision', () => {
    expectTypeOf<(typeof TIME_PRECISIONS)[number]>().toEqualTypeOf<FoundryTimePrecision>();
  });
});
