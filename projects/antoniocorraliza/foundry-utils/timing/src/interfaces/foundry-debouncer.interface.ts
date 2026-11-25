/** Delayed call of a callback. Its methods are closures without `this`, so they can be passed on their own. */
export interface FoundryDebouncer<Arguments extends ReadonlyArray<unknown>> {
  /** Restarts the wait; when it ends, runs the callback with the last arguments. */
  schedule(...args: Arguments): void;
  /** Discards the pending call. A new one can be scheduled afterwards. */
  cancel(): void;
  /** Runs the pending call now, if there is one, after it stops being pending. An error of the callback comes out here. */
  flush(): void;
  /** Discards the pending call and turns every later `schedule` into nothing. Calling it again does nothing. */
  dispose(): void;
  /** Tells whether a call is waiting for its time. */
  isPending(): boolean;
}
