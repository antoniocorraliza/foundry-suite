import { afterEach, describe, expect, it, vi } from 'vitest';
import { FoundryCryptoUnavailableError } from '@antoniocorraliza/foundry-utils';
import { catchRejection } from '@foundry-test/functions/catch-rejection.function';
import * as entry from './public-api';

type LooseFunction = (...values: Array<unknown>) => unknown;

const ASYNC_FUNCTIONS: ReadonlyArray<[keyof typeof entry, LooseFunction]> = [
  ['sha256', entry.sha256 as LooseFunction],
  ['sha512', entry.sha512 as LooseFunction],
];

describe('public API of the hash entry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual(['sha256', 'sha512']);
  });

  it('checks every export, all of which return a promise', () => {
    expect(ASYNC_FUNCTIONS.map(([name]) => name).sort()).toEqual(Object.keys(entry).sort());
  });

  it.each(ASYNC_FUNCTIONS)('works through %s as a loose reference, and returns a promise', async (_name, looseFunction) => {
    const result: unknown = looseFunction.call(undefined, 'abc');
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toMatch(/^[0-9a-f]+$/);
  });

  it.each(ASYNC_FUNCTIONS)(
    'never throws through %s when called with an invalid input: it rejects with a TypeError',
    async (_name, looseFunction) => {
      expect(await catchRejection(() => looseFunction(null) as Promise<unknown>)).toBeInstanceOf(TypeError);
    },
  );

  it.each(ASYNC_FUNCTIONS)(
    'never throws through %s when crypto.subtle is missing: it rejects with the named error',
    async (_name, looseFunction) => {
      vi.stubGlobal('crypto', {});
      expect(await catchRejection(() => looseFunction('abc') as Promise<unknown>)).toBeInstanceOf(FoundryCryptoUnavailableError);
    },
  );

  it('works through map with a list of texts', async () => {
    expect(await Promise.all(['', 'abc'].map(entry.sha256))).toHaveLength(2);
  });

  it('can be imported without crypto, which it only reads when a function is called', async () => {
    vi.resetModules();
    vi.stubGlobal('crypto', undefined);
    await expect(import('./public-api')).resolves.toBeDefined();
  });
});
