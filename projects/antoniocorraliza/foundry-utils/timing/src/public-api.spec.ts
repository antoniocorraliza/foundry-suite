import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catchRejection } from '@foundry-test/functions/catch-rejection.function';
import type { FoundryDebouncer } from './public-api';
import * as entry from './public-api';

type LooseFunction = (...values: Array<unknown>) => unknown;

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

  it('works through createDebouncer as a loose reference, and returns no promise', () => {
    const looseFunction: LooseFunction = entry.createDebouncer as LooseFunction;
    expect(looseFunction.call(undefined, vi.fn(), 10)).not.toBeInstanceOf(Promise);
  });

  it('works through sleep as a loose reference, and returns a promise', async () => {
    const looseFunction: LooseFunction = entry.sleep as LooseFunction;
    const waiting: unknown = looseFunction.call(undefined, 10);
    expect(waiting).toBeInstanceOf(Promise);
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

  it.each(DEBOUNCER_METHODS)('works through the method %s of a debouncer as a loose reference, without this', (name) => {
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
