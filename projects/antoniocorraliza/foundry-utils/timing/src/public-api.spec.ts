import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catchRejection } from '@foundry-test/functions/catch-rejection.function';
import { isPromiseLike } from '@foundry-test/functions/is-promise-like.function';
import { listFunctionNames } from '@foundry-test/functions/list-function-names.function';
import type { LooseFunction } from '@foundry-test/types/loose-function.type';
import type { FoundryDebouncer } from './public-api';
import * as entry from './public-api';

const SAMPLE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [['createDebouncer', [(): void => undefined, 10]]];

const PROMISE_CALLS: ReadonlyArray<[keyof typeof entry, ReadonlyArray<unknown>]> = [['sleep', [10]]];

const DEBOUNCER_METHODS: ReadonlyArray<keyof FoundryDebouncer<[]>> = ['schedule', 'cancel', 'flush', 'dispose', 'isPending'];

describe('public API of the timing entry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('exports exactly these functions', () => {
    expect(Object.keys(entry).sort()).toEqual(['createDebouncer', 'sleep']);
  });

  it('has a sample call for each export', () => {
    expect([...SAMPLE_CALLS, ...PROMISE_CALLS].map(([name]) => name).sort()).toEqual(listFunctionNames(entry));
  });

  it.each(SAMPLE_CALLS)('returns no promise from %s', (name, values) => {
    expect(isPromiseLike((entry[name] as LooseFunction)(...values))).toBe(false);
  });

  it.each(PROMISE_CALLS)('returns a promise from %s', async (name, values) => {
    const waiting: unknown = (entry[name] as LooseFunction)(...values);
    expect(isPromiseLike(waiting)).toBe(true);
    await vi.advanceTimersByTimeAsync(10);
    expect(await waiting).toBeUndefined();
  });

  it('never throws through sleep when called with invalid arguments: it returns rejected promises', async () => {
    expect(await catchRejection(() => entry.sleep(-1))).toBeInstanceOf(RangeError);
    expect(await catchRejection(() => entry.sleep(10, 5 as never))).toBeInstanceOf(TypeError);
    expect(await catchRejection(() => entry.sleep(10, { signal: {} as AbortSignal }))).toBeInstanceOf(TypeError);
  });

  it('lists every method of the debouncer', () => {
    expect([...DEBOUNCER_METHODS].sort()).toEqual(Object.keys(entry.createDebouncer(vi.fn(), 10)).sort());
  });

  it.each(DEBOUNCER_METHODS)('works through the method %s of a debouncer taken out of it and called without this', (name) => {
    const looseMethod: LooseFunction = entry.createDebouncer(vi.fn(), 10)[name] as LooseFunction;
    expect(() => looseMethod.call(undefined)).not.toThrow();
  });

  it('can be imported without timers, which it only reads when a function is called', async () => {
    vi.resetModules();
    vi.stubGlobal('setTimeout', undefined);
    await expect(import('./public-api')).resolves.toBeDefined();
    vi.unstubAllGlobals();
  });
});
