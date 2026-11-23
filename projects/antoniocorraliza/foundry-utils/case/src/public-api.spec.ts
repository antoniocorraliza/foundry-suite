import { describe, expect, it } from 'vitest';
import * as entry from './public-api';

describe('public API of the case entry', () => {
  it('exports exactly these names', () => {
    expect(Object.keys(entry).sort()).toEqual([
      'FoundryKeyCollisionError',
      'toCamelCase',
      'toCamelCaseKeys',
      'toSnakeCase',
      'toSnakeCaseKeys',
    ]);
  });
});
