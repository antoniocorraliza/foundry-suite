import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { isPromiseLike } from '@foundry-test/functions/is-promise-like.function';
import { listFunctionNames } from '@foundry-test/functions/list-function-names.function';
import type { CallWithOptions } from '@foundry-test/types/call-with-options.type';
import type { LooseFunction } from '@foundry-test/types/loose-function.type';
import * as entry from './public-api';

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

  it('has a sample call for each export', () => {
    expect(SAMPLE_CALLS.map(([name]) => name).sort()).toEqual(listFunctionNames(entry));
  });

  it.each(SAMPLE_CALLS)('returns no promise from %s', (name, values) => {
    expect(isPromiseLike((entry[name] as LooseFunction)(...values))).toBe(false);
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
