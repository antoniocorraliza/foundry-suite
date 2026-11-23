import { describe, expect, it } from 'vitest';
import * as entry from './public-api';

const SAMPLES: Readonly<Record<string, ReadonlyArray<unknown>>> = {
  isPlainObject: [{ a: { b: 1 } }],
  isDeepEqual: [{ a: { b: [1] } }, { a: { b: [1] } }],
  getObjectDifferences: [{ a: { b: 1 } }, { a: { b: 2 } }],
  deepClone: [{ a: { b: [1] } }],
  removeEmptyValues: [{ a: { b: null, c: 1 } }],
  hasEmptyValue: [{ a: { b: '' } }],
  pickProperties: [{ a: { b: 1 }, c: 1 }, ['a']],
  omitProperties: [{ a: { b: 1 }, c: 1 }, ['c']],
  moveArrayItem: [[1, 2, 3], 0, 2],
};

const FUNCTION_NAMES: Array<string> = Object.entries(entry)
  .filter(([, value]) => typeof value === 'function' && !/^[A-Z]/.test(value.name))
  .map(([name]) => name);

describe('public API of the object entry', () => {
  it('exports exactly these names', () => {
    expect(Object.keys(entry).sort()).toEqual([
      'FoundryCloneError',
      'deepClone',
      'getObjectDifferences',
      'hasEmptyValue',
      'isDeepEqual',
      'isPlainObject',
      'moveArrayItem',
      'omitProperties',
      'pickProperties',
      'removeEmptyValues',
    ]);
  });

  it('has a sample call for every exported function', () => {
    expect(FUNCTION_NAMES.filter((name) => !(name in SAMPLES))).toEqual([]);
  });

  it.each(FUNCTION_NAMES)('%s gives the same result as a loose reference and inside map', (name) => {
    const loose: ((...values: ReadonlyArray<unknown>) => unknown) | undefined = (
      entry as unknown as Record<string, (...values: ReadonlyArray<unknown>) => unknown>
    )[name];
    const sample: ReadonlyArray<unknown> = SAMPLES[name] ?? [];
    const direct: unknown = loose?.(...sample);
    expect([sample].map((values) => loose?.(...values))).toEqual([direct]);
  });
});
