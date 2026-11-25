import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import * as entry from './public-api';

type LooseFunction = (...values: Array<unknown>) => unknown;

describe('public API of the form-data entry', () => {
  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual(['createFormData']);
  });

  it('works through createFormData as a loose reference, without this, and returns no promise', () => {
    const looseFunction: LooseFunction = entry.createFormData as LooseFunction;
    let result: unknown = null;
    expect(() => {
      result = looseFunction.call(undefined, { a: 'x' });
    }).not.toThrow();
    expect(result).not.toBeInstanceOf(Promise);
  });

  it('throws a TypeError through map, which passes the index as the options', () => {
    expect(catchThrown(() => [{ a: 'x' }].map(entry.createFormData as never))).toBeInstanceOf(TypeError);
  });
});
