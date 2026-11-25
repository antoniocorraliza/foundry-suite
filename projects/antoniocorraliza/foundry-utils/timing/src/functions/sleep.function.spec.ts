import { getEventListeners } from 'node:events';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ɵcheckOptions } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchRejectedError } from '@foundry-test/functions/catch-rejected-error.function';
import { catchRejection } from '@foundry-test/functions/catch-rejection.function';
import { sleep } from './sleep.function';

const MAXIMUM_DELAY: number = 2_147_483_647;

async function isSettled(promise: Promise<unknown>): Promise<boolean> {
  let hasSettled: boolean = false;
  const setSettled: () => void = () => {
    hasSettled = true;
  };
  promise.then(setSettled, setSettled);
  await Promise.resolve();
  await Promise.resolve();
  return hasSettled;
}

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resolves with undefined when its timer is due, and not before', async () => {
    const waiting: Promise<void> = sleep(1000);
    await vi.advanceTimersByTimeAsync(999);
    expect(await isSettled(waiting)).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await waiting).toBeUndefined();
  });

  it.each([0, -0])('waits for a timer with %d milliseconds, not only for a microtask', async (milliseconds) => {
    const waiting: Promise<void> = sleep(milliseconds);
    expect(vi.getTimerCount()).toBe(1);
    expect(await isSettled(waiting)).toBe(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(await waiting).toBeUndefined();
  });

  it('accepts the longest delay that setTimeout keeps, 2147483647 milliseconds', async () => {
    const waiting: Promise<void> = sleep(MAXIMUM_DELAY);
    await vi.advanceTimersByTimeAsync(MAXIMUM_DELAY - 1);
    expect(await isSettled(waiting)).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await waiting).toBeUndefined();
  });

  it.each<unknown>([-1, 2 ** 31, 1.5, -0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '5', null, undefined])(
    'never throws for the milliseconds %s: it returns a promise rejected with a RangeError, without a timer',
    async (milliseconds) => {
      const rejection: RangeError = await catchRejectedError(() => sleep(milliseconds as number), RangeError);
      expect(rejection.message).toMatch(/^\[foundry-utils\]: /);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it('never throws for options that are not an object: it returns a promise rejected with the TypeError of checkOptions', async () => {
    expect((await catchRejectedError(() => sleep(10, 'signal' as never), TypeError)).message).toBe(
      catchError(() => ɵcheckOptions('signal', 'sleep'), TypeError).message,
    );
  });

  it.each<[string, unknown]>([
    ['an empty object', {}],
    ['true', true],
    ['a text', 'signal'],
    ['an object that looks like an aborted signal', { aborted: true, reason: 'x', addEventListener: vi.fn() }],
    ['an EventTarget', new EventTarget()],
    ['an AbortController', new AbortController()],
  ])(
    'never throws for a signal that is %s: it returns a promise rejected with a TypeError that names the option',
    async (_description, signal) => {
      const rejection: TypeError = await catchRejectedError(() => sleep(10, { signal: signal as AbortSignal }), TypeError);
      expect(rejection.message).toMatch(/^\[foundry-utils\]: .*signal/);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it.each<[string, unknown]>([
    ['without a signal', {}],
    ['with an undefined signal', { signal: undefined }],
    ['with a null signal', { signal: null }],
    ['with options it does not know', { delay: 5 }],
  ])('waits as usual %s', async (_description, options) => {
    const waiting: Promise<void> = sleep(10, options as never);
    await vi.advanceTimersByTimeAsync(10);
    expect(await waiting).toBeUndefined();
  });

  it('reads the signal only as an own data property, without running a getter', async () => {
    const controller: AbortController = new AbortController();
    controller.abort('stopped');
    const getter: () => unknown = vi.fn(() => controller.signal);
    const withGetter: object = Object.defineProperty({}, 'signal', { get: getter, enumerable: true });
    const inherited: object = Object.create({ signal: controller.signal }) as object;
    const waiting: Promise<Array<void>> = Promise.all([sleep(10, withGetter), sleep(10, inherited)]);
    await vi.advanceTimersByTimeAsync(10);
    expect(await waiting).toEqual([undefined, undefined]);
    expect(getter).not.toHaveBeenCalled();
  });

  it.each<[string, unknown]>([
    ['an error', new Error('[test]: stopped')],
    ['a text', 'stopped'],
    ['a TimeoutError like the one of AbortSignal.timeout', new DOMException('signal timed out', 'TimeoutError')],
  ])('rejects at once with the reason of a signal already aborted with %s, without a timer or a listener', async (_description, reason) => {
    const controller: AbortController = new AbortController();
    controller.abort(reason);
    const addEventListener: unknown = vi.spyOn(controller.signal, 'addEventListener');
    expect(await catchRejection(() => sleep(1000, { signal: controller.signal }))).toBe(reason);
    expect(vi.getTimerCount()).toBe(0);
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('rejects with the AbortError of a signal aborted without a reason', async () => {
    const controller: AbortController = new AbortController();
    controller.abort();
    const rejection: unknown = await catchRejection(() => sleep(1000, { signal: controller.signal }));
    expect(rejection).toBe(controller.signal.reason);
    expect((rejection as DOMException).name).toBe('AbortError');
  });

  it('cancels its timer and rejects with the reason when the signal aborts while it waits', async () => {
    const controller: AbortController = new AbortController();
    const reason: DOMException = new DOMException('signal timed out', 'TimeoutError');
    const waiting: Promise<void> = sleep(1000, { signal: controller.signal });
    const expectation: Promise<void> = expect(waiting).rejects.toBe(reason);
    await vi.advanceTimersByTimeAsync(500);
    controller.abort(reason);
    await expectation;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('removes its abort listener when it resolves', async () => {
    const controller: AbortController = new AbortController();
    const addEventListener: MockInstance<AbortSignal['addEventListener']> = vi.spyOn(controller.signal, 'addEventListener');
    const removeEventListener: MockInstance<AbortSignal['removeEventListener']> = vi.spyOn(controller.signal, 'removeEventListener');
    const waiting: Promise<void> = sleep(10, { signal: controller.signal });
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(10);
    await waiting;
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0);
    expect(removeEventListener).toHaveBeenCalledWith('abort', addEventListener.mock.calls[0]?.[1]);
  });

  it('removes its abort listener when it rejects', async () => {
    const controller: AbortController = new AbortController();
    const waiting: Promise<void> = sleep(1000, { signal: controller.signal });
    const expectation: Promise<void> = expect(waiting).rejects.toBe('stopped');
    controller.abort('stopped');
    await expectation;
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0);
  });

  it('does nothing when the signal aborts after it resolved', async () => {
    const controller: AbortController = new AbortController();
    const waiting: Promise<void> = sleep(10, { signal: controller.signal });
    await vi.advanceTimersByTimeAsync(10);
    await waiting;
    controller.abort('too late');
    await vi.advanceTimersByTimeAsync(10);
    expect(await waiting).toBeUndefined();
  });

  it('keeps one listener per call on a long-lived signal only while each call waits', async () => {
    const controller: AbortController = new AbortController();
    const waits: Array<Promise<void>> = [sleep(10, { signal: controller.signal }), sleep(20, { signal: controller.signal })];
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(20);
    await Promise.all(waits);
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0);
  });
});

describe('sleep with a real AbortSignal.timeout', () => {
  it('rejects with the TimeoutError of the engine', async () => {
    const signal: AbortSignal = AbortSignal.timeout(1);
    const rejection: unknown = await catchRejection(() => sleep(2000, { signal }));
    expect(rejection).toBe(signal.reason);
    expect((rejection as DOMException).name).toBe('TimeoutError');
  });
});
