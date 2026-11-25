import { describe, expect, it } from 'vitest';
import { createSparseArray } from './create-sparse-array.function.ts';

describe('createSparseArray', () => {
  it('leaves a hole at every index without an item', () => {
    const array: Array<unknown> = createSparseArray(3, { 0: 'a', 2: undefined });
    expect([array.length, 0 in array, 1 in array, 2 in array]).toEqual([3, true, false, true]);
  });
});
