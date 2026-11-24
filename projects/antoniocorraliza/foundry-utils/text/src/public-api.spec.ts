import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import * as entry from './public-api';

type CallWithOptions = (options: unknown) => unknown;

type LooseFunction = (...values: Array<unknown>) => unknown;

const OPTION_USERS: ReadonlyArray<[string, CallWithOptions]> = [
  ['toTitleCase', (options) => entry.toTitleCase('hola', options as never)],
  ['truncateText', (options) => entry.truncateText('hola', 2, options as never)],
];

const SAMPLE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [
  ['capitalizeFirstLetter', ['hola']],
  ['parseBoolean', ['yes']],
  ['toSlug', ['Hola Mundo']],
  ['toTitleCase', ['hola mundo']],
  ['truncateText', ['hola mundo', 4]],
];

describe('public API of the text entry', () => {
  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual(['capitalizeFirstLetter', 'parseBoolean', 'toSlug', 'toTitleCase', 'truncateText']);
  });

  it.each(SAMPLE_CALLS)('returns no promise from %s', (name, values) => {
    const looseFunction: LooseFunction = entry[name] as LooseFunction;
    const result: unknown = looseFunction(...values);
    expect(result instanceof Promise || typeof (result as { then?: unknown } | null)?.then === 'function').toBe(false);
  });

  it.each(SAMPLE_CALLS)('works through %s as a loose reference, without this', (name, values) => {
    const looseFunction: LooseFunction = entry[name] as LooseFunction;
    expect(() => looseFunction.call(undefined, ...values)).not.toThrow();
  });

  it('works through map with the functions that take only the value', () => {
    expect(['a', 'b'].map(entry.capitalizeFirstLetter)).toEqual(['A', 'B']);
    expect(['A b', 'C'].map(entry.toSlug)).toEqual(['a-b', 'c']);
    expect(['yes', 'no'].map(entry.parseBoolean)).toEqual([true, false]);
  });

  describe.each(OPTION_USERS)('through %s', (_name, callWithOptions) => {
    it.each<unknown>([5, 'tr', true, null, [], () => ({})])('throws a TypeError for the options %j, which are not an object', (options) => {
      expect(catchThrown(() => callWithOptions(options))).toBeInstanceOf(TypeError);
    });
  });
});
