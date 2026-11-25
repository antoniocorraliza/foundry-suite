import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import type { FoundryDebouncer } from '../interfaces/foundry-debouncer.interface';
import { createDebouncer } from './create-debouncer.function';

describe('createDebouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('schedule', () => {
    it('runs the callback once, the wait after the last schedule, with the last arguments', () => {
      const callback: Mock<(value: string, count?: number) => void> = vi.fn();
      const debouncer: FoundryDebouncer<[string, number?]> = createDebouncer(callback, 500);
      debouncer.schedule('first');
      vi.advanceTimersByTime(400);
      debouncer.schedule('second', 2);
      vi.advanceTimersByTime(100);
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(399);
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(callback.mock.calls).toEqual([['second', 2]]);
    });

    it('keeps a single timer, however many times it is scheduled', () => {
      const debouncer: FoundryDebouncer<[]> = createDebouncer(vi.fn(), 500);
      debouncer.schedule();
      debouncer.schedule();
      debouncer.schedule();
      expect(vi.getTimerCount()).toBe(1);
    });

    it('passes the arguments as they were given: the same references and the same number', () => {
      const callback: Mock<(...values: Array<unknown>) => void> = vi.fn();
      const draft: { subject: string } = { subject: 'Hola' };
      createDebouncer(callback, 10).schedule(draft, undefined);
      vi.advanceTimersByTime(10);
      expect(callback.mock.calls[0]).toHaveLength(2);
      expect(callback.mock.calls[0]?.[0]).toBe(draft);
    });

    it('keeps the arguments by reference, so a later change reaches the callback', () => {
      const callback: Mock<(draft: { subject: string }) => void> = vi.fn();
      const draft: { subject: string } = { subject: 'Hola' };
      createDebouncer(callback, 10).schedule(draft);
      draft.subject = 'Adios';
      vi.advanceTimersByTime(10);
      expect(callback).toHaveBeenCalledWith({ subject: 'Adios' });
    });

    it('calls the callback without arguments when it is scheduled without them', () => {
      const callback: Mock<() => void> = vi.fn();
      createDebouncer(callback, 10).schedule();
      vi.advanceTimersByTime(10);
      expect(callback.mock.calls).toEqual([[]]);
    });

    it('calls the callback as a function, with this undefined', () => {
      const receivers: Array<unknown> = [];
      createDebouncer(function (this: unknown): void {
        receivers.push(this);
      }, 10).schedule();
      vi.advanceTimersByTime(10);
      expect(receivers).toEqual([undefined]);
    });

    it('schedules a new call when it is scheduled inside the callback', () => {
      const callback: Mock<(value: number) => void> = vi.fn((value: number) => {
        if (value === 1) debouncer.schedule(2);
      });
      const debouncer: FoundryDebouncer<[number]> = createDebouncer(callback, 10);
      debouncer.schedule(1);
      debouncer.flush();
      expect(debouncer.isPending()).toBe(true);
      vi.advanceTimersByTime(10);
      expect(callback.mock.calls).toEqual([[1], [2]]);
    });

    it('lets the error of the callback reach the global handler when the timer runs it, after it stops being pending', () => {
      const error: Error = new Error('[test]: save failed');
      const pendingStates: Array<boolean> = [];
      const debouncer: FoundryDebouncer<[]> = createDebouncer(() => {
        pendingStates.push(debouncer.isPending());
        throw error;
      }, 500);
      debouncer.schedule();
      expect(() => vi.advanceTimersByTime(500)).toThrow(error);
      expect(pendingStates).toEqual([false]);
      expect(debouncer.isPending()).toBe(false);
    });
  });

  describe('cancel', () => {
    it('discards the pending call, which can be scheduled again', () => {
      const callback: Mock<(value: number) => void> = vi.fn();
      const debouncer: FoundryDebouncer<[number]> = createDebouncer(callback, 10);
      debouncer.schedule(1);
      debouncer.cancel();
      expect(debouncer.isPending()).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
      vi.advanceTimersByTime(10);
      expect(callback).not.toHaveBeenCalled();
      debouncer.schedule(2);
      vi.advanceTimersByTime(10);
      expect(callback.mock.calls).toEqual([[2]]);
    });

    it('does nothing without a pending call', () => {
      const debouncer: FoundryDebouncer<[]> = createDebouncer(vi.fn(), 10);
      expect(() => debouncer.cancel()).not.toThrow();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('flush', () => {
    it('runs the pending call now, with the last arguments, after it stops being pending', () => {
      const pendingStates: Array<boolean> = [];
      const callback: Mock<(value: number) => void> = vi.fn(() => {
        pendingStates.push(debouncer.isPending());
      });
      const debouncer: FoundryDebouncer<[number]> = createDebouncer(callback, 500);
      debouncer.schedule(1);
      debouncer.schedule(2);
      debouncer.flush();
      expect(callback.mock.calls).toEqual([[2]]);
      expect(pendingStates).toEqual([false]);
      expect(vi.getTimerCount()).toBe(0);
      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('lets the error of the callback out, and runs it only once', () => {
      const error: Error = new Error('[test]: save failed');
      const callback: Mock<(value: number) => void> = vi.fn<(value: number) => void>().mockImplementationOnce(() => {
        throw error;
      });
      const debouncer: FoundryDebouncer<[number]> = createDebouncer(callback, 500);
      debouncer.schedule(1);
      expect(() => debouncer.flush()).toThrow(error);
      expect(debouncer.isPending()).toBe(false);
      debouncer.flush();
      vi.advanceTimersByTime(500);
      expect(callback.mock.calls).toEqual([[1]]);
      debouncer.schedule(2);
      vi.advanceTimersByTime(500);
      expect(callback.mock.calls).toEqual([[1], [2]]);
    });

    it('does nothing and returns undefined without a pending call', () => {
      const callback: Mock<() => void> = vi.fn();
      expect(createDebouncer(callback, 10).flush()).toBeUndefined();
      expect(callback).not.toHaveBeenCalled();
    });

    it('does nothing inside the callback, where the call is no longer pending', () => {
      const callback: Mock<() => void> = vi.fn(() => debouncer.flush());
      const debouncer: FoundryDebouncer<[]> = createDebouncer(callback, 10);
      debouncer.schedule();
      debouncer.flush();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('ignores what the callback returns and does not wait for an asynchronous callback', () => {
      const finished: Array<string> = [];
      const debouncer: FoundryDebouncer<[]> = createDebouncer(async () => {
        await Promise.resolve();
        finished.push('saved');
      }, 10);
      debouncer.schedule();
      expect(debouncer.flush()).toBeUndefined();
      expect(finished).toEqual([]);
    });
  });

  describe('dispose', () => {
    it('discards the pending call and turns every later schedule into nothing, without a timer', () => {
      const callback: Mock<(value: number) => void> = vi.fn();
      const debouncer: FoundryDebouncer<[number]> = createDebouncer(callback, 10);
      debouncer.schedule(1);
      debouncer.dispose();
      expect(vi.getTimerCount()).toBe(0);
      debouncer.schedule(2);
      expect(vi.getTimerCount()).toBe(0);
      expect(debouncer.isPending()).toBe(false);
      vi.advanceTimersByTime(10);
      expect(callback).not.toHaveBeenCalled();
    });

    it('can be called twice, and leaves flush, cancel and isPending working', () => {
      const callback: Mock<() => void> = vi.fn();
      const debouncer: FoundryDebouncer<[]> = createDebouncer(callback, 10);
      debouncer.dispose();
      expect(() => debouncer.dispose()).not.toThrow();
      expect(debouncer.flush()).toBeUndefined();
      expect(() => debouncer.cancel()).not.toThrow();
      expect(debouncer.isPending()).toBe(false);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('isPending', () => {
    it('tells the current state, also when it was taken out of the debouncer before scheduling', () => {
      const { schedule, isPending } = createDebouncer(vi.fn(), 10);
      expect(isPending()).toBe(false);
      schedule();
      expect(isPending()).toBe(true);
      vi.advanceTimersByTime(10);
      expect(isPending()).toBe(false);
    });
  });

  describe('the debouncer', () => {
    it('is a new object with Object.prototype, not frozen, with the five methods', () => {
      const debouncer: FoundryDebouncer<[]> = createDebouncer(vi.fn(), 10);
      expect(Object.getPrototypeOf(debouncer)).toBe(Object.prototype);
      expect(Object.isFrozen(debouncer)).toBe(false);
      expect(Object.keys(debouncer).sort()).toEqual(['cancel', 'dispose', 'flush', 'isPending', 'schedule']);
      expect(Object.values(debouncer).every((method) => typeof method === 'function')).toBe(true);
      expect(createDebouncer(vi.fn(), 10)).not.toBe(debouncer);
    });

    it('works through methods taken out of it, or called with another this', () => {
      const callback: Mock<(value: number) => void> = vi.fn();
      const debouncer: FoundryDebouncer<[number]> = createDebouncer(callback, 10);
      const { schedule, flush } = debouncer;
      schedule(1);
      flush();
      debouncer.schedule.call({}, 2);
      debouncer.flush.call(null);
      expect(callback.mock.calls).toEqual([[1], [2]]);
    });

    it('works as an event listener', () => {
      const callback: Mock<(event: Event) => void> = vi.fn();
      const debouncer: FoundryDebouncer<[Event]> = createDebouncer(callback, 300);
      const input: EventTarget = new EventTarget();
      const event: Event = new Event('input');
      input.addEventListener('input', debouncer.schedule);
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(event);
      vi.advanceTimersByTime(300);
      expect(callback.mock.calls).toEqual([[event]]);
    });

    it('has its own timer: two debouncers run both', () => {
      const first: Mock<() => void> = vi.fn();
      const second: Mock<() => void> = vi.fn();
      createDebouncer(first, 10).schedule();
      createDebouncer(second, 10).schedule();
      vi.advanceTimersByTime(10);
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });
  });

  describe('arguments', () => {
    it.each([0, -0])('runs the callback after a timer with a wait of %d', (wait) => {
      const callback: Mock<() => void> = vi.fn();
      createDebouncer(callback, wait).schedule();
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(0);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('accepts the longest wait that setTimeout keeps, 2147483647 milliseconds', () => {
      const callback: Mock<() => void> = vi.fn();
      createDebouncer(callback, 2_147_483_647).schedule();
      vi.advanceTimersByTime(2_147_483_646);
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it.each<unknown>([1.5, -0.5, -1, 2 ** 31, Number.NaN, Number.POSITIVE_INFINITY, '500', null])(
      'throws a RangeError when it is created with the wait %s',
      (wait) => {
        const thrown: unknown = catchThrown(() => createDebouncer(vi.fn(), wait as number));
        expect(thrown).toBeInstanceOf(RangeError);
        expect((thrown as RangeError).message).toMatch(/^\[foundry-utils\]: /);
      },
    );

    it.each<unknown>([null, undefined, 'save', {}])('throws a TypeError when it is created with the callback %j', (callback) => {
      expect(catchThrown(() => createDebouncer(callback as () => void, 10))).toBeInstanceOf(TypeError);
    });
  });
});
