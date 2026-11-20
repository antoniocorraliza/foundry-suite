import { describe, expect, it } from 'vitest';
import type { FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import { freezeAndSnapshot } from '../../../../../../tools/vitest/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '../../../../../../tools/vitest/interfaces/frozen-snapshot.interface';
import type { FoundryDeepEqualOptions } from '../interfaces/foundry-deep-equal-options.interface';
import type { FoundryObjectDifference } from '../interfaces/foundry-object-difference.interface';
import { getObjectDifferences } from './get-object-differences.function';

class Point {
  constructor(readonly x: number) {}
}

describe('getObjectDifferences', () => {
  it('returns an empty list for equal values', () => {
    expect(getObjectDifferences({ a: { b: [1] } }, { a: { b: [1] } })).toEqual([]);
  });

  it('reports added, removed and changed keys with their values', () => {
    expect(getObjectDifferences({ kept: 1, changed: 1, removed: 1 }, { kept: 1, changed: 2, added: 1 })).toEqual([
      { path: ['changed'], kind: 'changed', previous: 1, current: 2 },
      { path: ['removed'], kind: 'removed', previous: 1, current: undefined },
      { path: ['added'], kind: 'added', previous: undefined, current: 1 },
    ]);
  });

  it('counts a key with an undefined value as present', () => {
    expect(getObjectDifferences({ a: undefined }, {})).toEqual([{ path: ['a'], kind: 'removed', previous: undefined, current: undefined }]);
  });

  it('enters plain objects and reports the full path', () => {
    expect(getObjectDifferences({ customer: { name: 'Ana' } }, { customer: { name: 'Eva' } })).toEqual([
      { path: ['customer', 'name'], kind: 'changed', previous: 'Ana', current: 'Eva' },
    ]);
  });

  it('reports one change for two different dates', () => {
    const previous: Date = new Date(2026, 0, 1);
    const current: Date = new Date(2027, 5, 30);
    expect(getObjectDifferences({ due: previous }, { due: current })).toEqual([{ path: ['due'], kind: 'changed', previous, current }]);
  });

  it('treats maps, sets, files and class instances as leaves', () => {
    const differences: ReadonlyArray<FoundryObjectDifference> = getObjectDifferences(
      { map: new Map([['k', 1]]), point: new Point(1), file: new File(['x'], 'a.txt') },
      { map: new Map([['k', 2]]), point: new Point(1), file: new File(['x'], 'a.txt') },
    );
    expect(differences.map((difference) => difference.path)).toEqual([['map'], ['point'], ['file']]);
  });

  it('reports a plain object replaced by another kind of value as one change', () => {
    expect(getObjectDifferences({ a: { b: 1 } }, { a: new Date(0) }).map((difference) => difference.path)).toEqual([['a']]);
  });

  it('compares arrays as a whole by default', () => {
    expect(getObjectDifferences({ list: [1, 2] }, { list: [1, 3, 4] })).toEqual([
      { path: ['list'], kind: 'changed', previous: [1, 2], current: [1, 3, 4] },
    ]);
    expect(getObjectDifferences({ list: [{ a: 1 }] }, { list: [{ a: 1 }] })).toEqual([]);
  });

  it('enters arrays by index when asked', () => {
    expect(getObjectDifferences({ list: [1, 2, 9] }, { list: [1, 3] }, { arrays: 'byIndex' })).toEqual([
      { path: ['list', 1], kind: 'changed', previous: 2, current: 3 },
      { path: ['list', 2], kind: 'removed', previous: 9, current: undefined },
    ]);
    expect(getObjectDifferences({ list: [1] }, { list: [1, 2] }, { arrays: 'byIndex' })).toEqual([
      { path: ['list', 1], kind: 'added', previous: undefined, current: 2 },
    ]);
  });

  it('reports different roots that are not two plain objects as one change at the empty path', () => {
    expect(getObjectDifferences(1, 2)).toEqual([{ path: [], kind: 'changed', previous: 1, current: 2 }]);
    expect(getObjectDifferences([1], [2])).toEqual([{ path: [], kind: 'changed', previous: [1], current: [2] }]);
    expect(getObjectDifferences(null, { a: 1 })).toEqual([{ path: [], kind: 'changed', previous: null, current: { a: 1 } }]);
    expect(getObjectDifferences('x', 'x')).toEqual([]);
  });

  it('lists the differences in depth first, keys of previous first and then the new keys of current', () => {
    const paths: Array<FoundryObjectPath> = getObjectDifferences({ b: { y: 1, x: 1 }, a: 1 }, { a: 2, b: { x: 2, y: 2 }, c: 1 }).map(
      (difference) => difference.path,
    );
    expect(paths).toEqual([['b', 'y'], ['b', 'x'], ['a'], ['c']]);
  });

  it('ignores symbol keys, accessors and non-enumerable properties', () => {
    const current: Record<string | symbol, unknown> = { a: 1, [Symbol('s')]: 2 };
    Object.defineProperty(current, 'hidden', { value: 1, enumerable: false });
    expect(getObjectDifferences({ a: 1 }, current)).toEqual([]);
  });

  it('reports a __proto__ key as one more property', () => {
    expect(getObjectDifferences({}, JSON.parse('{"__proto__":{"isAdmin":true}}')).map((difference) => difference.path)).toEqual([
      ['__proto__'],
    ]);
  });

  it('supports cycles', () => {
    const previous: { self?: unknown; value: number } = { value: 1 };
    const current: { self?: unknown; value: number } = { value: 2 };
    previous.self = previous;
    current.self = current;
    expect(getObjectDifferences(previous, current).map((difference) => difference.path)).toContainEqual(['value']);
  });

  it('follows customEquality: true hides the path, false reports it without entering, undefined keeps the rule', () => {
    const options: FoundryDeepEqualOptions = {
      customEquality: (first: unknown, second: unknown): boolean | undefined => {
        if (first instanceof Point && second instanceof Point) return first.x === second.x;
        if (typeof first === 'object' && first !== null && 'locked' in first) return false;
        return undefined;
      },
    };
    expect(getObjectDifferences({ point: new Point(1) }, { point: new Point(1) }, options)).toEqual([]);
    expect(
      getObjectDifferences({ box: { locked: 1, a: 1 } }, { box: { locked: 1, a: 1 } }, options).map((difference) => difference.path),
    ).toEqual([['box']]);
  });

  it('builds the payload of the documented recipe: complete first-level values and null for removed keys', () => {
    const original: Record<string, unknown> = { title: 'A', dueDate: '2027-01-01', customer: { name: 'Ana', id: 1 }, notes: 'x' };
    const current: Record<string, unknown> = { title: 'A', dueDate: '2027-06-30', customer: { name: 'Eva', id: 1 } };
    const changedKeys: Set<string | number | undefined> = new Set(getObjectDifferences(original, current).map((change) => change.path[0]));
    const payload: Record<string, unknown> = Object.fromEntries([...changedKeys].map((key) => [key, current[String(key)] ?? null]));
    expect(payload).toEqual({ dueDate: '2027-06-30', customer: { name: 'Eva', id: 1 }, notes: null });
  });

  it('does not change its inputs', () => {
    const previous: FrozenSnapshot<object> = freezeAndSnapshot({ due: new Date(2026, 0, 1), list: [1] });
    const current: FrozenSnapshot<object> = freezeAndSnapshot({ due: new Date(2026, 0, 2), list: [2] });
    getObjectDifferences(previous.value, current.value, { arrays: 'byIndex' });
    expect([...previous.changes(), ...current.changes()]).toEqual([]);
  });

  it('rejects options that are not an object and unknown array modes', () => {
    expect(() => getObjectDifferences({}, {}, 5 as never)).toThrow(TypeError);
    expect(() => getObjectDifferences({}, {}, { arrays: 'deep' } as never)).toThrow(TypeError);
  });
});
