import { describe, expect, it } from 'vitest';
import * as entry from './public-api';

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
});
