import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryTextEncoding } from '../types/foundry-text-encoding.type';
import type { TEXT_ENCODINGS } from './text-encodings.constant';

describe('TEXT_ENCODINGS', () => {
  it('has the same values as the public type', () => {
    expectTypeOf<(typeof TEXT_ENCODINGS)[number]>().toEqualTypeOf<FoundryTextEncoding>();
  });
});
