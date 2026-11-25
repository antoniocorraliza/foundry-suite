import { afterEach, describe, expect, it, vi } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { isPromiseLike } from '@foundry-test/functions/is-promise-like.function';
import { listFunctionNames } from '@foundry-test/functions/list-function-names.function';
import type { LooseFunction } from '@foundry-test/types/loose-function.type';
import * as entry from './public-api';

const SAMPLE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [
  ['createRandomCode', [6]],
  ['createTemporaryId', []],
  ['createUuidV4', []],
];

describe('public API of the random entry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual(['createRandomCode', 'createTemporaryId', 'createUuidV4']);
  });

  it('has a sample call for each export', () => {
    expect(SAMPLE_CALLS.map(([name]) => name).sort()).toEqual(listFunctionNames(entry));
  });

  it.each(SAMPLE_CALLS)('returns no promise from %s', (name, values) => {
    expect(isPromiseLike((entry[name] as LooseFunction)(...values))).toBe(false);
  });

  it('works through map with the functions without parameters, which ignore the arguments', () => {
    expect(['a', 'b'].map(entry.createUuidV4)).toHaveLength(2);
    expect(['a', 'b'].map(entry.createTemporaryId).every((id) => id < 0)).toBe(true);
  });

  it('throws a TypeError through map with createRandomCode, which takes the index as the options', () => {
    expect(catchThrown(() => [6, 8].map(entry.createRandomCode as never))).toBeInstanceOf(TypeError);
  });

  it('never calls Math.random, also when it builds a UUID without randomUUID', () => {
    const random: unknown = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('[test]: the code called Math.random');
    });
    expect(entry.createUuidV4()).toHaveLength(36);
    expect(entry.createRandomCode(6)).toHaveLength(6);
    expect(entry.createTemporaryId()).toBeLessThan(0);
    const realCrypto: Crypto = crypto;
    vi.stubGlobal('crypto', { getRandomValues: <T extends ArrayBufferView>(array: T): T => realCrypto.getRandomValues(array as never) });
    expect(entry.createUuidV4()).toHaveLength(36);
    expect(random).not.toHaveBeenCalled();
  });

  it('can be imported without crypto, which it only reads when a function is called', async () => {
    vi.resetModules();
    vi.stubGlobal('crypto', undefined);
    await expect(import('./public-api')).resolves.toBeDefined();
  });
});
