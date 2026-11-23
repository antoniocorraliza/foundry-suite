import { describe, expectTypeOf, it } from 'vitest';
import type { formatTime } from '../functions/format-time.function';
import type { CLOCK_PRECISIONS } from './clock-precisions.constant';

describe('CLOCK_PRECISIONS', () => {
  it('has the same values as the precision option of formatTime', () => {
    expectTypeOf<(typeof CLOCK_PRECISIONS)[number]>().toEqualTypeOf<
      NonNullable<NonNullable<Parameters<typeof formatTime>[1]>['precision']>
    >();
  });
});
