import { afterEach, describe, expect, it, vi } from 'vitest';
import { FoundryCryptoUnavailableError } from '@antoniocorraliza/foundry-utils';
import { catchRejection } from '@foundry-test/functions/catch-rejection.function';
import { isPromiseLike } from '@foundry-test/functions/is-promise-like.function';
import { listFunctionNames } from '@foundry-test/functions/list-function-names.function';
import type { LooseFunction } from '@foundry-test/types/loose-function.type';
import * as entry from './public-api';

const PROMISE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [
  ['sha256', ['abc']],
  ['sha512', ['abc']],
];

describe('public API of the hash entry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual(['sha256', 'sha512']);
  });

  it('has a sample call for each export', () => {
    expect(PROMISE_CALLS.map(([name]) => name).sort()).toEqual(listFunctionNames(entry));
  });

  it.each(PROMISE_CALLS)('returns a promise from %s', async (name, values) => {
    const result: unknown = (entry[name] as LooseFunction)(...values);
    expect(isPromiseLike(result)).toBe(true);
    expect(await result).toMatch(/^[0-9a-f]+$/);
  });

  it.each(PROMISE_CALLS)('never throws through %s when called with an invalid input: it rejects with a TypeError', async (name) => {
    expect(await catchRejection(() => (entry[name] as LooseFunction)(null) as Promise<unknown>)).toBeInstanceOf(TypeError);
  });

  it.each(PROMISE_CALLS)('never throws through %s when crypto.subtle is missing: it rejects with the named error', async (name, values) => {
    vi.stubGlobal('crypto', {});
    expect(await catchRejection(() => (entry[name] as LooseFunction)(...values) as Promise<unknown>)).toBeInstanceOf(
      FoundryCryptoUnavailableError,
    );
  });

  it('works through map with a list of texts', async () => {
    expect(await Promise.all(['', 'abc'].map(entry.sha256))).toHaveLength(2);
  });

  it('can be imported without crypto, which it only reads when a function is called', async () => {
    vi.resetModules();
    vi.stubGlobal('crypto', undefined);
    await expect(import('./public-api')).resolves.toBeDefined();
  });
});
