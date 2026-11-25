import { describe, expect, it } from 'vitest';
import { createArrayWithGetter } from '@foundry-test/functions/create-array-with-getter.function';
import { createSparseArray } from '@foundry-test/functions/create-sparse-array.function';
import { ɵcopyArrayItems } from './copy-array-items.function';

describe('ɵcopyArrayItems', () => {
  it('copies the items into a new array and keeps the length and the holes', () => {
    const array: Array<unknown> = createSparseArray(3, { 0: 1, 2: 3 });
    const items: Array<unknown> = ɵcopyArrayItems(array);
    expect(items).not.toBe(array);
    expect([items.length, items[0], 1 in items, items[2]]).toEqual([3, 1, false, 3]);
  });

  it('copies an index with a getter as a hole, without running the getter, and leaves out the other properties', () => {
    const array: Array<unknown> = Object.assign(createArrayWithGetter([1, 2, 3], 1), { extra: 'x' });
    const items: Array<unknown> = ɵcopyArrayItems(array);
    expect([items.length, items[0], 1 in items, items[2]]).toEqual([3, 1, false, 3]);
    expect(Object.keys(items)).toEqual(['0', '2']);
  });
});
