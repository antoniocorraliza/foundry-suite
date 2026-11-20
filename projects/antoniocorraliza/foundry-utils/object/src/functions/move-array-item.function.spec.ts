import { describe, expect, it } from 'vitest';
import { freezeAndSnapshot } from '../../../../../../tools/vitest/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '../../../../../../tools/vitest/interfaces/frozen-snapshot.interface';
import { moveArrayItem } from './move-array-item.function';

describe('moveArrayItem', () => {
  it('returns a new array with the item moved, without changing the input', () => {
    const input: FrozenSnapshot<Array<string>> = freezeAndSnapshot(['a', 'b', 'c']);
    const result: Array<string> = moveArrayItem(input.value, 0, 2);
    expect(result).toEqual(['b', 'c', 'a']);
    expect(result).not.toBe(input.value);
    expect(input.listChanges()).toEqual([]);
  });

  it('moves an item backwards', () => {
    expect(moveArrayItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('returns a new equal array when both indices are the same', () => {
    const input: Array<string> = ['a', 'b'];
    const result: Array<string> = moveArrayItem(input, 1, 1);
    expect(result).toEqual(['a', 'b']);
    expect(result).not.toBe(input);
  });

  it.each([
    ['a negative index', ['a'], -1, 0],
    ['an index past the end', ['a'], 0, 1],
    ['an empty array', [], 0, 0],
    ['a decimal index', ['a', 'b'], 0.5, 1],
    ['NaN', ['a', 'b'], Number.NaN, 1],
  ])('throws a RangeError with %s', (description, array, fromIndex, toIndex) => {
    expect(() => moveArrayItem(array, fromIndex, toIndex)).toThrow(RangeError);
  });
});
