import { describe, expect, it } from 'vitest';
import { createArrayWithGetter } from './create-array-with-getter.function.ts';

describe('createArrayWithGetter', () => {
  it('keeps the other items and puts at the index an enumerable getter that throws', () => {
    const array: Array<unknown> = createArrayWithGetter([1, 2], 0);
    expect([array.length, array[1], Object.getOwnPropertyDescriptor(array, 0)?.enumerable]).toEqual([2, 2, true]);
    expect(() => array[0]).toThrow('[test]: the getter ran');
  });
});
